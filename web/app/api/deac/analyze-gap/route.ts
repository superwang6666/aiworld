import { NextRequest, NextResponse } from 'next/server';
import { analyzeGaps } from '@/lib/experts/gap-analyzer';
import { loadCoreExperts } from '@/lib/experts/loader';

/**
 * POST /api/deac/analyze-gap
 *
 * 分析异质点以检测专家覆盖差距
 *
 * 请求体:
 * {
 *   heterogeneity_point: string,
 *   validation_result: ValidationResult
 * }
 *
 * 响应:
 * {
 *   gap_analysis: GapAnalysis
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { heterogeneity_point, validation_result } = await request.json();

    if (!heterogeneity_point) {
      return NextResponse.json(
        { error: '缺少 heterogeneity_point 参数' },
        { status: 400 }
      );
    }

    // 加载所有核心专家
    const coreExperts = await loadCoreExperts();

    // 根据法则影响和专家覆盖分析差距
    const gapAnalysis = await analyzeGaps({
      heterogeneity_point,
      validation_result,
      available_experts: coreExperts,
    });

    return NextResponse.json({ gap_analysis: gapAnalysis });
  } catch (error: any) {
    console.error('分析差距时出错:', error);
    return NextResponse.json(
      { error: error.message || '差距分析失败' },
      { status: 500 }
    );
  }
}
