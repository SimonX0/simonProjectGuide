# ISR增量静态再生

## ISR增量静态再生

> **为什么要学这一章?**
>
> 增量静态再生(ISR)结合了SSG和SSR的优点,在提供静态页面性能的同时,允许按需更新内容。这是Next.js和Nuxt 3中最强大的渲染模式之一,适合内容定期更新但对实时性要求不高的场景。
>
> **学习目标**:
>
> - 理解ISR的工作原理和优势
> - 掌握routeRules的ISR配置
> - 学会按需重新验证(On-Demand Revalidation)
> - 了解Stale-While-Revalidate策略
> - 能够构建新闻/博客类应用

---

### ISR基础

#### 什么是ISR

**增量静态再生**(Incremental Static Regeneration)在构建时生成静态页面,并在指定时间后按需重新生成:

```
┌─────────────────────────────────────────────────────────────┐
│                    ISR工作流程                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 构建时生成静态页面:                                        │
│     /posts/post-1 → 生成 HTML                               │
│     /posts/post-2 → 生成 HTML                               │
│                                                             │
│  2. 用户访问页面:                                             │
│     ✅ 立即返回静态HTML(超快)                                │
│                                                             │
│  3. 后台重新生成(在revalidate时间内):                         │
│     - 检查页面是否过期                                        │
│     - 如果过期,重新生成                                      │
│     - 下次访问返回新内容                                     │
│                                                             │
│  时间线示例(revalidate: 60秒):                               │
│                                                             │
│  0s   - 首次访问,返回静态HTML                                │
│  30s  - 再次访问,返回缓存HTML                                │
│  60s  - 页面过期,触发重新生成                                │
│  61s  - 访问仍返回旧HTML(生成中)                             │
│  65s  - 重新生成完成                                        │
│  70s  - 访问返回新HTML                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### ISR vs SSG vs SSR

```
┌─────────────────────────────────────────────────────────────┐
│                    渲染模式对比                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SSG (Static Site Generation)                               │
│  - 构建时生成                                                │
│  - 每次构建后更新                                            │
│  - 适合:内容完全不变                                          │
│  示例:企业官网                                               │
│                                                             │
│  ISR (Incremental Static Regeneration)                      │
│  - 按需重新生成                                              │
│  - 定时更新内容                                              │
│  - 适合:内容定期更新                                          │
│  示例:博客、新闻                                             │
│                                                             │
│  SSR (Server-Side Rendering)                                │
│  - 每次请求重新生成                                          │
│  - 实时内容                                                  │
│  - 适合:实时数据                                              │
│  示例:电商、社交                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### routeRules配置

#### 基础配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 路由规则
  routeRules: {
    // 首页 - 每60秒重新生成
    '/': { isr: 60 },

    // 博客列表 - 每5分钟重新生成
    '/blog': { isr: 300 },

    // 博客文章 - 每1小时重新生成
    '/blog/**': { isr: 3600 },

    // 产品页面 - 每15分钟重新生成
    '/products/**': { isr: 900 },

    // API路由 - 不缓存
    '/api/**': { isr: false },

    // 管理后台 - SPA模式
    '/admin/**': { ssr: false }
  }
})
```

#### 详细配置选项

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // ISR配置
    '/blog/**': {
      // 启用ISR
      isr: 3600, // 1小时(秒)

      // 或者使用缓存配置
      cache: {
        // 最大缓存时间
        maxAge: 3600,

        // 重新验证时间
        staleWhileRevalidate: 7200,

        // 自定义缓存键
        key: (route) => {
          return route.path
        }
      },

      // Headers
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200'
      }
    },

    // 混合配置
    '/news/**': {
      // ISR
      isr: 600,

      // 预渲染
      prerender: true,

      // 允许的HTTP方法
      allow: ['GET', 'HEAD']
    }
  }
})
```

#### 动态ISR配置

```typescript
// 根据数据动态设置revalidate时间
// pages/posts/[id].vue
<script setup lang="ts>
const route = useRoute()

// 获取文章
const { data: post } = await useFetch(`/api/posts/${route.params.id}`)

// 根据文章类型动态设置revalidate时间
const revalidateTime = computed(() => {
  if (post.value?.type === 'breaking') {
    return 60 // 突发新闻:1分钟
  } else if (post.value?.type === 'daily') {
    return 3600 // 每日新闻:1小时
  } else {
    return 86400 // 普通文章:1天
  }
})

// 动态设置页面缓存
definePageMeta({
  cache: {
    maxAge: revalidateTime.value
  }
})
</script>
```

