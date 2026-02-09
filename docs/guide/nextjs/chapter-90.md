# 服务端渲染（SSR）

## 服务端渲染（SSR）

> **学习目标**：掌握Next.js的服务端渲染（SSR）技术，构建动态内容的Web应用
> **核心内容**：SSR原理、动态数据获取、缓存策略、实战案例

### 服务端渲染概述

#### 什么是SSR

**服务端渲染（Server-Side Rendering, SSR）** 是在每次请求时在服务器上生成HTML，然后将渲染好的HTML发送到客户端。

```
┌─────────────────────────────────────────────────────────────┐
│                SSR 请求响应流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户请求                                                    │
│     ↓                                                       │
│  Next.js服务器                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. 接收请求                                          │   │
│  │  2. 获取数据 (数据库、API等)                         │   │
│  │  3. 渲染React组件为HTML                              │   │
│  │  4. 生成完整HTML文档                                 │   │
│  │  5. 返回HTML给客户端                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│     ↓                                                       │
│  客户端接收HTML                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. 显示HTML (首次内容绘制)                          │   │
│  │  2. 加载JavaScript                                  │   │
│  │  3. Hydration (激活交互)                            │   │
│  │  4. 页面完全可交互                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### SSR vs SSG vs CSR

| 特性 | SSR | SSG | CSR |
|------|-----|-----|-----|
| **渲染时机** | 每次请求 | 构建时 | 客户端 |
| **数据新鲜度** | 总是最新的 | 取决于revalidate | 取决于API |
| **首屏速度** | 快 | 最快 | 慢 |
| **SEO** | 优秀 | 最佳 | 差 |
| **服务器负载** | 高 | 低 | 无 |
| **适用场景** | 动态内容 | 静态内容 | 交互应用 |

### 动态数据获取

#### 基础SSR

使用`fetch`并设置`cache: 'no-store'`来实现SSR：

```typescript
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic' // 强制动态渲染

async function getUserData() {
  const res = await fetch('https://api.example.com/user', {
    cache: 'no-store', // 不使用缓存，每次请求都获取
  })

  if (!res.ok) {
    throw new Error('Failed to fetch user data')
  }

  return res.json()
}

export default async function DashboardPage() {
  const user = await getUserData()

  return (
    <div>
      <h1>欢迎, {user.name}</h1>
      <p>邮箱: {user.email}</p>
    </div>
  )
}
```

#### 多个数据源并行获取

```typescript
// app/analytics/page.tsx
export const dynamic = 'force-dynamic'

async function getAnalytics() {
  const [visitors, pageViews, conversions] = await Promise.all([
    fetch('https://api.example.com/analytics/visitors', {
      cache: 'no-store',
    }).then(r => r.json()),

    fetch('https://api.example.com/analytics/page-views', {
      cache: 'no-store',
    }).then(r => r.json()),

    fetch('https://api.example.com/analytics/conversions', {
      cache: 'no-store',
    }).then(r => r.json()),
  ])

  return { visitors, pageViews, conversions }
}

export default async function AnalyticsPage() {
  const data = await getAnalytics()

  return (
    <div>
      <h1>数据分析</h1>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="访客数"
          value={data.visitors.count}
          change={data.visitors.change}
        />
        <MetricCard
          title="页面浏览"
          value={data.pageViews.count}
          change={data.pageViews.change}
        />
        <MetricCard
          title="转化数"
          value={data.conversions.count}
          change={data.conversions.change}
        />
      </div>
    </div>
  )
}

function MetricCard({ title, value, change }: any) {
  const isPositive = change >= 0

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-gray-600 mb-2">{title}</h3>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div
        className={`text-sm ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {isPositive ? '+' : ''}{change}%
      </div>
    </div>
  )
}
```

#### 基于路由参数的数据获取

```typescript
// app/users/[id]/page.tsx
export const dynamic = 'force-dynamic'

async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    return null
  }

  return res.json()
}

export default async function UserPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getUser(params.id)

  if (!user) {
    return <div>用户未找到</div>
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <p>{user.bio}</p>
    </div>
  )
}
```

#### 基于搜索参数的数据获取

```typescript
// app/search/page.tsx
export const dynamic = 'force-dynamic'

async function searchProducts(query: string) {
  const res = await fetch(
    `https://api.example.com/products/search?q=${encodeURIComponent(query)}`,
    { cache: 'no-store' }
  )

  return res.json()
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string }
}) {
  const products = await searchProducts(searchParams.q || '')

  return (
    <div>
      <h1>搜索结果: {searchParams.q}</h1>
      <div>
        {products.map((product: any) => (
          <div key={product.id}>{product.name}</div>
        ))}
      </div>
    </div>
  )
}
```

### 缓存策略

#### 1. No-Store（不缓存）

```typescript
// 每次请求都获取新数据
const res = await fetch('https://api.example.com/data', {
  cache: 'no-store',
})
```

#### 2. Force-Cache（强制缓存）

```typescript
// 缓存数据，除非手动清除
const res = await fetch('https://api.example.com/data', {
  next: { revalidate: false },
})
```

#### 3. Revalidate（重新验证）

```typescript
// 缓存60秒，然后重新验证
const res = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 },
})
```

#### 4. 标签缓存

```typescript
// 使用标签进行缓存管理
const res = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] },
})

// 在需要时清除特定标签的缓存
import { revalidateTag } from 'next/cache'

