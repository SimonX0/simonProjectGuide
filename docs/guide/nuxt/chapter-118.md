# useRoute与useRouter

## useRoute与useRouter

> **为什么要学这一章?**
>
> Nuxt 3 基于文件系统自动生成路由,但在实际应用中,我们经常需要编程式导航、获取路由参数、处理路由守卫等操作。`useRoute` 和 `useRouter` 是实现这些功能的核心Composable,掌握它们能让你构建更灵活的单页应用。
>
> **学习目标**:
>
> - 掌握 useRoute 获取路由信息的方法
> - 熟练使用 useRouter 进行编程式导航
> - 理解路由参数和查询参数的处理
> - 学会使用路由守卫和中间件
> - 能够构建完整的导航系统

---

### 路由 Hook 详解

#### useRoute - 获取当前路由信息

`useRoute` 返回当前路由对象,包含路由的所有信息:

```vue
<template>
  <div>
    <h1>路由信息</h1>
    <pre>{{ routeInfo }}</pre>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// 路由信息
const routeInfo = computed(() => ({
  // 路由路径
  path: route.path,

  // 完整URL(包含查询参数)
  fullPath: route.fullPath,

  // 路由名称
  name: route.name,

  // 路由参数(/user/:id)
  params: route.params,

  // 查询参数(?page=1)
  query: route.query,

  // 哈希(#section)
  hash: route.hash,

  // 是否匹配当前路由
  matched: route.matched,

  // 元数据
  meta: route.meta
}))
</script>
```

#### useRouter - 路由导航

`useRouter` 返回路由实例,用于编程式导航:

```vue
<template>
  <div>
    <button @click="goToHome">首页</button>
    <button @click="goToUser(1)">用户1</button>
    <button @click="goBack">返回</button>
    <button @click="goForward">前进</button>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

// 导航到指定路径
const goToHome = () => {
  router.push('/')
}

// 导航到命名路由
const goToUser = (id: number) => {
  router.push({ name: 'user-id', params: { id } })
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 前进到下一页
const goForward = () => {
  router.go(1)
}
</script>
```

---

### 编程式导航

#### 基础导航方法

```vue
<template>
  <div class="navigation-demo">
    <h1>编程式导航示例</h1>

    <div class="button-group">
      <button @click="navigateToPath">路径导航</button>
      <button @click="navigateToObject">对象导航</button>
      <button @click="navigateToNamed">命名路由</button>
    </div>

    <div class="info">
      <p>当前路由: {{ route.path }}</p>
      <p>完整路径: {{ route.fullPath }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()

// 1. 字符串路径
const navigateToPath = () => {
  router.push('/about')
}

// 2. 对象形式
const navigateToObject = () => {
  router.push({
    path: '/user/123',
    query: { tab: 'profile' }
  })
}

// 3. 命名路由
const navigateToNamed = () => {
  router.push({
    name: 'user-id',
    params: { id: '456' },
    query: { tab: 'posts' }
  })
}
</script>
```

#### 带参数的导航

```vue
<template>
  <div>
    <!-- 表单 -->
    <form @submit.prevent="handleSubmit">
      <input v-model="searchQuery" type="text" placeholder="搜索..." />
      <select v-model="category">
        <option value="">全部分类</option>
        <option value="tech">技术</option>
        <option value="life">生活</option>
      </select>
      <button type="submit">搜索</button>
    </form>

    <!-- 导航到详情页 -->
    <button @click="viewPost(post.id)">查看详情</button>

    <!-- 替换当前路由 -->
    <button @click="replaceRoute">替换路由</button>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const searchQuery = ref('')
const category = ref('')

// 提交搜索(更新查询参数)
const handleSubmit = () => {
  router.push({
    path: '/search',
    query: {
      q: searchQuery.value,
      category: category.value
    }
  })
}

// 查看详情(带参数)
const viewPost = (id: number) => {
  router.push({
    name: 'blog-post-id',
    params: { id: id.toString() }
  })
}

// 替换当前路由(不添加历史记录)
const replaceRoute = () => {
  router.replace({
    path: '/login',
    query: { redirect: route.fullPath }
  })
}
</script>
```

