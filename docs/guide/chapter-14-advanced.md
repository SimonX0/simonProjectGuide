# 组合式 API 高级特性完全指南

## 组合式 API 高级特性

> **学习目标**：掌握组合式 API 的高级特性和最佳实践
> **核心内容**：
> - 高级响应式 API
> - 响应式原理深度解析
> - 依赖注入模式
> - 组合式函数高级模式
> - 性能优化技巧

---

## 高级响应式 API

### toRef 和 toRefs 深入

#### toRef 单个属性转换

```vue
<script setup lang="ts">
import { reactive, toRef } from 'vue'

interface State {
  user: {
    name: string
    age: number
    email: string
  }
  settings: {
    theme: string
    language: string
  }
}

const state = reactive<State>({
  user: {
    name: '张三',
    age: 25,
    email: 'zhang@example.com'
  },
  settings: {
    theme: 'light',
    language: 'zh-CN'
  }
})

// 创建对单个属性的 ref
const userName = toRef(state, 'name')
const userAge = toRef(state.user, 'age')

// 修改 ref 会更新原始对象
userName.value = '李四'
console.log(state.user.name)  // '李四'

// 修改原始对象也会更新 ref
state.user.age = 26
console.log(userAge.value)  // 26

// 嵌套对象的 toRef
const theme = toRef(state.settings, 'theme')
theme.value = 'dark'
console.log(state.settings.theme)  // 'dark'

// toRef 的默认值
const title = toRef(state, 'title', '默认标题')
console.log(title.value)  // '默认标题'（如果 state.title 不存在）
</script>
```

#### toRefs 批量转换

```vue
<script setup lang="ts">
import { reactive, toRefs } from 'vue'

interface State {
  count: number
  name: string
  isActive: boolean
  items: string[]
}

const state = reactive<State>({
  count: 0,
  name: 'Vue3',
  isActive: true,
  items: ['a', 'b', 'c']
})

// 转换所有属性为 refs
const { count, name, isActive, items } = toRefs(state)

// 每个 ref 都保持与原属性的响应式连接
count.value++
console.log(state.count)  // 1

name.value = 'Vue 3.4'
console.log(state.name)  // 'Vue 3.4'

// 在组合式函数中使用 toRefs
function useCounter(initial = 0) {
  const state = reactive({
    count: initial,
    double: computed(() => state.count * 2),
    isMax: computed(() => state.count >= 100)
  })

  // 返回 refs，解构时保持响应式
  return toRefs(state)
}

const { count, double, isMax } = useCounter(10)
console.log(count.value)  // 10
console.log(double.value)  // 20

// toRefs 与解构赋值
const { count: counter } = toRefs(state)
console.log(counter.value)  // state.count 的值
</script>
```

#### toRef 与 computed 的区别

```vue
<script setup lang="ts">
import { reactive, toRef, computed } from 'vue'

const state = reactive({
  firstName: '张',
  lastName: '三'
})

// toRef - 创建对现有属性的引用
const firstNameRef = toRef(state, 'firstName')

// computed - 创建计算属性
const fullName = computed(() => `${state.firstName} ${state.lastName}`)

// toRef 是可写的
firstNameRef.value = '李'
console.log(state.firstName)  // '李'

// computed 默认只读（需要 getter/setter 才能写）
// fullName.value = '李四'  // Error

// 可写的 computed
const writableFullName = computed({
  get: () => `${state.firstName} ${state.lastName}`,
  set: (value: string) => {
    [state.firstName, state.lastName] = value.split(' ')
  }
})

writableFullName.value = '王 五'
console.log(state.firstName)  // '王'
console.log(state.lastName)  // '五'
</script>
```

---

### customRef 自定义响应式

#### 基础 customRef

```vue
<script setup lang="ts">
import { customRef } from 'vue'

// 创建防抖 ref
function useDebouncedRef<T>(value: T, delay = 200) {
  let timeout: number | undefined
  return customRef<T>((track, trigger) => {
    return {
      get() {
        track()  // 追踪依赖
        return value
      },
      set(newValue) {
        value = newValue
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          trigger()  // 触发更新
        }, delay)
      }
    }
  })
}

// 使用
const search = useDebouncedRef('', 300)
search.value = 'Vue3'  // 300ms 后才触发更新
</script>
```

#### 高级 customRef 用法

