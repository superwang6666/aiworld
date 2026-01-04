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
