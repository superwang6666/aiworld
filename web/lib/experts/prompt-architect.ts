import OpenAI from 'openai';
import { ExpertConfig, ValidationResult } from '@/types';
import { smartMatchExpert } from './expert-matcher';
import { cacheSpecialExpert } from '@/lib/deac/cache-manager';

interface SpecialExpertRequest {
  domain: string;
  reason: string;
  knowledge_scope: string[];
  heterogeneity_point: string;
  validation_result?: ValidationResult;
}

/**
 * 智能生成或复用特殊专家
 *
 * 此函数会:
 * 1. 检查已缓存的特殊专家
 * 2. 如果找到相似的专家则复用或更新
 * 3. 只在必要时创建新专家
 */
export async function generateSpecialExpert(request: SpecialExpertRequest): Promise<ExpertConfig> {
  console.log(`\n🔍 正在为领域 "${request.domain}" 智能匹配专家...`);

  // 使用智能匹配器
  const matchResult = await smartMatchExpert(request);

  if (matchResult.action === 'reuse') {
    console.log(`♻️  ${matchResult.reason}`);
    return matchResult.expert!;
  } else if (matchResult.action === 'update') {
    console.log(`🔄 ${matchResult.reason}`);
    return matchResult.expert!;
  } else {
    console.log(`✨ ${matchResult.reason}`);
    console.log(`正在创建新的特殊专家...`);

    // 创建新专家
    const newExpert = await generateNewSpecialExpert(request);

    // 缓存新专家
    await cacheSpecialExpert(newExpert);

    console.log(`✅ 已创建并缓存新专家: ${newExpert.name}\n`);
    return newExpert;
  }
}

/**
 * 使用 LLM 生成新的特殊专家配置(内部函数)
 */
async function generateNewSpecialExpert(request: SpecialExpertRequest): Promise<ExpertConfig> {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com' : undefined;
  const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini';

  const openai = new OpenAI({ apiKey, baseURL });

  const generation_prompt = `你是提示词建筑师代理(Prompt Architect Agent),负责为世界构建分析创建专家角色。

**任务:** 为分析这个核心异质点生成一个专业化的专家配置。

**所需专业领域:** ${request.domain}
**需要原因:** ${request.reason}
**核心异质点:** ${request.heterogeneity_point}
**知识领域:** ${request.knowledge_scope.join('、')}

**指示:**
1. 创建一个独特的专家角色,有一个易记的中文名字(如"XXX博士"或"XXX教授")
2. 定义他们具体的 knowledge_scope (5-8项,用中文)
3. 将他们映射到主要和次要法则: Space(空间), Survival(生存), Cognition(认知), Scarcity(稀缺), Time(时间), Power(权力), Metaphysics(形而上)
4. 编写详细的 prompt_template 来指导该专家的分析(使用 {{heterogeneity_point}} 和 {{knowledge_scope}} 作为占位符,用中文撰写)
5. 选择 reasoning_style: analytical(分析型), holistic(整体型), adversarial(批判型), speculative(推测型), 或 empirical(实证型)
6. 设置 expertise_depth (1-10, 对特殊专家使用 6-9)
7. 添加相关的 specialization_tags(用中文)

只返回有效的 JSON,必须严格符合以下结构:
{
  "id": "kebab-case-id",
  "version": "1.0.0",
  "name": "博士/教授全名",
  "domain": "${request.domain}",
  "knowledge_scope": ["项目1", "项目2"],
  "law_mapping": {
    "primary": ["Law1", "Law2"],
    "secondary": ["Law3"]
  },
  "prompt_template": "你是[姓名]...",
  "reasoning_style": "analytical",
  "expertise_depth": 7,
  "specialization_tags": ["标签1", "标签2"],
  "created_by": "prompt_architect",
  "created_at": "${new Date().toISOString()}"
}`;

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: '你是提示词建筑师代理。仅生成有效的 JSON 格式的专家配置。' },
      { role: 'user', content: generation_prompt },
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  let content = completion.choices[0]?.message?.content || '{}';

  // 清理可能的 markdown 代码块
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  const expertConfig = JSON.parse(content);
  return expertConfig as ExpertConfig;
}
