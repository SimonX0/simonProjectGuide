# 第15章：生命周期与钩子函数

## 第15章 生命周期与钩子函数

> **学习目标**：掌握Vue3生命周期钩子的使用
> **核心内容**：生命周期钩子、执行时机、最佳实践

### 15.1 生命周期钩子使用

```vue
<script setup lang="ts">
import {
  onMounted,
  onBeforeMount,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

// 组件挂载前
onBeforeMount(() => {
  console.log('组件即将挂载')
})

// 组件已挂载
onMounted(() => {
  console.log('组件已挂载')
  // 在这里可以访问DOM
})

// 组件更新前
onBeforeUpdate(() => {
  console.log('组件即将更新')
})

// 组件已更新
onUpdated(() => {
  console.log('组件已更新')
})

// 组件卸载前
onBeforeUnmount(() => {
  console.log('组件即将卸载')
  // 清理工作，如清除定时器
})

// 组件已卸载
onUnmounted(() => {
  console.log('组件已卸载')
})
</script>
```

### 15.2 生命周期实战应用场景

> **为什么要学习生命周期实战应用？**
>
> 生命周期钩子是Vue组件在不同阶段执行的回调函数。理解何时使用哪个钩子，可以帮助你：
> - 在合适的时机初始化数据
> - 避免内存泄漏
> - 优化性能
> - 正确操作DOM

#### 场景1：API数据获取（onMounted）

```vue
<!-- UserList.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface User {
  id: number
  name: string
  email: string
  avatar: string
}

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// ✅ 最佳实践：在 onMounted 中获取初始数据
onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    const response = await axios.get('https://api.example.com/users')
    users.value = response.data
  } catch (e) {
    error.value = '获取用户列表失败'
    console.error('Error fetching users:', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="user-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <span class="spinner"></span>
      加载中...
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      {{ error }}
      <button @click="$router.go(0)">重试</button>
    </div>

    <!-- 数据列表 -->
    <div v-else class="users">
      <div v-for="user in users" :key="user.id" class="user-card">
        <img :src="user.avatar" :alt="user.name">
        <h3>{{ user.name }}</h3>
        <p>{{ user.email }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading {
  text-align: center;
  padding: 20px;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #f56c6c;
  text-align: center;
  padding: 20px;
}

.users {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.user-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.user-card img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
</style>
```

#### 场景2：初始化第三方库（onMounted）

```vue
<!-- ChartView.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

onMounted(() => {
  // ✅ 初始化 ECharts 图表
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)

    const option = {
      title: {
        text: '销售数据统计'
      },
      tooltip: {},
      xAxis: {
        data: ['一月', '二月', '三月', '四月', '五月', '六月']
      },
      yAxis: {},
      series: [{
        name: '销量',
        type: 'bar',
        data: [120, 200, 150, 80, 70, 110]
      }]
    }

    chartInstance.setOption(option)
  }
})

// ✅ 组件卸载前销毁图表实例
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<template>
  <div ref="chartRef" class="chart" style="width: 600px; height: 400px;"></div>
</template>
```

#### 场景3：DOM操作（onMounted）

```vue
<!-- AutoFocusInput.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const inputRef = ref<HTMLInputElement>()

// ✅ 组件挂载后自动聚焦输入框
onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <div>
    <label>请输入内容：</label>
    <input
      ref="inputRef"
      type="text"
      placeholder="我会自动聚焦"
    >
  </div>
</template>
```

#### 场景4：定时器管理（onBeforeUnmount + onUnmounted）

```vue
<!-- Countdown.vue -->
<script setup lang="ts">
import { ref, onBeforeUnmount, onUnmounted } from 'vue'

const count = ref(60)
const timer = ref<number | null>(null)

const startCountdown = () => {
  // 清除之前的定时器（如果存在）
  if (timer.value) {
    clearInterval(timer.value)
  }

  timer.value = window.setInterval(() => {
    count.value--
    if (count.value <= 0) {
      stopCountdown()
    }
  }, 1000)
}

const stopCountdown = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

// ✅ 组件卸载前清除定时器，防止内存泄漏
onBeforeUnmount(() => {
  console.log('组件即将卸载，清除定时器')
  stopCountdown()
})

// ✅ 组件已卸载后的清理工作
onUnmounted(() => {
  console.log('组件已卸载，所有清理工作完成')
})
</script>

<template>
  <div class="countdown">
    <h2>倒计时：{{ count }} 秒</h2>
    <button @click="startCountdown">开始倒计时</button>
    <button @click="stopCountdown">停止</button>
  </div>
</template>

<style scoped>
.countdown {
  text-align: center;
  padding: 20px;
}

h2 {
  font-size: 32px;
  color: #42b983;
}

button {
  margin: 0 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #42b983;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #35a872;
}
</style>
```

