---
title: RAG与检索增强面试题
---

# RAG与检索增强面试题

## RAG基础

### 什么是RAG？

RAG（Retrieval-Augmented Generation）结合检索和生成，增强LLM的能力。

**核心流程**：

```
┌─────────────────────────────────────────────────────┐
│                    RAG流程                           │
├─────────────────────────────────────────────────────┤
│  1. 文档索引                                          │
│     ┌──────────┐    ┌───────────┐    ┌─────────┐   │
│     │ 加载文档  │ -> │  文本分割  │ -> │ 向量化  │   │
│     └──────────┘    └───────────┘    └─────────┘   │
│                                              ↓       │
│  2. 检索                                      │       │
│     ┌──────────┐    ┌───────────┐    ┌─────────┐   │
│     │ 用户问题  │ -> │  问题向量化│ -> │ 相似度检索│   │
│     └──────────┘    └───────────┘    └─────────┘   │
│                                              ↓       │
│  3. 生成                                      │       │
│     ┌──────────┐    ┌───────────┐             │       │
│     │拼接上下文 │ -> │   LLM生成  │ <- ────────┘      │
│     └──────────┘    └───────────┘                     │
└─────────────────────────────────────────────────────┘
```

### RAG vs Fine-tuning？

| 特性 | RAG | Fine-tuning |
|------|-----|-------------|
| 目标 | 注入外部知识 | 学习特定任务 |
| 数据更新 | 实时更新 | 需要重新训练 |
| 成本 | 低 | 高 |
| 适用场景 | 知识密集型任务 | 行为调整 |
| 幻觉问题 | 减少幻觉 | 可能增加 |

```python
# RAG示例
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA

# 1. 创建向量存储
vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=OpenAIEmbeddings()
)

# 2. 创建RAG链
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"),
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3})
)

# 3. 查询
result = qa_chain.run("公司的退款政策是什么？")
```

## 文档处理

### 如何分割文档？

```python
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter,
    TokenTextSplitter
)

# 1. 递归字符分割（推荐）
recursive_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,  # 每块大小
    chunk_overlap=200,  # 重叠部分
    length_function=len,
    separators=["\n\n", "\n", " ", ""]  # 按优先级分割
)

splits = recursive_splitter.split_documents(documents)

# 2. 字符分割
char_splitter = CharacterTextSplitter(
    separator="\n",
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len
)

# 3. Token分割（更精确）
from langchain.text_splitter import TokenTextSplitter

token_splitter = TokenTextSplitter(
    chunk_size=500,  # token数量
    chunk_overlap=50,
    encoding_name="cl100k_base"  # GPT-4编码
)
```

**分割策略**：

```python
# 按语义分割（使用句子边界）
from langchain.text_splitter import MarkdownHeaderTextSplitter

markdown_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
)

md_document = """
# 第一章
这是第一章内容...

## 小节
这是小节内容...
"""

splits = markdown_splitter.split_text(md_document)
```

### 如何处理多模态文档？

```python
from unstructured.partition.pdf import partition_pdf
from langchain.schema import Document

# 提取PDF中的文本、表格、图片
elements = partition_pdf(
    filename="document.pdf",
    extract_images_in_pdf=True,
    infer_table_structure=True,
    chunking_strategy="by_title"
)

# 转换为Document对象
documents = []
for element in elements:
    if element.category == "Table":
        # 处理表格
        documents.append(Document(
            page_content=element.text,
            metadata={"type": "table"}
        ))
    elif element.category == "Image":
        # 处理图片（使用多模态模型）
        documents.append(Document(
            page_content=element.to_text(),
            metadata={"type": "image"}
        ))
```

### 如何处理数据更新？

```python
class VectorStoreUpdater:
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore

    def update_document(self, doc_id, new_content):
        """更新文档"""
        # 1. 删除旧文档
        self.vectorstore.delete(ids=[doc_id])

        # 2. 添加新文档
        from langchain.schema import Document
        new_doc = Document(
            page_content=new_content,
            metadata={"id": doc_id}
        )
        self.vectorstore.add_documents([new_doc])

    def add_documents(self, documents):
        """批量添加"""
        self.vectorstore.add_documents(documents)

    def delete_documents(self, ids):
        """批量删除"""
        self.vectorstore.delete(ids=ids)

# 使用
updater = VectorStoreUpdater(vectorstore)
updater.update_document("doc_123", "新的文档内容...")
```

## 向量数据库

### 主流向量数据库对比？

| 数据库 | 优点 | 缺点 | 适用场景 |
|--------|------|------|----------|
| **Chroma** | 轻量、易用 | 性能一般 | 原型开发 |
| **FAISS** | 高性能 | 内存限制 | 大规模检索 |
| **Pinecone** | 托管服务 | 价格高 | 生产环境 |
| **Weaviate** | 多模态 | 学习曲线 | 复杂查询 |
| **Qdrant** | 高性能、过滤 | 相对新 | 实时应用 |

### FAISS使用示例？

