# 附录：DevOps工具速查手册

> **DevOps工具链完全指南（2024-2025最新版本）**
>
> 本附录提供：
> - Docker常用命令速查
> - Kubernetes命令速查
> - Terraform命令速查
> - Ansible命令速查
> - CI/CD工具命令
> - GitOps工具命令（NEW）

## 版本要求（2024-2025标准）

```yaml
# Docker & 容器化
Docker: >= 26.x (2024年最新稳定版)
Docker Compose: >= V2.27.0 (V2默认启用)

# Kubernetes
Kubernetes: >= 1.30+ (支持最新Pod Security Standards)
kubectl: >= 1.30+

# 基础设施即代码
Terraform: >= 1.9+
Ansible: >= 2.17+

# GitOps工具
ArgoCD: >= 2.10+
Flux CD: >= 2.3+
KubeVela: >= 1.9+

# CI/CD
GitHub Actions: 最新版
GitLab CI: >= 17.0
Jenkins: >= 2.450+
```

## 附录A：Docker命令速查（Docker 26.x + Compose V2）

### 🐳 镜像操作

| 命令 | 说明 | 频率 |
|------|------|------|
| `docker pull <image>` | 拉取镜像 | ⭐⭐⭐⭐⭐ |
| `docker images` | 列出镜像 | ⭐⭐⭐⭐⭐ |
| `docker rmi <image>` | 删除镜像 | ⭐⭐⭐⭐ |
| `docker tag <image> <new-tag>` | 标记镜像 | ⭐⭐⭐⭐ |
| `docker push <image>` | 推送镜像 | ⭐⭐⭐⭐⭐ |
| `docker build -t <name> .` | 构建镜像 | ⭐⭐⭐⭐⭐ |
| `docker history <image>` | 查看镜像历史 | ⭐⭐⭐ |
| `docker inspect <image>` | 查看镜像详情 | ⭐⭐⭐⭐ |

### 📦 容器操作

| 命令 | 说明 | 频率 |
|------|------|------|
| `docker run <image>` | 运行容器 | ⭐⭐⭐⭐⭐ |
| `docker ps` | 列出运行中容器 | ⭐⭐⭐⭐⭐ |
| `docker ps -a` | 列出所有容器 | ⭐⭐⭐⭐⭐ |
| `docker stop <container>` | 停止容器 | ⭐⭐⭐⭐⭐ |
| `docker start <container>` | 启动容器 | ⭐⭐⭐⭐⭐ |
| `docker restart <container>` | 重启容器 | ⭐⭐⭐⭐ |
| `docker rm <container>` | 删除容器 | ⭐⭐⭐⭐ |
| `docker logs <container>` | 查看日志 | ⭐⭐⭐⭐⭐ |
| `docker exec -it <container> sh` | 进入容器 | ⭐⭐⭐⭐⭐ |
| `docker cp <src> <dest>` | 复制文件 | ⭐⭐⭐⭐ |

### 🌐 网络操作

| 命令 | 说明 | 频率 |
|------|------|------|
| `docker network ls` | 列出网络 | ⭐⭐⭐⭐ |
| `docker network create <name>` | 创建网络 | ⭐⭐⭐⭐ |
| `docker network rm <name>` | 删除网络 | ⭐⭐⭐ |
| `docker network inspect <name>` | 查看网络详情 | ⭐⭐⭐⭐ |

### 💾 卷操作

| 命令 | 说明 | 频率 |
|------|------|------|
| `docker volume ls` | 列出卷 | ⭐⭐⭐⭐ |
| `docker volume create <name>` | 创建卷 | ⭐⭐⭐⭐ |
| `docker volume rm <name>` | 删除卷 | ⭐⭐⭐ |
| `docker volume inspect <name>` | 查看卷详情 | ⭐⭐⭐ |

### 🛠️ Docker Compose V2（注意：V2已无连字符）

> **重要变化**：Docker Compose V2 已集成到 Docker CLI 中，使用 `docker compose`（无连字符）

