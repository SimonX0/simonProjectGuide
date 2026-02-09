---
title: React 18+与Next.js 14+面试题
---

# React 18+与Next.js 14+面试题

## React 18+新特性

### React 18有哪些核心新特性？

**React 18** 带来了许多重要的新特性：

**1. 并发渲染（Concurrent Rendering）**:

```javascript
// 并发特性允许React准备多个版本的UI
// 优先处理高优先级更新，低优先级更新可被中断

// 使用startTransition标记低优先级更新
import { startTransition } from 'react';

function SearchComponent() {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;

    // 高优先级：输入框更新（立即响应）
    setInput(value);

    // 低优先级：列表过滤（可被中断）
    startTransition(() => {
      const filtered = largeList.filter(item =>
        item.includes(value)
      );
      setList(filtered);
    });
  };

  return (
    <div>
      <input value={input} onChange={handleChange} />
      <ul>{list.map(item => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}
```

**2. 自动批处理（Automatic Batching）**:

```javascript
// React 17：只在事件处理函数中批处理
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f); // 不会批处理，两次渲染
}, 0);

// React 18：所有更新自动批处理
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f); // 自动批处理，一次渲染
}, 0);

// 使用flushSync强制同步更新
import { flushSync } from 'react-dom';

flushSync(() => {
  setCount(c => c + 1);
}); // 立即更新
```

**3. Suspense改进**:

```javascript
// 支持服务端渲染
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AsyncComponent />
    </Suspense>
  );
}

// 服务端渲染
import { renderToString } from 'react-dom/server';

const html = renderToString(
  <Suspense fallback={<Spinner />}>
    <App />
  </Suspense>
);
```

**4. 新的Hooks**:

```javascript
// useId：生成唯一ID
import { useId } from 'react';

function Checkbox() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>选择</label>
      <input id={id} type="checkbox" />
    </>
  );
}

// useSyncExternalStore：读取外部状态
import { useSyncExternalStore } from 'react';

function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,
    () => true // 服务端默认值
  );
}

// useDeferredValue：延迟更新低优先级值
import { useDeferredValue } from 'react';

function SearchResults({ query }) {
  // deferredQuery是延迟版本，可能滞后于query
  const deferredQuery = useDeferredValue(query);

  return (
    <Results query={deferredQuery} />
  );
}

// useTransition：判断是否有待处理的transition
import { useTransition } from 'react';

function Button() {
  const [isPending, startTransition] = useTransition();

  return (
    <button disabled={isPending} onClick={() => {
      startTransition(() => {
        setQuery(input);
      });
    }}>
      {isPending ? '加载中...' : '搜索'}
    </button>
  );
}
```

### 什么是并发特性？

**并发特性**允许React准备多个版本的UI，根据优先级选择性地渲染：

```javascript
// 并发模式
import { createRoot } from 'react-dom/client';

// 启用并发模式
const root = createRoot(document.getElementById('root'));
root.render(<App />);

// 并发特性示例
function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (value) => {
    // 立即更新输入
    setFilter(value);

    // 延迟更新列表（可中断）
    startTransition(() => {
      const filtered = tasks.filter(task =>
        task.name.includes(value)
      );
      setTasks(filtered);
    });
  };

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => handleFilterChange(e.target.value)}
      />
      {isPending && <Spinner />}
      <TaskList tasks={tasks} />
    </div>
  );
}
```

**并发特性的优势**:

| 特性 | 说明 |
|------|------|
| **可中断渲染** | 低优先级任务可被高优先级任务中断 |
| **优先级调度** | 重要更新优先执行 |
| **更好的用户体验** | 保持界面响应，避免卡顿 |

### Transitions如何使用？

**Transitions**用于标记非紧急更新：

