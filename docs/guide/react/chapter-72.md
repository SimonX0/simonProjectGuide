# ：React Server Components

## RSC 基础概念

React Server Components (RSC) 是 React 18 引入的一种新组件类型，它允许组件在服务端渲染，从而实现更好的性能和开发体验。

### 什么是 Server Components

```tsx
// ❌ 传统客户端组件
// 所有代码都发送到浏览器，包括数据和逻辑
function ClientComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data))
  }, [])

  if (!data) return <div>加载中...</div>

  return <div>{data.title}</div>
}

// ✅ Server Component
// 组件在服务端运行，只发送渲染后的 HTML 到浏览器
async function ServerComponent() {
  // 直接在服务端访问数据库
  const data = await db.query('SELECT * FROM posts')

  return <div>{data.title}</div>
}

// 浏览器只接收到：
// <div>文章标题</div>
// 而不是整个组件代码
```

### Server Components vs Client Components

```tsx
// ==================== Server Component ====================
// 文件名：ServerComponent.tsx (或没有 'use client' 指令)

import { db } from '@/lib/db'  // ✅ 可以直接导入服务端模块

async function ServerComponent() {
  // ✅ 可以直接访问数据库
  const posts = await db.post.findMany()

  // ✅ 可以使用文件系统
  const file = fs.readFileSync('./data.json')

  // ✅ 可以调用内部 API
  const data = await fetch('http://internal-api/data')

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  )
}

export default ServerComponent

// ==================== Client Component ====================
// 文件名：ClientComponent.tsx

'use client'  // ⚠️ 必须在文件顶部声明

import { useState, useEffect } from 'react'

function ClientComponent() {
  const [count, setCount] = useState(0)

  // ✅ 可以使用 Hooks
  // ✅ 可以处理用户交互
  // ✅ 可以使用浏览器 API

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        点击次数：{count}
      </button>
    </div>
  )
}

export default ClientComponent
```

### 两者对比总结

| 特性 | Server Components | Client Components |
|------|-------------------|-------------------|
| 运行位置 | 服务端 | 浏览器 |
| 声明方式 | 默认（或无 'use client' | 'use client' 指令 |
| 访问数据库 | ✅ 可以 | ❌ 不可以 |
| 使用 Hooks | ❌ 不可以 | ✅ 可以 |
| 用户交互 | ❌ 不可以 | ✅ 可以 |
| 浏览器 API | ❌ 不可以 | ✅ 可以 |
| 包大小 | 0 KB（不发送 JS） | 包含在 bundle 中 |
| 数据获取 | 直接获取 | 需要调用 API |

## Server Components vs Client Components

### Server Components 特性

```tsx
// ✅ Server Components 的优势

// 1. 直接访问后端资源
async function UserProfile({ userId }: { userId: string }) {
  // 直接查询数据库
  const user = await db.user.findUnique({
    where: { id: userId }
  })

  // 直接读取文件
  const bio = await fs.readFile(`./bios/${userId}.md`, 'utf-8')

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{bio}</p>
    </div>
  )
}

// 2. 零 Bundle 大小
import { ExpensiveChartLibrary } from 'chart-library'

function Dashboard() {
  // ExpensiveChartLibrary 不会发送到浏览器！
  return <ExpensiveChartLibrary data={data} />
}

// 3. 自动代码分割
async function BlogPost({ slug }: { slug: string }) {
  // 每个博客文章只渲染它需要的组件
  const post = await db.post.findUnique({ where: { slug } })

  if (post.type === 'video') {
    return <VideoPlayer src={post.videoUrl} />
  }

  if (post.type === 'gallery') {
    return <ImageGallery images={post.images} />
  }

  return <Article content={post.content} />
}

// 4. 保持服务端逻辑安全
async function AdminPanel() {
  const session = await getSession()

  if (!session.isAdmin) {
    return <div>无权访问</div>
  }

  const sensitiveData = await db.getAdminData()

  return <AdminData data={sensitiveData} />
}
```

### Client Components 特性

```tsx
'use client'

import { useState, useEffect } from 'react'

// ✅ Client Components 必须使用场景

// 1. 事件处理器
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      点击 {count} 次
    </button>
  )
}

// 2. 浏览器 API
function Geolocation() {
  const [location, setLocation] = useState(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(setLocation)
  }, [])

  return <div>位置：{location}</div>
}

// 3. 状态管理
function TodoList() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')

  // ... 状态逻辑
}

// 4. 生命周期效果
function ScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return null
}

// 5. 自定义 Hooks
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
```

### 混合使用 Server 和 Client Components

