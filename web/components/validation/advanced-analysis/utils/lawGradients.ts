import type { Law } from '@/types';

/**
 * 法则到Tailwind渐变类的映射
 */
export const LAW_GRADIENTS: Record<Law, string> = {
  Metaphysics: "from-yellow-400 to-yellow-600",
  Space: "from-blue-400 to-blue-600",
  Survival: "from-green-400 to-green-600",
  Cognition: "from-purple-400 to-purple-600",
  Scarcity: "from-orange-400 to-orange-600",
  Time: "from-cyan-400 to-cyan-600",
  Power: "from-red-400 to-red-600",
};

/**
 * 获取法则的Tailwind渐变类
 * @param law 法则枚举
 * @returns Tailwind渐变类字符串
 */
export function getLawGradient(law: Law): string {
  return LAW_GRADIENTS[law];
}
