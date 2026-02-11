---
title: Oracle数据库面试题
---

# Oracle数据库面试题

> **难度等级**：⭐⭐ | **出现频率**：60% | **建议用时**：25分钟

## 基础概念题

### 1. Oracle与MySQL/PostgreSQL的区别？

**参考答案**：

| 特性 | Oracle | MySQL/PostgreSQL |
|-----|--------|----------------|
| **成本** | 商业数据库（贵） | 开源免费 |
| **ACID** | 严格支持 | 支持但相对宽松 |
| **PL/SQL** | 强大（类似Java） | 存储过程功能弱 |
| **RAC** | 真正应用集群 | 主从复制 |
| ** flashback | 闪回查询 | 无 |
| **分区** | 强大（多种分区方式） | 分区功能弱 |
| **TDE** | 透明数据加密 | 需要插件 |
| **适用** | 企业级、金融、电信 | 中小企业、互联网 |

---

### 2. Oracle有哪些重要数据类型？

**参考答案**：

**1. 字符类型**
- **CHAR(n)**：固定长度，最大2000字节
- **VARCHAR2(n)**：可变长度，最大4000字节
- **NCHAR(n)**：Unicode固定长度
- **NVARCHAR2(n)**：Unicode可变长度
- **CLOB**：字符大对象（最大4GB）

**2. 数值类型**
- **NUMBER(p,s)**：精度p，小数位s
  - NUMBER(5,2)：999.99
  - NUMBER：不限制精度
- **BINARY_FLOAT**：单精度浮点
- **BINARY_DOUBLE**：双精度浮点

**3. 日期类型**
- **DATE**：日期+时间（精确到秒）
- **TIMESTAMP**：日期+时间（精确到纳秒）
- **TIMESTAMP WITH TIME ZONE**：带时区
- **INTERVAL**：时间间隔

```sql
-- 日期计算
SELECT
    SYSDATE AS current_date,
    SYSDATE + 7 AS next_week,
    MONTHS_BETWEEN(date1, date2) AS months_diff
FROM dual;
```

---

### 3. 什么是ROWNUM和ROWID？

**参考答案**：

**ROWID**：
- 每一行的唯一标识
- 64位十六进制字符串
- 直接访问行（最快）

```sql
-- 使用ROWID删除（快速）
SELECT * FROM users WHERE ROWID = 'AAAABsAABAAA...');
```

**ROWNUM**：
- 伪列，表示返回的行号
- **注意**：ROWNUM在查询前分配，不能用>比较

```sql
-- 错误写法（查不到数据）
SELECT * FROM users WHERE ROWNUM > 10;

-- 正确写法（分页）
SELECT * FROM (
    SELECT a.*, ROWNUM rn FROM users a WHERE ROWNUM <= 20
) WHERE rn > 10;

-- Oracle 12c+使用OFFSET
SELECT * FROM users
ORDER BY id
OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;
```

---

## 性能优化题

### 4. Oracle索引类型有哪些？

**参考答案**：

**1. B-tree索引**（默认）
- 适合：高基数列（唯一值多）
- 支持范围查询

**2. 位图索引**
- 适合：低基数列（性别、状态、类型）
- 节省空间，适合数据仓库

```sql
-- 位图索引
CREATE BITMAP INDEX idx_users_gender ON users(gender);
CREATE BITMAP INDEX idx_users_status ON users(status);

-- 适合星型查询
SELECT /*+ BITMAP */ d.name, SUM(s.amount)
FROM dim_date d
JOIN sales s ON d.date_id = s.date_id
GROUP BY d.name;
```

**3. 函数索引**
```sql
-- 函数索引
CREATE INDEX idx_users_upper_name ON users(UPPER(name));

-- 使用索引
SELECT * FROM users WHERE UPPER(name) = 'ZHANG SAN';
```

**4. 反向键索引**
```sql
-- 降序查询优化
CREATE INDEX idx_orders_created_desc ON orders(created_at DESC);

-- 范围查询+排序
SELECT * FROM orders
WHERE created_at BETWEEN DATE '2024-01-01' AND DATE '2024-12-31'
ORDER BY created_at DESC;
```

---

### 5. 如何分析执行计划？

**参考答案**：

