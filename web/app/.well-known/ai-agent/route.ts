import { NextResponse } from 'next/server';

/**
 * AgentPass 发现协议
 * 
 * Agent 通过访问 GET /.well-known/ai-agent.json 来自动发现服务
 */
export async function GET() {
  return NextResponse.json({
    version: '1.0.0',
    endpoint: '/api/agent/entry',
    methods: ['BYOK'],
    metadata: {
      name: 'aiWolrld - World-Building Engine',
      description: 'AI-powered world design and rule generation system with DEAC expert system',
      contact: 'support@aiworld.local',
      capabilities: [
        'rule-generation',
        'premise-validation',
        'expert-dispatch',
        'game-recommendation',
        'tag-generation',
      ],
    },
  });
}
