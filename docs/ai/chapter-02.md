# LangChain框架

## 本章导读

在第1章中，我们学习了如何直接调用OpenAI API构建简单的AI应用。但随着应用变得复杂，直接使用API会遇到很多挑战：如何管理对话历史？如何串联多个步骤？如何集成外部数据？

**LangChain** 是目前最流行的LLM应用开发框架，它为我们提供了一套完整的工具链，大大简化了LLM应用的开发。

**2024-2026更新**：
- LangChain 0.3+ 重新设计的架构
- LCEL（LangChain Expression Language）成为标准
- 内置 LangGraph 支持复杂 Agent
- 改进的类型提示和错误处理
- 更好的流式输出支持

**学习目标**：
- 理解LangChain的核心概念和架构
- 掌握Model I/O：模型、提示词、输出解析
- 学习Chains：串联多个操作
- 实现Memory：对话记忆管理
- 了解LangGraph基础

**预计学习时间**：60分钟

---

## 什么是LangChain？

### LangChain简介

**LangChain** 是一个开源框架，专门用于开发基于大语言模型的应用。它提供了一系列模块化的组件，让你可以轻松构建复杂的AI应用。

**核心价值**：

```
直接使用API的问题：
  ❌ 提示词管理混乱
  ❌ 难以串联多个步骤
  ❌ 对话历史需要手动维护
  ❌ 难以集成外部数据
  ❌ 缺乏标准化组件

LangChain的解决方案：
  ✅ 提示词模板化管理
  ✅ Chain链式调用
  ✅ Memory自动管理
  ✅ Data Connection集成
  ✅ 丰富的生态系统
```

### LangChain的六大核心模块

```
┌─────────────────────────────────────────────┐
│          LangChain 架构图                     │
├─────────────────────────────────────────────┤
│                                              │
│  📦 Model I/O      模型输入输出                │
│    ├── Models    LLM包装和统一接口            │
│    ├── Prompts   提示词模板                   │
│    └── Parsers   输出解析器                   │
│                                              │
│  🔗 Chains        链式调用                    │
│    ├── LLMChain  基础链                      │
│    ├── Sequential 顺序链                     │
│    └── Router    路由链                      │
│                                              │
│  🧠 Memory        记忆管理                    │
│    ├── Buffer    缓冲记忆                    │
│    ├── Summary   摘要记忆                    │
│    └── Knowledge 知识图谱记忆                 │
│                                              │
│  📚 Retrieval     检索生成                    │
│    ├── Loaders   文档加载器                   │
│    ├── Splitters 文本分割器                  │
│    ├── Embeddings 向量化                    │
│    └── VectorStores 向量数据库               │
│                                              │
│  🤖 Agents        智能代理                    │
│    ├── Tools     工具定义                    │
│    ├── Agent     代理类型                    │
│    └── Executor  执行器                      │
│                                              │
│  🔧 Chains        工具和回调                  │
│    └── Callbacks 观察和监听                   │
│                                              │
└─────────────────────────────────────────────┘
```

### 安装LangChain

```bash
# 2024-2026 推荐安装方式

# 核心 - LangChain 0.3+
pip install langchain==0.3.0
pip install langchain-core==0.3.0
pip install langchain-openai==0.2.0

# 社区扩展
pip install langchain-community==0.3.0

# LangGraph - 复杂Agent编排
pip install langgraph==0.2.0

# 向量数据库
pip install chromadb==0.5.0
pip install faiss-cpu==1.8.0

# 完整依赖（一键安装）
pip install langchain==0.3.0 \
            langchain-openai==0.2.0 \
            langchain-community==0.3.0 \
            langgraph==0.2.0 \
            chromadb==0.5.0

# 验证安装
python -c "import langchain; print(langchain.__version__)"
# 应输出: 0.3.0 或更高版本
```

**版本说明（2024-2026）**：
- **LangChain 0.3+**（2024年10月发布）- 重大架构更新
  - 完全基于LCEL重写
  - 移除所有废弃的API
  - 性能提升30-50%
  - 更好的Python类型提示
  - 内置LangGraph支持

---

## Model I/O：模型输入输出

Model I/O是LangChain最基础的模块，包含三个核心组件：
- **Models**：与大语言模型交互
- **Prompts**：管理提示词
- **Output Parsers**：解析模型输出

### Models：模型接口

LangChain提供了统一的模型接口，支持多种模型：

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from config import Config

# 2024-2026 推荐模型配置

# 1. GPT-4o - 多模态、速度快
gpt4o = ChatOpenAI(
    model="gpt-4o",  # 2024年最新多模态模型
    api_key=Config.OPENAI_API_KEY,
    temperature=0.7,
    max_tokens=4096
)

# 2. Claude 3.5 Sonnet - 综合能力最强
claude = ChatAnthropic(
    model="claude-3-5-sonnet-20241022",  # 2024年最强模型
    api_key=Config.ANTHROPIC_API_KEY,
    temperature=0.7,
    max_tokens=8192  # Claude支持更长输出
)

# 3. GPT-4o-mini - 性价比最高
gpt4o_mini = ChatOpenAI(
    model="gpt-4o-mini",  # 2024年性价比之王
    api_key=Config.OPENAI_API_KEY,
    temperature=0.7,
    max_tokens=16384
)

# 使用示例
message = "你好，请介绍一下你自己"
response = gpt4o.invoke(message)
print(response.content)  # AI的回复

# 2024-2026 模型选择建议：
# - 复杂任务/代码 → Claude 3.5 Sonnet
# - 多模态/实时 → GPT-4o
# - 高频简单任务 → GPT-4o-mini
# - 中文优化 → Qwen 2.5 / DeepSeek-V3
```

**Message类型**：

```python
from langchain_core.messages import (
    HumanMessage,      # 人类消息
    AIMessage,         # AI消息
    SystemMessage,     # 系统消息
    ToolMessage        # 工具消息
)

