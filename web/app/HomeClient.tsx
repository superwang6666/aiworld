"use client";

import { useState } from "react";

import type {
  WorldRule,
  ValidationResult,
  DEACAnalysis,
  GameInfo,
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
import { logger } from "@/lib/utils/logger";
import { toast } from "@/lib/utils/toast-store";
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

export default function HomeClient() {
  // 状态定义
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("homepage");
  const [worldDescription, setWorldDescription] = useState("");
  const [selectedGamesForAnalysis, setSelectedGamesForAnalysis] = useState<
    GameInfo[]
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
  const [deacFailed, setDeacFailed] = useState(false);
  const [isGeneratingRules, setIsGeneratingRules] = useState(false);
  const [tagWeights, setTagWeights] = useState<Record<string, RuleTag>>(
    initializeTagWeights(),
  );
  const [showArchiveManager, setShowArchiveManager] = useState(false);
  const [archiveName, setArchiveName] = useState("");
  const [isPublicArchive, setIsPublicArchive] = useState(false);
  const [currentArchiveId, setCurrentArchiveId] = useState<string>("");
  const [isTogglingRule, setIsTogglingRule] = useState(false);

  // 验证核心前提并异步触发 DEAC 专家分析
  // 两个入口（直接描述 / 游戏推荐总结）走到这一步后逻辑完全一致,抽成一个函数
  // 避免像之前那样同一段逻辑在两处分别维护、容易漏改。
  const runValidationFlow = async (premise: string) => {
    setCorePremise(premise);

    try {
      const { validationResult: result, lawWeights: weights } =
        await validatePremise(premise.trim());
      setValidationResult(result);
      setLawWeights(weights);
      setCurrentStep("validation");

      // 触发 DEAC 专家分析（异步）
      setDeacLoading(true);
      setDeacFailed(false);
      triggerDEACAnalysis(premise.trim(), result, weights)
        .then((analysis) => {
          setDeacAnalysis(analysis);
          setDeacLoading(false);
        })
        .catch((err) => {
          logger.error("DEAC analysis failed", { error: err });
          setDeacLoading(false);
          setDeacFailed(true);
        });
    } catch (err) {
      logger.error("Premise validation failed", { error: err });
      toast.error(err instanceof Error ? err.message : "An error occurred while validating premise");
    }
  };

  // 主界面开始构建
  const handleStart = async (description: string, selectedArtStyle: string) => {
    setArtStyle(selectedArtStyle);
    await runValidationFlow(description);
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
        tagWeights,
      });

      // 为规则生成标签
      if (generatedRules.length > 0) {
        try {
          const { rules: rulesWithTags, updatedWeights } =
            await generateRulesWithTags(generatedRules, tagWeights);
          setRules(rulesWithTags);
          setTagWeights(updatedWeights);
        } catch (tagError) {
          logger.error("Failed to generate tags for rules", { error: tagError });
          setRules(generatedRules);
        }
      } else {
        setRules(generatedRules);
      }

      setCurrentStep("rules");
    } catch (err) {
      logger.error("Rule generation failed", { error: err });
      toast.error(err instanceof Error ? err.message : "An error occurred while generating rules");
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
              isPublic: isPublicArchive,
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
              result.updatedTagWeights,
            );
            setRules((prevRules) => [...prevRules, newRule]);
          } catch (err) {
            logger.error("Auto-save or random rule generation failed", { error: err });
          } finally {
            setIsTogglingRule(false);
          }
        }, 0);
      } else {
        setIsTogglingRule(false);
      }
    } catch (err) {
      logger.error("Toggle rule failed", { error: err });
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
    } catch (err) {
      logger.error("Delete rule failed", { error: err });
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
      isPublic: isPublicArchive,
    };

    const result = await saveArchiveManual(archiveName, archiveState);

    if (result.success) {
      if (result.archiveId && !currentArchiveId) {
        setCurrentArchiveId(result.archiveId);
      }
      toast.success(`Archive "${archiveName}" saved successfully!`);
      setArchiveName("");
    } else {
      toast.error(`Failed to save archive: ${result.error}`);
    }
  };

  const handleLoadArchive = async (archiveId: string) => {
    try {
      const archive = await loadArchiveData(archiveId);

      if (!archive) {
        toast.error("存档数据格式错误");
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
      setIsPublicArchive(restoredState.isPublic);
      setCurrentStep("rules");
      setShowArchiveManager(false);

      toast.success(`Archive "${archive.name}" loaded successfully!`);
    } catch (err) {
      logger.error("Load archive failed", { archiveId, error: err });
      toast.error("Failed to load archive. Please try again.");
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
    setIsPublicArchive(false);
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
          worldDescription={worldDescription}
          onComplete={async (premiseSummary) => {
            await runValidationFlow(premiseSummary);
          }}
          onBack={() => setCurrentStep("gameRecommend")}
        />
      ) : currentStep === "validation" && validationResult ? (
        <ValidationPagePremium
          result={validationResult}
          lawWeights={lawWeights}
          deacAnalysis={deacAnalysis}
          deacLoading={deacLoading}
          deacFailed={deacFailed}
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
          isPublic={isPublicArchive}
          confirmedCount={confirmedCount}
          onToggleRule={handleToggleRule}
          onDeleteRule={handleDeleteRule}
          onArchiveNameChange={setArchiveName}
          onIsPublicChange={setIsPublicArchive}
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