```javascript
import { startTransition, useTransition } from 'react';

// 方式1：使用startTransition
function SearchComponent() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);

  const handleChange = (value) => {
    setInput(value); // 紧急更新

    startTransition(() => {
      // 非紧急更新
      const filtered = search(value);
      setResults(filtered);
    });
  };
}

// 方式2：使用useTransition Hook
function SearchComponent() {
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);

  return (
    <div>
      <input
        value={input}
        onChange={(e) => {
          const value = e.target.value;
          setInput(value);

          startTransition(() => {
            setResults(search(value));
          });
        }}
      />
      {isPending && <LoadingSpinner />}
      <Results results={results} />
    </div>
  );
}

// 实际示例：标签页切换
function Tabs({ items }) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState(0);

  const selectTab = (index) => {
    // 立即更新选中的标签
    setActiveTab(index);

    // 延迟更新内容（避免卡顿）
    startTransition(() => {
      loadTabContent(index);
    });
  };

  return (
    <>
      <div className="tabs">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => selectTab(index)}
            className={activeTab === index ? 'active' : ''}
          >
            {item.label}
          </button>
        ))}
      </div>
      {isPending && <Spinner />}
      <div className="content">
        {items[activeTab].content}
      </div>
    </>
  );
}
```

### Suspense在React 18中的改进？

**React 18改进了Suspense**，使其更强大：

```javascript
// 1. 服务端渲染支持
import { Suspense } from 'react';

// SSR时使用Suspense
function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserProfile />
    </Suspense>
  );
}

// 2. 嵌套Suspense
function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Header />
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      <Suspense fallback={<ContentSkeleton />}>
        <MainContent />
      </Suspense>
    </Suspense>
  );
}

// 3. 配合use使用数据获取
function Profile() {
  const data = use(fetchUserProfile());

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.bio}</p>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Profile />
    </Suspense>
  );
}

// 4. 错误边界
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Suspense fallback={<Loading />}>
        <AsyncComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

**Suspense 18 vs 17**:

| 特性 | React 17 | React 18 |
|------|----------|----------|
| 服务端渲染 | 不支持 | 支持 |
| 嵌套使用 | 有限 | 完全支持 |
| 错误处理 | 基础 | 改进 |
| 并发模式 | 不支持 | 支持 |

### 如何使用新的Client和Server API？

**React 18引入了新的客户端和服务端API**：

```javascript
// 1. 客户端API：createRoot
import { createRoot } from 'react-dom/client';

// React 17方式（已废弃）
// import { render } from 'react-dom';
// render(<App />, container);

// React 18方式
const container = document.getElementById('root');
const root = createRoot(container);

// 渲染应用
root.render(<App />);

// 卸载应用
// root.unmount();

// 2. hydrationRoot：服务端渲染后激活
import { hydrateRoot } from 'react-dom/client';

// 客户端激活
const container = document.getElementById('root');
hydrateRoot(container, <App />);

// 3. 并行服务端渲染
import { renderToPipeableStream } from 'react-dom/server';

app.get('/', (req, res) => {
  const { pipe } = renderToPipeableStream(
    <App />,
    {
      // 所有模块准备好时开始流式传输
      onAllReady() {
        pipe(res);
      },
      // Shell准备好时开始流式传输
      onShellReady() {
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html');
        pipe(res);
      }
    }
  );
});
```

## Next.js 14+新特性

### Next.js 14有哪些新特性？

**Next.js 14** 带来了重要的改进：

**1. Turbopack（稳定版）**:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用Turbopack（开发模式）
  experimental: {
    turbo: {
      // Turbopack配置
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

module.exports = nextConfig;
```

**2. Server Actions（稳定版）**:

```javascript
// app/actions.js
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// 创建Server Action
export async function createTodo(formData) {
  const title = formData.get('title');

  // 数据库操作
  await db.todos.create({ data: { title } });

  // 重新验证缓存
  revalidatePath('/todos');

  // 可选：重定向
  redirect('/todos');
}

// 在组件中使用
// app/todos/page.js
import { createTodo } from '../actions';

export default function TodosPage() {
  return (
    <form action={createTodo}>
      <input name="title" type="text" required />
      <button type="submit">添加</button>
    </form>
  );
}
```

