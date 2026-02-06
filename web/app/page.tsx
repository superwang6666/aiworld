"use client";

import { useState } from "react";

import type {
  WorldRule,
  ValidationResult,
  DEACAnalysis,
  LawWeight,
  RuleTag,
} from "@/types";

import {
  autoSaveArchive,
  saveArchiveManual,
  loadArchiveData,
  restoreArchiveState,
  type ArchiveState,
} from "@/lib/archive/archive-operations";
import { exportConfirmedRules } from "@/lib/export/export-handler";
import {
  generateRules,
  generateRulesWithTags,
} from "@/lib/generation/generation-handler";
import {
  toggleRule,
  deleteRule,
  updateDeletionScores,
  generateRandomRule,
} from "@/lib/rules/rule-manager";
import { initializeTagWeights } from "@/lib/tags/tag-manager";
import {
  validatePremise,
  triggerDEACAnalysis,
} from "@/lib/validation/validation-handler";

// UI 组件
import ArchiveManager from "@/components/ArchiveManager";
import GameAnalysisResult from "@/components/GameAnalysisResult";
import GameRecommendView from "@/components/GameRecommendView";
import HomePage from "@/components/HomePage";
import PremiumBackground from "@/components/PremiumBackground";
import ValidationPagePremium from "@/components/validation/ValidationPagePremium";
import RulesDisplay from "@/components/workflow/RulesDisplay";

type WorkflowStep =
  | "homepage"
  | "gameRecommend"
  | "gameAnalysisResult"
  | "validation"
  | "rules";

