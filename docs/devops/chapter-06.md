# Docker Compose 编排

## 什么是 Docker Compose

Docker Compose 是一个用于定义和运行多容器 Docker 应用的工具。通过 YAML 文件配置应用的服务，然后使用一个命令创建并启动所有服务。

### 为什么需要 Docker Compose

- **简化配置**：用 YAML 文件管理多容器应用
- **一键启动**：一条命令启动所有服务
- **服务编排**：定义服务间的关系和依赖
- **环境一致性**：确保开发、测试、生产环境一致

### Compose vs Docker

| 特性 | Docker | Docker Compose |
|------|--------|----------------|
| 容器管理 | 单个容器 | 多个容器 |
| 配置方式 | 命令行参数 | YAML 文件 |
| 网络配置 | 手动创建 | 自动创建 |
| 启动方式 | 多条命令 | 一条命令 |

## 安装 Docker Compose

### Linux 安装

```bash
# 下载 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version

# 或使用 Docker Desktop（自带 Compose）
```

### 基本使用

```bash
# 查看版本
docker-compose version

# 查看帮助
docker-compose --help
```

## docker-compose.yml 结构

### 基本格式

```yaml
version: '3.8'        # Compose 文件版本

services:             # 定义服务
  web:               # 服务名称
    image: nginx     # 使用镜像
    ports:           # 端口映射
      - "80:80"

volumes:             # 定义数据卷
  db-data:

networks:            # 定义网络
  frontend:
```

## 核心概念

### 服务 (Services)

服务是容器的抽象，定义容器如何运行。

```yaml
services:
  web:
    image: nginx:latest
    container_name: my-nginx
    restart: always
```

### 网络 (Networks)

服务间通信的网络。

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

### 数据卷 (Volumes)

持久化数据存储。

```yaml
volumes:
  db-data:
    driver: local
```

## 常用配置指令

### image

使用已有镜像：

```yaml
services:
  web:
    image: nginx:latest

  db:
    image: postgres:13-alpine
```

### build

从 Dockerfile 构建：

```yaml
services:
  web:
    build: .                    # 当前目录

  api:
    build:
      context: ./api            # 构建上下文
      dockerfile: Dockerfile.prod    # Dockerfile 名称
      args:                     # 构建参数
        VERSION: "1.0"
```

### ports

端口映射：

```yaml
services:
  web:
    image: nginx
    ports:
      - "80:80"                 # 主机端口:容器端口
      - "443:443"
      - "127.0.0.1:8080:80"     # 绑定到特定接口
```

### environment

环境变量：

```yaml
services:
  web:
    image: nginx
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://db:5432/mydb

  # 或使用数组
  db:
    image: postgres
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
```

### env_file

从文件读取环境变量：

```yaml
services:
  web:
    image: nginx
    env_file:
      - .env
      - .env.production
```

`.env` 文件：
```
NODE_ENV=production
DATABASE_URL=postgres://db:5432/mydb
```

### volumes

数据卷挂载：

```yaml
services:
  db:
    image: postgres
    volumes:
      - db-data:/var/lib/postgresql/data    # 命名卷
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql   # 文件挂载

  web:
    image: nginx
    volumes:
      - ./html:/usr/share/nginx/html:ro     # 只读挂载
      - ./conf/nginx.conf:/etc/nginx/nginx.conf:ro

volumes:
  db-data:
```

### depends_on

服务依赖：

```yaml
services:
  web:
    image: nginx
    depends_on:
      - api

  api:
    image: myapi
    depends_on:
      - db

  db:
    image: postgres
```

### networks

网络配置：

```yaml
services:
  web:
    image: nginx
    networks:
      - frontend

  api:
    image: myapi
    networks:
      - frontend
      - backend

  db:
    image: postgres
    networks:
      - backend

networks:
  frontend:
  backend:
```

### restart

重启策略：

