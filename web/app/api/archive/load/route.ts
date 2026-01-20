import { NextRequest, NextResponse } from 'next/server';
import { loadArchive } from '@/lib/archive/archive-manager';

/**
 * GET /api/archive/load?id={archiveId}
 *
 * 加载世界存档
 *
 * Query Parameters:
 * - id: 存档ID
 *
 * Response:
 * {
 *   archive: WorldArchive | null
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const archiveId = searchParams.get('id');

    if (!archiveId) {
      return NextResponse.json({ error: 'Missing archive id' }, { status: 400 });
    }

    const archive = await loadArchive(archiveId);

    if (!archive) {
      return NextResponse.json({ error: 'Archive not found' }, { status: 404 });
    }

    return NextResponse.json({ archive });
  } catch (error) {
    console.error('加载存档API错误:', error);
    return NextResponse.json(
      {
        error: '存档加载失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
