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
