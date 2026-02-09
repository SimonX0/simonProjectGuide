# App Router核心概念

## App Router核心概念

> **学习目标**：深入理解Next.js 14 App Router的核心概念和工作原理
> **核心内容**：App Router vs Pages Router、文件路由约定、Layouts、Templates、实战应用

### App Router概述

#### 什么是App Router

**App Router** 是Next.js 13引入并在14中完善的全新路由系统，基于React Server Components构建，提供了更强大的布局、数据获取和性能优化能力。

```
┌─────────────────────────────────────────────────────────────┐
│              App Router vs Pages Router                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Pages Router (pages/)          App Router (app/)          │
│  ┌──────────────────┐          ┌──────────────────┐       │
│  │ _app.tsx         │          │ layout.tsx       │       │
│  │ _document.tsx    │          │ loading.tsx      │       │
│  │ _error.tsx       │          │ error.tsx        │       │
│  │ index.tsx        │          │ page.tsx         │       │
│  └──────────────────┘          │ not-found.tsx    │       │
│                                │ template.tsx      │       │
│                                └──────────────────┘       │
│                                                             │
│  基于文件系统                   基于嵌套布局和Server        │
│  客户端导航                    Server Components           │
│  getServerSideProps            fetch API & Cache           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### App Router核心特性

| 特性 | Pages Router | App Router |
|------|-------------|------------|
| **布局系统** | `_app.tsx`单文件 | 嵌套Layouts |
| **数据获取** | `getServerSideProps` | `fetch` API |
| **错误处理** | `_error.tsx` | `error.tsx`多层 |
| **加载状态** | 手动实现 | `loading.tsx`自动 |
| **Streaming** | 不支持 | 原生支持 |
| **Server Components** | 不支持 | 完全支持 |
| **并发渲染** | 不支持 | 原生支持 |

### app目录结构

#### 基础结构

```
app/
├── (marketing)/           # 路由组（不影响URL）
│   ├── about/
│   │   └── page.tsx      # /about
│   ├── layout.tsx        # (marketing)的共享布局
│   └── page.tsx          # /
├── shop/                  # 普通路由
│   ├── layout.tsx        # /shop的布局
│   └── page.tsx          # /shop
├── dashboard/             # 受保护的路由
│   ├── layout.tsx
│   └── page.tsx          # /dashboard
├── blog/                  # 动态路由
│   ├── [slug]/           # 捕获路由参数
│   │   ├── page.tsx      # /blog/my-post
│   │   └── edit/
│   │       └── page.tsx  # /blog/my-post/edit
│   └── page.tsx          # /blog
├── api/                   # API路由
│   └── users/
│       └── route.ts      # /api/users
├── globals.css           # 全局样式
├── layout.tsx            # 根布局（必需）
└── page.tsx              # 首页（必需）
```

#### 特殊文件说明

**必需文件**：

```typescript
// app/layout.tsx - 根布局（必需）
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  )
}

// app/page.tsx - 首页（必需）
export default function HomePage() {
  return <h1>欢迎来到首页</h1>
}
```

**可选文件**：

```typescript
// app/loading.tsx - 加载状态（自动包裹Suspense边界）
export default function Loading() {
  return <div>加载中...</div>
}

// app/error.tsx - 错误边界（必须是Client Component）
'use client'
export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>出错了！</h2>
      <button onClick={reset}>重试</button>
    </div>
  )
}

// app/not-found.tsx - 404页面
export default function NotFound() {
  return <h2>页面未找到</h2>
}

