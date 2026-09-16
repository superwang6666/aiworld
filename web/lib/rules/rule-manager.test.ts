import type { WorldRule, RuleTag } from "@/types";

import { calculateRuleDeletionScore, updateDeletionScores } from "./rule-manager";


function makeRule(overrides: Partial<WorldRule> = {}): WorldRule {
  return {
    id: "rule-1",
    law: "Power",
    rule: "统治者必须每年公开受审一次",
    expert_logic: "维系权力合法性",
    confirmed: false,
    tags: [],
    discipline_codes: [],
    rejected: false,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeTag(overrides: Partial<RuleTag> = {}): RuleTag {
  return {
    id: "brutal",
    name: "残酷",
    category: "tone",
    weight: 0.5,
    usage_count: 0,
    deletion_count: 0,
    source: "predefined",
    ...overrides,
  };
}

describe("calculateRuleDeletionScore", () => {
  it("returns a neutral 0.5 when the rule has no tags", () => {
    const rule = makeRule({ tags: [] });

    expect(calculateRuleDeletionScore(rule, {})).toBe(0.5);
  });

  it("is the inverse of the average weight of the rule's tags", () => {
    const rule = makeRule({ tags: ["brutal"] });
    const tagWeights = { brutal: makeTag({ weight: 0.8 }) };

    expect(calculateRuleDeletionScore(rule, tagWeights)).toBeCloseTo(0.2, 5);
  });

  it("averages across multiple tags", () => {
    const rule = makeRule({ tags: ["a", "b"] });
    const tagWeights = {
      a: makeTag({ id: "a", weight: 0.2 }),
      b: makeTag({ id: "b", weight: 0.6 }),
    };

    // avg weight = 0.4, deletion score = 1 - 0.4 = 0.6
    expect(calculateRuleDeletionScore(rule, tagWeights)).toBeCloseTo(0.6, 5);
  });

  it("falls back to a neutral 0.5 weight for tags missing from the weights map", () => {
    const rule = makeRule({ tags: ["unknown-tag"] });

    expect(calculateRuleDeletionScore(rule, {})).toBeCloseTo(0.5, 5);
  });
});

describe("updateDeletionScores", () => {
  it("attaches a deletion_score to every rule without mutating the input array", () => {
    const rules = [
      makeRule({ id: "r1", tags: ["brutal"] }),
      makeRule({ id: "r2", tags: [] }),
    ];
    const tagWeights = { brutal: makeTag({ weight: 0.9 }) };

    const updated = updateDeletionScores(rules, tagWeights);

    expect(updated[0].deletion_score).toBeCloseTo(0.1, 5);
    expect(updated[1].deletion_score).toBe(0.5);
    expect(rules[0].deletion_score).toBeUndefined();
  });
});
