import { Download, Archive } from 'lucide-react';

import type { WorldRule, RuleTag } from '@/types';

import RuleCard from '@/components/RuleCard';

interface RulesDisplayProps {
  rules: WorldRule[];
  tagWeights: Record<string, RuleTag>;
  archiveName: string;
  confirmedCount: number;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onArchiveNameChange: (name: string) => void;
  onSaveArchive: () => void;
  onShowArchiveManager: () => void;
  onExport: () => void;
  onReset: () => void;
}

export default function RulesDisplay({
  rules,
  tagWeights,
  archiveName,
  confirmedCount,
  onToggleRule,
  onDeleteRule,
  onArchiveNameChange,
  onSaveArchive,
  onShowArchiveManager,
  onExport,
  onReset
}: RulesDisplayProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-[#00ff88] font-mono uppercase">
            Generated Rules ({rules.length})
          </h2>
          <span className="text-sm text-gray-400 font-mono">
            Confirmed: {confirmedCount}/{rules.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onShowArchiveManager}
            className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-700 text-purple-300 rounded hover:bg-purple-900/50 transition-colors font-mono text-sm"
          >
            <Archive className="w-4 h-4" />
            Manage Archives
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors font-mono text-sm"
          >
            Start Over
          </button>
          <button
            onClick={onExport}
            disabled={confirmedCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] rounded hover:bg-[#00ff88]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono text-sm"
          >
            <Download className="w-4 h-4" />
            Export Confirmed ({confirmedCount})
          </button>
        </div>
      </div>

      {/* 存档保存区域 */}
      {rules.length > 0 && (
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-300 font-mono mb-4">Save World Archive</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={archiveName}
              onChange={(e) => onArchiveNameChange(e.target.value)}
              placeholder="Enter archive name..."
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={onSaveArchive}
              disabled={!archiveName.trim() || rules.length === 0}
              className="px-6 py-2 bg-purple-900/30 border border-purple-700 text-purple-300 rounded hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono"
            >
              Save Archive
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-mono">
            Archive will include all rules, tag weights, and preferences
          </p>
        </div>
      )}

      {rules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="border border-gray-800 bg-[#111111] rounded-lg p-8 text-center">
          <p className="text-gray-400 font-mono">No rules generated yet.</p>
          <button
            onClick={onReset}
            className="mt-4 px-6 py-2 bg-[#00ff88] text-black font-bold rounded hover:bg-[#00cc6f] transition-colors font-mono"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
