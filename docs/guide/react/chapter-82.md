---
title: React 企业级实战项目3
description: React 19 实时数据可视化大屏系统
---

# ：React 19 完全实战项目 - 实时数据可视化大屏系统

> **项目概述**：本项目是一个基于React 19的企业级实时数据可视化大屏系统，支持千万级数据渲染、实时更新、多屏联动、自适应布局等功能。
>
> **学习目标**：
> - 掌握React高性能渲染技巧
> - 熟练使用Canvas、SVG、WebGL进行数据可视化
> - 掌握WebSocket实时数据推送
> - 学会大屏布局、响应式设计、性能优化

---

## 项目介绍

### 项目背景

本实时数据可视化大屏系统是一个企业级监控指挥中心解决方案，主要功能包括：

- ✅ **实时监控**：实时数据刷新、WebSocket推送、状态告警
- ✅ **千万级渲染**：高性能渲染大量数据点
- ✅ **多屏联动**：主屏+分屏+移动端协同
- ✅ **自适应布局**：自动适配不同分辨率
- ✅ **组件库**：可复用的大屏组件
- ✅ **主题切换**：多套主题皮肤
- ✅ **数据源**：支持多种数据接入方式
- ✅ **交互功能**：钻取、筛选、联动

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **框架** | React | 19.x |
| **渲染** | Canvas + SVG + WebGL | latest |
| **可视化** | ECharts / Deck.gl / D3 | latest |
| **状态管理** | Zustand + Valtio | latest |
| **实时通信** | WebSocket / Socket.io | latest |
| **性能优化** | react-spring / react-window | latest |
| **Worker** | Web Worker | latest |
| **样式** | Tailwind CSS | 3.x |
| **构建** | Vite | 5.x |
| **类型** | TypeScript | 5.x |

### 项目结构

```
react-dashboard-system/
├── src/
│   ├── components/
│   │   ├── charts/                 # 图表组件
│   │   │   ├── LineChart/
│   │   │   ├── BarChart/
│   │   │   ├── PieChart/
│   │   │   ├── MapChart/
│   │   │   ├── GaugeChart/
│   │   │   └── 3DChart/
│   │   ├── containers/              # 容器组件
│   │   │   ├── DashboardGrid/
│   │   │   ├── ScrollPanel/
│   │   │   └── FullScreenContainer/
│   │   └── widgets/                 # 小部件
│   │       ├── Clock/
│   │       ├── Weather/
│   │       └── Ticker/
│   ├── hooks/
│   │   ├── useWebSocket.ts         # WebSocket钩子
│   │   ├── useResize.ts            # 响应式钩子
│   │   ├── usePerformance.ts       # 性能监控
│   │   └── useFullscreen.ts        # 全屏钩子
│   ├── stores/
│   │   ├── dashboard.ts            # 仪表盘状态
│   │   ├── realtime.ts             # 实时数据
│   │   └── theme.ts                # 主题配置
│   ├── utils/
│   │   ├── performance.ts          # 性能优化
│   │   ├── canvas.ts               # Canvas工具
│   │   └── adapter.ts              # 数据适配
│   └── workers/
│       ├── render-worker.ts       # 渲染Worker
│       └── data-processor.ts      # 数据处理Worker
```

---

## 核心功能实现

### 1. 千万级数据高性能渲染

