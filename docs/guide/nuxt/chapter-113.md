# Nuxt路由系统自动生成

## Nuxt路由系统自动生成

> **为什么要学这一章？**
>
> Nuxt 3 的**文件路由系统**基于 Vue Router，通过文件系统自动生成路由配置。理解自动路由的规则和高级用法，可以让你不写一行路由配置，就能构建复杂的应用。
>
> **学习目标**：
>
> - 掌握文件路由的基本规则
> - 理解动态路由和嵌套路由的创建方法
> - 学会使用路由中间件和守卫
> - 掌握路由参数和数据获取

---

### 文件路由系统

#### 基础路由规则

Nuxt 3 会根据 `pages/` 目录的结构自动生成路由：

```bash
pages/
├── index.vue                 # → /
├── about.vue                 # → /about
├── contact.vue               # → /contact
├── blog/
│   ├── index.vue             # → /blog
│   └── post.vue              # → /blog/post
└── user/
    ├── [id].vue              # → /user/:id
    └── settings.vue          # → /user/settings
```

**自动生成的路由配置**：

```typescript
// Nuxt 自动生成（你不需要写这些代码）
const routes = [
  {
    name: 'index',
    path: '/',
    component: () => import('~/pages/index.vue')
  },
  {
    name: 'about',
    path: '/about',
    component: () => import('~/pages/about.vue')
  },
  {
    name: 'blog-index',
    path: '/blog',
    component: () => import('~/pages/blog/index.vue')
  },
  {
    name: 'blog-post',
    path: '/blog/post',
    component: () => import('~/pages/blog/post.vue')
  },
  {
    name: 'user-id',
    path: '/user/:id',
    component: () => import('~/pages/user/[id].vue')
  },
  {
    name: 'user-settings',
    path: '/user/settings',
    component: () => import('~/pages/user/settings.vue')
  }
]
```

#### 页面组件示例

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1>首页</h1>
    <p>欢迎访问我的 Nuxt 应用！</p>

    <!-- NuxtLink 组件（替代 <router-link>） -->
    <NuxtLink to="/about">关于我们</NuxtLink>
    <NuxtLink to="/blog">博客</NuxtLink>
  </div>
</template>

<script setup lang="ts">
// 页面组件可以使用所有 Vue 3 特性
useHead({
  title: '首页'
})
</script>
```

```vue
<!-- pages/about.vue -->
<template>
  <div>
    <h1>关于我们</h1>
    <p>这是我们团队的故事...</p>

    <!-- 返回上一页 -->
    <button @click="router.back()">返回</button>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
</script>
```

---

### 动态路由

#### 基础动态路由

使用方括号 `[]` 创建动态路由参数：

```bash
pages/
├── users/
│   ├── [id].vue              # → /users/:id
│   └── [id]/
│       └── posts.vue         # → /users/:id/posts
└── blog/
    └── [year]/
        └── [month]/
            └── [slug].vue    # → /blog/:year/:month/:slug
```

**动态参数获取**：

```vue
<!-- pages/users/[id].vue -->
<template>
  <div>
    <h1>用户详情</h1>
    <p>用户 ID: {{ userId }}</p>

    <!-- 根据 ID 获取用户数据 -->
    <div v-if="user">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
    </div>

    <div v-else-if="pending">
      加载中...
    </div>

    <div v-else-if="error">
      加载失败: {{ error.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
// 获取路由参数
const route = useRoute()
const userId = route.params.id

// 或者使用解构
// const { id: userId } = route.params

// 根据参数获取数据
const { data: user, pending, error } = await useFetch(`/api/users/${userId}`)

// 设置页面元数据
useHead({
  title: user.value?.name || '用户详情'
})

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  console.log('用户 ID 变更:', newId)
})
</script>
```

#### 可选参数

```bash
pages/
├── products/
│   └── [[slug]].vue          # → /products 或 /products/:slug
└── blog/
    └── [category/][[slug]].vue # → /blog/:category?/:slug?
```

```vue
<!-- pages/products/[[slug]].vue -->
<template>
  <div>
    <div v-if="slug">
      <h1>产品详情: {{ slug }}</h1>
    </div>
    <div v-else>
      <h1>所有产品</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug

// slug 可能是 undefined
useHead({
  title: slug ? `产品 - ${slug}` : '所有产品'
})
</script>
```

#### Catch-all 路由

```bash
pages/
├── [...slug].vue             # → 匹配所有路由（404 页面）
└── admin/
    └── [...slug].vue         # → /admin/*（管理后台路由）
```

```vue
<!-- pages/[...slug].vue -->
<template>
  <div>
    <h1>404 - 页面未找到</h1>
    <p>您访问的页面不存在: {{ slugPath }}</p>

    <NuxtLink to="/">返回首页</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slugPath = route.params.slug?.join('/')

useHead({
  title: '404 - 页面未找到'
})
</script>
```

---

### 嵌套路由

#### 创建嵌套路由

```bash
pages/
├── parent.vue
└── parent/
    ├── child.vue             # → /parent/child
    └── child2.vue            # → /parent/child2
```

**父组件**：

```vue
<!-- pages/parent.vue -->
<template>
  <div>
    <h1>父页面</h1>

    <!-- 导航 -->
    <nav>
      <NuxtLink to="/parent/child">子页面 1</NuxtLink>
      <NuxtLink to="/parent/child2">子页面 2</NuxtLink>
    </nav>

    <!-- 子页面内容将在这里渲染 -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// 使用 definePageMeta 设置页面元数据
definePageMeta({
  key: (route) => route.fullPath
})
</script>

<style scoped>
nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

nav a {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border-radius: 4px;
  text-decoration: none;
  color: #333;
}

nav a:hover {
  background: #e0e0e0;
}
</style>
```

**子组件**：

```vue
<!-- pages/parent/child.vue -->
<template>
  <div class="child-page">
    <h2>子页面 1</h2>
    <p>这是父页面的子页面内容</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  // 可以设置布局
  layout: 'custom'
})
</script>
```

#### 多层嵌套

```bash
pages/
├── level1.vue
└── level1/
    └── level2.vue
    └── level2/
        └── level3.vue        # → /level1/level2/level3
```

```vue
<!-- pages/level1.vue -->
<template>
  <div>
    <h1>Level 1</h1>
    <NuxtPage />
  </div>
</template>
```

```vue
<!-- pages/level1/level2.vue -->
<template>
  <div>
    <h2>Level 2</h2>
    <NuxtPage />
  </div>
</template>
```

```vue
<!-- pages/level1/level2/level3.vue -->
<template>
  <div>
    <h3>Level 3</h3>
    <p>最深层嵌套页面</p>
  </div>
</template>
```

---

### 路由中间件

#### 中间件类型

Nuxt 3 有三种中间件：

1. **匿名中间件**：直接在页面中定义
2. **命名中间件**：在 `middleware/` 目录中定义
3. **全局中间件**：自动应用于所有路由

#### 匿名中间件

```vue
<!-- pages/dashboard.vue -->
<template>
  <div>
    <h1>仪表盘</h1>
  </div>
</template>

<script setup lang="ts">
// 直接在页面中定义中间件
definePageMeta({
  middleware: defineNuxtRouteMiddleware((to, from) => {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated.value) {
      return navigateTo('/login')
    }
  })
})
</script>
```

#### 命名中间件

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated.value) {
    // 未登录，重定向到登录页
    return navigateTo('/login', {
      query: {
        redirect: to.fullPath
      }
    })
  }
})
```

```typescript
// middleware/admin.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()

  // 检查是否是管理员
  if (user.value?.role !== 'admin') {
    abortNavigation('需要管理员权限')
  }
})
```

```typescript
// middleware/i18n.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const locale = useCookie('locale')

  // 设置默认语言
  if (!locale.value) {
    locale.value = 'zh-CN'
  }

  // 检查 URL 是否包含语言前缀
  if (!to.path.startsWith(`/${locale.value}`)) {
    return navigateTo(`/${locale.value}${to.path}`)
  }
})
```

**在页面中使用中间件**：

```vue
<!-- pages/admin/dashboard.vue -->
<script setup lang="ts>
// 使用单个中间件
definePageMeta({
  middleware: 'auth'
})
</script>
```

```vue
<!-- pages/admin/settings.vue -->
<script setup lang="ts>
// 使用多个中间件
definePageMeta({
  middleware: ['auth', 'admin']
})
</script>
```

