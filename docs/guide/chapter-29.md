# 微前端架构（qiankun 集成）
## # 4.5 微前端架构（qiankun 集成）
## 微前端架构（qiankun 集成）

> **学习目标**：掌握微前端架构设计和 qiankun 集成
> **核心内容**：微前端概念、qiankun 配置、应用通信、样式隔离、生产部署

> **为什么需要微前端？**
> - 大型应用团队协作困难
> - 不同技术栈项目整合需求
> - 独立部署和版本控制
> - 降低代码耦合度
> - 提升项目可维护性

### 微前端概念与架构

#### 什么是微前端？

**微前端（Micro-Frontends）** 是一种将单页应用（SPA）拆分为多个小型前端应用的架构模式：

```
传统单体应用架构：

┌─────────────────────────────────────────┐
│           单体前端应用                    │
│  ┌─────────────────────────────────────┐ │
│  │  用户中心   订单管理   商品管理        │ │
│  │  (Vue3)     (Vue3)     (Vue3)        │ │
│  │                                     │ │
│  │  共享同一个构建和部署流程              │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

微前端架构：

┌─────────────────────────────────────────┐
│         主应用（Base App）                │
│  ┌───────────┐ ┌───────────┐ ┌─────────┐│
│  │ 用户中心   │ │ 订单管理   │ │ 商品管理 ││
│  │ (Vue3)    │ │ (React)   │ │ (Vue2) ││
│  │ 独立部署   │ │ 独立部署   │ │ 独立部署 ││
│  └───────────┘ └───────────┘ └─────────┘│
└─────────────────────────────────────────┘
```

**微前端的优势：**

| 优势 | 说明 |
|------|------|
| 团队自治 | 不同团队独立开发、测试、部署 |
| 技术栈无关 | Vue3、React、Angular 混用 |
| 独立部署 | 子应用独立发布，互不影响 |
| 代码隔离 | 避免代码冲突和耦合 |
| 增量升级 | 逐步重构，降低风险 |

**微前端的挑战：**

| 挑战 | 解决方案 |
|------|----------|
| 性能开销 | 应用懒加载、预加载策略 |
| 状态共享 | 应用间通信机制 |
| 样式冲突 | CSS 隔离方案 |
| 公共依赖 | External 配置、模块联邦 |

#### 微前端方案对比

| 方案 | 难度 | 生态 | 适用场景 |
|------|------|------|----------|
| **qiankun** | ⭐⭐ | 丰富 | Vue3 项目首选 |
| **micro-app** | ⭐⭐⭐ | 较新 | 简单易用 |
| **single-spa** | ⭐⭐⭐⭐ | 成熟 | 需要深度定制 |
| **Module Federation** | ⭐⭐⭐⭐⭐ | Webpack5 | 复杂场景 |

---

### qiankun 基础配置

#### 安装 qiankun

```bash
# 主应用安装 qiankun
npm install qiankun

# 或使用 yarn
yarn add qiankun

# 或使用 pnpm
pnpm add qiankun
```

#### qiankun 核心概念

```typescript
// qiankun 三大核心 API
import { registerMicroApps, start, initGlobalState } from 'qiankun'

// 1. 注册子应用
registerMicroApps([
  {
    name: 'app1',           // 子应用名称
    entry: '//localhost:8081',  // 子应用入口
    container: '#container',    // 子应用容器
    activeRule: '/app1',        // 激活规则
  }
])

// 2. 启动 qiankun
start()

// 3. 全局状态管理
const actions = initGlobalState(state)
```

---

### 主应用配置

#### 创建主应用项目

```bash
# 使用 Vite 创建主应用
npm create vue@latest main-app

cd main-app
npm install

# 安装 qiankun
npm install qiankun
```

#### 主应用入口配置