# 构建消息列表
messages = [
    SystemMessage(content="你是一个专业的Python导师"),
    HumanMessage(content="什么是装饰器？")
]

response = chat.invoke(messages)
print(response.content)
```

### Prompts：提示词模板

#### 基础提示词模板

```python
from langchain_core.prompts import ChatPromptTemplate

# 方式1：使用PromptTemplate
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate(
    template="请解释{concept}这个概念，用{style}的风格",
    input_variables=["concept", "style"]
)

# 填充模板
formatted = prompt.format(
    concept="机器学习",
    style="通俗易懂"
)
print(formatted)
# 输出：请解释机器学习这个概念，用通俗易懂的风格
```

#### Chat提示词模板

```python
from langchain_core.prompts import ChatPromptTemplate

# 创建模板
prompt_template = ChatPromptTemplate.from_messages([
    ("system", "你是一个专业的{role}助手。"),
    ("human", "{user_input}")
])

# 填充并调用
prompt = prompt_template.format_messages(
    role="Python编程",
    user_input="什么是列表推导式？"
)

response = chat.invoke(prompt)
print(response.content)
```

#### 实用的提示词模板

```python
# 1. 代码生成模板
code_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{language}编程专家。"),
    ("human", """请帮我实现以下功能：
    功能描述：{task}
    要求：
    - 代码要有注释
    - 包含使用示例
    - 解释时间复杂度
    """)
])

# 2. 文档分析模板
doc_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个文档分析师。"),
    ("human", """请分析以下文档：
    {document}

    任务：{task}
    输出格式：{format}
    """)
])

# 3. 角色扮演模板
role_prompt = ChatPromptTemplate.from_messages([
    ("system", """你现在是{role}。
    你的特点是：{characteristics}
    你的说话风格：{style}"""),
    ("human", "{question}")
])
```

### Output Parsers：输出解析器

输出解析器让LLM的输出更结构化。

#### 基础解析器

```python
from langchain_core.output_parsers import StrOutputParser

# 创建解析器
output_parser = StrOutputParser()

# 使用链式调用
chain = chat | output_parser  # | 是管道操作符

response = chain.invoke("什么是Python？")
print(response)  # 直接返回字符串，无需.content
```

#### 结构化输出解析器

```python
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate

# 1. 定义期望的输出格式
format_instructions = """
请以JSON格式回复，包含以下字段：
{
    "summary": "简要总结",
    "key_points": ["要点1", "要点2"],
    "difficulty": "难度等级(1-5)"
}
"""

# 2. 创建提示词模板
prompt = PromptTemplate(
    template="""请分析以下主题：{topic}

    {format_instructions}
    """,
    input_variables=["topic"],
    partial_variables={"format_instructions": format_instructions}
)

# 3. 创建解析器和链
parser = JsonOutputParser()
chain = prompt | chat | parser

# 4. 调用
result = chain.invoke({"topic": "Python装饰器"})
print(result)
# 输出：{'summary': '...', 'key_points': [...], 'difficulty': 3}
```

#### Pydantic解析器（推荐）

```python
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

# 1. 定义数据模型
class CodeAnalysis(BaseModel):
    """代码分析结果"""
    language: str = Field(description="编程语言")
    time_complexity: str = Field(description="时间复杂度")
    has_issues: bool = Field(description="是否存在问题")
    suggestions: list[str] = Field(description="改进建议")

# 2. 创建解析器
parser = PydanticOutputParser(pydantic_object=CodeAnalysis)

# 3. 获取格式说明
format_instructions = parser.get_format_instructions()

# 4. 创建提示词
prompt = PromptTemplate(
    template="""分析以下代码：
    {code}

    {format_instructions}
    """,
    input_variables=["code"],
    partial_variables={"format_instructions": format_instructions}
)

# 5. 创建链
chain = prompt | chat | parser

# 6. 调用
result = chain.invoke({"code": "def foo(): return [i**2 for i in range(1000000)]"})
print(result)
# CodeAnalysis(language='Python', time_complexity='O(n)', has_issues=False, suggestions=[...])
```

---

## Chains：链式调用

Chains允许你将多个组件串联起来，构建复杂的工作流。

### LLMChain：最基本的链

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

# 创建提示词模板
prompt = PromptTemplate(
    input_variables=["product"],
    template="为{product}产品写一个吸引人的广告语，不超过20字。"
)

# 创建链
chain = LLMChain(
    llm=chat,
    prompt=prompt
)

# 调用链
result = chain.run(product="智能手表")
print(result)  # "腕间智慧，健康随行！"

# 也可以用invoke方式
result = chain.invoke({"product": "智能手表"})
print(result['text'])
```

### Sequential Chain：顺序链

按顺序执行多个链。

```python
from langchain.chains import SequentialChain

# Chain 1: 生成故事大纲
outline_prompt = PromptTemplate(
    input_variables=["topic"],
    template="为主题'{topic}'创作一个3章的故事大纲"
)
outline_chain = LLMChain(
    llm=chat,
    prompt=outline_prompt,
    output_key="outline"
)

# Chain 2: 根据大纲写第一章
chapter_prompt = PromptTemplate(
    input_variables=["outline"],
    template="根据以下大纲写第一章（500字）：\n{outline}"
)
chapter_chain = LLMChain(
    llm=chat,
    prompt=chapter_prompt,
    output_key="chapter"
)

# Chain 3: 为章节起标题
title_prompt = PromptTemplate(
    input_variables=["chapter"],
    template="为以下章节起一个吸引人的标题：\n{chapter}"
)
title_chain = LLMChain(
    llm=chat,
    prompt=title_prompt,
    output_key="title"
)

# 组合成顺序链
overall_chain = SequentialChain(
    chains=[outline_chain, chapter_chain, title_chain],
    input_variables=["topic"],
    output_variables=["outline", "chapter", "title"]
)

# 执行
result = overall_chain.invoke({"topic": "时间旅行"})
print(f"大纲：\n{result['outline']}\n")
print(f"第一章：\n{result['chapter']}\n")
print(f"标题：{result['title']}")
```

