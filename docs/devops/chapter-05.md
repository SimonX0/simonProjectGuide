# Docker 容器化

## 2024-2026 更新

### Docker 26+ 主要更新

**Docker 26+ (2024-2026)的重要变化：**

- **BuildKit 默认启用**：Docker 26+ 默认使用 BuildKit 构建引擎，性能提升 3-5 倍
- **Compose V2 成为默认**：`docker-compose` 命令被 `docker compose` 替代
- **容器镜像签名验证**：默认启用内容寻址（Content Addressable）
- **多平台构建优化**：`docker buildx` 成为标准工具
- **Linux 内核要求**：最低要求内核 5.10+（eBPF 支持）

**版本建议：**
```bash
# 推荐版本 (2024-2026)
Docker: 26.1+           # 最新稳定版
Docker Compose: V2      # 已集成到 Docker CLI
BuildKit: 内置          # 默认启用
Containerd: 1.7+        # 容器运行时
```

## 什么是 Docker

Docker 是一个开源的容器化平台，可以将应用程序及其依赖打包到一个轻量级、可移植的容器中，确保应用在任何环境中都能以相同方式运行。

### 容器 vs 虚拟机

**虚拟机 (VM)**
```
应用 A
应用 B
├── Guest OS
├── Hypervisor
└── Host OS → 硬件
```

**容器**
```
应用 A (容器)
应用 B (容器)
├── Docker Engine
└── Host OS → 硬件
```

### 对比表

| 特性 | 容器 | 虚拟机 |
|------|------|--------|
| 启动速度 | 秒级 | 分钟级 |
| 资源占用 | MB 级 | GB 级 |
| 隔离性 | 进程级 | 系统级 |
| 可移植性 | 高 | 低 |
| 性能 | 接近原生 | 有损耗 |

### Docker 的优势

- **环境一致性**：开发、测试、生产环境完全一致
- **快速部署**：秒级启动应用
- **资源高效**：比虚拟机节省资源
- **可移植性**：一次构建，到处运行
- **微服务架构**：支持微服务部署
- **持续集成/部署**：与 CI/CD 工具完美集成

## Docker 核心概念

### 镜像 (Image)

镜像是一个只读的模板，包含运行应用所需的一切：

```bash
# 镜像分层
应用层
依赖层
基础OS层
内核层
```

### 容器 (Container)

容器是镜像的运行实例：

```bash
镜像 (类) → 容器 (对象)
```

### 仓库 (Registry)

仓库用于存储和分发镜像：

- **Docker Hub**：官方公共仓库
- **私有仓库**：企业内部仓库

## 安装 Docker

### Ubuntu 安装 (2024-2026)

```bash
# 更新包索引
sudo apt update

# 安装依赖
sudo apt install -y ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 添加 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker 26+
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 验证安装
docker --version
docker compose version
```

### CentOS/RHEL 9 安装 (2024-2026)

```bash
# 安装依赖
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker 26+
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker compose version
```

### Docker Desktop (Windows/Mac)

下载并安装：
- Windows: https://www.docker.com/products/docker-desktop
- Mac: https://www.docker.com/products/docker-desktop

**Docker Desktop 2024+ 特性：**
- 内置 Kubernetes 集群
- WSL 2 集成（Windows）
- Apple Silicon 优化（Mac M1/M2/M3）

### 免 sudo 使用

```bash
# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录或运行
newgrp docker

# 验证
docker ps
```

## Docker 基本命令

### 镜像操作

```bash
# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx:latest

# 查看本地镜像
docker images

# 删除镜像
docker rmi nginx:latest

# 删除所有镜像
docker rmi $(docker images -q)

# 2024+: 多平台构建
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:latest .
```

### 容器操作

```bash
# 运行容器
docker run nginx

# 后台运行
docker run -d nginx

# 指定端口映射
docker run -d -p 80:80 nginx

# 指定名称
docker run -d --name my-nginx nginx

# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 停止容器
docker stop my-nginx

# 启动容器
docker start my-nginx

# 重启容器
docker restart my-nginx

# 删除容器
docker rm my-nginx

# 强制删除运行中的容器
docker rm -f my-nginx
```

