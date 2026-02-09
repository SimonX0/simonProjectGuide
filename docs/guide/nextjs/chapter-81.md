# Next.js 14+简介与环境搭建

## Next.js 14+简介与环境搭建

> **学习目标**：掌握Next.js 14+框架基础，能够独立搭建完整的开发环境
> **核心内容**：Next.js核心特性、环境搭建、项目结构、开发命令、实战应用

### Next.js概述

#### 什么是Next.js

**Next.js** 是一个基于React的现代化全栈框架，提供了服务器端渲染（SSR）、静态站点生成（SSG）、API路由、文件路由等强大功能。Next.js 14+版本引入了App Router、Server Components等革命性特性。

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 14+ 架构                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              App Router (app/)                       │   │
│  │  ┌──────────────┐  ┌──────────────┐                 │   │
│  │  │ React Server │  │ Server       │                 │   │
│  │  │ Components   │  │ Actions      │                 │   │
│  │  └──────────────┘  └──────────────┘                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Rendering Strategies                        │   │
│  │  ┌──────────────┐  ┌──────────────┐                 │   │
│  │  │ SSR / SSG    │  │ ISR / CSP    │                 │   │
│  │  └──────────────┘  └──────────────┘                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Data Fetching & Caching                     │   │
│  │  ┌──────────────┐  ┌──────────────┐                 │   │
│  │  │ fetch() API  │  │ Cache        │                 │   │
│  │  └──────────────┘  └──────────────┘                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Next.js 14+核心特性

| 特性 | 说明 | 优势 |
|------|------|------|
| **App Router** | 新的路由系统 | 更灵活的布局、Server Components |
| **Server Components** | React Server Components | 更好的性能、更小的客户端bundle |
| **Server Actions** | 服务端数据变更 | 简化表单处理、无需API路由 |
| **Streaming** | 渐进式渲染 | 更快的TTI（Time to Interactive） |
| **Partial Prerendering** | 部分预渲染 | 静态+动态混合渲染 |
| **Turbopack** | 新一代构建工具 | 开发启动速度提升700x |
| **Image优化** | 自动图片优化 | 更快的加载速度、更小的体积 |
| **Font优化** | 自动字体优化 | 零布局偏移、更好的性能 |

### 环境搭建

#### 系统要求

开始Next.js开发前，确保你的环境满足以下要求：

```bash
# Node.js版本要求
Node.js >= 18.17.0  # 推荐使用20.x LTS版本

# 推荐的包管理器
npm >= 9.0.0
yarn >= 1.22.0
pnpm >= 8.0.0
bun >= 1.0.0

# 操作系统
Windows 10/11
macOS 12+
Linux (主流发行版)
```

#### 安装方式

##### 方式1：使用create-next-app（推荐）

```bash
# 使用npm
npx create-next-app@latest my-nextjs-app

# 使用yarn
yarn create next-app my-nextjs-app

# 使用pnpm
pnpm create next-app my-nextjs-app

# 使用Bun（最快）
bun create next-app my-nextjs-app
```

**交互式安装提示**：

```bash
Would you like to use TypeScript?  Yes
Would you like to use ESLint?     Yes
Would you like to use Tailwind?   Yes
Would you like to use `src/`?     Yes
Would you like to use App Router? Yes (推荐)
Would you like to customize default import alias? No
```

##### 方式2：手动创建项目

```bash
# 1. 创建项目目录
mkdir my-nextjs-app
cd my-nextjs-app

# 2. 初始化package.json
npm init -y

# 3. 安装Next.js、React、TypeScript
npm install next@latest react@latest react-dom@latest

# 4. 安装开发依赖
npm install -D typescript @types/react @types/node

# 5. 创建基础目录结构
mkdir -p src/app
```

**package.json配置**：

```json
{
  "name": "my-nextjs-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.0.0"
  }
}
```

