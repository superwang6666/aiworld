"use client";

import { useState } from "react";

import Link from "next/link";

import CommonHeader from "@/components/common/CommonHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PremiumBackground from "@/components/PremiumBackground";

import type {
  RequestPasswordResetRequest,
  PasswordResetResponse,
} from "@/types/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const requestBody: RequestPasswordResetRequest = { email };

      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data: PasswordResetResponse = await response.json();

      if (!data.success) {
        setError(data.error || "请求失败，请稍后重试");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (_err) {
      setError("请求失败，请稍后重试");
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#ebebf0] mb-4">
                  邮件已发送
                </h2>
                <p className="text-[#c1c5cc] mb-6">
                  如果该邮箱已注册，您将收到密码重置邮件。
                  <br />
                  请查收邮件并点击链接重置密码。
                </p>
                <p className="text-[#7a7a88] text-sm mb-6">
                  邮件有效期为 1 小时
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block text-[#00ff88] hover:text-[#39ff14] transition-colors"
                >
                  返回登录 →
                </Link>
              </div>
            ) : (
              // 表单状态
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-wider bg-gradient-to-b from-[#ebebf0] to-[#b4b9c3] bg-clip-text text-transparent mb-3">
                    忘记密码
                  </h1>
                  <p className="text-[#7a7a88] text-sm">Reset your password</p>
                </div>

                <div className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl px-6 py-8 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm">
                  <p className="text-[#c1c5cc] text-sm mb-6">
                    输入您的注册邮箱，我们将发送密码重置链接到您的邮箱。
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.3)] rounded-xl px-4 py-3">
                        <p className="text-[#ff6b6b] text-sm">{error}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-[#c1c5cc] mb-2">
                        邮箱
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        disabled={isLoading}
                        className="w-full bg-[rgba(25,25,35,0.6)] rounded-xl px-4 py-3 border border-[rgba(80,80,95,0.3)] text-[#c1c5cc] placeholder-[#7a7a88] outline-none focus:border-[rgba(100,100,115,0.5)] transition-colors disabled:opacity-50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[rgba(100,100,120,0.8)] to-[rgba(80,80,100,0.8)] hover:from-[rgba(120,120,145,0.95)] hover:to-[rgba(100,100,125,0.95)] disabled:opacity-50 disabled:cursor-not-allowed border border-[rgba(140,140,160,0.5)] hover:border-[rgba(160,160,180,0.7)] rounded-xl px-6 py-3 text-[#e8e8ec] font-medium transition-all duration-300"
                    >
                      {isLoading ? "发送中..." : "发送重置邮件"}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link
                      href="/auth/login"
                      className="text-sm text-[#00ff88] hover:text-[#39ff14] transition-colors"
                    >
                      ← 返回登录
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {isLoading && (
        <LoadingSpinner title="正在发送邮件..." subtitle="请稍候" fullScreen />
      )}
    </PremiumBackground>
  );
}
