"use client";

import { motion } from "motion/react";

interface LawWeightCardProps {
  name: string;
  percentage: number;
  color: string;
  borderColor: string;
  rules: number;
  index: number;
}

export default function LawWeightCard({
  name,
  percentage,
  color,
  borderColor,
  rules,
  index,
}: LawWeightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
      }}
      className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl p-5 border-2 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
      style={{
        borderColor: borderColor || "rgba(100,100,115,0.4)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#e8e8ec] text-[15px] font-semibold leading-snug">
          {name}
        </h3>
        <span className="text-[#c1c5cc] text-[18px] font-bold">
          {percentage}%
        </span>
      </div>

      {/* 进度条 */}
      <div className="relative w-full h-2 bg-[rgba(25,25,35,0.6)] rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${percentage}%`,
          }}
          transition={{
            duration: 1,
            delay: index * 0.08 + 0.3,
            ease: "easeOut",
          }}
          className={`absolute left-0 top-0 h-full bg-gradient-to-r ${color} rounded-full`}
        />
      </div>

      <p className="text-[#7a7a88] text-[13px] leading-normal">
        {rules} 条规则
      </p>
    </motion.div>
  );
}