#### 导航选项

```vue
<script setup lang="ts>
const router = useRouter()

// 导航到指定路由
const navigateWithOptions = async () => {
  await router.push({
    path: '/dashboard',
    query: { tab: 'settings' }
  })

  // 导航成功后执行
  console.log('导航完成')
}

// 带选项的导航
const navigateWithBehavior = () => {
  router.push({
    path: '/about',
    force: true // 强制导航,即使路由相同
  })

  // 或者使用 scrollBehavior
  router.push({
    path: '/about',
    scrollBehavior: (to, from, savedPosition) => {
      // 保存的滚动位置
      if (savedPosition) {
        return savedPosition
      }

      // 滚动到锚点
      if (to.hash) {
        return {
          el: to.hash,
          behavior: 'smooth'
        }
      }

      // 滚动到顶部
      return { top: 0, behavior: 'smooth' }
    }
  })
}
</script>
```

---

### 路由参数

#### 动态路由参数

```vue
<!-- pages/user/[id].vue -->
<template>
  <div class="user-profile">
    <h1>用户资料</h1>
    <p>用户ID: {{ userId }}</p>

    <!-- 嵌套参数 -->
    <div v-if="route.params.tab">
      当前标签: {{ route.params.tab }}
    </div>

    <!-- 监听参数变化 -->
    <div>变化次数: {{ changeCount }}</div>
  </div>
</template>

<script setup lang="ts>
const route = useRoute()
const router = useRouter()

// 获取路由参数
const userId = computed(() => route.params.id)
const changeCount = ref(0)

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    console.log(`用户ID从 ${oldId} 变为 ${newId}`)
    changeCount.value++

    // 重新获取数据
    fetchUserData(newId as string)
  }
)

// 获取用户数据
const { data: user } = await useFetch(
  () => `/api/users/${route.params.id}`
)

const fetchUserData = async (id: string) => {
  const { data, error } = await useFetch(`/api/users/${id}`)

  if (!error.value) {
    console.log('用户数据:', data.value)
  }
}

// 设置页面元数据
useHead({
  title: computed(() => `用户 ${userId.value}`)
})
</script>
```

#### 查询参数

```vue
<!-- pages/search/index.vue -->
<template>
  <div class="search-page">
    <h1>搜索结果</h1>

    <!-- 搜索表单 -->
    <form @submit.prevent="handleSearch" class="search-form">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索关键词..."
      />
      <select v-model="filters.category">
        <option value="">全部分类</option>
        <option value="tech">技术</option>
        <option value="life">生活</option>
      </select>
      <select v-model="filters.sort">
        <option value="relevance">相关度</option>
        <option value="date">日期</option>
        <option value="popularity">热度</option>
      </select>
      <button type="submit">搜索</button>
    </form>

    <!-- 搜索结果 -->
    <div v-if="pending" class="loading">搜索中...</div>
    <div v-else-if="results" class="results">
      <div v-for="result in results.items" :key="result.id" class="result-item">
        <h3>{{ result.title }}</h3>
        <p>{{ result.excerpt }}</p>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        <span>第 {{ currentPage }} 页</span>
        <button
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts>
const route = useRoute()
const router = useRouter()

// 从URL获取查询参数
const searchQuery = ref((route.query.q as string) || '')
const currentPage = computed(() => Number(route.query.page) || 1)

// 过滤器
const filters = reactive({
  category: (route.query.category as string) || '',
  sort: (route.query.sort as string) || 'relevance'
})

// 获取搜索结果
const { data: results, pending } = await useFetch(
  () => '/api/search',
  {
    query: computed(() => ({
      q: searchQuery.value,
      page: currentPage.value,
      category: filters.category,
      sort: filters.sort
    })),

    // 监听查询参数变化
    watch: [searchQuery, currentPage, filters]
  }
)

const totalPages = computed(() => results.value?.totalPages || 1)

// 执行搜索
const handleSearch = () => {
  // 更新URL查询参数
  router.push({
    query: {
      q: searchQuery.value,
      page: '1',
      category: filters.category || undefined,
      sort: filters.sort
    }
  })
}

// 切换页面
const changePage = (page: number) => {
  router.push({
    query: {
      ...route.query,
      page: page.toString()
    }
  })

  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 同步查询参数到表单
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.q) searchQuery.value = newQuery.q as string
    if (newQuery.category) filters.category = newQuery.category as string
    if (newQuery.sort) filters.sort = newQuery.sort as string
  }
)

// 设置页面标题
useHead({
  title: computed(() =>
    searchQuery.value ? `${searchQuery.value} - 搜索` : '搜索'
  )
})
</script>

<style scoped>
.search-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.search-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-form input,
.search-form select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-form button {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.results {
  margin-top: 2rem;
}

.result-item {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
```

