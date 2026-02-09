# 路由中间件与守卫

## 路由中间件与守卫

> **为什么要学这一章?**
>
> 路由中间件和守卫是保护应用安全、控制访问权限的关键机制。Nuxt 3提供了强大的中间件系统,支持全局、匿名、命名中间件,让你能够灵活地实现认证、权限验证、页面过渡等功能。掌握这些功能是构建生产级应用的基础。
>
> **学习目标**:
>
> - 理解路由中间件的工作原理
> - 掌握全局和匿名中间件的使用
> - 学会实现认证和权限系统
> - 理解中间件的执行顺序和优先级
> - 能够构建完整的权限管理系统

---

### 中间件创建

#### 中间件基础

中间件是在路由导航前执行的函数,可以用于:
- 身份验证
- 权限检查
- 数据预取
- 页面过渡
- 日志记录

```typescript
// middleware/auth.ts
// 定义命名中间件
export default defineNuxtRouteMiddleware((to, from) => {
  // to: 目标路由
  // from: 来源路由

  console.log('导航从', from.path, '到', to.path)

  // 检查用户是否登录
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated.value) {
    // 未登录,重定向到登录页
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath // 登录后返回原页面
      }
    })
  }
})
```

#### 匿名中间件

```vue
<!-- pages/admin/dashboard.vue -->
<script setup lang="ts>
// 直接在页面中定义匿名中间件
definePageMeta({
  middleware: defineNuxtRouteMiddleware((to, from) => {
    // 检查是否是管理员
    const { user } = useAuth()

    if (user.value?.role !== 'admin') {
      abortNavigation('您没有访问权限')
    }
  })
})
</script>
```

#### 全局中间件

```typescript
// middleware/global.ts
// 添加前缀使中间件在所有路由上执行
export default defineNuxtRouteMiddleware((to, from) => {
  console.log('全局中间件执行:', to.path)

  // 记录页面访问
  if (process.client) {
    // 发送分析数据
    useTrack('page_view', {
      path: to.path,
      referrer: from.path
    })
  }
})
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 注册全局中间件(不需要在页面中使用)
  routeRules: {
    '/admin/**': {
      // 应用中间件
      middleware: ['auth', 'admin']
    }
  }
})
```

---

### 路由守卫

#### 页面级守卫

```vue
<!-- pages/profile/settings.vue -->
<script setup lang="ts>
// 定义页面元数据
definePageMeta({
  // 使用命名中间件
  middleware: ['auth'],

  // 或使用匿名中间件
  middleware: defineNuxtRouteMiddleware((to) => {
    console.log('访问设置页面')
  }),

  // 页面布局
  layout: 'dashboard',

  // 页面key(控制缓存)
  key: (route) => route.fullPath,

  // 页面过渡
  pageTransition: {
    name: 'slide',
    mode: 'out-in'
  }
})
</script>
```

#### 组件级守卫

```vue
<!-- components/ProtectedRoute.vue -->
<template>
  <slot v-if="isAllowed" />
  <div v-else class="access-denied">
    <h1>访问被拒绝</h1>
    <p>您没有访问此页面的权限</p>
    <button @click="goBack">返回</button>
  </div>
</template>

<script setup lang="ts>
const props = defineProps<{
  requiredRole?: string
  requiredPermission?: string
}>()

const { user, hasPermission } = useAuth()
const route = useRoute()
const router = useRouter()

const isAllowed = computed(() => {
  // 检查角色
  if (props.requiredRole && user.value?.role !== props.requiredRole) {
    return false
  }

  // 检查权限
  if (props.requiredPermission && !hasPermission(props.requiredPermission)) {
    return false
  }

  return true
})

const goBack = () => {
  router.back()
}

// 页面加载前检查
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    const confirm = window.confirm('您有未保存的更改,确定要离开吗?')
    if (!confirm) {
      next(false)
      return
    }
  }
  next()
})
</script>
```

---

### 认证系统

