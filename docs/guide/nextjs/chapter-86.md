# 链接与导航

## 链接与导航

> **学习目标**：掌握Next.js的导航系统，能够实现各种导航场景
> **核心内容**：Link组件、useRouter Hook、编程式导航、滚动行为、实战案例

### 导航系统概述

#### Next.js导航架构

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js 导航系统                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  声明式导航        <Link href="/about">                     │
│       ↓                                                   │
│  编程式导航        router.push('/about')                    │
│       ↓                                                   │
│  客户端路由        无需页面刷新                              │
│       ↓                                                   │
│  预取机制          自动预取链接                              │
│       ↓                                                   │
│  滚动管理          自动恢复/控制滚动位置                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 导航方式对比

| 导航方式 | 使用场景 | 示例 |
|---------|---------|------|
| **Link组件** | 声明式导航（推荐） | `<Link href="/">` |
| **useRouter** | 编程式导航 | `router.push('/')` |
| **redirect** | 服务端重定向 | `redirect('/login')` |
| **原生a标签** | 外部链接 | `<a href="https://...">` |

### Link组件

#### 基础用法

```typescript
// 最基本的链接
import Link from 'next/link'

export default function Page() {
  return (
    <Link href="/about">
      关于我们
    </Link>
  )
}
```

#### Link组件属性

```typescript
import Link from 'next/link'

export default function NavigationExample() {
  return (
    <div>
      {/* ✅ 基础链接 */}
      <Link href="/dashboard">
        仪表盘
      </Link>

      {/* ✅ 动态路由 */}
      <Link href={`/blog/${post.id}`}>
        查看文章
      </Link>

      {/* ✅ 查询参数 */}
      <Link href="/search?q=nextjs&page=1">
        搜索
      </Link>

      {/* ✅ 哈希片段 */}
      <Link href="/about#team">
        团队介绍
      </Link>

      {/* ✅ 替换历史记录（不增加历史记录条目） */}
      <Link href="/login" replace>
        登录
      </Link>

      {/* ✅ 滚动控制（不滚动到顶部） */}
      <Link href="/section" scroll={false}>
        跳转但不滚动
      </Link>

      {/* ✅ 自定义类名（推荐添加 activeClassName） */}
      <Link
        href="/dashboard"
        className="nav-link"
        // 可以结合 usePathname 实现高亮
      >
        仪表盘
      </Link>

      {/* ✅ 优先级提示（预加载） */}
      <Link href="/important" prefetch={true}>
        重要页面（立即预取）
      </Link>

      {/* ❌ 不推荐：添加不必要的a标签 */}
      <Link href="/about">
        <a>关于</a>  // Next.js 13+ 不需要嵌套a标签
      </Link>

      {/* ✅ 推荐：直接添加内容 */}
      <Link href="/about">
        关于
      </Link>
    </div>
  )
}
```

#### Link vs a标签

```typescript
import Link from 'next/link'

export default function NavigationComparison() {
  return (
    <div>
      {/* ✅ 内部链接：使用Link组件 */}
      <Link href="/about">
        关于我们
      </Link>

      {/* ✅ 外部链接：使用原生a标签 */}
      <a href="https://example.com" target="_blank" rel="noopener noreferrer">
        外部网站
      </a>

      {/* ✅ 下载链接：使用a标签 */}
      <a href="/files/document.pdf" download>
        下载PDF
      </a>

      {/* ✅ 邮件链接：使用a标签 */}
      <a href="mailto:contact@example.com">
        联系我们
      </a>

      {/* ✅ 电话链接：使用a标签 */}
      <a href="tel:+1234567890">
        拨打电话
      </a>

      {/* ❌ 错误：外部链接使用Link */}
      <Link href="https://example.com">
        外部网站（错误）
      </Link>
    </div>
  )
}
```

#### 动态链接

```typescript
// app/blog/[id]/page.tsx
import Link from 'next/link'

interface Post {
  id: string
  title: string
}

export default async function BlogPage() {
  const posts: Post[] = await fetch('https://api.example.com/posts')
    .then(r => r.json())

  return (
    <div>
      <h1>博客文章</h1>

      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            {/* ✅ 动态构建链接 */}
            <Link href={`/blog/${post.id}`}>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

#### 链接预取（Prefetching）

```typescript
import Link from 'next/link'

