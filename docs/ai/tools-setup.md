# 工具配置指南

## 📚 本章信息

- **难度等级**：入门 · 🔰
- **预计时间**：60 分钟
- **本章简介**：详细介绍主流 AI 编程工具的安装、配置和使用方法，包括 Claude Code、OpenAI、DeepSeek、GitHub Copilot、Cursor、OpenCode 等工具。

## 🎯 学习目标

完成本章后，你将能够：

- ✅ 了解主流 AI 编程工具的特点和适用场景
- ✅ 掌握 Claude Code 的安装和配置
- ✅ 掌握 OpenCode 的安装和配置
- ✅ 掌握 Cursor AI 编辑器的配置
- ✅ 掌握 GitHub Copilot 的配置
- ✅ 配置多种 AI 模型（OpenAI、Gemini、DeepSeek、智谱 GLM、通义千问等）
- ✅ 了解各工具的定价和成本

---

## 目录

- [0.1 AI 编程工具介绍](#01-ai-编程工具介绍)
  - [0.1.1 对话式 AI 工具](#011-对话式-ai-工具)
  - [0.1.2 代码补全工具](#012-代码补全工具)
  - [0.1.3 IDE 集成 AI 助手](#013-ide-集成-ai-助手)
  - [0.1.4 工具选择建议](#014-工具选择建议)
  - [0.1.5 配置其他模型](#015-配置其他模型openaigemini智谱-glm通义千问等)

---

## AI 编程工具介绍

### 对话式 AI 工具

#### **Claude（Anthropic）**

```markdown
优势：
✅ 擅长长文本理解和代码生成
✅ 安全性高，有害内容少
✅ 支持多种编程语言
✅ 代码质量较好
✅ 提供 Claude Code CLI 工具

适用场景：

- 复杂业务逻辑实现
- 代码重构建议
- 技术方案对比
- 代码审查
- 终端 AI 辅助编程
```

---

### Claude Code 安装与配置完全指南

**Claude Code** 是 Anthropic 官方推出的 AI 编程助手，支持命令行和 IDE 集成。

**系统要求**

```bash
- Node.js 18+ (必需)
- Git
- macOS 10.15+ / Windows 10/11 / Linux
```

**安装方式一：官方脚本（推荐）**

```bash
# macOS / Linux
curl -fsSL https://cdn.claude.ai/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://cdn.claude.ai/install.ps1 | iex"

# 验证安装
claude --version
```

**安装方式二：npm 安装**

```bash
# 全局安装
npm install -g @anthropic-ai/claude-code

# 或使用 bun
bun add -g @anthropic-ai/claude-code
```

**安装方式三：Homebrew（macOS）**

```bash
brew tap anthropic/claude
brew install claude
```

**配置 API Key**

```bash
# 方法一：环境变量配置（推荐）
# 编辑 ~/.zshrc 或 ~/.bashrc
export ANTHROPIC_API_KEY="sk-ant-xxxxxxxx"

# 保存后执行
source ~/.zshrc

# 方法二：配置文件
# 创建 ~/.claude/settings.json
{
  "apiKey": "sk-ant-xxxxxxxx",
  "defaultModel": "claude-3-5-sonnet-20241022"
}

# 方法三：运行时配置
claude auth login
# 按提示输入 API Key
```

**国内用户配置（使用中转 API）**

```bash
# 编辑 ~/.claude/settings.json
{
  "apiKey": "你的中转API密钥",
  "baseUrl": "https://your-proxy.com/v1"
}

# 或使用环境变量
export ANTHROPIC_BASE_URL="https://your-proxy.com/v1"
export ANTHROPIC_API_KEY="sk-xxxxxxxx"
```

**基本使用**

```bash
# 启动交互式会话
claude

# 指定项目目录
claude -c ~/my-project

# 查看帮助
claude --help

# 非交互模式：执行单次命令
claude -p "创建一个 README 文件"
```

**常用命令**

```bash
# 在 Claude Code CLI 中
/init              # 初始化项目，扫描代码库
/new               # 开始新会话
/exit              # 退出

# 引用文件
"解释 @src/main.ts 文件的功能"

# 自然语言交互
"创建一个用户登录表单组件"
```

**IDE 集成**

```bash
# VSCode 插件
# 1. 打开 VSCode 扩展商店
# 2. 搜索 "Claude Code"
# 3. 安装官方插件

# JetBrains 系列（IDEA、PyCharm 等）
# 1. 打开 Settings → Plugins
# 2. 搜索 "Claude Code"
# 3. 安装并重启
# 4. 配置 API Key
```

**配置文件说明**

```bash
# macOS/Linux 路径
~/.claude/settings.json

# Windows 路径
C:\Users\你的用户名\.claude\settings.json

# 示例配置
{
  "apiKey": "sk-ant-xxxxxxxx",
  "baseUrl": "https://api.anthropic.com",
  "defaultModel": "claude-3-5-sonnet-20241022",
  "maxTokens": 200000,
  "temperature": 0.7
}
```

**高级功能**

```bash
# 项目上下文文件（CLAUDE.md）
# 在项目根目录创建 CLAUDE.md，内容会被 AI 自动读取

# 示例 CLAUDE.md
# 项目概述
这是一个 Vue3 电商项目，使用 Vite + TypeScript。

# 代码规范
- 使用组合式 API 和 script setup
- 组件命名采用 PascalCase
- 使用 TypeScript 类型定义

# 项目结构
src/
  ├── components/  # 可复用组件
  ├── views/       # 页面组件
  └── utils/       # 工具函数
```

**常见问题**

```bash
# 问题 1：command not found: claude
# 解决：检查 PATH 配置
echo $PATH  # 查看当前 PATH
which npm   # 查看 npm 路径
# 将 npm 全局路径添加到 PATH

# 问题 2：API Key 无效
# 解决：检查配置文件或环境变量
cat ~/.claude/settings.json
echo $ANTHROPIC_API_KEY

# 问题 3：网络连接失败（国内用户）
# 解决：使用国内中转 API
export ANTHROPIC_BASE_URL="https://your-proxy.com/v1"
```

---

#### **ChatGPT（OpenAI）**

```markdown
优势：
✅ 知识面广，回答全面
✅ 代码生成能力强
✅ 支持插件生态
✅ 多轮对话体验好

适用场景：

- 快速获取知识
- 生成示例代码
- 解释技术概念
- 学习指导
```

---

### ChatGPT API 配置指南

**获取 API Key**

```bash
# 1. 访问 OpenAI 平台
https://platform.openai.com/api-keys

# 2. 注册/登录账号
# 3. 创建新的 API Key
# 4. 复制保存 API Key（sk-xxxxxxxx）
```

**安装 OpenAI SDK**

```bash
# npm 安装
npm install openai

# yarn 安装
yarn add openai

# pnpm 安装
pnpm add openai
```

**基本使用示例**

```javascript
// JavaScript/Node.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // 从环境变量读取
  baseURL: 'https://api.openai.com/v1'
});

// 简单对话
async function chat(message) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',  // 或 'gpt-4o-mini'
    messages: [
      { role: 'system', content: '你是一个 Vue3 专家助手。' },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return response.choices[0].message.content;
}

// 使用示例
chat('解释 Vue3 的 ref 和 reactive 的区别')
  .then(answer => console.log(answer));
```

**Python 使用**

```python
# 安装
pip install openai

# 使用示例
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个 Vue3 专家助手。"},
        {"role": "user", "content": "解释 Vue3 的 ref 和 reactive 的区别"}
    ],
    temperature=0.7,
    max_tokens=2000
)

print(response.choices[0].message.content)
```

**环境变量配置**

```bash
# Linux/macOS: 编辑 ~/.bashrc 或 ~/.zshrc
export OPENAI_API_KEY="sk-xxxxxxxx"

# Windows PowerShell
$env:OPENAI_API_KEY="sk-xxxxxxxx"

# Windows CMD (永久设置)
setx OPENAI_API_KEY "sk-xxxxxxxx"

# 保存后执行
source ~/.zshrc  # Linux/macOS
```

**常用模型**

```bash
# GPT-4 系列
gpt-4o           # 最新旗舰模型，多模态
gpt-4o-mini      # 轻量版，速度快，成本低
gpt-4-turbo      # GPT-4 Turbo

# GPT-3.5 系列
gpt-3.5-turbo    # 经济实惠，速度快
```

**国内用户配置（使用中转）**

```javascript
const openai = new OpenAI({
  apiKey: 'your-api-key',
  baseURL: 'https://your-proxy.com/v1'  // 使用中转 API
});
```

**费用说明**

```bash
# GPT-4o 价格（2026年）
- 输入: $2.50 / 1M tokens
- 输出: $10.00 / 1M tokens

# GPT-4o-mini 价格
- 输入: $0.15 / 1M tokens
- 输出: $0.60 / 1M tokens

# GPT-3.5-turbo 价格
- 输入: $0.50 / 1M tokens
- 输出: $1.50 / 1M tokens
```

---

#### **DeepSeek（国产）**

```markdown
优势：
✅ 中文理解能力强
✅ 数学推理能力强
✅ 免费使用
✅ 国内访问稳定
✅ API 兼容 OpenAI 格式

适用场景：

- 中文技术问题
- 算法实现
- 预算有限的团队
- 需要中文 AI 助手
```

---

### DeepSeek API 配置完全指南

**获取 API Key**

```bash
# 1. 访问 DeepSeek 开放平台
https://platform.deepseek.com/api_keys

# 2. 注册/登录账号
# 3. 创建新的 API Key
# 4. 复制保存 API Key（sk-xxxxxxxx）
```

**安装 SDK**

```bash
# 使用 OpenAI SDK（DeepSeek API 兼容 OpenAI 格式）
npm install openai

# 或使用 curl 直接调用
```

**JavaScript/Node.js 使用**

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-xxxxxxxx',  // 你的 DeepSeek API Key
  baseURL: 'https://api.deepseek.com/v1'
});

// 基础对话
async function chat(message) {
  const response = await client.chat.completions.create({
    model: 'deepseek-chat',  // 或 'deepseek-coder'
    messages: [
      { role: 'system', content: '你是一个 Vue3 专家助手。' },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return response.choices[0].message.content;
}

// 使用示例
chat('用中文解释 Vue3 的组合式 API')
  .then(answer => console.log(answer));
```

**Python 使用**

```python
# 安装 OpenAI SDK
pip install openai

from openai import OpenAI

client = OpenAI(
    api_key="sk-xxxxxxxx",
    base_url="https://api.deepseek.com/v1"
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "你是一个 Vue3 专家助手。"},
        {"role": "user", "content": "用中文解释 Vue3 的组合式 API"}
    ],
    temperature=0.7,
    max_tokens=2000
)

print(response.choices[0].message.content)
```

**cURL 使用**

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxxxxxxx" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "system", "content": "你是一个 Vue3 专家助手。"},
      {"role": "user", "content": "解释 Vue3 的响应式系统"}
    ],
    "temperature": 0.7,
    "max_tokens": 2000
  }'
```

**环境变量配置**

```bash
# Linux/macOS: 编辑 ~/.bashrc 或 ~/.zshrc
export DEEPSEEK_API_KEY="sk-xxxxxxxx"

# Windows PowerShell
$env:DEEPSEEK_API_KEY="sk-xxxxxxxx"

# 保存后执行
source ~/.zshrc

# 在代码中使用
const apiKey = process.env.DEEPSEEK_API_KEY;
```

**可用模型**

```bash
# DeepSeek-V3（最新旗舰模型）
deepseek-chat          # 通用对话模型
deepseek-coder         # 代码专用模型

# DeepSeek-R1（推理模型）
deepseek-reasoner      # 强化推理模型
```

**费用说明（2026年）**

```bash
# DeepSeek-V3 价格
deepseek-chat:
- 输入: ¥1.00 / 1M tokens（约 $0.14）
- 输出: ¥2.00 / 1M tokens（约 $0.28）

deepseek-coder:
- 输入: ¥1.00 / 1M tokens
- 输出: ¥2.00 / 1M tokens

# DeepSeek-R1 价格
deepseek-reasoner:
- 输入: ¥4.00 / 1M tokens
- 输出: ¥8.00 / 1M tokens

💡 新用户通常有免费额度！
```

**在 VSCode 中使用 DeepSeek**

```bash
# 方法一：使用 Continue 插件
# 1. 安装 VSCode 扩展 "Continue"
# 2. 配置文件: ~/.continue/config.json

{
  "models": [{
    "title": "DeepSeek",
    "provider": "openai",
    "model": "deepseek-chat",
    "apiBase": "https://api.deepseek.com/v1",
    "apiKey": "sk-xxxxxxxx"
  }]
}

# 方法二：使用 CodeGPT 插件
# 1. 安装 VSCode 扩展 "CodeGPT"
# 2. 设置中配置 API Key 和 Base URL
```

**与 OpenCode/Cursor 集成**

```bash
# OpenCode 配置
# 在 OpenCode 中输入 /connect
# 选择 "OpenAI Compatible"
# Base URL: https://api.deepseek.com/v1
# API Key: sk-xxxxxxxx

# Cursor 配置
# Settings → AI Model Provider
# 选择 "OpenAI Compatible"
# Base URL: https://api.deepseek.com/v1
# API Key: sk-xxxxxxxx
```

**常见问题**

```bash
# 问题 1：API Key 无效
# 解决：检查 API Key 是否正确复制
echo $DEEPSEEK_API_KEY

# 问题 2：请求频率限制
# 解决：DeepSeek 有速率限制，可以添加重试逻辑

# 问题 3：上下文长度限制
# 解决：DeepSeek-V3 支持 64K 上下文，注意控制 token 数量
```

**DeepSeek V3 新特性（2026）**

```markdown
🚀 DeepSeek V3 重大升级：

1. 性能提升
   ✅ 代码生成能力媲美 Claude 3.5 Sonnet
   ✅ 数学推理能力大幅提升
   ✅ 中文理解更加精准
   ✅ 生成速度提升 2-3 倍

2. 功能增强
   ✅ 支持 64K 长上下文
   ✅ 支持 Function Calling
   ✅ 支持流式输出
   ✅ 支持多轮对话

3. 成本优势
   ✅ 价格仅为 GPT-4 的 1/10
   ✅ 新用户有免费额度
   ✅ 性价比极高

4. 适用场景
   ✅ 代码生成和重构
   ✅ 算法和数学问题
   ✅ 中文技术文档编写
   ✅ 代码审查和优化
```

**DeepSeek V3 + Cline 完美组合**

```bash
# 为什么选择 Cline + DeepSeek V3？

优势：
✅ 完全免费（自备 API Key）
✅ 性能强大（媲美 Claude 3.5 Sonnet）
✅ 成本极低（月成本约 $2-5）
✅ Agent 模式强大
✅ 中文支持优秀

配置步骤：

# 1. 获取 DeepSeek API Key
# 访问：https://platform.deepseek.com/api_keys

# 2. 配置 Cline
# VS Code → Settings → 搜索 "cline"

{
  "cline.apiProvider": "openai",
  "cline.apiBase": "https://api.deepseek.com/v1",
  "cline.modelId": "deepseek-chat",
  "cline.apiKey": "sk-xxxxxxxx"
}

# 3. 开始使用
# Cmd+Shift+C (Mac) 或 Ctrl+Shift+C (Win/Linux)
# 输入你的需求，让 AI 帮你完成复杂任务
```

**DeepSeek V3 性能对比**

| 模型 | 代码质量 | 推理能力 | 中文支持 | 价格 | 速度 |
|------|---------|---------|---------|------|------|
| DeepSeek V3 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 💰 | 🚀🚀🚀 |
| Claude 3.5 Sonnet | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 💵💵💵 | 🚀🚀 |
| GPT-4o | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 💵💵💵 | 🚀🚀🚀 |
| Gemini 2.0 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 💰 | 🚀🚀🚀 |

**实际案例对比**

```markdown
任务：创建一个 Vue3 用户管理模块（CRUD + TypeScript）

# 使用 GPT-4o
成本：$0.15
时间：15 分钟
质量：⭐⭐⭐⭐⭐

# 使用 Claude 3.5 Sonnet
成本：$0.30
时间：12 分钟
质量：⭐⭐⭐⭐⭐

# 使用 DeepSeek V3
成本：$0.02 (仅为 GPT-4o 的 1/7)
时间：12 分钟
质量：⭐⭐⭐⭐⭐ (与 Claude 相当)

💡 结论：DeepSeek V3 性价比最高！
```

**DeepSeek V3 最佳实践**

```javascript
// 1. 合理使用上下文
// ✅ 好的做法：提供清晰、精简的上下文
const messages = [
  {
    role: 'system',
    content: '你是一个 Vue3 专家助手。使用组合式 API 和 TypeScript。'
  },
  {
    role: 'user',
    content: '创建一个用户登录表单，包含邮箱验证和密码强度检测。'
  }
];

// ❌ 不好的做法：提供过多不必要的信息
const badMessages = [
  { role: 'system', content: '...' }, // 过于冗长
  { role: 'user', content: '整个项目的历史...' }, // 不必要
  { role: 'assistant', content: '...' },   // 不必要
  { role: 'user', content: '...' }        // 过多轮对话
];

// 2. 使用合适的 temperature
// 0.0-0.3：创意写作、代码生成（需要精确）
// 0.4-0.7：对话、问答（平衡）
// 0.8-1.0：创意生成（需要多样性）

const response = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: messages,
  temperature: 0.7,  // 对话场景
  max_tokens: 2000,
  top_p: 0.9,
  frequency_penalty: 0,  // 代码生成时使用 0
  presence_penalty: 0   // 代码生成时使用 0
});

// 3. 流式输出（提升用户体验）
async function streamChat(message) {
  const stream = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: message }],
    stream: true,
    temperature: 0.7
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    process.stdout.write(content);
  }
}

// 4. 错误处理和重试
async function chatWithRetry(message, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 2000
      });
      return response.choices[0].message.content;
    } catch (error) {
      if (error.status === 429) {  // 速率限制
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`速率限制，${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (i === maxRetries - 1) {
        throw error;
      }
    }
  }
}
```

**DeepSeek V3 与其他工具的集成**

```bash
# 1. Cline + DeepSeek V3（推荐）
# 最强免费组合，性能强大

# 2. Cursor + DeepSeek V3
# 体验好，但需要自定义配置

# 3. Continue + DeepSeek V3
# 开源免费，VS Code 深度集成

# 4. OpenCode + DeepSeek V3
# 终端场景体验好
```

**成本优化建议**

```markdown
# 1. 优化 Prompt
✅ 精简指令，减少 token 消耗
✅ 使用系统提示词（system message）
✅ 避免重复的上下文

# 2. 缓存常见问题
✅ 将常见问题和答案存储到本地
✅ 避免重复询问 AI 相同问题

# 3. 合理使用模型
✅ 简单任务：使用 deepseek-coder（更便宜）
✅ 复杂任务：使用 deepseek-chat（更强）
✅ 代码生成：temperature = 0.2-0.3

# 4. 监控使用量
✅ 定期检查 API 使用情况
✅ 设置预算提醒
✅ 使用流式输出减少等待时间
```

---

**最佳实践**

```javascript
// 1. 使用重试机制
async function chatWithRetry(message, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await chat(message);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`重试 ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// 2. 流式输出
async function streamChat(message) {
  const stream = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: message }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}
```

---

#### **OpenCode（国产·开源）**

```markdown
优势：
✅ 开源免费，国内访问稳定
✅ 多平台支持：CLI + TUI + Desktop App + IDE 插件
✅ 灵活的模型选择：内置开源模型/付费接入主流顶级模型/本地模型
✅ 专注终端场景，类似 Claude Code
✅ 支持多会话并行
✅ LSP 支持，自动加载语言服务
✅ 支持 75+ 家模型提供商

适用场景：

- 希望使用开源工具的开发者
- 需要本地模型部署的场景
- 终端重度用户
- 预算有限的团队和个人开发者
- 需要隐私保护的企业项目

官方网站：https://opencode.ac.cn/
```

---

### OpenCode 安装与配置完全指南

**安装方式一：Desktop App（最简单，推荐新手）**

```bash
# 直接下载安装包
# macOS: opencode-desktop-darwin-*.dmg
# Windows: opencode-desktop-windows-x64.exe
# Linux: .deb / .rpm / AppImage

下载地址：https://opencode.ai/download
```

**安装方式二：一键脚本安装（CLI）**

```bash
# macOS / Linux / Windows（Git Bash/WSL）
curl -fsSL https://opencode.ai/install | bash

# 验证安装
opencode --version
```

**安装方式三：包管理器安装**

```bash
# macOS - Homebrew
brew install opencode

# npm / bun（需要 Node.js v18+）
npm install -g @opencode-ai/cli
bun add -g @opencode-ai/cli

# Windows - Chocolatey
choco install opencode

# Windows - Scoop
scoop bucket add extras
scoop install extras/opencode

# Arch Linux
paru -S opencode-bin
```

**首次配置与启动**

```bash
# 1. 进入项目目录
cd /path/to/your/project

# 2. 启动 OpenCode
opencode

# 3. 首次启动引导配置：
#    - 选择模型：可选择标注 Free 的免费模型（如 MiniMax M2.1、GLM-4.7）
#    - 登录选项：可跳过登录，后续再配置 API Key
#    - 语言选择：选择 Chinese，Agent 会优先使用中文交互

# 4. 查看可用免费模型
/models    # 列出所有可用模型，带 Free 标记的免费
```

**配置 API Key（使用商业模型）**

```bash
# 方法一：在 OpenCode 中配置
/connect    # 按提示选择模型提供商并粘贴 API Key

# 方法二：环境变量配置
# 编辑 ~/.zshrc 或 ~/.bashrc
export OPENAI_BASE_URL="https://api.deepseek.com/v1"
export OPENAI_API_KEY="sk-xxxxxxxx"

# 保存后执行
source ~/.zshrc
```

**核心功能使用**

```bash
# 项目初始化（强烈推荐）
/init      # 扫描项目结构，生成 AGENTS.md 项目指南文件

# 基本交互
# 直接输入自然语言描述需求，例如：
"在当前目录创建一个登录页面"
"解释 src/main.ts 中的认证逻辑"
"修复 login 函数中的 bug"

# 引用文件（使用 @ 符号）
"文件 @index.html 包含哪些功能"
"重构 @src/utils/helper.js 使其更高效"

# 模式切换
Tab 键     # 切换 Plan/Build 模式
           # Plan 模式：只读规划，更安全
           # Build 模式：全权限，可直接编辑文件
```

**常用 Slash 命令**

```bash
# 核心命令
/init          # 初始化项目，生成 AGENTS.md
/models        # 查看和切换模型
/connect       # 配置 API Key

# 会话管理
/new           # 开始新会话
/sessions      # 查看和切换历史会话
/compact       # 压缩/总结当前会话
/share         # 生成会话分享链接

# 编辑操作
/undo          # 撤销最后操作（需 Git 仓库）
/redo          # 重做已撤销的操作

# 视图与辅助
/details       # 切换工具执行详情显示
/thinking      # 切换思考过程可见性
/theme         # 切换主题
/help          # 显示帮助
/export        # 导出对话为 Markdown

# 退出
/exit          # 退出 OpenCode
```

**命令行模式（CLI 参数）**

```bash
# 启动交互式 TUI
opencode

# 指定项目目录启动
opencode -c ~/my-project

# 调试模式
opencode -d

# 非交互模式：直接执行单次提示
opencode -p "创建一个 README 文件"
opencode -p "修复这个 bug" -f json    # 输出 JSON 格式
opencode -p "生成代码" -q              # 安静模式（无加载动画）
```

**实战示例**

```bash
# 示例 1：创建一个 Vue3 组件
opencode
> /init
> 创建一个 Vue3 用户头像组件，支持 props：src、size、alt

# 示例 2：代码审查
opencode
> 请审查 @src/components/UserCard.vue 的代码质量

# 示例 3：重构代码
opencode
> /init
> 重构 @src/utils/api.ts，使其支持 TypeScript 类型定义和错误处理

# 示例 4：脚本自动化
opencode -p "运行测试并修复失败的用例" -f json
```

**高级技巧**

```bash
# 1. 自定义命令
# 在 ~/.config/opencode/commands/ 创建 .md 文件
# 例如：prime-context.md（预加载指令）

# 2. 权限控制
# 在项目根目录创建 opencode.json
{
  "tools": {
    "bash": "ask",      # 敏感操作需手动确认
    "write": "allow",   # 允许直接写文件
    "edit": "allow"     # 允许编辑文件
  }
}

# 3. 多会话并行
# 可同时开启多个终端运行 opencode，处理不同任务

# 4. IDE 集成
# VSCode 搜索 "OpenCode extension" 安装插件
```

**常见问题**

```bash
# 问题：command not found: opencode
# 解决：全局安装路径未加入 PATH
# 重新安装并确保路径正确：
npm config get prefix  # 查看 npm 全局路径
# 将路径添加到 PATH

# 问题：国内网络慢，依赖下载失败
# 解决：使用国内镜像
npm config set registry https://registry.npmmirror.com

# 问题：权限错误（EACCES）
# 解决：使用 sudo 安装
sudo npm install -g @opencode-ai/cli
```

**安装验证测试**

```bash
# 测试安装是否成功
opencode run "创建一个 demo.txt，内容为：你好 OpenCode"

# 如果成功创建了文件，说明安装配置正确！
```

---

### 代码补全工具

#### **GitHub Copilot**

```javascript
// 安装：VSCode扩展商店搜索 "GitHub Copilot"

// 使用示例：输入注释，自动生成代码
// 创建一个计算数组和的函数
function sumArray(arr) {
  return arr.reduce((acc, num) => acc + num, 0);
}

// Copilot会根据上下文自动补全代码
const users = [
  { name: "张三", age: 25 },
  { name: "李四", age: 30 },
];

// 输入注释：// 过滤出年龄大于28的用户
// Copilot自动补全：
const filteredUsers = users.filter((user) => user.age > 28);
```

---

### GitHub Copilot 安装与配置完全指南

**系统要求**

```bash
- VSCode / Visual Studio / JetBrains 系列 IDE
- GitHub 账号
- Copilot 订阅（学生免费，试用期可用）
```

**安装方式一：VSCode 扩展（最常用）**

```bash
# 1. 打开 VSCode
# 2. 点击左侧扩展图标（或 Ctrl+Shift+X）
# 3. 搜索 "GitHub Copilot"
# 4. 点击 Install 安装
# 5. 同时安装 "GitHub Copilot Chat"（聊天功能）

# 6. 登录 GitHub 账号
# 点击活动栏的 "Sign in to GitHub"
# 完成授权流程

# 7. 启用 Copilot
# 按 Ctrl+Shift+P
# 输入 "GitHub Copilot: Enable"
# 选择启用
```

**安装方式二：Visual Studio**

```bash
# 1. 打开 Visual Studio
# 2. 点击 Extensions → Manage Extensions
# 3. 搜索 "GitHub Copilot"
# 4. 下载并安装
# 5. 重启 Visual Studio
# 6. 登录 GitHub 账号
```

**安装方式三：JetBrains 系列（IDEA、PyCharm、WebStorm）**

```bash
# 1. 打开 IDE
# 2. File → Settings → Plugins
# 3. 搜索 "GitHub Copilot"
# 4. 安装插件
# 5. 重启 IDE
# 6. 登录 GitHub 账号
```

**订阅与激活**

```bash
# 免费试用
# 新用户可获得 30 天免费试用

# 学生免费
# 访问：https://education.github.com/benefits
# 使用学校邮箱申请 GitHub Student Developer Pack
# 包含 Copilot 免费使用权

# 个人订阅
# $10/月 或 $100/年
# 访问：https://github.com/features/copilot

# 企业订阅
# $19/用户/月
# 包含更多管理功能
```

**核心功能使用**

```bash
# 1. 代码补全（自动）
# 在编辑器中输入代码时，Copilot 会自动建议
# 按 Tab 接受建议
# 按 Esc 忽略建议

# 2. 多行代码补全
# 输入注释或函数签名
// 创建一个验证邮箱的函数
function validateEmail(email) {
  // Copilot 会自动生成完整的验证逻辑
}

# 3. Copilot Chat（对话式编程）
# Ctrl+I 打开 Chat 面板
# 可以：
- 解释代码
- 生成代码
- 修复 Bug
- 优化代码
- 添加测试

# 示例对话：
"解释这段 Vue3 组件的功能"
"为这个函数添加单元测试"
"重构这段代码使其更高效"
```

**快捷键**

```bash
# VSCode 默认快捷键
Ctrl+I              # 打开 Copilot Chat
Ctrl+Enter          # 在编辑器中打开 Copilot Chat
Ctrl+Shift+I       # 快速对话（选中代码）
Tab                # 接受代码建议
Esc                # 忽略建议
Alt+]              # 显示下一个建议
Alt+[              # 显示上一个建议

# 自定义快捷键
# File → Preferences → Keyboard Shortcuts
# 搜索 "copilot" 自定义
```

**Copilot Chat 命令**

```bash
# 在 Chat 面板中使用 / 命令

/explain           # 解释选中的代码
/fix               # 修复代码问题
/optimize          # 优化代码
/test              # 生成单元测试
/doc               # 生成文档注释
# 也可以用 /docs

# 示例：
/explain 这个 Vue3 组件的工作原理
/fix 修复这个响应式数据的 bug
/test 为 useState 函数编写测试
```

**最佳实践**

```javascript
// 1. 写清晰的注释
// 创建一个防抖函数，延迟 500ms 执行
function debounce(fn, delay) {
  // Copilot 会根据注释生成完整代码
}

// 2. 给出函数签名和类型
interface User {
  id: number;
  name: string;
  email: string;
}

function filterUsersByEmail(users: User[], keyword: string): User[] {
  // Copilot 会根据类型定义生成符合逻辑的代码
}

// 3. 使用示例引导
// 期望结果：[1, 2, 3, 4, 5, 6]
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const merged = mergeArrays(arr1, arr2);

// Copilot 会根据示例理解需求
```

**配置选项**

```json
// VSCode settings.json
{
  // 启用/禁用 Copilot
  "github.copilot.enable": {
    "*": true,
    "yaml": false,
    "plaintext": false,
    "markdown": false
  },

  // 内联建议
  "github.copilot.inlineSuggest.enable": true,

  // Copilot Chat 设置
  "github.copilot.chat.codeReference.enable": true,

  // 建议数量
  "github.copilot.advanced.inlineSuggestCount": 3
}
```

**适用语言**

```bash
# Copilot 支持几乎所有主流编程语言

最佳支持：
- JavaScript / TypeScript
- Python
- Java
- Go
- Ruby
- PHP
- C# / C++
- Rust
- Swift
- Vue.js / React
```

**常见问题**

```bash
# 问题 1：Copilot 不显示建议
# 解决：
1. 检查是否登录
2. 检查订阅是否过期
3. 确认该文件类型已启用
4. 尝试重启 VSCode

# 问题 2：建议质量不高
# 解决：
1. 提供更清晰的上下文
2. 写详细的注释
3. 给出示例
4. 使用变量名暗示意图

# 问题 3：学生认证失败
# 解决：
1. 确认使用学校邮箱
2. 上传学生证照片
3. 等待 1-3 天审核

# 问题 4：国内网络访问慢
# 解决：
1. 使用代理
2. 或考虑使用国内替代品（如 DeepSeek）
```

**进阶技巧**

```javascript
// 1. 使用 Copilot 生成整个文件
// 创建新文件 utils.js
// 输入注释：
// 工具函数集合
// - formatDate: 格式化日期
// - debounce: 防抖函数
// - throttle: 节流函数
// Copilot 会生成完整文件

// 2. 代码审查
// 选中代码 → Ctrl+I
// 输入：/review 或 /explain
// Copilot 会分析代码质量和潜在问题

// 3. 学习新库
// 输入：使用 VueUse 的 useMouse 获取鼠标位置
// Copilot 会展示用法示例
```

---

#### **Continue（开源 AI 结对编程伙伴）**

```markdown
特点：
✅ 完全开源免费，只需自备 API Key
✅ 深度集成 VS Code，保持熟悉环境
✅ 支持多种 AI 模型（Claude、GPT、DeepSeek 等）
✅ 超越 Copilot 的代码补全功能
✅ 能理解整个代码库上下文
✅ 支持代码解释、测试生成、重构和 Bug 修复

优势：
- 💰 完全免费，只需支付 API 费用
- 🔧 灵活配置，支持自定义模型
- 🌟 开源社区活跃，功能持续更新
- 📊 代码补全质量优于 Copilot

快捷键：

- Ctrl+Enter：打开聊天面板
- Ctrl+Shift+Enter：快速提问（选中代码）
- Ctrl+L：专注于当前文件的聊天
- Alt+→：接受代码建议
- Alt+[：显示上一个建议
```

---

#### **Cline（前身 Roo Code，免费 AI 助手）**

```markdown
特点：
✅ 完全免费开源
✅ 可配合 DeepSeek、Claude 等模型
✅ 强大的自主 Agent 模式
✅ 支持读文件 → 改代码 → 跑测试全流程
✅ 支持 MCP 协议扩展
✅ VS Code 深度集成

优势：
- 💰 完全免费（自备 API Key）
- 🤖 Agent 模式强大，可独立完成复杂任务
- 🚀 2026 年最热门的开源 AI 编程工具
- 📚 社区活跃，教程丰富

与 Cursor 对比：

| 特性 | Cline | Cursor |
|------|-------|--------|
| 价格 | 完全免费（自备 API） | $20/月 |
| Agent 模式 | ✅ 强大 | ✅ 内置 |
| VS Code 集成 | ✅ 原生支持 | ❌ 独立编辑器 |
| 模型选择 | ✅ 灵活 | ⚠️ 受限 |
| MCP 支持 | ✅ 原生 | ✅ 支持 |

快捷键：

- Cmd+Shift+C (Mac) / Ctrl+Shift+C (Win/Linux)：打开 Cline
- Cmd+Shift+P：打开命令面板
```

---

#### **Cursor（AI 代码编辑器）**

```markdown
特点：
✅ 基于 VSCode，界面熟悉
✅ 集成 GPT-4，代码理解能力强
✅ 支持代码库级别的对话
✅ 可以直接修改整个文件
✅ 内置多种 AI 模型
✅ 支持 Composer 模式（多文件编辑）

快捷键：

- Ctrl+K：生成代码
- Ctrl+L：对话模式
- Ctrl+I：整个项目理解
```

---

### Cursor 安装与配置完全指南

**Cursor** 是一个基于 VSCode 的 AI 原生代码编辑器，内置强大的 AI 功能。

**系统要求**

```bash
- macOS 10.15+ (Catalina 或更高)
- Windows 10/11 (64 位)
- Linux (Ubuntu 20.04+, Debian 11+, Fedora 35+)
- 至少 4GB RAM（推荐 8GB+）
- 至少 1GB 可用磁盘空间
```

**下载与安装**

```bash
# 1. 访问官网
https://www.cursor.com/

# 2. 下载对应系统版本
# Windows: cursor-setup-x.x.x.exe
# macOS: cursor-x.x.x.dmg
# Linux: cursor-x.x.x.AppImage

# 3. 安装步骤
# Windows:
# - 双击 .exe 文件
# - 按提示完成安装

# macOS:
# - 打开 .dmg 文件
# - 将 Cursor 拖到 Applications 文件夹
# - 首次打开需要右键点击 → 打开（安全设置）

# Linux:
# chmod +x cursor-x.x.x.AppImage
# ./cursor-x.x.x.AppImage

# 4. 首次启动
# - 同意许可协议
# - 选择默认设置
# - 可选：登录 Cursor 账号
```

**初始配置**

```bash
# 1. 选择 AI 模型
# Cursor 支持多种模型：

# 免费模型：
- Claude 3.5 Sonnet (需 API Key)
- GPT-4o (需订阅)
- GPT-4o-mini (免费额度)
- DeepSeek (需 API Key)

# Cursor 内置模型（推荐新手）：
- Cursor-small（快速，免费额度）
- Cursor-medium（平衡）

# 2. 配置 API Key（可选）
# Settings → AI Models
# 添加你的 API Key：
- OpenAI API Key
- Anthropic API Key
- DeepSeek API Key
- OpenRouter API Key

# 3. 个性化设置
# Settings → Appearance
# - 选择主题（Light/Dark）
# - 字体大小
# - 行号显示
```

**核心功能使用**

**1. Chat 模式（Ctrl+L）**

```bash
# 打开聊天面板
Ctrl+L (Windows/Linux)
⌘+L (macOS)

# 使用场景：
- 解释代码：选中代码，按 Ctrl+L，输入"解释这段代码"
- 生成代码：描述需求，让 AI 生成
- 调试问题：粘贴错误信息，寻求解决方案
- 代码审查：让 AI 检查代码质量

# 示例对话：
你: "解释 Vue3 的 ref 和 reactive 的区别"
AI: [详细解释]

你: "创建一个 Vue3 用户登录表单组件"
AI: [生成完整组件代码]
```

**2. Composer 模式（Ctrl+I）**

```bash
# 打开 Composer（项目级 AI）
Ctrl+I (Windows/Linux)
⌘+I (macOS)

# Composer 特点：
- 可以同时编辑多个文件
- 理解整个项目结构
- 执行复杂的多步骤任务

# 使用示例：
你: "重构用户认证模块，改用 JWT"
AI: [分析项目 → 修改多个文件 → 测试]

你: "添加 TypeScript 类型定义到整个项目"
AI: [扫描所有文件 → 添加类型 → 修复错误]
```

**3. 快速编辑（Ctrl+K）**

```bash
# 快速编辑选中代码
Ctrl+K (Windows/Linux)
⌘+K (macOS)

# 使用步骤：
1. 选中要修改的代码
2. 按 Ctrl+K
3. 输入修改指令
4. 按 Enter 应用修改

# 示例：
# 选中函数 → Ctrl+K → "添加错误处理"
# 选中组件 → Ctrl+K → "改为使用组合式 API"
# 选中样式 → Ctrl+K → "添加响应式设计"
```

**快捷键完整列表**

```bash
# AI 功能
Ctrl+L        # 打开 Chat 面板
Ctrl+I        # 打开 Composer
Ctrl+K        # 快速编辑选中代码
Ctrl+Shift+K  # 在上方插入代码
Tab           # 接受 AI 建议
Esc           # 拒绝 AI 建议

# 导航
Ctrl+P        # 快速打开文件
Ctrl+Shift+P  # 命令面板
Ctrl+B        # 切换侧边栏

# 编辑
Ctrl+/        # 切换注释
Ctrl+D        # 选择下一个相同单词
Alt+↑/↓       # 移动行
```

**模型配置**

```json
// Settings → AI Models → Edit config.json
{
  "models": {
    "provider": "openai",
    "model": "gpt-4o",
    "apiKey": "sk-xxxxxxxx",
    "apiBase": "https://api.openai.com/v1"
  },

  // 多模型配置
  "modelProviders": [
    {
      "name": "OpenAI",
      "provider": "openai",
      "models": ["gpt-4o", "gpt-4o-mini"],
      "apiKey": "sk-xxxxxxxx"
    },
    {
      "name": "Anthropic",
      "provider": "anthropic",
      "models": ["claude-3-5-sonnet-20241022"],
      "apiKey": "sk-ant-xxxxxxxx"
    },
    {
      "name": "DeepSeek",
      "provider": "openai",
      "models": ["deepseek-chat"],
      "apiBase": "https://api.deepseek.com/v1",
      "apiKey": "sk-xxxxxxxx"
    }
  ]
}
```

**最佳实践**

```javascript
// 1. 清晰的上下文描述
// 选中代码前，先说明背景
"这是一个 Vue3 项目的用户服务模块"

// 2. 分步骤的复杂任务
// 不要：重写整个应用
// 而是：
"步骤1：先重构数据获取逻辑"
"步骤2：再优化组件结构"
"步骤3：最后添加错误处理"

// 3. 利用代码库上下文
// Composer 模式下，Cursor 理解整个项目
"参考 src/components/Button.vue 的样式，创建一个 IconButton 组件"

// 4. 迭代式优化
"第一个版本：实现基础功能"
"第二个版本：添加 TypeScript 类型"
"第三个版本：优化性能"
```

**与 VSCode 的兼容性**

```bash
# Cursor 完全兼容 VSCode：

✅ 所有 VSCode 扩展都可用
✅ VSCode 主题和设置可导入
✅ VSCode 快捷键可自定义
✅ Git 集成完全相同

# 导入 VSCode 设置
# File → Import → VSCode Settings
```

**Cursor Pro 订阅**

```bash
# 免费版限制：
- 每天 50 次 AI 聊天
- Composer 模式受限
- 只能使用基础模型

# Pro 订阅（$20/月）：
✅ 无限 AI 聊天
✅ 完整 Composer 功能
✅ 最先进的 AI 模型
✅ 优先支持

# Business 订阅（$20/用户/月）：
✅ 所有 Pro 功能
✅ 团队管理
✅ 审计日志
✅ SSO 单点登录
```

**常见问题**

```bash
# 问题 1：Cursor 响应慢
# 解决：
1. 检查网络连接
2. 切换到更快的模型（如 gpt-4o-mini）
3. 减少上下文大小

# 问题 2：AI 建议质量不高
# 解决：
1. 提供更清晰的上下文
2. 明确说明需求和约束
3. 使用更强大的模型

# 问题 3：无法使用某些 VSCode 扩展
# 解决：
1. 检查扩展兼容性
2. 联系 Cursor 支持
3. 大部分扩展是兼容的

# 问题 4：Composer 模式修改太多文件
# 解决：
1. 使用 Composer 的 "Review" 功能预览
2. 分步骤执行
3. 使用 Git 版本控制，方便回滚
```

**高级技巧**

```bash
# 1. 自定义 AI 提示词
# Settings → Custom Prompts
# 创建常用提示词模板

# 2. 使用 @ 符号引用文件
# 在 Chat 中：
"参考 @src/utils/auth.ts 的格式，创建一个 refresh.ts"

# 3. 代码审查模式
# 选中整个项目文件夹 → Ctrl+I
"进行代码审查，找出潜在问题"

# 4. 文档生成
# 选中组件 → Ctrl+K
"生成 JSDoc 文档注释"

# 5. 测试生成
# 选中函数 → Ctrl+L
"为这个函数生成单元测试"
```

**国内用户配置**

```json
// 使用 DeepSeek 等国内 API
{
  "models": {
    "provider": "openai",
    "model": "deepseek-chat",
    "apiBase": "https://api.deepseek.com/v1",
    "apiKey": "sk-xxxxxxxx"
  }
}

// 或使用中转 API
{
  "models": {
    "provider": "openai",
    "model": "gpt-4o",
    "apiBase": "https://your-proxy.com/v1",
    "apiKey": "your-api-key"
  }
}
```

---

### Continue 安装与配置完全指南

**Continue** 是一个开源的 AI 结对编程助手，深度集成 VS Code，完全免费。

**系统要求**

```bash
- VS Code 1.80+ 或 VS Code Insiders
- Node.js 18+ (可选，用于某些功能)
- AI 模型的 API Key (Claude、OpenAI、DeepSeek 等)
```

**安装方式一：VS Code 扩展市场（推荐）**

```bash
# 1. 打开 VS Code
# 2. 点击左侧扩展图标（或 Ctrl+Shift+X）
# 3. 搜索 "Continue"
# 4. 点击 Install 安装
# 5. 安装完成后重启 VS Code
```

**安装方式二：命令行安装**

```bash
# 使用 code 命令安装
code --install-extension Continue.continue

# 验证安装
code --list-extensions | grep continue
```

**配置 AI 模型**

```bash
# 1. 打开 Continue 设置
# Ctrl+Shift+P → 输入 "Continue: Settings"

# 2. 配置 API Key
# 支持的模型：
✅ Claude (Anthropic)
✅ OpenAI (GPT-4, GPT-3.5)
✅ DeepSeek (性价比高)
✅ Gemini (Google)
✅ 本地模型 (Ollama)

# 配置示例：
{
  "models": [{
    "title": "Claude 3.5 Sonnet",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "apiKey": "sk-ant-xxxxxxxx"
  }, {
    "title": "DeepSeek V3",
    "provider": "openai",
    "model": "deepseek-chat",
    "apiBase": "https://api.deepseek.com/v1",
    "apiKey": "sk-xxxxxxxx"
  }]
}
```

**核心功能使用**

```bash
# 1. 代码补全（自动）
# Continue 会根据上下文自动建议代码
# 按 Tab 接受建议
# 按 Esc 忽略建议

# 2. AI 聊天 (Ctrl+Shift+A)
# 打开聊天面板，与 AI 对话
# 可以：
- 解释代码
- 生成代码
- 修复 Bug
- 优化代码
- 添加测试
- 代码审查

# 3. 快速编辑 (Ctrl+Shift+A)
# 选中代码，在聊天中输入修改指令
# 示例：
"重构这段代码，使其更高效"
"为这个函数添加错误处理"
"用 TypeScript 重写这个函数"

# 4. 代码库上下文
# Continue 会自动理解整个代码库
# 支持引用文件："参考 @src/utils/auth.ts"
# 支持引用项目："了解整个项目结构"
```

**快捷键**

```bash
# 主要功能
Ctrl+Shift+A        # 打开/关闭 Continue 侧边栏
Ctrl+Enter          # 在编辑器中快速提问
Cmd+Shift+A (Mac)   # 打开/关闭 Continue 侧边栏

# 代码补全
Tab                 # 接受建议
Esc                 # 忽略建议
Alt+]               # 下一个建议
Alt+[               # 上一个建议

# 导航
Ctrl+P              # 快速打开文件
```

**高级配置**

```json
// VS Code settings.json
{
  // Continue 自定义设置
  "continue.enableTabAutocomplete": true,
  "continue.autocompleteDelay": 100,
  "continue.enableAutoScroll": true,
  "continue.sidebarLocation": "right",

  // 配置提示词模板
  "continue.systemPrompt": "你是一个专业的 Vue3 开发工程师...",

  // 配置代码库上下文
  "continue.contextProviders": [
    "open", "cursor", "search", "diff"
  ],

  // 配置自动接受建议
  "continue.tabAutocompleteModel": "claude-3-5-sonnet-20241022"
}
```

**最佳实践**

```javascript
// 1. 使用清晰的注释引导
// 创建一个防抖函数，延迟 500ms，用于搜索输入框
function debounceSearch() {
  // Continue 会根据注释生成完整代码
}

// 2. 提供类型定义
interface User {
  id: number;
  name: string;
  email: string;
}

function findUserByEmail(users: User[], email: string): User | null {
  // Continue 会根据类型生成符合逻辑的代码
}

// 3. 使用快速提问
// 选中代码 → Ctrl+Enter → 输入问题
// "优化这段代码的性能"
// "添加错误处理"
// "解释这段代码的作用"
```

**常见问题**

```bash
# 问题 1：Continue 没有自动补全
# 解决：
1. 检查 API Key 是否正确
2. 检查网络连接
3. 检查模型是否支持
4. 调整自动补全延迟时间

# 问题 2：代码建议质量不高
# 解决：
1. 切换到更强大的模型（如 Claude 3.5 Sonnet）
2. 提供更清晰的上下文
3. 使用类型定义引导
4. 添加详细注释

# 问题 3：API 费用过高
# 解决：
1. 使用 DeepSeek（性价比高）
2. 使用 gpt-4o-mini（便宜）
3. 调整上下文大小
4. 使用本地模型（Ollama）
```

**与 Copilot 对比**

| 特性 | Continue | GitHub Copilot |
|------|----------|----------------|
| 价格 | 完全免费（自备 API） | $10/月 |
| 模型选择 | ✅ 灵活（Claude、GPT、DeepSeek） | ❌ 仅 OpenAI 模型 |
| 开源 | ✅ 完全开源 | ❌ 闭源 |
| 可定制性 | ✅ 高度可定制 | ⚠️ 受限 |
| 代码补全质量 | ✅ 优于 Copilot | ✅ 良好 |

**参考链接**

- 官网：https://www.continue.dev/
- GitHub：https://github.com/continuedev/continue
- 文档：https://docs.continue.dev/
- VS Code 市场：https://marketplace.visualstudio.com/items?itemName=Continue.continue

---

### Cline 安装与配置完全指南

**Cline**（前身 Roo Code）是一个功能强大的开源 AI 编程助手，支持自主 Agent 模式。

**系统要求**

```bash
- VS Code 1.80+
- API Key (推荐 DeepSeek 或 Claude)
- Node.js 18+ (可选)
```

**安装方式一：VS Code 扩展市场（推荐）**

```bash
# 1. 打开 VS Code
# 2. 点击左侧扩展图标（或 Ctrl+Shift+X）
# 3. 搜索 "Cline" (不是 Roo Code)
# 4. 点击 Install 安装
# 5. 安装完成后重启 VS Code
```

**安装方式二：命令行安装**

```bash
# 使用 code 命令安装
code --install-extension 'src.unit.m0de'

# 验证安装
code --list-extensions | grep cline
```

**配置 AI 模型**

```bash
# 1. 打开 Cline 设置
# Ctrl+Shift+P → 输入 "Cline: Settings"

# 2. 推荐配置：DeepSeek (性价比高)
{
  "cline.apiKey": "sk-xxxxxxxx",
  "cline.apiProvider": "openai",
  "cline.apiBase": "https://api.deepseek.com/v1",
  "cline.modelId": "deepseek-chat"
}

# 3. 或使用 Claude (质量最高)
{
  "cline.apiKey": "sk-ant-xxxxxxxx",
  "cline.apiProvider": "anthropic",
  "cline.modelId": "claude-3-5-sonnet-20241022"
}

# 4. 或使用 OpenAI
{
  "cline.apiKey": "sk-xxxxxxxx",
  "cline.apiProvider": "openai",
  "cline.modelId": "gpt-4o"
}
```

**核心功能使用**

```bash
# 1. 打开 Cline
# Cmd+Shift+C (Mac)
# Ctrl+Shift+C (Windows/Linux)

# 2. Agent 模式（核心优势）
# Cline 可以自主完成：
✅ 读取文件
✅ 分析代码
✅ 修改代码
✅ 运行命令
✅ 测试功能
✅ 修复错误

# 3. 使用示例
你: "创建一个 Vue3 登录表单组件，包含表单验证"

Cline 会自动：
1. 分析项目结构
2. 创建组件文件
3. 编写组件代码
4. 添加表单验证
5. 创建测试文件
6. 运行测试
7. 修复错误
```

**Agent 模式实战**

```bash
# 示例 1：添加新功能
你: "为项目添加用户认证功能，包括登录和注册"

Cline 执行流程：
1. ✅ 分析现有项目结构
2. ✅ 设计认证架构
3. ✅ 创建登录页面组件
4. ✅ 创建注册页面组件
5. ✅ 实现 API 调用
6. ✅ 添加路由配置
7. ✅ 编写测试
8. ✅ 运行测试验证

# 示例 2：重构代码
你: "重构用户管理模块，改用 TypeScript"

Cline 执行流程：
1. ✅ 分析现有代码
2. ✅ 添加类型定义
3. ✅ 重构组件
4. ✅ 更新 API 调用
5. ✅ 修复类型错误
6. ✅ 运行测试验证

# 示例 3：修复 Bug
你: "用户反馈登录后显示 404 错误，帮我排查"

Cline 执行流程：
1. ✅ 读取路由配置
2. ✅ 检查登录逻辑
3. ✅ 分析代码流程
4. ✅ 找出问题所在
5. ✅ 修复 Bug
6. ✅ 测试验证
```

**快捷键**

```bash
# 主要功能
Cmd+Shift+C (Mac)     # 打开/关闭 Cline
Ctrl+Shift+C (Win/L)  # 打开/关闭 Cline

# 在 Cline 中
Ctrl+Enter            # 发送消息
Ctrl+Shift+Enter      # 换行发送
Ctrl+/                # 查看命令历史

# 文件操作
Ctrl+R                # 重新生成响应
Esc                   # 停止生成
```

**高级配置**

```json
// VS Code settings.json
{
  // Cline 基础配置
  "cline.autoApproval": "ask", // ask, auto, disabled
  "cline.autoApprovalThreshold": 5,
  "cline.maxFileIterations": 5,
  "cline.conservativeMode": false,

  // 上下文配置
  "cline.contextTokens": 8000,
  "cline.includeFiles": true,
  "cline.maxFiles": 100,

  // 命令执行
  "cline.allowedCommands": [
    "npm install",
    "npm run build",
    "npm run test",
    "git status"
  ],

  // MCP 支持
  "cline.mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"]
    }
  }
}
```

**与 Cursor 对比**

| 特性 | Cline | Cursor |
|------|-------|--------|
| 价格 | 完全免费（自备 API） | $20/月 |
| Agent 模式 | ✅ 强大且免费 | ✅ 内置（需付费） |
| VS Code 集成 | ✅ 原生插件 | ❌ 独立编辑器 |
| 模型选择 | ✅ 灵活 | ⚠️ 受限 |
| MCP 支持 | ✅ 原生支持 | ✅ 支持 |
| 终端执行 | ✅ 内置 | ✅ 内置 |

**最佳实践**

```bash
# 1. 明确任务目标
❌ "优化代码"
✅ "优化用户列表组件，添加虚拟滚动，提升渲染性能"

# 2. 提供足够的上下文
✅ "参考 src/components/UserList.vue 的实现方式，
     创建一个 ProductList.vue 组件"

# 3. 分步骤执行复杂任务
✅ "第一步：创建基础组件结构"
✅ "第二步：添加数据获取逻辑"
✅ "第三步：添加错误处理"

# 4. 使用自动审核模式
# 设置 "cline.autoApproval": "ask"
# 每个操作都会询问你，更安全
```

**常见问题**

```bash
# 问题 1：Cline 无法运行命令
# 解决：
1. 检查工作目录是否正确
2. 检查命令是否在 allowedCommands 中
3. 手动执行命令测试

# 问题 2：Agent 陷入循环
# 解决：
1. 按 Esc 停止生成
2. 清空对话历史
3. 重新描述任务，更明确
4. 启用 conservativeMode

# 问题 3：修改太多文件
# 解决：
1. 设置 autoApproval 为 "ask"
2. 降低 maxFileIterations
3. 分步骤执行任务
```

**实际案例**

```bash
# 案例：完整创建一个功能模块
你: "创建一个用户反馈模块，包括：
1. 反馈表单组件
2. 反馈列表页面
3. API 接口对接
4. 表单验证
5. 提交成功提示"

Cline 执行过程：
✅ 步骤 1: 分析项目结构（30秒）
✅ 步骤 2: 创建 FeedbackForm.vue（2分钟）
✅ 步骤 3: 创建 FeedbackList.vue（1分钟）
✅ 步骤 4: 添加 API 调用（1分钟）
✅ 步骤 5: 添加表单验证（1分钟）
✅ 步骤 6: 添加路由配置（30秒）
✅ 步骤 7: 运行 npm run lint（30秒）
✅ 步骤 8: 修复 lint 错误（1分钟）
✅ 步骤 9: 运行 npm run build（1分钟）
✅ 步骤 10: 测试验证（手动）

总计：约 8 分钟完成完整功能模块！
```

**推荐配置方案**

```bash
# 方案 1：预算有限（推荐）
✅ Cline + DeepSeek V3
# 完全免费，性价比极高
# API 费用：$0.028/百万token
# 月成本：约 $2-5

# 方案 2：追求质量
✅ Cline + Claude 3.5 Sonnet
# 代码质量最高
# 月成本：约 $15-20

# 方案 3：平衡方案
✅ Continue + Cline + DeepSeek
# Continue 用于日常补全
# Cline 用于复杂任务
# 月成本：约 $5-10
```

**参考链接**

- VS Code 市场：https://marketplace.visualstudio.com/items?itemName=src.unit.m0de
- GitHub：https://github.com/cline/cline
- 文档：https://cline.dev/
- 教程：https://www.51cto.com/article/805448.html

---

### IDE 集成 AI 助手

#### **VSCode + GitHub Copilot**

```json
// settings.json配置
{
  "github.copilot.enable": {
    "*": true,
    "yaml": false,
    "plaintext": false
  },
  "github.copilot.inlineSuggest.enable": true
}
```

#### **WebStorm + AI Assistant**

```
安装：JetBrains Marketplace搜索 "AI Assistant"

功能：
- 代码生成
- 代码解释
- 重构建议
- 生成单元测试
```

---

### 工具选择建议

| 使用场景       | 推荐工具         | 原因                       |
| -------------- | ---------------- | -------------------------- |
| 日常开发辅助   | GitHub Copilot   | 实时代码补全，效率高       |
| 学习新概念     | Claude/ChatGPT   | 解释清晰，示例丰富         |
| 复杂问题解决   | Claude           | 逻辑推理能力强             |
| 中文用户       | DeepSeek         | 中文理解，免费使用         |
| 终端开发       | OpenCode         | 开源免费，终端场景体验好   |
| 团队协作       | Cursor           | 项目级理解，便于沟通       |

**💡 个人建议组合**：

- 主力：Claude（对话） + GitHub Copilot（代码补全）
- 备用：ChatGPT（快速查询）
- 免费替代：DeepSeek（对话） + OpenCode（终端）

---

### 配置其他模型（OpenAI、Gemini、智谱 GLM、通义千问等）

除了前面介绍的 DeepSeek，国内还有多个优秀的大语言模型可供选择。本节详细介绍如何在 Cursor、OpenCode、Claude Code 等工具中配置这些模型。

### 主流模型 API 速查表

| 模型 | API 地址 | 兼容性 | 特点 |
|------|---------|--------|------|
| **OpenAI GPT-4o** | `https://api.openai.com/v1/chat/completions` | OpenAI | 性能最强，生态完善 |
| **Gemini 2.0** | `https://generativelanguage.googleapis.com/v1beta` | 自有格式 | 免费，速度快 |
| **智谱 GLM-4.7** | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | OpenAI | 免费，推理能力强 |
| **通义千问** | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` | OpenAI | 阿里云，稳定性高 |
| **DeepSeek** | `https://api.deepseek.com/v1/chat/completions` | OpenAI | 免费，性价比高 |
| **月之暗面 Kimi** | `https://api.moonshot.cn/v1/chat/completions` | OpenAI | 长上下文，支持 200K |

---

### 一、智谱 GLM（ChatGLM）配置完全指南

**获取 API Key**

```bash
# 1. 访问智谱 AI 开放平台
https://open.bigmodel.cn/usercenter/apikeys

# 2. 注册/登录账号
# 3. 创建新的 API Key
# 4. 复制保存 API Key（格式：id.secret）
```

**可用模型**

```bash
# GLM-4 系列（最新）
glm-4-plus         # 旗舰模型，综合能力最强
glm-4-air          # 轻量级，速度快
glm-4-flash        # 免费，高频调用场景
glm-4.7            # 最新版本，推荐使用

# GLM-3 系列
glm-3-turbo        # 经济实惠
```

**价格说明（2026年）**

```bash
# GLM-4.7-Flash（免费）
- 完全免费调用
- 适合日常开发使用

# GLM-4-Plus
- 输入: ¥0.50 / 1M tokens
- 输出: ¥1.50 / 1M tokens

# GLM-4-Air
- 输入: ¥0.10 / 1M tokens
- 输出: ¥0.30 / 1M tokens
```

**在 Cursor 中配置智谱 GLM**

```json
// Settings → AI Models → Edit config.json
{
  "models": {
    "provider": "openai",
    "model": "glm-4.7",
    "apiBase": "https://open.bigmodel.cn/api/paas/v4",
    "apiKey": "你的智谱API密钥"
  }
}
```

**在 OpenCode 中配置智谱 GLM**

```bash
# 方法一：使用 /connect 命令
opencode
> /connect
# 选择 "OpenAI Compatible"
# Base URL: https://open.bigmodel.cn/api/paas/v4
# API Key: 你的智谱API密钥
# Model: glm-4.7

# 方法二：环境变量配置
export OPENAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export OPENAI_API_KEY="你的智谱API密钥"
opencode
```

**在 Claude Code 中配置智谱 GLM**

```bash
# 编辑 ~/.claude/settings.json
{
  "apiKey": "你的智谱API密钥",
  "baseUrl": "https://open.bigmodel.cn/api/paas/v4",
  "defaultModel": "glm-4.7"
}

# 或使用环境变量
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export ANTHROPIC_API_KEY="你的智谱API密钥"
```

**JavaScript 调用示例**

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: '你的智谱API密钥',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4'
});

async function chat(message) {
  const response = await client.chat.completions.create({
    model: 'glm-4.7',
    messages: [
      { role: 'system', content: '你是一个 Vue3 专家助手。' },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return response.choices[0].message.content;
}

// 使用
chat('解释 Vue3 的组合式 API')
  .then(answer => console.log(answer));
```

---

### 二、OpenAI GPT 配置完全指南

**获取 API Key**

```bash
# 1. 访问 OpenAI 平台
https://platform.openai.com/api-keys

# 2. 注册/登录账号
# 3. 创建新的 API Key
# 4. 复制保存 API Key（sk-xxxxxxxx）
```

**可用模型**

```bash
# GPT-4 系列（最新）
gpt-4o              # 最新旗舰模型，多模态
gpt-4o-mini         # 轻量版，速度快，成本低
gpt-4-turbo         # GPT-4 Turbo

# GPT-3.5 系列
gpt-3.5-turbo       # 经济实惠，速度快
```

**价格说明（2026年）**

```bash
# GPT-4o
- 输入: $2.50 / 1M tokens（约¥18）
- 输出: $10.00 / 1M tokens（约¥72）

# GPT-4o-mini
- 输入: $0.15 / 1M tokens（约¥1.1）
- 输出: $0.60 / 1M tokens（约¥4.3）

# GPT-3.5-turbo
- 输入: $0.50 / 1M tokens（约¥3.6）
- 输出: $1.50 / 1M tokens（约¥10.8）
```

**在 Cursor 中配置 OpenAI**

```json
// Settings → AI Models → Edit config.json
{
  "models": {
    "provider": "openai",
    "model": "gpt-4o",
    "apiBase": "https://api.openai.com/v1",
    "apiKey": "sk-xxxxxxxx"
  }
}
```

**在 OpenCode 中配置 OpenAI**

```bash
# 使用 /connect 命令
opencode
> /connect
# 选择 "OpenAI"
# API Key: sk-xxxxxxxx
# Model: gpt-4o

# 或环境变量
export OPENAI_API_KEY="sk-xxxxxxxx"
opencode
```

**JavaScript 调用示例**

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-xxxxxxxx',
  baseURL: 'https://api.openai.com/v1'
});

async function chat(message) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: '你是一个 Vue3 专家助手。' },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return response.choices[0].message.content;
}

// 使用
chat('解释 Vue3 的组合式 API')
  .then(answer => console.log(answer));
```

**国内用户配置（使用中转）**

```bash
# 方法一：使用中转 API
export OPENAI_API_KEY="your-proxy-key"
export OPENAI_BASE_URL="https://your-proxy.com/v1"

# 方法二：在配置文件中
{
  "models": {
    "provider": "openai",
    "model": "gpt-4o",
    "apiBase": "https://your-proxy.com/v1",
    "apiKey": "your-api-key"
  }
}
```

---

### 三、Google Gemini 配置完全指南

**获取 API Key**

```bash
# 1. 访问 Google AI Studio
https://aistudio.google.com/app/apikey

# 2. 使用 Google 账号登录
# 3. 创建新的 API Key
# 4. 复制保存 API Key（AIza...）
```

**可用模型**

```bash
# Gemini 2.0 系列（最新）
gemini-2.0-flash-exp       # 免费，快速响应，推荐
gemini-2.0-flash           # 轻量级，高性能
gemini-2.0-pro             # 旗舰模型，综合能力最强
gemini-2.5-pro             # 最新 Pro 版本

# Gemini 1.5 系列
gemini-1.5-pro             # 稳定版本
gemini-1.5-flash           # 快速版本
```

**价格说明（2026年）**

```bash
# Gemini 2.0 Flash（免费）
- 完全免费调用
- 每分钟 15 次请求限制
- 适合日常开发和测试

# Gemini 2.0 Pro
- 输入: 免费
- 输出: 免费（有限额）
- 超出后: 按使用量计费

# Gemini 2.5 Pro
- 新用户有大量免费额度
- 付费: $0.075 / 1M tokens
```

**在 Cursor 中配置 Gemini**

```json
// Settings → AI Models → Edit config.json
{
  "models": {
    "provider": "google",
    "model": "gemini-2.0-flash-exp",
    "apiKey": "AIzaxxxxxxxxxxxxxxxx"
  }
}
```

⚠️ **注意**：Cursor 原生支持 Gemini，只需配置 API Key 即可。

**在 OpenCode 中配置 Gemini**

```bash
# 方法一：使用 /connect 命令
opencode
> /connect
# 选择 "Google Gemini"
# API Key: AIzaxxxxxxxxxxxxxxxx

# 方法二：环境变量
export GOOGLE_API_KEY="AIzaxxxxxxxxxxxxxxxx"
opencode
```

**在 Continue 中配置 Gemini**

```json
// ~/.continue/config.json
{
  "models": [{
    "title": "Gemini 2.0 Flash",
    "provider": "google",
    "model": "gemini-2.0-flash-exp",
    "apiKey": "AIzaxxxxxxxxxxxxxxxx"
  }]
}
```

**JavaScript 调用示例**

```javascript
// 使用官方 SDK
import { GoogleGenerativeAI } from '@google/generative-ai';

// 安装 SDK
// npm install @google/generative-ai

const genAI = new GoogleGenerativeAI('AIzaxxxxxxxxxxxxxxxx');

async function chat(message) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const result = await model.generateContent(message);
  const response = await result.response;
  return response.text();
}

// 使用
chat('解释 Vue3 的组合式 API')
  .then(answer => console.log(answer));
```

**Python 调用示例**

```python
# 安装 SDK
# pip install google-generativeai

import google.generativeai as genai

genai.configure(api_key='AIzaxxxxxxxxxxxxxxxx')

def chat(message):
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content(message)
    return response.text

# 使用
print(chat('解释 Vue3 的组合式 API'))
```

**cURL 调用示例**

```bash
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaxxxxxxxxxxxxxxxx \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts":[{"text":"解释 Vue3 的组合式 API"}]
    }]
  }'
```

**使用 OpenAI 兼容格式**

```javascript
// Gemini 也支持 OpenAI SDK
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'AIzaxxxxxxxxxxxxxxxx',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
});

async function chat(message) {
  const response = await client.chat.completions.create({
    model: 'gemini-2.0-flash-exp',
    messages: [
      { role: 'system', content: '你是一个 Vue3 专家助手。' },
      { role: 'user', content: message }
    ]
  });

  return response.choices[0].message.content;
}
```

**国内用户访问方案**

```bash
# 方案一：使用镜像站
# 参考 https://www.gemini-cn.com 获取最新镜像地址

# 方案二：使用代理
export HTTP_PROXY="http://127.0.0.1:7890"
export HTTPS_PROXY="http://127.0.0.1:7890"

# 方案三：使用中转 API
{
  "models": {
    "provider": "openai",
    "model": "gemini-2.0-flash-exp",
    "apiBase": "https://your-proxy.com/v1",
    "apiKey": "your-api-key"
  }
}
```

**Gemini 特有功能**

```javascript
// 1. 多模态支持（图片+文字）
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

async function analyzeImage(imageBase64, question) {
  const result = await model.generateContent([
    question,
    { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
  ]);
  return result.response.text();
}

// 2. 流式输出
async function streamChat(message) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  const result = await model.generateContentStream(message);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
}

// 3. 多轮对话
const chat = model.startChat({
  history: [
    { role: 'user', parts: '你好，我是 Vue3 开发者' },
    { role: 'model', parts: '你好！有什么我可以帮助你的吗？' }
  ]
});

const result = await chat.sendMessage('如何使用 ref？');
console.log(result.response.text());
```

**常见问题**

```bash
# 问题 1：API Key 无效
# 解决：
1. 确认 API Key 以 "AIza" 开头
2. 检查是否启用了 Gemini API
3. 访问 https://aistudio.google.com/app/apikey 确认

# 问题 2：国内无法访问
# 解决：
1. 使用代理
2. 使用国内镜像站
3. 或使用中转 API 服务

# 问题 3：速率限制
# 解决：
1. 免费版每分钟 15 次请求
2. 添加重试逻辑
3. 升级到付费版本
```

---

### 四、通义千问（阿里云）配置完全指南

**可用模型**

```bash
# Qwen 系列（最新）
qwen-plus          # 旗舰模型，综合能力最强
qwen-turbo         # 高性能，速度快
qwen-long          # 长上下文，支持 30K+
qwen-max           # 超长上下文，支持 200K
```

**价格说明（2026年）**

```bash
# qwen-turbo
- 输入: ¥0.30 / 1M tokens
- 输出: ¥0.60 / 1M tokens

# qwen-plus
- 输入: ¥1.00 / 1M tokens
- 输出: ¥2.00 / 1M tokens

# qwen-long
- 输入: ¥0.50 / 1M tokens
- 输出: ¥1.00 / 1M tokens
```

**在 Cursor 中配置通义千问**

```json
// Settings → AI Models → Edit config.json
{
  "models": {
    "provider": "openai",
    "model": "qwen-plus",
    "apiBase": "https://dashscope.aliyuncs.com/compatible-mode/v1",
    "apiKey": "sk-xxxxxxxx"
  }
}
```

**在 OpenCode 中配置通义千问**

```bash
# 使用 /connect 命令
opencode
> /connect
# 选择 "OpenAI Compatible"
# Base URL: https://dashscope.aliyuncs.com/compatible-mode/v1
# API Key: sk-xxxxxxxx
# Model: qwen-plus

# 或环境变量
export OPENAI_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
export OPENAI_API_KEY="sk-xxxxxxxx"
```

**JavaScript 调用示例**

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-xxxxxxxx',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

async function chat(message) {
  const response = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [
      { role: 'system', content: '你是一个 Vue3 专家助手。' },
      { role: 'user', content: message }
    ]
  });

  return response.choices[0].message.content;
}
```

---

### 五、月之暗面 Kimi 配置完全指南

**获取 API Key**

```bash
# 1. 访问 Moonshot 开放平台
https://platform.moonshot.cn/console/api-keys

# 2. 注册/登录账号
# 3. 创建 API Key
```

**可用模型**

```bash
# Moonshot 系列
moonshot-v1-8k     # 8K 上下文
moonshot-v1-32k    # 32K 上下文
moonshot-v1-128k   # 128K 上下文
```

**价格说明**

```bash
# moonshot-v1-8k
- 输入: ¥12.00 / 1M tokens
- 输出: ¥12.00 / 1M tokens

# moonshot-v1-32k
- 输入: ¥24.00 / 1M tokens
- 输出: ¥24.00 / 1M tokens

# 新用户有免费额度
```

**在 Cursor 中配置 Kimi**

```json
{
  "models": {
    "provider": "openai",
    "model": "moonshot-v1-8k",
    "apiBase": "https://api.moonshot.cn/v1",
    "apiKey": "sk-xxxxxxxx"
  }
}
```

---

### 六、VSCode Continue 插件配置（支持所有模型）

**安装 Continue**

```bash
# 1. VSCode 扩展商店搜索 "Continue"
# 2. 点击安装
```

**配置文件位置**

```bash
# 配置文件路径：
~/.continue/config.json

# Windows:
C:\Users\你的用户名\.continue\config.json

# macOS/Linux:
~/.continue/config.json
```

**配置多个模型**

```json
{
  "models": [
    {
      "title": "DeepSeek",
      "provider": "openai",
      "model": "deepseek-chat",
      "apiBase": "https://api.deepseek.com/v1",
      "apiKey": "sk-xxxxxxxx"
    },
    {
      "title": "智谱 GLM",
      "provider": "openai",
      "model": "glm-4.7",
      "apiBase": "https://open.bigmodel.cn/api/paas/v4",
      "apiKey": "你的智谱API密钥"
    },
    {
      "title": "通义千问",
      "provider": "openai",
      "model": "qwen-plus",
      "apiBase": "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "apiKey": "sk-xxxxxxxx"
    },
    {
      "title": "Kimi",
      "provider": "openai",
      "model": "moonshot-v1-8k",
      "apiBase": "https://api.moonshot.cn/v1",
      "apiKey": "sk-xxxxxxxx"
    }
  ],

  // 设置默认模型
  "defaultModel": "DeepSeek"
}
```

**使用 Continue**

```bash
# 快捷键
Ctrl+Shift+L        # 打开 Continue 侧边栏
Ctrl+Enter          # 在编辑器中询问

# 使用方法
1. 选中代码
2. 按 Ctrl+Shift+L 打开 Continue
3. 输入问题或命令
4. AI 会结合上下文回答
```

---

### 七、使用中转 API 服务

如果不想单独申请每个模型的 API Key，可以使用中转服务统一管理。

**OpenRouter（推荐）**

```bash
# 1. 访问 OpenRouter
https://openrouter.ai/

# 2. 申请 API Key
# 3. 支持多种模型，统一计费

# 配置示例（Cursor）
{
  "models": {
    "provider": "openai",
    "model": "anthropic/claude-3.5-sonnet",  # 或其他模型
    "apiBase": "https://openrouter.ai/api/v1",
    "apiKey": "sk-or-xxxxxxxx"
  }
}
```

**国内中转服务**

```bash
# 一些国内提供的中转服务：
# 1. API2D: https://api2d.com
# 2. new-api: https://new-api.dev
# 3. GPT API: https://gptapi.us

# 配置示例
{
  "models": {
    "provider": "openai",
    "model": "gpt-4o",
    "apiBase": "https://your-proxy.com/v1",
    "apiKey": "your-api-key"
  }
}
```

---

### 八、模型选择建议

**根据场景选择**

```bash
# 1. 免费开发
推荐：DeepSeek、智谱 GLM-4-Flash
- 完全免费
- 能力足够日常开发

# 2. 中文场景
推荐：通义千问、DeepSeek、智谱 GLM
- 中文理解能力强
- 符合国内使用习惯

# 3. 长文本处理
推荐：Kimi（200K）、通义千问（30K+）
- 支持超长上下文
- 适合分析大型项目

# 4. 代码生成
推荐：DeepSeek-Coder、智谱 GLM-4
- 代码能力强
- 理解复杂逻辑

# 5. 性价比
推荐：DeepSeek、智谱 GLM-4-Air
- 价格低
- 性能好
```

**成本对比（2026年）**

```bash
# 每 1M tokens 成本（输出价格）

# 完全免费
Gemini 2.0 Flash: 免费  ⭐⭐⭐⭐⭐
GLM-4-Flash: 免费       ⭐⭐⭐⭐⭐

# 超高性价比
DeepSeek: ¥2.00        ⭐⭐⭐⭐⭐
GLM-4-Air: ¥0.30        ⭐⭐⭐⭐

# 性价比高
qwen-turbo: ¥0.60      ⭐⭐⭐⭐
GPT-4o-mini: $0.60 (约¥4.3)  ⭐⭐⭐⭐

# 中等价格
qwen-plus: ¥2.00       ⭐⭐⭐
GLM-4-Plus: ¥1.50      ⭐⭐⭐
Gemini 2.0 Pro: 免费（有限额） ⭐⭐⭐

# 较贵
Kimi: ¥12.00           ⭐⭐
GPT-4o: $10.00 (约¥72) ⭐
```

---

### 九、常见问题与解决方案

**问题 1：API 调用 401 错误**

```bash
# 原因：API Key 错误或过期
# 解决：
1. 检查 API Key 是否正确复制
2. 确认 API Key 未过期
3. 重新生成 API Key
```

**问题 2：API 调用 404 错误**

```bash
# 原因：API 地址不正确
# 解决：
1. 确认 API 地址是否包含 /chat/completions
2. 检查 base URL 配置
3. 参考官方文档确认正确地址
```

**问题 3：速率限制**

```bash
# 原因：超过 API 调用频率限制
# 解决：
1. 添加重试逻辑
2. 降低请求频率
3. 升级到付费版本
```

**重试逻辑示例**

```javascript
async function chatWithRetry(message, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await chat(message);
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000;  // 指数退避
        console.log(`速率限制，${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
}
```

---

## MCP 协议配置与使用

**MCP（Model Context Protocol）** 是由 Anthropic（Claude 的公司）推出的开放协议，用于连接 AI 应用程序和外部数据源，打破 AI 的"孤岛"效应。

### 什么是 MCP？

```markdown
传统 AI 工具的局限性：
❌ AI 无法访问本地文件系统
❌ AI 无法连接数据库
❌ AI 无法调用外部 API
❌ AI 无法读取项目文档

MCP 解决的问题：
✅ 让 AI 访问本地文件和目录
✅ 让 AI 连接数据库读取数据
✅ 让 AI 调用外部 API 服务
✅ 让 AI 理解项目完整上下文
✅ 让多个 AI 工具协同工作
```

**MCP 工作原理**

```
┌─────────────┐
│  AI 工具     │ (Claude Code / Cursor / Continue)
└──────┬──────┘
       │ MCP 协议
       ↓
┌─────────────────────────────────┐
│         MCP 服务器               │
├─────────────────────────────────┤
│ • 文件系统服务器                │
│ • 数据库服务器                  │
│ • Git 服务器                    │
│ • API 服务器                    │
│ • 自定义服务器                  │
└─────────────────────────────────┘
       ↓
┌─────────────┐
│  外部资源    │ (文件 / 数据库 / API)
└─────────────┘
```

**支持的 AI 工具**

- ✅ Claude Code (原生支持)
- ✅ Cursor (支持 MCP)
- ✅ Continue (支持 MCP)
- ✅ Cline (支持 MCP)
- ⚠️ OpenCode (计划支持)

### MCP 服务器安装与配置

#### **1. 文件系统服务器（最常用）**

```bash
# 安装文件系统 MCP 服务器
npm install -g @modelcontextprotocol/server-filesystem

# 或使用 npx（推荐）
npx @modelcontextprotocol/server-filesystem /path/to/project

# 配置 Claude Code 使用 MCP
# 编辑 Claude Code 配置文件
# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
# Windows: %APPDATA%/Claude/claude_desktop_config.json
```

**配置示例**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/projects",
        "/Users/username/Documents"
      ]
    }
  }
}
```

**使用示例**

```bash
# 在 Claude Code 中使用
你: "读取 src/components/Header.vue 文件"
AI: [成功读取文件内容]

你: "列出项目所有的 Vue 组件"
AI: [扫描项目，列出所有 .vue 文件]

你: "分析 src/utils 目录下的所有工具函数"
AI: [读取并分析工具函数]
```

#### **2. Git 服务器**

```bash
# 安装 Git MCP 服务器
npm install -g @modelcontextprotocol/server-git

# 配置
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "/path/to/repo"]
    }
  }
}
```

**使用示例**

```bash
# 在 Claude Code 中使用
你: "查看最近 5 条 Git 提交记录"
AI: [显示提交历史]

