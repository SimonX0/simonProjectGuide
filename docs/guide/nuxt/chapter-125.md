# 动态路由与路由参数

## 动态路由与路由参数

> **为什么要学这一章?**
>
> 动态路由是构建内容驱动应用的核心功能。Nuxt 3提供了强大的动态路由系统,支持参数验证、路由守卫、中间件等高级特性。掌握这些功能,让你能够构建安全、灵活的博客、电商等内容型应用。
>
> **学习目标**:
>
> - 深入理解动态路由的工作原理
> - 掌握路由参数的获取和验证
> - 学会使用路由守卫和中间件
> - 理解嵌套路由和复杂参数
> - 能够构建完整的博客文章系统

---

### 动态路由深入

#### 动态路由参数

```bash
pages/
├── blog/
│   ├── [slug].vue              # 单个参数
│   ├── [category]/
│   │   └── [slug].vue          # 多个参数
│   └── archive/
│       └── [year]/
│           └── [month].vue      # 嵌套参数
└── users/
    ├── [id].vue                # 必选参数
    └── [id/]
        └── [tab].vue           # 多参数
```

#### 单参数路由

```vue
<!-- pages/blog/[slug].vue -->
<template>
  <article class="blog-post">
    <!-- 加载状态 -->
    <div v-if="pending" class="loading">
      <LoadingSpinner />
      <p>加载文章中...</p>
    </div>

    <!-- 文章内容 -->
    <div v-else-if="post" class="post-content">
      <h1>{{ post.title }}</h1>
      <p class="meta">
        <span>{{ formatDate(post.publishedAt) }}</span>
        <span>{{ post.author.name }}</span>
      </p>
      <div class="content" v-html="post.content"></div>

      <!-- 标签 -->
      <div class="tags">
        <NuxtLink
          v-for="tag in post.tags"
          :key="tag"
          :to="`/blog/tag/${tag}`"
          class="tag"
        >
          #{{ tag }}
        </NuxtLink>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <h1>文章未找到</h1>
      <p>{{ error.message }}</p>
      <NuxtLink to="/blog">返回博客列表</NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts>
const route = useRoute()

// 获取路由参数
const slug = computed(() => route.params.slug as string)

// 获取文章数据
const { data: post, pending, error } = await useFetch(
  () => `/api/blog/posts/${slug.value}`,
  {
    // 监听slug变化
    watch: [slug],

    // 错误处理
    onResponseError: () => {
      throw createError({
        statusCode: 404,
        statusMessage: '文章未找到',
        fatal: true
      })
    }
  }
)

// 设置SEO元数据
watchEffect(() => {
  if (post.value) {
    useHead({
      title: post.value.title,
      meta: [
        { name: 'description', content: post.value.excerpt },
        { property: 'og:title', content: post.value.title },
        { property: 'og:description', content: post.value.excerpt },
        { property: 'og:image', content: post.value.cover }
      ]
    })
  }
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
```

#### 多参数路由

```vue
<!-- pages/blog/[category]/[slug].vue -->
<template>
  <article class="blog-post">
    <!-- 面包屑 -->
    <nav class="breadcrumb">
      <NuxtLink to="/">首页</NuxtLink>
      <span>/</span>
      <NuxtLink :to="`/blog/${category}`">{{ category }}</NuxtLink>
      <span>/</span>
      <span>{{ slug }}</span>
    </nav>

    <!-- 文章内容 -->
    <div v-if="post">
      <span class="category-badge">{{ category }}</span>
      <h1>{{ post.title }}</h1>
      <div v-html="post.content"></div>
    </div>
  </article>
</template>

<script setup lang="ts>
const route = useRoute()

// 获取多个参数
const category = computed(() => route.params.category as string)
const slug = computed(() => route.params.slug as string)

// 根据参数获取数据
const { data: post } = await useFetch(
  () => `/api/blog/${category.value}/${slug.value}`,
  {
    watch: [category, slug]
  }
)

// 监听参数变化
watch(
  () => route.params,
  (newParams, oldParams) => {
    console.log('参数变化:', oldParams, '→', newParams)
  },
  { deep: true }
)
</script>
```

#### 可选参数

```bash
pages/
├── products/
│   └── [[slug]].vue              # 可选参数
│                                 # /products 或 /products/item-1
```

