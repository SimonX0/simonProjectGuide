---
title: Vue3高级进阶面试题
---

# Vue3高级进阶面试题

## Vue3响应式深度原理

### Vue3响应式系统的完整实现？（2024-2025大厂必问）

```javascript
// Vue3响应式完整实现
let activeEffect = null;
const effectStack = [];
const targetMap = new WeakMap();

// 1. Reactive函数 - 创建响应式对象
function reactive(target) {
  if (!isObject(target)) return target;

  return new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key);

      const result = Reflect.get(target, key, receiver);

      // 懒代理：只有访问时才递归
      if (isObject(result)) {
        return reactive(result);
      }

      return result;
    },

    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);

      // 值变化时触发更新
      if (oldValue !== value) {
        trigger(target, key);
      }

      return result;
    },

    deleteProperty(target, key) {
      const hasKey = target.hasOwnProperty(key);
      const result = Reflect.deleteProperty(target, key);

      if (hasKey && result) {
        trigger(target, key);
      }

      return result;
    },

    // 支持has操作符
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },

    // 支持for...in
    ownKeys(target) {
      track(target, 'iterate');
      return Reflect.ownKeys(target);
    }
  });
}

// 2. track - 依赖收集
function track(target, key) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

// 3. trigger - 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const effects = new Set();

  // 收集所有需要执行的effect
  const add = (effectsToAdd) => {
    effectsToAdd.forEach(effect => {
      if (effect !== activeEffect) {
        effects.add(effect);
      }
    });
  };

  // 触发当前key的effects
  if (key !== undefined) {
    add(depsMap.get(key));
  }

  // 触发iterate相关的effects（数组长度、对象属性增删）
  add(depsMap.get('iterate'));

  // 执行effects
  effects.forEach(effect => {
    // 如果有调度器，使用调度器
    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  });
}

// 4. ref实现
class RefImpl {
  constructor(value) {
    this._value = toReactive(value);
    this.dep = new Set();
    this.__v_isRef = true;
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newVal) {
    this._value = toReactive(newVal);
    triggerRefValue(this);
  }
}

function ref(value) {
  return new RefImpl(value);
}

function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
  if (activeEffect) {
    trackEffects(ref.dep);
  }
}

function triggerRefValue(ref) {
  triggerEffects(ref.dep);
}

// 5. effect函数
function effect(fn, options = {}) {
  const effectFn = () => {
    try {
      activeEffect = effectFn;
      effectStack.push(effectFn);
      return fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };

  effectFn.deps = [];
  effectFn.options = options;
  effectFn(); // 立即执行一次

  // 返回runner函数
  return effectFn;
}

// 6. computed实现
class ComputedRefImpl {
  constructor(getter) {
    this._value = undefined;
    this._dirty = true;
    this._getter = getter;
    this._dep = new Set();

    // 使用lazy effect
    this._effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
          triggerRefValue(this);
        }
      }
    });
  }

  get value() {
    trackRefValue(this);

    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect();
    }

    return this._value;
  }
}

function computed(getter) {
  return new ComputedRefImpl(getter);
}

// 7. watch实现
function watch(source, cb, options = {}) {
  let getter;
  let oldValue;

  if (isFunction(source)) {
    getter = source;
  } else if (isReactive(source)) {
    getter = () => source;
  } else if (isRef(source)) {
    getter = () => source.value;
  }

  const job = () => {
    const newValue = effectFn();
    if (newValue !== oldValue) {
      cb(newValue, oldValue, onInvalidate);
      oldValue = newValue;
    }
  };

  const effectFn = effect(getter, {
    lazy: true,
    scheduler: job
  });

  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }

  // 返回停止监听函数
  return () => {
    cleanup(effectFn);
  };
}
```

### Vue3.5+新特性有哪些？（2025最新）

