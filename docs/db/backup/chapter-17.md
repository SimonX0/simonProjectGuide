---
title: 第18章：openGauss 与 GaussDB
---

# ：openGauss 与 GaussDB

> **难度等级**：⭐⭐ 进阶 | **学习时长**：6小时 | **实战项目**：企业数据仓库

## 📚 本章目录

- [17.1 openGauss 概述](#171-opengauss-概述)
- [17.2 GaussDB 云数据库](#172-gaussdb-云数据库)
- [17.3 核心架构](#173-核心架构)
- [17.4 AI 能力](#174-ai-能力)
- [17.5 部署与实战](#175-部署与实战)

---

## openGauss 概述

**openGauss** 是**华为**开源的关系型数据库，具有以下特点：

- **高性能**：面向 TP 场景优化，支持百万级 tpmC
- **高可用**：支持主备、级联备，多地多活
- **高安全**：全密态、国密算法、三权分立
- **AI 调优**：自调优、索引推荐、异常检测

### 应用场景

- 政务大数据平台
- 金融数据仓库
- 电信 BOSS 系统
- 企业核心业务系统

---

## GaussDB 云数据库

**GaussDB** 是华为云企业级分布式数据库：

- **GaussDB for MySQL**：兼容 MySQL 协议
- **GaussDB for PostgreSQL**：兼容 PostgreSQL 协议
- **GaussDB for Redis**：兼容 Redis 协议
- **GaussDB for Cassandra**：兼容 Cassandra 协议

---

## 核心架构

### openGauss 架构

```
主节点（Primary）
├─ SQL 处理
├─ 事务管理
└─ WAL 日志
     │
     ├─────────────┐
     │ Standby     │
     │ 备节点       │
     └─────────────┘
```

---

## AI 能力

**自调优**：
- 参数自动调优
- 索引推荐
- SQL 优化建议

**DB4AI**：
- 机器学习模型管理
- AI 驱动的查询优化
- 异常检测

---

## 部署与实战

### Docker 部署 openGauss

```bash
docker run -d \
  --name opengauss \
  -p 5432:5432 \
  -e GS_PASSWORD=Enmo@123 \
  opengauss/opengauss:5.0.0
```

### GaussDB 连接

```bash
# 通过 DAS 连接
# 或使用 PostgreSQL 客户端
psql -hhost.postgres.huawei.com -Uroot -dpostgres
```

---

**更新时间**：2026年2月 | **版本**：v1.0
