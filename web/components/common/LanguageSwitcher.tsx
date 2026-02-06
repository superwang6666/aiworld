'use client';

import { useState, useRef, useEffect } from 'react';

import { motion, AnimatePresence } from 'motion/react';

import { SUPPORTED_LOCALES, LOCALE_NAMES, LOCALE_SHORT_NAMES } from '@/types/i18n';

import { useI18n } from '@/components/providers/I18nProvider';

import type { Locale } from '@/types/i18n';

/**
 * 语言切换组件
 * 提供下拉式语言选择器
 */
export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 语言按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white
                   bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200
                   border border-gray-700/50 hover:border-gray-600/50"
        aria-label="切换语言"
      >
        {LOCALE_SHORT_NAMES[locale]}
      </button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 bg-gray-800/95 backdrop-blur-sm
                       border border-gray-700/50 rounded-lg shadow-xl overflow-hidden z-50"
          >
            {SUPPORTED_LOCALES.map((supportedLocale) => (
              <button
                key={supportedLocale}
                onClick={() => handleLocaleChange(supportedLocale)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors duration-150
                  ${
                    locale === supportedLocale
                      ? 'bg-blue-600/20 text-blue-400 font-medium'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
              >
                {LOCALE_NAMES[supportedLocale]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
