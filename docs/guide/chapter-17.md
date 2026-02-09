# VueUse组合式函数库完全指南
## VueUse组合式函数库完全指南

> **2024-2026更新**：本章节已更新到 VueUse 11.0+，包含最新的组合式函数和 TypeScript 类型定义。

> **为什么要学VueUse？**
>
> VueUse是Vue3生态中最流行的组合式函数库，提供了200+ 实用工具函数。在实际项目中，使用VueUse可以：
> - 避免重复造轮子，提高开发效率
> - 学习组合式函数的最佳设计模式
> - 解决常见的开发场景
> - 代码质量高，经过充分测试
>
> **学习目标**：
> - 掌握VueUse核心函数的使用
> - 理解组合式函数的设计思路
> - 学会使用VueUse解决实际问题
> - 能够自己编写可复用的组合式函数

---

### VueUse简介与安装 {#vueuse简介与安装}

#### 什么是VueUse？

VueUse是一个基于Vue3 Composition API的组合式函数集合库，由Anthony Fu主导开发。

**核心特点**：
- ✅ **功能丰富**：200+ 实用函数
- ✅ **类型安全**：完整的TypeScript支持
- ✅ **框架无关**：可用于Vue 2.7+、Vue 3、Nuxt 3
- ✅ **Tree-shakable**：按需引入，打包体积小
- ✅ **轻量级**：核心库约10KB（gzipped）
- ✅ **高质量**：完整的测试覆盖
- ✅ **文档完善**：详细的API文档和示例

#### 安装VueUse

> **2024-2026更新**：VueUse 11.0+ 是当前最新版本，完全支持 Vue 3.4+ 和 TypeScript 5.3+。

```bash
# NPM
npm i @vueuse/core@latest

# Yarn
yarn add @vueuse/core@latest

# PNPM（推荐）
pnpm add @vueuse/core@latest

# 查看版本
npm list @vueuse/core
```

**VueUse 11.0+ 新特性（2024-2026）：**
- 🎯 完整的 TypeScript 5.3+ 类型支持
- ⚡ 性能优化：函数调用速度提升 20%
- 🔧 改进的响应式系统（兼容 Vue 3.4+）
- 📦 更小的打包体积（优化 Tree-shaking）
- 🛡️ 增强的类型推导和智能提示
- 🚀 支持 Vue 3.4+ 最新特性

#### 按需引入（推荐）

```javascript
// ✅ 推荐：按需引入
import { useLocalStorage, useMouse, useFetch } from '@vueuse/core'

// ❌ 不推荐：全量引入
import VueUse from '@vueuse/core'
```

#### 函数分类概览

VueUse的函数可以分为以下几类：

| 分类 | 函数数量 | 常用函数 |
|------|---------|---------|
| **State（状态）** | 30+ | useStorage, useAsyncState, useDebounce |
| **Elements（元素）** | 20+ | useIntersectionObserver, useElementSize |
| **Browser（浏览器）** | 40+ | useClipboard, usePreferredDark, useFullscreen |
| **Sensors（传感器）** | 30+ | useMouse, useScroll, useGeolocation |
| **Network（网络）** | 10+ | useFetch, useOnline |
| **Animation（动画）** | 15+ | useTransition, useSpring |
| **Utilities（工具）** | 30+ | useToggle, useInterval, useTimeout |
| **Components（组件）** | 20+ | useModal, useScrollLock |

---

### 核心函数详解 {#核心函数详解}

#### useStorage - 本地存储

响应式的localStorage/sessionStorage封装。

