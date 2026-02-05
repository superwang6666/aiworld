"use client";

import { useState, useEffect } from "react";

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
  onComplete: (premiseSummary: string) => void;
  onBack: () => void;
}

export default function GameAnalysisResult({
  selectedGames,
  onComplete,
  onBack,
}: GameAnalysisResultProps) {
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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
      setError(err instanceof Error ? err.message : "分析失败，请稍后重试");
      logger.error("Game analysis failed", { error: err });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyInsights = () => {
    if (analysis?.comparativeAnalysis?.premiseSummary) {
      setIsApplying(true);
      // 使用 setTimeout 确保 loading 状态先更新到 UI
      setTimeout(() => {
        onComplete(analysis.comparativeAnalysis.premiseSummary);
      }, 100);
    } else {
      alert("分析数据不完整，请重试");
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
            title="AI 正在分析选中的游戏..."
            subtitle="提取核心特征，生成世界观启发"
          />
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-6 py-4 rounded-lg font-mono text-sm mb-8">
            错误: {error}
            <button
              onClick={() => {
                setError(null);
                handleAnalyze();
              }}
              className="ml-4 px-4 py-1 bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
            >
              重试
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
                    各游戏 <span className="text-[#00ff88]">核心特征</span>
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
                                美术风格
                              </p>
                              <p className="text-[#c1c5cc] leading-relaxed">
                                {game.artStyle}
                              </p>
                            </div>
                            <div className="pb-4 border-b border-[rgba(100,100,115,0.3)]">
                              <p className="text-[#9A9AAA] text-[11px] uppercase tracking-widest font-semibold mb-2">
                                核心玩法
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
                                叙事结构
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
                  提取的 <span className="text-[#00ff88]">类型核心元素</span>
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
                  世界观 <span className="text-[#00ff88]">构建启发</span>
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
                  推荐的 <span className="text-[#00ff88]">世界观概述</span>
                </h2>
                <div className="group relative bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 border border-[rgba(0,255,136,0.5)] hover:border-[rgba(0,255,136,0.7)] p-8">
                  <p className="text-[#c1c5cc] text-[16px] leading-relaxed font-light">
                    {analysis.comparativeAnalysis.premiseSummary}
                  </p>

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
                返回重选
              </button>
              <button
                onClick={handleApplyInsights}
                className="px-12 py-3 bg-[#00ff88] text-[#0f0f14] font-bold rounded-lg hover:bg-[#00e67e] shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-colors text-[14px]"
              >
                采纳分析结果
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 采纳分析结果加载遮罩层 */}
      {isApplying && (
        <LoadingSpinner
          title="正在验证核心异质点..."
          subtitle="专家团队正在分析您的世界设定"
          fullScreen
        />
      )}
    </div>
  );
}
