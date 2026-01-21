# 特殊专家智能复用系统

**版本**: 1.0.0
**更新日期**: 2026-01-19

---

## 概述

智能专家复用系统通过AI分析自动决定是否复用、更新或创建特殊专家,避免重复创建相似专家,提高系统效率和一致性。

### 核心特性

- 🔍 **智能匹配** - 使用LLM分析新需求与已缓存专家的相似度
- ♻️ **自动复用** - 相似度≥90%时直接复用现有专家
- 🔄 **智能更新** - 相似度70-89%时更新现有专家,合并新知识
- ✨ **按需创建** - 相似度<70%时创建全新专家
- 📊 **相似度分析** - 多维度评估(领域重叠、知识重叠、专业匹配)

---

## 工作流程

```
用户请求特殊专家
    ↓
加载所有已缓存的特殊专家
    ↓
LLM分析相似度 (0-100)
    ↓
    ├─ 90-100分: 直接复用 → 返回现有专家
    ├─ 70-89分:  智能更新 → 合并知识 → 保存 → 返回更新后专家
    └─ 0-69分:   创建新专家 → 保存 → 返回新专家
```

---

## 使用示例

### 场景1: 完全相同的请求 (复用)

**请求**:
```javascript
{
  domain: "魔法系统与超自然物理学",
  reason: "需要分析魔法能量系统",
  knowledge_scope: ["魔法能量系统", "咒语机制"],
  heterogeneity_point: "魔法与科技并存的世界"
}
```

**结果**:
```
🔍 正在为领域 "魔法系统与超自然物理学" 智能匹配专家...
♻️  已有专家"墨法·林玄教授"完全满足需求,直接复用
```

### 场景2: 相似但需补充 (更新)

**请求**:
```javascript
{
  domain: "魔法系统与超自然物理学",
  reason: "需要分析魔法生物学",
  knowledge_scope: ["魔法生物学", "魔法遗传学", "魔法变异"],
  heterogeneity_point: "魔法改变生物DNA的世界"
}
```

**结果**:
```
🔍 正在为领域 "魔法系统与超自然物理学" 智能匹配专家...
最佳匹配专家: 墨法·林玄教授
相似度: 82/100
正在更新专家 "墨法·林玄教授" 以包含新知识...
🔄 已更新专家"墨法·林玄教授"以包含新知识领域
```

**更新内容**:
- `version`: 2.0.0 → 2.1.0
- `knowledge_scope`: 新增"魔法生物学"、"魔法遗传学"等
- `updated_at`: 更新时间戳

### 场景3: 全新领域 (创建)

**请求**:
```javascript
{
  domain: "跨维度旅行与平行宇宙理论",
  reason: "需要分析多维度物理规则",
  knowledge_scope: ["平行宇宙", "维度跳跃", "多维时空"],
  heterogeneity_point: "人们通过镜子进入平行世界"
}
```

**结果**:
```
🔍 正在为领域 "跨维度旅行与平行宇宙理论" 智能匹配专家...
最佳匹配专家: 墨法·林玄教授
相似度: 45/100
✨ 现有专家覆盖不足(最高相似度45%),需要创建新专家
正在创建新的特殊专家...
✅ 已创建并缓存新专家: 维度·平行教授
```

---

## 相似度计算

LLM会从以下维度评估相似度:

| 维度 | 权重 | 说明 |
|-----|------|------|
| **领域重叠** (domain_overlap) | 40% | 专业领域的语义相似度 |
| **知识重叠** (knowledge_overlap) | 40% | 知识范围的交集程度 |
| **专业匹配** (specialization_match) | 20% | 专业标签的匹配度 |

**相似度评分标准**:
- **90-100**: 几乎完全相同,可直接复用
- **70-89**: 大致相同但需要补充知识,应该更新
- **50-69**: 有一定重叠但方向不同,建议创建新专家
- **0-49**: 完全不同,必须创建新专家

---

## 专家合并功能

### 识别重复专家

系统按领域自动分组,识别同一领域的多个专家:

```bash
npm run cleanup-experts
```

**输出示例**:
```
发现 2 个重复领域:
   - 建议合并 "魔法系统与超自然物理学" 领域的4个专家
   - 建议合并 "时间法则分析" 领域的2个专家
```

### 合并过程

1. **分析重复组** - 识别同一领域的多个专家
2. **LLM合并** - 使用AI合并知识范围、标签、提示词
3. **保存结果** - 生成version 2.0.0的合并专家
4. **删除旧文件** - 清理被合并的旧专家文件
5. **保留历史** - 在`merged_from`字段记录来源

**合并后的专家配置**:
```json
{
  "id": "magic-physics-expert",
  "version": "2.0.0",
  "name": "墨法·林玄教授",
  "knowledge_scope": [
    "魔法能量系统与守恒定律",
    "咒语机制与符文理论",
    "魔法与蒸汽科技融合原理",
    "现实裂痕现象与时空魔法",
    "魔法垄断体系的权力结构",
    "..."
  ],
  "created_by": "expert_merger",
  "updated_at": "2026-01-19T05:50:00.000Z",
  "merged_from": [
    "magic-steam-physics-expert",
    "mo-fa-wu-li-xue-jia",
    "steampunk-magic-physics-expert"
  ]
}
```

---

## 当前特殊专家库

整理后的特殊专家列表:

### 1. 魔法系统与超自然物理学
**墨法·林玄教授** (`magic-physics-expert`)
- **版本**: 2.0.0 (合并版本)
- **知识范围**: 9项核心知识
- **合并自**: 4个重复的魔法物理学专家
- **擅长**: 魔法能量系统、咒语机制、魔法与科技融合、现实裂痕、魔法垄断

