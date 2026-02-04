# 第27章：内存管理与溢出处理

## 第27章 内存管理与溢出处理

> **学习目标**：掌握Vue3应用的内存管理和溢出处理技巧
> **核心内容**：内存泄漏识别、资源清理、性能监控、内存优化

> **为什么需要关注内存管理？**
>
> 内存问题会导致：
> 1. **页面卡顿** - 内存占用过高导致页面响应缓慢
> 2. **浏览器崩溃** - 内存溢出导致标签页崩溃
> 3. **资源浪费** - 未释放的资源占用大量内存
> 4. **用户体验差** - 长时间使用后性能下降

### 27.1 Vue3中的内存泄漏

#### 27.1.1 常见内存泄漏场景

**1. 全局变量未清理**

```typescript
// ❌ 错误示例：全局变量持有组件引用
// src/store/module.ts
let globalData: any = null

export function setGlobalData(data: any) {
  globalData = data  // 如果data包含组件实例，会导致内存泄漏
}

// ✅ 正确做法：使用WeakMap
const globalDataMap = new WeakMap()

export function setGlobalData(key: object, data: any) {
  globalDataMap.set(key, data)  // key被回收时自动清理
}
```

**2. 事件监听未移除**

```vue
<!-- ❌ 错误示例 -->
<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // 添加了事件监听但没有移除
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)
})

function handleResize() {
  console.log('resize')
}

function handleScroll() {
  console.log('scroll')
}
</script>

<!-- ✅ 正确做法 -->
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 组件卸载时移除监听
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
})
</script>
```

**3. 定时器未清理**

```vue
<!-- ❌ 错误示例 -->
<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // 定时器没有被清理
  setInterval(() => {
    console.log('tick')
  }, 1000)

  setTimeout(() => {
    console.log('after 1s')
  }, 1000)
})
</script>

<!-- ✅ 正确做法 -->
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

let timer: number | null = null
let timeout: number | null = null

onMounted(() => {
  timer = window.setInterval(() => {
    console.log('tick')
  }, 1000)

  timeout = window.setTimeout(() => {
    console.log('after 1s')
  }, 1000)
})

onUnmounted(() => {
  // 清理定时器
  if (timer) clearInterval(timer)
  if (timeout) clearTimeout(timeout)
})
</script>
```

**4. 第三方库实例未销毁**

```vue
<!-- ❌ 错误示例：ECharts图表未销毁 -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLDivElement>()

onMounted(() => {
  const chart = echarts.init(chartRef.value!)
  chart.setOption({ /* ... */ })
  // 忘记销毁图表实例
})
</script>

<!-- ✅ 正确做法 -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

onMounted(() => {
  chartInstance = echarts.init(chartRef.value!)
  chartInstance.setOption({ /* ... */ })
})

onUnmounted(() => {
  // 销毁图表实例
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>
```

**5. WebSocket未关闭**

```vue
<!-- ❌ 错误示例 -->
<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  const ws = new WebSocket('ws://localhost:8080')

  ws.onmessage = (event) => {
    console.log(event.data)
  }

  // 忘记关闭WebSocket连接
})
</script>

<!-- ✅ 正确做法 -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const ws = ref<WebSocket | null>(null)

onMounted(() => {
  ws.value = new WebSocket('ws://localhost:8080')

  ws.value.onmessage = (event) => {
    console.log(event.data)
  }

  ws.value.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
})

onUnmounted(() => {
  // 关闭WebSocket连接
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }
})
</script>
```

#### 27.1.2 使用组合式函数避免内存泄漏

```typescript
// src/composables/useEventListener.ts

import { onUnmounted } from 'vue'

export function useEventListener<K extends keyof WindowEventMap>(
  target: Window | HTMLElement,
  event: K,
  handler: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  target.addEventListener(event, handler, options)

  onUnmounted(() => {
    target.removeEventListener(event, handler, options)
  })
}

// 使用示例
// useEventListener(window, 'resize', handleResize)
```

```typescript
// src/composables/useInterval.ts

import { onUnmounted, ref } from 'vue'

export function useInterval(callback: () => void, delay: number | null) {
  const timer = ref<number | null>(null)

  const start = () => {
    if (delay !== null) {
      timer.value = window.setInterval(callback, delay)
    }
  }

  const stop = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  // 自动启动
  start()

  // 组件卸载时自动清理
  onUnmounted(() => {
    stop()
  })

  return { start, stop, timer }
}

// 使用示例
// const { stop } = useInterval(() => console.log('tick'), 1000)
```

