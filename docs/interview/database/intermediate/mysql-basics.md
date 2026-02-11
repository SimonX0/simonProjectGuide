---
title: MySQL基础与优化面试题
---

# MySQL基础与优化面试题

> **难度等级**：⭐⭐ | **出现频率**：95% | **建议用时**：30分钟

## 基础概念题

### 1. MySQL 8.0有哪些新特性？

**参考答案**：

MySQL 8.0相比5.7有以下重要新特性：

1. **窗口函数**
   - ROW_NUMBER()、RANK()、DENSE_RANK()
   - LAG()、LEAD()用于前后行对比

2. **公用表表达式（CTE）**
   - 简化复杂查询
   - 支持递归查询

3. **JSON增强**
   - JSON数组操作
   - JSON函数索引

4. **不可见索引**
   - 用于安全删除索引前测试

5. **降序索引**
   - 支持DESC索引

6. **直方图统计**
   - 帮助优化器选择执行计划

7. **性能架构增强**
   - 数据字典从InnoDB存储
   - 更完善的Performance Schema

---

### 2. InnoDB和MyISAM的区别？

**参考答案**：

| 特性 | InnoDB | MyISAM |
|-----|--------|---------|
| 事务 | 支持 | 不支持 |
| 锁机制 | 行锁 | 表锁 |
| 外键 | 支持 | 不支持 |
| 崩溃恢复 | 支持崩溃恢复 | 不支持 |
| MVCC | 支持 | 不支持 |
| 适用场景 | 高并发、事务要求高 | 读多写少 |

---

### 3. varchar(10)和varchar(10)的实际存储区别？

**参考答案**：

- **varchar(10)**：最多存储10个**字符**
- **varchar(10)**：最多存储10个**字节**

实际占用存储空间 = 字符串实际长度 + 1或2字节长度前缀

---

## 索引相关题

### 4. MySQL索引的数据结构？

**参考答案**：

InnoDB使用**B+树**作为索引结构：

**为什么选择B+树？**
- **层级更浅**：查询效率高（一般3层即可存储千万级数据）
- **范围查询优秀**：叶子节点形成链表，便于范围扫描
- **磁盘IO少**：非叶子节点只存索引，叶子节点存数据

**对比其他结构**：
- Hash：O(1)查询，但不支持范围查询
- B树：非叶子节点也存数据，层级更深

---

### 5. 什么是聚簇索引和非聚簇索引？

**参考答案**：

**聚簇索引（主键索引）**：
- 叶子节点存储完整行数据
- 一个表只能有一个聚簇索引
- 通常是主键索引

**非聚簇索引（二级索引）**：
- 叶子节点存储主键值
- 一个表可以有多个
- 查询需要回表（先查二级索引获取主键，再查聚簇索引获取完整数据）

---

### 6. 什么是回表？如何优化？

**参考答案**：

**回表**：通过二级索引查询时，需要回到主键索引获取完整数据的过程。

**优化方案**：
1. **覆盖索引**：将查询字段都包含在索引中
2. **使用主键查询**：避免二级索引
3. **联合索引**：创建包含所有查询字段的复合索引

---

### 7. 复合索引的最左前缀原则？

**参考答案**：

**最左前缀原则**：查询必须从复合索引的最左侧列开始。

**示例**：索引 `INDEX(name, age, city)`

| SQL | 是否使用索引 | 说明 |
|-----|------------|------|
| WHERE name='张三' | ✅ | 使用name |
| WHERE name='张三' AND age=20 | ✅ | 使用name, age |
| WHERE age=20 AND city='北京' | ❌ | 跳过了最左列 |
| WHERE name='张三' AND city='北京' | ✅ | 使用name（跳跃city） |

---

### 8. 哪些场景会导致索引失效？

**参考答案**：

1. **使用函数**
   ```sql
   -- 索引失效
   SELECT * FROM users WHERE YEAR(create_time) = 2024;
   -- 正确写法
   SELECT * FROM users WHERE create_time >= '2024-01-01';
   ```

2. **LIKE以%开头**
   ```sql
   -- 索引失效
   SELECT * FROM users WHERE name LIKE '%张';
   -- 可以使用索引
   SELECT * FROM users WHERE name LIKE '张%';
   ```

3. **OR连接条件**
   ```sql
   -- 索引可能失效
   SELECT * FROM users WHERE name='张三' OR age=20;
   ```

4. **类型转换**
   ```sql
   -- 字符串字段传数字，索引失效
   SELECT * FROM users WHERE phone = 13800138000;
   ```

5. **不等于（!=、<>）**
   ```sql
   SELECT * FROM users WHERE status != 1;
   ```

6. **IS NULL**
   - 索引不包含NULL值
   - 使用IS NULL可能不走索引

---

## SQL优化题

### 9. 如何分析慢查询？

**参考答案**：

**1. 开启慢查询日志**
```sql
-- 查看慢查询配置
SHOW VARIABLES LIKE 'slow_query%';

-- 设置慢查询阈值（单位：秒）
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
```

**2. 使用EXPLAIN分析执行计划**
```sql
EXPLAIN SELECT * FROM users WHERE name = '张三';
```

**关键指标**：
- **type**：访问类型（ALL < index < range < ref < eq_ref < const）
- **key**：实际使用的索引
- **rows**：扫描行数
- **Extra**：额外信息（Using filesort、Using temporary需要优化）

**3. 使用Profile分析**
```sql
SET profiling = 1;
SELECT * FROM users WHERE name = '张三';
SHOW PROFILE;
```

---

### 10. 如何优化深分页？

**参考答案**：

**问题SQL**：
```sql
-- 越往后翻页越慢
SELECT * FROM orders ORDER BY id LIMIT 1000000, 10;
```

**优化方案**：

**方案1：使用子查询**
```sql
SELECT * FROM orders
WHERE id >= (
  SELECT id FROM orders ORDER BY id LIMIT 1000000, 1
)
ORDER BY id LIMIT 10;
```

**方案2：记录上次最大ID**
```sql
-- 第一次
SELECT * FROM orders ORDER BY id LIMIT 10;

-- 第二次（使用上次返回的最大ID）
SELECT * FROM orders WHERE id > {last_max_id} ORDER BY id LIMIT 10;
```

---

## 实战场景题

### 11. 如何设计一个订单表的索引？

**参考答案**：

**典型查询场景**：
```sql
-- 1. 根据用户ID查询订单
SELECT * FROM orders WHERE user_id = ? ORDER BY create_time DESC LIMIT 20;

-- 2. 根据状态查询
SELECT * FROM orders WHERE status = ? ORDER BY create_time DESC;

-- 3. 统计用户订单数量
SELECT COUNT(*) FROM orders WHERE user_id = ?;
```

**索引设计**：
```sql
-- 主键
PRIMARY KEY (id)

-- 用户订单索引（覆盖索引）
INDEX idx_user_time_status (user_id, create_time, status)

-- 状态索引
INDEX idx_status_create (status, create_time)
```

**注意**：
- user_id作为最左列
- create_time支持排序
- status作为过滤条件

---

**更新时间**：2026年2月 | **版本**：v1.0
