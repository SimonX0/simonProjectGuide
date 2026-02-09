# 实战项目5：基于MicroApp的企业级微电商平台

> **项目难度**：⭐⭐⭐⭐⭐
> **预计时间**：80-100小时
> **技术栈**：Vue 3 | MicroApp | TypeScript | Vite | PNPM | Monorepo

## 项目概述

基于**京东开源的MicroApp微前端框架**，构建一个大型企业级电商平台，实现多个子应用的无缝集成，提供高性能、易维护的微前端解决方案。

### 为什么选择MicroApp？

```
🚀 来自京东：京东零售团队生产实践
⚡ 高性能：比qiankun快40%+，内存占用更低
🎦 零侵入：子应用无需任何修改即可接入
📦 轻量级：核心库仅约20KB，gzip后6KB
🔄 框架无关：完美支持Vue2/3、React、Angular等
🎨 WebComponents：基于Web Components思想实现
🔐 完整沙箱：JS沙箱 + 样式隔离
💼 企业级：京东、美团等大厂生产验证
```

### 核心功能

```
🏪 主应用（基座应用）
   ├── 首页应用（流量入口）
   ├── 商品应用（商品展示、搜索）
   ├── 购物车应用（购物车管理）
   ├── 订单应用（订单管理）
   ├── 用户应用（用户中心）
   ├── 营销应用（优惠券、活动）
   └── 支付应用（支付收银台）

🎯 核心能力
   ├── 应用管理：动态注册、加载、卸载
   ├── 路由管理：主子应用路由协同
   ├── 状态共享：全局状态管理
   ├── 通信机制：主子应用通信
   ├── 样式隔离：ShadowDOM隔离
   ├── 预加载：智能预加载策略
   └── 性能监控：应用性能监控
```

### 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    主应用 (Main App - 基座)                   │
│                    Vue 3 + MicroApp                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                      公共布局                           │ │
│  │  ├── TopBar (搜索框、登录、消息)                       │ │
│  │  ├── NavBar (导航菜单、分类)                           │ │
│  │  ├── SideBar (个人中心、快捷入口)                      │ │
│  │  └── Content (子应用容器区域)                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  全局服务                                                   │
│  ├── 全局状态 (Pinia + 通信)                               │
│  ├── 用户认证 (单点登录)                                   │
│  ├── 权限管理 (RBAC)                                       │
│  ├── 消息通知 (EventBus)                                   │
│  └── 性能监控 (Metrics)                                    │
└───────────────┬──────────────────────────────────────────────┘
                │
    ┌───────────┼───────────┬─────────────┬──────────────┐
    │           │           │             │              │
┌───▼───┐  ┌───▼───┐  ┌───▼────┐  ┌─────▼────┐  ┌─────▼────┐
│首页   │  │商品   │  │购物车  │  │订单     │  │用户中心  │
│子应用 │  │子应用 │  │子应用  │  │子应用   │  │子应用    │
│Vue3   │  │Vue3   │  │Vue3    │  │Vue3     │  │Vue3      │
└───────┘  └───────┘  └────────┘  └──────────┘  └──────────┘

