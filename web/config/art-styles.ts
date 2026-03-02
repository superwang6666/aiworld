// config/art-styles.ts

export interface ArtStyle {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  keywords: string[];
}

export const ART_STYLES: ArtStyle[] = [
    {
    id: 'commonworld',
    name: 'Common World',
    nameCn: '通用世界',
    description: '现实世界，日常场景',
    keywords: ['realistic', 'everyday', 'natural', 'ordinary']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    nameCn: '赛博朋克',
    description: '高科技低生活，霓虹灯与黑暗街道',
    keywords: ['neon', 'futuristic', 'dystopian', 'tech-noir']
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    nameCn: '蒸汽朋克',
    description: '维多利亚时代的蒸汽动力科技',
    keywords: ['victorian', 'brass', 'gears', 'steam-powered']
  },
  {
    id: 'cloisonne',
    name: 'Cloisonné',
    nameCn: '景泰蓝',
    description: '中国传统珐琅工艺，色彩鲜艳',
    keywords: ['enamel', 'traditional', 'ornate', 'colorful']
  },
  {
    id: 'fantasy',
    name: 'High Fantasy',
    nameCn: '奇幻',
    description: '魔法、龙与中世纪风格',
    keywords: ['magical', 'medieval', 'epic', 'mythical']
  },
  {
    id: 'noir',
    name: 'Film Noir',
    nameCn: '黑色电影',
    description: '黑白对比，阴影与悬疑',
    keywords: ['monochrome', 'shadows', 'mystery', 'dramatic']
  },
  {
    id: 'anime',
    name: 'Anime',
    nameCn: '日式动漫',
    description: '日本动画风格，鲜明色彩',
    keywords: ['japanese', 'vibrant', 'expressive', 'stylized']
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    nameCn: '水彩',
    description: '柔和渐变，艺术感',
    keywords: ['soft', 'artistic', 'flowing', 'dreamy']
  },
  {
    id: 'pixel',
    name: 'Pixel Art',
    nameCn: '像素艺术',
    description: '复古游戏风格，像素化',
    keywords: ['retro', '8-bit', 'pixelated', 'nostalgic']
  },
  {
    id: 'gothic',
    name: 'Gothic',
    nameCn: '哥特',
    description: '黑暗、神秘、宗教元素',
    keywords: ['dark', 'ornate', 'religious', 'mysterious']
  },
  {
    id: 'art-deco',
    name: 'Art Deco',
    nameCn: '装饰艺术',
    description: '几何图案，奢华对称',
    keywords: ['geometric', 'luxurious', 'symmetrical', '1920s']
  },
  {
    id: 'surreal',
    name: 'Surrealism',
    nameCn: '超现实主义',
    description: '梦境般的奇异组合',
    keywords: ['dreamlike', 'bizarre', 'imaginative', 'abstract']
  }
];

export const ART_STYLE_NAMES = ART_STYLES.map(style => style.name);
export const ART_STYLE_MAP = Object.fromEntries(
  ART_STYLES.map(style => [style.id, style])
);
