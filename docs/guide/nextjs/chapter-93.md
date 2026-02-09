# Server Actions详解

## Server Actions详解

> **学习目标**：掌握Next.js的Server Actions，简化服务端数据变更操作
> **核心内容**：Server Actions基础、'use server'指令、表单处理、实战案例

### Server Actions概述

#### 什么是Server Actions

**Server Actions** 是Next.js 14+引入的功能，允许你在客户端组件中直接调用服务端函数，而无需创建API路由。

```
┌─────────────────────────────────────────────────────────────┐
│           Server Actions 工作流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Client Component                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. 用户触发操作（点击、提交表单等）                  │   │
│  │  2. 调用Server Action                               │   │
│  │     action({ name: 'value' })                       │   │
│  └─────────────────────────────────────────────────────┘   │
│              ↓ 网络请求（自动处理）                           │
│  Server                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  3. 接收请求                                          │   │
│  │  4. 执行服务端代码                                    │   │
│  │  5. 访问数据库/文件系统                               │   │
│  │  6. 返回结果                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│              ↓ 自动处理                                     │
│  Client Component                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  7. 处理返回值                                       │   │
│  │  8. 更新UI（如需要）                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Server Actions的优势

| 特性 | API Routes | Server Actions |
|------|-----------|----------------|
| **代码量** | 较多 | 较少 |
| **类型安全** | 需要手动 | 自动 |
| **表单处理** | 需要手动处理 | 原生支持 |
| **重验证** | 需要手动调用 | 集成 |
| **错误处理** | 手动处理 | 自动 |
| **加载状态** | 需要管理 | 自动 |
| **代码复用** | 较难 | 容易 |

### Server Actions基础

#### 1. 'use server'指令

**在独立文件中定义**：

```typescript
// app/actions.ts
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const post = await db.post.create({
    data: { title, content },
  })

  revalidatePath('/blog')
  redirect(`/blog/${post.slug}`)
}
```

**在Server Component中定义**：

```typescript
// app/page.tsx
import { db } from '@/lib/db'

export default function Page() {
  async function createPost(formData: FormData) {
    'use server'

    const title = formData.get('title') as string
    const content = formData.get('content') as string

    await db.post.create({
      data: { title, content },
    })
  }

  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">创建</button>
    </form>
  )
}
```

#### 2. 在Client Components中使用

```typescript
// components/CreatePostForm.tsx
'use client'

import { useTransition } from 'react'
import { createPost } from '@/app/actions'

export default function CreatePostForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createPost(formData)
    })
  }

  return (
    <form action={handleSubmit}>
      <input name="title" disabled={isPending} />
      <textarea name="content" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? '创建中...' : '创建'}
      </button>
    </form>
  )
}
```

### 表单处理

#### 1. 基础表单提交

```typescript
// app/actions.ts
'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// 验证schema
const PostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多200个字符'),
  content: z.string().min(1, '内容不能为空'),
  categoryId: z.string().uuid('无效的分类ID'),
})

export async function createPost(prevState: any, formData: FormData) {
  // 验证数据
  const validatedFields = PostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    categoryId: formData.get('categoryId'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '创建失败，请检查表单',
    }
  }

  const { title, content, categoryId } = validatedFields.data

  try {
    const post = await db.post.create({
      data: {
        title,
        content,
        categoryId,
      },
    })

    revalidatePath('/blog')
    return {
      message: '文章创建成功',
      post,
    }
  } catch (error) {
    return {
      message: '数据库错误，创建失败',
    }
  }
}
```

#### 2. 带错误处理的表单

```typescript
// components/PostForm.tsx
'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { createPost } from '@/app/actions'

const initialState = {
  message: '',
  errors: {},
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
    >
      {pending ? '提交中...' : '提交'}
    </button>
  )
}

