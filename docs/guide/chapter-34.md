# 国际化（I18n）
## # 4.10 国际化（I18n）
## 国际化（I18n）

> **学习目标**：掌握Vue3应用国际化开发技术
> **核心内容**：Vue I18n、语言切换、日期数字格式化、RTL支持

### Vue I18n 安装与配置

#### 安装 Vue I18n

```bash
# Vue I18n 9.x 适用于 Vue3
npm install vue-i18n@9
```

#### 基础配置

```typescript
// src/i18n/index.ts
import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'
import jaJP from './locales/ja-JP.json'

const i18n = createI18n({
  // 使用Composition API模式
  legacy: false,

  // 全局注入 $t
  globalInjection: true,

  // 默认语言
  locale: localStorage.getItem('locale') || 'zh-CN',

  // 备用语言
  fallbackLocale: 'zh-CN',

  // 语言包
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ja-JP': jaJP
  },

  // 缺失翻译时的处理
  missing: (locale, key) => {
    console.warn(`[i18n] Missing translation: ${key} for locale: ${locale}`)
    return key
  },

  // 日期时间格式化
  datetimeFormats: {
    'zh-CN': {
      short: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      }
    },
    'en-US': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      }
    }
  },

  // 数字格式化
  numberFormats: {
    'zh-CN': {
      currency: {
        style: 'currency',
        currency: 'CNY',
        notation: 'standard'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      percent: {
        style: 'percent',
        useGrouping: false
      }
    },
    'en-US': {
      currency: {
        style: 'currency',
        currency: 'USD'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2
      },
      percent: {
        style: 'percent',
        useGrouping: false
      }
    }
  }
})

export default i18n
```

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'

const app = createApp(App)
app.use(i18n)
app.mount('#app')
```

### 语言包组织

#### 语言包结构

```
src/i18n/
├── index.ts
├── locales/
│   ├── zh-CN.json
│   ├── en-US.json
│   ├── ja-JP.json
│   └── modules/
│       ├── common.json
│       ├── user.json
│       ├── product.json
│       └── error.json
└── utils/
    ├── currency.ts
    ├── date.ts
    └── plural.ts
