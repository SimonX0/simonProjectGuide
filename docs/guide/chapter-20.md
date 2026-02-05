# 高级特性
## 高级特性
## 高级特性

> **学习目标**：掌握Vue3高级特性
> **核心内容**：Teleport、Suspense、自定义指令、过渡动画

### Teleport 传送门

```vue
<!-- Modal.vue -->
<script setup lang="ts">
interface Props {
  isOpen: boolean
  title: string
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function close() {
  emit('close')
}

function confirm() {
  emit('confirm')
}
</script>

<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="modal-mask" @click.self="close">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="close-btn" @click="close">×</button>
          </div>

          <div class="modal-body">
            <slot></slot>
          </div>

          <div class="modal-footer">
            <button @click="close">取消</button>
            <button class="primary" @click="confirm">确定</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
```

### 自定义指令

```typescript
// directives/focus.ts
import type { Directive } from 'vue'

export const vFocus: Directive = {
  mounted(el) {
    el.focus()
  }
}
```

```typescript
// directives/permission.ts
import type { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

export const vPermission: Directive = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()

    if (value && !userStore.permissions.includes(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}
```

```typescript
// directives/index.ts
import { vFocus } from './focus'
import { vPermission } from './permission'

export default {
  install(app: any) {
    app.directive('focus', vFocus)
    app.directive('permission', vPermission)
  }
}
```

```typescript
// main.ts
import directives from './directives'

app.use(directives)
```

```vue
<!-- 使用自定义指令 -->
<template>
  <input v-focus>
  <button v-permission="'admin'">删除</button>
</template>
```

---
