import type { WorldRule, AcademicDiscipline, DisciplineCoverage } from '@/types';

import { ACADEMIC_DISCIPLINES } from '@/config/academic-disciplines';

/**
 * 学科映射器
 *
 * 负责将世界规则映射到学科分类
 * 使用法则关联 + 关键词匹配的混合策略
 */

/**
 * 将单个规则映射到学科
 *
 * 算法:
 * 1. 基于规则的law过滤候选学科
 * 2. 基于关键词匹配候选学科
 * 3. 返回匹配度最高的1-3个学科代码
 *
 * @param rule 世界规则
 * @param disciplines 学科列表 (默认使用全部学科)
 * @returns 学科代码数组
 */
export function mapRuleToDisciplines(
  rule: WorldRule,
  disciplines: AcademicDiscipline[] = ACADEMIC_DISCIPLINES
): string[] {
  // 步骤1: 基于法则过滤候选学科
  const candidatesByLaw = disciplines.filter((d) => d.related_laws.includes(rule.law));

  if (candidatesByLaw.length === 0) {
    // 如果没有相关学科,返回空数组
    return [];
  }

  // 步骤2: 基于关键词匹配
  const ruleText = (rule.rule + ' ' + rule.expert_logic).toLowerCase();

  const matchedDisciplines = candidatesByLaw.map((discipline) => {
    // 计算关键词匹配得分
    const matchCount = discipline.keywords.filter((keyword) => {
      return ruleText.includes(keyword);
    }).length;

    return {
      discipline,
      score: matchCount,
    };
  });

  // 步骤3: 排序并选择top3
  matchedDisciplines.sort((a, b) => b.score - a.score);

  // 如果没有关键词匹配,返回法则相关的前2个学科
  if (matchedDisciplines[0].score === 0) {
    return candidatesByLaw.slice(0, 2).map((d) => d.code);
  }

  // 返回得分>0的学科,最多3个
  return matchedDisciplines
    .filter((m) => m.score > 0)
    .slice(0, 3)
    .map((m) => m.discipline.code);
}

/**
 * 批量映射规则到学科
 *
 * @param rules 规则数组
 * @returns 包含学科代码的规则数组
 */
export function mapRulesToDisciplines(rules: WorldRule[]): WorldRule[] {
  return rules.map((rule) => ({
    ...rule,
    discipline_codes: mapRuleToDisciplines(rule),
  }));
}

/**
 * 计算学科覆盖统计
 *
 * @param rules 规则数组
 * @returns 学科覆盖统计数组
 */
export function calculateDisciplineCoverage(rules: WorldRule[]): DisciplineCoverage[] {
  // 统计每个学科的规则数
  const coverageMap: Record<
    string,
    {
      name: string;
      rule_count: number;
      confirmed_count: number;
      last_generated?: string;
    }
  > = {};

  rules.forEach((rule) => {
    if (!rule.discipline_codes || rule.rejected) return; // 跳过已删除的规则

    rule.discipline_codes.forEach((code) => {
      if (!coverageMap[code]) {
        const discipline = ACADEMIC_DISCIPLINES.find((d) => d.code === code);
        coverageMap[code] = {
          name: discipline?.name || code,
          rule_count: 0,
          confirmed_count: 0,
        };
      }

      coverageMap[code].rule_count += 1;

      if (rule.confirmed) {
        coverageMap[code].confirmed_count += 1;
      }

      // 更新最后生成时间
      if (rule.created_at) {
        const currentLast = coverageMap[code].last_generated;
        if (!currentLast || rule.created_at > currentLast) {
          coverageMap[code].last_generated = rule.created_at;
        }
      }
    });
  });

  // 转换为数组并排序 (按规则数降序)
  return Object.keys(coverageMap)
    .map((code) => ({
      discipline_code: code,
      discipline_name: coverageMap[code].name,
      rule_count: coverageMap[code].rule_count,
      confirmed_count: coverageMap[code].confirmed_count,
      last_generated: coverageMap[code].last_generated,
    }))
    .sort((a, b) => b.rule_count - a.rule_count);
}

/**
 * 识别缺失的学科 (没有规则覆盖的学科)
 *
 * @param rules 规则数组
 * @param minRuleCount 最少规则数阈值 (默认1, 0规则则视为缺失)
 * @returns 缺失学科数组
 */
export function identifyMissingDisciplines(
  rules: WorldRule[],
  minRuleCount: number = 1
): AcademicDiscipline[] {
  const coverage = calculateDisciplineCoverage(rules);
  const coveredCodes = coverage
    .filter((c) => c.rule_count >= minRuleCount)
    .map((c) => c.discipline_code);

  return ACADEMIC_DISCIPLINES.filter((d) => !coveredCodes.includes(d.code));
}

/**
 * 根据缺失学科生成生成提示
 *
 * @param missingDisciplines 缺失学科数组
 * @param limit 返回数量限制
 * @returns 推荐补充的学科数组
 */
export function generateDisciplineGapSuggestions(
  missingDisciplines: AcademicDiscipline[],
  limit: number = 5
): Array<{
  discipline: AcademicDiscipline;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}> {
  // 优先级算法: 基于法则覆盖度
  const suggestions = missingDisciplines.map((discipline) => {
    // 核心法则 (Metaphysics, Time, Power) 缺失 = 高优先级
    const hasCoreLaw = discipline.related_laws.some((law) =>
      ['Metaphysics', 'Time', 'Power'].includes(law)
    );

    const priority: 'high' | 'medium' | 'low' = hasCoreLaw ? 'high' : 'medium';

    const reason = `缺少 ${discipline.name} 相关规则,法则: ${discipline.related_laws.join(', ')}`;

    return {
      discipline,
      reason,
      priority,
    };
  });

  // 按优先级排序
  suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return suggestions.slice(0, limit);
}

/**
 * 生成学科覆盖报告
 *
 * @param rules 规则数组
 * @returns 完整的学科覆盖分析报告
 */
export function generateDisciplineCoverageReport(rules: WorldRule[]): {
  total_disciplines: number;
  covered_disciplines: number;
  coverage_rate: number; // 覆盖率 (0-1)
  coverage: DisciplineCoverage[];
  missing: AcademicDiscipline[];
  suggestions: Array<{
    discipline: AcademicDiscipline;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
} {
  const coverage = calculateDisciplineCoverage(rules);
  const missing = identifyMissingDisciplines(rules);
  const suggestions = generateDisciplineGapSuggestions(missing);

  const coverageRate = coverage.length / ACADEMIC_DISCIPLINES.length;

  return {
    total_disciplines: ACADEMIC_DISCIPLINES.length,
    covered_disciplines: coverage.length,
    coverage_rate: coverageRate,
    coverage,
    missing,
    suggestions,
  };
}
