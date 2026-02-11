---
title: 前端高级面试题 - 实战项目面试题
---

# 前端高级面试题 - 实战项目面试题

## 项目一：Vue3 企业级后台管理系统

### Q1: 如何实现动态路由和权限控制？

**参考答案**：

动态路由和权限控制是企业级系统的核心功能。

**1. 路由守卫实现**

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const hasToken = userStore.token

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 判断是否已获取用户信息
      if (userStore.userId) {
        next()
      } else {
        try {
          // 获取用户信息和权限
          await userStore.getUserInfo()

          // 根据权限生成动态路由
          const accessRoutes = await permissionStore.generateRoutes()

          // 动态添加路由
          accessRoutes.forEach((route) => {
            router.addRoute(route)
          })

          // 确保添加完成后再跳转
          next({ ...to, replace: true })
        } catch (error) {
          // 获取用户信息失败，清除token重新登录
          await userStore.resetToken()
          ElMessage.error('获取用户信息失败，请重新登录')
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    // 未登录，判断是否在白名单
    if (to.meta.whiteList) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
```

**2. 动态路由生成**

```typescript
// src/stores/permission.ts
import { defineStore } from 'pinia'
import Layout from '@/layouts/DefaultLayout.vue'

// 使用 import.meta.glob 动态导入组件
const modules = import.meta.glob('../views/**/*.vue')

// 将后端路由转换为 Vue Router 路由
function filterAsyncRoutes(routes: RouteConfig[]) {
  const res: RouteRecordRaw[] = []

  routes.forEach((route) => {
    const tmp: any = { ...route }

    // 处理组件
    if (tmp.component === 'Layout') {
      tmp.component = Layout
    } else {
      // 动态导入组件
      const component = tmp.component
      tmp.component = modules[`../views/${component}.vue`]
    }

    // 递归处理子路由
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
      // 从后端获取路由配置
      const { data } = await getRouters()

      // 转换为 Vue Router 格式
      const accessedRoutes = filterAsyncRoutes(data)

      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat(accessedRoutes)

      return accessedRoutes
    },
  },
})
```

**3. 后端路由数据格式**

```json
{
  "code": 200,
  "data": [
    {
      "path": "/system",
      "component": "Layout",
      "redirect": "/system/user",
      "meta": { "title": "系统管理", "icon": "setting" },
      "children": [
        {
          "path": "user",
          "component": "system/user/index",
          "meta": {
            "title": "用户管理",
            "icon": "user",
            "roles": ["admin", "editor"]
          }
        },
        {
          "path": "role",
          "component": "system/role/index",
          "meta": {
            "title": "角色管理",
            "icon": "user-group",
            "roles": ["admin"]
          }
        }
      ]
    }
  ]
}
```

**4. 按钮级权限控制**

```typescript
// src/composables/usePermission.ts
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function usePermission() {
  const userStore = useUserStore()

  // 检查是否有指定权限
  const hasPermission = (permission: string | string[]) => {
    if (Array.isArray(permission)) {
      return permission.some((p) => userStore.permissions.includes(p))
    }
    return userStore.permissions.includes(permission)
  }

  // 检查是否有指定角色
  const hasRole = (role: string | string[]) => {
    if (Array.isArray(role)) {
      return role.some((r) => userStore.roles.includes(r))
    }
    return userStore.roles.includes(role)
  }

  // 是否为管理员
  const isAdmin = computed(() => userStore.roles.includes('admin'))

  return {
    hasPermission,
    hasRole,
    isAdmin,
  }
}
```

**5. 自定义权限指令**

```typescript
// src/directive/permission/index.ts
import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()

    if (value && value instanceof Array) {
      const hasPermission = userStore.permissions.some((perm) =>
        value.includes(perm)
      )

      if (!hasPermission) {
        // 没有权限，移除元素
        el.parentNode?.removeChild(el)
      }
    }
  },
}