```vue
<script setup lang="ts">
import { customRef } from 'vue'

// 带验证的 ref
function useValidatedRef<T>(
  initialValue: T,
  validator: (value: T) => boolean,
  errorMessage = 'Invalid value'
) {
  const error = ref<string | null>(null)

  return customRef<T>((track, trigger) => {
    return {
      get() {
        track()
        return initialValue
      },
      set(newValue) {
        if (validator(newValue)) {
          initialValue = newValue
          error.value = null
          trigger()
        } else {
          error.value = errorMessage
        }
      }
    }
  })
}

// 使用
const email = useValidatedRef(
  '',
  (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  '请输入有效的邮箱地址'
)

console.log(email.value)  // ''
console.log(error.value)  // null
email.value = 'invalid'  // error.value = '请输入有效的邮箱地址'

// 带历史记录的 ref
function useHistoryRef<T>(initialValue: T, maxSize = 10) {
  const history = ref<T[]>([initialValue])
  const currentIndex = ref(0)

  return customRef<T>((track, trigger) => {
    return {
      get() {
        track()
        return history.value[currentIndex.value]
      },
      set(newValue) {
        // 删除当前位置之后的历史
        history.value = history.value.slice(0, currentIndex.value + 1)

        // 添加新值
        history.value.push(newValue)

        // 限制历史记录大小
        if (history.value.length > maxSize) {
          history.value.shift()
        } else {
          currentIndex.value++
        }

        trigger()
      }
    }
  })
}

// 带本地存储的 ref
function useLocalStorageRef<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key)

  try {
    defaultValue = stored ? JSON.parse(stored) : defaultValue
  } catch (e) {
    console.error('Error parsing localStorage:', e)
  }

  return customRef<T>((track, trigger) => {
    return {
      get() {
        track()
        return defaultValue
      },
      set(newValue) {
        defaultValue = newValue
        localStorage.setItem(key, JSON.stringify(newValue))
        trigger()
      }
    }
  })
}
</script>
```

---

### shallowRef 和 shallowReactive

#### shallowRef 浅层响应式

```vue
<script setup lang="ts">
import { ref, shallowRef, triggerRef } from 'vue'

// ref - 深层响应式
const deepRef = ref({
  nested: {
    value: 1
  }
})

deepRef.value.nested.value = 2  // ✅ 触发更新

// shallowRef - 只有 .value 赋值才触发响应式
const shallow = shallowRef({
  nested: {
    value: 1
  }
})

shallow.value.nested.value = 2  // ❌ 不会触发更新
shallow.value = { nested: { value: 2 } }  // ✅ 触发更新

// 使用 triggerRef 强制更新
const state = shallowRef({
  count: 0
})

// 修改内部属性
state.value.count++

// 不会触发更新，需要手动 trigger
triggerRef(state)

// 使用场景：大型不可变数据
const bigData = shallowRef({
  // 大量数据...
})

// 只在替换整个对象时才需要响应式更新
function updateData() {
  bigData.value = fetchNewData()  // ✅ 触发更新
}
</script>
```

#### shallowReactive 浅层响应式

```vue
<script setup lang="ts">
import { reactive, shallowReactive } from 'vue'

// reactive - 深层响应式
const deep = reactive({
  nested: {
    value: 1
  }
})

deep.nested.value = 2  // ✅ 触发更新

// shallowReactive - 只有第一层属性是响应式的
const shallow = shallowReactive({
  nested: {
    value: 1
  },
  count: 0
})

shallow.count++  // ✅ 触发更新
shallow.nested.value = 2  // ❌ 不会触发更新

// 使用场景：性能优化
const state = shallowReactive({
  user: {
    profile: {
      // 大量数据...
    }
  },
  ui: {
    theme: 'light'
  }
})

// 频繁访问 ui.theme 是响应式的
state.ui.theme = 'dark'  // ✅ 触发更新

// 不需要响应式的深层访问不会触发更新
state.user.profile.someDeepValue = 'value'  // ❌ 不触发
</script>
```

---

### readonly 和 shallowReadonly

#### readonly 深度只读

```vue
<script setup lang="ts">
import { reactive, readonly, isReadonly } from 'vue'

const original = reactive({
  count: 0,
  nested: {
    value: 1
  }
})

// 创建深度只读代理
const copy = readonly(original)

console.log(isReadonly(copy))  // true

// 修改会失败并产生警告（开发环境）
copy.count = 1  // ⚠️ 警告：Cannot assign to 'count' because it is read-only
copy.nested.value = 2  // ⚠️ 警告

// 原对象仍然可以修改
original.count = 1  // ✅ 正常

// 使用场景：保护状态不被修改
function useProtectedState() {
  const state = reactive({
    count: 0,
    name: 'Vue3'
  })

  // 返回只读版本，外部无法修改
  return readonly(state)
}

const protectedState = useProtectedState()
protectedState.count = 1  // ❌ 失败
</script>
```