```javascript
// 1. Reactive Proxy优化
import { reactive, effect } from 'vue'

const state = reactive({
  user: { name: 'John', profile: { age: 30 } }
})

// Vue3.5: 更高效的深层访问追踪
effect(() => {
  console.log(state.user.profile.age)
  // 只追踪访问的具体路径，不是整个对象
})

// 2. useTemplateRef（Vue3.5+）
<script setup>
import { useTemplateRef } from 'vue'

// 创建模板引用，不需要命名规则
const inputRef = useTemplateRef('input')

function focus() {
  inputRef.value?.focus()
}
</script>

<template>
  <input ref="input" />
</template>

// 3. props解构优化（Vue3.5+）
<script setup>
// 之前：需要toRefs
const props = defineProps<{
  count: number
}>()
const { count } = toRefs(props)

// 现在：直接解构，保持响应式
const { count } = defineProps<{
  count: number
}>()
</script>

// 4. watchPostEffect（Vue3.5+）
import { watchPostEffect } from 'vue'

watchPostEffect(() => {
  // 在DOM更新后执行
  console.log('DOM已更新')
})
```

### shallowRef和shallowReactive使用场景？

```javascript
import { shallowRef, shallowReactive, triggerRef } from 'vue'

// shallowRef：只有.value访问是响应式的
const state = shallowRef({
  count: 0
})

// ❌ 不会触发更新
state.value.count++

// ✅ 触发更新
state.value = { count: 1 }

// triggerRef：强制触发更新
state.value.count++
triggerRef(state) // 手动触发

// 使用场景：大型不可变数据
const largeData = shallowRef([])

// 批量更新
largeData.value = newData // 只触发一次

// shallowReactive：只有顶层属性是响应式的
const state = shallowReactive({
  nested: { count: 0 }
})

// ✅ 触发更新
state.foo = 1

// ❌ 不会触发更新
state.nested.count++

// 使用场景：性能优化，避免深层代理开销
```

## Composition API高级技巧

### 如何实现可复用的组合式函数？

```javascript
// composables/useAsyncState.js
import { ref, shallowRef } from 'vue'

export function useAsyncState(state, promise) {
  const data = shallowRef()
  const error = ref(undefined)
  const isLoading = ref(false)

  const execute = async () => {
    isLoading.value = true
    error.value = undefined

    try {
      const result = await promise
      data.value = result
      state.value = 'success'
    } catch (e) {
      error.value = e
      state.value = 'error'
    } finally {
      isLoading.value = false
    }
  }

  execute()

  return {
    data,
    error,
    isLoading,
    state,
    execute
  }
}

// 使用
<script setup>
import { useAsyncState } from '@/composables/useAsyncState'

const { data, isLoading, error, execute } = useAsyncState(
  ref('idle'),
  fetch('/api/users')
)
</script>
```

### 如何实现防抖/节流的组合式函数？

```javascript
// composables/useDebounceFn.js
import { watchEffect } from 'vue'

export function useDebounceFn(fn, delay = 200) {
  let timeoutId = null

  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// composables/useThrottleFn.js
import { watchEffect } from 'vue'

export function useThrottleFn(fn, delay = 200) {
  let lastTime = 0
  let timeoutId = null

  return function (...args) {
    const now = Date.now()
    const remaining = delay - (now - lastTime)

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastTime = now
      fn.apply(this, args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now()
        timeoutId = null
        fn.apply(this, args)
      }, remaining)
    }
  }
}

// 使用
<script setup>
import { useDebounceFn, useThrottleFn } from '@/composables'

const search = useDebounceFn((query) => {
  console.log('搜索:', query)
}, 500)

const handleScroll = useThrottleFn(() => {
  console.log('滚动')
}, 1000)
</script>
```

### 如何实现Virtual DOM diff算法？