// app/template.tsx - 模板（每次导航重新渲染）
export default function Template({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="template">{children}</div>
}
```

### 文件路由约定

#### 1. 基础路由

```typescript
// app/page.tsx → /
export default function Page() {
  return <div>首页</div>
}

// app/about/page.tsx → /about
export default function AboutPage() {
  return <div>关于页面</div>
}

// app/blog/page.tsx → /blog
export default function BlogPage() {
  return <div>博客列表</div>
}
```

#### 2. 动态路由

**单段动态路由**：

```typescript
// app/blog/[slug]/page.tsx
// → /blog/hello-world
// → /blog/nextjs-tutorial

interface Props {
  params: {
    slug: string
  }
}

export default function BlogPost({ params }: Props) {
  return <div>文章: {params.slug}</div>
}

// 生成静态参数（用于静态生成）
export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}
```

**多段动态路由**：

```typescript
// app/shop/[category]/[product]/page.tsx
// → /shop/electronics/laptop
// → /shop/clothing/t-shirt

interface Props {
  params: {
    category: string
    product: string
  }
}

export default function ProductPage({ params }: Props) {
  return (
    <div>
      分类: {params.category}
      商品: {params.product}
    </div>
  )
}
```

**捕获所有路由**：

```typescript
// app/docs/[...slug]/page.tsx
// → /docs/a
// → /docs/a/b
// → /docs/a/b/c

interface Props {
  params: {
    slug: string[]
  }
}

export default function DocPage({ params }: Props) {
  // params.slug 是一个数组
  return <div>路径: {params.slug.join('/')}</div>
}
```

#### 3. 路由组

**使用场景**：在不影响URL的情况下组织文件

```typescript
// app/(marketing)/about/page.tsx → /about
// app/(marketing)/contact/page.tsx → /contact
// app/(dashboard)/settings/page.tsx → /settings

// app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <header>营销页面共享的导航</header>
      {children}
      <footer>共享的页脚</footer>
    </div>
  )
}

// app/(dashboard)/layout.tsx
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
```

**路由组最佳实践**：

```typescript
// ✅ 推荐：按功能分组
app/
├── (auth)/              # 认证相关页面
│   ├── login/
│   ├── register/
│   └── layout.tsx       # 认证布局
├── (dashboard)/         # 仪表盘页面
│   ├── settings/
│   ├── profile/
│   └── layout.tsx       # 仪表盘布局
└── (public)/            # 公开页面
    ├── about/
    ├── contact/
    └── layout.tsx       # 公开页面布局
```

### Layouts详解

#### Root Layout（根布局）

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '我的应用',
  description: '使用Next.js 14构建',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        {/* 全局导航 */}
        <nav className="global-nav">
          <a href="/">首页</a>
          <a href="/about">关于</a>
        </nav>

        {/* 页面内容 */}
        {children}

        {/* 全局页脚 */}
        <footer className="global-footer">
          © 2024 我的应用
        </footer>
      </body>
    </html>
  )
}
```

#### 嵌套布局

```typescript
// app/dashboard/layout.tsx
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      {/* 侧边栏 */}
      <aside className="sidebar">
        <nav>
          <Link href="/dashboard">概览</Link>
          <Link href="/dashboard/settings">设置</Link>
          <Link href="/dashboard/analytics">分析</Link>
        </nav>
      </aside>

      {/* 主内容区域 */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1>仪表盘</h1>
      <p>这是仪表盘的主页面</p>
    </div>
  )
}

// app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return (
    <div>
      <h1>设置</h1>
      <p>这是设置页面，继承了dashboard的布局</p>
    </div>
  )
}
```

**布局嵌套示例**：

```
URL:                    布局层次:
/                       Root Layout
/about                  Root Layout
/dashboard              Root Layout + Dashboard Layout
/dashboard/settings     Root Layout + Dashboard Layout
/dashboard/analytics    Root Layout + Dashboard Layout
```

#### 多个根布局

```typescript
// app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-layout">
      <header>营销网站导航</header>
      {children}
    </div>
  )
}

// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      <aside>侧边栏</aside>
      {children}
    </div>
  )
}

// 访问 / → 使用 marketing layout
// 访问 /dashboard → 使用 dashboard layout
```

### Templates详解

#### Layout vs Template

**Layout（布局）**：
- 在路由切换时**保持状态**
- 不会重新渲染
- 适合持久化的UI

