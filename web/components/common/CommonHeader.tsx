/**
 * 公共标题栏组件 - 所有页面统一使用
 */
export default function CommonHeader() {
  return (
    <div className="relative w-full flex items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 z-20">
      {/* Logo区域 */}
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-[#8a8a95] to-[#6a6a75] rounded-[18px] px-4 py-2">
          <p className="font-bold leading-[24px] text-[13px] text-white">WORLD</p>
        </div>
        <div className="bg-[#2a2a35] rounded-[18px] px-3 py-1">
          <p className="text-[#c1c5cc] text-[12px]">BETA</p>
        </div>
      </div>

      {/* 右侧功能区 */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* 语言切换 */}
        <button className="text-[#c1c5cc] hover:text-white transition-colors text-sm">
          EN
        </button>

        {/* 社交链接 */}
        <div className="hidden sm:flex items-center gap-2">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c1c5cc] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c1c5cc] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </a>
        </div>

        {/* 登录按钮 */}
        <button className="hidden sm:block bg-gradient-to-r from-[#8a8a95] to-[#6a6a75] hover:from-[#9a9aa5] hover:to-[#7a7a85] text-white px-4 py-2 rounded-[18px] text-sm transition-all">
          登录
        </button>

        {/* 邀请码按钮 */}
        <button className="bg-gradient-to-r from-[#ff6b6b] to-[#ee5a6f] hover:from-[#ff7b7b] hover:to-[#fe6a7f] text-white px-4 py-2 rounded-[18px] text-sm transition-all">
          邀请码
        </button>
      </div>
    </div>
  );
}
