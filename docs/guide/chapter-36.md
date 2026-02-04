# 前端监控与埋点
## # 4.12 前端监控与埋点
## 第36章 前端监控与埋点

> **学习目标**：掌握前端性能监控、错误监控、用户行为埋点技术
> **核心内容**：Performance API、Sentry集成、PV/UV统计、A/B测试

### 性能监控（Performance API）

#### 基础性能指标

```typescript
// utils/performance.ts

/**
 * 获取页面加载性能指标
 */
export function getPageLoadMetrics() {
  if (!window.performance || !window.performance.timing) {
    return null
  }

  const timing = window.performance.timing
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  return {
    // DNS查询耗时
    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,

    // TCP连接耗时
    tcpConnection: timing.connectEnd - timing.connectStart,

    // 请求响应耗时
    requestTime: timing.responseEnd - timing.requestStart,

    // 解析DOM树耗时
    domParse: timing.domComplete - timing.domLoading,

    // 白屏时间
    whiteScreen: timing.responseStart - timing.navigationStart,

    // 首屏时间
    firstPaint: timing.responseStart - timing.navigationStart,

    // DOM加载完成时间
    domReady: timing.domContentLoadedEventEnd - timing.navigationStart,

    // 页面完全加载时间
    pageLoad: timing.loadEventEnd - timing.navigationStart,

    // 卸载前一个页面耗时
    unloadTime: timing.unloadEventEnd - timing.unloadEventStart,

    // 重定向耗时
    redirectTime: timing.redirectEnd - timing.redirectStart,

    // 总耗时
    totalTime: timing.loadEventEnd - timing.navigationStart
  }
}

/**
 * 获取资源加载性能
 */
export function getResourceMetrics() {
  if (!window.performance || !window.performance.getEntries) {
    return []
  }

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

  return resources
    .filter(resource => {
      // 过滤掉非HTTP请求
      return resource.initiatorType === 'xmlhttprequest' ||
             resource.initiatorType === 'fetch' ||
             resource.name.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/i)
    })
    .map(resource => ({
      name: resource.name,
      type: resource.initiatorType,
      duration: resource.duration,
      size: resource.transferSize,
      // DNS时间
      dns: resource.domainLookupEnd - resource.domainLookupStart,
      // TCP时间
      tcp: resource.connectEnd - resource.connectStart,
      // 请求时间
      request: resource.responseEnd - resource.requestStart,
      // TTFB（首字节时间）
      ttfb: resource.responseStart - resource.requestStart,
      // 下载时间
      download: resource.responseEnd - resource.responseStart
    }))
    .sort((a, b) => b.duration - a.duration) // 按耗时排序
}

/**
 * 获取Paint指标（FCP、LCP）
 */
export function getPaintMetrics() {
  if (!window.performance) {
    return null
  }

  const paintEntries = performance.getEntriesByType('paint')

  return {
    // 首次内容绘制（First Contentful Paint）
    fcp: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    // 首次绘制（First Paint）
    fp: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0
  }
}

/**
 * 使用 PerformanceObserver 监听 LCP
 */
export function observeLCP(callback: (value: number) => void) {
  if (!('PerformanceObserver' in window)) {
    return
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      callback(lastEntry?.startTime || 0)
    })

    observer.observe({ entryTypes: ['largest-contentful-paint'] })

    return observer
  } catch (e) {
    console.error('LCP观察失败:', e)
  }
}

/**
 * 使用 PerformanceObserver 监听 FID
 */
export function observeFID(callback: (value: number) => void) {
  if (!('PerformanceObserver' in window)) {
    return
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        callback(entry.processingStart - entry.startTime)
      })
    })

    observer.observe({ entryTypes: ['first-input'] })

    return observer
  } catch (e) {
    console.error('FID观察失败:', e)
  }
}

/**
 * 使用 PerformanceObserver 监听 CLS
 */
export function observeCLS(callback: (value: number) => void) {
  if (!('PerformanceObserver' in window)) {
    return
  }

  try {
    let clsValue = 0
    let sessionValue = 0
    let sessionEntries: any[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        // 只计算没有最近用户输入的布局偏移
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0]
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

          // 如果条目与会话中的第一个条目相隔1秒，或者与会话中的最后一个条目相隔5000毫秒，则开始新会话
          if (
            sessionValue &&
            (entry.startTime - firstSessionEntry.startTime > 1000 ||
              entry.startTime - lastSessionEntry.startTime > 5000)
          ) {
            sessionValue = 0
            sessionEntries = []
          }

          sessionValue += entry.value
          sessionEntries.push(entry)
          clsValue = Math.max(clsValue, sessionValue)

          // 更新最后100ms内的会话条目
          sessionEntries = sessionEntries.filter(
            (e) => entry.startTime - e.startTime < 1000
          )

          callback(clsValue)
        }
      }
    })

    observer.observe({ entryTypes: ['layout-shift'] })

    return observer
  } catch (e) {
    console.error('CLS观察失败:', e)
  }
}
```

