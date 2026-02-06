"use client";

import { Zap } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import type { Law } from "@/types";

import { getLawName } from "@/config/law-names";

import { useI18n } from "@/components/providers/I18nProvider";

interface ValidationCoreAnomalyProps {
  coreAnomalyIdentified: string;
  coreLaw?: Law; // 核心法则
}

export default function ValidationCoreAnomaly({
  coreAnomalyIdentified,
  coreLaw,
}: ValidationCoreAnomalyProps) {
  const { locale } = useI18n();
  const t = useTranslations("Validation");
  const tLaws = useTranslations("Laws");

  // 如果没有指定核心法则，默认使用"形而上学"
  const lawName = coreLaw ? getLawName(coreLaw, locale) : tLaws("Metaphysics");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl border border-[rgba(100,100,115,0.4)] backdrop-blur-sm overflow-hidden h-full"
    >
      <div className="p-5 sm:p-6 h-full flex flex-col justify-center">
        <div className="flex items-start gap-3 mb-4">
          <Zap
            className="w-6 h-6 text-[#39ff14] flex-shrink-0"
            style={{ filter: "drop-shadow(0 0 8px rgba(57, 255, 20, 0.6))" }}
          />
          <div className="flex-1">
            <h3 className="text-[#ebebf0] text-xl leading-snug font-semibold mb-1">
              {t("coreAnomalyIdentified")}
            </h3>
            <p className="text-[#7a7a88] text-xs leading-normal">
              {t("metaphysicalAnomalyDetected")}
            </p>
          </div>
        </div>

        {/* 主要异常描述框 */}
        <div className="bg-[rgba(25,25,35,0.6)] rounded-xl px-4 py-3 border border-[rgba(80,80,95,0.3)]">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-1 h-4 rounded-full bg-[#39ff14]"
              style={{
                boxShadow: "0 0 8px rgba(57, 255, 20, 0.6)",
              }}
            />
            <h4 className="text-[#e8e8ec] text-base leading-normal font-semibold">
              {lawName}{t("anomaly")}
            </h4>
          </div>
          <p className="text-[#c1c5cc] text-sm leading-relaxed">
            {coreAnomalyIdentified}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
