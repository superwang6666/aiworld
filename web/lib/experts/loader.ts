import { promises as fs } from 'fs';
import path from 'path';

import type { ExpertConfig } from '@/types';

const CORE_EXPERTS_DIR = path.join(process.cwd(), 'lib', 'experts', 'core');
const SPECIAL_EXPERTS_DIR = path.join(process.cwd(), 'lib', 'experts', 'special');

/**
 * 从 JSON 文件加载所有核心专家配置
 */
export async function loadCoreExperts(): Promise<ExpertConfig[]> {
  try {
    const files = await fs.readdir(CORE_EXPERTS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const experts = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await fs.readFile(path.join(CORE_EXPERTS_DIR, file), 'utf-8');
        return JSON.parse(content) as ExpertConfig;
      })
    );

    return experts;
  } catch (error) {
    console.error('加载核心专家时出错:', error);
    return [];
  }
}

/**
 * 根据 ID 加载特定的特殊专家
 */
export async function loadSpecialExpert(expertId: string): Promise<ExpertConfig | null> {
  try {
    const filePath = path.join(SPECIAL_EXPERTS_DIR, `${expertId}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as ExpertConfig;
  } catch (_error) {
    return null; // 未找到
  }
}

/**
 * 加载所有已缓存的特殊专家
 */
export async function loadAllSpecialExperts(): Promise<ExpertConfig[]> {
  try {
    const files = await fs.readdir(SPECIAL_EXPERTS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const experts = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await fs.readFile(path.join(SPECIAL_EXPERTS_DIR, file), 'utf-8');
        return JSON.parse(content) as ExpertConfig;
      })
    );

    return experts;
  } catch (_error) {
    return [];
  }
}

/**
 * 根据 ID 获取专家(搜索核心和特殊专家)
 */
export async function getExpertById(expertId: string): Promise<ExpertConfig | null> {
  const coreExperts = await loadCoreExperts();
  const coreExpert = coreExperts.find(e => e.id === expertId);

  if (coreExpert) return coreExpert;

  return await loadSpecialExpert(expertId);
}
