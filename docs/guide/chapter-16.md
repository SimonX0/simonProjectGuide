# Vue Router 路由完全指南

## Vue Router 路由完全指南

> **2024-2026更新**：本章节已更新到 Vue Router 4.4+，包含最新的组合式API、TypeScript支持和性能优化。

> **学习目标**：全面掌握Vue Router路由系统
> **核心内容**：路由配置、动态路由、嵌套路由、路由守卫

### 安装和配置 {#安装和配置}

> **2024-2026更新**：Vue Router 4.4+ 是当前最新稳定版，支持 Vue 3.4+ 所有特性。

```bash
# 安装 Vue Router 4.4+（推荐）
npm install vue-router@4

# 或使用 pnpm（推荐）
pnpm add vue-router@4

# 查看版本
npm list vue-router
```

```typescript
// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 定义路由配置（Vue Router 4.4+）
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: '关于' }
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue'),
    meta: { title: '用户详情', requiresAuth: true }
  },
  {
    // 404 页面（Vue Router 4.4+ 语法）
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

// 创建路由实例（Vue Router 4.4+）
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Vue Router 4.4+ 新特性：滚动行为优化
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Vue App'} - My Website`
  next()
})

export default router
```

**Vue Router 4.4+ 新特性（2024-2026）：**
- ⚡ 性能优化：导航速度提升 30%
- 🎯 改进的 TypeScript 类型推导
- 🔧 优化的滚动行为 API
- 📦 更小的打包体积（Tree-shaking 优化）
- 🛡️ 增强的路由守卫类型安全
- 🚀 支持 Vue 3.4+ defineModel 和 props 解构

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

### 路由使用 {#路由使用}

```vue
<!-- App.vue -->
<script setup lang="ts">
</script>

<template>
  <div id="app">
    <!-- 导航链接 -->
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
      <router-link :to="{ name: 'User', params: { id: 123 } }">用户</router-link>
    </nav>

    <!-- 路由视图出口 -->
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped>
nav a.router-link-active {
  color: #42b983;
  font-weight: bold;
}
</style>
```

### 编程式导航 {#编程式导航}

```vue
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 导航到不同位置
function navigate() {
  // 字符串路径
  router.push('/users/1')

  // 对象
  router.push({ path: '/users/1' })

  // 命名路由
  router.push({ name: 'User', params: { id: 1 } })

  // 带查询参数
  router.push({ path: '/user', query: { id: 1 } })
}

// 替换当前位置
function replace() {
  router.replace('/user')
}

// 前进/后退
function goBack() {
  router.go(-1)  // 后退
  router.go(1)   // 前进
}
</script>
```

### 路由守卫与权限控制 {#路由守卫与权限控制}

```typescript
// router/index.ts

// 扩展路由元信息类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: string[]
    icon?: string
    hidden?: boolean
  }
}

// 权限检查函数
function checkPermission(meta: any, userRole: string): boolean {
  if (!meta.requiresAuth) return true
  if (!meta.roles || meta.roles.length === 0) return true
  return meta.roles.includes(userRole)
}

// 全局守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = userStore.isLoggedIn
  const userRole = userStore.role

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.roles && !checkPermission(to.meta, userRole)) {
    next({ name: 'Forbidden' })
  } else {
    next()
  }
})
```

---
