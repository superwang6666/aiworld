/**
 * 智能专家匹配器
 *
 * 功能:
 * 1. 分析已缓存的特殊专家与新需求的相似度
 * 2. 决定是复用、更新还是创建新专家
 * 3. 合并重复专家的知识领域
 */

import OpenAI from 'openai';
import { ExpertConfig } from '@/types';
import { loadAllSpecialExperts } from './loader';
import { cacheSpecialExpert } from '@/lib/deac/cache-manager';

interface MatchResult {
  action: 'reuse' | 'update' | 'create';
  expert?: ExpertConfig;
  similarity: number;
  reason: string;
}

interface SpecialExpertRequest {
  domain: string;
  reason: string;
  knowledge_scope: string[];
  heterogeneity_point: string;
}

/**
 * 使用 LLM 分析两个专家的相似度
 */
async function analyzeExpertSimilarity(
  existingExpert: ExpertConfig,
  newRequest: SpecialExpertRequest
): Promise<{ similarity: number; reason: string }> {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com' : undefined;
  const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini';

  const openai = new OpenAI({ apiKey, baseURL });

  const prompt = `你是专家匹配分析器。请分析已有专家与新需求的相似度。

**已有专家:**
- 领域: ${existingExpert.domain}
- 知识范围: ${existingExpert.knowledge_scope.join('、')}
- 标签: ${existingExpert.specialization_tags?.join('、') || '无'}

**新需求:**
- 领域: ${newRequest.domain}
- 知识范围: ${newRequest.knowledge_scope.join('、')}
- 原因: ${newRequest.reason}
- 异质点: ${newRequest.heterogeneity_point}

请评估相似度并返回 JSON:
{
  "similarity": 0-100的数值(100表示完全相同),
  "reason": "相似度判断的理由",
  "domain_overlap": 0-100,
  "knowledge_overlap": 0-100,
  "specialization_match": 0-100
}

**评分标准:**
- 90-100: 几乎完全相同,可直接复用
- 70-89: 大致相同但需要补充知识,应该更新
- 50-69: 有一定重叠但方向不同,建议创建新专家
- 0-49: 完全不同,必须创建新专家`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: '你是专家匹配分析器。只返回有效的 JSON。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3, // 低温度保证一致性
      response_format: { type: 'json_object' },
    });

    let content = completion.choices[0]?.message?.content || '{}';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const result = JSON.parse(content);
    return {
      similarity: result.similarity || 0,
      reason: result.reason || '无法分析',
    };
  } catch (error) {
    console.error('分析专家相似度时出错:', error);
    return { similarity: 0, reason: '分析失败' };
  }
}

/**
 * 使用 LLM 更新已有专家,合并新知识
 */
async function updateExpertWithNewKnowledge(
  existingExpert: ExpertConfig,
  newRequest: SpecialExpertRequest
): Promise<ExpertConfig> {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com' : undefined;
  const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini';

  const openai = new OpenAI({ apiKey, baseURL });

  const prompt = `你是专家配置更新助手。请将新知识整合到已有专家中。

**已有专家配置:**
${JSON.stringify(existingExpert, null, 2)}

**新需求:**
- 领域: ${newRequest.domain}
- 知识范围: ${newRequest.knowledge_scope.join('、')}
- 原因: ${newRequest.reason}
- 异质点: ${newRequest.heterogeneity_point}

**任务:**
1. 保留专家的 id、name、domain(除非新领域明显更准确)
2. 合并 knowledge_scope,去重并保持在 6-10 项
3. 更新 specialization_tags,添加新的相关标签
4. 如果新需求涉及不同的法则,更新 law_mapping
5. 更新 prompt_template 以包含新的知识范围
6. 增加 version(例如 1.0.0 -> 1.1.0)
7. 添加 updated_at 时间戳

返回完整的更新后的专家配置 JSON。保持原有结构,只增强内容。`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: '你是专家配置更新助手。只返回有效的 JSON。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    let content = completion.choices[0]?.message?.content || '{}';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const updatedExpert = JSON.parse(content);

    // 确保关键字段存在
    updatedExpert.updated_at = new Date().toISOString();
    if (!updatedExpert.created_at) {
      updatedExpert.created_at = existingExpert.created_at || new Date().toISOString();
    }

    return updatedExpert as ExpertConfig;
  } catch (error) {
    console.error('更新专家配置时出错:', error);
    // 返回原专家配置
    return existingExpert;
  }
}

/**
 * 智能匹配专家:复用、更新或创建
 */
