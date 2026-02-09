# 实战项目4：Vue3 微前端企业级应用平台

> **项目难度**：⭐⭐⭐⭐⭐
> **预计时间**：70-90小时
> **技术栈**：Vue 3 | qiankun | TypeScript | Vite | PNPM | Module Federation

## 项目概述

构建一个基于微前端架构的企业级应用平台，使用 qiankun 作为微前端框架，实现多个子应用的独立开发、部署和运行，同时保持良好的用户体验和性能。

### 核心功能

```
🎯 微前端架构：qiankun + Vue3 实现主子应用
🚀 独立部署：各子应用可独立开发、测试、部署
📦 模块联邦：Webpack Module Federation 支持
🔄 状态共享：主子应用间状态通信
🔐 权限管理：统一鉴权和权限控制
📊 通信机制：qiankun 通信机制封装
🎨 主题共享：统一主题系统
⚡ 性能优化：预加载、缓存策略
```

### 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    主应用 (Main App)                     │
│                  Vue 3 + qiankun                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │           基础布局 + 全局导航                      │ │
│  │  ├── Header (用户信息、通知)                       │ │
│  │  ├── Sidebar (菜单路由)                            │ │
│  │  └── Content (子应用容器)                          │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  全局状态管理 (Pinia)                                   │
│  ├── 用户信息                                          │
│  ├── 权限数据                                          │
│  ├── 主题配置                                          │
│  └── 全局通信                                          │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┼────────┬────────────┬────────────┐
    │        │        │            │            │
┌───▼───┐ ┌─▼────┐ ┌─▼──────┐ ┌─▼────────┐ ┌─▼──────┐
│ 用户  │ │订单  │ │商品   │ │财务     │ │设置    │
│ 管理  │ │管理  │ │管理   │ │管理     │ │中心    │
│ 子应用│ │子应用│ │子应用 │ │子应用   │ │子应用  │
└───────┘ └──────┘ └───────┘ └──────────┘ └────────┘

独立部署到不同域名/路径：
- user.app.com
- order.app.com
- product.app.com
- finance.app.com
- settings.app.com
```

---

## 项目架构设计

### 1. 项目结构

```bash
micro-frontend-platform/
├── main-app/                      # 主应用
│   ├── src/
│   │   ├── micro-app/            # 微前端配置
│   │   │   ├── apps.ts          # 子应用配置
│   │   │   ├── life-cycles.ts   # 生命周期钩子
│   │   │   └── actions.ts       # 通信机制
│   │   ├── components/          # 公共组件
│   │   ├── layouts/             # 布局组件
│   │   ├── router/              # 路由配置
│   │   ├── stores/              # 状态管理
│   │   ├── utils/               # 工具函数
│   │   ├── styles/              # 全局样式
│   │   └── main.ts
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── sub-apps/                      # 子应用
│   ├── user-management/          # 用户管理子应用
│   │   ├── src/
│   │   │   ├── micro/           # 微前端配置
│   │   │   ├── views/           # 页面组件
│   │   │   ├── components/      # 业务组件
│   │   │   ├── router/          # 路由配置
│   │   │   ├── stores/          # 状态管理
│   │   │   └── main.ts
│   │   ├── vite.config.ts
│   │   ├── package.json
│   │   └── .env.production
│   │
│   ├── order-management/         # 订单管理子应用
│   ├── product-management/       # 商品管理子应用
│   ├── finance-management/       # 财务管理子应用
│   └── settings-center/          # 设置中心子应用
│
├── shared/                        # 共享模块
│   ├── components/               # 共享组件
│   │   ├── Button/
│   │   ├── Table/
│   │   ├── Form/
│   │   └── Modal/
│   ├── utils/                    # 共享工具
│   ├── types/                    # 共享类型
│   └── constants/                # 共享常量
│
├── packages/                      # Monorepo 包管理
│   ├── eslint-config/
│   ├── prettier-config/
│   ├── ts-config/
│   └── commitlint/
│
├── pnpm-workspace.yaml           # PNPM workspace 配置
├── .npmrc
└── package.json
```

### 2. 技术选型

| 分类 | 技术选型 | 说明 |
|------|---------|------|
| **主应用框架** | Vue 3.4+ | Composition API |
| **微前端框架** | qiankun 2.x | 阿里开源微前端方案 |
| **构建工具** | Vite 5.x | 快速构建 |
| **包管理** | PNPM | Monorepo 支持 |
| **语言** | TypeScript 5.x | 类型安全 |
| **状态管理** | Pinia | Vue 3 官方推荐 |
| **路由** | Vue Router 4.x | 主子应用路由隔离 |
| **UI框架** | Element Plus | 主应用 |
| **HTTP** | Axios | 请求封装 |
| **通信** | qiankun 通信机制 | 主子应用通信 |
| **认证** | JWT + 单点登录 | 统一鉴权 |

---

## 核心功能实现

### 1. 主应用配置

**子应用注册配置**

```typescript
// main-app/src/micro-app/apps.ts
import { registerMicroApps, start } from 'qiankun';