| 命令 | 说明 | 频率 |
|------|------|------|
| `docker compose up -d` | 后台启动服务 | ⭐⭐⭐⭐⭐ |
| `docker compose down` | 停止并删除服务 | ⭐⭐⭐⭐⭐ |
| `docker compose ps` | 列出服务 | ⭐⭐⭐⭐⭐ |
| `docker compose logs` | 查看日志 | ⭐⭐⭐⭐⭐ |
| `docker compose logs -f <service>` | 实时查看服务日志 | ⭐⭐⭐⭐⭐ |
| `docker compose exec <service> sh` | 进入服务容器 | ⭐⭐⭐⭐ |
| `docker compose restart` | 重启服务 | ⭐⭐⭐⭐ |
| `docker compose build` | 构建服务镜像 | ⭐⭐⭐⭐⭐ |
| `docker compose pull` | 拉取服务镜像 | ⭐⭐⭐⭐ |
| `docker compose top` | 查看运行进程 | ⭐⭐⭐ |

**V1 迁移到 V2 变化**：
```bash
# ❌ V1命令（已废弃）
docker-compose up -d

# ✅ V2命令（新标准）
docker compose up -d
```

---

## 附录B：Kubernetes命令速查

### ☸️ 集群管理

| 命令 | 说明 | 频率 |
|------|------|------|
| `kubectl cluster-info` | 查看集群信息 | ⭐⭐⭐⭐⭐ |
| `kubectl get nodes` | 列出节点 | ⭐⭐⭐⭐⭐ |
| `kubectl describe node <node>` | 查看节点详情 | ⭐⭐⭐⭐ |
| `kubectl top nodes` | 查看节点资源 | ⭐⭐⭐⭐ |
| `kubectl cordon <node>` | 标记节点不可调度 | ⭐⭐⭐ |
| `kubectl uncordon <node>` | 标记节点可调度 | ⭐⭐⭐ |
| `kubectl drain <node>` | 驱逐节点上Pod | ⭐⭐⭐⭐ |

### 📋 资源管理

| 命令 | 说明 | 频率 |
|------|------|------|
| `kubectl get all` | 列出所有资源 | ⭐⭐⭐⭐⭐ |
| `kubectl get pods` | 列出Pod | ⭐⭐⭐⭐⭐ |
| `kubectl get deployments` | 列出Deployment | ⭐⭐⭐⭐⭐ |
| `kubectl get services` | 列出Service | ⭐⭐⭐⭐⭐ |
| `kubectl get namespaces` | 列出命名空间 | ⭐⭐⭐⭐⭐ |
| `kubectl describe pod <pod>` | 查看Pod详情 | ⭐⭐⭐⭐⭐ |
| `kubectl logs <pod>` | 查看Pod日志 | ⭐⭐⭐⭐⭐ |
| `kubectl logs -f <pod>` | 实时查看日志 | ⭐⭐⭐⭐⭐ |

### 🚀 应用部署

| 命令 | 说明 | 频率 |
|------|------|------|
| `kubectl apply -f <yaml>` | 应用配置文件 | ⭐⭐⭐⭐⭐ |
| `kubectl create -f <yaml>` | 创建资源 | ⭐⭐⭐⭐ |
| `kubectl delete -f <yaml>` | 删除资源 | ⭐⭐⭐⭐ |
| `kubectl delete pod <pod>` | 删除Pod | ⭐⭐⭐⭐⭐ |
| `kubectl scale deployment <name> --replicas=<n>` | 扩缩容 | ⭐⭐⭐⭐⭐ |
| `kubectl rollout status deployment/<name>` | 查看部署状态 | ⭐⭐⭐⭐ |
| `kubectl rollout undo deployment/<name>` | 回滚部署 | ⭐⭐⭐⭐ |

### 🔧 配置管理

| 命令 | 说明 | 频率 |
|------|------|------|
| `kubectl get configmaps` | 列出ConfigMap | ⭐⭐⭐⭐ |
| `kubectl get secrets` | 列出Secret | ⭐⭐⭐⭐ |
| `kubectl create configmap <name> --from-literal=<key>=<value>` | 创建ConfigMap | ⭐⭐⭐⭐ |
| `kubectl create secret generic <name> --from-literal=<key>=<value>` | 创建Secret | ⭐⭐⭐⭐ |
| `ubectl edit configmap <name>` | 编辑ConfigMap | ⭐⭐⭐ |

### 📊 监控诊断

