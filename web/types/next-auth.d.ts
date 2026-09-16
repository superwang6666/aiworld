import type { SessionUser } from "@/types/auth";

/**
 * NextAuth 的 session 回调（lib/auth/auth-config.ts）把 session.user 整个替换成
 * 我们自己的 SessionUser 形状（id/username/avatar_url/email_verified），跟库自带的
 * { name, email, image } 默认类型对不上。做一次模块扩展，让类型系统知道运行时的真实形状，
 * 这样消费端（如 UserMenu）就不用再 `as any` 了。
 */
declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    emailVerified?: boolean;
  }
}
