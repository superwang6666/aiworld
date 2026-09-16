"use client";

import { useState, useRef, useEffect } from "react";

import Link from "next/link";

import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

/**
 * 用户菜单组件
 *
 * 显示用户头像和下拉菜单
 */
export default function UserMenu() {
  const t = useTranslations("Auth");
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // 加载中状态
  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-[rgba(70,70,85,0.7)] animate-pulse"></div>
    );
  }

  // 未登录状态
  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="hidden sm:block bg-gradient-to-r from-[#8a8a95] to-[#6a6a75] hover:from-[#9a9aa5] hover:to-[#7a7a85] text-white px-4 py-2 rounded-[18px] text-sm transition-all"
        >
          {t("loginButton")}
        </Link>
        <Link
          href="/auth/register"
          className="bg-gradient-to-r from-[#00ff88] to-[#39ff14] hover:from-[#39ff14] hover:to-[#00ff88] text-[#1a1a23] px-4 py-2 rounded-[18px] text-sm font-medium transition-all"
        >
          {t("registerButton")}
        </Link>
      </div>
    );
  }

  // 已登录状态
  const user = session.user;
  const username = user.username || user.email?.split("@")[0] || "User";
  const avatarUrl = user.avatar_url;

  return (
    <div className="relative" ref={menuRef}>
      {/* 用户头像按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {/* 头像 */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00ff88] to-[#39ff14] flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[#1a1a23] font-bold text-sm">
              {username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* 用户名（桌面端显示） */}
        <span className="hidden sm:block text-[#c1c5cc] text-sm font-medium">
          {username}
        </span>

        {/* 下拉箭头 */}
        <svg
          className={`hidden sm:block w-4 h-4 text-[#c1c5cc] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gradient-to-r from-[rgba(35,35,45,0.98)] to-[rgba(45,45,55,0.98)] rounded-xl border border-[rgba(100,100,115,0.4)] backdrop-blur-sm shadow-xl overflow-hidden z-50">
          {/* 用户信息 */}
          <div className="px-4 py-3 border-b border-[rgba(100,100,115,0.3)]">
            <p className="text-[#e8e8ec] font-medium text-sm">{username}</p>
            <p className="text-[#7a7a88] text-xs mt-1">{user.email}</p>
            {!user.email_verified && (
              <p className="text-[#ff6b6b] text-xs mt-1">{t("emailUnverified")}</p>
            )}
          </div>

          {/* 菜单项 */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-[#c1c5cc] hover:bg-[rgba(70,70,85,0.5)] transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm">{t("myProfile")}</span>
            </Link>

            <Link
              href="/archives"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-[#c1c5cc] hover:bg-[rgba(70,70,85,0.5)] transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <span className="text-sm">{t("myArchives")}</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-[#c1c5cc] hover:bg-[rgba(70,70,85,0.5)] transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm">{t("settings")}</span>
            </Link>
          </div>

          {/* 登出按钮 */}
          <div className="border-t border-[rgba(100,100,115,0.3)] py-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2 text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.1)] transition-colors w-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-sm">{t("logout")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
