# Next.js 15新特性

## Next.js 15新特性

> **学习目标**：掌握Next.js 15的核心新特性和改进
> **核心内容**：新功能、API改进、破坏性变更、迁移指南

### Next.js 15概述

#### 版本亮点

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js 15 核心更新                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🚀 性能提升                                                 │
│     - 更快的构建速度                                         │
│     - 优化的路由系统                                         │
│     - 改进的缓存策略                                         │
│                                                             │
│  🔧 开发体验                                                 │
│     - 改进的错误提示                                         │
│     - 更好的TypeScript支持                                   │
│     - 增强的开发工具                                         │
│                                                             │
│  🎯 API改进                                                  │
│     - 更简洁的API设计                                        │
│     - 更好的组合性                                           │
│     - 统一的处理方式                                         │
│                                                             │
│  📦 生态系统                                                 │
│     - 更新依赖版本                                           │
│     - 改进的集成体验                                         │
│     - 增强的安全性                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 升级前提

| 依赖项 | 最低版本 | 推荐版本 |
|--------|---------|---------|
| **Node.js** | 18.18.0+ | 20.x LTS |
| **React** | 18.3.0+ | 19.x |
| **TypeScript** | 5.0+ | 5.3+ |

---

### 核心新特性

#### 1. 改进的fetch API

```typescript
// app/dashboard/page.tsx
// Next.js 15: 更智能的fetch缓存

// 默认行为：强制重新验证
async function getDashboardData() {
  const res = await fetch('https://api.example.com/dashboard', {
    // Next.js 15: 默认no-store
    next: { revalidate: 3600 } // 显式指定缓存时间
  })

  return res.json()
}

// 改进的缓存控制
export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div>
      <h1>仪表盘</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

#### 2. 新的缓存系统

```typescript
// app/api/cache/route.ts
// Next.js 15: 统一的缓存API

import { unstable_cache } from 'next/cache'

// 新的缓存函数
const getCachedData = unstable_cache(
  async (id: string) => {
    const res = await fetch(`https://api.example.com/data/${id}`)
    return res.json()
  },
  ['data-cache'], // 缓存键
  {
    revalidate: 3600, // 1小时
    tags: ['data'] // 标签
  }
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id') || '1'

  const data = await getCachedData(id)
  return Response.json(data)
}
```

#### 3. 增强的表单处理

```typescript
// app/actions/form-actions.ts
'use server'

// Next.js 15: 改进的表单验证
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// 定义验证schema
const formSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('无效的邮箱地址'),
  message: z.string().min(10, '消息至少10个字符')
})

export type FormState = {
  errors?: {
    name?: string[]
    email?: string[]
    message?: string[]
  }
  message?: string
  success?: boolean
}

export async function submitForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 验证表单
  const validatedFields = formSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '验证失败'
    }
  }

  try {
    // 提交数据
    await fetch('https://api.example.com/contact', {
      method: 'POST',
      body: JSON.stringify(validatedFields.data)
    })

    // 重新验证缓存
    revalidatePath('/contact')

    return { success: true, message: '提交成功' }
  } catch (error) {
    return { message: '提交失败' }
  }
}
```

```typescript
// app/contact/page.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { submitForm } from '../actions/form-actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
    >
      {pending ? '提交中...' : '提交'}
    </button>
  )
}

const initialState: FormState = {}

