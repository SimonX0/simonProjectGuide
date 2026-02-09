# 布局与模板系统

## 布局与模板系统

> **学习目标**：掌握Next.js的布局和模板系统，能够构建复杂的嵌套布局UI
> **核心内容**：Root Layout、嵌套布局、Templates、布局模式、实战案例

### 布局系统概述

#### 什么是Layout

**Layout（布局）** 是Next.js App Router中用于在多个页面之间共享UI的机制。布局在路由切换时保持状态，不会重新渲染。

```
┌─────────────────────────────────────────────────────────────┐
│                   布局渲染流程                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户导航: / → /about → /blog → /about                       │
│                                                             │
│  Root Layout (保持状态)                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  <html>                                              │   │
│  │    <body>                                            │   │
│  │      <Navbar />          (保持)                      │   │
│  │      [About Layout]      (重新挂载)                   │   │
│  │        <Sidebar />       (保持)                      │   │
│  │        <Page Content />  (切换)                      │   │
│  │      <Footer />          (保持)                      │   │
│  │    </body>                                          │   │
│  │  </html>                                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Layout vs Template

| 特性 | Layout | Template |
|------|--------|----------|
| **状态保持** | ✅ 是 | ❌ 否 |
| **重新渲染** | ❌ 否 | ✅ 每次导航都渲染 |
| **挂载** | 一次 | 每次导航 |
| **适合场景** | 导航、侧边栏 | 动画、表单重置 |
| **文件名** | `layout.tsx` | `template.tsx` |

### Root Layout（根布局）

#### 基础配置

每个Next.js应用都必须有根布局：

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
      <body>{children}</body>
    </html>
  )
}
```

#### 完整的Root Layout示例

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  // 基础元数据
  title: {
    default: '我的应用',
    template: '%s | 我的应用',
  },
  description: '使用Next.js 14构建的现代化Web应用',
  keywords: ['Next.js', 'React', 'TypeScript'],
  authors: [{ name: 'Your Name', url: 'https://example.com' }],
  creator: 'Your Name',
  publisher: 'Your Company',

  // 图标
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // Manifest
  manifest: '/manifest.json',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://example.com',
    title: '我的应用',
    description: '使用Next.js 14构建的现代化Web应用',
    siteName: '我的应用',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '我的应用',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: '我的应用',
    description: '使用Next.js 14构建的现代化Web应用',
    images: ['/twitter-image.png'],
    creator: '@username',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // 验证
  verification: {
    google: 'verification-token',
    yandex: 'verification-token',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          <GlobalHeader />
          <main className="flex-1">{children}</main>
          <GlobalFooter />
        </div>

        {/* Toast容器 */}
        <div id="toast-container" />
      </body>
    </html>
  )
}

// 全局头部组件
function GlobalHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <a href="/" className="text-2xl font-bold">
            Logo
          </a>

          <ul className="flex space-x-6">
            <li><a href="/">首页</a></li>
            <li><a href="/about">关于</a></li>
            <li><a href="/blog">博客</a></li>
            <li><a href="/contact">联系</a></li>
          </ul>

          <div className="flex items-center space-x-4">
            <a href="/login">登录</a>
            <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded">
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
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">关于我们</h3>
            <p className="text-gray-400 text-sm">
              提供优质产品和服务的公司
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/about" className="hover:text-white">关于</a></li>
              <li><a href="/blog" className="hover:text-white">博客</a></li>
              <li><a href="/careers" className="hover:text-white">招聘</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">支持</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/help" className="hover:text-white">帮助中心</a></li>
              <li><a href="/contact" className="hover:text-white">联系我们</a></li>
              <li><a href="/privacy" className="hover:text-white">隐私政策</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">关注我们</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">微信</a>
              <a href="#" className="text-gray-400 hover:text-white">微博</a>
              <a href="#" className="text-gray-400 hover:text-white">GitHub</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} 我的公司. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
```

### 嵌套布局

#### 基础嵌套

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <nav>
          <a href="/dashboard">概览</a>
          <a href="/dashboard/settings">设置</a>
          <a href="/dashboard/analytics">分析</a>
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
```

**布局层次结构**：

```
URL: /dashboard
├── app/layout.tsx (Root Layout)
│   └── app/dashboard/layout.tsx (Dashboard Layout)
│       └── app/dashboard/page.tsx (Dashboard Page)

URL: /dashboard/settings
├── app/layout.tsx (Root Layout)
│   └── app/dashboard/layout.tsx (Dashboard Layout)
│       └── app/dashboard/settings/page.tsx (Settings Page)
```

#### 多层嵌套布局

```typescript
// app/(app)/layout.tsx - 应用布局
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app">
      <AppNavbar />
      {children}
    </div>
  )
}

// app/(app)/(dashboard)/layout.tsx - 仪表盘布局
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        {children}
      </div>
    </div>
  )
}

// app/(app)/(dashboard)/settings/layout.tsx - 设置布局
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="settings">
      <SettingsNav />
      {children}
    </div>
  )
}
```

**渲染结果**：

