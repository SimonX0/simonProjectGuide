---
title: React 18+ 完全实战项目
description: 从零构建一个完整的 React 18+ 企业级应用
---

# ：React 完全实战项目 - 企业级任务管理系统

> **项目概述**：本项目是一个功能完整的企业级任务管理系统，涵盖 React 18+、React 19、TypeScript、Zustand、React Router、TanStack Query、React Hook Form 等技术栈的实际应用。
>
> **学习目标**：
> - 掌握 React 18+ 企业级项目的完整开发流程
> - 熟练使用 React 19 新特性（Actions、useOptimistic）
> - 掌握状态管理、路由、表单处理的最佳实践
> - 学会性能优化、测试、部署等企业级开发技能

---

## 项目介绍

### 项目背景

本任务管理系统是一个典型的企业级 SaaS 应用，包含以下核心功能：

- ✅ **任务管理**：创建、编辑、删除、搜索任务
- ✅ **团队协作**：任务分配、成员管理、权限控制
- ✅ **实时更新**：使用 WebSocket 实现实时同步
- ✅ **数据可视化**：任务统计、进度图表
- ✅ **响应式设计**：支持桌面端和移动端

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **框架** | React | 19.x |
| **语言** | TypeScript | 5.x |
| **构建工具** | Vite | 6.x |
| **路由** | React Router | 6.x |
| **状态管理** | Zustand | 5.x |
| **数据获取** | TanStack Query | 5.x |
| **表单** | React Hook Form | 7.x |
| **UI库** | shadcn/ui | latest |
| **样式** | Tailwind CSS | 3.x |
| **测试** | Vitest + Testing Library | latest |
| **代码规范** | ESLint + Prettier | latest |

### 项目结构

```
task-management/
├── src/
│   ├── app/                          # 应用入口
│   │   ├── providers.tsx           # 全局Provider配置
│   │   ├── routes.tsx              # 路由配置
│   │   └── store.ts                # 全局store配置
│   │
│   ├── components/                   # 组件
│   │   ├── ui/                     # shadcn/ui组件
│   │   ├── layout/                 # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── task/                   # 任务相关组件
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskFilters.tsx
│   │   └── dashboard/              # 仪表盘组件
│   │       ├── StatCard.tsx
│   │       ├── TaskChart.tsx
│   │       └── ActivityFeed.tsx
│   │
│   ├── features/                    # 功能模块
│   │   ├── tasks/                  # 任务管理
│   │   │   ├── hooks/
│   │   │   │   ├── useTasks.ts
│   │   │   │   ├── useTaskMutations.ts
│   │   │   │   └── useTaskFilters.ts
│   │   │   ├── api/
│   │   │   │   └── taskApi.ts
│   │   │   ├── components/
│   │   │   └── types/
│   │   │
│   │   ├── auth/                   # 认证模块
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── api/
│   │   │
│   │   └── team/                   # 团队管理
│   │
│   ├── lib/                         # 工具库
│   │   ├── api/                    # API客户端
│   │   │   ├── client.ts          # Axios/fetch封装
│   │   │   └── interceptors.ts    # 请求/响应拦截
│   │   ├── query/                  # TanStack Query配置
│   │   │   └── queryClient.ts
│   │   ├── store/                  # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── taskStore.ts
│   │   │   └── uiStore.ts
│   │   └── utils/                  # 工具函数
│   │       ├── date.ts
│   │       └── validation.ts
│   │
│   ├── hooks/                       # 自定义Hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── pages/                       # 页面组件
│   │   ├── Dashboard.tsx
│   │   ├── Tasks.tsx
│   │   ├── Team.tsx
│   │   └── Settings.tsx
│   │
│   └── types/                       # TypeScript类型
│       ├── api.ts
│       ├── task.ts
│       └── user.ts
│
├── public/                          # 静态资源
├── tests/                           # 测试文件
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── vite.config.ts                   # Vite配置
├── tsconfig.json                    # TypeScript配置
├── tailwind.config.js               # Tailwind配置
└── package.json
```

---

## 第一阶段：项目初始化

### 1.1 创建项目

使用 Vite 创建 React + TypeScript 项目：

```bash
# 创建项目
npm create vite@latest task-management -- --template react-ts

# 进入项目目录
cd task-management

# 安装依赖
npm install

# 安装核心依赖
npm install \
  react@19 react-dom@19 \
  react-router-dom@6 \
  zustand@5 \
  @tanstack/react-query@5 \
  react-hook-form@7 \
  @hookform/resolvers@zod \
  zod

# 安装UI库和样式
npm install \
  tailwindcss@3 \
  @tailwindcss/forms \
  @tailwindcss/typography \
  clsx \
  tailwind-merge

# 安装shadcn/ui
npx shadcn-ui@latest init

# 安装开发依赖
npm install -D \
  @types/react@19 \
  @types/react-dom@19 \
  @vitejs/plugin-react@4 \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  prettier
```