| 命令 | 说明 | 频率 |
|------|------|------|
| `kubectl top pods` | 查看Pod资源使用 | ⭐⭐⭐⭐⭐ |
| `kubectl exec -it <pod> -- sh` | 进入Pod | ⭐⭐⭐⭐⭐ |
| `kubectl port-forward <pod> <local-port>:<remote-port>` | 端口转发 | ⭐⭐⭐⭐ |
| `kubectl cp <local-file> <pod>:<remote-path>` | 复制文件到Pod | ⭐⭐⭐⭐ |
| `kubectl auth can-i <action> --as=<user>` | 检查权限 | ⭐⭐⭐ |

---

## 附录C：Terraform命令速查

### 🏗️ 基础命令

| 命令 | 说明 | 频率 |
|------|------|------|
| `terraform init` | 初始化工作目录 | ⭐⭐⭐⭐⭐ |
| `terraform plan` | 规划变更 | ⭐⭐⭐⭐⭐ |
| `terraform apply` | 应用变更 | ⭐⭐⭐⭐⭐ |
| `terraform destroy` | 销毁资源 | ⭐⭐⭐⭐ |
| `terraform validate` | 验证配置 | ⭐⭐⭐⭐ |
| `terraform fmt` | 格式化配置 | ⭐⭐⭐⭐ |

### 📦 状态管理

| 命令 | 说明 | 频率 |
|------|------|------|
| `terraform show` | 查看状态 | ⭐⭐⭐⭐⭐ |
| `terraform output` | 查看输出 | ⭐⭐⭐⭐ |
| `terraform refresh` | 刷新状态 | ⭐⭐⭐⭐ |
| `terraform state list` | 列出资源 | ⭐⭐⭐⭐ |
| `terraform state mv <old> <new>` | 移动资源 | ⭐⭐⭐ |
| `terraform state rm <address>` | 删除资源 | ⭐⭐⭐ |

### 🔧 高级操作

| 命令 | 说明 | 频率 |
|------|------|------|
| `terraform import <address> <id>` | 导入现有资源 | ⭐⭐⭐ |
| `terraform taint <address>` | 标记资源强制重建 | ⭐⭐⭐ |
| `terraform untaint <address>` | 取消标记 | ⭐⭐⭐ |
| `terraform workspace new <name>` | 创建工作空间 | ⭐⭐⭐⭐ |
| `terraform workspace select <name>` | 选择工作空间 | ⭐⭐⭐⭐ |
| `terraform graph` | 生成依赖图 | ⭐⭐⭐ |

---

## 附录D：Ansible命令速查

### 🎭 基础命令

| 命令 | 说明 | 频率 |
|------|------|------|
| `ansible <host> -m ping` | 测试连通性 | ⭐⭐⭐⭐⭐ |
| `ansible all -m shell -a "uptime"` | 执行命令 | ⭐⭐⭐⭐⭐ |
| `ansible-playbook <playbook.yml>` | 运行Playbook | ⭐⭐⭐⭐⭐ |
| `ansible-vault encrypt <file>` | 加密文件 | ⭐⭐⭐⭐ |
| `ansible-vault decrypt <file>` | 解密文件 | ⭐⭐⭐⭐ |
| `ansible-galaxy init <role>` | 初始化Role | ⭐⭐⭐⭐ |

### 📝 常用模块

| 模块 | 说明 | 频率 |
|------|------|------|
| `yum/apt` | 包管理 | ⭐⭐⭐⭐⭐ |
| `copy` | 复制文件 | ⭐⭐⭐⭐⭐ |
| `template` | 模板渲染 | ⭐⭐⭐⭐⭐ |
| `service/systemd` | 服务管理 | ⭐⭐⭐⭐⭐ |
| `file` | 文件管理 | ⭐⭐⭐⭐⭐ |
| `user/group` | 用户管理 | ⭐⭐⭐⭐ |
| `cron` | 定时任务 | ⭐⭐⭐ |
| `git` | Git仓库 | ⭐⭐⭐⭐ |

---

## 附录E：CI/CD工具命令

### 🚀 Jenkins

| 命令 | 说明 | 频率 |
|------|------|------|
| `jenkins-cli build <job>` | 触发构建 | ⭐⭐⭐⭐⭐ |
| `jenkins-cli list-jobs` | 列出所有Job | ⭐⭐⭐⭐ |
| `jenkins-cli job-info <job>` | 查看Job信息 | ⭐⭐⭐ |
| `jenkins-cli console <job> <build>` | 查看构建日志 | ⭐⭐⭐⭐ |

