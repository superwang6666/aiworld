import type { ExpertConfig, ValidationResult } from "@/types";


import { DEFAULT_LOCALE } from "@/types/i18n";

import { cacheSpecialExpert } from "@/lib/deac/cache-manager";
import { createChatCompletion } from "@/lib/utils/llm-client";
import { logger } from "@/lib/utils/logger";
import { loadPrompt } from "@/lib/utils/prompt-loader";

import { smartMatchExpert } from "./expert-matcher";
import { getFallbackLocale } from "./path-utils";

import type { Locale } from "@/types/i18n";

interface SpecialExpertRequest {
  domain: string;
  reason: string;
  knowledge_scope: string[];
  heterogeneity_point: string;
  validation_result?: ValidationResult;
}

/**
 * 智能生成或复用特殊专家
 *
 * 此函数会:
 * 1. 检查已缓存的特殊专家
 * 2. 如果找到相似的专家则复用或更新
 * 3. 只在必要时创建新专家
 *
 * @param request - 专家请求
 * @param locale - 目标语言 (默认: 'zh-CN')
 * @returns 专家配置
 */
export async function generateSpecialExpert(
  request: SpecialExpertRequest,
  locale: Locale = DEFAULT_LOCALE,
): Promise<ExpertConfig> {
  logger.info("Smart matching expert for domain", { domain: request.domain, locale });

  // 使用智能匹配器
  const matchResult = await smartMatchExpert(request, locale);

  if (matchResult.action === "reuse") {
    logger.info("Reusing existing expert", { reason: matchResult.reason });
    return matchResult.expert!;
  } else if (matchResult.action === "update") {
    logger.info("Updating existing expert", { reason: matchResult.reason });
    return matchResult.expert!;
  } else {
    logger.info("Creating new special expert", { reason: matchResult.reason, locale });

    // 创建新专家（主语言）
    const newExpert = await generateNewSpecialExpert(request, locale);

    // 缓存新专家（主语言）
    await cacheSpecialExpert(newExpert, locale);

    // 异步生成另一种语言版本（不阻塞）
    const otherLocale = getFallbackLocale(locale);
    generateNewSpecialExpert(request, otherLocale)
      .then((otherExpert) => cacheSpecialExpert(otherExpert, otherLocale))
      .catch((error) =>
        logger.error("Background locale generation failed", {
          error,
          locale: otherLocale,
        }),
      );

    logger.info("New expert created and cached", {
      expertName: newExpert.name,
      locale,
    });
    return newExpert;
  }
}

/**
 * 使用 LLM 生成新的特殊专家配置(内部函数)
 *
 * @param request - 专家请求
 * @param locale - 目标语言
 * @returns 专家配置
 */
async function generateNewSpecialExpert(
  request: SpecialExpertRequest,
  locale: Locale,
): Promise<ExpertConfig> {
  // 从 i18n 加载提示词
  const systemMessage = loadPrompt(
    "ExpertSystem.promptArchitect.systemMessage",
    locale,
  );
  const generationPrompt = loadPrompt(
    "ExpertSystem.promptArchitect.generationPrompt",
    locale,
    {
      domain: request.domain,
      reason: request.reason,
      heterogeneityPoint: request.heterogeneity_point,
      knowledgeScope: request.knowledge_scope.join(locale === "zh-CN" ? "、" : ", "),
      createdAt: new Date().toISOString(),
    },
  );

  let content = await createChatCompletion({
    systemPrompt: systemMessage,
    userPrompt: generationPrompt,
    temperature: 0.8,
    jsonMode: true,
  });

  // 清理可能的 markdown 代码块
  content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");

  const expertConfig = JSON.parse(content);
  expertConfig.locale = locale; // 标记语言
  return expertConfig as ExpertConfig;
}
