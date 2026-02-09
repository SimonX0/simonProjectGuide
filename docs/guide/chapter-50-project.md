---
title: Vue3 企业级实战项目
description: 从零构建一个完整的 Vue3 企业级应用
---

# ：Vue3 完全实战项目 - 企业级后台管理系统

> **项目概述**：本项目是一个功能完整的企业级后台管理系统，涵盖 Vue3、Vite、Pinia、Vue Router、Element Plus、TypeScript 等技术栈的实际应用。
>
> **学习目标**：
> - 掌握 Vue3 企业级项目的完整开发流程
> - 熟练使用 Composition API 和 Script Setup
> - 掌握状态管理、路由、权限控制的最佳实践
> - 学会性能优化、组件封装、工程化配置等企业级技能

---

## 项目介绍

### 项目背景

本企业级后台管理系统是一个典型的 B2B SaaS 应用，包含以下核心功能：

- ✅ **用户管理**：用户列表、角色分配、权限控制
- ✅ **权限管理**：动态路由、按钮级权限、数据权限
- ✅ **数据可视化**：ECharts 图表、数据大屏、实时统计
- ✅ **系统设置**：菜单配置、字典管理、日志监控
- ✅ **多主题切换**：支持亮色/暗色主题、自定义主题色
- ✅ **国际化**：支持中英文切换

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **框架** | Vue | 3.4+ |
| **语言** | TypeScript | 5.x |
| **构建工具** | Vite | 5.x |
| **路由** | Vue Router | 4.x |
| **状态管理** | Pinia | 2.x |
| **UI库** | Element Plus | latest |
| **CSS预处理** | SCSS | latest |
| **图表库** | ECharts | 5.x |
| **工具库** | VueUse | 10.x |
| **代码规范** | ESLint + Prettier | latest |
| **HTTP库** | Axios | 1.x |
| **图标** | @element-plus/icons-vue | latest |

### 项目结构

```
vue-admin-system/
├── public/                      # 静态资源
├── src/
│   ├── api/                     # API 接口
│   │   ├── user.ts
│   │   ├── menu.ts
│   │   └── dashboard.ts
│   ├── assets/                  # 资源文件
│   │   ├── images/
│   │   ├── styles/
│   │   └── icons/
│   ├── components/              # 公共组件
│   │   ├── PageHeader/
│   │   ├── TableContainer/
│   │   ├── ChartContainer/
│   │   └── UploadImage/
│   ├── composables/             # 组合式函数
│   │   ├── useTable.ts
│   │   ├── useChart.ts
│   │   ├── usePermission.ts
│   │   └── useTheme.ts
│   ├── directive/               # 自定义指令
│   │   └── permission/
│   ├── layouts/                 # 布局组件
│   │   ├── DefaultLayout.vue
│   │   └── BlankLayout.vue
│   ├── router/                  # 路由配置
│   │   ├── index.ts
│   │   └── permissions.ts
│   ├── stores/                  # Pinia 状态管理
│   │   ├── user.ts
│   │   ├── menu.ts
│   │   ├── settings.ts
│   │   └── permission.ts
│   ├── styles/                  # 全局样式
│   │   ├── index.scss
│   │   ├── variables.scss
│   │   ├── element-variables.scss
│   │   └── transition.scss
│   ├── utils/                   # 工具函数
│   │   ├── request.ts
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   └── format.ts
│   ├── views/                   # 页面组件
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── system/
│   │   └── components/
│   ├── App.vue
│   └── main.ts
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc.json
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 项目搭建

### 1. 项目初始化

```bash
# 使用 Vite 创建项目
npm create vite@latest vue-admin-system -- --template vue-ts
cd vue-admin-system
npm install

# 安装核心依赖
npm install vue-router@4 pinia element-plus axios
npm install @element-plus/icons-vue
npm install echarts vue-echarts
npm install @vueuse/core
npm install sass

