# Next.js最佳实践

## Next.js最佳实践

> **学习目标**：掌握Next.js企业级开发的最佳实践
> **核心内容**：项目结构、性能优化、安全实践、代码规范

### 项目结构组织

#### 推荐的目录结构

```bash
my-enterprise-app/
├── app/                          # App Router
│   ├── (auth)/                   # 路由组：认证相关
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # 路由组：仪表盘
│   │   ├── dashboard/
│   │   ├── projects/
│   │   └── layout.tsx
│   ├── (marketing)/              # 路由组：营销页面
│   │   ├── about/
│   │   ├── pricing/
│   │   └── layout.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── users/
│   │   └── webhooks/
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页
├── components/                   # 组件目录
│   ├── ui/                       # UI基础组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── modal.tsx
│   ├── forms/                    # 表单组件
│   │   ├── login-form.tsx
│   │   └── project-form.tsx
│   ├── layouts/                  # 布局组件
│   │   ├── header.tsx
│   │   └── sidebar.tsx
│   └── features/                 # 功能组件
│       ├── project-card.tsx
│       └── task-list.tsx
├── lib/                          # 工具库
│   ├── db.ts                     # 数据库
│   ├── auth.ts                   # 认证
│   ├── utils.ts                  # 工具函数
│   ├── validations.ts            # 验证
│   └── constants.ts              # 常量
├── hooks/                        # 自定义Hooks
│   ├── use-auth.ts
│   └── use-debounce.ts
├── types/                        # TypeScript类型
│   ├── models.ts
│   └── api.ts
├── styles/                       # 样式文件
│   └── globals.css
├── public/                       # 静态资源
│   ├── images/
│   └── fonts/
└── prisma/                       # Prisma
    └── schema.prisma
```

#### 文件命名规范

```typescript
// ✅ 好的命名
components/ui/button.tsx
components/forms/login-form.tsx
lib/auth.ts
hooks/use-auth.ts

// ❌ 不好的命名
components/Button.tsx
components/LoginForm.tsx
lib/authHelper.ts
hooks/auth.ts
```

---

### 性能优化

#### 1. 代码分割

```typescript
// ✅ 懒加载重型组件
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// 动态导入编辑器（仅在使用时加载）
const Editor = dynamic(() => import('@/components/editor'), {
  loading: () => <p>Loading editor...</p>,
  ssr: false // 客户端渲染
})

// 动态导入图表
const Chart = dynamic(() => import('@/components/chart'), {
  loading: () => <ChartSkeleton />
})

export default function DashboardPage() {
  return (
    <div>
      <h1>仪表盘</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <Chart data={data} />
      </Suspense>

      <Editor />
    </div>
  )
}
```

#### 2. 图片优化

```typescript
// app/page.tsx
import Image from 'next/image'

export default function Page() {
  return (
    <div>
      {/* ✅ 使用Next.js Image组件 */}
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={1200}
        height={600}
        priority // 首屏图片优先加载
        placeholder="blur" // 模糊占位
        blurDataURL="data:image/jpeg;base64,..."
      />

      {/* 远程图片 */}
      <Image
        src="https://example.com/image.jpg"
        alt="Remote"
        width={800}
        height={600}
      />

      {/* 响应式图片 */}
      <Image
        src="/responsive.jpg"
        alt="Responsive"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}
```

#### 3. 数据缓存策略

```typescript
// lib/cache.ts

// 静态数据：长时间缓存
export async function getStaticContent() {
  return fetch('https://api.example.com/static', {
    next: { revalidate: 86400 } // 24小时
  }).then(r => r.json())
}

// 动态数据：短时间缓存
export async function getPosts() {
  return fetch('https://api.example.com/posts', {
    next: { revalidate: 300 } // 5分钟
  }).then(r => r.json())
}

// 实时数据：不缓存
export async function getLiveScore() {
  return fetch('https://api.example.com/score', {
    cache: 'no-store'
  }).then(r => r.json())
}

// 按需重新验证
export async function getProduct(id: string) {
  return fetch(`https://api.example.com/products/${id}`, {
    next: { tags: [`product-${id}`] }
  }).then(r => r.json())
}

// 重新验证
// import { revalidateTag } from 'next/cache'
// revalidateTag(`product-${id}`)
```

#### 4. 字体优化

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

// 配置字体
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

---

### 安全最佳实践

#### 1. 环境变量保护

```typescript
// ✅ 正确：敏感信息仅服务端
export async function serverAction() {
  // 可以访问
  const apiKey = process.env.API_SECRET

  // 返回给客户端（不暴露敏感信息）
  return { success: true }
}

