---
title: Nuxt 3+ 完全实战项目
description: 从零构建一个完整的 Nuxt 3+ 全栈应用
---

# ：Nuxt 完全实战项目 - 全栈电商后台管理系统

> **项目概述**：本项目是一个功能完整的全栈电商后台管理系统，涵盖 Nuxt 3+、Nuxt 4、TypeScript、Pinia、Prisma、PostgreSQL 等技术栈的实际应用。
>
> **学习目标**：
> - 掌握 Nuxt 3+ 全栈项目的完整开发流程
> - 熟练使用 Nuxt 4 最新特性
> - 掌握 SSR、SSG、ISR 等渲染模式
> - 学会数据库集成、API开发、认证授权等全栈技能

---

## 项目介绍

### 项目背景

本电商后台管理系统是一个典型的全栈应用，包含以下核心功能：

- ✅ **商品管理**：商品的增删改查、库存管理、上下架
- ✅ **订单管理**：订单列表、订单详情、订单状态更新
- ✅ **用户管理**：用户列表、权限管理、角色分配
- ✅ **数据统计**：销售统计、图表展示、数据导出
- ✅ **系统设置**：系统配置、日志管理、备份恢复

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **框架** | Nuxt | 4.x |
| **语言** | TypeScript | 5.x |
| **数据库** | PostgreSQL | 16.x |
| **ORM** | Prisma | 5.x |
| **认证** | Nuxt Auth | latest |
| **UI库** | Nuxt UI | latest |
| **样式** | Tailwind CSS | 3.x |
| **表单** | VeValidate | latest |
| **图表** | Chart.js | 4.x |
| **测试** | Vitest | latest |
| **部署** | Vercel/Cloudflare | - |

### 项目结构

```
nuxt-ecommerce-admin/
├── .nuxt/                          # Nuxt自动生成
├── node_modules/
├── server/                         # 服务端代码
│   ├── api/                       # API Routes
│   │   ├── auth/                  # 认证相关
│   │   │   ├── login.post.ts
│   │   │   ├── logout.post.ts
│   │   │   └── refresh.post.ts
│   │   ├── products/              # 商品API
│   │   │   ├── index.get.ts       # 获取商品列表
│   │   │   ├── [id].get.ts        # 获取商品详情
│   │   │   ├── [id].patch.ts     # 更新商品
│   │   │   ├── [id].delete.ts    # 删除商品
│   │   │   └── bulk.post.ts      # 批量操作
│   │   ├── orders/                # 订单API
│   │   ├── users/                 # 用户API
│   │   ├── dashboard/             # 仪表盘API
│   │   └── export/                # 数据导出
│   │
│   ├── middleware/                # 服务端中间件
│   │   ├── auth.ts                # 认证中间件
│   │   └── logger.ts             # 日志中间件
│   │
│   ├── plugins/                   # 服务端插件
│   │   ├── prisma.ts             # Prisma初始化
│   │   └── multipart.ts          # 文件上传处理
│   │
│   └── utils/                     # 服务端工具
│       ├── pagination.ts
│       └── validation.ts
│
├── src/                           # 源代码
│   ├── app/                       # Nuxt App目录
│   │   ├── pages/                # 页面路由
│   │   │   ├── index.vue         # 首页/仪表盘
│   │   │   ├── login.vue         # 登录页
│   │   │   ├── products/         # 商品管理
│   │   │   │   ├── index.vue
│   │   │   │   ├── [id].vue
│   │   │   │   └── bulk.vue
│   │   │   ├── orders/           # 订单管理
│   │   │   ├── users/            # 用户管理
│   │   │   └── settings/         # 系统设置
│   │   │
│   │   ├── components/           # 组件
│   │   │   └── layout/           # 布局组件
│   │   │       ├── default.vue   # 默认布局
│   │   │       ├── sidebar.vue   # 侧边栏
│   │   │       └── header.vue    # 顶部栏
│   │   │
│   │   ├── composables/         # 组合式函数
│   │   │   ├── useAuth.ts        # 认证相关
│   │   │   ├── useProducts.ts    # 商品相关
│   │   │   └── useChart.ts      # 图表相关
│   │   │
│   │   ├── stores/              # Pinia stores
│   │   │   ├── auth.ts          # 认证状态
│   │   │   ├── product.ts       # 商品状态
│   │   │   └── ui.ts            # UI状态
│   │   │
│   │   ├── types/              # TypeScript类型
│   │   │   ├── product.ts
│   │   │   ├── order.ts
│   │   │   └── user.ts
│   │   │
│   │   └── utils/              # 工具函数
│   │       ├── format.ts
│   │       └── validation.ts
│   │
│   ├── assets/                  # 静态资源
│   └── middleware/              # 路由中间件
│       └── auth.ts
│
├── prisma/                       # Prisma配置
│   └── schema.prisma            # 数据库模型
│
├── tests/                        # 测试文件
│   ├── unit/
│   └── e2e/
│
├── nuxt.config.ts               # Nuxt配置
├── tailwind.config.ts           # Tailwind配置
├── tsconfig.json                # TypeScript配置
└── package.json
```

---

## 第一阶段：项目初始化

### 1.1 创建项目

```bash
# 使用 nuxi 创建项目
npx nuxi@latest init nuxt-ecommerce-admin

# 进入项目目录
cd nuxt-ecommerce-admin

# 安装依赖
npm install

# 安装核心依赖
npm install \
  @pinia/nuxt \
  @nuxtjs/tailwindcss \
  @nuxtjs/color-mode \
  @vee-validate/nvevalidate \
  @vee-validate/yup \
  chart.js \
  vue-chartjs \
  dayjs

# 安装服务端依赖
npm install \
  @prisma/client \
  @prisma/adapter-postgresql \
  bcrypt \
  jsonwebtoken \
  @sidebase/nuxt-auth

# 安装开发依赖
npm install -D \
  prisma \
  @types/node \
  @types/bcrypt \
  @types/jsonwebtoken \
  vitest \
  @nuxt/test-utils
```