```

#### 中文语言包

```json
// src/i18n/locales/zh-CN.json
{
  "common": {
    "appName": "我的应用",
    "confirm": "确认",
    "cancel": "取消",
    "save": "保存",
    "delete": "删除",
    "edit": "编辑",
    "search": "搜索",
    "loading": "加载中...",
    "noData": "暂无数据",
    "back": "返回",
    "next": "下一步",
    "submit": "提交",
    "reset": "重置"
  },
  "menu": {
    "home": "首页",
    "products": "产品",
    "about": "关于",
    "contact": "联系我们",
    "settings": "设置"
  },
  "user": {
    "title": "用户管理",
    "name": "用户名",
    "email": "邮箱",
    "phone": "手机号",
    "address": "地址",
    "login": "登录",
    "register": "注册",
    "logout": "退出登录",
    "profile": "个人资料",
    "settings": "账号设置",
    "greeting": "你好，{name}！",
    "logoutConfirm": "确定要退出登录吗？"
  },
  "product": {
    "title": "商品列表",
    "name": "商品名称",
    "price": "价格",
    "stock": "库存",
    "category": "分类",
    "addToCart": "加入购物车",
    "buyNow": "立即购买",
    "outOfStock": "缺货",
    "count": "共 {count} 件商品"
  },
  "validation": {
    "required": "{field}不能为空",
    "email": "请输入有效的邮箱地址",
    "phone": "请输入有效的手机号",
    "min": "{field}不能少于{min}个字符",
    "max": "{field}不能超过{max}个字符",
    "between": "{field}必须在{min}和{max}之间"
  },
  "error": {
    "404": "页面不存在",
    "500": "服务器错误",
    "network": "网络错误，请稍后重试",
    "unauthorized": "未授权，请先登录",
    "forbidden": "没有权限访问",
    "default": "发生错误，请稍后重试"
  },
  "time": {
    "justNow": "刚刚",
    "minutesAgo": "{minutes}分钟前",
    "hoursAgo": "{hours}小时前",
    "daysAgo": "{days}天前",
    "monthsAgo": "{months}个月前",
    "yearsAgo": "{years}年前"
  }
}
```

#### 英文语言包

```json
// src/i18n/locales/en-US.json
{
  "common": {
    "appName": "My App",
    "confirm": "Confirm",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "loading": "Loading...",
    "noData": "No data",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "reset": "Reset"
  },
  "menu": {
    "home": "Home",
    "products": "Products",
    "about": "About",
    "contact": "Contact",
    "settings": "Settings"
  },
  "user": {
    "title": "User Management",
    "name": "Username",
    "email": "Email",
    "phone": "Phone",
    "address": "Address",
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "profile": "Profile",
    "settings": "Account Settings",
    "greeting": "Hello, {name}!",
    "logoutConfirm": "Are you sure you want to logout?"
  },
  "product": {
    "title": "Product List",
    "name": "Product Name",
    "price": "Price",
    "stock": "Stock",
    "category": "Category",
    "addToCart": "Add to Cart",
    "buyNow": "Buy Now",
    "outOfStock": "Out of Stock",
    "count": "{count} items"
  },
  "validation": {
    "required": "{field} is required",
    "email": "Please enter a valid email address",
    "phone": "Please enter a valid phone number",
    "min": "{field} must be at least {min} characters",
    "max": "{field} must not exceed {max} characters",
    "between": "{field} must be between {min} and {max}"
  },
  "error": {
    "404": "Page not found",
    "500": "Server error",
    "network": "Network error, please try again later",
    "unauthorized": "Unauthorized, please login first",
    "forbidden": "Access forbidden",
    "default": "An error occurred, please try again later"
  },
  "time": {
    "justNow": "Just now",
    "minutesAgo": "{minutes} minutes ago",
    "hoursAgo": "{hours} hours ago",
    "daysAgo": "{days} days ago",
    "monthsAgo": "{months} months ago",
    "yearsAgo": "{years} years ago"
  }
}
```

---

#### 企业级语言包管理最佳实践

在企业级应用中，语言包管理需要考虑模块化、维护性、自动化翻译等。以下是完整的最佳实践方案。

---

##### 模块化语言包结构

当应用规模增大时，单个语言包文件会变得难以维护。推荐使用模块化结构：

```
src/i18n/
├── index.ts                    # I18n 配置入口
├── locales/                    # 语言包目录
│   ├── index.ts               # 语言包聚合
│   ├── zh-CN/                 # 中文（目录结构）
│   │   ├── index.ts
│   │   ├── common.ts
│   │   ├── modules/
│   │   │   ├── user.ts
│   │   │   ├── product.ts
│   │   │   ├── order.ts
│   │   │   └── dashboard.ts
│   │   └── errors.ts
│   ├── en-US/
│   │   ├── index.ts
│   │   ├── common.ts
│   │   └── modules/
│   │       ├── user.ts
│   │       ├── product.ts
│   │       ├── order.ts
│   │       └── dashboard.ts
│   │   └── errors.ts
│   └── ja-JP/
│       └── ...
├── utils/                      # 工具函数
│   ├── validator.ts           # 翻译完整性检查
│   ├── extractor.ts           # 提取待翻译文本
│   └── formatters.ts          # 自定义格式化
└── types/                      # 类型定义
    └── i18n.d.ts
