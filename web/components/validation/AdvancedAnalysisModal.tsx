"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import type { LawWeight, DEACAnalysis } from "@/types";

import SynthesisConsensus from "./advanced-analysis/SynthesisConsensus";
import SynthesisInsights from "./advanced-analysis/SynthesisInsights";
import SynthesisRiskAssessment from "./advanced-analysis/SynthesisRiskAssessment";
import { adaptDEACAnalysis } from "./advanced-analysis/utils/dataAdapters";
import ExpertInsightsPanel from "./ExpertInsightsPanel";
import LawWeightsPanel from "./LawWeightsPanel";

interface AdvancedAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawWeights: LawWeight[];
  deacAnalysis: DEACAnalysis | null;
}

export default function AdvancedAnalysisModal({
  isOpen,
  onClose,
  lawWeights,
  deacAnalysis,
}: AdvancedAnalysisModalProps) {
  const adaptedData = adaptDEACAnalysis(deacAnalysis);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* 模态框内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-[10%] inset-y-8 sm:inset-x-[12%] sm:inset-y-12 md:inset-x-[15%] md:inset-y-16 lg:inset-x-[18%] lg:inset-y-20 xl:inset-x-[20%] xl:inset-y-24 bg-gradient-to-br from-[rgba(20,20,28,0.98)] to-[rgba(30,30,40,0.98)] rounded-2xl border border-[rgba(100,100,115,0.4)] backdrop-blur-xl z-50 overflow-hidden flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(100,100,115,0.3)]">
              <h2 className="text-2xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent">
                高级分析阶段
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg bg-[rgba(60,60,70,0.6)] hover:bg-[rgba(80,80,90,0.8)] border border-[rgba(100,100,110,0.3)] hover:border-[rgba(120,120,130,0.5)] transition-all duration-200 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-[#c1c5cc]" />
              </button>
            </div>

            {/* 内容区域 - 整合所有内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-8">
                {/* 法则权重分析 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <LawWeightsPanel lawWeights={lawWeights} />
                </motion.div>

                {/* 专家委员会洞察 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <ExpertInsightsPanel analysis={deacAnalysis} />
                </motion.div>

                {/* 综合分析 */}
                {adaptedData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="space-y-4"
                  >
                    <SynthesisConsensus
                      consensus={adaptedData.synthesis.consensus}
                    />
                    <SynthesisInsights
                      insights={adaptedData.synthesis.insights}
                    />
                    <SynthesisRiskAssessment
                      riskAssessment={adaptedData.synthesis.riskAssessment}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
