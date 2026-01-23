/**
 * LLM语义规则去重器
 *
 * 功能:
 * 1. 使用LLM分析两条规则的语义相似度
 * 2. 检测新规则是否与现有规则重复
 * 3. 性能优化:仅比对同一法则的规则
 */

import OpenAI from 'openai';
import { WorldRule } from '@/types';

/**
 * 语义去重配置
 */
export const SEMANTIC_DEDUPLICATION_CONFIG = {
  SIMILARITY_THRESHOLD: 85, // 语义相似度阈值(0-100)
  MAX_RETRIES: 3, // 最大重试次数
  SAME_LAW_ONLY: true, // 仅比对同一法则的规则
  ENABLE_REASONING_LOG: true, // 记录相似度判断理由
};

/**
 * 语义去重检测结果
 */
export interface SemanticDuplicationCheckResult {
  isDuplicate: boolean;
  similarRule?: WorldRule;
  similarity?: number;
  reasoning?: string;
}

/**
 * 获取OpenAI客户端实例
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('缺少API密钥: DEEPSEEK_API_KEY或OPENAI_API_KEY未设置');
  }

  const baseURL = process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com' : undefined;

  return new OpenAI({ apiKey, baseURL });
}

/**
 * 使用LLM计算两条规则的语义相似度
 *
 * @param ruleA 规则A
 * @param ruleB 规则B
 * @returns 相似度评分 (0-100) 和判断理由
 */
async function calculateSemanticSimilarity(
  ruleA: WorldRule,
  ruleB: WorldRule
): Promise<{ similarity: number; reasoning: string }> {
  const openai = getOpenAIClient();
  const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini';

  const prompt = `你是一个世界构建规则分析专家。请分析以下两条规则是否表达了相似或重复的概念。

【规则A】
内容: "${ruleA.rule}"
专家逻辑: "${ruleA.expert_logic}"
法则: ${ruleA.law}

【规则B】
内容: "${ruleB.rule}"
专家逻辑: "${ruleB.expert_logic}"
法则: ${ruleB.law}

请评估这两条规则的语义相似度:
- 它们是否描述了相同或高度相似的世界机制?
- 即使用词不同,但核心概念是否一致?
- 考虑规则的实际效果和影响,而非仅仅是表面文字

返回JSON格式:
{
  "similarity": 0-100的整数(0=完全不同, 100=几乎相同),
  "reasoning": "简短说明为什么相似或不同(50字以内)"
}

**评分参考:**
- 85-100: 核心概念几乎相同,属于重复规则
- 70-84: 有较大重叠但角度不同
- 50-69: 有一定关联但机制不同
- 0-49: 完全不同的规则`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: '你是世界构建规则分析专家。只返回有效的 JSON。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3, // 低温度保证一致性
      response_format: { type: 'json_object' },
    });

    let content = completion.choices[0]?.message?.content || '{}';
    // 清理可能的 markdown 包装
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const result = JSON.parse(content);

    return {
      similarity: result.similarity || 0,
      reasoning: result.reasoning || '无法分析',
    };
  } catch (error) {
    console.error('LLM相似度检测失败:', error);
    // 降级策略: 返回0相似度,假设不重复
    return {
      similarity: 0,
      reasoning: 'LLM分析失败,默认为不重复',
    };
  }
}

/**
 * 检测单条规则是否与现有规则重复
 *
 * @param newRule 新生成的规则
 * @param existingRules 现有规则列表
 * @param threshold 相似度阈值(可选,默认使用配置)
 * @returns 语义去重检测结果
 */
