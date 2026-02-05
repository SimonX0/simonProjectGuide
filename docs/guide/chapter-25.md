# 全局异常捕获

## 全局异常捕获

> **学习目标**：掌握Vue3应用的全局异常处理机制
> **核心内容**：错误处理器、异常边界、日志上报、监控告警

> **为什么需要全局异常捕获？**
>
> 在生产环境中，用户可能遇到各种错误：
> - 网络请求失败
> - 组件渲染错误
> - JavaScript运行时错误
> - Promise未捕获异常
>
> 全局异常捕获可以帮助我们：
> 1. **提升用户体验** - 友好的错误提示，避免白屏
> 2. **快速定位问题** - 收集错误信息，方便调试
> 3. **数据监控** - 统计错误率，评估应用质量
> 4. **自动恢复** - 某些场景下自动恢复功能

### Vue3全局错误处理器

#### app.config.errorHandler

Vue3提供了全局错误处理器，可以捕获组件渲染、生命周期、事件处理器中的错误。

**基础配置：**

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局错误处理器
app.config.errorHandler = (err, instance, info) => {
  // err：错误对象
  // instance：发生错误的组件实例
  // info：错误来源信息（如生命周期钩子、事件处理器等）

  console.error('全局错误捕获：', err)
  console.error('组件实例：', instance)
  console.error('错误信息：', info)

  // 处理错误：上报、提示用户等
  handleError(err, instance, info)
}

function handleError(err: unknown, instance: any, info: string) {
  // 1. 开发环境打印详细信息
  if (import.meta.env.DEV) {
    console.group('🔴 错误详情')
    console.error('错误对象：', err)
    console.error('组件实例：', instance)
    console.error('错误来源：', info)
    console.groupEnd()
  }

  // 2. 生产环境上报错误
  if (import.meta.env.PROD) {
    // 上报到错误监控平台
    reportError({
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : '',
      component: instance?.$options?.name || 'Unknown',
      info,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    })
  }

  // 3. 显示用户友好的错误提示
  showErrorMessage('操作失败，请稍后重试')
}

app.mount('#app')
```

#### 完整的错误处理系统

```typescript
// src/utils/errorHandler.ts

interface ErrorInfo {
  message: string
  stack?: string
  component?: string
  info?: string
  url?: string
  userAgent?: string
  userId?: string
  timestamp: number
}

class ErrorHandler {
  private queue: ErrorInfo[] = []
  private maxQueueSize = 10
  private isReporting = false

  // 处理错误
  handle(err: unknown, instance: any, info: string) {
    const errorInfo: ErrorInfo = {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : '',
      component: instance?.$?.type?.name || instance?.$options?.name || 'Unknown',
      info,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    }

    // 添加用户信息（如果有）
    const userId = localStorage.getItem('userId')
    if (userId) {
      errorInfo.userId = userId
    }

    // 开发环境打印
    if (import.meta.env.DEV) {
      this.logToConsole(errorInfo, err)
    }

    // 生产环境上报
    if (import.meta.env.PROD) {
      this.addToQueue(errorInfo)
      this.report()
    }

    // 显示用户提示
    this.showErrorToUser(errorInfo)
  }

  // 控制台打印
  private logToConsole(errorInfo: ErrorInfo, err: unknown) {
    console.group('🔴 Vue错误')
    console.error('错误信息：', errorInfo.message)
    console.error('错误堆栈：', errorInfo.stack)
    console.error('组件名称：', errorInfo.component)
    console.error('错误来源：', errorInfo.info)
    console.error('原始错误：', err)
    console.groupEnd()
  }

  // 添加到上报队列
  private addToQueue(errorInfo: ErrorInfo) {
    this.queue.push(errorInfo)

    // 限制队列大小
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift()
    }
  }

  // 上报错误
  private async report() {
    if (this.isReporting || this.queue.length === 0) {
      return
    }

    this.isReporting = true

    try {
      const errors = [...this.queue]
      this.queue = []

      // 上报到服务器
      await fetch('/api/error/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors })
      })
    } catch (e) {
      // 上报失败，重新加入队列
      console.error('错误上报失败：', e)
    } finally {
      this.isReporting = false
    }
  }

  // 显示错误提示
  private showErrorToUser(errorInfo: ErrorInfo) {
    // 根据错误类型显示不同提示
    let message = '操作失败，请稍后重试'

    if (errorInfo.message.includes('network')) {
      message = '网络连接失败，请检查网络设置'
    } else if (errorInfo.message.includes('timeout')) {
      message = '请求超时，请稍后重试'
    }

    // 使用Element Plus的Message组件
    ElMessage.error(message)
  }
}

export const errorHandler = new ErrorHandler()

