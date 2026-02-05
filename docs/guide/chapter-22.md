# 企业级配置
## 企业级配置
## 企业级配置

> **学习目标**：掌握企业级项目配置
> **核心内容**：按需引入、私有库、多环境配置、构建优化

### 全局引入与按需引入

#### 全局引入（适合小型项目）

```typescript
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```

#### 按需引入（推荐，减少打包体积）

**方式一：手动按需引入**

```vue
<script setup lang="ts">
import { ElButton, ElInput, ElForm } from 'element-plus'
</script>

<template>
  <div>
    <el-button>按钮</el-button>
    <el-input></el-input>
  </div>
</template>
```

**方式二：使用 unplugin-vue-components 自动导入**

```bash
npm install -D unplugin-vue-components unplugin-auto-import
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
})
```

现在可以直接使用组件，无需手动导入：

```vue
<template>
  <div>
    <el-button>按钮</el-button>
    <el-input></el-input>
  </div>
</template>
```

#### 创建自己的组件库

```typescript
// components/index.ts
import BasicButton from './BasicButton.vue'
import UserCard from './UserCard.vue'
import DataTable from './DataTable.vue'

const components = [
  BasicButton,
  UserCard,
  DataTable
]

// 全局注册
export function registerComponents(app: any) {
  components.forEach(component => {
    app.component(component.name || component.__name, component)
  })
}

// 按需导出
export {
  BasicButton,
  UserCard,
  DataTable
}
```

```typescript
// main.ts - 全局使用
import { registerComponents } from '@/components'

const app = createApp(App)
registerComponents(app)
```

```vue
<!-- 按需使用 -->
<script setup lang="ts">
import { UserCard, DataTable } from '@/components'
</script>
```

#### 第三方JS库与OCX控件引入

在企业级项目中，经常需要引入第三方JS库或OCX控件（如扫描仪、打印机、读卡器等硬件设备控件）。以下是完整的引入方案。

---

##### 全局引入第三方JS库

**适用场景**：需要在整个项目中使用的工具库（如 jQuery、Lodash、百度地图等）

**方式一：在 index.html 中引入（最简单）**

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue3应用</title>

    <!-- 引入第三方JS库 -->
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.0/dist/jquery.min.js"></script>
    <script src="https://api.map.baidu.com/api?v=3.0&ak=您的密钥"></script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```typescript
// 在组件中直接使用（无需import）
<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // 直接使用全局变量
  console.log($().jquery)  // jQuery
  console.log(window.BMap) // 百度地图
})
</script>
```

**方式二：使用 vite 配置全局变量（推荐）**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    // 定义全局常量
    __APP_VERSION__: JSON.stringify('1.0.0')
  },
  build: {
    rollupOptions: {
      external: ['jquery', 'BMap'],
      output: {
        globals: {
          jquery: '$',
          BMap: 'BMap'
        }
      }
    }
  }
})
```

**方式三：通过 npm 安装后全局引入**

```bash
npm install jquery
npm install @types/jquery -D  # TypeScript类型定义
```

```typescript
// src/plugins/jquery.ts
import $ from 'jquery'
import type { App } from 'vue'

export function setupJQuery(app: App) {
  // 挂载到全局属性
  app.config.globalProperties.$ = $
  window.$ = $  // 同时挂载到 window
}

// 类型声明
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $: typeof $
  }
}

declare global {
  interface Window {
    $: typeof $
  }
}
```

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { setupJQuery } from './plugins/jquery'

const app = createApp(App)
setupJQuery(app)
app.mount('#app')
```

```vue
<!-- 在组件中使用 -->
<script setup lang="ts">
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const $ = instance?.appContext.config.globalProperties.$

// 或直接使用 window.$
console.log(window.$('div'))
</script>
```

---

##### 局部引入第三方JS库

**适用场景**：只在特定页面使用的JS库

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// 动态加载外部JS
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  // 动态加载
  await loadScript('https://cdn.example.com/special-lib.js')

  // 使用加载的库
  console.log((window as any).SpecialLib)
})

onUnmounted(() => {
  // 清理：移除script标签
  const scripts = document.querySelectorAll('script[src*="special-lib"]')
  scripts.forEach(s => s.remove())
})
</script>
```

---

##### OCX控件引入方案

> **重要提示**：OCX控件是基于ActiveX技术的Windows专用控件，仅支持IE浏览器或兼容模式。现代浏览器（Chrome、Firefox、Edge）已不再支持ActiveX。

**方案一：IE浏览器 + 传统OCX（旧系统）**

```vue
<template>
  <div class="ocx-container">
    <!-- 使用 object 标签嵌入OCX控件 -->
    <object
      id="scanOcx"
      classid="clsid:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
      codebase="./ocx/ScanControl.cab#version=1,0,0,1"
      width="600"
      height="400"
    >
      <param name="Enabled" value="1" />
      <param name="Visible" value="1" />
      您的浏览器不支持OCX控件，请使用IE浏览器！
    </object>

    <button @click="startScan">开始扫描</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

// OCX控件接口
interface ScanOcx {
  StartScan(): void
  StopScan(): void
  GetImage(): string
  SaveImage(path: string): boolean
}

let ocxInstance: ScanOcx | null = null

onMounted(() => {
  // 获取OCX控件实例
  ocxInstance = document.getElementById('scanOcx') as unknown as ScanOcx
})

const startScan = () => {
  if (ocxInstance) {
    try {
      ocxInstance.StartScan()
    } catch (error) {
      console.error('OCX控件调用失败:', error)
      alert('OCX控件调用失败，请确认控件已正确安装！')
    }
  }
}
</script>

<style scoped>
.ocx-container {
  padding: 20px;
}
</style>
```

**方案二：使用IE兼容模式 + 条件加载**

```vue
<template>
  <div>
    <!-- IE检测 -->
    <div v-if="isIE" class="ie-support">
      <object
        id="printerOcx"
        classid="clsid:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
        width="100%"
        height="300px"
      />
    </div>

    <!-- 现代浏览器提示 -->
    <div v-else class="modern-browser-warning">
      <p>当前功能需要IE浏览器支持</p>
      <p>请使用IE浏览器或启用IE兼容模式</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isIE = ref(false)

onMounted(() => {
  // 检测IE浏览器
  const ua = window.navigator.userAgent
  isIE.value = /MSIE|Trident/.test(ua)
})
</script>
```

**方案三：WebSocket桥接方案（推荐）**

由于OCX控件在现代浏览器中无法使用，可以采用**本地服务 + WebSocket**的架构：

```
┌─────────────┐         WebSocket          ┌─────────────┐
│  Vue3前端   │ ◄────────────────────────► │  本地服务   │
│ (现代浏览器) │                              │  (OCX桥接) │
└─────────────┘                              └─────────────┘
                                                      │
                                                      ▼
                                               ┌─────────────┐
                                               │  OCX控件    │
                                               │  (Windows)  │
                                               └─────────────┘
```

```typescript
// src/utils/ocx-bridge.ts
class OcxConnector {
  private ws: WebSocket | null = null
  private reconnectTimer: number | null = null
  private handlers: Map<string, (data: any) => void> = new Map()

  constructor(private url: string = 'ws://localhost:8090') {}

