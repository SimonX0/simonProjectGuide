---
title: 路由与状态管理面试题
---

# 路由与状态管理面试题

## Vue Router

### Vue Router的核心概念？

Vue Router是Vue.js的官方路由管理器，主要功能：
1. **嵌套路由映射**
2. **模块化配置**
3. **路由参数、查询、通配符**
4. **细粒度导航控制**
5. **自动激活CSS类**
6. **URL哈希模式或HTML5历史模式**

**基本配置**：

```javascript
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

### 路由模式有哪些？

| 模式 | 说明 | URL格式 | 兼容性 |
|------|------|---------|--------|
| hash | URL哈希值 | `#/user/1` | 所有浏览器 |
| history | HTML5 History API | `/user/1` | 需要服务器配置 |
| memory | 内存模式 | 不显示URL | 特定场景 |

```javascript
import { createRouter, createWebHashHistory, createWebHistory, createMemoryHistory } from 'vue-router';

// Hash模式
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// History模式（推荐）
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Memory模式（SSR、移动应用）
const router = createRouter({
  history: createMemoryHistory(),
  routes
});
```

### 路由传参有哪些方式？

**1. 动态路由参数**：

```javascript
// 定义路由
{
  path: '/user/:id',
  name: 'User',
  component: User
}

// 导航跳转
router.push({ name: 'User', params: { id: 123 } });

// 获取参数
import { useRoute } from 'vue-router';
const route = useRoute();
console.log(route.params.id);  // 123
```

**2. Query查询参数**：

```javascript
// 导航跳转
router.push({ path: '/user', query: { id: 123, name: 'Alice' } });

// 获取参数
const route = useRoute();
console.log(route.query.id);    // 123
console.log(route.query.name);  // 'Alice'
```

**3. 路由元信息**：

```javascript
{
  path: '/admin',
  meta: { requiresAuth: true, role: 'admin' }
}

// 获取元信息
const route = useRoute();
if (route.meta.requiresAuth) {
  // 需要认证
}
```

### 路由守卫有哪些？

**全局守卫**：

```javascript
router.beforeEach((to, from, next) => {
  // 前置守卫
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login');
  } else {
    next();
  }
});

router.afterEach((to, from) => {
  // 后置钩子
  document.title = to.meta.title || 'App';
});
```

**路由独享守卫**：

```javascript
{
  path: '/admin',
  component: Admin,
  beforeEnter: (to, from, next) => {
    // 只对该路由生效
    if (hasPermission()) {
      next();
    } else {
      next('/403');
    }
  }
}
```

**组件内守卫**：

```vue
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';

// 离开守卫
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges()) {
    const answer = confirm('确定要离开吗？');
    if (answer) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

// 更新守卫（用于动态路由参数）
onBeforeRouteUpdate((to, from, next) => {
  // 当路由改变但组件被复用时调用
  fetchData(to.params.id);
  next();
});
</script>
```

### 编程式导航API？

```javascript
import { useRouter } from 'vue-router';

const router = useRouter();

// 导航到不同位置
router.push('/users/1');
router.push({ path: '/users/1' });
router.push({ name: 'User', params: { id: 1 } });

// 前进/后退
router.go(1);    // 前进一页
router.go(-1);   // 后退一页
router.back();   // 后退
router.forward(); // 前进

// 替换当前位置（不产生历史记录）
router.replace('/home');
```

### 路由懒加载？

使用动态import实现路由懒加载：

```javascript
const routes = [
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
];
```

**分组chunk（webpack）**：

```javascript
const About = () => import(/* webpackChunkName: "about" */ '@/views/About.vue');
const User = () => import(/* webpackChunkName: "user" */ '@/views/User.vue');
```

**好处**：
- 按需加载，减少首屏加载时间
- 分包加载，提升用户体验

### 嵌套路由？

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        // 空路径表示默认子路由
        path: '',
        component: UserHome
      },
      {
        path: 'profile',
        component: UserProfile
      },
      {
        path: 'posts',
        component: UserPosts
      }
    ]
  }
];
```

**模板中使用`<router-view>`**：

```vue
<!-- User.vue -->
<template>
  <div>
    <h2>User {{ $route.params.id }}</h2>
    <router-view></router-view>
  </div>