interface MicroApp {
  name: string;
  entry: string;
  container: string;
  activeRule: (url: string) => boolean;
  props?: Record<string, any>;
}

// 子应用配置
const microApps: MicroApp[] = [
  {
    name: 'UserManagement',
    entry: process.env.VITE_USER_APP_ENTRY || '//localhost:3001',
    container: '#subapp-container',
    activeRule: (location) => location.pathname.startsWith('/user'),
    props: {
      routerBase: '/user',
      authToken: '', // 从主应用获取
    }
  },
  {
    name: 'OrderManagement',
    entry: process.env.VITE_ORDER_APP_ENTRY || '//localhost:3002',
    container: '#subapp-container',
    activeRule: (location) => location.pathname.startsWith('/order'),
    props: {
      routerBase: '/order',
    }
  },
  {
    name: 'ProductManagement',
    entry: process.env.VITE_PRODUCT_APP_ENTRY || '//localhost:3003',
    container: '#subapp-container',
    activeRule: (location) => location.pathname.startsWith('/product'),
    props: {
      routerBase: '/product',
    }
  },
  {
    name: 'FinanceManagement',
    entry: process.env.VITE_FINANCE_APP_ENTRY || '//localhost:3004',
    container: '#subapp-container',
    activeRule: (location) => location.pathname.startsWith('/finance'),
    props: {
      routerBase: '/finance',
    }
  },
  {
    name: 'SettingsCenter',
    entry: process.env.VITE_SETTINGS_APP_ENTRY || '//localhost:3005',
    container: '#subapp-container',
    activeRule: (location) => location.pathname.startsWith('/settings'),
    props: {
      routerBase: '/settings',
    }
  },
];

// 注册子应用
export function registerApps() {
  registerMicroApps(microApps, {
    beforeLoad: [
      (app) => {
        console.log('准备加载子应用:', app.name);
        // 加载前显示 loading
        document.getElementById('subapp-loading')!.style.display = 'flex';
        return Promise.resolve();
      },
    ],
    beforeMount: [
      (app) => {
        console.log('准备挂载子应用:', app.name);
        return Promise.resolve();
      },
    ],
    afterMount: [
      (app) => {
        console.log('子应用挂载完成:', app.name);
        // 隐藏 loading
        document.getElementById('subapp-loading')!.style.display = 'none';
        return Promise.resolve();
      },
    ],
    beforeUnmount: [
      (app) => {
        console.log('准备卸载子应用:', app.name);
        return Promise.resolve();
      },
    ],
    afterUnmount: [
      (app) => {
        console.log('子应用卸载完成:', app.name);
        return Promise.resolve();
      },
    ],
  });

  // 启动 qiankun
  start({
    sandbox: {
      strictStyleIsolation: true, // 样式隔离
      experimentalStyleIsolation: true,
    },
    prefetch: 'all', // 预加载所有子应用
    singular: false, // 是否单实例
    fetch: (url: string, ...args) => {
      // 携带 cookie 等凭证
      return window.fetch(url, {
        ...args,
        credentials: 'include',
      });
    },
  });
}

