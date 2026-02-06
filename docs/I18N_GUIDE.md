# 国际化系统使用文档

> 本文档介绍如何使用项目的国际化（i18n）系统

## 📋 目录

- [系统概述](#系统概述)
- [快速开始](#快速开始)
- [组件中使用翻译](#组件中使用翻译)
- [API 路由中使用语言参数](#api-路由中使用语言参数)
- [添加新语言](#添加新语言)
- [配置说明](#配置说明)
- [最佳实践](#最佳实践)

---

## 系统概述

项目使用 `next-intl` 实现完整的国际化支持，包括：

- ✅ 静态文本翻译（组件、页面）
- ✅ 动态内容翻译（法则名称、配置项）
- ✅ LLM 输出语言控制
- ✅ 语言切换和持久化
- ✅ 类型安全的翻译键

**当前支持的语言**：
- 🇨🇳 简体中文 (zh-CN) - 默认
- 🇺🇸 英文 (en)

---

## 快速开始

### 1. 语言切换

用户可以通过页面右上角的语言切换器切换语言：

```
CommonHeader 组件 → LanguageSwitcher 组件 → 下拉选择语言
```

语言选择会自动保存到 `localStorage`，下次访问时自动恢复。

### 2. 在组件中使用翻译

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('Common');

  return (
    <div>
      <button>{t('submit')}</button>
      <p>{t('loading')}</p>
    </div>
  );
}
```

### 3. 获取当前语言

```typescript
import { useI18n } from '@/components/providers/I18nProvider';

function MyComponent() {
  const { locale, setLocale } = useI18n();

  // locale: 'zh-CN' | 'en'
  // setLocale: (locale: Locale) => void

  return <div>当前语言: {locale}</div>;
}
```

---

## 组件中使用翻译

### 基础用法

```typescript
import { useTranslations } from 'next-intl';

function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <button>{t('startButton')}</button>
    </div>
  );
}
```

### 嵌套翻译键

```typescript
const t = useTranslations('HomePage');

// 访问嵌套的专家名称
const expertName = t('experts.geologist'); // "地质学家" 或 "Geologist"
```

### 使用法则名称

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

## API 路由中使用语言参数

### 接收语言参数

所有 LLM API 路由都应该接收 `locale` 参数：

```typescript
import { Locale, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/types/i18n';
import { createLanguageAwareSystemPrompt } from '@/lib/utils/llm-language';

export async function POST(request: NextRequest) {
  const { corePremise, locale: requestLocale } = await request.json();

  // 验证并获取语言设置
  const locale: Locale =
    requestLocale && SUPPORTED_LOCALES.includes(requestLocale)
      ? requestLocale
      : DEFAULT_LOCALE;

  // 添加语言指令到系统提示词
  const systemPrompt = createLanguageAwareSystemPrompt(BASE_PROMPT, locale);

  // 使用 systemPrompt 调用 LLM...
}
```

### 客户端调用 API

使用 `postWithLocale` 工具函数自动传递语言参数：

```typescript
import { postWithLocale } from '@/lib/utils/api-client';

async function validatePremise(corePremise: string) {
  const response = await postWithLocale('/api/validate-premise', {
    corePremise
  });
  // locale 参数会自动添加

  return response.json();
}
```

或手动传递：

```typescript
import { useI18n } from '@/components/providers/I18nProvider';

function MyComponent() {
  const { locale } = useI18n();

  const handleSubmit = async () => {
    const response = await fetch('/api/validate-premise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        corePremise: '...',
        locale // 手动传递
      })
    });
  };
}
```

---

## 添加新语言

### 1. 更新类型定义

编辑 `web/types/i18n.ts`：

```typescript
export type Locale = 'zh-CN' | 'en' | 'ja'; // 添加 'ja'

export const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en', 'ja'];

export const LOCALE_NAMES: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'en': 'English',
  'ja': '日本語', // 添加日语
};

export const LOCALE_SHORT_NAMES: Record<Locale, string> = {
  'zh-CN': '中',
  'en': 'EN',
  'ja': 'JP', // 添加日语简称
};
```

### 2. 创建翻译文件

创建 `web/messages/ja.json`：

```json
{
  "Common": {
    "appName": "Make GAME World",
    "loading": "読み込み中...",
    "submit": "送信",
    ...
  },
  ...
}
```

### 3. 更新法则名称

编辑 `web/config/law-names.ts`：

```typescript
export const LAW_NAME_MAP: Record<Locale, Record<Law, string>> = {
  'zh-CN': { ... },
  'en': { ... },
  'ja': {
    Space: '空間の法則',
    Survival: '生存の法則',
    ...
  }
};
```

### 4. 更新 LLM 语言指令

编辑 `web/config/llm-language.ts`：

```typescript
export const LLM_LANGUAGE_INSTRUCTIONS: Record<Locale, string> = {
  'zh-CN': '...',
  'en': '...',
  'ja': 'IMPORTANT: You MUST respond in Japanese (日本語). All text output must be in Japanese.',
};
```

---

## 配置说明

### LLM 语言配置

编辑 `web/config/llm-language.ts` 来调整 LLM 语言行为：

```typescript
export const LLM_LANGUAGE_CONFIG = {
  // 是否启用语言强制指令
  enforceLanguage: true,

  // 语言指令插入位置
  // 'system_prompt_end' | 'user_prompt_start' | 'user_prompt_end'
  instructionPosition: 'system_prompt_end',

  // 是否在每次请求中重复语言指令
  repeatInstruction: true,
};
```

**配置说明**：

- `enforceLanguage`: 设置为 `false` 可以让 LLM 根据输入自动选择语言
- `instructionPosition`: 控制语言指令添加的位置
  - `system_prompt_end`: 在系统提示词末尾（推荐）
  - `user_prompt_start`: 在用户提示词开头
  - `user_prompt_end`: 在用户提示词末尾
- `repeatInstruction`: 设置为 `true` 可以提高语言一致性，但会增加 token 使用

---

## 最佳实践

### 1. 翻译键命名规范

使用清晰的命名空间和键名：

```json
{
  "HomePage": {
    "title": "...",
    "subtitle": "...",
    "startButton": "..."
  },
  "Auth": {
    "loginTitle": "...",
    "loginButton": "..."
  }
}
```

### 2. 避免硬编码文本

❌ 错误：
```typescript
<button>提交</button>
```

✅ 正确：
```typescript
const t = useTranslations('Common');
<button>{t('submit')}</button>
```

### 3. 组件中使用翻译

对于客户端组件：
```typescript
'use client';
import { useTranslations } from 'next-intl';
```

对于服务端组件：
```typescript
import { getTranslations } from 'next-intl/server';

async function MyServerComponent() {
  const t = await getTranslations('Common');
  return <div>{t('title')}</div>;
}
```

### 4. API 调用最佳实践

始终使用 `postWithLocale` 或手动传递 `locale` 参数：

```typescript
// 推荐：使用工具函数
import { postWithLocale } from '@/lib/utils/api-client';
await postWithLocale('/api/generate', { corePremise, artStyle });

// 或手动传递
const { locale } = useI18n();
await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ corePremise, artStyle, locale })
});
```

### 5. 翻译文件组织

按功能模块组织翻译键：

```
Common - 通用文本（按钮、标签等）
Header - 页头相关
HomePage - 主页专用
Auth - 认证相关
Validation - 验证相关
Laws - 法则名称
Archive - 归档管理
Rules - 规则相关
```

---

## 文件结构

```
web/
├── types/
│   └── i18n.ts                    # 类型定义
├── messages/
│   ├── zh-CN.json                 # 中文翻译
│   └── en.json                    # 英文翻译
├── config/
│   ├── law-names.ts               # 法则名称（多语言）
│   └── llm-language.ts            # LLM 语言配置
├── lib/
│   └── utils/
│       ├── llm-language.ts        # LLM 语言工具函数
│       └── api-client.ts          # API 调用工具
├── components/
│   ├── providers/
│   │   └── I18nProvider.tsx       # 国际化 Provider
│   └── common/
│       └── LanguageSwitcher.tsx   # 语言切换组件
├── app/
│   ├── layout.tsx                 # 根布局（集成 I18nProvider）
│   └── api/
│       ├── validate-premise/      # 已更新的 API
│       ├── generate/              # 已更新的 API
│       ├── generate-single/       # 已更新的 API
│       ├── analyze-games/         # 已更新的 API
│       ├── recommend-games/       # 已更新的 API
│       └── evaluate-directions/   # 已更新的 API
└── i18n.ts                        # next-intl 配置
```

---

## 已更新的 API 路由

以下 API 路由已支持语言参数：

- ✅ `/api/validate-premise` - 前提验证
- ✅ `/api/generate` - 规则生成
- ✅ `/api/generate-single` - 单条规则生成
- ✅ `/api/analyze-games` - 游戏分析
- ✅ `/api/recommend-games` - 游戏推荐
- ✅ `/api/evaluate-directions` - 方向评估

---

## 故障排除

### 问题：翻译不显示

**解决方案**：
1. 检查翻译键是否存在于 `messages/{locale}.json`
2. 确认命名空间是否正确
3. 检查组件是否在 `I18nProvider` 内部

### 问题：LLM 输出语言不正确

**解决方案**：
1. 确认 API 调用时传递了 `locale` 参数
2. 检查 `config/llm-language.ts` 中的语言指令
3. 尝试将 `enforceLanguage` 设置为 `true`
4. 检查 `instructionPosition` 配置

### 问题：语言切换后页面没有更新

**解决方案**：
1. 确认组件使用了 `useTranslations` hook
2. 检查 `I18nProvider` 是否正确加载新的翻译文件
3. 清除浏览器缓存和 localStorage

---

## 相关资源

- [next-intl 文档](https://next-intl-docs.vercel.app/)
- [项目代码规范](../.claude/CLAUDE.md)
- [类型定义](../types/i18n.ts)

---

**最后更新**: 2026-02-06
