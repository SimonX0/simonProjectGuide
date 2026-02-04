# RAG检索增强

## 本章导读

**RAG（Retrieval-Augmented Generation，检索增强生成）** 是目前最热门的AI应用技术之一。它结合了信息检索和文本生成，让AI能够基于你的私有数据回答问题，解决LLM知识过时和幻觉问题。

**学习目标**：
- 理解RAG的原理和应用场景
- 掌握文档加载和分割技术
- 学习Embeddings和向量数据库
- 构建完整的RAG系统

**预计学习时间**：70分钟

---

## 什么是RAG？

### RAG的定义

**RAG（检索增强生成）** 是一种技术框架，通过先从知识库中检索相关文档，然后将检索到的内容作为上下文提供给LLM，从而生成更准确的回答。

```
┌─────────────────────────────────────────────────┐
│              RAG 工作流程                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  用户问题                                       │
│    ↓                                            │
│  ┌──────────────┐                               │
│  │ 1. 检索阶段  │ → 从知识库中查找相关文档       │
│  └──────────────┘                               │
│    ↓                                            │
│  ┌──────────────┐                               │
│  │ 2. 增强阶段  │ → 将检索内容作为上下文         │
│  └──────────────┘                               │
│    ↓                                            │
│  ┌──────────────┐                               │
│  │ 3. 生成阶段  │ → LLM基于上下文生成回答        │
│  └──────────────┘                               │
│    ↓                                            │
│  准确的回答 + 引用来源                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 为什么需要RAG？

| 问题 | 纯LLM的局限 | RAG的解决方案 |
|------|-------------|--------------|
| **知识过时** | 训练截止日期后的事件不知道 | 实时更新文档库 |
| **幻觉问题** | 可能编造错误信息 | 基于真实文档回答 |
| **私有数据** | 无法访问企业内部数据 | 集成私有知识库 |
| **可追溯性** | 无法验证答案来源 | 提供引用来源 |
| **专业性** | 通用知识，不够专业 | 领域专用知识库 |

### RAG vs 微调（Fine-tuning）

```
RAG vs Fine-tuning 对比：

RAG：
  ✅ 快速实施（几小时到几天）
  ✅ 无需训练，成本低
  ✅ 易于更新知识
  ✅ 可追溯答案来源
  ✅ 适合知识密集型任务

Fine-tuning：
  ✅ 改变模型的说话方式
  ✅ 学习特定格式
  ✅ 训练成本高
  ❌ 知识更新困难
  ❌ 需要大量训练数据

💡 最佳实践：RAG + Fine-tuning 结合使用
```

### RAG的应用场景

**1. 企业知识库问答**
```python
# 示例：内部文档问答
Q: "公司的报销流程是什么？"
A: "根据《员工手册》第5章：
    1. 填写报销单
    2. 部门经理审批
    3. 财务审核
    4. 3-5个工作日到账
    来源：员工手册_v3.0.pdf, 第23页"
```

**2. 智能客服系统**
```python
# 示例：产品支持
Q: "如何重置路由器？"
A: "根据产品文档：
    步骤1：长按Reset键10秒
    步骤2：等待指示灯闪烁
    步骤3：重新配置网络
    如有问题请联系客服..."
```

**3. 法律文档分析**
```python
# 示例：合同审查
Q: "这份合同有哪些风险点？"
A: "根据合同审查指南：
    发现3个潜在风险：
    1. 第5条：违约责任不明确
    2. 第12条：管辖条款可能不利
    3. ..."
```

**4. 技术文档助手**
```python
# 示例：代码文档问答
Q: "如何在Django中实现JWT认证？"
A: "根据项目文档：
    使用django-rest-framework-simplejwt：
    [代码示例]
    相关文档：api_auth.md"
```

---

## RAG系统架构

### 完整的RAG流程

```
┌────────────────────────────────────────────────────┐
│            RAG系统完整架构                          │
├────────────────────────────────────────────────────┤
│                                                    │
│  准备阶段（一次性）                                │
│  ┌─────────┐      ┌─────────┐    ┌──────────┐    │
│  │ 文档加载 │ →   │ 文本分割 │ →  │ 向量化   │    │
│  │ Loader  │      │Splitter │    │Embeddings│   │
│  └─────────┘      └─────────┘    └──────────┘    │
│                            ↓                      │
│                    ┌─────────────┐                │
│                    │ 向量数据库   │                │
│                    │Vector Store │                │
│                    └─────────────┘                │
│                                                    │
│  运行阶段（每次查询）                              │
│  ┌─────────┐    ┌──────────┐    ┌──────────┐    │
│  │ 用户问题 │ →  │ 问题向量化│ →  │ 相似度检索│   │
│  └─────────┘    └──────────┘    └──────────┘    │
│                                   ↓                │
│                          ┌─────────────┐           │
│                          │ Top-K文档   │           │
│                          └─────────────┘           │
│                                   ↓                │
│  ┌──────────────────────────────────────────┐    │
│  │          Prompt + 检索内容 + 问题         │    │
│  └──────────────────────────────────────────┘    │
│                    ↓                              │
│  ┌──────────┐                                    │
│  │ LLM生成  │ → 回答 + 引用                     │
│  └──────────┘                                    │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 核心组件说明

```python
# 1. Document Loaders - 文档加载器
from langchain.document_loaders import (
    PyPDFLoader,           # PDF文档
    TextLoader,            # 文本文档
    DirectoryLoader,       # 目录加载
    CSVLoader,             # CSV文件
    UnstructuredMarkdownLoader,  # Markdown
    WebBaseLoader          # 网页
)

# 2. Text Splitters - 文本分割器
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,  # 递归分割
    CharacterTextSplitter,           # 字符分割
    TokenTextSplitter,               # Token分割
    MarkdownTextSplitter             # Markdown分割
)

# 3. Embeddings - 向量化
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import (
    HuggingFaceEmbeddings,  # 开源模型
    CohereEmbeddings,
    BedrockEmbeddings
)

# 4. Vector Stores - 向量数据库
from langchain.vectorstores import (
    Chroma,           # 轻量级，推荐
    FAISS,            # Facebook出品
    Pinecone,         # 云服务
    Weaviate          # 开源
)
```

---

## 文档加载（Document Loading）

### 支持的文档类型

LangChain支持100+种文档格式！

| 格式 | Loader | 说明 |
|------|--------|------|
| PDF | `PyPDFLoader` | 最常用 |
| Word | `Docx2txtLoader` | Word文档 |
| TXT | `TextLoader` | 纯文本 |
| Markdown | `UnstructuredMarkdownLoader` | MD文件 |
| HTML | `Bs4HTMLLoader` | 网页 |
| CSV | `CSVLoader` | 表格数据 |
| JSON | `JSONLoader` | JSON数据 |
| 代码 | `PythonLoader` | 源代码 |

### 加载单个文档

```python
from langchain.document_loaders import PyPDFLoader
from langchain.document_loaders import TextLoader

# 加载PDF
pdf_loader = PyPDFLoader("docs/manual.pdf")
pdf_docs = pdf_loader.load()

print(f"加载了 {len(pdf_docs)} 页")
print(f"第一页内容：\n{pdf_docs[0].page_content[:500]}")
print(f"元数据：{pdf_docs[0].metadata}")
# {'source': 'docs/manual.pdf', 'page': 0}

# 加载TXT
txt_loader = TextLoader("docs/guide.txt", encoding='utf-8')
txt_docs = txt_loader.load()
```

### 加载目录

```python
from langchain.document_loaders import DirectoryLoader

# 加载目录下所有PDF
loader = DirectoryLoader(
    'docs/',                    # 目录路径
    glob="**/*.pdf",            # 文件模式
    loader_cls=PyPDFLoader,     # 使用的加载器
    show_progress=True,         # 显示进度
    use_multithreading=True     # 多线程加载
)

docs = loader.load()
print(f"总共加载了 {len(docs)} 个文档块")
```

### 加载网页

```python
from langchain.document_loaders import WebBaseLoader
from bs4 import SoupStrainer

# 只提取特定内容
bs4_strainer = SoupStrainer(class_=("post-title", "post-header", "post-content"))

loader = WebBaseLoader(
    "https://python.langchain.com/docs/get_started/introduction",
    bs_kwargs={"parse_only": bs4_strainer}
)

docs = loader.load()
print(docs[0].page_content[:500])
```

### 自定义Loader

```python
from langchain.document_loaders.base import BaseLoader
from typing import List
from langchain.schema import Document

class MyCustomLoader(BaseLoader):
    """自定义文档加载器"""

    def __init__(self, source: str):
        self.source = source

    def load(self) -> List[Document]:
        """加载文档"""
        with open(self.source, 'r', encoding='utf-8') as f:
            content = f.read()

        # 自定义处理逻辑
        metadata = {"source": self.source}

        return [Document(page_content=content, metadata=metadata)]

# 使用
loader = MyCustomLoader("data/custom.txt")
docs = loader.load()
```

---

## 文本分割（Text Splitting）

### 为什么需要分割？

```
问题：LLM有上下文长度限制

示例：GPT-3.5-turbo
  - 最大输入：4096 tokens
  - 1 token ≈ 0.75 个英文单词
  - 1 token ≈ 1.5-2 个汉字

如果不分割：
  ❌ 整本书无法一次性输入
  ❌ 检索不精准（找到冗余内容）
  ❌ 成本高（处理大量无关内容）

分割后：
  ✅ 每个块都是独立语义单元
  ✅ 检索更精准
  ✅ 降低Token消耗
```

