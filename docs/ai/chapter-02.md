# 第2章：LangChain框架入门

## 本章导读

在第1章中，我们学习了如何直接调用OpenAI API构建简单的AI应用。但随着应用变得复杂，直接使用API会遇到很多挑战：如何管理对话历史？如何串联多个步骤？如何集成外部数据？

**LangChain** 是目前最流行的LLM应用开发框架，它为我们提供了一套完整的工具链，大大简化了LLM应用的开发。

**学习目标**：
- 理解LangChain的核心概念和架构
- 掌握Model I/O：模型、提示词、输出解析
- 学习Chains：串联多个操作
- 实现Memory：对话记忆管理

**预计学习时间**：60分钟

---

## 2.1 什么是LangChain？

### 2.1.1 LangChain简介

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

### 2.1.2 LangChain的六大核心模块

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

### 2.1.3 安装LangChain

```bash
# 核心包
pip install langchain

# OpenAI集成
pip install langchain-openai

# 其他常用包
pip install langchain-community  # 社区扩展
pip install chromadb              # 向量数据库
pip install faiss-cpu             # 向量搜索

# 完整依赖
pip install langchain langchain-openai langchain-community chromadb
```

---

## 2.2 Model I/O：模型输入输出

Model I/O是LangChain最基础的模块，包含三个核心组件：
- **Models**：与大语言模型交互
- **Prompts**：管理提示词
- **Output Parsers**：解析模型输出

### 2.2.1 Models：模型接口

LangChain提供了统一的模型接口，支持多种模型：

```python
from langchain_openai import ChatOpenAI
from langchain_openai import OpenAI
from config import Config

# 1. Chat模型（推荐）
chat = ChatOpenAI(
    model="gpt-3.5-turbo",
    api_key=Config.OPENAI_API_KEY,
    temperature=0.7,
    max_tokens=1000
)

# 2. Completion模型（旧版）
llm = OpenAI(
    model="gpt-3.5-turbo-instruct",
    api_key=Config.OPENAI_API_KEY
)

# 使用示例
message = "你好，请介绍一下你自己"
response = chat.invoke(message)
print(response.content)  # AI的回复
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

### 2.2.2 Prompts：提示词模板

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

### 2.2.3 Output Parsers：输出解析器

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

## 2.3 Chains：链式调用

Chains允许你将多个组件串联起来，构建复杂的工作流。

### 2.3.1 LLMChain：最基本的链

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

### 2.3.2 Sequential Chain：顺序链

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

### 2.3.3 使用LCEL（LangChain Expression Language）

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

### 2.3.4 Router Chain：路由链

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

---

## 2.4 Memory：记忆管理

Memory组件让AI能够记住对话历史，实现多轮对话。

### 2.4.1 ConversationBufferMemory：缓冲记忆

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

### 2.4.2 ConversationBufferWindowMemory：窗口记忆

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

### 2.4.3 ConversationSummaryMemory：摘要记忆

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

### 2.4.4 在LCEL中使用Memory

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

### 2.4.5 实用的记忆管理技巧

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

## 2.5 综合实战：智能问答系统

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

## 2.6 最佳实践

### 2.6.1 提示词模板管理

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

### 2.6.2 错误处理和重试

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

### 2.6.3 成本优化

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

## 2.7 本章小结

### 2.7.1 核心概念回顾

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

### 2.7.2 你已经学会

- ✅ 使用LangChain统一接口调用LLM
- ✅ 创建和管理提示词模板
- ✅ 解析和结构化输出
- ✅ 构建复杂的链式工作流
- ✅ 实现对话记忆管理
- ✅ 构建完整的问答系统

### 2.7.3 下一步

恭喜完成第2章！你已经掌握了LangChain的核心用法。

**在下一章，我们将学习**：
- Prompt Engineering的核心原则
- 高级提示词技巧和模式
- Few-shot Learning
- 提示词优化方法

**准备好了吗？继续！** 🚀

---

## 2.8 练习题

### 2.8.1 基础练习

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

### 2.8.2 进阶练习

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

**遇到问题？**
- 查看代码示例：`examples/` 目录
- 参考官方文档：https://python.langchain.com
- 发邮件求助：esimonx@163.com

**下一章：[Prompt Engineering →](chapter-03)**
