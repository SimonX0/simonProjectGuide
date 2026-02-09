# 路由Handler与API

## 路由Handler与API

> **学习目标**：掌握Next.js Route Handlers，构建完整的REST API
> **核心内容**：Route Handlers、REST API创建、动态API路由、实战案例

### Route Handlers

#### 什么是Route Handlers

**Route Handlers** 允许你在Next.js应用中创建API端点，使用Web标准API（Request和Response）。

```
┌─────────────────────────────────────────────────────────────┐
│                    Route Handlers 架构                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  客户端请求                                                 │
│       ↓                                                     │
│  ┌─────────────────────────────────────────┐              │
│  │         Route Handler (route.ts)         │              │
│  │  ┌──────────────────────────────────┐   │              │
│  │  │ GET    - 获取资源                 │   │              │
│  │  │ POST   - 创建资源                 │   │              │
│  │  │ PUT    - 更新资源（完整）         │   │              │
│  │  │ PATCH  - 更新资源（部分）         │   │              │
│  │  │ DELETE - 删除资源                 │   │              │
│  │  └──────────────────────────────────┘   │              │
│  └─────────────────────────────────────────┘              │
│       ↓                                                     │
│  数据库 / 外部API                                          │
│       ↓                                                     │
│  响应返回给客户端                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 基础Route Handler

**创建API端点**：

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
  ]

  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const body = await request.json()

  const newUser = {
    id: Date.now(),
    ...body,
  }

  return NextResponse.json(newUser, { status: 201 })
}
```

**支持HTTP方法**：

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'

// GET - 获取所有文章
export async function GET() {
  return NextResponse.json({ message: 'GET /api/posts' })
}

// POST - 创建文章
export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ message: 'POST /api/posts', body })
}

// PUT - 更新文章
export async function PUT(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ message: 'PUT /api/posts', body })
}

// DELETE - 删除文章
export async function DELETE() {
  return NextResponse.json({ message: 'DELETE /api/posts' })
}

// PATCH - 部分更新
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ message: 'PATCH /api/posts', body })
}

// HEAD - 获取头信息
export async function HEAD() {
  return new NextResponse(null, {
    headers: {
      'X-Custom-Header': 'value',
    },
  })

}

// OPTIONS - 获取支持的HTTP方法
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Allow': 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS',
    },
  })
}
```

### REST API创建

#### RESTful API设计

**资源路由结构**：

```
api/
├── users/
│   ├── route.ts              # GET /api/users, POST /api/users
│   ├── [id]/
│   │   ├── route.ts          # GET/PATCH/DELETE /api/users/[id]
│   │   └── posts/
│   │       └── route.ts      # GET /api/users/[id]/posts
│   └── stats/
│       └── route.ts          # GET /api/users/stats
└── posts/
    ├── route.ts              # GET /api/posts, POST /api/posts
    ├── [id]/
    │   ├── route.ts          # GET/PATCH/DELETE /api/posts/[id]
    │   └── comments/
    │       └── route.ts      # GET/POST /api/posts/[id]/comments
    └── latest/
        └── route.ts          # GET /api/posts/latest
```

#### 完整REST API示例

**用户API**：

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

// 模拟数据库
let users: any[] = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'user', createdAt: '2024-01-01' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: 'user', createdAt: '2024-01-02' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: 'admin', createdAt: '2024-01-03' },
]

// GET /api/users - 获取所有用户
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // 分页
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const start = (page - 1) * limit
  const end = start + limit

  // 过滤
  const role = searchParams.get('role')
  let filteredUsers = users
  if (role) {
    filteredUsers = users.filter(u => u.role === role)
  }

  // 排序
  const sort = searchParams.get('sort') || 'createdAt'
  const order = searchParams.get('order') || 'desc'
  filteredUsers.sort((a, b) => {
    const aVal = a[sort]
    const bVal = b[sort]
    return order === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
  })

  // 返回分页数据
  const paginatedUsers = filteredUsers.slice(start, end)

  return NextResponse.json({
    data: paginatedUsers,
    meta: {
      page,
      limit,
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit),
    },
  })
}

// POST /api/users - 创建用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证必填字段
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: '姓名和邮箱是必需的' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingUser = users.find(u => u.email === body.email)
    if (existingUser) {
      return NextResponse.json(
        { error: '邮箱已被使用' },
        { status: 409 }
      )
    }

    // 创建新用户
    const newUser = {
      id: Date.now(),
      name: body.name,
      email: body.email,
      role: body.role || 'user',
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: '无效的JSON数据' },
      { status: 400 }
    )
  }
}
```

**单个用户API**：

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { notFound } from 'next/navigation'

