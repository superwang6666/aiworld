"use client";

import { useEffect, useState } from "react";

import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

import {
  dismiss,
  subscribeToasts,
  type ToastMessage,
  type ToastVariant,
} from "@/lib/utils/toast-store";

const VARIANT_STYLES: Record<
  ToastVariant,
  { border: string; icon: React.ReactNode; text: string }
> = {
  success: {
    border: "border-[rgba(57,255,20,0.5)]",
    text: "text-[#39ff14]",
    icon: <CheckCircle className="w-5 h-5 shrink-0" />,
  },
  error: {
    border: "border-[rgba(220,38,38,0.6)]",
    text: "text-[#fca5a5]",
    icon: <AlertCircle className="w-5 h-5 shrink-0" />,
  },
  info: {
    border: "border-[rgba(0,194,255,0.5)]",
    text: "text-[#00c2ff]",
    icon: <Info className="w-5 h-5 shrink-0" />,
  },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const style = VARIANT_STYLES[t.variant];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${style.border} bg-[rgba(25,25,35,0.95)] backdrop-blur-sm px-4 py-3 shadow-lg animate-fade-in`}
          >
            <span className={style.text}>{style.icon}</span>
            <p className="flex-1 text-sm text-[#c1c5cc] break-words whitespace-pre-line">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-[#7a7a88] hover:text-[#c1c5cc] transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
