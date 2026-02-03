# 代码规范文档

> 本文档定义了项目的代码组织规范、命名约定和最佳实践

## 📁 项目结构

```
web/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   └── page.tsx           # 页面组件
├── components/            # React 组件
│   ├── imports/          # 第三方组件封装
│   └── validation/       # 验证相关组件
├── config/               # 配置文件（常量、配置项）
│   ├── law-names.ts     # 法则配置（名称、颜色等）
│   └── constants.ts     # 其他常量
├── lib/                  # 业务逻辑和工具函数
│   ├── utils/           # 通用工具函数
│   ├── deac/            # DEAC 专家系统
│   ├── experts/         # 专家分析模块
│   ├── laws/            # 法则相关逻辑
│   ├── rules/           # 规则处理逻辑
│   └── tags/            # 标签系统
└── types/               # TypeScript 类型定义
    └── index.ts         # 所有共享类型
```

---

## 🎯 核心原则

### 1. **单一数据源 (Single Source of Truth)**

❌ **错误示例**：
```typescript
// components/GameCard.tsx
interface GameInfo {
  id: number;
  name: string;
}

// components/GameList.tsx
interface GameInfo {  // 重复定义！
  id: number;
  name: string;
}
```

✅ **正确示例**：
```typescript
// types/index.ts
export interface GameInfo {
  id: number;
  name: string;
}

// components/GameCard.tsx
import { GameInfo } from '@/types';
```

### 2. **配置集中管理**

❌ **错误示例**：
```typescript
// 在多个文件中硬编码
const LAWS = ['Space', 'Survival', ...];
```

✅ **正确示例**：
```typescript
// config/law-names.ts
export const LAWS = [...];

// 其他文件导入使用
import { LAWS } from '@/config/law-names';
```

### 3. **避免重复代码 (DRY - Don't Repeat Yourself)**

如果同样的逻辑出现 2 次以上，应该提取为函数或组件。

---

## 📝 类型定义规范

### 共享类型

**所有跨文件使用的类型必须定义在 `types/index.ts`**

```typescript
// types/index.ts
export interface GameInfo {
  id: number;
  name: string;
  // ...
}

export interface WorldRule {
  id: string;
  law: Law;
  // ...
}

export type Law = 'Space' | 'Survival' | 'Cognition' | 'Scarcity' | 'Time' | 'Power' | 'Metaphysics';
```

### 组件内部类型

仅在单个组件内使用的类型可以本地定义：

```typescript
// components/MyComponent.tsx
interface MyComponentProps {
  title: string;
  onClose: () => void;
}

export default function MyComponent({ title, onClose }: MyComponentProps) {
  // ...
}
```

---

## 🔧 配置和常量

### 法则相关配置

**统一使用 `config/law-names.ts`**

```typescript
import { LAWS, LAW_NAMES, LAW_NAME_MAP } from '@/config/law-names';

// LAWS: 完整的法则对象数组
// LAW_NAMES: 仅法则名称数组
// LAW_NAME_MAP: 英文 -> 中文映射
```

### 其他常量

创建 `config/constants.ts` 存放其他配置：

```typescript
// config/constants.ts
export const API_TIMEOUT = 30000;
export const MAX_RULES = 20;
export const SIMILARITY_THRESHOLD = 70;
```

**禁止魔法数字**：

❌ 错误：
```typescript
if (similarity > 70) { ... }
```

✅ 正确：
```typescript
import { SIMILARITY_THRESHOLD } from '@/config/constants';
if (similarity > SIMILARITY_THRESHOLD) { ... }
```

---

## 📦 导入顺序

**严格按照以下顺序导入**：

```typescript
// 1. React 和 Next.js 核心库
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. 第三方库
import { Loader2, Search } from 'lucide-react';
import { motion } from 'motion/react';

// 3. 类型定义
import { GameInfo, WorldRule } from '@/types';

// 4. 配置和常量
import { LAWS } from '@/config/law-names';

// 5. 工具函数和业务逻辑
import { validateRule } from '@/lib/rules/validator';
import { generateTags } from '@/lib/tags/tag-generator';

// 6. 组件
import RuleCard from '@/components/RuleCard';

// 7. 样式（如果有）
import styles from './styles.module.css';
```

---

## 🎨 命名规范

### 文件命名

- **组件文件**：PascalCase - `GameCard.tsx`, `RuleList.tsx`
- **工具函数**：kebab-case - `tag-generator.ts`, `json-cleaner.ts`
- **API 路由**：kebab-case - `generate-single/route.ts`
- **配置文件**：kebab-case - `law-names.ts`, `constants.ts`

### 变量和函数命名

