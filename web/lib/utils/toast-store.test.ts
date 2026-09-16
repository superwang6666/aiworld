import { toast, subscribeToasts, dismiss } from "./toast-store";

import type { ToastMessage } from "./toast-store";

// toast-store 是一个模块级单例（发布-订阅存储），状态在多个 it() 之间共享，
// 每个测试结束后必须清空，否则上一条未过期的 toast 会污染下一个测试的断言。
function clearAllToasts(): void {
  let current: ToastMessage[] = [];
  const unsubscribe = subscribeToasts((toasts) => {
    current = toasts;
  });
  unsubscribe();
  current.forEach((t) => dismiss(t.id));
}

describe("toast-store", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    clearAllToasts();
    jest.useRealTimers();
  });

  it("notifies subscribers with the new toast when one is pushed", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToasts(listener);

    toast.success("Archive saved");

    // 订阅时的初始调用 + push 后的调用
    expect(listener).toHaveBeenCalledTimes(2);
    const lastCallToasts = listener.mock.calls[1][0];
    expect(lastCallToasts).toHaveLength(1);
    expect(lastCallToasts[0]).toMatchObject({
      message: "Archive saved",
      variant: "success",
    });

    unsubscribe();
  });

  it("assigns each toast a unique id", () => {
    const listener = jest.fn();
    subscribeToasts(listener);

    toast.error("first");
    toast.error("second");

    const finalToasts = listener.mock.calls.at(-1)![0];
    expect(finalToasts).toHaveLength(2);
    expect(finalToasts[0].id).not.toBe(finalToasts[1].id);
  });

  it("auto-dismisses a toast after the timeout", () => {
    const listener = jest.fn();
    subscribeToasts(listener);

    toast.info("will disappear");
    expect(listener.mock.calls.at(-1)![0]).toHaveLength(1);

    jest.advanceTimersByTime(4000);

    expect(listener.mock.calls.at(-1)![0]).toHaveLength(0);
  });

  it("dismiss() removes a toast immediately by id", () => {
    const listener = jest.fn();
    subscribeToasts(listener);

    toast.error("dismiss me");
    const [pushed] = listener.mock.calls.at(-1)![0];

    dismiss(pushed.id);

    expect(listener.mock.calls.at(-1)![0]).toHaveLength(0);
  });

  it("stops notifying a listener after it unsubscribes", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToasts(listener);
    unsubscribe();

    listener.mockClear();
    toast.success("after unsubscribe");

    expect(listener).not.toHaveBeenCalled();
  });
});
