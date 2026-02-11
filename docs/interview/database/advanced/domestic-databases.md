---
title: 国产分布式数据库面试题
---

# 国产分布式数据库面试题

> **难度等级**：⭐⭐⭐ | **出现频率**：65% | **建议用时**：35分钟

## OceanBase题

### 1. OceanBase的Paxos协议原理？

**参考答案**：

**Paxos**：分布式一致性算法

**三种角色**：
- **Proposer（提议者）**：提出提案
- **Accepon（接受者）**：投票接受/拒绝
- **Learner（学习者）**：学习最终结果

**两个阶段**：
**阶段一：Prepare**
```
Proposer -> Accepon: "提案编号N"
Accepon -> Proposer: "Promise(承诺编号<N)"
if (收到的Promise > 半数) {
    Proposer -> Accepon: "Accept(接受提案N)"
}
```

**阶段二：Accept**
```
if (Accepon收到> 半数Accept) {
    Accepon -> Learner: "决议N"
    Learner -> 所有: "提案N被选定"
}
```

**OceanBase应用**：
- 三地五中心架构
- 多数派响应快
- 自动故障转移

---

### 2. OceanBase的三地五中心是什么？

**参考答案**：

**架构**：
```
         [北京主区]
           /      \
      [同城机房1] [同城机房2]
         \          /
           [上海主区]
```

**两地三市**：
- 两个同城机房（距离<100km）
- 一个异地机房（距离>1000km）

**五中心**：
- 北京主区（3副本）
- 北京同城区（3副本）
- 上海主区（3副本）

**RPO = 0**：数据零丢失
**RTO < 30秒**：快速切换

**优势**：
- 城市级容灾
- 30秒内完成切换
- 数据强一致

---

### 3. OceanBase的分区方式有哪些？

**参考答案**：

**1. Hash分区**
```sql
-- 哈希分区
PARTITION BY HASH(user_id) PARTITIONS 16;
```
- 均匀分布数据
- 扩容需迁移数据

**2. Range分区**
```sql
-- 范围分区（按时间）
PARTITION BY RANGE(create_time) (
    PARTITION p202301 VALUES LESS THAN ('2024-01-01'),
    PARTITION p202302 VALUES LESS THAN ('2024-02-01')
);
```
- 按范围查询快速
- 可能数据倾斜

**3. List分区**
```sql
-- 列表分区
PARTITION BY LIST(region) (
    PARTITION p_beijing VALUES ('北京', '天津'),
    PARTITION p_shanghai VALUES ('上海', '杭州')
);
```
- 适合枚举值
- 手动管理分区

**4. 二级分区（分区+分表）**
- 分区内再分表
- 更细粒度控制

---

## TiDB题

### 4. TiDB的HTAP架构是什么？

**参考答案**：

**HTAP**：Hybrid Transactional/Analytical Processing（混合事务/分析处理）

**TiDB架构**：
```
Client
  |
  +--> SQL Layer (PD, TiDB Server)
           |
           +---> KV Layer (TiKV)
                    |
                    +---> Storage Engine (RocksDB)
```

**两行引擎**：

**1. TP行引擎**
- 处理OLPT事务（点查、范围查）
- 基于RocksDB
- 强一致性
- 响应快

**2. AP行引擎**
- 处理OLAP分析（聚合、报表）
- 基于列存（TiFlash）
- 最终一致（异步同步）
- 适合复杂查询

**智能路由**：
- TiDB Server根据SQL类型路由
- 事务 -> TiKV
- 分析 -> TiFlash

**优势**：
- 一套系统同时支持OLTP和OLAP
- 无需ETL
- 实时分析

---

### 5. TiDB的Raft协议是什么？

**参考答案**：

**Raft**：分布式一致性算法

**核心概念**：
- **Leader（领导者）**：处理所有写请求
- **Follower（追随者）**：复制Leader日志
- **Candidate（候选者）**：选举Leader

**日志复制**：
```
Leader -> Follower: AppendEntries(log)
Follower -> Leader: AppendEntries(success)
```

**选举过程**：
```
1. Follower超时未收到Leader心跳
2. Follower转为Candidate
3. Candidate向所有节点请求投票
4. 获多数投票成为Leader
```

**TiDB应用**：
- 每个TiKV Region使用Raft
- 3副本默认
- 自动Leader选举
- 强一致性

---

## 达梦数据库题

### 6. 达梦与Oracle的兼容性？

**参考答案**：

**兼容性**：
- PL/SQL语法兼容
- 数据类型兼容（NUMBER、VARCHAR2等）
- 函数兼容（SYSDATE、NVL等）
- 触发器兼容