#### Web Vitals 监控组件

```vue
<!-- components/Performance/PerformanceMonitor.vue -->
<template>
  <div class="performance-monitor" v-if="showMonitor">
    <div class="monitor-header">
      <h4>性能指标</h4>
      <button @click="refresh">刷新</button>
    </div>
    <div class="metrics-grid">
      <div class="metric-card" :class="getMetricClass(metrics.fcp, 1800, 3000)">
        <span class="metric-label">FCP</span>
        <span class="metric-value">{{ formatTime(metrics.fcp) }}</span>
      </div>
      <div class="metric-card" :class="getMetricClass(metrics.lcp, 2500, 4000)">
        <span class="metric-label">LCP</span>
        <span class="metric-value">{{ formatTime(metrics.lcp) }}</span>
      </div>
      <div class="metric-card" :class="getMetricClass(metrics.fid, 100, 300)">
        <span class="metric-label">FID</span>
        <span class="metric-value">{{ formatTime(metrics.fid) }}</span>
      </div>
      <div class="metric-card" :class="getMetricClass(metrics.cls, 0.1, 0.25)">
        <span class="metric-label">CLS</span>
        <span class="metric-value">{{ metrics.cls.toFixed(3) }}</span>
      </div>
    </div>
    <div class="resource-list" v-if="showResources">
      <h5>最慢的资源加载</h5>
      <div v-for="resource in topResources" :key="resource.name" class="resource-item">
        <span class="resource-name">{{ getFileName(resource.name) }}</span>
        <span class="resource-time">{{ formatTime(resource.duration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  getPageLoadMetrics,
  getPaintMetrics,
  getResourceMetrics,
  observeLCP,
  observeFID,
  observeCLS
} from '@/utils/performance'

const showMonitor = ref(import.meta.env.DEV)
const showResources = ref(true)

const metrics = ref({
  fcp: 0,
  lcp: 0,
  fid: 0,
  cls: 0
})

const topResources = ref<any[]>([])

let lcpObserver: any = null
let fidObserver: any = null
let clsObserver: any = null

const refresh = () => {
  const paintMetrics = getPaintMetrics()
  metrics.value.fcp = paintMetrics?.fcp || 0

  topResources.value = getResourceMetrics().slice(0, 5)
}

const getMetricClass = (value: number, good: number, poor: number) => {
  if (value <= good) return 'metric-good'
  if (value <= poor) return 'metric-needs-improvement'
  return 'metric-poor'
}

const formatTime = (ms: number) => {
  return `${ms.toFixed(0)}ms`
}

const getFileName = (url: string) => {
  const parts = url.split('/')
  return parts[parts.length - 1]
}

onMounted(() => {
  refresh()

  // 监听LCP
  lcpObserver = observeLCP((value) => {
    metrics.value.lcp = value
  })

  // 监听FID
  fidObserver = observeFID((value) => {
    metrics.value.fid = value
  })

  // 监听CLS
  clsObserver = observeCLS((value) => {
    metrics.value.cls = value
  })
})

onUnmounted(() => {
  lcpObserver?.disconnect()
  fidObserver?.disconnect()
  clsObserver?.disconnect()
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  min-width: 280px;
  z-index: 1000;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.metric-card {
  padding: 12px;
  border-radius: 4px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-good {
  background: #f0f9ff;
  color: #0066cc;
}

.metric-needs-improvement {
  background: #fffbeb;
  color: #f59e0b;
}

.metric-poor {
  background: #fef2f2;
  color: #dc2626;
}

.metric-label {
  font-size: 12px;
  opacity: 0.8;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
}

.resource-list {
  border-top: 1px solid #e5e5e5;
  padding-top: 12px;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 12px;
}

.resource-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
</style>
```

---

#### 企业级前端监控系统完整方案

