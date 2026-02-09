---
title: 监控与日志面试题
---

# 监控与日志面试题

## 监控体系设计

### 1. 什么是可观测性（Observability）？与监控的区别？

**可观测性定义**：
通过系统外部输出（日志、指标、链路追踪）推断系统内部状态的能力。

**可观测性三大支柱**：
```
┌─────────────────────────────────────────────────────┐
│                  可观测性体系                         │
└─────────────────────────────────────────────────────┘

           ┌──────────────┐
           │   日志 Logs   │  ← 发生了什么
           │  (What)      │
           └──────┬───────┘
                  │
           ┌──────┴───────┐
           │              │
    ┌──────▼──────┐ ┌─────▼──────┐
    │  指标 Metrics│ │ 链路 Traces│
    │  (How much) │ │ (Where)    │
    └─────────────┘ └────────────┘
```

**三大支柱对比**：

| 维度      | Logs（日志）          | Metrics（指标）          | Traces（链路）          |
|----------|---------------------|------------------------|------------------------|
| **数据**  | 事件记录              | 数值时间序列              | 请求路径                |
| **用途**  | 问题诊断、审计         | 趋势分析、告警            | 性能分析、依赖关系        |
| **例子**  | Error at line 123    | CPU: 80%               | 调用链: API → Service   |
| **存储**  | Elasticsearch        | Prometheus/InfluxDB    | Jaeger/Tempo          |
| **查询**  | 全文搜索              | PromQL                 | Trace ID查询          |
| **成本**  | 高                    | 低                      | 中                     |

**监控 vs 可观测性**：

| 特性       | 监控                  | 可观测性              |
|-----------|----------------------|----------------------|
| **关注点**  | 已知问题              | 未知问题              |
| **方法**   | 预设指标和告警          | 探索式分析             |
| **响应**   | 被动告警               | 主动调查               |
| **能力**   | 知道"系统出问题了"      | 知道"为什么出问题"      |

### 2. 设计一个完整的监控体系架构？

**完整架构**：
```
┌─────────────────────────────────────────────────────────────┐
│                      监控体系架构                              │
└─────────────────────────────────────────────────────────────┘

┌────────────────── 应用层 ──────────────────┐
│  应用 → Metrics Exporter →                  │
│  Nginx → Nginx Exporter →                  │
│  MySQL → MySQL Exporter →                  │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌────────────────── 采集层 ──────────────────┐
│  Prometheus (Pull模式)                      │
│    - 抓取指标（每15秒）                       │
│    - 计算和聚合                               │
│    - 存储时序数据                             │
│  Telegraf (Push模式)                         │
│  OpenTelemetry Collector                     │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌────────────────── 存储层 ──────────────────┐
│  Prometheus (短期存储，15天)                 │
│  Thanos (长期存储)                           │
│  VictoriaMetrics (高性能存储)                │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌────────────────── 可视化层 ─────────────────┐
│  Grafana                                   │
│    - Dashboard                              │
│    - Panel                                  │
│    - Annotation                             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌────────────────── 告警层 ──────────────────┐
│  Alertmanager                              │
│    - 去重、分组、路由                        │
│    - 沉默、抑制                              │
│  PagerDuty / 钉钉 / 飞书                     │
└─────────────────────────────────────────────┘

并行系统：日志和链路
┌──────────────┐  ┌──────────────┐
│  ELK Stack   │  │  Jaeger      │
│  Loki        │  │  Tempo       │
└──────────────┘  └──────────────┘
```

**关键组件选型**：

**1. 指标采集**
```yaml
# Node Exporter - 系统指标
- CPU、内存、磁盘、网络
- 运行在每个节点

# cAdvisor - 容器指标
- 容器资源使用
- Kubelet内置

# Blackbox Exporter - 探针监控
- HTTP、HTTPS、TCP、ICMP
- 主动探测

# 应用自定义Exporter
- 业务指标暴露
```

