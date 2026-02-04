# 第31章：前端测试

## 第31章 前端测试

> **学习目标**：掌握前端单元测试、组件测试、E2E测试
> **核心内容**：Vitest、Vue Test Utils、Pinia测试、E2E测试

### 31.1 Vitest 单元测试

#### 31.1.1 安装 Vitest

```bash
# 安装 Vitest
npm install -D vitest @vitest/ui

# 安装测试覆盖率工具
npm install -D @vitest/coverage-v8
```

#### 31.1.2 配置 Vitest

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    // 全局测试API
    globals: true,
    // 测试环境
    environment: 'jsdom',
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.ts'
      ]
    },
    // UI界面
    ui: true
  }
})
```

#### 31.1.3 添加测试脚本

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

#### 31.1.4 基础单元测试

```typescript
// utils/helpers.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, debounce, capitalize } from './helpers'

describe('formatDate', () => {
  it('应该正确格式化日期', () => {
    const date = new Date('2026-01-15T10:30:00')
    expect(formatDate(date)).toBe('2026/1/15')
  })

  it('应该处理空日期', () => {
    expect(formatDate(null as any)).toBe('')
  })
})

describe('debounce', () => {
  it('应该防抖函数调用', async () => {
    let count = 0
    const fn = () => count++
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    expect(count).toBe(0)

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(count).toBe(1)
  })
})

describe('capitalize', () => {
  it('应该首字母大写', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('应该处理空字符串', () => {
    expect(capitalize('')).toBe('')
  })

  it('应该处理单个字符', () => {
    expect(capitalize('a')).toBe('A')
  })
})
```

#### 31.1.5 异步测试

```typescript
// api/user.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchUser, fetchUsers } from './user'
import { axios } from './request'

// Mock axios
vi.mock('./request', () => ({
  axios: {
    get: vi.fn()
  }
}))

describe('User API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchUser', () => {
    it('应该成功获取用户信息', async () => {
      const mockUser = { id: 1, name: '张三' }
      vi.mocked(axios.get).mockResolvedValue({ data: mockUser })

      const user = await fetchUser(1)
      expect(user).toEqual(mockUser)
      expect(axios.get).toHaveBeenCalledWith('/api/users/1')
    })

    it('应该处理错误', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('网络错误'))

      await expect(fetchUser(1)).rejects.toThrow('网络错误')
    })
  })

  describe('fetchUsers', () => {
    it('应该成功获取用户列表', async () => {
      const mockUsers = [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' }
      ]
      vi.mocked(axios.get).mockResolvedValue({ data: mockUsers })

      const users = await fetchUsers()
      expect(users).toEqual(mockUsers)
      expect(axios.get).toHaveBeenCalledWith('/api/users')
    })
  })
})
```

---

### 31.2 Vue Test Utils 组件测试

#### 31.2.1 安装依赖

```bash
npm install -D @vue/test-utils jsdom
```

#### 31.2.2 基础组件测试

```vue
<!-- components/Counter.vue -->
<template>
  <div class="counter">
    <h2>{{ count }}</h2>
    <button @click="increment">增加</button>
    <button @click="decrement">减少</button>
    <button @click="reset" v-if="count > 0">重置</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

const increment = () => count.value++
const decrement = () => count.value--
const reset = () => count.value = 0
</script>
```

```typescript
// components/Counter.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

describe('Counter', () => {
  it('应该正确渲染初始状态', () => {
    const wrapper = mount(Counter)

    expect(wrapper.find('h2').text()).toBe('0')
    expect(wrapper.findAll('button')).toHaveLength(2)
  })

  it('点击增加按钮应该增加计数', async () => {
    const wrapper = mount(Counter)
    const buttons = wrapper.findAll('button')

    await buttons[0].trigger('click')
    expect(wrapper.find('h2').text()).toBe('1')

    await buttons[0].trigger('click')
    expect(wrapper.find('h2').text()).toBe('2')
  })

  it('点击减少按钮应该减少计数', async () => {
    const wrapper = mount(Counter)
    const buttons = wrapper.findAll('button')

    await buttons[0].trigger('click') // 先增加到1
    await buttons[1].trigger('click') // 再减少
    expect(wrapper.find('h2').text()).toBe('0')
  })

  it('计数大于0时应该显示重置按钮', async () => {
    const wrapper = mount(Counter)

    expect(wrapper.find('button:last-of-type').exists()).toBe(false)

    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.find('button:last-of-type').exists()).toBe(true)
  })

  it('点击重置按钮应该重置计数', async () => {
    const wrapper = mount(Counter)

    await wrapper.findAll('button')[0].trigger('click')
    await wrapper.findAll('button')[0].trigger('click')
    await wrapper.findAll('button')[2].trigger('click')

    expect(wrapper.find('h2').text()).toBe('0')
  })
})
```

#### 31.2.3 Props 测试

```vue
<!-- components/UserCard.vue -->
<template>
  <div class="user-card">
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    <span v-if="isAdmin" class="badge">管理员</span>
  </div>