**3. 部分预渲染（PPR）**:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 启用部分预渲染
    ppr: 'incremental',
  },
};

// 在页面级别启用
export const experimental_ppr = true;

export default function Page() {
  return (
    <div>
      {/* 静态部分 */}
      <header>静态标题</header>

      {/* 动态部分 */}
      <Suspense fallback={<Loading />}>
        <DynamicContent />
      </Suspense>
    </div>
  );
}
```

**4. 元数据改进**:

```javascript
// app/layout.js
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '我的应用',
  description: '应用描述',
  openGraph: {
    title: '我的应用',
    description: '应用描述',
    images: ['/og-image.png'],
  },
};

// 动态元数据
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  };
}

export default function Layout({ children }) {
  return <html><body>{children}</body></html>;
}
```

**5. Image组件优化**:

```javascript
// app/page.js
import Image from 'next/image';

export default function Page() {
  return (
    <>
      {/* 自动优化 */}
      <Image
        src="/hero.png"
        alt="Hero"
        width={800}
        height={600}
        priority // LCP图片优先加载
      />

      {/* 远程图片优化 */}
      <Image
        src="https://example.com/photo.jpg"
        alt="Remote photo"
        width={500}
        height={300}
      />

      {/* 响应式图片 */}
      <Image
        src="/photo.jpg"
        alt="Responsive"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </>
  );
}
```

### Server Actions如何工作？

**Server Actions**允许直接在服务器上执行函数：

```javascript
// app/actions/todos.js
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { auth } from '@/lib/auth';

// 定义验证schema
const todoSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
});

// 创建Todo
export async function createTodo(formData) {
  // 验证用户身份
  const session = await auth();
  if (!session) {
    return { error: '未授权' };
  }

  // 验证数据
  const data = todoSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
  });

  // 创建记录
  const todo = await db.todo.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  });

  // 重新验证缓存
  revalidatePath('/todos');
  revalidateTag('todos');

  // 返回结果
  return { success: true, todo };
}

// 更新Todo
export async function updateTodo(id, formData) {
  const todo = await db.todo.update({
    where: { id },
    data: {
      title: formData.get('title'),
      completed: formData.get('completed') === 'true',
    },
  });

  revalidatePath(`/todos/${id}`);
  revalidateTag('todos');

  return { success: true, todo };
}

// 删除Todo
export async function deleteTodo(id) {
  await db.todo.delete({ where: { id } });

  revalidatePath('/todos');
  revalidateTag('todos');

  redirect('/todos');
}
```

**在客户端组件中使用**:

```javascript
// app/todos/page.js
'use client';

import { useState, useTransition } from 'react';
import { createTodo, deleteTodo } from '../actions/todos';

export default function TodosPage() {
  const [todos, setTodos] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData) => {
    startTransition(async () => {
      const result = await createTodo(formData);
      if (result.success) {
        setTodos([...todos, result.todo]);
      }
    });
  };

  const handleDelete = (id) => {
    startTransition(async () => {
      await deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
    });
  };

  return (
    <div>
      <form action={handleSubmit}>
        <input name="title" type="text" required />
        <button disabled={isPending}>
          {isPending ? '添加中...' : '添加'}
        </button>
      </form>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.title}
            <button onClick={() => handleDelete(todo.id)}>
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### App Router和Pages Router的区别？

| 特性 | App Router | Pages Router |
|------|-----------|-------------|
| **目录结构** | app/ | pages/ |
| **布局** | 嵌套布局 | 单一_layout.js |
| **数据获取** | async/await | getServerSideProps |
| **服务端组件** | 默认支持 | 不支持 |
| **流式渲染** | 支持 | 不支持 |
| **Server Actions** | 支持 | 不支持 |

