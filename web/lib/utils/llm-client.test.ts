import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

import {
  createChatCompletion,
  cleanAIJsonResponse,
  getByokOpenAIClient,
} from "./llm-client";

const mockAnthropicCreate = jest.fn();
const mockOpenAICreate = jest.fn();

jest.mock("@anthropic-ai/sdk", () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: mockAnthropicCreate },
  }));
});

jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockOpenAICreate } },
  }));
});

const ORIGINAL_ENV = process.env;

function clearProviderEnv(): void {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_MODEL;
  delete process.env.DEEPSEEK_API_KEY;
  delete process.env.OPENAI_API_KEY;
}

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  clearProviderEnv();
  mockAnthropicCreate.mockReset();
  mockOpenAICreate.mockReset();
  (Anthropic as unknown as jest.Mock).mockClear();
  (OpenAI as unknown as jest.Mock).mockClear();
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe("createChatCompletion — provider selection", () => {
  it("throws when no API key is configured at all", async () => {
    await expect(
      createChatCompletion({ userPrompt: "hi" }),
    ).rejects.toThrow(/API Key not configured/);
  });

  it("uses Claude when ANTHROPIC_API_KEY is set", async () => {
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "claude says hi" }],
    });

    const result = await createChatCompletion({ userPrompt: "hi" });

    expect(result).toBe("claude says hi");
    expect(mockAnthropicCreate).toHaveBeenCalledTimes(1);
    expect(mockOpenAICreate).not.toHaveBeenCalled();
    expect(Anthropic).toHaveBeenCalledWith({ apiKey: "anthropic-key" });
  });

  it("prefers Claude over DeepSeek when both are configured", async () => {
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    process.env.DEEPSEEK_API_KEY = "deepseek-key";
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "claude wins" }],
    });

    await createChatCompletion({ userPrompt: "hi" });

    expect(mockAnthropicCreate).toHaveBeenCalledTimes(1);
    expect(mockOpenAICreate).not.toHaveBeenCalled();
  });

  it("falls back to DeepSeek when ANTHROPIC_API_KEY is absent", async () => {
    process.env.DEEPSEEK_API_KEY = "deepseek-key";
    mockOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: "deepseek says hi" } }],
    });

    const result = await createChatCompletion({ userPrompt: "hi" });

    expect(result).toBe("deepseek says hi");
    expect(OpenAI).toHaveBeenCalledWith({
      apiKey: "deepseek-key",
      baseURL: "https://api.deepseek.com",
    });
    const [callArgs] = mockOpenAICreate.mock.calls[0];
    expect(callArgs.model).toBe("deepseek-chat");
  });

  it("falls back to OpenAI when only OPENAI_API_KEY is set", async () => {
    process.env.OPENAI_API_KEY = "openai-key";
    mockOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: "openai says hi" } }],
    });

    await createChatCompletion({ userPrompt: "hi" });

    expect(OpenAI).toHaveBeenCalledWith({
      apiKey: "openai-key",
      baseURL: undefined,
    });
    const [callArgs] = mockOpenAICreate.mock.calls[0];
    expect(callArgs.model).toBe("gpt-4o-mini");
  });

  it("BYOK agentApiKey always goes to OpenAI official, ignoring ANTHROPIC_API_KEY", async () => {
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    mockOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: "byok response" } }],
    });

    const result = await createChatCompletion({
      userPrompt: "hi",
      agentApiKey: "agent-supplied-key",
    });

    expect(result).toBe("byok response");
    expect(mockAnthropicCreate).not.toHaveBeenCalled();
    expect(OpenAI).toHaveBeenCalledWith({
      apiKey: "agent-supplied-key",
      baseURL: "https://api.openai.com/v1",
    });
    const [callArgs] = mockOpenAICreate.mock.calls[0];
    expect(callArgs.model).toBe("gpt-4o-mini");
  });
});

