# 实战项目1：Kubernetes多集群管理系统

> **项目难度**：⭐⭐⭐⭐⭐
> **预计时间**：60-80小时
> **技术栈**：Kubernetes | Helm | Argo CD | Prometheus | Terraform | Go

## 项目概述

构建一个企业级Kubernetes多集群管理平台，统一管理开发、测试、生产等多个集群，提供可视化的集群管理、应用部署、监控告警等能力。

### 核心功能

```
🎯 多集群管理：统一管理多个K8s集群
🚀 应用部署：支持Helm Chart和Kustomize
📊 监控告警：Prometheus + Grafana监控
🔄 GitOps：Argo CD持续部署
🔐 权限管理：基于RBAC的权限控制
📈 资源可视化：集群资源使用情况可视化
🔍 日志聚合：多集群日志统一查询
🚨 自动伸缩：HPA/VPA自动伸缩策略
```

### 技术架构

```
                    ┌─────────────────────────┐
                    │   Multi-Cluster Manager │
                    │      (Frontend + API)   │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   Control Plane Cluster  │
                    │  (ArgoCD + Prometheus)  │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼───────┐     ┌────────▼────────┐     ┌────────▼────────┐
│ Dev Cluster   │     │ Staging Cluster │     │ Prod Cluster    │
│ - 3 nodes     │     │ - 5 nodes       │     │ - 10+ nodes     │
│ - Dev env     │     │ - Staging env   │     │ - Multi-AZ      │
│ - Single AZ   │     │ - Single AZ     │     │ - High Avail    │
└───────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 项目架构设计

### 1. 项目结构

```bash
multi-cluster-manager/
├── backend/                    # Go后端服务
│   ├── api/                   # API层
│   ├── services/              # 业务逻辑
│   ├── repositories/          # 数据访问
│   ├── models/                # 数据模型
│   └── cmd/                   # 命令行工具
│
├── frontend/                   # Vue3前端
│   ├── src/
│   │   ├── views/             # 页面
│   │   ├── components/        # 组件
│   │   └── api/               # API调用
│   └── package.json
│
├── infrastructure/             # 基础设施
│   ├── terraform/             # Terraform配置
│   ├── helm-charts/           # Helm Charts
│   └── kubernetes/            # K8s manifests
│
├── monitoring/                 # 监控配置
│   ├── prometheus/            # Prometheus规则
│   ├── grafana/               # Grafana仪表盘
│   └── alertmanager/          # 告警规则
│
├── pipelines/                  # CI/CD流水线
│   ├── github-actions/        # GitHub Actions
│   └── argocd/                # Argo CD配置
│
└── docs/                       # 文档
    ├── architecture.md        # 架构文档
    ├── api.md                 # API文档
    └── deployment.md          # 部署文档
```

### 2. 技术选型

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| **后端框架** | Go 1.21 + Gin | 高性能API服务 |
| **前端框架** | Vue 3 + TypeScript | 现代化前端 |
| **数据库** | PostgreSQL + Redis | 关系型数据库 + 缓存 |
| **集群管理** | Kubernetes | 容器编排 |
| **应用部署** | Helm + Kustomize | 包管理 + 配置管理 |
| **GitOps** | Argo CD | 持续部署 |
| **监控** | Prometheus + Grafana | 监控告警 |
| **日志** | Loki + Promtail | 日志聚合 |
| **服务网格** | Istio | 服务间通信 |
| **基础设施** | Terraform | IaC |

---

## 核心功能实现

### 1. 多集群管理

**后端：集群注册和管理**

```go
// backend/services/cluster_service.go
package services

import (
    "context"
    "fmt"
    "github.com/rs/xid"
    "meta/backend/models"
    "meta/backend/repositories"
    "k8s.io/client-go/kubernetes"
    "k8s.io/client-go/rest"
    "k8s.io/client-go/tools/clientcmd"
)

type ClusterService struct {
    clusterRepo repositories.ClusterRepository
    clients     map[string]*kubernetes.Clientset
}

func NewClusterService(repo repositories.ClusterRepository) *ClusterService {
    return &ClusterService{
        clusterRepo: repo,
        clients:     make(map[string]*kubernetes.Clientset),
    }
}