**App Router示例**:

```javascript
// app/layout.js
import './globals.css';

export const metadata = {
  title: '我的应用',
  description: '应用描述',
};

export default function RootLayout({ children }) {
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

// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}

// app/dashboard/page.js
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }, // 缓存60秒
  });
  return res.json();
}

export default async function DashboardPage() {
  const data = await getData();

  return (
    <div>
      <h1>仪表盘</h1>
      <DataList items={data} />
    </div>
  );
}
```

**Pages Router示例**:

```javascript
// pages/dashboard.js
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <>
      <Head>
        <title>仪表盘</title>
      </Head>
      <div>
        <h1>仪表盘</h1>
        <DataList items={data} />
      </div>
    </>
  );
}

// 或者使用getServerSideProps
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return {
    props: { data },
  };
}
```

### Next.js 14的性能优化技巧？

**1. 使用Turbopack**:

```javascript
// next.config.js
module.exports = {
  experimental: {
    turbo: {},
  },
};
```

**2. 优化图片加载**:

```javascript
// 使用priority标记关键图片
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
/>

// 使用fill实现响应式
<div className="relative h-64 w-64">
  <Image
    src="/photo.jpg"
    alt="Photo"
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
  />
</div>
```

**3. 使用缓存策略**:

```javascript
// 静态生成（默认）
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }, // ISR：60秒重新验证
});

// 按需重新验证
import { revalidatePath, revalidateTag } from 'next/cache';

// Server Action中
revalidatePath('/blog');
revalidateTag('posts');

// 使用标签
const data = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] },
});
```

**4. 动态导入**:

```javascript
// 动态导入组件
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <p>加载中...</p>,
    ssr: false, // 禁用SSR
  }
);

export default function Page() {
  return <DynamicComponent />;
}
```

**5. 代码分割**:

```javascript
// app/page.js
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
      <Footer />
    </div>
  );
}
```

### Server Components和Client Components的区别？

**Server Components**:
- 在服务器上渲染
- 可以直接访问数据库和文件系统
- 减少客户端JavaScript
- 不能使用hooks和事件处理器

**Client Components**:
- 在浏览器中渲染
- 可以使用React hooks
- 可以处理用户交互
- 增加客户端JavaScript

**使用示例**:

```javascript
// Server Component（默认）
// app/posts/page.js
async function getPosts() {
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1>文章列表</h1>
      <PostList posts={posts} />
    </div>
  );
}

// Client Component
// app/posts/PostList.js
'use client';

import { useState } from 'react';

export default function PostList({ posts }) {
  const [filter, setFilter] = useState('');

  const filtered = posts.filter(post =>
    post.title.includes(filter)
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="搜索文章..."
      />
      <ul>
        {filtered.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

**混合使用**:

```javascript
// Server Component
import ClientComponent from './ClientComponent';

export default function Page() {
  // Server Component可以导入Client Component
  return (
    <div>
      <h1>Server Component</h1>
      <ClientComponent />
    </div>
  );
}

// Client Component不能导入Server Component
// 但可以通过props传递
```

## 实战场景

### 如何实现乐观更新？

```javascript
'use client';

import { useState, useTransition } from 'react';
import { createTodo } from '../actions';

export default function TodoForm() {
  const [todos, setTodos] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData) => {
    // 乐观更新：立即添加到列表
    const tempId = Date.now();
    const tempTodo = {
      id: tempId,
      title: formData.get('title'),
      pending: true,
    };
    setTodos([...todos, tempTodo]);

    // 发送Server Action
    const result = await createTodo(formData);

    if (result.success) {
      // 替换临时数据
      setTodos(todos.map(t =>
        t.id === tempId ? result.todo : t
      ));
    } else {
      // 失败：移除临时数据
      setTodos(todos.filter(t => t.id !== tempId));
    }
  };

  return (
    <form action={handleSubmit}>
      <input name="title" type="text" required />
      <button disabled={isPending}>
        {isPending ? '添加中...' : '添加'}
      </button>
    </form>
  );
}
```

### 如何实现无限滚动？

```javascript
'use client';

