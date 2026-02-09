# 缓存策略与Revalidation

## 缓存策略与Revalidation

> **学习目标**：掌握Next.js的缓存机制和重新验证策略，优化应用性能
> **核心内容**：Next.js缓存机制、数据缓存、完全路由缓存、重新验证策略、实战案例

### Next.js缓存机制概述

#### 缓存层次结构

```
┌─────────────────────────────────────────────────────────────┐
│              Next.js 缓存层次                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 数据缓存 (Data Cache)                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • fetch()响应缓存                                  │   │
│  │  • 在服务端共享                                      │   │
│  │  • 支持revalidate和tags                             │   │
│  └─────────────────────────────────────────────────────┘   │
│              ↓                                               │
│  2. 完全路由缓存 (Full Route Cache)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • 服务端渲染的HTML缓存                              │   │
│  │  • 包含React服务器组件payload                        │   │
│  │  • 客户端导航时复用                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│              ↓                                               │
│  3. 客户端路由缓存                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • 浏览器缓存已访问的页面                            │   │
│  │  • 前进/后退时即时显示                               │   │
│  │  • 可配置prefetch行为                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 数据缓存

#### 1. Fetch缓存选项

**No-Store（不缓存）**：

```typescript
// 实时数据，每次请求都获取
const res = await fetch('https://api.example.com/realtime', {
  cache: 'no-store',
})

// 或在路由级别强制动态渲染
export const dynamic = 'force-dynamic'
```

**Force-Cache（强制缓存）**：

```typescript
// 静态数据，永久缓存
const res = await fetch('https://api.example.com/static', {
  cache: 'force-cache',
})

// 或使用配置对象
const res = await fetch('https://api.example.com/static', {
  next: { revalidate: false },
})
```

**Revalidate（重新验证）**：

```typescript
// 定期重新验证
const res = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }, // 每小时重新验证
})
```

#### 2. 基于标签的缓存

```typescript
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: {
      revalidate: 3600,
      tags: ['posts', 'blog'], // 添加标签
    },
  })

  return res.json()
}

// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'

export async function POST() {
  // 重新验证所有带'posts'标签的请求
  revalidateTag('posts')

  return Response.json({ revalidated: true })
}
```

#### 3. 多级缓存策略

```typescript
// app/dashboard/page.tsx
async function getDashboardData() {
  const [user, posts, stats] = await Promise.all([
    // 用户数据：长时间缓存
    fetch('https://api.example.com/user', {
      next: { revalidate: 86400, tags: ['user'] },
    }).then(r => r.json()),

    // 文章数据：中等时间缓存
    fetch('https://api.example.com/posts', {
      next: { revalidate: 3600, tags: ['posts'] },
    }).then(r => r.json()),

    // 统计数据：不缓存（实时）
    fetch('https://api.example.com/stats', {
      cache: 'no-store',
    }).then(r => r.json()),
  ])

  return { user, posts, stats }
}
```

### 完全路由缓存

#### 1. 路由缓存行为

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600

// 这个设置会影响：
// 1. 数据缓存（fetch响应）
// 2. 路由缓存（渲染的HTML）
// 3. 客户端缓存（访问过的页面）

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`, {
    next: { revalidate: 3600, tags: [`post-${params.slug}`] },
  }).then(r => r.json())

  return <article>{post.content}</article>
}
```

#### 2. 控制路由缓存

```typescript
// 强制静态生成
export const dynamic = 'force-static'
// 等同于 export const dynamicParams = false

// 强制动态渲染
export const dynamic = 'force-dynamic'
// 等同于 fetch(..., { cache: 'no-store' })

// 默认行为（动态，但可缓存）
export const dynamic = 'auto'
```

### 重新验证策略

#### 1. 时间基础的重新验证

```typescript
// app/products/page.tsx
// 整个路由每小时重新验证
export const revalidate = 3600

// 或者针对特定fetch
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 },
  })
  return res.json()
}
```

#### 2. 按需重新验证

**路径基础**：

```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const post = await db.post.create({
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    },
  })

  // 重新验证博客列表页
  revalidatePath('/blog')

  // 重新验证新创建的文章页
  revalidatePath(`/blog/${post.slug}`)

  // 重新验证博客首页
  revalidatePath('/')

  return post
}
```

**标签基础**：

```typescript
// app/actions.ts
'use server'

import { revalidateTag } from 'next/cache'

