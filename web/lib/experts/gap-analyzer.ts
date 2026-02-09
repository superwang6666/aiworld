import type { ExpertConfig, GapAnalysis, ValidationResult, Law } from "@/types";

import type { Locale } from "@/types/i18n";

interface GapAnalysisInput {
  heterogeneity_point: string;
  validation_result?: ValidationResult;
  available_experts: ExpertConfig[];
  locale?: Locale;
}

const ALL_LAWS: Law[] = [
  "Space",
  "Survival",
  "Cognition",
  "Scarcity",
  "Time",
  "Power",
  "Metaphysics",
];

/**
 * 分析可用专家与异质点之间的覆盖差距
 */
export async function analyzeGaps(
  input: GapAnalysisInput,
): Promise<GapAnalysis> {
  const {
    heterogeneity_point,
    validation_result,
    available_experts,
    locale,
  } = input;

  // 确定异质点影响了哪些法则
  const impactedLaws =
    validation_result?.lawImpacts?.map((li) => li.law) || ALL_LAWS;

  // 确定可用专家覆盖了哪些法则
  const coveredLaws = new Set<Law>();
  const partialCoverage: { law: Law; reason: string }[] = [];

  for (const expert of available_experts) {
    expert.law_mapping.primary.forEach((law) => coveredLaws.add(law));
    expert.law_mapping.secondary?.forEach((law) => {
      if (!coveredLaws.has(law)) {
        partialCoverage.push({
          law,
          reason: `仅由 ${expert.name} (${expert.domain}) 提供次要覆盖`,
        });
      }
    });
  }

  // 识别未覆盖的法则
  const uncoveredLaws = impactedLaws.filter((law) => !coveredLaws.has(law));

  // 基于异质点检测特殊专业知识需求
  const special_expertise_needed = await detectSpecialExpertiseNeeds({
    heterogeneity_point,
    uncoveredLaws,
    validation_result,
    locale,
  });

  return {
    heterogeneity_point,
    covered_laws: Array.from(coveredLaws),
    uncovered_laws: uncoveredLaws,
    partial_coverage: partialCoverage,
    special_expertise_needed,
    confidence_score: calculateConfidence(
      impactedLaws,
      Array.from(coveredLaws),
    ),
  };
}

/**
 * 根据关键词和模式检测是否需要特殊专业知识
 */
async function detectSpecialExpertiseNeeds(params: {
  heterogeneity_point: string;
  uncoveredLaws: Law[];
  validation_result?: ValidationResult;
  locale?: Locale;
}): Promise<
  { domain: string; reason: string; suggested_knowledge: string[] }[]