import { useState, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

export default function InfiniteList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    const newItems = await fetch(`/api/items?page=${page}`)
      .then(res => res.json());

    setItems([...items, ...newItems]);
    setPage(page + 1);
    setLoading(false);
  }, [page, loading, items]);

  React.useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView, loadMore]);

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      <div ref={ref}>
        {loading && <Loading />}
      </div>
    </div>
  );
}
```

## 本章小结

### React 18+核心要点

| 特性 | 关键点 |
|------|--------|
| **并发渲染** | 可中断的渲染，更好的用户体验 |
| **自动批处理** | 所有状态更新自动批处理 |
| **Transitions** | 标记低优先级更新 |
| **Suspense** | 改进的数据加载方式 |
| **新Hooks** | useId、useSyncExternalStore、useDeferredValue、useTransition |

### Next.js 14+核心要点

| 特性 | 关键点 |
|------|--------|
| **Turbopack** | 更快的开发体验 |
| **Server Actions** | 直接在服务器执行函数 |
| **部分预渲染** | 混合静态和动态内容 |
| **App Router** | 新的文件系统和特性 |
| **Server Components** | 减少客户端JavaScript |

## React 19+最新特性（2025更新）

### React 19有哪些新特性？

```javascript
// 1. 简化的函数组件
// 之前
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}

// React 19：无需返回语句
function Greeting({ name }) {
  <h1>Hello, {name}</h1>;
}

// 2. useActionState Hook
import { useActionState } from 'react';

function Form() {
  const [state, formAction] = useActionState(async (prevState, formData) => {
    const result = await submitForm(formData);
    return result;
  }, null);

  return (
    <form action={formAction}>
      <input name="name" />
      <button type="submit">Submit</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}

// 3. useOptimistic Hook
import { useOptimistic } from 'react';

function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const optimisticLikes = useOptimistic(likes, {
    pend: (state) => state + 1,
  });

  const handleLike = async () => {
    // 乐观更新
    setLikes(optimisticLikes + 1);

    // 发送请求
    await likePost(postId);
  };

  return (
    <button onClick={handleLike}>
      {optimisticLikes} Likes
    </button>
  );
}

// 4. useRef自动解包
// 之前
function Input() {
  const inputRef = useRef(null);
  return <input ref={inputRef} />;
}

// React 19：ref作为prop传递
function Input({ ref }) {
  return <input ref={ref} />;
}

// 5. Context默认值自动推断
const ThemeContext = createContext('light');

// 不再需要提供defaultValue
function App() {
  return <ThemeContext.Provider value="dark">...</ThemeContext.Provider>;
}
```

### React Server Components (RSC)深入理解？

```javascript
// Server Component - 默认
// app/users/page.js
async function UsersPage() {
  // ✅ 可以直接在服务器执行
  const users = await db.users.findMany();

  // ❌ 不能使用hooks和事件处理器
  // const [state, setState] = useState(); // Error

  return (
    <div>
      <h1>Users</h1>
      <UserList users={users} />
    </div>
  );
}

// Client Component - 显式标记
'use client';

import { useState } from 'react';

