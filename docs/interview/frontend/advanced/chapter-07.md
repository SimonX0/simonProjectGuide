---
title: 架构设计面试题
---

# 架构设计面试题

## 设计模式

### 常用的设计模式有哪些？

**1. 单例模式**：

确保一个类只有一个实例。

```javascript
class Store {
  static instance = null;

  constructor() {
    if (Store.instance) {
      return Store.instance;
    }
    Store.instance = this;
    this.state = {};
  }
}

const store1 = new Store();
const store2 = new Store();
console.log(store1 === store2);  // true
```

**2. 工厂模式**：

根据参数创建不同对象。

```javascript
class Button {
  render() {
    console.log('Render button');
  }
}

class Input {
  render() {
    console.log('Render input');
  }
}

function createElement(type) {
  switch (type) {
    case 'button':
      return new Button();
    case 'input':
      return new Input();
    default:
      throw new Error('Unknown type');
  }
}
```

**3. 观察者模式**：

一对多依赖，当主题改变时通知所有观察者。

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}
```

**4. 策略模式**：

定义一系列算法，封装起来，使它们可以互换。

```javascript
// 策略对象
const strategies = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
};

// 上下文
function calculate(type, a, b) {
  return strategies[type](a, b);
}

calculate('add', 1, 2);        // 3
calculate('multiply', 3, 4);   // 12
```

**5. 适配器模式**：

将一个类的接口转换成客户期望的另一个接口。

```javascript
// 旧的API
class OldAPI {
  request() {
    return 'Old API response';
  }
}

// 适配器
class APIAdapter {
  constructor(oldAPI) {
    this.oldAPI = oldAPI;
  }

  get() {
    return this.oldAPI.request();
  }
}

// 使用
const adapter = new APIAdapter(new OldAPI());
adapter.get();  // 'Old API response'
```

### MVVM模式？

MVVM是Model-View-ViewModel的缩写，Vue的核心架构。

**核心概念**：
- **Model**：数据模型
- **View**：视图模板
- **ViewModel**：连接Model和View，实现数据绑定

```
┌──────────────────────────────────────────────┐
│                    View                       │
│  ┌────────────────────────────────────────┐  │
│  │  <input v-model="name" />              │  │
│  │  <div>{{ name }}</div>                 │  │
│  └────────────────────────────────────────┘  │
│          ↑↓                                   │
│  ┌────────────────────────────────────────┐  │
│  │         ViewModel                       │  │
│  │  - data                                │  │
│  │  - computed                            │  │
│  │  - methods                             │  │
│  └────────────────────────────────────────┘  │
│          ↑↓                                   │
│  ┌────────────────────────────────────────┐  │
│  │            Model                        │  │
│  │  - name: 'Alice'                        │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**数据绑定**：
- **单向绑定**：Model → View
- **双向绑定**：Model ↔ View

## 组件设计原则

### 单一职责原则（SRP）？

一个组件只做一件事，做好一件事。

```vue
<!-- ❌ 错误：职责混乱 -->
<template>
  <div>
    <form @submit="handleSubmit">
      <input v-model="name" />
      <button type="submit">Submit</button>
    </form>
    <table>
      <tr v-for="item in list" :key="item.id">
        <td>{{ item.name }}</td>
      </tr>
    </table>
  </div>
</template>

<!-- ✅ 正确：职责分离 -->
<!-- UserForm.vue - 负责表单 -->
<template>
  <form @submit="handleSubmit">
    <input v-model="name" />
    <button type="submit">Submit</button>
  </form>
</template>

<!-- UserList.vue - 负责列表 -->
<template>
  <table>
    <tr v-for="item in list" :key="item.id">
      <td>{{ item.name }}</td>
    </tr>
  </table>
</template>
```

### 开闭原则（OCP）？

对扩展开放，对修改关闭。

```javascript
// ❌ 错误：每次添加类型都要修改
function getDiscount(type) {
  switch (type) {
    case 'normal':
      return 0.9;
    case 'vip':
      return 0.8;
    // 每次添加新类型都要修改这里
  }
}

// ✅ 正确：使用策略模式
const discountStrategies = {
  normal: 0.9,
  vip: 0.8,
  svip: 0.7  // 扩展时只需添加，不修改原有代码
};

function getDiscount(type) {
  return discountStrategies[type] || 1;
}
```

