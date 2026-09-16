import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";


import {
  authenticateUser,
  getUserByOAuth,
  createOAuthUser,
} from "./user-service";

import type { SessionUser } from "@/types/auth";
import type { Provider } from "next-auth/providers";

/**
 * 构建 OAuth providers 列表
 * 只添加已配置环境变量的 provider
 */
function buildProviders() {
  const providers: Provider[] = [
    // 邮箱密码登录（始终可用）
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await authenticateUser(
            credentials.email as string,
            credentials.password as string,
          );

          if (!user) {
            return null;
          }

          // 返回用户信息
          return {
            id: user.id,
            email: user.email,
            name: user.username,
            image: user.avatar_url,
            emailVerified: user.email_verified ? new Date() : null,
          };
        } catch {
          return null;
        }
      },
    }),
  ];

  // Google OAuth（仅在配置时添加）
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    );
  }

  // Discord OAuth（仅在配置时添加）
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    providers.push(
      Discord({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
      }),
    );
  }

  // Twitter/X OAuth（仅在配置时添加）
  if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
    providers.push(
      Twitter({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
      }),
    );
  }

  return providers;
}

/**
 * NextAuth.js 配置
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: buildProviders(),

  // 使用 JWT 策略
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },

  // 自定义页面路径
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },

  // 回调函数
  callbacks: {
    // JWT 回调：在创建或更新 JWT 时调用
    async jwt({ token, user, account, profile }) {
      // 初次登录时，user 对象存在
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        // NextAuth User 对象可能有 emailVerified 属性
        token.emailVerified =
          "emailVerified" in user && user.emailVerified !== null;
      }

      // OAuth 登录时，处理 OAuth 用户
      if (account && profile && profile.email) {
        try {
          const provider = account.provider as "google" | "twitter" | "discord";
          const oauthId = account.providerAccountId;
          const email = profile.email || "";
          const username = profile.name || email.split("@")[0];
          const avatarUrl = profile.image || profile.picture;

          // 检查用户是否已存在
          const existingUser = await getUserByOAuth(provider, oauthId);

          if (!existingUser) {
            // 创建新的 OAuth 用户
            const newUser = await createOAuthUser(
              email,
              username,
              provider,
              oauthId,
              avatarUrl,
            );
            token.id = newUser.id;
            token.email = newUser.email;
            token.name = newUser.username;
            token.picture = newUser.avatar_url;
            token.emailVerified = true;
          } else {
            token.id = existingUser.id;
            token.email = existingUser.email;
            token.name = existingUser.username;
            token.picture = existingUser.avatar_url;
            token.emailVerified = existingUser.email_verified;
          }
        } catch {
          // OAuth user creation failed, continue with existing token
        }
      }

      return token;
    },

    // Session 回调：在获取 session 时调用
    async session({ session, token }) {
      if (token && session.user) {
        const sessionUser: SessionUser = {
          id: token.id as string,
          email: token.email as string,
          username: token.name as string,
          avatar_url: token.picture as string | undefined,
          email_verified: token.emailVerified as boolean,
        };

        // NextAuth v5 的 session 回调参数类型是 database/jwt 两种策略形状的交叉类型，
        // 这里只用 jwt 策略，session.user 在类型层面仍会被推导成 AdapterUser & SessionUser，
        // 无法通过模块扩展消除，只能显式断言。
        session.user = sessionUser as unknown as typeof session.user;
      }

      return session;
    },

    // 登录回调：控制是否允许登录
    async signIn({ account, profile }) {
      // 邮箱密码登录
      if (account?.provider === "credentials") {
        return true;
      }

      // OAuth 登录
      if (account && profile) {
        // 检查是否有邮箱
        if (!profile.email) {
          return false;
        }
        return true;
      }

      return false;
    },
  },

  // 事件监听
  events: {
    async signIn() {
      // User signed in
    },
    async signOut() {
      // User signed out
    },
  },

  // 调试模式（生产环境应关闭）
  debug: process.env.NODE_ENV === "development",
});
