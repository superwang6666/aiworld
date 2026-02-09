import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/types/i18n";


import { createLanguageAwareSystemPrompt } from "@/lib/utils/llm-language";
import { getOpenAIClient } from "@/lib/utils/openai-client";
import { loadEvaluateDirectionsPrompts } from "@/lib/utils/prompt-loader";

import type { Locale} from "@/types/i18n";

export async function POST(request: NextRequest) {
  try {
    const { lawImpacts, locale: requestLocale } = await request.json();

    if (!lawImpacts || !Array.isArray(lawImpacts)) {
      return NextResponse.json(
        { error: "lawImpacts array is required" },
        { status: 400 },
      );
    }

    // 验证并获取语言设置
    const locale: Locale =
      requestLocale && SUPPORTED_LOCALES.includes(requestLocale)
        ? requestLocale
        : DEFAULT_LOCALE;

    const { openai, model } = getOpenAIClient();

    // 从 i18n 加载提示词
    const prompts = loadEvaluateDirectionsPrompts(locale);
    const lawImpactsJson = JSON.stringify(lawImpacts, null, 2);
    const userPrompt = prompts.userTemplate(lawImpactsJson);

    // 添加语言指令
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

    let evaluationResult;
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
      cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, "$1");

      evaluationResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      const errorMessage =
        parseError instanceof Error
          ? parseError.message
          : "Unknown parse error";
      throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
    }

    // Validate the response structure
    if (
      !evaluationResult.evaluatedImpacts ||
      !Array.isArray(evaluationResult.evaluatedImpacts)
    ) {
      throw new Error(
        "Invalid response format: evaluatedImpacts array missing",
      );
    }

    return NextResponse.json(evaluationResult);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to evaluate directions";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