```tsx
// ==================== Server Component ====================
async function BlogPage({ slug }: { slug: string }) {
  // 服务端获取数据
  const post = await db.post.findUnique({ where: { slug } })
  const author = await db.author.findUnique({
    where: { id: post.authorId }
  })

  return (
    <article>
      <h1>{post.title}</h1>

      {/* 导入 Client Component 处理交互 */}
      <LikeButton postId={post.id} />

      <div className="content">
        {post.content}
      </div>

      <AuthorProfile author={author} />
    </article>
  )
}

// ==================== Client Component ====================
'use client'

import { useState } from 'react'

function LikeButton({ postId }: { postId: string }) {
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)

  const handleLike = async () => {
    await fetch('/api/like', {
      method: 'POST',
      body: JSON.stringify({ postId })
    })

    setLiked(true)
    setLikes(l => l + 1)
  }

  return (
    <button onClick={handleLike} disabled={liked}>
      {liked ? '♥' : '♡'} {likes}
    </button>
  )
}

// ==================== 两个 Server Component ====================
async function AuthorProfile({ author }: { author: Author }) {
  const posts = await db.post.findMany({
    where: { authorId: author.id },
    take: 5
  })

  return (
    <div className="author-profile">
      <img src={author.avatar} alt={author.name} />
      <h3>{author.name}</h3>
      <p>{author.bio}</p>

      <h4>最新文章</h4>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

## 数据获取在服务端

Server Components 彻底改变了数据获取的方式，让我们可以直接在组件中获取数据，无需创建 API 端点。

### 直接数据库查询

```tsx
// ==================== lib/db.ts ====================
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getPosts() {
  return prisma.post.findMany({
    include: {
      author: true,
      comments: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      posts: true,
      profile: true
    }
  })
}

// ==================== app/page.tsx ====================
import { getPosts, getUser } from '@/lib/db'

async function HomePage() {
  // 直接在组件中查询数据库！
  const posts = await getPosts()
  const currentUser = await getUser('user-123')

  return (
    <div>
      <header>
        <h1>欢迎, {currentUser.name}!</h1>
      </header>

      <main>
        <h2>最新文章</h2>
        {posts.map(post => (
          <article key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <div className="meta">
              <span>作者：{post.author.name}</span>
              <span>{post.comments.length} 条评论</span>
            </div>
          </article>
        ))}
      </main>
    </div>
  )
}

export default HomePage
```

### 并行数据获取

```tsx
// ✅ 并行获取数据（更快）
async function Dashboard() {
  // 使用 Promise.all 并行获取
  const [user, posts, stats] = await Promise.all([
    db.user.findUnique({ where: { id: '123' } }),
    db.post.findMany({ where: { authorId: '123' } }),
    db.stats.findUnique({ where: { userId: '123' } })
  ])

  return (
    <div>
      <UserProfile user={user} />
      <UserPosts posts={posts} />
      <UserStats stats={stats} />
    </div>
  )
}

// ❌ 串行获取数据（更慢）
async function SlowDashboard() {
  const user = await db.user.findUnique({ where: { id: '123' } })
  const posts = await db.post.findMany({ where: { authorId: user.id } })
  const stats = await db.stats.findUnique({ where: { userId: user.id } })

  return (
    <div>
      <UserProfile user={user} />
      <UserPosts posts={posts} />
      <UserStats stats={stats} />
    </div>
  )
}
```

### 缓存和重新验证

```tsx
// ==================== 使用 Next.js 缓存 ====================
import { unstable_cache } from 'next/cache'

async function getPosts() {
  return unstable_cache(
    async () => {
      return db.post.findMany()
    },
    ['posts'], // 缓存键
    {
      revalidate: 60, // 每 60 秒重新验证
      tags: ['posts'] // 用于按需重新验证
    }
  )()
}

// ==================== 按需重新验证 ====================
import { revalidatePath } from 'next/cache'

async function createPost(data: PostData) {
  const post = await db.post.create({ data })

  // 重新验证相关页面
  revalidatePath('/')
  revalidatePath('/posts')

  return post
}

// ==================== 动态数据获取 ====================
// 不使用缓存（实时数据）
async function LiveStockPrices() {
  const prices = await fetch('https://api.stock-prices.com', {
    cache: 'no-store' // 禁用缓存
  }).then(r => r.json())

  return <StockTicker prices={prices} />
}

// 使用短缓存（频繁更新的数据）
async function WeatherWidget() {
  const weather = await fetch('https://api.weather.com', {
    next: { revalidate: 300 } // 5 分钟
  }).then(r => r.json())

  return <Weather data={weather} />
}
```

## 实战案例：全栈应用（Next.js环境）

让我们创建一个完整的博客应用，展示 Server Components 的强大功能。

```tsx
// ==================== 1. 数据库模型 ====================
// prisma/schema.prisma

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatar    String?
  bio       String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String
  excerpt     String?
  coverImage  String?
  published   Boolean  @default(false)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  categories  Category[]
  comments    Comment[]
  views       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  posts     Post[]
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  post      Post     @relation(fields: [postId], references: [id])
  postId    String
  createdAt DateTime @default(now())
}

