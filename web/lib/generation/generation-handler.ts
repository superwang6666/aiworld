import type { WorldRule, LawWeight, DEACAnalysis, RuleTag } from '@/types';

/**
 * 生成选项接口
 */
export interface GenerationOptions {
  corePremise: string;
  artStyle: string;
  lawWeights: LawWeight[];
  generationMode: 'fast' | 'deep';
  deacAnalysis?: DEACAnalysis;
  deacLoading: boolean;
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
  tagWeights: Record<string, RuleTag>
): Promise<GenerateRulesWithTagsResult> {
  if (rules.length === 0) {
    return { rules: [], updatedWeights: tagWeights };
  }

  try {
    console.log('开始为规则生成标签...', {
      rulesCount: rules.length,
      tagWeightsKeys: Object.keys(tagWeights).length
    });

    const tagResponse = await fetch('/api/tags/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rules: rules,
        tagWeights: tagWeights,
      }),
    });

    if (tagResponse.ok) {
      const tagData = await tagResponse.json();
      console.log('标签生成成功:', {
        rulesWithTags: tagData.rules?.length,
        updatedWeightsKeys: Object.keys(tagData.updatedWeights || {}).length
      });
      return {
        rules: tagData.rules,
        updatedWeights: tagData.updatedWeights,
      };
    } else {
      const errorData = await tagResponse.json();
      console.error('标签生成失败:', errorData);
      // 如果标签生成失败，至少返回规则
      return { rules, updatedWeights: tagWeights };
    }
  } catch (tagError) {
    console.error('Failed to generate tags:', tagError);
    return { rules, updatedWeights: tagWeights };
  }
}

/**
 * 主生成函数 - 生成规则
 */
export async function generateRules(
  options: GenerationOptions
): Promise<WorldRule[]> {
  const {
    corePremise,
    artStyle,
    lawWeights,
    generationMode,
    deacAnalysis,
    deacLoading
  } = options;

  let expertResponses = undefined;

  // 深度模式：等待 DEAC 分析完成
  if (generationMode === 'deep') {
    if (!deacAnalysis || deacLoading) {
      // 如果 DEAC 还在加载，等待它完成
      const maxWaitTime = 30000; // 最多等待 30 秒
      const startTime = Date.now();

      while (deacLoading && (Date.now() - startTime < maxWaitTime)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (deacLoading) {
        throw new Error('专家分析超时，请切换到快速模式或稍后重试');
      }
    }

    if (deacAnalysis && deacAnalysis.expert_responses) {
      expertResponses = deacAnalysis.expert_responses;
      console.log(`🧠 使用 ${expertResponses.length} 个专家的洞察进行深度生成`);
    }
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
    throw new Error(data.error || 'Failed to generate rules');
  }

  const data = await response.json();
  return data.rules || [];
}
