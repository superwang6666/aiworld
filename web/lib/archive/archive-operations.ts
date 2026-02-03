import type { WorldRule, ValidationResult, LawWeight, DEACAnalysis, RuleTag, WorldArchive } from '@/types';

/**
 * 存档状态接口
 */
export interface ArchiveState {
  archiveName: string;
  currentArchiveId: string;
  corePremise: string;
  artStyle: string;
  validationResult: ValidationResult | null;
  lawWeights: LawWeight[];
  deacAnalysis: DEACAnalysis | null;
  rules: WorldRule[];
  tagWeights: Record<string, RuleTag>;
}

/**
 * 恢复的存档状态接口
 */
export interface RestoredState {
  corePremise: string;
  artStyle: string;
  validationResult: ValidationResult;
  lawWeights: LawWeight[];
  deacAnalysis: DEACAnalysis | null;
  rules: WorldRule[];
  tagWeights: Record<string, RuleTag>;
  archiveName: string;
}

/**
 * 准备存档数据
 */
export function prepareArchiveData(state: ArchiveState): WorldArchive {
  const activeRulesCount = state.rules.filter(r => !r.rejected).length;
  const confirmedRulesCount = state.rules.filter(r => r.confirmed).length;

  // 转换标签权重为快照格式
  const tagWeightSnapshot: Record<string, { weight: number; usage: number; deletions: number }> = {};
  Object.keys(state.tagWeights).forEach(tagId => {
    const tag = state.tagWeights[tagId];
    tagWeightSnapshot[tagId] = {
      weight: tag.weight,
      usage: tag.usage_count,
      deletions: tag.deletion_count,
    };
  });

  const archive: WorldArchive = {
    id: state.currentArchiveId,
    name: state.archiveName,
    core_premise: state.corePremise,
    art_style: state.artStyle,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    validation_result: state.validationResult!,
    law_weights: state.lawWeights,
    deac_analysis: state.deacAnalysis || undefined,
    rules: state.rules,
    tag_weights: tagWeightSnapshot,
    discipline_coverage: [],
    total_rules_generated: state.rules.length,
    active_rules_count: activeRulesCount,
    confirmed_rules_count: confirmedRulesCount,
    generation_sessions: 1,
  };

  return archive;
}

/**
 * 自动保存存档（确认规则时触发）
 */
export async function autoSaveArchive(
  state: ArchiveState,
  rulesToSave?: WorldRule[]
): Promise<string> {
  // 如果没有存档名称，使用默认名称
  const saveName = state.archiveName.trim() || `World-${new Date().toLocaleDateString('zh-CN')}`;

  const archiveState = rulesToSave
    ? { ...state, rules: rulesToSave, archiveName: saveName }
    : { ...state, archiveName: saveName };

  const archive = prepareArchiveData(archiveState);

  const response = await fetch('/api/archive/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ archive }),
  });

  if (!response.ok) {
    throw new Error('Failed to auto-save archive');
  }

  const data = await response.json();
  console.log('✓ 存档已自动保存:', state.currentArchiveId ? '(覆盖更新)' : '(新建存档)');

  return data.archive_id || '';
}

/**
 * 手动保存存档
 */
export async function saveArchiveManual(
  archiveName: string,
  state: ArchiveState
): Promise<{ success: boolean; archiveId?: string; error?: string }> {
  if (!archiveName.trim() || state.rules.length === 0) {
    return {
      success: false,
      error: 'Please provide an archive name and ensure you have generated rules.',
    };
  }

  const archiveState = { ...state, archiveName: archiveName.trim() };
  const archive = prepareArchiveData(archiveState);

  try {
    const response = await fetch('/api/archive/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archive }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        archiveId: data.archive_id,
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        error: data.error,
      };
    }
  } catch (err) {
    console.error('Failed to save archive:', err);
    return {
      success: false,
      error: 'Failed to save archive. Please try again.',
    };
  }
}

/**
 * 加载存档数据
 */
export async function loadArchiveData(
  archiveId: string
): Promise<WorldArchive | null> {
  try {
    const response = await fetch(`/api/archive/load?id=${archiveId}`);

    if (response.ok) {
      const data = await response.json();
      return data.archive;
    } else {
      const data = await response.json();
      throw new Error(data.error || 'Failed to load archive');
    }
  } catch (err) {
    console.error('Failed to load archive:', err);
    throw err;
  }
}

/**
 * 恢复存档状态
 */
export function restoreArchiveState(
  archive: WorldArchive,
  baseTagWeights: Record<string, RuleTag>
): RestoredState {
  console.log('加载存档:', archive.name, {
    rules: archive.rules?.length,
    tagWeights: Object.keys(archive.tag_weights || {}).length
  });

  // 恢复标签权重（从快照格式转换回 RuleTag 格式）
  const restoredTagWeights: Record<string, RuleTag> = {};

  Object.keys(archive.tag_weights || {}).forEach(tagId => {
    const snapshot = archive.tag_weights[tagId];
    const baseTag = baseTagWeights[tagId];

    if (baseTag) {
      restoredTagWeights[tagId] = {
        ...baseTag,
        weight: snapshot.weight,
        usage_count: snapshot.usage,
        deletion_count: snapshot.deletions,
      };
    } else {
      // 可能是 LLM 生成的标签，需要从存档的规则中查找
      restoredTagWeights[tagId] = {
        id: tagId,
        name: tagId, // 临时使用 ID 作为名称
        category: 'mechanism',
        weight: snapshot.weight,
        usage_count: snapshot.usage,
        deletion_count: snapshot.deletions,
        source: 'llm',
      };
    }
  });

  return {
    corePremise: archive.core_premise,
    artStyle: archive.art_style || '',
    validationResult: archive.validation_result,
    lawWeights: archive.law_weights || [],
    deacAnalysis: archive.deac_analysis || null,
    rules: archive.rules || [],
    tagWeights: restoredTagWeights,
    archiveName: archive.name,
  };
}
