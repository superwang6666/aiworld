import {
  User,
  TrendingUp,
  Globe,
  BookOpen,
  MessageSquare,
  Shield,
  Atom,
  Mountain,
  Brain,
  type LucideIcon,
} from "lucide-react";

import { DEFAULT_LOCALE, type Locale } from "@/types/i18n";

const DOMAIN_ICON_MAP: Record<string, LucideIcon> = {
  "人类学与社会学": User,
  "经济学": TrendingUp,
  "地质学与气候学": Globe,
  "历史学与考古学": BookOpen,
  "语言学": MessageSquare,
  "政治学与军事学": Shield,
  "物理学": Atom,
  "生物学": Mountain,
  "心理学": Brain,
};

const DOMAIN_COLOR_MAP: Record<string, string> = {
  "人类学与社会学": "#7dd3fc",
  "经济学": "#fbbf24",
  "地质学与气候学": "#34d399",
  "历史学与考古学": "#a78bfa",
  "语言学": "#fb923c",
  "政治学与军事学": "#f87171",
  "物理学": "#22d3ee",
  "生物学": "#10b981",
  "心理学": "#8b5cf6",
};

const DOMAIN_LABEL_MAP: Record<Locale, Record<string, string>> = {
  "zh-CN": {
    "人类学与社会学": "人类学与社会学",
    "经济学": "经济学",
    "地质学与气候学": "地质学与气候学",
    "历史学与考古学": "历史学与考古学",
    "语言学": "语言学",
    "政治学与军事学": "政治学与军事学",
    "物理学": "物理学",
    "生物学": "生物学",
    "心理学": "心理学",
  },
  en: {
    "人类学与社会学": "Anthropology & Sociology",
    "经济学": "Economics",
    "地质学与气候学": "Geology & Climate",
    "历史学与考古学": "History & Archaeology",
    "语言学": "Linguistics",
    "政治学与军事学": "Politics & Military Science",
    "物理学": "Physics",
    "生物学": "Biology",
    "心理学": "Psychology",
  },
};

export function getIconForDomain(domain: string): LucideIcon {
  return DOMAIN_ICON_MAP[domain] || User;
}

export function getColorForDomain(domain: string): string {
  return DOMAIN_COLOR_MAP[domain] || "#7dd3fc";
}

export function getDomainLabel(
  domain: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const localized = DOMAIN_LABEL_MAP[locale]?.[domain];
  if (localized) return localized;
  const fallback = DOMAIN_LABEL_MAP[DEFAULT_LOCALE]?.[domain];
  return fallback || domain;
}
