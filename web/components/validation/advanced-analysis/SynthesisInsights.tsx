"use client";

import {
  Atom,
  Zap,
  Brain,
  Lightbulb,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

interface SynthesisInsightsProps {
  insights: string[];
}

// 固定图标列表，用于循环分配
const INSIGHT_ICONS: LucideIcon[] = [
  Atom,
  Zap,
  Brain,
  Lightbulb,
  Sparkles,
  Target,
];

// 对应的颜色列表
const INSIGHT_COLORS: string[] = [
  "#22d3ee", // cyan-400
  "#06b6d4", // cyan-500
  "#0891b2", // cyan-600
  "#0e7490", // cyan-700
  "#22d3ee", // 循环回到cyan-400
  "#06b6d4", // 循环回到cyan-500
];

export default function SynthesisInsights({
  insights,
}: SynthesisInsightsProps) {
  const t = useTranslations("Validation");

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="group relative bg-gradient-to-br from-[rgba(35,35,45,0.95)] to-[rgba(45,45,55,0.95)] rounded-2xl p-4 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm hover:border-cyan-400/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.08)] transition-all duration-500 overflow-hidden"
    >
      {/* 装饰性背景光效 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 flex items-center justify-center border border-cyan-400/30 group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-5 h-5 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 3L13.5 8.5L19 10L14.5 14.5L16 20L12 17L8 20L9.5 14.5L5 10L10.5 8.5L12 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 8V12L14 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-[#e8e8ec] text-lg font-bold mb-1 flex items-center gap-2 group-hover:text-cyan-400 transition-colors duration-300">
              <span>{t("emergentInsights")}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/40 to-transparent" />
            </h3>
            <p className="text-[#7a7a88] text-xs uppercase tracking-wider font-medium">
              Emergent Insights
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, i) => {
            const IconComponent = INSIGHT_ICONS[i % INSIGHT_ICONS.length];
            const iconColor = INSIGHT_COLORS[i % INSIGHT_COLORS.length];

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 + i * 0.1 }}
                className="group/card relative bg-[rgba(25,25,35,0.6)] rounded-lg p-3 border border-[rgba(80,80,95,0.3)] hover:border-cyan-400/40 hover:bg-[rgba(34,211,238,0.03)] transition-all duration-300"
              >
                <div className="flex items-start gap-2">
                  <IconComponent
                    className="w-4 h-4 flex-shrink-0 mt-0.5 group-hover/card:scale-110 transition-transform duration-300"
                    style={{ color: iconColor }}
                    strokeWidth={1.5}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#c1c5cc] text-sm leading-relaxed">
                      {insight}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
