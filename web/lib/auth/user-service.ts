import { promises as fs } from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";

import { hashPassword, verifyPassword } from "./password-utils";

import type {
  User,
  PublicUser,
  UserDatabase,
  TokenDatabase,
  EmailVerificationToken,
  PasswordResetToken,
} from "@/types/auth";

// 数据存储路径
const DATA_DIR = path.join(process.cwd(), "data", "users");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const TOKENS_FILE = path.join(DATA_DIR, "tokens.json");

/**
 * 确保数据目录存在
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * 读取用户数据库
 */
async function readUserDatabase(): Promise<UserDatabase> {
  await ensureDataDir();

  try {
    const data = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // 文件不存在，返回空数据库
    return {
      users: [],
      email_index: {},
      oauth_index: {},
    };
  }
}

/**
 * 写入用户数据库
 */
async function writeUserDatabase(db: UserDatabase): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(db, null, 2), "utf-8");
}

/**
 * 读取令牌数据库
 */
async function readTokenDatabase(): Promise<TokenDatabase> {
  await ensureDataDir();

  try {
    const data = await fs.readFile(TOKENS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // 文件不存在，返回空数据库
    return {
      email_verification_tokens: [],
      password_reset_tokens: [],
    };
  }
}

/**
 * 写入令牌数据库
 */
async function writeTokenDatabase(db: TokenDatabase): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(TOKENS_FILE, JSON.stringify(db, null, 2), "utf-8");
}

/**
 * 将 User 转换为 PublicUser（移除敏感信息）
 */
function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatar_url: user.avatar_url,
    email_verified: user.email_verified,
    created_at: user.created_at,
  };
}

// ==================== 用户 CRUD 操作 ====================

/**
 * 创建新用户（邮箱密码注册）
 */
export async function createUser(
  email: string,
  password: string,
  username: string,
): Promise<PublicUser> {
  const db = await readUserDatabase();

  // 检查邮箱是否已存在
  if (db.email_index[email.toLowerCase()]) {
    throw new Error("该邮箱已被注册");
  }

  // 加密密码
  const password_hash = await hashPassword(password);

  // 创建用户
  const now = new Date().toISOString();
  const user: User = {
    id: uuidv4(),
    email: email.toLowerCase(),
    password_hash,
    username,
    email_verified: false,
    created_at: now,
    updated_at: now,
  };

  // 添加到数据库
  db.users.push(user);
  db.email_index[user.email] = user.id;

  await writeUserDatabase(db);

  return toPublicUser(user);
}

/**
 * 创建 OAuth 用户
 */
export async function createOAuthUser(
  email: string,
  username: string,
  provider: "google" | "twitter" | "discord",
  oauthId: string,
  avatarUrl?: string,
): Promise<PublicUser> {
  const db = await readUserDatabase();

  // 检查 OAuth 用户是否已存在
  const oauthKey = `${provider}:${oauthId}`;
  if (db.oauth_index[oauthKey]) {
    const existingUserId = db.oauth_index[oauthKey];
    const existingUser = db.users.find((u) => u.id === existingUserId);
    if (existingUser) {
      return toPublicUser(existingUser);
    }
  }

  // 检查邮箱是否已存在
  if (db.email_index[email.toLowerCase()]) {
    throw new Error("该邮箱已被注册");
  }

  // 创建用户
  const now = new Date().toISOString();
  const user: User = {
    id: uuidv4(),
    email: email.toLowerCase(),
    password_hash: "", // OAuth 用户没有密码
    username,
    avatar_url: avatarUrl,
    email_verified: true, // OAuth 用户默认已验证
    oauth_provider: provider,
    oauth_id: oauthId,
    created_at: now,
    updated_at: now,
  };

  // 添加到数据库
  db.users.push(user);
  db.email_index[user.email] = user.id;
  db.oauth_index[oauthKey] = user.id;

  await writeUserDatabase(db);

  return toPublicUser(user);
}

/**
 * 通过邮箱获取用户
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await readUserDatabase();
  const userId = db.email_index[email.toLowerCase()];

  if (!userId) {
    return null;
  }

  const user = db.users.find((u) => u.id === userId);
  return user || null;
}

/**
 * 通过 ID 获取用户
 */
export async function getUserById(id: string): Promise<User | null> {
  const db = await readUserDatabase();
  const user = db.users.find((u) => u.id === id);
  return user || null;
}