#### 认证中间件

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // 获取认证状态
  const { isAuthenticated, user } = useAuth()

  // 需要登录的路由
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some(path =>
    to.path.startsWith(path)
  )

  // 如果是受保护路由但未登录
  if (isProtectedRoute && !isAuthenticated.value) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  }

  // 如果已登录但访问登录/注册页,重定向到首页
  if (isAuthenticated.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard')
  }
})
```

#### 认证Store

```typescript
// stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = useCookie<string | null>('auth-token', {
    maxAge: 60 * 60 * 24 * 7, // 7天
    secure: true,
    sameSite: 'lax'
  })

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || 'guest')
  const userPermissions = computed(() => user.value?.permissions || [])

  // Actions
  const login = async (credentials: LoginCredentials) => {
    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })

    if (error.value) {
      throw new Error('登录失败')
    }

    if (data.value) {
      token.value = data.value.token
      user.value = data.value.user

      // 设置默认Authorization头
      await fetchUser()
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
    } finally {
      token.value = null
      user.value = null
      await navigateTo('/login')
    }
  }

  const fetchUser = async () => {
    if (!token.value) return null

    const { data } = await useFetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (data.value) {
      user.value = data.value
    }

    return data.value
  }

  const hasPermission = (permission: string): boolean => {
    return userPermissions.value.includes(permission)
  }

  const hasRole = (role: string): boolean => {
    return userRole.value === role
  }

  // 初始化时获取用户信息
  const init = async () => {
    if (token.value && !user.value) {
      await fetchUser()
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    userRole,
    userPermissions,
    login,
    logout,
    fetchUser,
    hasPermission,
    hasRole,
    init
  }
})
```

---

### 权限系统

#### 角色检查中间件

```typescript
// middleware/admin.ts
export default defineNuxtRouteMiddleware(() => {
  const { user, isAuthenticated } = useAuth()

  // 必须先登录
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  // 检查是否是管理员
  if (user.value?.role !== 'admin') {
    abortNavigation('需要管理员权限')
  }
})
```

#### 权限检查中间件

```typescript
// middleware/permission.ts
export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, hasPermission } = useAuth()

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  // 从meta获取所需权限
  const requiredPermission = to.meta.permission as string

  if (requiredPermission && !hasPermission(requiredPermission)) {
    abortNavigation('您没有访问此页面的权限')
  }
})
```

#### 多权限检查

```typescript
// middleware/permissions.ts
export default defineNuxtRouteMiddleware((to) => {
  const { user, hasPermission, hasRole } = useAuth()

  if (!user.value) {
    return navigateTo('/login')
  }

  // 获取权限要求
  const permissions = to.meta.permissions as string[] | undefined
  const roles = to.meta.roles as string[] | undefined
  const requireAll = to.meta.requireAll !== false // 默认需要全部

  // 检查角色
  if (roles && roles.length > 0) {
    const hasRoleAccess = requireAll
      ? roles.every(role => user.value?.role === role)
      : roles.some(role => user.value?.role === role)

    if (!hasRoleAccess) {
      abortNavigation('角色权限不足')
      return
    }
  }

  // 检查权限
  if (permissions && permissions.length > 0) {
    const hasPermissionAccess = requireAll
      ? permissions.every(p => hasPermission(p))
      : permissions.some(p => hasPermission(p))

    if (!hasPermissionAccess) {
      abortNavigation('权限不足')
    }
  }
})
```

---

### 实战案例:权限系统

构建一个完整的权限管理系统,包含用户认证、角色管理、权限控制等功能。

#### 1. 权限定义

```typescript
// types/permissions.ts
export enum Permission {
  // 用户权限
  USER_VIEW = 'user:view',
  USER_EDIT = 'user:edit',
  USER_DELETE = 'user:delete',

  // 文章权限
  POST_VIEW = 'post:view',
  POST_CREATE = 'post:create',
  POST_EDIT = 'post:edit',
  POST_DELETE = 'post:delete',
  POST_PUBLISH = 'post:publish',

