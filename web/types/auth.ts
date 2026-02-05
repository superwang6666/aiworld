/**
 * 认证系统类型定义
 */

// ==================== 用户相关类型 ====================

/**
 * 用户数据库模型
 */
export interface User {
  id: string;                    // UUID
  email: string;                 // 邮箱（唯一）
  password_hash: string;         // bcrypt 加密的密码
  username: string;              // 显示名称
  avatar_url?: string;           // 头像 URL（可选）
  email_verified: boolean;       // 邮箱是否已验证
  created_at: string;            // 创建时间 (ISO 8601)
  updated_at: string;            // 更新时间 (ISO 8601)

  // OAuth 相关字段
  oauth_provider?: 'google' | 'twitter' | 'discord';  // OAuth 提供商
  oauth_id?: string;             // OAuth 提供商的用户 ID
}

/**
 * 公开的用户信息（不包含敏感数据）
 */
export interface PublicUser {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  email_verified: boolean;
  created_at: string;
}

/**
 * 用户注册请求
 */
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

/**
 * 用户登录请求
 */
export interface LoginRequest {
  email: string;
  password: string;
}

// ==================== 会话相关类型 ====================

/**
 * 会话数据（存储在 JWT 中）
 */
export interface SessionUser {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  email_verified: boolean;
}

// ==================== 邮箱验证相关类型 ====================

/**
 * 邮箱验证令牌
 */
export interface EmailVerificationToken {
  id: string;                    // 令牌 ID (UUID)
  user_id: string;               // 关联的用户 ID
  token: string;                 // 验证令牌（随机生成）
  expires_at: string;            // 过期时间 (ISO 8601)
  created_at: string;            // 创建时间 (ISO 8601)
}

/**
 * 邮箱验证请求
 */
export interface VerifyEmailRequest {
  token: string;
}

// ==================== 密码重置相关类型 ====================

/**
 * 密码重置令牌
 */
export interface PasswordResetToken {
  id: string;                    // 令牌 ID (UUID)
  user_id: string;               // 关联的用户 ID
  token: string;                 // 重置令牌（随机生成）
  expires_at: string;            // 过期时间 (ISO 8601)
  created_at: string;            // 创建时间 (ISO 8601)
  used: boolean;                 // 是否已使用
}

/**
 * 请求密码重置
 */
export interface RequestPasswordResetRequest {
  email: string;
}

/**
 * 重置密码请求
 */
export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// ==================== 密码验证相关类型 ====================

/**
 * 密码强度验证结果
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

// ==================== API 响应类型 ====================

/**
 * 通用 API 响应
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 注册响应
 */
export interface RegisterResponse {
  success: boolean;
  user?: PublicUser;
  message?: string;
  error?: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  success: boolean;
  user?: PublicUser;
  message?: string;
  error?: string;
}

/**
 * 邮箱验证响应
 */
export interface VerifyEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 密码重置响应
 */
export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ==================== 用户存储相关类型 ====================

/**
 * 用户数据库（JSON 文件存储）
 */
export interface UserDatabase {
  users: User[];
  email_index: Record<string, string>;  // email -> user_id 映射
  oauth_index: Record<string, string>;  // oauth_provider:oauth_id -> user_id 映射
}

/**
 * 令牌数据库（JSON 文件存储）
 */
export interface TokenDatabase {
  email_verification_tokens: EmailVerificationToken[];
  password_reset_tokens: PasswordResetToken[];
}