  // 连接本地OCX桥接服务
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('OCX桥接服务已连接')
        resolve()
      }

      this.ws.onerror = (error) => {
        console.error('OCX桥接服务连接失败:', error)
        reject(error)
      }

      this.ws.onmessage = (event) => {
        const { type, data } = JSON.parse(event.data)
        const handler = this.handlers.get(type)
        if (handler) {
          handler(data)
        }
      }

      this.ws.onclose = () => {
        console.log('OCX桥接服务已断开')
        // 自动重连
        this.reconnectTimer = window.setTimeout(() => {
          this.connect()
        }, 3000)
      }
    })
  }

  // 调用OCX方法
  call(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('OCX桥接服务未连接'))
        return
      }

      const messageId = Date.now().toString()

      // 注册回调
      this.handlers.set(`response_${messageId}`, (data) => {
        if (data.error) {
          reject(new Error(data.error))
        } else {
          resolve(data.result)
        }
        this.handlers.delete(`response_${messageId}`)
      })

      // 发送请求
      this.ws.send(JSON.stringify({
        messageId,
        method,
        params
      }))
    })
  }

  // 订阅OCX事件
  on(event: string, handler: (data: any) => void) {
    this.handlers.set(event, handler)
  }

  // 取消订阅
  off(event: string) {
    this.handlers.delete(event)
  }

  // 断开连接
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    if (this.ws) {
      this.ws.close()
    }
  }
}

export const ocxConnector = new OcxConnector()
```

```vue
<!-- 在组件中使用 -->
<template>
  <div class="scanner">
    <el-button @click="connectOcx" :disabled="connected">连接设备</el-button>
    <el-button @click="startScan" :disabled="!connected">扫描</el-button>
    <el-button @click="disconnectOcx">断开</el-button>

    <div v-if="scanResult" class="result">
      <img :src="scanResult" alt="扫描结果" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ocxConnector } from '@/utils/ocx-bridge'

const connected = ref(false)
const scanResult = ref('')

const connectOcx = async () => {
  try {
    await ocxConnector.connect()
    connected.value = true
    ElMessage.success('设备连接成功')

    // 监听扫描进度
    ocxConnector.on('scan_progress', (data) => {
      console.log('扫描进度:', data.progress)
    })
  } catch (error) {
    ElMessage.error('设备连接失败，请确认本地服务已启动')
  }
}

const startScan = async () => {
  try {
    const result = await ocxConnector.call('startScan', {
      resolution: 300,
      colorMode: 'color'
    })
    scanResult.value = `data:image/png;base64,${result.image}`
  } catch (error) {
    ElMessage.error('扫描失败')
  }
}

const disconnectOcx = () => {
  ocxConnector.disconnect()
  connected.value = false
}
</script>
```

---

##### WebSocket 完整指南

WebSocket 是一种全双工通信协议，允许服务器主动向客户端推送消息，非常适合实时通信场景。

**WebSocket 常见应用场景：**
- 即时通讯（聊天室、在线客服）
- 实时数据推送（股票行情、游戏状态）
- 协同编辑（多人同时编辑文档）
- 设备控制（远程控制硬件设备）
- OCX/硬件桥接（替代传统ActiveX）

---

###### 基础 WebSocket 封装

```typescript
// src/utils/websocket.ts
// WebSocket连接状态枚举
export enum WSReadyState {
  CONNECTING = 0,    // 正在连接
  OPEN = 1,          // 已连接
  CLOSING = 2,       // 正在关闭
  CLOSED = 3         // 已关闭
}

// WebSocket配置
export interface WSConfig {
  url: string                    // WebSocket地址
  heartBeat?: boolean            // 是否开启心跳
  heartBeatInterval?: number     // 心跳间隔（毫秒）
  reconnect?: boolean            // 是否自动重连
  reconnectInterval?: number     // 重连间隔（毫秒）
  maxReconnect?: number          // 最大重连次数
  protocols?: string | string[]  // 子协议
}

// 消息类型
export interface WSMessage {
  type: string      // 消息类型
  data: any         // 消息数据
  id?: string       // 消息ID（用于请求响应匹配）
}

// WebSocket事件回调
export interface WSHandlers {
  onOpen?: (event: Event) => void
  onMessage?: (data: WSMessage) => void
  onError?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onReconnecting?: (attempt: number) => void
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private config: Required<WSConfig>
  private handlers: WSHandlers
  private readyState: WSReadyState = WSReadyState.CLOSED

  // 心跳定时器
  private heartBeatTimer: number | null = null
  // 重连定时器
  private reconnectTimer: number | null = null
  // 重连次数
  private reconnectCount = 0
  // 消息回调Map（用于请求响应）
  private messageCallbacks: Map<string, (data: any) => void> = new Map()
  // 事件监听器
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor(config: WSConfig, handlers: WSHandlers = {}) {
    this.config = {
      url: config.url,
      heartBeat: config.heartBeat ?? true,
      heartBeatInterval: config.heartBeatInterval ?? 30000,
      reconnect: config.reconnect ?? true,
      reconnectInterval: config.reconnectInterval ?? 3000,
      maxReconnect: config.maxReconnect ?? Infinity,
      protocols: config.protocols ?? []
    }
    this.handlers = handlers
  }

  // 连接WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols)
        this.readyState = WSReadyState.CONNECTING

        this.ws.onopen = (event) => {
          console.log('[WebSocket] 连接成功')
          this.readyState = WSReadyState.OPEN
          this.reconnectCount = 0
          this.startHeartBeat()

          this.handlers.onOpen?.(event)
          this.emit('open', event)
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data)
            console.log('[WebSocket] 收到消息:', message)

            // 处理请求响应消息
            if (message.id && this.messageCallbacks.has(message.id)) {
              const callback = this.messageCallbacks.get(message.id)!
              callback(message.data)
              this.messageCallbacks.delete(message.id)
            } else {
              // 触发消息回调
              this.handlers.onMessage?.(message)
              this.emit(message.type, message.data)
            }
          } catch (error) {
            console.error('[WebSocket] 消息解析失败:', error)
          }
        }

        this.ws.onerror = (event) => {
          console.error('[WebSocket] 连接错误:', event)
          this.handlers.onError?.(event)
          this.emit('error', event)
          reject(event)
        }

        this.ws.onclose = (event) => {
          console.log('[WebSocket] 连接关闭:', event.code, event.reason)
          this.readyState = WSReadyState.CLOSED
          this.stopHeartBeat()

          this.handlers.onClose?.(event)
          this.emit('close', event)

          // 自动重连
          if (this.config.reconnect && this.reconnectCount < this.config.maxReconnect) {
            this.reconnect()
          }
        }
      } catch (error) {
        console.error('[WebSocket] 创建连接失败:', error)
        reject(error)
      }
    })
  }

  // 发送消息
  send(type: string, data: any = {}): void {
    if (this.readyState !== WSReadyState.OPEN) {
      console.warn('[WebSocket] 连接未建立，无法发送消息')
      return
    }

    const message: WSMessage = { type, data }
    this.ws?.send(JSON.stringify(message))
    console.log('[WebSocket] 发送消息:', message)
  }

  // 发送请求（等待响应）
  request<T = any>(type: string, data: any = {}, timeout = 30000): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.readyState !== WSReadyState.OPEN) {
        reject(new Error('连接未建立'))
        return
      }

      const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const message: WSMessage = { type, data, id: messageId }

      // 设置超时
      const timer = setTimeout(() => {
        this.messageCallbacks.delete(messageId)
        reject(new Error('请求超时'))
      }, timeout)

      // 注册回调
      this.messageCallbacks.set(messageId, (response) => {
        clearTimeout(timer)
        resolve(response as T)
      })

      // 发送消息
      this.ws?.send(JSON.stringify(message))
      console.log('[WebSocket] 发送请求:', message)
    })
  }

  // 重连
  private reconnect(): void {
    this.reconnectCount++
    console.log(`[WebSocket] 正在重连 (${this.reconnectCount}/${this.config.maxReconnect})...`)

    this.handlers.onReconnecting?.(this.reconnectCount)
    this.emit('reconnecting', this.reconnectCount)

    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch(() => {
        // 连接失败会自动触发下一次重连
      })
    }, this.config.reconnectInterval)
  }

  // 开启心跳
  private startHeartBeat(): void {
    if (!this.config.heartBeat) return

    this.heartBeatTimer = window.setInterval(() => {
      if (this.readyState === WSReadyState.OPEN) {
        this.send('ping', { timestamp: Date.now() })
      }
    }, this.config.heartBeatInterval)
  }

  // 停止心跳
  private stopHeartBeat(): void {
    if (this.heartBeatTimer) {
      clearInterval(this.heartBeatTimer)
      this.heartBeatTimer = null
    }
  }

  // 监听事件
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  // 取消监听
  off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
      if (listeners.size === 0) {
        this.eventListeners.delete(event)
      }
    }
  }

  // 触发事件
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // 获取连接状态
  getState(): WSReadyState {
    return this.readyState
  }

  // 是否已连接
  isOpen(): boolean {
    return this.readyState === WSReadyState.OPEN
  }

  // 手动关闭连接
  close(code = 1000, reason = '客户端主动关闭'): void {
    this.config.reconnect = false  // 禁用自动重连
    this.stopHeartBeat()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close(code, reason)
      this.ws = null
    }
  }

  // 销毁实例
  destroy(): void {
    this.close()
    this.messageCallbacks.clear()
    this.eventListeners.clear()
  }
}

