# 数据获取完全指南

## 数据获取完全指南

> **学习目标**：掌握Next.js中的各种数据获取模式，构建高效的数据驱动应用
> **核心内容**：Fetch API与缓存、async/await、数据获取模式、实战案例

### Next.js数据获取概述

#### 数据获取策略

```
┌─────────────────────────────────────────────────────────────┐
│           Next.js 数据获取策略选择                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  数据特点 → 推荐策略                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  静态数据，不常变化 → SSG (构建时获取)                │   │
│  │  动态数据，定期更新 → ISR (revalidate)               │   │
│  │  实时数据，每次变化 → SSR (cache: 'no-store')        │   │
│  │  用户特定数据 → SSR (请求时获取)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Fetch API与缓存

#### 1. 默认缓存行为

```typescript
// 默认使用 force-cache（自动缓存）
async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  const data = await res.json()
  return data
}

export default async function Page() {
  const posts = await getPosts()
  return <div>{/* 渲染posts */}</div>
}
```

#### 2. 缓存选项

**force-cache（默认）**：

```typescript
const res = await fetch('https://api.example.com/data', {
  cache: 'force-cache', // 静态数据，永不重新验证
})
```

**no-store（动态渲染）**：

```typescript
const res = await fetch('https://api.example.com/data', {
  cache: 'no-store', // 每次请求都获取新数据
})
```

**no-cache（重新验证）**：

```typescript
const res = await fetch('https://api.example.com/data', {
  cache: 'no-cache', // 类似revalidate(0)
})
```

#### 3. Next.js扩展选项

**revalidate（时间基础重新验证）**：

```typescript
const res = await fetch('https://api.example.com/posts', {
  next: {
    revalidate: 3600, // 1小时后重新验证
  },
})
```

**tags（标签基础重新验证）**：

```typescript
const res = await fetch('https://api.example.com/posts', {
  next: {
    tags: ['posts', 'blog'],
  },
})

