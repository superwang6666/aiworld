/**
 * 通用加载动画组件
 * 支持内联显示和全屏遮罩两种模式
 */

interface LoadingSpinnerProps {
  /** 主标题文字 */
  title: string;
  /** 副标题文字（可选） */
  subtitle?: string;
  /** 是否显示为全屏遮罩层 */
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  title,
  subtitle,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center gap-6">
      {/* 加载动画 */}
      <div className="relative">
        {/* 外圈旋转 */}
        <div className="w-24 h-24 border-4 border-[rgba(100,100,120,0.3)] border-t-[#00ff88] rounded-full animate-spin"></div>
        {/* 内圈反向旋转 */}
        <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-b-[#39ff14] rounded-full animate-spin-reverse"></div>
        {/* 中心图标 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#00ff88]" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="currentColor"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>

      {/* 加载文字 */}
      <div className="text-center">
        <p className="text-[#00ff88] text-xl font-bold mb-2 animate-pulse">
          {title}
        </p>
        {subtitle && (
          <p className="text-[#c1c5cc] text-sm">
            {subtitle}
          </p>
        )}
      </div>

      {/* 进度点 */}
      <div className="flex gap-2">
        <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );

  // 全屏遮罩模式
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  // 内联模式
  return (
    <div className="flex justify-center py-16">
      {content}
    </div>
  );
}
