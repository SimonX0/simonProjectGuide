# 附录：Nuxt开发工具速查手册

> **Nuxt 4最新特性**
>
> 本附录基于Nuxt 4版本，提供：
> - Nuxt CLI命令完全指南
> - VSCode Nuxt开发配置
> - 部署命令速查

## 附录A：Nuxt CLI命令

### 🚀 项目创建

```bash
# 创建新项目（推荐方式）
npx nuxi@latest init <project-name>

# 交互式创建
npx nuxi@latest init

# 指定选项
npx nuxi@latest init my-app \
  --packageManager npm \
  --gitInit false \
  --npm

# 使用特定包管理器
npx nuxi@latest init my-app --packageManager pnpm
npx nuxi@latest init my-app --packageManager yarn
```

### 📦 项目结构

```
my-app/
├── .nuxt/                    # Nuxt缓存
├── assets/                   # 静态资源
├── components/               # 组件
│   └── app/                 # 应用组件
├── composables/              # 组合式函数
├── layouts/                   # 布局
│   ├── default.vue           # 默认布局
│   └── custom.vue            # 自定义布局
├── middleware/               # 中间件
├── pages/                    # 页面路由
│   └── index.vue             # 首页
├── plugins/                   # Nuxt插件
├── public/                   # 公共资源
├── server/                    # 服务端
│   ├── api/                   # API路由
│   └── middleware/           # 服务端中间件
├── types/                    # 类型定义
├── utils/                    # 工具函数
├── app.vue                   # 应用根组件
├── app.config.ts              # Nuxt配置
└── nuxt.config.ts             # Nuxt配置
```

### 🔧 开发命令

```bash
# 启动开发服务器
npm run dev

# 生成类型
npm run typecheck

# 生成Nuxt配置
npm run nuxi prepare

# 清除缓存
npm run nuxi clean
```

---

## 附录B：Nuxt CLI命令速查

| 命令 | 说明 | 频率 |
|------|------|------|
| `nuxi dev` | 启动开发服务器 | ⭐⭐⭐⭐⭐ |
| `nuxi build` | 生产构建 | ⭐⭐⭐⭐⭐ |
| `nuxi generate` | 生成静态站点 | ⭐⭐⭐⭐ |
| `nuxi preview` | 预览构建结果 | ⭐⭐⭐⭐ |
| `nuxi prepare` | 生成Nuxt配置 | ⭐⭐⭐⭐ |
| `nuxi clean` | 清除缓存 | ⭐⭐⭐ |

### 🎯 模块命令

```bash
# 安装模块
npm install @nuxtjs/axios

# 配置模块 (nuxt.config.ts)
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/tailwindcss',
  ],
})
```

---

## 附录C：Nuxt路由

### 📁 文件系统路由

```
pages/
├── index.vue             # 首页 (/)
├── about/
│   └── index.vue         # 关于页 (/about)
├── users/
│   ├── index.vue         # 用户列表 (/users)
│   └── [id]/
│       └── index.vue     # 用户详情 (/users/:id)
└── admin/
    └── [...slug].vue     # 捕获所有路由 (/admin/:path(*))
```

**动态路由示例：**
```vue
<!-- pages/users/[id]/index.vue -->
<script setup lang="ts">
const route = useRoute();
const { data } = await useFetch(`/api/users/${route.params.id}`);
</script>

<template>
  <div>
    <h1>{{ data.name }}</h1>
    <p>{{ data.email }}</p>
  </div>
</template>
```

---

## 附录D：Nuxt组合式函数

### 🔥 常用Composables

```typescript
// 获取数据
const { data, pending, error, refresh } = await useFetch('/api/data');

// 路由
const router = useRouter();
const route = useRoute();

// 状态管理
const count = ref(0);

// Cookie
const cookie = useCookie('token', 'default-value', {
  maxAge: 60 * 60 * 24 * 7, // 7天
  path: '/',
  sameSite: 'lax'
});

// localStorage
const stored = useLocalStorage('key', { foo: 'bar' });
```

---

## 附录E：Nuxt配置文件

### ⚙️ nuxt.config.ts

```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // ===== 应用配置 =====
  app: {
    head: {
      title: 'My App',
      meta: [
        { name: 'description', content: 'My Nuxt App' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // ===== 模块配置 =====
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/eslint',
  ],

  // ===== TailwindCSS配置 =====
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
  },

  // ===== Vite配置 =====
  vite: {
    build: {
      transpile: ['@nuxtjs/tailwindcss']
    }
  },

  // ===== 运行时配置 =====
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || '/api'
    }
  },
});
```

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
