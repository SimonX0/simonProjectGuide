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

## 重构实战经验

### 渐进式重构策略？（字节、阿里必问）

```javascript
// 渐进式重构：在不影响业务的情况下逐步改善代码

// 策略1：Branch by Abstraction（通过抽象分支）
// 第1步：创建抽象层
class IUserRepository {
  findById(id) {
    throw new Error('Not implemented')
  }
}

// 第2步：旧实现继承抽象
class LegacyUserRepository extends IUserRepository {
  findById(id) {
    // 旧的实现
    return db.query(`SELECT * FROM users WHERE id = ${id}`)
  }
}

// 第3步：新实现继承抽象
class NewUserRepository extends IUserRepository {
  findById(id) {
    // 新的实现（使用ORM）
    return User.findByPk(id)
  }
}

// 第4步：使用工厂模式逐步切换
class RepositoryFactory {
  constructor() {
    this.useNewImplementation = false
    this.legacy = new LegacyUserRepository()
    this.new = new NewUserRepository()
  }

  getUserRepository() {
    // 通过特性开关控制
    return this.useNewImplementation ? this.new : this.legacy
  }

  // 金丝雀发布：先让10%流量使用新实现
  shouldUseNew(userId) {
    return userId % 10 === 0
  }

  findById(id) {
    return this.shouldUseNew(id)
      ? this.new.findById(id)
      : this.legacy.findById(id)
  }
}

// 策略2：绞杀者模式（Strangler Fig）
// 逐步替换旧功能，而不是一次性重写

// 旧的路由
const oldRoutes = [
  { path: '/users/:id', handler: oldUserHandler }
]

// 新的路由
const newRoutes = [
  { path: '/users/:id', handler: newUserHandler }
]

// 路由决策器
function routeHandler(req, res) {
  // 根据用户ID决定使用新旧处理
  const userId = parseInt(req.params.id)

  if (featureFlags.useNewUserHandler(userId)) {
    return newUserHandler(req, res)
  }

  return oldUserHandler(req, res)
}

// 策略3：并行运行
// 新旧代码同时运行，对比结果
async function parallelExecution(oldFn, newFn, input) {
  const [oldResult, newResult] = await Promise.all([
    oldFn(input),
    newFn(input)
  ])

  // 记录差异
  if (JSON.stringify(oldResult) !== JSON.stringify(newResult)) {
    logger.warn('Results differ', {
      input,
      old: oldResult,
      new: newResult
    })
  }

  // 仍然返回旧结果，直到新结果稳定
  return oldResult
}

// 策略4：功能开关
// 使用配置控制新功能启用
const featureFlags = {
  useNewCheckout: process.env.FEATURE_NEW_CHECKOUT === 'true',
  useNewPayment: getUserPercentage() < 20 // 20%用户
}

function checkout(cart) {
  if (featureFlags.useNewCheckout) {
    return newCheckoutProcess(cart)
  }
  return legacyCheckoutProcess(cart)
}
```

### 大型项目重构的风险控制？（美团高频）

