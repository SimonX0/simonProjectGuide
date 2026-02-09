# SSG静态站点生成

## SSG静态站点生成

> **为什么要学这一章?**
>
> 静态站点生成(SSG)可以在构建时预渲染页面为HTML,提供最佳性能和安全性。Nuxt 3支持全量静态生成和增量静态生成(ISR),让你根据需求选择最合适的策略。掌握SSG能让你构建超高性能的网站。
>
> **学习目标**:
>
> - 理解静态站点生成的工作原理
> - 掌握全量静态生成方法
> - 学会配置动态路由预渲染
> - 了解混合渲染模式
> - 能够构建静态博客网站

---

### 静态生成基础

#### 什么是SSG

**静态站点生成**(Static Site Generation)在构建时预渲染所有页面为静态HTML文件:

```
┌─────────────────────────────────────────────────────────────┐
│                    静态站点生成 (SSG)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  构建时 (Build Time):                                       │
│  ┌─────────────────────────────────────┐                   │
│  │ 1. 执行所有页面组件                                            │
│  │ 2. 获取数据                                    │
│  │ 3. 渲染为HTML                                               │
│  │ 4. 生成静态文件                                              │
│  └─────────────────────────────────────┘                   │
│                     ↓                                        │
│  生成静态文件:                                                │
│  /index.html                                                 │
│  /about/index.html                                           │
│  /blog/post-1/index.html                                     │
│  /blog/post-2/index.html                                     │
│                                                             │
│  运行时 (Runtime):                                           │
│  - 直接返回静态HTML                                           │
│  - 无需服务器                                                │
│  - 可部署到CDN                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### SSG vs SSR vs SPA

```
┌─────────────────────────────────────────────────────────────┐
│                    渲染模式对比                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SPA (Single Page Application)                              │
│  - 客户端渲染                                                │
│  - 交互性好                                                  │
│  - SEO差                                                     │
│  - 适合:后台系统                                             │
│                                                             │
│  SSR (Server-Side Rendering)                                │
│  - 服务端渲染                                                │
│  - SEO好                                                     │
│  - 需要服务器                                                │
│  - 适合:动态网站                                             │
│                                                             │
│  SSG (Static Site Generation)                               │
│  - 构建时预渲染                                              │
│  - 性能最好                                                   │
│  - 无需服务器                                                │
│  - 适合:内容网站                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 全量静态生成

#### 配置静态生成

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 启用静态生成
  ssr: true,

  // 生成配置
  nitro: {
    prerender: {
      // 预渲染的路线
      routes: [
        '/',
        '/about',
        '/contact'
      ],

      // 抓取子链接
      crawlLinks: true,

      // 并发请求数
      concurrency: 5,

      // 忽略路由
      ignore: [
        '/api',
        '/admin'
      ]
    }
  }
})
```

#### 构建静态站点

```bash
# 生成静态站点
npm run generate

# 或者
nuxt generate

# 输出:
# ├─ .output/public/
# │  ├─ index.html
# │  ├─ about/
# │  │  └─ index.html
# │  ├─ _nuxt/
# │  │  ├─ entry.js
# │  │  └─ ...
# │  └─ ...
```

#### 静态页面示例

```vue
<!-- pages/index.vue -->
<template>
  <div class="home">
    <h1>欢迎来到静态博客</h1>
    <p>这个页面在构建时预渲染为静态HTML</p>

    <!-- 文章列表(构建时获取) -->
    <div v-if="posts">
      <article v-for="post in posts" :key="post.id">
        <h2>{{ post.title }}</h2>
        <p>{{ post.excerpt }}</p>
        <NuxtLink :to="`/blog/${post.slug}`">
          阅读更多
        </NuxtLink>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts>
// 在构建时获取数据
const { data: posts } = await useFetch('/api/posts')

// 设置页面元数据
useHead({
  title: '首页',
  meta: [
    { name: 'description', content: '静态博客示例' }
  ]
})
</script>
```

---

### 动态路由预渲染

#### 预渲染动态路由

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: [
        // 静态路由
        '/',

        // 动态路由参数
        '/blog/post-1',
        '/blog/post-2',
        '/blog/post-3'
      ],

      // 抓取链接自动发现
      crawlLinks: true
    }
  }
})
```

#### 使用generate函数