```javascript
// 简化的Vue3 diff算法实现
function patchKeyedChildren(
  c1, // 旧子节点
  c2, // 新子节点
  container
) {
  let i = 0
  const l2 = c2.length
  let e1 = c1.length - 1
  let e2 = l2 - 1

  // 1. 从头开始同步
  while (i <= e1 && i <= e2) {
    const n1 = c1[i]
    const n2 = c2[i]

    if (sameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break
    }

    i++
  }

  // 2. 从尾开始同步
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1]
    const n2 = c2[e2]

    if (sameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break
    }

    e1--
    e2--
  }

  // 3. 如果新节点有剩余
  if (i > e1) {
    if (i <= e2) {
      // 添加新节点
      const nextPos = e2 + 1
      const anchor = nextPos < l2 ? c2[nextPos].el : null

      while (i <= e2) {
        patch(null, c2[i], container, anchor)
        i++
      }
    }
  }
  // 4. 如果旧节点有剩余
  else if (i > e2) {
    // 删除旧节点
    while (i <= e1) {
      remove(c1[i].el)
      i++
    }
  }
  // 5. 复杂情况：使用最长递增子序列算法
  else {
    const s1 = i
    const s2 = i
    const keyToNewIndexMap = new Map()

    // 建立key到索引的映射
    for (i = s2; i <= e2; i++) {
      const nextChild = c2[i]
      keyToNewIndexMap.set(nextChild.key, i)
    }

    let j
    let patched = 0
    const toBePatched = e2 - s2 + 1
    let newIndexToOldIndexMap = new Array(toBePatched).fill(0)

    // 遍历旧节点，找可复用的节点
    for (j = s1; j <= e1; j++) {
      const prevChild = c1[j]

      if (patched >= toBePatched) {
        // 新节点都patch完了，剩下的旧节点删除
        remove(prevChild.el)
        continue
      }

      const newIndex = keyToNewIndexMap.get(prevChild.key)

      if (newIndex === undefined) {
        // 没有对应的key，删除
        remove(prevChild.el)
      } else {
        // 标记为可复用
        newIndexToOldIndexMap[newIndex - s2] = j + 1
        patch(prevChild, c2[newIndex], container)
        patched++
      }
    }

    // 计算最长递增子序列
    const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap)

    j = increasingNewIndexSequence.length - 1

    // 移动和挂载节点
    for (let i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i
      const nextChild = c2[nextIndex]
      const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

      if (newIndexToOldIndexMap[i] === 0) {
        // 新节点，挂载
        patch(null, nextChild, container, anchor)
      } else {
        // 移动节点
        move(nextChild.el, container, anchor)
      }
    }
  }
}

// 最长递增子序列算法
function getSequence(arr) {
  const p = arr.slice()
  const result = [0]

  let i, j, u, v, c
  const len = arr.length

  for (i = 0; i < len; i++) {
    const arrI = arr[i]

    if (arrI !== 0) {
      j = result[result.length - 1]

      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }

      u = 0
      v = result.length - 1

      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }

      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }

  u = result.length
  v = result[u - 1]

  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }

  return result
}
```

## Vue3编译器优化

### 静态提升（Static Hoisting）？

```javascript
// 编译前
<template>
  <div>
    <span>静态内容</span>
    <span>{{ count }}</span>
    <span>静态内容</span>
  </div>
</template>

// 编译后
const _hoisted_1 = /*#__PURE__*/ createVNode('span', null, '静态内容')
const _hoisted_2 = /*#__PURE__*/ createVNode('span', null, '静态内容')

function render(_ctx, _cache) {
  return openBlock(), createBlock('div', null, [
    _hoisted_1,
    createVNode('span', null, toDisplayString(_ctx.count), 1 /* TEXT */),
    _hoisted_2
  ])
}

// 静态节点被提升到渲染函数外，避免重复创建
```

### Patch Flags优化？

```javascript
// Vue3使用patch flags标记节点需要更新的内容
const PatchFlags = {
  TEXT: 1,              // 动态文本
  CLASS: 1 << 1,        // 动态class
  STYLE: 1 << 2,        // 动态style
  PROPS: 1 << 3,        // 动态属性（除class/style）
  FULL_PROPS: 1 << 4,   // 有动态key的属性
  EVENT_LISTENER: 1 << 5, // 动态事件监听器
}

// 编译前
<template>
  <div :id="id" :class="cls">{{ text }}</div>
</template>

// 编译后
function render(_ctx, _cache) {
  return createVNode('div', {
    id: _ctx.id,
    class: _ctx.cls
  }, _ctx.text, 1 /* TEXT */ | 2 /* CLASS */)
  // patch flags标记只需要更新文本和class
}

// 更新时只更新标记的部分，提高性能
```

