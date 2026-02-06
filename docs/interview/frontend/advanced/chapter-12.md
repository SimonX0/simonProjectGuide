---
title: 大型项目重构经验面试题
---

# 大型项目重构经验面试题

## 技术栈迁移

### Vue2到Vue3迁移？

```javascript
// 迁移步骤

// 1. 使用Vue3兼容模式
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);
app.use(router);
app.use(store);
app.mount('#app');

// 2. 迁移Options API到Composition API
// 之前 - Vue2 Options API
export default {
  data() {
    return {
      count: 0,
      user: null
    };
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    }
  },
  methods: {
    increment() {
      this.count++;
    },
    async fetchUser() {
      this.user = await api.getUser();
    }
  },
  mounted() {
    this.fetchUser();
  }
};

// 之后 - Vue3 Composition API
<script setup>
import { ref, computed, onMounted } from 'vue';

const count = ref(0);
const user = ref(null);

const doubleCount = computed(() => count.value * 2);

function increment() {
  count.value++;
}

async function fetchUser() {
  user.value = await api.getUser();
}

onMounted(() => {
  fetchUser();
});
</script>

// 3. 迁移Vuex到Pinia
// 之前 - Vuex
// store/index.js
import Vuex from 'vuex';

export default new Vuex.Store({
  state: {
    user: null,
    token: ''
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const { user, token } = await api.login(credentials);
      commit('SET_USER', user);
      commit('SET_TOKEN', token);
    }
  },
  getters: {
    isLoggedIn: state => !!state.token
  }
});

// 之后 - Pinia
// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: ''
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    async login(credentials) {
      const { user, token } = await api.login(credentials);
      this.user = user;
      this.token = token;
    }
  }
});

// 4. 迁移Vue Router
// 之前 - Vue Router 3
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  { path: '/', component: Home }
];

export default new VueRouter({
  mode: 'history',
  routes
});

// 之后 - Vue Router 4
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', component: Home }
];

export default createRouter({
  history: createWebHistory(),
  routes
});

// 5. 迁移第三方库
// @vue/composition-api -> @vueuse/core
import { useLocalStorage, useMouse } from '@vueuse/core';

// 6. 迁移全局过滤器
// Vue2
Vue.filter('capitalize', (value) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
});

// Vue3 - 使用计算属性或方法
const capitalize = (value) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// 或在模板中
{{ value.charAt(0).toUpperCase() + value.slice(1) }}
```

### Webpack到Vite迁移？

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '#': resolve(__dirname, 'types')
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-library': ['element-plus']
        }
      }
    }
  }
});

// 迁移检查清单
// 1. 更新index.html中的script标签
// 之前
<script src="/src/main.js"></script>

// 之后
<script type="module" src="/src/main.js"></script>

// 2. 更新环境变量
// 之前 - webpack
const API_URL = process.env.VUE_APP_API_URL;

// 之后 - vite
const API_URL = import.meta.env.VITE_API_URL;

// 3. 更新public目录
// vite默认使用根目录的public文件夹

// 4. 移除webpack相关配置
// - vue.config.js
// - webpack.config.js
// - babel.config.js (使用vite默认的babel配置)

// 5. 更新CSS导入
// 之前
import styles from './styles.scss';

// 之后
import './styles.scss';

// 6. 动态导入
// 之前
const module = require('./module.js');

// 之后
const module = await import('./module.js');
```

## 大型应用模块化改造

### 模块拆分策略？

```javascript
// 按功能模块拆分
// src/modules/user/
// ├── components/
// │   ├── UserList.vue
// │   ├── UserProfile.vue
// │   └── UserForm.vue
// ├── composables/
// │   ├── useUser.js
// │   └── useUserList.js
// ├── stores/
// │   └── userStore.js
// ├── types/
// │   └── user.d.ts
// ├── api/
// │   └── userApi.js
// ├── routes/
// │   └── index.js
// └── index.js (模块入口)

// 模块注册
// src/modules/user/index.js
import UserList from './components/UserList.vue';
import { useUserStore } from './stores/userStore';
import userRoutes from './routes';

export {
  UserList,
  useUserStore,
  userRoutes
};