---

### 按需重新验证

#### 服务器端触发

```typescript
// server/api/revalidate/route.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const route = body.route

  if (!route) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Route is required'
    })
  }

  // 触发指定路由的重新验证
  // 实际实现取决于部署平台
  try {
    // Netlify
    if (process.env.NETLIFY) {
      await $fetch('/.netlify/functions/revalidate', {
        method: 'POST',
        body: { route }
      })
    }

    // Vercel
    if (process.env.VERCEL) {
      await $fetch('/api/revalidate', {
        method: 'POST',
        body: { route }
      })
    }

    // Nitro内置
    await useStorage('cache').removeItem(`routes:${route}`)

    return { success: true, route }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Revalidation failed'
    })
  }
})
```

#### 客户端触发

```vue
<!-- components/AdminPostEditor.vue -->
<template>
  <div class="post-editor">
    <form @submit.prevent="savePost">
      <input v-model="post.title" type="text" placeholder="标题" />
      <textarea v-model="post.content" placeholder="内容"></textarea>
      <button type="submit" :disabled="saving">
        {{ saving ? '保存中...' : '保存文章' }}
      </button>
    </form>

    <div v-if="message" class="message">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts>
const props = defineProps<{
  postId?: string
}>()

const post = ref({
  title: '',
  content: ''
})

const saving = ref(false)
const message = ref('')

const savePost = async () => {
  saving.value = true
  message.value = ''

  try {
    // 保存文章
    const endpoint = props.postId
      ? `/api/posts/${props.postId}`
      : '/api/posts'

    const { data } = await useFetch(endpoint, {
      method: props.postId ? 'PUT' : 'POST',
      body: post.value
    })

    if (data.value) {
      message.value = '文章保存成功'

      // 触发重新验证
      if (data.value.slug) {
        await revalidateRoute(`/blog/${data.value.slug}`)
      }

      // 重新验证列表页
      await revalidateRoute('/blog')

      // 清除本地缓存
      clearNuxtData()
    }
  } catch (error) {
    message.value = '保存失败'
    console.error(error)
  } finally {
    saving.value = false
  }
}

// 重新验证路由
const revalidateRoute = async (route: string) => {
  try {
    await useFetch('/api/revalidate', {
      method: 'POST',
      body: { route }
    })

    console.log(`Route ${route} revalidated`)
  } catch (error) {
    console.error('Revalidation failed:', error)
  }
}
</script>
```

---

### 实战案例:新闻网站

构建一个使用ISR的新闻网站,支持定时更新和按需刷新。

#### 1. 项目配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 启用SSR和ISR
  ssr: true,

  // 路由规则
  routeRules: {
    // 首页 - 每5分钟更新
    '/': { isr: 300 },

    // 新闻列表 - 每5分钟更新
    '/news': { isr: 300 },

    // 新闻分类 - 每10分钟更新
    '/news/category/*': { isr: 600 },

    // 新闻详情 - 根据类型动态设置
    '/news/breaking/**': { isr: 60 }, // 突发新闻:1分钟
    '/news/article/**': { isr: 3600 }, // 普通文章:1小时

    // 作者页面 - 每1小时更新
    '/author/*': { isr: 3600 },

    // 标签页面 - 每30分钟更新
    '/tags/*': { isr: 1800 },

    // API - 不缓存
    '/api/**': { isr: false }
  },

  // Nitro配置
  nitro: {
    // 启用ISR
    experimental: {
      isr: true
    }
  }
})
```

#### 2. 新闻数据API

```typescript
// server/api/news/index.ts
interface NewsItem {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  publishedAt: string
  updatedAt: string
  type: 'breaking' | 'article'
}