**数据类型映射**：
| Oracle | 达梦DM8 |
|-------|----------|
| NUMBER | DECIMAL/NUMERIC |
| VARCHAR2 | VARCHAR2 |
| DATE | DATETIME |
| CLOB | CLOB |
| BLOB | BLOB |

**语法差异**：
```sql
-- Oracle
SELECT * FROM users WHERE ROWNUM <= 10;

-- 达梦
SELECT * FROM users LIMIT 10;
```

**迁移注意**：
- 使用DM数据迁移工具
- 检查函数兼容性
- 存储过程需要调整
- 测试性能对比

---

### 7. 达梦的DSC是什么？

**参考答案**：

**DSC（Data Shared Cluster）**：达梦共享集群

**架构**：
```
[节点1] [节点2] [节点3]
    \        |        /
    [共享存储]
```

**特点**：
- 多节点共享同一份数据
- 无主从之分
- 所有节点可读写
- 故障自动切换

**优势**：
- 资源利用率高（不浪费从库）
- 读写性能均提升
- 高可用

---

## 人大金仓题

### 8. KingbaseES的三大权分立是什么？

**参考答案**：

**三权分立**：系统管理员、安全管理员、审计管理员分离

**1. 系统管理员（SYSADMIN）**
- 创建数据库、用户
- 管理数据库配置
- 不能审计普通用户

**2. 安全管理员（SECURITYADMIN）**
- 创建角色、权限
- 配置安全策略
- 不能访问用户数据

**3. 审计管理员（AUDITOR）**
- 审计日志查看
- 审计策略配置
- 不能修改数据

**优势**：
- 权限隔离，防内部滥用
- 满足等保要求
- 审计可追溯

---

### 9. KingbaseES的Oracle兼容模式？

**参考答案**：

**兼容模式**：
- **PG模式**：兼容PostgreSQL（默认）
- **Oracle模式**：兼容Oracle语法

**切换Oracle模式**：
```sql
-- 设置兼容级别
SET compatibility_mode = 'oracle';

-- Oracle函数可用
SELECT NVL(name, '未知') FROM users;
-- 等同于COALESCE(name, '未知')
```

**特点**：
- 支持Oracle存储过程
- 支持Oracle触发器
- 数据类型映射
- SQL方言切换

---

## openGauss题

### 10. openGauss的AI4DB是什么？

**参考答案**：

**AI4DB**：AI驱动的数据库优化

**功能**：
- **智能索引推荐**：基于Workload分析推荐索引
- **智能查询优化**：AI优化执行计划
- **异常检测**：自动检测性能异常
- **参数自调优**：根据负载自动调整参数

**优势**：
- 减少DBA工作量
- 自动性能优化
- 预测性能问题

---

### 11. openGauss的全密态是什么？

**参考答案**：

**全密态**：端到端加密

**加密层次**：
```
客户端 -> [传输加密] -> 数据库 -> [存储加密] -> 磁盘
           |                |
      [密钥管理中心]
```

**特点**：
- 客户端数据全程加密
- 密钥由第三方管理
- DBA无法看到明文数据
- 存储和传输加密

**场景**：
- 金融、政府等高安全要求
- 个人隐私保护
- 等保四级要求

---

## TDSQL题

### 12. TDSQL的单元化是什么？

**参考答案**：

**单元化（Set）**：按业务单元拆分数据库

**架构**：
```
[单元1: 用户库] [单元2: 订单库] [单元3: 商品库]
     |               |                |
[全量只读实例]    [全量只读实例]
```

**特点**：
- 每个单元独立数据库
- 单元内强一致
- 单元间最终一致（通过消息）
- 单元故障不影响其他单元

**优势**：
- 故障隔离
- 独立扩展
- 灵活容灾

**Gossip协议**：
- 单元间通信
- 自动故障检测
- 请求路由

---

## 实战场景题

### 13. 设计一个金融级数据库架构

**参考答案**：

**需求**：
- 强一致性
- 高可用（RPO=0, RTO<30秒）
- 容灾能力
- 国产化要求

**方案1：OceanBase三地五中心**
```
[北京主区: 3副本]
[北京同城区: 3副本] -> [上海主区: 3副本]
[上海同城区: 3副本]
```
- RPO=0：数据零丢失
- RTO<30秒：自动切换
- 性价比高

**方案2：达梦DSC集群**
```
[节点1] [节点2] [节点3]
    \    |    /
[共享存储: ASM/集群文件系统]
```
- 读写负载均衡
- 节点故障自动切换
- 成本较低

**方案3：TiDB HTAP**
```
[应用]
  |
  +---> [TiDB Server]
           |
    +---> [TiKV: TP] [TiFlash: AP]
```
- 同时支持OLTP和OLAP
- 实时分析能力
- 自动扩容

---

**更新时间**：2026年2月 | **版本**：v1.0
