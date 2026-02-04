# 第44章：移动端开发与响应式设计完全指南

## 第44章 移动端开发与响应式设计完全指南

> **学习目标**：掌握Vue3移动端开发和响应式设计技术
> **核心内容**：移动端适配方案、响应式布局、触摸事件、移动端优化

### 44.1 移动端开发基础

#### 44.1.1 视口(Viewport)配置

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />

  <!-- 核心：视口配置 -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />

  <!-- iOS Safari 配置 -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

  <!-- Android 配置 -->
  <meta name="mobile-web-app-capable" content="yes" />

  <!-- 主题色 -->
  <meta name="theme-color" content="#42b983" />

  <!-- PWA 配置 -->
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
</head>
</html>
```

**Viewport 参数说明：**

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `width` | 视口宽度 | `device-width` |
| `initial-scale` | 初始缩放 | `1.0` |
| `maximum-scale` | 最大缩放 | `1.0` |
| `user-scalable` | 用户缩放 | `no`（应用类）|
| `viewport-fit=cover` | 适配刘海屏 | iPhone X+ 必须 |

#### 44.1.2 移动端适配方案对比

```
┌─────────────────────────────────────────────────────────────────┐
│                    移动端适配方案对比                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  方案1: Rem 适配                                                │
│  ────────────────────                                            │
│  • 原理: 根据根元素字体大小比例计算                               │
│  • 优点: 兼容性好，可精确控制                                     │
│  • 缺点: 计算复杂，需要转换工具                                   │
│  • 适用: 老项目、需要精确还原设计稿                               │
│                                                                  │
│  方案2: VW/VH 适配                                              │
│  ────────────────────                                            │
│  • 原理: 直接使用视口单位                                         │
│  • 优点: 简单直接，无需计算                                       │
│  • 缺点: 兼容性问题，竖屏横屏切换问题                             │
│  • 适用: 简单布局、现代浏览器                                     │
│                                                                  │
│  方案3: Flex + 百分比                                           │
│  ────────────────────                                            │
│  • 原理: 弹性布局 + 百分比宽度                                    │
│  • 优点: 自适应，实现简单                                         │
│  • 缺点: 高度难以控制                                            │
│  • 适用: 流式布局、自适应内容                                     │
│                                                                  │
│  方案4: Grid + Media Query (推荐) ✅                            │
│  ───────────────────────────────────                             │
│  • 原理: 网格布局 + 媒体查询断点                                   │
│  • 优点: 响应式最佳实践，精确控制                                  │
│  • 缺点: 需要写多套样式                                           │
│  • 适用: 复杂响应式布局、全端覆盖                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 44.2 Rem 适配方案

#### 44.2.1 Rem 原理

```css
/* Rem 适配原理 */

/* 1. 设置根元素字体大小为视口宽度的 1/100 */
html {
  font-size: 1vw;  /* 1vw = 1% viewport width */
}

/* 2. 使用 rem 单位编写样式 */
.container {
  width: 100rem;    /* 100rem = 100vw */
  padding: 2rem;    /* 2rem = 2vw */
}

/* 3. 设计稿 750px, 元素宽度 375px */
/* 计算: 375 / 750 * 100 = 50rem */
```

#### 44.2.2 自动计算根元素字体大小

```javascript
// src/utils/rem.ts
/**
 * 设置 Rem 基准值
 * @param designWidth 设计稿宽度，默认 750
 */
export function setRemBase(designWidth = 750) {
  const docEl = document.documentElement
  const clientWidth = docEl.clientWidth

  if (!clientWidth) return

  // 计算比例: 屏幕宽度 / 设计稿宽度 * 100
  const rem = (clientWidth / designWidth) * 100

  docEl.style.fontSize = `${rem}px`

  console.log(`[Rem] 基准值设置为: ${rem}px (屏幕: ${clientWidth}px)`)
}

/**
 * 初始化 Rem 适配
 */
export function initRem(designWidth = 750) {
  // 初始设置
  setRemBase(designWidth)

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    setRemBase(designWidth)
  })

  // 监听页面显示事件（处理 iOS Safari 后台切换）
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      setRemBase(designWidth)
    }
  })
}
```

