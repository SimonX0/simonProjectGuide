---
title: AI应用开发面试题
---

# AI应用开发面试题

## LangChain框架

### 什么是LangChain？核心组件有哪些？

LangChain是一个用于开发由语言模型驱动的应用程序的框架。

**核心组件**：

1. **Models（模型）**：与大语言模型交互的接口
2. **Prompts（提示）**：管理模型输入
3. **Chains（链）**：将多个组件串联
4. **Agents（代理）**：使用LLM决定行动
5. **Memory（记忆）**：跨调用持久化状态
6. **Tools（工具）**：代理可执行的操作
7. **Retrievers（检索器）**：获取外部数据

### 如何使用LangChain构建链？

```python
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# 1. 初始化模型
llm = OpenAI(temperature=0.9)

# 2. 创建提示模板
template = "请给我一个关于{topic}的{adjective}创意。"
prompt = PromptTemplate(
    input_variables=["topic", "adjective"],
    template=template
)

# 3. 创建链
chain = LLMChain(llm=llm, prompt=prompt)

# 4. 执行
result = chain.run(topic="人工智能", adjective="有趣")
print(result)
```

### 什么是LangChain的Memory？

Memory让LLM能够记住之前的对话内容。

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# 缓冲记忆 - 保存所有对话
memory = ConversationBufferMemory()

conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

conversation.predict(input="我叫小明")
conversation.predict(input="我叫什么名字？")

# 摘要记忆 - 只保存摘要
from langchain.memory import ConversationSummaryMemory
summary_memory = ConversationSummaryMemory(llm=llm)

# Token窗口记忆 - 限制token数量
from langchain.memory import ConversationTokenBufferMemory
token_memory = ConversationTokenBufferMemory(
    llm=llm,
    max_token_limit=100
)
```

## AI工具集成

### 如何集成向量数据库？

```python
from langchain.vectorstores import Chroma, FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 1. 加载文档
loader = TextLoader('./documents.txt')
documents = loader.load()

# 2. 分割文本
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
splits = text_splitter.split_documents(documents)

# 3. 创建向量存储
# 使用Chroma
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=OpenAIEmbeddings()
)

# 使用FAISS
faiss_index = FAISS.from_documents(
    documents=splits,
    embedding=OpenAIEmbeddings()
)

# 4. 相似性搜索
query = "什么是机器学习？"
docs = vectorstore.similarity_search(query, k=3)

# 5. 创建检索器
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)
```

### 如何构建RAG应用？

```python
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI

# 创建检索QA链
qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(temperature=0),
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)

# 查询
query = "解释一下深度学习"
result = qa_chain({"query": query})

print(result["result"])
print("来源文档：", result["source_documents"])
```

### 什么是LangChain Expression Language (LCEL)？

LCEL是LangChain的新声明式方式，用于构建链。

```python
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser

# 使用LCEL构建链
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有帮助的助手。"),
    ("user", "{input}")
])

model = ChatOpenAI(model="gpt-4")

output_parser = StrOutputParser()

# 使用管道操作符 |
chain = prompt | model | output_parser

# 调用
result = chain.invoke({"input": "你好！"})
```

## AI应用场景

### 如何实现智能客服机器人？

```python
from langchain.agents import initialize_agent, Tool, AgentType
from langchain.tools import StructuredTool

# 定义工具
def get_order_status(order_id: str) -> str:
    """查询订单状态"""
    # 实际业务逻辑
    return f"订单{order_id}已发货"

def search_faq(query: str) -> str:
    """搜索FAQ"""
    # 实际搜索逻辑
    return "您的问题..."

tools = [
    Tool(
        name="QueryOrder",
        func=lambda x: get_order_status(x),
        description="查询订单状态，输入订单号"
    ),
    Tool(
        name="SearchFAQ",
        func=lambda x: search_faq(x),
        description="搜索常见问题"
    )
]

# 初始化代理
agent = initialize_agent(
    tools=tools,
    llm=ChatOpenAI(temperature=0),
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True
)

# 对话
response = agent.run("我的订单12345状态是什么？")
```

### 如何实现文档问答系统？

```python
from langchain.document_loaders import PyPDFLoader
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

# 1. 加载PDF文档
loader = PyPDFLoader("document.pdf")
pages = loader.load()

# 2. 创建向量存储
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
splits = text_splitter.split_documents(pages)
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=OpenAIEmbeddings()
)

