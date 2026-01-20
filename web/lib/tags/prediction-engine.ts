import { WorldRule, RuleTag } from '@/types';

/**
 * 预测删除引擎
 *
 * 基于标签权重预测用户可能删除的规则
 * 核心算法: deletion_score = 1 - avg_tag_weight
 */

// 预测阈值配置
export const DELETION_WARNING_THRESHOLD = 0.6; // ≥ 0.6 显示警告
export const DELETION_DANGER_THRESHOLD = 0.75; // ≥ 0.75 强烈警告

/**
 * 计算单个规则的删除评分
 *
 * 算法: deletion_score = 1 - (Σ(tag_weight_i) / tag_count)
 * 评分越高,越可能被删除
 *
 * @param ruleTags 规则的标签ID数组
 * @param tagWeights 标签权重映射
 * @returns 删除评分 (0-1)
 */
export function calculateDeletionScore(
  ruleTags: string[],
  tagWeights: Record<string, RuleTag>
): number {
  // 无标签时返回中性评分
  if (ruleTags.length === 0) return 0.5;

  // 计算平均标签权重
  const totalWeight = ruleTags.reduce((sum, tagId) => {
    return sum + (tagWeights[tagId]?.weight || 0.5); // 默认0.5
  }, 0);

  const avgWeight = totalWeight / ruleTags.length;

  // 反转: 权重越低,删除分越高
  return 1 - avgWeight;
}

/**
 * 批量计算规则的删除评分
 *
 * @param rules 规则数组
 * @param tagWeights 标签权重映射
 * @returns 包含删除评分的规则数组
 */
export function calculateDeletionScoresForRules(
  rules: WorldRule[],
  tagWeights: Record<string, RuleTag>
): WorldRule[] {
  return rules.map((rule) => ({
    ...rule,
    deletion_score: calculateDeletionScore(rule.tags, tagWeights),
  }));
}

/**
 * 获取高风险规则 (可能被删除的规则)
 *
 * @param rules 规则数组
 * @param threshold 风险阈值 (默认 0.6)
 * @returns 高风险规则数组,按删除评分降序排列
 */
export function getHighRiskRules(
  rules: WorldRule[],
  threshold: number = DELETION_WARNING_THRESHOLD
): WorldRule[] {
  return rules
    .filter((rule) => {
      const score = rule.deletion_score || 0;
      return score >= threshold && !rule.rejected; // 已删除的规则不计入
    })
    .sort((a, b) => (b.deletion_score || 0) - (a.deletion_score || 0)); // 降序
}

/**
 * 判断规则是否需要警告标识
 *
 * @param rule 规则
 * @returns 警告等级: 'none' | 'warning' | 'danger'
 */
export function getRiskLevel(rule: WorldRule): 'none' | 'warning' | 'danger' {
  const score = rule.deletion_score || 0;

  if (score >= DELETION_DANGER_THRESHOLD) {
    return 'danger'; // 强烈警告 (红色)
  } else if (score >= DELETION_WARNING_THRESHOLD) {
    return 'warning'; // 警告 (黄色)
  } else {
    return 'none'; // 无警告
  }
}

/**
 * 生成"猜你想删"建议列表
 *
 * @param rules 所有规则
 * @param tagWeights 标签权重映射
 * @param limit 返回数量限制 (默认5条)
 * @returns 建议删除的规则数组
 */
export function generateDeletionSuggestions(
  rules: WorldRule[],
  tagWeights: Record<string, RuleTag>,
  limit: number = 5
): Array<{
  rule: WorldRule;
  deletion_score: number;
  reason: string; // 建议删除的原因
}> {
  // 计算所有未删除规则的评分
  const scored = rules
    .filter((rule) => !rule.rejected && !rule.confirmed) // 未删除且未确认
    .map((rule) => {
      const score = calculateDeletionScore(rule.tags, tagWeights);

      // 生成原因说明
      const lowWeightTags = rule.tags
        .filter((tagId) => {
          const weight = tagWeights[tagId]?.weight || 0.5;
          return weight < 0.4; // 权重低于0.4的标签
        })
        .map((tagId) => tagWeights[tagId]?.name || tagId)
        .slice(0, 3);

      const reason =
        lowWeightTags.length > 0
          ? `包含低评分标签: ${lowWeightTags.join(', ')}`
          : '基于您的偏好,这条规则可能不符合您的审美';

      return {
        rule: { ...rule, deletion_score: score },
        deletion_score: score,
        reason,
      };
    })
    .sort((a, b) => b.deletion_score - a.deletion_score) // 按评分降序
    .slice(0, limit);

  return scored;
}

/**
 * 分析标签对删除评分的贡献
 * 帮助用户理解为什么某个规则得分高
 *
 * @param ruleTags 规则的标签ID数组
 * @param tagWeights 标签权重映射
 * @returns 标签贡献分析数组
 */
export function analyzeTagContributions(
  ruleTags: string[],
  tagWeights: Record<string, RuleTag>
): Array<{
  tagId: string;
  tagName: string;
  weight: number;
  contribution: 'positive' | 'negative' | 'neutral'; // 对删除评分的影响
}> {
  return ruleTags.map((tagId) => {
    const tag = tagWeights[tagId];
    const weight = tag?.weight || 0.5;

    let contribution: 'positive' | 'negative' | 'neutral';
    if (weight < 0.4) {
      contribution = 'negative'; // 低权重 = 负面贡献 = 增加删除可能
    } else if (weight > 0.6) {
      contribution = 'positive'; // 高权重 = 正面贡献 = 降低删除可能
    } else {
      contribution = 'neutral'; // 中性
    }

    return {
      tagId,
      tagName: tag?.name || tagId,
      weight,
      contribution,
    };
  });
}

/**
 * 生成预测报告 (用于UI展示)
 *
 * @param rules 所有规则
 * @param tagWeights 标签权重映射
 * @returns 预测分析报告
 */
export function generatePredictionReport(
  rules: WorldRule[],
  tagWeights: Record<string, RuleTag>
): {
  total_rules: number;
  active_rules: number;
  high_risk_count: number;
  high_risk_rules: WorldRule[];
  suggestions: Array<{
    rule: WorldRule;
    deletion_score: number;
    reason: string;
  }>;
  avg_deletion_score: number;
} {
  const activeRules = rules.filter((r) => !r.rejected);

  const highRiskRules = getHighRiskRules(activeRules);
  const suggestions = generateDeletionSuggestions(activeRules, tagWeights);

  // 计算平均删除评分
  const totalScore = activeRules.reduce((sum, rule) => {
    return sum + calculateDeletionScore(rule.tags, tagWeights);
  }, 0);
  const avgScore = activeRules.length > 0 ? totalScore / activeRules.length : 0;

  return {
    total_rules: rules.length,
    active_rules: activeRules.length,
    high_risk_count: highRiskRules.length,
    high_risk_rules: highRiskRules.slice(0, 10), // 最多返回10条
    suggestions,
    avg_deletion_score: avgScore,
  };
}
