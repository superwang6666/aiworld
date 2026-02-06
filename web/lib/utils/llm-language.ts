import {
  LLM_LANGUAGE_INSTRUCTIONS,
  LLM_LANGUAGE_CONFIG,
  LLM_LANGUAGE_NAMES,
} from '@/config/llm-language';

import { DEFAULT_LOCALE } from '@/types/i18n';

import type { Locale} from '@/types/i18n';


/**
 * 获取 LLM 语言指令
 * @param locale 语言代码
 * @returns 语言指令字符串，如果未启用则返回空字符串
 */
export function getLLMLanguageInstruction(locale: Locale): string {
  if (!LLM_LANGUAGE_CONFIG.enforceLanguage) {
    return '';
  }
  return LLM_LANGUAGE_INSTRUCTIONS[locale] || LLM_LANGUAGE_INSTRUCTIONS[DEFAULT_LOCALE];
}

/**
 * 在提示词末尾添加语言指令
 * @param prompt 原始提示词
 * @param locale 语言代码
 * @returns 添加了语言指令的提示词
 */
export function appendLanguageInstruction(prompt: string, locale: Locale): string {
  const instruction = getLLMLanguageInstruction(locale);
  if (!instruction) {
    return prompt;
  }
  return `${prompt}\n\n${instruction}`;
}

/**
 * 在提示词开头添加语言指令
 * @param prompt 原始提示词
 * @param locale 语言代码
 * @returns 添加了语言指令的提示词
 */
export function prependLanguageInstruction(prompt: string, locale: Locale): string {
  const instruction = getLLMLanguageInstruction(locale);
  if (!instruction) {
    return prompt;
  }
  return `${instruction}\n\n${prompt}`;
}

/**
 * 根据配置位置添加语言指令
 * @param prompt 原始提示词
 * @param locale 语言代码
 * @param position 指令位置（可选，默认使用配置中的位置）
 * @returns 添加了语言指令的提示词
 */
export function addLanguageInstruction(
  prompt: string,
  locale: Locale,
  position?: 'start' | 'end'
): string {
  const actualPosition = position || (
    LLM_LANGUAGE_CONFIG.instructionPosition.includes('start') ? 'start' : 'end'
  );

  if (actualPosition === 'start') {
    return prependLanguageInstruction(prompt, locale);
  }
  return appendLanguageInstruction(prompt, locale);
}

/**
 * 获取语言名称（用于 LLM 提示）
 * @param locale 语言代码
 * @returns 语言名称
 */
export function getLLMLanguageName(locale: Locale): string {
  return LLM_LANGUAGE_NAMES[locale] || LLM_LANGUAGE_NAMES[DEFAULT_LOCALE];
}

/**
 * 创建带语言上下文的系统提示词
 * @param systemPrompt 原始系统提示词
 * @param locale 语言代码
 * @returns 添加了语言指令的系统提示词
 */
export function createLanguageAwareSystemPrompt(systemPrompt: string, locale: Locale): string {
  if (LLM_LANGUAGE_CONFIG.instructionPosition === 'system_prompt_end') {
    return appendLanguageInstruction(systemPrompt, locale);
  }
  return systemPrompt;
}

/**
 * 创建带语言上下文的用户提示词
 * @param userPrompt 原始用户提示词
 * @param locale 语言代码
 * @returns 添加了语言指令的用户提示词
 */
export function createLanguageAwareUserPrompt(userPrompt: string, locale: Locale): string {
  if (LLM_LANGUAGE_CONFIG.instructionPosition === 'user_prompt_start') {
    return prependLanguageInstruction(userPrompt, locale);
  }
  if (LLM_LANGUAGE_CONFIG.instructionPosition === 'user_prompt_end') {
    return appendLanguageInstruction(userPrompt, locale);
  }
  return userPrompt;
}
