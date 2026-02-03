import OpenAI from 'openai';

import type { WorldRule, RuleTag } from '@/types';

import { PREDEFINED_TAGS } from '@/config/predefined-tags';

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
      throw new Error('缺少API密钥: DEEPSEEK_API_KEY或OPENAI_API_KEY未设置');
    }

    openaiClient = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.DEEPSEEK_API_KEY
        ? 'https://api.deepseek.com'
        : 'https://api.openai.com/v1',
    });
  }

  return openaiClient;
}

/**
 * 从预定义标签池匹配规则标签
 * 使用关键词匹配算法
 *
 * @param rule 世界规则
 * @returns 匹配的预定义标签ID数组
 */
export function matchPredefinedTags(rule: WorldRule): string[] {
  const ruleText = (rule.rule + ' ' + rule.expert_logic).toLowerCase();
  const matched: string[] = [];

  // 关键词映射 (标签ID -> 关键词列表)
  const keywordMap: Record<string, string[]> = {
    // Tone
    brutal: ['残酷', '暴力', '痛苦', '严酷', '无情', '死亡'],
    hopeful: ['希望', '乐观', '光明', '向上', '积极'],
    mysterious: ['神秘', '未知', '隐秘', '不可解', '谜'],
    absurd: ['荒诞', '矛盾', '不合理', '反常', '怪异'],
    dark: ['黑暗', '阴暗', '恐怖', '压抑', '绝望'],
    whimsical: ['奇幻', '梦幻', '超现实', '魔幻', '童话'],

    // Mechanism
    cyclic: ['循环', '周期', '重复', '往复', '轮回'],
    irreversible: ['不可逆', '永久', '无法回头', '一去不返'],
    cascading: ['连锁', '雪崩', '扩散', '蔓延', '传播'],
    resource_based: ['资源', '能量', '消耗', '储备', '积累'],
    time_sensitive: ['时间', '时限', '截止', '过期', '倒计时'],
    accumulative: ['累积', '叠加', '堆积', '积累', '增长'],
    threshold_based: ['阈值', '临界', '突破', '达到', '超过'],

    // Narrative
    paradox: ['矛盾', '悖论', '自相矛盾', '冲突'],
    emergent: ['浮现', '涌现', '突现', '自发'],
    hierarchical: ['层级', '等级', '阶层', '等次'],
    distributed: ['分布', '分散', '去中心', '多点'],
    symbolic: ['象征', '符号', '寓意', '隐喻'],

    // Logic
    causal: ['因果', '导致', '引起', '造成', '原因'],
    probabilistic: ['概率', '随机', '可能', '机会', '几率'],
    deterministic: ['决定', '必然', '确定', '注定'],
    conditional: ['条件', '如果', '当', '只有', '前提'],
    reciprocal: ['互惠', '相互', '交换', '对等', '回报'],
  };

  // 遍历每个标签,检查关键词匹配
  Object.keys(keywordMap).forEach((tagId) => {
    const keywords = keywordMap[tagId];
    const hasMatch = keywords.some((keyword) => ruleText.includes(keyword));

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
  existingTagIds: string[]
): Promise<RuleTag[]> {
  const client = getOpenAIClient();

  const existingTagNames = existingTagIds
    .map((id) => PREDEFINED_TAGS.find((t) => t.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  const prompt = `You are a world-building analyst. Analyze the following rule and generate 1-2 additional descriptive tags that are NOT already covered by existing tags.

[Rule]
"${rule.rule}"

[Expert Logic]
"${rule.expert_logic}"

[Existing Tags]
${existingTagNames || '(none)'}

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
      model: process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    // 清理响应 (移除可能的markdown包装)
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // 验证并规范化
    const newTags: RuleTag[] = (Array.isArray(parsed) ? parsed : [parsed]).map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      weight: 0.5, // 新标签初始权重
      usage_count: 1, // 初次使用
      deletion_count: 0,
      source: 'llm' as const,
      created_at: new Date().toISOString(),
    }));

    return newTags.filter((tag) => {
      // 过滤: 不能与已有标签ID重复
      return !existingTagIds.includes(tag.id);
    });
  } catch (error) {
    console.error('LLM标签生成失败:', error);
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
export async function generateTagsForRule(
  rule: WorldRule
): Promise<{
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
      console.error(`规则 ${rule.id} 标签生成失败:`, error);
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
