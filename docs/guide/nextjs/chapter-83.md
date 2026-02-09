# Pages Router与App Router对比

## Pages Router与App Router对比

> **学习目标**：深入理解Pages Router和App Router的区别，能够根据项目需求选择合适的路由系统
> **核心内容**：两种路由系统详细对比、迁移指南、选择建议、实战案例

### 路由系统概述

#### Next.js路由演进历史

```
┌─────────────────────────────────────────────────────────────┐
│                 Next.js 路由系统演进                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  2017-2019    2020-2022        2022-2024                  │
│  ┌─────────┐  ┌─────────┐      ┌─────────┐               │
│  │ Pages   │  │ Pages   │      │ App     │               │
│  │ Router  │  │ Router  │      │ Router  │               │
│  │ v1-v9   │  │ v10-v12 │      │ v13+    │               │
│  └─────────┘  └─────────┘      └─────────┘               │
│       │             │                 │                    │
│       ├─────────────┴─────────────────┤                    │
│       │                               │                    │
│  传统文件路由                  基于React Server            │
│  getInitialProps              Components的新路由           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 两种路由系统共存

Next.js 14允许两种路由系统共存：

```
my-app/
├── app/                    # App Router（推荐）
│   ├── dashboard/
│   │   └── page.tsx       # /dashboard
│   └── layout.tsx
└── pages/                  # Pages Router（传统）
    ├── about.tsx           # /about
    └── index.tsx           # /
```

**访问规则**：
- `/` - `app/page.tsx`（App Router优先）
- `/about` - `pages/about.tsx`（Pages Router）
- `/dashboard` - `app/dashboard/page.tsx`（App Router）

### 详细对比

#### 1. 目录结构

**Pages Router**：

```
pages/
├── _app.tsx              # 全局组件
├── _document.tsx         # 文档结构
├── _error.tsx            # 错误页面
├── index.tsx             # 首页 (/)
├── about.tsx             # /about
├── blog/
│   ├── index.tsx         # /blog
│   └── [id].tsx          # /blog/123
└── api/                  # API路由
    └── users.tsx         # /api/users
```

**App Router**：

```
app/
├── layout.tsx            # 根布局（必需）
├── page.tsx              # 首页 (/)
├── loading.tsx           # 加载状态
├── error.tsx             # 错误处理
├── not-found.tsx         # 404页面
├── about/
│   └── page.tsx          # /about
├── blog/
│   ├── page.tsx          # /blog
│   ├── [id]/
│   │   └── page.tsx      # /blog/123
│   └── loading.tsx       # /blog的加载状态
└── api/
    └── users/
        └── route.ts      # /api/users
```

#### 2. 数据获取

**Pages Router**：

```typescript
// pages/blog/[id].tsx
import { GetServerSideProps, GetStaticProps } from 'next'

// ✅ 服务器端渲染（每次请求都获取数据）
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!

  const res = await fetch(`https://api.example.com/posts/${id}`)
  const post = await res.json()

  return {
    props: {
      post,
    },
  }
}

// ✅ 静态生成（构建时获取数据）
export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params!

  const res = await fetch(`https://api.example.com/posts/${id}`)
  const post = await res.json()

  return {
    props: {
      post,
    },
    revalidate: 60, // ISR: 每60秒重新生成
  }
}

// ✅ 静态生成路径
export const getStaticPaths = async () => {
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()

  return {
    paths: posts.map((post: any) => ({
      params: { id: post.id.toString() },
    })),
    fallback: 'blocking', // 或 false | true
  }
}

function BlogPost({ post }: { post: any }) {
  return <article>{post.title}</article>
}

export default BlogPost
```

**App Router**：

```typescript
// app/blog/[id]/page.tsx

// ✅ 动态渲染（每次请求都获取数据）
export default async function BlogPost({
  params,
}: {
  params: { id: string }
}) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`, {
    cache: 'no-store',
  })
  const post = await res.json()

  return <article>{post.title}</article>
}

// ✅ 静态生成（构建时获取数据）
export default async function BlogPost({
  params,
}: {
  params: { id: string }
}) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`)
  const post = await res.json()

  return <article>{post.title}</article>
}