- **组件**：PascalCase - `GameCard`, `ValidationPage`
- **函数**：camelCase - `generateRule`, `validatePremise`
- **常量**：UPPER_SNAKE_CASE - `MAX_RETRIES`, `API_TIMEOUT`
- **类型/接口**：PascalCase - `GameInfo`, `WorldRule`
- **枚举值**：PascalCase - `Law.Space`, `Status.Pending`

### 布尔值命名

使用 `is`, `has`, `should` 前缀：

```typescript
const isLoading = true;
const hasError = false;
const shouldValidate = true;
```

---

## 🔄 API 路由规范

### 统一的错误处理

**创建 `lib/utils/api-helpers.ts`**：

```typescript
export function getOpenAIClient() {
  const deepSeekKey = process.env.DEEPSEEK_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!deepSeekKey && !openAiKey) {
    throw new Error('API key not configured');
  }

  // ... 统一的客户端初始化逻辑
}

export function cleanAIJsonResponse(content: string): string {
  // ... 统一的 JSON 清理逻辑
}
```

### API 路由模板

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient, cleanAIJsonResponse } from '@/lib/utils/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证输入
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Missing required field' },
        { status: 400 }
      );
    }

    // 业务逻辑
    const { openai, model } = getOpenAIClient();
    // ...

    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🧪 组件规范

### 组件结构

```typescript
'use client';

// 1. 导入（按顺序）
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GameInfo } from '@/types';

// 2. 类型定义
interface MyComponentProps {
  title: string;
  onSubmit: (data: GameInfo) => void;
}

// 3. 组件实现
export default function MyComponent({ title, onSubmit }: MyComponentProps) {
  // 3.1 状态定义
  const [isLoading, setIsLoading] = useState(false);

  // 3.2 副作用
  useEffect(() => {
    // ...
  }, []);

  // 3.3 事件处理函数
  const handleSubmit = async () => {
    // ...
  };

  // 3.4 渲染
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### 组件拆分原则

- 单个组件不超过 300 行
- 如果组件包含多个独立功能，拆分为子组件
- 如果逻辑复杂，提取为自定义 Hook

---

## 🚫 禁止事项

### 1. 禁止类型断言滥用

❌ 错误：
```typescript
const value = data as string;  // 不确定类型时强制断言
```

✅ 正确：
```typescript
if (typeof data === 'string') {
  const value = data;  // 类型守卫
}
```

### 2. 禁止 any 类型

❌ 错误：
```typescript
function process(data: any) { ... }
```

✅ 正确：
```typescript
function process(data: unknown) {
  if (isValidData(data)) {
    // 类型收窄后使用
  }
}
```

### 3. 禁止直接使用 alert()

❌ 错误：
```typescript
alert('操作失败');
```

✅ 正确：
```typescript
setError('操作失败');  // 使用状态管理
// 或使用 Toast 组件
```

### 4. 禁止注释掉的代码

❌ 错误：
```typescript
// const oldFunction = () => { ... }
// 旧的实现，暂时保留
```

✅ 正确：
- 删除无用代码
- 使用 Git 历史查看旧代码

---

## ✅ 重构 Checklist

每次重构时必须检查：

- [ ] 新代码已实现并测试通过
- [ ] 旧代码已完全删除
- [ ] 相关导入已清理
- [ ] 类型定义已更新
- [ ] 没有遗留的注释代码
- [ ] ESLint 检查通过
- [ ] 构建成功

---

## 🔍 代码审查要点

### 自我审查（提交前）

1. **检查重复代码**
   - 是否有相同逻辑在多处出现？
   - 能否提取为函数或组件？

2. **检查类型定义**
   - 是否重复定义了已存在的类型？
   - 类型是否应该放在 `types/index.ts`？

3. **检查导入**
   - 是否有未使用的导入？
   - 导入顺序是否正确？

4. **检查命名**
   - 变量名是否清晰表达意图？
   - 是否使用了魔法数字？

### Claude Code 审查（使用 /review 命令）

当使用 Claude Code 进行开发时：

```bash
# 提交前让 Claude 审查代码
/review
```

Claude 会检查：
- 代码质量和最佳实践
- 潜在的 bug 和安全问题
- 性能优化建议
- 代码规范遵守情况

---

## 🛠️ 工具配置

### ESLint

项目已配置 ESLint，运行检查：

```bash
npm run lint
```

### TypeScript

严格模式已启用，确保类型安全。

### Git Hooks

使用 pre-commit hook 自动检查：
- ESLint 检查
- TypeScript 类型检查
- 代码格式化

---

## 📚 学习资源

- [Next.js 文档](https://nextjs.org/docs)
- [React TypeScript 最佳实践](https://react-typescript-cheatsheet.netlify.app/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

## 🔄 文档更新

本文档会随着项目演进持续更新。如果发现规范不合理或需要补充，请及时更新。

**最后更新**: 2026-02-04