```vue
<!-- pages/products/[[slug]].vue -->
<template>
  <div>
    <!-- 有slug - 显示产品详情 -->
    <div v-if="slug" class="product-detail">
      <h1>{{ product?.name }}</h1>
      <p>{{ product?.description }}</p>
    </div>

    <!-- 无slug - 显示产品列表 -->
    <div v-else class="product-list">
      <h1>所有产品</h1>
      <div v-for="item in products" :key="item.id">
        <NuxtLink :to="`/products/${item.slug}`">
          {{ item.name }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts>
const route = useRoute()

// 可选参数(可能是undefined)
const slug = computed(() => route.params.slug as string | undefined)

// 根据是否有slug获取不同数据
const { data: product } = await useAsyncData(
  () => slug.value ? `product-${slug.value}` : 'none',
  () => slug.value ? $fetch(`/api/products/${slug.value}`) : Promise.resolve(null)
)

const { data: products } = await useFetch('/api/products')
</script>
```

---

### 路由验证

#### 参数验证

```typescript
// middleware/validate-post.ts
export default defineNuxtRouteMiddleware((to) => {
  const slug = to.params.slug as string

  // 验证slug格式
  const slugRegex = /^[a-z0-9-]+$/

  if (!slugRegex.test(slug)) {
    // 验证失败,抛出错误或重定向
    return abortNavigation('无效的文章slug')
  }

  // 验证slug长度
  if (slug.length < 3 || slug.length > 100) {
    return navigateTo('/blog')
  }
})
```

```vue
<!-- pages/blog/[slug].vue -->
<script setup lang="ts>
// 使用中间件
definePageMeta({
  middleware: 'validate-post'
})
</script>
```

#### 数据验证

```vue
<!-- pages/users/[id].vue -->
<script setup lang="ts>
const route = useRoute()
const userId = computed(() => Number(route.params.id))

// 验证用户ID
const isValidUserId = computed(() => {
  return Number.isInteger(userId.value) && userId.value > 0
})

// 获取用户数据
const { data: user, error } = await useFetch(
  () => isValidUserId.value ? `/api/users/${userId.value}` : null,
  {
    // 验证响应
    transform: (data) => {
      if (!data || !data.id) {
        throw createError({
          statusCode: 404,
          statusMessage: '用户不存在'
        })
      }
      return data
    },

    // 错误处理
    onResponseError: ({ response }) => {
      if (response.status === 404) {
        throw createError({
          statusCode: 404,
          statusMessage: '用户未找到',
          fatal: true
        })
      }
    }
  }
)

// 如果用户ID无效,抛出错误
if (!isValidUserId.value) {
  throw createError({
    statusCode: 400,
    statusMessage: '无效的用户ID'
  })
}
</script>
```

#### 类型安全验证

```typescript
// types/route.ts
export interface PostParams {
  slug: string
  category?: string
}

export interface UserParams {
  id: number
  tab?: 'profile' | 'posts' | 'comments'
}

// utils/validate-params.ts
export const validateParams = <T extends Record<string, any>>(
  params: any,
  schema: Record<keyof T, (value: any) => boolean>
): T | null => {
  try {
    const validated: any = {}

    for (const [key, validator] of Object.entries(schema)) {
      if (!validator(params[key])) {
        return null
      }
      validated[key] = params[key]
    }

    return validated as T
  } catch {
    return null
  }
}

// pages/blog/[category]/[slug].vue
<script setup lang="ts>
const route = useRoute()

// 验证参数
const params = validateParams<PostParams>(route.params, {
  slug: (value) => typeof value === 'string' && /^[a-z0-9-]+$/.test(value),
  category: (value) => !value || typeof value === 'string'
})

if (!params) {
  throw createError({
    statusCode: 400,
    statusMessage: '无效的路由参数'
  })
}

// 使用验证后的参数
const { slug, category } = params
</script>
```

---

### 嵌套路由

#### 创建嵌套路由

```bash
pages/
├── users/
│   ├── [id].vue                # 父路由
│   └── [id]/
│       ├── profile.vue         # /users/:id/profile
│       ├── posts.vue           # /users/:id/posts
│       └── settings.vue        # /users/:id/settings
```

#### 父路由组件