### 分割策略

```python
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter,
    TokenTextSplitter
)

# 1. RecursiveCharacterTextSplitter（推荐）
# 递归地按不同分隔符分割
recursive_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,              # 每块最大字符数
    chunk_overlap=200,            # 块之间重叠字符数
    length_function=len,          # 长度计算函数
    separators=["\n\n", "\n", "。", "！", "？", " ", ""]
)

# 分割逻辑：
# 1. 先按段落分隔（\n\n）
# 2. 如果还是太大，按句子分隔
# 3. 如果还是太大，按词分隔
# 4. 最后按字符分割

splits = recursive_splitter.split_documents(docs)
print(f"分割成 {len(splits)} 个块")

# 2. CharacterTextSplitter
# 按固定字符数分割
character_splitter = CharacterTextSplitter(
    separator="\n\n",      # 分隔符
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len
)

# 3. TokenTextSplitter
# 按Token数量分割（更精准）
from langchain.text_splitter import TokenTextSplitter

token_splitter = TokenTextSplitter(
    chunk_size=500,        # 500 tokens
    chunk_overlap=50,
    encoding_name="cl100k_base"  # GPT-3.5/4的编码
)

splits = token_splitter.split_documents(docs)
```

### 不同文档类型的分割

```python
# Markdown文档
from langchain.text_splitter import MarkdownTextSplitter

markdown_splitter = MarkdownTextSplitter(
    chunk_size=1000,
    chunk_overlap=0
)

# 按Markdown结构分割（#、##等）
splits = markdown_splitter.split_text(markdown_content)

# 代码文档
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    Language
)

python_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON,
    chunk_size=1000,
    chunk_overlap=100
)

# 按函数、类等代码结构分割
code_splits = python_splitter.split_documents(code_docs)

# JavaScript
js_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.JS
)
```

### 分割效果评估

```python
def evaluate_splits(splits):
    """评估分割效果"""
    for i, split in enumerate(splits[:5]):  # 查看前5个
        print(f"\n--- 块 {i+1} ---")
        print(f"长度：{len(split.page_content)} 字符")
        print(f"来源：{split.metadata.get('source', 'Unknown')}")
        print(f"内容预览：{split.page_content[:200]}...")

    # 统计
    lengths = [len(s.page_content) for s in splits]
    print(f"\n统计：")
    print(f"总块数：{len(splits)}")
    print(f"平均长度：{sum(lengths)/len(lengths):.0f}")
    print(f"最小长度：{min(lengths)}")
    print(f"最大长度：{max(lengths)}")

# 使用
evaluate_splits(splits)
```

---

## Embeddings和向量数据库

### 什么是Embeddings？

**Embeddings（嵌入）** 是将文本转换为高维向量（数字数组）的技术，相似的文本会有相似的向量。

```python
# 示例：文本向量化
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(openai_api_key="your-key")

# 转换为向量
text = "Python是一种编程语言"
vector = embeddings.embed_query(text)

print(f"向量维度：{len(vector)}")  # 1536 (OpenAI embeddings)
print(f"前10个值：{vector[:10]}")
# [0.0023, -0.0156, 0.0089, ...]
```

**语义相似度示例**：

```python
# 计算相似度
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

texts = [
    "Python是编程语言",
    "Java是编程语言",
    "今天天气不错",
    "机器学习是AI的分支"
]

vectors = [embeddings.embed_query(t) for t in texts]

# 计算相似度矩阵
similarities = cosine_similarity(vectors)

# 结果：Python和Java相似度高，与天气相似度低
# [[1.00, 0.89, 0.23, 0.45],
#  [0.89, 1.00, 0.21, 0.43],
#  [0.23, 0.21, 1.00, 0.19],
#  [0.45, 0.43, 0.19, 1.00]]
```

### 主流Embedding模型

| 模型 | 维度 | 特点 | 价格 |
|------|------|------|------|
| **OpenAI text-embedding-3** | 1536 | 综合性能最佳 | $0.0001/1K tokens |
| **Cohere embed-v3** | 1024 | 多语言支持好 | 免费/付费 |
| **HuggingFace mteb** | 768 | 开源免费 | 完全免费 |
| **BGE-large-zh** | 1024 | 中文优化 | 免费 |

```python
# 使用OpenAI Embeddings
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",  # 最经济
    openai_api_key="your-key"
)

# 使用开源模型（免费）
from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-large-zh-v1.5",  # 中文模型
    model_kwargs={'device': 'cpu'},  # 或 'cuda' 如果有GPU
    encode_kwargs={'normalize_embeddings': True}
)

# 中文优化模型
from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="shibing624/text2vec-base-chinese"
)
```

### 向量数据库选择

```
向量数据库对比：

Chroma:
  ✅ 轻量级，易部署
  ✅ 无需额外服务
  ✅ 适合中小规模数据
  ✅ 完全免费
  💡 推荐用于学习和原型

FAISS:
  ✅ Facebook出品，性能优秀
  ✅ 支持GPU加速
  ✅ 内存索引，速度快
  ❌ 不支持持久化（需手动保存）
  💡 推荐用于大规模数据

Pinecone:
  ✅ 云服务，完全托管
  ✅ 自动扩展
  ✅ 企业级支持
  ❌ 需要付费
  💡 推荐用于生产环境

Weaviate:
  ✅ 功能丰富
  ✅ 支持多种数据类型
  ❌ 配置相对复杂
  💡 推荐用于复杂场景
```

### 使用Chroma向量数据库

```python
from langchain.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 1. 准备文档
loader = PyPDFLoader("docs/manual.pdf")
docs = loader.load()

# 2. 分割
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
splits = text_splitter.split_documents(docs)

# 3. 创建向量数据库
embeddings = OpenAIEmbeddings()

# 方式1：创建临时数据库（内存）
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=embeddings
)

# 方式2：持久化到磁盘
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=embeddings,
    persist_directory="./chroma_db"  # 保存路径
)

# 方式3：加载已存在的数据库
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)

# 4. 相似度搜索
query = "如何安装Python？"
results = vectorstore.similarity_search(query, k=3)  # 返回Top 3

for i, result in enumerate(results):
    print(f"\n--- 结果 {i+1} ---")
    print(f"内容：{result.page_content[:200]}...")
    print(f"元数据：{result.metadata}")

# 5. 带分数的搜索
results_with_scores = vectorstore.similarity_search_with_score(query, k=3)

for doc, score in results_with_scores:
    print(f"\n相似度分数：{score:.4f}")
    print(f"内容：{doc.page_content[:200]}...")
```

### 使用FAISS

```python
from langchain.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

# 创建FAISS索引
embeddings = OpenAIEmbeddings()
faiss_index = FAISS.from_documents(splits, embeddings)

# 保存到磁盘
faiss_index.save_local("faiss_index")

# 加载
faiss_index = FAISS.load_local(
    "faiss_index",
    embeddings,
    allow_dangerous_deserialization=True
)

# 搜索
results = faiss_index.similarity_search(query, k=3)

# 最大边际相关性搜索（MMR）
# 平衡相关性和多样性
results = faiss_index.max_marginal_relevance_search(
    query,
    k=3,
    fetch_k=10  # 从前10个中选择3个
)
```

---

## 构建完整的RAG系统

### 基础RAG链

```python
from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# 1. 初始化组件
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
embeddings = OpenAIEmbeddings()

# 2. 加载向量数据库
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}  # 返回Top 3
)

# 3. 创建提示词模板
template = """你是一个专业的AI助手。请基于以下上下文回答问题。

上下文：
{context}

问题：{question}

回答要求：
1. 只使用上下文中的信息
2. 如果上下文中没有答案，明确告知
3. 回答要准确、简洁
4. 标注信息来源

回答："""

prompt = ChatPromptTemplate.from_template(template)

# 4. 创建RAG链
def format_docs(docs):
    """格式化文档"""
    return "\n\n".join([
        f"【文档{i+1}】{doc.page_content}"
        for i, doc in enumerate(docs)
    ])

rag_chain = (
    {
        "context": retriever | format_docs,  # 检索并格式化
        "question": RunnablePassthrough()    # 传递问题
    }
    | prompt
    | llm
    | StrOutputParser()
)

# 5. 使用
query = "Python中的装饰器是什么？"
answer = rag_chain.invoke(query)
print(answer)
```

### 带来源引用的RAG

```python
from langchain_core.prompts import PromptTemplate

# 提示词模板
template = """基于以下上下文回答问题。

上下文：
{context}

问题：{question}

请按以下格式回答：
## 回答
[你的回答]

## 信息来源
- 文档1：[来源信息]
- 文档2：[来源信息]
"""

prompt = PromptTemplate.from_template(template)

# 修改format_docs保留元数据
def format_docs_with_source(docs):
    """格式化文档并保留来源"""
    return "\n\n".join([
        f"来源：{doc.metadata.get('source', 'Unknown')}"
        f"（第{doc.metadata.get('page', 0)}页）\n"
        f"内容：{doc.page_content}"
        for doc in docs
    ])

# 创建链
rag_chain = (
    {
        "context": retriever | format_docs_with_source,
        "question": RunnablePassthrough()
    }
    | prompt
    | llm
    | StrOutputParser()
)
```

### 流式输出RAG

```python
# 流式输出
for chunk in rag_chain.stream("解释Python的GIL"):
    print(chunk, end="", flush=True)
```

### 完整的RAG应用

