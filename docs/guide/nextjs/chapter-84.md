# 路由系统完全指南

## 路由系统完全指南

> **学习目标**：掌握Next.js App Router的高级路由功能，能够构建复杂的路由系统
> **核心内容**：动态路由、路由组、平行路由、拦截路由、实战案例

### 路由系统概述

#### Next.js路由架构

```
┌─────────────────────────────────────────────────────────────┐
│                 Next.js App Router 架构                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  文件系统 → 路由映射 → URL结构                               │
│                                                             │
│  app/page.tsx           →  /                               │
│  app/blog/page.tsx      →  /blog                           │
│  app/blog/[id]/page.tsx →  /blog/123, /blog/abc            │
│  app/shop/[...slug]/    →  /shop/a/b/c                     │
│                                                             │
│  高级功能：                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  路由组          - (group) 不影响URL                 │   │
│  │  平行路由        - @slots 并行渲染                   │   │
│  │  拦截路由        - (..)parent (.)sibling拦截         │   │
│  │  动态路由        - [param] 捕获参数                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 路由约定总结

| 文件名 | 路由类型 | 示例URL | 说明 |
|--------|---------|---------|------|
| `page.tsx` | 基础路由 | `/blog` | 普通页面 |
| `[slug]/page.tsx` | 动态路由 | `/blog/nextjs` | 单段动态 |
| `[...slug]/page.tsx` | 捕获所有 | `/docs/a/b/c` | 多段动态 |
| `[[...slug]]/page.tsx` | 可选捕获 | `/docs` 或 `/docs/a/b` | 可选多段 |
| `(group)/page.tsx` | 路由组 | `/about` | 组织用 |
| `@dashboard/page.tsx` | 平行路由 | `/` | 并行渲染 |
| `(.)modal/page.tsx` | 拦截路由 | `/modal` | 模态框等 |

### 动态路由

#### 1. 基础动态路由

**单段动态路由**：

```typescript
// app/products/[id]/page.tsx
// → /products/1
// → /products/abc
// → /products/nextjs-14

interface Props {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: Props) {
  // ✅ params在服务端可用
  const product = await fetch(
    `https://api.example.com/products/${params.id}`
  ).then(r => r.json())

  return (
    <div>
      <h1>产品: {product.name}</h1>
      <p>ID: {params.id}</p>
    </div>
  )
}

// ✅ 生成静态参数（用于静态生成）
export async function generateStaticParams() {
  const products = await fetch('https://api.example.com/products')
    .then(r => r.json())

  // 返回参数数组
  return products.map((product: any) => ({
    id: product.id.toString(),
  }))
}

// ✅ 设置为动态渲染（可选）
export const dynamic = 'force-dynamic'

// ✅ 设置静态生成（可选）
export const dynamic = 'force-static'
```

**多段动态路由**：

```typescript
// app/shop/[category]/[product]/page.tsx
// → /shop/electronics/laptop
// → /shop/clothing/t-shirt
// → /shop/books/harry-potter

interface Props {
  params: {
    category: string
    product: string
  }
}

export default function ProductDetailPage({ params }: Props) {
  return (
    <div>
      <p>分类: {params.category}</p>
      <p>产品: {params.product}</p>
    </div>
  )
}
```

#### 2. 捕获所有路由

**必须包含参数**：

```typescript
// app/docs/[...slug]/page.tsx
// → /docs/getting-started
// → /docs/getting-started/installation
// → /docs/getting-started/installation/config

interface Props {
  params: {
    slug: string[]
  }
}

export default function DocPage({ params }: Props) {
  // slug 是一个数组
  return (
    <div>
      <h1>文档页面</h1>
      <p>路径: {params.slug.join('/')}</p>
      <p>深度: {params.slug.length}</p>
    </div>
  )
}
```

**可选参数**：

```typescript
// app/docs/[[...slug]]/page.tsx
// → /docs (匹配)
// → /docs/getting-started (匹配)
// → /docs/getting-started/installation (匹配)

interface Props {
  params: {
    slug?: string[]
  }
}

