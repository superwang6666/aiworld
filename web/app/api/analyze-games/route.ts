import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/types/i18n";

import { createLanguageAwareSystemPrompt } from "@/lib/utils/llm-language";
import { getOpenAIClient } from "@/lib/utils/openai-client";

import type { Locale} from "@/types/i18n";

const ANALYSIS_PROMPT = `你是游戏设计与世界观构建专家。你的任务是分析多个游戏，提取它们的核心元素和异同点，为世界观构建提供参考。

## 分析维度（高层概览）

对每个游戏提取以下核心特征（3-5个关键点）：

1. **美术风格** - 视觉呈现的核心特征
2. **核心玩法** - 最本质的游戏机制（2-3个）
3. **叙事结构** - 故事讲述方式
4. **独特特征** - 与其他游戏的显著区别

## 对比分析

分析所有游戏后，总结：
- **共同点** - 这类游戏的类型特征
- **差异点** - 各游戏的独特创新
- **核心元素** - 可用于世界观构建的要素

## JSON响应格式

{
  "individualAnalyses": [
    {
      "gameName": "游戏名称",
      "coreElements": ["元素1", "元素2", "元素3"],
      "artStyle": "美术风格描述",
      "gameplayMechanics": ["玩法1", "玩法2"],
      "narrativeStructure": "叙事结构描述",
      "uniqueFeatures": ["独特点1", "独特点2"]
    }
  ],
  "comparativeAnalysis": {
    "games": ["游戏1", "游戏2"],
    "commonElements": ["共同核心元素"],
    "differences": [
      {
        "game": "游戏1",
        "uniqueElements": ["独特之处"]
      }
    ],
    "coreGenreElements": ["可提取的类型核心元素"],
    "worldBuildingInsights": ["对世界观构建的启发"],
    "premiseSummary": "将worldBuildingInsights总结成一句话的核心设定，作为用户创作世界观的参考起点"
  }
}

重要：
1. 聚焦最重要的3-5个特征，避免过度细节
2. 使用双引号(")表示字符串
3. 提取的元素应具体且可操作
4. 世界观启发应与七大法则（Space/Survival/Cognition/Scarcity/Time/Power/Metaphysics）关联
5. premiseSummary应该是一句简洁但富有启发性的话，整合所有worldBuildingInsights的核心思想，适合作为世界观创作的起点`;

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

    // 添加语言指令
    const systemPrompt = createLanguageAwareSystemPrompt(ANALYSIS_PROMPT, locale);
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

    const userPrompt = `请分析以下游戏:\n\n${gamesDescription}`;

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
