"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

import AuthTextInput from "@/components/auth/AuthTextInput";
import OAuthButtons from "@/components/auth/OAuthButtons";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function LoginForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("loginError"));
        setIsLoading(false);
        return;
      }

      // 登录成功，跳转到首页
      router.push("/");
      router.refresh();
    } catch (_err) {
      setError(t("registerError"));
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-md">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent mb-3">
            {t("loginTitle")}
          </h1>
          <p className="text-[#7a7a88] text-sm">{t("signInToAccount")}</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl px-6 py-8 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              disabled={isLoading}
            />

            {/* 密码输入 */}
            <AuthTextInput
              label={t("password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              disabled={isLoading}
            />

            {/* 忘记密码链接 */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#00ff88] hover:text-[#39ff14] transition-colors"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] hover:from-[rgba(120,120,145,0.95)] hover:to-[rgba(100,100,125,0.95)] disabled:opacity-50 disabled:cursor-not-allowed border border-[rgba(140,140,160,0.5)] hover:border-[rgba(160,160,180,0.7)] rounded-xl px-6 py-3 text-[#e8e8ec] font-medium transition-all duration-300"
            >
              {isLoading ? t("loggingIn") : t("loginButton")}
            </button>
          </form>

          <OAuthButtons
            dividerLabel={t("orLoginWith")}
            actionLabel={(provider) => t("loginWith", { provider })}
            isLoading={isLoading}
            onSignInStart={() => setIsLoading(true)}
          />
        </div>

        {/* 注册链接 */}
        <div className="text-center mt-6">
          <p className="text-[#7a7a88] text-sm">
            {t("noAccount")}{" "}
            <Link
              href="/auth/register"
              className="text-[#00ff88] hover:text-[#39ff14] transition-colors font-medium"
            >
              {t("registerButton")}
            </Link>
          </p>
        </div>
      </div>

      {/* 加载遮罩 */}
      {isLoading && (
        <LoadingSpinner title={t("loggingIn")} subtitle={t("Common.pleaseWait")} fullScreen />
      )}
    </>
  );
}
