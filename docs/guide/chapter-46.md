# 性能分析与优化工具深度使用

## 性能分析与优化工具深度使用
> **学习目标**：掌握 Chrome Performance 和性能分析工具
> **核心内容**：Performance 面板、Lighthouse、内存分析

### Chrome Performance 面板

#### 录制性能

```
步骤：
1. 打开 Chrome DevTools
2. 切换到 Performance 面板
3. 点击录制按钮
4. 执行操作
5. 停止录制
6. 分析结果
```

#### 性能标记 API

```typescript
// 添加性能标记
performance.mark('operation-start')

// 执行操作
doSomeWork()

performance.mark('operation-end')
performance.measure('operation', 'operation-start', 'operation-end')
```

### Web Vitals 监控

```typescript
// LCP 监控
new PerformanceObserver((list) => {
  const entries = list.getEntries()
  const lcp = entries[entries.length - 1]
  console.log('LCP:', lcp.startTime)
}).observe({ entryTypes: ['largest-contentful-paint'] })

// FID 监控
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('FID:', entry.processingStart - entry.startTime)
  }
}).observe({ entryTypes: ['first-input'] })

// CLS 监控
let cls = 0
new PerformanceObserver((list) => {
  for (const entry of list.getEntries() as any[]) {
    if (!entry.hadRecentInput) {
      cls += entry.value
      console.log('CLS:', cls.toFixed(3))
    }
  }
}).observe({ entryTypes: ['layout-shift'] })
```

### 内存分析

```typescript
// 监控内存使用
setInterval(() => {
  if ('memory' in performance) {
    const mem = (performance as any).memory
    console.log({
      used: `${(mem.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(mem.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(mem.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    })
  }
}, 10000)
```

### Lighthouse 自动化测试

```javascript
// lighthouse.config.js
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    emulatedFormFactor: 'mobile'
  }
}
```

### 性能优化清单

| 指标 | 目标值 | 优化方法 |
|------|--------|----------|
| FCP | <1.8s | 减少阻塞资源、代码分割 |
| LCP | <2.5s | 优化图片、预加载关键资源 |
| FID | <100ms | 减少长任务、优化 JS 执行 |
| CLS | <0.1 | 避免布局偏移、预留图片空间 |

### 本章小结

| 内容 | 工具 |
|------|------|
| **Performance 面板** | Chrome DevTools |
| **Web Vitals** | PerformanceObserver API |
| **内存分析** | Memory 面板、Heap Snapshot |
| **自动化测试** | Lighthouse CI |

---
