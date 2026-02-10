# 消息队列面试题

## 本章导读

消息队列是分布式系统中的重要组件，广泛应用于异步处理、系统解耦、流量削峰等场景。本章将涵盖消息队列的核心概念、常见中间件的使用以及实战面试题。

## 核心概念

### 1. 什么是消息队列？

**消息队列（Message Queue）** 是一种进程间通信或服务间通信的方式，生产者将消息发送到队列，消费者从队列中获取消息进行处理。

**核心特点**：
- **异步处理**：发送方不需要等待接收方处理
- **解耦**：生产者和消费者无需直接连接
- **削峰填谷**：缓解突发流量压力

### 2. 消息队列的应用场景

**1. 异步处理**
```
用户注册 → 发送消息 → [消息队列]
                              ↓
                          发送邮件、发送短信、初始化用户数据
```

**2. 系统解耦**
```
订单系统 → [消息队列] → 库存系统
                    → 支付系统
                    → 物流系统
```

**3. 流量削峰**
```
秒杀请求 → [消息队列] → 订单处理（按处理能力消费）
```

**4. 日志处理**
```
应用日志 → [消息队列] → 日志收集系统 → 存储/分析
```

---

## RabbitMQ 面试题

### 基础概念

**Q1: RabbitMQ 的基本组件是什么？**

**A:** RabbitMQ 的核心组件包括：

- **Producer（生产者）**：发送消息的应用
- **Consumer（消费者）**：接收消息的应用
- **Queue（队列）**：存储消息的缓冲区
- **Exchange（交换机）**：接收生产者消息并路由到队列
- **Binding（绑定）**：交换机和队列之间的关联关系
- **Routing Key（路由键）**：交换机路由消息的规则
- **Broker（消息代理）**：RabbitMQ 服务器
- **Virtual Host（虚拟主机）**：隔离不同应用的空间

**Q2: RabbitMQ 的消息投递模式有哪些？**

**A:** 主要有以下几种模式：

1. **Direct Exchange（直连交换机）**
   - 精确匹配路由键
   - 一对一投递

2. **Fanout Exchange（扇出交换机）**
   - 广播消息到所有绑定队列
   - 忽略路由键

3. **Topic Exchange（主题交换机）**
   - 模式匹配路由键
   - 支持通配符：`*`（一个词）、`#`（零个或多个词）

4. **Headers Exchange（头交换机）**
   - 根据消息头属性匹配
   - 性能较低，使用较少

### 消息可靠性

**Q3: 如何保证消息不丢失？**

**A:** 需要从三个层面保证：

**1. 生产者确认**
```java
// 开启发布确认
channel.confirmSelect();

// 发布消息
channel.basicPublish("", queueName, null, message);

// 等待确认
if (!channel.waitForConfirms()) {
    // 处理失败
}
```

**2. 队列持久化**
```java
// 声明持久化队列
boolean durable = true;
channel.queueDeclare(queueName, durable, false, false, null);

// 发送持久化消息
MessageProperties.PERSISTENT_TEXT_PLAIN
```

**3. 消费者确认**
```java
// 手动确认模式
channel.basicConsume(queueName, false, consumer);

// 处理成功后确认
channel.basicAck(deliveryTag, false);

// 处理失败拒绝
channel.basicNack(deliveryTag, false, true);  // requeue=true
```

**Q4: 如何避免消息重复消费？**

**A:** 实现幂等性：

**1. 唯一ID机制**
```java
// 生产者发送消息时生成唯一ID
String messageId = UUID.randomUUID().toString();
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .messageId(messageId)
    .build();

// 消费者使用Redis记录已处理的消息ID
if (redis.setnx("processed:" + messageId, 1)) {
    // 处理消息
}
```

**2. 数据库唯一约束**
```java
// 使用唯一约束防止重复
INSERT INTO orders (id, amount) VALUES (?, ?)
ON DUPLICATE KEY UPDATE status = status;
```

**3. 状态机**
```java
// 订单状态流转
enum OrderStatus {
    CREATED, PAID, SHIPPED, COMPLETED
}
// 检查状态是否可以执行当前操作
```

### 性能优化

**Q5: RabbitMQ 如何提高吞吐量？**

**A:** 优化策略：