// ✅ 增量静态再生成（ISR）
export const revalidate = 60 // 每60秒重新生成

// ✅ 生成静态路径
export async function generateStaticParams() {
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()

  return posts.map((post: any) => ({
    id: post.id.toString(),
  }))
}
```

**对比总结**：

| 功能 | Pages Router | App Router |
|------|-------------|------------|
| **SSR** | `getServerSideProps` | `fetch` + `cache: 'no-store'` |
| **SSG** | `getStaticProps` | `fetch` + 默认缓存 |
| **ISR** | `revalidate` 选项 | `revalidate` 常量 |
| **路径生成** | `getStaticPaths` | `generateStaticParams` |
| **客户端获取** | `useEffect` | `useEffect`（相同） |
| **代码位置** | 页面组件外 | 组件内部或外部 |

#### 3. 布局系统

**Pages Router**：

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const [state, setState] = useState(null)

  return (
    <div className="app">
      <nav>全局导航</nav>
      <Component {...pageProps} />
      <footer>全局页脚</footer>
    </div>
  )
}

// 每个页面路由都会重新渲染此组件
// 只能有一个全局布局
```

**App Router**：

```typescript
// app/layout.tsx - 根布局
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <nav>全局导航</nav>
        {children}
        <footer>全局页脚</footer>
      </body>
    </html>
  )
}

// app/dashboard/layout.tsx - 嵌套布局
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <aside>侧边栏</aside>
      <main>{children}</main>
    </div>
  )
}

// 支持多层嵌套布局
// 布局之间可以保持状态
```

**布局功能对比**：

| 功能 | Pages Router | App Router |
|------|-------------|------------|
| **多层嵌套** | ❌ 需要`useRouter` | ✅ 原生支持 |
| **状态保持** | ❌ 每次导航重置 | ✅ 默认保持 |
| **布局组合** | ❌ 单一布局文件 | ✅ 多个布局文件 |
| **路由组** | ❌ 不支持 | ✅ 支持`(group)` |
| **并行路由** | ❌ 不支持 | ✅ 支持 |
| **拦截路由** | ❌ 不支持 | ✅ 支持 |

#### 4. 客户端导航

**Pages Router**：

```typescript
// pages/about.tsx
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AboutPage() {
  const router = useRouter()

  const handleClick = () => {
    // ✅ 编程式导航
    router.push('/dashboard')
    router.replace('/dashboard')

    // 带查询参数
    router.push({
      pathname: '/dashboard',
      query: { tab: 'settings' },
    })
  }

  return (
    <div>
      {/* ✅ 声明式导航 */}
      <Link href="/dashboard">
        <a>前往仪表盘</a>
      </Link>

      {/* 带查询参数 */}
      <Link href="/dashboard?tab=settings">
        <a>设置</a>
      </Link>

      <button onClick={handleClick}>点击跳转</button>
    </div>
  )
}
```

**App Router**：

```typescript
// app/about/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AboutPage() {
  const router = useRouter()

  const handleClick = () => {
    // ✅ 编程式导航（注意：navigation而不是router）
    router.push('/dashboard')
    router.replace('/dashboard')

    // 带查询参数
    router.push('/dashboard?tab=settings')

    // 返回
    router.back()
    router.forward()
  }

  return (
    <div>
      {/* ✅ 声明式导航 */}
      <Link href="/dashboard">
        前往仪表盘
      </Link>

      {/* 带查询参数 */}
      <Link href="/dashboard?tab=settings">
        设置
      </Link>

      {/* 动态路由 */}
      <Link href={`/blog/${post.id}`}>
        查看文章
      </Link>

      <button onClick={handleClick}>点击跳转</button>
    </div>
  )
}
```

**导航API对比**：

