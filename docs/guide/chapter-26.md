# API请求拦截
## # 4.2 API请求拦截
## API请求拦截

> **学习目标**：掌握Axios请求拦截器与响应拦截器的使用
> **核心内容**：请求拦截、响应拦截、错误处理、取消请求、重试机制

> **为什么需要请求拦截？**
>
> 在实际开发中，我们需要：
> 1. **统一处理请求头** - 添加token、设置Content-Type
> 2. **统一处理响应** - 统一的错误提示、数据格式化
> 3. **请求取消** - 避免重复请求、页面切换取消请求
> 4. **请求重试** - 失败自动重试
> 5. **请求缓存** - 减少不必要的网络请求

### Axios基础配置

#### 安装与基础配置

```bash
npm install axios
npm install @types/axios -D  # TypeScript类型
```

```typescript
// src/utils/request.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

export default service
```

#### 类型定义

```typescript
// src/types/api.ts

// 通用响应结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页请求参数
export interface PageParams {
  page: number
  pageSize: number
}

// 分页响应结构
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 请求配置扩展
export interface RequestConfig extends AxiosRequestConfig {
  showError?: boolean      // 是否显示错误提示
  showSuccess?: boolean    // 是否显示成功提示
  skipAuth?: boolean       // 跳过token验证
  retry?: number           // 重试次数
  cache?: boolean          // 是否缓存
}
```

### 请求拦截器

```typescript
// src/utils/request.ts

import type { RequestConfig } from '@/types/api'

// 请求拦截器
service.interceptors.request.use(
  (config: RequestConfig) => {
    // 1. 获取token
    const userStore = useUserStore()
    const token = userStore.token

    // 2. 添加token（如果未跳过验证）
    if (token && !config.skipAuth) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // 3. 添加时间戳防止缓存（GET请求）
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    // 4. 添加请求ID（用于追踪）
    config.headers = config.headers || {}
    config.headers['X-Request-ID'] = generateRequestId()

    // 5. 添加设备信息
    config.headers['X-Device-ID'] = getDeviceId()
    config.headers['X-Platform'] = 'web'

    // 6. 请求日志
    if (import.meta.env.DEV) {
      console.log(`[请求] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data)
    }

    return config
  },
  (error: AxiosError) => {
    console.error('请求拦截器错误：', error)
    return Promise.reject(error)
  }
)

// 生成请求ID
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// 获取设备ID
function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = generateRequestId()
    localStorage.setItem('device_id', deviceId)
  }
  return deviceId
}
```

### 响应拦截器

```typescript
// src/utils/request.ts

import type { ApiResponse } from '@/types/api'

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data, config } = response
    const requestConfig = config as RequestConfig

    // 响应日志
    if (import.meta.env.DEV) {
      console.log(`[响应] ${config.method?.toUpperCase()} ${config.url}`, data)
    }

    // 成功提示
    if (requestConfig.showSuccess && data.message) {
      ElMessage.success(data.message)
    }

    // 业务状态码判断
    switch (data.code) {
      case 200:
        // 成功
        return data.data

      case 401:
        // 未登录，跳转登录页
        handleUnauthorized()
        return Promise.reject(new Error('未登录'))

      case 403:
        // 无权限
        ElMessage.error('没有权限访问')
        return Promise.reject(new Error('无权限'))

      case 404:
        // 资源不存在
        ElMessage.error('请求的资源不存在')
        return Promise.reject(new Error('资源不存在'))

      default:
        // 其他错误
        const errorMsg = data.message || '请求失败'
        if (requestConfig.showError !== false) {
          ElMessage.error(errorMsg)
        }
        return Promise.reject(new Error(errorMsg))
    }
  },
  (error: AxiosError) => {
    const { response, config } = error
    const requestConfig = config as RequestConfig

    // 错误日志
    if (import.meta.env.DEV) {
      console.error('[错误]', error)
    }

    // 网络错误或超时
    if (!response) {
      if (error.message.includes('timeout')) {
        ElMessage.error('请求超时，请稍后重试')
      } else if (error.message.includes('network')) {
        ElMessage.error('网络连接失败，请检查网络设置')
      } else {
        ElMessage.error('请求失败，请稍后重试')
      }
      return Promise.reject(error)
    }

    // HTTP状态码处理
    const status = response.status
    const errorMsg = getErrorMessage(status)

    if (requestConfig.showError !== false) {
      ElMessage.error(errorMsg)
    }

    // 特殊状态码处理
    switch (status) {
      case 401:
        handleUnauthorized()
        break
      case 403:
        ElMessage.error('没有权限访问')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 500:
        ElMessage.error('服务器错误')
        break
      case 502:
        ElMessage.error('网关错误')
        break
      case 503:
        ElMessage.error('服务不可用')
        break
    }

    return Promise.reject(error)
  }
)

