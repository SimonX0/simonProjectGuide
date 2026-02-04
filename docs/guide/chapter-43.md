# 服务端渲染(SSR)与Nuxt.js完全指南

## 服务端渲染(SSR)与Nuxt.js完全指南
> **学习目标**：掌握Vue3服务端渲染技术和Nuxt.js框架
> **核心内容**：SSR原理、Nuxt.js基础、SEO优化、服务端渲染实战

### 服务端渲染(SSR)基础

#### 什么是服务端渲染

**服务端渲染 (Server-Side Rendering, SSR)** 是指在服务器端生成完整的HTML页面，然后发送给客户端进行展示。

```
┌─────────────────────────────────────────────────────────────────┐
│                    传统 SPA (单页应用) 流程                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  客户端浏览器                                                    │
│       ↓                                                         │
│  下载空的 HTML                                                   │
│       ↓                                                         │
│  下载 JS bundle                                                 │
│       ↓                                                         │
│  执行 JS，生成 DOM                                              │
│       ↓                                                         │
│  用户看到完整页面                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SSR (服务端渲染) 流程                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  客户端请求                                                      │
│       ↓                                                         │
│  服务器接收请求                                                  │
│       ↓                                                         │
│  执行 Vue 代码，生成 HTML                                        │
│       ↓                                                         │
│  返回完整的 HTML 给客户端                                        │
│       ↓                                                         │
│  用户立即看到内容（首次屏快）                                    │
│       ↓                                                         │
│  JS 加载完成，Vue 接管（成为可交互的 SPA）                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### SSR vs CSR 对比

| 特性 | SPA (CSR) | SSR | 说明 |
|------|-----------|-----|------|
| **首屏速度** | 较慢 | 快 | SSR直接返回完整HTML |
| **SEO友好** | 差 | 好 | 搜索引擎可以直接抓取HTML |
| **TTFB** | 快 | 慢 | SSR需要服务器处理 |
| **客户端压力** | 大 | 小 | SSR在服务器完成渲染 |
| **服务器压力** | 小 | 大 | SSR需要渲染资源 |
| **开发复杂度** | 低 | 高 | SSR需要考虑服务器环境 |
| ** hydration** | 不需要 | 需要 | 客户端激活静态HTML |

#### SSR 的优缺点

**优点：**
1. **更好的 SEO** - 搜索引擎可以直接抓取页面内容
2. **更快的首屏** - 服务器直接返回渲染好的HTML
3. **更好的用户体验** - 用户无需等待JS加载就能看到内容
4. **社交分享优化** - 微信、Facebook等分享链接能显示预览

**缺点：**
1. **服务器成本** - 需要服务器渲染资源
2. **开发复杂** - 需要考虑服务器和客户端两种环境
3. **生命周期限制** - 某些浏览器API在服务器不可用
4. **调试困难** - 错误可能来自服务器或客户端

#### SSR 适用场景

✅ **推荐使用 SSR：**
- 需要 SEO 的内容网站（博客、新闻、电商）
- 首屏加载速度要求高的应用
- 社交媒体分享频繁的页面
- 内容驱动的网站

❌ **不推荐使用 SSR：**
- 后台管理系统
- 需要复杂客户端交互的应用
- 实时性要求高的应用
- 低流量、个人项目

---

### Nuxt.js 框架简介

#### 什么是 Nuxt.js

**Nuxt.js** 是基于 Vue.js 的通用应用框架，它预设了利用 Vue.js 开发服务端渲染的应用所需要的各种配置。

```
┌─────────────────────────────────────────────────────────────────┐
│                        Nuxt.js 架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Nuxt.js 应用层                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Pages      │  Components  │  Assets  │  Middleware      │  │
│  │  (页面)      │  (组件)       │  (资源)   │  (中间件)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Nuxt.js Core                           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Routing    │  Data Fetching │  Rendering │  Modules     │  │
│  │  (路由)      │  (数据获取)     │  (渲染)    │  (模块)       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Vue.js Runtime                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌────────────────┐              ┌────────────────┐            │
│  │   Server Side  │              │  Client Side   │            │
│  │   (Node.js)    │              │   (Browser)    │            │
│  └────────────────┘              └────────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Nuxt.js 核心特性