```typescript
// main.ts
import { createApp } from 'vue'
import { registerMicroApps, start, initGlobalState } from 'qiankun'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

// 定义微应用
const microApps = [
  {
    name: 'user-center',           // 子应用名称
    entry: '//localhost:3001',     // 子应用地址
    container: '#subapp-viewport', // 容器节点
    activeRule: '/user',           // 激活路由
    props: {
      routerBase: '/user',         // 传递给子应用的路由基路径
      data: {                      // 传递给子应用的数据
        token: 'main-app-token'
      }
    }
  },
  {
    name: 'order-system',
    entry: '//localhost:3002',
    container: '#subapp-viewport',
    activeRule: '/order',
    props: {
      routerBase: '/order',
      apiBase: '/api/order'
    }
  },
  {
    name: 'product-management',
    entry: '//localhost:3003',
    container: '#subapp-viewport',
    activeRule: '/product',
    props: {
      routerBase: '/product'
    }
  }
]

// 注册微应用
registerMicroApps(microApps, {
  beforeLoad: [
    app => {
      console.log('%c [qiankun] beforeLoad', 'color: #42b983', app)
      return Promise.resolve()
    }
  ],
  beforeMount: [
    app => {
      console.log('%c [qiankun] beforeMount', 'color: #42b983', app)
      return Promise.resolve()
    }
  ],
  afterMount: [
    app => {
      console.log('%c [qiankun] afterMount', 'color: #42b983', app)
      return Promise.resolve()
    }
  ],
  beforeUnmount: [
    app => {
      console.log('%c [qiankun] beforeUnmount', 'color: #42b983', app)
      return Promise.resolve()
    }
  ],
  afterUnmount: [
    app => {
      console.log('%c [qiankun] afterUnmount', 'color: #42b983', app)
      return Promise.resolve()
    }
  ]
})

// 初始化全局状态
const initialState = {
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  theme: 'light'
}

const actions = initGlobalState(initialState)

// 监听状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('[主应用] 状态变化', state, prev)

  // 同步到本地存储
  if (state.token !== prev.token) {
    localStorage.setItem('token', state.token)
  }
  if (state.user !== prev.user) {
    localStorage.setItem('user', JSON.stringify(state.user))
  }
}, true)

// 导出 actions 供其他模块使用
export const globalActions = actions

// 启动 qiankun
start({
  sandbox: {
    strictStyleIsolation: false,   // 严格样式隔离
    experimentalStyleIsolation: true  // 实验性样式隔离
  },
  prefetch: true,                   // 预加载
  singular: false,                  // 是否单实例
  fetch: window.fetch               // 自定义 fetch
})

console.log('[主应用] qiankun 已启动')
```