技术栈对比：
┌─────────────┬──────────────┬──────────────┐
│  MicroApp   │    qiankun   │   single-spa │
├─────────────┼──────────────┼──────────────┤
│  京东开源   │   阿里开源   │   社区项目   │
│  WebComponents │ HTML Entry │ JS Entry    │
│  更简单     │   中等复杂   │   较复杂     │
│  性能更好   │   性能良好   │   性能一般   │
│  ~20KB      │   ~50KB      │   ~30KB      │
└─────────────┴──────────────┴──────────────┘
```

---

## 项目架构设计

### 1. 项目结构

```bash
microapp-ecommerce-platform/
├── main-app/                      # 主应用（基座）
│   ├── src/
│   │   ├── micro/                # MicroApp配置
│   │   │   ├── apps.ts          # 子应用配置
│   │   │   ├── lifecycle.ts     # 生命周期管理
│   │   │   ├── communication.ts # 通信机制
│   │   │   └── prefetch.ts      # 预加载策略
│   │   │
│   │   ├── components/           # 公共组件
│   │   │   ├── TopBar/          # 顶部栏
│   │   │   ├── NavBar/          # 导航栏
│   │   │   ├── SideBar/         # 侧边栏
│   │   │   └── SearchBar/       # 搜索框
│   │   │
│   │   ├── layouts/              # 布局组件
│   │   │   ├── MainLayout.vue
│   │   │   └── BlankLayout.vue
│   │   │
│   │   ├── router/               # 主应用路由
│   │   ├── stores/               # 状态管理
│   │   │   ├── user.ts
│   │   │   ├── cart.ts
│   │   │   └── app.ts
│   │   │
│   │   ├── composables/          # 组合式函数
│   │   │   ├── useMicroApp.ts
│   │   │   └── useGlobalData.ts
│   │   │
│   │   ├── api/                  # API接口
│   │   ├── utils/                # 工具函数
│   │   ├── styles/               # 全局样式
│   │   └── main.ts
│   │
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── sub-apps/                      # 子应用
│   ├── home-app/                 # 首页应用
│   │   ├── src/
│   │   │   ├── views/
│   │   │   ├── components/
│   │   │   ├── router/
│   │   │   ├── stores/
│   │   │   └── main.ts
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── product-app/              # 商品应用
│   │   ├── src/
│   │   │   ├── views/
│   │   │   │   ├── ProductList.vue      # 商品列表
│   │   │   │   ├── ProductDetail.vue    # 商品详情
│   │   │   │   └── ProductSearch.vue    # 商品搜索
│   │   │   ├── components/
│   │   │   │   ├── ProductCard.vue
│   │   │   │   ├── ProductFilter.vue
│   │   │   │   └── ProductSort.vue
│   │   │   └── main.ts
│   │   └── vite.config.ts
│   │
│   ├── cart-app/                 # 购物车应用
│   │   ├── src/
│   │   │   ├── views/
│   │   │   │   ├── CartList.vue
│   │   │   │   └── Checkout.vue
│   │   │   └── main.ts
│   │   └── vite.config.ts
│   │
│   ├── order-app/                # 订单应用
│   │   ├── src/
│   │   │   ├── views/
│   │   │   │   ├── OrderList.vue
│   │   │   │   ├── OrderDetail.vue
│   │   │   │   └── OrderCreate.vue
│   │   │   └── main.ts
│   │   └── vite.config.ts
│   │
│   ├── user-app/                 # 用户中心应用
│   │   ├── src/
│   │   │   ├── views/
│   │   │   │   ├── UserProfile.vue
│   │   │   │   ├── UserOrders.vue
│   │   │   │   └── UserSettings.vue
│   │   │   └── main.ts
│   │   └── vite.config.ts
│   │
│   └── marketing-app/            # 营销应用
│       ├── src/
│       │   ├── views/
│       │   │   ├── CouponList.vue
│       │   │   └── ActivityList.vue
│       │   └── main.ts
│       └── vite.config.ts
│
├── shared/                        # 共享模块
│   ├── components/               # 共享组件库
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Form/
│   │   ├── Table/
│   │   └── Modal/
│   │
│   ├── composables/              # 共享组合函数
│   ├── utils/                    # 共享工具
│   ├── types/                    # 共享类型定义
│   ├── constants/                # 共享常量
│   └── styles/                   # 共享样式
│
├── packages/                      # Monorepo包管理
│   ├── eslint-config/
│   ├── prettier-config/
│   ├── ts-config/
│   └── tailwind-config/
│
├── pnpm-workspace.yaml           # PNPM工作区配置
├── package.json
├── .npmrc
└── README.md
```

### 2. 技术选型

| 分类 | 技术选型 | 说明 |
|------|---------|------|
| **微前端框架** | MicroApp | 京东开源，高性能 |
| **主应用框架** | Vue 3.4+ | Composition API |
| **构建工具** | Vite 5.x | 快速构建 |
| **包管理** | PNPM | Monorepo支持 |
| **语言** | TypeScript 5.x | 类型安全 |
| **状态管理** | Pinia | Vue 3官方 |
| **路由** | Vue Router 4.x | 路由管理 |
| **UI框架** | Element Plus | 主应用 |
| **HTTP** | Axios | 请求封装 |
| **通信** | MicroApp数据中心 | 通信机制 |
| **样式** | SCSS + Tailwind | 样式方案 |

---

## 核心功能实现

### 1. 主应用配置（基座应用）

**安装MicroApp**

```bash
# 主应用安装
cd main-app
pnpm add @micro-zoe/micro-app

