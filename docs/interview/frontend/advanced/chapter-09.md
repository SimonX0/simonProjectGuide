---
title: 移动端/H5面试题
---

# 移动端/H5面试题

## 响应式设计

### Media Queries？

```css
/* 基础断点 */
/* 移动设备 */
@media (max-width: 768px) {
  .container {
    width: 100%;
    padding: 0 16px;
  }
}

/* 平板设备 */
@media (min-width: 769px) and (max-width: 1024px) {
  .container {
    width: 750px;
    margin: 0 auto;
  }
}

/* 桌面设备 */
@media (min-width: 1025px) {
  .container {
    width: 1200px;
    margin: 0 auto;
  }
}

/* 响应式字体 */
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
}

@media (min-width: 769px) {
  html {
    font-size: 16px;
  }
}

/* 隐藏元素 */
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
}

@media (min-width: 769px) {
  .mobile-only {
    display: none;
  }
}
```

### Container Queries？

```css
/* Container Queries（CSS容器查询） */
.container {
  container-type: inline-size;
  container-name: sidebar;
}

/* 根据容器宽度调整 */
@container sidebar (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@container sidebar (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}

/* 实际应用 */
<article class="post">
  <div class="card">
    <h2>Card Title</h2>
    <p>Card content...</p>
  </div>
</article>

<style>
.post {
  container-type: inline-size;
}

@container (min-width: 500px) {
  .card {
    padding: 2rem;
  }
}

@container (max-width: 499px) {
  .card {
    padding: 1rem;
  }
}
</style>
```

## 移动端适配方案

### rem适配？

```javascript
// 方案1：动态设置根字体大小
// utils/rem.js
function setRemUnit() {
  const docEl = document.documentElement;
  // 设计稿宽度（如750px）
  const designWidth = 750;
  // 计算比例
  const ratio = docEl.clientWidth / designWidth;
  // 设置根字体大小（基准值100px）
  docEl.style.fontSize = (100 * ratio) + 'px';
}

// 初始化
setRemUnit();

// 监听窗口变化
window.addEventListener('resize', setRemUnit);
window.addEventListener('orientationchange', setRemUnit);

// 方案2：使用lib-flexible
import 'lib-flexible/flexible';

// 方案3：使用postcss-pxtorem自动转换
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 100, // 根字体大小
      propList: ['*'], // 转换所有属性
      selectorBlackList: [], // 不转换的选择器
      replace: true,
      mediaQuery: false,
      minPixelValue: 0 // 最小转换值
    }
  }
};

// 使用示例
<style>
/* 编写时使用px */
.header {
  height: 88px; /* 自动转换为rem */
  font-size: 32px; /* 自动转换为rem */
}
</style>
```

### vw/vh适配？

```css
/* vw/vh适配 */
/* 1vw = 1% viewport width */
/* 1vh = 1% viewport height */

/* 使用vw单位 */
.container {
  width: 100vw;
  height: 100vh;
  font-size: 4vw; /* 随视口宽度缩放 */
}

/* postcss-px-to-viewport配置 */
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      unitToConvert: 'px',
      viewportWidth: 750, // 设计稿宽度
      unitPrecision: 5,
      propList: ['*'],
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      selectorBlackList: ['.ignore', '.hairlines'],
      minPixelValue: 1,
      mediaQuery: false
    }
  }
};
```

### 动态Scale方案？

```javascript
// 动态缩放方案
function setScale() {
  const designWidth = 750;
  const designHeight = 1334;
  const docEl = document.documentElement;
  const clientWidth = docEl.clientWidth;
  const clientHeight = docEl.clientHeight;

  const scaleX = clientWidth / designWidth;
  const scaleY = clientHeight / designHeight;
  const scale = Math.min(scaleX, scaleY);

  document.body.style.transform = `scale(${scale})`;
  document.body.style.transformOrigin = 'left top';
  document.body.style.width = `${designWidth}px`;
  document.body.style.height = `${designHeight}px`;
}

setScale();
window.addEventListener('resize', setScale);
```

