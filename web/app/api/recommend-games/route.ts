import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const RECOMMENDATION_PROMPT = `你是游戏设计专家.你的任务是根据用户描述的核心异质点，推荐具有相似概念,机制或世界观设定的代表作游戏.

## 分析步骤

### 1. 拆解核心异质点
- **输入**：用户用一句话或简短描述提出的核心概念.
- **操作**：将描述拆解为1-3个独立且明确的关键概念（Key Concepts）.
- **输出示例**：对于“一个由机器人统治的蒸汽朋克世界”，拆解为：
  - 概念A：**机器人统治** (Robotic Overlords / AI Governance)
  - 概念B：**蒸汽朋克世界** (Steampunk World)

### 2. 分层匹配游戏
遵循以下三级优先级顺序进行搜索与匹配，确保从精准到宽泛的覆盖：

#### 第一优先级：精准匹配 (组合概念)
- **目标**：寻找同时包含所有关键概念的游戏.
- **方法**：搜索组合关键词（如“Steampunk Robot Overlords”）.
- **期望**：找到最贴近用户描述,直接对应其完整想象的游戏.此为最佳推荐.

#### 第二优先级：部分匹配 (独立概念)
- **触发条件**：精准匹配未能找到足够数量（如少于3款）的高质量游戏.
- **方法**：分别搜索包含**单个关键概念**的游戏.
  - 匹配概念A的游戏（如：主打“机器人统治”的游戏）.
  - 匹配概念B的游戏（如：设定在典型的“蒸汽朋克世界”的游戏）.
- **说明**：此类推荐需在理由中明确指出是匹配了哪个部分的概念.

#### 第三优先级：近似匹配 (邻接概念)
- **触发条件**：部分匹配后，推荐游戏总数仍未达到要求（如少于5款）.
- **方法**：扩大搜索范围，寻找与核心异质点**意境,主题,氛围或逻辑上相近**的游戏.
- **示例**：对于“机器人统治的蒸汽朋克”，可扩展至“柴油朋克”,“工业革命背景的极权社会”,“高自动化反乌托邦”等概念.

### 3. 提取关键词
生成一个结构化的关键词列表，以反映上述搜索路径，便于后续扩展或API调用.
- **层级1**：组合概念关键词（精准）.
- **层级2**：独立概念关键词（部分）.
- **层级3**：邻接/近似概念关键词（宽泛）.

## 推荐标准

- **质量与知名度优先**：始终首选在全球范围内知名度高,媒体评价（Metacritic, OpenCritic）或玩家口碑良好的作品.
- **关联性必须明确**：每个游戏的推荐理由（reason字段）必须清晰,具体地阐明其与核心异质点的哪个/哪些概念相关联，以及如何体现的.
- **逻辑分组呈现**：在最终推荐的游戏列表中，可以（非强制但鼓励）通过排序或简单注释，隐含地体现出游戏是来自"精准","部分"还是"近似"匹配，使推荐逻辑一目了然.
- **类型多样化**：在满足核心概念匹配的前提下，尽可能涵盖RPG,策略,动作,冒险,模拟等不同类型，以提供多元视角.
- **规避范围**：除非某款小众游戏是该概念无可替代的唯一或开创性典范，否则应避免推荐过于小众,完成度低或质量公认较差的游戏.

## JSON响应格式规范

{
  “analysis”: “简要的分析说明.首先明确拆解出的核心概念（1-2句话）.示例：‘已拆解出两个核心概念：1. 机器人作为统治阶级；2. 蒸汽朋克美学世界观.’”,
  “recommendedGames”: [
    {
      “name”: “游戏的标准英文原名”， // 必须使用RAWG API可识别的官方英文名
      “reason”: “具体,清晰的推荐理由.需说明此游戏如何体现核心概念.例如：‘《Iron Harvest》完美融合了柴油朋克（蒸汽朋克近亲）美学与巨型步行机甲作为战争核心的设定，展现了机械化权力对社会结构的统治.’”
    }
    // 推荐5-10款游戏.建议前2-3款为精准匹配，随后是部分匹配，最后是高质量的近似匹配.
  ],
  “searchKeywords”: [
    “组合关键词，如: steampunk ai rulership”，
    “独立关键词1，如: robotic overlords game”， 
    “独立关键词2，如: steampunk setting”，
    “近似关键词， 如: dieselpunk strategy”
    // 关键词应简洁,实用，适合用于数据库或搜索引擎的进一步检索.
  ]
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

    if (!apiKey_rawg) {
      console.warn('RAWG_API_KEY not set, game search may be limited');
    }

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

        if (!response.ok) {
          console.error(`RAWG API error for "${game.name}": ${response.status} ${response.statusText}`);
          return null;
        }

        const data = await response.json();
        const gameData = data.results[0];

        if (!gameData) {
          console.warn(`No match found in RAWG for: "${game.name}"`);
          return null;
        }

        console.log(`✓ Found game in RAWG: "${gameData.name}" (id: ${gameData.id})`);

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

    // 调试日志：查看 AI 推荐了哪些游戏
    console.log('AI recommended games:', recommendation.recommendedGames.map((g: any) => g.name));
    console.log('Successfully found games:', games.length);

    // 如果一个游戏都没找到，返回更详细的错误信息
    if (games.length === 0) {
      console.error('No games found in RAWG API. Recommended games:', recommendation.recommendedGames);
      return NextResponse.json({
        error: 'AI 推荐了游戏，但在游戏数据库中未找到匹配项。建议：1) 使用更通用的描述；2) 检查 RAWG_API_KEY 是否有效',
        aiRecommendations: recommendation.recommendedGames,
        analysis: recommendation.analysis
      }, { status: 404 });
    }

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