let users: any[] = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'user' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: 'user' },
]

// GET /api/users/[id] - 获取单个用户
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(await params.id, 10)
  const user = users.find(u => u.id === id)

  if (!user) {
    return NextResponse.json(
      { error: '用户不存在' },
      { status: 404 }
    )
  }

  return NextResponse.json(user)
}

// PATCH /api/users/[id] - 更新用户
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(await params.id, 10)
  const userIndex = users.findIndex(u => u.id === id)

  if (userIndex === -1) {
    return NextResponse.json(
      { error: '用户不存在' },
      { status: 404 }
    )
  }

  try {
    const body = await request.json()

    // 更新用户
    users[userIndex] = {
      ...users[userIndex],
      ...body,
      id, // 确保ID不被修改
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(users[userIndex])
  } catch (error) {
    return NextResponse.json(
      { error: '无效的JSON数据' },
      { status: 400 }
    )
  }
}

// DELETE /api/users/[id] - 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(await params.id, 10)
  const userIndex = users.findIndex(u => u.id === id)

  if (userIndex === -1) {
    return NextResponse.json(
      { error: '用户不存在' },
      { status: 404 }
    )
  }

  // 删除用户
  users.splice(userIndex, 1)

  return new NextResponse(null, { status: 204 })
}
```

### 动态API路由

#### 嵌套路由

**用户文章API**：

```typescript
// app/api/users/[userId]/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'

// GET /api/users/[userId]/posts - 获取用户的文章
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = await params.userId

  // 模拟获取用户的文章
  const posts = [
    { id: 1, userId, title: '第一篇文章', content: '...' },
    { id: 2, userId, title: '第二篇文章', content: '...' },
  ]

  return NextResponse.json(posts)
}

// POST /api/users/[userId]/posts - 为用户创建文章
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = await params.userId
  const body = await request.json()

  const newPost = {
    id: Date.now(),
    userId,
    ...body,
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json(newPost, { status: 201 })
}
```

**多层嵌套**：

```typescript
// app/api/users/[userId]/posts/[postId]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server'

// GET /api/users/[userId]/posts/[postId]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; postId: string } }
) {
  const { userId, postId } = await params

  const comments = [
    { id: 1, userId, postId, content: '很好的文章！' },
    { id: 2, userId, postId, content: '学到了很多' },
  ]

  return NextResponse.json(comments)
}
```

### 实战案例：完整API系统

让我们创建一个博客API系统。

#### 1. 项目结构

```
app/api/
├── auth/
│   ├── login/
│   │   └── route.ts
│   └── logout/
│       └── route.ts
├── posts/
│   ├── route.ts                  # GET, POST
│   ├── [id]/
│   │   └── route.ts              # GET, PATCH, DELETE
│   └── [id]/
│       └── comments/
│           └── route.ts          # GET, POST
└── categories/
    └── route.ts                  # GET, POST
```

#### 2. 文章API

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'

// 模拟数据库
let posts: any[] = [
  {
    id: 1,
    title: 'Next.js 14 新特性',
    content: '详细的Markdown内容...',
    excerpt: '深入了解Next.js 14的新特性',
    author: '张三',
    category: 'Next.js',
    tags: ['Next.js', 'React', 'Web开发'],
    status: 'published',
    views: 1234,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'TypeScript 最佳实践',
    content: '详细的Markdown内容...',
    excerpt: '提升代码质量的TypeScript技巧',
    author: '李四',
    category: 'TypeScript',
    tags: ['TypeScript', 'JavaScript', '编程'],
    status: 'published',
    views: 5678,
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
  },
]

// GET /api/posts - 获取文章列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // 查询参数
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const category = searchParams.get('category')
  const status = searchParams.get('status') || 'published'
  const search = searchParams.get('search')
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  let filteredPosts = [...posts]

  // 状态过滤
  if (status) {
    filteredPosts = filteredPosts.filter(p => p.status === status)
  }

  // 分类过滤
  if (category) {
    filteredPosts = filteredPosts.filter(p => p.category === category)
  }

  // 搜索过滤
  if (search) {
    const searchLower = search.toLowerCase()
    filteredPosts = filteredPosts.filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      p.content.toLowerCase().includes(searchLower) ||
      p.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
    )
  }

  // 排序
  filteredPosts.sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    return sortOrder === 'asc'
      ? (aVal > bVal ? 1 : -1)
      : (aVal < bVal ? 1 : -1)
  })

  // 分页
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedPosts = filteredPosts.slice(start, end)

  return NextResponse.json({
    data: paginatedPosts,
    meta: {
      page,
      limit,
      total: filteredPosts.length,
      totalPages: Math.ceil(filteredPosts.length / limit),
      hasMore: end < filteredPosts.length,
    },
  })
}

// POST /api/posts - 创建文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证必填字段
    if (!body.title || !body.content || !body.author) {
      return NextResponse.json(
        {
          error: '验证失败',
          details: {
            title: !body.title ? '标题是必需的' : undefined,
            content: !body.content ? '内容是必需的' : undefined,
            author: !body.author ? '作者是必需的' : undefined,
          },
        },
        { status: 400 }
      )
    }

    // 创建文章
    const newPost = {
      id: Date.now(),
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || body.content.substring(0, 150) + '...',
      author: body.author,
      category: body.category || '未分类',
      tags: body.tags || [],
      status: body.status || 'draft',
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    posts.push(newPost)

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: '无效的JSON数据' },
      { status: 400 }
    )
  }
}
```

