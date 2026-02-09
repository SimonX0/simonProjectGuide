---
title: Next.js 企业级实战项目2
description: Next.js 15 企业级CMS系统
---

# ：Next.js 15 完全实战项目 - 企业级CMS系统

> **项目概述**：本项目是一个功能完整的企业级内容管理系统（CMS），支持多语言、多站点、角色权限、工作流、版本控制等企业级功能。
>
> **学习目标**：
> - 掌握企业级CMS系统的架构设计
> - 熟练使用Next.js 15实现复杂的内容管理
> - 掌握多租户、多语言、权限管理系统
> - 学会工作流引擎、版本控制、预览发布

---

## 项目介绍

### 项目背景

本企业级CMS系统是一个完整的Web内容管理解决方案，主要功能包括：

- ✅ **内容管理**：文章、页面、媒体库、分类标签
- ✅ **多语言支持**：i18n国际化、多语言内容管理
- ✅ **多站点管理**：统一后台管理多个站点
- ✅ **权限管理**：RBAC、内容权限、操作权限
- ✅ **工作流引擎**：内容审核、发布流程、状态机
- ✅ **版本控制**：内容历史、版本对比、回滚
- ✅ **预览发布**：内容预览、定时发布、一键发布
- ✅ **API接口**：RESTful API、GraphQL API

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **框架** | Next.js | 15.x |
| **语言** | TypeScript | 5.x |
| **UI库** | shadcn/ui | latest |
| **富文本** | Tiptap | latest |
| **表单** | React Hook Form + Zod | latest |
| **数据库** | PostgreSQL + Prisma | latest |
| **缓存** | Redis | latest |
| **搜索** | Elasticsearch | latest |
| **队列** | Bull + Redis | latest |
| **存储** | S3 compatible | latest |
| **认证** | NextAuth.js | 5.x |

### 项目结构

```
nextjs-cms/
├── app/                          # App Router
│   ├── (dashboard)/              # 仪表盘路由组
│   │   ├── dashboard/
│   │   ├── content/              # 内容管理
│   │   │   ├── posts/
│   │   │   ├── pages/
│   │   │   ├── media/
│   │   │   └── categories/
│   │   ├── settings/             # 系统设置
│   │   └── users/                # 用户管理
│   ├── (preview)/                # 预览路由组
│   ├── api/                      # API Routes
│   │   ├── content/
│   │   ├── media/
│   │   ├── search/
│   │   └── webhook/
│   └── layout.tsx
├── components/                   # 组件
│   ├── editor/                   # 富文本编辑器
│   ├── media/                    # 媒体库
│   ├── workflow/                 # 工作流
│   └── preview/                  # 预览
├── lib/                          # 工具库
│   ├── cms/                      # CMS核心
│   │   ├── content.ts
│   │   ├── workflow.ts
│   │   └── version.ts
│   ├── db/                       # Prisma
│   ├── auth.ts                   # NextAuth
│   └── utils.ts
├── prisma/                       # 数据库
│   └── schema.prisma
└── jobs/                         # 后台任务
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

// 站点
model Site {
  id          String   @id @default(cuid())
  name        String
  domain      String   @unique
  locale      String   @default("zh-CN")
  status      SiteStatus @default(ACTIVE)
  posts       Post[]
  pages       Page[]
  categories  Category[]
  users       UserSite[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum SiteStatus {
  ACTIVE
  SUSPENDED
}

// 内容
model Content {
  id          String      @id @default(cuid())
  type        ContentType
  title       String
  slug        String
  content     Json        @default("{}")
  excerpt     String?
  featuredImage String?
  status      ContentStatus @default(DRAFT)
  locale      String      @default("zh-CN")
  translations Json?       // 关联的其他语言版本
  seo         Json?       // SEO元数据
  siteId      String
  site        Site        @relation(fields: [siteId], references: [id], onDelete: Cascade)
  authorId    String
  categories  ContentCategory[]
  tags        ContentTag[]
  versions    Version[]
  workflows   WorkflowExecution[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  publishedAt DateTime?

  @@unique([siteId, slug])
  @@index([type, status])
}

enum ContentType {
  POST
  PAGE
}

enum ContentStatus {
  DRAFT
  PENDING
  PUBLISHED
  ARCHIVED
}

// 分类
model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String
  description String?
  siteId      String
  site        Site      @relation(fields: [siteId], references: [id], onDelete: Cascade)
  parentId    String?
  parent      Category? @relation("CategoryToCategory", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryToCategory")
  contents    ContentCategory[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([siteId, slug])
}

// 标签
model Tag {
  id        String          @id @default(cuid())
  name      String
  slug      String
  siteId    String
  contents  ContentTag[]

  @@unique([siteId, slug])
}

// 版本
model Version {
  id          String   @id @default(cuid())
  contentId   String
  content     Content  @relation(fields: [contentId], references: [id], onDelete: Cascade)
  version     Int
  data        Json
  createdBy   String
  createdAt   DateTime @default(now())

  @@index([contentId, version])
}

// 工作流执行
model WorkflowExecution {
  id          String           @id @default(cuid())
  contentId   String
  content     Content          @relation(fields: [contentId], references: [id], onDelete: Cascade)
  workflow    WorkflowDefinition @relation(fields: [workflowId], references: [id])
  workflowId  String
  status      ExecutionStatus  @default(PENDING)
  input       Json?
  output      Json?
  createdBy   String
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model WorkflowDefinition {
  id          String              @id @default(cuid())
  name        String
  description String?
  definition  Json                // 工作流定义
  executions  WorkflowExecution[]
  isActive    Boolean             @default(true)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}

enum ExecutionStatus {
  PENDING
  APPROVED
  REJECTED
}

// 媒体库
model Media {
  id          String   @id @default(cuid())
  filename    String
  url         String
  mimeType    String
  size        Int
  width       Int?
  height      Int?
  alt         String?
  caption     String?
  siteId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([siteId])
}

// 关联表
model ContentCategory {
  contentId   String
  content     Content @relation(fields: [contentId], references: [id], onDelete: Cascade)
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([contentId, categoryId])
}

model ContentTag {
  contentId String
  content   Content @relation(fields: [contentId], references: [id], onDelete: Cascade)
  tagId     String
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([contentId, tagId])
}

model UserSite {
  userId   String
  siteId   String
  role     SiteRole @default(CONTRIBUTOR)
  site     Site    @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@id([userId, siteId])
}

enum SiteRole {
  OWNER
  ADMIN
  EDITOR
  AUTHOR
  CONTRIBUTOR
}
```

