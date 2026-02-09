# Nuxt目录结构与约定

## Nuxt目录结构与约定

> **为什么要学这一章？**
>
> Nuxt 3 采用**约定式开发**理念，通过特定的目录结构和文件命名自动实现路由、导入、配置等功能。理解这些约定能让你写出更规范、更简洁的代码，大幅提升开发效率。
>
> **学习目标**：
>
> - 掌握 Nuxt 的目录结构规范
> - 理解文件约定和自动导入机制
> - 学会组织大型 Nuxt 项目
> - 了解配置文件的最佳实践

---

### 目录结构详解

#### 完整项目结构

```bash
nuxt-project/
├── .nuxt/                    # Nuxt 自动生成的文件（不要修改）
├── .output/                  # 构建输出目录
├── node_modules/             # 依赖包
│
├── .nuxtignore               # 忽略文件配置
├── .gitignore                # Git 忽略文件
├── .env                      # 环境变量
├── .env.example              # 环境变量示例
│
├── nuxt.config.ts            # Nuxt 配置文件 ⭐
├── nuxt.config.ts.backup     # 配置备份（可选）
│
├── tsconfig.json             # TypeScript 配置
├── package.json              # 项目依赖和脚本
│
├── app.vue                   # 应用根组件 ⭐
├── error.vue                 # 错误页面
├── error.md                  # 错误文档（可选）
│
├── pages/                    # 页面路由 ⭐⭐⭐
│   ├── index.vue             # → /
│   ├── about.vue             # → /about
│   ├── blog/
│   │   ├── index.vue         # → /blog
│   │   └── [slug].vue        # → /blog/:slug
│   └── [...slug].vue         # → Catch-all 路由
│
├── components/               # 组件（自动导入）⭐⭐⭐
│   ├── Header.vue            # <Header />
│   ├── Footer.vue            # <Footer />
│   └── blog/
│       └── PostCard.vue      # <BlogPostCard />
│
├── composables/              # 组合式函数（自动导入）⭐⭐
│   ├── useAuth.ts            # const { data } = useAuth()
│   ├── useApi.ts             # const api = useApi()
│   └── useLocalStorage.ts    # const store = useLocalStorage()
│
├── layouts/                  # 布局组件 ⭐⭐
│   ├── default.vue           # 默认布局
│   ├── blog.vue              # 博客布局
│   └── admin.vue             # 管理后台布局
│
├── middleware/               # 路由中间件 ⭐
│   ├── auth.ts               # 认证中间件
│   └── admin.ts              # 管理员中间件
│
├── server/                   # 服务端代码 ⭐⭐
│   ├── api/                  # API 路由
│   │   ├── hello.ts          # GET/POST /api/hello
│   │   └── users/
│   │       └── [id].ts       # GET/DELETE /api/users/:id
│   ├── middleware/           # 服务端中间件
│   │   └── logger.ts
│   ├── plugins/              # 服务端插件
│   │   └── db.ts
│   └── routes/               # 服务端路由
│       └── health.ts
│
├── assets/                   # 资源文件（会被构建处理）⭐
│   ├── css/
│   │   └── main.css
│   ├── scss/
│   │   └── variables.scss
│   └── images/
│       └── logo.png
│
├── public/                   # 静态文件（直接访问）⭐
│   ├── favicon.ico           # → /favicon.ico
│   ├── robots.txt            # → /robots.txt
│   └── images/
│       └── banner.jpg        # → /images/banner.jpg
│
├── utils/                    # 工具函数（自动导入）⭐
│   ├── format.ts             # const { formatCurrency } = useUtils()
│   └── validation.ts
│
├── types/                    # TypeScript 类型定义
│   └── index.d.ts
│
└── stores/                   # Pinia stores（使用 @pinia/nuxt）
    ├── user.ts
    └── cart.ts
```

---

### 核心目录详解

#### 1. `pages/` - 页面路由

**功能**：自动生成应用路由

