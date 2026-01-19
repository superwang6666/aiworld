'use client';

import { useState } from 'react';
import { Sparkles, Download, Loader2, FlaskConical } from 'lucide-react';
import { WorldRule, ValidationResult, DEACAnalysis, LawWeight } from '@/types';
import RuleCard from '@/components/RuleCard';
import ValidationReport from '@/components/ValidationReport';
import GameAnalysisStep from '@/components/GameAnalysisStep';
import ExpertInsightsPanel from '@/components/ExpertInsightsPanel';

type WorkflowStep = 'gameAnalysis' | 'premise' | 'validation' | 'artStyle' | 'rules';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('gameAnalysis');
  const [corePremise, setCorePremise] = useState('');
  const [premiseSuggestion, setPremiseSuggestion] = useState<string | null>(null); // 游戏分析建议
  const [artStyle, setArtStyle] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [lawWeights, setLawWeights] = useState<LawWeight[]>([]); // 新增：法则权重
  const [generationMode, setGenerationMode] = useState<'fast' | 'deep'>('fast'); // 新增：生成模式
  const [rules, setRules] = useState<WorldRule[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // DEAC 专家系统状态
  const [deacAnalysis, setDeacAnalysis] = useState<DEACAnalysis | null>(null);
  const [deacLoading, setDeacLoading] = useState(false);

  const handleValidatePremise = async () => {
    if (!corePremise.trim()) {
      setError('Please provide a Core Premise');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/validate-premise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          corePremise: corePremise.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to validate premise');
      }

      const data = await response.json();
      setValidationResult(data);
      setLawWeights(data.lawWeights || []); // 保存法则权重
      setCurrentStep('validation');

      // 触发 DEAC 专家分析
      setDeacLoading(true);
      fetch('/api/deac/analyze-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heterogeneity_point: corePremise.trim(),
          validation_result: data,
        }),
      })
        .then(res => res.json())
        .then(gapData => {
          // 使用差距分析调度专家
          return fetch('/api/deac/dispatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              heterogeneity_point: corePremise.trim(),
              gap_analysis: gapData.gap_analysis,
              context: {
                core_premise: corePremise.trim(),
                validation_result: data,
                current_step: 'validation',
              },
              generate_special_experts: true,
            }),
          });
        })
        .then(res => res.json())
        .then(dispatchData => {
          // 综合专家响应（传递法则权重以使用加权算法）
          return fetch('/api/deac/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              expert_responses: dispatchData.expert_responses,
              heterogeneity_point: corePremise.trim(),
              law_weights: data.lawWeights, // 传递法则权重
            }),
          }).then(res => res.json()).then(synthesisData => ({
            ...dispatchData,
            synthesis: synthesisData.synthesis,
          }));
        })
        .then(fullAnalysis => {
          setDeacAnalysis({
            timestamp: new Date().toISOString(),
            heterogeneity_point: corePremise.trim(),
            gap_analysis: fullAnalysis.gap_analysis || {
              heterogeneity_point: corePremise.trim(),
              covered_laws: [],
              uncovered_laws: [],
              partial_coverage: [],
              special_expertise_needed: [],
              confidence_score: 0
            },
            activated_experts: fullAnalysis.activated_experts || [],
            expert_responses: fullAnalysis.expert_responses || [],
            synthesis: fullAnalysis.synthesis || {
              consensus: '',
              disagreements: [],
              emergent_insights: [],
              risk_assessment: ''
            },
            special_experts_generated: fullAnalysis.special_experts_generated || [],
          });
          setDeacLoading(false);
        })
        .catch(err => {
          console.error('DEAC 分析错误:', err);
          setDeacLoading(false);
        });
    } catch (err: any) {
      setError(err.message || 'An error occurred while validating premise');
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAcceptValidation = () => {
    setCurrentStep('artStyle');
  };

  const handleRejectValidation = () => {
    setValidationResult(null);
    setCurrentStep('premise');
  };

  const handleGenerate = async () => {
    if (!corePremise.trim() || !artStyle.trim()) {
      setError('Please provide both Core Premise and Art Style');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let expertResponses = undefined;

      // 深度模式：等待DEAC分析完成
      if (generationMode === 'deep') {
        if (!deacAnalysis || deacLoading) {
          // 如果DEAC还在加载，等待它完成
          setError('正在等待专家分析完成，请稍候...');
          // 轮询检查DEAC状态
          const maxWaitTime = 30000; // 最多等待30秒
          const startTime = Date.now();

          while (deacLoading && (Date.now() - startTime < maxWaitTime)) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          if (deacLoading) {
            throw new Error('专家分析超时，请切换到快速模式或稍后重试');
          }
        }

        if (deacAnalysis && deacAnalysis.expert_responses) {
          expertResponses = deacAnalysis.expert_responses;
          console.log(`🧠 使用 ${expertResponses.length} 个专家的洞察进行深度生成`);
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          corePremise: corePremise.trim(),
          artStyle: artStyle.trim(),
          lawWeights: lawWeights, // 传递法则权重
          mode: generationMode, // 传递生成模式
          expertResponses: expertResponses, // 深度模式传递专家响应
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate rules');
      }

      const data = await response.json();
      setRules(data.rules || []);
      setCurrentStep('rules');
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating rules');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleRule = (id: string) => {
    setRules((prevRules) =>
      prevRules.map((rule) =>
        rule.id === id ? { ...rule, confirmed: !rule.confirmed } : rule
      )
    );
  };

  const handleExport = () => {
    const confirmedRules = rules.filter((rule) => rule.confirmed);

    if (confirmedRules.length === 0) {
      alert('No rules confirmed. Please confirm at least one rule before exporting.');
      return;
    }

    // Export as Markdown
    const markdown = `# World Rules\n\n` +
      `**Core Premise:** ${corePremise}\n` +
      `**Art Style:** ${artStyle}\n\n` +
      `## Validation Summary\n\n` +
      `- **Uniqueness Score:** ${validationResult?.uniquenessScore}/100\n` +
      `- **Core Anomaly:** ${validationResult?.coreAnomalyIdentified}\n` +
      `- **Eraser Test Verdict:** ${validationResult?.eraserTest.verdict.toUpperCase()}\n\n` +
      `## Confirmed Rules (${confirmedRules.length})\n\n` +
      confirmedRules
        .map(
          (rule, index) =>
            `### ${index + 1}. ${rule.rule}\n\n` +
            `**Law:** ${rule.law}\n\n` +
            `**Expert Logic:** ${rule.expert_logic}\n\n` +
            `---\n\n`
        )
        .join('');

    // Export as JSON
    const json = JSON.stringify(
      {
        corePremise,
        artStyle,
        validation: validationResult,
        rules: confirmedRules.map(({ id, confirmed, ...rule }) => rule),
      },
      null,
      2
    );

    // Create download for both formats
    const markdownBlob = new Blob([markdown], { type: 'text/markdown' });
    const jsonBlob = new Blob([json], { type: 'application/json' });

    const markdownUrl = URL.createObjectURL(markdownBlob);
    const jsonUrl = URL.createObjectURL(jsonBlob);

    const markdownLink = document.createElement('a');
    markdownLink.href = markdownUrl;
    markdownLink.download = `world-rules-${Date.now()}.md`;
    markdownLink.click();

    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `world-rules-${Date.now()}.json`;
    jsonLink.click();

    URL.revokeObjectURL(markdownUrl);
    URL.revokeObjectURL(jsonUrl);
  };

  const handleResetWorkflow = () => {
    setCurrentStep('premise');
    setCorePremise('');
    setArtStyle('');
    setValidationResult(null);
    setRules([]);
    setError(null);
  };

  const confirmedCount = rules.filter((r) => r.confirmed).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5]">
      {/* Header */}
      <header className="border-b border-[#00ff88]/20 bg-[#0f0f0f]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse-glow"></div>
            <h1 className="text-2xl font-bold text-[#00ff88] font-mono">
              WORLD-BUILDING ENGINE
            </h1>
            <div className="flex-1"></div>
            <div className="text-xs text-gray-500 font-mono">
              v2.0.0
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-400 font-mono">
            Expert Council Analysis System | Seven Laws Framework
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                currentStep === 'gameAnalysis' ? 'bg-[#00ff88] text-black' :
                ['premise', 'validation', 'artStyle', 'rules'].includes(currentStep) ? 'bg-green-500/20 text-green-400 border border-green-500' :
                'bg-gray-700 text-gray-400'
              }`}>0</div>
              <span className="text-sm font-mono text-gray-400">Game Analysis</span>
            </div>
            <div className="flex-1 h-px bg-gray-800 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                currentStep === 'premise' ? 'bg-[#00ff88] text-black' :
                ['validation', 'artStyle', 'rules'].includes(currentStep) ? 'bg-green-500/20 text-green-400 border border-green-500' :
                'bg-gray-700 text-gray-400'
              }`}>1</div>
              <span className="text-sm font-mono text-gray-400">Core Premise</span>
            </div>
            <div className="flex-1 h-px bg-gray-800 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                currentStep === 'validation' ? 'bg-[#00ff88] text-black' :
                ['artStyle', 'rules'].includes(currentStep) ? 'bg-green-500/20 text-green-400 border border-green-500' :
                'bg-gray-700 text-gray-400'
              }`}>2</div>
              <span className="text-sm font-mono text-gray-400">Validation</span>
            </div>
            <div className="flex-1 h-px bg-gray-800 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                currentStep === 'artStyle' ? 'bg-[#00ff88] text-black' :
                currentStep === 'rules' ? 'bg-green-500/20 text-green-400 border border-green-500' :
                'bg-gray-700 text-gray-400'
              }`}>3</div>
              <span className="text-sm font-mono text-gray-400">Art Style</span>
            </div>
            <div className="flex-1 h-px bg-gray-800 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                currentStep === 'rules' ? 'bg-[#00ff88] text-black' : 'bg-gray-700 text-gray-400'
              }`}>4</div>
              <span className="text-sm font-mono text-gray-400">Rules</span>
            </div>
          </div>
        </div>

        {/* Step 0: Game Analysis */}
        {currentStep === 'gameAnalysis' && (
          <GameAnalysisStep
            onComplete={(summary) => {
              // 将总结存储为建议，而不是直接填入
              setPremiseSuggestion(summary);
              setCurrentStep('premise');
            }}
            onSkip={() => {
              setCurrentStep('premise');
            }}
          />
        )}

        {/* Step 1: Core Premise Input */}
        {currentStep === 'premise' && (
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
                      onClick={() => {
                        setCorePremise(premiseSuggestion);
                        setPremiseSuggestion(null);
                      }}
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
                onChange={(e) => setCorePremise(e.target.value)}
                placeholder="e.g., A world where lies increase physical gravity"
                className="w-full h-32 px-4 py-3 bg-black border border-gray-700 rounded focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/30 text-[#e5e5e5] font-mono resize-none"
              />
              <p className="mt-2 text-xs text-gray-500 font-mono">
                Describe the fundamental concept that makes your world unique. This should be a clear, specific deviation from reality.
              </p>
            </div>

            <button
              onClick={handleValidatePremise}
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
        )}

        {/* Step 2: Validation Results */}
        {currentStep === 'validation' && validationResult && (
          <>
            <ValidationReport
              result={validationResult}
              onAccept={handleAcceptValidation}
              onReject={handleRejectValidation}
            />

            {/* 法则权重显示 */}
            {lawWeights && lawWeights.length > 0 && (
              <div className="mb-6 border border-[#00ff88]/20 rounded-lg p-6 bg-[#0f0f0f]">
                <h3 className="text-lg font-mono font-bold text-[#00ff88] mb-4">
                  ⚖️ 法则权重分析
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  根据核心设定的影响，系统计算了7个法则的权重。权重越高的法则将生成更多规则。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {lawWeights.map((lw) => (
                    <div
                      key={lw.law}
                      className={`border rounded p-3 ${
                        lw.impactLevel === 'critical'
                          ? 'border-red-500/50 bg-red-500/5'
                          : lw.impactLevel === 'major'
                          ? 'border-yellow-500/50 bg-yellow-500/5'
                          : lw.impactLevel === 'minor'
                          ? 'border-blue-500/50 bg-blue-500/5'
                          : 'border-gray-600/50 bg-gray-600/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-sm">{lw.law}</span>
                        <span className="text-xs font-mono text-gray-400">
                          {(lw.weight * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${
                            lw.impactLevel === 'critical'
                              ? 'bg-red-500'
                              : lw.impactLevel === 'major'
                              ? 'bg-yellow-500'
                              : lw.impactLevel === 'minor'
                              ? 'bg-blue-500'
                              : 'bg-gray-500'
                          }`}
                          style={{ width: `${lw.weight * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {lw.rulesCount} 条规则
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ExpertInsightsPanel
              analysis={deacAnalysis}
              isLoading={deacLoading}
            />
          </>
        )}

        {/* Step 3: Art Style Input */}
        {currentStep === 'artStyle' && (
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
                onChange={(e) => setArtStyle(e.target.value)}
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
                    onChange={(e) => setGenerationMode(e.target.value as 'fast' | 'deep')}
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
                    onChange={(e) => setGenerationMode(e.target.value as 'fast' | 'deep')}
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
              onClick={handleGenerate}
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
        )}

        {/* Step 4: Generated Rules */}
        {currentStep === 'rules' && rules.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono uppercase">
                  Generated Rules ({rules.length})
                </h2>
                <span className="text-sm text-gray-400 font-mono">
                  Confirmed: {confirmedCount}/{rules.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetWorkflow}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors font-mono text-sm"
                >
                  Start Over
                </button>
                <button
                  onClick={handleExport}
                  disabled={confirmedCount === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] rounded hover:bg-[#00ff88]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export Confirmed ({confirmedCount})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={handleToggleRule}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-xs text-gray-600 font-mono">
          World-Building Engine v2.0 | Core Anomaly Validation System | Seven Laws Framework
        </div>
      </footer>
    </div>
  );
}
