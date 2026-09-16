import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { deleteArchive, loadArchive } from "@/lib/archive/archive-manager";
import { requireAuth } from "@/lib/auth/middleware";
import { logger } from "@/lib/utils/logger";
import { enforceRateLimit, RATE_LIMIT_PRESETS } from "@/lib/utils/rate-limit";

/**
 * DELETE /api/archive/delete?id={archiveId}
 *
 * 删除世界存档（需要登录，只能删除自己的存档）
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
  const rateLimitResponse = enforceRateLimit(req, "archive-delete", RATE_LIMIT_PRESETS.archive);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // 要求用户登录
    const userOrResponse = await requireAuth(req);
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse;
    }
    const user = userOrResponse;

    const { searchParams } = new URL(req.url);
    const archiveId = searchParams.get("id");

    if (!archiveId) {
      return NextResponse.json(
        { error: "Missing archive id" },
        { status: 400 },
      );
    }

    // 加载存档以检查所有权
    const archive = await loadArchive(archiveId);

    if (!archive) {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    // 权限检查：只能删除自己的存档
    if (archive.user_id && archive.user_id !== user.id) {
      return NextResponse.json(
        { error: "Access denied: You can only delete your own archives" },
        { status: 403 },
      );
    }

    // 如果是旧存档（没有 user_id），允许删除（软迁移）
    const success = await deleteArchive(archiveId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete archive" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "存档删除成功",
    });
  } catch (error) {
    logger.error("Archive delete failed", { error });
    return NextResponse.json(
      {
        error: "存档删除失败",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