### Tree Shaking优化？

```javascript
// Vue3支持Tree Shaking，只打包使用的API

// 例子：只使用了ref和computed
import { ref, computed } from 'vue'

// 打包时只会包含ref和computed的代码
// 不会包含未使用的watch、reactive等

// 编译前源码
import { ref, reactive, computed, watch } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

// 打包后体积分析：
// Vue2: 必须打包整个Vue (~90KB)
// Vue3: 只打包ref和computed (~15KB)

// 使用ES Module构建
export { ref } from './ref'
export { reactive } from './reactive'
export { computed } from './computed'

// Rollup/Treeshaking可以移除未使用的导出
```

## Vue3性能优化实战

### 长列表性能优化最佳实践？

```vue
<template>
  <!-- 1. 虚拟滚动 -->
  <RecycleScroller
    :items="items"
    :item-size="50"
    key-field="id"
    v-slot="{ item }"
  >
    <div :style="{ height: '50px' }">
      {{ item.name }}
    </div>
  </RecycleScroller>

  <!-- 2. 分页加载 -->
  <div v-for="item in displayedItems" :key="item.id">
    {{ item.name }}
  </div>

  <!-- 3. 冻结不需要响应式的数据 -->
  <script setup>
  import { ref, markRaw } from 'vue'

  // ❌ 所有数据都是响应式
  const items = ref([...])

  // ✅ 大型配置对象使用markRaw
  const config = markRaw({
    // 大型配置
    options: [...],
    rules: [...]
  })

  // ✅ 冻结静态数据
  const staticData = Object.freeze([...])

  // ✅ 使用shallowRef
  const largeList = shallowRef([])

  // 4. 懒加载组件
  const HeavyComponent = defineAsyncComponent(() =>
    import('./HeavyComponent.vue')
  )
  </script>

  <!-- 5. v-once渲染一次 -->
  <span v-once>{{ staticContent }}</span>

  <!-- 6. v-memo条件缓存 -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected]">
    <p>ID: {{ item.id }}</p>
    <p>Selected: {{ item.selected }}</p>
    <!-- 只有id或selected变化时才重新渲染 -->
  </div>
</template>
```

### 大表单性能优化？

```vue
<script setup>
import { reactive, computed, shallowRef } from 'vue'

// ❌ 不好：所有字段都是响应式
const formData = reactive({
  field1: '',
  field2: '',
  // ...1000个字段
})

// ✅ 好：分组响应式
const basicInfo = reactive({
  name: '',
  email: ''
})

const workInfo = reactive({
  company: '',
  position: ''
})

// ✅ 更好：使用shallowRef + 按需更新
const formData = shallowRef({})

const updateField = (field, value) => {
  formData.value = {
    ...formData.value,
    [field]: value
  }
}

// ✅ 最佳：使用Proxies实现深度响应式但只追踪访问的属性
import { reactive } from 'vue'

const form = reactive(new Proxy({}, {
  set(target, key, value) {
    target[key] = value
    // 只在字段被访问时才建立响应式连接
    return true
  }
}))

// 使用computed缓存计算结果
const validationErrors = computed(() => {
  const errors = {}
  if (!formData.value.name) {
    errors.name = '姓名必填'
  }
  if (!formData.value.email) {
    errors.email = '邮箱必填'
  }
  return errors
})

// 防抖验证
import { useDebounceFn } from '@vueuse/core'

const validateField = useDebounceFn((field, value) => {
  // 验证逻辑
}, 300)
</script>
```

### 组件懒加载与异步组件？

```javascript
// 1. 基础异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)

// 2. 带配置的异步组件
const AsyncComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,        // 延迟200ms显示loading
  timeout: 10000,    // 10秒超时
  suspensible: true  // 与Suspense配合
})

// 3. 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import(
      /* webpackChunkName: "dashboard" */
      /* webpackPrefetch: true */
      '@/views/Dashboard.vue'
    )
  }
]

// 4. 条件加载
const AdminPanel = defineAsyncComponent(() =>
  isAdmin.value
    ? import('./AdminPanel.vue')
    : import('./UserPanel.vue')
)

// 5. 使用Suspense
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>

    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

// 6. 组件预加载
onMounted(() => {
  // 预加载可能需要的组件
  import('./HeavyComponent.vue')
})
```