在企业级应用中，需要一套完整的前端监控系统来收集性能数据、错误信息和用户行为。以下是完整的监控系统实现案例。

---

##### 监控系统架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                      前端监控系统架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  性能监控     │    │  错误监控     │    │  行为埋点     │      │
│  │  Performance  │    │   Error      │    │   Behavior   │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                    │                    │              │
│         └────────────────────┴────────────────────┘              │
│                            │                                     │
│                    ┌───────▼────────┐                           │
│                    │  Monitor Core  │                           │
│                    │  (数据处理中心)  │                           │
│                    └───────┬────────┘                           │
│                            │                                     │
│         ┌──────────────────┼──────────────────┐                │
│         ▼                  ▼                  ▼                │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │  LocalStorage │  │  Server API  │  │  Third-party │          │
│  │  (本地缓存)   │  │  (服务端)    │  │  (Sentry等)  │          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

##### 监控核心类实现

```typescript
// src/monitor/MonitorCore.ts
// 监控数据类型定义
export interface PerformanceData {
  timestamp: number
  url: string
  userId?: string
  sessionId: string

  // 页面加载性能
  pageLoad: {
    dns: number           // DNS查询时间
    tcp: number           // TCP连接时间
    ttfb: number         // 首字节时间
    download: number     // 下载时间
    domParse: number     // DOM解析时间
    domReady: number     // DOM准备时间
    pageLoad: number     // 页面完全加载时间
  }

  // Web Vitals 指标
  webVitals: {
    fcp: number          // 首次内容绘制
    lcp: number          // 最大内容绘制
    fid: number          // 首次输入延迟
    cls: number          // 累积布局偏移
  }

  // 资源加载性能
  resources: Array<{
    name: string
    duration: number
    size: number
    type: string
  }>
}

export interface ErrorData {
  timestamp: number
  url: string
  userId?: string
  sessionId: string
  type: 'js' | 'resource' | 'unhandledrejection' | 'vue'
  message: string
  stack?: string
  filename?: string
  lineno?: number
  colno?: number
  userAgent: string
  extra?: Record<string, any>
}

export interface BehaviorData {
  timestamp: number
  url: string
  userId?: string
  sessionId: string
  type: 'click' | 'scroll' | 'input' | 'navigation' | 'custom'
  target?: string
  data?: Record<string, any>
}

// 监控配置
export interface MonitorConfig {
  // 上报地址
  reportUrl: string
  // 是否启用监控
  enabled: boolean
  // 采样率 (0-1)
  sampleRate: number
  // 是否上报页面性能
  reportPerformance: boolean
  // 是否上报错误
  reportError: boolean
  // 是否上报行为
  reportBehavior: boolean
  // 批量上报配置
  batchReport: boolean
  batchInterval: number  // 批量上报间隔（毫秒）
  batchSize: number      // 批量上报数量
  // 用户ID获取函数
  getUserId?: () => string | undefined
}

// 默认配置
const DEFAULT_CONFIG: MonitorConfig = {
  reportUrl: '',
  enabled: true,
  sampleRate: 1,
  reportPerformance: true,
  reportError: true,
  reportBehavior: false,
  batchReport: true,
  batchInterval: 5000,
  batchSize: 10,
  getUserId: undefined
}

/**
 * 前端监控核心类
 */
export class MonitorCore {
  private config: MonitorConfig
  private sessionId: string
  private performanceQueue: PerformanceData[] = []
  private errorQueue: ErrorData[] = []
  private behaviorQueue: BehaviorData[] = []
  private batchTimer: number | null = null
  private isInitialized = false

  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
  }

  /**
   * 初始化监控系统
   */
  init() {
    if (!this.config.enabled || !this.config.reportUrl) {
      console.warn('[Monitor] 监控系统未启用或未配置上报地址')
      return
    }

    if (this.isInitialized) {
      console.warn('[Monitor] 监控系统已初始化')
      return
    }

    // 初始化性能监控
    if (this.config.reportPerformance) {
      this.initPerformanceMonitor()
    }

    // 初始化错误监控
    if (this.config.reportError) {
      this.initErrorMonitor()
    }

    // 初始化行为监控
    if (this.config.reportBehavior) {
      this.initBehaviorMonitor()
    }

    // 初始化批量上报
    if (this.config.batchReport) {
      this.initBatchReport()
    }

    // 页面卸载时上报剩余数据
    window.addEventListener('beforeunload', () => {
      this.flush()
    })

    // 页面隐藏时上报剩余数据
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush()
      }
    })

    this.isInitialized = true
    console.log('[Monitor] 监控系统初始化成功', { sessionId: this.sessionId })
  }

  /**
   * 初始化性能监控
   */
  private initPerformanceMonitor() {
    // 等待页面加载完成后收集性能数据
    if (document.readyState === 'complete') {
      this.collectPerformanceData()
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.collectPerformanceData(), 0)
      })
    }
  }

  /**
   * 收集性能数据
   */
  private collectPerformanceData() {
    const timing = performance.timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (!timing) return

    // 获取 Web Vitals
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0

    // 获取资源数据
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const resources = resourceEntries
      .filter(r => r.initiatorType !== 'beacon' && r.initiatorType !== 'fetch')
      .slice(0, 20)  // 只取前20个资源
      .map(r => ({
        name: this.getResourceName(r.name),
        duration: r.duration,
        size: r.transferSize,
        type: r.initiatorType
      }))

    const performanceData: PerformanceData = {
      timestamp: Date.now(),
      url: location.href,
      userId: this.getUserId(),
      sessionId: this.sessionId,
      pageLoad: {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.requestStart,
        download: timing.responseEnd - timing.responseStart,
        domParse: timing.domComplete - timing.domLoading,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        pageLoad: timing.loadEventEnd - timing.navigationStart
      },
      webVitals: {
        fcp,
        lcp: 0,  // 需要通过 PerformanceObserver 获取
        fid: 0,
        cls: 0
      },
      resources
    }

    // 监听 LCP
    this.observeLCP((value) => {
      performanceData.webVitals.lcp = value
    })

    // 监听 FID
    this.observeFID((value) => {
      performanceData.webVitals.fid = value
    })

    // 监听 CLS
    this.observeCLS((value) => {
      performanceData.webVitals.cls = value
    })

    // 上报性能数据
    this.report('performance', performanceData)
  }

  /**
   * 初始化错误监控
   */
  private initErrorMonitor() {
    // JS 错误
    window.addEventListener('error', (event) => {
      const errorData: ErrorData = {
        timestamp: Date.now(),
        url: location.href,
        userId: this.getUserId(),
        sessionId: this.sessionId,
        type: 'js',
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        userAgent: navigator.userAgent
      }
      this.report('error', errorData)
    })

    // 资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement
        const errorData: ErrorData = {
          timestamp: Date.now(),
          url: location.href,
          userId: this.getUserId(),
          sessionId: this.sessionId,
          type: 'resource',
          message: `资源加载失败: ${target.tagName}`,
          filename: (target as any).src || (target as any).href,
          userAgent: navigator.userAgent
        }
        this.report('error', errorData)
      }
    }, true)

    // Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      const errorData: ErrorData = {
        timestamp: Date.now(),
        url: location.href,
        userId: this.getUserId(),
        sessionId: this.sessionId,
        type: 'unhandledrejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        userAgent: navigator.userAgent
      }
      this.report('error', errorData)
    })
  }

  /**
   * 初始化行为监控
   */
  private initBehaviorMonitor() {
    // 点击事件
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const behaviorData: BehaviorData = {
        timestamp: Date.now(),
        url: location.href,
        userId: this.getUserId(),
        sessionId: this.sessionId,
        type: 'click',
        target: this.getSelector(target),
        data: {
          text: target.textContent?.slice(0, 50),
          tagName: target.tagName
        }
      }
      this.report('behavior', behaviorData)
    }, true)

    // 页面跳转
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function (...args) {
      originalPushState.apply(this, args)
      monitor.trackNavigation('pushState')
    }

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args)
      monitor.trackNavigation('replaceState')
    }

    window.addEventListener('popstate', () => {
      monitor.trackNavigation('popstate')
    })
  }

  /**
   * 初始化批量上报
   */
  private initBatchReport() {
    this.batchTimer = window.setInterval(() => {
      this.flush()
    }, this.config.batchInterval)
  }

  /**
   * 上报数据
   */
  private report(type: 'performance' | 'error' | 'behavior', data: any) {
    if (Math.random() > this.config.sampleRate) {
      return
    }

    if (this.config.batchReport) {
      this.addToQueue(type, data)
    } else {
      this.sendImmediately(type, [data])
    }
  }

  /**
   * 添加到队列
   */
  private addToQueue(type: string, data: any) {
    switch (type) {
      case 'performance':
        this.performanceQueue.push(data)
        if (this.performanceQueue.length >= this.config.batchSize) {
          this.flush('performance')
        }
        break
      case 'error':
        this.errorQueue.push(data)
        if (this.errorQueue.length >= this.config.batchSize) {
          this.flush('error')
        }
        break
      case 'behavior':
        this.behaviorQueue.push(data)
        if (this.behaviorQueue.length >= this.config.batchSize) {
          this.flush('behavior')
        }
        break
    }
  }

  /**
   * 立即上报
   */
  private sendImmediately(type: string, data: any[]) {
    const payload = {
      type,
      data,
      timestamp: Date.now()
    }

    navigator.sendBeacon(
      this.config.reportUrl,
      JSON.stringify(payload)
    )
  }

  /**
   * 刷新队列（批量上报）
   */
  flush(type?: string) {
    if (type === 'performance' || !type) {
      if (this.performanceQueue.length > 0) {
        this.sendImmediately('performance', [...this.performanceQueue])
        this.performanceQueue = []
      }
    }

    if (type === 'error' || !type) {
      if (this.errorQueue.length > 0) {
        this.sendImmediately('error', [...this.errorQueue])
        this.errorQueue = []
      }
    }

    if (type === 'behavior' || !type) {
      if (this.behaviorQueue.length > 0) {
        this.sendImmediately('behavior', [...this.behaviorQueue])
        this.behaviorQueue = []
      }
    }
  }

  /**
   * 手动上报自定义事件
   */
  track(type: string, data: Record<string, any>) {
    const behaviorData: BehaviorData = {
      timestamp: Date.now(),
      url: location.href,
      userId: this.getUserId(),
      sessionId: this.sessionId,
      type: 'custom',
      data: { eventType: type, ...data }
    }
    this.report('behavior', behaviorData)
  }

  /**
   * 跟踪页面导航
   */
  trackNavigation(method: string) {
    const behaviorData: BehaviorData = {
      timestamp: Date.now(),
      url: location.href,
      userId: this.getUserId(),
      sessionId: this.sessionId,
      type: 'navigation',
      data: { method }
    }
    this.report('behavior', behaviorData)
  }

  /**
   * 观察LCP
   */
  private observeLCP(callback: (value: number) => void) {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        callback(lastEntry?.startTime || 0)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.error('[Monitor] LCP观察失败:', e)
    }
  }

  /**
   * 观察FID
   */
  private observeFID(callback: (value: number) => void) {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          callback(entry.processingStart - entry.startTime)
        })
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      console.error('[Monitor] FID观察失败:', e)
    }
  }

  /**
   * 观察CLS
   */
  private observeCLS(callback: (value: number) => void) {
    if (!('PerformanceObserver' in window)) return

    try {
      let clsValue = 0
      let sessionValue = 0
      let sessionEntries: any[] = []

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            sessionValue += entry.value
            sessionEntries.push(entry)
            clsValue = Math.max(clsValue, sessionValue)

            sessionEntries = sessionEntries.filter(
              (e) => entry.startTime - e.startTime < 1000
            )

            callback(clsValue)
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.error('[Monitor] CLS观察失败:', e)
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  /**
   * 获取用户ID
   */
  private getUserId(): string | undefined {
    return this.config.getUserId?.()
  }

  /**
   * 获取资源名称
   */
  private getResourceName(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname
    } catch {
      return url
    }
  }

  /**
   * 获取元素选择器
   */
  private getSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`
    }

    if (element.className) {
      const classes = element.className.split(' ').filter(c => c)
      if (classes.length > 0) {
        return `${element.tagName}.${classes[0]}`
      }
    }

    return element.tagName.toLowerCase()
  }

  /**
   * 销毁监控系统
   */
  destroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer)
    }
    this.flush()
    this.isInitialized = false
  }
}