**2. 存储选型**
| 方案              | 优点                  | 缺点                  | 适用场景          |
|------------------|----------------------|----------------------|------------------|
| Prometheus       | 简单、社区活跃          | 单机扩展性有限          | 中小集群          |
| Thanos           | 无限存储、兼容PromQL   | 架构复杂               | 大规模集群         |
| VictoriaMetrics  | 高性能、资源占用低       | 不如Prometheus流行     | 资源受限环境       |
| Cortex           | 水平扩展              | 维护复杂               | 超大规模集群       |

**3. 监控分层**
```
Layer 1: 基础设施监控
  ├─ 节点健康（Node Exporter）
  ├─ 网络连通性（Blackbox Exporter）
  └─ 存储容量

Layer 2: 容器平台监控
  ├─ Pod状态（Kubelet）
  ├─ 资源使用（cAdvisor）
  └─ 组件健康（Kubernetes组件）

Layer 3: 应用监控
  ├─ 服务健康（自定义Exporter）
  ├─ 业务指标（订单量、DAU）
  └─ 性能指标（响应时间、QPS）

Layer 4: 用户体验监控
  ├─ 页面加载速度
  ├─ API成功率
  └─ 错误率
```

## Prometheus

### 3. Prometheus的核心概念和数据模型？

**核心概念**：

**1. Metric（指标）**
```yaml
# Counter（计数器）- 只增不减
http_requests_total{method="GET", status="200"} 12345

# Gauge（仪表盘）- 可增可减
memory_usage_bytes{instance="localhost:9090"} 1234567890

# Histogram（直方图）- 分布统计
http_request_duration_seconds_bucket{le="0.1"} 1000
http_request_duration_seconds_bucket{le="0.5"} 1500
http_request_duration_seconds_bucket{le="+Inf"} 2000

# Summary（摘要）- 分布统计（客户端计算）
http_request_duration_seconds{quantile="0.5"} 0.05
http_request_duration_seconds{quantile="0.9"} 0.2
```

**2. Labels（标签）**
```promql
# 指标名称 + 标签组成唯一的时间序列
http_requests_total{method="GET", status="200", endpoint="/api/users"}

# 常用标签
job: scrape配置中的job名称
instance: 目标实例
__address__: 采集目标地址
```

**3. 采集模式（Pull vs Push）**
```
Pull模式（Prometheus默认）:
┌─────────────┐     HTTP Pull     ┌─────────────┐
│ Prometheus  │ ─────────────────→│  Target     │
└─────────────┘                    └─────────────┘

优点:
- 目标无需感知Prometheus
- 服务发现更容易
- 可以单点查看目标状态

Push模式（Pushgateway）:
┌─────────────┐     HTTP Push     ┌──────────────┐
│   Client    │ ─────────────────→│Pushgateway  │←┐
└─────────────┘                    └──────────────┘ │
                                                   │ HTTP Pull
┌─────────────┐                                    │
│ Prometheus  │ ───────────────────────────────────┘
└─────────────┘

适用场景:
- 短生命周期任务（Cron Job）
- 批处理任务
```

**配置示例**：
```yaml
# prometheus.yml
global:
  scrape_interval: 15s    # 采集间隔
  evaluation_interval: 15s # 规则评估间隔
  external_labels:
    cluster: 'production'
    replica: '1'

# 告警规则文件
rule_files:
  - '/etc/prometheus/rules/*.yml'

# 抓取配置
scrape_configs:
  # Kubernetes API Server
  - job_name: 'kubernetes-apiservers'
    kubernetes_sd_configs:
    - role: endpoints
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
    - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
      action: keep
      regex: default;kubernetes;https

  # Kubernetes Nodes
  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
    - role: node
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
    - action: labelmap
      regex: __meta_kubernetes_node_label_(.+)

  # Application Pods
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
    - role: pod
    relabel_configs:
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
      action: keep
      regex: true
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
      action: replace
      target_label: __metrics_path__
      regex: (.+)
    - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
      action: replace
      regex: ([^:]+)(?::\d+)?;(\d+)
      replacement: $1:$2
      target_label: __address__
    - action: labelmap
      regex: __meta_kubernetes_pod_label_(.+)
    - source_labels: [__meta_kubernetes_namespace]
      action: replace
      target_label: kubernetes_namespace
    - source_labels: [__meta_kubernetes_pod_name]
      action: replace
      target_label: kubernetes_pod_name

# Alertmanager配置
alerting:
  alertmanagers:
  - static_configs:
    - targets:
      - alertmanager:9093
```

