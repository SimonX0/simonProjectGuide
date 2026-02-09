# useAsyncData与useFetch

## useAsyncData与useFetch

> **为什么要学这一章？**
>
> 数据获取是Web应用的核心功能。Nuxt 3 提供了 `useAsyncData` 和 `useFetch` 两个强大的Composable,它们不仅能处理数据获取,还能自动处理SSR水合、响应式更新、加载状态等问题。掌握它们是构建高性能Nuxt应用的关键。
>
> **学习目标**：
>
> - 理解 useAsyncData 的工作原理和使用场景
> - 掌握 useFetch 的便捷用法和高级配置
> - 学会选择合适的数据获取策略
> - 掌握数据缓存、刷新和错误处理
> - 能够构建实际的数据驱动应用

---

### useAsyncData 深入

#### 基础用法

`useAsyncData` 是 Nuxt 3 中最灵活的数据获取方法:

```vue
<template>
  <div>
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else>
      <h1>{{ data?.title }}</h1>
      <p>{{ data?.content }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// useAsyncData 接收一个唯一 key 和一个返回 Promise 的函数
const { data, pending, error, refresh } = await useAsyncData(
  'posts', // 唯一 key,用于缓存
  () => $fetch('/api/posts') // 数据获取函数
)
</script>
```

#### 参数详解

```typescript
// 完整签名
useAsyncData(
  key: string,
  handler: (context?: NuxtContext) => Promise<Data>,
  options?: {
    // 是否监听源变化自动重新获取
    watch?: WatchSource[]

    // 服务端渲染
    server?: boolean

    // 默认值
    default?: () => Data

    // 转换数据
    transform?: (input: Data) => Output

    // 拾取响应字段
    pick?: string[]

    // 路由参数变化时是否重新获取
    getCachedData?: (key: string) => any

    // 延迟渲染(非阻塞)
    lazy?: boolean

    // 是否在服务端执行
    deep?: boolean
  }
)
```

#### 实际应用示例

```vue
<!-- pages/posts/[id].vue -->
<template>
  <article class="post">
    <!-- 加载状态 -->
    <div v-if="pending" class="loading">
      <LoadingSpinner />
      <p>加载文章中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <h2>加载失败</h2>
      <p>{{ error.message }}</p>
      <button @click="refresh">重试</button>
    </div>

    <!-- 成功状态 -->
    <div v-else-if="post" class="post-content">
      <h1>{{ post.title }}</h1>
      <div class="meta">
        <span>作者: {{ post.author }}</span>
        <span>发布于: {{ formatDate(post.createdAt) }}</span>
      </div>
      <div class="content" v-html="post.content"></div>

      <!-- 相关文章 -->
      <section class="related">
        <h2>相关文章</h2>
        <div v-for="related in relatedPosts" :key="related.id">
          <NuxtLink :to="`/posts/${related.id}`">
            {{ related.title }}
          </NuxtLink>
        </div>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()

// 获取文章详情
const { data: post, pending, error, refresh } = await useAsyncData(
  `post-${route.params.id}`,
  () => $fetch(`/api/posts/${route.params.id}`),
  {
    // 转换数据
    transform: (data: any) => ({
      ...data,
      createdAt: new Date(data.createdAt)
    }),

    // 只需要的字段
    pick: ['id', 'title', 'content', 'author', 'createdAt']
  }
)

// 获取相关文章
const { data: relatedPosts } = await useAsyncData(
  `related-${route.params.id}`,
  () => $fetch(`/api/posts/${route.params.id}/related`),
  {
    // 懒加载,不阻塞页面渲染
    lazy: true
  }
)

// 格式化日期
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// 设置页面元数据
useHead({
  title: post.value?.title || '文章详情',
  meta: [
    { name: 'description', content: post.value?.excerpt || '' }
  ]
})
</script>
```

#### 监听源变化

