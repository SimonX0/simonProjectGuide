# Pinia 状态管理高级特性

## Pinia 状态管理高级特性

> **学习目标**：掌握 Pinia 的高级特性和最佳实践
> **核心内容**：
> - Store 持久化
> - 状态管理模式
> - 大型应用状态架构
> - Store 热更新
> - 测试 Pinia Store
> - Pinia 插件开发
> - 与其他状态管理方案对比

---

## Store 持久化

### 使用 pinia-plugin-persistedstate

#### 基础配置

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

#### Store 级别配置

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<any>(null)
    const preferences = ref({
      theme: 'light' as 'light' | 'dark',
      language: 'zh-CN'
    })

    function setToken(newToken: string) {
      token.value = newToken
    }

    function setUserInfo(info: any) {
      userInfo.value = info
    }

    function clearAuth() {
      token.value = ''
      userInfo.value = null
    }

    return {
      token,
      userInfo,
      preferences,
      setToken,
      setUserInfo,
      clearAuth
    }
  },
  {
    // 配置持久化
    persist: {
      // 存储的 key 名称
      key: 'user-store',

      // 存储位置（可选：localStorage、sessionStorage、cookie）
      storage: localStorage,

      // 需要持久化的状态路径（数组格式）
      paths: ['token', 'userInfo', 'preferences'],

      // 序列化函数（可选）
      serializer: {
        deserialize: JSON.parse,
        serialize: JSON.stringify
      },

      // 还原前的钩子
      beforeRestore: (context) => {
        console.log('即将恢复 user store:', context)
      },

      // 还原后的钩子
      afterRestore: (context) => {
        console.log('已恢复 user store:', context)
      }
    }
  }
)
```

#### 选择性持久化

```typescript
// stores/app.ts
export const useAppStore = defineStore(
  'app',
  () => {
    const sidebar = ref({
      opened: true,
      withoutAnimation: false
    })

    const device = ref('desktop')

    const size = ref('default')

    const language = ref('zh-CN')

    // 不持久化的状态
    const loading = ref(false)
    const currentPage = ref(1)

    function toggleSidebar() {
      sidebar.value.opened = !sidebar.value.opened
      sidebar.value.withoutAnimation = false
    }

    function closeSidebar(withoutAnimation = false) {
      sidebar.value.opened = false
      sidebar.value.withoutAnimation = withoutAnimation
    }

    return {
      sidebar,
      device,
      size,
      language,
      loading,
      currentPage,
      toggleSidebar,
      closeSidebar
    }
  },
  {
    persist: {
      key: 'app-store',
      storage: sessionStorage,

      // 只持久化特定路径
      paths: ['sidebar', 'size', 'language'],

      // 排除特定路径
      // 也可以使用 pick 代替 paths
    }
  }
)
```

---

### 自定义持久化方案

```typescript
// utils/storage.ts
// 本地存储工具

export interface StorageOptions {
  prefix?: string
  storage?: localStorage | sessionStorage
}

export class LocalStorage {
  private prefix: string
  private storage: Storage

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'app_'
    this.storage = options.storage || localStorage
  }

  // 获取完整的 key
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  // 获取值
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    const fullKey = this.getKey(key)
    const value = this.storage.getItem(fullKey)

    if (value === null) {
      return defaultValue
    }

    try {
      return JSON.parse(value)
    } catch {
      return value as any
    }
  }

  // 设置值
  set(key: string, value: any): void {
    const fullKey = this.getKey(key)
    const strValue = JSON.stringify(value)
    this.storage.setItem(fullKey, strValue)
  }

  // 删除值
  remove(key: string): void {
    const fullKey = this.getKey(key)
    this.storage.removeItem(fullKey)
  }

  // 清空所有值
  clear(): void {
    const keys = Object.keys(this.storage)

    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key)
      }
    })
  }
}

