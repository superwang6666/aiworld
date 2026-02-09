/**
 * 服务端翻译工具
 * 用于在 API 路由和服务端代码中获取翻译文本
 */

import en from '@/messages/en.json';
import zhCN from '@/messages/zh-CN.json';

import type { Locale } from '@/types/i18n';

/**
 * 获取服务端翻译文本
 *
 * @param namespace 命名空间 (如 'Validation', 'Tags')
 * @param key 翻译键
 * @param locale 语言 (默认 'zh-CN')
 * @param params 参数对象，用于替换文本中的占位符 {paramName}
 * @returns 翻译后的文本
 *
 * @example
 * getServerTranslation('Validation', 'expertAnalysisTimeout', 'en')
 * // => "Expert analysis timeout, please switch to fast mode or try again later"
 *
 * @example
 * getServerTranslation('Validation', 'similarity', 'zh-CN', { value: 85 })
 * // => "相似度: 85"
 */
export function getServerTranslation(
  namespace: string,
  key: string,
  locale: Locale = 'zh-CN',
  params?: Record<string, any>
): string {
  const translations = locale === 'zh-CN' ? zhCN : en;
  let text = (translations as any)[namespace]?.[key] || key;

  // 参数插值 - 替换 {paramName} 格式的占位符
  if (params) {
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(params[param]));
    });
  }

  return text;
}

/**
 * 获取标签名称的翻译
 *
 * @param tagId 标签ID (如 'brutal', 'hopeful')
 * @param locale 语言
 * @returns 翻译后的标签名称
 */
export function getTagName(tagId: string, locale: Locale = 'zh-CN'): string {
  return getServerTranslation('Tags', tagId, locale);
}

/**
 * 获取标签类别名称的翻译
 *
 * @param category 类别 (如 'tone', 'mechanism')
 * @param locale 语言
 * @returns 翻译后的类别名称
 */
export function getCategoryLabel(category: string, locale: Locale = 'zh-CN'): string {
  return getServerTranslation('Tags', category, locale);
}

/**
 * 获取标签类别描述的翻译
 *
 * @param category 类别 (如 'tone', 'mechanism')
 * @param locale 语言
 * @returns 翻译后的类别描述
 */
export function getCategoryDescription(category: string, locale: Locale = 'zh-CN'): string {
  return getServerTranslation('Tags', `${category}Description`, locale);
}