// ==================== 2. Server Components ====================
// app/page.tsx

import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getFeaturedPosts() {
  return prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      },
      categories: true
    },
    orderBy: { views: 'desc' },
    take: 6
  })
}

async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    }
  })
}

async function getRecentPosts() {
  return prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })
}

export default async function HomePage() {
  // 并行获取所有数据
  const [featuredPosts, categories, recentPosts] = await Promise.all([
    getFeaturedPosts(),
    getCategories(),
    getRecentPosts()
  ])

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <h1>探索精彩文章</h1>
        <p>发现、学习和分享</p>
        <SearchBar />
      </section>

      {/* Featured Posts */}
      <section className="featured-posts">
        <h2>精选文章</h2>
        <div className="posts-grid">
          {featuredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <h2>分类浏览</h2>
        <div className="category-list">
          {categories.map(category => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="category-item"
            >
              <span>{category.name}</span>
              <span className="count">{category._count.posts}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Sidebar */}
      <aside className="sidebar">
        <RecentPosts posts={recentPosts} />
        <NewsletterSignup />
      </aside>
    </div>
  )
}

// Post Card Component
function PostCard({ post }: { post: PostWithAuthor }) {
  return (
    <article className="post-card">
      <Link href={`/blog/${post.slug}`}>
        <div className="post-image">
          {post.coverImage && (
            <img src={post.coverImage} alt={post.title} />
          )}
        </div>

        <div className="post-content">
          <div className="post-meta">
            <img src={post.author.avatar} alt={post.author.name} />
            <span>{post.author.name}</span>
            <span>•</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>

          <h3>{post.title}</h3>

          {post.excerpt && (
            <p className="excerpt">{post.excerpt}</p>
          )}

          {post.categories.length > 0 && (
            <div className="categories">
              {post.categories.map(cat => (
                <span key={cat.id} className="category-tag">
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}

// ==================== 3. Client Components ====================
// components/SearchBar.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true)
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
          const data = await response.json()
          setResults(data.results)
        } catch (error) {
          console.error('搜索失败:', error)
        } finally {
          setIsSearching(false)
        }
        setShowResults(true)
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setShowResults(false)
    }
  }

  return (
    <div ref={searchRef} className="search-bar">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章..."
          className="search-input"
        />
        <button type="submit" className="search-button">
          🔍
        </button>
      </form>

      {showResults && (
        <div className="search-results">
          {isSearching ? (
            <div className="searching">搜索中...</div>
          ) : results.length > 0 ? (
            results.map((result: any) => (
              <Link
                key={result.id}
                href={`/blog/${result.slug}`}
                className="search-result-item"
                onClick={() => setShowResults(false)}
              >
                <h4>{result.title}</h4>
                <p>{result.excerpt}</p>
              </Link>
            ))
          ) : (
            <div className="no-results">未找到结果</div>
          )}
        </div>
      )}
    </div>
  )
}

// components/LikeButton.tsx

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  postId: string
  initialLikes: number
  initialLiked: boolean
}

export function LikeButton({ postId, initialLikes, initialLiked }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(initialLiked)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleLike = async () => {
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })

      if (response.ok) {
        startTransition(() => {
          setLiked(!liked)
          setLikes(liked ? likes - 1 : likes + 1)
        })
      }
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`like-button ${liked ? 'liked' : ''}`}
      aria-label={liked ? '取消点赞' : '点赞'}
    >
      <span className="heart">{liked ? '❤️' : '🤍'}</span>
      <span className="count">{likes}</span>
    </button>
  )
}

// ==================== 4. API Routes ====================
// app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      take: 10
    })

    return NextResponse.json({ results: posts })
  } catch (error) {
    return NextResponse.json(
      { error: '搜索失败' },
      { status: 500 }
    )
  }
}

// app/api/likes/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const { postId } = await request.json()

    // 检查是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId
        }
      }
    })

    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: { id: existingLike.id }
      })
      return NextResponse.json({ liked: false })
    } else {
      // 添加点赞
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId
        }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    )
  }
}

// ==================== 5. 动态路由 ====================
// app/blog/[slug]/page.tsx

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { LikeButton } from '@/components/LikeButton'
import { CommentSection } from '@/components/CommentSection'

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true
        }
      },
      categories: true,
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  // 增加阅读量
  if (post) {
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    })
  }

  return post
}