// 模拟数据
const newsData: NewsItem[] = [
  {
    id: 1,
    slug: 'breaking-tech-news',
    title: '突发:科技行业重大突破',
    excerpt: '今日科技行业传来重大消息...',
    content: '<p>详细内容...</p>',
    category: '科技',
    author: '张记者',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'breaking'
  },
  {
    id: 2,
    slug: 'ai-development-trends',
    title: '人工智能发展趋势分析',
    excerpt: '深度分析AI领域的发展方向...',
    content: '<p>详细内容...</p>',
    category: '科技',
    author: '李专家',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    type: 'article'
  }
]

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const category = query.category as string
  const type = query.type as string
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20

  // 过滤新闻
  let filtered = newsData

  if (category) {
    filtered = filtered.filter(item => item.category === category)
  }

  if (type) {
    filtered = filtered.filter(item => item.type === type)
  }

  // 分页
  const start = (page - 1) * limit
  const end = start + limit
  const paginated = filtered.slice(start, end)

  return {
    news: paginated,
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit),
    hasMore: end < filtered.length
  }
})

// server/api/news/[slug].ts
export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')

  const newsItem = newsData.find(item => item.slug === slug)

  if (!newsItem) {
    throw createError({
      statusCode: 404,
      statusMessage: '新闻未找到'
    })
  }

  return newsItem
})
```

#### 3. 首页

```vue
<!-- pages/index.vue -->
<template>
  <div class="home">
    <!-- 突发新闻 -->
    <section class="breaking-news">
      <h2>🔴 突发新闻</h2>
      <div v-if="breakingNews.length > 0" class="news-ticker">
        <div v-for="item in breakingNews" :key="item.id" class="ticker-item">
          <NuxtLink :to="`/news/${item.slug}`">
            {{ item.title }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 最新新闻 -->
    <section class="latest-news">
      <h2>最新资讯</h2>

      <div v-if="pending" class="loading">
        加载中...
      </div>

      <div v-else class="news-grid">
        <NewsCard
          v-for="item in news"
          :key="item.id"
          :news="item"
        />
      </div>
    </section>

    <!-- 分类导航 -->
    <section class="categories">
      <h2>新闻分类</h2>
      <div class="category-list">
        <NuxtLink
          v-for="category in categories"
          :key="category"
          :to="`/news/category/${category}`"
          class="category-link"
        >
          {{ category }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts>
useHead({
  title: '新闻网站',
  meta: [
    { name: 'description', content: '最新新闻资讯' }
  ]
})

// 获取新闻数据(使用ISR缓存)
const { data: response, pending } = await useFetch(
  '/api/news',
  {
    query: {
      limit: 12
    },

    // ISR会自动缓存此请求
    key: 'home-news'
  }
)

const news = computed(() => response.value?.news || [])

// 突发新闻
const breakingNews = computed(() =>
  news.value.filter(item => item.type === 'breaking')
)

const categories = ['科技', '财经', '体育', '娱乐', '国际']
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.breaking-news {
  background: #ff4444;
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 3rem;
}

.breaking-news h2 {
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.news-ticker {
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.ticker-item a {
  color: white;
  text-decoration: none;
  white-space: nowrap;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.category-list {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.category-link {
  padding: 0.75rem 1.5rem;
  background: #f0f0f0;
  text-decoration: none;
  border-radius: 8px;
  color: #333;
  transition: all 0.3s;
}

.category-link:hover {
  background: #667eea;
  color: white;
}
</style>
```

#### 4. 新闻详情页

```vue
<!-- pages/news/[slug].vue -->
<template>
  <article class="news-article">
    <!-- 加载状态 -->
    <div v-if="pending" class="loading">
      加载中...
    </div>

    <!-- 文章内容 -->
    <div v-else-if="article" class="article-content">
      <!-- 文章头部 -->
      <header class="article-header">
        <!-- 类型标签 -->
        <div class="article-type">
          <span v-if="article.type === 'breaking'" class="breaking-badge">
            🔴 突发
          </span>
          <span class="category-badge">{{ article.category }}</span>
        </div>

        <!-- 标题 -->
        <h1>{{ article.title }}</h1>

        <!-- 元信息 -->
        <div class="article-meta">
          <span class="author">
            <img src="/icons/author.svg" alt="" />
            {{ article.author }}
          </span>
          <span class="date">
            {{ formatDateTime(article.publishedAt) }}
          </span>
          <span v-if="article.updatedAt !== article.publishedAt" class="updated">
            已更新: {{ formatDateTime(article.updatedAt) }}
          </span>
        </div>
      </header>

      <!-- 文章正文 -->
      <div class="article-body" v-html="article.content"></div>

      <!-- 分享 -->
      <div class="article-share">
        <button @click="share">分享</button>
      </div>

      <!-- 相关文章 -->
      <section class="related-news">
        <h3>相关新闻</h3>
        <div v-for="item in relatedNews" :key="item.id" class="related-item">
          <NuxtLink :to="`/news/${item.slug}`">
            {{ item.title }}
          </NuxtLink>
        </div>
      </section>
    </div>

    <!-- 404 -->
    <div v-else class="error">
      <h1>新闻未找到</h1>
      <NuxtLink to="/">返回首页</NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts>
const route = useRoute()

// 获取新闻数据(使用ISR缓存)
const { data: article, pending } = await useFetch(
  `/api/news/${route.params.slug}`,
  {
    // 响应式缓存key
    key: () => `news-${route.params.slug}`
  }
)

// 获取相关新闻
const { data: relatedNews } = await useLazyFetch(
  `/api/news?category=${article.value?.category}&limit=5`
)

// 设置SEO元数据
watchEffect(() => {
  if (article.value) {
    useHead({
      title: article.value.title,
      meta: [
        { name: 'description', content: article.value.excerpt },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: article.value.title },
        { property: 'og:description', content: article.value.excerpt }
      ]
    })

    // 根据类型动态设置缓存时间
    definePageMeta({
      cache: {
        maxAge: article.value.type === 'breaking' ? 60 : 3600
      }
    })
  }
})

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 格式化日期
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const share = () => {
  if (navigator.share) {
    navigator.share({
      title: article.value?.title,
      url: window.location.href
    })
  }
}
</script>

<style scoped>
.news-article {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.article-header {
  margin-bottom: 2rem;
}

.article-type {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.breaking-badge {
  background: #ff4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.category-badge {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.article-header h1 {
  font-size: 2.5rem;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.article-meta {
  display: flex;
  gap: 2rem;
  color: #666;
  font-size: 0.875rem;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.article-body {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #333;
}

.updated {
  color: #ff9800;
}
</style>
```

#### 5. CMS集成触发

```typescript
// server/api/webhook/cms-update.ts
// CMS更新后触发重新验证
export default defineEventHandler(async (event) => {
  // 验证webhook签名
  const signature = getHeader(event, 'x-webhook-signature')

  if (signature !== process.env.WEBHOOK_SECRET) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // 获取更新的数据
  const body = await readBody(event)
  const { type, id, slug } = body

  // 触发重新验证
  const routesToRevalidate = []

  if (type === 'news') {
    routesToRevalidate.push(`/news/${slug}`)
    routesToRevalidate.push('/news')
    routesToRevalidate.push('/')
  }

  // 执行重新验证
  for (const route of routesToRevalidate) {
    try {
      await useStorage('cache').removeItem(`routes:${route}`)
      console.log(`Revalidated: ${route}`)
    } catch (error) {
      console.error(`Failed to revalidate ${route}:`, error)
    }
  }

  return {
    success: true,
    revalidated: routesToRevalidate
  }
})
```

---

### Stale-While-Revalidate

#### 配置SWR

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/api/**': {
      headers: {
        // 客户端缓存1分钟,后台最多使用5分钟
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
      }
    }
  }
})
```

#### 客户端SWR

```vue
<script setup lang="ts>
// 使用useLazyFetch实现SWR
const { data, refresh } = await useLazyFetch('/api/data', {
  // 获取缓存数据
  getCachedData: (key) => useNuxtData(key).data,

  // 后台刷新
  server: false
})

// 定时刷新
onMounted(() => {
  const interval = setInterval(() => {
    refresh()
  }, 60000) // 每分钟刷新

  onUnmounted(() => clearInterval(interval))
})
</script>
```

---

### 本章小结

#### ISR使用场景

| 场景 | Revalidate时间 | 原因 |
|------|---------------|------|
| **突发新闻** | 1分钟 | 需要快速更新 |
| **新闻列表** | 5分钟 | 定期更新 |
| **博客文章** | 1小时 | 更新不频繁 |
| **产品页面** | 15分钟 | 库存变化 |
| **用户资料** | 1天 | 很少变化 |

#### 最佳实践

1. **合理设置revalidate时间**: 平衡性能和实时性
2. **按需触发刷新**: 重要内容更新后立即刷新
3. **使用缓存键**: 避免不必要的重新生成
4. **监控缓存命中率**: 优化缓存策略
5. **错误处理**: 缓存失败时降级到SSR

---

**下一步学习**: 建议继续学习[动态路由与路由参数](./chapter-125)掌握高级路由功能。
