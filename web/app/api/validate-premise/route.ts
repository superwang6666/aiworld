import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/types/i18n";

import { calculateLawWeights } from "@/lib/laws/weight-calculator";
import { createLanguageAwareSystemPrompt } from "@/lib/utils/llm-language";
import {
  getOpenAIClient,
  cleanAIJsonResponse,
} from "@/lib/utils/openai-client";
import { loadValidatePremisePrompts } from "@/lib/utils/prompt-loader";

import type { Locale} from "@/types/i18n";

// 辅助函数:获取基础 URL
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";
}

export async function POST(request: NextRequest) {
  try {
    const { corePremise, locale: requestLocale } = await request.json();

    if (!corePremise || corePremise.trim().length === 0) {
      return NextResponse.json(
        { error: "Core Premise is required" },
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
    const prompts = loadValidatePremisePrompts(locale);
    const userPrompt = prompts.userTemplate(corePremise);

    // 创建带语言指令的系统提示词
    const systemPrompt = createLanguageAwareSystemPrompt(prompts.system, locale);

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