export function UserList({ users }) {
  // ✅ 可以使用hooks
  const [filter, setFilter] = useState('');

  const filtered = users.filter(user =>
    user.name.includes(filter)
  );

  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      {filtered.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}

// Server Components优势

// 1. 减少客户端JavaScript
// Server Component
async function ProductList() {
  const products = await fetch('https://api.example.com/products')
    .then(r => r.json());

  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
// 这些数据在服务器获取，客户端只接收HTML

// 2. 直接访问后端资源
import fs from 'fs/promises';
import db from '@/lib/db';

async function BlogPost({ id }) {
  // ✅ 直接读取文件
  const post = await fs.readFile(`./posts/${id}.md`, 'utf-8');

  // ✅ 直接查询数据库
  const comments = await db.comments.findMany({ where: { postId: id } });

  return <Article content={post} comments={comments} />;
}

// 3. 保持服务端的敏感数据
const API_KEY = process.env.API_SECRET;

async function Weather() {
  const data = await fetch(`https://api.weather.com?key=${API_KEY}`);
  return <div>{data.temperature}°C</div>;
}
// API_KEY不会暴露给客户端

// 组合使用
import UserList from './UserList'; // Client Component

export default async function Page() {
  // Server Component获取数据
  const users = await fetchUsers();

  return <UserList users={users} />;
}
// 数据在服务器获取，交互在客户端处理
```

## React Hooks深度解析

### 如何手写常用Hooks？

```javascript
// 1. useState实现
let state = [];
let setters = [];
let stateIndex = 0;

function useState(initialValue) {
  const currentIndex = stateIndex;

  if (state[currentIndex] === undefined) {
    state[currentIndex] = initialValue;
  }

  const setState = (newValue) => {
    state[currentIndex] = newValue;
    render();
  };

  setters[currentIndex] = setState;
  stateIndex++;

  return [state[currentIndex], setters[currentIndex]];
}

// 2. useEffect实现
const effectDeps = [];
let effectIndex = 0;

function useEffect(callback, deps) {
  const currentIndex = effectIndex;
  const prevDeps = effectDeps[currentIndex];

  const hasChanged = !prevDeps ||
    !deps ||
    deps.some((dep, i) => dep !== prevDeps[i]);

  if (hasChanged) {
    callback();
    effectDeps[currentIndex] = deps;
  }

  effectIndex++;
}

// 3. useMemo实现
function useMemo(factory, deps) {
  const currentIndex = stateIndex;
  const prevDeps = effectDeps[currentIndex];
  const prevValue = state[currentIndex];

  const hasChanged = !prevDeps ||
    !deps ||
    deps.some((dep, i) => dep !== prevDeps[i]);

  if (hasChanged) {
    const value = factory();
    state[currentIndex] = value;
    effectDeps[currentIndex] = deps;
    return value;
  }

  return prevValue;
}

// 4. useCallback实现
function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}

// 5. useRef实现
const refs = [];
let refIndex = 0;

function useRef(initialValue) {
  const currentIndex = refIndex;

  if (refs[currentIndex] === undefined) {
    refs[currentIndex] = { current: initialValue };
  }

  refIndex++;

  return refs[currentIndex];
}

// 6. useContext实现
function useContext(Context) {
  return Context._currentValue;
}

// Context实现
function createContext(defaultValue) {
  const Context = {
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null
  };

  Context.Provider = {
    value: defaultValue,
    children: null
  };

  Context.Consumer = null;

  return Context;
}
```

### useEffect使用最佳实践？

```javascript
// 1. 依赖项必须完整
// ❌ 错误：缺少依赖
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => subscription.unsubscribe();
}, []);
// ESLint警告：React Hook useEffect has a missing dependency: 'props.source'

// ✅ 正确：包含所有依赖
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => subscription.unsubscribe();
}, [props.source]);

// 2. 避免无限循环
// ❌ 错误：每次渲染都更新state
useEffect(() => {
  setState(state + 1);
}); // 缺少依赖数组

// ✅ 正确：只在特定依赖变化时更新
useEffect(() => {
  if (someCondition) {
    setState(state + 1);
  }
}, [someCondition]);

// 3. 清理函数
useEffect(() => {
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);

  // 返回清理函数
  return () => {
    clearInterval(timer);
  };
}, []);

// 4. 多个相关state合并为一个effect
// ❌ 不好：多个effect
useEffect(() => {
  fetchUser(userId);
}, [userId]);

useEffect(() => {
  fetchPosts(userId);
}, [userId]);

