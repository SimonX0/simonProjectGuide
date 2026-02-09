# useState与useCookie

## useState与useCookie

> **为什么要学这一章?**
>
> 在Nuxt应用中,我们需要在服务端和客户端之间共享状态,或者持久化用户偏好设置。`useState`提供了跨组件、SSR安全的响应式状态管理,`useCookie`则提供了浏览器Cookie的便捷操作。掌握它们是构建健壮Nuxt应用的基础。
>
> **学习目标**:
>
> - 理解 useState 的SSR安全特性
> - 掌握跨组件状态共享的方法
> - 学会使用 useCookie 操作浏览器Cookie
> - 理解状态持久化策略
> - 能够构建用户偏好设置系统

---

### 跨组件状态

#### useState 基础

`useState` 是Nuxt提供的SSR安全的响应式状态管理工具:

```vue
<template>
  <div>
    <h1>计数器</h1>
    <p>当前值: {{ count }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>

<script setup lang="ts>
// useState 确保在服务端和客户端之间共享相同的状态
const count = useState('counter', () => 0)

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}
</script>
```

#### useState vs ref

```vue
<script setup lang="ts>
// ❌ 使用 ref - SSR时不安全
// 每次请求都会创建新状态,导致服务端和客户端状态不一致
const count = ref(0)

// ✅ 使用 useState - SSR安全
// 状态在服务端和客户端之间共享,确保一致性
const count = useState('counter', () => 0)

// 对比示例
const badState = ref({
  user: null,
  loading: false
})

const goodState = useState('app-state', () => ({
  user: null,
  loading: false
}))
</script>
```

#### 全局状态管理

```typescript
// composables/useAppState.ts
export const useAppState = () => {
  // 用户状态
  const user = useState<User | null>('app-user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  // 主题状态
  const theme = useState<'light' | 'dark'>('app-theme', () => 'light')

  // 通知状态
  const notifications = useState<Notification[]>('app-notifications', () => [])

  // 加载状态
  const loading = useState<boolean>('app-loading', () => false)

  // 设置用户
  const setUser = (newUser: User | null) => {
    user.value = newUser
  }

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  // 添加通知
  const addNotification = (notification: Notification) => {
    notifications.value.push({
      ...notification,
      id: Date.now(),
      timestamp: new Date()
    })
  }

  // 移除通知
  const removeNotification = (id: number) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    theme,
    notifications: readonly(notifications),
    loading,
    setUser,
    toggleTheme,
    addNotification,
    removeNotification
  }
}
</script>
```

#### 跨组件状态共享

```vue
<!-- components/UserProfile.vue -->
<template>
  <div class="user-profile">
    <div v-if="user">
      <img :src="user.avatar" :alt="user.name" />
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
    </div>
    <div v-else>
      <p>未登录</p>
    </div>
  </div>
</template>

<script setup lang="ts>
// 使用共享状态
const { user } = useAppState()
</script>
```

```vue
<!-- components/LoginForm.vue -->
<template>
  <form @submit.prevent="handleLogin" class="login-form">
    <input v-model="email" type="email" placeholder="邮箱" />
    <input v-model="password" type="password" placeholder="密码" />
    <button type="submit" :disabled="loading">
      {{ loading ? '登录中...' : '登录' }}
    </button>
  </form>
</template>

<script setup lang="ts>
const { setUser } = useAppState()
const loading = ref(false)

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  loading.value = true

  try {
    const { data } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    // 更新全局状态
    setUser(data.value.user)

    // 导航到首页
    await navigateTo('/dashboard')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

---

### Cookie操作

#### useCookie 基础

`useCookie` 提供了浏览器的Cookie操作:

```vue
<script setup lang="ts>
// 读取Cookie
const token = useCookie('auth-token')

console.log(token.value) // Cookie值

// 设置Cookie
token.value = 'new-token-value'

// 删除Cookie
token.value = null
</script>
```

#### Cookie配置选项

```vue
<script setup lang="ts>
// 带选项的Cookie
const cookie = useCookie('my-cookie', {
  // Cookie过期时间(可以是天数或具体日期)
  maxAge: 60 * 60 * 24 * 7, // 7天

  // 或使用expires(日期对象)
  expires: new Date('2024-12-31'),

  // Cookie路径
  path: '/',

  // Cookie域名
  domain: '.example.com',

  // 是否安全(HTTPS only)
  secure: true,

  // SameSite策略
  sameSite: 'strict', // 'strict' | 'lax' | 'none'

  // HTTP only(服务端可访问,客户端JS不可)
  httpOnly: false
})

