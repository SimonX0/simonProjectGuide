# 性能优化完全指南

## 性能优化完全指南

> **学习目标**：全面掌握Next.js应用的性能优化策略和最佳实践
> **核心内容**：性能监测、优化策略、Lighthouse优化、实战案例

### 性能监测

#### 核心Web指标（Core Web Vitals）

**三大核心指标**：

```
┌─────────────────────────────────────────────────────────────┐
│                   Core Web Vitals                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. LCP (Largest Contentful Paint)                         │
│     最大内容绘制 - 测量加载性能                              │
│     目标: < 2.5秒                                           │
│                                                             │
│  2. INP (Interaction to Next Paint)                        │
│     交互到下次绘制 - 测量交互响应性                          │
│     目标: < 200毫秒                                         │
│                                                             │
│  3. CLS (Cumulative Layout Shift)                          │
│     累积布局偏移 - 测量视觉稳定性                            │
│     目标: < 0.1                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 性能监测工具

**1. Web Vitals Report**：

```typescript
// app/layout.tsx
import Script from 'next/script'

export function WebVitalsReport() {
  return (
    <Script id="web-vitals" strategy="afterInteractive">
      {`
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              console.log('[Web Vitals]', entry.name, entry.value);

              // 发送到分析平台
              if (window.gtag) {
                gtag('event', entry.name, {
                  value: Math.round(entry.name === 'CLS' ? entry.value * 1000 : entry.value),
                  event_label: entry.id,
                  non_interaction: true,
                });
              }
            }
          });

          observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        }
      `}
    </Script>
  )
}
```

**2. 自定义分析**：

```typescript
// lib/analytics.ts
export function reportWebVitals(metric: any) {
  const { name, value, id } = metric

  // 发送到分析服务
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      non_interaction: true,
    })
  }

  // 发送到自定义端点
  if (typeof fetch !== 'undefined') {
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ name, value, id }),
    })
  }
}
```

**3. 使用next/web-vitals**：

```typescript
// app/layout.tsx
import { WebVitals } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <WebVitals />
      </body>
    </html>
  )
}
```

### 优化策略

#### 1. 代码分割

**动态导入**：

```typescript
// app/dashboard/page.tsx
import dynamic from 'next/dynamic'

// ✅ 推荐：动态导入重型组件
const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <div>加载图表...</div>,
  ssr: false, // 仅客户端渲染
})

const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), {
  loading: () => <div>加载编辑器...</div>,
})

export default function DashboardPage() {
  return (
    <div>
      <h1>仪表盘</h1>
      <Chart />
      <MarkdownEditor />
    </div>
  )
}
```

**路由级分割**：

```typescript
// app/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      <h1>首页</h1>

      {/* ✅ 推荐：使用Link进行预加载 */}
      <Link href="/dashboard" prefetch={true}>
        仪表盘
      </Link>
    </div>
  )
}
```

#### 2. 图片优化

**优化清单**：

```typescript
// ✅ 使用next/image
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // LCP图片
  quality={90}
  sizes="100vw"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ✅ 响应式图片
<Image
  src="/photo.jpg"
  alt="响应式"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// ❌ 避免原生img标签
<img src="/photo.jpg" width={800} height={600} />
```

#### 3. 字体优化

**font-display策略**：

```typescript
// ✅ 推荐：使用next/font
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // 立即使用备用字体
  variable: '--font-inter',
})

// ✅ 预连接
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

#### 4. 缓存策略

**静态生成**：

```typescript
// ✅ 推荐：使用generateStaticParams
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

// ✅ ISR（增量静态再生成）
export const revalidate = 3600 // 1小时

// ✅ 按需重新验证
fetch('https://api.example.com/data', {
  next: { tags: ['data'] },
})
```

**数据缓存**：