### 依赖倒置原则（DIP）？

高层模块不依赖低层模块，都依赖抽象。

```javascript
// ❌ 错误：高层依赖低层
class OrderService {
  constructor() {
    this.mysql = new MySQL();  // 依赖具体实现
  }

  save(order) {
    this.mysql.insert(order);
  }
}

// ✅ 正确：依赖抽象
interface Database {
  insert(data);
}

class OrderService {
  constructor(db) {
    this.db = db;  // 依赖抽象
  }

  save(order) {
    this.db.insert(order);
  }
}

// 使用
const mysql = new MySQL();
const orderService = new OrderService(mysql);
```

## 状态管理架构

### 什么时候需要状态管理？

**判断标准**：
1. 多个组件共享状态
2. 跨层级组件通信
3. 全局单例状态
4. 需要持久化

**场景对比**：

| 场景 | Props/Emit | Provide/Inject | Pinia |
|------|-----------|----------------|-------|
| 父子通信 | ✅ | - | - |
| 跨层级 | - | ✅ | - |
| 兄弟组件 | - | ⚪ | ✅ |
| 全局状态 | - | - | ✅ |
| 持久化 | - | - | ✅ |

### 如何设计Store？

**按职责拆分Store**：

```javascript
// stores/user.js - 用户相关
export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const token = ref('');

  function login(credentials) { }
  function logout() { }

  return { user, token, login, logout };
});

// stores/cart.js - 购物车相关
export const useCartStore = defineStore('cart', () => {
  const items = ref([]);

  function addItem(item) { }
  function removeItem(id) { }

  return { items, addItem, removeItem };
});
```

**使用组合式函数复用逻辑**：

```javascript
// composables/usePagination.js
export function usePagination(fetchData) {
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  const data = ref([]);

  async function load() {
    const res = await fetchData({
      page: page.value,
      pageSize: pageSize.value
    });
    data.value = res.data;
    total.value = res.total;
  }

  return { page, pageSize, total, data, load };
}

// 在Store中使用
export const useUserStore = defineStore('user', () => {
  const { page, pageSize, total, data, load } = usePagination(fetchUsers);

  return { page, pageSize, total, data, load };
});
```

## 微前端架构

### 什么是微前端？

将微服务理念应用到前端，将大型应用拆分成多个小型应用。

**优势**：
1. **独立开发**：团队独立开发、部署
2. **技术栈无关**：不同应用可用不同框架
3. **增量升级**：逐步升级，无需重构
4. **独立部署**：应用独立部署

**微前端框架**：
- **qiankun**：阿里开源，基于single-spa
- **single-spa**：底层框架
- **Module Federation**：Webpack5原生支持

### qiankun配置？

**主应用**：

```javascript
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:7100',
    container: '#container',
    activeRule: '/app1'
  },
  {
    name: 'app2',
    entry: '//localhost:7200',
    container: '#container',
    activeRule: '/app2'
  }
]);

start();
```

**子应用**：

```javascript
// main.js
let instance = null;

function render() {
  instance = createApp(App);
  instance.mount('#app');
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {}

export async function mount(props) {
  render();
}

export async function unmount() {
  instance?.unmount();
}
```

**子应用vite配置**：

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
    vue(),
    qiankun({
      useDevMode: true
    })
  ]
});
```

## 项目结构设计

### 推荐的项目结构？

```
src/
├── assets/          # 静态资源
├── components/      # 通用组件
│   ├── Button.vue
│   └── Table.vue
├── composables/     # 组合式函数
│   ├── useRequest.js
│   └── useTable.js
├── layouts/         # 布局组件
│   ├── DefaultLayout.vue
│   └── AuthLayout.vue
├── pages/           # 页面组件
│   ├── Home/
│   └── About/
├── router/          # 路由配置
│   └── index.js
├── stores/          # 状态管理
│   ├── user.js
│   └── app.js
├── styles/          # 全局样式
│   ├── variables.scss
│   └── global.scss
├── utils/           # 工具函数
│   ├── request.js
│   └── format.js
├── types/           # TypeScript类型
│   └── index.d.ts
├── App.vue
└── main.js
```

### 如何设计组件库结构？

```
my-component-lib/
├── packages/              # 组件源码
│   ├── Button/
│   │   ├── index.vue
│   │   ├── index.ts
│   │   └── styles.scss
│   ├── Input/
│   └── ...
├── docs/                  # 文档
├── playground/            # 示例
├── build/                 # 构建工具
├── src/                   # 入口
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Monorepo架构

