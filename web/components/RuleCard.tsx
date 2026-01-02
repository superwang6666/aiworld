'use client';

import { WorldRule, Law } from '@/types';
import { Check, X } from 'lucide-react';

interface RuleCardProps {
  rule: WorldRule;
  onToggle: (id: string) => void;
}

const lawColors: Record<Law, string> = {
  Space: 'bg-blue-900/30 border-blue-700 text-blue-300',
  Survival: 'bg-green-900/30 border-green-700 text-green-300',
  Cognition: 'bg-purple-900/30 border-purple-700 text-purple-300',
  Scarcity: 'bg-yellow-900/30 border-yellow-700 text-yellow-300',
  Time: 'bg-red-900/30 border-red-700 text-red-300',
  Power: 'bg-orange-900/30 border-orange-700 text-orange-300',
  Metaphysics: 'bg-indigo-900/30 border-indigo-700 text-indigo-300',
};

export default function RuleCard({ rule, onToggle }: RuleCardProps) {
  const lawColorClass = lawColors[rule.law];

  return (
    <div
      className={`
        relative border-2 rounded-lg p-4 transition-all duration-200
        ${lawColorClass}
        ${rule.confirmed ? 'opacity-100 ring-2 ring-cyan-400' : 'opacity-70 hover:opacity-100'}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-bold uppercase border rounded bg-black/20">
              {rule.law}
            </span>
          </div>
          
          <p className="text-sm font-medium leading-relaxed">
            {rule.rule}
          </p>
          
          <div className="text-xs text-gray-400 italic border-l-2 border-gray-700 pl-3">
            <span className="font-semibold text-gray-500">Expert Logic: </span>
            {rule.expert_logic}
          </div>
        </div>

        <button
          onClick={() => onToggle(rule.id)}
          className={`
            flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center
            transition-all duration-200
            ${
              rule.confirmed
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30'
                : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-gray-700/50 hover:border-gray-500'
            }
          `}
          aria-label={rule.confirmed ? 'Unconfirm rule' : 'Confirm rule'}
        >
          {rule.confirmed ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
