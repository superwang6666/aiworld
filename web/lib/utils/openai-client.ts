import OpenAI from "openai";

/**
 * OpenAI 客户端配置结果
 */
export interface OpenAIClientConfig {
  openai: OpenAI;
  model: string;
}

/**
 * 获取配置好的 OpenAI 客户端
 *
 * 优先使用 DeepSeek API，如果未配置则使用 OpenAI API
 *
 * @returns OpenAI 客户端实例和对应的模型名称
 * @throws {Error} 如果两个 API Key 都未配置
 */
export function getOpenAIClient(): OpenAIClientConfig {
  const deepSeekKey = process.env.DEEPSEEK_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const apiKey = deepSeekKey || openAiKey;

  if (!apiKey) {
    throw new Error(
      "API Key not configured. Please set DEEPSEEK_API_KEY or OPENAI_API_KEY in environment variables.",
    );
  }

  const baseURL = deepSeekKey ? "https://api.deepseek.com" : undefined;
  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  const model = deepSeekKey ? "deepseek-chat" : "gpt-4o-mini";

  return {
    openai,
    model,
  };
}

/**
 * 清理 AI 返回的 JSON 响应
 *
 * 移除 markdown 代码块标记和其他格式化字符
 *
 * @param content - AI 返回的原始内容
 * @returns 清理后的 JSON 字符串
 */
export function cleanAIJsonResponse(content: string): string {
  return content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}