#### shallowReadonly 浅层只读

```vue
<script setup lang="ts">
import { reactive, shallowReadonly } from 'vue'

const original = reactive({
  count: 0,
  nested: {
    value: 1
  }
})

// 只读第一层属性
const shallow = shallowReadonly(original)

shallow.count = 1  // ❌ 失败
shallow.nested.value = 2  // ✅ 成功（深层不是只读的）

// 使用场景：性能优化 + 浅层保护
const state = shallowReadonly({
  config: {
    // 大量配置...
  },
  data: {
    // 大量数据...
  }
})

// 不能替换 config 或 data
state.config = {}  // ❌ 失败

// 可以修改内部属性
state.config.someOption = true  // ✅ 成功
</script>
```

---

### toRaw 和 markRaw

#### toRaw 获取原始对象

```vue
<script setup lang="ts">
import { reactive, toRaw } from 'vue'

const original = { count: 0 }
const proxy = reactive(original)

// proxy !== original
console.log(proxy === original)  // false

// toRaw 获取原始对象
const raw = toRaw(proxy)
console.log(raw === original)  // true

// 使用场景：直接操作原始对象，避免响应式开销
function directUpdate(obj: any) {
  const raw = toRaw(obj)
  // 直接修改原始对象，不会触发响应式更新
  raw.count = 100
}

// 使用场景：比较对象
const state1 = reactive({ count: 0 })
const state2 = reactive({ count: 0 })

// proxy 对象永远不相等
console.log(state1 === state2)  // false

// 原始对象可以比较
console.log(toRaw(state1) === toRaw(state2))  // false

// 使用场景：序列化
const state = reactive({
  user: { name: '张三' }
})

// 直接序列化 proxy 会包含很多 Vue 内部属性
// JSON.stringify(state)  // ❌ 不推荐

// 序列化原始对象
JSON.stringify(toRaw(state))  // ✅ 推荐
</script>
```

#### markRaw 标记为非响应式

```vue
<script setup lang="ts">
import { reactive, markRaw, isReactive } from 'vue'

// 标记对象永远不需要是响应式的
const hugeData = markRaw({
  // 大量静态数据...
  items: Array(10000).fill(null)
})

const state = reactive({
  data: hugeData
})

// hugeData 不会被转换为响应式
console.log(isReactive(state.data))  // false

// 修改 hugeData 不会触发响应式更新
state.data.items.push(1)  // ❌ 不会触发更新

// 使用场景：第三方库实例
import * as THREE from 'three'

const scene = markRaw(new THREE.Scene())

const state = reactive({
  scene  // 不会被 Vue 响应式系统处理
})

// 使用场景：常量配置
const CONFIG = markRaw({
  API_URL: 'https://api.example.com',
  TIMEOUT: 5000,
  RETRY_COUNT: 3
})

const state = reactive({
  config: CONFIG  // 不会被转换为响应式
})

// 使用场景：复杂计算结果
function computeExpensiveResult() {
  // 复杂计算...
  return markRaw({
    result: 'computed value',
    cache: {}
  })
}
</script>
```

---

### effectScope 作用域

#### 基础 effectScope

```vue
<script setup lang="ts">
import { ref, effectScope, computed, watch } from 'vue'

// 创建作用域
const scope = effectScope()

scope.run(() => {
  const count = ref(0)
  const double = computed(() => count.value * 2)

  watch(count, (val) => {
    console.log('count changed:', val)
  })

  // 所有响应式效果都在这个作用域内
})

// 停止作用域，清理所有效果
scope.stop()

// 使用场景：组合式函数中的作用域管理
function useFeature() {
  const scope = effectScope()

  scope.run(() => {
    const state = reactive({
      count: 0
    })

    watch(state, () => {
      console.log('state changed')
    })
  })

  // 返回清理函数
  return () => scope.stop()
}

const cleanup = useFeature()
// 组件卸载时调用
cleanup()
</script>
```

#### 嵌套作用域

```vue
<script setup lang="ts">
import { effectScope } from 'vue'

// 父作用域
const parentScope = effectScope()

parentScope.run(() => {
  const parentCount = ref(0)

  // 子作用域
  const childScope = effectScope(true)

  childScope.run(() => {
    const childCount = ref(0)

    // 可以访问父作用域的变量
    watch(parentCount, (val) => {
      console.log('parentCount:', val)
    })
  })

  // 停止子作用域
  // childScope.stop()
})

// 停止父作用域会自动停止所有子作用域
parentScope.stop()
</script>
```

