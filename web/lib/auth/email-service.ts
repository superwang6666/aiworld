import nodemailer from "nodemailer";

import { logger } from "@/lib/utils/logger";

import type { Transporter } from "nodemailer";

/**
 * 邮件服务配置
 */
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * 获取邮件配置
 */
function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    logger.warn(
      "Email service not configured, email functionality will be unavailable",
    );
    return null;
  }

  return {
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465, // 465 端口使用 SSL
    auth: {
      user,
      pass,
    },
  };
}

/**
 * 创建邮件传输器
 */
function createTransporter(): Transporter | null {
  const config = getEmailConfig();

  if (!config) {
    return null;
  }

  return nodemailer.createTransport(config);
}

/**
 * 发送邮箱验证邮件
 *
 * @param email - 收件人邮箱
 * @param username - 用户名
 * @param token - 验证令牌
 */
export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string,
): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error("邮件服务未配置");
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:8000";
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"AI World" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "验证您的邮箱 - AI World",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #1a1a23 0%, #23232d 100%);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            background: linear-gradient(to right, #8a8a95, #6a6a75);
            border-radius: 18px;
            padding: 12px 24px;
            display: inline-block;
            font-weight: bold;
            font-size: 16px;
            color: white;
            margin-bottom: 20px;
          }
          h1 {
            color: #ebebf0;
            font-size: 28px;
            margin: 0 0 10px 0;
          }
          .subtitle {
            color: #b4b9c3;
            font-size: 14px;
          }
          .content {
            background: rgba(35, 35, 45, 0.6);
            border-radius: 12px;
            padding: 30px;
            margin: 20px 0;
            border: 1px solid rgba(100, 100, 115, 0.3);
          }
          .greeting {
            color: #c1c5cc;
            font-size: 16px;
            margin-bottom: 20px;
          }
          .message {
            color: #c1c5cc;
            font-size: 14px;
            line-height: 1.8;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(to right, #00ff88, #39ff14);
            color: #1a1a23;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(100, 100, 115, 0.2);
            color: #7a7a88;
            font-size: 12px;
          }
          .link {
            color: #00ff88;
            text-decoration: none;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">WORLD</div>
            <h1>验证您的邮箱</h1>
            <p class="subtitle">Email Verification</p>
          </div>

          <div class="content">
            <p class="greeting">你好，${username}！</p>
            <p class="message">
              感谢您注册 AI World 世界观生成器。<br>
              请点击下方按钮验证您的邮箱地址，以激活您的账户。
            </p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">验证邮箱</a>
            </div>
          </div>

          <div class="footer">
            <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
            <p><a href="${verificationUrl}" class="link">${verificationUrl}</a></p>
            <p style="margin-top: 20px;">此链接将在 24 小时后失效。</p>
            <p>如果您没有注册 AI World 账户，请忽略此邮件。</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * 发送密码重置邮件
 *
 * @param email - 收件人邮箱
 * @param username - 用户名
 * @param token - 重置令牌
 */
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  token: string,
): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error("邮件服务未配置");
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:8000";
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: `"AI World" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "重置您的密码 - AI World",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #1a1a23 0%, #23232d 100%);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            background: linear-gradient(to right, #8a8a95, #6a6a75);
            border-radius: 18px;
            padding: 12px 24px;
            display: inline-block;
            font-weight: bold;
            font-size: 16px;
            color: white;
            margin-bottom: 20px;
          }
          h1 {
            color: #ebebf0;
            font-size: 28px;
            margin: 0 0 10px 0;
          }
          .subtitle {
            color: #b4b9c3;
            font-size: 14px;
          }
          .content {
            background: rgba(35, 35, 45, 0.6);
            border-radius: 12px;
            padding: 30px;
            margin: 20px 0;
            border: 1px solid rgba(100, 100, 115, 0.3);
          }
          .greeting {
            color: #c1c5cc;
            font-size: 16px;
            margin-bottom: 20px;
          }
          .message {
            color: #c1c5cc;
            font-size: 14px;
            line-height: 1.8;
            margin-bottom: 30px;
          }
          .warning {
            background: rgba(255, 107, 107, 0.1);
            border-left: 4px solid #ff6b6b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            color: #ffb3b3;
            font-size: 13px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(to right, #ff6b6b, #ee5a6f);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3px;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(100, 100, 115, 0.2);
            color: #7a7a88;
            font-size: 12px;
          }
          .link {
            color: #ff6b6b;
            text-decoration: none;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">WORLD</div>
            <h1>重置您的密码</h1>
            <p class="subtitle">Password Reset</p>
          </div>

          <div class="content">
            <p class="greeting">你好，${username}！</p>
            <p class="message">
              我们收到了重置您账户密码的请求。<br>
              请点击下方按钮设置新密码。
            </p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">重置密码</a>
            </div>
            <div class="warning">
              <strong>⚠️ 安全提示：</strong><br>
              如果您没有请求重置密码，请忽略此邮件。您的账户仍然安全。
            </div>
          </div>

          <div class="footer">
            <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
            <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
            <p style="margin-top: 20px;">此链接将在 1 小时后失效。</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * 发送欢迎邮件（邮箱验证成功后）
 *
 * @param email - 收件人邮箱
 * @param username - 用户名
 */
export async function sendWelcomeEmail(
  email: string,
  username: string,
): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    // 欢迎邮件是可选的，不抛出错误
    return;
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:8000";

  const mailOptions = {
    from: `"AI World" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "欢迎来到 AI World！",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #1a1a23 0%, #23232d 100%);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            background: linear-gradient(to right, #8a8a95, #6a6a75);
            border-radius: 18px;
            padding: 12px 24px;
            display: inline-block;
            font-weight: bold;
            font-size: 16px;
            color: white;
            margin-bottom: 20px;
          }
          h1 {
            color: #ebebf0;
            font-size: 28px;
            margin: 0 0 10px 0;
          }
          .subtitle {
            color: #b4b9c3;
            font-size: 14px;
          }
          .content {
            background: rgba(35, 35, 45, 0.6);
            border-radius: 12px;
            padding: 30px;
            margin: 20px 0;
            border: 1px solid rgba(100, 100, 115, 0.3);
          }
          .greeting {
            color: #c1c5cc;
            font-size: 16px;
            margin-bottom: 20px;
          }
          .message {
            color: #c1c5cc;
            font-size: 14px;
            line-height: 1.8;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(to right, #00ff88, #39ff14);
            color: #1a1a23;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(100, 100, 115, 0.2);
            color: #7a7a88;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">WORLD</div>
            <h1>欢迎来到 AI World！</h1>
            <p class="subtitle">Welcome to AI World</p>
          </div>

          <div class="content">
            <p class="greeting">你好，${username}！</p>
            <p class="message">
              🎉 恭喜您成功注册 AI World 世界观生成器！<br><br>
              现在您可以开始创建属于自己的独特世界了。我们的 AI 专家团队将帮助您：<br>
              • 验证世界观的独特性<br>
              • 生成符合七大法则的世界规则<br>
              • 提供专业的世界构建建议<br><br>
              准备好开始您的创作之旅了吗？
            </p>
            <div style="text-align: center;">
              <a href="${baseUrl}" class="button">开始创作</a>
            </div>
          </div>

          <div class="footer">
            <p>祝您创作愉快！</p>
            <p>AI World 团队</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    logger.error("Failed to send welcome email", { error });
    // 不抛出错误，因为欢迎邮件是可选的
  }
}
