/**
 * 七法则配置
 * 统一管理所有法则的中文显示名称和颜色配置
 */

import { Law } from '@/types';

/**
 * 法则定义（包含名称和描述）
 */
export const LAWS = [
  { name: 'Space', description: 'Geography/Physics' },
  { name: 'Survival', description: 'Biology/Needs' },
  { name: 'Cognition', description: 'Language/Belief' },
  { name: 'Scarcity', description: 'Economy/Conflict' },
  { name: 'Time', description: 'History/Erosion' },
  { name: 'Power', description: 'Politics/Order' },
  { name: 'Metaphysics', description: 'The Anomaly' },
] as const;

/**
 * 法则名称数组（仅名称）
 */
export const LAW_NAMES = LAWS.map(law => law.name);

/**
 * 法则名称映射（英文 -> 中文）
 */
export const LAW_NAME_MAP: Record<Law, string> = {
  Space: '空间法则',
  Survival: '生存法则',
  Cognition: '认知法则',
  Scarcity: '稀缺法则',
  Time: '时间法则',
  Power: '权力法则',
  Metaphysics: '形而上学法则',
};

/**
 * 法则颜色配置（用于 ValidationDominoEffect 等组件）
 */
export const LAW_COLORS: Record<Law, {
  border: string;
  hoverBorder: string;
  accent: string;
  glow: string;
}> = {
  Space: {
    border: 'rgba(100, 150, 255, 0.4)',
    hoverBorder: 'rgba(100, 150, 255, 0.6)',
    accent: 'rgba(100, 150, 255, 0.6)',
    glow: '0 0 12px rgba(100, 150, 255, 0.3)',
  },
  Survival: {
    border: 'rgba(100, 200, 120, 0.4)',
    hoverBorder: 'rgba(100, 200, 120, 0.6)',
    accent: 'rgba(100, 200, 120, 0.6)',
    glow: '0 0 12px rgba(100, 200, 120, 0.3)',
  },
  Cognition: {
    border: 'rgba(180, 120, 255, 0.4)',
    hoverBorder: 'rgba(180, 120, 255, 0.6)',
    accent: 'rgba(180, 120, 255, 0.6)',
    glow: '0 0 12px rgba(180, 120, 255, 0.3)',
  },
  Scarcity: {
    border: 'rgba(255, 160, 100, 0.4)',
    hoverBorder: 'rgba(255, 160, 100, 0.6)',
    accent: 'rgba(255, 160, 100, 0.6)',
    glow: '0 0 12px rgba(255, 160, 100, 0.3)',
  },
  Time: {
    border: 'rgba(100, 200, 200, 0.4)',
    hoverBorder: 'rgba(100, 200, 200, 0.6)',
    accent: 'rgba(100, 200, 200, 0.6)',
    glow: '0 0 12px rgba(100, 200, 200, 0.3)',
  },
  Power: {
    border: 'rgba(255, 120, 120, 0.4)',
    hoverBorder: 'rgba(255, 120, 120, 0.6)',
    accent: 'rgba(255, 120, 120, 0.6)',
    glow: '0 0 12px rgba(255, 120, 120, 0.3)',
  },
  Metaphysics: {
    border: 'rgba(255, 220, 100, 0.4)',
    hoverBorder: 'rgba(255, 220, 100, 0.6)',
    accent: 'rgba(255, 220, 100, 0.6)',
    glow: '0 0 12px rgba(255, 220, 100, 0.3)',
  },
};

/**
 * 法则简单颜色配置（用于 LawWeightsPanel 等组件）
 */
export const LAW_SIMPLE_COLORS: Record<Law, string> = {
  Space: 'rgba(100, 150, 255, 0.6)',
  Survival: 'rgba(100, 200, 120, 0.6)',
  Cognition: 'rgba(180, 120, 255, 0.6)',
  Scarcity: 'rgba(255, 160, 100, 0.6)',
  Time: 'rgba(100, 200, 200, 0.6)',
  Power: 'rgba(255, 120, 120, 0.6)',
  Metaphysics: 'rgba(255, 220, 100, 0.6)',
};

/**
 * 获取法则的中文名称
 * @param law 法则英文名
 * @returns 法则中文名
 */
export function getLawName(law: Law): string {
  return LAW_NAME_MAP[law];
}

/**
 * 获取法则的颜色配置
 * @param law 法则英文名
 * @returns 法则颜色配置对象
 */
export function getLawColors(law: Law) {
  return LAW_COLORS[law];
}

/**
 * 获取法则的简单颜色
 * @param law 法则英文名
 * @returns 法则颜色字符串
 */
export function getLawSimpleColor(law: Law): string {
  return LAW_SIMPLE_COLORS[law];
}