```bash
pages/
├── index.vue                 # 路由: /
├── about.vue                 # 路由: /about
├── contact.vue               # 路由: /contact
│
├── blog/
│   ├── index.vue             # 路由: /blog
│   ├── [slug].vue            # 路由: /blog/:slug（动态路由）
│   └── archives/
│       └── [year].vue        # 路由: /blog/archives/:year
│
├── user/
│   ├── [id].vue              # 路由: /user/:id
│   └── [id]/
│       └── settings.vue      # 路由: /user/:id/settings
│
└── [...slug].vue             # 路由: /*（404 页面）
```

**自动生成的路由结构**：

```typescript
// Nuxt 自动生成的路由配置
[
  { name: 'index', path: '/', component: pages/index.vue },
  { name: 'about', path: '/about', component: pages/about.vue },
  { name: 'blog-index', path: '/blog', component: pages/blog/index.vue },
  { name: 'blog-slug', path: '/blog/:slug', component: pages/blog/[slug].vue },
  { name: 'user-id', path: '/user/:id', component: pages/user/[id].vue },
  { name: 'user-id-settings', path: '/user/:id/settings', component: pages/user/[id]/settings.vue },
  { name: 'all', path: '/:slug(.*)*', component: pages/[...slug].vue }
]
```

**页面组件示例**：

```vue
<!-- pages/blog/[slug].vue -->
<template>
  <div>
    <h1>{{ post?.title }}</h1>
    <p>{{ post?.content }}</p>

    <!-- 路由参数 -->
    <p>当前 slug: {{ slug }}</p>
  </div>
</template>

<script setup lang="ts">
// 获取路由参数
const route = useRoute()
const slug = route.params.slug

// 获取数据
const { data: post } = await useFetch(`/api/posts/${slug}`)

// 设置页面元数据
useHead({
  title: post.value?.title,
  meta: [
    { name: 'description', content: post.value?.excerpt }
  ]
})
</script>
```

#### 2. `components/` - 组件库

**功能**：自动导入组件，无需手动 import

```bash
components/
├── Header.vue                # <Header />
├── Footer.vue                # <Footer />
├── Sidebar.vue               # <Sidebar />
│
├── blog/
│   ├── PostCard.vue          # <BlogPostCard />
│   ├── PostList.vue          # <BlogPostList />
│   └── AuthorCard.vue        # <BlogAuthorCard />
│
└── forms/
    ├── Input.vue             # <FormsInput />
    ├── Button.vue            # <FormsButton />
    └── Select.vue            # <FormsSelect />
```

**组件命名规则**：

```vue
<!-- 组件文件：components/blog/PostCard.vue -->
<!-- 组件名：BlogPostCard 或 post-card -->

<!-- ✅ 正确用法（自动导入） -->
<template>
  <div>
    <!-- 直接使用，无需导入 -->
    <BlogPostCard :post="post" />
    <!-- 或者使用 kebab-case -->
    <post-card :post="post" />
  </div>
</template>

<script setup lang="ts">
// ❌ 不需要手动导入
// import BlogPostCard from '~/components/blog/PostCard.vue'

const props = defineProps<{
  post: Post
}>()
</script>
```

**组件示例**：

```vue
<!-- components/blog/PostCard.vue -->
<template>
  <article class="post-card">
    <img v-if="post.cover" :src="post.cover" :alt="post.title" />
    <div class="post-content">
      <h3>{{ post.title }}</h3>
      <p class="excerpt">{{ post.excerpt }}</p>
      <div class="meta">
        <span>{{ formatDate(post.createdAt) }}</span>
        <span class="author">{{ post.author }}</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
interface Post {
  id: number
  title: string
  excerpt: string
  cover?: string
  author: string
  createdAt: string
}

const props = defineProps<{
  post: Post
}>()

// 组件可以有自己的 composables
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.post-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-content {
  padding: 1rem;
}

.excerpt {
  color: #666;
  line-height: 1.6;
}

.meta {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #999;
}
</style>
```

#### 3. `composables/` - 组合式函数

**功能**：自动导入 Vue 组合式 API 函数

