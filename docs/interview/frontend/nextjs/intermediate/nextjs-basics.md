---
title: Next.js中级面试题
---

# Next.js中级面试题

> 基于字节跳动、腾讯、阿里等大厂2024-2026年面试真题整理

## Next.js核心概念

### 1. Next.js基础与渲染模式

#### 问题1：Next.js相比纯React应用的优势？

```typescript
// 纯React应用（SPA）的痛点

// 1. SEO问题
// 爬虫只能看到空div
const App = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }, []);

  return (
    <div>
      {data ? <h1>{data.title}</h1> : <div>Loading...</div>}
    </div>
  );
};
// 爬虫看到的是：<div>Loading...</div>

// 2. 首屏加载慢
// 需要加载JS -> 执行JS -> 请求数据 -> 渲染

// Next.js的解决方案

// 1. SSR（服务端渲染）
// 页面在服务器端渲染HTML，直接返回完整内容
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return {
    props: { data } // 传递给页面组件
  };
}

function Page({ data }) {
  return <h1>{data.title}</h1>;
}
// 爬虫看到的是：<h1>完整标题</h1>

// 2. SSG（静态站点生成）
// 构建时生成HTML，无需服务器
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return {
    props: { data },
    revalidate: 60 // ISR：每60秒重新生成
  };
}

// 3. 文件路由系统
// pages/index.tsx -> /
// pages/about.tsx -> /about
// pages/posts/[id].tsx -> /posts/123

// 4. API路由
// pages/api/hello.ts -> /api/hello
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from API' });
}

// Next.js vs 纯React对比
/*
特性           | 纯React | Next.js
---------------------------------
SEO            | ❌ 差   | ✅ 优秀
首屏加载        | ❌ 慢   | ✅ 快
路由            | 手动配置 | 文件路由
API            | 需后端  | 内置API路由
部署            | 需配置   | 一键部署
类型安全        | 需配置   | 内置TypeScript
*/
```

#### 问题2：SSR、SSG、ISR的区别？

```typescript
// SSR (Server-Side Rendering) - 服务端渲染
// 每次请求都在服务器端渲染

export async function getServerSideProps(context) {
  // 每次请求都会执行
  const data = await fetchData(context.params.id);

  return {
    props: { data }
  };
}

// 适用场景：
// - 数据实时性要求高
// - 用户个性化内容
// - 需要请求上下文（cookies、req等）

// SSG (Static Site Generation) - 静态站点生成
// 构建时生成HTML，部署后不再变化

export async function getStaticProps() {
  // 构建时执行一次
  const data = await fetch('https://api.example.com/posts')
    .then(res => res.json());

  return {
    props: { data },
    notFound: false, // 可选：返回404页面
    revalidate: 60   // 可选：开启ISR
  };
}

// 适用场景：
// - 数据不经常变化
// - 博客、文档、营销页面
// - 追求极致性能

// ISR (Incremental Static Regeneration) - 增量静态再生成
// 构建时生成HTML，后台定期更新

export async function getStaticProps() {
  const data = await fetch('https://api.example.com/posts')
    .then(res => res.json());

  return {
    props: { data },
    revalidate: 60 // 每60秒更新一次
  };
}

// 工作流程：
// 1. 用户访问页面 -> 返回缓存HTML
// 2. 后台检查是否超过60秒
// 3. 如果超过，重新生成HTML
// 4. 下次用户访问返回新HTML

// 适用场景：
// - 数据变化不频繁
// - 需要定期更新
// - 电商产品列表、新闻文章

// 选择指南

/*
实时性要求       | 推荐方案
-----------------------------
极高（股票、聊天） | CSR + SWR
高（用户数据）     | SSR
中（新闻、博客）   | ISR
低（文档、帮助）   | SSG
*/
```

### 2. Next.js App Router

#### 问题3：App Router vs Pages Router？

