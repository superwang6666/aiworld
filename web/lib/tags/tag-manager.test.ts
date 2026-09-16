import type { RuleTag } from "@/types";

import {
  initializeTagWeights,
  updateTagWeightsOnDeletion,
  updateTagWeightsOnConfirm,
  mergeNewTags,
  sortTagsByWeight,
  getLowWeightTags,
  getHighWeightTags,
  calculateTagDeletionRate,
  getMostDislikedTags,
  getTagSteeringHints,
  resetTagWeights,
  exportTagWeightsSnapshot,
  restoreTagWeightsFromSnapshot,
} from "./tag-manager";


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

describe("initializeTagWeights", () => {
  it("creates an independent copy per call (no shared references)", () => {
    const a = initializeTagWeights();
    const b = initializeTagWeights();
    const firstKey = Object.keys(a)[0];

    a[firstKey].weight = 0.99;

    expect(b[firstKey].weight).not.toBe(0.99);
  });
});

describe("updateTagWeightsOnDeletion", () => {
  it("decays weight by the fixed factor and increments deletion_count", () => {
    const weights = { brutal: makeTag({ weight: 0.5, deletion_count: 0 }) };

    const updated = updateTagWeightsOnDeletion(["brutal"], weights);

    expect(updated.brutal.weight).toBeCloseTo(0.45, 5);
    expect(updated.brutal.deletion_count).toBe(1);
  });

  it("never decays weight below MIN_WEIGHT (0.1)", () => {
    const weights = { brutal: makeTag({ weight: 0.11 }) };

    const updated = updateTagWeightsOnDeletion(["brutal"], weights);

    expect(updated.brutal.weight).toBeGreaterThanOrEqual(0.1);
  });

  it("does not mutate the original weights object", () => {
    const weights = { brutal: makeTag({ weight: 0.5 }) };

    updateTagWeightsOnDeletion(["brutal"], weights);

    expect(weights.brutal.weight).toBe(0.5);
  });

  it("ignores tag ids that are not present in the weights map", () => {
    const weights = { brutal: makeTag({ weight: 0.5 }) };

    const updated = updateTagWeightsOnDeletion(["unknown-tag"], weights);

    expect(updated).toEqual(weights);
  });
});

describe("updateTagWeightsOnConfirm", () => {
  it("boosts weight toward MAX_WEIGHT and increments usage_count", () => {
    const weights = { brutal: makeTag({ weight: 0.5, usage_count: 0 }) };

    const updated = updateTagWeightsOnConfirm(["brutal"], weights);

    // new_weight = old + (1 - old) * 0.05 = 0.5 + 0.5 * 0.05 = 0.525
    expect(updated.brutal.weight).toBeCloseTo(0.525, 5);
    expect(updated.brutal.usage_count).toBe(1);
  });

  it("never boosts weight above MAX_WEIGHT (0.95)", () => {
    const weights = { brutal: makeTag({ weight: 0.949 }) };

    const updated = updateTagWeightsOnConfirm(["brutal"], weights);

    expect(updated.brutal.weight).toBeLessThanOrEqual(0.95);
  });
});

describe("decay vs boost asymmetry", () => {
  it("a single deletion moves weight further from baseline than a single confirm", () => {
    const base = makeTag({ weight: 0.5 });

    const afterDeletion = updateTagWeightsOnDeletion(["brutal"], { brutal: base });
    const afterConfirm = updateTagWeightsOnConfirm(["brutal"], { brutal: base });

    const deletionDelta = Math.abs(0.5 - afterDeletion.brutal.weight);
    const confirmDelta = Math.abs(afterConfirm.brutal.weight - 0.5);

    expect(deletionDelta).toBeGreaterThan(confirmDelta);
  });
});

describe("mergeNewTags", () => {
  it("adds a brand-new LLM tag directly", () => {
    const llmTag = makeTag({ id: "new-llm-tag", name: "新标签", source: "llm" });

    const updated = mergeNewTags([llmTag], {});

    expect(updated["new-llm-tag"]).toEqual(llmTag);
  });

  it("increments usage_count for a tag that already exists", () => {
    const existing = { brutal: makeTag({ usage_count: 2 }) };
    const llmTag = makeTag({ usage_count: 99 }); // usage_count on incoming tag should be ignored

    const updated = mergeNewTags([llmTag], existing);

    expect(updated.brutal.usage_count).toBe(3);
  });
});

describe("sortTagsByWeight", () => {
  it("sorts tag ids by descending weight", () => {
    const weights = {
      a: makeTag({ id: "a", weight: 0.3 }),
      b: makeTag({ id: "b", weight: 0.8 }),
      c: makeTag({ id: "c", weight: 0.5 }),
    };

    expect(sortTagsByWeight(["a", "b", "c"], weights)).toEqual(["b", "c", "a"]);
  });
});