| 特性 | 说明 |
|------|------|
| **自动路由** | 基于 `pages/` 目录自动生成路由 |
| **代码分割** | 自动分割代码，按需加载 |
| **服务端渲染** | 开箱即用的 SSR 支持 |
| **静态站点生成** | 可生成静态 HTML（预渲染） |
| **TypeScript 支持** | 完整的 TypeScript 支持 |
| **热模块替换** | 开发时快速更新 |
| **SEO 优化** | Meta 标签管理、sitemap 生成 |
| **模块生态** | 丰富的官方和社区模块 |

#### Nuxt.js 版本选择

- **Nuxt 2** - 基于 Vue 2，维护模式
- **Nuxt 3** - 基于 Vue 3，推荐使用 ✅

```bash
# 创建 Nuxt 3 项目
npx nuxi@latest init my-nuxt-app
```

---

### 创建 Nuxt.js 项目

#### 环境要求

```bash
# Node.js 版本要求
Node.js >= 16.x

# 推荐 LTS 版本
Node.js >= 18.x
```

#### 创建项目

**方式一：使用 npx（推荐）**

```bash
# 1. 创建新项目
npx nuxi@latest init my-nuxt-app

# 2. 进入项目目录
cd my-nuxt-app

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
```

**方式二：使用 VS Code 扩展**

安装 `Nuxt` 扩展，使用命令面板：
```
Ctrl/Cmd + Shift + P
> Nuxt: New Project from Starter
```

#### 项目结构

```
my-nuxt-app/
├── .nuxt/                 # 构建输出目录（自动生成）
├── .output/               # 静态生成输出目录
├── node_modules/          # 依赖包
├── public/                # 静态资源（直接访问）
│   ├── favicon.ico
│   └── images/
├── server/                # 服务端代码
│   ├── api/               # API 路由
│   ├── middleware/        # 服务端中间件
│   └── plugins/           # 服务端插件
├── src/                   # 源代码目录（可选）
│   ├── components/        # Vue 组件
│   ├── composables/       # 组合式函数
│   ├── layouts/           # 布局组件
│   ├── middleware/        # 中间件
│   ├── pages/             # 页面（自动生成路由）
│   ├── plugins/           # 插件
│   └── types/             # TypeScript 类型
├── types/                 # 全局类型声明
├── .gitignore
├── .nuxtrc.ts            # Nuxt 配置文件
├── app.vue               # 应用根组件
├── nuxt.config.ts        # Nuxt 配置
├── package.json
├── tsconfig.json
└── README.md
```

#### 配置文件

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 应用元信息
  app: {
    head: {
      title: '我的 Nuxt 应用',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Nuxt 3 应用' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // 开发工具
  devtools: { enabled: true },

  // 模块
  modules: [],

  // CSS 配置
  css: ['~/assets/css/main.css'],

  // 构建配置
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/scss/variables" as *;`
        }
      }
    }
  },

  // 运行时配置
  runtimeConfig: {
    // 服务端可用
    apiSecret: process.env.API_SECRET,
    // 客户端和服务端都可用
    public: {
      apiBase: process.env.API_BASE_URL || '/api'
    }
  },

  // 兼容性
  compatibility: {
    // Nuxt 2 兼容模式
    nuxt: false
  }
})
```

---

### 页面和路由

#### 文件路由系统

Nuxt 3 基于文件系统自动生成路由，无需手动配置路由表。

```
pages/
├── index.vue              # / (首页)
├── about.vue              # /about
├── users/
│   ├── index.vue          # /users
│   ├── [id].vue           # /users/:id (动态路由)
│   └── profile/
│       └── [username].vue # /users/profile/:username
└── posts/
    ├── [slug]/            # /posts/:slug
    │   └── index.vue
    └── [...slug].vue      # /posts/* (通配符路由)