// RegisterCluster 注册新集群
func (s *ClusterService) RegisterCluster(ctx context.Context, req models.RegisterClusterRequest) (*models.Cluster, error) {
    // 1. 验证kubeconfig
    config, err := clientcmd.RESTConfigFromKubeConfig([]byte(req.KubeConfig))
    if err != nil {
        return nil, fmt.Errorf("invalid kubeconfig: %w", err)
    }

    // 2. 创建clientset测试连接
    clientset, err := kubernetes.NewForConfig(config)
    if err != nil {
        return nil, fmt.Errorf("failed to create clientset: %w", err)
    }

    // 3. 获取集群信息
    version, err := clientset.Discovery().ServerVersion()
    if err != nil {
        return nil, fmt.Errorf("failed to get server version: %w", err)
    }

    nodes, err := clientset.CoreV1().Nodes().List(ctx, metav1.ListOptions{})
    if err != nil {
        return nil, fmt.Errorf("failed to list nodes: %w", err)
    }

    // 4. 保存集群信息
    cluster := &models.Cluster{
        ID:          xid.New().String(),
        Name:        req.Name,
        Environment: req.Environment,
        KubeConfig:  req.KubeConfig,
        Version:     version.GitVersion,
        NodeCount:   len(nodes.Items),
        Status:      "active",
    }

    if err := s.clusterRepo.Create(ctx, cluster); err != nil {
        return nil, fmt.Errorf("failed to save cluster: %w", err)
    }

    // 5. 缓存clientset
    s.clients[cluster.ID] = clientset

    return cluster, nil
}

// GetCluster 获取集群信息
func (s *ClusterService) GetCluster(ctx context.Context, id string) (*models.Cluster, error) {
    return s.clusterRepo.FindByID(ctx, id)
}

// ListClusters 列出所有集群
func (s *ClusterService) ListClusters(ctx context.Context) ([]*models.Cluster, error) {
    return s.clusterRepo.FindAll(ctx)
}

// GetClusterStats 获取集群统计信息
func (s *ClusterService) GetClusterStats(ctx context.Context, id string) (*models.ClusterStats, error) {
    clientset, ok := s.clients[id]
    if !ok {
        return nil, fmt.Errorf("cluster not found or not connected")
    }

    // 获取节点列表
    nodes, err := clientset.CoreV1().Nodes().List(ctx, metav1.ListOptions{})
    if err != nil {
        return nil, err
    }

    // 获取Pod列表
    pods, err := clientset.CoreV1().Pods("").List(ctx, metav1.ListOptions{})
    if err != nil {
        return nil, err
    }

    // 获取命名空间列表
    namespaces, err := clientset.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
    if err != nil {
        return nil, err
    }

    stats := &models.ClusterStats{
        NodeCount:       len(nodes.Items),
        PodCount:        len(pods.Items),
        NamespaceCount:  len(namespaces.Items),
        RunningPods:     0,
        PendingPods:     0,
        FailedPods:      0,
    }

    // 统计Pod状态
    for _, pod := range pods.Items {
        switch pod.Status.Phase {
        case "Running":
            stats.RunningPods++
        case "Pending":
            stats.PendingPods++
        default:
            stats.FailedPods++
        }
    }

    return stats, nil
}

// GetClusterResources 获取集群资源使用情况
func (s *ClusterService) GetClusterResources(ctx context.Context, id string) (*models.ClusterResources, error) {
    clientset, ok := s.clients[id]
    if !ok {
        return nil, fmt.Errorf("cluster not found or not connected")
    }

    // 获取Metrics API
    metricsAPI := clientset.MetricsV1beta1()

    // 获取节点指标
    nodeMetrics, err := metricsAPI.NodeMetricses().List(ctx, metav1.ListOptions{})
    if err != nil {
        return nil, err
    }

    // 获取Pod指标
    podMetrics, err := metricsAPI.PodMetricses("").List(ctx, metav1.ListOptions{})
    if err != nil {
        return nil, err
    }

    resources := &models.ClusterResources{
        Nodes: make([]models.NodeResource, 0, len(nodeMetrics.Items)),
        Pods:  make([]models.PodResource, 0, len(podMetrics.Items)),
    }

    // 汇总节点资源
    for _, nodeMetric := range nodeMetrics.Items {
        node := models.NodeResource{
            Name:       nodeMetric.Name,
            CPU:        nodeMetric.Usage.Cpu().MilliValue(),
            Memory:     nodeMetric.Usage.Memory().Value() / (1024 * 1024), // MB
        }
        resources.Nodes = append(resources.Nodes, node)
    }

    // 汇总Pod资源
    for _, podMetric := range podMetrics.Items {
        pod := models.PodResource{
            Namespace: podMetric.Namespace,
            Name:      podMetric.Name,
            CPU:       podMetric.Usage[0].MilliValue(),
            Memory:    podMetric.Usage[1].Value() / (1024 * 1024), // MB
        }
        resources.Pods = append(resources.Pods, pod)
    }

    return resources, nil
}