// 创建实例
export const storage = new LocalStorage({ prefix: 'vue_app_' })
```

```typescript
// stores/cart.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { storage } from '@/utils/storage'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  // 从 localStorage 加载
  function loadFromStorage() {
    const saved = storage.get<CartItem[]>('cart_items')
    if (saved) {
      items.value = saved
    }
  }

  // 保存到 localStorage
  function saveToStorage() {
    storage.set('cart_items', items.value)
  }

  // 监听 items 变化并自动保存
  watch(
    items,
    (newItems) => {
      saveToStorage()
    },
    { deep: true }
  )

  // 初始化时加载数据
  loadFromStorage()

  // 添加到购物车
  function addItem(product: Product) {
    const existingItem = items.value.find(item => item.id === product.id)

    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      })
    }
  }

  // 移除商品
  function removeItem(id: number) {
    const index = items.value.findIndex(item => item.id === id)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  // 更新数量
  function updateQuantity(id: number, quantity: number) {
    const item = items.value.find(item => item.id === id)
    if (item) {
      item.quantity = quantity
    }
  }

  // 清空购物车
  function clearCart() {
    items.value = []
  }

  // 计算总价
  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  })

  // 商品数量
  const totalCount = computed(() => {
    return items.value.reduce((total, item) => {
      return total + item.quantity
    }, 0)
  })

  return {
    items,
    totalPrice,
    totalCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }
})
```

---

## 状态管理模式

### 模块化状态管理

```typescript
// stores/modules/user.ts
export interface UserState {
  token: string
  userInfo: UserInfo | null
  roles: string[]
}

export interface UserInfo {
  id: number
  name: string
  email: string
  avatar: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const roles = ref<string[]>([])

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name || 'Guest')
  const hasRole = computed(() => (role: string) => roles.value.includes(role))

  // Actions
  function setToken(newToken: string) {
    token.value = newToken
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }

  function setRoles(newRoles: string[]) {
    roles.value = newRoles
  }

  function clearAuth() {
    token.value = ''
    userInfo.value = null
    roles.value = []
  }

  return {
    token,
    userInfo,
    roles,
    isLoggedIn,
    userName,
    hasRole,
    setToken,
    setUserInfo,
    setRoles,
    clearAuth
  }
})
```

```typescript
// stores/modules/app.ts
export const useAppStore = defineStore('app', () => {
  // 响应式状态
  const sidebar = ref({
    opened: true,
    withoutAnimation: false
  })

  const device = ref<'desktop' | 'mobile'>('desktop')
  const size = ref<'small' | 'medium' | 'large'>('medium')
  const language = ref<'zh-CN' | 'en-US'>('zh-CN')
  const theme = ref<'light' | 'dark'>('light')

  // 计算属性
  const isMobile = computed(() => device.value === 'mobile')

  // Actions
  function toggleSidebar() {
    sidebar.value.opened = !sidebar.value.opened
  }

  function closeSidebar(withoutAnimation = false) {
    sidebar.value.opened = false
    sidebar.value.withoutAnimation = withoutAnimation
  }

  function openSidebar() {
    sidebar.value.opened = true
  }

  function setSize(newSize: 'small' | 'medium' | 'large') {
    size.value = newSize
  }

  function setLanguage(newLanguage: 'zh-CN' | 'en-US') {
    language.value = newLanguage
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    sidebar,
    device,
    size,
    language,
    theme,
    isMobile,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setSize,
    setLanguage,
    toggleTheme
  }
})
```

---

### Store 之间的通信

```typescript
// stores/modules/permission.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const dynamicRoutes = ref<RouteRecordRaw[]>([])
  const menuRoutes = ref<RouteRecordRaw[]>([])

  // 计算可用路由
  const accessibleRoutes = computed(() => {
    const userStore = useUserStore()

    return routes.value.filter(route => {
      if (!route.meta?.roles) {
        return true
      }

      return route.meta.roles.some((role: string) =>
        userStore.roles.includes(role)
      )
    })
  })

  // 生成菜单
  function generateMenus() {
    const userStore = useUserStore()

    menuRoutes.value = routes.value
      .filter(route => !route.meta?.hidden)
      .filter(route => {
        if (!route.meta?.roles) {
          return true
        }

        return route.meta.roles.some((role: string) =>
          userStore.roles.includes(role)
        )
      })
      .map(route => ({
        path: route.path,
        name: route.name,
        meta: route.meta,
        children: route.children
          ?.filter(child => !child.meta?.hidden)
          .filter(child => {
            if (!child.meta?.roles) {
              return true
            }

            return child.meta.roles.some((role: string) =>
              userStore.roles.includes(role)
            )
          })
      }))
  }

  // 添加路由
  function addRoutes(newRoutes: RouteRecordRaw[]) {
    dynamicRoutes.value.push(...newRoutes)
  }

  return {
    routes,
    dynamicRoutes,
    menuRoutes,
    accessibleRoutes,
    generateMenus,
    addRoutes
  }
})
```

---

### 组合式 Store 模式

```typescript
// composables/useAuth.ts
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'

