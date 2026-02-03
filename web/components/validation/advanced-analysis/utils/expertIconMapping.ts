import {
  User,
  TrendingUp,
  Globe,
  BookOpen,
  MessageSquare,
  Shield,
  Atom,
  Mountain,
  Brain,
  type LucideIcon
} from 'lucide-react';

/**
 * 专家领域到图标的映射
 */
export const DOMAIN_ICON_MAP: Record<string, LucideIcon> = {
  "人类学与社会学": User,
  "经济学": TrendingUp,
  "地质学与气候学": Globe,
  "历史学与考古学": BookOpen,
  "语言学": MessageSquare,
  "政治学与军事学": Shield,
  "物理学": Atom,
  "生物学": Mountain,
  "心理学": Brain,
};

/**
 * 专家领域到颜色的映射
 */
export const DOMAIN_COLOR_MAP: Record<string, string> = {
  "人类学与社会学": "#7dd3fc",
  "经济学": "#fbbf24",
  "地质学与气候学": "#34d399",
  "历史学与考古学": "#a78bfa",
  "语言学": "#fb923c",
  "政治学与军事学": "#f87171",
  "物理学": "#22d3ee",
  "生物学": "#10b981",
  "心理学": "#8b5cf6",
};

/**
 * 根据专家领域获取对应的图标
 * @param domain 专家领域
 * @returns Lucide图标组件
 */
export function getIconForDomain(domain: string): LucideIcon {
  return DOMAIN_ICON_MAP[domain] || User;
}

/**
 * 根据专家领域获取对应的颜色
 * @param domain 专家领域
 * @returns 颜色十六进制字符串
 */
export function getColorForDomain(domain: string): string {
  return DOMAIN_COLOR_MAP[domain] || "#7dd3fc";
}