// DeleteCluster 删除集群
func (s *ClusterService) DeleteCluster(ctx context.Context, id string) error {
    // 从缓存中删除clientset
    delete(s.clients, id)

    // 从数据库删除
    return s.clusterRepo.Delete(ctx, id)
}
```

**API层：集群管理接口**

```go
// backend/api/cluster_api.go
package api

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "meta/backend/services"
)

type ClusterAPI struct {
    service *services.ClusterService
}

func NewClusterAPI(service *services.ClusterService) *ClusterAPI {
    return &ClusterAPI{service: service}
}

// RegisterCluster 注册集群
// @Summary 注册集群
// @Tags cluster
// @Accept json
// @Produce json
// @Param request body models.RegisterClusterRequest true "集群信息"
// @Success 200 {object} models.Cluster
// @Router /api/v1/clusters [post]
func (api *ClusterAPI) RegisterCluster(c *gin.Context) {
    var req models.RegisterClusterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    cluster, err := api.service.RegisterCluster(c.Request.Context(), req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, cluster)
}

// GetCluster 获取集群详情
func (api *ClusterAPI) GetCluster(c *gin.Context) {
    id := c.Param("id")

    cluster, err := api.service.GetCluster(c.Request.Context(), id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, cluster)
}

// ListClusters 列出所有集群
func (api *ClusterAPI) ListClusters(c *gin.Context) {
    clusters, err := api.service.ListClusters(c.Request.Context())
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "clusters": clusters,
        "total":    len(clusters),
    })
}

// GetClusterStats 获取集群统计信息
func (api *ClusterAPI) GetClusterStats(c *gin.Context) {
    id := c.Param("id")

    stats, err := api.service.GetClusterStats(c.Request.Context(), id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, stats)
}

// GetClusterResources 获取集群资源使用情况
func (api *ClusterAPI) GetClusterResources(c *gin.Context) {
    id := c.Param("id")

    resources, err := api.service.GetClusterResources(c.Request.Context(), id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, resources)
}