```python
class RAGSystem:
    """完整的RAG系统"""

    def __init__(self, db_path="./chroma_db"):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            persist_directory=db_path,
            embedding_function=self.embeddings
        )
        self.retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": 3}
        )

        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0
        )

        self.chain = self._create_chain()

    def _create_chain(self):
        """创建RAG链"""
        template = """你是专业的AI助手。

上下文：
{context}

问题：{question}

回答要求：
1. 基于上下文准确回答
2. 如无相关信息，明确说明
3. 引用信息来源

回答："""

        prompt = ChatPromptTemplate.from_template(template)

        def format_docs(docs):
            return "\n\n".join([
                f"【来源：{doc.metadata.get('source', 'Unknown')}】\n{doc.page_content}"
                for doc in docs
            ])

        return (
            {
                "context": self.retriever | format_docs,
                "question": RunnablePassthrough()
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )

    def ask(self, question: str) -> dict:
        """提问"""
        # 1. 检索相关文档
        docs = self.vectorstore.similarity_search(question, k=3)

        # 2. 生成回答
        answer = self.chain.invoke(question)

        # 3. 返回结果和来源
        return {
            "question": question,
            "answer": answer,
            "sources": [
                {
                    "source": doc.metadata.get('source'),
                    "page": doc.metadata.get('page'),
                    "content": doc.page_content[:200] + "..."
                }
                for doc in docs
            ]
        }

    def chat(self):
        """交互式对话"""
        print("🤖 RAG智能问答系统（输入'quit'退出）\n")

        while True:
            question = input("\n你：").strip()

            if question.lower() in ['quit', 'exit', '退出']:
                print("再见！👋")
                break

            if not question:
                continue

            try:
                result = self.ask(question)

                print(f"\n📝 回答：\n{result['answer']}\n")

                print("📚 信息来源：")
                for i, source in enumerate(result['sources'], 1):
                    print(f"\n{i}. {source['source']}")
                    print(f"   内容：{source['content']}")

            except Exception as e:
                print(f"❌ 错误：{e}")

# 使用
if __name__ == "__main__":
    rag = RAGSystem()
    rag.chat()
```

---

## RAG优化技巧

### 检索优化

```python
# 1. 调整检索数量
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 5,        # 增加检索数量
        "score_threshold": 0.7  # 相似度阈值
    }
)

# 2. 使用MMR（最大边际相关性）
retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 5, "fetch_k": 20}
)

# 3. 多查询检索
from langchain.retrievers import MultiQueryRetriever

retriever = MultiQueryRetriver.from_llm(
    retriever=vectorstore.as_retriever(),
    llm=ChatOpenAI(temperature=0)
)

# 自动生成多个查询变体，提高召回率

# 4. 上下文压缩
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

compressor = LLMChainExtractor.from_llm(ChatOpenAI())
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever()
)
```

### 混合搜索

```python
# 结合关键词搜索和语义搜索
from langchain.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever

# BM25关键词检索
bm25_retriever = BM25Retriever.from_documents(splits)
bm25_retriever.k = 3

# 语义检索
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 组合检索
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.4, 0.6]  # 权重
)
```

### 重排序（Reranking）

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CohereRerankCompressor

# 使用Cohere Rerank API重新排序
compressor = CohereRerankCompressor(
    cohere_api_key="your-key",
    top_n_queries=3  # 保留前3个最相关的
)

compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever(search_kwargs={"k": 10})
)
# 先检索10个，然后重排序，保留最相关的3个
```

---

## 本章小结

### 核心概念

✅ **RAG流程**：
1. 文档加载和分割
2. 向量化
3. 存储到向量数据库
4. 检索相关内容
5. 结合问题生成回答

✅ **关键组件**：
- Document Loaders：加载各种文档
- Text Splitters：智能分割
- Embeddings：文本向量化
- Vector Stores：向量存储和检索

✅ **优化技巧**：
- MMR：提高多样性
- 多查询检索：提高召回率
- 混合搜索：结合关键词和语义
- 重排序：提升精度

---

## 练习题

### 练习1：构建文档问答系统

基于你的项目文档，构建一个RAG问答系统。

### 练习2：优化检索效果

实现多查询检索，比较检索效果。

### 练习3：添加来源追踪

让回答显示引用的文档和页码。

---

## 常见问题 FAQ

### Q1: RAG和传统的搜索有什么区别？什么时候用RAG？

**A:**

```python
# 传统搜索 vs RAG 对比：

┌────────────┬──────────────────┬──────────────────┐
│   维度     │   传统搜索       │      RAG         │
├────────────┼──────────────────┼──────────────────┤
│ 匹配方式   │ 关键词匹配       │ 语义理解         │
│ 输出方式   │ 返回文档列表     │ 生成自然语言答案 │
│ 理解能力   │ 字面匹配         │ 深度理解         │
│ 准确性     │ 可能误匹配       │ 上下文相关       │
│ 用户体验   │ 需要用户阅读     │ 直接得到答案     │
│ 成本       │ 低               │ 高（需要LLM）    │
│ 延迟       │ 毫秒级           │ 秒级             │
└────────────┴──────────────────┴──────────────────┘

# 使用场景：

✅ 使用传统搜索：
- 用户需要浏览原始文档
- 信息查找类任务（找文档、找代码）
- 需要极快响应
- 成本敏感
- 简单的关键词查询

示例：
# 知识库搜索
def search_documents(query):
    results = database.search(query)
    return [
        {
            "title": doc.title,
            "snippet": doc.content[:200],
            "relevance": doc.score
        }
        for doc in results
    ]

✅ 使用RAG：
- 需要理解和综合信息
- 需要自然语言答案
- 问题复杂、需要推理
- 重视用户体验
- 有AI预算

示例：
# RAG问答
def rag_answer(query):
    # 1. 检索相关文档
    docs = vectorstore.similarity_search(query, k=3)
    # 2. 生成答案
    context = "\n".join([doc.page_content for doc in docs])
    answer = llm.generate(f"基于以下上下文回答：{context}\n问题：{query}")
    return answer

# 混合方案（推荐）：
def hybrid_system(query):
    # 1. 传统搜索获取候选
    candidates = keyword_search(query, top_k=20)
    # 2. RAG生成答案
    answer = rag_generate(query, candidates)
    # 3. 同时返回相关文档链接
    return {
        "answer": answer,
        "related_docs": candidates[:5]
    }

# 决策流程：
需要答案还是文档？
→ 答案 → 用RAG
→ 文档 → 用传统搜索
→ 都要 → 用混合方案
```

### Q2: 如何选择合适的chunk_size和chunk_overlap？

**A:**

```python
# Chunk Size 和 Overlap 的选择策略：

✅ Chunk Size（块大小）选择：

# 小块（300-500字符）
优点：
✅ 检索更精准（粒度细）
✅ 适合回答具体问题
✅ Token消耗少

缺点：
❌ 可能丢失上下文
❌ 需要检索更多块
❌ 拼接后可能不连贯

适用场景：
- FAQ型问题
- 精确信息查询
- 代码文档

# 中等块（500-1000字符）- 推荐
优点：
✅ 平衡精准度和上下文
✅ 适合大多数场景
✅ 检索效率高

缺点：
⚠️ 需要根据具体任务调整

适用场景：
- 通用问答
- 技术文档
- 企业知识库

# 大块（1000-2000字符）
优点：
✅ 保留完整上下文
✅ 适合需要上下文的问题
✅ 减少检索次数

缺点：
❌ 检索不够精准
❌ 可能包含无关信息
❌ Token消耗大

适用场景：
- 需要上下文的问题
- 总结类任务
- 长文档分析

✅ Chunk Overlap（重叠）选择：

# 无重叠（0）
- 块之间独立
- 可能丢失边界信息
- 不推荐

# 小重叠（50-100字符）- 保守
- 保留部分上下文
- 减少冗余
- 适合较小的块

# 中等重叠（100-200字符）- 推荐
- 良好的上下文连续性
- 平衡冗余和信息完整性
- 大多数场景的最佳选择

# 大重叠（200-300字符）
- 确保不会丢失信息
- 增加检索冗余
- 适合重要文档

# 实践建议：

from langchain.text_splitter import RecursiveCharacterTextSplitter

# 场景1：FAQ文档（小块）
faq_splitter = RecursiveCharacterTextSplitter(
    chunk_size=400,
    chunk_overlap=50
)

# 场景2：技术文档（中等块）
tech_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150
)

# 场景3：法律文档（大块，保留完整条款）
legal_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1500,
    chunk_overlap=200
)

# 场景4：代码文档（按函数分割）
code_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON,
    chunk_size=1000,
    chunk_overlap=100
)

# 优化方法：
# 1. 实验测试
def test_chunk_sizes(text, sizes):
    for size in sizes:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=size,
            chunk_overlap=size//5
        )
        chunks = splitter.split_text(text)
        print(f"Size {size}: {len(chunks)} chunks")

# 2. 评估检索质量
# - 查询后检查返回的块是否相关
# - 检查答案是否准确
# - 调整参数对比效果

# 3. 根据LLM上下文窗口调整
# GPT-3.5: 4K tokens → chunk_size 500-1000
# GPT-4: 8K/32K tokens → chunk_size 1000-2000
# Claude-2: 100K tokens → chunk_size 2000-4000
```

### Q3: 如何评估RAG系统的效果？

**A:**

```python
# RAG系统评估框架：

✅ 评估维度：

# 1. 检索质量（Retrieval Quality）

