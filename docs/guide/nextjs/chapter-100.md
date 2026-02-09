# 中间件（Middleware）

## 中间件（Middleware）

> **学习目标**：掌握Next.js中间件机制，实现路由保护和请求拦截
> **核心内容**：中间件基础、路由保护、重定向和重写、实战案例

### 中间件基础

#### 什么是中间件

**中间件（Middleware）** 是在请求完成之前运行的代码，允许您修改请求和响应对象。它位于页面和服务器之间，可以拦截所有传入的请求。

```
┌─────────────────────────────────────────────────────────────┐
│                    中间件执行流程                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  客户端请求                                                 │
│       ↓                                                     │
│  ┌─────────────────────────────────────────┐              │
│  │         Middleware (middleware.ts)       │              │
│  │  ┌──────────────────────────────────┐   │              │
│  │  │ 1. 验证请求                       │   │              │
│  │  │ 2. 修改请求头                     │   │              │
│  │  │ 3. 重定向/重写                    │   │              │
│  │  │ 4. 响应处理                       │   │              │
│  │  └──────────────────────────────────┘   │              │
│  └─────────────────────────────────────────┘              │
│       ↓                                                     │
│  Next.js 路由                                               │
│       ↓                                                     │
│  页面 / API 路由                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 创建中间件

**基本中间件结构**：

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 中间件逻辑
  return NextResponse.next()
}

// 配置中间件匹配路径
export const config = {
  matcher: '/about/:path*',
}
```

**matcher配置详解**：

```typescript
export const config = {
  // 单个路径
  matcher: '/about',

  // 多个路径
  matcher: ['/about', '/contact'],

  // 通配符匹配
  matcher: '/dashboard/:path*',

  // 正则表达式
  matcher: ['/api/:path*', '/((?!api/|_next/|_static/).*)'],

  // 函数形式（高级）
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

#### 中间件生命周期

**请求对象（NextRequest）**：

```typescript
import { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // URL信息
  console.log(request.url)           // 完整URL
  console.log(request.nextUrl)       // Next.js URL对象
  console.log(request.nextUrl.pathname)  // 路径

  // 请求头
  console.log(request.headers.get('user-agent'))

  // Cookies
  console.log(request.cookies.get('token'))

  // 地理位置信息
  console.log(request.geo)           // { country, city, region }

  // IP地址
  console.log(request.ip)
}
```

**响应对象（NextResponse）**：

```typescript
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 继续到下一个中间件或页面
  return NextResponse.next()

  // 重定向
  return NextResponse.redirect(new URL('/login', request.url))

  // 重写
  return NextResponse.rewrite(new URL('/about', request.url))

  // 自定义响应
  return new NextResponse('Custom response', {
    status: 200,
    headers: {
      'X-Custom-Header': 'value',
    },
  })
}
```

### 路由保护

#### 认证检查

**基础认证中间件**：

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 不需要认证的路径
const publicPaths = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否是公共路径
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // 获取token
  const token = request.cookies.get('token')

  // 没有token，重定向到登录页
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 验证token（示例）
  try {
    // 这里可以调用API验证token
    // const isValid = await verifyToken(token.value)
    // if (!isValid) {
    //   throw new Error('Invalid token')
    // }
    return NextResponse.next()
  } catch (error) {
    // Token无效，重定向到登录页
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}
```

**基于角色的访问控制**：

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 路径权限配置
const routePermissions: Record<string, string[]> = {
  '/dashboard': ['user', 'admin'],
  '/dashboard/admin': ['admin'],
  '/dashboard/settings': ['user', 'admin'],
  '/api/admin': ['admin'],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 获取用户角色
  const userRole = request.cookies.get('role')?.value

  if (!userRole) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 检查路径权限
  for (const [path, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(path)) {
      if (!allowedRoles.includes(userRole)) {
        // 权限不足
        return NextResponse.redirect(new URL('/403', request.url))
      }
    }
  }

  return NextResponse.next()
}
```

### 重定向和重写

#### 重定向（Redirect）

**临时重定向（307）**：

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // HTTP重定向到HTTPS
  if (request.headers.get('x-forwarded-proto') !== 'https') {
    const httpsUrl = `https://${request.headers.get('host')}${request.nextUrl.pathname}`
    return NextResponse.redirect(httpsUrl)
  }

  // 旧路径重定向到新路径
  if (request.nextUrl.pathname === '/old-path') {
    return NextResponse.redirect(new URL('/new-path', request.url))
  }

  return NextResponse.next()
}
```

**永久重定向（308）**：

```typescript
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/old-page') {
    return NextResponse.redirect(new URL('/new-page', request.url), {
      status: 308, // 永久重定向
    })
  }

  return NextResponse.next()
}
```

**条件重定向**：

```typescript
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // 移动端重定向
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent)

  if (isMobile && pathname === '/') {
    return NextResponse.redirect(new URL('/mobile', request.url))
  }

  // 带查询参数的重定向
  if (pathname === '/search' && !searchParams.has('q')) {
    return NextResponse.redirect(new URL('/?error=no-query', request.url))
  }

  return NextResponse.next()
}
```

#### 重写（Rewrite）

**URL重写**：

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /blog/* 重写到 /posts/*
  if (pathname.startsWith('/blog/')) {
    const newPath = pathname.replace('/blog/', '/posts/')
    return NextResponse.rewrite(new URL(newPath, request.url))
  }

  // 多语言支持
  if (pathname.startsWith('/en/')) {
    const newPath = pathname.replace('/en/', '/')
    const response = NextResponse.rewrite(new URL(newPath, request.url))
    response.cookies.set('lang', 'en')
    return response
  }

  return NextResponse.next()
}
```

