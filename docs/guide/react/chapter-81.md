---
title: React 企业级实战项目2
description: React 19 + Next.js 15 全栈电商平台
---

# ：React 19 + Next.js 15 完全实战项目 - 现代化电商平台

> **项目概述**：本项目是一个基于 React 19 和 Next.js 15 的现代化电商平台，包含商品管理、购物车、支付集成、订单系统等完整功能。
>
> **学习目标**：
> - 掌握 React 19 新特性（Actions、useOptimistic）的实际应用
> - 熟练使用 Next.js 15 App Router 和 Server Components
> - 掌握支付集成、状态管理、性能优化
> - 学会电商业务的完整解决方案

---

## 项目介绍

### 项目背景

本电商平台是一个功能完整的 B2C 在线购物系统，主要功能包括：

- ✅ **商品展示**：商品列表、详情、搜索、筛选、排序
- ✅ **购物车**：添加、删除、数量修改、本地持久化
- ✅ **支付集成**：Stripe 支付、多种支付方式
- ✅ **订单系统**：订单创建、状态跟踪、历史记录
- ✅ **用户中心**：个人信息、地址管理、收藏夹
- ✅ **后台管理**：商品管理、订单管理、数据统计
- ✅ **性能优化**：图片优化、懒加载、缓存策略

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **框架** | React | 19.x |
| **框架** | Next.js | 15.x |
| **语言** | TypeScript | 5.x |
| **状态管理** | Zustand | 5.x |
| **数据获取** | TanStack Query | 5.x |
| **表单** | React Hook Form | 7.x |
| **UI库** | shadcn/ui | latest |
| **样式** | Tailwind CSS | 3.x |
| **支付** | Stripe | latest |
| **数据库** | PostgreSQL + Prisma | latest |
| **认证** | NextAuth.js | 5.x |
| **图像** | Next/Image | built-in |
| **测试** | Vitest + Testing Library | latest |

### 项目结构

```
react-nextjs-ecommerce/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证路由组
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (shop)/                   # 商店路由组
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── layout.tsx
│   ├── (account)/                # 账户路由组
│   │   ├── orders/
│   │   ├── profile/
│   │   └── layout.tsx
│   ├── (admin)/                  # 管理后台路由组
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   └── layout.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── checkout/
│   │   └── webhook/
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 组件
│   ├── shop/                     # 商店组件
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   ├── CartItem.tsx
│   │   └── CheckoutForm.tsx
│   ├── admin/                    # 管理组件
│   └── shared/                   # 共享组件
├── lib/                          # 工具库
│   ├── db/                       # Prisma 客户端
│   ├── auth.ts                   # NextAuth 配置
│   ├── stripe.ts                 # Stripe 配置
│   ├── utils.ts
│   └── validators.ts
├── hooks/                        # 自定义 Hooks
├── stores/                       # Zustand 状态管理
├── types/                        # TypeScript 类型
├── actions/                      # Server Actions
└── prisma/                       # 数据库
    └── schema.prisma
```

---

## 项目搭建

### 1. 项目初始化

```bash
# 创建 Next.js 15 项目
npx create-next-app@latest ecommerce --typescript --tailwind --app
cd ecommerce

# 安装核心依赖
npm install react@19 react-dom@19
npm install zustand @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install stripe @stripe/stripe-js
npm install next-auth@beta
npm install @prisma/client
npm install date-fns

# 安装 shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select dialog sheet

# 初始化 Prisma
npx prisma init
```

### 2. 配置文件

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'files.stripe.com' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
```

---

## 数据库设计

### 1. Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(CUSTOMER)
  addresses     Address[]
  orders        Order[]
  reviews       Review[]
  cart          Cart?
  wishlist      Wishlist[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  CUSTOMER
  ADMIN
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  compareAtPrice Decimal? @db.Decimal(10, 2)
  images      String[]
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String
  inventory   Int      @default(0)
  sold        Int      @default(0)
  rating      Decimal  @default(0) @db.Decimal(3, 2)
  reviews     Review[]
  cartItems   CartItem[]
  orderItems  OrderItem[]
  featured    Boolean  @default(false)
  status      ProductStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
  @@index([status])
}

enum ProductStatus {
  ACTIVE
  OUT_OF_STOCK
  DISCONTINUED
}

model Category {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique
  products  Product[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([cartId, productId])
}

model Order {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]
  shippingAddress Address
  subtotal        Decimal     @db.Decimal(10, 2)
  shipping        Decimal     @db.Decimal(10, 2)
  tax             Decimal     @db.Decimal(10, 2)
  total           Decimal     @db.Decimal(10, 2)
  status          OrderStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  paymentId       String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([userId])
  @@index([status])
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())
}

model Address {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName    String
  phone       String
  street      String
  city        String
  state       String
  zipCode     String
  country     String   @default("US")
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, productId])
  @@index([productId])
}

model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}
```