</template>
```

### 导航守卫的执行顺序？

```
1. 导航被触发
2. 失活组件的beforeRouteLeave
3. 全局beforeEach
4. 重用的组件内beforeRouteUpdate
5. 路由配置里的beforeEnter
6. 异步路由组件被解析
7. 激活组件的beforeRouteEnter
8. 全局beforeResolve
9. 导航被确认
10. 全局afterEach
11. DOM更新
12. 调用beforeRouteEnter传给next的回调函数
```

## Pinia状态管理

### Pinia相比Vuex的优势？

| 特性 | Pinia | Vuex |
|------|-------|------|
| TypeScript | 完善支持 | 需要额外配置 |
| Devtools | 支持 | 支持 |
| Mutations | 不需要 | 需要 |
| 模块化 | 天然支持 | 需要namespaced |
| 代码量 | 更少 | 更多 |
| 学习曲线 | 平缓 | 较陡 |

### Pinia的核心概念？

**Store**：类似于组件，是一个保存状态和业务逻辑的实体。

**定义Store**：

```javascript
// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),

  getters: {
    doubleCount: (state) => state.count * 2
  },

  actions: {
    increment() {
      this.count++;
    }
  }
});

// 或使用Setup语法
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  return { count, doubleCount, increment };
});
```

**使用Store**：

```vue
<script setup>
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();

console.log(counter.count);        // state
console.log(counter.doubleCount);  // getter
counter.increment();               // action
</script>

<template>
  <div>{{ counter.count }}</div>
  <button @click="counter.increment()">+</button>
</template>
```

### State、Getters、Actions的区别？

| 特性 | State | Getters | Actions |
|------|-------|---------|---------|
| 作用 | 存储状态 | 计算属性 | 业务逻辑 |
| 类型 | 任意类型 | 返回值 | 方法 |
| 参数 | 无 | 可接受state | 可接受任意参数 |
| 异步 | 不支持 | 不支持 | 支持 |
| 缓存 | - | 有缓存 | 无缓存 |

```javascript
export const useUserStore = defineStore('user', {
  // State - 存储状态
  state: () => ({
    name: 'Alice',
    age: 25
  }),

  // Getters - 计算属性（有缓存）
  getters: {
    description: (state) => `${state.name} is ${state.age} years old`,

    // getter可以接受其他getter
    doubleAgePlusOne(): number {
      return this.age * 2 + 1;
    }
  },

  // Actions - 方法（支持异步）
  actions: {
    async fetchUserData() {
      const res = await api.getUser();
      this.name = res.name;
      this.age = res.age;
    },

    incrementAge() {
      this.age++;
    }
  }
});
```

### Pinia如何持久化存储？

使用`pinia-plugin-persistedstate`插件：

```javascript
// main.js
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
```

**配置持久化**：

```javascript
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: ''
  }),

  persist: {
    key: 'user-store',
    storage: localStorage,  // 或 sessionStorage
    paths: ['token']  // 只持久化token
  }
});
```

### Store如何组合？

Store可以互相引用：

```javascript
// stores/user.js
export const useUserStore = defineStore('user', {
  state: () => ({
    name: 'Alice'
  })
});

// stores/cart.js
import { useUserStore } from './user';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),

  getters: {
    cartOwner() {
      const userStore = useUserStore();
      return userStore.name;
    }
  },

  actions: {
    addToCart(item) {
      const userStore = useUserStore();
      console.log(`Adding item for ${userStore.name}`);
      this.items.push(item);
    }
  }
});
```

### 如何监听Store变化？

```javascript
import { watch } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 监听整个state
watch(
  () => userStore.$state,
  (state) => {
    console.log('State changed:', state);
  },
  { deep: true }
);

// 监听特定属性
watch(
  () => userStore.name,
  (newName, oldName) => {
    console.log(`Name changed from ${oldName} to ${newName}`);
  }
);

// 监听action
userStore.$onAction(({ name, after, onError }) => {
  after(() => {
    console.log(`Action ${name} finished`);
  });

  onError((error) => {
    console.error(`Action ${name} failed:`, error);
  });
});
```

### 如何重置Store？

```javascript
const counter = useCounterStore();

