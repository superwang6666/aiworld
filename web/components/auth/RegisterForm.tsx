"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

import LoadingSpinner from "@/components/common/LoadingSpinner";

import type { RegisterRequest, RegisterResponse } from "@/types/auth";

export default function RegisterForm() {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // 验证密码匹配
    if (formData.password !== formData.confirmPassword) {
      setError(t("passwordMismatch"));
      setIsLoading(false);
      return;
    }

    try {
      const requestBody: RegisterRequest = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data: RegisterResponse = await response.json();

      if (!data.success) {
        setError(data.error || t("registerError"));
        setIsLoading(false);
        return;
      }

      // 注册成功
      setSuccess(true);
      setIsLoading(false);

      // 3秒后跳转到登录页
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (_err) {
      setError(t("registerError"));
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (
    provider: "google" | "discord" | "twitter",
  ) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl: "/" });
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl px-6 py-8 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#00ff88] to-[#39ff14] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[#1a1a23]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#ebebf0] mb-2">
              {t("registerSuccess")}
            </h2>
            <p className="text-[#c1c5cc] text-sm mb-4">
              {t("emailVerificationSent")}
            </p>
            <p className="text-[#7a7a88] text-xs">
              {t("checkEmailForVerification")}
            </p>
          </div>
          <div className="text-[#7a7a88] text-sm">{t("redirectingIn3Seconds")}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-md">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent mb-3">
            {t("registerTitle")}
          </h1>
          <p className="text-[#7a7a88] text-sm">{t("createAccount")}</p>
        </div>

        {/* 注册表单 */}
        <div className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl px-6 py-8 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 错误提示 */}
            {error && (
              <div className="bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.3)] rounded-xl px-4 py-3">
                <p className="text-[#ff6b6b] text-sm">{error}</p>
              </div>
            )}

            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm font-medium text-[#c1c5cc] mb-2">
                {t("email")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("emailPlaceholder")}
                required
                disabled={isLoading}
                className="w-full bg-[rgba(25,25,35,0.6)] rounded-xl px-4 py-3 border border-[rgba(80,80,95,0.3)] text-[#c1c5cc] placeholder-[#7a7a88] outline-none focus:border-[rgba(100,100,115,0.5)] transition-colors disabled:opacity-50"
              />
            </div>

            {/* 用户名输入 */}
            <div>
              <label className="block text-sm font-medium text-[#c1c5cc] mb-2">
                {t("username")}
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t("usernamePlaceholder")}
                required
                disabled={isLoading}
                className="w-full bg-[rgba(25,25,35,0.6)] rounded-xl px-4 py-3 border border-[rgba(80,80,95,0.3)] text-[#c1c5cc] placeholder-[#7a7a88] outline-none focus:border-[rgba(100,100,115,0.5)] transition-colors disabled:opacity-50"
              />
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-medium text-[#c1c5cc] mb-2">
                {t("password")}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("newPasswordPlaceholder")}
                required
                disabled={isLoading}
                className="w-full bg-[rgba(25,25,35,0.6)] rounded-xl px-4 py-3 border border-[rgba(80,80,95,0.3)] text-[#c1c5cc] placeholder-[#7a7a88] outline-none focus:border-[rgba(100,100,115,0.5)] transition-colors disabled:opacity-50"
              />
            </div>

            {/* 确认密码输入 */}
            <div>
              <label className="block text-sm font-medium text-[#c1c5cc] mb-2">
                {t("confirmPassword")}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("confirmPasswordPlaceholder")}
                required
                disabled={isLoading}
                className="w-full bg-[rgba(25,25,35,0.6)] rounded-xl px-4 py-3 border border-[rgba(80,80,95,0.3)] text-[#c1c5cc] placeholder-[#7a7a88] outline-none focus:border-[rgba(100,100,115,0.5)] transition-colors disabled:opacity-50"
              />
            </div>

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] hover:from-[rgba(120,120,145,0.95)] hover:to-[rgba(100,100,125,0.95)] disabled:opacity-50 disabled:cursor-not-allowed border border-[rgba(140,140,160,0.5)] hover:border-[rgba(160,160,180,0.7)] rounded-xl px-6 py-3 text-[#e8e8ec] font-medium transition-all duration-300"
            >
              {isLoading ? t("registering") : t("registerButton")}
            </button>
          </form>

          {/* 分隔线 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(100,100,115,0.3)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[rgba(35,35,45,0.9)] text-[#7a7a88]">
                {t("orRegisterWith")}
              </span>
            </div>
          </div>

          {/* OAuth 注册按钮 */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
              className="w-full bg-[rgba(70,70,85,0.7)] hover:bg-[rgba(85,85,100,0.85)] border border-[rgba(110,110,125,0.4)] hover:border-[rgba(130,130,145,0.6)] rounded-xl px-4 py-3 text-[#c1c5cc] font-medium transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("registerWith", { provider: "Google" })}
            </button>

            <button
              onClick={() => handleOAuthSignIn("discord")}
              disabled={isLoading}
              className="w-full bg-[rgba(70,70,85,0.7)] hover:bg-[rgba(85,85,100,0.85)] border border-[rgba(110,110,125,0.4)] hover:border-[rgba(130,130,145,0.6)] rounded-xl px-4 py-3 text-[#c1c5cc] font-medium transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              {t("registerWith", { provider: "Discord" })}
            </button>

            <button
              onClick={() => handleOAuthSignIn("twitter")}
              disabled={isLoading}
              className="w-full bg-[rgba(70,70,85,0.7)] hover:bg-[rgba(85,85,100,0.85)] border border-[rgba(110,110,125,0.4)] hover:border-[rgba(130,130,145,0.6)] rounded-xl px-4 py-3 text-[#c1c5cc] font-medium transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {t("registerWith", { provider: "X (Twitter)" })}
            </button>
          </div>
        </div>

        {/* 登录链接 */}
        <div className="text-center mt-6">
          <p className="text-[#7a7a88] text-sm">
            {t("hasAccount")}{" "}
            <Link
              href="/auth/login"
              className="text-[#00ff88] hover:text-[#39ff14] transition-colors font-medium"
            >
              {t("loginButton")}
            </Link>
          </p>
        </div>
      </div>

      {/* 加载遮罩 */}
      {isLoading && (
        <LoadingSpinner title={t("registering")} subtitle={tCommon("pleaseWait")} fullScreen />
      )}
    </>
  );
}
