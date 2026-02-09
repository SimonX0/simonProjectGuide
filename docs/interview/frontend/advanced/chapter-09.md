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

## 移动端调试与兼容性

### 移动端调试方案？（字节、阿里必问）

```javascript
// 1. vconsole调试工具
// 安装：npm install vconsole
import VConsole from 'vconsole';

const vConsole = new VConsole();
// 在移动端显示调试面板

// 2. eruda调试工具
// 安装：npm install eruda
import eruda from 'eruda';

eruda.init();
// 提供更完整的调试功能

// 3. Chrome DevTools远程调试
// 1) 手机USB连接电脑
// 2) 手机开启开发者模式 + USB调试
// 3) Chrome输入 chrome://inspect
// 4) 选择设备进行调试

// 4. 抓包调试
// Charles / Fiddler
// 1) 设置代理
// 2) 安装HTTPS证书
// 3) 查看网络请求

// 5. spy-debugger（无线调试）
// npm install spy-debugger -g
// spy-debugger
// 扫码即可调试

// 6. weinre远程调试
// npm install weinre -g
// weinre --httpPort 8080 --boundHost -all-
// 在HTML中引入：<script src="http://localhost:8080/target/target-script-min.js#anonymous"></script>

// 7. Vue DevTools移动端
import { createApp } from 'vue'
import VueDevTools from '@vue/devtools'

const app = createApp(App)
if (process.env.NODE_ENV === 'development') {
  app.use(VueDevTools)
}
```

### 移动端常见兼容性问题？（字节真题）

```javascript
// 1. iOS滚动卡顿
// 解决方案：
.scroll-container {
  -webkit-overflow-scrolling: touch; /* 启用硬件加速 */
  overflow-y: scroll;
}

// 2. Android点击高亮
// 移除点击高亮背景
* {
  -webkit-tap-highlight-color: transparent;
}

// 3. iOS禁止缩放
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

// 4. iOS输入框阴影
input {
  -webkit-appearance: none; /* 移除iOS默认样式 */
}

// 5. iOS圆角问题
* {
  -webkit-border-radius: 0; /* 统一圆角样式 */
}

// 6. Android字体渲染问题
body {
  -webkit-font-smoothing: antialiased; /* 字体抗锯齿 */
  -moz-osx-font-smoothing: grayscale;
}

// 7. 视频自动播放问题
// iOS需要muted属性才能自动播放
<video autoplay muted playsinline></video>

// 8. 日期格式兼容问题
// iOS不支持"YYYY-MM-DD"格式
// ❌ 错误
new Date('2024-01-01')

// ✅ 正确
new Date('2024/01/01')
// 或
new Date('2024-01-01T00:00:00')

// 9. fixed定位在iOS上的问题
// iOS Safari在键盘弹出时fixed定位会失效
// 解决方案：使用absolute + scroll

// 10. 默认字体大小限制
// Chrome最小字体12px
body {
  /* 使用transform缩放 */
  font-size: 10px;
  transform: scale(0.833);
}

// 或使用viewport单位
.small-text {
  font-size: 2.5vw;
}
```

### 移动端性能优化方案？（美团高频）

```javascript
// 1. 首屏加载优化
// 图片懒加载
<img loading="lazy" src="image.jpg" />

// 预加载关键资源
<link rel="preload" href="critical.css" as="style">
<link rel="prefetch" href="next-page.js">

// 2. 渲染性能优化
// 使用CSS3硬件加速
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

// 避免重排重绘
// ❌ 不好
element.style.width = '100px'
element.style.height = '100px'
element.style.background = 'red'

// ✅ 好
element.style.cssText = 'width: 100px; height: 100px; background: red;'

// 3. 事件优化
// 使用事件委托
document.addEventListener('click', (e) => {
  if (e.target.matches('.button')) {
    handleClick(e)
  }
})

// 防抖节流
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn(search, 300)
const throttledScroll = useThrottleFn(handleScroll, 200)

// 4. 动画性能优化
// 使用transform代替top/left
.animated {
  /* ❌ 不好：触发重排 */
  left: 100px;

  /* ✅ 好：使用transform */
  transform: translateX(100px);
}

// 使用requestAnimationFrame
function animate() {
  element.style.transform = `translateX(${pos}px)`
  requestAnimationFrame(animate)
}

// 5. 内存优化
// 及时清理事件监听
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 使用对象池复用
class ObjectPool {
  constructor(createFn, resetFn) {
    this.pool = []
    this.createFn = createFn
    this.resetFn = resetFn
  }

  get() {
    return this.pool.length > 0
      ? this.pool.pop()
      : this.createFn()
  }

  release(obj) {
    this.resetFn(obj)
    this.pool.push(obj)
  }
}
```