```javascript
// 重构风险管理体系

class RefactoringRiskManager {
  constructor() {
    this.risks = []
    this.mitigations = []
  }

  // 风险识别
  identifyRisks(refactoringPlan) {
    const risks = []

    // 1. 影响范围分析
    const impact = this.analyzeImpact(refactoringPlan)
    risks.push({
      type: 'impact',
      level: impact.score > 50 ? 'high' : 'medium',
      description: `影响${impact.files}个文件，${impact.modules}个模块`
    })

    // 2. 依赖关系分析
    const dependencies = this.analyzeDependencies(refactoringPlan)
    if (dependencies.critical > 10) {
      risks.push({
        type: 'dependency',
        level: 'high',
        description: `${dependencies.critical}个关键依赖`
      })
    }

    // 3. 测试覆盖率分析
    const coverage = this.analyzeTestCoverage(refactoringPlan)
    if (coverage < 60) {
      risks.push({
        type: 'testing',
        level: 'high',
        description: `测试覆盖率仅${coverage}%`
      })
    }

    this.risks = risks
    return risks
  }

  // 风险缓解措施
  planMitigations(risks) {
    const mitigations = []

    risks.forEach(risk => {
      switch (risk.type) {
        case 'impact':
          mitigations.push({
            risk: risk,
            action: '分阶段发布',
            details: '先发布到测试环境，再逐步推广到生产环境'
          })
          break

        case 'dependency':
          mitigations.push({
            risk: risk,
            action: '建立降级机制',
            details: '新功能出现问题时快速回滚到旧实现'
          })
          break

        case 'testing':
          mitigations.push({
            risk: risk,
            action: '增加测试',
            details: '先补充测试用例，再进行重构'
          })
          break
      }
    })

    this.mitigations = mitigations
    return mitigations
  }

  // 回滚计划
  createRollbackPlan() {
    return {
      preconditions: [
        '保留旧代码分支',
        '数据库迁移可回滚',
        '配置支持快速切换'
      ],
      steps: [
        '1. 关闭新功能开关',
        '2. 回滚数据库迁移（如有）',
        '3. 重新部署旧版本',
        '4. 验证系统正常运行'
      ],
      timeToRecovery: '5分钟', // 目标恢复时间
      testProcedure: `
        1. 访问主要页面，验证功能正常
        2. 检查错误日志，确认无异常
        3. 监控关键指标，确认恢复正常
      `
    }
  }

  // 监控指标
  defineMetrics() {
    return {
      performance: [
        'page_load_time',
        'api_response_time',
        'error_rate'
      ],
      business: [
        'conversion_rate',
        'user_engagement',
        'transaction_success_rate'
      ],
      system: [
        'cpu_usage',
        'memory_usage',
        'disk_io'
      ]
    }
  }

  // 影响分析
  analyzeImpact(plan) {
    // 分析重构影响的文件和模块数量
    return {
      files: plan.changedFiles.length,
      modules: new Set(plan.changedFiles.map(f => f.module)).size,
      score: this.calculateImpactScore(plan)
    }
  }

  calculateImpactScore(plan) {
    // 计算影响分数
    let score = 0
    score += plan.changedFiles.length * 2
    score += plan.criticalFiles.length * 10
    score += plan.breakingChanges.length * 15
    return Math.min(score, 100)
  }
}

// 使用
const riskManager = new RefactoringRiskManager()

const refactoringPlan = {
  changedFiles: ['user.js', 'auth.js', 'api.js'],
  criticalFiles: ['auth.js'],
  breakingChanges: ['User model interface changed']
}

const risks = riskManager.identifyRisks(refactoringPlan)
const mitigations = riskManager.planMitigations(risks)
const rollbackPlan = riskManager.createRollbackPlan()

console.log('Risks:', risks)
console.log('Mitigations:', mitigations)
console.log('Rollback Plan:', rollbackPlan)
```

### 重构时的测试策略？（腾讯真题）

```javascript
// 重构测试策略

// 1. 测试金字塔
/*
       /\
      /E2E\     少量端到端测试
     /------\
    /Integration\  适量集成测试
   /------------\
  /    Unit      \ 大量单元测试
 /________________\
*/

// 2. 特征测试（Characterization Testing）
// 为遗留代码建立测试基线
describe('LegacyFunction', () => {
  it('behaves as documented', async () => {
    // 记录当前行为
    const input = { /* ... */ }
    const output = await legacyFunction(input)

    // 将当前行为作为测试期望
    expect(output).toEqual({
      // 记录实际输出
    })
  })
})

// 3. 测试替身（Test Doubles）
// 用于隔离依赖进行测试

// 3.1 Fake（假对象）
class FakeUserRepository {
  constructor() {
    this.users = new Map()
  }

  async findById(id) {
    return this.users.get(id)
  }

  async save(user) {
    this.users.set(user.id, user)
  }
}

// 3.2 Mock（模拟对象）
const mockAPI = {
  getUser: vi.fn().mockResolvedValue({ id: 1, name: 'Test' }),
  updateUser: vi.fn().mockResolvedValue({ id: 1, name: 'Updated' })
}

// 3.3 Stub（存根）
function stubFetch(data) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data
  })
}

// 4. 测试覆盖率监控
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
      // 设置覆盖率阈值
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})

// 5. 快照测试
// 用于UI组件重构
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

describe('Component', () => {
  it('matches snapshot', () => {
    const wrapper = mount(Component, {
      props: { title: 'Test' }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})

// 6. 端到端测试（E2E）
// 使用Playwright
import { test, expect } from '@playwright/test'

test('user flow', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
})

// 7. 性能回归测试
import { bench } from 'vitest'

bench('sorting algorithm', () => {
  const data = Array(1000).fill(0).map(() => Math.random())
  sort(data)
}, { time: 1000 })

// 8. 测试数据构建器
class TestDataBuilder {
  constructor() {
    this.user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    }
  }

  withId(id) {
    this.user.id = id
    return this
  }

  withName(name) {
    this.user.name = name
    return this
  }

  withEmail(email) {
    this.user.email = email
    return this
  }

  build() {
    return { ...this.user }
  }
}

// 使用
const user = new TestDataBuilder()
  .withId(123)
  .withName('Alice')
  .build()
```

