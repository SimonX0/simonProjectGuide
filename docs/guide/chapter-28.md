# 调试技巧与工具
## # 4.4 调试技巧与工具
## 调试技巧与工具

> **学习目标**：掌握Vue3调试技巧和工具
> **核心内容**：Vue DevTools、浏览器调试、性能分析、错误处理

> **为什么需要掌握调试技巧？**
> - 快速定位问题，节省开发时间
> - 理解代码执行流程
> - 优化性能瓶颈
> - 提升代码质量

### Vue DevTools 完全指南

#### 安装 Vue DevTools

**Chrome/Edge 浏览器：**
```
1. 访问 Chrome Web Store
2. 搜索 "Vue.js devtools"
3. 点击 "添加至 Chrome/Edge"
```

**Firefox 浏览器：**
```
1. 访问 Firefox Add-ons
2. 搜索 "Vue.js devtools"
3. 点击 "添加到 Firefox"
```

#### Vue DevTools 面板说明

##### 1. 组件树（Components）

```
┌─────────────────────────────────────────┐
│  Vue DevTools - 组件树面板                │
├─────────────────────────────────────────┤
│  <App>                                   │
│    ├─ <RouterView>                      │
│    │   └─ <Home>                        │
│    │       ├─ <Header>                  │
│    │       └─ <ProductList>             │
│    │           └─ <ProductCard> × 10   │
│    └─ <Footer>                          │
└─────────────────────────────────────────┘
```

**功能说明：**
- **选择组件**：点击组件可查看详细信息
- **Props**：查看组件接收的属性
- **Emits**：查看组件触发的事件
- **Slots**：查看组件插槽内容

##### 2. Vuex/Pinia 面板

```
┌─────────────────────────────────────────┐
│  Pinia Store                            │
├─────────────────────────────────────────┤
│  user Store                             │
│    State                                │
│      - name: "张三"                     │
│      - token: "xxx..."                 │
│    Getters                              │
│      - isLoggedIn: true                │
│    Actions                              │
│      - login()                          │
│      - logout()                         │
└─────────────────────────────────────────┘
```

##### 3. 路由面板

```
┌─────────────────────────────────────────┐
│  Router                                 │
├─────────────────────────────────────────┤
│  Current Route: /products/123           │
│                                         │
│  Route Matched:                         │
│    path: "/products/:id"                │
│    name: "ProductDetail"                │
│    params: { id: "123" }                │
│    query: { tab: "reviews" }            │
└─────────────────────────────────────────┘
```

##### 4. 时间旅行（Timeline）

```
┌─────────────────────────────────────────┐
│  Timeline                               │
├─────────────────────────────────────────┤
│  ▶ 事件追踪：                           │
│    [10:23:45] component mounted         │
│    [10:23:46] mutation committed        │
│    [10:23:47] action dispatched         │
│    [10:23:48] navigation triggered      │
└─────────────────────────────────────────┘
```

#### Vue DevTools 实战技巧

**1. 实时修改组件数据**

```vue
<!-- ProductCard.vue -->
<script setup lang="ts">
const product = ref({
  name: 'iPhone 15',
  price: 5999,
  stock: 100
})

function addToCart() {
  console.log('添加到购物车')
}
</script>
```

在 DevTools 中：
1. 选择 `<ProductCard>` 组件
2. 右侧 `Setup` 标签查看响应式数据
3. 双击 `product.price` 的值，修改为 `4999`
4. 页面实时更新，无需刷新

**2. 监控组件性能**

```
Performance 面板：
  ├─ 渲染时间: 2.5ms
  ├─ 重新渲染次数: 3
  └─ 最慢操作: computed 计算
```

**3. 导出/导入组件状态**

```javascript
// 导出当前状态
const state = DevTools.getComponentState()
console.log(JSON.stringify(state))

// 导入状态（用于复现问题）
DevTools.setComponentState(JSON.parse(savedState))
```

---

### 浏览器调试技巧

#### Console 调试

##### 基础输出