// 重置整个state
counter.$reset();

// 或手动重置
counter.$patch({
  count: 0
});
```

## 高级路由应用

### 路由过渡动画如何实现？（字节、阿里必问）

使用Vue的`<transition>`组件配合路由守卫实现页面切换动画：

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑动效果 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

/* 缩放效果 */
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
```

**动态切换动画**：

```javascript
// 路由配置
{
  path: '/user/:id',
  meta: {
    transition: 'slide-left'
  }
}

// 编程式导航
router.push({
  path: '/user/1',
  meta: {
    transition: 'zoom'
  }
});
```

**实战技巧**：
- 使用`route.path`作为key确保组件重新创建
- `mode="out-in"`确保先出后入，避免布局抖动
- 不同页面可配置不同的过渡效果

### 动态路由如何添加和删除？（阿里、美团高频）

在权限管理系统中，动态路由是核心功能：

```javascript
import { useRouter } from 'vue-router';

const router = useRouter();

// 动态添加路由
function addDynamicRoutes(routes) {
  routes.forEach(route => {
    router.addRoute(route);
  });
}

// 示例：根据用户权限动态添加路由
async function setupUserRoutes(user) {
  const permissions = user.permissions;

  if (permissions.includes('admin')) {
    router.addRoute({
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/Admin.vue'),
      meta: { requiresAuth: true, role: 'admin' }
    });
  }

  if (permissions.includes('user')) {
    router.addRoute('Home', {  // 添加为子路由
      path: 'profile',
      name: 'Profile',
      component: () => import('@/views/Profile.vue')
    });
  }
}

// 删除动态路由
function removeDynamicRoute(routeName) {
  router.removeRoute(routeName);
}

// 实际应用：用户登录后动态加载路由
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
  }
];

// 批量添加
routes.forEach(route => {
  router.addRoute(route);
});

// 刷新导航
router.push(router.currentRoute.value.path);
```

**注意事项**：
- `addRoute`返回一个删除函数
- 动态添加的路由需要在导航守卫之前完成
- 刷新页面时需要重新加载动态路由

### 路由守卫中的异步操作如何处理？（字节真题）

路由守卫中的异步操作需要正确处理，避免导航提前结束：

```javascript
// ❌ 错误示例：异步操作未处理
router.beforeEach(async (to, from, next) => {
  const user = await fetchUser();  // 异步操作
  if (user) {
    next();
  }
});

// ✅ 正确示例1：使用async/await
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      const user = await fetchUser();
      if (user) {
        next();
      } else {
        next('/login');
      }
    } catch (error) {
      next('/error');
    }
  } else {
    next();
  }
});

// ✅ 正确示例2：返回Promise
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    return fetchUser()
      .then(user => {
        if (user) {
          next();
        } else {
          next('/login');
        }
      })
      .catch(() => {
        next('/error');
      });
  } else {
    next();
  }
});

// ✅ 正确示例3：Vue Router 4推荐方式（返回值代替next）
router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    const user = await fetchUser();
    if (!user) {
      return '/login';  // 返回目标路径
    }
  }
  // 返回undefined或true继续导航
});
```

**实战场景**：

```javascript
// 权限验证+数据预加载
router.beforeResolve(async (to) => {
  // 路由级别的数据预加载
  if (to.meta preloadData) {
    const { data } = await to.meta.preloadData(to.params);
    to.meta.loadedData = data;
  }
});

// 组件内使用数据
const route = useRoute();
const data = route.meta.loadedData;
```

### 导航故障如何处理？（阿里真题）

Vue Router 4提供了导航故障的检测和处理：

