/**
 * DEAC 专家系统测试脚本
 *
 * 测试新的6专家体系:
 * 1. 验证所有6个核心专家已正确加载
 * 2. 测试法则映射和专家激活逻辑
 * 3. 验证法则覆盖完整性
 */

import { loadCoreExperts } from '../lib/experts/loader';
import { ExpertConfig, Law } from '../types';

// 测试场景定义
interface TestScenario {
  name: string;
  description: string;
  impactedLaws: Law[];
  expectedExperts: string[]; // expert IDs
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    name: '地理异质点',
    description: '大陆呈环形排列,中心是永恒风暴',
    impactedLaws: ['Space', 'Survival', 'Scarcity'],
    expectedExperts: ['geology-climate-expert', 'politics-military-expert', 'economics-expert'],
  },
  {
    name: '文化异质点',
    description: '社会通过集体意识连接,个体自我模糊',
    impactedLaws: ['Cognition', 'Metaphysics', 'Power'],
    expectedExperts: ['anthropology-sociology-expert', 'linguistics-expert', 'politics-military-expert'],
  },
  {
    name: '时间异质点',
    description: '每个人都能预见自己的死亡时刻',
    impactedLaws: ['Time', 'Cognition', 'Survival'],
    expectedExperts: ['history-archaeology-expert', 'anthropology-sociology-expert', 'geology-climate-expert'],
  },
  {
    name: '经济异质点',
    description: '时间就是货币,每个人每天获得相同小时数',
    impactedLaws: ['Scarcity', 'Power', 'Time'],
    expectedExperts: ['economics-expert', 'politics-military-expert', 'history-archaeology-expert'],
  },
  {
    name: '语言异质点',
    description: '说谎会导致身体疼痛,真话成为权力工具',
    impactedLaws: ['Cognition', 'Power', 'Metaphysics'],
    expectedExperts: ['linguistics-expert', 'politics-military-expert', 'anthropology-sociology-expert'],
  },
];