**Template（模板）**：
- 每次导航都**重新渲染**
- 重新挂载组件
- 适合需要重新初始化的UI

```typescript
// app/template.tsx
'use client'

import { useEffect, useState } from 'react'

export default function Template({
  children,
}: {
  children: React.ReactNode
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // 每次导航都会执行
    console.log('Template重新挂载')
    setCount(0)
  }, [])

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      {children}
    </div>
  )
}
```

**使用场景对比**：

| 场景 | 使用Layout | 使用Template |
|------|-----------|-------------|
| 导航栏 | ✅ 保持滚动位置 | ❌ 每次回到顶部 |
| 侧边栏 | ✅ 保持展开状态 | ❌ 每次收起 |
| 动画 | ❌ 只播放一次 | ✅ 每次播放 |
| 表单 | ❌ 保持旧数据 | ✅ 每次重置 |
| 数据获取 | ❌ 不重新获取 | ✅ 每次重新获取 |

### 特殊页面

#### Loading UI

```typescript
// app/loading.tsx
export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>加载中...</p>
    </div>
  )
}
```

**Loading工作原理**：

```typescript
// app/page.tsx
export default async function Page() {
  // 这个Suspense边界自动包裹整个页面
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store',
  }).then(r => r.json())

  return <div>{data.title}</div>
}
```

**嵌套Loading**：

```typescript
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return <div>仪表盘加载中...</div>
}

// app/dashboard/settings/loading.tsx
export default function SettingsLoading() {
  return <div>设置加载中...</div>
}

// 访问 /dashboard/settings 会显示：
// 1. 先显示 settings 的 loading
// 2. 如果settings加载完成但dashboard还在加载，显示dashboard的 loading
```

#### Error Handling

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
    <div className="error-container">
      <h2>出错了！</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>重试</button>
    </div>
  )
}
```

**嵌套错误边界**：

```typescript
// app/dashboard/error.tsx
'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>仪表盘错误</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重新加载</button>
    </div>
  )
}
```

**错误边界不会捕获**：

```typescript
// ❌ 错误边界不会捕获以下错误：
// 1. Server Components中的错误（需要error.tsx）
// 2. Client Components中的错误（需要'use client' + Error Boundary）
// 3. Server Actions中的错误（需要try/catch）

// ✅ Server Action错误处理
'use client'

export default function Form() {
  async function handleSubmit(formData: FormData) {
    'use server'
    try {
      // 服务器操作
    } catch (error) {
      return { error: '操作失败' }
    }
  }

  return (
    <form action={handleSubmit}>
      {/* 表单内容 */}
    </form>
  )
}
```

#### Not-Found页面

```typescript
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404 - 页面未找到</h1>
      <p>您访问的页面不存在</p>
      <Link href="/">返回首页</Link>
    </div>
  )
}
```

**动态触发404**：

```typescript
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'