```

---

##### 模块化语言包实现

```typescript
// src/i18n/locales/zh-CN/common.ts
export default {
  appName: '企业管理系统',
  confirm: '确认',
  cancel: '取消',
  save: '保存',
  delete: '删除',
  edit: '编辑',
  add: '新增',
  search: '搜索',
  reset: '重置',
  submit: '提交',
  back: '返回',
  loading: '加载中...',
  noData: '暂无数据',
  success: '操作成功',
  error: '操作失败',
  warning: '警告',
  info: '提示'
} as const
```

```typescript
// src/i18n/locales/zh-CN/modules/user.ts
export default {
  title: '用户管理',
  username: '用户名',
  email: '邮箱',
  phone: '手机号',
  role: '角色',
  status: '状态',
  login: '登录',
  logout: '退出登录',
  profile: '个人资料',
  settings: '账号设置',
  list: '用户列表',
  add: '添加用户',
  edit: '编辑用户',
  delete: '删除用户',
  export: '导出用户',
  import: '导入用户',
  greeting: '你好，{name}！',
  logoutConfirm: '确定要退出登录吗？',
  status: {
    active: '启用',
    inactive: '禁用',
    locked: '锁定'
  }
} as const
```

```typescript
// src/i18n/locales/zh-CN/modules/product.ts
export default {
  title: '商品管理',
  name: '商品名称',
  price: '价格',
  stock: '库存',
  category: '分类',
  sku: 'SKU编码',
  description: '商品描述',
  images: '商品图片',
  addToCart: '加入购物车',
  buyNow: '立即购买',
  outOfStock: '缺货',
  inStock: '有货',
  count: '共 {count} 件商品',
  status: {
    onSale: '在售',
    offSale: '下架',
    draft: '草稿'
  }
} as const
```

```typescript
// src/i18n/locales/zh-CN/index.ts - 聚合所有模块
import common from './common'
import user from './modules/user'
import product from './modules/product'
import order from './modules/order'
import dashboard from './modules/dashboard'
import errors from './errors'

export default {
  common,
  user,
  product,
  order,
  dashboard,
  errors
}
```

---

##### 类型安全的语言包

```typescript
// src/i18n/types/i18n.d.ts
// 定义语言包类型
export interface LocaleMessages {
  common: typeof import('../locales/zh-CN/common')
  user: typeof import('../locales/zh-CN/modules/user')
  product: typeof import('../locales/zh-CN/modules/product')
  order: typeof import('../locales/zh-CN/modules/order')
  dashboard: typeof import('../locales/zh-CN/modules/dashboard')
  errors: typeof import('../locales/zh-CN/errors')
}

// 翻译键路径类型
export type TranslationKey = // 递归生成所有可能的翻译键
  | keyof LocaleMessages
  | `user.${keyof LocaleMessages['user']}`
  | `product.${keyof LocaleMessages['product']}`
  | `order.${keyof LocaleMessages['order']}`
  // ... 更多模块

// 声明扩展
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends LocaleMessages {}
}
```

---

##### I18n 配置入口（支持模块化）

```typescript
// src/i18n/index.ts
import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'
import jaJP from './locales/ja-JP'

// 支持的语言列表
export const SUPPORT_LOCALES = ['zh-CN', 'en-US', 'ja-JP'] as const
export type SupportedLocale = typeof SUPPORT_LOCALES[number]

// 语言显示名称
export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語'
}

// 默认语言
export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN'

// 从 localStorage 获取保存的语言
function getSavedLocale(): SupportedLocale {
  const saved = localStorage.getItem('locale')
  if (saved && SUPPORT_LOCALES.includes(saved as SupportedLocale)) {
    return saved as SupportedLocale
  }

  // 根据浏览器语言自动选择
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) return 'zh-CN'
  if (browserLang.startsWith('ja')) return 'ja-JP'
  return 'en-US'
}

// 创建 I18n 实例
const i18n = createI18n({
  legacy: false,              // 使用 Composition API 模式
  globalInjection: true,      // 全局注入 $t
  locale: getSavedLocale(),   // 当前语言
  fallbackLocale: DEFAULT_LOCALE, // 回退语言
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ja-JP': jaJP
  },
  missing: (locale, key) => {
    if (import.meta.env.DEV) {
      console.warn(`[i18n] Missing translation: ${key} for locale: ${locale}`)
    }
    return key
  },
  // 日期时间格式
  datetimeFormats: {
    'zh-CN': {
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' }
    },
    'en-US': {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' }
    }
  },
  // 数字格式
  numberFormats: {
    'zh-CN': {
      currency: { style: 'currency', currency: 'CNY' },
      decimal: { style: 'decimal', minimumFractionDigits: 2 }
    },
    'en-US': {
      currency: { style: 'currency', currency: 'USD' },
      decimal: { style: 'decimal', minimumFractionDigits: 2 }
    }
  }
})

// 切换语言
export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.lang = locale

  // 刷新页面以应用新语言（可选）
  // window.location.reload()
}