## H5与原生交互

### H5唤起APP方案？（美团必问）

```javascript
// 1. URL Scheme方式
// 配置APP的URL Scheme
// android: <data android:scheme="myapp" android:host="open" />
// ios: URL types

// 唤起APP
function openApp() {
  const scheme = 'myapp://home?id=123'

  // 尝试打开APP
  window.location.href = scheme

  // 2秒后跳转下载页（假设未安装APP）
  setTimeout(() => {
    window.location.href = 'https://app.example.com/download'
  }, 2000)
}

// 2. Universal Link（iOS）
// iOS 9+支持，无需唤醒中转
// 配置：https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/UniversalLinks.html

// 使用
<a href="https://app.example.com/product/123">打开商品详情</a>

// 3. App Links（Android）
// Android 6.0+支持
// 配置：assetlinks.json

// 4. webkit-callout（iOS专用）
<iframe style="display:none" height="0" width="0" frameborder="0"
  src="myapp://product?id=123">
</iframe>

// 完整封装
class AppLauncher {
  constructor(options) {
    this.scheme = options.scheme
    this.universalLink = options.universalLink
    this.downloadUrl = options.downloadUrl
    this.timeout = options.timeout || 2500
  }

  launch(params) {
    const ua = navigator.userAgent
    const isiOS = /iPhone|iPad|iPod/.test(ua)
    const isAndroid = /Android/.test(ua)

    // 构建跳转链接
    let url = isiOS
      ? `${this.universalLink}?${new URLSearchParams(params)}`
      : `${this.scheme}://?${new URLSearchParams(params)}`

    // 记录开始时间
    const startTime = Date.now()

    // 尝试唤起
    window.location.href = url

    // 检测是否唤起成功
    const checkTimer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const isHidden = document.hidden || document.webkitHidden

      if (isHidden || elapsed >= this.timeout) {
        clearInterval(checkTimer)

        // 未唤起成功，跳转下载页
        if (!isHidden && elapsed >= this.timeout) {
          window.location.href = this.downloadUrl
        }
      }
    }, 100)
  }
}

// 使用
const launcher = new AppLauncher({
  scheme: 'myapp://',
  universalLink: 'https://app.example.com',
  downloadUrl: 'https://app.example.com/download'
})

launcher.launch({ id: '123', from: 'h5' })
```

### JSBridge通信机制？（字节、阿里必问）

```javascript
// 1. 拦截URL Schema（JavaScript调用Native）
// H5端
function callNative(method, params, callback) {
  const callbackId = 'callback_' + Date.now()

  // 注册回调
  window[callbackId] = function(result) {
    callback(result)
    delete window[callbackId]
  }

  // 构建URL
  const url = `jsbridge://method?method=${method}&params=${JSON.stringify(params)}&callbackId=${callbackId}`

  // 创建隐藏iframe唤起
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  document.body.appendChild(iframe)

  setTimeout(() => {
    document.body.removeChild(iframe)
  }, 100)
}

// 使用
callNative('getUserInfo', { userId: '123' }, (result) => {
  console.log('UserInfo:', result)
})

// 2. 注入JavaScript上下文（Native调用JavaScript）
// Native端注入方法
window.jsbridge = {
  callback: function(result) {
    console.log('Native callback:', result)
  }
}

// H5调用
window.jsbridge.callback({ status: 'success' })

// 3. WebView modern API
// prompt方式（早期Android）
function callNativeByPrompt(method, params) {
  const message = JSON.stringify({ method, params })
  const result = prompt(message)
  return JSON.parse(result)
}

// 4. 完整JSBridge封装
class JSBridge {
  constructor() {
    this.messageQueue = []
    this.messageHandlers = {}
    this.uniqueId = 0
    this.isNativeReady = false

    this.init()
  }

  init() {
    // 监听Native消息
    document.addEventListener('WebViewBridge', (event) => {
      const { responseId, responseData } = event.detail
      const handler = this.messageHandlers[responseId]

      if (handler) {
        handler(responseData)
        delete this.messageHandlers[responseId]
      }
    })

    // 通知Native准备好了
    this.sendMessage('jsBridgeReady', {}, () => {
      this.isNativeReady = true
      this.flushMessageQueue()
    })
  }

  sendMessage(method, data, callback) {
    const messageId = 'msg_' + (++this.uniqueId)

    if (callback) {
      this.messageHandlers[messageId] = callback
    }

    const message = {
      messageId,
      method,
      data
    }

    // 如果Native未准备好，加入队列
    if (!this.isNativeReady) {
      this.messageQueue.push(message)
      return
    }

    this._sendToNative(message)
  }

