'use client';

import { useState, useEffect } from 'react';
import { Loader2, ChevronDown, Search, Menu, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { GameInfo } from '@/types';

interface GameRecommendViewProps {
  worldDescription: string;
  onGameSelect: (selectedGames: GameInfo[]) => void;
  onBack: () => void;
}

export default function GameRecommendView({
  worldDescription,
  onGameSelect,
  onBack,
}: GameRecommendViewProps) {
  const [searchResults, setSearchResults] = useState<GameInfo[]>([]);
  const [selectedGames, setSelectedGames] = useState<Set<number>>(new Set());
  const [isSearching, setIsSearching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    handleSearch();
  }, []);

  const handleSearch = async () => {
    if (!worldDescription.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/recommend-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anomalyDescription: worldDescription }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResults(data.games || []);

      if (data.games?.length === 0) {
        setError('AI 未能找到匹配的游戏，请尝试更具体的描述');
      }
    } catch (err: unknown) {
      console.error('Search error details:', err);
      setError(err instanceof Error ? err.message : 'AI 推荐失败，请稍后重试');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleGame = (gameId: number) => {
    setSelectedGames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  };

  const handleProceed = () => {
    const selected = searchResults.filter(g => selectedGames.has(g.id));
    if (selected.length === 0) {
      alert('请至少选择一个游戏');
      return;
    }
    onGameSelect(selected);
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0f0f14]">
      {/* Background gradients - matching game recommend1 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute blur-[80px] left-[109.57px] opacity-43 size-[837.462px] top-[154.11px]" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 837.46 837.46\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"0\" y=\"0\" height=\"100%\" width=\"100%\" fill=\"url(%23grad)\" opacity=\"1\"/><defs><radialGradient id=\"grad\" gradientUnits=\"userSpaceOnUse\" cx=\"0\" cy=\"0\" r=\"10\" gradientTransform=\"matrix(0 -59.218 -59.218 0 418.73 418.73)\"><stop stop-color=\"rgba(120,80,180,0.25)\" offset=\"0\"/><stop stop-color=\"rgba(100,70,150,0.15)\" offset=\"0.25\"/><stop stop-color=\"rgba(80,60,120,0.08)\" offset=\"0.5\"/><stop stop-color=\"rgba(0,0,0,0)\" offset=\"0.7\"/></radialGradient></defs></svg>')" }} />
      </div>

      {/* Top Header - Matching game recommend1 */}
      <header className="absolute content-stretch flex h-[88px] items-center justify-between left-0 px-[64px] top-0 w-full z-50">
        {/* Left: WORLD & BETA labels */}
        <div className="h-[40px] relative shrink-0 flex gap-[8px] items-center">
          <div className="bg-gradient-to-b flex-1 from-[#8a8a95] h-[40px] rounded-[18px] to-[#6a6a75] px-[16px] flex items-center">
            <p className="font-bold leading-[24px] text-[13px] text-white">WORLD</p>
          </div>
          <div className="bg-[#2a2a35] h-[26px] rounded-[18px] px-[12px] flex items-center">
            <p className="font-regular leading-[18px] text-[#c1c5cc] text-[12px]">BETA</p>
          </div>
        </div>

        {/* Right: Language, Search, Menu */}
        <div className="h-[37px] relative flex gap-[16px] items-center">
          <p className="font-regular leading-[21px] text-[#c1c5cc] text-[14px]">简体中文</p>
          <button className="bg-[rgba(60,60,70,0.6)] rounded-[12px] size-[36px] flex items-center justify-center hover:bg-[rgba(80,80,90,0.7)] transition-colors">
            <Search className="w-5 h-5 text-[#9A9AAA]" />
          </button>
          <button className="bg-[rgba(60,60,70,0.6)] rounded-[12px] size-[36px] flex items-center justify-center hover:bg-[rgba(80,80,90,0.7)] transition-colors">
            <Menu className="w-5 h-5 text-[#9A9AAA]" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-[120px] px-[64px] pb-[64px]">
        {/* 世界描述 section */}
        <div className="mb-12">
          <div className="text-[#c1c5cc] text-[14px] leading-relaxed">
            <p className="font-semibold text-[#e5e5e5] mb-4">您的世界描述:</p>
            <p className="text-[#9A9AAA]">{worldDescription}</p>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-6 py-4 rounded-lg font-mono text-sm mb-8">
            错误: {error}
            <button
              onClick={() => {
                setError(null);
                handleSearch();
              }}
              className="ml-4 px-4 py-1 bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
            >
              重试
            </button>
          </div>
        )}

        {/* 搜索中 */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#00ff88]" />
            <span className="text-[#c1c5cc] font-mono text-base">AI 正在为您搜索代表作游戏...</span>
          </div>
        )}

        {/* 游戏列表 */}
        {!isSearching && searchResults.length > 0 && (
          <div>
            <h2 className="text-[#e5e5e5] text-[20px] font-bold mb-8">
              AI 为您推荐了 <span className="text-[#00ff88]">{searchResults.length}</span> 部代表作游戏
            </h2>

            <div className="space-y-4 mb-12">
              {searchResults.map((game) => (
                <motion.div
                  key={game.id}
                  className={`group relative bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer border ${
                    selectedGames.has(game.id)
                      ? 'border-[#00ff88]/60'
                      : 'border-[rgba(100,100,115,0.4)] hover:border-[rgba(130,130,145,0.6)]'
                  }`}
                  onClick={() => toggleGame(game.id)}
                  onMouseEnter={() => setHoveredCard(game.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    boxShadow: selectedGames.has(game.id)
                      ? '0 0 30px rgba(0,255,136,0.2), 0 0 60px rgba(0,255,136,0.1)'
                      : 'none'
                  }}
                >
                  {/* 复选框 - 右上角 */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGame(game.id);
                    }}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full backdrop-blur-xl border transition-all duration-300 flex items-center justify-center z-20 group/checkbox"
                    style={{
                      background: selectedGames.has(game.id)
                        ? 'radial-gradient(circle, rgba(0,255,136,0.25) 0%, rgba(0,255,136,0.1) 50%, rgba(40,40,50,0.95) 100%)'
                        : 'radial-gradient(circle, rgba(80,80,95,0.4) 0%, rgba(60,60,75,0.6) 50%, rgba(40,40,50,0.9) 100%)',
                      borderColor: selectedGames.has(game.id)
                        ? 'rgba(0,255,136,0.5)'
                        : 'rgba(110,110,125,0.3)',
                      boxShadow: selectedGames.has(game.id)
                        ? '0 0 30px rgba(0,255,136,0.4), 0 0 60px rgba(0,255,136,0.2), 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)'
                        : '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.05)'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* 外圈光环 */}
                    {selectedGames.has(game.id) && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%)',
                          filter: 'blur(8px)'
                        }}
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.6, 0.3, 0.6]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    
                    {/* 中心图标 */}
                    <motion.div
                      className="relative"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ 
                        scale: selectedGames.has(game.id) ? 1 : 0,
                        rotate: selectedGames.has(game.id) ? 0 : -180,
                        opacity: selectedGames.has(game.id) ? 1 : 0
                      }}
                      transition={{ 
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                      }}
                    >
                      <svg className="w-5 h-5 text-[#00ff88]" fill="currentColor" viewBox="0 0 20 20"
                        style={{
                          filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.8))'
                        }}
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                    
                    {/* 未选中时的内圈 */}
                    {!selectedGames.has(game.id) && (
                      <motion.div
                        className="absolute w-4 h-4 rounded-full border-2"
                        style={{
                          borderColor: 'rgba(150,150,165,0.5)'
                        }}
                        whileHover={{
                          borderColor: 'rgba(180,180,195,0.7)',
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>

                  <div className="flex gap-5 p-5">
                    {/* 游戏封面 */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="relative w-[140px] h-[180px] rounded-xl overflow-hidden p-[2px]"
                        style={{
                          background: `linear-gradient(135deg, rgba(0,255,136,0.4), transparent)`
                        }}
                      >
                        <div className="w-full h-full rounded-xl overflow-hidden bg-[#0f0f14]">
                          {game.background_image ? (
                            <>
                              <img
                                src={game.background_image}
                                alt={game.name}
                                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 saturate-[1.2] contrast-[1.1] brightness-[0.9]"
                              />
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#3a3a4a] to-[#2a2a3a] flex items-center justify-center">
                              <span className="text-[#7a7a88] text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 游戏信息 */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="text-[#ebebf0] text-lg font-bold mb-2 group-hover:text-[#e8e8ec] transition-colors">
                          {game.name}
                        </h3>
                        <p className="text-[#7a7a88] text-xs sm:text-sm mb-3">
                          {game.genres.join(' · ')} · {game.released}
                        </p>
                        {game.recommendationReason && (
                          <p className="text-[#c1c5cc] text-xs sm:text-sm leading-relaxed line-clamp-2">
                            {game.recommendationReason}
                          </p>
                        )}
                      </div>

                      {/* 评分标签 */}
                      <div className="flex items-center gap-3 mt-4">
                        {game.metacritic && (
                          <div className="px-3 py-1.5 bg-[rgba(25,25,35,0.6)] backdrop-blur-sm rounded-lg border border-[rgba(80,80,95,0.3)]">
                            <span className="text-[#c1c5cc] text-xs font-medium">
                              MC: {game.metacritic}
                            </span>
                          </div>
                        )}
                        {game.rating && (
                          <div className="px-3 py-1.5 bg-[rgba(25,25,35,0.6)] backdrop-blur-sm rounded-lg border border-[rgba(80,80,95,0.3)]">
                            <span className="text-[#c1c5cc] text-xs font-medium">
                              RAWG: {game.rating.toFixed(1)}/5
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 卡片发光效果 */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(0,255,136,0.3), transparent 70%)'
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={onBack}
                className="px-12 py-4 bg-gradient-to-b from-[#8a8a95] to-[#6a6a75] text-white font-bold rounded-lg hover:from-[#9a9aaa] hover:to-[#7a7a85] transition-all duration-300 text-[14px]"
                style={{
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05) inset'
                }}
              >
                返回
              </button>
              <button
                onClick={handleProceed}
                disabled={selectedGames.size === 0}
                className={`px-12 py-4 font-bold rounded-lg transition-all duration-300 text-[14px] ${
                  selectedGames.size === 0
                    ? 'bg-[#6a6a75] text-[#9A9AAA] cursor-not-allowed'
                    : 'bg-[#00ff88] text-[#0f0f14] hover:bg-[#00e67e]'
                }`}
                style={selectedGames.size > 0 ? {
                  boxShadow: '0 0 30px rgba(0,255,136,0.3), 0 0 60px rgba(0,255,136,0.15), 0 8px 32px rgba(0,0,0,0.3)'
                } : {}}
              >
                分析选中游戏 ({selectedGames.size})
              </button>
            </div>
          </div>
        )}

        {/* 无结果 */}
        {!isSearching && searchResults.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="text-6xl mb-4">🎮</div>
            <span className="text-[#c1c5cc] text-base">暂无推荐结果，请尝试修改世界描述</span>
            <button
              onClick={onBack}
              className="mt-4 px-8 py-2 bg-gradient-to-b from-[#8a8a95] to-[#6a6a75] text-white font-bold rounded-lg hover:from-[#9a9aaa] hover:to-[#7a7a85] transition-colors"
            >
              返回修改
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