**1. 使用AUTOTRACE**
```sql
-- 开启执行计划
SET AUTOTRACE ON;

-- 执行查询
SELECT * FROM users WHERE name = '张三';

/*
Output:
- Recursive call
- Db block gets
- Consistent gets
- Physical reads
*/

-- 关闭
SET AUTOTRACE OFF;
```

**2. 使用EXPLAIN PLAN**
```sql
-- 查看执行计划
EXPLAIN PLAN FOR
SELECT * FROM users WHERE name = '张三';

-- 关键指标
-- - Cardinality（基数）
-- - Cost（成本）
-- - Access predicates
-- - Filter predicates
```

**3. 使用SQL监控**
```sql
-- 查看SQL统计
SELECT
    sql_text,
    executions,
    elapsed_time,
    cpu_time,
    disk_reads
FROM v$sql
WHERE sql_text LIKE '%users%'
ORDER BY elapsed_time DESC;
```

---

## 事务与锁题

### 6. Oracle事务隔离级别？

**参考答案**：

Oracle支持READ COMMITTED和SERIALIZABLE：

**1. READ COMMITTED（默认）**
- 语句级一致性
- 防止脏读
- 允许不可重复读和幻读

**2. SERIALIZABLE**
- 事务级一致性
- 完全隔离（最高级别）
- 性能影响大

```sql
-- 设置隔离级别
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

**3. 多版本读一致性**
- Oracle默认提供语句级读一致性
- 使用undo段实现

---

### 7. Oracle有哪些锁类型？

**参考答案**：

**1. DML锁（行锁、表锁）**
- **Row Share (RS)**：行共享锁
- **Row Exclusive (RX)**：行排他锁
- **Share (S)**：表共享锁
- **Share Row Exclusive (SRX)**：共享行排他
- **Exclusive (X)**：表排他锁

**2. DDL锁**
- 分析锁、排他DDL锁等

**3. 查看锁**
```sql
-- 查看当前锁
SELECT
    s.sid,
    s.serial#,
    s.username,
    l.locked_mode,
    o.object_name,
    o.object_type
FROM v$locked_object l
JOIN v$session s ON l.session_id = s.sid
JOIN dba_objects o ON l.object_id = o.object_id;

-- 解锁
ALTER SYSTEM KILL SESSION 'sid,serial#';
```

---

## 高级特性题

### 8. 什么是Flashback（闪回）？

**参考答案**：

Flashback允许查询过去时间的数据：

**1. 闪回查询**
```sql
-- 查询5分钟前的数据
SELECT * FROM users
AS OF TIMESTAMP (SYSTIMESTAMP - INTERVAL '5' MINUTE)
WHERE id = 1;

-- 查询指定SCN
SELECT * FROM users AS OF SCN 123456 WHERE id = 1;
```

**2. 闪回表**
```sql
-- 启用表闪回
ALTER TABLE users ENABLE ROW MOVEMENT;

-- 恢复表到过去时间
FLASHBACK TABLE users TO TIMESTAMP (SYSTIMESTAMP - INTERVAL '1' HOUR);
```

**3. 闪回删除**
```sql
-- 从回收站恢复
FLASHBACK TABLE users TO BEFORE DROP;

-- 查看回收站
SELECT * FROM user_recyclebin;

-- 清空回收站
PURGE RECYCLEBIN;
```

---

### 9. 分区表有哪些类型？

**参考答案**：

**1. Range分区**（范围）
```sql
CREATE TABLE orders (
    id NUMBER,
    order_date DATE,
    customer_id NUMBER,
    amount NUMBER
)
PARTITION BY RANGE (order_date) (
    PARTITION orders_2023 VALUES LESS THAN (DATE '2024-01-01'),
    PARTITION orders_2024 VALUES LESS THAN (DATE '2025-01-01'),
    PARTITION orders_max VALUES LESS THAN (MAXVALUE)
);
```

**2. List分区**（列表）
```sql
CREATE TABLE orders (
    id NUMBER,
    region VARCHAR2(10),
    order_date DATE
)
PARTITION BY LIST (region) (
    PARTITION orders_north VALUES ('北京', '天津'),
    PARTITION orders_south VALUES ('广州', '深圳'),
    PARTITION orders_other VALUES (DEFAULT)
);
```

**3. Hash分区**（哈希）
```sql
CREATE TABLE orders (
    id NUMBER,
    order_date DATE
)
PARTITION BY HASH (id)
PARTITIONS 8;
```

**4. Interval分区**（自动）
```sql
-- Oracle 11g+自动创建分区
CREATE TABLE orders (
    id NUMBER,
    order_date DATE
)
PARTITION BY RANGE (order_date)
INTERVAL (NUMTOYMINTERVAL(1, 'MONTH')) (
    PARTITION orders_2023 VALUES LESS THAN (DATE '2024-01-01')
);
```

**分区查询优化**
```sql
-- 分区修剪
SELECT * FROM orders
WHERE order_date >= DATE '2024-01-01'
AND order_date < DATE '2024-02-01';

