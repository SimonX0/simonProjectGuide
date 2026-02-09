---
title: Nuxt中级面试题
---

# Nuxt中级面试题

> 基于字节跳动、腾讯、阿里等大厂2024-2026年面试真题整理

## Nuxt核心概念

### 1. Nuxt基础与渲染模式

#### 问题1：Nuxt相比纯Vue3应用的优势？

```vue
// 纯Vue3应用（SPA）的痛点

// 1. SEO问题
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <h1 v-else>{{ data.title }}</h1>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(true);
const data = ref(null);

onMounted(async () => {
  const res = await fetch('/api/data');
  data.value = await res.json();
  loading.value = false;
});
</script>

// 爬虫只能看到：<div>Loading...</div>

// Nuxt的解决方案

// 1. SSR（服务端渲染）
// pages/index.vue
<script setup>
// Nuxt自动处理SSR
const { data } = await useFetch('/api/data');
// 服务端渲染HTML，爬虫能看到完整内容
</script>

<template>
  <h1>{{ data.title }}</h1>
</template>

// 2. 自动路由系统
// pages/index.vue -> /
// pages/about.vue -> /about
// pages/posts/[id].vue -> /posts/123

// 3. 服务端API
// server/api/hello.ts
export default defineEventHandler((event) => {
  return {
    message: 'Hello from Nuxt API'
  };
});

// 4. 组合式函数自动导入
// 不需要手动import，直接使用
const { data } = await useFetch('/api/data');
const router = useRouter();
const route = useRoute();

// Nuxt vs 纯Vue3对比
/*
特性          | 纯Vue3 | Nuxt
---------------------------------
SEO           | ❌ 差   | ✅ 优秀
首屏加载       | ❌ 慢   | ✅ 快
路由          | 需配置   | 文件路由
API          | 需后端  | 内置API
自动导入      | ❌ 无   | ✅ 有
TypeScript   | 需配置   | 内置支持
*/
```

#### 问题2：useFetch、useAsyncData、$fetch的区别？

```vue
<script setup>
// 1. useFetch - 推荐使用
const { data, pending, error, refresh } = await useFetch('/api/user', {
  // 查询参数
  query: { id: 123 },

  // 请求头
  headers: {
    'Authorization': 'Bearer token'
  },

  // 缓存策略
  getCachedData: (key) => useNuxtData().get(key),
  setCachedData: (key, value) => useNuxtData().set(key, value),

  // 请求/响应拦截
  onRequest({ request, options }) {
    // 请求前
  },
  onResponse({ response, options }) {
    // 响应后
  },

  // 数据变换
  transform: (res) => res.data,

  // 立即更新
  watch: [sourceId], // 监听变化重新获取
  server: true,     // 只在服务器端执行
  lazy: false,      // 延迟执行
});

// 使用示例
<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>{{ data.name }}</div>
  <button @click="refresh()">刷新</button>
</template>

// 2. useAsyncData - 更灵活的数据获取
const { data, pending, refresh } = await useAsyncData(
  'user', // 唯一键
  () => $fetch('/api/user').then(res => res.json()),
  {
    // 选项类似useFetch
    watch: [userId],
    server: true,
    default: () => null,
    transform: (data) => data,
  }
);

// 3. $fetch - Ofetch实例，全局可用
const data = await $fetch('/api/user');

// 适合：非响应式的一次性请求
const submitForm = async () => {
  const result = await $fetch('/api/submit', {
    method: 'POST',
    body: formData
  });
};

// 区别总结
/*
方法            | 响应式 | 缓存 | 适用场景
------------------------------------------
useFetch       | ✅     | ✅  | 推荐使用，功能最全
useAsyncData   | ✅     | ✅  | 自定义获取逻辑
$fetch         | ❌     | ❌  | 一次性请求、非响应式
fetch (原生)  | ❌     | ❌  | 原生API
*/
</script>
```

### 2. Nuxt目录结构

#### 问题3：Nuxt的目录约定是什么？

