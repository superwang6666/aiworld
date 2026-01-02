/**
 * 方向独特性评估规则配置
 *
 * 这个文件定义了用于评估多米诺效应分析中各个方向（Law Impacts）独特性的规则。
 * AI 会根据这些规则对每个方向进行评分（0-100）并判断是否合格。
 */

export interface EvaluationRule {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  weight?: number; // 权重，用于未来扩展
}

export interface EvaluationConfig {
  version: string;
  minPassingScore: number; // 最低合格分数
  rules: EvaluationRule[];
  systemPrompt: string; // 给 AI 的系统提示
}

export const EVALUATION_CONFIG: EvaluationConfig = {
  version: '1.0.0',
  minPassingScore: 60,

  rules: [
    {
      id: 'non-linear-causality',
      name: '非线性因果关系',
      description: '方向必须展示非传统的因果链，而不是简单的 A 导致 B',
      criteria: [
        '因果关系是双向的、循环的或多重反馈的',
        '存在延迟效应或意外后果',
        '小的变化可能导致系统性的大影响（蝴蝶效应）',
      ],
      weight: 1.5,
    },
    {
      id: 'multi-sensory-impact',
      name: '多感官维度影响',
      description: '方向应该同时影响多个感知或体验维度',
      criteria: [
        '同时影响物理、心理、社会等多个层面',
        '不仅是视觉的，还涉及触觉、听觉、空间感等',
        '创造出综合性的体验而非单一维度的改变',
      ],
      weight: 1.2,
    },
    {
      id: 'emergent-properties',
      name: '涌现特性',
      description: '方向应创造出单个组件不具备的新特性',
      criteria: [
        '整体效果大于部分之和',
        '产生了在原始设定中无法预见的新现象',
        '创造了新的系统级行为模式',
      ],
      weight: 1.8,
    },
    {
      id: 'social-restructuring',
      name: '社会结构重塑',
      description: '方向对社会结构、权力关系、文化规范产生根本性改变',
      criteria: [
        '改变了基本的社会组织方式',
        '重新定义了权力、资源或地位的分配逻辑',
        '创造了新的社会阶层或身份类别',
      ],
      weight: 1.3,
    },
    {
      id: 'paradox-generation',
      name: '悖论生成',
      description: '方向应该创造有趣的悖论、两难困境或哲学问题',
      criteria: [
        '产生了难以简单解决的伦理困境',
        '存在内在的矛盾或张力',
        '挑战现有的哲学或道德框架',
      ],
      weight: 1.4,
    },
    {
      id: 'scalability',
      name: '可扩展性影响',
      description: '方向的影响能够在不同尺度上产生有意义的变化',
      criteria: [
        '从个人层面到全球层面都有相关影响',
        '在微观和宏观层面都有独特表现',
        '影响能够跨越时间尺度（即时效应和长期影响）',
      ],
      weight: 1.0,
    },
  ],

  systemPrompt: `你是世界构筑专家，负责评估多米诺效应分析中各个方向的独特性和质量。

## 评估标准

你需要根据以下规则对每个方向（Law Impact）进行评估：

### 1. 非线性因果关系 (权重: 1.5)
- 因果关系是双向的、循环的或多重反馈的
- 存在延迟效应或意外后果
- 小的变化可能导致系统性的大影响（蝴蝶效应）

### 2. 多感官维度影响 (权重: 1.2)
- 同时影响物理、心理、社会等多个层面
- 不仅是视觉的，还涉及触觉、听觉、空间感等
- 创造出综合性的体验而非单一维度的改变

### 3. 涌现特性 (权重: 1.8)
- 整体效果大于部分之和
- 产生了在原始设定中无法预见的新现象
- 创造了新的系统级行为模式

### 4. 社会结构重塑 (权重: 1.3)
- 改变了基本的社会组织方式
- 重新定义了权力、资源或地位的分配逻辑
- 创造了新的社会阶层或身份类别

### 5. 悖论生成 (权重: 1.4)
- 产生了难以简单解决的伦理困境
- 存在内在的矛盾或张力
- 挑战现有的哲学或道德框架

### 6. 可扩展性影响 (权重: 1.0)
- 从个人层面到全球层面都有相关影响
- 在微观和宏观层面都有独特表现
- 影响能够跨越时间尺度（即时效应和长期影响）

## 评分指南

- **0-30分**: 不符合标准，过于简单或派生性的
- **31-60分**: 部分符合标准，有一些有趣的元素但缺乏深度
- **61-85分**: 强烈符合标准，展示了独特且引人入胜的元素
- **86-100分**: 例外地符合标准，革命性且范式转换的

## 评估要求

1. 仔细阅读每个 Law Impact 的描述和示例
2. 对照上述 6 个规则进行评估
3. 为每个方向给出 0-100 的独特性评分
4. 列出该方向通过了哪些具体的评估标准（引用上面的具体条目）
5. 保持客观和严格，只有真正优秀的方向才应获得高分

记住：评估应该严格且有区分度。大多数方向应该在 40-70 分之间，只有真正卓越的方向才能超过 80 分。

## JSON 响应格式要求

CRITICAL: 你必须返回有效的 JSON 格式，使用双引号 (") 而非单引号 (')。

返回格式如下：
{
  "evaluatedImpacts": [
    {
      "law": "Space",
      "impact": "保留原始的影响描述",
      "example": "保留原始的示例",
      "uniquenessScore": 75,
      "passedCriteria": [
        "满足的具体标准描述1",
        "满足的具体标准描述2"
      ]
    }
  ]
}

重要：
1. 必须包含输入中的所有 Law Impacts，保持相同顺序
2. 每个 impact 保留原始的 law、impact 和 example 字段
3. 为每个添加 uniquenessScore (0-100) 和 passedCriteria 数组
4. passedCriteria 应列出该方向满足的具体评估标准
5. 只使用双引号 (") 表示字符串`,
};

/**
 * 生成用于 API 调用的评估提示词
 */
export function generateEvaluationPrompt(): string {
  const ruleDescriptions = EVALUATION_CONFIG.rules
    .map((rule, index) => {
      const criteriaList = rule.criteria
        .map((criterion) => `  - ${criterion}`)
        .join('\n');
      return `${index + 1}. **${rule.name}** (权重: ${rule.weight || 1.0})\n   ${rule.description}\n${criteriaList}`;
    })
    .join('\n\n');

  return `${ruleDescriptions}

请根据以上规则，对每个方向进行全面评估。`;
}
