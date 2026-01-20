import { NextResponse } from 'next/server';
import { listArchives } from '@/lib/archive/archive-manager';

/**
 * GET /api/archive/list
 *
 * 列出所有存档
 *
 * Response:
 * {
 *   archives: ArchiveMetadata[]
 * }
 */
export async function GET() {
  try {
    const archives = await listArchives();

    return NextResponse.json({ archives });
  } catch (error) {
    console.error('列出存档API错误:', error);
    return NextResponse.json(
      {
        error: '获取存档列表失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
