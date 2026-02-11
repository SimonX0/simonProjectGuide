---
title: PostgreSQL 16+面试题
---

# PostgreSQL 16+面试题

> **难度等级**：⭐⭐ | **出现频率**：70% | **建议用时**：25分钟

## 基础概念题

### 1. PostgreSQL与MySQL的区别？

**参考答案**：

| 特性 | PostgreSQL | MySQL |
|-----|------------|-------|
| **ACID** | 更严格 | 支持但相对宽松 |
| **MVCC** | 多版本并发控制 | MVCC |
| **复杂查询** | 更强大 | 支持但较弱 |
| **JSON支持** | JSONB（二进制，更快） | JSON（文本解析） |
| **全文搜索** | 内置强大 | 需要插件或ES |
| **窗口函数** | 支持完善 | 8.0+支持 |
| **数据类型** | 更丰富（Array、JSONB、IP等） | 基础类型 |
| **索引类型** | B-tree、Hash、GiST、GIN、SP-GiST | B-tree、Hash |
| **适用场景** | 复杂查询、分析型应用 | 简单查询、OLTP |

---

### 2. PostgreSQL有哪些高级数据类型？

**参考答案**：

**1. 数组类型**
```sql
-- 创建数组字段
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    tags TEXT[]
);

-- 插入数组数据
INSERT INTO users (tags) VALUES ARRAY['编程', '数据库'];

-- 查询数组
SELECT * FROM users WHERE '编程' = ANY(tags);

-- 数组展开
SELECT id, unnest(tags) AS tag FROM users;
```

**2. JSONB类型**
```sql
-- JSONB存储
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    attributes JSONB
);

-- JSONB查询（更快，支持索引）
SELECT * FROM products
WHERE attributes->>'brand' = 'Apple';

-- JSONB包含查询
SELECT * FROM products
WHERE attributes @> '{"brand": "Apple"}';

-- JSONB存在键查询
SELECT * FROM products
WHERE attributes ? 'price';
```

**3. 范围类型**
```sql
-- int4range、int8range、tsrange、daterange等
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    during TSRANGE
);

-- 范围查询
SELECT * FROM reservations
WHERE during && TSRANGE('2024-01-01', '2024-12-31');
```

**4. 网络地址类型**
```sql
-- inet、cidr
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    ip INET
);

-- IP查询
SELECT * FROM logs WHERE ip << '192.168.1.0/24';
```

---

### 3. PostgreSQL的索引类型有哪些？

**参考答案**：

**1. B-tree索引**（默认）
- 适用：=、>、<、>=、<=、BETWEEN
- 支持排序

**2. Hash索引**
- 适用：= 比较
- 不支持范围查询

**3. GiST索引**（通用搜索树）
- 适用：几何、全文搜索、范围类型
- 示例：PostGIS地理数据

**4. GIN索引**（倒排索引）
- 适用：数组、JSONB、全文搜索
- 示例：包含查询 @>、?、@

**5. BRIN索引**（块范围索引）
- 适用：超大数据集的顺序数据
- 示例：时间序列数据

```sql
-- GIN索引（JSONB）
CREATE INDEX idx_products_attrs ON products USING GIN (attributes);

-- GiST索引（范围）
CREATE INDEX idx_reservations_during ON reservations USING GiST (during);

-- BRIN索引（时间序列）
CREATE INDEX idx_logs_created ON logs USING BRIN (created_at);
```

---

## 高级特性题

### 4. PostgreSQL的窗口函数有哪些特点？

**参考答案**：

PostgreSQL支持丰富的窗口函数：

**排名函数**
```sql
SELECT
    employee_name,
    salary,
    RANK() OVER (ORDER BY salary DESC) AS rank,
    DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank,
    ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num
FROM employees;
```

**聚合函数**
```sql
SELECT
    department,
    employee_name,
    salary,
    SUM(salary) OVER (
        PARTITION BY department
        ORDER BY hire_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_salary
FROM employees;
```

**偏移函数**
```sql
SELECT
    date,
    sales,
    LAG(sales, 7) OVER (ORDER BY date) AS sales_last_week,
    sales - LAG(sales, 7) OVER (ORDER BY date) AS growth
FROM daily_sales;
```

---

### 5. WITH（CTE）的使用场景？

**参考答案**：

**场景1：简化复杂查询**
```sql
-- 销售汇总
WITH sales_summary AS (
    SELECT
        customer_id,
        SUM(amount) AS total
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
)
SELECT
    c.name,
    s.total
FROM customers c
INNER JOIN sales_summary s ON c.id = s.customer_id
WHERE s.total > 10000;
```

