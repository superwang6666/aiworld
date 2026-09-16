import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { Law, RuleTag, WorldRule } from "@/types";

import { LAWS } from "@/config/law-names";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/types/i18n";


import {
  checkRuleSemanticDuplication,
  SEMANTIC_DEDUPLICATION_CONFIG,
} from "@/lib/rules/semantic-matcher";
import { generateTagsForRule } from "@/lib/tags/tag-generator";
import { getTagSteeringHints } from "@/lib/tags/tag-manager";
import { createLanguageAwareSystemPrompt } from "@/lib/utils/llm-language";
import { getOpenAIClient } from "@/lib/utils/openai-client";
import { loadGenerateSinglePrompts } from "@/lib/utils/prompt-loader";
import { enforceRateLimit, RATE_LIMIT_PRESETS } from "@/lib/utils/rate-limit";
import { getServerTranslation } from "@/lib/utils/server-translations";

import type { Locale} from "@/types/i18n";

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, "generate-single", RATE_LIMIT_PRESETS.llmLight);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const {
      corePremise,
      artStyle,
      law,
      existingRules = [],
      tagWeights,
      locale: requestLocale,
    } = await request.json();

    if (!corePremise || !artStyle || !law) {
      return NextResponse.json(
        { error: "Core Premise, Art Style, and Law are required" },
        { status: 400 },
      );
    }

    // 验证并获取语言设置
    const locale: Locale =
      requestLocale && SUPPORTED_LOCALES.includes(requestLocale)
        ? requestLocale
        : DEFAULT_LOCALE;

    // Validate law
    const validLaw = LAWS.find((l) => l.name === law);
    if (!validLaw) {
      return NextResponse.json(
        { error: `Invalid law: ${law}` },
        { status: 400 },
      );
    }

    const { openai, model } = getOpenAIClient();

    // 把本次会话已经建立起来的标签偏好喂回生成 prompt(道理同 /api/generate)
    const tagPreferences: { avoid: string[]; favor: string[] } | undefined =
      tagWeights && typeof tagWeights === "object"
        ? getTagSteeringHints(tagWeights as Record<string, RuleTag>)
        : undefined;

    // 从 i18n 加载提示词
    const prompts = loadGenerateSinglePrompts(
      locale,
      validLaw.name,
      validLaw.description,
      tagPreferences
    );

    // 添加语言指令
    const systemPrompt = createLanguageAwareSystemPrompt(prompts.system, locale);
    const userPrompt = prompts.userTemplate(corePremise, artStyle);

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.9,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from AI service");
    }

    let ruleData;
    try {
      let cleanedContent = responseContent.trim();

      const jsonMatch = cleanedContent.match(
        /```(?:json)?\s*(\{[\s\S]*\})\s*```/,
      );
      if (jsonMatch) {
        cleanedContent = jsonMatch[1].trim();
      }

      cleanedContent = cleanedContent.replace(/[""]/g, '"');
      cleanedContent = cleanedContent.replace(/['']/g, "'");

      cleanedContent = cleanedContent.replace(
        /:\s*'([^']*)'/g,
        (_match, content) => {
          return `: "${content.replace(/"/g, '\\"')}"`;
        },
      );

      cleanedContent = cleanedContent.replace(
        /'([^']+)':/g,
        (_match, content) => {
          return `"${content}":`;
        },
      );

      cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, "$1");

      const parsed = JSON.parse(cleanedContent);
      ruleData = parsed.rule || parsed;

      if (!ruleData || typeof ruleData !== "object") {
        throw new Error("Invalid response format: rule object not found");
      }
    } catch (parseError) {
      const errorMessage =
        parseError instanceof Error
          ? parseError.message
          : "Unknown parse error";
      throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
    }

    // 重试循环: 最多重试 MAX_RETRIES 次
    let retryCount = 0;
    let finalRule = null;

    while (retryCount <= SEMANTIC_DEDUPLICATION_CONFIG.MAX_RETRIES) {
      // Format the rule
      const formattedRule: WorldRule = {
        id: `rule-${Date.now()}-${retryCount}`,
        law: validLaw.name as Law,
        rule:
          ruleData.rule ||
          ruleData.Rule ||
          ruleData.description ||
          "No description provided",
        expert_logic:
          ruleData.expert_logic ||
          ruleData.expertLogic ||
          ruleData.expert_reasoning ||
          "No expert logic provided",
        confirmed: false,
        isNew: true,
        tags: [],
        discipline_codes: [],
        rejected: false,
        created_at: new Date().toISOString(),
      };

      try {
        const tagResult = await generateTagsForRule(formattedRule);
        formattedRule.tags = tagResult.recommendedTagIds;
      } catch (_tagError) {
        return NextResponse.json({ rule: formattedRule });
      }

      // 语义去重检测
      if (existingRules.length > 0) {
        const duplicationCheck = await checkRuleSemanticDuplication(
          formattedRule,
          existingRules,
        );

        if (duplicationCheck.isDuplicate) {
          retryCount++;

          if (retryCount <= SEMANTIC_DEDUPLICATION_CONFIG.MAX_RETRIES) {
            const retryCompletion = await openai.chat.completions.create({
              model: model,
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                {
                  role: "user",
                  content: userPrompt,
                },
              ],
              temperature: 0.9 + retryCount * 0.05,
              response_format: { type: "json_object" },
            });

            const retryResponseContent =
              retryCompletion.choices[0]?.message?.content;
            if (!retryResponseContent) {
              throw new Error("No response from AI service during retry");
            }

            let cleanedContent = retryResponseContent.trim();
            const jsonMatch = cleanedContent.match(
              /```(?:json)?\s*(\{[\s\S]*\})\s*```/,
            );
            if (jsonMatch) {
              cleanedContent = jsonMatch[1].trim();
            }
            cleanedContent = cleanedContent.replace(/[""]/g, '"');
            cleanedContent = cleanedContent.replace(/['']/g, "'");
            cleanedContent = cleanedContent.replace(
              /:\s*'([^']*)'/g,
              (_match, content) => {
                return `: "${content.replace(/"/g, '\\"')}"`;
              },
            );
            cleanedContent = cleanedContent.replace(
              /'([^']+)':/g,
              (_match, content) => {
                return `"${content}":`;
              },
            );
            cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, "$1");

            const retryParsed = JSON.parse(cleanedContent);
            ruleData = retryParsed.rule || retryParsed;

            continue;
          } else {
            return NextResponse.json(
              {
                error: getServerTranslation('Validation', 'cannotGenerateUniqueRule', locale),
                retries: retryCount,
                similarity: duplicationCheck.similarity,
                reasoning: duplicationCheck.reasoning,
              },
              { status: 409 },
            );
          }
        } else {
          finalRule = formattedRule;
          break;
        }
      } else {
        finalRule = formattedRule;
        break;
      }
    }

    if (!finalRule) {
      throw new Error(getServerTranslation('Validation', 'failedToGenerateValidRule', locale));
    }

    return NextResponse.json({
      rule: finalRule,
      retries: retryCount,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate rule";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