# 子应用无需安装任何依赖！
```

**子应用配置**

```typescript
// main-app/src/micro/apps.ts
import { defineConfig } from '@micro-zoe/micro-app/types'

interface MicroAppConfig {
  name: string;
  url: string;
  baseroute: string;
  iframe?: boolean;
  keepAlive?: boolean;
  shadowDOM?: boolean;
  inline?: boolean;
}

// 子应用配置列表
export const microApps: MicroAppConfig[] = [
  {
    name: 'home',          // 应用名称
    url: process.env.VITE_HOME_URL || 'http://localhost:3001',
    baseroute: '/home',    // 基础路由
    keepAlive: true,       // 保活
    shadowDOM: true,       // 开启影子DOM隔离
  },
  {
    name: 'product',
    url: process.env.VITE_PRODUCT_URL || 'http://localhost:3002',
    baseroute: '/product',
    keepAlive: true,
    shadowDOM: true,
  },
  {
    name: 'cart',
    url: process.env.VITE_CART_URL || 'http://localhost:3003',
    baseroute: '/cart',
    keepAlive: true,       // 购物车需要保活
    shadowDOM: true,
  },
  {
    name: 'order',
    url: process.env.VITE_ORDER_URL || 'http://localhost:3004',
    baseroute: '/order',
    keepAlive: false,
    shadowDOM: true,
  },
  {
    name: 'user',
    url: process.env.VITE_USER_URL || 'http://localhost:3005',
    baseroute: '/user',
    keepAlive: true,
    shadowDOM: true,
  },
  {
    name: 'marketing',
    url: process.env.VITE_MARKETING_URL || 'http://localhost:3006',
    baseroute: '/marketing',
    keepAlive: true,
    shadowDOM: true,
  },
];

// 根据路由获取应用配置
export function getAppByPath(path: string): MicroAppConfig | undefined {
  return microApps.find(app => path.startsWith(app.baseroute));
}