  // 评论权限
  COMMENT_VIEW = 'comment:view',
  COMMENT_CREATE = 'comment:create',
  COMMENT_MODERATE = 'comment:moderate',

  // 管理员权限
  ADMIN_DASHBOARD = 'admin:dashboard',
  ADMIN_USERS = 'admin:users',
  ADMIN_SETTINGS = 'admin:settings'
}

export enum Role {
  GUEST = 'guest',
  USER = 'user',
  EDITOR = 'editor',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.GUEST]: [
    Permission.POST_VIEW,
    Permission.COMMENT_VIEW
  ],
  [Role.USER]: [
    Permission.POST_VIEW,
    Permission.POST_CREATE,
    Permission.POST_EDIT,
    Permission.COMMENT_VIEW,
    Permission.COMMENT_CREATE
  ],
  [Role.EDITOR]: [
    Permission.POST_VIEW,
    Permission.POST_CREATE,
    Permission.POST_EDIT,
    Permission.POST_DELETE,
    Permission.POST_PUBLISH,
    Permission.COMMENT_VIEW,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_MODERATE
  ],
  [Role.MODERATOR]: [
    ...RolePermissions[Role.EDITOR],
    Permission.USER_VIEW,
    Permission.COMMENT_MODERATE
  ],
  [Role.ADMIN]: [
    // 管理员拥有所有权限
    ...Object.values(Permission)
  ]
}
```

#### 2. 增强认证Store

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  // ... 之前的代码 ...

  // 批量权限检查
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => userPermissions.value.includes(p))
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => userPermissions.value.includes(p))
  }

  // 检查是否是某个角色
  const isRole = (role: Role): boolean => {
    return userRole.value === role
  }

  // 检查是否有任意角色
  const hasAnyRole = (roles: Role[]): boolean => {
    return roles.includes(userRole.value as Role)
  }

  // 刷新Token
  const refreshToken = async () => {
    try {
      const { data } = await useFetch('/api/auth/refresh', {
        method: 'POST'
      })

      if (data.value) {
        token.value = data.value.token
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    return false
  }

  // 检查Token是否过期
  const isTokenExpired = computed(() => {
    if (!token.value) return true

    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      return payload.exp < now
    } catch {
      return true
    }
  })

  return {
    // ... 之前的返回值 ...
    hasAllPermissions,
    hasAnyPermission,
    isRole,
    hasAnyRole,
    refreshToken,
    isTokenExpired
  }
})
```

#### 3. 权限指令

```typescript
// directives/permission.ts
export default defineNuxtPlugin((nuxtApp) => {
  // v-permission 指令
  nuxtApp.vueApp.directive('permission', {
    mounted(el, binding) {
      const { hasPermission } = useAuthStore()

      const requiredPermission = binding.value
      if (!hasPermission(requiredPermission)) {
        // 移除元素
        el.parentNode?.removeChild(el)
      }
    }
  })

  // v-role 指令
  nuxtApp.vueApp.directive('role', {
    mounted(el, binding) {
      const { isRole } = useAuthStore()

      const requiredRole = binding.value
      const requireAll = binding.modifiers.all !== false

      const hasRole = Array.isArray(requiredRole)
        ? requireAll
          ? requiredRole.every(r => isRole(r))
          : requiredRole.some(r => isRole(r))
        : isRole(requiredRole)

      if (!hasRole) {
        el.parentNode?.removeChild(el)
      }
    }
  })
})
```

#### 4. 权限组件

