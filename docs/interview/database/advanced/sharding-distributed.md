---
title: 分库分表与分布式事务面试题
---

# 分库分表与分布式事务面试题

> **难度等级**：⭐⭐⭐⭐ | **出现频率**：80% | **建议用时**：50分钟

## 分库分表题

### 1. 什么情况下需要分库分表？

**参考答案**：

**性能指标**：
- 单表数据量超过 **1000万**
- 单库数据量超过 **5000万**
- 查询响应时间超过阈值
- 数据库连接数不足
- 磁盘IO压力大

**业务指标**：
- 业务数据快速增长
- 需要水平扩展

**分库分表不是银弹**，先考虑：
- 索引优化
- 读写分离
- 缓存优化
- 表结构优化

---

### 2. 垂直分库与水平分库区别？

**参考答案**：

**垂直分库**：
- 按**业务模块**拆分
- 例：用户库、订单库、商品库
- **优点**：业务清晰、便于维护
- **缺点**：跨库JOIN困难

**垂直分表**：
- 按**字段**拆分
- 例：用户基本信息表、用户扩展信息表
- **适用**：表字段多、冷热数据分离

**水平分库**：
- 按**数据行**拆分到不同库
- 例：用户0-100万在库1，100-200万在库2
- **优点**：解决单库性能瓶颈

**水平分表**：
- 按**数据行**拆分到同一库的不同表
- 例：user_0、user_1、user_2
- **优点**：单表数据量可控

---

### 3. 分库分表策略有哪些？

**参考答案**：

**策略1：范围分片**
```java
// 按ID范围
db1: user_id 0-100万
db2: user_id 100-200万
db3: user_id 200-300万
```
- ✅ 优点：范围查询快
- ❌ 缺点：数据分布不均

**策略2：Hash分片**
```java
// Hash取模
int dbIndex = userId % dbCount;
int tableIndex = userId % tableCount;

// 示例：userId=123, dbCount=2, tableCount=4
// dbIndex = 123 % 2 = 1 (db1)
// tableIndex = 123 % 4 = 3 (user_3)
// 路由：db1.user_3
```
- ✅ 优点：数据均匀
- ❌ 缺点：扩容需迁移数据

**策略3：一致性Hash**
```java
// 虚拟节点解决扩容问题
// 32个虚拟节点映射到2个物理库
int virtualNode = hash(userId) % 32;
int dbIndex = virtualNode / 16; // 映射到物理库
```
- ✅ 优点：最小化迁移数据
- ✅ 应用：Cassandra、DynamoDB

---

### 4. 分库分表后如何分页？

**参考答案**：

**方案1：在每个分表分页后合并**
```java
// 查询每个分表
List<Order> list = new ArrayList<>();
for (int i = 0; i < tableCount; i++) {
    List<Order> part = queryFromTable(i, pageNum, pageSize);
    list.addAll(part);
}

// 内存排序
Collections.sort(list);

// 截取
return list.subList(0, pageSize);
```
- ❌ 问题：内存溢出、性能差

**方案2：二次查询法**
```java
// 第一次：查询每表的count
List<Long> counts = new ArrayList<>();
for (int i = 0; i < tableCount; i++) {
    counts.add(countFromTable(i));
}

// 计算总数和偏移量
long total = sum(counts);
int offset = (pageNum - 1) * pageSize;

// 第二次：定位到具体表再查询
// ...
```
- ✅ 性能较好
- ❌ 实现复杂

**方案3：禁止跳页 + 使用游标**
```java
// 使用上次查询的最大ID作为游标
SELECT * FROM orders
WHERE id > {last_max_id}
ORDER BY id
LIMIT 100;
```
- ✅ 推荐：深分页最佳实践
- ✅ 避免 OFFSET 扫描

---

### 5. 如何保证全局唯一ID？

**参考答案**：

