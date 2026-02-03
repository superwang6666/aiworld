import { Sparkles, Loader2, FlaskConical } from 'lucide-react';

interface PremiseInputProps {
  corePremise: string;
  premiseSuggestion: string | null;
  isValidating: boolean;
  error: string | null;
  onPremiseChange: (value: string) => void;
  onValidate: () => void;
  onAcceptSuggestion: () => void;
}

export default function PremiseInput({
  corePremise,
  premiseSuggestion,
  isValidating,
  error,
  onPremiseChange,
  onValidate,
  onAcceptSuggestion
}: PremiseInputProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 游戏分析建议（如果有） */}
      {premiseSuggestion && (
        <div className="border border-[#00ff88]/50 bg-[#00ff88]/10 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#00ff88] uppercase mb-2 font-mono">
                游戏分析建议
              </h3>
              <p className="text-[#e5e5e5] text-sm font-mono mb-3">
                {premiseSuggestion}
              </p>
              <button
                onClick={onAcceptSuggestion}
                className="text-xs px-3 py-1.5 bg-[#00ff88]/20 hover:bg-[#00ff88]/30 text-[#00ff88] rounded border border-[#00ff88]/50 transition-colors font-mono"
              >
                采纳此建议
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border border-gray-800 bg-[#111111] rounded-lg p-6">
        <label className="block text-sm font-bold text-[#00ff88] uppercase mb-2 font-mono">
          Core World Premise
        </label>
        <textarea
          value={corePremise}
          onChange={(e) => onPremiseChange(e.target.value)}
          placeholder="e.g., A world where lies increase physical gravity"
          className="w-full h-32 px-4 py-3 bg-black border border-gray-700 rounded focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/30 text-[#e5e5e5] font-mono resize-none"
        />
        <p className="mt-2 text-xs text-gray-500 font-mono">
          Describe the fundamental concept that makes your world unique. This should be a clear, specific deviation from reality.
        </p>
      </div>

      <button
        onClick={onValidate}
        disabled={isValidating || !corePremise.trim()}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#00ff88] text-black font-bold uppercase rounded hover:bg-[#00cc6f] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-mono"
      >
        {isValidating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Validating Core Premise...</span>
          </>
        ) : (
          <>
            <FlaskConical className="w-5 h-5" />
            <span>Validate Core Premise</span>
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
