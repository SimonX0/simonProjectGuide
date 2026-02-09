# Client Components使用

## Client Components使用

> **学习目标**：掌握Client Components的使用方法、最佳实践以及与Server Components的协作模式
> **核心内容**：'use client'指令、使用场景、组件交互、状态管理、实战案例

### 'use client'指令详解

#### 什么是'use client'指令

**'use client'** 是一个文件级别的指令，标记该文件中的组件为Client Component。当使用这个指令时，该组件及其所有子组件都会在客户端渲染。

```
┌─────────────────────────────────────────────────────────────┐
│           'use client' 指令边界                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Server Component (app/page.tsx)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✅ 可以访问服务器资源                               │   │
│  │  ✅ 可以直接查询数据库                               │   │
│  │  ✅ 可以使用文件系统API                              │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  'use client' (components/Button.tsx)       │   │   │
│  │  │  ├─ useState                                │   │   │
│  │  │  ├─ useEffect                                │   │   │
│  │  │  ├─ onClick 事件                             │   │   │
│  │  │  └─ 子组件自动成为Client Component           │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 指令放置位置

```typescript
// ✅ 正确：文件顶部
'use client'

import { useState } from 'react'

export default function MyComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// ❌ 错误：在import之后
import { useState } from 'react'
'use client'  // 错误：必须在最顶部

// ✅ 正确：在注释之后（注释不算代码）
// 这是一个交互式按钮组件
'use client'

import { useState } from 'react'
```

### 何时使用Client Components

#### 场景1：使用React Hooks

```typescript
// components/Counter.tsx
'use client'

import { useState, useCallback, useMemo } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)

  // 使用useCallback
  const increment = useCallback(() => {
    setCount(c => c + step)
  }, [step])

  // 使用useMemo
  const doubledCount = useMemo(() => count * 2, [count])

  return (
    <div>
      <p>当前计数: {count}</p>
      <p>双倍计数: {doubledCount}</p>
      <button onClick={increment}>增加 {step}</button>
      <button onClick={() => setStep(s => s + 1)}>
        增加步长
      </button>
    </div>
  )
}
```

#### 场景2：浏览器API

```typescript
// components/GeoLocation.tsx
'use client'

import { useState, useEffect } from 'react'

export default function GeoLocation() {
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('浏览器不支持地理定位')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        setError(error.message)
      }
    )
  }, [])

  if (error) return <div>错误: {error}</div>
  if (!location) return <div>获取位置中...</div>

  return (
    <div>
      <p>纬度: {location.latitude}</p>
      <p>经度: {location.longitude}</p>
    </div>
  )
}
```

```typescript
// components/LocalStorage.tsx
'use client'

import { useState, useEffect } from 'react'

export default function LocalStorageExample() {
  const [name, setName] = useState('')
  const [storedName, setStoredName] = useState('')

  // 从localStorage读取
  useEffect(() => {
    const savedName = localStorage.getItem('name')
    if (savedName) {
      setStoredName(savedName)
    }
  }, [])

  // 保存到localStorage
  const handleSave = () => {
    localStorage.setItem('name', name)
    setStoredName(name)
  }

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="输入你的名字"
      />
      <button onClick={handleSave}>保存</button>
      {storedName && <p>保存的名字: {storedName}</p>}
    </div>
  )
}
```

#### 场景3：事件处理

```typescript
// components/InteractiveForm.tsx
'use client'

import { useState, FormEvent } from 'react'

export default function InteractiveForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // 验证表单
    const newErrors: { email?: string; password?: string } = {}

    if (!email.includes('@')) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (password.length < 6) {
      newErrors.password = '密码至少需要6个字符'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      // 提交表单
      console.log('提交:', { email, password })
    }
  }

  const handleReset = () => {
    setEmail('')
    setPassword('')
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>邮箱</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <label>密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <button type="submit">提交</button>
      <button type="button" onClick={handleReset}>重置</button>
    </form>
  )
}
```

#### 场景4：使用React Context

```typescript
// contexts/ThemeContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // 从localStorage读取主题
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // 更新document class和localStorage
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

```typescript
// components/ThemeToggle.tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded-lg border"
    >
      切换到 {theme === 'light' ? '暗色' : '亮色'}模式
    </button>
  )
}
```

### 服务端组件中嵌套客户端组件

#### 基础嵌套示例

```typescript
// app/page.tsx (Server Component)
import InteractiveButton from '@/components/InteractiveButton'

export default async function Page() {
  const data = await fetch('https://api.example.com/data')
    .then(r => r.json())

  return (
    <div>
      <h1>欢迎</h1>
      <p>{data.title}</p>

      {/* Server Component渲染Client Component */}
      <InteractiveButton />
    </div>
  )
}
```

#### 传递数据到Client Components