```bash
composables/
├── useAuth.ts                # const { user, login, logout } = useAuth()
├── useApi.ts                 # const { fetch, post, put, del } = useApi()
├── useLocalStorage.ts        # const store = useLocalStorage(key, value)
├── useDebounce.ts            # const debounced = useDebounce(fn, delay)
└── useInfiniteScroll.ts      # const { data, fetchMore, hasMore } = useInfiniteScroll()
```

**Composable 示例**：

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  // 用户状态
  const user = useState<{ name: string; email: string } | null>('user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  // 登录
  const login = async (credentials: { email: string; password: string }) => {
    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })

    if (!error.value && data.value) {
      user.value = data.value.user
      return true
    }
    return false
  }

  // 登出
  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  // 获取用户信息
  const fetchUser = async () => {
    const { data } = await useFetch('/api/auth/me')
    if (data.value) {
      user.value = data.value
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    fetchUser
  }
}
```

**使用 Composable**：

```vue
<!-- pages/login.vue -->
<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="邮箱" />
    <input v-model="password" type="password" placeholder="密码" />
    <button type="submit" :disabled="loading">
      {{ loading ? '登录中...' : '登录' }}
    </button>
  </form>
</template>

<script setup lang="ts">
// ✅ 自动导入，无需 import
const { login } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  const success = await login({
    email: email.value,
    password: password.value
  })

  if (success) {
    await navigateTo('/dashboard')
  } else {
    alert('登录失败')
  }
  loading.value = false
}
</script>
```

#### 4. `layouts/` - 布局系统

**功能**：定义页面布局模板

```bash
layouts/
├── default.vue               # 默认布局
├── blog.vue                  # 博客专用布局
├── admin.vue                 # 管理后台布局
└── empty.vue                 # 空白布局（登录页等）
```

**布局示例**：

```vue
<!-- layouts/default.vue -->
<template>
  <div class="layout">
    <!-- 头部 -->
    <Header />

    <!-- 主要内容区 -->
    <main class="main-content">
      <slot />
    </main>

    <!-- 侧边栏 -->
    <aside v-if="showSidebar" class="sidebar">
      <Sidebar />
    </aside>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