### 1.2 配置 Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@babel/plugin-syntax-import-attributes']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/features': path.resolve(__dirname, './src/features')
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query-vendor': ['@tanstack/react-query']
        }
      }
    }
  }
})
```

### 1.3 配置 TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/features/*": ["./src/features/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 1.4 配置 Tailwind CSS

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/features/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 第二阶段：核心功能实现

### 2.1 全局Provider配置

```typescript
// src/app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { useState } from 'react'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5分钟
        gcTime: 1000 * 60 * 30, // 30分钟
        retry: 1,
        refetchOnWindowFocus: false
      },
      mutations: {
        retry: 1
      }
    }
  }))

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="task-management-theme">
          {children}
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
```

### 2.2 Zustand状态管理

```typescript
// src/lib/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'member'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set((state) => {
          state.user = user
          state.token = token
          state.isAuthenticated = true
        }),
      logout: () =>
        set((state) => {
          state.user = null
          state.token = null
          state.isAuthenticated = false
        })
    })),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
)
```

```typescript
// src/lib/store/taskStore.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assigneeId: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

interface TaskFilter {
  status?: string
  priority?: string
  assigneeId?: string
  search?: string
}

interface TaskState {
  tasks: Task[]
  filters: TaskFilter
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setFilters: (filters: Partial<TaskFilter>) => void
  clearFilters: () => void
}

export const useTaskStore = create<TaskState>()(
  immer((set) => ({
    tasks: [],
    filters: {},
    setTasks: (tasks) => set({ tasks }),
    addTask: (task) =>
      set((state) => {
        state.tasks.push(task)
      }),
    updateTask: (id, updates) =>
      set((state) => {
        const index = state.tasks.findIndex((t) => t.id === id)
        if (index !== -1) {
          Object.assign(state.tasks[index], updates)
        }
      }),
    deleteTask: (id) =>
      set((state) => {
        state.tasks = state.tasks.filter((t) => t.id !== id)
      }),
    setFilters: (filters) =>
      set((state) => {
        state.filters = { ...state.filters, ...filters }
      }),
    clearFilters: () =>
      set((state) => {
        state.filters = {}
      })
  }))
)
```

### 2.3 TanStack Query数据获取

```typescript
// src/features/tasks/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '../api/taskApi'
import { useTaskStore } from '@/lib/store/taskStore'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'sonner'

export function useTasks() {
  const queryClient = useQueryClient()
  const { token } = useAuthStore()
  const filters = useTaskStore((state) => state.filters)

  const {
    data: tasks,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskApi.getTasks(filters, token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 2 // 2分钟
  })

  const createMutation = useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('任务创建成功')
    },
    onError: (error) => {
      toast.error('创建任务失败')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      taskApi.updateTask(id, updates, token!),
    onMutate: async ({ id, updates }) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      // 保存之前的数据
      const previousTasks = queryClient.getQueryData(['tasks', filters])

      // 乐观更新
      queryClient.setQueryData(['tasks', filters], (old: any) =>
        old?.map((task: Task) =>
          task.id === id ? { ...task, ...updates } : task
        )
      )

      return { previousTasks }
    },
    onError: (error, variables, context) => {
      // 回滚
      queryClient.setQueryData(['tasks', filters], context?.previousTasks)
      toast.error('更新任务失败')
    },
    onSettled: () => {
      // 重新获取数据
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('任务删除成功')
    },
    onError: () => {
      toast.error('删除任务失败')
    }
  })

  return {
    tasks,
    isLoading,
    error,
    refetch,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate
  }
}
```

### 2.4 React 19 Actions使用

```typescript
// src/features/tasks/components/TaskForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useActionState } from 'react'
import { createTask } from '../actions/taskActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'

const taskSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().min(1, '请选择截止日期'),
  assigneeId: z.string().min(1, '请选择负责人')
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function TaskForm({ onSuccess, onCancel }: TaskFormProps) {
  const [state, formAction, isPending] = useActionState(createTask, null)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema)
  })

  const onSubmit = async (data: TaskFormValues) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })

    const result = await formAction(formData)
    if (result?.success) {
      toast.success('任务创建成功')
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {state?.error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          任务标题
        </label>
        <Input
          id="title"
          placeholder="请输入任务标题"
          {...register('title')}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          任务描述
        </label>
        <Textarea
          id="description"
          placeholder="请输入任务描述"
          rows={4}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium mb-2">
            优先级
          </label>
          <Select onValueChange={(value) => register('priority').onChange({ target: { value } })}>
            <SelectTrigger>
              <SelectValue placeholder="选择优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">低</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="high">高</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium mb-2">
            截止日期
          </label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate')}
            aria-invalid={!!errors.dueDate}
          />
          {errors.dueDate && (
            <p className="text-sm text-destructive mt-1">{errors.dueDate.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? '创建中...' : '创建任务'}
        </Button>
      </div>
    </form>
  )
}
```

### 2.5 自定义Hooks

```typescript
// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}
```

```typescript
// src/hooks/useMediaQuery.ts
import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}
```

---

## 第三阶段：UI组件开发

### 3.1 任务卡片组件

```typescript
// src/features/tasks/components/TaskCard.tsx
import { Task } from '../types/task'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, Trash2, Edit } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useOptimistic, useTransition } from 'react'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

export function TaskCard({ task, onEdit, onDelete, onUpdate }: TaskCardProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticTask, addOptimisticTask] = useOptimistic(
    task,
    (state: Task, newStatus: string) => ({
      ...state,
      status: newStatus as any
    })
  )

  const handleStatusChange = (newStatus: string) => {
    addOptimisticTask(newStatus)
    startTransition(() => {
      onUpdate(task.id, { status: newStatus })
    })
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-800 hover:bg-green-200',
    medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    high: 'bg-red-100 text-red-800 hover:bg-red-200'
  }

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{optimisticTask.title}</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {optimisticTask.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge className={priorityColors[optimisticTask.priority]}>
            {optimisticTask.priority === 'low' && '低优先级'}
            {optimisticTask.priority === 'medium' && '中优先级'}
            {optimisticTask.priority === 'high' && '高优先级'}
          </Badge>
          <Badge className={statusColors[optimisticTask.status]}>
            {optimisticTask.status === 'todo' && '待办'}
            {optimisticTask.status === 'in-progress' && '进行中'}
            {optimisticTask.status === 'done' && '已完成'}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(optimisticTask.dueDate), {
                addSuffix: true
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{optimisticTask.assigneeId}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 第四阶段：测试与部署

### 4.1 Vitest单元测试

```typescript
// tests/unit/components/TaskCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskCard } from '@/features/tasks/components/TaskCard'
import '@testing-library/jest-dom'

const mockTask = {
  id: '1',
  title: '测试任务',
  description: '这是一个测试任务',
  status: 'todo',
  priority: 'high',
  assigneeId: 'user1',
  dueDate: '2026-12-31',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01'
}

describe('TaskCard', () => {
  it('should render task information correctly', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onUpdate = vi.fn()

    render(
      <TaskCard
        task={mockTask}
        onEdit={onEdit}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
    )

    expect(screen.getByText('测试任务')).toBeInTheDocument()
    expect(screen.getByText('这是一个测试任务')).toBeInTheDocument()
    expect(screen.getByText('高优先级')).toBeInTheDocument()
  })

  it('should call onDelete when delete button is clicked', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onUpdate = vi.fn()

    render(
      <TaskCard
        task={mockTask}
        onEdit={onEdit}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
    )

    const deleteButton = screen.getAllByRole('button')[1]
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('1')
    })
  })
})
```

### 4.2 CI/CD配置

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 项目总结

### 技术亮点

1. **React 19 新特性**：使用 Actions、useOptimistic、use() 等最新特性
2. **TypeScript 全覆盖**：完整的类型定义和类型安全
3. **现代化状态管理**：Zustand + TanStack Query 组合
4. **优秀的开发体验**：Vite + HMR + ESLint + Prettier
5. **完整的测试覆盖**：单元测试 + 集成测试
6. **CI/CD自动化**：GitHub Actions 自动化部署

### 学习收获

通过本项目，你将掌握：

- ✅ React 18/19 核心概念和最佳实践
- ✅ 企业级项目架构设计
- ✅ 状态管理和数据获取方案
- ✅ 性能优化技巧
- ✅ 测试和部署流程
- ✅ 团队协作和代码规范

### 扩展建议

完成本项目后，可以继续学习：

- **高级特性**：微前端架构（qiankun）、SSR（Next.js）
- **性能优化**：代码分割、懒加载、缓存策略
- **安全防护**：XSS防御、CSRF防护、权限控制
- **监控运维**：错误监控、性能监控、日志分析

---

**下一步学习**：建议继续学习 [Next.js 技术栈](../../nextjs/) 了解全栈开发。