| 功能 | Pages Router | App Router |
|------|-------------|------------|
| **Hook来源** | `next/router` | `next/navigation` |
| **路由对象** | `router` | `router` |
| **push方法** | ✅ | ✅ |
| **replace方法** | ✅ | ✅ |
| **query对象** | `router.query` | `useSearchParams()` |
| **pathname** | `router.pathname` | `usePathname()` |
| **事件监听** | `router.events` | 不需要 |

#### 5. 错误处理

**Pages Router**：

```typescript
// pages/_error.tsx
import { NextPageContext } from 'next'
import NextErrorComponent from 'next/error'

export default function Error({ statusCode, hasGetInitialPropsRun, err }) {
  return (
    <div>
      <h1>{statusCode} 出错了</h1>
      <p>{err?.message}</p>
    </div>
  )
}

Error.getInitialProps = ({ res, err, asPath }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode, hasGetInitialPropsRun: true }
}
```

**App Router**：

```typescript
// app/error.tsx
'use client' // 必须是Client Component

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>出错了！</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>重试</button>
    </div>
  )
}

// app/blog/error.tsx - 嵌套错误边界
'use client'

export default function BlogError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>博客错误</h2>
      <button onClick={reset}>重试</button>
    </div>
  )
}
```

**错误处理对比**：

| 功能 | Pages Router | App Router |
|------|-------------|------------|
| **全局错误** | `_error.tsx` | `app/error.tsx` |
| **嵌套错误** | ❌ 不支持 | ✅ 支持多层 |
| **必须Client** | ❌ 否 | ✅ 是 |
| **自动捕获** | ❌ 需要手动 | ✅ 自动 |
| **重试功能** | ❌ 无 | ✅ reset()函数 |

#### 6. 加载状态

**Pages Router**：

```typescript
// pages/dashboard.tsx
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  if (loading) {
    return <div>加载中...</div>
  }

  return <div>仪表盘内容</div>
}
```

**App Router**：

```typescript
// app/loading.tsx - 全局加载状态
export default function Loading() {
  return <div>全局加载中...</div>
}

// app/dashboard/loading.tsx - Dashboard特定加载状态
export default function DashboardLoading() {
  return <div>仪表盘加载中...</div>
}

// app/dashboard/page.tsx
// 自动被Suspense包裹，无需手动处理
export default async function Dashboard() {
  const data = await fetch('/api/data').then(r => r.json())

  return <div>{data.title}</div>
}
```

**加载状态对比**：

| 功能 | Pages Router | App Router |
|------|-------------|------------|
| **实现方式** | 手动useEffect | 自动Suspense |
| **全局加载** | 手动实现 | `app/loading.tsx` |
| **嵌套加载** | ❌ 复杂 | ✅ 简单 |
| **进度条** | 需要第三方库 | 需要第三方库 |
| **代码量** | 较多 | 较少 |

#### 7. 元数据管理

**Pages Router**：

```typescript
// pages/blog/[id].tsx
import { GetServerSideProps } from 'next'
import Head from 'next/head'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!
  const post = await fetch(`https://api.example.com/posts/${id}`)
    .then(r => r.json())

  return {
    props: {
      post,
    },
  }
}

export default function BlogPost({ post }: { post: any }) {
  return (
    <div>
      <Head>
        <title>{post.title} - 我的博客</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
      </Head>

      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    </div>
  )
}
```

**App Router**：

```typescript
// app/blog/[id]/page.tsx
import { Metadata } from 'next'

// ✅ 静态元数据
export const metadata: Metadata = {
  title: '博客 - 我的网站',
  description: '我的博客文章',
}

// ✅ 动态元数据
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const post = await fetch(`https://api.example.com/posts/${params.id}`)
    .then(r => r.json())

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  }
}

