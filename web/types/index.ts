export type Law = 
  | "Space" 
  | "Survival" 
  | "Cognition" 
  | "Scarcity" 
  | "Time" 
  | "Power" 
  | "Metaphysics";

export interface WorldRule {
  id: string;
  law: Law;
  rule: string;
  expert_logic: string;
  confirmed: boolean;

  // HIL-Archive 系统扩展字段
  tags: string[];                // 标签ID数组
  discipline_codes: string[];    // 关联的学科代码数组
  rejected: boolean;             // 是否被用户拒绝/删除
  deletion_score?: number;       // 预测删除评分 (0-1, 越高越可能被删除)
  created_at: string;            // 规则生成时间 (ISO 8601)
  isNew?: boolean;               // 是否为新生成的规则 (替换删除规则)
}

export interface GenerationRequest {
  corePremise: string;
  artStyle: string;
}

export interface LawImpact {
  law: Law;
  impact: string;
  example: string;
  uniquenessScore?: number; // 0-100, 独特性评分
  passedCriteria?: string[]; // 通过的评估标准
}

export interface EraserTest {
  originalScenario: string;
  replacementScenario: string;
  analysis: string;
  verdict: 'structural' | 'decorative';
}

export interface ValidationResult {
  isUnique: boolean;
  uniquenessScore: number; // 0-100
  coreAnomalyIdentified: string;
  lawImpacts: LawImpact[];
  eraserTest: EraserTest;
  warnings: string[];
  recommendations: string[];
}

// ==================== 法则权重系统 ====================

export interface LawWeight {
  law: Law;
  weight: number;        // 0-1，归一化权重
  impactLevel: 'critical' | 'major' | 'minor' | 'negligible';
  rulesCount: number;    // 建议生成的规则数量
  reasoning?: string;    // 权重计算的原因说明
}

// ==================== 生成选项 ====================

export interface GenerationOptions {
  mode: 'fast' | 'deep';  // 快速模式 vs 深度模式
  waitForDEAC?: boolean;  // 是否等待DEAC完成（深度模式自动为true）
}

// ==================== 游戏分析相关类型 ====================

export interface GameInfo {
  id: number;
  name: string;
  released: string;                // 发行日期 YYYY-MM-DD
  rating: number;                  // RAWG评分 0-5
  metacritic: number | null;       // Metacritic评分 0-100
  platforms: string[];             // 平台列表
  genres: string[];                // 游戏类型
  background_image: string;        // 封面图片URL
  description: string;             // 游戏描述
  developers?: string[];           // 开发商
  tags?: string[];                 // 标签
  recommendationReason?: string;   // AI推荐理由
}

export interface GameAnalysis {
  gameName: string;
  coreElements: string[];          // 核心元素（3-5个）
  artStyle: string;                // 美术风格
  gameplayMechanics: string[];     // 核心玩法机制
  narrativeStructure: string;      // 叙事结构
  uniqueFeatures: string[];        // 独特特征
}

export interface ComparativeAnalysis {
  games: string[];                 // 被分析的游戏列表
  commonElements: string[];        // 共同点
  differences: {
    game: string;
    uniqueElements: string[];
  }[];                             // 各游戏的独特之处
  coreGenreElements: string[];     // 提取的类型核心元素
  worldBuildingInsights: string[]; // 对世界观构建的启发
}

export interface GameSearchRequest {
  query: string;
  genre?: string;
  includeReviews?: boolean;
}

export interface GameSearchResponse {
  games: GameInfo[];
  totalCount: number;
}

// ==================== DEAC 专家系统类型 ====================

/**
 * 法则映射 - 指示该专家可以分析哪些法则
 */
export interface LawMapping {
  primary: Law[];      // 该专家专精的法则
  secondary?: Law[];   // 该专家可以提供次要洞察的法则
}

/**
 * 专家推理风格
 */
export type ReasoningStyle =
  | "analytical"        // 数据驱动、系统化
  | "holistic"         // 整体视角、关联性
  | "adversarial"      // 批判性、质疑性
  | "speculative"      // 想象力、探索性
  | "empirical";       // 实证基础、务实性

/**
 * 核心专家配置 (存储在 JSON 文件中)
 */
export interface ExpertConfig {
  id: string;                          // 例如: "physics-geology-expert"
  version: string;                     // "1.0.0"
  name: string;                        // 显示名称
  domain: string;                      // "物理学与地质学"
  knowledge_scope: string[];           // ["重力", "地质构造", "材料学"]
  law_mapping: LawMapping;             // 该专家覆盖哪些法则
  prompt_template: string;             // 系统提示词模板,包含 {{变量}}
  reasoning_style: ReasoningStyle;
  expertise_depth: number;             // 1-10, 影响响应细节程度
  specialization_tags?: string[];      // ["硬科幻", "世界构建"]
  created_by: "system" | "prompt_architect"; // 来源追踪
  created_at?: string;                 // ISO 时间戳 (特殊专家)
}

/**
 * 专家响应(带归因)
 */
export interface ExpertResponse {
  expert_id: string;
  expert_name: string;
  domain: string;
  analysis: string;                    // 主要专家洞察
  law_impacts: {                       // 对每个法则的影响预测
    law: Law;
    prediction: string;
    confidence: number;                // 0-1
  }[];
  warnings?: string[];                 // 识别的潜在问题
  suggestions?: string[];              // 专家建议
  reasoning_trace?: string;            // 可选: 显示专家思考过程
  timestamp: string;
}

/**
 * 差距分析结果
 */
