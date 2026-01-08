import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ExpertResponse } from '@/types';

/**
 * POST /api/deac/synthesize
 *
 * 将多个专家视角综合为连贯的洞察
 *
 * 请求体:
 * {
 *   expert_responses: ExpertResponse[],
 *   heterogeneity_point: string
 * }
 *
 * 响应:
 * {
 *   synthesis: {
 *     consensus: string,
 *     disagreements: Array<{topic, perspectives}>,
 *     emergent_insights: string[],
 *     risk_assessment: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { expert_responses, heterogeneity_point } = await request.json();

    if (!expert_responses || expert_responses.length === 0) {
      return NextResponse.json(
        { error: '没有提供专家响应' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    const baseURL = process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com' : undefined;
    const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini';

    const openai = new OpenAI({ apiKey, baseURL });

    const synthesis_prompt = `你是世界构建综合 AI,负责整合多个专家视角。

核心异质点: ${heterogeneity_point}

专家分析:
${expert_responses.map((r: ExpertResponse, i: number) => `
专家 ${i + 1}: ${r.expert_name} (${r.domain})
${r.analysis}
${r.warnings?.length ? `警告: ${r.warnings.join('; ')}` : ''}
`).join('\n---\n')}

请通过以下方式综合这些视角:
1. 识别专家达成共识的地方(共识点)
2. 突出分歧(专家对同一主题的不同观点)
3. 提取涌现洞察(结合多个视角产生的新想法)
4. 提供整体风险评估

必须返回有效的 JSON,结构如下:
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

    const synthesis = JSON.parse(content);

    return NextResponse.json({ synthesis });
  } catch (error: any) {
    console.error('综合专家响应时出错:', error);
    return NextResponse.json(
      { error: error.message || '响应综合失败' },
      { status: 500 }
    );
  }
}
