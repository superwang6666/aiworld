# DEAC - Dynamic Expert Agent Cluster

**智能多专家分析系统 for 世界构建**

版本: 2.0.0 (更新于 2026-01-19)

---

## 概述

DEAC (Dynamic Expert Agent Cluster) 是一个智能多专家分析系统,为世界构建提供多维度的深度洞察。系统通过激活相关领域的AI专家,从不同学科视角分析核心异质点,识别潜在问题并提供建议。

### 核心特性

- **6个核心专家** - 覆盖从物理基础到权力结构的完整世界构建光谱
- **7大法则框架** - 基于Space, Survival, Cognition, Scarcity, Time, Power, Metaphysics
- **智能激活** - 根据异质点自动选择最相关的专家
- **多样推理** - 5种推理风格确保全面的分析视角
- **综合洞察** - AI自动整合多个专家的观点,识别共识与分歧
- **特殊专家** - 按需生成针对特定异质点的专业专家

---

## 6个核心专家

### 1. 地质学与气候学家 (The Foundation) 🌍
**泰拉·格奥教授** - 分析世界的物理框架和环境条件
- **主要法则**: Space, Survival
- **推理风格**: Analytical

### 2. 人类学家与社会学家 (The Culture) 🎭
**卡尔图拉·索西亚博士** - 分析人类如何为世界赋予意义
- **主要法则**: Cognition, Metaphysics
- **推理风格**: Holistic

### 3. 语言学家 (The Voice) 💬
**林古瓦·沃克斯教授** - 分析语言如何塑造思维和传递权力
- **主要法则**: Cognition, Power
- **推理风格**: Speculative

### 4. 经济学家 (The Flow) 💰
**弗洛·艾科诺博士** - 分析资源如何流动和价值如何分配
- **主要法则**: Scarcity, Power
- **推理风格**: Empirical

### 5. 历史学家与考古学家 (The Layers) 📜
**克罗诺·阿尔凯教授** - 分析时间如何积累和历史如何塑造认知
- **主要法则**: Time, Cognition
- **推理风格**: Analytical

### 6. 政治学家与军事专家 (The Power) ⚔️
**斯特拉特吉·波利斯将军** - 分析权力如何运作和冲突如何展开
- **主要法则**: Power, Space
- **推理风格**: Adversarial

📖 **详细专家信息**: 参见 [DEAC-EXPERTS.md](./DEAC-EXPERTS.md)

---

## 工作流程

```
用户输入异质点
    ↓
步骤2: 验证前提 (生成ValidationResult)
    ↓
触发DEAC (后台异步)
    ↓
自动激活相关专家 (基于lawImpacts)
    ↓
并行查询所有专家
    ↓
AI综合分析 (识别共识、分歧、涌现洞察)
    ↓
展示专家面板 (ExpertInsightsPanel)
```

### 专家激活逻辑

1. 从验证结果提取 `lawImpacts`
2. 为每个专家评分:
   - 主要法则匹配: +2分
   - 次要法则匹配: +1分
3. 按分数排序,激活得分最高的专家
4. 最多同时激活5位专家

---

## 快速开始

### 1. 系统已自动集成

DEAC系统已集成到主工作流的步骤2(验证前提)中。当用户提交异质点时,系统会:
- 自动分析法则影响
- 激活相关专家
- 在验证报告下方显示专家洞察

### 2. 查看专家分析

在验证报告下方,点击 **"专家委员会洞察 (X 位专家)"** 展开面板:
- 每位专家的分析摘要
- 警告和建议
- 综合共识和风险评估
- 涌现洞察

### 3. 添加自定义专家

在 `lib/experts/core/` 目录下创建新的JSON配置文件:

```json
{
  "id": "your-expert-id",
  "version": "1.0.0",
  "name": "专家名称",
  "domain": "专业领域",
  "knowledge_scope": ["知识点1", "知识点2", ...],
  "law_mapping": {
    "primary": ["Law1"],
    "secondary": ["Law2"]
  },
  "prompt_template": "系统提示词...",
  "reasoning_style": "analytical",
  "expertise_depth": 7,
  "specialization_tags": ["标签1"],
  "created_by": "system"
}
```

重启应用即可自动加载新专家。

---

## API端点

### 1. 激活专家
```
POST /api/deac/activate
Body: { heterogeneity_point, law_impacts }
Response: { activated_experts[] }
```

### 2. 查询专家
```
POST /api/deac/query
Body: { expert_id, heterogeneity_point }
Response: { expert_response }
```

### 3. 综合分析
```
POST /api/deac/synthesize
Body: { expert_responses[], heterogeneity_point }
Response: { synthesis }
```

---

## 技术架构

### 目录结构

