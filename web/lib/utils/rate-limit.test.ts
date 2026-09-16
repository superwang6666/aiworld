/**
 * @jest-environment node
 *
 * NextRequest 继承自 Web 标准 Request，jsdom 测试环境（本项目全局默认）没有实现它，
 * 只有这个文件需要构造 NextRequest，所以单独切到 node 环境，而不是改全局配置。
 */
import { NextRequest } from "next/server";

import { enforceRateLimit, getClientIp } from "./rate-limit";

function makeRequest(ip: string): NextRequest {
  return new NextRequest("http://localhost/api/test", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("getClientIp", () => {
  it("reads the first address out of x-forwarded-for", () => {
    const request = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });

    expect(getClientIp(request)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const request = new NextRequest("http://localhost/api/test", {
      headers: { "x-real-ip": "9.9.9.9" },
    });

    expect(getClientIp(request)).toBe("9.9.9.9");
  });

  it("falls back to 'unknown' when neither header is present", () => {
    const request = new NextRequest("http://localhost/api/test");

    expect(getClientIp(request)).toBe("unknown");
  });
});

describe("enforceRateLimit", () => {
  it("allows requests under the configured max", () => {
    const ip = "10.0.0.1";
    const config = { windowMs: 60_000, max: 3 };

    for (let i = 0; i < 3; i++) {
      const response = enforceRateLimit(makeRequest(ip), "test-route-a", config);
      expect(response).toBeNull();
    }
  });

  it("blocks the request once the max is exceeded within the window", async () => {
    const ip = "10.0.0.2";
    const config = { windowMs: 60_000, max: 2 };

    expect(enforceRateLimit(makeRequest(ip), "test-route-b", config)).toBeNull();
    expect(enforceRateLimit(makeRequest(ip), "test-route-b", config)).toBeNull();

    const blocked = enforceRateLimit(makeRequest(ip), "test-route-b", config);
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);
    expect(blocked!.headers.get("Retry-After")).toBeTruthy();

    const body = await blocked!.json();
    expect(body.error).toBeTruthy();
  });

  it("tracks limits independently per route key, even for the same IP", () => {
    const ip = "10.0.0.3";
    const config = { windowMs: 60_000, max: 1 };

    expect(enforceRateLimit(makeRequest(ip), "route-x", config)).toBeNull();
    // Same IP, different route key -> its own bucket, not blocked.
    expect(enforceRateLimit(makeRequest(ip), "route-y", config)).toBeNull();
    // Second hit on route-x should now be blocked.
    expect(enforceRateLimit(makeRequest(ip), "route-x", config)).not.toBeNull();
  });

  it("tracks limits independently per IP, even for the same route key", () => {
    const config = { windowMs: 60_000, max: 1 };

    expect(enforceRateLimit(makeRequest("10.0.0.4"), "shared-route", config)).toBeNull();
    expect(enforceRateLimit(makeRequest("10.0.0.5"), "shared-route", config)).toBeNull();
  });
});
