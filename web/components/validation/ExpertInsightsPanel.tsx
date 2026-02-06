"use client";

import { useState } from "react";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";


import type { DEACAnalysis } from "@/types";

import ExpertCard from "./advanced-analysis/ExpertCard";
import { adaptDEACAnalysis } from "./advanced-analysis/utils/dataAdapters";

interface ExpertInsightsPanelProps {
  analysis: DEACAnalysis | null;
}

export default function ExpertInsightsPanel({
  analysis,
}: ExpertInsightsPanelProps) {
  const t = useTranslations("Validation");
  const [expandedExperts, setExpandedExperts] = useState<Set<number>>(
    new Set(),
  );

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#7a7a88] text-sm">{t("expertAnalysisNotComplete")}</p>
      </div>
    );
  }

  const adaptedData = adaptDEACAnalysis(analysis);
  if (!adaptedData) return null;

  const toggleExpert = (index: number) => {
    const newSet = new Set(expandedExperts);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedExperts(newSet);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[28px] sm:text-[32px] font-bold bg-gradient-to-r from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent leading-tight">
            {t("expertCommitteeInsights")}
          </h2>
          <div className="flex items-center gap-2 bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] px-4 py-2 rounded-xl border border-[rgba(100,100,115,0.4)]">
            <div
              className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse"
              style={{ boxShadow: "0 0 8px rgba(57, 255, 20, 0.8)" }}
            />
            <span className="text-[#c1c5cc] text-[13px] font-medium">
              {adaptedData.experts.length} {t("expertsCount")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {adaptedData.experts.map((expert, index) => (
            <ExpertCard
              key={index}
              expert={expert}
              index={index}
              isExpanded={expandedExperts.has(index)}
              onToggle={() => toggleExpert(index)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
