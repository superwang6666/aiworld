# HIL-Archive 系统集成指南

## 概述

HIL-Archive系统已成功实现核心功能。本文档说明如何将其集成到主应用(`app/page.tsx`)中。

---

## ✅ 已完成的功能

### 1. 核心基础设施
- ✅ 类型定义扩展 (`types/index.ts`)
- ✅ 22个预定义标签 (`config/predefined-tags.ts`)
- ✅ 50+个学科分类 (`config/academic-disciplines.ts`)

### 2. 标签系统
- ✅ 标签权重管理 (`lib/tags/tag-manager.ts`)
- ✅ 混合标签生成 (`lib/tags/tag-generator.ts`)
- ✅ 预测删除引擎 (`lib/tags/prediction-engine.ts`)
- ✅ API端点: `/api/tags/generate`, `/api/tags/update-weights`

### 3. 学科映射
- ✅ 规则到学科映射 (`lib/archive/discipline-mapper.ts`)

### 4. 存档系统
- ✅ 存档CRUD管理 (`lib/archive/archive-manager.ts`)
- ✅ API端点: `/api/archive/save`, `/api/archive/load`, `/api/archive/list`, `/api/archive/delete`

### 5. UI组件
- ✅ 改造后的RuleCard (标签显示、删除按钮、预测警告)
- ✅ ArchiveManager组件 (存档列表管理)

---

## 🔧 集成到 app/page.tsx

### Step 1: 添加状态管理

在`app/page.tsx`的顶部添加新的state:

```typescript
import { RuleTag, WorldArchive } from '@/types';
import { initializeTagWeights } from '@/lib/tags/tag-manager';
import { calculateDeletionScoresForRules } from '@/lib/tags/prediction-engine';
import { mapRulesToDisciplines, calculateDisciplineCoverage } from '@/lib/archive/discipline-mapper';
import ArchiveManager from '@/components/ArchiveManager';

// 在现有state后添加:
const [tagWeights, setTagWeights] = useState<Record<string, RuleTag>>(
  initializeTagWeights()
);
const [showArchiveManager, setShowArchiveManager] = useState(false);
const [archiveName, setArchiveName] = useState('');
```

### Step 2: 在规则生成后自动打标签

修改`handleGenerateRules`函数,在规则生成后调用标签生成API:

```typescript
// 在规则生成成功后,现有的 setRules(data.rules) 之后添加:

// 自动生成标签
try {
  const tagResponse = await fetch('/api/tags/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rules: data.rules }),
  });

  if (tagResponse.ok) {
    const tagData = await tagResponse.json();

    // 将标签附加到规则
    const rulesWithTags = data.rules.map((rule: WorldRule, index: number) => ({
      ...rule,
      tags: tagData.results[index]?.recommendedTagIds || [],
      discipline_codes: [],
      rejected: false,
      created_at: new Date().toISOString(),
    }));

    // 映射学科
    const rulesWithDisciplines = mapRulesToDisciplines(rulesWithTags);

    // 计算删除评分
    const rulesWithScores = calculateDeletionScoresForRules(
      rulesWithDisciplines,
      tagWeights
    );

    // 合并LLM生成的新标签
    const allNewTags = tagData.results.flatMap(
      (r: any) => r.llmGeneratedTags || []
    );
    if (allNewTags.length > 0) {
      setTagWeights((prev) => {
        const updated = { ...prev };
        allNewTags.forEach((tag: RuleTag) => {
          if (!updated[tag.id]) {
            updated[tag.id] = tag;
          }
        });
        return updated;
      });
    }

    setRules(rulesWithScores);
    console.log('标签生成完成:', tagData.results.length, '条规则已打标签');
  }
} catch (tagError) {
  console.error('标签生成失败,使用原始规则:', tagError);
  // 即使标签生成失败,也设置规则
  setRules(data.rules);
}
```

### Step 3: 添加删除规则处理

添加新的handler函数:

```typescript
const handleDeleteRule = async (ruleId: string) => {
  const rule = rules.find((r) => r.id === ruleId);
  if (!rule) return;

  // 标记规则为已删除
  setRules((prevRules) =>
    prevRules.map((r) =>
      r.id === ruleId ? { ...r, rejected: true } : r
    )
  );

  // 更新标签权重
  try {
    const response = await fetch('/api/tags/update-weights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        tags: rule.tags,
        currentWeights: tagWeights,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setTagWeights(data.updated_weights);

      // 重新计算所有规则的删除评分
      setRules((prevRules) =>
        calculateDeletionScoresForRules(prevRules, data.updated_weights)
      );

      console.log('标签权重已更新,删除评分已重新计算');
    }
  } catch (error) {
    console.error('更新标签权重失败:', error);
  }
};
```

### Step 4: 修改确认规则处理

修改现有的`handleToggleRule`函数:

```typescript
const handleToggleRule = async (id: string) => {
  const rule = rules.find((r) => r.id === id);
  if (!rule) return;

  const newConfirmedState = !rule.confirmed;

  setRules((prevRules) =>
    prevRules.map((r) =>
      r.id === id ? { ...r, confirmed: newConfirmedState } : r
    )
  );

  // 如果是确认操作,提升标签权重
  if (newConfirmedState) {
    try {
      const response = await fetch('/api/tags/update-weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          tags: rule.tags,
          currentWeights: tagWeights,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTagWeights(data.updated_weights);

        // 重新计算删除评分
        setRules((prevRules) =>
          calculateDeletionScoresForRules(prevRules, data.updated_weights)
        );
      }
    } catch (error) {
      console.error('更新标签权重失败:', error);
    }
  }
};
```

### Step 5: 添加保存存档功能

添加新的handler:

```typescript
const handleSaveArchive = async () => {
  if (!archiveName.trim()) {
    alert('请输入存档名称');
    return;
  }

  if (!validationResult) {
    alert('缺少验证结果,无法保存存档');
    return;
  }

  try {
    const archive: WorldArchive = {
      id: '', // 由服务器生成
      name: archiveName.trim(),
      core_premise: corePremise,
      art_style: artStyle,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      validation_result: validationResult,
      law_weights: lawWeights,
      deac_analysis: deacAnalysis || undefined,
      rules: rules,
      tag_weights: exportTagWeightsSnapshot(tagWeights),
      discipline_coverage: calculateDisciplineCoverage(rules),
      total_rules_generated: rules.length,
      active_rules_count: rules.filter((r) => !r.rejected).length,
      confirmed_rules_count: rules.filter((r) => r.confirmed).length,
      generation_sessions: 1,
    };

    const response = await fetch('/api/archive/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archive }),
    });

    if (!response.ok) {
      throw new Error('保存失败');
    }

    const data = await response.json();
    alert(`存档保存成功! ID: ${data.archive_id}`);
    setArchiveName('');
  } catch (error) {
    alert('保存存档失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
};
```

需要导入:
```typescript
import { exportTagWeightsSnapshot } from '@/lib/tags/tag-manager';
```

### Step 6: 添加加载存档功能

```typescript
const handleLoadArchive = async (archiveId: string) => {
  try {
    const response = await fetch(`/api/archive/load?id=${archiveId}`);

    if (!response.ok) {
      throw new Error('加载失败');
    }

    const data = await response.json();
    const archive: WorldArchive = data.archive;

    // 恢复所有状态
    setCorePremise(archive.core_premise);
    setArtStyle(archive.art_style || '');
    setValidationResult(archive.validation_result);
    setLawWeights(archive.law_weights);
    setDeacAnalysis(archive.deac_analysis || null);
    setRules(archive.rules);

    // 恢复标签权重
    const restored = restoreTagWeightsFromSnapshot(
      archive.tag_weights,
      initializeTagWeights()
    );
    setTagWeights(restored);

    setCurrentStep('rules');
    setShowArchiveManager(false);
    setArchiveName(archive.name);

    alert(`存档"${archive.name}"已加载`);
  } catch (error) {
    alert('加载存档失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
};
```

需要导入:
```typescript
import { restoreTagWeightsFromSnapshot } from '@/lib/tags/tag-manager';
```

### Step 7: 在UI中添加存档管理按钮

在规则展示区域的顶部添加:

```tsx
{/* 存档管理栏 */}
{currentStep === 'rules' && (
  <div className="border border-gray-800 bg-[#111111] rounded-lg p-4 mb-6">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <input
          type="text"
          value={archiveName}
          onChange={(e) => setArchiveName(e.target.value)}
          placeholder="存档名称..."
          className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded text-[#e5e5e5] font-mono"
        />
        <button
          onClick={handleSaveArchive}
          disabled={!archiveName.trim()}
          className="px-6 py-2 bg-[#00ff88] text-black font-bold rounded hover:bg-[#00cc6f] disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
        >
          保存存档
        </button>
      </div>
      <button
        onClick={() => setShowArchiveManager(true)}
        className="px-6 py-2 border border-[#00ff88] text-[#00ff88] font-bold rounded hover:bg-[#00ff88]/10 transition-colors"
      >
        管理存档
      </button>
    </div>
  </div>
)}

{/* 存档管理器 Modal */}
{showArchiveManager && (
  <ArchiveManager
    onLoadArchive={handleLoadArchive}
    onClose={() => setShowArchiveManager(false)}
  />
)}
```

### Step 8: 更新RuleCard调用

修改RuleCard的渲染,传递新的props:

```tsx
<RuleCard
  key={rule.id}
  rule={rule}
  onToggle={handleToggleRule}
  onDelete={handleDeleteRule}  // 新增
  tagWeights={tagWeights}       // 新增
  showPrediction={true}         // 新增
/>
```

---

## 🧪 测试验证

启动开发服务器后,测试以下流程:

### 1. 标签生成测试
1. 生成20条规则
2. 检查每条规则是否显示标签 (紫色徽章)
3. 查看控制台是否有"标签生成完成"日志

### 2. 删除与预测测试
1. 删除2-3条规则 (点击红色垃圾桶按钮)
2. 观察其他规则是否出现黄色/红色警告标识
3. 检查控制台"标签权重已更新"日志

### 3. 确认功能测试
1. 确认几条规则 (点击绿色对勾按钮)
2. 观察预测评分是否下降

### 4. 存档功能测试
1. 输入存档名称,点击"保存存档"
2. 点击"管理存档",查看存档列表
3. 加载一个存档,验证所有状态是否正确恢复

---

## 🎨 UI效果预览

### 标签显示
- 紫色徽章显示标签名称
- 鼠标悬停显示权重百分比

### 预测警告
- 黄色标识: 删除评分 ≥ 60%
- 红色标识: 删除评分 ≥ 75%
- 警告文本: "根据您的偏好,这条规则可能不符合您的审美"

### 删除按钮
- 红色圆形按钮,垃圾桶图标
- 工具提示: "删除规则 (将降低相关标签权重)"

---

## 📝 注意事项

1. **类型安全**: 确保导入所有新类型定义
2. **错误处理**: 所有API调用都有try-catch保护
3. **用户反馈**: 关键操作都有alert提示
4. **性能优化**: 标签生成是在规则生成后异步进行,不阻塞主流程

---

## 🔗 相关文件索引

- 类型定义: `types/index.ts`
- 标签配置: `config/predefined-tags.ts`
- 学科配置: `config/academic-disciplines.ts`
- 标签管理: `lib/tags/tag-manager.ts`
- 标签生成: `lib/tags/tag-generator.ts`
- 预测引擎: `lib/tags/prediction-engine.ts`
- 学科映射: `lib/archive/discipline-mapper.ts`
- 存档管理: `lib/archive/archive-manager.ts`
- RuleCard组件: `components/RuleCard.tsx`
- 存档管理器: `components/ArchiveManager.tsx`

---

## ✨ 完成后的功能

集成完成后,您的应用将拥有:

1. ✅ **自动标签生成** - 每条规则自动打3-5个标签
2. ✅ **智能权重学习** - 根据用户删除/确认行为调整标签权重
3. ✅ **预测删除提示** - 高风险规则显示警告标识
4. ✅ **学科自动分类** - 规则自动映射到学科类别
5. ✅ **完整存档系统** - 保存/加载/管理世界存档
6. ✅ **用户偏好记忆** - 标签权重随存档保存

---

**祝集成顺利!** 🚀

如有问题,请检查浏览器控制台的错误日志。