// 创建全局实例
export const monitor = new MonitorCore()
```

---

##### 在项目中使用监控

```typescript
// src/monitor/index.ts
import { monitor, type MonitorConfig } from './MonitorCore'

// 初始化监控系统
export function initMonitor(config: Partial<MonitorConfig>) {
  monitor.init()
}

// 导出实例
export { monitor }
```

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { initMonitor } from '@/monitor'

// 初始化监控
initMonitor({
  reportUrl: 'https://monitor.example.com/api/report',
  enabled: import.meta.env.PROD,  // 生产环境启用
  sampleRate: 0.1,  // 采样率10%
  batchReport: true,
  batchInterval: 5000,
  batchSize: 10,
  getUserId: () => {
    // 从 store 或 cookie 获取用户ID
    return localStorage.getItem('userId') || undefined
  }
})

const app = createApp(App)
app.mount('#app')
```

---

##### 使用示例

```vue
<!-- 在组件中手动上报事件 -->
<template>
  <button @click="handleClick">点击按钮</button>
</template>

<script setup lang="ts">
import { monitor } from '@/monitor'

function handleClick() {
  // 手动上报自定义事件
  monitor.track('button_click', {
    buttonName: 'purchase',
    page: 'product_detail'
  })
}
</script>
```

---

### 错误监控（Sentry集成）

