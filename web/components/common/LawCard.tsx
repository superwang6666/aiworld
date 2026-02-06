"use client";

import { useState, type ReactNode } from "react";

import type { Law } from "@/types";

import { LAW_COLORS } from "@/config/law-names";

interface LawCardProps {
  law: Law;
  children: ReactNode;
  className?: string;
  /** 是否禁用 hover 效果 */
  disableHover?: boolean;
  /** 额外的样式对象 */
  style?: React.CSSProperties;
  /** 自定义 hover 状态回调 */
  onHoverChange?: (isHovered: boolean) => void;
}

/**
 * 通用的法则卡片容器组件
 * 提供统一的样式、边框、装饰条和 hover 效果
 */
export default function LawCard({
  law,
  children,
  className = "",
  disableHover = false,
  style = {},
  onHoverChange,
}: LawCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 获取法则颜色配置
  const color = LAW_COLORS[law] || LAW_COLORS.Space;

  const handleMouseEnter = () => {
    if (!disableHover) {
      setIsHovered(true);
      onHoverChange?.(true);
    }
  };

  const handleMouseLeave = () => {
    if (!disableHover) {
      setIsHovered(false);
      onHoverChange?.(false);
    }
  };

  return (
    <div
      className={`relative bg-gradient-to-br from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl backdrop-blur-sm transition-all duration-300 overflow-hidden flex flex-col ${className}`}
      style={{
        border: `1px solid ${isHovered ? color.hoverBorder : color.border}`,
        boxShadow: isHovered ? color.glow : "none",
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 左侧装饰条 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
        style={{ background: color.accent }}
      />

      {/* 内容区域 */}
      {children}
    </div>
  );
}