// ✅ 好：合并为一个
useEffect(() => {
  if (userId) {
    fetchUser(userId);
    fetchPosts(userId);
  }
}, [userId]);

// 5. 条件执行
useEffect(() => {
  if (!isOpen) return;

  const modal = document.getElementById('modal');
  modal.showModal();

  return () => modal.close();
}, [isOpen]);
```

### 自定义Hooks设计模式？

```javascript
// 1. 状态逻辑复用
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, setValue, toggle, setTrue, setFalse };
}

// 2. 表单处理
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name) => (e) => {
    setValues(prev => ({ ...prev, [name]: e.target.value }));
  };

  const handleBlur = (name) => () => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = (callback) => (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      callback(values);
    }
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit
  };
}

// 使用
function LoginForm() {
  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    (values) => {
      const errors = {};
      if (!values.email) errors.email = 'Required';
      if (!values.password) errors.password = 'Required';
      return errors;
    }
  );

  return (
    <form onSubmit={handleSubmit(login)}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange('email')}
      />
      {errors.email && <span>{errors.email}</span>}
      <button type="submit">Login</button>
    </form>
  );
}

// 3. API请求
function useRequest(url, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (requestOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        ...requestOptions
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const json = await response.json();
      setData(json);
      return json;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    request();
  }, [request]);

  return { data, error, loading, request };
}

// 4. 本地存储
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// 5. 防抖/节流
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function useThrottle(value, delay) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now();
      const timeSinceLastExecution = now - lastExecuted.current;

      if (timeSinceLastExecution > delay) {
        setThrottledValue(value);
        lastExecuted.current = now;
      }
    }, delay - timeSinceLastExecution);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return throttledValue;
}
```

## React性能优化

### React.memo、useMemo、useCallback区别？

```javascript
// 1. React.memo - 组件级优化
const MyComponent = React.memo(function MyComponent(props) {
  // 只在props变化时重新渲染
  return <div>{props.name}</div>;
});

// 自定义比较函数
const MyComponent = React.memo(
  function MyComponent(props) {
    return <div>{props.name}</div>;
  },
  (prevProps, nextProps) => {
    // 返回true表示props相等，不需要重新渲染
    return prevProps.name === nextProps.name;
  }
);

// 使用场景
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveChild name="John" />
      {/* 如果ExpensiveChild用React.memo包装，不会因为count变化而重新渲染 */}
    </div>
  );
}

// 2. useMemo - 缓存计算结果
function ExpensiveComponent({ items }) {
  // ❌ 每次渲染都重新计算
  const sorted = items.sort((a, b) => a.id - b.id);

  // ✅ 只在items变化时计算
  const sorted = useMemo(() => {
    return items.sort((a, b) => a.id - b.id);
  }, [items]);

  // 复杂计算
  const fibonacci = useMemo(() => {
    console.log('Calculating fibonacci...');
    return calculateFibonacci(n);
  }, [n]);

  return <div>{sorted.map(item => <li key={item.id}>{item.name}</li>)}</div>;
}

// 3. useCallback - 缓存函数
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 每次渲染创建新函数
  const handleClick = () => {
    console.log('Clicked');
  };

  // ✅ 只在依赖变化时创建新函数
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []); // 空依赖数组，函数永远不会变

  // 传递给子组件
  return <Child onClick={handleClick} />;
}

// 配合React.memo使用
const Child = React.memo(function Child({ onClick }) {
  console.log('Child rendered');
  return <button onClick={onClick}>Click me</button>;
});
// 只有onClick变化时Child才重新渲染
```

### 虚拟列表优化？

```javascript
// 使用react-window
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}

// 使用react-virtualized
import { List } from 'react-virtualized';