#### 嵌套参数

```vue
<!-- pages/blog/[category]/[slug].vue -->
<template>
  <article>
    <!-- 分类 -->
    <p>分类: {{ category }}</p>

    <!-- 文章 slug -->
    <h1>{{ post?.title }}</h1>

    <!-- 面包屑导航 -->
    <nav class="breadcrumb">
      <NuxtLink to="/">首页</NuxtLink>
      <span>/</span>
      <NuxtLink :to="`/blog/${category}`">{{ category }}</NuxtLink>
      <span>/</span>
      <span>{{ slug }}</span>
    </nav>
  </article>
</template>

<script setup lang="ts>
const route = useRoute()

// 获取多个动态参数
const category = computed(() => route.params.category)
const slug = computed(() => route.params.slug)

// 根据参数获取数据
const { data: post } = await useFetch(
  () => `/api/blog/${category.value}/${slug.value}`
)

// 面包屑导航
const breadcrumb = computed(() => [
  { label: '首页', to: '/' },
  { label: category.value, to: `/blog/${category.value}` },
  { label: slug.value, to: route.fullPath }
])

useHead({
  title: computed(() => post.value?.title || '文章详情')
})
</script>
```

---

### 实战案例:导航系统

让我们构建一个完整的导航系统,包含顶部导航、侧边栏、面包屑等功能。

#### 1. 顶部导航栏

```vue
<!-- components/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="container">
      <!-- Logo -->
      <div class="logo">
        <NuxtLink to="/">
          <img src="/logo.png" alt="Logo" />
          <span>MyApp</span>
        </NuxtLink>
      </div>

      <!-- 主导航 -->
      <nav class="main-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: isActive(item.to) }"
        >
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- 用户菜单 -->
      <div class="user-menu">
        <button v-if="!user" @click="goToLogin">登录</button>
        <div v-else class="user-dropdown">
          <button @click="toggleDropdown">
            <img :src="user.avatar" :alt="user.name" />
            <span>{{ user.name }}</span>
          </button>

          <div v-show="showDropdown" class="dropdown-menu">
            <NuxtLink to="/profile">个人资料</NuxtLink>
            <NuxtLink to="/settings">设置</NuxtLink>
            <button @click="logout">退出登录</button>
          </div>
        </div>
      </div>

      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- 移动端菜单 -->
    <div v-show="showMobileMenu" class="mobile-menu">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        @click="showMobileMenu = false"
      >
        {{ item.label }}
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts>
const route = useRoute()
const router = useRouter()

// 导航项
const navItems = [
  { to: '/', label: '首页', icon: 'HomeIcon' },
  { to: '/blog', label: '博客', icon: 'BlogIcon' },
  { to: '/docs', label: '文档', icon: 'DocsIcon' },
  { to: '/about', label: '关于', icon: 'AboutIcon' }
]

// 用户信息
const { data: user } = await useLazyFetch('/api/user/me')

const showDropdown = ref(false)
const showMobileMenu = ref(false)

// 判断是否激活
const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

// 切换下拉菜单
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 切换移动端菜单
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// 登录
const goToLogin = () => {
  router.push({
    path: '/login',
    query: { redirect: route.fullPath }
  })
}

// 登出
const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await router.push('/login')
  showDropdown.value = false
}

// 点击外部关闭下拉菜单
onClickOutside(document.querySelector('.user-dropdown'), () => {
  showDropdown.value = false
})
</script>

<style scoped>
.app-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #333;
  font-weight: bold;
  font-size: 1.25rem;
}

.logo img {
  height: 32px;
}

.main-nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #666;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: #667eea;
  background: #f0f0f0;
}

.user-menu {
  position: relative;
}

.user-dropdown button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.user-dropdown img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
}

.dropdown-menu a,
.dropdown-menu button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #333;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}

.dropdown-menu a:hover,
.dropdown-menu button:hover {
  background: #f0f0f0;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
}

.mobile-menu-btn span {
  width: 24px;
  height: 2px;
  background: #333;
  transition: all 0.3s;
}

.mobile-menu {
  display: none;
  padding: 1rem;
  background: white;
  border-top: 1px solid #eee;
}

.mobile-menu a {
  display: block;
  padding: 0.75rem;
  text-decoration: none;
  color: #333;
}

@media (max-width: 768px) {
  .main-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-menu {
    display: block;
  }
}
</style>
```

