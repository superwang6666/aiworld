'use client';

import { useState } from 'react';
import { ValidationResult, LawWeight, DEACAnalysis, LawImpact } from '@/types';
import ValidationScoreCard from './ValidationScoreCard';
import ValidationCoreAnomaly from './ValidationCoreAnomaly';
import ValidationDominoEffect from './ValidationDominoEffect';
import ValidationEraserTest from './ValidationEraserTest';
import ValidationWarnings from './ValidationWarnings';
import ValidationRecommendations from './ValidationRecommendations';
import ValidationActions from './ValidationActions';
import AdvancedAnalysisModal from './AdvancedAnalysisModal';

interface ValidationPagePremiumProps {
  result: ValidationResult;
  lawWeights: LawWeight[];
  deacAnalysis: DEACAnalysis | null;
  onAccept: () => void;
  onReject: () => void;
}

export default function ValidationPagePremium({
  result,
  lawWeights,
  deacAnalysis,
  onAccept,
  onReject
}: ValidationPagePremiumProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluatedImpacts, setEvaluatedImpacts] = useState<LawImpact[]>(result.lawImpacts);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  // 找出权重最高的法则作为核心法则
  const coreLaw = lawWeights.length > 0
    ? lawWeights.reduce((max, current) => current.weight > max.weight ? current : max).law
    : undefined;

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
      // TODO: Show error message to user
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <>
      <div className="size-full overflow-y-auto">
        {/* Navigation */}
        <nav className="px-4 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-b from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-[18px] px-4 py-2 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm">
                <p
                  className="font-black text-[16px] tracking-[0.8px]"
                  style={{
                    color: '#39ff14',
                    textShadow:
                      '0 0 10px rgba(57, 255, 20, 0.8), 0 0 20px rgba(57, 255, 20, 0.5), 0 0 30px rgba(57, 255, 20, 0.3), 0 2px 4px rgba(0, 0, 0, 0.8)',
                    WebkitTextStroke: '0.5px rgba(57, 255, 20, 0.3)',
                  }}
                >
                  WORLD
                </p>
              </div>
              <div className="bg-[rgba(60,60,70,0.6)] rounded-[18px] px-3 py-1 border border-[rgba(100,100,110,0.3)]">
                <p className="text-[#c1c5cc] text-[11px] tracking-[0.55px]">
                  BETA
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: '#39ff14',
                  boxShadow: '0 0 8px rgba(57, 255, 20, 0.8)',
                }}
              />
              <span className="text-[#c1c5cc] text-sm font-semibold">
                验证完成
              </span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="px-4 sm:px-8 lg:px-12 xl:px-16 pb-12">
          {/* Title */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent mb-3">
              验证报告
            </h1>
            <p className="text-[#7a7a88] text-sm sm:text-base">
              Core Anomaly Verification Protocol
            </p>
          </div>

          {/* Score Card and Core Anomaly */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8 sm:mb-12">
            <div className="lg:col-span-4">
              <ValidationScoreCard score={result.uniquenessScore} />
            </div>
            <div className="lg:col-span-8">
              <ValidationCoreAnomaly
                coreAnomalyIdentified={result.coreAnomalyIdentified}
                coreLaw={coreLaw}
              />
            </div>
          </div>

          {/* Domino Effect Analysis */}
          <ValidationDominoEffect
            lawImpacts={evaluatedImpacts}
            onEvaluateDirections={handleEvaluateDirections}
            isEvaluating={isEvaluating}
            hasEvaluated={hasEvaluated}
          />

          {/* Eraser Test */}
          <ValidationEraserTest eraserTest={result.eraserTest} />

          {/* Warnings */}
          <ValidationWarnings warnings={result.warnings} />

          {/* Recommendations */}
          <ValidationRecommendations recommendations={result.recommendations} />

          {/* Actions */}
          <ValidationActions
            onAccept={onAccept}
            onReject={onReject}
            onAdvancedAnalysis={() => setIsModalOpen(true)}
          />
        </main>
      </div>

      {/* Advanced Analysis Modal */}
      <AdvancedAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lawWeights={lawWeights}
        deacAnalysis={deacAnalysis}
      />
    </>
  );
}
