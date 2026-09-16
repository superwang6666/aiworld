import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { RawgGameResult } from "@/types";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/types/i18n";

import { createChatCompletion } from "@/lib/utils/llm-client";
import { createLanguageAwareSystemPrompt } from "@/lib/utils/llm-language";
import { loadRecommendGamesPrompts } from "@/lib/utils/prompt-loader";
import { enforceRateLimit, RATE_LIMIT_PRESETS } from "@/lib/utils/rate-limit";

import type { Locale} from "@/types/i18n";

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, "recommend-games", RATE_LIMIT_PRESETS.llmLight);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { anomalyDescription, locale: requestLocale } = await request.json();

    if (!anomalyDescription?.trim()) {
      return NextResponse.json(
        { error: "Anomaly description required" },
        { status: 400 },
      );
    }

    // 验证并获取语言设置
    const locale: Locale =
      requestLocale && SUPPORTED_LOCALES.includes(requestLocale)
        ? requestLocale
        : DEFAULT_LOCALE;

    // 从 i18n 加载提示词
    const prompts = loadRecommendGamesPrompts(locale);
    const userPrompt = prompts.userTemplate(anomalyDescription.trim());

    // 添加语言指令
    const systemPrompt = createLanguageAwareSystemPrompt(prompts.system, locale);

    const responseContent = await createChatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      jsonMode: true,
    });

    let recommendation;
    try {
      let cleanedContent = responseContent.trim();
      const jsonMatch = cleanedContent.match(
        /```(?:json)?\s*(\{[\s\S]*\})\s*```/,
      );
      if (jsonMatch) {
        cleanedContent = jsonMatch[1].trim();
      }
      cleanedContent = cleanedContent.replace(/[""]/g, '"');
      cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, "$1");

      recommendation = JSON.parse(cleanedContent);
    } catch (parseError) {
      const errorMessage =
        parseError instanceof Error
          ? parseError.message
          : "Unknown parse error";
      throw new Error(`Failed to parse AI response: ${errorMessage}`);
    }
    const apiKey_rawg = process.env.RAWG_API_KEY || "";

    const gamePromises = recommendation.recommendedGames.map(
      async (game: { name: string; reason: string }) => {
        try {
          const params = new URLSearchParams({
            key: apiKey_rawg,
            search: game.name,
            page_size: "1",
          });

          const response = await fetch(
            `https://api.rawg.io/api/games?${params}`,
            {
              next: { revalidate: 3600 },
            },
          );

          if (!response.ok) {
            return null;
          }

          const data: { results: RawgGameResult[] } = await response.json();
          const gameData = data.results[0];

          if (!gameData) {
            return null;
          }

          return {
            id: gameData.id,
            name: gameData.name,
            released: gameData.released || "Unknown",
            rating: gameData.rating || 0,
            metacritic: gameData.metacritic || null,
            platforms:
              gameData.platforms?.map((p) => p.platform.name) || [],
            genres: gameData.genres?.map((g) => g.name) || [],
            background_image: gameData.background_image || "",
            description: gameData.description_raw || "",
            tags: gameData.tags?.slice(0, 5).map((t) => t.name) || [],
            recommendationReason: game.reason,
          };
        } catch (_err) {
          return null;
        }
      },
    );

    const games = (await Promise.all(gamePromises)).filter((g) => g !== null);

    if (games.length === 0) {
      return NextResponse.json(
        {
          error:
            "AI 推荐了游戏，但在游戏数据库中未找到匹配项。建议：1) 使用更通用的描述；2) 检查 RAWG_API_KEY 是否有效",
          aiRecommendations: recommendation.recommendedGames,
          analysis: recommendation.analysis,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      analysis: recommendation.analysis,
      games,
      searchKeywords: recommendation.searchKeywords,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to recommend games";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
