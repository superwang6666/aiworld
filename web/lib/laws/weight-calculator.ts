import { ValidationResult, LawWeight, Law } from '@/types';

/**
 * 法则权重计算器
 * 根据 ValidationResult 自动计算每个法则的权重和建议规则数量
 */

const TOTAL_RULES = 20; // 总规则数量
const MIN_RULES_PER_LAW = 1; // 每个法则最少规则数
const ALL_LAWS: Law[] = ['Space', 'Survival', 'Cognition', 'Scarcity', 'Time', 'Power', 'Metaphysics'];

/**
 * 计算法则权重
 * @param validationResult 验证结果
 * @returns 法则权重数组
 */
export function calculateLawWeights(validationResult: ValidationResult): LawWeight[] {
  // 步骤1: 从 lawImpacts 提取原始分数
  const rawScores = new Map<Law, number>();

  for (const impact of validationResult.lawImpacts) {
    // 基础分数来自 uniquenessScore（如果存在）
    let score = impact.uniquenessScore || 50;

    // 如果没有 uniquenessScore，使用启发式评估
    if (!impact.uniquenessScore) {
      score = estimateImpactScore(impact.impact);
    }

    rawScores.set(impact.law, score);
  }

  // 步骤2: 从 eraserTest 识别核心法则（提升权重）
  const coreAnomalyText = validationResult.coreAnomalyIdentified.toLowerCase();
  const eraserAnalysis = validationResult.eraserTest.analysis.toLowerCase();

  for (const law of ALL_LAWS) {
    const lawLower = law.toLowerCase();
    const currentScore = rawScores.get(law) || 0;

    // 如果在核心异质点描述中多次提及，提升权重
    const mentionsInCore = (coreAnomalyText.match(new RegExp(lawLower, 'g')) || []).length;
    const mentionsInEraser = (eraserAnalysis.match(new RegExp(lawLower, 'g')) || []).length;

    const bonus = (mentionsInCore * 15) + (mentionsInEraser * 10);
    rawScores.set(law, currentScore + bonus);
  }

  // 步骤3: 特殊提升 - Metaphysics 在高独特性场景下权重更高
  if (validationResult.uniquenessScore >= 70) {
    const metaphysicsScore = rawScores.get('Metaphysics') || 0;
    rawScores.set('Metaphysics', metaphysicsScore * 1.3);
  }

  // 步骤4: 归一化权重（总和=1）
  const totalRawScore = Array.from(rawScores.values()).reduce((sum, score) => sum + score, 0);
  const normalizedWeights = new Map<Law, number>();

  for (const [law, score] of rawScores.entries()) {
    normalizedWeights.set(law, totalRawScore > 0 ? score / totalRawScore : 1 / ALL_LAWS.length);
  }

  // 步骤5: 分配规则数量
  const rulesCounts = allocateRules(normalizedWeights);

  // 步骤6: 构建结果
  const lawWeights: LawWeight[] = ALL_LAWS.map(law => {
    const weight = normalizedWeights.get(law) || 0;
    const rulesCount = rulesCounts.get(law) || MIN_RULES_PER_LAW;

    return {
      law,
      weight,
      impactLevel: determineImpactLevel(weight),
      rulesCount,
      reasoning: generateReasoning(law, weight, validationResult)
    };
  });

  // 按权重降序排序
  lawWeights.sort((a, b) => b.weight - a.weight);

  return lawWeights;
}

/**
 * 估算影响分数（基于文本描述）
 */
