---
title: 容器化与编排面试题
---

# 容器化与编排面试题

## Docker核心原理

### 1. 解释Docker的架构和核心组件？

**Docker采用客户端-服务器架构**，包含以下核心组件：

**架构图**：
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Docker CLI │ ───> │ Docker Daemon│ ───> │  containerd │
└─────────────┘      └─────────────┘      └─────────────┘
                           │                     │
                           ▼                     ▼
                    ┌─────────────┐      ┌─────────────┐
                    │    Images   │      │  Containers │
                    │    Layers   │      │  Runc       │
                    └─────────────┘      └─────────────┘
```

**核心组件**：

1. **Docker Client（CLI）**
   - 用户与Docker交互的接口
   - 发送命令（docker build、docker run等）

2. **Docker Daemon（dockerd）**
   - Docker的核心守护进程
   - 监听API请求并管理镜像、容器、网络、卷

3. **containerd**
   - 容器运行时（从Docker 1.11后独立）
   - 负责容器生命周期管理

4. **runc**
   - 底层容器运行时
   - 实际创建和运行容器的CLI工具

5. **Docker Registry**
   - 镜像仓库（Docker Hub、私有Registry）

### 2. Docker镜像的分层结构是什么？如何优化镜像大小？

**分层结构**：
```dockerfile
# 每个FROM、RUN、COPY、ADD指令都会创建一层
FROM ubuntu:22.04              # Layer 1: 基础镜像层
RUN apt-get update             # Layer 2: 更新层
COPY app.py /app/              # Layer 3: 应用层
CMD ["python", "/app/app.py"]  # Layer 4: 配置层（元数据）
```

**关键概念**：
- 镜像是只读的分层文件系统
- 容器在镜像顶部添加可写层
- 分层实现镜像复用和缓存

**优化镜像大小的方法**：

**1. 使用精简的基础镜像**
```dockerfile
# ❌ 差：使用完整操作系统（> 70MB）
FROM ubuntu:22.04

# ✅ 好：使用alpine（~5MB）
FROM alpine:3.19

# ✅ 更好：使用distroless（更安全、更小）
FROM gcr.io/distroless/python3-debian12
```

**2. 合并RUN指令**
```dockerfile
# ❌ 差：多层
RUN apt-get update
RUN apt-get install -y git
RUN apt-get install -y curl