export default function PrefetchExample() {
  return (
    <div>
      {/* ✅ 默认：在视口内时预取 */}
      <Link href="/dashboard">
        仪表盘（自动预取）
      </Link>

      {/* ✅ 立即预取（页面加载时） */}
      <Link href="/important" prefetch={true}>
        重要页面（立即预取）
      </Link>

      {/* ✅ 禁用预取 */}
      <Link href="/rare" prefetch={false}>
        很少访问的页面（不预取）
      </Link>

      {/* ✅ 鼠标悬停时预取（默认行为） */}
      <Link href="/hover-me">
        悬停时预取
      </Link>
    </div>
  )
}
```

### useRouter Hook

#### App Router的useRouter

```typescript
// 注意：App Router使用 next/navigation 而不是 next/router
'use client'

import { useRouter } from 'next/navigation'

export default function NavigationComponent() {
  const router = useRouter()

  const handleClick = () => {
    // ✅ 导航到新页面
    router.push('/dashboard')

    // ✅ 替换当前页面（不添加历史记录）
    router.replace('/login')

    // ✅ 返回上一页
    router.back()

    // ✅ 前进到下一页
    router.forward()

    // ✅ 刷新当前页面
    router.refresh()
  }

  return (
    <div>
      <button onClick={handleClick}>导航到仪表盘</button>
    </div>
  )
}
```

#### 完整的导航API

```typescript
'use client'

import { useRouter } from 'next/navigation'

export default function RouterAPIExample() {
  const router = useRouter()

  const navigateExamples = {
    // 基础导航
    basicNavigation: () => {
      router.push('/about')
    },

    // 带查询参数的导航
    withQueryParams: () => {
      router.push('/search?q=nextjs&page=1')
    },

    // 动态路由导航
    dynamicRoute: (id: string) => {
      router.push(`/products/${id}`)
    },

    // 替换当前页面
    replaceNavigation: () => {
      router.replace('/new-location')
    },

    // 返回上一页
    goBack: () => {
      router.back()
    },

    // 前进
    goForward: () => {
      router.forward()
    },

    // 刷新页面
    refresh: () => {
      router.refresh() // 重新获取Server Components数据
    },

    // 编程式滚动
    scrollAndNavigate: () => {
      router.push('/about')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
  }

  return (
    <div>
      <button onClick={navigateExamples.basicNavigation}>
        基础导航
      </button>

      <button onClick={() => navigateExamples.dynamicRoute('123')}>
        动态路由导航
      </button>

      <button onClick={navigateExamples.goBack}>
        返回
      </button>
    </div>
  )
}
```

#### usePathname和useSearchParams

```typescript
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ActiveLinkExample() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // ✅ 判断当前路径
  const isDashboard = pathname === '/dashboard'
  const isDashboardOrSettings =
    pathname === '/dashboard' || pathname === '/settings'

  // ✅ 获取查询参数
  const currentPage = searchParams.get('page') || '1'
  const searchQuery = searchParams.get('q')

  return (
    <div>
      {/* ✅ 根据路径添加样式 */}
      <nav>
        <Link
          href="/dashboard"
          className={pathname === '/dashboard' ? 'text-blue-600 font-bold' : 'text-gray-600'}
        >
          仪表盘
        </Link>

        <Link
          href="/settings"
          className={pathname === '/settings' ? 'text-blue-600 font-bold' : 'text-gray-600'}
        >
          设置
        </Link>
      </nav>

      {/* ✅ 显示当前页码 */}
      <p>当前页码: {currentPage}</p>

      {/* ✅ 构建带查询参数的链接 */}
      <Link href={`/search?q=${searchQuery}&page=${Number(currentPage) + 1}`}>
        下一页
      </Link>
    </div>
  )
}
```

#### 条件导航

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ConditionalNavigation() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleProtectedClick = () => {
    if (isLoggedIn) {
      // ✅ 已登录：导航到仪表盘
      router.push('/dashboard')
    } else {
      // ✅ 未登录：导航到登录页
      router.push('/login?redirect=/dashboard')
    }
  }

  const handleFormSubmit = async (formData: FormData) => {
    const result = await submitForm(formData)

    if (result.success) {
      // ✅ 成功：导航到成功页面
      router.push('/success')
    } else {
      // ✅ 失败：显示错误信息
      alert(result.error)
    }
  }

  return (
    <div>
      <button onClick={handleProtectedClick}>
        {isLoggedIn ? '进入仪表盘' : '登录'}
      </button>
    </div>
  )
}
```