### 容器交互

```bash
# 查看容器日志
docker logs my-nginx

# 实时查看日志
docker logs -f my-nginx

# 进入容器
docker exec -it my-nginx /bin/bash

# 在容器中执行命令
docker exec my-nginx cat /etc/nginx/nginx.conf

# 查看容器详细信息
docker inspect my-nginx

# 查看容器资源使用
docker stats
```

### 文件操作

```bash
# 从容器复制文件到主机
docker cp my-nginx:/etc/nginx/nginx.conf ./nginx.conf

# 从主机复制文件到容器
docker cp ./nginx.conf my-nginx:/etc/nginx/nginx.conf
```

## Dockerfile

### 什么是 Dockerfile

Dockerfile 是一个文本文件，包含构建 Docker 镜像的所有指令。

### 基本结构 (2024-2026 优化版)

```dockerfile
# 基础镜像
FROM ubuntu:22.04

# 维护者信息
LABEL maintainer="devops@example.com"

# 设置工作目录
WORKDIR /app

# 复制文件
COPY . /app

# 安装依赖 (合并指令以减少层数)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 暴露端口
EXPOSE 80

# 设置环境变量
ENV NODE_ENV=production \
    PYTHONUNBUFFERED=1

# 运行命令
CMD ["python3", "app.py"]
```

### 常用指令

**FROM**
```dockerfile
FROM ubuntu:22.04
FROM node:20-alpine
FROM --platform=linux/amd64 ubuntu:22.04  # 2024+: 多平台支持
```

**LABEL**
```dockerfile
LABEL version="1.0"
LABEL description="Web应用"
LABEL org.opencontainers.image.source="https://github.com/user/repo"
```

**RUN**
```dockerfile
# Shell 形式
RUN apt-get update && apt-get install -y nginx

# Exec 形式
RUN ["apt-get", "install", "-y", "nginx"]

# 2024+ 最佳实践：合并 RUN 指令
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        nginx \
    && rm -rf /var/lib/apt/lists/*
```

**CMD vs ENTRYPOINT**

```dockerfile
# CMD - 可被覆盖
CMD ["nginx", "-g", "daemon off;"]

# ENTRYPOINT - 不可被覆盖
ENTRYPOINT ["python3"]

# CMD 提供默认参数
CMD ["app.py"]

# 组合使用
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["nginx"]
```

**COPY vs ADD**

```dockerfile
# COPY - 推荐使用
COPY . /app
COPY --from=builder /app/build /usr/share/nginx/html
COPY --chown=node:node . .

# ADD - 仅用于远程 URL 或自动解压
ADD app.tar.gz /app/
ADD https://example.com/file.txt /app/
```

**WORKDIR**
```dockerfile
WORKDIR /app
```

**ENV**
```dockerfile
ENV NODE_ENV=production
ENV PATH="/app/bin:${PATH}"
ENV DEBIAN_FRONTEND=noninteractive
```

**EXPOSE**
```dockerfile
EXPOSE 80 443
EXPOSE 8080/tcp
EXPOSE 53/udp
```

**VOLUME**
```dockerfile
VOLUME ["/data"]
VOLUME ["/var/log/app", "/var/db"]
```

**ARG**
```dockerfile
ARG VERSION=1.0
ARG BASE_IMAGE=ubuntu:22.04
FROM ${BASE_IMAGE}

# 构建时参数
ARG BUILD_DATE
ARG VCS_REF
LABEL org.opencontainers.image.created=${BUILD_DATE}
```

### 实战示例 (2024-2026 版本)

**Node.js 20 应用**

```dockerfile
# syntax=docker/dockerfile:1.7  # 2024+: 使用新版语法
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖 (使用 ci 而非 install)
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 运行阶段
FROM node:20-alpine

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/index.js"]
```

**Nginx 静态网站**

```dockerfile
FROM nginx:1.25-alpine

# 复制自定义配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制静态文件
COPY --chown=nginx:nginx . /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

**Python 3.12 应用**

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建非 root 用户
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:5000/health || exit 1

# 运行应用
CMD ["python", "app.py"]
```

