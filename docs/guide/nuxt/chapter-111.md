# Nuxt 3+简介与环境搭建

## Nuxt 3+简介与环境搭建

> **为什么要学这一章？**
>
> Nuxt 3 是基于 Vue 3 的全栈框架，提供了服务端渲染（SSR）、静态站点生成（SSG）、API路由等强大功能。相比 Vue 3 + Vite 的组合，Nuxt 3 提供了开箱即用的工程化体验，适合构建生产级应用。
>
> **学习目标**：
>
> - 理解 Nuxt 的核心特性和应用场景
> - 掌握 Nuxt 3 项目的创建和配置
> - 熟悉 Nuxt 的项目结构和约定
> - 学会使用 Nuxt CLI 常用命令
> - 能够创建第一个 Nuxt 应用

---

### Nuxt 是什么

#### Nuxt 的定义

**Nuxt** 是一个基于 Vue 3 的**全栈框架**，提供了构建现代 Web 应用所需的所有功能：

```
┌─────────────────────────────────────────────────────────────┐
│                    Nuxt 3 架构                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              渲染模式                                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │   SSR    │  │   SSG    │  │   SPA    │          │   │
│  │  │ 服务端渲染│  │ 静态生成 │  │ 单页应用 │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              核心特性                                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │ 文件路由 │  │ API路由  │  │ 自动导入 │          │   │
│  │  │ 数据获取 │  │ 服务端   │  │ 中间件   │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              基于技术栈                               │   │
│  │  Vue 3 + Vite + Nitro + TypeScript                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Nuxt vs Vue 3 + Vite

| 特性 | Vue 3 + Vite | Nuxt 3 |
|------|-------------|--------|
| **渲染方式** | 仅 SPA | SSR/SSG/SPA 多种模式 |
| **路由管理** | 需要安装 Vue Router | 文件系统自动路由 |
| **状态管理** | 需要安装 Pinia | 内置支持，自动导入 |
| **API 接口** | 需要后端服务 | 内置 Server API |
| **SEO 优化** | 手动配置 | 开箱即用 |
| **项目结构** | 自由组织 | 约定式结构 |
| **学习曲线** | 平缓 | 稍陡 |

```javascript
// Vue 3 + Vite 项目结构
vue-project/
├── src/
│   ├── router/
│   │   └── index.ts        // 手动配置路由
│   ├── stores/             // 手动创建 Pinia stores
│   ├── pages/              // 手动配置页面
│   └── main.ts

// Nuxt 3 项目结构（约定式）
nuxt-project/
├── pages/                  // 自动生成路由
├── composables/            // 自动导入
├── server/                 // 内置 API 服务器
├── middleware/             // 路由中间件
└── nuxt.config.ts          // 统一配置
```

#### Nuxt 核心特性

##### 1. 渲染模式

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  // 服务端渲染（默认）
  ssr: true,

  // 静态站点生成
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt']
    }
  },

  // 混合渲染（页面级配置）
  routeRules: {
    // 首页静态生成
    '/': { prerender: true },
    // 博客文章静态生成
    '/blog/**': { prerender: true },
    // 管理后台 SPA 模式
    '/admin/**': { ssr: false },
    // API 缓存
    '/api/**': { cache: { maxAge: 60 * 60 * 24 } }
  }
})
```

##### 2. 自动导入功能

```vue
<!-- composables/useCounter.ts -->
export const useCounter = () => {
  const count = ref(0)
  const increment = () => count.value++

  return { count, increment }
}

<!-- pages/index.vue -->
<!-- ✅ 无需手动导入，直接使用 -->
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
  </div>
</template>

<script setup lang="ts">
// 自动导入 composable
const { count, increment } = useCounter()

// 自动导入 Vue API
const message = ref('Hello Nuxt 3')
const doubled = computed(() => count.value * 2)
</script>
```

##### 3. 文件路由系统

```bash
pages/
├── index.vue              # → /
├── about.vue              # → /about
├── blog/
│   ├── index.vue          # → /blog
│   └── [slug].vue         # → /blog/:slug（动态路由）
└── admin/
    └── [...slug].vue      # → /admin/*（ Catch-all 路由）
```