# 3. 创建对话式检索链
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

qa = ConversationalRetrievalChain.from_llm(
    llm=ChatOpenAI(model="gpt-4"),
    retriever=vectorstore.as_retriever(),
    memory=memory
)

# 4. 问答
query = "文档讲了什么？"
result = qa({"question": query})
print(result["answer"])
```

### 如何实现代码生成助手？

```python
from langchain.prompts import PromptTemplate

# 代码生成提示模板
code_template = PromptTemplate(
    input_variables=["language", "task", "requirements"],
    template="""
    你是一个编程助手。请根据以下要求生成代码：

    编程语言：{language}
    任务：{task}
    要求：{requirements}

    只输出代码，不要解释。
    """
)

code_chain = LLMChain(
    llm=OpenAI(temperature=0),
    prompt=code_template
)

# 生成代码
result = code_chain.run(
    language="Python",
    task="实现快速排序",
    requirements="包含注释，处理边界情况"
)

print(result)
```

## Prompt优化

### 什么是Few-shot Prompting？

提供少量示例来提高模型性能。

```python
from langchain.prompts.few_shot import FewShotPromptTemplate
from langchain.prompts.prompt import PromptTemplate

# 示例
examples = [
    {
        "question": "3+5等于几？",
        "answer": "8"
    },
    {
        "question": "10-4等于几？",
        "answer": "6"
    }
]

# 示例模板
example_prompt = PromptTemplate(
    input_variables=["question", "answer"],
    template="问题：{question}\n答案：{answer}"
)

# Few-shot提示模板
few_shot_prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_prompt,
    prefix="以下是数学计算的示例：",
    suffix="问题：{input}\n答案：",
    input_variables=["input"]
)
```

### 如何实现思维链（Chain of Thought）？

```python
# CoT提示模板
cot_prompt = PromptTemplate(
    input_variables=["question"],
    template="""
    请一步步思考这个问题，然后给出最终答案。

    问题：{question}

    让我们一步步思考：
    """
)

# 实例
question = "如果我有3个苹果，吃了1个，又买了5个，现在有几个？"
result = llm(cot_prompt.format(question=question))
```

### 什么是Self-Consistency？

Self-Consistency通过多次采样并选择最一致的答案来提高质量。

```python
def self_consistency(llm, prompt, n=5):
    """自我一致性推理"""
    responses = []
    for _ in range(n):
        response = llm(prompt)
        responses.append(response)

    # 统计最常见的答案
    from collections import Counter
    counter = Counter(responses)
    most_common = counter.most_common(1)[0][0]

    return most_common
```

## API集成

### 如何调用OpenAI API？

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 基础调用
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "你是一个有帮助的助手。"},
        {"role": "user", "content": "你好！"}
    ],
    temperature=0.7,
    max_tokens=1000
)

print(response.choices[0].message.content)

# 流式输出
stream = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "讲个故事"}],
    stream=True
)

for chunk in stream:
    print(chunk.choices[0].delta.content, end="")
```

### 如何处理流式响应？

```python
from langchain.callbacks.base import BaseCallbackHandler

class StreamHandler(BaseCallbackHandler):
    def on_llm_new_token(self, token: str, **kwargs):
        print(token, end="", flush=True)

# 使用流式处理
chain = LLMChain(
    llm=OpenAI(streaming=True),
    prompt=prompt,
    callbacks=[StreamHandler()]
)

chain.run("讲一个故事")
```

### 如何实现函数调用（Function Calling）？

```python
import json
from openai import OpenAI

client = OpenAI()

# 定义函数
functions = [
    {
        "name": "get_weather",
        "description": "获取指定城市的天气",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "城市名称"
                }
            },
            "required": ["city"]
        }
    }
]

# 调用
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"}
    ],
    functions=functions
)

# 解析函数调用
if response.choices[0].message.function_call:
    function_name = response.choices[0].message.function_call.name
    function_args = json.loads(
        response.choices[0].message.function_call.arguments
    )

    # 执行函数
    if function_name == "get_weather":
        result = get_weather(function_args["city"])
        print(result)
```

## 错误处理

### 如何处理API限流和重试？

```python
import time
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def call_llm_with_retry(prompt):
    try:
        response = llm(prompt)
        return response
    except Exception as e:
        print(f"错误: {e}, 正在重试...")
        raise

# 使用
result = call_llm_with_retry("解释什么是机器学习")
```

