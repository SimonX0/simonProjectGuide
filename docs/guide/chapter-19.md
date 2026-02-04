# TypeScript + Vue3
## TypeScript + Vue3
## 第19章 TypeScript + Vue3

> **学习目标**：掌握Vue3与TypeScript结合使用
> **核心内容**：组件类型定义、Props类型声明、泛型使用

### 组件类型定义

```vue
<script setup lang="ts">
// Props 类型定义
interface Props {
  title: string
  count?: number
  user: User
  tags: string[]
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// Emits 类型定义
interface Emits {
  update: [value: string]
  change: [id: number, newValue: string]
  delete: [id: number]
}

const emit = defineEmits<Emits>()

// Ref 类型
const count = ref<number>(0)
const user = ref<User | null>(null)
const items = ref<string[]>([])

// Reactive 类型
interface State {
  count: number
  user: User | null
  items: string[]
}

const state = reactive<State>({
  count: 0,
  user: null,
  items: []
})
</script>
```

### 组合式函数类型

```typescript
// composables/useUser.ts
import { ref, computed, type Ref, type ComputedRef } from 'vue'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

interface UseUserReturn {
  user: Ref<User | null>
  isLoggedIn: ComputedRef<boolean>
  isAdmin: ComputedRef<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export function useUser(): UseUserReturn {
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      user.value = data.user
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  function logout() {
    user.value = null
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    login,
    logout
  }
}
```

---
