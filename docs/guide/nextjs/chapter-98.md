# 路由组与并行路由

## 路由组与并行路由

> **学习目标**：掌握Next.js高级路由组织方式，实现复杂的UI架构
> **核心内容**：路由组高级用法、并行路由（Parallel Routes）、默认路由、实战案例

### 路由组高级用法

#### 路由组深入

**路由组（Route Groups）** 允许你在不影响URL的情况下组织路由文件，通过使用括号`(group)`来创建。

```
┌─────────────────────────────────────────────────────────────┐
│                    路由组的作用与优势                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  文件系统                           URL映射                  │
│  ┌──────────────────────┐        ┌──────────────────────┐  │
│  │ app/(marketing)/     │        │                      │  │
│  │   about/             │        │ /about               │  │
│  │     page.tsx         │  →     │                      │  │
│  └──────────────────────┘        │ /contact             │  │
│  ┌──────────────────────┐        │                      │  │
│  │ app/(marketing)/     │        └──────────────────────┘  │
│  │   contact/           │                                    │
│  │     page.tsx         │   (marketing)不会出现在URL中       │
│  └──────────────────────┘                                    │
│                                                             │
│  优势:                                                      │
│  ✓ 组织相关文件                                             │
│  ✓ 共享布局而不影响URL                                       │
│  ✓ 逻辑分组提高可维护性                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 多根布局场景

**场景1：营销网站 vs 仪表盘**

```typescript
// app/(marketing)/layout.tsx
// 用于: /, /about, /contact, /pricing

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-site">
      {/* 营销网站头部 */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-blue-600">
              MyProduct
            </a>
            <div className="flex items-center gap-6">
              <a href="/features">功能</a>
              <a href="/pricing">价格</a>
              <a href="/about">关于</a>
              <a href="/contact">联系</a>
              <a
                href="/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                登录
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* 页面内容 */}
      <main>{children}</main>

      {/* 营销网站页脚 */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">产品</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/features">功能特性</a></li>
                <li><a href="/pricing">价格方案</a></li>
                <li><a href="/integrations">集成</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">公司</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about">关于我们</a></li>
                <li><a href="/careers">招聘</a></li>
                <li><a href="/blog">博客</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">支持</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/docs">文档</a></li>
                <li><a href="/help">帮助中心</a></li>
                <li><a href="/contact">联系我们</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">法律</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy">隐私政策</a></li>
                <li><a href="/terms">服务条款</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MyProduct. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
```

```typescript
// app/(dashboard)/layout.tsx
// 用于: /dashboard, /dashboard/settings, /dashboard/analytics

import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard h-screen flex">
      {/* 侧边栏 */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6">
          <Link href="/dashboard" className="text-2xl font-bold">
            Dashboard
          </Link>
        </div>

        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            <li>
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                概览
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/analytics"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                分析
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settings"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                设置
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">仪表盘</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  U
                </div>
                <span className="font-medium">用户</span>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
```

#### 路由组最佳实践

**按功能分组**：

```typescript
// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full">{children}</div>
    </div>
  )
}

// app/(auth)/login/page.tsx → /login
// app/(auth)/register/page.tsx → /register
// app/(auth)/forgot-password/page.tsx → /forgot-password
```

**按角色分组**：

```typescript
// app/(admin)/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 可以在这里添加权限检查
  return (
    <div className="admin-panel">
      <AdminSidebar />
      {children}
    </div>
  )
}

// app/(user)/layout.tsx
export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="user-panel">
      <UserSidebar />
      {children}
    </div>
  )
}
```

### 并行路由（Parallel Routes）

#### 并行路由基础

**什么是并行路由**：

并行路由允许你同时渲染多个页面，使用`@folder`语法创建。这对于创建独立更新的UI部分非常有用。

```
┌─────────────────────────────────────────────────────────────┐
│                    并行路由工作原理                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  文件系统                           UI布局                   │
│  ┌──────────────────────┐        ┌──────────────────────┐  │
│  │ app/dashboard/       │        │ ┌────────┬─────────┐ │  │
│  │   @analytics/        │        │ │        │         │ │  │
│  │     page.tsx         │  →     │ │Analytics│ Settings│ │  │
│  │   @settings/         │        │ │        │         │ │  │
│  │     page.tsx         │        │ │  独立   │  独立   │ │  │
│  │   layout.tsx         │        │ │  导航   │  导航   │ │  │
│  └──────────────────────┘        │ └────────┴─────────┘ │  │
│                                  └──────────────────────┘  │
│                                                             │
│  特性:                                                      │
│  ✓ 独立的导航历史                                           │
│  ✓ 独立的加载状态                                           │
│  ✓ 可以同时显示多个页面                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 基础并行路由

