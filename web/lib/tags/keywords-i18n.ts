/**
 * 标签关键词国际化映射
 * 用于规则文本的标签匹配
 */

export const KEYWORDS_ZH: Record<string, string[]> = {
  // Tone类
  brutal: ["残酷", "暴力", "痛苦", "严酷", "无情", "死亡"],
  hopeful: ["希望", "乐观", "光明", "向上", "积极"],
  mysterious: ["神秘", "未知", "隐秘", "不可解", "谜"],
  absurd: ["荒诞", "矛盾", "不合理", "反常", "怪异"],
  dark: ["黑暗", "阴暗", "恐怖", "压抑", "绝望"],
  whimsical: ["奇幻", "梦幻", "超现实", "魔幻", "童话"],

  // Mechanism类
  cyclic: ["循环", "周期", "重复", "往复", "轮回"],
  irreversible: ["不可逆", "永久", "无法回头", "一去不返"],
  cascading: ["连锁", "雪崩", "扩散", "蔓延", "传播"],
  resource_based: ["资源", "能量", "消耗", "储备", "积累"],
  time_sensitive: ["时间", "时限", "截止", "过期", "倒计时"],
  accumulative: ["累积", "叠加", "堆积", "积累", "增长"],
  threshold_based: ["阈值", "临界", "突破", "达到", "超过"],

  // Narrative类
  paradox: ["矛盾", "悖论", "自相矛盾", "冲突"],
  emergent: ["浮现", "涌现", "突现", "自发"],
  hierarchical: ["层级", "等级", "阶层", "等次"],
  distributed: ["分布", "分散", "去中心", "多点"],
  symbolic: ["象征", "符号", "寓意", "隐喻"],

  // Logic类
  causal: ["因果", "导致", "引起", "造成", "原因"],
  probabilistic: ["概率", "随机", "可能", "机会", "几率"],
  deterministic: ["决定", "必然", "确定", "注定"],
  conditional: ["条件", "如果", "当", "只有", "前提"],
  reciprocal: ["互惠", "相互", "交换", "对等", "回报"],
};

export const KEYWORDS_EN: Record<string, string[]> = {
  // Tone
  brutal: ["brutal", "violent", "painful", "harsh", "ruthless", "death"],
  hopeful: ["hope", "optimistic", "bright", "positive", "uplifting"],
  mysterious: ["mysterious", "unknown", "hidden", "enigmatic", "puzzle"],
  absurd: ["absurd", "contradictory", "unreasonable", "abnormal", "bizarre"],
  dark: ["dark", "gloomy", "horror", "oppressive", "despair"],
  whimsical: ["whimsical", "dreamy", "surreal", "magical", "fairy tale"],

  // Mechanism
  cyclic: ["cyclic", "periodic", "repetitive", "recurring", "cycle"],
  irreversible: ["irreversible", "permanent", "no return", "final"],
  cascading: ["cascading", "avalanche", "spreading", "propagating", "chain"],
  resource_based: ["resource", "energy", "consumption", "reserve", "accumulation"],
  time_sensitive: ["time", "deadline", "expiration", "countdown", "temporal"],
  accumulative: ["accumulative", "stacking", "building up", "growing"],
  threshold_based: ["threshold", "critical", "breakthrough", "trigger", "limit"],

  // Narrative
  paradox: ["paradox", "contradiction", "conflicting", "inconsistent"],
  emergent: ["emergent", "emerging", "spontaneous", "arising"],
  hierarchical: ["hierarchical", "hierarchy", "ranked", "tiered", "layered"],
  distributed: ["distributed", "decentralized", "scattered", "spread"],
  symbolic: ["symbolic", "symbol", "metaphor", "allegory", "representation"],

  // Logic
  causal: ["causal", "cause", "effect", "result", "consequence"],
  probabilistic: ["probabilistic", "random", "chance", "probability", "stochastic"],
  deterministic: ["deterministic", "determined", "certain", "inevitable", "fixed"],
  conditional: ["conditional", "if", "when", "only if", "prerequisite"],
  reciprocal: ["reciprocal", "mutual", "exchange", "reciprocity", "return"],
};
