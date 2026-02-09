import path from "path";

import type { Locale } from "@/types/i18n";

/**
 * Locale 到目录名的映射
 */
const LOCALE_DIR_MAP: Record<Locale, string> = {
  "zh-CN": "cn",
  en: "en",
};

/**
 * 获取专家文件的目录路径
 *
 * @param category - 专家类别 ('core' 或 'special')
 * @param locale - 语言
 * @returns 完整的目录路径
 *
 * @example
 * getExpertsDir('core', 'zh-CN')
 * // => 'D:\\ai-wolrld\\web\\lib\\experts\\core\\cn'
 */
export function getExpertsDir(
  category: "core" | "special",
  locale: Locale,
): string {
  return path.join(
    process.cwd(),
    "lib",
    "experts",
    category,
    LOCALE_DIR_MAP[locale],
  );
}

/**
 * 获取备用语言
 *
 * @param locale - 当前语言
 * @returns 备用语言
 *
 * @example
 * getFallbackLocale('zh-CN') // => 'en'
 * getFallbackLocale('en')    // => 'zh-CN'
 */
export function getFallbackLocale(locale: Locale): Locale {
  return locale === "zh-CN" ? "en" : "zh-CN";
}
