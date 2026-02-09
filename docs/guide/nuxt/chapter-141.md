---
title: Nuxt 企业级实战项目2
description: Nuxt 4 实时协作平台开发
---

# ：Nuxt 4 完全实战项目 - 实时协作平台

> **项目概述**：本项目是一个基于 Nuxt 4 的实时协作平台，类似 Google Docs，支持多人实时编辑文档、实时聊天、视频会议等功能。
>
> **学习目标**：
> - 掌握 Nuxt 4 在实时应用开发中的应用
> - 熟练使用 WebSocket、Server-Sent Events
> - 掌握 OT（Operational Transformation）和 CRDT 算法
> - 学会实时同步、冲突解决、离线支持等高级特性

---

## 项目介绍

### 项目背景

本实时协作平台是一个现代化的团队协作工具，主要功能包括：

- ✅ **实时文档编辑**：多人同时编辑，实时同步
- ✅ **版本控制**：文档历史记录、回滚、恢复
- ✅ **实时聊天**：团队聊天、私信、表情
- ✅ **视频会议**：屏幕共享、白板协作
- ✅ **评论与批注**：文档评论、@提醒、批注
- ✅ **权限管理**：查看、编辑、管理权限
- ✅ **离线支持**：IndexedDB 本地存储、自动同步

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **框架** | Nuxt | 4.x |
| **语言** | TypeScript | 5.x |
| **UI库** | Nuxt UI | latest |
| **实时通信** | Socket.io / SSE | latest |
| **编辑器** | TipTap / ProseMirror | latest |
| **数据库** | PostgreSQL + Prisma | latest |
| **缓存** | Redis | latest |
| **队列** | Bull | latest |
| **存储** | S3 compatible | latest |
| **WebRTC** | Simple-Peer | latest |

### 项目结构

```
nuxt-collab-platform/
├── app/                          # Nuxt App
│   ├── components/               # 组件
│   │   ├── editor/               # 编辑器组件
│   │   ├── chat/                 # 聊天组件
│   │   ├── video/                # 视频会议组件
│   │   └── comments/             # 评论组件
│   ├── composables/              # 组合式函数
│   │   ├── useEditor.ts
│   │   ├── useWebSocket.ts
│   │   └── usePresence.ts
│   ├── stores/                   # Pinia 状态管理
│   │   ├── documents.ts
│   │   ├── users.ts
│   │   └── notifications.ts
│   ├── server/                   # 服务端代码
│   │   ├── api/                  # API Routes
│   │   ├── routes/               # Nitro Routes
│   │   └── socket/               # WebSocket 处理
│   ├── types/                    # TypeScript 类型
│   ├── utils/                    # 工具函数
│   └── plugins/                  # Nuxt 插件
├── prisma/                       # 数据库
│   └── schema.prisma
├── public/                       # 静态资源
└── nuxt.config.ts
```

---

## 项目搭建

### 1. 项目初始化

```bash
# 创建 Nuxt 4 项目
npx nuxi init collab-platform
cd collab-platform

# 安装依赖
npm install
npm install @pinia/nuxt @nuxtjs/tailwindcss
npm install @nuxt/ui
npm install @tiptap/vue-3 @tiptap/starter-kit
npm install socket.io-client
npm install prisma @prisma/client
npm install ioredis bull

# 初始化 Prisma
npx prisma init
```

### 2. Nuxt 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/ui',
  ],

  typescript: {
    strict: true,
    typeCheck: true,
  },

  nitro: {
    experimental: {
      websocket: true,
    },
  },

  runtimeConfig: {
    redisUrl: process.env.REDIS_URL,
    databaseUrl: process.env.DATABASE_URL,
  },
})
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