#### 安装 Sentry

```bash
npm install @sentry/vue
```

#### 配置 Sentry

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import * as Sentry from '@sentry/vue'

const app = createApp(App)

// Sentry 初始化
if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENV || 'production',
    release: import.meta.env.VITE_APP_VERSION,

    // 性能监控
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', 'api.example.com']
      }),
      new Sentry.Replay()
    ],

    // 采样率配置
    tracesSampleRate: 0.1, // 性能追踪采样率
    replaysSessionSampleRate: 0.1, // 回放会话采样率
    replaysOnErrorSampleRate: 1.0, // 错误时回放采样率

    // 过滤敏感信息
    beforeSend(event, hint) {
      // 移除敏感信息
      if (event.request?.headers) {
        delete event.request.headers['cookie']
        delete event.request.headers['authorization']
      }

      // 自定义错误标签
      event.tags = {
        ...event.tags,
        customTag: 'custom-value'
      }

      return event
    },

    // 上下文信息
    initialScope: {
      tags: {
        app: 'my-vue-app'
      },
      user: {
        id: 'user-id',
        username: 'user-name'
      }
    }
  })
}

app.mount('#app')
```

#### 手动错误上报

```typescript
// utils/sentry.ts
import * as Sentry from '@sentry/vue'

/**
 * 捕获异常
 */
