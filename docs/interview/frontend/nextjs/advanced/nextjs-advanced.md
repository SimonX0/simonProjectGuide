---
title: Next.js高级进阶面试题
---

# Next.js高级进阶面试题

## Next.js App Router深入

### App Router与Pages Router区别？

```typescript
// Pages Router (Next.js 12-)
// pages/index.tsx
export default function Home() {
  return <div>Hello</div>;
}

export async function getServerSideProps() {
  // 服务端执行
  const data = await fetch('https://api.example.com/data');
  return {
    props: { data }
  };
}

// App Router (Next.js 13+)
// app/page.tsx
async function Home() {
  // 直接在组件中获取数据
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();

  return <div>{json.message}</div>;
}

// 主要区别

// 1. 文件结构
// Pages Router:
// - pages/index.js
// - pages/about.js
// - pages/blog/[id].js

// App Router:
// - app/page.js
// - app/about/page.js
// - app/blog/[id]/page.js

// 2. 布局
// Pages Router:
// - 使用_app.js包裹所有页面
// - 需要手动维护

// App Router:
// - app/layout.js自动应用到所有子页面
// - 支持嵌套布局
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <Sidebar />
      {children}
    </div>
  );
}

// 3. 数据获取
// Pages Router: 需要getServerSideProps/getStaticProps
// App Router: 直接在组件中async/await

// 4. Streaming
// App Router支持流式渲染
app/page.tsx
import { Suspense } from 'react';

async function SlowComponent() {
  await delay(3000);
  return <div>This took 3 seconds</div>;
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
```

### Server Components深入理解？

```typescript
// Server Component vs Client Component

// 1. Server Component (默认)
// app/users/page.tsx
async function UsersPage() {
  // ✅ 可以在服务器执行
  const db = await connectDatabase();
  const users = await db.users.findMany();

  // ✅ 可以使用服务器API
  const data = await fs.readFile('./data.json');

  // ❌ 不能使用hooks
  // const [state, setState] = useState(); // Error!

  // ❌ 不能使用事件处理器
  // onClick={() => {}} // Error!

  return (
    <div>
      <h1>Users</h1>
      <UserList users={users} />
    </div>
  );
}

// 2. Client Component
// app/users/UserList.tsx
'use client';

import { useState } from 'react';

export function UserList({ users }) {
  // ✅ 可以使用hooks
  const [filter, setFilter] = useState('');

  // ✅ 可以使用事件处理器
  const handleClick = () => {
    alert('Clicked!');
  };

  const filtered = users.filter(user =>
    user.name.includes(filter)
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul>
        {filtered.map(user => (
          <li key={user.id} onClick={handleClick}>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 3. 互操作规则
// ✅ Server Component可以导入Client Component
import { InteractiveButton } from './InteractiveButton'; // Client

export default function Page() {
  return <InteractiveButton />;
}

// ❌ Client Component不能导入Server Component
// 除非作为children传递
'use client';

import { ServerComponent } from './ServerComponent'; // Error!

export default function ClientComponent() {
  return <ServerComponent />; // Error!
}

// ✅ 正确：通过props传递
'use client';

export default function ClientComponent({ children }) {
  return <div>{children}</div>;
}

// app/page.tsx
import ClientComponent from './ClientComponent';
import ServerComponent from './ServerComponent';

export default function Page() {
  return (
    <ClientComponent>
      <ServerComponent />
    </ClientComponent>
  );
}

// 4. 最佳实践
// 将交互部分提取为Client Component
// app/page.tsx
import { LoginForm } from './LoginForm'; // 'use client'

export default function Page() {
  return (
    <div>
      <h1>Welcome</h1>
      <LoginForm />
    </div>
  );
}
```

## Next.js Server Actions

### Server Actions深入使用？

