# Vue Router 高级特性完全指南

## Vue Router 高级特性

> **学习目标**：全面掌握 Vue Router 的高级特性和最佳实践
> **核心内容**：
> - 路由守卫详解
> - 动态路由高级用法
> - 路由模式对比
> - 导航故障处理
> - 路由过渡动画
> - 路由懒加载策略
> - 路由组合式 API
> - 实战案例

---

## 路由守卫详解

### 全局前置守卫（beforeEach）

#### 基础用法

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ... 路由配置
  ]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('导航从:', from.path)
  console.log('导航到:', to.path)

  // 必须调用 next() 来 resolve 钩子
  next()
})
```

#### 身份验证守卫

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<any>(null)
  const roles = ref<string[]>([])

  const isLoggedIn = computed(() => !!token.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function clearAuth() {
    token.value = null
    user.value = null
    roles.value = []
    localStorage.removeItem('token')
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  function hasAnyRole(requiredRoles: string[]): boolean {
    return requiredRoles.some(role => roles.value.includes(role))
  }

  return {
    token,
    user,
    roles,
    isLoggedIn,
    setToken,
    clearAuth,
    hasRole,
    hasAnyRole
  }
})
```

```typescript
// router/guards.ts
import { useUserStore } from '@/stores/user'

// 身份验证守卫
export function setupAuthGuard(router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    // 检查路由是否需要身份验证
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    if (requiresAuth && !userStore.isLoggedIn) {
      // 未登录，重定向到登录页
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }

    next()
  })
}
```

#### 权限控制守卫

```typescript
// router/guards.ts
// 权限控制守卫
export function setupPermissionGuard(router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    // 获取路由所需的所有角色
    const requiredRoles = to.meta.roles as string[] | undefined

    if (requiredRoles && requiredRoles.length > 0) {
      // 检查用户是否有所需角色
      if (!userStore.hasAnyRole(requiredRoles)) {
        // 权限不足，重定向到 403 页面
        next({ name: 'Forbidden' })
        return
      }
    }

    next()
  })
}
```

#### 页面标题守卫

```typescript
// router/guards.ts
// 页面标题守卫
export function setupTitleGuard(router) {
  router.beforeEach((to, from, next) => {
    // 设置页面标题
    const title = to.meta.title
      ? `${to.meta.title} - Vue3 App`
      : 'Vue3 App'

    document.title = title

    next()
  })
}
```

#### 进度条守卫

```vue
<!-- components/ProgressBar.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const progress = ref(0)

let timer: number | undefined

function start() {
  loading.value = true
  progress.value = 0

  timer = setInterval(() => {
    progress.value += Math.random() * 30
    if (progress.value > 90) {
      progress.value = 90
    }
  }, 100)
}

function finish() {
  progress.value = 100
  loading.value = true

  setTimeout(() => {
    loading.value = false
    progress.value = 0
  }, 300)

  if (timer) {
    clearInterval(timer)
  }
}

watch(() => router.currentRoute.value, (to, from) => {
  if (to.path !== from.path) {
    start()
  }
})
</script>

<template>
  <div v-if="loading" class="progress-bar">
    <div class="progress" :style="{ width: progress + '%' }"></div>
  </div>
</template>

<style scoped>
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f0f0f0;
  z-index: 9999;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #35495e);
  transition: width 0.3s ease;
}
</style>
```

---

### 全局后置钩子（afterEach）

```typescript
// router/guards.ts
// 全局后置钩子
export function setupAfterHook(router) {
  router.afterEach((to, from) => {
    // 页面访问统计
    if (import.meta.env.PROD) {
      // 发送统计数据
      analytics.track('page_view', {
        page: to.path,
        title: to.meta.title,
        referrer: from.path
      })
    }

    // 滚动到页面顶部
    if (to.hash) {
      // 有锚点，滚动到锚点位置
      setTimeout(() => {
        const element = document.querySelector(to.hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 300)
    } else {
      // 无锚点，滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })
}
```

---

