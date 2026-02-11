---
title: 事务与锁机制面试题
---

# 事务与锁机制面试题

> **难度等级**：⭐⭐⭐ | **出现频率**：88% | **建议用时**：30分钟

## MySQL事务题

### 1. MySQL事务隔离级别有哪些？

**参考答案**：

MySQL InnoDB支持4种隔离级别：

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 实现方式 |
|---------|-----|---------|-----|---------|
| READ UNCOMMITTED | ✅ 可能 | ✅ 可能 | ✅ 可能 | 直接读未提交数据 |
| READ COMMITTED | ❌ 避免 | ✅ 可能 | ✅ 可能 | MVCC |
| REPEATABLE READ | ❌ 避免 | ❌ 避免 | ✅ 可能 | MVCC + Gap锁 |
| SERIALIZABLE | ❌ 避免 | ❌ 避免 | ❌ 避免 | 锁读整个范围 |

**查看当前隔离级别**：
```sql
SELECT @@transaction_isolation;
-- 或
SELECT @@tx_isolation;
```

**设置隔离级别**：
```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

---

### 2. 什么是MVCC？

**参考答案**：

**MVCC（Multi-Version Concurrency Control）**：多版本并发控制

**核心思想**：
- 通过保存数据的多个版本
- 读写操作不互相阻塞
- 实现并发下的数据一致性

**InnoDB实现**：

**Read View（读视图）**：
- READ COMMITTED：只看已提交版本
- REPEATABLE READ：事务开始时的版本快照

**Undo Log（回滚日志）**：
- 存储数据的历史版本
- 用于回滚和构建Read View

**优点**：
- 读写不冲突
- 提高并发性能

**缺点**：
- 需要维护多个版本
- 占用更多空间

---

### 3. RR级别如何解决幻读？

**参考答案**：

**幻读问题**：
```sql
-- 事务1：查询
SELECT * FROM users WHERE age > 18;
-- 返回10行

-- 事务2：插入（在事务1执行期间）
INSERT INTO users (age) VALUES (20);

-- 事务1：再次查询
SELECT * FROM users WHERE age > 18;
-- 返回11行（幻读）
```

**MySQL解决方案**：Next-Key Locks

**Record Lock（记录锁）**：
- 锁住匹配的索引记录

**Gap Lock（间隙锁）**：
- 锁住记录之间的间隙
- 防止其他事务插入数据

**Next-Key Lock**：
- Record Lock + Gap Lock
- 锁住记录 + 前面的间隙

```sql
-- 示例查询（会使用Next-Key Lock）
SELECT * FROM users
WHERE id > 10 AND id < 20
FOR UPDATE;

-- 锁定范围：(10, 20] 的记录和间隙
-- 防止在这个范围内插入新记录
```

---

## MySQL锁题

### 4. MySQL有哪些锁类型？

**参考答案**：

**按锁粒度分类**：

**1. 全局锁**
```sql
-- 锁定整个数据库
FLUSH TABLES WITH READ LOCK;

-- 解锁
UNLOCK TABLES;
```

**2. 表级锁**
```sql
-- 锁定表（元数据锁）
LOCK TABLES users READ;
LOCK TABLES users WRITE;

-- 解锁
UNLOCK TABLES;
```

**3. 行级锁**
- 自动在SQL语句中加锁
- 分类：
  - **共享锁（S锁）**：读锁，允许并发读
  - **排他锁（X锁）**：写锁，独占访问

**4. 页级锁**（BDB引擎，已废弃）

---

### 5. 行锁的实现方式？

**参考答案**：

**隐式锁（自动）**：
```sql
-- 查询自动加共享锁
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;

-- 更新自动加排他锁
SELECT * FROM users WHERE id = 1 FOR UPDATE;

-- 插入时可能使用间隙锁
INSERT INTO users (name) VALUES ('张三');
```

**显式锁（手动）**：
```sql
-- 获取锁
SELECT GET_LOCK('lock_name', 10);
-- 返回1获取成功，0失败

-- 释放锁
SELECT RELEASE_LOCK('lock_name');

-- 检查锁状态
SELECT IS_FREE_LOCK('lock_name');
SELECT IS_USED_LOCK('lock_name');
```

---

### 6. 什么是间隙锁？

**参考答案**：

**间隙锁（Gap Lock）**：
- 锁定两个索引记录之间的间隙
- 防止其他事务在这个范围内插入数据

**产生场景**：
```sql
-- 假设id索引有值：1, 5, 10
SELECT * FROM users
WHERE id > 5 AND id < 10
FOR UPDATE;