</template>

<script setup lang="ts">
interface User {
  name: string
  email: string
}

interface Props {
  user: User
  isAdmin?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isAdmin: false
})
</script>
```

```typescript
// components/UserCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

describe('UserCard', () => {
  const mockUser = {
    name: '张三',
    email: 'zhangsan@example.com'
  }

  it('应该正确渲染用户信息', () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser }
    })

    expect(wrapper.find('h3').text()).toBe('张三')
    expect(wrapper.find('p').text()).toBe('zhangsan@example.com')
  })

  it('isAdmin为false时不显示管理员徽章', () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser, isAdmin: false }
    })

    expect(wrapper.find('.badge').exists()).toBe(false)
  })

  it('isAdmin为true时显示管理员徽章', () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser, isAdmin: true }
    })

    expect(wrapper.find('.badge').exists()).toBe(true)
    expect(wrapper.find('.badge').text()).toBe('管理员')
  })
})
```

#### 31.2.4 Emit 事件测试

```vue
<!-- components/LoginForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="username" type="text" placeholder="用户名" />
    <input v-model="password" type="password" placeholder="密码" />
    <button type="submit">登录</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
  submit: [data: { username: string; password: string }]
}

const emit = defineEmits<Emits>()

const username = ref('')
const password = ref('')

const handleSubmit = () => {
  emit('submit', {
    username: username.value,
    password: password.value
  })
}
</script>
```

```typescript
// components/LoginForm.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from './LoginForm.vue'

describe('LoginForm', () => {
  it('应该正确提交表单', async () => {
    const wrapper = mount(LoginForm)

    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')?.[0]).toEqual([{
      username: 'testuser',
      password: 'password123'
    }])
  })

  it('空表单也应该触发提交', async () => {
    const wrapper = mount(LoginForm)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')?.[0]).toEqual([{
      username: '',
      password: ''
    }])
  })
})
```

#### 31.2.5 插槽测试

```vue
<!-- components/Modal.vue -->
<template>
  <div v-if="show" class="modal">
    <div class="modal-header">
      <slot name="header">
        <h3>默认标题</h3>
      </slot>
    </div>
    <div class="modal-body">
      <slot>默认内容</slot>
    </div>
    <div class="modal-footer">
      <slot name="footer">
        <button @click="$emit('close')">关闭</button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
}

defineProps<Props>()
defineEmits<{
  close: []
}>()
</script>
```

```typescript
// components/Modal.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from './Modal.vue'

describe('Modal', () => {
  it('show为false时不渲染', () => {
    const wrapper = mount(Modal, {
      props: { show: false }
    })

    expect(wrapper.find('.modal').exists()).toBe(false)
  })

  it('show为true时渲染', () => {
    const wrapper = mount(Modal, {
      props: { show: true }
    })

    expect(wrapper.find('.modal').exists()).toBe(true)
  })

  it('应该使用默认插槽内容', () => {
    const wrapper = mount(Modal, {
      props: { show: true }
    })

    expect(wrapper.find('.modal-header h3').text()).toBe('默认标题')
    expect(wrapper.find('.modal-body').text()).toBe('默认内容')
  })

  it('应该使用自定义插槽内容', () => {
    const wrapper = mount(Modal, {
      props: { show: true },
      slots: {
        header: '<h3>自定义标题</h3>',
        default: '<p>自定义内容</p>',
        footer: '<button>确定</button>'
      }
    })

    expect(wrapper.find('.modal-header h3').text()).toBe('自定义标题')
    expect(wrapper.find('.modal-body').text()).toBe('自定义内容')
    expect(wrapper.find('.modal-footer button').text()).toBe('确定')
  })
})
```

---

### 31.3 Pinia Store 测试

#### 31.3.1 测试 Store 定义

```typescript
// stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset
  }
})
```

```typescript
// stores/counter.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from './counter'