export function useAuth() {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 登录
  async function login(loginForm: LoginForm) {
    try {
      const response = await api.login(loginForm)

      // 设置 token
      userStore.setToken(response.token)

      // 设置用户信息
      userStore.setUserInfo(response.user)

      // 设置角色
      userStore.setRoles(response.roles)

      // 生成权限路由
      await permissionStore.generateMenus()

      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error }
    }
  }

  // 登出
  function logout() {
    // 清除用户信息
    userStore.clearAuth()

    // 清除权限路由
    permissionStore.routes = []
    permissionStore.menuRoutes = []

    // 重置路由
    router.reset()
  }

  // 检查权限
  function hasPermission(requiredRoles: string[]): boolean {
    return userStore.roles.some(role => requiredRoles.includes(role))
  }

  return {
    login,
    logout,
    hasPermission
  }
}
```

---

## 大型应用状态架构

### 分层状态管理

```typescript
// stores/index.ts
// 状态管理结构

/**
 * 状态层级：
 *
 * 1. 全局状态 (Global State)
 *    - user: 用户信息、认证状态
 *    - app: 应用配置、主题、语言
 *    - permission: 权限、路由、菜单
 *
 * 2. 功能模块状态 (Feature State)
 *    - cart: 购物车
 *    - product: 商品列表、过滤
 *    - order: 订单管理
 *
 * 3. 页面级状态 (Page State)
 *    - 组件内使用 ref/reactive
 *    - 不需要全局共享的状态
 */

export * from './modules/user'
export * from './modules/app'
export * from './modules/permission'
export * from './modules/cart'
export * from './modules/product'
export * from './modules/tagsView'
```

---

### 状态规范化

```typescript
// stores/modules/product.ts
export const useProductStore = defineStore('product', () => {
  // State 规范化
  interface Product {
    id: number
    name: string
    price: number
    category: string
  }

  const products = ref<Map<number, Product>>(new Map())
  const productIds = ref<number[]>([])

  // Getters
  const productList = computed(() => {
    return productIds.value.map(id => products.value.get(id)!).filter(Boolean)
  })

  const productById = computed(() => (id: number) => {
    return products.value.get(id)
  })

  const productsByCategory = computed(() => (category: string) => {
    return productList.value.filter(p => p.category === category)
  })

  // Actions
  function setProducts(newProducts: Product[]) {
    const newMap = new Map<number, Product>()

    newProducts.forEach(product => {
      newMap.set(product.id, product)
    })

    products.value = newMap
    productIds.value = newProducts.map(p => p.id)
  }

  function addProduct(product: Product) {
    products.value.set(product.id, product)
    productIds.value.push(product.id)
  }

  function updateProduct(id: number, updates: Partial<Product>) {
    const product = products.value.get(id)
    if (product) {
      Object.assign(product, updates)
    }
  }

  function removeProduct(id: number) {
    products.value.delete(id)
    productIds.value = productIds.value.filter(pid => pid !== id)
  }

  return {
    products,
    productIds,
    productList,
    productById,
    productsByCategory,
    setProducts,
    addProduct,
    updateProduct,
    removeProduct
  }
})
```

---

## Store 热更新

### 开发环境热更新

```typescript
// stores/hmr.ts
import { acceptHMRUpdate } from 'pinia'

// 监听热更新
if (import.meta.env.DEV) {
  acceptHMRUpdate(useUserStore, (newStore) => {
    console.log('User store updated:', newStore)
  })

  acceptHMRUpdate(useAppStore, (newStore) => {
    console.log('App store updated:', newStore)
  })
}
```

---

## 测试 Pinia Store

### 单元测试

```typescript
// tests/stores/user.spec.ts
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore } from '@/stores/modules/user'