export default function DocPage({ params }: Props) {
  // slug 可能是 undefined
  if (!params.slug || params.slug.length === 0) {
    return <div>文档首页</div>
  }

  return (
    <div>
      <h1>文档: {params.slug.join('/')}</h1>
    </div>
  )
}
```

**使用场景对比**：

| 模式 | 示例 | 使用场景 |
|------|------|---------|
| `[id]` | `/blog/123` | 单一参数（博客ID） |
| `[category]/[product]` | `/shop/tech/laptop` | 多参数（分类+产品） |
| `[...slug]` | `/docs/a/b/c` | 文档系统、多层级 |
| `[[...slug]]`` | `/docs` 或 `/docs/a/b` | 可选多层级 |

#### 3. 动态路由最佳实践

```typescript
// ✅ 推荐：使用TypeScript类型安全
interface Params {
  id: string
  slug?: string[]
}

interface Props {
  params: Params
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ params, searchParams }: Props) {
  // ✅ 解构参数
  const { id, slug } = params
  const page = searchParams.page

  // ✅ 验证参数
  if (!id) {
    notFound()
  }

  // ✅ 获取数据
  const data = await fetchData(id)

  return <div>{data.title}</div>
}

// ❌ 不推荐：缺少类型定义
export default async function Page({ params }: any) {
  return <div>{params.id}</div>
}
```

### 路由组（Route Groups）

#### 1. 基础用法

**创建路由组**：

```typescript
// app/(marketing)/about/page.tsx
// app/(marketing)/contact/page.tsx
// app/(marketing)/pricing/page.tsx
// → URL: /about, /contact, /pricing (不包含marketing)

// app/(dashboard)/settings/page.tsx
// app/(dashboard)/analytics/page.tsx
// → URL: /settings, /analytics (不包含dashboard)
```

**路由组布局**：

```typescript
// app/(marketing)/layout.tsx
import Link from 'next/link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-layout">
      <nav className="marketing-nav">
        <Link href="/about">关于</Link>
        <Link href="/contact">联系</Link>
        <Link href="/pricing">定价</Link>
      </nav>

      <main>{children}</main>

      <footer className="marketing-footer">
        © 2024 我的公司
      </footer>
    </div>
  )
}
```

#### 2. 路由组应用场景

**场景1：不同认证级别**：

```typescript
// app/(public)/home/page.tsx
// app/(public)/about/page.tsx
// → 公开页面，无需认证

// app/(protected)/dashboard/page.tsx
// app/(protected)/settings/page.tsx
// → 需要认证的页面

// app/(protected)/layout.tsx
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return <div>{children}</div>
}
```

**场景2：多语言支持**：

```typescript
// app/(zh-CN)/about/page.tsx
// app/(en-US)/about/page.tsx
// → /about (根据语言显示不同内容)

// app/(zh-CN)/layout.tsx
export default function ChineseLayout({
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

**场景3：主题切换**：

```typescript
// app/(light)/page.tsx
// app/(dark)/page.tsx
// → 相同URL，不同主题

// app/(light)/layout.tsx
export default function LightLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="theme-light">
      {children}
    </div>
  )
}
```

#### 3. 路由组最佳实践

```typescript
// ✅ 推荐：清晰的目录组织
app/
├── (auth)/               # 认证相关
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── (dashboard)/          # 仪表盘
│   ├── overview/
│   ├── analytics/
│   └── layout.tsx
├── (public)/             # 公开页面
│   ├── about/
│   ├── contact/
│   └── layout.tsx
└── layout.tsx            # 根布局

// ❌ 不推荐：过度嵌套
app/
├── (group1)/
│   └── (group2)/
│       └── (group3)/
│           └── page.tsx
```

### 平行路由（Parallel Routes）

#### 1. 基础概念

**平行路由**允许在同一布局中同时渲染多个页面：

```typescript
// app/@team/page.tsx      → /team
// app/@analytics/page.tsx → /analytics
// app/layout.tsx

