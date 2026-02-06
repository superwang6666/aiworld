"use client";

import { useState, useEffect } from "react";

import { Loader2, Archive, Trash2, Download, X } from "lucide-react";
import { useTranslations } from "next-intl";

import type { ArchiveMetadata } from "@/types";

interface ArchiveManagerProps {
  onLoadArchive: (archiveId: string) => void;
  onClose: () => void;
}

export default function ArchiveManager({
  onLoadArchive,
  onClose,
}: ArchiveManagerProps) {
  const t = useTranslations("Archive");
  const [archives, setArchives] = useState<ArchiveMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 加载存档列表
  useEffect(() => {
    loadArchives();
  }, []);

  async function loadArchives() {
    try {
      setLoading(true);
      const response = await fetch("/api/archive/list");

      if (!response.ok) {
        throw new Error(t("loadArchiveListFailed"));
      }

      const data = await response.json();
      setArchives(data.archives || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unknownError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(archiveId: string) {
    if (!confirm(t("confirmDeleteMessage"))) {
      return;
    }

    try {
      setDeletingId(archiveId);

      const response = await fetch(`/api/archive/delete?id=${archiveId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(t("deleteArchiveFailed"));
      }

      // 重新加载列表
      await loadArchives();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* 模态框内容 */}
      <div className="fixed inset-x-[10%] inset-y-8 sm:inset-x-[12%] sm:inset-y-12 md:inset-x-[15%] md:inset-y-16 lg:inset-x-[18%] lg:inset-y-20 xl:inset-x-[20%] xl:inset-y-24 bg-gradient-to-br from-[rgba(20,20,28,0.98)] to-[rgba(30,30,40,0.98)] rounded-2xl border border-[rgba(100,100,115,0.4)] backdrop-blur-xl overflow-hidden flex flex-col shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(100,100,115,0.3)]">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[rgba(100,100,120,0.6)] to-[rgba(80,80,100,0.6)] rounded-xl p-2">
              <Archive className="w-5 h-5 text-[#e8e8ec]" />
            </div>
            <h2 className="text-2xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent">
              {t("worldArchive")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-[rgba(60,60,70,0.6)] hover:bg-[rgba(80,80,90,0.8)] border border-[rgba(100,100,110,0.3)] hover:border-[rgba(120,120,130,0.5)] transition-all duration-200 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-[#c1c5cc]" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#c1c5cc]" />
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-r from-[rgba(139,0,0,0.2)] to-[rgba(139,0,0,0.1)] border border-[rgba(220,38,38,0.5)] text-[#fca5a5] px-4 py-3 rounded-xl">
              {t("error")} {error}
            </div>
          )}

          {!loading && !error && archives.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-[#7a7a88]">
                <div className="bg-gradient-to-r from-[rgba(35,35,45,0.6)] to-[rgba(45,45,55,0.6)] rounded-2xl p-8 inline-block">
                  <Archive className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg text-[#c1c5cc]">{t("noArchivesYet")}</p>
                  <p className="text-sm mt-2">{t("saveAfterGeneration")}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && archives.length > 0 && (
            <div className="space-y-4">
              {archives.map((archive) => (
                <div
                  key={archive.id}
                  className="relative bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] border border-[rgba(100,100,115,0.4)] hover:border-[rgba(140,140,160,0.6)] rounded-2xl p-4 sm:p-5 transition-all duration-300 overflow-hidden group"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#ebebf0] break-words">
                      {archive.name}
                    </h3>

                    <p className="text-sm text-[#c1c5cc] line-clamp-2 break-words">
                      {archive.core_premise}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#7a7a88]">
                      <span className="bg-[rgba(70,70,85,0.5)] px-2 py-1 rounded whitespace-nowrap">
                        {archive.rules_count} {t("rulesCount")}
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span className="whitespace-nowrap">
                        {t("createdOn")}{" "}
                        {new Date(archive.created_at).toLocaleDateString()}
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span className="whitespace-nowrap">
                        {t("updatedOn")}{" "}
                        {new Date(archive.updated_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* 规则预览 */}
                    {archive.preview_rules.length > 0 && (
                      <div className="mt-3 space-y-1 bg-[rgba(25,25,35,0.6)] rounded-xl p-3 border border-[rgba(80,80,95,0.3)]">
                        {archive.preview_rules.map((rule, idx) => (
                          <p
                            key={idx}
                            className="text-xs text-[#7a7a88] truncate"
                          >
                            • {rule}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 悬浮按钮栏 - 类似 B 站效果 */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    {/* 渐变背景遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,20,28,0.98)] via-[rgba(25,25,35,0.95)] to-transparent pointer-events-none" />

                    {/* 按钮容器 */}
                    <div className="relative flex items-center justify-end gap-2 px-4 sm:px-5 py-3">
                      <button
                        onClick={() => onLoadArchive(archive.id)}
                        className="px-4 py-2 bg-gradient-to-br from-[rgba(100,100,120,0.9)] to-[rgba(80,80,100,0.9)] hover:from-[rgba(120,120,145,1)] hover:to-[rgba(100,100,125,1)] border border-[rgba(140,140,160,0.6)] hover:border-[rgba(160,160,180,0.8)] text-[#e8e8ec] font-bold rounded-xl transition-all duration-200 flex items-center justify-center whitespace-nowrap shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(archive.id)}
                        disabled={deletingId === archive.id}
                        className="px-4 py-2 bg-gradient-to-r from-[rgba(139,0,0,0.4)] to-[rgba(139,0,0,0.3)] border border-[rgba(220,38,38,0.6)] hover:border-[rgba(220,38,38,0.9)] text-[#fca5a5] rounded-xl hover:bg-[rgba(139,0,0,0.6)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                      >
                        {deletingId === archive.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