#### 场景5：事件监听器管理（onMounted + onBeforeUnmount）

```vue
<!-- KeyboardShortcuts.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const message = ref('按下快捷键试试！')

// 快捷键处理函数
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    message.value = 'Ctrl+S - 保存成功！'
  } else if (event.ctrlKey && event.key === 'z') {
    event.preventDefault()
    message.value = 'Ctrl+Z - 撤销操作！'
  } else if (event.key === 'Escape') {
    message.value = 'Escape - 取消操作！'
  }
}

// ✅ 组件挂载时添加事件监听
onMounted(() => {
  console.log('添加键盘事件监听')
  window.addEventListener('keydown', handleKeyPress)
})

// ✅ 组件卸载前移除事件监听，防止内存泄漏
onBeforeUnmount(() => {
  console.log('移除键盘事件监听')
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<template>
  <div class="shortcuts">
    <h3>键盘快捷键演示</h3>
    <p class="message">{{ message }}</p>
    <div class="tips">
      <p>💡 试试按这些键：</p>
      <ul>
        <li><kbd>Ctrl</kbd> + <kbd>S</kbd> - 保存</li>
        <li><kbd>Ctrl</kbd> + <kbd>Z</kbd> - 撤销</li>
        <li><kbd>Escape</kbd> - 取消</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.shortcuts {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.message {
  font-size: 18px;
  color: #42b983;
  margin: 20px 0;
  padding: 10px;
  background: #f0f9f4;
  border-radius: 4px;
}

.tips {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

kbd {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  font-family: monospace;
}
</style>
```

#### 场景6：网络请求 AbortController 取消（onBeforeUnmount）

```vue
<!-- SearchResults.vue -->
<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import axios from 'axios'

interface Product {
  id: number
  name: string
  price: number
}

const searchQuery = ref('')
const results = ref<Product[]>([])
const loading = ref(false)
let abortController: AbortController | null = null

// 搜索函数
const searchProducts = async (query: string) => {
  // 取消之前的请求
  if (abortController) {
    abortController.abort()
  }

  // 创建新的 AbortController
  abortController = new AbortController()

  loading.value = true
  results.value = []

  try {
    const response = await axios.get(`/api/products?q=${query}`, {
      signal: abortController.signal
    })
    results.value = response.data
  } catch (error) {
    // 忽略被取消的请求
    if (axios.isCancel(error)) {
      console.log('请求已取消')
    } else {
      console.error('搜索失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 监听搜索关键词变化
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    searchProducts(newQuery)
  } else {
    results.value = []
  }
})

// ✅ 组件卸载前取消进行中的请求
onBeforeUnmount(() => {
  if (abortController) {
    abortController.abort()
    console.log('取消进行中的网络请求')
  }
})
</script>

<template>
  <div class="search">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="搜索商品..."
      class="search-input"
    >

    <div v-if="loading" class="loading">搜索中...</div>

    <div v-else-if="results.length > 0" class="results">
      <div v-for="product in results" :key="product.id" class="product">
        <h4>{{ product.name }}</h4>
        <p>¥{{ product.price }}</p>
      </div>
    </div>

    <div v-else-if="searchQuery && !loading" class="no-results">
      未找到相关商品
    </div>
  </div>
</template>

<style scoped>
.search {
  max-width: 600px;
  margin: 20px auto;
}

.search-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #999;
}

.results {
  margin-top: 20px;
}

.product {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.product:last-child {
  border-bottom: none;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style>
```

#### 场景7：动态更新DOM（onUpdated）

```vue
<!-- ScrollToBottom.vue -->
<script setup lang="ts">
import { ref, nextTick, watch, onUpdated } from 'vue'

const messages = ref<string[]>(['欢迎来到聊天室！'])
const newMessage = ref('')
const chatContainer = ref<HTMLDivElement>()

// 添加消息
const sendMessage = () => {
  if (newMessage.value.trim()) {
    messages.value.push(newMessage.value)
    newMessage.value = ''
  }
}

// 使用 nextTick 在 DOM 更新后滚动到底部（推荐方式）
watch(messages, async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
})

// ✅ onUpdated 也可以用于 DOM 更新后的操作
onUpdated(() => {
  // 注意：这会在每次组件更新后执行，所以要谨慎使用
  // 更推荐使用 watch + nextTick 的方式
})
</script>

<template>
  <div class="chat">
    <div ref="chatContainer" class="messages">
      <div v-for="(msg, index) in messages" :key="index" class="message">
        {{ msg }}
      </div>
    </div>
    <div class="input-area">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        type="text"
        placeholder="输入消息..."
      >
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<style scoped>
.chat {
  max-width: 500px;
  margin: 20px auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.messages {
  height: 300px;
  overflow-y: auto;
  padding: 15px;
  background: #f9f9f9;
}

.message {
  margin-bottom: 10px;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
}

.input-area {
  display: flex;
  padding: 10px;
  background: white;
  border-top: 1px solid #ddd;
}

.input-area input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.input-area button {
  padding: 8px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

#### 场景8：WebSocket 连接管理（onMounted + onBeforeUnmount）

```vue
<!-- RealTimeData.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface StockData {
  symbol: string
  price: number
  change: number
}