```yaml
services:
  web:
    image: nginx
    restart: no                    # 不自动重启（默认）

  api:
    image: myapi
    restart: always               # 总是重启

  db:
    image: postgres
    restart: on-failure           # 失败时重启
    restart: unless-stopped       # 除非手动停止，否则总是重启
```

### command

覆盖默认命令：

```yaml
services:
  web:
    image: nginx
    command: ["nginx", "-g", "daemon off;"]

  api:
    image: node:16
    command: npm start
    working_dir: /app
```

### working_dir

工作目录：

```yaml
services:
  app:
    image: node:16
    working_dir: /app
    command: npm start
```

### user

指定用户：

```yaml
services:
  app:
    image: nginx
    user: "nginx:nginx"
```

### healthcheck

健康检查：

```yaml
services:
  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
```

## 完整示例

### Web 应用栈

```yaml
version: '3.8'

services:
  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: my-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static-files:/usr/share/nginx/html
    depends_on:
      - web
    networks:
      - frontend
    restart: unless-stopped

  # Web 应用
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: my-web
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://postgres:password@db:5432/mydb
      - REDIS_URL=redis://redis:6379
    volumes:
      - static-files:/app/dist
      - ./logs:/app/logs
    depends_on:
      - db
      - redis
    networks:
      - frontend
      - backend
    restart: unless-stopped

  # PostgreSQL 数据库
  db:
    image: postgres:13-alpine
    container_name: my-db
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - backend
    restart: unless-stopped

  # Redis 缓存
  redis:
    image: redis:6-alpine
    container_name: my-redis
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - backend
    restart: unless-stopped

volumes:
  db-data:
    driver: local
  redis-data:
    driver: local
  static-files:
    driver: local

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

## 常用命令

### 启动和停止

```bash
# 启动服务（前台运行）
docker-compose up

# 启动服务（后台运行）
docker-compose up -d

# 构建并启动
docker-compose up -d --build

# 启动指定服务
docker-compose up web db

# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、卷
docker-compose down -v

# 重启服务
docker-compose restart

# 重启指定服务
docker-compose restart web
```

### 查看信息

```bash
# 查看运行中的服务
docker-compose ps

# 查看服务日志
docker-compose logs

# 查看指定服务日志
docker-compose logs web

# 实时查看日志
docker-compose logs -f

# 查看最近100行日志
docker-compose logs --tail=100 web

# 查看服务详细信息
docker-compose config

# 验证配置文件
docker-compose config -q
```

### 构建和管理

```bash
# 构建镜像
docker-compose build

# 构建指定服务
docker-compose build web

# 强制重新构建
docker-compose build --no-cache

# 拉取镜像
docker-compose pull

# 拉取指定服务镜像
docker-compose pull web db

# 推送镜像
docker-compose push
```

### 执行命令

```bash
# 在运行的容器中执行命令
docker-compose exec web bash

# 运行一次性命令
docker-compose run web npm install

# 在新容器中运行命令
docker-compose run --rm web npm test

# 进入容器
docker-compose exec web /bin/sh
```

### 扩展服务

```bash
# 扩展服务到多个实例
docker-compose up -d --scale web=3

# 查看扩展后的服务
docker-compose ps
```

## 环境变量

### 变量替换

```yaml
version: '3.8'

services:
  web:
    image: nginx:${NGINX_VERSION:-latest}
    ports:
      - "${WEB_PORT:-80}:80"
    environment:
      - NODE_ENV=${NODE_ENV:-development}
```

`.env` 文件：
```
NGINX_VERSION=alpine
WEB_PORT=8080
NODE_ENV=production
```

### 命令行变量

```bash
# 传递环境变量
WEB_PORT=8080 docker-compose up

# 或使用 --env-file
docker-compose --env-file .env.prod up
```

## 多环境配置

### 多文件配置

```bash
# 基础配置
docker-compose.yml

# 开发环境覆盖
docker-compose.override.yml

# 生产环境
docker-compose.prod.yml
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=development
```

**docker-compose.prod.yml**
```yaml
version: '3.8'

