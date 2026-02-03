'use client';

import { ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

interface ValidationDirectionEvaluationProps {
  onEvaluate: () => void;
  isEvaluating?: boolean;
}

export default function ValidationDirectionEvaluation({
  onEvaluate,
  isEvaluating = false
}: ValidationDirectionEvaluationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.45 }}
      className="mb-6 bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl border border-[rgba(100,100,115,0.4)] backdrop-blur-sm p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* 左侧文字内容 */}
        <div className="flex-1">
          <h3 className="text-[#ebebf0] text-lg sm:text-xl font-bold mb-2">
            方向唯一性评估
          </h3>
          <p className="text-[#c1c5cc] text-sm sm:text-base leading-relaxed">
            分析世界设定中的叙事方向限制，评估故事发展的自由度与创作空间的开放程度。
          </p>
        </div>

        {/* 右侧按钮 */}
        <button
          onClick={onEvaluate}
          disabled={isEvaluating}
          className="w-full sm:w-auto h-[48px] rounded-xl px-6 bg-gradient-to-br from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] hover:from-[rgba(120,120,145,0.95)] hover:to-[rgba(100,100,125,0.95)] border border-[rgba(140,140,160,0.5)] hover:border-[rgba(160,160,180,0.7)] transition-all duration-300 flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-[#e8e8ec] font-bold text-[14px]">
            {isEvaluating ? '评估中...' : '评估方向'}
          </span>
          <ChevronDown className="w-4 h-4 text-[#e8e8ec] transform -rotate-90" />
        </button>
      </div>
    </motion.div>
  );
}