// 根据名称获取应用配置
export function getAppByName(name: string): MicroAppConfig | undefined {
  return microApps.find(app => app.name === name);
}
```

**主应用入口**

```vue
<!-- main-app/src/App.vue -->
<template>
  <div id="main-app" class="main-app">
    <!-- 公共头部 -->
    <TopBar />

    <!-- 导航栏 -->
    <NavBar />

    <div class="main-container">
      <!-- 侧边栏 -->
      <SideBar />

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 主应用路由 -->
        <router-view v-if="!isMicroAppRoute" />

        <!-- 子应用容器 -->
        <div v-show="isMicroAppRoute" class="micro-app-container">
          <!-- 首页应用 -->
          <micro-app
            v-if="currentApp === 'home'"
            name="home"
            :url="apps.home.url"
            :baseroute="apps.home.baseroute"
            :keep-alive="apps.home.keepAlive"
            :shadowDOM="apps.home.shadowDOM"
            @created="handleAppCreated"
            @mounted="handleAppMounted"
            @unmount="handleAppUnmount"
          />

          <!-- 商品应用 -->
          <micro-app
            v-else-if="currentApp === 'product'"
            name="product"
            :url="apps.product.url"
            :baseroute="apps.product.baseroute"
            :keep-alive="apps.product.keepAlive"
            :shadowDOM="apps.product.shadowDOM"
            @datachange="handleDataChange"
          />

          <!-- 购物车应用 -->
          <micro-app
            v-else-if="currentApp === 'cart'"
            name="cart"
            :url="apps.cart.url"
            :baseroute="apps.cart.baseroute"
            :keep-alive="apps.cart.keepAlive"
            :shadowDOM="apps.cart.shadowDOM"
            :data="cartData"
          />

          <!-- 订单应用 -->
          <micro-app
            v-else-if="currentApp === 'order'"
            name="order"
            :url="apps.order.url"
            :baseroute="apps.order.baseroute"
            :shadowDOM="apps.order.shadowDOM"
          />

          <!-- 用户应用 -->
          <micro-app
            v-else-if="currentApp === 'user'"
            name="user"
            :url="apps.user.url"
            :baseroute="apps.user.baseroute"
            :keep-alive="apps.user.keepAlive"
            :shadowDOM="apps.user.shadowDOM"
          />

          <!-- 营销应用 -->
          <micro-app
            v-else-if="currentApp === 'marketing'"
            name="marketing"
            :url="apps.marketing.url"
            :baseroute="apps.marketing.baseroute"
            :keep-alive="apps.marketing.keepAlive"
            :shadowDOM="apps.marketing.shadowDOM"
          />
        </div>
      </div>
    </div>

    <!-- 公共底部 -->
    <FooterBar />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { microApps, getAppByPath } from './micro/apps';
import TopBar from './components/TopBar.vue';
import NavBar from './components/NavBar.vue';
import SideBar from './components/SideBar.vue';
import FooterBar from './components/FooterBar.vue';

const route = useRoute();
const apps = ref({
  home: microApps[0],
  product: microApps[1],
  cart: microApps[2],
  order: microApps[3],
  user: microApps[4],
  marketing: microApps[5],
});

// 判断当前是否为子应用路由
const isMicroAppRoute = computed(() => {
  const app = getAppByPath(route.path);
  return !!app;
});

// 获取当前激活的应用名称
const currentApp = computed(() => {
  const app = getAppByPath(route.path);
  return app?.name || '';
});

// 购物车数据（向子应用传递）
const cartData = computed(() => {
  return {
    itemCount: cartStore.itemCount,
    totalAmount: cartStore.totalAmount,
  };
});

// 生命周期事件处理
function handleAppCreated(e: CustomEvent) {
  console.log('子应用创建完成:', e.detail.appName);
}

function handleAppMounted(e: CustomEvent) {
  console.log('子应用挂载完成:', e.detail.appName);
  // 发送用户信息给子应用
  sendUserInfoToSubApp(e.detail.appName);
}

function handleAppUnmount(e: CustomEvent) {
  console.log('子应用卸载完成:', e.detail.appName);
}

// 数据变化事件（子应用向主应用发送数据）
function handleDataChange(e: CustomEvent) {
  console.log('收到子应用数据:', e.detail);
  const { data } = e.detail;

  // 处理购物车更新
  if (data.type === 'cart_update') {
    cartStore.updateCart(data.payload);
  }

  // 处理用户信息更新
  if (data.type === 'user_update') {
    userStore.updateUser(data.payload);
  }
}

// 向子应用发送用户信息
function sendUserInfoToSubApp(appName: string) {
  const microAppElement = document.querySelector(`micro-app[name="${appName}"]`);
  if (microAppElement) {
    microAppElement.dispatchEvent(new CustomEvent('user-info', {
      detail: {
        user: userStore.userInfo,
        token: userStore.token,
      },
    }));
  }
}

