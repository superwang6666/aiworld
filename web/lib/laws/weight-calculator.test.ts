import type { ValidationResult, Law } from "@/types";

import { calculateLawWeights, validateRuleDistribution } from "./weight-calculator";


const ALL_LAWS: Law[] = [
  "Space",
  "Survival",
  "Cognition",
  "Scarcity",
  "Time",
  "Power",
  "Metaphysics",
];

function buildValidationResult(
  overrides: Partial<ValidationResult> = {},
): ValidationResult {
  return {
    isUnique: true,
    uniquenessScore: 60,
    coreAnomalyIdentified: "重力每逢满月就会反转",
    lawImpacts: ALL_LAWS.map((law) => ({
      law,
      impact: `${law} 受到中等影响`,
      example: "示例场景",
      uniquenessScore: 50,
    })),
    eraserTest: {
      originalScenario: "婚礼上宾客悬浮起舞",
      replacementScenario: "普通婚礼",
      analysis: "去掉重力反转后场景失去意义",
      verdict: "structural",
    },
    warnings: [],
    recommendations: [],
    ...overrides,
  };
}

describe("calculateLawWeights", () => {
  it("returns exactly one weight entry per law", () => {
    const result = calculateLawWeights(buildValidationResult());

    expect(result).toHaveLength(ALL_LAWS.length);
    expect(new Set(result.map((r) => r.law))).toEqual(new Set(ALL_LAWS));
  });

  it("normalizes weights so they sum to 1", () => {
    const result = calculateLawWeights(buildValidationResult());
    const totalWeight = result.reduce((sum, lw) => sum + lw.weight, 0);

    expect(totalWeight).toBeCloseTo(1, 5);
  });

  it("distributes exactly 20 rules across all laws", () => {
    const result = calculateLawWeights(buildValidationResult());
    const totalRules = result.reduce((sum, lw) => sum + lw.rulesCount, 0);

    expect(totalRules).toBe(20);
  });

  it("gives every law at least 1 rule even when its raw score is 0", () => {
    const validationResult = buildValidationResult({
      lawImpacts: [
        {
          law: "Power",
          impact: "根本性彻底颠覆核心权力结构",
          example: "示例",
          uniquenessScore: 95,
        },
      ],
    });

    const result = calculateLawWeights(validationResult);

    for (const lw of result) {
      expect(lw.rulesCount).toBeGreaterThanOrEqual(1);
    }
  });

  it("assigns a higher weight to a law with a higher explicit uniquenessScore", () => {
    const validationResult = buildValidationResult({
      lawImpacts: ALL_LAWS.map((law) => ({
        law,
        impact: "",
        example: "",
        uniquenessScore: law === "Power" ? 95 : 40,
      })),
    });

    const result = calculateLawWeights(validationResult);
    const power = result.find((lw) => lw.law === "Power")!;
    const others = result.filter((lw) => lw.law !== "Power");

    for (const other of others) {
      expect(power.weight).toBeGreaterThan(other.weight);
    }
  });

  it("boosts Metaphysics weight when overall uniqueness is high (>= 70)", () => {
    const flatImpacts = ALL_LAWS.map((law) => ({
      law,
      impact: "",
      example: "",
      uniquenessScore: 50,
    }));

    const lowUniqueness = calculateLawWeights(
      buildValidationResult({ uniquenessScore: 50, lawImpacts: flatImpacts }),
    );
    const highUniqueness = calculateLawWeights(
      buildValidationResult({ uniquenessScore: 85, lawImpacts: flatImpacts }),
    );

    const metaLow = lowUniqueness.find((lw) => lw.law === "Metaphysics")!;
    const metaHigh = highUniqueness.find((lw) => lw.law === "Metaphysics")!;

    expect(metaHigh.weight).toBeGreaterThan(metaLow.weight);
  });

  it("sorts the returned weights in descending order", () => {
    const result = calculateLawWeights(buildValidationResult());

    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].weight).toBeGreaterThanOrEqual(result[i].weight);
    }
  });
});

describe("validateRuleDistribution", () => {
  it("reports valid when actual counts match expected exactly", () => {
    const lawWeights = calculateLawWeights(buildValidationResult());
    const actualCounts = new Map<Law, number>(
      lawWeights.map((lw) => [lw.law, lw.rulesCount]),
    );

    const validation = validateRuleDistribution(actualCounts, lawWeights);

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("reports errors when a law's actual count is off by more than tolerance", () => {
    const lawWeights = calculateLawWeights(buildValidationResult());
    const actualCounts = new Map<Law, number>(
      lawWeights.map((lw) => [lw.law, lw.rulesCount]),
    );
    const [first] = lawWeights;
    actualCounts.set(first.law, first.rulesCount + 5);

    const validation = validateRuleDistribution(actualCounts, lawWeights, 1);

    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});
