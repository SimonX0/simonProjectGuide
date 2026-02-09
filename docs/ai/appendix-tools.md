# 附录：AI开发工具速查手册

> **2026年AI技术栈**
>
> 本附录提供AI开发者必备的工具速查：
> - OpenAI API命令
> - Claude API命令
> - LangChain CLI
> - Ollama本地模型
> - Prompt工程快捷键

## 附录A：OpenAI API命令

### 🔑 API密钥配置

```bash
# 设置环境变量
export OPENAI_API_KEY="sk-proj-xxx"

# Windows PowerShell
$env:OPENAI_API_KEY="sk-proj-xxx"

# 或使用.env文件
OPENAI_API_KEY=sk-proj-xxx
```

### 📝 OpenAI CLI

```bash
# 安装OpenAI CLI
pip install --upgrade openai

# 查看模型列表
openai api models.list

# 聊天（交互式）
openai chat

# 发送单条消息
openai api chat.completions.create -m gpt-4 -g "user" "Hello"

# 流式输出
openai api chat.completions.create -m gpt-4 -g "user" "Hello" --stream

# 使用系统提示
openai api chat.completions.create \
  -m gpt-4 \
  -g "user" \
  -p "You are a helpful assistant." \
  "Hello, how are you?"

# 设置温度参数
openai api chat.completions.create \
  -m gpt-4 \
  --temperature 0.7 \
  "Be creative!"

# 设置最大Token数
openai api chat.completions.create \
  -m gpt-4 \
  --max-tokens 1000 \
  "Summarize this article"
```

### 🎨 GPT模型命令

| 模型 | 命令 | 说明 |
|------|------|------|
| **GPT-4 Turbo** | `gpt-4-turbo` | 最新最快模型 |
| **GPT-4** | `gpt-4` | 最强模型 |
| **GPT-3.5** | `gpt-3.5-turbo` | 高性价比 |
| **GPT-4 Vision** | `gpt-4-vision-preview` | 图像理解 |

### 🖼️ 图像生成（DALL·E）

```bash
# 生成图像
openai api images.generate \
  --prompt "A futuristic city with flying cars" \
  --size 1024x1024 \
  --n 1

# 创建图像变体
openai api images.createVariation \
  --image "url-to-image" \
  --n 2

# 编辑图像
openai api images.edit \
  --image "url-to-image" \
  --prompt "add a red car"
```

---

## 附录B：Claude API命令

### 🔑 Anthropic API配置

```bash
# 设置API密钥
export ANTHROPIC_API_KEY="sk-ant-xxx"

# 安装Claude CLI
pip install anthropic

# 使用Claude 3.5 Sonnet
claude message "Hello, Claude!"
```

### 📝 Claude命令

```bash
# 流式对话
claude message --stream "Write a Python function"

# 指定模型
claude message -m claude-3-5-sonnet-20241022 "Hello"

# 设置最大Token
claude message --max-tokens 1000 "Summarize"

# 设置温度
claude message --temperature 0.7 "Be creative"
```

### 🎨 Claude模型对比

| 模型 | Token限制 | 特性 |
|------|----------|------|
| **Claude 3.5 Sonnet** | 200k | 最新最强，Vision支持 |
| **Claude 3 Opus** | 200k | 复杂推理最强 |
| **Claude 3 Haiku** | 200k | 快速轻量 |
| **Claude 3 Sonnet** | 200k | 高性价比 |

---

## 附录C：LangChain CLI

### 🔧 安装和初始化

```bash
# 安装LangChain
pip install langchain

# 安装LangChain CLI
pip install langchain-cli

# 初始化LangChain项目
langchain app new my-app

# 添加组件
langchain app add component
```

### 📦 LangChain命令

```bash
# 创建新应用
langchain app new

# 运行应用
langchain app serve

# 添加集成
langchain app integrate

# 查看日志
langchain app logs

# 部署应用
langchain app deploy
```

---

## 附录D：Ollama本地模型

### 🦙 Ollama安装

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# 启动Ollama服务
ollama serve

# 下载模型
ollama pull llama2
ollama pull mistral
ollama pull codellama
```

### 🎯 Ollama命令

```bash
# 运行模型
ollama run llama2

# 聊天模式
ollama run mistral "你好"

# 流式输出
ollama run llama2 "Tell me a joke" --stream

# 查看模型列表
ollama list

# 删除模型
ollama rm llama2

# 创建模型快照
ollama cp llama2 my-llama2
```

### 🌐 Ollama API

```bash
# 启动API服务
ollama serve

# 生成文本
curl http://localhost:11434/api/generate -d "{
  \"model\": \"llama2\",
  \"prompt\": \"Hello, how are you?\"
}"

# 聊天
curl http://localhost:11434api/chat -d "{
  \"model\": \"llama2\",
  \"messages\": [
    {\"role\": \"user\", \"content\": \"Hello!\"}
  ]
}"
```

---

## 附录E：Prompt工程快捷键

### ⚡ 常用Prompt模板

```markdown
## 1. 角色设定
```
你是一位经验丰富的[角色名称]，擅长[核心能力]。
请用[语气风格]回答问题。
```

## 2. 任务分解
```
请将以下任务分解为具体步骤：
1. 第一步要做什么
2. 第二步要做什么
...
```

## 3. 代码生成
```
请使用[编程语言]实现以下功能：
[需求描述]

要求：
- 代码格式规范
- 添加必要注释
- 处理边界情况
```

## 4. 代码审查
```
请审查以下代码，并提供改进建议：
[code]

重点关注：
- 代码质量
- 性能优化
- 安全问题
- 可读性
```

## 5. 技术文档
```
请为以下技术栈编写[文档类型]：
[技术内容]

要求：
- 结构清晰
- 示例完整
- 通俗易懂
```

## 6. Bug调试
```
遇到以下错误：
[错误信息]

代码：
[code]

请分析可能原因和解决方案。
```

## 7. 代码重构
```
请重构以下代码，提升[优化目标]：
[code]

保持现有功能不变。
```
```

### 🎯 AI提示词快捷键

编辑器扩展推荐：
- **Cursor** - AI代码编辑器
- **Copilot** - GitHub AI助手
- **Codeium** - 免费AI补全

| 功能 | 快捷键 | 工具 |
|------|--------|------|
| **AI补全** | `Tab` | Copilot |
| **AI解释** | `Ctrl+Shift+A` | Cursor |
| **AI重构** | `Ctrl+Shift+R` | Cursor |
| **AI测试** | `Ctrl+Shift+T` | Cursor |

---

## 附录F：AI平台命令速查

### 🤖 Hugging Face

```bash
# 安装transformers
pip install transformers

# 下载模型
huggingface-cli download gpt2

# 运行模型
python -c "from transformers import pipeline;
pipe = pipeline('text-generation', model='gpt2');
print(pipe('Hello world'))"
```

### 🦙 Replicate（本地LLM）

```bash
# 下载模型
ollama pull llama2:7b

# 运行聊天
ollama run llama2:7b

# API服务
ollama serve
```

---

## 附录G：AI调试技巧

### 🔍 Prompt调试

```markdown
**问题1：回答质量差**

解决方案：
- 提供具体示例
- 明确输出格式
- 添加约束条件

示例：
"请用JSON格式返回，包含name、email、age三个字段"
```

**问题2：回答不准确**

解决方案：
- 提供更多上下文
- 分步骤提问
- 要求解释推理过程

示例：
"请一步一步思考，然后给出最终答案"
```

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com