// 创建WebSocket实例的工厂函数
export function createWebSocket(config: WSConfig, handlers?: WSHandlers) {
  return new WebSocketClient(config, handlers)
}
```

---

###### Vue3 组合式 API 封装

```typescript
// src/composables/useWebSocket.ts
import { ref, onUnmounted, watch } from 'vue'
import { createWebSocket, WSReadyState, type WSConfig, type WSHandlers } from '@/utils/websocket'

export function useWebSocket(config: WSConfig, handlers?: WSHandlers) {
  // 响应式状态
  const connected = ref(false)
  const connecting = ref(false)
  const readyState = ref(WSReadyState.CLOSED)
  const data = ref<any>(null)
  const error = ref<Event | null>(null)

  // 创建WebSocket实例
  const ws = createWebSocket(config, {
    onOpen: (event) => {
      connected.value = true
      connecting.value = false
      readyState.value = WSReadyState.OPEN
      handlers?.onOpen?.(event)
    },
    onMessage: (message) => {
      data.value = message
      handlers?.onMessage?.(message)
    },
    onError: (event) => {
      error.value = event
      handlers?.onError?.(event)
    },
    onClose: (event) => {
      connected.value = false
      connecting.value = false
      readyState.value = WSReadyState.CLOSED
      handlers?.onClose?.(event)
    },
    onReconnecting: (attempt) => {
      connecting.value = true
      handlers?.onReconnecting?.(attempt)
    }
  })

  // 连接方法
  const connect = async () => {
    if (!connected.value && !connecting.value) {
      connecting.value = true
      try {
        await ws.connect()
      } catch (err) {
        connecting.value = false
        throw err
      }
    }
  }

  // 发送消息
  const send = (type: string, data?: any) => {
    ws.send(type, data)
  }

  // 发送请求
  const request = <T = any>(type: string, data?: any, timeout?: number) => {
    return ws.request<T>(type, data, timeout)
  }

  // 监听事件
  const on = (event: string, callback: (data: any) => void) => {
    ws.on(event, callback)
  }

  // 取消监听
  const off = (event: string, callback: (data: any) => void) => {
    ws.off(event, callback)
  }

  // 关闭连接
  const close = (code?: number, reason?: string) => {
    ws.close(code, reason)
  }

  // 组件卸载时自动关闭
  onUnmounted(() => {
    ws.destroy()
  })

  return {
    // 状态
    connected,
    connecting,
    readyState,
    data,
    error,
    // 方法
    connect,
    send,
    request,
    on,
    off,
    close,
    // 原始实例
    ws
  }
}
```

---

###### 使用示例

**示例1：基础聊天室**

```vue
<template>
  <div class="chat-room">
    <div class="status">
      <span :class="{ online: connected, offline: !connected }">
        {{ connected ? '已连接' : '未连接' }}
      </span>
    </div>

    <div class="messages" ref="messagesContainer">
      <div v-for="msg in messages" :key="msg.id" class="message" :class="msg.type">
        <span class="username">{{ msg.username }}</span>
        <span class="content">{{ msg.content }}</span>
        <span class="time">{{ formatTime(msg.time) }}</span>
      </div>
    </div>

    <div class="input-area">
      <input
        v-model="inputMessage"
        @keyup.enter="sendMessage"
        placeholder="输入消息..."
        :disabled="!connected"
      />
      <button @click="sendMessage" :disabled="!connected || !inputMessage">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