// DeleteCluster 删除集群
func (api *ClusterAPI) DeleteCluster(c *gin.Context) {
    id := c.Param("id")

    if err := api.service.DeleteCluster(c.Request.Context(), id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Cluster deleted successfully"})
}
```

### 2. 应用部署管理

**Helm Chart部署**

```go
// backend/services/helm_service.go
package services

import (
    "context"
    "fmt"
    "helm.sh/helm/v3/pkg/action"
    "helm.sh/helm/v3/pkg/chart"
    "helm.sh/helm/v3/pkg/cli"
    "helm.sh/helm/v3/pkg/release"
    "helm.sh/helm/v3/pkg/repo"
    "meta/backend/models"
)

type HelmService struct {
    clusters map[string]*ActionConfig
}

func NewHelmService() *HelmService {
    return &HelmService{
        clusters: make(map[string]*action.Configuration),
    }
}

// InstallChart 安装Helm Chart
func (s *HelmService) InstallChart(ctx context.Context, req *models.InstallChartRequest) (*release.Release, error) {
    // 获取集群配置
    actionConfig, ok := s.clusters[req.ClusterID]
    if !ok {
        return nil, fmt.Errorf("cluster not found")
    }

    // 创建安装action
    install := action.NewInstall(actionConfig)
    install.ReleaseName = req.ReleaseName
    install.Namespace = req.Namespace
    install.CreateNamespace = true

    // 加载Chart
    chart, err := loader.Load(req.ChartPath)
    if err != nil {
        return nil, fmt.Errorf("failed to load chart: %w", err)
    }

    // 解析values
    values := make(map[string]interface{})
    if req.Values != "" {
        if err := yaml.Unmarshal([]byte(req.Values), &values); err != nil {
            return nil, fmt.Errorf("failed to parse values: %w", err)
        }
    }

    // 执行安装
    rel, err := install.RunWithContext(ctx, chart, values)
    if err != nil {
        return nil, fmt.Errorf("failed to install: %w", err)
    }

    return rel, nil
}

// UpgradeChart 升级Helm Chart
func (s *HelmService) UpgradeChart(ctx context.Context, req *models.UpgradeChartRequest) (*release.Release, error) {
    actionConfig, ok := s.clusters[req.ClusterID]
    if !ok {
        return nil, fmt.Errorf("cluster not found")
    }

    upgrade := action.NewUpgrade(actionConfig)
    upgrade.Namespace = req.Namespace

    chart, err := loader.Load(req.ChartPath)
    if err != nil {
        return nil, fmt.Errorf("failed to load chart: %w", err)
    }

    values := make(map[string]interface{})
    if req.Values != "" {
        if err := yaml.Unmarshal([]byte(req.Values), &values); err != nil {
            return nil, fmt.Errorf("failed to parse values: %w", err)
        }
    }

    rel, err := upgrade.RunWithContext(ctx, req.ReleaseName, chart, values)
    if err != nil {
        return nil, fmt.Errorf("failed to upgrade: %w", err)
    }

    return rel, nil
}

// UninstallRelease 卸载Release
func (s *HelmService) UninstallRelease(ctx context.Context, clusterID, namespace, releaseName string) error {
    actionConfig, ok := s.clusters[clusterID]
    if !ok {
        return fmt.Errorf("cluster not found")
    }

    uninstall := action.NewUninstall(actionConfig)
    if _, err := uninstall.RunWithContext(ctx, releaseName); err != nil {
        return fmt.Errorf("failed to uninstall: %w", err)
    }

    return nil
}

// ListReleases 列出所有Release
func (s *HelmService) ListReleases(ctx context.Context, clusterID string) ([]*release.Release, error) {
    actionConfig, ok := s.clusters[clusterID]
    if !ok {
        return nil, fmt.Errorf("cluster not found")
    }

    list := action.NewList(actionConfig)
    list.All = true
    list.AllNamespaces = true

    releases, err := list.Run()
    if err != nil {
        return nil, fmt.Errorf("failed to list releases: %w", err)
    }

    return releases, nil
}

// GetReleaseStatus 获取Release状态
func (s *HelmService) GetReleaseStatus(ctx context.Context, clusterID, namespace, releaseName string) (*models.ReleaseStatus, error) {
    actionConfig, ok := s.clusters[clusterID]
    if !ok {
        return nil, fmt.Errorf("cluster not found")
    }

    status := action.NewStatus(actionConfig)
    rel, err := status.Run(releaseName)
    if err != nil {
        return nil, fmt.Errorf("failed to get status: %w", err)
    }

    return &models.ReleaseStatus{
        Name:       rel.Name,
        Namespace:  rel.Namespace,
        Version:    rel.Version,
        Status:     rel.Info.Status.String(),
        Chart:      rel.Chart.Metadata.Name,
        AppVersion: rel.Chart.Metadata.AppVersion,
        Updated:    rel.Info.LastDeployed,
    }, nil
}

// RollbackRelease 回滚Release
func (s *HelmService) RollbackRelease(ctx context.Context, clusterID, namespace, releaseName string, revision int) error {
    actionConfig, ok := s.clusters[clusterID]
    if !ok {
        return fmt.Errorf("cluster not found")
    }

    rollback := action.NewRollback(actionConfig)
    rollback.Version = revision

    if err := rollback.RunWithContext(ctx, releaseName); err != nil {
        return fmt.Errorf("failed to rollback: %w", err)
    }

    return nil
}
```

### 3. 监控告警

**Prometheus配置**

```yaml
# monitoring/prometheus/prometheus-values.yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
    - "/etc/prometheus/rules/*.yml"

scrape_configs:
  # Kubernetes组件
  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    relabel_configs:
      - source_labels: [__address__]
        regex: '(.*):10250'
        replacement: '${1}:9100'
        target_label: __address__

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

  # 应用指标
  - job_name: 'multi-cluster-manager'
    static_configs:
      - targets: ['multi-cluster-manager-backend:8080']
    metrics_path: '/metrics'
```

**告警规则**

```yaml
# monitoring/prometheus/rules/alerts.yml
groups:
  - name: cluster_alerts
    interval: 30s
    rules:
      # 集群节点告警
      - alert: NodeNotReady
        expr: kube_node_status_condition{condition="Ready",status!="true"} == 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Node {{ $labels.node }} is not ready"
          description: "Node {{ $labels.node }} has been not ready for more than 5 minutes"

      - alert: NodeMemoryPressure
        expr: kube_node_status_condition{condition="MemoryPressure",status="true"} == 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Node {{ $labels.node }} has memory pressure"

      - alert: NodeDiskPressure
        expr: kube_node_status_condition{condition="DiskPressure",status="true"} == 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Node {{ $labels.node }} has disk pressure"

      # Pod告警
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Pod {{ $labels.namespace }}/{{ $labels.pod }} is crash looping"

      - alert: PodNotReady
        expr: kube_pod_status_ready{condition="false"} == 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Pod {{ $labels.namespace }}/{{ $labels.pod }} is not ready"

      # 资源使用告警
      - alert: HighCPUUsage
        expr: sum(rate(container_cpu_usage_seconds_total{container!=""}[5m])) by (node) > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on node {{ $labels.node }}"
          description: "CPU usage is above 80% for more than 10 minutes"

      - alert: HighMemoryUsage
        expr: sum(container_memory_working_set_bytes{container!=""}) by (node) / sum(kube_node_status_capacity{resource="memory"}) by (node) > 0.9
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on node {{ $labels.node }}"
          description: "Memory usage is above 90% for more than 10 minutes"

      # Deployment告警
      - alert: DeploymentReplicasMismatch
        expr: kube_deployment_spec_replicas != kube_deployment_status_replicas_available
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Deployment {{ $labels.namespace }}/{{ $labels.deployment }} replicas mismatch"

  - name: application_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate for {{ $labels.service }}"
          description: "Error rate is above 5% for more than 5 minutes"

      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency for {{ $labels.service }}"
          description: "P95 latency is above 1s for more than 5 minutes"
```

**Grafana仪表盘**

```json
{
  "dashboard": {
    "title": "Multi-Cluster Overview",
    "panels": [
      {
        "title": "Cluster Overview",
        "type": "stat",
        "targets": [
          {
            "expr": "count(kube_node_info)"
          }
        ]
      },
      {
        "title": "Pod Status by Cluster",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum by (cluster, status) (kube_pod_status_phase)"
          }
        ]
      },
      {
        "title": "CPU Usage by Cluster",
        "type": "graph",
        "targets": [
          {
            "expr": "sum by (cluster) (rate(container_cpu_usage_seconds_total{container!=\"\"}[5m]))"
          }
        ]
      },
      {
        "title": "Memory Usage by Cluster",
        "type": "graph",
        "targets": [
          {
            "expr": "sum by (cluster) (container_memory_working_set_bytes{container!=\"\"})"
          }
        ]
      },
      {
        "title": "Network Traffic by Cluster",
        "type": "graph",
        "targets": [
          {
            "expr": "sum by (cluster) (rate(container_network_receive_bytes_total[5m]))"
          },
          {
            "expr": "sum by (cluster) (rate(container_network_transmit_bytes_total[5m]))"
          }
        ]
      }
    ]
  }
}
```

### 4. GitOps部署（Argo CD）

**Application配置**

```yaml
# infrastructure/argocd/applications/multi-cluster-manager-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: multi-cluster-manager
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default

  source:
    repoURL: https://github.com/yourorg/multi-cluster-manager.git
    targetRevision: main
    path: infrastructure/kubernetes/apps/multi-cluster-manager
    helm:
      valueFiles:
        - values-dev.yaml

  destination:
    server: https://kubernetes.default.svc
    namespace: multi-cluster-manager

  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

