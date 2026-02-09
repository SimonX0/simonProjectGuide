# ：React项目架构与最佳实践

## 项目目录结构

### 推荐的目录结构

```
my-react-app/
├── public/                    # 静态资源
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── main.tsx              # 应用入口
│   ├── App.tsx               # 根组件
│   ├── vite-env.d.ts         # Vite 类型声明
│   │
│   ├── assets/               # 静态资源（图片、字体等）
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   │
│   ├── components/           # 通用组件
│   │   ├── ui/              # 基础 UI 组件
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Button.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── index.ts     # 统一导出
│   │   │
│   │   └── layout/          # 布局组件
│   │       ├── Header/
│   │       ├── Sidebar/
│   │       ├── Footer/
│   │       └── index.ts
│   │
│   ├── pages/               # 页面组件
│   │   ├── home/
│   │   │   ├── HomePage.tsx
│   │   │   ├── HomePage.test.tsx
│   │   │   ├── components/  # 页面专属组件
│   │   │   └── index.ts
│   │   ├── about/
│   │   ├── dashboard/
│   │   └── index.ts
│   │
│   ├── features/            # 功能模块（按业务划分）
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── products/
│   │   └── users/
│   │
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   ├── useFetch.ts
│   │   ├── useLocalStorage.ts
│   │   └── index.ts
│   │
│   ├── services/            # API 服务层
│   │   ├── api.ts          # API 客户端配置
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── index.ts
│   │
│   ├── store/               # 状态管理
│   │   ├── index.ts        # Store 配置
│   │   ├── authSlice.ts
│   │   ├── userSlice.ts
│   │   └── types.ts
│   │
│   ├── contexts/            # Context API
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── index.ts
│   │
│   ├── utils/               # 工具函数
│   │   ├── format.ts       # 格式化函数
│   │   ├── validation.ts   # 验证函数
│   │   ├── constants.ts    # 常量
│   │   └── index.ts
│   │
│   ├── types/               # TypeScript 类型定义
│   │   ├── api.types.ts
│   │   ├── components.types.ts
│   │   └── index.ts
│   │
│   ├── router/              # 路由配置
│   │   ├── AppRouter.tsx
│   │   ├── routes.tsx
│   │   └── index.ts
│   │
│   ├── styles/              # 全局样式
│   │   ├── index.css
│   │   ├── variables.css   # CSS 变量
│   │   ├── reset.css       # 样式重置
│   │   └── mixins.css      # 样式混入
│   │
│   └── test/                # 测试工具
│       ├── setup.ts
│       ├── utils.tsx
│       └── mocks.ts
│
├── .env                     # 环境变量
├── .env.development
├── .env.production
├── .eslintrc.cjs            # ESLint 配置
├── .prettierrc              # Prettier 配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
├── package.json
└── README.md
```

### 目录结构说明

```tsx
// ==================== 按功能划分 vs 按类型划分 ====================

// ❌ 方式1：按类型划分（小型项目）
src/
  ├── components/
  ├── hooks/
  ├── services/
  └── utils/

// ✅ 方式2：按功能划分（中大型项目，推荐）
src/
  ├── features/
  │   ├── auth/
  │   │   ├── components/
  │   │   ├── hooks/
  │   │   ├── services/
  │   │   └── types/
  │   └── products/
  │       ├── components/
  │       ├── hooks/
  │       ├── services/
  │       └── types/
  └── shared/
      ├── components/
      ├── hooks/
      └── utils/

// ==================== 混合方式（最佳实践） ====================
src/
  ├── features/           # 业务功能模块
  │   ├── auth/
  │   ├── products/
  │   └── orders/
  │
  ├── shared/             # 共享代码
  │   ├── components/     # 通用 UI 组件
  │   ├── hooks/          # 通用 Hooks
  │   ├── utils/          # 工具函数
  │   └── types/          # 通用类型
  │
  ├── pages/              # 页面组件
  ├── router/             # 路由配置
  ├── store/              # 全局状态
  └── styles/             # 全局样式
```

## 代码组织规范

### 组件组织规范

