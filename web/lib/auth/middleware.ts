import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from './auth-config';

import type { SessionUser } from '@/types/auth';


/**
 * 认证中间件 - 保护需要登录的 API 路由
 *
 * @param request - Next.js 请求对象
 * @returns 用户信息或 401 错误响应
 */
export async function requireAuth(
  _request: NextRequest
): Promise<SessionUser | NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: '未授权访问，请先登录' },
      { status: 401 }
    );
  }

  return session.user as SessionUser;
}

/**
 * 可选认证中间件 - 获取当前用户（如果已登录）
 *
 * @returns 用户信息或 null
 */
export async function getOptionalUser(): Promise<SessionUser | null> {
  const session = await auth();
  return (session?.user as SessionUser) || null;
}

/**
 * 检查邮箱是否已验证
 *
 * @param request - Next.js 请求对象
 * @returns 用户信息或错误响应
 */
export async function requireVerifiedEmail(
  _request: NextRequest
): Promise<SessionUser | NextResponse> {
  const userOrResponse = await requireAuth(_request);

  // 如果是错误响应，直接返回
  if (userOrResponse instanceof NextResponse) {
    return userOrResponse;
  }

  const user = userOrResponse;

  if (!user.email_verified) {
    return NextResponse.json(
      { error: '请先验证您的邮箱' },
      { status: 403 }
    );
  }

  return user;
}
