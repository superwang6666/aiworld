"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

interface ValidationWarningsProps {
  warnings: string[];
}

export default function ValidationWarnings({
  warnings,
}: ValidationWarningsProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="mb-6"
    >
      <div className="bg-gradient-to-br from-[rgba(100,60,40,0.15)] to-[rgba(80,50,30,0.15)] rounded-2xl border border-[rgba(200,150,100,0.3)] backdrop-blur-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle
            className="w-6 h-6 text-[#ffb464] flex-shrink-0"
            style={{ filter: "drop-shadow(0 0 6px rgba(255, 180, 100, 0.4))" }}
          />
          <h3 className="text-[#ffb464] text-lg sm:text-xl font-bold">
            Warnings
          </h3>
        </div>
        <ul className="space-y-2.5">
          {warnings.map((warning, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-[#c1c5cc] text-sm leading-relaxed hover:text-[#d5d9e0] transition-colors"
            >
              <span className="text-[#ffb464] mt-0.5 flex-shrink-0">●</span>
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
