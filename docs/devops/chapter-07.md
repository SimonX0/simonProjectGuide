# Kubernetes 容器编排

## 什么是 Kubernetes

Kubernetes（简称 K8s）是一个开源的容器编排平台，用于自动化部署、扩展和管理容器化应用。由 Google 开发，现在是 CNCF（云原生计算基金会）的毕业项目。

### 为什么需要 Kubernetes

Docker 解决了单个容器的运行问题，但生产环境需要：

- **自动化部署**：自动部署和更新应用
- **弹性伸缩**：根据负载自动扩缩容
- **服务发现**：自动发现和路由服务
- **负载均衡**：分发流量到多个实例
- **自愈能力**：自动重启失败的容器
- **滚动更新**：零停机更新应用
- **存储管理**：自动挂载持久化存储

### Kubernetes vs Docker Compose

| 特性 | Docker Compose | Kubernetes |
|------|----------------|------------|
| 适用场景 | 单机、开发测试 | 生产环境、集群 |
| 扩展性 | 有限 | 强大 |
| 自愈能力 | 无 | 有 |
| 负载均衡 | 简单 | 强大 |
| 学习曲线 | 平缓 | 陡峭 |

## 核心概念

### 集群架构

```
┌─────────────────────────────────────┐
│          Control Plane              │
│  ┌──────────┐  ┌──────────────┐    │
│  │ API      │  │ Scheduler    │    │
│  │ Server   │  │              │    │
│  └──────────┘  └──────────────┘    │
│  ┌──────────┐  ┌──────────────┐    │
│  │ Controller│  │ Cloud        │    │
│  │ Manager  │  │ Controller   │    │
│  └──────────┘  └──────────────┘    │
└─────────────────────────────────────┘
                 ▲
                 │
┌────────────────┴────────────────┐
│         Worker Nodes             │
│  ┌──────────┐  ┌──────────┐     │
│  │ Node 1   │  │ Node 2   │     │
│  │ ┌──────┐ │  │ ┌──────┐ │     │
│  │ │ Pod  │ │  │ │ Pod  │ │     │
│  │ └──────┘ │  │ └──────┘ │     │
│  └──────────┘  └──────────┘     │
└──────────────────────────────────┘
```

### 核心组件

**Control Plane（控制平面）**

- **kube-apiserver**：API 服务器，集群入口
- **etcd**：键值存储，保存集群数据
- **kube-scheduler**：调度器，分配 Pod 到节点
- **kube-controller-manager**：控制器管理器
- **cloud-controller-manager**：云控制器管理器

**Worker Node（工作节点）**

- **kubelet**：节点代理，管理 Pod
- **kube-proxy**：网络代理，维护网络规则
- **Container Runtime**：容器运行时（Docker、containerd）

### Pod

Pod 是 Kubernetes 中最小的部署单元，包含一个或多个容器：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80
```

**Pod 特性**
- 共享网络和存储
- 临时性的，可被替换
- 有自己的 IP 地址
- 通常通过 Controller 管理

## 安装 Kubernetes

### Minikube（本地开发）

```bash
# 安装 Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# 启动集群
minikube start

# 查看状态
minikube status

# 启用仪表板
minikube dashboard
```

### kubectl 安装

```bash
# 下载 kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# 安装
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# 验证
kubectl version --client

# 查看节点
kubectl get nodes
```

## 基本资源

### Deployment

Deployment 管理 Pod 的副本和更新：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3                      # 副本数
  selector:
    matchLabels:
      app: nginx
  template:                        # Pod 模板
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
```

**操作命令**

```bash
# 创建 Deployment
kubectl apply -f deployment.yaml

# 查看 Deployment
kubectl get deployments

# 查看 Pod
kubectl get pods

# 扩缩容
kubectl scale deployment nginx-deployment --replicas=5

# 更新镜像
kubectl set image deployment/nginx-deployment nginx=nginx:1.22

# 查看更新状态
kubectl rollout status deployment/nginx-deployment

# 回滚
kubectl rollout undo deployment/nginx-deployment
```

### Service

Service 提供稳定的网络访问：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer               # 类型：ClusterIP, NodePort, LoadBalancer
```

**Service 类型**

- **ClusterIP**：集群内部访问（默认）
- **NodePort**：通过节点端口访问
- **LoadBalancer**：通过负载均衡器访问
- **ExternalName**：映射外部 DNS

### ConfigMap

ConfigMap 存储配置数据：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database_url: "postgres://localhost:5432/mydb"
  cache_enabled: "true"
---
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app
    image: myapp
    envFrom:
    - configMapRef:
        name: app-config
```