**多集群部署**

```yaml
# infrastructure/argocd/applications/dev-cluster.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: app-dev
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/yourorg/app.git
    targetRevision: main
    path: helm/app
  destination:
    server: https://dev-cluster.example.com
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true

---
# infrastructure/argocd/applications/staging-cluster.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: app-staging
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/yourorg/app.git
    targetRevision: main
    path: helm/app
  destination:
    server: https://staging-cluster.example.com
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true

---
# infrastructure/argocd/applications/prod-cluster.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: app-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/yourorg/app.git
    targetRevision: main
    path: helm/app
  destination:
    server: https://prod-cluster.example.com
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### 5. 前端界面

**集群列表页面**

```vue
<!-- frontend/src/views/ClusterList.vue -->
<template>
  <div class="cluster-list">
    <div class="header">
      <h1>Kubernetes 集群管理</h1>
      <el-button type="primary" @click="showAddDialog = true">
        注册集群
      </el-button>
    </div>

    <el-table :data="clusters" v-loading="loading">
      <el-table-column prop="name" label="集群名称" />
      <el-table-column prop="environment" label="环境">
        <template #default="{ row }">
          <el-tag :type="getEnvironmentType(row.environment)">
            {{ row.environment }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="version" label="版本" />
      <el-table-column prop="nodeCount" label="节点数" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template #default="{ row }">
          <el-button size="small" @click="viewStats(row)">统计</el-button>
          <el-button size="small" @click="viewResources(row)">资源</el-button>
          <el-button size="small" type="danger" @click="deleteCluster(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加集群对话框 -->
    <el-dialog v-model="showAddDialog" title="注册集群" width="600px">
      <el-form :model="clusterForm" label-width="120px">
        <el-form-item label="集群名称">
          <el-input v-model="clusterForm.name" />
        </el-form-item>
        <el-form-item label="环境">
          <el-select v-model="clusterForm.environment">
            <el-option label="开发" value="dev" />
            <el-option label="测试" value="staging" />
            <el-option label="生产" value="prod" />
          </el-select>
        </el-form-item>
        <el-form-item label="KubeConfig">
          <el-input
            v-model="clusterForm.kubeConfig"
            type="textarea"
            :rows="10"
            placeholder="粘贴kubeconfig内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="registerCluster">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { clusterApi } from '@/api/cluster'

const clusters = ref([])
const loading = ref(false)
const showAddDialog = ref(false)

const clusterForm = ref({
  name: '',
  environment: 'dev',
  kubeConfig: ''
})

const fetchClusters = async () => {
  loading.value = true
  try {
    const { data } = await clusterApi.listClusters()
    clusters.value = data.clusters
  } catch (error) {
    ElMessage.error('获取集群列表失败')
  } finally {
    loading.value = false
  }
}

const registerCluster = async () => {
  try {
    await clusterApi.registerCluster(clusterForm.value)
    ElMessage.success('集群注册成功')
    showAddDialog.value = false
    fetchClusters()
  } catch (error) {
    ElMessage.error('集群注册失败')
  }
}

const deleteCluster = async (cluster: any) => {
  try {
    await clusterApi.deleteCluster(cluster.id)
    ElMessage.success('集群删除成功')
    fetchClusters()
  } catch (error) {
    ElMessage.error('集群删除失败')
  }
}

const viewStats = (cluster: any) => {
  // 跳转到统计页面
}

const viewResources = (cluster: any) => {
  // 跳转到资源页面
}

const getEnvironmentType = (env: string) => {
  const map: Record<string, string> = {
    dev: '',
    staging: 'warning',
    prod: 'danger'
  }
  return map[env] || ''
}

onMounted(() => {
  fetchClusters()
})
</script>
```

---

## 部署指南

### 1. 使用Terraform创建集群

```hcl
# infrastructure/terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# EKS集群
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.17.2"

  cluster_name    = "${var.project_name}-${var.environment}"
  cluster_version = "1.27"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    general = {
      desired_size = var.node_count
      min_size     = 2
      max_size     = 10

      instance_types = ["t3.medium"]
    }
  }
}
```

### 2. 使用Helm部署应用

```bash
# 添加Helm仓库
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# 安装Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values monitoring/prometheus/prometheus-values.yaml