// 获取当前语言
export function getCurrentLocale(): SupportedLocale {
  return i18n.global.locale.value as SupportedLocale
}

// 导出 I18n 实例
export default i18n
```

---

##### 翻译完整性验证工具

```typescript
// src/i18n/utils/validator.ts
import type { SupportedLocale } from '../index'
import zhCN from '../locales/zh-CN'
import enUS from '../locales/en-US'
import jaJP from '../locales/ja-JP'

// 递归获取所有翻译键
function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = []

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], fullKey))
    } else {
      keys.push(fullKey)
    }
  }

  return keys
}

// 检查翻译完整性
export function validateTranslations() {
  const baseKeys = new Set(getAllKeys(zhCN))
  const locales: Record<string, any> = { 'en-US': enUS, 'ja-JP': jaJP }
  const issues: string[] = []

  for (const [locale, messages] of Object.entries(locales)) {
    const keys = getAllKeys(messages)
    const keySet = new Set(keys)

    // 检查缺失的键
    for (const key of baseKeys) {
      if (!keySet.has(key)) {
        issues.push(`[${locale}] Missing key: ${key}`)
      }
    }

    // 检查多余的键
    for (const key of keys) {
      if (!baseKeys.has(key)) {
        issues.push(`[${locale}] Extra key (not in zh-CN): ${key}`)
      }
    }
  }

  if (issues.length > 0) {
    console.warn('[i18n] Translation issues found:')
    issues.forEach(issue => console.warn(`  - ${issue}`))
  } else {
    console.log('[i18n] All translations are complete!')
  }

  return {
    isValid: issues.length === 0,
    issues
  }
}

// 开发环境自动验证
if (import.meta.env.DEV) {
  validateTranslations()
}
```

---

##### 自动提取待翻译文本

```typescript
// src/i18n/utils/extractor.ts
import fs from 'fs'
import path from 'path'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'

// 提取代码中的所有 $t() 调用
export function extractTranslations(dir: string) {
  const translations = new Set<string>()

  function traverseFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx']
    })

    traverse(ast, {
      // 匹配 $t('key') 或 $t(`key`)
      CallExpression(path) {
        if (
          path.node.callee.type === 'MemberExpression' &&
          (path.node.callee.property as any).name === 't'
        ) {
          const arg = path.node.arguments[0]
          if (arg && (arg.type === 'StringLiteral' || arg.type === 'TemplateLiteral')) {
            translations.add((arg as any).value)
          }
        }
      }
    })
  }

  function traverseDir(currentDir: string) {
    const files = fs.readdirSync(currentDir)

    for (const file of files) {
      const filePath = path.join(currentDir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        traverseDir(filePath)
      } else if (file.match(/\.(vue|ts|js|tsx|jsx)$/)) {
        traverseFile(filePath)
      }
    }
  }

  traverseDir(dir)
  return Array.from(translations)
}

// 生成待翻译报告
export function generateTranslationReport() {
  const keys = extractTranslations('src')
  console.log(`[i18n] Found ${keys.length} translation keys:`)
  keys.forEach(key => console.log(`  - ${key}`))

  // 保存到文件
  fs.writeFileSync(
    'i18n-report.json',
    JSON.stringify({ keys, count: keys.length }, null, 2)
  )
}
```

---

##### 组合式 API 封装

```typescript
// src/composables/useI18n.ts
import { computed } from 'vue'
import { useI18n as useVueI18n } from 'vue-i18n'
import { setLocale, getCurrentLocale, LOCALE_NAMES, type SupportedLocale } from '@/i18n'