onMounted(() => {
  // 初始化MicroApp全局配置
  microApp.start({
    // 全局样式隔离
    shadowDOM: true,

    // 生命周期钩子
    lifeCycles: {
      created(e) {
        console.log('应用已创建:', e.detail.name);
      },
      mounted(e) {
        console.log('应用已挂载:', e.detail.name);
      },
      unmount(e) {
        console.log('应用已卸载:', e.detail.name);
      },
    },

    // 预加载策略
    preFetchApps: [
      { name: 'home', path: '/home' },
      { name: 'product', path: '/product' },
    ],

    // 错误处理
    errorHandler(e) {
      console.error('子应用错误:', e);
    },
  });
});
</script>

<style scoped lang="scss">
.main-app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.content-area {
  flex: 1;
  overflow: auto;
}

.micro-app-container {
  width: 100%;
  height: 100%;

  micro-app {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
```

### 2. MicroApp全局配置

```typescript
// main-app/src/micro/index.ts
import microApp from '@micro-zoe/micro-app';

// MicroApp全局配置
export function initMicroApp() {
  microApp.start({
    // 是否开启shadowDOM
    shadowDOM: true,

    // 是否开启自定义样式
    inline: false,

    // 生命周期钩子
    lifeCycles: {
      created(e: CustomEvent) {
        console.log('%c [MicroApp] 子应用创建', 'color: #42b983', e.detail);
      },
      mounted(e: CustomEvent) {
        console.log('%c [MicroApp] 子应用挂载', 'color: #42b983', e.detail);
        // 通知主应用更新标题
        document.title = `${e.detail.title} - 电商平台`;
      },
      unmount(e: CustomEvent) {
        console.log('%c [MicroApp] 子应用卸载', 'color: #f56c6c', e.detail);
      },
      error(e: CustomEvent) {
        console.error('%c [MicroApp] 子应用错误', 'color: #f56c6c', e.detail);
      },
    },

    // 全局数据监听
    globalAssets: {
      // 全局CSS
      css: [],
      // 全局JS
      js: [],
    },

    // 插件系统
    plugins: {
      // 数据中心插件（用于主子应用通信）
      globalData: {
        setData: (data: any) => {
          console.log('设置全局数据:', data);
        },
        getData: () => {
          return {};
        },
      },
    },

    // 预加载策略
    preFetchApps: (appNameList: string[]) => {
      // 根据用户行为预测要加载的应用
      return appNameList.filter(name => ['home', 'product'].includes(name));
    },

    // 自定义渲染
    customFetch: (url: string, options: RequestInit) => {
      // 添加认证token
      const token = localStorage.getItem('token');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return window.fetch(url, options);
    },
  });
}
```

### 3. 主子应用通信

**主应用提供数据**

```typescript
// main-app/src/micro/communication.ts
import microApp from '@micro-zoe/micro-app';

// 主应用向子应用发送数据
export function sendDataToSubApp(appName: string, data: any) {
  const appElement = document.querySelector(`micro-app[name="${appName}"]`) as any;

  if (appElement) {
    // 使用MicroApp的数据通信机制
    appElement.dispatchEvent(new CustomEvent('main-data', {
      detail: data,
    }));

    // 或者使用microApp的全局数据中心
    microApp.setData(appName, data);
  }
}

// 监听子应用发送的数据
export function listenToSubApp(appName: string, callback: (data: any) => void) {
  const appElement = document.querySelector(`micro-app[name="${appName}"]`) as any;

  if (appElement) {
    appElement.addEventListener('data-change', (e: CustomEvent) => {
      callback(e.detail);
    });
  }
}

// 设置全局数据（所有子应用都可访问）
export function setGlobalData(key: string, value: any) {
  microApp.setGlobalData({ [key]: value });
}

// 获取全局数据
export function getGlobalData(key: string) {
  return microApp.getGlobalData(key);
}
```

**子应用接收数据**

```typescript
// sub-apps/product-app/src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

let app: any;

// 监听主应用传递的数据
if (window.__MICRO_APP_ENVIRONMENT__) {
  // MicroApp环境
  window.addEventListener('main-data', (event: any) => {
    console.log('收到主应用数据:', event.detail);
    const { user, token, cart } = event.detail;

    // 保存到本地存储或状态管理
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem('token', token);
    }
  });

  // 获取全局数据
  window.microApp.addDataListener((data: any) => {
    console.log('收到全局数据变化:', data);
  });
}

export async function bootstrap() {
  console.log('ProductApp bootstrap');
}

export async function mount() {
  console.log('ProductApp mount');

  app = createApp(App);
  app.use(router);
  app.mount('#app');
}

export async function unmount() {
  console.log('ProductApp unmount');
  app?.unmount();
}

// 独立运行环境
if (!window.__MICRO_APP_ENVIRONMENT__) {
  mount();
}
```

**子应用向主应用发送数据**

```typescript
// sub-apps/cart-app/src/views/CartList.vue
<script setup lang="ts">
import { onMounted } from 'vue';

// 向主应用发送购物车更新
function updateCart() {
  if (window.__MICRO_APP_ENVIRONMENT__) {
    // 方式1：通过dispatchEvent
    window.dispatchEvent(new CustomEvent('cart-update', {
      detail: {
        type: 'cart_update',
        payload: {
          itemCount: 5,
          totalAmount: 299.99,
        }
      }
    }));

    // 方式2：通过microApp全局数据
    window.microApp.dispatch({
      type: 'cart_update',
      payload: {
        itemCount: 5,
        totalAmount: 299.99,
      }
    });
  }
}

onMounted(() => {
  // 获取主应用传递的用户信息
  window.microApp.addDataListener((data: any) => {
    console.log('主应用数据变化:', data);
    if (data.user) {
      // 更新用户信息
    }
    if (data.cart) {
      // 更新购物车
    }
  });
});
</script>
```

### 4. 子应用配置

**子应用入口（零侵入！）**

```typescript
// sub-apps/product-app/src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import App from './App.vue';
import router from './router';

let app: any;

// MicroApp会自动调用这些生命周期
export async function bootstrap() {
  console.log('[ProductApp] bootstrap');
}

export async function mount() {
  console.log('[ProductApp] mount');

  app = createApp(App);

  app.use(createPinia());
  app.use(router);
  app.use(ElementPlus);

  app.mount('#app'); // 注意：MicroApp要求子应用必须挂载到#app
}

export async function unmount() {
  console.log('[ProductApp] unmount');
  app?.unmount();
}

// 独立运行环境（开发时使用）
if (!window.__MICRO_APP_ENVIRONMENT__) {
  mount();
}
```

**子应用路由配置**

```typescript
// sub-apps/product-app/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  // MicroApp环境使用baseroute，独立环境使用根路径
  history: createWebHistory(
    window.__MICRO_APP_ENVIRONMENT__
      ? '/product'  // 必须与主应用配置的baseroute一致
      : '/'
  ),
  routes: [
    {
      path: '/',
      redirect: '/list',
    },
    {
      path: '/list',
      name: 'ProductList',
      component: () => import('../views/ProductList.vue'),
      meta: { title: '商品列表' },
    },
    {
      path: '/detail/:id',
      name: 'ProductDetail',
      component: () => import('../views/ProductDetail.vue'),
      meta: { title: '商品详情' },
    },
    {
      path: '/search',
      name: 'ProductSearch',
      component: () => import('../views/ProductSearch.vue'),
      meta: { title: '商品搜索' },
    },
  ],
});