### 如何监控Token使用量？

```python
from langchain.callbacks import get_openai_callback

with get_openai_callback() as cb:
    result = chain.run("生成一个故事")

    print(f"总Tokens: {cb.total_tokens}")
    print(f"提示Tokens: {cb.prompt_tokens}")
    print(f"完成Tokens: {cb.completion_tokens}")
    print(f"总费用: ${cb.total_cost}")
```

## LangChain v0.2+ 新特性

### LangChain v0.2有哪些重要更新？

**LangChain v0.2+** 带来了许多重要的改进：

| 特性 | 说明 | 影响 |
|------|------|------|
| **LCEL增强** | 更强大的链式组合能力 | 更简洁的代码 |
| **工具调用改进** | 统一的工具调用接口 | 更好的工具集成 |
| **流式处理优化** | 异步流式和Token级别流 | 更好的用户体验 |
| **LangSmith集成** | 内置调试和监控 | 更容易调试 |
| **更好的类型支持** | 完整的TypeScript支持 | 更安全 |

### 如何使用LCEL构建复杂链？

**LangChain Expression Language (LCEL)** 在v0.2中变得更强大：

```python
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.schema.runnable import RunnablePassthrough

# 1. 基础链
prompt = ChatPromptTemplate.from_template(
    "讲一个关于{topic}的{adjective}故事"
)
model = ChatOpenAI(model="gpt-4")
output_parser = StrOutputParser()

# 使用管道操作符
chain = prompt | model | output_parser
result = chain.invoke({"topic": "AI", "adjective": "有趣的"})

# 2. 带分支的链
from langchain.schema.runnable import RunnableBranch

# 定义分支条件
def route_func(condition):
    if "search" in condition.lower():
        return search_chain
    else:
        return direct_chain

# 创建分支链
branch = RunnableBranch(
    (lambda x: "search" in x["topic"].lower(), search_chain),
    (lambda x: True, direct_chain)
)

# 3. 并行执行
from langchain.schema.runnable import RunnableMap

# 并行获取多个结果
parallel_chain = RunnableMap({
    "story": prompt | model | output_parser,
    "summary": summary_prompt | model | output_parser
})

result = parallel_chain.invoke({"topic": "AI"})

# 4. 顺序执行
from langchain.schema.runnable import RunnablePassthrough

# 创建处理流程
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | output_parser
)

# 5. 动态路由
from langchain.schema.runnable import RunnableLambda

def classify_input(input_data):
    """根据输入内容分类"""
    if "code" in input_data.lower():
        return "code"
    elif "creative" in input_data.lower():
        return "creative"
    else:
        return "general"

# 使用动态路由
routes = {
    "code": code_chain,
    "creative": creative_chain,
    "general": general_chain
}

router_chain = RunnableLambda(classify_input) | routes
result = router_chain.invoke("写一段Python代码")
```

### LangChain v0.2的工具调用如何使用？

**v0.2改进了工具调用机制**：

```python
from langchain.tools import tool
from langchain_openai import ChatOpenAI
from langchain.schema.messages import HumanMessage, AIMessage, ToolMessage

# 1. 定义工具（使用装饰器）
@tool
def search_weather(query: str) -> str:
    """搜索天气信息"""
    # 实际实现会调用天气API
    return f"今天天气晴朗，温度25°C"

@tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    try:
        result = eval(expression)
        return f"计算结果: {result}"
    except:
        return "计算错误"

# 2. 绑定工具到模型
tools = [search_weather, calculate]
llm = ChatOpenAI(model="gpt-4", temperature=0)
llm_with_tools = llm.bind_tools(tools)

# 3. 使用工具调用
messages = [
    HumanMessage(content="帮我搜索北京的天气")
]

response = llm_with_tools.invoke(messages)

# 4. 处理工具调用结果
if response.tool_calls:
    for tool_call in response.tool_calls:
        # 执行工具
        selected_tool = {tool.name: tool for tool in tools}[tool_call.name]
        tool_output = selected_tool.invoke(tool_call.args)

        # 添加工具消息
        messages.append(AIMessage(content=response.content))
        messages.append(ToolMessage(
            content=str(tool_output),
            tool_call_id=tool_call['id']
        ))

    # 获取最终响应
    final_response = llm_with_tools.invoke(messages)
    print(final_response.content)

# 5. 使用ToolNode自动处理工具调用
from langchain.prebuilt import ToolNode

tools = [search_weather, calculate]
tool_node = ToolNode(tools)

# 创建Agent
from langchain.agents import create_tool_calling_agent
from langchain.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有用的助手"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

agent = create_tool_calling_agent(llm, tools, prompt)

# 6. 异步工具调用
@tool
async def async_search(query: str) -> str:
    """异步搜索"""
    import asyncio
    await asyncio.sleep(1)  # 模拟异步操作
    return f"搜索结果: {query}"

# 异步执行
result = await async_search.ainvoke("搜索内容")
```