// 按业务领域拆分（DDD）
// src/domains/
// ├── auth/
// │   ├── application/
// │   │   ├── services/
// │   │   └── use-cases/
// │   ├── domain/
// │   │   ├── entities/
// │   │   └── value-objects/
// │   └── infrastructure/
// │       └── repositories/
// ├── user/
// └── product/

// 按层级拆分（洋葱架构）
// src/
// ├── presentation/  (视图层)
// │   ├── components/
// │   └── pages/
// ├── application/  (应用层)
// │   ├── services/
// │   └── handlers/
// ├── domain/       (领域层)
// │   ├── entities/
// │   └── repositories/
// └── infrastructure/  (基础设施层)
//     ├── api/
//     └── storage/

// 插件化模块系统
class ModuleManager {
  constructor() {
    this.modules = new Map();
  }

  register(module) {
    this.modules.set(module.name, module);
    module.install?.(app);
  }

  get(name) {
    return this.modules.get(name);
  }
}

// 使用模块
const moduleManager = new ModuleManager();

moduleManager.register({
  name: 'user',
  components: {
    UserList,
    UserProfile
  },
  routes: userRoutes,
  install(app) {
    // 注册全局组件
    Object.entries(this.components).forEach(([name, component]) => {
      app.component(name, component);
    });
  }
});
```

### 模块间通信？

```javascript
// 1. 事件总线
// utils/eventBus.js
import { ref } from 'vue';

class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

export const eventBus = new EventBus();

// 使用
// module-a
import { eventBus } from '@/utils/eventBus';

eventBus.emit('user:updated', { id: 1, name: 'Alice' });

// module-b
import { onMounted, onUnmounted } from 'vue';
import { eventBus } from '@/utils/eventBus';

const handleUserUpdate = (user) => {
  console.log('User updated:', user);
};

onMounted(() => {
  eventBus.on('user:updated', handleUserUpdate);
});

onUnmounted(() => {
  eventBus.off('user:updated', handleUserUpdate);
});

// 2. 状态共享（Pinia）
// stores/shared.js
import { defineStore } from 'pinia';

export const useSharedStore = defineStore('shared', {
  state: () => ({
    currentUser: null,
    notifications: []
  }),

  actions: {
    setCurrentUser(user) {
      this.currentUser = user;
    },

    addNotification(notification) {
      this.notifications.push(notification);
    }
  }
});

// 3. 服务层通信
// services/communicationService.js
class CommunicationService {
  constructor() {
    this.channels = new Map();
  }

  createChannel(name) {
    if (!this.channels.has(name)) {
      this.channels.set(name, new BroadcastChannel(name));
    }
    return this.channels.get(name);
  }

  post(channelName, message) {
    const channel = this.createChannel(channelName);
    channel.postMessage(message);
  }

  subscribe(channelName, callback) {
    const channel = this.createChannel(channelName);
    channel.onmessage = (event) => {
      callback(event.data);
    };
  }
}

export const commService = new CommunicationService();
```

## 性能优化实战

### 大型应用性能优化？

```javascript
// 1. 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue')
  }
];

// 2. 组件懒加载
<script setup>
import { defineAsyncComponent } from 'vue';

const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);
</script>

// 3. 虚拟滚动
import { RecycleScroller } from 'vue-virtual-scroller';

<RecycleScroller
  :items="largeList"
  :item-size="50"
  key-field="id"
>
  <template #default="{ item }">
    <div>{{ item.name }}</div>
  </template>
</RecycleScroller>

// 4. 防抖和节流
import { useDebounceFn, useThrottleFn } from '@vueuse/core';

const debouncedSearch = useDebounceFn(search, 500);
const throttledScroll = useThrottleFn(handleScroll, 200);

// 5. 列表分页
const items = ref([]);
const page = ref(1);
const loading = ref(false);

async function loadMore() {
  if (loading.value) return;
  loading.value = true;

  const newData = await fetchItems(page.value);
  items.value.push(...newData);
  page.value++;
  loading.value = false;
}

// 6. 图片懒加载
<img v-lazy="imageUrl" loading="lazy" />

// 7. 代码分割
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['element-plus'],
          'utils': ['lodash-es', 'dayjs']
        }
      }
    }
  }
};

// 8. Gzip压缩
import viteCompression from 'vite-plugin-compression';

export default {
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    })
  ]
};
```

### 性能监控？

```javascript
// 性能监控系统
class PerformanceMonitor {
  constructor() {
    this.metrics = [];
  }