---

## 核心功能实现

### 1. Zustand 状态管理

```typescript
// stores/cart-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const items = get().items
        const existing = items.find((i) => i.id === item.id)

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          })
        }
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

### 2. 商品列表组件

```tsx
// components/shop/ProductList.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { ProductCard } from './ProductCard'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  category: {
    name: string
  }
}

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
}

export function ProductList() {
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<string>('')
  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ['products', page, category, search],
    queryFn: () =>
      fetch(
        `/api/products?page=${page}&category=${category}&search=${search}`
      ).then((res) => res.json()),
  })

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 搜索和筛选 */}
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="搜索商品..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">所有分类</option>
          <option value="electronics">电子产品</option>
          <option value="clothing">服装</option>
          <option value="books">图书</option>
        </select>
      </div>

      {/* 商品网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 分页 */}
      <div className="mt-8 flex justify-center gap-2">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          上一页
        </Button>
        <span className="py-2">第 {page} 页</span>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={!data || data.products.length === 0}
        >
          下一页
        </Button>
      </div>
    </div>
  )
}
```

### 3. 购物车组件（使用 React 19 Actions）

```tsx
// components/shop/CartSheet.tsx
'use client'

import { useCartStore } from '@/stores/cart-store'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function CartSheet() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, total } = useCartStore()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleCheckout = () => {
    startTransition(() => {
      router.push('/checkout')
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>购物车 ({items.length})</SheetTitle>
        </SheetHeader>

        <div className="mt-8 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-center text-gray-500">购物车是空的</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">${item.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-500 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>总计：</span>
              <span>${total().toFixed(2)}</span>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={isPending}
              className="w-full"
            >
              {isPending ? '处理中...' : '去结算'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
```

### 4. Server Actions - 支付处理

```typescript
// app/actions/checkout.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'

export async function createCheckoutSession(items: CartItem[]) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // 创建 Stripe Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
    customer_email: session.user.email!,
    metadata: {
      userId: session.user.id,
      items: JSON.stringify(items),
    },
  })

  return { sessionId: checkoutSession.id }
}

export async function createOrder(sessionId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // 获取 Stripe Session
  const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
  const items = JSON.parse(stripeSession.metadata!.items)

  // 创建订单
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      items: {
        create: items.map((item: CartItem) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      subtotal: parseFloat(stripeSession.amount_subtotal!) / 100,
      shipping: 0,
      tax: parseFloat(stripeSession.total_details!.amount_tax!) / 100,
      total: parseFloat(stripeSession.amount_total!) / 100,
      status: 'PROCESSING',
      paymentStatus: 'COMPLETED',
      paymentId: sessionId,
    },
  })

  // 更新库存
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.id },
      data: {
        inventory: { decrement: item.quantity },
        sold: { increment: item.quantity },
      },
    })
  }

  // 清空购物车
  const { clearCart } = await import('@/stores/cart-store')
  clearCart()

  revalidatePath('/orders')
  revalidatePath('/cart')

  return order
}
```

### 5. 商品卡片组件

```tsx
// components/shop/ProductCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    compareAtPrice?: number
    images: string[]
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    })
  }

  return (
    <div className="group relative">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          {product.compareAtPrice && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
              特价
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsWishlisted(!isWishlisted)
            }}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>
      </Link>

      <Link href={`/products/${product.id}`}>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
      </Link>

      <div className="flex items-center gap-2 mt-2">
        <span className="text-lg font-bold text-gray-900">
          ${product.price.toFixed(2)}
        </span>
        {product.compareAtPrice && (
          <span className="text-sm text-gray-500 line-through">
            ${product.compareAtPrice.toFixed(2)}
          </span>
        )}
      </div>

      <Button
        onClick={handleAddToCart}
        className="w-full mt-4"
        size="sm"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        加入购物车
      </Button>
    </div>
  )
}
```

---

## 高级特性

### 1. 图片优化

```tsx
// 使用 Next.js Image 组件
import Image from 'next/image'

