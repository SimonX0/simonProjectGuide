# 分布式系统面试题

## 本章导读

分布式系统是Java架构师必须掌握的核心知识，涵盖了微服务架构中的关键技术点。本章将重点考察分布式事务、分布式锁、服务注册发现、配置中心等内容。

## 核心概念

### 1. 什么是分布式系统？

**分布式系统** 是一组独立的计算机，通过网络通信和协调，共同完成一个共同目标的系统。

**核心特点**：
- **分布性**：多台计算机物理分离
- **对等性**：无中心节点，节点地位平等
- **并发性**：多节点并发处理
- **无全局时钟**：无法通过时钟判断事件顺序
- **故障独立性**：部分节点故障不影响整体

### 2. CAP 理论

**Q1: 什么是 CAP 理论？**

**A:** CAP 理论指出分布式系统无法同时满足以下三个特性：

- **Consistency（一致性）**：所有节点同时看到相同的数据
- **Availability（可用性）**：系统持续提供服务
- **Partition Tolerance（分区容错性）**：系统在网络分区时仍能运行

**CAP 权衡**：
- CA：单机系统（非分布式）
- CP：强一致性，牺牲可用性（如：HBase、MongoDB）
- AP：高可用性，牺牲一致性（如：Cassandra、CouchDB）

**Q2: BASE 理论是什么？**

**A:** BASE 是 CAP 中 AP 的延伸：

- **Basically Available（基本可用）**：允许部分失败
- **Soft State（软状态）**：状态随时间变化
- **Eventually Consistent（最终一致性）**：最终一致

---

## 分布式事务

### 1. 两阶段提交（2PC）

**Q3: 什么是两阶段提交？**

**A:** 两阶段提交是经典的分布式事务协议：

**阶段1：准备阶段**
```
协调者 → 所有参与者："准备好了吗？"
参与者 → 协调者："Ready" 或 "Abort"
```

**阶段2：提交阶段**
```
- 所有 Ready → 协调者 → "Commit"
- 任一 Abort → 协调者 → "Rollback"
```

**缺点**：
- 同步阻塞，性能差
- 单点故障（协调者）
- 数据锁定时间长

### 2. 三阶段提交（3PC）

**Q4: 3PC 相比 2PC 有何改进？**

**A:** 3PC 增加了一个阶段：

1. **CanCommit**：询问是否可以提交
2. **PreCommit**：预提交（锁定资源）
3. **DoCommit**：最终提交

**改进**：
- 减少阻塞时间
- 降低死锁概率

**仍然存在的问题**：
- 依然同步阻塞
- 分区时无法确定超时原因

### 3. TCC 补偿模式

**Q5: TCC 如何实现分布式事务？**

**A:** TCC 将业务逻辑分为三个阶段：

**Try 阶段**：尝试执行
```java
public boolean try(TransferRequest request) {
    // 冻结资金
    accountDao.freeze(request.getFrom(), request.getAmount());
    return true;
}
```

**Confirm 阶段**：确认提交
```java
public boolean confirm(TransferRequest request) {
    // 扣除冻结资金
    accountDao.deduct(request.getFrom(), request.getAmount());
    // 增加目标账户余额
    accountDao.add(request.getTo(), request.getAmount());
    return true;
}
```

**Cancel 阶段**：取消回滚
```java
public boolean cancel(TransferRequest request) {
    // 释放冻结资金
    accountDao.unfreeze(request.getFrom(), request.getAmount());
    return true;
}
```

**优点**：
- 性能好（最终一致性）
- 无锁等待

**缺点**：
- 代码侵入性强
- 需要实现补偿逻辑

### 4. Saga 模式

**Q6: Saga 模式如何处理长事务？**

**A:** Saga 将长事务拆分为多个本地事务：

**模式1：补偿型 Saga**
```
事务1 → 事务2 → 事务3 → 事务4
  ↓       ↓       ↓       ↓
补偿1   补偿2   补偿3   补偿4
```

**模式2：编排型 Saga**
```
使用事件驱动的编排器：
- 发送 "启动事务1" 事件
- 事务1完成 → 发送 "启动事务2" 事件
- 任一失败 → 发送 "补偿" 事件
```

**框架**：Seata、Axon Framework、Eventuate

---

## 分布式锁

### 1. Redis 分布式锁

**Q7: 如何用 Redis 实现分布式锁？**

**A:** 使用 SET NX + EXPIRE：

```java
// 获取锁
String lockKey = "lock:product:" + productId;
Boolean locked = redisTemplate.opsForValue()
    .setIfAbsent(lockKey, "locked", 30, TimeUnit.SECONDS);

if (locked) {
    try {
        // 执行业务逻辑
    } finally {
        // 释放锁（Lua脚本保证原子性）
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
        redisTemplate.execute(new DefaultRedisScript<>(script, Long.class),
            Collections.singletonList(lockKey), "locked");
    }
}
```

**Q8: Redis 锁会有什么问题？如何解决？**

**A:**

**问题1：锁过期**
- 场景：业务执行时间超过锁的过期时间
- 解决：看门狗机制（定时续期）

