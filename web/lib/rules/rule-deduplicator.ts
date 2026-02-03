/**
 * @deprecated 此文件已废弃,请使用 lib/rules/semantic-matcher.ts
 *
 * 旧的标签 Jaccard 相似度去重器
 *
 * 废弃原因:
 * - 标签方案无法捕捉语义相似性
 * - Jaccard算法仅比较标签重叠,漏检率高达50%
 * - 已被LLM语义去重完全替代
 *
 * 保留此文件仅作为参考,未来可能删除
 */

import type { WorldRule } from '@/types';

/**
 * 规则去重配置
 */
export const DEDUPLICATION_CONFIG = {
  SIMILARITY_THRESHOLD: 0.7, // Jaccard相似度阈值
  MAX_RETRIES: 3, // 最大重试次数
  SAME_LAW_ONLY: true, // 仅比对同一法则的规则
};

/**
 * 去重检测结果
 */
export interface DuplicationCheckResult {
  isDuplicate: boolean;
  similarRule?: WorldRule;
  similarity?: number;
}

/**
 * 计算两个标签数组的 Jaccard 相似度
 *
 * Jaccard 相似度 = |A ∩ B| / |A ∪ B|
 * - 0 表示完全不同
 * - 1 表示完全相同
 *
 * @param tagsA 规则A的标签数组
 * @param tagsB 规则B的标签数组
 * @returns Jaccard 相似度 (0-1)
 */
export function calculateJaccardSimilarity(tagsA: string[], tagsB: string[]): number {
  // 处理空标签情况
  if (tagsA.length === 0 && tagsB.length === 0) {
    return 0; // 两个都没有标签,视为不同(避免误判)
  }

  if (tagsA.length === 0 || tagsB.length === 0) {
    return 0; // 其中一个没有标签,视为完全不同
  }

  // 计算交集
  const setA = new Set(tagsA);
  const setB = new Set(tagsB);
  const intersection = new Set([...setA].filter((tag) => setB.has(tag)));

  // 计算并集
  const union = new Set([...setA, ...setB]);

  // Jaccard 相似度
  return intersection.size / union.size;
}

/**
 * 检测规则是否与现有规则重复
 *
 * @param newRule 新生成的规则
 * @param existingRules 现有规则列表
 * @param threshold 相似度阈值(可选,默认使用配置)
 * @returns 去重检测结果
 */
export function checkRuleDuplication(
  newRule: WorldRule,
  existingRules: WorldRule[],
  threshold: number = DEDUPLICATION_CONFIG.SIMILARITY_THRESHOLD
): DuplicationCheckResult {
  // 如果新规则没有标签,无法检测,直接通过
  if (!newRule.tags || newRule.tags.length === 0) {
    console.warn('新规则没有标签,跳过去重检测:', newRule.id);
    return { isDuplicate: false };
  }

  // 过滤出需要比对的规则
  let rulesToCompare = existingRules;

  // 优化: 仅比对同一法则的规则
  if (DEDUPLICATION_CONFIG.SAME_LAW_ONLY) {
    rulesToCompare = existingRules.filter((rule) => rule.law === newRule.law);
  }

  // 过滤掉已删除的规则
  rulesToCompare = rulesToCompare.filter((rule) => !rule.rejected);

  // 记录最相似的规则
  let maxSimilarity = 0;
  let mostSimilarRule: WorldRule | undefined;

  // 遍历每条现有规则,计算相似度
  for (const existingRule of rulesToCompare) {
    // 跳过没有标签的规则
    if (!existingRule.tags || existingRule.tags.length === 0) {
      continue;
    }

    // 计算 Jaccard 相似度
    const similarity = calculateJaccardSimilarity(newRule.tags, existingRule.tags);

    // 更新最大相似度
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      mostSimilarRule = existingRule;
    }

    // 提前退出策略: 如果找到重复规则,立即返回
    if (similarity >= threshold) {
      console.log(
        `检测到重复规则 (相似度: ${(similarity * 100).toFixed(1)}%):`,
        `\n新规则: ${newRule.rule.substring(0, 50)}...`,
        `\n相似规则: ${existingRule.rule.substring(0, 50)}...`
      );

      return {
        isDuplicate: true,
        similarRule: existingRule,
        similarity: similarity,
      };
    }
  }

  // 没有找到重复规则
  if (maxSimilarity > 0) {
    console.log(
      `规则通过去重检测,最高相似度: ${(maxSimilarity * 100).toFixed(1)}% (阈值: ${(threshold * 100).toFixed(0)}%)`
    );
  }

  return {
    isDuplicate: false,
    similarRule: mostSimilarRule,
    similarity: maxSimilarity,
  };
}

/**
 * 批量检测规则重复 (用于初始生成的20条规则)
 *
 * @param rules 规则数组
 * @param threshold 相似度阈值
 * @returns 重复规则对的数组
 */
export function batchCheckDuplication(
  rules: WorldRule[],
  threshold: number = DEDUPLICATION_CONFIG.SIMILARITY_THRESHOLD
): Array<{ ruleA: WorldRule; ruleB: WorldRule; similarity: number }> {
  const duplicates: Array<{ ruleA: WorldRule; ruleB: WorldRule; similarity: number }> = [];

  // 两两比对
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const ruleA = rules[i];
      const ruleB = rules[j];

      // 如果设置了同法则检测,跳过不同法则的规则
      if (DEDUPLICATION_CONFIG.SAME_LAW_ONLY && ruleA.law !== ruleB.law) {
        continue;
      }

      // 跳过没有标签的规则
      if (
        !ruleA.tags ||
        ruleA.tags.length === 0 ||
        !ruleB.tags ||
        ruleB.tags.length === 0
      ) {
        continue;
      }

      // 计算相似度
      const similarity = calculateJaccardSimilarity(ruleA.tags, ruleB.tags);

      if (similarity >= threshold) {
        duplicates.push({ ruleA, ruleB, similarity });
      }
    }
  }

  return duplicates;
}
