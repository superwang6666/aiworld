import type { ExpertResponse, LawWeight, Law, ExpertConfig } from "@/types";

/**
 * 加权预测结果
 */
export interface WeightedPrediction {
  law: Law;
  prediction: string;
  weightedScore: number; // 综合多个专家的加权分数
  contributingExperts: {
    expert: string;
    domain: string;
    confidence: number;
    expertiseDepth: number;
    weight: number;
  }[];
}

/**
 * 复合解释算法
 *
 * 数学公式：
 * 对每个法则L:
 *   WeightedScore(L) = Σ(confidence_i × expertise_depth_i × law_weight) / Σ(expertise_depth_i)
 *
 * 其中：
 * - confidence_i: 专家i对该法则的信心度 (0-1)
 * - expertise_depth_i: 专家i的专业深度 (1-10)
 * - law_weight: 该法则的权重 (0-1)
 */
export function synthesizeWithWeights(
  expertResponses: ExpertResponse[],
  lawWeights: LawWeight[],
  expertConfigs?: ExpertConfig[], // 可选：专家配置，用于获取 expertise_depth
): WeightedPrediction[] {
  const predictions: WeightedPrediction[] = [];

  // 为每个法则计算加权预测
  for (const lawWeight of lawWeights) {
    const law = lawWeight.law;
    const lawWeightValue = lawWeight.weight;

    // 收集所有专家对该法则的预测
    const expertContributions: WeightedPrediction["contributingExperts"] = [];
    let totalWeightedScore = 0;
    let totalExpertiseDepth = 0;

    for (const expertResponse of expertResponses) {
      // 查找该专家对这个法则的预测
      const lawImpact = expertResponse.law_impacts.find((li) => li.law === law);

      if (!lawImpact) {
        continue; // 该专家没有对这个法则做预测
      }

      // 获取专家的 expertise_depth（如果有配置）
      const expertConfig = expertConfigs?.find(
        (ec) => ec.id === expertResponse.expert_id,
      );
      const expertiseDepth = expertConfig?.expertise_depth || 5; // 默认值为5

      const confidence = lawImpact.confidence;

      // 计算该专家的加权贡献
      const expertWeight = confidence * expertiseDepth * lawWeightValue;

      totalWeightedScore += expertWeight;
      totalExpertiseDepth += expertiseDepth;

      expertContributions.push({
        expert: expertResponse.expert_name,
        domain: expertResponse.domain,
        confidence: confidence,
        expertiseDepth: expertiseDepth,
        weight: expertWeight,
      });
    }

    // 归一化得分（如果有专家贡献）
    const finalScore =
      totalExpertiseDepth > 0 ? totalWeightedScore / totalExpertiseDepth : 0;

    // 综合专家预测生成最终预测
    const prediction = synthesizePredictionText(
      law,
      expertResponses,
      expertContributions,
    );

    predictions.push({
      law,
      prediction,
      weightedScore: finalScore,
      contributingExperts: expertContributions.sort(
        (a, b) => b.weight - a.weight,
      ), // 按权重降序
    });
  }

  // 按加权分数降序排序
  return predictions.sort((a, b) => b.weightedScore - a.weightedScore);
}

/**
 * 综合多个专家的预测文本
 */
function synthesizePredictionText(
  law: Law,
  expertResponses: ExpertResponse[],
  expertContributions: WeightedPrediction["contributingExperts"],
): string {
  if (expertContributions.length === 0) {
    return `No expert predictions available for ${law}.`;
  }

  // 收集所有专家的预测文本
  const predictions: string[] = [];

  for (const contribution of expertContributions) {
    const expertResponse = expertResponses.find(
      (er) => er.expert_name === contribution.expert,
    );

    if (expertResponse) {
      const lawImpact = expertResponse.law_impacts.find((li) => li.law === law);
      if (lawImpact && lawImpact.prediction) {
        predictions.push(lawImpact.prediction);
      }
    }
  }

  if (predictions.length === 0) {
    return `Multiple experts analyzed ${law}, but no specific predictions were provided.`;
  }

  // 如果只有一个专家预测，直接返回
  if (predictions.length === 1) {
    return predictions[0];
  }

  // 多个专家预测：综合为一段文字
  // 选择权重最高的专家作为主要观点
  const primaryPrediction = predictions[0];

  // 如果其他专家有补充观点，添加
  const additionalInsights = predictions.slice(1, 3); // 最多取2个补充观点

  if (additionalInsights.length > 0) {
    return `${primaryPrediction} Additionally, ${additionalInsights.join(" ")}`;
  }

  return primaryPrediction;
}

