'use client';

import { useState } from 'react';
import { ValidationResult, LawImpact } from '@/types';
import { CheckCircle2, XCircle, AlertTriangle, Lightbulb, Zap, FlaskConical, Loader2, Star } from 'lucide-react';

interface ValidationReportProps {
  result: ValidationResult;
  onAccept: () => void;
  onReject: () => void;
}

export default function ValidationReport({ result, onAccept, onReject }: ValidationReportProps) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluatedImpacts, setEvaluatedImpacts] = useState<LawImpact[]>(result.lawImpacts);
  const [showOnlyQualified, setShowOnlyQualified] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 86) return 'text-green-400';
    if (score >= 61) return 'text-blue-400';
    if (score >= 31) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 86) return 'REVOLUTIONARY';
    if (score >= 61) return 'HIGHLY UNIQUE';
    if (score >= 31) return 'INTERESTING';
    return 'GENERIC';
  };

  const lawColors: Record<string, string> = {
    Space: 'border-purple-500/50 bg-purple-500/10',
    Survival: 'border-green-500/50 bg-green-500/10',
    Cognition: 'border-blue-500/50 bg-blue-500/10',
    Scarcity: 'border-yellow-500/50 bg-yellow-500/10',
    Time: 'border-orange-500/50 bg-orange-500/10',
    Power: 'border-red-500/50 bg-red-500/10',
    Metaphysics: 'border-pink-500/50 bg-pink-500/10',
  };

  const handleEvaluateDirections = async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch('/api/evaluate-directions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lawImpacts: result.lawImpacts,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate directions');
      }

      const data = await response.json();
      setEvaluatedImpacts(data.evaluatedImpacts);
      setHasEvaluated(true);
    } catch (error) {
      console.error('Error evaluating directions:', error);
      alert('Failed to evaluate directions. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const displayedImpacts = showOnlyQualified
    ? evaluatedImpacts.filter(impact => impact.uniquenessScore && impact.uniquenessScore >= 60)
    : evaluatedImpacts;

  const qualifiedCount = evaluatedImpacts.filter(impact => impact.uniquenessScore && impact.uniquenessScore >= 60).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Status */}
      <div className="border border-[#00ff88]/30 bg-[#111111] rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {result.isUnique ? (
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-[#00ff88] font-mono">
                  VALIDATION COMPLETE
                </h2>
                <p className="text-sm text-gray-400 font-mono mt-1">
                  Core Anomaly Verification Protocol
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-4">
              <div className="text-sm text-gray-400 font-mono">UNIQUENESS SCORE:</div>
              <div className={`text-4xl font-bold font-mono ${getScoreColor(result.uniquenessScore)}`}>
                {result.uniquenessScore}/100
              </div>
              <div className={`text-lg font-mono ${getScoreColor(result.uniquenessScore)}`}>
                [{getScoreLabel(result.uniquenessScore)}]
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Anomaly */}
      <div className="border border-gray-800 bg-[#111111] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-[#00ff88]" />
          <h3 className="text-lg font-bold text-[#00ff88] font-mono uppercase">
            Core Anomaly Identified
          </h3>
        </div>
        <p className="text-gray-300 font-mono text-sm leading-relaxed">
          {result.coreAnomalyIdentified}
        </p>
      </div>

      {/* Law Impacts (Domino Effect) */}
      <div className="border border-gray-800 bg-[#111111] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-5 h-5 text-[#00ff88]" />
          <h3 className="text-lg font-bold text-[#00ff88] font-mono uppercase">
            Domino Effect Analysis
          </h3>
        </div>
        <p className="text-xs text-gray-500 font-mono mb-4">
          How this premise cascades through all 7 Laws:
        </p>

        {/* Auto Evaluation Trigger */}
        {!hasEvaluated && (
          <div className="mb-6 p-4 border border-cyan-700/50 bg-cyan-900/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-cyan-400 font-mono mb-1">
                  Direction Uniqueness Evaluation
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  Click to evaluate each direction against predefined criteria (configured in evaluation-rules.ts)
                </p>
              </div>
              <button
                onClick={handleEvaluateDirections}
                disabled={isEvaluating}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 rounded hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono text-sm whitespace-nowrap"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    <span>Evaluate Directions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Filter Toggle */}
        {evaluatedImpacts.some(impact => impact.uniquenessScore !== undefined) && (
          <div className="mb-4 flex items-center justify-between p-3 bg-black/30 rounded border border-gray-700">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyQualified}
                  onChange={(e) => setShowOnlyQualified(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500/30"
                />
                <span className="text-sm font-mono text-gray-300">Show only qualified directions (score ≥ 60)</span>
              </label>
            </div>
            <div className="text-sm font-mono text-gray-400">
              Qualified: <span className="text-cyan-400 font-bold">{qualifiedCount}</span> / {evaluatedImpacts.length}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedImpacts.map((lawImpact, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${lawColors[lawImpact.law] || 'border-gray-700 bg-gray-800/30'} ${
                lawImpact.uniquenessScore !== undefined && lawImpact.uniquenessScore < 60
                  ? 'opacity-50'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-bold text-sm font-mono">
                  {lawImpact.law.toUpperCase()}
                </div>
                {lawImpact.uniquenessScore !== undefined && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold font-mono ${
                    lawImpact.uniquenessScore >= 80 ? 'bg-green-500/20 text-green-400' :
                    lawImpact.uniquenessScore >= 60 ? 'bg-blue-500/20 text-blue-400' :
                    lawImpact.uniquenessScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    <Star className="w-3 h-3" />
                    {lawImpact.uniquenessScore}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-300 font-mono mb-2">
                {lawImpact.impact}
              </p>
              <p className="text-xs text-gray-400 font-mono italic mb-2">
                → {lawImpact.example}
              </p>
              {lawImpact.passedCriteria && lawImpact.passedCriteria.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <div className="text-xs text-gray-500 font-mono mb-1">Passed Criteria:</div>
                  <ul className="text-xs text-gray-400 font-mono space-y-1">
                    {lawImpact.passedCriteria.map((criteria, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-green-400">✓</span>
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Eraser Test */}
      <div className="border border-gray-800 bg-[#111111] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-5 h-5 text-[#00ff88]" />
          <h3 className="text-lg font-bold text-[#00ff88] font-mono uppercase">
            The Eraser Test
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500 font-mono mb-2 uppercase">
              Scenario in Your World:
            </div>
            <p className="text-sm text-gray-300 font-mono leading-relaxed bg-black/50 p-3 rounded border border-gray-700">
              {result.eraserTest.originalScenario}
            </p>
          </div>

          <div>
            <div className="text-xs text-gray-500 font-mono mb-2 uppercase">
              Same Scenario in Mundane World:
            </div>
            <p className="text-sm text-gray-300 font-mono leading-relaxed bg-black/50 p-3 rounded border border-gray-700">
              {result.eraserTest.replacementScenario}
            </p>
          </div>

          <div>
            <div className="text-xs text-gray-500 font-mono mb-2 uppercase">
              Analysis:
            </div>
            <p className="text-sm text-gray-300 font-mono leading-relaxed">
              {result.eraserTest.analysis}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="text-xs text-gray-500 font-mono uppercase">Verdict:</div>
            {result.eraserTest.verdict === 'structural' ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm font-bold text-green-400 font-mono">STRUCTURAL</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold text-yellow-400 font-mono">DECORATIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="border border-yellow-700/50 bg-yellow-900/10 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-yellow-400 font-mono uppercase">
              Potential Issues
            </h3>
          </div>
          <ul className="space-y-2">
            {result.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-200 font-mono flex items-start gap-2">
                <span className="text-yellow-400">⚠</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="border border-blue-700/50 bg-blue-900/10 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-blue-400 font-mono uppercase">
              Recommendations
            </h3>
          </div>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-blue-200 font-mono flex items-start gap-2">
                <span className="text-blue-400">💡</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#00ff88] text-black font-bold uppercase rounded hover:bg-[#00cc6f] transition-colors font-mono"
        >
          <CheckCircle2 className="w-5 h-5" />
          Accept & Continue to Art Style
        </button>
        <button
          onClick={onReject}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-700 text-gray-300 font-bold uppercase rounded hover:bg-gray-600 transition-colors font-mono"
        >
          <XCircle className="w-5 h-5" />
          Revise Premise
        </button>
      </div>
    </div>
  );
}