```python
import faiss
import numpy as np

# 1. 创建索引
dimension = 1536  # OpenAI embedding维度

# L2距离索引
index_l2 = faiss.IndexFlatL2(dimension)

# 内积索引（更快）
index_ip = faiss.IndexFlatIP(dimension)

# IVF索引（大规模数据）
quantizer = faiss.IndexFlatL2(dimension)
nlist = 100  # 聚类中心数
index_ivf = faiss.IndexIVFFlat(
    quantizer, dimension, nlist, faiss.METRIC_L2
)

# 2. 训练IVF索引（需要）
index_ivf.train(embeddings)
index_ivf.add(embeddings)

# 3. 搜索
distances, indices = index_ivf.search(query_embedding, k=10)

# 4. 保存索引
faiss.write_index(index_ivf, "index.faiss")

# 5. 加载索引
index = faiss.read_index("index.faiss")

# 6. GPU加速
res = faiss.StandardGpuResources()
gpu_index = faiss.index_cpu_to_gpu(res, 0, index_ivf)
```

### Pinecone使用示例？

```python
import pinecone

# 1. 初始化
pinecone.init(
    api_key="your-api-key",
    environment="us-east1-gcp"
)

# 2. 创建索引
index_name = "my-rag-index"
if index_name not in pinecone.list_indexes():
    pinecone.create_index(
        name=index_name,
        dimension=1536,
        metric="cosine",
        pods=1
    )

index = pinecone.Index(index_name)

# 3. 插入向量
vectors = [
    {
        "id": "vec1",
        "values": [0.1, 0.2, ...],
        "metadata": {"text": "文档内容..."}
    }
]
index.upsert(vectors=vectors)

# 4. 查询
results = index.query(
    vector=query_embedding,
    top_k=5,
    include_metadata=True,
    filter={"category": "tech"}  # 元数据过滤
)

# 5. 删除
index.delete(ids=["vec1"])
```

### 如何优化向量检索？

```python
# 1. 重排序（Reranking）
from sentence_transformers import CrossEncoder

reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def retrieve_with_rerank(query, vectorstore, top_k=50, rerank_top=10):
    """先粗排，再精排"""
    # 第一步：检索top_k个候选
    candidates = vectorstore.similarity_search(query, k=top_k)

    # 第二步：重排序
    pairs = [[query, doc.page_content] for doc in candidates]
    scores = reranker.predict(pairs)

    # 第三步：返回top rerank_top
    ranked_docs = sorted(
        zip(candidates, scores),
        key=lambda x: x[1],
        reverse=True
    )

    return [doc for doc, score in ranked_docs[:rerank_top]]

# 2. 混合检索（向量+关键词）
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def hybrid_search(query, vectorstore, documents, alpha=0.5):
    """混合向量检索和关键词检索"""
    # 向量检索
    vector_results = vectorstore.similarity_search(query, k=10)

    # 关键词检索
    tfidf = TfidfVectorizer()
    doc_texts = [doc.page_content for doc in documents]
    tfidf_matrix = tfidf.fit_transform(doc_texts)
    query_vec = tfidf.transform([query])
    keyword_scores = cosine_similarity(query_vec, tfidf_matrix)[0]

    # 融合分数
    combined_scores = {}
    for i, doc in enumerate(documents):
        vector_score = 0
        if doc in vector_results:
            vector_score = 1 / (vector_results.index(doc) + 1)

        combined_scores[doc] = (
            alpha * vector_score +
            (1 - alpha) * keyword_scores[i]
        )

    # 排序
    ranked = sorted(
        combined_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )

    return [doc for doc, score in ranked[:10]]
```

## 高级RAG

### 什么是Agentic RAG？

Agentic RAG让Agent自主决定何时检索、检索什么。

```python
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain.llms import OpenAI

# 定义检索工具
retrieval_tool = Tool(
    name="KnowledgeBase",
    func=lambda q: vectorstore.similarity_search(q, k=3),
    description="搜索知识库，输入问题"
)

# 定义搜索工具
search_tool = Tool(
    name="WebSearch",
    func=lambda q: web_search(q),
    description="搜索网络，输入查询"
)

# 创建Agent
tools = [retrieval_tool, search_tool]
agent = create_react_agent(
    llm=OpenAI(temperature=0),
    tools=tools,
    prompt=retrieval_agent_prompt
)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=5
)

# Agent自主决定检索策略
result = agent_executor.invoke({
    "input": "最新的Python3.12特性有哪些？"
})
```

### 什么是多跳检索？

```python
def multi_hop_retrieval(query, vectorstore, hops=2):
    """多跳检索，逐步细化"""
    current_query = query
    context_parts = []

    for hop in range(hops):
        # 检索相关文档
        docs = vectorstore.similarity_search(current_query, k=3)

        # 提取关键信息
        context = "\n".join([doc.page_content for doc in docs])
        context_parts.append(context)

        # 基于上下文生成下一个查询
        if hop < hops - 1:
            current_query = llm.predict(
                f"基于上下文：{context}\n"
                f"原问题：{query}\n"
                f"生成更具体的查询："
            )

    # 综合所有上下文回答
    full_context = "\n\n".join(context_parts)
    answer = llm.predict(
        f"基于以下上下文回答问题：\n{full_context}\n"
        f"问题：{query}"
    )

    return answer
```

