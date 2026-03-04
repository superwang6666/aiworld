import { getRequestConfig } from 'next-intl/server';

import { DEFAULT_LOCALE } from '@/types/i18n';

/**
 * next-intl 配置
 * 应用不使用 locale 路由，始终使用默认语言
 */
export default getRequestConfig(async () => {
  return {
    locale: DEFAULT_LOCALE,
    messages: (await import(`./messages/${DEFAULT_LOCALE}.json`)).default,
  };
});
