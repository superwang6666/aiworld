import { DEACContext, DEACAnalysis } from '@/types';
import { analyzeGaps } from '@/lib/experts/gap-analyzer';
import { loadCoreExperts } from '@/lib/experts/loader';

/**
 * 主 DEAC 后台服务 - 步骤 2 验证后异步运行
 */
export async function runDEACAnalysis(context: DEACContext): Promise<DEACAnalysis> {
  const startTime = Date.now();

  try {
    // 1. 加载核心专家
    const coreExperts = await loadCoreExperts();

    // 2. 分析差距
    const gapAnalysis = await analyzeGaps({
      heterogeneity_point: context.core_premise,
      validation_result: context.validation_result,
      available_experts: coreExperts,
    });

    // 3. 调度到 /api/deac/dispatch 端点
    const dispatchResponse = await fetch(`${getBaseUrl()}/api/deac/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heterogeneity_point: context.core_premise,
        gap_analysis: gapAnalysis,
        context,
        generate_special_experts: context.user_preferences?.enable_special_generation ?? true,
      }),
    });

    const dispatchData = await dispatchResponse.json();

    // 4. 综合专家响应
    const synthesisResponse = await fetch(`${getBaseUrl()}/api/deac/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expert_responses: dispatchData.expert_responses,
        heterogeneity_point: context.core_premise,
      }),
    });

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

    console.log(`DEAC 分析在 ${Date.now() - startTime}ms 内完成`);
    return analysis;

  } catch (error) {
    console.error('DEAC 后台服务错误:', error);
    throw error;
  }
}

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';
}
