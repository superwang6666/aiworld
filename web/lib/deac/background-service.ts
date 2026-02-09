import type { DEACContext, DEACAnalysis } from "@/types";


import { DEFAULT_LOCALE } from "@/types/i18n";

import { analyzeGaps } from "@/lib/experts/gap-analyzer";
import { loadCoreExperts } from "@/lib/experts/loader";
import { logger } from "@/lib/utils/logger";

import type { Locale } from "@/types/i18n";

/**
 * 主 DEAC 后台服务 - 步骤 2 验证后异步运行
 */
export async function runDEACAnalysis(
  context: DEACContext,
): Promise<DEACAnalysis> {
  const startTime = Date.now();

  try {
    // 从 context 中提取 locale，如果没有则使用默认值
    const locale: Locale = context.locale || DEFAULT_LOCALE;

    // 1. 加载核心专家（使用指定语言）
    const coreExperts = await loadCoreExperts(locale);

    // 2. 分析差距
    const gapAnalysis = await analyzeGaps({
      heterogeneity_point: context.core_premise,
      validation_result: context.validation_result,
      available_experts: coreExperts,
      locale,
    });

    // 3. 调度到 /api/deac/dispatch 端点（传递 locale）
    const dispatchResponse = await fetch(`${getBaseUrl()}/api/deac/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heterogeneity_point: context.core_premise,
        gap_analysis: gapAnalysis,
        context,
        generate_special_experts:
          context.user_preferences?.enable_special_generation ?? true,
        locale,
      }),
    });

    const dispatchData = await dispatchResponse.json();

    // 4. 综合专家响应
    const synthesisResponse = await fetch(
      `${getBaseUrl()}/api/deac/synthesize`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expert_responses: dispatchData.expert_responses,
          heterogeneity_point: context.core_premise,
        }),
      },
    );

    const synthesisData = await synthesisResponse.json();

    const analysis: DEACAnalysis = {
      timestamp: new Date().toISOString(),
      heterogeneity_point: context.core_premise,
      gap_analysis: gapAnalysis,
      activated_experts: dispatchData.activated_experts,
      expert_responses: dispatchData.expert_responses,
      synthesis: synthesisData.synthesis,
      special_experts_generated: dispatchData.special_experts_generated || [],
    };

    logger.info("DEAC analysis completed", {
      duration: Date.now() - startTime,
    });
    return analysis;
  } catch (error) {
    logger.error("DEAC background service error", { error });
    throw error;
  }
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";
}