#### 2. 面包屑导航

```vue
<!-- components/Breadcrumb.vue -->
<template>
  <nav class="breadcrumb" aria-label="面包屑导航">
    <ol class="breadcrumb-list">
      <li v-for="(item, index) in items" :key="index" class="breadcrumb-item">
        <NuxtLink v-if="item.to && index < items.length - 1" :to="item.to">
          {{ item.label }}
        </NuxtLink>
        <span v-else>{{ item.label }}</span>

        <span v-if="index < items.length - 1" class="separator">
          <ChevronRightIcon />
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts>
const route = useRoute()

// 面包屑数据
const items = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)

  const breadcrumbs = [{ label: '首页', to: '/' }]

  let currentPath = ''

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // 转换路由参数为可读文本
    const label = segment.startsWith(':')
      ? (route.params[segment.slice(1)] as string) || segment
      : segment

    breadcrumbs.push({
      label: formatLabel(label),
      to: index === pathSegments.length - 1 ? undefined : currentPath
    })
  })

  return breadcrumbs
})

// 格式化标签
const formatLabel = (label: string) => {
  return label
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style scoped>
.breadcrumb {
  padding: 1rem 2rem;
  background: #f5f5f5;
}

.breadcrumb-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-item a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb-item a:hover {
  color: #5568d3;
  text-decoration: underline;
}

.breadcrumb-item span {
  color: #666;
}

.separator {
  color: #999;
}
</style>
```

#### 3. 侧边栏导航

```vue
<!-- components/Sidebar.vue -->
<template>
  <aside class="sidebar">
    <!-- 导航分组 -->
    <div v-for="group in navGroups" :key="group.title" class="nav-group">
      <h3>{{ group.title }}</h3>

      <ul class="nav-list">
        <li v-for="item in group.items" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="nav-item"
            :class="{ active: isActive(item.to) }"
          >
            <component :is="item.icon" />
            <span>{{ item.label }}</span>

            <span v-if="item.badge" class="badge">{{ item.badge }}</span>
          </NuxtLink>

          <!-- 子菜单 -->
          <ul v-if="item.children && isActive(item.to)" class="sub-nav">
            <li v-for="child in item.children" :key="child.to">
              <NuxtLink
                :to="child.to"
                class="sub-nav-item"
                :class="{ active: isActive(child.to) }"
              >
                {{ child.label }}
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts>
const route = useRoute()

// 导航分组
const navGroups = [
  {
    title: '主菜单',
    items: [
      { to: '/dashboard', label: '仪表盘', icon: 'DashboardIcon' },
      {
        to: '/projects',
        label: '项目',
        icon: 'ProjectIcon',
        badge: '12',
        children: [
          { to: '/projects/active', label: '进行中' },
          { to: '/projects/completed', label: '已完成' }
        ]
      },
      { to: '/tasks', label: '任务', icon: 'TaskIcon', badge: '5' }
    ]
  },
  {
    title: '分析',
    items: [
      { to: '/analytics/traffic', label: '流量分析', icon: 'ChartIcon' },
      { to: '/analytics/performance', label: '性能分析', icon: 'GaugeIcon' }
    ]
  }
]

// 判断是否激活
const isActive = (path: string) => {
  return route.path.startsWith(path)
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: #2c3e50;
  color: white;
  overflow-y: auto;
  position: sticky;
  top: 0;
}

.nav-group {
  padding: 1.5rem 1rem;
}

.nav-group h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #95a5a6;
  margin: 0 0 0.75rem 0.75rem;
  letter-spacing: 0.05em;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  color: #ecf0f1;
  text-decoration: none;
  border-radius: 6px;
  margin-bottom: 0.25rem;
  transition: all 0.3s;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: #3498db;
  color: white;
}

.nav-item .badge {
  margin-left: auto;
  background: #e74c3c;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
}

.sub-nav {
  list-style: none;
  margin: 0.5rem 0 0 2.25rem;
  padding: 0;
}

.sub-nav-item {
  display: block;
  padding: 0.5rem 0.75rem;
  color: #bdc3c7;
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 0.125rem;
  transition: all 0.3s;
}

.sub-nav-item:hover,
.sub-nav-item.active {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}
</style>
```