export async function updatePost(id: string, data: any) {
  const post = await db.post.update({
    where: { id },
    data,
  })

  // 重新验证所有带'posts'标签的缓存
  revalidateTag('posts')

  // 重新验证特定文章的缓存
  revalidateTag(`post-${post.slug}`)

  return post
}
```

**组合使用**：

```typescript
// app/actions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function publishPost(id: string) {
  const post = await db.post.update({
    where: { id },
    data: { published: true },
  })

  // 同时使用路径和标签重新验证
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  revalidateTag('posts')
  revalidateTag(`post-${post.slug}`)

  return post
}
```

### 实战案例：缓存优化应用

创建一个电商网站，展示各种缓存策略的实际应用。

#### 1. 产品页面（多级缓存）

```typescript
// app/products/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import AddToCartButton from '@/components/AddToCartButton'
import ProductReviews from '@/components/ProductReviews'

// 产品数据每小时重新验证
export const revalidate = 3600

// 生成静态参数（热门产品）
export async function generateStaticParams() {
  const products = await fetch(`${process.env.API_URL}/products/popular`, {
    next: { revalidate: 86400 },
  }).then(r => r.json())

  return products.map((product: any) => ({
    slug: product.slug,
  }))
}

// 生成元数据
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: '产品未找到',
    }
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.images[0]],
    },
  }
}

async function getProduct(slug: string) {
  const res = await fetch(`${process.env.API_URL}/products/${slug}`, {
    next: {
      revalidate: 3600,
      tags: ['products', `product-${slug}`],
    },
  })

  if (!res.ok) {
    return null
  }

  return res.json()
}

async function getProductReviews(productId: string) {
  const res = await fetch(`${process.env.API_URL}/products/${productId}/reviews`, {
    next: {
      revalidate: 1800, // 评论每30分钟重新验证
      tags: ['reviews', `reviews-${productId}`],
    },
  })

  return res.json()
}

async function getRelatedProducts(category: string) {
  const res = await fetch(
    `${process.env.API_URL}/products/related?category=${category}`,
    {
      next: {
        revalidate: 7200, // 相关产品每2小时重新验证
        tags: ['products', category],
      },
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

  const [reviews, relatedProducts] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product.category),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm">
        <ol className="flex items-center gap-2">
          <li><a href="/">首页</a></li>
          <li>/</li>
          <li><a href="/products">产品</a></li>
          <li>/</li>
          <li className="text-gray-600">{product.name}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image: string, i: number) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src={image} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="text-3xl font-bold text-blue-600 mb-6">
            ¥{product.price}
          </div>

          {/* Stock Status - 使用实时数据 */}
          <StockStatus productId={product.id} />

          <AddToCartButton productId={product.id} />
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews
        productId={product.id}
        initialReviews={reviews}
      />

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

// 实时库存状态组件（Client Component）
// components/StockStatus.tsx
'use client'

import { useEffect, useState } from 'react'

interface StockStatusProps {
  productId: string
}

export default function StockStatus({ productId }: StockStatusProps) {
  const [stock, setStock] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkStock() {
      try {
        const res = await fetch(`/api/products/${productId}/stock`, {
          cache: 'no-store', // 实时数据，不缓存
        })
        const data = await res.json()
        setStock(data.stock)
      } catch (error) {
        console.error('Failed to check stock:', error)
      } finally {
        setLoading(false)
      }
    }

    checkStock()

    // 每30秒更新一次库存
    const interval = setInterval(checkStock, 30000)

    return () => clearInterval(interval)
  }, [productId])

  if (loading) {
    return <div className="text-gray-600">检查库存中...</div>
  }

  if (stock === null) {
    return <div className="text-red-600">无法获取库存信息</div>
  }

  if (stock === 0) {
    return <div className="text-red-600 font-medium">暂时缺货</div>
  }

  if (stock < 10) {
    return (
      <div className="text-orange-600 font-medium">
        仅剩 {stock} 件
      </div>
    )
  }

  return (
    <div className="text-green-600 font-medium">
      现货充足 ({stock} 件)
    </div>
  )
}
```

#### 2. 购物车系统（按需重新验证）

```typescript
// app/actions/cart.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'

export async function addToCart(productId: string, quantity: number) {
  const session = await getServerSession()

  if (!session) {
    return { error: '请先登录' }
  }

  try {
    await db.cartItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: session.user.id,
        productId,
        quantity,
      },
    })

    // 重新验证购物车相关页面
    revalidatePath('/cart')
    revalidateTag('cart')

    return { success: true }
  } catch (error) {
    return { error: '添加到购物车失败' }
  }
}

export async function updateCartItem(itemId: string, quantity: number) {
  const session = await getServerSession()

  if (!session) {
    return { error: '请先登录' }
  }

  try {
    if (quantity === 0) {
      await db.cartItem.delete({
        where: { id: itemId },
      })
    } else {
      await db.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      })
    }

    revalidatePath('/cart')
    revalidateTag('cart')

    return { success: true }
  } catch (error) {
    return { error: '更新购物车失败' }
  }
}

