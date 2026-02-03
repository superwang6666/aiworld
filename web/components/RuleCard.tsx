'use client';

import { WorldRule, Law, RuleTag } from '@/types';
import { Check, X, Trash2, AlertTriangle, Sparkles } from 'lucide-react';
import { getPredefinedTagById } from '@/config/predefined-tags';
import { LAW_NAME_MAP } from '@/config/law-names';

interface RuleCardProps {
  rule: WorldRule;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void; // 新增: 删除回调
  tagWeights?: Record<string, RuleTag>; // 新增: 标签权重映射
  showPrediction?: boolean; // 新增: 是否显示预测警告
}

const lawColors: Record<Law, string> = {
  Space: 'bg-blue-900/30 border-blue-700 text-blue-300',
  Survival: 'bg-green-900/30 border-green-700 text-green-300',
  Cognition: 'bg-purple-900/30 border-purple-700 text-purple-300',
  Scarcity: 'bg-yellow-900/30 border-yellow-700 text-yellow-300',
  Time: 'bg-red-900/30 border-red-700 text-red-300',
  Power: 'bg-orange-900/30 border-orange-700 text-orange-300',
  Metaphysics: 'bg-indigo-900/30 border-indigo-700 text-indigo-300',
};

export default function RuleCard({
  rule,
  onToggle,
  onDelete,
  tagWeights,
  showPrediction = true,
}: RuleCardProps) {
  const lawColorClass = lawColors[rule.law];

  // 计算风险等级
  const deletionScore = rule.deletion_score || 0;
  const isWarning = showPrediction && deletionScore >= 0.6;
  const isDanger = showPrediction && deletionScore >= 0.75;

  // 获取标签信息
  const tags = rule.tags || [];
  const tagObjects = tags
    .map((tagId) => {
      // 先从预定义标签查找
      const predefined = getPredefinedTagById(tagId);
      if (predefined) return predefined;
      // 再从权重映射查找 (可能是LLM生成的标签)
      return tagWeights?.[tagId];
    })
    .filter(Boolean) as RuleTag[];

  return (
    <div
      className={`
        relative border-2 rounded-lg p-4 transition-all duration-200
        ${lawColorClass}
        ${rule.confirmed ? 'opacity-100 ring-2 ring-cyan-400' : 'opacity-70 hover:opacity-100'}
        ${isDanger ? 'ring-2 ring-red-500/50' : isWarning ? 'ring-1 ring-yellow-500/50' : ''}
        ${rule.isNew ? 'ring-2 ring-[#00ff88]/50 animate-pulse-glow' : ''}
      `}
    >
      {/* NEW 标识 */}
      {rule.isNew && (
        <div className="absolute -top-2 -left-2 bg-[#00ff88] text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <Sparkles className="w-3 h-3" />
          NEW
        </div>
      )}

      {/* 预测警告标识 */}
      {isDanger && !rule.isNew && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          高风险
        </div>
      )}
      {isWarning && !isDanger && !rule.isNew && (
        <div className="absolute -top-2 -right-2 bg-yellow-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          预测
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* 法则 + 标签 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 text-xs font-bold uppercase border rounded bg-black/20">
              {LAW_NAME_MAP[rule.law]}
            </span>

            {/* 标签列表 */}
            {tagObjects.slice(0, 5).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 text-xs rounded bg-purple-900/30 border border-purple-700 text-purple-300"
                title={`权重: ${(tag.weight * 100).toFixed(0)}%`}
              >
                {tag.name}
              </span>
            ))}

            {tags.length > 5 && (
              <span className="px-2 py-0.5 text-xs text-gray-500">+{tags.length - 5}</span>
            )}
          </div>

          {/* 规则文本 */}
          <p className="text-sm font-medium leading-relaxed">{rule.rule}</p>

          {/* 专家逻辑 */}
          <div className="text-xs text-gray-400 italic border-l-2 border-gray-700 pl-3">
            <span className="font-semibold text-gray-500">Expert Logic: </span>
            {rule.expert_logic}
          </div>

          {/* 预测评分 (仅在警告时显示) */}
          {showPrediction && deletionScore >= 0.6 && (
            <div className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-700 rounded px-2 py-1">
              根据您的偏好,这条规则可能不符合您的审美 (评分: {(deletionScore * 100).toFixed(0)}
              %)
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-2">
          {/* 确认按钮 */}
          <button
            onClick={() => onToggle(rule.id)}
            className={`
              flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${
                rule.confirmed
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30'
                  : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-gray-700/50 hover:border-gray-500'
              }
            `}
            aria-label={rule.confirmed ? 'Unconfirm rule' : 'Confirm rule'}
            title={rule.confirmed ? '取消确认' : '确认规则'}
          >
            {rule.confirmed ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>

          {/* 删除按钮/已删除标识 */}
          {onDelete && (
            <button
              onClick={() => !rule.rejected && onDelete(rule.id)}
              disabled={rule.rejected}
              className={`flex-shrink-0 w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                rule.rejected
                  ? 'border-gray-700 bg-gray-900/50 text-gray-600 cursor-not-allowed'
                  : 'border-red-700 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:border-red-600'
              }`}
              aria-label={rule.rejected ? 'Rule deleted' : 'Delete rule'}
              title={rule.rejected ? '已删除' : '删除规则 (将降低相关标签权重)'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
