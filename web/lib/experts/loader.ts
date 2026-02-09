import { promises as fs } from "fs";
import path from "path";

import type { ExpertConfig } from "@/types";


import { DEFAULT_LOCALE } from "@/types/i18n";

import { logger } from "@/lib/utils/logger";

import { getExpertsDir, getFallbackLocale } from "./path-utils";

import type { Locale } from "@/types/i18n";

/**
 * 从 JSON 文件加载所有核心专家配置
 *
 * @param locale - 目标语言 (默认: 'zh-CN')
 * @returns 核心专家配置数组
 */
export async function loadCoreExperts(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ExpertConfig[]> {
  const primaryDir = getExpertsDir("core", locale);
  const fallbackDir = getExpertsDir("core", getFallbackLocale(locale));

  let targetDir = primaryDir;
  let actualLocale = locale;

  try {
    await fs.access(primaryDir);
  } catch {
    try {
      await fs.access(fallbackDir);
      targetDir = fallbackDir;
      actualLocale = getFallbackLocale(locale);
      logger.warn("Core experts fallback to alternate locale", {
        requested: locale,
        using: actualLocale,
      });
    } catch {
      logger.error("No core experts directory found for any locale");
      return [];
    }
  }

  try {
    const files = await fs.readdir(targetDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const experts = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await fs.readFile(path.join(targetDir, file), "utf-8");
        const expert = JSON.parse(content) as ExpertConfig;
        expert.locale = actualLocale; // 标记实际加载的语言
        return expert;
      }),
    );

    return experts;
  } catch (error) {
    logger.error("Failed to load core experts", { error });
    return [];
  }
}

/**
 * 根据 ID 加载特定的特殊专家
 *
 * @param expertId - 专家 ID
 * @param locale - 目标语言 (默认: 'zh-CN')
 * @returns 专家配置或 null
 */
export async function loadSpecialExpert(
  expertId: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<ExpertConfig | null> {
  const primaryPath = path.join(
    getExpertsDir("special", locale),
    `${expertId}.json`,
  );
  const fallbackPath = path.join(
    getExpertsDir("special", getFallbackLocale(locale)),
    `${expertId}.json`,
  );

  let targetPath = primaryPath;
  let actualLocale = locale;

  try {
    await fs.access(primaryPath);
  } catch {
    try {
      await fs.access(fallbackPath);
      targetPath = fallbackPath;
      actualLocale = getFallbackLocale(locale);
      logger.warn("Special expert fallback to alternate locale", {
        expertId,
        requested: locale,
        using: actualLocale,
      });
    } catch {
      return null; // 未找到
    }
  }

  try {
    const content = await fs.readFile(targetPath, "utf-8");
    const expert = JSON.parse(content) as ExpertConfig;
    expert.locale = actualLocale;
    return expert;
  } catch (_error) {
    return null;
  }
}

/**
 * 加载所有已缓存的特殊专家
 *
 * @param locale - 目标语言 (默认: 'zh-CN')
 * @returns 特殊专家配置数组
 */
export async function loadAllSpecialExperts(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ExpertConfig[]> {
  const primaryDir = getExpertsDir("special", locale);
  const fallbackDir = getExpertsDir("special", getFallbackLocale(locale));

  let targetDir = primaryDir;
  let actualLocale = locale;

  try {
    await fs.access(primaryDir);
  } catch {
    try {
      await fs.access(fallbackDir);
      targetDir = fallbackDir;
      actualLocale = getFallbackLocale(locale);
      logger.warn("Special experts fallback to alternate locale", {
        requested: locale,
        using: actualLocale,
      });
    } catch {
      return [];
    }
  }

  try {
    const files = await fs.readdir(targetDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const experts = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await fs.readFile(path.join(targetDir, file), "utf-8");
        const expert = JSON.parse(content) as ExpertConfig;
        expert.locale = actualLocale;
        return expert;
      }),
    );

    return experts;
  } catch (_error) {
    return [];
  }
}

/**
 * 根据 ID 获取专家(搜索核心和特殊专家)
 *
 * @param expertId - 专家 ID
 * @param locale - 目标语言 (默认: 'zh-CN')
 * @returns 专家配置或 null
 */
export async function getExpertById(
  expertId: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<ExpertConfig | null> {
  const coreExperts = await loadCoreExperts(locale);
  const coreExpert = coreExperts.find((e) => e.id === expertId);

  if (coreExpert) return coreExpert;

  return await loadSpecialExpert(expertId, locale);
}