def evaluate_retrieval(ground_truth, retrieved_docs):
    """评估检索质量"""

    # Precision@K: 检索到的相关文档占比
    precision = len(relevant_docs) / len(retrieved_docs)

    # Recall@K: 检索到的相关文档占所有相关文档的比例
    recall = len(retrieved_relevant_docs) / len(all_relevant_docs)

    # MRR (Mean Reciprocal Rank): 第一个相关文档的排名
    mrr = 1 / rank_of_first_relevant

    # NDCG (Normalized Discounted Cumulative Gain): 考虑排序质量
    ndcg = calculate_ndcg(retrieved_docs, relevance_scores)

    return {
        "precision@k": precision,
        "recall@k": recall,
        "mrr": mrr,
        "ndcg": ndcg
    }

# 2. 生成质量（Generation Quality）

def evaluate_generation(generated_answer, ground_truth):
    """评估生成答案质量"""

    # Faithfulness (忠实度): 答案是否基于检索内容
    faithfulness = check_if_answer_based_on_context(
        generated_answer,
        retrieved_contexts
    )

    # Answer Relevance (答案相关性)
    relevance = calculate_similarity(
        generated_answer,
        ground_truth_answer
    )

    # Context Precision (上下文精确度)
    context_precision = check_if_contexts_relevant_to_query(
        retrieved_contexts,
        query
    )

    return {
        "faithfulness": faithfulness,
        "relevance": relevance,
        "context_precision": context_precision
    }

# 3. 端到端评估

def evaluate_rag_end_to_end(queries, ground_truths):
    """端到端评估"""

    results = []
    for query, ground_truth in zip(queries, ground_truths):
        # 检索
        docs = retriever.get_relevant_documents(query)

        # 生成
        answer = rag_chain.invoke(query)

        # 评估
        result = {
            "query": query,
            "retrieved_docs": docs,
            "answer": answer,
            "ground_truth": ground_truth,

            # 检索指标
            "precision": calculate_precision(docs, ground_truth["relevant_docs"]),
            "recall": calculate_recall(docs, ground_truth["all_relevant_docs"]),

            # 生成指标
            "faithfulness": check_faithfulness(answer, docs),
            "relevance": calculate_relevance(answer, ground_truth["answer"])
        }

        results.append(result)

    # 汇总统计
    avg_metrics = {
        "avg_precision": np.mean([r["precision"] for r in results]),
        "avg_recall": np.mean([r["recall"] for r in results]),
        "avg_faithfulness": np.mean([r["faithfulness"] for r in results]),
        "avg_relevance": np.mean([r["relevance"] for r in results])
    }

    return results, avg_metrics

# 4. 用户反馈评估

class RAGEvaluatorWithFeedback:
    """带用户反馈的评估"""

    def log_query(self, query, answer, retrieved_docs):
        """记录查询"""
        return {
            "query": query,
            "answer": answer,
            "docs": retrieved_docs,
            "timestamp": datetime.now(),
            "user_feedback": None  # 待用户反馈
        }

    def add_feedback(self, query_id, feedback):
        """添加用户反馈"""
        # feedback: {
        #   "thumbs_up": true/false,
        #   "rating": 1-5,
        #   "comment": "..."
        # }
        pass

    def calculate_user_satisfaction(self):
        """计算用户满意度"""
        return {
            "thumbs_up_rate": thumbs_up / total_queries,
            "avg_rating": sum(ratings) / len(ratings)
        }

# 5. A/B测试

def ab_test_rag(system_a, system_b, test_queries):
    """A/B测试两个RAG系统"""

    results_a = [system_a.query(q) for q in test_queries]
    results_b = [system_b.query(q) for q in test_queries]

    # 人工评估或自动评估
    comparison = compare_results(results_a, results_b)

    return {
        "system_a_avg_score": np.mean([r["score"] for r in results_a]),
        "system_b_avg_score": np.mean([r["score"] for r in results_b]),
        "winner": "A" if comparison > 0 else "B"
    }

# 评估工具推荐：
# - RAGAS: 自动化RAG评估框架
# - TruLens: RAG可观测性和评估
# - DeepEval: LLM应用评估框架
# - 自定义评估脚本

# 评估最佳实践：
✅ 准备多样化的测试集（覆盖各种场景）
✅ 包含简单和复杂问题
✅ 准备ground truth（标准答案）
✅ 定期评估和迭代
✅ 收集真实用户反馈
✅ 监控生产环境表现
```

### Q4: 向量数据库如何选择？Chroma、FAISS、Pinecone怎么选？

**A:**

```python
# 向量数据库选型指南：

┌─────────────┬──────────┬──────────┬──────────┬──────────┐
│   特性      │  Chroma  │   FAISS  │ Pinecone │ Weaviate │
├─────────────┼──────────┼──────────┼──────────┼──────────┤
│ 部署方式    │ 本地     │ 本地     │ 云服务   │ 本地/云  │
│ 学习曲线    │ 低       │ 中       │ 低       │ 高       │
│ 性能        │ 中       │ 高       │ 高       │ 高       │
│ 扩展性      │ 低       │ 中       │ 高       │ 高       │
│ 持久化      │ ✅       │ ❌       │ ✅       │ ✅       │
│ 成本        │ 免费     │ 免费     │ 付费     │ 免费/付费│
│ 推荐场景    │ 学习/原型│ 大规模   │ 生产     │ 高级     │
└─────────────┴──────────┴──────────┴──────────┴──────────┘

# 详细对比：

✅ Chroma
# 最佳选择：学习、原型开发、中小规模项目

from langchain.vectorstores import Chroma

# 优点：
✅ 安装简单（pip install chromadb）
✅ 无需额外服务
✅ 自动持久化到磁盘
✅ API友好
✅ 完全免费
✅ 支持元数据过滤

# 缺点：
❌ 性能不如FAISS（大规模数据）
❌ 不支持分布式
❌ 功能相对基础

# 适用场景：
- 数据量 < 100万文档
- 学习RAG技术
- 快速原型验证
- 个人项目
- 中小企业应用

# 使用示例：
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=embeddings,
    persist_directory="./db"  # 持久化
)

✅ FAISS
# 最佳选择：大规模数据、性能要求高

from langchain.vectorstores import FAISS

# 优点：
✅ Facebook出品，性能优秀
✅ 支持GPU加速
✅ 内存索引，速度极快
✅ 多种索引算法（IVF、PQ等）
✅ 完全免费
✅ 支持数十亿级向量

# 缺点：
❌ 不自动持久化（需手动保存）
❌ 不支持实时更新（需重建索引）
❌ 元数据过滤功能弱
❌ 需要更多配置

# 适用场景：
- 数据量 > 100万文档
- 对检索速度要求极高
- 批量处理，不需要频繁更新
- 有GPU资源
- 大型搜索引擎

# 使用示例：
faiss_index = FAISS.from_documents(splits, embeddings)
faiss_index.save_local("faiss_index")  # 手动保存

✅ Pinecone
# 最佳选择：生产环境、企业级应用

import pinecone
from langchain.vectorstores import Pinecone

# 优点：
✅ 完全托管，无需运维
✅ 自动扩展
✅ 高可用（99.9% SLA）
✅ 实时更新
✅ 强大的元数据过滤
✅ 企业级支持

# 缺点：
❌ 需要付费（有免费额度）
❌ 数据在云端（数据安全）
❌ 依赖网络

# 适用场景：
- 生产环境
- 企业级应用
- 需要高可用性
- 团队协作
- 预算充足

# 使用示例：
pinecone.init(
    api_key="your-key",
    environment="us-east1-aws"
)
vectorstore = Pinecone.from_documents(
    splits,
    embeddings,
    index_name="my-rag-system"
)

✅ Weaviate
# 最佳选择：高级功能、复杂数据类型

from langchain.vectorstores import Weaviate

# 优点：
✅ 功能丰富
✅ 支持多种数据类型
✅ GraphQL API
✅ 模块化架构
✅ 支持本地和云端

# 缺点：
❌ 配置复杂
❌ 学习曲线陡峭
❌ 文档相对较少

# 适用场景：
- 需要高级功能
- 复杂数据类型
- 图像、多模态搜索
- 需要GraphQL

# 决策树：

数据量多大？
→ < 10万 → Chroma（最简单）
→ 10万-100万 → Chroma 或 FAISS
→ > 100万 → FAISS 或 Pinecone

需要频繁更新吗？
→ 是 → Chroma 或 Pinecone
→ 否（批量）→ FAISS

是生产环境吗？
→ 是，预算充足 → Pinecone
→ 是，预算有限 → FAISS（自建）
→ 否（学习/原型）→ Chroma

团队技术能力？
→ 初学者 → Chroma 或 Pinecone
→ 有经验 → FAISS 或 Weaviate

# 推荐组合：
# 开发阶段：Chroma（快速迭代）
# 测试阶段：FAISS（性能测试）
# 生产阶段：Pinecone（稳定可靠）
```

### Q5: 如何处理中文RAG？有什么特别要注意的？

**A:**

```python
# 中文RAG的特殊处理：

# 1. 使用中文优化的Embedding模型

# ❌ 不推荐：英文模型
from langchain_openai import OpenAIEmbeddings
embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")  # 英文为主

# ✅ 推荐：中文优化模型
from langchain_community.embeddings import HuggingFaceEmbeddings

# BGE系列（中文最佳之一）
embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-large-zh-v1.5",  # BAAI的中文模型
    model_kwargs={'device': 'cuda'},  # 使用GPU
    encode_kwargs={'normalize_embeddings': True}  # 归一化
)

