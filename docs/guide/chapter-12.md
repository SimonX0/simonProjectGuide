# 第12章：组件基础与组件名称定义

## 第12章 组件基础与组件名称定义

> **学习目标**：掌握Vue3组件的创建和使用
> **核心内容**：SFC组件结构、setup语法糖、组件注册

### 12.1 创建组件（组合式API + setup语法糖）

```vue
<!-- components/UserCard.vue -->
<script setup lang="ts">
// 定义组件名称（用于调试和递归引用）
const name = 'UserCard' // 可选，Vue3会自动推断

// 或者使用选项式定义名称
<script>
export default {
  name: 'UserCard'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  user: {
    name: string
    email: string
  }
}

const props = defineProps<Props>()
</script>

<template>
  <div class="user-card">
    <h3>{{ title }}</h3>
    <p>{{ user.name }}</p>
    <p>{{ user.email }}</p>
  </div>
</template>
```

### 12.2 组件导出与导入

**方式一：默认导出（推荐）**

```vue
<!-- components/UserCard.vue -->
<script setup lang="ts">
// 使用 setup 语法糖时，组件自动导出
</script>

<template>
  <div>用户卡片</div>
</template>
```

```typescript
// 父组件中导入
import UserCard from '@/components/UserCard.vue'
```

**方式二：具名导出**

```vue
<!-- components/UserCard.vue -->
<script setup lang="ts">
// 定义组件名称
defineOptions({
  name: 'UserCard'
})
</script>
```

**方式三：导出函数/工具**

```typescript
// utils/helpers.ts
// 导出普通函数
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN')
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// 导出类型
export interface User {
  id: number
  name: string
  email: string
}

// 导出常量
export const API_BASE_URL = '/api'
```

```typescript
// 在组件中使用
import { formatDate, debounce, type User, API_BASE_URL } from '@/utils/helpers'
```

### 12.3 全局组件注册

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import UserCard from './components/UserCard.vue'

const app = createApp(App)

// 全局注册组件
app.component('UserCard', UserCard)

// 或者使用插件形式批量注册
const components = import.meta.glob('./components/**/*.vue')
for (const path in components) {
  components[path]().then((module: any) => {
    const name = path.match(/\.\/components\/(.*)\.vue$/)?.[1]
    if (name) {
      app.component(name, module.default)
    }
  })
}

app.mount('#app')
```

---
