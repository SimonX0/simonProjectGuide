---
title: Next.js 企业级实战项目
description: 从零构建一个完整的 Next.js 全栈应用
---

# ：Next.js 15 完全实战项目 - AI内容生成平台

> **项目概述**：本项目是一个基于 Next.js 15 的 AI 内容生成平台，集成了 OpenAI API、Claude API，实现文章生成、图像生成、代码优化等功能。
>
> **学习目标**：
> - 掌握 Next.js 15 App Router 的企业级应用开发
> - 熟练使用 Server Actions、Server Components
> - 掌握流式响应、实时通信等高级特性
> - 学会 AI API 集成、内容管理系统构建

---

## 项目介绍

### 项目背景

本 AI 内容生成平台是一个现代化的 SaaS 应用，主要功能包括：

- ✅ **AI 文章生成**：支持多种风格、长文本生成
- ✅ **AI 图像生成**：集成 DALL-E、Stable Diffusion
- ✅ **代码优化**：AI 辅助代码重构、优化建议
- ✅ **流式响应**：实时的打字机效果
- ✅ **内容管理**：历史记录、收藏、导出
- ✅ **用户系统**：订阅、额度管理、支付集成

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **框架** | Next.js | 15.x |
| **语言** | TypeScript | 5.x |
| **UI库** | shadcn/ui | latest |
| **样式** | Tailwind CSS | 3.x |
| **数据库** | PostgreSQL + Prisma | latest |
| **认证** | NextAuth.js | 5.x |
| **AI SDK** | Vercel AI SDK | latest |
| **支付** | Stripe | latest |
| **存储** | Vercel Blob | latest |
| **队列** | Bull + Redis | latest |

### 项目结构

```
nextjs-ai-platform/
├── app/                          # App Router
│   ├── (auth)/                   # 认证相关路由组
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # 仪表盘路由组
│   │   ├── dashboard/
│   │   ├── generate/
│   │   ├── history/
│   │   └── layout.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── generate/
│   │   └── webhook/
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # 组件
│   ├── ui/                       # shadcn/ui 组件
│   ├── generators/               # 生成器组件
│   ├── chat/                     # 聊天组件
│   └── charts/                   # 图表组件
├── lib/                          # 工具库
│   ├── ai/                       # AI SDK 配置
│   ├── db/                       # Prisma 客户端
│   ├── auth.ts                   # NextAuth 配置
│   ├── utils.ts
│   └── validators.ts
├── prisma/                       # 数据库
│   ├── schema.prisma
│   └── seed.ts
├── hooks/                        # 自定义 Hooks
├── stores/                       # 状态管理
├── types/                        # TypeScript 类型
├── actions/                      # Server Actions
├── jobs/                         # 后台任务
└── middleware.ts
```

---

## 项目搭建

### 1. 项目初始化

```bash
# 创建 Next.js 15 项目
npx create-next-app@latest nextjs-ai-platform --typescript --tailwind --app
cd nextjs-ai-platform

# 安装依赖
npm install ai openai @anthropic-ai/sdk
npm install next-auth@beta
npm install @prisma/client
npm install stripe
npm install bull ioredis
npm install lucide-react
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge

# 安装 shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input textarea select

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
      { hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
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

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
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
  password      String?
  accounts      Account[]
  sessions      Session[]
  credits       Int       @default(100)
  subscription  Subscription?
  generations   Generation[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Subscription {
  id                 String   @id @default(cuid())
  userId             String   @unique
  status             String   @default("active")
  priceId            String
  currentPeriodEnd   DateTime
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model Generation {
  id          String   @id @default(cuid())
  userId      String
  type        String   // text, image, code
  prompt      String   @db.Text
  content     String?  @db.Text
  imageUrl    String?
  model       String
  tokens      Int      @default(0)
  cost        Float    @default(0)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}
```

---

## 核心功能实现

### 1. AI SDK 集成

```typescript
// lib/ai/openai.ts
import { OpenAI } from 'ai/openai'
import { Anthropic } from '@anthropic-ai/sdk'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateText(prompt: string, model = 'gpt-4') {
  if (model.startsWith('claude')) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })
    return response.content[0].text
  }

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  })

  return response
}

export async function generateImage(prompt: string) {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
  })

  return response.data[0].url
}
```

### 2. Server Actions

```typescript
// app/actions/generations.ts
'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateText, generateImage } from '@/lib/ai/openai'
import { creditsDeduct } from '@/lib/utils'

export async function createTextGeneration(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const prompt = formData.get('prompt') as string
  const model = formData.get('model') as string

  // 检查额度
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || user.credits < 10) {
    return { error: 'Insufficient credits' }
  }

  try {
    const content = await generateText(prompt, model)

    // 保存生成记录
    const generation = await prisma.generation.create({
      data: {
        userId: session.user.id,
        type: 'text',
        prompt,
        content,
        model,
        tokens: content.length,
        cost: creditsDeduct(content.length),
      },
    })

    // 扣除额度
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 10 } },
    })

    revalidatePath('/dashboard/history')
    return { success: true, data: generation }
  } catch (error) {
    return { error: 'Generation failed' }
  }
}
```

### 3. 流式响应

