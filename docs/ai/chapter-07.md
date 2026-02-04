# 第7章：AI应用进阶

## 本章导读

恭喜你进入进阶学习！本章将介绍AI应用开发的前沿技术和高级主题，帮助你构建更强大、更专业的AI应用。

**学习目标**：
- 了解主流LLM模型的特点和选择策略
- 掌握Claude等其他模型API的使用
- 学习MCP协议和LangGraph框架
- 掌握AI应用的评估和测试方法

**预计学习时间**：80分钟

---

## 7.1 主流LLM模型对比

### 7.1.1 模型全景图

```
┌─────────────────────────────────────────────────────┐
│            大语言模型生态全景                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔵 闭源商业模型                                     │
│  ├── GPT-4 / GPT-4 Turbo (OpenAI)                  │
│  ├── Claude 3 Opus/Sonnet (Anthropic)              │
│  └── Gemini Pro (Google)                           │
│                                                     │
│  🟢 开源模型                                        │
│  ├── Llama 3 (Meta)                                │
│  ├── Mistral (Mistral AI)                          │
│  ├── Qwen (阿里)                                   │
│  ├── Yi (零一万物)                                 │
│  └── DeepSeek (深度求索)                           │
│                                                     │
│  🟡 本地部署                                        │
│  ├── Ollama                                        │
│  ├── LocalAI                                       │
│  └── vLLM                                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 7.1.2 主流模型详细对比

| 模型 | 开发者 | 上下文 | 优势 | 劣势 | 价格 | 最适合场景 |
|------|--------|--------|------|------|------|-----------|
| **GPT-4 Turbo** | OpenAI | 128K | 综合能力最强 | 输出慢 | $$$ | 复杂任务、代码 |
| **GPT-3.5 Turbo** | OpenAI | 16K | 速度快、便宜 | 能力较弱 | $ | 简单任务、聊天 |
| **Claude 3 Opus** | Anthropic | 200K | 长文本、分析 | 价格高 | $$$$ | 长文档分析 |
| **Claude 3 Sonnet** | Anthropic | 200K | 平衡性好 | 中文略弱 | $$$ | 通用场景 |
| **Llama 3 70B** | Meta | 8K | 开源免费 | 需要部署 | 免费 | 本地部署 |
| **Mistral Large** | Mistral AI | 32K | 性价比高 | 生态弱 | $$ | 中等任务 |
| **Qwen 72B** | 阿里 | 32K | 中文优秀 | 需要部署 | 免费 | 中文场景 |
| **Gemini Pro** | Google | 32K | 多模态 | 稳定性 | $$ | 多模态任务 |

### 7.1.3 模型选择策略

#### 决策树

```
开始选择
  ↓
需要处理超长文档(>100K tokens)?
  ├─ 是 → Claude 3 Opus (200K)
  └─ 否 ↓
      需要最强的代码能力?
      ├─ 是 → GPT-4 Turbo
      └─ 否 ↓
          预算有限?
          ├─ 是 → GPT-3.5 Turbo / Mistral
          └─ 否 ↓
              需要中文优化?
              ├─ 是 → Qwen / Claude 3 Sonnet
              └─ 否 → GPT-4 / Claude 3 Opus
```

#### 具体建议

```python
# 场景1：代码生成和调试
推荐模型：GPT-4 Turbo
理由：
- 代码能力强
- 理解复杂逻辑
- Bug检测准确

# 场景2：长文档分析
推荐模型：Claude 3 Opus
理由：
- 200K上下文（约15万汉字）
- 分析能力强
- 不易遗漏细节

# 场景3：客服聊天机器人
推荐模型：Claude 3 Sonnet / GPT-3.5 Turbo
理由：
- 成本可控
- 响应速度快
- 用户体验好

# 场景4：敏感数据处理
推荐模型：本地部署（Llama 3 / Qwen）
理由：
- 数据不出域
- 隐私安全
- 无API费用

# 场景5：多模态应用
推荐模型：GPT-4V / Gemini Pro
理由：
- 理解图像
- 处理多种输入
- 综合能力强
```

---

## 7.2 Claude API使用

### 7.2.1 Claude简介

**Claude** 是Anthropic开发的AI助手，以安全性、长文本处理能力著称。

**Claude 3系列**：
- **Opus**：最强，200K上下文
- **Sonnet**：平衡，200K上下文
- **Haiku**：最快，100K上下文

### 7.2.2 安装和配置

```bash
# 安装
pip install anthropic

# 设置环境变量
export ANTHROPIC_API_KEY="your-api-key"
```

```python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class ClaudeConfig:
    API_KEY = os.getenv("ANTHROPIC_API_KEY")

    # 模型选择
    MODEL_OPUS = "claude-3-opus-20240229"
    MODEL_SONNET = "claude-3-sonnet-20240229"
    MODEL_HAIKU = "claude-3-haiku-20240307"

    # 默认模型
    DEFAULT_MODEL = MODEL_SONNET

    @classmethod
    def get_model(cls, tier: str = "sonnet"):
        models = {
            "opus": cls.MODEL_OPUS,
            "sonnet": cls.MODEL_SONNET,
            "haiku": cls.MODEL_HAIKU
        }
        return models.get(tier, cls.DEFAULT_MODEL)