```vue
<!-- components/PermissionGuard.vue -->
<template>
  <slot v-if="hasAccess" />
  <div v-else-if="fallback" class="access-denied">
    <component :is="fallback" />
  </div>
</template>

<script setup lang="ts>
const props = defineProps<{
  permission?: string | string[]
  role?: string | string[]
  requireAll?: boolean
  fallback?: any
}>()

const { hasPermission, hasAllPermissions, hasAnyPermission, isRole, hasAnyRole } = useAuthStore()

const hasAccess = computed(() => {
  // 检查权限
  if (props.permission) {
    const permissions = Array.isArray(props.permission)
      ? props.permission
      : [props.permission]

    const hasPermissionAccess = props.requireAll !== false
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)

    if (!hasPermissionAccess) return false
  }

  // 检查角色
  if (props.role) {
    const roles = Array.isArray(props.role) ? props.role : [props.role]
    const hasRoleAccess = props.requireAll !== false
      ? roles.every(r => isRole(r))
      : hasAnyRole(roles)

    if (!hasRoleAccess) return false
  }

  return true
})
</script>

<!-- 使用示例 -->
<template>
  <div>
    <!-- 单个权限 -->
    <PermissionGuard permission="post:create">
      <button @click="createPost">创建文章</button>
    </PermissionGuard>

    <!-- 多个权限(满足任一即可) -->
    <PermissionGuard
      :permission="['post:edit', 'post:delete']"
      :require-all="false"
    >
      <PostActions />
    </PermissionGuard>

    <!-- 角色检查 -->
    <PermissionGuard role="admin">
      <AdminPanel />
    </PermissionGuard>

    <!-- 自定义降级UI -->
    <PermissionGuard
      permission="admin:dashboard"
      :fallback="AccessDenied"
    >
      <Dashboard />
    </PermissionGuard>
  </div>
</template>
```

#### 5. 管理后台页面

```vue
<!-- pages/admin/dashboard.vue -->
<template>
  <div class="admin-dashboard">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <!-- 只有管理员可见 -->
        <NuxtLink
          v-if="isRole('admin')"
          to="/admin/dashboard"
          class="nav-item"
        >
          <DashboardIcon />
          <span>仪表盘</span>
        </NuxtLink>

        <!-- 用户管理 -->
        <NuxtLink
          v-permission="'admin:users'"
          to="/admin/users"
          class="nav-item"
        >
          <UsersIcon />
          <span>用户管理</span>
        </NuxtLink>

        <!-- 文章管理 -->
        <NuxtLink
          v-permission="'post:moderate'"
          to="/admin/posts"
          class="nav-item"
        >
          <FileIcon />
          <span>文章管理</span>
        </NuxtLink>

        <!-- 系统设置 -->
        <NuxtLink
          v-role="'admin'"
          to="/admin/settings"
          class="nav-item"
        >
          <SettingsIcon />
          <span>系统设置</span>
        </NuxtLink>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="page-header">
        <h1>{{ pageTitle }}</h1>
        <div class="header-actions">
          <span class="user-info">
            {{ user?.name }}
            <span class="badge">{{ user?.role }}</span>
          </span>
          <button @click="logout">登出</button>
        </div>
      </header>

      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts>
// 应用中间件
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

const { user, logout, isRole } = useAuthStore()
const route = useRoute()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin/dashboard': '仪表盘',
    '/admin/users': '用户管理',
    '/admin/posts': '文章管理',
    '/admin/settings': '系统设置'
  }
  return titles[route.path] || '管理后台'
})
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: #2c3e50;
  color: white;
}

.sidebar-nav {
  padding: 2rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 2rem;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.1);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: white;
  border-bottom: 1px solid #eee;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  background: #667eea;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
}
</style>
```

#### 6. 权限检查Hook