```vue
<!-- pages/users/[id].vue -->
<template>
  <div class="user-page">
    <!-- 用户信息 -->
    <header class="user-header" v-if="user">
      <img :src="user.avatar" :alt="user.name" class="avatar" />
      <div class="user-info">
        <h1>{{ user.name }}</h1>
        <p>{{ user.bio }}</p>
      </div>
    </header>

    <!-- 标签导航 -->
    <nav class="user-nav">
      <NuxtLink
        :to="`/users/${userId}/profile`"
        class="nav-link"
        :class="{ active: currentTab === 'profile' }"
      >
        个人资料
      </NuxtLink>
      <NuxtLink
        :to="`/users/${userId}/posts`"
        class="nav-link"
        :class="{ active: currentTab === 'posts' }"
      >
        文章
      </NuxtLink>
      <NuxtLink
        :to="`/users/${userId}/settings`"
        class="nav-link"
        :class="{ active: currentTab === 'settings' }"
      >
        设置
      </NuxtLink>
    </nav>

    <!-- 子路由内容 -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts>
const route = useRoute()
const userId = computed(() => route.params.id as string)

// 获取用户信息
const { data: user } = await useFetch(`/api/users/${userId.value}`)

// 当前标签
const currentTab = computed(() => {
  const path = route.path
  if (path.includes('/profile')) return 'profile'
  if (path.includes('/posts')) return 'posts'
  if (path.includes('/settings')) return 'settings'
  return 'profile'
})

// 设置页面元数据
useHead({
  title: computed(() => user.value?.name || '用户')
})
</script>

<style scoped>
.user-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.user-header {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

.user-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.nav-link {
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #666;
  border-radius: 8px;
  transition: all 0.3s;
}

.nav-link:hover,
.nav-link.active {
  background: #667eea;
  color: white;
}
</style>
```

#### 子路由组件

```vue
<!-- pages/users/[id]/posts.vue -->
<template>
  <div class="user-posts">
    <h2>用户文章</h2>

    <!-- 加载状态 -->
    <div v-if="pending" class="loading">
      加载中...
    </div>

    <!-- 文章列表 -->
    <div v-else-if="posts" class="posts-list">
      <article
        v-for="post in posts"
        :key="post.id"
        class="post-item"
      >
        <h3>
          <NuxtLink :to="`/blog/${post.slug}`">
            {{ post.title }}
          </NuxtLink>
        </h3>
        <p>{{ post.excerpt }}</p>
        <div class="post-meta">
          <span>{{ formatDate(post.publishedAt) }}</span>
          <span>{{ post.likes }} 点赞</span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts>
const route = useRoute()
const userId = computed(() => route.params.id as string)

// 获取用户文章
const { data: posts, pending } = await useFetch(
  () => `/api/users/${userId.value}/posts`
)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 定义页面元数据
definePageMeta({
  key: (route) => route.fullPath
})
</script>
```

---

### Catch-all路由

#### 全匹配路由

```bash
pages/
├── [...slug].vue                 # 匹配所有路由
└── blog/
    └── [...slug].vue             # 匹配/blog下的所有路由
```

```vue
<!-- pages/[...slug].vue -->
<template>
  <div class="catch-all">
    <h1>404 - 页面未找到</h1>

    <p>您访问的页面不存在:</p>
    <code>{{ slugPath }}</code>

    <div class="suggestions">
      <h3>您可能在找:</h3>
      <ul>
        <li><NuxtLink to="/">首页</NuxtLink></li>
        <li><NuxtLink to="/blog">博客</NuxtLink></li>
        <li><NuxtLink to="/about">关于</NuxtLink></li>
      </ul>
    </div>

    <div class="search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索..."
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch">搜索</button>
    </div>
  </div>
</template>

<script setup lang="ts>
const route = useRoute()

// 获取catch-all参数
const slugPath = computed(() => {
  const slug = route.params.slug as string[]
  return Array.isArray(slug) ? slug.join('/') : slug
})

const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value) {
    navigateTo({
      path: '/search',
      query: { q: searchQuery.value }
    })
  }
}

// 设置404状态码
useHead({
  title: '404 - 页面未找到'
})

// 设置HTTP状态码
onMounted(() => {
  if (process.client) {
    // 客户端无法直接设置状态码
    // 但可以在服务端渲染时设置
  }
})

// 错误处理
throw createError({
  statusCode: 404,
  statusMessage: 'Page not found',
  fatal: true
})
</script>

<style scoped>
.catch-all {
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  text-align: center;
}

.catch-all h1 {
  font-size: 4rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.catch-all code {
  display: block;
  background: #f5f5f5;
  padding: 1rem;
  margin: 2rem 0;
  border-radius: 8px;
  font-family: monospace;
}

.suggestions {
  margin: 3rem 0;
  text-align: left;
}

.suggestions ul {
  list-style: none;
  padding: 0;
}

.suggestions li {
  margin: 0.5rem 0;
}

.suggestions a {
  color: #667eea;
  text-decoration: none;
}

.suggestions a:hover {
  text-decoration: underline;
}

.search {
  display: flex;
  gap: 0.5rem;
  margin-top: 2rem;
}

.search input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.search button {
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
```

