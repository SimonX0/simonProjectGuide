# Server Components完全指南

## Server Components完全指南

> **学习目标**：深入理解React Server Components，掌握其核心概念和使用场景
> **核心内容**：RSC基础、Server vs Client Components、使用场景、最佳实践、实战案例

### Server Components概述

#### 什么是React Server Components

**React Server Components (RSC)** 是React 18引入的新特性，允许组件在服务器上渲染，只将必要的UI发送到客户端。Next.js 14+的App Router默认使用Server Components。

```
┌─────────────────────────────────────────────────────────────┐
│              Server Components 工作流程                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  服务器端                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Server Component 渲染                            │   │
│  │  ├─ 直接访问数据库                                   │   │
│  │  ├─ 读取文件系统                                     │   │
│  │  ├─ 调用内部API                                      │   │
│  │  └─ 生成React元素树                                  │   │
│  │             ↓                                        │   │
│  │  2. 序列化为特殊格式                                  │   │
│  │     (类似JSON的React树)                              │   │
│  └─────────────────────────────────────────────────────┘   │
│              ↓ 发送到客户端                                │
│  客户端                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  3. React在客户端重建UI                              │   │
│  │  ├─ Client Components交互                            │   │
│  │  └─ 保持响应性                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Server Components的优势

| 优势 | 说明 | 示例 |
|------|------|------|
| **零bundle大小** | Server Components代码不发送到客户端 | 数据库查询逻辑 |
| **直接访问后端** | 可直接访问数据库、文件系统等 | `fs`、`bcrypt`等 |
| **自动代码分割** | Server Components自动分割 | 无需手动动态导入 |
| **更好的性能** | 减少客户端JavaScript | 更快的首屏加载 |
| **更好的SEO** | 服务端渲染完整HTML | 搜索引擎友好 |

### Server Components基础

#### 默认Server Components

在Next.js App Router中，所有组件默认都是Server Components：

```typescript
// app/page.tsx
// ✅ 这是Server Component（默认）
async function BlogPosts() {
  // 可以直接访问数据库
  const posts = await db.post.findMany()

  // 可以使用服务端API
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache',
  })

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
      <h1>博客</h1>
      <BlogPosts />
    </main>
  )
}
```

#### Server Components的特性

**1. 异步组件支持**：

```typescript
// ✅ Server Components可以是async函数
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
    .then(r => r.json())

  return <div>{data.title}</div>
}
```

**2. 直接访问数据库**：

```typescript
// app/users/page.tsx
import { db } from '@/lib/db'

export default async function UsersPage() {
  // ✅ 直接查询数据库
  const users = await db.user.findMany({
    include: { posts: true },
  })

  return (
    <div>
      <h1>用户列表</h1>
      {users.map(user => (
        <div key={user.id}>
          <h2>{user.name}</h2>
          <p>文章数: {user.posts.length}</p>
        </div>
      ))}
    </div>
  )
}
```

**3. 使用服务端库**：

```typescript
// app/dashboard/page.tsx
import { readFile } from 'fs/promises'
import { join } from 'path'

export default async function DashboardPage() {
  // ✅ 可以使用文件系统API
  const filePath = join(process.cwd(), 'data', 'stats.json')
  const data = await readFile(filePath, 'utf-8')
  const stats = JSON.parse(data)

  return (
    <div>
      <h1>统计数据</h1>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  )
}
```

**4. 使用敏感信息**：

```typescript
// app/api-example/page.tsx
export default async function ApiExamplePage() {
  // ✅ 可以安全使用环境变量和API密钥
  const apiKey = process.env.API_SECRET_KEY
  const data = await fetch('https://api.example.com', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  }).then(r => r.json())

  return <div>{data.title}</div>
}
```

### Server vs Client Components

#### 核心区别对比

| 特性 | Server Components | Client Components |
|------|-------------------|-------------------|
| **默认** | ✅ 是（App Router） | ❌ 需要标记 |
| **指令** | 无需指令 | `'use client'` |
| **数据获取** | ✅ 服务器端 | ❌ 客户端 |
| **useState** | ❌ 不支持 | ✅ 支持 |
| **useEffect** | ❌ 不支持 | ✅ 支持 |
| **浏览器API** | ❌ 不支持 | ✅ 支持 |
| **事件处理** | ❌ 不支持 | ✅ 支持 |
| **Context** | ❌ 不支持 | ✅ 支持 |
| **自定义Hooks** | ❌ 不支持 | ✅ 支持 |
| **第三方库** | ⚠️ 受限 | ✅ 完全支持 |

#### Client Components详解

**何时使用Client Components**：

```typescript
// ❌ 以下情况需要Client Components

