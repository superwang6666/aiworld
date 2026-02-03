'use client';

import { useState } from 'react';

import { Star } from 'lucide-react';
import { motion } from 'motion/react';

import type { LawImpact } from '@/types';

import { LAW_NAME_MAP, LAW_COLORS } from '@/config/law-names';

import ValidationDirectionEvaluation from './ValidationDirectionEvaluation';

interface ValidationDominoEffectProps {
  lawImpacts: LawImpact[];
  onEvaluateDirections?: () => void;
  isEvaluating?: boolean;
  hasEvaluated?: boolean;
}

export default function ValidationDominoEffect({
  lawImpacts,
  onEvaluateDirections,
  isEvaluating = false,
  hasEvaluated = false
}: ValidationDominoEffectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showOnlyQualified, setShowOnlyQualified] = useState(false);

  // 过滤显示的法则影响
  const displayedImpacts = showOnlyQualified
    ? lawImpacts.filter(impact => impact.uniquenessScore && impact.uniquenessScore >= 60)
    : lawImpacts;

  // 统计合格的方向数量
  const qualifiedCount = lawImpacts.filter(impact => impact.uniquenessScore && impact.uniquenessScore >= 60).length;

  // 判断是否有评估分数
  const hasScores = lawImpacts.some(impact => impact.uniquenessScore !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mb-8 sm:mb-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-1 h-8 rounded-full"
          style={{
            background: 'linear-gradient(180deg, #39ff14 0%, rgba(57, 255, 20, 0.3) 100%)',
            boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)',
          }}
        />
        <h2 className="text-2xl sm:text-3xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent">
          多米诺效应分析
        </h2>
      </div>

      {/* 方向唯一性评估按钮 */}
      {onEvaluateDirections && !hasEvaluated && (
        <ValidationDirectionEvaluation
          onEvaluate={onEvaluateDirections}
          isEvaluating={isEvaluating}
        />
      )}

      {/* 过滤器 - 只在有评估分数时显示 */}
      {hasScores && (
        <div className="mb-6 bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl border border-[rgba(100,100,115,0.4)] backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyQualified}
                onChange={(e) => setShowOnlyQualified(e.target.checked)}
                className="w-4 h-4 rounded border-[rgba(100,100,115,0.4)] bg-[rgba(25,25,35,0.6)] text-[#39ff14] focus:ring-[#39ff14]/30"
              />
              <span className="text-[#c1c5cc] text-sm font-medium">
                只显示合格方向（评分 ≥ 60）
              </span>
            </label>
            <div className="text-sm text-[#7a7a88]">
              合格: <span className="text-[#39ff14] font-bold">{qualifiedCount}</span> / {lawImpacts.length}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedImpacts.map((item, index) => {
          const color = LAW_COLORS[item.law] || LAW_COLORS.Space;
          const lawName = LAW_NAME_MAP[item.law] || item.law;
          const isHovered = hoveredIndex === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.5 + index * 0.1,
              }}
              className={`bg-gradient-to-br from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl backdrop-blur-sm p-6 transition-all duration-300 relative overflow-hidden group ${
                item.uniquenessScore !== undefined && item.uniquenessScore < 60 ? 'opacity-50' : ''
              }`}
              style={{
                border: `1px solid ${isHovered ? color.hoverBorder : color.border}`,
                boxShadow: isHovered ? color.glow : 'none'
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* 左侧装饰条 */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                style={{ background: color.accent }}
              />

              {/* 标题和分数 */}
              <div className="flex items-center justify-between mb-3 ml-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: color.accent,
                      boxShadow: `0 0 8px ${color.accent}`,
                    }}
                  />
                  <h3 className="text-[#ebebf0] text-lg font-bold">
                    {lawName}
                  </h3>
                </div>

                {/* 评估分数 */}
                {item.uniquenessScore !== undefined && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                      item.uniquenessScore >= 80
                        ? 'bg-green-500/20 text-green-400'
                        : item.uniquenessScore >= 60
                        ? 'bg-blue-500/20 text-blue-400'
                        : item.uniquenessScore >= 40
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    {item.uniquenessScore}
                  </div>
                )}
              </div>

              {/* 影响描述 */}
              <p className="text-[#c1c5cc] text-sm leading-relaxed mb-3 ml-3">
                {item.impact}
              </p>

              {/* 示例 */}
              {item.example && (
                <div className="bg-[rgba(25,25,35,0.6)] rounded-lg px-3 py-2 border border-[rgba(80,80,95,0.3)] ml-3">
                  <p className="text-[#7a7a88] text-xs leading-relaxed">
                    {item.example}
                  </p>
                </div>
              )}

              {/* 通过的标准 */}
              {item.passedCriteria && item.passedCriteria.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[rgba(80,80,95,0.3)] ml-3">
                  <div className="text-xs text-[#7a7a88] mb-2">通过的标准:</div>
                  <ul className="space-y-1">
                    {item.passedCriteria.map((criteria, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#c1c5cc]">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
