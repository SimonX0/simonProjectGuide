---
title: Nuxt高级进阶面试题
---

# Nuxt高级进阶面试题

## Nuxt 3核心特性

### Nuxt 3与Nuxt 2的主要区别？

```typescript
// 1. 底层框架升级
// Nuxt 2: 基于Vue 2
// Nuxt 3: 基于Vue 3 + Vite

// 2. Composition API
// Nuxt 2: Options API
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}

// Nuxt 3: Composition API（推荐）
<script setup lang="ts">
const count = ref(0)

function increment() {
  count.value++
}
</script>

// 3. TypeScript支持
// Nuxt 2: 需要额外配置
// Nuxt 3: 原生TypeScript支持

// nuxt.config.ts
export default defineNuxtConfig({
  typescript: {
    strict: true,
    typeCheck: true
  }
})

// 4. 性能提升
// Nuxt 3使用Nitro引擎
// - 更快的冷启动
// - 更小的包体积
// - 更好的Tree Shaking

// 5. 新的组合式函数
<script setup lang="ts">
// useFetch - 数据获取
const { data, pending, error } = await useFetch('/api/users')

// useAsyncData - 异步数据
const { data } = await useAsyncData('users', () => $fetch('/api/users'))

// useLazyFetch - 懒加载数据
const { data, pending } = await useLazyFetch('/api/users')

// useLazyAsyncData - 懒加载异步数据
const { data, refresh } = await useLazyAsyncData('posts', () => $fetch('/api/posts'))
</script>

// 6. 模块系统
// Nuxt 3使用新的模块系统
// modules/my-module.ts
export default defineNuxtModule({
  meta: {
    name: 'my-module',
    configKey: 'myModule'
  },
  setup(options, nuxt) {
    // 模块逻辑
    nuxt.hook('app:rendered', (context) => {
      // 渲染后hook
    })
  }
})
```

### Nuxt 3目录结构详解？

```typescript
// Nuxt 3项目结构
my-nuxt-app/
├── .nuxt/              // Nuxt生成文件（自动忽略）
├── assets/             // 静态资源（会被Vite处理）
│   ├── main.css
│   └── main.ts
├── components/         // Vue组件（自动导入）
│   ├── Header.vue
│   └── Footer.vue
├── composables/        // 组合式函数（自动导入）
│   ├── useAuth.ts
│   └── useApi.ts
├── layouts/            // 布局组件
│   ├── default.vue
│   └── custom.vue
├── middleware/         // 中间件
│   ├── auth.ts
│   └── global.ts
├── pages/              // 页面路由
│   ├── index.vue
│   └── about.vue
├── plugins/            // Vue插件
│   ├── vue-gtag.client.ts  // 客户端插件
│   └── vue-server.ts       // 服务端插件
├── public/             // 静态文件（直接复制到服务器）
│   ├── favicon.ico
│   └── images/
├── server/             // 服务端代码
│   ├── api/            // API路由
│   │   └── hello.ts
│   ├── middleware/     // 服务端中间件
│   └── routes/         // 服务端路由
├── types/              // TypeScript类型定义
│   └── index.d.ts
├── utils/              // 工具函数（自动导入）
│   └── format.ts
├── app.vue             // 主应用组件
├── app.config.ts       // 应用配置
├── error.vue           // 错误页面
├── nuxt.config.ts      // Nuxt配置
└── package.json

// 自动导入示例
// components/Header.vue
<template>
  <header>
    <h1>My App</h1>
  </header>
</template>

// pages/index.vue
<template>
  <div>
    <!-- 直接使用，无需import -->
    <Header />
  </div>
</template>

// composables/useAuth.ts
export const useAuth = () => {
  const user = useState('user', () => null)

  const login = async (credentials) => {
    const data = await $fetch('/api/login', {
      method: 'POST',
      body: credentials
    })
    user.value = data.user
  }

  return {
    user,
    login
  }
}

// pages/index.vue
<script setup lang="ts">
// 直接使用，无需import
const { user, login } = useAuth()
</script>
```

## Nuxt 3服务端渲染

### SSR渲染模式详解？