// 布局可以有自己的 props
const props = defineProps({
  showSidebar: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
```

**在页面中使用布局**：

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1>首页</h1>
    <!-- 内容将被插入到 default.vue 的 slot 中 -->
  </div>
</template>

<script setup lang="ts">
// 使用默认布局（default.vue）
// 无需指定，Nuxt 默认使用 default 布局
</script>
```

```vue
<!-- pages/blog/index.vue -->
<template>
  <div>
    <h1>博客列表</h1>
  </div>
</template>

<script setup lang="ts">
// 指定使用 blog 布局
definePageMeta({
  layout: 'blog'
})
</script>
```

```vue
<!-- layouts/blog.vue -->
<template>
  <div class="blog-layout">
    <!-- 博客头部 -->
    <header class="blog-header">
      <h1>我的博客</h1>
      <nav>
        <NuxtLink to="/blog">首页</NuxtLink>
        <NuxtLink to="/blog/about">关于</NuxtLink>
      </nav>
    </header>

    <!-- 内容 -->
    <main class="blog-main">
      <slot />
    </main>

    <!-- 博客侧边栏 -->
    <aside class="blog-sidebar">
      <Categories />
      <RecentPosts />
    </aside>

    <!-- 页脚 -->
    <footer class="blog-footer">
      <p>&copy; 2024 我的博客</p>
    </footer>
  </div>
</template>

<style scoped>
.blog-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 2rem;
}

.blog-header {
  grid-column: 1 / -1;
  padding: 2rem;
  background: #f5f5f5;
}

.blog-main {
  padding: 2rem;
}
</style>
```

#### 5. `server/` - 服务端代码

**功能**：创建 API 路由和服务器中间件

```bash
server/
├── api/                      # API 路由
│   ├── hello.ts              # /api/hello
│   ├── users/
│   │   ├── index.ts          # GET/POST /api/users
│   │   └── [id].ts           # GET/PUT/DELETE /api/users/:id
│   └── auth/
│       └── login.ts          # POST /api/auth/login
│
├── middleware/               # 服务端中间件
│   └── auth.ts
│
├── plugins/                  # 服务端插件
│   └── db.ts
│
└── routes/                   # 额外的服务器路由
    └── health.ts             # /health
```

**API 路由示例**：

```typescript
// server/api/users/index.ts
export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  // GET 请求：获取用户列表
  if (method === 'GET') {
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10

    // 实际项目中应该从数据库读取
    const users = [
      { id: 1, name: '张三', email: 'zhangsan@example.com' },
      { id: 2, name: '李四', email: 'lisi@example.com' },
      { id: 3, name: '王五', email: 'wangwu@example.com' }
    ]

    return {
      users: users.slice((page - 1) * limit, page * limit),
      total: users.length,
      page,
      limit
    }
  }

  // POST 请求：创建用户
  if (method === 'POST') {
    const body = await readBody(event)

    // 验证数据
    if (!body.name || !body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: '姓名和邮箱不能为空'
      })
    }

    // 实际项目中应该保存到数据库
    const newUser = {
      id: Date.now(),
      name: body.name,
      email: body.email,
      createdAt: new Date()
    }

    return newUser
  }

  // 其他方法不支持
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})
```

```typescript
// server/api/users/[id].ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const method = getMethod(event)

  // GET 请求：获取单个用户
  if (method === 'GET') {
    // 实际项目中应该从数据库读取
    const user = { id: Number(id), name: '张三', email: 'zhangsan@example.com' }
    return user
  }

  // PUT 请求：更新用户
  if (method === 'PUT') {
    const body = await readBody(event)
    // 实际项目中应该更新数据库
    return { id: Number(id), ...body, updatedAt: new Date() }
  }

  // DELETE 请求：删除用户
  if (method === 'DELETE') {
    // 实际项目中应该从数据库删除
    return { message: `用户 ${id} 已删除` }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})
```

#### 6. `middleware/` - 路由中间件

**功能**：在路由导航前执行代码

```bash
middleware/
├── auth.ts                   # 认证中间件
├── admin.ts                  # 管理员权限中间件
└── i18n.ts                   # 国际化中间件
```

**中间件示例**：

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // 检查用户是否登录
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated.value) {
    // 未登录，重定向到登录页
    return navigateTo('/login')
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

**在页面中使用中间件**：

```vue
<!-- pages/admin/dashboard.vue -->
<script setup lang="ts">
// 使用单个中间件
definePageMeta({
  middleware: 'auth'
})
</script>
```

```vue
<!-- pages/admin/settings.vue -->
<script setup lang="ts">
// 使用多个中间件
definePageMeta({
  middleware: ['auth', 'admin']
})
</script>
```

```vue
<!-- pages/profile.vue -->
<script setup lang="ts">
// 使用匿名中间件
definePageMeta({
  middleware: defineNuxtRouteMiddleware((to, from) => {
    if (to.params.id === '0') {
      return navigateTo('/404')
    }
  })
})
</script>
```

---

### 自动导入功能详解

#### 自动导入的 API

Nuxt 3 会自动导入以下内容：

```vue
<script setup lang="ts">
// ✅ Vue API 自动导入
const count = ref(0)
const doubled = computed(() => count.value * 2)
onMounted(() => console.log('mounted'))

// ✅ Nuxt Composables 自动导入
const route = useRoute()
const router = useRouter()
const { data } = await useFetch('/api/data')
const config = useRuntimeConfig()

// ✅ 组件自动导入
// <Header />
// <Footer />

// ✅ 自定义 Composables 自动导入
const { user, login } = useAuth()
</script>
```

#### 禁用自动导入

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 全局禁用自动导入（不推荐）
  imports: {
    autoImport: false
  },

  // 或者只禁用特定导入
  imports: {
    autoImport: {
      // 禁用 Vue APIs 自动导入
      vue: [
        // 'computed', // ❌ 不自动导入 computed
        // 'ref',      // ❌ 不自动导入 ref
        'useState'    // ✅ 保留 useState
      ]
    }
  }
})
```

#### 手动导入（当自动导入不工作时）

```vue
<script setup lang="ts">
// 如果 IDE 提示找不到类型，可以手动导入
import { ref, computed } from '#imports'

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>
```

---

### 文件约定

#### 1. `app.vue` - 应用根组件

```vue
<!-- app.vue -->
<template>
  <div>
    <NuxtPage />
    <!-- 或者在 Nuxt 2 风格中 -->
    <!-- <Nuxt /> -->
  </div>
