# 组合式API深入

## 组合式API深入

> **学习目标**：深入掌握组合式API的使用
> **核心内容**：ref/reactive、computed/watch、组合式函数

### ref 和 reactive

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'

// ref：用于基本类型和对象
const count = ref(0)
console.log(count.value) // 访问值需要.value

// reactive：用于对象类型
interface User {
  name: string
  age: number
}
const user = reactive<User>({
  name: '张三',
  age: 25
})
console.log(user.name) // 直接访问属性

// ref 用于对象
const userRef = ref<User>({ name: '李四', age: 30 })
console.log(userRef.value.name)
</script>
```

### computed 和 watch

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 可写的计算属性
const fullName = computed({
  get: () => firstName.value + ' ' + lastName.value,
  set: (value: string) => {
    [firstName.value, lastName.value] = value.split(' ')
  }
})

// 侦听器
watch(count, (newVal, oldVal) => {
  console.log(`从 ${oldVal} 变为 ${newVal}`)
})

// 侦听多个源
watch([count, firstName], ([newCount, newFirst]) => {
  console.log(newCount, newFirst)
})

// 深度侦听
watch(user, (newVal) => {
  console.log('用户变化:', newVal)
}, { deep: true })

// 立即执行
watch(count, (newVal) => {
  console.log('当前值:', newVal)
}, { immediate: true })
</script>
```

### 组合式函数（Composables）

#### 基础组合式函数

```typescript
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

```typescript
// composables/useFetch.ts
import { ref } from 'vue'

export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    try {
      const response = await fetch(url)
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  fetch()

  return { data, error, loading }
}
```

#### 自定义钩子函数最佳实践

```typescript
// composables/useDebounce.ts - 防抖钩子
import { ref, watch } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay: number) {
  const debouncedValue = ref(value.value) as Ref<T>

  let timer: NodeJS.Timeout

  watch(value, (newValue) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}
```

```typescript
// composables/useThrottle.ts - 节流钩子
import { ref, watch } from 'vue'

export function useThrottle<T>(value: Ref<T>, delay: number) {
  const throttledValue = ref(value.value) as Ref<T>
  let lastCall = 0

  watch(value, (newValue) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      throttledValue.value = newValue
    }
  })

  return throttledValue
}
```

```typescript
// composables/useLocalStorage.ts - 本地存储钩子
import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const storedValue = localStorage.getItem(key)
  const value = ref<T>(
    storedValue ? JSON.parse(storedValue) : defaultValue
  )

  watch(
    value,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return value
}
```

```typescript
// composables/useScroll.ts - 滚动钩子
import { ref, onMounted, onUnmounted } from 'vue'

export function useScroll() {
  const x = ref(0)
  const y = ref(0)
  const isScrolling = ref(false)

  let timer: NodeJS.Timeout

  function update() {
    x.value = window.scrollX
    y.value = window.scrollY
    isScrolling.value = true

    clearTimeout(timer)
    timer = setTimeout(() => {
      isScrolling.value = false
    }, 150)
  }

  onMounted(() => window.addEventListener('scroll', update))
  onUnmounted(() => window.removeEventListener('scroll', update))

  return { x, y, isScrolling }
}
```

```typescript
// composables/useWindowSize.ts - 窗口大小钩子
import { ref, onMounted, onUnmounted } from 'vue'

export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  function update() {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return { width, height }
}
```

```typescript
// composables/useClickOutside.ts - 点击外部钩子
import { ref, onMounted, onUnmounted } from 'vue'

export function useClickOutside(target: Ref<HTMLElement | undefined>) {
  const isOutside = ref(false)

  function handleClick(event: MouseEvent) {
    if (target.value && !target.value.contains(event.target as Node)) {
      isOutside.value = true
    } else {
      isOutside.value = false
    }
  }

  onMounted(() => document.addEventListener('click', handleClick))
  onUnmounted(() => document.removeEventListener('click', handleClick))

  return { isOutside }
}
```

```typescript
// composables/useClipboard.ts - 剪贴板钩子
import { ref } from 'vue'

export function useClipboard() {
  const text = ref('')
  const supported = ref(!!navigator.clipboard)
  const error = ref<Error | null>(null)

  async function copy(content: string): Promise<boolean> {
    if (!supported.value) return false

    try {
      await navigator.clipboard.writeText(content)
      text.value = content
      error.value = null
      return true
    } catch (e) {
      error.value = e as Error
      return false
    }
  }

  async function paste(): Promise<string> {
    if (!supported.value) return ''

    try {
      const content = await navigator.clipboard.readText()
      text.value = content
      error.value = null
      return content
    } catch (e) {
      error.value = e as Error
      return ''
    }
  }

  return { text, supported, error, copy, paste }
}
```

```typescript
// composables/useDownload.ts - 下载钩子
import { ref } from 'vue'

