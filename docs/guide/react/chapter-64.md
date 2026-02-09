# ：状态管理Zustand完全指南

## Zustand 简介

### 为什么选择 Zustand？

Zustand 是一个轻量级、简单的状态管理库，相比 Redux 和 Context API 有以下优势：

- **简单**：极简的 API，学习成本低
- **轻量**：仅 1KB gzip，比 Redux 小得多
- **无模板代码**：不需要 actions、reducers、providers
- **TypeScript 友好**：完整的类型支持
- **性能优秀**：基于发布订阅模式，减少不必要的渲染
- **灵活**：支持中间件、持久化、开发工具等

### 安装 Zustand

```bash
# 使用 npm
npm install zustand

# 使用 yarn
yarn add zustand

# 使用 pnpm
pnpm add zustand

# 安装中间件（可选）
npm install zustand/middleware
```

## 基础使用

### 创建第一个 Store

```tsx
// ❌ 错误：使用 Context API 管理状态（繁琐）
import { createContext, useContext, useState } from 'react'

const CounterContext = createContext<{
  count: number
  increment: () => void
  decrement: () => void
} | null>(null)

const CounterProvider = ({ children }: { children: React.ReactNode }) => {
  const [count, setCount] = useState(0)

  const increment = () => setCount(c => c + 1)
  const decrement = () => setCount(c => c - 1)

  return (
    <CounterContext.Provider value={{ count, increment, decrement }}>
      {children}
    </CounterContext.Provider>
  )
}

const useCounter = () => {
  const context = useContext(CounterContext)
  if (!context) {
    throw new Error('useCounter must be used within CounterProvider')
  }
  return context
}

// ✅ 正确：使用 Zustand（简单）
import { create } from 'zustand'

const useCounterStore = create<{
  count: number
  increment: () => void
  decrement: () => void
}>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}))

// 使用组件
const Counter = () => {
  const { count, increment, decrement } = useCounterStore()

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  )
}
```

### Store 的基本结构

```tsx
import { create } from 'zustand'

// ✅ 完整的 Store 结构
interface UserStore {
  // 状态
  user: User | null
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User) => void
  clearUser: () => void
  fetchUser: (id: string) => Promise<void>
}

const useUserStore = create<UserStore>((set) => ({
  // 初始状态
  user: null,
  isLoading: false,
  error: null,

  // 同步 Actions
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  // 异步 Actions
  fetchUser: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/users/${id}`)
      const user = await response.json()
      set({ user, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  }
}))
```

### 访问和更新状态

```tsx
import { create } from 'zustand'

const useStore = create<{
  count: number
  name: string
  increment: () => void
  updateName: (name: string) => void
}>((set) => ({
  count: 0,
  name: '张三',
  increment: () => set((state) => ({ count: state.count + 1 })),
  updateName: (name) => set({ name })
}))

// ✅ 使用整个 store
const Component1 = () => {
  const store = useStore()
  console.log(store.count, store.name)

  return (
    <div>
      <p>{store.count}</p>
      <button onClick={store.increment}>+1</button>
    </div>
  )
}

// ✅ 选择特定状态（推荐，避免不必要的渲染）
const Component2 = () => {
  const count = useStore((state) => state.count)
  const increment = useStore((state) => state.increment)

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+1</button>
    </div>
  )
}

// ✅ 多个状态选择器
const Component3 = () => {
  const [count, name] = useStore((state) => [state.count, state.name])

  return (
    <div>
      <p>计数：{count}</p>
      <p>名字：{name}</p>
    </div>
  )
}

// ❌ 不好的做法：每次创建新的选择器函数
const Component4 = () => {
  const count = useStore((state) => state.count) // 每次渲染都创建新函数

  return <div>{count}</div>
}

// ✅ 好的做法：使用浅比较
import { shallow } from 'zustand/shallow'

const Component5 = () => {
  // 使用 shallow 比较对象
  const { count, name } = useStore(
    (state) => ({ count: state.count, name: state.name }),
    shallow
  )

  return (
    <div>
      <p>{count}</p>
      <p>{name}</p>
    </div>
  )
}
```

## Actions 和异步 Actions

### 同步 Actions

```tsx
import { create } from 'zustand'

interface TodoStore {
  todos: string[]
  addTodo: (todo: string) => void
  removeTodo: (index: number) => void
  clearTodos: () => void
}