export default async function BlogPost({
  params,
}: {
  params: { id: string }
}) {
  // 不需要Head组件
  return (
    <article>
      <h1>{params.id}</h1>
      <p>文章内容</p>
    </article>
  )
}
```

**元数据管理对比**：

| 功能 | Pages Router | App Router |
|------|-------------|------------|
| **静态元数据** | `<Head>`组件 | `metadata`对象 |
| **动态元数据** | 组件内`<Head>` | `generateMetadata` |
| **类型安全** | ❌ 无 | ✅ 完整TypeScript支持 |
| **布局偏移** | ❌ 可能发生 | ✅ 自动处理 |
| **代码复用** | ❌ 需要自定义 | ✅ 内置支持 |

### 完整对比表

| 特性 | Pages Router | App Router | 推荐场景 |
|------|-------------|------------|---------|
| **React版本** | 任意 | 18+（必需） | - |
| **Server Components** | ❌ | ✅ | App Router |
| **布局嵌套** | ❌ | ✅ | App Router |
| **数据获取** | getStaticProps等 | fetch API | App Router |
| **错误处理** | _error.tsx | error.tsx（多层） | App Router |
| **加载状态** | 手动实现 | loading.tsx | App Router |
| **元数据** | Head组件 | metadata API | App Router |
| **Streaming** | ❌ | ✅ | App Router |
| **并行路由** | ❌ | ✅ | App Router |
| **拦截路由** | ❌ | ✅ | App Router |
| **学习曲线** | 低 | 中等 | Pages Router |
| **稳定性** | 非常稳定 | 稳定（v14+） | Pages Router |
| **生态支持** | 成熟 | 快速增长 | App Router |
| **迁移成本** | 无 | 高 | Pages Router |
| **性能** | 好 | 更好 | App Router |
| **SEO** | 好 | 更好 | App Router |

### 迁移指南

#### 迁移策略

**选项1：渐进式迁移**

```
my-app/
├── app/              # 新功能使用App Router
│   └── new-feature/
└── pages/            # 旧功能保持Pages Router
    └── old-feature/
```

**选项2：完全迁移**

```
1. 创建/app目录
2. 迁移根布局（layout.tsx）
3. 迁移页面（page.tsx）
4. 迁移数据获取逻辑
5. 迁移API路由
6. 测试并删除/pages目录
```

#### 具体迁移步骤

**步骤1：创建根布局**

```typescript
// app/layout.tsx
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
```

**步骤2：迁移首页**

```typescript
// Before: pages/index.tsx
export default function Home() {
  return <div>首页</div>
}

// After: app/page.tsx
export default function Home() {
  return <div>首页</div>
}
```

**步骤3：迁移动态路由**

```typescript
// Before: pages/blog/[id].tsx
export const getStaticPaths = async () => { /* ... */ }
export const getStaticProps = async (context) => { /* ... */ }

export default function BlogPost({ post }: { post: any }) {
  return <article>{post.title}</article>
}

// After: app/blog/[id]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ id: post.id }))
}

export default async function BlogPost({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)
  return <article>{post.title}</article>
}
```

**步骤4：迁移API路由**

```typescript
// Before: pages/api/hello.ts
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello' })
}

// After: app/api/hello/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello' })
}
```

### 实战案例：同一功能两种实现

让我们用两种路由系统实现同一个博客列表功能。

#### Pages Router实现

```typescript
// pages/blog/index.tsx
import { GetStaticProps } from 'next'
import Link from 'next/link'
import Head from 'next/head'

interface Post {
  id: string
  title: string
  excerpt: string
  date: string
}

interface BlogProps {
  posts: Post[]
}

export const getStaticProps: GetStaticProps<BlogProps> = async () => {
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json())

  return {
    props: {
      posts,
    },
    revalidate: 60, // ISR
  }
}

export default function BlogPage({ posts }: BlogProps) {
  return (
    <div>
      <Head>
        <title>博客 - 我的网站</title>
        <meta name="description" content="我的博客文章列表" />
      </Head>

      <h1 className="text-4xl font-bold mb-8">博客文章</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.id}`}>
            <a className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md">
              <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <time className="text-sm text-gray-500">{post.date}</time>
            </a>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

#### App Router实现

```typescript
// app/blog/page.tsx
import Link from 'next/link'
import { Metadata } from 'next'

interface Post {
  id: string
  title: string
  excerpt: string
  date: string
}

// ✅ 元数据
export const metadata: Metadata = {
  title: '博客 - 我的网站',
  description: '我的博客文章列表',
}

// ✅ 数据获取（自动缓存和ISR）
async function getPosts(): Promise<Post[]> {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }, // ISR
  })
  return res.json()
}

