# 页面与布局系统

## 页面与布局系统

> **为什么要学这一章？**
>
> Nuxt 3 的布局系统让你可以为不同页面定义不同的外观和结构，实现代码复用和统一管理。掌握布局系统能让你更高效地构建多主题、多风格的复杂应用。
>
> **学习目标**：
>
> - 理解 Nuxt 的布局系统原理
> - 掌握创建和使用自定义布局
> - 学会动态切换布局
> - 理解页面和布局的交互方式

---

### 页面组件基础

#### app.vue vs pages

Nuxt 3 中有两种组织页面的方式：

##### 方式1：使用 app.vue（推荐）

```vue
<!-- app.vue -->
<template>
  <div>
    <!-- 顶部导航栏（全局） -->
    <NavBar />

    <!-- 页面内容（动态） -->
    <NuxtPage />

    <!-- 页脚（全局） -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
// app.vue 是应用的根组件
// NuxtPage 会根据当前路由渲染对应的 pages/ 组件
</script>

<style>
/* 全局样式 */
</style>
```

##### 方式2：使用 layouts/ 系统

```bash
layouts/
├── default.vue
├── blog.vue
└── admin.vue
```

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <Header />
    <slot />
    <Footer />
  </div>
</template>
```

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1>首页内容</h1>
    <!-- 内容会被插入到 default.vue 的 slot 中 -->
  </div>
</template>

<script setup lang="ts>
// 使用 default 布局（默认）
</script>
```

---

### 布局系统详解

#### 创建布局

```vue
<!-- layouts/default.vue -->
<template>
  <div class="default-layout">
    <!-- 固定头部 -->
    <header class="header">
      <nav>
        <NuxtLink to="/">首页</NuxtLink>
        <NuxtLink to="/about">关于</NuxtLink>
        <NuxtLink to="/blog">博客</NuxtLink>
      </nav>
    </header>

    <!-- 主要内容区（页面内容会被插入这里） -->
    <main class="main-content">
      <slot />
    </main>

    <!-- 固定页脚 -->
    <footer class="footer">
      <p>&copy; 2024 My App. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 布局可以有自己的逻辑
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #333;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header nav {
  display: flex;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.header nav a:hover,
.header nav a.router-link-active {
  color: #667eea;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.footer {
  background: #f5f5f5;
  padding: 2rem;
  text-align: center;
  color: #666;
}
</style>
```

#### 博客专用布局

```vue
<!-- layouts/blog.vue -->
<template>
  <div class="blog-layout">
    <!-- 博客头部 -->
    <header class="blog-header">
      <div class="container">
        <h1>我的技术博客</h1>
        <p>分享技术，记录成长</p>
      </div>
    </header>

    <!-- 导航 -->
    <nav class="blog-nav">
      <div class="container">
        <NuxtLink to="/blog">首页</NuxtLink>
        <NuxtLink to="/blog/categories">分类</NuxtLink>
        <NuxtLink to="/blog/about">关于</NuxtLink>
      </div>
    </nav>

    <!-- 主要内容 -->
    <div class="blog-body">
      <div class="container">
        <!-- 主内容区 -->
        <main class="blog-main">
          <slot />
        </main>

        <!-- 侧边栏 -->
        <aside class="blog-sidebar">
          <BlogSearch />
          <BlogCategories />
          <BlogRecentPosts />
          <BlogTags />
        </aside>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="blog-footer">
      <div class="container">
        <p>&copy; {{ currentYear }} 我的博客. Powered by Nuxt 3</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.blog-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.blog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0;
  text-align: center;
}

.blog-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.blog-header p {
  font-size: 1.125rem;
  opacity: 0.9;
}

.blog-nav {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.blog-nav .container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
}

.blog-nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.blog-nav a:hover,
.blog-nav a.router-link-active {
  background: #667eea;
  color: white;
}

.blog-body {
  flex: 1;
  padding: 2rem 0;
}

.blog-body .container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.blog-main {
  min-height: 500px;
}

.blog-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.blog-footer {
  background: #333;
  color: white;
  padding: 2rem 0;
  text-align: center;
}

@media (max-width: 768px) {
  .blog-body .container {
    grid-template-columns: 1fr;
  }

  .blog-sidebar {
    order: 2;
  }
}
</style>
```

