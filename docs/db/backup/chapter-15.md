---
title: 第16章：人大金仓 KingbaseES 实战
---

# ：人大金仓 KingbaseES 实战

> **难度等级**：⭐⭐ 进阶 | **学习时长**：6小时 | **实战项目**：政务系统迁移

## 📚 本章目录

- [15.1 KingbaseES 概述](#151-kingbasees-概述)
- [15.2 核心架构](#152-核心架构)
- [15.3 部署与安装](#153-部署与安装)
- [15.4 兼容性特性](#154-兼容性特性)
- [15.5 高级特性](#155-高级特性)
- [15.6 迁移实战](#156-迁移实战)

---

## KingbaseES 概述

### 什么是人大金仓？

**人大金仓（KingbaseES）**是**北京人大金仓信息技术股份有限公司**研发的企业级关系型数据库，具有以下特点：

```mermaid
graph TB
    A[KingbaseES] --> B[高安全性]
    A --> C[高可靠性]
    A --> D[高性能]
    A --> E[高兼容性]

    B --> B1[等保四级]
    B --> B2[三权分立]
    B --> B3[国密算法]

    C --> C1[主备高可用]
    C --> C2[读写分离]
    C --> C3[异地容灾]

    D --> D1[列存引擎]
    D --> D2[并行计算]
    D --> D3[智能优化]

    E --> E1[Oracle兼容]
    E --> E2[PostgreSQL兼容]
    E --> E3[平滑迁移]
```

### 发展历程

| 时间 | 里程碑 |
|-----|-------|
| **1999年** | 人大金仓公司成立，启动数据库研发 |
| **2008年** | KingbaseES V3 发布，支持企业级应用 |
| **2011年** | 通过公安部等保四级认证 |
| **2014年** | KingbaseES V6 发布，支持列存 |
| **2017年** | 成为国产数据库首选品牌之一 |
| **2019年** | KingbaseES V8 发布，全面兼容 PostgreSQL |
| **2021年** | 在党政军市场份额领先 |
| **2023年** | KingbaseES V8R6 发布，支持分布式 |
| **2024年** | 通过多项国家级认证，市场占有率持续提升 |

### 应用场景

**党政机关**：
- 中办、国办、发改委
- 工信部、公安部、司法部
- 各省市政务云

**金融行业**：
- 政策性银行、股份制银行
- 证券公司、保险公司
- 支付结算系统

**军工能源**：
- 航天、航空、船舶
- 石油、石化、电力
- 核工业、兵器

**央企国企**：
- 三大运营商
- 电网、铁路
- 烟草、邮政

---

## 核心架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    KingbaseES 集群                            │
├─────────────────────────────────────────────────────────────┤
│  主节点（Primary）    │  备节点（Standby）   │  备节点（Standby）│
│  ┌─────────────┐    │  ┌─────────────┐   │  ┌─────────────┐  │
│  │  数据读写   │    │  │  只读       │   │  │  只读       │  │
│  │  WAL 日志   │    │  │  WAL 接收   │   │  │  WAL 接收   │  │
│  └─────────────┘    │  └─────────────┘   │  └─────────────┘  │
│         │            │        │           │        │        │
│         └────────────┴────────┴───────────┴────────┘        │
│                              │                                │
│                    ┌──────────┴──────────┐                   │
│                    │   流复制（Streaming）│                   │
│                    │   同步/异步复制      │                   │
│                    └─────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 存储引擎

**行存引擎**：
- 默认存储方式
- 适合 OLTP 场景
- 频繁更新、删除操作
- 高并发事务处理

**列存引擎**：
- 适合 OLAP 场景
- 分析查询、报表统计
- 压缩比高、查询快
- 支持批量导入

### 三权分立安全架构

```mermaid
graph LR
    A[系统管理员] -->|系统管理| B[数据库]
    C[安全管理员] -->|安全策略| B
    D[审计管理员] -->|审计管理| B

    A -.->|不能| C
    A -.->|不能| D
    C -.->|不能| D
```

**三种角色**：
- **系统管理员**：数据库日常运维
- **安全管理员**：安全策略配置
- **审计管理员**：审计日志管理

---

## 部署与安装

### Docker 快速部署

```bash
# 拉取镜像
docker pull kingbase/kingbase:v008r006c005b0023p

# 启动容器
docker run -d \
  --name kingbase \
  -p 54321:54321 \
  -e DB_USER=system \
  -e DB_PASSWORD=yourpassword \
  -e DB_NAME=testdb \
  -v /data/kingbase:/opt/kingbase/data \
  kingbase/kingbase:v008r006c005b0023p

# 查看日志
docker logs -f kingbase

# 等待启动完成（约3-5分钟）
```

### 连接 KingbaseES

```bash
# 使用 ksql（KingbaseES 客户端）
docker exec -it kingbase ksql -U system -d testdb

# 或使用 PostgreSQL 客户端（兼容）
psql -h127.0.0.1 -p54321 -U system -d testdb

# 或使用 JDBC
jdbc:kingbase8://localhost:54321/testdb
```

### 基本配置

```sql
-- 1. 创建数据库
CREATE DATABASE mydb ENCODING 'UTF8';

-- 2. 创建用户
CREATE USER alice WITH PASSWORD 'password';

-- 3. 授权
GRANT ALL PRIVILEGES ON DATABASE mydb TO alice;

-- 4. 创建表空间
CREATE TABLESPACE tbs_data
    LOCATION '/data/kingbase/tbs_data';

-- 5. 查看数据库列表
\l

-- 6. 查看表空间
\db
```

---

## 兼容性特性

### Oracle 兼容模式

**PL/SQL 支持**：

```sql
-- 创建序列
CREATE SEQUENCE seq_user_id
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- 创建存储过程
CREATE OR REPLACE PROCEDURE add_user(
    p_username IN VARCHAR2,
    p_email IN VARCHAR2
) AS
BEGIN
    INSERT INTO users (user_id, username, email, create_time)
    VALUES (seq_user_id.NEXTVAL, p_username, p_email, SYSDATE);

    COMMIT;

    DBMS_OUTPUT.PUT_LINE('用户已添加，ID: ' || seq_user_id.CURRVAL);
END;
/

-- 调用存储过程
CALL add_user('alice', 'alice@example.com');

-- 创建触发器
CREATE OR REPLACE TRIGGER trg_update_time
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    :NEW.update_time := SYSDATE;
END;
/

-- 游标使用
DECLARE
    CURSOR c_users IS
        SELECT user_id, username FROM users WHERE status = 1;

    v_user_id NUMBER;
    v_username VARCHAR2(50);
BEGIN
    OPEN c_users;

    LOOP
        FETCH c_users INTO v_user_id, v_username;
        EXIT WHEN c_users%NOTFOUND;

        DBMS_OUTPUT.PUT_LINE('用户ID: ' || v_user_id || ', 用户名: ' || v_username);
    END LOOP;

    CLOSE c_users;
END;
/
```

**数据类型映射**：

| Oracle | KingbaseES | 说明 |
|--------|------------|------|
| NUMBER(p,s) | NUMERIC(p,s) | 精确数值 |
| VARCHAR2(n) | VARCHAR(n) | 可变字符串 |
| CLOB | TEXT | 大文本 |
| BLOB | BYTEA | 二进制大对象 |
| DATE | TIMESTAMP | 日期时间 |
| TIMESTAMP | TIMESTAMP | 时间戳 |
| RAW(n) | BYTEA | 二进制数据 |

### PostgreSQL 兼容模式

```sql
-- 数组类型
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(100),
    tags TEXT[],  -- 文本数组
    categories INTEGER[]  -- 整数数组
);

-- 插入数组数据
INSERT INTO products (product_name, tags, categories)
VALUES ('iPhone 15 Pro', ARRAY['手机', '苹果'], ARRAY[1, 2, 3]);

-- 查询数组
SELECT * FROM products WHERE '手机' = ANY(tags);

-- JSONB 类型
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 创建 JSONB 索引
CREATE INDEX idx_events_data ON events USING GIN (event_data);

-- JSONB 查询
SELECT * FROM events
WHERE event_data @> '{"user": {"id": 123}}';
```

---

## 高级特性

### 行列混合存储

```sql
-- 创建行存表（OLTP）
CREATE TABLE orders_row (
    order_id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT,
    amount NUMERIC(10,2),
    status SMALLINT,
    create_time TIMESTAMP DEFAULT NOW()
) WITH (ORIENTATION = ROW);

-- 创建列存表（OLAP）
CREATE TABLE orders_col (
    order_id BIGINT,
    user_id BIGINT,
    product_id BIGINT,
    amount NUMERIC(10,2),
    status SMALLINT,
    create_time TIMESTAMP
) WITH (ORIENTATION = COLUMN);

-- 创建压缩列存表
CREATE TABLE orders_col_compressed (
    order_id BIGINT,
    user_id BIGINT,
    amount NUMERIC(10,2),
    create_time TIMESTAMP
) WITH (
    ORIENTATION = COLUMN,
    COMPRESSION = YES  -- 启用压缩
);

-- 数据分析查询（列存优势）
SELECT
    user_id,
    COUNT(*) as order_count,
    SUM(amount) as total_amount
FROM orders_col
WHERE create_time >= '2024-01-01'
GROUP BY user_id;
```

### 物化视图

```sql
-- 创建物化视图
CREATE MATERIALIZED VIEW mv_user_daily_stats
REFRESH FAST ON COMMIT
AS
SELECT
    user_id,
    DATE(create_time) as order_date,
    COUNT(*) as order_count,
    SUM(amount) as total_amount
FROM orders_row
GROUP BY user_id, DATE(create_time);

-- 查询物化视图
SELECT * FROM mv_user_daily_stats
WHERE user_id = 123 AND order_date = '2024-01-15';

-- 手动刷新
REFRESH MATERIALIZED VIEW mv_user_daily_stats;

-- 删除物化视图
DROP MATERIALIZED VIEW mv_user_daily_stats;
```

### 分区表

```sql
-- Range 分区（按时间）
CREATE TABLE orders_partitioned (
    order_id BIGINT,
    user_id BIGINT,
    order_time TIMESTAMP,
    amount NUMERIC(10,2),
    PRIMARY KEY (order_id, order_time)
)
PARTITION BY RANGE (order_time)
(
    PARTITION p202401 VALUES LESS THAN ('2024-02-01'),
    PARTITION p202402 VALUES LESS THAN ('2024-03-01'),
    PARTITION p202403 VALUES LESS THAN ('2024-04-01'),
    PARTITION pmax VALUES LESS THAN (MAXVALUE)
);

-- List 分区
CREATE TABLE orders_list (
    order_id BIGINT,
    user_id BIGINT,
    status SMALLINT,
    PRIMARY KEY (order_id, status)
)
PARTITION BY LIST (status)
(
    PARTITION p_pending VALUES (0),
    PARTITION p_paid VALUES (1),
    PARTITION p_shipped VALUES (2),
    PARTITION p_completed VALUES (3),
    PARTITION p_cancelled VALUES (4)
);

-- Hash 分区
CREATE TABLE users_hash (
    user_id BIGINT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100)
)
PARTITION BY HASH (user_id)
(
    PARTITION p0,
    PARTITION p1,
    PARTITION p2,
    PARTITION p3
);

-- 查看分区
SELECT
    partitionname,
    partitiontype
FROM pg_partitions
WHERE tablename = 'orders_partitioned';
```

---

## 迁移实战

### 从 Oracle 迁移到 KingbaseES

#### 使用 KDTS（Kingbase Database Transfer System）

**1. 评估兼容性**：

```bash
# KDTS 评估工具
kdts assess \
    --source oracle://user:pass@host:1521/orcl \
    --report compatibility_report.html
```

**2. 数据结构迁移**：

```bash
# 导出 Oracle DDL
kdts ddl \
    --source oracle://user:pass@host:1521/orcl \
    --output oracle_schema.sql \
    --schema myschema

# 转换 DDL
kdts convert \
    --input oracle_schema.sql \
    --output kingbase_schema.sql \
    --target kingbase

# 执行 DDL
ksql -U system -d testdb -f kingbase_schema.sql
```

**3. 数据迁移**：

```bash
# 全量数据迁移
kdts data \
    --source oracle://user:pass@host:1521/orcl \
    --target kingbase://system:pass@host:54321/testdb \
    --tables users,orders,order_items \
    --parallel 8 \
    --batch-size 10000

# 增量同步（基于 Oracle CDC）
kdts sync \
    --source oracle://user:pass@host:1521/orcl \
    --target kingbase://system:pass@host:54321/testdb \
    --mode incremental \
    --scn 1234567890
```

**4. 数据验证**：

```sql
-- 对比行数
SELECT COUNT(*) FROM users;

-- 抽样验证
SELECT * FROM users ORDER BY user_id FETCH FIRST 10 ROWS ONLY;

-- 校验和
SELECT
    user_id,
    SUM(amount) as total
FROM orders
GROUP BY user_id
ORDER BY total DESC
LIMIT 100;
```

### 典型迁移案例

#### 案例1：政务系统 Oracle → KingbaseES

**迁移前准备**：
```sql
-- 1. 在 KingbaseES 创建对应 schema
CREATE SCHEMA auth;

-- 2. 创建用户
CREATE USER auth_user WITH PASSWORD 'password';
GRANT ALL ON SCHEMA auth TO auth_user;

-- 3. 配置 Oracle 兼容模式
ALTER DATABASE testdb SET compatible_mode TO 'oracle';
```

**数据类型转换**：

| Oracle 原类型 | KingbaseES 目标类型 | 转换规则 |
|--------------|-------------------|---------|
| NUMBER(10) | INTEGER | 精度小于10 |
| NUMBER(15,2) | NUMERIC(15,2) | 带小数 |
| VARCHAR2(100) | VARCHAR(100) | 字符串 |
| CLOB | TEXT | 大文本 |
| DATE | TIMESTAMP | 日期时间 |
| TIMESTAMP(6) | TIMESTAMP(6) | 时间戳 |

**SQL 语法调整**：

```sql
-- Oracle
SELECT * FROM users WHERE ROWNUM <= 10;

-- KingbaseES
SELECT * FROM users LIMIT 10;

-- Oracle
SELECT SYSDATE FROM DUAL;

-- KingbaseES
SELECT CURRENT_TIMESTAMP;

-- Oracle
CREATE TABLE users (
    user_id NUMBER PRIMARY KEY,
    username VARCHAR2(50)
);

-- KingbaseES（Oracle 兼容模式）
CREATE TABLE users (
    user_id NUMBER PRIMARY KEY,
    username VARCHAR2(50)  -- 仍然支持 VARCHAR2
);
```

### 性能优化

```sql
-- 1. 更新统计信息
ANALYZE TABLE users;

-- 2. 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status_time ON users(status, create_time);

-- 3. 并行查询
SET max_parallel_workers_per_gather = 4;

SELECT /*+ PARALLEL(4) */
    user_id, COUNT(*), SUM(amount)
FROM orders
GROUP BY user_id;

-- 4. 配置参数
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET work_mem = '256MB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- 5. 查看执行计划
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 123;
```

---

## ✅ 本章小结

### 学习检查清单

完成本章学习后，请确认你能够：

- [ ] 理解人大金仓 KingbaseES 的核心特性和应用场景
- [ ] 使用 Docker 部署 KingbaseES
- [ ] 在 Oracle/PostgreSQL 兼容模式下编写 SQL
- [ ] 使用行列混合存储优化性能
- [ ] 创建分区表和物化视图
- [ ] 从 Oracle 迁移到 KingbaseES
- [ ] 进行基本的性能优化

### 核心要点回顾

1. **高安全性**：等保四级、三权分立、国密算法
2. **高兼容性**：Oracle 和 PostgreSQL 双模式
3. **高性能**：行列混合存储、并行计算
4. **高可靠**：主备复制、读写分离、异地容灾
5. **平滑迁移**：完善的迁移工具链

## 📚 延伸阅读

- [第14章：国产分布式数据库 - OceanBase →](./chapter-13)
- [第15章：国产分布式数据库 - TiDB →](./chapter-14)
- [第17章：openGauss 与 GaussDB →](./chapter-16)
- [人大金仓官网](https://www.kingbase.com.cn/)

---

**更新时间**：2026年2月 | **版本**：v1.0
