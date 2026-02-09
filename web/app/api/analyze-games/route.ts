import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/types/i18n";

import { createLanguageAwareSystemPrompt } from "@/lib/utils/llm-language";
import { getOpenAIClient } from "@/lib/utils/openai-client";
import { loadAnalyzeGamesPrompts } from "@/lib/utils/prompt-loader";

import type { Locale} from "@/types/i18n";

export async function POST(request: NextRequest) {
  try {
    const { games, locale: requestLocale } = await request.json();

    if (!games || !Array.isArray(games) || games.length === 0) {
      return NextResponse.json(
        { error: "Games array required" },
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
    const gamesDescription = games
      .map(
        (game: {
          name: string;
          released: string;
          metacritic: number | null;
          rating: number;
          genres: string[];
          platforms: string[];
          description: string;
        }) =>
          `**${game.name}** (${game.released})\n` +
          `- 评分: Metacritic ${game.metacritic || "N/A"}, RAWG ${game.rating}/5\n` +
          `- 类型: ${game.genres.join(", ")}\n` +
          `- 平台: ${game.platforms.slice(0, 3).join(", ")}\n` +
          `- 描述: ${game.description.substring(0, 300)}...`,
      )
      .join("\n\n");

    const prompts = loadAnalyzeGamesPrompts(locale);
    const userPrompt = prompts.userTemplate(gamesDescription);

    // 添加语言指令
    const systemPrompt = createLanguageAwareSystemPrompt(prompts.system, locale);

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from AI service");
    }

    let analysisResult;
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

      analysisResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      const errorMessage =
        parseError instanceof Error
          ? parseError.message
          : "Unknown parse error";
      throw new Error(`Failed to parse AI response as JSON: ${errorMessage}`);
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze games";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
