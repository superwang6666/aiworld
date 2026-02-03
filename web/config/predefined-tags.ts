import type { RuleTag } from '@/types';

/**
 * 预定义核心标签列表
 *
 * 这些标签将作为规则自动打标签的基础,分为4大类别:
 * - tone: 情感基调
 * - mechanism: 机制特性
 * - narrative: 叙事逻辑
 * - logic: 逻辑结构
 */
export const PREDEFINED_TAGS: RuleTag[] = [
  // ========== 情感基调类 (Tone) ==========
  {
    id: 'brutal',
    name: '残酷',
    category: 'tone',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'hopeful',
    name: '希望',
    category: 'tone',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'mysterious',
    name: '神秘',
    category: 'tone',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'absurd',
    name: '荒诞',
    category: 'tone',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'dark',
    name: '黑暗',
    category: 'tone',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'whimsical',
    name: '奇幻',
    category: 'tone',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },

  // ========== 机制特性类 (Mechanism) ==========
  {
    id: 'cyclic',
    name: '循环',
    category: 'mechanism',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'irreversible',
    name: '不可逆',
    category: 'mechanism',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'cascading',
    name: '连锁',
    category: 'mechanism',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'resource_based',
    name: '资源依赖',
    category: 'mechanism',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'time_sensitive',
    name: '时间敏感',
    category: 'mechanism',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'accumulative',
    name: '累积',
    category: 'mechanism',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'threshold_based',
    name: '阈值触发',
    category: 'mechanism',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },

  // ========== 叙事逻辑类 (Narrative) ==========
  {
    id: 'paradox',
    name: '矛盾',
    category: 'narrative',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'emergent',
    name: '浮现',
    category: 'narrative',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'hierarchical',
    name: '层级',
    category: 'narrative',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'distributed',
    name: '分布式',
    category: 'narrative',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'symbolic',
    name: '象征',
    category: 'narrative',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },

  // ========== 逻辑结构类 (Logic) ==========
  {
    id: 'causal',
    name: '因果',
    category: 'logic',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'probabilistic',
    name: '概率',
    category: 'logic',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'deterministic',
    name: '决定论',
    category: 'logic',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'conditional',
    name: '条件',
    category: 'logic',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
  {
    id: 'reciprocal',
    name: '互惠',
    category: 'logic',
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: 'predefined',
  },
];

/**
 * 标签类别显示配置
 */
export const TAG_CATEGORY_CONFIG = {
  tone: {
    label: '情感基调',
    color: 'purple',
    description: '规则给人的情感感受',
  },
  mechanism: {
    label: '机制特性',
    color: 'blue',
    description: '规则的运作方式',
  },
  narrative: {
    label: '叙事逻辑',
    color: 'green',
    description: '规则的叙事结构',
  },
  logic: {
    label: '逻辑结构',
    color: 'orange',
    description: '规则的逻辑模式',
  },
} as const;

/**
 * 获取所有预定义标签的ID列表
 */
export function getAllPredefinedTagIds(): string[] {
  return PREDEFINED_TAGS.map((tag) => tag.id);
}

/**
 * 根据ID查找预定义标签
 */
export function getPredefinedTagById(id: string): RuleTag | undefined {
  return PREDEFINED_TAGS.find((tag) => tag.id === id);
}

/**
 * 根据类别获取标签
 */
export function getTagsByCategory(category: RuleTag['category']): RuleTag[] {
  return PREDEFINED_TAGS.filter((tag) => tag.category === category);
}
