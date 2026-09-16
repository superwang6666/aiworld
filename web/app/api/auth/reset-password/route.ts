import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { validatePassword } from "@/lib/auth/password-utils";
import {
  verifyPasswordResetToken,
  updateUserPassword,
  markPasswordResetTokenAsUsed,
} from "@/lib/auth/user-service";
import { logger } from "@/lib/utils/logger";
import { enforceRateLimit, RATE_LIMIT_PRESETS } from "@/lib/utils/rate-limit";

import type { ResetPasswordRequest, PasswordResetResponse } from "@/types/auth";

/**
 * 重置密码 API
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, "auth-reset-password", RATE_LIMIT_PRESETS.authSensitive);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body: ResetPasswordRequest = await request.json();
    const { token, new_password } = body;

    if (!token || !new_password) {
      return NextResponse.json<PasswordResetResponse>(
        { success: false, error: "请填写所有必填字段" },
        { status: 400 },
      );
    }

    // 验证密码强度
    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.valid) {
      return NextResponse.json<PasswordResetResponse>(
        { success: false, error: passwordValidation.errors.join(", ") },
        { status: 400 },
      );
    }

    // 验证令牌
    const userId = await verifyPasswordResetToken(token);

    if (!userId) {
      return NextResponse.json<PasswordResetResponse>(
        { success: false, error: "重置令牌无效或已过期" },
        { status: 400 },
      );
    }

    // 更新密码
    await updateUserPassword(userId, new_password);

    // 标记令牌为已使用
    await markPasswordResetTokenAsUsed(token);

    return NextResponse.json<PasswordResetResponse>(
      {
        success: true,
        message: "密码重置成功！您现在可以使用新密码登录。",
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Password reset failed", { error });
    const message = error instanceof Error ? error.message : "重置失败，请稍后重试";
    return NextResponse.json<PasswordResetResponse>(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
