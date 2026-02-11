---
title: 分布式事务解决方案面试题
---

# 分布式事务解决方案面试题

> **难度等级**：⭐⭐⭐⭐ | **出现频率**：75% | **建议用时**：40分钟

## 理论基础题

### 1. 什么是CAP理论？

**参考答案**：

**CAP定理**：分布式系统不可能同时满足以下三个特性：

**C（Consistency）一致性**
- 所有节点在同一时间看到相同的数据
- 强一致性要求：写入后，所有节点立即可读到最新值

**A（Availability）可用性**
- 每个请求都能得到响应
- 但不保证响应的是最新数据

**P（Partition tolerance）分区容错性**
- 系统在网络分区时仍能正常工作

**CAP三选二**：
- **CP + P**：放弃可用性（如：ZooKeeper、HBase）
- **AP + P**：放弃强一致性（如：Cassandra、DynamoDB）
- **CA + P**：无分区时才可（如：单机MySQL）

**现实选择**：
- 大多数系统选择AP（优先保证可用）
- 通过业务逻辑保证最终一致性

---

### 2. 什么是BASE理论？

**参考答案**：

**BASE**： basically Available, Soft state, Eventually consistent

**BA（Basically Available）基本可用**
- 系统允许暂时不可用
- 不要求100%可用性

**S（Soft state）软状态**
- 数据可以中间状态
- 不要求强一致性

**E（Eventually consistent）最终一致性**
- 系统保证最终数据一致
- 给定时间窗口内数据会达到一致

**ACID vs BASE**：
- ACID：强一致性，适合单机事务
- BASE：最终一致性，适合分布式场景

---

## 2PC题

### 3. 2PC的两个阶段是什么？

**参考答案**：

**阶段一：准备阶段（Prepare Phase）**
```
协调者 -> 参与者A: "准备事务？"
协调者 -> 参与者B: "准备事务？"
参与者A -> 协调者: "YES"
参与者B -> 协调者: "YES"
```
- 参与者执行事务操作
- 写入undo/redo日志
- 锁定资源
- 返回YES/NO

**阶段二：提交阶段（Commit Phase）**
```
if (所有参与者都YES) {
    协调者 -> 所有参与者: "提交！"
} else {
    协调者 -> 所有参与者: "回滚！"
}
```

---

### 4. 2PC有哪些问题？

**参考答案**：

**1. 同步阻塞**
- 参与者在准备阶段阻塞等待
- 资源长时间锁定

**2. 单点故障**
- 协调者故障导致所有参与者阻塞
- 参与者无法释放资源

**3. 数据不一致**
- 部分提交、部分回滚
- 协调者发送commit但部分节点失败

**4. 分区容错性差**
- 网络分区时2PC难以工作

---

### 5. 3PC如何改进2PC？

**参考答案**：

**3PC（Three-Phase Commit）**增加超时机制：

**阶段0：CanCommit**
```
协调者 -> 参与者: "可以提交吗？"
参与者 -> 协调者: "YES / NO / ABORT"
```

**超时机制**：
- 如果协调者超时，参与者自动提交/中止
- 如果参与者超时，协调者自动中止

**改进点**：
- 减少阻塞时间
- 增加容错能力

**适用**：
- 数据库内部XA事务
- 仍存在单点问题

---

## TCC题

### 6. TCC三个操作如何实现？

**参考答案**：

**TCC模式**：Try-Confirm-Cancel

**1. Try阶段**：资源检查和预留
```java
public boolean try(BusinessActionContext context) {
    // 检查资源是否充足
    Account account = accountDao.findByUserId(userId);
    if (account.getBalance().compareTo(amount) < 0) {
        return false; // 余额不足
    }

    // 冻结资源
    account.setFrozenBalance(amount);
    accountDao.update(account);
    return true;
}
```

**2. Confirm阶段**：确认执行业务
```java
public boolean confirm(BusinessActionContext context) {
    Account account = accountDao.findByUserId(userId);

    // 真实扣减
    account.setBalance(account.getBalance() - account.getFrozenBalance());
    account.setFrozenBalance(BigDecimal.ZERO);
    accountDao.update(account);
    return true;
}
```

