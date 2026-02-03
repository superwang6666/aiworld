import { Sparkles, Loader2 } from 'lucide-react';

import type { ValidationResult, DEACAnalysis } from '@/types';

interface ArtStyleInputProps {
  artStyle: string;
  generationMode: 'fast' | 'deep';
  validationResult: ValidationResult | null;
  deacLoading: boolean;
  deacAnalysis: DEACAnalysis | null;
  isGenerating: boolean;
  error: string | null;
  onArtStyleChange: (value: string) => void;
  onGenerationModeChange: (mode: 'fast' | 'deep') => void;
  onGenerate: () => void;
}

export default function ArtStyleInput({
  artStyle,
  generationMode,
  validationResult,
  deacLoading,
  deacAnalysis,
  isGenerating,
  error,
  onArtStyleChange,
  onGenerationModeChange,
  onGenerate
}: ArtStyleInputProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border border-green-700/50 bg-green-900/10 rounded-lg p-4 mb-4">
        <p className="text-sm text-green-300 font-mono">
          ✓ Core Premise validated (Score: {validationResult?.uniquenessScore}/100)
        </p>
      </div>

      <div className="border border-gray-800 bg-[#111111] rounded-lg p-6">
        <label className="block text-sm font-bold text-[#00ff88] uppercase mb-2 font-mono">
          Visual Art Style Reference
        </label>
        <textarea
          value={artStyle}
          onChange={(e) => onArtStyleChange(e.target.value)}
          placeholder="e.g., Cyberpunk, Cloisonné/Enamel style, Steampunk"
          className="w-full h-32 px-4 py-3 bg-black border border-gray-700 rounded focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/30 text-[#e5e5e5] font-mono resize-none"
        />
        <p className="mt-2 text-xs text-gray-500 font-mono">
          Describe the visual aesthetic that will inform how concrete rules manifest in your world.
        </p>
      </div>

      {/* 生成模式选择 */}
      <div className="border border-gray-800 bg-[#111111] rounded-lg p-6">
        <label className="block text-sm font-bold text-[#00ff88] uppercase mb-3 font-mono">
          Generation Mode
        </label>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="radio"
              name="generationMode"
              value="fast"
              checked={generationMode === 'fast'}
              onChange={(e) => onGenerationModeChange(e.target.value as 'fast' | 'deep')}
              className="mt-1 w-4 h-4 text-[#00ff88] border-gray-700 focus:ring-[#00ff88]/30"
            />
            <div className="flex-1">
              <div className="text-sm font-mono text-[#e5e5e5] group-hover:text-[#00ff88] transition-colors">
                <span className="font-bold">快速模式</span> (推荐)
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                立即生成规则，基于法则权重。DEAC专家分析在后台异步运行，可稍后查看。
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="radio"
              name="generationMode"
              value="deep"
              checked={generationMode === 'deep'}
              onChange={(e) => onGenerationModeChange(e.target.value as 'fast' | 'deep')}
              className="mt-1 w-4 h-4 text-[#00ff88] border-gray-700 focus:ring-[#00ff88]/30"
            />
            <div className="flex-1">
              <div className="text-sm font-mono text-[#e5e5e5] group-hover:text-[#00ff88] transition-colors">
                <span className="font-bold">深度模式</span>
                <span className="ml-2 text-xs">
                  {deacLoading ? (
                    <span className="text-yellow-400">(专家分析中...)</span>
                  ) : deacAnalysis && deacAnalysis.expert_responses ? (
                    <span className="text-green-400">✓ {deacAnalysis.expert_responses.length} 个专家就绪</span>
                  ) : null}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                等待DEAC专家分析完成后，整合专家洞察生成规则。耗时10-15秒，规则更具深度和一致性。
              </p>
            </div>
          </label>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating || !artStyle.trim() || (generationMode === 'deep' && deacLoading)}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#00ff88] text-black font-bold uppercase rounded hover:bg-[#00cc6f] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-mono"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{generationMode === 'deep' ? 'DEEP GENERATION IN PROGRESS...' : 'GENERATING RULES...'}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>GENERATE WORLD RULES {generationMode === 'deep' && '(DEEP MODE)'}</span>
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded font-mono text-sm">
          ERROR: {error}
        </div>
      )}
    </div>
  );
}