revalidateTag('posts')
```

#### 缓存策略对比

| 策略 | 首次请求 | 后续请求 | 数据新鲜度 | 性能 |
|------|---------|---------|-----------|------|
| **no-store** | 请求API | 请求API | 实时 | 慢 |
| **force-cache** | 请求API | 返回缓存 | 可能过期 | 快 |
| **revalidate** | 请求API | 返回缓存（60s后刷新） | 接近实时 | 快 |
| **tags** | 请求API | 返回缓存（可手动刷新） | 可控 | 快 |

### 实战案例：动态内容应用

创建一个实时数据仪表盘应用。

#### 1. 用户仪表盘

```typescript
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function getDashboardData(userId: string) {
  const [stats, recentActivity, notifications] = await Promise.all([
    fetch(`${process.env.API_URL}/dashboard/${userId}/stats`, {
      cache: 'no-store',
    }).then(r => r.json()),

    fetch(`${process.env.API_URL}/dashboard/${userId}/activity`, {
      cache: 'no-store',
    }).then(r => r.json()),

    fetch(`${process.env.API_URL}/dashboard/${userId}/notifications`, {
      cache: 'no-store',
    }).then(r => r.json()),
  ])

  return { stats, recentActivity, notifications }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const data = await getDashboardData(session.user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="总项目"
            value={data.stats.totalProjects}
            change={data.stats.projectsChange}
            icon="📁"
          />
          <StatCard
            title="活跃任务"
            value={data.stats.activeTasks}
            change={data.stats.tasksChange}
            icon="✅"
          />
          <StatCard
            title="团队成员"
            value={data.stats.teamMembers}
            change={data.stats.membersChange}
            icon="👥"
          />
          <StatCard
            title="完成率"
            value={`${data.stats.completionRate}%`}
            change={data.stats.completionChange}
            icon="📊"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <ActivityList activities={data.recentActivity} />
          </div>

          {/* Notifications */}
          <div>
            <NotificationCenter notifications={data.notifications} />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, change, icon }: any) {
  const isPositive = change >= 0

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        <span
          className={`text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}
```

#### 2. 实时通知中心

```typescript
// components/NotificationCenter.tsx
'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  createdAt: Date
  read: boolean
}

interface NotificationCenterProps {
  initialNotifications: Notification[]
}

export default function NotificationCenter({
  initialNotifications,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // 轮询新通知
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/notifications')
        const data = await res.json()
        setNotifications(data.notifications)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }, 30000) // 每30秒

    return () => clearInterval(interval)
  }, [])

  const filteredNotifications =
    filter === 'all'
      ? notifications
      : notifications.filter(n => !n.read)

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">通知</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            未读
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无通知
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    标为已读
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

#### 3. 活动列表

```typescript
// components/ActivityList.tsx
export default function ActivityList({ activities }: { activities: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">最近活动</h2>

      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-4">
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                {getActivityIcon(activity.type)}
              </div>
              {index < activities.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                </div>
                <time className="text-sm text-gray-500">
                  {formatTime(activity.createdAt)}
                </time>
              </div>

              {activity.metadata && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <pre className="text-xs text-gray-700">
                    {JSON.stringify(activity.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getActivityIcon(type: string) {
  const icons: Record<string, string> = {
    project_created: '📁',
    task_completed: '✅',
    comment_added: '💬',
    user_joined: '👤',
    file_uploaded: '📄',
  }
  return icons[type] || '📌'
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return new Date(date).toLocaleDateString('zh-CN')
}
```

### 错误处理

#### 1. 数据获取错误处理

```typescript
// app/profile/page.tsx
export const dynamic = 'force-dynamic'

async function getUserProfile(id: string) {
  try {
    const res = await fetch(`https://api.example.com/users/${id}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    return await res.json()
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    throw error
  }
}

export default async function ProfilePage({
  params,
}: {
  params: { id: string }
}) {
  try {
    const user = await getUserProfile(params.id)

    if (!user) {
      return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            用户未找到
          </h1>
          <p className="text-gray-600">
            该用户不存在或已被删除
          </p>
        </div>
      )
    }

    return <UserProfile user={user} />
  } catch (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          加载失败
        </h1>
        <p className="text-gray-600">
          无法加载用户信息，请稍后重试
        </p>
      </div>
    )
  }
}
```

#### 2. 使用error.tsx

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            出错了
          </h2>
          <p className="text-gray-600 mb-6">
            {error.message || '页面加载时发生错误'}
          </p>
          <button
            onClick={reset}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 性能优化

#### 1. 并行数据获取

```typescript
// ✅ 好：并行获取
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments(),
])

// ❌ 差：串行获取
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

#### 2. 流式渲染

```typescript
// app/streaming/page.tsx
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

async function SlowComponent() {
  const data = await fetch('https://api.example.com/slow', {
    cache: 'no-store',
  }).then(r => r.json())

  return <div>{data.title}</div>
}

export default function StreamingPage() {
  return (
    <div>
      <h1>页面标题</h1>
      <Suspense fallback={<div>加载中...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| SSR原理 | 工作流程、与SSG区别 | 理解核心概念 |
| 动态数据获取 | fetch API、并行请求 | 掌握实现方法 |
| 缓存策略 | no-store、revalidate、tags | 能够选择合适策略 |
| 错误处理 | try-catch、error.tsx | 能够处理错误 |
| 实战应用 | 动态仪表盘 | 能够独立开发 |

---

**下一步学习**：建议继续学习[增量静态再生（ISR）](./chapter-91)了解高级缓存策略。
