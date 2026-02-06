# 📚 World-Building Engine v2.0 - 项目文件索引

> 快速文件定位参考 | 最后更新：2026-01-20

---

## 📋 项目概览

**项目名称**: World-Building Engine v2.0
**核心功能**: 基于七大法则的智能世界构建引擎
**技术栈**: Next.js 16.1.1 + React 19.2.3 + TypeScript + Tailwind CSS 4.1.18
**开发端口**: 8000
**AI集成**: DeepSeek API (主) + OpenAI API (备用)

### 七大世界构建法则
1. **空间法则** (Space) - 地理与物理
2. **生存法则** (Survival) - 生物与需求
3. **认知法则** (Cognition) - 语言与信仰
4. **稀缺法则** (Scarcity) - 经济与冲突
5. **时间法则** (Time) - 历史与侵蚀
6. **权力法则** (Power) - 政治与秩序
7. **形而上法则** (Metaphysics) - 核心异常

---

## 📁 目录结构树

```
web/
├── app/                    # Next.js App Router (主应用层)
│   ├── api/               # API 路由 (11个端点)
│   │   ├── deac/         # DEAC 专家系统 API (3个)
│   │   ├── analyze-games/
│   │   ├── game-search/
│   │   ├── generate/
│   │   └── validate-premise/
│   ├── page.tsx           # 主应用界面
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
│
├── components/             # React 组件 (4个)
│   ├── GameAnalysisStep.tsx
│   ├── ExpertInsightsPanel.tsx
│   ├── ValidationReport.tsx
│   └── RuleCard.tsx
│
├── lib/                    # 核心业务逻辑
│   ├── deac/              # DEAC 系统 (4个文件)
│   ├── experts/           # 专家管理 (5个TS + 9个JSON)
│   │   ├── core/         # 核心专家配置 (6个)
│   │   └── special/      # 特殊专家配置 (3个)
│   └── laws/              # 法则权重系统 (1个)
│
├── types/                  # TypeScript 类型定义 (2个)
├── config/                 # 应用配置 (3个)
├── scripts/                # 工具脚本 (3个)
├── public/                 # 静态资源 (5个SVG)
│
├── package.json           # 依赖管理
├── tsconfig.json          # TS 配置
├── next.config.ts         # Next.js 配置
├── .env                   # 环境变量
└── README.md              # 项目文档
```

---

## 🔧 配置文件索引