// 获取子应用配置
export function getMicroApps() {
  return microApps;
}

// 根据名称获取子应用
export function getAppByName(name: string) {
  return microApps.find(app => app.name === name);
}
```

**主应用入口**

```typescript
// main-app/src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'virtual:windi.css';

import App from './App.vue';
import router from './router';
import { registerApps } from './micro-app/apps';
import { initGlobalState } from './micro-app/global-state';

const app = createApp(App);

// 安装插件
app.use(createPinia());
app.use(router);
app.use(ElementPlus);

// 初始化全局状态
initGlobalState();

// 注册微应用
registerApps();

// 挂载应用
app.mount('#app');

// 开发环境热更新
if (import.meta.env.DEV) {
  import('@vitejs/plugin-vue/client');
}
```

**主应用布局**

```vue
<!-- main-app/src/App.vue -->
<template>
  <div id="main-app" class="main-app">
    <!-- 顶部导航栏 -->
    <AppHeader />

    <div class="main-container">
      <!-- 侧边栏 -->
      <AppSidebar />

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 主应用路由视图 -->
        <router-view v-if="!isMicroApp" />

        <!-- 子应用容器 -->
        <div
          v-show="isMicroApp"
          id="subapp-container"
          class="subapp-container"
        ></div>

        <!-- 加载状态 -->
        <div v-if="loading" id="subapp-loading" class="subapp-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>应用加载中...</span>
        </div>
      </div>
    </div>

    <!-- 全局消息提示 -->
    <el-backtop />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from './layouts/AppHeader.vue';
import AppSidebar from './layouts/AppSidebar.vue';
import { Loading } from '@element-plus/icons-vue';

const route = useRoute();
const loading = ref(false);

// 判断是否为子应用路由
const isMicroApp = computed(() => {
  return /^\/(user|order|product|finance|settings)/.test(route.path);
});

onMounted(() => {
  // 监听子应用加载状态
  window.addEventListener('qiankun:loading', (e: any) => {
    loading.value = e.detail.loading;
  });
});
</script>

<style scoped lang="scss">
.main-app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow: auto;
  position: relative;
}

.subapp-container {
  width: 100%;
  height: 100%;
}

.subapp-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  font-size: 16px;
  color: #409eff;

  .el-icon {
    font-size: 48px;
  }
}
</style>
```

### 2. 全局状态管理

**全局状态初始化**

```typescript
// main-app/src/micro-app/global-state.ts
import { initGlobalState, MicroAppStateActions } from 'qiankun';
import { watch } from 'vue';
import { useUserStore } from '@/stores/user';
import { useThemeStore } from '@/stores/theme';

// 定义全局状态接口
interface GlobalState {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    roles: string[];
    permissions: string[];
  } | null;
  token: string;
  theme: {
    mode: 'light' | 'dark';
    primaryColor: string;
  };
  locale: string;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: number;
  }>;
}

// 初始状态
const initialState: GlobalState = {
  user: null,
  token: '',
  theme: {
    mode: 'light',
    primaryColor: '#409eff',
  },
  locale: 'zh-CN',
  notifications: [],
};

// 初始化全局状态
export const globalState = initGlobalState(initialState);
export const { onGlobalStateChange, setGlobalState } = globalState;

// 监听状态变化并同步到主应用 store
export function initGlobalState() {
  const userStore = useUserStore();
  const themeStore = useThemeStore();

  // 监听全局状态变化
  onGlobalStateChange((state, prev) => {
    console.log('全局状态变化:', state, prev);

    // 同步用户信息
    if (state.user !== prev.user) {
      userStore.setUser(state.user);
    }

    // 同步 token
    if (state.token !== prev.token) {
      userStore.setToken(state.token);
    }

    // 同步主题
    if (state.theme !== prev.theme) {
      themeStore.setTheme(state.theme);
    }
  }, true);

  // 监听主应用 store 变化并同步到全局状态
  watch(
    () => userStore.user,
    (user) => {
      setGlobalState({ user });
    }
  );

  watch(
    () => userStore.token,
    (token) => {
      setGlobalState({ token });
    }
  );

  watch(
    () => themeStore.theme,
    (theme) => {
      setGlobalState({ theme });
    }
  );
}

