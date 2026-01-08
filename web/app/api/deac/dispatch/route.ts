import { NextRequest, NextResponse } from 'next/server';
import { dispatchExperts } from '@/lib/experts/orchestrator';
import { generateSpecialExpert } from '@/lib/experts/prompt-architect';
import { loadCoreExperts } from '@/lib/experts/loader';
import { cacheSpecialExpert } from '@/lib/deac/cache-manager';
import { analyzeGaps } from '@/lib/experts/gap-analyzer';

/**
 * POST /api/deac/dispatch
 *
 * 激活相关专家并收集他们的视角
 *
 * 请求体:
 * {
 *   heterogeneity_point: string,
 *   gap_analysis: GapAnalysis,
 *   context: DEACContext,
 *   generate_special_experts: boolean (默认: true)
 * }
 *
 * 响应:
 * {
 *   activated_experts: string[],
 *   expert_responses: ExpertResponse[],
 *   special_experts_generated: ExpertConfig[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const {
      heterogeneity_point,
      gap_analysis,
      context,
      generate_special_experts = true
    } = await request.json();

    // 加载核心专家
    const coreExperts = await loadCoreExperts();

    // 如果未提供 gap_analysis,则计算它
    let finalGapAnalysis = gap_analysis;
    if (!finalGapAnalysis) {
      finalGapAnalysis = await analyzeGaps({
        heterogeneity_point,
        validation_result: context.validation_result,
        available_experts: coreExperts,
      });
    }

    // 如果需要,生成特殊专家
    const specialExperts = [];
    if (generate_special_experts && finalGapAnalysis.special_expertise_needed?.length > 0) {
      for (const gap of finalGapAnalysis.special_expertise_needed) {
        try {
          const specialExpert = await generateSpecialExpert({
            domain: gap.domain,
            reason: gap.reason,
            knowledge_scope: gap.suggested_knowledge,
            heterogeneity_point,
            validation_result: context.validation_result,
          });

          // 缓存以备将来使用
          await cacheSpecialExpert(specialExpert);
          specialExperts.push(specialExpert);
        } catch (error) {
          console.error(`生成特殊专家失败 (${gap.domain}):`, error);
          // 继续处理其他专家
        }
      }
    }

    // 调度专家并收集响应
    const allExperts = [...coreExperts, ...specialExperts];
    const dispatch_result = await dispatchExperts({
      experts: allExperts,
      heterogeneity_point,
      gap_analysis: finalGapAnalysis,
      context,
    });

    return NextResponse.json({
      gap_analysis: finalGapAnalysis,
      activated_experts: dispatch_result.activated_experts,
      expert_responses: dispatch_result.expert_responses,
      special_experts_generated: specialExperts,
    });
  } catch (error: any) {
    console.error('调度专家时出错:', error);
    return NextResponse.json(
      { error: error.message || '专家调度失败' },
      { status: 500 }
    );
  }
}