```typescript
// components/UserProfile.tsx
'use client'

import { useState } from 'react'

interface UserProfileProps {
  name: string
  email: string
  avatar?: string
}

export default function UserProfile({ name, email, avatar }: UserProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <div className="user-profile">
      <img src={avatar || '/default-avatar.png'} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
      <button onClick={() => setIsFollowing(!isFollowing)}>
        {isFollowing ? '取消关注' : '关注'}
      </button>
    </div>
  )
}
```

```typescript
// app/users/[id]/page.tsx (Server Component)
import { db } from '@/lib/db'
import UserProfile from '@/components/UserProfile'

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await db.user.findUnique({
    where: { id: params.id },
    select: {
      name: true,
      email: true,
      avatar: true,
    },
  })

  if (!user) {
    return <div>用户未找到</div>
  }

  // ✅ 传递序列化数据到Client Component
  return (
    <div>
      <h1>用户详情</h1>
      <UserProfile {...user} />
    </div>
  )
}
```

#### 传递函数的模式

```typescript
// ❌ 错误：不能从Server Component传递函数到Client Component
// app/page.tsx
export default function Page() {
  const handleClick = () => {
    console.log('clicked')
  }

  return <ClientComponent onClick={handleClick} />
}

// ✅ 正确：在Client Component内部处理
// components/ClientComponent.tsx
'use client'

import { useState } from 'react'

interface ClientComponentProps {
  data: any
}

export default function ClientComponent({ data }: ClientComponentProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => {
    setIsOpen(!isOpen)
    // 这里处理点击逻辑
  }

  return (
    <div>
      <button onClick={handleClick}>Toggle</button>
      {isOpen && <div>{data.title}</div>}
    </div>
  )
}
```

#### 使用Server Actions

```typescript
// app/actions.ts
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const post = await db.post.create({
    data: { title, content },
  })

  revalidatePath('/blog')
  return post
}
```

```typescript
// components/CreatePostForm.tsx
'use client'

import { useTransition } from 'react'
import { createPost } from '@/app/actions'

export default function CreatePostForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      await createPost(formData)
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="标题" />
      <textarea name="content" placeholder="内容" />
      <button disabled={isPending}>
        {isPending ? '创建中...' : '创建文章'}
      </button>
    </form>
  )
}
```

### 组件组合最佳实践

#### 1. 保持Client Components在叶节点

```typescript
// ✅ 推荐：只在交互组件使用'use client'
// app/blog/page.tsx (Server Component)
export default async function BlogPage() {
  const posts = await db.post.findMany()

  return (
    <div>
      <h1>博客</h1>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

// components/PostCard.tsx (Server Component)
export default function PostCard({ post }: { post: any }) {
  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
      <LikeButton postId={post.id} initialLikes={post.likes} />
    </article>
  )
}

// components/LikeButton.tsx (Client Component)
'use client'
export default function LikeButton({ postId, initialLikes }: any) {
  const [likes, setLikes] = useState(initialLikes)
  return <button onClick={() => setLikes(l => l + 1)}>{likes}</button>
}
```

#### 2. 避免不必要的Client Components

```typescript
// ❌ 不推荐：整个组件树都是Client Component
'use client'

export default function Page() {
  return (
    <div>
      <Header />
      <Main />
      <Footer />
    </div>
  )
}

// ✅ 推荐：只在需要交互的部分使用
export default function Page() {
  return (
    <div>
      <Header />  {/* Server Component */}
      <Main />    {/* Server Component */}
      <Footer />  {/* Server Component */}
    </div>
  )
}

// components/Header.tsx (Server Component)
export default function Header() {
  return (
    <header>
      <Logo />           {/* Server Component */}
      <Navigation />     {/* Server Component */}
      <SearchBar />      {/* Client Component */}
    </header>
  )
}
```

#### 3. 使用Props drilling而非Context跨边界

```typescript
// ❌ 不推荐：跨Server/Client边界使用Context
// app/page.tsx
export default function Page() {
  return (
    <ThemeProvider>
      <ChildComponent />
    </ThemeProvider>
  )
}

// ✅ 推荐：传递必要的数据
// app/page.tsx
export default async function Page() {
  const user = await getCurrentUser()
  const theme = user.settings.theme

  return (
    <div>
      <ChildComponent theme={theme} />
    </div>
  )
}
```

### 高级模式

#### 1. 组合多个Client Components

```typescript
// components/DataTable.tsx
'use client'

import { useState, useMemo } from 'react'
import SearchBar from './SearchBar'
import SortableHeader from './SortableHeader'
import Pagination from './Pagination'

interface DataTableProps {
  data: any[]
  columns: { key: string; label: string }[]
}

export default function DataTable({ data, columns }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredAndSortedData = useMemo(() => {
    return data
      .filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      .sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
  }, [data, searchQuery, sortColumn, sortDirection])

  return (
    <div>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <table>
        <thead>
          <tr>
            {columns.map(column => (
              <SortableHeader
                key={column.key}
                column={column}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={setSortColumn}
                onDirectionChange={setSortDirection}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedData.map((row, index) => (
            <tr key={index}>
              {columns.map(column => (
                <td key={column.key}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        total={filteredAndSortedData.length}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
```