export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  const post = await fetch(
    `https://api.example.com/posts/${params.slug}`
  ).then(r => r.json())

  if (!post) {
    notFound() // 触发not-found.tsx
  }

  return <article>{post.title}</article>
}
```

### 实战案例：基础博客应用

让我们创建一个完整的博客应用，展示App Router的所有核心概念。

#### 1. 项目结构

```
app/
├── (blog)/                 # 路由组：博客相关
│   ├── layout.tsx         # 博客布局
│   ├── page.tsx           # 首页
│   ├── blog/
│   │   ├── page.tsx       # 博客列表
│   │   ├── [slug]/
│   │   │   ├── page.tsx   # 博客详情
│   │   │   └── edit/
│   │   │       └── page.tsx # 编辑文章
│   │   └── new/
│   │       └── page.tsx   # 新建文章
│   └── about/
│       └── page.tsx       # 关于页面
├── (auth)/                # 路由组：认证相关
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── api/                   # API路由
│   └── posts/
│       └── route.ts
├── layout.tsx             # 根布局
├── loading.tsx            # 全局加载状态
├── error.tsx              # 全局错误处理
└── not-found.tsx          # 404页面
```

#### 2. 根布局

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: '我的博客',
    template: '%s | 我的博客',
  },
  description: '使用Next.js 14 App Router构建的博客',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body className="min-h-screen bg-gray-50">
        <div className="min-h-screen flex flex-col">
          {/* 全局头部 */}
          <GlobalHeader />

          {/* 主内容 */}
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>

          {/* 全局页脚 */}
          <GlobalFooter />
        </div>
      </body>
    </html>
  )
}

// 全局头部组件
function GlobalHeader() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">我的博客</h1>

          <ul className="flex space-x-6">
            <li>
              <a
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                首页
              </a>
            </li>
            <li>
              <a
                href="/blog"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                文章
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                关于
              </a>
            </li>
          </ul>

          <div className="flex items-center space-x-4">
            <a
              href="/login"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              登录
            </a>
            <a
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              注册
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}

// 全局页脚组件
function GlobalFooter() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">关于博客</h3>
            <p className="text-gray-400">
              使用Next.js 14构建的现代化博客应用
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  首页
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-white transition-colors">
                  文章
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white transition-colors">
                  关于
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">联系方式</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: example@email.com</li>
              <li>GitHub: @username</li>
              <li>Twitter: @username</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} 我的博客. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
```

#### 3. 博客布局

```typescript
// app/(blog)/layout.tsx
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-6xl mx-auto">
      {/* 博客侧边栏 */}
      <aside className="mb-8 p-6 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">分类</h3>
        <ul className="space-y-2">
          <li>
            <a href="/blog?category=tech" className="text-gray-700 hover:text-blue-600">
              技术
            </a>
          </li>
          <li>
            <a href="/blog?category=life" className="text-gray-700 hover:text-blue-600">
              生活
            </a>
          </li>
          <li>
            <a href="/blog?category=travel" className="text-gray-700 hover:text-blue-600">
              旅行
            </a>
          </li>
        </ul>
      </aside>

      {/* 博客内容 */}
      <div>{children}</div>
    </div>
  )
}
```

#### 4. 首页

```typescript
// app/(blog)/page.tsx
import Link from 'next/link'

export default function HomePage() {
  const recentPosts = [
    {
      id: 1,
      title: 'Next.js 14 完全指南',
      excerpt: '深入了解Next.js 14的所有新特性',
      date: '2024-01-15',
      author: '张三',
    },
    {
      id: 2,
      title: 'React Server Components',
      excerpt: '掌握React Server Components的核心概念',
      date: '2024-01-14',
      author: '李四',
    },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          欢迎来到我的博客
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          分享技术知识，记录学习心得
        </p>
        <Link
          href="/blog"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          浏览文章
        </Link>
      </section>

      {/* Recent Posts */}
      <section>
        <h2 className="text-3xl font-bold mb-6">最新文章</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {recentPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <article className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-3 hover:text-blue-600">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span className="mx-2">•</span>
                  <time>{post.date}</time>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
```

#### 5. 博客列表页

```typescript
// app/(blog)/blog/page.tsx
import Link from 'next/link'

// 模拟数据获取
async function getPosts() {
  const posts = [
    {
      id: '1',
      title: 'Next.js 14 完全指南',
      excerpt: '深入了解Next.js 14的所有新特性和最佳实践',
      content: '完整的文章内容...',
      author: '张三',
      date: '2024-01-15',
      category: '技术',
    },
    {
      id: '2',
      title: 'React Server Components',
      excerpt: '掌握React Server Components的核心概念和使用方法',
      content: '完整的文章内容...',
      author: '李四',
      date: '2024-01-14',
      category: '技术',
    },
  ]

  return posts
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">博客文章</h1>
        <Link
          href="/blog/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          新建文章
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.id}`}>
            <article className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full mb-4">
                {post.category}
              </span>

              <h2 className="text-2xl font-bold mb-3 hover:text-blue-600">
                {post.title}
              </h2>

              <p className="text-gray-600 mb-4">{post.excerpt}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{post.author}</span>
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('zh-CN')}
                </time>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