```vue
<script setup lang="ts>
// 基础输出
console.log('普通日志')
console.warn('警告信息')
console.error('错误信息')
console.info('信息提示')

// 分组输出
console.group('用户信息')
console.log('姓名：', user.name)
console.log('年龄：', user.age)
console.groupEnd()

// 表格输出
console.table([
  { id: 1, name: '张三', age: 25 },
  { id: 2, name: '李四', age: 30 }
])

// 计数
console.count('渲染次数')
console.count('渲染次数') // 渲染次数: 1
console.count('渲染次数') // 渲染次数: 2

// 计时
console.time('数据加载')
fetchData().then(() => {
  console.timeEnd('数据加载') // 数据加载: 245ms
})
</script>
```

##### 条件断点

```vue
<script setup lang="ts>
const count = ref(0)

function handleClick() {
  count.value++

  // 只在特定条件下触发断点
  // debugger // 无条件断点

  // 条件断点（在浏览器DevTools中设置）
  // 右键行号 → Add conditional breakpoint → count > 5
}
</script>
```

##### 性能监控

```javascript
// 标记性能点
performance.mark('fetch-start')
await fetchData()
performance.mark('fetch-end')

// 测量两个标记之间的时间
performance.measure('fetch-duration', 'fetch-start', 'fetch-end')
const measure = performance.getEntriesByName('fetch-duration')[0]
console.log(`数据加载耗时: ${measure.duration}ms`)
```

#### Sources 面板调试

##### 设置断点

```
1. 打开 Sources 面板
2. 找到需要调试的 .vue 文件
3. 点击行号设置断点
4. 刷新页面触发断点

断点类型：
  - 普通断点：点击行号
  - 条件断点：右键 → Add conditional breakpoint
  - 日志断点：右键 → Add logpoint
```

##### 调试快捷键

| 快捷键 | 功能 |
|--------|------|
| `F8` | 继续 / Resume |
| `F10` | 单步跳过 / Step Over |
| `F11` | 单步进入 / Step Into |
| `Shift+F11` | 单步跳出 / Step Out |
| `Ctrl+F10` | 跳转到下一个断点 |

##### 查看调用栈

```
Call Stack 面板：
  handleClick @ ProductCard.vue:15
  addToCart @ ShoppingCart.vue:42
  processCheckout @ Checkout.vue:18
  (anonymous) @ main.ts:10
```

---

### Vue3 专用调试方法

#### 使用 debug 修饰符

```vue
<template>
  <!-- 点击时自动进入调试模式 -->
  <button @click="handleClick">点击调试</button>

  <!-- 使用 debug 修饰符 -->
  <button @click.debug="handleClick">点击调试</button>
</template>
```

#### 监控响应式变化

```javascript
import { watch, watchEffect } from 'vue'

// watchEffect 自动追踪依赖
watchEffect(() => {
  console.log('count 变化了:', count.value)
})

// watch 监听特定源
watch(count, (newVal, oldVal) => {
  console.log(`count 从 ${oldVal} 变为 ${newVal}`)
})

// 深度监听对象
watch(user, (newVal) => {
  console.log('用户对象变化:', newVal)
}, { deep: true })

// 监听多个源
watch([count, name], ([newCount, newName]) => {
  console.log(`count=${newCount}, name=${newName}`)
})
```

#### 组件生命周期调试

```vue
<script setup lang="ts">
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onRenderTracked,
  onRenderTriggered
} from 'vue'

onBeforeMount(() => {
  console.log('🏗️ 组件即将挂载')
})

onMounted(() => {
  console.log('✅ 组件已挂载，DOM 可用')
})

onBeforeUpdate(() => {
  console.log('🔄 组件即将更新')
})

onUpdated(() => {
  console.log('✨ 组件已更新')
})

onBeforeUnmount(() => {
  console.log('👋 组件即将卸载')
})

onUnmounted(() => {
  console.log('❌ 组件已卸载')
})

// 调试渲染性能
onRenderTracked((e) => {
  console.log('📍 渲染追踪:', e.target, e.key)
})

onRenderTriggered((e) => {
  console.log('⚡ 渲染触发:', e.target, e.key, e.type)
})
</script>
```

