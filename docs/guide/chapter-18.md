# Pinia 状态管理
## Pinia 状态管理

> **2024-2026更新**：本章节已更新到 Pinia 2.2+，包含最新的类型定义、持久化方案和性能优化。

> **学习目标**：掌握Pinia状态管理
> **核心内容**：Store定义、State/Getters/Actions、持久化

### 安装和配置

> **2024-2026更新**：Pinia 2.2+ 是当前最新版本，官方推荐的状态管理方案。

```bash
# 安装 Pinia 2.2+（推荐）
npm install pinia@latest

# 或使用 pnpm（推荐）
pnpm add pinia@latest

# 安装持久化插件（推荐）
npm install pinia-plugin-persistedstate

# 查看版本
npm list pinia
```

**Pinia 2.2+ 新特性（2024-2026）：**
- ⚡ 性能优化：状态更新速度提升 40%
- 🎯 完整的 TypeScript 5.3+ 类型支持
- 🔧 改进的 Store 类型推导
- 📦 更小的打包体积（比 Vuex 小 50%）
- 🛡️ 增强的 DevTools 支持
- 🚀 支持 Vue 3.4+ 最新特性
- 💾 内置持久化支持（实验性）

#### 全局引入 Pinia（推荐）

**适用场景**：几乎所有项目都应该使用全局引入，确保整个应用共享同一个 Pinia 实例。

**方式一：基础全局配置**

```typescript
// stores/index.ts
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
```

```typescript
// main.ts
import { createApp } from 'vue'
import pinia from './stores'
import App from './App.vue'

const app = createApp(App)
app.use(pinia)
app.mount('#app')
```

**方式二：带插件的全局配置**

```typescript
// stores/index.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { watch } from 'vue'

// 创建 Pinia 实例
const pinia = createPinia()

// 添加持久化插件
pinia.use(piniaPluginPersistedstate)

// 自定义插件：状态变化日志
pinia.use(({ store }) => {
  // 监听 store 状态变化
  store.$subscribe((mutation, state) => {
    if (import.meta.env.DEV) {
      console.log(`[Pinia] ${store.$id} state changed:`, mutation.events)
    }
  })

  // 监听 store action 调用
  store.$onAction(({ name, args, after, onError }) => {
    const startTime = Date.now()
    console.log(`[Pinia] Action "${name}" called with:`, args)

    after((result) => {
      console.log(
        `[Pinia] Action "${name}" finished in ${Date.now() - startTime}ms`,
        result
      )
    })

    onError((error) => {
      console.error(`[Pinia] Action "${name}" failed:`, error)
    })
  })
})

export default pinia

// 导出独立实例（用于特殊情况）
export const createIndependentPinia = () => createPinia()
```

```typescript
// main.ts
import { createApp } from 'vue'
import pinia from './stores'
import router from './router'
import App from './App.vue'

const app = createApp(App)

// Pinia 必须在 Router 之前注册（因为 Router 可能使用 Store）
app.use(pinia)
app.use(router)

app.mount('#app')
```

**方式三：TypeScript 类型支持**

```typescript
// stores/index.ts
import { createPinia } from 'pinia'

// 创建 Pinia 实例
const pinia = createPinia()

// 为所有 store 添加统一的类型声明
declare module 'pinia' {
  export interface PiniaCustomProperties {
    // 添加全局属性（所有 store 都可访问）
    $http: (url: string, config?: RequestInit) => Promise<any>
    $storage: {
      get: (key: string) => any
      set: (key: string, value: any) => void
      remove: (key: string) => void
    }
  }
}

export default pinia
```

**方式四：SSR 服务端渲染配置**

```typescript
// stores/index.ts
import { createPinia } from 'pinia'

// 创建 Pinia 实例（用于 SSR）
const pinia = createPinia()

export default pinia

// 创建独立的 pinia 实例用于每个请求
export function createNewPinia() {
  const pinia = createPinia()
  return pinia
}
```

```typescript
// main.ts (客户端入口)
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()  // 每次创建新的实例

app.use(pinia)
app.mount('#app')
```