```vue
<template>
  <div>
    <select v-model="selectedCategory">
      <option value="">全部分类</option>
      <option value="tech">技术</option>
      <option value="life">生活</option>
    </select>

    <div v-if="pending">加载中...</div>
    <div v-else>
      <div v-for="post in posts" :key="post.id">
        {{ post.title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const selectedCategory = ref('')

// 监听分类变化,自动重新获取数据
const { data: posts, pending } = await useAsyncData(
  'posts',
  () => $fetch('/api/posts', {
    params: {
      category: selectedCategory.value
    }
  }),
  {
    // 监听 selectedCategory 变化
    watch: [selectedCategory]
  }
)
</script>
```

---

### useFetch 使用

#### 基础用法

`useFetch` 是 `useAsyncData` 的语法糖,专门用于HTTP请求:

```vue
<template>
  <div>
    <div v-if="pending">加载中...</div>
    <div v-else>
      <div v-for="user in data" :key="user.id">
        {{ user.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// useFetch 自动生成唯一 key
const { data, pending, error } = await useFetch('/api/users')
</script>
```

#### useFetch vs useAsyncData

```typescript
// ❌ 使用 useAsyncData 获取 HTTP 数据
const { data } = await useAsyncData('users', () => $fetch('/api/users'))

// ✅ 使用 useFetch(更简洁)
const { data } = await useFetch('/api/users')

// useFetch 内部实现
const useFetch = (url, options) => {
  return useAsyncData(
    url, // 使用 URL 作为 key
    () => $fetch(url, options),
    options
  )
}
```

#### useFetch 高级用法

```vue
<template>
  <div>
    <!-- 用户信息 -->
    <div v-if="user">
      <h1>{{ user.name }}</h1>
      <p>{{ user.email }}</p>
      <button @click="updateUser">更新信息</button>
    </div>

    <!-- 用户订单 -->
    <div v-if="!ordersPending">
      <h2>订单列表</h2>
      <div v-for="order in orders" :key="order.id">
        订单 #{{ order.id }} - {{ order.total }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// 获取用户信息
const { data: user, error } = await useFetch(`/api/users/${route.params.id}`, {
  // 响应拦截
  onResponse: ({ response }) => {
    console.log('响应状态:', response.status)
  },

  // 错误处理
  onResponseError: ({ response }) => {
    console.error('请求失败:', response._data)
  },

  // 请求拦截
  onRequest: ({ request, options }) => {
    // 添加认证头
    const token = useCookie('auth-token').value
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    }
  },

  // 基础 URL
  baseURL: '/api'
})

// 获取用户订单
const { data: orders, pending: ordersPending, refresh: refreshOrders } = await useFetch(
  `/api/users/${route.params.id}/orders`,
  {
    // 延迟获取
    lazy: true,

    // 最小缓存时间
    getCachedData: (key) => useNuxtData(key).data
  }
)

// 更新用户信息
const updateUser = async () => {
  await $fetch(`/api/users/${route.params.id}`, {
    method: 'PUT',
    body: {
      name: '新名称'
    }
  })

  // 刷新数据
  await refresh()
}
</script>
```

#### POST/PUT/DELETE 请求

```vue
<template>
  <form @submit.prevent="createPost">
    <input v-model="title" type="text" placeholder="标题" />
    <textarea v-model="content" placeholder="内容"></textarea>
    <button type="submit" :disabled="loading">
      {{ loading ? '提交中...' : '发布文章' }}
    </button>
  </form>

  <div v-if="error" class="error">{{ error.message }}</div>
  <div v-if="success" class="success">发布成功!</div>
</template>

<script setup lang="ts">
const title = ref('')
const content = ref('')
const loading = ref(false)
const error = ref<any>(null)
const success = ref(false)

const createPost = async () => {
  loading.value = true
  error.value = null

  try {
    // 使用 useFetch 发送 POST 请求
    const { data, error: fetchError } = await useFetch('/api/posts', {
      method: 'POST',
      body: {
        title: title.value,
        content: content.value
      },

      // 请求前
      onRequest: ({ options }) => {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json'
        }
      }
    })

    if (fetchError.value) {
      error.value = fetchError.value
    } else {
      success.value = true
      // 重定向到文章详情页
      await navigateTo(`/posts/${data.value.id}`)
    }
  } finally {
    loading.value = false
  }
}
</script>
```

