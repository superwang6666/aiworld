/**
 * 游戏信息来源配置
 *
 * 定义从哪些渠道获取游戏信息及其优先级
 * 支持三类渠道：游戏媒体、评测机构、个人KOL
 */

export interface GameSource {
  id: string;
  name: string;
  type: 'media' | 'review' | 'kol';  // 媒体/评测机构/个人KOL
  priority: number;  // 1-10，数字越大优先级越高
  description: string;
  enabled: boolean;
}

export interface GameSourceConfig {
  version: string;
  sources: GameSource[];
  defaultPriority: ('media' | 'review' | 'kol')[];
}

export const GAME_SOURCE_CONFIG: GameSourceConfig = {
  version: '1.0.0',
  defaultPriority: ['review', 'media', 'kol'],

  sources: [
    {
      id: 'metacritic',
      name: 'Metacritic',
      type: 'review',
      priority: 10,
      description: '游戏评测聚合平台，综合专业评分',
      enabled: true,
    },
    {
      id: 'ign',
      name: 'IGN',
      type: 'media',
      priority: 8,
      description: '全球最大游戏媒体之一',
      enabled: true,
    },
    {
      id: 'gamespot',
      name: 'GameSpot',
      type: 'media',
      priority: 7,
      description: '专业游戏新闻与评测网站',
      enabled: true,
    },
    {
      id: 'pcgamer',
      name: 'PC Gamer',
      type: 'media',
      priority: 7,
      description: 'PC游戏专业媒体',
      enabled: true,
    },
    {
      id: 'eurogamer',
      name: 'Eurogamer',
      type: 'media',
      priority: 6,
      description: '欧洲知名游戏媒体',
      enabled: true,
    },
    {
      id: 'steam',
      name: 'Steam用户评价',
      type: 'kol',
      priority: 6,
      description: '玩家社区评价',
      enabled: true,
    },
    {
      id: 'reddit-gaming',
      name: 'Reddit Gaming',
      type: 'kol',
      priority: 5,
      description: '游戏社区讨论',
      enabled: false,  // 默认禁用，需要时启用
    },
    {
      id: 'youtube-reviews',
      name: 'YouTube游戏评测',
      type: 'kol',
      priority: 4,
      description: '视频评测内容创作者',
      enabled: false,  // 默认禁用
    },
  ],
};

/**
 * 获取启用的游戏信息来源，按优先级排序
 */
export function getEnabledSources(): GameSource[] {
  return GAME_SOURCE_CONFIG.sources
    .filter(source => source.enabled)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * 按类型获取游戏信息来源
 */
export function getSourcesByType(type: 'media' | 'review' | 'kol'): GameSource[] {
  return GAME_SOURCE_CONFIG.sources
    .filter(source => source.type === type && source.enabled)
    .sort((a, b) => b.priority - a.priority);
}
