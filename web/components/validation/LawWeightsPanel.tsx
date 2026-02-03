'use client';

import { motion } from 'motion/react';

import type { LawWeight } from '@/types';

import LawWeightCard from './advanced-analysis/LawWeightCard';
import { adaptLawWeights } from './advanced-analysis/utils/dataAdapters';

interface LawWeightsPanelProps {
  lawWeights: LawWeight[];
}

export default function LawWeightsPanel({ lawWeights }: LawWeightsPanelProps) {
  const adaptedData = adaptLawWeights(lawWeights);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-[28px] sm:text-[32px] mb-8 font-bold bg-gradient-to-r from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent leading-tight">
          法则权柄分析
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adaptedData.map((data, index) => (
            <LawWeightCard
              key={data.name}
              {...data}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