```tsx
// ==================== 组件文件结构 ====================

// ✅ 推荐：每个组件一个文件夹
components/
  └── Button/
      ├── Button.tsx              # 组件实现
      ├── Button.test.tsx         # 测试文件
      ├── Button.types.ts         # 类型定义
      ├── Button.stories.tsx      # Storybook 故事
      ├── index.ts                # 导出
      └── styles.module.css       # 组件样式

// Button.tsx
import styles from './styles.module.css'
import type { ButtonProps } from './Button.types'

const Button = ({ variant = 'primary', size = 'medium', children, ...props }: ButtonProps) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

// Button.types.ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  fullWidth?: boolean
}

// index.ts
export { default } from './Button'
export type { ButtonProps } from './Button.types'
```

### 命名规范

```tsx
// ==================== 文件命名 ====================

// ✅ 组件文件：PascalCase
UserProfile.tsx
NavigationBar.tsx
DataTable.tsx

// ✅ Hooks 文件：camelCase，以 use 开头
useAuth.ts
useFetch.ts
useLocalStorage.ts

// ✅ 工具函数：camelCase
formatDate.ts
validation.ts
apiClient.ts

// ✅ 类型文件：camelCase，以 .types.ts 结尾
user.types.ts
api.types.ts

// ✅ 常量文件：camelCase
constants.ts
apiEndpoints.ts

// ✅ 样式文件：
// - CSS Modules：styles.module.css
// - 全局样式：index.css
// - 组件样式：ComponentName.css

// ==================== 代码命名 ====================

// ✅ 组件命名：PascalCase
const UserProfile = () => { }
const DataTable = () => { }

// ✅ Hook 命名：camelCase，以 use 开头
const useUserData = () => { }
const useApiFetch = () => { }

// ✅ 类型/接口命名：PascalCase
interface UserProps { }
type ButtonVariant = 'primary' | 'secondary'

// ✅ 函数命名：camelCase
const formatDate = (date: Date) => { }
const validateEmail = (email: string) => { }

// ✅ 常量命名：UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3

// ✅ 布尔值命名：以 is/has/can/should 开头
const isLoading = true
const hasError = false
const canSubmit = true
const shouldUpdate = false

// ✅ 事件处理函数：以 handle/on 开头
const handleSubmit = () => { }
const onChange = () => { }
const onClick = () => { }
```

### 导入顺序规范

```tsx
// ==================== 标准导入顺序 ====================

// 1. React 相关
import React, { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'

// 2. 第三方库
import axios from 'axios'
import { debounce } from 'lodash-es'

// 3. 类型导入
import type { User } from './types'

// 4. 绝对路径导入（@/ 别名）
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/format'

// 5. 相对路径导入
import { LocalComponent } from './LocalComponent'
import { localHelper } from './utils'

// 6. 样式导入
import styles from './Component.module.css'
import './global.css'

// ==================== 使用路径别名 ====================
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"]
    }
  }
}

// vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## 状态管理选择

### 状态管理方案对比

| 状态类型 | 推荐方案 | 使用场景 |
|---------|---------|---------|
| 本地 UI 状态 | useState | 单个组件内部状态 |
| 跨组件 UI 状态 | Context + useReducer | 主题、语言、用户信息 |
| 服务端状态 | TanStack Query | API 数据、缓存 |
| 全局应用状态 | Zustand / Jotai | 复杂的全局状态 |
| 表单状态 | React Hook Form | 复杂表单 |

### 状态分层架构

```tsx
// ==================== 状态分层架构 ====================

/*
┌─────────────────────────────────────┐
│     UI State (useState)             │  组件本地状态
│  - 输入框值                          │
│  - 模态框开关                        │
│  - 加载状态                          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Cross-Component State           │  跨组件状态
│  - 主题                              │
│  - 语言                              │
│  - 用户认证                          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Server State (TanStack Query)   │  服务端状态
│  - API 数据                          │
│  - 缓存                              │
│  - 异步操作                          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Global State (Zustand)          │  全局状态
│  - 购物车                            │
│  - 通知                              │
│  - 复杂业务逻辑                      │
└─────────────────────────────────────┘
*/

// ==================== 示例：综合使用多种状态管理 ====================

// 1. 本地状态（useState）
const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // ...
}

// 2. 跨组件状态（Context）
const ThemeContext = createContext({})

const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 3. 服务端状态（TanStack Query）
const UserProfile = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser
  })

  // ...
}

// 4. 全局状态（Zustand）
import create from 'zustand'

const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  clearCart: () => set({ items: [] })
}))

