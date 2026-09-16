import type { Locale } from '@/types/i18n';

/**
 * API 请求配置接口
 */
interface ApiRequestConfig extends RequestInit {
  locale?: Locale;
}

/**
 * 带语言支持的 API 调用工具函数
 * 自动在请求体中添加当前语言设置
 *
 * @param url API 端点 URL
 * @param config 请求配置（包含可选的 locale 参数）
 * @returns Promise<Response>
 */
export async function fetchWithLocale(
  url: string,
  config: ApiRequestConfig = {}
): Promise<Response> {
  const { locale, body, ...restConfig } = config;

  // 如果没有提供 locale，尝试从 localStorage 获取
  const currentLocale = locale || (
    typeof window !== 'undefined'
      ? (localStorage.getItem('app-locale') as Locale) || 'zh-CN'
      : 'zh-CN'
  );

  // 如果有 body，将 locale 添加到请求体中
  let finalBody = body;
  if (body) {
    try {
      const bodyObj = typeof body === 'string' ? JSON.parse(body) : body;
      finalBody = JSON.stringify({
        ...bodyObj,
        locale: currentLocale,
      });
    } catch (error) {
      // 如果解析失败，保持原样
      console.warn('Failed to parse request body:', error);
    }
  }

  return fetch(url, {
    ...restConfig,
    body: finalBody,
    headers: {
      'Content-Type': 'application/json',
      ...restConfig.headers,
    },
  });
}

/**
 * POST 请求的便捷方法
 *
 * @param url API 端点 URL
 * @param data 请求数据
 * @param locale 语言代码（可选）
 * @returns Promise<Response>
 */
export async function postWithLocale<T = unknown>(
  url: string,
  data: T,
  locale?: Locale
): Promise<Response> {
  return fetchWithLocale(url, {
    method: 'POST',
    body: JSON.stringify(data),
    locale,
  });
}

/**
 * 获取当前语言设置
 *
 * @returns 当前语言代码
 */
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'zh-CN';
  }
  return (localStorage.getItem('app-locale') as Locale) || 'zh-CN';
}
