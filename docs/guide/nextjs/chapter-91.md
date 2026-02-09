# 增量静态再生（ISR）

## 增量静态再生（ISR）

> **学习目标**：掌握Next.js的增量静态再生（ISR）技术，实现静态和动态的完美平衡
> **核心内容**：ISR基础、revalidate配置、On-demand Revalidation、实战案例

### ISR概述

#### 什么是ISR

**增量静态再生（Incremental Static Regeneration, ISR）** 允许你静态生成页面，同时在后台按需更新页面内容，而无需重新构建整个站点。

```
┌─────────────────────────────────────────────────────────────┐
│              ISR 工作原理                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  初始请求                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. 返回静态HTML（已缓存）                            │   │
│  │  2. 页面立即可用                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  后台重新验证（在revalidate时间后）                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. 检查是否超过revalidate时间                       │   │
│  │  2. 在后台重新生成页面                               │   │
│  │  3. 完成后更新缓存                                   │   │
│  │  4. 下次请求返回新内容                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  用户体验                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • 用户总是快速获得响应                              │   │
│  │  • 内容定期更新                                      │   │
│  │  • 无需手动重新构建                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### ISR的优势

| 特性 | SSG | SSR | ISR |
|------|-----|-----|-----|
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **数据新鲜度** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **服务器成本** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **开发复杂度** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **适用场景** | 静态内容 | 实时内容 | 定期更新内容 |

### ISR基础配置

#### 1. 基础revalidate

```typescript
// app/blog/[slug]/page.tsx
// 设置页面每60秒重新验证一次
export const revalidate = 60

async function getPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    // 使用next.revalidate
    next: { revalidate: 60 },
  })

  return res.json()
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  return <article>{post.content}</article>
}
```

#### 2. 时间增量设置

```typescript
// 秒级
export const revalidate = 60 // 60秒

// 分钟级
export const revalidate = 3600 // 1小时

// 小时级
export const revalidate = 86400 // 1天

// 周级
export const revalidate = 604800 // 1周
```

#### 3. 路由级revalidate

```typescript
// app/products/page.tsx
export const revalidate = 3600 // 整个路由每小时重新验证

export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products').then(r => r.json())

  return (
    <div>
      {products.map((p: any) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  )
}
```

### revalidate配置详解

#### 1. 页面级revalidate

```typescript
// app/page.tsx
// 页面级别的revalidate
export const revalidate = 3600

export default async function Home() {
  return <div>Home Page</div>
}
```

#### 2. Fetch级revalidate

```typescript
// app/dashboard/page.tsx
async function getData() {
  // 每个fetch请求可以有独立的revalidate时间
  const [user, stats] = await Promise.all([
    fetch('https://api.example.com/user', {
      next: { revalidate: 60 }, // 用户数据：1分钟
    }).then(r => r.json()),

    fetch('https://api.example.com/stats', {
      next: { revalidate: 3600 }, // 统计数据：1小时
    }).then(r => r.json()),
  ])

  return { user, stats }
}

export default async function DashboardPage() {
  const data = await getData()

  return (
    <div>
      <UserProfile user={data.user} />
      <StatsPanel stats={data.stats} />
    </div>
  )
}
```

#### 3. 公共revalidate时间

```typescript
// app/api/config.ts
export const REVALIDATION_TIMES = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
} as const

// app/blog/page.tsx
import { REVALIDATION_TIMES } from '@/api/config'

export const revalidate = REVALIDATION_TIMES.HOUR
```

### On-Demand Revalidation

#### 1. 基于路径的重新验证

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { authorizeRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // 验证请求权限
  const auth = await authorizeRequest(request)
  if (!auth.success) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { path } = await request.json()

    if (!path) {
      return NextResponse.json(
        { message: 'Path is required' },
        { status: 400 }
      )
    }

    // 重新验证指定路径
    revalidatePath(path)

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path,
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### 2. 基于标签的重新验证

```typescript
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: {
      revalidate: 3600,
      tags: ['posts'], // 添加标签
    },
  })

  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div>
      {posts.map((post: any) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}

// app/api/posts/route.ts
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // 创建新文章后，重新验证所有带'posts'标签的页面
  revalidateTag('posts')

  return NextResponse.json({ revalidated: true })
}
```

#### 3. Server Actions中的重新验证

```typescript
// app/actions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/lib/db'