```typescript
// entry-server.ts (服务端入口)
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function render() {
  const app = createApp(App)
  const pinia = createPinia()  // 每个请求创建新实例

  app.use(pinia)

  return { app, pinia }
}
```

---

#### 局部引入 Pinia（特殊场景）

**适用场景**：
- 微前端架构（每个子应用独立 Pinia 实例）
- 独立组件库开发（不影响主应用）
- 多实例隔离（如同时管理多个用户会话）

**方式一：组件级独立 Pinia 实例**

```vue
<template>
  <div class="isolated-component">
    <h3>独立 Pinia 实例组件</h3>
    <p>Count: {{ localCounter.count }}</p>
    <button @click="localCounter.increment()">+1</button>
  </div>
</template>

<script setup lang="ts">
import { createPinia } from 'pinia'
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed, provide, inject, type App } from 'vue'
import { createApp } from 'vue'
import { onMounted, onUnmounted } from 'vue'

// 定义独立的 store
const useLocalCounter = defineStore('localCounter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

// 创建独立的 Pinia 实例和 Vue 应用
let localApp: App | null = null
let localContainer: HTMLElement | null = null

const localCounter = useLocalCounter()

onMounted(() => {
  // 创建独立的 DOM 容器
  localContainer = document.createElement('div')
  document.body.appendChild(localContainer)

  // 创建独立的 Vue 应用和 Pinia 实例
  const localPinia = createPinia()
  localApp = createApp({
    setup() {
      const counter = useLocalCounter()
      return { counter }
    },
    template: `
      <div class="local-pinia-app">
        <p>独立实例 Count: {{ counter.count }}</p>
        <button @click="counter.increment()">+1</button>
      </div>
    `
  })

  localApp.use(localPinia)
  localApp.mount(localContainer)
})

onUnmounted(() => {
  // 清理独立实例
  localApp?.unmount()
  localContainer?.remove()
})
</script>
```

**方式二：使用 Provide/Inject 创建作用域 Pinia**

```vue
<!-- 父组件：创建独立的 Pinia 作用域 -->
<template>
  <div class="scoped-app">
    <h3>作用域 Pinia 实例</h3>
    <ScopedChild />
  </div>
</template>

<script setup lang="ts">
import { provide, createPinia, type App } from 'vue'
import { usePinia } from '@/composables/useScopedPinia'
import ScopedChild from './ScopedChild.vue'

// 创建独立的 Pinia 实例
const scopedPinia = createPinia()

// 提供给子组件使用
provide('scopedPinia', scopedPinia)
</script>
```

```vue
<!-- 子组件：使用作用域 Pinia -->
<template>
  <div class="scoped-child">
    <p>Scoped Count: {{ counter.count }}</p>
    <button @click="counter.increment()">+1</button>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { defineStore } from 'pinia'
import { createPinia, setActivePinia } from 'pinia'
import type { Pinia } from 'pinia'

// 注入作用域 Pinia
const scopedPinia = inject<Pinia>('scopedPinia')

// 定义 store（使用作用域 Pinia）
const useScopedCounter = defineStore('scopedCounter', () => {
  const count = ref(0)
  function increment() {
    count.value++
  }
  return { count, increment }
})

// 设置当前使用的 Pinia 实例
if (scopedPinia) {
  setActivePinia(scopedPinia)
}

const counter = useScopedCounter()
</script>
```

**方式三：组合式函数封装（推荐）**

```typescript
// composables/useScopedPinia.ts
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { provide, inject, type InjectionKey } from 'vue'

// 定义注入键
export const SCOPED_PINIA_KEY: InjectionKey<Pinia> = Symbol('scopedPinia')

/**
 * 创建作用域 Pinia 实例
 * @returns Pinia 实例
 */
export function createScopedPinia(): Pinia {
  const pinia = createPinia()
  provide(SCOPED_PINIA_KEY, pinia)
  return pinia
}

/**
 * 使用作用域 Pinia 实例
 * @returns Pinia 实例或 null
 */
export function useScopedPinia(): Pinia | null {
  return inject(SCOPED_PINIA_KEY, null)
}

/**
 * 定义作用域 Store
 * @param id Store ID
 * @param setup Setup 函数
 */
export function defineScopedStore<T>(id: string, setup: () => T) {
  return () => {
    const scopedPinia = useScopedPinia()

    if (scopedPinia) {
      setActivePinia(scopedPinia)
    }

    return defineStore(id, setup)()
  }
}
```

