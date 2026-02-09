---
title: Nuxt 企业级实战项目3
description: Nuxt 4 社交网络与内容社区平台
---

# ：Nuxt 4 完全实战项目 - 社交网络与内容社区平台

> **项目概述**：本项目是一个基于Nuxt 4的现代化社交网络与内容社区平台，支持UGC内容发布、社交互动、内容分发、算法推荐等功能。
>
> **学习目标**：
> - 掌握社交网络平台的核心功能设计
> - 熟练使用Nuxt 4构建高性能社区应用
> - 掌握内容推荐算法、数据可视化
> - 学会内容审核、用户增长、变现策略

---

## 项目介绍

### 项目背景

本社交网络与内容社区平台是一个现代化的UGC平台，主要功能包括：

- ✅ **内容创作**：文章、视频、音频、动态发布
- ✅ **社交互动**：关注、点赞、评论、分享、私信
- ✅ **推荐算法**：内容推荐、用户推荐、热搜榜
- ✅ **内容分发**：信息流算法、个性化Feed
- ✅ **社区管理**：话题、圈子、标签、分类
- ✅ **用户成长**：等级、积分、勋章、成就
- ✅ **内容变现**：赞赏、付费内容、创作激励
- ✅ **数据分析**：用户行为、内容分析、推荐优化
- ✅ **安全审核**：敏感词过滤、内容审核、反作弊

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **框架** | Nuxt | 4.x |
| **UI库** | Nuxt UI | latest |
| **状态管理** | Pinia | 2.x |
| **数据库** | PostgreSQL + MongoDB | latest |
| **缓存** | Redis | latest |
| **搜索** | Elasticsearch | latest |
| **消息队列** | Bull + Redis | latest |
| **实时通信** | Socket.io | latest |
| **对象存储** | MinIO / S3 | latest |
| **推荐引擎** | TensorFlow | latest |
| **监控** | Sentry + Analytics | latest |

### 项目结构

```
nuxt-social-platform/
├── app/                          # Nuxt App
│   ├── components/
│   │   ├── feed/                # 信息流组件
│   │   ├── post/                # 帖子组件
│   │   ├── user/                # 用户组件
│   │   ├── comment/             # 评论组件
│   │   └── follow/              # 关注组件
│   ├── composables/             # 组合式函数
│   │   ├── useFeed.ts            # 信息流钩子
│   │   ├── usePost.ts            # 帖子钩子
│   │   ├── useNotification.ts    # 通知钩子
│   │   └── useRecommend.ts       # 推荐钩子
│   ├── stores/                   # Pinia状态
│   │   ├── user.ts
│   │   ├── post.ts
│   │   ├── notification.ts
│   │   └── feed.ts
│   ├── pages/                     # 页面
│   │   ├── index.vue             # 首页
│   │   ├── feed/                 # 信息流
│   │   ├── post/[id]/           # 帖子详情
│   │   ├── user/[id]/           # 用户主页
│   │   ├── topic/[id]/          # 话题
│   │   └── notifications/       # 通知
│   └── server/api/               # API Routes
├── server/                       # 后端服务
│   ├── services/                 # 业务逻辑
│   │   ├── feed/                 # 信息流服务
│   │   ├── recommendation/        # 推荐服务
│   │   ├── notification/         # 通知服务
│   │   └── moderation/           # 审核服务
│   ├── models/                   # 数据模型
│   ├── workers/                  # 后台任务
│   └── socket/                  # WebSocket
└── ml/                          # 机器学习
    ├── recommendation/           # 推荐模型
    ├── classification/           # 内容分类
    └── sentiment/               # 情感分析
```

---

## 核心功能实现

### 1. 信息流算法（Feed算法）

