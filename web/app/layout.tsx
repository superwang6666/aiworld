import { Geist, Geist_Mono } from "next/font/google";

import { DEFAULT_LOCALE } from "@/types/i18n";

import SessionProvider from "@/components/auth/SessionProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";

import type { Metadata } from "next";



import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World-Building Engine",
  description:
    "Generate logical, consistent world rules using the Seven Laws of World Building",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 加载默认语言的翻译文件
  const messages = (await import(`@/messages/${DEFAULT_LOCALE}.json`)).default;

  return (
    <html lang={DEFAULT_LOCALE} className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <I18nProvider messages={messages} initialLocale={DEFAULT_LOCALE}>
            {children}
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