#### 44.2.3 PostCSS 自动转换 px 为 rem

```bash
# 安装插件
npm install -D postcss-pxtorem
```

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5,  // 根元素基准值 (750 / 20)
      unitPrecision: 3,  // 转换后保留的小数位数
      propList: [
        '*',  // 所有属性都转换
        '!border*',  // 边框不转换
        '!font-size'  // 字体不转换
      ],
      selectorBlackList: [],  // 不转换的选择器
      replace: true,
      mediaQuery: false,  // 媒体查询中的 px 不转换
      minPixelValue: 2,  // 小于 2px 的不转换
      exclude: /node_modules/i  // 排除 node_modules
    }
  }
}
```

```vue
<!-- 使用示例：直接写 px，自动转为 rem -->
<template>
  <div class="container">
    <!-- 编写时写 375px，自动转为 10rem -->
    <div class="box"></div>
  </div>
</template>

<style scoped>
.box {
  width: 375px;      /* 转换为: 10rem */
  height: 200px;     /* 转换为: 5.33rem */
  margin: 20px;      /* 转换为: 0.53rem */
  border: 1px solid #ddd;  /* 保持 1px */
  font-size: 16px;   /* 保持 16px */
}
</style>
```

---

### 44.3 响应式设计最佳实践

#### 44.3.1 媒体查询断点设计

```scss
// src/styles/variables.scss

// 响应式断点
$breakpoints: (
  'xs': 320px,   // 超小屏幕（手机竖屏）
  'sm': 375px,   // 小屏幕（iPhone）
  'md': 768px,   // 中等屏幕（平板竖屏）
  'lg': 1024px,  // 大屏幕（平板横屏）
  'xl': 1280px,  // 超大屏幕（桌面）
  '2xl': 1536px  // 2K 屏幕
);

// Mixin: 响应式断点
@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  } @else {
    @warn "断点 `#{$breakpoint}` 不存在于 `$breakpoints` 中";
  }
}

// Mixin: 最大宽度响应式
@mixin respond-below($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (max-width: map-get($breakpoints, $breakpoint) - 1px) {
      @content;
    }
  }
}

// Mixin: 仅在移动设备
@mixin mobile-only {
  @media (max-width: 767px) {
    @content;
  }
}

// Mixin: 仅在桌面设备
@mixin desktop-only {
  @media (min-width: 768px) {
    @content;
  }
}
```

#### 44.3.2 响应式网格布局

```vue
<!-- components/ResponsiveGrid.vue -->
<template>
  <div class="responsive-grid" :class="`cols-${columns}`">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => ({
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  })
})
</script>

<style scoped lang="scss">
.responsive-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(var(--cols, 1fr), 1fr);

  // 移动优先策略
  --cols: 1;

  @media (min-width: 375px) {
    --cols: var(--cols-sm, 2);
  }

  @media (min-width: 768px) {
    --cols: var(--cols-md, 3);
  }

  @media (min-width: 1024px) {
    --cols: var(--cols-lg, 4);
  }

  @media (min-width: 1280px) {
    --cols: var(--cols-xl, 5);
  }
}
</style>
```

#### 44.3.3 响应式容器

```vue
<!-- components/ResponsiveContainer.vue -->
<template>
  <div class="responsive-container">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.responsive-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 16px;

  // 响应式最大宽度
  @include mobile-only {
    max-width: 100%;
  }

  @include respond-to('md') {
    padding: 0 24px;
  }

  @include respond-to('lg') {
    max-width: 960px;
  }

  @include respond-to('xl') {
    max-width: 1140px;
  }

  @include respond-to('2xl') {
    max-width: 1320px;
    padding: 0 32px;
  }
}
</style>
```

#### 44.3.4 响应式图片

```vue
<!-- components/ResponsiveImage.vue -->
<template>
  <picture class="responsive-image">
    <!-- WebP 格式（优先） -->
    <source
      v-if="webpSrc"
      :srcset="`${webpSrc}?w=400 400w, ${webpSrc}?w=800 800w, ${webpSrc}?w=1200 1200w`"
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      type="image/webp"
    />

    <!-- 传统格式 -->
    <img
      :src="defaultSrc"
      :srcset="`${defaultSrc}?w=400 400w, ${defaultSrc}?w=800 800w, ${defaultSrc}?w=1200 1200w`"
      :sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      :alt="alt"
      :loading="lazy"
      @error="handleError"
    />
  </picture>