```vue
<!-- 使用示例 -->
<template>
  <div class="app-container">
    <!-- 全局 Pinia 组件 -->
    <GlobalCounter />

    <!-- 作用域 Pinia 组件 -->
    <ScopedPiniaProvider>
      <ScopedCounter />
    </ScopedPiniaProvider>

    <!-- 多个独立作用域 -->
    <ScopedPiniaProvider>
      <ScopedCounter />
    </ScopedPiniaProvider>
  </div>
</template>

<script setup lang="ts">
import { createPinia } from 'pinia'
import GlobalCounter from './GlobalCounter.vue'
import ScopedCounter from './ScopedCounter.vue'
import ScopedPiniaProvider from './ScopedPiniaProvider.vue'
</script>
```

```vue
<!-- ScopedPiniaProvider.vue -->
<template>
  <div class="scoped-provider">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { createScopedPinia } from '@/composables/useScopedPinia'
import { onUnmounted } from 'vue'

// 创建作用域 Pinia
const scopedPinia = createScopedPinia()

onUnmounted(() => {
  // 清理作用域 Pinia
  scopedPinia.dispose?.()
})
</script>
```

```vue
<!-- ScopedCounter.vue -->
<template>
  <div class="scoped-counter">
    <p>Scoped Count: {{ count }}</p>
    <button @click="increment()">+1</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { defineScopedStore } from '@/composables/useScopedPinia'

// 定义作用域 Store
const useScopedCounter = defineScopedStore('scopedCounter', () => {
  const count = ref(0)
  function increment() {
    count.value++
  }
  return { count, increment }
})

// 使用 Store
const { count, increment } = useScopedCounter()
</script>
```

**方式四：微前端架构中的独立 Pinia**

```typescript
// 微应用入口
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 创建独立的 Pinia 实例（不与主应用共享）
const microPinia = createPinia()

const app = createApp(App)
app.use(microPinia)

// 导出挂载函数（供主应用调用）
export async function mount(container: HTMLElement) {
  app.mount(container)
}

// 导出卸载函数
export async function unmount() {
  app.unmount()
  microPinia.dispose?.()
}
```

---

#### Pinia 实例方法

```typescript
// stores/index.ts
import { createPinia } from 'pinia'

const pinia = createPinia()

// Pinia 实例常用方法
pinia.use({
  // 安装插件时的回调
  install(app) {
    console.log('Pinia plugin installed')
  }
})

// 获取所有已注册的 store
console.log(pinia.state.value)  // Map<storeId, state>

// 清理所有 store（用于测试或重置）
function resetAllStores() {
  const stores = Object.keys(pinia.state.value)
  stores.forEach(storeId => {
    const store = pinia.state.value[storeId]
    // 重置每个 store 的状态
    Object.assign(store, {})
  })
}

export default pinia
export { resetAllStores }
```

---

#### 最佳实践总结

| 引入方式 | 适用场景 | 优点 | 缺点 |
|---------|---------|------|------|
| **全局引入** | 常规项目 | 状态共享简单、配置统一 | 所有组件共享同一实例 |
| **独立实例** | 微前端、组件库 | 完全隔离、互不影响 | 需要手动管理实例 |
| **作用域 Pinia** | 模块化组件 | 灵活隔离、可嵌套 | 代码复杂度增加 |

**选择建议：**
1. **90%的项目**：使用全局引入即可
2. **微前端**：每个子应用独立 Pinia 实例
3. **独立组件库**：使用作用域 Pinia 避免冲突
4. **多用户会话**：每个会话创建独立实例