### Secret

Secret 存储敏感数据：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  password: cGFzc3dvcmQxMjM=      # base64 编码
---
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app
    image: myapp
    env:
    - name: PASSWORD
      valueFrom:
        secretKeyRef:
          name: app-secret
          key: password
```

### PersistentVolume (PV)

PV 表示集群中的存储资源：

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-volume
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /mnt/data
```

### PersistentVolumeClaim (PVC)

PVC 声明存储需求：

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-volume
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - mountPath: /data
      name: my-volume
  volumes:
  - name: my-volume
    persistentVolumeClaim:
      claimName: pvc-volume
```

### Namespace

Namespace 隔离资源：

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
```

```bash
# 创建 Namespace
kubectl create namespace development

# 在指定 Namespace 中操作
kubectl apply -f deployment.yaml -n development

# 查看 Namespace
kubectl get namespaces

# 设置默认 Namespace
kubectl config set-context --current --namespace=development
```

## 常用命令

### 集群管理

```bash
# 查看集群信息
kubectl cluster-info

# 查看节点
kubectl get nodes

# 查看节点详情
kubectl describe node node-1

# 查看资源使用
kubectl top nodes
kubectl top pods
```

### 资源管理

```bash
# 应用配置
kubectl apply -f deployment.yaml

# 删除资源
kubectl delete -f deployment.yaml
kubectl delete deployment nginx-deployment

# 查看 Pod
kubectl get pods
kubectl get pods -o wide           # 包含 IP 和节点
kubectl get pods --all-namespaces

# 查看 Pod 详情
kubectl describe pod my-pod

# 查看 Pod 日志
kubectl logs my-pod
kubectl logs -f my-pod             # 实时日志

# 进入 Pod
kubectl exec -it my-pod -- /bin/bash

# 端口转发
kubectl port-forward pod/my-pod 8080:80
```

### 故障排查

```bash
# 查看 Pod 事件
kubectl describe pod my-pod

# 查看日志
kubectl logs my-pod

# 查看前一个容器日志
kubectl logs my-pod --previous

# 在 Pod 中执行命令
kubectl exec my-pod -- ps aux

# 查看资源使用
kubectl top pods
```

## 部署应用

### 完整示例

**deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

```bash
# 部署应用
kubectl apply -f deployment.yaml

# 查看状态
kubectl get deployments
kubectl get pods
kubectl get services

# 访问应用
minikube service web-service
```

## Ingress

Ingress 管理 HTTP 路由：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

## 滚动更新

```bash
# 更新镜像
kubectl set image deployment/web-app nginx=nginx:1.22

# 查看更新状态
kubectl rollout status deployment/web-app

# 查看更新历史
kubectl rollout history deployment/web-app

# 回滚到上一个版本
kubectl rollout undo deployment/web-app

# 回滚到指定版本
kubectl rollout undo deployment/web-app --to-revision=2

# 暂停更新
kubectl rollout pause deployment/web-app

# 恢复更新
kubectl rollout resume deployment/web-app
```

## 自动伸缩

### Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

```bash
# 创建 HPA
kubectl apply -f hpa.yaml

# 查看 HPA
kubectl get hpa

# 手动扩缩容
kubectl scale deployment web-app --replicas=5
```

## 最佳实践

### 资源限制

```yaml
resources:
  requests:                    # 最小资源保证
    memory: "64Mi"
    cpu: "250m"
  limits:                      # 最大资源限制
    memory: "128Mi"
    cpu: "500m"
```

### 健康检查

```yaml
livenessProbe:                 # 存活探针
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:                # 就绪探针
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 安全配置

```yaml
# 限制权限
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000
  capabilities:
    drop:
    - ALL

# 网络策略
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

---

## Kubernetes 1.28+ 新特性 (2024-2025)

### Sidecar容器 (GA in 1.29)

**Sidecar容器**是与主容器独立的生命周期，用于日志收集、监控代理等场景。

**传统方式 vs Sidecar容器**：