// app/layout.tsx
export default function Layout({
  children,
  team,
  analytics,
}: {
  children: React.ReactNode
  team: React.ReactNode
  analytics: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">{children}</div>
      <div className="sidebar">
        {team}
        {analytics}
      </div>
    </div>
  )
}
```

**槽位（Slots）说明**：

```
URL: /dashboard
渲染:
├── children → app/dashboard/page.tsx
├── team → app/@team/page.tsx (默认)
└── analytics → app/@analytics/page.tsx (默认)

URL: /dashboard/team/1
渲染:
├── children → app/dashboard/page.tsx
├── team → app/@team/team/[id]/page.tsx
└── analytics → app/@analytics/page.tsx (默认)
```

#### 2. 实战示例：仪表盘布局

```typescript
// app/layout.tsx - 根布局
import Link from 'next/link'

export default function RootLayout({
  children,
  overview,
  analytics,
  notifications,
}: {
  children: React.ReactNode
  overview: React.ReactNode
  analytics: React.ReactNode
  notifications: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="flex h-screen">
          {/* 侧边栏 */}
          <aside className="w-64 bg-gray-900 text-white p-4">
            <nav className="space-y-2">
              <Link href="/" className="block py-2 px-4 rounded hover:bg-gray-800">
                概览
              </Link>
              <Link href="/analytics" className="block py-2 px-4 rounded hover:bg-gray-800">
                分析
              </Link>
              <Link href="/notifications" className="block py-2 px-4 rounded hover:bg-gray-800">
                通知
              </Link>
            </nav>
          </aside>

          {/* 主内容区域 */}
          <main className="flex-1 flex">
            {/* 主内容 */}
            <div className="flex-1 p-8 overflow-auto">
              {children}
            </div>

            {/* 侧边栏槽位 */}
            <div className="w-80 bg-gray-50 p-4 border-l overflow-auto">
              {/* 默认渲染概览 */}
              {overview}

              {/* /analytics 时渲染分析 */}
              {analytics}

              {/* /notifications 时渲染通知 */}
              {notifications}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
```

```typescript
// app/@overview/default.tsx - 默认页面
export default function DefaultOverview() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">概览</h3>
      <div className="space-y-2">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-2xl font-bold text-blue-600">1,234</div>
          <div className="text-sm text-gray-600">总用户数</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-2xl font-bold text-green-600">567</div>
          <div className="text-sm text-gray-600">今日访问</div>
        </div>
      </div>
    </div>
  )
}
```

```typescript
// app/@overview/page.tsx - 概览槽位
async function getOverviewData() {
  // 获取概览数据
  const stats = await fetch('https://api.example.com/stats', {
    next: { revalidate: 60 },
  }).then(r => r.json())

  return stats
}

export default async function Overview() {
  const stats = await getOverviewData()

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">实时概览</h3>
      <div className="space-y-2">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-2xl font-bold text-blue-600">
            {stats.users}
          </div>
          <div className="text-sm text-gray-600">在线用户</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-2xl font-bold text-green-600">
            {stats.visits}
          </div>
          <div className="text-sm text-gray-600">今日访问</div>
        </div>
      </div>
    </div>
  )
}
```

```typescript
// app/@analytics/page.tsx - 分析槽位
export default async function Analytics() {
  const data = await fetch('https://api.example.com/analytics')
    .then(r => r.json())

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">数据分析</h3>
      <div className="space-y-2">
        {data.items.map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded shadow">
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-gray-600">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

```typescript
// app/@notifications/page.tsx - 通知槽位
export default async function Notifications() {
  const notifications = await fetch('https://api.example.com/notifications')
    .then(r => r.json())

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">通知中心</h3>
      <div className="space-y-2">
        {notifications.map((notif: any) => (
          <div key={notif.id} className="bg-white p-3 rounded shadow-sm">
            <div className="font-medium text-sm">{notif.title}</div>
            <div className="text-xs text-gray-600">{notif.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### 3. 平行路由高级用法

**条件渲染**：

```typescript
// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal?: React.ReactNode  // 可选槽位
}) {
  return (
    <div>
      {children}
      {modal && <div className="modal">{modal}</div>}
    </div>
  )
}