-- 只查询对应分区（快速）
```

---

### 10. 物化视图是什么？

**参考答案**：

物化视图预计算并存储查询结果：

**1. 创建物化视图**
```sql
CREATE MATERIALIZED VIEW mv_sales_summary
BUILD IMMEDIATE
REFRESH FAST ON COMMIT
AS
SELECT
    customer_id,
    SUM(amount) AS total_amount,
    COUNT(*) AS order_count
FROM orders
GROUP BY customer_id;
```

**2. 手动刷新**
```sql
-- 完全刷新
DBMS_MVIEW.REFRESH('mv_sales_summary', 'C');

-- 增量刷新
DBMS_MVIEW.REFRESH('mv_sales_summary', 'F');
```

**3. 查询物化视图**
```sql
-- 查看物化视图信息
SELECT * FROM user_mviews;

-- 查看刷新时间
SELECT mview_name, last_refresh_date
FROM user_mviews;
```

---

## 实战场景题

### 11. 如何优化大表删除？

**参考答案**：

**问题**：DELETE大表数据慢，产生大量undo和redo

**方案1：分区删除**
```sql
-- 删除整个分区（快）
ALTER TABLE orders DROP PARTITION orders_2023;

-- 交换分区
CREATE TABLE orders_temp AS SELECT * FROM orders WHERE 1=0;
ALTER TABLE orders EXCHANGE PARTITION orders_2023
WITH TABLE orders_temp;
```

**方案2：CTAS重建**
```sql
-- 创建新表（只保留需要数据）
CREATE TABLE orders_new AS
SELECT * FROM orders
WHERE created_at >= DATE '2024-01-01';

-- 重命名
RENAME orders TO orders_old;
RENAME orders_new TO orders;

-- 删除旧表
DROP TABLE orders_old;
```

**方案3：TRUNCATE + 交换**
```sql
-- 创建临时表保存需要数据
CREATE TABLE orders_keep AS
SELECT * FROM orders
WHERE created_at >= DATE '2024-01-01';

-- 快速清空
TRUNCATE TABLE orders;

-- 插回数据
INSERT /*+ APPEND */ INTO orders
SELECT * FROM orders_keep;
```

---

### 12. 如何实现序列？

**参考答案**：

```sql
-- 创建序列
CREATE SEQUENCE seq_users
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

-- 使用序列
INSERT INTO users (id, name)
VALUES (seq_users.NEXTVAL, '张三');

-- 查看当前值
SELECT seq_users.CURRVAL FROM dual;

-- 修改序列
ALTER SEQUENCE seq_users INCREMENT BY 2;
```

**Oracle 12c+ Identity列**
```sql
-- 自动增长列（类似MySQL自增）
CREATE TABLE users (
    id NUMBER GENERATED ALWAYS AS IDENTITY,
    name VARCHAR2(100)
);
```

---

### 13. 如何实现数据库链接（DB Link）？

**参考答案**：

```sql
-- 创建数据库链接
CREATE DATABASE LINK remote_db
CONNECT TO remote_user IDENTIFIED BY password
USING 'description=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.1.100)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=orcl)))';

-- 查询远程表
SELECT * FROM users@remote_db;

-- 远程+本地表JOIN
SELECT
    l.name AS local_name,
    r.name AS remote_name
FROM local_users l
LEFT JOIN users@remote_db r ON l.id = r.id;

-- 删除链接
DROP DATABASE LINK remote_db;
```

---

**更新时间**：2026年2月 | **版本**：v1.0