**3. Cancel阶段**：取消、释放资源
```java
public boolean cancel(BusinessActionContext context) {
    Account account = accountDao.findByUserId(userId);

    // 释放冻结
    account.setFrozenBalance(BigDecimal.ZERO);
    accountDao.update(account);
    return true;
}
```

---

### 7. TCC如何保证幂等性？

**参考答案**：

**问题**：重复调用Confirm/Cancel导致数据错误

**解决方案1：事务ID**
```java
public interface TccService {
    @Transactional
    boolean try(@BusinessActionContext String txId);

    boolean confirm(@BusinessActionContext String txId);

    boolean cancel(@BusinessActionContext String txId);
}

// 执行前检查
TccRecord record = tccDao.findByTxId(txId);
if (record != null && record.getStatus() == Status.CONFIRMED) {
    return true; // 已执行，幂等
}
```

**解决方案2：去重表**
```sql
CREATE TABLE tcc_transaction_log (
    tx_id VARCHAR(64) PRIMARY KEY,
    action_type VARCHAR(20),  -- Try/Confirm/Cancel
    status VARCHAR(20),
    create_time TIMESTAMP DEFAULT NOW(),
    UNIQUE KEY uk_tx_action (tx_id, action_type)
);

-- Confirm前插入
INSERT INTO tcc_transaction_log (tx_id, action_type, status)
VALUES ('123', 'Confirm', 'processing');

-- 重复插入失败则幂等
```

**解决方案3：Token机制**
```java
// Try阶段返回token
String token = UUID.randomUUID().toString();
redis.setex("tcc:" + txId, token, 3600);

// Confirm阶段验证token
String savedToken = redis.get("tcc:" + txId);
if (!token.equals(savedToken)) {
    throw new TccException("Token不匹配");
}
```

---

### 8. TCC空回滚和悬挂如何处理？

**参考答案**：

**空回滚（Hang）**：
- Try成功但未收到Confirm/Cancel
- 需要定时恢复
- 解决：定时任务扫描超时事务

**悬挂（Suspense）**：
- Cancel先于Try执行
- 需要拒绝Cancel
- 解决：记录Try状态，Cancel时检查

**解决方案：事务记录表**
```sql
CREATE TABLE tcc_transaction (
    tx_id VARCHAR(64) PRIMARY KEY,
    status VARCHAR(20),  -- TRYING/CONFIRMED/CANCELLED
    try_time TIMESTAMP,
    confirm_time TIMESTAMP,
    cancel_time TIMESTAMP,
    timeout INT
);

-- 定时恢复
SELECT * FROM tcc_transaction
WHERE status = 'TRYING'
AND try_time < NOW() - INTERVAL '1' MINUTE;

-- 拒绝悬挂
SELECT * FROM tcc_transaction
WHERE status = 'CANCELLED'
AND try_time IS NULL;
```

---

## Saga题

### 9. Saga如何定义？

**参考答案**：

**Saga**：长事务拆分为多个本地事务，通过补偿机制保证最终一致性

**两种模式**：

**1. 编排式（Choreography）**
- 每个服务监听事件
- 去中心化
- 适合复杂业务流程

**2. 协调式（Orchestration）**
- 中央协调器管理流程
- 实现简单
- 容易追踪和调试

---

### 10. Saga补偿策略有哪些？

**参考答案**：

**1. 前向恢复（Forward Recovery）**
```
失败的Saga: T1 -> T2 -> T3(失败) -> T4
恢复策略: 重试T3 -> T3 -> T4
```
- 重试失败的事务
- 如果可重试（如超时），继续执行

**2. 后向恢复（Backward Recovery）**
```
失败的Saga: T1 -> T2 -> T3(失败) -> T4
恢复策略: 补偿T2 -> 补偿T2 -> 补偿T1 -> 回到起点
```
- 执行已成功事务的补偿操作
- 回到初始状态

**3. 补偿事务规则**：
- 必须是幂等的
- 必须最终一致
- 失败时需要支持重试

---

### 11. Saga如何处理并发？

**参考答案**：

**问题**：同一资源被多个Saga同时修改

**解决方案1：乐观锁**
```sql
-- version字段
UPDATE accounts
SET balance = balance - 100, version = version + 1
WHERE user_id = 1 AND version = 5;

-- 检查影响行数
if (affectedRows == 0) {
    throw new ConcurrentException();
}
```