### 什么是自适应检索？

```python
from langchain.chains import ConversationalRetrievalChain
from langchain.chains.question_answering import load_qa_chain

class AdaptiveRetrieval:
    def __init__(self, llm, vectorstore):
        self.llm = llm
        self.vectorstore = vectorstore

    def should_retrieve(self, query):
        """判断是否需要检索"""
        decision = self.llm.predict(
            f"问题：{query}\n"
            f"这个问题是否需要检索外部知识？"
            f"回答：需要或不需要"
        )
        return "需要" in decision

    def answer(self, query):
        """自适应回答"""
        if self.should_retrieve(query):
            # 需要检索
            docs = self.vectorstore.similarity_search(query, k=3)
            context = "\n".join([doc.page_content for doc in docs])

            answer = self.llm.predict(
                f"基于上下文：{context}\n问题：{query}"
            )
            return answer
        else:
            # 直接回答
            return self.llm.predict(query)

# 使用
adaptive_rag = AdaptiveRetrieval(llm, vectorstore)
answer = adaptive_rag.answer("北京的天气怎么样？")
```

### 什么是检索优化？

```python
# 1. 查询改写
from langchain.prompts import PromptTemplate

rewrite_prompt = PromptTemplate(
    input_variables=["question"],
    template="""
    原始问题：{question}

    请生成3个不同角度的改写问题，用于提高检索效果：
    1.
    2.
    3.
    """
)

def query_expansion(query, llm):
    """查询扩展"""
    rewrites = llm(rewrite_prompt.format(question=query))
    queries = [query] + rewrites.split("\n")

    # 多路召回
    all_docs = []
    for q in queries:
        docs = vectorstore.similarity_search(q, k=3)
        all_docs.extend(docs)

    # 去重
    unique_docs = list({doc.page_content: doc for doc in all_docs}.values())
    return unique_docs[:10]

# 2. 假设性文档嵌入（HyDE）
def hyde_retrieval(query, llm, vectorstore):
    """生成假设答案，然后用答案检索"""
    # 生成假设答案
    hypothetical_answer = llm.predict(
        f"问题：{query}\n"
        f"请生成一个可能的答案（可以是假设的）："
    )

    # 用假设答案检索
    docs = vectorstore.similarity_search(
        hypothetical_answer,
        k=5
    )

    # 基于检索结果回答
    context = "\n".join([doc.page_content for doc in docs])
    final_answer = llm.predict(
        f"基于上下文：{context}\n问题：{query}"
    )

    return final_answer
```

## RAG评估

### 如何评估RAG系统？

```python
from ragas import evaluate
from datasets import Dataset

# 准备评估数据
eval_data = {
    "question": [
        "什么是RAG？",
        "如何使用LangChain？"
    ],
    "answer": [
        "RAG是检索增强生成...",
        "LangChain是一个框架..."
    ],
    "contexts": [
        ["RAG是...", "检索增强生成..."],
        ["LangChain是...", "使用方法..."]
    ],
    "ground_truths": [
        ["RAG结合了检索和生成"],
        ["LangChain用于开发LLM应用"]
    ]
}

dataset = Dataset.from_dict(eval_data)

# 评估
result = evaluate(dataset)

# 指标：
# - faithfulness: 忠实度（答案是否基于上下文）
# - answer_relevancy: 相关性（答案是否相关）
# - context_precision: 上下文精度
# - context_recall: 上下文召回率
```

### 如何进行AB测试？

```python
def ab_test_rag(query, retriever_a, retriever_b, llm):
    """对比两个检索器"""
    # 检索器A
    docs_a = retriever_a.get_relevant_documents(query, k=5)
    answer_a = llm.predict(
        f"基于：{docs_a}\n问题：{query}"
    )

    # 检索器B
    docs_b = retriever_b.get_relevant_documents(query, k=5)
    answer_b = llm.predict(
        f"基于：{docs_b}\n问题：{query}"
    )

    # 人工评估或自动评估
    return {
        "retriever_a": {
            "docs": docs_a,
            "answer": answer_a
        },
        "retriever_b": {
            "docs": docs_b,
            "answer": answer_b
        }
    }
```

## 2024-2025大厂高频RAG面试题（50+题）

### 基础概念类

1. **什么是RAG？它的核心优势是什么？**
   - RAG（Retrieval-Augmented Generation）结合检索和生成
   - 核心优势：
     - 减少幻觉（基于事实回答）
     - 知识可更新（更新文档库即可）
     - 可解释性强（可追溯来源）
     - 成本低（无需微调）

