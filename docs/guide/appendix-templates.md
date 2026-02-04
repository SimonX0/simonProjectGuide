# 附录D：代码模板与脚手架

> **为什么需要代码模板？**
>
> 开箱即用的模板能：
> - 统一项目结构
> - 节省初始化时间
> - 避免重复配置
> - 包含最佳实践

## D.1 Vue3 + TypeScript 模板

### 项目结构

```
vue3-ts-template/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/           # 静态资源
│   │   ├── images/
│   │   └── styles/
│   ├── components/       # 公共组件
│   │   └── common/
│   ├── composables/      # 组合式函数
│   ├── layouts/          # 布局组件
│   ├── router/           # 路由配置
│   │   └── index.ts
│   ├── stores/           # Pinia状态管理
│   ├── types/            # TypeScript类型
│   │   └── index.ts
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   ├── App.vue
│   └── main.ts
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus']
        }
      }
    }
  }
})
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path Mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'vue/no-v-html': 'off'
  }
}
```

### package.json

```json
{
  "name": "vue3-ts-template",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "@vueuse/core": "^10.7.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/tsconfig": "^0.5.0",
    "typescript": "~5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0",
    "eslint": "^8.56.0",
    "plugin:vue/vue3-recommended": "^0.0.0",
    "@vue/eslint-config-typescript": "^12.0.0"
  }
}
```

## D.2 Vue3 + Vite + Pinia 模板

### 完整的Pinia Store模板

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string>('')

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name || 'Guest')

  // Actions
  const setUser = (userData: User) => {
    user.value = userData
  }

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  const clearAuth = () => {
    user.value = null
    token.value = ''
  }

  const updateUser = (updates: Partial<User>) => {
    if (user.value) {
      Object.assign(user.value, updates)
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    userName,
    setUser,
    setToken,
    clearAuth,
    updateUser
  }
})
```

## D.3 组件开发模板

### 基础组件模板

```vue
<!-- src/components/common/BaseButton.vue -->
<template>
  <button
    :class="[
      'base-button',
      `base-button--${type}`,
      `base-button--${size}`,
      { 'base-button--disabled': disabled }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary' | 'danger' | 'warning'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
.base-button {
  // 基础样式
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  // 类型样式
  &--primary {
    background-color: #42b883;
    color: white;

    &:hover {
      background-color: #33a06f;
    }
  }

  &--secondary {
    background-color: #6c757d;
    color: white;
  }

  &--danger {
    background-color: #dc3545;
    color: white;
  }

  // 尺寸样式
  &--small {
    padding: 6px 12px;
    font-size: 12px;
  }

  &--medium {
    padding: 8px 16px;
    font-size: 14px;
  }

  &--large {
    padding: 12px 24px;
    font-size: 16px;
  }

  // 禁用状态
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
```

### 表单组件模板

```vue
<!-- src/components/common/BaseInput.vue -->
<template>
  <div class="base-input">
    <label v-if="label" class="base-input__label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'base-input__field',
        { 'base-input__field--error': error }
      ]"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    >

    <span v-if="error" class="base-input__error">
      {{ error }}
    </span>

    <span v-if="hint" class="base-input__hint">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>

<style scoped lang="scss">
.base-input {
  margin-bottom: 16px;

  &__label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #333;

    .required {
      color: #f56c6c;
      margin-left: 4px;
    }
  }

  &__field {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: #42b883;
    }

    &--error {
      border-color: #f56c6c;
    }
  }

  &__error {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #f56c6c;
  }

  &__hint {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
```

## D.4 项目结构模板

### 完整的src目录结构

```
src/
├── App.vue                    # 根组件
├── main.ts                    # 入口文件
│
├── assets/                    # 静态资源
│   ├── images/                # 图片
│   │   ├── logo.png
│   │   └── placeholder.png
│   ├── styles/                # 全局样式
│   │   ├── index.scss         # 样式入口
│   │   ├── variables.scss     # 变量定义
│   │   ├── mixins.scss        # 混入
│   │   └── reset.scss         # 重置样式
│   └── icons/                 # 图标
│
├── components/                # 组件
│   ├── common/                # 通用组件
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseModal.vue
│   │   └── BaseTable.vue
│   ├── layout/                # 布局组件
│   │   ├── Header.vue
│   │   ├── Sidebar.vue
│   │   ├── Footer.vue
│   │   └── Breadcrumb.vue
│   └── business/              # 业务组件
│       ├── UserCard.vue
│       └── ProductList.vue
│
├── views/                     # 页面
│   ├── home/
│   │   └── index.vue
│   ├── about/
│   │   └── index.vue
│   └── user/
│       ├── Profile.vue
│       └── Settings.vue
│
├── router/                    # 路由
│   └── index.ts               # 路由配置
│
├── stores/                    # 状态管理
│   ├── user.ts                # 用户store
│   ├── app.ts                 # 应用store
│   └── index.ts               # store入口
│
├── composables/               # 组合式函数
│   ├── useAuth.ts             # 认证
│   ├── useRequest.ts          # 请求
│   ├── useLocalStorage.ts     # 本地存储
│   └── useTable.ts            # 表格
│
├── api/                       # API接口
│   ├── user.ts                # 用户API
│   ├── auth.ts                # 认证API
│   └── request.ts             # 请求封装
│
├── types/                     # 类型定义
│   ├── user.ts                # 用户类型
│   ├── api.ts                 # API类型
│   └── index.ts               # 类型导出
│
├── utils/                     # 工具函数
│   ├── format.ts              # 格式化
│   ├── validate.ts            # 验证
│   ├── storage.ts             # 存储
│   └── date.ts                # 日期
│
├── directives/                # 自定义指令
│   ├── permission.ts          # 权限指令
│   └── loading.ts             # 加载指令
│
├── constants/                 # 常量
│   ├── index.ts
│   └── enum.ts
│
└── config/                    # 配置文件
    └── index.ts
```

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v2.0**
**作者：小徐**
**邮箱：esimonx@163.com**
