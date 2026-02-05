import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { calculateLawWeights } from "@/lib/laws/weight-calculator";
import {
  getOpenAIClient,
  cleanAIJsonResponse,
} from "@/lib/utils/openai-client";

// 辅助函数:获取基础 URL
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";
}

const VALIDATION_PROMPT = `You are an expert World-Building Validator specializing in the "Core Anomaly Verification" methodology.

Your task is to analyze a proposed Core Premise and determine if it meets the criteria for a truly unique and "structural" (non-decorative) world-building foundation.

## Validation Framework (Based on 核心设定检验原则)

### 1. Core Anomaly Identification (核心异质点)
- Identify which of the 7 Laws is being fundamentally disrupted
- Determine if this is a superficial change or a deep structural transformation
- The 7 Laws are: Space, Survival, Cognition, Scarcity, Time, Power, Metaphysics

### 2. Domino Effect Test (逻辑压力测试)
- Analyze how this core premise forces changes across ALL other laws
- A true core premise should create a cascading effect across the entire world structure
- For each law, predict ONE concrete change this premise would necessitate

### 3. The Eraser Test (橡皮擦实验)
- Create a test scenario (e.g., a wedding, a murder, a trade negotiation)
- Show what happens if we "erase" the core premise and replace it with a mundane setting
- Verdict:
  * STRUCTURAL: The scenario becomes impossible/nonsensical without the premise
  * DECORATIVE: The scenario still works fine in a normal setting

### 4. Uniqueness Scoring (0-100)
- 0-30: Generic/derivative (easily found in existing works)
- 31-60: Interesting but not revolutionary (minor twist on known concepts)
- 61-85: Highly unique (rarely seen, strong potential)
- 86-100: Revolutionary (completely unprecedented, paradigm-shifting)

## Response Format (STRICT JSON only)

CRITICAL: You MUST return valid JSON with double quotes (") only. NO single quotes (').
All string values must use double quotes. Use proper JSON escaping for any quotes within strings.

Return a JSON object with this exact structure:
{
  "isUnique": true,
  "uniquenessScore": 75,
  "coreAnomalyIdentified": "Which law is being disrupted and how",
  "lawImpacts": [
    {
      "law": "Space",
      "impact": "Brief description of how this law is affected",
      "example": "One concrete example of this impact"
    }
  ],
  "eraserTest": {
    "originalScenario": "A scenario in this world (2-3 sentences)",
    "replacementScenario": "The same scenario in a normal/mundane world (2-3 sentences)",
    "analysis": "Explanation of what breaks or changes",
    "verdict": "structural"
  },
  "warnings": [
    "Array of potential issues or weaknesses in the premise"
  ],
  "recommendations": [
    "Array of suggestions to strengthen the core premise"
  ]
}

IMPORTANT RULES:
1. Use ONLY double quotes (") for all strings - NEVER use single quotes (')
2. Include all 7 laws in lawImpacts array (Space, Survival, Cognition, Scarcity, Time, Power, Metaphysics)
3. verdict must be exactly "structural" or "decorative" (lowercase, double quotes)
4. Be brutally honest. A weak premise should score low. Don't inflate scores out of politeness.`;

export async function POST(request: NextRequest) {
  try {
    const { corePremise } = await request.json();

    if (!corePremise || corePremise.trim().length === 0) {
      return NextResponse.json(
        { error: "Core Premise is required" },
        { status: 400 },
      );
    }

    // Get configured OpenAI client
    const { openai, model } = getOpenAIClient();

    const userPrompt = `Core Premise to validate:\n\n${corePremise}`;

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: VALIDATION_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from AI service");
    }

    // Parse the JSON response with robust error handling
    let validationResult;
    try {
      // Clean the response content first
      const cleanedContent = cleanAIJsonResponse(responseContent);

      validationResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      const errorMessage =
        parseError instanceof Error ? parseError.message : "Unknown error";
      throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
    }

    // Validate the response structure
    if (
      !validationResult.lawImpacts ||
      !Array.isArray(validationResult.lawImpacts)
    ) {
      throw new Error("Invalid response format: lawImpacts array missing");
    }

    if (
      !validationResult.eraserTest ||
      typeof validationResult.eraserTest !== "object"
    ) {
      throw new Error("Invalid response format: eraserTest object missing");
    }

    // 计算法则权重
    const lawWeights = calculateLawWeights(validationResult);

    // 触发 DEAC 分析(非阻塞后台服务)
    // 不等待 - 让它在后台运行
    fetch(`${getBaseUrl()}/api/deac/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heterogeneity_point: corePremise,
        gap_analysis: null, // 将由 dispatch 端点内部计算
        context: {
          core_premise: corePremise,
          validation_result: validationResult,
          current_step: "validation",
          user_preferences: {
            enable_special_generation: true,
            max_experts: 5,
          },
        },
        generate_special_experts: true,
      }),
    })
      .then(() => {})
      .catch((_err) => {});

    return NextResponse.json({
      ...validationResult,
      lawWeights, // 添加法则权重到返回结果
    });
  } catch (_error: any) {
    // Error handled silently
    return NextResponse.json(
      { error: "Failed to validate premise" },
      { status: 500 },
    );
  }
}
