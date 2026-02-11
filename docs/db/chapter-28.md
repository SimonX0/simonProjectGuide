---
title: 第28章：TDengine IoT 数据库
---

# ：TDengine IoT 数据库

> **难度等级**：⭐⭐⭐ 中高级 | **学习时长**：10小时 | **实战项目**：工业物联网平台

## 📚 本章目录

- [26.1 超级表设计](#261-超级表设计)
- [26.2 子表管理](#262-子表管理)
- [26.3 查询优化](#263-查询优化)
- [26.4 数据订阅](#264-数据订阅)
- [26.5 实战案例](#265-实战案例)

---

## 超级表设计

### TDengine 数据模型

```
┌──────────────────────────────────────────────────────┐
│         TDengine 数据模型（3层结构）                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │         数据库（Database）                │       │
│  │                                          │       │
│  │  ┌────────────────────────────────┐     │       │
│  │  │    超级表（Super Table）        │     │       │
│  │  │                                 │     │       │
│  │  │  - 时间戳                        │     │       │
│  │  │  - 标签（Tag，静态）            │     │       │
│  │  │  - 数据列（Data，动态）         │     │       │
│  │  │                                 │     │       │
│  │  │  ┌──────────────────────────┐ │     │       │
│  │  │  │   子表（Sub Table）       │ │     │       │
│  │  │  │                           │ │     │       │
│  │  │  │  device_1 (tbname)        │ │     │       │
│  │  │  │  device_2 (tbname)        │ │     │       │
│  │  │  │  ...                       │ │     │       │
│  │  │  │                           │ │     │       │
│  │  │  │  每个子表对应一个设备     │ │     │       │
│  │  │  └──────────────────────────┘ │     │       │
│  │  └────────────────────────────────┘     │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 核心概念

**1. 超级表（STable）**

```sql
-- 创建超级表
CREATE STABLE meters (
    ts TIMESTAMP,                -- 时间戳（必须）
    current FLOAT,               -- 电流（数据列）
    voltage INT,                 -- 电压（数据列）
    phase FLOAT                  -- 相位（数据列）
) TAGS (
    location BINARY(50),         -- 位置（标签）
    groupId INT                  -- 分组ID（标签）
);

-- 特点：
-- 1. 定义所有子表的共同结构
-- 2. TAG 列用于标识不同的子表
-- 3. 数据列存储实际测量值
-- 4. 自动按时间戳建立索引
```

**2. 子表（Table）**

```sql
-- 创建子表（自动从超级表继承结构）
CREATE TABLE d1001 USING meters TAGS ('Beijing.Chaoyang', 2);
CREATE TABLE d1002 USING meters TAGS ('Beijing.Haidian', 2);
CREATE TABLE d1003 USING meters TAGS ('Shanghai.Pudong', 3);

-- 或者使用自动创建子表（INSERT 时自动创建）
INSERT INTO d1001 USING meters TAGS ('Beijing.Chaoyang', 2)
VALUES (NOW, 10.5, 220, 0.32);

-- 特点：
-- 1. 继承超级表的结构
-- 2. 每个 TAG 组合唯一标识一个子表
-- 3. 子表名必须全局唯一
```

**3. 数据类型**

| 类型 | 字节数 | 说明 |
|-----|-------|------|
| **TIMESTAMP** | 8 | 时间戳，精度到毫秒 |
| **INT** | 4 | 整型 |
| **BIGINT** | 8 | 长整型 |
| **FLOAT** | 4 | 浮点型 |
| **DOUBLE** | 8 | 双精度浮点 |
| **BINARY** | 自定义 | 字符串，需指定长度 |
| **SMALLINT** | 2 | 短整型 |
| **TINYINT** | 1 | 微整型 |
| **BOOL** | 1 | 布尔型 |
| **NCHAR** | 自定义 | Unicode 字符串 |

### 超级表设计示例

**智能电表系统**：

```sql
-- 创建数据库
CREATE DATABASE power;

-- 使用数据库
USE power;

-- 创建智能电表超级表
CREATE STABLE smart_meters (
    ts TIMESTAMP,                    -- 时间戳
    voltage FLOAT,                   -- 电压
    current FLOAT,                   -- 电流
    active_power FLOAT,              -- 有功功率
    reactive_power FLOAT,            -- 无功功率
    power_factor FLOAT,              -- 功率因数
    frequency FLOAT,                 -- 频率
    total_energy FLOAT,              -- 累计电量
    status INT                       -- 状态
) TAGS (
    meter_id BINARY(20),             -- 电表ID
    location BINARY(50),             -- 位置
    customer_id BINARY(20),          -- 客户ID
    meter_type INT,                  -- 电表类型
    rated_capacity FLOAT             -- 额定容量
);

-- 创建子表
CREATE TABLE meter_001 USING smart_meters
TAGS ('M001', 'Building A.Floor 1', 'C001', 1, 100);

CREATE TABLE meter_002 USING smart_meters
TAGS ('M002', 'Building A.Floor 2', 'C002', 1, 100);

CREATE TABLE meter_003 USING smart_meters
TAGS ('M003', 'Building B.Floor 1', 'C003', 2, 200);
```

**工业传感器系统**：

```sql
-- 创建数据库
CREATE DATABASE industry;

-- 创建传感器超级表
CREATE STABLE sensors (
    ts TIMESTAMP,                    -- 时间戳
    temperature FLOAT,               -- 温度
    humidity FLOAT,                  -- 湿度
    pressure FLOAT,                  -- 压力
    vibration FLOAT,                 -- 振动
    flow_rate FLOAT,                 -- 流量
    quality_score FLOAT              -- 质量分数
) TAGS (
    sensor_id BINARY(20),            -- 传感器ID
    equipment_id BINARY(20),         -- 设备ID
    production_line BINARY(20),      -- 产线
    workshop BINARY(20),             -- 车间
    factory BINARY(20),              -- 工厂
    sensor_type INT                  -- 传感器类型
);

-- 创建子表（自动创建）
INSERT INTO sensor_temp_001 USING sensors TAGS
('S001', 'EQ001', 'LINE1', 'WORKSHOP1', 'FACTORY1', 1)
VALUES (NOW, 25.5, 65.2, 1013.25, 0.05, 120.5, 98.5);
```

---

## 子表管理

### 创建子表

```sql
-- 方式1：显式创建
CREATE TABLE d1001 USING meters TAGS ('Beijing', 2);

-- 方式2：INSERT 时自动创建
INSERT INTO d1002 USING meters TAGS ('Shanghai', 3)
VALUES (NOW, 10.3, 219, 0.31);

-- 方式3：使用 STable 表名自动创建
INSERT INTO meters USING meters TAGS ('Guangzhou', 4)
VALUES (NOW, 11.2, 218, 0.33);
-- TDengine 会自动生成子表名

-- 方式4：批量创建（通过应用程序）
-- Python 示例
import taos

conn = taos.connect(host="localhost", user="root", password="taosdata", database="power")
cursor = conn.cursor()

for i in range(1, 101):
    table_name = f"meter_{i:03d}"
    meter_id = f"M{i:03d}"
    location = f"Building {i // 10 + 1}"

    sql = f"CREATE TABLE {table_name} USING smart_meters TAGS ('{meter_id}', '{location}', 'C{i:03d}', 1, 100)"
    cursor.execute(sql)
```

### 查看子表

```sql
-- 查看超级表的所有子表
SELECT TBNAME FROM meters;

-- 查看子表数量
SELECT COUNT(*) FROM meters;

-- 查看指定子表的数据
SELECT * FROM d1001;

-- 查看子表的 TAG 信息
SELECT * FROM information_schema.ins_tables WHERE db_name='power';

-- 查看子表的创建语句
SHOW CREATE TABLE d1001;

-- 查看超级表的子表分布
SELECT DISTINCT TBNAME, location, groupId FROM meters;
```

### 删除子表

```sql
-- 删除单个子表
DROP TABLE d1001;

-- 批量删除子表
DROP TABLE IF EXISTS d1001, d1002, d1003;

-- 删除超级表（会删除所有子表）
DROP STABLE IF EXISTS meters;
```

---

## 查询优化

### 基础查询

```sql
-- 查询单个子表
SELECT * FROM d1001 WHERE ts > NOW - 1h;

-- 查询超级表（所有子表）
SELECT * FROM meters WHERE ts > NOW - 1h;

-- 按 TAG 过滤
SELECT * FROM meters WHERE location = 'Beijing' AND ts > NOW - 1h;

-- 多条件过滤
SELECT * FROM meters
WHERE location = 'Beijing'
  AND groupId = 2
  AND ts > NOW - 1h;

-- 时间范围查询
SELECT * FROM meters
WHERE ts BETWEEN '2024-02-11 00:00:00' AND '2024-02-11 23:59:59';

-- 查询最新数据
SELECT * FROM meters WHERE ts = (SELECT MAX(ts) FROM meters);

-- 查询每个子表的最新数据
SELECT * FROM meters WHERE ts > NOW - 10s;
```

### 聚合查询

```sql
-- 求平均值
SELECT AVG(current) FROM meters WHERE ts > NOW - 1h;

-- 求最大值和最小值
SELECT MAX(voltage), MIN(voltage) FROM meters WHERE ts > NOW - 1h;

-- 统计数量
SELECT COUNT(*) FROM meters WHERE ts > NOW - 1h;

-- 按子表分组统计
SELECT TBNAME, AVG(current) as avg_current
FROM meters
WHERE ts > NOW - 1h
GROUP BY TBNAME;

-- 按 TAG 分组统计
SELECT location, AVG(current) as avg_current
FROM meters
WHERE ts > NOW - 1h
GROUP BY location;

-- 多个聚合函数
SELECT
    COUNT(*) as count,
    AVG(current) as avg_current,
    MAX(voltage) as max_voltage,
    MIN(voltage) as min_voltage
FROM meters
WHERE ts > NOW - 1h;
```

### 时间窗口查询

```sql
-- 按时间窗口聚合（每5分钟）
SELECT
    _wstart as window_start,
    _wend as window_end,
    AVG(current) as avg_current
FROM meters
WHERE ts > NOW - 1h
INTERVAL(5m) SLIDING(1m);

-- 按小时聚合
SELECT
    _wstart,
    AVG(current) as avg_current,
    MAX(voltage) as max_voltage
FROM meters
WHERE ts > NOW - 24h
INTERVAL(1h);

-- 按天聚合
SELECT
    _wstart as date,
    AVG(current) as avg_current
FROM meters
WHERE ts > NOW - 30d
INTERVAL(1d);

-- 滑动窗口
SELECT
    _wstart,
    _wend,
    AVG(current) as avg_current
FROM meters
WHERE ts > NOW - 1h
INTERVAL(10m) SLIDING(5m);

-- 多个时间窗口（不同粒度）
SELECT
    _wstart as hour,
    AVG(current) as hourly_avg
FROM meters
WHERE ts > NOW - 24h
INTERVAL(1h);

SELECT
    _wstart as day,
    AVG(current) as daily_avg
FROM meters
WHERE ts > NOW - 30d
INTERVAL(1d);
```

### 高级查询

```sql
-- JOIN 查询（两个超级表）
SELECT
    a.ts,
    a.current,
    b.temperature
FROM meters a
JOIN sensors b
ON a.ts = b.ts
WHERE a.ts > NOW - 1h;

-- 子查询
SELECT * FROM (
    SELECT TBNAME, AVG(current) as avg_current
    FROM meters
    WHERE ts > NOW - 1h
    GROUP BY TBNAME
) WHERE avg_current > 10;

-- 分页查询
SELECT * FROM meters
WHERE ts > NOW - 1h
LIMIT 100 OFFSET 0;

-- 排序
SELECT * FROM meters
WHERE ts > NOW - 1h
ORDER BY ts DESC;

-- 使用 PARTITION BY
SELECT
    _wstart,
    location,
    AVG(current) as avg_current
FROM meters
WHERE ts > NOW - 1h
PARTITION BY location
INTERVAL(5m);

-- 状态窗口
SELECT
    _wstart,
    last_row(status) as status
FROM meters
WHERE ts > NOW - 1h
STATE_WINDOW(status);
```

---

## 数据订阅

### 创建订阅

```sql
-- 创建订阅
CREATE TOPIC IF NOT EXISTS topic_meters AS
SELECT * FROM meters;

-- 查看订阅
SHOW TOPICS;

-- 删除订阅
DROP TOPIC IF EXISTS topic_meters;
```

### 消费订阅

```bash
# 使用 taosadapter 消费订阅
# 需要安装 taosadapter

# 启动消费者
taosadapter subscribe \
  --topic topic_meters \
  --consumer-group group1 \
  --consumer-id consumer1

# 或使用 REST API
curl -X POST http://localhost:6041/rest/sql \
  -H "Authorization: Basic $(echo -n 'root:taosdata' | base64)" \
  -d "CREATE TOPIC IF NOT EXISTS topic_meters AS SELECT * FROM meters"
```

### Java 消费示例

```java
import com.taosdata.jdbc.TSDBDriver;
import java.sql.*;
import java.util.Properties;

public class TDengineConsumer {

    public static void main(String[] args) {
        String url = "jdbc:TAOS://localhost:6030/power";
        Properties props = new Properties();
        props.setProperty("user", "root");
        props.setProperty("password", "taosdata");

        try (Connection conn = DriverManager.getConnection(url, props)) {
            Statement stmt = conn.createStatement();

            // 创建订阅
            stmt.execute("CREATE TOPIC IF NOT EXISTS topic_meters AS " +
                        "SELECT ts, current, voltage, phase FROM meters");

            // 消费数据
            String sql = "SELECT * FROM topic_meters";
            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                Timestamp ts = rs.getTimestamp("ts");
                float current = rs.getFloat("current");
                int voltage = rs.getInt("voltage");
                float phase = rs.getFloat("phase");

                System.out.printf("ts: %s, current: %.2f, voltage: %d, phase: %.2f%n",
                                  ts, current, voltage, phase);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

---

## 实战案例

### 工业物联网监控平台

**场景**：
- 1000 个传感器
- 每秒采集一次数据
- 需要实时监控和报警
- 需要历史数据分析

**数据库设计**：

```sql
-- 创建数据库
CREATE DATABASE iot_monitor
  KEEP 365            -- 保留365天
  DURATION 10         -- 数据文件存储10天
  REPLICA 1;          -- 副本数

-- 使用数据库
USE iot_monitor;

-- 创建传感器超级表
CREATE STABLE sensor_data (
    ts TIMESTAMP,
    temperature FLOAT,
    humidity FLOAT,
    pressure FLOAT,
    vibration FLOAT,
    status INT
) TAGS (
    sensor_id BINARY(20),
    equipment_id BINARY(20),
    location BINARY(50),
    sensor_type INT
);

-- 创建告警超级表
CREATE STABLE alarms (
    ts TIMESTAMP,
    alarm_type INT,
    alarm_level INT,
    message BINARY(200),
    value FLOAT
) TAGS (
    sensor_id BINARY(20),
    equipment_id BINARY(20),
    location BINARY(50)
);
```

**数据写入**：

```python
import taos
import time
import random

conn = taos.connect(host='localhost', user='root', password='taosdata', database='iot_monitor')
cursor = conn.cursor()

# 批量写入
def batch_insert():
    data = []
    now = int(time.time() * 1000)

    for sensor_id in range(1, 1001):
        table_name = f"sensor_{sensor_id:04d}"

        # 生成模拟数据
        temperature = 20 + random.random() * 30
        humidity = 40 + random.random() * 40
        pressure = 1000 + random.random() * 30
        vibration = random.random() * 5
        status = 1 if temperature < 50 and vibration < 3 else 0

        data.append(f"('{table_name}', '{now}', {temperature}, {humidity}, {pressure}, {vibration}, {status})")

    # 批量插入（自动创建子表）
    sql = f"INSERT INTO sensor_data USING sensor_data TAGS " + \
          ",".join([f"('sensor_{i:04d}', 'EQ{i:04d}', 'Location {i // 100}', 1)" for i in range(1, 1001)]) + \
          " VALUES " + ",".join(data)

    cursor.execute(sql)
    conn.commit()

# 持续写入
while True:
    batch_insert()
    time.sleep(1)  # 每秒采集一次
```

**实时监控查询**：

```sql
-- 查询所有传感器最新数据
SELECT
    sensor_id,
    location,
    temperature,
    humidity,
    pressure,
    vibration,
    status
FROM sensor_data
WHERE ts > NOW - 10s;

-- 查询异常传感器
SELECT
    sensor_id,
    location,
    temperature,
    vibration
FROM sensor_data
WHERE ts > NOW - 10s
  AND (temperature > 50 OR vibration > 3);

-- 统计各位置传感器状态
SELECT
    location,
    COUNT(*) as total_sensors,
    SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as normal_count,
    SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as alarm_count
FROM sensor_data
WHERE ts > NOW - 10s
GROUP BY location;

-- 按设备聚合（每5分钟）
SELECT
    _wstart as window_start,
    equipment_id,
    AVG(temperature) as avg_temp,
    MAX(vibration) as max_vibration
FROM sensor_data
WHERE ts > NOW - 1h
PARTITION BY equipment_id
INTERVAL(5m);
```

**告警规则**：

```sql
-- 创建告警（使用连续查询）
CREATE STREAM IF NOT EXISTS alert_stream
TRIGGER AT_ONCE
INTO alarms
AS SELECT
    NOW() as ts,
    CASE
        WHEN temperature > 50 THEN 1  -- 温度告警
        WHEN vibration > 3 THEN 2     -- 振动告警
        WHEN pressure < 990 THEN 3    -- 压力告警
        ELSE 0
    END as alarm_type,
    CASE
        WHEN temperature > 60 THEN 2  -- 严重告警
        ELSE 1
    END as alarm_level,
    CASE
        WHEN temperature > 50 THEN CONCAT('Temperature high: ', temperature, '°C')
        WHEN vibration > 3 THEN CONCAT('Vibration high: ', vibration, 'mm/s')
        WHEN pressure < 990 THEN CONCAT('Pressure low: ', pressure, 'hPa')
        ELSE 'Normal'
    END as message,
    temperature as value
FROM sensor_data
WHERE ts > NOW - 10s
  AND (temperature > 50 OR vibration > 3 OR pressure < 990);
```

**历史数据分析**：

```sql
-- 日均值统计
SELECT
    DATE_FORMAT(ts, 'yyyy-MM-dd') as date,
    AVG(temperature) as avg_temp,
    MAX(temperature) as max_temp,
    MIN(temperature) as min_temp,
    STDDEV(temperature) as stddev_temp
FROM sensor_data
WHERE ts > NOW - 30d
GROUP BY date
ORDER BY date DESC;

-- 趋势分析（按小时）
SELECT
    _wstart as hour,
    AVG(temperature) as avg_temp,
    AVG(vibration) as avg_vibration
FROM sensor_data
WHERE ts > NOW - 7d
INTERVAL(1h);

-- 对比分析（不同位置）
SELECT
    location,
    AVG(temperature) as avg_temp,
    AVG(vibration) as avg_vibration,
    COUNT(*) as data_points
FROM sensor_data
WHERE ts > NOW - 1d
GROUP BY location
ORDER BY avg_temp DESC;

-- 异常检测（基于统计）
SELECT
    sensor_id,
    AVG(temperature) as avg_temp,
    STDDEV(temperature) as stddev_temp,
    AVG(temperature) + 3 * STDDEV(temperature) as upper_threshold,
    AVG(temperature) - 3 * STDDEV(temperature) as lower_threshold
FROM sensor_data
WHERE ts > NOW - 7d
GROUP BY sensor_id
HAVING AVG(temperature) > AVG(temperature) + 3 * STDDEV(temperature);
```

---

## ✅ 本章小结

### 学习检查清单

完成本章学习后，请确认你能够：

- [ ] 理解 TDengine 的3层数据模型
- [ ] 设计合理的超级表和子表结构
- [ ] 使用 TAG 和数据列区分静态和动态数据
- [ ] 编写高效的查询语句
- [ ] 使用时间窗口进行聚合分析
- [ ] 配置数据订阅
- [ ] 实现工业物联网监控平台

### 核心要点回顾

1. **3层模型**：数据库 → 超级表 → 子表
2. **超级表**：定义所有子表的共同结构
3. **子表**：自动继承超级表结构，TAG 唯一标识
4. **查询优化**：利用 TAG 过滤，使用时间窗口聚合
5. **订阅机制**：实时推送数据变更

## 📚 延伸阅读

- [第28章：InfluxDB 时序数据库 →](./chapter-27)
- [第29章：Milvus 向量数据库 →](./chapter-28)
- [TDengine 官方文档](https://docs.tdengine.com/)
- [TDengine 最佳实践](https://docs.tdengine.com/3.0/develop/)

---

**更新时间**：2026年2月 | **版本**：v1.0
