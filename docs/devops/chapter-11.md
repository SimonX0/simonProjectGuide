# 系统监控与日志

## 为什么需要监控

监控系统运行状态，及时发现问题，保障服务稳定性。

### 监控的重要性

- **故障发现**：及时发现系统异常
- **性能优化**：识别性能瓶颈
- **容量规划**：预测资源需求
- **用户体验**：保障服务质量
- **合规要求**：满足监管要求

### 可观测性三大支柱

| 支柱 | 说明 | 工具 |
|------|------|------|
| **Metrics（指标）** | 数值化的监控数据 | Prometheus, Grafana |
| **Logs（日志）** | 离散的事件记录 | ELK Stack, Loki |
| **Traces（链路追踪）** | 请求的完整路径 | Jaeger, Zipkin |

## 监控指标

### 基础指标

**CPU**
```bash
# 查看 CPU 使用率
top
htop

# 查看每个 CPU 核心
mpstat -P ALL

# 查看 CPU 统计
iostat -c
```

**内存**
```bash
# 查看内存使用
free -h

# 查看详细内存信息
vmstat -s

# 查看进程内存
ps aux --sort=-%mem | head
```

**磁盘**
```bash
# 查看磁盘使用
df -h

# 查看磁盘 IO
iostat -x

# 查看 inode 使用
df -i
```

**网络**
```bash
# 查看网络连接
netstat -tuln
ss -tuln

# 查看网络流量
iftop
nload

# 查看网络统计
sar -n DEV 1
```

### 应用指标

**响应时间**
```bash
# 测试响应时间
curl -o /dev/null -s -w "%{time_total}\n" https://example.com
```

**吞吐量**
```bash
# 每秒请求数
# QPS (Queries Per Second)

# 每秒事务数
# TPS (Transactions Per Second)
```

**错误率**
```bash
# HTTP 状态码统计
tail -10000 access.log | awk '{print $9}' | sort | uniq -c
```

## Prometheus 监控

### 什么是 Prometheus

Prometheus 是云原生监控的事实标准，采用拉取模式收集时序数据。

### 核心特性

- **多维数据模型**：时间序列通过 metric name 和 key-value 标识
- **PromQL**：灵活的查询语言
- **pull 模式**：主动拉取目标指标
- **push 模式**：通过 Pushgateway 支持临时任务
- **服务发现**：自动发现监控目标
- **可视化**：内置 UI 和 Grafana 集成

### 安装 Prometheus

**Docker 安装**
```bash
# 创建配置文件
cat > prometheus.yml <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

# 运行 Prometheus
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# 访问 UI
# http://localhost:9090
```

**Kubernetes 安装**

```yaml
# prometheus-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: storage
          mountPath: /prometheus
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: storage
        emptyDir: {}

---
apiVersion: v1
kind: Service
metadata:
  name: prometheus
  namespace: monitoring
spec:
  selector:
    app: prometheus
  ports:
  - port: 9090
    targetPort: 9090
  type: LoadBalancer

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s

    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

### Prometheus 配置

**服务发现**

```yaml
scrape_configs:
  # Kubernetes 服务发现
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
    relabel_configs:
    - action: labelmap
      regex: __meta_kubernetes_node_label_(.+)

  # 基于 Annotation 的服务发现
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
```

**存储配置**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

# 数据保留配置
# 启动参数添加：
# --storage.tsdb.retention.time=30d
# --storage.tsdb.retention.size=50GB
```

### Prometheus 指标

**指标类型**

**Counter（计数器）**
```promql
# 只增不减的值
http_requests_total
http_requests_total{method="POST", status="200"}

# 计算速率
rate(http_requests_total[5m])
# 计算增量
increase(http_requests_total[1h])
```

**Gauge（仪表）**
```promql
# 可增可减的值
memory_usage_bytes
memory_usage_bytes{instance="localhost:9100"}
cpu_usage_percent
```

**Histogram（直方图）**
```promql
# 统计分布
http_request_duration_seconds_bucket
http_request_duration_seconds_sum
http_request_duration_seconds_count

# 计算 P99
histogram_quantile(0.99, http_request_duration_seconds_bucket)
```

**Summary（摘要）**
```promql
# 类似 Histogram，客户端计算
http_request_duration_seconds_summary{quantile="0.99"}
```

### PromQL 查询

**基础查询**

