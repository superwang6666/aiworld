import { NextResponse } from "next/server";

import { getOpenAIClient } from "@/lib/utils/openai-client";

export async function GET() {
  try {
    const { model } = getOpenAIClient();
    const deepSeekKey = process.env.DEEPSEEK_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    return NextResponse.json({
      DEEPSEEK_API_KEY: deepSeekKey
        ? `已设置 (长度: ${deepSeekKey.length})`
        : "❌ 未设置",
      OPENAI_API_KEY: openAiKey
        ? `已设置 (长度: ${openAiKey.length})`
        : "❌ 未设置",
      hasApiKey: true,
      currentModel: model,
      envKeys: Object.keys(process.env).filter(
        (key) =>
          key.includes("API_KEY") ||
          key.includes("DEEPSEEK") ||
          key.includes("OPENAI"),
      ),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to get API configuration";
    return NextResponse.json(
      {
        DEEPSEEK_API_KEY: "❌ 未设置",
        OPENAI_API_KEY: "❌ 未设置",
        hasApiKey: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