export function captureException(error: Error, context?: Sentry.CaptureContext) {
  Sentry.captureException(error, context)
}

/**
 * 捕获消息
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level)
}

/**
 * 设置用户信息
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user)
}

/**
 * 添加面包屑（记录操作轨迹）
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb)
}

/**
 * 设置标签
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value)
}

/**
 * 设置上下文
 */
export function setContext(key: string, context: Record<string, any>) {
  Sentry.setContext(key, context)
}

/**
 * 性能追踪
 */
export function startTransaction(name: string, op: string) {
  const transaction = Sentry.startTransaction({ name, op })
  Sentry.configureScope((scope) => scope.setSpan(transaction))
  return transaction
}
```

#### 错误边界组件

```vue
<!-- components/ErrorBoundary.vue -->
<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2>出错了</h2>
      <p>{{ errorMessage }}</p>
      <div class="error-actions">
        <button @click="reload" class="btn-primary">刷新页面</button>
        <button @click="goHome" class="btn-secondary">返回首页</button>
      </div>
      <details v-if="showDetails" class="error-details">
        <summary @click.prevent>错误详情</summary>
        <pre>{{ errorStack }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { captureException, addBreadcrumb } from '@/utils/sentry'

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')
const showDetails = ref(import.meta.env.DEV)

onErrorCaptured((error: any, instance, info) => {
  hasError.value = true
  errorMessage.value = error.message || '未知错误'
  errorStack.value = error.stack || ''

  // 添加面包屑
  addBreadcrumb({
    category: 'error',
    message: error.message,
    level: 'error',
    data: { info }
  })

  // 上报错误
  captureException(error, {
    contexts: {
      vue: {
        componentName: instance?.$options?.name || 'Unknown',
        info
      }
    }
  })

  // 阻止错误继续传播
  return false
})

const reload = () => {
  window.location.reload()
}

const goHome = () => {
  hasError.value = false
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.error-content {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-content h2 {
  margin: 0 0 16px 0;
  color: #333;
}

.error-content p {
  color: #666;
  margin-bottom: 24px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.error-details {
  margin-top: 20px;
  text-align: left;
}

.error-details summary {
  cursor: pointer;
  color: #666;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
}

.error-details pre {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  margin-top: 8px;
}
</style>
```

### 用户行为埋点

#### 埋点基础实现

```typescript
// utils/analytics.ts

interface TrackEvent {
  eventName: string
  properties?: Record<string, any>
  category?: string
  label?: string
  value?: number
}

interface PageView {
  page: string
  title: string
  referrer?: string
  properties?: Record<string, any>
}

/**
 * 发送埋点数据
 */
async function sendTracking(data: any) {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT

  if (!endpoint) {
    console.debug('[Analytics]', data)
    return
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  } catch (error) {
    console.error('[Analytics] 发送失败:', error)
  }
}

/**
 * 页面浏览埋点
 */
export function trackPageView(pageView: PageView) {
  const data = {
    type: 'pageview',
    ...pageView,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent
  }

  sendTracking(data)
}

/**
 * 事件追踪埋点
 */
export function trackEvent(event: TrackEvent) {
  const data = {
    type: 'event',
    ...event,
    timestamp: Date.now(),
    url: window.location.href
  }

  sendTracking(data)
}

/**
 * 用户属性
 */
export function setUserProperties(properties: Record<string, any>) {
  const data = {
    type: 'user',
    action: 'set_properties',
    properties,
    timestamp: Date.now()
  }

  sendTracking(data)
}

/**
 * 设置用户ID
 */
export function setUserId(userId: string) {
  const data = {
    type: 'user',
    action: 'set_id',
    userId,
    timestamp: Date.now()
  }

  sendTracking(data)
}
```

#### 埋点指令

```typescript
// directives/track.ts
import { trackEvent } from '@/utils/analytics'

interface TrackBinding {
  eventName: string
  category?: string
  label?: string
  value?: number
  properties?: Record<string, any>
}

export const track = {
  mounted(el: HTMLElement, binding: { value: TrackBinding | string }) {
    const config = typeof binding.value === 'string'
      ? { eventName: binding.value }
      : binding.value

    el.addEventListener('click', () => {
      trackEvent({
        eventName: config.eventName,
        category: config.category,
        label: config.label,
        value: config.value,
        properties: config.properties
      })
    })
  }
}

// 使用示例
// <button v-track="{ eventName: 'button_click', category: 'interaction', label: 'submit' }">提交</button>
// <button v-track="'simple_click'">简单点击</button>
```

```typescript
// main.ts - 注册指令
import { createApp } from 'vue'
import { track } from './directives/track'

const app = createApp(App)
app.directive('track', track)
```

#### 埋点组合式函数

```typescript
// composables/useAnalytics.ts
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { trackPageView, trackEvent } from '@/utils/analytics'

export function useAnalytics() {
  const route = useRoute()

  /**
   * 追踪页面浏览
   */
  const trackView = (properties?: Record<string, any>) => {
    trackPageView({
      page: route.path,
      title: document.title,
      referrer: document.referrer,
      properties
    })
  }

  /**
   * 追踪点击事件
   */
  const trackClick = (element: string, properties?: Record<string, any>) => {
    trackEvent({
      eventName: 'click',
      category: 'interaction',
      label: element,
      properties
    })
  }

  /**
   * 追踪表单提交
   */
  const trackFormSubmit = (formName: string, properties?: Record<string, any>) => {
    trackEvent({
      eventName: 'form_submit',
      category: 'form',
      label: formName,
      properties
    })
  }

  /**
   * 追踪自定义事件
   */
  const trackCustomEvent = (eventName: string, properties?: Record<string, any>) => {
    trackEvent({
      eventName,
      properties
    })
  }

  /**
   * 追踪页面停留时间
   */
  const trackTimeOnPage = () => {
    const startTime = Date.now()

    onUnmounted(() => {
      const duration = Date.now() - startTime
      trackCustomEvent('time_on_page', {
        duration,
        page: route.path
      })
    })
  }

  return {
    trackView,
    trackClick,
    trackFormSubmit,
    trackCustomEvent,
    trackTimeOnPage
  }
}
```

```vue
<!-- 在组件中使用 -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <form @submit="handleSubmit">
      <!-- 表单内容 -->
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'

const title = ref('关于我们')

onMounted(() => {
  const { trackView, trackTimeOnPage } = useAnalytics()

  trackView({ pageTitle: title.value })
  trackTimeOnPage()
})

const handleSubmit = () => {
  const { trackFormSubmit } = useAnalytics()
  trackFormSubmit('contact_form', { source: 'about_page' })
}
</script>
```

### PV/UV 统计

```typescript
// utils/pageStats.ts

const VISITOR_ID_KEY = 'visitor_id'
const SESSION_ID_KEY = 'session_id'

/**
 * 获取或生成访客ID
 */
export function getVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY)

  if (!visitorId) {
    visitorId = generateUniqueId()
    localStorage.setItem(VISITOR_ID_KEY, visitorId)
  }

  return visitorId
}

/**
 * 获取或生成会话ID
 */
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY)

  if (!sessionId) {
    sessionId = generateUniqueId()
    sessionStorage.setItem(SESSION_ID_KEY, sessionId)
  }

  return sessionId
}

