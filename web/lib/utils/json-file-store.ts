import { promises as fs } from "fs";
import path from "path";

/**
 * 轻量 JSON 文件存储工具
 *
 * archive-manager / user-service 都是"读整个文件 -> 内存改 -> 整体覆写"的
 * 文件系统持久化方案。这个读改写序列本身不是原子的：同一个 Node 进程内，
 * 两个并发请求（比如同时注册、同时保存存档）交替执行 await 之间就可能互相
 * 覆盖对方的写入。这里提供两个基础能力来缩小这个问题：
 *
 * 1. withFileLock: 把同一文件路径的操作串行化，避免并发读改写互相覆盖。
 *    只在单个进程内生效——多实例部署仍然需要真正的数据库。
 * 2. writeJsonFileAtomic: 先写临时文件再 rename，避免进程崩溃/写入中断时
 *    留下损坏的半截 JSON 文件。
 */

const locks = new Map<string, Promise<void>>();

export async function withFileLock<T>(
  filePath: string,
  fn: () => Promise<T>,
): Promise<T> {
  const key = path.resolve(filePath);
  const prior = locks.get(key) ?? Promise.resolve();

  let releaseNext!: () => void;
  const next = new Promise<void>((resolve) => {
    releaseNext = resolve;
  });
  locks.set(key, prior.then(() => next));

  await prior;
  try {
    return await fn();
  } finally {
    releaseNext();
  }
}

export async function writeJsonFileAtomic(
  filePath: string,
  data: unknown,
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  const tmpPath = path.join(
    dir,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
  );

  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmpPath, filePath);
}
