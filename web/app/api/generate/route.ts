import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { Law, ExpertResponse, RuleTag, RawGeneratedRule } from "@/types";

import { LAWS } from "@/config/law-names";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/types/i18n";


import { validateRuleDistribution } from "@/lib/laws/weight-calculator";
import { getTagSteeringHints } from "@/lib/tags/tag-manager";
import { createLanguageAwareSystemPrompt } from "@/lib/utils/llm-language";
import {
  getOpenAIClient,
  cleanAIJsonResponse,
} from "@/lib/utils/openai-client";
import { loadGeneratePrompts } from "@/lib/utils/prompt-loader";
import { enforceRateLimit, RATE_LIMIT_PRESETS } from "@/lib/utils/rate-limit";

import type { Locale} from "@/types/i18n";

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, "generate", RATE_LIMIT_PRESETS.llmHeavy);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { corePremise, artStyle, lawWeights, mode, expertResponses, tagWeights, locale: requestLocale } =
      await request.json();

    if (!corePremise || !artStyle) {
      return NextResponse.json(
        { error: "Core Premise and Art Style are required" },
        { status: 400 },
      );
    }

    // 验证并获取语言设置
    const locale: Locale =
      requestLocale && SUPPORTED_LOCALES.includes(requestLocale)
        ? requestLocale
        : DEFAULT_LOCALE;

    // Get configured OpenAI client
    const { openai, model } = getOpenAIClient();

    // 从 i18n 加载提示词
    // 如果有权重信息，使用加权提示词；深度模式会传递 expertResponses
    let weightDistribution: string | undefined;
    let expertInsights: string | undefined;

    if (lawWeights && Array.isArray(lawWeights) && lawWeights.length > 0) {
      weightDistribution = lawWeights
        .map(
          (lw) =>
            `- ${lw.law}: 权重${(lw.weight * 100).toFixed(1)}%，生成${lw.rulesCount}条规则 (${lw.impactLevel})`,
        )
        .join("\n");

      // 如果有专家洞察，提取关键建议
      if (mode === "deep" && expertResponses && expertResponses.length > 0) {
        expertInsights = expertResponses
          .map((er: ExpertResponse) => {
            const suggestions = er.suggestions?.slice(0, 2).join("; ") || "";
            const analysis = er.analysis.substring(0, 150);
            return `[${er.expert_name} - ${er.domain}]: ${analysis}...${suggestions ? "\n  建议: " + suggestions : ""}`;
          })
          .join("\n\n");
      }
    }

    // 把本次会话已经建立起来的标签偏好(用户确认/删除过的规则)喂回生成 prompt，
    // 否则这些偏好只会停留在"预测删除率"的展示上，永远不会影响下一批规则实际生成的方向
    const tagPreferences: { avoid: string[]; favor: string[] } | undefined =
      tagWeights && typeof tagWeights === "object"
        ? getTagSteeringHints(tagWeights as Record<string, RuleTag>)
        : undefined;

    const prompts = loadGeneratePrompts(
      locale,
      !!weightDistribution,
      weightDistribution,
      expertInsights,
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

    // Parse the JSON response with robust error handling
    let rulesData;
    try {
      // Clean the response content first
      let cleanedContent = cleanAIJsonResponse(responseContent);
      cleanedContent = cleanedContent.replace(/[""]/g, '"');

      // Remove trailing commas before } or ]
      cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, "$1");

      // First try: parse as-is
      const parsed = JSON.parse(cleanedContent);

      // Extract rules array from the response object
      rulesData = parsed.rules || parsed.rule_list || parsed.ruleList || [];

      // If it's already an array, use it directly (fallback)
      if (Array.isArray(parsed)) {
        rulesData = parsed;
      }

      if (!Array.isArray(rulesData) || rulesData.length === 0) {
        throw new Error("Invalid response format: rules array not found");
      }
    } catch (parseError) {
      const errorMessage =
        parseError instanceof Error ? parseError.message : "Unknown error";
      throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
    }

    // Validate and format the rules
    const formattedRules = (rulesData as RawGeneratedRule[]).map((rule, index: number) => {
      // Ensure law is one of the valid laws
      const lawName = rule.law || rule.Law || "";
      const validLaw =
        LAWS.find((l) => l.name.toLowerCase() === lawName.toLowerCase())
          ?.name || LAWS[index % LAWS.length].name;

      return {
        id: `rule-${Date.now()}-${index}`,
        law: validLaw,
        rule:
          rule.rule ||
          rule.Rule ||
          rule.description ||
          "No description provided",
        expert_logic:
          rule.expert_logic ||
          rule.expertLogic ||
          rule.expert_reasoning ||
          "No expert logic provided",
        confirmed: false,
      };
    });

    // 如果提供了权重信息，验证规则分配
    if (lawWeights && Array.isArray(lawWeights) && lawWeights.length > 0) {
      const actualCounts = new Map<Law, number>();

      // 统计每个法则的实际规则数量
      for (const rule of formattedRules) {
        const currentCount = actualCounts.get(rule.law as Law) || 0;
        actualCounts.set(rule.law as Law, currentCount + 1);
      }

      // 验证分配
      const validation = validateRuleDistribution(actualCounts, lawWeights);

      if (!validation.valid) {
        // Rule distribution doesn't match expected weights (tolerate small LLM errors)
      }
    }

    return NextResponse.json({ rules: formattedRules });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate rules";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