```vue
<script setup lang="ts">
import { useStorage } from '@vueuse/core'

// 基础用法：存储字符串
const name = useStorage('name', '张三')

// 存储对象
const user = useStorage('user', {
  id: 1,
  name: '李四',
  preferences: {
    theme: 'dark'
  }
})

// 存储数组
const todos = useStorage('todos', [])

// 添加待办
const addTodo = (text: string) => {
  todos.value.push({
    id: Date.now(),
    text,
    completed: false
  })
}

// 存储数字
const count = useStorage('count', 0)

// 自定义序列化
const data = useStorage('data', { foo: 'bar' }, undefined, {
  serializer: {
    read: (v: any) => v ? JSON.parse(v) : null,
    write: (v: any) => JSON.stringify(v)
  }
})
</script>

<template>
  <div>
    <input v-model="name" placeholder="输入名字">
    <p>你好，{{ name }}！</p>

    <div>
      <input v-model="user.name" placeholder="用户名">
      <p>用户：{{ user.name }}</p>
    </div>

    <div>
      <button @click="count++">计数：{{ count }}</button>
    </div>
  </div>
</template>
```

**实际应用场景**：
- 用户偏好设置（主题、语言等）
- 购物车数据
- 表单草稿保存
- Token缓存

#### useMouse - 鼠标追踪

追踪鼠标位置。

```vue
<script setup lang="ts">
import { useMouse } from '@vueuse/core'

// 基础用法：追踪整个页面的鼠标位置
const { x, y, sourceType } = useMouse()

// 追踪特定元素的鼠标位置
const target = ref<HTMLElement | null>(null)
const { x: elX, y: elY } = useMouse({ target })

// 触摸类型
// sourceType 可能是：'mouse' | 'touch' | 'pen'
</script>

<template>
  <div>
    <p>鼠标位置：({{ x }}, {{ y }})</p>
    <p>输入设备：{{ sourceType }}</p>

    <div ref="target" class="box">
      <p>元素内位置：({{ elX }}, {{ elY }})</p>
    </div>
  </div>
</template>

<style scoped>
.box {
  width: 300px;
  height: 200px;
  border: 2px solid #42b883;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

**实际应用场景**：
- 鼠标跟随效果
- 交互式图表
- 游戏开发
- 绘图应用

#### useIntersectionObserver - 滚动监听

检测元素是否进入视口。

```vue
<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const target = ref<HTMLElement | null>(null)
const isVisible = ref(false)

// 基础用法
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    isVisible.value = isIntersecting
  }
)

// 高级用法：配置选项
const {
  stop: stopAdvanced,
  isIntersecting,
  // 这里可以获取更多信息
} = useIntersectionObserver(
  target,
  ([entry]) => {
    console.log('元素可见性变化', entry)
  },
  {
    // 阈值：0.5表示元素50%可见时触发
    threshold: 0.5,
    // 根边距
    rootMargin: '0px 0px -100px 0px',
    // 视口元素
    root: null
  }
)

// 懒加载图片
const loadImages = () => {
  const images = document.querySelectorAll('img[data-src]')
  images.forEach(img => {
    useIntersectionObserver(
      ref(img as HTMLElement),
      ([{ isIntersecting }]) => {
        if (isIntersecting) {
          img.src = img.getAttribute('data-src')!
          img.removeAttribute('data-src')
        }
      }
    )
  })
}
</script>

<template>
  <div>
    <h2>滚动页面查看效果</h2>

    <div class="content">
      <!-- 大量内容撑开页面 -->
      <p v-for="i in 50" :key="i">内容 {{ i }}</p>
    </div>

    <div ref="target" class="observed-box">
      <p v-if="isVisible">✅ 元素已进入视口！</p>
      <p v-else>❌ 元素不在视口中</p>
    </div>
  </div>
</template>
```

**实际应用场景**：
- 图片懒加载
- 无限滚动加载
- 动画触发（滚动到视口时播放）
- 广告曝光统计

#### useClipboard - 剪贴板操作

响应式的剪贴板API。

```vue
<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const source = ref('Hello VueUse!')

const {
  text,      // 剪贴板内容（响应式）
  copy,      // 复制函数
  copied,    // 是否已复制（响应式）
  isSupported // 是否支持剪贴板API
} = useClipboard({ source })

