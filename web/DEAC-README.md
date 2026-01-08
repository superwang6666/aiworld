# DEAC 模块说明文档
**Dynamic Expert Agent Cluster (动态专家智能体集群)**

版本: 1.0.0
更新时间: 2026-01-08

---

## 目录

1. [概述](#概述)
2. [核心概念](#核心概念)
3. [系统架构](#系统架构)
4. [工作流程](#工作流程)
5. [核心专家配置](#核心专家配置)
6. [特殊专家生成](#特殊专家生成)
7. [API 接口](#api-接口)
8. [前端集成](#前端集成)
9. [配置说明](#配置说明)
10. [使用示例](#使用示例)
11. [扩展指南](#扩展指南)

---

## 概述

DEAC (Dynamic Expert Agent Cluster) 是一个智能化的专家系统,用于自动分析世界观构建中的核心异质点(Core Heterogeneity)。系统通过激活多个 AI 专家智能体,从不同领域视角分析异质点对世界观 7 大法则的影响。

### 核心特性

- ✅ **4 位核心专家**:覆盖物理/地质、生物/医学、社会/政治、经济/资源四大领域
- ✅ **动态差距检测**:自动识别核心专家未覆盖的法则和特殊领域
- ✅ **智能专家生成**:针对魔法、时间旅行、梦境、虚拟现实等特殊主题自动生成专家
- ✅ **多视角综合**:整合多个专家分析,识别共识、分歧和涌现洞察
- ✅ **专家缓存机制**:生成的特殊专家可复用,避免重复生成
- ✅ **非阻塞运行**:后台异步运行,不影响主工作流

### 设计目标

基于"核心异质点驱动"理念,DEAC 系统旨在:

1. **自动匹配专家**:根据异质点特性自动选择相关专家
2. **识别知识盲区**:检测哪些法则缺乏专家覆盖
3. **动态补充专家**:实时生成特殊领域专家填补知识盲区
4. **提供深度洞察**:从多个专业角度分析异质点的深层影响

---

## 核心概念

### 1. 核心异质点 (Core Heterogeneity)

核心异质点是世界观的根本性差异点,它从根本上改变了世界的运作规则。

**示例:**
- ✅ "重力是正常地球的 10 倍" (物理异质点)
- ✅ "魔法咒语取代了电力" (魔法异质点)
- ✅ "时间每天午夜逆流" (时间异质点)
- ✅ "人类可以进入他人梦境" (认知异质点)

### 2. 七大法则 (Seven Laws)

世界观构建的基础框架,所有异质点都会对这些法则产生影响:

| 法则 | 英文 | 含义 |
|------|------|------|
| 空间 | Space | 物理空间、地理、环境 |
| 生存 | Survival | 生命需求、生态系统 |
| 认知 | Cognition | 思维、感知、意识 |
| 稀缺 | Scarcity | 资源、经济、价值 |
| 时间 | Time | 时间流逝、因果关系 |
| 权力 | Power | 社会结构、政治、控制 |
| 形而上 | Metaphysics | 超自然、哲学、信仰 |

### 3. 专家类型

#### 核心专家 (Core Experts)

预定义的 4 位专家,覆盖世界构建的基础维度:

1. **艾萨克·特拉弗洛博士** - 物理学与地质学
   - 主要法则: Space, Metaphysics
   - 次要法则: Survival, Time

2. **维塔·奥加尼卡博士** - 生物学与医学
   - 主要法则: Survival, Cognition
   - 次要法则: Time, Space

3. **海伦娜·西维塔斯教授** - 社会与政治系统
   - 主要法则: Power, Cognition
   - 次要法则: Scarcity, Time

4. **马库斯·威尔斯通博士** - 经济学与资源管理
   - 主要法则: Scarcity, Power
   - 次要法则: Time, Survival

#### 特殊专家 (Special Experts)

由 **提示词建筑师 (Prompt Architect Agent)** 动态生成的专家,针对特定异质点:

**自动触发条件 (关键词匹配):**

| 领域 | 触发关键词 | 生成专家示例 |
|------|-----------|-------------|
| 魔法系统 | 魔法、魔咒、施法、咒语、奥术 | 魔法系统与超自然物理学专家 |
| 时间力学 | 时间旅行、时间回溯、时光、时间循环 | 时间力学与因果关系专家 |
| 梦境逻辑 | 梦境、噩梦、潜意识、心理、精神 | 心理学与梦境逻辑专家 |
| 数字世界 | 数字、虚拟、赛博、网络、模拟 | 数字物理学与虚拟现实专家 |
| 多维空间 | 多维、异次元、平行世界、维度 | 多维空间理论专家 |
| 永生理论 | 永生、不死、复活、重生、灵魂 | 生命延续与灵魂理论专家 |

### 4. 差距分析 (Gap Analysis)

系统自动评估:
- **已覆盖法则**:核心专家可以充分分析的法则
- **未覆盖法则**:缺乏专家关注的法则
- **部分覆盖**:仅有次要覆盖的法则
- **特殊专业知识需求**:需要特殊领域专家的场景

---

## 系统架构

### 目录结构

```
lib/
├── experts/
│   ├── core/                           # 核心专家配置 (JSON)
│   │   ├── physics-geology.json        # 物理/地质专家
│   │   ├── biology-medicine.json       # 生物/医学专家
│   │   ├── social-political.json       # 社会/政治专家
│   │   └── economics-resource.json     # 经济/资源专家
│   ├── special/                        # 特殊专家缓存 (自动生成)
│   │   └── .gitkeep
│   ├── loader.ts                       # 专家加载器
│   ├── orchestrator.ts                 # 专家编排器
│   ├── gap-analyzer.ts                 # 差距分析器
│   └── prompt-architect.ts             # 提示词建筑师
└── deac/
    ├── index.ts                        # 公共 API 门面
    ├── background-service.ts           # 后台服务
    └── cache-manager.ts                # 缓存管理器

app/api/deac/
├── analyze-gap/route.ts                # 差距分析端点
├── dispatch/route.ts                   # 专家调度端点
└── synthesize/route.ts                 # 综合分析端点

components/
└── ExpertInsightsPanel.tsx             # 专家洞察面板 UI
```

### 数据流图

```
用户输入核心前提
    ↓
[步骤 1] 验证异质点 (/api/validate-premise)
    ├─ 生成 ValidationResult (含 lawImpacts)
    ├─ 返回给前端显示
    └─ 触发 DEAC 分析 (非阻塞)
         ↓
[步骤 2] 加载核心专家 (loadCoreExperts)
    ↓
[步骤 3] 差距分析 (analyzeGaps)
    ├─ 比对 lawImpacts 与专家覆盖范围
    ├─ 识别未覆盖法则
    └─ 检测特殊领域需求 (关键词匹配)
         ↓
[步骤 4] 生成特殊专家 (generateSpecialExpert)
    ├─ 使用 LLM 创建专家配置
    ├─ 保存到 lib/experts/special/
    └─ 加入专家池
         ↓
[步骤 5] 专家调度 (dispatchExperts)
    ├─ 根据 lawImpacts 评分专家相关性
    ├─ 激活相关专家 (并行查询)
    └─ 收集专家响应
         ↓
[步骤 6] 综合分析 (synthesize)
    ├─ 识别专家共识
    ├─ 标记专家分歧
    ├─ 提取涌现洞察
    └─ 生成风险评估
         ↓
[步骤 7] 返回 DEACAnalysis
    └─ 前端显示专家洞察面板
```

---

## 工作流程

### 完整流程示例

**用户输入:** "重力反向,物体向上漂浮而非下落"

#### 1️⃣ 验证阶段

```json
{
  "isUnique": true,
  "uniquenessScore": 82,
  "coreAnomalyIdentified": "Space 法则根本性颠覆 - 重力方向逆转",
  "lawImpacts": [
    {
      "law": "Space",
      "impact": "所有物体受反向重力影响",
      "example": "建筑必须倒置建造,树木向下生长"
    },
    {
      "law": "Survival",
      "impact": "生物进化需要适应反向重力",
      "example": "飞行生物消失,地下生物成为主导"
    },
    // ... 其他法则
  ]
}
```

#### 2️⃣ 差距分析阶段

```json
{
  "heterogeneity_point": "重力反向,物体向上漂浮而非下落",
  "covered_laws": ["Space", "Survival", "Cognition", "Scarcity", "Power"],
  "uncovered_laws": ["Time", "Metaphysics"],
  "partial_coverage": [
    {
      "law": "Time",
      "reason": "仅由艾萨克·特拉弗洛博士提供次要覆盖"
    }
  ],
  "special_expertise_needed": [],
  "confidence_score": 0.71
}
```

#### 3️⃣ 专家激活阶段

**激活专家:**
- ✅ 艾萨克·特拉弗洛博士 (物理/地质) - Space 主要覆盖
- ✅ 维塔·奥加尼卡博士 (生物/医学) - Survival 主要覆盖
- ✅ 海伦娜·西维塔斯教授 (社会/政治) - Power 主要覆盖
- ✅ 马库斯·威尔斯通博士 (经济/资源) - Scarcity 主要覆盖

#### 4️⃣ 专家响应示例

**艾萨克·特拉弗洛博士的分析:**

```json
{
  "expert_id": "physics-geology-expert",
  "expert_name": "艾萨克·特拉弗洛博士",
  "domain": "物理学与地质学",
  "analysis": "重力反向将导致物理学的根本重构。大气层将向外膨胀而非被地球吸引,需要一个'天空地壳'来防止大气逃逸。地质构造将完全颠倒,岩浆向上推动而非下沉,形成'倒悬山脉'。所有物质密度定律需要重新定义,轻物质(如氢气)将沉入地心,重物质(如铁)将漂浮至大气层顶端。",
  "law_impacts": [
    {
      "law": "Space",
      "prediction": "需要建造倒置城市和'天空锚'防止建筑飘走",
      "confidence": 0.95
    },
    {
      "law": "Survival",
      "prediction": "生物必须进化出'向上抓地'的机制,如倒刺足或磁性附着",
      "confidence": 0.88
    }
  ],
  "warnings": [
    "大气逃逸问题可能导致行星不宜居",
    "轨道力学将变得极其不稳定"
  ],
  "suggestions": [
    "考虑添加'重力锚点'或'反重力屏障'作为补充设定",
    "定义反重力的作用范围(全球性 vs 区域性)"
  ]
}
```

#### 5️⃣ 综合分析阶段

```json
{
  "consensus": "所有专家一致认为反向重力将导致社会结构、建筑设计、生物进化的全面重构。这是一个典型的结构性(非装饰性)核心设定。",
  "disagreements": [
    {
      "topic": "经济影响优先级",
      "perspectives": [
        {
          "expert": "马库斯·威尔斯通博士",
          "view": "采矿业将成为最有价值的行业,因为金属漂浮至天空易于获取"
        },
        {
          "expert": "海伦娜·西维塔斯教授",
          "view": "控制'天空锚'技术的势力将掌握最大权力,经济价值次之"
        }
      ]
    }
  ],
  "emergent_insights": [
    "反向重力可能催生'天空文明'与'地面文明'的二元社会结构",
    "传统的'上层阶级'和'下层阶级'概念将被物理颠倒",
    "飞行不再是优势,而'锚定'能力成为核心生存技能"
  ],
  "risk_assessment": "高风险设定。需要详细解释大气保持机制、轨道稳定性、以及为何地球未在地质历史中解体。建议添加'反重力起源事件'的时间线说明。"
}
```

---

## 核心专家配置

### 配置文件结构

每个核心专家都是一个 JSON 文件,存储在 `lib/experts/core/` 目录。

**示例: physics-geology.json**

```json
{
  "id": "physics-geology-expert",
  "version": "1.0.0",
  "name": "艾萨克·特拉弗洛博士",
  "domain": "物理学与地质学",
  "knowledge_scope": [
    "重力与引力系统",
    "热力学与能量流动",
    "地质过程与板块构造",
    "材料科学与物质状态",
    "大气物理学",
    "天体力学"
  ],
  "law_mapping": {
    "primary": ["Space", "Metaphysics"],
    "secondary": ["Survival", "Time"]
  },
  "prompt_template": "你是艾萨克·特拉弗洛博士...",
  "reasoning_style": "analytical",
  "expertise_depth": 8,
  "specialization_tags": ["硬科幻", "物理学", "地质学"],
  "created_by": "system"
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识符 (kebab-case) |
| `version` | string | 配置版本号 |
| `name` | string | 专家显示名称 |
| `domain` | string | 专业领域 |
| `knowledge_scope` | string[] | 知识范围列表 |
| `law_mapping.primary` | Law[] | 主要覆盖的法则 |
| `law_mapping.secondary` | Law[] | 次要覆盖的法则 |
| `prompt_template` | string | LLM 系统提示词模板 |
| `reasoning_style` | ReasoningStyle | 推理风格 |
| `expertise_depth` | number | 专业深度 (1-10) |
| `specialization_tags` | string[] | 专业标签 |
| `created_by` | "system" \| "prompt_architect" | 创建来源 |
| `created_at` | string (ISO) | 创建时间 (特殊专家) |

### 推理风格 (ReasoningStyle)

- **analytical** (分析型): 数据驱动、系统化、逻辑严密
- **holistic** (整体型): 大局观、关联性思考
- **adversarial** (批判型): 挑战性、质疑性、魔鬼代言人
- **speculative** (推测型): 想象力丰富、探索性
- **empirical** (实证型): 证据基础、务实性

---

## 特殊专家生成

### 提示词建筑师 (Prompt Architect Agent)

DEAC 系统的核心创新是**提示词建筑师**,它是一个使用 LLM 来动态生成专家配置的 AI 代理。

### 生成流程

```
检测到知识盲区 (如:"魔法咒语")
    ↓
提取关键信息:
  - domain: "魔法系统与超自然物理学"
  - reason: "核心异质点涉及魔法元素"
  - knowledge_scope: ["魔法能量系统", "咒语机制", ...]
    ↓
调用 LLM (DeepSeek/GPT-4):
  - 生成专家人物设定
  - 定义知识范围
  - 映射到 7 大法则
  - 创建提示词模板
    ↓
保存到 lib/experts/special/magic-systems-physics-{timestamp}.json
    ↓
加入当前分析的专家池
```

### 生成的专家示例

**输入异质点:** "魔法咒语取代了电力"

**生成的专家配置:**

```json
{
  "id": "magic-systems-physics-expert",
  "version": "1.0.0",
  "name": "梅林·阿卡纳教授",
  "domain": "魔法系统与超自然物理学",
  "knowledge_scope": [
    "魔法能量守恒定律",
    "咒语语言学与符文体系",
    "魔力场理论",
    "超自然因果关系",
    "附魔机制与持久性",
    "魔法生态学"
  ],
  "law_mapping": {
    "primary": ["Metaphysics", "Space"],
    "secondary": ["Power", "Scarcity"]
  },
  "prompt_template": "你是梅林·阿卡纳教授,魔法系统理论学专家...",
  "reasoning_style": "speculative",
  "expertise_depth": 7,
  "specialization_tags": ["魔法", "超自然", "奇幻"],
  "created_by": "prompt_architect",
  "created_at": "2026-01-08T10:30:00.000Z"
}
```

### 缓存与重用

生成的特殊专家会被保存到 `lib/experts/special/` 目录,后续遇到相似异质点时可以直接重用,避免重复生成。

**缓存命名规则:**
```
{专家ID}.json
例如: magic-systems-physics-expert.json
```

---

## API 接口

### 1. 差距分析端点

**端点:** `POST /api/deac/analyze-gap`

**功能:** 分析异质点与核心专家之间的覆盖差距

**请求体:**
```json
{
  "heterogeneity_point": "重力反向",
  "validation_result": {
    "lawImpacts": [...],
    // ... ValidationResult 的其他字段
  }
}
```

**响应:**
```json
{
  "gap_analysis": {
    "heterogeneity_point": "重力反向",
    "covered_laws": ["Space", "Survival", "Power", "Scarcity"],
    "uncovered_laws": ["Time", "Metaphysics"],
    "partial_coverage": [...],
    "special_expertise_needed": [],
    "confidence_score": 0.71
  }
}
```

---

### 2. 专家调度端点

**端点:** `POST /api/deac/dispatch`

**功能:** 激活相关专家并收集分析

**请求体:**
```json
{
  "heterogeneity_point": "重力反向",
  "gap_analysis": null,  // 可选,null 时自动计算
  "context": {
    "core_premise": "重力反向",
    "validation_result": {...},
    "current_step": "validation"
  },
  "generate_special_experts": true
}
```

**响应:**
```json
{
  "gap_analysis": {...},
  "activated_experts": [
    "physics-geology-expert",
    "biology-medicine-expert",
    "social-political-expert",
    "economics-resource-expert"
  ],
  "expert_responses": [
    {
      "expert_id": "physics-geology-expert",
      "expert_name": "艾萨克·特拉弗洛博士",
      "domain": "物理学与地质学",
      "analysis": "...",
      "law_impacts": [...],
      "warnings": [...],
      "suggestions": [...]
    },
    // ... 其他专家响应
  ],
  "special_experts_generated": []
}
```

**特性:**
- ✅ 支持 `gap_analysis` 为 `null`,会自动计算
- ✅ 并行查询所有专家,提高响应速度
- ✅ 自动生成特殊专家并缓存
- ✅ 错误容忍:单个专家失败不影响整体

---

### 3. 综合分析端点

**端点:** `POST /api/deac/synthesize`

**功能:** 整合多个专家视角

**请求体:**
```json
{
  "expert_responses": [...],  // ExpertResponse[]
  "heterogeneity_point": "重力反向"
}
```

**响应:**
```json
{
  "synthesis": {
    "consensus": "所有专家一致认为...",
    "disagreements": [
      {
        "topic": "经济影响优先级",
        "perspectives": [...]
      }
    ],
    "emergent_insights": [
      "反向重力可能催生天空文明...",
      "传统阶级概念将被物理颠倒..."
    ],
    "risk_assessment": "高风险设定,需要详细解释..."
  }
}
```

---

## 前端集成

### 状态管理

在 `app/page.tsx` 中添加 DEAC 状态:

```typescript
// DEAC 专家系统状态
const [deacAnalysis, setDeacAnalysis] = useState<DEACAnalysis | null>(null);
const [deacLoading, setDeacLoading] = useState(false);
```

### 触发流程

验证完成后自动触发 DEAC 分析:

```typescript
const handleValidatePremise = async () => {
  // ... 验证逻辑 ...

  const data = await response.json();
  setValidationResult(data);
  setCurrentStep('validation');

  // 触发 DEAC 专家分析
  setDeacLoading(true);
  fetch('/api/deac/analyze-gap', {...})
    .then(...)
    .then(dispatchData => {
      setDeacAnalysis({...});
      setDeacLoading(false);
    });
};
```

### UI 组件

使用 `ExpertInsightsPanel` 显示专家洞察:

```tsx
{currentStep === 'validation' && validationResult && (
  <>
    <ValidationReport ... />
    <ExpertInsightsPanel
      analysis={deacAnalysis}
      isLoading={deacLoading}
    />
  </>
)}
```

**组件特性:**
- ✅ 可折叠面板,节省空间
- ✅ 显示激活的专家数量
- ✅ 展示每位专家的分析摘要
- ✅ 高亮显示警告和建议
- ✅ 综合分析:共识、分歧、涌现洞察、风险评估
- ✅ 特殊专家生成提示

---

## 配置说明

### 环境变量

DEAC 使用现有的 API 密钥配置,无需额外环境变量:

```bash
# .env.local
DEEPSEEK_API_KEY=sk-...     # 主要 (推荐)
OPENAI_API_KEY=sk-...       # 备用
```

### 可选配置

未来可扩展的配置项:

```bash
# DEAC 配置 (可选)
DEAC_MAX_EXPERTS=5                    # 每次分析最多激活的专家数
DEAC_ENABLE_SPECIAL_GENERATION=true   # 是否允许生成特殊专家
DEAC_CACHE_TTL_DAYS=90                # 特殊专家缓存有效期
```

### 修改核心专家

编辑 `lib/experts/core/*.json` 文件即可:

```bash
lib/experts/core/
├── physics-geology.json       # 编辑以修改物理专家
├── biology-medicine.json      # 编辑以修改生物专家
├── social-political.json      # 编辑以修改社会专家
└── economics-resource.json    # 编辑以修改经济专家
```

**可修改内容:**
- ✅ 专家名称
- ✅ 知识范围
- ✅ 法则映射
- ✅ 提示词模板
- ✅ 推理风格

---

## 使用示例

### 示例 1: 科幻世界 - "重力 10 倍"

**输入:**
```
核心前提: 地球重力是正常的 10 倍
```

**DEAC 分析结果:**

**激活专家:**
- 艾萨克·特拉弗洛博士 ⭐⭐ (Space 主要)
- 维塔·奥加尼卡博士 ⭐⭐ (Survival 主要)
- 海伦娜·西维塔斯教授 ⭐ (Power 次要)
- 马库斯·威尔斯通博士 ⭐ (Scarcity 次要)

**核心洞察:**
1. **物理视角**: 建筑必须极其坚固,高层建筑不可行,交通工具能耗激增
2. **生物视角**: 人类骨骼密度增加,身高降低,飞行生物灭绝,爬行动物主导
3. **社会视角**: 垂直社会结构被打破,平等主义社会更可能出现
4. **经济视角**: 运输成本暴涨,本地化经济兴起,轻质材料成为稀缺资源

**涌现洞察:**
- 太空探索几乎不可能,人类文明将永久困在地球
- 体育和娱乐形式完全重构,力量成为最高价值
- 儿童死亡率极高,人口增长缓慢

---

### 示例 2: 奇幻世界 - "魔法取代电力"

**输入:**
```
核心前提: 魔法咒语完全取代了电力,成为能源基础
```

**DEAC 分析结果:**

**激活专家:**
- 艾萨克·特拉弗洛博士 ⭐ (Metaphysics 主要)
- 维塔·奥加尼卡博士 ⭐ (Cognition 主要)
- 海伦娜·西维塔斯教授 ⭐⭐ (Power 主要)
- 马库斯·威尔斯通博士 ⭐⭐ (Scarcity 主要)
- **梅林·阿卡纳教授** 🔮 (特殊专家 - 魔法系统)

**核心洞察:**
1. **魔法视角**: 魔法能量守恒定律,咒语效率等级,魔力耗竭问题
2. **社会视角**: 会施法者成为新贵族,魔法教育资源高度垄断
3. **经济视角**: 魔法石/魔力晶体成为货币,魔法劳动力市场形成
4. **认知视角**: 记忆力和语言能力决定社会地位,文盲被彻底边缘化

**涌现洞察:**
- 出现"魔法黑客"试图破解咒语版权保护
- 魔法污染成为环境问题,类似核废料处理
- 反魔法主义运动兴起,类似现实中的自然主义

---

### 示例 3: 心理世界 - "进入他人梦境"

**输入:**
```
核心前提: 人类可以通过特殊技术进入和操纵他人梦境
```

**DEAC 分析结果:**

**激活专家:**
- 维塔·奥加尼卡博士 ⭐⭐ (Cognition 主要)
- 海伦娜·西维塔斯教授 ⭐⭐ (Power 主要)
- 马库斯·威尔斯通博士 ⭐ (Scarcity 次要)
- **弗洛伊德·翁尼罗博士** 🧠 (特殊专家 - 梦境逻辑)

**核心洞察:**
1. **梦境视角**: 梦境层级结构,象征逻辑,意识边界,梦境稳定性
2. **认知视角**: 记忆植入风险,人格分裂,现实感丧失
3. **社会视角**: 梦境隐私权立法,思想警察,梦境审查制度
4. **经济视角**: 梦境广告业,梦境旅游,梦境治疗产业

**涌现洞察:**
- "梦境难民"现象:逃避现实永久生活在梦中
- 梦境恐怖主义:通过噩梦攻击敌人
- 梦境考古学:探索集体潜意识中的古老记忆

---

## 扩展指南

### 添加新核心专家

1. **创建配置文件**

在 `lib/experts/core/` 目录创建新 JSON 文件:

```bash
lib/experts/core/my-new-expert.json
```

2. **定义专家配置**

```json
{
  "id": "my-new-expert",
  "version": "1.0.0",
  "name": "专家名称",
  "domain": "专业领域",
  "knowledge_scope": ["知识点1", "知识点2"],
  "law_mapping": {
    "primary": ["Law1", "Law2"],
    "secondary": ["Law3"]
  },
  "prompt_template": "你是[专家名]...",
  "reasoning_style": "analytical",
  "expertise_depth": 8,
  "specialization_tags": ["标签1", "标签2"],
  "created_by": "system"
}
```

3. **重启应用**

系统会自动加载新专家,无需修改代码。

---

### 扩展特殊专家触发规则

编辑 `lib/experts/gap-analyzer.ts` 中的 `detectSpecialExpertiseNeeds` 函数:

```typescript
// 添加新的关键词匹配规则
if (lowerPremise.match(/你的关键词|另一个关键词/)) {
  needs.push({
    domain: '你的专业领域',
    reason: '为什么需要这个专家',
    suggested_knowledge: ['知识点1', '知识点2'],
  });
}
```

---

### 自定义专家评分逻辑

修改 `lib/experts/orchestrator.ts` 中的 `selectRelevantExperts` 函数:

```typescript
function selectRelevantExperts(
  experts: ExpertConfig[],
  impactedLaws: Law[],
  maxExperts?: number
): ExpertConfig[] {
  const scored = experts.map(expert => {
    let score = 0;

    // 自定义评分规则
    expert.law_mapping.primary.forEach(law => {
      if (impactedLaws.includes(law)) score += 3;  // 修改权重
    });

    expert.law_mapping.secondary?.forEach(law => {
      if (impactedLaws.includes(law)) score += 1;
    });

    // 添加其他评分因素
    if (expert.expertise_depth > 7) score += 1;

    return { expert, score };
  });

  // ... 排序和筛选逻辑
}
```

---

### 集成到规则生成

修改 `app/api/generate/route.ts`,使用专家洞察增强规则生成:

```typescript
export async function POST(request: NextRequest) {
  const { corePremise, artStyle, deacAnalysis } = await request.json();

  let expertInsights = '';
  if (deacAnalysis?.expert_responses) {
    expertInsights = `\n\n## 专家委员会洞察:\n${
      deacAnalysis.expert_responses
        .map(r => `**${r.expert_name}**: ${r.analysis.substring(0, 200)}...`)
        .join('\n\n')
    }`;
  }

  const enhancedPrompt = EXPERT_COUNCIL_PROMPT + expertInsights;

  // 使用增强后的提示词生成规则
}
```

---

### 性能优化建议

1. **并行查询优化**
   - 使用 `Promise.all()` 并行查询专家
   - 设置合理的超时时间 (30s)

2. **缓存策略**
   - 检查特殊专家缓存后再生成
   - 定期清理过期缓存 (90天)

3. **Token 限制**
   - 综合分析时截断过长的专家响应
   - 限制每位专家的响应长度

4. **错误处理**
   - 单个专家失败不影响整体
   - 提供降级方案(使用核心专家)

---

## 故障排查

### 问题 1: 专家未被激活

**症状:** DEAC 分析返回空数组

**可能原因:**
- 核心专家 JSON 文件格式错误
- `law_mapping` 与 `lawImpacts` 不匹配

**解决方法:**
```bash
# 检查 JSON 格式
cat lib/experts/core/physics-geology.json | jq .

# 检查专家加载日志
# 查看控制台输出
```

---

### 问题 2: 特殊专家生成失败

**症状:** 检测到需求但未生成专家

**可能原因:**
- LLM API 调用失败
- 返回的 JSON 格式不正确

**解决方法:**
```typescript
// 在 prompt-architect.ts 中添加日志
console.log('生成请求:', generation_prompt);
console.log('LLM 响应:', content);
```

---

### 问题 3: 前端未显示专家洞察

**症状:** 验证完成但专家面板不显示

**可能原因:**
- DEAC 请求失败
- `deacAnalysis` 状态未更新

**解决方法:**
```typescript
// 在 page.tsx 中添加日志
.then(fullAnalysis => {
  console.log('DEAC 分析完成:', fullAnalysis);
  setDeacAnalysis({...});
})
.catch(err => {
  console.error('DEAC 错误:', err);
});
```

---

## 最佳实践

### 1. 专家配置

- ✅ 使用清晰、具体的专家名称
- ✅ 知识范围保持 5-8 项
- ✅ 提示词模板包含具体示例
- ✅ 合理分配主要和次要法则

### 2. 差距分析

- ✅ 定期更新关键词匹配规则
- ✅ 监控特殊专家生成频率
- ✅ 清理不常用的特殊专家缓存

### 3. 性能优化

- ✅ 限制同时激活的专家数量 (≤5)
- ✅ 使用并行查询提高响应速度
- ✅ 设置合理的超时时间

### 4. 用户体验

- ✅ 提供加载状态反馈
- ✅ 允许折叠/展开专家面板
- ✅ 突出显示关键警告和建议

---

## 版本历史

### v1.0.0 (2026-01-08)

**新增功能:**
- ✅ 4 位核心专家系统
- ✅ 动态差距分析
- ✅ 提示词建筑师 (特殊专家生成)
- ✅ 专家缓存机制
- ✅ 多专家综合分析
- ✅ 前端 UI 集成

**技术栈:**
- Next.js 16 (App Router)
- TypeScript
- DeepSeek API / OpenAI API
- React 19

---

## 许可与贡献

### 许可

DEAC 模块遵循项目主许可协议。

### 贡献指南

欢迎贡献:
- 🎯 新核心专家配置
- 🎯 特殊领域关键词规则
- 🎯 专家评分算法优化
- 🎯 UI/UX 改进

---

## 联系与支持

- 📧 问题反馈: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 文档更新: 本文档持续维护
- 💬 讨论区: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**文档结束**

最后更新: 2026-01-08
版本: 1.0.0
作者: Claude Sonnet 4.5
