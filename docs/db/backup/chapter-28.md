---
title: 第29章：AI 应用数据库架构
---

# ：AI 应用数据库架构

> **难度等级**：⭐⭐⭐⭐⭐ 专家级 | **学习时长**：15小时 | **实战项目**：AI 智能搜索系统

## 📚 本章目录

- [28.1 RAG 检索增强](#281-rag-检索增强)
- [28.2 向量搜索优化](#282-向量搜索优化)
- [28.3 混合检索](#283-混合检索)
- [28.4 性能调优](#284-性能调优)
- [28.5 实战项目：AI 搜索系统](#285-实战项目ai-搜索系统)

---

## RAG 检索增强

### 什么是 RAG

```
┌──────────────────────────────────────────────────────┐
│            RAG (Retrieval-Augmented Generation)      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  传统 LLM 生成:                                       │
│  ┌─────────┐         ┌─────────┐                    │
│  │ 用户    │────────→│   LLM   │                    │
│  │ 问题    │         │ 生成回答 │                    │
│  └─────────┘         └─────────┘                    │
│                           │                          │
│                           ▼                          │
│                    可能产生幻觉                        │
│                    知识截止日期限制                    │
│                                                      │
│  RAG 增强:                                           │
│  ┌─────────┐                                         │
│  │ 用户    │                                         │
│  │ 问题    │                                         │
│  └────┬────┘                                         │
│       │                                               │
│       ├──────────────────┐                          │
│       │                  │                          │
│       ▼                  ▼                          │
│  ┌─────────┐       ┌─────────┐                     │
│  │知识库   │       │  搜索   │                     │
│  │(文档)   │       │ 引擎    │                     │
│  └─────────┘       └────┬────┘                     │
│                          │                          │
│                    检索相关文档                       │
│                          │                          │
│                          ▼                          │
│  ┌────────────────────────────────────────┐         │
│  │            Prompt + 上下文              │         │
│  └─────────────────┬──────────────────────┘         │
│                    │                                 │
│                    ▼                                 │
│  ┌─────────┐       ┌─────────┐       ┌─────────┐  │
│  │  上下文  │──────→│   LLM   │──────→│ 更准确  │  │
│  │         │       │ 生成回答 │       │ 的回答  │  │
│  └─────────┘       └─────────┘       └─────────┘  │
│                                                      │
│  优点:                                              │
│  ✅ 减少幻觉                                          │
│  ✅ 知识实时更新                                      │
│  ✅ 可解释性强                                        │
│  ✅ 成本低（不需要微调模型）                           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### RAG 架构设计

**数据库层**：

```python
from pymilvus import Collection, FieldSchema, CollectionSchema, DataType
from pymilvus import connections
from sentence_transformers import SentenceTransformer
import chromadb

# 连接向量数据库
connections.connect(host='localhost', port='19530')

# 创建文档 Collection
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="doc_id", dtype=DataType.VARCHAR, max_length=100),
    FieldSchema(name="chunk_id", dtype=DataType.VARCHAR, max_length=100),
    FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=65535),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=384),
    FieldSchema(name="metadata", dtype=DataType.JSON),
    FieldSchema(name="created_at", dtype=DataType.INT64)
]
schema = CollectionSchema(fields, description="RAG documents")
doc_collection = Collection(name="rag_documents", schema=schema)

# 创建索引
index_params = {
    "metric_type": "COSINE",
    "index_type": "HNSW",
    "params": {"M": 16, "efConstruction": 200}
}
doc_collection.create_index(field_name="embedding", index_params=index_params)

# 加载嵌入模型
embedder = SentenceTransformer('all-MiniLM-L6-v2')
```

**文档处理流程**：

```python
import uuid
from datetime import datetime
import hashlib

class DocumentProcessor:
    def __init__(self, chunk_size=500, chunk_overlap=50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_document(self, text, doc_id):
        """将文档切分为块"""
        chunks = []
        start = 0
        chunk_idx = 0

        while start < len(text):
            end = start + self.chunk_size
            chunk = text[start:end]

            chunk_id = f"{doc_id}_chunk_{chunk_idx}"
            chunks.append({
                "chunk_id": chunk_id,
                "content": chunk,
                "start": start,
                "end": end
            })

            start = end - self.chunk_overlap
            chunk_idx += 1

        return chunks

    def embed_chunks(self, chunks):
        """生成向量嵌入"""
        texts = [chunk["content"] for chunk in chunks]
        embeddings = embedder.encode(texts).tolist()
        return embeddings

    def store_chunks(self, doc_id, chunks, embeddings, metadata=None):
        """存储到向量数据库"""
        now = int(datetime.now().timestamp() * 1000)

        entities = [
            [doc_id] * len(chunks),  # doc_ids
            [chunk["chunk_id"] for chunk in chunks],  # chunk_ids
            [chunk["content"] for chunk in chunks],  # contents
            embeddings,  # embeddings
            [metadata] * len(chunks) if metadata else [{}] * len(chunks),  # metadata
            [now] * len(chunks)  # created_at
        ]

        doc_collection.insert(entities)
        doc_collection.flush()

# 使用示例
processor = DocumentProcessor(chunk_size=500, chunk_overlap=50)

# 处理文档
document = """
人工智能（AI）是计算机科学的一个分支，
致力于创建能够执行通常需要人类智能的任务的系统。
这包括学习、推理、问题解决、感知和语言理解等能力。
"""

doc_id = str(uuid.uuid4())
chunks = processor.chunk_document(document, doc_id)
embeddings = processor.embed_chunks(chunks)

metadata = {
    "title": "人工智能介绍",
    "author": "AI Expert",
    "category": "技术",
    "tags": ["AI", "机器学习", "深度学习"]
}

processor.store_chunks(doc_id, chunks, embeddings, metadata)

# 加载到内存
doc_collection.load()
```

**检索增强生成**：

```python
import openai

class RAGSystem:
    def __init__(self, collection, top_k=3):
        self.collection = collection
        self.top_k = top_k

    def retrieve(self, query, filters=None):
        """检索相关文档"""
        # 生成查询向量
        query_embedding = embedder.encode([query]).tolist()

        # 构建过滤表达式
        expr = None
        if filters:
            conditions = []
            for key, value in filters.items():
                if isinstance(value, str):
                    conditions.append(f'metadata["{key}"] == "{value}"')
                else:
                    conditions.append(f'metadata["{key}"] == {value}')
            expr = " and ".join(conditions)

        # 搜索
        results = self.collection.search(
            data=query_embedding,
            anns_field="embedding",
            param={"metric_type": "COSINE", "params": {"ef": 64}},
            limit=self.top_k,
            expr=expr,
            output_fields=["doc_id", "chunk_id", "content", "metadata"]
        )

        return results[0]

    def generate(self, query, context):
        """生成回答"""
        # 构建 prompt
        prompt = f"""基于以下上下文信息回答问题。

上下文信息：
{context}

问题：{query}

回答："""

        # 调用 LLM
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "你是一个专业的助手，基于提供的上下文信息回答问题。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        return response.choices[0].message.content

    def query(self, query, filters=None):
        """完整 RAG 流程"""
        # 1. 检索
        results = self.retrieve(query, filters)

        # 2. 构建上下文
        context_parts = []
        for hit in results:
            context_parts.append(f"[来源: {hit.entity.get('metadata').get('title', 'Unknown')}]")
            context_parts.append(hit.entity.get('content'))

        context = "\n\n".join(context_parts)

        # 3. 生成
        answer = self.generate(query, context)

        return {
            "answer": answer,
            "sources": [
                {
                    "content": hit.entity.get('content'),
                    "metadata": hit.entity.get('metadata'),
                    "score": hit.distance
                }
                for hit in results
            ]
        }

# 使用示例
rag = RAGSystem(doc_collection, top_k=3)

query = "什么是人工智能？"
result = rag.query(query)

print(f"问题：{query}")
print(f"回答：{result['answer']}")
print("\n参考来源：")
for source in result['sources']:
    print(f"- {source['metadata'].get('title')} (相关度: {source['score']:.4f})")
```

---

## 向量搜索优化

### 查询优化

**1. 动态 Top-K**：

```python
def dynamic_search(query, min_score=0.7, max_results=10):
    """根据相关性动态调整返回结果数量"""
    query_embedding = embedder.encode([query]).tolist()

    # 先获取更多候选结果
    results = doc_collection.search(
        data=query_embedding,
        anns_field="embedding",
        param={"metric_type": "COSINE", "params": {"ef": 64}},
        limit=max_results * 2,  # 获取2倍数量
        output_fields=["content", "metadata"]
    )[0]

    # 过滤低分结果
    filtered_results = [r for r in results if r.distance >= min_score]

    # 返回前 max_results 个
    return filtered_results[:max_results]
```

**2. 查询重写**：

```python
def query_expansion(query):
    """查询扩展，提升召回率"""
    # 使用 LLM 生成查询的多个变体
    prompt = f"""生成以下查询的3个语义相似的变体，用于信息检索。

原始查询：{query}

变体查询（每行一个）："""

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=200
    )

    expanded_queries = [query]
    expanded_queries.extend(response.choices[0].message.content.strip().split('\n'))

    return expanded_queries

def expanded_search(query):
    """使用查询扩展进行搜索"""
    expanded_queries = query_expansion(query)

    all_results = []
    for q in expanded_queries:
        q_embedding = embedder.encode([q]).tolist()
        results = doc_collection.search(
            data=q_embedding,
            anns_field="embedding",
            param={"metric_type": "COSINE", "params": {"ef": 64}},
            limit=5,
            output_fields=["content", "metadata"]
        )[0]
        all_results.extend(results)

    # 去重（基于 chunk_id）
    seen = set()
    unique_results = []
    for result in all_results:
        chunk_id = result.entity.get('chunk_id')
        if chunk_id not in seen:
            seen.add(chunk_id)
            unique_results.append(result)

    # 重新排序
    unique_results.sort(key=lambda x: x.distance, reverse=True)

    return unique_results[:10]
```

**3. 混合查询策略**：

```python
from pymilvus import connections

class HybridSearcher:
    def __init__(self, collection):
        self.collection = collection

    def dense_search(self, query, top_k=10):
        """稠密向量搜索"""
        query_embedding = embedder.encode([query]).tolist()
        results = self.collection.search(
            data=query_embedding,
            anns_field="embedding",
            param={"metric_type": "COSINE", "params": {"ef": 64}},
            limit=top_k,
            output_fields=["content", "metadata"]
        )[0]
        return results

    def sparse_search(self, query, top_k=10):
        """稀疏搜索（基于 BM25）"""
        # 使用 Elasticsearch 进行关键词搜索
        from elasticsearch import Elasticsearch

        es = Elasticsearch(["http://localhost:9200"])

        response = es.search(
            index="documents",
            body={
                "query": {
                    "match": {
                        "content": query
                    }
                },
                "size": top_k
            }
        )

        results = []
        for hit in response['hits']['hits']:
            results.append({
                'chunk_id': hit['_source']['chunk_id'],
                'content': hit['_source']['content'],
                'score': hit['_score']
            })

        return results

    def hybrid_search(self, query, alpha=0.5, top_k=10):
        """混合搜索（稠密 + 稀疏）"""
        dense_results = self.dense_search(query, top_k * 2)
        sparse_results = self.sparse_search(query, top_k * 2)

        # 归一化分数
        dense_scores = {r.entity.get('chunk_id'): r.distance for r in dense_results}
        sparse_scores = {r['chunk_id']: r['score'] for r in sparse_results}

        # 合并分数
        all_chunk_ids = set(dense_scores.keys()) | set(sparse_scores.keys())

        combined_scores = {}
        for chunk_id in all_chunk_ids:
            dense_score = dense_scores.get(chunk_id, 0)
            sparse_score = sparse_scores.get(chunk_id, 0)

            # 归一化到 [0, 1]
            dense_norm = (dense_score - min(dense_scores.values())) / (max(dense_scores.values()) - min(dense_scores.values()) + 1e-6)
            sparse_norm = (sparse_score - min(sparse_scores.values())) / (max(sparse_scores.values()) - min(sparse_scores.values()) + 1e-6)

            # 加权组合
            combined_scores[chunk_id] = alpha * dense_norm + (1 - alpha) * sparse_norm

        # 排序
        sorted_results = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)

        return sorted_results[:top_k]
