---
title: 第26章：InfluxDB 时序数据库
---

# ：InfluxDB 时序数据库

> **难度等级**：⭐⭐⭐ 中高级 | **学习时长**：10小时 | **实战项目**：IoT 监控系统

## 📚 本章目录

- [25.1 时序数据模型](#251-时序数据模型)
- [25.2 Flux 查询语言](#252-flux-查询语言)
- [25.3 连续查询](#253-连续查询)
- [25.4 数据保留策略](#254-数据保留策略)
- [25.5 集群配置](#255-集群配置)

---

## 时序数据模型

### 什么是时序数据

```
┌──────────────────────────────────────────────────────┐
│                  时序数据特征                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │   时间戳                    │       │
│  │   ↓                                           │       │
│  │   ●───●───●───●───●───●───●───●───●         │       │
│  │   │   │   │   │   │   │   │   │   │         │       │
│  │  1s  1s  1s  1s  1s  1s  1s  1s  1s         │       │
│  │                                                 │       │
│  │   特点：                                       │       │
│  │   1. 按时间顺序追加写入                        │       │
│  │   2. 很少更新或删除                            │       │
│  │   3. 批量写入性能高                            │       │
│  │   4. 范围查询（时间范围）                      │       │
│  │   5. 聚合分析（求和、平均等）                  │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### InfluxDB 数据模型

**核心概念**：

```
┌──────────────────────────────────────────────────────┐
│           InfluxDB 数据模型                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Measurement（测量）                                 │
│  ├── 相当于关系型数据库的表                          │
│  └── 例如：temperature, cpu_usage, humidity         │
│                                                      │
│  Timestamp（时间戳）                                 │
│  ├── 所有数据必须有时间戳                            │
│  └── 精度：ns, μs, ms, s, m, h                       │
│                                                      │
│  Tag（标签）                                         │
│  ├── 索引字段，用于快速查询                          │
│  ├── String 类型，不可变                            │
│  └── 例如：host, region, device_id                  │
│                                                      │
│  Field（字段）                                       │
│  ├── 数据值，不建索引                                │
│  ├── Float, Int, String, Boolean                    │
│  └── 例如：value, status, message                   │
│                                                      │
│  Point（数据点）                                     │
│  └── 一个时间戳 + Tag + Field 组成                   │
│                                                      │
│  Series（序列）                                       │
│  ├── 相同 Measurement + Tag Set 的数据集合           │
│  └── 例如：temperature,host=server1,region=beijing  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**数据示例**：

```
# Line Protocol 格式
measurement,tag_set field_set timestamp

# 示例1：温度数据
temperature,location=room1,sensor=sensor1 value=23.5 1707638400000000000

# 示例2：CPU 使用率
cpu,host=server1,region=beijing usage_user=45.2,usage_system=12.3 1707638400000000000

# 示例3：HTTP 请求
http_requests,method=GET,status=200,endpoint=/api/users duration=23,code=200 1707638400000000000
```

### 数据写入

**使用 CLI 写入**：

```bash
# 启动 InfluxDB CLI
influx

# 选择数据库
use mydb

# 写入单条数据
temperature,location=room1,sensor=sensor1 value=23.5

# 写入多条数据
temperature,location=room1 value=24.1
temperature,location=room2 value=22.8
humidity,location=room1 value=65.2

# 批量写入
temperature,location=room1 value=23.0 1707638400000000000
temperature,location=room1 value=23.5 1707638460000000000
temperature,location=room1 value=24.0 1707638520000000000
```

**使用 HTTP API 写入**：

```bash
# 写入单条数据
curl -XPOST 'http://localhost:8086/api/v2/write?org=myorg&bucket=mybucket' \
  --header 'Authorization: Token mytoken' \
  --data-binary 'temperature,location=room1 value=23.5'

# 批量写入
curl -XPOST 'http://localhost:8086/api/v2/write?org=myorg&bucket=mybucket' \
  --header 'Authorization: Token mytoken' \
  --data-binary $'temperature,location=room1 value=23.0 1707638400000000000
temperature,location=room1 value=23.5 1707638460000000000
temperature,location=room1 value=24.0 1707638520000000000'
```

**使用 Java Client 写入**：

```java
// InfluxDB 2.x Java Client
InfluxDBClient influxDBClient = InfluxDBClientFactory.create(
    "http://localhost:8086",
    "mytoken".toCharArray(),
    "myorg",
    "mybucket"
);

WriteApiBlocking writeApi = influxDBClient.getWriteApiBlocking();

// 写入单条数据
Point point = Point.measurement("temperature")
    .addTag("location", "room1")
    .addTag("sensor", "sensor1")
    .addField("value", 23.5)
    .time(Instant.now(), WritePrecision.NS);

writeApi.writePoint(point);

// 批量写入
List<Point> points = new ArrayList<>();
for (int i = 0; i < 1000; i++) {
    Point p = Point.measurement("temperature")
        .addTag("location", "room1")
        .addField("value", 20 + Math.random() * 10)
        .time(Instant.now().minusSeconds(i), WritePrecision.NS);
    points.add(p);
}

writeApi.writePoints(points);
```

---

## Flux 查询语言

### Flux 基础

**Flux 语法**：

```flux
# 基本查询结构
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r.location == "room1")

# 管道操作符 |> 用于连接函数
# r 代表每一行记录
```

**基本查询**：

```flux
# 查询最近1小时的数据
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")

# 查询指定时间范围
from(bucket: "mybucket")
  |> range(start: 2024-02-11T00:00:00Z, stop: 2024-02-11T23:59:59Z)
  |> filter(fn: (r) => r._measurement == "temperature")

# 多条件过滤
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) =>
      r._measurement == "temperature" and
      r.location == "room1" and
      r._field == "value"
  )

# 查询多个 measurement
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement =~ /^(temperature|humidity)$/)
```

### 聚合操作

```flux
# 求平均值
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> mean(column: "_value")

# 求最大值和最小值
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> max(column: "_value")

from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> min(column: "_value")

# 统计数据点数量
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> count()

# 求和
from(bucket: "mybucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "energy_consumption")
  |> sum(column: "_value")
```

### 窗口聚合

```flux
# 按时间窗口聚合（每5分钟）
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(
      every: 5m,
      fn: mean,
      createEmpty: false
    )

# 按小时聚合
from(bucket: "mybucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(
      every: 1h,
      fn: mean,
      createEmpty: false
    )

# 滑动窗口
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(
      every: 5m,
      period: 10m,  # 10分钟窗口
      fn: mean,
      createEmpty: false
    )

# 多种聚合函数
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: 5m, fn: mean, column: "avg")
  |> aggregateWindow(every: 5m, fn: max, column: "max")
  |> aggregateWindow(every: 5m, fn: min, column: "min")
```

### 数据转换

```flux
# 数据类型转换
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> map(fn: (r) => ({
        r with
        _value: float(v: r._value)
      }))

# 单位转换
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> map(fn: (r) => ({
        r with
        _value: r._value * 9.0 / 5.0 + 32.0,  # 摄氏度转华氏度
        unit: "F"
      }))

# 计算派生字段
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> map(fn: (r) => ({
        r with
        alert: r._value > 30.0,
        status: if r._value > 30.0 then "high" else "normal"
      }))

# 数据合并（join）
temperature = from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r._field == "value")

humidity = from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "humidity")
  |> filter(fn: (r) => r._field == "value")

join(tables: {temp: temperature, hum: humidity}, on: ["_time", "location"])
  |> map(fn: (r) => ({
        _time: r._time,
        _field: "comfort_index",
        location: r.location,
        _value: r._value_temp - 0.55 * (1.0 - r._value_hum / 100.0) * (r._value_temp - 14.5)
      }))
```

### 高级查询

```flux
# 移动平均
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> movingAverage(n: 10)

# 指数移动平均
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> exponentialMovingAverage(n: 10)

# 差分计算（计算变化率）
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> difference(columns: ["_value"])

# 累积求和
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "energy")
  |> cumulativeSum(columns: ["_value"])

# 百分位数
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "response_time")
  |> quantile(column: "_value", q: 0.95)  # P95

# 分组统计
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> group(columns: ["location"])
  |> mean(column: "_value")

# 排序
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> sort(columns: ["_value"], desc: true)

# Top/Bottom N
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> top(n: 10)

# 限制结果数量
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> limit(n: 100)
```

---

## 连续查询

### 什么是连续查询

```
┌──────────────────────────────────────────────────────┐
│            连续查询（Continuous Query）               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  原始数据（秒级）                                     │
│  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐          │
│  │23 │24 │25 │26 │25 │24 │23 │22 │21 │20 │          │
│  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘          │
│       │                                               │
│       │ 自动聚合（每5分钟）                           │
│       ▼                                               │
│  聚合数据（5分钟级）                                  │
│  ┌───────┬───────┬───────┐                          │
│  │ 23.8  │ 25.0  │ 21.5  │                          │
│  └───────┴───────┴───────┘                          │
│                                                      │
│  优点：                                             │
│  ✅ 自动降采样，减少存储空间                         │
│  ✅ 提升查询性能（预计算）                           │
│  ✅ 保留不同粒度的数据                               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 创建连续查询

**InfluxDB 2.x 使用 Tasks**：

```flux
# 创建任务（连续查询）
option task = {
  name: "downsample_temperature",
  every: 5m,
  delay: 1m
}

# 定义任务逻辑
from(bucket: "raw_data")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
  |> to(bucket: "downsampled_data", org: "myorg")
```

**使用 CLI 创建任务**：

```bash
# 创建任务文件
cat > /tmp/downsample_temperature.flux << 'EOF'
option task = {
  name: "downsample_temperature",
  every: 5m,
  delay: 1m
}

from(bucket: "raw_data")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
  |> to(bucket: "downsampled_data", org: "myorg")
EOF

# 应用任务
influx task create --file /tmp/downsample_temperature.flux

# 查看所有任务
influx task list

# 查看任务详情
influx task find --name downsample_temperature

# 查看任务运行日志
influx task logs --name downsample_temperature

# 删除任务
influx task delete --name downsample_temperature
```

### 多级降采样

```flux
# 1级：5分钟聚合（保存7天）
option task = { name: "downsample_5m", every: 1m }
from(bucket: "raw_data")
  |> range(start: -1m)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
  |> set(key: "agg_level", value: "5m")
  |> to(bucket: "agg_5m", org: "myorg")

# 2级：1小时聚合（保存30天）
option task = { name: "downsample_1h", every: 5m }
from(bucket: "agg_5m")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> set(key: "agg_level", value: "1h")
  |> to(bucket: "agg_1h", org: "myorg")

# 3级：1天聚合（保存365天）
option task = { name: "downsample_1d", every: 1h }
from(bucket: "agg_1h")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
  |> set(key: "agg_level", value: "1d")
  |> to(bucket: "agg_1d", org: "myorg")
```

---

## 数据保留策略

### 保留策略配置

```bash
# 创建 Bucket 时设置保留策略
influx bucket create \
  --name mybucket \
  --org myorg \
  --retention 7d  # 保留7天

# 更新保留策略
influx bucket update \
  --name mybucket \
  --org myorg \
  --retention 30d

# 查看所有 Bucket
influx bucket list

# 查看 Bucket 详情
influx bucket find --name mybucket

# 删除 Bucket
influx bucket delete --name mybucket
```

### 多级保留策略

```
┌──────────────────────────────────────────────────────┐
│           多级数据保留策略                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  raw_data (原始数据)                                 │
│  ├── 保留 7 天                                       │
│  ├── 秒级精度                                        │
│  └── 数据量大                                        │
│                                                      │
│  agg_5m (5分钟聚合)                                  │
│  ├── 保留 30 天                                      │
│  ├── 5分钟精度                                       │
│  └── 数据量中等                                      │
│                                                      │
│  agg_1h (1小时聚合)                                  │
│  ├── 保留 365 天                                     │
│  ├── 1小时精度                                       │
│  └── 数据量小                                        │
│                                                      │
│  agg_1d (1天聚合)                                    │
│  ├── 永久保留                                        │
│  ├── 1天精度                                         │
│  └── 数据量最小                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 数据生命周期管理

```bash
# 创建不同保留周期的 Bucket
influx bucket create --name raw_data --retention 7d
influx bucket create --name agg_5m --retention 30d
influx bucket create --name agg_1h --retention 365d
influx bucket create --name agg_1d --retention 0  # 永久保留

# 配置连续查询自动降采样
# (参考上一节的连续查询配置)
```

---

## 集群配置

### InfluxDB Enterprise 集群

```
┌──────────────────────────────────────────────────────┐
│         InfluxDB Enterprise 集群架构                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │           Meta 节点（3个）                │       │
│  │  （集群元数据管理）                        │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │         Data 节点（3个）                 │       │
│  │  ┌─────────┬─────────┬─────────┐         │       │
│  │  │ Data 1  │ Data 2  │ Data 3  │         │       │
│  │  │ (Shard) │ (Shard) │ (Shard) │         │       │
│  │  └─────────┴─────────┴─────────┘         │       │
│  │                                          │       │
│  │  数据分片存储（按时间分片）                │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │         Data 节点副本（3个）              │       │
│  │  ┌─────────┬─────────┬─────────┐         │       │
│  │  │ Data 4  │ Data 5  │ Data 6  │         │       │
│  │  │ (Replica)│(Replica)│(Replica)│         │       │
│  │  └─────────┴─────────┴─────────┘         │       │
│  │                                          │       │
│  │  数据副本存储（冗余备份）                  │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 集群配置

```toml
# influxdb.conf

[meta]
  # Meta 节点配置
  enabled = true
  bind-address = ":8089"
  http-bind-address = ":8091"
  https-enabled = true
  https-certificate = "/etc/ssl/influxdb.pem"

[data]
  # Data 节点配置
  enabled = true

  # 集群配置
  internal-shared-secret = "long-passphrase-here"
  meta-join = ["meta1:8091", "meta2:8091", "meta3:8091"]

  # 分片配置
  shard-precreation = true
  max-shard-groups = 10000
  max-shards-per-group = 10000

  # 副本配置
  max-series-per-database = 10000000
  max-values-per-tag = 100000

[coordinator]
  # 查询配置
  write-timeout = "10s"
  max-concurrent-queries = 0

[retention]
  # 保留策略检查间隔
  check-interval = "30m"

[monitor]
  # 监控配置
  store-enabled = true
```

### 集群管理

```bash
# 添加 Data 节点
influxd-ctl add-data <data-node-addr>

# 添加 Meta 节点
influxd-ctl add-meta <meta-node-addr>

# 查看集群状态
influxd-ctl show

# 查看节点
influxd-ctl show-nodes

# 复制分片
influxd-ctl copy-shard <shard-id> <from-node> <to-node>

# 删除分片
influxd-ctl delete-shard <shard-id>
```

---

## ✅ 本章小结

### 学习检查清单

完成本章学习后，请确认你能够：

- [ ] 理解时序数据的特点和模型
- [ ] 掌握 InfluxDB 的核心概念（Measurement、Tag、Field）
- [ ] 使用 Flux 语言进行复杂查询
- [ ] 实现连续查询（降采样）
- [ ] 配置数据保留策略
- [ ] 设计多级降采样方案
- [ ] 部署和管理 InfluxDB 集群

### 核心要点回顾

1. **数据模型**：Measurement（测量）、Tag（标签）、Field（字段）
2. **Flux 查询**：强大的函数式查询语言
3. **连续查询**：自动降采样，提升性能
4. **保留策略**：多级存储，平衡成本和查询需求
5. **集群架构**：Meta 节点 + Data 节点，支持横向扩展

## 📚 延伸阅读

- [第27章：TDengine IoT 数据库 →](./chapter-26)
- [第28章：Milvus 向量数据库 →](./chapter-27)
- [InfluxDB 官方文档](https://docs.influxdata.com/)
- [Flux 查询指南](https://docs.influxdata.com/flux/v0.x/)

---

**更新时间**：2026年2月 | **版本**：v1.0