### 微前端重构实战？（字节真题）

```javascript
// 从单体应用迁移到微前端

// 方案：使用qiankun进行微前端改造

// 主应用（主应用配置）
// main-app/src/micro-app.js
import { registerMicroApps, start, initGlobalState } from 'qiankun'

// 1. 注册微应用
const microApps = [
  {
    name: 'user-center',
    entry: '//localhost:8081',
    container: '#subapp-container',
    activeRule: '/user',
    props: {
      routerBase: '/user'
    }
  },
  {
    name: 'order-system',
    entry: '//localhost:8082',
    container: '#subapp-container',
    activeRule: '/order',
    props: {
      routerBase: '/order'
    }
  }
]

registerMicroApps(microApps, {
  beforeLoad: [
    app => {
      console.log('Loading app:', app.name)
      return Promise.resolve()
    }
  ],
  beforeMount: [
    app => {
      console.log('Mounting app:', app.name)
      return Promise.resolve()
    }
  ],
  afterMount: [
    app => {
      console.log('Mounted app:', app.name)
      return Promise.resolve()
    }
  ],
  beforeUnmount: [
    app => {
      console.log('Unmounting app:', app.name)
      return Promise.resolve()
    }
  ]
})

// 2. 启动微前端
start({
  sandbox: {
    strictStyleIsolation: true, // 样式隔离
    experimentalStyleIsolation: true
  },
  prefetch: 'all', // 预加载所有微应用
  singular: false // 是否单实例
})

// 3. 全局状态管理
const initialState = {
  user: null,
  token: null
}

const actions = initGlobalState(initialState)

actions.onGlobalStateChange((state, prev) => {
  console.log('State changed:', prev, '->', state)
})

// 主应用路由配置
// main-app/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue')
  },
  // 微应用路由容器
  {
    path: '/user/:pathMatch(.*)*',
    component: () => import('@/views/MicroAppContainer.vue')
  },
  {
    path: '/order/:pathMatch(.*)*',
    component: () => import('@/views/MicroAppContainer.vue')
  }
]

// 微应用容器
<template>
  <div id="subapp-container"></div>
</template>

// 微应用（子应用配置）
// micro-app-user/src/main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

let app = null
let router = null

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// qiankun生命周期钩子
export async function bootstrap() {
  console.log('User app bootstraped')
}

export async function mount(props) {
  render(props)
}

export async function unmount() {
  app?.unmount()
  app = null
  router = null
}

function render(props = {}) {
  const { container } = props

  app = createApp(App)

  router = createRouter({
    history: createWebHistory(
      window.__POWERED_BY_QIANKUN__
        ? '/user'
        : '/'
    ),
    routes
  })

  app.use(router)

  if (container) {
    app.mount(container)
  } else {
    app.mount('#app')
  }
}

// 微应用路由配置
const routes = [
  {
    path: '/',
    redirect: '/profile'
  },
  {
    path: '/profile',
    component: () => import('@/views/Profile.vue')
  },
  {
    path: '/settings',
    component: () => import('@/views/Settings.vue')
  }
]

// 微应用打包配置
// micro-app-user/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('user-center', {
      useDevMode: true
    })
  ],
  server: {
    port: 8081,
    cors: true,
    origin: 'http://localhost:8081'
  },
  build: {
    lib: {
      entry: './src/main.js',
      name: 'UserCenter',
      formats: ['umd'],
      fileName: 'user-center'
    }
  }
})

// 渐进式迁移策略
// 第1步：识别可拆分的模块
const modules = [
  { name: 'user-center', path: '/user/*', independent: true },
  { name: 'order-system', path: '/order/*', independent: true },
  { name: 'product-catalog', path: '/products/*', independent: false } // 依赖其他模块
]

// 第2步：按优先级迁移
// 优先级标准：
// 1. 业务独立性高
// 2. 团队边界清晰
// 3. 技术栈差异大

// 第3步：建立通信机制
// 主应用向微应用传递数据
export async function mount(props) {
  // 接收主应用传递的props
  const { routerBase, getGlobalState } = props

  // 监听全局状态变化
  getGlobalState?.((state, prev) => {
    console.log('Global state changed in micro app')
  })

  render(props)
}

// 微应用向主应用通信
import { initGlobalState } from 'qiankun'

const actions = initGlobalState(state)

// 微应用中修改全局状态
actions.setGlobalState({
  user: { id: 1, name: 'Alice' }
})

// 微应用之间通信
// actions.onGlobalStateChange(callback)
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