### 使用LCEL（LangChain Expression Language）

LCEL是LangChain推荐的新语法，更简洁优雅。

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 使用管道操作符 |
prompt = ChatPromptTemplate.from_messages([
    ("human", "讲一个关于{topic}的故事")
])

# 创建链：prompt | model | parser
chain = prompt | chat | StrOutputParser()

# 调用
result = chain.invoke({"topic": "勇敢的小兔子"})
print(result)
```

#### 复杂的LCEL链

```python
# 链式调用多个组件
from langchain_core.runnables import RunnablePassthrough

# 1. 准备数据
def prepare_data(inputs):
    topic = inputs["topic"]
    return {
        "topic": topic,
        "style": inputs.get("style", "幽默"),
        "length": inputs.get("length", "short")
    }

# 2. 创建提示词
prompt = ChatPromptTemplate.from_template(
    "用{style}的风格写一个{length}的故事，主题是{topic}"
)

# 3. 构建链
chain = (
    RunnablePassthrough.assign(
        style=lambda x: x.get("style", "幽默"),
        length=lambda x: x.get("length", "short")
    )
    | prompt
    | chat
    | StrOutputParser()
)

# 调用
result = chain.invoke({
    "topic": "AI学习",
    "style": "励志",
    "length": "long"
})
```

### Router Chain：路由链

根据输入内容动态选择不同的处理链。

```python
from langchain.chains import RouterChain
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# 定义多个处理链
# Chain 1: 代码相关
code_prompt = PromptTemplate(
    template="你是一个编程专家。{input}",
    input_variables=["input"]
)
code_chain = LLMChain(llm=chat, prompt=code_prompt)

# Chain 2: 文本相关
text_prompt = PromptTemplate(
    template="你是一个写作助手。{input}",
    input_variables=["input"]
)
text_chain = LLMChain(llm=chat, prompt=text_prompt)

# Chain 3: 通用
general_prompt = PromptTemplate(
    template="你是AI助手。{input}",
    input_variables=["input"]
)
general_chain = LLMChain(llm=chat, prompt=general_prompt)

# 路由逻辑
from langchain.chains.router import MultiPromptChain
from langchain.chains.router.llm_router import LLMRouterChain, RouterOutputParser
from langchain.chains.router.multi_prompt_prompt import MULTI_PROMPT_ROUTER_TEMPLATE

# 定义路由的目标和描述
destinations = [
    "code: 编程和代码相关问题",
    "text: 写作和文本相关问题",
    "general: 其他通用问题"
]

# 创建路由提示词
router_template = MULTI_PROMPT_ROUTER_TEMPLATE.format(
    destinations=destinations
)
router_prompt = PromptTemplate(
    template=router_template,
    input_variables=["input"],
    output_parser=RouterOutputParser()
)

# 创建路由链
router_chain = LLMRouterChain.from_llm(
    chat,
    router_prompt
)

# 组合
chain = MultiPromptChain(
    router_chain=router_chain,
    destination_chains={
        "code": code_chain,
        "text": text_chain,
        "general": general_chain
    },
    default_chain=general_chain
)

# 使用
result = chain.run("如何在Python中实现快速排序？")
# 会自动路由到code链
```

**2024-2026更新：使用RunnableLambda实现更灵活的路由**

```python
from langchain_core.runnables import RunnableLambda

# 定义路由函数
def route_func(inputs):
    query = inputs["input"].lower()
    if "代码" in query or "编程" in query:
        return "code"
    elif "文章" in query or "文案" in query:
        return "text"
    else:
        return "general"

# 创建路由链
from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: "代码" in x["input"], code_chain),
    (lambda x: "文本" in x["input"], text_chain),
    general_chain
)

# 使用LCEL语法
chain = branch
result = chain.invoke({"input": "写Python代码实现快速排序"})
```

---

## Memory：记忆管理

Memory组件让AI能够记住对话历史，实现多轮对话。

### ConversationBufferMemory：缓冲记忆

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# 创建记忆
memory = ConversationBufferMemory()

# 创建对话链
conversation = ConversationChain(
    llm=chat,
    memory=memory,
    verbose=True  # 打印详细信息
)

# 第一次对话
response1 = conversation.predict(input="我叫小明")
print(response1)
# AI: 你好小明！很高兴认识你。

# 第二次对话（AI记住了名字）
response2 = conversation.predict(input="我叫什么名字？")
print(response2)
# AI: 你叫小明。

# 查看记忆历史
print(memory.load_memory_variables({}))
# {'history': 'Human: 我叫小明\nAI: 你好小明！...'}
```

### ConversationBufferWindowMemory：窗口记忆

只保存最近N轮对话，节省Token。

```python
from langchain.memory import ConversationBufferWindowMemory

# 只保存最近3轮对话
memory = ConversationBufferWindowMemory(k=3)

conversation = ConversationChain(
    llm=chat,
    memory=memory
)

# 进行多轮对话
conversation.predict(input="我喜欢Python")
conversation.predict(input="我也喜欢JavaScript")
conversation.predict(input="我最喜欢Rust")
conversation.predict(input="我喜欢什么语言？")
# AI记得最近3轮的对话，但不记得更早的内容
```