  _sendToNative(message) {
    // 根据环境选择通信方式
    if (window.webkit?.messageHandlers?.Bridge) {
      // iOS WKWebView
      window.webkit.messageHandlers.Bridge.postMessage(message)
    } else if (window.JSBridge && window.JSBridge.sendMessage) {
      // Android WebView
      window.JSBridge.sendMessage(JSON.stringify(message))
    } else {
      // 后备方案：iframe
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = `jsbridge://message?data=${encodeURIComponent(JSON.stringify(message))}`
      document.body.appendChild(iframe)
      setTimeout(() => document.body.removeChild(iframe), 100)
    }
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this._sendToNative(message)
    }
  }
}

// 使用
const bridge = new JSBridge()

bridge.sendMessage('getUserInfo', { userId: '123' }, (result) => {
  console.log('UserInfo:', result)
})
```

### 键盘弹出问题解决方案？（阿里高频）

```javascript
// 问题：iOS键盘弹出时fixed定位元素会错位

// 解决方案1：监听键盘事件
<template>
  <div
    class="fixed-bottom"
    :style="{ bottom: bottomOffset + 'px' }"
  >
    底部操作栏
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const bottomOffset = ref(0)

const handleKeyboardShow = (e) => {
  // 获取键盘高度
  const keyboardHeight = e.detail ? e.detail.height : 300
  bottomOffset.value = keyboardHeight
}

const handleKeyboardHide = () => {
  bottomOffset.value = 0
}

onMounted(() => {
  // iOS
  window.addEventListener('keyboardWillShow', handleKeyboardShow)
  window.addEventListener('keyboardWillHide', handleKeyboardHide)

  // Android
  window.addEventListener('resize', () => {
    const height = window.innerHeight
    const initialHeight = window.screen.height
    if (height < initialHeight) {
      bottomOffset.value = initialHeight - height
    } else {
      bottomOffset.value = 0
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keyboardWillShow', handleKeyboardShow)
  window.removeEventListener('keyboardWillHide', handleKeyboardHide)
})
</script>

// 解决方案2：使用absolute + scroll
.container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

// 解决方案3：使用scrollIntoView
<input
  @focus="scrollToInput"
  type="text"
/>

function scrollToInput(e) {
  setTimeout(() => {
    e.target.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }, 300)
}

// 解决方案4：使用视觉视口
const handleResize = () => {
  const visualViewport = window.visualViewport
  if (visualViewport) {
    bottomOffset.value = window.innerHeight - visualViewport.height
  }
}

onMounted(() => {
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize)
  }
})
```

## 移动端高级技巧

### 移动端手势库封装？（美团真题）

```javascript
// 完整的手势识别库
class TouchGesture {
  constructor(element, options = {}) {
    this.element = element
    this.options = {
      tapTimeout: 300,
      swipeThreshold: 30,
      longPressTimeout: 750,
      pinchThreshold: 10,
      ...options
    }

    this.touches = []
    this.startTouch = null
    this.startTime = 0
    this.lastTouch = null
    this.longPressTimer = null
    this.tapCount = 0
    this.lastTapTime = 0
    this.initialDistance = 0

    this.init()
  }

  init() {
    this.element.addEventListener('touchstart', this.handleStart, { passive: false })
    this.element.addEventListener('touchmove', this.handleMove, { passive: false })
    this.element.addEventListener('touchend', this.handleEnd, { passive: false })
    this.element.addEventListener('touchcancel', this.handleCancel, { passive: false })
  }

  handleStart = (e) => {
    e.preventDefault()

    this.touches = Array.from(e.touches)
    this.startTouch = this.touches[0]
    this.startTime = Date.now()
    this.lastTouch = this.startTouch

    // 单指：可能是tap、long press、swipe
    if (this.touches.length === 1) {
      this.longPressTimer = setTimeout(() => {
        this.emit('longpress', {
          touch: this.startTouch
        })
        this.longPressTimer = null
      }, this.options.longPressTimeout)
    }

    // 双指：可能是pinch
    if (this.touches.length === 2) {
      this.initialDistance = this.getDistance()
      this.emit('pinchstart', {
        distance: this.initialDistance,
        center: this.getCenter()
      })
    }

    this.emit('touchstart', {
      touches: this.touches
    })
  }

  handleMove = (e) => {
    e.preventDefault()

    // 清除long press
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }

    this.touches = Array.from(e.touches)
    const currentTouch = this.touches[0]

    // 计算移动距离
    const deltaX = currentTouch.clientX - this.startTouch.clientX
    const deltaY = currentTouch.clientY - this.startTouch.clientY
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)

    this.emit('touchmove', {
      touches: this.touches,
      deltaX,
      deltaY,
      distance
    })

    // 双指pinch
    if (this.touches.length === 2) {
      const currentDistance = this.getDistance()
      const scale = currentDistance / this.initialDistance

      this.emit('pinch', {
        distance: currentDistance,
        scale: scale,
        center: this.getCenter()
      })
    }
  }

  handleEnd = (e) => {
    e.preventDefault()

    // 清除long press
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }

    const touch = e.changedTouches[0]
    const deltaTime = Date.now() - this.startTime

    const deltaX = touch.clientX - this.startTouch.clientX
    const deltaY = touch.clientY - this.startTouch.clientY
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)

    // 判断手势类型
    if (distance < 10 && deltaTime < this.options.tapTimeout) {
      // tap
      const now = Date.now()
      if (now - this.lastTapTime < 300) {
        this.tapCount++
      } else {
        this.tapCount = 1
      }
      this.lastTapTime = now

      this.emit('tap', {
        touch: touch,
        count: this.tapCount
      })

      if (this.tapCount === 2) {
        this.emit('doubletap', {
          touch: touch
        })
      }
    } else if (distance >= this.options.swipeThreshold) {
      // swipe
      const direction = this.getDirection(deltaX, deltaY)
      this.emit('swipe', {
        touch: touch,
        direction: direction,
        deltaX: deltaX,
        deltaY: deltaY
      })
      this.emit('swipe' + direction, {
        touch: touch,
        deltaX: deltaX,
        deltaY: deltaY
      })
    }

    this.emit('touchend', {
      changedTouches: Array.from(e.changedTouches)
    })
  }

  handleCancel = (e) => {
    this.emit('touchcancel', {
      touches: Array.from(e.touches)
    })
  }

  getDistance() {
    const touch1 = this.touches[0]
    const touch2 = this.touches[1]
    return Math.sqrt(
      (touch1.clientX - touch2.clientX) ** 2 +
      (touch1.clientY - touch2.clientY) ** 2
    )
  }

  getCenter() {
    const touch1 = this.touches[0]
    const touch2 = this.touches[1]
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }

  getDirection(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }

  emit(event, data) {
    const customEvent = new CustomEvent(event, { detail: data })
    this.element.dispatchEvent(customEvent)
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.handleStart)
    this.element.removeEventListener('touchmove', this.handleMove)
    this.element.removeEventListener('touchend', this.handleEnd)
    this.element.removeEventListener('touchcancel', this.handleCancel)
  }
}

