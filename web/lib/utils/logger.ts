/**
 * 简单的日志系统
 * 在开发环境输出到控制台，生产环境可以扩展为发送到日志服务
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface _LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

/**
 * JSON.stringify 默认序列化 Error 实例得到 "{}"——message/stack/name 都不是它自己的
 * 可枚举属性。这个 replacer 把 data 里(包括嵌套的)Error 对象转成能看见内容的普通对象，
 * 否则 logger.error("...", { error }) 在日志里就是一句没有任何信息量的空对象。
 */
function errorReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      ...("cause" in value ? { cause: value.cause } : {}),
    };
  }
  return value;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: unknown,
  ): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data, errorReplacer)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
  }

  info(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage("info", message, data));
    }
    // 生产环境可以发送到日志服务
  }

  warn(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.warn(this.formatMessage("warn", message, data));
    }
    // 生产环境可以发送到日志服务
  }

  error(message: string, data?: unknown): void {
    // 错误日志在所有环境都输出
    console.error(this.formatMessage("error", message, data));
    // 生产环境可以发送到错误追踪服务（如 Sentry）
  }

  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage("debug", message, data));
    }
  }
}

export const logger = new Logger();
