import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";


import { DEFAULT_LOCALE } from "@/types/i18n";

import { analyzeGaps } from "@/lib/experts/gap-analyzer";
import { loadCoreExperts } from "@/lib/experts/loader";

/**
 * POST /api/deac/analyze-gap
 *
 * 分析异质点以检测专家覆盖差距
 *
 * 请求体:
 * {
 *   heterogeneity_point: string,
 *   validation_result: ValidationResult,
 *   locale?: Locale
 * }
 *
 * 响应:
 * {
 *   gap_analysis: GapAnalysis
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { heterogeneity_point, validation_result, locale = DEFAULT_LOCALE } =
      await request.json();

    if (!heterogeneity_point) {
      return NextResponse.json(
        { error: "缺少 heterogeneity_point 参数" },
        { status: 400 },
      );
    }

    // 加载所有核心专家（使用指定语言）
    const coreExperts = await loadCoreExperts(locale);

    // 根据法则影响和专家覆盖分析差距
    const gapAnalysis = await analyzeGaps({
      heterogeneity_point,
      validation_result,
      available_experts: coreExperts,
      locale,
    });

    return NextResponse.json({ gap_analysis: gapAnalysis });
  } catch (error: any) {
    // Error handled silently
    return NextResponse.json(
      { error: error.message || "差距分析失败" },
      { status: 500 },
    );
  }
}