---

### 实战案例:博客文章系统

构建一个完整的博客系统,包含分类、标签、归档等功能。

#### 1. 路由结构

```bash
pages/
├── blog/
│   ├── index.vue                    # 博客列表
│   ├── [slug].vue                   # 文章详情
│   ├── category/
│   │   └── [name].vue               # 分类文章
│   ├── tag/
│   │   └── [name].vue               # 标签文章
│   └── archive/
│       └── [year]/
│           └── [month].vue          # 归档文章
```

#### 2. 文章详情页

```vue
<!-- pages/blog/[slug].vue -->
<template>
  <article class="blog-post">
    <!-- 加载状态 -->
    <div v-if="pending" class="loading-container">
      <LoadingSkeleton type="article" />
    </div>

    <!-- 文章内容 -->
    <template v-else-if="post">
      <!-- 文章头部 -->
      <header class="post-header">
        <!-- 面包屑 -->
        <nav class="breadcrumb">
          <NuxtLink to="/">首页</NuxtLink>
          <span class="separator">/</span>
          <NuxtLink to="/blog">博客</NuxtLink>
          <span class="separator">/</span>
          <span v-if="post.category">
            <NuxtLink :to="`/blog/category/${post.category.slug}`">
              {{ post.category.name }}
            </NuxtLink>
          </span>
          <span class="separator">/</span>
          <span class="current">{{ post.title }}</span>
        </nav>

        <!-- 分类标签 -->
        <div class="post-categories">
          <NuxtLink
            :to="`/blog/category/${post.category.slug}`"
            class="category-badge"
          >
            {{ post.category.name }}
          </NuxtLink>
        </div>

        <!-- 标题 -->
        <h1>{{ post.title }}</h1>

        <!-- 摘要 -->
        <p class="excerpt">{{ post.excerpt }}</p>

        <!-- 元信息 -->
        <div class="post-meta">
          <div class="author">
            <img :src="post.author.avatar" :alt="post.author.name" />
            <div class="author-info">
              <span class="name">{{ post.author.name }}</span>
              <span class="title">{{ post.author.title }}</span>
            </div>
          </div>

          <div class="meta-info">
            <span class="date">
              <CalendarIcon />
              {{ formatDate(post.publishedAt) }}
            </span>
            <span class="reading-time">
              <ClockIcon />
              {{ post.readingTime }} 分钟
            </span>
            <span class="views">
              <EyeIcon />
              {{ post.views }} 次阅读
            </span>
          </div>
        </div>

        <!-- 特色图片 -->
        <div v-if="post.cover" class="post-cover">
          <img :src="post.cover" :alt="post.title" />
        </div>
      </header>

      <!-- 文章正文 -->
      <div class="post-content">
        <div class="content" v-html="post.content"></div>

        <!-- 文章底部 -->
        <footer class="post-footer">
          <!-- 标签 -->
          <div class="post-tags">
            <TagIcon />
            <div class="tags">
              <NuxtLink
                v-for="tag in post.tags"
                :key="tag.slug"
                :to="`/blog/tag/${tag.slug}`"
                class="tag"
              >
                #{{ tag.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- 分享 -->
          <div class="post-share">
            <ShareButton :title="post.title" :url="currentUrl" />
          </div>

          <!-- 上一页/下一页 -->
          <div class="post-navigation">
            <NuxtLink
              v-if="prevPost"
              :to="`/blog/${prevPost.slug}`"
              class="nav-prev"
            >
              <ArrowLeftIcon />
              <div>
                <span>上一篇</span>
                <span>{{ prevPost.title }}</span>
              </div>
            </NuxtLink>

            <NuxtLink
              v-if="nextPost"
              :to="`/blog/${nextPost.slug}`"
              class="nav-next"
            >
              <div>
                <span>下一篇</span>
                <span>{{ nextPost.title }}</span>
              </div>
              <ArrowRightIcon />
            </NuxtLink>
          </div>
        </footer>
      </div>

      <!-- 相关文章 -->
      <section class="related-posts">
        <h2>相关文章</h2>
        <div class="related-grid">
          <PostCard
            v-for="related in relatedPosts"
            :key="related.id"
            :post="related"
          />
        </div>
      </section>

      <!-- 评论区 -->
      <section class="post-comments">
        <Comments :post-id="post.id" />
      </section>
    </template>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <Error404 />
    </div>
  </article>
</template>

<script setup lang="ts>
const route = useRoute()
const { slug } = route.params

// 获取文章数据
const { data: post, pending, error } = await useFetch(
  () => `/api/blog/posts/${slug}`,
  {
    // 监听slug变化
    watch: [() => route.params.slug],

    // 错误处理
    onResponseError: () => {
      throw createError({
        statusCode: 404,
        statusMessage: '文章未找到',
        fatal: true
      })
    }
  }
)

// 获取相关文章
const { data: relatedPosts } = await useLazyFetch(
  () => post.value ? `/api/blog/posts/${post.value.id}/related` : null,
  {
    query: { limit: 4 }
  }
)

// 获取上一篇/下一篇
const { data: navigation } = await useLazyFetch(
  () => post.value ? `/api/blog/posts/${post.value.id}/navigation` : null
)

const prevPost = computed(() => navigation.value?.prev)
const nextPost = computed(() => navigation.value?.next)

// 当前URL
const currentUrl = computed(() =>
  process.client ? window.location.href : ''
)

// 设置SEO元数据
watchEffect(() => {
  if (post.value) {
    // 基础元数据
    useHead({
      title: post.value.title,
      link: [
        {
          rel: 'canonical',
          href: `https://example.com/blog/${post.value.slug}`
        }
      ]
    })

    // SEO元数据
    useSeoMeta({
      title: post.value.title,
      description: post.value.excerpt,
      ogTitle: post.value.title,
      ogDescription: post.value.excerpt,
      ogImage: post.value.cover,
      ogType: 'article',
      articleAuthor: post.value.author.name,
      articlePublishedTime: post.value.publishedAt,
      articleModifiedTime: post.value.updatedAt,
      articleTag: post.value.tags.map(t => t.name),
      twitterCard: 'summary_large_image'
    })

    // 结构化数据
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.value.title,
            description: post.value.excerpt,
            image: post.value.cover,
            author: {
              '@type': 'Person',
              name: post.value.author.name
            },
            datePublished: post.value.publishedAt,
            dateModified: post.value.updatedAt
          })
        }
      ]
    })
  }
})

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 页面元数据
definePageMeta({
  key: (route) => route.fullPath,
  pageTransition: {
    name: 'page',
    mode: 'out-in'
  }
})
</script>