export default permission
```

**使用示例**：

```vue
<template>
  <!-- 路由级权限 -->
  <router-view v-if="hasPermission(['user:view'])" />

  <!-- 按钮级权限 -->
  <el-button
    v-permission="['user:create']"
    type="primary"
    @click="handleCreate"
  >
    新建用户
  </el-button>

  <!-- 角色级权限 -->
  <el-button
    v-if="hasRole(['admin'])"
    @click="handleDelete"
  >
    删除
  </el-button>
</template>

<script setup lang="ts">
import { usePermission } from '@/composables/usePermission'

const { hasPermission, hasRole } = usePermission()
</script>
```

**架构要点**：
- **路由懒加载**：使用 `import.meta.glob` 实现动态导入
- **权限分层**：路由级 + 按钮级 + 数据级权限
- **动态添加**：用户登录后根据权限动态添加路由
- **安全边界**：前端权限 + 后端权限双重保障

---

### Q2: 如何设计Pinia状态管理和数据持久化？

**参考答案**：

Pinia 是 Vue 3 官方推荐的状态管理库，设计良好的状态管理能极大提升代码可维护性。

**1. 用户状态管理**

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import { login, logout, getUserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

interface UserState {
  token: string
  userId: string
  username: string
  avatar: string
  roles: string[]
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken() || '',
    userId: '',
    username: '',
    avatar: '',
    roles: [],
    permissions: [],
  }),

  getters: {
    // 是否登录
    isLoggedIn: (state) => !!state.token,

    // 是否有指定权限
    hasPermission: (state) => (permission: string) => {
      return state.permissions.includes(permission)
    },

    // 是否有指定角色
    hasRole: (state) => (role: string) => {
      return state.roles.includes(role)
    },

    // 用户信息摘要
    userInfo: (state) => ({
      username: state.username,
      avatar: state.avatar,
      roles: state.roles,
    }),
  },

  actions: {
    // 登录
    async login(loginForm: LoginForm) {
      const { data } = await login(loginForm)
      this.token = data.token
      setToken(data.token)
    },

    // 获取用户信息
    async getUserInfo() {
      const { data } = await getUserInfo()
      this.userId = data.userId
      this.username = data.username
      this.avatar = data.avatar
      this.roles = data.roles
      this.permissions = data.permissions
    },

    // 登出
    async logout() {
      await logout()
      this.resetToken()
    },

    // 重置token
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

**2. 持久化存储**

```typescript
// src/stores/plugins/persist.ts
import { PiniaPluginContext } from 'pinia'

// 持久化插件
export function persistPlugin({ store }: PiniaPluginContext) {
  // 从 localStorage 恢复状态
  const savedState = localStorage.getItem(`pinia-${store.$id}`)
  if (savedState) {
    store.$patch(JSON.parse(savedState))
  }

  // 订阅状态变化，保存到 localStorage
  store.$subscribe((mutation, state) => {
    const toSave = {
      // 只持久化需要保存的字段
      token: state.token,
      username: state.username,
      avatar: state.avatar,
    }
    localStorage.setItem(`pinia-${store.$id}`, JSON.stringify(toSave))
  })
}

// 注册插件
const pinia = createPinia()
pinia.use(persistPlugin)
```

**3. 模块化状态管理**

```typescript
// src/stores/modules/app.ts
export const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: true,
      withoutAnimation: false,
    },
    device: 'desktop',
    size: 'default',
    theme: 'light',
  }),

  actions: {
    toggleSidebar() {
      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = false
    },

    closeSidebar(withoutAnimation = false) {
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation
    },

    setDevice(device: string) {
      this.device = device
    },

    setSize(size: string) {
      this.size = size
    },

    setTheme(theme: string) {
      this.theme = theme
    },
  },
})

