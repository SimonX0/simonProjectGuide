---
title: 第2章：关系型数据库基础 - SQL
---

# ：关系型数据库基础 - SQL

> **难度等级**：⭐ 入门 | **学习时长**：4小时 | **实战项目**：电商数据库设计

## 📚 本章目录

- [2.1 关系型数据库概述](#21-关系型数据库概述)
- [2.2 SQL 基础语法](#22-sql-基础语法)
- [2.3 数据定义语言 (DDL)](#23-数据定义语言-ddl)
- [2.4 数据操作语言 (DML)](#24-数据操作语言-dml)
- [2.5 数据查询语言 (DQL)](#25-数据查询语言-dql)
- [2.6 事务控制语言 (TCL)](#26-事务控制语言-tcl)
- [2.7 索引与性能优化](#27-索引与性能优化)
- [2.8 数据库设计规范](#28-数据库设计规范)

---

## 关系型数据库概述

### 什么是关系型数据库？

**关系型数据库 (RDBMS)** 是基于关系模型的数据库管理系统：

```
关系模型核心概念：
├─ 表 (Table)：数据存储的结构化单元
├─ 行 (Row)：一条记录
├─ 列 (Column)：一个字段
├─ 主键 (Primary Key)：唯一标识一行
├─ 外键 (Foreign Key)：建立表之间关系
└─ 索引 (Index)：加速查询
```

### 主流关系型数据库

| 数据库 | 特点 | 适用场景 |
|--------|------|----------|
| **MySQL** | 开源、流行、社区活跃 | Web应用、中小型企业 |
| **PostgreSQL** | 高级特性、扩展性强 | 复杂查询、地理信息系统 |
| **Oracle** | 企业级、高可用、功能强大 | 金融、电信、大型企业 |
| **SQL Server** | 微软生态、.NET 友好 | Windows 企业应用 |

---

## SQL 基础语法

### SQL 分类

```sql
-- SQL 分为五大类：

-- 1. DDL (Data Definition Language) 数据定义语言
CREATE, ALTER, DROP, TRUNCATE

-- 2. DML (Data Manipulation Language) 数据操作语言
INSERT, UPDATE, DELETE

-- 3. DQL (Data Query Language) 数据查询语言
SELECT

-- 4. DCL (Data Control Language) 数据控制语言
GRANT, REVOKE

-- 5. TCL (Transaction Control Language) 事务控制语言
COMMIT, ROLLBACK, SAVEPOINT
```

### SQL 语句执行顺序

```sql
-- 实际执行顺序（不是书写顺序）：
FROM     -- 1. 确定数据源
WHERE    -- 2. 过滤行
GROUP BY -- 3. 分组
HAVING   -- 4. 过滤分组
SELECT   -- 5. 选择列
ORDER BY -- 6. 排序
LIMIT    -- 7. 限制行数

-- 示例
SELECT department, COUNT(*) as count
FROM employees
WHERE salary > 5000
GROUP BY department
HAVING COUNT(*) > 2
ORDER BY count DESC
LIMIT 5;
```

---

## 数据定义语言 (DDL)

### 创建数据库

```sql
-- 创建数据库
CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE mydb;

-- 删除数据库
DROP DATABASE mydb;
```

### 创建表

```sql
-- 基本语法
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL COMMENT '邮箱',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    age TINYINT DEFAULT 18 COMMENT '年龄',
    status TINYINT DEFAULT 1 COMMENT '状态 1-正常 0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_email (email),
    INDEX idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 数据类型

**数值类型**：

| 类型 | 存储范围 | 用途 |
|-----|---------|------|
| TINYINT | -128 ~ 127 | 小整数、状态 |
| SMALLINT | -32768 ~ 32767 | 中等整数 |
| INT | -2147483648 ~ 2147483647 | 普通整数 |
| BIGINT | -9.22×10¹⁸ ~ 9.22×10¹⁸ | 大整数、ID |
| DECIMAL(p,s) | 精确小数 | 金额、精确计算 |
| FLOAT | 近似小数 | 科学计算 |

**字符串类型**：

| 类型 | 最大长度 | 特点 |
|-----|---------|------|
| CHAR(n) | 255 | 定长，速度快 |
| VARCHAR(n) | 65535 | 变长，省空间 |
| TEXT | 65535 | 长文本 |
| LONGTEXT | 4GB | 超长文本 |

**日期时间类型**：

```sql
-- DATE：日期 2024-01-15
-- TIME：时间 14:30:00
-- DATETIME：日期时间 2024-01-15 14:30:00
-- TIMESTAMP：时间戳 1970-2038 年
-- YEAR：年份 2024

CREATE TABLE events (
    event_date DATE,
    event_time TIME,
    event_datetime DATETIME,
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_year YEAR
);
```

### 修改表结构

```sql
-- 添加列
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 删除列
ALTER TABLE users DROP COLUMN phone;

-- 修改列类型
ALTER TABLE users MODIFY COLUMN username VARCHAR(100);

-- 重命名列
ALTER TABLE users CHANGE COLUMN username nickname VARCHAR(50);

-- 添加索引
ALTER TABLE users ADD INDEX idx_age (age);

-- 删除索引
ALTER TABLE users DROP INDEX idx_age;

-- 重命名表
ALTER TABLE users RENAME TO customers;
```

---

## 数据操作语言 (DML)

### 插入数据

```sql
-- 1. 指定列插入
INSERT INTO users (username, email, password) VALUES ('alice', 'alice@example.com', 'hashed_password');

-- 2. 全列插入
INSERT INTO users VALUES (NULL, 'bob', 'bob@example.com', 'hashed_password', 25, 1, NOW(), NOW());

-- 3. 批量插入
INSERT INTO users (username, email, password) VALUES
('charlie', 'charlie@example.com', 'hashed_password'),
('david', 'david@example.com', 'hashed_password'),
('eve', 'eve@example.com', 'hashed_password');

-- 4. 从查询结果插入
INSERT INTO archived_users SELECT * FROM users WHERE created_at < '2020-01-01';
```

### 更新数据

```sql
-- 1. 单表更新
UPDATE users SET status = 0 WHERE id = 1;

-- 2. 多列更新
UPDATE users SET status = 0, updated_at = NOW() WHERE id = 1;

-- 3. 条件更新
UPDATE users SET status = 0 WHERE age < 18;

-- 4. 排序更新（限制更新行数）
UPDATE users SET status = 1 ORDER BY created_at DESC LIMIT 10;
```

### 删除数据

```sql
-- 1. 条件删除
DELETE FROM users WHERE id = 1;

-- 2. 批量删除
DELETE FROM users WHERE status = 0 AND created_at < '2020-01-01';

-- 3. 清空表（保留表结构，重置自增ID）
TRUNCATE TABLE users;

-- 4. 删除所有数据（逐行删除，慢）
DELETE FROM users;
```

---

## 数据查询语言 (DQL)

### 基础查询

```sql
-- 1. 查询所有列
SELECT * FROM users;

-- 2. 查询指定列
SELECT id, username, email FROM users;

-- 3. 去重查询
SELECT DISTINCT status FROM users;

-- 4. 别名
SELECT id AS user_id, username AS name FROM users;

-- 5. 限制行数
SELECT * FROM users LIMIT 10;

-- 6. 分页查询
SELECT * FROM users LIMIT 0, 10;  -- 第1页，每页10条
SELECT * FROM users LIMIT 10, 10; -- 第2页，每页10条

-- MySQL 8.0+ 分页语法
SELECT * FROM users LIMIT 10 OFFSET 0;
```

### 条件查询

```sql
-- 1. 比较运算符
SELECT * FROM users WHERE age > 18;
SELECT * FROM users WHERE age >= 18;
SELECT * FROM users WHERE age != 18;

-- 2. 逻辑运算符
SELECT * FROM users WHERE age > 18 AND age < 30;
SELECT * FROM users WHERE status = 1 OR status = 2;
SELECT * FROM users WHERE NOT (status = 0);

-- 3. 范围查询
SELECT * FROM users WHERE age BETWEEN 18 AND 30;
SELECT * FROM users WHERE age IN (18, 20, 25);

-- 4. 模糊查询
SELECT * FROM users WHERE username LIKE 'a%';   -- 以 a 开头
SELECT * FROM users WHERE username LIKE '%a%';  -- 包含 a
SELECT * FROM users WHERE username LIKE '_a%';  -- 第二个字符是 a

-- 5. NULL 查询
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;
```

### 排序查询

```sql
-- 1. 单列排序
SELECT * FROM users ORDER BY age ASC;   -- 升序
SELECT * FROM users ORDER BY age DESC;  -- 降序

-- 2. 多列排序
SELECT * FROM users ORDER BY status DESC, created_at ASC;

-- 3. 按表达式排序
SELECT * FROM users ORDER BY LENGTH(username) DESC;
```

### 聚合函数

```sql
-- COUNT：统计行数
SELECT COUNT(*) FROM users;
SELECT COUNT(email) FROM users;  -- 忽略 NULL

-- SUM：求和
SELECT SUM(age) FROM users;

-- AVG：平均
SELECT AVG(age) FROM users;

-- MIN/MAX：最小值/最大值
SELECT MIN(age), MAX(age) FROM users;

-- GROUP BY：分组
SELECT status, COUNT(*) as count FROM users GROUP BY status;
SELECT gender, AVG(age) as avg_age FROM users GROUP BY gender;

-- HAVING：过滤分组
SELECT status, COUNT(*) as count FROM users GROUP BY status HAVING count > 10;
```

### 多表查询

```sql
-- 1. 内连接（INNER JOIN）
SELECT u.username, o.order_id
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- 2. 左连接（LEFT JOIN）
SELECT u.username, o.order_id
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- 3. 右连接（RIGHT JOIN）
SELECT u.username, o.order_id
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;

-- 4. 全连接（FULL OUTER JOIN，MySQL 不支持，使用 UNION）
SELECT u.username, o.order_id
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
UNION
SELECT u.username, o.order_id
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;

-- 5. 多表连接
SELECT u.username, p.product_name, o.amount
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id;
```

### 子查询

```sql
-- 1. 标量子查询（返回单值）
SELECT username FROM users WHERE age > (SELECT AVG(age) FROM users);

-- 2. 列子查询（返回一列）
SELECT username FROM users WHERE id IN (SELECT user_id FROM orders);

-- 3. 行子查询（返回一行）
SELECT * FROM users WHERE (age, status) = (SELECT age, status FROM users WHERE id = 1);

-- 4. 表子查询（返回多行多列）
SELECT * FROM (SELECT * FROM users WHERE status = 1) AS active_users;

-- 5. EXISTS 子查询
SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

### 窗口函数

```sql
-- 1. ROW_NUMBER()：行号
SELECT username, salary,
       ROW_NUMBER() OVER (ORDER BY salary DESC) as rank
FROM employees;

-- 2. RANK()：排名（相同值排名相同，跳号）
SELECT username, salary,
       RANK() OVER (ORDER BY salary DESC) as rank
FROM employees;

-- 3. DENSE_RANK()：排名（相同值排名相同，不跳号）
SELECT username, salary,
       DENSE_RANK() OVER (ORDER BY salary DESC) as rank
FROM employees;

-- 4. 分组排名
SELECT department, username, salary,
       RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank
FROM employees;

-- 5. 聚合窗口
SELECT username, salary,
       SUM(salary) OVER () as total_salary,
       SUM(salary) OVER (ORDER BY salary) as running_total
FROM employees;

-- 6. LAG/LEAD：访问前/后行
SELECT username, salary,
       LAG(salary, 1) OVER (ORDER BY salary) as prev_salary,
       LEAD(salary, 1) OVER (ORDER BY salary) as next_salary
FROM employees;
```

---

## 事务控制语言 (TCL)

### 事务 ACID 特性

```
ACID：
├─ Atomicity (原子性)：事务要么全部执行，要么全部不执行
├─ Consistency (一致性)：事务执行前后，数据库状态一致
├─ Isolation (隔离性)：多个事务并发执行时，互不干扰
└─ Durability (持久性)：事务提交后，结果永久保存
```

### 事务控制

```sql
-- 1. 开启事务
BEGIN;
-- 或
START TRANSACTION;

-- 2. 执行操作
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- 3. 提交事务
COMMIT;

-- 4. 回滚事务
ROLLBACK;

-- 5. 保存点
SAVEPOINT sp1;
ROLLBACK TO SAVEPOINT sp1;
RELEASE SAVEPOINT sp1;
```

### 事务隔离级别

```sql
-- 查看隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;    -- 读未提交
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;      -- 读已提交（Oracle 默认）
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;     -- 可重复读（MySQL 默认）
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;        -- 串行化
```

---

## 索引与性能优化

### 索引类型

```sql
-- 1. 主键索引（自动创建）
PRIMARY KEY

-- 2. 唯一索引
UNIQUE INDEX

-- 3. 普通索引
INDEX

-- 4. 全文索引
FULLTEXT INDEX

-- 5. 空间索引
SPATIAL INDEX
```

### 创建索引

```sql
-- 1. 创建表时创建索引
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    username VARCHAR(50),
    INDEX idx_username (username)
);

-- 2. 创建索引
CREATE INDEX idx_email ON users(email);
CREATE UNIQUE INDEX idx_username ON users(username);

-- 3. 复合索引
CREATE INDEX idx_status_created ON users(status, created_at);

-- 4. 全文索引
CREATE FULLTEXT INDEX ft_index ON articles(title, content);

-- 5. 查看索引
SHOW INDEX FROM users;

-- 6. 删除索引
DROP INDEX idx_username ON users;
```

### 索引设计原则

**何时创建索引**：
- 频繁作为 WHERE 条件的列
- 经常用于 JOIN 的列
- 经常用于 ORDER BY 的列
- 经常用于 DISTINCT 的列

**何时不创建索引**：
- 频繁更新的列
- 数据量小的表
- 区分度低的列（如性别）
- BLOB/TEXT 等大字段

### 查询优化

```sql
-- 1. 使用 EXPLAIN 分析执行计划
EXPLAIN SELECT * FROM users WHERE email = 'alice@example.com';

-- 2. 避免 SELECT *
SELECT id, username FROM users;  -- 好
SELECT * FROM users;             -- 差

-- 3. 利用索引
SELECT * FROM users WHERE DATE(created_at) = '2024-01-15';  -- 不走索引
SELECT * FROM users WHERE created_at >= '2024-01-15' AND created_at < '2024-01-16';  -- 走索引

-- 4. 避免 OR，使用 UNION
SELECT * FROM users WHERE status = 1 OR age > 30;
-- 改为
SELECT * FROM users WHERE status = 1
UNION
SELECT * FROM users WHERE age > 30;

-- 5. LIKE 优化
SELECT * FROM users WHERE username LIKE '%a%';  -- 不走索引
SELECT * FROM users WHERE username LIKE 'a%';  -- 走索引

-- 6. LIMIT 优化
SELECT * FROM users WHERE status = 1 LIMIT 1000000, 10;  -- 慢
SELECT * FROM users WHERE id > 1000000 AND status = 1 LIMIT 10;  -- 快
```

---

## 数据库设计规范

### 三大范式

**第一范式 (1NF)**：每个字段不可再分

```sql
-- 不符合 1NF
CREATE TABLE users (
    id INT,
    name VARCHAR(50),  -- "张三, 北京市, 朝阳区"
    address VARCHAR(100)
);

-- 符合 1NF
CREATE TABLE users (
    id INT,
    name VARCHAR(50),
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50)
);
```

**第二范式 (2NF)**：非主键字段完全依赖于主键

```sql
-- 不符合 2NF（有部分依赖）
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    product_name VARCHAR(100),  -- 依赖于 product_id
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);

-- 符合 2NF
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100)
);
```

**第三范式 (3NF)**：非主键字段不传递依赖于主键

```sql
-- 不符合 3NF（有传递依赖）
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    department_id INT,
    department_name VARCHAR(100)  -- 依赖于 department_id
);

-- 符合 3NF
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    department_id INT
);

CREATE TABLE departments (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(100)
);
```

### 设计实战：电商数据库

```sql
-- 用户表
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status TINYINT DEFAULT 1 COMMENT '1-正常 0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 分类表
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT DEFAULT 0,
    name VARCHAR(50) NOT NULL,
    level TINYINT DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

-- 商品表
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    subtitle VARCHAR(200),
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    sales INT DEFAULT 0,
    status TINYINT DEFAULT 1 COMMENT '1-上架 0-下架',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 订单表
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TINYINT DEFAULT 1 COMMENT '1-待支付 2-已支付 3-已发货 4-已完成',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单明细表
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(200),
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';
```

---

## ✅ 本章小结

### 学习检查清单

完成本章学习后，请确认你能够：

- [ ] 理解关系型数据库的核心概念
- [ ] 掌握 SQL 五大类语言的用法
- [ ] 创建和管理数据库表
- [ ] 编写复杂的查询语句
- [ ] 使用事务保证数据一致性
- [ ] 创建索引优化查询性能
- [ ] 遵循数据库三范式设计表结构
- [ ] 设计一个完整的电商数据库

### 核心要点回顾

1. **SQL 分类**：DDL、DML、DQL、DCL、TCL
2. **查询顺序**：FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
3. **JOIN 类型**：INNER、LEFT、RIGHT、FULL
4. **事务 ACID**：原子性、一致性、隔离性、持久性
5. **三范式**：1NF（不可再分）、2NF（完全依赖）、3NF（不传递依赖）

## 📚 延伸阅读

- [第1章：数据库简介与环境搭建 →](./chapter-01)
- [第3章：MySQL 8.0 完全指南 →](./chapter-03)
- [第4章：PostgreSQL 16 高级特性 →](./chapter-04)

---

**更新时间**：2026年2月 | **版本**：v1.0