export function useI18n() {
  const { t, d, n, te, locale, availableLocales } = useVueI18n()

  // 当前语言
  const currentLocale = computed(() => getCurrentLocale())

  // 当前语言名称
  const currentLocaleName = computed(() => LOCALE_NAMES[currentLocale.value])

  // 是否为 RTL 语言
  const isRTL = computed(() => {
    // 阿拉伯语、希伯来语等是从右到左
    const rtlLocales = ['ar', 'he', 'fa']
    return rtlLocales.some(lang => currentLocale.value.startsWith(lang))
  })

  // 切换语言
  function switchLocale(newLocale: SupportedLocale) {
    setLocale(newLocale)
  }

  // 安全翻译（键不存在时返回键名）
  function safeTranslate(key: string, params?: Record<string, any>): string {
    if (te(key)) {
      return t(key, params)
    }
    if (import.meta.env.DEV) {
      console.warn(`[i18n] Missing translation key: ${key}`)
    }
    return key
  }

  // 批量翻译
  function translateKeys(keys: string[]): Record<string, string> {
    return keys.reduce((acc, key) => {
      acc[key] = safeTranslate(key)
      return acc
    }, {} as Record<string, string>)
  }

  return {
    // Vue I18n 原生方法
    t,
    d,
    n,
    te,
    locale,
    availableLocales,
    // 扩展方法
    currentLocale,
    currentLocaleName,
    isRTL,
    switchLocale,
    safeTranslate,
    translateKeys
  }
}
```

---

##### 在组件中使用

```vue
<!-- src/components/UserTable.vue -->
<template>
  <div class="user-table" :dir="isRTL ? 'rtl' : 'ltr'">
    <!-- 使用翻译 -->
    <h1>{{ t('user.title') }}</h1>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button @click="handleAdd">{{ t('user.add') }}</el-button>
      <el-button @click="handleExport">{{ t('user.export') }}</el-button>
    </div>

    <!-- 表格列定义 -->
    <el-table :data="users">
      <el-table-column :label="t('user.username')" prop="username" />
      <el-table-column :label="t('user.email')" prop="email" />
      <el-table-column :label="t('user.role')" prop="role" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t, switchLocale, currentLocale } = useI18n()
const users = ref([])

function handleAdd() {
  console.log(t('common.add'))
}