```promql
# 查询当前值
http_requests_total

# 正则匹配
http_requests_total{job=~"api.*"}

# 反向匹配
http_requests_total{environment!="staging"}

# 范围查询（最近5分钟）
http_requests_total[5m]
```

**时间函数**

```promql
# 5分钟内平均速率
rate(http_requests_total[5m])

# 5分钟内增量
increase(http_requests_total[5m])

# 瞬时变化率
irate(http_requests_total[5m])

# 预测（基于线性回归）
predict_linear(node_filesystem_avail_bytes[1h], 4*3600)
```

**聚合操作**

```promql
# 求和
sum(http_requests_total)

# 按标签分组求和
sum(http_requests_total) by (job)
sum(http_requests_total) by (job, instance)

# 平均值
avg(memory_usage_bytes)

# 最大值/最小值
max(cpu_usage)
min(cpu_usage)

# 计数
count(up == 1)

# Top N
topk(10, http_requests_total)

# 标准差
stddev(http_requests_total)
```

**高级查询**

```promql
# 计算百分比
(1 - sum(increase(http_requests_total{status="500"}[5m])) /
      sum(increase(http_requests_total[5m]))) * 100

# CPU 使用率
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 内存使用率
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# 磁盘使用率
(1 - (node_filesystem_avail_bytes{fstype!="tmpfs"} /
       node_filesystem_size_bytes{fstype!="tmpfs"})) * 100

# 预测磁盘何时满
predict_linear(node_filesystem_avail_bytes[1h], 7*24*3600) < 0
```

## Node Exporter

### 安装 Node Exporter

**二进制安装**
```bash
# 下载
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.0/node_exporter-1.6.0.linux-amd64.tar.gz

# 解压
tar xvfz node_exporter-1.6.0.linux-amd64.tar.gz
cd node_exporter-1.6.0.linux-amd64

# 创建用户
sudo useradd --no-create-home --shell /bin/false node_exporter

# 移动文件
sudo cp node_exporter /usr/local/bin/
sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter

# 创建 systemd 服务
sudo vim /etc/systemd/system/node_exporter.service
```

**systemd 服务**
```ini
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl daemon-reload
sudo systemctl start node_exporter
sudo systemctl enable node_exporter

# 验证
curl http://localhost:9100/metrics
```

**Docker 安装**
```bash
docker run -d \
  --name node_exporter \
  --restart always \
  -p 9100:9100 \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  -v /:/rootfs:ro \
  prom/node-exporter
```

**Kubernetes DaemonSet 部署**

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      hostNetwork: true
      hostPID: true
      containers:
      - name: node-exporter
        image: prom/node-exporter:latest
        args:
        - --path.procfs=/host/proc
        - --path.sysfs=/host/sys
        - --path.rootfs=/host/root
        volumeMounts:
        - name: proc
          mountPath: /host/proc
        - name: sys
          mountPath: /host/sys
        - name: root
          mountPath: /host/root
          readOnly: true
      volumes:
      - name: proc
        hostPath:
          path: /proc
      - name: sys
        hostPath:
          path: /sys
      - name: root
        hostPath:
          path: /
```

### 收集的指标

- **CPU**：使用率、模式分布
- **内存**：可用、缓存、交换
- **磁盘**：使用率、IO 统计
- **网络**：连接数、流量统计
- **文件系统**：inode、使用情况
- **系统**：负载、运行时间

## Grafana 可视化

### 什么是 Grafana

Grafana 是开源的可视化平台，支持多种数据源。

### 安装 Grafana

**Docker 安装**
```bash
docker run -d \
  --name grafana \
  -p 3000:3000 \
  -e "GF_SECURITY_ADMIN_PASSWORD=admin" \
  -e "GF_INSTALL_PLUGINS=grafana-piechart-panel" \
  grafana/grafana

# 访问
# http://localhost:3000
# 默认用户名密码：admin/admin
```

**Kubernetes 安装**

```bash
# 添加 Helm 仓库
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# 安装
helm install grafana grafana/grafana \
  --namespace monitoring \
  --set persistence.storageClassName="standard" \
  --set persistence.enabled=true \
  --set adminPassword="admin"
```

### 配置数据源

**添加 Prometheus 数据源**

1. 登录 Grafana
2. 进入 Configuration → Data Sources
3. 点击 "Add data source"
4. 选择 "Prometheus"
5. 配置：
   - Name: `Prometheus`
   - URL: `http://prometheus:9090`
   - Access: `Server (default)`