/**
 * 通过 OAuth 信息获取用户
 */
export async function getUserByOAuth(
  provider: "google" | "twitter" | "discord",
  oauthId: string,
): Promise<User | null> {
  const db = await readUserDatabase();
  const oauthKey = `${provider}:${oauthId}`;
  const userId = db.oauth_index[oauthKey];

  if (!userId) {
    return null;
  }

  const user = db.users.find((u) => u.id === userId);
  return user || null;
}

/**
 * 验证用户密码
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  // OAuth 用户没有密码
  if (user.oauth_provider) {
    throw new Error("该账号使用 OAuth 登录，请使用对应的登录方式");
  }

  const isValid = await verifyPassword(password, user.password_hash);

  if (!isValid) {
    return null;
  }

  return toPublicUser(user);
}

/**
 * 更新用户邮箱验证状态
 */
export async function markEmailAsVerified(userId: string): Promise<void> {
  const db = await readUserDatabase();
  const userIndex = db.users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error("用户不存在");
  }

  // 不可变更新
  db.users[userIndex] = {
    ...db.users[userIndex],
    email_verified: true,
    updated_at: new Date().toISOString(),
  };

  await writeUserDatabase(db);
}

/**
 * 更新用户密码
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string,
): Promise<void> {
  const db = await readUserDatabase();
  const userIndex = db.users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error("用户不存在");
  }

  // 不可变更新
  db.users[userIndex] = {
    ...db.users[userIndex],
    password_hash: await hashPassword(newPassword),
    updated_at: new Date().toISOString(),
  };

  await writeUserDatabase(db);
}

// ==================== 邮箱验证令牌操作 ====================

/**
 * 创建邮箱验证令牌
 */
export async function createEmailVerificationToken(
  userId: string,
): Promise<EmailVerificationToken> {
  const db = await readTokenDatabase();

  // 删除该用户的旧令牌
  db.email_verification_tokens = db.email_verification_tokens.filter(
    (t) => t.user_id !== userId,
  );

  // 创建新令牌（24小时有效）
  const token: EmailVerificationToken = {
    id: uuidv4(),
    user_id: userId,
    token: uuidv4(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  };

  db.email_verification_tokens.push(token);
  await writeTokenDatabase(db);

  return token;
}

/**
 * 验证邮箱验证令牌
 */
export async function verifyEmailToken(
  tokenString: string,
): Promise<string | null> {
  const db = await readTokenDatabase();
  const token = db.email_verification_tokens.find(
    (t) => t.token === tokenString,
  );

  if (!token) {
    return null;
  }

  // 检查是否过期
  if (new Date(token.expires_at) < new Date()) {
    return null;
  }

  // 删除已使用的令牌
  db.email_verification_tokens = db.email_verification_tokens.filter(
    (t) => t.token !== tokenString,
  );
  await writeTokenDatabase(db);

  return token.user_id;
}

// ==================== 密码重置令牌操作 ====================

/**
 * 创建密码重置令牌
 */
export async function createPasswordResetToken(
  userId: string,
): Promise<PasswordResetToken> {
  const db = await readTokenDatabase();

  // 删除该用户的旧令牌
  db.password_reset_tokens = db.password_reset_tokens.filter(
    (t) => t.user_id !== userId,
  );

  // 创建新令牌（1小时有效）
  const token: PasswordResetToken = {
    id: uuidv4(),
    user_id: userId,
    token: uuidv4(),
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    used: false,
  };

  db.password_reset_tokens.push(token);
  await writeTokenDatabase(db);

  return token;
}

/**
 * 验证密码重置令牌
 */
export async function verifyPasswordResetToken(
  tokenString: string,
): Promise<string | null> {
  const db = await readTokenDatabase();
  const token = db.password_reset_tokens.find((t) => t.token === tokenString);

  if (!token) {
    return null;
  }

  // 检查是否已使用
  if (token.used) {
    return null;
  }

  // 检查是否过期
  if (new Date(token.expires_at) < new Date()) {
    return null;
  }

  return token.user_id;
}

/**
 * 标记密码重置令牌为已使用
 */
export async function markPasswordResetTokenAsUsed(
  tokenString: string,
): Promise<void> {
  const db = await readTokenDatabase();
  const token = db.password_reset_tokens.find((t) => t.token === tokenString);

  if (token) {
    token.used = true;
    await writeTokenDatabase(db);
  }
}