```
URL: /app/dashboard/settings/profile
渲染:
├── app/layout.tsx
│   └── app/(app)/layout.tsx
│       └── app/(app)/(dashboard)/layout.tsx
│           └── app/(app)/(dashboard)/settings/layout.tsx
│               └── app/(app)/(dashboard)/settings/profile/page.tsx
```

### 模板（Templates）

#### Template vs Layout

```typescript
// app/template.tsx
'use client'

import { useState, useEffect } from 'react'

export default function Template({
  children,
}: {
  children: React.ReactNode
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // ✅ 每次导航都会执行
    console.log('Template重新挂载')
    setCount(0)
  }, [])

  return (
    <div className="template">
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      {children}
    </div>
  )
}
```

**行为对比**：

```typescript
// app/layout.tsx - Layout
'use client'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Layout计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>Layout增加</button>
      {children}
    </div>
  )
}

// app/template.tsx - Template
'use client'

export default function Template({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Template计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>Template增加</button>
      {children}
    </div>
  )
}

// 从 /page1 导航到 /page2
// Layout计数保持不变（状态保持）
// Template计数重置为0（每次重新挂载）
```

#### Template使用场景

**场景1：动画重播**：

```typescript
// app/template.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'

export default function Template({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={Math.random()} // 强制重新挂载
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

**场景2：表单重置**：

```typescript
// app/form/template.tsx
'use client'

import { createContext, useContext } from 'react'

const FormContext = createContext({
  reset: () => {},
})

export function useForm() {
  return useContext(FormContext)
}