// 通知相关操作
export const notificationActions = {
  add(notification: Omit<GlobalState['notifications'][0], 'id' | 'timestamp'>) {
    const notifications = [
      ...globalState.state.notifications,
      {
        ...notification,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }
    ];
    setGlobalState({ notifications });
  },

  remove(id: string) {
    const notifications = globalState.state.notifications.filter(n => n.id !== id);
    setGlobalState({ notifications });
  },

  clear() {
    setGlobalState({ notifications: [] });
  }
};

// 用户相关操作
export const userActions = {
  login(user: GlobalState['user'], token: string) {
    setGlobalState({ user, token });
    // 保存到 localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  logout() {
    setGlobalState({
      user: null,
      token: '',
    });
    // 清除 localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  updateUserInfo(user: Partial<GlobalState['user']>) {
    const currentUser = globalState.state.user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      setGlobalState({ user: updatedUser });
    }
  }
};
```

### 3. 子应用配置

**子应用入口**

```typescript
// sub-apps/user-management/src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import App from './App.vue';
import router from './router';
import { qiankunWindow, qiankunLifeCycle } from './micro';

let app: any;

// 生命周期钩子
export async function bootstrap() {
  console.log('UserManagement 子应用 bootstrap');
}

export async function mount(props: any) {
  console.log('UserManagement 子应用 mount', props);

  // 保存 props
  qiankunLifeCycle.props = props;

  // 创建应用
  app = createApp(App);

  // 安装插件
  app.use(createPinia());
  app.use(router);

  // 注入主应用 props
  app.provide('globalState', props.getGlobalState);
  app.provide('setGlobalState', props.setGlobalState);
  app.provide('onGlobalStateChange', props.onGlobalStateChange);

  // 挂载
  const container = props.container
    ? props.container.querySelector('#app')
    : document.querySelector('#app');

  app.mount(container);
}

export async function unmount() {
  console.log('UserManagement 子应用 unmount');
  app?.unmount();
}

// 独立运行环境
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  mount({});
}
```

**子应用路由配置**

```typescript
// sub-apps/user-management/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { qiankunLifeCycle } from '../micro';

// 获取主应用传递的路由基础路径
const routerBase = qiankunLifeCycle.props?.routerBase || '/user';