// 创建文章后重新验证
export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const post = await db.post.create({
    data: { title, content },
  })

  // 重新验证博客列表页
  revalidatePath('/blog')
  revalidatePath('/blog/page/[page]', 'page')

  // 重新验证新创建的文章页
  revalidatePath(`/blog/${post.slug}`)

  // 重新验证所有带'posts'标签的页面
  revalidateTag('posts')

  return post
}

// 更新文章后重新验证
export async function updatePost(id: string, formData: FormData) {
  const post = await db.post.update({
    where: { id },
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    },
  })

  // 重新验证相关页面
  revalidatePath(`/blog/${post.slug}`)
  revalidateTag('posts')

  return post
}

// 删除文章后重新验证
export async function deletePost(id: string) {
  const post = await db.post.delete({
    where: { id },
  })

  // 重新验证相关页面
  revalidatePath('/blog')
  revalidateTag('posts')

  return post
}
```

### 实战案例：新闻网站

创建一个支持ISR的新闻网站。

#### 1. 新闻列表页（ISR）

```typescript
// app/news/page.tsx
import Link from 'next/link'
import { Metadata } from 'next'

// ISR: 每10分钟重新验证
export const revalidate = 600

export const metadata: Metadata = {
  title: '新闻中心 - 最新资讯',
  description: '24小时不间断更新国内外新闻',
}

interface NewsArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  publishedAt: Date
  author: {
    name: string
  }
  imageUrl: string
}

