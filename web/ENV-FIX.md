# 修复 .env 文件加载问题

## 当前状态
`.env` 文件已经重新创建为干净格式，内容为：
```
DEEPSEEK_API_KEY=sk-c3a254f89029480181f5d34002dcf2e0
```

## ⚠️ 重要：必须重启服务器

Next.js **只在启动时**加载 `.env` 文件。如果你修改了 `.env` 文件，必须：

1. **完全停止服务器**
   - 在运行 `npm run dev` 的终端按 `Ctrl + C`
   - 等待进程完全停止（看到命令提示符）

2. **重新启动服务器**
   ```bash
   npm run dev
   ```

3. **验证环境变量**
   访问：http://localhost:8000/api/test-env
   
   应该看到：
   ```json
   {
     "DEEPSEEK_API_KEY": "已设置 (长度: 40)",
     "OPENAI_API_KEY": "❌ 未设置",
     "hasApiKey": true
   }
   ```

## 如果仍然不工作

### 方案 1: 使用 .env.local
创建一个新文件 `.env.local`（与 `.env` 同级），内容相同：
```
DEEPSEEK_API_KEY=sk-c3a254f89029480181f5d34002dcf2e0
```
Next.js 会优先读取 `.env.local`

### 方案 2: 检查文件位置
确保 `.env` 文件在项目根目录，与以下文件同级：
- `package.json`
- `next.config.ts`
- `app/` 文件夹

### 方案 3: 检查文件编码
- 使用 UTF-8 编码
- 不要使用 UTF-8 with BOM
- 使用 VS Code 或 Notepad++ 等编辑器，确保保存为 UTF-8

## 测试命令

在 PowerShell 中验证文件内容：
```powershell
Get-Content .env -Raw
```

应该只显示一行，没有额外的空格或换行：
```
DEEPSEEK_API_KEY=sk-c3a254f89029480181f5d34002dcf2e0
```