## 构建镜像 (2024-2026 版本)

### 使用 BuildKit 构建

**BuildKit 是 Docker 26+ 的默认构建引擎：**

```bash
# BuildKit 默认启用
export DOCKER_BUILDKIT=1  # Docker 26+ 已默认启用

# 基本构建
docker build -t myapp:1.0 .

# 指定 Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# 构建参数
docker build --build-arg VERSION=1.0 -t myapp .

# 2024+: 多平台构建
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:multi .

# 2024+: 并行构建
docker buildx build --platform linux/amd64,linux/arm64 --parallel .

# 2024+: 导出镜像
docker buildx build --output type=registry,ref=registry.example.com/myapp:latest .
docker buildx build --output type=tar,dest=myapp.tar .

# 2024+: 构建缓存
docker buildx build --cache-from=type=registry,ref=myapp:buildcache \
  --cache-to=type=registry,ref=myapp:buildcache,mode=max \
  -t myapp:latest .
```

### Dockerfile 优化 (2024-2026)

**1. 使用 .dockerignore**

```dockerignore
# .dockerignore 文件
node_modules
npm-debug.log
.git
.gitignore
.env
Dockerfile
README.md
*.md
coverage
.vscode
.idea
```

**2. 多阶段构建**

```dockerfile
# 构建阶段
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

**3. 利用构建缓存**

```dockerfile
# 先复制依赖文件，充分利用缓存
COPY package*.json ./
RUN npm ci

# 再复制源代码
COPY . .