```typescript
// src/utils/performance/virtualized-render.tsx
import { FixedSizeList as List } from 'react-window'
import { memo, useMemo } from 'react'

interface DataPoint {
  id: string
  value: number
  timestamp: number
  category: string
}

interface VirtualizedChartProps {
  data: DataPoint[]
  height: number
  itemHeight: number
}

export const VirtualizedChart = memo(({ data, height, itemHeight }: VirtualizedChartProps) => {
  // 数据分块加载
  const chunks = useMemo(() => {
    const chunkSize = 1000
    return Array.from({ length: Math.ceil(data.length / chunkSize) }, (_, i) =>
      data.slice(i * chunkSize, (i + 1) * chunkSize)
    )
  }, [data])

  const Row = memo(({ index, style }: { index: number; style: any }) => {
    const point = data[index]
    return (
      <div style={style} className="chart-row">
        <span className="timestamp">{new Date(point.timestamp).toLocaleTimeString()}</span>
        <span className="value">{point.value}</span>
        <span className="category">{point.category}</span>
      </div>
    )
  })

  Row.displayName = 'Row'

  return (
    <List
      height={height}
      itemCount={data.length}
      itemSize={itemHeight}
      width="100%"
      className="virtualized-chart"
    >
      {Row}
    </List>
  )
})

// 使用 Web Worker 处理数据
const useDataWorker = (data: any[]) => {
  const [processedData, setProcessedData] = useState(data)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('../workers/data-processor.ts', import.meta.url))

    worker.postMessage({ type: 'process', data })

    worker.onmessage = (e) => {
      setProcessedData(e.data)
      setProcessing(false)
    }

    return () => worker.terminate()
  }, [data])

  return { processedData, processing }
}
```

### 2. Canvas 高性能图表

```typescript
// src/components/charts/PerformanceChart.tsx
import { useRef, useEffect } from 'react'
import { useSpring, animated } from '@react-spring/web'

interface PerformanceChartProps {
  data: number[]
  width: number
  height: number
  color?: string
}

export const PerformanceChart = ({ data, width, height, color = '#3b82f6' }: PerformanceChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清除画布
    ctx.clearRect(0, 0, width, height)

    // 绘制网格
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    const gridSize = 50
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // 绘制数据线
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height * 0.8 - height * 0.1

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // 绘制渐变填充
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, `${color}33`)
    gradient.addColorStop(1, `${color}00`)

    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

  }, [data, width, height, color])

  return <canvas ref={canvasRef} width={width} height={height} />
}
```

### 3. WebGL 3D地球仪

```typescript
// src/components/charts/3DGlobe.tsx
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export const ThreeDGlobe = () => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // 场景
    const scene = new THREE.Scene()

    // 相机
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 2

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    mountRef.current.appendChild(renderer.domElement)

    // 地球几何体
    const geometry = new THREE.SphereGeometry(1, 64, 64)
    const material = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true
    })
    const globe = new THREE.Mesh(geometry, material)
    scene.add(globe)

    // 添加数据点
    const points = generateRandomPoints(100)
    const pointGeometry = new THREE.BufferGeometry()
    const pointMaterial = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 0.02
    })

    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    const pointCloud = new THREE.Points(pointGeometry, pointMaterial)
    globe.add(pointCloud)

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.0

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // 清理
    return () => {
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return <div ref={mountRef} className="w-full h-full" />
}

function generateRandomPoints(count: number): Float32Array {
  const points = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const phi = Math.random() * Math.PI * 2
    const theta = Math.random() * Math.PI
    const r = 1.01 // 稍微高于地球表面

    points[i * 3] = r * Math.sin(theta) * Math.cos(phi)
    points[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
    points[i * 3 + 2] = r * Math.cos(theta)
  }
  return points
}
```

### 4. WebSocket 实时数据

```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

export function useWebSocket(url: string) {
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout>()

  const connect = () => {
    ws.current = new WebSocket(url)

    ws.current.onopen = () => {
      setConnected(true)
      console.log('WebSocket connected')
    }

    ws.current.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data)
      setMessages((prev) => [...prev, message])

      // 更新到状态管理
      if (message.type === 'data_update') {
        // 触发数据更新
        window.dispatchEvent(new CustomEvent('realtime-data', {
          detail: message.data
        }))
      }
    }

    ws.current.onclose = () => {
      setConnected(false)
      // 自动重连
      reconnectTimer.current = setTimeout(() => {
        connect()
      }, 3000)
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url])

  const send = (data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data))
    }
  }

  return { connected, messages, send }
}
```

### 5. 响应式大屏布局

