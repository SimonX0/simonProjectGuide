# 错误处理与加载状态

## 错误处理与加载状态

> **学习目标**：掌握Next.js的错误处理和加载状态管理，提升用户体验
> **核心内容**：error.js、loading.js、Error Boundaries、加载状态优化、实战案例

### 错误处理系统

#### Next.js错误处理架构

```
┌─────────────────────────────────────────────────────────────┐
│           Next.js 错误处理层级                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  全局级别 (root error.tsx)                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • 捕获所有未处理的错误                              │   │
│  │  • 必须是Client Component                            │   │
│  │  • 显示备用UI                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│              ↓                                               │
│  路由级别 (app/*/error.tsx)                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • 捕获特定路由的错误                                │   │
│  │  • 可以嵌套                                         │   │
│  │  • 提供重试功能                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│              ↓                                               │
│  组件级别 (Error Boundaries)                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • 捕获子组件的错误                                  │   │
│  │  • 使用React Error Boundaries                       │   │
│  │  • 局部错误隔离                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### error.js

#### 1. 全局错误处理

```typescript
// app/error.tsx
'use client' // 必须是Client Component

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录错误到错误报告服务
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            出错了
          </h1>
          <p className="text-gray-600 mb-8">
            {error.message || '页面加载时发生错误'}
          </p>

          {/* Error Digest (生产环境) */}
          {process.env.NODE_ENV === 'production' && error.digest && (
            <p className="text-xs text-gray-500 mb-8">
              错误代码: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button onClick={reset} className="w-full">
              重试
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="w-full"
            >
              返回首页
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 2. 路由级错误处理

```typescript
// app/dashboard/error.tsx
'use client'

import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            仪表盘加载失败
          </h2>
          <p className="text-gray-600">
            {error.message || '无法加载仪表盘数据'}
          </p>
        </div>

        {/* Error Details (开发环境) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              错误详情
            </summary>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={reset} className="flex-1">
            重试
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            刷新页面
          </Button>
        </div>
      </div>
    </div>
  )
}
```

#### 3. 特定类型错误处理

```typescript
// app/blog/[slug]/error.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // 根据错误类型显示不同消息
  const getErrorMessage = () => {
    if (error.message.includes('not found')) {
      return '文章未找到'
    }
    if (error.message.includes('unauthorized')) {
      return '您没有权限查看此文章'
    }
    return '文章加载失败'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {getErrorMessage()}
        </h1>
        <p className="text-gray-600 mb-8">
          {error.message}
        </p>

        <div className="flex justify-center gap-4">
          <Button onClick={reset}>重试</Button>
          <Link href="/blog">
            <Button variant="outline">返回博客列表</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### loading.js

#### 1. 全局加载状态

```typescript
// app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />

        {/* Loading Text */}
        <p className="text-gray-600">加载中...</p>
      </div>
    </div>
  )
}
```

#### 2. 路由级加载状态

```typescript
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Skeleton Header */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>

        {/* Skeleton Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Skeleton Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
```

#### 3. 组件级加载状态

```typescript
// components/DataTable.tsx
'use client'

import { useState, useEffect } from 'react'

interface DataTableProps {
  fetchData: () => Promise<any[]>
}

export default function DataTable({ fetchData }: DataTableProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const result = await fetchData()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载数据失败')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [fetchData])

  if (loading) {
    return <DataTableSkeleton />
  }

  if (error) {
    return <DataTableError error={error} />
  }

  return <DataTableContent data={data} />
}

function DataTableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  )
}

function DataTableError({ error }: { error: string }) {
  return (
    <div className="p-4 bg-red-50 text-red-700 rounded-lg">
      {error}
    </div>
  )
}

function DataTableContent({ data }: { data: any[] }) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="p-4 bg-white rounded-lg shadow-sm">
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

### Error Boundaries

#### 1. React Error Boundary

```typescript
// components/ErrorBoundary.tsx
'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // 调用自定义错误处理器
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                组件加载失败
              </h2>
              <p className="text-gray-600 mb-6">
                {this.state.error?.message || '发生未知错误'}
              </p>
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                重试
              </Button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

#### 2. 使用Error Boundary

```typescript
// app/dashboard/page.tsx
import ErrorBoundary from '@/components/ErrorBoundary'
import RiskyComponent from '@/components/RiskyComponent'

export default function DashboardPage() {
  return (
    <div>
      <h1>仪表盘</h1>

      {/* 用ErrorBoundary包裹可能出错的组件 */}
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // 发送到错误报告服务
          reportError(error, errorInfo)
        }}
      >
        <RiskyComponent />
      </ErrorBoundary>
    </div>
  )
}
```

### 实战案例：优雅的错误处理

创建一个包含多种错误处理场景的完整应用。

#### 1. 带重试的数据获取

```typescript
// lib/fetchWithRetry.ts
export async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  options: {
    retries?: number
    delay?: number
    onRetry?: (error: Error, attempt: number) => void
  } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, onRetry } = options

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetcher()
    } catch (error) {
      const isLastAttempt = attempt === retries

      if (isLastAttempt) {
        throw error
      }

      if (onRetry && error instanceof Error) {
        onRetry(error, attempt)
      }

      // 指数退避
      await new Promise(resolve =>
        setTimeout(resolve, delay * Math.pow(2, attempt - 1))
      )
    }
  }

  throw new Error('Maximum retries exceeded')
}
```

#### 2. 带加载状态的按钮

```typescript
// components/LoadingButton.tsx
'use client'

