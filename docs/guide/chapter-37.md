# 前端部署
## # 4.13 前端部署
## 前端部署

> **学习目标**：掌握前端项目部署与运维技术
> **核心内容**：Nginx配置、CDN加速、Docker部署、CI/CD

### 静态资源部署（Nginx）

#### Nginx 基础配置

```nginx
# /etc/nginx/sites-available/my-app

server {
    listen 80;
    server_name example.com www.example.com;

    # 网站根目录
    root /var/www/my-app/dist;
    index index.html;

    # 开启 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        font/truetype
        font/opentype
        application/vnd.ms-fontobject
        image/svg+xml;

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # HTML 文件不缓存
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Vue Router history 模式支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（可选）
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

#### HTTPS 配置

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # 其他配置同上...
    root /var/www/my-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 负载均衡配置

```nginx
# 上游服务器组
upstream backend_servers {
    # 负载均衡算法（默认是轮询）
    # least_conn; # 最少连接
    # ip_hash; # IP 哈希

    server backend1.example.com:3000 weight=3;
    server backend2.example.com:3000 weight=2;
    server backend3.example.com:3000 backup;

    # keepalive 连接
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    # SSL 配置...

    # 前端静态文件
    location / {
        root /var/www/my-app/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理到负载均衡组
    location /api/ {
        proxy_pass http://backend_servers;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### CDN 加速配置

#### 构建优化配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  build: {
    // 生产环境移除 console
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },

    // 分包策略
    rollupOptions: {
      output: {
        // 分块配置
        manualChunks: {
          // Vue 核心库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // Element Plus
          'element-plus': ['element-plus'],
          // 图表库
          'echarts': ['echarts']
        },
        // 文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },

    // chunk 大小警告限制
    chunkSizeWarningLimit: 1000
  }
})
```

#### 静态资源 CDN 配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // CDN 外部化
        external: ['vue', 'vue-router', 'pinia', 'element-plus'],
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'element-plus': 'ElementPlus'
        }
      }
    }
  }
})
```

```html
<!-- index.html - CDN 资源引入 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <!-- CDN 资源 -->
  <link rel="stylesheet" href="https://cdn.example.com/element-plus/index.css">
</head>
<body>
  <div id="app"></div>
  <!-- Vue CDN -->
  <script src="https://cdn.example.com/vue@3.3.4/dist/vue.global.prod.js"></script>
  <!-- Vue Router CDN -->
  <script src="https://cdn.example.com/vue-router@4.2.4/dist/vue-router.global.prod.js"></script>
  <!-- Pinia CDN -->
  <script src="https://cdn.example.com/pinia@2.1.3/dist/pinia.iife.prod.js"></script>
  <!-- Element Plus CDN -->
  <script src="https://cdn.example.com/element-plus/index.full.js"></script>
  <!-- 自定义构建文件 -->
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### Docker 容器化部署

#### Dockerfile 配置

```dockerfile
# Dockerfile

# 多阶段构建 - 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx 配置文件

```nginx
# nginx.conf

server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # 开启 gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Docker Compose 配置

```yaml
# docker-compose.yml

version: '3.8'

services:
  # 前端应用
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - app-network
    # 健康检查
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # 后端 API（如果需要）
  backend:
    image: my-backend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    restart: unless-stopped
    networks:
      - app-network
    depends_on:
      - db

  # 数据库（如果需要）
  db:
    image: postgres:15-alpine
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
```

#### 部署命令

```bash
# 构建镜像
docker build -t my-frontend:latest .

# 运行容器
docker run -d -p 80:80 --name my-app my-frontend:latest

# 使用 Docker Compose
docker-compose up -d

# 查看日志
docker logs -f my-app

# 进入容器
docker exec -it my-app sh

# 停止容器
docker stop my-app

# 删除容器
docker rm my-app
```

### CI/CD 自动化部署

#### GitHub Actions 配置

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # 检出代码
      - name: Checkout code
        uses: actions/checkout@v3

      # 设置 Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      # 安装依赖
      - name: Install dependencies
        run: npm ci

      # 运行测试
      - name: Run tests
        run: npm run test

      # 构建项目
      - name: Build project
        run: npm run build
        env:
          NODE_ENV: production

      # 上传构建产物
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

      # 登录 Docker Hub
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      # 构建 Docker 镜像
      - name: Build Docker image
        run: |
          docker build -t my-frontend:${{ github.sha }} .
          docker tag my-frontend:${{ github.sha }} my-frontend:latest

      # 推送镜像到 Docker Hub
      - name: Push Docker image
        run: |
          docker push my-frontend:${{ github.sha }}
          docker push my-frontend:latest

      # 部署到服务器
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/my-app
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

#### GitLab CI 配置

```yaml
# .gitlab-ci.yml

stages:
  - build
  - test
  - deploy

variables:
  NODE_ENV: production
  DOCKER_IMAGE: registry.gitlab.com/$CI_PROJECT_PATH
  DOCKER_TAG: $CI_COMMIT_SHORT_SHA

# 构建阶段
build:
  stage: build
  image: node:20-alpine
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

# 测试阶段
test:
  stage: test
  image: node:20-alpine
  dependencies:
    - build
  script:
    - npm ci
    - npm run test
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'

# 部署到测试环境
deploy:staging:
  stage: deploy
  image: docker:24
  services:
    - docker:24-dind
  only:
    - develop
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $DOCKER_IMAGE:$DOCKER_TAG .
    - docker push $DOCKER_IMAGE:$DOCKER_TAG
    - ssh $DEPLOY_USER@$DEPLOY_HOST "cd /var/www/my-app && docker-compose pull && docker-compose up -d"

# 部署到生产环境
deploy:production:
  stage: deploy
  image: docker:24
  services:
    - docker:24-dind
  only:
    - main
  when: manual
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $DOCKER_IMAGE:$DOCKER_TAG .
    - docker tag $DOCKER_IMAGE:$DOCKER_TAG $DOCKER_IMAGE:latest
    - docker push $DOCKER_IMAGE:$DOCKER_TAG
    - docker push $DOCKER_IMAGE:latest
    - ssh $DEPLOY_USER@$DEPLOY_HOST "cd /var/www/my-app && docker-compose pull && docker-compose up -d"
```

#### Jenkins 配置

```groovy
// Jenkinsfile

pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        DOCKER_IMAGE = 'my-frontend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    def image = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    docker.withRegistry('https://registry.example.com', 'docker-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    ssh user@server << 'EOF'
                        cd /var/www/my-app
                        docker-compose pull
                        docker-compose up -d
                        docker system prune -f
                    EOF
                """
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
```

### 多环境部署策略

#### 环境变量配置

```bash
# .env.development
VITE_APP_TITLE=My App (Dev)
VITE_API_BASE_URL=http://localhost:3000
VITE_SENTRY_DSN=
VITE_ANALYTICS_ID=
```

```bash
# .env.staging
VITE_APP_TITLE=My App (Staging)
VITE_API_BASE_URL=https://staging-api.example.com
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_ANALYTICS_ID=UA-XXXXX-Y
```

```bash
# .env.production
VITE_APP_TITLE=My App
VITE_API_BASE_URL=https://api.example.com
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_ANALYTICS_ID=UA-XXXXX-Z
```

#### 构建脚本

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:prod": "vite build --mode production",
    "preview": "vite preview"
  }
}
```

### 零停机部署

#### 蓝绿部署

```bash
#!/bin/bash
# deploy-blue-green.sh

BLUE_PORT=8080
GREEN_PORT=8081
HEALTH_CHECK_URL="http://localhost:$BLUE_PORT/health"

# 获取当前活跃端口
CURRENT_PORT=$(curl -s http://localhost/api/current-port || echo $BLUE_PORT)

# 确定目标端口
if [ "$CURRENT_PORT" = "$BLUE_PORT" ]; then
    TARGET_PORT=$GREEN_PORT
else
    TARGET_PORT=$BLUE_PORT
fi

echo "Deploying to port $TARGET_PORT..."

# 构建新版本
npm run build

# 启动新版本
docker run -d \
    --name my-app-$TARGET_PORT \
    -p $TARGET_PORT:80 \
    my-frontend:latest

# 健康检查
for i in {1..30}; do
    if curl -f http://localhost:$TARGET_PORT/; then
        echo "Health check passed!"
        break
    fi
    echo "Waiting for health check... ($i/30)"
    sleep 2
done

# 切换流量
curl -X PUT http://localhost/api/switch-port?port=$TARGET_PORT

# 停止旧版本
docker stop my-app-$CURRENT_PORT
docker rm my-app-$CURRENT_PORT

echo "Deployment complete!"
```

#### 滚动更新

```yaml
# docker-compose.yml (滚动更新配置)

version: '3.8'

services:
  frontend:
    image: my-frontend:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
        order: start-first
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    ports:
      - "80:80"
```

### 本章小结

| 部署方式 | 特点 | 适用场景 |
|----------|------|----------|
| Nginx | 简单、性能好 | 中小型项目 |
| Docker | 隔离、可移植 | 容器化环境 |
| Kubernetes | 弹性、高可用 | 大规模生产环境 |
| Serverless | 按需付费 | 低流量项目 |
| CDN | 加速、降本 | 静态资源分发 |

---