#### 管理后台布局

```vue
<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h2 v-if="!sidebarCollapsed">管理后台</h2>
        <button @click="toggleSidebar" class="toggle-btn">
          {{ sidebarCollapsed ? '→' : '←' }}
        </button>
      </div>

      <nav class="sidebar-nav">
        <AdminNavItem icon="📊" to="/admin/dashboard" label="仪表盘" />
        <AdminNavItem icon="📝" to="/admin/posts" label="文章管理" />
        <AdminNavItem icon="👥" to="/admin/users" label="用户管理" />
        <AdminNavItem icon="⚙️" to="/admin/settings" label="系统设置" />
      </nav>
    </aside>

    <!-- 主内容区 -->
    <div class="admin-main">
      <!-- 顶部栏 -->
      <header class="admin-header">
        <div class="breadcrumb">
          <span v-for="(item, index) in breadcrumbs" :key="index">
            {{ item }}
            <span v-if="index < breadcrumbs.length - 1"> / </span>
          </span>
        </div>

        <div class="user-menu">
          <span>{{ user?.name }}</span>
          <button @click="logout">退出</button>
        </div>
      </header>

      <!-- 内容 -->
      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const sidebarCollapsed = ref(false)

const breadcrumbs = computed(() => {
  const route = useRoute()
  return route.path.split('/').filter(Boolean)
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb {
  color: #666;
}

.user-menu {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-menu button {
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.admin-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>
```

---

### 使用布局

#### 在页面中指定布局

```vue
<!-- pages/blog/index.vue -->
<template>
  <div>
    <h1>博客列表</h1>
    <!-- ... -->
  </div>
</template>

<script setup lang="ts">
// 方式1：使用 definePageMeta
definePageMeta({
  layout: 'blog'
})

// 方式2：使用字符串
// definePageMeta({
//   layout: 'blog',
// })
</script>
```

```vue
<!-- pages/admin/dashboard.vue -->
<template>
  <div>
    <h1>管理仪表盘</h1>
    <!-- ... -->
  </div>
</template>

<script setup lang="ts>
definePageMeta({
  layout: 'admin',
  // 添加中间件
  middleware: ['auth', 'admin']
})
</script>
```

#### 动态切换布局

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <button @click="toggleLayout">切换布局</button>

    <h1>当前布局: {{ currentLayout }}</h1>
  </div>
</template>

<script setup lang="ts>
const layout = useState('layout', () => 'default')

const currentLayout = computed(() => layout.value)

// 设置布局
definePageMeta({
  layout: (layout) => layout.value
})

const toggleLayout = () => {
  layout.value = layout.value === 'default' ? 'blog' : 'default'
}
</script>
```

#### 禁用布局

```vue
<!-- pages/login.vue -->
<template>
  <div class="login-page">
    <h1>登录</h1>
    <!-- 登录表单 -->
  </div>
</template>

<script setup lang="ts>
// 使用空白布局（登录页等）
definePageMeta({
  layout: false
})
</script>
```

---

### 布局与页面交互

#### 向布局传递 Props

```vue
<!-- layouts/default.vue -->
<template>
  <div class="layout">
    <Header :show-sidebar="showSidebar" />

    <main>
      <slot />
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
// 定义 props
const props = defineProps({
  showSidebar: {
    type: Boolean,
    default: true
  }
})
</script>
```

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1>首页</h1>
  </div>
</template>

<script setup lang="ts">
// 不能直接传递 props 到布局
// 需要通过 definePageMeta
definePageMeta({
  layout: 'default',
  layoutProps: {
    showSidebar: false
  }
})
</script>
```

#### 使用布局插槽

```vue
<!-- layouts/default.vue -->
<template>
  <div class="layout">
    <!-- 顶部插槽 -->
    <div v-if="$slots.top" class="layout-top">
      <slot name="top" />
    </div>

    <!-- 默认插槽 -->
    <main class="layout-main">
      <slot />
    </main>

    <!-- 底部插槽 -->
    <div v-if="$slots.bottom" class="layout-bottom">
      <slot name="bottom" />
    </div>
  </div>
</template>
```

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <template #top>
      <div class="announcement">
        🎉 欢迎来到我们的网站！
      </div>
    </template>

    <h1>首页内容</h1>

    <template #bottom>
      <div class="promo">
        立即注册，享受优惠！
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>
```

---

### 实战案例：多布局应用

#### 项目结构

```bash
layouts/
├── default.vue               # 默认布局
├── blog.vue                  # 博客布局
├── admin.vue                 # 管理后台布局
└── empty.vue                 # 空白布局（登录页等）