### 4. PromQL常用查询和聚合操作？

**基础查询**：
```promql
# 即时向量（Instant Vector）
http_requests_total  # 所有时间序列的最新值

# 范围向量（Range Vector）
http_requests_total[5m]  # 过去5分钟的所有样本

# 标签过滤
http_requests_total{job="api-server"}  # 精确匹配
http_requests_total{env=~"prod|staging"}  # 正则匹配
http_requests_total{status!~"4.."}  # 反向匹配

# 时间偏移
http_requests_total offset 5m  # 5分钟前的值
```

**操作符**：
```promql
# 算术运算
http_requests_total * 0.5  # 乘法
memory_available_bytes - memory_used_bytes  # 减法

# 比较运算
http_requests_total > 1000  # 大于
http_requests_total == 0  # 等于

# 逻辑运算
http_requests_total{method="GET"} or http_requests_total{method="POST"}
http_requests_total{method="GET"} and http_requests_total{status="200"}
http_requests_total unless http_requests_total{status="500"}

# 聚合运算
sum(http_requests_total)  # 求和
avg(memory_usage_bytes)  # 平均值
max(response_time_seconds)  # 最大值
min(response_time_seconds)  # 最小值
count(up)  # 计数
stddev(response_time_seconds)  # 标准差
```

**常用函数**：
```promql
# rate() - 计算速率（用于Counter）
rate(http_requests_total[5m])  # 每秒请求数
irate(http_requests_total[5m])  # 瞬时速率（更敏感）

# increase() - 计算增量
increase(http_requests_total[1h])  # 1小时内的增量

# delta() - 计算差值（用于Gauge）
delta(memory_usage_bytes[5m])

# predict_linear() - 线性预测
predict_linear(disk_usage_bytes[1h], 4*3600)  # 预测4小时后的值

# histogram相关的函数
rate(http_request_duration_seconds_bucket[5m])  # 直方图速率
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))  # P95

# 时间函数
rate(http_requests_total[5m]) * 3600  # 转换为每小时
rate(http_requests_total[5m]) * 60  # 转换为每分钟

# label_join() - 标签拼接
label_join(up, "target", "-", "instance", "job")

# label_replace() - 标签替换
label_replace(up, "host", "$1", "instance", "(.*):.*")
```

**聚合操作**：
```promql
# by子句 - 按标签分组
sum(http_requests_total) by (job)  # 按job分组求和
sum(http_requests_total) by (job, instance)  # 按job和instance分组

# without子句 - 排除标签
sum(http_requests_total) without (instance)  # 排除instance标签

# 聚合实例数
count(up) by (job)  # 每个job的实例数

# topk/bottomk - 前N/后N
topk(5, http_requests_total)  # 请求数最多的5个实例
bottomk(5, http_requests_total)  # 请求数最少的5个实例
```

**实战查询示例**：
```promql
# 1. CPU使用率
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 2. 内存使用率
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# 3. 磁盘使用率
(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100

# 4. Pod重启次数
increase(kube_pod_container_status_restarts_total[1h])

# 5. QPS（每秒请求数）
sum(rate(http_requests_total[5m])) by (service)

# 6. 错误率
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100

# 7. P95响应时间
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# 8. 预测磁盘何时满
predict_linear(node_filesystem_avail_bytes[1h], 30*24*3600) < 0

# 9. 检测Pod崩溃
rate(kube_pod_container_status_restarts_total[1h]) > 0

# 10. 服务不可用
up{job="myapp"} == 0
```