**方案1：数据库自增（步长）**
```java
// db1: 1, 3, 5, 7... (步长2，起始1)
// db2: 2, 4, 6, 8... (步长2，起始2)
```
- ❌ 缺点：扩容麻烦

**方案2：UUID**
```java
String id = UUID.randomUUID().toString();
```
- ❌ 缺点：无序、索引性能差、太长

**方案3：雪花算法（Snowflake）**
```
结构：1位符号位 + 41位时间戳 + 10位机器ID + 12位序列号
     0        | 1234567890   | 1023      | 4095
```
- ✅ 优点：趋势递增、性能高、不依赖DB
- ✅ 推荐：Twitter开源，广泛使用

**方案4：号段模式**
```java
// 从数据库获取号段
db.allocateSegment(1000); // 返回1000-1999

// 本地内存生成
long id = atomicIncrement();
```
- ✅ 优点：性能好
- ✅ 应用：美团Leaf

---

### 6. 分库分表后如何扩容？

**参考答案**：

**问题**：原分2库，扩容到4库，数据如何迁移？

**方案1：停服迁移**
- 业务停止
- 数据导出、重新分配、导入
- 修改路由配置
- ❌ 缺点：影响业务

**方案2：双写迁移**
```
1. 新库上线，开始双写
2. 迁移历史数据到新库
3. 读逐渐切到新库
4. 下线旧库
```
- ✅ 优点：平滑迁移
- ✅ 推荐：生产环境

**方案3：一致性Hash（虚拟节点）**
- 新增虚拟节点
- 只迁移部分数据
- 最小化迁移影响

---

## 分布式事务题

### 7. CAP理论和BASE理论？

**参考答案**：

**CAP理论**：
- **C（Consistency）一致性**：所有节点数据一致
- **A（Availability）可用性**：每个请求都能响应
- **P（Partition tolerance）分区容错性**：网络分区时仍能工作

**只能同时满足两个**：
- CP：一致性 + 分区容错（如：Zookeeper、HBase）
- AP：可用性 + 分区容错（如：Cassandra、DynamoDB）
- CA：一致性 + 可用性（无分区时，如：单机MySQL）

**BASE理论**：
- **BA（Basically Available）基本可用**：允许短暂不可用
- **S（Soft state）软状态**：数据可以不同步
- **E（Eventually consistent）最终一致性**：最终数据一致

---

### 8. 分布式事务解决方案对比？

**参考答案**：

| 方案 | 一致性 | 可用性 | 实现复杂度 | 适用场景 |
|-----|--------|--------|----------|---------|
| **2PC** | 强一致 | 低（阻塞） | 简单 | 传统数据库 |
| **TCC** | 最终一致 | 高 | 中等 | 金融、支付 |
| **Saga** | 最终一致 | 高 | 中等 | 长事务 |
| **本地消息表** | 最终一致 | 高 | 简单 | 异步场景 |
| **事务消息** | 最终一致 | 高 | 中等 | MQ场景 |

---

### 9. 2PC（两阶段提交）原理及问题？

**参考答案**：

**流程**：
```
阶段一：准备阶段
1. 协调者向所有参与者发送准备请求
2. 参与者执行事务但不提交
3. 参与者返回YES/NO

阶段二：提交阶段
if (所有参与者都YES) {
    协调者发送提交请求
} else {
    协调者发送回滚请求
}
```

**问题**：
1. **同步阻塞**：参与者锁定资源直到收到提交请求
2. **单点故障**：协调者故障，参与者一直等待
3. **数据不一致**：部分提交、部分回滚

**改进**：3PC（三阶段提交）增加超时机制

---

### 10. TCC事务如何实现？

**参考答案**：

**三个操作**：
- **Try**：资源检查和预留
- **Confirm**：确认执行业务
- **Cancel**：取消、释放资源

**示例：用户转账**

