import type { WorldRule, RuleTag } from "@/types";

import { LAW_NAMES } from "@/config/law-names";

import { logger } from "@/lib/utils/logger";
import { toast } from "@/lib/utils/toast-store";

/**
 * 规则切换结果接口
 */
export interface ToggleRuleResult {
  updatedRules: WorldRule[];
  updatedTagWeights: Record<string, RuleTag>;
  shouldAutoSave: boolean;
  shouldGenerateNew: boolean;
}

/**
 * 规则删除结果接口
 */
export interface DeleteRuleResult {
  updatedRules: WorldRule[];
  updatedTagWeights: Record<string, RuleTag>;
  newRule: WorldRule | null;
}

/**
 * 计算单个规则的删除评分
 */
export function calculateRuleDeletionScore(
  rule: WorldRule,
  tagWeights: Record<string, RuleTag>,
): number {
  if (!rule.tags || rule.tags.length === 0) {
    return 0.5;
  }

  const totalWeight = rule.tags.reduce((sum, tagId) => {
    return sum + (tagWeights[tagId]?.weight || 0.5);
  }, 0);

  const avgWeight = totalWeight / rule.tags.length;
  const deletion_score = 1 - avgWeight;

  return deletion_score;
}

/**
 * 更新所有规则的删除评分
 */
export function updateDeletionScores(
  rules: WorldRule[],
  tagWeights: Record<string, RuleTag>,
): WorldRule[] {
  return rules.map((rule) => {
    const deletion_score = calculateRuleDeletionScore(rule, tagWeights);
    return { ...rule, deletion_score };
  });
}

/**
 * 切换规则的确认状态
 */
export async function toggleRule(
  ruleId: string,
  rules: WorldRule[],
  tagWeights: Record<string, RuleTag>,
  _corePremise: string,
  _artStyle: string,
): Promise<ToggleRuleResult> {
  const rule = rules.find((r) => r.id === ruleId);
  if (!rule) {
    throw new Error(`Rule with id ${ruleId} not found`);
  }

  const wasConfirmed = rule.confirmed;
  const willBeConfirmed = !wasConfirmed;

  // 计算更新后的规则列表
  let finalRules = rules.map((r) =>
    r.id === ruleId ? { ...r, confirmed: willBeConfirmed, isNew: false } : r,
  );

  let updatedTagWeights = tagWeights;

  // 如果确认规则，提升标签权重并重新计算删除评分
  if (willBeConfirmed && rule.tags && rule.tags.length > 0) {
    try {
      const response = await fetch("/api/tags/update-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: rule.tags,
          action: "confirm",
          currentWeights: tagWeights,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        updatedTagWeights = data.updatedWeights;

        // 重新计算所有规则的删除评分
        finalRules = updateDeletionScores(finalRules, updatedTagWeights);
      }
    } catch (err) {
      logger.error("Failed to update tag weights", { ruleId, error: err });
    }
  }

  return {
    updatedRules: finalRules,
    updatedTagWeights,
    shouldAutoSave: !wasConfirmed && willBeConfirmed, // 从未确认变为确认时触发
    shouldGenerateNew: !wasConfirmed && willBeConfirmed,
  };
}

/**
 * 删除规则并生成新规则
 */
export async function deleteRule(
  ruleId: string,
  rules: WorldRule[],
  tagWeights: Record<string, RuleTag>,
  corePremise: string,
  artStyle: string,
): Promise<DeleteRuleResult> {
  const rule = rules.find((r) => r.id === ruleId);
  if (!rule) {
    throw new Error(`Rule with id ${ruleId} not found`);
  }

  // 立即从列表移除规则
  const updatedRules = rules.filter((r) => r.id !== ruleId);

  let updatedTagWeights = tagWeights;
  let newRule: WorldRule | null = null;

  // 降低标签权重
  if (rule.tags && rule.tags.length > 0) {
    try {
      const response = await fetch("/api/tags/update-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: rule.tags,
          action: "delete",
          currentWeights: tagWeights,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        updatedTagWeights = data.updatedWeights;
      }
    } catch (err) {
      logger.error("Failed to update tag weights on deletion", {
        ruleId,
        error: err,
      });
    }
  }

  // 重新生成同一法则的新规则（带去重检测）
  try {
    logger.info("Regenerating rule for law", { law: rule.law });
    const response = await fetch("/api/generate-single", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        corePremise: corePremise.trim(),
        artStyle: artStyle.trim(),
        law: rule.law,
        existingRules: updatedRules.filter((r) => !r.rejected),
        tagWeights: updatedTagWeights,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      newRule = data.rule;

      // 如果有重试信息，在控制台显示
      if (data.retries > 0) {
        logger.info("New rule generated after deduplication retries", {
          retries: data.retries,
        });
      } else {
        logger.info("New rule generated without duplicates");
      }
    } else {
      const errorData = await response.json();
      if (errorData.error === "无法生成不重复的规则,请稍后重试") {
        logger.warn("Semantic deduplication failed", {
          similarity: errorData.similarity,
          reasoning: errorData.reasoning,
          retries: errorData.retries,
        });
        toast.error(
          `暂时无法生成不重复的规则\n相似度: ${errorData.similarity}%\n原因: ${errorData.reasoning}`,
        );
      } else {
        logger.error("Failed to regenerate rule", { error: errorData.error });
      }
    }
  } catch (err) {
    logger.error("Failed to regenerate rule", { error: err });
  }

  return {
    updatedRules,
    updatedTagWeights,
    newRule,
  };
}

/**
 * 生成随机法则的新规则（带去重检测）
 */
export async function generateRandomRule(
  corePremise: string,
  artStyle: string,
  existingRules: WorldRule[],
  tagWeights?: Record<string, RuleTag>,
): Promise<WorldRule> {
  const randomLaw = LAW_NAMES[Math.floor(Math.random() * LAW_NAMES.length)];

  logger.info("Generating random rule for law", { law: randomLaw });
  const response = await fetch("/api/generate-single", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      corePremise: corePremise.trim(),
      artStyle: artStyle.trim(),
      law: randomLaw,
      existingRules: existingRules.filter((r) => !r.rejected),
      tagWeights,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error === "无法生成不重复的规则,请稍后重试") {
      logger.warn("Semantic deduplication failed for random rule", {
        similarity: errorData.similarity,
        reasoning: errorData.reasoning,
        retries: errorData.retries,
      });
      throw new Error("无法生成不重复的规则");
    }
    throw new Error(errorData.error || "Failed to generate rule");
  }

  const data = await response.json();
  const newRule = data.rule;

  // 如果有重试信息，在控制台显示
  if (data.retries > 0) {
    logger.info("New random rule generated after deduplication retries", {
      retries: data.retries,
    });
  } else {
    logger.info("New random rule generated without duplicates");
  }

  return newRule;
}
