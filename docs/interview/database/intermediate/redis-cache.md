---
title: Redis缓存面试题
---

# Redis缓存面试题

> **难度等级**：⭐⭐⭐ | **出现频率**：92% | **建议用时**：40分钟

## 基础概念题

### 1. Redis为什么这么快？

**参考答案**：

**核心原因**：

1. **纯内存操作**
   - 所有数据都在内存中
   - 内存读写速度是磁盘的十万倍

2. **单线程模型（6.x之前）**
   - 避免线程切换和锁竞争
   - 采用IO多路复用（epoll）

3. **高效的数据结构**
   - SDS（简单动态字符串）
   - 压缩列表、跳跃表、字典等

4. **IO多路复用**
   - 单个线程处理多个连接
   - 减少线程开销

**注意**：Redis 6.0引入多线程IO，但核心执行还是单线程。

---

### 2. Redis有哪些数据结构？应用场景？

**参考答案**：

| 数据类型 | 底层结构 | 应用场景 |
|---------|----------|---------|
| **String** | SDS | 缓存、计数器、分布式锁 |
| **Hash** | 字典+压缩列表 | 对象存储（用户信息、购物车） |
| **List** | 快速列表（双端队列） | 消息队列、最新列表 |
| **Set** | 整数集合+字典 | 标签、交集并集、抽奖 |
| **Sorted Set** | 跳跃表+字典 | 排行榜、延时队列 |
| **Bitmap** | String位操作 | 签到、在线用户 |
| **HyperLogLog** | 字符串+概率算法 | 基数统计（UV） |
| **Geo** | ZSet+GeoHash | 附近的人、位置计算 |

---

## 缓存问题题

### 3. 什么是缓存穿透？如何解决？

**参考答案**：

**定义**：查询一个不存在的数据，缓存和数据库都没有，每次都打到数据库。

**解决方案**：

**方案1：布隆过滤器**
```java
// 初始化布隆过滤器
BloomFilter<String> filter = BloomFilter.create(...);

// 查询前先判断
if (!filter.mightContain(key)) {
    return null; // 直接返回
}

// 再查询缓存和数据库
```

**方案2：缓存空对象**
```java
// 数据库没有时，缓存null值
String value = redis.get(key);
if (value == null) {
    value = db.query(key);
    if (value == null) {
        redis.set(key, "", 30); // 缓存空对象30秒
    }
}
```

**方案3：参数校验**
- 在入口层校验参数合法性

---

### 4. 什么是缓存击穿？如何解决？

**参考答案**：

**定义**：某个热点Key过期，瞬间大量请求打到数据库。

**解决方案**：

**方案1：互斥锁（分布式锁）**
```java
String value = redis.get(key);
if (value == null) {
    // 获取锁
    if (redis.setnx(lock_key, 1, 10)) {
        value = db.query(key); // 查数据库
        redis.set(key, value, 3600); // 写缓存
        redis.del(lock_key); // 释放锁
    } else {
        // 等待并重试
        Thread.sleep(100);
        return get(key);
    }
}
```

**方案2：热点数据永不过期**
```java
// 逻辑过期，非物理过期
redis.set(key, value);
redis.expire(key, 3600); // 逻辑过期时间

// 查询时
if (redis.isExpired(key)) {
    // 异步续期
    asyncRenew(key);
}
```

**方案3：熔断降级**
- 限流保护
- 服务降级

---

### 5. 什么是缓存雪崩？如何解决？

**参考答案**：

**定义**：大量Key在同一时间过期，导致请求全部打到数据库。

**解决方案**：

**方案1：过期时间加随机值**
```java
redis.set(key, value, 3600 + Random.nextInt(300));
// 基础时间 + 随机0-300秒
```

**方案2：多级缓存**
```java
// L1：本地缓存（Caffeine）
// L2：Redis缓存
String value = localCache.get(key);
if (value == null) {
    value = redis.get(key);
    if (value != null) {
        localCache.put(key, value);
    }
}
```

**方案3：缓存高可用**
- Redis主从 + 哨兵
- Redis Cluster集群

**方案4：熔断降级**
- Hystrix、Sentinel

---

## 持久化与集群题

### 6. Redis持久化方式？区别？

**参考答案**：

**RDB（快照持久化）**：
- **原理**：fork子进程保存数据快照
- **文件**：dump.rdb
- **优点**：
  - 文件紧凑，恢复快
  - 适合备份
- **缺点**：
  - 可能丢失最后一次快照后的数据
  - fork时内存翻倍

**AOF（追加文件持久化）**：
- **原理**：记录每个写命令到文件
- **文件**：appendonly.aof
- **优点**：
  - 数据更安全，丢失少
- **缺点**：
  - 文件大，恢复慢
  - AOF重写时性能影响

**混合持久化（推荐）**：
```conf
# 开启AOF和RDB
appendonly yes
aof-use-rdb-preamble yes

# Redis 4.0+支持
```

---

### 7. Redis高可用方案？

**参考答案**：

**方案1：主从复制**
- 1主多从
- 读写分离
- 问题：手动故障转移

**方案2：哨兵模式（Sentinel）**
- 自动监控主从
- 自动故障转移
- 推荐：3个以上哨兵节点

**方案3：Redis Cluster**
- 官方集群方案
- 16384个槽位
- 自动分片、高可用
- 推荐：生产环境使用

---

### 8. 如何保证缓存与数据库一致性？

**参考答案**：

**方案1：Cache Aside Pattern（推荐）**
```java
// 读
value = redis.get(key);
if (value == null) {
    value = db.query();
    redis.set(key, value);
}
return value;

// 写（先更新数据库，再删缓存）
db.update(data);
redis.del(key); // 延迟双删更好
```

**方案2：延迟双删**
```java
// 更新数据库
db.update(data);

// 第一次删除
redis.del(key);

// 延迟几百毫秒再删
Thread.sleep(500);
redis.del(key);
```

**方案3：订阅Binlog（ Canal）**
- 数据库变更 -> Canal -> 更新Redis
- 最终一致性
- 解耦应用

---

## 实战场景题

### 9. 设计一个分布式锁

**参考答案**：

```java
public boolean tryLock(String key, int expireTime) {
    // SETNX + 过期时间（原子操作）
    String result = redis.set(
        key,
        "1",
        "NX",  // 不存在才设置
        "EX",  // 过期时间
        expireTime
    );
    return "OK".equals(result);
}

public void unlock(String key) {
    // Lua脚本保证原子性
    String script = "if redis.call('get', KEYS[1]) == ARGV[1] " +
                   "then return redis.call('del', KEYS[1]) " +
                   "else return 0";
    redis.eval(script, Collections.singletonList(key), "1");
}
```

**注意**：
- 必须设置过期时间，防止死锁
- 解锁需要验证是自己的锁
- 使用Lua保证原子性

---

### 10. 设计一个排行榜功能

**参考答案**：

```java
// 添加分数
redis.zadd("rank", score, userId);

// 获取Top 10
Set<String> top10 = redis.zrevrange("rank", 0, 9);

// 获取用户排名
Long rank = redis.zrevrank("rank", userId);

// 获取用户分数
Double score = redis.zscore("rank", userId);
```

**扩展**：
- 使用Hash存储用户详细信息
- Score更新使用ZINCRBY
- 可以按时间分区（daily_rank、weekly_rank）

---

**更新时间**：2026年2月 | **版本**：v1.0
