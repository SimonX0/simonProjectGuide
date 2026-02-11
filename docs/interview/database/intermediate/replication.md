---
title: 主从复制与高可用面试题
---

# 主从复制与高可用面试题

> **难度等级**：⭐⭐⭐ | **出现频率**：75% | **建议用时**：30分钟

## MySQL主从复制题

### 1. MySQL主从复制原理？

**参考答案**：

**复制类型**：

**1. 异步复制（Asynchronous）**
```
主库 -> binlog -> 从库IO线程 -> Relay Log -> SQL线程执行
```
- 主库不等待从库确认
- 性能最好，但可能丢失数据
- 默认模式

**2. 半同步复制（Semisynchronous）**
```
主库 -> binlog -> 从库
从库ACK -> 主库（至少一个从库确认）
主库 -> commit
```
- 主库等待至少一个从库接收
- 平衡性能和数据安全
- 需要安装插件

**3. 全同步复制（Synchronous）**
- 主库等待所有从库确认
- 数据最安全，但性能最差
- 很少使用

**复制流程**：
1. **主库**：记录数据变更到binlog
2. **从库IO线程**：请求binlog并写入Relay Log
3. **从库SQL线程**：读取Relay Log并执行

---

### 2. binlog三种格式区别？

**参考答案**：

| 格式 | 优点 | 缺点 | 适用场景 |
|-----|------|------|---------|
| **Statement** | 日志量小 | 不安全（函数、触发器可能不一致） | 简单应用 |
| **Row** | 最安全，精确记录 | 日志量大，无法看执行了什么SQL | 数据恢复、主从 |
| **Mixed** | 平衡 | 混合模式可能有问题 | 一般场景 |

**查看格式**：
```sql
SHOW VARIABLES LIKE 'binlog_format';
```

**设置格式**：
```sql
SET GLOBAL binlog_format = 'ROW';
```

---

### 3. 主从延迟如何解决？

**参考答案**：

**原因分析**：
- 从库配置低（单线程应用）
- 网络延迟
- 从库负载高
- 大事务
- 锁冲突

**解决方案**：

**1. 并行复制（MySQL 5.7+）**
```sql
-- 从库设置并行复制
-- 基于库并行
SET GLOBAL slave_parallel_workers = 4;
SET GLOBAL slave_parallel_type = 'DATABASE';

-- 基于 INFORMATION_SCHEMA_SERVERS
-- 需要配置主库信息
```

**2. 多线程复制（MySQL 8.0+）**
```sql
-- 设置并行复制线程数
SET GLOBAL replica_parallel_workers = 4;

-- 并行类型
-- LOGICAL_CLOCK: 基于逻辑时钟顺序
-- DATABASE: 基于数据库
```

**3. 读写分离**
```java
// 写操作走主库
masterDB.executeUpdate(sql);

// 读操作走从库
List<Data> results = slaveDB.query(sql);

// 使用中间件
// - MySQL Router
// - ProxySQL
// - ShardingSphere
// - MyCat
```

**4. 延迟监控**
```sql
-- 查看延迟
SHOW SLAVE STATUS\G
-- Seconds_Behind_Master: 延迟秒数

-- MySQL 8.0+
SHOW REPLICA STATUS;
```

---

## GTID题

### 4. 什么是GTID？有什么优势？

**参考答案**：

**GTID（Global Transaction ID）**：全局事务ID

**格式**：
```
source_id:transaction_id
例如：3E11FA47-71CA-11E1-9075-9A5FD1E5A:23
```

**优势**：

**1. 简化主从切换**
- 不需要查找binlog文件和位置
- 直接通过GTID定位

**2. 多源复制**
- 从库可以有多主库
- 合并多个主库的GTID

**3. 防止重复执行**
- 已执行的GTID会被跳过

**4. 故障恢复简单**
- 不需要计算binlog位置

**开启GTID**：
```sql
-- 主库
SET GLOBAL gtid_mode = ON;
SET GLOBAL enforce_gtid_consistency = ON;

-- 从库
SET GLOBAL gtid_mode = ON;
CHANGE MASTER TO
  MASTER_HOST = 'master_ip',
  MASTER_AUTO_POSITION = 1;
```

---

## 高可用架构题

### 5. MySQL高可用方案有哪些？

**参考答案**：

**1. 传统主从 + Keepalived**
```
Master (Active) VIP
    |
    +-- +VIP浮动
Slave (Standby) VIP
```
- VIP浮动到可用节点
- 故障切换需要手动或脚本
- 可能数据丢失

**2. MHA（Master High Availability）**
- 自动故障检测和切换
- 提供VIP管理
- 数据补偿机制
- 已停止维护（推荐Orchestrator）