const ShoppingCart = () => {
  const { items, addItem, removeItem } = useCartStore()

  // ...
}
```

### Zustand 全局状态配置

```typescript
// ==================== Zustand Store 配置 ====================
// src/store/index.ts

import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// ==================== 认证状态 ====================
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        setAuth: (user, token) => set({
          user,
          token,
          isAuthenticated: true
        }),

        clearAuth: () => set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      }),
      { name: 'auth-storage' }
    ),
    { name: 'AuthStore' }
  )
)

// ==================== 购物车状态 ====================
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  totalAmount: number
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  devtools(
    (set, get) => ({
      items: [],
      totalAmount: 0,

      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.id === item.id)

        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
            totalAmount: state.totalAmount + item.price
          }
        }

        return {
          items: [...state.items, { ...item, quantity: 1 }],
          totalAmount: state.totalAmount + item.price
        }
      }),

      removeItem: (id) => set((state) => {
        const item = state.items.find(i => i.id === id)
        return {
          items: state.items.filter(i => i.id !== id),
          totalAmount: state.totalAmount - (item?.price || 0) * (item?.quantity || 0)
        }
      }),

      updateQuantity: (id, quantity) => set((state) => {
        const item = state.items.find(i => i.id === id)
        if (!item) return state

        const difference = (quantity - item.quantity) * item.price
        return {
          items: state.items.map(i =>
            i.id === id ? { ...i, quantity } : i
          ),
          totalAmount: state.totalAmount + difference
        }
      }),

      clearCart: () => set({ items: [], totalAmount: 0 })
    }),
    { name: 'CartStore' }
  )
)

// ==================== 使用示例 ====================
const ShoppingCart = () => {
  const { items, totalAmount, addItem, removeItem, updateQuantity } = useCartStore()

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>价格: ¥{item.price}</p>
          <p>数量: {item.quantity}</p>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+1</button>
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-1</button>
          <button onClick={() => removeItem(item.id)}>删除</button>
        </div>
      ))}
      <div>总计: ¥{totalAmount}</div>
    </div>
  )
}
```

## API 调用最佳实践

### API 客户端配置

```typescript
// ==================== Axios 配置 ====================
// src/services/api.ts

import axios, { AxiosError, AxiosInstance } from 'axios'
import { useAuthStore } from '@/store'

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证 token
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加时间戳防止缓存（GET 请求）
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授权，清除登录状态
          useAuthStore.getState().clearAuth()
          window.location.href = '/login'
          break

        case 403:
          console.error('没有权限访问')
          break

        case 404:
          console.error('请求的资源不存在')
          break

        case 500:
          console.error('服务器错误')
          break

        default:
          console.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接')
    } else {
      console.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default apiClient

// ==================== API 服务层 ====================
// src/services/user.service.ts

import apiClient from './api'
import type { User, CreateUserDto, UpdateUserDto } from '@/types'

export const userService = {
  // 获取用户列表
  getUsers: (params?: PaginationParams) => {
    return apiClient.get<ApiResponse<User[]>>('/users', { params })
  },

  // 获取单个用户
  getUser: (id: string) => {
    return apiClient.get<ApiResponse<User>>(`/users/${id}`)
  },

  // 创建用户
  createUser: (data: CreateUserDto) => {
    return apiClient.post<ApiResponse<User>>('/users', data)
  },

  // 更新用户
  updateUser: (id: string, data: UpdateUserDto) => {
    return apiClient.put<ApiResponse<User>>(`/users/${id}`, data)
  },

  // 删除用户
  deleteUser: (id: string) => {
    return apiClient.delete<ApiResponse<void>>(`/users/${id}`)
  },
}

// ==================== 使用 TanStack Query ====================
// src/hooks/useUsers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'

export const useUsers = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id),
    enabled: !!id, // 只有 id 存在时才查询
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.createUser(data),

    onSuccess: () => {
      // 使缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userService.updateUser(id, data),

    onMutate: async ({ id, data }) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['user', id] })

      // 保存之前的数据
      const previousUser = queryClient.getQueryData(['user', id])

      // 乐观更新
      queryClient.setQueryData(['user', id], (old: any) => ({
        ...old,
        data: { ...old.data, ...data }
      }))

      return { previousUser }
    },

    onError: (err, variables, context) => {
      // 出错时回滚
      if (context?.previousUser) {
        queryClient.setQueryData(['user', variables.id], context.previousUser)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// ==================== 在组件中使用 ====================
const UserList = () => {
  const { data, isLoading, error } = useUsers()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>

  return (
    <div>
      {data?.data.map(user => (
        <div key={user.id}>
          <span>{user.name}</span>
          <button onClick={() => deleteUser.mutate(user.id)}>删除</button>
        </div>
      ))}
    </div>
  )
}
```

## 实战案例：完整的企业级项目结构

### 项目配置文件

```typescript
// ==================== tsconfig.json ====================
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path Mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}

// ==================== vite.config.ts ====================
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@tanstack/react-query', 'zustand'],
        },
      },
    },
  },
})
```

### 环境变量配置

```bash
# ==================== .env.development ====================
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=My App (Development)
VITE_ENABLE_DEBUG=true

