# 动态路由与路由参数

## 动态路由与路由参数

> **学习目标**：深入掌握Next.js动态路由系统，能够处理复杂的路由参数场景
> **核心内容**：动态路由深入、路由参数处理、generateStaticParams、实战案例

### 动态路由深入

#### 什么是动态路由

**动态路由** 允许你创建可以匹配多个URL的页面，通过在文件夹名称中使用方括号`[]`来定义动态段。

```
┌─────────────────────────────────────────────────────────────┐
│                    动态路由匹配规则                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  文件系统                           URL                      │
│  ┌──────────────────────┐        ┌──────────────────────┐  │
│  │ app/blog/[slug]/     │  →     │ /blog/hello-world    │  │
│  │     page.tsx         │        │ /blog/nextjs-guide   │  │
│  └──────────────────────┘        │ /blog/any-slug       │  │
│                                  └──────────────────────┘  │
│                                                             │
│  ┌──────────────────────┐        ┌──────────────────────┐  │
│  │ app/shop/[category]/ │  →     │ /shop/electronics    │  │
│  │     [product]/       │        │ /shop/clothing/tshirt│  │
│  │     page.tsx         │        │ /shop/books/guide    │  │
│  └──────────────────────┘        └──────────────────────┘  │
│                                                             │
│  ┌──────────────────────┐        ┌──────────────────────┐  │
│  │ app/docs/[...slug]/  │  →     │ /docs/a              │  │
│  │     page.tsx         │        │ /docs/a/b            │  │
│  │                        │        │ /docs/a/b/c          │  │
│  └──────────────────────┘        └──────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 单段动态路由

**基础用法**：

```typescript
// app/blog/[slug]/page.tsx
// 匹配: /blog/hello-world, /blog/nextjs-14, etc.

interface BlogPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = params

  // 从API获取文章数据
  const post = await fetch(`https://api.example.com/posts/${slug}`)
    .then(r => r.json())

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

**参数类型转换**：

```typescript
// app/product/[id]/page.tsx
// 匹配: /product/123, /product/456, etc.

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // 将字符串ID转换为数字
  const productId = parseInt(params.id, 10)

  if (isNaN(productId)) {
    throw new Error('Invalid product ID')
  }

  const product = await fetch(
    `https://api.example.com/products/${productId}`
  ).then(r => r.json())

  return (
    <div>
      <h1>Product #{product.id}</h1>
      <p>{product.name}</p>
      <p>Price: ${product.price}</p>
    </div>
  )
}
```

#### 多段动态路由

**嵌套动态段**：

```typescript
// app/shop/[category]/[product]/page.tsx
// 匹配: /shop/electronics/laptop
//       /shop/clothing/tshirt
//       /shop/books/guide

interface ProductPageProps {
  params: {
    category: string
    product: string
  }
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { category, product } = params

  // 根据分类和产品获取数据
  const item = await fetch(
    `https://api.example.com/shop/${category}/${product}`
  ).then(r => r.json())

  return (
    <div>
      <nav className="breadcrumb">
        <a href="/">Home</a>
        <span> / </span>
        <a href={`/shop/${category}`}>{category}</a>
        <span> / </span>
        <span>{product}</span>
      </nav>

      <h1>{item.name}</h1>
      <p>Category: {category}</p>
      <p>Price: ${item.price}</p>
    </div>
  )
}
```

**三层动态路由**：

```typescript
// app/api/[version]/[resource]/[id]/route.ts
// 匹配: /api/v1/users/123
//       /api/v2/posts/456

interface RouteContext {
  params: {
    version: string
    resource: string
    id: string
  }
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  const { version, resource, id } = context.params

  // 根据版本调用不同的API
  const data = await fetch(
    `https://backend.example.com/${version}/${resource}/${id}`
  ).then(r => r.json())

  return Response.json(data)
}
```

#### 捕获所有路由

**基本捕获**：

```typescript
// app/docs/[...slug]/page.tsx
// 匹配: /docs/a
//       /docs/a/b
//       /docs/a/b/c
//       /docs/a/b/c/d (任意深度)

interface DocsPageProps {
  params: {
    slug: string[]
  }
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = params

  // slug 是一个字符串数组
  // 例如: ['guide', 'installation', 'windows']
  const docPath = slug.join('/')