#### 主应用路由配置

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/MicroAppContainer.vue')
  },
  {
    path: '/user/:pathMatch(.*)*',
    name: 'UserWildcard',
    component: () => import('@/views/MicroAppContainer.vue')
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/MicroAppContainer.vue')
  },
  {
    path: '/order/:pathMatch(.*)*',
    name: 'OrderWildcard',
    component: () => import('@/views/MicroAppContainer.vue')
  },
  {
    path: '/product',
    name: 'Product',
    component: () => import('@/views/MicroAppContainer.vue')
  },
  {
    path: '/product/:pathMatch(.*)*',
    name: 'ProductWildcard',
    component: () => import('@/views/MicroAppContainer.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

#### 主应用布局组件

```vue
<!-- App.vue -->
<template>
  <div class="main-app">
    <!-- 头部导航 -->
    <header class="app-header">
      <div class="logo">
        <h1>微前端主应用</h1>
      </div>
      <nav class="app-nav">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/user" class="nav-item">用户中心</router-link>
        <router-link to="/order" class="nav-item">订单管理</router-link>
        <router-link to="/product" class="nav-item">商品管理</router-link>
      </nav>
      <div class="user-info">
        <span v-if="user">{{ user.name }}</span>
        <button v-if="user" @click="logout">退出</button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="app-footer">
      <p>&copy; 2026 微前端架构示例</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { globalActions } from './main'

const user = ref<any>(null)

onMounted(() => {
  // 获取全局状态
  const state = globalActions.getGlobalState()
  user.value = state.user
})

function logout() {
  // 更新全局状态
  globalActions.setGlobalState({
    token: '',
    user: null
  })
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
</script>

<style scoped>
.main-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
}

.app-nav {
  display: flex;
  gap: 1rem;
}

.nav-item {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.1);
}

.app-main {
  flex: 1;
  padding: 2rem;
}

.app-footer {
  background: #f5f5f5;
  text-align: center;
  padding: 1rem;
  color: #666;
}
</style>
```

#### 微应用容器组件

```vue
<!-- views/MicroAppContainer.vue -->
<template>
  <div class="micro-app-container">
    <!-- 子应用挂载容器 -->
    <div id="subapp-viewport" class="subapp-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  console.log('[容器] 微应用容器已挂载')
})

onBeforeUnmount(() => {
  console.log('[容器] 微应用容器即将卸载')
})
</script>

<style scoped>
.micro-app-container {
  width: 100%;
  height: calc(100vh - 140px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.subapp-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
```

#### 主应用首页

```vue
<!-- views/Home.vue -->
<template>
  <div class="home">
    <h1>欢迎使用微前端主应用</h1>
    <p>这是一个基于 qiankun 的微前端架构示例</p>

    <div class="feature-list">
      <div class="feature-item">
        <h3>用户中心</h3>
        <p>Vue3 开发的用户管理子系统</p>
        <router-link to="/user" class="btn">访问</router-link>
      </div>
      <div class="feature-item">
        <h3>订单管理</h3>
        <p>React 开发的订单管理子系统</p>
        <router-link to="/order" class="btn">访问</router-link>
      </div>
      <div class="feature-item">
        <h3>商品管理</h3>
        <p>Vue2 开发的商品管理子系统</p>
        <router-link to="/product" class="btn">访问</router-link>
      </div>
    </div>

    <div class="info-card">
      <h2>微前端架构优势</h2>
      <ul>
        <li>团队自治：不同团队独立开发、测试、部署</li>
        <li>技术栈无关：支持 Vue、React、Angular 等多种框架</li>
        <li>独立部署：子应用独立发布，互不影响</li>
        <li>增量升级：逐步重构，降低风险</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// 首页逻辑
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.home h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.home p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-item {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.feature-item h3 {
  color: #42b983;
  margin-bottom: 0.5rem;
}

.feature-item p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 2rem;
  background: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

.btn:hover {
  background: #3aa876;
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-card h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.info-card ul {
  list-style: none;
  padding: 0;
}

.info-card li {
  padding: 0.5rem 0;
  color: #666;
}

.info-card li:before {
  content: "✓ ";
  color: #42b983;
  font-weight: bold;
  margin-right: 0.5rem;
}
</style>
```

---

### 子应用配置

#### 创建 Vue3 子应用

```bash
# 创建 Vue3 子应用
npm create vue@latest user-center

cd user-center
npm install

# 安装 qiankun 依赖（用于导出生命周期）
npm install qiankun
```

#### 子应用入口配置

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router'

let app: any
let router: any
let history: any

// 渲染函数
function render(props: any = {}) {
  const { container } = props

  // 创建路由
  history = createWebHistory(
    props.routerBase || import.meta.env.BASE_URL
  )
  router = createRouter({
    history,
    routes
  })

  // 创建应用
  app = createApp(App)
  app.use(router)

  // 挂载应用
  const containerElement = container
    ? container.querySelector('#subapp-container')
    : document.querySelector('#subapp-container')

  app.mount(containerElement!)

  console.log('[子应用] 应用已挂载', props)
}

// 独立运行时直接挂载
if (!(window as any).__POWERED_BY_QIANKUN__) {
  render()
}

// 导出生命周期钩子
export async function bootstrap() {
  console.log('[子应用] bootstrap')
}

export async function mount(props: any) {
  console.log('[子应用] mount', props)
  render(props)

  // 接收主应用传递的状态
  if (props.onGlobalStateChange) {
    props.onGlobalStateChange((state: any) => {
      console.log('[子应用] 接收全局状态:', state)
    }, true)
  }
}

export async function unmount() {
  console.log('[子应用] unmount')
  app?.unmount()
  history?.destroy()
}

// 导出路由供主应用使用
export async function update(props: any) {
  console.log('[子应用] update', props)
}
```

#### 子应用路由配置

```typescript
// src/router/index.ts
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: '/list'
  },
  {
    path: '/list',
    name: 'UserList',
    component: () => import('@/views/UserList.vue')
  },
  {
    path: '/detail/:id',
    name: 'UserDetail',
    component: () => import('@/views/UserDetail.vue')
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue')
  }
]