export async function smartMatchExpert(request: SpecialExpertRequest): Promise<MatchResult> {
  // 1. 加载所有已缓存的特殊专家
  const cachedExperts = await loadAllSpecialExperts();

  if (cachedExperts.length === 0) {
    return {
      action: 'create',
      similarity: 0,
      reason: '没有已缓存的特殊专家,需要创建新专家',
    };
  }

  // 2. 分析每个已有专家与新需求的相似度
  const matches = await Promise.all(
    cachedExperts.map(async (expert) => {
      const { similarity, reason } = await analyzeExpertSimilarity(expert, request);
      return { expert, similarity, reason };
    })
  );

  // 3. 找到最相似的专家
  matches.sort((a, b) => b.similarity - a.similarity);
  const bestMatch = matches[0];

  console.log(`\n最佳匹配专家: ${bestMatch.expert.name}`);
  console.log(`相似度: ${bestMatch.similarity}/100`);
  console.log(`原因: ${bestMatch.reason}\n`);

  // 4. 根据相似度决定行动
  if (bestMatch.similarity >= 90) {
    // 90-100: 直接复用
    return {
      action: 'reuse',
      expert: bestMatch.expert,
      similarity: bestMatch.similarity,
      reason: `已有专家"${bestMatch.expert.name}"完全满足需求,直接复用`,
    };
  } else if (bestMatch.similarity >= 70) {
    // 70-89: 更新已有专家
    console.log(`正在更新专家 "${bestMatch.expert.name}" 以包含新知识...`);
    const updatedExpert = await updateExpertWithNewKnowledge(bestMatch.expert, request);

    // 缓存更新后的专家
    await cacheSpecialExpert(updatedExpert);

    return {
      action: 'update',
      expert: updatedExpert,
      similarity: bestMatch.similarity,
      reason: `已更新专家"${bestMatch.expert.name}"以包含新知识领域`,
    };
  } else {
    // 0-69: 创建新专家
    return {
      action: 'create',
      similarity: bestMatch.similarity,
      reason: `现有专家覆盖不足(最高相似度${bestMatch.similarity}%),需要创建新专家`,
    };
  }
}

/**
 * 分析并合并重复的专家
 */
export async function analyzeAndMergeDuplicates(): Promise<{
  duplicateGroups: { domain: string; experts: ExpertConfig[] }[];
  suggestions: string[];
}> {
  const cachedExperts = await loadAllSpecialExperts();

  if (cachedExperts.length === 0) {
    return { duplicateGroups: [], suggestions: [] };
  }

  // 按领域分组
  const domainGroups = new Map<string, ExpertConfig[]>();

  cachedExperts.forEach(expert => {
    const domain = expert.domain;
    if (!domainGroups.has(domain)) {
      domainGroups.set(domain, []);
    }
    domainGroups.get(domain)!.push(expert);
  });

  // 找出有多个专家的领域(潜在重复)
  const duplicateGroups = Array.from(domainGroups.entries())
    .filter(([_, experts]) => experts.length > 1)
    .map(([domain, experts]) => ({ domain, experts }));

  // 生成合并建议
  const suggestions: string[] = [];

  for (const group of duplicateGroups) {
    if (group.experts.length === 2) {
      suggestions.push(
        `建议合并 "${group.domain}" 领域的2个专家: ` +
        `${group.experts.map(e => e.name).join(' 和 ')}`
      );
    } else {
      suggestions.push(
        `建议合并 "${group.domain}" 领域的${group.experts.length}个专家: ` +
        `${group.experts.map(e => e.name).join('、')}`
      );
    }
  }

  return { duplicateGroups, suggestions };
}

/**
 * 合并多个相似专家为一个综合专家
 */
export async function mergeExperts(experts: ExpertConfig[]): Promise<ExpertConfig> {
  if (experts.length === 0) {
    throw new Error('至少需要一个专家才能合并');
  }

  if (experts.length === 1) {
    return experts[0];
  }

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com' : undefined;
  const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini';

  const openai = new OpenAI({ apiKey, baseURL });

  const prompt = `你是专家配置合并助手。请将多个相似专家合并为一个综合专家。

**待合并的专家配置:**
${experts.map((e, i) => `
专家 ${i + 1}:
${JSON.stringify(e, null, 2)}
`).join('\n')}

**任务:**
1. 选择最合适的名字(或创建新名字)
2. 合并所有 knowledge_scope,去重并整理为 6-10 项核心知识点
3. 合并所有 specialization_tags,去重
4. 综合所有专家的 law_mapping,选择最重要的法则
5. 创建一个新的、更全面的 prompt_template
6. 保留最高的 expertise_depth
7. 使用第一个专家的 id(或生成更好的 id)
8. 设置 version 为 2.0.0(表示合并版本)
9. 添加 merged_from 字段,列出被合并的专家 id

返回完整的合并后的专家配置 JSON。`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: '你是专家配置合并助手。只返回有效的 JSON。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    let content = completion.choices[0]?.message?.content || '{}';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const mergedExpert = JSON.parse(content);

    // 确保关键字段
    mergedExpert.created_at = new Date().toISOString();
    mergedExpert.created_by = 'expert_merger';
    mergedExpert.merged_from = experts.map(e => e.id);

    return mergedExpert as ExpertConfig;
  } catch (error) {
    console.error('合并专家配置时出错:', error);
    // 返回第一个专家作为备用
    return experts[0];
  }
}