```typescript
// 1. SSR模式（默认）
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true
})

// 工作流程
// 1. 服务器接收请求
// 2. 调用asyncData获取数据
// 3. 渲染完整HTML
// 4. 发送HTML到客户端
// 5. 客户端hydration（水合）

// pages/users/[id].vue
<script setup lang="ts">
const route = useRoute()
const { data: user } = await useAsyncData(
  `user-${route.params.id}`,
  () => $fetch(`/api/users/${route.params.id}`)
)
</script>

<template>
  <div v-if="user">
    <h1>{{ user.name }}</h1>
    <p>{{ user.email }}</p>
  </div>
</template>

// 2. SPA模式
export default defineNuxtConfig({
  ssr: false
})

// 纯客户端渲染，类似传统Vue SPA

// 3. 混合模式（页面级控制）
// pages/index.vue - SSR
<script setup lang="ts">
// 默认SSR
const { data } = await useFetch('/api/data')
</script>

// pages/dashboard.vue - SPA
<script setup lang="ts">
// 设置为SPA
definePageMeta({
  ssr: false
})
</script>

// 4. 静态站点生成（SSG）
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'static'
  }
})

// 或使用generate
export default defineNuxtConfig({
  generate: {
    routes: ['/page1', '/page2']
  }
})
```

### Hydration陷阱与解决？

```vue
<!-- 问题：Hydration Mismatch -->
<script setup lang="ts">
// 服务端和客户端时间不同
const now = new Date().toString()
</script>

<template>
  <div>{{ now }}</div>
  <!-- 警告：Hydration mismatch -->
</template>

<!-- 解决方案1：使用ClientOnly -->
<template>
  <ClientOnly>
    <div>{{ now }}</div>
  </ClientOnly>
</template>

<!-- 解决方案2：使用onMounted -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const now = ref('')

onMounted(() => {
  now.value = new Date().toString()
})
</script>

<!-- 解决方案3：使用process.client -->
<script setup lang="ts">
const now = process.client ? new Date().toString() : ''
</script>

<!-- 解决方案4：使用useState同步状态 -->
<script setup lang="ts">
// 服务端设置初始值
const count = useState('count', () => 0)
</script>

<template>
  <div>
    <div>{{ count }}</div>
    <button @click="count++">Increment</button>
  </div>
</template>

<!-- 解决方案5：使用Nuxt腾太太场景 -->
<script setup lang="ts">
// 使用SSR-friendly的数据
const { data } = await useAsyncData('time', () => {
  // 返回统一的时间戳
  return Promise.resolve(Date.now())
})
</script>
```

## Nuxt 3数据获取

### useFetch与useAsyncData区别？

```typescript
// 1. useFetch - 便捷的数据获取
// 适用于简单的HTTP请求
<script setup lang="ts">
// 基础用法
const { data, pending, error, refresh } = await useFetch('/api/users')

// 带选项
const { data } = await useFetch('/api/users', {
  // 请求选项
  method: 'POST',
  body: { name: 'John' },
  headers: {
    'Authorization': 'Bearer token'
  },

  // Nuxt选项
  key: 'users', // 唯一键
  watch: [page], // 监听变量变化重新请求
  deep: false, // 深度监听
  server: true, // 服务端获取
  lazy: false, // 懒加载
  default: () => [], // 默认值
  transform: (data) => data.data, // 转换数据
  getCachedData: (key) => useNuxtData(key), // 缓存策略
})
</script>

// 2. useAsyncData - 更灵活的异步数据
// 适用于任意异步操作
<script setup lang="ts">
// 异步函数
const { data } = await useAsyncData(
  'users',
  async () => {
    const response = await fetch('/api/users')
    return await response.json()
  }
)

// 多个异步请求
const { data: users } = await useAsyncData('users', async () => {
  const [users, posts] = await Promise.all([
    $fetch('/api/users'),
    $fetch('/api/posts')
  ])
  return { users, posts }
})

// 带缓存的请求
const { data } = await useAsyncData(
  'user:1',
  () => $fetch('/api/users/1'),
  {
    // 缓存配置
    getCachedData: (key) => useNuxtData(key),
    deep: false,
    watch: [source],
    server: true,
    default: () => ({})
  }
)
</script>

// 3. useLazyFetch - 非阻塞数据获取
<script setup lang="ts">
// 不阻塞页面导航
const { data, pending } = await useLazyFetch('/api/users')

// 立即渲染页面，数据加载中显示pending状态
</script>

<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else>{{ data }}</div>
  </div>
</template>

// 4. 最佳实践对比
// useFetch适合：
// - 简单的HTTP请求
// - GET请求
// - REST API调用

// useAsyncData适合：
// - 复杂的异步操作
// - 需要多个请求组合
// - 需要自定义错误处理
// - 需要特殊的数据转换

// 5. 刷新与重新验证
<script setup lang="ts">
const { data, refresh } = await useFetch('/api/users')

// 手动刷新
function handleRefresh() {
  refresh()
}

// 自动刷新（监听变量变化）
const page = ref(1)
const { data } = await useFetch('/api/users', {
  watch: [page] // page变化时自动刷新
})

// 重新验证所有useAsyncData
async function refreshAll() {
  await refreshNuxtData()
}

// 重新验证特定key
await refreshNuxtData('users')
</script>

// 6. 错误处理
<script setup lang="ts">
const { data, error } = await useFetch('/api/users')

if (error.value) {
  // 处理错误
  throw createError({
    statusCode: error.value.statusCode,
    statusMessage: error.value.message,
    fatal: true // 致命错误，触发error.vue
  })
}
</script>
```