## Grafana

### 5. Grafana的核心功能和常用Panel？

**Grafana架构**：
```
┌─────────────────────────────────────────────────┐
│                  Grafana                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Dashboard   │  │  Folder      │            │
│  └──────┬───────┘  └──────────────┘            │
│         │                                       │
│  ┌──────▼────────────────────────┐             │
│  │         Panel                  │             │
│  ├────────────────────────────────┤             │
│  │  - Graph (时序图)               │             │
│  │  - Stat (数值)                  │             │
│  │  - Table (表格)                 │             │
│  │  - Heatmap (热力图)             │             │
│  │  - Gauge (仪表盘)               │             │
│  │  - Logs (日志)                  │             │
│  │  - Bar Chart (柱状图)           │             │
│  │  - Pie Chart (饼图)             │             │
│  │  - Worldmap (世界地图)          │             │
│  └────────────────────────────────┘             │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │       Query Editor               │          │
│  ├──────────────────────────────────┤          │
│  │  - Prometheus                   │          │
│  │  - Loki                         │          │
│  │  - Elasticsearch                │          │
│  │  - InfluxDB                     │          │
│  │  - MySQL                        │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
```

**常用Panel类型**：

**1. Time Series（时序图）**
```json
{
  "type": "timeseries",
  "title": "CPU使用率",
  "targets": [
    {
      "expr": "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "percent",
      "min": 0,
      "max": 100
    }
  }
}
```

**2. Stat（统计面板）**
```json
{
  "type": "stat",
  "title": "总请求数",
  "targets": [
    {
      "expr": "sum(http_requests_total)"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "short",
      "decimals": 0,
      "mappings": [
        {
          "type": "value",
          "value": "0",
          "result": {"text": "无请求"}
        }
      ]
    }
  },
  "options": {
    "graphMode": "area",
    "colorMode": "value"
  }
}
```

**3. Gauge（仪表盘）**
```json
{
  "type": "gauge",
  "title": "内存使用率",
  "targets": [
    {
      "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "percent",
      "min": 0,
      "max": 100,
      "thresholds": {
        "mode": "absolute",
        "steps": [
          {"value": 0, "color": "green"},
          {"value": 60, "color": "yellow"},
          {"value": 85, "color": "red"}
        ]
      }
    }
  }
}
```

**4. Table（表格）**
```json
{
  "type": "table",
  "title": "实例列表",
  "targets": [
    {
      "expr": "up{job=\"node-exporter\"}"
    }
  ],
  "transformations": [
    {
      "id": "organize",
      "by": ["instance", "job"]
    }
  ]
}
```

**5. Heatmap（热力图）**
```json
{
  "type": "heatmap",
  "title": "请求延迟分布",
  "targets": [
    {
      "expr": "sum(rate(http_request_duration_seconds_bucket[5m])) by (le)"
    }
  ],
  "options": {
    "calculate": false,
    "cellGap": 2,
    "cellRadius": 0,
    "cellValues": {},
    "color": {
      "exponent": 0.5,
      "fill": "dark-orange",
      "mode": "spectrum",
      "reverse": false,
      "scale": "exponential",
      "scheme": "Oranges"
    }
  }
}
```

**6. Logs（日志面板）**
```json
{
  "type": "logs",
  "title": "应用日志",
  "targets": [
    {
      "expr": "{job=\"myapp\"}",
      "refId": "A",
      "datasource": {
        "type": "loki",
        "uid": "loki"
      }
    }
  ],
  "options": {
    "showLabels": true,
    "showCommonLabels": false,
    "showTime": true,
    "wrapLogMessage": false
  }
}
```