## Vue3状态管理进阶

### Pinia最佳实践模式？

```javascript
// stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 1. State - 使用ref
  const user = ref(null)
  const token = ref('')
  const permissions = ref([])

  // 2. Getters - 使用computed
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name ?? '')
  const hasPermission = computed(() => (permission) => {
    return permissions.value.includes(permission)
  })

  // 3. Actions - 普通函数
  async function login(credentials) {
    const res = await api.login(credentials)
    user.value = res.user
    token.value = res.token
    permissions.value = res.permissions

    // 持久化
    localStorage.setItem('token', res.token)
  }

  function logout() {
    user.value = null
    token.value = ''
    permissions.value = []
    localStorage.removeItem('token')
  }

  async function fetchUser() {
    const res = await api.getUser()
    user.value = res
  }

  // 4. $persist持久化
  return {
    user,
    token,
    permissions,
    isLoggedIn,
    userName,
    hasPermission,
    login,
    logout,
    fetchUser
  }
})

// 使用持久化插件
// main.js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// stores/user.js
export const useUserStore = defineStore('user', () => {
  // ...
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token', 'user'] // 只持久化部分state
  }
})
```

### 跨组件通信方案？

```javascript
// 1. Provide/Inject - 跨层级通信
// parent.js
import { provide, ref, readonly } from 'vue'

export default {
  setup() {
    const theme = ref('light')

    // 提供只读数据，防止子组件修改
    provide('theme', readonly(theme))
    provide('toggleTheme', () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    })

    return { theme }
  }
}

// child.js
import { inject } from 'vue'

export default {
  setup() {
    const theme = inject('theme')
    const toggleTheme = inject('toggleTheme')

    return { theme, toggleTheme }
  }
}

// 2. EventBus - 兄弟组件通信
// utils/eventBus.js
import { ref } from 'vue'

export const eventBus = ref({
  events: {}
})

export function useEventBus() {
  function on(event, callback) {
    if (!eventBus.value.events[event]) {
      eventBus.value.events[event] = []
    }
    eventBus.value.events[event].push(callback)
  }

  function emit(event, data) {
    if (eventBus.value.events[event]) {
      eventBus.value.events[event].forEach(cb => cb(data))
    }
  }

  function off(event, callback) {
    if (eventBus.value.events[event]) {
      eventBus.value.events[event] =
        eventBus.value.events[event].filter(cb => cb !== callback)
    }
  }

  return { on, emit, off }
}

// 3. useState - 组合式API状态共享
// composables/useState.js
import { ref, watchEffect } from 'vue'

const states = new Map()

export function useState(key, initialValue) {
  if (!states.has(key)) {
    states.set(key, ref(initialValue))
  }

  const state = states.get(key)

  watchEffect(() => {
    console.log(`${key} changed:`, state.value)
  })

  return state
}

// 使用
// component-a.js
const count = useState('count', 0)
count.value++

// component-b.js
const count = useState('count', 0)
console.log(count.value) // 1

// 4. mitt - 第三方事件总线
import mitt from 'mitt'

const emitter = mitt()

export function useMitt() {
  function on(event, callback) {
    emitter.on(event, callback)
  }

  function emit(event, data) {
    emitter.emit(event, data)
  }

  function off(event, callback) {
    emitter.off(event, callback)
  }

  return { on, emit, off }
}
```

## Vue3与TypeScript最佳实践

### 如何在Vue3中使用TypeScript？