### 数据缓存策略？

```typescript
// 1. 服务端缓存
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  // 使用Nitro存储缓存
  const cached = await useStorage('cache').getItem('users')

  if (cached) {
    return cached
  }

  const users = await fetchUsers()

  // 缓存1小时
  await useStorage('cache').setItem('users', users, {
    expiration: 3600
  })

  return users
})

// 2. 客户端缓存
<script setup lang="ts">
const { data } = await useFetch('/api/users', {
  // 缓存策略
  getCachedData: (key) => {
    // 从NuxtData缓存获取
    return useNuxtData(key).value
  },

  // 或使用自定义缓存
  getCachedData: (key) => {
    const cached = sessionStorage.getItem(key)
    return cached ? JSON.parse(cached) : null
  },

  // 缓存响应
  onResponse: (context) => {
    sessionStorage.setItem('users', JSON.stringify(context.response._data))
  }
})
</script>

// 3. routeRules缓存（推荐）
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // 静态页面 - 缓存1年
    '/': { isr: true },

    // API路由 - 缓存1小时
    '/api/**': { cache: { maxAge: 60 * 60 } },

    // 动态页面 - ISR，1天重新验证
    '/blog/**': { isr: 60 * 60 * 24 },

    // 禁用缓存
    '/api/admin/**': { cache: { maxAge: 0 } },

    // SPA模式
    '/app/**': { isr: false, ssr: false }
  }
})

// 4. 使用Stale-While-Revalidate
<script setup lang="ts">
const { data } = await useFetch('/api/users', {
  // 立即返回缓存数据，后台刷新
  async onResponse() {
    await refreshNuxtData('users')
  }
})
</script>

// 5. 精细化缓存控制
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/api/products': {
      cache: {
        // 最大缓存时间（秒）
        maxAge: 60 * 60,

        // 变体缓存
        vary: ['X-Custom-Header'],

        // 缓存键
        key: (request) => {
          return request.url.split('?')[0]
        },

        // 缓存条件
        shouldCache: (response) => {
          return response.status === 200
        }
      }
    }
  }
})

// 6. CDN缓存
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/static/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },

    '/api/**': {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  }
})
```

## Nuxt 3路由系统

### 动态路由与嵌套路由？

```typescript
// 1. 动态路由文件结构
pages/
├── users/
│   ├── [id].vue              # /users/1
│   ├── [id]/profile.vue      # /users/1/profile
│   └── [id]/[tab].vue        # /users/1/details
├── [slug]/[...].vue          # /blog/catch-all
└── [slug]/[[...]].vue        # /blog/catch-all (可选)

// 2. 动态路由参数
<script setup lang="ts">
const route = useRoute()

// 获取路由参数
const userId = route.params.id
const query = route.query.search

// 监听路由变化
watch(() => route.params.id, (newId) => {
  console.log('User ID changed:', newId)
})
</script>

// 3. 编程式导航
<script setup lang="ts">
const router = useRouter()

// 导航到指定路由
function navigate() {
  router.push('/users/1')

  // 或带参数
  router.push({
    path: '/users/1',
    query: { tab: 'profile' }
  })

  // 或命名路由
  router.push({ name: 'users-id-profile', params: { id: 1 } })
}

// 替换当前路由
function replace() {
  router.replace('/login')
}

// 后退/前进
function goBack() {
  router.back()
  // 或 router.go(-1)
}
</script>

// 4. 嵌套路由
文件结构：
pages/
├── parent.vue
└── parent/
    ├── child.vue
    └── child/
        └── grandchild.vue

// parent.vue
<template>
  <div>
    <h1>Parent</h1>
    <NuxtPage /> <!-- 渲染子路由 -->
  </div>
</template>

// parent/child.vue
<template>
  <div>
    <h2>Child</h2>
    <NuxtPage />
  </div>
</template>

// 5. 路由中间件
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const isAuthenticated = useAuth().isAuthenticated.value

  if (!isAuthenticated) {
    return navigateTo('/login')
  }
})

// 使用方式
// 方式1：在页面中使用
<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})
</script>

// 方式2：全局中间件
// middleware/global.ts
export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/admin')) {
    // 检查权限
  }
})

// 方式3：命名中间件
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin']
})
</script>

// 6. 路由守卫
<script setup lang="ts">
definePageMeta({
  // 页面元信息
  layout: 'custom',
  middleware: ['auth'],

  // 自定义数据
  title: 'My Page',
  description: 'Page description',

  // 过渡
  pageTransition: {
    name: 'page',
    mode: 'out-in'
  }
})
</script>
```

