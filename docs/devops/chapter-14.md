# Argo CD 与 GitOps

## 2024-2026 更新

### GitOps 技术栈变化 (2024-2026)

**2024-2026年GitOps技术栈：**

- **Argo CD 2.10+**：GitOps持续交付标准，功能完善
- **Flux CD**：CNCF孵化项目，轻量级替代
- **GitOps成为标准**：声明式CD、自动同步、版本控制
- **CI/CD分离**：CI构建镜像，CD(GitOps)自动部署
- **Secret管理**：Sealed Secrets、External Secrets Operator
- **Helm + Kustomize**：包管理和覆盖标准

**推荐技术栈 (2024-2026)：**
```yaml
GitOps工具选择：
  标准选择: Argo CD 2.10+ (功能最完善)
  轻量级: Flux CD (CNCF孵化)
  企业级: Argo CD Pro + RBAC

配置管理：
  包管理: Helm 3.16+ (K8s包管理标准)
  覆盖: Kustomize (原生支持)
  模板: Helm + Kustomize组合

Secret管理：
  加密: Sealed Secrets (Bitnami)
  集成: External Secrets Operator
  Vault: HashiCorp Vault (企业级)

工作流:
  开发: GitHub Actions (CI)
  部署: Argo CD (CD)
  监控: Prometheus + Grafana
```

## 什么是 GitOps

GitOps 是一种持续交付（CD）的方法论，使用 Git 作为"单一事实来源"来管理基础设施和应用的部署。

### GitOps 核心概念

- **声明式**：系统状态通过代码描述
- **版本化**：所有变更都通过 Git 提交
- **自动化**：自动将期望状态同步到实际状态
- **持续协调**：持续监控和修正偏差

### GitOps vs 传统 CI/CD

| 特性 | 传统 CI/CD | GitOps |
|------|-----------|--------|
| 配置来源 | 脚本、命令 | Git 仓库 |
| 部署方式 | 推送式 | 拉取式 |
| 状态同步 | 手动触发 | 自动同步 |
| 变更审计 | 有限 | 完整 Git 历史 |
| 回滚 | 手动 | Git revert |

### GitOps 工作流程

```
开发人员提交代码
  ↓
Git 仓库变更
  ↓
CI/CD 管道构建镜像
  ↓
更新 Git 配置仓库
  ↓
GitOps 工具检测变更
  ↓
自动同步到集群
  ↓
应用部署成功
```

## Argo CD 简介

### 什么是 Argo CD

Argo CD 是一个基于 Kubernetes 的**声明式 GitOps 持续交付工具**。

### 核心特性

- **自动同步**：Git 和集群状态自动同步
- **可视化界面**：直观的 Web UI
- **回滚能力**：快速回滚到任意版本
- **多集群管理**：支持管理多个 K8s 集群
- **多云支持**：任何符合标准的 K8s 集群
- **Secret 管理**：集成多种 Secret 管理方案

## 安装 Argo CD

### 方式1：使用 Manifest 安装

```bash
# 创建 namespace
kubectl create namespace argocd

# 安装 Argo CD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 验证安装
kubectl get pods -n argocd
```

### 方式2：使用 Helm 安装

```bash
# 添加 Argo Helm 仓库
helm repo add argo https://argoproj.github.io/argo-helm

# 安装 Argo CD
helm install argocd -n argocd --create-namespace argo/argo-cd

# 验证
kubectl get pods -n argocd
```

### 访问 Argo CD

```bash
# 端口转发
kubectl port-forward svc/argocd-server -n argocd 8080:443

# 访问 UI
open https://localhost:8080

# 获取初始密码
kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-server -o name | cut -d'/' -f2
```

### CLI 工具安装

```bash
# macOS
brew install argocd

# Linux
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64

# Windows (使用 Chocolatey)
choco install argocd-cli

# 验证
argocd version
```

## Argo CD 基础

### 登录 Argo CD

