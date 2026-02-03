'use client';

import { useState } from 'react';

import type { WorldRule, ValidationResult, DEACAnalysis, LawWeight, RuleTag } from '@/types';


// 业务逻辑函数
import { autoSaveArchive, saveArchiveManual, loadArchiveData, restoreArchiveState, type ArchiveState } from '@/lib/archive/archive-operations';
import { exportConfirmedRules } from '@/lib/export/export-handler';
import { generateRules, generateRulesWithTags } from '@/lib/generation/generation-handler';
import { toggleRule, deleteRule, updateDeletionScores, generateRandomRule } from '@/lib/rules/rule-manager';
import { initializeTagWeights } from '@/lib/tags/tag-manager';
import { validatePremise, triggerDEACAnalysis } from '@/lib/validation/validation-handler';

// UI 组件
import ArchiveManager from '@/components/ArchiveManager';
import GameAnalysisResult from '@/components/GameAnalysisResult';
import GameRecommendView from '@/components/GameRecommendView';
import HomePageResponsive from '@/components/imports/HomePage-responsive';
import PremiumBackground from '@/components/PremiumBackground';
import ValidationPagePremium from '@/components/validation/ValidationPagePremium';
import ArtStyleInput from '@/components/workflow/ArtStyleInput';
import PremiseInput from '@/components/workflow/PremiseInput';
import RulesDisplay from '@/components/workflow/RulesDisplay';
import WorkflowFooter from '@/components/workflow/WorkflowFooter';
import WorkflowHeader from '@/components/workflow/WorkflowHeader';

type WorkflowStep = 'homepage' | 'gameRecommend' | 'gameAnalysisResult' | 'premise' | 'validation' | 'artStyle' | 'rules';