model Document {
  id          String   @id @default(cuid())
  title       String
  content     Json     // 存储编辑器状态
  ownerId     String
  folderId    String?
  isPublic    Boolean  @default(false)
  version     Int      @default(1)
  users       DocumentUser[]
  versions    DocumentVersion[]
  comments    Comment[]
  collaborations Collaboration[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([ownerId])
  @@index([folderId])
}

model DocumentUser {
  id         String   @id @default(cuid())
  documentId String
  userId     String
  role       String   @default("editor") // owner, editor, viewer
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([documentId, userId])
  @@index([userId])
}

model DocumentVersion {
  id         String   @id @default(cuid())
  documentId String
  version    Int
  content    Json
  createdBy  String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())

  @@index([documentId])
}

model Collaboration {
  id         String   @id @default(cuid())
  documentId String
  userId     String
  status     String   @default("active") // active, idle, offline
  cursor     Int?     // 光标位置
  selection  Json?    // 选区
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  updatedAt  DateTime @updatedAt

  @@index([documentId])
  @@index([userId])
}

model Comment {
  id         String   @id @default(cuid())
  documentId String
  userId     String
  content    String
  position   Json     // 在文档中的位置
  resolved   Boolean  @default(false)
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([documentId])
  @@index([userId])
}

model User {
  id           String            @id @default(cuid())
  name         String
  email        String            @unique
  image        String?
  status       String            @default("offline")
  documents    Document[]
  documentUsers DocumentUser[]
  comments     Comment[]
  collaborations Collaboration[]
  sentMessages Message[]        @relation("SentMessages")
  receivedMessages Message[]    @relation("ReceivedMessages")
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
}

model Message {
  id         String   @id @default(cuid())
  senderId   String
  receiverId String?
  content    String
  type       String   @default("text") // text, file, system
  read       Boolean  @default(false)
  sender     User     @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiver   User?    @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())

  @@index([senderId])
  @@index([receiverId])
}
```

---

## 核心功能实现

### 1. 实时编辑器

```vue
<!-- components/editor/Editor.vue -->
<template>
  <div class="editor-container">
    <div class="editor-header">
      <div class="collaborators">
        <div
          v-for="user in activeUsers"
          :key="user.id"
          class="user-avatar"
          :style="{ backgroundColor: user.color }"
        >
          {{ user.name.charAt(0) }}
        </div>
      </div>
      <div class="status">
        {{ status }}
      </div>
    </div>

    <editor-content :editor="editor" class="editor-content" />

    <div class="editor-footer">
      <span>字数：{{ wordCount }}</span>
      <span>版本：{{ version }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import { WebSocket } from 'partysocket'

interface Props {
  documentId: string
}

const props = defineProps<Props>()
const { $websocket } = useNuxtApp()

// WebSocket 连接
const ws = new WebSocket(
  `${process.env.NUXT_PUBLIC_WS_URL}/document/${props.documentId}`
)

const editor = useEditor({
  extensions: [
    StarterKit,
    Collaboration.configure({
      document: props.documentId,
    }),
  ],
  content: '',
  onUpdate: ({ editor }) => {
    // 发送更新到服务器
    ws.send(JSON.stringify({
      type: 'update',
      content: editor.getJSON(),
    }))
  },
})

// 监听其他用户的更新
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.type === 'update') {
    editor.value?.commands.setContent(data.content)
  } else if (data.type === 'user-joined') {
    // 显示用户加入提示
  }
}

const activeUsers = ref([])
const status = ref('已保存')
const wordCount = computed(() => {
  return editor.value?.getText().length || 0
})
const version = ref(1)

onBeforeUnmount(() => {
  ws.close()
})
</script>

<style scoped lang="postcss">
.editor-container {
  @apply h-full flex flex-col bg-white rounded-lg shadow;
}

.editor-header {
  @apply flex items-center justify-between px-4 py-2 border-b;
}

.collaborators {
  @apply flex gap-2;
}

.user-avatar {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold;
}

.editor-content {
  @apply flex-1 p-6 overflow-y-auto;

  :deep(.ProseMirror) {
    @apply outline-none min-h-full;
  }
}