# 安装开发依赖
npm install -D @types/node
npm install -D eslint prettier
npm install -D unplugin-auto-import
npm install -D unplugin-vue-components
```

### 2. Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    // 自动导入 Vue API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

### 3. TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 核心功能实现

### 1. 路由配置与权限控制

#### 1.1 路由结构

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'House', affix: true },
      },
    ],
  },
  {
    path: '/404',
    component: () => import('@/views/error/404.vue'),
    meta: { hidden: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const hasToken = userStore.token

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (userStore.userId) {
        next()
      } else {
        try {
          await userStore.getUserInfo()
          const accessRoutes = await permissionStore.generateRoutes()
          accessRoutes.forEach((route) => {
            router.addRoute(route)
          })
          next({ ...to, replace: true })
        } catch (error) {
          await userStore.resetToken()
          ElMessage.error('获取用户信息失败，请重新登录')
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    if (to.meta.whiteList) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
```

#### 1.2 动态路由生成

```typescript
// src/stores/permission.ts
import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import { constantRoutes } from '@/router'
import Layout from '@/layouts/DefaultLayout.vue'

const modules = import.meta.glob('../views/**/*.vue')

// 将后端路由转换为 Vue Router 路由
function filterAsyncRoutes(routes: any[]) {
  const res: RouteRecordRaw[] = []

  routes.forEach((route) => {
    const tmp: any = { ...route }
    if (tmp.component === 'Layout') {
      tmp.component = Layout
    } else {
      const component = tmp.component
      tmp.component = modules[`../views/${component}.vue`]
    }

    if (tmp.children) {
      tmp.children = filterAsyncRoutes(tmp.children)
    }

    res.push(tmp)
  })

  return res
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[],
    addRoutes: [] as RouteRecordRaw[],
  }),
  actions: {
    async generateRoutes() {
      const { data } = await getRouters()
      const accessedRoutes = filterAsyncRoutes(data)
      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat(accessedRoutes)
      return accessedRoutes
    },
  },
})
```

### 2. Pinia 状态管理

#### 2.1 用户状态管理

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import { login, logout, getUserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() as string,
    userId: '',
    username: '',
    avatar: '',
    roles: [] as string[],
    permissions: [] as string[],
  }),

  getters: {
    hasPermission: (state) => (permission: string) => {
      return state.permissions.includes(permission)
    },
  },

  actions: {
    async login(loginForm: LoginForm) {
      const { data } = await login(loginForm)
      this.token = data.token
      setToken(data.token)
    },

    async getUserInfo() {
      const { data } = await getUserInfo()
      this.userId = data.userId
      this.username = data.username
      this.avatar = data.avatar
      this.roles = data.roles
      this.permissions = data.permissions
    },

    async logout() {
      await logout()
      this.resetToken()
    },

    resetToken() {
      this.token = ''
      this.userId = ''
      this.username = ''
      this.avatar = ''
      this.roles = []
      this.permissions = []
      removeToken()
    },
  },
})
```

### 3. 封装组合式函数

#### 3.1 表格 Hook

```typescript
// src/composables/useTable.ts
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export function useTable<T>(apiFn: (params: any) => Promise<any>) {
  const loading = ref(false)
  const data = ref<T[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)

  const fetchData = async (params?: any) => {
    loading.value = true
    try {
      const { data: res } = await apiFn({
        page: currentPage.value,
        pageSize: pageSize.value,
        ...params,
      })
      data.value = res.list
      total.value = res.total
    } catch (error) {
      ElMessage.error('获取数据失败')
    } finally {
      loading.value = false
    }
  }

  const handleCurrentChange = (page: number) => {
    currentPage.value = page
    fetchData()
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    fetchData()
  }

  return {
    loading,
    data,
    total,
    currentPage,
    pageSize,
    fetchData,
    handleCurrentChange,
    handleSizeChange,
  }
}
```

#### 3.2 权限 Hook

```typescript
// src/composables/usePermission.ts
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function usePermission() {
  const userStore = useUserStore()

  const hasPermission = (permission: string | string[]) => {
    if (Array.isArray(permission)) {
      return permission.some((p) => userStore.permissions.includes(p))
    }
    return userStore.permissions.includes(permission)
  }

  const hasRole = (role: string | string[]) => {
    if (Array.isArray(role)) {
      return role.some((r) => userStore.roles.includes(r))
    }
    return userStore.roles.includes(role)
  }

  const isAdmin = computed(() => userStore.roles.includes('admin'))

  return {
    hasPermission,
    hasRole,
    isAdmin,
  }
}
```

### 4. 组件封装

#### 4.1 表格容器组件

```vue
<!-- src/components/TableContainer/index.vue -->
<template>
  <div class="table-container">
    <el-table
      v-loading="loading"
      :data="data"
      :border="border"
      :stripe="stripe"
      @selection-change="handleSelectionChange"
    >
      <slot />
    </el-table>

    <el-pagination
      v-if="showPagination"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: any[]
  loading?: boolean
  border?: boolean
  stripe?: boolean
  total?: number
  showPagination?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  border: true,
  stripe: true,
  total: 0,
  showPagination: true,
})