---

### 网络请求调试

#### 拦截并记录 API 请求

```typescript
// utils/request.ts
import type { AxiosRequestConfig } from 'axios'

// 请求拦截器
function requestInterceptor(config: AxiosRequestConfig) {
  console.log('🚀 发送请求:', {
    url: config.url,
    method: config.method,
    params: config.params,
    data: config.data
  })
  return config
}

// 响应拦截器
function responseInterceptor(response: any) {
  console.log('✅ 收到响应:', {
    url: response.config.url,
    status: response.status,
    data: response.data
  })
  return response
}

// 错误拦截器
function errorInterceptor(error: any) {
  console.error('❌ 请求失败:', {
    url: error.config?.url,
    message: error.message,
    code: error.code,
    response: error.response?.data
  })
  return Promise.reject(error)
}
```

#### 使用 Network 面板

```
Network 面板功能：

  1. 过滤请求类型
     - XHR/Fetch：API请求
     - JS：脚本文件
     - CSS：样式文件
     - Img：图片资源

  2. 查看请求详情
     - Headers：请求头和响应头
     - Payload：请求体
     - Response：响应数据
     - Timing：请求耗时

  3. 导出请求数据
     - 右键 → Save all as HAR
```

---

### 性能分析与优化

#### Performance 面板分析

```
录制性能分析步骤：

1. 打开 DevTools → Performance
2. 点击 "Record" 按钮（圆点）
3. 执行需要分析的操作
4. 点击 "Stop" 停止录制
5. 分析结果

关键指标：
  - FCP (First Contentful Paint): 首次内容绘制
  - LCP (Largest Contentful Paint): 最大内容绘制
  - FID (First Input Delay): 首次输入延迟
  - CLS (Cumulative Layout Shift): 累积布局偏移
```

#### 组件渲染性能分析

```vue
<script setup lang="ts>
import { onRenderTracked, onRenderTriggered, ref } from 'vue'

const renderCount = ref(0)
const triggers = ref<any[]>([])

onRenderTracked((e) => {
  renderCount.value++
})

onRenderTriggered((e) => {
  triggers.value.push({
    target: e.target?.$?.type || 'unknown',
    key: e.key,
    type: e.type
  })
})

// 查看渲染统计
function printRenderStats() {
  console.log('总渲染次数:', renderCount.value)
  console.table(triggers.value)
}
</script>
```

---

### 错误处理与监控

#### 全局错误处理

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局错误处理器
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('组件实例:', instance)
  console.error('错误信息:', info)

  // 上报错误到监控平台
  reportError({
    message: err.message,
    stack: err.stack,
    component: instance?.$options.name,
    info
  })
}
```

#### 异步错误捕获

```typescript
// 使用 try-catch
async function fetchData() {
  try {
    const response = await fetch('/api/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('数据加载失败:', error)
    throw error
  }
}

// 使用 .catch()
fetchData()
  .then(data => console.log(data))
  .catch(error => console.error(error))
```

---

### 调试最佳实践

#### 1. 使用有意义的日志

```javascript
// ❌ 不好
console.log(data)
console.log(error)

// ✅ 好
console.log('[API] 获取用户列表:', data)
console.error('[API] 用户列表加载失败:', error.message)
```

#### 2. 添加错误边界

```vue
<!-- ErrorBoundary.vue -->
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  errorMessage.value = err.message
  console.error('捕获到错误:', err, instance, info)
  return false // 阻止错误继续传播
})
</script>

<template>
  <div v-if="hasError" class="error-boundary">
    <h3>出错了</h3>
    <p>{{ errorMessage }}</p>
    <button @click="hasError = false">重试</button>
  </div>
  <slot v-else />
</template>
```

#### 3. 环境区分

```typescript
// utils/logger.ts
const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log('[DEV]', ...args)
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn('[DEV]', ...args)
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
    // 生产环境上报错误
    if (!isDev) {
      reportError(args)
    }
  }
}
```

---