describe('User Store', () => {
  beforeEach(() => {
    // 每个测试前创建新的 pinia 实例
    setActivePinia(createPinia())
  })

  it('初始状态应该是未登录', () => {
    const store = useUserStore()

    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
    expect(store.roles).toEqual([])
    expect(store.isLoggedIn).toBe(false)
  })

  it('应该能够设置 token', () => {
    const store = useUserStore()

    store.setToken('test-token')

    expect(store.token).toBe('test-token')
    expect(store.isLoggedIn).toBe(true)
  })

  it('应该能够设置用户信息', () => {
    const store = useUserStore()

    const userInfo = {
      id: 1,
      name: '张三',
      email: 'zhang@example.com',
      avatar: ''
    }

    store.setUserInfo(userInfo)

    expect(store.userInfo).toEqual(userInfo)
    expect(store.userName).toBe('张三')
  })

  it('应该能够检查角色', () => {
    const store = useUserStore()

    store.setRoles(['admin', 'user'])

    expect(store.hasRole('admin')).toBe(true)
    expect(store.hasRole('superadmin')).toBe(false)
  })

  it('应该能够清除认证信息', () => {
    const store = useUserStore()

    store.setToken('test-token')
    store.setUserInfo({
      id: 1,
      name: '张三',
      email: 'zhang@example.com',
      avatar: ''
    })
    store.setRoles(['admin'])

    store.clearAuth()

    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
    expect(store.roles).toEqual([])
    expect(store.isLoggedIn).toBe(false)
  })
})
```

---

### 集成测试

```typescript
// tests/stores/cart.spec.ts
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/stores/modules/cart'

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应该能够添加商品到购物车', () => {
    const store = useCartStore()

    const product = {
      id: 1,
      name: '商品A',
      price: 100
    }

    store.addItem(product)

    expect(store.items).toHaveLength(1)
    expect(store.items[0]).toEqual({
      id: 1,
      name: '商品A',
      price: 100,
      quantity: 1
    })
    expect(store.totalCount).toBe(1)
    expect(store.totalPrice).toBe(100)
  })

  it('添加相同商品应该增加数量', () => {
    const store = useCartStore()

    const product = {
      id: 1,
      name: '商品A',
      price: 100
    }

    store.addItem(product)
    store.addItem(product)

    expect(store.items).toHaveLength(1)
    expect(store.items[0].quantity).toBe(2)
    expect(store.totalCount).toBe(2)
    expect(store.totalPrice).toBe(200)
  })

  it('应该能够移除商品', () => {
    const store = useCartStore()

    const product = {
      id: 1,
      name: '商品A',
      price: 100
    }

    store.addItem(product)
    store.removeItem(1)

    expect(store.items).toHaveLength(0)
    expect(store.totalCount).toBe(0)
    expect(store.totalPrice).toBe(0)
  })

  it('应该能够更新数量', () => {
    const store = useCartStore()

    const product = {
      id: 1,
      name: '商品A',
      price: 100
    }

    store.addItem(product)
    store.updateQuantity(1, 5)

    expect(store.items[0].quantity).toBe(5)
    expect(store.totalCount).toBe(5)
    expect(store.totalPrice).toBe(500)
  })

  it('应该能够清空购物车', () => {
    const store = useCartStore()

    store.addItem({ id: 1, name: '商品A', price: 100 })
    store.addItem({ id: 2, name: '商品B', price: 200 })

    store.clearCart()

    expect(store.items).toHaveLength(0)
    expect(store.totalCount).toBe(0)
    expect(store.totalPrice).toBe(0)
  })
})
```

---

## Pinia 插件开发

### 日志插件

```typescript
// plugins/pinia-logger.ts
import { PiniaPluginContext } from 'pinia'

export interface LoggerOptions {
  logger?: (message: string) => void
  logActions?: boolean
  logStateChanges?: boolean
  disableTimer?: boolean
}

// Pinia 日志插件
export function createLoggerPlugin(options: LoggerOptions = {}) {
  const {
    logger = console.log,
    logActions = true,
    logStateChanges = true,
    disableTimer = false
  } = options

  return (context: PiniaPluginContext) => {
    const { store } = context

    // 日志前缀
    const prefix = `[Pinia:${store.$id}]`

    // 监听 action
    if (logActions) {
      store.$onAction(({ name, args, after, onError }) => {
        const startTime = Date.now()

        logger(`${prefix} ▶ action "${name}" with`, args)

        after((result) => {
          const duration = disableTimer ? '' : `in ${Date.now() - startTime}ms`
          logger(`${prefix} ✨ action "${name}" finished ${duration}`, result)
        })

        onError((error) => {
          logger(`${prefix} 💥 action "${name}" failed`, error)
        })
      })
    }

    // 监听状态变化
    if (logStateChanges) {
      store.$subscribe((mutation, state) => {
        logger(`${prefix} 🔄 state changed via`, mutation.events)
      })
    })
  }
}