### ConversationSummaryMemory：摘要记忆

对长对话进行摘要，节省Token。

```python
from langchain.memory import ConversationSummaryMemory

# 创建摘要记忆
memory = ConversationSummaryMemory(llm=chat)

conversation = ConversationChain(
    llm=chat,
    memory=memory,
    verbose=True
)

# 进行多轮对话
conversation.predict(input="我是小明，是一名程序员")
conversation.predict(input="我主要用Python开发")
conversation.predict(input="我在杭州工作")

# 查看摘要
print(memory.load_memory_variables({}))
# 类似：'summary': 'The human introduces themselves as Xiao Ming...'
```

### 在LCEL中使用Memory

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

# 创建包含历史消息的提示词
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个友好的AI助手。"),
    MessagesPlaceholder(variable_name="history"),  # 历史消息占位符
    ("human", "{input}")
])

# 创建链
chain = prompt | chat

# 初始化历史
history = []

# 第一轮
inputs = {"input": "你好", "history": history}
response = chain.invoke(inputs)
print(response.content)

# 保存到历史
history.append(HumanMessage(content="你好"))
history.append(AIMessage(content=response.content))

# 第二轮
inputs = {"input": "我叫什么？", "history": history}
response = chain.invoke(inputs)
# AI可以引用之前的对话
```

### 实用的记忆管理技巧

```python
# 1. 保存和加载记忆
import json

# 保存
memory_dict = memory.save_context(
    {"input": "用户输入"},
    {"output": "AI回复"}
)
with open("memory.json", "w") as f:
    json.dump(memory.load_memory_variables({}), f)

# 加载
with open("memory.json") as f:
    saved_memory = json.load(f)
    memory = ConversationBufferMemory()
    memory.chat_memory.add_user_message(saved_memory['history'])

# 2. 清空记忆
memory.clear()

# 3. 获取Token使用量
from langchain.callbacks import get_openai_callback

with get_openai_callback() as cb:
    response = conversation.predict(input="你好")
    print(f"Total Tokens: {cb.total_tokens}")
    print(f"Total Cost: ${cb.total_cost}")
```

---

## 综合实战：智能问答系统

让我们将所学知识整合起来，构建一个智能问答系统。

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from config import Config

class SmartQA:
    """智能问答系统"""

    def __init__(self):
        # 初始化模型
        self.llm = ChatOpenAI(
            model=Config.MODEL_NAME,
            api_key=Config.OPENAI_API_KEY,
            temperature=0.7
        )

        # 创建提示词模板
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一个专业的AI助手，名叫小徐。

你的特点：
- 回答准确专业
- 使用emoji增加亲和力
- 重要内容用列表呈现
- 不确定的问题会诚实告知"""),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}")
        ])

        # 创建记忆
        self.memory = ConversationBufferMemory(
            return_messages=True,
            memory_key="history"
        )

        # 创建链
        self.chain = self.prompt | self.llm | StrOutputParser()

    def ask(self, question: str) -> str:
        """提问"""
        # 获取历史
        history = self.memory.chat_memory.messages

        # 调用链
        response = self.chain.invoke({
            "input": question,
            "history": history
        })

        # 保存到记忆
        self.memory.chat_memory.add_user_message(question)
        self.memory.chat_memory.add_ai_message(response)

        return response

    def chat(self):
        """交互式聊天"""
        print("🤖 智能问答系统（输入'quit'退出）\n")

        while True:
            question = input("\n你：").strip()

            if question.lower() in ['quit', 'exit', '退出']:
                print("小徐：再见！👋")
                break

            if not question:
                continue

            try:
                answer = self.ask(question)
                print(f"小徐：{answer}")
            except Exception as e:
                print(f"❌ 错误：{e}")

# 使用
if __name__ == "__main__":
    qa = SmartQA()
    qa.chat()
```

---

## 最佳实践

### 提示词模板管理

```python
# 创建templates.py
PROMPTS = {
    "code_assistant": ChatPromptTemplate.from_messages([
        ("system", "你是{language}编程专家"),
        ("human", "{question}")
    ]),

    "writer": ChatPromptTemplate.from_messages([
        ("system", "你是专业写手，风格{style}"),
        ("human", "主题：{topic}，字数：{words}")
    ]),

    "analyst": ChatPromptTemplate.from_messages([
        ("system", "你是数据分析师"),
        ("human", "分析以下数据：\n{data}")
    ])
}

# 使用
from templates import PROMPTS

chain = PROMPTS["code_assistant"] | chat | StrOutputParser()
```

### 错误处理和重试

```python
from tenacity import retry, stop_after_attempt, wait_exponential
from langchain_core.exceptions import LangChainException

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def safe_chain_invoke(chain, inputs):
    """带重试的链调用"""
    try:
        return chain.invoke(inputs)
    except LangChainException as e:
        print(f"⚠️ 调用失败: {e}")
        raise
    except Exception as e:
        print(f"❌ 未知错误: {e}")
        raise
```

### 成本优化

```python
# 1. 使用更便宜的模型
fast_llm = ChatOpenAI(model="gpt-3.5-turbo")
smart_llm = ChatOpenAI(model="gpt-4")

# 简单任务用快速模型
simple_chain = fast_llm

# 复杂任务用智能模型
complex_chain = smart_llm

# 2. 缓存结果
from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache

set_llm_cache(InMemoryCache())

# 第一次调用会请求API
chain.invoke("Python是什么？")

# 第二次直接从缓存读取
chain.invoke("Python是什么？")

# 3. 流式输出节省首字节时间
for chunk in chain.stream("讲个故事"):
    print(chunk.content, end="", flush=True)
```

