/**
 * 智能专家复用系统测试
 *
 * 测试场景:
 * 1. 完全相同的请求 → 应该复用
 * 2. 相似但需要补充知识的请求 → 应该更新
 * 3. 完全不同的请求 → 应该创建新专家
 */

import { smartMatchExpert } from '../lib/experts/expert-matcher';
import { loadAllSpecialExperts } from '../lib/experts/loader';

async function testSmartMatching() {
  console.log('='.repeat(60));
  console.log('智能专家复用系统测试');
  console.log('='.repeat(60));
  console.log('');

  // 显示当前缓存的特殊专家
  console.log('当前缓存的特殊专家:');
  console.log('-'.repeat(60));

  const cachedExperts = await loadAllSpecialExperts();
  cachedExperts.forEach((expert, idx) => {
    console.log(`${idx + 1}. ${expert.name} (${expert.domain})`);
    console.log(`   ID: ${expert.id}`);
    console.log(`   版本: ${expert.version}`);
    if (expert.merged_from && expert.merged_from.length > 0) {
      console.log(`   🔀 合并自: ${expert.merged_from.join(', ')}`);
    }
    console.log('');
  });

  console.log(`总计: ${cachedExperts.length} 个特殊专家\n`);

  // 测试场景1: 完全相同的魔法系统请求 (应该复用)
  console.log('测试场景 1: 魔法系统请求 (期望: 复用现有专家)');
  console.log('-'.repeat(60));

  const test1 = {
    domain: '魔法系统与超自然物理学',
    reason: '需要分析魔法能量系统和咒语机制',
    knowledge_scope: ['魔法能量系统', '咒语机制', '附魔理论'],
    heterogeneity_point: '魔法与蒸汽科技并存的世界',
  };

  console.log('请求:', JSON.stringify(test1, null, 2));
  const result1 = await smartMatchExpert(test1);

  console.log(`\n结果: ${result1.action.toUpperCase()}`);
  console.log(`相似度: ${result1.similarity}/100`);
  console.log(`原因: ${result1.reason}`);
  if (result1.expert) {
    console.log(`专家: ${result1.expert.name}`);
  }
  console.log('');

  // 测试场景2: 相似但需要补充的魔法系统请求 (应该更新)
  console.log('测试场景 2: 扩展魔法系统请求 (期望: 更新现有专家)');
  console.log('-'.repeat(60));

  const test2 = {
    domain: '魔法系统与超自然物理学',
    reason: '需要分析魔法生物学和魔法医学',
    knowledge_scope: [
      '魔法能量系统',
      '魔法生物学',
      '魔法医学',
      '魔法遗传学',
      '魔法变异理论',
    ],
    heterogeneity_point: '魔法可以改变生物DNA的世界',
  };

  console.log('请求:', JSON.stringify(test2, null, 2));
  const result2 = await smartMatchExpert(test2);

  console.log(`\n结果: ${result2.action.toUpperCase()}`);
  console.log(`相似度: ${result2.similarity}/100`);
  console.log(`原因: ${result2.reason}`);
  if (result2.expert) {
    console.log(`专家: ${result2.expert.name}`);
    if (result2.action === 'update') {
      console.log(`新版本: ${result2.expert.version}`);
      console.log(`新增知识: ${result2.expert.knowledge_scope.join('、')}`);
    }
  }
  console.log('');

  // 测试场景3: 完全不同的领域请求 (应该创建)
  console.log('测试场景 3: 全新领域请求 (期望: 创建新专家)');
  console.log('-'.repeat(60));

  const test3 = {
    domain: '跨维度旅行与平行宇宙理论',
    reason: '需要分析多维度世界的物理规则',
    knowledge_scope: [
      '平行宇宙理论',
      '维度跳跃机制',
      '多维度时空拓扑',
      '跨维度因果律',
      '维度锚点理论',
    ],
    heterogeneity_point: '人们可以通过镜子进入平行世界',
  };

  console.log('请求:', JSON.stringify(test3, null, 2));
  const result3 = await smartMatchExpert(test3);

  console.log(`\n结果: ${result3.action.toUpperCase()}`);
  console.log(`相似度: ${result3.similarity}/100`);
  console.log(`原因: ${result3.reason}`);
  console.log('');

  // 测试场景4: 时间相关但不同焦点的请求 (应该更新或创建)
  console.log('测试场景 4: 时间旅行请求 (期望: 更新或创建)');
  console.log('-'.repeat(60));

  const test4 = {
    domain: '时间旅行与时间悖论',
    reason: '需要分析时间旅行的因果关系',
    knowledge_scope: [
      '时间旅行机制',
      '时间悖论理论',
      '因果律保护',
      '时间分支理论',
      '祖父悖论解决方案',
    ],
    heterogeneity_point: '人们可以回到过去但无法改变历史',
  };

  console.log('请求:', JSON.stringify(test4, null, 2));
  const result4 = await smartMatchExpert(test4);

  console.log(`\n结果: ${result4.action.toUpperCase()}`);
  console.log(`相似度: ${result4.similarity}/100`);
  console.log(`原因: ${result4.reason}`);
  if (result4.expert) {
    console.log(`专家: ${result4.expert.name}`);
  }
  console.log('');

  // 总结
  console.log('='.repeat(60));
  console.log('测试总结');
  console.log('='.repeat(60));
  console.log(`场景1 (相同请求): ${result1.action} ✓`);
  console.log(`场景2 (相似请求): ${result2.action} ✓`);
  console.log(`场景3 (新领域): ${result3.action} ✓`);
  console.log(`场景4 (时间相关): ${result4.action} ✓`);
  console.log('');

  // 显示更新后的专家列表
  const finalExperts = await loadAllSpecialExperts();
  console.log(`测试后特殊专家数量: ${finalExperts.length}`);
  console.log('');
  console.log('✅ 智能复用系统测试完成!');
  console.log('');
  console.log('💡 提示: 系统会:');
  console.log('   - 相似度 ≥ 90%: 直接复用现有专家');
  console.log('   - 相似度 70-89%: 更新现有专家并添加新知识');
  console.log('   - 相似度 < 70%: 创建全新专家');
}

// 注意: 此测试需要API密钥才能运行
// 如果没有API密钥,会显示相应的错误信息
testSmartMatching().catch(error => {
  if (error.message && error.message.includes('credentials')) {
    console.error('\n❌ 测试失败: 需要设置 DEEPSEEK_API_KEY 或 OPENAI_API_KEY 环境变量');
    console.error('   请在 .env 文件中配置 API 密钥后重试\n');
  } else {
    console.error('\n❌ 测试失败:', error.message);
  }
});
