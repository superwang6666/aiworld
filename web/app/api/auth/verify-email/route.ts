import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { sendWelcomeEmail } from "@/lib/auth/email-service";
import {
  verifyEmailToken,
  markEmailAsVerified,
  getUserById,
} from "@/lib/auth/user-service";
import { logger } from "@/lib/utils/logger";
import { enforceRateLimit, RATE_LIMIT_PRESETS } from "@/lib/utils/rate-limit";

import type { VerifyEmailRequest, VerifyEmailResponse } from "@/types/auth";

/**
 * 邮箱验证 API
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, "auth-verify-email", RATE_LIMIT_PRESETS.authSensitive);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body: VerifyEmailRequest = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json<VerifyEmailResponse>(
        { success: false, error: "缺少验证令牌" },
        { status: 400 },
      );
    }

    // 验证令牌
    const userId = await verifyEmailToken(token);

    if (!userId) {
      return NextResponse.json<VerifyEmailResponse>(
        { success: false, error: "验证令牌无效或已过期" },
        { status: 400 },
      );
    }

    // 标记邮箱为已验证
    await markEmailAsVerified(userId);

    // 获取用户信息
    const user = await getUserById(userId);

    // 发送欢迎邮件
    if (user) {
      try {
        await sendWelcomeEmail(user.email, user.username);
      } catch (emailError) {
        // 欢迎邮件不是关键路径,失败不影响验证结果,但要留痕方便排查邮件服务问题
        logger.error("Failed to send welcome email", {
          userId: user.id,
          error: emailError,
        });
      }
    }

    return NextResponse.json<VerifyEmailResponse>(
      {
        success: true,
        message: "邮箱验证成功！您现在可以登录了。",
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Email verification failed", { error });
    return NextResponse.json<VerifyEmailResponse>(
      { success: false, error: "验证失败，请稍后重试" },
      { status: 500 },
    );
  }
}