  const doc = await fetch(
    `https://api.example.com/docs/${docPath}`
  ).then(r => r.json())

  if (!doc) {
    notFound()
  }

  return (
    <div>
      <h1>{doc.title}</h1>
      <div>{doc.content}</div>
    </div>
  )
}
```

**带类型的捕获路由**：

```typescript
// app/api/[...path]/route.ts
// 匹配所有 /api 开头的路径

interface ApiRouteContext {
  params: {
    path: string[]
  }
}

export async function GET(
  request: Request,
  context: ApiRouteContext
) {
  const { path } = context.params

  // 将路径数组转换为完整路径
  const apiPath = path.join('/')

  // 转发到后端API
  const backendUrl = `https://backend.example.com/${apiPath}`
  const queryParams = new URL(request.url).search

  const response = await fetch(`${backendUrl}${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  return Response.json(data)
}
```

### 路由参数处理

#### params对象详解

**在Server Components中**：

```typescript
// app/blog/[slug]/page.tsx
interface PageProps {
  params: {
    slug: string
  }
}

export default async function BlogPage({ params }: PageProps) {
  // ✅ params 在 Server Components 中是 awaitable
  const slug = await params.slug

  // 或直接使用（Next.js 14+ 会自动处理）
  const post = await fetch(
    `https://api.example.com/posts/${params.slug}`
  ).then(r => r.json())

  return <div>{post.title}</div>
}
```

**在Route Handlers中**：

```typescript
// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // params 需要被 await
  const id = await params.id

  const post = await fetch(
    `https://api.example.com/posts/${id}`
  ).then(r => r.json())

  return NextResponse.json(post)
}
```

**动态路由参数验证**：

```typescript
// app/user/[userId]/page.tsx
import { redirect, notFound } from 'next/navigation'

