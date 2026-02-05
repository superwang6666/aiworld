import type { WorldRule, ValidationResult } from "@/types";

/**
 * 导出元数据接口
 */
export interface ExportMetadata {
  corePremise: string;
  artStyle: string;
  validationResult: ValidationResult | null;
}

/**
 * 导出规则为 Markdown 格式
 */
export function exportRulesToMarkdown(
  rules: WorldRule[],
  metadata: ExportMetadata,
): string {
  const { corePremise, artStyle, validationResult } = metadata;

  const markdown =
    `# World Rules\n\n` +
    `**Core Premise:** ${corePremise}\n` +
    `**Art Style:** ${artStyle}\n\n` +
    `## Validation Summary\n\n` +
    `- **Uniqueness Score:** ${validationResult?.uniquenessScore}/100\n` +
    `- **Core Anomaly:** ${validationResult?.coreAnomalyIdentified}\n` +
    `- **Eraser Test Verdict:** ${validationResult?.eraserTest.verdict.toUpperCase()}\n\n` +
    `## Confirmed Rules (${rules.length})\n\n` +
    rules
      .map(
        (rule, index) =>
          `### ${index + 1}. ${rule.rule}\n\n` +
          `**Law:** ${rule.law}\n\n` +
          `**Expert Logic:** ${rule.expert_logic}\n\n` +
          `---\n\n`,
      )
      .join("");

  return markdown;
}

/**
 * 导出规则为 JSON 格式
 */
export function exportRulesToJSON(
  rules: WorldRule[],
  metadata: ExportMetadata,
): string {
  const { corePremise, artStyle, validationResult } = metadata;

  const json = JSON.stringify(
    {
      corePremise,
      artStyle,
      validation: validationResult,
      rules: rules.map(({ id: _id, confirmed: _confirmed, ...rule }) => rule),
    },
    null,
    2,
  );

  return json;
}

/**
 * 下载导出文件
 */
export function downloadExportFiles(markdown: string, json: string): void {
  // Create download for Markdown
  const markdownBlob = new Blob([markdown], { type: "text/markdown" });
  const markdownUrl = URL.createObjectURL(markdownBlob);
  const markdownLink = document.createElement("a");
  markdownLink.href = markdownUrl;
  markdownLink.download = `world-rules-${Date.now()}.md`;
  markdownLink.click();

  // Create download for JSON
  const jsonBlob = new Blob([json], { type: "application/json" });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement("a");
  jsonLink.href = jsonUrl;
  jsonLink.download = `world-rules-${Date.now()}.json`;
  jsonLink.click();

  // Cleanup
  URL.revokeObjectURL(markdownUrl);
  URL.revokeObjectURL(jsonUrl);
}

/**
 * 主导出函数 - 导出已确认的规则
 */
export function exportConfirmedRules(
  rules: WorldRule[],
  corePremise: string,
  artStyle: string,
  validationResult: ValidationResult | null,
): void {
  const confirmedRules = rules.filter((rule) => rule.confirmed);

  if (confirmedRules.length === 0) {
    alert(
      "No rules confirmed. Please confirm at least one rule before exporting.",
    );
    return;
  }

  const metadata: ExportMetadata = {
    corePremise,
    artStyle,
    validationResult,
  };

  const markdown = exportRulesToMarkdown(confirmedRules, metadata);
  const json = exportRulesToJSON(confirmedRules, metadata);

  downloadExportFiles(markdown, json);
}