```typescript
// src/composables/useWebSocket.ts

import { onUnmounted, ref } from 'vue'

export function useWebSocket(url: string) {
  const ws = ref<WebSocket | null>(null)
  const data = ref<any>(null)
  const error = ref<Event | null>(null)
  const connected = ref(false)

  const connect = () => {
    ws.value = new WebSocket(url)

    ws.value.onopen = () => {
      connected.value = true
    }

    ws.value.onmessage = (event) => {
      data.value = event.data
    }

    ws.value.onerror = (event) => {
      error.value = event
    }

    ws.value.onclose = () => {
      connected.value = false
    }
  }

  const send = (message: string) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(message)
    }
  }

  const close = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
  }

  // 组件卸载时自动关闭
  onUnmounted(() => {
    close()
  })

  return {
    data,
    error,
    connected,
    connect,
    send,
    close
  }
}

// 使用示例
// const { data, connected, send } = useWebSocket('ws://localhost:8080')
```

### 27.2 内存溢出处理

#### 27.2.1 大数据处理

```typescript
// 虚拟滚动处理大量数据
import { ref, computed } from 'vue'

interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualScroll<T>(
  items: Ref<T[]>,
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options

  const scrollTop = ref(0)

  const visibleRange = computed(() => {
    const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan)
    const end = Math.min(
      items.value.length,
      Math.ceil((scrollTop.value + containerHeight) / itemHeight) + overscan
    )
    return { start, end }
  })

  const visibleItems = computed(() => {
    return items.value.slice(visibleRange.value.start, visibleRange.value.end)
  })

  const totalHeight = computed(() => items.value.length * itemHeight)
  const offsetY = computed(() => visibleRange.value.start * itemHeight)

  const onScroll = (event: Event) => {
    scrollTop.value = (event.target as HTMLElement).scrollTop
  }

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll
  }
}
```

**虚拟滚动组件：**

```vue
<!-- src/components/VirtualScroll.vue -->
<script setup lang="ts" generic="T">
import { ref } from 'vue'
import { useVirtualScroll } from '@/composables/useVirtualScroll'

interface Props {
  items: T[]
  itemHeight: number
  height: number
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 50,
  height: 400
})

const { visibleItems, totalHeight, offsetY, onScroll } = useVirtualScroll(
  ref(props.items),
  {
    itemHeight: props.itemHeight,
    containerHeight: props.height
  }
)
</script>

<template>
  <div
    class="virtual-scroll"
    :style="{ height: `${height}px` }"
    @scroll="onScroll"
  >
    <div
      class="virtual-scroll-spacer"
      :style="{ height: `${totalHeight}px` }"
    >
      <div
        class="virtual-scroll-content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="(item, index) in visibleItems"
          :key="index"
          class="virtual-scroll-item"
          :style="{ height: `${itemHeight}px` }"
        >
          <slot :item="item" :index="index" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-scroll {
  overflow-y: auto;
}

.virtual-scroll-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
</style>
```

#### 27.2.2 大文件上传分片

```typescript
// src/utils/fileUpload.ts

export interface UploadChunkOptions {
  file: File
  chunkSize?: number  // 分片大小（字节）
  concurrency?: number  // 并发数
  onProgress?: (progress: number) => void
}

export async function uploadInChunks(options: UploadChunkOptions) {
  const {
    file,
    chunkSize = 5 * 1024 * 1024,  // 默认5MB
    concurrency = 3,
    onProgress
  } = options

  const chunks = Math.ceil(file.size / chunkSize)
  const uploadedChunks: number[] = []

  // 上传单个分片
  const uploadChunk = async (index: number): Promise<void> => {
    const start = index * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)

    const formData = new FormData()
    formData.append('file', chunk)
    formData.append('filename', file.name)
    formData.append('chunkIndex', index.toString())
    formData.append('totalChunks', chunks.toString())

    await fetch('/api/upload/chunk', {
      method: 'POST',
      body: formData
    })

    uploadedChunks.push(index)
    onProgress?.(uploadedChunks.length / chunks)
  }

  // 并发控制
  const queue: Promise<void>[] = []
  for (let i = 0; i < chunks; i++) {
    queue.push(uploadChunk(i))

    if (queue.length >= concurrency) {
      await Promise.race(queue)
      queue.splice(
        queue.findIndex(p => {
          return p.then(() => false, () => false)
        }),
        1
      )
    }
  }

  await Promise.all(queue)

  // 通知服务器合并分片
  await fetch('/api/upload/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      totalChunks: chunks
    })
  })
}
```

#### 27.2.3 图片懒加载

```vue
<!-- src/components/LazyImage.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string
  placeholder?: string
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'data:image/svg+xml,...',
  alt: ''
})

const imgRef = ref<HTMLImageElement>()
const loaded = ref(false)
const error = ref(false)

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage()
          observer?.unobserve(entry.target)
        }
      })
    },
    { rootMargin: '50px' }
  )

  if (imgRef.value) {
    observer.observe(imgRef.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})

const loadImage = () => {
  const img = new Image()

  img.onload = () => {
    loaded.value = true
  }

  img.onerror = () => {
    error.value = true
  }

  img.src = props.src
}
</script>

<template>
  <img
    ref="imgRef"
    :src="loaded ? src : placeholder"
    :alt="alt"
    :class="{ 'lazy-image-loaded': loaded, 'lazy-image-error': error }"
  />
</template>

<style scoped>
.lazy-image-loaded {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
```