interface UserPageProps {
  params: {
    userId: string
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const userId = await params.userId

  // 验证用户ID格式
  if (!/^\d+$/.test(userId)) {
    // 如果不是纯数字，重定向到错误页面
    redirect('/error')
  }

  // 获取用户数据
  const user = await fetch(
    `https://api.example.com/users/${userId}`
  ).then(r => r.json())

  // 检查用户是否存在
  if (!user || !user.id) {
    notFound()
  }

  return (
    <div>
      <h1>User: {user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  )
}
```

#### searchParams处理

**获取查询参数**：

```typescript
// app/blog/page.tsx
interface BlogPageProps {
  searchParams: {
    page?: string
    category?: string
    sort?: 'asc' | 'desc'
  }
}

export default async function BlogPage({
  searchParams,
}: BlogPageProps) {
  // searchParams 需要被 await
  const page = await (searchParams.page || '1')
  const category = await (searchParams.category || '')
  const sort = await (searchParams.sort || 'desc')

  // 构建API URL
  const apiUrl = new URL('https://api.example.com/posts')
  apiUrl.searchParams.set('page', page)
  if (category) {
    apiUrl.searchParams.set('category', category)
  }
  apiUrl.searchParams.set('sort', sort)

  const posts = await fetch(apiUrl.toString()).then(r => r.json())

  return (
    <div>
      <h1>Blog Posts</h1>
      {/* 显示当前过滤条件 */}
      <div className="filters">
        Category: {category || 'All'}
        Sort: {sort}
      </div>

      <ul>
        {posts.map((post: any) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

**组合params和searchParams**：

```typescript
// app/blog/[category]/page.tsx
interface BlogPageProps {
  params: {
    category: string
  }
  searchParams: {
    page?: string
    tag?: string
  }
}

export default async function BlogPage({
  params,
  searchParams,
}: BlogPageProps) {
  const category = await params.category
  const page = await (searchParams.page || '1')
  const tag = await searchParams.tag

  // 构建查询
  const apiUrl = new URL(`https://api.example.com/posts/${category}`)
  apiUrl.searchParams.set('page', page)
  if (tag) {
    apiUrl.searchParams.set('tag', tag)
  }

  const posts = await fetch(apiUrl.toString()).then(r => r.json())

  return (
    <div>
      <h1>Category: {category}</h1>
      {tag && <p>Tag: {tag}</p>}
      <ul>
        {posts.map((post: any) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

### generateStaticParams详解

#### 静态生成基础

**什么是generateStaticParams**：

`generateStaticParams` 函数用于在构建时生成动态路由的静态参数，结合 `export const dynamic = 'force-static'` 可以实现完全静态生成。

```
┌─────────────────────────────────────────────────────────────┐
│            generateStaticParams 工作流程                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  构建时 (Build Time)                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. 调用 generateStaticParams()                       │   │
│  │    返回所有可能的参数组合                             │   │
│  │    [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }]   │   │
│  │                                                      │   │
│  │ 2. 为每个参数预渲染页面                               │   │
│  │    /blog/a → HTML + JSON                             │   │
│  │    /blog/b → HTML + JSON                             │   │
│  │    /blog/c → HTML + JSON                             │   │
│  │                                                      │   │
│  │ 3. 生成静态文件                                       │   │
│  │    博客内容在构建时已确定，无需服务器                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  运行时 (Runtime)                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • 访问 /blog/a → 立即返回预渲染的HTML                 │   │
│  │ • 访问 /blog/d → 触发按需渲染（如果允许）或404        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 基础用法

**简单示例**：

```typescript
// app/blog/[slug]/page.tsx

// 1. 定义 generateStaticParams
export async function generateStaticParams() {
  // 从API或数据源获取所有文章
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())

  // 返回参数数组
  return posts.map((post: any) => ({
    slug: post.slug,
  }))
}

// 2. 使用参数
interface BlogPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = params

  const post = await fetch(
    `https://api.example.com/posts/${slug}`
  ).then(r => r.json())

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

**分页示例**：

```typescript
// app/blog/page.tsx

// 生成前10页的静态参数
export async function generateStaticParams() {
  // 返回1到10的页码
  return Array.from({ length: 10 }, (_, i) => ({
    page: String(i + 1),
  }))
}

interface BlogPageProps {
  searchParams: {
    page?: string
  }
}

export default async function BlogPage({
  searchParams,
}: BlogPageProps) {
  const page = await (searchParams.page || '1')
  const pageNum = parseInt(page, 10)

  const posts = await fetch(
    `https://api.example.com/posts?page=${pageNum}`
  ).then(r => r.json())

  return (
    <div>
      <h1>Blog - Page {page}</h1>
      <ul>
        {posts.map((post: any) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

#### 多段动态路由的静态生成

**嵌套参数生成**：

```typescript
// app/shop/[category]/[product]/page.tsx

export async function generateStaticParams() {
  // 获取所有分类
  const categories = await fetch('https://api.example.com/categories')
    .then(r => r.json())

  // 为每个分类生成产品参数
  const params = []

  for (const category of categories) {
    const products = await fetch(
      `https://api.example.com/categories/${category.id}/products`
    ).then(r => r.json())

    for (const product of products) {
      params.push({
        category: category.slug,
        product: product.slug,
      })
    }
  }

  return params
}

interface ProductPageProps {
  params: {
    category: string
    product: string
  }
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { category, product } = params

  const item = await fetch(
    `https://api.example.com/shop/${category}/${product}`
  ).then(r => r.json())

  return (
    <div>
      <h1>{item.name}</h1>
      <p>Category: {category}</p>
    </div>
  )
}
```

#### 动态配置

**混合静态和动态渲染**：

```typescript
// app/blog/[slug]/page.tsx

// 仅生成前100篇文章为静态
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json())

  // 只返回前100篇
  return posts.slice(0, 100).map((post: any) => ({
    slug: post.slug,
  }))
}

// 配置动态行为
export const dynamic = 'force-static' // 强制静态生成
// export const dynamic = 'auto' // 自动（默认）
// export const dynamic = 'force-dynamic' // 强制动态渲染

interface BlogPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const post = await fetch(
    `https://api.example.com/posts/${params.slug}`,
    {
      // 对于静态生成的页面，使用缓存
      next: { revalidate: 3600 }, // 1小时后重新验证
    }
  ).then(r => r.json())

  if (!post) {
    notFound()
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

**分段静态生成**：

```typescript
// app/docs/[...slug]/page.tsx

// 生成常用文档路径为静态
export async function generateStaticParams() {
  const docs = [
    'getting-started',
    'installation',
    'configuration',
    'api-reference',
    'deployment',
  ]

  return docs.map((doc) => ({
    slug: [doc],
  }))
}

interface DocsPageProps {
  params: {
    slug: string[]
  }
}

export default async function DocsPage({ params }: DocsPageProps) {
  const slug = params.slug.join('/')

  const doc = await fetch(
    `https://api.example.com/docs/${slug}`,
    {
      next: {
        revalidate: 86400, // 24小时
      },
    }
  ).then(r => r.json())

  if (!doc) {
    notFound()
  }

  return (
    <div>
      <h1>{doc.title}</h1>
      <div>{doc.content}</div>
    </div>
  )
}
```

### 实战案例：产品详情页

让我们创建一个完整的产品详情页系统，涵盖动态路由的所有核心概念。

#### 1. 项目结构

```
app/
├── products/
│   ├── page.tsx              # 产品列表
│   ├── [id]/
│   │   ├── page.tsx          # 产品详情
│   │   ├── reviews/
│   │   │   └── page.tsx      # 产品评论
│   │   └── related/
│   │       └── page.tsx      # 相关产品
│   └── category/
│       └── [category]/
│           └── page.tsx      # 分类产品
└── api/
    └── products/
        └── [id]/
            └── route.ts      # 产品API
```

#### 2. 产品数据模型

```typescript
// src/types/product.ts
export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  category: string
  images: string[]
  stock: number
  rating: number
  reviews: Review[]
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: number
  productId: number
  user: string
  rating: number
  comment: string
  createdAt: string
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  search?: string
}
```

#### 3. 产品列表页

```typescript
// app/products/page.tsx
import Link from 'next/link'
import { Suspense } from 'react'

interface ProductsPageProps {
  searchParams: {
    category?: string
    minPrice?: string
    maxPrice?: string
    page?: string
  }
}

async function getProducts(filters: any) {
  const apiUrl = new URL('http://localhost:3000/api/products')

  if (filters.category) {
    apiUrl.searchParams.set('category', filters.category)
  }
  if (filters.minPrice) {
    apiUrl.searchParams.set('minPrice', filters.minPrice)
  }
  if (filters.maxPrice) {
    apiUrl.searchParams.set('maxPrice', filters.maxPrice)
  }
  if (filters.page) {
    apiUrl.searchParams.set('page', filters.page)
  }

  const response = await fetch(apiUrl.toString())
  return response.json()
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const products = await getProducts(searchParams)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">产品列表</h1>
        <p className="text-gray-600">
          共 {products.total} 个产品
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* 侧边栏过滤器 */}
        <aside className="lg:col-span-1">
          <Filters />
        </aside>

        {/* 产品网格 */}
        <div className="lg:col-span-3">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={products.data} />
          </Suspense>

          {/* 分页 */}
          <Pagination
            currentPage={products.page}
            totalPages={products.totalPages}
          />
        </div>
      </div>
    </div>
  )
}

// 产品网格组件
function ProductGrid({ products }: { products: any[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="group"
        >
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* 产品图片 */}
            <div className="relative h-48 bg-gray-200">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {product.rating >= 4 && (
                <span className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded text-sm font-medium">
                  热销
                </span>
              )}
            </div>

            {/* 产品信息 */}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  ¥{product.price}
                </span>
                <span className="text-sm text-gray-500">
                  库存: {product.stock}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// 加载骨架屏
function ProductGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// 过滤器组件
function Filters() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-bold mb-4">过滤器</h2>

      <form className="space-y-4">
        {/* 分类过滤 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            分类
          </label>
          <select
            name="category"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">所有分类</option>
            <option value="electronics">电子产品</option>
            <option value="clothing">服装</option>
            <option value="books">图书</option>
          </select>
        </div>

        {/* 价格范围 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            价格范围
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="最低价"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="最高价"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          应用过滤
        </button>
      </form>
    </div>
  )
}

// 分页组件
function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const pages = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <a
        href={`/products?page=${Math.max(1, currentPage - 1)}`}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        上一页
      </a>

      {pages.map((page) => (
        <a
          key={page}
          href={`/products?page=${page}`}
          className={`px-4 py-2 rounded-lg ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </a>
      ))}

      <a
        href={`/products?page=${Math.min(totalPages, currentPage + 1)}`}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        下一页
      </a>
    </div>
  )
}
```

#### 4. 产品详情页

```typescript
// app/products/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'

// 生成静态参数
export async function generateStaticParams() {
  const products = await fetch('http://localhost:3000/api/products')
    .then(r => r.json())

  // 生成前100个产品为静态
  return products.slice(0, 100).map((product: any) => ({
    id: String(product.id),
  }))
}

// 生成元数据
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await fetch(
    `http://localhost:3000/api/products/${await params.id}`
  ).then(r => r.json())

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images,
    },
  }
}

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const id = await params.id

  // 获取产品数据
  const product = await fetch(
    `http://localhost:3000/api/products/${id}`,
    {
      next: {
        revalidate: 3600, // 1小时
        tags: [`product-${id}`], // 用于按需重新验证
      },
    }
  ).then(r => r.json())

  if (!product || !product.id) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 面包屑 */}
      <nav className="mb-8 text-sm">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-blue-600 hover:underline">
              首页
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/products" className="text-blue-600 hover:underline">
              产品
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={`/products/category/${product.category}`}
              className="text-blue-600 hover:underline"
            >
              {product.category}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-600">{product.name}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 产品图片 */}
        <div className="space-y-4">
          <div className="relative h-96 bg-white rounded-lg shadow-md overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* 缩略图 */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image: string, index: number) => (
              <div
                key={index}
                className="relative h-20 bg-white rounded border-2 border-transparent hover:border-blue-500 cursor-pointer"
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 产品信息 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl ${
                      star <= product.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-gray-600">
                {product.reviews.length} 条评论
              </span>
            </div>

            <div className="text-5xl font-bold text-blue-600 mb-6">
              ¥{product.price}
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* 库存状态 */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✓ 有货 (库存: {product.stock})
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  ✗ 缺货
                </span>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4 mb-8">
              <button
                disabled={product.stock === 0}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                加入购物车
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                收藏
              </button>
            </div>

            {/* 产品详情 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">产品详情</h3>
              <dl className="space-y-2">
                <div className="flex">
                  <dt className="w-32 text-gray-600">分类:</dt>
                  <dd>
                    <Link
                      href={`/products/category/${product.category}`}
                      className="text-blue-600 hover:underline"
                    >
                      {product.category}
                    </Link>
                  </dd>
                </div>
                <div className="flex">
                  <dt className="w-32 text-gray-600">上架时间:</dt>
                  <dd className="text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString('zh-CN')}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="w-32 text-gray-600">更新时间:</dt>
                  <dd className="text-gray-900">
                    {new Date(product.updatedAt).toLocaleDateString('zh-CN')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 选项卡 */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <a
              href={`/products/${id}/reviews`}
              className="py-4 px-1 border-b-2 border-blue-600 text-blue-600 font-medium"
            >
              评论 ({product.reviews.length})
            </a>
            <a
              href={`/products/${id}/related`}
              className="py-4 px-1 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              相关产品
            </a>
          </nav>
        </div>

        {/* 评论预览 */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-6">最新评论</h3>
          <div className="space-y-6">
            {product.reviews.slice(0, 3).map((review: any) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {review.user[0]}
                    </div>
                    <span className="font-medium">{review.user}</span>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          star <= review.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <div className="mt-3 text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
            ))}
          </div>

          <Link
            href={`/products/${id}/reviews`}
            className="inline-block mt-6 text-blue-600 hover:text-blue-700 font-medium"
          >
            查看所有评论 →
          </Link>
        </div>
      </div>
    </div>
  )
}
```

#### 5. 产品评论页

```typescript
// app/products/[id]/reviews/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ReviewsPageProps {
  params: {
    id: string
  }
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const id = await params.id

  const product = await fetch(
    `http://localhost:3000/api/products/${id}`
  ).then(r => r.json())

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/products/${id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          ← 返回产品详情
        </Link>

        <h1 className="text-4xl font-bold mb-8">
          {product.name} - 评论
        </h1>

        {/* 评论统计 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600">
                {product.rating}
              </div>
              <div className="text-gray-600">平均评分</div>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = product.reviews.filter(
                  (r: any) => r.rating === star
                ).length
                const percentage = (count / product.reviews.length) * 100

                return (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <span className="w-12 text-sm">{star} 星</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-sm text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 评论列表 */}
        <div className="space-y-6">
          {product.reviews.map((review: any) => (
            <div
              key={review.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {review.user[0]}
                  </div>
                  <div>
                    <div className="font-medium">{review.user}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-xl ${
                        star <= review.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 text-lg">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### 6. 产品API路由

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = 12

  // 模拟数据库查询
  let products = [
    {
      id: 1,
      name: '高性能笔记本电脑',
      slug: 'high-performance-laptop',
      description: '搭载最新处理器，16GB内存，512GB固态硬盘',
      price: 5999,
      category: 'electronics',
      images: ['/images/laptop.jpg'],
      stock: 50,
      rating: 4.5,
      reviews: [
        {
          id: 1,
          user: '张三',
          rating: 5,
          comment: '性能非常出色，运行流畅！',
          createdAt: '2024-01-15',
        },
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
    // ... 更多产品
  ]

  // 应用过滤
  if (category) {
    products = products.filter(p => p.category === category)
  }
  if (minPrice) {
    products = products.filter(p => p.price >= parseInt(minPrice, 10))
  }
  if (maxPrice) {
    products = products.filter(p => p.price <= parseInt(maxPrice, 10))
  }

  // 分页
  const total = products.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const paginatedProducts = products.slice(start, start + limit)

  return NextResponse.json({
    data: paginatedProducts,
    page,
    limit,
    total,
    totalPages,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // 验证数据
  if (!body.name || !body.price) {
    return NextResponse.json(
      { error: '名称和价格是必需的' },
      { status: 400 }
    )
  }

  // 创建新产品
  const newProduct = {
    id: Date.now(),
    ...body,
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json(newProduct, { status: 201 })
}
```

```typescript
// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { notFound } from 'next/navigation'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id

  // 模拟数据库查询
  const product = {
    id: parseInt(id, 10),
    name: '高性能笔记本电脑',
    description: '搭载最新处理器',
    price: 5999,
    category: 'electronics',
    images: ['/images/laptop.jpg'],
    stock: 50,
    rating: 4.5,
    reviews: [],
  }

  if (!product) {
    notFound()
  }

  return NextResponse.json(product)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id
  const body = await request.json()

  // 更新产品
  const updatedProduct = {
    id: parseInt(id, 10),
    ...body,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(updatedProduct)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id

  // 删除产品
  return new NextResponse(null, { status: 204 })
}
```

### 最佳实践

#### 1. 参数验证

```typescript
// ✅ 推荐：严格验证路由参数
export default async function Page({ params }: { params: { id: string } }) {
  const id = await params.id

  // 验证格式
  if (!/^\d+$/.test(id)) {
    redirect('/error')
  }

  // 验证范围
  const numId = parseInt(id, 10)
  if (numId < 1 || numId > 10000) {
    notFound()
  }

  // 验证存在性
  const data = await fetchData(numId)
  if (!data) {
    notFound()
  }

  return <div>{data.title}</div>
}
```

#### 2. 错误处理

```typescript
// ✅ 推荐：完善的错误处理
export default async function Page({ params }: { params: { id: string } }) {
  try {
    const id = await params.id
    const data = await fetch(`https://api.example.com/data/${id}`)

    if (!data.ok) {
      if (data.status === 404) {
        notFound()
      }
      throw new Error('Failed to fetch data')
    }

    const json = await data.json()
    return <div>{json.title}</div>
  } catch (error) {
    console.error('Error:', error)
    redirect('/error')
  }
}
```

#### 3. 性能优化

```typescript
// ✅ 推荐：合理使用静态生成
export async function generateStaticParams() {
  // 只生成热门内容
  const popularPosts = await getPopularPosts()

  return popularPosts.map(post => ({
    slug: post.slug,
  }))
}

// 配置缓存策略
export const revalidate = 3600 // 1小时

// 使用按需重新验证
export const fetchCache = 'force-cache'
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| 单段动态路由 | [param] 语法 | 熟练掌握 |
| 多段动态路由 | 嵌套参数 | 熟练掌握 |
| 捕获所有路由 | [...param] 语法 | 掌握 |
| params处理 | Server/Client组件 | 理解差异 |
| searchParams | 查询参数处理 | 掌握 |
| generateStaticParams | 静态生成 | 熟练掌握 |
| 参数验证 | 类型和范围验证 | 必须掌握 |

---

**下一步学习**：建议继续学习[路由组与并行路由](./chapter-98)深入了解Next.js的高级路由特性。