### 1.2 配置 Nuxt

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',

  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@sidebase/nuxt-auth'
  ],

  app: {
    head: {
      title: '电商后台管理系统',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // 私有配置（仅服务端可用）
    jwtSecret: process.env.JWT_SECRET,
    databaseUrl: process.env.DATABASE_URL,

    // 公共配置（客户端和服务端都可用）
    public: {
      apiBase: process.env.API_BASE_URL || '/api'
    }
  },

  nitro: {
    experimental: {
      openAPI: {
        enabled: true,
        route: '/api/docs'
      }
    }
  },

  typescript: {
    strict: true,
    typeCheck: true
  },

  vite: {
    optimizeDeps: {
      include: ['chart.js']
    }
  }
})
```

### 1.3 配置数据库

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户模型
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  avatar    String?
  role      UserRole @default(MEMBER)
  status    UserStatus @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关联
  orders    Order[]
  products  Product[]
  logs      ActivityLog[]

  @@index([email])
}

// 商品模型
model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  category    String
  images      String[] // 存储图片URL数组
  status      ProductStatus @default(ACTIVE)
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 关联
  createdBy   User     @relation(fields: [createdById], references: [id])
  orderItems  OrderItem[]

  @@index([slug])
  @@index([category])
  @@index([status])
}

// 订单模型
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  customerId      String
  customer        User        @relation(fields: [customerId], references: [id])
  status          OrderStatus @default(PENDING)
  totalAmount     Decimal     @db.Decimal(10, 2)
  items           OrderItem[]
  shippingAddress Json
  notes           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([orderNumber])
  @@index([customerId])
  @@index([status])
}

// 订单项模型
model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())

  @@index([orderId])
  @@index([productId])
}

// 活动日志模型
model ActivityLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String
  resource  String?
  details   Json?
  ipAddress String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}

// 枚举定义
enum UserRole {
  ADMIN
  MEMBER
}

enum UserStatus {
  ACTIVE
  INACTIVE
  BANNED
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

```bash
# 初始化数据库
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate
```

---

## 第二阶段：核心功能实现

### 2.1 Server Actions使用

```typescript
// server/api/products/create.post.ts
import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { getProductSchema } from '~/server/validation/product'

export default defineEventHandler(async (event) => {
  try {
    // 1. 解析请求体
    const body = await readBody(event)

    // 2. 验证数据
    const validatedData = getProductSchema.parse(body)

    // 3. 从会话中获取用户信息
    const session = await getUserSession(event)
    if (!session) {
      throw createError({
        statusCode: 401,
        message: '未授权'
      })
    }

    // 4. 创建商品
    const product = await prisma.product.create({
      data: {
        ...validatedData,
        createdById: session.user.id,
        slug: generateSlug(validatedData.name)
      }
    })

    // 5. 记录活动日志
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_PRODUCT',
        resource: `Product:${product.id}`,
        details: { productName: product.name }
      }
    })

    // 6. 返回结果
    return {
      success: true,
      data: product
    }
  } catch (error) {
    // 错误处理
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: '数据验证失败',
        data: error.errors
      })
    }

    throw createError({
      statusCode: 500,
      message: '创建商品失败'
    })
  }
})
```

### 2.2 组合式函数使用

```typescript
// src/app/composables/useProducts.ts
export const useProducts = () => {
  // 使用 useAsyncData 获取商品列表
  const {
    data: products,
    pending: loading,
    error,
    refresh
  } = useAsyncData(
    'products',
    () => $fetch('/api/products').then(r => r.json()),
    {
      default: () => [],
      watch: [page, keyword, category]
    }
  )

  // 创建商品（乐观更新）
  const createProduct = async (productData: ProductCreate) => {
    const nuxtApp = useNuxtApp()

    // 乐观更新
    nuxtApp.call('updateProductsCache', {
      action: 'add',
      product: { ...productData, id: 'temp-id' }
    })

    try {
      const response = await $fetch('/api/products', {
        method: 'POST',
        body: productData
      })

      if (!response.ok) throw new Error('创建失败')

      // 刷新数据
      await refresh()
      return await response.json()
    } catch (error) {
      // 回滚缓存
      nuxtApp.call('updateProductsCache', {
        action: 'remove',
        productId: 'temp-id'
      })
      throw error
    }
  }

  return {
    products,
    loading,
    error,
    refresh,
    createProduct
  }
}
```

---

## 项目总结

### 技术亮点

1. **Nuxt 4 新特性**：使用最新的 Nuxt 4 特性和优化
2. **全栈能力**：完整的 SSR、SSG、ISR 实现
3. **类型安全**：TypeScript + Prisma 全覆盖
4. **现代开发体验**：HMR、TypeScript、ESLint 集成
5. **性能优化**：图片优化、代码分割、缓存策略

### 学习收获

通过本项目，你将掌握：

- ✅ Nuxt 3/4 核心概念和最佳实践
- ✅ 全栈项目架构设计
- ✅ Prisma ORM 和数据库集成
- ✅ Server Actions 和组合式函数
- ✅ SSR、SSG、ISR 渲染模式
- ✅ 测试和部署流程

---

**恭喜完成 Nuxt 3+ 学习路径！**

建议继续学习 [DevOps 技术](../../../devops/) 了解部署和运维。
