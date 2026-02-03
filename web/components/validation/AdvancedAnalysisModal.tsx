'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { LawWeight, DEACAnalysis } from '@/types';
import LawWeightsPanel from './LawWeightsPanel';
import ExpertInsightsPanel from '../ExpertInsightsPanel';

interface AdvancedAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawWeights: LawWeight[];
  deacAnalysis: DEACAnalysis | null;
}

export default function AdvancedAnalysisModal({
  isOpen,
  onClose,
  lawWeights,
  deacAnalysis
}: AdvancedAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<'weights' | 'experts'>('weights');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* 模态框内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-16 bg-gradient-to-br from-[rgba(20,20,28,0.98)] to-[rgba(30,30,40,0.98)] rounded-2xl border border-[rgba(100,100,115,0.4)] backdrop-blur-xl z-50 overflow-hidden flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(100,100,115,0.3)]">
              <h2 className="text-2xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent">
                高级分析阶段
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg bg-[rgba(60,60,70,0.6)] hover:bg-[rgba(80,80,90,0.8)] border border-[rgba(100,100,110,0.3)] hover:border-[rgba(120,120,130,0.5)] transition-all duration-200 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-[#c1c5cc]" />
              </button>
            </div>

            {/* 标签页 */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-[rgba(100,100,115,0.3)]">
              <button
                onClick={() => setActiveTab('weights')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'weights'
                    ? 'bg-[rgba(57,255,20,0.15)] text-[#39ff14] border border-[rgba(57,255,20,0.3)]'
                    : 'bg-[rgba(60,60,70,0.4)] text-[#c1c5cc] border border-[rgba(100,100,110,0.2)] hover:bg-[rgba(70,70,80,0.6)]'
                }`}
              >
                法则权重分析
              </button>
              <button
                onClick={() => setActiveTab('experts')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'experts'
                    ? 'bg-[rgba(57,255,20,0.15)] text-[#39ff14] border border-[rgba(57,255,20,0.3)]'
                    : 'bg-[rgba(60,60,70,0.4)] text-[#c1c5cc] border border-[rgba(100,100,110,0.2)] hover:bg-[rgba(70,70,80,0.6)]'
                }`}
              >
                专家委员会洞察
              </button>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <AnimatePresence mode="wait">
                {activeTab === 'weights' ? (
                  <motion.div
                    key="weights"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LawWeightsPanel lawWeights={lawWeights} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="experts"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {deacAnalysis ? (
                      <div className="space-y-4">
                        <div className="mb-6">
                          <h3 className="text-2xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent mb-2">
                            专家委员会洞察
                          </h3>
                          <p className="text-[#7a7a88] text-sm">
                            {deacAnalysis.activated_experts.length} 位专家的分析和建议
                          </p>
                        </div>
                        <ExpertInsightsPanel analysis={deacAnalysis} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <p className="text-[#7a7a88] text-sm">
                          专家分析尚未完成，请稍候...
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
