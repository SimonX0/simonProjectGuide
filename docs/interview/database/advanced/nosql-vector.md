---
title: NoSQL与向量数据库面试题
---

# NoSQL与向量数据库面试题

> **难度等级**：⭐⭐⭐ | **出现频率**：60% | **建议用时**：30分钟

## MongoDB题

### 1. MongoDB的副本集架构？

**参考答案**：

**副本集架构**：
```
[Primary (主节点)]
  |  \
  [Secondary-1] [Secondary-2] [Arbiter]
  |            |
[异步复制]   [心跳选举]
```

**节点类型**：
- **Primary**：处理所有写操作
- **Secondary**：从Primary复制数据，处理读
- **Arbiter**：仲裁节点，只有投票权，不存数据

**选举过程**：
1. Primary故障
2. Secondary检测到（心跳超时）
3. 多数节点投票选举新Primary
4. 新Primary上线

**写关注**（Write Concern）：
```javascript
// 确认写入
db.orders.insertOne({
  order_id: "123",
  items: [...]
}, {
  w: 2,        // 写入2个节点
  j: true,      // 等待日志刷新
  wtimeout: 5000 // 超时5秒
});
```

---

### 2. MongoDB的分片集群？

**参考答案**：

**分片架构**：
```
[Config Server 1] [Config Server 2] [Config Server 3]
          \               |               /
           [Shard 1] [Shard 2] [Shard 3]
                 |          |
          [Mongos路由服务器]
                 |
          [应用客户端]
```

**组件**：
- **Shard（分片）**：存储数据子集
- **Config Server**：存储集群元数据和配置
- **Mongos（路由）**：请求路由，不存数据

**分片键（Shard Key）选择**：
- 必须是索引字段
- 数据分布均匀
- 避免热点数据
- 示例：user_id（均匀），timestamp（不推荐）

**查询路由**：
```javascript
// Mongos自动路由
// 查询条件包含分片键 -> 直接定位
db.users.find({ user_id: "123" });

// 查询条件不包含分片键 -> 广播所有分片
db.users.find({ username: "zhangsan" });
```

---

### 3. MongoDB的索引类型？

**参考答案**：

**1. 单字段索引**
```javascript
// 升序索引
db.users.createIndex({ username: 1 });

// 降序索引
db.users.createIndex({ create_time: -1 });

// 2D球面索引
db.locations.createIndex({
  loc: "2dsphere",
  coordinates: [120.5, 30.5]
});
```

**2. 复合索引**
```javascript
// 复合索引
db.orders.createIndex({
  user_id: 1,
  status: 1,
  create_time: -1
});

// 查询必须符合索引顺序
db.orders.find({
  user_id: "123",
  status: "pending"
}).sort({ create_time: -1 });
```

**3. 文本索引**
```javascript
// 文本索引
db.articles.createIndex({
  title: "text",
  content: "text"
});

// 全文搜索
db.articles.find({
  $text: {
    $search: "数据库 面试"
  }
});
```

**4. 哈希索引**
```javascript
// 哈希索引（等值查询快）
db.users.createIndex({
  email: "hashed"
});

// 只支持等值查询
db.users.find({ email: "test@example.com" });
```

---

## Elasticsearch题

### 4. Elasticsearch的倒排索引原理？

**参考答案**：

**倒排索引**：单词到文档的映射

**示例**：
```
文档1: "MySQL数据库面试题"
文档2: "PostgreSQL面试题"
文档3: "MongoDB面试题"

分词后:
- MySQL: [文档1]
- 数据库: [文档1, 文档2]
- 面试: [文档1, 文档2, 文档3]
- 题: [文档1, 文档2, 文档3]
```

**倒排表结构**：
```
词项     | 文档ID列表 (DF词频, TF词频)
--------|---------------------------
MySQL   | [1] (1, 1/3)
数据库   | [1, 2] (2, 2/3)
面试     | [1, 2, 3] (3, 1)
题       | [1, 2, 3] (3, 1/3)
```

**TF-IDF计算**：
```
TF (词频) = 单词在文档中出现次数 / 文档总词数
DF (文档频率) = 包含该词的文档数 / 总文档数
TF-IDF = TF × log(总文档数 / DF)
```

---

### 5. Elasticsearch的Query DSL有哪些？

**参考答案**：

**1. 全文查询**
```json
// match查询（分词搜索）
{
  "query": {
    "match": {
      "title": "数据库 面试"
    }
  }
}

// match_phrase（短语匹配）
{
  "query": {
    "match_phrase": {
      "title": "数据库面试题"
    }
  }
}

// multi_match（多字段搜索）
{
  "query": {
    "multi_match": {
      "fields": ["title", "content"],
      "query": "PostgreSQL",
      "type": "best_fields"
    }
  }
}
```

**2. 精确查询**
```json
// term查询（精确匹配）
{
  "query": {
    "term": {
      "status": "published"
    }
  }
}

// terms查询（多值匹配）
{
  "query": {
    "terms": {
      "tags": ["数据库", "面试", "PostgreSQL"]
    }
  }
}
```

**3. 范围查询**
```json
// range查询
{
  "query": {
    "range": {
      "publish_date": {
        "gte": "2024-01-01",
        "lte": "2024-12-31"
      }
    }
  }
}
```