const useTodoStore = create<TodoStore>((set) => ({
  todos: [],

  // ✅ 添加待办事项
  addTodo: (todo) => set((state) => ({
    todos: [...state.todos, todo]
  })),

  // ✅ 删除待办事项
  removeTodo: (index) => set((state) => ({
    todos: state.todos.filter((_, i) => i !== index)
  })),

  // ✅ 清空待办事项
  clearTodos: () => set({ todos: [] })
}))

// 使用示例
const TodoApp = () => {
  const { todos, addTodo, removeTodo, clearTodos } = useTodoStore()
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      addTodo(inputValue)
      setInputValue('')
    }
  }

  return (
    <div className="todo-app">
      <div className="input-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="添加新的待办事项..."
        />
        <button onClick={handleAdd}>添加</button>
      </div>

      <ul className="todo-list">
        {todos.map((todo, index) => (
          <li key={index}>
            <span>{todo}</span>
            <button onClick={() => removeTodo(index)}>删除</button>
          </li>
        ))}
      </ul>

      {todos.length > 0 && (
        <button onClick={clearTodos} className="clear-btn">
          清空所有
        </button>
      )}
    </div>
  )
}
```

### 异步 Actions

```tsx
import { create } from 'zustand'

interface Product {
  id: string
  name: string
  price: number
  category: string
}

interface ProductStore {
  products: Product[]
  loading: boolean
  error: string | null

  // 异步 Actions
  fetchProducts: () => Promise<void>
  createProduct: (product: Omit<Product, 'id'>) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
}

const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  // 获取产品列表
  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/products')
      const products = await response.json()
      set({ products, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // 创建产品
  createProduct: async (productData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      const newProduct = await response.json()

      // 使用 get() 获取当前状态
      set((state) => ({
        products: [...state.products, newProduct],
        loading: false
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // 更新产品
  updateProduct: async (id, productData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      const updatedProduct = await response.json()

      set((state) => ({
        products: state.products.map(p =>
          p.id === id ? updatedProduct : p
        ),
        loading: false
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // 删除产品
  deleteProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })

      set((state) => ({
        products: state.products.filter(p => p.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  }
}))
```

### 结合异步操作和错误处理

```tsx
import { create } from 'zustand'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<boolean>
  refreshToken: () => Promise<void>
  clearError: () => void
}

const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // 登录
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '登录失败')
      }

      const { user, token } = await response.json()

      localStorage.setItem('token', token)
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      })

      return true
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return false
    }
  },

  // 注册
  register: async (email, password, name) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '注册失败')
      }

      const { user, token } = await response.json()

      localStorage.setItem('token', token)
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      })

      return true
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return false
    }
  },

  // 退出登录
  logout: () => {
    localStorage.removeItem('token')
    set({
      user: null,
      token: null,
      isAuthenticated: false
    })
  },

  // 刷新令牌
  refreshToken: async () => {
    const { token } = get()
    if (!token) return

    try {
      const response = await fetch('/api/auth/refresh', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Token refresh failed')

      const { token: newToken } = await response.json()
      localStorage.setItem('token', newToken)
      set({ token: newToken })
    } catch (error) {
      get().logout()
    }
  },

  // 清除错误
  clearError: () => set({ error: null })
}))
```

## State 选择和切片

### 状态选择优化

```tsx
import { create } from 'zustand'
import { shallow } from 'zustand/shallow'

interface Store {
  count: number
  name: string
  age: number
  email: string
  increment: () => void
  updateName: (name: string) => void
}

const useStore = create<Store>((set) => ({
  count: 0,
  name: '',
  age: 0,
  email: '',
  increment: () => set((state) => ({ count: state.count + 1 })),
  updateName: (name) => set({ name })
}))

// ✅ 选择单个状态
const CountComponent = () => {
  const count = useStore((state) => state.count)
  return <div>{count}</div>
}

// ✅ 选择多个状态（使用 shallow）
const UserInfo = () => {
  const { name, email } = useStore(
    (state) => ({ name: state.name, email: state.email }),
    shallow
  )

  return (
    <div>
      <p>姓名：{name}</p>
      <p>邮箱：{email}</p>
    </div>
  )
}

// ❌ 不好的做法：返回整个对象
const UserInfoBad = () => {
  const state = useStore((state) => state) // 任何状态变化都会重新渲染

  return (
    <div>
      <p>姓名：{state.name}</p>
      <p>邮箱：{state.email}</p>
    </div>
  )
}