function handleExport() {
  console.log(t('user.export'))
}
</script>
```

---

##### 翻译管理最佳实践总结

| 实践项 | 说明 | 示例 |
|--------|------|------|
| **模块化组织** | 按功能模块拆分语言包 | `user.ts`, `product.ts`, `order.ts` |
| **使用 const 断言** | 确保类型安全 | `export default { ... } as const` |
| **键命名规范** | 使用层级结构，点分隔 | `user.list.title` |
| **参数占位符** | 使用命名参数 | `{name}` 优于 `{0}` |
| **复数处理** | 使用 Vue I18n 的复数语法 | `car` vs `cars` |
| **上下文区分** | 不同上下文使用不同键 | `user.save` vs `product.save` |
| **避免硬编码** | 所有用户可见文本都应翻译 | 包括错误消息、占位符 |
| **定期验证** | 使用工具检查翻译完整性 | 开发环境自动验证 |
| **版本管理** | 语言包纳入版本控制 | 与代码同步更新 |
| **自动化翻译** | 使用 AI 辅助翻译，人工校对 | ChatGPT + 人工审核 |

### 使用 Vue I18n

#### 在模板中使用

```vue
<template>
  <div class="page">
    <h1>{{ $t('common.appName') }}</h1>

    <nav>
      <router-link to="/">{{ $t('menu.home') }}</router-link>
      <router-link to="/products">{{ $t('menu.products') }}</router-link>
      <router-link to="/about">{{ $t('menu.about') }}</router-link>
    </nav>

    <div class="greeting">
      <!-- 带参数的翻译 -->
      <p>{{ $t('user.greeting', { name: userName }) }}</p>
    </div>

    <div class="product-count">
      <!-- 复数处理 -->
      <p>{{ $tn('product.count', productCount) }}</p>
    </div>

    <div class="date-example">
      <!-- 日期格式化 -->
      <p>{{ $d(new Date(), 'long') }}</p>
    </div>

    <div class="price-example">
      <!-- 数字格式化 -->
      <p>{{ $n(price, 'currency') }}</p>
      <p>{{ $n(percentage, 'percent') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, d, n, tn } = useI18n()

const userName = ref('张三')
const productCount = ref(5)
const price = ref(1234.56)
const percentage = ref(0.75)
</script>
```

#### 在 Script 中使用

```typescript
import { useI18n } from 'vue-i18n'

export function useUserForm() {
  const { t, te } = useI18n()

  const validationRules = {
    required: (field: string) => ({
      required: true,
      message: t('validation.required', { field })
    }),
    email: () => ({
      type: 'email' as const,
      message: t('validation.email')
    }),
    min: (field: string, min: number) => ({
      min,
      message: t('validation.min', { field, min })
    })
  }

  const getLabel = (key: string): string => {
    return te(key) ? t(key) : key
  }

  return {
    validationRules,
    getLabel
  }
}
```

#### 组合式函数封装

```typescript
// composables/useI18nUtils.ts
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useI18nUtils() {
  const { locale, availableLocales, t, d, n } = useI18n()

  // 当前语言
  const currentLocale = computed({
    get: () => locale.value,
    set: (value: string) => {
      locale.value = value
      localStorage.setItem('locale', value)
      document.documentElement.lang = value
    }
  })

  // 切换语言
  const changeLocale = (newLocale: string) => {
    if (availableLocales.includes(newLocale)) {
      currentLocale.value = newLocale
    }
  }

  // 获取下一个可用语言
  const getNextLocale = () => {
    const currentIndex = availableLocales.indexOf(locale.value)
    const nextIndex = (currentIndex + 1) % availableLocales.length
    return availableLocales[nextIndex]
  }

  // 语言选项
  const localeOptions = computed(() => {
    return [
      { label: '简体中文', value: 'zh-CN' },
      { label: 'English', value: 'en-US' },
      { label: '日本語', value: 'ja-JP' }
    ]
  })

  // 格式化相对时间
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    const months = Math.floor(diff / 2592000000)
    const years = Math.floor(diff / 31536000000)

    if (years > 0) return t('time.yearsAgo', { years })
    if (months > 0) return t('time.monthsAgo', { months })
    if (days > 0) return t('time.daysAgo', { days })
    if (hours > 0) return t('time.hoursAgo', { hours })
    if (minutes > 0) return t('time.minutesAgo', { minutes })
    return t('time.justNow')
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  return {
    currentLocale,
    changeLocale,
    getNextLocale,
    localeOptions,
    formatRelativeTime,
    formatFileSize
  }
}
```

### 语言切换器组件

```vue
<!-- components/LanguageSwitcher.vue -->
<template>
  <div class="language-switcher">
    <el-dropdown @command="handleLanguageChange" trigger="click">
      <span class="language-trigger">
        <span class="language-icon">{{ currentFlag }}</span>
        <span class="language-name">{{ currentLabel }}</span>
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="option in localeOptions"
            :key="option.value"
            :command="option.value"
            :class="{ 'is-active': option.value === currentLocale }"
          >
            <span class="flag">{{ option.flag }}</span>
            <span class="name">{{ option.label }}</span>
            <el-icon v-if="option.value === currentLocale">
              <check />
            </el-icon>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, Check } from '@element-plus/icons-vue'
import { useI18nUtils } from '@/composables/useI18nUtils'

const { currentLocale, changeLocale } = useI18nUtils()

const localeOptions = [
  { label: '简体中文', value: 'zh-CN', flag: '🇨🇳' },
  { label: 'English', value: 'en-US', flag: '🇺🇸' },
  { label: '日本語', value: 'ja-JP', flag: '🇯🇵' }
]

const currentOption = computed(() => {
  return localeOptions.find(opt => opt.value === currentLocale.value) || localeOptions[0]
})

const currentLabel = computed(() => currentOption.value.label)
const currentFlag = computed(() => currentOption.value.flag)

const handleLanguageChange = (locale: string) => {
  changeLocale(locale)
  // 重新加载页面以应用某些依赖语言的外部资源
  window.location.reload()
}
</script>

<style scoped>
.language-switcher {
  display: inline-block;
}

.language-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.3s;
}

.language-trigger:hover {
  background: var(--el-fill-color-light);
}

.language-icon {
  font-size: 18px;
}

.language-name {
  font-size: 14px;
}

.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
}