**问题2：主从切换**
- 场景：Master 加锁后未同步到 Slave 就宕机
- 解决：Redlock 算法（多个独立 Redis 实例）

### 2. ZooKeeper 分布式锁

**Q9: ZooKeeper 锁相比 Redis 锁有什么优势？**

**A:**

**ZK 优势**：
- **CP** 保证，锁可靠性高
- Watcher 机制，无需轮询
- 有序临时节点，避免羊群效应

**ZK 缺点**：
- 性能较 Redis 低
- 部署维护复杂

**选择建议**：
- 高并发场景 → Redis 锁
- 强一致性要求 → ZK 锁
- 已有 ZK 集群 → ZK 锁

---

## 分布式 ID

### 1. 为什么需要分布式 ID？

**Q10: 数据库自增 ID 有什么问题？**

**A:**

**单机问题**：
- 并发瓶颈
- 单点故障

**分库分表问题**：
- ID 冲突
- 无法按时间排序

### 2. 常见方案

**Q11: 有哪些分布式 ID 生成方案？**

**A:**

**1. UUID**
```java
String id = UUID.randomUUID().toString();
```
- ✅ 简单、无依赖
- ❌ 无序、过长、无业务含义

**2. 雪花算法**
```java
// 1位符号位 + 41位时间戳 + 10位机器ID + 12位序列号
long id = snowflakeIdGenerator.nextId();
```
- ✅ 有序、高性能、趋势递增
- ❌ 依赖系统时钟、回拨问题

**3. 数据库步长**
```java
// 设置步长和起始值
// DB1: 1, 4, 7, 10...
// DB2: 2, 5, 8, 11...
// DB3: 3, 6, 9, 12...
```
- ✅ 简单、有序
- ❌ 扩容困难

**4. 号段模式**
```java
// 预分配号段
// 服务A: [1, 1000]
// 服务B: [1001, 2000]
```
- ✅ 高性能
- ❌ ID 不连续

---

## 服务注册与发现

### 1. 注册中心

**Q12: 常见的注册中心有哪些？**

**A:**

| 特性 | Eureka | Consul | Nacos | Zookeeper |
|------|--------|--------|-------|-----------|
| **CAP** | AP | CP | AP/CP | CP |
| **一致性** | 最终 | 强 | 可配置 | 强 |
| **健康检查** | 客户端 | 服务端/TCP | 服务端/TCP | 长连接 |
| **负载均衡** | Ribbon | 内置 | 内置 | - |
| **多数据中心** | 支持 | 支持 | 支持 | - |
| **社区活跃度** | 维护模式 | 活跃 | 活跃 | 活跃 |

**Q13: Nacos 和 Eureka 的区别？**

**A:**

**Nacos 优势**：
- AP/CP 可切换
- 动态配置管理
- 阿里维护，社区活跃
- 支持 K8s Service

**Eureka 特点**：
- Netflix 开源（2.x 后停止维护）
- 纯 AP 模型
- Spring Cloud 早期集成

---

## 配置中心

### 1. 配置管理

**Q14: 为什么需要配置中心？**

**A:**

**问题**：
- 配置分散在各个服务
- 修改配置需要重启服务
- 不同环境配置管理困难

**解决方案**：
- 集中管理配置
- 动态刷新
- 版本控制
- 灰度发布

**Q15: Apollo 和 Nacos Config 怎么选？**

**A:**

**Apollo**：
- 携程开源，功能完善
- 权限管理、审计日志
- 配置修改发布流程
- 适合大型企业

**Nacos Config**：
- 轻量级，部署简单
- 与 Nacos 注册中心集成
- 适合中小型项目

---

## 服务限流与降级

### 1. 限流算法

**Q16: 常见的限流算法有哪些？**

**A:**

**1. 固定窗口**
```java
// 100次/秒
AtomicInteger counter = new AtomicInteger(0);
if (counter.incrementAndGet() <= 100) {
    // 允许访问
} else {
    // 拒绝访问
}
// 每秒重置
```
- ❌ 边界问题（0.9s 100次 + 1.1s 100次 = 200次）

**2. 滑动窗口**
```java
// 记录每个请求的时间戳
Queue<Long> timestamps = new LinkedList<>();
timestamps.offer(System.currentTimeMillis());
// 移除1秒前的记录
while (timestamps.peek() < System.currentTimeMillis() - 1000) {
    timestamps.poll();
}
if (timestamps.size() <= 100) {
    // 允许
}
```
- ✅ 平滑限流
- ❌ 内存占用大

**3. 令牌桶**
```java
// Guava RateLimiter
RateLimiter rateLimiter = RateLimiter.create(100); // 100 QPS
if (rateLimiter.tryAcquire()) {
    // 允许访问
} else {
    // 拒绝
}
```
- ✅ 平滑限流、可应对突发
- ✅ 广泛使用

**4. 漏桶**
```java
// 固定速率处理
// 桶满则拒绝
```
- ✅ 削峰填谷
- ❌ 应对突发差

### 2. 服务降级

**Q17: 如何实现服务降级？**

