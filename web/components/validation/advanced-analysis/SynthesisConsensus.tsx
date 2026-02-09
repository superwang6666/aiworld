"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

interface SynthesisConsensusProps {
  consensus: string;
}

export default function SynthesisConsensus({
  consensus,
}: SynthesisConsensusProps) {
  const t = useTranslations("Validation");

  // 解析共识字符串，提取列表项
  const parseConsensus = (text: string): string[] => {
    // 尝试通过数字序号解析（1. 2. 或 1) 2) 或 ① ②）
    const patterns = [
      /\d+[.、)）]\s*(.+?)(?=\d+[.、)）]|$)/g,
      /[①②③④⑤⑥⑦⑧⑨⑩]\s*(.+?)(?=[①②③④⑤⑥⑦⑧⑨⑩]|$)/g,
      /[-•]\s*(.+?)(?=[-•]|$)/g,
    ];

    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        return matches
          .map((m) => m[1].trim())
          .filter((item) => item.length > 0);
      }
    }

    // 如果无法解析，尝试按换行符分割
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 10);
    if (lines.length > 1) {
      return lines;
    }

    // 如果还是无法解析，返回整个文本作为单个项
    return [text];
  };

  const consensusItems = parseConsensus(consensus);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="group relative bg-gradient-to-br from-[rgba(35,35,45,0.95)] to-[rgba(45,45,55,0.95)] rounded-2xl p-4 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm hover:border-[rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.08)] transition-all duration-500 overflow-hidden"
    >
      {/* 装饰性背景光效 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(57,255,20,0.05)] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[rgba(57,255,20,0.2)] to-[rgba(57,255,20,0.05)] flex items-center justify-center border border-[rgba(57,255,20,0.3)] group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-5 h-5 text-[#39ff14]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18.5L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-[#e8e8ec] text-lg font-bold mb-1 flex items-center gap-2 group-hover:text-[#39ff14] transition-colors duration-300">
              <span>{t("expertConsensus")}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-[rgba(57,255,20,0.4)] to-transparent" />
            </h3>
            <p className="text-[#7a7a88] text-xs uppercase tracking-wider font-medium">
              {t("crossExpertConsensus")}
            </p>
          </div>
        </div>

        <div className="relative pl-12">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[rgba(57,255,20,0.4)] via-[rgba(57,255,20,0.2)] to-transparent" />
          <div className="text-[#c1c5cc] leading-relaxed text-sm space-y-2">
            {consensusItems.length > 1 && (
              <p className="mb-2">{t("allExpertsAgree")}</p>
            )}
            {consensusItems.map((item, index) => (
              <p key={index} className="flex items-start gap-2">
                <span className="text-[#39ff14] font-medium flex-shrink-0">
                  {index + 1}.
                </span>
                <span>{item}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
