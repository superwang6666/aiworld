"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import type {
  ValidationResult,
  LawWeight,
  DEACAnalysis,
  LawImpact,
} from "@/types";

import { logger } from "@/lib/utils/logger";

import CommonHeader from "@/components/common/CommonHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import AdvancedAnalysisModal from "./AdvancedAnalysisModal";
import ValidationActions from "./ValidationActions";
import ValidationCoreAnomaly from "./ValidationCoreAnomaly";
import ValidationDominoEffect from "./ValidationDominoEffect";
import ValidationEraserTest from "./ValidationEraserTest";
import ValidationRecommendations from "./ValidationRecommendations";
import ValidationScoreCard from "./ValidationScoreCard";
import ValidationWarnings from "./ValidationWarnings";

interface ValidationPagePremiumProps {
  result: ValidationResult;
  lawWeights: LawWeight[];
  deacAnalysis: DEACAnalysis | null;
  deacLoading: boolean;
  generationMode: "fast" | "deep";
  isGeneratingRules?: boolean;
  onGenerationModeChange: (mode: "fast" | "deep") => void;
  onAccept: () => void;
  onReject: () => void;
}

export default function ValidationPagePremium({
  result,
  lawWeights,
  deacAnalysis,
  deacLoading,
  generationMode,
  isGeneratingRules = false,
  onGenerationModeChange,
  onAccept,
  onReject,
}: ValidationPagePremiumProps) {
  const t = useTranslations("Validation");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluatedImpacts, setEvaluatedImpacts] = useState<LawImpact[]>(
    result.lawImpacts,
  );
  const [hasEvaluated, setHasEvaluated] = useState(false);

  // 找出权重最高的法则作为核心法则
  const coreLaw =
    lawWeights.length > 0
      ? lawWeights.reduce((max, current) =>
          current.weight > max.weight ? current : max,
        ).law
      : undefined;

  const handleEvaluateDirections = async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch("/api/evaluate-directions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lawImpacts: result.lawImpacts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate directions");
      }

      const data = await response.json();
      setEvaluatedImpacts(data.evaluatedImpacts);
      setHasEvaluated(true);
    } catch (error) {
      logger.error("Failed to evaluate directions", { error });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <>
      <div className="size-full overflow-y-auto">
        {/* 使用公共标题栏 */}
        <CommonHeader />

        {/* Main Content */}
        <main className="px-4 sm:px-8 lg:px-12 xl:px-16 pb-12">
          {/* Title */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent mb-3">
              {t("validationReport")}
            </h1>
            <p className="text-[#7a7a88] text-sm sm:text-base">
              Core Anomaly Verification Protocol
            </p>
          </div>

          {/* Score Card and Core Anomaly */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8 sm:mb-12">
            <div className="lg:col-span-4">
              <ValidationScoreCard score={result.uniquenessScore} />
            </div>
            <div className="lg:col-span-8">
              <ValidationCoreAnomaly
                coreAnomalyIdentified={result.coreAnomalyIdentified}
                coreLaw={coreLaw}
              />
            </div>
          </div>

          {/* 生成模式选择 */}
          <div className="mb-8 sm:mb-12">
            <div className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl px-6 py-4 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm">
              <label className="block text-sm font-bold text-[#c1c5cc] uppercase mb-3 font-mono">
                {t("generationMode")}
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="generationMode"
                    value="fast"
                    checked={generationMode === "fast"}
                    onChange={(e) =>
                      onGenerationModeChange(e.target.value as "fast" | "deep")
                    }
                    className="mt-1 w-4 h-4 text-[#00ff88] border-gray-700 focus:ring-[#00ff88]/30"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-mono text-[#e5e5e5] group-hover:text-[#00ff88] transition-colors">
                      <span className="font-bold">{t("fastMode")}</span> ({t("recommended")})
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {t("fastModeDescription")}
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="generationMode"
                    value="deep"
                    checked={generationMode === "deep"}
                    onChange={(e) =>
                      onGenerationModeChange(e.target.value as "fast" | "deep")
                    }
                    className="mt-1 w-4 h-4 text-[#00ff88] border-gray-700 focus:ring-[#00ff88]/30"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-mono text-[#e5e5e5] group-hover:text-[#00ff88] transition-colors">
                      <span className="font-bold">{t("deepMode")}</span>
                      <span className="ml-2 text-xs">
                        {deacLoading ? (
                          <span className="text-yellow-400">
                            ({t("expertAnalysisInProgress")})
                          </span>
                        ) : deacAnalysis && deacAnalysis.expert_responses ? (
                          <span className="text-green-400">
                            ✓ {deacAnalysis.expert_responses.length} {t("expertsReady")}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {t("deepModeDescription")}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Domino Effect Analysis */}
          <ValidationDominoEffect
            lawImpacts={evaluatedImpacts}
            onEvaluateDirections={handleEvaluateDirections}
            isEvaluating={isEvaluating}
            hasEvaluated={hasEvaluated}
          />

          {/* Eraser Test */}
          <ValidationEraserTest eraserTest={result.eraserTest} />

          {/* Warnings */}
          <ValidationWarnings warnings={result.warnings} />

          {/* Recommendations */}
          <ValidationRecommendations recommendations={result.recommendations} />

          {/* Actions */}
          <ValidationActions
            onAccept={onAccept}
            onReject={onReject}
            onAdvancedAnalysis={() => setIsModalOpen(true)}
          />
        </main>
      </div>

      {/* Advanced Analysis Modal */}
      <AdvancedAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lawWeights={lawWeights}
        deacAnalysis={deacAnalysis}
      />

      {/* 生成规则加载遮罩层 */}
      {isGeneratingRules && (
        <LoadingSpinner
          title={
            generationMode === "deep"
              ? t("generatingDeepRules")
              : t("generatingRules")
          }
          subtitle={
            generationMode === "deep"
              ? t("integratingExpertInsights")
              : t("quickGeneratingRules")
          }
          fullScreen
        />
      )}
    </>
  );
}