interface Message {
  id: string
  type: 'sent' | 'received'
  username: string
  content: string
  time: number
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()

// 连接WebSocket
const { connected, connect, send, on } = useWebSocket({
  url: 'ws://localhost:8080/chat',
  heartBeat: true,
  heartBeatInterval: 30000,
  reconnect: true
})

onMounted(async () => {
  try {
    await connect()

    // 监听聊天消息
    on('chat', (data: Message) => {
      messages.value.push({
        ...data,
        type: 'received',
        id: Date.now().toString()
      })
      scrollToBottom()
    })

    // 监听系统消息
    on('system', (data: { message: string }) => {
      console.log('系统消息:', data.message)
    })
  } catch (error) {
    console.error('连接失败:', error)
  }
})

const sendMessage = () => {
  if (!inputMessage.value.trim()) return

  const message: Message = {
    id: Date.now().toString(),
    type: 'sent',
    username: '我',
    content: inputMessage.value,
    time: Date.now()
  }

  // 发送消息
  send('chat', message)

  // 添加到消息列表
  messages.value.push(message)
  inputMessage.value = ''
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    messagesContainer.value?.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  })
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.status {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.online { color: #52c41a; }
.offline { color: #ff4d4f; }

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.message {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 70%;
}

.message.received {
  background: #f0f0f0;
  align-self: flex-start;
}

.message.sent {
  background: #1890ff;
  color: white;
  margin-left: auto;
}

.input-area {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
  gap: 10px;
}

.input-area input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
```

**示例2：设备远程控制**

```vue
<template>
  <div class="device-control">
    <el-card>
      <template #header>
        <span>设备控制面板</span>
        <el-tag :type="connected ? 'success' : 'danger'" style="float: right">
          {{ connected ? '在线' : '离线' }}
        </el-tag>
      </template>

      <el-form label-width="120px">
        <el-form-item label="设备状态">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="电源">{{ deviceStatus.power ? '开启' : '关闭' }}</el-descriptions-item>
            <el-descriptions-item label="温度">{{ deviceStatus.temperature }}°C</el-descriptions-item>
            <el-descriptions-item label="湿度">{{ deviceStatus.humidity }}%</el-descriptions-item>
            <el-descriptions-item label="运行时间">{{ deviceStatus.runtime }}s</el-descriptions-item>
          </el-descriptions>
        </el-form-item>

        <el-form-item label="控制操作">
          <el-space>
            <el-button type="primary" @click="togglePower" :loading="operating">
              {{ deviceStatus.power ? '关闭电源' : '开启电源' }}
            </el-button>
            <el-button @click="refreshStatus" :loading="operating">刷新状态</el-button>
          </el-space>
        </el-form-item>

        <el-form-item label="温度设定">
          <el-slider v-model="targetTemp" :min="16" :max="30" show-input @change="setTemperature" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useWebSocket } from '@/composables/useWebSocket'

// 设备状态
interface DeviceStatus {
  power: boolean
  temperature: number
  humidity: number
  runtime: number
}

const deviceStatus = ref<DeviceStatus>({
  power: false,
  temperature: 25,
  humidity: 50,
  runtime: 0
})

const targetTemp = ref(25)
const operating = ref(false)

// 连接设备WebSocket
const { connected, connect, request, on } = useWebSocket({
  url: 'ws://localhost:9000/device',
  heartBeat: true,
  reconnect: true
})

// 初始化连接
connect().then(() => {
  refreshStatus()

  // 监听设备状态推送
  on('status_update', (status: DeviceStatus) => {
    deviceStatus.value = status
  })
}).catch(() => {
  ElMessage.error('设备连接失败')
})

// 切换电源
const togglePower = async () => {
  operating.value = true
  try {
    const result = await request('toggle_power', {
      power: !deviceStatus.value.power
    })
    deviceStatus.value = result.status
    ElMessage.success('操作成功')
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    operating.value = false
  }
}

// 刷新状态
const refreshStatus = async () => {
  operating.value = true
  try {
    const status = await request<DeviceStatus>('get_status')
    deviceStatus.value = status
  } catch (error) {
    ElMessage.error('获取状态失败')
  } finally {
    operating.value = false
  }
}

// 设置温度
const setTemperature = async (temp: number) => {
  try {
    await request('set_temperature', { temperature: temp })
    ElMessage.success(`温度设定为 ${temp}°C`)
  } catch (error) {
    ElMessage.error('温度设定失败')
  }
}
</script>
```

**示例3：实时数据图表**

```vue
<template>
  <div class="realtime-chart">
    <div class="chart-header">
      <h3>实时数据监控</h3>
      <div class="status">
        <el-tag :type="connected ? 'success' : 'danger'">
          {{ connected ? '已连接' : '未连接' }}
        </el-tag>
        <el-tag type="info">数据点: {{ chartData.length }}</el-tag>
      </div>
    </div>

    <div ref="chartContainer" class="chart-container"></div>

    <div class="controls">
      <el-button @click="clearData">清空数据</el-button>
      <el-button @click="exportData">导出数据</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useWebSocket } from '@/composables/useWebSocket'

interface DataPoint {
  timestamp: number
  value: number
  label: string
}

const chartContainer = ref<HTMLElement>()
const chartData = ref<DataPoint[]>([])
let chart: echarts.ECharts | null = null

// WebSocket连接
const { connected, connect, on } = useWebSocket({
  url: 'ws://localhost:8080/realtime',
  reconnect: true
})

onMounted(async () => {
  // 初始化图表
  initChart()

  // 连接WebSocket
  await connect()

  // 监听实时数据
  on('data', (data: DataPoint) => {
    chartData.value.push(data)

    // 限制数据点数量
    if (chartData.value.length > 100) {
      chartData.value.shift()
    }

    updateChart()
  })
})

onUnmounted(() => {
  chart?.dispose()
})

const initChart = () => {
  if (!chartContainer.value) return

  chart = echarts.init(chartContainer.value)

  chart.setOption({
    title: { text: '实时数据' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value',
      scale: true
    },
    series: [{
      name: '数值',
      type: 'line',
      smooth: true,
      data: []
    }]
  })
}

const updateChart = () => {
  if (!chart) return

  chart.setOption({
    xAxis: {
      data: chartData.value.map(d =>
        new Date(d.timestamp).toLocaleTimeString()
      )
    },
    series: [{
      data: chartData.value.map(d => d.value)
    }]
  })
}

const clearData = () => {
  chartData.value = []
  updateChart()
}

const exportData = () => {
  const dataStr = JSON.stringify(chartData.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chart-data-${Date.now()}.json`
  a.click()
}
</script>

<style scoped>
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 400px;
}

.controls {
  margin-top: 20px;
  text-align: center;
}
</style>
```

---

###### Vite 开发环境代理配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      // WebSocket 代理
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,           // 启用WebSocket代理
        changeOrigin: true
      },

      // Socket.IO 代理
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
```

使用代理后的连接地址：
```typescript
// 开发环境使用代理地址
const wsUrl = import.meta.env.DEV
  ? 'ws://localhost:3000/ws'
  : 'wss://api.example.com/ws'
```

---

###### 生产环境 Nginx 配置

```nginx
# nginx.conf
server {
    listen 80;
    server_name example.com;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # WebSocket 代理
    location /ws {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # WebSocket 超时配置
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Socket.IO 代理
    location /socket.io/ {
        proxy_pass http://backend:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

##### TypeScript类型声明

为引入的第三方库添加类型支持：

```typescript
// src/types/global.d.ts

// jQuery类型
declare var $: JQueryStatic

// 百度地图类型
declare var BMap: any

// OCX控件类型
interface ScanOcxControl {
  StartScan(): boolean
  StopScan(): void
  GetImage(): string
  SaveImage(path: string): boolean
  SetResolution(dpi: number): void
}

declare var ScanOcx: ScanOcxControl

// 扩展Window接口
declare global {
  interface Window {
    $?: JQueryStatic
    BMap?: any
    ScanOcx?: ScanOcxControl
  }
}

export {}
```

---

##### 加载状态与错误处理

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 加载状态
const scriptLoading = ref(false)
const scriptError = ref<string | null>(null)
const scriptReady = ref(false)

// 加载外部脚本
const useExternalScript = (src: string) => {
  return new Promise((resolve, reject) => {
    // 检查是否已加载
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true)
      return
    }

    scriptLoading.value = true
    scriptError.value = null

    const script = document.createElement('script')
    script.src = src
    script.async = true

    script.onload = () => {
      scriptLoading.value = false
      scriptReady.value = true
      resolve(true)
    }

    script.onerror = () => {
      scriptLoading.value = false
      scriptError.value = `加载失败: ${src}`
      reject(new Error(scriptError.value))
    }

    document.head.appendChild(script)
  })
}

onMounted(async () => {
  try {
    await useExternalScript('https://cdn.example.com/library.js')
    console.log('脚本加载完成')
  } catch (error) {
    console.error('脚本加载失败:', error)
  }
})
</script>

<template>
  <div>
    <div v-if="scriptLoading">加载中...</div>
    <div v-if="scriptError" class="error">{{ scriptError }}</div>
    <div v-if="scriptReady">
      <!-- 脚本加载完成后的内容 -->
    </div>
  </div>
</template>
```

---

##### 最佳实践总结

| 引入方式 | 适用场景 | 优点 | 缺点 |
|---------|---------|------|------|
| index.html | CDN资源、大型库 | 简单直接、无构建问题 | 缺乏类型检查、非模块化 |
| npm安装 | 主流第三方库 | 类型支持、版本管理 | 需要构建处理 |
| 动态加载 | 按需加载、减少首屏 | 性能优化、按需引入 | 需要手动管理状态 |
| OCX控件 | 硬件设备集成 | 功能强大 | 仅IE支持、需替代方案 |
| WebSocket桥接 | 现代化OCX替代 | 跨浏览器、安全性好 | 需要本地服务 |

**注意事项：**
1. **优先使用npm包**：主流库应优先通过npm安装，获得更好的类型支持
2. **OCX替代方案**：新项目不应使用OCX，考虑WebSocket/HTTP API方式
3. **类型声明**：为第三方库添加TypeScript类型声明
4. **加载优化**：大型库使用动态加载，减少首屏时间
5. **错误处理**：做好脚本加载失败的处理和用户提示

### 私有库（NPM）配置

#### 创建私有组件库

```bash
# 创建库项目
mkdir my-vue-components
cd my-vue-components
npm init -y
```

```json
// package.json
{
  "name": "@my-company/vue-components",
  "version": "1.0.0",
  "private": false,
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "vite build && vue-tsc --emitDeclarationOnly",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.0.0",
    "vite": "^4.0.0",
    "vue": "^3.3.0",
    "vue-tsc": "^1.0.0",
    "typescript": "^5.0.0"
  }
}
```

```typescript
// src/index.ts
import BasicButton from './components/BasicButton.vue'
import UserCard from './components/UserCard.vue'

export { BasicButton, UserCard }
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyVueComponents',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

#### 发布到私有 NPM 仓库

```bash
# 设置私有仓库地址
npm set registry http://npm.my-company.com

# 登录
npm login --registry=http://npm.my-company.com

# 发布
npm publish --registry=http://npm.my-company.com
```

```bash
# 或在项目根目录创建 .npmrc 文件
# .npmrc
registry=http://npm.my-company.com
```

#### 在项目中使用私有库

```bash
# 安装私有库
npm install @my-company/vue-components
```

```typescript
// 全局使用
import { createApp } from 'vue'
import MyComponents from '@my-company/vue-components'
import App from './App.vue'

const app = createApp(App)
app.use(MyComponents)
app.mount('#app')
```

```vue
<!-- 按需使用 -->
<script setup lang="ts">
import { UserCard } from '@my-company/vue-components'
</script>

<template>
  <UserCard :user="{ name: '张三', email: 'zhang@example.com' }" />
</template>
```

---

#### 企业级私有 NPM 仓库完整搭建实战

在企业级项目中，通常会搭建私有 NPM 仓库来托管内部组件库、工具包等。以下是使用 **Verdaccio** 搭建完整私有 NPM 仓库的实战案例。

**什么是 Verdaccio？**
Verdaccio 是一个轻量级的私有 NPM proxy registry，零配置即可启动，非常适合企业内部使用。

---

##### 步骤1：安装 Verdaccio

```bash
# 全局安装 Verdaccio
npm install -g verdaccio

# 或使用 Docker 部署（推荐生产环境）
docker pull verdaccio/verdaccio
```

---

##### 步骤2：启动 Verdaccio 服务

**方式一：本地直接启动**

```bash
# 启动服务（默认端口 4873）
verdaccio

# 输出：
# verdaccio/5.x.x starting
# info --- listening on http://localhost:4873/
```

**方式二：Docker 启动（推荐）**

```bash
# 创建配置目录
mkdir -p verdaccio/{storage,conf}

# 创建配置文件
cat > verdaccio/conf/config.yaml << 'EOF'
# Verdaccio 配置文件
storage: ./storage
plugins: ./plugins

# Web UI 配置
web:
  title: 企业私有 NPM 仓库

# 认证配置
auth:
  htpasswd:
    file: ./htpasswd
    max_users: 1000

# 上游 NPM 镜像（当私有仓库没有包时，会从此拉取）
uplinks:
  npmjs:
    url: https://registry.npmjs.org/

# 包权限配置
packages:
  '@my-company/*':
    access: $all
    publish: $authenticated
    unpublish: $authenticated

  '@*/*':
    access: $all
    publish: $authenticated
    unpublish: $authenticated

  '**':
    access: $all
    publish: $authenticated
    unpublish: $authenticated

# 监听端口
listen: 0.0.0.0:4873

# 日志配置
logs:
  - { type: stdout, format: pretty, level: http }
EOF

# 启动容器
docker run -d \
  --name verdaccio \
  -p 4873:4873 \
  -v $(pwd)/verdaccio/conf:/verdaccio/conf \
  -v $(pwd)/verdaccio/storage:/verdaccio/storage \
  verdaccio/verdaccio

# 查看日志
docker logs -f verdaccio
```

启动后访问：http://localhost:4873

---

##### 步骤3：配置用户认证

```bash
# 注册用户（需要先设置 registry）
npm set registry http://localhost:4873

# 添加用户
npm adduser --registry http://localhost:4873

# 输入用户名、密码、邮箱
# Username: admin
# Password: ******
# Email: admin@company.com

# 登录验证
npm login --registry http://localhost:4873
```

---

##### 步骤4：创建并发布企业组件库

```bash
# 创建组件库项目
mkdir @my-company/ui-components
cd @my-company/ui-components
npm init -y
```

```json
// package.json
{
  "name": "@my-company/ui-components",
  "version": "1.0.0",
  "description": "企业 UI 组件库",
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./components/*": {
      "import": "./dist/components/*.esm.js",
      "require": "./dist/components/*.js"
    },
    "./styles/*": "./dist/styles/*"
  },
  "scripts": {
    "build": "vite build",
    "prepublishOnly": "npm run build",
    "publish": "npm publish --registry http://localhost:4873",
    "publish:dry": "npm publish --dry-run --registry http://localhost:4873"
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.0.0",
    "vite": "^4.0.0",
    "vue": "^3.3.0",
    "typescript": "^5.0.0",
    "vite-plugin-dts": "^3.0.0"
  },
  "publishConfig": {
    "registry": "http://localhost:4873",
    "access": "public"
  }
}
```

```typescript
// src/index.ts - 组件库入口
import Button from './components/Button.vue'
import Input from './components/Input.vue'
import Card from './components/Card.vue'

// 导出所有组件
export { Button, Input, Card }

// 全局注册函数
export default {
  install(app: any) {
    app.component('MButton', Button)
    app.component('MInput', Input)
    app.component('MCard', Card)
  }
}
```

```typescript
// src/components/Button.vue
<template>
  <button :class="['m-btn', `m-btn--${type}`, `m-btn--${size}`]" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false
})
</script>

<style scoped>
.m-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.m-btn--primary { background: #1890ff; color: white; }
.m-btn--success { background: #52c41a; color: white; }
.m-btn--warning { background: #faad14; color: white; }
.m-btn--danger { background: #ff4d4f; color: white; }

.m-btn--small { padding: 4px 8px; font-size: 12px; }
.m-btn--medium { padding: 8px 16px; font-size: 14px; }
.m-btn--large { padding: 12px 24px; font-size: 16px; }
</style>
```

```typescript
// vite.config.ts - 构建配置
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyUIComponents',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

---

##### 步骤5：发布到私有仓库

```bash
# 构建项目
npm run build

# 发布到私有仓库
npm run publish

# 输出：
# npm notice
# npm notice 📦 @my-company/ui-components@1.0.0
# npm notice === Tarball Contents ===
# npm notice 1.2kB  dist/index.js
# npm notice 1.1kB  dist/index.esm.js
# ...
# npm notice === Tarball Details ===
# npm notice name: @my-company/ui-components
# npm notice version: 1.0.0
# npm notice === Publishing to http://localhost:4873 ===
# + @my-company/ui-components@1.0.0
```

在 Verdaccio Web UI (http://localhost:4873) 可以看到已发布的包。

---

##### 步骤6：在业务项目中使用私有库

```bash
# 创建业务项目
npm create vite@latest my-app -- --template vue-ts
cd my-app

# 配置私有仓库
cat > .npmrc << 'EOF'
# 私有仓库地址
registry=http://localhost:4873

# 作用域包指定私有仓库
@my-company:registry=http://localhost:4873

# 公共包使用上游镜像
registry=https://registry.npmjs.org/
EOF

# 安装私有组件库
npm install @my-company/ui-components
```

```typescript
// main.ts - 全局引入
import { createApp } from 'vue'
import MyUI from '@my-company/ui-components'
import App from './App.vue'
import '@my-company/ui-components/dist/styles/main.css'

const app = createApp(App)
app.use(MyUI)
app.mount('#app')
```

```vue
<!-- App.vue - 使用组件 -->
<template>
  <div class="app">
    <m-button type="primary" size="large">点击我</m-button>
    <m-input />
  </div>
</template>
```

```vue
<!-- 按需引入 -->
<template>
  <MButton type="success">成功按钮</MButton>
</template>

<script setup lang="ts">
import { Button } from '@my-company/ui-components'
</script>
```

---

##### 步骤7：多仓库管理（nrm）

当需要管理多个 NPM 仓库时，使用 **nrm** 快速切换：

```bash
# 安装 nrm
npm install -g nrm

# 添加私有仓库
nrm add company http://localhost:4873

# 添加 npm 官方源
nrm add npm https://registry.npmjs.org/

# 添加淘宝镜像
nrm add taobao https://registry.npmmirror.com

# 列出所有仓库
nrm ls

# 切换仓库
nrm use company  # 使用私有仓库
nrm use npm      # 使用 npm 官方源

# 测试仓库速度
nrm test
```

---

##### 步骤8：CI/CD 集成

在 CI/CD 流程中自动发布组件：

```yaml
# .github/workflows/publish.yml
name: Publish to Private NPM

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'http://npm.company.com'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Publish
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

##### 步骤9：Verdaccio 高级配置

```yaml
# verdaccio/config/config.yaml
storage: ./storage

# 启用 HTTPS（需要证书）
https:
  key: ./ssl/verdaccio-key.pem
  cert: ./ssl/verdaccio-cert.pem
  ca: ./ssl/ca.pem

# 代理缓存配置
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    cache: true  # 缓存上游包
    maxage: 30d  # 缓存30天

  taobao:
    url: https://registry.npmmirror.com/

# 包权限详细配置
packages:
  '@my-company/*':
    # 访问权限：所有人可读
    access: $all
    # 发布权限：已认证用户
    publish: $authenticated
    # 取消发布：仅管理员
    unpublish: admin
    # 代理到上游
    proxy: npmjs

# 安全配置
security:
  api:
    legacy: true
  web:
    signup: true  # 允许用户注册

# 速率限制
rateLimit:
  window: 60000  # 时间窗口（毫秒）
  max: 1000      # 最大请求数

# 搜索功能
search:
  limit: 20
```

---

##### 最佳实践总结

| 实践项 | 说明 |
|--------|------|
| **作用域命名** | 使用 `@company-name` 前缀，避免与公共包冲突 |
| **版本管理** | 遵循语义化版本 (Semantic Versioning) |
| **访问控制** | 生产环境关闭用户注册，仅管理员可添加用户 |
| **备份策略** | 定期备份 `storage` 目录和 `htpasswd` 文件 |
| **HTTPS** | 生产环境必须启用 HTTPS |
| **缓存优化** | 配置上游代理缓存，减少网络请求 |
| **监控告警** | 监控 Verdaccio 服务状态和磁盘使用量 |
| **权限隔离** | 不同项目使用不同的作用域，实现权限隔离 |

---

### 多环境配置

#### 环境变量配置

```bash
# .env                - 所有环境共享
# .env.local          - 本地环境（会被 git 忽略）
# .env.development    - 开发环境
# .env.production     - 生产环境
# .env.staging        - 预发布环境
```

```bash
# .env
VITE_APP_TITLE=我的应用
VITE_APP_VERSION=1.0.0
```

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_MODE=development
VITE_ENABLE_MOCK=true
```

```bash
# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_MODE=production
VITE_ENABLE_MOCK=false
```

```bash
# .env.staging
VITE_API_BASE_URL=https://staging-api.example.com
VITE_APP_MODE=staging
VITE_ENABLE_MOCK=false
```

```bash
# .env.test
VITE_API_BASE_URL=http://test-api.example.com
VITE_APP_MODE=test
VITE_ENABLE_MOCK=true
```

#### 环境变量类型声明

```typescript
// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_MODE: 'development' | 'production' | 'staging' | 'test'
  readonly VITE_ENABLE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

#### 使用环境变量

```typescript
// src/config/index.ts
export const config = {
  appTitle: import.meta.env.VITE_APP_TITLE,
  appVersion: import.meta.env.VITE_APP_VERSION,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appMode: import.meta.env.VITE_APP_MODE,
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD
}
```

```typescript
// src/api/index.ts
import { config } from '@/config'

const api = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(`${config.apiBaseUrl}${url}`)
    return response.json()
  },

  // 根据环境切换 mock 数据
  async getUser(id: number) {
    if (config.enableMock) {
      return { id, name: 'Mock User', email: 'mock@example.com' }
    }
    return this.get(`/users/${id}`)
  }
}

export default api
```

#### 多环境脚本配置

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "dev:staging": "vite --mode staging",
    "dev:test": "vite --mode test",
    "build": "vue-tsc && vite build",
    "build:staging": "vue-tsc && vite build --mode staging",
    "build:test": "vue-tsc && vite build --mode test",
    "build:prod": "vue-tsc && vite build --mode production",
    "preview": "vite preview"
  }
}
```

#### Vite 环境配置

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],

    // 根据环境设置不同的 base 路径
    base: mode === 'production' ? '/production-path/' : '/',

    // 环境特定的配置
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
      __API_URL__: JSON.stringify(env.VITE_API_BASE_URL)
    },

    server: {
      port: 3000,
      // 开发环境代理配置
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      } : undefined
    },

    build: {
      // 生产环境特定的构建配置
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      } : undefined
    },

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
})
```

