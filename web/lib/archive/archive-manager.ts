import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import type { WorldArchive, ArchiveMetadata } from "@/types";

import { withFileLock, writeJsonFileAtomic } from "@/lib/utils/json-file-store";
import { logger } from "@/lib/utils/logger";

/**
 * 世界存档管理器
 *
 * 负责存档的CRUD操作,使用文件系统持久化
 */

const ARCHIVE_DIR = path.join(process.cwd(), "archive", "worlds");
const INDEX_FILE = path.join(process.cwd(), "archive", "index.json");

/**
 * 确保存档目录存在
 */
async function ensureArchiveDir(): Promise<void> {
  await fs.mkdir(ARCHIVE_DIR, { recursive: true });
}

/**
 * 保存世界存档
 *
 * @param archive 世界存档对象
 * @returns 保存的存档ID
 */
export async function saveArchive(archive: WorldArchive): Promise<string> {
  await ensureArchiveDir();

  // 如果没有ID,生成新ID
  if (!archive.id) {
    archive.id = randomUUID();
    archive.created_at = new Date().toISOString();
  }

  // 更新时间戳
  archive.updated_at = new Date().toISOString();

  // 写入存档文件（同一存档 ID 的并发写入串行化 + 原子写，避免半截文件）
  const filePath = path.join(ARCHIVE_DIR, `${archive.id}.json`);
  await withFileLock(filePath, () => writeJsonFileAtomic(filePath, archive));

  // 更新索引
  await updateIndex(archive);

  return archive.id;
}

/**
 * 加载世界存档
 *
 * @param archiveId 存档ID
 * @returns 存档对象,如果不存在返回null
 */
export async function loadArchive(
  archiveId: string,
): Promise<WorldArchive | null> {
  try {
    const filePath = path.join(ARCHIVE_DIR, `${archiveId}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as WorldArchive;
  } catch (error) {
    // ENOENT (存档不存在) 是正常情况，其余错误（JSON 损坏、IO 失败）值得留痕
    if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") {
      logger.error("Failed to load archive", { archiveId, error });
    }
    return null;
  }
}

/**
 * 删除世界存档
 *
 * @param archiveId 存档ID
 * @returns 是否删除成功
 */
export async function deleteArchive(archiveId: string): Promise<boolean> {
  try {
    const filePath = path.join(ARCHIVE_DIR, `${archiveId}.json`);
    await withFileLock(filePath, () => fs.unlink(filePath));

    // 从索引中移除
    await removeFromIndex(archiveId);

    return true;
  } catch (error) {
    logger.error("Failed to delete archive", { archiveId, error });
    return false;
  }
}

/**
 * 列出所有存档的元数据
 *
 * @returns 存档元数据数组,按更新时间降序排列
 */
export async function listArchives(): Promise<ArchiveMetadata[]> {
  try {
    await ensureArchiveDir();

    // 尝试从索引加载
    const index = await loadIndex();
    if (index.length > 0) {
      return index.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    }

    // 如果索引为空,扫描目录
    const files = await fs.readdir(ARCHIVE_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const metadataList: ArchiveMetadata[] = [];

    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(
          path.join(ARCHIVE_DIR, file),
          "utf-8",
        );
        const archive = JSON.parse(content) as WorldArchive;
        metadataList.push(extractMetadata(archive));
      } catch (error) {
        logger.error("Skipping unreadable archive file while rebuilding index", {
          file,
          error,
        });
      }
    }

    // 重建索引
    if (metadataList.length > 0) {
      await saveIndex(metadataList);
    }

    return metadataList.sort((a, b) =>
      b.updated_at.localeCompare(a.updated_at),
    );
  } catch (error) {
    logger.error("Failed to list archives", { error });
    return [];
  }
}

/**
 * 从存档对象提取元数据
 */
function extractMetadata(archive: WorldArchive): ArchiveMetadata {
  // 获取前3条未删除规则的文本
  const previewRules = archive.rules
    .filter((r) => !r.rejected)
    .slice(0, 3)
    .map((r) => r.rule);

  return {
    id: archive.id,
    name: archive.name,
    core_premise: archive.core_premise,
    created_at: archive.created_at,
    updated_at: archive.updated_at,
    rules_count: archive.active_rules_count,
    preview_rules: previewRules,
  };
}

/**
 * 加载索引文件
 */
async function loadIndex(): Promise<ArchiveMetadata[]> {
  try {
    const content = await fs.readFile(INDEX_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * 保存索引文件
 */
async function saveIndex(metadata: ArchiveMetadata[]): Promise<void> {
  await writeJsonFileAtomic(INDEX_FILE, metadata);
}

/**
 * 更新索引 (添加或更新存档元数据)
 *
 * index.json 被所有存档共享，读-改-写整个过程用 withFileLock 串行化，
 * 避免两个并发的保存/删除互相覆盖对方刚写入的条目。
 */
async function updateIndex(archive: WorldArchive): Promise<void> {
  await withFileLock(INDEX_FILE, async () => {
    const index = await loadIndex();
    const metadata = extractMetadata(archive);

    // 查找是否已存在
    const existingIndex = index.findIndex((m) => m.id === archive.id);

    if (existingIndex >= 0) {
      // 更新现有
      index[existingIndex] = metadata;
    } else {
      // 添加新的
      index.push(metadata);
    }

    await saveIndex(index);
  });
}

/**
 * 从索引中移除存档
 */
async function removeFromIndex(archiveId: string): Promise<void> {
  await withFileLock(INDEX_FILE, async () => {
    const index = await loadIndex();
    const filtered = index.filter((m) => m.id !== archiveId);
    await saveIndex(filtered);
  });
}

/**
 * 检查存档是否存在
 */
export async function archiveExists(archiveId: string): Promise<boolean> {
  try {
    const filePath = path.join(ARCHIVE_DIR, `${archiveId}.json`);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 搜索存档 (按核心前提关键词)
 */
export async function searchArchives(
  keyword: string,
): Promise<ArchiveMetadata[]> {
  const allArchives = await listArchives();
  const lowerKeyword = keyword.toLowerCase();

  return allArchives.filter((archive) => {
    return (
      archive.name.toLowerCase().includes(lowerKeyword) ||
      archive.core_premise.toLowerCase().includes(lowerKeyword)
    );
  });
}

/**
 * 获取存档统计信息
 */
export async function getArchiveStats(): Promise<{
  total_archives: number;
  total_rules: number;
  avg_rules_per_archive: number;
}> {
  const archives = await listArchives();

  const totalRules = archives.reduce((sum, a) => sum + a.rules_count, 0);
  const avgRules = archives.length > 0 ? totalRules / archives.length : 0;

  return {
    total_archives: archives.length,
    total_rules: totalRules,
    avg_rules_per_archive: Math.round(avgRules),
  };
}