```typescript
// 1. 定义Server Actions
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string;

  // 直接操作数据库
  const todo = await db.todo.create({
    data: { title }
  });

  // 重新验证缓存
  revalidatePath('/todos');

  // 或者重定向
  redirect('/todos');

  return { success: true, todo };
}

// 2. 在表单中使用
// app/todos/page.tsx
import { createTodo } from '../actions';

export default function TodosPage() {
  return (
    <form action={createTodo}>
      <input name="title" type="text" required />
      <button type="submit">Add Todo</button>
    </form>
  );
}

// 3. 带验证的Server Action
// app/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional()
});

export async function createTodo(formData: FormData) {
  // 验证
  const validatedFields = todoSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description')
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors
    };
  }

  const { title, description } = validatedFields.data;

  // 创建Todo
  const todo = await db.todo.create({
    data: { title, description }
  });

  revalidatePath('/todos');

  return { success: true, todo };
}

// 4. 乐观更新
// app/todos/TodoForm.tsx
'use client';

import { useActionState } from 'react';
import { createTodo } from '../actions';

export function TodoForm() {
  const [state, formAction, isPending] = useActionState(createTodo, null);

  return (
    <form action={formAction}>
      <input name="title" type="text" />
      {state?.errors?.title && (
        <span>{state.errors.title[0]}</span>
      )}
      <button disabled={isPending}>
        {isPending ? 'Adding...' : 'Add Todo'}
      </button>
    </form>
  );
}

// 5. 带加载状态的Action
'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

export function TodoForm({ action }) {
  return (
    <form action={action}>
      <input name="title" />
      <SubmitButton />
    </form>
  );
}

// 6. 重验证策略
// actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateTodo(id: number, data: any) {
  await db.todo.update({ where: { id }, data });

  // 方式1：重新验证特定路径
  revalidatePath('/todos');
  revalidatePath(`/todos/${id}`);

  // 方式2：按标签重新验证
  revalidateTag('todos');
}

// app/todos/page.tsx
export const revalidate = 60; // 每60秒重新验证
export const fetchCache = 'force-no-store'; // 禁用缓存

export default async function TodosPage() {
  const todos = await fetch('https://api.example.com/todos', {
    next: {
      tags: ['todos'], // 添加标签
      revalidate: 60
    }
  }).then(r => r.json());

  return <TodoList todos={todos} />;
}
```

## Next.js数据获取与缓存

### Next.js缓存策略详解？

```typescript
// 1. 默认缓存（fetch）
// app/page.tsx
async function Page() {
  // 默认缓存：会被缓存和重新验证
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();

  return <div>{json.message}</div>;
}

// 2. 禁用缓存
async function Page() {
  // no-store：每次请求都获取新数据
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  });

  return <div>{data.json()}</div>;
}

// 3. 重新验证
async function Page() {
  // revalidate：指定秒数
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 } // 每60秒重新验证
  });

  return <div>{data.json()}</div>;
}

// 4. 按需重新验证
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { tags: ['data'] } // 添加标签
  });

  return <div>{data.json()}</div>;
}

// Server Action中触发重新验证
// actions.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function updateData() {
  // 更新数据后重新验证
  revalidateTag('data');
}

// 5. 动态路由缓存
// app/posts/[id]/page.tsx
export async function generateMetadata({ params }) {
  // 缓存单个post数据
  const post = await fetch(`https://api.example.com/posts/${params.id}`, {
    next: { revalidate: 3600 } // 1小时
  }).then(r => r.json());

  return {
    title: post.title
  };
}

export default async function PostPage({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.id}`, {
    next: { revalidate: 3600 }
  }).then(r => r.json());

  return <article>{post.content}</article>;
}

// 6. On-Demand ISR
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');

  if (path) {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true });
  }

  return NextResponse.json({ revalidated: false });
}

// 客户端调用
fetch('/api/revalidate?path=/blog', { method: 'POST' });
```

### 静态生成与SSR混合？

```typescript
// 1. 部分预渲染（PPR）
// app/page.tsx
export const experimental_ppr = true;

// 静态Shell
export default function Page() {
  return (
    <div>
      <h1>Static Header</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicContent />
      </Suspense>
    </div>
  );
}

async function DynamicContent() {
  // 这个部分会动态渲染
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  }).then(r => r.json());

  return <div>{data.message}</div>;
}

// 2. 增量静态生成（ISR）
// app/blog/page.tsx
export const revalidate = 3600; // 每1小时重新生成

export default async function BlogPage() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 }
  }).then(r => r.json());

  return <PostList posts={posts} />;
}

// 3. 动态路由ISR
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return posts.map((post) => ({
    slug: post.slug
  }));
}

export const revalidate = 86400; // 每24小时

export default async function BlogPost({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`, {
    next: { revalidate: 86400 }
  }).then(r => r.json());

  return <article>{post.content}</article>;
}

// 4. 按路由段缓存
// app/page.tsx
export const fetchCache = 'only-cache'; // 只使用缓存
export const fetchCache = 'force-no-store'; // 禁用缓存
export const dynamic = 'auto'; // auto | force-dynamic | error
export const dynamicParams = true; // true | false

// 5. 缓存标签策略
// app/page.tsx
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: {
      tags: ['data', 'v1'] // 多个标签
    }
  });

  return res.json();
}

// actions.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function refreshData() {
  // 重新验证特定标签
  revalidateTag('data');
  // 或重新验证多个标签
  revalidateTag('v1');
}
```

## Next.js性能优化

### 图片优化最佳实践？

```typescript
// 1. 使用next/image
import Image from 'next/image';

export default function Page() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1920}
      height={1080}
      priority // LCP图片
      placeholder="blur" // 模糊占位
    />
  );
}

// 2. 响应式图片
<Image
  src="/hero.jpg"
  alt="Hero"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  style={{ objectFit: 'cover' }}
/>