export default function Home() {
  // 状态定义
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("homepage");
  const [worldDescription, setWorldDescription] = useState("");
  const [selectedGamesForAnalysis, setSelectedGamesForAnalysis] = useState<
    any[]
  >([]);
  const [corePremise, setCorePremise] = useState("");
  const [artStyle, setArtStyle] = useState("");
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [lawWeights, setLawWeights] = useState<LawWeight[]>([]);
  const [generationMode, setGenerationMode] = useState<"fast" | "deep">("fast");
  const [rules, setRules] = useState<WorldRule[]>([]);
  const [deacAnalysis, setDeacAnalysis] = useState<DEACAnalysis | null>(null);
  const [deacLoading, setDeacLoading] = useState(false);
  const [isGeneratingRules, setIsGeneratingRules] = useState(false);
  const [tagWeights, setTagWeights] = useState<Record<string, RuleTag>>(
    initializeTagWeights(),
  );
  const [showArchiveManager, setShowArchiveManager] = useState(false);
  const [archiveName, setArchiveName] = useState("");
  const [currentArchiveId, setCurrentArchiveId] = useState<string>("");
  const [isTogglingRule, setIsTogglingRule] = useState(false);

  // 主界面开始构建
  const handleStart = async (description: string, selectedArtStyle: string) => {
    setCorePremise(description);
    setArtStyle(selectedArtStyle);

    try {
      const { validationResult: result, lawWeights: weights } =
        await validatePremise(description.trim());
      setValidationResult(result);
      setLawWeights(weights);
      setCurrentStep("validation");

      // 触发 DEAC 专家分析（异步）
      setDeacLoading(true);
      triggerDEACAnalysis(description.trim(), result, weights)
        .then((analysis) => {
          setDeacAnalysis(analysis);
          setDeacLoading(false);
        })
        .catch((_err) => {
          // Error handled silently
          setDeacLoading(false);
        });
    } catch (err: any) {
      // Error handled silently
      alert(err.message || "An error occurred while validating premise");
    }
  };

  // 验证通过，开始生成规则
  const handleAcceptValidation = async () => {
    setIsGeneratingRules(true);

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
          const { rules: rulesWithTags, updatedWeights } =
            await generateRulesWithTags(generatedRules, tagWeights);
          setRules(rulesWithTags);
          setTagWeights(updatedWeights);
        } catch (_tagError) {
          // Error handled silently
          setRules(generatedRules);
        }
      } else {
        setRules(generatedRules);
      }

      setCurrentStep("rules");
    } catch (err: any) {
      // Error handled silently
      alert(err.message || "An error occurred while generating rules");
    } finally {
      setIsGeneratingRules(false);
    }
  };

  const handleRejectValidation = () => {
    setValidationResult(null);
    setCurrentStep("homepage");
  };

  const handleToggleRule = async (id: string) => {
    if (isTogglingRule) {
      return;
    }

    setIsTogglingRule(true);

    try {
      const result = await toggleRule(
        id,
        rules,
        tagWeights,
        corePremise.trim(),
        artStyle.trim(),
      );

      setRules(result.updatedRules);
      setTagWeights(result.updatedTagWeights);

      if (result.shouldAutoSave && result.shouldGenerateNew) {
        setTimeout(async () => {
          try {
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
            const newArchiveId = await autoSaveArchive(
              archiveState,
              result.updatedRules,
            );
            if (newArchiveId && !currentArchiveId) {
              setCurrentArchiveId(newArchiveId);
            }

            const newRule = await generateRandomRule(
              corePremise.trim(),
              artStyle.trim(),
              result.updatedRules.filter((r) => !r.rejected),
            );
            setRules((prevRules) => [...prevRules, newRule]);
          } catch (_err) {
            // Error handled silently
          } finally {
            setIsTogglingRule(false);
          }
        }, 0);
      } else {
        setIsTogglingRule(false);
      }
    } catch (_err) {
      // Error handled silently
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
        artStyle.trim(),
      );

      setRules(result.updatedRules);
      setTagWeights(result.updatedTagWeights);

      if (result.newRule) {
        setRules((prevRules) => [...prevRules, result.newRule!]);
      }

      setRules((prevRules) =>
        updateDeletionScores(prevRules, result.updatedTagWeights),
      );
    } catch (_err) {
      // Error handled silently
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
      setArchiveName("");
    } else {
      alert(`Failed to save archive: ${result.error}`);
    }
  };

  const handleLoadArchive = async (archiveId: string) => {
    try {
      const archive = await loadArchiveData(archiveId);

      if (!archive) {
        alert("存档数据格式错误");
        return;
      }

      const restoredState = restoreArchiveState(
        archive,
        initializeTagWeights(),
      );

      setCorePremise(restoredState.corePremise);
      setArtStyle(restoredState.artStyle);
      setValidationResult(restoredState.validationResult);
      setLawWeights(restoredState.lawWeights);
      setDeacAnalysis(restoredState.deacAnalysis);
      setRules(restoredState.rules);
      setTagWeights(restoredState.tagWeights);
      setCurrentArchiveId(archive.id);
      setArchiveName(restoredState.archiveName);
      setCurrentStep("rules");
      setShowArchiveManager(false);

      alert(`Archive "${archive.name}" loaded successfully!`);
    } catch (_err) {
      // Error handled silently
      alert("Failed to load archive. Please try again.");
    }
  };

  const handleExport = () => {
    exportConfirmedRules(rules, corePremise, artStyle, validationResult);
  };

  const handleResetWorkflow = () => {
    setCurrentStep("homepage");
    setCorePremise("");
    setArtStyle("");
    setValidationResult(null);
    setRules([]);
  };

  const confirmedCount = rules.filter((r) => r.confirmed).length;

  return (
    <PremiumBackground>
      {currentStep === "homepage" ? (
        <HomePage
          onStart={handleStart}
          onRecommendMode={(description, selectedArtStyle) => {
            setWorldDescription(description);
            setArtStyle(selectedArtStyle);
            setCurrentStep("gameRecommend");
          }}
        />
      ) : currentStep === "gameRecommend" ? (
        <GameRecommendView
          worldDescription={worldDescription}
          onGameSelect={(selectedGames) => {
            setSelectedGamesForAnalysis(selectedGames);
            setCurrentStep("gameAnalysisResult");
          }}
          onBack={() => setCurrentStep("homepage")}
        />
      ) : currentStep === "gameAnalysisResult" ? (
        <GameAnalysisResult
          selectedGames={selectedGamesForAnalysis}
          onComplete={async (premiseSummary) => {
            setCorePremise(premiseSummary);
            // 直接进入验证流程
            try {
              const { validationResult: result, lawWeights: weights } =
                await validatePremise(premiseSummary.trim());
              setValidationResult(result);
              setLawWeights(weights);
              setCurrentStep("validation");

              // 触发 DEAC 专家分析（异步）
              setDeacLoading(true);
              triggerDEACAnalysis(premiseSummary.trim(), result, weights)
                .then((analysis) => {
                  setDeacAnalysis(analysis);
                  setDeacLoading(false);
                })
                .catch((_err) => {
                  // Error handled silently
                  setDeacLoading(false);
                });
            } catch (err: any) {
              // Error handled silently
              alert(
                err.message || "An error occurred while validating premise",
              );
            }
          }}
          onBack={() => setCurrentStep("gameRecommend")}
        />
      ) : currentStep === "validation" && validationResult ? (
        <ValidationPagePremium
          result={validationResult}
          lawWeights={lawWeights}
          deacAnalysis={deacAnalysis}
          deacLoading={deacLoading}
          generationMode={generationMode}
          isGeneratingRules={isGeneratingRules}
          onGenerationModeChange={setGenerationMode}
          onAccept={handleAcceptValidation}
          onReject={handleRejectValidation}
        />
      ) : currentStep === "rules" ? (
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
      ) : null}

      {showArchiveManager && (
        <ArchiveManager
          onLoadArchive={handleLoadArchive}
          onClose={() => setShowArchiveManager(false)}
        />
      )}
    </PremiumBackground>
  );
}