---

## 核心功能实现

### 1. 富文本编辑器

```tsx
// components/editor/TiptapEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useDebouncedCallback } from 'use-debounce'

interface TiptapEditorProps {
  content: any
  onChange: (content: any) => void
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      const html = editor.getHTML()
      onChange({ json, html })
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-lg">
      {/* 工具栏 */}
      <div className="border-b p-2 flex gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-blue-100' : ''}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-blue-100' : ''}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-blue-100' : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-blue-100' : ''}
        >
          H2
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter image URL')
            if (url) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          }}
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 编辑器 */}
      <EditorContent editor={editor} />
    </div>
  )
}
```

### 2. 多语言内容管理

```tsx
// components/content/MultiLanguageEditor.tsx
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const locales = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en-US', name: 'English' },
  { code: 'ja-JP', name: '日本語' },
]

export function MultiLanguageEditor({ initialContent }) {
  const [activeLocale, setActiveLocale] = useState('zh-CN')
  const [contents, setContents] = useState(initialContent || {})

  const updateContent = (locale: string, data: any) => {
    setContents((prev) => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        ...data,
      },
    }))
  }

  return (
    <Tabs value={activeLocale} onValueChange={setActiveLocale}>
      <TabsList>
        {locales.map((locale) => (
          <TabsTrigger key={locale.code} value={locale.code}>
            {locale.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {locales.map((locale) => (
        <TabsContent key={locale.code} value={locale.code}>
          <ContentForm
            content={contents[locale.code]}
            onChange={(data) => updateContent(locale.code, data)}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
```

### 3. 版本控制

```typescript
// lib/cms/version.ts
import { prisma } from '@/lib/db'
import { difference } from '@atlaskit/adf-utils'

export class VersionControl {
  async createVersion(contentId: string, data: any, userId: string) {
    // 获取最新版本号
    const latest = await prisma.version.findFirst({
      where: { contentId },
      orderBy: { version: 'desc' },
    })

    const version = (latest?.version || 0) + 1

    // 创建新版本
    const newVersion = await prisma.version.create({
      data: {
        contentId,
        version,
        data,
        createdBy: userId,
      },
    })

    return newVersion
  }

  async getVersionDiff(contentId: string, version1: number, version2: number) {
    const [v1, v2] = await Promise.all([
      prisma.version.findFirst({
        where: { contentId, version: version1 },
      }),
      prisma.version.findFirst({
        where: { contentId, version: version2 },
      }),
    ])

    // 计算差异
    const diff = difference(v1.data, v2.data)

    return {
      version1: v1,
      version2: v2,
      diff,
    }
  }

  async rollback(contentId: string, version: number) {
    const targetVersion = await prisma.version.findFirst({
      where: { contentId, version },
    })

    // 恢复内容
    await prisma.content.update({
      where: { id: contentId },
      data: {
        content: targetVersion.data,
      },
    })

    // 创建新的版本记录
    return this.createVersion(contentId, targetVersion.data, 'system')
  }
}
```

### 4. 工作流引擎