```yaml
# 传统方式：使用postStart和共享volume
apiVersion: v1
kind: Pod
metadata:
  name: legacy-sidecar
spec:
  containers:
  - name: app
    image: nginx:1.25
    lifecycle:
      postStart:
        exec:
          command: ["/bin/sh", "-c", "cp /var/log/app.log /shared/access.log"]
    volumeMounts:
    - name: shared
      mountPath: /shared
  - name: log-agent
    image: fluentd:v1.16
    command: ["sh", "-c", "tail -f /shared/access.log"]
    volumeMounts:
    - name: shared
      mountPath: /shared
  volumes:
  - name: shared
    emptyDir: {}
```

```yaml
# 新方式：Sidecar容器 (K8s 1.29+)
apiVersion: v1
kind: Pod
metadata:
  name: modern-sidecar
spec:
  containers:
  - name: app
    image: nginx:1.25
    restartPolicy: Always  # 主容器保持运行

  - name: log-agent
    image: fluentd:v1.16
    restartPolicy: Always  # Sidecar独立重启
    sidecar: true  # 标记为Sidecar (1.29+)

# 特性：
# ✅ Sidecar可以在主容器之前启动
# ✅ Sidecar可以独立重启，不影响主容器
# ✅ 主容器退出时Sidecar自动退出
```

**Sidecar实战场景**：

```yaml
# 场景1：日志收集Sidecar
apiVersion: v1
kind: Pod
metadata:
  name: web-with-logging
spec:
  containers:
  # 主应用
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx

  # 日志收集Sidecar
  - name: fluentd
    image: fluentd:v1.16
    sidecar: true
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
      readOnly: true
    - name: config
      mountPath: /fluentd/etc

  volumes:
  - name: logs
    emptyDir: {}
  - name: config
    configMap:
      name: fluentd-config

---
# 场景2：监控Sidecar
apiVersion: v1
kind: Pod
metadata:
  name: app-with-monitoring
spec:
  containers:
  # 主应用
  - name: app
    image: myapp:v1.0
    env:
    - name: POD_NAME
      valueFrom:
        fieldRef:
          fieldPath: metadata.name

  # 监控Sidecar
  - name: envoy
    image: envoyproxy/envoy:v1.29
    sidecar: true
    ports:
    - containerPort: 9901
      name: admin
    - containerPort: 10000
      name: proxy
    volumeMounts:
    - name: config
      mountPath: /etc/envoy

  volumes:
  - name: config
    configMap:
      name: envoy-config
```

### HPA水平自动扩缩容 (2.0+)

**HPA 2.0**支持更多指标：自定义指标、外部指标等。

```yaml
# HPA 2.0 - 多指标自动扩缩容
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: advanced-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  # 类型1：资源指标
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80

  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70

  # 类型2：自定义指标
  - type: Pods
    pods:
      metric:
        name: packets-per-second
      target:
        type: AverageValue
        averageValue: "1k"

  # 类型3：外部指标
  - type: External
    external:
      metric:
        name: queue-messages-ready
        selector:
          matchLabels:
            queue: "worker_tasks"
      target:
        type: AverageValue
        averageValue: "30"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

**HPA行为配置**：

```yaml
# 快速扩容，缓慢缩容
behavior:
  scaleUp:
    # 扩容稳定窗口：60秒内不会重复扩容
    stabilizationWindowSeconds: 60

    # 扩容策略
    policies:
    # 策略1：每次最多增加50%副本
    - type: Percent
      value: 50
      periodSeconds: 15

    # 策略2：每15秒最多增加4个副本
    - type: Pods
      value: 4
      periodSeconds: 15

    # 选择更激进的策略
    selectPolicy: Max

  scaleDown:
    # 缩容稳定窗口：300秒内不会重复缩容
    stabilizationWindowSeconds: 300

    # 缩容策略
    policies:
    - type: Percent
      value: 10
      periodSeconds: 60

    # 限制：无论负载多低，最多缩容到2个副本
    selectPolicy: Min
```

**HPA + 自定义指标**：

```yaml
# 1. 安装Prometheus Adapter
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/prometheus-adapter/master/docs/deployments manifests/

# 2. 配置自定义指标
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-adapter-config
  namespace: monitoring