#### 全局中间件

```typescript
// middleware/logger.global.ts
// 注意：文件名必须包含 .global

export default defineNuxtRouteMiddleware((to, from) => {
  console.log('路由导航:', {
    from: from.path,
    to: to.path,
    timestamp: new Date().toISOString()
  })
})
```

```typescript
// middleware/analytics.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // 页面访问统计
  if (process.client) {
    // 发送分析数据
    $fetch('/api/analytics', {
      method: 'POST',
      body: {
        path: to.path,
        referrer: from.path,
        timestamp: Date.now()
      }
    })
  }
})
```

#### 中间件执行顺序

```typescript
// 中间件执行顺序：
// 1. 全局中间件（按字母顺序）
// 2. 路由中间件（按定义顺序）

// middleware/01-auth.global.ts
export default defineNuxtRouteMiddleware(() => {
  console.log('1. 全局认证中间件')
})

// middleware/02-logger.global.ts
export default defineNuxtRouteMiddleware(() => {
  console.log('2. 全局日志中间件')
})

// pages/admin/dashboard.vue
definePageMeta({
  middleware: ['admin', 'settings'] // 3. 然后是这两个
})
```

---

### 路由参数和数据获取

#### useAsyncData

```vue
<!-- pages/posts/[id].vue -->
<template>
  <div>
    <div v-if="pending">加载中...</div>

    <div v-else-if="error">
      错误: {{ error.message }}
    </div>

    <article v-else-if="data">
      <h1>{{ data.title }}</h1>
      <p>{{ data.content }}</p>
      <p>作者: {{ data.author }}</p>
    </article>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const postId = route.params.id

// useAsyncData：手动控制数据获取
const { data, pending, error, refresh } = await useAsyncData(
  `post-${postId}`, // 唯一的 key
  () => $fetch(`/api/posts/${postId}`),
  {
    // 选项
    watch: [postId], // 监听 postId 变化
    server: true, // 服务端执行
    lazy: false, // 立即获取数据
    default: () => ({ title: '', content: '', author: '' }) // 默认值
  }
)

// 手动刷新数据
const handleRefresh = () => {
  refresh()
}
</script>
```

#### useFetch

```vue
<!-- pages/users/index.vue -->
<template>
  <div>
    <h1>用户列表</h1>

    <div v-if="pending">加载中...</div>

    <div v-else-if="error">加载失败</div>

    <ul v-else>
      <li v-for="user in data?.users" :key="user.id">
        <NuxtLink :to="`/users/${user.id}`">
          {{ user.name }}
        </NuxtLink>
      </li>
    </ul>

    <button @click="refresh">刷新</button>
  </div>
</template>

<script setup lang="ts>
// useFetch：简化的数据获取（基于 useAsyncData）
const { data, pending, error, refresh } = await useFetch('/api/users', {
  // 查询参数
  query: {
    page: 1,
    limit: 10
  },

  // 选项
  key: 'users', // 唯一的 key
  watch: false, // 不自动重新获取
  deep: false, // 不深度监听数据
  server: true, // 服务端执行
  lazy: false, // 立即获取
  transform: (response) => {
    // 转换响应数据
    return response.data
  }
})
</script>
```

#### 懒加载（Lazy Fetch）

```vue
<!-- pages/posts/index.vue -->
<template>
  <div>
    <h1>文章列表</h1>

    <!-- lazyFetch 不阻塞导航，立即显示页面 -->
    <div v-if="pending">加载中...</div>

    <div v-else>
      <div v-for="post in data?.posts" :key="post.id">
        <h2>{{ post.title }}</h2>
        <p>{{ post.excerpt }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts>
// 懒加载：不阻塞页面导航
const { data, pending } = await useLazyFetch('/api/posts')
</script>
```

---

### 实战案例：博客路由系统

#### 项目结构

```bash
pages/
├── index.vue                 # 首页
├── blog/
│   ├── index.vue             # 博客列表
│   ├── [slug].vue            # 博客详情
│   ├── category/
│   │   └── [name].vue        # 分类页面
│   └── tag/
│       └── [name].vue        # 标签页面
├── about.vue                 # 关于页面
└── [...slug].vue             # 404 页面
```

