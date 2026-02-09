import type { WorldRule, LawWeight, DEACAnalysis, RuleTag } from "@/types";

import { logger } from "@/lib/utils/logger";

import type { Locale } from "@/types/i18n";


/**
 * 生成选项接口
 */
export interface GenerationOptions {
  corePremise: string;
  artStyle: string;
  lawWeights: LawWeight[];
  generationMode: "fast" | "deep";
  deacAnalysis?: DEACAnalysis;
  deacLoading: boolean;
  locale?: Locale;
  t?: (key: string) => string; // Translation function for error messages
}

/**
 * 生成规则并添加标签的结果接口
 */
export interface GenerateRulesWithTagsResult {
  rules: WorldRule[];
  updatedWeights: Record<string, RuleTag>;
}

/**
 * 为规则生成标签
 */
export async function generateRulesWithTags(
  rules: WorldRule[],
  tagWeights: Record<string, RuleTag>,
): Promise<GenerateRulesWithTagsResult> {
  if (rules.length === 0) {
    return { rules: [], updatedWeights: tagWeights };
  }

  try {
    logger.info("Starting tag generation for rules", {
      rulesCount: rules.length,
      tagWeightsCount: Object.keys(tagWeights).length,
    });

    const tagResponse = await fetch("/api/tags/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rules: rules,
        tagWeights: tagWeights,
      }),
    });

    if (tagResponse.ok) {
      const tagData = await tagResponse.json();
      logger.info("Tag generation successful", {
        rulesWithTags: tagData.rules?.length,
        updatedWeightsCount: Object.keys(tagData.updatedWeights || {}).length,
      });
      return {
        rules: tagData.rules,
        updatedWeights: tagData.updatedWeights,
      };
    } else {
      const errorData = await tagResponse.json();
      logger.error("Tag generation failed", { error: errorData });
      // 如果标签生成失败，至少返回规则
      return { rules, updatedWeights: tagWeights };
    }
  } catch (tagError) {
    logger.error("Failed to generate tags", { error: tagError });
    return { rules, updatedWeights: tagWeights };
  }
}

/**
 * 主生成函数 - 生成规则
 */
export async function generateRules(
  options: GenerationOptions,
): Promise<WorldRule[]> {
  const {
    corePremise,
    artStyle,
    lawWeights,
    generationMode,
    deacAnalysis,
    deacLoading,
  } = options;

  let expertResponses = undefined;

  // 深度模式：等待 DEAC 分析完成
  if (generationMode === "deep") {
    if (!deacAnalysis || deacLoading) {
      // 如果 DEAC 还在加载，等待它完成
      const maxWaitTime = 30000; // 最多等待 30 秒
      const startTime = Date.now();

      while (deacLoading && Date.now() - startTime < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (deacLoading) {
        const errorMsg = options.t
          ? options.t('expertAnalysisTimeout')
          : "Expert analysis timeout, please switch to fast mode or try again later";
        throw new Error(errorMsg);
      }
    }

    if (deacAnalysis && deacAnalysis.expert_responses) {
      expertResponses = deacAnalysis.expert_responses;
      logger.info("Using expert insights for deep generation", {
        expertsCount: expertResponses.length,
      });
    }
  }

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      corePremise: corePremise.trim(),
      artStyle: artStyle.trim(),
      lawWeights: lawWeights,
      mode: generationMode,
      expertResponses: expertResponses,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to generate rules");
  }

  const data = await response.json();
  return data.rules || [];
}