</template>

<script setup lang="ts">
interface Props {
  src: string
  webpSrc?: string
  alt: string
}

const props = defineProps<Props>()

const defaultSrc = computed(() => props.src)
const webpSrc = computed(() => props.webpSrc || props.src.replace(/\.(jpg|png)$/, '.webp'))

function handleError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder.jpg'  // 失败时显示占位图
}
</script>

<style scoped>
.responsive-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
}
</style>
```

---

### 44.4 触摸事件与手势

#### 44.4.1 基础触摸事件

```vue
<!-- components/TouchButton.vue -->
<template>
  <button
    class="touch-button"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
    :class="{ active: isActive }"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isActive = ref(false)
const touchStartTime = ref(0)
const touchStartX = ref(0)
const touchStartY = ref(0)

function handleTouchStart(e: TouchEvent) {
  isActive.value = true
  touchStartTime.value = Date.now()

  const touch = e.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY

  // 提供触觉反馈（如果支持）
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

function handleTouchMove(e: TouchEvent) {
  const touch = e.touches[0]
  const deltaX = Math.abs(touch.clientX - touchStartX.value)
  const deltaY = Math.abs(touch.clientY - touchStartY.value)

  // 如果移动超过 10px，取消激活状态
  if (deltaX > 10 || deltaY > 10) {
    isActive.value = false
  }
}

function handleTouchEnd(e: TouchEvent) {
  const touchDuration = Date.now() - touchStartTime.value

  // 点击持续时间 < 300ms 视为点击
  if (touchDuration < 300 && isActive.value) {
    emit('click', e)
  }

  isActive.value = false
}

function handleTouchCancel() {
  isActive.value = false
}

const emit = defineEmits<{
  click: [event: TouchEvent]
}>()
</script>

<style scoped>
.touch-button {
  position: relative;
  padding: 16px 32px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.3s;
}

.touch-button.active {
  transform: scale(0.95);
  opacity: 0.8;
}

/* 移除移动端点击高亮 */
.touch-button {
  -webkit-tap-highlight-color: transparent;
}
</style>
```

#### 44.4.2 手势识别（滑动、长按、双击）

```typescript
// src/composables/useGesture.ts
interface GestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onLongPress?: () => void
  onDoubleTap?: () => void
  swipeThreshold?: number
  longPressDelay?: number
}

export function useGesture(options: GestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    onDoubleTap,
    swipeThreshold = 50,
    longPressDelay = 500
  } = options

  let touchStartX = 0
  let touchStartY = 0
  let touchStartTime = 0
  let longPressTimer: number | null = null
  let lastTapTime = 0

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    touchStartX = touch.clientX
    touchStartY = touch.clientY
    touchStartTime = Date.now()

    // 长按检测
    longPressTimer = window.setTimeout(() => {
      onLongPress?.()
    }, longPressDelay)
  }

  function handleTouchMove(e: TouchEvent) {
    // 取消长按
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
    }

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartX
    const deltaY = touch.clientY - touchStartY
    const deltaTime = Date.now() - touchStartTime

    // 检测双击
    if (deltaTime < 300) {
      if (Date.now() - lastTapTime < 300) {
        onDoubleTap?.()
        lastTapTime = 0
        return
      }
      lastTapTime = Date.now()
    }

    // 检测滑动
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      }
    } else {
      // 垂直滑动
      if (Math.abs(deltaY) > swipeThreshold) {
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
    }
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }
}
```

#### 44.4.3 使用手势组件

```vue
<!-- components/SwipeContainer.vue -->
<template>
  <div
    class="swipe-container"
    v-bind="gestureHandlers"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useGesture } from '@/composables/useGesture'

