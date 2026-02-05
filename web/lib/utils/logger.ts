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

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: unknown,
  ): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : "";
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