---

### 数据获取模式

#### 1. 服务端优先模式

```vue
<template>
  <div>
    <!-- SEO 友好,服务端渲染 -->
    <h1>{{ post?.title }}</h1>
    <p>{{ post?.content }}</p>
  </div>
</template>

<script setup lang="ts>
// 默认模式:服务端获取数据,SSR
const { data: post } = await useFetch('/api/posts/1')
</script>
```

#### 2. 客户端获取模式

```vue
<template>
  <div>
    <!-- 仅客户端获取,不阻塞 SSR -->
    <div v-if="pending">加载中...</div>
    <h1 v-else>{{ data?.title }}</h1>
  </div>
</template>

<script setup lang="ts>
// 客户端获取:减少服务端负载
const { data, pending } = await useFetch('/api/posts/1', {
  server: false // 仅客户端执行
})
</script>
```

#### 3. 懒加载模式

```vue
<template>
  <div>
    <!-- 立即显示页面,数据异步加载 -->
    <h1>文章列表</h1>

    <div v-if="pending">
      <SkeletonCard v-for="i in 10" :key="i" />
    </div>

    <div v-else>
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 懒加载:不阻塞导航
const { data: posts, pending } = await useLazyFetch('/api/posts')
</script>
```

#### 4. 缓存控制模式

```vue
<template>
  <div>
    <h1>文章详情</h1>
    <button @click="refresh">刷新数据</button>
    <p>{{ post?.content }}</p>
  </div>
</template>

<script setup lang="ts>
const route = useRoute()

// 带缓存的数据获取
const { data: post, refresh } = await useFetch(`/api/posts/${route.params.id}`, {
  // 自定义缓存 key
  key: `post-${route.params.id}`,

  // 缓存时间(默认继承 nuxt.config.ts 配置)
  getCachedData: (key) => {
    // 从缓存中获取数据
    const cached = useNuxtData(key)
    return cached.data.value
  },

  // 只有缓存失效时才重新获取
  transform: (data) => {
    // 转换数据
    return data
  }
})
</script>
```

#### 5. 分页数据模式

```vue
<template>
  <div>
    <h1>文章列表</h1>

    <div v-for="post in posts?.items" :key="post.id">
      {{ post.title }}
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button
        :disabled="page === 1"
        @click="changePage(page - 1)"
      >
        上一页
      </button>

      <span>第 {{ page }} 页 / 共 {{ posts?.totalPages }} 页</span>

      <button
        :disabled="page >= posts?.totalPages"
        @click="changePage(page + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts>
const page = ref(1)
const pageSize = 10

// 获取分页数据
const { data: posts, pending } = await useFetch('/api/posts', {
  // 监听 page 变化
  watch: [page],

  // 请求参数
  query: {
    page,
    pageSize
  },

  // key 会根据 query 自动变化
  key: (ctx) => `posts-page-${page.value}`
})

const changePage = (newPage: number) => {
  page.value = newPage
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 使用 watchEffect 处理页面变化
watchEffect(() => {
  if (posts.value) {
    console.log('总数据:', posts.value.total)
  }
})
</script>
```

---

### 实战案例:用户仪表盘

让我们构建一个完整的用户仪表盘,展示各种数据获取模式。

#### 项目结构

```bash
pages/
├── dashboard/
│   ├── index.vue             # 仪表盘首页
│   ├── profile.vue           # 用户资料
│   └── settings.vue          # 设置
```

#### 仪表盘首页