**1. 批量发送**
```java
// 批量确认
channel.confirmSelect();
for (int i = 0; i < MESSAGE_COUNT; i++) {
    channel.basicPublish("", queueName, null, message);
}
channel.waitForConfirms();
```

**2. 消费者批量确认**
```java
// 每处理N条消息确认一次
int batchSize = 100;
channel.basicQos(batchSize);
```

**3. 多队列并发**
```java
// 创建多个队列，增加消费者并行度
for (int i = 0; i < 10; i++) {
    String queueName = "queue_" + i;
    channel.queueDeclare(queueName, true, false, false, null);
}
```

**4. 连接池**
```java
// 使用连接池管理Connection
Connection connection = connectionFactory.newConnection();
Channel channel = connection.createChannel();
```

---

## Kafka 面试题

### 基础概念

**Q6: Kafka 的核心概念是什么？**

**A:** Kafka 核心组件：

- **Topic（主题）**：消息的分类
- **Partition（分区）**：Topic 的拆分，实现并行处理和扩展
- **Broker（代理）**：Kafka 服务器
- **Producer（生产者）**：发送消息到 Kafka
- **Consumer（消费者）**：从 Kafka 读取消息
- **Consumer Group（消费者组）**：消费者的逻辑分组
- **Offset（偏移量）**：消息在分区中的位置
- **Zookeeper**：协调管理（Kafka 3.x 后可用 KRaft 模式）

**Q7: Kafka 与 RabbitMQ 的区别？**

**A:**

| 特性 | RabbitMQ | Kafka |
|------|----------|-------|
| **消息模型** | 智能队列，支持复杂路由 | 日志存储，流式处理 |
| **吞吐量** | 万级 | 百万级 |
| **延迟** | 微秒级 | 毫秒级 |
| **可靠性** | 高（ACK机制） | 高（副本机制） |
| **消息回溯** | 不支持 | 支持重置offset |
| **消息堆积** | 内存限制，受限 | 磁盘存储，海量 |
| **使用场景** | 业务解耦、异步任务 | 日志收集、流处理、大数据 |

**选择建议**：
- 业务系统解耦 → RabbitMQ
- 日志收集、大数据 → Kafka
- 需要消息回溯 → Kafka
- 低延迟要求 → RabbitMQ

### 分区与副本

**Q8: Kafka 的分区机制是什么？**

**A:**

**1. 分区的作用**
- **并行处理**：多个分区可以并行读写
- **横向扩展**：单个 Topic 分布在多个 Broker
- **提高吞吐量**：增加分区数提高并发度

**2. 分区策略**
```java
// 指定分区
producer.send(new ProducerRecord<>(topic, 0, key, value));

// 基于Key哈希（相同Key进入同一分区）
producer.send(new ProducerRecord<>(topic, key, value));

// 轮询分区（Round-Robin）
producer.send(new ProducerRecord<>(topic, value));
```

**3. 分区数选择**
- 分区数 = max(目标吞吐量 / 单分区吞吐量, 消费者数量)
- 过多：增加内存和延迟
- 过少：限制吞吐量

**Q9: Kafka 的副本机制如何保证高可用？**

**A:**

**1. 副本类型**
- **Leader**：处理读写请求
- **Follower**：从 Leader 同步数据，不处理客户端请求

**2. 同步方式**
- **同步复制**：Leader 等待所有 ISR 确认
- **异步复制**：Leader 不等待 Follower 确认

**3. ISR（In-Sync Replicas）**
- 与 Leader 保持同步的副本集合
- 只有 ISR 中的副本才有资格成为新 Leader

**4. 配置参数**
```properties
# 副本数量
replication.factor=3

# 最小同步副本数
min.insync.replicas=2

# 不一致Leader选举
unclean.leader.election.enable=false
```

### 消费者组

**Q10: Kafka 消费者组的重平衡机制是什么？**

**A:**

**1. 重平衡触发条件**
- 消费者加入或退出
- 分区数变化
- 消费者崩溃

**2. 分区分配策略**
- **Range**：按范围分配（默认）
- **RoundRobin**：轮询分配
- **Sticky**：尽可能保持原有分配

**3. 重平衡过程**
```
1. 消费者停止消费
2. 协调器（GroupCoordinator）计算新分配方案
3. 消费者加入新分配的分区
4. 消费者继续消费
```

**4. 避免频繁重平衡**
```properties
# 心跳超时
session.timeout.ms=30000

# 最大处理时间
max.poll.interval.ms=300000
```