**Dashboard变量**：
```json
{
  "variables": [
    {
      "name": "namespace",
      "type": "query",
      "query": {
        "query": "label_values(kube_pod_info, namespace)",
        "refId": "StandardVariableQuery"
      },
      "multi": true,
      "includeAll": true
    },
    {
      "name": "instance",
      "type": "query",
      "query": {
        "query": "label_values(up{namespace=\"$namespace\"}, instance)"
      }
    },
    {
      "name": "resolution",
      "type": "interval",
      "query": "1m,5m,10m,30m,1h",
      "auto": true,
      "auto_count": 30
    }
  ]
}
```

**使用变量**：
```promql
# 在查询中使用变量
up{namespace="$namespace", instance="$instance"}

# 时间范围变量
rate(http_requests_total[$resolution])
```

## 日志系统

### 6. ELK Stack的核心组件和使用场景？

**ELK架构**：
```
┌─────────────────────────────────────────────────────┐
│                     ELK架构                         │
└─────────────────────────────────────────────────────┘

┌──────────────┐
│  数据源       │
│  - 应用日志   │
│  - 系统日志   │
│  - Nginx日志 │
└──────┬───────┘
       │ Filebeat / Logstash
       ▼
┌──────────────┐
│  Logstash    │  ← 数据处理（过滤、转换）
│  - 过滤       │
│  - 转换       │
│  - 富化       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Elasticsearch│  ← 存储和索引
│  - 分布式存储 │
│  - 全文搜索   │
│  - 聚合分析   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Kibana     │  ← 可视化
│  - Dashboard │
│  - Discover  │
│  - Canvas    │
└──────────────┘
```

**核心组件**：

**1. Elasticsearch**
```yaml
# 索引设计
PUT /logs-nginx-2026.02.06
{
  "settings": {
    "number_of_shards": 3,     # 分片数
    "number_of_replicas": 1,   # 副本数
    "refresh_interval": "5s"   # 刷新间隔
  },
  "mappings": {
    "properties": {
      "@timestamp": {"type": "date"},
      "level": {"type": "keyword"},
      "message": {"type": "text"},
      "service": {"type": "keyword"},
      "host": {"type": "keyword"}
    }
  }
}
```

**2. Logstash配置**
```ruby
# logstash.conf
input {
  # 文件输入
  file {
    path => "/var/log/myapp/*.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
  }

  # Beats输入
  beats {
    port => 5044
  }

  # Kafka输入
  kafka {
    bootstrap_servers => "kafka:9092"
    topics => ["app-logs"]
  }
}

filter {
  # JSON解析
  json {
    source => "message"
  }

  # Grok解析
  grok {
    match => {
      "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:msg}"
    }
  }

  # 时间处理
  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }

  # 删除字段
  mutate {
    remove_field => ["message", "host"]
  }

  # 添加标签
  mutate {
    add_field => {
      "environment" => "production"
    }
  }
}

output {
  # 输出到Elasticsearch
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-myapp-%{+YYYY.MM.dd}"
  }

  # 标准输出（调试）
  stdout {
    codec => rubydebug
  }
}
```

**3. Filebeat配置**
```yaml
# filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/myapp/*.log
  fields:
    service: myapp
    environment: production
  fields_under_root: true
  multiline:
    pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
    negate: true
    match: after

# 输出到Logstash
output.logstash:
  hosts: ["logstash:5044"]

# 或直接输出到Elasticsearch
output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "filebeat-%{[agent.version]}-%{+yyyy.MM.dd}"

# Kibana配置
setup.kibana:
  host: "kibana:5601"

# 模块配置（Nginx日志）
filebeat.modules:
- module: nginx
  access:
    enabled: true
    var.paths: ["/var/log/nginx/access.log*"]
  error:
    enabled: true
    var.paths: ["/var/log/nginx/error.log*"]
```

**4. Kibana使用**

**Discover（日志查询）**：
```
# 查询语法
level: ERROR                 # 精确匹配
message: "database error"    # 文本搜索
@timestamp: > now-1h         # 时间范围
service: api AND level: 500  # 布尔查询

# Lucene查询
level:(ERROR OR WARN)
service:api*
message:/timeout.*database/

# KQL查询
level: "ERROR"
service: "api"
@timestamp >= "2026-02-06T00:00:00"
```