---

#### 多环境切换实战案例：环境切换器组件

在开发环境中，经常需要在不同环境之间切换进行测试。以下是完整的环境切换器实现，包括 UI 组件、状态管理和实际效果演示。

---

##### 步骤1：环境配置管理

首先创建环境配置文件，定义所有可用的环境：

```typescript
// src/config/environments.ts
// 环境类型定义
export type Environment = 'development' | 'test' | 'staging' | 'production'

// 环境配置接口
export interface EnvironmentConfig {
  name: string              // 环境名称
  mode: Environment         // 环境模式
  apiUrl: string           // API 地址
  wsUrl: string            // WebSocket 地址
  enableMock: boolean      // 是否启用 Mock
  themeColor: string       // 主题颜色（用于视觉区分）
  description: string      // 环境描述
}

// 环境配置映射
export const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    name: '开发环境',
    mode: 'development',
    apiUrl: 'http://localhost:3000/api',
    wsUrl: 'ws://localhost:3000/ws',
    enableMock: true,
    themeColor: '#52c41a',
    description: '本地开发环境，启用 Mock 数据'
  },
  test: {
    name: '测试环境',
    mode: 'test',
    apiUrl: 'http://test-api.example.com/api',
    wsUrl: 'ws://test-api.example.com/ws',
    enableMock: true,
    themeColor: '#1890ff',
    description: '测试服务器环境'
  },
  staging: {
    name: '预发布环境',
    mode: 'staging',
    apiUrl: 'https://staging-api.example.com/api',
    wsUrl: 'wss://staging-api.example.com/ws',
    enableMock: false,
    themeColor: '#faad14',
    description: '预发布环境，数据接近生产'
  },
  production: {
    name: '生产环境',
    mode: 'production',
    apiUrl: 'https://api.example.com/api',
    wsUrl: 'wss://api.example.com/ws',
    enableMock: false,
    themeColor: '#ff4d4f',
    description: '正式生产环境'
  }
}

// 获取当前环境配置
export function getCurrentEnvironment(): EnvironmentConfig {
  const mode = (import.meta.env.VITE_APP_MODE || 'development') as Environment
  return environments[mode] || environments.development
}

// 根据模式获取环境配置
export function getEnvironment(mode: Environment): EnvironmentConfig {
  return environments[mode]
}
```

