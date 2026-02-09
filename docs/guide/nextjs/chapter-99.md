# 拦截路由与Modals

## 拦截路由与Modals

> **学习目标**：掌握Next.js拦截路由机制，实现模态框等高级UI模式
> **核心内容**：拦截路由深入、模态框实现、条件拦截、实战案例

### 拦截路由深入

#### 什么是拦截路由

**拦截路由（Intercepting Routes）** 允许你拦截某个路由并从另一个上下文（如Modal）中显示它，使用`(..folder)`语法实现。

```
┌─────────────────────────────────────────────────────────────┐
│                    拦截路由工作原理                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  正常导航:                                                  │
│  /photos → /photos/123 (完全导航到新页面)                    │
│                                                             │
│  拦截导航:                                                  │
│  /feed → /photos/123 (在/feed页面上显示Modal)               │
│                                                             │
│  语法说明:                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ (.)             │  │ 匹配当前层级     │                 │
│  │ (..)            │  │ 匹配上一层级     │                 │
│  │ (..)(..)        │  │ 匹配上上一层级   │                 │
│  │ (...)           │  │ 匹配根层级       │                 │
│  └─────────────────┘  └─────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 拦截路由语法

**相对层级拦截**：

```typescript
// app/feed/page.tsx
// app/photos/page.tsx
// app/feed/(..)photos/ photo/[id]/page.tsx

// 文件结构:
app/
├── feed/
│   ├── page.tsx                    # /feed
│   └── (..)photos/                 # 拦截 /photos 中的路由
│       └── photo/
│           └── [id]/
│               └── page.tsx        # 在 /feed 中拦截 /photo/[id]
└── photos/
    └── photo/
        └── [id]/
            └── page.tsx            # /photos/photo/[id]
```

**工作流程**：

```
场景1: 从 /feed 点击图片链接
┌─────────────────────────────────────────┐
│ URL: /photos/photo/123                   │
│ 显示: /feed 页面 + Modal (覆盖层)        │
│ 历史记录: /feed → /photos/photo/123     │
└─────────────────────────────────────────┘

场景2: 直接访问 /photos/photo/123
┌─────────────────────────────────────────┐
│ URL: /photos/photo/123                   │
│ 显示: 完整的照片页面                      │
│ 历史记录: /photos/photo/123              │
└─────────────────────────────────────────┘
```

#### 拦截层级详解

**当前层级拦截 (.)**：

```typescript
// app/account/page.tsx
// app/account/(.)settings/page.tsx

// 从 /account 导航到 /settings 时
// 在 /account 页面上显示 Modal
app/
└── account/
    ├── page.tsx              # /account
    └── (.)settings/          # 拦截当前层级的 settings
        └── page.tsx          # Modal内容
```

**上一层级拦截 (..)**：

```typescript
// app/photos/page.tsx
// app/feed/(..)photos/photo/[id]/page.tsx

// 从 /feed 导航到 /photos/photo/123 时
// 在 /feed 页面上显示 Modal
app/
├── feed/
│   ├── page.tsx              # /feed
│   └── (..)photos/           # 向上一层级查找 photos
│       └── photo/
│           └── [id]/
│               └── page.tsx
└── photos/
    └── photo/
        └── [id]/
            └── page.tsx
```

**多层级拦截 (..)(..)**：

```typescript
// app/a/b/c/page.tsx
// app/d/(..)(..)b/page.tsx

// 从 /a/b/c 导航到 /b 时
// 需要向上两层找到 b
app/
├── a/
│   └── b/
│       ├── c/
│       │   └── page.tsx      # /a/b/c
│       └── page.tsx          # /a/b
└── d/
    └── (..)(..)b/
        └── page.tsx          # 拦截 /b
```

**根层级拦截 (...)**：

```typescript
// app/dashboard/(...)settings/page.tsx

// 从任何地方导航到 /settings 时
// 在当前页面显示 Modal
app/
├── dashboard/
│   ├── page.tsx
│   └── (...)settings/        # 拦截根层级的 settings
│       └── page.tsx
└── settings/
    └── page.tsx              # /settings
```

### 模态框实现

#### 基础Modal组件

**Modal实现**：

```typescript
// app/components/Modal.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ModalProps {
  children: React.ReactNode
}