#### 2. 客户端数据获取

```typescript
// components/UserSearch.tsx
'use client'

import { useState, useEffect } from 'react'

export default function UserSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/users/search?q=${query}`)
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索用户..."
      />

      {loading && <div>搜索中...</div>}

      <ul>
        {results.map((user: any) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

#### 3. 错误边界

```typescript
// components/ErrorBoundary.tsx
'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error">
            <h2>出错了</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={() => this.setState({ hasError: false })}>
              重试
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

### 实战案例：交互式组件库

让我们创建一套完整的交互式组件。

#### 1. Modal组件

```typescript
// components/Modal.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ModalContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function Modal({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </ModalContext.Provider>
  )
}

export function ModalTrigger({ children }: { children: ReactNode }) {
  const context = useContext(ModalContext)
  if (!context) throw new Error('ModalTrigger must be used within Modal')

  return (
    <button onClick={context.open}>
      {children}
    </button>
  )
}

export function ModalContent({ children, title }: { children: ReactNode; title: string }) {
  const context = useContext(ModalContext)
  if (!context) throw new Error('ModalContent must be used within Modal')

  if (!context.isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={context.close} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={context.close} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

#### 2. Tabs组件

```typescript
// components/Tabs.tsx
'use client'

import { useState, createContext, useContext, ReactNode } from 'react'

interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export function Tabs({ children, defaultValue }: { children: ReactNode; defaultValue: string }) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children }: { children: ReactNode }) {
  return (
    <div className="flex border-b">
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const isActive = context.activeTab === value

  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={`px-4 py-2 font-medium ${
        isActive
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children }: { value: string; children: ReactNode }) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  if (context.activeTab !== value) return null

  return (
    <div className="py-4">
      {children}
    </div>
  )
}
```

#### 3. Toast组件

```typescript
// components/Toast.tsx
'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type: 'success' | 'error' | 'info') => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, message, type }])

    // 自动移除
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const context = useContext(ToastContext)
  if (!context) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {context.toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          } text-white`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToasterProvider')
  return context
}
```

#### 4. 组合使用示例

```typescript
// app/dashboard/page.tsx (Server Component)
import { db } from '@/lib/db'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs'
import { Modal, ModalTrigger, ModalContent } from '@/components/Modal'
import CreateProjectForm from '@/components/CreateProjectForm'

export default async function DashboardPage() {
  const projects = await db.project.findMany()
  const teams = await db.team.findMany()

  return (
    <div>
      <h1>仪表盘</h1>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">项目</TabsTrigger>
          <TabsTrigger value="teams">团队</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="flex justify-between items-center mb-4">
            <h2>我的项目</h2>
            <Modal>
              <ModalTrigger>新建项目</ModalTrigger>
              <ModalContent title="创建新项目">
                <CreateProjectForm />
              </ModalContent>
            </Modal>
          </div>

          <div>
            {projects.map(project => (
              <div key={project.id}>{project.name}</div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <h2>我的团队</h2>
          <div>
            {teams.map(team => (
              <div key={team.id}>{team.name}</div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 性能优化

#### 1. 使用useMemo和useCallback

```typescript
// components/ExpensiveList.tsx
'use client'

import { useState, useMemo, useCallback } from 'react'

export default function ExpensiveList({ items }: { items: any[] }) {
  const [filter, setFilter] = useState('')

  // 使用useMemo缓存计算结果
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [items, filter])

  // 使用useCallback缓存函数
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value)
  }, [])

  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={handleFilterChange}
        placeholder="过滤..."
      />
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

#### 2. 代码分割

```typescript
// app/page.tsx
import dynamic from 'next/dynamic'

// 动态导入重型组件
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>加载中...</div>,
  ssr: false,
})

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  loading: () => <div>加载编辑器...</div>,
})

export default function Page() {
  return (
    <div>
      <h1>数据分析</h1>
      <HeavyChart />
      <RichTextEditor />
    </div>
  )
}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| 'use client'指令 | 位置、作用、边界 | 理解并正确使用 |
| 使用场景 | Hooks、浏览器API、事件、Context | 能够识别何时使用 |
| 组件嵌套 | Server中嵌套Client、数据传递 | 掌握组合模式 |
| 高级模式 | 组合组件、错误边界、性能优化 | 能够应用 |
| 实战应用 | 交互式组件库 | 能够独立开发 |

---

**下一步学习**：建议继续学习[静态生成（SSG）](./chapter-89)了解Next.js的静态站点生成。