```

#### 基础页面

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1>欢迎来到 Nuxt 3</h1>
    <p>{{ message }}</p>

    <NuxtLink to="/about">关于我们</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const message = ref('Hello, Nuxt 3!')
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
```

#### 动态路由

```vue
<!-- pages/users/[id].vue -->
<template>
  <div>
    <h1>用户详情</h1>
    <p>用户ID: {{ user.id }}</p>
    <p>用户名: {{ user.name }}</p>
    <p>邮箱: {{ user.email }}</p>

    <NuxtLink to="/users">返回用户列表</NuxtLink>
  </div>
</template>

<script setup lang="ts">
// 获取路由参数
const route = useRoute()
const userId = route.params.id

// 获取用户数据
const { data: user } = await useFetch(`/api/users/${userId}`)

// 设置页面元信息
useHead({
  title: `用户 ${user.value?.name}`,
  meta: [
    { name: 'description', content: `${user.value?.name} 的个人资料` }
  ]
})
</script>
```

#### 嵌套路由

```
pages/
├── parent/
│   ├── index.vue         # /parent
│   └── child.vue         # /parent/child
```

```vue
<!-- pages/parent/index.vue -->
<template>
  <div>
    <h1>父页面</h1>
    <NuxtLink to="/parent/child">前往子页面</NuxtLink>

    <!-- 渲染子页面 -->
    <NuxtPage />
  </div>
</template>
```

```vue
<!-- pages/parent/child.vue -->
<template>
  <div>
    <h2>子页面</h2>
    <p>这是嵌套在父页面中的内容</p>
  </div>
</template>
```

---

### 数据获取

#### useFetch 组合式函数

`useFetch` 是 Nuxt 3 中最常用的数据获取方式，它会在服务端渲染时获取数据，并在客户端进行水合。

```vue
<!-- pages/posts/[id].vue -->
<template>
  <div>
    <div v-if="pending">
      <p>加载中...</p>
    </div>
    <div v-else-if="error">
      <p>错误: {{ error.message }}</p>
    </div>
    <div v-else>
      <h1>{{ post.title }}</h1>
      <p>{{ post.content }}</p>
      <p>作者: {{ post.author }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// 获取数据
const { data: post, pending, error, refresh } = await useFetch(
  `/api/posts/${route.params.id}`,
  {
    // 请求选项
    method: 'GET',
    headers: {
      'Authorization': 'Bearer xxx'
    },
    // 响应转换
    transform: (response) => response.data,
    // 缓存选项
    getCachedData: (key) => useNuxtData(key),
    // 延迟获取（导航前不等待）
    lazy: false
  }
)

// 刷新数据
function refreshPost() {
  refresh()
}
</script>
```

#### useAsyncData

`useAsyncData` 提供了更底层的数据获取控制。

```vue
<script setup lang="ts">
// 使用 async/await
const { data, pending, error } = await useAsyncData(
  'posts',
  () => $fetch('/api/posts')
)

// 带参数的请求
const { data: user } = await useAsyncData(
  `user-${route.params.id}`,
  () => $fetch(`/api/users/${route.params.id}`)
)

// 自定义处理
const { data: posts } = await useAsyncData(
  'posts',
  () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve($fetch('/api/posts'))
      }, 1000)
    })
  }
)
</script>
```

#### useLazyFetch

`useLazyFetch` 不会阻塞导航，适合非关键数据。

```vue
<template>
  <div>
    <h1>文章列表</h1>

    <!-- 立即显示页面，数据异步加载 -->
    <div v-if="posts">
      <div v-for="post in posts" :key="post.id">
        <h2>{{ post.title }}</h2>
      </div>
    </div>
    <div v-else>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// lazy 模式，不阻塞导航
const { data: posts } = await useLazyFetch('/api/posts')
</script>
```

#### 数据缓存控制

```vue
<script setup lang="ts">
// 设置缓存过期时间
const { data } = await useFetch('/api/posts', {
  getCachedData: (key) => {
    const cached = useNuxtData(key)
    if (!cached.value) return

    // 检查缓存是否过期（5分钟）
    const expires = cached.value.fetchedAt + 5 * 60 * 1000
    if (Date.now() < expires) {
      return cached.value
    }
  }
})

// 手动清除缓存
function clearCache() {
  clearNuxtData('posts')
}
</script>
```