const emit = defineEmits<{
  swipeLeft: []
  swipeRight: []
  swipeUp: []
  swipeDown: []
  longPress: []
  doubleTap: []
}>()

const gestureHandlers = useGesture({
  onSwipeLeft: () => emit('swipeLeft'),
  onSwipeRight: () => emit('swipeRight'),
  onSwipeUp: () => emit('swipeUp'),
  onSwipeDown: () => emit('swipeDown'),
  onLongPress: () => emit('longPress'),
  onDoubleTap: () => emit('doubleTap')
})
</script>

<style scoped>
.swipe-container {
  position: relative;
  overflow: hidden;
}
</style>
```

```vue
<!-- 使用示例 -->
<template>
  <SwipeContainer
    @swipe-left="handleSwipeLeft"
    @swipe-right="handleSwipeRight"
    @long-press="handleLongPress"
  >
    <div class="card">
      滑动或长按我
    </div>
  </SwipeContainer>
</template>
```

---

### 44.5 移动端性能优化

#### 44.5.1 图片懒加载

```vue
<!-- components/LazyImage.vue -->
<template>
  <div class="lazy-image" :style="{ aspectRatio }">
    <img
      v-if="loaded"
      :src="src"
      :alt="alt"
      @load="handleLoad"
      @error="handleError"
    />
    <div v-else class="placeholder">
      <slot name="placeholder">
        <div class="skeleton"></div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string
  alt: string
  aspectRatio?: string
}

const props = defineProps<Props>()
const loaded = ref(false)
const error = ref(false)

onMounted(() => {
  // 使用 Intersection Observer 检测图片进入视口
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 创建 Image 对象预加载
        const img = new Image()
        img.onload = () => {
          loaded.value = true
        }
        img.onerror = () => {
          error.value = true
        }
        img.src = props.src
        observer.disconnect()
      }
    })
  }, {
    rootMargin: '50px'  // 提前 50px 加载
  })

  // 观察占位元素
  const placeholder = document.querySelector('.placeholder')
  if (placeholder) {
    observer.observe(placeholder)
  }

  onUnmounted(() => {
    observer.disconnect()
  })
})

function handleLoad() {
  loaded.value = true
}

function handleError() {
  error.value = true
}
</script>

<style scoped>
.lazy-image {
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
}

.skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
```

#### 44.5.2 虚拟滚动（长列表优化）

```vue
<!-- components/VirtualList.vue -->
<template>
  <div
    ref="containerRef"
    class="virtual-list"
    @scroll="handleScroll"
  >
    <div class="virtual-list-spacer" :style="{ height: `${totalHeight}px` }">
      <div
        class="virtual-list-content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="item in visibleItems"
          :key="item.key"
          class="virtual-list-item"
          :style="{ height: `${itemHeight}px` }"
        >
          <slot :item="item.data" :index="item.index" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  items: any[]
  itemHeight: number
  containerHeight: number
  bufferSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  bufferSize: 5
})

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

// 计算总高度
const totalHeight = computed(() => props.items.length * props.itemHeight)

// 计算可见区域起始索引
const startIndex = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize)
})

// 计算可见区域结束索引
const endIndex = computed(() => {
  const visibleCount = Math.ceil(props.containerHeight / props.itemHeight)
  return Math.min(
    props.items.length,
    startIndex.value + visibleCount + props.bufferSize * 2
  )
})

// 计算偏移量
const offsetY = computed(() => startIndex.value * props.itemHeight)

// 可见项目
const visibleItems = computed(() => {
  const items = []
  for (let i = startIndex.value; i < endIndex.value; i++) {
    items.push({
      index: i,
      key: i,
      data: props.items[i]
    })
  }
  return items
})

function handleScroll(e: Event) {
  scrollTop.value = (e.target as HTMLElement).scrollTop
}
</script>

<style scoped>
.virtual-list {
  height: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;  // iOS 平滑滚动
}

