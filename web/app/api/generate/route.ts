import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import OpenAI from 'openai';

import type { LawWeight, Law, ExpertResponse } from '@/types';

import { LAWS } from '@/config/law-names';

import { validateRuleDistribution } from '@/lib/laws/weight-calculator';

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
  expertResponses?: ExpertResponse[]
): string {
  const weightDistribution = lawWeights
    .map(lw => `- ${lw.law}: 权重${(lw.weight * 100).toFixed(1)}%，生成${lw.rulesCount}条规则 (${lw.impactLevel})`)
    .join('\n');

  // 如果有专家洞察，提取关键建议
  let expertInsightsSection = '';
  if (expertResponses && expertResponses.length > 0) {
    const insights = expertResponses
      .map(er => {
        const suggestions = er.suggestions?.slice(0, 2).join('; ') || '';
        const analysis = er.analysis.substring(0, 150);
        return `[${er.expert_name} - ${er.domain}]: ${analysis}...${suggestions ? '\n  建议: ' + suggestions : ''}`;
      })
      .join('\n\n');

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
    const { corePremise, artStyle, lawWeights, mode, expertResponses } = await request.json();

    if (!corePremise || !artStyle) {
      return NextResponse.json(
        { error: 'Core Premise and Art Style are required' },
        { status: 400 }
      );
    }

    // Read environment variables at request time
    const deepSeekKey = process.env.DEEPSEEK_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const apiKey = deepSeekKey || openAiKey;

    if (!apiKey) {
      console.error('Environment variables check:', {
        DEEPSEEK_API_KEY: deepSeekKey ? 'Set (hidden)' : 'Not set',
        OPENAI_API_KEY: openAiKey ? 'Set (hidden)' : 'Not set',
      });
      return NextResponse.json(
        { error: 'API Key not configured. Please set DEEPSEEK_API_KEY or OPENAI_API_KEY in .env file' },
        { status: 500 }
      );
    }

    // Configure OpenAI client with DeepSeek or OpenAI
    const baseURL = deepSeekKey ? 'https://api.deepseek.com' : undefined;
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    // 选择提示词：如果有权重信息，使用加权提示词
    // 深度模式会传递 expertResponses
    const systemPrompt = lawWeights && Array.isArray(lawWeights) && lawWeights.length > 0
      ? generateWeightedPrompt(lawWeights, mode === 'deep' ? expertResponses : undefined)
      : BASE_EXPERT_COUNCIL_PROMPT;

    // 在深度模式下，记录使用的专家数量
    if (mode === 'deep' && expertResponses && expertResponses.length > 0) {
      console.log(`🧠 深度模式: 整合 ${expertResponses.length} 个专家的洞察`);
    }

    const userPrompt = `Core Premise: ${corePremise}\nArt Style: ${artStyle}`;

    // Use DeepSeek model if DEEPSEEK_API_KEY is set, otherwise use OpenAI model
    const model = deepSeekKey ? 'deepseek-chat' : 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.9,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from AI service');
    }

    // Parse the JSON response with robust error handling
    let rulesData;
    try {
      // Clean the response content first
      let cleanedContent = responseContent.trim();

      // Remove markdown code blocks if present
      const jsonMatch = cleanedContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[1].trim();
      }

      // Fix common AI JSON issues
      // 1. Replace smart quotes with regular quotes (but preserve single quotes inside strings)
      cleanedContent = cleanedContent.replace(/[""]/g, '"');

      // 2. Remove trailing commas before } or ]
      cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1');

      // First try: parse as-is
      let parsed;
      try {
        parsed = JSON.parse(cleanedContent);
      } catch (firstError: any) {
        // Log the specific error location for debugging
        console.error('JSON parse error at:', firstError.message);
        const errorPos = (firstError as any).position || 0;
        console.error('Problem area:', cleanedContent.substring(Math.max(0, errorPos - 100), Math.min(cleanedContent.length, errorPos + 100)));
        console.error('Full response:', cleanedContent);
        throw firstError;
      }

      // Extract rules array from the response object
      rulesData = parsed.rules || parsed.rule_list || parsed.ruleList || [];

      // If it's already an array, use it directly (fallback)
      if (Array.isArray(parsed)) {
        rulesData = parsed;
      }

      if (!Array.isArray(rulesData) || rulesData.length === 0) {
        throw new Error('Invalid response format: rules array not found');
      }
    } catch (parseError: any) {
      console.error('Raw AI response:', responseContent);
      console.error('Parse error:', parseError.message);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    // Validate and format the rules
    const formattedRules = rulesData.map((rule: any, index: number) => {
      // Ensure law is one of the valid laws
      const lawName = rule.law || rule.Law || '';
      const validLaw = LAWS.find(
        (l) => l.name.toLowerCase() === lawName.toLowerCase()
      )?.name || LAWS[index % LAWS.length].name;

      return {
        id: `rule-${Date.now()}-${index}`,
        law: validLaw,
        rule: rule.rule || rule.Rule || rule.description || 'No description provided',
        expert_logic: rule.expert_logic || rule.expertLogic || rule.expert_reasoning || 'No expert logic provided',
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
        console.warn('规则分配不符合权重预期:');
        validation.errors.forEach(err => console.warn(`  - ${err}`));

        // 记录但不阻止返回（容忍 LLM 的小误差）
        console.log('实际分配:', Object.fromEntries(actualCounts));
        console.log('期望分配:', lawWeights.map(lw => `${lw.law}: ${lw.rulesCount}`).join(', '));
      } else {
        console.log('✓ 规则分配符合权重要求');
      }
    }

    return NextResponse.json({ rules: formattedRules });
  } catch (error: any) {
    console.error('Error generating rules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate rules' },
      { status: 500 }
    );
  }
}