// src/stores/modules/settings.ts
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    title: 'Vue3 管理系统',
    fixedHeader: false,
    tagsView: true,
    sidebarLogo: true,
  }),

  actions: {
    changeSetting(payload: { key: string; value: any }) {
      const { key, value } = payload
      this[key] = value
    },
  },
})
```

**4. 组合式Store**

```typescript
// src/stores/index.ts
import { createPinia } from 'pinia'

const pinia = createPinia()

export function setupStore(app: App) {
  app.use(pinia)
}

export * from './modules/user'
export * from './modules/permission'
export * from './modules/app'
export * from './modules/settings'
```

**5. 在组件中使用**

```vue
<template>
  <div>
    <p>用户：{{ username }}</p>
    <p>角色：{{ roles.join(', ') }}</p>
    <el-button @click="handleLogout">登出</el-button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/modules/app'

// 使用 store
const userStore = useUserStore()
const appStore = useAppStore()

// 解构 store 保持响应性
const { username, roles } = storeToRefs(userStore)

// 调用 action
const handleLogout = () => {
  userStore.logout()
}
</script>
```

**最佳实践**：
- **模块化**：按功能模块拆分store
- **类型安全**：完整的TypeScript类型定义
- **持久化**：使用插件实现自动持久化
- **计算属性**：使用getters封装复杂逻辑
- **解构使用**：使用 `storeToRefs` 保持响应性

---

## 项目二：React 任务管理系统

### Q3: 如何使用React 19新特性（Actions、useOptimistic）？

**参考答案**：

React 19 引入了多个强大的新特性，能显著提升开发体验和用户体验。

**1. Server Actions**

```typescript
// app/actions/taskActions.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// 验证schema
const createTaskSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().min(1, '请选择截止日期'),
  assigneeId: z.string().min(1, '请选择负责人'),
})

export type CreateTaskState = {
  errors?: {
    title?: string[]
    description?: string[]
  }
  message?: string
  success?: boolean
}

// 创建任务Action
export async function createTask(
  prevState: CreateTaskState,
  formData: FormData
): Promise<CreateTaskState> {
  // 获取当前用户
  const session = await auth()
  if (!session?.user?.id) {
    return { message: '请先登录' }
  }

  // 验证表单数据
  const validatedFields = createTaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    priority: formData.get('priority'),
    dueDate: formData.get('dueDate'),
    assigneeId: formData.get('assigneeId'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '验证失败',
    }
  }

  try {
    // 创建任务
    await prisma.task.create({
      data: {
        ...validatedFields.data,
        userId: session.user.id,
      },
    })

    // 重新验证缓存
    revalidatePath('/dashboard/tasks')

    return {
      success: true,
      message: '任务创建成功',
    }
  } catch (error) {
    return {
      message: '创建失败，请重试',
    }
  }
}

// 更新任务状态
export async function updateTaskStatus(
  taskId: string,
  status: 'todo' | 'in-progress' | 'done'
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('未登录')
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status },
  })

  revalidatePath('/dashboard/tasks')
  revalidatePath(`/dashboard/tasks/${taskId}`)
}
```

**2. 在组件中使用Actions**

```typescript
// src/features/tasks/components/TaskForm.tsx
'use client'

import { useActionState } from 'react'
import { createTask } from '@/app/actions/taskActions'

export function TaskForm() {
  const [state, formAction, isPending] = useActionState(
    createTask,
    null
  )

  return (
    <form action={formAction} className="space-y-4">
      {/* 显示错误信息 */}
      {state?.error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {state.error}
        </div>
      )}

      {/* 显示字段错误 */}
      {state?.errors?.title && (
        <p className="text-sm text-destructive mt-1">
          {state.errors.title}
        </p>
      )}

      <div>
        <label htmlFor="title">任务标题</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          aria-invalid={!!state?.errors?.title}
        />
      </div>

      <div>
        <label htmlFor="description">描述</label>
        <textarea
          id="description"
          name="description"
          rows={4}
        />
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? '创建中...' : '创建任务'}
      </button>
    </form>
  )
}
```

**3. useOptimistic 乐观更新**

```typescript
// src/features/tasks/components/TaskCard.tsx
import { useOptimistic, useTransition } from 'react'

interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
}

export function TaskCard({ task, onUpdate }: { task: Task; onUpdate: (id: string, updates: Partial<Task>) => void }) {
  const [isPending, startTransition] = useTransition()

  // 乐观更新状态
  const [optimisticTask, addOptimisticTask] = useOptimistic(
    task,
    (state: Task, newStatus: string) => ({
      ...state,
      status: newStatus as Task['status'],
    })
  )

  const handleStatusChange = (newStatus: string) => {
    // 立即更新UI
    addOptimisticTask(newStatus)

    // 异步更新服务器
    startTransition(async () => {
      await onUpdate(task.id, { status: newStatus })
    })
  }

  return (
    <Card>
      <CardContent>
        <h3>{optimisticTask.title}</h3>

        <select
          value={optimisticTask.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isPending}
        >
          <option value="todo">待办</option>
          <option value="in-progress">进行中</option>
          <option value="done">已完成</option>
        </select>

        {isPending && <span className="text-sm text-gray-500">保存中...</span>}
      </CardContent>
    </Card>
  )
}
```

**4. use() 读取Promise**

```typescript
// src/components/TaskDetail.tsx
import { use, Suspense } from 'react'

// 获取单个任务（返回Promise）
async function getTask(id: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`)
  return response.json()
}

export function TaskDetail({ taskId }: { taskId: string }) {
  // use() 读取Promise，自动处理loading状态
  const task = use(getTask(taskId))

  return (
    <div>
      <h1>{task.title}</h1>
      <p>{task.description}</p>
    </div>
  )
}

// 配合Suspense使用
export function TaskPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <TaskDetail taskId={params.id} />
    </Suspense>
  )
}
```

**5. use() 读取Context**

```typescript
// 创建Context（初始值可以是Promise）
const ThemeContext = createContext<Promise<string>>(Promise.resolve('light'))

export function ThemedComponent() {
  // use() 可以直接读取Context中的Promise
  const theme = use(ThemeContext)

  return <div className={theme}>当前主题：{theme}</div>
}
```

**关键点**：
- **Actions**：简化表单提交，自动处理pending状态
- **useOptimistic**：乐观更新，提升用户体验
- **use()**：统一读取Promise和Context的新API
- **渐进式采用**：新特性可以逐步在现有项目中使用

---

### Q4: 如何使用Zustand + TanStack Query管理状态？

**参考答案**：

Zustand 负责客户端状态，TanStack Query 负责服务器状态，分工明确。

**1. Zustand Store配置**

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
        }),
    })),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)

// src/lib/store/taskStore.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

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
      }),
  }))
)
```

**2. TanStack Query配置**

```typescript
// src/lib/query/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分钟
      gcTime: 1000 * 60 * 30, // 30分钟（原cacheTime）
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

**3. 数据获取Hooks**

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

  // 查询任务
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskApi.getTasks(filters, token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 2,
  })

  // 创建任务
  const createMutation = useMutation({
    mutationFn: taskApi.createTask,
    onMutate: async (newTask) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      // 保存之前的数据
      const previousTasks = queryClient.getQueryData(['tasks', filters])

      // 乐观更新
      queryClient.setQueryData(['tasks', filters], (old: any) =>
        old ? [...old, { ...newTask, id: `temp-${Date.now()}` }] : [newTask]
      )

      return { previousTasks }
    },
    onError: (error, variables, context) => {
      // 回滚
      queryClient.setQueryData(['tasks', filters], context?.previousTasks)
      toast.error('创建任务失败')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('任务创建成功')
    },
  })

  // 更新任务
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      taskApi.updateTask(id, updates, token!),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
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
      queryClient.setQueryData(['tasks', filters], context?.previousTasks)
      toast.error('更新任务失败')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // 删除任务
  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id, token!),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData(['tasks', filters])

      // 乐观更新
      queryClient.setQueryData(['tasks', filters], (old: any) =>
        old?.filter((task: Task) => task.id !== id)
      )

      return { previousTasks }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['tasks', filters], context?.previousTasks)
      toast.error('删除任务失败')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('任务删除成功')
    },
  })

  return {
    tasks,
    isLoading,
    error,
    refetch,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
  }
}
```

**4. 在组件中使用**

```typescript
// src/features/tasks/components/TaskList.tsx
import { useTasks } from '../hooks/useTasks'