data:
  config.yaml: |
    rules:
    # SeriesQuery: 定义如何从Prometheus查询指标
    - seriesQuery: '{__name__="http_requests_total"}'
      # 资源名称
      resources:
        overrides:
          namespace: {resource: "namespace"}
          pod: {resource: "pod"}
      # 指标名称
      name:
        matches: "^(.*)_total"
        as: ""
      # 指标类型
      metricsQuery: 'sum(rate(<<.Series>>{<<.LabelMatchers>>}[2m])) by (<<.GroupBy>>)'

---
# 3. 使用自定义指标的HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hpa-custom-metrics
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  # 使用Prometheus自定义指标
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
```

### CEL验证 (Admission Webhook替代)

**CEL**（Common Expression Language）是Kubernetes 1.25+的内置验证机制，无需部署Webhook服务。

```yaml
# ValidatingAdmissionPolicy with CEL
apiVersion: admissionregistration.k8s.io/v1alpha1
kind: ValidatingAdmissionPolicy
metadata:
  name: must-have-owner-label
spec:
  # 匹配规则
  matchConstraints:
    resourceRules:
    - apiGroups: [""]
      apiVersions: ["v1"]
      operations: ["CREATE", "UPDATE"]
      resources: ["pods"]

  # CEL验证表达式
  validations:
  - expression: "object.metadata.labels.owner != null"
    message: "Pod must have owner label"

  - expression: "object.spec.containers.all(c, c.resources.requests != null)"
    message: "All containers must have resource requests"

  - expression: "object.spec.containers.all(c, c.image =~ 'myregistry\\.com.*')"
    message: "Only images from myregistry.com are allowed"

---
# 带参数的验证策略
apiVersion: admissionregistration.k8s.io/v1alpha1
kind: ValidatingAdmissionPolicy
metadata:
  name: limit-containers-per-pod
spec:
  matchConstraints:
    resourceRules:
    - apiGroups: [""]
      apiVersions: ["v1"]
      operations: ["CREATE"]
      resources: ["pods"]

  # 参数定义
  parameters:
    apiVersion: v1
    kind: LimitContainersParams

  # CEL表达式，使用parameters.maxContainers
  validations:
  - expression: "len(object.spec.containers) <= params.maxContainers"
    message: "Pod cannot have more than {{params.maxContainers}} containers"

  - expression: "object.spec.containers.all(c, !has(c.securityContext) || c.securityContext.privileged != true)"
    message: "Privileged containers are not allowed"

---
# 参数绑定
apiVersion: v1
kind: LimitContainersParams
metadata:
  name: default-limits
maxContainers: 3

---
# 使用参数的ClusterBinding
apiVersion: admissionregistration.k8s.io/v1alpha1
kind: ValidatingAdmissionPolicyBinding
metadata:
  name: binding-limit-containers
spec:
  policyName: limit-containers-per-pod
  validationActions: [Deny]
  paramRef:
    name: default-limits
```

**CEL高级验证**：

```yaml
# 场景1：强制标签验证
apiVersion: admissionregistration.k8s.io/v1alpha1
kind: ValidatingAdmissionPolicy
metadata:
  name: require-environment-label
spec:
  matchConstraints:
    resourceRules:
    - apiGroups: ["apps"]
      resources: ["deployments"]
  validations:
  - expression: >
      has(object.metadata.labels.environment) &&
      object.metadata.labels.environment in ['dev', 'staging', 'prod']
    message: "Deployment must have environment label (dev/staging/prod)"

---
# 场景2：Ingress路径验证
apiVersion: admissionregistration.k8s.io/v1alpha1
kind: ValidatingAdmissionPolicy
metadata:
  name: validate-ingress-rules
spec:
  matchConstraints:
    resourceRules:
    - apiGroups: ["networking.k8s.io"]
      resources: ["ingresses"]
  validations:
  - expression: >
      object.spec.rules.all(rule,
        has(rule.http) &&
        rule.http.paths.all(path,
          has(path.backend) &&
          has(path.backend.service) &&
          has(path.backend.service.name)
        )
      )
    message: "All ingress paths must specify a backend service"

---
# 场景3：资源配额验证
apiVersion: admissionregistration.k8s.io/v1alpha1
kind: ValidatingAdmissionPolicy
metadata:
  name: validate-pod-resources