---

## 常见场景题

**Q11: 订单超时未支付如何取消？**

**A:** 使用延迟队列：

**方案1：RabbitMQ 死信队列 + TTL**
```java
// 设置消息TTL
Map<String, Object> args = new HashMap<>();
args.put("x-message-ttl", 30000);  // 30分钟
args.put("x-dead-letter-exchange", "dlx");
channel.queueDeclare("order.queue", true, false, false, args);
```

**方案2：Redis 定时扫描**
```java
// 订单创建时记录到ZSet
redis.zadd("order:timeout", System.currentTimeMillis() + 1800000, orderId);

// 定时任务扫描
Set<String> expiredOrders = redis.zrangeByScore("order:timeout", 0, System.currentTimeMillis());
for (String orderId : expiredOrders) {
    cancelOrder(orderId);
}
```

**方案3：Kafka 时间轮**
```java
// 使用Kafka时间轮实现延迟任务
```

**Q12: 如何保证消息顺序性？**

**A:**

**1. 单分区单消费者**
```java
// 相同业务键发送到同一分区
String partitionKey = orderId.hashCode() % partitionCount;
producer.send(new ProducerRecord<>(topic, partitionKey, message));
```

**2. 消费者单线程处理**
```java
// 消费者内部单线程处理队列
BlockingQueue<Message> queue = new LinkedBlockingQueue<>();
// 业务处理从队列取消息
```

**Q13: 消息队列如何处理事务消息？**

**A:** 本地消息表 + 定时任务：

**流程：**
```
1. 开启数据库事务
2. 执行业务操作
3. 插入消息记录到本地消息表（status=PENDING）
4. 提交事务
5. 定时任务扫描PENDING消息，发送到MQ
6. 收到ACK后更新status=SENT
```

**Kafka 事务（仅支持Kafka）：**
```java
// 初始化事务
producer.initTransactions();

try {
    producer.beginTransaction();
    // 发送消息
    producer.send(new ProducerRecord<>(topic, message));
    // 提交事务
    producer.commitTransaction();
} catch (Exception e) {
    producer.abortTransaction();
}
```

---

## 面试真题

**Q14: [美团] 如何设计一个秒杀系统的消息队列架构？**

**A:**

**1. 架构设计**
```
用户请求 → [网关限流] → [Redis预扣库存] → [消息队列] → [订单服务]
                                          ↓
                                    [MQ消息持久化]
```

**2. 关键点**
- **削峰**：MQ 缓冲大量请求
- **异步**：快速返回，异步处理订单
- **可靠**：消息持久化，不丢失
- **监控**：实时监控队列堆积

**3. 优化**
- Redis 预扣库存减少 MQ 压力
- 消息批量处理提高吞吐
- 分片队列提高并发度

**Q15: [阿里] Kafka 消息堆积如何处理？**

**A:**

**1. 排查问题**
- 检查消费者性能（CPU、内存、IO）
- 检查是否有慢查询、外部调用阻塞
- 查看消费者日志是否有异常

**2. 优化方案**

**临时方案：**
- 增加消费者实例（不超过分区数）
- 增加分区数 + 增加消费者
- 丢弃部分非关键消息

**根本解决：**
- 优化消费者处理逻辑
- 批量处理消息
- 异步处理外部调用
- 数据库批量写入

**3. 监控告警**
```java
// 监控 Lag
kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group my-group
```

---

## 总结

### 关键要点

1. **消息队列核心价值**：异步、解耦、削峰
2. **RabbitMQ**：适合业务解耦、可靠性要求高的场景
3. **Kafka**：适合大数据、日志收集、流处理场景
4. **可靠性保障**：生产者确认 + 队列持久化 + 消费者确认
5. **幂等性**：通过唯一ID或状态机实现
6. **顺序性**：单分区单消费者
7. **高可用**：副本机制 + ISR
8. **性能优化**：批量、并发、连接池

### 面试准备

- ✅ 理解核心概念和应用场景
- ✅ 掌握 RabbitMQ 和 Kafka 的区别
- ✅ 熟悉消息可靠性保障机制
- ✅ 了解常见问题的解决方案
- ✅ 能分析实际项目中的 MQ 使用

---

**最后更新：2026 年 2 月**
**版本：v1.0**