export function TaskList() {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks()

  if (isLoading) {
    return <div>加载中...</div>
  }

  return (
    <div>
      {tasks?.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={(updates) => updateTask({ id: task.id, updates })}
          onDelete={() => deleteTask(task.id)}
        />
      ))}
    </div>
  )
}
```

**最佳实践**：
- **职责分离**：Zustand 管理UI状态，TanStack Query 管理服务器状态
- **乐观更新**：提升用户体验，减少等待感
- **错误处理**：统一的错误处理和回滚机制
- **缓存策略**：合理设置 staleTime 和 gcTime
- **自动刷新**：invalidateQueries 自动刷新数据

---

## 项目三：Next.js 全栈应用

### Q5: 如何使用Prisma + Server Actions构建全栈应用？

**参考答案**：

Prisma 提供类型安全的数据库访问，Server Actions 简化服务端逻辑。

**1. Prisma Schema设计**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户模型
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  projects      Project[]
  sessions      Session[]
  accounts      Account[]

  @@index([email])
}

enum Role {
  USER
  ADMIN
}

// 项目模型
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks       Task[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

// 任务模型
model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  projectId   String
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assigneeId  String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([projectId])
  @@index([assigneeId])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

**2. Prisma Client配置**

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**3. Server Actions实现**

```typescript
// app/actions/projects.ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

// 验证schema
const createProjectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(100),
  description: z.string().max(500).optional(),
})

export type ProjectState = {
  errors?: {
    name?: string[]
    description?: string[]
  }
  message?: string
  success?: boolean
}

// 创建项目
export async function createProject(
  prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const session = await auth()

  if (!session?.user?.id) {
    return { message: '请先登录' }
  }

  // 验证表单
  const validatedFields = createProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '验证失败',
    }
  }

  try {
    // 创建项目
    await prisma.project.create({
      data: {
        ...validatedFields.data,
        userId: session.user.id,
      },
    })

    // 重新验证缓存
    revalidatePath('/dashboard/projects')

    return {
      success: true,
      message: '项目创建成功',
    }
  } catch (error) {
    return {
      message: '创建失败，请重试',
    }
  }
}

// 更新项目
export async function updateProject(
  id: string,
  data: { name?: string; description?: string }
) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('未登录')
  }

  // 检查权限
  const project = await prisma.project.findUnique({
    where: { id },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error('无权操作')
  }

  // 更新项目
  const updated = await prisma.project.update({
    where: { id },
    data,
  })

  revalidatePath('/dashboard/projects')
  revalidatePath(`/dashboard/projects/${id}`)

  return updated
}

// 删除项目
export async function deleteProject(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('未登录')
  }

  // 检查权限
  const project = await prisma.project.findUnique({
    where: { id },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error('无权操作')
  }

  // 删除项目（级联删除相关任务）
  await prisma.project.delete({
    where: { id },
  })

  revalidatePath('/dashboard/projects')

  return { success: true }
}
```

**4. API Routes（可选）**

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/projects - 获取项目列表
export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''

  // 构建查询
  const where = {
    userId: session.user.id,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  // 获取总数
  const total = await prisma.project.count({ where })

  // 获取项目
  const projects = await prisma.project.findMany({
    where,
    include: {
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  return NextResponse.json({
    projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  })
}

// POST /api/projects - 创建项目
export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = await request.json()

  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description,
      userId: session.user.id,
    },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  })

  return NextResponse.json(project, { status: 201 })
}
```