#### 中间件配置

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // 某些页面需要认证
  const protectedRoutes = ['/admin', '/dashboard']
  const { isAuthenticated } = useAuth()

  if (protectedRoutes.some(path => to.path.startsWith(path))) {
    if (!isAuthenticated.value) {
      return navigateTo('/login')
    }
  }
})
```

#### 博客列表页

```vue
<!-- pages/blog/index.vue -->
<template>
  <div class="blog-container">
    <div class="blog-header">
      <h1>博客文章</h1>
      <p class="subtitle">分享技术，记录成长</p>
    </div>

    <!-- 分类和标签筛选 -->
    <div class="filters">
      <select v-model="selectedCategory" @change="fetchPosts">
        <option value="">所有分类</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>

      <div class="tags">
        <button
          v-for="tag in tags"
          :key="tag.id"
          class="tag-btn"
          :class="{ active: selectedTag === tag.id }"
          @click="toggleTag(tag.id)"
        >
          {{ tag.name }}
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="pending" class="loading">
      加载中...
    </div>

    <!-- 文章列表 -->
    <div v-else class="posts-grid">
      <article
        v-for="post in data?.posts"
        :key="post.id"
        class="post-card"
      >
        <img v-if="post.cover" :src="post.cover" :alt="post.title" />

        <div class="post-content">
          <h2>
            <NuxtLink :to="`/blog/${post.slug}`">
              {{ post.title }}
            </NuxtLink>
          </h2>

          <p class="excerpt">{{ post.excerpt }}</p>

          <div class="meta">
            <span>{{ formatDate(post.createdAt) }}</span>
            <span>{{ post.author }}</span>
          </div>

          <div class="tags">
            <span
              v-for="tag in post.tags"
              :key="tag.id"
              class="tag"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>
      </article>
    </div>

    <!-- 分页 -->
    <div v-if="data?.totalPages > 1" class="pagination">
      <button
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        上一页
      </button>

      <span>第 {{ currentPage }} / {{ data.totalPages }} 页</span>

      <button
        :disabled="currentPage === data.totalPages"
        @click="goToPage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  cover?: string
  author: string
  createdAt: string
  tags: Array<{ id: number; name: string }>
}

interface Category {
  id: number
  name: string
}

interface Tag {
  id: number
  name: string
}

// 状态
const currentPage = ref(1)
const selectedCategory = ref('')
const selectedTag = ref<number | null>(null)

// 获取分类
const { data: categories } = await useFetch<Category[]>('/api/categories')

// 获取标签
const { data: tags } = await useFetch<Tag[]>('/api/tags')

// 获取文章
const { data, pending, refresh } = await useFetch<{ posts: Post[]; totalPages: number }>('/api/posts', {
  query: {
    page: currentPage,
    category: selectedCategory,
    tag: selectedTag
  },
  watch: [currentPage, selectedCategory, selectedTag]
})

// 方法
const toggleTag = (tagId: number) => {
  selectedTag.value = selectedTag.value === tagId ? null : tagId
  currentPage.value = 1
}

const goToPage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 页面元数据
useHead({
  title: '博客 - 文章列表',
  meta: [
    { name: 'description', content: '浏览我们的最新技术文章' }
  ]
})

definePageMeta({
  key: (route) => route.fullPath
})
</script>

<style scoped>
.blog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.blog-header {
  text-align: center;
  margin-bottom: 3rem;
}

.blog-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.125rem;
}