# ✅ 好：单层
RUN apt-get update && \
    apt-get install -y git curl && \
    rm -rf /var/lib/apt/lists/*
```

**3. 多阶段构建**
```dockerfile
# 构建阶段
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

**4. 利用构建缓存**
```dockerfile
# ✅ 先复制依赖文件（变化少），再复制源码（变化多）
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

**5. 使用.dockerignore**
```
# .dockerignore
node_modules
npm-debug.log
.git
*.md
```

### 3. Docker容器与虚拟机的区别？

| 对比维度       | Docker容器                   | 虚拟机                     |
|--------------|----------------------------|---------------------------|
| **架构**      | 共享宿主机内核                | 独立的操作系统和内核          |
| **启动速度**   | 秒级                        | 分钟级                     |
| **资源占用**   | MB级别                      | GB级别                     |
| **隔离性**     | 进程级隔离（cgroups+namespace） | 硬件级隔离（Hypervisor）   |
| **性能**      | 接近原生（~5%损耗）           | 有明显损耗（~20-30%）      |
| **镜像大小**   | MB-GB                      | GB-TB                     |
| **迁移性**     | 跨平台能力强                 | 受硬件和虚拟化平台限制       |

**架构对比图**：
```
虚拟机：
┌─────────────────────────────────────────┐
│         Application A                    │
├─────────────────────────────────────────┤
│         Guest OS (Linux)                 │
├─────────────────────────────────────────┤
│         Hypervisor (VMware/KVM)          │
├─────────────────────────────────────────┤
│         Host OS                          │
├─────────────────────────────────────────┤
│         Hardware                         │
└─────────────────────────────────────────┘

Docker容器：
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  App A       │  │  App B       │  │  App C       │
│  Bins/Libs   │  │  Bins/Libs   │  │  Bins/Libs   │
├──────────────┤  ├──────────────┤  ├──────────────┤
│         Docker Engine                   │
├─────────────────────────────────────────┤
│         Host OS (共享内核)               │
├─────────────────────────────────────────┤
│         Hardware                         │
└─────────────────────────────────────────┘
```

### 4. 解释Docker的网络模式及其应用场景？

Docker提供5种网络模式：

**1. Bridge模式（默认）**
```bash
docker run --network bridge myapp
```
- 容器拥有独立IP
- 通过NAT访问外网
- 端口映射对外暴露
- **适用场景**：单机多容器通信

**2. Host模式**
```bash
docker run --network host myapp
```
- 容器与宿主机共享网络栈
- 无端口映射，直接使用宿主机端口
- **适用场景**：高性能网络应用（监控、网络工具）

**3. None模式**
```bash
docker run --network none myapp
```
- 无网络功能
- **适用场景**：高安全要求、离线任务

**4. Container模式**
```bash
docker run --network container:another_container myapp
```
- 共享其他容器的网络命名空间
- **适用场景**：Pod内容器通信（Kubernetes）

**5. 自定义网络**
```bash
docker network create mynetwork
docker run --network mynetwork app1
docker run --network mynetwork app2
```
- 支持容器名DNS解析
- 网络隔离
- **适用场景**：微服务应用

**网络对比表**：
| 模式       | IP地址     | DNS解析    | 端口映射   | 隔离性   |
|-----------|-----------|-----------|----------|---------|
| bridge    | 独立IP     | ✅        | ✅       | 中      |
| host      | 宿主机IP   | ✅        | ❌       | 无      |
| none      | 无        | ❌        | ❌       | 高      |
| container | 共享IP     | ✅        | ❌       | 低      |

## Kubernetes核心

### 5. 解释Kubernetes的架构和核心组件？

**架构图**：
```
┌────────────────── Control Plane ──────────────────┐
│  ┌──────────────┐  ┌──────────────┐              │
│  │ API Server   │◄─┤   etcd       │              │
│  └──────┬───────┘  └──────────────┘              │
│         │                                        │
│    ┌────┴────┐                                   │
│    │ Scheduler│                                  │
│    └────┬────┘                                   │
│         │                                        │
│  ┌──────┴────────┐  ┌──────────────┐            │
│  │ Controller    │─┤ cloud-controller│          │
│  │ Manager       │  │ manager        │          │
│  └───────────────┘  └───────────────┘            │
└──────────────────────────────────────────────────┘
           │         │         │
           ▼         ▼         ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Node 1   │ │ Node 2   │ │ Node 3   │
    │┌────────┐│ │┌────────┐│ │┌────────┐│
    ││kubelet ││ ││kubelet ││ ││kubelet ││
    │├────────┤│ │├────────┤│ │├────────┤│
    ││kube-   ││ ││kube-   ││ ││kube-   ││
    ││proxy   ││ ││proxy   ││ ││proxy   ││
    │└────────┘│ │└────────┘│ │└────────┘│
    │┌────────┐│ │┌────────┐│ │┌────────┐│
    ││Container││ ││Container││ ││Container││
    ││Runtime ││ ││Runtime ││ ││Runtime ││
    │└────────┘│ │└────────┘│ │└────────┘│
    └──────────┘ └──────────┘ └──────────┘
```

**Control Plane组件**：

**1. API Server（kube-apiserver）**
- 集群统一入口，REST API
- 认证、授权、准入控制
- 所有组件通过API Server通信

**2. etcd**
- 分布式键值存储
- 存储集群所有配置和状态数据
- Raft协议保证一致性

**3. Scheduler（kube-scheduler）**
- 调度Pod到合适的Node
- 调度策略：资源需求、亲和性、标签等

**4. Controller Manager（kube-controller-manager）**
- 维护集群状态
- 包含多个控制器：
  - Node Controller
  - ReplicaSet Controller
  - Deployment Controller
  - Service Controller

**Node组件**：

**1. kubelet**
- 与Master通信，管理Pod生命周期
- 上报Node状态
- 执行CNI（容器网络接口）

**2. kube-proxy**
- 维护网络规则（iptables/IPVS）
- 实现Service负载均衡

**3. Container Runtime**
- 运行容器（containerd、CRI-O）
- 实现CRI（容器运行时接口）

### 6. Pod、Deployment、Service的区别和联系？

**Pod**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: nginx
    image: nginx:1.25
```
- **最小部署单元**
- 包含一个或多个容器（共享网络、存储）
- 有独立IP（但易变）
- 通常不直接创建，通过控制器管理

**Deployment**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
```
- **管理无状态应用**
- 管理ReplicaSet，确保Pod副本数
- 支持滚动更新、回滚
- 声明式配置（期望状态）

**Service**：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```
- **提供稳定的网络访问**
- 通过标签选择器关联Pod
- 负载均衡流量到后端Pod
- ClusterIP（默认）、NodePort、LoadBalancer类型

**关系图**：
```
Deployment (管理)
    ↓
ReplicaSet (确保副本数)
    ↓
    ├─ Pod 1 ─┐
    ├─ Pod 2 ├── Service (负载均衡)
    └─ Pod 3 ─┘
```

**对比表**：
| 资源       | 作用             | 生命周期     | 是否创建IP |
|-----------|-----------------|------------|----------|
| Pod       | 运行容器          | 短暂        | ✅       |
| Deployment| 管理Pod副本和更新 | 长期        | ❌       |
| Service   | 提供稳定访问      | 长期        | ✅       |

### 7. 如何实现应用的滚动更新和回滚？

**滚动更新（Rolling Update）**：

```bash
# 方法1：直接修改镜像
kubectl set image deployment/nginx-deployment \
  nginx=nginx:1.26

# 方法2：编辑配置
kubectl edit deployment nginx-deployment

# 方法3：应用新配置
kubectl apply -f deployment.yaml
```

**Deployment配置策略**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 更新时最多多出1个Pod
      maxUnavailable: 1  # 更新时最多不可用1个Pod
  minReadySeconds: 10   # Pod就绪后等待10秒再继续
```

**滚动更新过程**：
```
初始状态：3个Pod运行v1版本
├─ nginx-v1 (Pod 1)
├─ nginx-v1 (Pod 2)
└─ nginx-v1 (Pod 3)

Step 1: 创建新Pod (maxSurge=1)
├─ nginx-v1 (Pod 1)
├─ nginx-v1 (Pod 2)
├─ nginx-v1 (Pod 3)
└─ nginx-v2 (Pod 4) [新创建]

Step 2: 删除旧Pod (maxUnavailable=1)
├─ nginx-v1 (Pod 2)
├─ nginx-v1 (Pod 3)
├─ nginx-v2 (Pod 4)
└─ nginx-v2 (Pod 5) [新创建]

Step 3: 继续滚动...
最终状态：3个Pod运行v2版本
├─ nginx-v2 (Pod 4)
├─ nginx-v2 (Pod 5)
└─ nginx-v2 (Pod 6)
```

**回滚操作**：

```bash
# 查看历史版本
kubectl rollout history deployment/nginx-deployment

# 回滚到上一版本
kubectl rollout undo deployment/nginx-deployment

# 回滚到指定版本
kubectl rollout undo deployment/nginx-deployment --to-revision=2

# 查看回滚状态
kubectl rollout status deployment/nginx-deployment
```

**版本保留策略**：
```yaml
spec:
  revisionHistoryLimit: 10  # 保留最近10个版本
```

**高级更新策略**：

**1. 金丝雀发布（Canary）**
```yaml
# 创建两个Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-canary
spec:
  replicas: 1  # 10%流量（假设总副本数为10）
  selector:
    matchLabels:
      app: nginx
      version: canary
```

**2. 蓝绿部署（Blue-Green）**
```yaml
# 先部署green版本，不影响blue版本
kubectl apply -f deployment-green.yaml

# 切换Service的selector到green
kubectl patch service nginx-service -p '{"spec":{"selector":{"version":"green"}}}'
```

### 8. ConfigMap和Secret的使用场景？

**ConfigMap**：
```yaml
# 创建ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  # 键值对形式
  APP_ENV: "production"
  APP_PORT: "8080"

  # 文件形式
  nginx.conf: |
    server {
      listen 80;
      location / {
        root /usr/share/nginx/html;
      }
    }
```

**使用方式**：

**1. 环境变量**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app
    image: nginx
    env:
    - name: APP_ENV
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: APP_ENV
```

**2. 命令行参数**
```yaml
spec:
  containers:
  - name: app
    image: nginx
    command: ["/bin/sh", "-c"]
    args: ["echo $(APP_ENV)"]
    envFrom:
    - configMapRef:
        name: app-config
```

**3. 挂载文件**
```yaml
spec:
  containers:
  - name: nginx
    image: nginx
    volumeMounts:
    - name: config-volume
      mountPath: /etc/nginx/nginx.conf
      subPath: nginx.conf
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

**Secret**：
```yaml
# 创建Secret（Base64编码）
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=  # echo -n 'admin' | base64
  password: MWYyZDFlMmU2N2Rm  # echo -n '1f2d1e2e67df' | base64
```

**使用方式**：
```yaml
spec:
  containers:
  - name: app
    image: postgres:15
    env:
    - name: POSTGRES_USER
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
    - name: POSTGRES_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
```

**特殊类型的Secret**：

**1. docker-registry（镜像仓库凭证）**
```bash
kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass
```

**2. tls（HTTPS证书）**
```bash
kubectl create secret tls my-tls \
  --cert=path/to/cert.crt \
  --key=path/to/cert.key
```

**3. ServiceAccount（自动创建的Token）**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  serviceAccountName: my-service-account
  containers:
  - name: app
    image: nginx
```

**ConfigMap vs Secret对比**：
| 特性       | ConfigMap     | Secret         |
|-----------|--------------|----------------|
| **用途**   | 非敏感配置    | 敏感数据        |
| **存储**   | 明文存储      | Base64编码      |
| **etcd加密**| ❌           | ✅（可配置）    |
| **挂载方式**| 文件、环境变量 | 文件、环境变量  |
| **大小限制**| 1MB          | 1MB            |

**最佳实践**：
1. 敏感数据（密码、密钥、Token）使用Secret
2. 配置文件、环境变量使用ConfigMap
3. 启用etcd加密：`--encryption-provider-config`
4. 使用RBAC控制Secret访问权限
5. 定期轮换Secret

### 9. 什么是Init Container？有什么应用场景？

**Init Container（初始化容器）**：
- 在应用容器启动前运行的专用容器
- 按顺序执行，必须全部成功后应用容器才启动
- 与应用容器共享Pod的存储和网络

**配置示例**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app-pod
spec:
  initContainers:
  - name: init-db
    image: busybox:1.36
    command: ['sh', '-c', 'until nslookup db-service; do echo waiting for db; sleep 2; done;']

  - name: init-cache
    image: busybox:1.36
    command: ['sh', '-c', 'until nslookup cache-service; do echo waiting for cache; sleep 2; done;']

  containers:
  - name: app
    image: myapp:v1
```

**应用场景**：

**1. 等待依赖服务就绪**
```yaml
initContainers:
- name: wait-for-mysql
  image: busybox:1.36
  command: ['sh', '-c', 'until nc -z mysql-service 3306; do sleep 2; done;']
```

**2. 预加载数据**
```yaml
initContainers:
- name: clone-repo
  image: alpine/git:2.40
  command: ['sh', '-c', 'git clone https://github.com/user/repo.git /data']
  volumeMounts:
  - name: data
    mountPath: /data

containers:
- name: app
  image: myapp:v1
  volumeMounts:
  - name: data
    mountPath: /data
```

**3. 初始化配置**
```yaml
initContainers:
- name: init-config
  image: busybox:1.36
  command: ['sh', '-c', 'echo "INIT=1" > /config/init.env']
  volumeMounts:
  - name: config
    mountPath: /config
```

**4. 网络配置**
```yaml
initContainers:
- name: setup-network
  image: istio/proxy_init:1.19
  args:
  - -p
  - "15001"
  - -u
  - "1337"
  - -m
  - REDIRECT
  - -i
  - "*"
  - -x
  - ""
  - -b
  - "15090,15021,15020"
  securityContext:
    capabilities:
      add:
      - NET_ADMIN
```

**与普通容器对比**：
| 特性          | Init Container    | 应用容器            |
|-------------|------------------|-------------------|
| **启动顺序**  | 先启动            | Init完成后启动      |
| **并行运行**  | 顺序执行           | 可并行运行          |
| **失败处理**  | Pod失败并重启      | 重启策略生效        |
| **探针**      | 不支持            | 支持readiness/liveness |
| **资源限制**  | 独立设置          | 独立设置           |

### 10. Kubernetes的资源限制（Requests和Limits）？

**资源配置**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-pod
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    resources:
      requests:
        cpu: "100m"      # 0.1 CPU核心（100毫核）
        memory: "128Mi"  # 128 MiB内存
      limits:
        cpu: "500m"      # 0.5 CPU核心
        memory: "512Mi"  # 512 MiB内存
```

**Requests vs Limits**：

**Requests（请求资源）**：
- 调度时使用的最小资源保证
- Kubernetes确保Pod获得这些资源
- 用于Pod调度决策

**Limits（限制资源）**：
- 容器可使用的最大资源上限
- 超过Limit会触发限制或OOM
- 可选设置（不设置则等于Requests）

**资源单位**：
- CPU：`100m` = 0.1核心 = 100毫核
- Memory：`128Mi`（二进制） vs `128MB`（十进制）

**资源策略**：

**1. QoS（服务质量等级）**

**Guaranteed（保证型）**：
```yaml
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```
- CPU和Memory的requests等于limits
- 优先级最高，不容易被驱逐

**Burstable（突发型）**：
```yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```
- requests < limits
- 优先级中等，资源不足时可能被驱逐

**BestEffort（尽力型）**：
```yaml
# 未设置requests和limits
```
- 不设置requests和limits
- 优先级最低，最先被驱逐

**2. 资源超额申请（Overcommit）**
```
集群总资源：4 CPU, 16GB内存

Pod 1: requests=1 CPU, limits=2 CPU
Pod 2: requests=1 CPU, limits=2 CPU
Pod 3: requests=1 CPU, limits=2 CPU

Requests总计：3 CPU（可超额申请）
Limits总计：6 CPU（实际可使用上限）
```

**3. LimitRange（默认限制）**
```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: cpu-limit-range
spec:
  limits:
  - default:        # 默认limits
      cpu: "800m"
    defaultRequest: # 默认requests
      cpu: "500m"
    type: Container
```

**4. ResourceQuota（命名空间配额）**
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: dev
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
```

**资源监控**：
```bash
# 查看节点资源使用
kubectl top nodes

# 查看Pod资源使用
kubectl top pods

# 查看Pod资源分配
kubectl describe pod my-pod | grep -A 5 Requests
```

**最佳实践**：
1. 所有容器都设置requests和limits
2. 根据实际监控数据调整资源配置
3. 关键应用使用Guaranteed QoS
3. 使用Horizontal Pod Autoscaler（HPA）自动扩缩容
4. 使用Vertical Pod Autoscaler（VPA）自动调整资源

## 实战场景题

### 11. 如何排查Pod启动失败的问题？

**排查流程**：

```bash
# 1. 查看Pod状态
kubectl get pods -n <namespace>

# 2. 查看Pod详细信息
kubectl describe pod <pod-name> -n <namespace>

# 3. 查看Pod日志
kubectl logs <pod-name> -n <namespace>

# 4. 如果有多个容器，指定容器
kubectl logs <pod-name> -c <container-name> -n <namespace>

# 5. 查看之前的日志（如果Pod重启过）
kubectl logs <pod-name> --previous

# 6. 进入容器调试
kubectl exec -it <pod-name> -- /bin/sh

# 7. 查看事件
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

**常见问题及解决**：

**问题1：ImagePullBackOff（镜像拉取失败）**
```
Events:
  Warning  Failed     2m  kubelet  Failed to pull image
```
**原因**：
- 镜像不存在或标签错误
- 未登录私有仓库
- 网络问题

**解决**：
```bash
# 检查镜像名和标签
kubectl describe pod <pod-name> | grep Image

# 登录私有仓库
docker login registry.example.com

# 创建imagePullSecret
kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass

# 在Pod中引用
spec:
  imagePullSecrets:
  - name: regcred
```

**问题2：CrashLoopBackOff（容器反复重启）**
```
State:      Waiting
  Last State:     Terminated
    Reason:       Error
    Exit Code:    137
```
**原因**：
- 应用崩溃
- 健康检查失败
- 资源不足（OOMKilled）

**解决**：
```bash
# 查看应用日志
kubectl logs <pod-name> --previous

# 检查资源限制
kubectl describe pod <pod-name> | grep -A 5 Limits

# 检查健康检查配置
kubectl get pod <pod-name> -o yaml | grep -A 10 liveness
```

**问题3：Pending（调度失败）**
```
Status:      Pending
```
**原因**：
- 资源不足
- 调度限制（亲和性、Taint）
- PVC未绑定

**解决**：
```bash
# 检查调度事件
kubectl describe pod <pod-name> | grep -A 10 Events

# 检查节点资源
kubectl describe nodes

# 检查调度限制
kubectl get pod <pod-name> -o yaml | grep -A 5 affinity
```

**问题4：OOMKilled（内存溢出）**
```
Last State:     Terminated
  Reason:       OOMKilled
  Exit Code:    137
```
**解决**：
```yaml
# 增加内存限制
resources:
  limits:
    memory: "1Gi"  # 从512Mi增加到1Gi
```

### 12. 如何优化Kubernetes集群的资源利用率？

**优化策略**：

**1. 设置合理的资源请求和限制**
```yaml
# 根据历史监控数据设置
resources:
  requests:
    cpu: "200m"      # P50值
    memory: "256Mi"  # P50值
  limits:
    cpu: "1000m"     # P95值
    memory: "1Gi"    # P95值
```

**2. 使用自动扩缩容**

**HPA（水平扩缩容）**：
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**VPA（垂直扩缩容）**：
```bash
# 安装VPA
kubectl apply -f vpa-recommender.yaml

# 创建VPA
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: my-app-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  updatePolicy:
    updateMode: "Auto"
```

**3. 使用Cluster Autoscaler（集群自动扩缩容）**
```bash
# 云厂商配置示例（AWS EKS）
eksctl utils update-cluster-logging \
  --region=us-west-2 \
  --cluster=my-cluster \
  --enable-types=api,audit

# 配置自动扩缩容组
autoscalingGroups:
  - name: ng-1
    minSize: 2
    maxSize: 10
    desiredCapacity: 2
```

**4. 优化节点资源分配**

**使用Node Selector和亲和性**：
```yaml
# 节点选择器
spec:
  nodeSelector:
    disktype: ssd

# 节点亲和性
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: node.kubernetes.io/instance-type
          operator: In
          values:
          - c5.large
          - c5.xlarge
```

**Pod反亲和性（打散分布）**：
```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - my-app
        topologyKey: kubernetes.io/hostname
```

**5. 使用PriorityClass**
```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000
globalDefault: false
description: "高优先级应用"
```

**6. 优化调度策略**
```yaml
# 使用Descheduler（重新平衡集群）
apiVersion: "scheduling.k8s.io/v1alpha1"
kind: "DeschedulerPolicy"
strategies:
  "RemoveDuplicates":
    enabled: true
  "LowNodeUtilization":
    enabled: true
    params:
      nodeResourceUtilizationThresholds:
        thresholds:
          cpu: 30
          memory: 30
        targetThresholds:
          cpu: 70
          memory: 70
```

**7. 监控和告警**
```yaml
# Prometheus监控规则
groups:
- name: kubernetes-resources
  rules:
  - alert: NodeOvercommitted
    expr: sum(kube_pod_container_resource_requests{resource="cpu"}) / sum(kube_node_status_capacity{resource="cpu"}) > 1
    for: 5m
    annotations:
      summary: "节点资源超额申请"
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
