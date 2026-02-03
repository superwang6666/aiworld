import { promises as fs } from 'fs';
import path from 'path';

import type { ExpertConfig } from '@/types';

const SPECIAL_EXPERTS_DIR = path.join(process.cwd(), 'lib', 'experts', 'special');

/**
 * 缓存生成的特殊专家以供将来重用
 */
export async function cacheSpecialExpert(expert: ExpertConfig): Promise<void> {
  try {
    // 确保目录存在
    await fs.mkdir(SPECIAL_EXPERTS_DIR, { recursive: true });

    const filePath = path.join(SPECIAL_EXPERTS_DIR, `${expert.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(expert, null, 2), 'utf-8');

    console.log(`已缓存特殊专家: ${expert.id}`);
  } catch (error) {
    console.error('缓存特殊专家时出错:', error);
  }
}

/**
 * 检查缓存中是否存在特殊专家
 */
export async function hasCachedExpert(expertId: string): Promise<boolean> {
  try {
    const filePath = path.join(SPECIAL_EXPERTS_DIR, `${expertId}.json`);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 按领域关键词搜索已缓存的特殊专家
 */
export async function findCachedExpertsByDomain(keywords: string[]): Promise<ExpertConfig[]> {
  try {
    const files = await fs.readdir(SPECIAL_EXPERTS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const experts = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await fs.readFile(path.join(SPECIAL_EXPERTS_DIR, file), 'utf-8');
        return JSON.parse(content) as ExpertConfig;
      })
    );

    // 按领域关键词过滤
    const matches = experts.filter(expert => {
      const domainLower = expert.domain.toLowerCase();
      return keywords.some(kw => domainLower.includes(kw.toLowerCase()));
    });

    return matches;
  } catch (_error) {
    return [];
  }
}