2. **RAG vs 微调（SFT）的区别和选择？**
   ```python
   # RAG适用场景：
   - 需要最新知识（新闻、文档）
   - 答案需要可追溯
   - 数据变化频繁
   - 预算有限

   # 微调适用场景：
   - 需要特定格式/风格
   - 需要特定领域知识内化
   - 需要降低推理成本
   - 数据量足够（10k+样本）
   ```

3. **RAG的完整流程是什么？**
   ```
   文档 -> 分割 -> 向量化 -> 存储
                           ↓
   用户查询 -> 向量化 -> 相似度检索 -> 排序
                           ↓
                    拼接上下文 -> LLM生成 -> 返回答案
   ```

4. **什么是Naive RAG？它有什么问题？**
   - Naive RAG：简单的检索+生成
   - 问题：
     - 检索精度不够
     - 上下文窗口限制
     - 多跳推理能力弱
     - 无法处理复杂查询

### 文档处理类

5. **文档分块有哪些策略？如何选择？（美团必问）**
   ```python
   # 1. 固定大小分块（最简单）
   text_splitter = RecursiveCharacterTextSplitter(
       chunk_size=1000,
       chunk_overlap=200
   )

   # 2. 语义分块（更智能）
   from langchain.text_splitter import SemanticChunker
   semantic_splitter = SemanticChunker(
       embeddings=embeddings,
       breakpoint_threshold_type="percentile"
   )

   # 3. 递归字符分块（平衡）
   recursive_splitter = RecursiveCharacterTextSplitter(
       separators=["\n\n", "\n", " ", ""]
   )

   # 选择策略：
   # - 固定大小：通用场景，简单快速
   # - 语义分块：需要保持语义完整
   # - 递归分块：平衡性能和质量（推荐）
   ```

6. **chunk_size和chunk_overlap如何设置？（阿里高频）**
   ```python
   # chunk_size选择：
   # - 512 tokens：短文档，高精度
   # - 1000-1500 tokens：通用（推荐）
   # - 2000+ tokens：长文档，但可能降低精度

   # chunk_overlap选择：
   # - 10-15%：避免上下文断裂
   # - 100-200 tokens：常用设置
   # - 过大会导致冗余，过小会丢失边界信息

   # 实践建议：
   chunk_size = 1000  # 约750个单词
   chunk_overlap = 200  # 20%
   ```

7. **什么是后期分块（Late Chunking）？为什么它更好？**
   ```python
   # 传统分块：先分块，再embedding
   chunks = text.split("...")
   embeddings = [embed(c) for c in chunks]

   # 后期分块：先embedding整段，再分块
   full_embedding = embed(full_text)
   chunks = split_with_awareness(full_text, full_embedding)

   # 优点：
   # - 保留更多上下文信息
   # - 更准确的语义表示
   # - 减少边界信息丢失
   ```

8. **如何处理表格、图片等多模态文档？**
   ```python
   from unstructured.partition.pdf import partition_pdf

   # 提取多模态元素
   elements = partition_pdf(
       filename="document.pdf",
       extract_images_in_pdf=True,
       infer_table_structure=True,
       chunking_strategy="by_title"
   )

   # 分类处理
   for element in elements:
       if element.category == "Table":
           # 转换为Markdown或HTML
           table_markdown = element.to_markdown()
       elif element.category == "Image":
           # 使用多模态模型（如GPT-4V）
           image_description = describe_image(element.to_image())
   ```

### 向量检索类

9. **什么是混合检索（Hybrid Search）？为什么需要它？（字节必问）**
   ```python
   def hybrid_search(query, vectorstore, bm25_index, alpha=0.5):
       """结合向量检索和关键词检索"""
       # 向量检索（语义）
       vector_results = vectorstore.similarity_search(query, k=10)

       # 关键词检索（字面）
       keyword_results = bm25_index.search(query, k=10)

       # 分数融合（RRF - Reciprocal Rank Fusion）
       def rrf_score(rank, k=60):
           return 1 / (k + rank)

       combined_scores = {}
       for i, doc in enumerate(vector_results):
           combined_scores[doc] = (
               combined_scores.get(doc, 0) +
               alpha * rrf_score(i)
           )

       for i, doc in enumerate(keyword_results):
           combined_scores[doc] = (
               combined_scores.get(doc, 0) +
               (1 - alpha) * rrf_score(i)
           )

       return sorted(combined_scores.items(), key=lambda x: -x[1])

   # 为什么需要：
   # - 向量检索：擅长语义匹配（"汽车"="轿车"）
   # - 关键词检索：擅长精确匹配（专有名词、ID）
   # - 混合检索：结合两者优势
   ```

10. **什么是重排序（Reranking）？如何实现？**
    ```python
    from sentence_transformers import CrossEncoder

    # 两阶段检索
    def two_stage_retrieval(query, vectorstore, reranker):
        # Stage 1: 快速粗排（召回）
        candidates = vectorstore.similarity_search(query, k=100)

        # Stage 2: 精细排序（重排）
        pairs = [[query, doc.page_content] for doc in candidates]
        scores = reranker.predict(pairs)

        # 重新排序
        ranked_docs = sorted(
            zip(candidates, scores),
            key=lambda x: x[1],
            reverse=True
        )

        return ranked_docs[:10]

    # 为什么需要：
    # - 第一阶段：快速召回（精度可接受）
    # - 第二阶段：精确排序（质量更高）
    # - 成本：只对少量候选做重排，控制成本
    ```

