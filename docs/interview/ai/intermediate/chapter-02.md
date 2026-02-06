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

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