```typescript
// composables/usePermission.ts
export const usePermission = () => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isRole, hasAnyRole } = useAuthStore()

  // 检查单个权限
  const can = (permission: string): boolean => {
    return hasPermission(permission)
  }

  // 检查多个权限(全部)
  const canAll = (permissions: string[]): boolean => {
    return hasAllPermissions(permissions)
  }

  // 检查多个权限(任一)
  const canAny = (permissions: string[]): boolean => {
    return hasAnyPermission(permissions)
  }

  // 检查角色
  const is = (role: string): boolean => {
    return isRole(role)
  }

  // 检查角色(任一)
  const isAny = (roles: string[]): boolean => {
    return hasAnyRole(roles)
  }

  // 权限验证函数
  const assertPermission = (permission: string): void => {
    if (!hasPermission(permission)) {
      throw createError({
        statusCode: 403,
        statusMessage: '权限不足'
      })
    }
  }

  const assertRole = (role: string): void => {
    if (!isRole(role)) {
      throw createError({
        statusCode: 403,
        statusMessage: '需要特定角色'
      })
    }
  }

  return {
    can,
    canAll,
    canAny,
    is,
    isAny,
    assertPermission,
    assertRole
  }
}
```

#### 7. 使用示例

```vue
<!-- components/UserActions.vue -->
<template>
  <div class="user-actions">
    <!-- 编辑按钮 - 需要编辑权限 -->
    <button
      v-if="can('user:edit')"
      @click="editUser"
      class="btn-edit"
    >
      编辑
    </button>

    <!-- 删除按钮 - 需要删除权限 -->
    <button
      v-if="can('user:delete')"
      @click="deleteUser"
      class="btn-delete"
    >
      删除
    </button>

    <!-- 管理按钮 - 仅管理员 -->
    <button
      v-if="is('admin')"
      @click="manageUser"
      class="btn-admin"
    >
      管理
    </button>
  </div>
</template>

<script setup lang="ts>
const props = defineProps<{
  userId: number
}>()

const { can, is, assertPermission } = usePermission()

const editUser = () => {
  assertPermission('user:edit')
  // 编辑逻辑
  navigateTo(`/users/${props.userId}/edit`)
}

const deleteUser = async () => {
  assertPermission('user:delete')

  if (confirm('确定要删除此用户吗?')) {
    await $fetch(`/api/users/${props.userId}`, {
      method: 'DELETE'
    })
  }
}

const manageUser = () => {
  navigateTo(`/admin/users/${props.userId}`)
}
</script>
```

---

### 本章小结

#### 中间件执行顺序

```
┌─────────────────────────────────────────────────────────────┐
│                    中间件执行顺序                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 全局中间件(middleware/global.ts)                        │
│     ↓                                                        │
│  2. 路由规则中间件(routeRules.middleware)                   │
│     ↓                                                        │
│  3. 页面中间件(definePageMeta.middleware)                    │
│     ↓                                                        │
│  4. 页面组件加载                                             │
│                                                             │
│  中间件中:                                                   │
│  - return navigateTo() → 重定向                             │
│  - abortNavigation() → 取消导航                             │
│  - 不返回 → 继续导航                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 最佳实践

1. **职责分离**: 认证和权限分开处理
2. **优先级**: 全局 > 路由 > 页面
3. **性能**: 避免在中间件中进行复杂计算
4. **错误处理**: 提供友好的错误提示
5. **类型安全**: 使用TypeScript定义权限类型

---

### 完整学习路线

恭喜!你已经完成了Nuxt 3全部26章的学习:

**基础部分(111-116)**:
- ✅ Nuxt 3+简介与环境搭建
- ✅ Nuxt目录结构与约定
- ✅ Nuxt路由系统自动生成
- ✅ Nuxt组件系统
- ✅ Nuxt数据获取基础
- ✅ Nuxt配置与部署

**核心功能(117-126)**:
- ✅ useAsyncData与useFetch
- ✅ useRoute与useRouter
- ✅ useState与useCookie
- ✅ useCookie与useHead
- ✅ Pinia状态管理集成
- ✅ SSR渲染原理与实践
- ✅ SSG静态站点生成
- ✅ ISR增量静态再生
- ✅ 动态路由与路由参数
- ✅ 路由中间件与守卫

你现在应该能够:
- 构建完整的Nuxt 3应用
- 实现服务端渲染和静态生成
- 管理应用状态和路由
- 实现认证和权限系统
- 优化应用性能和SEO

继续探索Nuxt 3的高级特性,构建出色的Web应用!
