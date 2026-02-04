# 第45章：Vue3组件库开发完整指南

## 第45章 Vue3组件库开发完整指南

> **学习目标**：从零开始搭建企业级 Vue3 组件库
> **核心内容**：组件库架构、开发规范、构建发布、文档生成

### 45.1 组件库架构设计

#### 45.1.1 Monorepo 架构

```
my-component-lib/
├── packages/                    # Monorepo 包管理
│   ├── components/             # 核心组件包
│   ├── theme/                  # 主题包
│   ├── utils/                  # 工具函数包
│   └── docs/                   # 文档站点
├── pnpm-workspace.yaml         # PNPM 工作空间配置
├── package.json
└── tsconfig.json
```

#### 45.1.2 项目初始化

```bash
# 创建 Monorepo 项目
mkdir my-component-lib && cd my-component-lib

# 初始化 PNPM workspace
pnpm init
echo "packages:" > pnpm-workspace.yaml
echo "  - 'packages/*'" >> pnpm-workspace.yaml

# 安装开发依赖
pnpm add -D -w typescript vite @vitejs/plugin-vue vue-tsc
pnpm add -w vue
```

### 45.2 核心组件开发

```vue
<!-- packages/components/src/button/Button.vue -->
<template>
  <button
    :class="buttonClass"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading">⏳</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'default'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const buttonClass = computed(() => [
  'my-button',
  `my-button--${props.type}`,
  `my-button--${props.size}`
])

function handleClick(e: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', e)
  }
}
</script>

<style scoped>
.my-button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.my-button--primary { background: #409eff; color: white; }
.my-button--small { padding: 4px 12px; font-size: 12px; }
.my-button--large { padding: 12px 24px; font-size: 16px; }
</style>
```

### 45.3 组件库构建

```typescript
// packages/components/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MyLib',
      fileName: 'my-lib'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' }
      }
    }
  }
})
```

### 45.4 文档生成

```bash
# 安装 VitePress
pnpm add -D -w vitepress

# 初始化文档
cd packages/docs
pnpm vitepress init
```

### 45.5 本章小结

| 内容 | 核心要点 |
|------|----------|
| **架构设计** | Monorepo、pnpm workspace |
| **组件开发** | TypeScript、Props/Emits |
| **构建配置** | Vite 打包、外部依赖 |
| **文档生成** | VitePress |

---
