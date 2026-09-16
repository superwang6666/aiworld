/**
 * 轻量 Toast 通知存储
 *
 * coding-style.md 明确要求用 setError()/Toast 组件替代 alert()，但 alert() 之所以被
 * 到处用，是因为它在任何地方（组件、纯函数、lib/ 里的工具方法）都能直接调用，不需要
 * 组件树和 hook。这里用一个模块级的发布-订阅存储达到同样的"哪里都能调"的效果：
 * React 组件可以订阅它渲染 UI，非组件代码（lib/export、lib/rules 等）可以直接
 * import { toast } 调用，不需要一路把回调传下去。
 */

export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

type Listener = (toasts: ToastMessage[]) => void;

const AUTO_DISMISS_MS = 4000;

let toasts: ToastMessage[] = [];
const listeners = new Set<Listener>();

function emit(): void {
  listeners.forEach((listener) => listener(toasts));
}

function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function pushToast(message: string, variant: ToastVariant): void {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  toasts = [...toasts, { id, message, variant }];
  emit();
  setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
}

export const toast = {
  success: (message: string) => pushToast(message, "success"),
  error: (message: string) => pushToast(message, "error"),
  info: (message: string) => pushToast(message, "info"),
};

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener(toasts);
  return () => {
    listeners.delete(listener);
  };
}

export function dismiss(id: string): void {
  dismissToast(id);
}