### 🔄 GitLab CI

| 命令 | 说明 | 频率 |
|------|------|------|
| `gitlab-runner register` | 注册Runner | ⭐⭐⭐⭐⭐ |
| `gitlab-runner run` | 启动Runner | ⭐⭐⭐⭐⭐ |
| `gitlab-runner verify` | 验证配置 | ⭐⭐⭐ |
| `gitlab-runner list` | 列出Runner | ⭐⭐⭐ |

### 🐙 GitHub Actions

| 命令 | 说明 | 频率 |
|------|------|------|
| `gh workflow list` | 列出工作流 | ⭐⭐⭐⭐ |
| `gh workflow run <workflow>` | 触发工作流 | ⭐⭐⭐⭐ |
| `gh run view` | 查看运行记录 | ⭐⭐⭐⭐ |
| `gh run watch` | 监控运行 | ⭐⭐⭐⭐ |

### 🚢 Argo CD

| 命令 | 说明 | 频率 |
|------|------|------|
| `argocd app list` | 列出应用 | ⭐⭐⭐⭐⭐ |
| `argocd app get <app>` | 查看应用状态 | ⭐⭐⭐⭐⭐ |
| `argocd app sync <app>` | 同步应用 | ⭐⭐⭐⭐⭐ |
| `argocd app create <app>` | 创建应用 | ⭐⭐⭐⭐ |
| `argocd app delete <app>` | 删除应用 | ⭐⭐⭐ |
| `argocd repo add <url>` | 添加仓库 | ⭐⭐⭐⭐ |

---

## 附录F：GitOps工具速查（2024-2025标准）

> **GitOps = 基础设施的声明式配置 + Git作为单一事实来源**

### 🚢 Argo CD（Kubernetes原生GitOps）

**安装与初始化**：
```bash
# 安装 Argo CD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 访问 UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# 初始密码（用户名：admin）
argocd admin initial-password | head -1
```

**应用管理**：
| 命令 | 说明 | 频率 |
|------|------|------|
| `argocd app list` | 列出应用 | ⭐⭐⭐⭐⭐ |
| `argocd app get <app>` | 查看应用状态 | ⭐⭐⭐⭐⭐ |
| `argocd app sync <app>` | 手动同步应用 | ⭐⭐⭐⭐⭐ |
| `argocd app create <app> --repo <url> --path <path>` | 创建应用 | ⭐⭐⭐⭐ |
| `argocd app delete <app>` | 删除应用 | ⭐⭐⭐ |
| `argocd app sync <app> --dry-run` | 预览同步（不执行） | ⭐⭐⭐⭐ |

**仓库管理**：
| 命令 | 说明 | 频率 |
|------|------|------|
| `argocd repo add <url> --type git` | 添加Git仓库 | ⭐⭐⭐⭐ |
| `argocd repo list` | 列出仓库 | ⭐⭐⭐⭐ |
| `argocd repo rm <url>` | 删除仓库 | ⭐⭐⭐ |

**集群管理**：
| 命令 | 说明 | 频率 |
|------|------|------|
| `argocd cluster add` | 添加集群 | ⭐⭐⭐⭐ |
| `argocd cluster list` | 列出集群 | ⭐⭐⭐⭐ |

### 🔄 Flux CD（CNCF孵化项目）

**安装与初始化**：
```bash
# 安装 Flux CLI
# macOS
brew install fluxcd/tap/flux

# Linux
curl -s https://fluxcd.io/install.sh | sudo bash

# 检查先决条件
flux check --pre

# 在集群上安装 Flux
flux install --namespace=flux-system --export
```

**源管理（Git Sources）**：
| 命令 | 说明 | 频率 |
|------|------|------|
| `flux create source git <name> --url <url> --branch <branch>` | 创建Git源 | ⭐⭐⭐⭐⭐ |
| `flux get sources git` | 列出Git源 | ⭐⭐⭐⭐⭐ |
| `flux suspend source git <name>` | 暂停源 | ⭐⭐⭐ |
| `flux resume source git <name>` | 恢复源 | ⭐⭐⭐ |