```typescript
// app/api/generate/text/route.ts
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { prompt, model } = await req.json()

  const result = streamText({
    model: openai(model),
    prompt,
    onFinish: async (response) => {
      // 保存到数据库
      await prisma.generation.create({
        data: {
          userId: session.user.id,
          type: 'text',
          prompt,
          content: response.text,
          model,
          tokens: response.usage.totalTokens,
        },
      })
    },
  })

  return result.toDataStreamResponse()
}
```

### 4. 客户端组件

```tsx
// components/generators/text-generator.tsx
'use client'

import { useState } from 'react'
import { useCompletion } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function TextGenerator() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('gpt-4')

  const {
    completion,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
  } = useCompletion({
    api: '/api/generate/text',
    body: { model },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="claude-3-opus">Claude 3 Opus</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的需求..."
          rows={4}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '生成中...' : '生成'}
        </Button>
      </form>

      {error && (
        <div className="text-red-500">{error.message}</div>
      )}

      {completion && (
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">生成结果：</h3>
          <div className="whitespace-pre-wrap">{completion}</div>
        </div>
      )}
    </div>
  )
}
```

### 5. 图像生成组件

```tsx
// components/generators/image-generator.tsx
'use client'

import { useState } from 'react'
import { createImageGeneration } from '@/app/actions/generations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('prompt', prompt)

    const result = await createImageGeneration(formData)

    if (result.success) {
      setImageUrl(result.data.imageUrl)
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="描述你想生成的图像..."
      />

      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? '生成中...' : '生成图像'}
      </Button>

      {imageUrl && (
        <div className="border rounded p-4">
          <img src={imageUrl} alt={prompt} className="w-full" />
        </div>
      )}
    </div>
  )
}
```

---

## 高级特性

### 1. 认证系统

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import Credentials from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'
import { verifyPassword } from '@/lib/utils'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      authorize: async (credentials) => {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          throw new Error('User not found')
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          throw new Error('Invalid password')
        }

        return user
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub!
      return session
    },
  },
})
```

### 2. 订阅与支付

```typescript
// app/api/stripe/checkout/route.ts
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { priceId } = await req.json()

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
    customer_email: session.user.email!,
    metadata: {
      userId: session.user.id,
    },
  })

  return Response.json({ sessionId: checkoutSession.id })
}

// Webhook 处理
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new Response('Webhook error', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId

    await prisma.subscription.create({
      data: {
        userId,
        status: 'active',
        priceId: session.display_items![0].price.id,
        currentPeriodEnd: new Date(session.expires_at! * 1000),
      },
    })
  }

  return new Response(null, { status: 200 })
}
```

### 3. 后台任务队列

```typescript
// jobs/image-processor.ts
import Queue from 'bull'
import { prisma } from '@/lib/db'

const imageQueue = new Queue('image-processing', {
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
})

imageQueue.process(async (job) => {
  const { generationId } = job.data

  // 处理图像
  const generation = await prisma.generation.findUnique({
    where: { id: generationId },
  })

  // 优化、压缩、添加水印等
  // ...

  await prisma.generation.update({
    where: { id: generationId },
    data: { status: 'completed' },
  })
})

export { imageQueue }
```

---

## 性能优化

### 1. 缓存策略

```typescript
// app/api/generate/text/route.ts
import { unstable_cache } from 'next/cache'

const getCachedResponse = unstable_cache(
  async (prompt: string) => {
    return await prisma.generation.findFirst({
      where: { prompt },
      orderBy: { createdAt: 'desc' },
    })
  },
  ['generation-cache'],
  { revalidate: 3600 }
)
```

### 2. 增量静态再生

```typescript
// app/pricing/page.tsx
export const revalidate = 3600 // 1 hour

export async function generateStaticParams() {
  const plans = await prisma.plan.findMany()
  return plans.map((plan) => ({ id: plan.id }))
}
```

### 3. 流式响应优化

```typescript
// 使用 Vercel AI SDK 的流式处理
import { streamText } from 'ai'

const result = await streamText({
  model: openai('gpt-4'),
  prompt,
  temperature: 0.7,
  maxTokens: 4096,
  onFinish: async (completion) => {
    // 异步保存结果
  },
})
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

### 2. 环境变量配置

```bash
# .env.local
DATABASE_URL=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GITHUB_ID=
GITHUB_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
REDIS_HOST=
REDIS_PORT=
```

### 3. Docker 部署

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## 项目总结

本项目涵盖了 Next.js 15 企业级开发的核心知识点：

✅ **技术栈**：Next.js 15 + TypeScript + Tailwind CSS + Prisma + NextAuth
✅ **功能模块**：AI 文本生成、图像生成、订阅系统、支付集成
✅ **高级特性**：Server Actions、流式响应、实时通信、后台任务
✅ **最佳实践**：App Router、服务端组件、性能优化、部署方案

通过这个项目，你将掌握：
- Next.js 15 App Router 的完整开发流程
- Vercel AI SDK 的使用方法
- Server Actions 和 Server Components 的最佳实践
- 流式响应和实时交互的实现
- 订阅系统和支付集成的完整方案
- 企业级应用的部署和运维

---

## 下一步学习

建议继续学习以下内容：

- [第27章：Next.js 15新特性](/guide/nextjs/chapter-107)
- [第28章：全栈开发实战](/guide/nextjs/chapter-108)
- [第29章：部署与运维](/guide/nextjs/chapter-109)
- [React 19+ 与 Next.js 15 面试题](/interview/frontend/advanced/chapter-15)
