# Docker 容器化

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

### Ubuntu 安装

```bash
# 更新包索引
sudo apt update

# 安装依赖
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# 添加 Docker 仓库
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# 安装 Docker
sudo apt update
sudo apt install docker-ce

# 验证安装
docker --version
```

### CentOS 安装

```bash
# 安装依赖
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install docker-ce docker-ce-cli containerd.io

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
``### Docker Desktop (Windows/Mac)

下载并安装：
- Windows: https://www.docker.com/products/docker-desktop
- Mac: https://www.docker.com/products/docker-desktop

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

### 基本结构

```dockerfile
# 基础镜像
FROM ubuntu:20.04

# 维护者信息
LABEL maintainer="devops@example.com"

# 设置工作目录
WORKDIR /app

# 复制文件
COPY . /app

# 安装依赖
RUN apt-get update && apt-get install -y python3

# 暴露端口
EXPOSE 80

# 设置环境变量
ENV NODE_ENV=production

# 运行命令
CMD ["python3", "app.py"]
```

### 常用指令

**FROM**
```dockerfile
FROM ubuntu:20.04
FROM node:16-alpine
```

**LABEL**
```dockerfile
LABEL version="1.0"
LABEL description="Web应用"
```

**RUN**
```dockerfile
RUN apt-get update
RUN apt-get install -y nginx
RUN ["apt-get", "install", "-y", "nginx"]
```

**CMD**
```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

**ENTRYPOINT**
```dockerfile
ENTRYPOINT ["python3"]
CMD ["app.py"]
```

**COPY**
```dockerfile
COPY . /app
COPY --from=builder /app/build /usr/share/nginx/html
```

**ADD**
```dockerfile
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
```

**EXPOSE**
```dockerfile
EXPOSE 80 443
```

**VOLUME**
```dockerfile
VOLUME ["/data"]
```

**ARG**
```dockerfile
ARG VERSION=1.0
ARG BASE_IMAGE=ubuntu:20.04
FROM ${BASE_IMAGE}
```

### 实战示例

**Node.js 应用**

```dockerfile
# 构建阶段
FROM node:16-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 运行阶段
FROM node:16-alpine

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/index.js"]
```

**Nginx 静态网站**

```dockerfile
FROM nginx:alpine

# 复制自定义配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制静态文件
COPY . /usr/share/nginx/html

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Python 应用**

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 5000

# 运行应用
CMD ["python", "app.py"]
```

## 构建镜像

### 基本构建

```bash
# 构建镜像
docker build -t myapp:1.0 .

# 指定 Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# 构建参数
docker build --build-arg VERSION=1.0 -t myapp .
```

### 多阶段构建

```dockerfile
# 构建阶段
FROM node:16 AS builder
WORKDIR /app
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### 构建优化

```dockerfile
# 利用缓存
FROM node:16
WORKDIR /app

# 先复制依赖文件，充分利用缓存
COPY package*.json ./
RUN npm install

# 再复制源代码
COPY . .

# 合并 RUN 指令
RUN apt-get update && \
    apt-get install -y python3 && \
    rm -rf /var/lib/apt/lists/*

# 使用 .dockerignore
# .dockerignore 文件：
node_modules
npm-debug.log
.git
.env
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
```

### 挂载目录

```bash
# 挂载主机目录
docker run -d -v /host/path:/container/path nginx

# 只读挂载
docker run -d -v /host/path:/container/path:ro nginx

# 匿名卷
docker run -d -v /container/path nginx
```

## 网络配置

### 网络模式

```bash
# 查看网络
docker network ls

# 创建网络
docker network create my-network

# 连接到网络
docker run -d --network my-network nginx

# 断开网络
docker network disconnect my-network my-nginx

# 删除网络
docker network rm my-network
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

**自定义网络**
```bash
# 创建网络
docker network create my-net

# 启动容器
docker run -d --name db --network my-net postgres
docker run -d --name web --network my-net nginx

# 容器间可以通过名称通信
```

## Docker Compose 简介

Docker Compose 用于定义和运行多容器应用。

### docker-compose.yml 示例

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgres://db:5432/mydb

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

### 基本命令

```bash
# 启动服务
docker-compose up

# 后台运行
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs

# 查看状态
docker-compose ps

# 重启服务
docker-compose restart

# 构建镜像
docker-compose build

# 执行命令
docker-compose exec web bash
```

## 最佳实践

### 镜像优化

1. **使用精简基础镜像**
   ```dockerfile
   FROM alpine:3.14
   FROM node:16-alpine
   ```

2. **多阶段构建**
   ```dockerfile
   FROM node:16 AS builder
   # ... 构建步骤

   FROM alpine:3.14
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

### 安全建议

1. **使用非 root 用户**
   ```dockerfile
   RUN adduser -D myuser
   USER myuser
   ```

2. **扫描镜像漏洞**
   ```bash
   docker scan myapp:1.0
   ```

3. **使用特定版本标签**
   ```dockerfile
   FROM node:16.14.0-alpine
   ```

4. **最小化权限**
   ```dockerfile
   COPY --chown=node:node . .
   ```

### 生产环境配置

1. **环境变量**
   ```dockerfile
   ENV NODE_ENV=production
   ```

2. **健康检查**
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s \
     CMD curl -f http://localhost/ || exit 1
   ```

3. **日志配置**
   ```dockerfile
   CMD ["nginx", "-g", "daemon off;"]
   ```

## 常见问题

### 清理资源

```bash
# 删除停止的容器
docker container prune

# 删除未使用的镜像
docker image prune

# 删除所有未使用的资源
docker system prune -a
```

### 查看磁盘使用

```bash
# 查看 Docker 占用空间
docker system df

# 详细信息
docker system df -v
```

## 实战项目

### 完整的 Web 应用

```dockerfile
# Dockerfile
FROM node:16-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

## 学习建议

### 实践建议

1. **从小项目开始**：先容器化简单的应用
2. **理解分层机制**：理解镜像分层，优化构建
3. **使用官方镜像**：基于官方镜像构建
4. **版本管理**：使用明确的版本标签
5. **持续集成**：在 CI/CD 中使用 Docker

### 练习任务

- [ ] 容器化一个 Node.js 应用
- [ ] 使用多阶段构建优化镜像大小
- [ ] 使用 Docker Compose 编排多个容器
- [ ] 配置数据持久化
- [ ] 设置自定义网络

## 总结

Docker 是现代应用部署的核心技术。通过本章学习，你应该掌握了：

- Docker 的基本概念和优势
- 镜像和容器的管理
- Dockerfile 的编写
- 数据卷和网络配置
- Docker Compose 的使用

下一章我们将学习 [Docker Compose 编排](chapter-06)，深入了解多容器应用的编排。
