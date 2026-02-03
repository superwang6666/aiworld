import type { Law } from './index';

/**
 * 世界方向类型定义
 *
 * 世界方向将核心专家的专业领域映射为结构化的知识类别
 */

/**
 * 世界方向类别
 * - base: 基础方向，对应6个核心专家
 * - special: 特定方向，由动态生成的特殊专家提供
 */
export type WorldDirectionCategory = 'base' | 'special';

/**
 * 世界方向定义
 */
export interface WorldDirection {
  id: string;                      // 唯一标识符
  name: string;                    // 显示名称
  category: WorldDirectionCategory;
  associatedLaws: Law[];           // 该方向关联的法则
  expertIds: string[];             // 提供此方向的专家 ID
  description: string;             // 方向描述
  knowledgeDomains: string[];      // 知识领域
}

/**
 * 方向-法则映射
 *
 * 定义每个基础方向如何影响7个法则
 */
export interface DirectionLawMapping {
  direction: string;               // 方向 ID
  law: Law;                       // 法则
  impactLevel: 'primary' | 'secondary' | 'tertiary';
  impactDescription: string;      // 该方向如何影响这个法则
}
