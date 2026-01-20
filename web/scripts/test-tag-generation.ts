/**
 * 标签生成功能测试脚本
 *
 * 用法: npx tsx scripts/test-tag-generation.ts
 */

import { WorldRule } from '../types';
import { generateTagsForRules } from '../lib/tags/tag-generator';
import { initializeTagWeights } from '../lib/tags/tag-manager';

const testRules: WorldRule[] = [
  {
    id: 'test-1',
    law: 'Time',
    rule: '每说一次谎言，说谎者周围的时间会减慢1%',
    expert_logic: '这是一个累积效应，多次说谎会导致时间严重扭曲',
    confirmed: false,
    tags: [],
    discipline_codes: [],
    rejected: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'test-2',
    law: 'Space',
    rule: '谎言会增加物理重力，使说谎者身体变重',
    expert_logic: '这个规则通过物理属性的改变来体现道德的重量',
    confirmed: false,
    tags: [],
    discipline_codes: [],
    rejected: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'test-3',
    law: 'Cognition',
    rule: '真相会以发光的形式显现，但只有孩童能看见',
    expert_logic: '这创造了认知的不对称性，儿童成为真相的见证者',
    confirmed: false,
    tags: [],
    discipline_codes: [],
    rejected: false,
    created_at: new Date().toISOString(),
  },
];

async function testTagGeneration() {
  console.log('🧪 开始测试标签生成功能...\n');
  console.log(`测试规则数量: ${testRules.length}\n`);

  try {
    // 测试1: 生成标签
    console.log('📝 测试1: 生成标签');
    const results = await generateTagsForRules(testRules);

    console.log(`✅ 标签生成完成，返回 ${results.length} 条结果\n`);

    // 显示每条规则的标签
    results.forEach((result, index) => {
      console.log(`规则 ${index + 1} (${result.ruleId}):`);
      console.log(`  预定义标签 (${result.predefinedTagIds.length}): ${result.predefinedTagIds.join(', ')}`);
      console.log(`  LLM生成标签 (${result.llmGeneratedTags.length}):`, result.llmGeneratedTags.map(t => `${t.id}(${t.name})`).join(', '));
      console.log(`  推荐标签总数: ${result.recommendedTagIds.length}`);
      console.log('');
    });

    // 测试2: 标签权重初始化
    console.log('📝 测试2: 标签权重初始化');
    const weights = initializeTagWeights();
    console.log(`✅ 初始化 ${Object.keys(weights).length} 个预定义标签`);
    console.log(`样例标签: ${Object.keys(weights).slice(0, 5).join(', ')}\n`);

    // 统计
    const totalPredefinedTags = results.reduce((sum, r) => sum + r.predefinedTagIds.length, 0);
    const totalLLMTags = results.reduce((sum, r) => sum + r.llmGeneratedTags.length, 0);

    console.log('📊 统计信息:');
    console.log(`  规则总数: ${results.length}`);
    console.log(`  预定义标签总数: ${totalPredefinedTags} (平均每条 ${(totalPredefinedTags/results.length).toFixed(1)})`);
    console.log(`  LLM标签总数: ${totalLLMTags} (平均每条 ${(totalLLMTags/results.length).toFixed(1)})`);
    console.log(`  推荐标签总数: ${results.reduce((sum, r) => sum + r.recommendedTagIds.length, 0)}`);

    console.log('\n✨ 测试完成！标签生成功能正常工作');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('堆栈:', error.stack);
    }
    process.exit(1);
  }
}

testTagGeneration();