### 什么是Monorepo？

Monorepo（单体仓库）是将多个项目存储在一个代码仓库中的开发策略。

**优势**：
- 代码共享方便
- 统一的依赖管理
- 原子化提交
- 跨项目重构容易
- 统一的CI/CD流程

**劣势**：
- 仓库体积大
- 构建时间长
- 权限管理复杂

### pnpm workspace配置？

```json
// pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools'

// package.json
{
  "name": "monorepo-root",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "pnpm": "^8.0.0"
  }
}

// 目录结构
monorepo/
├── apps/
│   ├── web/                 # Web应用
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── admin/               # 管理后台
│       ├── package.json
│       └── vite.config.ts
├── packages/
│   ├── ui/                  # 组件库
│   │   ├── package.json
│   │   └── src/
│   ├── shared/              # 共享工具
│   │   ├── package.json
│   │   └── src/
│   └── types/               # 类型定义
│       ├── package.json
│       └── index.d.ts
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

**工作空间依赖**：

```json
// apps/web/package.json
{
  "name": "@monorepo/web",
  "dependencies": {
    "@monorepo/ui": "workspace:*",
    "@monorepo/shared": "workspace:*"
  }
}
```

### Turborepo配置？

```javascript
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}

// 远程缓存配置
{
  "pipeline": {
    "build": {
      "outputs": ["dist/**"]
    }
  },
  "remoteCache": {
    "enabled": true,
    "host": "https://your-cache-server.com"
  }
}
```

### Nx配置？

```json
// nx.json
{
  "version": 2,
  "cli": {
    "defaultCollection": "@nrwl/vue"
  },
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/workspace/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint", "e2e"]
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    }
  }
}

// 项目配置
// apps/web/project.json
{
  "name": "web",
  "projectType": "application",
  "sourceRoot": "apps/web/src",
  "targets": {
    "build": {
      "executor": "@nrwl/vite:build",
      "options": {
        "outputPath": "dist/apps/web"
      }
    }
  }
}
```

## 设计系统

### Design Tokens是什么？

Design Tokens是设计系统的原子变量，连接设计与代码。

```javascript
// tokens.json
{
  "color": {
    "primary": {
      "value": "#007AFF",
      "type": "color"
    },
    "success": {
      "value": "#34C759",
      "type": "color"
    }
  },
  "spacing": {
    "xs": { "value": "4px", "type": "dimension" },
    "sm": { "value": "8px", "type": "dimension" },
    "md": { "value": "16px", "type": "dimension" },
    "lg": { "value": "24px", "type": "dimension" }
  },
  "typography": {
    "fontSize": {
      "small": { "value": "12px", "type": "fontSize" },
      "base": { "value": "14px", "type": "fontSize" },
      "large": { "value": "16px", "type": "fontSize" }
    }
  }
}

// 转换为CSS变量
// styles/tokens.css
:root {
  --color-primary: #007AFF;
  --color-success: #34C759;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --fontSize-small: 12px;
  --fontSize-base: 14px;
  --fontSize-large: 16px;
}

// 在Vue中使用
<style scoped>
.button {
  background: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--fontSize-base);
}
</style>
```

### Storybook集成？

```javascript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  }
};

export default config;
```

```vue
<!-- src/components/Button.stories.ts -->
<script setup lang="ts">
import type { Meta, StoryObj } from '@storybook/vue3';
import Button from './Button.vue';

const meta: Meta<typeof Button> = {
  title: 'Example/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['primary', 'secondary', 'danger']
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large']
    }
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    type: 'primary',
    label: 'Button'
  }
};