**场景2：递归查询**
```sql
-- 组织架构树
WITH RECURSIVE org_tree AS (
    -- 基础查询
    SELECT id, name, parent_id, 1 AS level
    FROM employees
    WHERE parent_id IS NULL

    UNION ALL

    -- 递归查询
    SELECT
        e.id,
        e.name,
        e.parent_id,
        ot.level + 1
    FROM employees e
    INNER JOIN org_tree ot ON e.parent_id = ot.id
)
SELECT * FROM org_tree;
```

---

## 全文搜索题

### 6. PostgreSQL全文搜索如何使用？

**参考答案**：

**方案1：内置全文搜索**
```sql
-- 创建全文搜索索引
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    body TEXT
);

-- 创建GIN索引
CREATE INDEX idx_articles_body ON articles USING GIN (to_tsvector('english', body));

-- 全文搜索
SELECT
    id,
    title,
    ts_headline('english', body, to_tsquery('english', 'PostgreSQL')) AS headline
FROM articles
WHERE to_tsvector('english', body) @@ to_tsquery('english', 'database');
```

**方案2：中文全文搜索**
```sql
-- 使用zhparser插件
CREATE INDEX idx_articles_zh ON articles
USING GIN (to_tsvector('zhparser', body));

-- 中文搜索
SELECT * FROM articles
WHERE to_tsvector('zhparser', body) @@ to_tsquery('zhparser', '数据库');
```

---

### 7. PostgreSQL如何优化查询？

**参考答案**：

**1. 使用EXPLAIN ANALYZE**
```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE name = '张三';

-- 关键指标
-- - Seq Scan vs Index Scan
-- - Filter条件
-- - Heap Fetch获取行数
```

**2. 部分索引**
```sql
-- 部分索引（只索引常用列）
CREATE INDEX idx_users_name_partial ON users (name)
WHERE status = 'active';  -- 只索引活跃用户
```

**3. 表达式索引**
```sql
-- 表达式索引
CREATE INDEX idx_users_lower_name ON users (LOWER(name));

-- 使用索引
SELECT * FROM users WHERE LOWER(name) = 'zhang san';
```

**4. 并发控制**
```sql
-- 悲观锁
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;

-- 乐观锁（version字段）
UPDATE accounts
SET balance = balance - 100, version = version + 1
WHERE id = 1 AND version = 5;
```

---

## 实战场景题

### 8. 设计一个标签系统

**参考答案**：

**方案1：数组类型**
```sql
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    tags TEXT[]
);

-- 插入
INSERT INTO articles (title, tags)
VALUES ('PostgreSQL教程', ARRAY['数据库', 'PostgreSQL', '教程']);

-- 查询包含特定标签
SELECT * FROM articles WHERE '数据库' = ANY(tags);

-- GIN索引加速
CREATE INDEX idx_articles_tags ON articles USING GIN (tags);
```

**方案2：JSONB类型**
```sql
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    tags JSONB
);

-- 插入
INSERT INTO articles (title, tags)
VALUES ('PostgreSQL教程', '["数据库", "PostgreSQL", "教程"]'::jsonb);

-- 查询
SELECT * FROM articles WHERE tags @> '"数据库"';

-- GIN索引
CREATE INDEX idx_articles_tags_jsonb ON articles USING GIN (tags);
```

---

### 9. 如何实现软删除？

**参考答案**：

```sql
-- 创建软删除表
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

-- 软删除
UPDATE users SET deleted_at = NOW() WHERE id = ?;

-- 查询未删除数据（推荐部分索引）
CREATE INDEX idx_users_deleted_partial ON users (id)
WHERE deleted_at IS NULL;

SELECT * FROM users WHERE deleted_at IS NULL;

-- 唯一索引（包含已删除）
CREATE UNIQUE INDEX idx_users_email_deleted ON users (email, deleted_at);
```

---

### 10. 如何实现审计日志？

**参考答案**：

**方案1：触发器**
```sql
-- 审计表
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT,
    operation TEXT,
    old_data JSONB,
    new_data JSONB,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 触发器函数
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        row_to_json(OLD),
        row_to_json(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

**方案2：逻辑复制**
```sql
-- 适合实时同步到数据仓库
CREATE PUBLICATION audit_pub FOR TABLE users;

-- 订阅
CREATE SUBSCRIPTION audit_sub
CONNECTION 'dbname=warehouse host=db'
PUBLICATION audit_pub;
```

---

**更新时间**：2026年2月 | **版本**：v1.0