# ==================== .env.production ====================
VITE_API_BASE_URL=https://api.example.com
VITE_APP_NAME=My App
VITE_ENABLE_DEBUG=false

# ==================== .env.test ====================
VITE_API_BASE_URL=http://test-api.example.com
VITE_APP_NAME=My App (Test)
VITE_ENABLE_DEBUG=true
```

### 错误边界配置

```tsx
// ==================== Error Boundary ====================
// src/components/ErrorBoundary.tsx

import React from 'react'
import { Result, Button } from 'antd'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)

    // 可以发送错误日志到服务器
    // logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <Result
            status="error"
            title="出错了"
            subTitle={this.state.error?.message || '应用程序遇到了错误'}
            extra={[
              <Button type="primary" key="reload" onClick={() => window.location.reload()}>
                刷新页面
              </Button>,
              <Button key="home" onClick={() => window.location.href = '/'}>
                返回首页
              </Button>,
            ]}
          />
        </div>
      )
    }

    return this.props.children
  }
}

// ==================== 使用 Error Boundary ====================
// src/main.tsx

import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import queryClient from './lib/query-client'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
```

### 路由配置

```tsx
// ==================== 路由配置 ====================
// src/router/index.tsx

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy } from 'react'

// 懒加载页面
const Layout = lazy(() => '@/components/layout/Layout')
const HomePage = lazy(() => '@/pages/home/HomePage')
const LoginPage = lazy(() => '@/pages/auth/LoginPage')
const DashboardPage = lazy(() => '@/pages/dashboard/DashboardPage')
const NotFoundPage = lazy(() => '@/pages/error/NotFoundPage')

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
])

// ==================== 路由守卫 ====================
// src/components/ProtectedRoute.tsx

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'

interface Props {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
```

### 完整的项目入口

```tsx
// ==================== App.tsx ====================
// src/App.tsx

import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { router } from './router'
import { useThemeStore } from './store'

const App = () => {
  const { themeMode } = useThemeStore()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App

// ==================== main.tsx ====================
// src/main.tsx

import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import queryClient from './lib/query-client'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClient>
    </ErrorBoundary>
  </React.StrictMode>
)
```

### 配套样式

```css
/* ==================== 全局样式 ==================== */
/* src/styles/index.css */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* 颜色变量 */
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;
  --color-text: #000000d9;
  --color-text-secondary: #00000073;
  --color-border: #d9d9d9;
  --color-bg: #f0f2f5;

  /* 字体 */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  --font-size-base: 14px;
  --line-height: 1.5715;

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 圆角 */
  --border-radius-sm: 4px;
  --border-radius-base: 8px;
  --border-radius-lg: 12px;

  /* 阴影 */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.08);
  --shadow-base: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
  color: var(--color-text);
  background: var(--color-bg);
}

/* 实用类 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gap-xs { gap: var(--spacing-xs); }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }

.mt-xs { margin-top: var(--spacing-xs); }
.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }

.mb-xs { margin-bottom: var(--spacing-xs); }
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }

/* 响应式 */
@media (max-width: 768px) {
  :root {
    --font-size-base: 13px;
  }

  .container {
    padding: 0 var(--spacing-sm);
  }
}
```

## 项目架构最佳实践

### 1. 代码分层原则

```typescript
/*
层次结构：

┌─────────────────────────────────────┐
│  Presentation Layer (UI)             │  展示层
│  - Components                        │
│  - Pages                             │
│  - Hooks                             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Business Logic Layer               │  业务逻辑层
│  - Store (Zustand)                  │
│  - Context                           │
│  - Custom Hooks                      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Data Access Layer                  │  数据访问层
│  - API Services                      │
│  - TanStack Query                   │
│  - Local Storage                     │
└─────────────────────────────────────┘
*/

