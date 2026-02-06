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

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
