# 部署与运维

## 部署与运维

> **学习目标**：掌握Next.js应用的生产部署方案
> **核心内容**：Vercel部署、Docker部署、环境变量、生产优化

### 部署方案概览

#### 部署平台对比

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 部署方案                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Vercel（推荐）                                              │
│  ├─ 零配置部署                                               │
│  ├─ 自动HTTPS                                               │
│  ├─ 全球CDN                                                 │
│  ├─ 边缘网络                                                 │
│  └─ Serverless Functions                                    │
│                                                             │
│  Docker                                                     │
│  ├─ 容器化部署                                               │
│  ├─ 自定义服务器                                             │
│  ├─ 灵活的环境配置                                           │
│  └─ 可移植性强                                               │
│                                                             │
│  Cloudflare Workers                                         │
│  ├─ 边缘计算                                                 │
│  ├─ 极低延迟                                                 │
│  └─ 免费额度大                                               │
│                                                             │
│  自托管                                                      │
│  ├─ 完全控制                                                 │
│  ├─ 成本可控                                                 │
│  └─ 需要运维                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Vercel部署

#### 准备工作

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login
```

#### 环境变量配置

```bash
# .env.local（开发环境）
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# .env.production（生产环境）
DATABASE_URL="postgresql://user:password@prod-db:5432/mydb"
NEXTAUTH_URL="https://yourapp.com"
NEXTAUTH_SECRET="production-secret-key"
```

#### vercel.json配置

```json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["hkg1", "sin1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

#### 部署命令

```bash
# 开发环境预览
vercel

# 生产环境部署
vercel --prod

# 查看部署列表
vercel ls

# 查看部署详情
vercel inspect [deployment-url]

# 删除部署
vercel rm [deployment-url]
```

#### Vercel环境变量

```bash
# 通过CLI设置环境变量
vercel env add DATABASE_URL production

# 查看所有环境变量
vercel env ls

# 拉取环境变量到本地
vercel env pull .env.local

# 推送环境变量到远程
vercel env push .env.local
```

---

### Docker部署

#### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# 生产镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### next.config.ts配置

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone', // 启用standalone输出
}

export default nextConfig
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    container_name: nextjs-postgres
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: nextjs-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Next.js应用
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nextjs-app
    environment:
      - DATABASE_URL=postgresql://myuser:mypassword@postgres:5432/mydb
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=https://yourapp.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: nextjs-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream nextjs {
        server app:3000;
    }

    # 重定向HTTP到HTTPS
    server {
        listen 80;
        server_name yourapp.com www.yourapp.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS配置
    server {
        listen 443 ssl http2;
        server_name yourapp.com www.yourapp.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Gzip压缩
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript
                   application/x-javascript application/xml+rss
                   application/json application/javascript;

        location / {
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # 静态文件缓存
        location /_next/static {
            proxy_pass http://nextjs;
            proxy_cache_valid 200 365d;
            add_header Cache-Control "public, immutable";
        }

        location /static {
            proxy_pass http://nextjs;
            proxy_cache_valid 200 30d;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### 部署命令

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down

# 重启服务
docker-compose restart app
```

---

### 环境变量管理

#### 环境变量分类

```typescript
// .env.example
# ===== 数据库 =====
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
DIRECT_URL="postgresql://user:password@localhost:5432/mydb"

# ===== NextAuth =====
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# ===== OAuth =====
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# ===== 第三方服务 =====
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="my-bucket"

# ===== 邮件服务 =====
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# ===== API密钥 =====
OPENAI_API_KEY="sk-xxx"
ANTHROPIC_API_KEY="sk-ant-xxx"

# ===== 应用配置 =====
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

#### 运行时配置

```typescript
// next.config.ts
export default defineNextConfig({
  runtimeConfig: {
    // 私有配置（仅服务端）
    databaseUrl: process.env.DATABASE_URL,
    smtpHost: process.env.SMTP_HOST,

    // 公共配置（客户端可访问）
    public: {
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      gaId: process.env.NEXT_PUBLIC_GA_ID
    }
  }
})
```

```typescript
// 在组件中使用
'use client'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
const appUrl = config.public.appUrl
```

---

### 监控与日志

#### 错误追踪

```bash
# 安装Sentry
npm install @sentry/nextjs

# 配置Sentry
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

#### 性能监控

```typescript
// lib/analytics.ts
export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', name, properties)
  }

  // 自定义分析
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ name, properties })
  })
}

// 页面浏览
export function trackPageView(path: string) {
  trackEvent('page_view', { path })
}
```

---

### 实战案例：生产部署

#### 完整部署流程

```bash
# 1. 准备生产环境
cat > .env.production << EOF
DATABASE_URL="postgresql://user:password@prod-db:5432/mydb"
NEXTAUTH_URL="https://yourapp.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
EOF

# 2. 运行数据库迁移
npx prisma migrate deploy

# 3. 构建应用
npm run build

# 4. 启动应用（生产模式）
npm start

# 或使用PM2
pm2 start npm --name "nextjs-app" -- start
pm2 save
pm2 startup
```

#### CI/CD配置

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 本章小结

| 部署方式 | 优点 | 缺点 | 适用场景 |
|---------|------|------|----------|
| **Vercel** | 零配置、全球CDN | 有限制、成本较高 | 中小型应用 |
| **Docker** | 灵活、可移植 | 需要运维 | 企业应用 |
| **自托管** | 完全控制 | 运护成本高 | 大型应用 |

---

**下一步学习**：建议继续学习[Next.js最佳实践](./chapter-110)了解企业级开发规范。