.editor-footer {
  @apply flex items-center justify-between px-4 py-2 border-t text-sm text-gray-500;
}
</style>
```

### 2. WebSocket 服务器

```typescript
// server/socket/document.ts
import { Server } from 'socket.io'
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export function setupDocumentSocket(io: Server) {
  const documentNamespace = io.of('/document')

  documentNamespace.on('connection', (socket) => {
    const documentId = socket.handshake.query.documentId as string
    const userId = socket.handshake.query.userId as string

    // 加入文档房间
    socket.join(`document:${documentId}`)

    // 广播用户加入
    socket.to(`document:${documentId}`).emit('user-joined', {
      userId,
      socketId: socket.id,
    })

    // 监听编辑操作
    socket.on('edit', async (data) => {
      const { operations, version } = data

      // 应用 OT 转换
      const transformed = await transformOperations(documentId, operations)

      // 广播给其他用户
      socket.to(`document:${documentId}`).emit('edit', {
        operations: transformed,
        version: version + 1,
        userId,
      })

      // 保存到 Redis
      await redis.set(
        `document:${documentId}`,
        JSON.stringify(transformed)
      )
    })

    // 监听光标位置
    socket.on('cursor', (data) => {
      socket.to(`document:${documentId}`).emit('cursor', {
        ...data,
        userId,
      })
    })

    // 监听用户离开
    socket.on('disconnect', () => {
      socket.to(`document:${documentId}`).emit('user-left', {
        userId,
        socketId: socket.id,
      })
    })
  })
}

// OT 操作转换
async function transformOperations(documentId: string, operations: any[]) {
  // 获取当前文档状态
  const current = await redis.get(`document:${documentId}`)
  const state = current ? JSON.parse(current) : { operations: [] }

  // 应用转换算法
  const transformed = applyOT(state.operations, operations)

  return transformed
}

function applyOT(ops1: any[], ops2: any[]) {
  // 简化的 OT 实现
  // 实际应该使用 Y.js 或 Automerge 等库
  return [...ops1, ...ops2]
}
```

### 3. 实时聊天

```vue
<!-- components/chat/ChatBox.vue -->
<template>
  <div class="chat-box">
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="{ 'own': message.senderId === currentUserId }"
      >
        <div class="message-avatar">
          {{ message.senderName.charAt(0) }}
        </div>
        <div class="message-content">
          <div class="message-sender">{{ message.senderName }}</div>
          <div class="message-text">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.createdAt) }}</div>
        </div>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="chat-input">
      <input
        v-model="newMessage"
        type="text"
        placeholder="输入消息..."
        @keyup.enter="sendMessage"
      />
      <button type="submit">发送</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useWebSocket } from '@/composables/useWebSocket'

const props = defineProps<{
  roomId: string
  currentUserId: string
}>()

const { messages, sendMessage: wsSendMessage } = useWebSocket(
  `/chat/${props.roomId}`
)

const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()

const sendMessage = () => {
  if (!newMessage.value.trim()) return

  wsSendMessage({
    type: 'message',
    content: newMessage.value,
    senderId: props.currentUserId,
  })

  newMessage.value = ''
}

// 自动滚动到底部
watch(() => messages.value, () => {
  nextTick(() => {
    messagesContainer.value?.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  })
}, { deep: true })

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString()
}
</script>

<style scoped lang="postcss">
.chat-box {
  @apply flex flex-col h-full bg-gray-50 rounded-lg;
}

.chat-messages {
  @apply flex-1 overflow-y-auto p-4 space-y-4;
}

.message {
  @apply flex gap-3;
  &.own {
    @apply flex-row-reverse;

    .message-content {
      @apply bg-blue-500 text-white;
    }
  }
}

.message-avatar {
  @apply w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold;
}

.message-content {
  @apply bg-white rounded-lg px-4 py-2 max-w-xs shadow-sm;
}

.message-sender {
  @apply text-xs font-semibold mb-1;
}

.message-time {
  @apply text-xs opacity-70 mt-1;
}

