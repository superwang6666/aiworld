"use client";

import { useState, useEffect } from "react";

import { ART_STYLES } from "@/config/art-styles";

import CommonHeader from "@/components/common/CommonHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";

/**
 * 新的主页组件 - 整合艺术风格选择
 */

interface HomePageProps {
  onStart: (worldDescription: string, artStyle: string) => void;
  onRecommendMode?: (description: string, artStyle: string) => void;
}

export default function HomePage({ onStart, onRecommendMode }: HomePageProps) {
  const [showTip, setShowTip] = useState(true);
  const [worldDescription, setWorldDescription] = useState("");
  const [selectedArtStyle, setSelectedArtStyle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useRecommendMode, setUseRecommendMode] = useState(false);
  const [_mounted, setMounted] = useState(false);

  useEffect(() => {
    // 延迟设置 mounted 状态以避免 hydration 问题
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const experts = [
    {
      id: "geologist",
      name: "地质学家",
      color: "from-[rgba(139,69,19,0.95)] to-transparent",
      borderColor: "border-[rgba(139,69,19,0.6)]",
      textColor: "text-[#f4e4c1]",
      image:
        "https://images.unsplash.com/photo-1765606290905-b9d377ea4d5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwd2FycmlvciUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NjkxMTY2NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "anthropologist",
      name: "人类学家",
      color: "from-[rgba(70,130,180,0.95)] to-transparent",
      borderColor: "border-[rgba(70,130,180,0.6)]",
      textColor: "text-[#e6f2ff]",
      image:
        "https://images.unsplash.com/photo-1741805190358-aff8c1c1d72a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxycGclMjBjaGFyYWN0ZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjkxODUyMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "linguist",
      name: "语言学家",
      color: "from-[rgba(128,0,128,0.95)] to-transparent",
      borderColor: "border-[rgba(128,0,128,0.6)]",
      textColor: "text-[#f4d4ff]",
      image:
        "https://images.unsplash.com/photo-1692306088530-e81ab626753b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhlbCUyMGFydCUyMHJvZ3VlJTIwdGhpZWZ8ZW58MXx8fHwxNzY5MTg1MjEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "economist",
      name: "经济学家",
      color: "from-[rgba(218,165,32,0.95)] to-transparent",
      borderColor: "border-[rgba(218,165,32,0.6)]",
      textColor: "text-[#fff8dc]",
      image:
        "https://images.unsplash.com/photo-1644007497105-8d0ae9ec9754?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhlbCUyMGFydCUyMG1lcmNoYW50JTIwdHJhZGVyfGVufDF8fHx8MTc2OTE4NTIxMnww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "historian",
      name: "历史学家",
      color: "from-[rgba(255,215,0,0.95)] to-transparent",
      borderColor: "border-[rgba(255,215,0,0.6)]",
      textColor: "text-[#fffacd]",
      image:
        "https://images.unsplash.com/photo-1644007497105-8d0ae9ec9754?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhlbCUyMGFydCUyMGNsZXJpYyUyMHByaWVzdHxlbnwxfHx8fDE3NjkxODUyMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "military_expert",
      name: "军事专家",
      color: "from-[rgba(34,139,34,0.95)] to-transparent",
      borderColor: "border-[rgba(34,139,34,0.6)]",
      textColor: "text-[#e0ffe0]",
      image:
        "https://images.unsplash.com/photo-1606150062964-77af827610fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhlbCUyMGFydCUyMGh1bnRlciUyMGFyY2hlcnxlbnwxfHx8fDE3NjkxODUyMTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  const handleStart = () => {
    if (!worldDescription.trim()) {
      alert("请输入世界描述");
      return;
    }
    if (!selectedArtStyle) {
      alert("请选择艺术风格");
      return;
    }
    setIsLoading(true);
    // 使用 setTimeout 确保 loading 状态先更新到 UI
    setTimeout(() => {
      if (useRecommendMode && onRecommendMode) {
        onRecommendMode(worldDescription, selectedArtStyle);
      } else {
        onStart(worldDescription, selectedArtStyle);
      }
    }, 100);
  };

  return (
    <div
      className="bg-transparent relative size-full flex flex-col overflow-auto"
      suppressHydrationWarning
    >
      {/* 公共标题栏 */}
      <CommonHeader />

      {/* 主内容区 */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 py-8 sm:py-12 relative z-10">
        {/* 提示框 */}
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
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* 标题组 */}
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

        {/* 专家卡片组 */}
        <div className="w-full max-w-6xl grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12 lg:mb-16 justify-items-center px-2">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="relative w-[90px] h-[120px] sm:w-[100px] sm:h-[133px] lg:w-[120px] lg:h-[160px] group cursor-pointer"
            >
              <div
                className={`w-full h-full overflow-hidden shadow-[0px_10px_60px_0px_rgba(0,0,0,0.5)] border-2 ${expert.borderColor} rounded-lg`}
                style={{ imageRendering: "pixelated" }}
              >
                <img
                  src={expert.image}
                  alt={expert.name}
                  className="w-full h-full object-cover saturate-[1.2] contrast-[1.1] brightness-[0.9] transition-all duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/120x160?text=" + expert.name;
                  }}
                />
              </div>
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${expert.color} p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg`}
              >
                <p
                  className={`${expert.textColor} text-[10px] sm:text-xs text-center font-['Arial'] font-bold`}
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                >
                  {expert.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 艺术风格选择 */}
        <div className="w-full max-w-4xl mb-6">
          <label className="block text-[#c1c5cc] text-sm mb-3 px-2">
            选择艺术风格
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ART_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedArtStyle(style.name)}
                className={`relative rounded-xl px-4 py-3 border transition-all duration-300 ${
                  selectedArtStyle === style.name
                    ? "bg-gradient-to-r from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] border-[rgba(140,140,160,0.7)]"
                    : "bg-[rgba(35,35,45,0.6)] border-[rgba(80,80,95,0.3)] hover:border-[rgba(100,100,115,0.5)]"
                }`}
              >
                <div className="text-left">
                  <p className="text-[#e8e8ec] text-sm font-medium">
                    {style.nameCn}
                  </p>
                  <p className="text-[#7a7a88] text-xs mt-1">{style.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 底部输入区 */}
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
              {/* 模式切换按钮 */}
              <button
                onClick={() => setUseRecommendMode(!useRecommendMode)}
                disabled={isLoading}
                className="relative rounded-xl px-4 sm:px-5 h-[48px] bg-[rgba(70,70,85,0.7)] hover:bg-[rgba(85,85,100,0.85)] border border-[rgba(110,110,125,0.4)] hover:border-[rgba(130,130,145,0.6)] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                <div className="absolute top-1 right-2">
                  <span
                    className="text-[10px] sm:text-[11px] font-black tracking-wider"
                    style={{
                      color: "#39ff14",
                      textShadow:
                        "0 0 10px rgba(57, 255, 20, 0.8), 0 0 20px rgba(57, 255, 20, 0.5), 0 0 30px rgba(57, 255, 20, 0.3), 0 2px 4px rgba(0, 0, 0, 0.8)",
                      WebkitTextStroke: "0.5px rgba(57, 255, 20, 0.3)",
                    }}
                  >
                    AI
                  </span>
                </div>

                <svg
                  className={`w-4 h-4 sm:w-[18px] sm:h-[18px] transition-all duration-500 ${
                    useRecommendMode ? "text-[#39ff14]" : "text-[#b4b9c3]"
                  }`}
                  fill={useRecommendMode ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  style={{
                    transform: useRecommendMode
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
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
                  {useRecommendMode ? "游戏推荐" : "直接构建"}
                </span>
              </button>

              {/* 开始按钮 */}
              <button
                onClick={handleStart}
                disabled={isLoading}
                className="rounded-xl shrink-0 w-[48px] h-[48px] bg-gradient-to-br from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] hover:from-[rgba(120,120,145,0.95)] hover:to-[rgba(100,100,125,0.95)] disabled:opacity-50 disabled:cursor-not-allowed border border-[rgba(140,140,160,0.5)] hover:border-[rgba(160,160,180,0.7)] transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl group"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 transition-transform group-hover:scale-110 duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7L8 5z" fill="#e8e8ec" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 加载遮罩层 */}
      {isLoading && (
        <LoadingSpinner
          title="正在验证核心异质点..."
          subtitle="专家团队正在分析您的世界设定"
          fullScreen
        />
      )}
    </div>
  );
}