describe('Counter Store', () => {
  beforeEach(() => {
    // 创建新 Pinia 实例
    setActivePinia(createPinia())
  })

  it('初始计数应该为0', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
  })

  it('doubleCount应该是count的两倍', () => {
    const store = useCounterStore()
    store.count = 5
    expect(store.doubleCount).toBe(10)
  })

  it('increment应该增加计数', () => {
    const store = useCounterStore()
    store.increment()
    expect(store.count).toBe(1)

    store.increment()
    expect(store.count).toBe(2)
  })

  it('decrement应该减少计数', () => {
    const store = useCounterStore()
    store.count = 5
    store.decrement()
    expect(store.count).toBe(4)
  })

  it('reset应该重置计数', () => {
    const store = useCounterStore()
    store.count = 10
    store.reset()
    expect(store.count).toBe(0)
  })
})
```

#### 31.3.2 测试带 Actions 的 Store

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: number
  name: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref('')

  async function login(email: string, password: string) {
    // 模拟API调用
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    if (response.ok) {
      const data = await response.json()
      user.value = data.user
      token.value = data.token
      return true
    }
    return false
  }

  function logout() {
    user.value = null
    token.value = ''
  }

  return {
    user,
    token,
    login,
    logout
  }
})
```

```typescript
// stores/user.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from './user'

// Mock fetch
global.fetch = vi.fn()

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('登录成功应该设置用户和token', async () => {
    const mockUser = { id: 1, name: '张三', email: 'test@example.com' }
    const mockToken = 'mock-jwt-token'

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: mockToken })
    } as Response)

    const store = useUserStore()
    const result = await store.login('test@example.com', 'password')

    expect(result).toBe(true)
    expect(store.user).toEqual(mockUser)
    expect(store.token).toBe(mockToken)
  })

  it('登录失败不应该设置用户', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false
    } as Response)

    const store = useUserStore()
    const result = await store.login('test@example.com', 'wrong-password')

    expect(result).toBe(false)
    expect(store.user).toBeNull()
    expect(store.token).toBe('')
  })

  it('logout应该清除用户和token', async () => {
    const store = useUserStore()
    store.user = { id: 1, name: '张三', email: 'test@example.com' }
    store.token = 'some-token'

    store.logout()

    expect(store.user).toBeNull()
    expect(store.token).toBe('')
  })
})
```

---

### 31.4 Vue Router 测试

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import NotFound from '@/views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]
})

export default router
```

```typescript
// router/index.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'

describe('Vue Router', () => {
  it('应该渲染首页', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: Home },
        { path: '/about', component: About }
      ]
    })

    router.push('/')
    await router.isReady()

    const wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('h1').text()).toBe('首页')
  })

  it('应该导航到关于页面', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: Home },
        { path: '/about', component: About }
      ]
    })

    await router.push('/about')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/about')
  })

  it('应该通过编程式导航跳转', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: Home },
        { path: '/about', component: About }
      ]
    })

    await router.push('/')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/')

    await router.push('/about')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/about')
  })
})
```

---

### 31.5 E2E 测试（Playwright）

#### 31.5.1 安装 Playwright

```bash
npm install -D @playwright/test

# 初始化 Playwright 配置
npx playwright install
```

#### 31.5.2 配置 Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### 31.5.3 E2E 测试示例

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('登录功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('应该显示登录表单', async ({ page }) => {
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('空表单提交应该显示错误', async ({ page }) => {
    await page.click('button[type="submit"]')

    await expect(page.locator('.error')).toHaveText('请输入用户名和密码')
  })

  test('正确凭据应该登录成功', async ({ page }) => {
    await page.fill('input[type="text"]', 'testuser')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/')
    await expect(page.locator('.user-name')).toHaveText('testuser')
  })

  test('错误凭据应该显示错误消息', async ({ page }) => {
    await page.fill('input[type="text"]', 'wronguser')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('.error')).toHaveText('用户名或密码错误')
  })
})
```