const stockData = ref<StockData | null>(null)
const connectionStatus = ref('disconnected')
let ws: WebSocket | null = null

// 连接 WebSocket
const connectWebSocket = () => {
  ws = new WebSocket('wss://api.example.com/stocks')

  ws.onopen = () => {
    connectionStatus.value = 'connected'
    console.log('WebSocket 已连接')
  }

  ws.onmessage = (event) => {
    stockData.value = JSON.parse(event.data)
  }

  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error)
    connectionStatus.value = 'error'
  }

  ws.onclose = () => {
    connectionStatus.value = 'disconnected'
    console.log('WebSocket 已断开')
  }
}

// 断开 WebSocket
const disconnectWebSocket = () => {
  if (ws) {
    ws.close()
    ws = null
  }
}

// ✅ 组件挂载时建立连接
onMounted(() => {
  connectWebSocket()
})

// ✅ 组件卸载前断开连接
onBeforeUnmount(() => {
  disconnectWebSocket()
})
</script>

<template>
  <div class="stock-widget">
    <div class="status" :class="connectionStatus">
      <span class="dot"></span>
      {{ connectionStatus === 'connected' ? '已连接' : '未连接' }}
    </div>

    <div v-if="stockData" class="stock-info">
      <h3>{{ stockData.symbol }}</h3>
      <p class="price">¥{{ stockData.price.toFixed(2) }}</p>
      <p :class="['change', stockData.change >= 0 ? 'positive' : 'negative']">
        {{ stockData.change >= 0 ? '+' : '' }}{{ stockData.change.toFixed(2) }}%
      </p>
    </div>

    <div v-else class="waiting">
      等待数据...
    </div>
  </div>
</template>

<style scoped>
.stock-widget {
  max-width: 300px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 14px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status.connected .dot {
  background: #67c23a;
}

.status.disconnected .dot {
  background: #909399;
}

.status.error .dot {
  background: #f56c6c;
}

.stock-info {
  text-align: center;
}

.stock-info h3 {
  margin: 0 0 10px 0;
}

.price {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.change {
  font-size: 16px;
  margin-top: 5px;
}

.change.positive {
  color: #67c23a;
}

.change.negative {
  color: #f56c6c;
}

.waiting {
  text-align: center;
  color: #999;
  padding: 20px;
}
</style>
```

### 15.3 生命周期使用最佳实践

#### ✅ 推荐做法

| 场景 | 使用的生命周期 | 示例 |
|------|---------------|------|
| 获取初始数据 | `onMounted` | API请求 |
| 初始化第三方库 | `onMounted` | ECharts、Swiper等 |
| DOM操作 | `onMounted` + `nextTick` | 聚焦、滚动等 |
| 清理定时器 | `onBeforeUnmount` | `clearInterval` |
| 移除事件监听 | `onBeforeUnmount` | `removeEventListener` |
| 取消网络请求 | `onBeforeUnmount` | `AbortController` |
| 销毁第三方实例 | `onBeforeUnmount` | `dispose()` |
| 响应式数据变化后的操作 | `watch` + `nextTick` | 数据更新后操作DOM |

#### ❌ 避免的做法

```vue
<script setup lang="ts">
import { onMounted, onUpdated } from 'vue'

// ❌ 不要在 onBeforeMount 中访问 DOM
onBeforeMount(() => {
  // 错误：此时 DOM 还不存在
  document.querySelector('.my-element') // null
})

// ❌ 不要在 onUpdated 中修改响应式数据（可能导致无限循环）
onUpdated(() => {
  // 危险：可能导致无限更新循环
  someData.value = 'new value'
})

// ❌ 不要忘记清理副作用
onMounted(() => {
  const timer = setInterval(() => {
    console.log('tick')
  }, 1000)

  // ❌ 忘记清理定时器会导致内存泄漏
})

// ✅ 正确做法
onMounted(() => {
  const timer = setInterval(() => {
    console.log('tick')
  }, 1000)

  onBeforeUnmount(() => {
    clearInterval(timer) // 清理定时器
  })
})
</script>
```

---

# 第三周：企业级开发
