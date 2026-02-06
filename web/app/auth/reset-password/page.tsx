"use client";

import { useState, useEffect, Suspense } from "react";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { useTranslations } from "next-intl";

import CommonHeader from "@/components/common/CommonHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PremiumBackground from "@/components/PremiumBackground";

import type { ResetPasswordRequest, PasswordResetResponse } from "@/types/auth";

function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const handleTokenCheck = () => {
      if (tokenParam) {
        setToken(tokenParam);
      } else {
        setError(t("missingResetToken"));
      }
    };
    handleTokenCheck();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (!token) {
      setError(t("missingResetToken"));
      return;
    }

    setIsLoading(true);

    try {
      const requestBody: ResetPasswordRequest = {
        token,
        new_password: password,
      };

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data: PasswordResetResponse = await response.json();

      if (!data.success) {
        setError(data.error || t("resetFailedRetry"));
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);

      // 3秒后跳转到登录页
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (_err) {
      setError(t("resetFailedRetry"));
      setIsLoading(false);
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen flex flex-col">
        <CommonHeader />

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {success ? (
              // 成功状态
              <div className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl px-6 py-8 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#00ff88] to-[#39ff14] rounded-full flex items-center justify-center mx-auto mb-6">
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
                <h2 className="text-2xl font-bold text-[#ebebf0] mb-4">
                  {t("passwordResetSuccess")}
                </h2>
                <p className="text-[#c1c5cc] mb-6">
                  {t("passwordResetSuccessMessage")}
                </p>
                <p className="text-[#7a7a88] text-sm">
                  {t("redirectingIn3Seconds")}
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block mt-6 text-[#00ff88] hover:text-[#39ff14] transition-colors"
                >
                  {t("loginNow")} →
                </Link>
              </div>
            ) : (
              // 表单状态
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent mb-3">
                    {t("resetPasswordTitle")}
                  </h1>
                  <p className="text-[#7a7a88] text-sm">{t("setNewPassword")}</p>
                </div>

                <div className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl px-6 py-8 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.3)] rounded-xl px-4 py-3">
                        <p className="text-[#ff6b6b] text-sm">{error}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-[#c1c5cc] mb-2">
                        {t("newPassword")}
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("newPasswordPlaceholder")}
                        required
                        disabled={isLoading || !token}
                        className="w-full bg-[rgba(25,25,35,0.6)] rounded-xl px-4 py-3 border border-[rgba(80,80,95,0.3)] text-[#c1c5cc] placeholder-[#7a7a88] outline-none focus:border-[rgba(100,100,115,0.5)] transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#c1c5cc] mb-2">
                        {t("confirmNewPassword")}
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("confirmNewPasswordPlaceholder")}
                        required
                        disabled={isLoading || !token}
                        className="w-full bg-[rgba(25,25,35,0.6)] rounded-xl px-4 py-3 border border-[rgba(80,80,95,0.3)] text-[#c1c5cc] placeholder-[#7a7a88] outline-none focus:border-[rgba(100,100,115,0.5)] transition-colors disabled:opacity-50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !token}
                      className="w-full bg-gradient-to-r from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] hover:from-[rgba(120,120,145,0.95)] hover:to-[rgba(100,100,125,0.95)] disabled:opacity-50 disabled:cursor-not-allowed border border-[rgba(140,140,160,0.5)] hover:border-[rgba(160,160,180,0.7)] rounded-xl px-6 py-3 text-[#e8e8ec] font-medium transition-all duration-300"
                    >
                      {isLoading ? t("resettingPassword") : t("resetPasswordButton")}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link
                      href="/auth/login"
                      className="text-sm text-[#00ff88] hover:text-[#39ff14] transition-colors"
                    >
                      ← {t("backToLogin")}
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {isLoading && (
        <LoadingSpinner title={t("resettingPassword")} subtitle={tCommon("pleaseWait")} fullScreen />
      )}
    </PremiumBackground>
  );
}

export default function ResetPasswordPage() {
  const tCommon = useTranslations("Common");
  return (
    <Suspense fallback={<LoadingSpinner title={tCommon("loading")} subtitle={tCommon("pleaseWait")} fullScreen />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