export function useDownload() {
  const downloading = ref(false)
  const error = ref<Error | null>(null)

  async function download(url: string, filename?: string) {
    downloading.value = true
    error.value = null

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      link.click()

      window.URL.revokeObjectURL(downloadUrl)
    } catch (e) {
      error.value = e as Error
    } finally {
      downloading.value = false
    }
  }

  return { downloading, error, download }
}
```

```typescript
// composables/useIntersectionObserver.ts - 交叉观察钩子
import { ref, onMounted, onUnmounted } from 'vue'

export function useIntersectionObserver(target: Ref<HTMLElement | undefined>, options?: IntersectionObserverInit) {
  const isIntersecting = ref(false)
  const entries = ref<IntersectionObserverEntry[]>([])

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!target.value) return

    observer = new IntersectionObserver((e) => {
      entries.value = e
      isIntersecting.value = e.some(entry => entry.isIntersecting)
    }, options)

    observer.observe(target.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { isIntersecting, entries }
}
```

#### 组合式函数组合使用

```typescript
// composables/useInfiniteScroll.ts - 无限滚动组合钩子
import { ref } from 'vue'
import { useFetch } from './useFetch'
import { useIntersectionObserver } from './useIntersectionObserver'

export function useInfiniteScroll(url: string) {
  const page = ref(1)
  const items = ref<any[]>([])
  const loading = ref(false)
  const hasMore = ref(true)

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return

    loading.value = true
    try {
      const response = await fetch(`${url}?page=${page.value}`)
      const newItems = await response.json()

      if (newItems.length === 0) {
        hasMore.value = false
      } else {
        items.value.push(...newItems)
        page.value++
      }
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    hasMore,
    loadMore,
    page
  }
}
```

#### 使用组合式函数

```vue
<!-- 使用组合式函数 -->
<script setup lang="ts">
import { ref } from 'vue'
import { useMouse } from '@/composables/useMouse'
import { useFetch } from '@/composables/useFetch'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useScroll } from '@/composables/useScroll'
import { useWindowSize } from '@/composables/useWindowSize'
import { useDebounce } from '@/composables/useDebounce'
import { useClipboard } from '@/composables/useClipboard'

// 鼠标位置
const { x, y } = useMouse()

// 数据请求
const { data, error, loading } = useFetch<User[]>('/api/users')

// 本地存储
const theme = useLocalStorage<'light' | 'dark'>('theme', 'light')

// 滚动位置
const { y: scrollY } = useScroll()

// 窗口大小
const { width, height } = useWindowSize()

// 防抖输入
const searchInput = ref('')
const debouncedSearch = useDebounce(searchInput, 300)

// 剪贴板
const { text, copy } = useClipboard()
</script>

<template>
  <div>
    <p>鼠标位置: {{ x }}, {{ y }}</p>
    <p>窗口大小: {{ width }} x {{ height }}</p>
    <p>滚动位置: {{ scrollY }}</p>

    <input v-model="searchInput" placeholder="搜索...">
    <p>防抖搜索: {{ debouncedSearch }}</p>

    <button @click="copy('复制的内容')">{{ text || '复制到剪贴板' }}</button>

    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <ul v-else>
      <li v-for="user in data" :key="user.id">{{ user.name }}</li>
    </ul>
  </div>
</template>
```

#### 组合式函数最佳实践

```typescript
// ✅ 好的组合式函数设计
export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  // 明确的返回类型
  interface UseCounterReturn {
    count: Ref<number>
    increment: () => void
    decrement: () => void
    reset: () => void
    setValue: (value: number) => void
  }

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = initialValue
  }

  function setValue(value: number) {
    count.value = value
  }

  return {
    count,
    increment,
    decrement,
    reset,
    setValue
  }
}

// ✅ 可配置的组合式函数
export function useApi(baseUrl: string) {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    request
  }
}
```

**组合式函数命名约定：**
- 统一使用 `use` 前缀
- 驼峰命名法
- 语义化命名

```typescript
// ✅ 好的命名
useMouse
useFetch
useLocalStorage
useDebounce
useIntersectionObserver

// ❌ 不好的命名
mouse
fetchData
storage
debounceFn
```

---
