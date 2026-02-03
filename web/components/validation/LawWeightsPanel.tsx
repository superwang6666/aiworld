'use client';

import { useState } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';

import type { LawWeight } from '@/types';

import { LAW_NAME_MAP, LAW_SIMPLE_COLORS } from '@/config/law-names';

interface LawWeightsPanelProps {
  lawWeights: LawWeight[];
}

// 影响等级标签配置
const impactLevelConfig: Record<string, { label: string; color: string }> = {
  critical: { label: '关键', color: 'rgba(255, 60, 60, 0.9)' },
  major: { label: '重要', color: 'rgba(255, 160, 100, 0.9)' },
  minor: { label: '次要', color: 'rgba(100, 200, 200, 0.9)' },
  negligible: { label: '微小', color: 'rgba(120, 120, 140, 0.9)' },
};

export default function LawWeightsPanel({ lawWeights }: LawWeightsPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-2xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent mb-2">
          法则权重分析
        </h3>
        <p className="text-[#7a7a88] text-sm">
          基于验证结果计算的7个法则权重分布
        </p>
      </div>

      <div className="space-y-3">
        {lawWeights.map((lawWeight, index) => {
          const lawName = LAW_NAME_MAP[lawWeight.law] || lawWeight.law;
          const color = LAW_SIMPLE_COLORS[lawWeight.law] || LAW_SIMPLE_COLORS.Space;
          const impactConfig = impactLevelConfig[lawWeight.impactLevel];
          const weightPercentage = Math.round(lawWeight.weight * 100);
          const isExpanded = expandedIndex === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-gradient-to-br from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-xl border border-[rgba(100,100,115,0.4)] backdrop-blur-sm p-4"
            >
              {/* 法则名称和权重 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: color,
                      boxShadow: `0 0 8px ${color}`,
                    }}
                  />
                  <h4 className="text-[#ebebf0] text-lg font-bold">
                    {lawName}
                  </h4>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-md"
                    style={{
                      background: `${impactConfig.color}20`,
                      color: impactConfig.color,
                      border: `1px solid ${impactConfig.color}40`,
                    }}
                  >
                    {impactConfig.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent">
                    {weightPercentage}%
                  </span>
                  <span className="text-[#7a7a88] text-sm">
                    {lawWeight.rulesCount} 规则
                  </span>
                </div>
              </div>

              {/* 权重条形图 */}
              <div className="relative h-3 bg-[rgba(25,25,35,0.6)] rounded-full overflow-hidden mb-3">
                <motion.div
                  className="absolute left-0 top-0 bottom-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                    boxShadow: `0 0 10px ${color}80`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${weightPercentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                />
              </div>

              {/* 权重计算原因（可折叠） */}
              {lawWeight.reasoning && (
                <>
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="w-full flex items-center justify-between text-left text-[#c1c5cc] text-sm hover:text-[#ebebf0] transition-colors"
                  >
                    <span>权重计算原因</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 bg-[rgba(25,25,35,0.6)] rounded-lg px-3 py-2 border border-[rgba(80,80,95,0.3)]"
                    >
                      <p className="text-[#7a7a88] text-xs leading-relaxed">
                        {lawWeight.reasoning}
                      </p>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