#### TypeScript配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### Next.js配置

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 实验性功能
  experimental: {
    // 启用Turbopack（开发模式）
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 编译配置
  swcMinify: true,

  // 严格模式
  reactStrictMode: true,

  // 输出配置
  output: 'standalone', // 用于Docker部署

  // 环境变量（可以在构建时访问）
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

export default nextConfig
```

### 项目结构详解

#### App Router项目结构

```
my-nextjs-app/
├── .next/                  # Next.js构建输出目录
├── node_modules/           # 依赖包
├── public/                 # 静态资源目录
│   ├── images/            # 图片文件
│   ├── fonts/             # 字体文件
│   └── favicon.ico        # 网站图标
├── src/                    # 源代码目录（可选）
│   ├── app/               # App Router目录
│   │   ├── (main)/       # 路由组
│   │   │   ├── about/    # /about路由
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/          # API路由
│   │   │   └── users/
│   │   │       └── route.ts
│   │   ├── globals.css   # 全局样式
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 首页
│   ├── components/       # React组件
│   │   ├── ui/          # UI组件
│   │   └── features/    # 功能组件
│   ├── lib/             # 工具库
│   │   ├── utils.ts    # 通用工具
│   │   └── db.ts       # 数据库配置
│   ├── styles/          # 样式文件
│   ├── types/           # TypeScript类型定义
│   └── hooks/           # 自定义Hooks
├── .env.local           # 本地环境变量
├── .eslintrc.json       # ESLint配置
├── .gitignore          # Git忽略文件
├── next.config.ts      # Next.js配置
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript配置
└── README.md           # 项目说明
```

#### 重要目录说明

**app目录**：
- `layout.tsx` - 布局文件，定义共享的UI
- `page.tsx` - 页面文件，定义UI内容
- `loading.tsx` - 加载状态文件
- `error.tsx` - 错误处理文件
- `not-found.tsx` - 404页面
- `route.ts` - API路由处理器

**public目录**：
- 直接通过根路径访问
- 不会被Next.js处理
- 适合存放favicon、logo、robots.txt等

### 开发命令详解

#### 基础命令

```bash
# 开发模式（带Turbopack）
npm run dev

# 等同于
next dev --turbo

# 指定端口
next dev -p 3001

# 指定主机名
next dev -H 192.168.1.100

# 生产构建
npm run build

# 生产环境运行
npm run start

# 生产模式运行（指定端口）
next start -p 3001

# Lint检查
npm run lint

# Lint自动修复
next lint --fix
```

#### 高级命令

```bash
# 查看Next.js信息
next info

# 清理缓存
rm -rf .next

# 创建新页面
mkdir -p src/app/about
touch src/app/about/page.tsx

# TypeScript类型检查
tsc --noEmit

# 仅构建分析
ANALYZE=true npm run build

# 导出静态站点
npm run build
# 需要在next.config.ts中设置 output: 'export'
```

### 核心概念快速入门

#### 1. Server Components vs Client Components

**Server Components（默认）**：

```typescript
// src/app/page.tsx
// ✅ Server Component（默认）
async function BlogPosts() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <main>
      <h1>Blog</h1>
      <BlogPosts />
    </main>
  )
}
```

**Client Components**：

```typescript
// src/components/SearchBar.tsx
'use client'  // ✅ 必须添加'use client'指令

import { useState } from 'react'

