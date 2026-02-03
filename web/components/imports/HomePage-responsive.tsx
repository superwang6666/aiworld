'use client';

import { useState, useEffect } from 'react';

/**
 * 响应式主页组件 - 与 index 项目保持完全一致
 * 主要功能：
 * 1. 导航栏（Logo、语言、社交、登录、邀请码）
 * 2. 提示框（可关闭）
 * 3. 主标题和副标题
 * 4. 6个专家卡片网格（响应式）
 * 5. 底部输入区（推荐模式 + 播放按钮）
 */

interface HomePageResponsiveProps {
  onRecommendMode?: (description: string) => void;
  onDirectBuild?: (description: string) => void;
}

export default function HomePageResponsive({ onRecommendMode, onDirectBuild }: HomePageResponsiveProps) {
  const [showTip, setShowTip] = useState(true);
  const [worldDescription, setWorldDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useRecommendMode, setUseRecommendMode] = useState(false);
  const [_mounted, setMounted] = useState(false);

  // 确保只在客户端挂载后才渲染交互元素
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // 6个专家角色配置 - 对应 index 的设计
  const experts = [
    {
      id: 'geologist',
      name: '地质学家',
      color: 'from-[rgba(139,69,19,0.95)] to-transparent',
      borderColor: 'border-[rgba(139,69,19,0.6)]',
      textColor: 'text-[#f4e4c1]',
      image: 'https://images.unsplash.com/photo-1765606290905-b9d377ea4d5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwd2FycmlvciUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NjkxMTY2NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'anthropologist',
      name: '人类学家',
      color: 'from-[rgba(70,130,180,0.95)] to-transparent',
      borderColor: 'border-[rgba(70,130,180,0.6)]',
      textColor: 'text-[#e6f2ff]',
      image: 'https://images.unsplash.com/photo-1741805190358-aff8c1c1d72a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxycGclMjBjaGFyYWN0ZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjkxODUyMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'linguist',
      name: '语言学家',
      color: 'from-[rgba(128,0,128,0.95)] to-transparent',
      borderColor: 'border-[rgba(128,0,128,0.6)]',
      textColor: 'text-[#f4d4ff]',
      image: 'https://images.unsplash.com/photo-1692306088530-e81ab626753b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhlbCUyMGFydCUyMHJvZ3VlJTIwdGhpZWZ8ZW58MXx8fHwxNzY5MTg1MjEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'economist',
      name: '经济学家',
      color: 'from-[rgba(218,165,32,0.95)] to-transparent',
      borderColor: 'border-[rgba(218,165,32,0.6)]',
      textColor: 'text-[#fff8dc]',
      image: 'https://images.unsplash.com/photo-1644007497105-8d0ae9ec9754?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhlbCUyMGFydCUyMG1lcmNoYW50JTIwdHJhZGVyfGVufDF8fHx8MTc2OTE4NTIxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'historian',
      name: '历史学家',
      color: 'from-[rgba(255,215,0,0.95)] to-transparent',
      borderColor: 'border-[rgba(255,215,0,0.6)]',
      textColor: 'text-[#fffacd]',
      image: 'https://images.unsplash.com/photo-1644007497105-8d0ae9ec9754?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhlbCUyMGFydCUyMGNsZXJpYyUyMHByaWVzdHxlbnwxfHx8fDE3NjkxODUyMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'military_expert',
      name: '军事专家',
      color: 'from-[rgba(34,139,34,0.95)] to-transparent',
      borderColor: 'border-[rgba(34,139,34,0.6)]',
      textColor: 'text-[#e0ffe0]',
      image: 'https://images.unsplash.com/photo-1606150062964-77af827610fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhlbCUyMGFydCUyMGh1bnRlciUyMGFyY2hlcnxlbnwxfHx8fDE3NjkxODUyMTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];



  return (
    <div className="bg-transparent relative size-full flex flex-col overflow-auto" data-name="HomePageResponsive" suppressHydrationWarning>
      {/* 导航栏 - 响应式 */}
      <div className="relative w-full flex items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 z-20">
        {/* Logo区域 */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-[#8a8a95] to-[#6a6a75] rounded-[18px] px-4 py-2">
            <p className="font-bold leading-[24px] text-[13px] text-white">WORLD</p>
          </div>
          <div className="bg-[#2a2a35] rounded-[18px] px-3 py-1">
            <p className="text-[#c1c5cc] text-[12px]">BETA</p>
          </div>
        </div>

        {/* 右侧导航 - 在大屏幕显示 */}
        <div className="hidden lg:flex items-center gap-4">
          <p className="text-[#c1c5cc] text-[14px]">简体中文</p>
          
          {/* 社交按钮 */}
          <button className="bg-[rgba(60,60,70,0.6)] hover:bg-[rgba(70,70,80,0.8)] transition-colors rounded-[12px] size-[36px] flex items-center justify-center border border-[rgba(100,100,110,0.3)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path d="M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z" fill="#9a9aaa"/>
              <path d="M15.5 11C16.3284 11 17 10.3284 17 9.5C17 8.67157 16.3284 8 15.5 8C14.6716 8 14 8.67157 14 9.5C14 10.3284 14.6716 11 15.5 11Z" fill="#9a9aaa"/>
              <path d="M12 2C6.5 2 2 5.58 2 10C2 12.05 3 13.85 4.64 15.15C4.45 16.45 3.5 18.5 3.5 18.5C3.5 18.5 6.5 18.15 8.35 17.5C9.5 17.82 10.72 18 12 18C17.5 18 22 14.42 22 10C22 5.58 17.5 2 12 2Z" stroke="#9a9aaa" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 15.5C16 15.5 14.5 17 12 17C9.5 17 8 15.5 8 15.5" stroke="#9a9aaa" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button className="bg-[rgba(60,60,70,0.6)] hover:bg-[rgba(70,70,80,0.8)] transition-colors rounded-[12px] size-[36px] flex items-center justify-center border border-[rgba(100,100,110,0.3)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" fill="#9a9aaa"/>
            </svg>
          </button>
          
          <button className="bg-[#2a2a35] hover:bg-[#3a3a45] transition-colors rounded-[14px] px-4 py-2 text-[#e8e8ec] text-[14px]">
            登录
          </button>
          
          <button className="bg-gradient-to-r from-[#8a8a95] to-[#6a6a75] hover:from-[#9a9aa5] hover:to-[#7a7a85] transition-colors rounded-[14px] px-4 py-2 text-[#e8e8ec] text-[14px]">
            使用邀请码加入
          </button>
        </div>
      </div>

      {/* 主内容区 - 响应式居中 */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 py-8 sm:py-12 relative z-10">
        {/* 提示框 - 响应式 */}
        {showTip && (
          <div className="w-full max-w-[640px] bg-gradient-to-r from-[rgba(26,26,35,0.85)] to-[rgba(35,35,45,0.85)] rounded-2xl px-4 sm:px-6 py-3 mb-8 sm:mb-12 flex items-center justify-between border border-[rgba(80,80,95,0.3)]">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[14px]">💡</span>
              <p className="text-[#c1c5cc] text-[13px] sm:text-[14px] line-clamp-1">
                全新好玩功能到了！点击左上方&ldquo;导出动画&rdquo;立即体验，制服神奇有一身吗~
              </p>
            </div>
            <button
              onClick={() => setShowTip(false)}
              className="ml-2 text-[#99A1AF] hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* 标题组 - 响应式 */}
        <div className="w-full flex flex-col items-center gap-3 sm:gap-4 mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold italic text-center bg-clip-text text-transparent bg-gradient-to-r from-[#ebebf0] to-[#b4b9c3] px-4 leading-tight whitespace-nowrap">
            Make GAME World
          </h1>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold italic text-center bg-clip-text text-transparent bg-gradient-to-r from-[#ebebf0] to-[#b4b9c3] px-4 leading-tight">
            Great Again
          </h1>
          <div className="shimmer-text-container mt-2 sm:mt-4">
            <p className="shimmer-text text-sm sm:text-base lg:text-lg text-center text-[#b4b9c3] px-4">
              基于LLM启发式构想的世界规则生成器
            </p>
          </div>
        </div>

        {/* 专家卡片组 - 响应式网格 */}
        <div className="w-full max-w-6xl grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12 lg:mb-16 justify-items-center px-2">
          {experts.map((expert) => (
            <div key={expert.id} className="relative w-[90px] h-[120px] sm:w-[100px] sm:h-[133px] lg:w-[120px] lg:h-[160px] group cursor-pointer">
              <div
                className={`w-full h-full overflow-hidden shadow-[0px_10px_60px_0px_rgba(0,0,0,0.5)] border-2 ${expert.borderColor} rounded-lg`}
                style={{ imageRendering: 'pixelated' }}
              >
                <img
                  src={expert.image}
                  alt={expert.name}
                  className="w-full h-full object-cover saturate-[1.2] contrast-[1.1] brightness-[0.9] transition-all duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/120x160?text=' + expert.name;
                  }}
                />
              </div>
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${expert.color} p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg`}>
                <p className={`${expert.textColor} text-[10px] sm:text-xs text-center font-['Arial'] font-bold`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  {expert.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 底部区 - 响应式 */}
        <div className="w-full max-w-4xl bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm">
          <div className="flex gap-3 sm:gap-4 items-center">
            {/* 输入框 */}
            <div className="flex-1 bg-[rgba(25,25,35,0.6)] rounded-xl px-4 py-3 border border-[rgba(80,80,95,0.3)] min-h-[48px] flex items-center">
              <input
                type="text"
                value={worldDescription}
                onChange={(e) => setWorldDescription(e.target.value)}
                placeholder="请用一句话描述你脑海里中的世界最特殊的地方!!!!"
                className="w-full bg-transparent text-[#c1c5cc] text-[13px] sm:text-[14px] placeholder-[#7a7a88] outline-none"
                disabled={isLoading}
              />
            </div>

            {/* 右侧按钮组 */}
            <div className="flex gap-2 sm:gap-3 items-center">
              {/* 星星按钮 - 模式切换 */}
              <button
                onClick={() => setUseRecommendMode(!useRecommendMode)}
                disabled={isLoading}
                className="relative rounded-xl px-4 sm:px-5 h-[48px] bg-[rgba(70,70,85,0.7)] hover:bg-[rgba(85,85,100,0.85)] border border-[rgba(110,110,125,0.4)] hover:border-[rgba(130,130,145,0.6)] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                {/* AI文字标识 - 按钮内部右上角 荧光绿 */}
                <div className="absolute top-1 right-2">
                  <span
                    className="text-[10px] sm:text-[11px] font-black tracking-wider"
                    style={{
                      color: '#39ff14',
                      textShadow: '0 0 10px rgba(57, 255, 20, 0.8), 0 0 20px rgba(57, 255, 20, 0.5), 0 0 30px rgba(57, 255, 20, 0.3), 0 2px 4px rgba(0, 0, 0, 0.8)',
                      WebkitTextStroke: '0.5px rgba(57, 255, 20, 0.3)',
                    }}
                  >
                    AI
                  </span>
                </div>

                <svg 
                  className={`w-4 h-4 sm:w-[18px] sm:h-[18px] transition-all duration-500 ${
                    useRecommendMode ? 'text-[#39ff14]' : 'text-[#b4b9c3]'
                  }`}
                  fill={useRecommendMode ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  style={{
                    transform: useRecommendMode ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  <path 
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="text-[#c1c5cc] text-[13px] sm:text-[14px] font-medium whitespace-nowrap">
                  {useRecommendMode ? '游戏推荐' : '直接构建'}
                </span>
              </button>

              {/* 播放按钮 - 开始构建 */}
              <button
                onClick={() => {
                  if (!worldDescription.trim()) {
                    alert('请输入世界描述');
                    return;
                  }
                  setIsLoading(true);
                  if (useRecommendMode && onRecommendMode) {
                    onRecommendMode(worldDescription);
                  } else if (onDirectBuild) {
                    onDirectBuild(worldDescription);
                  }
                  setIsLoading(false);
                }}
                disabled={isLoading}
                className="rounded-xl shrink-0 w-[48px] h-[48px] bg-gradient-to-br from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] hover:from-[rgba(120,120,145,0.95)] hover:to-[rgba(100,100,125,0.95)] disabled:opacity-50 disabled:cursor-not-allowed border border-[rgba(140,140,160,0.5)] hover:border-[rgba(160,160,180,0.7)] transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl group"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 transition-transform group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7L8 5z" fill="#e8e8ec"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
