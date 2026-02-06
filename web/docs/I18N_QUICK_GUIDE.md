# 国际化封装方案 - 快速指南

> 本文档说明如何使用封装好的国际化方案，让您只需修改 JSON 文件就能添加新语言

## 🎯 核心理念

**您只需要做一件事：修改 JSON 翻译文件**

所有组件都使用统一的翻译系统，当您添加新语言时，只需：
1. 在 `types/i18n.ts` 中添加新语言代码
2. 创建新的翻译文件（如 `messages/ja.json`）
3. 复制现有翻译文件并翻译成新语言

**不需要修改任何组件代码！**

---

## 📝 翻译文件结构

所有翻译文本都在 `messages/` 目录下，按命名空间组织：

```
messages/
├── zh-CN.json    # 中文翻译
├── en.json       # 英文翻译
└── ja.json       # 日语翻译（示例）
```

### 命名空间说明

```json
{
  "Common": {          // 通用文本（按钮、标签等）
    "loading": "...",
    "submit": "...",
    ...
  },
  "HomePage": {        // 主页专用文本
    "title": "...",
    "subtitle": "...",
    ...
  },
  "GameAnalysis": {    // 游戏分析页面
    "analyzing": "...",
    ...
  },
  "GameRecommend": {   // 游戏推荐页面
    "recommending": "...",
    ...
  },
  "Loading": {         // 加载动画文本
    "validatingPremise": "...",
    ...
  },
  "Auth": {            // 认证相关
    ...
  },
  "Validation": {      // 验证相关
    ...
  },
  "Laws": {            // 法则名称
    ...
  },
  "Archive": {         // 归档管理
    ...
  },
  "Rules": {           // 规则相关
    ...
  }
}
```

---

## 🚀 添加新语言的步骤

### 步骤 1: 更新类型定义

编辑 `web/types/i18n.ts`：

```typescript
// 添加新语言代码
export type Locale = 'zh-CN' | 'en' | 'ja' | 'ko'; // 添加 'ja', 'ko' 等

export const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en', 'ja', 'ko'];

export const LOCALE_NAMES: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'en': 'English',
  'ja': '日本語',      // 添加日语
  'ko': '한국어',      // 添加韩语
};

export const LOCALE_SHORT_NAMES: Record<Locale, string> = {
  'zh-CN': '中',
  'en': 'EN',
  'ja': 'JP',          // 添加日语简称
  'ko': 'KR',          // 添加韩语简称
};
```

### 步骤 2: 创建翻译文件

复制 `messages/en.json` 为 `messages/ja.json`，然后翻译所有文本：

```json
{
  "Common": {
    "loading": "読み込み中...",
    "submit": "送信",
    "cancel": "キャンセル",
    ...
  },
  "HomePage": {
    "title": "Make GAME World",
    "subtitle": "LLMベースのヒューリスティック世界ルールジェネレーター",
    ...
  },
  ...
}
```

### 步骤 3: 更新法则名称

编辑 `web/config/law-names.ts`：

```typescript
export const LAW_NAME_MAP: Record<Locale, Record<Law, string>> = {
  'zh-CN': { ... },
  'en': { ... },
  'ja': {
    Space: '空間の法則',
    Survival: '生存の法則',
    Cognition: '認知の法則',
    Scarcity: '希少性の法則',
    Time: '時間の法則',
    Power: '権力の法則',
    Metaphysics: '形而上学の法則',
  },
};
```

### 步骤 4: 更新 LLM 语言指令

编辑 `web/config/llm-language.ts`：

```typescript
export const LLM_LANGUAGE_INSTRUCTIONS: Record<Locale, string> = {
  'zh-CN': '...',
  'en': '...',
  'ja': 'IMPORTANT: You MUST respond in Japanese (日本語). All text output must be in Japanese.',
};
```

### 完成！

现在用户可以在语言切换器中选择新语言，所有文本会自动切换。

---

## 💡 组件中使用翻译的最佳实践

### 方法 1: 使用 useTranslations（推荐）

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('Common');
  const tHome = useTranslations('HomePage');

  return (
    <div>
      <button>{t('submit')}</button>
      <h1>{tHome('title')}</h1>
    </div>
  );
}
```

### 方法 2: 使用封装的 Hook

```typescript
import { useCommonTranslations } from '@/lib/utils/translations';

function MyComponent() {
  const { common, home } = useCommonTranslations();

  return (
    <div>
      <button>{common('submit')}</button>
      <h1>{home('title')}</h1>
    </div>
  );
}
```

### 方法 3: 获取法则名称

```typescript
import { getLawName } from '@/config/law-names';
import { useI18n } from '@/components/providers/I18nProvider';

