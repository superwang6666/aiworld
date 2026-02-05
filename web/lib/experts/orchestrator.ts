import OpenAI from "openai";

import type {
  ExpertConfig,
  ExpertResponse,
  GapAnalysis,
  DEACContext,
  Law,
} from "@/types";

import { logger } from "@/lib/utils/logger";

interface DispatchInput {
  experts: ExpertConfig[];
  heterogeneity_point: string;
  gap_analysis: GapAnalysis;
  context: DEACContext;
}

interface DispatchResult {
  activated_experts: string[];
  expert_responses: ExpertResponse[];
}

/**
 * 激活相关专家并收集他们的响应
 */
export async function dispatchExperts(
  input: DispatchInput,
): Promise<DispatchResult> {
  const {
    experts,
    heterogeneity_point,
    gap_analysis: _gap_analysis,
    context,
  } = input;

  // 根据法则覆盖确定要激活哪些专家
  const impactedLaws =
    context.validation_result?.lawImpacts?.map((li) => li.law) || [];
  const relevantExperts = selectRelevantExperts(
    experts,
    impactedLaws,
    context.user_preferences?.max_experts,
  );

  // 并行收集响应
  const responses = await Promise.all(
    relevantExperts.map((expert) =>
      queryExpert(expert, heterogeneity_point, context),
    ),
  );

  return {
    activated_experts: relevantExperts.map((e) => e.id),
    expert_responses: responses,
  };
}

/**
 * 根据法则影响选择最相关的专家
 */
function selectRelevantExperts(
  experts: ExpertConfig[],
  impactedLaws: Law[],
  maxExperts?: number,
): ExpertConfig[] {
  // 对每个专家按相关性评分
  const scored = experts.map((expert) => {
    let score = 0;
    expert.law_mapping.primary.forEach((law) => {
      if (impactedLaws.includes(law)) score += 2;
    });
    expert.law_mapping.secondary?.forEach((law) => {
      if (impactedLaws.includes(law)) score += 1;
    });
    return { expert, score };
  });

  // 按分数排序并取前 N 名
  scored.sort((a, b) => b.score - a.score);
  const topExperts = scored.filter((s) => s.score > 0).map((s) => s.expert);

  if (maxExperts && topExperts.length > maxExperts) {
    return topExperts.slice(0, maxExperts);
  }

  return topExperts;
}

/**
 * 使用 LLM 和提示词模板查询单个专家
 */
async function queryExpert(
  expert: ExpertConfig,
  heterogeneity_point: string,
  context: DEACContext,
): Promise<ExpertResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.DEEPSEEK_API_KEY
    ? "https://api.deepseek.com"
    : undefined;
  const model = process.env.DEEPSEEK_API_KEY ? "deepseek-chat" : "gpt-4o-mini";

  const openai = new OpenAI({ apiKey, baseURL });

  // 填充提示词模板
  const systemPrompt = expert.prompt_template
    .replace("{{heterogeneity_point}}", heterogeneity_point)
    .replace("{{knowledge_scope}}", expert.knowledge_scope.join("、"));

  const userPrompt = `核心异质点: ${heterogeneity_point}

${
  context.validation_result
    ? `
验证上下文:
- 独特性评分: ${context.validation_result.uniquenessScore}/100
- 识别的核心异质点: ${context.validation_result.coreAnomalyIdentified}
- 橡皮擦测试结论: ${context.validation_result.eraserTest.verdict}
`
    : ""
}

请以有效的 JSON 格式提供你的专家分析:
{
  "analysis": "你的主要专家洞察(2-3段)",
  "law_impacts": [
    {
      "law": "法则名称",
      "prediction": "对这个法则的具体预测",
      "confidence": 0.85
    }
  ],
  "warnings": ["警告1", "警告2"],
  "suggestions": ["建议1", "建议2"],
  "reasoning_trace": "可选:展示你的推理过程"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    let content = completion.choices[0]?.message?.content || "{}";

    // 清理可能的 markdown 代码块
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    const response = JSON.parse(content);

    return {
      expert_id: expert.id,
      expert_name: expert.name,
      domain: expert.domain,
      analysis: response.analysis || "",
      law_impacts: response.law_impacts || [],
      warnings: response.warnings || [],
      suggestions: response.suggestions || [],
      reasoning_trace: response.reasoning_trace,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Expert query failed", { expertName: expert.name, error });
    // 返回错误响应
    return {
      expert_id: expert.id,
      expert_name: expert.name,
      domain: expert.domain,
      analysis: "专家分析暂时不可用",
      law_impacts: [],
      warnings: ["专家响应失败"],
      suggestions: [],
      timestamp: new Date().toISOString(),
    };
  }
}