.virtual-list-item {
  box-sizing: border-box;
}
</style>
```

#### 44.5.3 防抖节流优化

```typescript
// src/utils/performance.ts

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timer: number | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)

    timer = window.setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param limit 限制时间（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true

      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * RequestAnimationFrame 节流
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  let ticking = false

  return function (this: any, ...args: Parameters<T>) {
    if (!ticking) {
      requestAnimationFrame(() => {
        fn.apply(this, args)
        ticking = false
      })
      ticking = true
    }
  }
}
```

---

### 44.6 移动端实战案例

#### 44.6.1 移动端首页

```vue
<!-- pages/mobile/Home.vue -->
<template>
  <div class="mobile-home">
    <!-- 顶部导航栏 -->
    <header class="home-header">
      <div class="search-bar">
        <input type="search" placeholder="搜索" />
      </div>
      <button class="scan-btn">扫一扫</button>
    </header>

    <!-- 轮播图 -->
    <Swiper class="banner-swiper" :autoplay="3000" :pagination="true">
      <SwiperSlide v-for="i in 3" :key="i">
        <div class="banner-item" :style="{ background: colors[i - 1] }">
          Banner {{ i }}
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 分类导航 -->
    <nav class="category-nav">
      <div v-for="item in categories" :key="item.id" class="category-item">
        <div class="icon" :style="{ background: item.color }">
          {{ item.icon }}
        </div>
        <span class="name">{{ item.name }}</span>
      </div>
    </nav>

    <!-- 商品列表（虚拟滚动） -->
    <VirtualList
      :items="products"
      :item-height="120"
      :container-height="600"
    >
      <template #default="{ item }">
        <ProductCard :product="item" />
      </template>
    </VirtualList>

    <!-- 底部导航栏 -->
    <TabBar :active="0" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import VirtualList from '@/components/VirtualList.vue'
import ProductCard from '@/components/ProductCard.vue'
import TabBar from '@/components/TabBar.vue'

const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1']

const categories = [
  { id: 1, name: '数码', icon: '📱', color: '#ff6b6b' },
  { id: 2, name: '服装', icon: '👕', color: '#4ecdc4' },
  { id: 3, name: '食品', icon: '🍔', color: '#45b7d1' },
  { id: 4, name: '图书', icon: '📚', color: '#f7b731' },
  { id: 5, name: '美妆', icon: '💄', color: '#5f27cd' }
]

const products = ref(Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  title: `商品 ${i + 1}`,
  price: Math.floor(Math.random() * 1000),
  image: `/products/${i + 1}.jpg`
})))
</script>

<style scoped lang="scss">
.mobile-home {
  min-height: 100vh;
  padding-bottom: 60px;  // 底部导航高度
  background: #f5f5f5;
}

.home-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-bar {
  flex: 1;

  input {
    width: 100%;
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 20px;
    background: #f5f5f5;
    font-size: 14px;
  }
}

.banner-swiper {
  height: 180px;
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
}

.banner-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  font-size: 24px;
}

.category-nav {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  background: white;
  margin-bottom: 16px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.category-item .icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
}

.category-item .name {
  font-size: 12px;
  color: #666;
}
</style>
```

#### 44.6.2 移动端商品详情页

```vue
<!-- pages/mobile/ProductDetail.vue -->
<template>
  <div class="product-detail">
    <!-- 顶部导航 -->
    <header class="detail-header">
      <button @click="goBack" class="back-btn">←</button>
      <div class="actions">
        <button>分享</button>
        <button>收藏</button>
      </div>
    </header>

    <!-- 商品图片（支持手势） -->
    <SwipeContainer @swipe-left="nextImage" @swipe-right="prevImage">
      <div class="product-images">
        <img
          :src="currentImage"
          :alt="product.title"
          @touchstart="handleZoomStart"
          @touchmove="handleZoomMove"
          @touchend="handleZoomEnd"
        />
        <div class="image-indicator">
          {{ currentImageIndex + 1 }} / {{ product.images.length }}
        </div>
      </div>
    </SwipeContainer>

    <!-- 商品信息 -->
    <section class="product-info">
      <h1 class="title">{{ product.title }}</h1>
      <div class="price-row">
        <span class="price">¥{{ product.price }}</span>
        <span class="original-price">¥{{ product.originalPrice }}</span>
        <span class="sales">{{ product.sales }}人付款</span>
      </div>
    </section>

    <!-- 规格选择 -->
    <section class="specs-section">
      <h3>规格</h3>
      <div class="spec-options">
        <button
          v-for="spec in specs"
          :key="spec.id"
          :class="{ active: selectedSpec === spec.id }"
          @click="selectSpec(spec.id)"
        >
          {{ spec.name }}
        </button>
      </div>
    </section>

    <!-- 商品详情（图片懒加载） -->
    <section class="product-desc">
      <h3>商品详情</h3>
      <LazyImage
        v-for="img in detailImages"
        :key="img"
        :src="img"
        alt="商品详情"
      />
    </section>

    <!-- 底部操作栏 -->
    <footer class="detail-footer">
      <div class="footer-icons">
        <button>店铺</button>
        <button>客服</button>
        <button>购物车</button>
      </div>
      <div class="footer-actions">
        <button class="add-cart">加入购物车</button>
        <button class="buy-now">立即购买</button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SwipeContainer from '@/components/SwipeContainer.vue'