```typescript
// e2e/shopping.spec.ts
import { test, expect } from '@playwright/test'

test.describe('购物车功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products')
  })

  test('应该添加商品到购物车', async ({ page }) => {
    // 点击第一个商品的"添加到购物车"按钮
    await page.click('.product-card:first-child .add-to-cart')

    // 检查购物车图标数量
    await expect(page.locator('.cart-count')).toHaveText('1')

    // 打开购物车
    await page.click('.cart-icon')

    // 验证商品在购物车中
    await expect(page.locator('.cart-item')).toHaveCount(1)
  })

  test('应该删除购物车中的商品', async ({ page }) => {
    // 添加两个商品
    await page.click('.product-card:nth-child(1) .add-to-cart')
    await page.click('.product-card:nth-child(2) .add-to-cart')

    // 打开购物车
    await page.click('.cart-icon')

    // 删除第一个商品
    await page.click('.cart-item:first-child .remove-btn')

    // 验证只有一个商品
    await expect(page.locator('.cart-item')).toHaveCount(1)
    await expect(page.locator('.cart-count')).toHaveText('1')
  })

  test('应该计算总价', async ({ page }) => {
    // 添加商品
    await page.click('.product-card:nth-child(1) .add-to-cart') // ¥99
    await page.click('.product-card:nth-child(2) .add-to-cart') // ¥199

    // 打开购物车
    await page.click('.cart-icon')

    // 验证总价
    await expect(page.locator('.total-price')).toHaveText('¥298')
  })
})
```

#### 31.5.4 添加测试脚本

```json
// package.json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

### 31.6 测试覆盖率

#### 31.6.1 生成覆盖率报告

```bash
npm run test:coverage
```

#### 31.6.2 覆盖率配置

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,ts,vue}'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.ts',
        'src/assets'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
})
```

---

### 31.7 测试最佳实践

#### 31.7.1 测试文件命名规范

```
src/
├── components/
│   ├── Button.vue
│   └── Button.test.ts         # 组件测试
├── stores/
│   ├── user.ts
│   └── user.test.ts           # Store测试
├── utils/
│   ├── helpers.ts
│   └── helpers.test.ts        # 工具函数测试
└── router/
    ├── index.ts
    └── index.test.ts          # 路由测试

e2e/
├── login.spec.ts              # E2E测试
├── shopping.spec.ts
└── profile.spec.ts
```

#### 31.7.2 测试编写原则

```typescript
// ❌ 不好的测试
it('测试组件', () => {
  const wrapper = mount(Component)
  // 测试了太多内容
  expect(wrapper.html()).toMatchSnapshot()
})

// ✅ 好的测试
describe('Button组件', () => {
  it('应该渲染正确的文本', () => {
    const wrapper = mount(Button, {
      props: { text: '点击我' }
    })
    expect(wrapper.text()).toBe('点击我')
  })

  it('应该触发点击事件', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('禁用状态下不应该点击', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
```

#### 31.7.4 完整测试实战案例：TodoList应用

> **场景说明**：下面是一个完整的TodoList应用的测试套件，涵盖了单元测试、组件测试、Store测试和E2E测试。

##### 被测试的组件

