import type { RuleTag } from '@/types';

import { PREDEFINED_TAGS } from '@/config/predefined-tags';

/**
 * 标签权重管理器
 *
 * 负责标签权重的更新、持久化和查询
 */

// 权重调整参数
const DECAY_FACTOR = 0.9; // 删除时权重衰减因子 (降低10%)
const BOOST_RATE = 0.05; // 确认时权重提升率 (提升5%)
const MIN_WEIGHT = 0.1; // 最低权重保护
const MAX_WEIGHT = 0.95; // 最高权重上限

/**
 * 初始化标签权重映射
 * 从预定义标签创建初始权重映射
 */
export function initializeTagWeights(): Record<string, RuleTag> {
  const weights: Record<string, RuleTag> = {};

  PREDEFINED_TAGS.forEach((tag) => {
    weights[tag.id] = { ...tag }; // 深拷贝
  });

  return weights;
}

/**
 * 当用户删除规则时更新标签权重
 * 规则被删除 = 用户不喜欢这类标签 -> 降低权重
 *
 * @param tags 被删除规则的标签ID数组
 * @param currentWeights 当前标签权重映射
 * @returns 更新后的标签权重映射
 */
export function updateTagWeightsOnDeletion(
  tags: string[],
  currentWeights: Record<string, RuleTag>
): Record<string, RuleTag> {
  const updated = { ...currentWeights };

  tags.forEach((tagId) => {
    if (updated[tagId]) {
      // 增加删除计数
      updated[tagId] = {
        ...updated[tagId],
        deletion_count: updated[tagId].deletion_count + 1,
        // 应用权重衰减,但不低于最小值
        weight: Math.max(updated[tagId].weight * DECAY_FACTOR, MIN_WEIGHT),
      };
    }
  });

  return updated;
}

/**
 * 当用户确认规则时提升标签权重
 * 规则被确认 = 用户喜欢这类标签 -> 提升权重
 *
 * @param tags 被确认规则的标签ID数组
 * @param currentWeights 当前标签权重映射
 * @returns 更新后的标签权重映射
 */
export function updateTagWeightsOnConfirm(
  tags: string[],
  currentWeights: Record<string, RuleTag>
): Record<string, RuleTag> {
  const updated = { ...currentWeights };

  tags.forEach((tagId) => {
    if (updated[tagId]) {
      const oldWeight = updated[tagId].weight;

      // 增加使用计数
      updated[tagId] = {
        ...updated[tagId],
        usage_count: updated[tagId].usage_count + 1,
        // 应用权重提升: new_weight = old + (1 - old) * boost_rate
        // 这样越接近1,增长越慢,避免过快达到上限
        weight: Math.min(oldWeight + (1 - oldWeight) * BOOST_RATE, MAX_WEIGHT),
      };
    }
  });

  return updated;
}

/**
 * 合并新生成的LLM标签到权重映射
 *
 * @param llmTags LLM生成的新标签数组
 * @param currentWeights 当前标签权重映射
 * @returns 更新后的标签权重映射
 */
export function mergeNewTags(
  llmTags: RuleTag[],
  currentWeights: Record<string, RuleTag>
): Record<string, RuleTag> {
  const updated = { ...currentWeights };

  llmTags.forEach((tag) => {
    if (!updated[tag.id]) {
      // 新标签,直接添加
      updated[tag.id] = tag;
    } else {
      // 标签已存在,增加使用计数
      updated[tag.id] = {
        ...updated[tag.id],
        usage_count: updated[tag.id].usage_count + 1,
      };
    }
  });

  return updated;
}

/**
 * 根据权重排序标签
 *
 * @param tagIds 标签ID数组
 * @param weights 标签权重映射
 * @returns 按权重降序排列的标签ID数组
 */
export function sortTagsByWeight(tagIds: string[], weights: Record<string, RuleTag>): string[] {
  return [...tagIds].sort((a, b) => {
    const weightA = weights[a]?.weight || 0.5;
    const weightB = weights[b]?.weight || 0.5;
    return weightB - weightA; // 降序
  });
}