---

## 本章小结

### 核心概念回顾

✅ **LangChain六大模块**：
- Model I/O、Chains、Memory
- Retrieval、Agents、Callbacks

✅ **Model I/O**：
- Models：统一的模型接口
- Prompts：提示词模板
- Output Parsers：结构化输出

✅ **Chains**：
- LLMChain：基础链
- Sequential Chain：顺序链
- Router Chain：路由链
- LCEL：新的链式语法

✅ **Memory**：
- BufferMemory：全部记忆
- WindowMemory：窗口记忆
- SummaryMemory：摘要记忆

### 你已经学会

- ✅ 使用LangChain统一接口调用LLM
- ✅ 创建和管理提示词模板
- ✅ 解析和结构化输出
- ✅ 构建复杂的链式工作流
- ✅ 实现对话记忆管理
- ✅ 构建完整的问答系统

### 下一步

恭喜完成第2章！你已经掌握了LangChain的核心用法。

**在下一章，我们将学习**：
- Prompt Engineering的核心原则
- 高级提示词技巧和模式
- Few-shot Learning
- 提示词优化方法

**准备好了吗？继续！** 🚀

---

## 练习题

### 基础练习

**练习1**：使用LCEL创建一个链，实现：
- 接收用户输入的文本
- 翻译成英文
- 总结英文内容
- 返回中文摘要

**练习2**：创建一个带记忆的"代码解释器"：
- 可以连续对话
- 记住用户提到的代码片段
- 提供逐步解释

**练习3**：实现Router Chain，根据问题类型自动选择：
- 代码问题 → 使用技术专家角色
- 创意问题 → 使用创意写手角色
- 其他 → 使用通用助手角色

### 进阶练习

**挑战1**：构建"学习助手"系统
功能：
- 追踪学习进度
- 根据用户水平调整回答深度
- 生成练习题
- 提供学习建议

**挑战2**：实现"多轮对话文案生成器"
场景：
- 第一轮：了解产品特点
- 第二轮：确定目标受众
- 第三轮：选择文案风格
- 第四轮：生成多个版本

---

## 常见问题 FAQ

### Q1: LangChain 和直接调用 OpenAI API 有什么区别？

**A:**

```python
# 直接调用API的问题
❌ 需要手动管理对话历史
❌ 提示词写死在代码里
❌ 难以串联多个步骤
❌ 没有标准化的组件

# LangChain的优势
✅ 统一的模型接口（切换模型只需改一行代码）
✅ 提示词模板化管理
✅ Chain自动串联多个操作
✅ Memory自动管理对话历史
✅ 丰富的预制组件和集成

# 对比示例
# 直接调用
response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[...]  # 需要手动维护
)

# LangChain
chain = prompt | chat | parser  # 简洁优雅
response = chain.invoke({"topic": "..."})
```

### Q2: LCEL（LangChain Expression Language）是什么？为什么要用？

**A:**

```python
# LCEL是LangChain推荐的新的链式语法
# 特点：
✅ 使用管道操作符 | 连接组件
✅ 代码更简洁易读
✅ 自动支持流式输出
✅ 内置异步支持
✅ 更好的错误处理

# 传统写法（旧版）
from langchain.chains import LLMChain
chain = LLMChain(llm=chat, prompt=prompt)
result = chain.run(topic="Python")

# LCEL写法（推荐）
chain = prompt | chat | StrOutputParser()
result = chain.invoke({"topic": "Python"})

# LCEL的优势在于：
# 1. 声明式，代码即文档
# 2. 组合性强，可以任意连接组件
# 3. 自动优化，性能更好
```

### Q3: 什么时候用 ConversationBufferMemory，什么时候用 ConversationSummaryMemory？

**A:**

```python
✅ ConversationBufferMemory 适合：
- 对话轮次不多（< 10轮）
- 需要记住完整对话内容
- Token预算充足

# 示例场景
- 客服对话（短期）
- 问答系统（会话短）

❌ 不适合：
- 长对话（会超出Token限制）
- 成本敏感的应用

---

✅ ConversationSummaryMemory 适合：
- 对话轮次很多（> 10轮）
- 只需要关键信息，不需要完整对话
- 想节省Token成本

# 示例场景
- 长期学习助手
- 健康咨询（需要记住历史但不需要逐字记录）

❌ 不适合：
- 需要精确引用之前的对话
- 对话细节很重要

---

✅ ConversationBufferWindowMemory 适合：
- 只关心最近几轮对话
- 对话很长但历史不重要
- 平衡记忆和成本

# 示例场景
- 实时聊天机器人
- 短期任务助手
```

### Q4: 如何在 Chain 中传递多个变量？

**A:**

```python
# 方法1：使用字典传递多个变量
prompt = ChatPromptTemplate.from_template(
    "你是{role}，用{style}的风格解释{topic}"
)

chain = prompt | chat | StrOutputParser()

result = chain.invoke({
    "role": "Python专家",
    "style": "幽默",
    "topic": "装饰器"
})

# 方法2：使用RunnablePassthrough处理
from langchain_core.runnables import RunnablePassthrough

chain = (
    RunnablePassthrough.assign(
        style=lambda x: x.get("style", "专业"),
        role=lambda x: x.get("role", "助手")
    )
    | prompt
    | chat
    | StrOutputParser()
)

# 方法3：使用部分变量（partial_variables）
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是{role}助手"),
    ("human", "{input}")
])

# 预设role
prompt_partial = prompt.partial(role="Python")

# 使用时只需传input
chain = prompt_partial | chat
result = chain.invoke({"input": "什么是装饰器？"})
```