// 1. 使用React Hooks
'use client'
import { useState, useEffect } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// 2. 使用浏览器API
'use client'

export function GeoLocation() {
  const [location, setLocation] = useState(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation(position)
    })
  }, [])

  return <div>{JSON.stringify(location)}</div>
}

// 3. 使用事件处理
'use client'

export function LoginForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 处理登录
  }

  return <form onSubmit={handleSubmit}>...</form>
}

// 4. 使用Context
'use client'
import { ThemeContext } from '@/contexts/theme'

export function ThemedButton() {
  const { theme } = useContext(ThemeContext)
  return <button className={theme}>Click me</button>
}
```

#### 组件组合模式

**在Server Components中嵌套Client Components**：

```typescript
// app/page.tsx (Server Component)
import InteractiveButton from '@/components/InteractiveButton'
import SearchBar from '@/components/SearchBar'

export default function Page() {
  return (
    <div>
      <h1>首页</h1>

      {/* ✅ Server Component可以渲染Client Components */}
      <InteractiveButton />

      <SearchBar />

      {/* ✅ 传递数据到Client Component */}
      <UserProfile
        name="张三"
        email="zhangsan@example.com"
      />
    </div>
  )
}
```

**传递序列化数据**：

```typescript
// app/blog/[id]/page.tsx (Server Component)
import LikeButton from '@/components/LikeButton'

export default async function BlogPost({ params }: { params: { id: string } }) {
  const post = await db.post.findUnique({
    where: { id: params.id },
  })

  // ✅ 传递可序列化数据到Client Component
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>

      {/* 只传递必要的props */}
      <LikeButton
        postId={post.id}
        initialLikes={post.likes}
      />
    </article>
  )
}
```

**❌ 不能传递的内容**：

```typescript
// app/page.tsx
'use client'
import { useState } from 'react'

// ❌ Server Component不能传递函数到Client Component
export default function ServerComponent() {
  const handleClick = () => {
    console.log('clicked')
  }

  // ❌ 错误：函数不能被序列化
  return <ClientComponent onClick={handleClick} />
}

// ✅ 正确：在Client Component内部处理
export default function ServerComponent() {
  return <ClientComponent />
}

// components/ClientComponent.tsx
'use client'
import { useState } from 'react'

export default function ClientComponent() {
  const handleClick = () => {
    console.log('clicked')
  }

  return <button onClick={handleClick}>Click</button>
}
```

### 使用场景和最佳实践

#### 场景1：数据展示组件

```typescript
// ✅ 使用Server Component
// app/products/page.tsx
import { db } from '@/lib/db'

export default async function ProductsPage() {
  const products = await db.product.findMany()

  return (
    <div>
      <h1>产品列表</h1>
      <ProductList products={products} />
    </div>
  )
}

function ProductList({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.price}</p>
        </div>
      ))}
    </div>
  )
}
```

#### 场景2：交互式组件

```typescript
// ✅ 使用Client Component
// components/AddToCartButton.tsx
'use client'
import { useState } from 'react'

export default function AddToCartButton({ productId }: { productId: string }) {
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    setAdding(true)
    await fetch(`/api/cart/add`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    })
    setAdding(false)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={adding}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {adding ? '添加中...' : '加入购物车'}
    </button>
  )
}
```

#### 场景3：混合使用

```typescript
// app/shop/page.tsx
import AddToCartButton from '@/components/AddToCartButton'