```vue
<!-- components/TodoList.vue -->
<template>
  <div class="todo-list">
    <!-- 添加任务表单 -->
    <form @submit.prevent="addTodo" class="todo-form">
      <input
        v-model="newTodoText"
        placeholder="添加新任务..."
        class="todo-input"
      >
      <button type="submit" :disabled="!newTodoText.trim()">
        添加
      </button>
    </form>

    <!-- 任务列表 -->
    <ul v-if="todos.length > 0" class="todo-items">
      <li
        v-for="todo in filteredTodos"
        :key="todo.id"
        :class="{ completed: todo.completed }"
        class="todo-item"
      >
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="toggleTodo(todo.id)"
        >
        <span class="todo-text">{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)" class="remove-btn">
          删除
        </button>
      </li>
    </ul>

    <!-- 空状态 -->
    <p v-else class="empty-state">
      {{ emptyMessage }}
    </p>

    <!-- 筛选器 -->
    <div v-if="todos.length > 0" class="filters">
      <button
        v-for="filter in filters"
        :key="filter.value"
        :class="{ active: currentFilter === filter.value }"
        @click="currentFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- 统计信息 -->
    <div v-if="todos.length > 0" class="stats">
      <span>总计: {{ todos.length }}</span>
      <span>已完成: {{ completedCount }}</span>
      <span>未完成: {{ activeCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Todo {
  id: number
  text: string
  completed: boolean
}

interface Props {
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  emptyMessage: '暂无任务，快来添加吧！'
})

interface Emits {
  'update:todos': [todos: Todo[]]
}

const emit = defineEmits<Emits>()

const newTodoText = ref('')
const currentFilter = ref<'all' | 'active' | 'completed'>('all')

// 从外部传入或初始化
const todos = ref<Todo[]>([
  { id: 1, text: '学习Vue3', completed: false },
  { id: 2, text: '编写测试', completed: true }
])

// 筛选器选项
const filters = [
  { label: '全部', value: 'all' },
  { label: '未完成', value: 'active' },
  { label: '已完成', value: 'completed' }
]

// 筛选后的任务
const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case 'active':
      return todos.value.filter(t => !t.completed)
    case 'completed':
      return todos.value.filter(t => t.completed)
    default:
      return todos.value
  }
})

// 已完成任务数量
const completedCount = computed(() => {
  return todos.value.filter(t => t.completed).length
})

// 未完成任务数量
const activeCount = computed(() => {
  return todos.value.filter(t => !t.completed).length
})

// 添加任务
const addTodo = () => {
  const text = newTodoText.value.trim()
  if (!text) return

  todos.value.push({
    id: Date.now(),
    text,
    completed: false
  })

  newTodoText.value = ''
  emit('update:todos', todos.value)
}

// 切换任务状态
const toggleTodo = (id: number) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    emit('update:todos', todos.value)
  }
}

// 删除任务
const removeTodo = (id: number) => {
  const index = todos.value.findIndex(t => t.id === id)
  if (index > -1) {
    todos.value.splice(index, 1)
    emit('update:todos', todos.value)
  }
}

// 暴露方法供测试使用
defineExpose({
  addTodo,
  toggleTodo,
  removeTodo,
  todos,
  newTodoText
})
</script>

<style scoped>
.todo-list {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.todo-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.todo-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.todo-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-text {
  flex: 1;
}

.remove-btn {
  padding: 4px 8px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.filters button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.filters button.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.stats {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  color: #666;
}
</style>
```

##### 完整的组件测试