### 27.3 内存监控

#### 27.3.1 内存使用监控

```typescript
// src/utils/memoryMonitor.ts

export interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  usage: number  // 使用百分比
}

export function getMemoryInfo(): MemoryInfo | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }
  }
  return null
}

export class MemoryMonitor {
  private timer: number | null = null
  private history: MemoryInfo[] = []
  private maxHistory = 100

  constructor(private interval = 5000) {}

  start() {
    this.timer = window.setInterval(() => {
      const info = getMemoryInfo()
      if (info) {
        this.history.push(info)
        if (this.history.length > this.maxHistory) {
          this.history.shift()
        }

        this.checkMemory(info)
      }
    }, this.interval)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private checkMemory(info: MemoryInfo) {
    // 内存使用超过80%警告
    if (info.usage > 80) {
      console.warn(`⚠️ 内存使用过高: ${info.usage.toFixed(2)}%`)

      // 可以触发清理操作
      this.triggerCleanup()
    }
  }

  private triggerCleanup() {
    // 清理缓存
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name))
      })
    }

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('memory-warning', {
      detail: { usage: this.getCurrentUsage() }
    }))
  }

  getCurrentUsage(): number {
    const info = getMemoryInfo()
    return info?.usage || 0
  }

  getHistory(): MemoryInfo[] {
    return [...this.history]
  }
}

export const memoryMonitor = new MemoryMonitor()
```

#### 27.3.2 性能监控组件

```vue
<!-- src/components/PerformanceMonitor.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getMemoryInfo } from '@/utils/memoryMonitor'

const show = ref(false)
const memoryInfo = ref<ReturnType<typeof getMemoryInfo> | null>(null)

let timer: number | null = null

onMounted(() => {
  timer = window.setInterval(() => {
    if (show.value) {
      memoryInfo.value = getMemoryInfo()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 快捷键 Ctrl+Shift+M 显示/隐藏
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'M') {
    show.value = !show.value
  }
})
</script>

<template>
  <div v-if="show" class="performance-monitor">
    <div class="monitor-header">
      <span>性能监控</span>
      <button @click="show = false">×</button>
    </div>
    <div v-if="memoryInfo" class="monitor-content">
      <div class="monitor-item">
        <span>已用内存:</span>
        <span>{{ (memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2) }} MB</span>
      </div>
      <div class="monitor-item">
        <span>总内存:</span>
        <span>{{ (memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2) }} MB</span>
      </div>
      <div class="monitor-item">
        <span>内存限制:</span>
        <span>{{ (memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2) }} MB</span>
      </div>
      <div class="monitor-item">
        <span>使用率:</span>
        <span :class="{ warning: memoryInfo.usage > 80 }">
          {{ memoryInfo.usage.toFixed(2) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 250px;
  background: #1e1e1e;
  color: #fff;
  border-radius: 8px;
  overflow: hidden;
  z-index: 9999;
  font-size: 12px;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #333;
}

.monitor-header button {
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

.monitor-content {
  padding: 10px;
}

.monitor-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.warning {
  color: #f56c6c;
  font-weight: bold;
}
</style>
```

### 27.4 内存优化最佳实践

#### 27.4.1 对象池模式

```typescript
// src/utils/objectPool.ts

export class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset: (obj: T) => void
  private maxSize: number

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxSize = 100
  ) {
    this.factory = factory
    this.reset = reset
    this.maxSize = maxSize
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.factory()
  }

  release(obj: T) {
    if (this.pool.length < this.maxSize) {
      this.reset(obj)
      this.pool.push(obj)
    }
  }

  clear() {
    this.pool = []
  }
}

// 使用示例：DOM元素池
const elementPool = new ObjectPool(
  () => document.createElement('div'),
  (el) => {
    el.innerHTML = ''
    el.className = ''
  }
)
```

#### 27.4.2 清理策略

```typescript
// src/utils/cleanup.ts

// 定时清理
export class PeriodicCleanup {
  private timer: number | null = null
  private cleanupFn: () => void

  constructor(cleanupFn: () => void, interval = 60000) {
    this.cleanupFn = cleanupFn
    this.timer = window.setInterval(cleanupFn, interval)
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}

// LRU缓存清理
export class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // 移到最后
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    // 删除旧的（如果存在）
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    // 如果超过大小，删除最旧的
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }
}
```

### 27.5 本章小结

| 内容 | 说明 |
|------|------|
| 内存泄漏场景 | 事件监听、定时器、第三方库实例 |
| 组合式函数 | useEventListener、useInterval、useWebSocket |
| 虚拟滚动 | 处理大量数据 |
| 大文件上传 | 分片上传 |
| 内存监控 | 实时监控内存使用情况 |
| 优化策略 | 对象池、LRU缓存、定期清理 |

---
