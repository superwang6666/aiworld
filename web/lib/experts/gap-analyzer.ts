import { ExpertConfig, GapAnalysis, ValidationResult, Law } from '@/types';

interface GapAnalysisInput {
  heterogeneity_point: string;
  validation_result?: ValidationResult;
  available_experts: ExpertConfig[];
}

const ALL_LAWS: Law[] = ['Space', 'Survival', 'Cognition', 'Scarcity', 'Time', 'Power', 'Metaphysics'];

/**
 * 分析可用专家与异质点之间的覆盖差距
 */
export async function analyzeGaps(input: GapAnalysisInput): Promise<GapAnalysis> {
  const { heterogeneity_point, validation_result, available_experts } = input;

  // 确定异质点影响了哪些法则
  const impactedLaws = validation_result?.lawImpacts?.map(li => li.law) || ALL_LAWS;

  // 确定可用专家覆盖了哪些法则
  const coveredLaws = new Set<Law>();
  const partialCoverage: { law: Law; reason: string }[] = [];

  for (const expert of available_experts) {
    expert.law_mapping.primary.forEach(law => coveredLaws.add(law));
    expert.law_mapping.secondary?.forEach(law => {
      if (!coveredLaws.has(law)) {
        partialCoverage.push({
          law,
          reason: `仅由 ${expert.name} (${expert.domain}) 提供次要覆盖`
        });
      }
    });
  }

  // 识别未覆盖的法则
  const uncoveredLaws = impactedLaws.filter(law => !coveredLaws.has(law));

  // 基于异质点检测特殊专业知识需求
  const special_expertise_needed = await detectSpecialExpertiseNeeds({
    heterogeneity_point,
    uncoveredLaws,
    validation_result,
  });

  return {
    heterogeneity_point,
    covered_laws: Array.from(coveredLaws),
    uncovered_laws: uncoveredLaws,
    partial_coverage: partialCoverage,
    special_expertise_needed,
    confidence_score: calculateConfidence(impactedLaws, Array.from(coveredLaws)),
  };
}

/**
 * 根据关键词和模式检测是否需要特殊专业知识
 */
async function detectSpecialExpertiseNeeds(params: {
  heterogeneity_point: string;
  uncoveredLaws: Law[];
  validation_result?: ValidationResult;
}): Promise<{ domain: string; reason: string; suggested_knowledge: string[] }[]> {
  const { heterogeneity_point, uncoveredLaws } = params;
  const needs = [];

  const lowerPremise = heterogeneity_point.toLowerCase();

  // 特殊领域的模式检测
  if (lowerPremise.match(/魔法|魔咒|施法|咒语|魔术|神秘|奥术|法术/)) {
    needs.push({
      domain: '魔法系统与超自然物理学',
      reason: '核心异质点涉及魔法/超自然元素,需要专门的物理分析',
      suggested_knowledge: ['魔法能量系统', '咒语机制', '超自然因果关系', '附魔理论'],
    });
  }

  if (lowerPremise.match(/时间旅行|时间回溯|时光|时间循环|时间悖论|穿越|逆转时间/)) {
    needs.push({
      domain: '时间力学与因果关系',
      reason: '核心异质点涉及时间操纵,需要专门的时间分析',
      suggested_knowledge: ['时间悖论', '因果循环', '时间物理学', '时间线分支'],
    });
  }

  if (lowerPremise.match(/梦境|噩梦|潜意识|心理|精神|意识|心灵/)) {
    needs.push({
      domain: '心理学与梦境逻辑',
      reason: '核心异质点在心理/梦境逻辑上运作,需要专门的认知分析',
      suggested_knowledge: ['梦境机制', '潜意识结构', '象征逻辑', '精神景观'],
    });
  }

  if (lowerPremise.match(/数字|虚拟|赛博|网络|模拟|矩阵|电子|程序|代码/)) {
    needs.push({
      domain: '数字物理学与虚拟现实',
      reason: '核心异质点涉及数字/虚拟空间,需要专门的计算分析',
      suggested_knowledge: ['模拟理论', '数字物理学', '虚拟环境', '计算限制'],
    });
  }

  if (lowerPremise.match(/多维|异次元|平行世界|维度|空间折叠|超空间/)) {
    needs.push({
      domain: '多维空间理论',
      reason: '核心异质点涉及多维度或平行空间,需要专门的空间拓扑分析',
      suggested_knowledge: ['多维几何', '空间折叠', '平行宇宙理论', '维度穿越'],
    });
  }

  if (lowerPremise.match(/永生|不死|复活|重生|灵魂|轮回|死后/)) {
    needs.push({
      domain: '生命延续与灵魂理论',
      reason: '核心异质点涉及生命延续或灵魂概念,需要专门的生死学分析',
      suggested_knowledge: ['永生机制', '意识转移', '灵魂理论', '复活生物学'],
    });
  }

  // 对未覆盖法则的通用差距覆盖
  if (uncoveredLaws.length > 0 && needs.length === 0) {
    needs.push({
      domain: `专业化${uncoveredLaws.join('/')}分析`,
      reason: `核心专家未完全覆盖 ${uncoveredLaws.join('、')} 法则对于此特定异质点的影响`,
      suggested_knowledge: uncoveredLaws.map(law => `${law.toLowerCase()}-特定影响`),
    });
  }

  return needs;
}

function calculateConfidence(impacted: Law[], covered: Law[]): number {
  if (impacted.length === 0) return 1.0;
  const coverage = covered.filter(law => impacted.includes(law)).length;
  return coverage / impacted.length;
}
