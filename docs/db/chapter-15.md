---
title: 第15章：国产分布式数据库 - OceanBase
---

# ：国产分布式数据库 - OceanBase

> **难度等级**：⭐⭐ 进阶 | **学习时长**：6小时 | **实战项目**：金融系统迁移

## 📚 本章目录

- [15.1 OceanBase 概述](#131-oceanbase-概述)
- [15.2 核心架构](#132-核心架构)
- [15.3 部署与安装](#133-部署与安装)
- [15.4 SQL 兼容性](#134-sql-兼容性)
- [15.5 高级特性](#135-高级特性)
- [15.6 性能优化](#136-性能优化)
- [15.7 迁移实战](#137-迁移实战)

---

## OceanBase 概述

### 什么是 OceanBase？

OceanBase 是**蚂蚁集团自研的分布式关系数据库**，具有以下特点：

```mermaid
graph TB
    A[OceanBase] --> B[金融级高可用]
    A --> C[极致高性能]
    A --> D[低成本存储]
    A --> E[高度兼容]

    B --> B1[RPO=0]
    B --> B2[RTO<30秒]
    B --> B3[多地多活]

    C --> C1[千万级TPMC]
    C --> C2[百万级QPS]
    C --> C3[PB级数据]

    D --> D1[编码压缩]
    D --> D2[分层存储]
    D --> D3[降本50%+]

    E --> E1[Oracle兼容]
    E --> E2[MySQL兼容]
    E --> E3[平滑迁移]
```

### 发展历程

| 时间 | 里程碑 |
|-----|-------|
| **2010年** | 蚂蚁集团启动 OceanBase 研发 |
| **2014年** | 支撑支付宝"双11"交易峰值 |
| **2016年** | 替代 Oracle，支撑蚂蚁全部核心业务 |
| **2017年** | 开源，成立开源社区 |
| **2019年** | 通过 TPC-C 测试，打破世界纪录 |
| **2021年** | OceanBase 3.0 发布，支持 HTAP |
| **2023年** | OceanBase 4.0 发布，单机分布式一体化 |
| **2024年** | OceanBase 4.2 发布，性能再提升 |

### 应用场景

**金融行业**：
- 工商银行、建设银行、招商银行
- 南京银行、微众银行、网商银行
- 支付宝、网商支付

**政务**：
- 浙江、江苏、广东等政务云
- 税务、社保、公积金系统

**电信**：
- 中国移动、中国联通
- BOSS 系统、计费系统

**能源交通**：
- 国家电网、南方电网
- 航空、铁路、高速公路

---

## 核心架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      OceanBase 集群                          │
├─────────────────────────────────────────────────────────────┤
│  Zone 1       │  Zone 2       │  Zone 3       │  Zone N     │
│  ┌─────────┐  │  ┌─────────┐  │  ┌─────────┐  │  ┌─────────┐│
│  │OBServer │  │  │OBServer │  │  │OBServer │  │  │OBServer ││
│  │ 1..N    │  │  │ 1..N    │  │  │ 1..N    │  │  │ 1..N    ││
│  └─────────┘  │  └─────────┘  │  └─────────┘  │  └─────────┘│
│       │       │       │       │       │       │       │     │
│       └───────┴───────┴───────┴───────┴───────┴───────┘     │
│                        │                                    │
│                 ┌──────┴──────┐                             │
│                 │  Paxos 协议  │                             │
│                 │  多数派选举  │                             │
│                 └─────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件

#### 1. OBServer（ observer）

**功能**：数据库实例，负责数据存储和查询处理

**启动参数**：
```bash
observer -r '127.0.0.1:2882:2881' -p 2881 -P 2882 -z zone1 -c 1 \
  -d /data/ob \
  -i eth0 -o "memory_limit=8G,cpu_count=4"
```

**关键参数**：
- `-r`：RPC 端口（选举端口:SQL 端口）
- `-p`：SQL 服务端口
- `-P`：RPC 服务端口
- `-z`：Zone 名称
- `-c`：集群 ID
- `-d`：数据目录
- `memory_limit`：内存限制
- `cpu_count`：CPU 核心数

#### 2. Paxos 分布式共识

**三副本机制**：
```mermaid
graph LR
    A[Leader] -->|日志复制| B[Follower]
    A -->|日志复制| C[Follower]
    B -->|心跳| A
    C -->|心跳| A
    B -.->|日志同步| C
    C -.->|日志同步| B

    style A fill:#90EE90
    style B fill:#87CEEB
    style C fill:#87CEEB
```

**多数派原则**：
- 3 副本：2 个可用即可提供服务
- 5 副本：3 个可用即可提供服务
- 保证 RPO=0（数据零丢失）

#### 3. 多层存储引擎

```
┌─────────────────────────────────────────┐
│           SQL 查询请求                    │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│       MemTable（内存表）                  │
│  - 增量数据（写入、更新）                 │
│  - 读写速度快                            │
│  - 内存限制，需要冻结                     │
└─────────────┬───────────────────────────┘
              │ 冻结（Frozen）
              ▼
┌─────────────────────────────────────────┐
│     Minor SSTable（小版本）               │
│  - 冻结的 MemTable                       │
│  - 多个合并成 Major SSTable              │
└─────────────┬───────────────────────────┘
              │ 合并（Compaction）
              ▼
┌─────────────────────────────────────────┐
│     Major SSTable（大版本）               │
│  - 静态数据，只读                         │
│  - 存储在磁盘                            │
│  - 支持编码压缩                           │
└─────────────────────────────────────────┘
```

**LSM-Tree 特点**：
- 写优化：写入直接进入内存，写入速度快
- 读优化：可能需要查询多层，Bloom Filter 加速
- 后台合并：自动进行，无需人工干预
- 编码压缩：存储成本降低 50%+

---

## 部署与安装

### Docker 部署（单机模式）

```bash
# 拉取镜像
docker pull oceanbase/oceanbase-ce:4.2

# 启动容器
docker run -d \
  --name oceanbase \
  -p 2881:2881 -p 2882:2882 \
  -e MODE=mini \
  -e OB_CLUSTER_NAME=obcluster \
  -e OB_TENANT_NAME=mytenant \
  -e OB_MEMORY_LIMIT=8G \
  -e OB_DATAFILE_SIZE=10G \
  -v /data/oceanbase:/root/ob \
  oceanbase/oceanbase-ce:4.2

# 查看日志
docker logs -f oceanbase

# 等待启动完成（约2-3分钟）
# 看到 "boot success!" 表示启动成功
```

### 连接 OceanBase

```bash
# 方式1：使用 MySQL 客户端
mysql -h127.0.0.1 -P2881 -uroot@sys -p#Aa000000

# 方式2：进入容器
docker exec -it oceanbase obclient -h127.0.0.1 -P2881 -uroot@sys

# 方式3：使用 obclient
obclient -h127.0.0.1 -P2881 -uroot@sys -p#Aa000000
```

### 创建租户

```sql
-- 连接到 sys 租户
mysql -h127.0.0.1 -P2881 -uroot@sys

-- 1. 创建资源池
CREATE RESOURCE UNIT unit_4c16g
    MEMORY_SIZE = '16G',
    MIN_CPU = 4,
    MAX_CPU = 4;

-- 2. 创建资源池
CREATE RESOURCE POOL pool_mysql
    UNIT = 'unit_4c16g',
    UNIT_NUM = 1,
    ZONE_LIST = ('zone1', 'zone2', 'zone3');

-- 3. 创建 MySQL 租户
CREATE TENANT tenant_mysql
    RESOURCE_POOL_LIST = ('pool_mysql'),
    SET ob_tcp_invited_nodes = '%',
    SET ob_compatibility_mode = 'MYSQL';

-- 4. 查看租户
SELECT * FROM oceanbase.DBA_OB_TENANTS;

-- 5. 连接到新租户
mysql -h127.0.0.1 -P2881 -uroot@tenant_mysql -p
```

### ODP（OceanBase Database Proxy）部署

ODP 是 OceanBase 的代理服务，提供 SQL 路由、负载均衡。

```bash
# 拉取镜像
docker pull oceanbase/obproxy-ce:4.2

# 启动 ODP
docker run -d \
  --name obproxy \
  -p 2883:2883 \
  -e RS_LIST="127.0.0.1:2881:2882" \
  oceanbase/obproxy-ce:4.2

# 通过 ODP 连接
mysql -h127.0.0.1 -P2883 -uroot@tenant_mysql -p
```

---

## SQL 兼容性

### MySQL 兼容模式

```sql
-- 创建数据库
CREATE DATABASE testdb;

USE testdb;

-- 创建表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入数据
INSERT INTO users (username, email) VALUES
('alice', 'alice@example.com'),
('bob', 'bob@example.com');

-- 查询
SELECT * FROM users WHERE username = 'alice';

-- 更新
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;

-- 删除
DELETE FROM users WHERE id = 1;
```

### Oracle 兼容模式

```sql
-- 创建 Oracle 租户
CREATE TENANT tenant_oracle
    RESOURCE_POOL_LIST = ('pool_oracle'),
    SET ob_tcp_invited_nodes = '%',
    SET ob_compatibility_mode = 'ORACLE';

-- 连接到 Oracle 租户
-- 注意：Oracle 租户需要使用 sys 租户的密码登录
sqlplus sys/password@127.0.0.1:2881:tenant_oracle as sysdba

-- 创建表空间
CREATE TABLESPACE tbs_data
    DATAFILE 'tbs_data.dbf'
    SIZE 100M AUTOEXTEND ON;

-- 创建用户
CREATE USER alice IDENTIFIED BY password
    DEFAULT TABLESPACE tbs_data;

GRANT CONNECT, RESOURCE TO alice;

-- 创建表
CREATE TABLE users (
    id NUMBER(10) PRIMARY KEY,
    username VARCHAR2(50) NOT NULL,
    email VARCHAR2(100),
    created_at DATE DEFAULT SYSDATE
);

-- 创建序列
CREATE SEQUENCE seq_users
    START WITH 1
    INCREMENT BY 1;

-- 插入数据
INSERT INTO users (id, username, email)
VALUES (seq_users.NEXTVAL, 'alice', 'alice@example.com');

-- 提交
COMMIT;

-- PL/SQL 支持
CREATE OR REPLACE PROCEDURE add_user(
    p_username IN VARCHAR2,
    p_email IN VARCHAR2
) AS
BEGIN
    INSERT INTO users (id, username, email)
    VALUES (seq_users.NEXTVAL, p_username, p_email);
    COMMIT;
END;
/
```

### 兼容性对比

| 特性 | MySQL | Oracle | OceanBase 兼容 |
|-----|-------|--------|--------------|
| 数据类型 | ✅ | ✅ | ✅ |
| 存储过程 | ⚠️ | ✅ | ✅ MySQL/Oracle 模式 |
| 触发器 | ✅ | ✅ | ✅ |
| 视图 | ✅ | ✅ | ✅ |
| 窗口函数 | ✅ | ✅ | ✅ |
| CTE | ✅ | ✅ | ✅ |
| JSON | ✅ | ⚠️ | ✅ |
| 序列 | ⚠️ | ✅ | ✅ |
| 同义词 | ❌ | ✅ | ✅ |
| 数据库链接 | ⚠️ | ✅ | ✅ |

---

## 高级特性

### 分区表

```sql
-- Range 分区（按时间）
CREATE TABLE orders (
    order_id BIGINT,
    user_id BIGINT,
    order_time DATETIME,
    amount DECIMAL(10,2),
    PRIMARY KEY (order_id, order_time)
) PARTITION BY RANGE (TO_DAYS(order_time))
(
    PARTITION p202401 VALUES LESS THAN (TO_DAYS('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (TO_DAYS('2024-03-01')),
    PARTITION p202403 VALUES LESS THAN (TO_DAYS('2024-04-01')),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- Hash 分区（按 ID）
CREATE TABLE users (
    user_id BIGINT,
    username VARCHAR(50),
    PRIMARY KEY (user_id)
) PARTITION BY HASH(user_id)
PARTITIONS 128;

-- 查看分区
SELECT * FROM information_schema.PARTITIONS
WHERE TABLE_NAME = 'orders';

-- 添加分区
ALTER TABLE orders ADD PARTITION (
    PARTITION p202405 VALUES LESS THAN (TO_DAYS('2024-06-01'))
);
```

### 全局索引

```sql
-- 局部索引（默认）
CREATE INDEX idx_user_id ON orders(user_id);

-- 全局索引（支持跨分区查询）
CREATE UNIQUE GLOBAL INDEX idx_global_user_orders
ON orders(user_id, order_id)
PARTITION BY HASH(user_id) PARTITIONS 64;
```

### 物化视图

```sql
-- 创建物化视图
CREATE MATERIALIZED VIEW mv_daily_sales
BUILD IMMEDIATE
REFRESH FAST ON COMMIT
AS
SELECT
    DATE(order_time) as order_date,
    COUNT(*) as order_count,
    SUM(amount) as total_amount
FROM orders
GROUP BY DATE(order_time);

-- 查询物化视图
SELECT * FROM mv_daily_sales
WHERE order_date = '2024-01-15';

-- 刷新物化视图
ALTER MATERIALIZED VIEW mv_daily_sales REFRESH;
```

---

## 性能优化

### 执行计划分析

```sql
-- 查看执行计划
EXPLAIN EXTENDED
SELECT * FROM orders WHERE user_id = 123;

-- 查看详细执行计划
EXPLAIN EXTENDED
SELECT * FROM orders WHERE user_id = 123 AND order_time > '2024-01-01';

-- 查看表统计信息
SELECT * FROM oceanbase.DBA_OB_TABLE_STATISTICS
WHERE TABLE_NAME = 'orders';

-- 更新统计信息
ANALYZE TABLE orders COMPUTE STATISTICS;
```

### SQL 优化建议

```sql
-- 1. 使用覆盖索引
-- 创建索引
CREATE INDEX idx_cover ON orders(user_id, order_time, amount);

-- 查询只访问索引，无需回表
SELECT user_id, order_time, amount
FROM orders
WHERE user_id = 123;

-- 2. 分区裁剪
-- 查询自动裁剪无关分区
SELECT * FROM orders
WHERE order_time BETWEEN '2024-01-15' AND '2024-01-20';

-- 3. 批量插入优化
-- 使用 LOAD DATA
LOAD DATA INFILE '/data/orders.csv'
INTO TABLE orders
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- 4. 批量删除优化
-- 按分区删除
ALTER TABLE orders DROP PARTITION p202401;
```

### 参数调优

```sql
-- 查看当前参数
SHOW PARAMETERS LIKE 'memory_limit%';

-- 修改内存限制
ALTER SYSTEM SET memory_limit = '16G';

-- 修改 CPU 限制
ALTER SYSTEM SET cpu_count = 8;

-- 修改并行度
ALTER SYSTEM SET parallel_max_servers = 128;

-- 查看租户资源限制
SELECT * FROM oceanbase.DBA_OB_RESOURCE_POOLS;
```

---

## 迁移实战

### 从 MySQL 迁移到 OceanBase

#### 使用 OMS（OceanBase Migration Service）

**1. 评估兼容性**：

```bash
# 使用 OMS 评估工具
oms_client assess \
    --source mysql://user:pass@host:3306/db \
    --report compatibility_report.html
```

**2. 全量迁移**：

```bash
oms_client migrate \
    --source mysql://user:pass@host:3306/db \
    --target oceanbase://user:pass@host:2881/tenant \
    --mode full \
    --parallel 8 \
    --tables users,orders,order_items
```

**3. 增量同步**：

```bash
oms_client sync \
    --source mysql://user:pass@host:3306/db \
    --target oceanbase://user:pass@host:2881/tenant \
    --mode incremental \
    --position binlog.000123:456789
```

#### 使用 DataX

```json
{
  "job": {
    "content": [
      {
        "reader": {
          "name": "mysqlreader",
          "parameter": {
            "connection": [
              {
                "jdbcUrl": ["jdbc:mysql://localhost:3306/testdb"],
                "querySql": ["SELECT * FROM users"]
              }
            ],
            "username": "root",
            "password": "password"
          }
        },
        "writer": {
          "name": "oceanbasev10writer",
          "parameter": {
            "writeMode": "insert",
            "column": ["id", "username", "email"],
            "connection": [
              {
                "jdbcUrl": "jdbc:oceanbase://localhost:2881/testdb",
                "table": ["users"]
              }
            ],
            "username": "root@tenant_mysql",
            "password": "password"
          }
        }
      }
    ],
    "setting": {
      "speed": {
        "channel": 4
      }
    }
  }
}
```

### 从 Oracle 迁移到 OceanBase

#### 数据类型映射

| Oracle | OceanBase |
|--------|-----------|
| NUMBER(p,s) | DECIMAL(p,s) |
| VARCHAR2(n) | VARCHAR(n) |
| CLOB | CLOB |
| BLOB | BLOB |
| DATE | DATETIME |
| TIMESTAMP | TIMESTAMP |
| RAW(n) | VARBINARY(n) |

#### 迁移步骤

```sql
-- 1. 导出 Oracle DDL
expdp system/password DIRECTORY=data_pump_dir \
    DUMPFILE=oracle_export.dmp \
    SCHEMAS=myschema

-- 2. 转换 DDL（工具）
java -jar ob-oracle-converter.jar \
    --input oracle_export.dmp \
    --output oceanbase_ddl.sql

-- 3. 手工调整 DDL
-- - 修改序列语法
-- - 修改触发器语法
-- - 修改 PL/SQL 代码

-- 4. 导入 OceanBase
source oceanbase_ddl.sql;

-- 5. 导入数据
sqlldr userid=system/password@ob_host:2881/tenant \
    control=load_data.ctl \
    log=load_data.log \
    direct=true

-- 6. 验证数据
SELECT COUNT(*) FROM users;
SELECT * FROM users WHERE ROWNUM <= 10;
```

---

## ✅ 本章小结

### 学习检查清单

完成本章学习后，请确认你能够：

- [ ] 理解 OceanBase 的核心架构和特性
- [ ] 使用 Docker 部署 OceanBase 单机环境
- [ ] 创建和管理租户
- [ ] 在 MySQL/Oracle 兼容模式下编写 SQL
- [ ] 创建分区表和全局索引
- [ ] 进行基本的性能优化
- [ ] 从 MySQL/Oracle 迁移数据到 OceanBase

### 核心要点回顾

1. **金融级高可用**：Paxos 协议、三副本、RPO=0
2. **多层存储**：MemTable + SSTable，LSM-Tree 结构
3. **高度兼容**：MySQL 和 Oracle 双模式
4. **低成本**：编码压缩，存储成本降低 50%+
5. **平滑迁移**：完善的迁移工具链

## 📚 延伸阅读

- [第16章：国产分布式数据库 - TiDB →](./chapter-15)
- [第17章：达梦数据库实战 →](./chapter-16)
- [OceanBase 官方文档](https://www.oceanbase.com/docs)
- [OceanBase 开源社区](https://open.oceanbase.com/)

---

**更新时间**：2026年2月 | **版本**：v1.0