```vue
<!-- pages/dashboard/index.vue -->
<template>
  <div class="dashboard">
    <!-- 头部 -->
    <header class="dashboard-header">
      <h1>欢迎回来, {{ user?.name }}!</h1>
      <p>这是您的个人仪表盘</p>
    </header>

    <!-- 统计卡片 -->
    <section class="stats">
      <StatCard
        v-for="stat in stats"
        :key="stat.id"
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        :trend="stat.trend"
      />
    </section>

    <!-- 图表 -->
    <section class="charts">
      <div class="chart-card">
        <h2>访问趋势</h2>
        <div v-if="chartPending" class="loading">加载中...</div>
        <LineChart v-else :data="chartData" />
      </div>
    </section>

    <!-- 最近活动 -->
    <section class="activities">
      <h2>最近活动</h2>
      <div v-if="activitiesPending" class="loading">加载中...</div>
      <ActivityList v-else :activities="activities" />

      <button
        v-if="hasMoreActivities"
        @click="loadMoreActivities"
        :disabled="loadingMore"
      >
        {{ loadingMore ? '加载中...' : '加载更多' }}
      </button>
    </section>

    <!-- 待办事项 -->
    <section class="todos">
      <h2>待办事项</h2>
      <TodoList :todos="todos" @toggle="toggleTodo" @delete="deleteTodo" />
    </section>
  </div>
</template>

<script setup lang="ts">
// ============ 用户信息 ============
const { data: user } = await useFetch('/api/user/profile')

// ============ 统计数据 ============
const { data: stats } = await useFetch('/api/user/stats', {
  transform: (data: any) => [
    {
      id: 1,
      title: '总访问量',
      value: data.totalViews,
      icon: '👁️',
      trend: '+12%'
    },
    {
      id: 2,
      title: '文章数',
      value: data.totalPosts,
      icon: '📝',
      trend: '+3'
    },
    {
      id: 3,
      title: '评论数',
      value: data.totalComments,
      icon: '💬',
      trend: '+8'
    },
    {
      id: 4,
      title: '点赞数',
      value: data.totalLikes,
      icon: '❤️',
      trend: '+15%'
    }
  ]
})

// ============ 图表数据(懒加载) ============
const { data: chartData, pending: chartPending } = await useLazyFetch(
  '/api/user/chart-data',
  {
    query: {
      period: '7d'
    }
  }
)

// ============ 最近活动(带分页) ============
const page = ref(1)
const pageSize = 10

const { data: activities, pending: activitiesPending, refresh: refreshActivities } = await useFetch(
  '/api/user/activities',
  {
    query: { page, pageSize },

    // 监听 page 变化
    watch: [page]
  }
)

const hasMoreActivities = computed(() => {
  return activities.value?.hasMore ?? false
})

const loadingMore = ref(false)

const loadMoreActivities = async () => {
  if (loadingMore.value) return

  loadingMore.value = true
  page.value++
  await refreshActivities()
  loadingMore.value = false
}

// ============ 待办事项 ============
const { data: todos, refresh: refreshTodos } = await useAsyncData(
  'user-todos',
  () => $fetch('/api/user/todos'),
  {
    // 客户端获取
    server: false
  }
)

const toggleTodo = async (id: number) => {
  await $fetch(`/api/todos/${id}/toggle`, { method: 'POST' })
  await refreshTodos()
}

const deleteTodo = async (id: number) => {
  await $fetch(`/api/todos/${id}`, { method: 'DELETE' })
  await refreshTodos()
}

// ============ 定时刷新 ============
// 每 30 秒刷新统计数据
const { pause, resume } = useIntervalFn(
  async () => {
    await refreshActivities()
  },
  30000,
  { immediate: false }
)

// 页面可见时恢复定时器
onVisibilityChange((visible) => {
  if (visible) {
    resume()
  } else {
    pause()
  }
})

// ============ 页面元数据 ============
useHead({
  title: '仪表盘'
})

definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.charts,
.activities,
.todos {
  margin-bottom: 3rem;
}

.chart-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #999;
}

button {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #5568d3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
```

#### 统计卡片组件

```vue
<!-- components/StatCard.vue -->
<template>
  <div class="stat-card">
    <div class="stat-icon">{{ icon }}</div>
    <div class="stat-content">
      <h3>{{ title }}</h3>
      <p class="stat-value">{{ value }}</p>
      <span class="stat-trend" :class="{ positive: trend.startsWith('+') }">
        {{ trend }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  value: number | string
  icon: string
  trend: string
}>()
</script>

<style scoped>
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #666;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.stat-trend {
  font-size: 0.875rem;
  color: #dc3545;
}

.stat-trend.positive {
  color: #28a745;
}
</style>
```

