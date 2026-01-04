import { NextRequest, NextResponse } from 'next/server';

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
    const params = new URLSearchParams({
      key: apiKey,
      search: query.trim(),
      page_size: '10',  // 返回前10个结果
      ordering: '-metacritic',  // 按评分排序
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

    // 格式化响应
    const games = data.results.map((game: any) => ({
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
