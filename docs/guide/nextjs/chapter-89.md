# 静态生成（SSG）

## 静态生成（SSG）

> **学习目标**：掌握Next.js的静态站点生成（SSG）技术，构建高性能的静态网站
> **核心内容**：generateStaticParams、静态页面生成、ISR、实战案例

### 静态生成概述

#### 什么是SSG

**静态站点生成（Static Site Generation, SSG）** 是在构建时预先生成所有页面的HTML，而不是在每次请求时生成。这样可以获得最佳的性能和SEO。

```
┌─────────────────────────────────────────────────────────────┐
│              SSG 构建和渲染流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  构建时 (Build Time)                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. 运行 generateStaticParams                        │   │
│  │  2. 获取所有动态路径参数                             │   │
│  │  3. 为每个路径生成页面                               │   │
│  │  4. 执行数据获取 (fetch)                             │   │
│  │  5. 生成HTML和JSON数据                               │   │
│  │  6. 保存到 .next/server/app/                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  运行时 (Runtime)                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  用户请求页面 → 直接返回预生成的HTML                 │   │
│  │  无需服务器渲染 → 极快的响应速度                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### SSG的优势

| 优势 | 说明 | 性能提升 |
|------|------|---------|
| **CDN友好** | 静态文件可部署到CDN | 全球加速 |
| **极快响应** | 无需服务器渲染 | < 100ms |
| **SEO优化** | 完整HTML可供爬虫 | 更好收录 |
| **降低成本** | 无需服务器计算资源 | 节省费用 |
| **稳定性** | 无后端依赖 | 高可用性 |

### generateStaticParams

#### 基础用法

`generateStaticParams` 用于动态路由的静态生成，替代了Pages Router的`getStaticPaths`。

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await db.post.findMany({
    select: { slug: true },
  })

  // 返回参数对象数组
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  const post = await db.post.findUnique({
    where: { slug: params.slug },
  })

  return <article>{post.title}</article>
}
```

#### 多参数动态路由

```typescript
// app/shop/[category]/[product]/page.tsx
export async function generateStaticParams() {
  const products = await db.product.findMany({
    select: {
      category: true,
      slug: true,
    },
  })

  // 返回多参数对象
  return products.map((product) => ({
    category: product.category,
    product: product.slug,
  }))
}

export default async function ProductPage({
  params,
}: {
  params: { category: string; product: string }
}) {
  const product = await db.product.findFirst({
    where: {
      slug: params.product,
      category: params.category,
    },
  })

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  )
}
```

#### 限制生成数量

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await db.post.findMany({
    select: { slug: true },
    orderBy: { createdAt: 'desc' },
    take: 100, // 只生成最新的100篇文章
  })

  return posts.map((post) => ({
    slug: post.slug,
  }))
}
```

#### 嵌套动态路由

```typescript
// app/docs/[...slug]/page.tsx
// 匹配 /docs/a/b/c 等多层路径

export async function generateStaticParams() {
  const docs = await db.doc.findMany({
    select: { path: true },
  })

  // 将路径字符串转换为数组
  return docs.map((doc) => ({
    slug: doc.path.split('/'),
  }))
}

export default async function DocPage({
  params,
}: {
  params: { slug: string[] }
}) {
  // slug 是一个数组，如 ['a', 'b', 'c']
  const path = params.slug.join('/')
  const doc = await db.doc.findUnique({
    where: { path },
  })

  return (
    <article>
      <h1>{doc.title}</h1>
      <div>{doc.content}</div>
    </article>
  )
}
```

### 静态页面生成

#### 完全静态页面

默认情况下，App Router中的所有页面都是静态的（除非使用了动态数据获取）。

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>关于我们</h1>
      <p>这是一个静态页面</p>
    </div>
  )
}
```

#### 使用fetch的静态生成

使用`fetch`且不设置`cache: 'no-store'`时，页面会自动静态生成。

```typescript
// app/products/page.tsx
async function getProducts() {
  // 默认使用 force-cache，会静态生成
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 }, // 可选：设置ISR
  })
  return res.json()
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div>
      <h1>产品列表</h1>
      {products.map((product: any) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

#### 强制静态生成

```typescript
// app/settings/page.tsx
// 强制静态生成，即使有动态数据
export const dynamic = 'force-static'

export default async function SettingsPage() {
  // 这个函数会在构建时执行一次
  const settings = await fetch('https://api.example.com/settings').then(r => r.json())

  return (
    <div>
      <h1>设置</h1>
      <pre>{JSON.stringify(settings, null, 2)}</pre>
    </div>
  )
}
```

#### 静态生成所有路径

```typescript
// app/posts/[id]/page.tsx
export const dynamicParams = true // 允许构建时未生成的路径

export async function generateStaticParams() {
  const posts = await db.post.findMany({
    select: { id: true },
    take: 10, // 只预生成10个
  })

  return posts.map((post) => ({
    id: post.id,
  }))
}

