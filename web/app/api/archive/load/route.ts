import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { loadArchive } from "@/lib/archive/archive-manager";
import { getOptionalUser } from "@/lib/auth/middleware";
import { logger } from "@/lib/utils/logger";
import { enforceRateLimit, RATE_LIMIT_PRESETS } from "@/lib/utils/rate-limit";

/**
 * GET /api/archive/load?id={archiveId}
 *
 * 加载世界存档（权限检查：用户自己的存档 + 公开存档）
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
  const rateLimitResponse = enforceRateLimit(req, "archive-load", RATE_LIMIT_PRESETS.archive);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // 获取当前用户（可选）
    const user = await getOptionalUser();

    const { searchParams } = new URL(req.url);
    const archiveId = searchParams.get("id");

    if (!archiveId) {
      return NextResponse.json(
        { error: "Missing archive id" },
        { status: 400 },
      );
    }

    const archive = await loadArchive(archiveId);

    if (!archive) {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    // 权限检查
    const isOwner = user && archive.user_id === user.id;
    const isPublic = archive.is_public;
    const isLegacy = !archive.user_id; // 旧存档（软迁移）

    if (!isOwner && !isPublic && !isLegacy) {
      return NextResponse.json(
        {
          error:
            "Access denied: You do not have permission to access this archive",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({ archive });
  } catch (error) {
    logger.error("Archive load failed", { error });
    return NextResponse.json(
      {
        error: "存档加载失败",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
