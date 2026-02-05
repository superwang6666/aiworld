"use client";

import { Lightbulb } from "lucide-react";
import { motion } from "motion/react";

interface ValidationRecommendationsProps {
  recommendations: string[];
}

export default function ValidationRecommendations({
  recommendations,
}: ValidationRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-br from-[rgba(40,80,120,0.15)] to-[rgba(30,60,100,0.15)] rounded-2xl border border-[rgba(100,150,200,0.3)] backdrop-blur-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb
            className="w-6 h-6 text-[#8ec5ff] flex-shrink-0"
            style={{ filter: "drop-shadow(0 0 6px rgba(142, 197, 255, 0.4))" }}
          />
          <h3 className="text-[#8ec5ff] text-lg sm:text-xl font-bold">
            Recommendations
          </h3>
        </div>
        <ul className="space-y-2.5">
          {recommendations.map((recommendation, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-[#c1c5cc] text-sm leading-relaxed hover:text-[#d5d9e0] transition-colors"
            >
              <span className="text-[#8ec5ff] mt-0.5 flex-shrink-0">○</span>
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