```typescript
// lib/cms/workflow.ts
import { prisma } from '@/lib/db'

export class WorkflowEngine {
  async startWorkflow(contentId: string, workflowId: string, userId: string) {
    const workflow = await prisma.workflowDefinition.findUnique({
      where: { id: workflowId },
    })

    const execution = await prisma.workflowExecution.create({
      data: {
        contentId,
        workflowId,
        status: 'PENDING',
        createdBy: userId,
      },
    })

    // 执行工作流
    await this.executeWorkflow(execution, workflow.definition)

    return execution
  }

  private async executeWorkflow(execution: any, definition: any) {
    const { steps } = definition

    for (const step of steps) {
      switch (step.type) {
        case 'approval':
          await this.handleApprovalStep(execution, step)
          break
        case 'notification':
          await this.handleNotificationStep(execution, step)
          break
        case 'condition':
          const result = await this.evaluateCondition(step.condition)
          if (result) {
            await this.executeWorkflow(execution, step.then)
          } else {
            await this.executeWorkflow(execution, step.else)
          }
          break
      }
    }
  }

  private async handleApprovalStep(execution: any, step: any) {
    // 发送审批通知
    await this.sendNotification(step.approvers, {
      type: 'approval',
      contentId: execution.contentId,
      executionId: execution.id,
    })

    // 等待审批结果
    await new Promise((resolve) => {
      // 监听审批结果
    })
  }

  private async handleNotificationStep(execution: any, step: any) {
    await this.sendNotification(step.recipients, {
      type: 'notification',
      message: step.message,
    })
  }
}
```

### 5. 内容预览

```tsx
// app/(preview)/preview/[id]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

export default async function PreviewPage({
  params,
}: {
  params: { id: string }
}) {
  const content = await prisma.content.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      categories: true,
      tags: true,
    },
  })

  if (!content) {
    notFound()
  }

  return (
    <div className="preview-container">
      {/* 预览工具栏 */}
      <div className="preview-toolbar">
        <span>预览模式</span>
        <button onClick={() => window.close()}>关闭</button>
      </div>

      {/* 内容渲染 */}
      <article className="prose max-w-none">
        <h1>{content.title}</h1>
        <div
          dangerouslySetInnerHTML={{
            __html: content.content.html || '',
          }}
        />
      </article>
    </div>
  )
}
```

### 6. 媒体库

```tsx
// components/media/MediaLibrary.tsx
'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'

export function MediaLibrary() {
  const [files, setFiles] = useState([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.mov'],
    },
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        await uploadFile(file)
      }
    },
  })

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    setFiles((prev) => [...prev, data])
  }

  return (
    <div>
      {/* 上传区域 */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>拖放文件到这里...</p>
        ) : (
          <p>拖放文件到这里，或点击选择文件</p>
        )}
      </div>

      {/* 文件列表 */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        {files.map((file) => (
          <div key={file.id} className="border rounded-lg p-2">
            {file.mimeType.startsWith('image/') ? (
              <img src={file.url} alt={file.filename} />
            ) : (
              <video src={file.url} controls />
            )}
            <p className="text-sm mt-2 truncate">{file.filename}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 7. 搜索功能

```typescript
// app/api/search/route.ts
import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
})

export async function POST(req: Request) {
  const { query, locale, siteId } = await req.json()

  const result = await client.search({
    index: 'contents',
    body: {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['title^2', 'content'],
              },
            },
            { term: { locale } },
            { term: { siteId } },
          ],
        },
      },
      highlight: {
        fields: {
          title: {},
          content: {},
        },
      },
    },
  })

  return Response.json({
    results: result.hits.hits,
    total: result.hits.total.value,
  })
}
```

---

## 性能优化

### 1. 增量静态再生

```typescript
// app/posts/[slug]/page.tsx
export const revalidate = 3600 // 1小时

export async function generateStaticParams() {
  const posts = await prisma.content.findMany({
    where: { type: 'POST', status: 'PUBLISHED' },
    select: { slug: true },
  })

  return posts.map((post) => ({
    slug: post.slug,
  }))
}
```

### 2. 图片优化

```tsx
import Image from 'next/image'

<Image
  src={content.featuredImage}
  alt={content.title}
  width={1200}
  height={630}
  priority
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 3. 缓存策略

```typescript
// lib/cache.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function getCached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }

  const data = await fn()
  await redis.setex(key, ttl, JSON.stringify(data))
  return data
}
```

---

## 部署上线

### 1. Docker 部署

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### 2. 环境变量

```bash
# .env.production
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
REDIS_URL=
ELASTICSEARCH_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

---

## 项目总结

本项目涵盖了企业级CMS系统开发的核心技能：

✅ **技术栈**：Next.js 15 + TypeScript + Prisma + Redis
✅ **核心功能**：内容管理、富文本、媒体库、版本控制
✅ **企业特性**：多语言、多站点、工作流、权限管理
✅ **最佳实践**：SEO优化、性能优化、缓存策略

通过这个项目，你将掌握：
- 企业级CMS系统架构设计
- 复杂的内容管理功能实现
- 工作流引擎开发
- 版本控制系统
- 多语言多站点管理
- 搜索引擎集成

---

## 下一步学习

- [第27章：Next.js 15新特性](/guide/nextjs/chapter-107)
- [第28章：全栈开发实战](/guide/nextjs/chapter-108)
- [第29章：部署与运维](/guide/nextjs/chapter-109)