### 编程式导航

#### 服务端重定向

```typescript
// app/dashboard/page.tsx
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()

  // ✅ 未登录：重定向到登录页
  if (!session) {
    redirect('/login')
  }

  return <div>欢迎，{session.user.name}</div>
}
```

#### 带参数的重定向

```typescript
// app/login/page.tsx
import { redirect } from 'next/navigation'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  const session = await getSession()

  if (session) {
    // ✅ 登录成功：重定向到原始页面
    redirect(searchParams.redirect || '/dashboard')
  }

  return <div>登录页面</div>
}
```

#### 永久重定向

```typescript
// app/old-page/page.tsx
import { permanentRedirect } from 'next/navigation'

export default function OldPage() {
  // ✅ 永久重定向（301）
  permanentRedirect('/new-page')
}
```

### 滚动行为

#### 默认滚动行为

```typescript
// Next.js默认行为：
// 1. 导航到新页面时，滚动到顶部
// 2. 使用浏览器后退/前进时，恢复之前的位置

import Link from 'next/link'

export default function DefaultScroll() {
  return (
    <Link href="/about">
      {/* 点击后会滚动到顶部 */}
      关于我们
    </Link>
  )
}
```

#### 禁用滚动到顶部

```typescript
import Link from 'next/link'

export default function NoScrollExample() {
  return (
    <Link href="/section" scroll={false}>
      {/* 导航后保持当前位置 */}
      跳转但不滚动
    </Link>
  )
}
```

#### 平滑滚动到元素

```typescript
'use client'

import { useEffect } from 'react'

export default function ScrollToElement() {
  useEffect(() => {
    // ✅ 平滑滚动到指定元素
    const element = document.getElementById('my-section')
    element?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div>
      <section id="my-section">
        <h2>我的部分</h2>
      </section>
    </div>
  )
}
```

#### 保持滚动位置

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PreserveScrollPosition() {
  const router = useRouter()
  const [scrollPos, setScrollPos] = useState(0)

  const handleClick = () => {
    // ✅ 保存当前滚动位置
    setScrollPos(window.scrollY)

    // 导航到新页面
    router.push('/new-page')
  }

  useEffect(() => {
    // ✅ 恢复滚动位置
    window.scrollTo(0, scrollPos)
  }, [scrollPos])

  return (
    <button onClick={handleClick}>
      跳转并保持滚动位置
    </button>
  )
}
```

### 实战案例：导航菜单系统

#### 1. 全局导航组件

```typescript
// components/Navigation.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon?: string
  children?: NavItem[]
}

