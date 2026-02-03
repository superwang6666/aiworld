'use client';

import { ChevronDown, Check, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ValidationActionsProps {
  onAccept: () => void;
  onReject: () => void;
  onAdvancedAnalysis: () => void;
}

export default function ValidationActions({
  onAccept,
  onReject,
  onAdvancedAnalysis
}: ValidationActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9 }}
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
    >
      {/* 跳转至高级分析阶段按钮 */}
      <button
        onClick={onAdvancedAnalysis}
        className="flex-1 h-[48px] rounded-xl px-8 bg-gradient-to-br from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] hover:from-[rgba(120,120,145,0.95)] hover:to-[rgba(100,100,125,0.95)] border border-[rgba(140,140,160,0.5)] hover:border-[rgba(160,160,180,0.7)] transition-all duration-300 flex items-center justify-center gap-3"
      >
        <ChevronDown className="w-5 h-5 text-[#e8e8ec]" />
        <span className="text-[#e8e8ec] font-bold text-[14px] sm:text-[15px]">
          跳转至高级分析阶段
        </span>
      </button>

      {/* 拒绝验证按钮 */}
      <button
        onClick={onReject}
        className="w-full sm:w-auto h-[48px] rounded-xl px-8 bg-gradient-to-br from-[rgba(220,60,60,0.8)] to-[rgba(180,40,40,0.8)] hover:from-[rgba(240,80,80,0.95)] hover:to-[rgba(200,60,60,0.95)] border border-[rgba(255,100,100,0.5)] hover:border-[rgba(255,120,120,0.7)] transition-all duration-300 flex items-center justify-center gap-2"
      >
        <X className="w-5 h-5 text-[#ebebf0]" />
        <span className="text-[#ebebf0] font-bold text-[14px] sm:text-[15px]">
          拒绝验证
        </span>
      </button>

      {/* 接受验证按钮 */}
      <button
        onClick={onAccept}
        className="w-full sm:w-auto h-[48px] rounded-xl px-8 bg-gradient-to-br from-[rgba(57,255,20,0.8)] to-[rgba(40,200,15,0.8)] hover:from-[rgba(57,255,20,0.95)] hover:to-[rgba(40,200,15,0.95)] border border-[rgba(57,255,20,0.5)] hover:border-[rgba(57,255,20,0.7)] transition-all duration-300 flex items-center justify-center gap-2"
        style={{
          boxShadow: '0 0 20px rgba(57, 255, 20, 0.3)',
        }}
      >
        <Check className="w-5 h-5 text-[#0f0f14]" />
        <span
          className="font-bold text-[14px] sm:text-[15px]"
          style={{
            color: '#0f0f14',
            textShadow: '0 0 10px rgba(57, 255, 20, 0.5)',
          }}
        >
          接受验证
        </span>
      </button>
    </motion.div>
  );
}
