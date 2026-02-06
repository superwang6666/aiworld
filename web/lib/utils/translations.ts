import { useTranslations } from 'next-intl';

/**
 * 通用翻译 Hook
 * 提供便捷的翻译访问方法
 */
export function useCommonTranslations() {
  const t = useTranslations('Common');
  const tHome = useTranslations('HomePage');
  const tAuth = useTranslations('Auth');
  const tValidation = useTranslations('Validation');
  const tLaws = useTranslations('Laws');
  const tArchive = useTranslations('Archive');
  const tRules = useTranslations('Rules');

  return {
    common: t,
    home: tHome,
    auth: tAuth,
    validation: tValidation,
    laws: tLaws,
    archive: tArchive,
    rules: tRules,
  };
}

/**
 * 获取翻译文本的辅助函数
 * 用于非组件环境（如工具函数）
 */
export function getTranslationKey(namespace: string, key: string): string {
  return `${namespace}.${key}`;
}