```
nuxt-app/
├── .nuxt/           // Nuxt自动生成的文件（不要修改）
├── assets/          // 静态资源（CSS、图片等）
│   └── main.css
├── components/      // 组件（自动导入，无需import）
│   └── Header.vue
├── composables/     // 组合式函数（自动导入）
│   └── useUser.ts
├── layouts/         // 布局组件
│   ├── default.vue  // 默认布局
│   └── custom.vue   // 自定义布局
├── middleware/      // 中间件（路由守卫）
│   └── auth.ts
├── pages/           // 页面（基于文件的路由）
│   ├── index.vue    // /
│   └── about.vue    // /about
├── plugins/         // Nuxt插件
│   └── vue-gtag.ts
├── public/          // 静态文件（直接映射到根路径）
│   ├── favicon.ico
│   └── robots.txt
├── server/          // 服务端代码
│   ├── api/         // API路由
│   │   └── hello.ts // /api/hello
│   └── plugins/     // 服务端插件
└── nuxt.config.ts   // Nuxt配置文件
```

**自动导入功能：**

```vue
<!-- components/Header.vue -->
<template>
  <header>Nuxt App</header>
</template>

<!-- pages/index.vue -->
<template>
  <!-- 自动导入，无需import -->
  <Header />
</template>

<!-- composables/useUser.ts -->
export const useUser = () => {
  return useState('user', () => null);
};

<!-- pages/index.vue -->
<script setup>
// 自动导入，无需import
const user = useUser();
</script>
```

### 3. Nuxt路由系统

#### 问题4：如何使用动态路由和路由参数？

```vue
<!-- 1. 动态路由 -->
<!-- pages/posts/[id].vue -->
<script setup>
// 获取路由参数
const route = useRoute();
const postId = route.params.id;

// 监听路由变化
watch(() => route.params.id, (newId) => {
  console.log('ID变化:', newId);
});
</script>

<template>
  <div>Post ID: {{ postId }}</div>
</template>

<!-- 2. 捕获所有路由 -->
<!-- pages/[...slug].vue -->
<script setup>
const route = useRoute();
const slug = route.params.slug; // 数组

const fullPath = slug.join('/');
</script>

<template>
  <div>Slug: {{ fullPath }}</div>
</template>

<!-- 3. 嵌套路由 -->
<!-- pages/parent.vue -->
<template>
  <div>
    <h1>Parent</h1>
    <!-- 子路由渲染位置 -->
    <NuxtPage />
  </div>
</template>

<!-- pages/parent/child.vue -->
<template>
  <div>Child Content</div>
</template>

<!-- 4. 编程式导航 -->
<script setup>
const router = useRouter();

const navigateToPost = () => {
  // 导航到动态路由
  router.push('/posts/123');
};

const navigateWithQuery = () => {
  // 带查询参数
  router.push({ path: '/search', query: { q: 'nuxt' } });
};

const replaceRoute = () => {
  // 替换当前路由
  router.replace('/about');
};

const goBack = () => {
  router.back();
};

const goForward = () => {
  router.forward();
};
</script>

<!-- 5. 路由中间件 -->
<!-- middleware/auth.ts -->
export default defineNuxtRouteMiddleware((to, from) => {
  const isAuthenticated = useCookie('token').value;

  // 未登录重定向到登录页
  if (!isAuthenticated && to.path !== '/login') {
    return navigateTo('/login');
  }
});

<!-- pages/dashboard.vue -->
<script setup>
// 使用中间件
definePageMeta({
  middleware: ['auth']
});
</script>

<!-- 全局中间件 -->
<!-- middleware/global.ts -->
export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path === '/admin') {
    // 全局路由守卫
  }
});
```

### 4. Nuxt状态管理

#### 问题5：Nuxt中使用Pinia的最佳实践？

