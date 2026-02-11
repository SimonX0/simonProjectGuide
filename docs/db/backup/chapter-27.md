---
title: 第28章：Milvus 向量数据库
---

# ：Milvus 向量数据库

> **难度等级**：⭐⭐⭐⭐ 高级 | **学习时长**：12小时 | **实战项目**：AI 搜索引擎

## 📚 本章目录

- [27.1 向量索引（HNSW、IVF）](#271-向量索引hnswivf)
- [27.2 相似度搜索](#272-相似度搜索)
- [27.3 向量 CRUD](#273-向量-crud)
- [27.4 集群部署](#274-集群部署)
- [27.5 AI 应用集成](#275-ai-应用集成)

---

## 向量索引（HNSW、IVF）

### 什么是向量索引

```
┌──────────────────────────────────────────────────────┐
│              向量索引的作用                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  无索引（暴力搜索）:                                  │
│  ┌──────────────────────────────────────┐           │
│  │  查询时间: O(n)                       │           │
│  │  精度: 100%                           │           │
│  │  适用: 小规模数据 (< 10万)            │           │
│  └──────────────────────────────────────┘           │
│                                                      │
│  有索引（近似搜索）:                                  │
│  ┌──────────────────────────────────────┐           │
│  │  查询时间: O(log n)                   │           │
│  │  精度: 90-99%                         │           │
│  │  适用: 大规模数据 (> 100万)           │           │
│  └──────────────────────────────────────┘           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### IVF（倒排文件索引）

**原理**：

```
┌──────────────────────────────────────────────────────┐
│               IVF 索引原理                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. 聚类阶段（Training）                             │
│  ┌────────────────────────────────────────┐         │
│  │         向量空间                        │         │
│  │                                         │         │
│  │  ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │         │
│  │   ●   ●   ●   ●   ●   ●   ●   ●        │         │
│  │    ●     ●     ●     ●     ●           │         │
│  │     ●  C1 ●  C2 ●  C3 ●  C4            │         │
│  │        ●     ●     ●     ●             │         │
│  │         ●   ●   ●   ●   ●              │         │
│  │          ● ● ● ● ● ● ● ●               │         │
│  │                                         │         │
│  │  C1, C2, C3, C4 = 聚类中心               │         │
│  └────────────────────────────────────────┘         │
│                                                      │
│  2. 分配阶段（Assign）                               │
│  ┌────────────────────────────────────────┐         │
│  │  Bucket 1  │  Bucket 2  │  Bucket 3    │         │
│  │  (C1附近)  │  (C2附近)  │  (C3附近)    │         │
│  │  ┌────┐   │  ┌────┐   │  ┌────┐      │         │
│  │  │v1  │   │  │v5  │   │  │v9  │      │         │
│  │  │v2  │   │  │v6  │   │  │v10 │      │         │
│  │  │v3  │   │  │v7  │   │  │v11 │      │         │
│  │  │v4  │   │  │v8  │   │  │v12 │      │         │
│  │  └────┘   │  └────┘   │  └────┘      │         │
│  └────────────────────────────────────────┘         │
│                                                      │
│  3. 搜索阶段                                         │
│     ┌──────────────────────────────┐               │
│     │ 1. 找到查询向量最近的 n 个中心 │               │
│     │ 2. 只在这些中心的 Bucket 中搜索│               │
│     └──────────────────────────────┘               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**IVF 索引参数**：

```python
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType

# 连接 Milvus
connections.connect(host='localhost', port='19530')

# 定义 Collection
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=128)
]
schema = CollectionSchema(fields, description="Example collection")
collection = Collection(name="example_collection", schema=schema)

# 创建 IVF_FLAT 索引
index_params = {
    "metric_type": "L2",        # 距离度量：L2, IP
    "index_type": "IVF_FLAT",  # 索引类型
    "params": {
        "nlist": 128           # 聚类中心数量
    }
}
collection.create_index(field_name="embedding", index_params=index_params)

# 创建 IVF_SQ8 索引（标量量化，节省内存）
index_params = {
    "metric_type": "L2",
    "index_type": "IVF_SQ8",
    "params": {
        "nlist": 256
    }
}
collection.create_index(field_name="embedding", index_params=index_params)

# 创建 IVF_PQ 索引（乘积量化，更高压缩比）
index_params = {
    "metric_type": "L2",
    "index_type": "IVF_PQ",
    "params": {
        "nlist": 256,
        "m": 8                # PQ 的因子数
    }
}
collection.create_index(field_name="embedding", index_params=index_params)
```

### HNSW（层次化小世界图）

**原理**：

```
┌──────────────────────────────────────────────────────┐
│              HNSW 索引原理                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  多层图结构（类似跳表）:                              │
│                                                      │
│  Layer 2 (最高层, 最稀疏):                           │
│      ●────────────●                         │
│                      ●                                 │
│                           ●                           │
│  Layer 1 (中间层):                                 │
│  ●─────●─────●─────●─────●─────●                    │
│        │     │     │     │     │                     │
│  Layer 0 (最底层, 最密集):                          │
│  ●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●              │
│                                                      │
│  搜索过程:                                           │
│  1. 从最高层开始搜索                                 │
│  2. 快速定位到目标区域                               │
│  3. 逐层向下搜索                                     │
│  4. 在最底层精确搜索                                 │
│                                                      │
│  优点:                                              │
│  ✅ 查询速度快                                       │
│  ✅ 召回率高                                         │
│  ✅ 支持动态插入                                      │
│                                                      │
│  缺点:                                              │
│  ❌ 内存占用大                                       │
│  ❌ 索引构建慢                                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**HNSW 索引参数**：

```python
# 创建 HNSW 索引
index_params = {
    "metric_type": "L2",
    "index_type": "HNSW",
    "params": {
        "M": 16,              # 每个节点的最大连接数
        "efConstruction": 200 # 构建索引时的搜索宽度
    }
}
collection.create_index(field_name="embedding", index_params=index_params)

# 搜索参数配置
search_params = {
    "metric_type": "L2",
    "params": {
        "ef": 64  # 搜索时的候选列表大小，越大越精确但越慢
    }
}
```

### 索引选择策略

| 索引类型 | 适用场景 | 优点 | 缺点 |
|---------|---------|------|------|
| **FLAT** | 小规模数据 (< 100万) | 精度100%，速度快 | 内存占用大 |
| **IVF_FLAT** | 中等规模（100万-1000万） | 平衡性能和精度 | 需要训练 |
| **IVF_SQ8** | 大规模数据（> 1000万） | 节省内存 | 精度略降 |
| **IVF_PQ** | 超大规模（> 1亿） | 极致压缩 | 精度下降较多 |
| **HNSW** | 高查询性能要求 | 查询最快，精度高 | 内存占用大 |

---

## 相似度搜索

### 距离度量

```python
# 1. L2 距离（欧氏距离）
index_params = {
    "metric_type": "L2",  # 距离越小越相似
    "index_type": "HNSW"
}

# 2. IP（内积）
index_params = {
    "metric_type": "IP",  # 内积越大越相似
    "index_type": "HNSW"
}

# 3. COSINE（余弦相似度）
# 需要归一化向量，然后使用 IP
import numpy as np

def normalize(v):
    norm = np.linalg.norm(v)
    if norm == 0:
        return v
    return v / norm

# 归一化后使用 IP 相当于余弦相似度
```

### 基础搜索

```python
from pymilvus import Collection

collection = Collection("example_collection")
collection.load()

# 准备查询向量
query_vectors = [np.random.rand(128).tolist() for _ in range(5)]

# 搜索参数
search_params = {
    "metric_type": "L2",
    "params": {"ef": 64}
}

# 执行搜索
results = collection.search(
    data=query_vectors,           # 查询向量
    anns_field="embedding",       # 向量字段
    param=search_params,          # 搜索参数
    limit=10,                     # 返回 Top K
    expr=None,                    # 标量过滤条件
    output_fields=["id"]          # 返回字段
)

# 解析结果
for i, result in enumerate(results):
    print(f"Query {i}:")
    for hit in result:
        print(f"  ID: {hit.id}, Distance: {hit.distance}")
```

### 混合搜索（向量 + 标量）

```python
# 插入数据时包含标量字段
from pymilvus import FieldSchema, CollectionSchema, DataType

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=128),
    FieldSchema(name="category", dtype=DataType.VARCHAR, max_length=100),
    FieldSchema(name="price", dtype=DataType.FLOAT),
    FieldSchema(name="timestamp", dtype=DataType.INT64)
]
schema = CollectionSchema(fields)
collection = Collection(name="products", schema=schema)

# 混合搜索：向量相似度 + 标量过滤
results = collection.search(
    data=query_vectors,
    anns_field="embedding",
    param=search_params,
    limit=10,
    expr="category == 'electronics' and price < 1000",  # 过滤条件
    output_fields=["id", "category", "price"]
)

# 结果解析
for i, result in enumerate(results):
    print(f"Query {i}:")
    for hit in result:
        print(f"  ID: {hit.id}, Distance: {hit.distance}")
        print(f"  Category: {hit.entity.get('category')}")
        print(f"  Price: {hit.entity.get('price')}")
```

### 范围搜索

```python
# 只返回距离在指定范围内的结果
results = collection.search(
    data=query_vectors,
    anns_field="embedding",
    param=search_params,
    limit=100,
    expr=None,
    output_fields=["id"],
    radius=0.5,        # 最大距离
    range_filter=0.1   # 最小距离（排除太近的结果）
)
```

---

## 向量 CRUD

### 插入向量

```python
import numpy as np
from pymilvus import Collection, connections

connections.connect()

# 准备数据
entities = [
    [1, 2, 3, 4, 5],  # IDs（如果 auto_id=False）
    [np.random.rand(128).tolist() for _ in range(5)],  # embeddings
    ["cat", "dog", "bird", "fish", "cat"],  # categories
    [100.0, 200.0, 50.0, 30.0, 150.0]  # prices
]

# 插入数据
collection = Collection("products")
insert_result = collection.insert(entities)

# 刷新数据（使其可搜索）
collection.flush()

# 加载到内存
collection.load()
```

### 查询向量

```python
# 根据ID查询
result = collection.query(
    expr="id in [1, 2, 3]",
    output_fields=["id", "category", "price"]
)

# 查询所有数据
result = collection.query(
    expr="id >= 0",
    output_fields=["id", "category", "price"],
    limit=100
)

# 获取向量
result = collection.query(
    expr="id == 1",
    output_fields=["id", "embedding"]
)
```

### 更新向量

```python
# 更新标量字段
collection.update(
    data={"id": 1, "price": 120.0}
)

# 批量更新
collection.update(
    data=[
        {"id": 1, "price": 120.0},
        {"id": 2, "price": 220.0},
        {"id": 3, "price": 60.0}
    ]
)
```

### 删除向量

```python
# 根据ID删除
collection.delete(expr="id in [1, 2, 3]")

# 根据条件删除
collection.delete(expr="price < 50")

# 删除所有数据（慎用）
collection.delete(expr="id >= 0")
```

---

## 集群部署

### Milvus 集群架构

```
┌──────────────────────────────────────────────────────┐
│             Milvus 集群架构                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │        Client SDK                        │       │
│  └─────────────────┬────────────────────────┘       │
│                    │                                  │
│                    ▼                                  │
│  ┌──────────────────────────────────────────┐       │
│  │         Proxy (负载均衡)                  │       │
│  │  ┌─────┬─────┬─────┬─────┬─────┐         │       │
│  │  │ P1  │ P2  │ P3  │ P4  │ P5  │         │       │
│  │  └─────┴─────┴─────┴─────┴─────┘         │       │
│  └──────────────────────────────────────────┘       │
│                    │                                  │
│         ┌──────────┼──────────┐                      │
│         │          │          │                      │
│         ▼          ▼          ▼                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Root     │ │ Query    │ │ Data     │            │
│  │ Coordinator│ │ Node     │ │ Node     │            │
│  │          │ │          │ │          │            │
│  │ - 元数据 │ │ - 搜索   │ │ - 存储   │            │
│  │ - 索引   │ │ - 查询   │ │ - 增删   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                             │                        │
│         ┌───────────────────┴────────┐              │
│         │                            │              │
│         ▼                            ▼              │
│  ┌────────────┐              ┌────────────┐        │
│  │ MinIO /    │              │ etcd       │        │
│  │ S3         │              │ (元数据)   │        │
│  │ (对象存储) │              └────────────┘        │
│  └────────────┘                                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Docker Compose 部署

**docker-compose.yml**：

```yaml
version: '3.5'

services:
  etcd:
    container_name: milvus-etcd
    image: quay.io/coreos/etcd:v3.5.5
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
      - ETCD_SNAPSHOT_COUNT=50000
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/etcd:/etcd
    command: etcd -advertise-client-urls=http://127.0.0.1:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd

  minio:
    container_name: milvus-minio
    image: minio/minio:RELEASE.2023-03-20T20-16-18Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/minio:/minio_data
    command: minio server /minio_data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  standalone:
    container_name: milvus-standalone
    image: milvusdb/milvus:v2.3.0
    command: ["milvus", "run", "standalone"]
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/milvus:/var/lib/milvus
    ports:
      - "19530:19530"
      - "9091:9091"
    depends_on:
      - "etcd"
      - "minio"
```

**启动集群**：

```bash
# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f milvus-standalone

# 停止服务
docker-compose down
```

### Kubernetes 部署

```yaml
# milvus-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: milvus
  labels:
    app: milvus
spec:
  replicas: 1
  selector:
    matchLabels:
      app: milvus
  template:
    metadata:
      labels:
        app: milvus
    spec:
      containers:
      - name: milvus
        image: milvusdb/milvus:v2.3.0
        ports:
        - containerPort: 19530
        env:
        - name: ETCD_ENDPOINTS
          value: "etcd:2379"
        - name: MINIO_ADDRESS
          value: "minio:9000"
---
apiVersion: v1
kind: Service
metadata:
  name: milvus
spec:
  type: LoadBalancer
  ports:
  - port: 19530
    targetPort: 19530
  selector:
    app: milvus
```

**部署到 Kubernetes**：

```bash
# 部署 Milvus
kubectl apply -f milvus-deployment.yaml

# 查看 Pod 状态
kubectl get pods

# 查看 Service
kubectl get svc

# 获取 Milvus 服务地址
kubectl get svc milvus
```

---

## AI 应用集成

### 图像相似搜索

```python
import numpy as np
from pymilvus import Collection, connections, FieldSchema, CollectionSchema, DataType
from transformers import ViTModel, ViTImageProcessor
from PIL import Image

# 连接 Milvus
connections.connect()

# 创建 Collection
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="image_path", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=768)
]
schema = CollectionSchema(fields)
collection = Collection(name="image_search", schema=schema)

# 创建索引
index_params = {
    "metric_type": "L2",
    "index_type": "HNSW",
    "params": {"M": 16, "efConstruction": 200}
}
collection.create_index(field_name="embedding", index_params=index_params)

# 加载预训练模型
processor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224')
model = ViTModel.from_pretrained('google/vit-base-patch16-224')

# 提取图像特征
def extract_image_features(image_path):
    image = Image.open(image_path).convert('RGB')
    inputs = processor(images=image, return_tensors="pt")
    outputs = model(**inputs)
    # 使用 [CLS] token 的输出作为特征
    features = outputs.last_hidden_state[:, 0, :].detach().numpy()[0]
    return features.tolist()

# 插入图像
image_paths = ["image1.jpg", "image2.jpg", "image3.jpg"]
embeddings = [extract_image_features(path) for path in image_paths]

entities = [
    image_paths,
    embeddings
]
collection.insert(entities)
collection.flush()
collection.load()

# 搜索相似图像
query_image = "query.jpg"
query_embedding = extract_image_features(query_image)

results = collection.search(
    data=[query_embedding],
    anns_field="embedding",
    param={"metric_type": "L2", "params": {"ef": 64}},
    limit=10,
    output_fields=["image_path"]
)

# 显示结果
for hit in results[0]:
    print(f"Similar image: {hit.entity.get('image_path')}, Distance: {hit.distance}")
```

### 文本语义搜索

```python
from sentence_transformers import SentenceTransformer
from pymilvus import Collection

# 加载文本嵌入模型
model = SentenceTransformer('all-MiniLM-L6-v2')

# 创建 Collection
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=384)
]
schema = CollectionSchema(fields)
collection = Collection(name="text_search", schema=schema)

# 创建索引
index_params = {
    "metric_type": "IP",
    "index_type": "HNSW",
    "params": {"M": 16, "efConstruction": 200}
}
collection.create_index(field_name="embedding", index_params=index_params)

# 插入文本
texts = [
    "Machine learning is a subset of artificial intelligence.",
    "Deep learning uses neural networks with multiple layers.",
    "Natural language processing deals with text and speech.",
    "Computer vision enables machines to understand images."
]
embeddings = model.encode(texts).tolist()

entities = [texts, embeddings]
collection.insert(entities)
collection.flush()
collection.load()

# 语义搜索
query = "AI and neural networks"
query_embedding = model.encode([query]).tolist()

results = collection.search(
    data=query_embedding,
    anns_field="embedding",
    param={"metric_type": "IP", "params": {"ef": 64}},
    limit=5,
    output_fields=["text"]
)

for hit in results[0]:
    print(f"Score: {hit.distance:.4f}, Text: {hit.entity.get('text')}")
```

### 推荐系统

```python
# 用户-物品协同过滤 + 向量相似度

# 1. 用户向量 Collection
user_fields = [
    FieldSchema(name="user_id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=128)
]
user_collection = Collection(name="users", schema=CollectionSchema(user_fields))

# 2. 物品向量 Collection
item_fields = [
    FieldSchema(name="item_id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="category", dtype=DataType.VARCHAR, max_length=100),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=128)
]
item_collection = Collection(name="items", schema=CollectionSchema(item_fields))

# 3. 推荐逻辑
def recommend_items(user_id, top_k=10):
    # 获取用户向量
    user_result = user_collection.query(
        expr=f"user_id == {user_id}",
        output_fields=["embedding"]
    )
    user_embedding = user_result[0]['embedding']

    # 搜索相似物品
    results = item_collection.search(
        data=[user_embedding],
        anns_field="embedding",
        param={"metric_type": "IP", "params": {"ef": 64}},
        limit=top_k,
        output_fields=["item_id", "category"]
    )

    recommendations = []
    for hit in results[0]:
        recommendations.append({
            'item_id': hit.entity.get('item_id'),
            'category': hit.entity.get('category'),
            'score': hit.distance
        })

    return recommendations

# 使用示例
user_id = 12345
recommendations = recommend_items(user_id, top_k=10)
for rec in recommendations:
    print(f"Item: {rec['item_id']}, Category: {rec['category']}, Score: {rec['score']:.4f}")
```

---

## ✅ 本章小结

### 学习检查清单

完成本章学习后，请确认你能够：

- [ ] 理解向量索引的原理（IVF、HNSW）
- [ ] 根据场景选择合适的索引类型
- [ ] 实现向量相似度搜索
- [ ] 使用混合搜索（向量 + 标量）
- [ ] 掌握向量的 CRUD 操作
- [ ] 部署 Milvus 集群（Docker/Kubernetes）
- [ ] 集成 AI 应用（图像搜索、文本搜索、推荐系统）

### 核心要点回顾

1. **向量索引**：IVF（倒排文件）、HNSW（层次图）是主流选择
2. **距离度量**：L2（欧氏距离）、IP（内积）、COSINE（余弦相似度）
3. **搜索性能**：索引选择 + 参数调优（nlist、ef、M）
4. **集群部署**：Proxy + Query Node + Data Node + etcd + MinIO
5. **AI 应用**：图像搜索、文本搜索、推荐系统

## 📚 延伸阅读

- [第29章：AI 应用数据库架构 →](./chapter-28)
- [第27章：TDengine IoT 数据库 →](./chapter-26)
- [Milvus 官方文档](https://milvus.io/docs)
- [向量数据库教程](https://zilliz.com/learn)

---

**更新时间**：2026年2月 | **版本**：v1.0