pages/
├── index.vue                 # 使用 default 布局
├── blog/
│   ├── index.vue             # 使用 blog 布局
│   └── [slug].vue            # 使用 blog 布局
├── admin/
│   ├── dashboard.vue         # 使用 admin 布局
│   └── login.vue             # 使用 empty 布局
└── about.vue                 # 使用 default 布局
```

#### 完整布局示例

```vue
<!-- layouts/empty.vue -->
<template>
  <div class="empty-layout">
    <slot />
  </div>
</template>

<style scoped>
.empty-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
```

#### 响应式布局

```vue
<!-- layouts/default.vue -->
<template>
  <div class="responsive-layout">
    <!-- 移动端导航 -->
    <nav v-if="isMobile" class="mobile-nav">
      <button @click="mobileMenuOpen = !mobileMenuOpen">
        ☰
      </button>

      <div v-if="mobileMenuOpen" class="mobile-menu">
        <NuxtLink to="/" @click="mobileMenuOpen = false">首页</NuxtLink>
        <NuxtLink to="/about" @click="mobileMenuOpen = false">关于</NuxtLink>
        <NuxtLink to="/blog" @click="mobileMenuOpen = false">博客</NuxtLink>
      </div>
    </nav>

    <!-- 桌面端导航 -->
    <nav v-else class="desktop-nav">
      <NuxtLink to="/">首页</NuxtLink>
      <NuxtLink to="/about">关于</NuxtLink>
      <NuxtLink to="/blog">博客</NuxtLink>
    </nav>

    <!-- 主要内容 -->
    <main class="content">
      <slot />
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <p>&copy; {{ currentYear }} My App</p>
    </footer>
  </div>
</template>

<script setup lang="ts>
const isMobile = ref(false)
const mobileMenuOpen = ref(false)

// 检测屏幕尺寸
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.responsive-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.mobile-nav {
  position: sticky;
  top: 0;
  background: #333;
  padding: 1rem;
  z-index: 100;
}

.mobile-nav button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.mobile-menu a {
  color: white;
  text-decoration: none;
  padding: 0.5rem;
}

.desktop-nav {
  background: #333;
  padding: 1rem 2rem;
  display: flex;
  gap: 2rem;
}

.desktop-nav a {
  color: white;
  text-decoration: none;
}

.content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  background: #f5f5f5;
  padding: 2rem;
  text-align: center;
}

@media (min-width: 768px) {
  .mobile-nav {
    display: none;
  }
}

@media (max-width: 767px) {
  .desktop-nav {
    display: none;
  }
}
</style>
```

---

### 本章小结

#### 布局系统速查表

| 布局类型 | 文件名 | 使用场景 | 指定方式 |
|---------|-------|---------|---------|
| **默认布局** | `default.vue` | 大部分页面 | 默认使用 |
| **专用布局** | `blog.vue` | 特定功能页面 | `definePageMeta({ layout: 'blog' })` |
| **空白布局** | `empty.vue` | 登录页等 | `definePageMeta({ layout: 'empty' })` |
| **禁用布局** | - | 特殊页面 | `definePageMeta({ layout: false })` |

#### 布局选择指南

```javascript
// 选择布局的决策树
if (页面类型 === '登录/注册') {
  使用 empty.vue 布局
} else if (页面类型 === '博客相关') {
  使用 blog.vue 布局
} else if (页面类型 === '管理后台') {
  使用 admin.vue 布局
} else {
  使用 default.vue 布局
}
```

#### 最佳实践

1. **布局复用**：提取公共部分到布局
2. **响应式设计**：布局应该适配各种屏幕
3. **性能优化**：避免布局中有过重逻辑
4. **SEO 优化**：布局中应该包含 meta 标签
5. **可访问性**：确保布局符合 WCAG 标准

---

**下一步学习**: 建议继续学习[组件与自动化导入](./chapter-115)深入了解Nuxt的组件系统。