const emit = defineEmits(['selection-change', 'current-change', 'size-change'])

const currentPage = defineModel<number>('currentPage', { default: 1 })
const pageSize = defineModel<number>('pageSize', { default: 10 })

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}
</script>

<style scoped lang="scss">
.table-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;

  .el-pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
```

### 5. 数据可视化

#### 5.1 ECharts 图表封装

```vue
<!-- src/components/ChartContainer/index.vue -->
<template>
  <div ref="chartRef" class="chart-container" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface Props {
  option: EChartsOption
  theme?: string
}

const props = withDefaults(defineProps<Props>(), {
  theme: '',
})

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value, props.theme)
  chartInstance.setOption(props.option)
}

const resizeChart = () => {
  chartInstance?.resize()
}

watch(
  () => props.option,
  (newOption) => {
    chartInstance?.setOption(newOption)
  },
  { deep: true }
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})
</script>

<style scoped lang="scss">
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
```

---

## 性能优化

### 1. 路由懒加载

```typescript
const routes = [
  {
    path: '/system',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index.vue'),
      },
    ],
  },
]
```

### 2. 组件按需导入

```typescript
// vite.config.ts
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

### 3. 虚拟滚动

```vue
<template>
  <el-virtual-list
    :data="largeData"
    :item-size="50"
    :component="ItemComponent"
  />
</template>
```

### 4. 防抖节流

```typescript
// src/utils/performance.ts
export function useDebounce<T>(fn: (...args: T[]) => void, delay = 300) {
  let timer: NodeJS.Timeout | null = null
  return (...args: T[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function useThrottle<T>(fn: (...args: T[]) => void, delay = 300) {
  let last = 0
  return (...args: T[]) => {
    const now = Date.now()
    if (now - last > delay) {
      fn(...args)
      last = now
    }
  }
}
```

---

## 部署上线

### 1. 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          echarts: ['echarts'],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
})
```

### 2. 环境变量配置

```bash
# .env.development
VITE_APP_TITLE=Vue3 管理系统
VITE_APP_BASE_API=/api
VITE_APP_UPLOAD_URL=/upload

# .env.production
VITE_APP_TITLE=Vue3 管理系统
VITE_APP_BASE_API=https://api.example.com
VITE_APP_UPLOAD_URL=https://cdn.example.com/upload
```

### 3. Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 项目总结

本项目涵盖了 Vue3 企业级开发的核心知识点：

✅ **技术栈**：Vue3 + TypeScript + Vite + Pinia + Vue Router + Element Plus
✅ **功能模块**：用户管理、权限控制、动态路由、数据可视化
✅ **工程化**：代码规范、自动化配置、性能优化、部署上线
✅ **最佳实践**：组合式函数封装、组件复用、状态管理、路由设计

通过这个项目，你将掌握：
- Vue3 企业级项目的完整开发流程
- TypeScript 在 Vue3 中的最佳实践
- Pinia 状态管理的使用技巧
- 动态路由和权限控制的实现方案
- 组件封装和代码复用的方法论
- 性能优化和工程化配置

---

## 下一步学习

建议继续学习以下内容：

- [第52章：Vue3 组件库开发完全指南](/guide/chapter-45)
- [第53章：微前端架构（qiankun 集成）](/guide/chapter-29)
- [第54章：前端监控与埋点](/guide/chapter-36)
- [第55章：Vite 插件开发](/guide/chapter-38)