export default function ContactPage() {
  const [state, formAction] = useFormState(submitForm, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name">姓名</label>
        <input
          id="name"
          name="name"
          type="text"
          aria-describedby="name-error"
          className="border rounded px-3 py-2"
        />
        {state.errors?.name && (
          <p id="name-error" className="text-red-500 text-sm">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email">邮箱</label>
        <input
          id="email"
          name="email"
          type="email"
          aria-describedby="email-error"
          className="border rounded px-3 py-2"
        />
        {state.errors?.email && (
          <p id="email-error" className="text-red-500 text-sm">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message">消息</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          aria-describedby="message-error"
          className="border rounded px-3 py-2"
        />
        {state.errors?.message && (
          <p id="message-error" className="text-red-500 text-sm">
            {state.errors.message[0]}
          </p>
        )}
      </div>

      <SubmitButton />

      {state.message && (
        <p className={state.success ? 'text-green-600' : 'text-red-600'}>
          {state.message}
        </p>
      )}
    </form>
  )
}
```

#### 4. 改进的部分预渲染（PPR）

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // 启用部分预渲染
    ppr: 'incremental', // 'incremental' | true
  },
}

export default nextConfig
```

```typescript
// app/products/page.tsx
// 使用PPR的页面

import { Suspense } from 'react'

// 静态部分：立即渲染
export const runtime = 'edge'

export default function ProductsPage() {
  return (
    <div>
      <h1>产品列表</h1>

      {/* 静态shell */}
      <div className="mb-8">
        <p>浏览我们的产品目录</p>
      </div>

      {/* 动态部分：流式渲染 */}
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList />
      </Suspense>
    </div>
  )
}

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 animate-pulse" />
      ))}
    </div>
  )
}

async function ProductList() {
  // 这个fetch不会被缓存
  const products = await fetch('https://api.example.com/products', {
    cache: 'no-store'
  }).then(r => r.json())

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product: any) => (
        <div key={product.id} className="border rounded p-4">
          <h3>{product.name}</h3>
          <p>{product.price}</p>
        </div>
      ))}
    </div>
  )
}
```

#### 5. 改进的并行路由

```typescript
// app/dashboard/layout.tsx
// Next.js 15: 更强大的并行路由

export default function DashboardLayout({
  children,
  analytics,
  settings,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  settings: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      <aside className="w-64 bg-gray-100 p-4">
        <nav>
          <a href="/dashboard">概览</a>
          <a href="/dashboard/analytics">分析</a>
          <a href="/dashboard/settings">设置</a>
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex">
        {/* 默认插槽 */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>

        {/* 并行插槽：分析 */}
        <div className="w-96 border-l p-6 overflow-auto">
          {analytics}
        </div>

        {/* 并行插槽：设置 */}
        <div className="w-80 border-l p-6 overflow-auto">
          {settings}
        </div>
      </div>
    </div>
  )
}
```

#### 6. 增强的Server Actions

```typescript
// app/actions/user-actions.ts
'use server'

// Next.js 15: 改进的Server Actions

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// 带认证的action
export async function updateProfile(formData: FormData) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string

  // 更新用户信息
  await db.user.update({
    where: { id: session.user.id },
    data: { name, email }
  })

  // 重新验证缓存
  revalidatePath('/profile')

  return { success: true }
}

// 带错误处理的action
export async function deletePost(postId: string) {
  const session = await auth()

  if (!session) {
    return { error: '未登录' }
  }

  const post = await db.post.findUnique({
    where: { id: postId }
  })

  if (!post) {
    return { error: '文章不存在' }
  }

  if (post.authorId !== session.user.id) {
    return { error: '无权删除' }
  }

  await db.post.delete({
    where: { id: postId }
  })

  revalidatePath('/posts')
  redirect('/posts')
}
```

---

### 破坏性变更

#### 1. fetch缓存行为变更

```typescript
// ❌ Next.js 14: 默认缓存
async function getData() {
  const res = await fetch('https://api.example.com/data')
  // 默认：force-cache
  return res.json()
}

// ✅ Next.js 15: 默认不缓存
async function getData() {
  const res = await fetch('https://api.example.com/data')
  // 默认：no-store
  return res.json()
}

// 需要显式指定缓存
async function getCachedData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }
  })
  return res.json()
}
```

#### 2. 路由配置变更

```typescript
// next.config.ts

// ❌ Next.js 14: 旧配置
const nextConfig: NextConfig = {
  // 已废弃
  experimental: {
    appDir: true
  }
}

// ✅ Next.js 15: 新配置
const nextConfig: NextConfig = {
  // appDir现在是默认行为
}
```

#### 3. API Routes变更

```typescript
// ❌ Next.js 14: 旧API Routes
// pages/api/hello.ts
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.json({ message: 'Hello' })
}

// ✅ Next.js 15: 推荐使用Route Handlers
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello' })
}
```

---

### 实战案例：从Next.js 14迁移到15

#### 迁移步骤

**1. 升级依赖**

```bash
# 升级Next.js
npm install next@15 react@19 react-dom@19

# 升级TypeScript
npm install -D typescript@5

# 升级其他依赖
npm install @types/react@19 @types/react-dom@19
```

**2. 更新配置文件**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 启用实验性功能
  experimental: {
    // 部分预渲染
    ppr: 'incremental',

    // 优化包导入
    optimizePackageImports: ['lucide-react', '@heroicons/react']
  },

  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com'
      }
    ]
  }
}

export default nextConfig
```

**3. 更新fetch调用**

```typescript
// lib/api.ts

// ❌ 旧代码
export async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  // Next.js 14: 默认缓存
  return res.json()
}