// app/@modal/default.tsx - 空默认页面
export default function Default() {
  return null
}
```

**404处理**：

```typescript
// app/@analytics/not-found.tsx
export default function NotFound() {
  return <div>分析数据未找到</div>
}
```

### 拦截路由（Intercepting Routes）

#### 1. 基础概念

**拦截路由**允许拦截导航并显示不同内容：

```
┌─────────────────────────────────────────────────────────────┐
│                 拦截路由约定                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  (.)        - 拦截同一层级                                   │
│  (..)       - 拦截上一层级                                   │
│  (..)(..)   - 拦截上上一层级                                 │
│  (...)      - 拦截根层级                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2. 模态框示例

**场景**：在列表页点击项目时，打开模态框而不是跳转

```typescript
// app/photos/page.tsx - 照片列表
import Link from 'next/link'

const photos = [
  { id: '1', title: '照片1' },
  { id: '2', title: '照片2' },
  { id: '3', title: '照片3' },
]

export default function PhotosPage() {
  return (
    <div>
      <h1>照片列表</h1>
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.id}>
            {/* ✅ 正常链接 */}
            <Link href={`/photos/${photo.id}`}>
              <div className="photo-card">
                <img src={`/photos/${photo.id}.jpg`} alt={photo.title} />
                <h3>{photo.title}</h3>
              </div>
            </Link>

            {/* ✅ 模态框链接（拦截路由） */}
            <Link href={`/photos/${photo.id}/modal`}>
              <button className="view-modal-btn">
                在模态框中查看
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
```

```typescript
// app/photos/[id]/page.tsx - 照片详情页
export default function PhotoPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div>
      <h1>照片详情</h1>
      <img src={`/photos/${params.id}.jpg`} alt={`照片 ${params.id}`} />
    </div>
  )
}
```

```typescript
// app/(.)photos/[id]/modal/page.tsx - 模态框（拦截路由）
import { useRouter } from 'next/navigation'
import Link from 'next/link'

'use client'

export default function PhotoModal({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        {/* 关闭按钮 */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* 照片内容 */}
        <img
          src={`/photos/${params.id}.jpg`}
          alt={`照片 ${params.id}`}
          className="w-full h-auto"
        />

        {/* 操作按钮 */}
        <div className="mt-4 flex justify-between">
          <Link href={`/photos/${params.id}`}>
            <button className="btn-primary">
              在新页面打开
            </button>
          </Link>
          <button
            onClick={() => router.back()}
            className="btn-secondary"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
```

**布局配置**：

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal?: React.ReactNode  // 模态框槽位
}) {
  return (
    <html>
      <body>
        {children}
        {modal}
      </body>
    </html>
  )
}

// app/(.)photos/[id]/modal/default.tsx
export default function Default() {
  return null  // 默认不显示模态框
}
```

#### 3. 其他拦截模式

**拦截父级路由**：

```typescript
// app/feed/page.tsx
// app/(..)feed/[id]/modal/page.tsx
// 访问 /feed/123/modal 时，拦截 /feed
```

**拦截根路由**：

```typescript
// app/page.tsx
// app/(...)login/page.tsx
// 访问 /login 时，在根页面显示登录模态框
```

### 综合实战案例：电商网站

让我们创建一个完整的电商网站，展示所有路由功能。

#### 项目结构

```
app/
├── (shop)/                    # 路由组：商店
│   ├── layout.tsx            # 商店布局
│   ├── page.tsx              # 首页
│   ├── products/
│   │   ├── page.tsx          # 产品列表
│   │   └── [id]/
│   │       ├── page.tsx      # 产品详情
│   │       └── reviews/
│   │           └── page.tsx  # 产品评论
│   └── categories/
│       └── [...slug]/
│           └── page.tsx      # 分类（多层级）
├── (auth)/                   # 路由组：认证
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/              # 路由组：仪表盘
│   ├── layout.tsx            # Dashboard布局
│   ├── page.tsx
│   ├── orders/
│   │   └── page.tsx
│   └── profile/
│       └── page.tsx
├── @modal/                   # 平行路由：模态框
│   └── (.)products/[id]/
│       └── quick-view/
│           └── page.tsx      # 快速查看模态框
├── @cart/                    # 平行路由：购物车
│   ├── page.tsx              # 购物车页面
│   └── default.tsx
├── layout.tsx                # 根布局
└── page.tsx                  # 首页
```

#### 1. 根布局

```typescript
// app/layout.tsx
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'

