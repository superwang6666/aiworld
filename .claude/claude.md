# 代码规范文档

> aiWolrld - World-Building Engine v2.0 代码组织规范、命名约定和最佳实践

## 📁 项目结构

```
web/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由（后端逻辑）
│   │   ├── auth/                 # 身份认证 API
│   │   ├── deac/                 # DEAC 专家系统 API
│   │   │   ├── dispatch/         # 派遣专家
│   │   │   ├── analyze-gap/      # 分析知识差距
│   │   │   └── synthesize/       # 合成专家意见
│   │   ├── tags/                 # 标签系统 API
│   │   ├── archive/              # 存档管理 API
│   │   ├── generate/             # 规则生成
│   │   ├── generate-single/      # 单规则生成
│   │   ├── validate-premise/     # 核心设定验证
│   │   ├── analyze-games/        # 游戏分析
│   │   ├── recommend-games/      # 游戏推荐
│   │   ├── game-search/          # 游戏搜索
│   │   ├── evaluate-directions/  # 方向评估
│   │   └── merge-premise/        # 合并前提
│   ├── auth/                     # 认证页面（登录/注册/重置）
│   ├── validation/               # 验证详情页面
│   ├── layout.tsx                # 根布局（集成 Auth + I18n）
│   ├── page.tsx                  # 主页面（4步工作流）
│   └── globals.css               # 全局样式（深色主题）
│
├── components/                   # React 组件
│   ├── auth/                     # 认证组件（LoginForm, RegisterForm, UserMenu）
│   ├── common/                   # 通用组件（CommonHeader, LanguageSwitcher, LawCard）
│   ├── providers/                # Context Providers（I18nProvider）
│   ├── validation/               # 验证流程组件
│   │   └── advanced-analysis/    # 高级分析子组件
│   ├── workflow/                 # 工作流组件（RulesDisplay）
│   ├── HomePage.tsx              # 主页组件
│   ├── RuleCard.tsx              # 规则卡片
│   ├── ArchiveManager.tsx        # 存档管理器
│   ├── GameAnalysisResult.tsx    # 游戏分析结果
│   └── PremiumBackground.tsx     # 背景特效
│
├── config/                       # 配置文件（常量、配置项）
│   ├── law-names.ts              # 七法则配置（名称、颜色、多语言）
│   ├── academic-disciplines.ts   # 学术学科分类
│   ├── art-styles.ts             # 艺术风格配置
│   ├── evaluation-rules.ts       # 评估规则
│   ├── game-source-config.ts     # 游戏来源配置（RAWG API）
│   ├── world-directions.ts       # 世界方向配置
│   ├── predefined-tags.ts        # 预定义标签池
│   └── llm-language.ts           # LLM 语言配置
│
├── lib/                          # 业务逻辑和工具函数
│   ├── utils/                    # 通用工具函数
│   │   ├── openai-client.ts      # OpenAI/DeepSeek 统一客户端
│   │   ├── api-client.ts         # 前端 API 调用封装
│   │   ├── logger.ts             # 日志工具
│   │   ├── prompt-loader.ts      # 提示词加载器
│   │   ├── llm-language.ts       # LLM 语言检测
│   │   ├── translations.ts       # 客户端翻译
│   │   └── server-translations.ts# 服务端翻译
│   ├── deac/                     # DEAC 专家系统核心
│   │   ├── index.ts              # 主导出
│   │   ├── background-service.ts # 后台异步分析
│   │   ├── cache-manager.ts      # 专家缓存
│   │   └── weighted-synthesis.ts # 权重合成
│   ├── experts/                  # 专家管理
│   │   ├── loader.ts             # 核心专家加载
│   │   ├── orchestrator.ts       # 专家编排（主入口）
│   │   ├── expert-matcher.ts     # 专家匹配
│   │   ├── gap-analyzer.ts       # 差距分析
│   │   └── prompt-architect.ts   # 动态提示词生成
│   ├── auth/                     # 身份认证
│   │   ├── auth-config.ts        # NextAuth.js 配置
│   │   ├── user-service.ts       # 用户服务
│   │   ├── email-service.ts      # 邮件服务
│   │   ├── password-utils.ts     # 密码工具
│   │   └── middleware.ts         # 认证中间件
│   ├── archive/                  # 存档系统
│   │   ├── archive-manager.ts    # 存档管理器
│   │   ├── archive-operations.ts # 存档操作
│   │   └── discipline-mapper.ts  # 学科映射
│   ├── generation/               # 规则生成
│   │   └── generation-handler.ts # 生成处理器
│   ├── validation/               # 验证系统
│   │   └── validation-handler.ts # 验证处理器
│   ├── laws/                     # 法则逻辑
│   │   └── weight-calculator.ts  # 权重计算
│   ├── rules/                    # 规则管理
│   │   ├── rule-manager.ts       # 规则管理器
│   │   ├── rule-deduplicator.ts  # 规则去重
│   │   └── semantic-matcher.ts   # 语义匹配
│   ├── tags/                     # 标签系统
│   │   ├── tag-manager.ts        # 标签管理器
│   │   ├── tag-generator.ts      # 标签生成
│   │   ├── prediction-engine.ts  # 偏好预测
│   │   └── keywords-i18n.ts      # 多语言关键词
│   └── export/                   # 导出功能
│       └── export-handler.ts
│
├── types/                        # TypeScript 类型定义
│   ├── index.ts                  # 所有共享类型（380+行，主类型文件）
│   ├── auth.ts                   # 认证相关类型
│   ├── i18n.ts                   # 国际化类型
│   └── world-directions.ts       # 世界方向类型
│
├── messages/                     # 国际化翻译文件
│   ├── zh-CN.json                # 中文（默认）
│   └── en.json                   # 英文
│
├── archive/                      # 存档数据（本地文件系统）
│   ├── index.json                # 存档索引
│   └── worlds/                   # 世界存档 JSON 文件
│
├── data/                         # 本地用户数据
│   └── users/
│       ├── users.json
│       └── tokens.json
│
└── __tests__/                    # 测试套件
    └── components/
```