# text2vec系列
embeddings = HuggingFaceEmbeddings(
    model_name="shibing624/text2vec-base-chinese",
    model_kwargs={'device': 'cuda'}
)

# m3e-base（轻量级）
embeddings = HuggingFaceEmbeddings(
    model_name="moka-ai/m3e-base"
)

# 2. 中文文本分割

# ✅ 推荐：针对中文优化
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 中文分割器（按句子分割）
chinese_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,              # 中文字符可以稍大
    chunk_overlap=100,           # 20%重叠
    separators=[
        "\n\n",    # 段落
        "\n",      # 行
        "。",      # 中文句号
        "！",      # 中文感叹号
        "？",      # 中文问号
        "；",      # 中文分号
        "，",      # 中文逗号
        " ",       # 空格
        ""         # 字符级
    ],
    length_function=len  # 中文字符计数
)

# 3. 中文分词（可选）

import jieba

def chinese_tokenize(text):
    """中文分词"""
    return list(jieba.cut(text))

# 用于某些需要分词的场景
tokens = chinese_tokenize("中文分词测试")

# 4. 处理中文编码

# ✅ 始终指定编码
from langchain.document_loaders import TextLoader

loader = TextLoader(
    "中文文档.txt",
    encoding='utf-8'  # 或 'gbk', 'gb2312'
)

# 5. 中文Prompt优化

# ✅ 中文RAG专用Prompt
prompt_template = """你是一个专业的中文AI助手。

请基于以下中文上下文回答问题。

上下文：
{context}

问题：{question}

回答要求：
1. 使用流利的中文
2. 准确理解中文语义
3. 保持专业和礼貌
4. 引用信息来源

回答："""

# 6. 处理中文标点符号

import re

def clean_chinese_text(text):
    """清理中文文本"""
    # 统一标点符号
    text = text.replace("，", ",").replace("。", ".")
    # 去除多余空格
    text = re.sub(r'\s+', ' ', text)
    # 去除特殊字符
    text = re.sub(r'[^\u4e00-\u9fa5a-zA-Z0-9，。！？、；：""''（）《》\s]', '', text)
    return text

# 7. 中文相关性评分

def chinese_relevance_score(query, document):
    """中文相关性评分"""
    # 使用中文模型计算相似度
    query_embedding = embeddings.embed_query(query)
    doc_embedding = embeddings.embed_query(document)

    # 余弦相似度
    from sklearn.metrics.pairwise import cosine_similarity
    similarity = cosine_similarity(
        [query_embedding],
        [doc_embedding]
    )[0][0]

    return similarity

# 8. 中文元数据处理

# 添加中文元数据
document.metadata = {
    "source": "中文文档.pdf",
    "title": "产品说明书",
    "category": "技术文档",
    "language": "zh-CN"  # 标记为中文
}

# 元数据过滤（中文）
results = vectorstore.similarity_search(
    "产品功能",
    filter={"language": "zh-CN"}  # 只检索中文文档
)

# 中文RAG最佳实践：
✅ 使用中文优化的Embedding模型
✅ 按中文标点符号分割文本
✅ 注意文件编码（UTF-8）
✅ 使用中文友好的Prompt
✅ 处理中文特有的标点和格式
✅ 添加语言元数据标签
✅ 测试中文语义理解准确度

# 中文Embedding模型推荐（按效果排序）：
# 1. BAAI/bge-large-zh-v1.5 ⭐⭐⭐⭐⭐
# 2. BAAI/bge-base-zh-v1.5 ⭐⭐⭐⭐
# 3. shibing624/text2vec-base-chinese ⭐⭐⭐⭐
# 4. moka-ai/m3e-large ⭐⭐⭐⭐
# 5. shibing624/text2vec-large-chinese ⭐⭐⭐
```

### Q6: RAG系统如何更新知识？添加新文档需要重建索引吗？

**A:**

```python
# RAG知识库更新策略：

# 1. 增量添加（推荐）

# Chroma支持增量添加
from langchain.vectorstores import Chroma

# 加载现有数据库
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)

# 添加新文档
new_docs = load_new_documents("new_docs/")
vectorstore.add_documents(new_docs)

# 自动保存到持久化存储
# 无需重建整个索引！

# 2. 批量更新

def batch_update_vectorstore(vectorstore, new_docs_path, batch_size=100):
    """批量更新向量库"""

    # 加载新文档
    new_docs = load_documents(new_docs_path)

    # 分批添加
    for i in range(0, len(new_docs), batch_size):
        batch = new_docs[i:i+batch_size]
        vectorstore.add_documents(batch)
        print(f"已添加 {i+len(batch)}/{len(new_docs)} 个文档")

# 3. 更新已有文档

# 删除旧版本
vectorstore.delete(ids=["doc_id_1", "doc_id_2"])

# 添加新版本
updated_docs = load_updated_documents()
vectorstore.add_documents(updated_docs)

# 4. FAISS的更新（需要特殊处理）

from langchain.vectorstores import FAISS

# FAISS不支持直接添加，需要：
# 方法1：合并索引
old_index = FAISS.load_local("faiss_index", embeddings)
new_index = FAISS.from_documents(new_docs, embeddings)
merged_index = old_index.merge_from(new_index)
merged_index.save_local("faiss_index")

# 方法2：定期重建
def rebuild_faiss_index(all_docs_path):
    """重建FAISS索引"""
    # 加载所有文档（包括新的）
    all_docs = load_documents(all_docs_path)

    # 重建索引
    new_index = FAISS.from_documents(all_docs, embeddings)
    new_index.save_local("faiss_index")

# 5. 元数据过滤更新

# 通过元数据标记文档状态
document.metadata = {
    "source": "document.pdf",
    "created_at": "2024-01-15",
    "updated_at": "2024-01-20",
    "version": "v2.0",
    "status": "active"  # active, archived, deleted
}

# 查询时过滤
results = vectorstore.similarity_search(
    query,
    filter={
        "status": "active",
        "version": "v2.0"
    }
)

# 6. 自动化更新系统

class RAGKnowledgeUpdater:
    """RAG知识库更新系统"""

    def __init__(self, vectorstore_path):
        self.vectorstore = Chroma(
            persist_directory=vectorstore_path,
            embedding_function=embeddings
        )
        self.doc_tracker = DocumentTracker()  # 文档追踪器

    def check_updates(self, docs_path):
        """检查文档更新"""
        # 扫描文档目录
        current_files = scan_directory(docs_path)

        # 对比已记录的文件
        new_files, modified_files, deleted_files = \
            self.doc_tracker.compare(current_files)

        return {
            "new": new_files,
            "modified": modified_files,
            "deleted": deleted_files
        }

    def update_knowledge_base(self, docs_path):
        """更新知识库"""

        # 1. 检查更新
        updates = self.check_updates(docs_path)

        # 2. 处理新文档
        if updates["new"]:
            new_docs = load_documents(updates["new"])
            self.vectorstore.add_documents(new_docs)
            print(f"✅ 添加了 {len(new_docs)} 个新文档")

        # 3. 更新已修改文档
        if updates["modified"]:
            for file_path in updates["modified"]:
                # 删除旧版本
                self.vectorstore.delete(
                    ids=[self.doc_tracker.get_doc_id(file_path)]
                )
                # 添加新版本
                new_doc = load_document(file_path)
                self.vectorstore.add_documents([new_doc])
            print(f"✅ 更新了 {len(updates['modified'])} 个文档")

        # 4. 处理已删除文档
        if updates["deleted"]:
            doc_ids = [
                self.doc_tracker.get_doc_id(f)
                for f in updates["deleted"]
            ]
            self.vectorstore.delete(ids=doc_ids)
            print(f"✅ 删除了 {len(updates['deleted'])} 个文档")

        # 5. 更新追踪记录
        self.doc_tracker.update_records(
            new=updates["new"],
            modified=updates["modified"],
            deleted=updates["deleted"]
        )

    def schedule_auto_update(self, docs_path, interval_hours=24):
        """定时自动更新"""
        import schedule
        import time

        def job():
            print(f"\n{datetime.now()}: 开始检查更新...")
            self.update_knowledge_base(docs_path)

        schedule.every(interval_hours).hours.do(job)

        while True:
            schedule.run_pending()
            time.sleep(60)

# 7. 版本控制

class VersionedVectorStore:
    """带版本控制的向量库"""

    def __init__(self, base_path):
        self.base_path = base_path
        self.current_version = self._get_latest_version()

    def create_new_version(self, docs):
        """创建新版本"""
        new_version = self.current_version + 1
        version_path = f"{self.base_path}/v{new_version}"

        # 创建新版本
        vectorstore = Chroma.from_documents(
            docs,
            embeddings,
            persist_directory=version_path
        )

        self.current_version = new_version
        return vectorstore

    def rollback_to_version(self, version):
        """回滚到指定版本"""
        version_path = f"{self.base_path}/v{version}"
        return Chroma(
            persist_directory=version_path,
            embedding_function=embeddings
        )

# 更新最佳实践：
✅ 使用支持增量更新的向量库（Chroma, Pinecone）
✅ 定期检查文档变化
✅ 自动化更新流程
✅ 实现版本控制
✅ 删除过期文档
✅ 记录更新日志
❌ 不要每次都重建整个索引（除非必要）
```

### Q7: RAG系统回答不准确怎么办？如何优化？

**A:**

```python
# RAG系统优化策略：

