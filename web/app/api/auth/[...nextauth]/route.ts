import type { NextRequest } from "next/server";

import { handlers } from "@/lib/auth/auth-config";
import { enforceRateLimit, RATE_LIMIT_PRESETS } from "@/lib/utils/rate-limit";


// GET 主要用于拉取 session/CSRF token，客户端会话检查会频繁调用，不限流。
export const GET = handlers.GET;

// POST 覆盖登录、登出、OAuth 回调等操作，登录尝试需要限流防止密码爆破。
export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(
    request,
    "auth-nextauth",
    RATE_LIMIT_PRESETS.authSensitive,
  );
  if (rateLimitResponse) return rateLimitResponse;

  return handlers.POST(request);
}
