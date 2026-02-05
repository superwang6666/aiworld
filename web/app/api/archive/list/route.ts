import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { listArchives } from "@/lib/archive/archive-manager";
import { getOptionalUser } from "@/lib/auth/middleware";

/**
 * GET /api/archive/list
 *
 * 列出存档（用户自己的存档 + 公开存档）
 *
 * Response:
 * {
 *   archives: ArchiveMetadata[]
 * }
 */
export async function GET(_req: NextRequest) {
  try {
    // 获取当前用户（可选）
    const user = await getOptionalUser();

    // 获取所有存档
    const allArchives = await listArchives();

    // 过滤：显示用户自己的存档 + 公开存档
    const filteredArchives = allArchives.filter((archive) => {
      // 如果是用户自己的存档，显示
      if (user && archive.user_id === user.id) {
        return true;
      }
      // 如果是公开存档，显示
      if (archive.is_public) {
        return true;
      }
      // 如果存档没有 user_id（旧存档），显示（软迁移）
      if (!archive.user_id) {
        return true;
      }
      return false;
    });

    return NextResponse.json({ archives: filteredArchives });
  } catch (error) {
    // Error handled silently
    return NextResponse.json(
      {
        error: "获取存档列表失败",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