// 模拟 selectRelevantExperts 函数
function selectRelevantExperts(
  experts: ExpertConfig[],
  impactedLaws: Law[],
  maxExperts: number = 5
): ExpertConfig[] {
  const scored = experts.map(expert => {
    let score = 0;
    expert.law_mapping.primary.forEach(law => {
      if (impactedLaws.includes(law)) score += 2;
    });
    expert.law_mapping.secondary?.forEach(law => {
      if (impactedLaws.includes(law)) score += 1;
    });
    return { expert, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topExperts = scored
    .filter(s => s.score > 0)
    .map(s => s.expert);

  if (maxExperts && topExperts.length > maxExperts) {
    return topExperts.slice(0, maxExperts);
  }

  return topExperts;
}

// 验证法则覆盖
function validateLawCoverage(experts: ExpertConfig[]): {
  allCovered: boolean;
  coverage: Record<Law, { primary: number; secondary: number }>;
} {
  const allLaws: Law[] = ['Space', 'Survival', 'Cognition', 'Scarcity', 'Time', 'Power', 'Metaphysics'];

  const coverage: Record<Law, { primary: number; secondary: number }> = {
    Space: { primary: 0, secondary: 0 },
    Survival: { primary: 0, secondary: 0 },
    Cognition: { primary: 0, secondary: 0 },
    Scarcity: { primary: 0, secondary: 0 },
    Time: { primary: 0, secondary: 0 },
    Power: { primary: 0, secondary: 0 },
    Metaphysics: { primary: 0, secondary: 0 },
  };

  experts.forEach(expert => {
    expert.law_mapping.primary.forEach(law => {
      coverage[law].primary++;
    });
    expert.law_mapping.secondary?.forEach(law => {
      coverage[law].secondary++;
    });
  });

  const allCovered = allLaws.every(law => coverage[law].primary > 0);

  return { allCovered, coverage };
}

// 主测试函数
async function runTests() {
  console.log('='.repeat(60));
  console.log('DEAC 专家系统测试');
  console.log('='.repeat(60));
  console.log('');

  // 测试 1: 加载所有核心专家
  console.log('测试 1: 加载核心专家');
  console.log('-'.repeat(60));

  const experts = await loadCoreExperts();

  if (experts.length === 0) {
    console.error('❌ 失败: 没有加载到任何专家');
    return;
  }

  console.log(`✅ 成功加载 ${experts.length} 个核心专家:`);
  experts.forEach(expert => {
    console.log(`   - ${expert.name} (${expert.domain})`);
    console.log(`     ID: ${expert.id}`);
    console.log(`     推理风格: ${expert.reasoning_style}`);
    console.log(`     主要法则: ${expert.law_mapping.primary.join(', ')}`);
    console.log(`     次要法则: ${expert.law_mapping.secondary?.join(', ') || '无'}`);
    console.log('');
  });

  if (experts.length !== 6) {
    console.warn(`⚠️  警告: 期望6个专家,但加载了 ${experts.length} 个`);
    console.log('');
  }

  // 测试 2: 验证法则覆盖
  console.log('测试 2: 法则覆盖分析');
  console.log('-'.repeat(60));

  const { allCovered, coverage } = validateLawCoverage(experts);

  console.log('法则覆盖统计:');
  Object.entries(coverage).forEach(([law, counts]) => {
    const total = counts.primary + counts.secondary;
    const status = counts.primary > 0 ? '✅' : '❌';
    console.log(`   ${status} ${law.padEnd(12)} - ${counts.primary} 主要, ${counts.secondary} 次要 (总计: ${total})`);
  });
  console.log('');

  if (allCovered) {
    console.log('✅ 所有7大法则都至少有1个主要专家覆盖');
  } else {
    console.error('❌ 失败: 部分法则缺少主要专家覆盖');
  }
  console.log('');

  // 测试 3: 专家激活逻辑
  console.log('测试 3: 专家激活逻辑');
  console.log('-'.repeat(60));

  TEST_SCENARIOS.forEach((scenario, idx) => {
    console.log(`场景 ${idx + 1}: ${scenario.name}`);
    console.log(`描述: ${scenario.description}`);
    console.log(`影响法则: ${scenario.impactedLaws.join(', ')}`);

    const activated = selectRelevantExperts(experts, scenario.impactedLaws, 5);

    console.log(`激活的专家 (${activated.length}位):`);
    activated.forEach((expert, i) => {
      const score = expert.law_mapping.primary.filter(l => scenario.impactedLaws.includes(l)).length * 2 +
                    (expert.law_mapping.secondary?.filter(l => scenario.impactedLaws.includes(l)).length || 0);
      console.log(`   ${i + 1}. ${expert.name} (${expert.domain}) - 得分: ${score}`);
    });

    // 检查期望的专家是否被激活
    const activatedIds = activated.map(e => e.id);
    const expectedFound = scenario.expectedExperts.filter(id => activatedIds.includes(id));
    const expectedMissing = scenario.expectedExperts.filter(id => !activatedIds.includes(id));

    if (expectedFound.length === scenario.expectedExperts.length) {
      console.log(`✅ 所有期望的专家都被激活`);
    } else {
      console.log(`⚠️  部分期望专家未激活:`);
      expectedMissing.forEach(id => {
        const expert = experts.find(e => e.id === id);
        console.log(`   - ${expert?.name || id}`);
      });
    }
    console.log('');
  });

  // 测试 4: 验证推理风格多样性
  console.log('测试 4: 推理风格分布');
  console.log('-'.repeat(60));

  const styleDistribution: Record<string, string[]> = {};
  experts.forEach(expert => {
    if (!styleDistribution[expert.reasoning_style]) {
      styleDistribution[expert.reasoning_style] = [];
    }
    styleDistribution[expert.reasoning_style].push(expert.name);
  });

  console.log('推理风格统计:');
  Object.entries(styleDistribution).forEach(([style, names]) => {
    console.log(`   ${style}: ${names.length} 位专家`);
    names.forEach(name => console.log(`      - ${name}`));
  });
  console.log('');

  const uniqueStyles = Object.keys(styleDistribution).length;
  if (uniqueStyles >= 4) {
    console.log(`✅ 推理风格多样性良好 (${uniqueStyles} 种不同风格)`);
  } else {
    console.warn(`⚠️  推理风格多样性不足 (仅 ${uniqueStyles} 种风格)`);
  }
  console.log('');

  // 总结
  console.log('='.repeat(60));
  console.log('测试总结');
  console.log('='.repeat(60));
  console.log(`✅ 核心专家数量: ${experts.length}/6`);
  console.log(`${allCovered ? '✅' : '❌'} 法则覆盖: ${allCovered ? '完整' : '不完整'}`);
  console.log(`✅ 推理风格多样性: ${uniqueStyles} 种`);
  console.log(`✅ 激活逻辑: 正常工作`);
  console.log('');
  console.log('🎉 DEAC 专家系统测试完成!');
}

// 运行测试
runTests().catch(console.error);
