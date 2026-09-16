'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

import { NextIntlClientProvider } from 'next-intl';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/types/i18n';

import type { Locale} from '@/types/i18n';
import type { AbstractIntlMessages } from 'next-intl';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'app-locale';

interface I18nProviderProps {
  children: ReactNode;
  messages: AbstractIntlMessages;
  initialLocale?: Locale;
}

/**
 * 国际化 Provider
 * 管理语言状态并持久化到 localStorage
 */
export function I18nProvider({ children, messages, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE);
  const [clientMessages, setClientMessages] = useState(messages);

  // 从 localStorage 加载语言设置
  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
      setLocaleState(savedLocale);
      // 加载对应语言的翻译文件
      loadMessages(savedLocale);
    }
  }, []);

  // 加载翻译文件
  const loadMessages = async (newLocale: Locale) => {
    try {
      const messages = await import(`@/messages/${newLocale}.json`);
      setClientMessages(messages.default);
    } catch (error) {
      console.error(`Failed to load messages for locale: ${newLocale}`, error);
    }
  };

  // 切换语言
  const setLocale = async (newLocale: Locale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) {
      console.warn(`Unsupported locale: ${newLocale}`);
      return;
    }

    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);

    // 加载新语言的翻译文件
    await loadMessages(newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={clientMessages}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}

/**
 * 使用国际化 Context 的 Hook
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