---

## 🏗️ 核心系统架构

### 用户工作流（4步）

```
① 输入核心设定（或游戏推荐）
        ↓
② 验证前提（ValidationPagePremium）
   ├── 核心异常检测
   ├── 多米诺效应分析
   ├── 橡皮擦测试
   └── DEAC 专家系统（异步后台运行）
        ↓
③ 规则生成（RulesDisplay）
   ├── 按七法则生成规则
   ├── 确认 / 删除 / 重新生成
   └── 标签自动标注
        ↓
④ 存档 & 导出
```

### 七法则

```typescript
// config/law-names.ts
type Law = 'Space' | 'Survival' | 'Cognition' | 'Scarcity' | 'Time' | 'Power' | 'Metaphysics';
```

### DEAC 专家系统流程

```
核心设定 → 差距分析(gap-analyzer) → 专家匹配(expert-matcher)
        → 提示词构造(prompt-architect) → LLM 调用
        → 权重合成(weighted-synthesis) → DEACAnalysis 输出
```

---

## 🎯 核心原则

### 1. 单一数据源 (Single Source of Truth)

所有跨文件共享类型必须定义在 `types/index.ts`，不得在组件内重复定义。

```typescript
// ✅ 正确：从 types/index.ts 导入
import { GameInfo, WorldRule, DEACAnalysis } from '@/types';

// ❌ 错误：在组件内重复定义已存在的类型
interface GameInfo { id: number; name: string; }
```

### 2. 配置集中管理

| 配置类型 | 文件位置 |
|---------|---------|
| 七法则（名称/颜色/多语言） | `config/law-names.ts` |
| 学术学科分类 | `config/academic-disciplines.ts` |
| 艺术风格 | `config/art-styles.ts` |
| 预定义标签 | `config/predefined-tags.ts` |
| 游戏来源（RAWG） | `config/game-source-config.ts` |

### 3. LLM 客户端统一管理

**必须使用 `lib/utils/openai-client.ts`**，禁止在 API 路由中直接实例化 OpenAI 客户端：

```typescript
// ✅ 正确
import { getOpenAIClient } from '@/lib/utils/openai-client';
const { openai, model } = getOpenAIClient();

// ❌ 错误
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

### 4. 避免重复代码 (DRY)

同样逻辑出现 2 次以上，提取为函数或组件。

---

## 📝 类型定义规范

### 核心类型速查（types/index.ts）

| 分类 | 主要类型 |
|------|---------|
| 法则系统 | `Law`, `LawWeight`, `LawMapping` |
| 规则系统 | `WorldRule`, `GenerationRequest`, `GenerationOptions` |
| 验证系统 | `ValidationResult`, `LawImpact`, `EraserTest` |
| DEAC 专家 | `ExpertConfig`, `ExpertResponse`, `GapAnalysis`, `DEACAnalysis`, `DEACContext` |
| 标签系统 | `RuleTag`, `TagGenerationRequest`, `TagGenerationResponse` |
| 学科系统 | `AcademicDiscipline`, `DisciplineCoverage` |
| 存档系统 | `WorldArchive`, `ArchiveMetadata` |
| 游戏分析 | `GameInfo`, `GameAnalysis`, `ComparativeAnalysis` |

### 组件内部类型

仅单组件使用的 Props 类型可以本地定义：

```typescript
interface MyComponentProps {
  title: string;
  onClose: () => void;
}
```

---

## 🔧 配置和常量

### 法则相关

```typescript
import { LAWS, LAW_NAMES, LAW_NAME_MAP } from '@/config/law-names';
// LAWS: 完整法则对象数组（含颜色、多语言名称）
// LAW_NAMES: 仅法则名称数组
// LAW_NAME_MAP: 英文 -> 中文映射
```

### 禁止魔法数字

```typescript
// ❌ 错误
if (similarity > 70) { ... }

// ✅ 正确：在 config/ 中定义，然后导入
import { SIMILARITY_THRESHOLD } from '@/config/constants';
if (similarity > SIMILARITY_THRESHOLD) { ... }
```

---

## 📦 导入顺序

```typescript
// 1. React 和 Next.js 核心库
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. 第三方库
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

