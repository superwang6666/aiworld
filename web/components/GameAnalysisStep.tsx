'use client';

import { useState } from 'react';
import { Search, CheckCircle, Circle, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { GameInfo } from '@/types';

interface GameAnalysisStepProps {
  onComplete: (insights: string[]) => void;
  onSkip: () => void;
}

export default function GameAnalysisStep({ onComplete, onSkip }: GameAnalysisStepProps) {
  const [anomalyDescription, setAnomalyDescription] = useState('');
  const [searchResults, setSearchResults] = useState<GameInfo[]>([]);
  const [selectedGames, setSelectedGames] = useState<Set<number>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // AI语义分析并推荐游戏
  const handleSearch = async () => {
    if (!anomalyDescription.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/recommend-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anomalyDescription: anomalyDescription }),
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
    } catch (err: any) {
      console.error('Search error details:', err);
      setError(err.message || 'AI 推荐失败，请稍后重试');
    } finally {
      setIsSearching(false);
    }
  };

  // 切换游戏选择
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

  // 分析选中的游戏
  const handleAnalyze = async () => {
    const selected = searchResults.filter(g => selectedGames.has(g.id));
    if (selected.length === 0) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ games: selected }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze games');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || '分析失败，请稍后重试');
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 应用到世界观
  const handleApplyInsights = () => {
    if (analysis?.comparativeAnalysis?.worldBuildingInsights) {
      onComplete(analysis.comparativeAnalysis.worldBuildingInsights);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 说明 */}
      <div className="border border-[#00ff88]/20 bg-[#00ff88]/5 rounded-lg p-4">
        <p className="text-sm text-[#e5e5e5] font-mono">
          <span className="text-[#00ff88] font-bold">步骤 0: 游戏类型分析（可选）</span>
          <br />
          描述你的核心异质点，AI 将推荐具有相似概念的代表作游戏，并分析它们的核心元素为你的世界观构建提供参考。
        </p>
      </div>

      {/* 输入核心异质点 */}
      <div className="border border-gray-800 bg-[#111111] rounded-lg p-6">
        <label className="block text-sm font-bold text-[#00ff88] uppercase mb-2 font-mono">
          描述你的核心异质点
        </label>
        <textarea
          value={anomalyDescription}
          onChange={(e) => setAnomalyDescription(e.target.value)}
          placeholder="例如：一个谎言会增加重力的世界、时间倒流的社会、记忆可以交易的城市..."
          className="w-full h-32 px-4 py-3 bg-black border border-gray-700 rounded focus:outline-none focus:border-[#00ff88]/50 text-[#e5e5e5] font-mono resize-none"
        />
        <p className="mt-2 text-xs text-gray-500 font-mono">
          AI 将分析你的核心异质点，并推荐具有相似概念或机制的代表作游戏
        </p>
        <button
          onClick={handleSearch}
          disabled={isSearching || !anomalyDescription.trim()}
          className="mt-4 w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#00ff88] text-black font-bold rounded hover:bg-[#00cc6f] disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI 分析并推荐游戏中...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>AI 推荐相关游戏</span>
            </>
          )}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded font-mono text-sm">
          错误: {error}
        </div>
      )}

      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#00ff88] font-mono">
            AI 推荐的游戏 ({searchResults.length}) - 请多选分析
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((game) => (
              <div
                key={game.id}
                onClick={() => toggleGame(game.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedGames.has(game.id)
                    ? 'border-[#00ff88] bg-[#00ff88]/10'
                    : 'border-gray-700 bg-[#111111] hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  {selectedGames.has(game.id) ? (
                    <CheckCircle className="w-6 h-6 text-[#00ff88] flex-shrink-0 mt-1" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-500 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-[#e5e5e5]">{game.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {game.genres.join(', ')} | {game.released}
                    </p>
                    {game.recommendationReason && (
                      <p className="text-xs text-[#00ff88] mt-2 italic">
                        💡 {game.recommendationReason}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {game.metacritic && (
                        <div className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                          Metacritic: {game.metacritic}
                        </div>
                      )}
                      <div className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                        RAWG: {game.rating.toFixed(1)}/5
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || selectedGames.size === 0}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#00ff88] text-black font-bold uppercase rounded hover:bg-[#00cc6f] disabled:bg-gray-700 disabled:text-gray-500 transition-colors font-mono"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>分析中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>分析选中游戏 ({selectedGames.size})</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 分析结果 */}
      {analysis && (
        <div className="border border-[#00ff88]/50 bg-[#00ff88]/5 rounded-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-[#00ff88] font-mono uppercase">分析结果</h3>

          {/* 各游戏分析 */}
          <div>
            <h4 className="font-bold text-[#e5e5e5] mb-3 font-mono">各游戏核心特征</h4>
            <div className="space-y-3">
              {analysis.individualAnalyses?.map((game: any, i: number) => (
                <div key={i} className="bg-black/30 rounded p-3 border border-gray-800">
                  <h5 className="font-bold text-[#00ff88] mb-2">{game.gameName}</h5>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><span className="text-gray-500">美术风格:</span> {game.artStyle}</p>
                    <p><span className="text-gray-500">核心玩法:</span> {game.gameplayMechanics.join(', ')}</p>
                    <p><span className="text-gray-500">叙事结构:</span> {game.narrativeStructure}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 核心元素 */}
          <div>
            <h4 className="font-bold text-[#e5e5e5] mb-2 font-mono">提取的类型核心元素</h4>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
              {analysis.comparativeAnalysis?.coreGenreElements.map((el: string, i: number) => (
                <li key={i}>{el}</li>
              ))}
            </ul>
          </div>

          {/* 世界观启发 */}
          <div className="bg-[#00ff88]/10 rounded p-4 border border-[#00ff88]/30">
            <h4 className="font-bold text-[#00ff88] mb-2 font-mono">世界观构建启发</h4>
            <ul className="list-disc list-inside text-[#e5e5e5] space-y-2 text-sm">
              {analysis.comparativeAnalysis?.worldBuildingInsights.map((insight: string, i: number) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApplyInsights}
              className="flex-1 px-6 py-3 bg-[#00ff88] text-black font-bold uppercase rounded hover:bg-[#00cc6f] transition-colors font-mono flex items-center justify-center gap-2"
            >
              <span>应用到世界观构建</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 跳过按钮 */}
      {!analysis && (
        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-300 underline text-sm font-mono transition-colors"
          >
            跳过游戏分析，直接开始
          </button>
        </div>
      )}
    </div>
  );
}