export function Modal({ children }: ModalProps) {
  const router = useRouter()

  // ESC键关闭Modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [router])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => router.back()}
      />

      {/* Modal内容 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          aria-label="关闭"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {children}
      </div>
    </div>
  )
}
```

#### 照片库Modal示例

**项目结构**：

```
app/
├── feed/
│   ├── page.tsx                          # /feed
│   └── (..)photos/                       # 拦截 photos
│       └── photo/
│           └── [id]/
│               └── page.tsx              # Modal内容
└── photos/
    └── photo/
        └── [id]/
            └── page.tsx                  # 完整页面
```

**Feed页面**：

```typescript
// app/feed/page.tsx
import Link from 'next/link'

const photos = [
  { id: '1', url: '/photos/1.jpg', title: '美丽的风景' },
  { id: '2', url: '/photos/2.jpg', title: '城市夜景' },
  { id: '3', url: '/photos/3.jpg', title: '日落时分' },
  { id: '4', url: '/photos/4.jpg', title: '雪山风光' },
]

export default function FeedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">照片动态</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <Link
            key={photo.id}
            href={`/photos/photo/${photo.id}`}
            className="group"
          >
            <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">{photo.title}</h3>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

**Modal内容页面**：

```typescript
// app/feed/(..)photos/photo/[id]/page.tsx
import { Modal } from '@/app/components/Modal'
import { notFound } from 'next/navigation'

async function getPhoto(id: string) {
  const photos = {
    '1': { id: '1', url: '/photos/1.jpg', title: '美丽的风景', description: '拍摄于阿尔卑斯山' },
    '2': { id: '2', url: '/photos/2.jpg', title: '城市夜景', description: '繁华的都市夜晚' },
    '3': { id: '3', url: '/photos/3.jpg', title: '日落时分', description: '金色的夕阳' },
    '4': { id: '4', url: '/photos/4.jpg', title: '雪山风光', description: '壮丽的雪山景色' },
  }

  return photos[id as keyof typeof photos] || null
}

export default async function PhotoModal({
  params,
}: {
  params: { id: string }
}) {
  const photo = await getPhoto(await params.id)

  if (!photo) {
    notFound()
  }

  return (
    <Modal>
      <div className="p-6">
        <img
          src={photo.url}
          alt={photo.title}
          className="w-full rounded-lg"
        />

        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-2">{photo.title}</h2>
          <p className="text-gray-600">{photo.description}</p>
        </div>

        <div className="mt-6 flex gap-4">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            点赞
          </button>
          <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">
            收藏
          </button>
        </div>
      </div>
    </Modal>
  )
}
```

**完整照片页面**：

```typescript
// app/photos/photo/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getPhoto(id: string) {
  const photos = {
    '1': { id: '1', url: '/photos/1.jpg', title: '美丽的风景', description: '拍摄于阿尔卑斯山', photographer: '张三', date: '2024-01-15' },
    '2': { id: '2', url: '/photos/2.jpg', title: '城市夜景', description: '繁华的都市夜晚', photographer: '李四', date: '2024-01-14' },
  }

  return photos[id as keyof typeof photos] || null
}

export default async function PhotoPage({
  params,
}: {
  params: { id: string }
}) {
  const photo = await getPhoto(await params.id)

  if (!photo) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/photos" className="text-blue-600 hover:underline">
            ← 返回照片库
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full"
            />

            <div className="p-8">
              <h1 className="text-4xl font-bold mb-4">{photo.title}</h1>
              <p className="text-xl text-gray-600 mb-8">{photo.description}</p>

              <div className="flex items-center justify-between text-gray-600">
                <div>
                  <span className="font-medium">摄影师: </span>
                  {photo.photographer}
                </div>
                <div>
                  <span className="font-medium">拍摄日期: </span>
                  {photo.date}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 条件拦截

#### 路由条件判断

**基于来源的拦截**：

```typescript
// app/components/Modal.tsx
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ModalProps {
  children: React.ReactNode
}

export function Modal({ children }: ModalProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [previousPath, setPreviousPath] = useState('/')

  useEffect(() => {
    // 保存之前的路径
    setPreviousPath(pathname)
  }, [pathname])

  const handleClose = () => {
    // 返回到之前的页面
    if (previousPath.startsWith('/feed')) {
      router.push('/feed')
    } else {
      router.back()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-lg max-w-2xl w-full">
        {children}
      </div>
    </div>
  )
}
```

#### 动态Modal内容

**根据上下文显示不同内容**：

```typescript
// app/feed/(..)photos/photo/[id]/page.tsx
import { Modal } from '@/app/components/Modal'

export default async function PhotoModal({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { from?: string }
}) {
  const photo = await getPhoto(await params.id)
  const from = (await searchParams).from

  return (
    <Modal>
      {from === 'feed' ? (
        // 简洁的Modal视图
        <div className="p-4">
          <img src={photo.url} alt={photo.title} className="w-full rounded" />
          <h3 className="text-lg font-bold mt-2">{photo.title}</h3>
        </div>
      ) : (
        // 详细的Modal视图
        <div className="p-6">
          <img src={photo.url} alt={photo.title} className="w-full rounded" />
          <h2 className="text-2xl font-bold mt-4">{photo.title}</h2>
          <p className="text-gray-600 mt-2">{photo.description}</p>
          <div className="mt-4 flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">点赞</button>
            <button className="border px-4 py-2 rounded">收藏</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
```

### 实战案例：图片预览模态框

让我们创建一个完整的图片预览系统，包含多种Modal场景。

#### 1. 项目结构

```
app/
├── gallery/
│   ├── page.tsx                      # /gallery
│   ├── (..)login/
│   │   └── page.tsx                  # 登录Modal
│   └── (..)photos/
│       └── [id]/
│           └── page.tsx              # 照片Modal
├── photos/
│   └── [id]/
│       └── page.tsx                  # 完整照片页面
└── login/
    └── page.tsx                      # 完整登录页面
```

#### 2. Modal组件库

```typescript
// app/components/modals.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [router])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => router.back()}
      />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto animate-in fade-in zoom-in duration-200">
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({
  title,
  onClose,
}: {
  title: string
  onClose?: () => void
}) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between p-6 border-b">
      <h2 className="text-2xl font-bold">{title}</h2>
      <button
        onClick={() => onClose ? onClose() : router.back()}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
      {children}
    </div>
  )
}
```

#### 3. 照片预览Modal

```typescript
// app/gallery/(..)photos/[id]/page.tsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/app/components/modals'
import { notFound } from 'next/navigation'

async function getPhoto(id: string) {
  const photos = {
    '1': {
      id: '1',
      url: 'https://picsum.photos/1200/800?random=1',
      title: '山川湖泊',
      description: '壮丽的自然风光，展现大自然的鬼斧神工',
      photographer: '张三',
      likes: 1234,
      comments: 56,
    },
    '2': {
      id: '2',
      url: 'https://picsum.photos/1200/800?random=2',
      title: '城市建筑',
      description: '现代都市的建筑美学',
      photographer: '李四',
      likes: 2345,
      comments: 78,
    },
  }

  return photos[id as keyof typeof photos] || null
}

export default async function PhotoModal({
  params,
}: {
  params: { id: string }
}) {
  const photo = await getPhoto(await params.id)

  if (!photo) {
    notFound()
  }

  return (
    <Modal>
      <img
        src={photo.url}
        alt={photo.title}
        className="w-full h-auto max-h-[60vh] object-contain bg-black"
      />

      <ModalHeader title={photo.title} />

      <ModalBody>
        <p className="text-gray-600 text-lg mb-4">{photo.description}</p>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{photo.photographer}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{photo.likes}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{photo.comments}</span>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <button className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium">
          收藏
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          下载
        </button>
      </ModalFooter>
    </Modal>
  )
}
```

#### 4. 登录Modal

```typescript
// app/gallery/(..)login/page.tsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/app/components/modals'

export default function LoginModal() {
  return (
    <Modal>
      <ModalHeader title="登录到画廊" />

      <ModalBody>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">记住我</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              忘记密码？
            </a>
          </div>
        </form>
      </ModalBody>

      <ModalFooter>
        <button className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium">
          取消
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          登录
        </button>
      </ModalFooter>
    </Modal>
  )
}
```

#### 5. 画廊主页面

```typescript
// app/gallery/page.tsx
import Link from 'next/link'

const photos = [
  { id: '1', url: 'https://picsum.photos/400/300?random=1', title: '山川湖泊' },
  { id: '2', url: 'https://picsum.photos/400/300?random=2', title: '城市建筑' },
  { id: '3', url: 'https://picsum.photos/400/300?random=3', title: '海滩日落' },
  { id: '4', url: 'https://picsum.photos/400/300?random=4', title: '森林小径' },
  { id: '5', url: 'https://picsum.photos/400/300?random=5', title: '雪山风光' },
  { id: '6', url: 'https://picsum.photos/400/300?random=6', title: '瀑布景观' },
]

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">照片画廊</h1>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              登录
            </Link>
          </div>
        </div>
      </header>

      {/* 照片网格 */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              href={`/photos/${photo.id}`}
              className="group"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{photo.title}</h3>
                    <p className="text-sm opacity-90">点击查看详情</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
```

### 最佳实践

#### 1. Modal状态管理

```typescript
// ✅ 推荐：使用router.back()关闭Modal
export function Modal() {
  const router = useRouter()
  return (
    <div>
      <button onClick={() => router.back()}>关闭</button>
    </div>
  )
}

// ❌ 不推荐：使用状态管理Modal
export function Modal() {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <div>
      <button onClick={() => setIsOpen(false)}>关闭</button>
    </div>
  )
}
```

#### 2. 键盘交互

```typescript
// ✅ 推荐：支持ESC键关闭
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      router.back()
    }
  }
  document.addEventListener('keydown', handleEscape)
  return () => document.removeEventListener('keydown', handleEscape)
}, [router])
```

#### 3. 滚动锁定

```typescript
// ✅ 推荐：Modal打开时锁定背景滚动
useEffect(() => {
  document.body.style.overflow = 'hidden'
  return () => {
    document.body.style.overflow = 'unset'
  }
}, [])
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| 拦截路由 | (.), (..), (...) 语法 | 熟练掌握 |
| Modal实现 | 固定定位+背景遮罩 | 掌握 |
| 条件拦截 | 基于来源的拦截 | 理解 |
| 键盘交互 | ESC键关闭 | 掌握 |
| 滚动锁定 | 防止背景滚动 | 掌握 |
| 实际应用 | 照片预览、登录Modal | 能够实现 |

---

**下一步学习**：建议继续学习[中间件（Middleware）](./chapter-100)了解路由保护和认证。