### 2. 时间法则与重力异常分析
**时重博士** (`time-gravity-lie-expert`)
- **版本**: 2.0.0 (合并版本)
- **知识范围**: 9项核心知识
- **合并自**: 2个重复的时间分析专家
- **擅长**: 时间-重力耦合、时间累积效应、时间动力学、时间悖论

### 3. 蒸汽朋克时间分析
**钟摆教授** (`steam-time-analyst`)
- **版本**: 1.0.0
- **知识范围**: 8项核心知识
- **擅长**: 蒸汽朋克时间理论、机器人统治的时间感知、时间扭曲

---

## 技术实现

### 核心文件

```
lib/experts/
├── expert-matcher.ts          # 智能匹配器
├── prompt-architect.ts        # 专家生成器(已集成智能复用)
├── loader.ts                  # 专家加载器
└── orchestrator.ts            # 专家调度器

lib/deac/
└── cache-manager.ts           # 缓存管理器

scripts/
├── cleanup-special-experts.ts # 专家整理脚本
└── test-smart-matching.ts     # 智能匹配测试
```

### 关键函数

#### 1. smartMatchExpert()
```typescript
interface MatchResult {
  action: 'reuse' | 'update' | 'create';
  expert?: ExpertConfig;
  similarity: number;
  reason: string;
}

await smartMatchExpert(request: SpecialExpertRequest): Promise<MatchResult>
```

#### 2. analyzeExpertSimilarity()
```typescript
await analyzeExpertSimilarity(
  existingExpert: ExpertConfig,
  newRequest: SpecialExpertRequest
): Promise<{ similarity: number; reason: string }>
```

#### 3. updateExpertWithNewKnowledge()
```typescript
await updateExpertWithNewKnowledge(
  existingExpert: ExpertConfig,
  newRequest: SpecialExpertRequest
): Promise<ExpertConfig>
```

#### 4. mergeExperts()
```typescript
await mergeExperts(experts: ExpertConfig[]): Promise<ExpertConfig>
```

---

## 测试验证

### 运行智能匹配测试

```bash
npm run test:smart-matching
```

**测试场景**:
1. ✅ 相同请求 → 复用
2. ✅ 相似请求 → 更新
3. ✅ 新领域请求 → 创建
4. ✅ 时间相关请求 → 智能判断

### 手动测试

```bash
# 整理重复专家
npm run cleanup-experts

# 测试DEAC系统
npm run test:deac-experts
```

---

## 配置选项

### 相似度阈值调整

如果需要调整复用/更新/创建的阈值,编辑 `lib/experts/expert-matcher.ts`:

```typescript
if (bestMatch.similarity >= 90) {
  return { action: 'reuse', ... };
} else if (bestMatch.similarity >= 70) {  // 可调整此阈值
  return { action: 'update', ... };
} else {
  return { action: 'create', ... };
}
```

### LLM模型选择

系统优先使用DeepSeek,备用OpenAI:

```typescript
const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini';
```

---

## 最佳实践

### 1. 定期整理
建议每月运行一次专家整理脚本,清理重复专家:
```bash
npm run cleanup-experts
```

### 2. 监控日志
关注控制台输出,了解专家复用情况:
```
🔍 正在为领域 "XXX" 智能匹配专家...
♻️  已有专家"YYY"完全满足需求,直接复用
```

### 3. 版本管理
- 新创建的专家: `version: "1.0.0"`
- 更新后的专家: `version: "1.1.0"`, `1.2.0"`, ...
- 合并后的专家: `version: "2.0.0"`

### 4. 知识范围设计
保持知识范围在6-10项之间,过少不够专业,过多不够聚焦。

---

## 故障排查

### 问题1: 总是创建新专家,不复用

**可能原因**:
- 领域描述差异过大
- 知识范围没有交集
- 相似度阈值设置过高

**解决方案**:
- 统一领域命名(如统一使用"魔法系统"而非"魔法学"、"魔法理论")
- 降低更新阈值(从70改为60)
- 检查日志中的相似度评分

### 问题2: API调用失败

**可能原因**:
- 未设置API密钥
- API密钥无效
- 网络问题

**解决方案**:
```bash
# 检查.env文件
cat .env | grep API_KEY

# 设置API密钥
echo "DEEPSEEK_API_KEY=your-key" >> .env
```

### 问题3: 合并后专家质量下降

**可能原因**:
- 合并了不相关的专家
- 知识范围过于宽泛

**解决方案**:
- 手动检查合并结果
- 必要时拆分为多个专家
- 调整prompt_template使其更聚焦

---

## 更新日志

### v1.0.0 (2026-01-19)
- ✅ 创建智能专家匹配系统
- ✅ 实现相似度分析(使用LLM)
- ✅ 实现专家更新功能
- ✅ 实现专家合并功能
- ✅ 整理现有特殊专家(7个→3个)
- ✅ 集成到prompt-architect.ts
- ✅ 创建测试脚本和文档

---

## 未来改进

- [ ] 添加专家评分系统(基于使用频率和效果)
- [ ] 支持专家版本回滚
- [ ] 实现专家推荐系统(主动建议复用)
- [ ] 添加专家知识图谱可视化
- [ ] 支持多语言专家配置

---

**系统设计**: Claude Sonnet 4.5
**最后更新**: 2026-01-19
**文档版本**: 1.0.0
