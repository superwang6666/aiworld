import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import {
  updateTagWeightsOnDeletion,
  updateTagWeightsOnConfirm,
  mergeNewTags,
} from '@/lib/tags/tag-manager';

/**
 * POST /api/tags/update-weights
 *
 * 更新标签权重 (响应用户的确认/删除操作)
 *
 * Request Body:
 * {
 *   action: 'confirm' | 'delete';
 *   tags: string[]; // 受影响规则的标签ID数组
 *   currentWeights: Record<string, RuleTag>; // 当前标签权重映射
 *   newTags?: RuleTag[]; // 可选: 新增的LLM生成标签
 * }
 *
 * Response:
 * {
 *   updatedWeights: Record<string, RuleTag>;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tags, currentWeights, newTags } = body;

    // 验证请求
    if (!action || !tags || !currentWeights) {
      return NextResponse.json(
        { error: 'Invalid request: action, tags, and currentWeights are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(tags) || typeof currentWeights !== 'object') {
      return NextResponse.json({ error: 'Invalid data types' }, { status: 400 });
    }

    if (action !== 'confirm' && action !== 'delete') {
      return NextResponse.json(
        { error: 'Invalid action: must be "confirm" or "delete"' },
        { status: 400 }
      );
    }

    // 步骤1: 更新标签权重
    let updatedWeights = { ...currentWeights };

    if (action === 'delete') {
      updatedWeights = updateTagWeightsOnDeletion(tags, updatedWeights);
      console.log(`标签权重更新 (删除): 影响 ${tags.length} 个标签`);
    } else if (action === 'confirm') {
      updatedWeights = updateTagWeightsOnConfirm(tags, updatedWeights);
      console.log(`标签权重更新 (确认): 影响 ${tags.length} 个标签`);
    }

    // 步骤2: 如果有新标签,合并进来
    if (newTags && Array.isArray(newTags) && newTags.length > 0) {
      updatedWeights = mergeNewTags(newTags, updatedWeights);
      console.log(`合并 ${newTags.length} 个新标签`);
    }

    return NextResponse.json({ updatedWeights: updatedWeights });
  } catch (error) {
    console.error('标签权重更新API错误:', error);
    return NextResponse.json(
      {
        error: '标签权重更新失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