11. **什么是HyDE（假设性文档嵌入）？**
    ```python
    def hyde_retrieval(query, llm, vectorstore):
        # 1. 生成假设答案
        hypothetical_doc = llm.predict(
            f"请基于问题生成一个可能的答案：{query}"
        )

        # 2. 用假设文档检索
        results = vectorstore.similarity_search(
            hypothetical_doc,
            k=5
        )

        # 3. 基于真实文档回答
        context = "\n".join([r.page_content for r in results])
        answer = llm.predict(
            f"基于上下文：{context}\n问题：{query}"
        )

        return answer

    # 原理：
    # - 查询："如何减肥？"（短）
    # - 假设答案："通过运动和饮食控制..."（长、语义丰富）
    # - 用假设答案检索，更容易找到相关文档
    ```

12. **什么是查询重写（Query Rewriting）？**
    ```python
    # 多查询重写
    def multi_query_rewriting(query, llm, vectorstore):
        prompt = f"""
        原问题：{query}

        请生成3个不同角度的改写问题，提高检索效果：
        1.
        2.
        3.
        """

        rewrites = llm.predict(prompt)
        queries = [query] + rewrites.split("\n")

        # 多路召回
        all_docs = []
        for q in queries:
            docs = vectorstore.similarity_search(q, k=3)
            all_docs.extend(docs)

        # 去重、排序
        unique_docs = list({doc.page_content: doc for doc in all_docs}.values())
        return unique_docs[:10]
    ```

### 高级RAG架构类

13. **什么是GraphRAG？（微软最新方案）**
    ```python
    # GraphRAG = RAG + 知识图谱
    # 步骤：
    # 1. 从文档抽取实体和关系
    # 2. 构建知识图谱
    # 3. 用图谱增强检索

    from graphrag import GraphRAG

    # 创建图谱
    graph_rag = GraphRAG(
        llm=llm,
        embedding_model=embeddings
    )

    # 索引文档
    graph_rag.index(documents)

    # 检索（同时返回文档和图谱信息）
    results = graph_rag.query(
        "马斯克和OpenAI的关系？",
        retriever_mode="hybrid"  # 同时使用向量+图谱
    )

    # 优势：
    # - 捕捉实体关系（如"A是B的CEO"）
    # - 多跳推理能力
    # - 减少幻觉
    ```

14. **什么是Agentic RAG？（2025热门）**
    ```python
    # Agentic RAG：让Agent自主决定检索策略
    from langchain.agents import Tool, AgentExecutor

    # 定义多个检索工具
    tools = [
        Tool(name="VectorSearch", func=vector_search),
        Tool(name="KeywordSearch", func=keyword_search),
        Tool(name="GraphSearch", func=graph_search),
        Tool(name="WebSearch", func=web_search)
    ]

    # Agent自动选择最优检索策略
    agent = create_react_agent(llm, tools)

    # 用户：Python3.12新特性？
    # Agent思考：需要最新信息 -> 选择WebSearch
    # 用户：公司退款政策？
    # Agent思考：内部文档 -> 选择VectorSearch
    ```

15. **什么是自适应RAG（Self-RAG）？**
    ```python
    class SelfRAG:
        def __init__(self, llm, retriever):
            self.llm = llm
            self.retriever = retriever

        def query(self, question):
            # 1. 判断是否需要检索
            needs_retrieval = self._judge_need_retrieval(question)

            if not needs_retrieval:
                return self.llm.predict(question)

            # 2. 检索
            docs = self.retriever.retrieve(question, k=5)

            # 3. 评估检索质量
            is_relevant = self._check_relevance(question, docs)

            if not is_relevant:
                # 重新检索或用搜索
                docs = self.web_search(question)

            # 4. 生成答案
            answer = self._generate_answer(question, docs)

            # 5. 检查答案质量
            is_supported = self._verify_support(answer, docs)

            if not is_supported:
                return "抱歉，我无法基于现有信息回答此问题。"

            return answer

    # Self-RAG优势：
    # - 自主决策是否检索
    # - 评估检索质量
    # - 验证答案真实性
    ```

16. **什么是模块化RAG（Modular RAG）？**
    ```python
    # Modular RAG：可组合的RAG模块

    # 检索模块
    retrieval_modules = {
        "vector": VectorRetrieval(),
        "keyword": KeywordRetrieval(),
        "hybrid": HybridRetrieval()
    }

    # 生成模块
    generation_modules = {
        "gpt4": GPT4Generator(),
        "claude": ClaudeGenerator(),
        "local": LocalLLM()
    }

    # 优化模块
    optimization_modules = {
        "rerank": RerankOptimizer(),
        "hyde": HyDEOptimizer(),
        "query_rewrite": QueryRewriteOptimizer()
    }

    # 灵活组合
    def build_rag_pipeline(
        retrieval="hybrid",
        generation="gpt4",
        optimization=["rerank", "hyde"]
    ):
        pipeline = []
        pipeline.append(retrieval_modules[retrieval])
        for opt in optimization:
            pipeline.append(optimization_modules[opt])
        pipeline.append(generation_modules[generation])
        return pipeline
    ```