### 定义 Store（组合式API）

```typescript
// stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const name = ref('Counter')

  // Getters
  const doubleCount = computed(() => count.value * 2)
  const doubleCountPlusOne = computed(() => doubleCount.value + 1)

  // Actions
  function increment() {
    count.value++
  }

  function incrementBy(amount: number) {
    count.value += amount
  }

  function reset() {
    count.value = 0
    name.value = 'Counter'
  }

  return {
    count,
    name,
    doubleCount,
    doubleCountPlusOne,
    increment,
    incrementBy,
    reset
  }
})
```

### 在组件中使用

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

// 直接使用 store
const counterStore = useCounterStore()

// 使用 storeToRefs 解构（保持响应性）
const { count, doubleCount } = storeToRefs(counterStore)

// Actions 可以直接解构
const { increment, reset } = counterStore
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
    <button @click="reset">Reset</button>
  </div>
</template>
```

### Pinia 持久化（完整版）

#### 方式一：手动实现持久化

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref('')

  // 从 localStorage 恢复
  const savedUser = localStorage.getItem('user')
  const savedToken = localStorage.getItem('token')
  if (savedUser) user.value = JSON.parse(savedUser)
  if (savedToken) token.value = savedToken

  // 监听变化并保存
  watch(
    user,
    (newUser) => {
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser))
      } else {
        localStorage.removeItem('user')
      }
    },
    { deep: true }
  )

  watch(
    token,
    (newToken) => {
      if (newToken) {
        localStorage.setItem('token', newToken)
      } else {
        localStorage.removeItem('token')
      }
    }
  )

  function setUser(newUser: User) {
    user.value = newUser
  }

  function setToken(newToken: string) {
    token.value = newToken
  }

  function logout() {
    user.value = null
    token.value = ''
  }

  return { user, token, setUser, setToken, logout }
})
```

#### 方式二：使用 pinia-plugin-persistedstate 插件（推荐）

```bash
npm install pinia-plugin-persistedstate
```

```typescript
// stores/index.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia
```

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref('')

  function setUser(newUser: User) {
    user.value = newUser
  }

  function setToken(newToken: string) {
    token.value = newToken
  }

  function logout() {
    user.value = null
    token.value = ''
  }

  return { user, token, setUser, setToken, logout }
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['user', 'token']  // 只持久化这些字段
  }
})
```

#### 方式三：使用 sessionStorage

```typescript
// stores/session.ts
export const useSessionStore = defineStore('session', () => {
  const tempData = ref('')

  return { tempData }
}, {
  persist: {
    key: 'session-store',
    storage: sessionStorage  // 使用 sessionStorage
  }
})
```

#### 方式四：自定义存储（如 Cookie）

```typescript
// stores/cookie.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 自定义存储适配器
const cookieStorage = {
  getItem(key: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]*)'))
    return match ? decodeURIComponent(match[2]) : null
  },
  setItem(key: string, value: string): void {
    document.cookie = `${key}=${encodeURIComponent(value)}; max-age=3600; path=/`
  },
  removeItem(key: string): void {
    document.cookie = `${key}=; max-age=0; path=/`
  }
}

export const useCookieStore = defineStore('cookie', () => {
  const theme = ref('light')
  const language = ref('zh-CN')

  return { theme, language }
}, {
  persist: {
    key: 'preferences',
    storage: cookieStorage
  }
})
```

#### 方式五：多存储配置

```typescript
// stores/multiStorage.ts
export const useMultiStorageStore = defineStore('multi', () => {
  const userSettings = ref({})
  const sessionData = ref({})
  const tempCache = ref({})

  return { userSettings, sessionData, tempCache }
}, {
  persist: [
    {
      key: 'user-settings',
      storage: localStorage,
      paths: ['userSettings']
    },
    {
      key: 'session-data',
      storage: sessionStorage,
      paths: ['sessionData']
    },
    {
      key: 'temp-cache',
      storage: localStorage,
      paths: ['tempCache']
    }
  ]
})
```

---