**Kustomization管理**：
| 命令 | 说明 | 频率 |
|------|------|------|
| `flux create kustomization <name> --source <source> --path <path>` | 创建Kustomization | ⭐⭐⭐⭐⭐ |
| `flux get kustomizations` | 列出Kustomization | ⭐⭐⭐⭐⭐ |
| `flux reconcile kustomization <name>` | 手动同步 | ⭐⭐⭐⭐ |

**HelmRelease管理**：
| 命令 | 说明 | 频率 |
|------|------|------|
| `flux create helmrelease <name> --source <source>` | 创建Helm发布 | ⭐⭐⭐⭐⭐ |
| `flux get helmreleases` | 列出Helm发布 | ⭐⭐⭐⭐⭐ |

### 🎯 KubeVela（应用交付平台）

**安装**：
```bash
# 安装 KubeVela CLI
# macOS
brew install kubevela

# Linux
curl -fsSl https://kubevela.net/script/install.sh | bash

# 在集群上安装 KubeVela
vela install
```

**应用管理**：
| 命令 | 说明 | 频率 |
|------|------|------|
| `vela up <app>` | 部署应用 | ⭐⭐⭐⭐⭐ |
| `vela ls` | 列出应用 | ⭐⭐⭐⭐⭐ |
| `vela status <app>` | 查看应用状态 | ⭐⭐⭐⭐⭐ |
| `vela delete <app>` | 删除应用 | ⭐⭐⭐ |

### 🔧 GitOps最佳实践

**声明式配置示例**：
```yaml
# Argo CD Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/infrastructure.git
    targetRevision: main
    path: apps/my-app
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

**GitOps工作流**：
```bash
# 1. 修改配置
git clone https://github.com/org/infrastructure.git
cd infrastructure
vim apps/my-app/deployment.yaml

# 2. 提交变更
git add .
git commit -m "feat: update my-app to v2.0"
git push origin main

# 3. 自动同步（Argo CD/Flux自动检测并应用）
# 或手动触发：
argocd app sync my-app

# 4. 验证状态
argocd app get my-app
```

---

## 附录G：监控和日志工具

### 📊 Prometheus

| 命令 | 说明 | 频率 |
|------|------|------|
| `promtool check config <config.yml>` | 检查配置 | ⭐⭐⭐⭐⭐ |
| `promtool query instant <query>` | 即时查询 | ⭐⭐⭐⭐ |
| `tsdb query` | 查询时序数据 | ⭐⭐⭐ |

### 📈 Grafana

| 命令 | 说明 | 频率 |
|------|------|------|
| `grafana-cli admin reset-admin-password` | 重置密码 | ⭐⭐⭐⭐ |
| `grafana-cli plugins install <plugin>` | 安装插件 | ⭐⭐⭐⭐ |
| `grafana-cli plugins ls` | 列出插件 | ⭐⭐⭐ |

### 🔍 ELK Stack

| 工具 | 命令 | 说明 | 频率 |
|------|------|------|------|
| **Elasticsearch** | `curl -X GET localhost:9200/_cluster/health` | 健康检查 | ⭐⭐⭐⭐⭐ |
| **Elasticsearch** | `curl -X GET localhost:9200/_cat/indices` | 列出索引 | ⭐⭐⭐⭐⭐ |
| **Kibana** | `kibana-setup --password` | 设置密码 | ⭐⭐⭐⭐ |
| **Logstash** | `logstash --config.test_and_exit` | 测试配置 | ⭐⭐⭐⭐ |

---

## 附录H：常用速查表

### 🐳 Dockerfile常用指令

```dockerfile
FROM python:3.11-slim           # 基础镜像
WORKDIR /app                     # 工作目录
COPY requirements.txt .          # 复制文件
RUN pip install -r requirements.txt  # 执行命令
EXPOSE 8080                      # 暴露端口
CMD ["python", "app.py"]         # 启动命令
```

### ☸️ Kubectl别名设置

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
alias k='kubectl'
alias kgp='kubectl get pods'
alias kgs='kubectl get services'
alias kd='kubectl describe'
alias klogs='kubectl logs'
alias kexec='kubectl exec -it'
```

### 🚀 Terraform变量传递

```bash
# 命令行变量
terraform apply -var="region=us-east-1"

# 变量文件
terraform apply -var-file="prod.tfvars"

# 环境变量
export TF_VAR_region=us-east-1
terraform apply
```

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
