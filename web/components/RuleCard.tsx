"use client";

import { Check, X, Trash2, AlertTriangle, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import type { WorldRule, RuleTag } from "@/types";

import { getPredefinedTagById } from "@/config/predefined-tags";

import LawCard from "./common/LawCard";
import LawCardHeader from "./common/LawCardHeader";

interface RuleCardProps {
  rule: WorldRule;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  tagWeights?: Record<string, RuleTag>;
  showPrediction?: boolean;
}

export default function RuleCard({
  rule,
  onToggle,
  onDelete,
  tagWeights,
  showPrediction = true,
}: RuleCardProps) {
  const t = useTranslations("Rules");

  // 计算风险等级
  const deletionScore = rule.deletion_score || 0;
  const isWarning = showPrediction && deletionScore >= 0.6;
  const isDanger = showPrediction && deletionScore >= 0.75;

  // 获取标签信息
  const tags = rule.tags || [];
  const tagObjects = tags
    .map((tagId) => {
      const predefined = getPredefinedTagById(tagId);
      if (predefined) return predefined;
      return tagWeights?.[tagId];
    })
    .filter(Boolean) as RuleTag[];

  return (
    <LawCard
      law={rule.law}
      className={`
        p-5
        ${rule.confirmed ? "opacity-100" : "opacity-70 hover:opacity-100"}
        ${isDanger ? "ring-2 ring-red-500/50" : isWarning ? "ring-1 ring-yellow-500/50" : ""}
        ${rule.isNew ? "ring-2 ring-[#39ff14]/50 animate-pulse-glow" : ""}
      `}
    >
      {/* NEW 标识 */}
      {rule.isNew && (
        <div className="absolute -top-2 -left-2 bg-[#39ff14] text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
          <Sparkles className="w-3 h-3" />
          NEW
        </div>
      )}

      {/* 预测警告标识 */}
      {isDanger && !rule.isNew && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
          <AlertTriangle className="w-3 h-3" />
          {t("highRisk")}
        </div>
      )}
      {isWarning && !isDanger && !rule.isNew && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
          <AlertTriangle className="w-3 h-3" />
          {t("prediction")}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3 ml-3">
          {/* 法则 + 标签 */}
          <div className="flex items-center gap-2 flex-wrap">
            <LawCardHeader
              law={rule.law}
              className="mb-0"
              rightContent={null}
            />

            {/* 标签列表 */}
            {tagObjects.slice(0, 5).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 text-xs rounded bg-[rgba(100,100,120,0.3)] border border-[rgba(140,140,160,0.4)] text-[#c1c5cc]"
                title={`${t("weight")}: ${(tag.weight * 100).toFixed(0)}%`}
              >
                {tag.name}
              </span>
            ))}

            {tags.length > 5 && (
              <span className="px-2 py-0.5 text-xs text-[#7a7a88]">
                +{tags.length - 5}
              </span>
            )}
          </div>

          {/* 规则文本 */}
          <p className="text-[#c1c5cc] text-sm leading-relaxed">{rule.rule}</p>

          {/* 专家逻辑 */}
          <div className="bg-[rgba(25,25,35,0.6)] rounded-lg px-3 py-2 border border-[rgba(80,80,95,0.3)]">
            <p className="text-[#7a7a88] text-xs leading-relaxed">
              <span className="font-semibold text-[#c1c5cc]">{t("expertLogic")} </span>
              {rule.expert_logic}
            </p>
          </div>

          {/* 预测评分 (仅在警告时显示) */}
          {showPrediction && deletionScore >= 0.6 && (
            <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-700/50 rounded-lg px-3 py-2">
              <p className="text-yellow-400 text-xs">
                {t("predictionWarning")}{" "}
                {(deletionScore * 100).toFixed(0)}%)
              </p>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-2 shrink-0">
          {/* 确认按钮 */}
          <button
            onClick={() => onToggle(rule.id)}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              transition-all duration-200 border
              ${
                rule.confirmed
                  ? "bg-gradient-to-br from-[rgba(57,255,20,0.2)] to-[rgba(57,255,20,0.1)] border-[rgba(57,255,20,0.5)] text-[#39ff14] hover:from-[rgba(57,255,20,0.3)] hover:to-[rgba(57,255,20,0.2)]"
                  : "bg-[rgba(70,70,85,0.5)] border-[rgba(100,100,115,0.4)] text-[#7a7a88] hover:bg-[rgba(85,85,100,0.6)] hover:border-[rgba(120,120,135,0.5)]"
              }
            `}
            aria-label={rule.confirmed ? t("unconfirmRule") : t("confirmRule")}
            title={rule.confirmed ? t("unconfirmRule") : t("confirmRule")}
          >
            {rule.confirmed ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>

          {/* 删除按钮/已删除标识 */}
          {onDelete && (
            <button
              onClick={() => !rule.rejected && onDelete(rule.id)}
              disabled={rule.rejected}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                rule.rejected
                  ? "border-[rgba(100,100,115,0.3)] bg-[rgba(35,35,45,0.5)] text-[#7a7a88] cursor-not-allowed"
                  : "bg-gradient-to-r from-[rgba(139,0,0,0.3)] to-[rgba(139,0,0,0.2)] border-[rgba(220,38,38,0.5)] text-[#fca5a5] hover:from-[rgba(139,0,0,0.4)] hover:to-[rgba(139,0,0,0.3)] hover:border-[rgba(220,38,38,0.7)]"
              }`}
              aria-label={rule.rejected ? t("ruleDeleted") : t("deleteRule")}
              title={rule.rejected ? t("ruleDeleted") : t("deleteRule")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </LawCard>
  );
}