</template>

<script setup lang="ts">
// app.vue 可以包含全局逻辑
const config = useRuntimeConfig()
console.log('App config:', config)
</script>

<style>
/* 全局样式 */
body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}
</style>
```

#### 2. `error.vue` - 错误页面

```vue
<!-- error.vue -->
<template>
  <div class="error-page">
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.message }}</p>
    <button @click="handleError">返回首页</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: Object as () => {
    statusCode: number
    message: string
  }
})

const handleError = () => {
  clearError({ redirect: '/' })
}
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

h1 {
  font-size: 8rem;
  margin: 0;
  color: #667eea;
}
</style>
```

#### 3. `app.config.ts` - 应用配置

```typescript
// app.config.ts
export default defineAppConfig({
  title: '我的 Nuxt 应用',
  description: 'Nuxt 3 示例项目',
  theme: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2'
  },
  features: {
    enableDarkMode: true,
    enableI18n: false
  }
})
```

```vue
<!-- 在组件中使用 -->
<script setup lang="ts">
const appConfig = useAppConfig()
console.log(appConfig.title) // '我的 Nuxt 应用'
console.log(appConfig.theme.primaryColor) // '#667eea'
</script>
```

---

### 配置文件详解

#### `nuxt.config.ts` 完整配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ============ 应用配置 ============
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
      ],
      style: [],
      script: []
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    key: 'name',
    keepalive: false
  },

  // ============ 模块 ============
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxtjs/i18n'
  ],

  // ============ 运行时配置 ============
  runtimeConfig: {
    // 服务端私有变量
    apiSecret: process.env.API_SECRET,
    databaseUrl: process.env.DATABASE_URL,

    // 公共变量（客户端可访问）
    public: {
      apiBase: process.env.API_BASE_URL || '/api',
      appTitle: process.env.APP_TITLE || 'Nuxt App'
    }
  },

  // ============ 自动导入配置 ============
  imports: {
    dirs: [
      'composables',
      'utils',
      'stores'
    ],
    global: true,
    preset: true
  },

  // ============ 别名配置 ============
  alias: {
    '@': '.',
    '~': '.',
    '~~': '.',
    '@@': '.',
    '~~~': '.',
    'assets': '/assets',
    'public': '/public'
  },

  // ============ CSS 配置 ============
  css: ['~/assets/css/main.css'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/variables.scss" as *;'
        }
      }
    }
  },

  // ============ 构建配置 ============
  build: {
    transpile: []
  },

  vite: {
    build: {
      target: 'es2020'
    }
  },

  // ============ TypeScript 配置 ============
  typescript: {
    strict: true,
    typeCheck: true,
    tsConfig: {
      extends: './.nuxt/tsconfig.json'
    }
  },

  // ============ 开发工具 ============
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },

  // ============ 渲染配置 ============
  ssr: true,

  // ============ 路由配置 ============
  router: {
    options: {
      strict: false,
      trailingSlash: false
    }
  },

  // ============ 页面预渲染 ============
  routeRules: {
    '/': { prerender: true },
    '/blog/**': { prerender: true },
    '/admin/**': { ssr: false }
  },

  // ============ 实验性功能 ============
  experimental: {
    typedPages: true
  }
})
```

---

### 实战案例：标准项目结构

#### 项目初始化

```bash
# 创建项目
npx nuxi@latest init standard-project
cd standard-project
npm install

# 安装依赖
npm install -D @types/node
npm install @pinia/nuxt @nuxtjs/tailwindcss
```

#### 目录结构创建

```bash
# 创建目录结构
mkdir -p pages/components/composables/layouts/middleware
mkdir -p server/api/middleware
mkdir -p assets/css assets/images
mkdir -p public/images
mkdir -p stores types utils
```

