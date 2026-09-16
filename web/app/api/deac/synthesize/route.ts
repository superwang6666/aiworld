import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { ExpertResponse } from "@/types";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/types/i18n";

import {
  synthesizeWithWeights,
  detectDisagreements,
  generateEmergentInsights,
  identifyConsensus,
} from "@/lib/deac/weighted-synthesis";
import { createChatCompletion } from "@/lib/utils/llm-client";
import { logger } from "@/lib/utils/logger";
import { loadSynthesizePrompts } from "@/lib/utils/prompt-loader";
import { enforceRateLimit, RATE_LIMIT_PRESETS } from "@/lib/utils/rate-limit";

import type { Locale } from "@/types/i18n";

/**
 * POST /api/deac/synthesize
 *
 * 将多个专家视角综合为连贯的洞察
 * 使用加权复合解释算法进行数学化综合
 *
 * 请求体:
 * {
 *   expert_responses: ExpertResponse[],
 *   heterogeneity_point: string,
 *   law_weights?: LawWeight[]  // 可选：法则权重
 * }
 *
 * 响应:
 * {
 *   synthesis: {
 *     consensus: string,
 *     disagreements: Array<{topic, perspectives}>,
 *     emergent_insights: string[],
 *     risk_assessment: string
 *   },
 *   weighted_predictions?: WeightedPrediction[]  // 如果提供了法则权重
 * }
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, "deac-synthesize", RATE_LIMIT_PRESETS.llmHeavy);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { expert_responses, heterogeneity_point, law_weights, locale: requestLocale } =
      await request.json();

    if (!expert_responses || expert_responses.length === 0) {
      return NextResponse.json({ error: "没有提供专家响应" }, { status: 400 });
    }

    // 验证并获取语言设置
    const locale: Locale =
      requestLocale && SUPPORTED_LOCALES.includes(requestLocale)
        ? requestLocale
        : DEFAULT_LOCALE;

    // ==================== 加权综合算法 ====================
    let weightedPredictions = null;
    let mathConsensus = null;

    if (law_weights && Array.isArray(law_weights) && law_weights.length > 0) {
      // 使用复合解释算法
      weightedPredictions = synthesizeWithWeights(
        expert_responses,
        law_weights,
      );

      // 识别共识
      const consensusData = identifyConsensus(weightedPredictions);

      mathConsensus = {
        highPriorityLaws: consensusData.highPriorityLaws,
        convergence: consensusData.convergentPredictions,
      };
    }

    // ==================== AI 辅助综合 ====================

    // 使用算法生成涌现洞察和分歧检测
    const emergentInsights = weightedPredictions
      ? generateEmergentInsights(expert_responses, weightedPredictions)
      : [];

    const disagreements = detectDisagreements(expert_responses, 0.3);

    // 从 i18n 加载提示词
    const mathInsightsSection = mathConsensus
      ? `
加权综合算法结果:
- 高优先级法则: ${mathConsensus.highPriorityLaws.join(", ")}
- 涌现洞察: ${emergentInsights.join("; ")}
- 检测到的分歧: ${disagreements.length > 0 ? disagreements.map((d) => d.law).join(", ") : "无"}
`
      : "";

    const expertAnalyses = expert_responses
      .map(
        (r: ExpertResponse, i: number) => `
专家 ${i + 1}: ${r.expert_name} (${r.domain})
${r.analysis}
${r.warnings?.length ? `警告: ${r.warnings.join("; ")}` : ""}
`,
      )
      .join("\n---\n");

    const emergentNote = emergentInsights.length > 0
      ? "\n   注意: 算法已生成基础洞察，请在此基础上深化"
      : "";

    const prompts = loadSynthesizePrompts(locale);
    const userPrompt = prompts.userTemplate(
      heterogeneity_point,
      mathInsightsSection,
      expertAnalyses,
      emergentNote
    );

    // 保留原本"拿不到内容就退化成 {} 继续走默认综合结构"的容错行为,
    // 不让 LLM 这一步的失败拖垮已经算好的 weightedPredictions/mathConsensus
    let content: string;
    try {
      content = await createChatCompletion({
        systemPrompt: prompts.system,
        userPrompt,
        temperature: 0.7,
        jsonMode: true,
      });
    } catch {
      content = "{}";
    }

    // 清理可能的 markdown 代码块
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    // 清理可能的前后空白
    content = content.trim();

    let synthesis;
    try {
      synthesis = JSON.parse(content);
    } catch (parseError) {
      logger.error("JSON parsing failed for synthesis", {
        content: content.substring(0, 200),
        error: parseError instanceof Error ? parseError.message : parseError,
      });

      // 尝试修复常见的 JSON 问题
      try {
        // 移除可能的 BOM 或其他不可见字符
        content = content.replace(/^\uFEFF/, "");

        // 替换中文引号为英文引号
        content = content.replace(/'/g, "'").replace(/'/g, "'");
        content = content.replace(/"/g, '"').replace(/"/g, '"');

        // 尝试找到 JSON 对象的开始和结束
        const jsonStart = content.indexOf("{");
        const jsonEnd = content.lastIndexOf("}");

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const extractedJson = content.substring(jsonStart, jsonEnd + 1);
          synthesis = JSON.parse(extractedJson);
          logger.info("Successfully extracted JSON from response");
        } else {
          throw new Error("无法从响应中提取有效的 JSON 对象");
        }
      } catch (_retryError) {
        // 如果仍然失败，返回一个默认结构
        logger.warn("JSON repair failed, using default structure");
        synthesis = {
          consensus: "由于 AI 响应格式问题，综合分析暂时不可用。",
          disagreements: [],
          emergent_insights:
            emergentInsights.length > 0
              ? emergentInsights
              : ["请查看各专家的详细分析"],
          risk_assessment: "请参考各专家的独立风险评估。",
        };
      }
    }

    // 返回综合结果 + 加权预测（如果有）
    return NextResponse.json({
      synthesis,
      weighted_predictions: weightedPredictions,
      math_consensus: mathConsensus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "响应综合失败";
    logger.error("Expert synthesis failed", { error: message });
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