// 使用
// stores/index.ts
import { createPinia } from 'pinia'
import { createLoggerPlugin } from '@/plugins/pinia-logger'

const pinia = createPinia()

if (import.meta.env.DEV) {
  pinia.use(createLoggerPlugin({
    logActions: true,
    logStateChanges: true
  }))
}

export default pinia
```

---

### 撤销重做插件

```typescript
// plugins/pinia-undo.ts
import { PiniaPluginContext } from 'pinia'

interface HistoryEntry {
  storeId: string
  actionName: string
  args: any[]
  prevState: any
}

// 撤销重做插件
export function createUndoPlugin(options = { maxHistory: 50 }) {
  const history: HistoryEntry[] = []
  let currentIndex = -1

  return (context: PiniaPluginContext) => {
    const { store } = context

    // 监听 action
    store.$onAction(({ name, args, after }) => {
      const prevState = JSON.parse(JSON.stringify(store.$state))

      after(() => {
        // 如果在历史中间执行新操作，删除后面的历史
        if (currentIndex < history.length - 1) {
          history.splice(currentIndex + 1)
        }

        // 添加新历史记录
        history.push({
          storeId: store.$id,
          actionName: name,
          args,
          prevState
        })

        // 限制历史记录大小
        if (history.length > options.maxHistory) {
          history.shift()
        } else {
          currentIndex++
        }
      })
    })

    // 添加撤销方法
    store.undo = () => {
      if (currentIndex >= 0) {
        const entry = history[currentIndex]
        store.$patch(entry.prevState)
        currentIndex--
      }
    }

    // 添加重做方法
    store.redo = () => {
      if (currentIndex < history.length - 1) {
        currentIndex++
        const entry = history[currentIndex]
        store.$patch((state: any) => {
          // 重新执行 action
          // 这里需要根据实际情况实现
        })
      }
    }

    // 添加 canUndo/canRedo getters
    Object.defineProperty(store, 'canUndo', {
      get() {
        return currentIndex >= 0
      }
    })

    Object.defineProperty(store, 'canRedo', {
      get() {
        return currentIndex < history.length - 1
      }
    })
  }
}
```

---

## 与其他状态管理方案对比

### Pinia vs Vuex

| 特性 | Pinia | Vuex |
|------|-------|------|
| **TypeScript 支持** | ✅ 原生支持 | ⚪ 需要额外配置 |
| **Mutations** | ❌ 不需要 | ✅ 必须 |
| **嵌套模块** | ❌ 扁平化 | ✅ 支持 |
| **命名空间** | ❌ 自动隔离 | ✅ 手动配置 |
| **DevTools** | ✅ 完整支持 | ✅ 完整支持 |
| **代码分割** | ✅ 自动支持 | ⚪ 需要手动处理 |
| **学习曲线** | 🟢 简单 | 🟡 中等 |
| **包大小** | 🟢 小 (1KB) | 🟡 中等 |

---

### Pinia vs Zustand (React)

| 特性 | Pinia | Zustand |
|------|-------|---------|
| **框架** | Vue | React |
| **TypeScript** | ✅ 原生支持 | ✅ 原生支持 |
| **DevTools** | ✅ Vue DevTools | ✅ Redux DevTools |
| **学习曲线** | 🟢 简单 | 🟢 简单 |
| **生态** | 🟡 成长中 | 🟢 成熟 |

---

## 总结

本章深入探讨了 Pinia 状态管理的高级特性和最佳实践：

- ✅ Store 持久化（pinia-plugin-persistedstate、自定义方案）
- ✅ 状态管理模式（模块化、Store 通信、组合式模式）
- ✅ 大型应用状态架构（分层管理、状态规范化）
- ✅ Store 热更新
- ✅ 测试 Pinia Store（单元测试、集成测试）
- ✅ Pinia 插件开发（日志插件、撤销重做插件）
- ✅ 与其他方案对比

掌握这些内容后，你将能够：
- 构建可维护的大型应用状态
- 实现状态持久化
- 编写可测试的 Store
- 开发自定义 Pinia 插件

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v2.0**