// 使用
const gesture = new TouchGesture(element)

element.addEventListener('swipeleft', (e) => {
  console.log('Swiped left!')
})

element.addEventListener('pinch', (e) => {
  console.log('Pinch scale:', e.detail.scale)
})

element.addEventListener('longpress', (e) => {
  console.log('Long pressed!')
})
```

### 移动端适配方案对比与选择？（腾讯高频）

```javascript
// 各方案对比：

// 1. rem方案
/* 优点：
 * - 兼容性好，支持所有设备
 * - 可以精确控制尺寸
 * 缺点：
 * - 需要计算或使用postcss转换
 * - 字体可能不够清晰
 */
function setRemUnit() {
  const docEl = document.documentElement
  const designWidth = 750
  docEl.style.fontSize = (docEl.clientWidth / designWidth * 100) + 'px'
}

// 2. vw/vh方案
/* 优点：
 * - 无需JS计算
 * - 真正响应式
 * 缺点：
 * - 兼容性问题（老版本浏览器）
 * - 极端尺寸下体验不佳
 */
.container {
  width: 100vw;
  height: 100vh;
}

// 3. 动态Scale方案
/* 优点：
 * - 设计稿1:1还原
 * - 无需转换计算
 * 缺点：
 * - 可能导致模糊
 * - 横竖屏切换体验不佳
 */
function setScale() {
  const designWidth = 750
  const scale = document.documentElement.clientWidth / designWidth
  document.body.style.transform = `scale(${scale})`
}

// 推荐方案：rem + viewport结合
// 基础样式使用rem
.content {
  width: 7rem; // 设计稿700px
  padding: 0.3rem; // 设计稿30px
}

// 特殊需求使用viewport
.full-screen {
  width: 100vw;
  height: 100vh;
}

// Vite配置自动转换
// vite.config.js
import { defineConfig } from 'vite'
import pxtorem from 'postcss-pxtorem'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        pxtorem({
          rootValue: 100, // 设计稿宽度的1/10
          propList: ['*'],
          exclude: /node_modules/i
        })
      ]
    }
  }
})
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