export default function RootLayout({
  children,
  modal,
  cart,
}: {
  children: React.ReactNode
  modal?: React.ReactNode
  cart?: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <CartProvider>
          {/* 导航栏 */}
          <Navbar />

          {/* 主内容 */}
          <main className="min-h-screen">
            {children}
          </main>

          {/* 页脚 */}
          <Footer />

          {/* 购物车侧边栏 */}
          {cart}

          {/* 模态框 */}
          {modal}
        </CartProvider>
      </body>
    </html>
  )
}

function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-blue-600">
            我的商店
          </a>

          <div className="flex items-center space-x-6">
            <a href="/products" className="hover:text-blue-600">
              产品
            </a>
            <a href="/categories" className="hover:text-blue-600">
              分类
            </a>
            <a href="/dashboard" className="hover:text-blue-600">
              仪表盘
            </a>
            <a href="/cart" className="hover:text-blue-600">
              购物车
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">关于我们</h3>
            <p className="text-gray-400 text-sm">
              提供优质产品和服务的电商平台
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">客户服务</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/help" className="hover:text-white">帮助中心</a></li>
              <li><a href="/shipping" className="hover:text-white">配送信息</a></li>
              <li><a href="/returns" className="hover:text-white">退换货政策</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/products" className="hover:text-white">所有产品</a></li>
              <li><a href="/new" className="hover:text-white">新品</a></li>
              <li><a href="/sale" className="hover:text-white">促销</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">关注我们</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">微信</a>
              <a href="#" className="text-gray-400 hover:text-white">微博</a>
              <a href="#" className="text-gray-400 hover:text-white">抖音</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 我的商店. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