```

### 7.2.3 基础使用

```python
from anthropic import Anthropic
from config import ClaudeConfig

# 初始化
client = Anthropic(api_key=ClaudeConfig.API_KEY)

# 简单对话
message = client.messages.create(
    model=ClaudeConfig.DEFAULT_MODEL,
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
)

print(message.content[0].text)
# 输出：你好！我是Claude，由Anthropic公司开发的AI助手...
```

### 7.2.4 流式输出

```python
def stream_chat(prompt: str):
    """流式对话"""
    print("Claude：", end="", flush=True)

    with client.messages.stream(
        model=ClaudeConfig.DEFAULT_MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)

    print()  # 换行

# 使用
stream_chat("用Python写一个快速排序")
```

### 7.2.5 长文档处理（Claude的强项）

```python
def analyze_long_document(document_path: str):
    """分析长文档"""
    # 读取文档
    with open(document_path, 'r', encoding='utf-8') as f:
        document = f.read()

    # Claude可以处理超长文档（200K tokens ≈ 15万汉字）
    message = client.messages.create(
        model=ClaudeConfig.MODEL_OPUS,  # 使用Opus获得最佳效果
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": f"""请分析以下文档，提取关键信息：

{document}

请提供：
1. 文档摘要
2. 关键要点（最多10条）
3. 主要结论
4. 需要关注的细节
"""
        }]
    )

    return message.content[0].text

# 使用
result = analyze_long_document("long_document.txt")
print(result)
```

### 7.2.6 多图理解（多模态）

```python
import base64

def encode_image(image_path: str) -> str:
    """编码图片"""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

def analyze_image(image_path: str, question: str):
    """分析图片"""
    image_data = encode_image(image_path)

    message = client.messages.create(
        model=ClaudeConfig.MODEL_SONNET,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data
                    }
                },
                {
                    "type": "text",
                    "text": question
                }
            ]
        }]
    )

    return message.content[0].text

# 使用
result = analyze_image(
    "screenshot.png",
    "请描述这个界面的布局，并提出改进建议"
)
print(result)
```

### 7.2.7 LangChain中使用Claude

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

# 初始化
llm = ChatAnthropic(
    model=ClaudeConfig.MODEL_SONNET,
    api_key=ClaudeConfig.API_KEY,
    temperature=0.7,
    max_tokens=1024
)

# 创建链
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是专业的AI助手"),
    ("human", "{input}")
])

chain = prompt | llm

# 使用
response = chain.invoke({"input": "解释什么是RAG"})
print(response.content)
```

### 7.2.8 Claude vs GPT对比

| 特性 | Claude 3 | GPT-4 |
|------|----------|-------|
| **上下文长度** | 200K (Opus/Sonnet) | 128K |
| **长文本处理** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **代码能力** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **中文支持** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **安全性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **价格** | 较高 | 较高 |
| **输出速度** | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**选择建议**：
```python
# 使用Claude的场景：
- 处理超长文档（>100页）
- 需要深度分析和推理
- 对安全性要求高
- 不确定的长文本任务

# 使用GPT-4的场景：
- 代码生成和调试
- 需要最快的响应
- 复杂逻辑推理
- 与OpenAI生态集成
```

---

## 7.3 开源模型和本地部署

### 7.3.1 Ollama：最简单的本地部署

**安装Ollama**：
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# 从 https://ollama.com/download 下载安装
```

**拉取模型**：
```bash
# Llama 3 (推荐)
ollama pull llama3

# Qwen (中文)
ollama pull qwen

# Mistral
ollama pull mistral

# 代码模型
ollama pull deepseek-coder
```

**使用Ollama**：
```bash
# 命令行交互
ollama run llama3

# API服务（默认端口11434）
ollama serve
```

```python
# Python中使用
import requests
import json

def chat_with_ollama(prompt: str, model: str = "llama3"):
    """使用Ollama聊天"""
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()['response']

# 使用
print(chat_with_ollama("你好"))
```

**LangChain集成**：
```python
from langchain_community.llms import Ollama

# 初始化
llm = Ollama(model="llama3")

# 使用
response = llm.invoke("解释什么是机器学习")
print(response)
```

### 7.3.2 性能对比

| 模型 | 参数量 | 显存需求 | 速度 | 质量 |
|------|--------|----------|------|------|
| **Llama 3 8B** | 8B | 6GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Llama 3 70B** | 70B | 40GB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mistral 7B** | 7B | 5GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Qwen 72B** | 72B | 48GB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**硬件建议**：
```python
# 8GB显存：Llama 3 8B, Mistral 7B
# 16GB显存：Llama 3 70B (量化版)
# 24GB+显存：Llama 3 70B完整版
# 无GPU：使用Ollama CPU模式（较慢）
```

### 7.3.3 成本对比

```
场景：处理100万个tokens

OpenAI GPT-3.5：
  输入：$0.0005/1K × 1000 = $0.5
  输出：$0.0015/1K × 1000 = $1.5
  总计：$2

Claude 3 Sonnet：
  输入：$3/1M × 1 = $3
  输出：$15/1M × 1 = $15
  总计：$18

本地部署（Llama 3）：
  GPU电费：约$0.1
  总计：$0.1 💰

结论：高频使用场景，本地部署最经济
```

---

## 7.4 Moltbot框架

### 7.4.1 什么是Moltbot？

**Moltbot**（原名ClawdBot）是一个轻量级、易用的AI Agent开发框架，专门为快速构建智能助手而设计。

```
┌─────────────────────────────────────────────┐
│         Moltbot 核心特点                     │
├─────────────────────────────────────────────┤
│                                             │
│  ✨ 简单易用                                │
│  - 几行代码即可创建Agent                    │
│  - Pythonic API设计                         │
│  - 丰富的文档和示例                         │
│                                             │
│  🚀 高性能                                  │
│  - 异步执行支持                             │
│  - 内置连接池                               │
│  - 智能缓存机制                             │
│                                             │
│  🔧 灵活扩展                                │
│  - 插件化架构                               │
│  - 自定义工具                               │
│  - 多模型支持                               │
│                                             │
│  💰 成本友好                                │
│  - 开源免费                                 │
│  - 本地运行优先                             │
│  - 智能降级策略                             │
│                                             │
└─────────────────────────────────────────────┘
```

### 7.4.2 为什么选择Moltbot？

| 特性 | Moltbot | LangChain | AutoGen |
|------|---------|-----------|---------|
| **学习曲线** | ⭐⭐⭐⭐⭐ 最简单 | ⭐⭐⭐ 中等 | ⭐⭐ 较陡 |
| **代码量** | 最少 | 中等 | 较多 |
| **灵活性** | ⭐⭐⭐⭐ 高 | ⭐⭐⭐⭐⭐ 极高 | ⭐⭐⭐⭐⭐ 极高 |
| **性能** | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 良好 | ⭐⭐⭐ 一般 |
| **文档** | ⭐⭐⭐⭐ 完善 | ⭐⭐⭐⭐⭐ 极完善 | ⭐⭐⭐ 较少 |
| **适合场景** | 快速开发 | 复杂应用 | 研究 |

**Moltbot最适合**：
- 🎯 快速原型开发
- 🎯 中小型项目
- 🎯 学习Agent开发
- 🎯 团队协作工具

### 7.4.3 安装和配置

```bash
# 安装Moltbot
pip install moltbot

# 或使用国内镜像加速
pip install moltbot -i https://pypi.tuna.tsinghua.edu.cn/simple
```

```python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class MoltbotConfig:
    """Moltbot配置"""

    # LLM配置
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")  # openai, claude, ollama
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

    # 模型选择
    MODEL_NAME = os.getenv("MODEL_NAME", "gpt-3.5-turbo")

    # Agent配置
    MAX_TOOLS_CALLS = int(os.getenv("MAX_TOOLS_CALLS", "5"))
    TIMEOUT = int(os.getenv("TIMEOUT", "30"))

    # 缓存配置
    ENABLE_CACHE = os.getenv("ENABLE_CACHE", "true").lower() == "true"
    CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))
```

### 7.4.4 快速开始

#### 创建第一个Moltbot Agent

```python
from moltbot import Agent, Tool
from moltbot.llm import OpenAILLM

# 1. 初始化LLM
llm = OpenAILLM(
    api_key="your-api-key",
    model="gpt-3.5-turbo",
    temperature=0.7
)

# 2. 创建Agent
agent = Agent(
    name="小助手",
    llm=llm,
    instructions="你是一个友好的AI助手，擅长回答问题"
)

# 3. 对话
response = agent.chat("你好，请介绍一下你自己")
print(response)
# 输出：你好！我是小助手，很高兴为你服务...
```

#### 添加工具

```python
from moltbot import Tool

# 1. 定义工具函数
def get_weather(city: str) -> str:
    """查询天气"""
    # 实际调用天气API
    return f"{city}今天晴天，温度25°C"

def calculate(expression: str) -> float:
    """计算数学表达式"""
    try:
        return eval(expression)
    except:
        return "计算错误"

# 2. 创建工具
weather_tool = Tool(
    name="get_weather",
    description="查询指定城市的天气",
    function=get_weather
)

calculator_tool = Tool(
    name="calculator",
    description="计算数学表达式",
    function=calculate
)

# 3. 添加工具到Agent
agent.add_tools([weather_tool, calculator_tool])

# 4. 使用
response = agent.chat("北京今天天气怎么样？")
# Agent会自动调用get_weather工具

response = agent.chat("计算123 * 456")
# Agent会自动调用calculator工具
```

### 7.4.5 高级功能

#### 1. 记忆管理

```python
from moltbot.memory import ConversationMemory

# 创建带记忆的Agent
memory = ConversationMemory(
    max_history=100,  # 最多保存100轮对话
    persist=True,      # 持久化到磁盘
    storage_path="./memory"
)

agent = Agent(
    name="记忆助手",
    llm=llm,
    memory=memory
)

# Agent会记住之前的对话
agent.chat("我叫小明")
agent.chat("我叫什么名字？")
# 输出：你叫小明

# 查看记忆历史
history = memory.get_history()
print(history)
```

#### 2. 异步执行

```python
import asyncio
from moltbot import AsyncAgent

async def main():
    # 创建异步Agent
    agent = AsyncAgent(
        name="异步助手",
        llm=llm
    )

    # 并发处理多个任务
    tasks = [
        agent.chat("问题1"),
        agent.chat("问题2"),
        agent.chat("问题3")
    ]

    results = await asyncio.gather(*tasks)
    for result in results:
        print(result)

asyncio.run(main())
```

#### 3. 多Agent协作

```python
from moltbot import Agent, Team

# 创建专业Agent
researcher = Agent(
    name="研究员",
    llm=llm,
    instructions="你擅长搜集和分析信息"
)

writer = Agent(
    name="写手",
    llm=llm,
    instructions="你擅长撰写文章"
)

reviewer = Agent(
    name="审核员",
    llm=llm,
    instructions="你擅长审核内容质量"
)

# 创建团队
team = Team(
    name="内容创作团队",
    members=[researcher, writer, reviewer],
    workflow="researcher → writer → reviewer"  # 工作流
)

# 执行任务
result = team.execute("主题：人工智能的发展趋势")
# 输出：研究员搜集信息 → 写手撰写文章 → 审核员质量检查
```

#### 4. 自定义插件

```python
from moltbot import Plugin

class DatabasePlugin(Plugin):
    """数据库插件"""

    def __init__(self, connection_string: str):
        super().__init__(name="database")
        self.db = self.connect(connection_string)

    def query(self, sql: str):
        """执行SQL查询"""
        cursor = self.db.cursor()
        cursor.execute(sql)
        return cursor.fetchall()

    def to_tools(self):
        """转换为工具"""
        return [
            Tool(
                name="db_query",
                description="查询数据库",
                function=self.query
            )
        ]

# 使用插件
db_plugin = DatabasePlugin("sqlite:///mydb.db")
agent.add_tools(db_plugin.to_tools())

response = agent.chat("查询用户表有多少条记录")
```

### 7.4.6 实战案例

#### 案例1：智能客服系统

```python
from moltbot import Agent, Tool
from moltbot.knowledge import KnowledgeBase

# 1. 创建知识库
kb = KnowledgeBase()
kb.add_documents([
    {"content": "退款流程：进入订单详情 → 申请退款 → 等待审核"},
    {"content": "配送时间：一般2-3个工作日"},
    {"content": "联系方式：客服电话400-123-4567"}
])

# 2. 创建客服Agent
customer_service = Agent(
    name="智能客服",
    llm=llm,
    instructions="""
    你是一个专业的客服人员。
    - 使用礼貌、友好的语言
    - 优先从知识库中查找答案
    - 无法解决时引导用户联系人工客服
    """,
    knowledge_base=kb
)

# 3. 添加订单查询工具
def check_order(order_id: str) -> dict:
    """查询订单状态"""
    # 实际查询数据库
    return {
        "order_id": order_id,
        "status": "已发货",
        "estimated_arrival": "2024-03-15"
    }

customer_service.add_tool(Tool(
    name="check_order",
    description="查询订单状态",
    function=check_order
))

# 4. 服务
print(customer_service.chat("我的订单12345什么时候到？"))
# 输出：您的订单12345已发货，预计3月15日送达

print(customer_service.chat("如何申请退款？"))
# 输出：退款流程很简单：进入订单详情 → 申请退款 → 等待审核
```

#### 案例2：代码助手

```python
from moltbot import Agent
import subprocess

class CodeAssistant(Agent):
    """代码助手Agent"""

    def __init__(self, llm):
        super().__init__(
            name="代码助手",
            llm=llm,
            instructions="你是专业的编程助手，擅长代码生成和调试"
        )

        # 添加代码执行工具
        self.add_tool(Tool(
            name="execute_python",
            description="执行Python代码",
            function=self._execute_python
        ))

        # 添加代码搜索工具
        self.add_tool(Tool(
            name="search_code",
            description="搜索代码示例",
            function=self._search_code
        ))

    def _execute_python(self, code: str) -> str:
        """执行Python代码"""
        try:
            result = subprocess.run(
                ["python", "-c", code],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.stdout if result.returncode == 0 else result.stderr
        except Exception as e:
            return str(e)

    def _search_code(self, query: str) -> str:
        """搜索代码示例"""
        # 实际实现可以调用GitHub API或本地代码库
        return f"找到相关代码：{query}"

# 使用
assistant = CodeAssistant(llm)
print(assistant.chat("写一个Python快排并执行测试"))
```

### 7.4.7 Moltbot vs LangChain

**何时选择Moltbot**：
```python
# ✅ 选择Moltbot的场景：
- 快速原型（小时级 vs 天级）
- 简单到中等复杂度的Agent
- 团队技术栈较新
- 需要快速迭代

# ✅ 选择LangChain的场景：
- 复杂的工作流
- 需要深度定制
- 已有LangChain生态
- 需要社区支持
```

**代码对比**：

```python
# Moltbot：简洁
agent = Agent(name="助手", llm=llm)
agent.add_tool(tool)
response = agent.chat("问题")

# LangChain：详细
from langchain.agents import initialize_agent, AgentType
from langchain.tools import Tool

tools = [tool]
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True
)
response = agent.run("问题")
```

### 7.4.8 最佳实践

```python
# 1. 清晰的指令
agent = Agent(
    name="数据分析助手",
    instructions="""
    角色定位：你是专业的数据分析师
    工作流程：
      1. 理解用户需求
      2. 选择合适的分析工具
      3. 执行分析并生成报告
    输出格式：使用Markdown格式
    注意事项：数据隐私第一
    """
)

# 2. 合理的工具定义
tool = Tool(
    name="calculate",
    description="执行数学计算，输入格式：数学表达式字符串",
    function=calculate
)

# 3. 错误处理
try:
    response = agent.chat("复杂问题", timeout=30)
except TimeoutError:
    # 超时处理
    response = "抱歉，处理超时，请稍后再试"
except Exception as e:
    # 其他错误
    response = f"发生错误：{str(e)}"

# 4. 成本监控
from moltbot import CostTracker

tracker = CostTracker()
agent = Agent(name="助手", llm=llm, cost_tracker=tracker)

# 查看成本
print(f"总成本：${tracker.total_cost():.4f}")
```

### 7.4.9 性能优化

```python
# 1. 启用缓存
from moltbot import Cache

cache = Cache(max_size=1000, ttl=3600)
agent = Agent(name="助手", llm=llm, cache=cache)

# 2. 批量处理
questions = ["问题1", "问题2", "问题3"]
responses = agent.batch_chat(questions)

# 3. 流式输出
for chunk in agent.stream_chat("长问题"):
    print(chunk, end="", flush=True)
```

---

## 7.5 MCP (Model Context Protocol)

### 7.4.1 什么是MCP？

**MCP** 是一个开放协议，让AI应用能够轻松连接到外部数据源和工具。

```
传统方式 vs MCP：

传统方式：
  ❌ 每个数据源需要自定义集成
  ❌ 代码重复，维护困难
  ❌ 缺乏统一标准

MCP方式：
  ✅ 统一的接口标准
  ✅ 即插即用
  ✅ 社区生态共享
```

### 7.4.2 MCP架构

```
┌──────────────────────────────────────────┐
│         MCP 架构                          │
├──────────────────────────────────────────┤
│                                          │
│  AI Application                          │
│    ↓                                     │
│  ┌─────────────┐                         │
│  │ MCP Client  │                         │
│  └─────────────┘                         │
│    ↓                                     │
│  ┌─────────────┐    ┌──────────────┐    │
│  │ MCP Server  │ ← → │ Data Source  │    │
│  └─────────────┘    └──────────────┘    │
│                                          │
│  示例MCP Servers：                       │
│  - 文件系统访问                          │
│  - 数据库查询                            │
│  - Git操作                              │
│  - Slack集成                             │
│  - Google Drive                         │
│                                          │
└──────────────────────────────────────────┘
```

### 7.4.3 使用MCP

**安装MCP SDK**：
```bash
pip install mcp
```

**创建MCP Server**：
```python
# my_mcp_server.py
from mcp.server import Server
from mcp.types import Tool, TextContent
import subprocess

app = Server("my-tools")

@app.tool()
def execute_command(command: str) -> str:
    """执行shell命令"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True
        )
        return f"输出：\n{result.stdout}\n错误：\n{result.stderr}"
    except Exception as e:
        return f"错误：{str(e)}"