```typescript
// Pages Router (Next.js 12-)
// pages/index.tsx
export default function Home() {
  return <div>Hello World</div>;
}

export async function getServerSideProps() {
  const data = await fetch('https://api.example.com/data');
  return {
    props: { data }
  };
}

// App Router (Next.js 13+) - 推荐
// app/page.tsx
async function Home() {
  // 直接在组件中fetch
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();

  return <div>{json.message}</div>;
}

// 主要区别

// 1. 数据获取方式
/*
Pages Router:
  - 需要getServerSideProps/getStaticProps
  - 数据通过props传递
  - 需要额外的hook处理loading/error

App Router:
  - 直接在组件中async/await
  - 内置Suspense处理loading
  - 内置error.tsx处理错误
*/

// 2. 布局系统
// Pages Router
// pages/_app.tsx - 全局布局
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

// App Router
// app/layout.tsx - 根布局
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx - 嵌套布局
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}

// 3. 特殊文件
/*
Pages Router          | App Router
---------------------------------
_app.tsx            | layout.tsx
_document.tsx        | layout.tsx
_error.tsx           | error.tsx
404.tsx              | not-found.tsx
                    | loading.tsx
*/

// App Router的loading.tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>;
}

// app/dashboard/page.tsx
async function DashboardPage() {
  // 自动显示loading.tsx
  const data = await fetch('https://api.example.com/dashboard');
  const json = await data.json();

  return <div>{json.content}</div>;
}

// App Router的error.tsx
// app/dashboard/error.tsx
'use client'; // error组件必须是Client Component

export default function Error({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>出错了！</h2>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

### 3. Server Components vs Client Components

#### 问题4：Server Components和Client Components的区别？

```typescript
// ✅ Server Component（默认）
// app/products/page.tsx
// 在服务器端渲染，不发送JavaScript到客户端

async function ProductsPage() {
  // ✅ 可以直接访问数据库
  const products = await db.product.findMany();

  // ✅ 可以使用服务器端API
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache'
  }).then(r => r.json());

  // ❌ 不能使用hooks（useState、useEffect等）
  // ❌ 不能使用浏览器API（window、document等）

  return (
    <div>
      <h1>产品列表</h1>
      <ProductList products={products} />
    </div>
  );
}

// ✅ Client Component（需要'use client'指令）
// app/components/AddToCart.tsx
'use client';

import { useState } from 'react';

function AddToButton({ productId }: { productId: string }) {
  // ✅ 可以使用hooks
  const [count, setCount] = useState(0);

  // ✅ 可以使用浏览器API
  const handleClick = () => {
    window.alert('已添加到购物车');
    setCount(count + 1);
  };

  return (
    <button onClick={handleClick}>
      添加到购物车 ({count})
    </button>
  );
}

// 什么时候用哪个？

// ✅ Server Component
// - 获取数据
// - 访问后端资源（数据库、文件系统）
// - 保存敏感信息（API密钥）
// - 减少客户端JavaScript
// - 提升首屏加载速度

// ✅ Client Component
// - 需要用户交互（点击、输入等）
// - 使用浏览器API（window、localStorage等）
// - 使用React hooks（useState、useEffect等）
// - 使用第三方库（需要window的库）
// - 需要实时数据更新

// 混合使用示例
// app/products/page.tsx (Server Component)
import AddToCart from './components/AddToCart';

async function ProductsPage() {
  const products = await db.product.findMany();

  return (
    <div>
      <h1>产品列表</h1>
      {products.map(product => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          {/* 需要交互的部分使用Client Component */}
          <AddToCart productId={product.id} />
        </div>
      ))}
    </div>
  );
}
```

### 4. Next.js路由系统

#### 问题5：动态路由和路由参数？

```typescript
// 1. 动态路由
// app/posts/[id]/page.tsx
export default function PostPage({ params }: {
  params: { id: string }
}) {
  return <div>Post ID: {params.id}</div>;
}

// /posts/123 -> { id: '123' }
// /posts/abc -> { id: 'abc' }

// 2. 捕获所有路由
// app/[...slug]/page.tsx
export default function CatchAllPage({ params }: {
  params: { slug: string[] }
}) {
  return <div>Slug: {params.join('/')}</div>;
}

// /a -> { slug: ['a'] }
// /a/b -> { slug: ['a', 'b'] }
// /a/b/c -> { slug: ['a', 'b', 'c'] }

// 3. 路由组（组织路由，不影响URL）
// app/(marketing)/about/page.tsx -> /about
// app/(marketing)/contact/page.tsx -> /contact
// app/(dashboard)/settings/page.tsx -> /settings