export interface GapAnalysis {
  heterogeneity_point: string;         // 正在分析的核心异质点
  covered_laws: Law[];                 // 活跃核心专家覆盖的法则
  uncovered_laws: Law[];               // 没有专家覆盖的法则
  partial_coverage: {                  // 覆盖较弱的法则
    law: Law;
    reason: string;
  }[];
  special_expertise_needed: {          // 检测到需要特殊专家的差距
    domain: string;                    // 例如: "魔法物理学"
    reason: string;                    // 为什么需要这个专业知识
    suggested_knowledge: string[];     // 该专家应该了解什么
  }[];
  confidence_score: number;            // 0-1, 对差距检测的信心度
}

/**
 * DEAC 分析结果 (完整系统输出)
 */
export interface DEACAnalysis {
  timestamp: string;
  heterogeneity_point: string;
  gap_analysis: GapAnalysis;
  activated_experts: string[];         // 使用的专家 ID
  expert_responses: ExpertResponse[];
  synthesis: {                         // 综合专家洞察
    consensus: string;                 // 专家共识
    disagreements: {                   // 专家分歧
      topic: string;
      perspectives: { expert: string; view: string }[];
    }[];
    emergent_insights: string[];       // 结合多视角产生的新洞察
    risk_assessment: string;           // 综合风险评估
  };
  special_experts_generated: ExpertConfig[]; // 新创建的专家
}

/**
 * DEAC 上下文 (DEAC 系统的输入)
 */
export interface DEACContext {
  core_premise: string;
  validation_result?: ValidationResult; // 来自步骤 2
  art_style?: string;                   // 来自步骤 4
  current_step: "premise" | "validation" | "artStyle" | "rules";
  user_preferences?: {
    max_experts?: number;               // 限制专家数量
    prefer_brevity?: boolean;           // 更简短的响应
    enable_special_generation?: boolean; // 允许生成新专家
  };
}

// ==================== HIL-Archive 标签系统 ====================

/**
 * 规则标签配置
 */
export interface RuleTag {
  id: string;                    // 标签ID (如: "brutal", "cyclic")
  name: string;                  // 显示名称 (如: "残酷", "循环")
  category: 'tone' | 'mechanism' | 'narrative' | 'logic'; // 标签类别
  weight: number;                // 全局权重 (0-1, 初始0.5)
  usage_count: number;           // 被使用次数
  deletion_count: number;        // 关联规则被删除次数
  source: 'predefined' | 'llm';  // 标签来源
  created_at?: string;           // LLM生成标签的时间戳
}

/**
 * 标签权重快照 (用于存档)
 */
export interface TagWeightSnapshot {
  [tagId: string]: {
    weight: number;
    usage: number;
    deletions: number;
  };
}

// ==================== HIL-Archive 学科分类系统 ====================

/**
 * 学科分类 (基于《普通高等学校本科专业目录》)
 */
export interface AcademicDiscipline {
  code: string;                  // 学科代码 (如: "0201" 理论经济学)
  name: string;                  // 学科名称
  level: 1 | 2;                  // 1=门类, 2=专业类
  parent_code: string | null;    // 父级代码 (门类为null)
  related_laws: Law[];           // 关联的七大法则
  expert_ids?: string[];         // 相关专家ID
  keywords: string[];            // 关键词 (用于规则匹配)
}

/**
 * 学科覆盖统计
 */
export interface DisciplineCoverage {
  discipline_code: string;
  discipline_name: string;
  rule_count: number;            // 该学科下的规则总数
  confirmed_count: number;       // 已确认的规则数
  last_generated?: string;       // 最后生成规则时间 (ISO 8601)
}

// ==================== HIL-Archive 世界存档系统 ====================

/**
 * 完整世界存档
 */
export interface WorldArchive {
  id: string;                    // 存档唯一ID (UUID)
  name: string;                  // 用户自定义存档名称
  core_premise: string;          // 核心异质点
  art_style?: string;            // 美术风格

  // 时间戳
  created_at: string;            // 创建时间 (ISO 8601)
  updated_at: string;            // 最后更新时间

  // 验证结果
  validation_result: ValidationResult;
  law_weights: LawWeight[];
  deac_analysis?: DEACAnalysis;

  // 规则库 (包括已删除的规则,通过rejected字段标识)
  rules: WorldRule[];

  // 标签权重快照 (记录用户偏好)
  tag_weights: TagWeightSnapshot;

  // 学科覆盖统计
  discipline_coverage: DisciplineCoverage[];

  // 元数据统计
  total_rules_generated: number;   // 总共生成的规则数
  active_rules_count: number;      // 未被删除的规则数
  confirmed_rules_count: number;   // 已确认的规则数
  generation_sessions: number;     // 生成批次计数
}

/**
 * 存档元数据 (用于列表显示)
 */
export interface ArchiveMetadata {
  id: string;
  name: string;
  core_premise: string;          // 核心异质点 (用于预览)
  created_at: string;
  updated_at: string;
  rules_count: number;           // 活跃规则数 (不包括已删除)
  preview_rules: string[];       // 前3条规则预览
}

/**
 * 标签生成请求
 */
export interface TagGenerationRequest {
  rule: WorldRule;               // 要打标签的规则
  existing_tags: RuleTag[];      // 已有的所有标签 (用于复用)
}

/**
 * 标签生成响应
 */
export interface TagGenerationResponse {
  rule_id: string;
  predefined_tags: string[];     // 从预定义标签池匹配的标签ID
  llm_generated_tags: RuleTag[]; // LLM生成的新标签
  recommended_tags: string[];    // 最终推荐的标签ID列表
}

/**
 * 学科映射请求
 */
export interface DisciplineMappingRequest {
  rule: WorldRule;
  disciplines: AcademicDiscipline[];
}

/**
 * 学科映射响应
 */
export interface DisciplineMappingResponse {
  rule_id: string;
  discipline_codes: string[];    // 映射到的学科代码数组
  confidence: number;            // 映射置信度 (0-1)
}