### LangChain v0.2的流式处理如何使用？

**改进的流式处理**：

```python
# 1. 基础流式输出
async for chunk in chain.astream({"topic": "AI"}):
    print(chunk.content, end="", flush=True)

# 2. Token级别流式
async for token in llm.astream("讲一个故事"):
    print(token.content, end="")

# 3. 流式处理工具调用
async for event in agent.astream_events(
    {"input": "搜索天气"},
    version="v1"
):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        content = event["data"]["chunk"].content
        if content:
            print(content, end="")

    if kind == "on_tool_start":
        print(f"\n开始执行工具: {event['name']}")

    if kind == "on_tool_end":
        print(f"工具执行完成: {event['data']['output']}")

# 4. 带回调的流式处理
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

llm = ChatOpenAI(
    model="gpt-4",
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

# 5. 自定义流式回调
from langchain.callbacks.base import BaseCallbackHandler

class TokenCounter(BaseCallbackHandler):
    def __init__(self):
        self.token_count = 0

    def on_llm_new_token(self, token: str, **kwargs):
        self.token_count += 1
        print(f"Token #{self.token_count}: {token}")

counter = TokenCounter()
chain.invoke({"input": "hello"}, config={"callbacks": [counter]})
```

### LangSmith调试如何使用？

**LangSmith是LangChain的官方调试平台**：

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-api-key"

# 1. 自动追踪（无需额外代码）
chain.invoke({"topic": "AI"})

# 2. 添加项目名称
chain.invoke(
    {"topic": "AI"},
    config={"run_name": "my_experiment"}
)

# 3. 添加元数据
chain.invoke(
    {"topic": "AI"},
    config={
        "metadata": {
            "experiment_id": "exp_001",
            "user": "test_user"
        }
    }
)

# 4. 添加标签
chain.invoke(
    {"topic": "AI"},
    config={"tags": ["production", "v1"]}
)

# 5. 使用@traceable装饰器
from langsmith import traceable

@traceable(name="custom_function")
def my_function(input_text: str) -> str:
    # 自定义函数会自动被追踪
    return llm.invoke(input_text)

# 6. 批量追踪
results = chain.batch([
    {"topic": "AI"},
    {"topic": "机器学习"},
    {"topic": "深度学习"}
])

# 查看LangSmith控制台查看详细追踪信息
```

### LangChain v0.2的内存管理如何改进？

**改进的内存管理**：

```python
from langchain.memory import (
    ConversationBufferMemory,
    ConversationSummaryMemory,
    ConversationTokenBufferMemory
)
from langchain.chains import ConversationChain

# 1. 增强的对话缓冲记忆
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
    output_key="answer"  # 明确指定输出键
)

# 2. 摘要记忆（自动摘要）
summary_memory = ConversationSummaryMemory(
    llm=ChatOpenAI(model="gpt-4"),
    memory_key="chat_history",
    return_messages=True,
    summary_prompt=ChatPromptTemplate.from_template(
        "总结以下对话：\n{chat_history}"
    )
)

# 3. Token窗口记忆（更精确的控制）
token_memory = ConversationTokenBufferMemory(
    llm=ChatOpenAI(model="gpt-4"),
    max_token_limit=2000,
    memory_key="chat_history",
    return_messages=True
)

# 4. 在LCEL中使用内存
from langchain.schema.runnable import RunnablePassthrough

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有用的助手"),
    ("placeholder", "{chat_history}"),
    ("human", "{input}")
])

chain = (
    RunnablePassthrough.assign(
        chat_history=lambda x: memory.load_memory_variables(x)["chat_history"]
    )
    | prompt
    | llm
    | output_parser
)

# 5. 保存对话到内存
def save_to_memory(input_text, output_text):
    memory.save_context(
        {"input": input_text},
        {"output": output_text}
    )