##### 4. 服务端 API

```typescript
// server/api/hello.ts
export default defineEventHandler((event) => {
  // 获取查询参数
  const query = getQuery(event)

  // 获取请求体
  const body = await readBody(event)

  // 返回响应
  return {
    message: 'Hello from Nuxt API',
    query,
    body
  }
})

// 在页面中调用
const { data } = await useFetch('/api/hello')
```

##### 5. 数据获取

```vue
<script setup lang="ts">
// useFetch：自动获取、响应式、处理 loading 状态
const { data, pending, error } = await useFetch('/api/users')

// useLazyFetch：懒加载，不阻塞导航
const { data: lazyData } = await useLazyFetch('/api/posts')

// useAsyncData：更灵活的数据获取
const { data: posts } = await useAsyncData('posts', () =>
  $fetch('/api/posts')
)
</script>

<template>
  <div>
    <!-- 自动处理 pending 状态 -->
    <div v-if="pending">Loading...</div>

    <!-- 显示数据 -->
    <div v-else-if="data">
      <div v-for="user in data" :key="user.id">
        {{ user.name }}
      </div>
    </div>

    <!-- 错误处理 -->
    <div v-else-if="error">Error: {{ error.message }}</div>
  </div>
</template>
```

---

### 环境搭建

#### 前置要求

```bash
# Node.js 版本要求
# Nuxt 3 需要 Node.js >= 18.0.0

# 检查 Node.js 版本
node -v
# v18.19.0 或更高

# 推荐使用 Node.js LTS 版本
# 下载地址：https://nodejs.org/
```

#### 创建 Nuxt 3 项目

##### 方式1：使用 npx（推荐）

```bash
# 使用 npx 创建项目
npx nuxi@latest init nuxt-app

# 或者指定项目名称和模板
npx nuxi@latest init my-nuxt-app --packageManager npm

# 进入项目目录
cd nuxt-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

创建过程中的交互提示：

```bash
✨ Nuxt 项目信息

✔ 项目名称 · nuxt-app
✔ 包管理器 · npm
✔ 运行命令 · npm run dev

🎉 项目创建成功！

接下来：
  cd nuxt-app
  npm install
  npm run dev

访问 http://localhost:3000 查看应用
```

##### 方式2：使用 npm init

```bash
# 使用 npm init
npm init nuxt-app@latest

# 使用 yarn
yarn create nuxt-app

# 使用 pnpm
pnpm create nuxt-app
```

##### 方式3：手动创建

```bash
# 1. 创建项目目录
mkdir nuxt-app
cd nuxt-app

# 2. 初始化 package.json
npm init -y

# 3. 安装 Nuxt 3
npm install nuxt

# 4. 创建 nuxt.config.ts
cat > nuxt.config.ts << 'EOF'
export default defineNuxtConfig({
  devtools: { enabled: true }
})
EOF

# 5. 创建 app.vue
mkdir app
cat > app.vue << 'EOF'
<template>
  <div>
    <NuxtWelcome />
  </div>
</template>
EOF

# 6. 更新 package.json 添加脚本
npm pkg set scripts.dev="nuxt dev"
npm pkg set scripts.build="nuxt build"
npm pkg set scripts.generate="nuxt generate"

# 7. 启动开发服务器
npm run dev
```

#### 项目结构说明

```bash
nuxt-app/
├── .nuxt/                  # Nuxt 生成的文件（自动忽略）
├── .output/                # 构建输出目录
├── node_modules/           # 依赖包
├── app.vue                 # 应用根组件
├── nuxt.config.ts          # Nuxt 配置文件
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── pages/                  # 页面路由
├── components/             # 组件（自动导入）
├── composables/            # 组合式函数（自动导入）
├── server/                 # 服务端代码
│   ├── api/                # API 路由
│   ├── middleware/         # 服务端中间件
│   └── plugins/            # 服务端插件
├── middleware/             # 路由中间件
├── layouts/                # 布局组件
├── assets/                 # 资源文件（会被构建处理）
├── public/                 # 静态文件（直接访问）
├── types/                  # TypeScript 类型定义
└── utils/                  # 工具函数（自动导入）
```

---

### Nuxt CLI 常用命令

#### 开发命令

```bash
# 启动开发服务器
npm run dev

