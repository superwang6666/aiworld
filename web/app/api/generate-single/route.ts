import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { Law, WorldRule } from "@/types";

import { LAWS } from "@/config/law-names";

import {
  checkRuleSemanticDuplication,
  SEMANTIC_DEDUPLICATION_CONFIG,
} from "@/lib/rules/semantic-matcher";
import { generateTagsForRule } from "@/lib/tags/tag-generator";
import { getOpenAIClient } from "@/lib/utils/openai-client";

export async function POST(request: NextRequest) {
  try {
    const {
      corePremise,
      artStyle,
      law,
      existingRules = [],
    } = await request.json();

    if (!corePremise || !artStyle || !law) {
      return NextResponse.json(
        { error: "Core Premise, Art Style, and Law are required" },
        { status: 400 },
      );
    }

    // Validate law
    const validLaw = LAWS.find((l) => l.name === law);
    if (!validLaw) {
      return NextResponse.json(
        { error: `Invalid law: ${law}` },
        { status: 400 },
      );
    }

    const { openai, model } = getOpenAIClient();

    const systemPrompt = `You are an expert world-builder specializing in the "${validLaw.name}" law (${validLaw.description}).

Generate ONE specific, practical rule for a world based on the provided Core Premise and Art Style.
The rule must be related to the "${validLaw.name}" law domain.

Examples: "Police sirens require citizens to stop and pray", "Water is only traded at night".

CRITICAL JSON FORMAT RULES:
1. Use ONLY double quotes (") for all strings - NEVER use single quotes (')
2. All property names must use double quotes
3. All string values must use double quotes

Format the rule as a JSON object with these exact fields:
{ "law": "${validLaw.name}", "rule": "Description", "expert_logic": "Why this exists" }

Return a JSON object with a "rule" key containing the rule object.
Format: { "rule": {...} }

Do not include any other text or markdown formatting.`;

    const userPrompt = `Core Premise: ${corePremise}\nArt Style: ${artStyle}`;

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
                error: "无法生成不重复的规则,请稍后重试",
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
      throw new Error("未能生成有效规则");
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