// 复制到剪贴板
const handleCopy = async () => {
  try {
    await copy('要复制的内容')
    console.log('复制成功！')
  } catch (err) {
    console.error('复制失败', err)
  }
}

// 读取剪贴板
const readClipboard = async () => {
  try {
    const content = await navigator.clipboard.readText()
    console.log('剪贴板内容：', content)
  } catch (err) {
    console.error('读取失败', err)
  }
}
</script>

<template>
  <div>
    <p v-if="!isSupported">您的浏览器不支持剪贴板API</p>

    <div v-else>
      <input v-model="source" placeholder="输入要复制的内容">
      <button @click="copy()">复制</button>

      <p v-if="copied" style="color: green;">✅ 已复制！</p>

      <textarea v-model="text" placeholder="剪贴板内容"></textarea>
    </div>
  </div>
</template>
```

**实际应用场景**：
- 一键复制功能
- 代码块复制按钮
- 分享链接复制
- 密码生成器

#### useDebounceFn / useThrottleFn - 防抖节流

函数防抖和节流。

```vue
<script setup lang="ts">
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

// 防抖：延迟执行
const { debounceFn } = useDebounceFn(() => {
  console.log('防抖执行', Date.now())
}, 500)

// 节流：固定间隔执行
const { throttleFn } = useThrottleFn(() => {
  console.log('节流执行', Date.now())
}, 1000)

// 搜索框防抖
const searchQuery = ref('')
const debouncedSearch = useDebounceFn(() => {
  console.log('搜索：', searchQuery.value)
  // 执行搜索API请求
  performSearch(searchQuery.value)
}, 500)

// 监听输入
watch(searchQuery, () => {
  debouncedSearch()
})

// 窗口大小调整节流
const handleResize = useThrottleFn(() => {
  console.log('窗口大小改变', window.innerWidth)
}, 200)

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const performSearch = (query: string) => {
  // 实际的搜索逻辑
  console.log('执行搜索：', query)
}
</script>

<template>
  <div>
    <div>
      <h3>防抖示例</h3>
      <button @click="debounceFn()">点击我（防抖500ms）</button>
    </div>

    <div>
      <h3>节流示例</h3>
      <button @click="throttleFn()">点击我（节流1000ms）</button>
    </div>

    <div>
      <h3>搜索框防抖</h3>
      <input
        v-model="searchQuery"
        placeholder="输入搜索内容..."
      >
    </div>
  </div>
</template>
```

**实际应用场景**：
- 搜索框输入（防抖）
- 窗口resize（节流）
- 滚动事件（节流）
- 表单验证（防抖）

---

### 浏览器API封装

#### useLocalStorage

LocalStorage的响应式封装。

```vue
<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

// 基础用法
const count = useLocalStorage('count', 0)

// 存储复杂对象
const settings = useLocalStorage('settings', {
  theme: 'light',
  language: 'zh-CN',
  fontSize: 14
})