```
lib/experts/
├── core/                          # 核心专家配置
│   ├── geology-climate.json
│   ├── anthropology-sociology.json
│   ├── linguistics.json
│   ├── economics.json
│   ├── history-archaeology.json
│   └── politics-military.json
├── special/                       # 特殊专家(按需生成)
└── loader.ts                      # 专家加载器

app/api/deac/
├── activate/route.ts              # 激活专家
├── query/route.ts                 # 查询专家
└── synthesize/route.ts            # 综合分析

components/
└── ExpertInsightsPanel.tsx        # 专家洞察UI组件
```

### 类型定义

主要类型定义在 `types/index.ts`:
- `ExpertConfig` - 专家配置
- `ExpertResponse` - 专家响应
- `DEACAnalysis` - DEAC分析结果
- `Law` - 7大法则枚举

---

## 使用示例

### 地理异质点
**输入**: "大陆呈环形排列,中心是永恒风暴"
**激活**: 地质气候专家(主导) + 政治军事专家 + 经济学专家

### 文化异质点
**输入**: "社会通过集体意识连接,个体自我模糊"
**激活**: 人类社会专家(主导) + 语言学专家 + 政治军事专家

### 时间异质点
**输入**: "每个人都能预见自己的死亡时刻"
**激活**: 历史考古专家(主导) + 人类社会专家 + 经济学专家

---

## 配置选项

### 环境变量

```env
# API密钥 (必需)
DEEPSEEK_API_KEY=your-key        # 优先使用DeepSeek
OPENAI_API_KEY=your-key          # 备用OpenAI

# DEAC配置 (可选)
DEAC_MAX_EXPERTS=5               # 最大激活专家数
DEAC_TEMPERATURE=0.7             # AI温度参数
```

---

## 法则覆盖分析

| 法则 | 主要专家数 | 覆盖强度 |
|------|----------|----------|
| Space | 2 | ★★★★ |
| Survival | 1 | ★★★ |
| Cognition | 3 | ★★★★★ |
| Scarcity | 1 | ★★★★ |
| Time | 1 | ★★★★★ |
| Power | 3 | ★★★★★ |
| Metaphysics | 1 | ★★★ |

✅ **所有法则至少有1个主要专家覆盖**

📊 **详细覆盖矩阵**: 参见 [DEAC-EXPERTS.md](./DEAC-EXPERTS.md)

---

## 性能优化

- **并行查询**: 所有专家同时查询,响应时间仅取决于最慢的专家
- **异步执行**: DEAC在后台运行,不阻塞用户界面
- **缓存策略**: 特殊专家配置缓存到 `lib/experts/special/`
- **智能激活**: 只激活相关专家,避免不必要的API调用

---

## 版本历史

### v2.0.0 (2026-01-19) - 6专家体系
- ✅ 从4个专家升级到6个专家
- ✅ 新增语言学专家和历史考古专家
- ✅ 重新设计法则映射,实现均衡覆盖
- ✅ 增加推理风格多样性(5种风格)
- ✅ 完善文档和使用示例

### v1.0.0 (2026-01-08) - 初始版本
- 4个核心专家 (物理地质、生物医学、社会政治、经济资源)
- 基础专家激活和查询功能

---

## 常见问题

### Q: 为什么有时只激活1-2个专家?
A: 这是正常的。系统根据异质点的法则影响智能激活。简单的异质点可能只需要少数专家。

### Q: 特殊专家什么时候生成?
A: 当核心专家无法充分覆盖异质点时(例如魔法系统、时间悖论),Prompt Architect Agent会自动生成特殊专家。

### Q: 如何禁用DEAC?
A: 在 `app/api/worldbuilding/validate/route.ts` 中注释掉DEAC相关代码,但不推荐这样做。

### Q: 专家分析质量如何提升?
A: 编辑 `lib/experts/core/*.json` 中的 `prompt_template`,添加更具体的分析维度和示例。

---

## 贡献指南

欢迎改进DEAC系统:

1. **添加新核心专家**: 在 `lib/experts/core/` 创建JSON配置
2. **优化提示词**: 编辑现有专家的 `prompt_template`
3. **改进UI**: 修改 `components/ExpertInsightsPanel.tsx`
4. **扩展API**: 在 `app/api/deac/` 添加新端点

---

## 相关文档

- [DEAC-EXPERTS.md](./DEAC-EXPERTS.md) - 6个核心专家详细说明
- [README.md](./README.md) - 项目主文档
- [SEVEN-LAWS.md](./SEVEN-LAWS.md) - 7大法则框架说明 (如果存在)

---

**系统设计**: Claude Sonnet 4.5
**最后更新**: 2026-01-19
**文档版本**: 2.0.0