---

##### 步骤2：环境状态管理（Pinia）

创建环境状态管理 Store：

```typescript
// src/stores/environment.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Environment, EnvironmentConfig } from '@/config/environments'
import { environments, getCurrentEnvironment } from '@/config/environments'

export const useEnvironmentStore = defineStore('environment', () => {
  // 当前环境
  const currentMode = ref<Environment>(getCurrentEnvironment().mode)

  // 是否显示切换器（仅开发环境显示）
  const showSwitcher = ref(import.meta.env.DEV)

  // 当前环境配置
  const currentConfig = computed<EnvironmentConfig>(() => {
    return environments[currentMode.value]
  })

  // 是否为生产环境
  const isProduction = computed(() => currentMode.value === 'production')

  // 是否启用 Mock
  const enableMock = computed(() => currentConfig.value.enableMock)

  // API 基础 URL
  const apiBaseUrl = computed(() => currentConfig.value.apiUrl)

  // WebSocket URL
  const wsUrl = computed(() => currentConfig.value.wsUrl)

  // 切换环境
  function switchEnvironment(mode: Environment) {
    currentMode.value = mode

    // 保存到 localStorage
    localStorage.setItem('app_environment', mode)

    // 显示切换提示
    console.log(`[Environment] 切换到: ${environments[mode].name}`)

    // 刷新页面以应用新环境
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  // 初始化环境（从 localStorage 读取）
  function initEnvironment() {
    const saved = localStorage.getItem('app_environment') as Environment
    if (saved && environments[saved]) {
      currentMode.value = saved
    }
  }

  // 切换器显示状态
  function toggleSwitcher() {
    showSwitcher.value = !showSwitcher.value
    localStorage.setItem('show_env_switcher', String(showSwitcher.value))
  }

  return {
    // 状态
    currentMode,
    showSwitcher,
    // 计算属性
    currentConfig,
    isProduction,
    enableMock,
    apiBaseUrl,
    wsUrl,
    // 方法
    switchEnvironment,
    initEnvironment,
    toggleSwitcher
  }
})
```

