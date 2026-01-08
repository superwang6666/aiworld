/**
 * DEAC (动态专家智能体集群) 模块
 *
 * 专家系统的主入口点
 */

export { runDEACAnalysis } from './background-service';
export { cacheSpecialExpert, hasCachedExpert, findCachedExpertsByDomain } from './cache-manager';
export { loadCoreExperts, loadSpecialExpert, getExpertById } from '../experts/loader';
export { analyzeGaps } from '../experts/gap-analyzer';
export { generateSpecialExpert } from '../experts/prompt-architect';
export { dispatchExperts } from '../experts/orchestrator';

// 方便重新导出类型
export type {
  ExpertConfig,
  ExpertResponse,
  GapAnalysis,
  DEACAnalysis,
  DEACContext,
} from '@/types';