6. 点击 "Save & Test"

### 创建仪表板

**方式1：导入现成仪表板**

- 访问 [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- 搜索并导入：Node Exporter Full（ID: 1860）

**方式2：手动创建**

1. 创建新 Dashboard
2. 添加 Panel
3. 配置查询

**常用查询示例**

```promql
# CPU 使用率
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 内存使用率
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# 磁盘使用率
(1 - (node_filesystem_avail_bytes{fstype!="tmpfs"} /
       node_filesystem_size_bytes{fstype!="tmpfs"})) * 100

# 网络 I/O
irate(node_network_receive_bytes_total[5m])
irate(node_network_transmit_bytes_total[5m])

# 磁盘 I/O
irate(node_disk_io_time_seconds_total[5m])

# 系统负载
node_load1 / count by (instance) (node_cpu_seconds_total{mode="idle"})

# TCP 连接数
node_netstat_Tcp_CurrEstab

# 文件描述符
node_filefd_allocated / node_filefd_maximum * 100
```

### Grafana 变量

**创建变量**

Dashboard Settings → Variables → Add Variable

**实例变量**
```promql
# Variable Query
label_values(up, instance)
```

**命名空间变量**
```promql
# Variable Query
label_values(kubernetes_pod_info, namespace)
```

**使用变量**
```promql
# 在查询中使用变量
node_cpu_seconds_total{instance="$instance"}

# 下拉选择实例
rate(node_cpu_seconds_total{instance="$instance"}[5m])
```

### 组织和文件夹

```bash
# 创建文件夹
- Organization: DevOps
- Folder: Kubernetes Monitoring
- Folder: Application Monitoring

# 权限管理
- Viewer: 只读
- Editor: 编辑仪表板
- Admin: 完全控制
```

## ELK Stack 日志管理

### 什么是 ELK Stack

ELK Stack 是完整的日志管理解决方案：

- **Elasticsearch**：分布式搜索和分析引擎
- **Logstash**：数据收集和处理管道
- **Kibana**：数据可视化平台
- **Beats**：轻量级数据采集器

### Elasticsearch

**安装 Elasticsearch**

```yaml
# docker-compose.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - esdata:/usr/share/elasticsearch/data

volumes:
  esdata:
```

```bash
# 启动
docker-compose up -d

# 验证
curl http://localhost:9200
curl http://localhost:9200/_cluster/health?pretty
```

**Elasticsearch 基础概念**

```
Cluster（集群）
  └─ Node（节点）
      └─ Index（索引）
          └─ Document（文档）
              └─ Field（字段）
```

**常用 API**

```bash
# 创建索引
curl -X PUT "localhost:9200/logs-2024"

# 查看索引
curl "localhost:9200/_cat/indices?v"

# 插入文档
curl -X POST "localhost:9200/logs-2024/_doc" \
  -H 'Content-Type: application/json' \
  -d '{
    "timestamp": "2024-01-01T10:00:00",
    "level": "INFO",
    "message": "Application started",
    "service": "myapp"
  }'

# 搜索文档
curl "localhost:9200/logs-2024/_search?q=INFO"

# 聚合查询
curl -X POST "localhost:9200/logs-2024/_search" \
  -H 'Content-Type: application/json' \
  -d '{
    "size": 0,
    "aggs": {
      "by_level": {
        "terms": {
          "field": "level.keyword"
        }
      }
    }
  }'
```

### Logstash

**安装 Logstash**

```yaml
# docker-compose.yml 添加
  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: logstash
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf:ro
      - ./logs:/var/log/app
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch
```

**Logstash 配置**

**logstash.conf**：
```conf
input {
  # 从文件读取
  file {
    path => "/var/log/app/*.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
  }

  # Beats 输入
  beats {
    port => 5044
  }

  # Syslog 输入
  syslog {
    port => 514
  }
}

filter {
  # 解析 JSON
  if [message] =~ /^\{.*\}$/ {
    json {
      source => "message"
    }
  }

  # 解析 Nginx 日志
  grok {
    match => {
      "message" => '%{IPORHOST:remote_ip} - %{DATA:user} \[%{HTTPDATE:timestamp}\] "%{WORD:method} %{DATA:path} HTTP/%{NUMBER:http_version}" %{NUMBER:status} %{NUMBER:bytes_sent} "%{DATA:referer}" "%{DATA:user_agent}"'
    }
  }

  # 解析时间
  date {
    match => ["timestamp", "dd/MMM/yyyy:HH:mm:ss Z"]
    target => "@timestamp"
  }

  # 添加标签
  mutate {
    add_field => {
      "environment" => "production"
    }
  }

  # 删除不需要的字段
  mutate {
    remove_field => ["message", "host"]
  }
}

output {
  # 输出到 Elasticsearch
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }

  # 标准输出（调试用）
  stdout {
    codec => rubydebug
  }
}
```

### Filebeat

**安装 Filebeat**

```bash
# 下载
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.11.0-linux-x86_64.tar.gz
tar xzvf filebeat-8.11.0-linux-x86_64.tar.gz
cd filebeat-8.11.0-linux-x86_64

# 启用模块
./filebeat modules enable nginx
./filebeat modules enable system
```

**Filebeat 配置**

**filebeat.yml**：
```yaml
filebeat.inputs:
  # 日志文件输入
  - type: log
    enabled: true
    paths:
      - /var/log/nginx/*.log
      - /var/log/app/*.log
    fields:
      app: myapp
      env: production
    fields_under_root: true
    multiline.pattern: '^\['
    multiline.negate: true
    multiline.match: after

  # 容器日志
  - type: container
    enabled: true
    paths:
      - '/var/lib/docker/containers/*/*.log'
    processors:
      - add_docker_metadata: ~

# 输出到 Logstash
output.logstash:
  hosts: ["logstash:5044"]

# 或直接输出到 Elasticsearch
output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "filebeat-%{[agent.version]}-%{+yyyy.MM.dd}"

# 日志级别
logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
```

**启动 Filebeat**

```bash
# 测试配置
./filebeat test config

# 测试输出
./filebeat test output

# 启动
./filebeat -e

# 或使用 systemd
sudo systemctl start filebeat
```

### Kibana

**安装 Kibana**

```yaml
# docker-compose.yml 添加
  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

**配置 Kibana**

1. 访问 http://localhost:5601
2. 创建索引模式
   - Management → Stack Management → Index Patterns
   - Create index pattern: `logs-*`
   - 选择时间字段：`@timestamp`
3. 查看日志
   - Analytics → Discover
   - 选择索引模式
   - 浏览和搜索日志

**Kibana 查询**

```
# 简单查询
level: ERROR

# 通配符
message: "connection*"

# 范围查询
status: [400 TO 599]

# 布尔查询
level: ERROR AND service: "api"

# 正则表达式
message: /Exception.*NullPointerException/

# 存在字段
_exists_: user_id
```

**Kibana 可视化**

1. 创建可视化
   - Visualize Library → Create visualization
   - 选择类型：Line, Pie, Bar, 等
2. 配置数据源
   - 选择索引模式
   - 配置聚合和字段
3. 保存仪表板
   - Dashboard → Create dashboard

## 告警

### Prometheus Alertmanager

**安装 Alertmanager**

```bash
docker run -d \
  --name alertmanager \
  -p 9093:9093 \
  -v $(pwd)/alertmanager.yml:/etc/alertmanager/alertmanager.yml \
  prom/alertmanager
```

**配置告警规则**

`prometheus-alerts.yml`：
```yaml
groups:
- name: system_alerts
  interval: 30s
  rules:
  # CPU 告警
  - alert: HighCPUUsage
    expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
      team: ops
    annotations:
      summary: "High CPU usage detected"
      description: "Instance {{ $labels.instance }} has CPU usage {{ $value }}%"

  # 内存告警
  - alert: HighMemoryUsage
    expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High memory usage detected"
      description: "Instance {{ $labels.instance }} memory usage is {{ $value }}%"

  # 磁盘告警
  - alert: DiskSpaceLow
    expr: (1 - (node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"})) > 0.85
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Disk space low"
      description: "Instance {{ $labels.instance }} mount point {{ $labels.mountpoint }} has {{ $value }}% disk used"

  # 服务下线
  - alert: ServiceDown
    expr: up == 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Service is down"
      description: "Service {{ $labels.job }} on {{ $labels.instance }} is down"

- name: api_alerts
  rules:
  # API 错误率
  - alert: HighErrorRate
    expr: (sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High API error rate"
      description: "API error rate is {{ $value | humanizePercentage }}"
```

**配置 Alertmanager**

`alertmanager.yml`：
```yaml
global:
  resolve_timeout: 5m

# 路由配置
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  routes:
  - match:
      severity: critical
    receiver: 'critical'
  - match:
      severity: warning
    receiver: 'warning'

# 接收器配置
receivers:
- name: 'default'
  email_configs:
  - to: 'team@example.com'
    from: 'alertmanager@example.com'
    smarthost: 'smtp.example.com:587'
    auth_username: 'alertmanager@example.com'
    auth_password: 'password'
    headers:
      Subject: '[{{ .Status | toUpper }}] {{ .CommonLabels.alertname }}'

- name: 'critical'
  email_configs:
  - to: 'oncall@example.com'
    send_resolved: true

  webhook_configs:
  - url: 'http://webhook-service/alert'
    send_resolved: true

  # 企业微信
  wechat_configs:
  - corp_id: 'your-corp-id'
    api_secret: 'your-api-secret'
    agent_id: 'your-agent-id'
    to_user: '@all'
    message: |
      {{ range .Alerts }}
      告警: {{ .Labels.alertname }}
      级别: {{ .Labels.severity }}
      描述: {{ .Annotations.description }}
      {{ end }}

  # 钉钉
  dingtalk_configs:
  - webhook: 'https://oapi.dingtalk.com/robot/send?access_token=xxx'
    message:
      title: '{{ .GroupLabels.alertname }}'
      text: |
        {{ range .Alerts }}
        告警: {{ .Labels.alertname }}
        级别: {{ .Labels.severity }}
        描述: {{ .Annotations.description }}
        {{ end }}

- name: 'warning'
  email_configs:
  - to: 'team@example.com'
    send_resolved: true

# 抑制规则
inhibit_rules:
- source_match:
    severity: 'critical'
  target_match:
    severity: 'warning'
  equal: ['alertname', 'instance']
```

### Grafana 告警

**配置告警规则**

1. 在 Panel 中点击 Alert
2. 创建告警规则
3. 配置条件

**告警规则示例**

```promql
# 查询
avg(rate(http_requests_total{status="500"}[5m]))

# 条件
# IS ABOVE 10

# 评估间隔
# Every 10s for 5m
```

**通知渠道**

- Email
- Slack
- Webhook
- PagerDuty
- 企业微信
- 钉钉

## 最佳实践

### 监控策略

1. **分层监控**
   - 基础设施层：CPU、内存、磁盘、网络
   - 中间件层：数据库、缓存、消息队列
   - 应用层：QPS、响应时间、错误率
   - 业务层：订单量、交易额、用户活跃

2. **黄金信号**
   - **Latency**：延迟
   - **Traffic**：流量
   - **Errors**：错误
   - **Saturation**：饱和度

3. **RED 方法**
   - **Rate**：每秒请求数
   - **Errors**：错误率
   - **Duration**：请求持续时间

4. **USE 方法**
   - **Utilization**：资源使用率
   - **Saturation**：资源饱和度
   - **Errors**：错误

### 日志规范

1. **统一格式**

```json
{
  "timestamp": "2024-01-01T10:00:00Z",
  "level": "INFO",
  "service": "user-service",
  "trace_id": "abc123",
  "user_id": "user-001",
  "message": "User logged in",
  "context": {
    "ip": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

2. **日志级别**
   - DEBUG：详细调试信息
   - INFO：一般信息
   - WARNING：警告信息
   - ERROR：错误信息
   - CRITICAL：严重错误

3. **结构化日志**
   - 使用 JSON 格式
   - 包含请求ID（trace_id）
   - 包含上下文信息

4. **避免敏感信息**
   - 不记录密码
   - 不记录完整信用卡号
   - 脱敏处理

### 告警最佳实践

1. **告警分级**
   - P0：立即处理（服务宕机）
   - P1：快速处理（功能异常）
   - P2：计划处理（性能下降）
   - P3：观察（正常波动）

2. **避免告警疲劳**
   - 设置合理阈值
   - 使用抑制规则
   - 定期审查告警规则

3. **告警可执行**
   - 明确的问题描述
   - 提供相关链接
   - 建议处理方案

---

## eBPF可观测性 (2024-2026技术)

### 什么是eBPF

**eBPF**（Extended Berkeley Packet Filter）是Linux内核的革命性技术，允许在内核中运行沙盒程序，**无需修改内核源码**。

**核心优势**：

```
传统监控 vs eBPF监控

传统监控：
  ❌ 需要修改应用代码
  ❌ 性能开销大(10-20%)
  ❌ 只能看到用户空间
  ❌ 无法深入内核

eBPF监控：
  ✅ 无需修改代码
  ✅ 性能开销极低(<1%)
  ✅ 可观测内核和用户空间
  ✅ 实时、安全、可编程
```

### eBPF监控工具生态

| 工具 | 用途 | 特点 |
|------|------|------|
| **Falco** | 运行时安全 | 云原生安全标准 |
| **Pixie** | 应用性能 | 自动插桩、无需代码 |
| **Parca** | 性能分析 | 持续性能分析 |
| **Katran** | 负载均衡 | Facebook开源 |
| **Cilium** | 网络+安全 | eBPF实现 |
| **BCC** | 性能调试 | 开发工具包 |

### Falco - 运行时安全监控

**安装Falco**：

```bash
# 1. 添加Falco仓库
curl -s https://falco.org/repo/falcosecurity-packages.asc | \
  gpg --dearmor -o /usr/share/keyrings/falco-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/falco-archive-keyring.gpg] \
  https://download.falco.org/packages/deb stable main" | \
  tee /etc/apt/sources.list.d/falcosecurity.list

# 2. 安装
apt update && apt install -y falco

# 3. 启动
systemctl start falco
systemctl enable falco
```

**Falco配置**：

```yaml
# /etc/falco/falco.yaml

# 输出配置
outputs:
  - stdout:
      enabled: true
  - file:
      enabled: true
      keep_alive: false
      filename: /var/log/falco/events.log

# 规则文件
rules_file:
  - /etc/falco/falco_rules.yaml
  - /etc/falco/rules.d

# 自定义规则
custom_rules:
  - comment: 检测容器中的shell
    condition: >
      spawned_process
      and container
      and proc.name in (bash, sh, zsh)
      and user.uid != 0
    output: >
      Shell in container (user=%user.name container=%container.name
      shell=%proc.name parent=%proc.pname cmdline=%proc.cmdline)
    priority: WARNING

  - comment: 检测敏感文件访问
    condition: >
      open_read
      and fd.name in (/etc/shadow, /etc/passwd, ~/.ssh/)
      and not proc.name in (sshd, systemd, grep)
    output: >
      Sensitive file access (user=%user.name file=%fd.name
      command=%proc.cmdline)
    priority: ERROR
```

**Falco实战场景**：

```bash
# 场景1：检测容器中的异常行为
# 在Kubernetes中部署Falco
kubectl apply -f https://raw.githubusercontent.com/falcosecurity/deploy/main/kubernetes/falco.yaml

# 查看实时事件
kubectl logs -l app=falco -n falco -f

# 示例输出：
# 10:00:00.123: Warning Shell in container (user=root container=nginx shell=bash)
# 10:00:05.456: Error Sensitive file access (user=nginx file=/etc/passwd)

# 场景2：检测比特币挖矿程序
cat > /etc/falco/rules.d/crypto-mining.yaml <<EOF
- rule: Detect Crypto Mining
  desc: Detect potential cryptocurrency mining processes
  condition: >
    spawned_process
    and proc.name in (xmrig, cpuminer, minerd)
    and not user.uid >= 1000
  output: >
    Crypto mining detected (user=%user.name command=%proc.cmdline)
  priority: CRITICAL
EOF

# 重载配置
systemctl reload falco

# 场景3：检测反向Shell
cat > /etc/falco/rules.d/reverse-shell.yaml <<EOF
- rule: Detect Reverse Shell
  desc: Detect potential reverse shell connections
  condition: >
    spawned_process
    and proc.name in (nc, netcat, bash)
    and fd.type=ipv4
    and fd.net!=0.0.0.0/0
    and not fd.sip in (10.0.0.0/8, 192.168.0.0/16, 172.16.0.0/12)
  output: >
    Reverse shell detected (user=%user.name command=%proc.cmdline
    remote_ip=%fd.sip remote_port=%fd.sport)
  priority: CRITICAL
EOF
```

### Pixie - 自动应用性能监控

**Pixie特性**：

- ✅ **零配置**：自动发现服务
- ✅ **无代码修改**：使用eBPF自动插桩
- ✅ **黄金指标**：自动生成延迟、流量、错误率
- ✅ **调用图**：自动生成服务依赖图

**安装Pixie**：

```bash
# 1. 安装Pixie CLI
curl -LO https://pixie.dev/px_install.sh
bash px_install.sh

# 2. 部署到Kubernetes
px deploy

# 3. 查看实时指标
px beta

# 输出实时数据：
# Service    |   QPS  | P50 Latency | P99 Latency | Error Rate
# ------------+--------+-------------+-------------+-------------
# frontend    |  120.5 | 12ms        | 45ms        | 0.1%
# api-gateway |   85.2 | 8ms         | 28ms        | 0.0%
# user-db     |   42.1 | 3ms         | 15ms        | 0.0%
```

**Pixie脚本(PXL)**：

```python
# HTTP服务监控脚本
def http_metrics(start_time: str, end_time: str):
  """收集HTTP服务指标"""

  # 1. 过滤HTTP请求
  df = px.DataFrame(
    table='http_events',
    start_time=start_time,
    end_time=end_time
  )

  # 2. 计算指标
  df = df.groupby(['svc', 'endpoint']).agg(
    latency_quantiles=('latency', px.quantiles([0.5, 0.95, 0.99])),
    throughput=('latency', px.count),
    error_rate=('failure', px.mean)
  )

  # 3. 格式化输出
  df.output('http_metrics')

# 执行
px.run_script(http_metrics, start_time='-5m')
```

**常见Pixie脚本**：

```python
# 1. 服务拓扑图
def service_map(start_time: str):
  df = px.DataFrame(table='http_events', start_time=start_time)
  df = df.groupby(['svc', 'remote_svc']).agg(
    request_count=('time_', px.count)
  )
  df.output('service_map')

# 2. 慢查询分析
def slow_queries(start_time: str):
  df = px.DataFrame(table='http_events', start_time=start_time)
  df = df[df.latency > 1000000]  # >1秒
  df = df.groupby(['svc', 'endpoint']).agg(
    count=('latency', px.count),
    avg_latency=('latency', px.mean)
  )
  df.output('slow_queries')

# 3. DNS异常检测
def dns_anomalies(start_time: str):
  df = px.DataFrame(table='dns_events', start_time=start_time)
  df = df.groupby('dns_question').agg(
    count=('time_', px.count)
  )
  df = df[df.count > 1000]  # 高频DNS查询
  df.output('dns_anomalies')
```

### Cilium - 网络+可观测性

**Cilium基于eBPF提供**：

- 网络可观测性
- L7可见性(HTTP/gRPC/Kafka)
- 服务依赖图
- Hubble(Gui界面)

**安装Cilium+Hubble**：

```bash
# 1. 安装Cilium
cilium install --set hubble.enabled=true

# 2. 启用Hubble UI
cilium hubble enable --ui

# 3. 端口转发
cilium hubble port-forward&

# 4. 访问UI
open http://localhost:12000
```

**Hubble可观测性**：

```bash
# 实时流量观察
hubble observe

# 输出：
# Oct 10 10:00:00.123: frontend -> api-gateway HTTP/1.1 GET /api/users
# Oct 10 10:00:00.145: api-gateway -> user-db MySQL SELECT * FROM users
# Oct 10 10:00:00.167: user-db -> api-gateway MySQL Response (200)
# Oct 10 10:00:00.189: api-gateway -> frontend HTTP/1.1 Response (200)

# 过滤特定服务
hubble observe --source app=frontend

# L7流量分析
hubble observe --protocol http

# 输出：
# frontend -> api-gateway HTTP GET /api/users (200) 45ms
# frontend -> api-gateway HTTP POST /api/login (200) 123ms
# api-gateway -> user-db MySQL SELECT (200) 23ms

# 流量统计
hubble status

# 输出：
# Services:
#   frontend:     1 connections, 120 requests/min
#   api-gateway:  2 connections, 85 requests/min
#   user-db:      1 connection, 42 requests/min
```

### eBPF性能调优

**BCC性能分析**：

```bash
# 1. 安装BCC
apt install bpfcc-tools linux-headers-$(uname -r)

# 2. CPU性能分析
# offcputime - 查看CPU阻塞时间
offcputime

# 输出：
# 35%  java (Thread.java:1234)
# 20%  nginx (ngx_process_events)
# 15%  python (ssl.read)

# 3. 磁盘IO分析
# biolatency - 块设备延迟
biolatency

# 输出：
# 1000-2000 us:  45%
# 2000-4000 us:  30%
# 4000-8000 us:  20%
# >8000 us:      5%

# 4. 网络延迟分析
# tcplife - TCP连接生命周期
tcplife

# 输出：
# PID   COMM         LADDR           LPORT RADDR           RPORT TX_KB RX_KB MS
# 1234  nginx        192.168.1.10    80    10.0.0.5        54321  10    50    45
# 5678  postgres     192.168.1.11    5432  192.168.1.10    40000  5     100   12

# 5. 内存分配分析
# memleak - 内存泄漏检测
memleak -a $(pidof java)

# 输出：
# Top 10 allocating stacks:
# 123456 bytes: Thread.java:1234 (Java Heap)
# 98765 bytes: HashMap.java:567 (Resize)
```

**eBPF性能最佳实践**：

```yaml
# 1. 选择合适的监控粒度
监控粒度选择：
  高频指标(秒级)：
    - QPS、延迟、错误率
    - 使用Prometheus + eBPF

  中频指标(分钟级)：
    - 容器重启、OOM
    - 使用Falco告警

  低频指标(小时级)：
    - 资源趋势、容量规划
    - 使用Grafana看板

# 2. 减少eBPF开销
性能优化：
  - 只收集必要的指标
  - 使用采样率(1%或10%)
  - 定期清理无用eBPF程序

# 3. 数据保留策略
保留策略：
  - 原始事件：7天
  - 聚合指标：30天
  - 趋势数据：365天
```

### eBPF监控架构

```
┌─────────────────────────────────────────────────┐
│          eBPF监控完整架构                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  应用层                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Pixie    │  │ Falco    │  │ Parca    │     │
│  │ (APM)    │  │ (安全)   │  │ (性能)   │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│       │              │              │           │
│       └──────────────┴──────────────┘           │
│                      │                           │
│  eBPF层                                         │
│  ┌──────────────────────────────────────┐       │
│  │         eBPF Programs (内核)          │       │
│  │  - Kprobes (内核函数)                 │       │
│  │  - Tracepoints (跟踪点)               │       │
│  │  - Uprobes (用户函数)                 │       │
│  │  - XDP (网络数据包)                   │       │
│  └──────────────────────────────────────┘       │
│                      │                           │
│  数据存储                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Prometheus│ │ Loki     │  │ Grafana  │     │
│  │ (指标)   │  │ (日志)   │  │ (可视化) │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### eBPF最佳实践

**1. 安全优先**：

```bash
# 只加载经过验证的eBPF程序
# 使用签名验证
bpftool prog load --signed my_program.o

# 限制eBPF权限
echo 0 > /proc/sys/kernel/unprivileged_bpf_disabled
```

**2. 性能考虑**：

```python
# 使用map减少用户态-内核态切换
# Map在内核中缓存数据
BPF_MAP_TYPE_HASH

# 使用per-cpu map避免锁竞争
BPF_MAP_TYPE_PERCPU_HASH
```

**3. 监控分层**：

```yaml
三层监控策略：
  L1 - 基础监控(Prometheus + Node Exporter)
  L2 - 应用监控(Pixie + APM)
  L3 - 深度诊断(eBPF + BCC)
```

---

### 实践建议

1. **从简单开始**
   - 先监控基础设施
   - 再监控应用
   - 最后监控业务

2. **逐步完善**
   - 基础监控 → 告警 → 自动化
   - 关键指标先行

3. **定期优化**
   - 清理无效指标
   - 优化仪表板
   - 调整告警阈值

4. **团队协作**
   - 统一监控标准
   - 共享仪表板
   - 文档化流程

### 练习任务

- [ ] 部署 Prometheus + Grafana
- [ ] 配置 Node Exporter
- [ ] 创建基础监控仪表板
- [ ] 部署 ELK Stack
- [ ] 配置日志收集
- [ ] 设置告警规则
- [ ] 实现告警通知

## 总结

监控和日志是保障系统稳定的关键。通过本章学习，你应该掌握了：

- Prometheus 监控系统
- Grafana 可视化
- ELK Stack 日志管理
- 告警配置

下一章我们将学习 [自动化运维实战](chapter-12)。