.filters {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-right: 1rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.tag-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.tag-btn:hover,
.tag-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.post-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.post-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.post-content {
  padding: 1.5rem;
}

.post-content h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.post-content h2 a {
  text-decoration: none;
  color: #333;
}

.post-content h2 a:hover {
  color: #667eea;
}

.excerpt {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #999;
  margin-bottom: 1rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 0.875rem;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.pagination button {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.pagination button:hover:not(:disabled) {
  background: #5568d3;
}

.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.125rem;
  color: #999;
}
</style>
```

#### 博客详情页

```vue
<!-- pages/blog/[slug].vue -->
<template>
  <div class="post-container">
    <div v-if="pending" class="loading">加载中...</div>

    <article v-else-if="post" class="post">
      <!-- 文章头部 -->
      <header class="post-header">
        <h1>{{ post.title }}</h1>

        <div class="meta">
          <span>
            <img :src="post.author.avatar" :alt="post.author.name" />
            {{ post.author.name }}
          </span>

          <span>{{ formatDate(post.createdAt) }}</span>

          <span>{{ post.readTime }} 分钟阅读</span>
        </div>

        <img v-if="post.cover" :src="post.cover" :alt="post.title" class="cover" />
      </header>

      <!-- 文章内容 -->
      <div class="post-content" v-html="post.content"></div>

      <!-- 标签 -->
      <div class="tags-section">
        <span
          v-for="tag in post.tags"
          :key="tag.id"
          class="tag"
        >
          {{ tag.name }}
        </span>
      </div>

      <!-- 相关文章 -->
      <section class="related-posts">
        <h2>相关文章</h2>
        <div class="related-grid">
          <NuxtLink
            v-for="related in relatedPosts"
            :key="related.id"
            :to="`/blog/${related.slug}`"
            class="related-card"
          >
            <img v-if="related.cover" :src="related.cover" :alt="related.title" />
            <h3>{{ related.title }}</h3>
          </NuxtLink>
        </div>
      </section>

      <!-- 评论区 -->
      <section class="comments">
        <h2>评论 ({{ post.comments.length }})</h2>

        <CommentForm :post-id="post.id" @submit="refreshComments" />

        <CommentList :comments="post.comments" />
      </section>
    </article>

    <div v-else-if="error" class="error">
      <h1>文章未找到</h1>
      <p>您访问的文章不存在</p>
      <NuxtLink to="/blog">返回博客列表</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

// 获取文章数据
const { data: post, pending, error, refresh } = await useFetch(`/api/posts/${slug}`)

// 获取相关文章
const { data: relatedPosts } = await useFetch(`/api/posts/${slug}/related`, {
  // 只在客户端获取
  server: false
})

// 刷新评论
const refreshComments = () => {
  refresh()
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 设置页面元数据
useHead({
  title: post.value?.title || '文章详情',
  meta: [
    { name: 'description', content: post.value?.excerpt },
    { property: 'og:title', content: post.value?.title },
    { property: 'og:description', content: post.value?.excerpt },
    { property: 'og:image', content: post.value?.cover }
  ]
})

// 设置 JSON-LD 结构化数据
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.value?.title,
  image: post.value?.cover,
  datePublished: post.value?.createdAt,
  author: {
    '@type': 'Person',
    name: post.value?.author.name
  }
})
</script>

<style scoped>
.post-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.post-header {
  margin-bottom: 3rem;
  text-align: center;
}

.post-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

.meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.cover {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
}

.post-content {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #333;
}

.post-content :deep(h2) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.75rem;
}

.post-content :deep(p) {
  margin-bottom: 1.5rem;
}

.post-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 2rem 0;
}

.tags-section {
  display: flex;
  gap: 0.5rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.tag {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 0.875rem;
}

.related-posts {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.related-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s;
}

.related-card:hover {
  transform: translateY(-2px);
}

.related-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.related-card h3 {
  padding: 1rem;
  font-size: 1rem;
  margin: 0;
}

.comments {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  font-size: 1.125rem;
}
</style>
```

---

### 本章小结

#### 路由类型速查表

| 路由类型 | 文件格式 | 示例路径 | 说明 |
|---------|---------|---------|------|
| **基础路由** | `index.vue` | `/` | 首页 |
| **普通路由** | `about.vue` | `/about` | 静态页面 |
| **动态路由** | `[id].vue` | `/:id` | 参数路由 |
| **嵌套路由** | `parent/child.vue` | `/parent/child` | 嵌套页面 |
| **可选参数** | `[[slug]].vue` | `/:slug?` | 可选参数 |
| **Catch-all** | `[...slug].vue` | `/*` | 匹配所有路由 |

#### 最佳实践

1. **路由组织**：按功能模块组织 pages 目录
2. **命名规范**：使用小写字母和连字符
3. **数据获取**：优先使用 `useFetch` 而不是 `fetch`
4. **错误处理**：统一处理 404 和错误页面
5. **性能优化**：使用懒加载和分页减少初始加载

---

**下一步学习**: 建议继续学习[页面与布局系统](./chapter-114)了解Nuxt的布局系统。