### RAG优化类

17. **如何解决RAG的召回问题？（美团必问）**
    ```python
    # 召回优化策略：

    # 1. 增加检索数量
    docs = vectorstore.similarity_search(query, k=20)  # 增加到20

    # 2. 多路召回
    vector_docs = vectorstore.search(query)
    keyword_docs = bm25.search(query)
    graph_docs = graph.search(query)
    all_docs = merge_and_dedupe(vector_docs, keyword_docs, graph_docs)

    # 3. 查询扩展
    expanded_queries = expand_query(query)
    all_docs = []
    for q in expanded_queries:
        all_docs.extend(vectorstore.search(q))

    # 4. 调整chunk策略
    # - 减小chunk_size，提高精度
    # - 增加overlap，避免遗漏

    # 5. 使用更好的embedding模型
    # - OpenAI: text-embedding-3-large
    # - Cohere: embed-multilingual-v3.0
    # - BGE-M3 (开源最强)
    ```

18. **如何提高RAG的准确率？（阿里、腾讯必问）**
    ```python
    # 准确率优化：

    # 1. 重排序（最重要）
    reranked_docs = reranker.rank(query, candidates)

    # 2. 优化Prompt
    prompt = f"""
    你是一个专业的助手。
    请基于以下上下文回答问题，不要编造信息。

    上下文：
    {context}

    问题：{query}

    如果上下文中没有答案，请明确说明。
    """

    # 3. 上下文选择
    # - 只选择最相关的前3-5个文档
    # - 计算相似度分数，设置阈值

    # 4. 答案验证
    def verify_answer(answer, context):
        # 用LLM验证答案是否基于上下文
        verification = llm.predict(f"""
        答案：{answer}
        上下文：{context}

        答案是否完全基于上下文？是/否
        """)
        return "是" in verification
    ```

19. **如何优化RAG的延迟？（字节必问）**
    ```python
    # 性能优化：

    # 1. 并行处理
    import asyncio

    async def parallel_retrieval(query):
        results = await asyncio.gather(
            vector_search_async(query),
            keyword_search_async(query)
        )
        return merge_results(results)

    # 2. 缓存
    from functools import lru_cache

    @lru_cache(maxsize=1000)
    def cached_retrieval(query_hash):
        return vectorstore.search(query)

    # 3. 使用更快的模型
    # - embedding: bge-small（快） vs bge-large（准）
    # - LLM: gpt-3.5-turbo（快） vs gpt-4（准）

    # 4. 量化向量
    quantized_index = faiss.IndexFlatIP(dimension)
    faiss.index_cpu_to_gpu(res, 0, quantized_index)

    # 5. 批处理
    def batch_retrieve(queries):
        return vectorstore.similarity_search_batch(queries, k=5)
    ```

20. **如何处理多轮对话的RAG？（美团高频）**
    ```python
    from langchain.memory import ConversationBufferMemory

    class ConversationalRAG:
        def __init__(self, vectorstore, llm):
            self.vectorstore = vectorstore
            self.llm = llm
            self.memory = ConversationBufferMemory(
                return_messages=True
            )

        def query(self, question):
            # 1. 获取历史对话
            history = self.memory.load_memory_variables({})["history"]

            # 2. 查询重写（融入上下文）
            rewritten_query = self.rewrite_query(question, history)

            # 3. 检索
            docs = self.vectorstore.similarity_search(rewritten_query)

            # 4. 生成答案
            context = "\n".join([d.page_content for d in docs])
            prompt = f"""
            对话历史：
            {history}

            相关上下文：
            {context}

            当前问题：{question}
            """

            answer = self.llm.predict(prompt)

            # 5. 更新记忆
            self.memory.save_context(
                {"input": question},
                {"output": answer}
            )

            return answer
    ```

### 向量数据库类

21. **向量数据库选型：Pinecone vs Milvus vs Qdrant？**
    ```python
    # 对比表：

    # Pinecone:
    #   - 优点：托管服务，易用，性能好
    #   - 缺点：价格高，国内访问慢
    #   - 适用：快速原型，国外项目

    # Milvus:
    #   - 优点：开源，功能全，社区活跃
    #   - 缺点：部署复杂，需要运维
    #   - 适用：大规模，需要定制

    # Qdrant:
    #   - 优点：性能高，易部署，支持过滤
    #   - 缺点：相对较新
    #   - 适用：性能敏感，需要元数据过滤

    # Weaviate:
    #   - 优点：多模态，GraphQL
    #   - 缺点：学习曲线陡
    #   - 适用：复杂查询，多模态
    ```

