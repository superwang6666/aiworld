import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 进程内内存限流器
 *
 * security.md 的提交前清单要求"Rate limiting on all endpoints"，但仓库里此前
 * 没有任何实现——21 个 API 路由全部裸奔，包括注册/密码重置这类容易被脚本刷的端点，
 * 也包括每次调用都要花钱的 LLM 生成端点。
 *
 * 这里用一个按 (路由key + 客户端 IP) 分桶的固定窗口计数器，足以覆盖"单个来源短时间
 * 内疯狂刷接口"这种最基本的滥用场景。只在单进程内生效——多实例部署要做真正的限流
 * 需要一个共享存储（Redis 等），跟仓库现在整体基于本地文件系统的持久化方案一样，
 * 这是当前部署形态下的合理取舍，不是这次要解决的问题。
 */

export interface RateLimitConfig {
  /** 时间窗口长度（毫秒） */
  windowMs: number;
  /** 窗口内允许的最大请求数 */
  max: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/** 常用限流预设，按端点的"贵"/"容易被滥用"程度分级 */
export const RATE_LIMIT_PRESETS = {
  /** 完整规则生成、专家综合等重度 LLM 调用 */
  llmHeavy: { windowMs: 60_000, max: 12 } satisfies RateLimitConfig,
  /** 单条规则生成、前提验证、方向评估等中等 LLM 调用 */
  llmLight: { windowMs: 60_000, max: 25 } satisfies RateLimitConfig,
  /** 注册/密码重置/邮箱验证等容易被脚本滥用的认证端点 */
  authSensitive: { windowMs: 60_000, max: 5 } satisfies RateLimitConfig,
  /** 存档 CRUD（要兼顾自动保存的调用频率） */
  archive: { windowMs: 60_000, max: 40 } satisfies RateLimitConfig,
  /** 调用第三方游戏数据源（RAWG）的端点 */
  external: { windowMs: 60_000, max: 20 } satisfies RateLimitConfig,
} as const;

const buckets = new Map<string, Bucket>();

// 定期清理过期桶，避免长期运行的进程里 Map 无限增长
const CLEANUP_INTERVAL_MS = 5 * 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupTimer(): void {
  if (cleanupTimer || typeof setInterval === "undefined") {
    return;
  }
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now >= bucket.resetAt) {
        buckets.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  cleanupTimer.unref?.();
}

function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  ensureCleanupTimer();

  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + config.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.max - 1, resetAt };
  }

  if (bucket.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: config.max - bucket.count,
    resetAt: bucket.resetAt,
  };
}

/** 从请求头里提取客户端 IP（经过反向代理时优先信任 x-forwarded-for 的第一个地址） */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * 在路由处理函数最开始调用。命中限流时返回一个 429 响应，路由应立即 `return` 它；
 * 未命中限流时返回 `null`，路由照常继续处理。
 *
 * @param routeKey 路由标识（用于隔离不同端点各自的计数），比如 "generate"
 */
export function enforceRateLimit(
  request: NextRequest,
  routeKey: string,
  config: RateLimitConfig,
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${routeKey}:${ip}`;
  const result = checkRateLimit(key, config);

  if (result.allowed) {
    return null;
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.resetAt - Date.now()) / 1000),
  );

  return NextResponse.json(
    { error: "请求过于频繁，请稍后重试" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}
