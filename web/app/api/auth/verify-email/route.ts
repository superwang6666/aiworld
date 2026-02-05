import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import { sendWelcomeEmail } from '@/lib/auth/email-service';
import { verifyEmailToken, markEmailAsVerified, getUserById } from '@/lib/auth/user-service';

import type { VerifyEmailRequest, VerifyEmailResponse } from '@/types/auth';


/**
 * 邮箱验证 API
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerifyEmailRequest = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json<VerifyEmailResponse>(
        { success: false, error: '缺少验证令牌' },
        { status: 400 }
      );
    }

    // 验证令牌
    const userId = await verifyEmailToken(token);

    if (!userId) {
      return NextResponse.json<VerifyEmailResponse>(
        { success: false, error: '验证令牌无效或已过期' },
        { status: 400 }
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
        console.error('Failed to send welcome email:', emailError);
        // 不阻止验证流程
      }
    }

    return NextResponse.json<VerifyEmailResponse>(
      {
        success: true,
        message: '邮箱验证成功！您现在可以登录了。',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json<VerifyEmailResponse>(
      { success: false, error: error.message || '验证失败，请稍后重试' },
      { status: 500 }
    );
  }
}