<style scoped>
.blog-post {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.post-header {
  margin-bottom: 3rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.875rem;
}

.breadcrumb a {
  color: #667eea;
  text-decoration: none;
}

.breadcrumb .separator {
  color: #999;
}

.breadcrumb .current {
  color: #666;
}

.post-categories {
  margin-bottom: 1.5rem;
}

.category-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.post-header h1 {
  font-size: 2.5rem;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.excerpt {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.author {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.author img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-info .name {
  font-weight: 600;
}

.author-info .title {
  font-size: 0.875rem;
  color: #666;
}

.meta-info {
  display: flex;
  gap: 1.5rem;
  color: #666;
  font-size: 0.875rem;
}

.meta-info span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.post-cover {
  margin: 2rem 0;
  border-radius: 12px;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  height: auto;
}

.post-content {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #333;
}

.post-content :deep(h2) {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.post-content :deep(p) {
  margin-bottom: 1.5rem;
}

.post-footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.post-tags {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 2rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #f0f0f0;
  text-decoration: none;
  border-radius: 20px;
  font-size: 0.875rem;
  color: #666;
  transition: all 0.3s;
}

.tag:hover {
  background: #667eea;
  color: white;
}

.post-navigation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 3rem;
}

.nav-prev,
.nav-next {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s;
}

.nav-prev:hover,
.nav-next:hover {
  background: #667eea;
  color: white;
}

.nav-next {
  text-align: right;
  flex-direction: row-reverse;
}

.related-posts {
  margin-top: 4rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
</style>
```

---

### 本章小结

#### 动态路由模式

| 模式 | 路由 | 示例 |
|------|------|------|
| `[param]` | 必选参数 | `/blog/[slug].vue` |
| `[[param]]` | 可选参数 | `/products/[[slug]].vue` |
| `[...slug]` | Catch-all | `/[...slug].vue` |
| `[a]/[b]` | 多参数 | `/blog/[category]/[slug].vue` |

#### 最佳实践

1. **参数验证**: 始终验证路由参数
2. **错误处理**: 提供友好的404页面
3. **SEO优化**: 动态设置元数据
4. **类型安全**: 使用TypeScript定义参数类型
5. **性能优化**: 合理使用数据缓存

---

**下一步学习**: 建议继续学习[路由中间件与守卫](./chapter-126)掌握路由保护和权限控制。