```typescript
// ✅ 使用fetch缓存
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    // 缓存策略
    next: {
      revalidate: 3600, // 1小时后重新验证
      tags: ['data'], // 用于按需重新验证
    },
  })

  return res.json()
}

// ✅ 客户端缓存
const { data } = useSWR('/api/data', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000, // 1分钟内不重复请求
})
```

#### 5. 包体积优化

**Tree Shaking**：

```typescript
// ✅ 推荐：按需导入
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

// ❌ 不推荐：导入整个库
import * as UI from '@/components/ui'
import * as Hooks from '@/hooks'
```

**移除未使用的代码**：

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境压缩
  swcMinify: true,

  // 移除console.log
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
}

module.exports = nextConfig
```

### Lighthouse优化

#### Lighthouse配置

**创建Lighthouse配置**：

```javascript
// lighthouse.config.js
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    emulatedFormFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
    screenEmulation: {
      mobile: false,
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      disabled: false,
    },
  },
}
```

#### CI/CD集成

**GitHub Actions**：

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/dashboard
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### 实战案例：性能优化对比

让我们创建一个性能优化的完整示例。

#### 1. 优化前

```typescript
// ❌ 优化前：性能问题

// app/page.tsx
import { useEffect, useState } from 'react'

export default function Page() {
  const [data, setData] = useState([])
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    // 串行数据请求
    fetch('/api/data')
      .then(r => r.json())
      .then(data => {
        setData(data)
        return fetch('/api/chart')
      })
      .then(r => r.json())
      .then(chart => setChartData(chart))
  }, [])

  return (
    <div>
      <img src="/hero.jpg" width={1920} height={1080} />

      <ChartComponent data={chartData} />

      <MarkdownEditor />

      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}

// ChartComponent.tsx - 100KB bundle
import Chart from 'chart.js/auto'
export function ChartComponent({ data }) {
  // 大型图表库
  return <canvas ref={canvasRef} />
}
```

#### 2. 优化后

```typescript
// ✅ 优化后：性能提升

// app/page.tsx
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'

// ✅ 动态导入重型组件
const ChartComponent = dynamic(() => import('@/components/Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), {
  loading: () => <EditorSkeleton />,
})

// ✅ 并行数据请求
async function getData() {
  const [data, chartData] = await Promise.all([
    fetch('/api/data', {
      next: { revalidate: 3600 },
    }).then(r => r.json()),
    fetch('/api/chart', {
      next: { revalidate: 3600 },
    }).then(r => r.json()),
  ])

  return { data, chartData }
}

export default async function Page() {
  const { data, chartData } = await getData()

  return (
    <>
      {/* ✅ 优化的图片 */}
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={1920}
        height={1080}
        priority
        quality={90}
        placeholder="blur"
      />

      {/* ✅ 延迟加载的组件 */}
      <Suspense fallback={<ChartSkeleton />}>
        <ChartComponent data={chartData} />
      </Suspense>

      <Suspense fallback={<EditorSkeleton />}>
        <MarkdownEditor />
      </Suspense>

      {/* ✅ 列表虚拟化 */}
      <VirtualizedList items={data} />
    </>
  )
}

// ✅ 骨架屏组件
function ChartSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
  )
}

function EditorSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
  )
}
```

#### 3. 性能对比

**优化前后对比**：

| 指标 | 优化前 | 优化后 | 改进 |
|------|--------|--------|------|
| **LCP** | 4.2s | 1.8s | ✅ 57% ↓ |
| **INP** | 350ms | 120ms | ✅ 66% ↓ |
| **CLS** | 0.25 | 0.05 | ✅ 80% ↓ |
| **FCP** | 2.1s | 0.9s | ✅ 57% ↓ |
| **TTI** | 5.8s | 2.3s | ✅ 60% ↓ |
| **Bundle Size** | 450KB | 180KB | ✅ 60% ↓ |

**Lighthouse评分对比**：

```
优化前:
┌─────────────────────────────┐
│ Performance: 65             │
│ Accessibility: 82           │
│ Best Practices: 78          │
│ SEO: 90                     │
└─────────────────────────────┘

