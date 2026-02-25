"use client";

import { type ReactNode } from "react";

import { Layers, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import type { DEACAnalysis } from "@/types";

interface ModeOption {
  value: "fast" | "deep";
  title: string;
  description: string;
  icon: ReactNode;
  badge?: string;
  status?: { text: string; tone: "success" | "warning" };
}

interface ValidationGenerationModeProps {
  generationMode: "fast" | "deep";
  deacAnalysis: DEACAnalysis | null;
  deacLoading: boolean;
  onGenerationModeChange: (mode: "fast" | "deep") => void;
}

export default function ValidationGenerationMode({
  generationMode,
  deacAnalysis,
  deacLoading,
  onGenerationModeChange,
}: ValidationGenerationModeProps) {
  const t = useTranslations("Validation");
  const expertCount = deacAnalysis?.expert_responses?.length ?? 0;

  const options: ModeOption[] = [
    {
      value: "fast",
      title: t("fastMode"),
      description: t("fastModeDescription"),
      icon: <Zap className="w-5 h-5 text-[#39ff14]" />,
      badge: t("recommended"),
    },
    {
      value: "deep",
      title: t("deepMode"),
      description: t("deepModeDescription"),
      icon: <Layers className="w-5 h-5 text-[#00c2ff]" />,
      status: deacLoading
        ? { text: t("expertAnalysisInProgress"), tone: "warning" }
        : expertCount > 0
          ? { text: `${expertCount} ${t("expertsReady")}`, tone: "success" }
          : undefined,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mb-8 sm:mb-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-1 h-8 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, #39ff14 0%, rgba(57, 255, 20, 0.3) 100%)",
            boxShadow: "0 0 10px rgba(57, 255, 20, 0.5)",
          }}
        />
        <h2 className="text-2xl sm:text-3xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent">
          {t("generationMode")}
        </h2>
      </div>

      <div className="bg-gradient-to-br from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl border border-[rgba(100,100,115,0.4)] backdrop-blur-sm p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {options.map((option) => {
            const isSelected = option.value === generationMode;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onGenerationModeChange(option.value)}
                className={`group relative text-left rounded-2xl border p-5 transition-all duration-300 ${
                  isSelected
                    ? "border-[#39ff14] bg-[rgba(40,40,55,0.9)] shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
                    : "border-[rgba(100,100,115,0.4)] bg-[rgba(25,25,35,0.8)] hover:border-[rgba(110,255,150,0.4)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
                }`}
              >
                <input
                  type="radio"
                  name="generationMode"
                  value={option.value}
                  checked={isSelected}
                  readOnly
                  className="sr-only"
                />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-xl p-3 transition-all ${
                        isSelected
                          ? "bg-[rgba(57,255,20,0.15)]"
                          : "bg-[rgba(57,255,20,0.05)]"
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-[#f2f4fa]">
                        {option.title}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`mt-1 inline-flex h-3 w-3 rounded-full transition-[background,box-shadow] ${
                      isSelected
                        ? "bg-[#39ff14] shadow-[0_0_12px_rgba(57,255,20,0.8)]"
                        : "bg-[#3a3a47]"
                    }`}
                  />
                </div>

                {option.badge && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(100,100,115,0.5)] px-3 py-1 text-xs font-mono uppercase tracking-widest text-[#9ba0ad] mb-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                    {option.badge}
                  </span>
                )}

                <p className="text-sm text-[#9ba0ad] leading-relaxed">
                  {option.description}
                </p>

                {option.status && (
                  <div
                    className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                      option.status.tone === "success"
                        ? "bg-[rgba(57,255,20,0.08)] text-[#39ff14]"
                        : "bg-[rgba(255,186,38,0.08)] text-[#ffba26]"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        option.status.tone === "success"
                          ? "bg-[#39ff14]"
                          : "bg-[#ffba26]"
                      }`}
                    />
                    {option.status.text}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