// 设置值
cookie.value = 'cookie-value'
</script>
```

#### 认证Token管理

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  // 从Cookie获取token
  const token = useCookie<string | null>('auth-token', {
    maxAge: 60 * 60 * 24 * 7, // 7天
    secure: true,
    sameSite: 'lax'
  })

  const refreshToken = useCookie<string | null>('refresh-token', {
    maxAge: 60 * 60 * 24 * 30, // 30天
    secure: true,
    sameSite: 'lax'
  })

  // 用户信息状态
  const user = useState<User | null>('auth-user', () => null)
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 登录
  const login = async (credentials: LoginCredentials) => {
    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })

    if (!error.value && data.value) {
      // 保存token到Cookie
      token.value = data.value.token
      refreshToken.value = data.value.refreshToken

      // 保存用户信息到状态
      user.value = data.value.user

      return true
    }

    return false
  }

  // 登出
  const logout = async () => {
    // 调用登出API
    await $fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    // 清除Cookie
    token.value = null
    refreshToken.value = null

    // 清除状态
    user.value = null

    // 导航到登录页
    await navigateTo('/login')
  }

  // 刷新token
  const refreshTokens = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    const { data, error } = await useFetch('/api/auth/refresh', {
      method: 'POST',
      body: {
        refreshToken: refreshToken.value
      }
    })

    if (!error.value && data.value) {
      token.value = data.value.token
      refreshToken.value = data.value.refreshToken

      return data.value.token
    }

    throw error.value
  }

  // 获取用户信息
  const fetchUser = async () => {
    if (!token.value) {
      return null
    }

    const { data, error } = await useFetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (!error.value && data.value) {
      user.value = data.value
      return data.value
    }

    return null
  }

  return {
    token: readonly(token),
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    refreshTokens,
    fetchUser
  }
}
</script>
```

#### 用户偏好设置

