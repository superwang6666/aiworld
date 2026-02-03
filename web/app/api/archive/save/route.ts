import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import type { WorldArchive } from '@/types';

import { saveArchive } from '@/lib/archive/archive-manager';

/**
 * POST /api/archive/save
 *
 * 保存世界存档
 *
 * Request Body:
 * {
 *   archive: WorldArchive
 * }
 *
 * Response:
 * {
 *   archive_id: string;
 *   message: string;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { archive } = body;

    if (!archive) {
      return NextResponse.json({ error: 'Missing archive data' }, { status: 400 });
    }

    // 保存存档
    const archiveId = await saveArchive(archive as WorldArchive);

    return NextResponse.json({
      archive_id: archiveId,
      message: '存档保存成功',
    });
  } catch (error) {
    console.error('保存存档API错误:', error);
    return NextResponse.json(
      {
        error: '存档保存失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