---

### 组件系统

#### 组件自动导入

Nuxt 3 会自动导入 `components/` 目录下的组件，无需手动 import。

```
components/
├── Header.vue          # <Header />
├── Footer.vue          # <Footer />
├── TheHeader.vue       # <TheHeader />
└── base/
    ├── Button.vue      # <BaseButton />
    └── Input.vue       # <BaseInput />
```

```vue
<!-- 在任何页面或组件中使用 -->
<template>
  <div>
    <!-- 直接使用，无需 import -->
    <Header />
    <BaseButton>点击</BaseButton>
    <BaseInput />
    <Footer />
  </div>
</template>
```

#### 创建组件

```vue
<!-- components/UserCard.vue -->
<template>
  <div class="user-card">
    <img :src="user.avatar" :alt="user.name" />
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    <slot>
      <!-- 默认插槽 -->
    </slot>
    <slot name="actions">
      <!-- 命名插槽 -->
    </slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  user: {
    id: number
    name: string
    email: string
    avatar: string
  }
}

const props = defineProps<Props>()

// 定义事件
const emit = defineEmits<{
  click: [user: Props['user']]
}>()

function handleClick() {
  emit('click', props.user)
}
</script>

<style scoped>
.user-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
}
</style>
```

```vue
<!-- 使用组件 -->
<template>
  <div>
    <UserCard :user="userData" @click="handleUserClick">
      <template #default>
        <p>这是额外内容</p>
      </template>
      <template #actions>
        <button>关注</button>
      </template>
    </UserCard>
  </div>
</template>
```

#### 组合式函数 (Composables)

```typescript
// composables/usePosts.ts
export const usePosts = () => {
  const posts = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchPosts() {
    loading.value = true
    error.value = null

    try {
      posts.value = await $fetch('/api/posts')
    } catch (e: any) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function createPost(postData: any) {
    loading.value = true
    try {
      const newPost = await $fetch('/api/posts', {
        method: 'POST',
        body: postData
      })
      posts.value.push(newPost)
      return newPost
    } finally {
      loading.value = false
    }
  }

  // 组合式函数会自动返回
  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost
  }
}
```

```vue
<!-- 在页面中使用 -->
<script setup lang="ts">
const { posts, loading, fetchPosts } = usePosts()

// 初始加载
onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <div v-for="post in posts" :key="post.id">
        {{ post.title }}
      </div>
    </div>
  </div>
</template>
```

---

### 布局系统

#### 默认布局

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <Header />

    <main>
      <!-- 页面内容 -->
      <slot />
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
// 使用组合式函数
useHead({
  htmlAttrs: {
    lang: 'zh-CN'
  }
})
</script>
```

#### 自定义布局

```vue
<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <AdminMenu />
    </aside>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
}

.content {
  flex: 1;
  padding: 20px;
}
</style>
```

#### 在页面中使用布局

```vue
<!-- pages/admin/dashboard.vue -->
<template>
  <div>
    <h1>管理后台</h1>
    <p>这是管理后台页面</p>
  </div>
</template>

<script setup lang="ts">
// 使用自定义布局
definePageMeta({
  layout: 'admin'
})
</script>
```

#### 动态布局

```vue
<script setup lang="ts">
const layout = ref('default')

function toggleLayout() {
  layout.value = layout.value === 'default' ? 'admin' : 'default'
}

definePageMeta({
  layout: false  // 禁用布局
})
</script>

<template>
  <div>
    <NuxtLayout :name="layout">
      <template #fallback>
        <p>正在加载布局...</p>
      </template>

      <button @click="toggleLayout">切换布局</button>

      <h1>使用动态布局的页面</h1>
    </NuxtLayout>
  </div>