### 路由过渡动画？

```vue
<!-- 全局过渡动画 -->
<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage :transition="{
      name: 'page',
      mode: 'out-in'
    }" />
  </NuxtLayout>
</template>

<style>
/* 页面过渡 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* 布局过渡 */
.layout-enter-active,
.layout-leave-active {
  transition: all 0.4s;
}

.layout-enter-from,
.layout-leave-to {
  filter: grayscale(100%);
}

.layout-enter-to,
.layout-leave-from {
  filter: grayscale(0%);
}
</style>

<!-- 页面级过渡 -->
<script setup lang="ts">
definePageMeta({
  pageTransition: {
    name: 'custom',
    mode: 'out-in',
    onBeforeEnter: () => console.log('Before enter'),
    onEnter: () => console.log('Enter'),
    onAfterEnter: () => console.log('After enter')
  }
})
</script>

<!-- 动态过渡 -->
<script setup lang="ts">
const direction = ref('forward')

definePageMeta({
  pageTransition: {
    name: computed(() => direction.value === 'forward' ? 'slide-left' : 'slide-right'),
    mode: 'out-in'
  }
})
</script>

<style>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
```

## Nuxt 3状态管理

### useState与useNuxtData？

```typescript
// 1. useState - 响应式状态
// 创建跨组件共享的响应式状态
<script setup lang="ts">
// 基础用法
const count = useState('count', () => 0)

// 在任何组件中使用相同的key，都会共享状态
</script>

<!-- ComponentA.vue -->
<script setup lang="ts">
const count = useState('count', () => 0)
</script>

<template>
  <div>{{ count }}</div>
  <button @click="count++">Increment</button>
</template>

<!-- ComponentB.vue -->
<script setup lang="ts">
// 共享同一个count状态
const count = useState('count', () => 0)
</script>

<template>
  <div>Count: {{ count }}</div>
</template>

// 2. useNuxtData - 访问useAsyncData缓存
<script setup lang="ts">
// 获取数据
const { data } = await useAsyncData('users', () => $fetch('/api/users'))

// 在其他组件中访问缓存的用户数据
<script setup lang="ts">
const usersData = useNuxtData('users')
console.log(usersData.value) // 缓存的数据
</script>

// 3. 区别与使用场景
// useState:
// - 用于存储响应式状态
// - SSR安全的
// - 跨组件共享
// - 手动管理

// useNuxtData:
// - 访问useAsyncData/useFetch的缓存
// - 只读访问
// - 自动管理
// - 适合访问缓存数据

// 4. 最佳实践
// composables/useCart.ts
export const useCart = () => {
  // 使用useState存储购物车
  const cart = useState<CartItem[]>('cart', () => [])

  const addItem = (item: CartItem) => {
    cart.value.push(item)
  }

  const removeItem = (itemId: string) => {
    const index = cart.value.findIndex(item => item.id === itemId)
    if (index > -1) {
      cart.value.splice(index, 1)
    }
  }

  const clearCart = () => {
    cart.value = []
  }

  const total = computed(() => {
    return cart.value.reduce((sum, item) => sum + item.price, 0)
  })

  return {
    cart: readonly(cart),
    addItem,
    removeItem,
    clearCart,
    total
  }
}

// pages/index.vue
<script setup lang="ts">
const { cart, addItem, total } = useCart()
</script>

// 5. Pinia集成（推荐用于复杂状态）
// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')

  const isLoggedIn = computed(() => !!token.value)

  async function login(credentials: LoginCredentials) {
    const data = await $fetch('/api/login', {
      method: 'POST',
      body: credentials
    })

    user.value = data.user
    token.value = data.token
  }

  function logout() {
    user.value = null
    token.value = ''
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout
  }
})
```

