"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { motion } from "motion/react";

interface PremiumBackgroundProps {
  children: ReactNode;
}

export default function PremiumBackground({
  children,
}: PremiumBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const [randomStars] = useState(() => {
    // Generate random values once on client-side only
    if (typeof window === "undefined") return null;

    const bigStars = [...Array(20)].map(() => ({
      width: 2 + Math.random() * 3,
      height: 2 + Math.random() * 3,
      left: Math.random() * 100,
      top: Math.random() * 100,
      r1: 150 + Math.random() * 105,
      g1: 150 + Math.random() * 105,
      b1: 255,
      r2: 150 + Math.random() * 105,
      g2: 150 + Math.random() * 105,
      b2: 255,
      shadowBlur: 4 + Math.random() * 6,
      r3: 150 + Math.random() * 105,
      g3: 150 + Math.random() * 105,
      b3: 255,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5,
    }));

    const smallStars = [...Array(40)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 3,
    }));

    const orbs = [...Array(8)].map(() => ({
      left: 20 + Math.random() * 60,
      top: 20 + Math.random() * 60,
      r: 100 + Math.random() * 80,
      g: 100 + Math.random() * 80,
      b: 180 + Math.random() * 75,
      moveX: (Math.random() - 0.5) * 100,
      moveY: (Math.random() - 0.5) * 100,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 5,
    }));

    return { bigStars, smallStars, orbs };
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // If not mounted, return a simpler version to prevent hydration mismatch
  if (!mounted || !randomStars) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-[#0f0f14]">
        <div
          className="fixed inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 100% at 50% 0%, rgba(50, 40, 80, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 80% 80% at 0% 50%, rgba(40, 60, 80, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse 80% 80% at 100% 50%, rgba(60, 40, 70, 0.1) 0%, transparent 50%),
              linear-gradient(180deg, #0f0f14 0%, #1a1a24 100%)
            `,
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0f0f14]">
      {/* ========== 第1层：基础渐变背景（静态） ========== */}
      <div
        className="fixed inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 50% 0%, rgba(50, 40, 80, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 80% 80% at 0% 50%, rgba(40, 60, 80, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 80% 80% at 100% 50%, rgba(60, 40, 70, 0.1) 0%, transparent 50%),
            linear-gradient(180deg, #0f0f14 0%, #1a1a24 100%)
          `,
        }}
      />

      {/* ========== 第2层：动态大光晕 × 3（Motion动画） ========== */}

      {/* 光晕1 - 紫色（左上） */}
      <motion.div
        className="fixed w-[800px] h-[800px] left-[10%] top-[20%]"
        style={{
          background:
            "radial-gradient(circle, rgba(120, 80, 180, 0.25) 0%, rgba(100, 70, 150, 0.15) 25%, rgba(80, 60, 120, 0.08) 50%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [-50, 50, -50],
          y: [-30, 30, -30],
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 光晕2 - 蓝色（右上） */}
      <motion.div
        className="fixed w-[700px] h-[700px] right-[15%] top-[30%]"
        style={{
          background:
            "radial-gradient(circle, rgba(80, 120, 180, 0.25) 0%, rgba(60, 100, 150, 0.15) 25%, rgba(50, 80, 120, 0.08) 50%, transparent 70%)",
          filter: "blur(90px)",
        }}
        animate={{
          x: [50, -50, 50],
          y: [30, -30, 30],
          scale: [1.1, 1.3, 1.1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* 光晕3 - 青色（底部居中） */}
      <motion.div
        className="fixed w-[900px] h-[600px] left-1/2 -translate-x-1/2 bottom-[10%]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(60, 140, 160, 0.2) 0%, rgba(50, 110, 130, 0.12) 30%, rgba(40, 80, 100, 0.06) 60%, transparent 80%)",
          filter: "blur(100px)",
        }}
        animate={{
          x: [-40, 40, -40],
          scale: [1, 1.25, 1],
          opacity: [0.5, 0.75, 0.5],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* ========== 第3层：网格线条（呼吸动画） ========== */}
      <motion.div
        className="fixed inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100, 120, 180, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 120, 180, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ========== 第4层：扫描光束（横向移动） ========== */}
      <motion.div
        className="fixed inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(120, 100, 180, 0.1) 50%, transparent 100%)",
          width: "200%",
        }}
        animate={{
          x: ["-50%", "0%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* ========== 第5层：星空粒子系统（闪烁动画） ========== */}

      {/* 大粒子 × 20 */}
      {randomStars.bigStars.map((star, i) => (
        <motion.div
          key={`star-big-${i}`}
          className="fixed rounded-full"
          style={{
            width: `${star.width}px`,
            height: `${star.height}px`,
            left: `${star.left}%`,
            top: `${star.top}%`,
            background: `radial-gradient(circle, rgba(${star.r1}, ${star.g1}, ${star.b1}, 0.8) 0%, transparent 70%)`,
            filter: "blur(1px)",
            boxShadow: `0 0 ${star.shadowBlur}px rgba(${star.r3}, ${star.g3}, ${star.b3}, 0.6)`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay,
          }}
        />
      ))}

      {/* 小粒子 × 40 */}
      {randomStars.smallStars.map((star, i) => (
        <motion.div
          key={`star-small-${i}`}
          className="fixed w-[1px] h-[1px] bg-white/40 rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            boxShadow: "0 0 2px rgba(255, 255, 255, 0.5)",
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay,
          }}
        />
      ))}

      {/* ========== 第6层：浮动光点 × 8（慢速漂浮） ========== */}
      {randomStars.orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="fixed rounded-full"
          style={{
            width: "60px",
            height: "60px",
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            background: `radial-gradient(circle, rgba(${orb.r}, ${orb.g}, ${orb.b}, 0.15) 0%, transparent 70%)`,
            filter: "blur(30px)",
          }}
          animate={{
            x: [0, orb.moveX, 0],
            y: [0, orb.moveY, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}

      {/* ========== 第7层：噪点纹理（静态） ========== */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* ========== 第8层：边缘暗角（静态） ========== */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 40%, transparent 0%, rgba(15, 15, 20, 0.5) 80%, rgba(15, 15, 20, 0.8) 100%)`,
        }}
      />

      {/* ========== 第9层：内容区域 ========== */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