**Dashboard（仪表盘）**：
```json
{
  "title": "应用日志监控",
  "panels": [
    {
      "type": "metric",
      "title": "错误日志数",
      "metrics": [
        {
          "id": "1",
          "type": "count"
        }
      ],
      "query": {
        "query": "level: ERROR",
        "language": "lucene"
      }
    }
  ]
}
```

**索引生命周期管理（ILM）**：
```json
PUT _ilm/policy/logs_policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "1d"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

### 7. Loki与ELK的对比，何时选择Loki？

**Loki vs ELK对比**：

| 特性           | Loki                   | ELK                     |
|---------------|------------------------|-------------------------|
| **架构**      | 索引Labels，不索引全文  | 索引所有字段             |
| **存储成本**   | 低（~90%节省）          | 高                       |
| **查询性能**   | 快（基于Labels过滤）    | 慢（全文搜索）           |
| **查询粒度**   | 需要知道Labels          | 全文搜索，无需预知       |
| **学习曲线**   | 简单                   | 复杂                     |
| **生态集成**   | 与Grafana深度集成       | 独立生态                 |
| **适用场景**   | 云原生、K8s            | 复杂日志分析             |

**Loki架构**：
```
┌──────────────┐
│  应用日志     │
└──────┬───────┘
       │ Promtail / Fluent Bit
       ▼
┌──────────────┐
│    Loki      │
│  - Ingester  │  ← 处理日志流
│  - Storage   │  ← 对象存储（S3/MinIO）
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Grafana     │  ← 可视化
│  - Explore   │
│  - Dashboard │
└──────────────┘
```

**Loki配置示例**：

**1. Promtail配置**
```yaml
# promtail-config.yml
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
# Kubernetes Pods
- job_name: kubernetes-pods
  kubernetes_sd_configs:
  - role: pod
  relabel_configs:
  - source_labels:
    - __meta_kubernetes_pod_annotation_prometheus_io_scrape
    action: keep
    regex: true
  - source_labels:
    - __meta_kubernetes_pod_label_app
    target_label: app
  - source_labels:
    - __meta_kubernetes_pod_name
    target_label: pod
  - source_labels:
    - __meta_kubernetes_namespace
    target_label: namespace
  - source_labels:
    - __meta_kubernetes_pod_node_name
    target_label: node

# Systemd日志
- job_name: systemd-journal
  journal:
    path: /var/log/journal
    labels:
      job: systemd-journal
  relabel_configs:
  - source_labels:
    - __journal__systemd_unit
    target_label: unit
```

**2. Loki配置**
```yaml
# loki-config.yml
auth_enabled: false

server:
  http_listen_port: 3100

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

# Limits配置
limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
  max_streams_per_user: 0
  max_entries_limit_per_query: 5000

# Schema配置
schema_config:
  configs:
  - from: 2026-02-06
    store: boltdb-shipper
    object_store: filesystem
    schema: v11
    index:
      prefix: index_
      period: 24h

# Ruler配置
ruler:
  storage:
    type: local
    local:
      directory: /loki/rules
  rule_path: /loki/rules-temp
```

**3. LogQL查询语言**
```logql
# 标签查询
{app="myapp",namespace="production"}

# 过滤器查询
{app="myapp"} |= "error"
{app="myapp"} != "timeout"
{app="myapp"} |~ `.*\d{3}.*`  # 正则匹配

# 聚合查询
count_over_time({app="myapp"}[5m])  # 5分钟内的日志条数
rate({app="myapp"}[5m])  # 每秒日志速率

# Label格式化
{app="myapp"} | line_format "{{.level}}: {{.message}}"

# 提取Labels
{app="myapp"} | label_format status={{__response_status__}}