// ✅ 使用选择器函数
const useStateSelector = () => {
  const name = useStore((state) => state.name)
  const age = useStore((state) => state.age)

  return (
    <div>
      <p>{name} - {age}岁</p>
    </div>
  )
}
```

### Store 切片（Slice Pattern）

```tsx
// ✅ 将大型 Store 拆分为多个切片

// userSlice.ts
interface UserSlice {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}

const createUserSlice: StoreSlice<UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null })
})

// productSlice.ts
interface ProductSlice {
  products: Product[]
  addProduct: (product: Product) => void
  removeProduct: (id: string) => void
}

const createProductSlice: StoreSlice<ProductSlice> = (set) => ({
  products: [],
  addProduct: (product) => set((state) => ({
    products: [...state.products, product]
  })),
  removeProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  }))
})

// cartSlice.ts
interface CartSlice {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

const createCartSlice: StoreSlice<CartSlice> = (set, get) => ({
  cartItems: [],

  addToCart: (item) => {
    const existingItem = get().cartItems.find(i => i.id === item.id)
    if (existingItem) {
      set((state) => ({
        cartItems: state.cartItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }))
    } else {
      set((state) => ({
        cartItems: [...state.cartItems, item]
      }))
    }
  },

  removeFromCart: (id) => set((state) => ({
    cartItems: state.cartItems.filter(item => item.id !== id)
  })),

  clearCart: () => set({ cartItems: [] })
})

// 组合所有切片
const useStore = create<CombinedStore>((...a) => ({
  ...createUserSlice(...a),
  ...createProductSlice(...a),
  ...createCartSlice(...a)
}))
```

## 中间件

### persist 中间件（状态持久化）

```tsx
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ✅ 基础持久化
const useStore = create(
  persist<{
    count: number
    name: string
    increment: () => void
    setName: (name: string) => void
  }>(
    (set) => ({
      count: 0,
      name: '',
      increment: () => set((state) => ({ count: state.count + 1 })),
      setName: (name) => set({ name })
    }),
    {
      name: 'app-storage', // localStorage 的键名
      storage: createJSONStorage(() => localStorage) // 默认使用 localStorage
    }
  )
)

// ✅ 持久化部分状态
const useUserStore = create(
  persist<{
    user: User | null
    token: string | null
    setUser: (user: User) => void
    setToken: (token: string) => void
    logout: () => void
  }>(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null })
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
)

// ✅ 使用 sessionStorage
const useSessionStore = create(
  persist<{
    tempData: string
    setTempData: (data: string) => void
  }>(
    (set) => ({
      tempData: '',
      setTempData: (data) => set({ tempData: data })
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)

// ✅ 自定义存储（例如 AsyncStorage for React Native）
const useAsyncStorage = create(
  persist<{
    data: any
  }>(
    (set) => ({
      data: null
    }),
    {
      name: 'async-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
)
```

### devtools 中间件（Redux DevTools）

```tsx
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ✅ 启用 Redux DevTools
const useStore = create(
  devtools<{
    count: number
    increment: () => void
    decrement: () => void
  }>(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }), false, 'increment'),
      decrement: () => set((state) => ({ count: state.count - 1 }), false, 'decrement')
    }),
    {
      name: 'AppStore', // DevTools 中显示的名称
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// ✅ 组合多个中间件
import { devtools, persist } from 'zustand/middleware'

const useStore = create(
  devtools(
    persist<{
      count: number
      increment: () => void
    }>(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 }), false, 'increment')
      }),
      {
        name: 'app-storage'
      }
    ),
    { name: 'AppStore' }
  )
)
```

### 自定义中间件

```tsx
import { create } from 'zustand'

// ✅ 日志中间件
const log = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('  %c prev state', 'color: #9E9E9E; font-weight: 700', get())
      console.log('  %c action', 'color: #03A9F4; font-weight: 700', args)
      set(...args)
      console.log('  %c next state', 'color: #4CAF50; font-weight: 700', get())
    },
    get,
    api
  )

const useStore = create(
  log<{
    count: number
    increment: () => void
  }>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 }))
  }))
)

// ✅ 重放中间件（用于时间旅行调试）
const replayMiddleware = (config) => (set, get, api) => {
  const actions = []

  return config(
    (...args) => {
      actions.push({ type: args[0], state: get() })
      set(...args)
    },
    get,
    {
      ...api,
      replay: (actionIndex) => {
        const action = actions[actionIndex]
        set(action.state)
      },
      getActions: () => actions
    }
  )
}
```

## 实战案例：购物车状态管理

```tsx
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