# 指定端口
npm run dev -- --port 3000

# 指定主机
npm run dev -- --host 0.0.0.0

# 启用 HTTPS
npm run dev -- --https

# 清除缓存重新启动
npm run dev -- --clear
```

#### 构建命令

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 生成静态站点
npm run generate

# 生成静态站点并预览
npm run generate && npm run preview
```

#### 其他实用命令

```bash
# 类型检查
npx nuxi typecheck

# 代码分析
npx nuxi analyze

# 清理缓存
npx nuxi clean

# 模块信息
npx nuxi module <add-on>

# 准备部署
npx nuxi prepare
```

#### 常用命令对比

| 命令 | 说明 | 使用场景 |
|------|------|---------|
| `nuxt dev` | 启动开发服务器 | 日常开发 |
| `nuxt build` | 构建生产版本 | 部署前 |
| `nuxt generate` | 生成静态站点 | 静态部署 |
| `nuxt preview` | 预览构建结果 | 本地测试 |
| `nuxt cleanup` | 清理缓存 | 解决缓存问题 |

---

### Nuxt 配置文件

#### nuxt.config.ts 基础配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 应用配置
  app: {
    // 页面头部配置
    head: {
      title: '我的 Nuxt 应用',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Nuxt 3 应用示例' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    // 页面过渡效果
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },

  // 开发工具
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },

  // 开发服务器配置
  devServer: {
    port: 3000,
    host: '0.0.0.0'
  },

  // 模块配置
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt'
  ],

  // TypeScript 配置
  typescript: {
    strict: true,
    typeCheck: true
  },

  // 构建配置
  build: {
    transpile: []
  },

  // Vite 配置
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/variables.scss" as *;'
        }
      }
    }
  },

  // 自动导入配置
  imports: {
    dirs: [
      'composables',
      'utils',
      'stores'
    ]
  },

  // 别名配置
  alias: {
    '@': '.',
    '~': '.',
    '~~': '.',
    '@@': '.',
    '~~~': '.'
  }
})
```

#### 环境变量配置

```bash
# .env
NUXT_PUBLIC_API_BASE_URL=https://api.example.com
NUXT_PUBLIC_APP_TITLE=我的应用
NUXT_API_SECRET=secret-key
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 运行时配置
  runtimeConfig: {
    // 服务端私有变量
    apiSecret: process.env.NUXT_API_SECRET,

    // 公共变量（暴露给客户端）
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || '/api',
      appTitle: process.env.NUXT_PUBLIC_APP_TITLE || 'Nuxt App'
    }
  }
})
```

```vue
<!-- 在组件中使用运行时配置 -->
<script setup lang="ts">
// 访问公共配置
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// 在服务端才能访问私有配置
// const apiSecret = config.apiSecret // ❌ 客户端访问会报错
</script>
```

---

### 第一个 Nuxt 应用

#### 实战案例：待办事项应用

让我们创建一个完整的待办事项应用，涵盖 Nuxt 3 的核心概念。

##### 1. 项目初始化

```bash
# 创建项目
npx nuxi@latest init todo-app
cd todo-app
npm install

# 安装额外依赖
npm install @pinia/nuxt
```

##### 2. 配置文件

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  app: {
    head: {
      title: '待办事项应用',
      meta: [
        { name: 'description', content: '基于 Nuxt 3 的待办事项应用' }
      ]
    }
  },

  css: ['~/assets/css/main.css']
})
```

##### 3. 样式文件

```css
/* assets/css/main.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 2rem;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.header p {
  color: #666;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.input-group input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.todo-list {
  list-style: none;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
}

.todo-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
}

.todo-text {
  flex: 1;
  font-size: 1rem;
  color: #333;
}

.btn-delete {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
}

.btn-delete:hover {
  background: #c82333;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.4);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.stats {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  margin-top: 1rem;
}
```