</template>
```

---

### SEO 优化

#### 设置页面 Meta 信息

```vue
<!-- pages/blog/[slug].vue -->
<template>
  <div>
    <article>
      <h1>{{ post.title }}</h1>
      <p>{{ post.content }}</p>
    </article>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)

// 设置页面 Meta 信息
useHead({
  title: post.value?.title,
  meta: [
    { name: 'description', content: post.value?.excerpt },
    { property: 'og:title', content: post.value?.title },
    { property: 'og:description', content: post.value?.excerpt },
    { property: 'og:image', content: post.value?.coverImage },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
  link: [
    { rel: 'canonical', href: `https://example.com/blog/${route.params.slug}` }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.value?.title,
        image: post.value?.coverImage,
        datePublished: post.value?.publishedAt
      })
    }
  ]
})
</script>
```

#### 使用 useSeoMeta 组合式函数

```vue
<script setup lang="ts">
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)

useSeoMeta({
  title: post.value?.title,
  description: post.value?.excerpt,
  ogTitle: post.value?.title,
  ogDescription: post.value?.excerpt,
  ogImage: post.value?.coverImage,
  twitterCard: 'summary_large_image',
  twitterTitle: post.value?.title,
  twitterDescription: post.value?.excerpt,
  twitterImage: post.value?.coverImage
})
</script>
```

#### 全局 SEO 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'description', content: '我的 Nuxt 3 应用' },
        { name: 'keywords', content: 'Nuxt, Vue3, SSR' },
        { property: 'og:type', content: 'website' },
        { property='og:site_name', content: '我的应用' },
        { property='og:locale', content: 'zh_CN' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://example.com' }
      ]
    }
  }
})
```

#### 生成 Sitemap

```bash
# 安装 @nuxtjs/sitemap 模块
npm install @nuxtjs/sitemap
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],

  sitemap: {
    hostname: 'https://example.com',
    routes: async () => {
      // 动态生成路由
      const posts = await $fetch('/api/posts')
      return posts.map((post: any) => ({
        url: `/blog/${post.slug}`,
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date(post.updatedAt)
      }))
    }
  }
})
```

---

### Nuxt.js 实战案例

#### 博客系统完整实现

**项目结构：**

```
nuxt-blog/
├── components/
│   ├── Header.vue
│   ├── Footer.vue
│   ├── PostCard.vue
│   └── PostList.vue
├── composables/
│   ├── usePosts.ts
│   └── useAuth.ts
├── layouts/
│   ├── default.vue
│   └── admin.vue
├── pages/
│   ├── index.vue              # 首页
│   ├── blog/
│   │   ├── index.vue          # 文章列表
│   │   └── [slug].vue         # 文章详情
│   └── admin/
│       ├── index.vue          # 管理后台首页
│       └── posts/
│           ├── index.vue      # 文章管理
│           └── [id]/edit.vue  # 编辑文章
├── server/
│   └── api/
│       └── posts/
│           └── [id].ts        # API 路由
└── types/
    └── posts.ts
```

**类型定义：**

```typescript
// types/posts.ts
export interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  author: {
    id: number
    name: string
    avatar: string
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface PostFormData {
  title: string
  content: string
  excerpt: string
  coverImage: string
  tags: string[]
}
```

**组合式函数：**

```typescript
// composables/usePosts.ts
export const usePosts = () => {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<any>(null)

  async function fetchPosts() {
    loading.value = true
    try {
      const data = await $fetch<Post[]>('/api/posts')
      posts.value = data
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function fetchPost(slug: string) {
    const { data, pending, error } = await useFetch<Post>(`/api/posts/${slug}`)
    return { data, pending, error }
  }

  async function createPost(formData: PostFormData) {
    loading.value = true
    try {
      const newPost = await $fetch<Post>('/api/posts', {
        method: 'POST',
        body: formData
      })
      posts.value.unshift(newPost)
      return newPost
    } finally {
      loading.value = false
    }
  }

  async function updatePost(id: number, formData: PostFormData) {
    loading.value = true
    try {
      const updated = await $fetch<Post>(`/api/posts/${id}`, {
        method: 'PATCH',
        body: formData
      })
      const index = posts.value.findIndex(p => p.id === id)
      if (index !== -1) {
        posts.value[index] = updated
      }
      return updated
    } finally {
      loading.value = false
    }
  }

  async function deletePost(id: number) {
    await $fetch(`/api/posts/${id}`, { method: 'DELETE' })
    posts.value = posts.value.filter(p => p.id !== id)
  }

  return {
    posts,
    loading,
    error,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost
  }
}
```