你: "分析当前分支的修改内容"
AI: [分析 git diff 结果]

你: "创建一个新分支 feature/user-auth"
AI: [执行 git checkout -b 命令]
```

#### **3. 数据库服务器**

```bash
# 安装 PostgreSQL MCP 服务器
npm install -g @modelcontextprotocol/server-postgres

# 配置
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:password@localhost:5432/mydb"
      ]
    }
  }
}
```

**使用示例**

```bash
# 在 Claude Code 中使用
你: "查询 users 表的所有数据"
AI: [执行 SELECT * FROM users]

you: "分析用户表的数据结构"
AI: [执行查询并分析表结构]

you: "统计每个用户的订单数量"
AI: [执行 SQL 聚合查询]
```

#### **4. 搜索服务器**

```bash
# 安装搜索 MCP 服务器
npm install -g @modelcontextprotocol/server-brave-search

# 配置（需要 Brave API Key）
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-brave-search"
      ],
      "env": {
        "BRAVE_API_KEY": "your-api-key"
      }
    }
  }
}
```

**使用示例**

```bash
# 在 Claude Code 中使用
you: "搜索 Vue3 最新的版本更新日志"
AI: [使用 Brave 搜索并总结结果]

you: "查找 TypeScript 5.0 的新特性"
AI: [搜索并整理新特性列表]
```

### MCP 在 Cursor 中的配置

```bash
# Cursor → Settings → AI Models → MCP Servers

