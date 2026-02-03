'use client';

import { motion } from 'motion/react';

interface CircularProgressProps {
  score: number;        // 0-100
  size?: number;        // 默认120px
  strokeWidth?: number; // 默认14px
}

export default function CircularProgress({
  score,
  size = 120,
  strokeWidth = 14
}: CircularProgressProps) {
  const radius = (size / 2) - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;

  // 根据分数计算颜色
  const getScoreColor = (score: number) => {
    if (score <= 33) {
      // 红色
      return {
        start: 'rgba(220, 60, 60, 0.9)',
        end: 'rgba(255, 100, 80, 0.7)',
      };
    } else if (score <= 66) {
      // 橙色
      return {
        start: 'rgba(255, 140, 60, 0.9)',
        end: 'rgba(255, 180, 80, 0.7)',
      };
    } else {
      // 绿色
      return {
        start: 'rgba(100, 200, 80, 0.9)',
        end: 'rgba(80, 220, 120, 0.7)',
      };
    }
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        {/* 背景圆环 - 分段虚线效果 */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke="rgba(100,100,115,0.25)"
          strokeWidth={strokeWidth}
          strokeDasharray="6 3"
          strokeLinecap="round"
        />
        {/* 进度圆环 - 从12点钟方向开始顺时针填充 */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke={`url(#scoreGradient-${score})`}
          strokeWidth={strokeWidth}
          strokeDasharray="6 3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: score / 100 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient
            id={`scoreGradient-${score}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={scoreColor.start} />
            <stop offset="100%" stopColor={scoreColor.end} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
