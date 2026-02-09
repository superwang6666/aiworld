import type { Locale } from '@/types/i18n';

/**
 * LLM 语言指令配置
 * 用于确保 LLM 输出使用正确的语言
 */
export const LLM_LANGUAGE_INSTRUCTIONS: Record<Locale, string> = {
  'zh-CN':
    '重要: 你的回答必须使用中文。所有文本输出，包括规则描述、分析和反馈，都必须是中文。',
  'en':
    'IMPORTANT: You MUST respond in English. All text output, including rule descriptions, analysis, and feedback, must be in English.',
};

/**
 * LLM 语言配置选项
 */
export const LLM_LANGUAGE_CONFIG = {
  /**
   * 是否启用语言强制指令
   * 设置为 false 可以让 LLM 根据输入自动选择语言
   */
  enforceLanguage: true,

  /**
   * 语言指令插入位置
   * - 'system_prompt_end': 在系统提示词末尾添加
   * - 'user_prompt_start': 在用户提示词开头添加
   * - 'user_prompt_end': 在用户提示词末尾添加
   */
  instructionPosition: 'system_prompt_end' as 'system_prompt_end' | 'user_prompt_start' | 'user_prompt_end',

  /**
   * 是否在每次请求中重复语言指令
   * 设置为 true 可以提高语言一致性，但会增加 token 使用
   */
  repeatInstruction: true,
};

/**
 * 语言名称映射（用于 LLM 提示）
 */
export const LLM_LANGUAGE_NAMES: Record<Locale, string> = {
  'zh-CN': 'Chinese (Simplified)',
  'en': 'English',
};
