import OpenAI from "openai";

import type { WorldRule, RuleTag } from "@/types";


import { PREDEFINED_TAGS } from "@/config/predefined-tags";


import { logger } from "@/lib/utils/logger";
import { getServerTranslation } from '@/lib/utils/server-translations';

import { KEYWORDS_ZH, KEYWORDS_EN } from './keywords-i18n';

import type { Locale } from '@/types/i18n';

/**
 * LLM标签生成器
 *
 * 混合模式:
 * 1. 首先从预定义标签池匹配
 * 2. 如果需要,使用LLM生成额外的特殊标签
 */

// API客户端
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(getServerTranslation('Tags', 'missingApiKey', 'zh-CN'));
    }

    openaiClient = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.DEEPSEEK_API_KEY
        ? "https://api.deepseek.com"
        : "https://api.openai.com/v1",
    });
  }

  return openaiClient;
}

/**
 * 从预定义标签池匹配规则标签
 * 使用关键词匹配算法
 *
 * @param rule 世界规则
 * @param locale 语言环境
 * @returns 匹配的预定义标签ID数组
 */
export function matchPredefinedTags(rule: WorldRule, locale: Locale = 'zh-CN'): string[] {
  const ruleText = (rule.rule + " " + rule.expert_logic).toLowerCase();
  const matched: string[] = [];

  // 根据 locale 选择关键词映射
  const keywords = locale === 'zh-CN' ? KEYWORDS_ZH : KEYWORDS_EN;

  // 遍历每个标签,检查关键词匹配
  Object.keys(keywords).forEach((tagId) => {
    const tagKeywords = keywords[tagId];
    const hasMatch = tagKeywords.some((keyword) => ruleText.includes(keyword.toLowerCase()));

    if (hasMatch) {
      matched.push(tagId);
    }
  });

  // 去重并限制数量 (最多5个预定义标签)
  return [...new Set(matched)].slice(0, 5);
}

/**
 * 使用LLM生成补充标签
 * 仅在预定义标签无法充分描述规则时调用
 *
 * @param rule 世界规则
 * @param existingTagIds 已有的标签ID (避免重复)
 * @returns LLM生成的新标签数组
 */
export async function generateSupplementaryTags(
  rule: WorldRule,
  existingTagIds: string[],
): Promise<RuleTag[]> {
  const client = getOpenAIClient();

  const existingTagNames = existingTagIds
    .map((id) => PREDEFINED_TAGS.find((t) => t.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  const prompt = `You are a world-building analyst. Analyze the following rule and generate 1-2 additional descriptive tags that are NOT already covered by existing tags.

[Rule]
"${rule.rule}"

[Expert Logic]
"${rule.expert_logic}"

[Existing Tags]
${existingTagNames || "(none)"}

Generate 1-2 NEW tags that capture unique aspects of this rule not already represented. Tags should be:
- Concise (1-3 words)
- Descriptive of the rule's mechanism, tone, or narrative role
- Different from existing tags

Return ONLY a JSON array of tag objects with this format:
[
  {"id": "kebab-case-id", "name": "中文名称", "category": "tone|mechanism|narrative|logic"}
]

Do not include any other text.`;

  try {
    const response = await client.chat.completions.create({
      model: process.env.DEEPSEEK_API_KEY ? "deepseek-chat" : "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    // 清理响应 (移除可能的markdown包装)
    const cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    // 验证并规范化
    const newTags: RuleTag[] = (Array.isArray(parsed) ? parsed : [parsed]).map(
      (item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        weight: 0.5, // 新标签初始权重
        usage_count: 1, // 初次使用
        deletion_count: 0,
        source: "llm" as const,
        created_at: new Date().toISOString(),
      }),
    );

    return newTags.filter((tag) => {
      // 过滤: 不能与已有标签ID重复
      return !existingTagIds.includes(tag.id);
    });
  } catch (error) {
    logger.error("LLM tag generation failed", { ruleId: rule.id, error });
    return []; // 失败时返回空数组,不阻塞流程
  }
}

/**
 * 混合标签生成 (主入口)
 * 1. 先匹配预定义标签
 * 2. 如果预定义标签少于3个,使用LLM补充
 *
 * @param rule 世界规则
 * @returns 包含预定义标签ID和LLM生成标签的对象
 */
export async function generateTagsForRule(rule: WorldRule): Promise<{
  predefinedTagIds: string[];
  llmGeneratedTags: RuleTag[];
  recommendedTagIds: string[];
}> {
  // 步骤1: 匹配预定义标签
  const predefinedTagIds = matchPredefinedTags(rule);

  // 步骤2: 判断是否需要LLM补充
  let llmGeneratedTags: RuleTag[] = [];
  const MIN_TAGS = 3; // 最少需要3个标签

  if (predefinedTagIds.length < MIN_TAGS) {
    llmGeneratedTags = await generateSupplementaryTags(rule, predefinedTagIds);
  }

  // 步骤3: 合并推荐标签
  const llmTagIds = llmGeneratedTags.map((t) => t.id);
  const recommendedTagIds = [...predefinedTagIds, ...llmTagIds];

  return {
    predefinedTagIds,
    llmGeneratedTags,
    recommendedTagIds,
  };
}

/**
 * 批量为多个规则生成标签
 * 优化:串行调用LLM,避免并发限流
 *
 * @param rules 规则数组
 * @returns 标签生成结果数组
 */
export async function generateTagsForRules(rules: WorldRule[]): Promise<
  Array<{
    ruleId: string;
    predefinedTagIds: string[];
    llmGeneratedTags: RuleTag[];
    recommendedTagIds: string[];
  }>
> {
  const results = [];

  for (const rule of rules) {
    try {
      const tagResult = await generateTagsForRule(rule);
      results.push({
        ruleId: rule.id,
        ...tagResult,
      });

      // 添加小延迟,避免API限流
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      logger.error("Tag generation failed for rule", {
        ruleId: rule.id,
        error,
      });
      // 失败时仍返回预定义标签
      const predefinedTagIds = matchPredefinedTags(rule);
      results.push({
        ruleId: rule.id,
        predefinedTagIds,
        llmGeneratedTags: [],
        recommendedTagIds: predefinedTagIds,
      });
    }
  }

  return results;
}