```typescript
// app/composables/useFeed.ts
import { useAsyncData, useLazyFetch } from '#app'
import type { Post, FeedItem } from '~/types/feed'

interface FeedOptions {
  type?: 'recommend' | 'following' | 'latest'
  page?: number
  pageSize?: number
}

export function useFeed(options: FeedOptions = {}) {
  const { type = 'recommend', page = 1, pageSize = 20 } = options

  // 推荐模式使用算法推荐
  const { data, refresh, pending } = useAsyncData(
    `feed-${type}-${page}`,
    () => $fetch<any>('/api/feed', {
      method: 'POST',
      body: { type, page, pageSize }
    }).then(res => res.json())
  )

  // 无限滚动
  const { data: moreData, pending: loadingMore, refresh: loadMore } = useLazyFetch(() =>
    $fetch<any>('/api/feed', {
      method: 'POST',
      body: { type, page: page + 1, pageSize }
    }).then(res => res.json())
  )

  const posts = computed(() => {
    if (!data?.posts) return []
    if (!moreData?.posts) return data.posts
    return [...data.posts, ...moreData.posts]
  })

  return {
    posts,
    pending,
    loadingMore,
    refresh,
    loadMore,
    hasMore: !!moreData?.posts?.length
  }
}
```

### 2. 服务端推荐算法

```typescript
// server/services/recommendation/feed-ranker.service.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Post } from '../entities/post.entity'
import { User } from '../entities/user.entity'
import { Redis } from 'ioredis'

@Injectable()
export class FeedRankerService {
  private redis = new Redis()

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async generateFeed(userId: string, page: number, pageSize: number) {
    // 1. 获取用户信息
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['interests', 'following']
    })

    // 2. 生成候选池
    const candidates = await this.getCandidatePosts(user)

    // 3. 特征提取
    const features = await this.extractFeatures(user, candidates)

    // 4. 机器学习模型排序
    const rankedPosts = await this.rankPosts(user, candidates, features)

    // 5多样打散
    const diversifiedPosts = this.diversify(rankedPosts)

    // 6. 分页返回
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const pagePosts = diversifiedPosts.slice(start, end)

    return {
      posts: pagePosts,
      total: diversifiedPosts.length,
      hasMore: end < diversifiedPosts.length
    }
  }

  private async getCandidatePosts(user: User): Promise<Post[]> {
    // 1. 关注用户的帖子
    const followingPosts = this.postRepository
      .createQueryBuilder('post')
      .innerJoin('post.author', 'user')
      .where('user.id IN (:...ids)', { ids: user.following.map(f => f.id) })
      .andWhere('post.createdAt > :since', { since: getLastWeek() })
      .getMany()

    // 2. 兴趣相关的帖子
    const interestPosts = this.postRepository
      .createQueryBuilder('post')
      .where('post.tags && @.tags && @.tags <@ :interests', {
        interests: user.interests
      })
      .andWhere('post.createdAt > :since', { since: getLastWeek() })
      .getMany()

    // 3. 热门帖子
    const cacheKey = 'hot_posts_week'
    let hotPosts = await this.redis.get(cacheKey)

    if (!hotPosts) {
      hotPosts = await this.postRepository
        .createQueryBuilder('post')
        .where('post.createdAt > :since', { since: getLastWeek() })
        .orderBy('post.engagementScore', 'DESC')
        .limit(100)
        .getMany()

      await this.redis.setex(cacheKey, 3600, JSON.stringify(hotPosts))
    } else {
      hotPosts = JSON.parse(hotPosts)
    }

    // 合并去重
    return this.deduplicate([
      ...followingPosts,
      ...interestPosts,
      ...hotPosts
    ])
  }

  private async extractFeatures(user: User, posts: Post[]): Promise<number[][]> {
    return posts.map(post => {
      const features = []

      // 1. 内容相关性
      const contentSimilarity = this.calculateContentSimilarity(user, post)
      features.push(contentSimilarity)

      // 2. 社交证明
      const socialProof = post.engagementScore / 1000
      features.push(socialProof)

      // 3. 时间衰减
      const timeDecay = this.calculateTimeDecay(post.createdAt)
      features.push(timeDecay)

      // 4. 亲和度分数
      const affinityScore = this.calculateAffinity(user, post)
      features.push(affinityScore)

      // 5. 多样性分数
      const diversityScore = await this.getDiversityScore(user.id, post.id)
      features.push(diversityScore)

      return features
    })
  }

  private async rankPosts(user: User, posts: Post[], features: number[][]): Promise<Post[]> {
    // 使用TensorFlow.js进行预测
    const scores = await this.mlModel.predict(features)

    // 排序
    const indexedPosts = posts.map((post, index) => ({ post, score: scores[index] }))
    indexedPosts.sort((a, b) => b.score - a.score)

    return indexedPosts.map(item => item.post)
  }

  private diversify(posts: Post[]): Post[] {
    // 使用MMR (Maximal Marginal Relevance)算法
    const selected: Post[] = []
    const lambda = 0.7  // 多样性权重

    for (const post of posts) {
      if (selected.length === 0) {
        selected.push(post)
        continue
      }

      // 计算与已选内容的最小相关性
      const maxSimilarity = Math.max(
        ...selected.map(s => this.calculateSimilarity(s, post))
      )

      // 修正分数
      const adjustedScore = lambda * (1 - maxSimilarity)

      if (adjustedScore > 0.3) {
        selected.push(post)
      }

      if (selected.length >= 20) break
    }

    return selected
  }

  private calculateContentSimilarity(user: User, post: Post): number {
    // 使用TF-IDF计算内容相似度
    // 这里简化处理
    const userTags = new Set(user.interests.map(i => i.tag))
    const postTags = new Set(post.tags)

    const intersection = new Set([...userTags].filter(x => postTags.has(x)))
    const union = new Set([...userTags, ...postTags])

    return union.size > 0 ? intersection.size / union.size : 0
  }

  private calculateTimeDecay(createdAt: Date): number {
    const hoursSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
    return Math.exp(-hoursSince / 24) // 24小时半衰期
  }

  private calculateAffinity(user: User, post: Post): number {
    // 计算用户亲和度
    let score = 0

    // 作者是否关注
    if (user.following.includes(post.authorId)) {
      score += 0.3
    }

    // 是否点赞过作者的其他内容
    if (user.likedAuthors.includes(post.authorId)) {
      score += 0.2
    }

    // 话题匹配度
    const matchedTopics = post.topics.filter(t => user.interests.includes(t))
    score += matchedTopics.length * 0.1

    return Math.min(score, 1)
  }
}
```

