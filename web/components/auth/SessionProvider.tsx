'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

/**
 * SessionProvider 包装器
 *
 * 为整个应用提供认证上下文
 */
export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
