import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getOpenAIClient } from '@/lib/utils/openai-client';
import { enforceRateLimit, RATE_LIMIT_PRESETS } from '@/lib/utils/rate-limit';

/**
 * AgentPass 握手入口
 *
 * Agent 通过 BYOK 模式自带 API Key 调用
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, "agent-entry", RATE_LIMIT_PRESETS.llmHeavy);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    // ✅ 验证握手包
    if (body.auth_type !== 'BYOK') {
      return NextResponse.json(
        { status: 'error', error: 'Only BYOK auth supported' },
        { status: 400 }
      );
    }

    const { credentials, task, identity } = body;

    if (!credentials?.api_key || !task?.action) {
      return NextResponse.json(
        { status: 'error', error: 'Missing credentials or task' },
        { status: 400 }
      );
    }

    console.log(`[AgentPass] ${identity || 'unknown'} - Task: ${task.action}`);

    // ✅ 用 Agent 的 API Key 调用 LLM
    const { openai, model } = getOpenAIClient(credentials.api_key);
    
    let result;

    // ✅ 支持的任务类型
    if (task.action === 'rule-generation') {
      const prompt = `Generate world-building rules for a fantasy setting with the following premise:\n${JSON.stringify(task.params, null, 2)}`;
      
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      result = {
        type: 'rule-generation',
        output: response.choices[0].message.content,
        usage: response.usage,
      };
    } 
    else if (task.action === 'premise-validation') {
      const prompt = `Validate this world-building premise for logical consistency:\n${JSON.stringify(task.params, null, 2)}`;
      
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1000,
      });

      result = {
        type: 'premise-validation',
        output: response.choices[0].message.content,
        usage: response.usage,
      };
    }
    else if (task.action === 'expert-dispatch') {
      const prompt = `Dispatch appropriate experts to analyze this scenario:\n${JSON.stringify(task.params, null, 2)}`;
      
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 1500,
      });

      result = {
        type: 'expert-dispatch',
        output: response.choices[0].message.content,
        usage: response.usage,
      };
    }
    else {
      return NextResponse.json(
        { status: 'error', error: `Unknown action: ${task.action}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: result,
      agent: identity || 'anonymous',
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AgentPass Error]', msg);
    
    // 不泄露内部错误
    return NextResponse.json(
      { status: 'error', error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 发现协议：GET /.well-known/ai-agent.json
 * 
 * Agent 通过这个端点自动发现 aiWolrld 的 AgentPass 支持
 */
export async function GET() {
  return NextResponse.json({
    version: '1.0.0',
    endpoint: '/api/agent/entry',
    methods: ['BYOK'],
    metadata: {
      name: 'aiWolrld - World-Building Engine',
      description: 'AI-powered world design and rule generation system',
      capabilities: [
        'rule-generation',
        'premise-validation',
        'expert-dispatch',
      ],
    },
  });
}