```javascript
import { useRouter, isNavigationFailure, NavigationFailureType } from 'vue-router';

const router = useRouter();

// 捕获导航失败
try {
  await router.push('/user/1');
} catch (error) {
  if (isNavigationFailure(error)) {
    // 处理不同类型的导航失败
    if (error.type === NavigationFailureType.aborted) {
      console.log('导航被中止');
    } else if (error.type === NavigationFailureType.cancelled) {
      console.log('导航被取消（新的导航发生）');
    } else if (error.type === NavigationFailureType.duplicated) {
      console.log('重复导航到当前位置');
    }
  } else {
    // 其他错误
    console.error('导航错误:', error);
  }
}

// 实战应用：忽略重复导航错误
async function safeNavigate(path) {
  try {
    await router.push(path);
  } catch (error) {
    if (!isNavigationFailure(error, NavigationFailureType.duplicated)) {
      throw error;
    }
  }
}

// 全局处理
router.afterEach((to, from, failure) => {
  if (failure) {
    console.log('导航失败:', failure.type);
  }
});
```

**常见故障场景**：
- 用户快速点击多次导航
- 路由守卫中`next(false)`中止导航
- 新导航发生时取消当前导航
- 重复导航到同一位置

## Pinia高级应用

### Pinia的TypeScript类型支持如何实现？（美团高频）

Pinia对TypeScript提供了完整的类型推断：

```typescript
// stores/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 定义User接口
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// 完全类型安全的Store
export const useUserStore = defineStore('user', () => {
  // State类型自动推断
  const user = ref<User | null>(null);
  const token = ref<string>('');

  // Getters返回类型明确
  const isAuthenticated = computed((): boolean => {
    return !!user.value;
  });

  const isAdmin = computed((): boolean => {
    return user.value?.role === 'admin';
  });

  // Actions参数和返回值类型清晰
  async function login(credentials: { email: string; password: string }): Promise<boolean> {
    try {
      const response = await api.login(credentials);
      user.value = response.data.user;
      token.value = response.data.token;
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  function updateUser(data: Partial<User>): void {
    if (user.value) {
      user.value = { ...user.value, ...data };
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    updateUser
  };
});

// 组件中使用（完整类型提示）
<script setup lang="ts">
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// userStore.user类型为 User | null
// userStore.isAuthenticated类型为 boolean
// userStore.login参数类型自动提示
</script>
```

**Store组合的类型支持**：

```typescript
import { useUserStore } from './user';

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore();

  const cartOwner = computed((): string => {
    return userStore.user?.name || 'Guest';  // 类型安全访问
  });

  return { cartOwner };
});
```

### Pinia Store如何进行单元测试？（字节高频）

使用Vitest测试Pinia Store：

```typescript
// stores/counter.test.ts
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useCounterStore } from '@/stores/counter';

describe('Counter Store', () => {
  beforeEach(() => {
    // 为每个测试创建新的pinia实例
    setActivePinia(createPinia());
  });

  it('initializes with zero', () => {
    const counter = useCounterStore();
    expect(counter.count).toBe(0);
  });

  it('increments count', () => {
    const counter = useCounterStore();
    counter.increment();
    expect(counter.count).toBe(1);
  });

  it('doubleCount getter works correctly', () => {
    const counter = useCounterStore();
    counter.count = 5;
    expect(counter.doubleCount).toBe(10);
  });

  it('resets state', () => {
    const counter = useCounterStore();
    counter.count = 10;
    counter.$reset();
    expect(counter.count).toBe(0);
  });
});

// 测试异步actions
describe('User Store Async Actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('fetches user data', async () => {
    const userStore = useUserStore();

    // Mock API
    vi.mock('@/api/user', () => ({
      getUser: vi.fn(() => Promise.resolve({
        data: { id: 1, name: 'Alice' }
      }))
    }));

    await userStore.fetchUser(1);

    expect(userStore.user).toEqual({ id: 1, name: 'Alice' });
  });

  it('handles fetch errors', async () => {
    const userStore = useUserStore();

    vi.mock('@/api/user', () => ({
      getUser: vi.fn(() => Promise.reject(new Error('API Error')))
    }));

    await expect(userStore.fetchUser(1)).rejects.toThrow('API Error');
  });
});
```

### Pinia的HMR（热模块替换）支持？（字节2025）

Pinia对开发时的热模块替换提供了良好支持：

```javascript
// stores/counter.js
import { defineStore } from 'pinia';
import { acceptHMRUpdate } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),

  actions: {
    increment() {
      this.count++;
    }
  }
});

// 接受HMR更新
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot));
}
```

