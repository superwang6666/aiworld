'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

import CommonHeader from '@/components/common/CommonHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PremiumBackground from '@/components/PremiumBackground';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    const handleVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('缺少验证令牌');
        return;
      }

      // 验证邮箱
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message || '邮箱验证成功！');
          // 3秒后跳转到登录页
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || '验证失败');
        }
      } catch {
        setStatus('error');
        setMessage('验证失败，请稍后重试');
      }
    };

    handleVerification();
  }, [searchParams, router]);

  return (
    <PremiumBackground>
      <div className="min-h-screen flex flex-col">
        <CommonHeader />

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-r from-[rgba(35,35,45,0.9)] to-[rgba(45,45,55,0.9)] rounded-2xl px-6 py-12 border border-[rgba(100,100,115,0.4)] backdrop-blur-sm text-center">
              {status === 'loading' && (
                <LoadingSpinner title="正在验证邮箱..." subtitle="请稍候" />
              )}

              {status === 'success' && (
                <>
                  <div className="w-16 h-16 bg-gradient-to-r from-[#00ff88] to-[#39ff14] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-[#1a1a23]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#ebebf0] mb-4">验证成功！</h2>
                  <p className="text-[#c1c5cc] mb-6">{message}</p>
                  <p className="text-[#7a7a88] text-sm">3秒后自动跳转到登录页...</p>
                  <Link
                    href="/auth/login"
                    className="inline-block mt-6 text-[#00ff88] hover:text-[#39ff14] transition-colors"
                  >
                    立即登录 →
                  </Link>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="w-16 h-16 bg-[rgba(255,107,107,0.2)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-[#ff6b6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#ebebf0] mb-4">验证失败</h2>
                  <p className="text-[#ff6b6b] mb-6">{message}</p>
                  <Link
                    href="/auth/login"
                    className="inline-block text-[#00ff88] hover:text-[#39ff14] transition-colors"
                  >
                    返回登录 →
                  </Link>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </PremiumBackground>
  );
}