**A/B测试重写**：

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 只对首页进行A/B测试
  if (pathname === '/') {
    // 获取用户ID（假设从cookie或header获取）
    const userId = request.cookies.get('user_id')?.value || 'guest'

    // 根据用户ID决定显示哪个版本
    const variant = parseInt(userId.slice(-1), 10) % 2 === 0 ? 'a' : 'b'

    if (variant === 'b') {
      // 重写到B版本
      return NextResponse.rewrite(new URL('/home-b', request.url))
    }
  }

  return NextResponse.next()
}
```

### 实战案例：认证中间件

让我们创建一个完整的认证和授权系统。

#### 1. 中间件实现

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 公共路径（不需要认证）
const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password']

// API路径（需要特殊处理）
const apiPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password']

// 管理员路径
const adminPaths = ['/dashboard/admin', '/api/admin']

// 验证JWT token
async function verifyToken(token: string): Promise<{ valid: boolean; payload?: any }> {
  try {
    // 这里应该调用你的验证逻辑
    // const payload = await jwtVerify(token, secret)
    // return { valid: true, payload }

    // 示例实现
    if (token === 'valid-token') {
      return { valid: true, payload: { role: 'user' } }
    }
    if (token === 'admin-token') {
      return { valid: true, payload: { role: 'admin' } }
    }
    return { valid: false }
  } catch (error) {
    return { valid: false }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. 检查是否是公共API路径
  if (apiPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 2. 检查是否是公共页面路径
  if (publicPaths.includes(pathname)) {
    // 如果已登录，重定向到dashboard
    const token = request.cookies.get('token')
    if (token) {
      const verification = await verifyToken(token.value)
      if (verification.valid) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  // 3. 检查是否是API路径（需要认证）
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const verification = await verifyToken(token.value)
    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // 检查管理员权限
    if (adminPaths.some(path => pathname.startsWith(path))) {
      if (verification.payload?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    // 添加用户信息到请求头
    const response = NextResponse.next()
    response.headers.set('x-user-id', verification.payload.sub)
    response.headers.set('x-user-role', verification.payload.role)
    return response
  }

  // 4. 检查是否是受保护的页面
  const token = request.cookies.get('token')

  if (!token) {
    // 没有token，重定向到登录页
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const verification = await verifyToken(token.value)
  if (!verification.valid) {
    // Token无效，重定向到登录页
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 检查管理员页面权限
  if (adminPaths.some(path => pathname.startsWith(path))) {
    if (verification.payload?.role !== 'admin') {
      return NextResponse.redirect(new URL('/403', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}
```

#### 2. 登录页面

```typescript
// app/login/page.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '登录失败')
      }

      // 登录成功，重定向
      router.push(redirect)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8">登录</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              忘记密码？
            </a>
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              还没有账号？{' '}
              <a href="/register" className="text-blue-600 hover:underline">
                注册
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 3. 认证API

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码是必需的' },
        { status: 400 }
      )
    }

    // 验证用户（示例）
    // const user = await authenticateUser(email, password)
    // if (!user) {
    //   return NextResponse.json(
    //     { error: '邮箱或密码错误' },
    //     { status: 401 }
    //   )
    // }

    // 示例：硬编码的用户
    const validUsers = {
      'user@example.com': { password: 'user123', role: 'user', token: 'valid-token' },
      'admin@example.com': { password: 'admin123', role: 'admin', token: 'admin-token' },
    }

    const user = validUsers[email as keyof typeof validUsers]

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 设置cookie
    const cookieStore = cookies()
    cookieStore.set('token', user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1周
    })
    cookieStore.set('role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({
      success: true,
      user: {
        email,
        role: user.role,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
```

#### 4. 受保护的Dashboard

```typescript
// app/dashboard/page.tsx
import { cookies } from 'next/headers'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')

  // 这个页面只在token有效时才能访问（由中间件保证）

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span>已登录</span>
              <a href="/api/auth/logout" className="text-blue-600 hover:underline">
                退出登录
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">欢迎回来！</h2>
          <p>这是一个受保护的页面，只有登录用户才能访问。</p>
        </div>
      </main>
    </div>
  )
}
```

### 最佳实践

#### 1. 性能优化

```typescript
// ✅ 推荐：只在需要的路径上运行中间件
export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
}

// ❌ 不推荐：在所有路径上运行中间件
export const config = {
  matcher: '/:path*',
}
```

#### 2. 错误处理

```typescript
// ✅ 推荐：优雅处理错误
export async function middleware(request: NextRequest) {
  try {
    // 中间件逻辑
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}
```

#### 3. 安全性

```typescript
// ✅ 推荐：使用安全的cookie设置
cookieStore.set('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
})
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| 中间件基础 | middleware.ts创建 | 熟练掌握 |
| matcher配置 | 路径匹配规则 | 熟练掌握 |
| 路由保护 | 认证和授权 | 掌握 |
| 重定向 | 临时/永久重定向 | 掌握 |
| 重写 | URL重写 | 理解 |
| 实际应用 | 认证系统 | 能够实现 |

---

**下一步学习**：建议继续学习[路由Handler与API](./chapter-101)了解如何构建完整的API系统。