#### getCurrentScope 和 onScopeDispose

```vue
<script setup lang="ts">
import { effectScope, getCurrentScope, onScopeDispose } from 'vue'

const scope = effectScope()

scope.run(() => {
  // 获取当前作用域
  const currentScope = getCurrentScope()
  console.log(currentScope === scope)  // true

  // 注册作用域清理回调
  onScopeDispose(() => {
    console.log('Scope disposed')
  })

  // 类似组件的 onUnmounted
  const timer = setInterval(() => {
    console.log('tick')
  }, 1000)

  onScopeDispose(() => {
    clearInterval(timer)
  })
})
</script>
```

---

## 依赖注入模式

### provide 和 inject 基础

#### 简单依赖注入

```vue
<!-- 父组件 Parent.vue -->
<script setup lang="ts">
import { provide, ref, readonly } from 'vue'

const theme = ref('light')
const user = ref({
  name: '张三',
  role: 'admin'
})

// 提供值
provide('theme', theme)
provide('user', readonly(user))  // 提供只读版本

// 提供更新方法
provide('updateTheme', (newTheme: string) => {
  theme.value = newTheme
})
</script>

<!-- 子组件 Child.vue -->
<script setup lang="ts">
import { inject } from 'vue'

// 注入值
const theme = inject<string>('theme', 'light')  // 第二个参数是默认值
const user = inject('user')
const updateTheme = inject<(theme: string) => void>('updateTheme')

// 使用
console.log(theme.value)  // 'light'
updateTheme?.('dark')
</script>
```

---

### 类型安全的 provide/inject

#### 使用 Symbol 作为 key

```typescript
// keys.ts
import type { InjectionKey } from 'vue'

// 定义注入键
export const ThemeKey: InjectionKey<Ref<string>> = Symbol('theme')
export const UserKey: InjectionKey<Ref<User>> = Symbol('user')
export const UpdateThemeKey: InjectionKey<(theme: string) => void> = Symbol('updateTheme')

interface User {
  name: string
  role: 'admin' | 'user'
}
```

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import { provide, ref } from 'vue'
import { ThemeKey, UserKey, UpdateThemeKey } from './keys'

const theme = ref('light')
const user = ref<User>({ name: '张三', role: 'admin' })

// 类型安全的 provide
provide(ThemeKey, theme)
provide(UserKey, user)
provide(UpdateThemeKey, (newTheme: string) => {
  theme.value = newTheme
})
</script>

<!-- Child.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { ThemeKey, UserKey, UpdateThemeKey } from './keys'

// 类型安全的 inject，自动推断类型
const theme = inject(ThemeKey)
const user = inject(UserKey)
const updateTheme = inject(UpdateThemeKey)

// TypeScript 自动类型检查
if (theme) {
  console.log(theme.value)  // string
}

if (user) {
  console.log(user.value.role)  // 'admin' | 'user'
}

updateTheme?.('dark')  // 参数类型检查
</script>
```

---

### 组合式函数中的依赖注入

```typescript
// composables/useTheme.ts
import { inject, provide, ref, computed, type InjectionKey, type ComputedRef } from 'vue'

export const ThemeKey: InjectionKey<ComputedRef<string>> = Symbol('theme')

// 提供主题
export function provideTheme(initialTheme: 'light' | 'dark' = 'light') {
  const theme = ref(initialTheme)

  const isDark = computed(() => theme.value === 'dark')

  provide(ThemeKey, isDark)

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
  }

  return {
    isDark,
    toggleTheme,
    setTheme
  }
}

// 注入主题
export function useTheme() {
  const isDark = inject(ThemeKey)

  if (!isDark) {
    throw new Error('useTheme must be used within a component that provides Theme')
  }

  return {
    isDark
  }
}
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { provideTheme } from '@/composables/useTheme'

const { isDark } = provideTheme('light')
</script>

<template>
  <div :class="{ dark: isDark }">
    <RouterView />
  </div>
</template>
```

```vue
<!-- AnyChild.vue -->
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()
</script>

<template>
  <button :class="{ active: isDark }">
    Toggle Theme
  </button>