export default function FormTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  const reset = () => {
    // 每次导航重置表单状态
    console.log('表单已重置')
  }

  return (
    <FormContext.Provider value={{ reset }}>
      {children}
    </FormContext.Provider>
  )
}
```

### 高级布局模式

#### 1. 认证布局

```typescript
// app/(auth)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">欢迎</h1>
          <p className="text-gray-600">请登录或注册</p>
        </div>
        {children}
      </div>
    </div>
  )
}
```

#### 2. Dashboard布局

```typescript
// app/(dashboard)/layout.tsx
import Link from 'next/link'
import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const navigation = [
    { name: '概览', href: '/dashboard', icon: '📊' },
    { name: '项目', href: '/dashboard/projects', icon: '📁' },
    { name: '团队', href: '/dashboard/team', icon: '👥' },
    { name: '设置', href: '/dashboard/settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          </div>

          {/* 导航 */}
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                <span className="text-xl mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* 用户信息 */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {session.user.name[0]}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-400">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区域 */}
      <div className="pl-64">
        {/* 顶部导航 */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">仪表盘</h2>

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                🔔
              </button>
              <Link
                href="/logout"
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                退出
              </Link>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

#### 3. 多主题布局

```typescript
// app/(light)/layout.tsx
export default function LightLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="theme-light min-h-screen bg-white text-gray-900">
      {children}
    </div>
  )
}

// app/(dark)/layout.tsx
export default function DarkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="theme-dark min-h-screen bg-gray-900 text-white">
      {children}
    </div>
  )
}
```

### 实战案例：多布局应用

让我们创建一个完整的SaaS应用，展示多种布局模式。

#### 项目结构

```
app/
├── (marketing)/              # 营销网站
│   ├── layout.tsx           # 营销布局
│   ├── page.tsx             # 首页
│   ├── pricing/
│   │   └── page.tsx         # 定价页
│   └── about/
│       └── page.tsx         # 关于页
├── (app)/                   # 应用主界面
│   ├── layout.tsx           # 应用布局
│   ├── (dashboard)/         # 仪表盘
│   │   ├── layout.tsx       # Dashboard布局
│   │   ├── page.tsx         # 概览
│   │   ├── projects/
│   │   │   ├── page.tsx     # 项目列表
│   │   │   └── [id]/
│   │   │       └── page.tsx # 项目详情
│   │   └── settings/
│   │       ├── layout.tsx   # 设置布局
│   │       ├── page.tsx     # 通用设置
│   │       ├── profile/
│   │       │   └── page.tsx
│   │       └── billing/
│   │           └── page.tsx
│   └── (onboarding)/        # 新手引导
│       ├── layout.tsx       # 引导布局
│       └── step-[number]/
│           └── page.tsx
├── (auth)/                  # 认证页面
│   ├── layout.tsx           # 认证布局
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── layout.tsx               # 根布局
└── page.tsx                 # 首页
```

#### 1. 根布局

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
```

#### 2. 营销布局

```typescript
// app/(marketing)/layout.tsx
import Link from 'next/link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* 营销导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            SaaS产品
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-gray-700 hover:text-blue-600">
              功能
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-blue-600">
              定价
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600">
              关于
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">
              联系
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              免费试用
            </Link>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main>{children}</main>

      {/* 营销页脚 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">产品</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">功能</Link></li>
                <li><Link href="/pricing" className="hover:text-white">定价</Link></li>
                <li><Link href="/integrations" className="hover:text-white">集成</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">公司</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">关于</Link></li>
                <li><Link href="/blog" className="hover:text-white">博客</Link></li>
                <li><Link href="/careers" className="hover:text-white">招聘</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">支持</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">帮助中心</Link></li>
                <li><Link href="/docs" className="hover:text-white">文档</Link></li>
                <li><Link href="/contact" className="hover:text-white">联系</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">法律</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">隐私政策</Link></li>
                <li><Link href="/terms" className="hover:text-white">服务条款</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} SaaS产品. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
```

#### 3. 应用布局

```typescript
// app/(app)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import AppNavbar from '@/components/AppNavbar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar user={session.user} />
      {children}
    </div>
  )
}
```

#### 4. Dashboard布局

```typescript
// app/(app)/(dashboard)/layout.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { org?: string }
}) {
  // 验证组织
  if (params.org) {
    // 检查用户是否有权限访问该组织
    const hasAccess = await checkOrgAccess(params.org)
    if (!hasAccess) {
      notFound()
    }
  }

  const navigation = [
    {
      name: '概览',
      href: `/dashboard/${params.org || ''}`,
      icon: '📊',
    },
    {
      name: '项目',
      href: `/dashboard/${params.org || ''}/projects`,
      icon: '📁',
    },
    {
      name: '团队',
      href: `/dashboard/${params.org || ''}/team`,
      icon: '👥',
    },
    {
      name: '设置',
      href: `/dashboard/${params.org || ''}/settings`,
      icon: '⚙️',
    },
  ]

  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="text-xl font-bold">
            SaaS产品
          </Link>
        </div>

        {/* 导航 */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* 组织切换 */}
        <div className="p-4 border-t border-gray-800">
          <OrgSwitcher />
        </div>
      </aside>

      {/* 主内容 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">仪表盘</h1>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              🔔
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              💬
            </button>
            <div className="w-px h-8 bg-gray-200" />
            <UserMenu />
          </div>
        </header>

        {/* 内容 */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

async function checkOrgAccess(org: string): Promise<boolean> {
  // 实现组织权限检查
  return true
}
```

#### 5. 设置布局

```typescript
// app/(app)/(dashboard)/settings/layout.tsx
import Link from 'next/link'

const settingsNav = [
  { name: '通用', href: 'general', icon: '⚙️' },
  { name: '个人资料', href: 'profile', icon: '👤' },
  { name: '账户', href: 'account', icon: '🔐' },
  { name: '通知', href: 'notifications', icon: '🔔' },
  { name: '账单', href: 'billing', icon: '💳' },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">设置</h1>
        <p className="text-gray-600">管理你的账户和偏好设置</p>
      </div>

      <div className="flex gap-8">
        {/* 设置导航 */}
        <aside className="w-64">
          <nav className="space-y-1">
            {settingsNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* 设置内容 */}
        <div className="flex-1 max-w-3xl">
          {children}
        </div>
      </div>
    </div>
  )
}
```

#### 6. 认证布局

```typescript
// app/(auth)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            SaaS产品
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            欢迎回来
          </p>
        </div>

        {/* 表单容器 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {children}
        </div>

        {/* 底部链接 */}
        <div className="text-center text-sm text-gray-600">
          <p>
            遇到问题？
            <a href="/help" className="text-blue-600 hover:text-blue-700 font-medium">
              联系支持
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 布局最佳实践

#### 1. 布局文件组织

```typescript
// ✅ 推荐：清晰的层次结构
app/
├── layout.tsx                # 根布局（必需）
├── (marketing)/
│   └── layout.tsx           # 营销布局
├── (app)/
│   ├── layout.tsx           # 应用布局
│   ├── (dashboard)/
│   │   └── layout.tsx       # Dashboard布局
│   └── (onboarding)/
│       └── layout.tsx       # 引导布局
└── (auth)/
    └── layout.tsx           # 认证布局

// ❌ 不推荐：过度分散
app/
├── layout1.tsx
├── layout2.tsx
└── layout3.tsx
```

#### 2. 状态管理

```typescript
// ✅ 推荐：在布局中保持状态
'use client'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div>
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>
        切换侧边栏
      </button>
      {sidebarOpen && <Sidebar />}
      {children}
    </div>
  )
}

// ❌ 不推荐：在每次导航时重置状态
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
```

#### 3. 数据获取

```typescript
// ✅ 推荐：在布局中获取共享数据
export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div>
      <Header user={user} />
      {children}
      <Footer />
    </div>
  )
}

// ❌ 不推荐：在每个页面重复获取相同数据
export default async function Page() {
  const user = await getCurrentUser()
  return <div><Header user={user} /></div>
}
```

### 本章小结

| 布局类型 | 文件位置 | 特性 | 使用场景 |
|---------|---------|------|---------|
| **Root Layout** | `app/layout.tsx` | 根布局，必需 | HTML/body标签、全局导航 |
| **嵌套Layout** | `app/*/layout.tsx` | 多层嵌套 | Dashboard、设置页面 |
| **路由组Layout** | `app/(group)/layout.tsx` | 不影响URL | 不同主题、认证级别 |
| **Template** | `app/template.tsx` | 每次重新渲染 | 动画、表单重置 |

---

**下一步学习**：建议继续学习[链接与导航](./chapter-86)深入了解Next.js的导航系统。
