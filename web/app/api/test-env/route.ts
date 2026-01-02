import { NextResponse } from 'next/server';

export async function GET() {
  const deepSeekKey = process.env.DEEPSEEK_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    DEEPSEEK_API_KEY: deepSeekKey ? `已设置 (长度: ${deepSeekKey.length})` : '❌ 未设置',
    OPENAI_API_KEY: openAiKey ? `已设置 (长度: ${openAiKey.length})` : '❌ 未设置',
    hasApiKey: !!(deepSeekKey || openAiKey),
    envKeys: Object.keys(process.env).filter(key => 
      key.includes('API_KEY') || key.includes('DEEPSEEK') || key.includes('OPENAI')
    ),
  });
}