/**
 * 获取低权重标签 (可能被用户不喜欢的标签)
 *
 * @param weights 标签权重映射
 * @param threshold 权重阈值 (默认0.3)
 * @returns 低权重标签ID数组
 */
export function getLowWeightTags(
  weights: Record<string, RuleTag>,
  threshold: number = 0.3
): string[] {
  return Object.keys(weights).filter((tagId) => {
    return weights[tagId].weight < threshold;
  });
}

/**
 * 获取高权重标签 (用户偏好的标签)
 *
 * @param weights 标签权重映射
 * @param threshold 权重阈值 (默认0.7)
 * @returns 高权重标签ID数组
 */
export function getHighWeightTags(
  weights: Record<string, RuleTag>,
  threshold: number = 0.7
): string[] {
  return Object.keys(weights).filter((tagId) => {
    return weights[tagId].weight > threshold;
  });
}

/**
 * 计算标签的删除率 (deletion_count / usage_count)
 * 删除率高 = 用户经常删除带此标签的规则
 *
 * @param tag 标签对象
 * @returns 删除率 (0-1)
 */
export function calculateTagDeletionRate(tag: RuleTag): number {
  if (tag.usage_count === 0) return 0;
  return tag.deletion_count / tag.usage_count;
}

/**
 * 获取最不受欢迎的标签 (按删除率排序)
 *
 * @param weights 标签权重映射
 * @param limit 返回数量限制
 * @returns 按删除率降序排列的标签数组
 */
export function getMostDislikedTags(weights: Record<string, RuleTag>, limit: number = 10): RuleTag[] {
  const tagsWithStats = Object.values(weights)
    .filter((tag) => tag.usage_count > 0) // 至少被使用过一次
    .map((tag) => ({
      ...tag,
      deletion_rate: calculateTagDeletionRate(tag),
    }))
    .sort((a, b) => b.deletion_rate - a.deletion_rate); // 按删除率降序

  return tagsWithStats.slice(0, limit);
}

/**
 * 重置所有标签权重到初始状态 (0.5)
 * 用于长期使用后权重极化时的重置
 *
 * @param currentWeights 当前标签权重映射
 * @returns 重置后的标签权重映射
 */
export function resetTagWeights(currentWeights: Record<string, RuleTag>): Record<string, RuleTag> {
  const reset: Record<string, RuleTag> = {};

  Object.keys(currentWeights).forEach((tagId) => {
    reset[tagId] = {
      ...currentWeights[tagId],
      weight: 0.5, // 重置权重
      // 保留统计数据,不清零
    };
  });

  return reset;
}

/**
 * 导出标签权重快照 (用于存档)
 *
 * @param weights 标签权重映射
 * @returns 简化的权重快照对象
 */
export function exportTagWeightsSnapshot(
  weights: Record<string, RuleTag>
): Record<string, { weight: number; usage: number; deletions: number }> {
  const snapshot: Record<string, { weight: number; usage: number; deletions: number }> = {};

  Object.keys(weights).forEach((tagId) => {
    const tag = weights[tagId];
    snapshot[tagId] = {
      weight: tag.weight,
      usage: tag.usage_count,
      deletions: tag.deletion_count,
    };
  });

  return snapshot;
}

/**
 * 从快照恢复标签权重 (用于加载存档)
 *
 * @param snapshot 标签权重快照
 * @param baseWeights 基础标签权重映射 (通常是初始化的预定义标签)
 * @returns 恢复后的标签权重映射
 */
export function restoreTagWeightsFromSnapshot(
  snapshot: Record<string, { weight: number; usage: number; deletions: number }>,
  baseWeights: Record<string, RuleTag>
): Record<string, RuleTag> {
  const restored: Record<string, RuleTag> = { ...baseWeights };

  Object.keys(snapshot).forEach((tagId) => {
    if (restored[tagId]) {
      restored[tagId] = {
        ...restored[tagId],
        weight: snapshot[tagId].weight,
        usage_count: snapshot[tagId].usage,
        deletion_count: snapshot[tagId].deletions,
      };
    }
  });

  return restored;
}