### 路由独享守卫

```typescript
// router/routes/user.ts
import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('@/views/user/Profile.vue'),
    meta: {
      title: '个人资料',
      requiresAuth: true
    },
    // 路由独享守卫
    beforeEnter: (to, from, next) => {
      console.log('进入用户资料页')

      // 可以进行特定的验证
      const userStore = useUserStore()

      if (!userStore.user?.profileCompleted) {
        // 资料未完善，重定向到完善资料页
        next({ name: 'CompleteProfile' })
      } else {
        next()
      }
    }
  },
  {
    path: '/user/settings',
    name: 'UserSettings',
    component: () => import('@/views/user/Settings.vue'),
    meta: {
      title: '用户设置',
      requiresAuth: true,
      roles: ['admin', 'user']
    },
    // 多个守卫
    beforeEnter: [
      (to, from, next) => {
        console.log('守卫1')
        next()
      },
      (to, from, next) => {
        console.log('守卫2')
        next()
      }
    ]
  }
]

export default userRoutes
```

---

### 组件内守卫

```vue
<!-- views/user/EditPost.vue -->
<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { ref } from 'vue'

const post = ref({
  title: '',
  content: ''
})

const hasChanges = ref(false)

// 监听路由更新
onBeforeRouteUpdate((to, from, next) => {
  // 当路由改变但组件被复用时调用
  if (hasChanges.value) {
    const answer = window.confirm(
      '你有未保存的更改，确定要离开吗？'
    )

    if (answer) {
      next() // 允许导航
    } else {
      next(false) // 取消导航
    }
  } else {
    next()
  }
})

// 离开守卫
onBeforeRouteLeave((to, from, next) => {
  if (hasChanges.value) {
    const answer = window.confirm(
      '你有未保存的更改，确定要离开吗？'
    )

    if (answer) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})

function saveChanges() {
  // 保存逻辑...
  hasChanges.value = false
}
</script>

<template>
  <div>
    <h1>编辑文章</h1>
    <input v-model="post.title" placeholder="标题" @input="hasChanges = true" />
    <textarea v-model="post.content" @input="hasChanges = true"></textarea>

    <button @click="saveChanges">保存</button>
  </div>
</template>
```

---

### 完整的守卫执行顺序

```
1. 导航被触发
2. 失活组件的 beforeRouteLeave 守卫
3. 全局 beforeEach 守卫
4. 重用的组件内 beforeRouteUpdate 守卫
5. 路由配置中的 beforeEnter
6. 异步路由组件被解析
7. 激活组件的 beforeRouteEnter 守卫
8. 全局 beforeResolve 守卫
9. 导航被确认
10. 全局 afterEach 钩子
11. DOM 更新
12. beforeRouteEnter 守卫中传给 next 的回调函数被调用
```

---

## 动态路由高级用法

### 动态添加路由

```typescript
// router/dynamic.ts
import { router } from '@/router'

// 动态添加路由
export function addDynamicRoutes() {
  // 添加单个路由
  router.addRoute({
    path: '/dynamic',
    name: 'DynamicRoute',
    component: () => import('@/views/Dynamic.vue')
  })

  // 添加嵌套路由
  router.addRoute('Admin', {
    path: 'dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/Dashboard.vue')
  })

  // 添加多个路由
  const routes = [
    {
      path: '/page1',
      name: 'Page1',
      component: () => import('@/views/Page1.vue')
    },
    {
      path: '/page2',
      name: 'Page2',
      component: () => import('@/views/Page2.vue')
    }
  ]

  routes.forEach(route => router.addRoute(route))
}

// 删除路由
export function removeRoute(routeName: string) {
  router.removeRoute(routeName)
}

// 检查路由是否存在
export function hasRoute(routeName: string): boolean {
  return router.hasRoute(routeName)
}
```

### 基于权限的动态路由

