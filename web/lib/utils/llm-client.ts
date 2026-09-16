import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

/**
 * 统一 LLM 调用入口
 *
 * 之前全仓库有 13 个文件、15 处各自手写"选 DeepSeek/OpenAI Key + baseURL + model"
 * 的逻辑（8 个走共享的 getOpenAIClient，另外 5 个各自内联/私有实现，完全绕开共享
 * 函数）。只加 Claude 支持到共享函数是不够的——那 5 个文件根本不会经过它。所以这里
 * 把"发一次带 system/user prompt 的对话、拿到文本回复"整个收敛成一个函数，调用方
 * 不用关心背后是哪个 provider、也不用直接碰任何 SDK client。
 *
 * Provider 优先级：
 *   agentApiKey 存在（BYOK） → 固定走 OpenAI 官方 + gpt-4o-mini（行为与之前一致）
 *   否则：ANTHROPIC_API_KEY → DEEPSEEK_API_KEY → OPENAI_API_KEY
 */

const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5";

const JSON_ONLY_INSTRUCTION =
  "\n\nIMPORTANT: Respond with ONLY valid JSON. Do not wrap it in markdown code fences, and do not include any explanatory text before or after the JSON.";

export interface ChatCompletionOptions {
  /** 系统提示词，不传则只发一条 user message */
  systemPrompt?: string;
  userPrompt: string;
  /** 默认 0.7 */
  temperature?: number;
  /** 对应之前 OpenAI 侧的 response_format: { type: "json_object" } */
  jsonMode?: boolean;
  /** 默认 4096。Anthropic 这个字段是必填的，这里统一给个默认值屏蔽掉这个差异 */
  maxTokens?: number;
  /** Agent BYOK 模式传入的调用方自带 Key；存在时固定走 OpenAI 官方，忽略下面的 provider 优先级 */
  agentApiKey?: string;
}

type Provider = "anthropic" | "openai-compatible";

interface ResolvedProvider {
  provider: Provider;
  apiKey: string;
  baseURL?: string;
  model: string;
}

function resolveProvider(agentApiKey?: string): ResolvedProvider {
  if (agentApiKey) {
    return {
      provider: "openai-compatible",
      apiKey: agentApiKey,
      baseURL: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
    };
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return {
      provider: "anthropic",
      apiKey: anthropicKey,
      model: process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL,
    };
  }

  const deepSeekKey = process.env.DEEPSEEK_API_KEY;
  if (deepSeekKey) {
    return {
      provider: "openai-compatible",
      apiKey: deepSeekKey,
      baseURL: "https://api.deepseek.com",
      model: "deepseek-chat",
    };
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    return {
      provider: "openai-compatible",
      apiKey: openAiKey,
      model: "gpt-4o-mini",
    };
  }

  throw new Error(
    "API Key not configured. Please set ANTHROPIC_API_KEY, DEEPSEEK_API_KEY or OPENAI_API_KEY in environment variables.",
  );
}

async function createAnthropicCompletion(
  resolved: ResolvedProvider,
  options: ChatCompletionOptions,
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: resolved.apiKey });

  const system = options.jsonMode
    ? `${options.systemPrompt || ""}${JSON_ONLY_INSTRUCTION}`.trim()
    : options.systemPrompt;

  const response = await anthropic.messages.create({
    model: resolved.model,
    max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    system,
    messages: [{ role: "user", content: options.userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("No text content in Claude response");
  }

  return textBlock.text;
}

async function createOpenAICompatibleCompletion(
  resolved: ResolvedProvider,
  options: ChatCompletionOptions,
): Promise<string> {
  const openai = new OpenAI({
    apiKey: resolved.apiKey,
    baseURL: resolved.baseURL,
  });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (options.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }
  messages.push({ role: "user", content: options.userPrompt });

  const completion = await openai.chat.completions.create({
    model: resolved.model,
    messages,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: options.maxTokens,
    ...(options.jsonMode ? { response_format: { type: "json_object" as const } } : {}),
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI service");
  }

  return content;
}

/**
 * 发一次对话式 LLM 调用，返回纯文本回复。
 * 背后是 Claude 还是 DeepSeek/OpenAI 由环境变量决定，调用方不需要关心。
 */
export async function createChatCompletion(
  options: ChatCompletionOptions,
): Promise<string> {
  const resolved = resolveProvider(options.agentApiKey);

  if (resolved.provider === "anthropic") {
    return createAnthropicCompletion(resolved, options);
  }
  return createOpenAICompatibleCompletion(resolved, options);
}

/**
 * BYOK（Agent 自带 Key）场景需要访问原始 completion 对象（比如 usage 字段），
 * 不适合套用只返回纯文本的 createChatCompletion。BYOK 固定走 OpenAI 官方 API
 * （不受 Claude/DeepSeek provider 优先级影响），单独导出这个函数，
 * 保证仍然只有这一个文件会 `new OpenAI(...)`。
 */
export function getByokOpenAIClient(agentApiKey: string): {
  openai: OpenAI;
  model: string;
} {
  return {
    openai: new OpenAI({
      apiKey: agentApiKey,
      baseURL: "https://api.openai.com/v1",
    }),
    model: "gpt-4o-mini",
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