## Nuxt 3部署与优化

### Nitro引擎与部署？

```typescript
// 1. Nitro配置
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    // 预设
    preset: 'node-server', // node-server | vercel | netlify | cloudflare

    // 端口
    port: 3000,

    // 存储挂载
    storage: {
      'redis': {
        driver: 'redis',
        options: { host: 'localhost', port: 6379 }
      }
    },

    // 路由规则
    routeRules: {
      '/api/**': { cors: true, headers: { 'access-control-allow-origin': '*' } }
    },

    // 压缩
    compressPublicAssets: true
  }
})

// 2. Server API路由
// server/api/hello.get.ts
export default defineEventHandler(async (event) => {
  // 获取查询参数
  const query = getQuery(event)

  // 获取请求体
  const body = await readBody(event)

  // 获取cookie
  const cookies = parseCookies(event)

  // 设置响应
  return {
    message: 'Hello',
    query,
    body
  }
})

// server/api/users.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 验证
  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required'
    })
  }

  // 创建用户
  const user = await createUser(body)

  // 返回响应
  return user
})

// server/api/users/[id].delete.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  await deleteUser(id)

  return { success: true }
})

// 3. 中间件
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // 验证token
  const user = await verifyToken(token)

  // 将用户添加到context
  event.context.user = user
})

// server/api/protected/route.ts
export default defineEventHandler(async (event) => {
  // 访问middleware添加的context
  const user = event.context.user

  return { user }
})

// 4. 部署到不同平台

// Vercel
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel'
  }
})

// 部署命令
npm run build
vercel deploy

// Netlify
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'netlify'
  }
})

// netlify.toml
[build]
  command = "npm run generate"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

// Cloudflare Pages
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare'
  }
})

// Docker
// Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

### 性能优化清单？

```typescript
// 1. 代码分割
// pages/index.vue
<script setup lang="ts">
// 懒加载组件
const HeavyComponent = defineAsyncComponent(() =>
  import('~/components/HeavyComponent.vue')
)
</script>

<template>
  <div>
    <Suspense>
      <HeavyComponent />
    </Suspense>
  </div>
</template>

// 2. 图片优化
<script setup lang="ts">
import { useImage } from '@nuxt/image'

// 使用Nuxt Image模块
const imgUrl = useImage('/profile.jpg', {
  width: 300,
  height: 300,
  fit: 'cover'
})
</script>

<NuxtImg
  src="/profile.jpg"
  width="300"
  height="300"
  fit="cover"
  loading="lazy"
  placeholder
/>

// 3. 字体优化
// nuxt.config.ts
export default defineNuxtConfig({
  googleFonts: {
    families: {
      Roboto: [400, 700]
    }
  }
})

// 4. 预加载关键资源
<script setup lang="ts">
// 预加载字体
useHead({
  link: [
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      crossorigin: true,
      href: '/fonts/custom.woff2'
    }
  ]
})
</script>

// 5. 懒加载脚本
<script setup lang="ts">
// 只在客户端加载
onMounted(() => {
  import('~/heavy-library').then((module) => {
    // 使用库
  })
})
</script>

// 6. 虚拟滚动
<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'

const items = ref(Array(10000).fill(0).map((_, i) => i))

const { list, containerProps, wrapperProps } = useVirtualList(
  items,
  { itemHeight: 50 }
)
</script>

<template>
  <div v-bind="containerProps" style="height: 500px; overflow: auto;">
    <div v-bind="wrapperProps">
      <div
        v-for="item in list"
        :key="item.index"
        style="height: 50px;"
      >
        {{ item.data }}
      </div>
    </div>
  </div>
</template>

// 7. 缓存优化
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { isr: true }, // ISR
    '/api/**': { cache: { maxAge: 60 } }, // 缓存API
    '/static/**': { isr: false, headers: { 'cache-control': 'public, max-age=31536000' } }
  }
})

// 8. Tree Shaking
// 只导入需要的函数
import { useFetch } from '#app' // ✅ 好
import * from '#app' // ❌ 不好

// 9. 压缩
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    }
  }
})

// 10. 监控性能
// plugins/analytics.client.ts
export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === 'production') {
    // Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log)
      getFID(console.log)
      getFCP(console.log)
      getLCP(console.log)
      getTTFB(console.log)
    })
  }
})
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
