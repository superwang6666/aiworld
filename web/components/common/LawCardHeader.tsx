import type { ReactNode } from "react";

import type { Law } from "@/types";

import { LAW_NAME_MAP, LAW_COLORS } from "@/config/law-names";

interface LawCardHeaderProps {
  law: Law;
  /** 右侧额外内容（如评分、徽章等） */
  rightContent?: ReactNode;
  /** 自定义类名 */
  className?: string;
}

/**
 * 通用的法则卡片标题组件
 * 显示发光圆点 + 法则名称 + 可选的右侧内容
 */
export default function LawCardHeader({
  law,
  rightContent,
  className = "",
}: LawCardHeaderProps) {
  // 获取法则颜色配置和中文名称
  const color = LAW_COLORS[law] || LAW_COLORS.Space;
  const lawName = LAW_NAME_MAP[law] || law;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        {/* 发光圆点指示器 */}
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: color.accent,
            boxShadow: `0 0 8px ${color.accent}`,
          }}
        />
        {/* 法则名称 */}
        <h3 className="text-[#ebebf0] text-lg font-bold">{lawName}</h3>
      </div>

      {/* 右侧内容（可选） */}
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
}