```

### 索引优化

**1. 多级索引**：

```python
# 为不同粒度的数据创建多个索引

# 1. 粗粒度索引（文档级）
doc_fields = [
    FieldSchema(name="doc_id", dtype=DataType.VARCHAR, max_length=100, is_primary=True),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=384)
]
doc_schema = CollectionSchema(doc_fields)
doc_collection = Collection(name="documents", schema=doc_schema)

# 2. 细粒度索引（段落级）
chunk_fields = [
    FieldSchema(name="chunk_id", dtype=DataType.VARCHAR, max_length=100, is_primary=True),
    FieldSchema(name="doc_id", dtype=DataType.VARCHAR, max_length=100),
    FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=65535),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=384)
]
chunk_schema = CollectionSchema(chunk_fields)
chunk_collection = Collection(name="chunks", schema=chunk_schema)

# 3. 句子级索引
sentence_fields = [
    FieldSchema(name="sentence_id", dtype=DataType.VARCHAR, max_length=100, is_primary=True),
    FieldSchema(name="chunk_id", dtype=DataType.VARCHAR, max_length=100),
    FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=1024),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=384)
]
sentence_schema = CollectionSchema(sentence_fields)
sentence_collection = Collection(name="sentences", schema=sentence_schema)
```

**2. 自适应索引**：

```python
def adaptive_indexing(collection, data_size_threshold=100000):
    """根据数据量自动选择索引类型"""

    # 获取当前数据量
    stats = collection.num_entities

    if stats < data_size_threshold:
        # 小数据量：使用 FLAT 索引
        index_params = {
            "metric_type": "COSINE",
            "index_type": "FLAT"
        }
    elif stats < data_size_threshold * 10:
        # 中等数据量：使用 IVF_FLAT
        index_params = {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 128}
        }
    else:
        # 大数据量：使用 HNSW
        index_params = {
            "metric_type": "COSINE",
            "index_type": "HNSW",
            "params": {"M": 16, "efConstruction": 200}
        }

    # 删除旧索引并创建新索引
    collection.drop_index()
    collection.create_index(field_name="embedding", index_params=index_params)
    collection.load()

    return index_params
