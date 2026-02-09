import type { LawWeight, ExpertResponse, DEACAnalysis } from '@/types';

import { getLawName, LAW_COLORS } from '@/config/law-names';

import { DEFAULT_LOCALE, type Locale } from '@/types/i18n';

import { getIconForDomain, getColorForDomain, getDomainLabel } from './expertIconMapping';
import { getLawGradient } from './lawGradients';

import type { LucideIcon } from 'lucide-react';

/**
 * 法则权重卡片数据结构
 */
export interface LawWeightCardData {
  name: string;
  percentage: number;
  color: string;
  borderColor: string;
  rules: number;
}

/**
 * 专家卡片数据结构
 */
export interface ExpertCardData {
  name: string;
  field: string;
  icon: LucideIcon;
  iconColor: string;
  opinion: string;
  warning: string;
  suggestion: string;
}

const WARNING_FALLBACK: Record<Locale, string> = {
  'zh-CN': '暂无警告',
  en: 'No warnings provided',
};

const SUGGESTION_FALLBACK: Record<Locale, string> = {
  'zh-CN': '暂无建议',
  en: 'No suggestions provided',
};

/**
 * 将LawWeight数组转换为UI所需的数据格式
 * @param lawWeights 法则权重数组
 * @param locale 语言代码（可选，默认使用中文）
 * @returns 法则权重卡片数据数组
 */
export function adaptLawWeights(lawWeights: LawWeight[], locale: Locale = DEFAULT_LOCALE): LawWeightCardData[] {
  return lawWeights.map(lw => ({
    name: getLawName(lw.law, locale),
    percentage: Math.round(lw.weight * 100),
    color: getLawGradient(lw.law),
    borderColor: LAW_COLORS[lw.law].border,
    rules: lw.rulesCount
  }));
}

/**
 * 将ExpertResponse转换为UI所需的数据格式
 * @param response 专家响应数据
 * @returns 专家卡片数据
 */
export function adaptExpertResponse(response: ExpertResponse, locale: Locale = DEFAULT_LOCALE): ExpertCardData {
  return {
    name: response.expert_name,
    field: getDomainLabel(response.domain, locale),
    icon: getIconForDomain(response.domain),
    iconColor: getColorForDomain(response.domain),
    opinion: response.analysis,
    warning: response.warnings?.[0] || WARNING_FALLBACK[locale],
    suggestion: response.suggestions?.[0] || SUGGESTION_FALLBACK[locale]
  };
}

/**
 * 将DEACAnalysis转换为UI所需的数据格式
 * @param analysis DEAC分析数据
 * @returns 适配后的数据或null
 */
export function adaptDEACAnalysis(analysis: DEACAnalysis | null, locale: Locale = DEFAULT_LOCALE) {
  if (!analysis) return null;

  return {
    experts: analysis.expert_responses.map(response => adaptExpertResponse(response, locale)),
    synthesis: {
      consensus: analysis.synthesis.consensus,
      insights: analysis.synthesis.emergent_insights,
      riskAssessment: analysis.synthesis.risk_assessment
    }
  };
}