# 6. 使用Redis持久化内存
from langchain.memory import RedisChatMessageHistory

message_history = RedisChatMessageHistory(
    url="redis://localhost:6379/0",
    session_id="user-123"
)

memory = ConversationBufferMemory(
    chat_memory=message_history,
    return_messages=True
)
```

### LangChain v0.2的检索增强如何使用？

**改进的检索器**：

```python
from langchain.vectorstores import Chroma, FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.retrievers import (
    ContextualCompressionRetriever,
    MultiQueryRetriever,
    EnsembleRetriever
)
from langchain.retrievers.document_compressors import LLMChainExtractor

# 1. 上下文压缩检索器
compressor = LLMChainExtractor.from_llm(ChatOpenAI())
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=retriever
)

# 2. 多查询检索器（自动生成多个查询）
multi_query_retriever = MultiQueryRetriever.from_llm(
    retriever=retriever,
    llm=ChatOpenAI(model="gpt-4")
)

# 3. 集成检索器（结合多个检索器）
from langchain.retrievers import BM25Retriever
from rank_bm25 import BM25Okapi

bm25_retriever = BM25Retriever.from_texts(
    texts=documents,
    k=3
)

ensemble_retriever = EnsembleRetriever(
    retrievers=[vectorstore.as_retriever(), bm25_retriever],
    weights=[0.7, 0.3]
)

# 4. 自相似性检索（最大边际相关性）
from langchain.retrievers import MergerRetriever

mmr_retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 5, "lambda_mult": 0.5}
)

# 5. 相关性得分阈值
threshold_retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={
        "k": 10,
        "score_threshold": 0.7  # 只返回相关性>0.7的文档
    }
)

# 6. 在链中使用高级检索器
rag_chain = (
    {
        "context": ensemble_retriever | format_docs,
        "question": RunnablePassthrough()
    }
    | prompt
    | llm
    | output_parser
)
```

### LangChain v0.2的性能优化技巧？

**性能优化最佳实践**：

```python
# 1. 批处理调用
inputs = [{"topic": f"话题{i}"} for i in range(10)]
results = chain.batch(inputs, config={"max_concurrency": 5})

# 2. 异步调用
results = await chain.abatch([
    {"topic": "AI"},
    {"topic": "ML"}
])

# 3. 使用缓存
from langchain.cache import InMemoryCache, RedisCache
from langchain.globals import set_llm_cache

# 内存缓存
set_llm_cache(InMemoryCache())

# Redis缓存
set_llm_cache(RedisCache(redis_url="redis://localhost:6379/0"))

# 4. 并行执行多个链
from langchain.schema.runnable import RunnableParallel

parallel = RunnableParallel({
    "summary": summary_chain,
    "analysis": analysis_chain,
    "recommendation": recommendation_chain
})

results = parallel.invoke({"content": "文档内容"})

# 5. 懒加载（只在需要时加载）
from langchain.schema.runnable import RunnableLambda

def expensive_operation(input_data):
    # 只在真正需要时执行
    return process_data(input_data)

lazy_chain = RunnableLambda(expensive_operation).with_config(
    run_on_executor=False  # 在主线程执行
)
```

### 如何使用LangChain与LangGraph集成？

**LangGraph是用于构建有状态多参与者应用的新框架**：

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Sequence
from operator import add

# 1. 定义状态
class AgentState(TypedDict):
    messages: Annotated[Sequence[str], add]

# 2. 定义节点
def research_node(state: AgentState):
    # 研究节点
    result = search_tool.invoke(state["messages"][-1])
    return {"messages": [result]}

def writing_node(state: AgentState):
    # 写作节点
    result = llm.invoke("\n".join(state["messages"]))
    return {"messages": [result]}

# 3. 定义条件边
def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if "完成" in last_message:
        return END
    else:
        return "research"

# 4. 构建图
workflow = StateGraph(AgentState)

# 添加节点
workflow.add_node("research", research_node)
workflow.add_node("writing", writing_node)

# 设置入口
workflow.set_entry_point("research")

# 添加边
workflow.add_edge("research", "writing")
workflow.add_conditional_edges(
    "writing",
    should_continue,
    {
        "research": "research",
        END: END
    }
)

# 5. 编译图
app = workflow.compile()

# 6. 执行
result = app.invoke({
    "messages": ["研究量子计算的应用"]
})
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