```

---

## 混合检索

### 多模态检索

```python
from transformers import CLIPProcessor, CLIPModel
from PIL import Image

class MultiModalRetriever:
    def __init__(self):
        # 加载 CLIP 模型（支持图像和文本）
        self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

    def embed_image(self, image_path):
        """生成图像嵌入"""
        image = Image.open(image_path)
        inputs = self.processor(images=image, return_tensors="pt")
        image_features = self.model.get_image_features(**inputs)
        return image_features.detach().numpy()[0].tolist()

    def embed_text(self, text):
        """生成文本嵌入"""
        inputs = self.processor(text=[text], return_tensors="pt", padding=True)
        text_features = self.model.get_text_features(**inputs)
        return text_features.detach().numpy()[0].tolist()

    def search_by_text(self, text_query, collection, top_k=10):
        """文本查询图像"""
        text_embedding = self.embed_text(text_query)

        results = collection.search(
            data=[text_embedding],
            anns_field="embedding",
            param={"metric_type": "COSINE", "params": {"ef": 64}},
            limit=top_k,
            output_fields=["image_path", "caption"]
        )

        return results[0]

    def search_by_image(self, image_path, collection, top_k=10):
        """图像查询图像"""
        image_embedding = self.embed_image(image_path)

        results = collection.search(
            data=[image_embedding],
            anns_field="embedding",
            param={"metric_type": "COSINE", "params": {"ef": 64}},
            limit=top_k,
            output_fields=["image_path", "caption"]
        )

        return results[0]
