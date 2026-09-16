"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useTranslations } from "next-intl";

import AuthTextInput from "@/components/auth/AuthTextInput";
import OAuthButtons from "@/components/auth/OAuthButtons";
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
            <AuthTextInput
              label={t("email")}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("emailPlaceholder")}
              disabled={isLoading}
            />

            {/* 用户名输入 */}
            <AuthTextInput
              label={t("username")}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={t("usernamePlaceholder")}
              disabled={isLoading}
            />

            {/* 密码输入 */}
            <AuthTextInput
              label={t("password")}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t("newPasswordPlaceholder")}
              disabled={isLoading}
            />

            {/* 确认密码输入 */}
            <AuthTextInput
              label={t("confirmPassword")}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t("confirmPasswordPlaceholder")}
              disabled={isLoading}
            />

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] hover:from-[rgba(120,120,145,0.95)] hover:to-[rgba(100,100,125,0.95)] disabled:opacity-50 disabled:cursor-not-allowed border border-[rgba(140,140,160,0.5)] hover:border-[rgba(160,160,180,0.7)] rounded-xl px-6 py-3 text-[#e8e8ec] font-medium transition-all duration-300"
            >
              {isLoading ? t("registering") : t("registerButton")}
            </button>
          </form>

          <OAuthButtons
            dividerLabel={t("orRegisterWith")}
            actionLabel={(provider) => t("registerWith", { provider })}
            isLoading={isLoading}
            onSignInStart={() => setIsLoading(true)}
          />
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
