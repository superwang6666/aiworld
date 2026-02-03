/**
 * 特殊专家整理脚本
 *
 * 功能:
 * 1. 分析所有特殊专家
 * 2. 识别重复内容
 * 3. 合并重复专家
 * 4. 删除旧文件
 */

import { promises as fs } from 'fs';
import path from 'path';

import { cacheSpecialExpert } from '../lib/deac/cache-manager';
import { analyzeAndMergeDuplicates, mergeExperts } from '../lib/experts/expert-matcher';
import { loadAllSpecialExperts } from '../lib/experts/loader';

import type { ExpertConfig } from '../types';

const SPECIAL_EXPERTS_DIR = path.join(process.cwd(), 'lib', 'experts', 'special');

async function _cleanupDuplicates() {
  console.log('='.repeat(60));
  console.log('特殊专家整理工具');
  console.log('='.repeat(60));
  console.log('');

  // 1. 加载所有特殊专家
  console.log('步骤 1: 加载所有特殊专家');
  console.log('-'.repeat(60));

  const allExperts = await loadAllSpecialExperts();
  console.log(`✅ 已加载 ${allExperts.length} 个特殊专家\n`);

  if (allExperts.length === 0) {
    console.log('没有特殊专家需要整理。');
    return;
  }

  // 显示所有专家
  allExperts.forEach((expert, idx) => {
    console.log(`${idx + 1}. ${expert.name} (${expert.id})`);
    console.log(`   领域: ${expert.domain}`);
    console.log(`   知识范围: ${expert.knowledge_scope.slice(0, 3).join('、')}...`);
    console.log('');
  });

  // 2. 分析重复
  console.log('步骤 2: 分析重复内容');
  console.log('-'.repeat(60));

  const { duplicateGroups, suggestions } = await analyzeAndMergeDuplicates();

  if (duplicateGroups.length === 0) {
    console.log('✅ 没有发现重复的专家领域\n');
    return;
  }

  console.log(`⚠️  发现 ${duplicateGroups.length} 个重复领域:\n`);
  suggestions.forEach(s => console.log(`   - ${s}`));
  console.log('');

  // 3. 合并重复组
  console.log('步骤 3: 合并重复专家');
  console.log('-'.repeat(60));

  const mergedExperts: ExpertConfig[] = [];
  const expertsToDelete: string[] = [];

  for (const group of duplicateGroups) {
    console.log(`\n正在合并 "${group.domain}" 领域的 ${group.experts.length} 个专家...`);

    group.experts.forEach(e => {
      console.log(`   - ${e.name} (${e.id})`);
    });

    // 合并专家
    const merged = await mergeExperts(group.experts);
    mergedExperts.push(merged);

    console.log(`✅ 已合并为: ${merged.name} (${merged.id})`);
    console.log(`   知识范围 (${merged.knowledge_scope.length}项): ${merged.knowledge_scope.join('、')}`);

    // 标记旧专家文件为删除
    group.experts.forEach(e => {
      if (e.id !== merged.id) {
        expertsToDelete.push(e.id);
      }
    });
  }

  // 4. 保存合并后的专家
  console.log('\n步骤 4: 保存合并后的专家');
  console.log('-'.repeat(60));

  for (const merged of mergedExperts) {
    await cacheSpecialExpert(merged);
    console.log(`✅ 已保存: ${merged.name} (${merged.id})`);
  }

  // 5. 删除旧文件
  console.log('\n步骤 5: 清理旧文件');
  console.log('-'.repeat(60));

  for (const expertId of expertsToDelete) {
    const filePath = path.join(SPECIAL_EXPERTS_DIR, `${expertId}.json`);
    try {
      await fs.unlink(filePath);
      console.log(`🗑️  已删除: ${expertId}.json`);
    } catch (_error) {
      console.error(`   ❌ 删除失败: ${expertId}.json`);
    }
  }

  // 6. 总结
  console.log('');
  console.log('='.repeat(60));
  console.log('整理完成');
  console.log('='.repeat(60));
  console.log(`原专家数: ${allExperts.length}`);
  console.log(`合并后数: ${allExperts.length - expertsToDelete.length}`);
  console.log(`删除文件: ${expertsToDelete.length}`);
  console.log(`新增合并专家: ${mergedExperts.length}`);
  console.log('');

  // 显示最终专家列表
  console.log('最终特殊专家列表:');
  console.log('-'.repeat(60));

  const finalExperts = await loadAllSpecialExperts();
  finalExperts.forEach((expert, idx) => {
    console.log(`${idx + 1}. ${expert.name} (${expert.domain})`);
    if ((expert as any).merged_from && (expert as any).merged_from.length > 0) {
      console.log(`   🔀 合并自: ${(expert as any).merged_from.join(', ')}`);
    }
  });

  console.log('');
  console.log('✅ 整理完成!');
}