.el-dropdown-menu__item.is-active {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.flag {
  font-size: 18px;
}

.name {
  flex: 1;
}
</style>
```

### 日期和数字格式化

#### 日期格式化

```typescript
// utils/dateFormatter.ts
import { useI18n } from 'vue-i18n'

export function useDateFormatter() {
  const { d, locale } = useI18n()

  // 格式化日期
  const formatDate = (date: Date | string | number, format?: string) => {
    return d(date, format || 'short')
  }

  // 格式化时间
  const formatTime = (date: Date | string | number) => {
    return d(date, 'long')
  }

  // 格式化为相对时间
  const formatRelative = (timestamp: number) => {
    const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })

    const now = Date.now()
    const diff = timestamp - now

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    const absValue = Math.abs

    if (absValue(years) > 0) return rtf.format(years, 'year')
    if (absValue(months) > 0) return rtf.format(months, 'month')
    if (absValue(days) > 0) return rtf.format(days, 'day')
    if (absValue(hours) > 0) return rtf.format(hours, 'hour')
    if (absValue(minutes) > 0) return rtf.format(minutes, 'minute')
    return rtf.format(seconds, 'second')
  }

  // 自定义日期格式
  const customFormat = (date: Date, format: string) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  return {
    formatDate,
    formatTime,
    formatRelative,
    customFormat
  }
}
```

#### 数字格式化

```typescript
// utils/numberFormatter.ts
import { useI18n } from 'vue-i18n'

export function useNumberFormatter() {
  const { n, locale } = useI18n()

  // 格式化货币
  const formatCurrency = (amount: number, currency?: string) => {
    return n(amount, 'currency')
  }

  // 格式化百分比
  const formatPercent = (value: number) => {
    return n(value, 'percent')
  }

  // 格式化小数
  const formatDecimal = (value: number, minimumFractionDigits = 2) => {
    return new Intl.NumberFormat(locale.value, {
      minimumFractionDigits,
      maximumFractionDigits: minimumFractionDigits
    }).format(value)
  }

  // 格式化大数字（带单位）
  const formatLargeNumber = (num: number): string => {
    const units = ['', 'K', 'M', 'B', 'T']
    let unitIndex = 0
    let value = num

    while (value >= 1000 && unitIndex < units.length - 1) {
      value /= 1000
      unitIndex++
    }

    return `${value.toFixed(value < 10 ? 1 : 0)}${units[unitIndex]}`
  }

  // 格式化序数词
  const formatOrdinal = (num: number): string => {
    const pr = new Intl.PluralRules(locale.value, { type: 'ordinal' })
    const suffixes = {
      'en-US': { one: 'st', two: 'nd', few: 'rd', many: 'th', other: 'th' },
      'zh-CN': { other: '' }
    }

    const rule = pr.select(num)
    const suffix = suffixes[locale.value as keyof typeof suffixes]?.[rule] || ''
    return `${num}${suffix}`
  }

  return {
    formatCurrency,
    formatPercent,
    formatDecimal,
    formatLargeNumber,
    formatOrdinal
  }
}
```

### 复数处理

```typescript
// utils/plural.ts
import { useI18n } from 'vue-i18n'

export function usePlural() {
  const { t, locale, n } = useI18n()

  // 基础复数处理
  const pluralize = (key: string, count: number, params?: Record<string, any>) => {
    return t(key, count, { ...params, n: count })
  }

  // 自定义复数规则
  const formatWithPlural = (
    singular: string,
    plural: string,
    count: number
  ): string => {
    return count === 1 ? singular : plural
  }

  // 使用 Intl.PluralRules
  const getPluralCategory = (count: number): string => {
    const pr = new Intl.PluralRules(locale.value)
    return pr.select(count)
  }

  // 格式化带单位的复数
  const formatItemWithCount = (
    item: string,
    count: number,
    includeCount = true
  ): string => {
    const category = getPluralCategory(count)
    let translatedItem = item

    // 根据语言处理复数
    if (locale.value === 'zh-CN') {
      translatedItem = item
    } else if (category === 'one') {
      translatedItem = item // 英文单数
    } else {
      translatedItem = item + 's' // 英文复数（简化处理）
    }

    return includeCount ? `${count} ${translatedItem}` : translatedItem
  }

  return {
    pluralize,
    formatWithPlural,
    getPluralCategory,
    formatItemWithCount
  }
}
```

```vue
<!-- 使用示例 -->
<template>
  <div>
    <!-- 基础复数 -->
    <p>{{ pluralize('product.count', productCount) }}</p>

    <!-- 自定义复数 -->
    <p>{{ formatItemWithCount('Product', productCount) }}</p>

    <!-- 带参数的复数 -->
    <p>{{ pluralize('cart.items', itemCount, { count: itemCount }) }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlural } from '@/utils/plural'

