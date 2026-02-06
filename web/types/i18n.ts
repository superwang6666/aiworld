/**
 * 国际化类型定义
 * 定义支持的语言类型和相关配置
 */

/**
 * 支持的语言类型
 * zh-CN: 简体中文
 * en: 英文
 */
export type Locale = 'zh-CN' | 'en';

/**
 * 所有支持的语言列表
 */
export const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en'];

/**
 * 默认语言
 */
export const DEFAULT_LOCALE: Locale = 'zh-CN';

/**
 * 语言显示名称映射
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'en': 'English',
};

/**
 * 语言简称映射（用于按钮显示）
 */
export const LOCALE_SHORT_NAMES: Record<Locale, string> = {
  'zh-CN': '中',
  'en': 'EN',
};
