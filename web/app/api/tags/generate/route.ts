import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { generateTagsForRules } from "@/lib/tags/tag-generator";

/**
 * POST /api/tags/generate
 *
 * 为多个世界规则生成标签
 *
 * Request Body:
 * {
 *   rules: WorldRule[]
 *   tagWeights: Record<string, RuleTag>  // 当前标签权重
 * }
 *
 * Response:
 * {
 *   rules: WorldRule[]  // 带标签的规则
 *   updatedWeights: Record<string, RuleTag>  // 更新后的标签权重
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rules, tagWeights } = body;

    // 验证请求
    if (!rules || !Array.isArray(rules)) {
      return NextResponse.json(
        { error: "Invalid request: rules array is required" },
        { status: 400 },
      );
    }

    if (rules.length === 0) {
      return NextResponse.json({ rules: [], updatedWeights: tagWeights || {} });
    }

    // 生成标签
    const results = await generateTagsForRules(rules);

    // 将标签结果应用到规则上
    const rulesWithTags = rules.map((rule) => {
      const tagResult = results.find((r) => r.ruleId === rule.id);
      if (!tagResult) {
        return { ...rule, tags: [], deletion_score: 0.5 };
      }

      return {
        ...rule,
        tags: tagResult.recommendedTagIds,
        deletion_score: 0.5, // 初始删除评分
      };
    });

    // 更新标签权重 - 合并LLM生成的新标签
    let updatedWeights = { ...tagWeights };
    const allNewTags = results.flatMap((r) => r.llmGeneratedTags);

    if (allNewTags.length > 0) {
      // 动态导入以避免循环依赖
      const { mergeNewTags } = await import("@/lib/tags/tag-manager");
      updatedWeights = mergeNewTags(allNewTags, updatedWeights);
    }

    return NextResponse.json({
      rules: rulesWithTags,
      updatedWeights: updatedWeights,
    });
  } catch (error) {
    // Error handled silently
    return NextResponse.json(
      {
        error: "标签生成失败",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