export default async function ShopPage() {
  const products = await db.product.findMany()

  return (
    <div>
      <h1>商店</h1>
      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id}>
            {/* Server Component渲染静态内容 */}
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>价格: ${product.price}</p>

            {/* Client Component处理交互 */}
            <AddToCartButton productId={product.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 最佳实践

#### 1. 默认使用Server Components

```typescript
// ✅ 推荐：尽可能使用Server Components
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

#### 2. 保持Client Components在叶节点

```typescript
// ✅ 推荐：只在需要交互的组件使用'use client'
// components/ProductCard.tsx
export default function ProductCard({ product }: { product: any }) {
  return (
    <div>
      <h2>{product.name}</h2>
      <p>{product.price}</p>
      <AddToCartButton productId={product.id} />
    </div>
  )
}

// components/AddToCartButton.tsx
'use client'
export default function AddToCartButton({ productId }: { productId: string }) {
  // 只在叶节点使用客户端特性
}
```

#### 3. 避免在Client Components中获取数据

```typescript
// ❌ 不推荐：在Client Component中获取数据
'use client'
import { useState, useEffect } from 'react'

export default function PostList() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(setPosts)
  }, [])

  return (
    <div>
      {posts.map(post => <div key={post.id}>{post.title}</div>)}
    </div>
  )
}

// ✅ 推荐：在Server Component中获取数据
export default async function PostList() {
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json())

  return (
    <div>
      {posts.map((post: any) => <div key={post.id}>{post.title}</div>)}
    </div>
  )
}
```

### 实战案例：博客应用（RSC）

让我们创建一个完整的博客应用，展示Server Components的实际应用。

#### 项目结构

```
app/
├── blog/
│   ├── page.tsx              # 博客列表
│   ├── [slug]/
│   │   └── page.tsx          # 博客详情
│   └── tag/
│       └── [tag]/
│           └── page.tsx      # 标签页
├── components/
│   ├── LikeButton.tsx        # 点赞按钮（Client）
│   ├── CommentForm.tsx       # 评论表单（Client）
│   └── SearchBar.tsx         # 搜索栏（Client）
└── lib/
    └── db.ts                 # 数据库配置
```

#### 1. 数据库配置

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

#### 2. 博客列表页

```typescript
// app/blog/page.tsx
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '博客 - 我的技术博客',
  description: '分享前端技术知识和开发经验',
}

async function getPosts() {
  const posts = await db.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: { name: true, image: true },
      },
      _count: {
        select: { likes: true, comments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return posts
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">博客文章</h1>
        <p className="text-gray-600">分享前端技术知识和开发经验</p>
      </header>

      <div className="space-y-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <Link href={`/blog/${post.slug}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                      {post.category}
                    </span>
                    <time className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                    </time>
                  </div>

                  <h2 className="text-2xl font-bold mb-3 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {post.author.name[0]}
                      </div>
                      <span>{post.author.name}</span>
                    </div>

                    <span>❤️ {post._count.likes}</span>
                    <span>💬 {post._count.comments}</span>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
```

#### 3. 博客详情页

```typescript
// app/blog/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LikeButton from '@/components/LikeButton'
import CommentForm from '@/components/CommentForm'
import CommentList from '@/components/CommentList'

async function getPost(slug: string) {
  const post = await db.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: { name: true, image: true, bio: true },
      },
      comments: {
        include: {
          author: {
            select: { name: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { likes: true, comments: true },
      },
    },
  })

  return post
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* 返回按钮 */}
      <Link
        href="/blog"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
      >
        ← 返回博客列表
      </Link>

      {/* 文章头部 */}
      <header className="mb-8 pb-8 border-b">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
            {post.category}
          </span>
          <time className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString('zh-CN')}
          </time>
        </div>

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {post.author.name[0]}
            </div>
            <div>
              <div className="font-medium">{post.author.name}</div>
              <div className="text-sm text-gray-500">{post.author.bio}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LikeButton
              postId={post.id}
              initialLikes={post._count.likes}
            />
          </div>
        </div>
      </header>

      {/* 文章内容 */}
      <div className="prose prose-lg max-w-none mb-12">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      {/* 文章标签 */}
      <div className="flex flex-wrap gap-2 mb-12">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/blog/tag/${tag}`}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </div>

      {/* 评论区 */}
      <section className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">
          评论 ({post._count.comments})
        </h2>

        <CommentForm postId={post.id} />
        <CommentList comments={post.comments} />
      </section>
    </article>
  )
}
```