### 3. Socket.io 实时通信

```typescript
// server/socket/nuxt-socket.io.ts
import { Server } from 'socket.io'
import { defineNuxtHandler } from '#app'

export default defineNuxtHandler((nuqApp) => {
  const socketServer = new Server()

  socketServer.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // 用户认证
    socket.on('authenticate', async (data) => {
      const userId = await verifyToken(data.token)
      if (userId) {
        socket.data.userId = userId
        socket.join(`user:${userId}`)

        // 发送未读通知
        const notifications = await getUnreadNotifications(userId)
        socket.emit('notifications', notifications)
      }
    })

    // 实时点赞
    socket.on('post:like', async (data) => {
      const { postId, userId } = socket.data

      await handleLike(postId, userId)

      // 通知作者
      const post = await getPost(postId)
      if (post.authorId !== userId) {
        socket.to(`user:${post.authorId}`).emit('notification', {
          type: 'like',
          postId,
          userId
        })
      }
    })

    // 实时评论
    socket.on('post:comment', async (data) => {
      const { postId, userId, content } = data

      const comment = await handleComment(postId, userId, content)

      // 广播到所有查看该帖子的人
      socket.to(`post:${postId}`).emit('new-comment', {
        postId,
        comment
      })
    })

    // 关注用户
    socket.on('user:follow', async (data) => {
      const { targetUserId } = data
      const userId = socket.data.userId

      await handleFollow(userId, targetUserId)

      // 通知被关注者
      socket.to(`user:${targetUserId}`).emit('notification', {
        type: 'follow',
        userId
      })

      // 更新关注者的在线状态
      socket.emit('follow:success', { userId: targetUserId })
    })

    // 实时在线状态
    socket.on('user:online', () => {
      const userId = socket.data.userId
      updateUserOnlineStatus(userId, true)
    })

    socket.on('disconnect', () => {
      const userId = socket.data.userId
      updateUserOnlineStatus(userId, false)
      console.log('User disconnected:', socket.id)
    })
  })

  // 返回Socket.io服务器实例
  return socketServer.handler
})

// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    ssr: false
  },
  experimental: {
    socketIO: {
      // Socket.io配置
    }
  }
})
```

