# 第4章：RAG检索增强生成

## 本章导读

**RAG（Retrieval-Augmented Generation，检索增强生成）** 是目前最热门的AI应用技术之一。它结合了信息检索和文本生成，让AI能够基于你的私有数据回答问题，解决LLM知识过时和幻觉问题。

**学习目标**：
- 理解RAG的原理和应用场景
- 掌握文档加载和分割技术
- 学习Embeddings和向量数据库
- 构建完整的RAG系统

**预计学习时间**：70分钟

---

## 4.1 什么是RAG？

### 4.1.1 RAG的定义

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

### 4.1.2 为什么需要RAG？

| 问题 | 纯LLM的局限 | RAG的解决方案 |
|------|-------------|--------------|
| **知识过时** | 训练截止日期后的事件不知道 | 实时更新文档库 |
| **幻觉问题** | 可能编造错误信息 | 基于真实文档回答 |
| **私有数据** | 无法访问企业内部数据 | 集成私有知识库 |
| **可追溯性** | 无法验证答案来源 | 提供引用来源 |
| **专业性** | 通用知识，不够专业 | 领域专用知识库 |

### 4.1.3 RAG vs 微调（Fine-tuning）

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

### 4.1.4 RAG的应用场景

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

## 4.2 RAG系统架构

### 4.2.1 完整的RAG流程

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

### 4.2.2 核心组件说明

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

## 4.3 文档加载（Document Loading）

### 4.3.1 支持的文档类型

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

### 4.3.2 加载单个文档

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

### 4.3.3 加载目录

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

### 4.3.4 加载网页

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

### 4.3.5 自定义Loader

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

## 4.4 文本分割（Text Splitting）

### 4.4.1 为什么需要分割？

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

### 4.4.2 分割策略

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

### 4.4.3 不同文档类型的分割

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

### 4.4.4 分割效果评估

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

## 4.5 Embeddings和向量数据库

### 4.5.1 什么是Embeddings？

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

### 4.5.2 主流Embedding模型

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

### 4.5.3 向量数据库选择

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

### 4.5.4 使用Chroma向量数据库

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

### 4.5.5 使用FAISS

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

## 4.6 构建完整的RAG系统

### 4.6.1 基础RAG链

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

### 4.6.2 带来源引用的RAG

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

### 4.6.3 流式输出RAG

```python
# 流式输出
for chunk in rag_chain.stream("解释Python的GIL"):
    print(chunk, end="", flush=True)
```

### 4.6.4 完整的RAG应用

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

## 4.7 RAG优化技巧

### 4.7.1 检索优化

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

### 4.7.2 混合搜索

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

### 4.7.3 重排序（Reranking）

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

## 4.8 本章小结

### 4.8.1 核心概念

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

## 4.9 练习题

### 练习1：构建文档问答系统

基于你的项目文档，构建一个RAG问答系统。

### 练习2：优化检索效果

实现多查询检索，比较检索效果。

### 练习3：添加来源追踪

让回答显示引用的文档和页码。

---

**下一章：[AI Agent智能体 →](chapter-05)**