  // 测量Web Vitals
  async measureWebVitals() {
    const vitals = {
      FCP: await this.getFCP(),
      LCP: await this.getLCP(),
      FID: await this.getFID(),
      CLS: await this.getCLS(),
      TTFB: await this.getTTFB()
    };

    this.metrics.push(vitals);
    this.sendMetrics(vitals);
  }

  async getFCP() {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        resolve(fcp?.startTime || 0);
      }).observe({ entryTypes: ['paint'] });
    });
  }

  async getLCP() {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry?.startTime || 0);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }

  async getFID() {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const firstInput = list.getEntries()[0];
        resolve(firstInput?.processingStart - firstInput?.startTime || 0);
      }).observe({ entryTypes: ['first-input'] });
    });
  }

  async getCLS() {
    return new Promise((resolve) => {
      let clsValue = 0;
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

  async getTTFB() {
    const navigation = performance.getEntriesByType('navigation')[0];
    return navigation?.responseStart - navigation?.requestStart || 0;
  }

  sendMetrics(metrics) {
    fetch('/api/analytics/performance', {
      method: 'POST',
      body: JSON.stringify(metrics),
      keepalive: true
    });
  }
}

// 使用
const monitor = new PerformanceMonitor();
monitor.measureWebVitals();
```

## 技术债务处理

### 代码重构策略？

```javascript
// 1. 小步重构
// 之前 - 大函数
function processUserData(users) {
  // 100行代码
  users.forEach(user => {
    // 处理每个用户
  });
  // 返回结果
}

// 之后 - 拆分成小函数
function processUserData(users) {
  const validUsers = filterValidUsers(users);
  const enrichedUsers = enrichUsers(validUsers);
  return formatUsers(enrichedUsers);
}

function filterValidUsers(users) {
  return users.filter(user => user.isValid());
}

function enrichUsers(users) {
  return users.map(user => enrichUser(user));
}

function formatUsers(users) {
  return users.map(user => formatUser(user));
}

// 2. 提取重复代码
// 之前 - 重复的API调用
async function fetchUsers() {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

async function fetchPosts() {
  const response = await fetch('/api/posts');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

// 之后 - 提取通用逻辑
async function fetchAPI(endpoint) {
  const response = await fetch(`/api${endpoint}`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

const fetchUsers = () => fetchAPI('/users');
const fetchPosts = () => fetchAPI('/posts');

// 3. 引入设计模式
// 之前 - 直接使用
class UserService {
  async getUser(id) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
}

// 之后 - Repository模式
class UserRepository {
  async findById(id) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }

  async findAll() {
    const response = await fetch('/api/users');
    return response.json();
  }

  async save(user) {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
    return response.json();
  }
}

class UserService {
  constructor(repository) {
    this.repository = repository;
  }

  async getUser(id) {
    return this.repository.findById(id);
  }
}

// 4. 引入类型检查
// 之前
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// 之后
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

### 遗留代码处理？

```javascript
// 1. 添加测试覆盖
// 测试先行重构
describe('LegacyFunction', () => {
  it('should work correctly', () => {
    // 先写测试
    const result = legacyFunction(input);
    expect(result).toBe(expectedOutput);
  });

  // 重构后再确保测试通过
});

// 2. Strangler Fig模式
// 逐步替换旧代码
class NewService {
  async process(data) {
    // 新实现
  }
}

class AdapterService {
  constructor(oldService, newService) {
    this.oldService = oldService;
    this.newService = newService;
  }

  async process(data) {
    // 根据条件路由到新旧服务
    if (this.shouldUseNew(data)) {
      return this.newService.process(data);
    }
    return this.oldService.process(data);
  }

  shouldUseNew(data) {
    // 逐步增加使用新服务的比例
    return Math.random() < 0.1; // 从10%开始
  }
}

// 3. 添加适配器
// 适配旧接口到新接口
class LegacyAPIAdapter {
  constructor(newAPI) {
    this.newAPI = newAPI;
  }

  oldMethod(data) {
    // 转换数据格式
    const newData = this.transformData(data);
    return this.newAPI.newMethod(newData);
  }

  transformData(data) {
    // 数据转换逻辑
    return {
      // 新格式
    };
  }
}
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