```

### 重排序（Reranking）

```python
class Reranker:
    def __init__(self):
        from sentence_transformers import CrossEncoder
        self.model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

    def rerank(self, query, candidates, top_k=10):
        """使用 CrossEncoder 重排序"""
        # 构建查询-文档对
        pairs = [[query, candidate['content']] for candidate in candidates]

        # 计算分数
        scores = self.model.predict(pairs)

        # 组合结果
        reranked = list(zip(candidates, scores))
        reranked.sort(key=lambda x: x[1], reverse=True)

        # 返回 Top-K
        return [item[0] for item in reranked[:top_k]]

# 使用示例
reranker = Reranker()

# 初始检索
initial_results = rag.retrieve(query, top_k=50)

# 重排序
candidates = [
    {
        'content': hit.entity.get('content'),
        'metadata': hit.entity.get('metadata')
    }
    for hit in initial_results
]

reranked_results = reranker.rerank(query, candidates, top_k=10)
```

---

## 性能调优

### 批量处理

```python
def batch_embed_and_store(texts, batch_size=32):
    """批量生成嵌入并存储"""
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        embeddings = embedder.encode(batch).tolist()
        all_embeddings.extend(embeddings)

    return all_embeddings

def batch_search(queries, batch_size=10):
    """批量搜索"""
    results_list = []

    for i in range(0, len(queries), batch_size):
        batch = queries[i:i + batch_size]
        batch_embeddings = embedder.encode(batch).tolist()

        results = doc_collection.search(
            data=batch_embeddings,
            anns_field="embedding",
            param={"metric_type": "COSINE", "params": {"ef": 64}},
            limit=10,
            output_fields=["content", "metadata"]
        )

        results_list.extend(results)

    return results_list
