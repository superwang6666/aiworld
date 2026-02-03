# 快速参考

## 📦 NPM 脚本

```bash
# 开发
npm run dev              # 启动开发服务器 (端口 8000)
npm run build            # 构建生产版本
npm run start            # 启动生产服务器

# 代码质量
npm run lint             # 运行 ESLint 检查
npm run lint:fix         # 自动修复 ESLint 问题
npm run type-check       # TypeScript 类型检查
npm run audit:code       # 完整代码审计 (lint + type-check)

# 代码分析
npm run check:unused     # 检测未使用的导出
npm run check:duplicates # 检测重复代码
```

## 📁 项目结构速查

```
web/
├── app/                 # Next.js 页面和 API
│   ├── api/            # API 路由
│   └── page.tsx        # 主页面
├── components/         # React 组件
├── config/            # 配置文件
│   ├── law-names.ts   # 法则配置
│   └── constants.ts   # 常量
├── lib/               # 业务逻辑
│   ├── utils/        # 工具函数
│   ├── deac/         # DEAC 系统
│   ├── experts/      # 专家分析
│   ├── laws/         # 法则逻辑
│   ├── rules/        # 规则处理
│   └── tags/         # 标签系统
└── types/            # TypeScript 类型
    └── index.ts      # 所有共享类型
```

## 🎯 常用导入

```typescript
// 类型
import { GameInfo, WorldRule, Law } from '@/types';

// 配置
import { LAWS, LAW_NAMES, LAW_NAME_MAP } from '@/config/law-names';

// 工具函数
import { validateRule } from '@/lib/rules/validator';
import { generateTags } from '@/lib/tags/tag-generator';
```

## 📝 代码规范要点

### 导入顺序
1. React/Next.js
2. 第三方库
3. 类型定义
4. 配置/常量
5. 工具函数
6. 组件

### 命名规范
- 组件：`PascalCase`
- 函数：`camelCase`
- 常量：`UPPER_SNAKE_CASE`
- 文件：组件用 `PascalCase.tsx`，其他用 `kebab-case.ts`

### 禁止事项
- ❌ 重复定义类型
- ❌ 硬编码魔法数字
- ❌ 使用 `any` 类型
- ❌ 使用 `alert()`
- ❌ 注释掉的代码

## 🔍 Claude Code 常用命令

```bash
/review                  # 代码审查
/help                    # 获取帮助

# 常用提示
"审查这段代码"
"检查是否有未使用的代码"
"重构这个函数"
"解释这段代码的工作原理"
"优化性能"
```

## ✅ 提交前检查清单

- [ ] `npm run lint` 通过
- [ ] `npm run type-check` 通过
- [ ] `npm run build` 成功
- [ ] 删除了旧代码
- [ ] 清理了未使用的导入
- [ ] 遵循代码规范

## 📚 文档

- 完整代码规范：`CODE_STANDARDS.md`
- Claude Code 指南：`CLAUDE_CODE_GUIDE.md`
- PR 模板：`.github/PULL_REQUEST_TEMPLATE.md`

## 🔗 快速链接

- [Next.js 文档](https://nextjs.org/docs)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [React 文档](https://react.dev/)
