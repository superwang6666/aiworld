import type { ValidationResult, LawWeight, DEACAnalysis } from "@/types";

/**
 * 验证前提结果接口
 */
export interface ValidatePremiseResult {
  validationResult: ValidationResult;
  lawWeights: LawWeight[];
}

/**
 * 验证核心前提
 */
export async function validatePremise(
  corePremise: string,
): Promise<ValidatePremiseResult> {
  const response = await fetch("/api/validate-premise", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      corePremise: corePremise.trim(),
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to validate premise");
  }

  const data = await response.json();

  return {
    validationResult: data,
    lawWeights: data.lawWeights || [],
  };
}

/**
 * 触发 DEAC 专家分析
 */
export async function triggerDEACAnalysis(
  corePremise: string,
  validationResult: ValidationResult,
  lawWeights: LawWeight[],
): Promise<DEACAnalysis> {
  // 1. 差距分析
  const gapResponse = await fetch("/api/deac/analyze-gap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      heterogeneity_point: corePremise.trim(),
      validation_result: validationResult,
    }),
  });

  if (!gapResponse.ok) {
    throw new Error("Failed to analyze gap");
  }

  const gapData = await gapResponse.json();

  // 2. 调度专家
  const dispatchResponse = await fetch("/api/deac/dispatch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      heterogeneity_point: corePremise.trim(),
      gap_analysis: gapData.gap_analysis,
      context: {
        core_premise: corePremise.trim(),
        validation_result: validationResult,
        current_step: "validation",
      },
      generate_special_experts: true,
    }),
  });

  if (!dispatchResponse.ok) {
    throw new Error("Failed to dispatch experts");
  }

  const dispatchData = await dispatchResponse.json();

  // 3. 综合专家响应
  const synthesisResponse = await fetch("/api/deac/synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      expert_responses: dispatchData.expert_responses,
      heterogeneity_point: corePremise.trim(),
      law_weights: lawWeights,
    }),
  });

  if (!synthesisResponse.ok) {
    throw new Error("Failed to synthesize expert responses");
  }

  const synthesisData = await synthesisResponse.json();

  // 4. 构建完整的 DEAC 分析结果
  const deacAnalysis: DEACAnalysis = {
    timestamp: new Date().toISOString(),
    heterogeneity_point: corePremise.trim(),
    gap_analysis: gapData.gap_analysis || {
      heterogeneity_point: corePremise.trim(),
      covered_laws: [],
      uncovered_laws: [],
      partial_coverage: [],
      special_expertise_needed: [],
      confidence_score: 0,
    },
    activated_experts: dispatchData.activated_experts || [],
    expert_responses: dispatchData.expert_responses || [],
    synthesis: synthesisData.synthesis || {
      consensus: "",
      disagreements: [],
      emergent_insights: [],
      risk_assessment: "",
    },
    special_experts_generated: dispatchData.special_experts_generated || [],
  };

  return deacAnalysis;
}

/**
 * 等待 DEAC 完成（用于深度模式）
 */
export async function waitForDEACCompletion(
  checkFn: () => boolean,
  maxWaitTime: number = 30000,
): Promise<boolean> {
  const startTime = Date.now();

  while (checkFn() && Date.now() - startTime < maxWaitTime) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return !checkFn(); // 返回 true 表示完成，false 表示超时
}