export default function PostForm() {
  const [state, formAction] = useFormState(createPost, initialState)

  return (
    <form action={formAction} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          标题
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className="w-full px-3 py-2 border rounded-lg"
          aria-describedby="title-error"
        />
        {state.errors?.title && (
          <p id="title-error" className="mt-1 text-sm text-red-600">
            {state.errors.title[0]}
          </p>
        )}
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          内容
        </label>
        <textarea
          id="content"
          name="content"
          rows={10}
          className="w-full px-3 py-2 border rounded-lg"
          aria-describedby="content-error"
        />
        {state.errors?.content && (
          <p id="content-error" className="mt-1 text-sm text-red-600">
            {state.errors.content[0]}
          </p>
        )}
      </div>

      {/* Message */}
      {state.message && (
        <div
          className={`p-3 rounded-lg ${
            state.errors && Object.keys(state.errors).length > 0
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
```

#### 3. 文件上传

```typescript
// app/actions.ts
'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'
import { revalidatePath } from 'next/cache'

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File

  if (!file) {
    return { error: '没有选择文件' }
  }

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { error: '只支持JPG、PNG、WebP格式' }
  }

  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    return { error: '文件大小不能超过5MB' }
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // 生成唯一文件名
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  const filename = file.name.replace(/\.[^/.]+$/, "") + '-' + uniqueSuffix + '.' + file.name.split('.').pop()

  // 保存文件
  const path = join(process.cwd(), 'public', 'uploads', filename)
  await writeFile(path, buffer)

  revalidatePath('/uploads')

  return {
    success: true,
    url: `/uploads/${filename}`,
  }
}
```

### 实战案例：用户注册系统

创建一个完整的用户注册系统，包括表单验证、错误处理和重定向。

#### 1. 注册Action

```typescript
// app/actions/auth.ts
'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { signIn } from 'next-auth/react'

const RegisterSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').max(50, '姓名最多50个字符'),
  email: z.string().email('无效的邮箱地址'),
  password: z.string().min(8, '密码至少8个字符').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    '密码必须包含大小写字母和数字'
  ),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
})

export async function register(prevState: any, formData: FormData) {
  // 验证数据
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '注册失败，请检查表单',
    }
  }

  const { name, email, password } = validatedFields.data

  try {
    // 检查邮箱是否已存在
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        message: '该邮箱已被注册',
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // 创建默认设置
    await db.userSettings.create({
      data: {
        userId: user.id,
      },
    })

    revalidatePath('/login')
    redirect('/login?registered=true')
  } catch (error) {
    return {
      message: '注册失败，请稍后重试',
    }
  }
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      return {
        message: '邮箱或密码错误',
      }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
  } catch (error) {
    return {
      message: '登录失败，请稍后重试',
    }
  }
}
```

#### 2. 注册表单组件

```typescript
// components/auth/RegisterForm.tsx
'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { register } from '@/app/actions/auth'
import Link from 'next/link'

const initialState = {
  message: '',
  errors: {},
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          注册中...
        </span>
      ) : (
        '注册'
      )}
    </button>
  )
}

export default function RegisterForm() {
  const [state, formAction] = useFormState(register, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            创建账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            已有账户？
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
              立即登录
            </Link>
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                姓名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="张三"
                aria-describedby="name-error"
              />
              {state.errors?.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                aria-describedby="email-error"
              />
              {state.errors?.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {state.errors?.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                aria-describedby="confirmPassword-error"
              />
              {state.errors?.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </div>
          </div>

          {/* Message */}
          {state.message && (
            <div
              className={`p-4 rounded-lg ${
                state.errors && Object.keys(state.errors).length > 0
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {state.message}
            </div>
          )}

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              我同意
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 mx-1">
                服务条款
              </Link>
              和
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 mx-1">
                隐私政策
              </Link>
            </label>
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  )
}
```

### Server Actions最佳实践

#### 1. 错误处理

```typescript
'use server'

export async function action(prevState: any, formData: FormData) {
  try {
    // 业务逻辑
    return { success: true }
  } catch (error) {
    console.error('Action error:', error)
    return {
      success: false,
      message: '操作失败，请稍后重试',
    }
  }
}
```

#### 2. 数据验证

```typescript
'use server'

import { z } from 'zod'

const Schema = z.object({
  // 定义schema
})

export async function action(prevState: any, formData: FormData) {
  const validatedFields = Schema.safeParse({
    // 验证数据
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // 处理验证后的数据
}
```

#### 3. 重新验证数据

```typescript
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function updatePost(id: string, data: any) {
  // 更新数据

  // 重新验证路径
  revalidatePath('/blog')
  revalidatePath(`/blog/${id}`)

  // 或重新验证标签
  revalidateTag('posts')
}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| Server Actions基础 | 'use server'指令、工作原理 | 理解核心概念 |
| 表单处理 | FormData、验证、错误处理 | 掌握实现方法 |
| 文件上传 | 文件处理、验证 | 能够实现 |
| 实战应用 | 用户注册系统 | 能够独立开发 |

---

**下一步学习**：建议继续学习[表单处理与验证](./chapter-94)深入了解表单系统。