// 3. 远程图片配置
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/images/**',
      },
    ],
  },
};

// 使用
<Image
  src="https://example.com/images/photo.jpg"
  alt="Remote"
  width={500}
  height={300}
/>

// 4. 图片优化配置
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'], // 现代格式
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // 缓存时间（秒）
  },
};

// 5. 懒加载
import Image from 'next/image';

function ImageGallery() {
  return (
    <div>
      {images.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          width={500}
          height={300}
          loading={index === 0 ? 'eager' : 'lazy'} // 第一张立即加载
        />
      ))}
    </div>
  );
}
```

### 脚本优化策略？

```typescript
// 1. 使用Script组件
import Script from 'next/script';

export default function Page() {
  return (
    <>
      {/* 策略：beforeInteractive - 最高优先级 */}
      <Script
        src="https://polyfill.io/v3/polyfill.min.js"
        strategy="beforeInteractive"
      />

      {/* 策略：afterInteractive（默认）- 页面交互后加载 */}
      <Script
        src="https://www.googletagmanager.com/gtag/js"
        strategy="afterInteractive"
      />

      {/* 策略：lazyOnload - 浏览器空闲时加载 */}
      <Script
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="lazyOnload"
      />

      {/* 内联脚本 */}
      <Script id="inline-script" strategy="afterInteractive">
        {`
          console.log('This runs after page is interactive');
        `}
      </Script>

      {/* 等待加载完成 */}
      <Script
        src="https://example.com/analytics.js"
        onLoad={() => console.log('Script loaded')}
        onError={() => console.log('Script failed to load')}
      />
    </>
  );
}

// 2. 第三方脚本优化
// next.config.js
module.exports = {
  experimental: {
    scriptLoader: true,
  },
};

// 使用Script组件加载第三方脚本
<Script
  src="https://maps.googleapis.com/maps/api/js"
  strategy="lazyOnload"
/>
```

### 字体优化？

```typescript
// 1. 使用next/font
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // 字体加载策略
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

// 2. 本地字体
import localFont from 'next/font/local';

const myFont = localFont({
  src: './fonts/MyFont.woff2',
  variable: '--font-my-font',
  display: 'swap',
});

// 3. 多字体
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

export default function Layout({ children }) {
  return (
    <html className={`${inter.variable} ${robotoMono.variable}`}>
      <body>
        <h1 className="font-inter">Inter Font</h1>
        <code className="font-roboto-mono">Mono Font</code>
      </body>
    </html>
  );
}

// 4. 字体优化配置
// next.config.js
module.exports = {
  optimizeFonts: true,
  experimental: {
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin'] } },
      { loader: 'next/font/local', options: {} },
    ],
  },
};
```

## Next.js部署与监控

### Vercel部署优化？

```typescript
// 1. vercel.json配置
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"], // 美国东部
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
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/:path*"
    }
  ]
}

// 2. 环境变量
// .env.local
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.example.com

// 使用
import { DATABASE_URL } from '@/lib/env';

// 客户端可以使用NEXT_PUBLIC_前缀的
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// 3. 边缘函数
// app/api/hello/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  return new Response('Hello from Edge!');
}

// 4. 边缘中间件
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 添加自定义Header
  const response = NextResponse.next();

  response.headers.set('X-Custom-Header', 'value');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### 性能监控与分析？

```typescript
// 1. Web Vitals监控
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          id="web-vitals"
          strategy="afterInteractive"
        >
          {`
            import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

            function sendToAnalytics(metric) {
              // 发送到分析服务
              fetch('/api/analytics', {
                method: 'POST',
                body: JSON.stringify(metric),
              });
            }

            getCLS(sendToAnalytics);
            getFID(sendToAnalytics);
            getFCP(sendToAnalytics);
            getLCP(sendToAnalytics);
            getTTFB(sendToAnalytics);
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}

// 2. 自定义分析
// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const metric = await request.json();

  // 存储到数据库
  await db.analytics.create({
    data: {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
    }
  });

  return NextResponse.json({ success: true });
}

// 3. 性能分析
// app/layout.tsx
export const experimental = {
  instrumentation: true, // 启用instrumentation
};

// lib/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    require('instrumentation-node');
  }
}

// 4. Speed Insights
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Next.js安全最佳实践

### 安全配置与防护？

```typescript
// 1. 安全Headers配置
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

// 2. 环境变量保护
// ❌ 错误：暴露敏感信息
const apiKey = process.env.API_KEY; // 会暴露到客户端

// ✅ 正确：只在服务端使用
// app/api/route.ts
export async function GET() {
  const apiKey = process.env.API_KEY; // 安全
  const data = await fetch(`https://api.example.com?key=${apiKey}`);
  return Response.json(await data.json());
}

// 3. Server Actions安全
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function login(formData: FormData) {
  // 验证输入
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (!validatedFields.success) {
    return { error: 'Invalid input' };
  }

  // 业务逻辑
  // ...
}

// 4. API路由保护
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 验证token
  const token = authHeader.split(' ')[1];

  if (!isValidToken(token)) {
    return new NextResponse('Invalid token', { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