**A:**

**1. 自动降级**
```java
@HystrixCommand(
    fallbackMethod = "fallback",
    commandProperties = {
        @HystrixProperty(
            name = "execution.isolation.thread.timeoutInMilliseconds",
            value = "3000"
        )
    }
)
public String getUserInfo(Long id) {
    // 正常逻辑
}

public String fallback(Long id) {
    // 降级逻辑：返回缓存或默认值
    return "缓存用户信息";
}
```

**2. 手动降级**
```java
// Sentinel 配置规则
DegradeRule rule = new DegradeRule();
rule.setResource("getUserInfo");
rule.setGrade(RuleConstant.DEGRADE_GRADE_RT);
rule.setCount(100); // 平均响应时间超过100ms
rule.setTimeWindow(10);
```

---

## 分布式缓存

### 1. 缓存架构

**Q18: Redis 集群模式有哪些？**

**A:**

**1. 主从模式**
```
Master ←→ Slave
        ←→ Slave
```
- 读写分离
- 主从复制

**2. 哨兵模式**
```
Master → Sentinel → Slave
  ↓         ↓
自动选举 → 提升新 Master
```
- 自动故障转移
- 高可用

**3. Cluster 模式**
```
分片0: Master-Slave
分片1: Master-Slave
分片2: Master-Slave
```
- 数据分片
- 横向扩展
- 无中心节点

### 2. 缓存问题

**Q19: 如何解决缓存穿透？**

**A:**

**问题**：查询不存在的数据，缓存和数据库都没有，每次都查数据库

**解决方案**：
1. **布隆过滤器**：快速判断数据是否存在
2. **缓存空对象**：将空结果缓存
3. **请求限流**：限制恶意请求

```java
// 方案1：缓存空值
String value = redis.get(key);
if (value == null) {
    value = db.query(id);
    if (value == null) {
        redis.setex(key, 60, ""); // 缓存空值60秒
    } else {
        redis.setex(key, 3600, value);
    }
}
```

**Q20: 如何解决缓存雪崩？**

**A:**

**问题**：大量缓存同时失效，请求全部打到数据库

**解决方案**：
1. **过期时间加随机值**
2. **缓存预热**
3. **互斥锁重建缓存**
4. **熔断降级**

```java
// 方案1：随机过期时间
int expire = baseExpire + Random.nextInt(300); // 基础时间 + 0-5分钟
redis.setex(key, expire, value);
```

---

## 面试真题

**Q21: [阿里] 设计一个秒杀系统如何保证不超卖？**

**A:**

**方案1：Redis 预减库存**
```
1. 用户请求 → Redis 原子扣减库存
2. 扣减成功 → 创建订单（MQ异步）
3. 扣减失败 → 直接返回"已售罄"
```

```java
String key = "stock:" + productId;
Long stock = redisTemplate.opsForValue().increment(key, -1);
if (stock < 0) {
    // 回滚
    redisTemplate.opsForValue().increment(key, 1);
    return "已售罄";
}
// 发送到MQ创建订单
```

**方案2：数据库乐观锁**
```sql
UPDATE stock
SET count = count - 1
WHERE product_id = ? AND count > 0;
```

**Q22: [字节] 如何设计分布式全局唯一 ID？**

**A:** 使用雪花算法（Snowflake）：

```java
public class SnowflakeIdGenerator {
    private final long twepoch = 1288834974657L; // 起始时间戳
    private final long workerIdBits = 5L;
    private final long datacenterIdBits = 5L;
    private final long sequenceBits = 12L;

    private long workerId;
    private long datacenterId;
    private long sequence = 0L;
    private long lastTimestamp = -1L;

    public synchronized long nextId() {
        long timestamp = timeGen();

        if (timestamp < lastTimestamp) {
            throw new RuntimeException("时钟回拨");
        }

        if (lastTimestamp == timestamp) {
            sequence = (sequence + 1) & ~(-1L << sequenceBits);
            if (sequence == 0) {
                timestamp = tilNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0;
        }

        lastTimestamp = timestamp;

        return ((timestamp - twepoch) << (workerIdBits + datacenterIdBits + sequenceBits))
                | (datacenterId << (workerIdBits + sequenceBits))
                | (workerId << sequenceBits)
                | sequence;
    }
}
```

---

## 总结

### 关键要点

1. **CAP 理论**：理解权衡，CP vs AP
2. **分布式事务**：2PC、TCC、Saga、本地消息表
3. **分布式锁**：Redis 锁、ZK 锁
4. **分布式 ID**：雪花算法、号段模式
5. **服务发现**：Nacos、Eureka、Consul
6. **配置中心**：Apollo、Nacos Config
7. **限流降级**：令牌桶、熔断器
8. **缓存问题**：穿透、雪崩、击穿

### 面试准备

- ✅ 理解分布式系统的核心挑战
- ✅ 掌握常见问题的解决方案
- ✅ 熟悉主流中间件的选型
- ✅ 能设计高可用架构
- ✅ 有实际项目经验

---

**最后更新：2026 年 2 月**
**版本：v1.0**