// 4. 平行路由（同时渲染多个页面）
// app/@team/settings/page.tsx
// app/@user/analytics/page.tsx

// 5. 路由拦截
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 拦截特定路由
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // 检查认证
    const token = request.cookies.get('token');

    if (!token) {
      // 重定向到登录页
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// 6. 路由Handler（API路由）
// app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ message: 'Hello' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

### 5. Next.js性能优化

#### 问题6：Next.js有哪些性能优化策略？

```typescript
// 1. 图片优化
import Image from 'next/image';

function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={500}
      height={300}
      placeholder="blur" // 模糊占位
      loading="lazy" // 懒加载
    />
  );
}

// 自动优化：
// - WebP/AVIF格式
// - 响应式图片
// - 懒加载
// - 防止布局偏移

// 2. 字体优化
// app/layout.tsx
import { Inter } from 'next/font/google';
import { localFont } from 'next/font/local';

// Google字体优化
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

// 本地字体
const myFont = localFont({
  src: './fonts/MyFont.woff2',
  display: 'swap',
  variable: '--font-my-font'
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

// 3. 脚本优化
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}

        {/* 策略：afterInteractive - 页面可交互时加载 */}
        <Script
          src="https://cdn.example.com/analytics.js"
          strategy="afterInteractive"
        />

        {/* 策略：lazyOnload - 空闲时加载 */}
        <Script
          src="https://cdn.example.com/chat.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

// 4. 预取和预加载
import Link from 'next/link';

function Navigation() {
  return (
    <nav>
      {/* 预取：鼠标悬停时预取页面 */}
      <Link
        href="/dashboard"
        prefetch={true} // 默认开启
      >
        Dashboard
      </Link>

      {/* 预加载：立即预取 */}
      <Link
        href="/important"
        prefetch={true}
      >
        Important Page
      </Link>
    </nav>
  );
}

// 5. 数据缓存策略
// app/page.tsx
async function Page() {
  // 静态数据请求：默认缓存
  const staticData = await fetch('https://api.example.com/static', {
    cache: 'force-cache' // 强制缓存
  });

  // 动态数据请求：每次都请求
  const dynamicData = await fetch('https://api.example.com/dynamic', {
    cache: 'no-store' // 不缓存
  });

  // 重新验证：定期更新
  const revalidatedData = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 } // 每60秒更新
  });

  // 按需重新验证：标签化重新验证
  const taggedData = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] } // 可以通过revalidateTag()触发更新
  });

  return <div>Page Content</div>;
}

// 6. 流式渲染（Streaming）
// app/page.tsx
import { Suspense } from 'react';

async function SlowComponent() {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return <div>Slow Content</div>;
}

export default function Page() {
  return (
    <div>
      <h1>Fast Content</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}
// 用户先看到Fast Content，然后SlowComponent逐步加载
```

### 6. Next.js部署

```typescript
// 部署到Vercel（推荐）

// 1. 安装Vercel CLI
// npm i -g vercel

// 2. 部署
// vercel

// 3. 配置vercel.json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["hkg1"], // 香港数据中心
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}

// 部署到Node.js服务器
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // 生成独立构建
};

module.exports = nextConfig;

// 构建后
// next build

// 启动服务器
// node server.js

// 部署到Docker
// Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 7. Next.js常见面试题总结

**Q: Next.js的优势是什么？**
- SEO友好
- 首屏加载快
- 文件路由
- API路由
- 自动代码分割
- 内置图片优化
- 零配置部署

**Q: 何时使用SSR、SSG、ISR？**
- SSR：数据实时、个性化内容
- SSG：数据不变化、文档博客
- ISR：数据变化不频繁、定期更新

**Q: Server Components有什么好处？**
- 减少客户端JavaScript
- 更好的SEO
- 更快的首屏加载
- 服务器端数据处理更安全

---

**参考资源：**

- [大厂前端架构师岗位Next.js面试题全面解析](https://blog.csdn.net/HappyAcmen/article/details/148339753)
- [2025最好的Next.js面试题](https://segmentfault.com/a/1190000046568792)
- [Next.js全栈开发学习路线](https://www.codefather.cn/course/1789189862986850306/section/1990754280717463553)

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