```bash
# 登录
argocd login localhost:8080

# 使用 CLI 时跳过 TLS 验证（仅用于本地测试）
argocd login localhost:8080 --insecure

# 更改初始密码
argocd account update-password
```

### 创建应用

**方式1：使用 CLI**

```bash
# 创建应用
argocd app create guestbook \
  --repo https://github.com/argoproj/argocd-example-apps.git \
  --path guestbook \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default

# 列出应用
argocd app list

# 获取应用详情
argocd app get guestbook
```

**方式2：使用 UI**

1. 登录 Argo CD UI (https://localhost:8080)
2. 点击 **+ New App**
3. 填写应用信息：
   - **App Name**: `my-app`
   - **Project**: `default`
   - **Sync Policy**: `Automatic` 或 `Manual`
4. 配置 **Source**:
   - **Repository URL**: Git 仓库地址
   - **Revision**: `HEAD` 或分支名
   - **Path**: 应用配置路径
5. 配置 **Destination**:
   - **Cluster URL**: 集群地址
   - **Namespace**: 目标命名空间
6. 点击 **Create**

### 应用同步

```bash
# 手动同步
argocd app sync guestbook

# 同步特定资源
argocd app sync guestbook --resource manifests/deployment.yaml

# 同步选项
argocd app sync guestbook --dry-run  # 预览变更
argocd app sync guestbook --prune    # 删除孤立的资源

# 自动同步
argocd app set guestbook --sync-policy automated
argocd app set guestbook --auto-sync-prune  # 自动删除孤立资源
argocd app set guestbook --self-heal        # 自动修复偏差

# 取消自动同步
argocd app unset guestbook --sync-policy
```

### 回滚应用

```bash
# 查看历史
argocd app history guestbook

# 回滚到指定版本
argocd app rollback guestbook <revision>

# 使用 UI 回滚
# App Details -> App History -> 选择版本 -> Rollback
```

## 应用配置

### 应用定义文件

**application.yaml**：
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  # 项目
  project: default

  # 源配置
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    targetRevision: HEAD
    path: guestbook
    # Helm 特定配置
    helm:
      valueFiles:
        - values-prod.yaml
    # Kustomize 特定配置
    kustomize:
      images:
        - name: myapp
          newTag: v1.0.0

  # 目标配置
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook

  # 同步策略
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m

  # 忽略差异
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas
```

### 项目定义

**project.yaml**：
```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: my-project
  namespace: argocd
spec:
  # 描述
  description: My Project

  # 源仓库
  sourceRepos:
    - '*'
    # 或指定仓库
    # - https://github.com/myorg/*

  # 目标集群和命名空间
  destinations:
    - namespace: '*'
      server: https://kubernetes.default.svc
    # 允许所有集群
    # - namespace: '*'
    #   server: '*'

  # 拒绝的命名空间
  clusterResourceWhitelist:
    - group: '*'
      kind: '*'

  # 允许的命名空间资源
  namespaceResourceWhitelist:
    - group: 'apps'
      kind: 'Deployment'
    - group: 'apps'
      kind: 'StatefulSet'

  # 同步窗口
  syncWindows:
    - kind: allow
      schedule: '10 1 * * *'
      duration: 1h
      applications:
        - '*'
      manualSync: true

  # 角色
  roles:
    - name: admin
      description: Admin privileges
      policies:
        - p, proj:my-project:admin, *, *, */*, allow
      groups:
        - my-org:admins
```

## 实战案例

### 案例1：部署 Nginx 应用

**1. 创建应用仓库**

```bash
# 创建 Git 仓库
mkdir my-app && cd my-app
git init

# 创建部署文件
mkdir -p manifests
```

**2. 创建 Kubernetes 清单**

**manifests/deployment.yaml**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
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
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
```

**manifests/service.yaml**：
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

**3. 推送到 Git**

```bash
git add .
git commit -m "Add nginx application"
git push origin main
```

**4. 创建 Argo CD 应用**

```bash
argocd app create nginx-app \
  --repo https://github.com/yourorg/my-app.git \
  --path manifests \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default \
  --sync-policy automated \
  --auto-prune \
  --self-heal
```

### 案例2：使用 Helm 部署应用

**1. 使用 Helm Chart**

```bash
argocd app create guestbook-helm \
  --repo https://github.com/argoproj/argocd-example-apps.git \
  --path guestbook/helm-guestbook \
  --helm-set image.tag=0.1 \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default
```

**2. 自定义 values**

```bash
argocd app set guestbook-helm \
  --helm-set image.repository=nginx \
  --helm-set image.tag=1.25 \
  --helm-set replicaCount=5
```

**3. 使用 values 文件**

创建 `values-prod.yaml`：
```yaml
replicaCount: 3

image:
  repository: nginx
  tag: "1.25"
  pullPolicy: IfNotPresent

service:
  type: LoadBalancer
  port: 80

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

### 案例3：使用 Kustomize

**Kubernetes 基础清单** (base/deployment.yaml)：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: my-app:latest
```

**Kustomization** (base/kustomization.yaml)：
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- deployment.yaml
- service.yaml
```

**生产覆盖** (overlays/production/kustomization.yaml)：
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: production
commonLabels:
  env: production
images:
- name: my-app
  newTag: v1.0.0
resources:
- ../../base
patchesStrategicMerge:
- deployment-patch.yaml
```

**创建 Argo CD 应用**：
```bash
argocd app create my-app-prod \
  --repo https://github.com/yourorg/my-app.git \
  --path overlays/production \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace production \
  --sync-policy automated
```

## 高级特性

### 多集群管理

**添加集群**：

```bash
# 添加集群到 Argo CD
argocd cluster add my-context-name

# 列出集群
argocd cluster list

# 获取集群详情
argocd cluster get <cluster-name>

# 删除集群
argocd cluster rm <cluster-name>
```

**跨集群部署应用**：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: multi-cluster-app
spec:
  source:
    repoURL: https://github.com/yourorg/app.git
    path: manifests
  destinations:
    - server: https://kubernetes.default.svc
      namespace: prod-us-east
    - server: https://kubernetes.default.svc
      namespace: prod-us-west
```

### ApplicationSet

ApplicationSet 可以批量创建应用。

**列表生成器**：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: cluster-apps
spec:
  generators:
  - list:
      elements:
      - cluster: engineering
        url: https://kubernetes.default.svc
      - cluster: production
        url: https://kubernetes.default.svc
  template:
    metadata:
      name: '{{cluster}}-guestbook'
    spec:
      project: default
      source:
        repoURL: https://github.com/argoproj/argocd-example-apps.git
        targetRevision: HEAD
        path: guestbook
      destination:
        server: '{{url}}'
        namespace: guestbook
```

**Git 目录生成器**：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: git-directory
spec:
  generators:
  - git:
      repoURL: https://github.com/argoproj/argocd-example-apps.git
      revision: HEAD
      directories:
      - path: apps/*
  template:
    metadata:
      name: '{{path.basename}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/argoproj/argocd-example-apps.git
        targetRevision: HEAD
        path: '{{path}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: default
```

### 私有仓库

**SSH 认证**：

```bash
# 创建 SSH secret
argocd repo add git@github.com:argoproj/argocd-example-apps.git \
  --ssh-private-key-path ~/.ssh/id_rsa
```

**Token 认证**：

```bash
# HTTPS with Token
argocd repo add https://github.com/argoproj/argocd-example-apps.git \
  --username argoproj \
  --password <github-token>
```

**GitLab 私有仓库**：

```bash
argocd repo add https://gitlab.com/myorg/myrepo.git \
  --username gitlab \
  --password <gitlab-token>
```

### Secret 管理

**使用 Sealed Secrets**：

1. 安装 Sealed Secrets：
```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
```

2. 创建 Sealed Secret：
```bash
# 创建 secret
kubectl create secret generic my-secret --dry-run=client --from-literal=password=pass123 -o yaml > secret.yaml

# 封装 secret
kubeseal -f secret.yaml -w sealed-secret.yaml

# 提交到 Git
git add sealed-secret.yaml
git commit -m "Add sealed secret"
```

**使用 AWS Secrets Manager**：

```bash
# 安装 Argo CD Secrets Manager Plugin
kubectl apply -f https://raw.githubusercontent.com/argoproj-labs/argocd-vault-plugin/main/manifests/install.yaml
```

## 最佳实践

### GitOps 工作流

```
1. 开发人员创建分支
   git checkout -b feature/new-feature

2. 修改代码并提交
   git add .
   git commit -m "Add new feature"

3. 推送到远程
   git push origin feature/new-feature

4. 创建 Pull Request
   # 通过 GitHub/GitLab 创建 PR

5. Code Review
   # 团队成员审查代码

6. 合并到主分支
   git checkout main
   git merge feature/new-feature
   git push origin main

7. CI 构建镜像
   # GitHub Actions / GitLab CI 构建并推送镜像

8. 更新 GitOps 仓库
   # 自动更新 GitOps 仓库中的镜像 tag

9. Argo CD 自动同步
   # Argo CD 检测到变更并自动部署
```

### 分支策略

**环境对应分支**：

| 环境 | 分支 | 说明 |
|------|------|------|
| 开发 | develop | 功能开发分支 |
| 测试 | staging | 预发布环境 |
| 生产 | main/main | 生产环境 |

### 目录结构

```
gitops-repo/
├── apps/
│   ├── app-a/
│   │   ├── base/
│   │   ├── overlays/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── prod/
│   ├── app-b/
│   │   └── ...
├── projects/
│   ├── team-a.yaml
│   └── team-b.yaml
├── clusters/
│   ├── dev-cluster/
│   ├── staging-cluster/
│   └── prod-cluster/
└── README.md
```

### 安全建议

1. **RBAC 配置**
   - 限制应用创建权限
   - 按项目分组
   - 审计日志

2. **Secret 管理**
   - 使用 Sealed Secrets
   - 集成 Vault
   - 避免明文存储

3. **网络隔离**
   - Argo CD API 私有化
   - 使用 Ingress + TLS
   - 限制 Pod 通信

## 常见问题

### 资源无法同步

```bash
# 检查同步状态
argocd app get <app-name>

# 查看事件
kubectl describe application <app-name> -n argocd

# 强制刷新
argocd app get <app-name> --refresh
```

### 镜像拉取失败

```bash
# 创建 image pull secret
kubectl create secret docker-registry regcred \
  --docker-server=<registry-url> \
  --docker-username=<username> \
  --docker-password=<password> \
  --docker-email=<email>

# 在应用中引用
# metadata.annotations:
#   avp.kubernetes.io/image-pull-secret: regcred
```

### 性能优化

```bash
# 限制同步并发
argocd applicationset set <name> --sync-policy-parallel-count 5

# 启用资源缓存
argocd app set <name> --sync-options ServerSideApply=true
```

## 学习建议

### 实践路径

1. **本地环境**：使用 Kind 或 Minikube
2. **简单应用**：部署静态网站
3. **复杂应用**：微服务架构
4. **多环境**：dev/staging/prod
5. **多集群**：跨集群部署

### 练习任务

- [ ] 安装 Argo CD 并部署示例应用
- [ ] 使用 GitOps 工作流部署应用
- [ ] 配置多环境部署
- [ ] 实现 Helm Chart 部署
- [ ] 配置 ApplicationSet 批量管理
- [ ] 集成 CI/CD 管道

## 总结

GitOps 和 Argo CD 代表了现代持续交付的最佳实践：

- **GitOps**: 以 Git 为单一事实来源
- **Argo CD**: 强大的 GitOps 引擎
- **自动化**: 从代码到生产的自动化流程
- **可追溯**: 完整的变更历史和审计

掌握 GitOps 将极大提升你的部署效率和系统可靠性！