### Q5: OutputParser 有哪些类型？如何选择？

**A:**

```python
# 1. StrOutputParser - 最简单
from langchain_core.output_parsers import StrOutputParser

chain = chat | StrOutputParser()
# 适用：只需要纯文本输出

# 2. JsonOutputParser - JSON格式
from langchain_core.output_parsers import JsonOutputParser

chain = prompt | chat | JsonOutputParser()
# 适用：需要结构化数据，但不需要类型验证

# 3. PydanticOutputParser - 推荐！
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel

class Response(BaseModel):
    summary: str
    score: int

parser = PydanticOutputParser(pydantic_object=Response)
chain = prompt | chat | parser
# 适用：
# - 需要严格的数据类型验证
# - 需要自动生成JSON Schema
# - 需要更好的错误提示

# 4. CommaSeparatedListOutputParser
from langchain_core.output_parsers import CommaSeparatedListOutputParser

parser = CommaSeparatedListOutputParser()
chain = prompt | chat | parser
# 适用：需要列表输出（如：苹果,香蕉,橙子）

# 选择建议：
# 简单文本 → StrOutputParser
# 简单JSON → JsonOutputParser
# 生产环境 → PydanticOutputParser（类型安全）
# 列表数据 → CommaSeparatedListOutputParser
```

### Q6: 如何实现条件分支的 Chain？

**A:**

```python
from langchain_core.runnables import RunnableBranch

# 定义不同的分支
code_chain = ChatPromptTemplate.from_template("写{language}代码：{input}") | chat
text_chain = ChatPromptTemplate.from_template("写文本：{input}") | chat
general_chain = ChatPromptTemplate.from_template("回答：{input}") | chat

# 定义路由逻辑
branch = RunnableBranch(
    (lambda x: "代码" in x["input"], code_chain),
    (lambda x: "文本" in x["input"], text_chain),
    general_chain  # 默认分支
)

# 使用
result = branch.invoke({"input": "写Python代码实现快速排序"})
# 会路由到code_chain

# 或者使用自定义路由函数
def route_func(inputs):
    query = inputs["input"].lower()
    if "代码" in query or "编程" in query:
        return "code"
    elif "文章" in query or "文案" in query:
        return "text"
    else:
        return "general"

# 结合RunnableLambda
from langchain_core.runnables import RunnableLambda

router = RunnableLambda(route_func).bind(
    code=code_chain,
    text=text_chain,
    general=general_chain
)
```

### Q7: 如何调试 Chain？看到中间步骤？

**A:**

```python
# 方法1：使用verbose=True
from langchain.chains import ConversationChain

conversation = ConversationChain(
    llm=chat,
    memory=memory,
    verbose=True  # 打印详细日志
)

# 方法2：使用回调函数
from langchain.callbacks import StdOutCallbackHandler

handler = StdOutCallbackHandler()
response = chain.invoke(
    {"input": "你好"},
    config={"callbacks": [handler]}
)

# 方法3：使用RunnablePassthrough查看中间值
from langchain_core.runnables import RunnablePassthrough

debug_chain = (
    RunnablePassthrough.assign(
        prompt_content=lambda x: print(f"📝 Prompt: {x}")
    )
    | prompt
    | RunnablePassthrough.assign(
        llm_output=lambda x: print(f"🤖 LLM Output: {x}")
    )
    | StrOutputParser()
)

# 方法4：使用debug全局调试
from langchain.globals import debug

debug = True  # 开启全局调试
result = chain.invoke({"input": "测试"})
debug = False  # 关闭调试

# 方法5：使用get_graph()可视化
chain.get_graph().print_ascii()
# 会打印出Chain的结构图
```

### Q8: Memory 会占用很多 Token 吗？如何优化？

**A:**

```python
# 问题：Memory会累积历史，导致Token越来越多

✅ 优化策略：

# 1. 使用WindowMemory限制长度
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(k=3)
# 只保留最近3轮对话

# 2. 使用SummaryMemory压缩历史
from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(llm=chat, max_token_limit=500)
# 超过500 token就自动摘要

# 3. 结合使用
from langchain.memory import CombinedMemory

buffer_memory = ConversationBufferWindowMemory(k=2)
summary_memory = ConversationSummaryMemory(llm=chat)

memory = CombinedMemory(
    memories=[buffer_memory, summary_memory]
)

# 4. 定期清理
# 保存重要信息到自定义存储
def compress_memory(memory):
    # 提取关键信息
    history = memory.load_memory_variables({})
    # 存储到数据库/文件
    save_to_db(history)
    # 清空Memory
    memory.clear()

# 5. 使用TokenBuffer自动限制
from langchain.memory import ConversationTokenBufferMemory

memory = ConversationTokenBufferMemory(
    llm=chat,
    max_token_limit=1000  # 超过1000就自动删除旧内容
)

# 选择建议：
- 短对话 → BufferMemory
- 长对话 → SummaryMemory 或 WindowMemory
- 成本敏感 → TokenBuffer 或定期清理
```

### Q9: 如何处理 API 调用失败的情况？

**A:**

