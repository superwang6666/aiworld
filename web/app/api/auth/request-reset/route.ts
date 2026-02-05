import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { sendPasswordResetEmail } from "@/lib/auth/email-service";
import { validateEmail } from "@/lib/auth/password-utils";
import {
  getUserByEmail,
  createPasswordResetToken,
} from "@/lib/auth/user-service";

import type {
  RequestPasswordResetRequest,
  PasswordResetResponse,
} from "@/types/auth";

/**
 * 请求密码重置 API
 */
export async function POST(request: NextRequest) {
  try {
    const body: RequestPasswordResetRequest = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json<PasswordResetResponse>(
        { success: false, error: "请输入邮箱地址" },
        { status: 400 },
      );
    }

    // 验证邮箱格式
    if (!validateEmail(email)) {
      return NextResponse.json<PasswordResetResponse>(
        { success: false, error: "邮箱格式不正确" },
        { status: 400 },
      );
    }

    // 查找用户
    const user = await getUserByEmail(email);

    // 安全考虑：即使用户不存在，也返回成功消息（防止邮箱枚举攻击）
    if (!user) {
      return NextResponse.json<PasswordResetResponse>(
        {
          success: true,
          message: "如果该邮箱已注册，您将收到密码重置邮件。",
        },
        { status: 200 },
      );
    }

    // OAuth 用户不能重置密码
    if (user.oauth_provider) {
      return NextResponse.json<PasswordResetResponse>(
        {
          success: false,
          error: "该账号使用 OAuth 登录，无法重置密码。请使用对应的登录方式。",
        },
        { status: 400 },
      );
    }

    // 创建密码重置令牌
    const resetToken = await createPasswordResetToken(user.id);

    // 发送密码重置邮件
    try {
      await sendPasswordResetEmail(user.email, user.username, resetToken.token);
    } catch (_emailError) {
      // Error handled silently
      return NextResponse.json<PasswordResetResponse>(
        { success: false, error: "发送邮件失败，请稍后重试" },
        { status: 500 },
      );
    }

    return NextResponse.json<PasswordResetResponse>(
      {
        success: true,
        message: "密码重置邮件已发送，请查收。",
      },
      { status: 200 },
    );
  } catch (_error: any) {
    // Error handled silently
    return NextResponse.json<PasswordResetResponse>(
      { success: false, error: "请求失败，请稍后重试" },
      { status: 500 },
    );
  }
}