22. **如何设计向量数据库的Schema？（阿里高频）**
    ```python
    # Qdrant Schema设计示例
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams, PointStruct

    client.create_collection(
        collection_name="documents",
        vectors_config=VectorParams(
            size=1536,  # OpenAI embedding维度
            distance=Distance.COSINE
        ),
        # 添加索引字段
        optimizers_config={
            "indexing_threshold": 20000  # 超过2万向量时创建索引
        },
        # HNSW参数（性能优化）
        hnsw_config={
            "m": 16,  # 每层最多16个连接
            "ef_construct": 100  # 构建时搜索范围
        }
    )

    # 插入数据（带元数据）
    client.upsert(
        collection_name="documents",
        points=[
            PointStruct(
                id=1,
                vector=embedding,
                payload={
                    "text": "文档内容",
                    "category": "技术",
                    "date": "2024-01-01",
                    "author": "张三"
                }
            )
        ]
    )

    # 带过滤查询
    client.search(
        collection_name="documents",
        query_vector=query_embedding,
        query_filter={
            "must": [
                {"key": "category", "match": {"value": "技术"}}
            ]
        },
        limit=5
    )
    ```

23. **如何优化向量数据库的性能？（字节必问）**
    ```python
    # 优化策略：

    # 1. 索引优化
    # - HNSW（Hierarchical Navigable Small World）
    # - IVF（Inverted File）
    # - PQ（Product Quantization）

    # 2. 分片（Sharding）
    # - 按文档类别分片
    # - 减少单次检索范围

    # 3. 查询优化
    # - 增加ef提高精度（但会变慢）
    # - 设置合理的top_k（5-10）

    # 4. 硬件优化
    # - 使用GPU加速
    # - 增加内存

    # 5. 数据预热
    def warmup_index(vectorstore, frequent_queries):
        """预热索引"""
        for query in frequent_queries:
            vectorstore.search(query)
    ```

### Embedding模型类

24. **主流Embedding模型对比？（美团必问）**
    ```python
    # 对比：

    # OpenAI text-embedding-3-large:
    #   - 维度：3072
    #   - 优点：质量高，多语言支持好
    #   - 缺点：贵，需要API调用

    # BGE-M3 (BAAI):
    #   - 维度：1024
    #   - 优点：开源，中文好，支持多语言、多函数
    #   - 缺点：需要GPU

    # Cohere embed-multilingual-v3.0:
    #   - 维度：1024
    #   - 优点：商业API，稳定性好
    #   - 缺点：贵

    # E5-large-v2 (Microsoft):
    #   - 维度：1024
    #   - 优点：开源，性能好
    #   - 缺点：只支持英文

    # 选择建议：
    # - 中文：BGE-M3
    # - 英文：E5-large-v2 或 OpenAI
    # - 多语言：Cohere 或 BGE-M3
    # - 本地部署：BGE系列
    ```

25. **如何微调Embedding模型？（阿里高频）**
    ```python
    from sentence_transformers import SentenceTransformer, losses

    # 1. 准备训练数据
    train_examples = [
        InputExample(
            texts=['查询', '正样本文档'],
            label=1.0
        ),
        InputExample(
            texts=['查询', '负样本文档'],
            label=0.0
        )
    ]

    # 2. 加载预训练模型
    model = SentenceTransformer('BAAI/bge-base-zh-v1.5')

    # 3. 定义损失函数
    train_loss = losses.MultipleNegativesRankingLoss(model)

    # 4. 训练
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=3,
        warmup_steps=100
    )

    # 5. 保存
    model.save('finetuned_embedding')

    # 微调场景：
    # - 医疗、法律等垂直领域
    # - 需要理解特定术语
    # - 提高领域内相似度判断
    ```

### RAG评估类

26. **RAG系统如何评估？（RAGAS框架）（美团必问）**
    ```python
    from ragas import evaluate
    from ragas.metrics import (
        faithfulness,
        answer_relevancy,
        context_precision,
        context_recall
    )

    # 评估维度：

    # 1. Faithfulness (忠实度)
    #    - 答案是否基于上下文
    #    - 是否有幻觉
    #    范围：0-1

    # 2. Answer Relevancy (相关性)
    #    - 答案是否回答了问题
    #    - 范围：0-1

    # 3. Context Precision (上下文精度)
    #    - 检索的文档是否相关
    #    - 范围：0-1

    # 4. Context Recall (上下文召回)
    #    - 是否检索到了所有相关文档
    #    - 范围：0-1

    # 执行评估
    results = evaluate(
        dataset=eval_dataset,
        metrics=[
            faithfulness,
            answer_relevancy,
            context_precision,
            context_recall
        ]
    )

    print(results)
    # {'faithfulness': 0.85, 'answer_relevancy': 0.82, ...}
    ```

