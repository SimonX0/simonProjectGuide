---
title: 第8章：MySQL 8.0+ 新特性深度解析
---

# ：MySQL 8.0+ 新特性深度解析

> **难度等级**：⭐⭐ 进阶 | **学习时长**：5小时 | **实战项目**：MySQL 8.0 新特性实战

## 📚 本章目录

- [7.1 窗口函数](#71-窗口函数)
- [7.2 公用表表达式 CTE](#72-公用表表达式-cte)
- [7.3 JSON 增强](#73-json-增强)
- [7.4 直方图统计](#74-直方图统计)
- [7.5 不可见索引](#75-不可见索引)
- [7.6 降序索引](#76-降序索引)
- [7.7 通用表表达式](#77-递归cte)
- [7.8 性能架构增强](#78-性能架构增强)

---

## 窗口函数

### 什么是窗口函数？

窗口函数（Window Functions）允许在对行进行计算时，同时访问该行所属分组中的其他行。

```sql
window_function_name(expression) OVER (
    [PARTITION BY ...]
    [ORDER BY ...]
    [FRAME clause]
)
```

### 常用窗口函数

```sql
-- 1. 排名函数
ROW_NUMBER()   -- 连续排名：1, 2, 3, 4
RANK()         -- 跳跃排名：1, 2, 2, 4
DENSE_RANK()   -- 密集排名：1, 2, 2, 3

-- 2. 偏移函数
LAG(expr, offset)   -- 获取前N行数据
LEAD(expr, offset)  -- 获取后N行数据

-- 3. 聚合函数
SUM() OVER (...)   -- 累计求和
AVG() OVER (...)   -- 移动平均
COUNT() OVER(...)  -- 累计计数
```

### 实战示例

```sql
-- 1. 计算每个部门的工资排名
SELECT
    employee_name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank_in_dept
FROM employees;

-- 2. 计算累计销售额
SELECT
    order_date,
    amount,
    SUM(amount) OVER (
        ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_amount
FROM sales;

-- 3. 计算同比增长
SELECT
    year,
    month,
    sales,
    LAG(sales, 12) OVER (ORDER BY year, month) AS sales_last_year,
    (sales - LAG(sales, 12) OVER (ORDER BY year, month)) / LAG(sales, 12) OVER (ORDER BY year, month) * 100 AS yoy_growth
FROM monthly_sales;

-- 4. 移动平均
SELECT
    date,
    price,
    AVG(price) OVER (
        ORDER BY date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS ma7  -- 7日移动平均
FROM stock_prices;
```

---

## 公用表表达式 CTE

### 基本 CTE

```sql
-- 非递归 CTE
WITH cte_name AS (
    SELECT ...
    FROM ...
    WHERE ...
)
SELECT *
FROM cte_name;
```

### CTE 示例

```sql
-- 1. 简化复杂查询
WITH sales_summary AS (
    SELECT
        customer_id,
        SUM(amount) AS total_sales
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
),
customer_info AS (
    SELECT
        id,
        name,
        email
    FROM customers
)
SELECT
    c.name,
    c.email,
    s.total_sales
FROM customer_info c
INNER JOIN sales_summary s ON c.id = s.customer_id
WHERE s.total_sales > 10000;

-- 2. 多个 CTE
WITH category_sales AS (
    SELECT c.category_id, c.name, SUM(o.amount) AS total
    FROM categories c
    LEFT JOIN products p ON c.category_id = p.category_id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    GROUP BY c.category_id, c.name
),
top_categories AS (
    SELECT * FROM category_sales
    ORDER BY total DESC
    LIMIT 5
)
SELECT * FROM top_categories;
```

### 递归 CTE

```sql
-- 递归 CTE 语法
WITH RECURSIVE cte_name AS (
    -- 初始查询（锚点成员）
    SELECT ...
    UNION ALL
    -- 递归查询
    SELECT ...
    FROM cte_name ...
)
SELECT * FROM cte_name;

-- 示例：生成数字序列
WITH RECURSIVE numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM numbers WHERE n < 100
)
SELECT n FROM numbers;

-- 示例：组织架构树
WITH RECURSIVE org_tree AS (
    -- 根节点
    SELECT id, name, parent_id, 1 AS level
    FROM employees
    WHERE parent_id IS NULL

    UNION ALL

    -- 递归子节点
    SELECT e.id, e.name, e.parent_id, ot.level + 1
    FROM employees e
    INNER JOIN org_tree ot ON e.parent_id = ot.id
)
SELECT * FROM org_tree;

-- 示例：计算路径
WITH RECURSIVE category_path AS (
    SELECT
        id,
        name,
        name AS path
    FROM categories
    WHERE parent_id IS NULL

    UNION ALL

    SELECT
        c.id,
        c.name,
        CONCAT(cp.path, ' > ', c.name) AS path
    FROM categories c
    INNER JOIN category_path cp ON c.parent_id = cp.id
)
SELECT * FROM category_path;
```

---

## JSON 增强

### JSON 数据类型

```sql
-- 创建 JSON 列
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    attributes JSON,  -- JSON 列
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入 JSON 数据
INSERT INTO products (id, name, attributes)
VALUES (1, 'Laptop', '{
    "brand": "Apple",
    "model": "MacBook Pro",
    "specs": {
        "cpu": "M2",
        "ram": "16GB",
        "storage": "512GB"
    },
    "price": 1999.99,
    "tags": ["computer", "apple", "pro"]
}');
```

### JSON 函数

```sql
-- 1. JSON 提取
SELECT
    attributes->>'$.brand' AS brand,           -- 提取字符串
    attributes->'$.specs.cpu' AS cpu,            -- 提取 JSON 对象
    attributes->>'$.price' AS price,             -- 提取数字
    attributes->>'$.tags[0]' AS first_tag        -- 提取数组元素
FROM products
WHERE id = 1;

-- 2. JSON 搜索
-- JSON_CONTAINS(): 检查 JSON 是否包含指定值
SELECT * FROM products
WHERE JSON_CONTAINS(attributes, '{"brand": "Apple"}');

-- JSON_CONTAINS_PATH(): 检查路径是否存在
SELECT * FROM products
WHERE JSON_CONTAINS_PATH(attributes, 'one', '$.specs.cpu');

-- 3. JSON 修改
-- JSON_SET(): 设置值（存在则更新，不存在则插入）
UPDATE products
SET attributes = JSON_SET(attributes, '$.price', 1899.99)
WHERE id = 1;

-- JSON_INSERT(): 插入值（不存在才插入）
UPDATE products
SET attributes = JSON_INSERT(attributes, '$.color', 'silver')
WHERE id = 1;

-- JSON_REPLACE(): 替换值（存在才更新）
UPDATE products
SET attributes = JSON_REPLACE(attributes, '$.price', 1799.99)
WHERE id = 1;

-- JSON_REMOVE(): 删除值
UPDATE products
SET attributes = JSON_REMOVE(attributes, '$.tags[0]')
WHERE id = 1;

-- 4. JSON 数组操作
-- JSON_ARRAY(): 创建数组
SELECT JSON_ARRAY(1, 2, 3);

-- JSON_ARRAY_APPEND(): 追加元素
UPDATE products
SET attributes = JSON_ARRAY_APPEND(attributes, '$.tags', 'new')

-- JSON_ARRAY_INSERT(): 插入元素
UPDATE products
SET attributes = JSON_ARRAY_INSERT(attributes, '$.tags[1]', 'premium')

-- 5. JSON 其他函数
-- JSON_KEYS(): 获取所有键
SELECT JSON_KEYS(attributes) FROM products;

-- JSON_LENGTH(): 获取长度
SELECT JSON_LENGTH(attributes->>'$.tags') FROM products;

-- JSON_VALID(): 验证 JSON
SELECT JSON_VALID('{"name": "test"}');  -- 1

-- JSON_PRETTY(): 格式化输出
SELECT JSON_PRETTY(attributes) FROM products;
```

### JSON 索引

```sql
-- 1. 虚拟列索引
ALTER TABLE products
ADD COLUMN brand VARCHAR(50)
AS (attributes->>'$.brand') STORED;

CREATE INDEX idx_brand ON products(brand);

-- 2. 函数索引 (MySQL 8.0.13+)
CREATE INDEX idx_json_price
ON products((CAST(attributes->>'$.price' AS DECIMAL(10,2))));
```

---

## 直方图统计

### 什么是直方图？

直方图提供列值的分布统计信息，帮助优化器选择更好的执行计划。

```sql
-- 创建直方图
ANALYZE TABLE products UPDATE HISTOGRAM ON price, category_id;

-- 查看直方图
SELECT * FROM information_schema.column_statistics
WHERE table_name = 'products';

-- 删除直方图
ANALYZE TABLE products DROP HISTOGRAM ON price;
```

### 直方图类型

```sql
-- 1. 单桶直方图（等宽）
ANALYZE TABLE products UPDATE HISTOGRAM ON price WITH 10 BUCKETS;

-- 2. 单桶直方图（等高）
ANALYZE TABLE products UPDATE HISTOGRAM ON price WITH 10 BUCKETS;

-- 查看直方图信息
SELECT
    column_name,
    histogram->>'$."buckets"' AS buckets
FROM information_schema.column_statistics
WHERE table_name = 'products';
```

---

## 不可见索引

### 创建不可见索引

```sql
-- 创建不可见索引
CREATE INDEX idx_email ON users(email) INVISIBLE;

-- 修改索引可见性
ALTER TABLE users ALTER INDEX idx_email VISIBLE;
ALTER TABLE users ALTER INDEX idx_email INVISIBLE;

-- 用途：测试删除索引的影响
-- 1. 将索引设为不可见
-- 2. 观察性能变化
-- 3. 如果没有影响，可以安全删除
DROP INDEX idx_email ON users;
```

---

## 降序索引

### 降序索引

```sql
-- MySQL 8.0 支持降序索引
CREATE INDEX idx_price_desc ON products(price DESC);

-- 组合降序索引
CREATE INDEX idx_created_status
ON orders(created_at DESC, status ASC);

-- 使用降序索引
SELECT * FROM orders
ORDER BY created_at DESC, status ASC;
```

---

## 递归 CTE

### 层级查询

```sql
-- 查询员工层级
WITH RECURSIVE emp_hierarchy AS (
    -- 基础查询：顶级员工
    SELECT
        id,
        name,
        parent_id,
        1 AS level,
        CAST(name AS CHAR(1000)) AS path
    FROM employees
    WHERE parent_id IS NULL

    UNION ALL

    -- 递归查询：下属员工
    SELECT
        e.id,
        e.name,
        e.parent_id,
        h.level + 1,
        CONCAT(h.path, ' > ', e.name)
    FROM employees e
    INNER JOIN emp_hierarchy h ON e.parent_id = h.id
)
SELECT * FROM emp_hierarchy;
```

---

## 性能架构增强

### 数据字典

MySQL 8.0 使用 InnoDB 存储数据字典，替代了之前的 .frm 文件：

```sql
-- 查看表信息
SELECT * FROM information_schema.tables
WHERE table_schema = 'mydb';

-- 查看列信息
SELECT * FROM information_schema.columns
WHERE table_schema = 'mydb' AND table_name = 'users';

-- 查看索引信息
SELECT * FROM information_schema.statistics
WHERE table_schema = 'mydb';
```

### 性能 Schema

```sql
-- 查看慢查询
SELECT * FROM performance_schema.events_statements_summary_by_digest
ORDER BY AVG_TIMER_WAIT DESC LIMIT 10;

-- 查看表 IO 统计
SELECT * FROM performance_schema.table_io_waits_summary_by_table
ORDER BY SUM_TIMER_WAIT DESC LIMIT 10;

-- 查看索引使用情况
SELECT * FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'mydb';
```

---

## ✅ 本章小结

### 学习检查清单

完成本章学习后，请确认你能够：

- [ ] 使用窗口函数进行复杂计算
- [ ] 使用 CTE 简化复杂查询
- [ ] 操作 JSON 数据类型
- [ ] 创建和使用直方图统计
- [ ] 使用不可见索引进行索引测试
- [ ] 创建降序索引优化排序查询
- [ ] 使用递归 CTE 处理层级数据

### 核心要点回顾

1. **窗口函数**：ROW_NUMBER、RANK、LAG/LEAD
2. **CTE**：简化复杂查询、递归查询
3. **JSON**：JSON_EXTRACT、JSON_SET、JSON_CONTAINS
4. **直方图**：列值分布统计
5. **不可见索引**：安全测试索引

## 📚 延伸阅读

- [第7章：实战项目1 - 个人博客数据库设计 →](./chapter-07)
- [第9章：PostgreSQL 16+ 高级特性 →](./chapter-09)
- [MySQL 8.0 官方文档](https://dev.mysql.com/doc/refman/8.0/en/)

---

**更新时间**：2026年2月 | **版本**：v1.0