### 4. 内容发布组件

```vue
<!-- app/components/post/PostEditor.vue -->
<template>
  <div class="post-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <button @click="toggleBold" :class="{ active: format.bold }">
        <Icon name="bold" />
      </button>
      <button @click="toggleItalic" :class="{ active: format.italic }">
        <Icon name="italic" />
      </button>
      <button @click="insertLink">
        <Icon name="link" />
      </button>
      <button @click="insertImage">
        <Icon name="image" />
      </button>
      <button @click="insertCode">
        <Icon name="code" />
      </button>
    </div>

    <!-- 编辑器 -->
    <div class="editor-container">
      <ContentCaretaker
        v-model="content"
        :placeholder="'分享你的想法...'"
        @update:model-value="handleContentChange"
      />
    </div>

    <!-- 媒体预览 -->
    <div v-if="media.length > 0" class="media-preview">
      <div v-for="(item, index) in media" :key="index" class="media-item">
        <img v-if="item.type === 'image'" :src="item.url" />
        <video v-if="item.type === 'video'" :src="item.url" controls />
        <button @click="removeMedia(index)" class="remove-btn">×</button>
      </div>
    </div>

    <!-- 附加选项 -->
    <div class="options">
      <select v-model="visibility" class="visibility-select">
        <option value="public">公开</option>
        <option value="followers">仅关注者</option>
        <option value="private">仅自己</option>
      </select>

      <input
        v-model="tags"
        type="text"
        placeholder="添加标签（逗号分隔）"
        class="tags-input"
      />

      <button @click="toggleAdvanced" class="advanced-toggle">
        高级选项
      </button>
    </div>

    <!-- 高级选项 -->
    <div v-if="showAdvanced" class="advanced-options">
      <div class="option-row">
        <label>允许评论</label>
        <input type="checkbox" v-model="allowComments" />
      </div>
      <div class="option-row">
        <label>允许分享</label>
        <input type="checkbox" v-model="allowSharing" />
      </div>
      <div class="option-row">
        <label>置顶帖子</label>
        <input type="checkbox" v-model="isPinned" />
      </div>
    </div>

    <!-- 发布按钮 -->
    <div class="actions">
      <button @click="saveDraft" class="btn-secondary">
        保存草稿
      </button>
      <button @click="publish" :disabled="!canPublish" class="btn-primary">
        发布
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const content = ref('')
const media = ref([])
const visibility = ref('public')
const tags = ref('')
const allowComments = ref(true)
const allowSharing = ref(true)
const isPinned = ref(false)
const showAdvanced = ref(false)

const format = reactive({
  bold: false,
  italic: false
})

const canPublish = computed(() => {
  return content.value.trim().length > 0
})

const handleContentChange = (newContent: string) => {
  content.value = newContent
}

const toggleBold = () => {
  format.bold = !format.bold
  // 应用格式到编辑器
}

const publish = async () => {
  const { data, error } = await useFetch('/api/posts', {
    method: 'POST',
    body: {
      content: content.value,
      media: media.value,
      visibility: visibility.value,
      tags: tags.value.split(',').map(t => t.trim()),
      allowComments: allowComments.value,
      allowSharing: allowSharing.value,
      isPinned: isPinned.value
    }
  })

  if (!error.value) {
    // 发布成功
    navigateTo('/feed')
  }
}
</script>

<style scoped lang="postcss">
.post-editor {
  @apply bg-white rounded-lg shadow-md p-6;
}

.toolbar {
  @apply flex gap-2 pb-4 border-b;
}

.editor-container {
  @apply min-h-[200px] py-4;
}

.media-preview {
  @apply grid grid-cols-3 gap-4 mt-4;
}

.media-item {
  @apply relative;
}
</style>
```