export async function checkRuleSemanticDuplication(
  newRule: WorldRule,
  existingRules: WorldRule[],
  threshold: number = SEMANTIC_DEDUPLICATION_CONFIG.SIMILARITY_THRESHOLD
): Promise<SemanticDuplicationCheckResult> {
  // 过滤出需要比对的规则
  let rulesToCompare = existingRules;

  // 优化: 仅比对同一法则的规则
  if (SEMANTIC_DEDUPLICATION_CONFIG.SAME_LAW_ONLY) {
    rulesToCompare = existingRules.filter((rule) => rule.law === newRule.law);
  }

  // 过滤掉已删除的规则
  rulesToCompare = rulesToCompare.filter((rule) => !rule.rejected);

  // 如果没有需要比对的规则,直接通过
  if (rulesToCompare.length === 0) {
    return { isDuplicate: false };
  }

  // 记录最相似的规则
  let maxSimilarity = 0;
  let mostSimilarRule: WorldRule | undefined;
  let mostSimilarReasoning = '';

  // 遍历每条现有规则,计算语义相似度
  for (const existingRule of rulesToCompare) {
    try {
      const { similarity, reasoning } = await calculateSemanticSimilarity(
        newRule,
        existingRule
      );

      // 日志记录(如果启用)
      if (SEMANTIC_DEDUPLICATION_CONFIG.ENABLE_REASONING_LOG) {
        console.log(`[语义去重] 新规则 vs ${existingRule.id.substring(0, 8)}...`);
        console.log(`  相似度: ${similarity}% (阈值: ${threshold}%)`);
        console.log(`  理由: ${reasoning}`);
      }

      // 更新最大相似度
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        mostSimilarRule = existingRule;
        mostSimilarReasoning = reasoning;
      }

      // 提前退出策略: 如果找到重复规则,立即返回
      if (similarity >= threshold) {
        console.log(
          `[语义去重] ❌ 检测到重复规则 (相似度: ${similarity}%):\n` +
            `  新规则: ${newRule.rule.substring(0, 50)}...\n` +
            `  相似规则: ${existingRule.rule.substring(0, 50)}...\n` +
            `  理由: ${reasoning}`
        );

        return {
          isDuplicate: true,
          similarRule: existingRule,
          similarity: similarity,
          reasoning: reasoning,
        };
      }
    } catch (error) {
      console.error('LLM相似度检测失败,跳过该规则:', error);
      // 降级策略: 假设不重复,继续比对下一条
      continue;
    }
  }

  // 没有找到重复规则
  if (maxSimilarity > 0 && SEMANTIC_DEDUPLICATION_CONFIG.ENABLE_REASONING_LOG) {
    console.log(
      `[语义去重] ✅ 规则通过检测,最高相似度: ${maxSimilarity}% (阈值: ${threshold}%)`
    );
  }

  return {
    isDuplicate: false,
    similarRule: mostSimilarRule,
    similarity: maxSimilarity,
    reasoning: mostSimilarReasoning,
  };
}

/**
 * 批量检测规则重复 (用于初始生成的多条规则)
 *
 * @param rules 规则数组
 * @param threshold 相似度阈值
 * @returns 重复规则对的数组
 */
export async function batchCheckSemanticDuplication(
  rules: WorldRule[],
  threshold: number = SEMANTIC_DEDUPLICATION_CONFIG.SIMILARITY_THRESHOLD
): Promise<
  Array<{ ruleA: WorldRule; ruleB: WorldRule; similarity: number; reasoning: string }>
> {
  const duplicates: Array<{
    ruleA: WorldRule;
    ruleB: WorldRule;
    similarity: number;
    reasoning: string;
  }> = [];

  // 两两比对
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const ruleA = rules[i];
      const ruleB = rules[j];

      // 如果设置了同法则检测,跳过不同法则的规则
      if (SEMANTIC_DEDUPLICATION_CONFIG.SAME_LAW_ONLY && ruleA.law !== ruleB.law) {
        continue;
      }

      try {
        const { similarity, reasoning } = await calculateSemanticSimilarity(ruleA, ruleB);

        if (similarity >= threshold) {
          duplicates.push({ ruleA, ruleB, similarity, reasoning });
        }

        // 添加延迟,避免API限流
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`批量检测失败 (规则 ${i} vs ${j}):`, error);
        continue;
      }
    }
  }

  return duplicates;
}
