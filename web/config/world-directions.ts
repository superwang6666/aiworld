import type { WorldDirection, DirectionLawMapping } from '@/types/world-directions';

/**
 * 基础方向配置
 *
 * 对应当前6个核心专家的专业领域
 * 不进行严格的《普通高等学校本科专业目录》映射，保持灵活性
 */
export const BASE_DIRECTIONS: WorldDirection[] = [
  {
    id: 'economics',
    name: '经济学',
    category: 'base',
    associatedLaws: ['Scarcity', 'Power'],
    expertIds: ['economics-expert'],
    description: '资源分配、贸易系统、市场机制、货币理论',
    knowledgeDomains: [
      '资源稀缺性',
      '供需平衡',
      '贸易网络',
      '货币系统',
      '经济权力结构',
      '财富分配',
    ],
  },
  {
    id: 'politics-military',
    name: '政治与军事',
    category: 'base',
    associatedLaws: ['Power', 'Space'],
    expertIds: ['politics-military-expert'],
    description: '权力结构、治理系统、军事组织、领土控制',
    knowledgeDomains: [
      '政治制度',
      '权力分配',
      '法律体系',
      '军事组织',
      '领土控制',
      '战略地理',
    ],
  },
  {
    id: 'geology-climate',
    name: '地质与气候',
    category: 'base',
    associatedLaws: ['Space', 'Survival'],
    expertIds: ['geology-climate-expert'],
    description: '地理环境、气候系统、地质构造、自然资源',
    knowledgeDomains: [
      '地质构造',
      '气候模式',
      '水文循环',
      '矿产资源',
      '地形地貌',
      '自然灾害',
    ],
  },
  {
    id: 'anthropology-sociology',
    name: '人类学与社会学',
    category: 'base',
    associatedLaws: ['Cognition', 'Metaphysics'],
    expertIds: ['anthropology-sociology-expert'],
    description: '文化系统、社会结构、习俗信仰、身份认同',
    knowledgeDomains: [
      '文化传统',
      '社会组织',
      '仪式习俗',
      '信仰体系',
      '身份认同',
      '社会分层',
    ],
  },
  {
    id: 'history-archaeology',
    name: '历史与考古',
    category: 'base',
    associatedLaws: ['Time', 'Cognition'],
    expertIds: ['history-archaeology-expert'],
    description: '历史演化、考古发现、文化遗产、时间观念',
    knowledgeDomains: [
      '历史事件',
      '文明演化',
      '考古遗迹',
      '文化记忆',
      '时间观念',
      '传承系统',
    ],
  },
  {
    id: 'linguistics',
    name: '语言学',
    category: 'base',
    associatedLaws: ['Cognition', 'Power'],
    expertIds: ['linguistics-expert'],
    description: '语言系统、交流模式、符号体系、语言权力',
    knowledgeDomains: [
      '语言结构',
      '交流系统',
      '符号学',
      '语言演化',
      '语言权力',
      '方言分布',
    ],
  },
];

/**
 * 方向-法则映射表
 *
 * 详细描述每个基础方向如何影响7个法则
 */
export const DIRECTION_LAW_MAPPINGS: DirectionLawMapping[] = [
  // 经济学
  {
    direction: 'economics',
    law: 'Scarcity',
    impactLevel: 'primary',
    impactDescription: '直接定义资源稀缺性、供需关系、价值分配机制',
  },
  {
    direction: 'economics',
    law: 'Power',
    impactLevel: 'primary',
    impactDescription: '经济权力通过财富控制影响政治和社会权力结构',
  },
  {
    direction: 'economics',
    law: 'Survival',
    impactLevel: 'secondary',
    impactDescription: '经济系统影响生存资源的获取和分配',
  },

  // 政治与军事
  {
    direction: 'politics-military',
    law: 'Power',
    impactLevel: 'primary',
    impactDescription: '直接定义权力层级、治理结构、强制力使用',
  },
  {
    direction: 'politics-military',
    law: 'Space',
    impactLevel: 'primary',
    impactDescription: '通过领土控制、边界划分影响空间组织',
  },
  {
    direction: 'politics-military',
    law: 'Scarcity',
    impactLevel: 'secondary',
    impactDescription: '政治决策影响资源分配和冲突管理',
  },

  // 地质与气候
  {
    direction: 'geology-climate',
    law: 'Space',
    impactLevel: 'primary',
    impactDescription: '定义地理物理基础、地形地貌、空间可达性',
  },
  {
    direction: 'geology-climate',
    law: 'Survival',
    impactLevel: 'primary',
    impactDescription: '气候和地质条件直接影响生存环境和资源分布',
  },
  {
    direction: 'geology-climate',
    law: 'Time',
    impactLevel: 'secondary',
    impactDescription: '地质演化和气候变化体现长时间尺度的影响',
  },

  // 人类学与社会学
  {
    direction: 'anthropology-sociology',
    law: 'Cognition',
    impactLevel: 'primary',
    impactDescription: '定义文化认知模式、价值观念、社会意义系统',
  },
  {
    direction: 'anthropology-sociology',
    law: 'Metaphysics',
    impactLevel: 'primary',
    impactDescription: '信仰系统、超自然观念、宇宙观的文化基础',
  },
  {
    direction: 'anthropology-sociology',
    law: 'Power',
    impactLevel: 'secondary',
    impactDescription: '社会结构和文化规范影响权力关系',
  },

  // 历史与考古
  {
    direction: 'history-archaeology',
    law: 'Time',
    impactLevel: 'primary',
    impactDescription: '直接定义历史叙事、时间观念、文化记忆',
  },
  {
    direction: 'history-archaeology',
    law: 'Cognition',
    impactLevel: 'primary',
    impactDescription: '历史传承影响集体认知和文化认同',
  },
  {
    direction: 'history-archaeology',
    law: 'Space',
    impactLevel: 'secondary',
    impactDescription: '历史事件与地理空间的关联',
  },

  // 语言学
  {
    direction: 'linguistics',
    law: 'Cognition',
    impactLevel: 'primary',
    impactDescription: '语言结构直接塑造思维方式和认知模式',
  },
  {
    direction: 'linguistics',
    law: 'Power',
    impactLevel: 'primary',
    impactDescription: '语言作为权力工具，影响社会控制和文化霸权',
  },
  {
    direction: 'linguistics',
    law: 'Time',
    impactLevel: 'secondary',
    impactDescription: '语言演化反映时间维度的文化变迁',
  },
];

/**
 * 根据方向ID获取方向配置
 */
export function getDirectionById(id: string): WorldDirection | undefined {
  return BASE_DIRECTIONS.find((d) => d.id === id);
}

/**
 * 根据法则获取相关的基础方向
 */
export function getDirectionsByLaw(law: string): WorldDirection[] {
  return BASE_DIRECTIONS.filter((d) => d.associatedLaws.includes(law as any));
}

/**
 * 根据专家ID获取对应的方向
 */
export function getDirectionByExpertId(expertId: string): WorldDirection | undefined {
  return BASE_DIRECTIONS.find((d) => d.expertIds.includes(expertId));
}

/**
 * 获取某个方向对某个法则的影响映射
 */
export function getLawImpact(directionId: string, law: string): DirectionLawMapping | undefined {
  return DIRECTION_LAW_MAPPINGS.find(
    (m) => m.direction === directionId && m.law === law
  );
}