export const Secondary: Story = {
  args: {
    type: 'secondary',
    label: 'Button'
  }
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Button'
  }
};
</script>
```

### Figma to Code工作流？

```javascript
// 使用Figma API导出设计
// utils/figma.js
const FIGMA_ACCESS_TOKEN = 'your-token';
const FILE_KEY = 'your-file-key';

async function getFigmaComponents() {
  const response = await fetch(
    `https://api.figma.com/v1/files/${FILE_KEY}`,
    {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN
      }
    }
  );

  const data = await response.json();

  // 提取组件
  const components = data.document.children
    .flatMap(page => page.children)
    .filter(node => node.type === 'COMPONENT');

  return components;
}

// 转换为Design Tokens
function extractDesignTokens(node) {
  return {
    fills: node.fills,
    strokes: node.strokes,
    effects: node.effects,
    typography: node.style
  };
}
```

## 前端监控体系

### Sentry集成？

```javascript
// main.js
import * as Sentry from '@sentry/vue';

const app = createApp(App);

Sentry.init({
  app,
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'your-site.com']
    }),
    new Sentry.Replay()
  ],
  // 性能监控
  tracesSampleRate: 1.0,
  // 回放采样率
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // 环境
  environment: import.meta.env.MODE,
  // 版本
  release: import.meta.env.VITE_APP_VERSION,
  // 用户信息
  beforeSend(event, hint) {
    // 添加用户上下文
    event.user = {
      id: getUserId(),
      username: getUserName()
    };
    return event;
  }
});

// 手动捕获错误
try {
  // 可能出错的代码
} catch (error) {
  Sentry.captureException(error);
}

// 添加面包屑
Sentry.addBreadcrumb({
  message: 'User clicked button',
  category: 'user',
  level: 'info'
});
```

### 自建监控平台？

```javascript
// utils/monitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.apiEndpoint = '/api/analytics';
  }

  // 收集性能指标
  collectMetrics() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      // Navigation Timing
      const perfData = performance.getEntriesByType('navigation')[0];

      const metrics = {
        // DNS查询
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        // TCP连接
        tcp: perfData.connectEnd - perfData.connectStart,
        // 请求响应
        request: perfData.responseEnd - perfData.requestStart,
        // DOM解析
        domParsing: perfData.domComplete - perfData.domInteractive,
        // 首次绘制
        fcp: this.getFCP(),
        // 最大内容绘制
        lcp: this.getLCP(),
        // 首次输入延迟
        fid: this.getFID(),
        // 累积布局偏移
        cls: this.getCLS()
      };

      this.send(metrics);
    });
  }

  // 获取FCP
  getFCP() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  // 获取LCP
  getLCP() {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }

  // 获取FID
  getFID() {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const firstInput = list.getEntries()[0];
        resolve(firstInput.processingStart - firstInput.startTime);
      }).observe({ entryTypes: ['first-input'] });
    });
  }

  // 获取CLS
  getCLS() {
    let clsValue = 0;
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        resolve(clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    });
  }

  // 发送指标
  send(metrics) {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(metrics)], {
        type: 'application/json'
      });
      navigator.sendBeacon(this.apiEndpoint, blob);
    } else {
      fetch(this.apiEndpoint, {
        method: 'POST',
        body: JSON.stringify(metrics),
        keepalive: true
      });
    }
  }

  // 错误监控
  initErrorTracking() {
    window.addEventListener('error', (event) => {
      this.send({
        type: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.send({
        type: 'unhandledRejection',
        reason: event.reason
      });
    });
  }
}

// 初始化
const monitor = new PerformanceMonitor();
monitor.collectMetrics();
monitor.initErrorTracking();
```

## 灰度发布

### Feature Flag实现？

```javascript
// stores/featureFlags.js
import { defineStore } from 'pinia';

export const useFeatureFlagStore = defineStore('featureFlags', {
  state: () => ({
    flags: {}
  }),

  actions: {
    async fetchFlags() {
      const response = await fetch('/api/feature-flags');
      this.flags = await response.json();
    },

    isEnabled(flagName) {
      return !!this.flags[flagName];
    }
  }
});

// 在组件中使用
<script setup>
import { useFeatureFlagStore } from '@/stores/featureFlags';

const featureFlags = useFeatureFlagStore();
featureFlags.fetchFlags();
</script>

<template>
  <NewFeature v-if="featureFlags.isEnabled('new-feature')" />
  <OldFeature v-else />
</template>
```

### A/B Test架构？

```javascript
// utils/abTest.js
class ABTest {
  constructor() {
    this.variant = this.getVariant();
  }

  getVariant() {
    // 从localStorage读取
    const stored = localStorage.getItem('abTestVariant');
    if (stored) return stored;

    // 随机分配
    const variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem('abTestVariant', variant);

    return variant;
  }

  track(event, data) {
    fetch('/api/analytics/events', {
      method: 'POST',
      body: JSON.stringify({
        event,
        variant: this.variant,
        ...data
      })
    });
  }
}

const abTest = new ABTest();

// 在组件中使用
<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  abTest.track('page_view', {
    page: 'home'
  });
});
</script>

