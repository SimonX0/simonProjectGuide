---
title: 第9章：PostgreSQL 16+ 高级特性
---

# ：PostgreSQL 16+ 高级特性

> **难度等级**：⭐⭐ 进阶 | **学习时长**：5小时 | **实战项目**：PostgreSQL 高级特性实战

## 📚 本章目录

- [8.1 数组类型与操作](#81-数组类型与操作)
- [8.2 JSONB 类型](#82-jsonb-类型)
- [8.3 全文搜索](#83-全文搜索)
- [8.4 并行查询](#84-并行查询)
- [8.5 逻辑复制](#85-逻辑复制)
- [8.6 分区表增强](#86-分区表增强)
- [8.7 生成列与默认表达式](#87-生成列与默认表达式)
- [8.8 性能增强](#88-性能增强)

---

## 数组类型与操作

### 创建数组列

```sql
-- 创建带数组的表
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    tags TEXT[],           -- 文本数组
    categories INTEGER[],  -- 整数数组
    prices NUMERIC(10,2)[],-- 价格数组
    created_at TIMESTAMP DEFAULT NOW()
);

-- 插入数组数据
INSERT INTO products (name, tags, categories, prices)
VALUES ('Laptop', ARRAY['computer', 'electronics'], ARRAY[1, 5, 10], ARRAY[999.99, 899.99]);
```

### 数组操作

```sql
-- 1. 访问数组元素（从1开始）
SELECT name, tags[1] AS first_tag FROM products;

-- 2. 数组切片
SELECT name, tags[1:2] AS first_two_tags FROM products;

-- 3. 数组长度
SELECT name, array_length(tags, 1) AS tag_count FROM products;

-- 4. 搜索数组元素
SELECT * FROM products WHERE 'computer' = ANY(tags);
SELECT * FROM products WHERE 5 = ANY(categories);

-- 5. 数组包含
SELECT * FROM products WHERE tags @> ARRAY['computer'];
SELECT * FROM products WHERE tags && ARRAY['computer', 'phone'];

-- 6. 数组操作函数
-- array_append(): 追加元素
UPDATE products SET tags = array_append(tags, 'new') WHERE id = 1;

-- array_prepend(): 前置元素
UPDATE products SET tags = array_prepend('featured', tags) WHERE id = 1;

-- array_remove(): 删除元素
UPDATE products SET tags = array_remove(tags, 'old') WHERE id = 1;

-- unnest(): 展开数组为行
SELECT unnest(tags) AS tag FROM products WHERE id = 1;

-- array_agg(): 聚合行为数组
SELECT category_id, array_agg(product_name) FROM products GROUP BY category_id;
```

### 数组索引

```sql
-- GIN 索引支持数组搜索
CREATE INDEX idx_products_tags ON products USING GIN (tags);

-- 使用索引查询
EXPLAIN SELECT * FROM products WHERE 'computer' = ANY(tags);
```

---

## JSONB 类型

### JSON vs JSONB

```sql
-- JSON: 存储文本，查询时解析
-- JSONB: 存储二进制，查询更快，支持索引

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 插入 JSONB 数据
INSERT INTO documents (data)
VALUES ('{
    "title": "PostgreSQL Guide",
    "author": {"name": "John", "email": "john@example.com"},
    "tags": ["database", "postgresql"],
    "metadata": {"views": 100, "likes": 10}
}');
```

### JSONB 操作

```sql
-- 1. 提取值
SELECT data->>'title' AS title FROM documents;
SELECT data->'author'->>'name' AS author FROM documents;
SELECT data->'tags'->>0 AS first_tag FROM documents;

-- 2. JSONB 路径查询
SELECT data#>>'{author,name}' AS author FROM documents;

-- 3. 更新字段
UPDATE documents
SET data = jsonb_set(data, '{metadata,views}', (data->'metadata'->>'views')::int + 1)
WHERE id = 1;

-- 4. 删除字段
UPDATE documents
SET data = data - 'metadata'
WHERE id = 1;

-- 5. 合并 JSONB
UPDATE documents
SET data = data || '{"published": true}'
WHERE id = 1;

-- 6. JSONB 函数
-- jsonb_array_elements(): 展开数组
SELECT jsonb_array_elements_text(data->'tags') AS tag FROM documents;

-- jsonb_object_keys(): 获取所有键
SELECT jsonb_object_keys(data) FROM documents;

-- jsonb_each(): 展开键值对
SELECT * FROM jsonb_each((SELECT data FROM documents WHERE id = 1));
```

### JSONB 索引

```sql
-- 1. GIN 索引（默认）
CREATE INDEX idx_documents_data ON documents USING GIN (data);

-- 2. GIN 索引（jsonb_path_ops）
CREATE INDEX idx_documents_data_path ON documents USING GIN (data jsonb_path_ops);

-- 3. 表达式索引
CREATE INDEX idx_documents_title ON documents ((data->>'title'));

-- 使用索引
SELECT * FROM documents WHERE data @> '{"author": {"name": "John"}}';
```

---

## 全文搜索

### 创建全文搜索索引

```sql
-- 1. 创建 tsvector 列
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    body TEXT,
    tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || body)) STORED
);

-- 2. 创建 GIN 索引
CREATE INDEX idx_articles_tsv ON articles USING GIN (tsv);

-- 3. 全文搜索
SELECT * FROM articles
WHERE tsv @@ to_tsquery('english', 'PostgreSQL & Guide')
ORDER BY ts_rank(tsv, to_tsquery('english', 'PostgreSQL & Guide')) DESC;

-- 4. 高亮显示
SELECT
    title,
    ts_headline('english', body, to_tsquery('english', 'PostgreSQL')) AS highlight
FROM articles
WHERE tsv @@ to_tsquery('english', 'PostgreSQL');
```

### 全文搜索配置

```sql
-- 1. 查看可用配置
SELECT cfgname FROM pg_ts_config;

-- 2. 自定义配置
CREATE TEXT SEARCH CONFIGURATION mydict (COPY = english);

-- 添加字典
ALTER TEXT SEARCH CONFIGURATION mydict
ALTER MAPPING FOR asciiword WITH simple, english_stem;

-- 3. 使用自定义配置
SELECT to_tsvector('mydict', 'Hello World');
```

---

## 并行查询

### 并行查询配置

```sql
-- 1. 启用并行查询
SET max_parallel_workers_per_gather = 4;
SET parallel_setup_cost = 100;
SET parallel_tuple_cost = 0.01;

-- 2. 强制并行查询
SET max_parallel_workers_per_gather = 2;

-- 3. 查看并行计划
EXPLAIN ANALYZE SELECT * FROM large_table WHERE condition;
```

### 并行安全函数

```sql
-- 标记函数为并行安全
CREATE FUNCTION my_func(arg INT) RETURNS INT
LANGUAGE SQL
PARALLEL SAFE
AS 'SELECT arg * 2';
```

---

## 逻辑复制

### 发布与订阅

```sql
-- 主库（发布者）
-- 1. 创建发布
CREATE PUBLICATION my_publication FOR TABLE users, orders;

-- 2. 查看发布
SELECT * FROM pg_publication;

-- 从库（订阅者）
-- 1. 创建订阅
CREATE SUBSCRIPTION my_subscription
CONNECTION 'host=primary_host port=5432 dbname=mydb user=replicator'
PUBLICATION my_publication;

-- 2. 查看订阅
SELECT * FROM pg_subscription;
```

### 逻辑复制过滤

```sql
-- 只发布特定行
CREATE PUBLICATION users_active
FOR TABLE users
WHERE (status = 'active');

-- 只发布特定列
CREATE PUBLICATION users_partial
FOR TABLE users (id, username, email);
```

---

## 分区表增强

### 声明式分区

```sql
-- 1. 创建分区表
CREATE TABLE orders (
    id BIGINT,
    order_date DATE NOT NULL,
    customer_id INT,
    amount NUMERIC(10,2)
) PARTITION BY RANGE (order_date);

-- 2. 创建分区
CREATE TABLE orders_2024_q1 PARTITION OF orders
FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE orders_2024_q2 PARTITION OF orders
FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- 3. 创建默认分区
CREATE TABLE orders_default PARTITION OF orders DEFAULT;

-- 4. 哈希分区
CREATE TABLE users (
    id BIGINT,
    username TEXT
) PARTITION BY HASH (id);

CREATE TABLE users_p0 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE users_p1 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 1);

-- 5. 列表分区
CREATE TABLE orders (
    id BIGINT,
    status TEXT
) PARTITION BY LIST (status);

CREATE TABLE orders_active PARTITION OF orders FOR VALUES IN ('pending', 'processing');
CREATE TABLE orders_completed PARTITION OF orders FOR VALUES IN ('completed', 'cancelled');
```

### 分区管理

```sql
-- 1. 添加分区
CREATE TABLE orders_2024_q3 PARTITION OF orders
FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');

-- 2. 删除分区
DROP TABLE orders_2024_q1;

-- 3. 分离分区
ALTER TABLE orders DETACH PARTITION orders_2024_q2;

-- 4. 附加分区
ALTER TABLE orders ATTACH PARTITION orders_2024_q2 FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
```

---

## 生成列与默认表达式

### 生成列

```sql
-- 1. 存储生成列
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    price NUMERIC(10,2),
    tax NUMERIC(10,2),
    total NUMERIC(10,2) GENERATED ALWAYS AS (price + tax) STORED
);

-- 2. 虚拟生成列（不存储，查询时计算）
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    price NUMERIC(10,2),
    tax NUMERIC(10,2),
    total NUMERIC(10,2) GENERATED ALWAYS AS (price + tax)
);
```

### 默认表达式

```sql
-- 1. 默认值使用函数
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 更新时自动更新时间戳
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 性能增强

### 增量排序

```sql
-- PostgreSQL 16 支持增量排序
SET enable_incremental_sort = on;

EXPLAIN ANALYZE
SELECT * FROM large_table ORDER BY col1, col2, col3;
```

### 并行 vacuum

```sql
-- 并行 vacuum 清理死元组
VACUUM (PARALLEL 4) large_table;
```

---

## ✅ 本章小结

### 学习检查清单

完成本章学习后，请确认你能够：

- [ ] 使用 PostgreSQL 数组类型
- [ ] 操作 JSONB 数据
- [ ] 实现全文搜索
- [ ] 配置并行查询
- [ ] 设置逻辑复制
- [ ] 创建分区表
- [ ] 使用生成列

### 核心要点回顾

1. **数组类型**：支持任意类型数组，支持 GIN 索引
2. **JSONB**：二进制存储，支持索引，性能优秀
3. **全文搜索**：tsvector + GIN 索引
4. **并行查询**：多核 CPU 并行处理
5. **逻辑复制**：发布/订阅模式
6. **分区表**：RANGE、LIST、HASH 分区

## 📚 延伸阅读

- [第9章：MySQL 8.0+ 新特性深度解析 →](./chapter-08)
- [第10章：索引优化与性能调优 →](./chapter-10)
- [PostgreSQL 16 官方文档](https://www.postgresql.org/docs/16/)

---

**更新时间**：2026年2月 | **版本**：v1.0