| 文件路径 | 行数 | 用途 | 关键配置 |
|---------|------|------|---------|
| [package.json](package.json) | ~60 | 依赖管理、npm 脚本 | dev:8000, build, start |
| [tsconfig.json](tsconfig.json) | ~30 | TypeScript 配置 | 路径别名 @/*, strict模式 |
| [next.config.ts](next.config.ts) | ~10 | Next.js 配置 | 最小化配置 |
| [eslint.config.mjs](eslint.config.mjs) | ~15 | 代码规范 | Next.js ESLint |
| [postcss.config.mjs](postcss.config.mjs) | ~10 | CSS 处理 | Tailwind + Autoprefixer |
| [.env](.env) | ~3 | 环境变量 | API密钥 (不在git中) |
| [.gitignore](.gitignore) | ~35 | Git 忽略规则 | node_modules, .next, .env* |

---

## 🌐 应用层索引 (/app)

### 主应用文件

| 文件路径 | 行数 | 用途 | 关键功能 |
|---------|------|------|---------|
| [app/page.tsx](app/page.tsx) | 672 | 主应用UI | 5步工作流、状态管理、Fast/Deep模式 |
| [app/layout.tsx](app/layout.tsx) | ~30 | 根布局组件 | HTML结构、元数据 |
| [app/globals.css](app/globals.css) | ~150 | 全局样式 | 深色终端主题、Tailwind基础 |
| [app/favicon.ico](app/favicon.ico) | - | 浏览器图标 | 品牌标识 |

### API 路由 (11个端点)

#### 核心工作流 API (4个)

| API 路径 | 功能 | 输入 | 输出 |
|---------|------|------|------|
| [app/api/validate-premise/route.ts](app/api/validate-premise/route.ts) | 核心前提验证 | premise, artStyle | ValidationResult |
| [app/api/generate/route.ts](app/api/generate/route.ts) | 世界规则生成 | premise, validation, lawWeights | WorldRule[] |
| [app/api/test-env/route.ts](app/api/test-env/route.ts) | 环境变量测试 | - | 环境状态 |
| [app/api/evaluate-directions/route.ts](app/api/evaluate-directions/route.ts) | 世界方向评估 | directions | 评估结果 |

#### DEAC 专家系统 API (3个)

| API 路径 | 功能 | 核心逻辑 |
|---------|------|---------|
| [app/api/deac/analyze-gap/route.ts](app/api/deac/analyze-gap/route.ts) | 专业缺口分析 | 识别缺失的专业覆盖 |
| [app/api/deac/dispatch/route.ts](app/api/deac/dispatch/route.ts) | 专家编排调度 | 激活相关专家、智能复用 |
| [app/api/deac/synthesize/route.ts](app/api/deac/synthesize/route.ts) | 加权综合分析 | 法则权重 + 专家响应 |

#### 游戏分析 API (3个)

| API 路径 | 功能 | 外部依赖 |
|---------|------|---------|
| [app/api/game-search/route.ts](app/api/game-search/route.ts) | 游戏搜索 | RAWG API |
| [app/api/analyze-games/route.ts](app/api/analyze-games/route.ts) | 多游戏对比分析 | OpenAI API |
| [app/api/recommend-games/route.ts](app/api/recommend-games/route.ts) | AI游戏推荐 | OpenAI API |

---

## 🧩 组件索引 (/components)

| 文件路径 | 行数 | 用途 | Props | 状态管理 |
|---------|------|------|-------|---------|
| [components/RuleCard.tsx](components/RuleCard.tsx) | ~100 | 单个规则卡片 | rule, onConfirm, onReject | 本地确认状态 |
| [components/ValidationReport.tsx](components/ValidationReport.tsx) | ~200 | 核心异常验证报告 | validation | 无状态组件 |
| [components/GameAnalysisStep.tsx](components/GameAnalysisStep.tsx) | ~350 | 步骤0：游戏分析界面 | onAnalysisComplete | 搜索、选择、分析状态 |
| [components/ExpertInsightsPanel.tsx](components/ExpertInsightsPanel.tsx) | ~200 | DEAC专家洞察面板 | deacAnalysis | 无状态组件 |

---

## 🧠 业务逻辑索引 (/lib)

### DEAC 系统 (/lib/deac - 4个文件)

| 文件路径 | 行数 | 核心功能 | 关键方法 |
|---------|------|---------|---------|
| [lib/deac/index.ts](lib/deac/index.ts) | ~150 | 主编排入口 | runDEACAnalysis() |
| [lib/deac/cache-manager.ts](lib/deac/cache-manager.ts) | ~120 | 专家缓存管理 | saveSpecialExpert(), loadAllSpecialExperts() |
| [lib/deac/background-service.ts](lib/deac/background-service.ts) | ~80 | 异步DEAC操作 | runDEACInBackground() |
| [lib/deac/weighted-synthesis.ts](lib/deac/weighted-synthesis.ts) | ~200 | 法则加权综合 | synthesizeExpertResponses() |

### 专家管理系统 (/lib/experts)

#### TypeScript 模块 (5个)

| 文件 | 行数 | 核心功能 | 关键方法 |
|------|------|---------|---------|
| [lib/experts/loader.ts](lib/experts/loader.ts) | ~80 | 加载专家配置 | loadCoreExperts(), loadSpecialExperts() |
| [lib/experts/gap-analyzer.ts](lib/experts/gap-analyzer.ts) | ~150 | 识别专业缺口 | analyzeGap() |
| [lib/experts/orchestrator.ts](lib/experts/orchestrator.ts) | ~200 | 专家激活与协调 | activateExperts() |
| [lib/experts/expert-matcher.ts](lib/experts/expert-matcher.ts) | ~180 | 智能专家复用 | findMatchingExpert() (70%相似度阈值) |
| [lib/experts/prompt-architect.ts](lib/experts/prompt-architect.ts) | ~120 | 动态生成新专家 | generateNewExpert() |

#### 核心专家配置 (6个JSON)

位于 [lib/experts/core/](lib/experts/core/)

| 文件名 | 专业领域 | 覆盖法则 |
|--------|---------|---------|
| [anthropology-sociology.json](lib/experts/core/anthropology-sociology.json) | 文化社会动态 | Cognition, Power |
| [economics.json](lib/experts/core/economics.json) | 资源贸易稀缺性 | Scarcity, Survival |
| [geology-climate.json](lib/experts/core/geology-climate.json) | 物理世界环境 | Space, Time |
| [history-archaeology.json](lib/experts/core/history-archaeology.json) | 时间记忆文物 | Time, Cognition |
| [linguistics.json](lib/experts/core/linguistics.json) | 语言交流认知 | Cognition |
| [politics-military.json](lib/experts/core/politics-military.json) | 权力结构冲突 | Power, Scarcity |

#### 特殊专家配置 (3个JSON)

位于 [lib/experts/special/](lib/experts/special/)

| 文件名 | 版本 | 专业领域 | 创建缘由 |
|--------|------|---------|---------|
| [magic-physics-expert.json](lib/experts/special/magic-physics-expert.json) | v2.0.0 | 魔法超自然物理 | 合并魔法与物理专家 |
| [time-gravity-lie-expert.json](lib/experts/special/time-gravity-lie-expert.json) | v2.0.0 | 时间法则与引力异常 | 时间撒谎设定 |
| [steam-time-analyst.json](lib/experts/special/steam-time-analyst.json) | v1.0.0 | 蒸汽朋克时间理论 | 蒸汽朋克世界观 |

### 法则权重系统 (/lib/laws - 1个文件)

| 文件 | 行数 | 核心功能 | 算法 |
|------|------|---------|------|
| [lib/laws/weight-calculator.ts](lib/laws/weight-calculator.ts) | ~100 | 动态法则权重计算 | 基于验证结果的影响等级计算 |

---

## ⚙️ 配置索引 (/config)

| 文件 | 行数 | 用途 | 关键配置 |
|------|------|------|---------|
| [config/evaluation-rules.ts](config/evaluation-rules.ts) | ~120 | 核心前提验证规则 | 独特性评分、橡皮擦测试 |
| [config/game-source-config.ts](config/game-source-config.ts) | ~40 | RAWG API配置 | API端点、参数 |
| [config/world-directions.ts](config/world-directions.ts) | ~80 | 世界构建方向定义 | 8种世界方向 |

---

## 📦 类型定义索引 (/types)

### [types/index.ts](types/index.ts) (224行)

核心类型定义：

**世界构建类型**
- `Law` - 七大法则枚举
- `WorldRule` - 世界规则结构
- `ValidationResult` - 验证结果
- `LawImpact` - 法则影响等级
- `EraserTest` - 橡皮擦测试结果

**生成配置类型**
- `GenerationRequest` - 生成请求
- `GenerationOptions` - 生成选项
- `LawWeight` - 法则权重

**游戏分析类型**
- `GameInfo` - 游戏信息
- `GameAnalysis` - 游戏分析
- `ComparativeAnalysis` - 对比分析

**DEAC 专家系统类型**
- `ExpertConfig` - 专家配置
- `ExpertResponse` - 专家响应
- `GapAnalysis` - 缺口分析
- `DEACAnalysis` - DEAC 分析结果
- `DEACContext` - DEAC 上下文

**专家系统类型**
- `LawMapping` - 法则映射
- `ReasoningStyle` - 推理风格

### [types/world-directions.ts](types/world-directions.ts) (~50行)

- `WorldDirection` - 世界方向类型
- 相关辅助类型

---

## 🛠️ 工具脚本索引 (/scripts)

| 脚本文件 | 用途 | 使用场景 |
|---------|------|---------|
| [scripts/cleanup-special-experts.ts](scripts/cleanup-special-experts.ts) | 合并重复特殊专家 | 专家去重、版本升级 |
| [scripts/test-deac-experts.ts](scripts/test-deac-experts.ts) | 测试DEAC专家系统 | 功能测试、调试 |
| [scripts/test-smart-matching.ts](scripts/test-smart-matching.ts) | 测试智能匹配系统 | 复用算法验证 |

运行方式: `npx tsx scripts/{script-name}.ts`

---

## 🎨 静态资源索引 (/public)

5个SVG图标资源：

- [public/file.svg](public/file.svg) - 文件图标
- [public/globe.svg](public/globe.svg) - 地球图标
- [public/next.svg](public/next.svg) - Next.js Logo
- [public/vercel.svg](public/vercel.svg) - Vercel Logo
- [public/window.svg](public/window.svg) - 窗口图标

---

## 🎯 常见任务快速查找表

| 任务类型 | 主要相关文件 | 次要相关文件 |
|---------|-------------|-------------|
| **修改前提验证逻辑** | [config/evaluation-rules.ts](config/evaluation-rules.ts) | [app/api/validate-premise/route.ts](app/api/validate-premise/route.ts) |
| **添加新核心专家** | [lib/experts/core/{name}.json](lib/experts/core/) | [lib/experts/loader.ts](lib/experts/loader.ts) |
| **修改专家匹配算法** | [lib/experts/expert-matcher.ts](lib/experts/expert-matcher.ts) | [lib/experts/orchestrator.ts](lib/experts/orchestrator.ts) |
| **调整UI工作流** | [app/page.tsx](app/page.tsx) | [components/](components/) |
| **添加新API端点** | [app/api/{name}/route.ts](app/api/) | [types/index.ts](types/index.ts) |
| **修改规则生成算法** | [app/api/generate/route.ts](app/api/generate/route.ts) | [lib/laws/weight-calculator.ts](lib/laws/weight-calculator.ts) |
| **调试DEAC系统** | [scripts/test-deac-experts.ts](scripts/test-deac-experts.ts) | [lib/deac/](lib/deac/) |
| **修改类型定义** | [types/index.ts](types/index.ts) | - |
| **添加/修改样式** | [app/globals.css](app/globals.css) | tailwind.config |
| **修改游戏分析功能** | [components/GameAnalysisStep.tsx](components/GameAnalysisStep.tsx) | [app/api/game-search/route.ts](app/api/game-search/route.ts) |
| **调整法则权重计算** | [lib/laws/weight-calculator.ts](lib/laws/weight-calculator.ts) | [config/evaluation-rules.ts](config/evaluation-rules.ts) |
| **专家缓存问题** | [lib/deac/cache-manager.ts](lib/deac/cache-manager.ts) | [lib/experts/special/](lib/experts/special/) |

---

## 📊 功能模块文件组

### 游戏分析模块

**相关文件**:
- [components/GameAnalysisStep.tsx](components/GameAnalysisStep.tsx) - 用户界面
- [app/api/game-search/route.ts](app/api/game-search/route.ts) - 游戏搜索
- [app/api/analyze-games/route.ts](app/api/analyze-games/route.ts) - 游戏分析
- [app/api/recommend-games/route.ts](app/api/recommend-games/route.ts) - AI推荐
- [config/game-source-config.ts](config/game-source-config.ts) - RAWG配置
- [types/index.ts](types/index.ts) - GameInfo, GameAnalysis类型

**工作流**:
搜索游戏 → 选择游戏 → 对比分析 → 生成灵感

---

### 前提验证模块

**相关文件**:
- [app/api/validate-premise/route.ts](app/api/validate-premise/route.ts) - 验证API
- [components/ValidationReport.tsx](components/ValidationReport.tsx) - 验证报告UI
- [config/evaluation-rules.ts](config/evaluation-rules.ts) - 验证规则
- [types/index.ts](types/index.ts) - ValidationResult, EraserTest类型

**核心功能**:
- 独特性评分 (0-100)
- 七大法则影响分析
- 橡皮擦测试 (结构性 vs 装饰性)
- 警告与建议

---

### 规则生成模块

**相关文件**:
- [app/api/generate/route.ts](app/api/generate/route.ts) - 生成API
- [components/RuleCard.tsx](components/RuleCard.tsx) - 规则卡片UI
- [lib/laws/weight-calculator.ts](lib/laws/weight-calculator.ts) - 权重计算
- [types/index.ts](types/index.ts) - WorldRule, LawWeight类型

**生成模式**:
- **Fast Mode**: 基于法则权重立即生成
- **Deep Mode**: 等待DEAC分析，整合专家洞察

**规则分布**: 根据法则权重动态分配20条规则

---

### DEAC 专家系统

**相关文件**:
- [lib/deac/index.ts](lib/deac/index.ts) - 主编排器
- [lib/deac/cache-manager.ts](lib/deac/cache-manager.ts) - 缓存管理
- [lib/deac/background-service.ts](lib/deac/background-service.ts) - 后台服务
- [lib/deac/weighted-synthesis.ts](lib/deac/weighted-synthesis.ts) - 加权综合
- [app/api/deac/analyze-gap/route.ts](app/api/deac/analyze-gap/route.ts) - 缺口分析API
- [app/api/deac/dispatch/route.ts](app/api/deac/dispatch/route.ts) - 调度API
- [app/api/deac/synthesize/route.ts](app/api/deac/synthesize/route.ts) - 综合API
- [components/ExpertInsightsPanel.tsx](components/ExpertInsightsPanel.tsx) - UI面板

**DEAC 流程**:
1. **Gap Analysis** - 识别缺失专业
2. **Expert Dispatch** - 激活/创建相关专家
3. **Weighted Synthesis** - 法则加权综合
4. **Emergent Insights** - 浮现洞察

---

### 专家智能复用系统

**相关文件**:
- [lib/experts/expert-matcher.ts](lib/experts/expert-matcher.ts) - 匹配算法
- [lib/experts/prompt-architect.ts](lib/experts/prompt-architect.ts) - 专家生成
- [lib/deac/cache-manager.ts](lib/deac/cache-manager.ts) - 持久化
- [scripts/cleanup-special-experts.ts](scripts/cleanup-special-experts.ts) - 去重工具

**复用策略**:
- **相似度 ≥ 90%**: 直接复用 (Reuse)
- **相似度 70-89%**: 更新专家 (Update, v1.0.0 → v1.1.0)
- **相似度 < 70%**: 创建新专家 (Create, v1.0.0)
- **合并专家**: 版本升级 v2.0.0，记录 `merged_from`

**文档参考**: [SMART-EXPERT-REUSE.md](SMART-EXPERT-REUSE.md)

---

## 📚 文档文件索引

| 文档 | 行数 | 内容 |
|------|------|------|
| [README.md](README.md) | 183 | 项目主文档、功能介绍、v2.0特性 |
| [SMART-EXPERT-REUSE.md](SMART-EXPERT-REUSE.md) | 406 | 专家智能复用系统详细文档 |
| [ENV-FIX.md](ENV-FIX.md) | 67 | 环境配置与故障排除指南 |
| **FILE-INDEX.md** (本文件) | ~650 | 项目文件索引 |

---

## 🔗 关键依赖关系

### API 调用链

```
app/page.tsx (主UI)
  ↓
  ├─→ app/api/game-search/route.ts → RAWG API
  ├─→ app/api/validate-premise/route.ts → config/evaluation-rules.ts
  ├─→ app/api/deac/dispatch/route.ts → lib/deac/index.ts
  │     ↓
  │     ├─→ lib/experts/gap-analyzer.ts
  │     ├─→ lib/experts/orchestrator.ts → lib/experts/expert-matcher.ts
  │     └─→ lib/experts/prompt-architect.ts
  └─→ app/api/generate/route.ts → lib/laws/weight-calculator.ts
        ↓
        OpenAI/DeepSeek API
```

### 类型依赖

```
types/index.ts (核心类型定义)
  ↓
  ├─→ app/api/**/route.ts (所有API路由)
  ├─→ components/*.tsx (所有组件)
  ├─→ lib/deac/*.ts (DEAC系统)
  └─→ lib/experts/*.ts (专家系统)
```

### 专家系统流程

```
lib/experts/loader.ts (加载专家)
  ↓
lib/experts/gap-analyzer.ts (缺口分析)
  ↓
lib/experts/expert-matcher.ts (查找匹配)
  ↓
lib/experts/prompt-architect.ts (生成新专家)
  ↓
lib/deac/cache-manager.ts (持久化)
```

---

## 🚀 快速开始命令

```bash
# 安装依赖
npm install

# 开发模式 (端口 8000)
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 运行专家系统测试
npx tsx scripts/test-deac-experts.ts

# 清理重复专家
npx tsx scripts/cleanup-special-experts.ts
```

---

## 🔑 环境变量配置

在项目根目录创建 `.env` 文件：

```env
# DeepSeek API (主要)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# OpenAI API (备用)
OPENAI_API_KEY=your_openai_api_key_here

# RAWG 游戏数据库 API
RAWG_API_KEY=your_rawg_api_key_here
```

详细配置指南: [ENV-FIX.md](ENV-FIX.md)

---

## 📈 项目统计

| 类别 | 数量 |
|------|------|
| **总文件数** | 50+ |
| **TypeScript/TSX 文件** | 30+ |
| **React 组件** | 4 |
| **API 路由** | 11 |
| **专家配置 (JSON)** | 9 (6核心 + 3特殊) |
| **配置文件** | 7 |
| **工具脚本** | 3 |
| **文档文件** | 4 |
| **总代码行数** | ~5000+ |

---

## 📝 维护说明

### 索引更新时机
- 添加新文件或目录
- 重大功能模块更改
- API 路由增删
- 专家系统配置变更

### 更新方式
1. **手动更新**: 编辑本文件相应章节
2. **自动生成**: (未来) 运行索引生成脚本

### 最后更新
- **日期**: 2026-01-20
- **版本**: v1.0.0
- **更新内容**: 初始版本，完整项目索引

---

## 💡 使用建议

### 针对 AI 助手
在新对话开始时：
1. 首先阅读本索引文件
2. 根据任务类型查找"常见任务快速查找表"
3. 直接跳转到相关文件，避免全项目遍历
4. 节省 Token 消耗，提高响应速度

### 针对开发者
1. 作为项目结构参考手册
2. 快速定位功能模块相关文件
3. 理解文件依赖关系
4. 新功能开发时参考现有模式

---

## 🔖 快捷索引

- [配置文件](#-配置文件索引) | [应用层](#-应用层索引-app) | [组件](#-组件索引-components)
- [业务逻辑](#-业务逻辑索引-lib) | [类型定义](#-类型定义索引-types) | [工具脚本](#-工具脚本索引-scripts)
- [快速查找表](#-常见任务快速查找表) | [功能模块](#-功能模块文件组)

---

**World-Building Engine v2.0** - 让世界构建更科学、更智能、更高效。

*Generated by Claude Sonnet 4.5 | 2026-01-20*