```typescript
// components/TodoList.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoList from './TodoList.vue'

describe('TodoList组件', () => {
  describe('初始渲染', () => {
    it('应该显示默认任务列表', () => {
      const wrapper = mount(TodoList)

      expect(wrapper.find('.todo-items').exists()).toBe(true)
      expect(wrapper.findAll('.todo-item')).toHaveLength(2)
    })

    it('应该使用自定义空消息', () => {
      const wrapper = mount(TodoList, {
        props: { emptyMessage: '没有任务' }
      })

      // 清空任务
      wrapper.vm.todos = []
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.empty-state').text()).toBe('没有任务')
    })

    it('应该正确显示初始统计信息', () => {
      const wrapper = mount(TodoList)

      const stats = wrapper.findAll('.stats span')
      expect(stats[0].text()).toBe('总计: 2')
      expect(stats[1].text()).toBe('已完成: 1')
      expect(stats[2].text()).toBe('未完成: 1')
    })
  })

  describe('添加任务', () => {
    it('应该添加新任务', async () => {
      const wrapper = mount(TodoList)

      wrapper.vm.newTodoText = '新任务'
      await wrapper.vm.addTodo()

      expect(wrapper.vm.todos).toHaveLength(3)
      expect(wrapper.vm.todos[2].text).toBe('新任务')
      expect(wrapper.vm.todos[2].completed).toBe(false)
    })

    it('不应添加空任务', async () => {
      const wrapper = mount(TodoList)
      const initialLength = wrapper.vm.todos.length

      wrapper.vm.newTodoText = '   '
      await wrapper.vm.addTodo()

      expect(wrapper.vm.todos).toHaveLength(initialLength)
    })

    it('应该通过表单添加任务', async () => {
      const wrapper = mount(TodoList)
      const input = wrapper.find('.todo-input')
      const form = wrapper.find('.todo-form')

      await input.setValue('从表单添加')
      await form.trigger('submit')

      expect(wrapper.vm.todos).toHaveLength(3)
      expect(wrapper.vm.todos[2].text).toBe('从表单添加')
    })

    it('添加任务后应该触发事件', async () => {
      const wrapper = mount(TodoList)

      wrapper.vm.newTodoText = '测试事件'
      await wrapper.vm.addTodo()

      expect(wrapper.emitted('update:todos')).toBeTruthy()
      expect(wrapper.emitted('update:todos')?.[0]).toEqual([wrapper.vm.todos])
    })
  })

  describe('切换任务状态', () => {
    it('应该切换任务完成状态', async () => {
      const wrapper = mount(TodoList)
      const initialTodo = { ...wrapper.vm.todos[0] }

      await wrapper.vm.toggleTodo(1)

      expect(wrapper.vm.todos[0].completed).toBe(!initialTodo.completed)
    })

    it('切换后应该触发事件', async () => {
      const wrapper = mount(TodoList)

      await wrapper.vm.toggleTodo(1)

      expect(wrapper.emitted('update:todos')).toBeTruthy()
    })

    it('应该正确更新已完成计数', async () => {
      const wrapper = mount(TodoList)
      const stats = wrapper.findAll('.stats span')

      await wrapper.vm.toggleTodo(1)
      await wrapper.vm.$nextTick()

      expect(stats[1].text()).toBe('已完成: 0')
      expect(stats[2].text()).toBe('未完成: 2')
    })
  })

  describe('删除任务', () => {
    it('应该删除指定任务', async () => {
      const wrapper = mount(TodoList)
      const initialLength = wrapper.vm.todos.length

      await wrapper.vm.removeTodo(1)

      expect(wrapper.vm.todos).toHaveLength(initialLength - 1)
      expect(wrapper.vm.todos.find(t => t.id === 1)).toBeUndefined()
    })

    it('删除任务后应该触发事件', async () => {
      const wrapper = mount(TodoList)

      await wrapper.vm.removeTodo(1)

      expect(wrapper.emitted('update:todos')).toBeTruthy()
    })

    it('删除所有任务后应该显示空状态', async () => {
      const wrapper = mount(TodoList)

      // 删除所有任务
      const ids = wrapper.vm.todos.map(t => t.id)
      for (const id of ids) {
        await wrapper.vm.removeTodo(id)
      }

      await wrapper.vm.$nextTick()

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.todo-items').exists()).toBe(false)
    })
  })

  describe('筛选功能', () => {
    it('应该显示所有任务', async () => {
      const wrapper = mount(TodoList)

      wrapper.vm.currentFilter = 'all'
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.todo-item')).toHaveLength(2)
    })

    it('应该只显示未完成任务', async () => {
      const wrapper = mount(TodoList)

      wrapper.vm.currentFilter = 'active'
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.todo-item')).toHaveLength(1)
      expect(wrapper.find('.todo-item').classes()).not.toContain('completed')
    })

    it('应该只显示已完成任务', async () => {
      const wrapper = mount(TodoList)

      wrapper.vm.currentFilter = 'completed'
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.todo-item')).toHaveLength(1)
      expect(wrapper.find('.todo-item').classes()).toContain('completed')
    })

    it('点击筛选按钮应该切换筛选', async () => {
      const wrapper = mount(TodoList)
      const buttons = wrapper.findAll('.filters button')

      await buttons[1].trigger('click') // 点击"未完成"
      await wrapper.vm.$nextTick()

      expect(buttons[1].classes()).toContain('active')
      expect(wrapper.findAll('.todo-item')).toHaveLength(1)
    })
  })

  describe('统计信息', () => {
    it('应该正确计算已完成数量', () => {
      const wrapper = mount(TodoList)

      expect(wrapper.vm.completedCount).toBe(1)
    })

    it('应该正确计算未完成数量', () => {
      const wrapper = mount(TodoList)

      expect(wrapper.vm.activeCount).toBe(1)
    })

    it('添加任务后统计应该更新', async () => {
      const wrapper = mount(TodoList)
      const stats = wrapper.findAll('.stats span')

      wrapper.vm.newTodoText = '新任务'
      await wrapper.vm.addTodo()
      await wrapper.vm.$nextTick()

      expect(stats[0].text()).toBe('总计: 3')
      expect(stats[2].text()).toBe('未完成: 2')
    })
  })

  describe('用户交互', () => {
    it('应该支持回车键添加任务', async () => {
      const wrapper = mount(TodoList)
      const input = wrapper.find('.todo-input')

      await input.setValue('回车添加')
      await input.trigger('keyup.enter')

      // 表单提交而不是keyup
      const form = wrapper.find('.todo-form')
      await form.trigger('submit')

      expect(wrapper.vm.todos).toHaveLength(3)
    })

    it('空输入时添加按钮应该禁用', () => {
      const wrapper = mount(TodoList)
      const button = wrapper.find('.todo-form button')

      expect(button.attributes('disabled')).toBe('')
    })

    it('有输入时添加按钮应该启用', async () => {
      const wrapper = mount(TodoList)
      const input = wrapper.find('.todo-input')
      const button = wrapper.find('.todo-form button')

      await input.setValue('有内容')

      expect(button.attributes('disabled')).toBeUndefined()
    })
  })

  describe('边界情况', () => {
    it('应该处理特殊字符', async () => {
      const wrapper = mount(TodoList)

      wrapper.vm.newTodoText = '任务<script>alert(1)</script>'
      await wrapper.vm.addTodo()

      expect(wrapper.vm.todos[2].text).toBe('任务<script>alert(1)</script>')
    })

    it('应该处理超长文本', async () => {
      const wrapper = mount(TodoList)
      const longText = 'A'.repeat(1000)

      wrapper.vm.newTodoText = longText
      await wrapper.vm.addTodo()

      expect(wrapper.vm.todos[2].text).toBe(longText)
    })

    it('应该处理重复任务', async () => {
      const wrapper = mount(TodoList)

      wrapper.vm.newTodoText = '学习Vue3'
      await wrapper.vm.addTodo()

      expect(wrapper.vm.todos).toHaveLength(3)
    })
  })
})
```