**3. MGR（MySQL Group Replication）**
- 多主复制架构
- 基于Paxos协议
- 最多9个节点
- 强一致性

**4. InnoDB Cluster**
- 多主架构
- 数据自动分片（NDB）
- 无共享存储
- 实时同步

---

### 6. MGR vs 传统主从？

**参考答案**：

| 特性 | 传统主从 | MGR |
|-----|---------|-----|
| 复制模式 | 异步/半同步 | 基于Paxos的组复制 |
| 主库数量 | 单主 | 多主（最多9节点） |
| 一致性 | 最终一致性 | 强一致性 |
| 切换 | 需要外部工具 | 自动选举 |
| 冲突处理 | 无 | 自动检测和解决 |
| 适用版本 | 所有版本 | MySQL 5.7.17+ |

**MGR使用场景**：
- 多地多活
- 就近访问
- 高可用要求

---

## PostgreSQL复制题

### 7. PostgreSQL复制方式有哪些？

**参考答案**：

**1. 流复制（Streaming Replication）**
- 主库：WAL日志
- 从库：恢复WAL
- 支持级联复制

```sql
-- 主库创建复制槽
SELECT * FROM pg_create_physical_replication_slot('slot_name');

-- 从库基础备份
pg_basebackup -h master -D /backup/base

-- 从库恢复并启动
pg_ctl start -D /data
```

**2. 逻辑复制**
- 基于触发器或日志解析
- 支持部分表复制
- 可以跨版本

```sql
-- 安装pglogical扩展
CREATE EXTENSION pglogical;

-- 创建节点
SELECT pglogical.create_node(...);

-- 订阅表
SELECT pglogical.subscribe_table(...);
```

**3. BDR（Bidirectional Replication）**
- 双向复制
- 多主多写
- 冲突解决

---

## Redis高可用题

### 8. Redis哨兵原理？

**参考答案**：

**Sentinel架构**：
```
Master
   |  (PUBLISH心跳)
   +--+
Sentinel1  Sentinel2  Sentinel3 (监控、选举、通知)
   |             |
Slave1  Slave2  (数据同步)
```

**Sentinel功能**：

**1. 监控**
- 持续ping主从节点
- 检查是否主观下线（sdown）
- 检查是否客观下线（odown）

**2. 通知**
- 节点故障时通知管理员
- 通过脚本、API通知

**3. 自动故障转移**
- 选举哨兵leader
- 自动提升从库为新主库
- 配置客户端连接到新主库

**4. 配置提供者**
- 新主库IP告知客户端
- 客户端使用Sentinel获取主库地址

**配置示例**：
```conf
port 26379
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 60000
```

---

### 9. Redis Cluster原理？

**参考答案**：

**Redis Cluster架构**：
```
Client
  |
  +---> 路由槽(0-16383)
  |
[node1][node2][node3][node4]...
  槽位分配: 槽0-5460 | 槽5461-10922 | ...
```

**核心概念**：

**1. 槽位（Slot）**
- 16384个哈希槽
- 每个键计算槽位：CRC16(key) % 16384

**2. 槽位分配**
- 槽位分配到不同节点
- 支持在线迁移槽位

**3. 跳跃表**
- 节点内部使用跳跃表
- 快速定位槽位所在的节点

**4. Gossip协议**
- 节点间交换状态
- 检测节点故障

**优点**：
- 自动分片
- 高可用（主从）
- 水平扩展

**缺点**：
- 多键操作受限
- 事务支持受限
- 需要特殊客户端

---

## 实战场景题

### 10. 设计一个高可用数据库架构

**参考答案**：

**方案1：MHA + VIP**
```
应用 -> VIP -> [Master-A, Master-B]
                   |
                   v
              [Slave-1, Slave-2, Slave-3]

特点：
- 双主热备
- 自动故障切换
- 读请求可以走从库
```

**方案2：MGR多主**
```
应用 -> ProxySQL -> [MGR-Node1, MGR-Node2, MGR-Node3]
                              |
                              v
                    [Primary election]

特点：
- 多主多写
- 自动故障转移
- 强一致性
```

**方案3：读写分离**
```java
// 配置数据源
@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource masterDataSource() {
        // 写主库
        return DataSourceBuilder.create(masterConfig);
    }

    @Bean
    public DataSource slaveDataSource() {
        // 读从库（轮询负载）
        return DataSourceBuilder.create(slaveConfig);
    }

    @Bean
    public DataSource dynamicDataSource() {
        // 路由：写->主库，读->从库
        return new RoutingDataSource(master, slaves);
    }
}
```

**选择建议**：
- 读写分离：简单场景
- MHA：传统应用改造小
- MGR：新应用、多地多活

---

**更新时间**：2026年2月 | **版本**：v1.0
