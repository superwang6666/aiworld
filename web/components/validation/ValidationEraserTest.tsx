'use client';

import { FlaskConical } from 'lucide-react';
import { motion } from 'motion/react';

import type { EraserTest } from '@/types';

interface ValidationEraserTestProps {
  eraserTest: EraserTest;
}

export default function ValidationEraserTest({ eraserTest }: ValidationEraserTestProps) {
  const isStructural = eraserTest.verdict === 'structural';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
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
          橡皮擦测试
        </h2>
      </div>

      <div className="bg-gradient-to-br from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl border border-[rgba(100,100,115,0.4)] backdrop-blur-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <FlaskConical
            className="w-6 h-6 text-[#39ff14] flex-shrink-0"
            style={{ filter: 'drop-shadow(0 0 8px rgba(57, 255, 20, 0.6))' }}
          />
          <div className="flex-1">
            <h3 className="text-[#ebebf0] text-xl leading-snug font-semibold mb-1">
              The Eraser Test
            </h3>
            <p className="text-[#7a7a88] text-xs leading-normal">
              测试核心前提是结构性还是装饰性
            </p>
          </div>
        </div>

        {/* 原始场景 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-[rgba(100,150,255,0.6)]" />
            <h4 className="text-[#e8e8ec] text-sm font-semibold">原始场景</h4>
          </div>
          <div className="bg-[rgba(25,25,35,0.6)] rounded-lg px-4 py-3 border border-[rgba(80,80,95,0.3)]">
            <p className="text-[#c1c5cc] text-sm leading-relaxed">
              {eraserTest.originalScenario}
            </p>
          </div>
        </div>

        {/* 替换场景 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-[rgba(255,160,100,0.6)]" />
            <h4 className="text-[#e8e8ec] text-sm font-semibold">替换场景</h4>
          </div>
          <div className="bg-[rgba(25,25,35,0.6)] rounded-lg px-4 py-3 border border-[rgba(80,80,95,0.3)]">
            <p className="text-[#c1c5cc] text-sm leading-relaxed">
              {eraserTest.replacementScenario}
            </p>
          </div>
        </div>

        {/* 分析 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-[rgba(180,120,255,0.6)]" />
            <h4 className="text-[#e8e8ec] text-sm font-semibold">分析</h4>
          </div>
          <div className="bg-[rgba(25,25,35,0.6)] rounded-lg px-4 py-3 border border-[rgba(80,80,95,0.3)]">
            <p className="text-[#c1c5cc] text-sm leading-relaxed">
              {eraserTest.analysis}
            </p>
          </div>
        </div>

        {/* 判决 */}
        <div className="flex items-center justify-center pt-4 border-t border-[rgba(100,100,115,0.3)]">
          <div
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl border ${
              isStructural
                ? 'bg-[rgba(57,255,20,0.1)] border-[rgba(57,255,20,0.3)]'
                : 'bg-[rgba(255,160,100,0.1)] border-[rgba(255,160,100,0.3)]'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: isStructural ? '#39ff14' : 'rgba(255,160,100,0.9)',
                boxShadow: isStructural
                  ? '0 0 10px rgba(57, 255, 20, 0.8)'
                  : '0 0 10px rgba(255,160,100,0.6)',
              }}
            />
            <span
              className="text-lg font-bold"
              style={{
                color: isStructural ? '#39ff14' : 'rgba(255,160,100,0.9)',
                textShadow: isStructural
                  ? '0 0 10px rgba(57, 255, 20, 0.5)'
                  : '0 0 10px rgba(255,160,100,0.4)',
              }}
            >
              {isStructural ? 'STRUCTURAL' : 'DECORATIVE'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