const router = createRouter({
  history: createWebHistory(
    qiankunWindow.__POWERED_BY_QIANKUN__
      ? routerBase
      : '/'
  ),
  routes: [
    {
      path: '/',
      redirect: '/list',
    },
    {
      path: '/list',
      name: 'UserList',
      component: () => import('../views/UserList.vue'),
      meta: {
        title: '用户列表',
        requiresAuth: true,
      },
    },
    {
      path: '/create',
      name: 'UserCreate',
      component: () => import('../views/UserForm.vue'),
      meta: {
        title: '创建用户',
        requiresAuth: true,
      },
    },
    {
      path: '/edit/:id',
      name: 'UserEdit',
      component: () => import('../views/UserForm.vue'),
      meta: {
        title: '编辑用户',
        requiresAuth: true,
      },
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 用户管理`;
  }

  // 鉴权
  if (to.meta.requiresAuth) {
    const token = qiankunLifeCycle.props?.getGlobalState?.().token;
    if (!token) {
      // 跳转到主应用登录页
      window.history.pushState({}, '', '/login');
      return;
    }
  }

  next();
});

export default router;
```

**子应用 Vite 配置**

```typescript
// sub-apps/user-management/vite.config.ts
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
    port: 3001,
    cors: true,
    origin: 'http://localhost:3000', // 主应用地址
  },

  build: {
    lib: {
      entry: './src/main.ts',
      name: 'UserManagement',
      formats: ['umd'],
      fileName: 'user-management',
    },
    rollupOptions: {
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
    exclude: ['user-management'],
  },
});
```

### 4. 主子应用通信

**主应用提供通信方法**

```typescript
// main-app/src/micro-app/actions.ts
import { MicroAppStateActions } from 'qiankun';
import { ElMessage } from 'element-plus';

// 定义通信 actions
export const microActions: MicroAppStateActions = {
  // 主应用获取用户信息
  getUserInfo: () => {
    return globalState.state.user;
  },

  // 主应用获取 token
  getToken: () => {
    return globalState.state.token;
  },

  // 主应用发送消息
  showMessage: (message: { type: string; content: string }) => {
    ElMessage({
      type: message.type as any,
      message: message.content,
    });
  },

  // 主应用打开新页面
  openPage: (path: string) => {
    window.history.pushState({}, '', path);
  },

  // 子应用通知主应用更新标题
  updateTitle: (title: string) => {
    document.title = title;
  },

  // 子应用触发主应用刷新菜单
  refreshMenu: () => {
    // 触发菜单刷新逻辑
    window.dispatchEvent(new CustomEvent('menu-refresh'));
  },

  // 子应用请求主应用权限
  checkPermission: (permission: string) => {
    const user = globalState.state.user;
    return user?.permissions.includes(permission) || false;
  },
};

// 设置 actions
export function setActions() {
  window['microActions'] = microActions;
}
```

**子应用调用主应用方法**

```typescript
// sub-apps/user-management/src/utils/parent.js
/**
 * 调用主应用 actions
 */
export function callParent(action: string, ...args: any[]) {
  if (window.__POWERED_BY_QIANKUN__) {
    const actions = window.parent.microActions;
    if (actions && actions[action]) {
      return actions[action](...args);
    }
  }
  return null;
}

// 获取用户信息
export function getUserInfo() {
  return callParent('getUserInfo');
}

// 获取 token
export function getToken() {
  return callParent('getToken');
}

// 显示消息
export function showMessage(type: string, content: string) {
  return callParent('showMessage', { type, content });
}

// 检查权限
export function checkPermission(permission: string) {
  return callParent('checkPermission', permission);
}
```

**在子应用中使用**

```vue
<!-- sub-apps/user-management/src/views/UserList.vue -->
<template>
  <div class="user-list">
    <div class="toolbar">
      <el-button
        v-if="hasPermission('user:create')"
        type="primary"
        @click="handleCreate"
      >
        新增用户
      </el-button>
    </div>

    <el-table :data="users">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button
            v-if="hasPermission('user:edit')"
            link
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasPermission('user:delete')"
            link
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUserInfo, checkPermission, showMessage } from '@/utils/parent';

const users = ref([]);
const userInfo = getUserInfo();
const hasPermission = checkPermission;

const handleCreate = () => {
  // 创建逻辑
};

const handleEdit = (row: any) => {
  // 编辑逻辑
};

const handleDelete = (row: any) => {
  // 删除逻辑
  showMessage('success', '用户删除成功');
};

onMounted(() => {
  // 更新标题
  callParent('updateTitle', '用户列表');
});
</script>
```

### 5. 样式隔离方案

**使用 CSS-in-JS**

```vue
<!-- 使用 scoped 样式 -->
<template>
  <div class="user-management">
    <!-- 内容 -->
  </div>
</template>

<style scoped lang="scss">
.user-management {
  padding: 20px;

  // qiankun 会自动添加特殊属性选择器
  h1 {
    color: #333;
  }
}
</style>
```

**CSS Modules**

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
});
```

**使用 Shadow DOM（可选）**

```typescript
// main-app/src/micro-app/apps.ts
start({
  sandbox: {
    strictStyleIsolation: false,
    experimentalStyleIsolation: false,
  },
});

// 子应用使用 Shadow DOM
class UserManagement extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        /* 完全隔离的样式 */
        .container { ... }
      </style>
      <div class="container">
        <!-- 内容 -->
      </div>
    `;
  }
}

customElements.define('user-management', UserManagement);
```

### 6. 性能优化

**预加载策略**

```typescript
// main-app/src/micro-app/prefetch.ts
export function prefetchApps() {
  // 应用空闲时预加载
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      import('qiankun').then(({ prefetchApps }) => {
        prefetchApps([
          { name: 'UserManagement', url: '/user' },
          { name: 'OrderManagement', url: '/order' },
        ]);
      });
    });
  }
}
```

**缓存策略**

```typescript
// main-app/src/micro-app/cache.ts
const appCache = new Map<string, any>();

export function cacheApp(name: string, app: any) {
  appCache.set(name, app);
}

export function getCachedApp(name: string) {
  return appCache.get(name);
}

export function clearCache() {
  appCache.clear();
}
```

**懒加载优化**

```typescript
// 子应用路由懒加载
const routes = [
  {
    path: '/user',
    component: () => import('./views/User.vue'),
  }
];
```

---

## 部署指南

### 1. 开发环境

```bash
# 克隆项目
git clone https://github.com/yourorg/micro-frontend-platform.git
cd micro-frontend-platform

# 安装依赖
pnpm install

# 启动所有应用
pnpm dev

# 或单独启动
pnpm dev:main      # 主应用
pnpm dev:user      # 用户管理
pnpm dev:order     # 订单管理
pnpm dev:product   # 商品管理
```

### 2. 生产构建

```bash
# 构建所有应用
pnpm build

# 构建单个应用
pnpm build:main
pnpm build:user
```

### 3. Nginx 配置

```nginx
# /etc/nginx/conf.d/micro-frontend.conf
server {
    listen 80;
    server_name app.example.com;

    # 主应用
    location / {
        root /var/www/main-app;
        try_files $uri $uri/ /index.html;
    }

    # 用户管理子应用
    location /user {
        root /var/www/sub-apps/user-management;
        try_files $uri $uri/ /index.html;
    }

    # 订单管理子应用
    location /order {
        root /var/www/sub-apps/order-management;
        try_files $uri $uri/ /index.html;
    }

    # 商品管理子应用
    location /product {
        root /var/www/sub-apps/product-management;
        try_files $uri $uri/ /index.html;
    }

    # 跨域支持
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 4. Docker 部署

**主应用 Dockerfile**

```dockerfile
# main-app/Dockerfile
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

**Docker Compose**

```yaml
# docker-compose.yml
version: '3.8'

services:
  main-app:
    build: ./main-app
    ports:
      - "3000:80"
    networks:
      - micro-frontend

  user-app:
    build: ./sub-apps/user-management
    ports:
      - "3001:80"
    networks:
      - micro-frontend

  order-app:
    build: ./sub-apps/order-management
    ports:
      - "3002:80"
    networks:
      - micro-frontend

networks:
  micro-frontend:
    driver: bridge
```

---

## 学习成果

完成本项目后，你将掌握：

✅ **微前端架构**
- qiankun 框架使用
- 主子应用通信
- 应用隔离方案

✅ **Monorepo 管理**
- PNPM workspace
- 多包管理
- 依赖共享

✅ **性能优化**
- 预加载策略
- 缓存优化
- 懒加载

✅ **工程化实践**
- TypeScript 配置
- ESLint/Prettier
- CI/CD 流程

✅ **部署运维**
- Nginx 配置
- Docker 容器化
- 独立部署

---

## 扩展练习

- [ ] 实现 Module Federation 方案
- [ ] 添加子应用版本管理
- [ ] 实现子应用热更新
- [ ] 添加性能监控
- [ ] 实现灰度发布

---

**项目难度**：⭐⭐⭐⭐⭐
**预计时间**：70-90小时
**适合人群**：有 Vue3 基础，想深入学习微前端架构