```typescript
// router/permission.ts
import { router } from '@/router'
import { useUserStore } from '@/stores/user'
import Layout from '@/layouts/AdminLayout.vue'

// 异步路由表
const asyncRoutes = [
  {
    path: '/admin',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'dashboard', roles: ['admin'] }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
        meta: { title: '用户管理', icon: 'user', roles: ['admin'] }
      },
      {
        path: 'roles',
        name: 'AdminRoles',
        component: () => import('@/views/admin/Roles.vue'),
        meta: { title: '角色管理', icon: 'role', roles: ['admin'] }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/Settings.vue'),
        meta: { title: '系统设置', icon: 'settings', roles: ['admin'] }
      }
    ]
  }
]

// 根据角色过滤路由
function filterRoutes(routes: any[], roles: string[]) {
  const filtered: any[] = []

  routes.forEach(route => {
    const routeCopy = { ...route }

    // 检查权限
    if (hasPermission(routeCopy, roles)) {
      // 如果有子路由，递归过滤
      if (routeCopy.children && routeCopy.children.length > 0) {
        routeCopy.children = filterRoutes(routeCopy.children, roles)
      }

      filtered.push(routeCopy)
    }
  })

  return filtered
}

// 检查是否有权限
function hasPermission(route: any, roles: string[]): boolean {
  if (route.meta && route.meta.roles) {
    return route.meta.roles.some((role: string) => roles.includes(role))
  }
  return true
}

// 重置路由
export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes: []
  })

  ;(router as any).matcher = (newRouter as any).matcher
}

// 动态添加权限路由
export async function setupPermissionRoutes() {
  const userStore = useUserStore()
  const roles = userStore.roles

  // 重置路由
  resetRouter()

  // 过滤并添加路由
  const accessedRoutes = filterRoutes(asyncRoutes, roles)
  accessedRoutes.forEach(route => router.addRoute(route))

  return accessedRoutes
}
```

### 路由懒加载策略

```typescript
// router/lazy.ts
// Vite 5.4+ 懒加载注释（兼容 Webpack 魔法注释）

// 基础懒加载
const Home = () => import('@/views/Home.vue')

// 命名 chunk（Vite 标准写法）
const About = () => import(/* @vite-ignore */ '@/views/About.vue')
// 或者使用传统的 chunk 命名（Vite 也支持）
const About = () => import(/* webpackChunkName: "about" */ '@/views/About.vue')

// 分组 chunk（相同 chunkName 会被打包到一起）
const UserProfile = () => import(/* webpackChunkName: "user" */ '@/views/user/Profile.vue')
const UserSettings = () => import(/* webpackChunkName: "user" */ '@/views/user/Settings.vue')

// 预获取（Prefetch - 浏览器空闲时加载）
const Dashboard = () => import(/* webpackPrefetch: true */ '@/views/admin/Dashboard.vue')

// 预加载（Preload - 与父并行加载）
const Admin = () => import(/* webpackPreload: true */ '@/views/admin/Index.vue')

// 完整示例
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue')
  },
  {
    path: '/user',
    component: () => import(/* webpackChunkName: "user-layout" */ '@/layouts/UserLayout.vue'),
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Profile.vue'),
        meta: { preload: true }
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Settings.vue')
      }
    ]
  }
]
```

---

## 导航故障处理

### 捕获导航错误

```typescript
// router/error-handler.ts
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export function useNavigationErrorHandler() {
  const router = useRouter()

  // 处理导航错误
  async function safePush(location: any) {
    try {
      await router.push(location)
      return true
    } catch (error) {
      console.error('Navigation error:', error)

      // 是导航被中止
      if (error instanceof Error && error.name === 'NavigationAborted') {
        ElMessage.warning('导航已取消')
        return false
      }

      // 是重复导航
      if (error instanceof Error && error.name === 'NavigationDuplicated') {
        // 静默处理重复导航
        return true
      }

      // 其他错误
      ElMessage.error('导航失败: ' + error.message)
      return false
    }
  }

  // 处理导航替换
  async function safeReplace(location: any) {
    try {
      await router.replace(location)
      return true
    } catch (error) {
      console.error('Replace error:', error)
      ElMessage.error('导航失败')
      return false
    }
  }

  // 处理返回
  async function safeBack(delta = -1) {
    try {
      await router.go(delta)
      return true
    } catch (error) {
      console.error('Go error:', error)

      // 如果没有历史记录，返回首页
      if (error instanceof Error && error.message.includes('exceeded')) {
        await router.push('/')
        return true
      }

      return false
    }
  }

  return {
    safePush,
    safeReplace,
    safeBack
  }
}
```