```typescript
// src/components/containers/DashboardGrid.tsx
import { useEffect, useState } from 'react'
import { useWindowSize } from '@/hooks/useResize'

interface DashboardLayout {
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

const gridLayouts: Record<string, DashboardLayout[]> = {
  '1920x1080': [
    { x: 0, y: 0, w: 12, h: 8 },    // 主图表
    { x: 12, y: 0, w: 6, h: 4 },   // 右上指标
    { x: 18, y: 0, w: 6, h: 4 },   // 右上告警
    { x: 12, y: 4, w: 12, h: 4 },  // 右下地图
    { x: 0, y: 8, w: 8, h: 4 },    // 左下列表
    { x: 8, y: 8, w: 10, h: 4 },   // 中间趋势
  ],
  '3840x2160': [
    { x: 0, y: 0, w: 18, h: 10 },
    { x: 18, y: 0, w: 12, h: 5 },
    { x: 30, y: 0, w: 12, h: 5 },
    // ... 更多配置
  ]
}

export function DashboardGrid() {
  const [layout, setLayout] = useState<DashboardLayout[]>(gridLayouts['1920x1080'])
  const { width, height } = useWindowSize()

  useEffect(() => {
    // 根据分辨率选择布局
    const resolution = `${width}x${height}`
    if (gridLayouts[resolution]) {
      setLayout(gridLayouts[resolution])
    } else {
      // 自动适配布局
      const adaptiveLayout = generateAdaptiveLayout(width, height)
      setLayout(adaptiveLayout)
    }
  }, [width, height])

  return (
    <div className="dashboard-grid" style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {layout.map((item, index) => (
        <div
          key={index}
          className="dashboard-item"
          style={{
            position: 'absolute',
            left: `${(item.x / 24) * 100}%`,
            top: `${(item.y / 12) * 100}%`,
            width: `${(item.w / 24) * 100}%`,
            height: `${(item.h / 12) * 100}%`,
            padding: '10px',
            boxSizing: 'border-box'
          }}
        >
          <DashboardWidget type={`widget-${index}`} />
        </div>
      ))}
    </div>
  )
}

function generateAdaptiveLayout(width: number, height: number): DashboardLayout[] {
  // 根据屏幕尺寸自动生成布局
  const aspectRatio = width / height

  // 横屏
  if (aspectRatio > 1.5) {
    return [
      { x: 0, y: 0, w: 16, h: 8 },
      { x: 16, y: 0, w: 8, h: 8 },
      { x: 0, y: 8, w: 12, h: 4 },
      { x: 12, y: 8, w: 12, h: 4 },
    ]
  }
  // 竖屏
  else {
    return [
      { x: 0, y: 0, w: 24, h: 6 },
      { x: 0, y: 6, w: 12, h: 6 },
      { x: 12, y: 6, w: 12, h: 6 },
      { x: 0, y: 12, w: 24, h: 6 },
    ]
  }
}
```

### 6. 实时数据组件

```typescript
// src/components/widgets/RealtimeCounter.tsx
import { useSpring, animated } from '@react-spring/web'
import { useWebSocket } from '@/hooks/useWebSocket'

interface CounterProps {
  endpoint: string
  label: string
  targetValue?: number
}

export function RealtimeCounter({ endpoint, label, targetValue }: CounterProps) {
  const [value, setValue] = useState(0)
  const { connected } = useWebSocket(endpoint)

  // 动画效果
  const { number } = useSpring({
    from: { value: 0 },
    to: { value },
    config: { tension: 120, friction: 14 }
  })

  useEffect(() => {
    // 监听实时数据更新
    const handler = (event: CustomEvent) => {
      setValue(event.detail.value)
    }

    window.addEventListener('realtime-data', handler as EventListener)

    return () => {
      window.removeEventListener('realtime-data', handler as EventListener)
    }
  }, [])

  return (
    <div className="realtime-counter">
      <div className="label">{label}</div>
      <animated.div className="value">
        {number.to((n) => Math.floor(n)).toFixed(0)}
      </animated.div>
      <div className={`status ${connected ? 'online' : 'offline'}`}>
        ●
      </div>
    </div>
  )
}
```