```vue
<!-- pages/settings/index.vue -->
<template>
  <div class="settings-page">
    <h1>设置</h1>

    <!-- 主题设置 -->
    <section class="setting-section">
      <h2>外观</h2>

      <div class="setting-item">
        <label>主题</label>
        <div class="theme-selector">
          <button
            v-for="themeOption in themes"
            :key="themeOption.value"
            class="theme-btn"
            :class="{ active: theme === themeOption.value }"
            @click="setTheme(themeOption.value)"
          >
            <span class="theme-icon">{{ themeOption.icon }}</span>
            <span>{{ themeOption.label }}</span>
          </button>
        </div>
      </div>

      <div class="setting-item">
        <label>字体大小</label>
        <select v-model="fontSize" @change="updateFontSize">
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
        </select>
      </div>
    </section>

    <!-- 通知设置 -->
    <section class="setting-section">
      <h2>通知</h2>

      <div class="setting-item">
        <label>
          <input
            v-model="emailNotifications"
            type="checkbox"
            @change="updateEmailNotifications"
          />
          启用邮件通知
        </label>
      </div>

      <div class="setting-item">
        <label>
          <input
            v-model="pushNotifications"
            type="checkbox"
            @change="updatePushNotifications"
          />
          启用推送通知
        </label>
      </div>
    </section>

    <!-- 语言设置 -->
    <section class="setting-section">
      <h2>语言与地区</h2>

      <div class="setting-item">
        <label>语言</label>
        <select v-model="language" @change="updateLanguage">
          <option value="zh-CN">简体中文</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
        </select>
      </div>

      <div class="setting-item">
        <label>时区</label>
        <select v-model="timezone" @change="updateTimezone">
          <option value="Asia/Shanghai">上海 (GMT+8)</option>
          <option value="America/New_York">纽约 (GMT-5)</option>
          <option value="Europe/London">伦敦 (GMT+0)</option>
        </select>
      </div>
    </section>

    <!-- 保存按钮 -->
    <div class="actions">
      <button @click="saveSettings" :disabled="saving">
        {{ saving ? '保存中...' : '保存设置' }}
      </button>
      <button @click="resetSettings" class="secondary">
        恢复默认
      </button>
    </div>
  </div>
</template>

<script setup lang="ts>
// ============ 从Cookie获取设置 ============
const theme = useCookie<'light' | 'dark' | 'auto'>('theme', {
  default: () => 'light'
})
const fontSize = useCookie<'small' | 'medium' | 'large'>('font-size', {
  default: () => 'medium'
})
const language = useCookie('language', {
  default: () => 'zh-CN'
})
const timezone = useCookie('timezone', {
  default: () => 'Asia/Shanghai'
})
const emailNotifications = useCookie('email-notifications', {
  default: () => 'true'
})
const pushNotifications = useCookie('push-notifications', {
  default: () => 'false'
})

// ============ 状态 ============
const saving = ref(false)

const themes = [
  { value: 'light', label: '浅色', icon: '☀️' },
  { value: 'dark', label: '深色', icon: '🌙' },
  { value: 'auto', label: '跟随系统', icon: '🔄' }
]

// ============ 更新设置方法 ============
const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
  theme.value = newTheme
  applyTheme()
}

const updateFontSize = () => {
  document.documentElement.style.fontSize = fontSize.value === 'small'
    ? '14px'
    : fontSize.value === 'large'
    ? '18px'
    : '16px'
}

const updateEmailNotifications = () => {
  // 更新服务器设置
  syncSettings()
}

const updatePushNotifications = () => {
  // 请求推送通知权限
  if (pushNotifications.value && 'Notification' in window) {
    Notification.requestPermission()
  }
  syncSettings()
}

const updateLanguage = () => {
  // 更新应用语言
  syncSettings()
}

const updateTimezone = () => {
  syncSettings()
}

// ============ 应用主题 ============
const applyTheme = () => {
  let resolvedTheme = theme.value

  if (theme.value === 'auto') {
    // 检测系统主题
    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
}

// ============ 同步设置到服务器 ============
const syncSettings = async () => {
  await $fetch('/api/user/settings', {
    method: 'PUT',
    body: {
      theme: theme.value,
      fontSize: fontSize.value,
      language: language.value,
      timezone: timezone.value,
      emailNotifications: emailNotifications.value === 'true',
      pushNotifications: pushNotifications.value === 'true'
    }
  })
}

// ============ 保存设置 ============
const saveSettings = async () => {
  saving.value = true

  try {
    await syncSettings()
    alert('设置已保存')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败,请重试')
  } finally {
    saving.value = false
  }
}

// ============ 重置设置 ============
const resetSettings = () => {
  if (confirm('确定要恢复默认设置吗?')) {
    theme.value = 'light'
    fontSize.value = 'medium'
    language.value = 'zh-CN'
    timezone.value = 'Asia/Shanghai'
    emailNotifications.value = 'true'
    pushNotifications.value = 'false'

    applyTheme()
    syncSettings()
  }
}

// ============ 初始化 ============
onMounted(() => {
  applyTheme()
  updateFontSize()
})

// ============ 监听系统主题变化 ============
onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  mediaQuery.addEventListener('change', () => {
    if (theme.value === 'auto') {
      applyTheme()
    }
  })
})

// ============ 页面元数据 ============
useHead({
  title: '设置'
})
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.settings-page h1 {
  margin-bottom: 2rem;
}

.setting-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.setting-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item label {
  font-weight: 500;
}

.theme-selector {
  display: flex;
  gap: 1rem;
}

.theme-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-btn:hover {
  border-color: #667eea;
}

.theme-btn.active {
  border-color: #667eea;
  background: #f0f4ff;
}

.theme-icon {
  font-size: 2rem;
}

select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 0.5rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.actions button {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;
}

.actions button:first-child {
  background: #667eea;
  color: white;
}

.actions button:first-child:hover:not(:disabled) {
  background: #5568d3;
}

.actions button:first-child:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.actions button.secondary {
  background: #f0f0f0;
  color: #333;
}

.actions button.secondary:hover {
  background: #e0e0e0;
}
</style>
```

---

### 状态持久化

#### 混合策略(Cookie + State)

```typescript
// composables/usePersistedState.ts
export const usePersistedState = <T>(
  key: string,
  defaultValue: T,
  options: {
    cookie?: boolean
    localStorage?: boolean
    cookieOptions?: any
  } = {}
) => {
  // 从Cookie读取
  const cookie = useCookie<T>(key, options.cookieOptions)

  // 状态值
  const state = useState<T>(key, () => {
    // 优先从Cookie读取
    if (options.cookie && cookie.value !== null) {
      return cookie.value as T
    }

    // 从localStorage读取
    if (options.localStorage && process.client) {
      const stored = localStorage.getItem(key)
      if (stored) {
        return JSON.parse(stored)
      }
    }

    return defaultValue
  })

  // 监听状态变化,同步到存储
  watch(
    state,
    (newValue) => {
      // 同步到Cookie
      if (options.cookie) {
        cookie.value = newValue as any
      }

      // 同步到localStorage
      if (options.localStorage && process.client) {
        localStorage.setItem(key, JSON.stringify(newValue))
      }
    },
    { deep: true }
  )

  return state
}
</script>
```