```typescript
// stores/user.ts
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),

  getters: {
    // 用户名
    userName: (state) => state.user?.name || 'Guest',

    // 是否已登录
    isLoggedIn: (state) => !!state.token,

    // 用户权限
    permissions: (state) => state.user?.permissions || []
  },

  actions: {
    // 登录
    async login(credentials: LoginCredentials) {
      const { data } = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      });

      this.user = data.user;
      this.token = data.token;
      this.isAuthenticated = true;

      // 保存到cookie（SSR友好）
      const cookie = useCookie('token');
      cookie.value = data.token;
    },

    // 登出
    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;

      const cookie = useCookie('token');
      cookie.value = null;
    },

    // 获取用户信息
    async fetchUser() {
      if (!this.token) return;

      try {
        const { data } = await $fetch('/api/user', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });

        this.user = data;
      } catch (error) {
        this.logout();
      }
    }
  }
});

// 在组件中使用
<script setup>
import { storeToRefs } from 'pinia';

const userStore = useUserStore();

// ✅ 保持响应性
const { user, isAuthenticated } = storeToRefs(userStore);

// ✅ actions可以直接解构
const { login, logout } = userStore;

// 初始化时获取用户信息
onMounted(() => {
  userStore.fetchUser();
});
</script>

<template>
  <div v-if="isAuthenticated">
    Welcome, {{ user?.name }}!
    <button @click="logout">登出</button>
  </div>
  <div v-else>
    <button @click="login({ username, password })">
      登录
    </button>
  </div>
</template>
```

### 5. Nuxt服务端渲染

#### 问题6：如何实现SSR和SSG？

```vue
<!-- SSR（服务端渲染）- 默认模式 -->
<!-- pages/products/[id].vue -->
<script setup>
// 每次请求都在服务器端执行
const { data } = await useFetch('/api/products/' + useRoute().params.id);

// 需要请求上下文时使用useAsyncData
const { data: product } = await useAsyncData(
  'product',
  () => $fetch('/api/products/' + useRoute().params.id),
  {
    // 默认在服务器端执行
    server: true
  }
);
</script>

<!-- SSG（静态站点生成） -->
<!-- pages/index.vue -->
<script setup>
// 使用definePageMeta配置SSG
definePageMeta({
  // 静态生成
  static: true
});

// 或使用useStatic
const { data } = await useAsyncData(
  'posts',
  () => $fetch('/api/posts'),
  {
    // 不缓存，每次重新生成
    server: false
  }
);
</script>

<!-- ISR（增量静态再生成） -->
<script setup>
const { data } = await useFetch('/api/posts', {
  // 重新验证时间（秒）
  getCachedData: (key) => useNuxtData().get(key),
  setCachedData: (key, value) => useNuxtData().set(key, value),

  // 或使用next选项（类似Next.js）
  // Nuxt 3中通过Cache控制
});
</script>

<!-- 混合渲染 -->
<!-- nuxt.config.ts -->
export default defineNuxtConfig({
  routeRules: {
    // 静态页面
    '/': { prerender: true },
    '/about': { prerender: true },

    // ISR：每小时重新生成
    '/blog/**': { isr: 3600 },

    // SWR：先显示缓存，后台更新
    '/products/**': { swr: 60 },

    // SSR：每次都请求
    '/api/**': { ssr: false },

    // SPA：客户端渲染
    '/app/**': { ssr: false }
  }
});
```

### 6. Nuxt组合式函数

#### 问题7：常用的Nuxt Composables有哪些？