.chat-input {
  @apply flex gap-2 p-4 border-t;
}
</style>
```

### 4. Composable - WebSocket

```typescript
// composables/useWebSocket.ts
export function useWebSocket(url: string) {
  const ws = ref<WebSocket | null>(null)
  const messages = ref<any[]>([])
  const connected = ref(false)

  const connect = () => {
    ws.value = new WebSocket(`${process.env.NUXT_PUBLIC_WS_URL}${url}`)

    ws.value.onopen = () => {
      connected.value = true
    }

    ws.value.onmessage = (event) => {
      const data = JSON.parse(event.data)
      messages.value.push(data)
    }

    ws.value.onclose = () => {
      connected.value = false
      // 自动重连
      setTimeout(connect, 3000)
    }
  }

  const sendMessage = (data: any) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    }
  }

  onMounted(connect)

  onBeforeUnmount(() => {
    ws.value?.close()
  })

  return {
    messages,
    connected,
    sendMessage,
  }
}
```

### 5. 版本控制

```typescript
// server/api/versions/[id].get.ts
import { prisma } from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const documentId = getRouterParam(event, 'id')

  const versions = await prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return versions
})

// server/api/versions/restore.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { versionId, documentId } = body

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
  })

  if (!version) {
    throw createError({
      statusCode: 404,
      message: 'Version not found',
    })
  }

  // 创建新版本
  const newVersion = await prisma.documentVersion.create({
    data: {
      documentId,
      version: version.version + 1,
      content: version.content,
      createdBy: event.context.user.id,
    },
  })

  // 恢复文档内容
  await prisma.document.update({
    where: { id: documentId },
    data: {
      content: version.content,
      version: version.version + 1,
    },
  })

  // 通过 WebSocket 广播
  global.documentNamespace?.to(`document:${documentId}`).emit('restored', {
    versionId: newVersion.id,
    version: newVersion.version,
  })

  return newVersion
})
```

---

## 高级特性

### 1. 离线支持

```typescript
// composables/useOfflineSync.ts
import { useWebSocket } from './useWebSocket'

export function useOfflineSync(documentId: string) {
  const isOnline = useOnline()
  const pendingOperations = ref<any[]>([])

  // 使用 IndexedDB 存储离线操作
  const db = useIndexedDB('collab-platform', 1)

  const saveOperation = async (operation: any) => {
    if (!isOnline.value) {
      await db.put('pending', operation)
      pendingOperations.value.push(operation)
    } else {
      // 发送到服务器
      $fetch('/api/document/sync', {
        method: 'POST',
        body: operation,
      })
    }
  }

  const syncPending = async () => {
    const operations = await db.getAll('pending')

    for (const op of operations) {
      try {
        await $fetch('/api/document/sync', {
          method: 'POST',
          body: op,
        })
        await db.delete('pending', op.id)
      } catch (error) {
        console.error('Sync failed:', error)
      }
    }
  }

  // 监听网络状态
  watch(isOnline, (online) => {
    if (online) {
      syncPending()
    }
  })

  return {
    saveOperation,
    syncPending,
    pendingOperations,
  }
}
```

### 2. 实时状态同步

```typescript
// composables/usePresence.ts
export function usePresence(documentId: string, userId: string) {
  const { $websocket } = useNuxtApp()
  const presence = useMap<string, any>()

  // 发送心跳
  const heartbeat = setInterval(() => {
    $websocket.emit('presence', {
      documentId,
      userId,
      status: 'active',
      timestamp: Date.now(),
    })
  }, 5000)

  // 监听其他用户状态
  $websocket.on('presence', (data) => {
    presence.set(data.userId, {
      ...data,
      lastSeen: Date.now(),
    })
  })

  // 清理离线用户
  const cleanup = setInterval(() => {
    const now = Date.now()
    for (const [id, user] of presence.entries()) {
      if (now - user.lastSeen > 10000) {
        presence.delete(id)
      }
    }
  }, 5000)

  onBeforeUnmount(() => {
    clearInterval(heartbeat)
    clearInterval(cleanup)
  })

  return {
    presence,
  }
}
```

### 3. 评论系统

```vue
<!-- components/comments/CommentsPanel.vue -->
<template>
  <div class="comments-panel">
    <div class="comments-list">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="comment"
      >
        <div class="comment-header">
          <img :src="comment.user.image" :alt="comment.user.name" />
          <div class="comment-info">
            <div class="comment-author">{{ comment.user.name }}</div>
            <div class="comment-time">{{ formatTime(comment.createdAt) }}</div>
          </div>
        </div>
        <div class="comment-content">{{ comment.content }}</div>
        <div v-if="comment.resolved" class="comment-resolved">
          ✓ 已解决
        </div>
      </div>
    </div>

    <form @submit.prevent="addComment" class="comment-form">
      <textarea
        v-model="newComment"
        placeholder="添加评论..."
        rows="3"
      />
      <div class="comment-actions">
        <button type="submit">发布</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  documentId: string
  selection?: any
}>()