**5. 在页面中使用**

```typescript
// app/dashboard/projects/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { CreateProjectButton } from '@/components/projects/create-project-button'

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const limit = 12

  // 服务端直接获取数据
  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  const total = await prisma.project.count({
    where: {
      userId: session.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">我的项目</h1>
          <p className="text-gray-600 mt-2">共 {total} 个项目</p>
        </div>
        <CreateProjectButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/projects/${project.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="text-sm text-gray-500">
              {project._count.tasks} 个任务
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

**关键点**：
- **类型安全**：Prisma 自动生成类型定义
- **验证**：Zod schema 验证表单数据
- **权限检查**：每个操作都验证用户身份和权限
- **缓存管理**：revalidatePath 刷新缓存
- **服务端渲染**：在页面中直接使用 Prisma 查询数据

---

### Q6: 如何实现NextAuth.js认证和会话管理？

**参考答案**：

NextAuth.js 是 Next.js 的完整认证解决方案。

**1. NextAuth配置**

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt', // 使用JWT策略
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 凭证登录（用户名密码）
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码')
        }

        // 查找用户
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('用户不存在或密码错误')
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error '用户不存在或密码错误')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      // 初始化时添加用户信息到token
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // 更新会话时刷新token
      if (trigger === 'update') {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        })

        if (freshUser) {
          token.name = freshUser.name
          token.email = freshUser.email
          token.image = freshUser.image
          token.role = freshUser.role
        }
      }

      return token
    },

    async session({ session, token }) {
      // 将token信息添加到session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}
```

**2. API路由**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

**3. 类型扩展**

```typescript
// types/next-auth.d.ts
import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
```

**4. 客户端使用**

```typescript
// app/(auth)/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    try {
      const result = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
      })

      if (result?.error) {
        setError('邮箱或密码错误')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-2xl font-bold">登录</h1>

        {error && (
          <div className="bg-red-50 text-red-500 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email">邮箱</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password">密码</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? '登录中...' : '登录'}
        </button>

        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        >
          使用 Google 登录
        </button>
      </form>
    </div>
  )
}
```

**5. 服务端使用**

```typescript
// app/dashboard/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div>
      <header>
        <p>欢迎，{session.user.name}</p>
        <p>角色：{session.user.role}</p>
      </header>
      <main>{children}</main>
    </div>
  )
}
```

**6. 中间件保护路由**

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // 保护 /dashboard 下的所有路由
      if (req.nextUrl.pathname.startsWith('/dashboard')) {
        return !!token
      }
      return true
    },
  },
})

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

**最佳实践**：
- **多种认证方式**：OAuth + Credentials
- **类型安全**：扩展 TypeScript 类型定义
- **会话策略**：JWT vs Database Session 根据需求选择
- **路由保护**：中间件 + 服务端检查双重保护
- **错误处理**：友好的错误提示

---

## 本章小结

### 前端项目核心要点

| 项目 | 技术栈 | 核心能力 |
|------|--------|---------|
| **Vue3企业后台** | Vue3 + Pinia + Element Plus | 动态路由、权限控制 |
| **React任务管理** | React 19 + Zustand + TanStack Query | Actions、乐观更新 |
| **Next.js全栈** | Next.js 15 + Prisma + Server Actions | 全栈开发、类型安全 |

### 面试准备重点

**技术深度**：
- Vue3: Composition API、动态路由、Pinia状态管理
- React: React 19新特性、Hooks自定义、性能优化
- Next.js: Server Actions、Prisma、认证授权

**架构能力**：
- 状态管理方案设计
- 权限系统设计
- 全栈架构设计

**工程实践**：
- 组件封装和复用
- TypeScript类型定义
- 测试和部署

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