```vue
<script setup>
// 1. useAsyncData - 数据获取
const { data, pending, error, refresh } = await useAsyncData(
  'users',
  () => $fetch('/api/users')
);

// 2. useFetch - 更强大的数据获取
const { data } = await useFetch('/api/users', {
  query: { page: 1 },
  headers: { 'Authorization': 'Bearer token' }
});

// 3. useRouter - 路由实例
const router = useRouter();
router.push('/about');

// 4. useRoute - 当前路由
const route = useRoute();
const params = route.params;

// 5. useHead - 设置页面head
useHead({
  title: 'My App',
  meta: [
    { name: 'description', content: 'My amazing app' },
    { property: 'og:title', content: 'My App' }
  ]
});

// 6. useSeoMeta - SEO优化
useSeoMeta({
  title: 'My Page',
  description: 'Page description',
  ogTitle: 'My Page',
  ogDescription: 'Page description',
  ogImage: '/image.png'
});

// 7. useState - 跨组件共享状态（SSR友好）
const counter = useState('counter', () => 0);
// 自动水合，服务端和客户端状态一致

// 8. useCookie - Cookie操作
const token = useCookie('token');
token.value = 'abc123'; // 设置cookie
const tokenValue = token.value; // 读取cookie

// 9. useLazyFetch - 懒加载
const { data } = await useLazyFetch('/api/heavy');
// 等到数据需要时才获取

// 10. useLazyAsyncData - 懒加载数据
const { data } = await useLazyAsyncData(
  'user',
  () => $fetch('/api/user')
);
// 悬停到组件上才加载

// 11. useRuntimeConfig - 运行时配置
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// 12. useAppConfig - 应用配置
const appConfig = useAppConfig();
const theme = appConfig.theme;

// 13. useNuxtApp - Nuxt应用实例
const nuxtApp = useNuxtApp();
nuxtApp.provide('myFunction', () => {});

// 14. useError - 错误处理
const error = useError();
throw createError({
  statusCode: 404,
  statusMessage: 'Page Not Found'
});

// 15. useRequestHeaders - 请求头
const headers = useRequestHeaders();
const userAgent = headers['user-agent'];

// 16. useRequestFetch - 获取fetch实例
const event = useRequestFetch();
</script>
```

### 7. Nuxt插件系统

#### 问题8：如何创建和使用Nuxt插件？

```typescript
// 1. Vue插件
// plugins/vue-gtag.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Gtag, {
    id: 'GA_MEASUREMENT_ID'
  });
});

// 2. 注入配置
// plugins/api.ts
export default defineNuxtPlugin(() => {
  const apiBaseUrl = 'https://api.example.com';

  return {
    provide: {
      api: {
        async get(endpoint: string) {
          return $fetch(apiBaseUrl + endpoint);
        }
      }
    }
  };
});

// 在组件中使用
<script setup>
const { api } = useNuxtApp();
const data = await api.get('/users');
</script>

// 3. 服务端插件
// server/plugins/db.ts
export default defineNitroPlugin(() => {
  const prisma = new PrismaClient();

  // 注入到context
  nitroApp.context.prisma = prisma;

  // 清理
  nitroApp.hooks.hook('close', async () => {
    await prisma.$disconnect();
  });
});

// 4. 组合式函数作为插件
// composables/useLogger.ts
export const provideLogger = () => {
  const logger = {
    info: (message: string) => console.log('[INFO]', message),
    error: (message: string) => console.error('[ERROR]', message)
  };

  return {
    logger
  };
};

// plugins/logger.ts
export default defineNuxtPlugin({
  setup() {
    const { logger } = provideLogger();

    return {
      provide: {
        logger
      }
    };
  }
});

// 5. 带选项的插件
// plugins/my-plugin.ts
interface PluginOptions {
  apiKey: string;
  debug?: boolean;
}

export default defineNuxtPlugin<PluginOptions>((nuxtApp, options) => {
  console.log('API Key:', options.apiKey);
  console.log('Debug:', options.debug);
});

// nuxt.config.ts
export default defineNuxtConfig({
  modules: [],
  myPlugin: {
    apiKey: 'xxx',
    debug: true
  }
});
```

### 8. Nuxt常见面试题总结

**Q: Nuxt和Next.js有什么区别？**
- Nuxt基于Vue，Next.js基于React
- Nuxt自动导入更强大
- Nuxt的组合式函数更丰富
- Nuxt的TypeScript集成更深入

**Q: 什么时候应该使用Nuxt？**
- 需要SEO的项目
- 需要SSR的项目
- 全栈Vue3应用
- 企业级应用

**Q: useState和ref的区别？**
- useState：跨组件共享状态，SSR友好
- ref：组件内状态
- useState自动水合

---

**参考资源：**

- [Nuxt官方文档](https://nuxt.com)
- [Nuxt 3核心特性](https://nuxt.com/docs/getting-started/introduction)
- [Nuxt服务端渲染](https://nuxt.com/docs/guide/concepts/rendering)

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