export async function clearCart() {
  const session = await getServerSession()

  if (!session) {
    return { error: '请先登录' }
  }

  try {
    await db.cartItem.deleteMany({
      where: { userId: session.user.id },
    })

    revalidatePath('/cart')
    revalidateTag('cart')

    return { success: true }
  } catch (error) {
    return { error: '清空购物车失败' }
  }
}
```

#### 3. 缓存配置管理

```typescript
// lib/cache-config.ts
export const CACHE_CONFIG = {
  // 数据缓存时间（秒）
  DATA: {
    // 静态数据：1天
    STATIC: 86400,
    // 产品数据：1小时
    PRODUCTS: 3600,
    // 文章数据：30分钟
    POSTS: 1800,
    // 评论数据：15分钟
    COMMENTS: 900,
    // 实时数据：不缓存
    REALTIME: 0,
  },

  // 缓存标签
  TAGS: {
    PRODUCTS: 'products',
    POSTS: 'posts',
    COMMENTS: 'comments',
    CART: 'cart',
    USER: 'user',
  },
} as const

// 使用示例
// app/products/page.tsx
import { CACHE_CONFIG } from '@/lib/cache-config'

async function getProducts() {
  const res = await fetch(`${process.env.API_URL}/products`, {
    next: {
      revalidate: CACHE_CONFIG.DATA.PRODUCTS,
      tags: [CACHE_CONFIG.TAGS.PRODUCTS],
    },
  })

  return res.json()
}
```

### 缓存最佳实践

#### 1. 选择合适的缓存策略

```typescript
// ✅ 静态内容 - 长时间缓存
fetch('/api/about', { next: { revalidate: 86400 } })

// ✅ 产品内容 - 中等时间缓存
fetch('/api/products', { next: { revalidate: 3600 } })

// ✅ 用户内容 - 短时间缓存
fetch('/api/user/profile', { next: { revalidate: 300 } })

// ✅ 实时内容 - 不缓存
fetch('/api/stock', { cache: 'no-store' })
```

#### 2. 使用标签进行细粒度控制

```typescript
// ✅ 使用标签
fetch('/api/posts', { next: { tags: ['posts', 'blog'] } })

// 按需重新验证
revalidateTag('posts') // 只重新验证文章相关缓存

// ❌ 不推荐：重新验证整个路径
revalidatePath('/blog') // 可能重新验证不必要的缓存
```

#### 3. 避免过度缓存

```typescript
// ✅ 好：根据数据变化频率设置不同的缓存时间
const [user, posts, stats] = await Promise.all([
  fetch('/api/user', { next: { revalidate: 3600 } }), // 用户数据变化慢
  fetch('/api/posts', { next: { revalidate: 600 } }),  // 文章数据变化中等
  fetch('/api/stats', { cache: 'no-store' }),         // 统计数据实时变化
])

// ❌ 差：所有数据使用相同的缓存时间
const [user, posts, stats] = await Promise.all([
  fetch('/api/user', { cache: 'no-store' }),          // 不必要的实时获取
  fetch('/api/posts', { cache: 'no-store' }),         // 不必要的实时获取
  fetch('/api/stats', { cache: 'no-store' }),
])
```

### 性能监控

#### 1. 缓存命中率监控

```typescript
// lib/cache-monitor.ts
export class CacheMonitor {
  private static hits = new Map<string, number>()
  private static misses = new Map<string, number>()

  static recordHit(key: string) {
    this.hits.set(key, (this.hits.get(key) || 0) + 1)
  }

  static recordMiss(key: string) {
    this.misses.set(key, (this.misses.get(key) || 0) + 1)
  }

  static getStats(key: string) {
    const hits = this.hits.get(key) || 0
    const misses = this.misses.get(key) || 0
    const total = hits + misses
    const hitRate = total > 0 ? (hits / total) * 100 : 0

    return { hits, misses, total, hitRate }
  }

  static getAllStats() {
    const allKeys = new Set([
      ...this.hits.keys(),
      ...this.misses.keys(),
    ])

    return Array.from(allKeys).map(key => ({
      key,
      ...this.getStats(key),
    }))
  }
}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| 缓存机制 | 数据缓存、路由缓存 | 理解层次结构 |
| 数据缓存 | fetch选项、标签缓存 | 掌握配置方法 |
| 重新验证 | 时间基础、按需 | 能够灵活应用 |
| 最佳实践 | 缓存策略选择 | 能够优化性能 |
| 实战应用 | 电商缓存系统 | 能够独立开发 |

---

**恭喜你完成了Next.js核心章节的学习！** 建议继续学习[高级主题](#)深入掌握Next.js框架。
