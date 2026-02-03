'use client';

import { useState, useEffect } from 'react';

import { motion } from 'motion/react';

interface CountUpAnimationProps {
  target: number;
  duration?: number; // 毫秒，默认2000ms
  className?: string;
}

export default function CountUpAnimation({
  target,
  duration = 2000,
  className = ''
}: CountUpAnimationProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const steps = 60;
    const increment = target / steps;
    const stepTime = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <motion.span
      className={`text-4xl font-black bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent ${className}`}
      key={displayValue}
    >
      {displayValue}
    </motion.span>
  );
}