# 计算错误率
sum(count_over_time({level="error"}[5m])) / sum(count_over_time({}[5m]))
```

**Grafana Loki Panel配置**：
```json
{
  "type": "logs",
  "title": "应用错误日志",
  "targets": [
    {
      "expr": "{app=\"myapp\", level=\"error\"}",
      "refId": "A"
    }
  ],
  "options": {
    "showLabels": true,
    "showTime": true,
    "wrapLogMessage": false,
    "sortOrder": "Descending",
    "dedupStrategy": "exact"
  }
}
```

**何时选择Loki**：
- ✅ Kubernetes集群日志采集
- ✅ 成本敏感场景
- ✅ 与Grafana集成
- ✅ 需要简单的查询语言
- ✅ 日志量巨大（TB级）

**何时选择ELK**：
- ✅ 复杂的全文搜索需求
- ✅ 需要高级聚合分析
- ✅ 多维度数据分析
- ✅ 已有Elasticsearch生态

## 告警管理

### 8. 告警策略设计和最佳实践？

**告警策略金字塔**：
```
                  ┌──────────────────┐
                  │   P1 - 紧急      │  电话告警
                  │  系统不可用       │
                  ├──────────────────┤
                  │   P2 - 高        │  短信+IM
                  │  功能受限         │
                  ├──────────────────┤
                  │   P3 - 中        │  IM通知
                  │  潜在问题         │
                  ├──────────────────┤
                  │   P4 - 低        │  邮件
                  │  信息提示         │
                  └──────────────────┘
```

**告警规则设计**：

**1. Prometheus告警规则**
```yaml
# alert_rules.yml
groups:
- name: infrastructure
  interval: 30s
  rules:
  # 节点宕机告警
  - alert: NodeDown
    expr: up{job="node-exporter"} == 0
    for: 5m
    labels:
      severity: critical
      team: sre
    annotations:
      summary: "节点 {{ $labels.instance }} 宕机"
      description: "节点 {{ $labels.instance }} 已宕机超过5分钟"

  # CPU高负载告警
  - alert: HighCPUUsage
    expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "高CPU使用率"
      description: "{{ $labels.instance }} CPU使用率超过80% (当前值: {{ $value }}%)"

  # 磁盘空间告警
  - alert: DiskSpaceLow
    expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "磁盘空间不足"
      description: "{{ $labels.instance }} 磁盘 {{ $labels.device }} 使用率超过85%"

- name: applications
  interval: 30s
  rules:
  # 服务不可用告警
  - alert: ServiceDown
    expr: up{job="myapp"} == 0
    for: 2m
    labels:
      severity: critical
      team: backend
    annotations:
      summary: "服务不可用"
      description: "{{ $labels.job }} 在 {{ $labels.instance }} 不可用"

  # 高错误率告警
  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service) * 100 > 5
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "高错误率"
      description: "{{ $labels.service }} 错误率超过5% (当前值: {{ $value }}%)"

  # API响应时间告警
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "高API响应时间"
      description: "{{ $labels.service }} P95响应时间超过1秒 (当前值: {{ $value }}s)"

  # Pod崩溃告警
  - alert: PodCrashLooping
    expr: rate(kube_pod_container_status_restarts_total[1h]) > 0
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Pod频繁重启"
      description: "Pod {{ $labels.namespace }}/{{ $labels.pod }} 在过去1小时内重启了 {{ $value }} 次"
```

**2. Alertmanager配置**
```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  # Slack配置
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

# 路由配置
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'

  routes:
  # P1紧急告警 - 发送SRE团队
  - match:
      severity: critical
    receiver: 'sre-critical'
    group_wait: 30s
    repeat_interval: 5m

  # P2高级告警 - 发送开发团队
  - match:
      severity: warning
    receiver: 'dev-warning'
    continue: true

  # 特定服务路由
  - match:
      service: database
    receiver: 'dba-team'

  # 静工作时间抑制
  - match_re:
      severity: .*
  # mute_timings:
  #   - active_time_ranges:
  #     - start_time: "00:00"
  #       end_time: "06:00"
  #       weekdays: ["monday:friday"]
  #   receiver: 'night-shift'