#### 4. Tab 导航

```vue
<!-- components/TabNav.vue -->
<template>
  <div class="tab-nav">
    <div class="tab-list">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <component :is="tab.icon" />
        <span>{{ tab.label }}</span>
        <span v-if="tab.count" class="count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Tab 内容 -->
    <div class="tab-content">
      <slot :active-tab="activeTab" />
    </div>
  </div>
</template>

<script setup lang="ts>
const props = defineProps<{
  tabs: Array<{
    key: string
    label: string
    icon?: string
    count?: number
  }>
}>()

const route = useRoute()
const router = useRouter()

// 从URL查询参数获取当前tab
const activeTab = computed(() => {
  return (route.query.tab as string) || props.tabs[0].key
})

// 切换tab
const switchTab = (key: string) => {
  router.push({
    query: { ...route.query, tab: key }
  })
}
</script>

<style scoped>
.tab-nav {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.tab-list {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.tab-item:hover {
  background: #f5f5f5;
}

.tab-item.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-item .count {
  background: #f0f0f0;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
}

.tab-content {
  padding: 2rem;
}
</style>
```

---

### 路由过渡动画

```vue
<!-- app.vue -->
<template>
  <div>
    <NuxtPage />

    <!-- 页面过渡动画 -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts>
// 全局过渡配置
const pageTransition = {
  name: 'page',
  mode: 'out-in'
}
</script>

<style>
/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 布局过渡动画 */
.layout-enter-active,
.layout-leave-active {
  transition: all 0.4s ease;
}

.layout-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.layout-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
</style>
```

---

### 本章小结

#### 路由Hook对比

| Hook | 用途 | 返回值 |
|------|------|--------|
| `useRoute` | 获取当前路由信息 | 路由对象 |
| `useRouter` | 执行路由导航 | 路由实例 |
| `navigateTo` | 编程式导航助手 | Promise |

#### 导航方法对比

| 方法 | 说明 | 使用场景 |
|------|------|---------|
| `router.push()` | 导航到新路由 | 普通导航 |
| `router.replace()` | 替换当前路由 | 不添加历史记录 |
| `router.back()` | 返回上一页 | 后退导航 |
| `router.go()` | 前进/后退N步 | 精确控制历史 |
| `router.push({ query })` | 更新查询参数 | 过滤、搜索 |

#### 最佳实践

1. **优先使用声明式导航**: 简单场景用 `<NuxtLink>`
2. **合理使用路由参数**: params用于必选参数,query用于可选参数
3. **监听路由变化**: 使用watch响应参数变化
4. **提供导航反馈**: 加载状态、错误提示
5. **优化用户体验**: 过渡动画、滚动行为

---

**下一步学习**: 建议继续学习[useState与useCookie](./chapter-119)掌握Nuxt的状态管理功能。