@app.tool()
def read_file(file_path: str) -> str:
    """读取文件内容"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"错误：{str(e)}"

# 启动服务器
if __name__ == "__main__":
    app.run()
```

**LangChain中使用MCP**：
```python
from langchain_mcp import MCPToolkit

# 连接到MCP服务器
toolkit = MCPToolkit(
    server_url="http://localhost:3000"
)

# 获取工具
tools = toolkit.get_tools()

# 创建Agent
from langchain.agents import create_openai_functions_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo")
agent = create_openai_functions_agent(llm, tools, prompt)

# 使用
from langchain.agents import AgentExecutor

executor = AgentExecutor(agent=agent, tools=tools)
result = executor.invoke({"input": "读取config.py文件"})
```

### 7.4.4 常用MCP Servers

```bash
# 1. 文件系统服务器
mcp-server-filesystem /path/to/directory

# 2. Git服务器
mcp-server-git

# 3. PostgreSQL服务器
mcp-server-postgres

# 4. Slack服务器
mcp-server-slack

# 5. Google Drive服务器
mcp-server-gdrive
```

---

## 7.5 LangGraph：复杂Agent框架

### 7.5.1 为什么需要LangGraph？

**传统Agent的局限**：
```python
# 传统ReAct Agent
- 线性推理
- 难以处理循环
- 状态管理简单
- 难以实现复杂逻辑

# LangGraph
- 图状状态机
- 支持循环和条件分支
- 灵活的状态管理
- 可视化工作流
```

### 7.5.2 LangGraph核心概念

```
LangGraph = Graph + State

Graph（图）：
  - Node（节点）：执行操作的函数
  - Edge（边）：节点之间的转换
  - Conditional Edge（条件边）：基于条件的分支

State（状态）：
  - 在节点之间传递的数据
  - 可以被任意节点修改
  - 类型安全（TypedDict）
```

### 7.5.3 构建第一个LangGraph

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

# 1. 定义状态
class AgentState(TypedDict):
    query: str
    response: str
    needs_search: bool
    search_results: str

# 2. 定义节点
def decide_search(state: AgentState) -> AgentState:
    """决定是否需要搜索"""
    query = state["query"]

    # 简单规则：如果包含"搜索"则搜索
    state["needs_search"] = "搜索" in query

    return state

def search(state: AgentState) -> AgentState:
    """执行搜索"""
    # 实际的搜索逻辑
    state["search_results"] = f"搜索'{state['query']}'的结果..."
    return state

def generate_response(state: AgentState) -> AgentState:
    """生成回复"""
    if state["needs_search"]:
        state["response"] = f"基于搜索结果：{state['search_results']}"
    else:
        state["response"] = f"直接回答：{state['query']}"

    return state

# 3. 构建图
workflow = StateGraph(AgentState)

# 添加节点
workflow.add_node("decide_search", decide_search)
workflow.add_node("search", search)
workflow.add_node("generate", generate_response)

# 设置入口
workflow.set_entry_point("decide_search")

# 添加边
workflow.add_conditional_edges(
    "decide_search",
    lambda x: "search" if x["needs_search"] else "generate",
    {
        "search": "search",
        "generate": "generate"
    }
)

workflow.add_edge("search", "generate")
workflow.add_edge("generate", END)

# 4. 编译图
app = workflow.compile()

# 5. 运行
result = app.invoke({
    "query": "搜索Python教程",
    "response": "",
    "needs_search": False,
    "search_results": ""
})

print(result["response"])
```

### 7.5.4 复杂示例：客服Agent

```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import Literal

class CustomerServiceState(TypedDict):
    user_input: str
    intent: str  # faq, complaint, tech_support
    response: str
    satisfaction: int

llm = ChatOpenAI(model="gpt-3.5-turbo")

def classify_intent(state: CustomerServiceState) -> CustomerServiceState:
    """分类用户意图"""
    prompt = f"分类以下用户意图（faq/complaint/tech_support）：{state['user_input']}"
    response = llm.invoke(prompt)
    state["intent"] = response.content.strip().lower()
    return state

def handle_faq(state: CustomerServiceState) -> CustomerServiceState:
    """处理FAQ"""
    response = llm.invoke(f"回答这个FAQ问题：{state['user_input']}")
    state["response"] = response.content
    return state

def handle_complaint(state: CustomerServiceState) -> CustomerServiceState:
    """处理投诉"""
    response = llm.invoke(f"礼貌地处理这个投诉：{state['user_input']}")
    state["response"] = response.content
    return state

def handle_tech_support(state: CustomerServiceState) -> CustomerServiceState:
    """处理技术支持"""
    response = llm.invoke(f"提供技术支持：{state['user_input']}")
    state["response"] = response.content
    return state

def route_intent(state: CustomerServiceState) -> Literal["faq", "complaint", "tech_support"]:
    """路由到不同处理流程"""
    return state["intent"]

# 构建图
workflow = StateGraph(CustomerServiceState)

workflow.add_node("classify", classify_intent)
workflow.add_node("faq", handle_faq)
workflow.add_node("complaint", handle_complaint)
workflow.add_node("tech_support", handle_tech_support)

workflow.set_entry_point("classify")

workflow.add_conditional_edges(
    "classify",
    route_intent,
    {
        "faq": "faq",
        "complaint": "complaint",
        "tech_support": "tech_support"
    }
)

workflow.add_edge("faq", END)
workflow.add_edge("complaint", END)
workflow.add_edge("tech_support", END)

# 编译
app = workflow.compile()

# 使用
result = app.invoke({
    "user_input": "我的产品有质量问题",
    "intent": "",
    "response": "",
    "satisfaction": 0
})

print(result["response"])
```

### 7.5.5 可视化LangGraph

```python
# 生成可视化图
from IPython.display import Image, display

try:
    display(Image(app.get_graph().draw_mermaid_png()))
except Exception:
    pass
```

---

## 7.6 AI应用评估和测试

### 7.6.1 评估维度

```
AI应用评估框架：

1. 准确性（Accuracy）
   - 答案正确率
   - 事实一致性
   - 计算准确性

2. 相关性（Relevance）
   - 回答是否切题
   - 是否满足用户需求
   - 信息完整度

3. 质量（Quality）
   - 语言流畅度
   - 逻辑连贯性
   - 可读性

4. 安全性（Safety）
   - 有害内容过滤
   - 偏见检测
   - 隐私保护

5. 性能（Performance）
   - 响应时间
   - 吞吐量
   - 资源消耗

6. 成本（Cost）
   - Token消耗
   - API费用
   - 基础设施成本
```

### 7.6.2 RAG评估框架

**使用Ragas**：

```bash
pip install ragas
```

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_relevancy,
    context_recall
)
from datasets import Dataset

# 准备测试数据
test_data = {
    "question": [
        "什么是Python装饰器？",
        "如何使用FastAPI？"
    ],
    "answer": [
        "装饰器是Python的一种设计模式...",
        "使用FastAPI需要先安装..."
    ],
    "contexts": [
        ["Python装饰器是一种...", "装饰器可以用来..."],
        ["FastAPI是现代Web框架...", "安装命令是..."]
    ],
    "ground_truth": [
        "装饰器是一种修改函数行为的工具",
        "需要使用pip install fastapi安装"
    ]
}

dataset = Dataset.from_dict(test_data)

# 评估
result = evaluate(
    dataset=dataset,
    metrics=[
        faithfulness,       # 忠实度
        answer_relevancy,   # 答案相关性
        context_relevancy,  # 上下文相关性
        context_recall      # 上下文召回率
    ]
)

# 查看结果
print(result)
# Output:
# {'faithfulness': 0.85, 'answer_relevancy': 0.92, ...}

# 转换为DataFrame
df = result.to_pandas()
print(df)
```

### 7.6.3 自定义评估

```python
class RAGEvaluator:
    """RAG系统评估器"""

    def __init__(self, rag_system, test_questions: list):
        self.rag = rag_system
        self.test_questions = test_questions
        self.llm = ChatOpenAI(model="gpt-3.5-turbo")

    def evaluate_accuracy(self, question: str, ground_truth: str) -> float:
        """评估准确性"""
        response = self.rag.ask(question)
        answer = response["answer"]

        # 使用LLM评分
        prompt = f"""
        请评估以下答案的质量（0-10分）：

        问题：{question}
        标准答案：{ground_truth}
        实际答案：{answer}

        评分标准：
        - 准确性：是否与标准答案一致
        - 完整性：是否包含所有关键信息
        - 正确性：是否有错误信息

        只返回0-10之间的数字分数。
        """

        score = self.llm.invoke(prompt)
        return float(score.content) / 10

    def evaluate_retrieval(self, question: str, top_k: int = 3) -> dict:
        """评估检索质量"""
        docs = self.rag.vectorstore.similarity_search(question, k=top_k)

        return {
            "retrieved_count": len(docs),
            "avg_relevance": self._avg_relevance(question, docs)
        }

    def _avg_relevance(self, question: str, docs: list) -> float:
        """计算平均相关性"""
        scores = []
        for doc in docs:
            prompt = f"""
            评估文档与问题的相关性（0-1）：

            问题：{question}
            文档：{doc.page_content[:200]}

            只返回0-1之间的数字。
            """
            score = self.llm.invoke(prompt)
            scores.append(float(score.content))

        return sum(scores) / len(scores)

    def run_evaluation(self) -> dict:
        """运行完整评估"""
        results = {
            "total_questions": len(self.test_questions),
            "evaluated": 0,
            "avg_accuracy": 0,
            "avg_retrieval_relevance": 0
        }

        accuracy_scores = []
        relevance_scores = []

        for item in self.test_questions:
            acc = self.evaluate_accuracy(
                item["question"],
                item["ground_truth"]
            )
            acc_score = acc

            ret = self.evaluate_retrieval(item["question"])
            rel_score = ret["avg_relevance"]

            accuracy_scores.append(acc_score)
            relevance_scores.append(rel_score)

            results["evaluated"] += 1

        results["avg_accuracy"] = sum(accuracy_scores) / len(accuracy_scores)
        results["avg_retrieval_relevance"] = sum(relevance_scores) / len(relevance_scores)

        return results

# 使用
evaluator = RAGEvaluator(rag_system, [
    {
        "question": "什么是Python装饰器？",
        "ground_truth": "装饰器是一种修改函数行为的工具"
    },
    # ... 更多测试数据
])

results = evaluator.run_evaluation()
print(results)
# {'total_questions': 10, 'avg_accuracy': 0.85, 'avg_retrieval_relevance': 0.78}
```

### 7.6.4 A/B测试

```python
def ab_test(model_a, model_b, test_cases: list):
    """A/B测试两个模型"""

    results_a = []
    results_b = []

    for case in test_cases:
        response_a = model_a.invoke(case["input"])
        response_b = model_b.invoke(case["input"])

        # 评估
        score_a = evaluate_response(response_a, case)
        score_b = evaluate_response(response_b, case)

        results_a.append(score_a)
        results_b.append(score_b)

    # 统计
    avg_a = sum(results_a) / len(results_a)
    avg_b = sum(results_b) / len(results_b)

    return {
        "model_a_avg": avg_a,
        "model_b_avg": avg_b,
        "winner": "A" if avg_a > avg_b else "B"
    }
```

### 7.6.5 性能测试

```python
import time
from statistics import mean

def performance_test(rag_system, test_questions: list):
    """性能测试"""

    latencies = []
    token_counts = []

    for question in test_questions:
        start = time.time()

        response = rag_system.ask(question)

        end = time.time()
        latency = end - start

        latencies.append(latency)
        # 假设你有方法获取token数
        # token_counts.append(get_token_count(response))

    return {
        "avg_latency": mean(latencies),
        "p95_latency": sorted(latencies)[int(len(latencies) * 0.95)],
        "p99_latency": sorted(latencies)[int(len(latencies) * 0.99)],
        "min_latency": min(latencies),
        "max_latency": max(latencies)
    }

# 使用
perf_results = performance_test(rag_system, test_questions)
print(f"平均延迟：{perf_results['avg_latency']:.2f}秒")
print(f"P95延迟：{perf_results['p95_latency']:.2f}秒")
```

---

## 7.7 最佳实践总结

### 7.7.1 模型选择清单

```
✓ 明确需求
  - 任务类型（对话/分析/代码）
  - 上下文长度
  - 实时性要求
  - 预算限制

✓ 评估选项
  - 闭源 vs 开源
  - API vs 本地部署
  - 性能 vs 成本

✓ 测试验证
  - A/B测试
  - 评估指标
  - 用户反馈
```

### 7.7.2 优化技巧

```python
# 1. 提示词优化
- 清晰具体
- 提供示例
- 角色设定

# 2. 检索优化
- 调整chunk_size
- 使用混合检索
- 实施重排序

# 3. 成本优化
- 使用缓存
- 批量处理
- 选择合适模型

# 4. 性能优化
- 异步调用
- 流式输出
- 连接池
```

### 7.7.3 安全建议

```
✓ API密钥管理
  - 使用环境变量
  - 定期轮换
  - 访问控制

✓ 内容过滤
  - 输入验证
  - 输出审核
  - 敏感信息检测

✓ 速率限制
  - 防止滥用
  - 控制成本
  - 保护服务
```

---

## 7.8 本章小结

### 7.8.1 核心内容

✅ **LLM模型选择**：
- 主流模型对比
- 场景化选择策略
- 成本性能权衡

✅ **Claude API**：
- 长文本处理优势
- 多模态能力
- LangChain集成

✅ **开源模型**：
- Ollama本地部署
- 成本优势
- 隐私保护

✅ **MCP协议**：
- 统一数据接口
- 即插即用
- 生态共享

✅ **LangGraph**：
- 复杂Agent构建
- 状态图管理
- 可视化工作流

✅ **评估测试**：
- Ragas框架
- 自定义评估
- A/B测试

### 7.8.2 进阶学习路径

```
当前阶段：AI应用开发 ✅
    ↓
进阶方向：
  ├── 多模态AI（图像、音频、视频）
  ├── 模型微调（LoRA、QLoRA）
  ├── 生产部署（Kubernetes、监控）
  ├── AI安全（对抗攻击、防御）
  └── 前沿研究（最新论文、技术）
```

---

## 7.9 练习题

### 练习1：模型对比

选择同一个任务（如RAG问答），使用GPT-3.5、Claude Sonnet、Llama 3分别实现，对比效果和成本。

### 练习2：构建MCP Server

创建一个自定义的MCP Server，集成你的数据源。

### 练习3：LangGraph项目

使用LangGraph实现一个复杂的客服系统，包含FAQ、投诉、技术支持等分支。

### 练习4：评估框架

为你的RAG系统建立完整的评估体系，包含准确性、性能、成本等维度。

---

**恭喜完成AI应用开发完全指南！** 🎉

从基础到进阶，你已经掌握了构建现代AI应用的全套技能。

**继续保持学习，探索AI的无限可能！** 🚀
