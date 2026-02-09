# 全栈开发实战

## 全栈开发实战

> **学习目标**：掌握使用Next.js 15构建完整全栈应用
> **核心内容**：全栈架构、数据库集成、API开发、实战项目

### 全栈应用架构

#### 技术栈选择

```
┌─────────────────────────────────────────────────────────────┐
│              Next.js 全栈应用技术栈                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  前端层                                                     │
│  ├─ React 19                                               │
│  ├─ Tailwind CSS                                           │
│  ├─ shadcn/ui                                              │
│  └─ React Hook Form                                        │
│                                                             │
│  后端层                                                     │
│  ├─ Next.js API Routes                                     │
│  ├─ Server Actions                                         │
│  └─ Prisma ORM                                             │
│                                                             │
│  数据库                                                     │
│  ├─ PostgreSQL（主数据库）                                  │
│  ├─ Redis（缓存）                                          │
│  └─ S3（文件存储）                                          │
│                                                             │
│  认证                                                       │
│  ├─ NextAuth.js                                            │
│  ├─ JWT                                                    │
│  └─ Session                                                │
│                                                             │
│  部署                                                       │
│  └─ Vercel                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 项目结构

```bash
my-saas-app/
├── app/                          # App Router
│   ├── (auth)/                   # 认证路由组
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # 仪表盘路由组
│   │   ├── dashboard/
│   │   ├── projects/
│   │   └── settings/
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── projects/
│   │   └── webhooks/
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # React组件
│   ├── ui/                       # UI组件
│   ├── forms/                    # 表单组件
│   └── layouts/                  # 布局组件
├── lib/                          # 工具库
│   ├── db.ts                     # 数据库配置
│   ├── auth.ts                   # 认证配置
│   ├── utils.ts                  # 工具函数
│   └── validations.ts            # 验证schema
├── prisma/                       # Prisma
│   └── schema.prisma
├── public/                       # 静态资源
└── types/                        # TypeScript类型
```

---

### 数据库集成

#### Prisma配置

```bash
# 安装Prisma
npm install prisma @prisma/client
npx prisma init
```

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户模型
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 关系
  projects      Project[]
  sessions      Session[]
  accounts      Account[]

  @@index([email])
}

enum Role {
  USER
  ADMIN
}

// 项目模型
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks       Task[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

// 任务模型
model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assigneeId  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([projectId])
  @@index([assigneeId])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

// 会话模型
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// 账户模型（OAuth）
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
```

```bash
# 创建数据库迁移
npx prisma migrate dev --name init

# 生成Prisma Client
npx prisma generate
```

#### 数据库连接

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 使用示例
export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      projects: true
    }
  })
}

export async function createProject(data: {
  name: string
  description?: string
  userId: string
}) {
  return prisma.project.create({
    data,
    include: {
      user: true
    }
  })
}
```

---

### API开发

#### Server Actions

```typescript
// app/actions/projects.ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

// 验证schema
const createProjectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(100),
  description: z.string().max(500).optional()
})

export type ProjectState = {
  errors?: {
    name?: string[]
    description?: string[]
  }
  message?: string
  success?: boolean
}

// 创建项目
export async function createProject(
  prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      message: '请先登录'
    }
  }

  // 验证表单
  const validatedFields = createProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '验证失败'
    }
  }

  try {
    // 创建项目
    await prisma.project.create({
      data: {
        ...validatedFields.data,
        userId: session.user.id
      }
    })

    // 重新验证缓存
    revalidatePath('/dashboard/projects')

    return {
      success: true,
      message: '项目创建成功'
    }
  } catch (error) {
    return {
      message: '创建失败，请重试'
    }
  }
}

// 更新项目
export async function updateProject(
  id: string,
  data: { name?: string; description?: string }
) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('未登录')
  }

  // 检查权限
  const project = await prisma.project.findUnique({
    where: { id }
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error('无权操作')
  }

  // 更新项目
  const updated = await prisma.project.update({
    where: { id },
    data
  })

  revalidatePath('/dashboard/projects')
  revalidatePath(`/dashboard/projects/${id}`)

  return updated
}