<template>
  <div v-if="abTest.variant === 'A'">
    <!-- 版本A -->
  </div>
  <div v-else>
    <!-- 版本B -->
  </div>
</template>
```

## Serverless前端

### Vercel部署？

```javascript
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}

// Serverless函数
// api/hello.js
export default function handler(req, res) {
  res.json({ message: 'Hello from Serverless!' });
}
```

### Netlify配置？

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"

# Serverless函数
# netlify/functions/hello.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify!' })
  };
};
```

### 边缘计算？

```javascript
// Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API代理
    if (url.pathname.startsWith('/api/')) {
      const apiResponse = await fetch(
        'https://backend-api.com' + url.pathname,
        request
      );

      // 缓存响应
      ctx.waitUntil(
        caches.default.put(
          request,
          new Response(apiResponse.body, apiResponse)
        )
      );

      return apiResponse;
    }

    // A/B测试
    const variant = Math.random() < 0.5 ? 'A' : 'B';
    const response = await fetch(request);
    const newResponse = new Response(response.body);

    newResponse.headers.set('X-AB-Variant', variant);

    return newResponse;
  }
};

// Vercel Edge Functions
// edge-functions/ab-test.js
export const config = {
  runtime: 'edge'
};

export default function handler(request) {
  const variant = Math.random() < 0.5 ? 'A' : 'B';

  return new Response(JSON.stringify({ variant }), {
    headers: {
      'Content-Type': 'application/json',
      'X-AB-Variant': variant
    }
  });
}
```

## 分布式追踪

### OpenTelemetry集成？

```javascript
// main.js
import { initOpenTelemetry } from './telemetry';

initOpenTelemetry();
```

```javascript
// telemetry.js
import * as opentelemetry from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

export function initOpenTelemetry() {
  const resource = Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'frontend-app',
      [SemanticResourceAttributes.SERVICE_VERSION]: import.meta.env.VITE_APP_VERSION
    })
  );

  const provider = new WebTracerProvider({ resource });

  // 添加span处理器
  provider.addSpanProcessor(
    new BatchSpanProcessor(
      new opentelemetry.COLLECTOR_TRACE_EXPORTER.COLLECTOR_TRACE_EXPORTER_CLASS({
        url: 'https://your-collector.com/v1/trace'
      })
    )
  );

  provider.register({
    contextManager: new ZoneContextManager()
  });

  // 自动埋点
  registerInstrumentations({
    instrumentations: [
      new XMLHttpRequestInstrumentation(),
      new FetchInstrumentation()
    ]
  });

  return opentelemetry.trace.getTracer('frontend-app');
}
```

```javascript
// 手动创建span
import { trace } from '@opentelemetry/api';

async function fetchUserData(userId) {
  const tracer = trace.getTracer('frontend-app');

  return tracer.startActiveSpan('fetchUserData', async (span) => {
    try {
      span.setAttribute('userId', userId);

      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
      return data;
    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: opentelemetry.SpanStatusCode.ERROR,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