**首页：**

```vue
<!-- pages/index.vue -->
<template>
  <div class="home-page">
    <section class="hero">
      <h1>欢迎来到我的博客</h1>
      <p>分享技术，记录生活</p>
      <NuxtLink to="/blog" class="btn">
        浏览文章
      </NuxtLink>
    </section>

    <section class="featured-posts">
      <h2>精选文章</h2>
      <PostList :posts="featuredPosts" :limit="3" />
    </section>
  </div>
</template>

<script setup lang="ts">
const { data: featuredPosts } = await useFetch<Post[]>('/api/posts/featured')

useHead({
  title: '首页',
  meta: [
    { name: 'description', content: '欢迎来到我的技术博客' }
  ]
})
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 100px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  background: white;
  color: #667eea;
  border-radius: 8px;
  text-decoration: none;
  margin-top: 20px;
}
</style>
```

**文章列表页：**

```vue
<!-- pages/blog/index.vue -->
<template>
  <div class="blog-page">
    <div class="container">
      <h1>所有文章</h1>

      <!-- 筛选器 -->
      <div class="filters">
        <select v-model="selectedTag" @change="filterPosts">
          <option value="">所有标签</option>
          <option v-for="tag in tags" :key="tag" :value="tag">
            {{ tag }}
          </option>
        </select>
      </div>

      <!-- 文章列表 -->
      <div v-if="pending" class="loading">
        加载中...
      </div>
      <div v-else class="post-list">
        <PostCard
          v-for="post in filteredPosts"
          :key="post.id"
          :post="post"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: posts, pending } = await useFetch<Post[]>('/api/posts')
const selectedTag = ref('')

// 提取所有标签
const tags = computed(() => {
  const tagSet = new Set<string>()
  posts.value?.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet)
})

// 筛选文章
const filteredPosts = computed(() => {
  if (!selectedTag.value) return posts.value
  return posts.value?.filter(post =>
    post.tags.includes(selectedTag.value)
  )
})

// 设置 SEO
useHead({
  title: '博客 - 所有文章',
  meta: [
    { name: 'description', content: '浏览所有技术文章' }
  ]
})
</script>
```

**文章详情页：**

```vue
<!-- pages/blog/[slug].vue -->
<template>
  <article class="post-detail">
    <div v-if="pending" class="loading">加载中...</div>

    <div v-else-if="error" class="error">
      文章不存在
    </div>

    <div v-else-if="post" class="content">
      <!-- 文章头部 -->
      <header class="post-header">
        <div class="cover-image">
          <img :src="post.coverImage" :alt="post.title" />
        </div>
        <div class="meta">
          <h1>{{ post.title }}</h1>
          <p class="excerpt">{{ post.excerpt }}</p>
          <div class="author">
            <img :src="post.author.avatar" :alt="post.author.name" />
            <span>{{ post.author.name }}</span>
            <time>{{ formatDate(post.createdAt) }}</time>
          </div>
          <div class="tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">
              #{{ tag }}
            </span>
          </div>
        </div>
      </header>

      <!-- 文章内容 -->
      <div class="post-content" v-html="post.content" />

      <!-- 相关文章 -->
      <section class="related-posts">
        <h2>相关文章</h2>
        <PostList :posts="relatedPosts" :limit="3" />
      </section>

      <!-- 评论 -->
      <section class="comments">
        <h2>评论</h2>
        <Comments :post-id="post.id" />
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()

// 获取文章数据
const { data: post, pending, error } = await useFetch<Post>(
  `/api/posts/${route.params.slug}`
)

// 获取相关文章
const { data: relatedPosts } = await useFetch<Post[]>(
  `/api/posts/${route.params.slug}/related`
)

// 设置 SEO
useHead({
  title: () => post.value?.title || '文章详情',
  meta: () => [
    { name: 'description', content: post.value?.excerpt },
    { property: 'og:title', content: post.value?.title },
    { property: 'og:description', content: post.value?.excerpt },
    { property: 'og:image', content: post.value?.coverImage },
    { property: 'article:published_time', content: post.value?.createdAt },
    { property: 'article:author', content: post.value?.author.name }
  ],
  script: () => [{
    type: 'application/ld+json',
    children: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.value?.title,
      image: post.value?.coverImage,
      datePublished: post.value?.createdAt,
      author: {
        '@type': 'Person',
        name: post.value?.author.name
      }
    })
  }]
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.post-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.cover-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
}

.meta {
  margin-top: 20px;
}

.meta h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.author img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 16px;
  font-size: 14px;
}

.post-content {
  margin-top: 40px;
  line-height: 1.8;
  font-size: 1.1rem;
}
</style>
```