export default async function PostPage({
  params,
}: {
  params: { id: string }
}) {
  // 如果是预生成的路径，返回静态HTML
  // 如果是其他路径，按需渲染（SSR）
  const post = await db.post.findUnique({
    where: { id: params.id },
  })

  if (!post) {
    return <div>文章未找到</div>
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

### 增量静态再生（ISR）

#### ISR基础

**增量静态再生（Incremental Static Regeneration, ISR）** 允许你在保持静态生成的优势的同时，定期更新页面内容。

```typescript
// app/blog/[slug]/page.tsx
// 设置页面每60秒重新生成一次
export const revalidate = 60

export async function generateStaticParams() {
  const posts = await db.post.findMany({
    select: { slug: true },
  })

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  const post = await db.post.findUnique({
    where: { slug: params.slug },
  })

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

#### 使用fetch的revalidate

```typescript
// app/products/page.tsx
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    // 设置缓存时间：60秒
    next: { revalidate: 60 },
  })
  return res.json()
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div>
      {products.map((product: any) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

#### On-Demand Revalidation

按需重新验证允许你在数据变化时主动触发页面更新。

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path')

  if (!path) {
    return NextResponse.json({ message: 'Missing path' }, { status: 400 })
  }

  // 重新验证指定路径
  revalidatePath(path)

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
```

```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const post = await db.post.create({
    data: { title, content },
  })

  // 重新验证博客列表页
  revalidatePath('/blog')

  // 重新验证新创建的文章页
  revalidatePath(`/blog/${post.slug}`)

  return post
}
```

### 实战案例：静态博客

让我们创建一个完整的静态博客系统。

#### 项目结构

```
app/
├── blog/
│   ├── page.tsx              # 博客列表（静态+ISR）
│   ├── [slug]/
│   │   └── page.tsx          # 博客详情（静态+ISR）
│   └── tag/
│       └── [tag]/
│           └── page.tsx      # 标签页（静态）
└── api/
    └── revalidate/
        └── route.ts          # 按需重新验证API
```

#### 1. 博客列表页（ISR）

```typescript
// app/blog/page.tsx
import Link from 'next/link'
import { Metadata } from 'next'

// ISR: 每小时重新生成
export const revalidate = 3600

export const metadata: Metadata = {
  title: '博客 - 我的技术博客',
  description: '分享前端技术知识',
}

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  createdAt: Date
  author: {
    name: string
    image: string | null
  }
  tags: string[]
  _count: {
    likes: number
    comments: number
  }
}

async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${process.env.API_URL}/posts`, {
    // 使用缓存策略
    next: {
      revalidate: 3600,
      tags: ['posts'],
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch posts')
  }

  return res.json()
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          技术博客
        </h1>
        <p className="text-xl text-gray-600">
          分享前端开发经验与技术见解
        </p>
      </div>

      {/* Featured Post */}
      {posts[0] && (
        <section className="mb-12">
          <Link href={`/blog/${posts[0].slug}`}>
            <article className="relative group overflow-hidden rounded-2xl shadow-xl">
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={posts[0].coverImage}
                  alt={posts[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-600 rounded-full mb-4">
                  精选文章
                </span>
                <h2 className="text-3xl font-bold mb-3 group-hover:text-blue-300 transition-colors">
                  {posts[0].title}
                </h2>
                <p className="text-gray-200 mb-4 line-clamp-2">
                  {posts[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <img
                      src={posts[0].author.image || '/default-avatar.png'}
                      alt={posts[0].author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    {posts[0].author.name}
                  </span>
                  <time>
                    {new Date(posts[0].createdAt).toLocaleDateString('zh-CN')}
                  </time>
                  <span>❤️ {posts[0]._count.likes}</span>
                  <span>💬 {posts[0]._count.comments}</span>
                </div>
              </div>
            </article>
          </Link>
        </section>
      )}

      {/* Post Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">最新文章</h2>
          <Link
            href="/blog/all"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            查看全部 →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group"
            >
              <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                {/* Cover Image */}
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.image || '/default-avatar.png'}
                        alt={post.author.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>❤️ {post._count.likes}</span>
                      <span>💬 {post._count.comments}</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Load More */}
      <div className="mt-12 text-center">
        <Link
          href="/blog/all"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          加载更多文章
        </Link>
      </div>
    </div>
  )
}
```

#### 2. 博客详情页（ISR）

```typescript
// app/blog/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'

// ISR: 每小时重新生成
export const revalidate = 3600

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string
  createdAt: Date
  updatedAt: Date
  author: {
    name: string
    image: string | null
    bio: string
  }
  tags: string[]
  _count: {
    likes: number
    comments: number
  }
}

// 生成静态参数
export async function generateStaticParams() {
  const res = await fetch(`${process.env.API_URL}/posts`, {
    next: { revalidate: 3600 },
  })

  const posts: Post[] = await res.json()

  // 生成所有文章的静态页面
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// 生成元数据
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const res = await fetch(`${process.env.API_URL}/posts/${params.slug}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    return {
      title: '文章未找到',
    }
  }

  const post: Post = await res.json()

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