```

### 缓存策略

```python
import hashlib
import json
from functools import lru_cache

class CachedRAG:
    def __init__(self, rag_system):
        self.rag = rag_system
        self.cache = {}

    def _get_cache_key(self, query, filters):
        """生成缓存键"""
        key_data = {"query": query, "filters": filters}
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()

    def query(self, query, filters=None, use_cache=True):
        """带缓存的查询"""
        cache_key = self._get_cache_key(query, filters)

        if use_cache and cache_key in self.cache:
            print("从缓存返回结果")
            return self.cache[cache_key]

        # 执行查询
        result = self.rag.query(query, filters)

        # 存入缓存
        if use_cache:
            self.cache[cache_key] = result

        return result

    def clear_cache(self):
        """清除缓存"""
        self.cache.clear()
```

### 并发查询

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

async def async_search(queries, max_workers=5):
    """异步并发搜索"""
    loop = asyncio.get_event_loop()
    executor = ThreadPoolExecutor(max_workers=max_workers)

    def sync_search(query):
        return rag.retrieve(query, top_k=10)

    tasks = [
        loop.run_in_executor(executor, sync_search, query)
        for query in queries
    ]

    results = await asyncio.gather(*tasks)

    executor.shutdown()
    return results

# 使用示例
queries = ["什么是AI？", "深度学习原理", "神经网络结构"]
results = asyncio.run(async_search(queries))
```

---

## 实战项目：AI 搜索系统

### 系统架构