## 1px边框问题

### 如何解决1px边框？

```css
/* 方案1：使用transform缩放 */
.border-1px {
  position: relative;
}

.border-1px::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: #000;
  transform: scaleY(0.5);
  transform-origin: 0 0;
}

/* 方案2：使用box-shadow */
.border-1px {
  box-shadow: 0 0.5px 0 #000;
}

/* 方案3：使用background-image */
.border-1px {
  background-image: linear-gradient(to bottom, #000 50%, transparent 50%);
  background-size: 100% 1px;
  background-repeat: no-repeat;
  background-position: bottom;
}

/* 方案4：使用viewport单位 */
.border-1px {
  border-bottom: 1px solid #000;
}

@media (-webkit-min-device-pixel-ratio: 2) {
  .border-1px {
    border-bottom: 0.5px solid #000;
  }
}

/* Vue组件封装 */
<script setup>
import { computed } from 'vue';

const props = defineProps({
  direction: {
    type: String,
    default: 'bottom'
  }
});

const borderStyle = computed(() => {
  return `border-${props.direction}`;
});
</script>

<template>
  <div :class="['hairline', borderStyle]">
    <slot />
  </div>
</template>

<style scoped>
.hairline {
  position: relative;
}

.hairline::after {
  content: '';
  position: absolute;
  background: #000;
  transform: scaleY(0.5);
  transform-origin: 0 0;
}

.hairline.bottom::after {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
}

.hairline.top::after {
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
}

.hairline.left::after {
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
}

.hairline.right::after {
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
}
</style>
```

## 安全区域适配

### 刘海屏适配？

```css
/* 方案1：使用safe-area-inset */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* 方案2：使用constant（iOS 11.0-11.2）和env（iOS 11.2+） */
.full-screen {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 方案3：使用CSS变量 */
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
}

.header {
  height: calc(44px + var(--safe-area-inset-top));
  padding-top: var(--safe-area-inset-top);
}

/* 方案4：使用viewport-fit-cover */
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

/* Vue示例 */
<script setup>
import { computed, onMounted, ref } from 'vue';

const safeAreaTop = ref(0);
const safeAreaBottom = ref(0);

onMounted(() => {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.left = '0';
  div.style.top = '0';
  div.style.width = '100%';
  div.style.height = '100%';
  div.style.paddingTop = 'env(safe-area-inset-top)';
  div.style.paddingBottom = 'env(safe-area-inset-bottom)';
  div.style.pointerEvents = 'none';
  div.style.visibility = 'hidden';

  document.body.appendChild(div);

  setTimeout(() => {
    safeAreaTop.value = parseInt(
      getComputedStyle(div).paddingTop
    );
    safeAreaBottom.value = parseInt(
      getComputedStyle(div).paddingBottom
    );

    document.body.removeChild(div);
  }, 100);
});
</script>

<template>
  <div
    class="header"
    :style="{ paddingTop: safeAreaTop + 'px' }"
  >
    Header
  </div>
</template>
```

## 触摸事件优化

### Touch事件？