export default routes
```

#### 子应用根组件

```vue
<!-- src/App.vue -->
<template>
  <div class="user-app">
    <!-- 子应用导航 -->
    <nav class="sub-nav">
      <router-link to="/user/list">用户列表</router-link>
      <router-link to="/user/profile">个人中心</router-link>
    </nav>

    <!-- 子应用内容 -->
    <div class="sub-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('[用户中心] 应用已挂载')
})
</script>

<style scoped>
.user-app {
  padding: 1rem;
}

.sub-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.sub-nav a {
  color: #42b983;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.sub-nav a.router-link-active {
  background: #42b983;
  color: white;
}

.sub-content {
  padding: 1rem 0;
}
</style>
```

#### 子应用 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
    cors: true,
    origin: 'http://localhost:3001'
  },
  build: {
    lib: {
      entry: './src/main.ts',
      name: 'UserCenter',
      formats: ['umd'],
      fileName: 'user-center'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

#### 子应用 HTML 模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>用户中心 - 子应用</title>
  </head>
  <body>
    <div id="subapp-container"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

#### 子应用页面示例

```vue
<!-- src/views/UserList.vue -->
<template>
  <div class="user-list">
    <h2>用户列表</h2>
    <div class="actions">
      <button @click="fetchUsers">刷新数据</button>
      <button @click="goToDetail">查看详情</button>
    </div>

    <table class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>邮箱</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <button @click="viewDetail(user.id)">详情</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const users = ref<any[]>([])

onMounted(() => {
  fetchUsers()
})

function fetchUsers() {
  // 模拟数据
  users.value = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
    { id: 3, name: '王五', email: 'wangwu@example.com' }
  ]
}

function viewDetail(id: number) {
  router.push(`/user/detail/${id}`)
}

function goToDetail() {
  router.push('/user/profile')
}
</script>

<style scoped>
.user-list {
  padding: 1rem;
}

.actions {
  margin-bottom: 1rem;
}

