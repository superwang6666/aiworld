import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import type { WorldArchive } from '@/types';

import { saveArchive } from '@/lib/archive/archive-manager';
import { getOptionalUser } from '@/lib/auth/middleware';

/**
 * POST /api/archive/save
 *
 * 保存世界存档（支持匿名和登录用户）
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
    // 获取当前用户（可选）
    const user = await getOptionalUser();

    const body = await req.json();
    const { archive } = body;

    if (!archive) {
      return NextResponse.json({ error: 'Missing archive data' }, { status: 400 });
    }

    // 如果用户已登录，关联用户ID
    const archiveWithUser: WorldArchive = {
      ...archive,
      user_id: user?.id,
      is_public: archive.is_public ?? false,
    };

    // 保存存档
    const archiveId = await saveArchive(archiveWithUser);

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