```javascript
// 基础触摸事件
<template>
  <div
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
    class="touch-area"
  >
    Touch me
  </div>
</template>

<script setup>
function handleTouchStart(e) {
  // e.touches：当前屏幕上的所有触摸点
  // e.targetTouches：当前元素上的所有触摸点
  // e.changedTouches：发生变化的触摸点

  const touch = e.touches[0];
  console.log('Touch start:', {
    x: touch.clientX,
    y: touch.clientY,
    identifier: touch.identifier
  });
}

function handleTouchMove(e) {
  e.preventDefault(); // 防止滚动

  const touch = e.touches[0];
  console.log('Touch move:', {
    x: touch.clientX,
    y: touch.clientY
  });
}

function handleTouchEnd(e) {
  const touch = e.changedTouches[0];
  console.log('Touch end:', {
    x: touch.clientX,
    y: touch.clientY
  });
}

function handleTouchCancel(e) {
  console.log('Touch canceled');
}
</script>

// 手势识别
class GestureDetector {
  constructor(element) {
    this.element = element;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.isSwipe = false;
  }

  init() {
    this.element.addEventListener('touchstart', this.handleStart);
    this.element.addEventListener('touchmove', this.handleMove);
    this.element.addEventListener('touchend', this.handleEnd);
  }

  handleStart = (e) => {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
    this.isSwipe = false;
  };

  handleMove = (e) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;

    // 判断是否滑动
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      this.isSwipe = true;
    }
  };

  handleEnd = (e) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const deltaTime = Date.now() - this.startTime;

    if (!this.isSwipe) {
      // 点击
      this.onClick();
    } else {
      // 滑动
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (deltaX > 0) {
          this.onSwipeRight();
        } else {
          this.onSwipeLeft();
        }
      } else {
        // 垂直滑动
        if (deltaY > 0) {
          this.onSwipeDown();
        } else {
          this.onSwipeUp();
        }
      }
    }
  };

  onClick() {
    console.log('Click');
    this.element.dispatchEvent(new Event('tap'));
  }

  onSwipeLeft() {
    console.log('Swipe left');
    this.element.dispatchEvent(new Event('swipeleft'));
  }

  onSwipeRight() {
    console.log('Swipe right');
    this.element.dispatchEvent(new Event('swiperight'));
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.handleStart);
    this.element.removeEventListener('touchmove', this.handleMove);
    this.element.removeEventListener('touchend', this.handleEnd);
  }
}

// 使用
const detector = new GestureDetector(element);
detector.init();
```

### 300ms延迟问题？

```javascript
// 方案1：使用fastclick库
import FastClick from 'fastclick';

if ('addEventListener' in document) {
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      FastClick.attach(document.body);
    },
    false
  );
}

// 方案2：使用touch-action
.style {
  touch-action: manipulation; /* 禁用双击缩放 */
}

// 方案3：禁用缩放
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

// 方案4：手动处理
let lastTouchTime = 0;

function handleClick() {
  const now = Date.now();
  if (now - lastTouchTime < 300) {
    return;
  }
  lastTouchTime = now;
  // 处理点击
}
```

## PWA基础

### Service Worker？

```javascript
// service-worker.js
const CACHE_NAME = 'v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png'
];

// 安装
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// 激活
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中
        if (response) {
          return response;
        }

        // 缓存未命中，发起网络请求
        return fetch(event.request).then((response) => {
          // 检查是否为有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// 主线程注册
// main.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
```

### Manifest配置？

```json
{
  "name": "My PWA App",
  "short_name": "PWA App",
  "description": "A progressive web app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007AFF",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

```html
<!-- index.html -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#007AFF">

<!-- iOS支持 -->
<link rel="apple-touch-icon" href="/icons/icon-152x152.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
```

## 移动端性能优化

### 图片懒加载？

```vue
<template>
  <img
    v-lazy="imageUrl"
    :alt="alt"
  />
</template>

<script setup>
// 自定义lazy指令
const vLazy = {
  mounted(el, binding) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = binding.value;
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px' // 提前50px加载
      }
    );

    observer.observe(el);
  }
};
</script>

// 或使用vue-lazyload
import VueLazyload from 'vue-lazyload';

app.use(VueLazyload, {
  lazyComponent: true,
  loading: '/images/loading.gif',
  error: '/images/error.png',
  attempt: 1
});
```

### 节流滚动？

```javascript
import { useThrottleFn } from '@vueuse/core';

const handleScroll = useThrottleFn(() => {
  const scrollTop = window.pageYOffset;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 100) {
    loadMore();
  }
}, 200);

window.addEventListener('scroll', handleScroll);
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