```typescript
// 1. 组件Props类型定义
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  user: {
    name: string
    age: number
  }
}

// withDefaults定义默认值
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// 2. Emits类型定义
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
  (e: 'submit', data: FormData): void
}

const emit = defineEmits<Emits>()

// 3. Ref类型定义
import { ref } from 'vue'

interface User {
  name: string
  age: number
}

const user = ref<User>({
  name: 'John',
  age: 30
})

// 4. Reactive类型定义
import { reactive } from 'vue'

interface State {
  count: number
  user: User | null
}

const state = reactive<State>({
  count: 0,
  user: null
})

// 5. Computed类型定义
const doubled = computed<number>(() => count.value * 2)

// 6. 泛型组件
<script setup lang="ts" generic="T extends { id: number }">
defineProps<{
  items: T[]
}>()
</script>

// 7. 组合式函数类型定义
// composables/useFetch.ts
import { ref } from 'vue'

interface UseFetchOptions<T> {
  url: string
  initialData?: T
}

interface UseFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
  fetch: () => Promise<void>
}

export function useFetch<T>(
  options: UseFetchOptions<T>
): UseFetchReturn<T> {
  const data = ref<T | null>(options.initialData ?? null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    try {
      const res = await fetch(options.url)
      data.value = await res.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { data, error, loading, fetch }
}

// 使用
interface User {
  id: number
  name: string
}

const { data, loading, fetch } = useFetch<User>({
  url: '/api/user'
})
</template>
```

### Vue3插件开发与类型声明？

```typescript
// 1. 插件开发
// plugins/myPlugin.ts
import { App } from 'vue'

interface MyPluginOptions {
  message: string
}

export const myPlugin = {
  install(app: App, options: MyPluginOptions) {
    // 1. 添加全局属性
    app.config.globalProperties.$myPlugin = {
      message: options.message,
      hello() {
        console.log(this.message)
      }
    }

    // 2. 提供依赖注入
    app.provide('pluginOptions', options)

    // 3. 添加全局指令
    app.directive('my-directive', {
      mounted(el, binding) {
        el.textContent = binding.value
      }
    })

    // 4. 添加全局组件
    app.component('MyComponent', MyComponent)
  }
}

// main.ts
import { createApp } from 'vue'
import { myPlugin } from './plugins/myPlugin'

const app = createApp(App)
app.use(myPlugin, { message: 'Hello Vue3' })

// 2. 类型声明
// plugins/myPlugin.d.ts
import { App } from 'vue'

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $myPlugin: {
      message: string
      hello(): void
    }
  }
}

export interface MyPluginOptions {
  message: string
}

export const myPlugin: {
  install(app: App, options: MyPluginOptions): void
}

// 3. 使用插件
// 组件中使用
<script setup lang="ts">
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
instance?.appContext.config.globalProperties.$myPlugin.hello()
</script>
```

## Vue3自定义Hooks

### 常用自定义Hooks实现？

```typescript
// composables/useLocalStorage.ts
import { ref, watchEffect } from 'vue'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
) {
  const storedValue = localStorage.getItem(key)

  const value = ref<T>(
    storedValue ? JSON.parse(storedValue) : initialValue
  )

  watchEffect(() => {
    localStorage.setItem(key, JSON.stringify(value.value))
  })

  return value
}

// composables/useIntersectionObserver.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useIntersectionObserver(
  target: Ref<HTMLElement | null>,
  options?: IntersectionObserverInit
) {
  const isIntersecting = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(([entry]) => {
      isIntersecting.value = entry.isIntersecting
    }, options)

    if (target.value) {
      observer.observe(target.value)
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { isIntersecting }
}

// composables/usePagination.ts
import { ref, computed } from 'vue'

export function usePagination<T>(
  items: Ref<T[]>,
  pageSize: number = 10
) {
  const currentPage = ref(1)

  const totalPages = computed(() =>
    Math.ceil(items.value.length / pageSize)
  )

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return items.value.slice(start, end)
  })

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage
  }
}

// composables/useClipboard.ts
import { ref } from 'vue'

export function useClipboard() {
  const text = ref('')
  const supported = ref(!!navigator.clipboard)
  const error = ref<Error | null>(null)

  async function copy(toCopy: string) {
    if (!supported.value) {
      error.value = new Error('Clipboard API not supported')
      return
    }

    try {
      await navigator.clipboard.writeText(toCopy)
      text.value = toCopy
      error.value = null
    } catch (e) {
      error.value = e as Error
    }
  }

  return { text, supported, error, copy }
}
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