##### 4. Pinia Store

```typescript
// stores/todo.ts
import { defineStore } from 'pinia'

export interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [] as Todo[],
    filter: 'all' as 'all' | 'active' | 'completed'
  }),

  getters: {
    // 获取过滤后的 todos
    filteredTodos: (state) => {
      switch (state.filter) {
        case 'active':
          return state.todos.filter(todo => !todo.completed)
        case 'completed':
          return state.todos.filter(todo => todo.completed)
        default:
          return state.todos
      }
    },

    // 统计信息
    stats: (state) => ({
      total: state.todos.length,
      active: state.todos.filter(t => !t.completed).length,
      completed: state.todos.filter(t => t.completed).length
    })
  },

  actions: {
    addTodo(text: string) {
      const todo: Todo = {
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date()
      }
      this.todos.unshift(todo)
    },

    toggleTodo(id: number) {
      const todo = this.todos.find(t => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
      }
    },

    deleteTodo(id: number) {
      const index = this.todos.findIndex(t => t.id === id)
      if (index !== -1) {
        this.todos.splice(index, 1)
      }
    },

    setFilter(filter: 'all' | 'active' | 'completed') {
      this.filter = filter
    }
  }
})
```

##### 5. 主页面

```vue
<!-- pages/index.vue -->
<template>
  <div class="container">
    <div class="card">
      <!-- 头部 -->
      <div class="header">
        <h1>📝 待办事项</h1>
        <p>基于 Nuxt 3 + Pinia</p>
      </div>

      <!-- 输入框 -->
      <form @submit.prevent="addTodo" class="input-group">
        <input
          v-model="newTodo"
          type="text"
          placeholder="添加新的待办事项..."
          :disabled="loading"
        />
        <button type="submit" class="btn btn-primary" :disabled="!newTodo.trim() || loading">
          {{ loading ? '添加中...' : '添加' }}
        </button>
      </form>

      <!-- 过滤器 -->
      <div class="filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="filter-btn"
          :class="{ active: todoStore.filter === filter.value }"
          @click="todoStore.setFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- 待办列表 -->
      <div v-if="filteredTodos.length > 0">
        <ul class="todo-list">
          <li
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="todo-item"
            :class="{ completed: todo.completed }"
          >
            <input
              type="checkbox"
              class="todo-checkbox"
              :checked="todo.completed"
              @change="todoStore.toggleTodo(todo.id)"
            />
            <span class="todo-text">{{ todo.text }}</span>
            <button class="btn btn-delete" @click="todoStore.deleteTodo(todo.id)">
              删除
            </button>
          </li>
        </ul>

        <!-- 统计信息 -->
        <div class="stats">
          {{ stats.active }} 项未完成 / {{ stats.total }} 项总计
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>{{ emptyMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 使用 Pinia store（自动导入）
const todoStore = useTodoStore()

// 响应式数据
const newTodo = ref('')
const loading = ref(false)

// 计算属性
const filteredTodos = computed(() => todoStore.filteredTodos)
const stats = computed(() => todoStore.stats)

const filters = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' }
]

const emptyMessage = computed(() => {
  switch (todoStore.filter) {
    case 'active':
      return '没有进行中的待办事项'
    case 'completed':
      return '没有已完成的待办事项'
    default:
      return '暂无待办事项，开始添加吧！'
  }
})

// 方法
const addTodo = async () => {
  if (!newTodo.value.trim() || loading.value) return

  loading.value = true

  // 模拟 API 调用延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  todoStore.addTodo(newTodo.value.trim())
  newTodo.value = ''
  loading.value = false
}

// 页面元数据
useHead({
  title: '首页 - 待办事项应用'
})
</script>
```

##### 6. API 路由（可选）