export default async function BlogPostPage({
  params
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="blog-post">
      <header className="post-header">
        <div className="categories">
          {post.categories.map(cat => (
            <span key={cat.id} className="category-tag">
              {cat.name}
            </span>
          ))}
        </div>

        <h1>{post.title}</h1>

        <div className="meta">
          <img src={post.author.avatar} alt={post.author.name} />
          <div className="author-info">
            <div className="author-name">{post.author.name}</div>
            <div className="date">{formatDate(post.createdAt)}</div>
          </div>
          <div className="stats">
            <span>👁️ {post.views} 阅读</span>
            <span>💬 {post.comments.length} 评论</span>
          </div>
        </div>

        <div className="actions">
          <LikeButton
            postId={post.id}
            initialLikes={post.likes || 0}
            initialLiked={post.isLiked || false}
          />
          <ShareButton title={post.title} />
        </div>
      </header>

      {post.coverImage && (
        <div className="cover-image">
          <img src={post.coverImage} alt={post.title} />
        </div>
      )}

      <div className="content">
        <MDXRenderer content={post.content} />
      </div>

      <footer className="post-footer">
        <AuthorCard author={post.author} />
        <RelatedPosts currentPostId={post.id} />
      </footer>

      <CommentSection postId={post.id} comments={post.comments} />
    </article>
  )
}
```

**配套样式（简化版）：**

```css
/* globals.css */
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  margin-bottom: 40px;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 10px;
}

/* Post Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin: 40px 0;
}

.post-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.post-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.post-content {
  padding: 20px;
}

/* Search Bar */
.search-bar {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 16px 24px;
  font-size: 18px;
  border: none;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
}

/* Like Button */
.like-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.like-button.liked {
  background: #ffebee;
  color: #f44336;
}

.like-button:not(.liked) {
  background: #f5f5f5;
  color: #666;
}

.like-button:hover {
  transform: scale(1.05);
}
```

## Server Components 最佳实践

### 1. 合理划分 Server 和 Client Components

```tsx
// ✅ 好的划分
// Server Component: 布局和数据获取
async function Page() {
  const data = await fetchData()
  return <Layout data={data} />
}

// Client Component: 交互和状态
function InteractiveWidget() {
  const [state, setState] = useState()
  return <button onClick={() => setState()}>点击</button>
}
```

### 2. 最小化客户端 JavaScript

```tsx
// ✅ 将尽可能多的组件保留在服务端
async function GoodExample() {
  const data = await db.query()

  return (
    <div>
      <Header />          {/* Server Component */}
      <Sidebar data={data} />  {/* Server Component */}
      <InteractiveFeature />   {/* Client Component */}
      <Footer />          {/* Server Component */}
    </div>
  )
}
```

### 3. 向下传递序列化数据

```tsx
// ✅ Server Component 传递数据给 Client Component
async function ServerComponent() {
  const user = await db.user.findUnique()

  return <ClientComponent user={JSON.parse(JSON.stringify(user))} />
}

'use client'
function ClientComponent({ user }: { user: User }) {
  // 使用数据
  return <div>Hello, {user.name}</div>
}
```

## 总结

本章我们学习了：

✅ React Server Components 的基本概念
✅ Server Components vs Client Components 的区别
✅ 数据获取在服务端的实现
✅ 直接数据库查询和并行数据获取
✅ 实战案例：完整的 Next.js 全栈博客应用
✅ Server Components 的最佳实践
✅ 如何合理划分 Server 和 Client Components

**Server Components 的优势总结：**

| 特性 | 传统方式 | Server Components |
|------|---------|-------------------|
| 数据获取 | 客户端 API 调用 | 服务端直接查询 |
| Bundle 大小 | 包含所有代码 | 0 KB（纯 HTML） |
| 首屏加载 | 慢 | 快 |
| 用户体验 | 多个加载状态 | 即时显示内容 |
| 代码安全性 | 逻辑暴露 | 逻辑在服务端 |
| 数据库访问 | 需要 API | 直接访问 |

**架构演进：**

```
传统 React 架构：
Client Component → API → Database → API → Client

React Server Components 架构：
Server Component → Database → HTML → Browser
Client Component → Interaction
```

**恭喜你完成了所有 React 18+ 并发特性的学习！**

你已经掌握了：
- 第68章：自动批处理（Automatic Batching）
- 第69章：Suspense 与数据获取
- 第70章：useTransition 与 useDeferredValue
- 第71章：useId 与并发渲染
- 第72章：React Server Components

现在你已经具备了使用 React 18 构建现代化、高性能应用的全部知识！继续实践和探索，你将成为一名出色的 React 开发者。