// 处理未登录
function handleUnauthorized() {
  const userStore = useUserStore()

  ElMessageBox.confirm('登录状态已过期，请重新登录', '提示', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    window.location.href = '/login'
  }).catch(() => {
    // 取消
  })
}

// 获取错误信息
function getErrorMessage(status: number): string {
  const errorMap: Record<number, string> = {
    400: '请求参数错误',
    401: '未登录或登录已过期',
    403: '没有权限访问',
    404: '请求的资源不存在',
    405: '请求方法不允许',
    408: '请求超时',
    500: '服务器错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  }

  return errorMap[status] || `请求失败 (${status})`
}
```

### 请求取消

#### 防止重复请求

```typescript
// src/utils/request.ts

// 存储pending的请求
const pendingMap = new Map<string, AbortController>()

// 生成请求key
function generateRequestKey(config: AxiosRequestConfig): string {
  const { method, url, params, data } = config
  return [
    method,
    url,
    JSON.stringify(params),
    JSON.stringify(data)
  ].join('&')
}

// 添加请求到pending
function addPending(config: AxiosRequestConfig) {
  const key = generateRequestKey(config)

  // 如果已存在相同请求，取消之前的请求
  if (pendingMap.has(key)) {
    const controller = pendingMap.get(key)!
    controller.abort()
  }

  // 创建新的AbortController
  const controller = new AbortController()
  config.signal = controller.signal
  pendingMap.set(key, controller)
}

// 移除pending请求
function removePending(config: AxiosRequestConfig) {
  const key = generateRequestKey(config)
  pendingMap.delete(key)
}

// 在请求拦截器中添加
service.interceptors.request.use((config) => {
  removePending(config)  // 先移除之前的
  addPending(config)     // 再添加当前的
  return config
})

// 在响应拦截器中移除
service.interceptors.response.use(
  (response) => {
    removePending(response.config)
    return response
  },
  (error) => {
    removePending(error.config)
    return Promise.reject(error)
  }
)
```

#### 页面切换取消请求

```typescript
// src/utils/requestCancel.ts

import { onUnmounted } from 'vue'
import type { AxiosRequestConfig } from 'axios'

export function useRequestCancel() {
  const controllers: AbortController[] = []

  // 创建可取消的请求配置
  const createCancellableRequest = (config: AxiosRequestConfig) => {
    const controller = new AbortController()
    controllers.push(controller)
    return {
      ...config,
      signal: controller.signal
    }
  }

  // 取消所有请求
  const cancelAll = () => {
    controllers.forEach(controller => controller.abort())
    controllers.length = 0
  }

  // 组件卸载时自动取消
  onUnmounted(() => {
    cancelAll()
  })

  return {
    createCancellableRequest,
    cancelAll
  }
}

// 使用示例
// import { useRequestCancel } from '@/utils/requestCancel'
//
// const { createCancellableRequest } = useRequestCancel()
//
// const fetchData = async () => {
//   const config = createCancellableRequest({ url: '/api/data' })
//   const data = await service(config)
// }
```

### 请求重试

```typescript
// src/utils/requestRetry.ts

import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

// 重试配置
interface RetryConfig {
  retries: number          // 重试次数
  retryDelay: number       // 重试延迟（毫秒）
  retryCondition?: (error: AxiosError) => boolean  // 重试条件
}

const defaultRetryConfig: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // 只重试网络错误和5xx错误
    return !error.response || (error.response.status >= 500 && error.response.status < 600)
  }
}

