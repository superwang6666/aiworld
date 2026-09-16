"use client";

import { Download, Archive } from "lucide-react";
import { useTranslations } from "next-intl";

import type { WorldRule, RuleTag } from "@/types";

import CommonHeader from "@/components/common/CommonHeader";
import RuleCard from "@/components/RuleCard";
import WorkflowFooter from "@/components/workflow/WorkflowFooter";

interface RulesDisplayProps {
  rules: WorldRule[];
  tagWeights: Record<string, RuleTag>;
  archiveName: string;
  isPublic: boolean;
  confirmedCount: number;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onArchiveNameChange: (name: string) => void;
  onIsPublicChange: (isPublic: boolean) => void;
  onSaveArchive: () => void;
  onShowArchiveManager: () => void;
  onExport: () => void;
  onReset: () => void;
}

export default function RulesDisplay({
  rules,
  tagWeights,
  archiveName,
  isPublic,
  confirmedCount,
  onToggleRule,
  onDeleteRule,
  onArchiveNameChange,
  onIsPublicChange,
  onSaveArchive,
  onShowArchiveManager,
  onExport,
  onReset,
}: RulesDisplayProps) {
  const t = useTranslations("Rules");

  return (
    <>
      <div className="size-full overflow-y-auto">
        {/* 使用公共标题栏 */}
        <CommonHeader />

        {/* Main Content */}
        <main className="px-4 sm:px-8 lg:px-12 xl:px-16 pb-12">
          {/* Title */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent mb-3">
              {t("worldRules")}
            </h1>
            <p className="text-[#7a7a88] text-sm sm:text-base">
              {t("worldRulesGenerationSystem")}
            </p>
          </div>

          {/* 统计信息和操作按钮 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-12">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-xl px-4 py-2 border border-[rgba(100,100,115,0.4)]">
                <span className="text-[#c1c5cc] text-sm">
                  {t("generatedRules")}: <span className="text-[#ebebf0] font-bold">{rules.length}</span>
                </span>
              </div>
              <div className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-xl px-4 py-2 border border-[rgba(100,100,115,0.4)]">
                <span className="text-[#c1c5cc] text-sm">
                  {t("confirmed")}: <span className="text-[#ebebf0] font-bold">{confirmedCount}/{rules.length}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={onShowArchiveManager}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[rgba(100,100,120,0.6)] to-[rgba(80,80,100,0.6)] hover:from-[rgba(120,120,145,0.8)] hover:to-[rgba(100,100,125,0.8)] border border-[rgba(140,140,160,0.4)] hover:border-[rgba(160,160,180,0.6)] text-[#e8e8ec] rounded-xl transition-all duration-300 text-sm"
              >
                <Archive className="w-4 h-4" />
                {t("archiveManagement")}
              </button>
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 bg-[rgba(70,70,85,0.7)] hover:bg-[rgba(85,85,100,0.85)] border border-[rgba(110,110,125,0.4)] hover:border-[rgba(130,130,145,0.6)] text-[#c1c5cc] rounded-xl transition-all duration-300 text-sm"
              >
                {t("restart")}
              </button>
              <button
                onClick={onExport}
                disabled={confirmedCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] hover:from-[rgba(120,120,145,0.95)] hover:to-[rgba(100,100,125,0.95)] disabled:opacity-50 disabled:cursor-not-allowed border border-[rgba(140,140,160,0.5)] hover:border-[rgba(160,160,180,0.7)] text-[#e8e8ec] rounded-xl transition-all duration-300 text-sm"
              >
                <Download className="w-4 h-4" />
                {t("exportConfirmed")} ({confirmedCount})
              </button>
            </div>
          </div>

          {/* 存档保存区域 */}
          {rules.length > 0 && (
            <div className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl px-6 py-5 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm mb-8 sm:mb-12">
              <h3 className="text-lg font-bold text-[#c1c5cc] uppercase mb-4 tracking-wider">
                {t("saveWorldArchive")}
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={archiveName}
                  onChange={(e) => onArchiveNameChange(e.target.value)}
                  placeholder={t("enterArchiveName")}
                  className="flex-1 px-4 py-3 bg-[rgba(25,25,35,0.6)] border border-[rgba(80,80,95,0.3)] rounded-xl text-[#c1c5cc] placeholder-[#7a7a88] focus:border-[rgba(140,140,160,0.5)] focus:outline-none transition-colors"
                />
                <button
                  onClick={onSaveArchive}
                  disabled={!archiveName.trim() || rules.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] hover:from-[rgba(120,120,145,0.95)] hover:to-[rgba(100,100,125,0.95)] border border-[rgba(140,140,160,0.5)] hover:border-[rgba(160,160,180,0.7)] text-[#e8e8ec] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {t("saveArchive")}
                </button>
              </div>
              <label className="flex items-center gap-2 mt-4 cursor-pointer select-none w-fit">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => onIsPublicChange(e.target.checked)}
                  className="w-4 h-4 rounded border-[rgba(100,100,115,0.5)] accent-[#39ff14]"
                />
                <span className="text-sm text-[#c1c5cc]">{t("makePublicArchive")}</span>
              </label>
              <p className="text-xs text-[#7a7a88] mt-1">
                {isPublic ? t("makePublicArchiveHint") : t("archiveWillInclude")}
              </p>
            </div>
          )}

          {/* 规则列表 */}
          {rules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {rules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={onToggleRule}
                  onDelete={onDeleteRule}
                  tagWeights={tagWeights}
                  showPrediction={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] border border-[rgba(100,100,115,0.4)] rounded-2xl p-12 text-center">
              <p className="text-[#7a7a88] text-base mb-6">{t("noGeneratedRules")}</p>
              <button
                onClick={onReset}
                className="px-6 py-3 bg-gradient-to-br from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] hover:from-[rgba(120,120,145,0.95)] hover:to-[rgba(100,100,125,0.95)] border border-[rgba(140,140,160,0.5)] hover:border-[rgba(160,160,180,0.7)] text-[#e8e8ec] font-bold rounded-xl transition-all duration-300"
              >
                {t("restart")}
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <WorkflowFooter />
      </div>
    </>
  );
}