---

##### 步骤3：环境切换器组件

创建可视化环境切换器组件：

```vue
<!-- src/components/EnvironmentSwitcher.vue -->
<template>
  <Teleport to="body">
    <Transition name="env-switcher">
      <div v-if="store.showSwitcher" class="env-switcher">
        <!-- 折叠按钮 -->
        <button
          class="env-switcher__toggle"
          @click="toggleExpanded"
          :title="expanded ? '收起' : '展开'"
        >
          <svg
            class="icon"
            :class="{ expanded }"
            width="16"
            height="16"
            viewBox="0 0 16 16"
          >
            <path
              d="M4 6l4 4 4-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </button>

        <!-- 面板内容 -->
        <div v-show="expanded" class="env-switcher__panel">
          <div class="env-switcher__header">
            <span>环境切换</span>
            <button class="close-btn" @click="store.toggleSwitcher">×</button>
          </div>

          <!-- 当前环境信息 -->
          <div class="env-switcher__current">
            <div class="env-badge" :style="{ borderColor: store.currentConfig.themeColor }">
              <span class="env-dot" :style="{ backgroundColor: store.currentConfig.themeColor }"></span>
              {{ store.currentConfig.name }}
            </div>
            <p class="env-desc">{{ store.currentConfig.description }}</p>
          </div>

          <!-- 环境列表 -->
          <div class="env-switcher__list">
            <button
              v-for="(env, mode) in environments"
              :key="mode"
              class="env-item"
              :class="{ active: store.currentMode === mode }"
              :style="{ borderColor: store.currentMode === mode ? env.themeColor : '' }"
              @click="handleSwitch(mode as Environment)"
            >
              <span class="env-dot" :style="{ backgroundColor: env.themeColor }"></span>
              <div class="env-info">
                <span class="env-name">{{ env.name }}</span>
                <span class="env-mode">{{ mode }}</span>
              </div>
              <span v-if="store.currentMode === mode" class="env-check">✓</span>
            </button>
          </div>

          <!-- 配置预览 -->
          <div class="env-switcher__config">
            <div class="config-item">
              <span class="config-label">API:</span>
              <span class="config-value">{{ store.currentConfig.apiUrl }}</span>
            </div>
            <div class="config-item">
              <span class="config-label">Mock:</span>
              <span class="config-value">
                <span :class="store.enableMock ? 'status-on' : 'status-off'">
                  {{ store.enableMock ? '启用' : '禁用' }}
                </span>
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="env-switcher__actions">
            <button class="action-btn" @click="copyConfig">复制配置</button>
            <button class="action-btn" @click="refreshToken">刷新 Token</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEnvironmentStore } from '@/stores/environment'
import { environments } from '@/config/environments'
import type { Environment } from '@/config/environments'
import { ElMessage } from 'element-plus'

const store = useEnvironmentStore()
const expanded = ref(true)

// 切换展开状态
function toggleExpanded() {
  expanded.value = !expanded.value
}

// 切换环境
function handleSwitch(mode: Environment) {
  const env = environments[mode]
  store.switchEnvironment(mode)
  ElMessage.success(`已切换到 ${env.name}`)
}

// 复制配置
function copyConfig() {
  const config = {
    mode: store.currentMode,
    apiUrl: store.apiBaseUrl,
    wsUrl: store.wsUrl,
    enableMock: store.enableMock
  }
  navigator.clipboard.writeText(JSON.stringify(config, null, 2))
  ElMessage.success('配置已复制到剪贴板')
}

// 刷新 Token（示例）
function refreshToken() {
  ElMessage.info('Token 刷新功能待实现')
}

onMounted(() => {
  // 读取展开状态
  const savedExpanded = localStorage.getItem('env_switcher_expanded')
  if (savedExpanded !== null) {
    expanded.value = savedExpanded === 'true'
  }
})

// 保存展开状态
function saveExpandedState() {
  localStorage.setItem('env_switcher_expanded', String(expanded.value))
}
</script>

<style scoped>
.env-switcher {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  font-size: 14px;
}

.env-switcher__toggle {
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.env-switcher__toggle:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.env-switcher__toggle .icon {
  transition: transform 0.3s;
}

.env-switcher__toggle .icon.expanded {
  transform: rotate(180deg);
}

.env-switcher__panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 320px;
  max-width: 400px;
  overflow: hidden;
}

.env-switcher__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  font-weight: 600;
}

.close-btn {
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 1;
}

.env-switcher__current {
  padding: 16px;
  text-align: center;
  background: #fafafa;
}

.env-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px solid;
  border-radius: 20px;
  font-weight: 600;
  font-size: 16px;
}

.env-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.env-desc {
  margin: 8px 0 0;
  color: #666;
  font-size: 12px;
}

.env-switcher__list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.env-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  background: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s;
}

.env-item:hover {
  background: #f0f0f0;
}

.env-item.active {
  background: #f0f9ff;
}

.env-info {
  flex: 1;
  text-align: left;
}

.env-name {
  display: block;
  font-weight: 600;
}

.env-mode {
  font-size: 12px;
  color: #999;
}

.env-check {
  color: #52c41a;
  font-weight: bold;
}

.env-switcher__config {
  padding: 12px 16px;
  background: #fafafa;
  border-top: 1px solid #eee;
}

.config-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.config-label {
  color: #666;
}

.config-value {
  font-family: monospace;
  color: #333;
}

.status-on {
  color: #52c41a;
}

.status-off {
  color: #999;
}

.env-switcher__actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #eee;
}

.action-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

/* 过渡动画 */
.env-switcher-enter-active,
.env-switcher-leave-active {
  transition: all 0.3s ease;
}

.env-switcher-enter-from,
.env-switcher-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
```