// 重试包装器
export function retryRequest(
  request: (config: AxiosRequestConfig) => Promise<any>,
  config: RetryConfig = {}
) {
  const options = { ...defaultRetryConfig, ...config }

  return async (axiosConfig: InternalAxiosRequestConfig) => {
    let lastError: Error

    for (let i = 0; i <= options.retries; i++) {
      try {
        return await request(axiosConfig)
      } catch (error) {
        lastError = error as Error

        // 最后一次尝试失败，不再重试
        if (i === options.retries) {
          throw lastError
        }

        // 检查是否应该重试
        if (options.retryCondition && !options.retryCondition(error as AxiosError)) {
          throw lastError
        }

        // 等待后重试
        await delay(options.retryDelay * (i + 1))
      }
    }

    throw lastError
  }
}

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 集成到axios
service.interceptors.request.use(
  retryRequest(
    (config) => Promise.resolve(config),
    { retries: 3, retryDelay: 1000 }
  ) as any
)
```

### 请求缓存

```typescript
// src/utils/requestCache.ts

interface CacheItem {
  data: any
  timestamp: number
}

class RequestCache {
  private cache = new Map<string, CacheItem>()
  private defaultTTL = 5 * 60 * 1000 // 5分钟

  // 获取缓存key
  private getKey(config: AxiosRequestConfig): string {
    return `${config.method}-${config.url}-${JSON.stringify(config.params)}`
  }

  // 获取缓存
  get(config: AxiosRequestConfig): any | null {
    const key = this.getKey(config)
    const item = this.cache.get(key)

    if (!item) return null

    // 检查是否过期
    if (Date.now() - item.timestamp > this.defaultTTL) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  // 设置缓存
  set(config: AxiosRequestConfig, data: any): void {
    const key = this.getKey(config)
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // 清除缓存
  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    // 清除匹配模式的缓存
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

export const requestCache = new RequestCache()

// 在请求拦截器中使用
service.interceptors.request.use((config) => {
  // 只缓存GET请求
  if (config.method === 'get' && (config as any).cache) {
    const cached = requestCache.get(config)
    if (cached) {
      return Promise.reject({ __cached: true, data: cached })
    }
  }
  return config
})

// 在响应拦截器中使用
service.interceptors.response.use((response) => {
  if (response.config.method === 'get' && (response.config as any).cache) {
    requestCache.set(response.config, response.data)
  }
  return response
})
```

### 完整封装

```typescript
// src/utils/request.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { ApiResponse, RequestConfig } from '@/types/api'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// pending请求管理
const pendingMap = new Map<string, AbortController>()

function generateRequestKey(config: AxiosRequestConfig): string {
  return [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join('&')
}

function addPending(config: AxiosRequestConfig) {
  const key = generateRequestKey(config)
  if (pendingMap.has(key)) {
    pendingMap.get(key)!.abort()
  }
  const controller = new AbortController()
  config.signal = controller.signal
  pendingMap.set(key, controller)
}

function removePending(config: AxiosRequestConfig) {
  const key = generateRequestKey(config)
  pendingMap.delete(key)
}

// 请求拦截器
service.interceptors.request.use(
  (config: RequestConfig) => {
    removePending(config)
    addPending(config)

    const userStore = useUserStore()
    if (userStore.token && !config.skipAuth) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }

    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() }
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    removePending(response.config)
    const { data, config } = response
    const requestConfig = config as RequestConfig

    if (requestConfig.showSuccess && data.message) {
      ElMessage.success(data.message)
    }

    switch (data.code) {
      case 200: return data.data
      case 401:
        ElMessageBox.confirm('登录状态已过期，请重新登录', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const userStore = useUserStore()
          userStore.logout()
          window.location.href = '/login'
        })
        return Promise.reject(new Error('未登录'))
      default:
        if (requestConfig.showError !== false) {
          ElMessage.error(data.message || '请求失败')
        }
        return Promise.reject(new Error(data.message || '请求失败'))
    }
  },
  (error: AxiosError) => {
    removePending(error.config!)
    if (axios.isCancel(error)) {
      return Promise.reject(new Error('请求已取消'))
    }

    if (!error.response) {
      if (error.message.includes('timeout')) {
        ElMessage.error('请求超时，请稍后重试')
      } else {
        ElMessage.error('网络连接失败，请检查网络设置')
      }
      return Promise.reject(error)
    }

    const status = error.response.status
    const errorMsg = {
      400: '请求参数错误',
      401: '未登录或登录已过期',
      403: '没有权限访问',
      404: '请求的资源不存在',
      500: '服务器错误',
      502: '网关错误',
      503: '服务不可用'
    }[status] || `请求失败 (${status})`

    ElMessage.error(errorMsg)
    return Promise.reject(error)
  }
)

// 便捷方法
export const http = {
  get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return service.get(url, config)
  },
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return service.post(url, data, config)
  },
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return service.put(url, data, config)
  },
  delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return service.delete(url, config)
  }
}