// 直接修改会自动保存
const toggleTheme = () => {
  settings.value.theme = settings.value.theme === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <div>
    <button @click="count++">计数：{{ count }}</button>

    <div>
      <p>当前主题：{{ settings.theme }}</p>
      <button @click="toggleTheme">切换主题</button>
    </div>
  </div>
</template>
```

#### useSessionStorage

SessionStorage的响应式封装（用法与useLocalStorage相同）。

```javascript
const data = useSessionStorage('session-data', { foo: 'bar' })
```

#### useCookie

操作浏览器Cookie。

```vue
<script setup lang="ts">
import { useCookie } from '@vueuse/core'

// 基础用法
const token = useCookie('token')
token.value = 'abc123' // 会自动设置cookie

// 带选项
const userCookie = useCookie('user', {
  expires: new Date('2025-12-31'),
  path: '/',
  secure: true,
  sameSite: 'Strict'
})

userCookie.value = JSON.stringify({
  id: 1,
  name: '张三'
})

// 读取cookie
const readCookie = () => {
  console.log('Token:', token.value)
  console.log('User:', JSON.parse(userCookie.value || '{}'))
}
</script>
```

#### usePreferredDark

检测系统主题偏好。

```vue
<script setup lang="ts">
import { usePreferredDark, useDark } from '@vueuse/core'

// 检测系统是否偏好深色模式
const isDark = usePreferredDark()

// 自动应用深色模式
const html = ref(document.documentElement)

watch(isDark, (dark) => {
  if (dark) {
    html.value.classList.add('dark')
  } else {
    html.value.classList.remove('dark')
  )
}, { immediate: true })

// 或者使用useDark组合式函数
const isDarkMode = useDark({
  selector: 'html', // 添加class的元素
  attribute: 'class', // 使用class还是data属性
  valueDark: 'dark', // 深色模式的class名
  valueLight: 'light' // 浅色模式的class名
})
</script>

<template>
  <div>
    <p>系统偏好深色模式：{{ isDark ? '是' : '否' }}</p>
    <p>当前模式：{{ isDarkMode ? '深色' : '浅色' }}</p>
  </div>
</template>
```

---

### 网络请求函数

#### useFetch

响应式的fetch API封装。

```vue
<script setup lang="ts">
import { useFetch } from '@vueuse/core'

// 基础GET请求
const { data, isFetching, error, execute } = useFetch('https://api.example.com/users').json()

// 带参数的GET请求
const userId = ref(1)
const { data: user } = useFetch(() => `https://api.example.com/users/${userId.value}`).json()

// POST请求
const { data: result, execute: post } = useFetch('https://api.example.com/users').post({
  name: '张三',
  email: 'zhangsan@example.com'
}).json()

// 手动触发请求
const handleSubmit = () => {
  post()
}

// 带选项的请求
const { data: users, isFetching: loading } = useFetch('https://api.example.com/users', {
  // 请求前
  beforeFetch({ options, cancel }) {
    // 添加token
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token.value}`
    }
    return { options }
  },
  // 请求后
  afterFetch(ctx) {
    console.log('请求成功', ctx)
    return ctx
  },
  // 请求错误
  onFetchError(ctx) {
    console.error('请求失败', ctx)
    return ctx
  }
}).json()

// 轮询
const { data: pollData } = useFetch('https://api.example.com/status', {
  interval: 5000 // 每5秒请求一次
}).json()
</script>

<template>
  <div>
    <div v-if="isFetching">加载中...</div>
    <div v-else-if="error">错误：{{ error.message }}</div>
    <div v-else>
      <pre>{{ data }}</pre>
    </div>

    <div>
      <input v-model.number="userId" type="number">
      <pre>{{ user }}</pre>
    </div>
  </div>
</template>
```

---

### 动画相关函数 {#动画相关函数}

#### useTransition

数字过渡动画。

```vue
<script setup lang="ts">
import { useTransition, TransitionPresets } from '@vueuse/core'

const source = ref(0)
const output = useTransition(source, {
  duration: 1000,
  transition: TransitionPresets.easeOutCubic
})

// 逐步增加
setInterval(() => {
  source.value += Math.random() * 100
}, 2000)
</script>

<template>
  <div>
    <h1>数值过渡动画</h1>
    <p class="number">{{ Math.round(output) }}</p>
  </div>
</template>

<style scoped>
.number {
  font-size: 48px;
  font-weight: bold;
  color: #42b883;
}
</style>
```

---

### 传感器API

#### useGeolocation

地理位置信息。

```vue
<script setup lang="ts">
import { useGeolocation } from '@vueuse/core'

const {
  coords,      // 坐标
  locatedAt,   // 定位时间
  error,       // 错误信息
  pause,       // 暂停追踪
  resume,      // 恢复追踪
  isSupported  // 是否支持
} = useGeolocation()

// 位置信息
const latitude = computed(() => coords.value.latitude)
const longitude = computed(() => coords.value.longitude)
const accuracy = computed(() => coords.value.accuracy)
</script>

<template>
  <div>
    <p v-if="!isSupported">浏览器不支持地理定位</p>
    <div v-else>
      <p>纬度：{{ latitude }}</p>
      <p>经度：{{ longitude }}</p>
      <p>精度：{{ accuracy }}米</p>
      <button @click="pause">暂停追踪</button>
      <button @click="resume">恢复追踪</button>
    </div>
  </div>
</template>
```

---

### 状态管理工具

#### useToggle

布尔值切换。

```vue
<script setup lang="ts">
import { useToggle } from '@vueuse/core'

const [value, toggle] = useToggle(true)

// 或者设置初始值
const [isActive, setActive] = useToggle(false)

// 强制设置值
const forceTrue = () => {
  setActive(true)
}

const forceFalse = () => {
  setActive(false)
}
</script>

<template>
  <div>
    <p>当前状态：{{ value ? '开' : '关' }}</p>
    <button @click="toggle">切换</button>
    <button @click="forceTrue">设为开</button>
    <button @click="forceFalse">设为关</button>
  </div>
</template>
```

#### useCycleList

循环切换列表值。

```vue
<script setup lang="ts">
import { useCycleList } from '@vueuse/core'

const colors = ['red', 'green', 'blue', 'yellow']
const { state, next, prev, index } = useCycleList(colors)

// 返回：
// state: 当前值
// next: 下一个值
// prev: 上一个值
// index: 当前索引
</script>

<template>
  <div>
    <p :style="{ color: state }">当前颜色：{{ state }}</p>
    <button @click="prev">上一个</button>
    <button @click="next">下一个</button>
    <p>索引：{{ index }}</p>
  </div>
</template>
```

---

### VueUse源码学习

让我们学习VueUse的实现方式，以便编写自己的组合式函数。

#### 示例1：useStorage的简化实现

```typescript
import { customRef } from 'vue'

export function useStorage(key: string, defaultValue: any) {
  return customRef((track, trigger) => {
    return {
      get() {
        track() // 追踪依赖
        const value = localStorage.getItem(key)
        return value ? JSON.parse(value) : defaultValue
      },
      set(value) {
        localStorage.setItem(key, JSON.stringify(value))
        trigger() // 触发更新
      }
    }
  })
}
```

#### 示例2：useMouse的简化实现

```typescript
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  const update = (event: MouseEvent) => {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}
```

#### 示例3：useDebounceFn的实现

```typescript
import { ref, watch } from 'vue'

export function useDebounceFn(fn: Function, delay: number = 200) {
  let timeoutId: number | null = null

  return function(this: any, ...args: any[]) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}
```

---

### 实战案例：用VueUse重构代码

#### 案例：待办事项应用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useStorage, useToggle, useClipboard } from '@vueuse/core'

// 使用useStorage持久化待办列表
const todos = useStorage('vueuse-todos', [
  { id: 1, text: '学习VueUse', completed: false }
])

// 新待办的输入框
const newTodoText = ref('')

// 添加待办
const addTodo = () => {
  if (!newTodoText.value.trim()) return

  todos.value.push({
    id: Date.now(),
    text: newTodoText.value,
    completed: false
  })

  newTodoText.value = ''
}

// 切换完成状态
const toggleTodo = (id: number) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}

// 删除待办
const deleteTodo = (id: number) => {
  const index = todos.value.findIndex(t => t.id === id)
  if (index > -1) {
    todos.value.splice(index, 1)
  }
}

// 统计
const activeCount = computed(() =>
  todos.value.filter(t => !t.completed).length
)
const completedCount = computed(() =>
  todos.value.filter(t => t.completed).length
)

// 剪贴板功能
const {
  text: clipboardText,
  copy: copyToClipboard,
  copied: isCopied
} = useClipboard()

// 复制待办列表
const copyTodos = () => {
  const text = todos.value
    .map(t => `${t.completed ? '✅' : '❌'} ${t.text}`)
    .join('\n')

  copyToClipboard(text)
}

// 过滤器
const filter = ref<'all' | 'active' | 'completed'>('all')
const filteredTodos = computed(() => {
  switch (filter.value) {
    case 'active':
      return todos.value.filter(t => !t.completed)
    case 'completed':
      return todos.value.filter(t => t.completed)
    default:
      return todos.value
  }
})
</script>

<template>
  <div class="todo-app">
    <h1>待办事项（VueUse版）</h1>

    <!-- 添加待办 -->
    <div class="add-todo">
      <input
        v-model="newTodoText"
        @keyup.enter="addTodo"
        placeholder="添加新待办..."
      >
      <button @click="addTodo">添加</button>
    </div>

    <!-- 过滤器 -->
    <div class="filters">
      <button
        @click="filter = 'all'"
        :class="{ active: filter === 'all' }"
      >
        全部 ({{ todos.length }})
      </button>
      <button
        @click="filter = 'active'"
        :class="{ active: filter === 'active' }"
      >
        进行中 ({{ activeCount }})
      </button>
      <button
        @click="filter = 'completed'"
        :class="{ active: filter === 'completed' }"
      >
        已完成 ({{ completedCount }})
      </button>
    </div>

    <!-- 待办列表 -->
    <ul class="todo-list">
      <li
        v-for="todo in filteredTodos"
        :key="todo.id"
        :class="{ completed: todo.completed }"
      >
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="toggleTodo(todo.id)"
        >
        <span>{{ todo.text }}</span>
        <button @click="deleteTodo(todo.id)">删除</button>
      </li>
    </ul>

    <!-- 复制按钮 -->
    <div class="actions">
      <button @click="copyTodos">
        {{ isCopied ? '✅ 已复制' : '复制列表' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.todo-app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.add-todo {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.add-todo input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filters button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.filters button.active {
  background: #42b883;
  color: white;
  border-color: #42b883;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #999;
}

.actions {
  margin-top: 20px;
}
</style>
```

**VueUse带来的好处**：
- ✅ 自动持久化到localStorage
- ✅ 代码更简洁
- ✅ 类型安全
- ✅ 无需手动管理状态
- ✅ 剪贴板功能一行代码实现

---

### 本章小结

#### VueUse核心函数速查表

| 函数 | 用途 | 使用频率 |
|------|------|---------|
| useStorage | 本地存储 | ⭐⭐⭐⭐⭐ |
| useLocalStorage | localStorage封装 | ⭐⭐⭐⭐⭐ |
| useMouse | 鼠标追踪 | ⭐⭐⭐⭐ |
| useIntersectionObserver | 滚动监听 | ⭐⭐⭐⭐⭐ |
| useClipboard | 剪贴板 | ⭐⭐⭐⭐ |
| useDebounceFn | 防抖 | ⭐⭐⭐⭐⭐ |
| useThrottleFn | 节流 | ⭐⭐⭐⭐⭐ |
| useFetch | 网络请求 | ⭐⭐⭐⭐ |
| useToggle | 布尔切换 | ⭐⭐⭐⭐ |
| usePreferredDark | 深色模式 | ⭐⭐⭐⭐ |

#### 最佳实践

1. **按需引入**：不要全量引入VueUse
2. **查看文档**：[vueuse.org](https://vueuse.org/)
3. **学习源码**：VueUse的代码质量很高，值得学习
4. **适度使用**：不要为了用而用，根据实际需求
5. **类型安全**：充分利用TypeScript类型推导

#### 推荐学习顺序

```
1. 基础函数（必学）
   ├── useStorage
   ├── useMouse
   ├── useToggle
   └── useClipboard

2. 进阶函数（推荐）
   ├── useIntersectionObserver
   ├── useDebounceFn / useThrottleFn
   ├── useFetch
   └── usePreferredDark

3. 高级函数（按需）
   ├── 动画相关
   ├── 传感器API
   └── 自定义实现
```

---