# 添加文件系统服务器
{
  "name": "filesystem",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"]
}

# 添加 Git 服务器
{
  "name": "git",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "."]
}
```

### MCP 在 Cline 中的配置

```json
// VS Code settings.json
{
  "cline.mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"]
    }
  }
}
```

### MCP 实战案例

#### **案例 1：AI 辅助代码重构**

```bash
# 没有 MCP 的情况
you: "重构用户认证模块"
AI: "请提供相关代码..."
you: [手动粘贴多个文件]

# 有 MCP 的情况
you: "重构用户认证模块"
AI: [自动读取相关文件]
   [分析现有代码]
   [生成重构方案]
   [修改文件]
   [运行测试]
```

#### **案例 2：AI + 数据库**

```bash
# 传统方式
you: "生成一个查询用户的 SQL"
AI: "请提供表结构..."
you: [手动描述表结构]

# MCP 方式
you: "查询所有激活的用户"
AI: [自动读取表结构]
   [生成正确的 SQL]
   [执行查询]
   [返回结果]
```

#### **案例 3：AI + Git**

```bash
# 传统方式
you: "分析最近的代码变更"
you: [手动执行 git log]
you: [手动执行 git diff]
you: [粘贴给 AI]

# MCP 方式
you: "分析最近的代码变更"
AI: [自动读取 Git 日志]
   [读取 diff]
   [分析变更内容]
   [提供详细报告]