# 问题1：检索不精准
# 解决方案：

# 1. 调整检索参数
retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={
        "k": 5,                  # 增加检索数量
        "score_threshold": 0.7   # 设置相似度阈值
    }
)

# 2. 使用多种检索方式
from langchain.retrievers import EnsembleRetriever
from langchain.retrievers import BM25Retriever

# 关键词检索
bm25_retriever = BM25Retriever.from_documents(splits)
bm25_retriever.k = 3

# 语义检索
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 组合检索
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.4, 0.6]  # 调整权重
)

# 3. 多查询检索
from langchain.retrievers import MultiQueryRetriever

multi_query_retriever = MultiQueryRetriever.from_llm(
    retriever=vector_retriever,
    llm=ChatOpenAI(temperature=0)
)
# 自动生成多个查询变体

# 问题2：答案质量不高
# 解决方案：

# 1. 优化Prompt
prompt = ChatPromptTemplate.from_template("""
你是一个专业的AI助手。请仔细阅读以下上下文，准确回答问题。

上下文：
{context}

问题：{question}

回答要求：
1. 只使用上下文中的信息回答
2. 如果上下文中没有相关信息，明确说明"根据现有信息无法回答"
3. 回答要准确、完整、有条理
4. 引用具体的信息来源
5. 不要编造任何信息

回答：
""")

# 2. 重排序（Reranking）
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CohereRerankCompressor

compressor = CohereRerankCompressor(
    cohere_api_key="your-key",
    top_n_queries=3  # 只保留最相关的3个
)

compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever(search_kwargs={"k": 10})
)
# 先检索10个，重排序后保留3个最相关的

# 3. 使用更强的LLM
# GPT-3.5 → GPT-4（更准确但更慢）
llm = ChatOpenAI(model="gpt-4", temperature=0)

# 问题3：上下文不足
# 解决方案：

# 1. 增加检索数量
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 10}  # 从3个增加到10个
)

# 2. 使用更大的chunk
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1500,  # 从1000增加到1500
    chunk_overlap=300
)

# 3. 添加文档摘要
def add_document_summary(docs):
    """为文档添加摘要"""
    for doc in docs:
        if "summary" not in doc.metadata:
            summary = llm.invoke(f"总结以下内容：\n{doc.page_content[:1000]}")
            doc.metadata["summary"] = summary
    return docs

# 问题4：回答不够具体
# 解决方案：

# 1. 使用HyDE（Hypothetical Document Embeddings）
def hyde_retrieval(query, retriever, llm):
    """假设性文档嵌入"""

    # 先生成假设性答案
    hypothetical_answer = llm.invoke(
        f"请基于问题'{query}'生成一个详细的假设性回答"
    )

    # 用假设性答案检索
    docs = retriever.get_relevant_documents(hypothetical_answer)

    return docs

# 2. 迭代检索
def iterative_retrieval(query, retriever, max_iterations=3):
    """迭代检索优化"""

    for i in range(max_iterations):
        # 检索
        docs = retriever.get_relevant_documents(query)

        # 生成回答
        answer = rag_chain.invoke(query)

        # 检查回答质量
        if is_answer_satisfactory(answer):
            break

        # 根据回答优化查询
        query = refine_query(query, answer)

    return answer

# 优化检查清单：

# 检索质量：
[ ] 尝试不同的k值（3, 5, 10）
[ ] 测试相似度阈值
[ ] 尝试多种检索方式组合
[ ] 测试多查询检索
[ ] 检查文本分割是否合理

# Prompt优化：
[ ] 明确指示只使用上下文
[ ] 要求引用来源
[ ] 指定回答格式
[ ] 测试不同的Prompt模板

# 模型选择：
[ ] 尝试更强的LLM（GPT-4）
[ ] 调整temperature参数
[ ] 测试不同的Embedding模型

# 数据质量：
[ ] 检查文档质量
[ ] 清理噪声数据
[ ] 添加文档摘要
[ ] 优化元数据

# 评估和迭代：
[ ] 收集用户反馈
[ ] 分析bad cases
[ ] A/B测试不同方案
[ ] 持续优化参数
```

### Q8: RAG系统的成本如何估算和优化？

**A:**

```python
# RAG系统成本估算和优化：

# 1. 成本构成

# 主要成本：
# - Embedding API调用
# - LLM API调用（生成答案）
# - 向量数据库存储
# - 服务器成本

# 2. 成本计算器

class RAGCostCalculator:
    """RAG成本计算器"""

    def __init__(self):
        # OpenAI定价（2024年价格）
        self.pricing = {
            "gpt-3.5-turbo": {
                "input": 0.0005,      # $0.50 / 1M tokens
                "output": 0.0015     # $1.50 / 1M tokens
            },
            "gpt-4": {
                "input": 0.03,       # $30 / 1M tokens
                "output": 0.06       # $60 / 1M tokens
            },
            "text-embedding-3-small": {
                "input": 0.00002     # $0.02 / 1M tokens
            },
            "pinecone": {
                "starter": 70,       # $70 / 月
                "production": 400    # 起步 $400 / 月
            }
        }

    def calculate_embedding_cost(self, num_documents, avg_doc_length):
        """计算Embedding成本"""
        # 1 token ≈ 0.75 英文单词 ≈ 3-4 字符
        total_tokens = (num_documents * avg_doc_length) / 3

        # Embedding价格
        cost_per_1m_tokens = self.pricing["text-embedding-3-small"]["input"]
        embedding_cost = (total_tokens / 1_000_000) * cost_per_1m_tokens

        return {
            "total_tokens": int(total_tokens),
            "estimated_cost": embedding_cost
        }

    def calculate_query_cost(self, queries_per_day, avg_context_length, avg_answer_length):
        """计算查询成本"""
        # 每次查询的tokens
        input_tokens = (avg_context_length * 4) / 3  # 上下文
        input_tokens += 100  # 问题本身
        output_tokens = (avg_answer_length * 4) / 3  # 答案

        # 每天成本
        daily_input_cost = (queries_per_day * input_tokens / 1_000_000) * \
                          self.pricing["gpt-3.5-turbo"]["input"]
        daily_output_cost = (queries_per_day * output_tokens / 1_000_000) * \
                           self.pricing["gpt-3.5-turbo"]["output"]

        # 每月成本（假设30天）
        monthly_cost = (daily_input_cost + daily_output_cost) * 30

        return {
            "input_tokens_per_query": int(input_tokens),
            "output_tokens_per_query": int(output_tokens),
            "daily_cost": daily_input_cost + daily_output_cost,
            "monthly_cost": monthly_cost
        }

    def estimate_total_monthly_cost(
        self,
        num_documents=10000,
        avg_doc_length=500,
        queries_per_day=1000,
        avg_context_length=1500,
        avg_answer_length=300
    ):
        """估算总月度成本"""

        # Embedding成本（一次性，按月摊销）
        embedding_cost = self.calculate_embedding_cost(num_documents, avg_doc_length)
        monthly_embedding_cost = embedding_cost["estimated_cost"] / 12  # 摊销1年

        # 查询成本
        query_cost = self.calculate_query_cost(
            queries_per_day,
            avg_context_length,
            avg_answer_length
        )

        # 向量数据库成本
        vector_db_cost = self.pricing["pinecone"]["starter"]

        # 总成本
        total_monthly = (
            monthly_embedding_cost +
            query_cost["monthly_cost"] +
            vector_db_cost
        )

        return {
            "embedding_monthly": monthly_embedding_cost,
            "query_monthly": query_cost["monthly_cost"],
            "vector_db_monthly": vector_db_cost,
            "total_monthly": total_monthly,
            "breakdown": {
                "documents": num_documents,
                "queries_per_day": queries_per_day,
                "queries_per_month": queries_per_day * 30
            }
        }

# 使用示例：
calculator = RAGCostCalculator()
estimate = calculator.estimate_total_monthly_cost(
    num_documents=50000,
    avg_doc_length=800,
    queries_per_day=5000
)

print(f"月度成本估算：${estimate['total_monthly']:.2f}")
print(f"  - Embedding: ${estimate['embedding_monthly']:.4f}")
print(f"  - 查询: ${estimate['query_monthly']:.2f}")
print(f"  - 向量库: ${estimate['vector_db_monthly']:.2f}")

# 3. 成本优化策略

# 策略1：使用更便宜的模型
# GPT-4 → GPT-3.5-turbo（成本降低10-20倍）
llm = ChatOpenAI(model="gpt-3.5-turbo")  # 而不是 gpt-4

# 策略2：使用开源模型（零API成本）
from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-large-zh-v1.5"
)  # 完全免费，只需服务器成本

# 策略3：减少检索数量
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 3}  # 从10减少到3
)
# 减少上下文长度，降低输入Token

# 策略4：优化chunk_size
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,    # 合理的chunk大小
    chunk_overlap=150  # 适当重叠
)
# 太大的chunk会增加Token消耗

# 策略5：缓存常见查询
from langchain.cache import InMemoryCache
set_llm_cache(InMemoryCache())

# 相同问题直接返回缓存结果

# 策略6：使用更便宜的向量库
# Pinecone（$70/月）→ Chroma（免费）或 FAISS（免费）
vectorstore = Chroma(  # 完全免费
    persist_directory="./chroma_db",
    embedding_function=embeddings
)

# 策略7：限制回答长度
prompt = ChatPromptTemplate.from_template("""
请简洁回答，不超过200字。

上下文：{context}
问题：{question}
""")