```

#### 2. 商店布局

```typescript
// app/(shop)/layout.tsx
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="shop-layout">
      {/* 面包屑导航 */}
      <Breadcrumb />

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
```

#### 3. 产品列表（动态路由）

```typescript
// app/(shop)/products/page.tsx
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 }, // 1小时
  })
  return res.json()
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string }
}) {
  const products = await getProducts()

  // 过滤和排序
  const filtered = products.filter(p =>
    searchParams.category ? p.category === searchParams.category : true
  )

  const sorted = filtered.sort((a, b) => {
    if (searchParams.sort === 'price-asc') return a.price - b.price
    if (searchParams.sort === 'price-desc') return b.price - a.price
    return 0
  })

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">所有产品</h1>
        <p className="text-gray-600">共 {sorted.length} 个产品</p>
      </div>

      {/* 筛选和排序 */}
      <div className="mb-6 flex gap-4">
        <select className="border rounded px-4 py-2">
          <option value="">所有分类</option>
          <option value="electronics">电子产品</option>
          <option value="clothing">服装</option>
        </select>

        <select className="border rounded px-4 py-2">
          <option value="">默认排序</option>
          <option value="price-asc">价格：低到高</option>
          <option value="price-desc">价格：高到低</option>
        </select>
      </div>

      {/* 产品网格 */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sorted.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* 产品图片 */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />

                {/* 快速查看按钮 */}
                <Link
                  href={`/products/${product.id}/quick-view`}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  快速查看
                </Link>
              </div>

              {/* 产品信息 */}
              <div className="p-4">
                <h3 className="font-medium mb-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-blue-600 font-bold">
                  ¥{product.price.toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

#### 4. 产品详情

```typescript
// app/(shop)/products/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  description: string
  images: string[]
  category: string
  stock: number
}

async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  return res.json()
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: '产品未找到',
    }
  }

  return {
    title: `${product.name} - 我的商店`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 面包屑 */}
      <nav className="text-sm mb-6">
        <ol className="flex items-center space-x-2">
          <li><Link href="/">首页</Link></li>
          <li>/</li>
          <li><Link href="/products">产品</Link></li>
          <li>/</li>
          <li className="text-gray-600">{product.name}</li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 产品图片 */}
        <div>
          <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden mb-4">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 缩略图 */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 产品信息 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-3xl text-blue-600 font-bold">
              ¥{product.price.toFixed(2)}
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">产品描述</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
              {product.category}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-600">
              库存: {product.stock > 0 ? `${product.stock} 件` : '缺货'}
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              加入购物车
            </button>
            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              收藏
            </button>
          </div>

          {/* 额外信息 */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">配送</span>
              <span>免费配送</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">退换货</span>
              <span>7天无理由退换</span>
            </div>
          </div>
        </div>
      </div>

      {/* 产品评论 */}
      <div className="mt-12 pt-12 border-t">
        <h2 className="text-2xl font-bold mb-6">产品评论</h2>
        <Link
          href={`/products/${params.id}/reviews`}
          className="text-blue-600 hover:text-blue-700"
        >
          查看所有评论 →
        </Link>
      </div>
    </div>
  )
}
```

#### 5. 快速查看模态框（拦截路由）

```typescript
// app/@modal/(.)products/[id]/quick-view/page.tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import getProduct from '../../(shop)/products/[id]/getProduct'

'use client'

export default async function QuickViewModal({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const product = await getProduct(params.id)

  if (!product) {
    return <div>产品未找到</div>
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">快速查看</h2>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* 图片 */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 信息 */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">{product.name}</h3>
            <p className="text-3xl text-blue-600 font-bold">
              ¥{product.price.toFixed(2)}
            </p>
            <p className="text-gray-600">{product.description}</p>

            <div className="flex gap-4">
              <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                加入购物车
              </button>
              <Link
                href={`/products/${params.id}`}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
              >
                查看详情
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 路由最佳实践

#### 1. 文件组织

```typescript
// ✅ 推荐：清晰的目录结构
app/
├── (auth)/              # 认证相关
├── (dashboard)/         # 仪表盘
├── (public)/            # 公开页面
├── @modal/              # 模态框
├── @sidebar/            # 侧边栏
├── api/                 # API路由
├── layout.tsx
└── page.tsx

// ❌ 不推荐：过度嵌套
app/
├── (group1)/
│   └── (group2)/
│       └── (group3)/
│           └── [param]/
│               └── page.tsx
```

#### 2. 命名规范

```typescript
// ✅ 推荐：使用描述性名称
app/
├── products/
│   └── [id]/
│       └── page.tsx
└── categories/
    └── [...slug]/
        └── page.tsx

// ❌ 不推荐：使用通用名称
app/
├── items/
│   └── [param]/
│       └── page.tsx
└── folders/
    └── [...path]/
        └── page.tsx
```

#### 3. 性能优化

```typescript
// ✅ 推荐：使用ISR减少数据请求
export const revalidate = 3600 // 1小时

// ✅ 推荐：使用静态生成
export const dynamic = 'force-static'

// ❌ 不推荐：所有页面都动态渲染
export const dynamic = 'force-dynamic'
```

### 本章小结

| 路由类型 | 语法 | 使用场景 | 示例 |
|---------|------|---------|------|
| **动态路由** | `[param]` | 动态参数 | `/blog/[id]` |
| **捕获所有** | `[...slug]` | 多层级 | `/docs/[...slug]` |
| **路由组** | `(group)` | 组织文件 | `(marketing)/about` |
| **平行路由** | `@slot` | 并行渲染 | `@dashboard` |
| **拦截路由** | `(.)modal` | 模态框 | `(.)login/modal` |

---

**下一步学习**：建议继续学习[布局与模板系统](./chapter-85)深入了解Next.js的布局系统。