# 安装Argo CD
helm install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --set server.service.type=LoadBalancer

# 部署应用
helm install multi-cluster-manager ./helm-charts/multi-cluster-manager \
  --namespace multi-cluster-manager \
  --create-namespace \
  --set image.tag=latest
```

### 3. 配置GitOps

```bash
# 创建secret
kubectl create secret generic git-creds \
  --from-literal=username=YOUR_USERNAME \
  --from-literal=password=YOUR_PASSWORD \
  -n argocd

# 应用Argo CD配置
kubectl apply -f infrastructure/argocd/applications/
```

---

## 学习成果

完成本项目后，你将掌握：

✅ **Kubernetes集群管理**
- 多集群统一管理
- 集群资源监控
- 跨集群应用部署

✅ **云原生技术栈**
- Helm Chart开发
- Kustomize配置管理
- Argo CD GitOps实践

✅ **可观测性**
- Prometheus监控配置
- Grafana仪表盘设计
- 告警规则编写

✅ **基础设施即代码**
- Terraform编写
- 多环境管理
- 持续部署流程

✅ **企业级实践**
- RBAC权限控制
- 高可用架构
- 灾难恢复

---

## 扩展练习

- [ ] 实现应用商店功能
- [ ] 集成Istio服务网格
- [ ] 实现自动扩缩容策略
- [ ] 添加成本管理功能
- [ ] 实现多租户隔离

---

**项目难度**：⭐⭐⭐⭐⭐
**预计时间**：60-80小时
**适合人群**：有Kubernetes基础，想深入学习企业级多集群管理