export function SearchBar() {
  const [query, setQuery] = useState('')

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="搜索..."
    />
  )
}
```

**使用场景对比**：

| 场景 | Server Component | Client Component |
|------|-----------------|------------------|
| 数据获取 | ✅ 推荐 | ❌ 不推荐 |
| 交互（useState） | ❌ 不支持 | ✅ 支持 |
| 浏览器API | ❌ 不支持 | ✅ 支持 |
| Effect hooks | ❌ 不支持 | ✅ 支持 |
| 第三方UI库 | ⚠️ 部分支持 | ✅ 完全支持 |

#### 2. 路由基础

```typescript
// src/app/page.tsx        → /
// src/app/about/page.tsx  → /about
// src/app/blog/page.tsx   → /blog
// src/app/blog/[id]/page.tsx → /blog/123, /blog/abc
```

**动态路由示例**：

```typescript
// src/app/blog/[slug]/page.tsx
interface Props {
  params: {
    slug: string
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = params

  const post = await fetch(`https://api.example.com/posts/${slug}`)
    .then(r => r.json())

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

#### 3. 布局系统

```typescript
// src/app/layout.tsx - 根布局
import './globals.css'

export const metadata = {
  title: 'My Next.js App',
  description: 'Built with Next.js 14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <nav>导航栏</nav>
        {children}
        <footer>页脚</footer>
      </body>
    </html>
  )
}
```

```typescript
// src/app/dashboard/layout.tsx - 嵌套布局
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

### 实战案例：第一个Next.js应用

让我们创建一个简单的博客应用，涵盖Next.js的核心概念。

#### 项目设置

```bash
# 创建项目
npx create-next-app@latest my-blog
cd my-blog

# 安装额外依赖
npm install date-fns clsx tailwind-merge
```

#### 1. 全局样式配置

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

#### 2. 根布局

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '我的博客 - Next.js 14',
  description: '使用Next.js 14构建的现代化博客',
  keywords: ['Next.js', 'React', 'Blog'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: '我的博客',
    description: '使用Next.js 14构建的现代化博客',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}

// Header组件
function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">我的博客</h1>
          <ul className="flex space-x-6">
            <li>
              <a href="/" className="hover:text-blue-600 transition-colors">
                首页
              </a>
            </li>
            <li>
              <a href="/blog" className="hover:text-blue-600 transition-colors">
                文章
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-blue-600 transition-colors">
                关于
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

// Footer组件
function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} 我的博客. Built with Next.js 14
        </p>
      </div>
    </footer>
  )
}
```

#### 3. 首页

```typescript
// src/app/page.tsx
import Link from 'next/link'

export default function Home() {
  const features = [
    {
      title: 'Server Components',
      description: '默认使用React Server Components，提供更好的性能',
    },
    {
      title: 'App Router',
      description: '全新的路由系统，支持更灵活的布局和嵌套',
    },
    {
      title: 'Server Actions',
      description: '简化表单处理和数据变更，无需API路由',
    },
    {
      title: 'Turbopack',
      description: '新一代构建工具，开发速度提升700x',
    },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          欢迎使用 Next.js 14
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          最强大的React全栈框架，让你轻松构建现代化的Web应用
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/blog"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            查看文章
          </Link>
          <Link
            href="/about"
            className="border border-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            了解更多
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">核心特性</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-3 text-blue-600">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">14+</div>
            <div className="text-gray-600 dark:text-gray-400">主版本</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">700x</div>
            <div className="text-gray-600 dark:text-gray-400">更快的开发体验</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600 mb-2">100k+</div>
            <div className="text-gray-600 dark:text-gray-400">GitHub Stars</div>
          </div>
        </div>
      </section>
    </div>
  )
}
```

#### 4. 博客列表页

```typescript
// src/app/blog/page.tsx
import Link from 'next/link'

// 模拟数据（实际应该从API获取）
const posts = [
  {
    id: 1,
    title: 'Next.js 14 新特性详解',
    excerpt: '深入了解Next.js 14的App Router、Server Components等新特性',
    date: '2024-01-15',
    author: '张三',
    category: 'Next.js',
  },
  {
    id: 2,
    title: 'React Server Components 完全指南',
    excerpt: '掌握React Server Components的核心概念和最佳实践',
    date: '2024-01-14',
    author: '李四',
    category: 'React',
  },
  {
    id: 3,
    title: 'TypeScript 最佳实践',
    excerpt: '提升代码质量的TypeScript使用技巧和模式',
    date: '2024-01-13',
    author: '王五',
    category: 'TypeScript',
  },
  {
    id: 4,
    title: '全栈开发实战',
    excerpt: '使用Next.js构建完整的全栈Web应用',
    date: '2024-01-12',
    author: '赵六',
    category: 'Full Stack',
  },
]

export default function BlogPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">博客文章</h1>
        <p className="text-gray-600 dark:text-gray-400">
          分享技术知识和开发经验
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            <Link href={`/blog/${post.id}`}>
              <div className="p-6">
                {/* Category Badge */}
                <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full mb-4">
                  {post.category}
                </span>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-3 hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{post.author}</span>
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('zh-CN')}
                  </time>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          上一页
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          1
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          2
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          3
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          下一页
        </button>
      </div>
    </div>
  )
}
```

#### 5. 博客详情页

```typescript
// src/app/blog/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'

// 模拟数据获取
async function getPost(id: string) {
  // 实际项目中应该从API或数据库获取
  const posts = {
    '1': {
      id: '1',
      title: 'Next.js 14 新特性详解',
      content: `
# Next.js 14 新特性详解

Next.js 14带来了许多激动人心的新特性...

## App Router

全新的App Router基于React Server Components构建...

## Server Actions

Server Actions简化了表单处理...

## Turbopack

Turbopack是新一代Rust构建工具...
      `,
      author: '张三',
      date: '2024-01-15',
      category: 'Next.js',
      readTime: '8 分钟',
    },
    '2': {
      id: '2',
      title: 'React Server Components 完全指南',
      content: '# React Server Components...',
      author: '李四',
      date: '2024-01-14',
      category: 'React',
      readTime: '10 分钟',
    },
  }

  return posts[id as keyof typeof posts] || null
}

export default async function BlogPost({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/blog"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        返回文章列表
      </Link>

      {/* Article Header */}
      <header className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full mb-4">
          {post.category}
        </span>

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
              {post.author[0]}
            </div>
            <span>{post.author}</span>
          </div>

          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('zh-CN')}
            </time>
          </div>

          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {post.readTime}
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>

      {/* Article Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 查看更多文章
          </Link>

          <div className="flex gap-4">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              分享
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              点赞
            </button>
          </div>
        </div>
      </footer>
    </article>
  )
}
```

#### 6. 关于页面

```typescript
// src/app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">关于我们</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">我们的使命</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          这是一个使用Next.js 14构建的现代化博客应用。我们致力于分享最新的前端技术知识，
          帮助开发者提升技能，构建更好的Web应用。
        </p>

        <h2 className="text-2xl font-bold mb-4">技术栈</h2>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Next.js 14 - React全栈框架
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            React 18 - UI库
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            TypeScript - 类型安全
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Tailwind CSS - 样式框架
          </li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">联系我们</h2>
        <p className="mb-6">
          如果你有任何问题或建议，欢迎通过以下方式联系我们：
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <a href="#" className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors">
            Email
          </a>
          <a href="#" className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors">
            GitHub
          </a>
          <a href="#" className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors">
            Twitter
          </a>
        </div>
      </div>
    </div>
  )
}
```

#### 7. 工具函数

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} 分钟`
}
```

### 开发最佳实践

#### 1. 代码组织

```typescript
// ✅ 推荐：按功能组织
src/
├── app/
├── components/
│   ├── ui/              # 可复用UI组件
│   └── features/        # 功能相关组件
├── lib/                 # 工具库
├── hooks/              # 自定义Hooks
└── types/              # 类型定义

// ❌ 不推荐：扁平化组织
src/
├── Button.tsx
├── Input.tsx
├── useAuth.ts
└── utils.ts
```

#### 2. Server Components优先

```typescript
// ✅ 推荐：默认使用Server Components
export default async function Page() {
  const data = await fetchData()
  return <div>{data.title}</div>
}

// ❌ 不推荐：不必要使用Client Components
'use client'
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetchData().then(setData)
  }, [])
  return <div>{data?.title}</div>
}
```

#### 3. 环境变量管理

```bash
# .env.local (本地开发，不提交到Git)
DATABASE_URL=postgresql://localhost/mydb
API_KEY=your-development-key

# .env.production (生产环境)
DATABASE_URL=postgresql://prod-server/mydb
API_KEY=your-production-key

# .env.example (示例文件，提交到Git)
DATABASE_URL=postgresql://localhost/mydb
API_KEY=your-api-key-here
```

```typescript
// 使用环境变量
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// 服务端专用变量（不会暴露给客户端）
const dbUrl = process.env.DATABASE_URL
```

### 常见问题解决

#### 1. Turbopack警告

```bash
# 如果遇到Turbopack相关警告
# 可以暂时禁用Turbopack
next dev
# 而不是
next dev --turbo
```

#### 2. 端口占用

```bash
# 查找占用端口的进程
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# 终止进程
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

#### 3. 构建错误

```bash
# 清理缓存和重新构建
rm -rf .next node_modules
npm install
npm run build
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| Next.js特性 | App Router、Server Components、Server Actions | 理解核心概念 |
| 环境搭建 | 创建项目、配置TypeScript、目录结构 | 能够独立搭建 |
| 开发命令 | dev、build、start、lint | 熟练使用 |
| 路由基础 | 文件路由、动态路由、布局 | 掌握基本用法 |
| 组件类型 | Server Components、Client Components | 理解区别和使用场景 |

---

**下一步学习**：建议继续学习[App Router核心概念](./chapter-82)深入了解Next.js 14的新路由系统。