#### 完整的项目配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 开发工具
  devtools: { enabled: true },

  // 模块
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],

  // 应用配置
  app: {
    head: {
      title: '标准 Nuxt 3 项目',
      meta: [
        { name: 'description', content: 'Nuxt 3 标准项目结构示例' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // 运行时配置
  runtimeConfig: {
    public: {
      apiBase: '/api'
    }
  },

  // CSS
  css: ['~/assets/css/main.css'],

  // TypeScript
  typescript: {
    strict: true
  }
})
```

#### 类型定义

```typescript
// types/index.ts
export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

export interface Post {
  id: number
  title: string
  content: string
  author: User
  createdAt: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}
```

#### 工具函数

```typescript
// utils/format.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export const truncate = (text: string, length: number): string => {
  return text.length > length ? text.slice(0, length) + '...' : text
}
```

#### 核心 Composable

```typescript
// composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const fetchApi = async <T>(endpoint: string, options?: RequestInit) => {
    const { data, error } = await useFetch<ApiResponse<T>>(`${apiBase}${endpoint}`, options)

    if (error.value) {
      throw createError({
        statusCode: error.value.statusCode,
        message: error.value.message
      })
    }

    return data.value
  }

  return {
    fetchApi
  }
}
```

#### 完整页面示例

```vue
<!-- pages/index.vue -->
<template>
  <div class="container">
    <!-- 头部 -->
    <Header />

    <!-- 英雄区 -->
    <section class="hero">
      <h1>欢迎来到 Nuxt 3</h1>
      <p>构建现代化的 Web 应用</p>
      <button class="btn-primary">开始使用</button>
    </section>

    <!-- 特性列表 -->
    <section class="features">
      <FeatureCard
        v-for="feature in features"
        :key="feature.id"
        :title="feature.title"
        :description="feature.description"
        :icon="feature.icon"
      />
    </section>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
// ✅ 自动导入组件
// import Header from '~/components/Header.vue'
// import Footer from '~/components/Footer.vue'
// import FeatureCard from '~/components/FeatureCard.vue'

interface Feature {
  id: number
  title: string
  description: string
  icon: string
}

const features: Feature[] = [
  {
    id: 1,
    title: '服务端渲染',
    description: '更好的 SEO 和首屏性能',
    icon: '🚀'
  },
  {
    id: 2,
    title: '自动导入',
    description: '减少样板代码，提升开发效率',
    icon: '⚡'
  },
  {
    id: 3,
    title: '文件路由',
    description: '基于文件系统的自动路由',
    icon: '📁'
  }
]

// 设置页面元数据
useHead({
  title: '首页 - Nuxt 3',
  meta: [
    { name: 'description', content: 'Nuxt 3 标准项目结构示例' }
  ]
})
</script>

<style scoped>
.container {
  min-height: 100vh;
}

.hero {
  text-align: center;
  padding: 6rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.btn-primary {
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

---

### 本章小结

#### 目录结构速查表

| 目录 | 用途 | 自动导入 |
|------|------|---------|
| `pages/` | 页面路由 | ❌ 自动生成路由 |
| `components/` | Vue 组件 | ✅ 自动导入 |
| `composables/` | 组合式函数 | ✅ 自动导入 |
| `layouts/` | 布局模板 | ❌ 需指定 |
| `middleware/` | 路由中间件 | ❌ 需配置 |
| `server/` | 服务端 API | ❌ 服务端代码 |
| `utils/` | 工具函数 | ✅ 自动导入 |
| `stores/` | Pinia stores | ✅ 使用模块后自动 |
| `assets/` | 资源文件 | ❌ 需导入 |
| `public/` | 静态文件 | ❌ 直接访问 |

#### 最佳实践

1. **遵循约定**：充分利用 Nuxt 的约定式开发
2. **组织代码**：按功能模块组织文件
3. **自动导入**：减少手动 import，保持代码简洁
4. **类型安全**：使用 TypeScript 提升代码质量
5. **配置管理**：使用 runtimeConfig 管理环境变量

---

**下一步学习**: 建议继续学习[Nuxt路由系统自动生成](./chapter-113)深入了解Nuxt的文件路由系统。