async function getNewsArticles(): Promise<NewsArticle[]> {
  const res = await fetch(`${process.env.API_URL}/news`, {
    next: {
      revalidate: 600,
      tags: ['news'],
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch news')
  }

  return res.json()
}

export default async function NewsPage() {
  const articles = await getNewsArticles()

  // 按类别分组
  const categories = articles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = []
    }
    acc[article.category].push(article)
    return acc
  }, {} as Record<string, NewsArticle[]>)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">新闻中心</h1>
        <p className="text-gray-600">实时更新，24小时不间断报道</p>
      </header>

      {/* Featured Article */}
      {articles[0] && (
        <section className="mb-12">
          <Link href={`/news/${articles[0].slug}`}>
            <article className="relative group overflow-hidden rounded-2xl">
              <div className="aspect-[21/9] overflow-hidden">
                <img
                  src={articles[0].imageUrl}
                  alt={articles[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <span className="inline-block px-3 py-1 text-sm font-medium bg-red-600 rounded mb-4">
                  头条
                </span>
                <h2 className="text-3xl font-bold mb-3 group-hover:text-red-300 transition-colors">
                  {articles[0].title}
                </h2>
                <p className="text-gray-200 mb-4 line-clamp-2">
                  {articles[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span>{articles[0].author.name}</span>
                  <time>
                    {new Date(articles[0].publishedAt).toLocaleString('zh-CN')}
                  </time>
                </div>
              </div>
            </article>
          </Link>
        </section>
      )}

      {/* Category Sections */}
      {Object.entries(categories).map(([category, categoryArticles]) => (
        <section key={category} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{category}</h2>
            <Link
              href={`/news/category/${category}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              查看更多 →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryArticles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group"
              >
                <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <time className="text-xs text-gray-500">
                      {new Date(article.publishedAt).toLocaleString('zh-CN')}
                    </time>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
```

#### 2. 新闻详情页（ISR）

```typescript
// app/news/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ShareButtons from '@/components/ShareButtons'
import RelatedNews from '@/components/RelatedNews'

// ISR: 每10分钟重新验证
export const revalidate = 600

// 生成静态参数
export async function generateStaticParams() {
  const res = await fetch(`${process.env.API_URL}/news`, {
    next: { revalidate: 600 },
  })

  const articles: NewsArticle[] = await res.json()

  // 生成最近100篇文章的静态页面
  return articles.slice(0, 100).map((article) => ({
    slug: article.slug,
  }))
}

// 生成元数据
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const article = await getNewsArticle(params.slug)

  if (!article) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.imageUrl],
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author.name],
    },
  }
}

async function getNewsArticle(slug: string) {
  const res = await fetch(`${process.env.API_URL}/news/${slug}`, {
    next: {
      revalidate: 600,
      tags: ['news', `news-${slug}`],
    },
  })

  if (!res.ok) {
    return null
  }

  return res.json()
}

export default async function NewsArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const article = await getNewsArticle(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/news"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
      >
        ← 返回新闻列表
      </Link>

      {/* Article Header */}
      <header className="mb-8 pb-8 border-b">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
            {article.category}
          </span>
          <time className="text-sm text-gray-600">
            {new Date(article.publishedAt).toLocaleString('zh-CN')}
          </time>
        </div>

        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {article.author.name[0]}
            </div>
            <div>
              <div className="font-medium">{article.author.name}</div>
              <div className="text-sm text-gray-600">记者</div>
            </div>
          </div>

          <ShareButtons
            title={article.title}
            url={`https://example.com/news/${article.slug}`}
          />
        </div>
      </header>

      {/* Article Image */}
      <div className="mb-8 rounded-xl overflow-hidden">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full"
        />
      </div>

      {/* Article Content */}
      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b">
        {article.tags.map((tag: string) => (
          <Link
            key={tag}
            href={`/news/tag/${tag}`}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </div>

      {/* Related News */}
      <RelatedNews
        category={article.category}
        currentSlug={article.slug}
      />
    </article>
  )
}
```

#### 3. 按需重新验证API

```typescript
// app/api/admin/news/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // 验证管理员权限
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { type, slug, path } = body

    if (type === 'all') {
      // 重新验证所有新闻页面
      revalidateTag('news')
      return NextResponse.json({
        revalidated: true,
        type: 'all',
        now: Date.now(),
      })
    }

    if (type === 'article' && slug) {
      // 重新验证特定文章
      revalidatePath(`/news/${slug}`)
      revalidateTag(`news-${slug}`)
      return NextResponse.json({
        revalidated: true,
        type: 'article',
        slug,
        now: Date.now(),
      })
    }

    if (type === 'path' && path) {
      // 重新验证特定路径
      revalidatePath(path)
      return NextResponse.json({
        revalidated: true,
        type: 'path',
        path,
        now: Date.now(),
      })
    }

    return NextResponse.json(
      { message: 'Invalid parameters' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### 4. Webhook触发重新验证

```typescript
// app/api/webhook/news/route.ts
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  // 验证webhook签名
  const signature = request.headers.get('x-webhook-signature')
  const body = await request.text()

  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  if (signature !== expectedSignature) {
    return NextResponse.json(
      { message: 'Invalid signature' },
      { status: 401 }
    )
  }

  try {
    const payload = JSON.parse(body)

    // 根据事件类型重新验证
    if (payload.event === 'news.created' || payload.event === 'news.updated') {
      revalidateTag('news')
      revalidateTag(`news-${payload.data.slug}`)
    }

    if (payload.event === 'news.deleted') {
      revalidateTag('news')
      revalidatePath('/news')
    }

    return NextResponse.json({ revalidated: true })
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### ISR最佳实践

#### 1. 根据内容更新频率设置revalidate时间

```typescript
// 频繁更新的内容（新闻、股票）
export const revalidate = 60 // 1分钟

// 中等频率更新的内容（博客、产品）
export const revalidate = 3600 // 1小时

// 很少变化的内容（关于页面、文档）
export const revalidate = 86400 // 1天
```

#### 2. 使用tags进行细粒度控制

```typescript
// 给不同类型的数据打标签
fetch('/api/posts', { next: { tags: ['posts', 'content'] } })
fetch('/api/users', { next: { tags: ['users', 'auth'] } })
fetch('/api/settings', { next: { tags: ['settings'] } })

// 按需重新验证特定类型
revalidateTag('posts') // 只重新验证文章相关页面
```

#### 3. 结合Server Actions

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function updateArticle(id: string, data: any) {
  const article = await db.article.update({
    where: { id },
    data,
  })

  // 更新后立即重新验证
  revalidatePath(`/news/${article.slug}`)
  revalidatePath('/news')

  return article
}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| ISR基础 | 概念、优势、工作原理 | 理解核心概念 |
| revalidate配置 | 页面级、fetch级配置 | 掌握配置方法 |
| On-Demand Revalidation | 路径、标签、Server Actions | 能够灵活应用 |
| Webhook集成 | 自动触发重新验证 | 能够实现 |
| 实战应用 | 新闻网站 | 能够独立开发 |

---

**下一步学习**：建议继续学习[数据获取完全指南](./chapter-92)深入了解数据获取模式。