</template>
```

---

### 默认值和响应式更新

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import { provide, ref, readonly } from 'vue'

const count = ref(0)

// 提供响应式 ref
provide('count', count)

// 提供只读版本
provide('readonlyCount', readonly(count))

// 提供计算属性
const doubleCount = computed(() => count.value * 2)
provide('doubleCount', doubleCount)
</script>

<!-- Child.vue -->
<script setup lang="ts">
import { inject } from 'vue'

// 注入响应式值，会随父组件更新
const count = inject<Ref<number>>('count', ref(0))

// 修改会同步到父组件（如果父组件提供的是可写 ref）
count.value++

// 注入只读版本
const readonlyCount = inject<Ref<number>>('readonlyCount', ref(0))
readonlyCount.value++  // ⚠️ 警告：不能修改只读值

// 注入计算属性
const doubleCount = inject<ComputedRef<number>>('doubleCount', computed(() => 0))
console.log(doubleCount.value)  // 自动更新
</script>
```

---

## 组合式函数高级模式

### 组合式函数组合

```typescript
// composables/useUserManagement.ts
import { ref, computed } from 'vue'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

export function useUserManagement() {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 组合多个组合式函数
  const { data, loading: fetchLoading, execute: fetchUsers } = useRequest(
    () => api.getUsers(),
    { immediate: true }
  )

  const {
    data: paginatedData,
    page,
    pageSize,
    totalPages,
    nextPage,
    prevPage,
    goToPage
  } = usePagination(data, { pageSize: 10 })

  const {
    sortedData,
    sortBy,
    sortOrder,
    toggleSort
  } = useSort(paginatedData, {
    field: 'name',
    order: 'asc'
  })

  const {
    filteredData,
    filters,
    setFilter,
    clearFilters
  } = useFilter(sortedData, {
    role: 'user'
  })

  // 组合所有功能
  return {
    users: filteredData,
    loading: fetchLoading,
    error,
    // 分页
    page,
    pageSize,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    // 排序
    sortBy,
    sortOrder,
    toggleSort,
    // 过滤
    filters,
    setFilter,
    clearFilters,
    // 刷新
    refresh: fetchUsers
  }
}
```

---

### 生命周期管理

```typescript
// composables/useWebSocket.ts
import { ref, onUnmounted, onMounted } from 'vue'

export function useWebSocket(url: string) {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)
  const data = ref<any>(null)
  const error = ref<Event | null>(null)

  function connect() {
    ws.value = new WebSocket(url)

    ws.value.onopen = () => {
      connected.value = true
      error.value = null
    }

    ws.value.onmessage = (event) => {
      data.value = JSON.parse(event.data)
    }

    ws.value.onerror = (event) => {
      error.value = event
    }

    ws.value.onclose = () => {
      connected.value = false
    }
  }

  function send(message: any) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(message))
    }
  }

  function disconnect() {
    ws.value?.close()
  }

  // 组件挂载时连接
  onMounted(connect)

  // 组件卸载时断开
  onUnmounted(disconnect)

  return {
    connected,
    data,
    error,
    send,
    disconnect,
    connect
  }
}
```

---

### 可配置的组合式函数

```typescript
// composables/useFetch.ts
import { ref, Ref } from 'vue'

interface UseFetchOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  transform?: (data: any) => any
  refetchOnWindowFocus?: boolean
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
) {
  const {
    immediate = false,
    onSuccess,
    onError,
    transform = (data) => data,
    refetchOnWindowFocus = false
  } = options

  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  async function execute() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(url)
      const rawData = await response.json()
      data.value = transform(rawData)
      onSuccess?.(data.value)
    } catch (err) {
      error.value = err as Error
      onError?.(error.value)
    } finally {
      loading.value = false
    }
  }

  if (immediate) {
    execute()
  }

  if (refetchOnWindowFocus) {
    window.addEventListener('focus', execute)
  }

  return {
    data: data as Ref<T>,
    error,
    loading,
    execute
  }
}
```

---

## 响应式原理深度解析

### 响应式系统工作原理

```typescript
// 简化的响应式系统实现

// 1. 依赖收集
let activeEffect: Function | null = null

class ReactiveEffect<T = any> {
  fn: Function
  deps: Set<ReactiveEffect>[] = []

  constructor(fn: Function) {
    this.fn = fn
  }

  run() {
    try {
      activeEffect = this
      return this.fn()
    } finally {
      activeEffect = null
    }
  }
}

// 2. 响应式对象
const targetMap = new WeakMap<object, Map<string, Set<ReactiveEffect>>>()

function track(target: object, key: string) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

// 3. 触发更新
function trigger(target: object, key: string) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => {
      effect.run()
    })
  }
}

// 4. 创建响应式对象
function reactive<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)
      track(target, key as string)
      return result
    },
    set(target, key, value, receiver) {
      const oldValue = (target as any)[key]
      const result = Reflect.set(target, key, value, receiver)
      if (oldValue !== value) {
        trigger(target, key as string)
      }
      return result
    }
  })
}

// 5. 创建 effect
function effect(fn: Function) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}
```