### 7. 主题切换系统

```typescript
// src/stores/theme.ts
import { create } from 'zustand'

type ThemeMode = 'light' | 'dark' | 'blue' | 'cyberpunk'

interface ThemeConfig {
  primary: string
  secondary: string
  background: string
  text: string
  grid: string
  chart: {
    colors: string[]
    line: string
    area: string
  }
}

const themes: Record<ThemeMode, ThemeConfig> = {
  light: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#1f2937',
    grid: '#e5e7eb',
    chart: {
      colors: ['#3b82f6', '#10b981', '#f59e0b'],
      line: '#3b82f6',
      area: 'rgba(59, 130, 246, 0.1)'
    }
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#a78bfa',
    background: '#0f172a',
    text: '#f1f5f9',
    grid: '#1e293b',
    chart: {
      colors: ['#60a5fa', '#34d399', '#fbbf24'],
      line: '#60a5fa',
      area: 'rgba(96, 165, 250, 0.1)'
    }
  },
  blue: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    background: '#0c4a6e',
    text: '#ffffff',
    grid: '#075985',
    chart: {
      colors: ['#0ea5e9', '#22d3ee', '#67e8f9'],
      line: '#0ea5e9',
      area: 'rgba(14, 165, 233, 0.1)'
    }
  },
  cyberpunk: {
    primary: '#ff00ff',
    secondary: '#00ffff',
    background: '#0a0a0a',
    text: '#00ff00',
    grid: '#1a1a1a',
    chart: {
      colors: ['#ff00ff', '#00ffff', '#ffff00'],
      line: '#ff00ff',
      area: 'rgba(255, 0, 255, 0.1)'
    }
  }
}

export const useThemeStore = create<{
  mode: ThemeMode
  theme: ThemeConfig
  setMode: (mode: ThemeMode) => void
}>((set) => ({
  mode: 'dark',
  theme: themes.dark,
  setMode: (mode) => set({ mode, theme: themes[mode] })
}))
```

---

## 性能优化

### 1. 按需渲染

```typescript
// src/hooks/useIntersectionRender.ts
import { useEffect, useRef, useState } from 'react'

export function useIntersectionRender(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}
```

### 2. 数据分片

```typescript
// src/utils/data-chunking.ts
export function chunkData<T>(data: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []

  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize))
  }

  return chunks
}

// 使用分片渲染
export function useChunkedRendering<T>(data: T[], chunkSize = 100) {
  const [visibleChunks, setVisibleChunks] = useState(1)
  const chunks = useMemo(() => chunkData(data, chunkSize), [data, chunkSize])

  const loadMore = () => {
    setVisibleChunks((prev) => Math.min(prev + 1, chunks.length))
  }

  const visibleData = useMemo(
    () => chunks.slice(0, visibleChunks).flat(),
    [chunks, visibleChunks]
  )

  return { visibleData, loadMore, hasMore: visibleChunks < chunks.length }
}
```

---

## 项目总结

本项目涵盖了React 19高性能可视化开发的核心技能：

✅ **技术栈**：React 19 + Canvas + WebGL + WebSocket + ECharts
✅ **核心功能**：千万级渲染、实时更新、多屏联动、响应式布局
✅ **性能优化**：虚拟化、Web Worker、按需渲染、数据分片
✅ **最佳实践**：性能监控、组件设计、状态管理、内存优化

通过这个项目，你将掌握：
- React 19最新特性的实际应用
- Canvas/WebGL高性能渲染
- WebSocket实时数据通信
- 大屏布局和响应式设计
- 千万级数据渲染优化
- 企业级可视化项目架构

---

## 下一步学习

- [React性能优化完全指南](/guide/react/chapter-77)
- [React组件设计模式](/guide/react/chapter-78)
- [React项目架构与最佳实践](/guide/react/chapter-80)
- [React 19 + Next.js 15 电商平台](/guide/react/chapter-81)
