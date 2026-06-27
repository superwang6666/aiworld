# aiWolrld · 规则驱动的世界观生成引擎

aiWolrld 是一个围绕「七大世界构建法则」打造的世界观制作平台，借助 **DEAC（Dynamic Expert Agent Cluster）多智能体评分系统** 来完成几乎所有复杂的评分、筛选、博弈式讨论与规则生成任务。每个 Agent 都以独立的 JSON 配置存在，开发者可以通过编辑这些文件来定义口吻、知识范围、打分权重与推理流程，实现真正可定制的专家议事会。项目的长期目标是让规则驱动的世界观可以像组件一样被复用，既能帮助叙事型作品快速生成世界设定，也能在未来嵌入到游戏中，按照实时的设计决策生成或改写游戏世界。

## 核心特性
- **多智能体评分链路**：DEAC 会根据用户输入的「异质性焦点」自动匹配最相关的专家 Agent（最多 5 名），并在 `app/api/deac/*` 接口内完成派遣、差距分析与综合，让评分透明可追溯。
- **四段式世界构建流程**：从核心前提出发，依次走过【前提验证 → 艺术风格 → 规则生成 → 导出】，每个阶段都复用相同的 Agent 机制，确保评分口径一致。
- **可编辑的 Agent 仓库**：所有默认专家位于 `web/lib/experts/core/*.json`，特殊专家位于 `web/lib/experts/special/`。新增或编辑文件即可引入新的领域知识，无需改动业务代码。
- **面向游戏的规则引擎**：生成的 20 条具体规则会标注对应法则（Space/Survival/…），开发者可以在游戏运行时动态启用或禁用某条规则，为「按规则生成世界」提供落地点。
- **现代化前端体验**：基于 Next.js 16 + TypeScript + Tailwind CSS，采用暗色终端视觉，并通过 `app/api/generate/route.ts` 与 DeepSeek/OpenAI API 交互，保证本地 UI 响应与云端算力兼得。
- **自定义大模型思考延展**：每个 Agent 都围绕自定义大模型的推理链路进行编排，模型能力迭代时 aiWolrld 也会同步获得更强的分析深度与结论可靠度，实现「模型进化 → 引擎进化」的正反馈。

## 工作流总览
1. **输入核心前提**：描述世界的关键异变点，例如「说谎会增加自身重力」。  
2. **前提验证（Core Anomaly Validation）**：DEAC 计算独特性得分、识别主要法则影响、运行 Eraser Test，并输出警示与改进建议。  
3. **选择艺术风格**：锁定想要的视觉/叙事风格（如「霓虹赛博」「掐丝珐琅」），作为生成规则时的语境。  
4. **生成与管理规则**：系统依据 7 大法则产生 20 条可执行规则，支持确认、删除与二次生成。  
5. **导出与集成**：一键导出 Markdown/JSON，既可作为世界观设计文档，也能被其他 AI/游戏工具直接消费。

## 技术架构
- **框架**：Next.js 16（App Router）+ React Server Components  
- **语言**：TypeScript  
- **样式/组件**：Tailwind CSS、Lucide 图标、暗色终端主题  
- **AI 接口**：DeepSeek Chat（推荐）与 OpenAI GPT-4o-mini，兼容统一的 OpenAI API 规范  
- **国际化 & 认证**：next-intl（中文默认 / 英文）+ NextAuth v5（登录、用户存档）  
- **核心模块**：
  - `app/page.tsx`：四步式工作流界面  
  - `app/api/validate-premise/route.ts`：核心前提验证  
  - `app/api/generate/route.ts`：规则生成  
  - `app/api/deac/*`：Agent 派遣 / 差距分析 / 综合（dispatch / analyze-gap / synthesize）  
  - `components/validation/*`（ValidationScoreCard、ValidationWarnings、ExpertInsightsPanel 等）：可视化结果面板  

## 快速开始
### 运行环境
- Node.js 20+（Next.js 16 / React 19 要求）
- NPM 或 PNPM
- DeepSeek 或 OpenAI API Key（可选但推荐）

### 安装步骤
```bash
git clone <repo-url>
cd aiworld/web
npm install
cp .env.example .env
# 在 .env 中配置至少一个 API key，例如：
# DEEPSEEK_API_KEY=sk-xxx 或 OPENAI_API_KEY=sk-xxx
npm run dev
```
浏览器访问 `http://localhost:8000`，即可体验完整流程。

## 目录速览
```
web/
├─ app/                      # 前端与 API 路由
│  ├─ api/
│  │  ├─ generate/route.ts   # 规则生成入口
│  │  ├─ validate-premise/   # 前提验证
│  │  └─ deac/               # Agent 激活/查询/综合
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/               # UI 组件（RuleCard / ExpertInsightsPanel / validation·workflow·auth 等子目录）
├─ lib/experts/              # Agent 配置（core + special）
└─ types/                    # TypeScript 类型定义
docs/                        # 详细指南（DEAC、I18N、CODE_STANDARDS…）
```

## 自定义与扩展 Agent
1. 在 `web/lib/experts/core/` 或 `web/lib/experts/special/` 内新增 JSON：定义 `name/domain/law_mapping/prompt_template` 等字段。  
2. 重启开发服务器后，DEAC 会自动加载新专家并在评分阶段调用。  
3. 如需定制调度策略，可在 `app/api/deac/dispatch/route.ts`、`app/api/deac/synthesize/route.ts` 中修改排序规则、并行数量或温度参数。  
4. 结合 `docs/DEAC-README.md`、`docs/DEAC-EXPERTS.md` 可快速了解评分口径与配置规范。

## 应用场景与愿景
aiWolrld 的目标是成为「规则型世界观生成器」：  
- 前期用于剧本/设定团队快速验证创意，降低从想法到落地规则的时间。  
- 游戏开发阶段可以把它嵌入关卡/剧情编辑器中，按照不同规则模板实时生成派生世界。  
- 随着更多 AI 系统（角色 AI、对话 AI、经济模拟器）成熟，aiWolrld 既能提供统一的规则基准，也能在运行时动态修改世界，支撑「自适应世界观」。  
通过完全 Agent 化的评分链路，团队可以持续扩充知识库，让系统针对不同题材（科幻、历史、都市奇幻等）自我进化。同时，该平台依托「智能体文字框架」来模拟多 Agent 之间的讨论推理流程，再由人类对结论进行裁决，可抽象为调研、评审、平衡博弈等多种场景的通用解决方案。

## 贡献方式
1. Fork 仓库  
2. 创建分支 `feat/<your-feature>`  
3. 确保通过现有 lint/test（如有）  
4. 提交 Pull Request 并附上修改说明或相关文档链接  
5. 若贡献新的 Agent，请同步补充 `docs/DEAC-EXPERTS.md` 或创建独立说明

## 许可证
本项目遵循 [GNU GPLv3](./LICENSE) 许可。引用或二次分发需保留相同协议，并在商业使用前确认兼容性。