<Image
  src={product.images[0]}
  alt={product.name}
  width={400}
  height={400}
  priority={index < 4} // 首屏图片优先加载
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 2. 乐观更新（useOptimistic）

```tsx
// components/shop/QuantitySelector.tsx
'use client'

import { useOptimistic, useTransition } from 'react'

interface QuantitySelectorProps {
  productId: string
  initialQuantity: number
  onUpdate: (id: string, quantity: number) => Promise<void>
}

export function QuantitySelector({
  productId,
  initialQuantity,
  onUpdate,
}: QuantitySelectorProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(
    initialQuantity,
    (state, newQuantity: number) => newQuantity
  )

  const updateQuantity = (quantity: number) => {
    setOptimisticQuantity(quantity)
    startTransition(() => onUpdate(productId, quantity))
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => updateQuantity(optimisticQuantity - 1)}
        disabled={isPending || optimisticQuantity <= 1}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span>{optimisticQuantity}</span>
      <button
        onClick={() => updateQuantity(optimisticQuantity + 1)}
        disabled={isPending}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}
```

### 3. 服务端组件优化

```tsx
// app/products/page.tsx
import { prisma } from '@/lib/db'
import { ProductList } from '@/components/shop/ProductList'

// 每小时重新生成
export const revalidate = 3600

async function getProducts() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return products
}

export default async function ProductsPage() {
  // 服务端预取数据
  const products = await getProducts()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">所有商品</h1>
      <ProductList initialProducts={products} />
    </div>
  )
}
```

---

## 支付集成

### 1. Stripe 配置

```typescript
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export function getStripeProducts() {
  return stripe.products.list({
    expand: ['data.default_price'],
  })
}
```

### 2. Webhook 处理

```typescript
// app/api/webhook/stripe/route.ts
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    return new Response('Webhook error', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutComplete(session)
      break
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSucceeded(paymentIntent)
      break
  }

  return new Response(null, { status: 200 })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId

  if (userId) {
    await prisma.order.update({
      where: { paymentId: session.payment_intent as string },
      data: { status: 'PROCESSING' },
    })
  }
}
```

---

## 性能优化

### 1. 代码分割

```tsx
// 懒加载非关键组件
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  loading: () => <div>加载中...</div>,
  ssr: false,
})
```

### 2. TanStack Query 配置

```typescript
// providers/query-client-provider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 分钟
            gcTime: 5 * 60 * 1000, // 5 分钟
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 3. 缓存策略

```typescript
// app/api/products/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get('page') || '1'

  const cacheKey = `products:page:${page}`

  // 检查 Redis 缓存
  const cached = await redis.get(cacheKey)
  if (cached) {
    return Response.json(JSON.parse(cached))
  }

  const products = await prisma.product.findMany({
    skip: (parseInt(page) - 1) * 20,
    take: 20,
  })

  // 缓存 1 小时
  await redis.setex(cacheKey, 3600, JSON.stringify(products))

  return Response.json(products)
}
```

---

## 部署上线

### 1. Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 2. 环境变量

```bash
# .env.local
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
REDIS_URL=
```

---

## 项目总结

本项目涵盖了 React 19 + Next.js 15 电商开发的完整技能栈：

✅ **技术栈**：React 19 + Next.js 15 + TypeScript + Zustand + TanStack Query
✅ **功能模块**：商品展示、购物车、支付集成、订单系统
✅ **高级特性**：React 19 Actions、乐观更新、服务端组件
✅ **最佳实践**：性能优化、状态管理、支付流程

通过这个项目，你将掌握：
- React 19 新特性的实际应用
- Next.js 15 App Router 的完整开发流程
- Zustand 状态管理的最佳实践
- Stripe 支付集成的完整方案
- 电商业务的完整解决方案
- 性能优化和部署策略

---

## 下一步学习

建议继续学习以下内容：

- [React 19 新特性概览](/guide/react/chapter-73)
- [Actions与useActionState](/guide/react/chapter-74)
- [React 19性能优化](/guide/react/chapter-76)
- [React性能优化完全指南](/guide/react/chapter-77)