**Dashboard示例**：

```typescript
// app/dashboard/layout.tsx
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
    <div className="dashboard h-screen flex">
      {/* 侧边栏导航 */}
      <aside className="w-64 bg-gray-900 text-white">
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a href="/dashboard">概览</a>
            </li>
            <li>
              <a href="/dashboard/@analytics">分析</a>
            </li>
            <li>
              <a href="/dashboard/@settings">设置</a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* 主内容区 - 使用插槽显示并行路由 */}
      <main className="flex-1 flex">
        {/* 概览插槽 */}
        <div className="flex-1 p-6">
          {children}
        </div>

        {/* 分析插槽 */}
        {analytics && (
          <div className="w-1/3 p-6 border-l">
            {analytics}
          </div>
        )}

        {/* 设置插槽 */}
        {settings && (
          <div className="w-1/3 p-6 border-l">
            {settings}
          </div>
        )}
      </main>
    </div>
  )
}
```

```typescript
// app/dashboard/@analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">分析</h2>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">访问量统计</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>今日访问</span>
            <span className="font-bold">1,234</span>
          </div>
          <div className="flex justify-between">
            <span>本周访问</span>
            <span className="font-bold">8,567</span>
          </div>
          <div className="flex justify-between">
            <span>本月访问</span>
            <span className="font-bold">32,456</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">用户增长</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          图表占位符
        </div>
      </div>
    </div>
  )
}
```

```typescript
// app/dashboard/@settings/page.tsx
'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(false)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">设置</h2>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">通知设置</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span>启用通知</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between">
            <span>邮件更新</span>
            <input
              type="checkbox"
              checked={emailUpdates}
              onChange={(e) => setEmailUpdates(e.target.checked)}
              className="w-5 h-5"
            />
          </label>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">账户设置</h3>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          保存更改
        </button>
      </div>
    </div>
  )
}
```

#### 默认插槽

**未定义插槽的默认内容**：

```typescript
// app/dashboard/@analytics/default.tsx
export default function AnalyticsDefault() {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p>选择一个分析选项查看详情</p>
      </div>
    </div>
  )
}

// app/dashboard/@settings/default.tsx
export default function SettingsDefault() {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p>选择一个设置选项进行配置</p>
      </div>
    </div>
  )
}
```

#### 并行路由的导航

**使用Modal显示**：

```typescript
// app/modal/@login/page.tsx
'use client'

import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleClose = () => {
    router.back() // 关闭Modal，返回之前的路由
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">登录</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              邮箱
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              密码
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  )
}
```

### 实战案例：Dashboard应用

让我们创建一个完整的Dashboard应用，展示路由组和并行路由的强大功能。

#### 1. 项目结构

```
app/
├── (marketing)/              # 营销网站路由组
│   ├── layout.tsx
│   ├── page.tsx             # 首页 /
│   ├── about/
│   │   └── page.tsx         # /about
│   └── pricing/
│       └── page.tsx         # /pricing
├── (dashboard)/             # Dashboard路由组
│   ├── layout.tsx           # Dashboard布局
│   ├── dashboard/
│   │   ├── page.tsx         # /dashboard (概览)
│   │   ├── @overview/       # 并行路由: 概览
│   │   │   ├── page.tsx
│   │   │   └── default.tsx
│   │   ├── @analytics/      # 并行路由: 分析
│   │   │   ├── page.tsx
│   │   │   ├── visitors/
│   │   │   │   └── page.tsx
│   │   │   └── default.tsx
│   │   ├── @projects/       # 并行路由: 项目
│   │   │   ├── page.tsx
│   │   │   └── default.tsx
│   │   └── @team/           # 并行路由: 团队
│   │       ├── page.tsx
│   │       └── default.tsx
│   └── settings/
│       └── page.tsx         # /settings
└── layout.tsx               # 根布局
```

#### 2. Dashboard布局

