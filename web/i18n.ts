import { getRequestConfig } from 'next-intl/server';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/types/i18n';

import type { Locale} from '@/types/i18n';

/**
 * next-intl 配置
 * 用于加载翻译文件和设置默认语言
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // 获取请求的语言，如果不支持则使用默认语言
  let locale = await requestLocale;

  // 验证语言是否支持
  if (!locale || !SUPPORTED_LOCALES.includes(locale as Locale)) {
    locale = DEFAULT_LOCALE;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