export default function Home() {
  // 状态定义
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('homepage');
  const [worldDescription, setWorldDescription] = useState('');
  const [selectedGamesForAnalysis, setSelectedGamesForAnalysis] = useState<any[]>([]);
  const [_useGameRecommend, _setUseGameRecommend] = useState(false);
  const [corePremise, setCorePremise] = useState('');
  const [premiseSuggestion, setPremiseSuggestion] = useState<string | null>(null);
  const [artStyle, setArtStyle] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [lawWeights, setLawWeights] = useState<LawWeight[]>([]);
  const [generationMode, setGenerationMode] = useState<'fast' | 'deep'>('fast');
  const [rules, setRules] = useState<WorldRule[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deacAnalysis, setDeacAnalysis] = useState<DEACAnalysis | null>(null);
  const [deacLoading, setDeacLoading] = useState(false);
  const [tagWeights, setTagWeights] = useState<Record<string, RuleTag>>(initializeTagWeights());
  const [showArchiveManager, setShowArchiveManager] = useState(false);
  const [archiveName, setArchiveName] = useState('');
  const [currentArchiveId, setCurrentArchiveId] = useState<string>('');
  const [isTogglingRule, setIsTogglingRule] = useState(false);

  // 事件处理函数
  const handleValidatePremise = async () => {
    if (!corePremise.trim()) {
      setError('Please provide a Core Premise');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const { validationResult: result, lawWeights: weights } = await validatePremise(corePremise.trim());
      setValidationResult(result);
      setLawWeights(weights);
      setCurrentStep('validation');

      // 触发 DEAC 专家分析（异步）
      setDeacLoading(true);
      triggerDEACAnalysis(corePremise.trim(), result, weights)
        .then(analysis => {
          setDeacAnalysis(analysis);
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
      const generatedRules = await generateRules({
        corePremise: corePremise.trim(),
        artStyle: artStyle.trim(),
        lawWeights,
        generationMode,
        deacAnalysis: deacAnalysis || undefined,
        deacLoading,
      });

      // 为规则生成标签
      if (generatedRules.length > 0) {
        try {
          const { rules: rulesWithTags, updatedWeights } = await generateRulesWithTags(
            generatedRules,
            tagWeights
          );
          setRules(rulesWithTags);
          setTagWeights(updatedWeights);
        } catch (tagError) {
          console.error('Failed to generate tags:', tagError);
          setRules(generatedRules);
        }
      } else {
        setRules(generatedRules);
      }

      setCurrentStep('rules');
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating rules');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleRule = async (id: string) => {
    // 防止并发操作
    if (isTogglingRule) {
      console.log('规则切换操作正在进行中，请稍候...');
      return;
    }

    setIsTogglingRule(true);

    try {
      const result = await toggleRule(
        id,
        rules,
        tagWeights,
        corePremise.trim(),
        artStyle.trim()
      );

      setRules(result.updatedRules);
      setTagWeights(result.updatedTagWeights);

      // 如果需要自动存档和生成新规则
      if (result.shouldAutoSave && result.shouldGenerateNew) {
        setTimeout(async () => {
          try {
            console.log('🔄 开始自动存档和生成新规则...');

            // 1. 自动保存存档
            const archiveState: ArchiveState = {
              archiveName,
              currentArchiveId,
              corePremise,
              artStyle,
              validationResult,
              lawWeights,
              deacAnalysis,
              rules: result.updatedRules,
              tagWeights: result.updatedTagWeights,
            };
            const newArchiveId = await autoSaveArchive(archiveState, result.updatedRules);
            if (newArchiveId && !currentArchiveId) {
              setCurrentArchiveId(newArchiveId);
            }
            console.log('✓ 自动存档完成');

            // 2. 生成一条新的随机法则规则
            const newRule = await generateRandomRule(
              corePremise.trim(),
              artStyle.trim(),
              result.updatedRules.filter(r => !r.rejected)
            );
            setRules((prevRules) => [...prevRules, newRule]);
            console.log('✓ 新规则生成完成');
          } catch (err) {
            console.error('❌ 自动存档或生成新规则失败:', err);
          } finally {
            setIsTogglingRule(false);
            console.log('🔓 规则切换锁已释放');
          }
        }, 0);
      } else {
        setIsTogglingRule(false);
      }
    } catch (err) {
      console.error('❌ 规则切换失败:', err);
      setIsTogglingRule(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const result = await deleteRule(
        id,
        rules,
        tagWeights,
        corePremise.trim(),
        artStyle.trim()
      );

      setRules(result.updatedRules);
      setTagWeights(result.updatedTagWeights);

      // 如果生成了新规则，添加到列表
      if (result.newRule) {
        setRules((prevRules) => [...prevRules, result.newRule!]);
      }

      // 重新计算所有规则的删除评分
      setRules((prevRules) => updateDeletionScores(prevRules, result.updatedTagWeights));
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  const handleSaveArchive = async () => {
    const archiveState: ArchiveState = {
      archiveName,
      currentArchiveId,
      corePremise,
      artStyle,
      validationResult,
      lawWeights,
      deacAnalysis,
      rules,
      tagWeights,
    };

    const result = await saveArchiveManual(archiveName, archiveState);

    if (result.success) {
      if (result.archiveId && !currentArchiveId) {
        setCurrentArchiveId(result.archiveId);
      }
      alert(`Archive "${archiveName}" saved successfully!`);
      setArchiveName('');
    } else {
      alert(`Failed to save archive: ${result.error}`);
    }
  };

  const handleLoadArchive = async (archiveId: string) => {
    try {
      const archive = await loadArchiveData(archiveId);

      if (!archive) {
        alert('存档数据格式错误');
        return;
      }

      const restoredState = restoreArchiveState(archive, initializeTagWeights());

      // 恢复所有状态
      setCorePremise(restoredState.corePremise);
      setArtStyle(restoredState.artStyle);
      setValidationResult(restoredState.validationResult);
      setLawWeights(restoredState.lawWeights);
      setDeacAnalysis(restoredState.deacAnalysis);
      setRules(restoredState.rules);
      setTagWeights(restoredState.tagWeights);
      setCurrentArchiveId(archive.id);
      setArchiveName(restoredState.archiveName);
      setCurrentStep('rules');
      setShowArchiveManager(false);

      alert(`Archive "${archive.name}" loaded successfully!`);
    } catch (err) {
      console.error('Failed to load archive:', err);
      alert('Failed to load archive. Please try again.');
    }
  };

  const handleExport = () => {
    exportConfirmedRules(rules, corePremise, artStyle, validationResult);
  };

  const handleResetWorkflow = () => {
    setCurrentStep('homepage');
    setCorePremise('');
    setArtStyle('');
    setValidationResult(null);
    setRules([]);
    setError(null);
  };

  const confirmedCount = rules.filter((r) => r.confirmed).length;

  return (
    <PremiumBackground>
      {/* 首页或工作流视图 */}
      {currentStep === 'homepage' ? (
        <HomePageResponsive
          onRecommendMode={(description) => {
            setWorldDescription(description);
            _setUseGameRecommend(true);
            setCurrentStep('gameRecommend');
          }}
          onDirectBuild={(description) => {
            setWorldDescription(description);
            setCorePremise(description);
            _setUseGameRecommend(false);
            setCurrentStep('premise');
          }}
        />
      ) : currentStep === 'gameRecommend' ? (
        <GameRecommendView
          worldDescription={worldDescription}
          onGameSelect={(selectedGames) => {
            setSelectedGamesForAnalysis(selectedGames);
            setCurrentStep('gameAnalysisResult');
          }}
          onBack={() => setCurrentStep('homepage')}
        />
      ) : currentStep === 'gameAnalysisResult' ? (
        <GameAnalysisResult
          selectedGames={selectedGamesForAnalysis}
          onComplete={(premiseSummary) => {
            setCorePremise(premiseSummary);
            setPremiseSuggestion(premiseSummary);
            setCurrentStep('premise');
          }}
          onBack={() => setCurrentStep('gameRecommend')}
        />
      ) : (
        <div className="min-h-screen flex flex-col relative z-10">
          <WorkflowHeader currentStep={currentStep} />

          <main className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Step 1: Core Premise Input */}
            {currentStep === 'premise' && (
              <PremiseInput
                corePremise={corePremise}
                premiseSuggestion={premiseSuggestion}
                isValidating={isValidating}
                error={error}
                onPremiseChange={setCorePremise}
                onValidate={handleValidatePremise}
                onAcceptSuggestion={() => {
                  setCorePremise(premiseSuggestion!);
                  setPremiseSuggestion(null);
                }}
              />
            )}

            {/* Step 2: Validation Results */}
            {currentStep === 'validation' && validationResult && (
              <ValidationPagePremium
                result={validationResult}
                lawWeights={lawWeights}
                deacAnalysis={deacAnalysis}
                onAccept={handleAcceptValidation}
                onReject={handleRejectValidation}
              />
            )}

            {/* Step 3: Art Style Input */}
            {currentStep === 'artStyle' && (
              <ArtStyleInput
                artStyle={artStyle}
                generationMode={generationMode}
                validationResult={validationResult}
                deacLoading={deacLoading}
                deacAnalysis={deacAnalysis}
                isGenerating={isGenerating}
                error={error}
                onArtStyleChange={setArtStyle}
                onGenerationModeChange={setGenerationMode}
                onGenerate={handleGenerate}
              />
            )}

            {/* Step 4: Generated Rules */}
            {currentStep === 'rules' && (
              <RulesDisplay
                rules={rules}
                tagWeights={tagWeights}
                archiveName={archiveName}
                confirmedCount={confirmedCount}
                onToggleRule={handleToggleRule}
                onDeleteRule={handleDeleteRule}
                onArchiveNameChange={setArchiveName}
                onSaveArchive={handleSaveArchive}
                onShowArchiveManager={() => setShowArchiveManager(true)}
                onExport={handleExport}
                onReset={handleResetWorkflow}
              />
            )}
          </main>

          <WorkflowFooter />
        </div>
      )}

      {/* Archive Manager Modal */}
      {showArchiveManager && (
        <ArchiveManager
          onLoadArchive={handleLoadArchive}
          onClose={() => setShowArchiveManager(false)}
        />
      )}
    </PremiumBackground>
  );
}