```python
# 方法1：使用tenacity自动重试
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),  # 最多重试3次
    wait=wait_exponential(min=1, max=10)  # 指数退避
)
def invoke_with_retry(chain, inputs):
    return chain.invoke(inputs)

# 方法2：使用try-except包裹
def safe_invoke(chain, inputs, fallback="抱歉，我遇到了问题"):
    try:
        return chain.invoke(inputs)
    except Exception as e:
        print(f"错误：{e}")
        return fallback

# 方法3：使用RunnableParallel的fallback
from langchain_core.runnables import RunnableParallel

chain_with_fallback = (
    prompt | chat
).with_fallbacks(
    [backup_llm],  # 备用模型
    exceptions_to_handle=(Exception,)
)

# 方法4：使用回调监控错误
from langchain.callbacks import BaseCallbackHandler

class ErrorHandler(BaseCallbackHandler):
    def on_llm_error(self, error, **kwargs):
        print(f"LLM错误: {error}")
        # 记录日志、发送通知等

chain.invoke(
    {"input": "测试"},
    config={"callbacks": [ErrorHandler()]}
)
```

### Q10: LangChain 和 LlamaIndex 有什么区别？如何选择？

**A:**

```python
LangChain vs LlamaIndex 对比：

┌─────────────┬──────────────────┬──────────────────┐
│   特性      │   LangChain      │   LlamaIndex     │
├─────────────┼──────────────────┼──────────────────┤
│ 定位        │ 全能LLM应用框架  │ 专注于RAG/数据索引│
│ 擅长        │ Agent/Chain      │ 文档检索/问答    │
│ 学习曲线    │ 中等             │ 较低             │
│ 灵活性      │ 很高             │ 中等             │
│ 文档质量    │ 优秀             │ 优秀             │
│ 社区        │ 庞大             │ 活跃             │
└─────────────┴──────────────────┴──────────────────┘

✅ 使用 LangChain 的场景：
- 需要构建Agent
- 复杂的工作流（多步Chain）
- 需要多种工具集成
- 需要灵活控制
- 企业级应用

示例：
- AI客服系统
- 代码生成工具
- 自动化Agent

✅ 使用 LlamaIndex 的场景：
- 专注于文档问答（RAG）
- 数据索引和检索
- 知识库构建
- 快速原型开发

示例：
- 技术文档问答
- 企业知识库
- 论文检索系统

✅ 同时使用两者：
# LangChain处理Agent逻辑
# LlamaIndex处理数据检索

from llama_index import VectorStoreIndex
from langchain.agents import AgentExecutor

# 用LlamaIndex构建索引
index = VectorStoreIndex.from_documents(docs)

# 用LangChain构建Agent
agent = AgentExecutor(
    agent=agent,
    tools=[index.as_tool()]
)
```

---

## 学习清单

检查你掌握了以下技能：

### 基础概念 ✅

- [ ] 理解LangChain的六大核心模块
- [ ] 知道LangChain解决了哪些问题
- [ ] 能够安装和配置LangChain环境
- [ ] 理解Model I/O、Chains、Memory的作用

### Model I/O ✅

- [ ] 会使用ChatOpenAI调用模型
- [ ] 理解不同Message类型的作用
- [ ] 会创建ChatPromptTemplate模板
- [ ] 会使用PromptTemplate管理提示词
- [ ] 会使用StrOutputParser解析文本
- [ ] 会使用JsonOutputParser解析JSON
- [ ] 会使用PydanticOutputParser进行类型安全解析

### Chains ✅

- [ ] 理解Chain的概念和作用
- [ ] 会创建LLMChain基础链
- [ ] 会使用SequentialChain串联多个步骤
- [ ] 理解并会使用LCEL语法（| 操作符）
- [ ] 会使用RunnablePassthrough处理数据
- [ ] 会创建RouterChain实现条件分支
- [ ] 能够构建复杂的Chain工作流

### Memory ✅

- [ ] 理解Memory的必要性
- [ ] 会使用ConversationBufferMemory保存完整对话
- [ ] 会使用ConversationBufferWindowMemory限制长度
- [ ] 会使用ConversationSummaryMemory压缩历史
- [ ] 知道不同Memory类型的适用场景
- [ ] 会在LCEL中使用Memory
- [ ] 会保存和加载Memory

### 实战能力 ✅

- [ ] 能够独立构建智能问答系统
- [ ] 能够实现多轮对话
- [ ] 能够处理API调用失败
- [ ] 知道如何调试Chain
- [ ] 理解Token成本优化方法
- [ ] 能够设计合理的提示词模板

### 最佳实践 ✅

- [ ] 知道如何组织提示词模板
- [ ] 理解错误处理和重试策略
- [ ] 会使用缓存优化成本
- [ ] 知道如何选择合适的模型
- [ ] 理解LCEL vs 传统Chain的区别
- [ ] 能够阅读和理解LangChain文档

---

## 拓展练习

### 练习1：构建多角色对话系统

**要求**：
- 实现3个不同性格的AI角色
- 用户可以选择与哪个角色对话
- 每个角色有独立的Memory
- 角色之间可以相互引用

```python
# 提示：
# 1. 为每个角色创建独立的Chain和Memory
# 2. 使用RouterChain根据用户选择路由
# 3. 在提示词中定义角色特点
```

### 练习2：实现带知识库的问答系统

**要求**：
- 维护一个知识字典（如：课程信息、FAQ）
- 用户提问时先查知识库
- 知识库没有答案再用LLM回答
- 记录所有问答历史

```python
# 提示：
# 1. 使用RouterChain实现逻辑分支
# 2. 第一个分支：查知识库
# 3. 第二个分支：LLM回答
# 4. 使用Memory保存历史
```

### 练习3：构建代码审查助手

**要求**：
- 接收代码和问题描述
- 逐步分析代码问题
- 给出修改建议和示例
- 支持多轮对话追问

```python
# 提示：
# 1. 使用SequentialChain分步骤分析
# 2. 步骤1：理解代码结构
# 3. 步骤2：识别问题
# 4. 步骤3：生成建议
# 5. 使用Memory支持追问
```

### 练习4：实现多语言翻译系统