const navigation: NavItem[] = [
  { name: '首页', href: '/', icon: '🏠' },
  {
    name: '产品',
    href: '/products',
    icon: '📦',
    children: [
      { name: '所有产品', href: '/products' },
      { name: '分类', href: '/products/categories' },
      { name: '新品', href: '/products/new' },
    ],
  },
  { name: '关于', href: '/about', icon: 'ℹ️' },
  { name: '联系', href: '/contact', icon: '📧' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            MyStore
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} pathname={pathname} />
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navigation.map((item) => (
              <MobileNavItem
                key={item.name}
                item={item}
                pathname={pathname}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

// Desktop Nav Item
function NavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const isActive = pathname === item.href

  return (
    <div
      className="relative group"
      onMouseEnter={() => item.children && setIsOpen(true)}
      onMouseLeave={() => item.children && setIsOpen(false)}
    >
      <Link
        href={item.href}
        className={`flex items-center space-x-1 py-2 transition-colors ${
          isActive
            ? 'text-blue-600 font-semibold'
            : 'text-gray-700 hover:text-blue-600'
        }`}
      >
        {item.icon && <span>{item.icon}</span>}
        <span>{item.name}</span>
        {item.children && <span>▼</span>}
      </Link>

      {/* Dropdown Menu */}
      {item.children && isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
          {item.children.map((child) => (
            <Link
              key={child.name}
              href={child.href}
              className={`block px-4 py-2 hover:bg-gray-100 ${
                pathname === child.href ? 'text-blue-600 font-semibold' : 'text-gray-700'
              }`}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Mobile Nav Item
function MobileNavItem({
  item,
  pathname,
  onClick,
}: {
  item: NavItem
  pathname: string
  onClick: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isActive = pathname === item.href

  return (
    <div>
      <Link
        href={item.href}
        onClick={onClick}
        className={`flex items-center justify-between px-4 py-2 rounded-lg ${
          isActive
            ? 'bg-blue-50 text-blue-600 font-semibold'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="flex items-center space-x-2">
          {item.icon && <span>{item.icon}</span>
          <span>{item.name}</span>
        </span>
        {item.children && (
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsOpen(!isOpen)
            }}
            className="p-1"
          >
            {isOpen ? '▲' : '▼'}
          </button>
        )}
      </Link>

      {/* Mobile Dropdown */}
      {item.children && isOpen && (
        <div className="ml-4 mt-2 space-y-1">
          {item.children.map((child) => (
            <Link
              key={child.name}
              href={child.href}
              onClick={onClick}
              className={`block px-4 py-2 rounded-lg text-sm ${
                pathname === child.href
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

#### 2. 面包屑导航

```typescript
// components/Breadcrumbs.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Breadcrumbs() {
  const pathname = usePathname()

  // ✅ 生成面包屑
  const breadcrumbs = pathname.split('/').filter(Boolean).map((path, index, array) => {
    const href = `/${array.slice(0, index + 1).join('/')}`
    const label = path.charAt(0).toUpperCase() + path.slice(1)

    return { href, label }
  })

  // ✅ 添加首页
  const allBreadcrumbs = [{ href: '/', label: '首页' }, ...breadcrumbs]

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      {allBreadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          {index > 0 && <span className="text-gray-400 mx-2">/</span>}

          {index === allBreadcrumbs.length - 1 ? (
            // 当前页面
            <span className="text-gray-900 font-semibold">
              {crumb.label}
            </span>
          ) : (
            // 可点击链接
            <Link
              href={crumb.href}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

// ✅ 自定义标签映射
const labelMap: Record<string, string> = {
  dashboard: '仪表盘',
  settings: '设置',
  profile: '个人资料',
  projects: '项目',
}

export function CustomBreadcrumbs() {
  const pathname = usePathname()

  const breadcrumbs = pathname.split('/').filter(Boolean).map((path, index, array) => {
    const href = `/${array.slice(0, index + 1).join('/')}`
    const label = labelMap[path] || path.charAt(0).toUpperCase() + path.slice(1)

    return { href, label }
  })

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link href="/" className="text-gray-600 hover:text-blue-600">
        首页
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          <span className="text-gray-400 mx-2">/</span>
          {index === breadcrumbs.length - 1 ? (
            <span className="text-gray-900 font-semibold">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-gray-600 hover:text-blue-600">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
```

#### 3. 分页导航

```typescript
// components/Pagination.tsx
'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // ✅ 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      // 如果总页数<=7，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 总页数>7，显示部分页码
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      pages.push(totalPages)
    }

    return pages
  }

  const pages = getPageNumbers()

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `${baseUrl}?${params.toString()}`
  }

  const handlePageChange = (page: number) => {
    router.push(buildUrl(page))
  }

  return (
    <div className="flex items-center justify-center space-x-2 my-8">
      {/* 上一页 */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        上一页
      </button>

      {/* 页码 */}
      {pages.map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 border rounded-lg ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-2 text-gray-400">
            {page}
          </span>
        )
      )}

      {/* 下一页 */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        下一页
      </button>
    </div>
  )
}
```

#### 4. Tab导航

```typescript
// components/Tabs.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Tab {
  label: string
  href: string
  icon?: string
}

interface TabsProps {
  tabs: Tab[]
  basePath: string
}

export default function Tabs({ tabs, basePath }: TabsProps) {
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 -mb-px">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const isDescendant = pathname.startsWith(tab.href + '/')

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  isActive || isDescendant
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// 使用示例
export function ProfileTabs() {
  const tabs = [
    { label: '概览', href: '/profile', icon: '📊' },
    { label: '文章', href: '/profile/posts', icon: '📝' },
    { label: '评论', href: '/profile/comments', icon: '💬' },
    { label: '设置', href: '/profile/settings', icon: '⚙️' },
  ]

  return <Tabs tabs={tabs} basePath="/profile" />
}
```

### 导航最佳实践

#### 1. 性能优化

```typescript
// ✅ 推荐：使用Link组件进行客户端导航
import Link from 'next/link'

export default function OptimizedNavigation() {
  return (
    <nav>
      {/* 客户端导航：快速、支持预取 */}
      <Link href="/dashboard" prefetch={true}>
        仪表盘
      </Link>

      {/* 重要页面：立即预取 */}
      <Link href="/checkout" prefetch={true}>
        结账
      </Link>

      {/* 很少访问：不预取 */}
      <Link href="/help/faq" prefetch={false}>
        FAQ
      </Link>
    </nav>
  )
}

// ❌ 不推荐：使用a标签进行内部导航
export default function BadNavigation() {
  return (
    <nav>
      {/* 这会导致完整页面刷新 */}
      <a href="/dashboard">仪表盘</a>
    </nav>
  )
}
```

#### 2. 可访问性

```typescript
// ✅ 推荐：可访问的导航
import Link from 'next/link'

export default function AccessibleNavigation() {
  return (
    <nav aria-label="主导航">
      <ul className="space-y-2">
        <li>
          <Link
            href="/home"
            aria-label="前往首页"
            className="block px-4 py-2 hover:bg-gray-100 rounded"
          >
            首页
          </Link>
        </li>

        <li>
          <Link
            href="/about"
            aria-label="了解关于我们"
            className="block px-4 py-2 hover:bg-gray-100 rounded"
          >
            关于
          </Link>
        </li>

        <li>
          <Link
            href="/contact"
            aria-label="联系我们"
            className="block px-4 py-2 hover:bg-gray-100 rounded"
          >
            联系
          </Link>
        </li>
      </ul>
    </nav>
  )
}
```

#### 3. 活动状态管理

```typescript
// ✅ 推荐：清晰的视觉反馈
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ActiveLink() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: '仪表盘' },
    { href: '/dashboard/analytics', label: '分析' },
    { href: '/dashboard/settings', label: '设置' },
  ]

  return (
    <nav>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const isParent = pathname.startsWith(item.href + '/')

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              block px-4 py-2 rounded-lg mb-2 transition-all
              ${
                isActive || isParent
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
```

### 本章小结

| 导航方式 | Hook/组件 | 使用场景 | 性能 |
|---------|----------|---------|------|
| **Link组件** | `<Link>` | 声明式导航 | 客户端路由，支持预取 |
| **useRouter** | `useRouter()` | 编程式导航 | 客户端路由 |
| **usePathname** | `usePathname()` | 获取当前路径 | 只读Hook |
| **useSearchParams** | `useSearchParams()` | 获取查询参数 | 只读Hook |
| **redirect** | `redirect()` | 服务端重定向 | 服务端 |
| **permanentRedirect** | `permanentRedirect()` | 永久重定向(301) | 服务端 |

| 最佳实践 | 说明 |
|---------|------|
| **内部链接** | 使用`<Link>`组件 |
| **外部链接** | 使用`<a>`标签 |
| **程序导航** | 使用`router.push()` |
| **服务端重定向** | 使用`redirect()` |
| **活动状态** | 使用`usePathname()`判断 |
| **预取优化** | 重要页面启用预取 |
| **滚动控制** | 使用`scroll`属性 |
| **可访问性** | 添加`aria-label`和`aria-current` |

---

**下一步学习**：建议继续学习[数据获取与缓存](./chapter-87)了解Next.js的数据获取策略。
