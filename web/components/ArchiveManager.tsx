'use client';

import { useState, useEffect } from 'react';
import { ArchiveMetadata } from '@/types';
import { Loader2, Archive, Trash2, Download, X } from 'lucide-react';

interface ArchiveManagerProps {
  onLoadArchive: (archiveId: string) => void;
  onClose: () => void;
}

export default function ArchiveManager({ onLoadArchive, onClose }: ArchiveManagerProps) {
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
      const response = await fetch('/api/archive/list');

      if (!response.ok) {
        throw new Error('加载存档列表失败');
      }

      const data = await response.json();
      setArchives(data.archives || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(archiveId: string) {
    if (!confirm('确定要删除这个存档吗?此操作无法撤销。')) {
      return;
    }

    try {
      setDeletingId(archiveId);

      const response = await fetch(`/api/archive/delete?id=${archiveId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除存档失败');
      }

      // 重新加载列表
      await loadArchives();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border-2 border-[#00ff88] rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="border-b border-gray-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Archive className="w-6 h-6 text-[#00ff88]" />
            <h2 className="text-2xl font-bold text-[#00ff88] font-mono">世界存档</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#00ff88]" />
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded">
              错误: {error}
            </div>
          )}

          {!loading && !error && archives.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Archive className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">还没有存档</p>
              <p className="text-sm mt-2">生成规则后可以保存为存档</p>
            </div>
          )}

          {!loading && !error && archives.length > 0 && (
            <div className="space-y-4">
              {archives.map((archive) => (
                <div
                  key={archive.id}
                  className="border border-gray-800 bg-[#111111] rounded-lg p-4 hover:border-[#00ff88]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-bold text-[#00ff88]">{archive.name}</h3>

                      <p className="text-sm text-gray-400 line-clamp-2">
                        {archive.core_premise}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{archive.rules_count} 条规则</span>
                        <span>·</span>
                        <span>
                          创建于 {new Date(archive.created_at).toLocaleDateString('zh-CN')}
                        </span>
                        <span>·</span>
                        <span>
                          更新于 {new Date(archive.updated_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>

                      {/* 规则预览 */}
                      {archive.preview_rules.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {archive.preview_rules.map((rule, idx) => (
                            <p key={idx} className="text-xs text-gray-600 truncate">
                              • {rule}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onLoadArchive(archive.id)}
                        className="px-4 py-2 bg-[#00ff88] text-black font-bold rounded hover:bg-[#00cc6f] transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        加载
                      </button>

                      <button
                        onClick={() => handleDelete(archive.id)}
                        disabled={deletingId === archive.id}
                        className="px-4 py-2 bg-red-900/20 border border-red-700 text-red-400 rounded hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