```typescript
// app/(dashboard)/dashboard/layout.tsx
import Link from 'next/link'

export default function DashboardLayout({
  children,
  overview,
  analytics,
  projects,
  team,
}: {
  children: React.ReactNode
  overview: React.ReactNode
  analytics: React.ReactNode
  projects: React.ReactNode
  team: React.ReactNode
}) {
  // 获取当前激活的插槽
  const activeSlot = overview ? 'overview' : analytics ? 'analytics' : projects ? 'projects' : team ? 'team' : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              MyApp
            </Link>

            {/* 并行路由导航 */}
            <nav className="flex gap-6">
              <Link
                href="/dashboard"
                className={`font-medium transition-colors ${
                  activeSlot === 'overview' || activeSlot === null
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                概览
              </Link>
              <Link
                href="/dashboard/@analytics"
                className={`font-medium transition-colors ${
                  activeSlot === 'analytics'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                分析
              </Link>
              <Link
                href="/dashboard/@projects"
                className={`font-medium transition-colors ${
                  activeSlot === 'projects'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                项目
              </Link>
              <Link
                href="/dashboard/@team"
                className={`font-medium transition-colors ${
                  activeSlot === 'team'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                团队
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <div className="font-medium text-sm">John Doe</div>
                <div className="text-xs text-gray-500">管理员</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex">
        {/* 并行路由内容 */}
        <main className="flex-1 p-6">
          {activeSlot === 'overview' && overview}
          {activeSlot === 'analytics' && analytics}
          {activeSlot === 'projects' && projects}
          {activeSlot === 'team' && team}
          {!activeSlot && children}
        </main>

        {/* 侧边栏 */}
        <aside className="w-80 p-6 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">快速操作</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新建项目
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                邀请成员
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                生成报告
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h3 className="font-semibold mb-2">升级到Pro</h3>
            <p className="text-sm opacity-90 mb-4">
              解锁更多高级功能和无限制使用
            </p>
            <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-gray-100">
              立即升级
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
```

#### 3. 概览页面

```typescript
// app/(dashboard)/dashboard/@overview/page.tsx
export default function OverviewPage() {
  const stats = [
    {
      title: '总访问量',
      value: '45,231',
      change: '+20.1%',
      changeType: 'positive',
    },
    {
      title: '活跃用户',
      value: '2,345',
      change: '+15.3%',
      changeType: 'positive',
    },
    {
      title: '转化率',
      value: '3.24%',
      change: '-2.1%',
      changeType: 'negative',
    },
    {
      title: '总收入',
      value: '¥234,567',
      change: '+12.5%',
      changeType: 'positive',
    },
  ]

  const recentActivity = [
    { id: 1, user: '张三', action: '创建了新项目', time: '5分钟前' },
    { id: 2, user: '李四', action: '更新了个人资料', time: '15分钟前' },
    { id: 3, user: '王五', action: '完成了任务', time: '1小时前' },
    { id: 4, user: '赵六', action: '发布了评论', time: '2小时前' },
  ]

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">概览</h1>
        <p className="text-gray-600 mt-1">欢迎回来，这是您的仪表盘概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                {stat.title}
              </h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-3xl font-bold mb-2">{stat.value}</div>
            <div
              className={`text-sm ${
                stat.changeType === 'positive'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {stat.change} 较上月
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 图表区域 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">访问趋势</h2>
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>图表组件占位符</p>
            </div>
          </div>
        </div>

        {/* 最近活动 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">最近活动</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  {activity.user[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>
                    {' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 text-blue-600 hover:text-blue-700 text-sm font-medium">
            查看所有活动
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### 4. 分析页面

```typescript
// app/(dashboard)/dashboard/@analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">分析</h1>
        <p className="text-gray-600 mt-1">深入了解您的数据表现</p>
      </div>

      {/* 分析选项卡 */}
      <div className="border-b">
        <nav className="flex gap-8">
          <a
            href="/dashboard/@analytics"
            className="py-4 px-1 border-b-2 border-blue-600 text-blue-600 font-medium"
          >
            概览
          </a>
          <a
            href="/dashboard/@analytics/visitors"
            className="py-4 px-1 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
          >
            访客
          </a>
          <a
            href="#"
            className="py-4 px-1 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
          >
            转化
          </a>
          <a
            href="#"
            className="py-4 px-1 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
          >
            留存
          </a>
        </nav>
      </div>

      {/* 分析数据 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">
            页面浏览量
          </h3>
          <div className="text-3xl font-bold">123,456</div>
          <div className="text-green-600 text-sm mt-2">+12.5%</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">
            唯一访客
          </h3>
          <div className="text-3xl font-bold">45,678</div>
          <div className="text-green-600 text-sm mt-2">+8.3%</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">
            平均会话时长
          </h3>
          <div className="text-3xl font-bold">4m 32s</div>
          <div className="text-red-600 text-sm mt-2">-2.1%</div>
        </div>
      </div>

      {/* 顶部页面 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6">热门页面</h2>
        <div className="space-y-4">
          {[
            { page: '/home', views: '45,231', bounce: '23%' },
            { page: '/pricing', views: '12,456', bounce: '45%' },
            { page: '/about', views: '8,901', bounce: '32%' },
            { page: '/contact', views: '6,789', bounce: '67%' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <div className="font-medium">{item.page}</div>
                <div className="text-sm text-gray-500">{item.views} 次浏览</div>
              </div>
              <div className="text-sm">
                <span className={parseInt(item.bounce) < 30 ? 'text-green-600' : 'text-orange-600'}>
                  跳出率: {item.bounce}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### 5. 项目页面

```typescript
// app/(dashboard)/dashboard/@projects/page.tsx
import Link from 'next/link'

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      name: '网站重构',
      description: '使用Next.js重构公司官网',
      status: '进行中',
      progress: 65,
      team: ['张三', '李四', '王五'],
      dueDate: '2024-02-15',
    },
    {
      id: 2,
      name: '移动应用开发',
      description: '开发iOS和Android应用',
      status: '进行中',
      progress: 40,
      team: ['李四', '赵六'],
      dueDate: '2024-03-01',
    },
    {
      id: 3,
      name: 'API优化',
      description: '优化后端API性能',
      status: '已完成',
      progress: 100,
      team: ['王五'],
      dueDate: '2024-01-20',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">项目</h1>
          <p className="text-gray-600 mt-1">管理和跟踪您的所有项目</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          新建项目
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold">{project.name}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === '已完成'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">进度</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex -space-x-2">
                  {project.team.map((member, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      title={member}
                    >
                      {member[0]}
                    </div>
                  ))}
                </div>
                <span className="text-gray-500">
                  {new Date(project.dueDate).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

#### 6. 团队页面

```typescript
// app/(dashboard)/dashboard/@team/page.tsx
export default function TeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: '张三',
      role: '项目经理',
      email: 'zhangsan@example.com',
      avatar: 'Z',
      projects: 5,
      status: '在线',
    },
    {
      id: 2,
      name: '李四',
      role: '前端开发',
      email: 'lisi@example.com',
      avatar: 'L',
      projects: 3,
      status: '在线',
    },
    {
      id: 3,
      name: '王五',
      role: '后端开发',
      email: 'wangwu@example.com',
      avatar: 'W',
      projects: 4,
      status: '离线',
    },
    {
      id: 4,
      name: '赵六',
      role: 'UI设计师',
      email: 'zhaoliu@example.com',
      avatar: 'Z',
      projects: 2,
      status: '忙碌',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">团队</h1>
          <p className="text-gray-600 mt-1">管理您的团队成员和权限</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          邀请成员
        </button>
      </div>

      {/* 团队统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold">4</div>
          <div className="text-gray-600 text-sm">总成员</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold">3</div>
          <div className="text-gray-600 text-sm">在线</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold">14</div>
          <div className="text-gray-600 text-sm">进行中的项目</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold">92%</div>
          <div className="text-gray-600 text-sm">活跃度</div>
        </div>
      </div>

      {/* 成员列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">成员列表</h2>
        </div>
        <div className="divide-y">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="p-6 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {member.avatar}
                </div>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="font-bold">{member.projects}</div>
                  <div className="text-xs text-gray-500">项目</div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      member.status === '在线'
                        ? 'bg-green-500'
                        : member.status === '忙碌'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  <span className="text-sm text-gray-600">{member.status}</span>
                </div>

                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 最佳实践

#### 1. 路由组使用

```typescript
// ✅ 推荐：逻辑清晰的路由分组
app/
├── (public)/        # 公开页面
├── (dashboard)/     # 需要登录的页面
└── (admin)/         # 管理员页面

// ❌ 不推荐：过度嵌套
app/
├── (main)/
│   └── (sub)/
│       └── (nested)/
```

#### 2. 并行路由设计

```typescript
// ✅ 推荐：有明确边界的并行插槽
dashboard/
├── @analytics/      # 独立的分析功能
├── @settings/       # 独立的设置功能
└── @notifications/  # 独立的通知功能

// ❌ 不推荐：功能重叠的插槽
dashboard/
├── @overview1/
├── @overview2/
└── @overview3/
```

#### 3. 默认页面

```typescript
// ✅ 推荐：为每个插槽提供默认页面
dashboard/
├── @analytics/
│   ├── page.tsx
│   └── default.tsx  # 加载时的默认显示
└── @settings/
    ├── page.tsx
    └── default.tsx  # 加载时的默认显示
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| 路由组 | (group) 语法 | 熟练掌握 |
| 多根布局 | 不同路由组使用不同布局 | 掌握 |
| 并行路由 | @slot 语法 | 熟练掌握 |
| 插槽导航 | 独立的导航历史 | 理解 |
| 默认插槽 | default.tsx | 掌握 |
| 实际应用 | Dashboard架构 | 能够实现 |

---

**下一步学习**：建议继续学习[拦截路由与Modals](./chapter-99)了解如何实现模态框等高级UI模式。
