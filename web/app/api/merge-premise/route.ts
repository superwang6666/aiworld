import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/types/i18n";

import { createLanguageAwareSystemPrompt } from "@/lib/utils/llm-language";
import { getOpenAIClient } from "@/lib/utils/openai-client";
import { loadMergePremisePrompts } from "@/lib/utils/prompt-loader";
import { enforceRateLimit, RATE_LIMIT_PRESETS } from "@/lib/utils/rate-limit";

import type { Locale } from "@/types/i18n";

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, "merge-premise", RATE_LIMIT_PRESETS.llmLight);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const {
      userWorldDescription = "",
      aiPremiseSummary = "",
      existingDraft = "",
      locale: requestLocale,
    } = await request.json();

    if (
      typeof userWorldDescription !== "string" ||
      typeof aiPremiseSummary !== "string"
    ) {
      return NextResponse.json(
        { error: "userWorldDescription and aiPremiseSummary must be strings" },
        { status: 400 },
      );
    }

    if (!userWorldDescription.trim() && !aiPremiseSummary.trim()) {
      return NextResponse.json(
        { error: "At least one description is required" },
        { status: 400 },
      );
    }

    const locale: Locale =
      requestLocale && SUPPORTED_LOCALES.includes(requestLocale)
        ? requestLocale
        : DEFAULT_LOCALE;

    const { openai, model } = getOpenAIClient();

    const prompts = loadMergePremisePrompts(locale);
    const systemPrompt = createLanguageAwareSystemPrompt(
      prompts.system,
      locale,
    );
    const userPrompt = prompts.userTemplate(
      userWorldDescription,
      aiPremiseSummary,
      existingDraft ?? "",
    );

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from AI service");
    }

    let mergeResult;
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

      mergeResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      const errorMessage =
        parseError instanceof Error
          ? parseError.message
          : "Unknown parse error";
      throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
    }

    return NextResponse.json(mergeResult);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to merge premise";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