# 合并 RUN 指令
RUN apt-get update && \
    apt-get install -y python3 && \
    rm -rf /var/lib/apt/lists/*
```

**4. 使用 BuildKit 特性**

```dockerfile
# syntax=docker/dockerfile:1.7

# 使用缓存挂载
RUN --mount=type=cache,target=/root/.cache npm install

# 使用共享缓存挂载
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y gcc

# 使用密钥挂载
RUN --mount=type=secret,id=github_token \
    GIT_ASKPASS=./askpass.sh git clone https://github.com/private/repo.git

# 使用 SSH 挂载
RUN --mount=type=ssh \
    ssh git@github.com:private/repo.git
```

## Docker Compose V2 (2024-2026)

### Compose V2 vs V1

**重要变化：**
- `docker-compose` (V1) → `docker compose` (V2)
- V2 已集成到 Docker CLI 中
- V2 支持更多新特性
- V2 性能更好

### docker-compose.yml 示例 (2024-2026)

```yaml
# Compose 文件版本 (V2 不再需要 version 字段)
# V2 使用最新的 Compose 规范

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      - DATABASE_URL=postgres://db:5432/mydb
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env.production
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    networks:
      - frontend
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    restart: always

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # 内部网络，无法访问外网

volumes:
  db-data:
    driver: local
  redis-data:
    driver: local

secrets:
  db_password:
    file: ./secrets/db_password.txt

# 2024+: 配置扩展
x-app-common: &app-common
  environment:
    - NODE_ENV=production
    - LOG_LEVEL=info
  networks:
    - backend

services:
  api:
    <<: *app-common
    image: myapp/api:latest
```

### Docker Compose 命令 (V2)

```bash
# 2024+: 使用 docker compose (V2)
docker compose up
docker compose up -d
docker compose down
docker compose down -v  # 删除卷
docker compose ps
docker compose logs
docker compose logs -f web
docker compose logs --tail=100 web
docker compose restart
docker compose restart web
docker compose stop
docker compose stop web
docker compose start
docker compose start web

# 构建镜像
docker compose build
docker compose build --no-cache
docker compose build web

# 查看状态
docker compose ps
docker compose top
docker compose stats

# 执行命令
docker compose exec web bash
docker compose exec web python manage.py migrate

# 查看日志
docker compose logs --follow
docker compose logs --tail=50 web

# 扩缩容
docker compose up -d --scale web=5

# 2024+: Docker Compose Watch (开发热重载)
docker compose watch

# 2024+: Compose 配置验证
docker compose config
docker compose config --resolve-image-digests

# 2024+: 复制文件
docker compose cp web:/app/config.yaml ./

# 2024+: 创建并运行
docker compose up --build --force-recreate

# 2024+: 健康检查
docker compose ps --format "table {{.Name}}\t{{.Health}}"
```

### Compose 最佳实践 (2024-2026)

**1. 使用环境变量**

```yaml
# docker-compose.yml
services:
  web:
    image: ${WEB_IMAGE:-nginx:latest}
    ports:
      - "${WEB_PORT:-80}:80"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - API_KEY=${API_KEY}
```

```bash
# .env 文件
WEB_IMAGE=nginx:1.25
WEB_PORT=8080
DATABASE_URL=postgres://user:pass@db:5432/mydb
```

**2. 使用覆盖文件**

```bash
# 开发环境
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# 生产环境
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

```yaml
# docker-compose.prod.yml
services:
  web:
    replicas: 5
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
```

**3. 健康检查**

```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
    depends_on:
      db:
        condition: service_healthy
```

**4. 日志配置**

```yaml
services:
  web:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 数据管理

### 数据卷 (Volume)

```bash
# 创建数据卷
docker volume create my-data

# 查看数据卷
docker volume ls
docker volume inspect my-data

# 使用数据卷
docker run -d -v my-data:/app/data nginx

# 删除数据卷
docker volume rm my-data

# 删除所有未使用的数据卷
docker volume prune

# 2024+: 卷驱动插件
docker volume create --driver local \
  --opt type=tmpfs \
  --opt device=tmpfs \
  --opt o=size=100m,uid=1000 \
  my-tmpfs-volume
```

### 挂载目录

```bash
# 挂载主机目录
docker run -d -v /host/path:/container/path nginx

# 只读挂载
docker run -d -v /host/path:/container/path:ro nginx

# 匿名卷
docker run -d -v /container/path nginx

# 2024+: 绑定传播
docker run -d -v /host/path:/container/path:rshared nginx
```

## 网络配置

### 网络模式 (2024-2026)

```bash
# 查看网络
docker network ls

# 创建网络
docker network create my-network

# 2024+: 创建覆盖网络（Swarm）
docker network create --driver overlay my-overlay-network

# 2024+: 创建 IPv6 网络
docker network create --ipv6 --subnet=2001:db8::/64 my-ipv6-network

# 连接到网络
docker run -d --network my-network nginx

# 断开网络
docker network disconnect my-network my-nginx

# 删除网络
docker network rm my-network

# 2024+: 网络检查
docker network inspect my-network
```

### 网络类型

**bridge（默认）**
```bash
docker run -d --name web -p 80:80 nginx
```

**host**
```bash
docker run -d --network host nginx
```

**none**
```bash
docker run -d --network none nginx
```

**container**
```bash
docker run -d --name db postgres
docker run -d --network container:db nginx
```

**自定义网络**
```bash
# 创建网络
docker network create my-net

# 启动容器
docker run -d --name db --network my-net postgres
docker run -d --name web --network my-net nginx

# 容器间可以通过名称通信
```

**2024+: Macvlan 网络**

```bash
# 创建 Macvlan 网络（直接连接物理网络）
docker network create -d macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=eth0 my-macvlan-net

# 使用 Macvlan 网络
docker run -d --network my-macvlan-net --ip 192.168.1.100 nginx
```

## 最佳实践 (2024-2026)

### 镜像优化

1. **使用精简基础镜像**
   ```dockerfile
   FROM alpine:3.19
   FROM ubuntu:22.04
   FROM debian:bookworm-slim
   FROM node:20-alpine
   FROM python:3.12-slim
   ```

2. **多阶段构建**
   ```dockerfile
   FROM node:20 AS builder
   # ... 构建步骤

   FROM alpine:3.19
   COPY --from=builder /app/dist /app
   ```

3. **合并指令**
   ```dockerfile
   RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*
   ```

4. **利用构建缓存**
   ```dockerfile
   COPY package*.json ./
   RUN npm install
   COPY . .
   ```

5. **使用 .dockerignore**
   ```dockerignore
   node_modules
   npm-debug.log
   .git
   .env
   ```

6. **扫描镜像漏洞**
   ```bash
   # 2024+: 使用 Docker Scout
   docker scout cves nginx:latest
   docker scout quickview nginx:latest
   docker scout compare nginx:1.24 nginx:1.25
   ```

### 安全建议

1. **使用非 root 用户**
   ```dockerfile
   RUN addgroup -g 1001 -S myuser && \
       adduser -S myuser -u 1001
   USER myuser
   ```

2. **使用特定版本标签**
   ```dockerfile
   FROM node:20.11.0-alpine
   FROM nginx:1.25.3-alpine
   ```

3. **最小化权限**
   ```dockerfile
   COPY --chown=myuser:myuser . .
   ```

4. **只读根文件系统**
   ```yaml
   services:
     web:
       read_only: true
       tmpfs:
         - /tmp
   ```

5. **使用 Docker 内容信任**
   ```bash
   export DOCKER_CONTENT_TRUST=1
   docker pull nginx@sha256:abc123...
   ```

6. **使用 secrets 管理敏感数据**
   ```yaml
   services:
     web:
       secrets:
         - api_key
   secrets:
     api_key:
       external: true
   ```

### 生产环境配置

1. **环境变量**
   ```dockerfile
   ENV NODE_ENV=production
   ENV DEBIAN_FRONTEND=noninteractive
   ```

2. **健康检查**
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD curl -f http://localhost/health || exit 1
   ```

3. **资源限制**
   ```yaml
   services:
     web:
       deploy:
         resources:
           limits:
             cpus: '0.50'
             memory: 512M
           reservations:
             cpus: '0.25'
             memory: 256M
   ```

4. **日志配置**
   ```yaml
   services:
     web:
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"
   ```

5. **重启策略**
   ```yaml
   services:
     web:
       restart: unless-stopped
   ```

## 常见问题

### 清理资源 (2024-2026)

```bash
# 删除停止的容器
docker container prune

# 删除未使用的镜像
docker image prune -a

# 删除所有未使用的资源
docker system prune -a --volumes

# 2024+: 详细的清理选项
docker system prune --filter "until=24h"
docker image prune --all --filter "until=72h"

# 查看磁盘使用
docker system df
docker system df -v

# 2024+: Docker Scout 安全扫描
docker scout cves local-image:tag
```

### 性能优化

```bash
# 使用 BuildKit 加速构建
export DOCKER_BUILDKIT=1

# 使用构建缓存
docker build --cache-from=myapp:latest .

# 并行构建
docker buildx build --platform linux/amd64,linux/arm64 --parallel .

# 使用层缓存
RUN --mount=type=cache,target=/var/cache/apt apt-get update
```

## 实战项目

### 完整的 Web 应用 (2024-2026)

```dockerfile
# Dockerfile
# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml (V2)
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    restart: unless-stopped
```

## 学习建议

### 实践建议

1. **从小项目开始**：先容器化简单的应用
2. **理解分层机制**：理解镜像分层，优化构建
3. **使用官方镜像**：基于官方镜像构建
4. **版本管理**：使用明确的版本标签
5. **持续集成**：在 CI/CD 中使用 Docker
6. **安全扫描**：定期扫描镜像漏洞
7. **多平台构建**：支持多种架构

### 练习任务 (2024-2026)

- [ ] 容器化一个 Node.js 应用
- [ ] 使用多阶段构建优化镜像大小
- [ ] 使用 Docker Compose V2 编排多个容器
- [ ] 配置数据持久化
- [ ] 设置自定义网络
- [ ] 配置健康检查
- [ ] 实现多平台构建
- [ ] 使用 Docker Scout 扫描镜像
- [ ] 配置日志管理
- [ ] 实现自动化部署

## 总结

Docker 是现代应用部署的核心技术。通过本章学习，你应该掌握了：

- Docker 26+ 的新特性和变化
- 镜像和容器的管理
- Dockerfile 的编写和优化
- Docker Compose V2 的使用
- 数据卷和网络配置
- BuildKit 和多平台构建
- 安全最佳实践

下一章我们将学习 [Docker Compose 编排](chapter-06)，深入了解多容器应用的编排。