27. **如何构建RAG评估数据集？（阿里高频）**
    ```python
    # 方法1：人工标注
    eval_dataset = [
        {
            "question": "如何退款？",
            "ground_truth": "可以在设置中申请退款...",
            "context": ["退款政策文档..."],
            "answer": "根据上下文，您可以..."
        }
    ]

    # 方法2：GPT-4生成（推荐）
    def generate_eval_data(documents, num_samples=100):
        """用GPT-4自动生成评估数据"""
        eval_data = []

        for doc in random.sample(documents, num_samples):
            # 生成问题
            question = llm.predict(f"""
            基于以下文档生成一个相关问题：
            {doc}

            问题：
            """)

            # 生成标准答案
            ground_truth = llm.predict(f"""
            问题：{question}
            文档：{doc}

            请基于文档回答问题：
            """)

            # RAG检索和生成
            retrieved_docs = vectorstore.search(question)
            context = [d.page_content for d in retrieved_docs]
            answer = llm.predict(f"基于{context}回答：{question}")

            eval_data.append({
                "question": question,
                "ground_truth": ground_truth,
                "contexts": [context],
                "answer": answer
            })

        return eval_dataset
    ```

### LLM与RAG结合类

28. **如何选择合适的LLM模型？（字节必问）**
    ```python
    # 选择标准：

    # 1. 性能 vs 成本
    #    - GPT-4o：性能最好，贵（$5/1M tokens）
    #    - GPT-4o-mini：性价比高（$0.15/1M）
    #    - Claude 3.5 Sonnet：平衡，便宜（$3/1M）
    #    - LLaMA 3.1 70B：开源，需要GPU

    # 2. 任务类型
    #    - 简单问答：GPT-3.5-turbo / GPT-4o-mini
    #    - 复杂推理：GPT-4o / Claude 3.5 Sonnet
    #    - 中文：Claude 3.5 Sonnet / Qwen

    # 3. 延迟要求
    #    - 实时：使用小模型或量化模型
    #    - 离线：使用大模型

    # 4. 数据隐私
    #    - 敏感数据：本地部署（LLaMA, Qwen）
    #    - 非敏感数据：API调用

    # 推荐：
    #    - 通用：GPT-4o-mini（性价比）
    #    - 中文：Qwen 2.5 72B（开源最强）
    #    - 低成本：Llama 3.1 8B
    ```

29. **如何优化Prompt提高RAG效果？（美团高频）**
    ```python
    # Prompt优化技巧：

    # 1. 明确角色和任务
    prompt = """
    你是一个专业的客服助手。
    你的任务是基于提供的知识库文档回答用户问题。

    规则：
    1. 只使用提供的上下文信息
    2. 如果上下文中没有答案，明确告知用户
    3. 保持回答简洁准确

    上下文：
    {context}

    问题：{question}
    """

    # 2. 使用思维链（CoT）
    prompt = """
    问题：{question}

    让我们一步步思考：
    1. 理解问题的核心
    2. 在上下文中查找相关信息
    3. 综合信息给出答案

    上下文：{context}
    """

    # 3. 提供示例（Few-shot）
    prompt = """
    示例：
    上下文：苹果是红色的水果。
    问题：苹果是什么颜色？
    答案：红色

    现在请回答：
    上下文：{context}
    问题：{question}
    """

    # 4. 要求引用来源
    prompt = """
    基于上下文回答问题，并注明信息来源。

    上下文：
    {context}

    问题：{question}

    答案格式：
    答案：...
    来源：文档X 第Y段
    """
    ```

30. **如何减少RAG的Token消耗？（阿里必问）**
    ```python
    # Token优化策略：

    # 1. 优化检索数量
    #    k=5 -> k=3（减少上下文）

    # 2. 智能截断
    def smart_truncate(doc, max_tokens=500):
        """保留关键信息"""
        # 只保留第一段和最后一段
        paragraphs = doc.split('\n\n')
        if len(paragraphs) > 2:
            return paragraphs[0] + '\n\n' + paragraphs[-1]
        return doc

    # 3. 使用更小的模型
    #    GPT-4o (128k) -> GPT-4o-mini (128k, 便宜10倍)

    # 4. 缓存常见问题
    from functools import lru_cache

    @lru_cache(maxsize=100)
    def cached_answer(question_hash):
        # 问答对缓存
        pass

    # 5. 批量处理
    def batch_answer(questions):
        """批量处理降低成本"""
        answers = llm.predict(
            "\n\n".join([f"Q: {q}" for q in questions])
        )
        return answers.split('\n\n')

    # 节省比例：30-50%
    ```

---

**Sources:**
- [2025 年AI 大模型面试必看：RAG 核心问题深度解析](https://blog.csdn.net/ytt0523_com/article/details/150588279)
- [最新最全AI大模型岗面试题来了！530+ 高频](https://zhuanlan.zhihu.com/p/1977429611001439798)
- [2025年大模型面试必备：30个RAG常见问题及答案](https://blog.csdn.net/Android23333/article/details/154430604)
- [美团面试：LLM大模型存在哪些问题？RAG 优化有哪些方法？](https://www.cnblogs.com/crazymakercircle/p/18841145)

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
