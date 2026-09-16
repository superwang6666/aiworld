# Architecture & API Reference

项目特有的结构、架构、API 速查。通用风格/命名/导入顺序由 linter 管，不在此重复。

## 目录结构（web/）

```
app/
  api/                # 后端路由（每个子目录一个 route.ts）
    auth/ deac/ tags/ archive/ generate/ generate-single/
    validate-premise/ analyze-games/ recommend-games/
    game-search/ evaluate-directions/ merge-premise/ agent/
  auth/               # 认证页面（登录/注册/重置）
  validation/         # 验证详情页面
  layout.tsx          # 根布局（集成 Auth + I18n）
  page.tsx            # 主页面（工作流入口）
components/
  auth/ common/ providers/ workflow/
  validation/advanced-analysis/   # 高级分析子组件
config/               # 集中常量（禁止魔法数字，统一在此定义后导入）
  law-names.ts academic-disciplines.ts art-styles.ts
  evaluation-rules.ts game-source-config.ts world-directions.ts
  predefined-tags.ts llm-language.ts
lib/
  utils/      llm-client.ts api-client.ts logger.ts
              prompt-loader.ts llm-language.ts
              translations.ts server-translations.ts
  deac/       index background-service cache-manager weighted-synthesis
  experts/    loader orchestrator expert-matcher gap-analyzer prompt-architect
  auth/       auth-config user-service email-service password-utils middleware
  archive/    archive-manager archive-operations discipline-mapper
  generation/ validation/ laws/ rules/ tags/ export/
types/        index.ts（共享类型单一数据源）auth.ts i18n.ts world-directions.ts
messages/     zh-CN.json（默认）en.json
archive/      存档数据（本地文件系统：index.json + worlds/）
data/users/   本地用户数据（users.json tokens.json）
```

## 核心架构

用户工作流：① 输入核心设定（或游戏推荐）→ ② 验证前提（核心异常 / 多米诺效应 / 橡皮擦测试 / DEAC 异步后台）→ ③ 规则生成（按七法则生成、确认/删除/重生成、自动标签）→ ④ 存档 & 导出。

DEAC 专家系统流水线：核心设定 → 差距分析(gap-analyzer) → 专家匹配(expert-matcher) → 提示词构造(prompt-architect) → LLM 调用 → 权重合成(weighted-synthesis) → DEACAnalysis 输出。

七法则：`type Law` 联合类型定义在 **types/index.ts**（值 `Space|Survival|Cognition|Scarcity|Time|Power|Metaphysics`）；名称/颜色/多语言映射在 config/law-names.ts（`LAWS` / `LAW_NAMES` / `LAW_NAME_MAP`）。

## 配置归属（改常量先到对应文件，勿散落）

| 内容 | 文件 |
|------|------|
| 七法则（名称/颜色/多语言） | config/law-names.ts（导出 LAWS / LAW_NAMES / LAW_NAME_MAP） |
| 学术学科分类 | config/academic-disciplines.ts |
| 艺术风格 | config/art-styles.ts |
| 评估规则 | config/evaluation-rules.ts |
| 预定义标签池 | config/predefined-tags.ts |
| 游戏来源（RAWG） | config/game-source-config.ts |
| 世界方向 | config/world-directions.ts |

## 共享类型速查（types/index.ts）

| 域 | 主要类型 |
|----|---------|
| 法则 | Law, LawWeight, LawMapping |
| 规则 | WorldRule, GenerationRequest, GenerationOptions |
| 验证 | ValidationResult, LawImpact, EraserTest |
| DEAC | ExpertConfig, ExpertResponse, GapAnalysis, DEACAnalysis, DEACContext |
| 标签 | RuleTag, TagGenerationRequest, TagGenerationResponse |
| 学科 | AcademicDiscipline, DisciplineCoverage |
| 存档 | WorldArchive, ArchiveMetadata |
| 游戏分析 | GameInfo, GameAnalysis, ComparativeAnalysis |

## API 路由模板

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletion } from '@/lib/utils/llm-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.requiredField) {
      return NextResponse.json({ error: 'Missing required field' }, { status: 400 });
    }
    const content = await createChatCompletion({ systemPrompt, userPrompt, jsonMode: true });
    // ... 业务逻辑
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('API Error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

## 主要 API 端点速查（均 web/ 下，除标注外为 POST）

| 路径 | 用途 |
|------|------|
| /api/generate · /api/generate-single | 规则生成 / 单规则生成 |
| /api/validate-premise | 前提验证 |
| /api/deac/dispatch · /api/deac/analyze-gap · /api/deac/synthesize | DEAC 派遣 / 差距分析 / 合成 |
| /api/tags/generate · /api/tags/update-weights | 标签生成 / 权重更新 |
| /api/archive/save · /api/archive/load (GET) · /api/archive/list (GET) | 存档保存 / 加载 / 列表 |
| /api/game-search · /api/evaluate-directions | 游戏搜索 / 方向评估 |