# 接收者配置
receivers:
- name: 'default'
  slack_configs:
  - channel: '#alerts'
    title: '{{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

- name: 'sre-critical'
  webhook_configs:
  - url: 'http://pagerduty-webhook/pagerduty'
  slack_configs:
  - channel: '#sre-critical'
    send_resolved: true
    color: '{{ if .Status }}{{ if eq .Status "firing" }}danger{{ else }}good{{ end }}{{ end }}'

- name: 'dev-warning'
  email_configs:
  - to: 'dev-team@example.com'
    headers:
      Subject: '[WARNING] {{ .GroupLabels.alertname }}'
    html: '{{ template "email.default.html" . }}'

- name: 'dba-team'
  slack_configs:
  - channel: '#dba-alerts'

# 抑制规则
inhibit_rules:
- source_match:
    severity: 'critical'
  target_match:
    severity: 'warning'
  equal: ['alertname', 'instance']

- source_match:
    alertname: 'NodeDown'
  target_match_re:
    alertname: '.*'
  equal: ['instance']

# 静默配置（示例）
# 通过API或Web UI创建临时静默
# curl -X POST http://alertmanager:9093/api/v2/silences \
#   -d '{"matchers":[{"name":"instance","value":"localhost:9090","isRegex":false}],"startsAt":"2026-02-06T00:00:00Z","endsAt":"2026-02-06T01:00:00Z","comment":"维护中"}'
```

**告警最佳实践**：

**1. 告警分级策略**
```yaml
# P0 - 紧急（电话+短信+IM）
- 服务完全不可用
- 数据丢失风险
- 核心业务中断

# P1 - 高（IM+邮件）
- 部分功能受限
- 性能严重下降
- 容量即将耗尽

# P2 - 中（邮件）
- 性能轻微下降
- 潜在问题
- 非核心服务异常

# P3 - 低（仅记录）
- 信息提示
- 定期报告
```

**2. 告警疲劳避免**
```yaml
# 合理设置for参数
for: 5m  # 持续5分钟才告警，避免瞬时抖动

# 使用抑制规则
inhibit_rules:
- source_match:
    alertname: 'NodeDown'
  target_match_re:
    alertname: '.*'
  equal: ['instance']
  # 节点宕机后，抑制该节点上的所有告警

# 使用静默时间
mute_timings:
- name: 'maintenance-window'
  active_time_ranges:
  - start_time: '02:00'
    end_time: '04:00'
    weekdays: ['sunday']
```

**3. 告警内容设计**
```yaml
annotations:
  # 简洁的摘要
  summary: "高CPU使用率 - {{ $labels.instance }}"

  # 详细的描述
  description: |
    实例 {{ $labels.instance }}
    CPU使用率 {{ $value }}% 超过阈值 80%
    持续时间: 10分钟
    查看Dashboard: http://grafana/d/cpu-usage

  # 运行手册链接
  runbook_url: "https://runbook.example.com/high-cpu"

  # 解决建议
  resolution: |
    1. 登录服务器检查进程
    2. 查看top输出
    3. 考虑扩容或优化
```

**4. 告警收敛和聚合**
```yaml
route:
  # 按标签分组
  group_by: ['cluster', 'service', 'alertname']

  # 等待时间，聚合相同分组的告警
  group_wait: 30s

  # 已有告警发送后，等待新告警的时间
  group_interval: 5m

  # 重复告警间隔
  repeat_interval: 12h
```

**5. 告警自愈**
```yaml
# 自动重启失败的Pod
- alert: PodCrashLooping
  expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
  annotations:
    auto_remediate: |
      kubectl delete pod {{ $labels.namespace }}/{{ $labels.pod }} -n {{ $labels.namespace }}
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
