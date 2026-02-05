"use client";

import { motion } from "motion/react";

import CircularProgress from "./animations/CircularProgress";
import CountUpAnimation from "./animations/CountUpAnimation";

interface ValidationScoreCardProps {
  score: number; // 0-100
}

export default function ValidationScoreCard({
  score,
}: ValidationScoreCardProps) {
  // 根据分数获取标签
  const getScoreLabel = (score: number) => {
    if (score >= 67) return "独一无二的";
    if (score >= 34) return "高度独特";
    return "有趣";
  };

  const scoreLabel = getScoreLabel(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl border border-[rgba(100,100,115,0.4)] backdrop-blur-sm overflow-hidden h-full"
    >
      <div className="p-5 sm:p-6 h-full flex items-center">
        <div className="flex items-center gap-4 w-full">
          {/* Circular Progress */}
          <div className="relative w-[120px] h-[120px] flex-shrink-0">
            <CircularProgress score={score} size={120} strokeWidth={14} />
            <div className="absolute inset-0 flex items-center justify-center">
              <CountUpAnimation target={score} duration={2000} />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <h3 className="text-[#ebebf0] text-xl leading-snug font-semibold mb-3">
              独特性评分
            </h3>
            <div className="flex items-baseline gap-2 mb-2">
              <motion.span
                className="text-3xl font-black leading-none bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent"
                key={`text-${score}`}
              >
                {score}
              </motion.span>
              <span className="text-[#7a7a88] text-base leading-none">
                /100
              </span>
              <div className="inline-flex items-center gap-2 bg-[rgba(57,255,20,0.1)] border border-[rgba(57,255,20,0.3)] rounded-lg px-2.5 py-1.5 ml-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: "#39ff14",
                    boxShadow: "0 0 8px rgba(57, 255, 20, 0.8)",
                  }}
                />
                <span
                  className="text-sm font-semibold leading-tight"
                  style={{
                    color: "#39ff14",
                    textShadow: "0 0 10px rgba(57, 255, 20, 0.5)",
                  }}
                >
                  {scoreLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