#### 使用示例

```vue
<template>
  <div>
    <h1>持久化计数器</h1>
    <p>当前值: {{ count }}</p>
    <button @click="count++">+1</button>
    <button @click="count = 0">重置</button>

    <p>刷新页面后数据仍然保留</p>
  </div>
</template>

<script setup lang="ts>
// 使用持久化状态
const count = usePersistedState('counter', 0, {
  cookie: true,
  cookieOptions: {
    maxAge: 60 * 60 * 24 * 365 // 1年
  }
})
</script>
```

---

### 实战案例:用户偏好系统

完整的用户偏好设置系统,包含主题、语言、通知等设置。

#### 项目结构

```bash
composables/
├── useAuth.ts              # 认证状态
├── useTheme.ts             # 主题切换
├── usePreferences.ts       # 用户偏好
└── usePersistedState.ts    # 持久化状态

components/
├── ThemeSwitcher.vue       # 主题切换器
├── LanguageSelector.vue    # 语言选择器
└── PreferencePanel.vue     # 偏好设置面板
```

#### 主题切换器

```vue
<!-- components/ThemeSwitcher.vue -->
<template>
  <div class="theme-switcher">
    <button
      v-for="themeOption in themes"
      :key="themeOption.value"
      class="theme-btn"
      :class="{ active: currentTheme === themeOption.value }"
      @click="switchTheme(themeOption.value)"
      :title="themeOption.label"
    >
      <span class="theme-icon">{{ themeOption.icon }}</span>
    </button>
  </div>
</template>

<script setup lang="ts>
const themes = [
  { value: 'light', label: '浅色', icon: '☀️' },
  { value: 'dark', label: '深色', icon: '🌙' },
  { value: 'auto', label: '跟随系统', icon: '🔄' }
]

// 使用Cookie保存主题
const currentTheme = useCookie<'light' | 'dark' | 'auto'>('theme', {
  default: () => 'light',
  maxAge: 60 * 60 * 24 * 365
})

// 应用主题
const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
  let resolvedTheme = theme

  if (theme === 'auto') {
    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
}

// 切换主题
const switchTheme = (theme: 'light' | 'dark' | 'auto') => {
  currentTheme.value = theme
  applyTheme(theme)

  // 触发主题变化事件
  useEvent('theme-changed', { theme })
}

// 初始化
onMounted(() => {
  applyTheme(currentTheme.value)

  // 监听系统主题变化
  if (currentTheme.value === 'auto') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => applyTheme('auto'))
  }
})
</script>

<style scoped>
.theme-switcher {
  display: flex;
  gap: 0.5rem;
  background: #f5f5f5;
  padding: 0.25rem;
  border-radius: 8px;
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.25rem;
}

.theme-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.theme-btn.active {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark .theme-switcher {
  background: #333;
}

.dark .theme-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dark .theme-btn.active {
  background: #444;
}
</style>
```

#### 语言选择器

```vue
<!-- components/LanguageSelector.vue -->
<template>
  <div class="language-selector">
    <select v-model="currentLanguage" @change="changeLanguage" class="language-select">
      <option v-for="lang in languages" :key="lang.code" :value="lang.code">
        {{ lang.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts>
const languages = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: '한국어', flag: '🇰🇷' }
]

// 使用Cookie保存语言
const currentLanguage = useCookie<string>('language', {
  default: () => 'zh-CN',
  maxAge: 60 * 60 * 24 * 365
})

// 切换语言
const changeLanguage = () => {
  // 这里可以集成i18n
  console.log('语言切换为:', currentLanguage.value)

  // 触发语言变化事件
  useEvent('language-changed', { language: currentLanguage.value })

  // 刷新页面以应用新语言
  setTimeout(() => {
    window.location.reload()
  }, 100)
}

// 初始化
onMounted(() => {
  // 设置HTML lang属性
  document.documentElement.lang = currentLanguage.value
})
</script>

<style scoped>
.language-selector {
  display: inline-block;
}

.language-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
}

.dark .language-select {
  background: #333;
  border-color: #555;
  color: white;
}
</style>
```

