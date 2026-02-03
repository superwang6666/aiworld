import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

import type { WorldArchive, ArchiveMetadata } from '@/types';

/**
 * 世界存档管理器
 *
 * 负责存档的CRUD操作,使用文件系统持久化
 */

const ARCHIVE_DIR = path.join(process.cwd(), 'archive', 'worlds');
const INDEX_FILE = path.join(process.cwd(), 'archive', 'index.json');

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

  // 写入存档文件
  const filePath = path.join(ARCHIVE_DIR, `${archive.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(archive, null, 2), 'utf-8');

  // 更新索引
  await updateIndex(archive);

  console.log(`存档已保存: ${archive.id} - ${archive.name}`);
  return archive.id;
}

/**
 * 加载世界存档
 *
 * @param archiveId 存档ID
 * @returns 存档对象,如果不存在返回null
 */
export async function loadArchive(archiveId: string): Promise<WorldArchive | null> {
  try {
    const filePath = path.join(ARCHIVE_DIR, `${archiveId}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as WorldArchive;
  } catch (error) {
    console.error(`加载存档失败: ${archiveId}`, error);
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
    await fs.unlink(filePath);

    // 从索引中移除
    await removeFromIndex(archiveId);

    console.log(`存档已删除: ${archiveId}`);
    return true;
  } catch (error) {
    console.error(`删除存档失败: ${archiveId}`, error);
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
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const metadataList: ArchiveMetadata[] = [];

    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(ARCHIVE_DIR, file), 'utf-8');
        const archive = JSON.parse(content) as WorldArchive;
        metadataList.push(extractMetadata(archive));
      } catch (error) {
        console.error(`读取存档失败: ${file}`, error);
      }
    }

    // 重建索引
    if (metadataList.length > 0) {
      await saveIndex(metadataList);
    }

    return metadataList.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  } catch (error) {
    console.error('列出存档失败:', error);
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
    const content = await fs.readFile(INDEX_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * 保存索引文件
 */
async function saveIndex(metadata: ArchiveMetadata[]): Promise<void> {
  await fs.mkdir(path.dirname(INDEX_FILE), { recursive: true });
  await fs.writeFile(INDEX_FILE, JSON.stringify(metadata, null, 2), 'utf-8');
}

/**
 * 更新索引 (添加或更新存档元数据)
 */
async function updateIndex(archive: WorldArchive): Promise<void> {
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
}

/**
 * 从索引中移除存档
 */
async function removeFromIndex(archiveId: string): Promise<void> {
  const index = await loadIndex();
  const filtered = index.filter((m) => m.id !== archiveId);
  await saveIndex(filtered);
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
export async function searchArchives(keyword: string): Promise<ArchiveMetadata[]> {
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