const { data: comments } = await useFetch(
  `/api/documents/${props.documentId}/comments`
)

const newComment = ref('')

const addComment = async () => {
  await $fetch(`/api/documents/${props.documentId}/comments`, {
    method: 'POST',
    body: {
      content: newComment.value,
      position: props.selection,
    },
  })

  newComment.value = ''
  // 刷新评论列表
  refreshNuxtData()
}
</script>
```

---

## 性能优化

### 1. 防抖和节流

```typescript
// utils/performance.ts
export function useDebouncedWebSocket(ws: WebSocket, delay = 100) {
  let timer: NodeJS.Timeout | null = null
  let pendingData: any = null

  return {
    send: (data: any) => {
      pendingData = data
      if (timer) clearTimeout(timer)

      timer = setTimeout(() => {
        ws.send(JSON.stringify(pendingData))
        timer = null
        pendingData = null
      }, delay)
    },
  }
}
```

### 2. 增量更新

```typescript
// 只发送变化的部分
function getDelta(oldDoc: any, newDoc: any) {
  const delta = {
    changed: [],
    deleted: [],
  }

  // 比较文档内容
  for (const key in newDoc) {
    if (oldDoc[key] !== newDoc[key]) {
      delta.changed.push({ key, value: newDoc[key] })
    }
  }

  return delta
}
```

### 3. Redis 缓存

```typescript
// server/cache/document.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function getCachedDocument(id: string) {
  const cached = await redis.get(`doc:${id}`)
  if (cached) {
    return JSON.parse(cached)
  }

  const document = await prisma.document.findUnique({ where: { id } })
  await redis.setex(`doc:${id}`, 3600, JSON.stringify(document))

  return document
}
```

---

## 部署上线

### 1. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  nuxt:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/collab
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=collab
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

### 2. Nginx 反向代理

```nginx
# nginx.conf
server {
    listen 443 ssl http2;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /ws/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 项目总结

本项目涵盖了 Nuxt 4 实时应用开发的核心知识点：

✅ **技术栈**：Nuxt 4 + WebSocket + TipTap + Prisma + Redis
✅ **功能模块**：实时编辑、版本控制、评论系统、视频会议
✅ **高级特性**：OT 算法、离线支持、实时同步、冲突解决
✅ **最佳实践**：性能优化、状态管理、部署方案

通过这个项目，你将掌握：
- Nuxt 4 在实时应用中的完整开发流程
- WebSocket 和 SSE 的使用方法
- 实时编辑器的实现原理
- OT 和 CRDT 算法的应用
- 离线支持和自动同步的实现
- 企业级实时协作平台的架构设计

---

## 下一步学习

建议继续学习以下内容：

- [Nuxt 4 新特性与迁移](/guide/nuxt/chapter-136)
- [性能优化完全指南](/guide/nuxt/chapter-137)
- [部署（Vercel/Cloudflare）](/guide/nuxt/chapter-138)
- [全栈实战项目](/guide/nuxt/chapter-140)