describe("createChatCompletion — Claude-specific behavior", () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
  });

  it("uses ANTHROPIC_MODEL override when set, default claude-sonnet-5 otherwise", async () => {
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "ok" }],
    });

    await createChatCompletion({ userPrompt: "hi" });
    expect(mockAnthropicCreate.mock.calls[0][0].model).toBe("claude-sonnet-5");

    process.env.ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
    await createChatCompletion({ userPrompt: "hi" });
    expect(mockAnthropicCreate.mock.calls[1][0].model).toBe(
      "claude-haiku-4-5-20251001",
    );
  });

  it("appends the JSON-only instruction to the system prompt when jsonMode is true", async () => {
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "{}" }],
    });

    await createChatCompletion({
      systemPrompt: "You are helpful.",
      userPrompt: "hi",
      jsonMode: true,
    });

    const system = mockAnthropicCreate.mock.calls[0][0].system as string;
    expect(system).toContain("You are helpful.");
    expect(system).toContain("ONLY valid JSON");
  });

  it("passes systemPrompt through unmodified when jsonMode is false", async () => {
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "ok" }],
    });

    await createChatCompletion({
      systemPrompt: "You are helpful.",
      userPrompt: "hi",
    });

    expect(mockAnthropicCreate.mock.calls[0][0].system).toBe(
      "You are helpful.",
    );
  });

  it("omits system entirely when no systemPrompt is given", async () => {
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "ok" }],
    });

    await createChatCompletion({ userPrompt: "hi" });

    expect(mockAnthropicCreate.mock.calls[0][0].system).toBeUndefined();
  });

  it("defaults max_tokens to 4096 and honors an explicit override", async () => {
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "ok" }],
    });

    await createChatCompletion({ userPrompt: "hi" });
    expect(mockAnthropicCreate.mock.calls[0][0].max_tokens).toBe(4096);

    await createChatCompletion({ userPrompt: "hi", maxTokens: 8192 });
    expect(mockAnthropicCreate.mock.calls[1][0].max_tokens).toBe(8192);
  });

  it("throws when the response has no text content block", async () => {
    mockAnthropicCreate.mockResolvedValue({ content: [] });

    await expect(
      createChatCompletion({ userPrompt: "hi" }),
    ).rejects.toThrow(/No text content in Claude response/);
  });
});

describe("createChatCompletion — OpenAI-compatible-specific behavior", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "openai-key";
  });

  it("sets response_format json_object when jsonMode is true, omits it otherwise", async () => {
    mockOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: "ok" } }],
    });

    await createChatCompletion({ userPrompt: "hi", jsonMode: true });
    expect(mockOpenAICreate.mock.calls[0][0].response_format).toEqual({
      type: "json_object",
    });

    await createChatCompletion({ userPrompt: "hi" });
    expect(mockOpenAICreate.mock.calls[1][0].response_format).toBeUndefined();
  });

  it("only includes a system message when systemPrompt is provided", async () => {
    mockOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: "ok" } }],
    });

    await createChatCompletion({ userPrompt: "hi" });
    expect(mockOpenAICreate.mock.calls[0][0].messages).toEqual([
      { role: "user", content: "hi" },
    ]);

    await createChatCompletion({ systemPrompt: "sys", userPrompt: "hi" });
    expect(mockOpenAICreate.mock.calls[1][0].messages).toEqual([
      { role: "system", content: "sys" },
      { role: "user", content: "hi" },
    ]);
  });

  it("does not force a default max_tokens (undefined unless explicitly given)", async () => {
    mockOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: "ok" } }],
    });

    await createChatCompletion({ userPrompt: "hi" });
    expect(mockOpenAICreate.mock.calls[0][0].max_tokens).toBeUndefined();

    await createChatCompletion({ userPrompt: "hi", maxTokens: 500 });
    expect(mockOpenAICreate.mock.calls[1][0].max_tokens).toBe(500);
  });

  it("throws when the response has no content", async () => {
    mockOpenAICreate.mockResolvedValue({ choices: [{ message: {} }] });

    await expect(
      createChatCompletion({ userPrompt: "hi" }),
    ).rejects.toThrow(/No response from AI service/);
  });
});

describe("getByokOpenAIClient", () => {
  it("always points at OpenAI's official API with gpt-4o-mini", () => {
    const { model } = getByokOpenAIClient("some-agent-key");

    expect(model).toBe("gpt-4o-mini");
    expect(OpenAI).toHaveBeenCalledWith({
      apiKey: "some-agent-key",
      baseURL: "https://api.openai.com/v1",
    });
  });
});

describe("cleanAIJsonResponse", () => {
  it("strips ```json fences", () => {
    expect(cleanAIJsonResponse('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("strips bare ``` fences", () => {
    expect(cleanAIJsonResponse('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("trims surrounding whitespace", () => {
    expect(cleanAIJsonResponse('  {"a":1}  ')).toBe('{"a":1}');
  });

  it("leaves already-clean JSON untouched", () => {
    expect(cleanAIJsonResponse('{"a":1}')).toBe('{"a":1}');
  });
});