import LazyImage from '@/components/LazyImage.vue'

const router = useRouter()

const product = ref({
  id: 1,
  title: '精选商品',
  price: 299,
  originalPrice: 599,
  sales: 10000,
  images: [
    '/products/1-1.jpg',
    '/products/1-2.jpg',
    '/products/1-3.jpg',
    '/products/1-4.jpg'
  ]
})

const currentImageIndex = ref(0)
const currentImage = computed(() => product.value.images[currentImageIndex.value])
const selectedSpec = ref(1)

const specs = [
  { id: 1, name: '默认' },
  { id: 2, name: '红色' },
  { id: 3, name: '蓝色' }
]

const detailImages = [
  '/detail/1.jpg',
  '/detail/2.jpg',
  '/detail/3.jpg'
]

function goBack() {
  router.back()
}

function nextImage() {
  currentImageIndex.value = (currentImageIndex.value + 1) % product.value.images.length
}

function prevImage() {
  currentImageIndex.value = (currentImageIndex.value - 1 + product.value.images.length) % product.value.images.length
}

function selectSpec(id: number) {
  selectedSpec.value = id
}

// 图片缩放
let zoomLevel = 1
let lastDistance = 0

function handleZoomStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    lastDistance = getDistance(e.touches[0], e.touches[1])
  }
}

function handleZoomMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    const distance = getDistance(e.touches[0], e.touches[1])
    const scale = distance / lastDistance
    zoomLevel = Math.min(Math.max(1, scale), 3)
    e.preventDefault()
  }
}

function handleZoomEnd() {
  zoomLevel = 1
}

function getDistance(touch1: Touch, touch2: Touch) {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}
</script>

<style scoped lang="scss">
.product-detail {
  padding-bottom: 60px;
  background: #f5f5f5;
}

.detail-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.back-btn {
  font-size: 24px;
  padding: 8px;
}

.product-images {
  position: relative;
  width: 100%;
  height: 375px;
  background: white;
}

.product-images img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-indicator {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 12px;
  font-size: 12px;
}

.product-info,
.specs-section,
.product-desc {
  margin: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  line-height: 1.4;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 12px;
}

.price {
  font-size: 24px;
  color: #ff6b6b;
  font-weight: bold;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.sales {
  margin-left: auto;
  font-size: 12px;
  color: #999;
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.spec-options button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.spec-options button.active {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.detail-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.footer-icons {
  display: flex;
  gap: 24px;
  margin-right: auto;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.footer-actions button {
  padding: 10px 24px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
}

.add-cart {
  background: #ffa502;
  color: white;
}

.buy-now {
  background: #ff6b6b;
  color: white;
}
</style>
```

---

### 44.7 本章小结

| 内容 | 核心技术 |
|------|----------|
| **Viewport 配置** | meta viewport、适配刘海屏 |
| **Rem 适配** | 动态计算、postcss-pxtorem |
| **响应式设计** | 媒体查询、断点系统、Grid 布局 |
| **触摸事件** | touchstart/move/end、手势识别 |
| **性能优化** | 图片懒加载、虚拟滚动、防抖节流 |

---