// ✅ 新代码
export async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    // Next.js 15: 显式指定缓存
    next: { revalidate: 3600 }
  })
  return res.json()
}

// 不需要缓存的数据
export async function getRealtimeData() {
  const res = await fetch('https://api.example.com/realtime', {
    cache: 'no-store'
  })
  return res.json()
}
```

**4. 更新Server Actions**

```typescript
// app/actions/posts.ts
'use server'

// ❌ 旧代码
export async function createPost(formData: FormData) {
  const data = {
    title: formData.get('title'),
    content: formData.get('content')
  }

  await db.post.create({ data })
  return { success: true }
}

// ✅ 新代码：添加验证
import { z } from 'zod'

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(10)
})

export async function createPost(formData: FormData) {
  // 验证
  const validatedFields = postSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '验证失败'
    }
  }

  // 创建
  await db.post.create({ data: validatedFields.data })

  revalidatePath('/posts')
  return { success: true }
}
```

**5. 更新组件**

```typescript
// app/blog/page.tsx

// ❌ 旧代码
export default async function BlogPage() {
  const posts = await getPosts() // 使用默认缓存

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  )
}

// ✅ 新代码：使用Suspense
import { Suspense } from 'react'

export default function BlogPage() {
  return (
    <div>
      <h1>博客</h1>

      <Suspense fallback={<LoadingSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  )
}

async function PostList() {
  const posts = await getPosts()

  return (
    <>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </>
  )
}

function LoadingSkeleton() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </>
  )
}
```

#### 迁移检查清单

```markdown
## 迁移检查清单

### 依赖更新
- [ ] 升级Next.js到15.x
- [ ] 升级React到19.x
- [ ] 升级TypeScript到5.x
- [ ] 升级其他相关依赖

### 代码更新
- [ ] 检查所有fetch调用，添加缓存配置
- [ ] 更新Server Actions，添加错误处理
- [ ] 替换API Routes为Route Handlers
- [ ] 更新自定义配置

### 测试
- [ ] 运行开发服务器测试
- [ ] 运行构建测试
- [ ] 测试所有页面功能
- [ ] 测试Server Actions
- [ ] 测试API Routes

### 性能优化
- [ ] 启用PPR（如需要）
- [ ] 配置图片优化
- [ ] 检查缓存策略
- [ ] 优化包大小
```

---

### 性能优化技巧

#### 1. 使用部分预渲染

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div>
      {/* 静态部分 */}
      <header>
        <h1>仪表盘</h1>
      </header>

      {/* 动态部分 */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<RecentActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}
```

#### 2. 优化缓存策略

```typescript
// lib/cache.ts

// 短期缓存：频繁变化的数据
export async function getTrendingPosts() {
  const res = await fetch('https://api.example.com/trending', {
    next: { revalidate: 300 } // 5分钟
  })
  return res.json()
}

// 长期缓存：静态内容
export async function getStaticContent() {
  const res = await fetch('https://api.example.com/content', {
    next: { revalidate: 86400 } // 24小时
  })
  return res.json()
}

// 不缓存：实时数据
export async function getLiveScore() {
  const res = await fetch('https://api.example.com/score', {
    cache: 'no-store'
  })
  return res.json()
}
```

#### 3. 使用服务器组件

```typescript
// app/blog/[slug]/page.tsx
// 最大化服务器组件使用

import { notFound } from 'next/navigation'

// 服务器组件：默认行为
export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        <p>作者: {post.author.name}</p>
      </header>

      {/* 仅交互部分使用客户端组件 */}
      <LikeButton postId={post.id} />

      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}

// 客户端组件：仅用于交互
'use client'
import { useState } from 'react'

function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false)

  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '已喜欢' : '喜欢'}
    </button>
  )
}
```

---

### 本章小结

| 特性 | 说明 | 影响 |
|------|------|------|
| **改进的fetch** | 默认不缓存，需显式指定 | 需要更新现有fetch调用 |
| **统一缓存** | unstable_cacheAPI | 更好的缓存控制 |
| **PPR** | 部分预渲染 | 提升首屏性能 |
| **增强表单** | 更好的验证和错误处理 | 改进用户体验 |
| **并行路由** | 更强大的路由功能 | 更灵活的布局 |

| 迁移步骤 | 优先级 |
|---------|--------|
| 升级依赖 | 高 |
| 更新fetch调用 | 高 |
| 更新Server Actions | 中 |
| 测试功能 | 高 |
| 启用新特性 | 低 |

---

**下一步学习**：建议继续学习[全栈开发实战](./chapter-108)了解如何使用Next.js 15构建完整应用。