```java
// A账户转账100元给B账户

// Try阶段
AccountA.try(100); // 冻结100元
AccountB.try(0);   // 准备接收

// Confirm阶段（都Try成功）
AccountA.confirm(100); // 扣减100元
AccountB.confirm(100); // 增加100元

// Cancel阶段（任一Try失败）
AccountA.cancel();   // 解冻
AccountB.cancel();   // 释放准备
```

**注意点**：
- 需要实现Try、Confirm、Cancel三个接口
- 空回滚（Try失败时Cancel）
- 幂等性（重复调用Confirm/Cancel结果一致）
- 悬挂事务（Try成功未收到Confirm/Cancel，需要定时恢复）

**框架**：Seata、Hmily、ByteTCC

---

### 11. Saga事务如何设计？

**参考答案**：

**核心思想**：将长事务拆分为多个本地事务，通过补偿机制保证最终一致性。

**示例：购买商品流程**
```java
// 正向流程
T1: 扣减库存
T2: 创建订单
T3: 扣减余额
T4: 发货

// 补偿操作（正向失败时执行）
C1: 库存回补
C2: 取消订单
C3: 余额退款
C4: 取消发货
```

**执行方式**：

**方式1：编排式（Orchestration）**
```java
// Saga协调器
Saga saga = Saga.builder()
    .step("扣库存")
        .action(inventoryService::deduct)
        .compensate(inventoryService::refund)
    .step("创建订单")
        .action(orderService::create)
        .compensate(orderService::cancel)
    .build();

saga.execute();
```

**方式2：编制式（Choreography）**
- 每个服务监听事件
- 失败时发送补偿事件
- 去中心化

---

### 12. 本地消息表方案？

**参考答案**：

**适用场景**：最终一致性的异步场景

**流程**：
```java
// 1. 本地事务
@Transactional
public void order() {
    // 1.1 创建订单
    orderDao.save(order);

    // 1.2 保存消息到本地消息表
    messageDao.save(new Message(orderId, "deduct_balance"));
}

// 2. 定时任务发送消息
@Scheduled
public void sendMessage() {
    // 查询未发送消息
    List<Message> messages = messageDao.findPending();

    for (Message msg : messages) {
        try {
            // 发送到MQ
            mq.send(msg);
            // 更新状态为已发送
            messageDao.markAsSent(msg.getId());
        } catch (Exception e) {
            // 重试次数+1
            messageDao.incrementRetry(msg.getId());
        }
    }
}

// 3. 消费者处理
public void consume(Message msg) {
    try {
        // 扣减余额
        balanceService.deduct(msg.getOrderId(), msg.getAmount());
        // 发送ACK
        ack();
    } catch (Exception e) {
        // 死信队列重试
    }
}
```

**注意点**：
- 本地消息表与业务在同一事务
- 定时任务轮询发送
- 消费者幂等处理

---

## 实战场景题

### 13. 设计一个支持千万级用户的用户系统

**参考答案**：

**分库分表方案**：
```
// 按 user_id % 10 分库
// 每库再按 user_id % 10 分表
db0: user_00, user_01, ..., user_09
db1: user_00, user_01, ..., user_09
...
db9: user_00, user_01, ..., user_09
```

**索引设计**：
```sql
-- 主键
PRIMARY KEY (id)

-- user_id索引（支持登录）
UNIQUE KEY idx_user_id (user_id)

-- 手机号索引（支持手机登录）
UNIQUE KEY idx_phone (phone)

-- 复合索引（支持用户名模糊搜索）
KEY idx_name_create (username, create_time)
```

**路由层**：
```java
// 计算库表位置
int dbIndex = userId % 10;
int tableIndex = userId % 10;

String table = "user_" + tableIndex;
String db = "db" + dbIndex;

// 查询
SELECT * FROM {db}.{table} WHERE user_id = ?;
```

**优化**：
- 登录使用user_id直接路由
- 用户名搜索：广播所有库或使用Elasticsearch
- 热点用户：单独处理或缓存

---

**更新时间**：2026年2月 | **版本**：v1.0