```

### MCP 安全注意事项

```bash
# ⚠️ 安全风险
1. AI 可以访问敏感文件
2. AI 可以执行数据库操作
3. AI 可以执行 Git 命令

# ✅ 安全措施
1. 限制 MCP 服务器访问的路径
2. 使用只读数据库账号
3. 审查 AI 的操作
4. 定期审查 MCP 配置
```

### MCP 最佳实践

```bash
# 1. 最小化权限原则
# 只给 AI 访问必要的目录和文件

# 2. 使用只读模式
# 数据库使用只读账号，避免误操作

# 3. 定期审计
# 定期检查 MCP 配置和访问日志

# 4. 分层配置
# 开发环境：完整访问权限
# 生产环境：只读权限

# 5. 版本控制
# 将 MCP 配置纳入版本控制
```

### MCP 常见问题

```bash
# 问题 1：MCP 服务器无法启动
# 解决：
1. 检查 Node.js 版本（需要 18+）
2. 检查网络连接
3. 使用 npx 而不是全局安装

# 问题 2：AI 无法访问文件
# 解决：
1. 检查路径配置是否正确
2. 检查文件权限
3. 查看日志确认错误

# 问题 3：性能问题
# 解决：
1. 限制访问的文件数量
2. 使用 .gitignore 排除不必要的文件
3. 调整上下文窗口大小
```

### MCP 参考资源

**官方资源**：
- [MCP 官方文档](https://modelcontextprotocol.io/)
- [MCP GitHub 仓库](https://github.com/modelcontextprotocol)
- [Claude MCP 指南](https://docs.anthropic.com/en/docs/build-with-claude/mcp)

**教程**：
- [模型上下文协议（MCP）：AI应用与外部数据集成的新标准](https://modelcontextprotocol.info/zh-cn/blog/mcp-guide/)
- [MCP模型上下文协议深度剖析：2025年AI工具开发的新范式](https://cloud.tencent.com/developer/article/2586968)

**MCP 服务器列表**：
- [文件系统服务器](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [Git 服务器](https://github.com/modelcontextprotocol/servers/tree/main/src/git)
- [PostgreSQL 服务器](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)
- [Brave Search 服务器](https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search)

---

## ✅ 本章检查清单

完成本章学习后，请确认你能够：

- [ ] 了解至少 3 种主流 AI 编程工具的特点
- [ ] 成功安装并配置至少一种 AI 工具
- [ ] 配置 API Key 并成功调用 AI 模型
- [ ] 在 Cursor、OpenCode 或 Claude Code 中配置自定义模型
- [ ] 理解不同模型的定价和成本
- [ ] 能够根据场景选择合适的 AI 模型

---

## 🔗 相关章节推荐

学完本章后，你可以继续学习：

**必读章节**：
- 📚 [第1章：AI 应用基础入门](chapter-01) - 学习 AI 应用开发基础
- 🎯 [第2章：LangChain 框架入门](chapter-02) - 掌握 LangChain 框架

**进阶章节**：
- 🔍 [第3章：Prompt Engineering](chapter-03) - 掌握提示词设计技巧
- 🤖 [第5章：AI Agent 智能体](chapter-05) - 开发工具调用 Agent

---

## 💡 学习提示

1. **边学边做**：每个工具都要亲自安装配置
2. **记录笔记**：写下遇到的问题和解决方案
3. **大胆实验**：尝试不同的模型和配置
4. **控制成本**：优先使用免费模型和有额度的模型

---

## 📚 延伸阅读

**推荐资源**：
- [Claude 官方文档](https://docs.anthropic.com/) - Claude API 详细说明
- [OpenAI 官方文档](https://platform.openai.com/docs) - OpenAI API 详细说明
- [DeepSeek 开放平台](https://platform.deepseek.com/) - DeepSeek API 文档
- [Cursor 官方网站](https://cursor.sh/) - Cursor 编辑器
- [OpenCode 官方网站](https://opencode.ac.cn/) - OpenCode 工具

**社区和论坛**：
- [Learn Prompting](https://learnprompting.org/) - 提示词学习资源
- [AI 工具评测](https://www.aitool.io/) - AI 工具对比和评测
