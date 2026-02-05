"use client";

import { AlertTriangle, Shield, TrendingDown, Brain } from "lucide-react";
import { motion } from "motion/react";

import type { LucideIcon } from "lucide-react";

interface SynthesisRiskAssessmentProps {
  riskAssessment: string;
}

interface RiskItem {
  text: string;
}

// 固定图标列表，用于循环分配
const RISK_ICONS: LucideIcon[] = [AlertTriangle, Shield, TrendingDown, Brain];

// 对应的颜色列表
const RISK_COLORS: string[] = [
  "#f87171", // red-400
  "#fb923c", // orange-400
  "#fbbf24", // amber-400
  "#f59e0b", // amber-500
];

export default function SynthesisRiskAssessment({
  riskAssessment,
}: SynthesisRiskAssessmentProps) {
  // 解析风险评估字符串，提取多个风险点
  const parseRiskAssessment = (text: string): RiskItem[] => {
    // 尝试通过数字序号解析（1. 2. 或 1) 2) 或 ① ②）
    const patterns = [
      /\d+[.、)）]\s*(.+?)(?=\d+[.、)）]|$)/g,
      /[①②③④⑤⑥⑦⑧⑨⑩]\s*(.+?)(?=[①②③④⑤⑥⑦⑧⑨⑩]|$)/g,
      /[-•]\s*(.+?)(?=[-•]|$)/g,
    ];

    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 1) {
        return matches
          .map((m) => ({ text: m[1].trim() }))
          .filter((item) => item.text.length > 0);
      }
    }

    // 尝试按换行符分割
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 10 && !line.match(/^风险评估[:：]/));

    if (lines.length > 1) {
      return lines.map((line) => ({ text: line }));
    }

    // 尝试按句号分割
    const sentences = text
      .split(/[。；;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    if (sentences.length > 1) {
      return sentences.map((s) => ({ text: s }));
    }

    // 如果还是无法解析，返回整个文本作为单个风险项
    return [{ text: riskAssessment }];
  };

  const risks = parseRiskAssessment(riskAssessment);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="group relative bg-gradient-to-br from-[rgba(180,80,60,0.15)] to-[rgba(150,60,40,0.08)] rounded-2xl p-4 border border-[rgba(180,80,60,0.4)] backdrop-blur-sm hover:border-[rgba(180,80,60,0.6)] hover:shadow-[0_0_30px_rgba(180,80,60,0.1)] transition-all duration-500 overflow-hidden"
    >
      {/* 装饰性背景光效 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-red-400/20 to-red-400/5 flex items-center justify-center border border-red-400/30 group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2L2 22H22L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 9V13"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="17"
                r="0.5"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-red-300 text-lg font-bold mb-1 flex items-center gap-2 group-hover:text-red-400 transition-colors duration-300">
              <span>风险评估</span>
              <div className="h-px flex-1 bg-gradient-to-r from-red-400/40 to-transparent" />
            </h3>
            <p className="text-[#7a7a88] text-xs uppercase tracking-wider font-medium">
              Risk Assessment
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {risks.map((risk, i) => {
            const IconComponent = RISK_ICONS[i % RISK_ICONS.length];
            const iconColor = RISK_COLORS[i % RISK_COLORS.length];

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.0 + i * 0.1 }}
                className="group/card relative bg-[rgba(180,80,60,0.1)] rounded-lg p-3 border border-[rgba(180,80,60,0.25)] hover:border-[rgba(180,80,60,0.4)] hover:bg-[rgba(180,80,60,0.15)] transition-all duration-300"
              >
                <div className="flex items-start gap-2">
                  <IconComponent
                    className="w-4 h-4 flex-shrink-0 mt-0.5 group-hover/card:scale-110 transition-transform duration-300"
                    style={{ color: iconColor }}
                    strokeWidth={1.5}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#c1c5cc] text-sm leading-relaxed">
                      {risk.text}
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