async function getPost(slug: string): Promise<Post | null> {
  const res = await fetch(`${process.env.API_URL}/posts/${slug}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    return null
  }

  return res.json()
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
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Back Button */}
      <Link
        href="/blog"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        返回博客列表
      </Link>

      {/* Article Header */}
      <header className="mb-8">
        {/* Cover Image */}
        <div className="aspect-[21/9] overflow-hidden rounded-xl mb-8">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tag}`}
              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-gray-600 mb-6">
          {post.excerpt}
        </p>

        {/* Author & Meta */}
        <div className="flex items-center justify-between pb-6 border-b">
          <div className="flex items-center gap-4">
            <img
              src={post.author.image || '/default-avatar.png'}
              alt={post.author.name}
              className="w-14 h-14 rounded-full"
            />
            <div>
              <div className="font-semibold">{post.author.name}</div>
              <div className="text-sm text-gray-600">{post.author.bio}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LikeButton
              postId={post.id}
              initialLikes={post._count.likes}
            />
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-6 text-sm text-gray-600 pt-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <time>
              {new Date(post.createdAt).toLocaleDateString('zh-CN')}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{Math.ceil(post.content.length / 400)} 分钟阅读</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{post._count.comments} 条评论</span>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Share Section */}
      <div className="border-t border-b py-6 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">分享这篇文章</h3>
          <div className="flex gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              Twitter
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              Facebook
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              LinkedIn
            </button>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold mb-6">相关文章</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Related posts would be fetched here */}
        </div>
      </section>

      {/* Comments */}
      <CommentSection postId={post.id} />
    </article>
  )
}
```

#### 3. 标签页（完全静态）

```typescript
// app/blog/tag/[tag]/page.tsx
import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

// 完全静态
export const dynamic = 'force-static'

export async function generateStaticParams() {
  const res = await fetch(`${process.env.API_URL}/tags`)
  const tags = await res.json()

  return tags.map((tag: string) => ({
    tag: tag,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: { tag: string }
}): Promise<Metadata> {
  return {
    title: `标签: ${params.tag} - 我的博客`,
    description: `查看所有关于 ${params.tag} 的文章`,
  }
}

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  createdAt: Date
}

async function getPostsByTag(tag: string): Promise<Post[]> {
  const res = await fetch(`${process.env.API_URL}/posts/tag/${tag}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    return []
  }

  return res.json()
}

export default async function TagPage({
  params,
}: {
  params: { tag: string }
}) {
  const posts = await getPostsByTag(params.tag)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/blog"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← 返回博客
        </Link>
      </div>

      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">
          标签: #{params.tag}
        </h1>
        <p className="text-gray-600">
          找到 {posts.length} 篇相关文章
        </p>
      </header>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block"
          >
            <article className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold mb-3 hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              <time className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString('zh-CN')}
              </time>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

#### 4. 按需重新验证API

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 验证请求权限
    const auth = await authorize(request)
    if (!auth.success) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { path, tag } = body

    if (path) {
      // 重新验证特定路径
      revalidatePath(path)
      return NextResponse.json({
        revalidated: true,
        path,
        now: Date.now(),
      })
    }

    if (tag) {
      // 重新验证具有特定标签的所有页面
      revalidateTag(tag)
      return NextResponse.json({
        revalidated: true,
        tag,
        now: Date.now(),
      })
    }

    return NextResponse.json(
      { message: 'Path or tag is required' },
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

### 构建和部署

#### 1. 本地构建

```bash
# 构建静态站点
npm run build

# 查看生成的页面
npm run start
```

#### 2. 验证静态生成

```bash
# 构建时会显示生成的页面
# ✓ Generated static pages (X)
# ✓ Generated static pages (X) for /blog/[slug]
```

#### 3. 部署到Vercel

```bash
# 自动检测静态生成并优化
vercel deploy
```

### 性能优化

#### 1. 使用图片优化

```typescript
import Image from 'next/image'

<Image
  src="/blog-cover.jpg"
  alt="Blog cover"
  width={1200}
  height={630}
  priority
/>
```

#### 2. 预加载关键资源

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preload" href="/fonts/main.woff2" as="font" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| SSG基础 | 概念、优势、工作原理 | 理解核心概念 |
| generateStaticParams | 动态路由静态生成 | 掌握用法 |
| ISR | 增量静态再生、revalidate | 理解并能应用 |
| On-Demand Revalidation | 按需重新验证 | 掌握实现方法 |
| 实战应用 | 静态博客完整实现 | 能够独立开发 |

---

**下一步学习**：建议继续学习[服务端渲染（SSR）](./chapter-90)了解动态内容渲染。