router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    // MicroApp会自动更新主应用标题
    document.title = `${to.meta.title} - 电商平台`;
  }
  next();
});

export default router;
```

**子应用Vite配置**

```typescript
// sub-apps/product-app/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 3002,
    cors: true, // 必须开启跨域
    origin: 'http://localhost:3000', // 主应用地址
  },

  build: {
    // MicroApp推荐使用lib模式
    lib: {
      entry: './src/main.ts',
      name: 'ProductApp',
      formats: ['es', 'umd'],
      fileName: 'product-app',
    },

    rollupOptions: {
      // 外部化Vue相关依赖
      external: ['vue', 'vue-router', 'pinia', 'element-plus'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'element-plus': 'ElementPlus',
        },
      },
    },
  },

  optimizeDeps: {
    exclude: ['product-app'],
  },
});
```

### 5. 性能优化

**预加载策略**

```typescript
// main-app/src/micro/prefetch.ts
import microApp from '@micro-zoe/micro-app';

// 智能预加载
export function initPrefetchStrategy() {
  // 监听用户行为，预测可能访问的子应用
  let prefetchTimer: any;

  document.addEventListener('mousemove', (e) => {
    clearTimeout(prefetchTimer);

    prefetchTimer = setTimeout(() => {
      const target = e.target as HTMLElement;

      // 鼠标悬停在导航链接上时预加载
      if (target.tagName === 'A' && target.getAttribute('href')) {
        const href = target.getAttribute('href') || '';
        const appName = getAppNameFromPath(href);

        if (appName) {
          prefetchApp(appName);
        }
      }
    }, 300);
  });
}

