import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import OpenAI from 'openai';

import type { ExpertResponse} from '@/types';

import {
  synthesizeWithWeights,
  detectDisagreements,
  generateEmergentInsights,
  identifyConsensus,
} from '@/lib/deac/weighted-synthesis';

/**
 * POST /api/deac/synthesize
 *
 * 将多个专家视角综合为连贯的洞察
 * 使用加权复合解释算法进行数学化综合
 *
 * 请求体:
 * {
 *   expert_responses: ExpertResponse[],
 *   heterogeneity_point: string,
 *   law_weights?: LawWeight[]  // 可选：法则权重
 * }
 *
 * 响应:
 * {
 *   synthesis: {
 *     consensus: string,
 *     disagreements: Array<{topic, perspectives}>,
 *     emergent_insights: string[],
 *     risk_assessment: string
 *   },
 *   weighted_predictions?: WeightedPrediction[]  // 如果提供了法则权重
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { expert_responses, heterogeneity_point, law_weights } = await request.json();

    if (!expert_responses || expert_responses.length === 0) {
      return NextResponse.json(
        { error: '没有提供专家响应' },
        { status: 400 }
      );
    }

    // ==================== 加权综合算法 ====================
    let weightedPredictions = null;
    let mathConsensus = null;

    if (law_weights && Array.isArray(law_weights) && law_weights.length > 0) {
      console.log('🧮 使用加权综合算法...');

      // 使用复合解释算法
      weightedPredictions = synthesizeWithWeights(expert_responses, law_weights);

      // 识别共识
      const consensusData = identifyConsensus(weightedPredictions);

      mathConsensus = {
        highPriorityLaws: consensusData.highPriorityLaws,
        convergence: consensusData.convergentPredictions,
      };

      console.log(`✓ 加权预测完成，高优先级法则: ${consensusData.highPriorityLaws.join(', ')}`);
    }

    // ==================== AI 辅助综合 ====================

    // 使用算法生成涌现洞察和分歧检测
    const emergentInsights = weightedPredictions
      ? generateEmergentInsights(expert_responses, weightedPredictions)
      : [];

    const disagreements = detectDisagreements(expert_responses, 0.3);

    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    const baseURL = process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com' : undefined;
    const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini';

    const openai = new OpenAI({ apiKey, baseURL });

    // 增强的提示词，包含算法结果
    const mathInsightsSection = mathConsensus ? `
加权综合算法结果:
- 高优先级法则: ${mathConsensus.highPriorityLaws.join(', ')}
- 涌现洞察: ${emergentInsights.join('; ')}
- 检测到的分歧: ${disagreements.length > 0 ? disagreements.map(d => d.law).join(', ') : '无'}
` : '';

    const synthesis_prompt = `你是世界构建综合 AI,负责整合多个专家视角。

核心异质点: ${heterogeneity_point}
${mathInsightsSection}
专家分析:
${expert_responses.map((r: ExpertResponse, i: number) => `
专家 ${i + 1}: ${r.expert_name} (${r.domain})
${r.analysis}
${r.warnings?.length ? `警告: ${r.warnings.join('; ')}` : ''}
`).join('\n---\n')}

请通过以下方式综合这些视角:
1. 识别专家达成共识的地方(共识点)
2. 突出分歧(专家对同一主题的不同观点)
3. 提取涌现洞察(结合多个视角产生的新想法)${emergentInsights.length > 0 ? '\n   注意: 算法已生成基础洞察，请在此基础上深化' : ''}
4. 提供整体风险评估

重要: 必须返回严格有效的 JSON 格式，不要包含任何额外的文本或解释。
所有字符串值中的引号必须正确转义。结构如下:
{
  "consensus": "专家共识的详细描述",
  "disagreements": [{"topic": "分歧主题", "perspectives": [{"expert": "专家名", "view": "观点"}]}],
  "emergent_insights": ["洞察1", "洞察2"],
  "risk_assessment": "综合风险评估"
}`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: '你是世界构建的专家综合 AI。' },
        { role: 'user', content: synthesis_prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    let content = completion.choices[0]?.message?.content || '{}';

    // 清理可能的 markdown 代码块
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // 清理可能的前后空白
    content = content.trim();

    let synthesis;
    try {
      synthesis = JSON.parse(content);
    } catch (parseError: any) {
      console.error('JSON 解析失败，原始内容:', content);
      console.error('解析错误:', parseError.message);

      // 尝试修复常见的 JSON 问题
      try {
        // 移除可能的 BOM 或其他不可见字符
        content = content.replace(/^\uFEFF/, '');

        // 尝试找到 JSON 对象的开始和结束
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const extractedJson = content.substring(jsonStart, jsonEnd + 1);
          synthesis = JSON.parse(extractedJson);
          console.log('✓ 成功从响应中提取 JSON');
        } else {
          throw new Error('无法从响应中提取有效的 JSON 对象');
        }
      } catch (_retryError) {
        // 如果仍然失败，返回一个默认结构
        console.error('JSON 修复失败，使用默认结构');
        synthesis = {
          consensus: '由于 AI 响应格式问题，综合分析暂时不可用。',
          disagreements: [],
          emergent_insights: emergentInsights.length > 0 ? emergentInsights : ['请查看各专家的详细分析'],
          risk_assessment: '请参考各专家的独立风险评估。'
        };
      }
    }

    // 返回综合结果 + 加权预测（如果有）
    return NextResponse.json({
      synthesis,
      weighted_predictions: weightedPredictions,
      math_consensus: mathConsensus,
    });
  } catch (error: any) {
    console.error('综合专家响应时出错:', error);
    return NextResponse.json(
      { error: error.message || '响应综合失败' },
      { status: 500 }
    );
  }
}