// 手动模式:识别特定的重复组
async function manualCleanup() {
  console.log('='.repeat(60));
  console.log('手动整理特殊专家');
  console.log('='.repeat(60));
  console.log('');

  const allExperts = await loadAllSpecialExperts();

  // 重复组1: 魔法物理学专家
  const magicPhysicsExperts = allExperts.filter(e =>
    e.id.includes('magic') || e.id.includes('mo-fa')
  );

  if (magicPhysicsExperts.length > 1) {
    console.log(`发现 ${magicPhysicsExperts.length} 个魔法物理学专家:`);
    magicPhysicsExperts.forEach(e => {
      console.log(`   - ${e.name} (${e.id})`);
      console.log(`     知识范围: ${e.knowledge_scope.join('、')}`);
      console.log('');
    });

    console.log('正在合并魔法物理学专家...');
    const merged = await mergeExperts(magicPhysicsExperts);

    // 保存合并结果
    await cacheSpecialExpert(merged);
    console.log(`✅ 已保存合并后的专家: ${merged.name}`);
    console.log(`   ID: ${merged.id}`);
    console.log(`   知识范围 (${merged.knowledge_scope.length}项): ${merged.knowledge_scope.join('、')}`);
    console.log('');

    // 删除旧文件
    for (const expert of magicPhysicsExperts) {
      if (expert.id !== merged.id) {
        const filePath = path.join(SPECIAL_EXPERTS_DIR, `${expert.id}.json`);
        await fs.unlink(filePath);
        console.log(`🗑️  已删除: ${expert.id}.json`);
      }
    }
  }

  // 重复组2: 时间分析专家
  const timeExperts = allExperts.filter(e =>
    e.id.includes('time-gravity')
  );

  if (timeExperts.length > 1) {
    console.log(`\n发现 ${timeExperts.length} 个时间分析专家:`);
    timeExperts.forEach(e => {
      console.log(`   - ${e.name} (${e.id})`);
      console.log(`     知识范围: ${e.knowledge_scope.join('、')}`);
      console.log('');
    });

    console.log('正在合并时间分析专家...');
    const merged = await mergeExperts(timeExperts);

    // 保存合并结果
    await cacheSpecialExpert(merged);
    console.log(`✅ 已保存合并后的专家: ${merged.name}`);
    console.log(`   ID: ${merged.id}`);
    console.log(`   知识范围 (${merged.knowledge_scope.length}项): ${merged.knowledge_scope.join('、')}`);
    console.log('');

    // 删除旧文件
    for (const expert of timeExperts) {
      if (expert.id !== merged.id) {
        const filePath = path.join(SPECIAL_EXPERTS_DIR, `${expert.id}.json`);
        await fs.unlink(filePath);
        console.log(`🗑️  已删除: ${expert.id}.json`);
      }
    }
  }

  console.log('\n✅ 手动整理完成!');

  // 显示最终列表
  const finalExperts = await loadAllSpecialExperts();
  console.log(`\n最终特殊专家数量: ${finalExperts.length}`);
  finalExperts.forEach((expert, idx) => {
    console.log(`${idx + 1}. ${expert.name} (${expert.domain})`);
  });
}

// 运行手动清理(更可控)
manualCleanup().catch(console.error);