### 5. 推荐系统

```typescript
// server/services/recommendation/recommendation.service.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Post } from '../entities/post.entity'
import { User } from '../entities/user.entity'

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getRecommendedPosts(userId: string, limit = 20): Promise<Post[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['interests', 'behavior']
    })

    // 1. 协同过滤推荐
    const cfPosts = await this.collaborativeFiltering(user)

    // 2. 内容推荐
    const cbPosts = await this.contentBased(user)

    // 3. 混合推荐
    const recommendations = this.hybridRecommendation(cfPosts, cbPosts, {
      cf_weight: 0.6,
      cb_weight: 0.4
    })

    return recommendations.slice(0, limit)
  }

  private async collaborativeFiltering(user: User): Promise<Post[]> {
    // 基于用户行为的相似度
    const similarUsers = await this.findSimilarUsers(user)

    const recommendations = new Map<string, number>()

    for (const similarUser of similarUsers) {
      const similarity = this.calculateUserSimilarity(user, similarUser)

      // 获取该用户喜欢的帖子
      const likedPosts = await this.getUserLikedPosts(similarUser.id)

      for (const post of likedPosts) {
        const currentScore = recommendations.get(post.id) || 0
        recommendations.set(post.id, currentScore + similarity * post.rating)
      }
    }

    // 排序
    const sorted = [...recommendations.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([postId]) => postId)

    return this.postRepository.findByIds(sorted)
  }

  private async contentBased(user: User): Promise<Post[]> {
    // 基于用户兴趣推荐
    const interests = user.interests.map(i => i.tag)

    return this.postRepository
      .createQueryBuilder('post')
      .where('post.tags && @.tags && @.tags <@ :interests', {
        interests
      })
      .andWhere('post.status = :status', { status: 'published' })
      .orderBy('post.engagementScore', 'DESC')
      .limit(50)
      .getMany()
  }

  private hybridRecommendation(
    cfPosts: Post[],
    cbPosts: Post[],
    weights: { cf_weight: number; cb_weight: number }
  ): Post[] {
    const combined = new Map<string, number>()

    // 协同过滤分数
    cfPosts.forEach((post, index) => {
      const score = (cfPosts.length - index) / cfPosts.length
      combined.set(post.id, (combined.get(post.id) || 0) + score * weights.cf_weight)
    })

    // 内容分数
    cbPosts.forEach((post, index) => {
      const score = (cbPosts.length - index) / cbPosts.length
      combined.set(post.id, (combined.get(post.id) || 0) + score * weights.cb_weight)
    })

    // 排序
    const sorted = [...combined.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([postId]) => postId)

    return this.postRepository.findByIds(sorted)
  }
}
```

### 6. 内容审核系统

```typescript
// server/services/moderation/content-moderation.service.ts
import { Injectable } from '@nestjs/common'
import { sensitiveWords } from './sensitive-words'

@Injectable()
export class ContentModerationService {
  async moderateContent(content: string, userId: string) {
    const issues = []

    // 1. 敏感词检测
    const detected = this.detectSensitiveWords(content)
    if (detected.length > 0) {
      issues.push({
        type: 'sensitive_words',
        words: detected,
        severity: 'high'
      })
    }

    // 2. 垃圾内容检测
    const isSpam = await this.detectSpam(content)
    if (isSpam) {
      issues.push({
        type: 'spam',
        severity: 'medium'
      })
    }

    // 3. 重复内容检测
    const isDuplicate = await this.detectDuplicate(content, userId)
    if (isDuplicate) {
      issues.push({
        type: 'duplicate',
        severity: 'low'
      })
    }

    // 4. 图片审核
    if (containsImages(content)) {
      const imageIssues = await this.moderateImages(content)
      issues.push(...imageIssues)
    }

    return {
      approved: issues.length === 0,
      issues,
      autoReject: issues.some(i => i.severity === 'high')
    }
  }

  detectSensitiveWords(content: string): string[] {
    const detected: string[] = []

    for (const word of sensitiveWords) {
      if (content.includes(word)) {
        detected.push(word)
      }
    }

    return detected
  }

  async detectSpam(content: string): Promise<boolean> {
    // 使用机器学习模型检测垃圾内容
    const features = this.extractFeatures(content)

    const score = await this.spamModel.predict(features)

    return score > 0.7
  }

  async detectDuplicate(content: string, userId: string): Promise<boolean> {
    // 使用SimHash检测重复内容
    const hash = this.calculateSimHash(content)

    // 查询数据库中是否有相似的哈希
    const exists = await this.contentHashRepository.findOne({
      where: {
        hash: hash,
        userId: { $ne: userId }
      }
    })

    // 保存当前内容的哈希
    await this.contentHashRepository.save({
      hash,
      userId,
      content
    })

    return !!exists
  }
}
```