---

### ref 的实现原理

```typescript
// 简化的 ref 实现

class RefImpl<T> {
  private _value: T
  public dep?: Set<ReactiveEffect>
  public readonly __v_isRef = true

  constructor(value: T) {
    this._value = value
    this.dep = undefined
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newVal) {
    if (hasChanged(newVal, this._value)) {
      this._value = newVal
      triggerRefValue(this)
    }
  }
}

function ref<T>(value: T): Ref<T> {
  return new RefImpl(value)
}

function trackRefValue(ref: RefImpl<any>) {
  if (activeEffect) {
    trackEffects(ref)
  }
}

function triggerRefValue(ref: RefImpl<any>) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}
```

---

### computed 的实现原理

```typescript
// 简化的 computed 实现

class ComputedRefImpl<T> {
  private _value: T
  private _dirty: boolean = true
  private _effect: ReactiveEffect
  public dep?: Set<ReactiveEffect>
  public readonly __v_isRef = true

  constructor(getter: () => T) {
    this._effect = new ReactiveEffect(() => {
      if (!this._dirty) {
        this._dirty = true
        triggerRefValue(this)
      }
    })

    this._effect.fn = () => {
      this._value = getter()
      this._dirty = false
    }
  }

  get value() {
    trackRefValue(this)
    if (this._dirty) {
      this._dirty = false
      this._effect.run()
    }
    return this._value
  }
}

function computed<T>(getter: () => T): ComputedRef<T> {
  return new ComputedRefImpl(getter)
}
```

---

## 性能优化技巧

### 避免不必要的响应式

```vue
<script setup lang="ts">
import { ref, shallowRef, markRaw } from 'vue'

// ❌ 不必要的响应式
const config = ref({
  // 静态配置...
  timeout: 5000,
  retryCount: 3
})

// ✅ 使用 shallowRef 或 markRaw
const config = shallowRef({
  timeout: 5000,
  retryCount: 3
})

// 或者
const config = markRaw({
  timeout: 5000,
  retryCount: 3
})

// ❌ 大型数组不必要的响应式
const items = ref(Array(10000).fill(null))

// ✅ 使用 shallowRef
const items = shallowRef(Array(10000).fill(null))
</script>
```

---

### 合理使用 computed

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

// ✅ 合理使用 computed
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// ❌ 避免在 computed 中进行复杂计算
const expensiveValue = computed(() => {
  // 复杂计算...
  let result = 0
  for (let i = 0; i < 1000000; i++) {
    result += i
  }
  return result
})

// ✅ 使用 watch + memoization
import { watch } from 'vue'

const memo = new Map()

watch(
  [firstName, lastName],
  ([newFirst, newLast]) => {
    const key = `${newFirst}-${newLast}`
    if (!memo.has(key)) {
      memo.set(key, expensiveCalculation(newFirst, newLast))
    }
  },
  { immediate: true }
)
</script>
```

---

### 优化 watch 性能

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const data = ref({
  // 大型对象...
})

// ❌ 深度监听大型对象
watch(data, (val) => {
  console.log('data changed')
}, { deep: true })

// ✅ 监听特定属性
watch(() => data.value.someProperty, (val) => {
  console.log('someProperty changed')
})

// ✅ 使用 throttle/debounce
import { debounce } from 'lodash-es'

const handleChange = debounce((value) => {
  console.log('changed:', value)
}, 300)

watch(data, handleChange)
</script>
```

---

## 总结

本章深入探讨了组合式 API 的高级特性：

- ✅ 高级响应式 API（toRef、toRefs、customRef、shallowRef、shallowReactive、readonly、toRaw、markRaw）
- ✅ effectScope 作用域管理
- ✅ 依赖注入模式
- ✅ 组合式函数高级模式
- ✅ 响应式原理深度解析
- ✅ 性能优化技巧

掌握这些内容后，你将能够：
- 构建高性能的响应式系统
- 管理复杂的应用状态
- 优化组件性能
- 编写可复用的组合式函数

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v2.0**