import { Button } from '@/components/ui/button'
import { useFormStatus } from 'react-dom'

interface LoadingButtonProps {
  children: React.ReactNode
  loadingText?: string
}

export function LoadingButton({ children, loadingText = '处理中...' }: LoadingButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button disabled={pending} type="submit">
      {pending ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </Button>
  )
}
```

#### 3. 服务器操作包装器

```typescript
// lib/withErrorHandling.ts
'use server'

import { revalidatePath } from 'next/cache'

type ActionFunction<T> = (formData: FormData) => Promise<T>

export function withErrorHandling<T>(
  action: ActionFunction<T>,
  options: {
    revalidatePaths?: string[]
    errorMessage?: string
  } = {}
): ActionFunction<T | { error: string }> {
  return async (formData: FormData) => {
    try {
      const result = await action(formData)

      // 重新验证路径
      if (options.revalidatePaths) {
        options.revalidatePaths.forEach(path => revalidatePath(path))
      }

      return result
    } catch (error) {
      console.error('Action error:', error)

      // 返回用户友好的错误消息
      if (error instanceof Error) {
        return {
          error: error.message || options.errorMessage || '操作失败，请稍后重试',
        }
      }

      return {
        error: options.errorMessage || '操作失败，请稍后重试',
      }
    }
  }
}
```

### 最佳实践

#### 1. 始终提供反馈

```typescript
// ✅ 好：提供加载和错误状态
'use client'

export default function DataList() {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  })

  if (state.loading) return <Loading />
  if (state.error) return <Error message={state.error} />
  return <List data={state.data} />
}

// ❌ 差：没有反馈
export default function DataList() {
  const [data, setData] = useState(null)
  return <div>{data && <List data={data} />}</div>
}
```

#### 2. 使用骨架屏

```typescript
// ✅ 好：使用骨架屏
export default function Loading() {
  return (
    <div>
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
    </div>
  )
}

// ❌ 差：只有文字
export default function Loading() {
  return <div>加载中...</div>
}
```

#### 3. 错误可恢复

```typescript
// ✅ 好：提供重试选项
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div>
      <p>加载失败</p>
      <button onClick={reset}>重试</button>
    </div>
  )
}

// ❌ 差：没有恢复选项
export default function Error() {
  return <div>加载失败</div>
}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| error.js | 全局和路由级错误处理 | 掌握实现方法 |
| loading.js | 加载状态和骨架屏 | 能够创建 |
| Error Boundaries | 组件级错误隔离 | 理解并应用 |
| 最佳实践 | 用户反馈、错误恢复 | 能够应用 |

---

**下一步学习**：建议继续学习[缓存策略与Revalidation](./chapter-96)了解缓存系统。