---

##### 步骤4：在 App.vue 中集成

```vue
<!-- src/App.vue -->
<template>
  <div id="app" :class="`env-${store.currentMode}`">
    <!-- 环境指示器（页面顶部） -->
    <div v-if="!store.isProduction" class="env-indicator" :style="{ backgroundColor: store.currentConfig.themeColor }">
      <span class="env-name">{{ store.currentConfig.name }}</span>
      <span class="env-url">{{ store.apiBaseUrl }}</span>
    </div>

    <!-- 环境切换器 -->
    <EnvironmentSwitcher />

    <!-- 主应用内容 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useEnvironmentStore } from '@/stores/environment'
import EnvironmentSwitcher from '@/components/EnvironmentSwitcher.vue'

const store = useEnvironmentStore()

onMounted(() => {
  // 初始化环境
  store.initEnvironment()
})
</script>

<style>
/* 环境指示器 */
.env-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 4px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  z-index: 9998;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.env-indicator .env-url {
  font-family: monospace;
  opacity: 0.9;
}

/* 根据环境添加顶部间距 */
#app {
  padding-top: 30px;
}

#app.env-production {
  padding-top: 0;
}
</style>
```

---

##### 步骤5：API 请求中使用环境配置

```typescript
// src/api/request.ts - 使用环境配置
import axios from 'axios'
import { useEnvironmentStore } from '@/stores/environment'

// 创建 axios 实例
const http = axios.create({
  timeout: 10000
})

// 请求拦截器
http.interceptors.request.use((config) => {
  const envStore = useEnvironmentStore()

  // 动态设置 baseURL
  config.baseURL = envStore.apiBaseUrl

  // 开发环境打印请求信息
  if (envStore.currentMode === 'development') {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    console.log(`[API Environment] ${envStore.currentConfig.name}`)
    console.log(`[API BaseURL] ${config.baseURL}`)
  }

  return config
})

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const envStore = useEnvironmentStore()

    // 根据环境处理错误
    if (envStore.enableMock) {
      console.warn('[API] Mock 模式下请求失败，返回 Mock 数据')
      return { mock: true, data: null }
    }

    return Promise.reject(error)
  }
)

export default http
```

---

##### 实际效果演示

**效果1：开发环境（绿色）**
```
┌─────────────────────────────────────────┐
│   开发环境 │ http://localhost:3000/api    │
└─────────────────────────────────────────┘
                    ┌─────────────┐
                    │     ▲       │ ← 切换器按钮
                    └─────────────┘
```

切换到测试环境后：
```
┌─────────────────────────────────────────┐
│   测试环境 │ http://test-api.example.com │
└─────────────────────────────────────────┘
```

**效果2：切换器面板**
```
┌──────────────────────────────┐
│ 环境切换                  ×   │
├──────────────────────────────┤
│                              │
│     ● 开发环境                │
│     本地开发环境，启用 Mock    │
│                              │
│  ● development   ✓          │
│  ● test                      │
│  ○ staging                   │
│  ○ production                │
│                              │
│ API: http://localhost:3000   │
│ Mock: 启用                   │
│                              │
│ [复制配置] [刷新 Token]      │
└──────────────────────────────┘
```

**效果3：控制台输出（切换环境时）**
```javascript
[Environment] 切换到: 测试环境
[API Request] GET /users
[API Environment] 测试环境
[API BaseURL] http://test-api.example.com/api
```

---

### 代理配置

#### 开发环境代理

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    // 代理配置
    proxy: {
      // 代理 /api 请求
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },

      // 代理多个目标
      '/api-a': {
        target: 'http://service-a.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-a/, '/api')
      },

      '/api-b': {
        target: 'http://service-b.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-b/, '/api')
      },

      // WebSocket 代理
      '/socket.io': {
        target: 'ws://localhost:3001',
        ws: true
      }
    }
  }
})
```

#### 生产环境代理

生产环境通常由 Nginx 或其他服务器处理代理：

```nginx
# nginx.conf
server {
    listen 80;
    server_name example.com;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket 代理
    location /socket.io/ {
        proxy_pass http://backend:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 构建优化配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    // 其他插件...
  ],

  build: {
    // 构建目标
    target: 'es2015',

    // 输出目录
    outDir: 'dist',

    // 静态资源目录
    assetsDir: 'assets',

    // 生成 sourcemap
    sourcemap: false,

    // Vite资源清单（与PWA manifest无关）
    manifest: false,

    // chunk 大小警告的限制（kb）
    chunkSizeWarningLimit: 1000,

    // Rollup 配置
    rollupOptions: {
      // 输入配置
      input: {
        main: resolve(__dirname, 'index.html')
      },

      // 输出配置
      output: {
        // 静态资源命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',

        // 分包策略
        manualChunks: {
          // 将 vue 相关的打包到一个 chunk
          'vue-vendor': ['vue', 'vue-router', 'pinia'],

          // 将 element-plus 单独打包
          'element-plus': ['element-plus'],

          // 将工具库单独打包
          'utils': ['lodash-es', 'axios', 'dayjs']
        }
      }
    },

    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 删除 console
        drop_console: true,
        // 删除 debugger
        drop_debugger: true,
        // 删除无用代码
        pure_funcs: ['console.log', 'console.info']
      }
    }
  },

  // 优化配置
  optimizeDeps: {
    // 预构建依赖
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'element-plus'
    ],
    // 排除预构建
    exclude: []
  },

  // CSS 配置
  css: {
    modules: {
      // CSS Modules 配置
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        // 全局样式变量
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
```

---
