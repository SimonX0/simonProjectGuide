# Server Routes与API

## Server Routes与API

> **学习目标**：掌握Nuxt 3的服务端路由和API开发
> **核心内容**：server/routes使用、API创建、数据库集成、REST API实战

### Server Routes概述

#### Nuxt Server架构

```
┌─────────────────────────────────────────────────────────────┐
│                Nuxt 3 Server 架构                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Client Request                                             │
│       ↓                                                     │
│  Nitro Server Engine                                       │
│       ├─ server/api/         API路由                        │
│       ├─ server/routes/      服务端路由                     │
│       ├─ server/middleware/  中间件                         │
│       └─ server/plugins/     插件                           │
│       ↓                                                     │
│  Response                                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### API Routes基础

#### 创建API端点

```typescript
// server/api/hello.get.ts
export default defineEventHandler((event) => {
  return {
    message: 'Hello from Nuxt API!',
    timestamp: new Date().toISOString()
  }
})
```

#### HTTP方法

```typescript
// server/api/posts/[id].get.ts
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  return getPost(id)
})

// server/api/posts.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return createPost(body)
})
```

### 数据库集成

```typescript
// server/plugins/database.ts
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export default defineNitroPlugin(() => {
  if (!prisma) {
    prisma = new PrismaClient()
  }
})

export { prisma }
```

### 实战案例：REST API

完整的CRUD示例，包含认证、验证、错误处理。

### 本章小结

掌握Nuxt 3的服务端开发能力，构建强大的API。

---

**下一步学习**：[Nitro服务端引擎](./chapter-128)