.actions button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.user-table th {
  background: #f8f9fa;
  font-weight: 600;
}
</style>
```

#### 配置子应用开发服务器

```json
// package.json
{
  "name": "user-center",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "qiankun": "^2.10.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

---

### 应用间通信

#### 全局状态管理

```typescript
// 主应用 - main.ts
import { initGlobalState } from 'qiankun'

// 初始化全局状态
const actions = initGlobalState({
  token: '',
  user: null,
  theme: 'light',
  locale: 'zh-CN'
})

// 监听状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('[主应用] 状态变化', state, prev)
})

// 设置状态
actions.setGlobalState({
  token: 'new-token',
  user: { name: '张三' }
})

// 获取当前状态
const currentState = actions.getGlobalState()

export const globalActions = actions
```

```typescript
// 子应用 - main.ts
export async function mount(props: any) {
  render(props)

  // 监听全局状态变化
  props.onGlobalStateChange((state: any, prev: any) => {
    console.log('[子应用] 全局状态变化', state, prev)

    // 处理 token 变化
    if (state.token !== prev.token) {
      console.log('Token 更新:', state.token)
    }

    // 处理主题变化
    if (state.theme !== prev.theme) {
      document.documentElement.setAttribute('data-theme', state.theme)
    }
  }, true)

  // 修改全局状态
  props.setGlobalState({
    user: { name: '子应用用户' }
  })
}
```

#### 事件总线通信

```typescript
// utils/eventBus.ts
class EventBus {
  private events: Record<string, Function[]> = {}

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  off(event: string, callback: Function) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return
    this.events[event].forEach(callback => callback(...args))
  }
}

export const eventBus = new EventBus()
```

```typescript
// 主应用使用事件总线
import { eventBus } from './utils/eventBus'

// 发送事件
eventBus.emit('user-login', { user: '张三' })

// 监听事件
eventBus.on('data-update', (data) => {
  console.log('收到数据更新:', data)
})
```

```typescript
// 子应用使用事件总线
import { eventBus } from './utils/eventBus'

// 发送事件到主应用
eventBus.emit('subapp-ready', { name: 'user-center' })

// 监听主应用事件
eventBus.on('refresh-data', () => {
  // 刷新数据
  fetchUsers()
})
```

#### localStorage 通信

```typescript
// 主应用
localStorage.setItem('app-token', 'xxx')
localStorage.setItem('app-user', JSON.stringify({ name: '张三' }))

// 监听变化
window.addEventListener('storage', (e) => {
  if (e.key === 'subapp-data') {
    console.log('子应用数据变化:', e.newValue)
  }
})
```

```typescript
// 子应用
const token = localStorage.getItem('app-token')
const user = JSON.parse(localStorage.getItem('app-user') || '{}')

// 设置数据
localStorage.setItem('subapp-data', JSON.stringify({ status: 'ready' }))
```

#### URL 参数通信

```typescript
// 主应用跳转传递参数
router.push({
  path: '/user/detail',
  query: {
    id: '123',
    from: 'main'
  }
})

// 子应用接收参数
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = route.query.id
const from = route.query.from
```

---

### 样式隔离

#### 严格样式隔离

```typescript
// 主应用 - main.ts
start({
  sandbox: {
    strictStyleIsolation: true  // 严格样式隔离
  }
})
```

**注意：** 严格模式会给子应用包裹 Shadow DOM，可能导致某些样式失效。

#### 实验性样式隔离（推荐）

```typescript
// 主应用 - main.ts
start({
  sandbox: {
    experimentalStyleIsolation: true  // 实验性样式隔离
  }
})
```

**原理：** 给子应用添加特定前缀，实现样式作用域。

#### CSS Modules 方案

```vue
<!-- 子应用使用 CSS Modules -->
<template>
  <div :class="$style.container">
    <h1 :class="$style.title">用户中心</h1>
  </div>
</template>

<style module>
.container {
  padding: 1rem;
}

.title {
  color: #42b983;
}
</style>
```

#### 命名空间方案

```vue
<!-- 子应用添加统一前缀 -->
<template>
  <div class="user-center-app">
    <div class="user-center-app__header">
      <h1 class="user-center-app__title">用户中心</h1>
    </div>
  </div>
</template>

<style scoped>
/* 所有样式添加前缀 */
.user-center-app {
  /* ... */
}

.user-center-app__header {
  /* ... */
}

.user-center-app__title {
  /* ... */
}
</style>
```

#### 生成全局唯一类名

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    modules: {
      generateScopedName: 'user-center__[name]__[local]__[hash:base64:5]'
    }
  }
})
```

---

### 预加载策略

#### 自动预加载

```typescript
// 主应用 - main.ts
start({
  prefetch: true  // 自动预加载所有子应用资源
})
```

#### 智能预加载

```typescript
// 主应用 - main.ts
start({
  prefetch: ['app1', 'app2']  // 只预加载指定子应用
})
```

#### 自定义预加载时机

```typescript
// 主应用 - App.vue
<script setup lang="ts">
import { prefetchApps } from 'qiankun'
import { onMounted } from 'vue'

onMounted(() => {
  // 鼠标 hover 时预加载
  const userLink = document.querySelector('[href="/user"]')
  userLink?.addEventListener('mouseenter', () => {
    prefetchApps([
      {
        name: 'user-center',
        entry: '//localhost:3001'
      }
    ])
  })
})
</script>
```

#### 禁用预加载

```typescript
// 主应用 - main.ts
start({
  prefetch: false  // 禁用预加载
})
```

---

### 生产环境部署

#### 主应用构建配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/main-app/',  // 部署路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'qiankun': ['qiankun'],
          'vue-vendor': ['vue', 'vue-router']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true
      }
    }
  }
})
```