##### Store测试（如果使用Pinia）

```typescript
// stores/todo.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTodoStore } from './todo'

describe('Todo Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始状态', () => {
    it('应该有空的初始任务列表', () => {
      const store = useTodoStore()
      expect(store.todos).toEqual([])
    })

    it('应该正确计算统计信息', () => {
      const store = useTodoStore()

      expect(store.totalCount).toBe(0)
      expect(store.completedCount).toBe(0)
      expect(store.activeCount).toBe(0)
    })
  })

  describe('Actions', () => {
    it('应该添加任务', () => {
      const store = useTodoStore()

      store.addTodo('新任务')

      expect(store.todos).toHaveLength(1)
      expect(store.todos[0].text).toBe('新任务')
      expect(store.todos[0].completed).toBe(false)
    })

    it('应该切换任务状态', () => {
      const store = useTodoStore()

      store.addTodo('任务1')
      store.toggleTodo(store.todos[0].id)

      expect(store.todos[0].completed).toBe(true)
    })

    it('应该删除任务', () => {
      const store = useTodoStore()

      store.addTodo('任务1')
      const id = store.todos[0].id
      store.removeTodo(id)

      expect(store.todos).toHaveLength(0)
    })

    it('应该清除已完成任务', () => {
      const store = useTodoStore()

      store.addTodo('任务1')
      store.addTodo('任务2')
      store.toggleTodo(store.todos[0].id)
      store.clearCompleted()

      expect(store.todos).toHaveLength(1)
      expect(store.todos[0].completed).toBe(false)
    })
  })

  describe('Getters', () => {
    it('应该正确筛选未完成任务', () => {
      const store = useTodoStore()

      store.addTodo('任务1')
      store.addTodo('任务2')
      store.toggleTodo(store.todos[0].id)

      const activeTodos = store.activeTodos
      expect(activeTodos).toHaveLength(1)
      expect(activeTodos[0].completed).toBe(false)
    })

    it('应该正确筛选已完成任务', () => {
      const store = useTodoStore()

      store.addTodo('任务1')
      store.addTodo('任务2')
      store.toggleTodo(store.todos[0].id)

      const completedTodos = store.completedTodos
      expect(completedTodos).toHaveLength(1)
      expect(completedTodos[0].completed).toBe(true)
    })
  })
})
```

##### E2E测试（Playwright）