---

## 性能优化

### 1. CDN图片上传

```typescript
// server/upload/minio-upload.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class MinioUploadService {
  private s3Client: S3Client

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
      },
      forcePathStyle: true,
    })
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const key = `images/${Date.now()}-${uuidv4()}-${file.originalname}`

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.MINIO_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    )

    // 返回CDN URL
    return `${process.env.CDN_URL}/${key}`
  }

  async uploadVideo(file: Express.Multer.File): Promise<{
    original: string
    thumbnail: string
  }> {
    // 上传原视频
    const videoKey = `videos/${Date.now()}-${file.originalname}`
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.MINIO_BUCKET,
        Key: videoKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    )

    // 生成缩略图
    const thumbnailKey = `thumbnails/${videoKey}.jpg`
    // ... 生成缩略图逻辑

    return {
      original: `${process.env.CDN_URL}/${videoKey}`,
      thumbnail: `${process.env.CDN_URL}/${thumbnailKey}`
    }
  }
}
```

### 2. Redis缓存策略

```typescript
// server/cache/redis-cache.service.ts
import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class RedisCacheService {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      db: 0,
    })
  }

  // 热门数据缓存
  async cacheHotPosts(posts: Post[]): Promise<void> {
    const key = 'hot_posts:feed'
    await this.redis.setex(key, 300, JSON.stringify(posts)) // 5分钟
  }

  async getHotPosts(): Promise<Post[] | null> {
    const cached = await this.redis.get('hot_posts:feed')
    return cached ? JSON.parse(cached) : null
  }

  // 用户信息缓存
  async cacheUserInfo(userId: string, user: User): Promise<void> {
    const key = `user:${userId}:info`
    await this.redis.setex(key, 3600, JSON.stringify(user)) // 1小时
  }

  // 用户Feed缓存
  async cacheUserFeed(userId: string, postIds: string[]): Promise<void> {
    const key = `feed:${userId}`
    await this.redis.setex(key, 600, JSON.stringify(postIds)) // 10分钟
  }

  async invalidateUserFeed(userId: string): Promise<void> {
    await this.redis.del(`feed:${userId}`)
  }
}
```

---

## 项目总结

本项目涵盖了Nuxt 4社交平台开发的核心技能：

✅ **技术栈**：Nuxt 4 + Pinia + Socket.io + PostgreSQL + Redis + ML
✅ **核心功能**：信息流算法、推荐系统、社交互动、内容管理
✅ **企业特性**：算法推荐、内容审核、数据监控、性能优化
✅ **最佳实践**：实时通信、缓存策略、机器学习集成

通过这个项目，你将掌握：
- 社交网络平台架构设计
- Feed流算法实现
- 推荐系统开发
- Socket.io实时通信
- UGC内容管理
- 内容审核与安全
- 机器学习集成

---

## 下一步学习

- [Nuxt 4新特性与迁移](/guide/nuxt/chapter-136)
- [性能优化完全指南](/guide/nuxt/chapter-137)
- [部署（Vercel/Cloudflare）](/guide/nuxt/chapter-138)
- [电商后台管理系统](/guide/nuxt/chapter-140)
- [实时协作平台](/guide/nuxt/chapter-141)