> {
  const { heterogeneity_point, uncoveredLaws, locale } = params;
  const needs = [];

  const lowerPremise = heterogeneity_point.toLowerCase();
  const isEnglish = locale === "en";

  // 特殊领域的模式检测（支持中英文）
  if (
    lowerPremise.match(
      /魔法|魔咒|施法|咒语|魔术|神秘|奥术|法术|magic|spell|casting|enchant|mystical|arcane|sorcery/,
    )
  ) {
    needs.push({
      domain: isEnglish
        ? "Magic Systems & Supernatural Physics"
        : "魔法系统与超自然物理学",
      reason: isEnglish
        ? "Core heterogeneity involves magic/supernatural elements, requires specialized physics analysis"
        : "核心异质点涉及魔法/超自然元素,需要专门的物理分析",
      suggested_knowledge: isEnglish
        ? [
            "Magic energy systems",
            "Spell mechanisms",
            "Supernatural causality",
            "Enchantment theory",
          ]
        : ["魔法能量系统", "咒语机制", "超自然因果关系", "附魔理论"],
    });
  }

  if (
    lowerPremise.match(
      /时间旅行|时间回溯|时光|时间循环|时间悖论|穿越|逆转时间|time travel|time loop|temporal|paradox|chronology/,
    )
  ) {
    needs.push({
      domain: isEnglish
        ? "Temporal Mechanics & Causality"
        : "时间力学与因果关系",
      reason: isEnglish
        ? "Core heterogeneity involves time manipulation, requires specialized temporal analysis"
        : "核心异质点涉及时间操纵,需要专门的时间分析",
      suggested_knowledge: isEnglish
        ? ["Time paradoxes", "Causal loops", "Temporal physics", "Timeline branching"]
        : ["时间悖论", "因果循环", "时间物理学", "时间线分支"],
    });
  }

  if (
    lowerPremise.match(
      /梦境|噩梦|潜意识|心理|精神|意识|心灵|dream|nightmare|subconscious|psychology|mental|consciousness/,
    )
  ) {
    needs.push({
      domain: isEnglish
        ? "Psychology & Dream Logic"
        : "心理学与梦境逻辑",
      reason: isEnglish
        ? "Core heterogeneity operates on psychological/dream logic, requires specialized cognitive analysis"
        : "核心异质点在心理/梦境逻辑上运作,需要专门的认知分析",
      suggested_knowledge: isEnglish
        ? [
            "Dream mechanisms",
            "Subconscious structures",
            "Symbolic logic",
            "Mental landscapes",
          ]
        : ["梦境机制", "潜意识结构", "象征逻辑", "精神景观"],
    });
  }

  if (
    lowerPremise.match(
      /数字|虚拟|赛博|网络|模拟|矩阵|电子|程序|代码|digital|virtual|cyber|network|simulation|matrix|code|program/,
    )
  ) {
    needs.push({
      domain: isEnglish
        ? "Digital Physics & Virtual Reality"
        : "数字物理学与虚拟现实",
      reason: isEnglish
        ? "Core heterogeneity involves digital/virtual space, requires specialized computational analysis"
        : "核心异质点涉及数字/虚拟空间,需要专门的计算分析",
      suggested_knowledge: isEnglish
        ? [
            "Simulation theory",
            "Digital physics",
            "Virtual environments",
            "Computational constraints",
          ]
        : ["模拟理论", "数字物理学", "虚拟环境", "计算限制"],
    });
  }

  if (
    lowerPremise.match(
      /多维|异次元|平行世界|维度|空间折叠|超空间|multidimensional|parallel world|dimension|space folding|hyperspace/,
    )
  ) {
    needs.push({
      domain: isEnglish
        ? "Multidimensional Space Theory"
        : "多维空间理论",
      reason: isEnglish
        ? "Core heterogeneity involves multidimensional or parallel spaces, requires specialized spatial topology analysis"
        : "核心异质点涉及多维度或平行空间,需要专门的空间拓扑分析",
      suggested_knowledge: isEnglish
        ? [
            "Multidimensional geometry",
            "Space folding",
            "Parallel universe theory",
            "Dimensional traversal",
          ]
        : ["多维几何", "空间折叠", "平行宇宙理论", "维度穿越"],
    });
  }

  if (
    lowerPremise.match(
      /永生|不死|复活|重生|灵魂|轮回|死后|immortal|undead|resurrection|rebirth|soul|reincarnation|afterlife/,
    )
  ) {
    needs.push({
      domain: isEnglish
        ? "Life Extension & Soul Theory"
        : "生命延续与灵魂理论",
      reason: isEnglish
        ? "Core heterogeneity involves life extension or soul concepts, requires specialized thanatology analysis"
        : "核心异质点涉及生命延续或灵魂概念,需要专门的生死学分析",
      suggested_knowledge: isEnglish
        ? [
            "Immortality mechanisms",
            "Consciousness transfer",
            "Soul theory",
            "Resurrection biology",
          ]
        : ["永生机制", "意识转移", "灵魂理论", "复活生物学"],
    });
  }

  // 对未覆盖法则的通用差距覆盖
  if (uncoveredLaws.length > 0 && needs.length === 0) {
    const separator = isEnglish ? "/" : "/";
    const lawJoin = isEnglish ? ", " : "、";
    needs.push({
      domain: isEnglish
        ? `Specialized ${uncoveredLaws.join(separator)} Analysis`
        : `专业化${uncoveredLaws.join(separator)}分析`,
      reason: isEnglish
        ? `Core experts do not fully cover ${uncoveredLaws.join(", ")} law impacts for this specific heterogeneity`
        : `核心专家未完全覆盖 ${uncoveredLaws.join(lawJoin)} 法则对于此特定异质点的影响`,
      suggested_knowledge: uncoveredLaws.map((law) =>
        isEnglish
          ? `${law.toLowerCase()}-specific impacts`
          : `${law.toLowerCase()}-特定影响`,
      ),
    });
  }

  return needs;
}

function calculateConfidence(impacted: Law[], covered: Law[]): number {
  if (impacted.length === 0) return 1.0;
  const coverage = covered.filter((law) => impacted.includes(law)).length;
  return coverage / impacted.length;
}