```typescript
// composables/usePosts.ts
export const useGenerateRoutes = async () => {
  // 获取所有文章
  const { data: posts } = await useFetch('/api/posts')

  // 生成路由数组
  const routes = posts.value?.map(post => `/blog/${post.slug}`) || []

  return routes
}

// nuxt.config.ts
export default defineNuxtConfig({
  hooks: {
    async 'nitro:generate'() {
      // 动态生成路由
      const routes = await useGenerateRoutes()

      // 添加到预渲染列表
      return routes
    }
  }
})
```

#### 文章详情页

```vue
<!-- pages/blog/[slug].vue -->
<template>
  <article class="post">
    <!-- 加载状态 -->
    <div v-if="pending">
      <LoadingSpinner />
    </div>

    <!-- 文章内容 -->
    <div v-else-if="post">
      <h1>{{ post.title }}</h1>
      <p class="meta">
        <span>{{ formatDate(post.publishedAt) }}</span>
        <span>{{ post.author.name }}</span>
      </p>
      <div class="content" v-html="post.content"></div>
    </div>

    <!-- 404 -->
    <div v-else>
      <h1>文章未找到</h1>
      <NuxtLink to="/">返回首页</NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts>
const route = useRoute()

// 获取文章数据
const { data: post, pending } = await useFetch(
  `/api/posts/${route.params.slug}`
)

// 设置SEO元数据
useHead({
  title: computed(() => post.value?.title || '文章详情')
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>
```

---

### 预渲染配置

#### routeRules配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 路由规则
  routeRules: {
    // 首页 - 静态生成
    '/': { prerender: true },

    // 博客列表 - 静态生成
    '/blog': { prerender: true },

    // 博客文章 - 静态生成
    '/blog/**': { prerender: true },

    // 关于页面 - 静态生成
    '/about': { prerender: true },

    // API路由 - 不预渲染
    '/api/**': { prerender: false },

    // 管理后台 - SPA模式
    '/admin/**': { ssr: false, prerender: false }
  }
})
```

#### 混合渲染模式

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // 静态页面
    '/': { prerender: true },
    '/about': { prerender: true },
    '/contact': { prerender: true },

    // SSR页面
    '/blog': { ssr: true },
    '/blog/**': { ssr: true },

    // SPA页面
    '/admin/**': { ssr: false },

    // ISR页面(增量静态生成)
    '/products/**': { isr: 60 } // 60秒重新生成

    // 重定向
    '/old-page': { redirect: '/new-page' },

    // Headers
    '/api/**': {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  }
})
```

---

### 实战案例:静态博客

构建一个完整的静态博客网站。

#### 1. 项目结构

```bash
static-blog/
├── pages/
│   ├── index.vue             # 首页
│   ├── blog/
│   │   ├── index.vue         # 博客列表
│   │   └── [slug].vue        # 文章详情
│   ├── about.vue             # 关于
│   └── contact.vue           # 联系
├── components/
│   ├── Header.vue
│   ├── Footer.vue
│   ├── PostCard.vue
│   └── Pagination.vue
└── server/
    └── api/
        └── posts.ts          # 数据API
```

#### 2. 数据API

```typescript
// server/api/posts.ts
// 模拟博客文章数据
const posts = [
  {
    id: 1,
    slug: 'getting-started-with-nuxt-3',
    title: 'Nuxt 3 入门指南',
    excerpt: '学习如何使用Nuxt 3构建现代化的Web应用...',
    content: '<p>完整的文章内容...</p>',
    author: { name: '张三', avatar: '/avatars/zhang.jpg' },
    publishedAt: '2024-01-15',
    readingTime: 5,
    tags: ['Nuxt', 'Vue', '前端'],
    cover: '/images/nuxt3-cover.jpg'
  },
  {
    id: 2,
    slug: 'vue-3-composition-api',
    title: 'Vue 3 组合式API详解',
    excerpt: '深入理解Vue 3的组合式API...',
    content: '<p>完整的文章内容...</p>',
    author: { name: '李四', avatar: '/avatars/li.jpg' },
    publishedAt: '2024-01-10',
    readingTime: 8,
    tags: ['Vue', 'JavaScript'],
    cover: '/images/vue3-cover.jpg'
  }
]

export default defineEventHandler((event) => {
  // 获取查询参数
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10

  // 分页
  const start = (page - 1) * limit
  const end = start + limit

  const paginatedPosts = posts.slice(start, end)

  return {
    posts: paginatedPosts,
    total: posts.length,
    page,
    totalPages: Math.ceil(posts.length / limit)
  }
})

// server/api/posts/[slug].ts
export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')

  // 查找文章
  const post = posts.find(p => p.slug === slug)

  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: '文章未找到'
    })
  }

  return post
})
```