export function setupGlobalErrorHandler(app: any) {
  app.config.errorHandler = (err: unknown, instance: any, info: string) => {
    errorHandler.handle(err, instance, info)
  }
}
```

**在main.ts中使用：**

```typescript
// src/main.ts
import { createApp } from 'vue'
import { setupGlobalErrorHandler } from './utils/errorHandler'
import App from './App.vue'

const app = createApp(App)

// 设置全局错误处理
setupGlobalErrorHandler(app)

app.mount('#app')
```

### JavaScript全局错误处理

#### 全局错误事件监听

```typescript
// src/utils/errorHandler.ts

// 全局JavaScript错误
window.addEventListener('error', (event) => {
  console.error('全局JavaScript错误：', event.error)

  errorHandler.handle(event.error, null, 'Global Error')

  // 阻止默认的错误处理
  event.preventDefault()
})

// 未捕获的Promise错误
window.addEventListener('unhandledrejection', (event) => {
  console.error('未捕获的Promise错误：', event.reason)

  errorHandler.handle(event.reason, null, 'Unhandled Rejection')

  // 阻止默认的控制台错误输出
  event.preventDefault()
})

// 资源加载错误（图片、脚本、样式等）
window.addEventListener('error', (event) => {
  const target = event.target as HTMLElement

  // 只处理资源加载错误
  if (target && target !== window) {
    const tagName = target.tagName.toLowerCase()
    const src = target.getAttribute('src') || target.getAttribute('href')

    console.error(`资源加载失败：${tagName} - ${src}`)

    errorHandler.handle(
      new Error(`Resource load failed: ${tagName} - ${src}`),
      null,
      'Resource Load Error'
    )
  }
}, true) // 使用捕获阶段
```

#### 完整的错误监听系统

```typescript
// src/utils/errorHandler.ts

export class ErrorMonitor {
  constructor() {
    this.init()
  }

  private init() {
    this.setupGlobalError()
    this.setupUnhandledRejection()
    this.setupResourceError()
    this.setupConsoleError()
    this.setupVueError()
  }

  // 全局JavaScript错误
  private setupGlobalError() {
    window.addEventListener('error', (event) => {
      this.report({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      })
    })
  }

  // 未捕获的Promise错误
  private setupUnhandledRejection() {
    window.addEventListener('unhandledrejection', (event) => {
      this.report({
        type: 'promise',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now()
      })
    })
  }

  // 资源加载错误
  private setupResourceError() {
    window.addEventListener('error', (event) => {
      const target = event.target as HTMLElement
      if (target && target !== window) {
        this.report({
          type: 'resource',
          tagName: target.tagName.toLowerCase(),
          src: target.getAttribute('src') || target.getAttribute('href'),
          timestamp: Date.now()
        })
      }
    }, true)
  }

  // 拦截console.error
  private setupConsoleError() {
    const originalError = console.error
    console.error = (...args) => {
      // 调用原始方法
      originalError.apply(console, args)

      // 上报
      this.report({
        type: 'console',
        message: args.map(arg => {
          if (arg instanceof Error) {
            return arg.message + '\n' + arg.stack
          }
          return String(arg)
        }).join(' '),
        timestamp: Date.now()
      })
    }
  }

  // Vue错误（在main.ts中配置）
  private setupVueError() {
    // 这个在setupGlobalErrorHandler中处理
  }

  // 上报错误
  private report(error: any) {
    // 发送到服务器
    fetch('/api/error/monitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    }).catch(e => console.error('错误上报失败：', e))
  }
}

// 初始化错误监控
export const errorMonitor = new ErrorMonitor()
```

### 错误边界组件

虽然Vue3没有像React那样的Error Boundary，但我们可以实现类似的功能：

```vue
<!-- src/components/ErrorBoundary.vue -->
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

interface Props {
  fallback?: string
  showRetry?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fallback: '加载失败',
  showRetry: true
})

const emit = defineEmits<{
  error: [error: Error]
  retry: []
}>()

const hasError = ref(false)
const errorMessage = ref('')

// 捕获子组件错误
onErrorCaptured((err: Error, instance, info) => {
  hasError.value = true
  errorMessage.value = err.message

  console.error('错误边界捕获：', err)
  console.error('错误来源：', info)

  // 触发error事件
  emit('error', err)

  // 上报错误
  errorHandler.handle(err, instance, info)

  // 返回false阻止错误继续传播
  return false
})

// 重试
const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  emit('retry')
}
</script>

<template>
  <div class="error-boundary">
    <!-- 正常渲染插槽内容 -->
    <div v-if="!hasError">
      <slot />
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-fallback">
      <el-icon :size="48" color="#f56c6c">
        <WarningFilled />
      </el-icon>
      <p class="error-message">{{ errorMessage || fallback }}</p>
      <el-button v-if="showRetry" type="primary" @click="retry">
        重试
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-boundary {
  min-height: 200px;
}