**要求**：
- 支持中英日韩四种语言互译
- 自动检测源语言
- 保持上下文一致性
- 可以调整翻译风格（正式/口语）

```python
# 提示：
# 1. 使用RouterChain根据目标语言选择
# 2. 提示词中定义语言特征
# 3. 使用Memory保持翻译上下文
# 4. 添加风格参数
```

### 练习5：构建学习进度追踪系统

**要求**：
- 记录用户学习过的主题
- 根据历史调整回答深度
- 生成个性化的学习建议
- 提供相关练习题

```python
# 提示：
# 1. 使用SummaryMemory总结学习内容
# 2. 在提示词中注入学习历史
# 3. 根据用户水平调整提示词
# 4. 使用Chain生成练习题
```

---

## 进阶学习方向

恭喜你完成 LangChain 基础学习！接下来可以：

### 1. 深入 LangChain

**RAG（检索增强生成）**：
- Document Loaders：加载各种文档
- Text Splitters：智能分割文本
- Vector Stores：向量数据库
- Retrievers：检索器

**Agents（智能代理）**：
- Tools：自定义工具
- Agent Types：ReAct、Self-Ask
- Agent Executors：执行器
- 计划和推理

**LangChain 生态**：
- LangServe：部署服务
- LangSmith：调试和监控
- Templates：预制模板

### 2. 实践项目

```bash
✅ 动手实践：
1. 构建个人知识库问答系统
2. 开发AI客服机器人
3. 创建代码助手Agent
4. 实现文档分析工具
5. 开发自动化工作流
```

### 3. 学习资源

- **LangChain 官方文档**：https://python.langchain.com
- **LangChain GitHub**：https://github.com/langchain-ai/langchain
- **LangSmith**：https://smith.langchain.com（调试平台）
- **示例项目**：https://github.com/langchain-ai/langchain/tree/master/cookbook

### 4. 社区和资讯

- **Discord 社区**：加入 LangChain Discord
- **Twitter**：关注 @langchainai
- **中文社区**：微信公众号、知乎专栏
- **实战案例**：学习开源项目

### 5. 最佳实践

```python
✅ 开发建议：
1. 从简单开始，逐步增加复杂度
2. 重视提示词设计
3. 使用 Memory 管理对话
4. 善用 LCEL 简化代码
5. 注意 Token 成本优化
6. 做好错误处理
7. 使用 LangSmith 调试
8. 编写测试保证质量
```

**下一章预告**：Prompt Engineering - 掌握提示词的高级技巧！

---

## 2024-2026新增：LangGraph基础

### 什么是LangGraph？

**LangGraph** 是LangChain官方在2024年推出的新库，专门用于构建**有状态的、多步骤的Agent应用**。

```
LangChain vs LangGraph：

┌─────────────┬──────────────────┬──────────────────┐
│   特性      │   LangChain      │   LangGraph      │
├─────────────┼──────────────────┼──────────────────┤
│ 适用场景    │ 线性/简单工作流  │ 复杂状态机      │
│ 状态管理    │ 手动            │ 内置状态管理     │
│ 循环/分支   │ 困难            │ 原生支持         │
│ Agent编排   │ 基础Agent       │ Multi-Agent系统  │
│ 可视化      │ 无              │ 自动生成图       │
│ 学习曲线    │ 低              │ 中等             │
└─────────────┴──────────────────┴──────────────────┘
```

### 快速开始

```python
# 安装 LangGraph
pip install langgraph==0.2.0

# 简单示例：状态图
from langgraph.graph import StateGraph, END
from typing import TypedDict

# 1. 定义状态
class GraphState(TypedDict):
    input: str
    intermediate: str
    output: str

# 2. 定义节点函数
def node_a(state: GraphState) -> GraphState:
    """节点A：处理输入"""
    return {
        **state,
        "intermediate": f"处理过: {state['input']}"
    }

def node_b(state: GraphState) -> GraphState:
    """节点B：生成输出"""
    return {
        **state,
        "output": f"最终结果: {state['intermediate']}"
    }

# 3. 构建图
workflow = StateGraph(GraphState)

# 添加节点
workflow.add_node("process", node_a)
workflow.add_node("finalize", node_b)

# 添加边
workflow.set_entry_point("process")
workflow.add_edge("process", "finalize")
workflow.add_edge("finalize", END)

# 4. 编译图
app = workflow.compile()

# 5. 运行
result = app.invoke({"input": "Hello LangGraph"})
print(result)
# {'input': 'Hello LangGraph', 'intermediate': '处理过: Hello LangGraph', 'output': '最终结果: 处理过: Hello LangGraph'}
```

### LangGraph vs 传统Chain

```python
# 传统Chain - 线性流程
chain = (
    prompt
    | llm
    | parser
)
result = chain.invoke(input)

# LangGraph - 复杂状态流程
workflow = StateGraph(State)
workflow.add_node("step1", step1_func)
workflow.add_node("step2", step2_func)
workflow.add_conditional_edges(
    "step1",
    should_continue,  # 条件函数
    {
        "continue": "step2",
        "end": END
    }
)
app = workflow.compile()
result = app.invoke(initial_state)
```

**什么时候用LangGraph？**
- ✅ 需要循环和条件分支
- ✅ 多Agent协作
- ✅ 需要维护复杂状态
- ✅ 需要可视化和调试工作流

**更多LangGraph内容见 [Chapter 05: AI Agent](chapter-05)**

---

**遇到问题？**
- 查看代码示例：`examples/` 目录
- 参考官方文档：https://python.langchain.com
- LangGraph文档：https://langchain-ai.github.io/langgraph
- 发邮件求助：esimonx@163.com

**下一章：[Prompt Engineering →](chapter-03)**