export default service
```

**使用示例：**

```typescript
// 在组件中使用
import { http } from '@/utils/request'

// GET请求
const getUserList = async () => {
  const data = await http.get<User[]>('/api/users', {
    params: { page: 1, pageSize: 10 }
  })
  return data
}

// POST请求
const createUser = async (user: User) => {
  const data = await http.post<User>('/api/users', user, {
    showSuccess: true
  })
  return data
}
```

### 完整API调用实战案例

> **场景说明**：下面是一个完整的用户管理模块，包含了各种API调用的实际场景。

#### 用户管理API封装

```typescript
// src/api/user.ts

import { http } from '@/utils/request'
import type { ApiResponse, PageParams, PageResponse } from '@/types/api'

// 用户类型定义
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt?: string
}

// 创建用户参数
export interface CreateUserParams {
  username: string
  email: string
  password: string
  role?: User['role']
}

// 更新用户参数
export interface UpdateUserParams {
  id: number
  username?: string
  email?: string
  avatar?: string
  role?: User['role']
  status?: User['status']
}

// 用户列表查询参数
export interface UserQueryParams extends PageParams {
  keyword?: string
  role?: User['role']
  status?: User['status']
}

/**
 * 用户管理API
 */
export const userApi = {
  /**
   * 获取用户列表（分页）
   */
  getUserList(params: UserQueryParams): Promise<PageResponse<User>> {
    return http.get<PageResponse<User>>('/users', { params })
  },

  /**
   * 获取用户详情
   */
  getUserById(id: number): Promise<User> {
    return http.get<User>(`/users/${id}`)
  },

  /**
   * 创建用户（成功后显示提示）
   */
  createUser(data: CreateUserParams): Promise<User> {
    return http.post<User>('/users', data, {
      showSuccess: true
    })
  },

  /**
   * 更新用户
   */
  updateUser(id: number, data: UpdateUserParams): Promise<User> {
    return http.put<User>(`/users/${id}`, data, {
      showSuccess: true
    })
  },

  /**
   * 删除用户（带确认）
   */
  async deleteUser(id: number): Promise<void> {
    return http.delete<void>(`/users/${id}`, {
      showSuccess: true
    })
  },

  /**
   * 批量删除用户
   */
  batchDelete(ids: number[]): Promise<void> {
    return http.post<void>('/users/batch-delete', { ids }, {
      showSuccess: true
    })
  },

  /**
   * 修改用户状态
   */
  updateUserStatus(id: number, status: User['status']): Promise<void> {
    return http.patch<void>(`/users/${id}/status`, { status })
  },

  /**
   * 重置用户密码
   */
  resetPassword(id: number, newPassword: string): Promise<void> {
    return http.post<void>(`/users/${id}/reset-password`, {
      password: newPassword
    }, {
      showSuccess: true
    })
  },

  /**
   * 上传头像
   */
  uploadAvatar(userId: number, file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return http.post<{ url: string }>(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
```

#### 在组件中使用API

```vue
<!-- views/UserManagement.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi, type User, type UserQueryParams } from '@/api/user'

// ========== 数据状态 ==========
const users = ref<User[]>([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = ref<UserQueryParams>({
  page: 1,
  pageSize: 10,
  keyword: '',
  role: undefined,
  status: undefined
})

// 选中的用户ID
const selectedIds = ref<number[]>([])

// ========== API调用示例 ==========

/**
 * 示例1: 基础数据获取（成功处理）
 */
const fetchUsers = async () => {
  loading.value = true
  selectedIds.value = []

  try {
    // ✅ 成功请求：获取用户列表
    const result = await userApi.getUserList(queryParams.value)
    users.value = result.list
    total.value = result.total

    console.log('获取用户列表成功:', result)
  } catch (error) {
    // ❌ 错误处理：请求失败
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 示例2: 创建用户（成功提示）
 */
const handleCreate = async (userData: CreateUserParams) => {
  try {
    // ✅ showSuccess: true 会自动显示成功提示
    const newUser = await userApi.createUser(userData)

    // 创建成功后刷新列表
    await fetchUsers()

    ElMessage.success(`用户 ${newUser.username} 创建成功`)
  } catch (error) {
    // 错误已被拦截器处理，这里可以添加额外逻辑
    console.error('创建用户失败:', error)
  }
}

/**
 * 示例3: 删除用户（确认对话框）
 */
const handleDelete = async (user: User) => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // ✅ 用户确认后执行删除
    await userApi.deleteUser(user.id)

    // 删除成功后刷新列表
    await fetchUsers()

  } catch (error) {
    // 用户取消操作或删除失败
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
    }
  }
}

/**
 * 示例4: 批量删除
 */
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个用户吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // ✅ 批量删除
    await userApi.batchDelete(selectedIds.value)

    // 刷新列表
    await fetchUsers()

  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

/**
 * 示例5: 上传头像（带进度）
 */
const handleAvatarUpload = async (userId: number, file: File) => {
  try {
    ElMessage.info('正在上传头像...')

    // ✅ 上传文件
    const result = await userApi.uploadAvatar(userId, file)

    // 更新本地数据
    const user = users.value.find(u => u.id === userId)
    if (user) {
      user.avatar = result.url
    }

    ElMessage.success('头像上传成功')
  } catch (error) {
    console.error('上传头像失败:', error)
  }
}

/**
 * 示例6: 搜索（防抖）
 */
let searchTimer: number | null = null
const handleSearch = (keyword: string) => {
  // 清除之前的定时器
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  // 延迟300ms执行搜索
  searchTimer = window.setTimeout(() => {
    queryParams.value.keyword = keyword
    queryParams.value.page = 1
    fetchUsers()
  }, 300)
}

/**
 * 示例7: 分页切换
 */
const handlePageChange = (page: number) => {
  queryParams.value.page = page
  fetchUsers()
}

/**
 * 示例8: 状态筛选
 */
const handleStatusFilter = (status: User['status'] | undefined) => {
  queryParams.value.status = status
  queryParams.value.page = 1
  fetchUsers()
}

/**
 * 示例9: 重置密码
 */
const handleResetPassword = async (user: User) => {
  try {
    const { value } = await ElMessageBox.prompt(
      `请输入用户 "${user.username}" 的新密码`,
      '重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{6,20}$/,
        inputErrorMessage: '密码长度为6-20位'
      }
    )

    // ✅ 重置密码
    await userApi.resetPassword(user.id, value)

    ElMessage.success('密码重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
    }
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="user-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input
        :value="queryParams.keyword"
        @input="handleSearch(($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="搜索用户名或邮箱..."
        class="search-input"
      >

      <select
        :value="queryParams.status"
        @change="handleStatusFilter(($event.target as HTMLSelectElement).value as User['status'] | undefined)"
        class="filter-select"
      >
        <option :value="undefined">全部状态</option>
        <option value="active">启用</option>
        <option value="inactive">禁用</option>
      </select>

      <button @click="fetchUsers" class="btn-refresh">
        刷新
      </button>
    </div>

    <!-- 用户列表 -->
    <div v-loading="loading" class="user-table">
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                :checked="selectedIds.length === users.length && users.length > 0"
                @change="toggleSelectAll"
              >
            </th>
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <input
                type="checkbox"
                :checked="selectedIds.includes(user.id)"
                @change="toggleSelect(user.id)"
              >
            </td>
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span :class="['status', user.status]">
                {{ user.status === 'active' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <button @click="handleEdit(user)">编辑</button>
              <button @click="handleResetPassword(user)">重置密码</button>
              <button @click="handleDelete(user)" class="btn-danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 空状态 -->
      <div v-if="!loading && users.length === 0" class="empty">
        暂无用户数据
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button
        :disabled="queryParams.page <= 1"
        @click="handlePageChange(queryParams.page - 1)"
      >
        上一页
      </button>

      <span>第 {{ queryParams.page }} 页</span>

      <button
        :disabled="queryParams.page * queryParams.pageSize >= total"
        @click="handlePageChange(queryParams.page + 1)"
      >
        下一页
      </button>

      <span>共 {{ total }} 条</span>
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedIds.length > 0" class="batch-actions">
      <span>已选择 {{ selectedIds.length }} 项</span>
      <button @click="handleBatchDelete" class="btn-danger">
        批量删除
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-management {
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-refresh {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.user-table table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.user-table th {
  background: #f5f5f5;
  font-weight: 600;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status.active {
  background: #e1f3e8;
  color: #67c23a;
}

.status.inactive {
  background: #fef0f0;
  color: #f56c6c;
}

.btn-danger {
  background: #f56c6c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.batch-actions {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  gap: 15px;
  align-items: center;
}
</style>
```

#### API调用最佳实践总结

| 场景 | 实践方式 | 代码示例 |
|------|---------|---------|
| **成功提示** | 配置 `showSuccess: true` | `http.post('/api/users', data, { showSuccess: true })` |
| **错误提示** | 默认自动显示，可配置 `showError: false` | `http.get('/api/data', { showError: false })` |
| **加载状态** | 使用 `loading` 状态 | `loading.value = true; await http.get(...); loading.value = false` |
| **确认操作** | 删除前使用 `ElMessageBox.confirm` | `await ElMessageBox.confirm(...); await deleteUser(id)` |
| **搜索防抖** | 使用 `setTimeout` 延迟执行 | `setTimeout(() => { fetchData() }, 300)` |
| **分页查询** | 修改 `page` 后重新请求 | `queryParams.page = page; fetchData()` |
| **文件上传** | 使用 `FormData` | `const formData = new FormData(); formData.append('file', file)` |
| **错误处理** | `try-catch` 捕获 | `try { await api.call() } catch (error) { ... }` |

---

### 本章小结

| 功能 | 说明 |
|------|------|
| 请求拦截 | 添加token、请求头、时间戳 |
| 响应拦截 | 统一处理响应、错误提示 |
| 请求取消 | 防止重复请求、页面切换取消 |
| 请求重试 | 失败自动重试 |
| 请求缓存 | 减少不必要的网络请求 |

---