// 删除项目
export async function deleteProject(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('未登录')
  }

  // 检查权限
  const project = await prisma.project.findUnique({
    where: { id }
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error('无权操作')
  }

  // 删除项目（级联删除相关任务）
  await prisma.project.delete({
    where: { id }
  })

  revalidatePath('/dashboard/projects')

  return { success: true }
}
```

#### API Routes

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/projects - 获取项目列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    // 构建查询
    const where = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    // 获取总数
    const total = await prisma.project.count({ where })

    // 获取项目
    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json({
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取项目列表失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// POST /api/projects - 创建项目
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 验证
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: '项目名称不能为空' },
        { status: 400 }
      )
    }

    // 创建项目
    const project = await prisma.project.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim(),
        userId: session.user.id
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('创建项目失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
```

```typescript
// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/projects/:id - 获取单个项目
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        tasks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      )
    }

    // 检查权限
    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: '无权访问' },
        { status: 403 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('获取项目失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/:id - 更新项目
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 检查项目是否存在
    const existing = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      )
    }

    // 检查权限
    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: '无权操作' },
        { status: 403 }
      )
    }

    // 更新项目
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description })
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('更新项目失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/:id - 删除项目
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    // 检查项目是否存在
    const existing = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      )
    }

    // 检查权限
    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: '无权操作' },
        { status: 403 }
      )
    }

    // 删除项目
    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除项目失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
```

---

### 实战案例：完整SaaS应用

#### 项目管理应用

```typescript
// app/dashboard/projects/page.tsx
import Link from 'next/link'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { CreateProjectButton } from '@/components/projects/create-project-button'

export default async function ProjectsPage({
  searchParams
}: {
  searchParams: { page?: string; search?: string }
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const limit = 12

  // 获取项目
  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    },
    include: {
      _count: {
        select: { tasks: true }
      }
    },
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit
  })

  const total = await prisma.project.count({
    where: {
      userId: session.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">我的项目</h1>
          <p className="text-gray-600 mt-2">
            共 {total} 个项目
          </p>
        </div>

        <CreateProjectButton />
      </div>

      {search && (
        <div className="mb-6">
          搜索结果: "{search}" ({total} 个)
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {search ? '未找到匹配的项目' : '还没有项目'}
          </p>
          {!search && <CreateProjectButton />}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <h3 className="text-xl font-semibold mb-2">
                {project.name}
              </h3>

              {project.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{project._count.tasks} 个任务</span>
                <time>
                  {new Date(project.updatedAt).toLocaleDateString()}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 分页 */}
      {total > limit && (
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/dashboard/projects?page=${page - 1}${search ? `&search=${search}` : ''}`}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                上一页
              </Link>
            )}

            <span className="px-4 py-2">
              第 {page} 页，共 {Math.ceil(total / limit)} 页
            </span>

            {page < Math.ceil(total / limit) && (
              <Link
                href={`/dashboard/projects?page=${page + 1}${search ? `&search=${search}` : ''}`}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                下一页
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

```typescript
// app/dashboard/projects/[id]/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { TaskList } from '@/components/tasks/task-list'
import { CreateTaskButton } from '@/components/tasks/create-task-button'

export default async function ProjectPage({
  params
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      tasks: {
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
      },
      user: {
        select: { name: true }
      }
    }
  })

  if (!project) {
    notFound()
  }

  if (project.userId !== session.user.id) {
    redirect('/dashboard/projects')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        {project.description && (
          <p className="text-gray-600">{project.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          任务 ({project.tasks.length})
        </h2>

        <CreateTaskButton projectId={project.id} />
      </div>

      <TaskList tasks={project.tasks} />
    </div>
  )
}
```

### 本章小结

| 功能 | 技术方案 | 说明 |
|------|---------|------|
| **数据库** | Prisma + PostgreSQL | 类型安全的ORM |
| **认证** | NextAuth.js | 完整的认证解决方案 |
| **API** | Server Actions + Route Handlers | 服务端功能 |
| **表单** | React Hook Form + Zod | 表单验证 |
| **UI** | shadcn/ui + Tailwind CSS | 现代化UI |

---

**下一步学习**：建议继续学习[部署与运维](./chapter-109)了解如何部署全栈应用。
