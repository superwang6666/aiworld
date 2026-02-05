import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import { sendVerificationEmail } from '@/lib/auth/email-service';
import { validateEmail, validatePassword, validateUsername } from '@/lib/auth/password-utils';
import { createUser, getUserByEmail, createEmailVerificationToken } from '@/lib/auth/user-service';

import type { RegisterRequest, RegisterResponse } from '@/types/auth';


/**
 * 用户注册 API
 */
export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, username } = body;

    // 验证输入
    if (!email || !password || !username) {
      return NextResponse.json<RegisterResponse>(
        { success: false, error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!validateEmail(email)) {
      return NextResponse.json<RegisterResponse>(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证用户名
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json<RegisterResponse>(
        { success: false, error: usernameValidation.error },
        { status: 400 }
      );
    }

    // 验证密码强度
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json<RegisterResponse>(
        { success: false, error: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json<RegisterResponse>(
        { success: false, error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 创建用户
    const user = await createUser(email, password, username);

    // 创建邮箱验证令牌
    const verificationToken = await createEmailVerificationToken(user.id);

    // 发送验证邮件
    try {
      await sendVerificationEmail(email, username, verificationToken.token);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // 不阻止注册流程，用户可以稍后重新发送验证邮件
    }

    return NextResponse.json<RegisterResponse>(
      {
        success: true,
        user,
        message: '注册成功！请查收验证邮件以激活账户。',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json<RegisterResponse>(
      { success: false, error: error.message || '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
