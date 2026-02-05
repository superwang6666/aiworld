import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { WorldArchive } from "@/types";

import { saveArchive } from "@/lib/archive/archive-manager";
import { getOptionalUser } from "@/lib/auth/middleware";

/**
 * 验证存档数据结构
 */
function validateArchive(archive: unknown): archive is WorldArchive {
  if (!archive || typeof archive !== "object") {
    return false;
  }

  const a = archive as Partial<WorldArchive>;

  // 必需字段验证
  if (!a.name || typeof a.name !== "string" || a.name.trim().length === 0) {
    return false;
  }

  if (
    !a.core_premise ||
    typeof a.core_premise !== "string" ||
    a.core_premise.trim().length === 0
  ) {
    return false;
  }

  if (!Array.isArray(a.rules)) {
    return false;
  }

  // 验证规则数组
  for (const rule of a.rules) {
    if (!rule || typeof rule !== "object") {
      return false;
    }
    if (!rule.id || !rule.law || !rule.rule) {
      return false;
    }
  }

  return true;
}

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
      return NextResponse.json(
        { error: "Missing archive data" },
        { status: 400 },
      );
    }

    // 验证存档数据结构
    if (!validateArchive(archive)) {
      return NextResponse.json(
        { error: "Invalid archive data structure" },
        { status: 400 },
      );
    }

    // 验证存档名称长度
    if (archive.name.length > 100) {
      return NextResponse.json(
        { error: "Archive name too long (max 100 characters)" },
        { status: 400 },
      );
    }

    // 验证规则数量
    if (archive.rules.length === 0) {
      return NextResponse.json(
        { error: "Archive must contain at least one rule" },
        { status: 400 },
      );
    }

    if (archive.rules.length > 100) {
      return NextResponse.json(
        { error: "Archive contains too many rules (max 100)" },
        { status: 400 },
      );
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
      message: "存档保存成功",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "存档保存失败",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
