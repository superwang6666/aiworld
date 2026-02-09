import { promises as fs } from "fs";
import path from "path";

import type { ExpertConfig } from "@/types";


import { DEFAULT_LOCALE } from "@/types/i18n";

import { getExpertsDir } from "@/lib/experts/path-utils";
import { logger } from "@/lib/utils/logger";

import type { Locale } from "@/types/i18n";

/**
 * 缓存生成的特殊专家以供将来重用
 *
 * @param expert - 专家配置
 * @param locale - 目标语言 (默认: 'zh-CN')
 */
export async function cacheSpecialExpert(
  expert: ExpertConfig,
  locale: Locale = DEFAULT_LOCALE,
): Promise<void> {
  try {
    const targetDir = getExpertsDir("special", locale);

    // 确保目录存在
    await fs.mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, `${expert.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(expert, null, 2), "utf-8");

    logger.info("Cached special expert", { expertId: expert.id, locale });
  } catch (error) {
    logger.error("Failed to cache special expert", {
      expertId: expert.id,
      locale,
      error,
    });
  }
}

/**
 * 检查缓存中是否存在特殊专家
 *
 * @param expertId - 专家 ID
 * @param locale - 目标语言 (默认: 'zh-CN')
 * @returns 是否存在
 */
export async function hasCachedExpert(
  expertId: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<boolean> {
  try {
    const targetDir = getExpertsDir("special", locale);
    const filePath = path.join(targetDir, `${expertId}.json`);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 按领域关键词搜索已缓存的特殊专家
 *
 * @param keywords - 关键词数组
 * @param locale - 目标语言 (默认: 'zh-CN')
 * @returns 匹配的专家配置数组
 */
export async function findCachedExpertsByDomain(
  keywords: string[],
  locale: Locale = DEFAULT_LOCALE,
): Promise<ExpertConfig[]> {
  try {
    const targetDir = getExpertsDir("special", locale);
    const files = await fs.readdir(targetDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const experts = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await fs.readFile(
          path.join(targetDir, file),
          "utf-8",
        );
        const expert = JSON.parse(content) as ExpertConfig;
        expert.locale = locale;
        return expert;
      }),
    );

    // 按领域关键词过滤
    const matches = experts.filter((expert) => {
      const domainLower = expert.domain.toLowerCase();
      return keywords.some((kw) => domainLower.includes(kw.toLowerCase()));
    });

    return matches;
  } catch (_error) {
    return [];
  }
}