**解决方案2：悲观锁**
```java
// 分布式锁
String lockKey = "account:lock:" + userId;
if (!redis.setnx(lockKey, "1", 30)) {
    throw new LockException();
}

try {
    // 执行业务
} finally {
    redis.del(lockKey);
}
```

**解决方案3：业务排序**
```java
// 确保同一资源的操作按顺序执行
// 使用队列或消息队列串行化
messageQueue.send(new AccountOperation(userId, amount));
```

---

## 本地消息表题

### 12. 本地消息表如何保证一致性？

**参考答案**：

**方案流程**：
```
1. 本地事务：业务操作 + 保存消息
2. 定时任务：扫描待发送消息
3. 发送消息：投递到MQ
4. 消费者：执行业务
5. 更新状态：消息已消费
```

**实现**：
```sql
-- 1. 业务表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    amount DECIMAL(10,2)
);

-- 2. 本地消息表
CREATE TABLE local_message (
    id BIGINT PRIMARY KEY,
    topic VARCHAR(100),
    content TEXT,
    status VARCHAR(20),  -- PENDING/SENT/CONSUMED
    send_time TIMESTAMP,
    consume_time TIMESTAMP,
    retry_count INT DEFAULT 0
);

-- 3. 原子操作
@Transactional
public void order(Order order) {
    // 保存订单
    orderDao.save(order);

    // 保存本地消息（同一事务）
    LocalMessage msg = new LocalMessage(
        "deduct-balance",
        JSON.toJSONString(order),
        "PENDING"
    );
    localMessageDao.save(msg);
}

-- 4. 定时任务
@Scheduled(fixedRate = 1000)
public void sendMessage() {
    List<LocalMessage> messages = localMessageDao.findPending();

    for (LocalMessage msg : messages) {
        try {
            // 发送到MQ
            mq.send(msg.getTopic(), msg.getContent());

            // 更新状态
            msg.setStatus("SENT");
            msg.setSendTime(new Date());
            localMessageDao.update(msg);
        } catch (Exception e) {
            // 重试+1
            msg.setRetryCount(msg.getRetryCount() + 1);
            localMessageDao.update(msg);
        }
    }
}

-- 5. 消费者
@RabbitListener(queues = "deduct-balance")
public void consume(String message) {
    Order order = JSON.parseObject(message, Order.class);

    // 执行扣减
    accountService.deduct(order.getUserId(), order.getAmount());

    // 标记消息已消费
    localMessageDao.markAsConsumed(msg.getId());
}
```

**优点**：
- 最终一致
- 可靠性高（本地事务保证）
- 解耦业务

**缺点**：
- 延迟较高（定时任务轮询）
- 需要额外存储

---

## 实战场景题

### 13. 设计一个跨库转账系统

**参考答案**：

**问题**：用户A在db1，用户B在db2，A转账给B

**方案1：TCC事务**
```java
@Service
public class TransferService {

    @TccTransaction
    public void transfer(String fromUserId, String toUserId, BigDecimal amount) {
        // Try阶段：冻结A账户
        accountA.freeze(fromUserId, amount);
        // B账户无需操作（由Confirm创建）
    }

    public void confirm(String fromUserId, String toUserId, BigDecimal amount) {
        // Confirm阶段：A扣减，B增加
        accountA.deduct(fromUserId, amount);
        accountB.add(toUserId, amount);
    }

    public void cancel(String fromUserId, String toUserId, BigDecimal amount) {
        // Cancel阶段：释放A的冻结
        accountA.unfreeze(fromUserId, amount);
    }
}
```

**方案2：Saga事务**
```java
// Saga步骤
Step1: 冻结A账户
Step2: 创建B账户（如不存在）
Step3: 增加B账户
Step4: 扣减A账户
Step5: 释放A冻结

// 补偿操作
Compensate1: 释放A冻结
Compensate2: 扣减B账户
Compensate3: 删除B账户
Compensate4: 增加A账户
```

**方案3：本地消息表**
```
db1事务：
1. 创建转账记录（status=PENDING）
2. 保存本地消息（扣减A余额）

db2事务：
消费消息：
1. 增加B余额
```

---

**更新时间**：2026年2月 | **版本**：v1.0