**HMR的好处**：
- 修改Store代码后页面不刷新
- 保留当前State状态
- 提升开发体验

**Vite配置**：

```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  server: {
    hmr: true,  // 启用HMR
    watch: {
      usePolling: true  // 某些系统需要轮询
    }
  }
});
```

## 路由与状态结合

### 路由和状态管理的最佳实践？（美团、百度）

将路由和状态管理结合使用，构建复杂应用：

```javascript
// stores/route.js - 路由状态管理
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRouteStore = defineStore('route', () => {
  // 缓存路由参数
  const cachedParams = ref(new Map());

  function setCachedParams(routeName, params) {
    cachedParams.value.set(routeName, params);
  }

  function getCachedParams(routeName) {
    return cachedParams.value.get(routeName);
  }

  // 标签页管理
  const tabs = ref([
    { path: '/', name: 'Home', title: '首页' }
  ]);

  function addTab(route) {
    const exists = tabs.value.find(tab => tab.path === route.path);
    if (!exists) {
      tabs.value.push({
        path: route.path,
        name: route.name,
        title: route.meta.title || route.name
      });
    }
  }

  function removeTab(path) {
    const index = tabs.value.findIndex(tab => tab.path === path);
    if (index > -1) {
      tabs.value.splice(index, 1);
    }
  }

  return {
    cachedParams,
    tabs,
    setCachedParams,
    getCachedParams,
    addTab,
    removeTab
  };
});

// 路由守卫中使用Store
router.beforeEach((to, from, next) => {
  const routeStore = useRouteStore();

  // 添加标签页
  if (to.meta.keepAlive) {
    routeStore.addTab(to);
  }

  // 缓存参数
  if (from.meta.cacheParams) {
    routeStore.setCachedParams(from.name, from.params);
  }

  next();
});
```

**实战场景：返回上一页时恢复参数**：

```javascript
// 组件中使用
const route = useRoute();
const router = useRouter();
const routeStore = useRouteStore();

// 离开时缓存参数
onBeforeRouteLeave((to) => {
  if (to.name !== 'Detail') {
    routeStore.setCachedParams('list', route.query);
  }
});

// 返回时恢复参数
function goBackToList() {
  const cachedParams = routeStore.getCachedParams('list');
  router.push({
    name: 'List',
    query: cachedParams || {}
  });
}
```

### 路由元信息的最佳实践？（阿里高频）

使用路由元信息管理页面级别的配置：

```javascript
// 路由配置
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      title: '管理后台',           // 页面标题
      requiresAuth: true,          // 需要登录
      roles: ['admin', 'super'],   // 允许的角色
      keepAlive: true,             // 缓存组件
      transition: 'slide-left',    // 过渡动画
      icon: 'Setting',             // 菜单图标
      hidden: false,               // 是否在菜单中隐藏
      order: 100,                  // 菜单排序
      preloadData: async (params) => {  // 预加载数据
        return await fetchAdminData(params);
      }
    }
  }
];

// 动态设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title || 'App';
});

// 权限控制
router.beforeEach((to, from, next) => {
  const user = useUserStore();

  if (to.meta.requiresAuth && !user.isAuthenticated) {
    return next('/login');
  }

  if (to.meta.roles && !to.meta.roles.includes(user.role)) {
    return next('/403');
  }

  next();
});

// 组件缓存策略
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive>
      <component
        v-if="route.meta.keepAlive"
        :is="Component"
        :key="route.path"
      />
    </keep-alive>
    <component
      v-if="!route.meta.keepAlive"
      :is="Component"
      :key="route.path"
    />
  </router-view>
</template>

// 菜单生成
const menuItems = routes
  .filter(route => !route.meta.hidden)
  .sort((a, b) => (a.meta.order || 0) - (b.meta.order || 0));
```

**类型安全的元信息**：

```typescript
// 扩展路由元信息类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
    roles?: string[];
    keepAlive?: boolean;
    transition?: string;
    icon?: string;
    hidden?: boolean;
    order?: number;
    preloadData?: (params: any) => Promise<any>;
  }
}
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