**API 路由（服务端）：**

```typescript
// server/api/posts/[id].ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // 从数据库获取文章
  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  })

  if (!post) {
    throw createError({
      statusCode: 404,
      message: '文章不存在'
    })
  }

  return post
})
```

**管理后台：**

```vue
<!-- pages/admin/posts/index.vue -->
<template>
  <div class="admin-posts">
    <div class="header">
      <h1>文章管理</h1>
      <NuxtLink to="/admin/posts/new" class="btn-primary">
        新建文章
      </NuxtLink>
    </div>

    <table class="posts-table">
      <thead>
        <tr>
          <th>标题</th>
          <th>状态</th>
          <th>发布时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post.id">
          <td>{{ post.title }}</td>
          <td>{{ post.status }}</td>
          <td>{{ formatDate(post.createdAt) }}</td>
          <td>
            <NuxtLink :to="`/admin/posts/${post.id}/edit`">
              编辑
            </NuxtLink>
            <button @click="handleDelete(post.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts>
definePageMeta({
  layout: 'admin',
  middleware: 'auth'  // 需要认证
})

const { posts, fetchPosts, deletePost } = usePosts()

onMounted(() => {
  fetchPosts()
})

async function handleDelete(id: number) {
  if (confirm('确定删除这篇文章吗？')) {
    await deletePost(id)
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>
```

---

### 部署 Nuxt.js 应用

#### 构建 SSR 应用

```bash
# 构建生产版本
npm run build

# 启动生产服务器
node .output/server/index.ts
```

#### 生成静态站点

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/sitemap.xml']
    }
  }
})
```

```bash
# 生成静态站点
npm run generate

# 输出到 .output/public 目录
```

#### 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

**vercel.json：**

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nuxtjs",
  "regions": ["hkg1"]
}
```

#### 部署到 Node.js 服务器

```bash
# 1. 构建应用
npm run build

# 2. 上传到服务器
scp -r .output user@server:/var/www/nuxt-app

# 3. 使用 PM2 运行
pm2 start /var/www/nuxt-app/server/index.ts --name nuxt-app
```

**ecosystem.config.js：**

```javascript
module.exports = {
  apps: [{
    name: 'nuxt-app',
    script: './.output/server/index.ts',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

---

### 本章小结

| 内容 | 关键点 |
|------|--------|
| **SSR 原理** | 服务端渲染HTML → 客户端激活 → 交互 |
| **Nuxt.js 特性** | 自动路由、组件导入、数据获取、SEO优化 |
| **数据获取** | useFetch / useAsyncData / useLazyFetch |
| **路由系统** | 基于文件的路由、动态路由、嵌套路由 |
| **SEO 优化** | useHead / useSeoMeta / Sitemap |
| **部署方式** | SSR 部署 / 静态生成 / 平台部署 |

**学习建议：**
1. 先理解 SSR 的原理和场景
2. 从简单项目开始实践 Nuxt.js
3. 重点掌握数据获取和 SEO 优化
4. 了解不同部署方式的适用场景

---