#### 6. 博客详情页

```typescript
// app/(blog)/blog/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getPost(slug: string) {
  const posts = {
    '1': {
      id: '1',
      title: 'Next.js 14 完全指南',
      content: '# Next.js 14\n\n详细的Markdown内容...',
      author: '张三',
      date: '2024-01-15',
      category: '技术',
    },
    '2': {
      id: '2',
      title: 'React Server Components',
      content: '# React Server Components\n\n详细的Markdown内容...',
      author: '李四',
      date: '2024-01-14',
      category: '技术',
    },
  }

  return posts[slug as keyof typeof posts] || null
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto">
      <Link
        href="/blog"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回列表
      </Link>

      <header className="mb-8 pb-8 border-b">
        <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full mb-4">
          {post.category}
        </span>

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-6 text-gray-600">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
              {post.author[0]}
            </div>
            <span>{post.author}</span>
          </div>

          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('zh-CN')}
          </time>
        </div>
      </header>

      <div className="prose prose-lg max-w-none">
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>

      <footer className="mt-12 pt-8 border-t flex justify-between">
        <Link href="/blog" className="text-blue-600 hover:text-blue-700">
          ← 查看更多文章
        </Link>

        <Link
          href={`/blog/${params.slug}/edit`}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          编辑文章
        </Link>
      </footer>
    </article>
  )
}
```

#### 7. 加载状态

```typescript
// app/(blog)/blog/loading.tsx
export default function BlogLoading() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">博客文章</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### 8. 错误处理

```typescript
// app/(blog)/blog/error.tsx
'use client'

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        加载文章失败
      </h2>
      <p className="text-gray-600 mb-6">
        {error.message || '发生了一些错误，请稍后再试'}
      </p>
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        重试
      </button>
    </div>
  )
}
```

### 最佳实践

#### 1. 文件组织

```typescript
// ✅ 推荐：使用路由组组织相关页面
app/
├── (public)/
│   ├── about/
│   └── contact/
├── (dashboard)/
│   ├── analytics/
│   └── settings/
└── (auth)/
    ├── login/
    └── register/

// ❌ 不推荐：扁平化所有页面
app/
├── about/
├── contact/
├── analytics/
├── settings/
├── login/
└── register/
```

#### 2. 布局设计

```typescript
// ✅ 推荐：细粒度的布局控制
app/
├── layout.tsx           # 全局布局
├── (dashboard)/
│   └── layout.tsx       # Dashboard特定布局
└── (blog)/
    └── layout.tsx       # Blog特定布局

// ❌ 不推荐：在一个布局文件中处理所有逻辑
app/
└── layout.tsx           # 包含所有路由的判断逻辑
```

#### 3. 数据获取

```typescript
// ✅ 推荐：在Server Component中直接fetch
export default async function Page() {
  const data = await fetch('https://api.example.com/data').then(r => r.json())
  return <div>{data.title}</div>
}

// ❌ 不推荐：使用useEffect获取数据
'use client'
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  }, [])
  return <div>{data?.title}</div>
}
```

### 本章小结

| 概念 | 用途 | 关键点 |
|------|------|--------|
| **app目录** | App Router的根目录 | 包含所有路由和布局 |
| **路由组** | 组织文件而不影响URL | 使用括号`(group)` |
| **动态路由** | 处理动态URL参数 | 使用`[param]`语法 |
| **Layouts** | 共享UI | 保持状态、不重新渲染 |
| **Templates** | 临时UI | 每次导航重新渲染 |
| **Loading** | 加载状态 | 自动Suspense边界 |
| **Error** | 错误处理 | 必须是Client Component |
| **Not-Found** | 404页面 | 可编程触发 |

---

**下一步学习**：建议继续学习[Pages Router与App Router对比](./chapter-83)了解两种路由系统的详细对比。