// ==================== 类型定义 ====================
export interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
}

export interface CartItem extends Product {
  quantity: number
}

interface CartStore {
  // 状态
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isOpen: boolean

  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void

  // 计算方法
  calculateTotals: () => void
}

// ==================== 创建 Store ====================
const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isOpen: false,

        // 添加商品到购物车
        addItem: (product, quantity = 1) => {
          const items = get().items
          const existingItem = items.find((item) => item.id === product.id)

          if (existingItem) {
            // 如果商品已存在，更新数量
            set((state) => ({
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }))
          } else {
            // 如果商品不存在，添加新项
            set((state) => ({
              items: [...state.items, { ...product, quantity }]
            }))
          }

          get().calculateTotals()
          get().openCart()
        },

        // 从购物车移除商品
        removeItem: (productId) => {
          set((state) => ({
            items: state.items.filter((item) => item.id !== productId)
          }))
          get().calculateTotals()
        },

        // 更新商品数量
        updateQuantity: (productId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(productId)
            return
          }

          set((state) => ({
            items: state.items.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            )
          }))
          get().calculateTotals()
        },

        // 清空购物车
        clearCart: () => {
          set({ items: [], totalItems: 0, totalPrice: 0 })
        },

        // 切换购物车显示/隐藏
        toggleCart: () => {
          set((state) => ({ isOpen: !state.isOpen }))
        },

        // 打开购物车
        openCart: () => {
          set({ isOpen: true })
        },

        // 关闭购物车
        closeCart: () => {
          set({ isOpen: false })
        },

        // 计算总计
        calculateTotals: () => {
          const items = get().items
          const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          )

          set({ totalItems, totalPrice })
        }
      }),
      {
        name: 'cart-storage',
        partialize: (state) => ({
          items: state.items,
          totalItems: state.totalItems,
          totalPrice: state.totalPrice
        })
      }
    ),
    { name: 'CartStore' }
  )
)

export default useCartStore

// ==================== 产品数据 ====================
const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 7999,
    image: 'https://picsum.photos/300/300?random=1',
    category: '手机',
    description: '最新的 iPhone，强大的性能和出色的摄像头'
  },
  {
    id: '2',
    name: 'MacBook Pro 14"',
    price: 15999,
    image: 'https://picsum.photos/300/300?random=2',
    category: '电脑',
    description: '专业级笔记本电脑，适合开发者使用'
  },
  {
    id: '3',
    name: 'AirPods Pro',
    price: 1899,
    image: 'https://picsum.photos/300/300?random=3',
    category: '耳机',
    description: '主动降噪，沉浸式音频体验'
  },
  {
    id: '4',
    name: 'iPad Air',
    price: 4799,
    image: 'https://picsum.photos/300/300?random=4',
    category: '平板',
    description: '轻薄便携，性能强劲'
  },
  {
    id: '5',
    name: 'Apple Watch Series 9',
    price: 2999,
    image: 'https://picsum.photos/300/300?random=5',
    category: '手表',
    description: '健康监测，智能助手'
  },
  {
    id: '6',
    name: 'HomePod mini',
    price: 749,
    image: 'https://picsum.photos/300/300?random=6',
    category: '音响',
    description: '小巧的智能音箱，出色的音质'
  }
]

// ==================== 组件 ====================

