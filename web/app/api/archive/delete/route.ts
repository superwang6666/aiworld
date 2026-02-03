import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import { deleteArchive } from '@/lib/archive/archive-manager';

/**
 * DELETE /api/archive/delete?id={archiveId}
 *
 * 删除世界存档
 *
 * Query Parameters:
 * - id: 存档ID
 *
 * Response:
 * {
 *   success: boolean;
 *   message: string;
 * }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const archiveId = searchParams.get('id');

    if (!archiveId) {
      return NextResponse.json({ error: 'Missing archive id' }, { status: 400 });
    }

    const success = await deleteArchive(archiveId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete archive' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '存档删除成功',
    });
  } catch (error) {
    console.error('删除存档API错误:', error);
    return NextResponse.json(
      {
        error: '存档删除失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
