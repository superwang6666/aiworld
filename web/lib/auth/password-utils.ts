import bcrypt from "bcryptjs";

import type { PasswordValidationResult } from "@/types/auth";

/**
 * 密码策略配置
 */
const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: false, // 可选：特殊字符
  BCRYPT_ROUNDS: 12, // bcrypt 加密轮数
};

/**
 * 验证密码强度
 *
 * 密码策略：
 * - 最小长度：8 字符
 * - 必须包含：大写字母、小写字母、数字
 *
 * @param password - 待验证的密码
 * @returns 验证结果
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // 检查长度
  if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
    errors.push(`密码长度至少为 ${PASSWORD_CONFIG.MIN_LENGTH} 个字符`);
  }

  // 检查大写字母
  if (PASSWORD_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push("密码必须包含至少一个大写字母");
  }

  // 检查小写字母
  if (PASSWORD_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push("密码必须包含至少一个小写字母");
  }

  // 检查数字
  if (PASSWORD_CONFIG.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push("密码必须包含至少一个数字");
  }

  // 检查特殊字符（可选）
  if (
    PASSWORD_CONFIG.REQUIRE_SPECIAL &&
    !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  ) {
    errors.push("密码必须包含至少一个特殊字符");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 加密密码
 *
 * 使用 bcrypt 算法加密密码，salt rounds = 12
 *
 * @param plainPassword - 明文密码
 * @returns 加密后的密码哈希
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(PASSWORD_CONFIG.BCRYPT_ROUNDS);
  const hash = await bcrypt.hash(plainPassword, salt);
  return hash;
}

/**
 * 验证密码
 *
 * 比较明文密码与加密后的哈希值
 *
 * @param plainPassword - 明文密码
 * @param hashedPassword - 加密后的密码哈希
 * @returns 是否匹配
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * 验证邮箱格式
 *
 * @param email - 待验证的邮箱
 * @returns 是否为有效邮箱
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证用户名
 *
 * 用户名规则：
 * - 长度：2-20 字符
 * - 允许：字母、数字、下划线、中文
 *
 * @param username - 待验证的用户名
 * @returns 验证结果
 */
export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (username.length < 2) {
    return { valid: false, error: "用户名长度至少为 2 个字符" };
  }

  if (username.length > 20) {
    return { valid: false, error: "用户名长度不能超过 20 个字符" };
  }

  // 允许字母、数字、下划线、中文
  const usernameRegex = /^[\w\u4e00-\u9fa5]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, error: "用户名只能包含字母、数字、下划线和中文" };
  }

  return { valid: true };
}