// ✅ Server Component
export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">博客文章</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.id}`}>
            <article className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md">
              <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <time className="text-sm text-gray-500">{post.date}</time>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

**代码量对比**：

| 指标 | Pages Router | App Router | 改进 |
|------|-------------|------------|------|
| **行数** | ~60行 | ~40行 | -33% |
| **类型定义** | 需要手动 | 自动推导 | 更简单 |
| **元数据** | Head组件 | metadata对象 | 更清晰 |
| **数据获取** | getStaticProps | fetch API | 更简洁 |

### 选择建议

#### 选择App Router的情况

✅ **推荐使用App Router**：

1. **新项目** - 从零开始的项目
2. **需要Server Components** - 依赖服务端渲染提升性能
3. **复杂布局** - 需要多层嵌套布局
4. **高级路由** - 需要并行路由、拦截路由等
5. **更好的SEO** - 需要更强大的SEO能力
6. **性能优先** - 追求最佳性能

```typescript
// ✅ App Router示例
app/
├── (main)/
│   ├── layout.tsx        # 主布局
│   └── page.tsx
├── (dashboard)/
│   ├── layout.tsx        # Dashboard布局
│   ├── [username]/
│   │   ├── layout.tsx    # 用户布局
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
```

#### 选择Pages Router的情况

✅ **推荐使用Pages Router**：

1. **现有项目** - 已经使用Pages Router的项目
2. **简单需求** - 不需要复杂的功能
3. **特殊依赖** - 依赖与Pages Router深度集成的库
4. **团队熟悉** - 团队已经熟悉Pages Router
5. **稳定性优先** - 优先考虑稳定性而非新特性

```typescript
// ✅ Pages Router示例
pages/
├── _app.tsx
├── index.tsx
├── blog.tsx
└── api/
    └── posts.tsx
```

#### 混合使用的情况

✅ **可以混合使用**：

```
my-app/
├── app/                  # 新功能
│   ├── new-feature/
│   └── experimental/
└── pages/                # 旧功能
    ├── existing-feature/
    └── legacy/
```

**混合使用的注意事项**：

1. 避免路由冲突
2. 共享组件需要在`src/components`（不在pages或app中）
3. 布局不能跨路由系统共享
4. 数据获取方式不同

### 最佳实践

#### 1. 项目决策流程

```
是否是新项目？
├─ 是 → 使用App Router
└─ 否 → 是否需要重构？
    ├─ 是 → 迁移到App Router
    └─ 否 → 继续使用Pages Router
        └─ 考虑渐进式迁移
```

#### 2. 代码组织

```typescript
// ✅ 推荐：共享组件放在src目录
src/
├── components/          # 共享组件
│   ├── ui/
│   └── features/
├── lib/                 # 工具库
└── styles/              # 样式文件

app/
└── ...                  # App Router特定代码

pages/
└── ...                  # Pages Router特定代码
```

#### 3. 性能优化

```typescript
// ✅ App Router：使用Server Components
export default async function Page() {
  const data = await fetch('/api/data')
  return <div>{data.title}</div>
}

// ✅ Pages Router：使用增量静态生成
export const getStaticProps = async () => {
  return {
    props: { data },
    revalidate: 60, // ISR
  }
}
```

### 本章小结

| 维度 | Pages Router | App Router |
|------|-------------|------------|
| **成熟度** | 非常成熟 | 快速成熟中 |
| **性能** | 好 | 更好 |
| **学习曲线** | 低 | 中等 |
| **代码量** | 较多 | 较少 |
| **类型安全** | 部分 | 完整 |
| **未来** | 维护模式 | 主要方向 |
| **适用场景** | 简单项目、现有项目 | 新项目、复杂项目 |

---

**下一步学习**：建议继续学习[路由系统完全指南](./chapter-84)深入了解路由的高级功能。