#### API 路由示例

```typescript
// server/api/user/profile.ts
export default defineEventHandler(async (event) => {
  // 实际项目中应该从数据库或认证服务获取
  const user = {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: '/avatars/user1.jpg'
  }

  return user
})

// server/api/user/stats.ts
export default defineEventHandler(async (event) => {
  // 模拟统计数据
  return {
    totalViews: 12543,
    totalPosts: 42,
    totalComments: 128,
    totalLikes: 892
  }
})

// server/api/user/activities.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10

  // 模拟数据
  const activities = Array.from({ length: pageSize }, (_, i) => ({
    id: (page - 1) * pageSize + i + 1,
    type: ['comment', 'like', 'post'][i % 3],
    message: `用户活动 ${(page - 1) * pageSize + i + 1}`,
    createdAt: new Date()
  }))

  return {
    items: activities,
    total: 50,
    hasMore: page * pageSize < 50
  }
})
```

---

### 错误处理与重试

#### 统一错误处理

```typescript
// composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig()

  const fetchWithError = async <T>(
    url: string,
    options: any = {}
  ) => {
    try {
      const { data, error } = await useFetch<T>(url, {
        ...options,
        onResponseError: ({ response }) => {
          console.error('API Error:', response._data)

          // 显示错误提示
          if (response.status === 401) {
            // 未授权,跳转登录
            navigateTo('/login')
          } else if (response.status === 500) {
            // 服务器错误
            showError({
              statusCode: 500,
              statusMessage: '服务器错误,请稍后重试'
            })
          }
        }
      })

      if (error.value) {
        throw error.value
      }

      return data.value
    } catch (err: any) {
      throw createError({
        statusCode: err.statusCode || 500,
        statusMessage: err.message || '请求失败'
      })
    }
  }

  return {
    fetchWithError
  }
}
```

#### 自动重试机制

```typescript
// composables/useFetchWithRetry.ts
export const useFetchWithRetry = async <T>(
  url: string,
  options: any = {},
  maxRetries = 3
) => {
  let lastError: any = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data, error } = await useFetch<T>(url, options)

      if (!error.value) {
        return { data, error: null }
      }

      lastError = error.value
    } catch (err) {
      lastError = err
    }

    // 等待后重试
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }

  return { data: null, error: lastError }
}
```

---

### 性能优化建议

#### 1. 合理使用缓存

```typescript
// 缓存策略
const { data } = await useFetch('/api/posts', {
  // 设置缓存 key
  key: 'posts-list',

  // 自定义缓存
  getCachedData: (key) => {
    const data = useNuxtData(key)
    return data.data.value
  }
})
</script>
```

#### 2. 懒加载非关键数据

```typescript
// 关键数据:立即加载
const { data: post } = await useFetch('/api/posts/1')

// 非关键数据:懒加载
const { data: comments } = await useLazyFetch('/api/posts/1/comments')
```

#### 3. 避免重复请求

```typescript
// 使用共享数据
const { data } = await useAsyncData(
  'unique-key', // 确保全局唯一
  () => $fetch('/api/data')
)
```

---

### 本章小结

#### 数据获取方法对比

| 方法 | 使用场景 | 优点 | 缺点 |
|------|---------|------|------|
| `useFetch` | HTTP请求 | 简洁,自动生成key | 灵活性较低 |
| `useAsyncData` | 复杂数据获取 | 灵活,可自定义key | 需要手动管理key |
| `useLazyFetch` | 非关键数据 | 不阻塞导航 | 需处理pending状态 |
| `$fetch` | 手动控制 | 完全控制 | 需手动管理状态 |

#### 最佳实践

1. **优先使用 useFetch**:简单HTTP请求首选
2. **合理设置缓存**:避免重复请求
3. **懒加载非关键数据**:提升首屏性能
4. **统一错误处理**:提供友好的用户体验
5. **监听源变化**:保持数据同步

---

**下一步学习**: 建议继续学习[useRoute与useRouter](./chapter-118)掌握Nuxt的路由导航功能。