```
┌──────────────────────────────────────────────────────┐
│            AI 搜索系统架构                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │           前端界面                        │       │
│  │  - 搜索框                                │       │
│  │  - 过滤器（分类、日期等）                  │       │
│  │  - 结果展示                              │       │
│  └─────────────────┬────────────────────────┘       │
│                    │                                  │
│                    ▼                                  │
│  ┌──────────────────────────────────────────┐       │
│  │           API 层 (FastAPI)               │       │
│  │  - 搜索接口                              │       │
│  │  - 文档上传                              │       │
│  │  - 结果返回                              │       │
│  └─────────────────┬────────────────────────┘       │
│                    │                                  │
│                    ▼                                  │
│  ┌──────────────────────────────────────────┐       │
│  │          业务逻辑层                       │       │
│  │  - RAG 系统                              │       │
│  │  - 查询重写                              │       │
│  │  - 结果重排序                            │       │
│  └─────────────────┬────────────────────────┘       │
│                    │                                  │
│         ┌──────────┼──────────┐                      │
│         │          │          │                      │
│         ▼          ▼          ▼                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │Milvus    │ │Elasticsearch││PostgreSQL│            │
│  │(向量)    │ │(全文)    │ │(元数据)  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 后端实现

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="AI Search System")

# 数据模型
class SearchRequest(BaseModel):
    query: str
    filters: Optional[dict] = None
    top_k: int = 10

class SearchResult(BaseModel):
    content: str
    metadata: dict
    score: float

class SearchResponse(BaseModel):
    answer: str
    sources: List[SearchResult]

# API 端点
@app.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """搜索接口"""
    try:
        # 执行 RAG 搜索
        result = rag.query(
            query=request.query,
            filters=request.filters
        )

        return SearchResponse(
            answer=result['answer'],
            sources=[
                SearchResult(
                    content=source['content'],
                    metadata=source['metadata'],
                    score=source['score']
                )
                for source in result['sources']
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """上传文档"""
    try:
        # 读取文件内容
        content = await file.read()

        # 处理文档
        text = content.decode('utf-8')
        doc_id = str(uuid.uuid4())

        # 分块
        chunks = processor.chunk_document(text, doc_id)

        # 嵌入
        embeddings = processor.embed_chunks(chunks)

        # 存储
        metadata = {
            "filename": file.filename,
            "size": len(content)
        }
        processor.store_chunks(doc_id, chunks, embeddings, metadata)

        return {"status": "success", "doc_id": doc_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}

# 启动服务
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 前端实现

```html
<!DOCTYPE html>
<html>
<head>
    <title>AI 搜索系统</title>
    <style>
        .search-container {
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        .search-box {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .search-input {
            flex: 1;
            padding: 10px;
            font-size: 16px;
        }
        .search-button {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            cursor: pointer;
        }
        .results {
            margin-top: 20px;
        }
        .answer {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .source {
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 5px;
        }
        .upload-container {
            margin-top: 30px;
            padding: 20px;
            border: 2px dashed #ddd;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="search-container">
        <h1>AI 搜索系统</h1>

        <div class="search-box">
            <input type="text" id="queryInput" class="search-input" placeholder="输入您的问题...">
            <button onclick="search()" class="search-button">搜索</button>
        </div>

        <div id="results" class="results"></div>

        <div class="upload-container">
            <h3>上传文档</h3>
            <input type="file" id="fileInput">
            <button onclick="uploadFile()">上传</button>
        </div>
    </div>

    <script>
        async function search() {
            const query = document.getElementById('queryInput').value;
            const resultsDiv = document.getElementById('results');

            resultsDiv.innerHTML = '<p>搜索中...</p>';

            try {
                const response = await fetch('/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: query,
                        top_k: 5
                    })
                });

                const data = await response.json();

                let html = '<div class="answer"><h3>回答：</h3><p>' + data.answer + '</p></div>';
                html += '<h3>参考来源：</h3>';

                data.sources.forEach(source => {
                    html += '<div class="source">';
                    html += '<p><strong>分数：</strong>' + source.score.toFixed(4) + '</p>';
                    html += '<p>' + source.content + '</p>';
                    html += '</div>';
                });

                resultsDiv.innerHTML = html;

            } catch (error) {
                resultsDiv.innerHTML = '<p style="color: red;">搜索出错：' + error.message + '</p>';
            }
        }

        async function uploadFile() {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];

            if (!file) {
                alert('请选择文件');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                alert('上传成功！文档ID: ' + data.doc_id);

            } catch (error) {
                alert('上传失败：' + error.message);
            }
        }

        // 支持回车搜索
        document.getElementById('queryInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                search();
            }
        });
    </script>
</body>
</html>
```

---

## ✅ 本章小结

### 学习检查清单

完成本章学习后，请确认你能够：

- [ ] 理解 RAG 的原理和优势
- [ ] 设计并实现 RAG 系统
- [ ] 优化向量搜索性能（查询优化、索引优化）
- [ ] 实现混合检索（稠密 + 稀疏）
- [ ] 使用重排序提升结果质量
- [ ] 实现多模态检索
- [ ] 进行性能调优（批量处理、缓存、并发）
- [ ] 构建完整的 AI 搜索系统

### 核心要点回顾

1. **RAG 架构**：检索 + 生成，减少 LLM 幻觉
2. **向量优化**：查询重写、混合搜索、重排序
3. **混合检索**：稠密向量 + 稀疏关键词
4. **性能调优**：批量处理、缓存、并发查询
5. **实战应用**：AI 搜索系统（前端 + 后端 + 数据库）

## 📚 延伸阅读

- [第28章：Milvus 向量数据库 →](./chapter-27)
- [第26章：InfluxDB 时序数据库 →](./chapter-25)
- [LangChain 文档](https://docs.langchain.com/)
- [RAG 技术指南](https://www.anthropic.com/index/retrieval-augmented-generation)

---

**更新时间**：2026年2月 | **版本**：v1.0