/**
 * 生成唯一ID
 */
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * PV统计
 */
export function trackPV(page: string, title: string) {
  const data = {
    type: 'pv',
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    page,
    title,
    timestamp: Date.now(),
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`
  }

  sendStats(data)
}

/**
 * UV统计
 */
export function trackUV(page: string) {
  const today = new Date().toDateString()
  const uvKey = `uv_${page}_${today}`

  if (!sessionStorage.getItem(uvKey)) {
    const data = {
      type: 'uv',
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      page,
      timestamp: Date.now()
    }

    sendStats(data)
    sessionStorage.setItem(uvKey, '1')
  }
}

/**
 * 发送统计数据
 */
async function sendStats(data: any) {
  const endpoint = import.meta.env.VITE_STATS_ENDPOINT

  if (!endpoint) return

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  } catch (error) {
    console.error('[Stats] 发送失败:', error)
  }
}
```

### A/B 测试实现

```typescript
// utils/abTest.ts

interface ABTestConfig {
  testName: string
  variants: Array<{
    name: string
    weight: number // 0-1之间
  }>
  persist?: boolean // 是否持久化选择
}

/**
 * 获取A/B测试变体
 */
export function getABTestVariant(config: ABTestConfig): string {
  const { testName, variants, persist = true } = config

  // 检查是否已有选择
  const storageKey = `ab_test_${testName}`
  const savedVariant = persist ? localStorage.getItem(storageKey) : null

  if (savedVariant) {
    return savedVariant
  }

  // 随机选择变体
  const random = Math.random()
  let cumulativeWeight = 0
  let selectedVariant = variants[0].name

  for (const variant of variants) {
    cumulativeWeight += variant.weight
    if (random <= cumulativeWeight) {
      selectedVariant = variant.name
      break
    }
  }

  // 保存选择
  if (persist) {
    localStorage.setItem(storageKey, selectedVariant)
  }

  // 上报分配
  reportABTestAssignment(testName, selectedVariant)

  return selectedVariant
}

/**
 * 上报A/B测试分配
 */
function reportABTestAssignment(testName: string, variant: string) {
  const data = {
    type: 'ab_test_assignment',
    testName,
    variant,
    timestamp: Date.now(),
    visitorId: getVisitorId()
  }

  sendStats(data)
}

/**
 * 追踪A/B测试转化
 */
export function trackABTestConversion(testName: string, variant: string, value?: number) {
  const data = {
    type: 'ab_test_conversion',
    testName,
    variant,
    value,
    timestamp: Date.now(),
    visitorId: getVisitorId()
  }

  sendStats(data)
}
```

```vue
<!-- A/B测试使用示例 -->
<template>
  <div class="page">
    <component :is="variantComponent" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { getABTestVariant, trackABTestConversion } from '@/utils/abTest'
import VariantA from './VariantA.vue'
import VariantB from './VariantB.vue'

const variant = computed(() =>
  getABTestVariant({
    testName: 'checkout_button_color',
    variants: [
      { name: 'A', weight: 0.5 },
      { name: 'B', weight: 0.5 }
    ]
  })
)

const variantComponent = computed(() => variant.value === 'A' ? VariantA : VariantB)

const handleConversion = () => {
  trackABTestConversion('checkout_button_color', variant.value)
}
</script>
```

### 本章小结

| 监控类型 | 实现方式 | 关键指标 |
|----------|----------|----------|
| 性能监控 | Performance API | FCP、LCP、FID、CLS |
| 错误监控 | Sentry/Self-hosted | 错误率、错误类型 |
| 埋点统计 | 自定义/第三方 | PV、UV、点击率 |
| A/B测试 | 变体分配 + 转化追踪 | 转化率、留存率 |

---
