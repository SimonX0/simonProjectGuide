---
title: 第1章：数据库简介与环境搭建
---

# ：数据库简介与环境搭建

> **难度等级**：🔰 入门 | **学习时长**：2小时 | **实战项目**：无

## 📚 本章目录

- [1.1 数据库基础概念](#11-数据库基础概念)
- [1.2 数据库分类](#12-数据库分类)
- [1.3 2024-2026 数据库技术趋势](#13-2024-2026-数据库技术趋势)
- [1.4 环境搭建](#14-环境搭建)
- [1.5 数据库选型指南](#15-数据库选型指南)

---

## 数据库基础概念

### 什么是数据库？

数据库（Database）是**按照数据结构来组织、存储和管理数据的仓库**。

**核心概念**：

```
数据库管理系统 (DBMS)
├─ 数据定义语言 (DDL)：CREATE、ALTER、DROP
├─ 数据操作语言 (DML)：INSERT、UPDATE、DELETE、SELECT
├─ 数据控制语言 (DCL)：GRANT、REVOKE
└─ 事务控制语言 (TCL)：COMMIT、ROLLBACK
```

**数据库 vs 文件系统**：

| 特性 | 数据库 | 文件系统 |
|-----|-------|---------|
| 数据结构 | 结构化，支持关系 | 半结构化或非结构化 |
| 查询效率 | 索引优化，快速查询 | 需全表扫描 |
| 并发控制 | 锁机制，事务隔离 | 需自行实现 |
| 数据一致性 | ACID 保证 | 需自行保证 |
| 扩展性 | 垂直/水平扩展 | 难以扩展 |
| 备份恢复 | 完善机制 | 需自行实现 |

---

## 数据库分类

### 按数据模型分类

```mermaid
mindmap
  root((数据库))
    关系型数据库
      MySQL
      PostgreSQL
      Oracle
      SQL Server
    NoSQL
      文档型
        MongoDB
        CouchDB
      键值型
        Redis
        Memcached
      列族型
        Cassandra
        HBase
      图数据库
        Neo4j
        ArangoDB
    NewSQL
      TiDB
      CockroachDB
      OceanBase
    时序数据库
      InfluxDB
      TDengine
    向量数据库
      Milvus
      Pinecone
```

### 按部署架构分类

| 类型 | 特点 | 代表产品 |
|-----|------|---------|
| **单机数据库** | 部署简单，性能受限 | SQLite、MySQL 单机 |
| **主从复制** | 读写分离，高可用 | MySQL Replication |
| **分布式数据库** | 水平扩展，强一致 | TiDB、OceanBase |
| **云原生数据库** | 弹性伸缩，按需付费 | Amazon RDS、阿里云 RDS |

---

## 2024-2026 数据库技术趋势

### 🚀 国产数据库崛起

**政策驱动**：
- 信创政策要求金融、政府、央企使用国产软件
- 国产数据库在关键领域替代 Oracle、SQL Server

**代表产品**：
- **OceanBase**：蚂蚁集团，金融级高可用
- **TiDB**：PingCAP，HTAP 混合负载
- **达梦 DM**：武汉达梦，Oracle 兼容
- **openGauss**：华为开源，AI 调优
- **GaussDB**：华为云，云原生分布式
- **TDSQL**：腾讯云，多地多活

### 🤖 向量数据库爆发

**AI 应用驱动**：
- RAG（检索增强生成）成为主流 AI 架构
- 多模态数据（文本、图像、视频）需要向量检索
- 推荐系统、以图搜图等场景需求激增

**代表产品**：
- **Milvus**：开源向量数据库，支持多种索引
- **Pinecone**：云原生向量数据库，托管服务
- **pgvector**：PostgreSQL 向量扩展
- **Weaviate**：开源向量搜索引擎

### ⚡ HTAP 混合负载

**传统架构痛点**：
- OLTP（在线事务处理）和 OLAP（在线分析处理）分离
- 需要 ETL 同步数据，延迟高
- 维护两套系统，成本高

**HTAP 方案**：
- **TiDB**：一套引擎同时服务 TP 和 AP 查询
- **OceanBase**：列存副本，智能路由
- **实时分析**：无需 ETL，数据实时可见

### 🌱 云原生与 Serverless

**趋势**：
- 数据库上云成为标准选择
- Serverless 数据库按需计费
- 自动扩缩容，无需运维

**代表产品**：
- Amazon Aurora Serverless
- Azure SQL Database Serverless
- 阿里云 PolarDB Serverless

---

## 环境搭建

### Docker 快速部署

**安装 Docker**：
```bash
# Windows/Mac
# 下载 Docker Desktop：https://www.docker.com/products/docker-desktop

# Linux
curl -fsSL https://get.docker.com | sh
sudo systemctl start docker
sudo systemctl enable docker
```

#### MySQL 8.0 部署

```bash
# 拉取镜像
docker pull mysql:8.0

# 启动容器
docker run -d \
  --name mysql8 \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=yourpassword \
  -e MYSQL_DATABASE=testdb \
  -v /data/mysql:/var/lib/mysql \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci

# 连接测试
docker exec -it mysql8 mysql -uroot -p

# 或使用 MySQL 客户端
mysql -h127.0.0.1 -P3306 -uroot -p
```

#### PostgreSQL 16 部署

```bash
# 拉取镜像
docker pull postgres:16

# 启动容器
docker run -d \
  --name postgres16 \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=testdb \
  -v /data/postgres:/var/lib/postgresql/data \
  postgres:16

# 连接测试
docker exec -it postgres16 psql -U postgres -d testdb

# 或使用 psql 客户端
psql -h127.0.0.1 -p5432 -Upostgres -d testdb
```

#### Redis 7.x 部署

```bash
# 拉取镜像
docker pull redis:7

# 启动容器
docker run -d \
  --name redis7 \
  -p 6379:6379 \
  -v /data/redis:/data \
  redis:7 \
  --requirepass yourpassword

# 连接测试
docker exec -it redis7 redis-cli -a yourpassword

# 或使用 redis-cli
redis-cli -h127.0.0.1 -p6379 -a yourpassword
```

#### OceanBase 部署

```bash
# 拉取镜像
docker pull oceanbase/oceanbase-ce:4.2

# 启动容器（单机模式）
docker run -d \
  --name oceanbase \
  -p 2881:2881 -p 2882:2882 \
  -e MODE=mini \
  -e OB_CLUSTER_NAME=obcluster \
  -e OB_TENANT_NAME=mytenant \
  -e OB_MEMORY_LIMIT=8G \
  oceanbase/oceanbase-ce:4.2

# 连接测试（兼容 MySQL 协议）
mysql -h127.0.0.1 -P2881 -uroot@sys
```

#### MongoDB 7.x 部署

```bash
# 拉取镜像
docker pull mongo:7

# 启动容器
docker run -d \
  --name mongodb7 \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=yourpassword \
  -v /data/mongodb:/data/db \
  mongo:7

# 连接测试
docker exec -it mongodb7 mongosh -u admin -p yourpassword

# 或使用 mongosh
mongosh "mongodb://admin:yourpassword@127.0.0.1:27017"
```

### Docker Compose 一键部署

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: mysql8
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: testdb
    volumes:
      - mysql_data:/var/lib/mysql

  postgres:
    image: postgres:16
    container_name: postgres16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: rootpassword
      POSTGRES_DB: testdb
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: redis7
    ports:
      - "6379:6379"
    command: redis-server --requirepass rootpassword
    volumes:
      - redis_data:/data

  mongo:
    image: mongo:7
    container_name: mongodb7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: rootpassword
    volumes:
      - mongo_data:/data/db

volumes:
  mysql_data:
  postgres_data:
  redis_data:
  mongo_data:
```

启动所有服务：

```bash
# 启动
docker-compose up -d

# 查看状态
docker-compose ps

# 停止
docker-compose down

# 查看日志
docker-compose logs -f mysql
```

### 开发工具安装

#### DataGrip（推荐）

**下载安装**：
- 官网：https://www.jetbrains.com/datagrip/
- 支持所有主流数据库
- 智能代码补全、SQL 格式化
- 数据可视化、ER 图

**连接配置**：

```properties
# MySQL 连接
Host: localhost
Port: 3306
User: root
Password: yourpassword
Database: testdb

# PostgreSQL 连接
Host: localhost
Port: 5432
User: postgres
Password: yourpassword
Database: testdb
```

#### DBeaver（免费开源）

**下载安装**：
- 官网：https://dbeaver.io/
- 免费开源，功能强大
- 支持几乎所有数据库

#### Navicat Premium（商业）

**特点**：
- 界面美观，操作简单
- 支持多种数据库
- 商业软件，需购买许可

---

## 数据库选型指南

### 决策树

```mermaid
graph TD
    A[业务需求] --> B{数据量}
    B -->|< 100GB| C[单机数据库]
    B -->|100GB-10TB| D[分布式数据库]
    B -->|> 10TB| E[大数据平台]

    C --> F{查询类型}
    F -->|OLTP| G[MySQL/PostgreSQL]
    F -->|OLAP| H[ClickHouse]

    D --> I{一致性要求}
    I -->|强一致| J[OceanBase/GaussDB]
    I -->|最终一致| K[TiDB/TDSQL]

    E --> L[数据湖/Hadoop]
```

### 选型对比表

| 场景 | 推荐数据库 | 备选方案 | 核心优势 |
|-----|-----------|---------|---------|
| **电商订单** | MySQL | TiDB/TDSQL | 成熟稳定、生态完善 |
| **金融核心** | OceanBase | GaussDB | 金融级高可用、强一致 |
| **社交网络** | PostgreSQL | MongoDB | 复杂查询能力强 |
| **物联网** | TDengine | InfluxDB | 压缩率高、写入快 |
| **日志分析** | ClickHouse | Elasticsearch | 列存、查询快 |
| **内容管理** | MongoDB | PostgreSQL | 灵活的文档模型 |
| **AI应用** | PostgreSQL + Milvus | Pinecone | 向量搜索能力 |
| **搜索引擎** | Elasticsearch | OpenSearch | 全文检索 |
| **缓存** | Redis | Memcached | 丰富的数据结构 |

### 成本对比

| 数据库 | 开源/商业 | 部署成本 | 运维成本 | 学习成本 |
|-------|----------|---------|---------|---------|
| **MySQL** | 开源（双协议） | 低 | 低 | 低 |
| **PostgreSQL** | 完全开源 | 低 | 低 | 中 |
| **Oracle** | 商业 | 高 | 高 | 高 |
| **OceanBase** | 开源社区版/企业版 | 中 | 中 | 中 |
| **TiDB** | 开源 | 中 | 高 | 高 |
| **达梦** | 商业（有免费版） | 中 | 中 | 中 |
| **MongoDB** | 开源（SSPL） | 低 | 中 | 低 |
| **Redis** | 开源（BSD） | 低 | 低 | 低 |

---

## ✅ 本章小结

### 学习检查清单

完成本章学习后，请确认你能够：

- [ ] 理解数据库的基本概念和分类
- [ ] 了解 2024-2026 数据库技术趋势
- [ ] 使用 Docker 部署 MySQL、PostgreSQL、Redis
- [ ] 配置数据库客户端工具（DataGrip/DBeaver）
- [ ] 根据业务场景选择合适的数据库

### 核心要点回顾

1. **数据库分类**：关系型、NoSQL、NewSQL、时序、向量
2. **2024-2026 趋势**：国产数据库、向量数据库、HTAP、云原生
3. **环境搭建**：Docker 是最便捷的部署方式
4. **选型原则**：根据数据量、一致性要求、查询类型选择

## 📚 延伸阅读

- [第2章：SQL 核心基础 →](./chapter-02)
- [MySQL 8.0 官方文档](https://dev.mysql.com/doc/refman/8.0/en/)
- [PostgreSQL 16 官方文档](https://www.postgresql.org/docs/16/)

---

**更新时间**：2026年2月 | **版本**：v1.0
