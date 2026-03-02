/**
 * AI Prompt Loader Utility
 * 用于在 API 路由中加载国际化的 AI 提示词
 */

import en from '@/messages/en.json';
import zhCN from '@/messages/zh-CN.json';

import type { Locale } from '@/types/i18n';

/**
 * 从 i18n 消息文件加载 AI 提示词
 *
 * @param key - AIPrompts 命名空间内的点分隔键 (如 "generateSingle.system")
 * @param locale - 目标语言
 * @param params - 可选的插值参数
 * @returns 本地化的提示词字符串
 *
 * @example
 * loadPrompt('generateSingle.system', 'zh-CN', {
 *   lawName: '空间法则',
 *   lawDescription: '地理和物理规则'
 * })
 *
 * @example
 * loadPrompt('validatePremise.user', 'en', {
 *   corePremise: 'Gravity reverses every full moon'
 * })
 */
export function loadPrompt(
  key: string,
  locale: Locale,
  params?: Record<string, string>
): string {
  const translations = locale === 'zh-CN' ? zhCN : en;

  // 支持嵌套键，如 "generateSingle.system"
  const parts = key.split('.');
  let value: any = translations.AIPrompts;

  for (const part of parts) {
    value = value?.[part];
  }

  if (typeof value !== 'string') {
    console.warn(`[prompt-loader] Prompt not found: AIPrompts.${key} for locale ${locale}`);
    return key; // 回退到键名
  }

  // 参数插值 - 替换 {paramName} 格式的占位符
  if (params) {
    let result = value;
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
    }
    return result;
  }

  return value;
}

/**
 * 加载生成单条规则的提示词
 *
 * @param locale - 目标语言
 * @param lawName - 法则名称
 * @param lawDescription - 法则描述
 * @returns 系统提示词和用户提示词模板
 */
export function loadGenerateSinglePrompts(
  locale: Locale,
  lawName: string,
  lawDescription: string
) {
  return {
    system: loadPrompt('generateSingle.system', locale, {
      lawName,
      lawDescription,
    }),
    userTemplate: (corePremise: string, artStyle: string) =>
      loadPrompt('generateSingle.user', locale, {
        corePremise,
        artStyle,
      }),
  };
}

/**
 * 加载验证前提的提示词
 *
 * @param locale - 目标语言
 * @returns 系统提示词和用户提示词模板
 */
export function loadValidatePremisePrompts(locale: Locale) {
  return {
    system: loadPrompt('validatePremise.system', locale),
    userTemplate: (corePremise: string) =>
      loadPrompt('validatePremise.user', locale, {
        corePremise,
      }),
  };
}

/**
 * 加载生成规则的提示词（基础或加权）
 *
 * @param locale - 目标语言
 * @param weighted - 是否使用加权提示词
 * @param weightDistribution - 权重分布字符串（仅加权模式）
 * @param expertInsights - 专家洞察字符串（仅深度模式）
 * @returns 系统提示词和用户提示词模板
 */
export function loadGeneratePrompts(
  locale: Locale,
  weighted: boolean = false,
  weightDistribution?: string,
  expertInsights?: string
) {
  let systemPrompt: string;

  if (weighted && weightDistribution) {
    systemPrompt = loadPrompt('generate.weightedSystem', locale, {
      weightDistribution,
    });

    // 如果有专家洞察，添加专家洞察部分
    if (expertInsights) {
      const expertHeader = loadPrompt('generate.expertInsightsHeader', locale, {
        insights: expertInsights,
      });
      systemPrompt = systemPrompt.replace('{expertInsightsSection}', expertHeader);
    } else {
      systemPrompt = systemPrompt.replace('{expertInsightsSection}', '');
    }
  } else {
    systemPrompt = loadPrompt('generate.baseSystem', locale);
  }

  return {
    system: systemPrompt,
    userTemplate: (corePremise: string, artStyle: string) =>
      loadPrompt('generate.user', locale, {
        corePremise,
        artStyle,
      }),
  };
}

/**
 * 加载游戏分析提示词
 *
 * @param locale - 目标语言
 * @returns 系统提示词和用户提示词模板
 */
export function loadAnalyzeGamesPrompts(locale: Locale) {
  return {
    system: loadPrompt('analyzeGames.system', locale),
    userTemplate: (gamesDescription: string) =>
      loadPrompt('analyzeGames.user', locale, {
        gamesDescription,
      }),
  };
}

/**
 * 加载游戏推荐提示词
 *
 * @param locale - 目标语言
 * @returns 系统提示词和用户提示词模板
 */
export function loadRecommendGamesPrompts(locale: Locale) {
  return {
    system: loadPrompt('recommendGames.system', locale),
    userTemplate: (anomalyDescription: string) =>
      loadPrompt('recommendGames.user', locale, {
        anomalyDescription,
      }),
  };
}

/**
 * 加载世界观整合（用户描述 + AI 摘要）的提示词
 */
export function loadMergePremisePrompts(locale: Locale) {
  return {
    system: loadPrompt('mergePremise.system', locale),
    userTemplate: (
      userWorld: string,
      aiSummary: string,
      existingDraft: string
    ) =>
      loadPrompt('mergePremise.user', locale, {
        userWorld,
        aiSummary,
        existingDraft,
      }),
  };
}

/**
 * 加载方向评估提示词
 *
 * @param locale - 目标语言
 * @returns 系统提示词和用户提示词模板
 */
export function loadEvaluateDirectionsPrompts(locale: Locale) {
  return {
    system: loadPrompt('evaluateDirections.system', locale),
    userTemplate: (lawImpactsJson: string) =>
      loadPrompt('evaluateDirections.user', locale, {
        lawImpactsJson,
      }),
  };
}

/**
 * 加载综合分析提示词
 *
 * @param locale - 目标语言
 * @returns 系统提示词和用户提示词模板
 */
export function loadSynthesizePrompts(locale: Locale) {
  return {
    system: loadPrompt('synthesize.system', locale),
    userTemplate: (
      heterogeneityPoint: string,
      mathInsightsSection: string,
      expertAnalyses: string,
      emergentNote: string = ''
    ) =>
      loadPrompt('synthesize.user', locale, {
        heterogeneityPoint,
        mathInsightsSection,
        expertAnalyses,
        emergentNote,
      }),
  };
}
