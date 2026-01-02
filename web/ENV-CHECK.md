# .env 文件配置检查清单

## ✅ 检查步骤

### 1. 确认 .env 文件位置
`.env` 文件必须在项目根目录：`e:\项目\私活\世界观构筑\web\.env`

### 2. 检查 .env 文件格式

**正确的格式（无引号，无空格）：**
```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**错误的格式：**
```
DEEPSEEK_API_KEY = sk-xxxxx  ❌ (有空格)
DEEPSEEK_API_KEY="sk-xxxxx"  ❌ (有引号)
DEEPSEEK_API_KEY=sk-xxxxx    ❌ (行尾有空格)
deepseek_api_key=sk-xxxxx    ❌ (小写，应该是大写)
```

### 3. 确认文件编码
- 使用 UTF-8 编码
- 不要使用 BOM 编码
- Windows 记事本：保存时选择 "UTF-8"（不是 "UTF-8 with BOM"）

### 4. 确认内容示例

**使用 DeepSeek（推荐）：**
```
DEEPSEEK_API_KEY=sk-你的实际密钥
```

**或使用 OpenAI：**
```
OPENAI_API_KEY=sk-你的实际密钥
```

### 5. 重启服务器
修改 .env 文件后，必须重启 Next.js 开发服务器：

1. 停止当前服务器（在终端按 `Ctrl+C`）
2. 重新运行：`npm run dev`

### 6. 验证配置
打开浏览器控制台（F12），查看是否有错误信息。

## 🔍 快速检查命令

在 PowerShell 中运行（仅用于检查，不要在生产环境暴露密钥）：
```powershell
# 检查文件是否存在
Test-Path .env

# 查看文件前几行（不显示完整密钥）
Get-Content .env -Head 3
```

## ⚠️ 常见问题

1. **文件未保存**: 确保已保存 .env 文件
2. **服务器未重启**: 修改 .env 后必须重启服务器
3. **路径错误**: .env 必须在项目根目录，与 package.json 同级
4. **格式错误**: 确保没有多余的空格、引号或特殊字符
5. **编码问题**: 使用 UTF-8 编码保存文件