#### 子应用构建配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/user-center/',  // 部署路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    lib: {
      entry: './src/main.ts',
      name: 'UserCenter',
      formats: ['umd'],
      fileName: 'user-center'
    }
  },
  server: {
    port: 3001,
    origin: 'http://localhost:3001',
    cors: true
  }
})
```

#### Nginx 配置

```nginx
# 主应用配置
server {
    listen 80;
    server_name example.com;

    # 主应用
    location /main-app/ {
        root /var/www/html;
        try_files $uri $uri/ /main-app/index.html;
    }

    # 子应用 - 用户中心
    location /user-center/ {
        root /var/www/html;
        try_files $uri $uri/ /user-center/index.html;

        # CORS 配置
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
    }

    # 子应用 - 订单系统
    location /order-system/ {
        root /var/www/html;
        try_files $uri $uri/ /order-system/index.html;

        add_header Access-Control-Allow-Origin *;
    }

    # API 代理
    location /api/ {
        proxy_pass http://api-server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Docker 部署

```dockerfile
# 主应用 Dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html/main-app
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  main-app:
    build: ./main-app
    ports:
      - "3000:80"
    networks:
      - micro-frontend

  user-center:
    build: ./user-center
    ports:
      - "3001:80"
    networks:
      - micro-frontend

  order-system:
    build: ./order-system
    ports:
      - "3002:80"
    networks:
      - micro-frontend

networks:
  micro-frontend:
    driver: bridge
```

#### CI/CD 配置

```yaml
# .github/workflows/deploy.yml
name: Deploy Micro Frontend

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        app: [main-app, user-center, order-system]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd ${{ matrix.app }}
          npm install

      - name: Build
        run: |
          cd ${{ matrix.app }}
          npm run build

      - name: Deploy
        run: |
          # 部署逻辑
          echo "Deploying ${{ matrix.app }}"
```

---

### 最佳实践与注意事项

#### 性能优化

```typescript
// 1. 路由懒加载
const UserList = () => import('@/views/UserList.vue')

// 2. 组件懒加载
import { defineAsyncComponent } from 'vue'
const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)

// 3. 资源预加载
<link rel="prefetch" href="/user-center/main.js">
<link rel="preload" href="/user-center/main.js" as="script">
```

#### 错误处理

```typescript
// 主应用 - 错误边界
registerMicroApps([...], {
  errorApp(err) {
    console.error('子应用加载失败:', err)
    // 显示错误页面
    renderErrorPage(err)
  }
})
```

#### 开发调试

```typescript
// 开发环境配置
start({
  devTools: true,  // 开启调试工具
  sandbox: {
    strictStyleIsolation: false
  }
})

// 子应用独立开发
if (!window.__POWERED_BY_QIANKUN__) {
  render()  // 独立运行
}
```

#### 安全建议

```typescript
// 1. 内容安全策略
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">

// 2. 子应用域名白名单
const allowedDomains = [
  'localhost:3001',
  'user.example.com'
]

function validateEntry(entry: string) {
  const url = new URL(entry)
  return allowedDomains.includes(url.host)
}

// 3. 数据验证
function validateGlobalState(state: any) {
  // 验证全局状态
}
```

---

### 常见问题解决

#### 问题1：子应用样式丢失

```typescript
// 解决方案：使用实验性样式隔离
start({
  sandbox: {
    experimentalStyleIsolation: true
  }
})
```

#### 问题2：路由冲突

```typescript
// 解决方案：使用不同的路由基路径
// 主应用
const router = createRouter({
  history: createWebHistory('/')
})

// 子应用
const router = createRouter({
  history: createWebHistory('/user/')
})
```

#### 问题3：公共依赖重复加载

```typescript
// 解决方案：使用 Webpack Externals
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter'
        }
      }
    }
  }
})
```

#### 问题4：子应用更新后主应用缓存

```typescript
// 解决方案：添加版本号
const microApps = [
  {
    name: 'user-center',
    entry: '//localhost:3001?v=' + Date.now(),
    container: '#subapp-viewport',
    activeRule: '/user'
  }
]
```

---

### 其他微前端方案

虽然 qiankun 是目前最流行的微前端框架，但还有其他优秀的方案可供选择：

#### micro-app（京东出品）

**micro-app** 是京东推出的一款微前端框架，相比 qiankun 更加简单易用。

##### 核心优势

| 特性 | micro-app | qiankun |
|------|-----------|---------|
| 上手难度 | ⭐ 简单 | ⭐⭐⭐ 中等 |
| 子应用改造 | 几乎无需改造 | 需要导出生命周期 |
| 包体积 | 30KB | 70KB+ |
| 隔离方式 | ShadowDOM | Proxy沙箱 |
| 推出方 | 京东 | 阿里 |

##### 快速上手

```bash
# 安装
npm install @micro-zoe/micro-app --save
```

```typescript
// main.ts - 主应用
import microApp from '@micro-zoe/micro-app'

microApp.start({
  shadowDOM: true,
  'global-assets': {
    css: [],
    js: []
  }
})
```

```vue
<!-- 主应用中使用子应用 -->
<template>
  <micro-app
    name="child-app"
    url="http://localhost:8081"
    iframe
    keep-alive
    :data="{ token: 'xxx', userInfo: {...} }"
    @mounted="handleMounted"
    @datachange="handleDataChange"
  />
</template>

<script setup lang="ts">
const userData = ref({ name: '张三', role: 'admin' })

const handleMounted = () => {
  console.log('子应用已挂载')
}

const handleDataChange = (e: CustomEvent) => {
  console.log('收到子应用数据:', e.detail)
}
</script>
```

```javascript
// 子应用 main.ts - 几乎无需改造！
import { createApp } from 'vue'
import App from './App.vue'

let app = createApp(App)

if (window.__MICRO_APP_ENVIRONMENT__) {
  // 微前端环境
  app.mount('#app')
} else {
  // 独立运行
  app.mount('#app')
}
```

```vue
<!-- 子应用接收主应用数据 -->
<template>
  <div>
    <h2>子应用内容</h2>
    <p>来自主应用的数据: {{ microAppData?.name }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import microApp from '@micro-zoe/micro-app'

const microAppData = computed(() => microApp.getData())
</script>
```

##### 数据通信

```typescript
// 主应用 → 子应用
<micro-app :data="{ token: 'xxx' }" />

// 子应用接收
const data = microApp.getData()

// 子应用 → 主应用
microApp.dispatch({ action: 'update', value: 123 })

// 双向通信
microApp.addDataListener((data) => {
  console.log('收到主应用数据:', data)
})
```

##### 数据通信

```typescript
// 主应用 → 子应用（单向）
<micro-app :data="{ token: 'xxx', userInfo: {...} }" />

// 子应用接收
const data = microApp.getData()

// 子应用 → 主应用（单向）
microApp.dispatch({ action: 'update', value: 123 })

// 双向通信
microApp.addDataListener((data) => {
  console.log('收到主应用数据:', data)
})
```

##### 路由控制

```vue
<!-- 保持路由状态 -->
<micro-app
  name="child"
  url="http://localhost:8081"
  keep-alive
  keep-router-state
/>
```

```typescript
// 子应用跳转到主应用路由
microApp.push({ name: 'home' })
microApp.replace({ name: 'about' })
```

##### 生命周期

| 事件 | 触发时机 |
|------|----------|
| created | 子应用元素被插入到页面后 |
| beforemount | 子应用开始渲染前 |
| mounted | 子应用渲染完成 |
| unmount | 子应用卸载 |
| error | 子应用加载出错 |
| datachange | 主应用向子应用传递数据时 |

```vue
<micro-app
  name="child"
  url="http://localhost:8081"
  @created="onCreated"
  @beforemount="onBeforeMount"
  @mounted="onMounted"
  @unmount="onUnmount"
  @error="onError"
  @datachange="onDataChange"
/>
```

##### 预加载

```typescript
// 预加载子应用资源
microApp.preFetch([
  { name: 'app1', url: 'http://localhost:8081' },
  { name: 'app2', url: 'http://localhost:8082' }
])

// 取消预加载
microApp.clearPreFetch([{ name: 'app1' }])
```

##### 样式隔离

micro-app 默认使用 **ShadowDOM** 进行样式隔离：

```vue
<!-- 开启 ShadowDOM -->
<micro-app name="child" url="http://localhost:8081" shadowDOM />
```

#### 主应用完整示例

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import microApp from '@micro-zoe/micro-app'

const app = createApp(App)

// 启动 micro-app
microApp.start({
  shadowDOM: true,
  'global-assets': {
    css: [],
    js: []
  }
})

app.mount('#app')
```

```vue
<!-- src/App.vue -->
<template>
  <div class="main-app">
    <nav class="sidebar">
      <router-link to="/home">首页</router-link>
      <router-link to="/app1">子应用1</router-link>
      <router-link to="/app2">子应用2</router-link>
    </nav>

    <main class="content">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'

const globalState = ref({
  token: localStorage.getItem('token'),
  userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
})

provide('globalState', globalState)
</script>

<style scoped>
.main-app {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 200px;
  background: #2c3e50;
  padding: 20px;
}
.sidebar a {
  display: block;
  color: white;
  padding: 10px;
  text-decoration: none;
}
.content {
  flex: 1;
  overflow: hidden;
}
</style>
```

```vue
<!-- src/views/App1.vue -->
<template>
  <div class="app1-container">
    <micro-app
      name="app1"
      url="http://localhost:8081"
      iframe
      keep-alive
      :data="{ ...globalState, pageTitle: '子应用1' }"
      @mounted="handleMounted"
      @datachange="handleDataChange"
    />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const globalState = inject('globalState')

const handleMounted = () => {
  console.log('子应用1已挂载')
}

const handleDataChange = (e: CustomEvent) => {
  console.log('收到子应用数据:', e.detail)
}
</script>
```

#### 子应用完整示例

```javascript
// 子应用 main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

let app = createApp(App)
app.use(router)

if (window.__MICRO_APP_ENVIRONMENT__) {
  app.config.globalProperties.$microApp = window.microApp
  app.mount('#app')
} else {
  app.mount('#app')
}
```

```typescript
// src/micro/index.ts - 子应用通信封装
import microApp from '@micro-zoe/micro-app'

// 发送消息给主应用
export function sendMessage(action: string, data: any) {
  microApp.dispatch({ action, data })
}

// 监听主应用消息
export function onMessage(callback: (data: any) => void) {
  microApp.addDataListener(callback)
}

// 获取主应用数据
export function getMainAppData() {
  return microApp.getData() || {}
}
```

```vue
<!-- 子应用组件 -->
<template>
  <div class="child-app">
    <h2>子应用首页</h2>
    <p>用户: {{ mainData.userInfo?.name }}</p>
    <button @click="sendToMain">发送消息到主应用</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getMainAppData, sendMessage, onMessage } from '@/micro'

const mainData = ref(getMainAppData())

const handleDataChange = (data: any) => {
  console.log('主应用数据变化:', data)
  mainData.value = data
}

onMounted(() => {
  onMessage(handleDataChange)
})

onUnmounted(() => {
  microApp.removeDataListener(handleDataChange)
})

const sendToMain = () => {
  sendMessage('update', { message: '来自子应用的消息' })
}
</script>
```

#### 常见问题

##### 问题1：跨域

```javascript
// 子应用 vite.config.ts
export default defineConfig({
  server: {
    port: 8081,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  }
})
```

##### 问题2：资源加载404

```typescript
// 确保子应用正确配置 base
export default defineConfig({
  base: 'http://localhost:8081/'
})
```

##### 问题3：内存泄漏

```typescript
// 组件卸载时清理
onUnmounted(() => {
  microApp.clearDataListener()
})
```

#### 方案对比总结

| 特性 | micro-app | qiankun |
|------|-----------|---------|
| 上手难度 | ⭐ 简单 | ⭐⭐⭐ 中等 |
| 接入成本 | 低 | 中等 |
| 子应用改造 | 几乎无需改造 | 需要导出生命周期 |
| 包体积 | 30KB | 70KB+ |
| 隔离方式 | ShadowDOM | Proxy沙箱 |
| 推出方 | 京东 | 阿里 |
| 成熟度 | 较新 | 成熟 |

#### 选择建议

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| 新手入门 | **micro-app** | 上手简单，几乎无需改造 |
| Vue3 项目 | **qiankun** | 成熟稳定，生态完善 |
| 快速开发 | **micro-app** | 开箱即用 |
| 生产环境 | **qiankun** | 经过大量验证 |
| 技术栈混合 | **两者皆可** | 都支持多框架混合 |

#### 官方资源

**micro-app**
- GitHub: https://github.com/micro-zoe/micro-app
- 官方文档: https://micro-zoe.github.io/micro-app/
- 示例项目: https://github.com/micro-zoe/micro-app-demo

**qiankun**
- GitHub: https://github.com/umijs/qiankun
- 官方文档: https://qiankun.umijs.org/zh

---
