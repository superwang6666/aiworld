import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";

/**
 * security.md 要求"Rate limiting on all endpoints"，但这条规矩此前只存在于文档里，
 * 没有任何机制强制执行——直到有人手动检查，否则新加的路由完全可能漏掉限流。
 *
 * 这个测试把"每个 API 路由都必须接入 enforceRateLimit"变成一条会在 CI 里跑的断言：
 * 新增/修改 app/api 下的 route.ts 如果忘了接限流，这里就会挂红，而不是要等到
 * 安全审计或者被脚本刷爆才发现。
 */
function findRouteFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...findRouteFiles(fullPath));
    } else if (entry === "route.ts") {
      files.push(fullPath);
    }
  }

  return files;
}

describe("all API routes are rate-limited", () => {
  const apiDir = path.join(__dirname, "..");
  const routeFiles = findRouteFiles(apiDir);

  it("finds at least one route.ts file (sanity check for the glob itself)", () => {
    expect(routeFiles.length).toBeGreaterThan(0);
  });

  it.each(routeFiles.map((file) => [path.relative(apiDir, file), file]))(
    "%s calls enforceRateLimit()",
    (_relativePath, absolutePath) => {
      const source = readFileSync(absolutePath as string, "utf-8");
      expect(source).toContain("enforceRateLimit(");
    },
  );
});