### isReady() 处理

```typescript
// 等待路由准备就绪
export async function waitForRouter(router) {
  try {
    await router.isReady()
    console.log('Router is ready')
  } catch (error) {
    console.error('Router initialization failed:', error)
  }
}

// 在应用启动时使用
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

// 等待路由准备就绪后再挂载
router.isReady().then(() => {
  app.mount('#app')
})
```

---

## 路由过渡动画

### 基础过渡效果

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const transitionName = ref('fade')

// 根据路由元信息设置过渡
watch(
  () => route.meta,
  (meta) => {
    transitionName.value = (meta.transition as string) || 'fade'
  }
)
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style scoped>
/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑动 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

/* 缩放 */
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
```

### 动态过渡效果

```vue
<!-- App.vue -->
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 计算过渡名称
const transitionName = computed(() => {
  // 根据路由深度决定滑动方向
  const toDepth = route.meta.depth || 0
  const fromDepth = router.currentRoute.value.meta.depth || 0

  return toDepth > fromDepth ? 'slide-left' : 'slide-right'
})
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style scoped>
/* 向左滑动 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-20%);
  opacity: 0;
}

/* 向右滑动 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-out;
}

.slide-right-enter-from {
  transform: translateX(-20%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
```

---

## 路由组合式 API

### useRouter 和 useRoute

```vue
<script setup lang="ts">
import { useRouter, useRoute, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { ref, computed, watch } from 'vue'

const router = useRouter()
const route = useRoute()

// 路由信息
console.log(route.path)      // 当前路径
console.log(route.params)    // 路由参数
console.log(route.query)     // 查询参数
console.log(route.meta)      // 元信息
console.log(route.hash)      // 锚点
console.log(route.fullPath)  // 完整路径（包含查询参数和锚点）

// 计算属性
const userId = computed(() => route.params.id as string)
const searchQuery = computed(() => route.query.q as string)
const currentPage = computed(() => parseInt(route.query.page as string) || 1)

// 监听路由变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    console.log(`用户ID从 ${oldId} 变为 ${newId}`)
    // 重新加载数据
    loadData(newId)
  }
)

// 编程式导航
function navigateToUser(id: number) {
  router.push({ name: 'User', params: { id } })
}

function navigateWithQuery() {
  router.push({
    path: '/search',
    query: { q: 'vue', page: 1 }
  })
}

function replaceRoute() {
  router.replace({ name: 'Home' })
}

function goBack() {
  router.back()
}

function goForward() {
  router.forward()
}

// 导航到指定历史记录
function goToStep(step: number) {
  router.go(step)
}

// 路由守卫
onBeforeRouteUpdate((to, from, next) => {
  console.log('路由更新')
  next()
})

onBeforeRouteLeave((to, from, next) => {
  const answer = window.confirm('确定要离开吗？')
  if (answer) {
    next()
  } else {
    next(false)
  }
})

async function loadData(id: string) {
  // 加载数据逻辑...
}
</script>
```

### 自定义路由组合式函数

```typescript
// composables/useNavigation.ts
import { useRouter, useRoute, type LocationAsRelativeRaw, type RouteRecordRaw } from 'vue-router'
import { computed } from 'vue'

export function useNavigation() {
  const router = useRouter()
  const route = useRoute()

  // 当前路由信息
  const currentPath = computed(() => route.path)
  const currentParams = computed(() => route.params)
  const currentQuery = computed(() => route.query)
  const currentHash = computed(() => route.hash)

  // 导航方法
  const push = async (location: LocationAsRelativeRaw) => {
    try {
      await router.push(location)
      return { success: true }
    } catch (error) {
      console.error('Navigation error:', error)
      return { success: false, error }
    }
  }

  const replace = async (location: LocationAsRelativeRaw) => {
    try {
      await router.replace(location)
      return { success: true }
    } catch (error) {
      console.error('Replace error:', error)
      return { success: false, error }
    }
  }

  const back = () => router.back()
  const forward = () => router.forward()
  const go = (delta: number) => router.go(delta)

  // 是否可以返回
  const canGoBack = computed(() => {
    return window.history.length > 1
  })

  return {
    // 路由信息
    currentPath,
    currentParams,
    currentQuery,
    currentHash,
    canGoBack,
    // 导航方法
    push,
    replace,
    back,
    forward,
    go
  }
}
```

```typescript
// composables/useRouteQuery.ts
import { useRoute, useRouter } from 'vue-router'
import { computed, watch } from 'vue'

export function useRouteQuery() {
  const route = useRoute()
  const router = useRouter()

  // 获取查询参数
  const query = computed(() => route.query)

  // 设置查询参数
  function setQuery(params: Record<string, any>, replace = false) {
    const currentQuery = { ...route.query }

    // 合并查询参数
    Object.assign(currentQuery, params)

    const navigation = replace ? router.replace : router.push
    navigation({ query: currentQuery })
  }

  // 删除查询参数
  function removeQuery(keys: string[], replace = false) {
    const currentQuery = { ...route.query }

    keys.forEach(key => {
      delete currentQuery[key]
    })

    const navigation = replace ? router.replace : router.push
    navigation({ query: currentQuery })
  }

  // 清空所有查询参数
  function clearQuery(replace = false) {
    const navigation = replace ? router.replace : router.push
    navigation({ query: {} })
  }

  // 监听查询参数变化
  function onQueryChange(callback: (query: any) => void) {
    watch(
      () => route.query,
      (query) => callback(query),
      { immediate: true }
    )
  }

  return {
    query,
    setQuery,
    removeQuery,
    clearQuery,
    onQueryChange
  }
}
```

---

## 实战案例

### 完整的权限路由系统

```typescript
// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { setupAuthGuard, setupPermissionGuard, setupTitleGuard } from './guards'

// 基础路由（不需要权限）
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', hidden: true }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '权限不足', hidden: true }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0 }
    }
  }
})

// 设置路由守卫
setupAuthGuard(router)
setupPermissionGuard(router)
setupTitleGuard(router)

export default router
```

```typescript
// stores/permission.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { asyncRoutes, resetRouter, setupPermissionRoutes } from '@/router/permission'

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const addRoutes = ref<RouteRecordRaw[]>([])

  const hasRoutes = computed(() => addRoutes.value.length > 0)

  // 生成路由
  async function generateRoutes() {
    // 重置路由
    resetRouter()

    // 动态添加权限路由
    const accessedRoutes = await setupPermissionRoutes()

    routes.value = constantRoutes.concat(accessedRoutes)
    addRoutes.value = accessedRoutes

    return accessedRoutes
  }

  return {
    routes,
    addRoutes,
    hasRoutes,
    generateRoutes
  }
})
```

---

## 总结

本章全面介绍了 Vue Router 的高级特性和实战技巧：

- ✅ 路由守卫详解（beforeEach、afterEach、beforeEnter、组件内守卫）
- ✅ 动态路由高级用法（动态添加、权限路由、懒加载策略）
- ✅ 导航故障处理
- ✅ 路由过渡动画
- ✅ 路由组合式 API（useRouter、useRoute、自定义组合式函数）
- ✅ 完整的权限路由系统实战

掌握这些内容后，你将能够：
- 构建复杂的多页面应用
- 实现细粒度的权限控制
- 优化路由加载性能
- 提升用户体验（过渡动画、进度条等）

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v2.0**