function estimateImpactScore(impactText: string): number {
  const text = impactText.toLowerCase();

  // 关键词权重表
  const keywords = {
    high: ['fundamental', 'completely', 'radical', '根本', '完全', '彻底', '核心'],
    medium: ['significant', 'major', 'important', '重要', '显著', '主要'],
    low: ['minor', 'slight', 'minimal', '轻微', '较小', '次要']
  };

  let score = 50; // 基础分数

  // 检测高影响关键词
  for (const keyword of keywords.high) {
    if (text.includes(keyword)) {
      score += 15;
    }
  }

  // 检测中等影响关键词
  for (const keyword of keywords.medium) {
    if (text.includes(keyword)) {
      score += 8;
    }
  }

  // 检测低影响关键词
  for (const keyword of keywords.low) {
    if (text.includes(keyword)) {
      score -= 10;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * 分配规则数量
 */
function allocateRules(weights: Map<Law, number>): Map<Law, number> {
  const counts = new Map<Law, number>();
  let remainingRules = TOTAL_RULES;

  // 第一轮：按权重比例分配
  const sortedLaws = Array.from(weights.entries()).sort((a, b) => b[1] - a[1]);

  for (const [law, weight] of sortedLaws) {
    const allocated = Math.max(MIN_RULES_PER_LAW, Math.round(weight * TOTAL_RULES));
    counts.set(law, allocated);
    remainingRules -= allocated;
  }

  // 第二轮：调整到精确总数
  while (remainingRules !== 0) {
    if (remainingRules > 0) {
      // 还有剩余规则，分配给权重最高的法则
      const highestLaw = sortedLaws[0][0];
      counts.set(highestLaw, (counts.get(highestLaw) || 0) + 1);
      remainingRules--;
    } else {
      // 超出了，从权重最低的法则减少（但保持最小值）
      for (let i = sortedLaws.length - 1; i >= 0 && remainingRules < 0; i--) {
        const law = sortedLaws[i][0];
        const current = counts.get(law) || 0;
        if (current > MIN_RULES_PER_LAW) {
          counts.set(law, current - 1);
          remainingRules++;
        }
      }
      // 如果还是超出，从高权重法则减少
      if (remainingRules < 0) {
        const highestLaw = sortedLaws[0][0];
        counts.set(highestLaw, (counts.get(highestLaw) || 0) - 1);
        remainingRules++;
      }
    }
  }

  return counts;
}

/**
 * 确定影响级别
 */
function determineImpactLevel(weight: number): 'critical' | 'major' | 'minor' | 'negligible' {
  if (weight >= 0.25) return 'critical';
  if (weight >= 0.15) return 'major';
  if (weight >= 0.08) return 'minor';
  return 'negligible';
}

/**
 * 生成权重原因说明
 */
function generateReasoning(law: Law, weight: number, validationResult: ValidationResult): string {
  const impact = validationResult.lawImpacts.find(i => i.law === law);

  if (!impact) {
    return `${law} 权重 ${(weight * 100).toFixed(1)}%`;
  }

  const percentage = (weight * 100).toFixed(1);
  const level = determineImpactLevel(weight);

  const levelDescriptions = {
    critical: '核心法则',
    major: '主要影响',
    minor: '次要影响',
    negligible: '轻微影响'
  };

  return `${law} (${percentage}%) - ${levelDescriptions[level]}: ${impact.impact.substring(0, 80)}${impact.impact.length > 80 ? '...' : ''}`;
}

/**
 * 验证规则分配是否符合权重
 * @param actualCounts 实际生成的规则数量
 * @param lawWeights 法则权重
 * @param tolerance 允许的误差（默认±1）
 */
export function validateRuleDistribution(
  actualCounts: Map<Law, number>,
  lawWeights: LawWeight[],
  tolerance: number = 1
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const lw of lawWeights) {
    const actual = actualCounts.get(lw.law) || 0;
    const expected = lw.rulesCount;
    const diff = Math.abs(actual - expected);

    if (diff > tolerance) {
      errors.push(`${lw.law}: 期望${expected}条规则，实际${actual}条（误差${diff}）`);
    }
  }

  // 检查总数
  const totalActual = Array.from(actualCounts.values()).reduce((sum, count) => sum + count, 0);
  if (totalActual !== TOTAL_RULES) {
    errors.push(`总规则数错误: 期望${TOTAL_RULES}条，实际${totalActual}条`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