// 根据路径获取应用名称
function getAppNameFromPath(path: string): string | null {
  const appMap: Record<string, string> = {
    '/home': 'home',
    '/product': 'product',
    '/cart': 'cart',
  };

  for (const [key, value] of Object.entries(appMap)) {
    if (path.startsWith(key)) {
      return value;
    }
  }

  return null;
}

// 预加载应用
export function prefetchApp(appName: string) {
  console.log('预加载应用:', appName);
  // MicroApp会自动处理预加载
  microApp.preFetch({
    name: appName,
  });
}
```

**应用缓存**

```typescript
// main-app/src/micro/cache.ts
const appCache = new Map<string, any>();

export const cacheManager = {
  // 缓存应用数据
  set(appName: string, key: string, value: any) {
    if (!appCache.has(appName)) {
      appCache.set(appName, new Map());
    }
    appCache.get(appName).set(key, value);
  },

  // 获取缓存数据
  get(appName: string, key: string) {
    return appCache.get(appName)?.get(key);
  },

  // 清除应用缓存
  clear(appName: string) {
    appCache.delete(appName);
  },

  // 清除所有缓存
  clearAll() {
    appCache.clear();
  },
};
```

### 6. 样式隔离方案

**MicroApp提供3种样式隔离**

```vue
<!-- 方式1：ShadowDOM隔离（推荐） -->
<template>
  <micro-app
    name="product"
    url="http://localhost:3002"
    :shadowDOM="true"
  />
</template>

<!-- 方式2：作用域样式 -->
<template>
  <micro-app
    name="product"
    url="http://localhost:3002"
    :shadowDOM="false"
    scopecss="true"
  />
</template>

<!-- 方式3：无隔离（不推荐） -->
<template>
  <micro-app
    name="product"
    url="http://localhost:3002"
    :shadowDOM="false"
  />
</template>
```

**子应用样式处理**

```scss
// 子应用中的样式会自动被隔离
// 无需任何特殊处理！

.product-list {
  padding: 20px;

  h1 {
    color: #333;
  }
}
```

---

## 部署指南

### 1. 开发环境

```bash
# 克隆项目
git clone https://github.com/yourorg/microapp-ecommerce.git
cd microapp-ecommerce

# 安装依赖
pnpm install

# 启动所有应用（并发）
pnpm dev