describe("getLowWeightTags / getHighWeightTags", () => {
  it("splits tags by the given threshold", () => {
    const weights = {
      a: makeTag({ id: "a", weight: 0.2 }),
      b: makeTag({ id: "b", weight: 0.5 }),
      c: makeTag({ id: "c", weight: 0.9 }),
    };

    expect(getLowWeightTags(weights)).toEqual(["a"]);
    expect(getHighWeightTags(weights)).toEqual(["c"]);
  });
});

describe("calculateTagDeletionRate / getMostDislikedTags", () => {
  it("computes deletion_count / usage_count", () => {
    const tag = makeTag({ usage_count: 4, deletion_count: 3 });

    expect(calculateTagDeletionRate(tag)).toBeCloseTo(0.75, 5);
  });

  it("returns 0 for a tag that has never been used", () => {
    const tag = makeTag({ usage_count: 0, deletion_count: 0 });

    expect(calculateTagDeletionRate(tag)).toBe(0);
  });

  it("ranks tags by deletion rate, ignoring unused tags", () => {
    const weights = {
      neverUsed: makeTag({ id: "neverUsed", usage_count: 0, deletion_count: 0 }),
      oftenDeleted: makeTag({ id: "oftenDeleted", usage_count: 4, deletion_count: 3 }),
      rarelyDeleted: makeTag({ id: "rarelyDeleted", usage_count: 10, deletion_count: 1 }),
    };

    const ranked = getMostDislikedTags(weights);

    expect(ranked.map((t) => t.id)).toEqual(["oftenDeleted", "rarelyDeleted"]);
  });
});

describe("getTagSteeringHints", () => {
  it("puts low-weight, previously-used tags in 'avoid' and high-weight ones in 'favor'", () => {
    const weights = {
      brutal: makeTag({ id: "brutal", name: "残酷", weight: 0.2, usage_count: 3 }),
      hopeful: makeTag({ id: "hopeful", name: "希望", weight: 0.85, usage_count: 3 }),
    };

    const hints = getTagSteeringHints(weights);

    expect(hints.avoid).toEqual(["残酷"]);
    expect(hints.favor).toEqual(["希望"]);
  });

  it("excludes tags that were never actually used, even if their weight drifted", () => {
    // usage_count 0 shouldn't normally happen with weight != 0.5, but the function
    // must stay defensive about it regardless.
    const weights = {
      brutal: makeTag({ id: "brutal", weight: 0.1, usage_count: 0 }),
    };

    const hints = getTagSteeringHints(weights);

    expect(hints.avoid).toEqual([]);
    expect(hints.favor).toEqual([]);
  });

  it("returns empty hints when nothing has drifted away from the neutral baseline", () => {
    const weights = initializeTagWeights();

    const hints = getTagSteeringHints(weights);

    expect(hints.avoid).toEqual([]);
    expect(hints.favor).toEqual([]);
  });
});

describe("resetTagWeights", () => {
  it("resets weight to 0.5 but preserves usage/deletion stats", () => {
    const weights = {
      brutal: makeTag({ weight: 0.15, usage_count: 5, deletion_count: 4 }),
    };

    const reset = resetTagWeights(weights);

    expect(reset.brutal.weight).toBe(0.5);
    expect(reset.brutal.usage_count).toBe(5);
    expect(reset.brutal.deletion_count).toBe(4);
  });
});

describe("exportTagWeightsSnapshot / restoreTagWeightsFromSnapshot", () => {
  it("round-trips weight/usage/deletion data through export and restore", () => {
    const original = {
      brutal: makeTag({ weight: 0.33, usage_count: 7, deletion_count: 2 }),
    };

    const snapshot = exportTagWeightsSnapshot(original);
    const restored = restoreTagWeightsFromSnapshot(snapshot, initializeTagWeights());

    expect(restored.brutal.weight).toBeCloseTo(0.33, 5);
    expect(restored.brutal.usage_count).toBe(7);
    expect(restored.brutal.deletion_count).toBe(2);
  });

  it("silently drops snapshot entries whose id isn't in the base weights", () => {
    // 注意: 这里记录的是当前的真实行为，而不是期望行为——LLM 生成的标签如果不在
    // baseWeights 里（比如换了一批预定义标签），会话恢复时会被无声丢弃，不会报错也
    // 不会补一个 synthetic RuleTag。跟 archive-operations.ts 里 restoreArchiveState()
    // 对同样场景的处理方式不一致（那边会补一个 source: "llm" 的占位标签）。
    const snapshot = {
      "llm-only-tag": { weight: 0.7, usage: 2, deletions: 0 },
    };

    const restored = restoreTagWeightsFromSnapshot(snapshot, initializeTagWeights());

    expect(restored["llm-only-tag"]).toBeUndefined();
  });
});
