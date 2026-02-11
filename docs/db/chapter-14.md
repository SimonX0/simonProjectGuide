---
title: 第14章：数据库性能调优完全指南
---

# ：数据库性能调优完全指南

> **难度等级**：⭐⭐⭐ 高级 | **学习时长**：10小时 | **实战项目**：千万级数据性能优化

## 📚 本章目录

- [14.1 性能调优方法论](#141-性能调优方法论)
- [14.2 性能监控与诊断](#142-性能监控与诊断)
- [14.3 慢查询分析与优化](#143-慢查询分析与优化)
- [14.4 SQL查询优化技巧](#144-sql查询优化技巧)
- [14.5 表结构优化](#145-表结构优化)
- [14.6 配置参数调优](#146-配置参数调优)
- [14.7 硬件与架构优化](#147-硬件与架构优化)
- [14.8 综合实战案例](#148-综合实战案例)

---

## 性能调优方法论

### 调优流程

```mermaid
graph TD
    A[性能问题] --> B[监控诊断]
    B --> C[问题定位]
    C --> D{瓶颈类型?}

    D -->|SQL问题| E[查询优化]
    D -->|索引问题| F[索引优化]
    D -->|配置问题| G[参数调优]
    D -->|架构问题| H[架构优化]
    D -->|硬件问题| I[硬件升级]

    E --> J[测试验证]
    F --> J
    G --> J
    H --> J
    I --> J

    J --> K{满足要求?}
    K -->|否| B
    K -->|是| L[完成]
```

### 调优原则

1. **测量优先**：不要猜测，用数据说话
2. **针对性优化**：找到真正的瓶颈
3. **循序渐进**：一次只优化一个方面
4. **权衡取舍**：性能 vs 成本 vs 复杂度
5. **持续监控**：性能优化是持续的过程

### 性能基线

```sql
-- 1. 建立性能基线
-- 记录正常情况下的关键指标

-- PostgreSQL
SELECT
    schemaname,
    relname,
    seq_scan,           -- 顺序扫描次数
    seq_tup_read,       -- 顺序扫描行数
    idx_scan,           -- 索引扫描次数
    idx_tup_fetch,      -- 索引扫描行数
    n_tup_ins,          -- 插入行数
    n_tup_upd,          -- 更新行数
    n_tup_del,          -- 删除行数
    n_live_tup,         -- 活跃行数
    n_dead_tup          -- 死行数
FROM pg_stat_user_tables
WHERE relname = 'orders';

-- MySQL
SELECT
    table_name,
    table_rows,
    avg_row_length,
    data_length,
    index_length,
    auto_increment,
    create_time,
    update_time
FROM information_schema.tables
WHERE table_schema = 'mydb'
ORDER BY data_length DESC;

-- 2. 记录慢查询统计
-- PostgreSQL
SELECT
    calls,
    total_exec_time / 1000 AS total_seconds,
    mean_exec_time / 1000 AS avg_seconds,
    max_exec_time / 1000 AS max_seconds,
    query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- MySQL
SELECT
    digest_text AS query,
    count_star AS exec_count,
    ROUND(avg_timer_wait / 1000000000, 4) AS avg_sec,
    ROUND(sum_timer_wait / 1000000000, 4) AS total_sec,
    ROUND(sum_timer_wait / 1000000000 / count_star, 4) AS avg_per_call
FROM performance_schema.events_statements_summary_by_digest
ORDER BY avg_sec DESC
LIMIT 20;
```

---

## 性能监控与诊断

### 监控指标

**关键性能指标（KPI）**：

| 指标类别 | 具体指标 | 正常值 | 告警值 |
|---------|---------|-------|-------|
| **连接数** | 当前连接数 | < 最大连接数的70% | > 85% |
| **QPS/TPS** | 每秒查询/事务数 | 取决于应用 | 下降超过50% |
| **响应时间** | 平均查询时间 | < 100ms | > 500ms |
| **慢查询** | 慢查询比例 | < 1% | > 5% |
| **缓存命中率** | Buffer Pool 命中率 | > 95% | < 90% |
| **锁等待** | 锁等待次数 | 0 | 持续增长 |
| **磁盘IO** | IOPS 使用率 | < 70% | > 85% |
| **CPU** | CPU 使用率 | < 70% | > 85% |

### 监控工具

**1. 内置监控命令**

```bash
# PostgreSQL
psql -c "SELECT * FROM pg_stat_activity;"  # 当前活动会话
psql -c "SELECT * FROM pg_stat_database;"  # 数据库统计
psql -c "SELECT * FROM pg_stat_user_tables;"  # 表统计
psql -c "SELECT * FROM pg_stat_user_indexes;"  # 索引统计

# MySQL
mysql -e "SHOW PROCESSLIST;"  # 当前连接
mysql -e "SHOW ENGINE INNODB STATUS\G"  # InnoDB 状态
mysql -e "SHOW GLOBAL STATUS;"  # 全局状态
mysql -e "SHOW GLOBAL VARIABLES;"  # 全局变量
```

**2. 开源监控工具**

```bash
# Prometheus + Grafana 监控栈
# PostgreSQL Exporter
docker run -d \
  --name pg_exporter \
  -e DATA_SOURCE_NAME="postgresql://user:pass@localhost:5432/dbname" \
  -p 9187:9187 \
  prometheuscommunity/postgres-exporter

# MySQL Exporter
docker run -d \
  --name mysql_exporter \
  -e DATA_SOURCE_NAME="user:pass@(localhost:3306)/dbname" \
  -p 9104:9104 \
  prom/mysqld-exporter

# Grafana 仪表板
# - PostgreSQL Dashboard (ID 9628)
# - MySQL Overview (ID 7362)
```

**3. 商业监控方案**

- **Percona PMM**：专业的 MySQL/MongoDB 监控
- **SolarWinds Database Performance Monitor**：多数据库支持
- **Datadog**：云监控平台
- **New Relic**：应用性能监控

### 实时监控脚本

```bash
#!/bin/bash
# db_monitor.sh - 数据库实时监控脚本

while true; do
    clear
    echo "=== 数据库监控 $(date +%H:%M:%S) ==="
    echo

    # PostgreSQL
    echo "【PostgreSQL】"
    PGPASSWORD=password psql -h localhost -U postgres -d mydb -c "
    SELECT
        count(*) AS active_connections,
        count(*) FILTER (WHERE state = 'active') AS running_queries,
        count(*) FILTER (WHERE state = 'idle') AS idle_connections
    FROM pg_stat_activity;
    "

    echo "慢查询Top 5："
    PGPASSWORD=password psql -h localhost -U postgres -d mydb -c "
    SELECT
        left(query, 50) AS query,
        calls,
        ROUND(mean_exec_time::numeric, 2) AS avg_ms
    FROM pg_stat_statements
    ORDER BY mean_exec_time DESC
    LIMIT 5;
    "

    # MySQL
    echo
    echo "【MySQL】"
    mysql -u root -ppassword -e "
    SELECT
        COUNT(*) AS connections,
        SUM(command = 'Query') AS running,
        SUM(command = 'Sleep') AS sleeping
    FROM information_schema.processlist;
    "

    echo "慢查询Top 5："
    mysql -u root -ppassword -e "
    SELECT
        LEFT(digest_text, 50) AS query,
        count_star AS exec_count,
        ROUND(avg_timer_wait / 1000000000, 2) AS avg_sec
    FROM performance_schema.events_statements_summary_by_digest
    ORDER BY avg_timer_wait DESC
    LIMIT 5;
    "

    sleep 5
done
```

---

## 慢查询分析与优化

### 开启慢查询日志

**PostgreSQL**：

```ini
# postgresql.conf

# 开启查询日志
shared_preload_libraries = 'pg_stat_statements'

pg_stat_statements.track = all          # 跟踪所有语句
pg_stat_statements.max = 10000          # 最多保留10000条

# 开启慢查询日志
log_min_duration_statement = 1000       # 超过1秒的查询记录到日志
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on                   # 记录检查点
log_lock_waits = on                    # 记录锁等待
```

**MySQL**：

```ini
# my.cnf

# 开启慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1                    # 超过1秒的查询
log_queries_not_using_indexes = 1      # 记录未使用索引的查询
log_slow_admin_statements = 1          # 记录慢的管理语句
log_slow_slave_statements = 1          # 记录慢的从库语句
```

### 分析慢查询

**1. 使用 pt-query-digest（MySQL）**

```bash
# 安装 Percona Toolkit
apt-get install percona-toolkit

# 分析慢查询日志
pt-query-digest /var/log/mysql/slow.log

# 输出示例：
# # Rank 1: 25.00% of total, 100 queries, avg 2.5s
# # Query: SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
#
# # Rank 2: 15.00% of total, 60 queries, avg 3.0s
# # Query: SELECT COUNT(*) FROM orders WHERE status = ?

# 按时间范围分析
pt-query-digest --since '2024-01-01 00:00:00' --until '2024-01-01 23:59:59' /var/log/mysql/slow.log

# 只分析特定类型的查询
pt-query-digest --filter '$event->{fingerprint} =~ m/^select/i' /var/log/mysql/slow.log
```

**2. 使用 pgBadger（PostgreSQL）**

```bash
# 安装 pgBadger
apt-get install pgbadger

# 生成报告
pgbadger /var/log/postgresql/postgresql-*.log -o report.html

# 实时监控
pgbadger -f stderr -p '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h' /var/log/postgresql/postgresql.log

# 分析特定时间范围
pgbadger -s '2024-01-01 00:00:00' -e '2024-01-01 23:59:59' /var/log/postgresql/postgresql.log
```

**3. 直接查询 pg_stat_statements**

```sql
-- PostgreSQL：查找最慢的查询
SELECT
    calls,
    total_exec_time / 1000 AS total_sec,
    mean_exec_time / 1000 AS avg_sec,
    max_exec_time / 1000 AS max_sec,
    stddev_exec_time / 1000 AS stddev_sec,
    query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- 查找执行次数最多的查询
SELECT
    calls,
    total_exec_time / 1000 AS total_sec,
    LEFT(query, 100) AS query
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 20;

-- 查找最耗时间的查询
SELECT
    calls,
    total_exec_time / 1000 AS total_sec,
    ROUND(total_exec_time / calls / 1000, 2) AS avg_sec,
    LEFT(query, 100) AS query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```

### 慢查询优化流程

```
慢查询 → 执行计划分析 → 瓶颈识别 → 优化方案 → 测试验证 → 部署上线
   ↓         ↓            ↓          ↓          ↓
  日志    EXPLAIN      索引/SQL   修改SQL    对比性能
```

**示例：优化慢查询**

```sql
-- 原始慢查询（5秒）
SELECT
    o.id,
    o.user_id,
    u.username,
    o.amount,
    o.status,
    o.created_at
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE o.status IN (1, 2, 3)
    AND o.created_at >= '2024-01-01'
ORDER BY o.created_at DESC
LIMIT 20;

-- 1. 查看执行计划
EXPLAIN ANALYZE
SELECT ... FROM orders o LEFT JOIN users u ON o.user_id = u.id ...

-- 结果显示：Seq Scan on orders (cost=0.00..500000.00 rows=10000000)
-- 问题：全表扫描

-- 2. 创建索引
CREATE INDEX idx_status_created ON orders(status, created_at DESC);

-- 3. 再次查看执行计划
-- Index Scan using idx_status_created (cost=0.42..1000.00 rows=1000)
-- 性能提升：5秒 → 100ms
```

---

## SQL查询优化技巧

### 1. 避免 SELECT *

```sql
-- ❌ 查询所有列
SELECT * FROM orders WHERE user_id = 123;

-- ✅ 只查询需要的列
SELECT id, status, amount, created_at
FROM orders
WHERE user_id = 123;

-- 优势：
-- 1. 减少网络传输
-- 2. 减少内存占用
-- 3. 可能使用覆盖索引
```

### 2. 优化 JOIN 顺序

```sql
-- 小表驱动大表
-- ❌ 大表驱动小表
SELECT *
FROM big_table b
JOIN small_table s ON b.id = s.big_id;

-- ✅ 小表驱动大表
SELECT *
FROM small_table s
JOIN big_table b ON s.big_id = b.id;

-- STRAIGHT_JOIN（MySQL）强制连接顺序
SELECT *
FROM small_table s
STRAIGHT_JOIN big_table b ON s.big_id = b.id;
```

### 3. 使用 EXISTS 替代 IN

```sql
-- ❌ IN 子查询（可能性能差）
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE amount > 1000);

-- ✅ EXISTS（通常更快）
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.user_id = u.id AND o.amount > 1000
);

-- NOT IN vs NOT EXISTS
-- ❌ NOT IN 有 NULL 问题时结果不正确
SELECT * FROM users
WHERE id NOT IN (SELECT user_id FROM orders);

-- ✅ NOT EXISTS（推荐）
SELECT * FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

### 4. 优化 UNION

```sql
-- ❌ UNION（去重，慢）
SELECT user_id FROM orders_202401
UNION
SELECT user_id FROM orders_202402;

-- ✅ UNION ALL（不去重，快）
SELECT user_id FROM orders_202401
UNION ALL
SELECT user_id FROM orders_202402;

-- 如果确实需要去重，考虑用 DISTINCT + UNION ALL
SELECT DISTINCT user_id FROM (
    SELECT user_id FROM orders_202401
    UNION ALL
    SELECT user_id FROM orders_202402
) t;
```

### 5. 批量操作优化

```sql
-- ❌ 逐条插入
INSERT INTO logs (message) VALUES ('log1');
INSERT INTO logs (message) VALUES ('log2');
INSERT INTO logs (message) VALUES ('log3');

-- ✅ 批量插入
INSERT INTO logs (message) VALUES
    ('log1'),
    ('log2'),
    ('log3');

-- ❌ 逐条更新
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- ✅ 单语句更新（如果有外键约束，注意顺序）
UPDATE accounts SET balance =
    CASE id
        WHEN 1 THEN balance - 100
        WHEN 2 THEN balance + 100
    END
WHERE id IN (1, 2);
```

### 6. 优化子查询

```sql
-- ❌ 相关子查询（逐行执行）
SELECT * FROM users u
WHERE (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) > 10;

-- ✅ JOIN（一次性执行）
SELECT u.*, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id
HAVING COUNT(o.id) > 10;

-- ✅ 使用 WITH 子句（CTE）
WITH user_order_counts AS (
    SELECT user_id, COUNT(*) AS order_count
    FROM orders
    GROUP BY user_id
    HAVING COUNT(*) > 10
)
SELECT u.*, uoc.order_count
FROM users u
INNER JOIN user_order_counts uoc ON u.id = uoc.user_id;
```

### 7. 优化 LIMIT 深分页

```sql
-- ❌ 深分页性能差
SELECT * FROM orders
ORDER BY id DESC
LIMIT 1000000, 10;

-- ✅ 方案1：使用上次最大ID（游标分页）
SELECT * FROM orders
WHERE id < 1000000
ORDER BY id DESC
LIMIT 10;

-- ✅ 方案2：延迟关联
SELECT o.*
FROM orders o
INNER JOIN (
    SELECT id FROM orders
    ORDER BY id DESC
    LIMIT 1000000, 10
) t ON o.id = t.id;

-- ✅ 方案3：使用覆盖索引 + 预计算
-- 1. 创建覆盖索引
CREATE INDEX idx_id_created ON orders(id, created_at);

-- 2. 只查询ID
SELECT id FROM orders
ORDER BY id DESC
LIMIT 1000000, 10;

-- 3. 根据ID查询详情
SELECT * FROM orders
WHERE id IN (/* 第2步的ID列表 */);
```

### 8. 使用窗口函数

```sql
-- ❌ 自连接实现排名（慢）
SELECT t1.id, t1.username, t1.score,
    (SELECT COUNT(*) FROM users t2 WHERE t2.score > t1.score) + 1 AS rank
FROM users t1
ORDER BY score DESC;

-- ✅ 窗口函数（快）
SELECT id, username, score,
    RANK() OVER (ORDER BY score DESC) AS rank
FROM users
ORDER BY score DESC;

-- 计算累计和
SELECT
    order_date,
    amount,
    SUM(amount) OVER (
        ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_amount
FROM sales;
```

---

## 表结构优化

### 数据类型优化

```sql
-- 1. 使用合适的数据类型
-- ❌ 过大的类型
CREATE TABLE users (
    id BIGINT,              -- 用不到这么大
    name VARCHAR(255),      -- 实际只用50
    created_at TIMESTAMP(6) -- 不需要微秒
);

-- ✅ 合适的类型
CREATE TABLE users (
    id INT UNSIGNED,        -- 40亿足够
    name VARCHAR(50),
    created_at TIMESTAMP
);

-- 2. 优先使用 NOT NULL
-- ❌ 可空列（优化器难以优化）
CREATE TABLE orders (
    status INT,
    amount DECIMAL(10,2)
);

-- ✅ NOT NULL 列
CREATE TABLE orders (
    status INT NOT NULL DEFAULT 0,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- 3. 使用枚举替代字符串
-- ❌ 字符串类型
CREATE TABLE users (
    status VARCHAR(20)  -- 'active', 'inactive', 'suspended'
);

-- ✅ MySQL 使用 ENUM
CREATE TABLE users (
    status ENUM('active', 'inactive', 'suspended')
);

-- ✅ PostgreSQL 使用自定义类型
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TABLE users (
    status user_status
);

-- ✅ 或使用 SMALLINT + 查找表
CREATE TABLE user_statuses (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(20)
);

CREATE TABLE users (
    status SMALLINT NOT NULL,
    FOREIGN KEY (status) REFERENCES user_statuses(id)
);
```

### 表分区

**1. 范围分区（按日期）**

```sql
-- PostgreSQL
CREATE TABLE orders (
    id BIGSERIAL,
    user_id BIGINT,
    amount DECIMAL(10,2),
    created_at TIMESTAMP
) PARTITION BY RANGE (created_at);

-- 创建分区（按月）
CREATE TABLE orders_202401 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE orders_202402 PARTITION OF orders
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- 自动创建分区
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYYMM');
    end_date := start_date + INTERVAL '1 month';

    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
        partition_name, table_name, start_date, end_date
    );
END;
$$ LANGUAGE plpgsql;

-- MySQL 8.0
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT,
    user_id BIGINT,
    amount DECIMAL(10,2),
    created_at TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);
```

**2. 列表分区（按状态）**

```sql
-- PostgreSQL
CREATE TABLE orders (
    id BIGSERIAL,
    user_id BIGINT,
    status VARCHAR(20),
    amount DECIMAL(10,2)
) PARTITION BY LIST (status);

CREATE TABLE orders_active PARTITION OF orders
    FOR VALUES IN ('active', 'pending');

CREATE TABLE orders_completed PARTITION OF orders
    FOR VALUES IN ('completed', 'settled');

CREATE TABLE orders_cancelled PARTITION OF orders
    FOR VALUES IN ('cancelled', 'refunded');
```

**3. 哈希分区（均匀分布）**

```sql
-- MySQL
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT,
    user_id BIGINT,
    amount DECIMAL(10,2),
    PRIMARY KEY (id, user_id)
) PARTITION BY HASH(user_id)
PARTITIONS 16;
```

### 反范式化

```sql
-- 场景：用户订单统计页面
-- 3NF（规范化）
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50)
);

CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    amount DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ❌ 每次都要统计
SELECT u.*, COUNT(o.id) AS order_count, SUM(o.amount) AS total_amount
FROM users u
LEFT JOIN orders o ON o.id = u.user_id
GROUP BY u.id;

-- ✅ 反范式化：添加冗余字段
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50),
    order_count INT DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    INDEX idx_order_count (order_count DESC)
);

-- 通过触发器维护冗余数据
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET
            order_count = order_count + 1,
            total_amount = total_amount + NEW.amount
        WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET
            order_count = order_count - 1,
            total_amount = total_amount - OLD.amount
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_user_stats
    AFTER INSERT OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- 查询性能大幅提升
SELECT * FROM users ORDER BY order_count DESC LIMIT 10;
```

---

## 配置参数调优

### PostgreSQL 参数调优

**内存配置**：

```ini
# postgresql.conf

# 共享缓冲区（物理内存的 25%）
shared_buffers = 4GB

# 有效缓存大小（物理内存的 50-75%）
effective_cache_size = 12GB

# 工作内存（每个排序/哈希操作的内存）
work_mem = 64MB

# 维护工作内存（VACUUM、CREATE INDEX 等）
maintenance_work_mem = 1GB

# 自动工作内存（PostgreSQL 13+）
# work_mem 会被自动限制在总内存的一定比例内
```

**并发配置**：

```ini
# 最大连接数
max_connections = 200

# 后台工作进程
max_worker_processes = 8

# 每个 Gather/Join 节点的并行工作进程
max_parallel_workers_per_gather = 4

# 全局并行工作进程
max_parallel_workers = 8

# 并行维护操作（如 VACUUM、CREATE INDEX）
max_parallel_maintenance_workers = 4
```

**WAL 配置**：

```ini
# WAL 缓冲区
wal_buffers = 64MB

# 最大 WAL 大小
max_wal_size = 4GB

# 最小 WAL 大小
min_wal_size = 1GB

# WAL 检查点间隔
checkpoint_timeout = 15min
checkpoint_completion_target = 0.9

# WAL 压缩
wal_compression = on

# WAL 归档
archive_mode = on
archive_command = 'cp %p /archive/%f'
```

**查询优化配置**：

```ini
# 随机页面成本（SSD: 1.1, HDD: 4.0）
random_page_cost = 1.1

# effective IO 并发度（SSD: 200, HDD: 2）
effective_io_concurrency = 200

# 默认统计精度
default_statistics_target = 100

# JOIN 策略
join_collapse_limit = 8
from_collapse_limit = 8

# 启用 JIT 编译（PostgreSQL 11+）
jit = on
```

### MySQL 参数调优

**InnoDB 缓冲池**：

```ini
# my.cnf

# InnoDB 缓冲池大小（物理内存的 50-70%）
innodb_buffer_pool_size = 8G

# 缓冲池实例数（每实例 1GB，建议不超过实例数）
innodb_buffer_pool_instances = 8

# 缓冲池块大小
innodb_buffer_pool_chunk_size = 128M
```

**日志配置**：

```ini
# Redo 日志文件大小
innodb_log_file_size = 1G

# Redo 日志缓冲区
innodb_log_buffer_size = 64M

# 刷盘策略
# 0: 每秒写入并刷盘（最快，可能丢失1秒数据）
# 1: 每次事务提交写入并刷盘（最安全，最慢）
# 2: 每次事务提交写入，每秒刷盘（折中）
innodb_flush_log_at_trx_commit = 1

# 日志写入策略
# 0: 不延迟
# 1: 延迟到其他线程不刷日志时
innodb_flush_log_at_timeout = 1
```

**并发配置**：

```ini
# InnoDB 线程并发数（0=自动）
innodb_thread_concurrency = 16

# 读 IO 线程数
innodb_read_io_threads = 8

# 写 IO 线程数
innodb_write_io_threads = 8

# 互斥锁等待
innodb_spin_wait_delay = 6
innodb_sync_spin_loops = 30
```

**其他配置**：

```ini
# 表定义缓存
table_definition_cache = 2000

# 表打开缓存
table_open_cache = 4000

# 临时表大小
tmp_table_size = 256M
max_heap_table_size = 256M

# 排序缓冲区
sort_buffer_size = 4M

# 读缓冲区
read_buffer_size = 2M

# 随机读缓冲区
read_rnd_buffer_size = 8M

# 连接数
max_connections = 500
max_connect_errors = 100000
```

### 连接池配置

**pgbouncer（PostgreSQL 连接池）**：

```ini
# pgbouncer.ini

[databases]
mydb = host=localhost port=5432 dbname=mydb

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt

# 连接池模式
# session: 每个会话一个连接
# transaction: 每个事务一个连接（推荐）
# statement: 每个语句一个连接
pool_mode = transaction

# 连接池配置
max_client_conn = 1000
default_pool_size = 50
min_pool_size = 10
reserve_pool_size = 10
reserve_pool_timeout = 3

# 性能配置
server_idle_timeout = 600
server_lifetime = 3600
server_connect_timeout = 15
query_timeout = 300
```

**ProxySQL（MySQL 连接池）**：

```sql
-- ProxySQL 配置

-- 1. 添加后端服务器
INSERT INTO mysql_servers (hostgroup_id, hostname, port)
VALUES (1, 'db1.example.com', 3306);
LOAD MYSQL SERVERS TO RUN;
SAVE MYSQL SERVERS TO DISK;

-- 2. 配置查询规则
INSERT INTO mysql_query_rules (rule_id, active, match_pattern, destination_hostgroup, apply)
VALUES (1, 1, '^SELECT.*FOR UPDATE', 1, 1);
LOAD MYSQL QUERY RULES TO RUN;
SAVE MYSQL QUERY RULES TO DISK;

-- 3. 配置连接池
UPDATE global_variables SET variable_value='2000'
WHERE variable_name='mysql-max_connections';

-- 4. 监控连接池
SELECT * FROM stats_mysql_connection_pool;
```

---

## 硬件与架构优化

### 硬件优化

**1. CPU 优化**

```
- 选择高主频 CPU（数据库计算密集）
- 多核支持（并发连接）
- NUMA 架构感知（大内存配置）
```

**2. 内存优化**

```
- 足够内存减少磁盘IO
- 内存频率影响性能
- ECC 内存保证数据完整性
```

**3. 存储优化**

```bash
# 1. 使用 SSD 替代 HDD
# SSD 的 IOPS 和延迟远优于 HDD

# 2. RAID 配置
# RAID 1: 读优化，安全
# RAID 5: 平衡
# RAID 10: 读写都优化（推荐）

# 3. 文件系统优化
# ext4: 默认选项
# XFS: 大文件性能好
# ZFS: 企业级特性

# 挂载选项（noatime 优化性能）
mount -o noatime,nodiratime /dev/sdb1 /data

# 4. IO 调度器
# SSD: noop 或 deadline
# HDD: cfq

echo noop > /sys/block/sdb/queue/scheduler
```

**4. 网络优化**

```bash
# 1. 增大网络缓冲区
echo 'net.core.rmem_max = 134217728' >> /etc/sysctl.conf
echo 'net.core.wmem_max = 134217728' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_rmem = 4096 87380 67108864' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_wmem = 4096 65536 67108864' >> /etc/sysctl.conf

# 2. 禁用 swap（数据库不应该使用 swap）
swapoff -a
```

### 架构优化

**1. 读写分离**

```
应用层
  ├─ 写操作 → 主库（Master）
  └─ 读操作 → 从库（Slave）
              ├─ Slave 1
              ├─ Slave 2
              └─ Slave N
```

**2. 分库分表**

```python
# 水平分片示例
def get_shard(user_id):
    """根据 user_id 计算分片"""
    shard_count = 16
    return user_id % shard_count

# 查询时路由到对应分片
shard_id = get_shard(user_id)
db = f"shard_{shard_id}"
query = f"SELECT * FROM {db}.orders WHERE user_id = {user_id}"
```

**3. 缓存层**

```
┌─────────┐
│  应用层  │
└────┬────┘
     │
     ├─ 1. 查询缓存
     ├─ 2. 缓存未命中 → 数据库
     └─ 3. 更新缓存

┌─────────┐
│ Redis   │ ← 热点数据缓存
└─────────┘

┌─────────┐
│ 数据库  │ ← 持久化存储
└─────────┘
```

**4. 异步处理**

```python
# 1. 异步写入（消息队列）
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# 发送消息到队列
channel.basic_publish(
    exchange='',
    routing_key='orders',
    body=json.dumps(order_data)
)

# 2. 批量写入
# 定时任务批量处理
@celery.task
def batch_process_orders():
    orders = get_pending_orders(1000)
    if orders:
        bulk_insert(orders)

# 3. 延迟写入
# 先写入缓存，定时任务异步持久化到数据库
redis.set('order:' + order_id, json.dumps(order_data))
# 后台任务定期扫描并持久化
```

---

## 综合实战案例

### 案例1：电商首页慢查询优化

**问题**：电商首页加载需要8秒

**分析**：

```sql
-- 慢查询日志
# Query_time: 8.234  Lock_time: 0.000 Rows_sent: 20  Rows_examined: 50000000

SELECT
    p.id,
    p.name,
    p.price,
    p.image,
    c.name AS category_name,
    b.name AS brand_name,
    s.stock,
    SUM(od.quantity) AS sold_count,
    AVG(od.rating) AS avg_rating
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN stocks s ON p.id = s.product_id
LEFT JOIN order_details od ON p.id = od.product_id
WHERE p.status = 1
    AND s.stock > 0
GROUP BY p.id
ORDER BY sold_count DESC
LIMIT 20;

-- 执行计划
-- 1. 扫描 50万行产品
-- 2. 关联 5 张表
-- 3. GROUP BY 聚合
-- 4. 全表扫描多次
```

**优化方案**：

**步骤1：添加索引**

```sql
-- 基础索引
CREATE INDEX idx_product_status ON products(status);
CREATE INDEX idx_stock ON stocks(product_id, stock);
CREATE INDEX idx_order_details_product ON order_details(product_id);

-- 优化：复合索引
CREATE INDEX idx_product_status_sold ON products(status, sold_count DESC);
```

**步骤2：创建汇总表**

```sql
-- 创建商品统计汇总表
CREATE TABLE product_stats (
    product_id BIGINT PRIMARY KEY,
    sold_count INT DEFAULT 0,
    rating_sum DECIMAL(10,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sold_count (sold_count DESC)
);

-- 创建触发器更新统计
CREATE TRIGGER trg_update_product_stats
    AFTER INSERT ON order_details
    FOR EACH ROW
BEGIN
    INSERT INTO product_stats (product_id, sold_count, rating_sum, rating_count, avg_rating)
    VALUES (NEW.product_id, 1, NEW.rating, 1, NEW.rating)
    ON DUPLICATE KEY UPDATE
        sold_count = sold_count + 1,
        rating_sum = rating_sum + NEW.rating,
        rating_count = rating_count + 1,
        avg_rating = rating_sum / rating_count;
END;
```

**步骤3：优化查询**

```sql
-- 优化后的查询（使用汇总表）
SELECT
    p.id,
    p.name,
    p.price,
    p.image,
    c.name AS category_name,
    b.name AS brand_name,
    s.stock,
    ps.sold_count,
    ps.avg_rating
FROM products p
INNER JOIN product_stats ps ON p.id = ps.product_id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN stocks s ON p.id = s.product_id
WHERE p.status = 1
    AND s.stock > 0
ORDER BY ps.sold_count DESC
LIMIT 20;

-- 结果：8秒 → 50ms
```

**步骤4：添加 Redis 缓存**

```python
import redis
import json
import hashlib

r = redis.Redis(host='localhost', port=6379, db=0)

def get_homepage_products():
    # 生成缓存键
    cache_key = f"homepage:products:top20"

    # 尝试从缓存获取
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    # 缓存未命中，查询数据库
    products = db.execute("""
        SELECT * FROM (
            SELECT p.id, p.name, p.price, p.image,
                   c.name AS category_name,
                   ps.sold_count, ps.avg_rating
            FROM products p
            INNER JOIN product_stats ps ON p.id = ps.product_id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status = 1
            ORDER BY ps.sold_count DESC
            LIMIT 20
        ) t
        LEFT JOIN stocks s ON t.id = s.product_id
        WHERE s.stock > 0
    """)

    # 写入缓存（5分钟过期）
    r.setex(cache_key, 300, json.dumps(products))

    return products

# 结果：50ms → 5ms
```

**性能对比**：

| 优化阶段 | 响应时间 | QPS |
|---------|---------|-----|
| 原始查询 | 8000ms | 0.1 |
| 添加索引 | 500ms | 2 |
| 汇总表 | 50ms | 20 |
| Redis缓存 | 5ms | 200 |

### 案例2：报表系统优化

**问题**：日报表生成需要1小时

**分析**：

```sql
-- 原始查询
SELECT
    DATE(created_at) AS date,
    category_id,
    COUNT(*) AS order_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount
FROM orders
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'
GROUP BY DATE(created_at), category_id;

-- 执行计划：Seq Scan on orders (1亿行)
```

**优化方案**：

**方案1：分区表**

```sql
-- 按月分区
CREATE TABLE orders_partitioned (
    id BIGSERIAL,
    user_id BIGINT,
    category_id INT,
    amount DECIMAL(10,2),
    created_at TIMESTAMP
) PARTITION BY RANGE (created_at);

-- 创建分区
CREATE TABLE orders_202401 PARTITION OF orders_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 查询只扫描1月的数据（而不是全部）
SELECT DATE(created_at), category_id, COUNT(*), SUM(amount), AVG(amount)
FROM orders_partitioned
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'
GROUP BY DATE(created_at), category_id;

-- 结果：1小时 → 10分钟
```

**方案2：物化视图**

```sql
-- 创建物化视图（每天的数据预计算）
CREATE MATERIALIZED VIEW mv_daily_category_stats AS
SELECT
    DATE(created_at) AS date,
    category_id,
    COUNT(*) AS order_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount
FROM orders
GROUP BY DATE(created_at), category_id;

CREATE UNIQUE INDEX idx_date_category ON mv_daily_category_stats(date, category_id);

-- 查询物化视图（毫秒级）
SELECT * FROM mv_daily_category_stats
WHERE date >= '2024-01-01';

-- 定时刷新（每天凌晨）
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_category_stats;

-- 结果：10分钟 → 50ms
```

**方案3：时序数据库**

```python
# 使用 ClickHouse（列式存储，OLAP 优化）

# 1. 创建 ClickHouse 表
CREATE TABLE orders_ch (
    date Date,
    category_id UInt32,
    order_count UInt32,
    total_amount Decimal(18,2),
    avg_amount Decimal(18,2)
) ENGINE = SummingMergeTree()
ORDER BY (date, category_id);

# 2. 同步数据到 ClickHouse
from clickhouse_driver import Client

client = Client('localhost')

# 从 PostgreSQL 读取统计数据
stats = pg_db.execute("""
    SELECT DATE(created_at), category_id,
           COUNT(*), SUM(amount), AVG(amount)
    FROM orders
    GROUP BY DATE(created_at), category_id
""")

# 批量插入 ClickHouse
client.execute(
    'INSERT INTO orders_ch (date, category_id, order_count, total_amount, avg_amount) VALUES',
    stats
)

# 3. 查询 ClickHouse（列式存储，极快）
result = client.execute("""
    SELECT date, category_id, order_count, total_amount, avg_amount
    FROM orders_ch
    WHERE date >= '2024-01-01'
    ORDER BY date DESC, category_id
""")

# 结果：50ms → 5ms
```

---

## ✅ 本章小结

### 学习检查清单

完成本章学习后，请确认你能够：

- [ ] 建立性能基线并进行持续监控
- [ ] 分析慢查询日志并定位性能瓶颈
- [ ] 应用 SQL 查询优化技巧
- [ ] 设计和优化表结构
- [ ] 调优数据库配置参数
- [ ] 选择合适的硬件和架构
- [ ] 解决复杂的性能问题

### 核心要点回顾

1. **调优方法论**：测量 → 定位 → 优化 → 验证
2. **监控诊断**：建立基线、持续监控、发现问题
3. **SQL 优化**：避免 SELECT *、优化 JOIN、使用 EXISTS
4. **表结构优化**：数据类型、分区、反范式化
5. **配置调优**：内存、并发、IO 参数
6. **架构优化**：读写分离、分库分表、缓存、异步

### 性能优化清单

**查询优化**：
- 避免SELECT *，只查询需要的列
- 使用索引覆盖查询
- 优化JOIN顺序，小表驱动大表
- 使用EXISTS替代IN
- 批量操作替代逐条操作
- 使用窗口函数替代子查询

**索引优化**：
- 为高选择性列创建索引
- 使用复合索引遵循最左前缀
- 创建覆盖索引避免回表
- 使用表达式索引
- 定期监控和重建索引

**表结构优化**：
- 使用合适的数据类型
- 字段设置为NOT NULL
- 使用分区表
- 适度反范式化
- 历史数据归档

**配置优化**：
- 调整缓冲区大小
- 优化连接数配置
- 配置合适的WAL/Redo日志
- 启用查询缓存
- 优化IO调度

**架构优化**：
- 读写分离
- 水平分片
- 引入缓存层
- 异步处理
- 使用OLAP数据库处理分析查询

## 📚 延伸阅读

- [第10章：索引优化与性能调优 →](./chapter-10)
- [第11章：事务与锁机制 →](./chapter-11)
- [第24章：分库分表架构设计 →](./chapter-24)

**推荐工具**：
- [pgBadger](https://github.com/dalibo/pgbadger) - PostgreSQL 日志分析
- [pt-query-digest](https://www.percona.com/doc/percona-toolkit/LATEST/pt-query-digest.html) - MySQL 慢查询分析
- [Prometheus](https://prometheus.io/) - 开源监控系统
- [Grafana](https://grafana.com/) - 可视化仪表板

---

**更新时间**：2026年2月 | **版本**：v1.0