spec:
  parameters:
    apiVersion: v1
    kind: ResourceLimits
  matchConstraints:
    resourceRules:
    - apiGroups: [""]
      resources: ["pods"]
  validations:
  - expression: >
      object.spec.containers.all(c,
        has(c.resources) &&
        has(c.resources.limits) &&
        has(c.resources.limits.memory) &&
        c.resources.limits.memory | int(params.maxMemory) <= params.maxMemory
      )
    message: "Container memory limit must not exceed {{params.maxMemory}}"
    messageExpression: >
      "Container '" + string(object.spec.containers.index(c,
        !has(c.resources.limits.memory) ||
        c.resources.limits.memory | int(params.maxMemory) > params.maxMemory
      )) + "' exceeds memory limit of " + params.maxMemory
```

### 动态资源分配 (DRA)

**DRA**（Dynamic Resource Allocation）是Kubernetes 1.26+的特性，支持GPU、FPGA、SR-IOV等特殊资源的动态分配。

```yaml
# ResourceClass定义资源类
apiVersion: resource.k8s.io/v1alpha1
kind: ResourceClass
metadata:
  name: gpu-nvidia
driverName: nvidia.com/gpu
parameters:
  apiGroup: resource.k8s.io
  kind: NvidiaGPUParameters
  name: default-gpu-parameters

---
# ResourceClaimTemplate定义资源申请模板
apiVersion: v1
kind: ResourceClaimTemplate
metadata:
  name: gpu-claim-template
spec:
  metadata:
    name: gpu-claim
  spec:
    resourceClassName: gpu-nvidia
    parameters:
      count: "2"
      type: "A100"

---
# Pod使用DRA资源
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  containers:
  - name: cuda-app
    image: nvidia/cuda:12.0.0-runtime-ubuntu22.04
    resources:
      claims:
      - name: gpu
  resourceClaims:
  - name: gpu
    template:
      spec:
        resourceClassName: gpu-nvidia
```

### Kubernetes 1.28+其他重要特性

**1. Job成功终止控制** (1.23+)：

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: job-with-success-policy
spec:
  # 新增：成功策略
  successPolicy:
    rules:
    - succeededCount: 3  # 任意3个Pod成功即认为Job成功

  completions: 10
  parallelism: 5
  template:
    spec:
      containers:
      - name: worker
        image: busybox
        command: ["sh", "-c", "sleep $((RANDOM % 30)) && exit 0"]
```

**2. StatefulSet启动顺序控制** (1.27+)：

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ordered-statefulset
spec:
  # 新增：最小就绪秒数
  minReadySeconds: 10
  # 新增：Pod管理策略
  podManagementPolicy: OrderedReady  # 或Parallel

  # 新增：持久化卷保留策略
  persistentVolumeClaimRetentionPolicy:
    whenDeleted: Retain  # 或Delete
    whenScaled: Retain    # 或Delete
```

**3. NetworkPolicy状态检查** (1.27+)：

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: test-network-policy
  annotations:
    # 新增：测试模式
    "kubernetes.io/test-mode": "true"
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector: {}
```

**4. 事件驱动的自动扩缩容** (1.27+)：

```yaml
# KEDA (Kubernetes Event-driven Autoscaling)
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: redis-scaledobject
spec:
  scaleTargetRef:
    name: redis-consumer
  minReplicaCount: 0
  maxReplicaCount: 10
  triggers:
  - type: redis
    metadata:
      address: redis:6379
      listName: messages
      listLength: "5"
      threshold: "10"
```

---

### 学习路径

1. **基础阶段**：理解核心概念和基本操作
2. **实践阶段**：部署简单的应用
3. **进阶阶段**：学习高级特性（监控、安全）
4. **生产阶段**：实际项目应用

### 实践建议

1. **使用 Minikube**：本地练习
2. **学习 YAML**：熟练编写配置文件
3. **理解原理**：不只是会用，要理解原理
4. **实践项目**：部署完整的应用栈
5. **关注社区**：了解最新发展

### 练习任务

- [ ] 使用 Minikube 搭建集群
- [ ] 部署 Nginx 应用
- [ ] 配置 ConfigMap 和 Secret
- [ ] 实现滚动更新
- [ ] 配置 HPA 自动伸缩

## 总结

Kubernetes 是现代云原生应用的核心平台。通过本章学习，你应该掌握了：

- Kubernetes 的核心概念和架构
- Pod、Deployment、Service 的使用
- 配置和存储管理
- 滚动更新和自动伸缩
- 基本的故障排查技能

下一章我们将学习 [CI/CD 基础概念](chapter-08)，了解如何实现持续集成和持续部署。
