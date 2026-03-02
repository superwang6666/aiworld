"use client";

import { useState, useEffect, useCallback } from "react";

import { useLocale, useTranslations } from "next-intl";

import type { GameInfo } from "@/types";

import { logger } from "@/lib/utils/logger";

import CommonHeader from "@/components/common/CommonHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface GameAnalysis {
  individualAnalyses: Array<{
    gameName: string;
    artStyle: string;
    gameplayMechanics: string[];
    narrativeStructure: string;
  }>;
  comparativeAnalysis: {
    coreGenreElements: string[];
    worldBuildingInsights: string[];
    premiseSummary: string;
  };
}

interface GameAnalysisResultProps {
  selectedGames: GameInfo[];
  worldDescription: string;
  onComplete: (premiseSummary: string) => void;
  onBack: () => void;
}

export default function GameAnalysisResult({
  selectedGames,
  worldDescription,
  onComplete,
  onBack,
}: GameAnalysisResultProps) {
  const t = useTranslations("GameAnalysis");
  const locale = useLocale();
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [premiseDraft, setPremiseDraft] = useState("");
  const [isPremiseInitialized, setIsPremiseInitialized] = useState(false);
  const [isMergingPremise, setIsMergingPremise] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const trimmedPremiseSummary =
    analysis?.comparativeAnalysis?.premiseSummary?.trim() ?? "";

  const buildCombinedPremise = useCallback(() => {
    const desiredWorld = worldDescription?.trim() ?? "";
    const summary = trimmedPremiseSummary;

    if (desiredWorld && summary) {
      return t("combinedPremiseTemplate", {
        userWorld: desiredWorld,
        recommended: summary,
      });
    }

    if (desiredWorld) return desiredWorld;
    return summary;
  }, [worldDescription, trimmedPremiseSummary, t]);

  useEffect(() => {
    setMounted(true);
    handleAnalyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ games: selectedGames }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze games");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("analysisFailed"));
      logger.error("Game analysis failed", { error: err });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const requestMergedPremise = useCallback(
    async (existingDraftForMerge = "") => {
      if (!trimmedPremiseSummary && !worldDescription?.trim()) {
        return;
      }

      setIsMergingPremise(true);
      setMergeError(null);

      try {
        const response = await fetch("/api/merge-premise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userWorldDescription: worldDescription ?? "",
            aiPremiseSummary: trimmedPremiseSummary,
            existingDraft: existingDraftForMerge,
            locale,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to merge premise");
        }

        const data = await response.json();
        if (data?.mergedText) {
          setPremiseDraft(data.mergedText.trim());
        } else {
          throw new Error("mergedText missing");
        }
      } catch (err: unknown) {
        logger.error("Premise merge failed", { error: err });
        setPremiseDraft(buildCombinedPremise());
        setMergeError(t("mergePremiseFailed"));
      } finally {
        setIsMergingPremise(false);
        setIsPremiseInitialized(true);
      }
    },
    [
      worldDescription,
      trimmedPremiseSummary,
      locale,
      buildCombinedPremise,
      t,
    ],
  );

  useEffect(() => {
    if (!isPremiseInitialized && (trimmedPremiseSummary || worldDescription)) {
      requestMergedPremise();
    }
  }, [
    trimmedPremiseSummary,
    worldDescription,
    isPremiseInitialized,
    requestMergedPremise,
  ]);

  const handleApplyInsights = () => {
    const trimmedDraft = premiseDraft.trim();

    if (!trimmedDraft) {
      alert(t("premiseDraftRequired"));
      return;
    }

    if (analysis?.comparativeAnalysis?.premiseSummary) {
      setIsApplying(true);
      // 使用 setTimeout 确保 loading 状态先更新到 UI
      setTimeout(() => {
        onComplete(trimmedDraft);
      }, 100);
    } else {
      alert(t("incompleteData"));
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0f0f14]">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute blur-[80px] left-[109.57px] opacity-43 size-[837.462px] top-[154.11px]"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml;utf8,<svg viewBox="0 0 837.46 837.46" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" height="100%" width="100%" fill="url(%23grad)" opacity="1"/><defs><radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(0 -59.218 -59.218 0 418.73 418.73)"><stop stop-color="rgba(120,80,180,0.25)" offset="0"/><stop stop-color="rgba(100,70,150,0.15)" offset="0.25"/><stop stop-color="rgba(80,60,120,0.08)" offset="0.5"/><stop stop-color="rgba(0,0,0,0)" offset="0.7"/></radialGradient></defs></svg>\')',
          }}
        />
      </div>

      {/* Top Header */}
      <header className="absolute left-0 top-0 w-full z-50">
        <CommonHeader />
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-[120px] px-[64px] pb-[64px]">
        {isAnalyzing && (
          <LoadingSpinner
            title={t("analyzing")}
            subtitle={t("analyzingSubtitle")}
          />
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-6 py-4 rounded-lg font-mono text-sm mb-8">
            {t("error")} {error}
            <button
              onClick={() => {
                setError(null);
                handleAnalyze();
              }}
              className="ml-4 px-4 py-1 bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
            >
              {t("retry")}
            </button>
          </div>
        )}

        {analysis && (
          <div className="space-y-8">
            {/* 各游戏分析 */}
            {analysis.individualAnalyses &&
              analysis.individualAnalyses.length > 0 && (
                <section>
                  <h2 className="text-[#e5e5e5] text-[20px] font-bold mb-6">
                    {t("eachGame")} <span className="text-[#00ff88]">{t("coreFeatures")}</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.individualAnalyses.map((game, i: number) => (
                      <div
                        key={i}
                        className="group relative bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 border border-[rgba(100,100,115,0.4)] hover:border-[rgba(130,130,145,0.6)]"
                      >
                        <div className="p-6">
                          <h3 className="text-[#e5e5e5] text-[18px] font-bold mb-5 group-hover:text-[#f0f0f5] transition-colors">
                            {game.gameName}
                          </h3>
                          <div className="space-y-4 text-sm">
                            <div className="pb-4 border-b border-[rgba(100,100,115,0.3)]">
                              <p className="text-[#9A9AAA] text-[11px] uppercase tracking-widest font-semibold mb-2">
                                {t("artStyle")}
                              </p>
                              <p className="text-[#c1c5cc] leading-relaxed">
                                {game.artStyle}
                              </p>
                            </div>
                            <div className="pb-4 border-b border-[rgba(100,100,115,0.3)]">
                              <p className="text-[#9A9AAA] text-[11px] uppercase tracking-widest font-semibold mb-2">
                                {t("coreGameplay")}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {game.gameplayMechanics.map(
                                  (mechanic: string, j: number) => (
                                    <span
                                      key={j}
                                      className="px-2.5 py-1 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] text-[#00ff88] text-[11px] rounded"
                                    >
                                      {mechanic}
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-[#9A9AAA] text-[11px] uppercase tracking-widest font-semibold mb-2">
                                {t("narrativeStructure")}
                              </p>
                              <p className="text-[#c1c5cc] leading-relaxed">
                                {game.narrativeStructure}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 卡片发光效果 */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-2xl"
                          style={{
                            background:
                              "radial-gradient(circle at 50% 50%, rgba(0,255,136,0.3), transparent 70%)",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* 核心类型元素 */}
            {analysis.comparativeAnalysis?.coreGenreElements && (
              <section>
                <h2 className="text-[#e5e5e5] text-[20px] font-bold mb-6">
                  {t("extracted")} <span className="text-[#00ff88]">{t("extractedGenreElements")}</span>
                </h2>
                <div className="group relative bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 border border-[rgba(100,100,115,0.4)] hover:border-[rgba(130,130,145,0.6)] p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.comparativeAnalysis.coreGenreElements.map(
                      (el: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-[rgba(0,0,0,0.2)] rounded-lg border border-[rgba(0,255,136,0.2)]"
                        >
                          <span className="text-[#00ff88] text-lg flex-shrink-0">
                            ✓
                          </span>
                          <span className="text-[#c1c5cc] text-sm">{el}</span>
                        </div>
                      ),
                    )}
                  </div>

                  {/* 卡片发光效果 */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(0,255,136,0.3), transparent 70%)",
                    }}
                  />
                </div>
              </section>
            )}

            {/* 世界观构建启发 */}
            {analysis.comparativeAnalysis?.worldBuildingInsights && (
              <section>
                <h2 className="text-[#e5e5e5] text-[20px] font-bold mb-6">
                  {t("worldBuildingPrefix")} <span className="text-[#00ff88]">{t("worldBuildingInsightsTitle")}</span>
                </h2>
                <div className="group relative bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 border border-[rgba(0,255,136,0.3)] hover:border-[rgba(0,255,136,0.5)] p-6">
                  <div className="space-y-4">
                    {analysis.comparativeAnalysis.worldBuildingInsights.map(
                      (insight: string, i: number) => (
                        <div key={i} className="flex gap-4">
                          <span className="text-[#00ff88] flex-shrink-0 text-lg mt-0.5">
                            💡
                          </span>
                          <p className="text-[#c1c5cc] leading-relaxed text-sm">
                            {insight}
                          </p>
                        </div>
                      ),
                    )}
                  </div>

                  {/* 卡片发光效果 */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(0,255,136,0.3), transparent 70%)",
                    }}
                  />
                </div>
              </section>
            )}

            {/* 推荐的世界观概述 */}
            {analysis.comparativeAnalysis?.premiseSummary && (
              <section>
                <h2 className="text-[#e5e5e5] text-[20px] font-bold mb-6">
                  {t("recommended")} <span className="text-[#00ff88]">{t("recommendedPremise")}</span>
                </h2>
                <div className="group relative bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 border border-[rgba(0,255,136,0.5)] hover:border-[rgba(0,255,136,0.7)] p-8">
                  <div className="space-y-6 text-sm">
                    <div>
                      <p className="text-[#9A9AAA] text-[11px] uppercase tracking-[0.3em] mb-2">
                        {t("userWorldHeading")}
                      </p>
                      <div className="text-[#e5e5e5] leading-relaxed bg-[rgba(10,10,15,0.55)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                        {worldDescription?.trim() || t("noWorldDescription")}
                      </div>
                    </div>

                    <div>
                      <p className="text-[#9A9AAA] text-[11px] uppercase tracking-[0.3em] mb-2">
                        {t("aiSummaryHeading")}
                      </p>
                      <div className="text-[#c1c5cc] leading-relaxed bg-[rgba(10,10,15,0.4)] p-4 rounded-xl border border-[rgba(0,255,136,0.15)]">
                        {analysis.comparativeAnalysis.premiseSummary}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-[#00ff88] font-semibold tracking-[0.08em]">
                          {t("mergedEditableHeading")}
                        </p>
                        <button
                          type="button"
                          onClick={() => requestMergedPremise(premiseDraft)}
                          disabled={isMergingPremise}
                          className={`text-[12px] px-3 py-1.5 rounded-full border border-[rgba(0,255,136,0.4)] text-[#00ff88] transition-colors ${
                            isMergingPremise
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:bg-[rgba(0,255,136,0.1)]"
                          }`}
                        >
                          {isMergingPremise
                            ? t("mergingPremise")
                            : t("regenerateMergedPremise")}
                        </button>
                      </div>
                      <label htmlFor="world-premise-editor" className="sr-only">
                        {t("mergedEditableHeading")}
                      </label>
                      <textarea
                        id="world-premise-editor"
                        value={premiseDraft}
                        onChange={(event) => setPremiseDraft(event.target.value)}
                        placeholder={t("editablePremisePlaceholder")}
                        className="w-full min-h-[160px] rounded-2xl bg-[rgba(10,10,15,0.6)] border border-[rgba(0,255,136,0.4)] text-[#e5e5e5] text-[15px] leading-relaxed p-4 focus:outline-none focus:ring-2 focus:ring-[#00ff88]/30 focus:border-[#00ff88] transition-colors placeholder:text-[#6f6f7a]"
                      />
                      <p className="text-xs text-[#8a8a95] mt-3">
                        {t("editablePremiseHelper")}
                      </p>
                      {mergeError && (
                        <p className="text-xs text-red-400 mt-2">
                          {mergeError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 卡片发光效果 */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(0,255,136,0.3), transparent 70%)",
                    }}
                  />
                </div>
              </section>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4 justify-center pt-4">
              <button
                onClick={onBack}
                className="px-12 py-3 bg-gradient-to-b from-[#8a8a95] to-[#6a6a75] text-white font-bold rounded-lg hover:from-[#9a9aaa] hover:to-[#7a7a85] transition-colors text-[14px]"
              >
                {t("backToReselect")}
              </button>
              <button
                onClick={handleApplyInsights}
                className="px-12 py-3 bg-[#00ff88] text-[#0f0f14] font-bold rounded-lg hover:bg-[#00e67e] shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-colors text-[14px]"
              >
                {t("adoptAnalysis")}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 采纳分析结果加载遮罩层 */}
      {isApplying && (
        <LoadingSpinner
          title={t("validatingAnomaly")}
          subtitle={t("analyzingWorldSetting")}
          fullScreen
        />
      )}
    </div>
  );
}