.error-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;

  .error-message {
    margin: 20px 0;
    color: #606266;
    font-size: 14px;
  }
}
</style>
```

**使用示例：**

```vue
<template>
  <!-- 包裹可能出错的组件 -->
  <ErrorBoundary @error="handleComponentError" @retry="handleRetry">
    <RiskyComponent :data="data" />
  </ErrorBoundary>
</template>

<script setup lang="ts">
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import RiskyComponent from '@/components/RiskyComponent.vue'

const handleComponentError = (error: Error) => {
  console.log('组件错误：', error)
}

const handleRetry = () => {
  // 重新加载数据等
  location.reload()
}
</script>
```

### 错误上报与监控

#### 上报到服务器

```typescript
// src/utils/errorReporter.ts

interface ErrorReport {
  errors: Array<{
    type: string
    message: string
    stack?: string
    component?: string
    url: string
    userAgent: string
    userId?: string
    timestamp: number
  }>
}

class ErrorReporter {
  private api = '/api/error/report'
  private batchSize = 5
  private batch: any[] = []
  private timer: number | null = null
  private delay = 5000 // 5秒后批量上报

  // 添加错误到批次
  add(error: any) {
    this.batch.push(error)

    if (this.batch.length >= this.batchSize) {
      this.send()
    } else {
      this.scheduleSend()
    }
  }

  // 定时上报
  private scheduleSend() {
    if (this.timer) return

    this.timer = window.setTimeout(() => {
      this.send()
      this.timer = null
    }, this.delay)
  }

  // 发送错误
  private async send() {
    if (this.batch.length === 0) return

    const errors = [...this.batch]
    this.batch = []

    try {
      await fetch(this.api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors })
      })
    } catch (e) {
      // 上报失败，重新加入队列
      this.batch.unshift(...errors)
    }
  }
}

export const errorReporter = new ErrorReporter()
```

#### 集成第三方监控服务

**集成Sentry：**

```bash
npm install @sentry/vue
```

```typescript
// src/main.ts
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 初始化Sentry
Sentry.init({
  app,
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router)
    })
  ],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
  beforeSend(event) {
    // 过滤不需要上报的错误
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
      // 忽略chunk加载错误
      return null
    }
    return event
  }
})
```

**集成阿里云日志服务：**

```typescript
// src/utils/aliyunLogger.ts
import SLSWebTracker from 'aliyun-sls-web-tracker'

const slsTracker = new SLSWebTracker({
  host: 'cn-beijing.log.aliyuncs.com',
  project: 'your-project',
  logstore: 'your-logstore',
  time: 1, // 上传间隔（秒）
  count: 10 // 批量上传数量
})

export function logError(error: Error, context?: any) {
  slsTracker.send({
    type: 'error',
    message: error.message,
    stack: error.stack,
    ...context
  })
}
```

### 实战案例

#### 完整的错误处理系统

```typescript
// src/utils/errorHandler/index.ts

export { setupGlobalErrorHandler } from './globalHandler'
export { ErrorBoundary } from './ErrorBoundary.vue'
export { errorReporter } from './reporter'
export { errorMonitor } from './monitor'
```

```typescript
// src/main.ts
import { createApp } from 'vue'
import { setupGlobalErrorHandler, errorMonitor } from './utils/errorHandler'
import App from './App.vue'

const app = createApp(App)

// 设置全局错误处理
setupGlobalErrorHandler(app)

app.mount('#app')
```

#### 错误处理最佳实践

**1. 分层处理**

```typescript
// 组件级错误
const handleComponentError = (error: Error) => {
  // 只处理组件相关的错误
  console.error('组件错误：', error)
}

// 全局级错误
app.config.errorHandler = (err, instance, info) => {
  // 处理所有未被组件处理的错误
  errorHandler.handle(err, instance, info)
}
```

**2. 错误分类处理**

```typescript
// 根据错误类型进行不同处理
const handleError = (error: Error) => {
  if (error.message.includes('network')) {
    // 网络错误
    showNetworkError()
  } else if (error.message.includes('timeout')) {
    // 超时错误
    showTimeoutError()
  } else if (error.message.includes('401')) {
    // 认证错误
    handleAuthError()
  } else {
    // 其他错误
    showGenericError()
  }
}
```

**3. 错误恢复策略**

```typescript
// 自动重试
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
}
```

### 本章小结

| 内容 | 说明 |
|------|------|
| `app.config.errorHandler` | Vue3全局错误处理器 |
| `onErrorCaptured` | 组件级错误捕获 |
| `error`/`unhandledrejection` | 全局JS/Promise错误事件 |
| 错误上报 | 批量上报、第三方监控 |
| 错误边界 | 类似React的Error Boundary |

---