// ✅ 正确：层次清晰
const UserProfile = () => {
  const { data, isLoading } = useUser(userId) // 数据层
  const { updateUser } = useUserStore() // 业务层

  return <ProfileCard user={data} /> // 展示层
}

// ❌ 错误：混合层次
const BadUserProfile = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${userId}`) // 直接在组件中调用 API
      .then(res => res.json())
      .then(data => setUser(data))
  }, [])

  return <div>{user?.name}</div>
}
```

### 2. 单一职责原则

```tsx
// ❌ 错误：一个组件做太多事情
const BadComponent = () => {
  // 获取数据
  const [data, setData] = useState([])

  // 处理 UI 状态
  const [isOpen, setIsOpen] = useState(false)

  // 处理表单
  const [formData, setFormData] = useState({})

  // 处理路由跳转
  const navigate = useNavigate()

  // ... 所有逻辑混在一起
}

// ✅ 正确：拆分为多个组件
const DataProvider = ({ children }) => {
  // 只负责数据获取
  const { data, isLoading } = useData()
  return <>{children(data)}</>
}

const FormModal = ({ onSubmit }) => {
  // 只负责表单
  return <form>{/* ... */}</form>
}

const Page = () => {
  return (
    <DataProvider>
      {(data) => (
        <>
          <DataList data={data} />
          <FormModal onSubmit={handleSubmit} />
        </>
      )}
    </DataProvider>
  )
}
```

### 3. DRY（Don't Repeat Yourself）原则

```tsx
// ❌ 错误：重复代码
const Component1 = () => {
  return (
    <div>
      <button onClick={() => fetch('/api/1')}>Fetch</button>
    </div>
  )
}

const Component2 = () => {
  return (
    <div>
      <button onClick={() => fetch('/api/2')}>Fetch</button>
    </div>
  )
}

// ✅ 正确：提取公共逻辑
const useFetchData = (endpoint: string) => {
  const fetchData = () => fetch(endpoint)
  return { fetchData }
}

const FetchButton = ({ endpoint }) => {
  const { fetchData } = useFetchData(endpoint)
  return <button onClick={fetchData}>Fetch</button>
}
```

## 总结

本章我们学习了：

✅ React 项目目录结构（按功能划分 vs 按类型划分）
✅ 代码组织规范（命名规范、导入顺序、文件结构）
✅ 状态管理选择（本地、跨组件、服务端、全局状态）
✅ API 调用最佳实践（封装 axios、统一错误处理）
✅ 实战案例：完整的企业级项目结构
✅ 项目架构最佳实践（代码分层、单一职责、DRY）

**企业级 React 项目清单：**

- [ ] 合理的目录结构
- [ ] TypeScript 严格模式
- [ ] ESLint + Prettier 代码规范
- [ ] 路径别名配置
- [ ] 环境变量管理
- [ ] 错误边界
- [ ] 路由懒加载
- [ ] 状态管理方案
- [ ] API 封装
- [ ] 组件库集成
- [ ] 测试配置
- [ ] CI/CD 配置

**技术栈推荐（2024-2026）：**

- ⭐⭐⭐⭐⭐ 构建工具：Vite
- ⭐⭐⭐⭐⭐ 状态管理：Zustand + TanStack Query
- ⭐⭐⭐⭐⭐ UI 库：Ant Design / MUI
- ⭐⭐⭐⭐⭐ 表单：React Hook Form
- ⭐⭐⭐⭐⭐ 路由：React Router v6
- ⭐⭐⭐⭐⭐ 测试：Vitest + Testing Library
- ⭐⭐⭐⭐ 样式方案：CSS Modules / Tailwind CSS
- ⭐⭐⭐⭐ 国际化：i18next

**恭喜你完成了 React 高级主题模块的学习！**

你已经掌握了：
- 第77章：React 性能优化完全指南
- 第78章：React 组件设计模式
- 第79章：React 测试（Vitest + Testing Library）
- 第80章：React 项目架构与最佳实践

现在你已经具备了构建企业级 React 应用的全部能力！继续实践和探索，你将成为一名出色的 React 工程师。