const productCount = ref(5)
const itemCount = ref(3)

const { pluralize, formatItemWithCount } = usePlural()
</script>
```

### RTL（从右到左）支持

```typescript
// composables/useRTL.ts
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const RTL_LOCALES = ['ar', 'he', 'fa', 'ur']

export function useRTL() {
  const { locale } = useI18n()

  const isRTL = computed(() => {
    return RTL_LOCALES.some(rtlLocale =>
      locale.value.startsWith(rtlLocale)
    )
  })

  // 更新 HTML dir 属性
  watch(isRTL, (rtl) => {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'
    document.documentElement.lang = locale.value
  }, { immediate: true })

  // 获取对齐方式
  const textAlign = computed(() => isRTL.value ? 'right' : 'left')
  const textReverseAlign = computed(() => isRTL.value ? 'left' : 'right')

  // 获取边距方向
  const marginStart = computed(() => isRTL.value ? 'margin-right' : 'margin-left')
  const marginEnd = computed(() => isRTL.value ? 'margin-left' : 'margin-right')
  const paddingStart = computed(() => isRTL.value ? 'padding-right' : 'padding-left')
  const paddingEnd = computed(() => isRTL.value ? 'padding-left' : 'padding-right')

  return {
    isRTL,
    textAlign,
    textReverseAlign,
    marginStart,
    marginEnd,
    paddingStart,
    paddingEnd
  }
}
```

```vue
<!-- RTL感知组件 -->
<template>
  <div :class="{ 'rtl-layout': isRTL }" class="container">
    <header class="header">
      <h1 class="title">{{ $t('app.title') }}</h1>
      <nav class="nav" :style="{ textAlign: textAlign }">
        <router-link to="/">{{ $t('nav.home') }}</router-link>
        <router-link to="/about">{{ $t('nav.about') }}</router-link>
      </nav>
    </header>

    <main class="content">
      <div class="card" :style="{ [marginStart]: '20px' }">
        <p :style="{ textAlign: textAlign }">{{ content }}</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRTL } from '@/composables/useRTL'

const { isRTL, textAlign, marginStart } = useRTL()

const content = '这是一个支持RTL布局的示例'
</script>

<style scoped>
.rtl-layout {
  direction: rtl;
}

.rtl-layout .nav a {
  margin-left: 20px;
  margin-right: 0;
}

.rtl-layout .card {
  margin-left: 0;
  margin-right: 20px;
}
</style>
```

### 翻译文件按需加载

```typescript
// i18n/lazy.ts
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': () => import('./locales/zh-CN.json')
  }
})

// 动态加载语言包
export async function loadLocaleMessages(locale: string) {
  // 如果已加载，直接返回
  if (i18n.global.availableLocales.includes(locale)) {
    return
  }

  // 动态导入语言包
  const messages = await import(`./locales/${locale}.json`)

  // 设置语言包
  i18n.global.setLocaleMessage(locale, messages.default)

  // 切换语言
  i18n.global.locale.value = locale
}

export default i18n
```

```typescript
// 在组件中使用
import { loadLocaleMessages } from '@/i18n/lazy'

const changeLanguage = async (locale: string) => {
  await loadLocaleMessages(locale)
}
```

### 本章小结

| 功能 | 实现方式 | 用途 |
|------|----------|------|
| 文本翻译 | $t() / t() | 界面文本国际化 |
| 日期格式化 | $d() / d() | 日期本地化显示 |
| 数字格式化 | $n() / n() | 货币、百分比本地化 |
| 复数处理 | $tn() / pluralize() | 单复数处理 |
| RTL支持 | direction: rtl | 阿拉伯语、希伯来语 |
| 懒加载 | import() | 按需加载语言包 |

---