/**
 * 识别专家共识
 */
export function identifyConsensus(predictions: WeightedPrediction[]): {
  highPriorityLaws: Law[];
  convergentPredictions: { law: Law; consensusLevel: number }[];
} {
  // 高优先级法则（加权分数前3）
  const highPriorityLaws = predictions.slice(0, 3).map((p) => p.law);

  // 专家收敛度（多少专家对该法则有预测）
  const convergentPredictions = predictions.map((p) => ({
    law: p.law,
    consensusLevel:
      p.contributingExperts.length / predictions[0].contributingExperts.length,
  }));

  return {
    highPriorityLaws,
    convergentPredictions,
  };
}

/**
 * 检测专家分歧
 */
export interface ExpertDisagreement {
  law: Law;
  divergence: number; // 0-1，越高表示分歧越大
  perspectives: {
    expert: string;
    prediction: string;
    confidence: number;
  }[];
}

export function detectDisagreements(
  expertResponses: ExpertResponse[],
  threshold: number = 0.3, // 置信度差异阈值
): ExpertDisagreement[] {
  const disagreements: ExpertDisagreement[] = [];

  // 按法则分组专家预测
  const predictionsByLaw = new Map<
    Law,
    {
      expert: string;
      prediction: string;
      confidence: number;
    }[]
  >();

  for (const expertResponse of expertResponses) {
    for (const lawImpact of expertResponse.law_impacts) {
      if (!predictionsByLaw.has(lawImpact.law)) {
        predictionsByLaw.set(lawImpact.law, []);
      }

      predictionsByLaw.get(lawImpact.law)!.push({
        expert: expertResponse.expert_name,
        prediction: lawImpact.prediction,
        confidence: lawImpact.confidence,
      });
    }
  }

  // 检测每个法则的分歧
  for (const [law, perspectives] of predictionsByLaw.entries()) {
    if (perspectives.length < 2) {
      continue; // 只有一个专家，无分歧
    }

    // 计算置信度方差（分歧指标）
    const confidences = perspectives.map((p) => p.confidence);
    const avgConfidence =
      confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    const variance =
      confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) /
      confidences.length;
    const divergence = Math.sqrt(variance); // 标准差

    if (divergence >= threshold) {
      disagreements.push({
        law,
        divergence,
        perspectives,
      });
    }
  }

  return disagreements.sort((a, b) => b.divergence - a.divergence);
}

/**
 * 生成综合洞察
 *
 * 结合多个专家的分析，提取新的洞察
 */
export function generateEmergentInsights(
  expertResponses: ExpertResponse[],
  predictions: WeightedPrediction[],
): string[] {
  const insights: string[] = [];

  // 洞察1: 跨法则影响模式
  const highImpactLaws = predictions.slice(0, 3).map((p) => p.law);
  insights.push(
    `The core premise primarily impacts ${highImpactLaws.join(", ")}, suggesting these laws are most fundamentally altered by the anomaly.`,
  );

  // 洞察2: 专家收敛/分歧
  const consensusAnalysis = identifyConsensus(predictions);
  const highConsensus = consensusAnalysis.convergentPredictions.filter(
    (c) => c.consensusLevel > 0.8,
  );

  if (highConsensus.length > 0) {
    insights.push(
      `Strong expert consensus exists on ${highConsensus.map((c) => c.law).join(", ")}, indicating clear logical implications.`,
    );
  }

  // 洞察3: 次级效应
  const secondaryEffects = predictions.filter(
    (p) => p.weightedScore > 0.1 && !highImpactLaws.includes(p.law),
  );

  if (secondaryEffects.length > 0) {
    insights.push(
      `Secondary ripple effects are predicted in ${secondaryEffects.map((p) => p.law).join(", ")}, creating a cascading impact across the world system.`,
    );
  }

  // 洞察4: 专家特定警告
  const allWarnings = expertResponses
    .flatMap((er) => er.warnings || [])
    .filter((w, i, arr) => arr.indexOf(w) === i); // 去重

  if (allWarnings.length > 0) {
    insights.push(
      `Critical warnings identified: ${allWarnings.slice(0, 2).join("; ")}`,
    );
  }

  return insights;
}