#### 3. 单个文章API

```typescript
// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

let posts: any[] = [
  {
    id: 1,
    title: 'Next.js 14 新特性',
    content: '详细的Markdown内容...',
    author: '张三',
    views: 1234,
  },
]

// GET /api/posts/[id] - 获取单个文章
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(await params.id, 10)
  const post = posts.find(p => p.id === id)

  if (!post) {
    return NextResponse.json(
      { error: '文章不存在' },
      { status: 404 }
    )
  }

  // 增加阅读量
  post.views += 1

  return NextResponse.json(post)
}

// PATCH /api/posts/[id] - 更新文章
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(await params.id, 10)
  const postIndex = posts.findIndex(p => p.id === id)

  if (postIndex === -1) {
    return NextResponse.json(
      { error: '文章不存在' },
      { status: 404 }
    )
  }

  try {
    const body = await request.json()

    // 更新文章
    posts[postIndex] = {
      ...posts[postIndex],
      ...body,
      id, // 确保ID不被修改
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(posts[postIndex])
  } catch (error) {
    return NextResponse.json(
      { error: '无效的JSON数据' },
      { status: 400 }
    )
  }
}

// DELETE /api/posts/[id] - 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(await params.id, 10)
  const postIndex = posts.findIndex(p => p.id === id)

  if (postIndex === -1) {
    return NextResponse.json(
      { error: '文章不存在' },
      { status: 404 }
    )
  }

  // 删除文章
  posts.splice(postIndex, 1)

  return new NextResponse(null, { status: 204 })
}
```

#### 4. 评论API

```typescript
// app/api/posts/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server'

let comments: any[] = [
  { id: 1, postId: 1, user: '张三', content: '很好的文章！', createdAt: '2024-01-15' },
  { id: 2, postId: 1, user: '李四', content: '学到了很多', createdAt: '2024-01-15' },
]

// GET /api/posts/[id]/comments - 获取文章评论
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = parseInt(await params.id, 10)
  const postComments = comments.filter(c => c.postId === postId)

  return NextResponse.json({
    data: postComments,
    total: postComments.length,
  })
}

// POST /api/posts/[id]/comments - 添加评论
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = parseInt(await params.id, 10)

  try {
    const body = await request.json()

    if (!body.user || !body.content) {
      return NextResponse.json(
        { error: '用户和评论内容是必需的' },
        { status: 400 }
      )
    }

    const newComment = {
      id: Date.now(),
      postId,
      user: body.user,
      content: body.content,
      createdAt: new Date().toISOString(),
    }

    comments.push(newComment)

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: '无效的JSON数据' },
      { status: 400 }
    )
  }
}
```

### 最佳实践

#### 1. 错误处理

```typescript
// ✅ 推荐：统一的错误响应
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
```

#### 2. 验证

```typescript
// ✅ 推荐：请求数据验证
export async function POST(request: NextRequest) {
  const body = await request.json()

  // 验证必填字段
  const requiredFields = ['title', 'content']
  const missingFields = requiredFields.filter(field => !body[field])

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        error: '验证失败',
        details: missingFields.map(field => ({
          field,
          message: `${field} 是必需的`,
        })),
      },
      { status: 400 }
    )
  }

  // 处理数据...
}
```

#### 3. CORS配置

```typescript
// ✅ 推荐：配置CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: '...' })
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| Route Handlers | route.ts文件 | 熟练掌握 |
| HTTP方法 | GET, POST, PUT, PATCH, DELETE | 熟练掌握 |
| REST API | 资源路由设计 | 掌握 |
| 动态路由 | [id]参数 | 掌握 |
| 错误处理 | 统一错误响应 | 掌握 |
| 实际应用 | 完整API系统 | 能够实现 |

---

**下一步学习**：建议继续学习[Tailwind CSS集成](./chapter-102)了解样式系统。