# 策略8：分阶段处理
# 阶段1：简单查询用GPT-3.5
# 阶段2：复杂查询用GPT-4

def smart_rag(query):
    # 判断查询复杂度
    complexity = analyze_complexity(query)

    if complexity == "simple":
        # 使用便宜的模型
        return query_with_gpt35(query)
    else:
        # 使用强的模型
        return query_with_gpt4(query)

# 4. 成本监控

class CostMonitor:
    """成本监控"""

    def __init__(self):
        self.usage_log = []

    def log_query(self, query, input_tokens, output_tokens, model):
        """记录查询"""
        cost = calculate_cost(input_tokens, output_tokens, model)

        self.usage_log.append({
            "timestamp": datetime.now(),
            "query": query,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "model": model,
            "cost": cost
        })

    def get_daily_summary(self):
        """获取每日汇总"""
        today = datetime.now().date()
        today_logs = [
            log for log in self.usage_log
            if log["timestamp"].date() == today
        ]

        return {
            "total_queries": len(today_logs),
            "total_tokens": sum(
                log["input_tokens"] + log["output_tokens"]
                for log in today_logs
            ),
            "total_cost": sum(log["cost"] for log in today_logs)
        }

# 成本优化最佳实践：
✅ 选择合适的模型（GPT-3.5 vs GPT-4）
✅ 考虑使用开源Embedding模型
✅ 优化chunk_size和检索数量
✅ 使用免费的向量库（Chroma, FAISS）
✅ 限制回答长度
✅ 实现缓存机制
✅ 监控实际使用量
✅ 定期审查成本报告

# 成本优化预期：
# 基础优化：可节省 30-50%
# 深度优化：可节省 50-70%
# 极致优化：可节省 70-90%（使用本地模型）
```

### Q9: RAG支持多模态吗？比如图片、表格？

**A:**

```python
# 多模态RAG系统：

# 1. 图像RAG

from langchain_community.document_loaders import UnstructuredImageLoader
from langchain_community.vectorstores import Chroma
from PIL import Image

# 加载图片
image_loader = UnstructuredImageLoader("document.png")
image_docs = image_loader.load()

# 提取图像描述（使用多模态LLM）
from langchain_openai import ChatOpenAI

vision_llm = ChatOpenAI(model="gpt-4-vision-preview")

def describe_image(image_path):
    """描述图像内容"""
    from base64 import b64encode

    with open(image_path, "rb") as f:
        image_data = b64encode(f.read()).decode()

    prompt = [
        {
            "type": "text",
            "text": "请详细描述这张图片的内容"
        },
        {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,{image_data}"
            }
        }
    ]

    description = vision_llm.invoke(prompt)
    return description.content

# 将图像描述作为文档
image_description = describe_image("chart.png")
image_doc = Document(
    page_content=image_description,
    metadata={"type": "image", "source": "chart.png"}
)

# 添加到向量库
vectorstore.add_documents([image_doc])

# 2. 表格RAG

import pandas as pd
from langchain_community.document_loaders import UnstructuredExcelLoader

# 加载Excel
excel_loader = UnstructuredExcelLoader("data.xlsx")
excel_docs = excel_loader.load()

# 或使用pandas
df = pd.read_excel("data.xlsx")

def dataframe_to_docs(df):
    """DataFrame转文档"""
    docs = []

    # 每行作为一个文档
    for idx, row in df.iterrows():
        content = f"行{idx}：" + "，".join([f"{col}={val}" for col, val in row.items()])
        doc = Document(
            page_content=content,
            metadata={"type": "table_row", "row_index": idx}
        )
        docs.append(doc)

    return docs

# 或将整个表格描述为文档
def describe_table(df):
    """描述表格内容"""
    description = f"""
    表格包含{len(df)}行{len(df.columns)}列。
    列名：{', '.join(df.columns)}
    前3行数据：
    {df.head(3).to_string()}
    """
    return description

# 3. 混合模态RAG

class MultiModalRAG:
    """多模态RAG系统"""

    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            embedding_function=self.embeddings,
            persist_directory="./multimodal_db"
        )
        self.vision_llm = ChatOpenAI(model="gpt-4-vision-preview")
        self.text_llm = ChatOpenAI(model="gpt-3.5-turbo")

    def add_text_document(self, text, metadata):
        """添加文本文档"""
        doc = Document(page_content=text, metadata=metadata)
        self.vectorstore.add_documents([doc])

    def add_image_document(self, image_path, metadata):
        """添加图片文档"""
        # 描述图片
        description = self._describe_image(image_path)

        # 添加到向量库
        doc = Document(
            page_content=description,
            metadata={**metadata, "type": "image", "source": image_path}
        )
        self.vectorstore.add_documents([doc])

    def add_table_document(self, df, metadata):
        """添加表格文档"""
        # 描述表格
        description = self._describe_table(df)

        # 添加到向量库
        doc = Document(
            page_content=description,
            metadata={**metadata, "type": "table"}
        )
        self.vectorstore.add_documents([doc])

    def _describe_image(self, image_path):
        """描述图片"""
        from base64 import b64encode

        with open(image_path, "rb") as f:
            image_data = b64encode(f.read()).decode()

        prompt = [
            {"type": "text", "text": "请详细描述这张图片"},
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{image_data}"}
            }
        ]

        return self.vision_llm.invoke(prompt).content

    def _describe_table(self, df):
        """描述表格"""
        return f"""
        表格数据：
        行数：{len(df)}
        列名：{', '.join(df.columns)}
        示例数据：
        {df.head(3).to_string()}
        """

    def query(self, question):
        """查询（混合模态）"""
        # 检索相关文档
        docs = self.vectorstore.similarity_search(question, k=3)

        # 构建上下文
        context = "\n\n".join([
            f"[{doc.metadata.get('type', 'text')}] {doc.page_content}"
            for doc in docs
        ])

        # 生成回答
        prompt = f"""基于以下多模态内容回答问题：

{context}

问题：{question}

回答："""

        answer = self.text_llm.invoke(prompt)
        return answer.content

# 4. 使用专用工具

# LlamaParse（解析复杂文档）
# from llama_parse import LlamaParse
#
# parser = LlamaParse(
#     api_key="your-key",
#     result_type="markdown"  # 输出Markdown格式
# )
#
# documents = parser.load_data("document.pdf")
# 自动处理文本、图片、表格

# Unstructured（多种格式解析）
# from unstructured.partition.auto import partition
#
# elements = partition("document.pdf")
# for element in elements:
#     print(f"Type: {element.category}, Content: {element.text}")

# 多模态RAG最佳实践：
✅ 将图片转换为文本描述
✅ 提取表格结构信息
✅ 标注文档类型元数据
✅ 使用多模态LLM（GPT-4V）
✅ 考虑使用专用解析工具
✅ 评估每种模态的检索效果
⚠️ 成本较高（多模态API更贵）
⚠️ 延迟较高（处理时间更长）
```

### Q10: 如何构建一个生产级的RAG系统？

**A:**

```python
# 生产级RAG系统架构：

# 1. 系统架构

"""
┌─────────────────────────────────────────────────────┐
│              生产级RAG系统架构                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐      ┌──────────────┐             │
│  │ API Gateway │ ───→ │ Load Balancer│             │
│  └─────────────┘      └──────────────┘             │
│                              ↓                       │
│  ┌─────────────────────────────────────────────┐    │
│  │           RAG服务集群（多实例）              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │ Instance1│  │ Instance2│  │ Instance3│  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  │    │
│  └─────────────────────────────────────────────┘    │
│              ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓                     │
│  ┌─────────────────────────────────────────────┐    │
│  │          共享向量数据库集群                   │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │  Node 1  │  │  Node 2  │  │  Node 3  │  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────┐      ┌──────────────┐             │
│  │ 监控告警    │      │ 日志系统      │             │
│  └─────────────┘      └──────────────┘             │
│                                                     │
└─────────────────────────────────────────────────────┘
"""

# 2. 生产级RAG服务

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from typing import List, Optional
import redis
import json

app = FastAPI(title="生产级RAG API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis缓存
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# 日志配置
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class QueryRequest(BaseModel):
    question: str
    use_cache: bool = True
    top_k: int = 3

class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]
    cached: bool = False
    latency_ms: int