function LawDisplay({ law }: { law: Law }) {
  const { locale } = useI18n();
  const lawName = getLawName(law, locale);

  return <div>{lawName}</div>;
}
```

---

## 📋 完整的翻译键列表

### Common（通用）
- `loading`, `error`, `success`, `confirm`, `cancel`
- `save`, `delete`, `edit`, `close`, `back`, `next`
- `submit`, `search`, `filter`, `reset`, `refresh`
- `pleaseWait`, `generating`, `analyzing`

### HomePage（主页）
- `title`, `subtitle`, `description`
- `worldDescriptionLabel`, `worldDescriptionPlaceholder`
- `artStyleLabel`, `selectArtStyle`
- `recommendMode`, `normalMode`, `startButton`
- `pleaseEnterDescription`, `pleaseSelectArtStyle`
- `tipTitle`, `tipContent`
- `experts.*` (geologist, anthropologist, linguist, economist, historian, military_expert)

### GameAnalysis（游戏分析）
- `title`, `analyzing`, `analyzingSubtitle`
- `selectGames`, `searchGames`, `noGamesSelected`
- `analysisResult`, `commonElements`, `differences`
- `worldBuildingInsights`, `premiseSummary`

### GameRecommend（游戏推荐）
- `title`, `recommending`, `recommendingSubtitle`
- `recommendedGames`, `noRecommendations`, `reason`
- `searchingGames`, `loadingDetails`

### Loading（加载动画）
- `validatingPremise`, `analyzingExperts`
- `generatingRules`, `analyzingGames`, `recommendingGames`
- `processing`, `loading`, `pleaseWait`

### Auth（认证）
- `loginTitle`, `registerTitle`, `email`, `password`
- `confirmPassword`, `forgotPassword`
- `noAccount`, `hasAccount`
- `loginButton`, `registerButton`
- `loginSuccess`, `registerSuccess`, `loginError`, `registerError`
- `emailPlaceholder`, `passwordPlaceholder`, `confirmPasswordPlaceholder`
- `passwordMismatch`, `invalidEmail`, `passwordTooShort`

### Validation（验证）
- `title`, `premise`, `corePremise`, `rule`
- `validate`, `validating`, `validationResult`
- `score`, `feedback`, `uniquenessScore`
- `coreAnomaly`, `lawImpacts`, `eraserTest`
- `warnings`, `recommendations`
- `structural`, `decorative`

### Laws（法则）
- `Space`, `Survival`, `Cognition`, `Scarcity`
- `Time`, `Power`, `Metaphysics`

### Archive（归档）
- `title`, `saveArchive`, `loadArchive`, `deleteArchive`
- `archiveName`, `createdAt`, `noArchives`
- `confirmDelete`, `saveSuccess`, `loadSuccess`, `deleteSuccess`

### Rules（规则）
- `generateRules`, `regenerate`, `rulesList`
- `noRules`, `ruleDescription`, `ruleImpact`

---

## 🔍 查找需要翻译的文本

如果您发现某个页面有硬编码的中文，按以下步骤处理：

### 1. 确定文本属于哪个命名空间

- 通用按钮/标签 → `Common`
- 特定页面的文本 → 对应的命名空间（如 `HomePage`, `GameAnalysis`）
- 加载动画文本 → `Loading`

### 2. 在翻译文件中添加键值对

```json
{
  "Common": {
    "newButton": "新按钮"  // 添加新的翻译键
  }
}
```

### 3. 在组件中使用

```typescript
const t = useTranslations('Common');
<button>{t('newButton')}</button>
```

---

## ⚠️ 注意事项

### 1. 翻译键命名规范

- 使用 camelCase：`pleaseWait`, `startButton`
- 清晰描述用途：`pleaseEnterDescription` 而不是 `error1`
- 嵌套使用点号：`experts.geologist`

### 2. 保持所有语言文件同步

当您添加新的翻译键时，确保在所有语言文件中都添加：
- `zh-CN.json` ✅
- `en.json` ✅
- `ja.json` ✅（如果有）

### 3. 避免硬编码文本

❌ 错误：
```typescript
<button>提交</button>
<p>加载中...</p>
```

✅ 正确：
```typescript
const t = useTranslations('Common');
<button>{t('submit')}</button>
<p>{t('loading')}</p>
```

---

## 🎨 示例：完整的组件国际化

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useI18n } from '@/components/providers/I18nProvider';
import { getLawName } from '@/config/law-names';

export default function MyComponent() {
  // 获取翻译函数
  const t = useTranslations('Common');
  const tHome = useTranslations('HomePage');
  const tLoading = useTranslations('Loading');

  // 获取当前语言
  const { locale } = useI18n();

  // 获取法则名称
  const spaceLawName = getLawName('Space', locale);

  return (
    <div>
      {/* 通用文本 */}
      <button>{t('submit')}</button>
      <button>{t('cancel')}</button>

      {/* 页面特定文本 */}
      <h1>{tHome('title')}</h1>
      <p>{tHome('subtitle')}</p>

      {/* 加载文本 */}
      <LoadingSpinner
        title={tLoading('processing')}
        subtitle={tLoading('pleaseWait')}
      />

      {/* 法则名称 */}
      <div>{spaceLawName}</div>
    </div>
  );
}
```

---

## 📚 相关文件

- 类型定义：`web/types/i18n.ts`
- 翻译文件：`web/messages/*.json`
- 法则配置：`web/config/law-names.ts`
- LLM 配置：`web/config/llm-language.ts`
- 工具函数：`web/lib/utils/translations.ts`
- 完整文档：`web/docs/I18N_GUIDE.md`

---

**最后更新**: 2026-02-06