```typescript
// server/api/todos.ts
export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  // 获取所有 todos
  if (method === 'GET') {
    // 实际项目中应该从数据库读取
    return [
      { id: 1, text: '学习 Nuxt 3', completed: true },
      { id: 2, text: '创建第一个应用', completed: false },
      { id: 3, text: '掌握核心概念', completed: false }
    ]
  }

  // 创建新 todo
  if (method === 'POST') {
    const body = await readBody(event)
    return {
      id: Date.now(),
      text: body.text,
      completed: false,
      createdAt: new Date()
    }
  }
})

// server/api/todos/[id].ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const method = getMethod(event)

  // 实际项目中应该操作数据库
  return { id, message: `Todo ${id} processed` }
})
```

##### 7. 运行项目

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

#### 预期效果

访问 `http://localhost:3000`，你将看到一个功能完整的待办事项应用：

1. ✅ 添加待办事项
2. ✅ 标记完成/未完成
3. ✅ 删除待办事项
4. ✅ 过滤显示（全部/进行中/已完成）
5. ✅ 统计信息
6. ✅ 响应式设计
7. ✅ 平滑动画效果

---

### 常见错误与解决方案

#### 错误 1：Node.js 版本过低

```bash
# ❌ 错误信息
ERROR: Nuxt 3 requires Node.js >= 18.0.0

# ✅ 解决方案：升级 Node.js
# 使用 nvm（推荐）
nvm install 18
nvm use 18

# 或从官网下载最新 LTS 版本
# https://nodejs.org/
```

#### 错误 2：端口已被占用

```bash
# ❌ 错误信息
Error: listen EADDRINUSE: address already in use :::3000

# ✅ 解决方案 1：使用其他端口
npm run dev -- --port 3001

# ✅ 解决方案 2：关闭占用端口的进程
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

#### 错误 3：模块未找到

```bash
# ❌ 错误信息
Cannot find module '@pinia/nuxt'

# ✅ 解决方案：安装缺失的模块
npm install @pinia/nuxt

# 或重新安装所有依赖
rm -rf node_modules package-lock.json
npm install
```

#### 错误 4：自动导入不工作

```typescript
// ❌ 错误示例：手动导入不需要导入的内容
import { ref, computed } from 'vue' // 不需要手动导入
import { useTodoStore } from '~/stores/todo' // 不需要手动导入

// ✅ 正确示例：直接使用
const count = ref(0)
const doubled = computed(() => count.value * 2)
const todoStore = useTodoStore()

// 如果自动导入不工作，检查 nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    dirs: ['composables', 'stores', 'utils']
  }
})
```

---

### 本章小结

#### Nuxt 3 核心概念

| 概念 | 说明 | 优势 |
|------|------|------|
| **文件路由** | 基于 `pages/` 目录自动生成路由 | 无需手动配置 |
| **自动导入** | 组件、composables、utils 自动导入 | 减少样板代码 |
| **数据获取** | `useFetch`、`useAsyncData` | 简化 API 调用 |
| **SSR/SSG** | 服务端渲染、静态站点生成 | 更好的 SEO 和性能 |
| **API 路由** | 内置服务端 API | 无需后端框架 |
| **中间件** | 路由级别的拦截器 | 统一处理逻辑 |

#### Nuxt 3 vs Vue 3 选择建议

```javascript
// 选择 Vue 3 + Vite 的场景
if (项目类型 === '纯SPA应用' ||
    团队经验 === 'Vue生态熟练' ||
    部署方式 === '静态CDN') {
  使用 Vue 3 + Vite
}

// 选择 Nuxt 3 的场景
if (需要SEO ||
    需要SSR ||
    需要API路由 ||
    项目规模 === '大型项目' ||
    追求开发效率) {
  使用 Nuxt 3
}
```

#### 最佳实践

1. **项目结构**：遵循 Nuxt 约定式目录结构
2. **自动导入**：充分利用自动导入功能，减少样板代码
3. **数据获取**：使用 `useFetch` 而不是原生 `fetch`
4. **状态管理**：使用 Pinia 并配合 Nuxt 的自动导入
5. **类型安全**：启用 TypeScript 严格模式
6. **环境变量**：使用 `runtimeConfig` 管理配置

---

**下一步学习**: 建议继续学习[Nuxt目录结构与约定](./chapter-112)了解Nuxt的约定式路由和文件系统。