```typescript
// e2e/todo.spec.ts
import { test, expect } from '@playwright/test'

test.describe('TodoList E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('完整流程：添加、切换、删除任务', async ({ page }) => {
    // 1. 添加任务
    await page.fill('.todo-input', '学习Playwright')
    await page.click('.todo-form button')

    // 验证任务添加成功
    await expect(page.locator('.todo-item')).toHaveCount(3)
    await expect(page.locator('.todo-item').last()).toContainText('学习Playwright')

    // 2. 切换任务状态
    await page.check('.todo-item:last-child input[type="checkbox"]')

    // 验证任务已标记完成
    await expect(page.locator('.todo-item:last-child')).toHaveClass(/completed/)

    // 3. 删除任务
    await page.click('.todo-item:last-child .remove-btn')

    // 验证任务已删除
    await expect(page.locator('.todo-item')).toHaveCount(2)
  })

  test('筛选功能测试', async ({ page }) => {
    // 确保有已完成和未完成的任务
    await page.check('.todo-item:first-child input[type="checkbox"]')

    // 测试筛选已完成
    await page.click('.filters button:nth-child(3)')
    await expect(page.locator('.todo-item')).toHaveCount(1)
    await expect(page.locator('.todo-item')).toHaveClass(/completed/)

    // 测试筛选未完成
    await page.click('.filters button:nth-child(2)')
    await expect(page.locator('.todo-item')).toHaveCount(1)
    await expect(page.locator('.todo-item')).not.toHaveClass(/completed/)
  })

  test('空状态测试', async ({ page }) => {
    // 删除所有任务
    const items = page.locator('.todo-item')
    const count = await items.count()

    for (let i = 0; i < count; i++) {
      await page.click('.todo-item:first-child .remove-btn')
    }

    // 验证空状态显示
    await expect(page.locator('.empty-state')).toBeVisible()
    await expect(page.locator('.empty-state')).toContainText('暂无任务')
  })

  test('统计信息测试', async ({ page }) => {
    const stats = page.locator('.stats span')

    await expect(stats.nth(0)).toContainText('总计: 2')
    await expect(stats.nth(1)).toContainText('已完成:')
    await expect(stats.nth(2)).toContainText('未完成:')

    // 添加新任务
    await page.fill('.todo-input', '新任务')
    await page.click('.todo-form button')

    // 验证统计更新
    await expect(stats.nth(0)).toContainText('总计: 3')
  })

  test('键盘交互测试', async ({ page }) => {
    const input = page.locator('.todo-input')

    // 输入任务并按回车
    await input.fill('回车添加任务')
    await input.press('Enter')

    // 验证任务添加成功
    await expect(page.locator('.todo-item')).toHaveCount(3)
    await expect(page.locator('.todo-item').last()).toContainText('回车添加任务')
  })

  test('响应式布局测试', async ({ page }) => {
    // 测试移动端布局
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('.todo-list')).toBeVisible()

    // 测试桌面端布局
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('.todo-list')).toBeVisible()
  })
})
```

##### 运行测试

```bash
# 运行所有测试
npm run test

# 运行特定组件测试
npm run test -- TodoList.test.ts

# 生成覆盖率报告
npm run test:coverage

# 运行E2E测试
npm run test:e2e

# 运行E2E测试并打开UI
npm run test:e2e:ui
```

#### 31.7.5 测试最佳实践总结

| 最佳实践 | 说明 | 示例 |
|----------|------|------|
| **AAA模式** | Arrange-Act-Assert | 先准备数据，再执行操作，最后验证结果 |
| **单一职责** | 每个测试只验证一个功能 | `it('应该添加任务')` ✓ |
| **描述清晰** | 测试名称应该清晰表达意图 | `it('空表单提交应该显示错误')` ✓ |
| **隔离性** | 测试之间应该相互独立 | 使用 `beforeEach` 清理状态 |
| **可读性** | 测试代码应该易于理解 | 使用 `describe` 分组 |
| **快速反馈** | 单元测试应该快速执行 | 避免在单元测试中做网络请求 |
| **Mock外部依赖** | 隔离外部服务 | Mock API、数据库等 |

#### 31.7.6 本章小结

| 测试类型 | 工具 | 测试内容 | 执行速度 |
|----------|------|----------|----------|
| 单元测试 | Vitest | 工具函数、独立逻辑 | ⚡ 最快 |
| 组件测试 | Vue Test Utils | 组件渲染、交互 | ⚡ 快 |
| Store测试 | Vitest + Pinia | 状态管理逻辑 | ⚡ 快 |
| E2E测试 | Playwright | 完整用户流程 | 🐢 较慢 |

---