// 购物车图标按钮
const CartButton = () => {
  const { totalItems, toggleCart } = useCartStore()

  return (
    <button className="cart-button" onClick={toggleCart}>
      <span className="cart-icon">🛒</span>
      {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
    </button>
  )
}

// 购物车侧边栏
const CartSidebar = () => {
  const { isOpen, items, totalPrice, closeCart, updateQuantity, removeItem, clearCart } = useCartStore()

  if (!isOpen) return null

  return (
    <div className="cart-overlay" onClick={closeCart}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>购物车</h2>
          <button className="close-btn" onClick={closeCart}>×</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <p>购物车是空的</p>
              <button onClick={closeCart}>继续购物</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">¥{item.price}</p>
                  <div className="item-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>总计：</span>
              <span className="total-price">¥{totalPrice.toLocaleString()}</span>
            </div>
            <div className="cart-actions">
              <button className="checkout-btn">去结算</button>
              <button className="clear-btn" onClick={clearCart}>清空购物车</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 产品卡片
const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCartStore()

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">¥{product.price.toLocaleString()}</span>
          <button
            className="add-to-cart-btn"
            onClick={() => addItem(product)}
          >
            加入购物车
          </button>
        </div>
      </div>
    </div>
  )
}

// 产品列表
const ProductList = () => {
  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// 主应用
const ShoppingCartApp = () => {
  return (
    <div className="shopping-cart-app">
      <header className="app-header">
        <h1>🛍️ 在线商店</h1>
        <CartButton />
      </header>

      <main className="app-main">
        <ProductList />
      </main>

      <CartSidebar />
    </div>
  )
}

export default ShoppingCartApp
```

**配套样式：**

```css
.shopping-cart-app {
  min-height: 100vh;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 头部 */
.app-header {
  background: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
  color: #2196F3;
}

/* 购物车按钮 */
.cart-button {
  position: relative;
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.cart-button:hover {
  background: #1976D2;
}

.cart-icon {
  font-size: 20px;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f44336;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* 主内容 */
.app-main {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 产品列表 */
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* 产品卡片 */
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.product-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.product-info {
  padding: 20px;
}

.product-category {
  display: inline-block;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #2196F3;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 12px;
}

.product-card h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.product-description {
  color: #666;
  font-size: 14px;
  margin: 8px 0 16px 0;
  line-height: 1.5;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.product-price {
  font-size: 20px;
  font-weight: bold;
  color: #f44336;
}

.add-to-cart-btn {
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-to-cart-btn:hover {
  background: #1976D2;
}

/* 购物车侧边栏 */
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cart-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 450px;
  background: white;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.cart-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.cart-empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.cart-empty p {
  font-size: 16px;
  margin-bottom: 20px;
}

.cart-empty button {
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.cart-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 16px;
}

.cart-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.item-price {
  color: #f44336;
  font-weight: bold;
  margin: 4px 0 12px 0;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-controls button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.item-controls button:hover {
  background: #f5f5f5;
  border-color: #2196F3;
  color: #2196F3;
}

.remove-btn {
  margin-left: auto;
  color: #f44336;
  border-color: #f44336 !important;
}

.remove-btn:hover {
  background: #ffebee !important;
}

.cart-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: #f9f9f9;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: bold;
}

.total-price {
  color: #f44336;
  font-size: 24px;
}

.cart-actions {
  display: flex;
  gap: 12px;
}

.checkout-btn {
  flex: 1;
  padding: 14px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.checkout-btn:hover {
  background: #1976D2;
}

.clear-btn {
  padding: 14px 20px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background: #d32f2f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: 16px 20px;
  }

  .app-header h1 {
    font-size: 20px;
  }

  .app-main {
    padding: 20px;
  }

  .product-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  .cart-sidebar {
    width: 100%;
    max-width: 350px;
  }

  .product-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .add-to-cart-btn {
    width: 100%;
  }
}
```

## Zustand 最佳实践

### 1. Store 组织

```tsx
// ✅ 好的做法：按功能模块组织 Store
// stores/userStore.ts
export const useUserStore = create<UserState>((set) => ({
  // ...
}))

// stores/cartStore.ts
export const useCartStore = create<CartState>((set) => ({
  // ...
}))

// stores/productStore.ts
export const useProductStore = create<ProductState>((set) => ({
  // ...
}))

// ❌ 不好的做法：一个巨大的 Store
export const useStore = create<Everything>((set) => ({
  // 包含所有状态，难以维护
}))
```

### 2. 类型安全

```tsx
// ✅ 完整的类型定义
interface Store {
  count: number
  increment: () => void
  decrement: () => void
}

const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}))

// ✅ 使用 TypeScript 的类型推断
const useStore = create<{
  count: number
  increment: () => void
}>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))
```

### 3. 性能优化

```tsx
// ✅ 使用选择器避免不必要的渲染
import { shallow } from 'zustand/shallow'

const Component = () => {
  // 只在 count 或 name 变化时重新渲染
  const { count, name } = useStore(
    (state) => ({ count: state.count, name: state.name }),
    shallow
  )

  return <div>{count} - {name}</div>
}
```

## 总结

本章我们学习了：

✅ Zustand 的安装和基础使用
✅ 创建 Store 和定义 State
✅ Actions 和异步 Actions 的实现
✅ State 选择和 Store 切片模式
✅ 中间件的使用（persist、devtools、自定义中间件）
✅ 实战案例：完整的购物车状态管理系统
✅ Zustand 最佳实践和性能优化技巧

**下一步：** 第65章将学习 Jotai 和 Recoil，了解原子化状态管理的不同实现方式。
