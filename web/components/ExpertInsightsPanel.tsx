'use client';

import { useState } from 'react';

import { Brain, Sparkles, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

import type { DEACAnalysis } from '@/types';

interface ExpertInsightsPanelProps {
  analysis: DEACAnalysis | null;
  isLoading?: boolean;
}

export default function ExpertInsightsPanel({ analysis, isLoading }: ExpertInsightsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="border border-blue-500/30 bg-blue-900/10 rounded-lg p-4 mt-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Brain className="w-5 h-5 animate-pulse" />
          <span className="font-mono text-sm">专家委员会正在分析中...</span>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="border border-purple-500/30 bg-purple-900/10 rounded-lg p-4 mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between hover:bg-purple-900/20 rounded p-2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="font-mono text-sm text-purple-300">
            专家委员会洞察 ({analysis.activated_experts.length} 位专家)
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* 专家响应列表 */}
          <div className="space-y-3">
            {analysis.expert_responses.map((response, idx) => (
              <div key={idx} className="border-l-2 border-purple-500/50 pl-3 py-2">
                <div className="flex items-start justify-between">
                  <div className="text-xs font-bold text-purple-300 font-mono">
                    {response.expert_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {response.domain}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 line-clamp-3">
                  {response.analysis}
                </p>

                {/* 警告 */}
                {response.warnings && response.warnings.length > 0 && (
                  <div className="mt-2 flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-yellow-300">
                      {response.warnings[0]}
                    </span>
                  </div>
                )}

                {/* 建议 */}
                {response.suggestions && response.suggestions.length > 0 && (
                  <div className="mt-1 text-xs text-green-400">
                    💡 {response.suggestions[0]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 综合洞察 */}
          {analysis.synthesis && (
            <div className="border-t border-purple-500/30 pt-3 mt-3">
              <div className="text-xs font-bold text-purple-200 mb-2">综合分析</div>

              {/* 共识 */}
              {analysis.synthesis.consensus && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">专家共识:</div>
                  <p className="text-xs text-gray-300">{analysis.synthesis.consensus}</p>
                </div>
              )}

              {/* 涌现洞察 */}
              {analysis.synthesis.emergent_insights && analysis.synthesis.emergent_insights.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">涌现洞察:</div>
                  <ul className="text-xs text-blue-300 space-y-1">
                    {analysis.synthesis.emergent_insights.map((insight, idx) => (
                      <li key={idx}>• {insight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 风险评估 */}
              {analysis.synthesis.risk_assessment && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">风险评估:</div>
                  <p className="text-xs text-orange-300">{analysis.synthesis.risk_assessment}</p>
                </div>
              )}
            </div>
          )}

          {/* 特殊专家生成提示 */}
          {analysis.special_experts_generated && analysis.special_experts_generated.length > 0 && (
            <div className="border-t border-purple-500/30 pt-3 mt-3">
              <div className="text-xs text-cyan-400">
                ✨ 为此异质点生成了 {analysis.special_experts_generated.length} 位特殊专家:
                {analysis.special_experts_generated.map((expert, idx) => (
                  <span key={idx} className="ml-2 text-cyan-300">
                    {expert.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
