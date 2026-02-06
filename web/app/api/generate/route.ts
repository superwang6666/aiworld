import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { LawWeight, Law, ExpertResponse } from "@/types";

import { LAWS } from "@/config/law-names";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/types/i18n";


import { validateRuleDistribution } from "@/lib/laws/weight-calculator";
import { createLanguageAwareSystemPrompt } from "@/lib/utils/llm-language";
import {
  getOpenAIClient,
  cleanAIJsonResponse,
} from "@/lib/utils/openai-client";

import type { Locale} from "@/types/i18n";

// 基础提示词（不包含权重信息时使用）
const BASE_EXPERT_COUNCIL_PROMPT = `You are the 'Expert Council of World Builders'.
Analyze the provided [Core Premise] and [Art Style].
Apply the following 7 Laws:
1. Space (Geography/Physics)
2. Survival (Biology/Needs)
3. Cognition (Language/Belief)
4. Scarcity (Economy/Conflict)
5. Time (History/Erosion)
6. Power (Politics/Order)
7. Metaphysics (The Anomaly)

Generate 20 practical, specific rules that govern this world.
Examples: "Police sirens require citizens to stop and pray", "Water is only traded at night".

CRITICAL JSON FORMAT RULES:
1. Use ONLY double quotes (") for all strings - NEVER use single quotes (')
2. All property names must use double quotes
3. All string values must use double quotes

Format each rule as a JSON object with these exact fields:
{ "law": "Law Name", "rule": "Description", "expert_logic": "Why this exists" }

Return a JSON object with a "rules" key containing an array of exactly 20 rule objects.
Format: { "rules": [ {...}, {...}, ... ] }

Do not include any other text or markdown formatting.`;

// 生成带权重的提示词（支持专家洞察）
function generateWeightedPrompt(
  lawWeights: LawWeight[],
  expertResponses?: ExpertResponse[],
): string {
  const weightDistribution = lawWeights
    .map(
      (lw) =>
        `- ${lw.law}: 权重${(lw.weight * 100).toFixed(1)}%，生成${lw.rulesCount}条规则 (${lw.impactLevel})`,
    )
    .join("\n");

  // 如果有专家洞察，提取关键建议
  let expertInsightsSection = "";
  if (expertResponses && expertResponses.length > 0) {
    const insights = expertResponses
      .map((er) => {
        const suggestions = er.suggestions?.slice(0, 2).join("; ") || "";
        const analysis = er.analysis.substring(0, 150);
        return `[${er.expert_name} - ${er.domain}]: ${analysis}...${suggestions ? "\n  建议: " + suggestions : ""}`;
      })
      .join("\n\n");

    expertInsightsSection = `\n\nEXPERT INSIGHTS REFERENCE (Deep Mode):
The following expert analyses have been conducted on this premise. Use these insights to inform your rule generation, ensuring logical consistency with expert predictions:

${insights}

Please ensure the rules you generate align with these expert perspectives while maintaining creativity.`;
  }

  return `You are the 'Expert Council of World Builders'.
Analyze the provided [Core Premise] and [Art Style].
Apply the following 7 Laws:
1. Space (Geography/Physics)
2. Survival (Biology/Needs)
3. Cognition (Language/Belief)
4. Scarcity (Economy/Conflict)
5. Time (History/Erosion)
6. Power (Politics/Order)
7. Metaphysics (The Anomaly)

IMPORTANT: The following law weights have been calculated based on the core premise's impact:

${weightDistribution}

Generate exactly 20 practical, specific rules that govern this world.
**CRITICAL**: You MUST distribute the rules according to the specified counts above.
- Higher weight laws are more fundamentally affected by the core premise
- Rules for higher weight laws should be more specific, detailed, and central to the world
- Rules for lower weight laws can be more general adaptations${expertInsightsSection}

Examples: "Police sirens require citizens to stop and pray", "Water is only traded at night".

CRITICAL JSON FORMAT RULES:
1. Use ONLY double quotes (") for all strings - NEVER use single quotes (')
2. All property names must use double quotes
3. All string values must use double quotes
4. STRICTLY follow the rule count distribution specified above

Format each rule as a JSON object with these exact fields:
{ "law": "Law Name", "rule": "Description", "expert_logic": "Why this exists" }

Return a JSON object with a "rules" key containing an array of exactly 20 rule objects.
Format: { "rules": [ {...}, {...}, ... ] }

Do not include any other text or markdown formatting.`;
}

export async function POST(request: NextRequest) {
  try {
    const { corePremise, artStyle, lawWeights, mode, expertResponses, locale: requestLocale } =
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

    // 选择提示词：如果有权重信息，使用加权提示词
    // 深度模式会传递 expertResponses
    const baseSystemPrompt =
      lawWeights && Array.isArray(lawWeights) && lawWeights.length > 0
        ? generateWeightedPrompt(
            lawWeights,
            mode === "deep" ? expertResponses : undefined,
          )
        : BASE_EXPERT_COUNCIL_PROMPT;

    // 添加语言指令
    const systemPrompt = createLanguageAwareSystemPrompt(baseSystemPrompt, locale);

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
    const formattedRules = rulesData.map((rule: any, index: number) => {
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