// 按需重新验证
import { revalidateTag } from 'next/cache'
revalidateTag('posts')
```

**组合使用**：

```typescript
const res = await fetch('https://api.example.com/posts', {
  next: {
    revalidate: 3600,
    tags: ['posts'],
  },
})
```

### async/await in Server Components

#### 1. 基础async组件

```typescript
// app/users/page.tsx
async function getUsers() {
  const res = await fetch('https://api.example.com/users', {
    next: { revalidate: 3600 },
  })
  return res.json()
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div>
      <h1>用户列表</h1>
      <ul>
        {users.map((user: any) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

#### 2. 串行数据获取

```typescript
// ❌ 不推荐：串行获取（慢）
export default async function Page() {
  const user = await getUser() // 等待1秒
  const posts = await getPosts() // 等待1秒
  const comments = await getComments() // 等待1秒

  // 总耗时：3秒

  return <div>{/* ... */}</div>
}
```

#### 3. 并行数据获取

```typescript
// ✅ 推荐：并行获取（快）
export default async function Page() {
  const [user, posts, comments] = await Promise.all([
    getUser(),     // 1秒
    getPosts(),    // 1秒
    getComments(), // 1秒
  ])

  // 总耗时：1秒

  return <div>{/* ... */}</div>
}
```

#### 4. 带错误处理的数据获取

```typescript
// app/dashboard/page.tsx
async function getData() {
  try {
    const res = await fetch('https://api.example.com/data', {
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    return await res.json()
  } catch (error) {
    console.error('Failed to fetch data:', error)
    return null
  }
}

export default async function DashboardPage() {
  const data = await getData()

  if (!data) {
    return <div>加载失败，请稍后重试</div>
  }

  return <div>{/* 渲染数据 */}</div>
}
```

### 数据获取模式

#### 模式1：静态生成（SSG）

```typescript
// app/about/page.tsx
export const dynamic = 'force-static'

export default async function AboutPage() {
  const content = await fetch('https://api.example.com/about').then(r => r.json())

  return (
    <div>
      <h1>{content.title}</h1>
      <p>{content.description}</p>
    </div>
  )
}
```

#### 模式2：增量静态再生（ISR）

```typescript
// app/blog/page.tsx
export const revalidate = 3600

export default async function BlogPage() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 },
  }).then(r => r.json())

  return (
    <div>
      {posts.map((post: any) => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  )
}
```

#### 模式3：服务端渲染（SSR）

```typescript
// app/profile/page.tsx
export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const profile = await fetch('https://api.example.com/profile', {
    cache: 'no-store',
  }).then(r => r.json())

  return (
    <div>
      <h1>{profile.name}</h1>
      <p>{profile.bio}</p>
    </div>
  )
}
```

#### 模式4：混合模式

```typescript
// app/dashboard/page.tsx
async function getDashboardData() {
  const [staticConfig, dynamicStats] = await Promise.all([
    // 静态配置（很少变化）
    fetch('https://api.example.com/config', {
      next: { revalidate: 86400 }, // 1天
    }).then(r => r.json()),

    // 动态统计（实时）
    fetch('https://api.example.com/stats', {
      cache: 'no-store',
    }).then(r => r.json()),
  ])

  return { staticConfig, dynamicStats }
}

export default async function DashboardPage() {
  const { staticConfig, dynamicStats } = await getDashboardData()

  return (
    <div>
      <h1>{staticConfig.siteName}</h1>
      <p>当前用户数: {dynamicStats.userCount}</p>
    </div>
  )
}
```

### 实战案例：电商数据展示

创建一个完整的电商产品展示系统。

#### 1. 产品列表页（ISR）

```typescript
// app/products/page.tsx
import Link from 'next/link'
import { Metadata } from 'next'

export const revalidate = 1800 // 30分钟

export const metadata: Metadata = {
  title: '产品列表 - 我们的商店',
  description: '浏览我们所有优质产品',
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: string
  inStock: boolean
  rating: number
  reviewsCount: number
}

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
}

async function getProducts(page: string = '1'): Promise<ProductsResponse> {
  const res = await fetch(
    `${process.env.API_URL}/products?page=${page}`,
    {
      next: {
        revalidate: 1800,
        tags: ['products'],
      },
    }
  )

  if (!res.ok) {
    throw new Error('Failed to fetch products')
  }

  return res.json()
}

async function getCategories(): Promise<string[]> {
  const res = await fetch(`${process.env.API_URL}/categories`, {
    next: { revalidate: 86400 }, // 分类很少变化
  })

  return res.json()
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string }
}) {
  const page = searchParams.page || '1'
  const [productsData, categories] = await Promise.all([
    getProducts(page),
    getCategories(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">产品列表</h1>
        <p className="text-gray-600">
          共 {productsData.total} 个产品
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-8">
            <h2 className="text-lg font-bold mb-4">分类</h2>
            <nav className="space-y-2">
              <Link
                href="/products"
                className="block px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                全部产品
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/products?category=${category}`}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  {category}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsData.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            total={productsData.total}
            page={parseInt(page)}
            pageSize={productsData.pageSize}
          />
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      )
    : 0

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <div className="text-xs text-gray-600 mb-1">
            {product.category}
          </div>

          {/* Name */}
          <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {i < Math.floor(product.rating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-600">
              ({product.reviewsCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">
              ¥{product.price}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  ¥{product.compareAtPrice}
                </span>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="mt-2 text-xs text-red-600 font-medium">
              缺货
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function Pagination({
  total,
  page,
  pageSize,
}: {
  total: number
  page: number
  pageSize: number
}) {
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {page > 1 && (
        <Link
          href={`/products?page=${page - 1}`}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          上一页
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
        .map((p, i, arr) => {
          const prev = arr[i - 1]
          const showEllipsis = prev && p > prev + 1

          return (
            <div key={p}>
              {showEllipsis && <span className="px-2">...</span>}
              <Link
                href={`/products?page=${p}`}
                className={`px-4 py-2 border rounded-lg ${
                  p === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </Link>
            </div>
          )
        })}

      {page < totalPages && (
        <Link
          href={`/products?page=${page + 1}`}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          下一页
        </Link>
      )}
    </div>
  )
}
```

#### 2. 产品详情页（ISR）

```typescript
// app/products/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/AddToCartButton'
import ProductReviews from '@/components/ProductReviews'

export const revalidate = 1800

export async function generateStaticParams() {
  const res = await fetch(`${process.env.API_URL}/products`, {
    next: { revalidate: 1800 },
  })

  const { products } = await res.json()

  // 生成前100个产品的静态页面
  return products.slice(0, 100).map((product: any) => ({
    slug: product.slug,
  }))
}

async function getProduct(slug: string) {
  const res = await fetch(`${process.env.API_URL}/products/${slug}`, {
    next: {
      revalidate: 1800,
      tags: ['products', `product-${slug}`],
    },
  })

  if (!res.ok) {
    return null
  }

  return res.json()
}

async function getRelatedProducts(category: string, currentSlug: string) {
  const res = await fetch(
    `${process.env.API_URL}/products/related?category=${category}&exclude=${currentSlug}`,
    {
      next: { revalidate: 1800 },
    }
  )

  return res.json()
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category, product.slug)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              首页
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/products" className="text-blue-600 hover:text-blue-700">
              产品
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-600">{product.name}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div>
          <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image: string, index: number) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-75"
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {i < Math.floor(product.rating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-gray-600">
              {product.rating} ({product.reviewsCount} 条评价)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-blue-600">
                ¥{product.price}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl text-gray-400 line-through">
                  ¥{product.compareAtPrice}
                </span>
              )}
            </div>

            {product.compareAtPrice && (
              <div className="mt-2 text-sm text-red-600">
                优惠价：节省 ¥{product.compareAtPrice - product.price}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">商品描述</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.inStock ? (
              <div className="text-green-600 font-medium">
                ✓ 现货，立即发货
              </div>
            ) : (
              <div className="text-red-600 font-medium">
                ✗ 暂时缺货
              </div>
            )}
          </div>

          {/* Add to Cart */}
          <div className="flex gap-4">
            <AddToCartButton
              productId={product.id}
              inStock={product.inStock}
            />
            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              加入收藏
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold mb-4">产品特点</h3>
            <ul className="space-y-2">
              {product.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews productId={product.id} />

      {/* Related Products */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-8">相关产品</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
```

### 数据获取最佳实践

#### 1. 选择合适的缓存策略

```typescript
// ✅ 静态内容
fetch('/api/about', { next: { revalidate: 86400 } })

// ✅ 定期更新内容
fetch('/api/posts', { next: { revalidate: 3600 } })

// ✅ 实时内容
fetch('/api/stats', { cache: 'no-store' })

// ✅ 用户特定内容
fetch(`/api/user/${id}`, { cache: 'no-store' })
```

#### 2. 并行获取独立数据

```typescript
// ✅ 好：并行获取
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments(),
])

// ❌ 差：串行获取
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

#### 3. 使用错误边界

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>出错了: {error.message}</h2>
      <button onClick={reset}>重试</button>
    </div>
  )
}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| Fetch缓存 | cache、next选项 | 掌握配置方法 |
| async/await | Server Components数据获取 | 熟练使用 |
| 数据模式 | SSG、ISR、SSR | 能够选择合适策略 |
| 并行获取 | Promise.all | 理解性能优化 |
| 实战应用 | 电商数据展示 | 能够独立开发 |

---

**下一步学习**：建议继续学习[Server Actions详解](./chapter-93)了解服务端数据变更。