class ProductionRAG:
    """生产级RAG系统"""

    def __init__(self):
        # 初始化组件
        self.embeddings = OpenAIEmbeddings()
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

        # 加载向量库
        self.vectorstore = Chroma(
            persist_directory="./chroma_db",
            embedding_function=self.embeddings
        )
        self.retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": 3}
        )

        # 创建链
        self.chain = self._create_chain()

        # 性能监控
        self.metrics = {
            "total_queries": 0,
            "cache_hits": 0,
            "avg_latency": 0
        }

    def _create_chain(self):
        """创建RAG链"""
        template = """你是专业AI助手。

上下文：
{context}

问题：{question}

回答要求：
1. 基于上下文准确回答
2. 如无相关信息，明确说明
3. 引用信息来源

回答："""

        prompt = ChatPromptTemplate.from_template(template)

        def format_docs(docs):
            return "\n\n".join([
                f"【来源：{doc.metadata.get('source', 'Unknown')}】\n{doc.page_content}"
                for doc in docs
            ])

        return (
            {
                "context": self.retriever | format_docs,
                "question": RunnablePassthrough()
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )

    def query(self, question: str, use_cache: bool = True) -> dict:
        """查询（带缓存）"""
        import time

        start_time = time.time()

        # 检查缓存
        if use_cache:
            cached_result = self._get_cache(question)
            if cached_result:
                self.metrics["cache_hits"] += 1
                return {
                    **cached_result,
                    "cached": True,
                    "latency_ms": int((time.time() - start_time) * 1000)
                }

        try:
            # 查询
            answer = self.chain.invoke(question)

            # 检索来源
            docs = self.vectorstore.similarity_search(question, k=3)
            sources = [
                {
                    "source": doc.metadata.get('source'),
                    "content": doc.page_content[:200] + "..."
                }
                for doc in docs
            ]

            result = {
                "answer": answer,
                "sources": sources,
                "cached": False
            }

            # 保存到缓存
            if use_cache:
                self._set_cache(question, result)

            # 更新指标
            self.metrics["total_queries"] += 1
            latency = (time.time() - start_time) * 1000
            self.metrics["avg_latency"] = (
                self.metrics["avg_latency"] * (self.metrics["total_queries"] - 1) + latency
            ) / self.metrics["total_queries"]

            return {
                **result,
                "latency_ms": int(latency)
            }

        except Exception as e:
            logger.error(f"查询失败: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    def _get_cache(self, question: str) -> Optional[dict]:
        """获取缓存"""
        try:
            cache_key = f"rag:{hash(question)}"
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            logger.warning(f"缓存读取失败: {e}")
        return None

    def _set_cache(self, question: str, result: dict):
        """设置缓存（1小时）"""
        try:
            cache_key = f"rag:{hash(question)}"
            redis_client.setex(
                cache_key,
                3600,  # 1小时
                json.dumps(result, ensure_ascii=False)
            )
        except Exception as e:
            logger.warning(f"缓存写入失败: {e}")

    def get_metrics(self) -> dict:
        """获取性能指标"""
        return {
            **self.metrics,
            "cache_hit_rate": (
                self.metrics["cache_hits"] / self.metrics["total_queries"]
                if self.metrics["total_queries"] > 0 else 0
            )
        }

# 初始化
rag = ProductionRAG()

# API端点
@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """查询接口"""
    logger.info(f"收到查询: {request.question}")
    result = rag.query(request.question, request.use_cache)
    return result

@app.get("/metrics")
async def metrics():
    """性能指标"""
    return rag.get_metrics()

@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "healthy"}

# 3. Docker部署

# Dockerfile
"""
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""

# docker-compose.yml
"""
version: '3.8'

services:
  rag-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
"""

# 4. 监控和告警

from prometheus_client import Counter, Histogram, generate_latest

# 定义指标
query_counter = Counter('rag_queries_total', 'Total queries')
query_latency = Histogram('rag_query_latency_seconds', 'Query latency')
cache_hits = Counter('rag_cache_hits_total', 'Cache hits')

# 在查询中使用
@query_latency.time()
def query_with_monitoring(question):
    query_counter.inc()
    result = rag.query(question)
    if result["cached"]:
        cache_hits.inc()
    return result

@app.get("/metrics")
async def prometheus_metrics():
    """Prometheus指标"""
    return Response(content=generate_latest(), media_type="text/plain")

# 5. 安全性

# 添加认证
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

@app.post("/query")
async def secure_query(
    request: QueryRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # 验证Token
    if not validate_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid token")

    return await query(request)

# 速率限制
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/query")
@limiter.limit("10/minute")  # 每分钟10次
async def rate_limited_query(request: QueryRequest):
    return await query(request)

# 生产级RAG最佳实践：
✅ 使用API Gateway（Kong, AWS API Gateway）
✅ 实现负载均衡（多实例）
✅ 添加Redis缓存
✅ 实现监控告警（Prometheus + Grafana）
✅ 结构化日志（ELK Stack）
✅ 限流和认证
✅ 健康检查
✅ 自动伸缩（K8s HPA）
✅ 蓝绿部署/金丝雀发布
✅ 备份和灾难恢复
✅ 文档和API规范
✅ 性能测试和优化
```

---

## 学习清单

检查你掌握了以下技能：

### 基础概念 ✅

- [ ] 理解RAG的定义和价值
- [ ] 掌握RAG的工作流程
- [ ] 了解RAG vs Fine-tuning的区别
- [ ] 能够识别RAG的应用场景
- [ ] 理解检索增强的原理

### 核心组件 ✅

- [ ] 会使用Document Loaders加载各种文档
- [ ] 掌握Text Splitters的分割策略
- [ ] 理解Embeddings的作用
- [ ] 能够选择合适的Embedding模型
- [ ] 会使用向量数据库（Chroma, FAISS）
- [ ] 理解相似度搜索原理

### 系统构建 ✅

- [ ] 能够构建完整的RAG系统
- [ ] 掌握RAG链的创建方法
- [ ] 会实现带来源引用的RAG
- [ ] 能够优化检索效果
- [ ] 理解RAG的优化技巧

### 高级技能 ✅

- [ ] 会使用混合搜索（关键词+语义）
- [ ] 理解重排序（Reranking）的作用
- [ ] 能够评估RAG系统的效果
- [ ] 掌握中文RAG的特殊处理
- [ ] 了解多模态RAG的实现

### 实战能力 ✅

- [ ] 能够独立构建文档问答系统
- [ ] 会优化RAG的准确性
- [ ] 能够估算和优化成本
- [ ] 理解生产级RAG的架构
- [ ] 会部署和监控RAG系统

### 最佳实践 ✅

- [ ] 知道如何选择向量数据库
- [ ] 理解chunk_size的优化方法
- [ ] 掌握知识库的更新策略
- [ ] 能够处理中文RAG的特殊问题
- [ ] 了解成本优化的方法
- [ ] 能够设计生产级RAG系统

---

## 进阶练习

### 练习1：构建智能文档问答系统

**任务**：基于企业内部文档构建RAG系统

**要求**：
1. 支持PDF、Word、Markdown多种格式
2. 实现文档更新机制
3. 提供来源引用
4. 添加查询缓存
5. 实现性能监控

**技术栈**：
- LangChain + OpenAI
- Chroma向量数据库
- FastAPI（Web服务）
- Redis（缓存）

### 练习2：优化RAG检索效果

**任务**：对比不同检索策略的效果

**实验**：
1. 纯语义检索
2. 纯关键词检索（BM25）
3. 混合检索
4. 多查询检索
5. 重排序优化

**评估指标**：
- Precision@K
- Recall@K
- 答案准确率
- 用户满意度

### 练习3：实现多模态RAG

**任务**：支持图片和表格的RAG系统

**功能**：
1. 图片描述和检索
2. 表格数据提取
3. 混合模态查询
4. 统一的向量存储

**技术要求**：
- 使用GPT-4V描述图片
- 提取表格结构信息
- 标注文档类型元数据

### 练习4：构建生产级RAG服务

**任务**：部署一个高可用的RAG服务

**要求**：
1. RESTful API设计
2. 认证和授权
3. 速率限制
4. 监控和告警
5. 日志系统
6. 负载均衡

**部署方式**：
- Docker容器化
- Docker Compose编排
- Kubernetes部署（可选）

### 练习5：RAG效果评估系统

**任务**：构建自动化的RAG评估工具

**功能**：
1. 准备测试数据集
2. 自动化测试流程
3. 计算评估指标
4. 生成评估报告
5. A/B测试对比

**评估维度**：
- 检索质量（Precision, Recall, MRR）
- 生成质量（Faithfulness, Relevance）
- 端到端效果
- 用户反馈

---

## 实战项目

### 项目1：企业知识库问答系统

**目标**：构建企业内部文档智能问答系统

**功能**：
- 支持多种文档格式
- 实时更新知识库
- 权限控制（不同部门不同知识库）
- 查询历史记录
- 管理后台（文档管理、用户管理、统计分析）

**技术栈**：
- 后端：FastAPI + LangChain + Chroma
- 前端：Vue3 + Element Plus
- 数据库：PostgreSQL + Redis
- 部署：Docker + Nginx

### 项目2：技术文档助手

**目标**：为开源项目构建文档问答系统

**功能**：
- 爬取GitHub文档
- 代码和文档混合检索
- 代码示例提取
- 相关问题推荐
- 多语言支持

**特色功能**：
- 代码块高亮
- API文档结构化
- 版本切换（v1.0, v2.0）
- 贡献者信息展示

### 项目3：智能学习助手

**目标**：基于课程资料构建学习问答系统

**功能**：
- 支持视频字幕检索
- PPT内容提取
- 知识点关联
- 学习路径推荐
- 练习题生成

**创新点**：
- 结合学习进度推荐
- 识别薄弱知识点
- 生成个性化学习计划
- 多轮对话教学

---

## 学习资源

### 推荐阅读

1. **LangChain RAG教程**
   - 官方文档
   - 最佳实践
   - 示例代码

2. **向量数据库文档**
   - Chroma: https://docs.trychroma.com
   - FAISS: https://github.com/facebookresearch/faiss
   - Pinecone: https://docs.pinecone.io

3. **RAG评估框架**
   - RAGAS: https://docs.ragas.io
   - TruLens: https://www.trulens.org

### 实践平台

- **LangSmith**: RAG调试和评估
- **HuggingFace**: 开源Embedding模型
- **Pinecone**: 托管向量数据库

### 社区资源

- **Discord**: LangChain社区
- **GitHub**: RAG开源项目
- **论文**: arXiv上的RAG研究

---

**下一章：[AI Agent智能体 →](chapter-05)**