services:
  web:
    environment:
      - NODE_ENV=production
    restart: always
```

使用：
```bash
# 开发环境（自动加载 override）
docker-compose up

# 生产环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 服务发现

### DNS 解析

```yaml
services:
  web:
    image: nginx
    depends_on:
      - api

  api:
    image: myapi
    depends_on:
      - db

  db:
    image: postgres
```

容器可以通过服务名访问：
- `http://api:3000`
- `postgres://db:5432/mydb`

### 健康检查和服务启动

```yaml
services:
  web:
    image: nginx
    depends_on:
      api:
        condition: service_healthy

  api:
    image: myapi
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
```

## 生产环境最佳实践

### 资源限制

```yaml
services:
  web:
    image: nginx
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 日志配置

```yaml
services:
  web:
    image: nginx
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 安全配置

```yaml
services:
  web:
    image: nginx
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
    user: "nginx:nginx"
```

## 实战项目

### 微服务架构

```yaml
version: '3.8'

services:
  # API 网关
  gateway:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./gateway/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - auth-service
      - user-service
      - order-service
    networks:
      - frontend

  # 认证服务
  auth-service:
    build: ./auth
    environment:
      - DATABASE_URL=postgres://postgres:pass@auth-db:5432/authdb
    depends_on:
      - auth-db
    networks:
      - backend

  auth-db:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: authdb
      POSTGRES_PASSWORD: pass
    volumes:
      - auth-data:/var/lib/postgresql/data
    networks:
      - backend

  # 用户服务
  user-service:
    build: ./user
    environment:
      - DATABASE_URL=postgres://postgres:pass@user-db:5432/userdb
    depends_on:
      - user-db
    networks:
      - backend

  user-db:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: userdb
      POSTGRES_PASSWORD: pass
    volumes:
      - user-data:/var/lib/postgresql/data
    networks:
      - backend

  # 订单服务
  order-service:
    build: ./order
    environment:
      - DATABASE_URL=postgres://postgres:pass@order-db:5432/orderdb
    depends_on:
      - order-db
    networks:
      - backend

  order-db:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: orderdb
      POSTGRES_PASSWORD: pass
    volumes:
      - order-data:/var/lib/postgresql/data
    networks:
      - backend

volumes:
  auth-data:
  user-data:
  order-data:

networks:
  frontend:
  backend:
```

### 监控栈

```yaml
version: '3.8'

services:
  # Prometheus
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    networks:
      - monitoring

  # Grafana
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - monitoring

  # Node Exporter
  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"
    networks:
      - monitoring

  # cAdvisor
  cadvisor:
    image: google/cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks:
      - monitoring

volumes:
  prometheus-data:
  grafana-data:

networks:
  monitoring:
```

## 故障排查

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs web

# 实时跟踪日志
docker-compose logs -f web

# 查看最近行
docker-compose logs --tail=50 web
```

### 调试命令

```bash
# 验证配置
docker-compose config

# 检查服务状态
docker-compose ps

# 进入容器调试
docker-compose exec web bash

# 查看容器资源使用
docker stats
```

## 学习建议

### 实践建议

1. **从简单开始**：先配置2-3个服务
2. **使用官方镜像**：基于可靠镜像构建
3. **环境分离**：为不同环境创建不同配置
4. **版本控制**：将配置文件纳入版本控制
5. **文档化**：记录配置说明和使用方法

### 练习任务

- [ ] 使用 Compose 编排 Web 应用和数据库
- [ ] 配置多环境（开发、生产）
- [ ] 实现服务间的负载均衡
- [ ] 配置日志收集和监控
- [ ] 设置数据持久化

## 总结

Docker Compose 是多容器应用编排的利器。通过本章学习，你应该掌握了：

- Compose 的基本概念和安装
- docker-compose.yml 的编写
- 常用配置指令的使用
- 多环境配置管理
- 生产环境最佳实践

下一章我们将学习 [Kubernetes 容器编排](chapter-07)，了解大规模容器集群管理。