优化后:
┌─────────────────────────────┐
│ Performance: 98 ✨          │
│ Accessibility: 100 ✨       │
│ Best Practices: 100 ✨      │
│ SEO: 100 ✨                │
└─────────────────────────────┘
```

### 性能优化清单

#### 关键优化项

**✅ 必须优化**：

- [ ] 使用`next/image`优化所有图片
- [ ] 使用`next/font`优化字体加载
- [ ] LCP图片设置`priority`
- [ ] 启用静态生成或ISR
- [ ] 配置适当的缓存策略
- [ ] 动态导入大型组件
- [ ] 移除未使用的依赖

**⭐ 推荐优化**：

- [ ] 实现骨架屏和加载状态
- [ ] 使用虚拟列表处理长列表
- [ ] 配置CDN加速静态资源
- [ ] 实现请求去重和缓存
- [ ] 优化关键CSS内联
- [ ] 使用React.memo避免不必要的重渲染
- [ ] 配置Service Worker缓存

**🔧 高级优化**：

- [ ] 实现边缘函数
- [ ] 使用Web Workers处理重计算
- [ ] 实现预连接和DNS预解析
- [ ] 优化第三方脚本加载
- [ ] 实现渐进式Web应用(PWA)
- [ ] 使用HTTP/2 Server Push
- [ ] 实现临界CSS提取

### 监控和维护

#### 持续监控

```typescript
// lib/performance.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  record(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)

    // 发送到监控服务
    this.sendToAnalytics(name, value)
  }

  getAverage(name: string): number {
    const values = this.metrics.get(name) || []
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  getPercentile(name: string, percentile: number): number {
    const values = (this.metrics.get(name) || []).sort((a, b) => a - b)
    const index = Math.floor(values.length * percentile)
    return values[index] || 0
  }

  private sendToAnalytics(name: string, value: number) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, {
        value: Math.round(value),
        event_category: 'Performance',
      })
    }
  }
}

// 使用
const monitor = new PerformanceMonitor()

// 记录FCP
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    monitor.record(entry.name, entry.startTime)
  }
}).observe({ entryTypes: ['paint'] })
```

### 最佳实践总结

#### 1. 加载性能

```typescript
// ✅ 优先加载关键资源
<Image priority />
<link rel="preload" />

// ✅ 延迟加载非关键资源
<Script strategy="lazyOnload" />
dynamic(() => import('./Component'))
```

#### 2. 渲染性能

```typescript
// ✅ 使用React.memo
const MemoComponent = React.memo(Component)

// ✅ 使用useMemo和useCallback
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
const memoizedCallback = useCallback(() => { doSomething(a, b) }, [a, b])

// ✅ 虚拟化长列表
import { useVirtualizer } from '@tanstack/react-virtual'
```

#### 3. 网络性能

```typescript
// ✅ 启用压缩
// next.config.js
compress: true

// ✅ 使用CDN
const cdnUrl = 'https://cdn.example.com'
<Image src={`${cdnUrl}/image.jpg`} />

// ✅ 预连接关键域名
<link rel="preconnect" href="https://api.example.com" />
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| Core Web Vitals | LCP、INP、CLS | 理解并优化 |
| 性能监测 | Web Vitals、自定义分析 | 掌握 |
| 优化策略 | 代码分割、缓存、资源优化 | 熟练掌握 |
| Lighthouse | 配置、CI/CD | 掌握 |
| 实战案例 | 优化前后对比 | 能够实现 |

---

**恭喜你！** 你已经完成了Next.js完整的学习之旅，从基础到高级功能，再到性能优化。现在你可以构建高性能、生产级的Next.js应用了！

**继续学习资源**：
- [Next.js官方文档](https://nextjs.org/docs)
- [Web.dev性能指南](https://web.dev/performance/)
- [React性能优化](https://react.dev/learn/render-and-commit)
