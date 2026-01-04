import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const RECOMMENDATION_PROMPT = `你是游戏设计专家。你的任务是根据用户描述的核心异质点，推荐具有相似概念、机制或世界观设定的代表作游戏。

## 分析步骤

1. **理解核心异质点**: 识别用户描述中的关键概念
2. **匹配游戏**: 找到运用了相似概念的知名游戏（至少5-10个）
3. **提取关键词**: 生成搜索这些游戏的关键词

## 推荐标准

- 优先推荐**知名度高、评价好**的游戏
- 寻找在**核心机制、世界观设定、叙事手法**上相似的游戏
- 包含不同类型的游戏以提供多样化视角
- 避免过于小众或低质量的游戏

## JSON 响应格式

{
  "analysis": "对用户核心异质点的简短分析（1-2句话）",
  "recommendedGames": [
    {
      "name": "游戏英文名",
      "reason": "推荐理由（与核心异质点的关联）"
    }
  ],
  "searchKeywords": ["关键词1", "关键词2", "关键词3"]
}

重要提示：
- 游戏名称必须使用**英文原名**（RAWG API 需要）
- 推荐 5-10 个游戏
- 推荐理由要具体，说明与核心异质点的关联
- 搜索关键词用于备用搜索`;

export async function POST(request: NextRequest) {
  try {
    const { anomalyDescription } = await request.json();

    if (!anomalyDescription?.trim()) {
      return NextResponse.json(
        { error: 'Anomaly description required' },
        { status: 400 }
      );
    }

    // 配置 AI 客户端
    const deepSeekKey = process.env.DEEPSEEK_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const apiKey = deepSeekKey || openAiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key not configured. Please set DEEPSEEK_API_KEY or OPENAI_API_KEY in .env file' },
        { status: 500 }
      );
    }

    const baseURL = deepSeekKey ? 'https://api.deepseek.com' : undefined;
    const openai = new OpenAI({ apiKey, baseURL });

    const model = deepSeekKey ? 'deepseek-chat' : 'gpt-4o-mini';

    // 第一步：AI 推荐游戏
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: RECOMMENDATION_PROMPT },
        {
          role: 'user',
          content: `核心异质点描述:\n\n${anomalyDescription.trim()}`
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from AI service');
    }

    // 解析 AI 响应
    let recommendation;
    try {
      let cleanedContent = responseContent.trim();
      const jsonMatch = cleanedContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[1].trim();
      }
      cleanedContent = cleanedContent.replace(/[""]/g, '"');
      cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1');

      recommendation = JSON.parse(cleanedContent);
    } catch (parseError: any) {
      console.error('Parse error:', parseError.message);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }

    // 第二步：使用 RAWG API 搜索推荐的游戏
    const apiKey_rawg = process.env.RAWG_API_KEY || '';
    const gamePromises = recommendation.recommendedGames.map(async (game: any) => {
      try {
        const params = new URLSearchParams({
          key: apiKey_rawg,
          search: game.name,
          page_size: '1',
        });

        const response = await fetch(`https://api.rawg.io/api/games?${params}`, {
          next: { revalidate: 3600 },
        });

        if (!response.ok) return null;

        const data = await response.json();
        const gameData = data.results[0];

        if (!gameData) return null;

        return {
          id: gameData.id,
          name: gameData.name,
          released: gameData.released || 'Unknown',
          rating: gameData.rating || 0,
          metacritic: gameData.metacritic || null,
          platforms: gameData.platforms?.map((p: any) => p.platform.name) || [],
          genres: gameData.genres?.map((g: any) => g.name) || [],
          background_image: gameData.background_image || '',
          description: gameData.description_raw || '',
          tags: gameData.tags?.slice(0, 5).map((t: any) => t.name) || [],
          recommendationReason: game.reason,
        };
      } catch (err) {
        console.error(`Failed to fetch game: ${game.name}`, err);
        return null;
      }
    });

    const games = (await Promise.all(gamePromises)).filter(g => g !== null);

    return NextResponse.json({
      analysis: recommendation.analysis,
      games,
      searchKeywords: recommendation.searchKeywords,
    });

  } catch (error: any) {
    console.error('Game recommendation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to recommend games' },
      { status: 500 }
    );
  }
}
