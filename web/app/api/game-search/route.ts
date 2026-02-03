import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, genre } = await request.json();

    // 验证输入
    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Query required' },
        { status: 400 }
      );
    }

    // 读取API密钥（可选）
    const apiKey = process.env.RAWG_API_KEY || '';

    // 构建RAWG API请求
    // 优先使用 -added (最受欢迎) 而不是 -metacritic (评分高但可能太小众)
    const params = new URLSearchParams({
      key: apiKey,
      search: query.trim(),
      page_size: '15',  // 返回前15个结果（过滤后取10个）
      ordering: '-added',  // 按人气排序
    });

    if (genre) {
      params.append('genres', genre);
    }

    const rawgUrl = `https://api.rawg.io/api/games?${params}`;

    // 调用RAWG API（使用Next.js缓存）
    const response = await fetch(rawgUrl, {
      next: { revalidate: 3600 },  // 缓存1小时
    });

    if (!response.ok) {
      throw new Error('RAWG API request failed');
    }

    const data = await response.json();

    // 格式化响应，并过滤低质量结果
    const games = data.results
      .filter((game: any) =>
        // 过滤条件：必须有发行日期且评分 > 2.5，或者Metacritic评分存在
        (game.released && game.released !== 'Unknown' && game.rating > 2.5) ||
        game.metacritic !== null
      )
      .slice(0, 10)  // 只取前10个
      .map((game: any) => ({
        id: game.id,
        name: game.name,
        released: game.released || 'Unknown',
        rating: game.rating || 0,
        metacritic: game.metacritic || null,
        platforms: game.platforms?.map((p: any) => p.platform.name) || [],
        genres: game.genres?.map((g: any) => g.name) || [],
        background_image: game.background_image || '',
        description: game.description_raw || '',
        tags: game.tags?.slice(0, 5).map((t: any) => t.name) || [],
      }));

    return NextResponse.json({
      games,
      totalCount: data.count,
    });

  } catch (error: any) {
    console.error('Game search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search games' },
      { status: 500 }
    );
  }
}