#### 偏好设置面板

```vue
<!-- components/PreferencePanel.vue -->
<template>
  <div class="preference-panel">
    <h2>偏好设置</h2>

    <!-- 主题 -->
    <div class="preference-group">
      <label>主题</label>
      <ThemeSwitcher />
    </div>

    <!-- 语言 -->
    <div class="preference-group">
      <label>语言</label>
      <LanguageSelector />
    </div>

    <!-- 字体大小 -->
    <div class="preference-group">
      <label>字体大小</label>
      <div class="font-size-selector">
        <button
          v-for="size in fontSizeOptions"
          :key="size.value"
          class="size-btn"
          :class="{ active: fontSize === size.value }"
          @click="setFontSize(size.value)"
        >
          {{ size.label }}
        </button>
      </div>
    </div>

    <!-- 通知 -->
    <div class="preference-group">
      <label>通知</label>
      <div class="toggle-group">
        <label class="toggle">
          <input
            v-model="emailEnabled"
            type="checkbox"
            @change="updateNotificationSettings"
          />
          <span>邮件通知</span>
        </label>
        <label class="toggle">
          <input
            v-model="pushEnabled"
            type="checkbox"
            @change="updateNotificationSettings"
          />
          <span>推送通知</span>
        </label>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="actions">
      <button @click="savePreferences" :disabled="saving">
        {{ saving ? '保存中...' : '保存设置' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts>
const { updatePreferences } = useUserPreferences()

// 字体大小
const fontSize = useCookie('font-size', {
  default: () => 'medium'
})

const fontSizeOptions = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' }
]

// 通知设置
const emailEnabled = useCookie('email-notifications', {
  default: () => 'true'
})

const pushEnabled = useCookie('push-notifications', {
  default: () => 'false'
})

const saving = ref(false)

const setFontSize = (size: string) => {
  fontSize.value = size

  // 应用字体大小
  const sizes = { small: '14px', medium: '16px', large: '18px' }
  document.documentElement.style.fontSize = sizes[size as keyof typeof sizes]
}

const updateNotificationSettings = () => {
  // 请求推送通知权限
  if (pushEnabled.value === 'true' && 'Notification' in window) {
    Notification.requestPermission()
  }
}

const savePreferences = async () => {
  saving.value = true

  try {
    await updatePreferences({
      fontSize: fontSize.value,
      emailNotifications: emailEnabled.value === 'true',
      pushNotifications: pushEnabled.value === 'true'
    })

    alert('设置已保存')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败,请重试')
  } finally {
    saving.value = false
  }
}

// 初始化
onMounted(() => {
  setFontSize(fontSize.value)
})
</script>

<style scoped>
.preference-panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preference-panel h2 {
  margin: 0 0 1.5rem 0;
}

.preference-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.preference-group label {
  font-weight: 500;
}

.font-size-selector {
  display: flex;
  gap: 0.5rem;
}

.size-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.size-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.toggle input {
  width: 18px;
  height: 18px;
}

.actions {
  margin-top: 2rem;
  text-align: right;
}

.actions button {
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.actions button:hover:not(:disabled) {
  background: #5568d3;
}

.actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
```

---

### 本章小结

#### 状态管理对比

| 方法 | 用途 | 持久化 | SSR安全 |
|------|------|--------|---------|
| `useState` | 跨组件状态 | ❌ | ✅ |
| `useCookie` | Cookie存储 | ✅ | ✅ |
| `usePersistedState` | 持久化状态 | ✅ | ✅ |
| `ref` | 组件内状态 | ❌ | ❌ |

#### Cookie使用建议

1. **敏感信息**: 使用httpOnly和secure
2. **认证Token**: 设置合理的maxAge
3. **用户偏好**: 使用localStorage更合适
4. **跨域Cookie**: 配置domain和sameSite

#### 最佳实践

1. **优先使用useState**: SSR安全的跨组件状态
2. **合理使用Cookie**: 仅存储必要信息
3. **分离关注点**: 认证状态用Cookie,UI状态用State
4. **类型安全**: 使用TypeScript定义状态类型
5. **性能考虑**: 避免过大的状态对象

---

**下一步学习**: 建议继续学习[useCookie与useHead](./chapter-120)掌握Cookie和SEO优化。