-- 产生的间隙锁：
-- Gap (-∞, 1)
-- Gap (1, 5)
-- Gap (10, +∞)
-- Record Lock: id=5, id=10 (如果存在)
```

**间隙锁的作用**：
- 防止幻读
- RR隔离级别下自动使用

**注意**：
- 只在RR隔离级别下使用
- 只在唯一索引或主键上使用
---

## PostgreSQL事务题

### 7. PostgreSQL事务隔离级别有什么不同？

**参考答案**：

PostgreSQL支持Read Uncommitted到Serializable，但实际：

| 隔离级别 | PostgreSQL特点 |
|---------|--------------|
| Read Uncommitted | 等同于Read Committed |
| Read Committed | 防止脏读 |
| Repeatable Read | 快照隔离，防止不可重复读 |
| Serializable | 完全隔离，基于真正的序列化 |

**PostgreSQL特点**：
- 默认级别：Read Committed
- MVCC实现
- Serializable基于SSI（Serializable Snapshot Isolation）

---

### 8. PostgreSQL的FOR UPDATE用法？

**参考答案**：

```sql
-- 行锁（排他锁）
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;

-- 跳过锁定的行
SELECT * FROM accounts WHERE id = 1 FOR UPDATE SKIP LOCKED;

-- 共享锁
SELECT * FROM accounts WHERE id = 1 FOR SHARE;

-- NOWAIT（不等待锁）
SELECT * FROM accounts WHERE id = 1 FOR UPDATE NOWAIT;
-- 如果锁被占用，立即抛出异常

-- 行级锁 + 表级锁
SELECT * FROM accounts
WHERE id = 1
FOR UPDATE OF accounts FOR SHARE OF users;
```

---

## 死锁题

### 9. 死锁产生原因及解决方案？

**参考答案**：

**死锁产生条件**（4个条件同时满足）：
1. **互斥**：资源不能共享
2. **占有并等待**：持有资源同时等待其他资源
3. **不可抢占**：资源不能被强制抢占
4. **循环等待**：形成等待环路

**示例**：
```sql
-- 事务1
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- 持有A的锁
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- 等待B的锁

-- 事务2
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 2;  -- 持有B的锁
UPDATE accounts SET balance = balance + 100 WHERE id = 1;  -- 等待A的锁
-- 形成死锁
```

**解决方案**：

**1. 预防死锁**
- 按固定顺序访问表（从小到大）
- 一次性获取所有锁
- 缩短事务持有锁的时间
- 使用较低隔离级别

**2. 检测死锁**
```sql
-- 查看等待锁
SELECT * FROM information_schema.innodb_lock_waits;

-- 查看死锁
SHOW ENGINE INNODB STATUS;
```

**3. 处理死锁**
- 设置锁等待超时
```sql
SET innodb_lock_wait_timeout = 50; -- 秒
```
- 死锁发生时自动回滚一个事务

---

## 实战场景题

### 10. 设计一个避免死锁的转账系统

**参考答案**：

**问题**：两个账户互相转账容易死锁

**方案1：按顺序加锁**
```java
// 转账方法
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    // 总是从小到大排序
    Long lockId1 = Math.min(fromId, toId);
    Long lockId2 = Math.max(fromId, toId);

    // 按顺序加锁
    lock(lockId1);
    lock(lockId2);

    try {
        // 执行转账
        deduct(fromId, amount);
        add(toId, amount);
    } finally {
        // 按逆序释放
        unlock(lockId2);
        unlock(lockId1);
    }
}
```

**方案2：使用分布式锁**
```java
// 使用Redis作为协调者
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    String lockKey = "account:transfer:" + Math.min(fromId, toId);

    // 获取分布式锁
    tryLock(lockKey, 30);

    try {
        // 执行转账
        accountService.deduct(fromId, amount);
        accountService.add(toId, amount);
    } finally {
        // 释放锁
        unlock(lockKey);
    }
}
```

**方案3：数据库队列**
```sql
-- 使用队列表串行化转账
CREATE TABLE transfer_queue (
    id SERIAL PRIMARY KEY,
    from_id BIGINT,
    to_id BIGINT,
    amount DECIMAL(10,2),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 消费者处理
SELECT * FROM transfer_queue WHERE status = 'pending'
ORDER BY id FOR UPDATE LIMIT 1;
```

---

### 11. 如何实现乐观锁？

**参考答案**：

**方案1：版本号**
```sql
-- 添加版本号字段
ALTER TABLE products ADD COLUMN version INT DEFAULT 0;

-- 更新时检查版本
UPDATE products
SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = 5;

-- 应用层检查影响行数
if (affectedRows == 0) {
    throw new OptimisticLockException();
}
```

**方案2：时间戳**
```sql
-- 添加更新时间字段
ALTER TABLE products ADD COLUMN update_time TIMESTAMP;

-- 更新时检查时间
UPDATE products
SET stock = stock - 1, update_time = NOW()
WHERE id = 1 AND update_time = '2024-01-01 10:00:00';
```

**方案3：CAS（Compare And Swap）**
```java
// 使用Redis的CAS操作
String expectedValue = redis.get("product:1:stock");
String newValue = String.valueOf(Integer.parseInt(expectedValue) - 1);

Boolean success = redis.set("product:1:stock", newValue, "NX", "XX");
if (!success) {
    throw new OptimisticLockException();
}
```

---

**更新时间**：2026年2月 | **版本**：v1.0