# 或单独启动
pnpm dev:main      # 主应用 :3000
pnpm dev:home      # 首页应用 :3001
pnpm dev:product   # 商品应用 :3002
pnpm dev:cart      # 购物车 :3003
pnpm dev:order     # 订单应用 :3004
pnpm dev:user      # 用户应用 :3005
pnpm dev:marketing # 营销应用 :3006
```

### 2. 生产构建

```bash
# 构建所有应用
pnpm build

# 构建单个应用
pnpm build:main
pnpm build:product
```

### 3. Nginx配置

```nginx
# /etc/nginx/conf.d/microapp-ecommerce.conf
server {
    listen 80;
    server_name app.example.com;

    # 主应用
    location / {
        root /var/www/main-app;
        try_files $uri $uri/ /index.html;
    }

    # 首页应用
    location /home {
        root /var/www/sub-apps/home-app;
        try_files $uri $uri/ /index.html;
    }

    # 商品应用
    location /product {
        root /var/www/sub-apps/product-app;
        try_files $uri $uri/ /index.html;
    }

    # 购物车应用
    location /cart {
        root /var/www/sub-apps/cart-app;
        try_files $uri $uri/ /index.html;
    }

    # 订单应用
    location /order {
        root /var/www/sub-apps/order-app;
        try_files $uri $uri/ /index.html;
    }

    # 用户应用
    location /user {
        root /var/www/sub-apps/user-app;
        try_files $uri $uri/ /index.html;
    }

    # 营销应用
    location /marketing {
        root /var/www/sub-apps/marketing-app;
        try_files $uri $uri/ /index.html;
    }

    # 启用gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存配置
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. Docker部署

```dockerfile
# Dockerfile (主应用)
FROM node:18-alpine as builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@8
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## MicroApp vs qiankun 实战对比

| 场景 | MicroApp | qiankun |
|------|----------|---------|
| **子应用接入** | ✅ 零侵入，无需修改 | ⚠️ 需要修改生命周期 |
| **接入时间** | ✅ 5分钟 | ⚠️ 30分钟 |
| **样式隔离** | ✅ ShadowDOM自动隔离 | ✅ scoped样式 |
| **JS沙箱** | ✅ 完整沙箱 | ✅ Proxy沙箱 |
| **性能** | ✅ 快40%+ | ⚠️ 正常 |
| **内存占用** | ✅ 更低 | ⚠️ 较高 |
| **学习曲线** | ✅ 更简单 | ⚠️ 相对复杂 |
| **文档质量** | ✅ 中文文档完善 | ✅ 文档完善 |
| **社区活跃** | ✅ 京东维护 | ✅ 阿里维护 |

---

## 学习成果

完成本项目后，你将掌握：

✅ **MicroApp框架**
- 零侵入子应用接入
- ShadowDOM样式隔离
- 完整的JS沙箱机制
- 高性能渲染

✅ **微前端架构**
- 主子应用设计
- 通信机制实现
- 状态共享方案
- 生命周期管理

✅ **电商平台实战**
- 多应用协同
- 购物车跨应用同步
- 订单流程实现
- 用户中心管理

✅ **性能优化**
- 智能预加载
- 应用缓存策略
- 资源懒加载
- 渲染性能优化

✅ **工程化实践**
- Monorepo管理
- TypeScript配置
- CI/CD流程
- Docker容器化

---

## 扩展练习

- [ ] 实现子应用热更新
- [ ] 添加应用版本管理
- [ ] 实现灰度发布
- [ ] 添加性能监控
- [ ] 实现子应用降级

---

## MicroApp资源

- **官方文档**：https://micro-zoe.github.io/micro-app/
- **GitHub**：https://github.com/micro-zoe/micro-app
- **京东实践**：https://mp.weixin.qq.com/s/xxx
- **对比分析**：MicroApp vs qiankun性能测试

---

**项目难度**：⭐⭐⭐⭐⭐
**预计时间**：80-100小时
**适合人群**：有Vue3基础，想学习京东MicroApp微前端框架