**4. 布尔查询**
```json
// must（必须匹配）
// should（应该匹配）
// must_not（必须不匹配）
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "数据库" } }
      ],
      "should": [
        { "match": { "content": "MySQL" } },
        { "match": { "content": "PostgreSQL" } }
      ],
      "must_not": [
        { "term": { "status": "draft" } }
      ]
    }
  }
}
```

---

## 向量数据库题

### 6. 向量数据库在RAG中的应用？

**参考答案**：

**RAG（Retrieval Augmented Generation）流程**：
```
用户问题
  |
  +---> [Embedding模型] -> 向量化
                      |
                      +---> [向量数据库: Milvus/Pinecone]
                      |                   |
                      |                   +---> 向量相似度检索
                      |                              |
                      +--------------------------------> [Top-K文档]
                                                    |
                                                    +---> [LLM: GPT-4/Claude]
                                                    |
                                                    +---> 带上下文的回答
```

**向量数据库作用**：
1. 存储文档向量表示
2. 快速检索相似向量（ANN）
3. 返回最相关的K个文档

**为什么需要向量数据库**：
- 文档量大（百万级）
- 需要毫秒级响应
- 传统数据库无法高效相似度搜索

---

### 7. Milvus的HNSW索引是什么？

**参考答案**：

**HNSW（Hierarchical Navigable Small World）**：分层导航小世界图

**原理**：
```
构建过程：
1. 随机选择入口点
2. 连接最近的m个邻居
3. 为每个邻居建立连接
4. 重复构建多层图

查询过程：
1. 从入口点开始
2. 搜索进入点的邻居
3. 优先队列管理
4. 返回最近的k个结果
```

**参数**：
- **M**：每个节点的连接数（影响召回率）
- **efConstrucion**：构建时的搜索范围（影响精度）

**优势**：
- 查询时间复杂度：O(log N)
- 比暴力搜索快数千倍
- 适合高维向量（128-2048维）

---

### 8. Pinecone和Milvus的区别？

**参考答案**：

| 特性 | Milvus | Pinecone |
|-----|--------|----------|
| **部署方式** | 开源自部署 | 托管云服务 |
| **成本** | 硬件成本 | 按查询次数计费 |
| **运维** | 需要运维 | 零运维 |
| **定制化** | 高度定制 | 功能固定 |
| **扩展性** | 需要手动扩展 | 自动扩展 |
| **延迟** | 取决于部署 | 较低（全球CDN） |
| **数据主权** | 完全控制 | 托管在云端 |
| **学习成本** | 较高 | 较低 |
| **适用** | 私有化部署 | 快速原型验证 |

---

## 实战场景题

### 9. 设计一个文档搜索系统

**参考答案**：

**需求**：
- 全文搜索文档
- 支持高亮
- 分页查询
- 相关性排序

**方案：Elasticsearch + MySQL**

**架构**：
```
[应用]
  |
  +---> [Elasticsearch: 搜索]
  |             |
  +---> [MySQL: 存储]
```

**数据同步**：
```
MySQL -> Canal -> Elasticsearch
    (Binlog增量同步)
```

**查询流程**：
```javascript
// 1. ES搜索
const results = await es.search({
  index: 'documents',
  body: {
    query: {
      bool: {
        must: [
          { match: { title: query } },
          { match: { content: query } }
        ]
      }
    },
    highlight: {
      fields: {
        title: {},
        content: {}
      }
    },
    from: (page - 1) * size,
    size: size
  }
});

// 2. 从MySQL获取完整数据
const ids = results.hits.map(hit => hit._id);
const documents = await mysql.query(`
  SELECT * FROM documents WHERE id IN (?)
`, [ids]);
```

**索引设计**：
```json
// ES索引模板
PUT /documents
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "ik_max_word"
      },
      "content": {
        "type": "text",
        "analyzer": "ik_max_word"
      },
      "created_at": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss"
      }
    }
  }
}
```

---

### 10. 设计一个以图搜图系统

**参考答案**：

**需求**：
- 上传图片，搜索相似图片
- 使用向量相似度
- 返回Top-K结果

**方案：Milvus + Redis + MinIO**

**架构**：
```
[应用]
  |
  +---> [Redis: 缓存]
  |       |
  +---> [Milvus: 向量检索]
  |             |
  +---> [MinIO: 图片存储]
```

**流程**：
```python
# 1. 图片上传
image_url = minio.upload(image)

# 2. 向量化
embedding = clip_model.encode(image)  # [512维向量]

# 3. 存储向量
milvus.insert([
  {
    "id": image_id,
    "vector": embedding,
    "url": image_url
  }
])

# 4. 搜索
results = milvus.search(
  data=[query_embedding],
  top_k=10,
  metric="L2"  # 欧氏距离
)

# 5. 缓存
redis.setex(
  f"search:{md5(query_image)}",
  json.dumps(results),
  3600  # 缓存1小时
)
```

**Milvus集合创建**：
```python
from pymilvus import connections, FieldSchema, CollectionSchema, DataType

# 定义Schema
schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=512),
    FieldSchema("url", DataType.VARCHAR, max_length=512)
])

# 创建集合
collection = Collection("image_search")
collection.create(schema)

# 创建索引
collection.create_index(
    field_name="vector",
    index_type="HNSW",  # 或IVF_FLAT
    metric_type="L2",
    params={"M": 16, "ef_construction": 256}
)
```

---

**更新时间**：2026年2月 | **版本**：v1.0