function VirtualList({ items }) {
  const rowRenderer = ({ index, key, style }) => (
    <div key={key} style={style}>
      {items[index].name}
    </div>
  );

  return (
    <List
      width={800}
      height={600}
      rowCount={items.length}
      rowHeight={50}
      rowRenderer={rowRenderer}
    />
  );
}
```

### Code Splitting与懒加载？

```javascript
// 1. React.lazy - 组件懒加载
import { lazy, Suspense } from 'react';

// 懒加载组件
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// 2. 路由级代码分割
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// 3. 命名导出
// HeavyComponents.js
export const ComponentA = () => <div>A</div>;
export const ComponentB = () => <div>B</div>;

// App.js
const ComponentA = lazy(() =>
  import('./HeavyComponents').then(module => ({
    default: module.ComponentA
  }))
);

// 4. 预加载
const preloadComponent = () => {
  import('./HeavyComponent');
};

function Home() {
  return (
    <div>
      <h1>Home</h1>
      <button onMouseEnter={preloadComponent}>
        Go to Heavy Component
      </button>
    </div>
  );
}

// 5. 错误边界
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## React状态管理

### Zustand vs Redux对比？

```javascript
// Zustand - 更简单的状态管理
import { create } from 'zustand';

// 1. 基础用法
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

function Counter() {
  const { count, increment, decrement } = useStore();
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

// 2. 选择器（避免不必要的重渲染）
function CountDisplay() {
  const count = useStore((state) => state.count);
  // 只有count变化时才重新渲染
  return <div>{count}</div>;
}

// 3. 异步Action
const useStore = create((set) => ({
  users: [],
  fetchUsers: async () => {
    const res = await fetch('/api/users');
    const users = await res.json();
    set({ users });
  },
}));

// Redux Toolkit - 更结构化的状态管理
import { createSlice, configureStore } from '@reduxjs/toolkit';

// 1. 创建Slice
const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    decrement: (state) => {
      state.count -= 1;
    },
    incrementBy: (state, action) => {
      state.count += action.payload;
    },
  },
});

const { increment, decrement, incrementBy } = counterSlice.actions;

// 2. 配置Store
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

// 3. 使用React-Redux Hooks
import { useSelector, useDispatch } from 'react-redux';

function Counter() {
  const count = useSelector((state) => state.counter.count);
  const dispatch = useDispatch();

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(incrementBy(5))}>+5</button>
    </div>
  );
}

// 4. 异步Thunk
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const res = await fetch('/api/users');
    return await res.json();
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
```

### Context API性能优化？

```javascript
// ❌ 问题：Context值变化导致所有消费者重渲染
const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);

  // user变化时，所有使用Theme的组件都会重渲染
  return (
    <ThemeContext.Provider value={{ theme, user }}>
      <ComponentA />
      <ComponentB />
    </ThemeContext.Provider>
  );
}

// ✅ 解决方案1：拆分Context
const ThemeContext = createContext();
const UserContext = createContext();

function App() {
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ user, setUser }}>
        <ComponentA />
        <ComponentB />
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

// ✅ 解决方案2：使用useMemo
function App() {
  const value = useMemo(() => ({
    theme,
    setTheme
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <Children />
    </ThemeContext.Provider>
  );
}

// ✅ 解决方案3：分离静态和动态值
const StaticContext = createContext({
  setTheme: () => {}
});

function App() {
  const setTheme = useCallback(() => {
    // ...
  }, []);

  return (
    <StaticContext.Provider value={setTheme}>
      <DynamicContext value={theme}>
        <Children />
      </DynamicContext>
    </StaticContext.Provider>
  );
}

// ✅ 解决方案4：使用选择器模式
function createContext(initialValue) {
  const Context = createContext(initialValue);

  function useContextSelector(selector) {
    const value = useContext(Context);
    return selector(value);
  }

  return [Context.Provider, useContextSelector];
}
```

---

**相关章节**:
- [第5章：性能优化面试题](./chapter-05)
- [第6章：工程化面试题](./chapter-06)
- [第16章：Vue3高级进阶面试题](./chapter-16)
