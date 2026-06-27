# aiworld / aiWolrld — World-Building Engine

规则驱动的世界观生成引擎：用户输入「核心异变点」，DEAC 多智能体专家系统打分验证，再按「七大法则」生成可执行世界规则并导出。给叙事创作者与（未来）游戏运行时使用。

应用代码全部在 `web/`（Next.js 项目）。本文件是总入口，**详细规范见 `.claude/rules/`，不在此重复**。

## Stack（以 web/package.json、配置文件为准）
- Next.js 16 (App Router) · React 19 · TypeScript 5（strict）
- Tailwind CSS 4 · next-intl 4（i18n）· NextAuth 5 beta（认证）
- OpenAI SDK 6（接 DeepSeek/OpenAI，见 lib/utils/openai-client.ts）
- 测试：Jest 30 + Testing Library（jsdom）
- 路径别名：`@/*` → `web/` 根（tsconfig.json）

## Commands（在 web/ 下运行）
```bash
npm run dev          # 开发服务器，端口 8000（不是默认 3000）
npm run build        # 生产构建
npm run lint         # ESLint（pre-commit 钩子会跑，见 web/.husky/pre-commit）
npm run type-check   # tsc --noEmit
npm run test         # Jest（test:watch / test:coverage 亦可）
npm run audit:code   # lint + type-check 一把过
npm run check:unused # ts-prune 找死代码
npm run check:duplicates  # jscpd 找重复
```

## 目录结构（web/）
```
app/        Next.js App Router：页面 + api/（后端路由）
components/  React 组件（auth/ common/ validation/ workflow/ providers/）
config/     集中配置常量（law-names.ts 等，禁止魔法数字）
lib/        业务逻辑：deac/ experts/ auth/ archive/ tags/ utils/ …
types/      共享类型（types/index.ts 是单一数据源）
messages/   i18n 翻译（zh-CN.json 默认 / en.json）
__tests__/  Jest 测试（注意：被 .gitignore 忽略，不入库）
```

## 关键约定（细节见对应 rules 文件）
- LLM 客户端只用 `getOpenAIClient()`，禁止在路由里直接 `new OpenAI(...)`。
- 跨文件类型只定义在 `types/index.ts`，组件内不重复定义。
- 用户可见文本全部走 i18n（next-intl），禁止硬编码中英文。
- 工作流是 HomeClient.tsx 里的状态机（homepage → gameRecommend → validation → rules），不是单页表单。
- i18n 不用 URL locale 路由：服务端 i18n.ts 固定 DEFAULT_LOCALE，切换靠客户端 useI18n/setLocale。

## Rules 索引（权威细节，按需阅读）
- 编码风格 / 不可变 / 文件大小 / 禁止事项 — see .claude/rules/coding-style.md
- 目录结构 / 架构 / API 模板与端点 / 类型与配置速查 — see .claude/rules/architecture.md
- 测试要求与 TDD — see .claude/rules/testing.md
- 安全（密钥、输入校验、提交前清单）— see .claude/rules/security.md
- Git 工作流与提交格式 — see .claude/rules/git-workflow.md
- 子 Agent 编排 — see .claude/rules/agents.md
- 钩子 — see .claude/rules/hooks.md
- 常用模式 — see .claude/rules/patterns.md
- 性能 / 模型选择 — see .claude/rules/performance.md
- 文件索引 — see docs/FILE-INDEX.md；i18n 指南 — see docs/I18N_GUIDE.md

## 注意
- 个人化覆盖写 `CLAUDE.local.md`（加进 .gitignore），勿写本文件。
- 不要 git 提交未经要求的改动。