// 3. 类型定义
import { WorldRule, DEACAnalysis } from '@/types';

// 4. 配置和常量
import { LAWS } from '@/config/law-names';

// 5. 工具函数和业务逻辑
import { getOpenAIClient } from '@/lib/utils/openai-client';
import { generateTags } from '@/lib/tags/tag-generator';

// 6. 组件
import RuleCard from '@/components/RuleCard';
```

---

## 🌐 国际化规范

项目使用 **next-intl v4**，支持中文（默认）和英文。

```typescript
// 服务端组件
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('namespace');

// 客户端组件
import { useTranslations } from 'next-intl';
const t = useTranslations('namespace');
```

**翻译文件路径**：`messages/zh-CN.json`、`messages/en.json`

禁止在组件中硬编码中文/英文字符串，所有用户可见文本必须走 i18n。

---

## 🎨 命名规范

### 文件命名

- **组件文件**：PascalCase — `RuleCard.tsx`, `ValidationPagePremium.tsx`
- **工具/业务逻辑**：kebab-case — `tag-generator.ts`, `archive-operations.ts`
- **API 路由**：kebab-case 目录 — `validate-premise/route.ts`
- **配置文件**：kebab-case — `law-names.ts`, `art-styles.ts`

### 变量和函数命名

- **组件**：PascalCase — `ExpertInsightsPanel`
- **函数**：camelCase — `generateRule`, `validatePremise`
- **常量**：UPPER_SNAKE_CASE — `MAX_RETRIES`, `SIMILARITY_THRESHOLD`
- **类型/接口**：PascalCase — `WorldArchive`, `DEACContext`
- **布尔值**：`is`/`has`/`should` 前缀 — `isLoading`, `hasError`

---

## 🔄 API 路由规范

### 路由模板

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/utils/openai-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.requiredField) {
      return NextResponse.json({ error: 'Missing required field' }, { status: 400 });
    }

    const { openai, model } = getOpenAIClient();
    // ... 业务逻辑

    return NextResponse.json({ success: true, data: result });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('API Error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

### 主要 API 端点速查

| 分类 | 路径 | 方法 |
|------|------|------|
| 规则生成 | `/api/generate` | POST |
| 单规则生成 | `/api/generate-single` | POST |
| 前提验证 | `/api/validate-premise` | POST |
| DEAC 派遣专家 | `/api/deac/dispatch` | POST |
| DEAC 差距分析 | `/api/deac/analyze-gap` | POST |
| DEAC 合成 | `/api/deac/synthesize` | POST |
| 标签生成 | `/api/tags/generate` | POST |
| 标签权重更新 | `/api/tags/update-weights` | POST |
| 存档保存 | `/api/archive/save` | POST |
| 存档加载 | `/api/archive/load` | GET |
| 存档列表 | `/api/archive/list` | GET |
| 游戏搜索 | `/api/game-search` | POST |
| 方向评估 | `/api/evaluate-directions` | POST |

---

## 🧪 组件规范

### 组件结构

```typescript
'use client';

// 导入（按顺序）
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { WorldRule } from '@/types';

// Props 类型（仅本组件使用时本地定义）
interface MyComponentProps {
  rules: WorldRule[];
  onSave: () => void;
}

export default function MyComponent({ rules, onSave }: MyComponentProps) {
  // 状态
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('MyComponent');

  // 事件处理
  const handleSave = async () => { ... };

  // 渲染
  return <div>...</div>;
}
```

### 组件拆分原则

- 单组件不超过 **300 行**
- 多个独立功能 → 拆分子组件（参考 `validation/advanced-analysis/`）
- 复杂逻辑 → 提取为自定义 Hook

---

## 🚫 禁止事项

| 禁止 | 替代方案 |
|------|---------|
| `data as string`（不确定类型时） | 使用类型守卫 `typeof data === 'string'` |
| `function f(x: any)` | 使用 `unknown` + 类型收窄 |
| `alert('...')` | 使用 `setError()`  或 Toast 组件 |
| 注释掉的旧代码 | 直接删除，用 Git 历史查找 |
| 组件内硬编码中英文字符串 | 使用 `t('key')` i18n 函数 |
| 直接 `new OpenAI(...)` | 使用 `getOpenAIClient()` |

---

## ✅ 重构 Checklist

- [ ] 新代码已实现并测试通过
- [ ] 旧代码已完全删除（无注释残留）
- [ ] 相关导入已清理（无未使用导入）
- [ ] 类型定义已更新（`types/index.ts`）
- [ ] i18n 字符串已添加到翻译文件
- [ ] ESLint 检查通过（`npm run lint`）
- [ ] TypeScript 编译无报错
- [ ] 构建成功（`npm run build`）

---

## 🛠️ 工具配置

```bash
# 开发服务器（端口 8000）
npm run dev

# 代码检查
npm run lint

# 类型检查
npx tsc --noEmit

# 测试
npm run test
```

**技术栈**：Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · NextAuth v5 · next-intl v4 · OpenAI SDK v6 · motion v12

---

**最后更新**: 2026-03-04