// ❌ 错误：将密钥暴露给客户端
'use client'
export function ClientComponent() {
  // 不能访问服务端环境变量
  const apiKey = process.env.API_SECRET // undefined

  return <div>{apiKey}</div>
}
```

#### 2. 输入验证

```typescript
// lib/validations.ts
import { z } from 'zod'

// 用户注册验证
export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    '必须包含大小写字母和数字'
  )
})

// 文章创建验证
export const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(10000),
  tags: z.array(z.string()).max(5)
})
```

#### 3. SQL注入防护

```typescript
// ✅ 使用Prisma（自动防护）
export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id }
  })
}

// ❌ 原始SQL（危险）
export async function getUserUnsafe(id: string) {
  const query = `SELECT * FROM users WHERE id = '${id}'`
  return db.query(query) // SQL注入风险
}
```

#### 4. XSS防护

```typescript
// ✅ React自动转义
function PostContent({ content }: { content: string }) {
  return <div>{content}</div> // 自动转义
}

// ⚠️ 使用dangerouslySetInnerHTML时要小心
function PostContent({ html }: { html: string }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html) // 必须清理
      }}
    />
  )
}
```

#### 5. CSRF防护

```typescript
// middleware.ts
import { createCSRFToken } from '@/lib/csrf'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 为敏感操作添加CSRF令牌
  if (request.method !== 'GET') {
    const token = createCSRFToken()
    const response = NextResponse.next()

    response.cookies.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return response
  }
}
```

---

### 代码规范

#### 1. ESLint配置

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

#### 2. Prettier配置

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

#### 3. TypeScript配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### 组件设计模式

#### 1. 容器/展示组件分离

```typescript
// components/projects/project-list.tsx（展示组件）
export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}

// app/projects/page.tsx（容器组件）
export default async function ProjectsPage() {
  const projects = await getProjects()

  return <ProjectList projects={projects} />
}
```

#### 2. 组合式组件

```typescript
// components/ui/button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', children }: ButtonProps) {
  const baseStyles = 'rounded font-medium transition-colors'

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}>
      {children}
    </button>
  )
}
```

#### 3. 自定义Hooks

```typescript
// hooks/use-debounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// 使用
function SearchInput() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery)
    }
  }, [debouncedQuery])

  return <input value={query} onChange={e => setQuery(e.target.value)} />
}
```

---

### 错误处理

#### 全局错误处理

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录错误
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">出错了</h2>
        <p className="text-gray-600 mb-4">抱歉，发生了错误</p>
        <button onClick={reset} className="btn-primary">
          重试
        </button>
      </div>
    </div>
  )
}
```

#### Server Actions错误处理

```typescript
// app/actions/posts.ts
'use server'

export async function createPost(formData: FormData) {
  try {
    const data = validatePost(formData)

    const post = await prisma.post.create({ data })

    revalidatePath('/posts')

    return { success: true, post }
  } catch (error) {
    // 记录错误
    console.error('创建文章失败:', error)

    // 返回用户友好的错误消息
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}
```

---

### 实战案例：企业级项目架构

#### 完整示例

```typescript
// lib/api.ts
import { z } from 'zod'

// 通用API响应
export class ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  meta?: Record<string, any>

  constructor(success: boolean, data?: T, error?: string) {
    this.success = success
    this.data = data
    this.error = error
  }

  static ok<T>(data: T, meta?: Record<string, any>) {
    const response = new ApiResponse<T>(true, data)
    if (meta) response.meta = meta
    return response
  }

  static error(error: string) {
    return new ApiResponse(false, undefined, error)
  }
}

// API错误处理
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 通用API处理器
export async function handleApiRequest<T>(
  handler: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await handler()
    return ApiResponse.ok(data)
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message)
    }
    return ApiResponse.error('服务器错误')
  }
}

// 使用示例
export async function getUser(id: string) {
  return handleApiRequest(async () => {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new ApiError('用户不存在', 404, 'USER_NOT_FOUND')
    return user
  })
}
```

### 本章小结

| 最佳实践 | 说明 | 优先级 |
|---------|------|--------|
| **项目结构** | 清晰的目录组织 | 高 |
| **性能优化** | 代码分割、缓存策略 | 高 |
| **安全实践** | 输入验证、环境变量 | 高 |
| **代码规范** | ESLint、Prettier | 中 |
| **错误处理** | 全局错误处理 | 高 |
| **类型安全** | TypeScript严格模式 | 高 |

---

**恭喜！你已经完成了Next.js的所有章节学习。**