#### 4. 点赞按钮（Client Component）

```typescript
// components/LikeButton.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  postId: string
  initialLikes: number
}

export default function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleLike = async () => {
    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        setLikes(data.likes)

        // 刷新页面数据
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        liked
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
      <span className="font-medium">{likes}</span>
      <span className="text-sm">
        {isPending ? '处理中...' : liked ? '已点赞' : '点赞'}
      </span>
    </button>
  )
}
```

#### 5. 评论表单（Client Component）

```typescript
// components/CommentForm.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface CommentFormProps {
  postId: string
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content }),
      })

      if (response.ok) {
        setContent('')

        // 刷新页面数据
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的评论..."
        rows={4}
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isSubmitting}
      />

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={isSubmitting || isPending || !content.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '提交中...' : '发表评论'}
        </button>
      </div>
    </form>
  )
}
```

#### 6. 评论列表（混合组件）

```typescript
// components/CommentList.tsx
import DeleteCommentButton from './DeleteCommentButton'

interface Comment {
  id: string
  content: string
  createdAt: Date
  author: {
    name: string
    image: string | null
  }
}

interface CommentListProps {
  comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        还没有评论，快来抢沙发吧！
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-gray-50 rounded-lg p-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {comment.author.name[0]}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{comment.author.name}</div>
                <time className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleString('zh-CN')}
                </time>
              </div>

              <p className="text-gray-700">{comment.content}</p>
            </div>

            <DeleteCommentButton commentId={comment.id} />
          </div>
        </div>
      ))}
    </div>
  )
}
```

#### 7. 搜索栏（Client Component）

```typescript
// components/SearchBar.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    if (debouncedQuery) {
      router.push(`/blog/search?q=${encodeURIComponent(debouncedQuery)}`)
    }
  }, [debouncedQuery, router])

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索文章..."
        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <svg
        className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  )
}
```

### 性能优化技巧

#### 1. 减少Client Components数量

```typescript
// ✅ 推荐：将交互逻辑抽取到独立组件
// app/page.tsx
export default async function Page() {
  const posts = await getPosts()

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

// components/PostCard.tsx
export default function PostCard({ post }: { post: any }) {
  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
      <LikeButton postId={post.id} />
    </article>
  )
}
```

#### 2. 使用动态导入

```typescript
// app/page.tsx
import dynamic from 'next/dynamic'

// ✅ 动态导入大型组件
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>加载中...</div>,
  ssr: false,
})

export default function Page() {
  return (
    <div>
      <h1>数据分析</h1>
      <HeavyChart />
    </div>
  )
}
```

#### 3. 优化数据获取

```typescript
// ✅ 并行获取多个数据源
export default async function Page() {
  const [posts, authors, stats] = await Promise.all([
    getPosts(),
    getAuthors(),
    getStats(),
  ])

  return (
    <div>
      <StatsOverview stats={stats} />
      <PostList posts={posts} authors={authors} />
    </div>
  )
}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| Server Components基础 | 概念、优势、特性 | 理解核心概念 |
| Server vs Client | 区别、使用场景 | 能够正确选择 |
| 组件组合 | 嵌套、数据传递 | 掌握组合模式 |
| 最佳实践 | 性能优化、代码组织 | 能够应用 |
| 实战应用 | 博客应用完整实现 | 能够独立开发 |

---

**下一步学习**：建议继续学习[Client Components使用](./chapter-88)深入了解客户端组件的高级用法。