#### 3. 首页

```vue
<!-- pages/index.vue -->
<template>
  <div class="home">
    <!-- Hero区域 -->
    <section class="hero">
      <h1>欢迎来到我的博客</h1>
      <p>分享技术,记录生活</p>
    </section>

    <!-- 最新文章 -->
    <section class="latest-posts">
      <h2>最新文章</h2>

      <div v-if="pending" class="loading">
        加载中...
      </div>

      <div v-else class="post-grid">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
        />
      </div>

      <div class="view-all">
        <NuxtLink to="/blog">查看所有文章 →</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts>
useHead({
  title: '首页',
  meta: [
    { name: 'description', content: '欢迎来到我的博客' }
  ]
})

const { data: response, pending } = await useFetch('/api/posts?limit=6')

const posts = computed(() => response.value?.posts || [])
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 6rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 4rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.latest-posts h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.view-all {
  text-align: center;
  margin-top: 3rem;
}

.view-all a {
  display: inline-block;
  padding: 1rem 2rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
}
</style>
```

#### 4. 博客列表页

```vue
<!-- pages/blog/index.vue -->
<template>
  <div class="blog-page">
    <h1>博客</h1>

    <!-- 文章列表 -->
    <div v-if="pending" class="loading">
      加载中...
    </div>

    <div v-else>
      <div class="post-list">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
        />
      </div>

      <!-- 分页 -->
      <Pagination
        :current-page="page"
        :total-pages="totalPages"
        @change="changePage"
      />
    </div>
  </div>
</template>

<script setup lang="ts>
const page = ref(1)
const limit = 10

const { data: response, pending } = await useFetch(
  () => `/api/posts?page=${page.value}&limit=${limit}`,
  {
    watch: [page]
  }
)

const posts = computed(() => response.value?.posts || [])
const totalPages = computed(() => response.value?.totalPages || 1)

const changePage = (newPage: number) => {
  page.value = newPage
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

useHead({
  title: '博客'
})
</script>
```

#### 5. 构建脚本

```typescript
// scripts/generate-routes.ts
import { createRouter } from 'radix3'

export const generateRoutes = async () => {
  // 获取所有文章
  const { data: posts } = await $fetch('/api/posts')

  // 生成路由
  const routes = [
    '/',
    '/blog',
    '/about',
    '/contact',
    ...posts.map((post: any) => `/blog/${post.slug}`)
  ]

  return routes
}

// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      // 使用脚本生成路由
      routes: await generateRoutes(),

      // 抓取链接
      crawlLinks: true
    }
  }
})
```

#### 6. 部署配置

```bash
# 构建静态站点
npm run generate

# 部署到Vercel
# 在项目根目录创建 vercel.json
{
  "rewrites": [
    { "source": "/:path*", "destination": "/index.html" }
  ]
}

# 部署到Netlify
# 创建 netlify.toml
[build]
  command = "npm run generate"
  publish = ".output/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 性能优化

#### 1. 图片优化

```vue
<template>
  <!-- 使用Nuxt Image模块 -->
  <NuxtImg
    :src="post.cover"
    :alt="post.title"
    width="800"
    height="450"
    loading="lazy"
    format="webp"
  />
</template>
```

#### 2. 代码分割

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  build: {
    // 代码分割
    splitChunks: {
      layouts: true,
      pages: true,
      commons: true
    }
  }
})
```

#### 3. 预加载资源

```vue
<script setup lang="ts>
useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: '/images/hero-bg.jpg'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    }
  ]
})
</script>
```

---

### 本章小结

#### 渲染模式选择

| 场景 | 推荐模式 | 原因 |
|------|---------|------|
| **企业官网** | SSG | 内容固定,性能最佳 |
| **营销页面** | SSG | SEO友好,加载快 |
| **博客/文档** | SSG/ISR | 内容更新不频繁 |
| **新闻网站** | ISR | 内容定期更新 |
| **电商网站** | SSR | 数据实时性强 |
| **后台系统** | SPA | 交互复杂,无需SEO |

#### 最佳实践

1. **预渲染关键页面**: 首页、列表页
2. **动态路由预生成**: 使用generate函数
3. **合理使用ISR**: 平衡性能和实时性
4. **优化构建时间**: 避免过度预渲染
5. **CDN部署**: 静态资源托管到CDN

---

**下一步学习**: 建议继续学习[ISR增量静态再生](./chapter-124)了解增量静态生成技术。
