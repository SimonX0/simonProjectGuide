---
title: Vue3核心面试题
---

# Vue3核心面试题

## 响应式原理

### Vue3响应式原理是什么？

Vue3使用Proxy实现响应式，相比Vue2的Object.defineProperty有以下优势：

1. **可以监听对象和数组的所有操作**
2. **不需要初始化时遍历所有属性**
3. **性能更好，尤其对于大型对象**
4. **支持Map、Set、WeakMap、WeakSet**

**核心实现**：

```javascript
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key);
      const result = Reflect.get(target, key, receiver);
      // 嵌套对象递归代理
      return typeof result === 'object' ? reactive(result) : result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      // 触发更新
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      if (result) {
        trigger(target, key);
      }
      return result;
    }
  });
}
```

### ref和reactive的区别？

| 特性 | ref | reactive |
|------|-----|----------|
| 用途 | 基本类型 | 对象类型 |
| 访问 | 需要.value | 直接访问 |
| 解包 | 模板自动解包 | 不需要 |
| 重新赋值 | 可以直接替换 | 不建议直接替换 |

```javascript
import { ref, reactive } from 'vue';

// ref - 基本类型
const count = ref(0);
count.value++;  // 需要.value

// 在模板中自动解包
// <template>{{ count }}</template>

// reactive - 对象
const state = reactive({
  count: 0,
  name: 'Vue3'
});
state.count++;  // 直接访问

// ❌ 错误：不能直接替换reactive对象
// state = reactive({ count: 1 });

// ✅ 正确：逐个属性赋值
Object.assign(state, { count: 1 });
```

### 为什么模板中不需要.value？

Vue3在编译时会自动解包ref，但只在顶层生效：

```vue
<template>
  <!-- 顶层自动解包 -->
  <div>{{ count }}</div>

  <!-- 对象属性自动解包 -->
  <div>{{ state.count }}</div>

  <!-- 嵌套时需要.value -->
  <div>{{ obj.count + 1 }}</div>  <!-- 需要运算时会自动解包 -->

  <!-- 数组或map中需要.value -->
  <div v-for="item in [count]">{{ item }}</div>  <!-- 不自动解包 -->
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);
const state = reactive({ count });
</script>
```

## 组合式API

### 什么是组合式函数（Composables）？

组合式函数是利用组合式API封装的可复用状态逻辑：

```javascript
// useMouse.js - 鼠标位置追踪
import { ref, onMounted, onUnmounted } from 'vue';

export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  function update(e) {
    x.value = e.pageX;
    y.value = e.pageY;
  }

  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));

  return { x, y };
}

// 使用
import { useMouse } from './useMouse';

const { x, y } = useMouse();
```

**命名约定**：组合式函数约定以"use"开头。

### setup函数的作用？

setup是组合式API的入口点：
1. **在组件创建前执行**
2. **this不可用**（因为还未创建实例）
3. **返回值会暴露给模板**

```javascript
import { ref, computed } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const doubled = computed(() => count.value * 2);

    // 返回值会暴露给模板
    return {
      count,
      doubled
    };
  }
};
```

**推荐使用`<script setup>`语法糖**：

```vue
<script setup>
import { ref, computed } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>
```

### computed和watch的区别？

| 特性 | computed | watch |
|------|----------|-------|
| 用途 | 派生状态 | 副作用 |
| 返回 | 返回值 | 无返回值 |
| 缓存 | 有缓存 | 无缓存 |
| 异步 | 不支持 | 支持 |
| 立即执行 | 懒执行 | 可配置immediate |

```javascript
import { ref, computed, watch } from 'vue';

const count = ref(0);

// computed - 有缓存，依赖不变不重新计算
const doubled = computed(() => count.value * 2);

// watch - 监听变化，执行副作用
watch(count, (newVal, oldVal) => {
  console.log(`count changed from ${oldVal} to ${newVal}`);
});

// watchEffect - 自动追踪依赖
watchEffect(() => {
  console.log(`count is ${count.value}`);
});
```

### watch和watchEffect的区别？

| 特性 | watch | watchEffect |
|------|-------|-------------|
| 依赖 | 显式指定 | 自动追踪 |
| 懒执行 | 默认懒执行 | 立即执行 |
| 访问旧值 | 可以 | 不可以 |
| 性能 | 更好（按需执行） | 可能不必要执行 |

```javascript
const count = ref(0);
const name = ref('Vue3');

// watch - 显式指定依赖
watch(
  [count, name],
  ([newCount, newName], [oldCount, oldName]) => {
    console.log(`count: ${oldCount} -> ${newCount}`);
    console.log(`name: ${oldName} -> ${newName}`);
  }
);

// watchEffect - 自动追踪依赖
watchEffect(() => {
  console.log(`count is ${count.value}, name is ${name.value}`);
});
```

## 生命周期

### Vue3生命周期有哪些？

Vue3生命周期钩子（组合式API）：

| 选项式API | 组合式API | 说明 |
|----------|-----------|------|
| beforeCreate | setup() | 实例创建前 |
| created | setup() | 实例创建后 |
| beforeMount | onBeforeMount | 挂载前 |
| mounted | onMounted | 挂载完成 |
| beforeUpdate | onBeforeUpdate | 更新前 |
| updated | onUpdated | 更新完成 |
| beforeUnmount | onBeforeUnmount | 卸载前 |
| unmounted | onUnmounted | 卸载完成 |

```vue
<script setup>
import { onMounted, onUpdated, onUnmounted } from 'vue';

onMounted(() => {
  console.log('组件已挂载');
});

onUpdated(() => {
  console.log('组件已更新');
});

onUnmounted(() => {
  console.log('组件已卸载');
});
</script>
```

### setup和生命周期的关系？

setup在所有生命周期钩子之前执行：

```javascript
// 执行顺序
setup()           // 1. setup执行
  ↓
onBeforeMount()   // 2. 挂载前
  ↓
onMounted()       // 3. 挂载完成
  ↓
onBeforeUpdate()  // 4. 更新前
  ↓
onUpdated()       // 5. 更新完成
  ↓
onBeforeUnmount() // 6. 卸载前
  ↓
onUnmounted()     // 7. 卸载完成
```

## 其他核心问题

### key的作用？

key用于Vue的虚拟DOM diff算法，帮助识别节点：
1. **提高diff性能**
2. **保持组件状态**
3. **避免复用问题**

```vue
<!-- ❌ 错误：使用index作为key -->
<li v-for="(item, index) in list" :key="index">{{ item.name }}</li>

<!-- ✅ 正确：使用唯一ID作为key -->
<li v-for="item in list" :key="item.id">{{ item.name }}</li>
```

### v-if和v-show的区别？

| 特性 | v-if | v-show |
|------|------|--------|
| 渲染 | 条件渲染 | 始终渲染 |
| 切换 | 创建/销毁 | display属性 |
| 初始开销 | 较小 | 较大 |
| 切换开销 | 较大 | 较小 |
| 适用场景 | 很少改变 | 频繁切换 |

```vue
<!-- v-if - 条件渲染，false时不渲染DOM -->
<div v-if="show">Hello</div>

<!-- v-show - 始终渲染，false时display:none -->
<div v-show="show">Hello</div>
```

### 组件通信方式有哪些？

1. **Props / Emit**：父子通信
2. **Provide / Inject**：跨层级通信
3. **Expose / Ref**：父访问子
4. **EventBus**：任意组件（Vue3推荐使用mitt）
5. **Vuex / Pinia**：状态管理
6. **Slots**：插槽分发

## 2024-2025大厂高频Vue3面试题（30+题）

### 响应式进阶

31. **Vue3的响应式原理和Vue2有什么本质区别？（字节、阿里必问）**
   ```javascript
   // Vue2 - Object.defineProperty
   // 缺点：
   // 1. 无法检测对象属性的添加/删除
   // 2. 无法监控数组下标变化
   // 3. 必须遍历所有属性（性能差）

   // Vue3 - Proxy
   // 优势：
   // 1. 可以监听对象所有操作（添加、删除、in等）
   // 2. 可以监听数组所有操作（索引、长度等）
   // 3. 懒代理，按需代理（性能好）
   // 4. 支持Map、Set、WeakMap、WeakSet

   // Vue3实现简化版
   function reactive(obj) {
     if (typeof obj !== 'object' || obj === null) return obj

     return new Proxy(obj, {
       get(target, key, receiver) {
         const res = Reflect.get(target, key, receiver)
         track(target, key)  // 依赖收集
         return typeof res === 'object' ? reactive(res) : res
       },
       set(target, key, value, receiver) {
         const oldValue = target[key]
         const res = Reflect.set(target, key, value, receiver)
         if (oldValue !== value) {
           trigger(target, key)  // 触发更新
         }
         return res
       }
     })
   }
   ```

32. **什么是依赖收集？如何实现的？（美团高频）**
   ```javascript
   // Vue3使用WeakMap存储依赖
   // target -> key -> Set(effects)

   const targetMap = new WeakMap()
   let activeEffect = null

   // 依赖收集
   function track(target, key) {
     if (!activeEffect) return

     let depsMap = targetMap.get(target)
     if (!depsMap) {
       targetMap.set(target, (depsMap = new Map()))
     }

     let dep = depsMap.get(key)
     if (!dep) {
       depsMap.set(key, (dep = new Set()))
     }

     dep.add(activeEffect)
   }

   // 触发更新
   function trigger(target, key) {
     const depsMap = targetMap.get(target)
     if (!depsMap) return

     const dep = depsMap.get(key)
     if (dep) {
       dep.forEach(effect => effect())
     }
   }

   // effect使用
   function effect(fn) {
     activeEffect = fn
     fn()
     activeEffect = null
   }
   ```

33. **ref为什么需要.value？toRef和toRefs有什么用？（腾讯必问）**
   ```javascript
   import { ref, toRef, toRefs } from 'vue'

   // ref为什么需要.value
   // 因为ref是一个对象，通过.value访问值
   const count = ref(0)
   // RefImpl { value: 0 }

   // toRef - 为响应式对象的某个属性创建ref
   const state = reactive({ count: 0 })
   const countRef = toRef(state, 'count')
   // countRef和state.count保持同步

   // toRefs - 将响应式对象的所有属性转为ref
   const state = reactive({ count: 0, name: 'Vue' })
   const { count, name } = toRefs(state)
   // 解构后仍然保持响应性

   // 使用场景：解构props时
   const props = defineProps({ count: Number })
   const { count } = toRefs(props)  // 保持响应性
   ```

34. **shallowRef和shallowReactive有什么用？（阿里高频）**
   ```javascript
   import { shallowRef, shallowReactive, triggerRef } from 'vue'

   // shallowRef - 只有.value访问是响应式的
   const state = shallowRef({ count: 0 })
   state.value.count++  // ❌ 不会触发更新
   state.value = { count: 1 }  // ✅ 会触发更新

   // shallowReactive - 只有第一层是响应式的
   const state = shallowReactive({
     nested: { count: 0 }
   })
   state.nested.count++  // ❌ 不会触发更新
   state.nested = { count: 1 }  // ✅ 会触发更新

   // triggerRef - 手动触发shallowRef更新
   const state = shallowRef({ count: 0 })
   state.value.count++
   triggerRef(state)  // 手动触发更新

   // 使用场景：大型数据结构，不需要深层响应式
   ```

35. **readonly和shallowReadonly的区别？（字节高频）**
   ```javascript
   import { readonly, shallowReadonly } from 'vue'

   // readonly - 深度只读
   const original = reactive({ count: 0 })
   const copy = readonly(original)

   copy.count++  // ⚠️ 警告：不能修改只读属性

   // shallowReadonly - 只有第一层只读
   const state = shallowReadonly({
     nested: { count: 0 }
   })
   state.nested.count++  // ✅ 可以修改
   state.nested = { count: 1 }  // ❌ 不能修改

   // 使用场景：
   // 1. 保护props不被修改
   // 2. 保护全局状态
   // 3. 传递数据时防止意外修改
   ```

### Composition API进阶

36. **什么是依赖注入？Provide/Inject的使用场景？（美团必问）**
   ```vue
   <!-- 祖先组件 -->
   <script setup>
   import { provide, ref, readonly } from 'vue'

   const count = ref(0)
   const increment = () => count.value++

   // 提供数据（推荐readonly保护）
   provide('count', readonly(count))
   provide('increment', increment)
   </script>

   <!-- 后代组件 -->
   <script setup>
   import { inject } from 'vue'

   // 注入数据
   const count = inject('count')
   const increment = inject('increment')

   // 带默认值
   const theme = inject('theme', 'light')

   // 响应式注入（推荐使用computed）
   import { computed } from 'vue'
   const count = inject('count', ref(0))
   </script>

   // 使用场景：
   // 1. 深层嵌套组件通信（避免props逐层传递）
   // 2. 主题、语言等全局配置
   // 3. 表单的祖先-后代数据共享
   ```

37. **defineProps、defineEmits、defineExpose的用法？（字节高频）**
   ```vue
   <script setup>
   // defineProps - 定义props
   const props = defineProps({
     count: Number,
     name: {
       type: String,
       required: true,
       default: 'Vue'
     }
   })

   // TypeScript写法（推荐）
   interface Props {
     count?: number
     name: string
   }
   const props = withDefaults(defineProps<Props>(), {
     count: 0
   })

   // defineEmits - 定义事件
   const emit = defineEmits(['update', 'delete'])

   // TypeScript写法
   const emit = defineEmits<{
     update: [value: number]
     delete: [id: number]
   }>()

   // 使用
   emit('update', 1)

   // defineExpose - 暴露给父组件
   defineExpose({
     count: ref(0),
     increment: () => { count.value++ }
   })
   </script>
   ```

38. **什么是Teleport？使用场景？（阿里高频）**
   ```vue
   <!-- Teleport - 将组件渲染到DOM的指定位置 -->

   <script setup>
   import { ref } from 'vue'

   const showModal = ref(false)
   </script>

   <template>
     <button @click="showModal = true">打开弹窗</button>

     <!-- 渲染到body下，避免z-index问题 -->
     <Teleport to="body">
       <div v-if="showModal" class="modal">
         <div class="modal-content">
           这是一个弹窗
           <button @click="showModal = false">关闭</button>
         </div>
       </div>
     </Teleport>
   </template>

   <!-- 使用场景：
   1. Modal弹窗 - 避免父元素overflow/transform影响
   2. Toast/Notification - 全局提示
   3. Dropdown - 避免z-index问题
   4. 多个根节点组件 -->
   ```

39. **Suspense组件的用法？（2025热门）**
   ```vue
   <!-- Suspense - 处理异步组件 -->

   <template>
     <Suspense>
       <!-- 默认内容：异步组件 -->
       <template #default>
         <AsyncComponent />
       </template>

       <!-- fallback：异步加载时显示 -->
       <template #fallback>
         <div>Loading...</div>
       </template>
     </Suspense>
   </template>

   <script setup>
   import { defineAsyncComponent } from 'vue'

   // 异步组件
   const AsyncComponent = defineAsyncComponent(() =>
     import('./AsyncComponent.vue')
   )

   // 带配置的异步组件
   const AsyncComponent = defineAsyncComponent({
     loader: () => import('./AsyncComponent.vue'),
     loadingComponent: LoadingComponent,
     errorComponent: ErrorComponent,
     delay: 200,  // 延迟显示loading
     timeout: 3000  // 超时显示error
   })
   </script>

   <!-- 使用场景：
   1. 异步组件加载
   2. 数据异步获取
   3. 代码分割 -->
   ```

### 组件设计

40. **什么是Fragments？（Vue3支持多个根节点）**
   ```vue
   <!-- Vue3支持多个根节点 -->
   <template>
     <header>Header</header>
     <main>Main</main>
     <footer>Footer</footer>
   </template>

   <!-- Vue2需要包裹 -->
   <template>
     <div>
       <header>Header</header>
       <main>Main</main>
       <footer>Footer</footer>
     </div>
   </template>

   <!-- 优点：
   1. 减少无意义包裹元素
   2. 更好的语义化
   3. 更少的DOM层级 -->
   ```

41. **自定义指令的用法？（字节、美团高频）**
   ```vue
   <script setup>
   import { onMounted, onUnmounted } from 'vue'

   // 局部指令
   const vFocus = {
     mounted(el) {
       el.focus()
     }
   }

   // 带参数的指令
   const vColor = {
     mounted(el, binding) {
       el.style.color = binding.value
     },
     updated(el, binding) {
       el.style.color = binding.value
     }
   }

   // 复杂指令（生命周期钩子）
   const vLazyload = {
     mounted(el, binding) {
       const observer = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
           if (entry.isIntersecting) {
             el.src = binding.value
             observer.unobserve(el)
           }
         })
       })
       observer.observe(el)

       el._observer = observer
     },
     unmounted(el) {
       el._observer?.disconnect()
     }
   }
   </script>

   <template>
     <input v-focus />
     <div v-color="'red'">Red text</div>
     <img v-lazyload="imageSrc" />
   </template>
   ```

42. **v-model的原理？如何自定义v-model？（阿里必问）**
   ```vue
   <!-- v-model本质上是props + emit的语法糖 -->

   <!-- 父组件 -->
   <template>
     <ChildComponent v-model="count" />
     <!-- 等价于 -->
     <ChildComponent :modelValue="count" @update:modelValue="count = $event" />

     <!-- 多个v-model -->
     <ChildComponent v-model:count="count" v-model:name="name" />
   </template>

   <!-- 子组件 -->
   <script setup>
   defineProps(['modelValue', 'count', 'name'])
   defineEmits(['update:modelValue', 'update:count', 'update:name'])
   </script>

   <template>
     <!-- 单个v-model -->
     <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />

     <!-- 或使用computed简化 -->
     <script setup>
     import { computed } from 'vue'

     const props = defineProps(['modelValue'])
     const emit = defineEmits(['update:modelValue'])

     const value = computed({
       get: () => props.modelValue,
       set: (val) => emit('update:modelValue', val)
     })
     </script>

     <input v-model="value" />
   </template>
   ```

43. **什么是递归组件？如何实现？（美团高频）**
   ```vue
   <!-- Tree组件 - 递归组件 -->
   <template>
     <div>
       <div @click="toggle">
         {{ node.name }}
         <span v-if="node.children">[{{ expanded ? '-' : '+' }}]</span>
       </div>

       <div v-if="expanded && node.children">
         <!-- 递归调用自身 -->
         <TreeNode
           v-for="child in node.children"
           :key="child.id"
           :node="child"
         />
       </div>
     </div>
   </template>

   <script setup>
   import { ref } from 'vue'

   const props = defineProps(['node'])
   const expanded = ref(false)

   function toggle() {
     expanded.value = !expanded.value
   }

   // ⚠️ 重要：递归组件必须有name
   defineOptions({
     name: 'TreeNode'
   })
   </script>

   <!-- 使用场景：
   1. 树形组件
   2. 菜单组件
   3. 目录结构
   4. 评论回复 -->
   ```

### 性能优化

44. **Vue3的性能优化有哪些？（字节、阿里必问）**
   ```vue
   <script setup>
   import { computed, shallowRef, markRaw } from 'vue'

   // 1. computed缓存
   const doubled = computed(() => count.value * 2)

   // 2. 避免不必要的响应式
   // 不需要响应式的数据用shallowRef/markRaw
   const hugeData = shallowRef([])  // 只有第一层响应式
   const config = markRaw({ ... })   // 完全不响应式

   // 3. v-once - 只渲染一次
   // v-memo - 条件缓存
   </script>

   <template>
     <div v-once>只渲染一次：{{ staticContent }}</div>

     <!-- v-memo：依赖不变时跳过更新 -->
     <div v-memo="[count]">
       只有count变化时才更新
       {{ list }}
     </div>

     <!-- 大列表优化：虚拟滚动 -->
     <RecycleScroller
       :items="list"
       :item-size="50"
     >
       <template #default="{ item }">
         <div>{{ item.name }}</div>
       </template>
     </RecycleScroller>
   </template>
   ```

45. **什么是v-memo？如何使用？（2025热门）**
   ```vue
   <script setup>
   import { ref } from 'vue'

   const count = ref(0)
   const list = ref([...])
   </script>

   <template>
     <!-- v-memo：依赖数组不变时跳过虚拟DOM对比 -->
     <div v-memo="[count]">
       <!-- 只有count变化时才重新渲染 -->
       <p>Count: {{ count }}</p>
       <p>List length: {{ list.length }}</p>
     </div>

     <!-- 实际应用：大列表优化 -->
     <div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected]">
       <span>{{ item.name }}</span>
       <span v-if="item.selected">✓</span>
     </div>
   </template>

   <!-- 使用场景：
   1. 大列表渲染
   2. 复杂组件的条件更新
   3. 性能敏感场景 -->
   ```

46. **如何实现虚拟滚动？（美团、字节必问）**
   ```vue
   <!-- 使用vue-virtual-scroller -->
   <template>
     <RecycleScroller
       class="scroller"
       :items="list"
       :item-size="50"
       key-field="id"
       v-slot="{ item }"
     >
       <div class="item">
         {{ item.name }}
       </div>
     </RecycleScroller>
   </template>

   <script setup>
   import { ref } from 'vue'
   import { RecycleScroller } from 'vue-virtual-scroller'
   import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

   const list = ref([...])  // 10万条数据
   </script>

   <!-- 原理：
   1. 只渲染可视区域的项目
   2. 使用padding撑开滚动容器
   3. 滚动时动态更新渲染列表

   <!-- 优点：
   - 10万条数据也能流畅渲染
   - 内存占用小
   - 滚动性能好 -->
   ```

### 插槽

47. **插槽的类型有哪些？（阿里高频）**
   ```vue
   <!-- 1. 默认插槽 -->
   <!-- BaseButton.vue -->
   <template>
     <button class="btn">
       <slot></slot>
     </button>
   </template>

   <!-- 使用 -->
   <BaseButton>点击我</BaseButton>

   <!-- 2. 具名插槽 -->
   <!-- Layout.vue -->
   <template>
     <div class="layout">
       <header>
         <slot name="header"></slot>
       </header>
       <main>
         <slot></slot>
       </main>
       <footer>
         <slot name="footer"></slot>
       </footer>
     </div>
   </template>

   <!-- 使用 -->
   <Layout>
     <template #header>
       <h1>标题</h1>
     </template>

     <p>主要内容</p>

     <template #footer>
       <p>页脚</p>
     </template>
   </Layout>

   <!-- 3. 作用域插槽 -->
   <!-- UserList.vue -->
   <template>
     <ul>
       <li v-for="user in users" :key="user.id">
         <slot :user="user" :index="index"></slot>
       </li>
     </ul>
   </template>

   <!-- 使用 -->
   <UserList :users="users">
     <template #default="{ user, index }">
       <span>{{ index }}: {{ user.name }}</span>
     </template>
   </UserList>
   ```

48. **什么是动态插槽？（字节高频）**
   ```vue
   <script setup>
   import { ref } from 'vue'

   const currentTab = ref('home')
   const tabs = {
     home: HomeTab,
     profile: ProfileTab,
     settings: SettingsTab
   }
   </script>

   <template>
     <!-- 动态插槽名 -->
     <component :is="tabs[currentTab]">
       <template #[currentTab]>
         动态插槽内容
       </template>
     </component>

     <!-- 或者 -->
     <BaseComponent>
       <template #[slotName]>
         动态插槽
       </template>
     </BaseComponent>
   </template>

   <!-- 使用场景：
   1. 动态组件 + 动态插槽
   2. 插件系统
   3. 动态布局 -->
   ```

### 过渡动画

49. **Vue3的过渡系统？（美团高频）**
   ```vue
   <!-- Transition组件 -->
   <template>
     <button @click="show = !show">Toggle</button>

     <Transition name="fade">
       <p v-if="show">Hello</p>
     </Transition>
   </template>

   <style>
   /* Vue会自动应用以下class */
   .fade-enter-from,
   .fade-leave-to {
     opacity: 0;
   }

   .fade-enter-to,
   .fade-leave-from {
     opacity: 1;
   }

   .fade-enter-active,
   .fade-leave-active {
     transition: opacity 0.3s ease;
   }
   </style>

   <!-- TransitionGroup - 列表过渡 -->
   <template>
     <TransitionGroup name="list" tag="ul">
       <li v-for="item in items" :key="item" @click="remove(item)">
         {{ item }}
       </li>
     </TransitionGroup>
   </template>

   <style>
   .list-enter-active,
   .list-leave-active {
     transition: all 0.5s ease;
   }
   .list-enter-from,
   .list-leave-to {
     opacity: 0;
     transform: translateX(30px);
   }

   /* 列表元素的移动过渡 */
   .list-move {
     transition: transform 0.5s ease;
   }
   </style>
   ```

### 其他高频题

50. **defineModel的用法？（2025新特性）**
   ```vue
   <!-- Vue3.4+ 新增defineModel宏 -->

   <script setup>
   const modelValue = defineModel()
   // 等价于：
   // const props = defineProps(['modelValue'])
   // const emit = defineEmits(['update:modelValue'])

   // 带参数
   const count = defineModel('count', { type: Number, default: 0 })

   // 使用
   count.value++  // 自动emit
   </script>

   <template>
     <input v-model="modelValue" />
     <input type="number" v-model="count" />
   </template>

   <!-- 父组件 -->
   <template>
     <Child v-model="value" />
     <Child v-model:count="count" />
   </template>
   ```

51. **Vue3的Tree Shaking？（字节、阿里必问）**
   ```javascript
   // Vue3支持Tree Shaking
   // 只打包使用的API

   // ❌ Vue2 - 全量导入
   import Vue from 'vue'
   Vue.use(Vuex)
   Vue.use(VueRouter)

   // ✅ Vue3 - 按需导入
   import { createApp, ref, computed } from 'vue'

   // 优点：
   // 1. 打包体积更小
   // 2. 按需加载
   // 3. 更好的模块化

   // unused API会被删除
   // 例如：没使用Transition，相关代码不会被打包
   ```

52. **Vue3的编译优化有哪些？（字节高频）**
   ```javascript
   // Vue3编译时优化：

   // 1. 静态提升
   // Vue2：每次render重新创建静态节点
   // Vue3：静态节点提升到render外，只创建一次

   // 2. 补丁标记
   // Vue2：全量对比
   // Vue3：只对比动态内容

   // 3. 事件缓存
   // Vue2：每次render重新创建函数
   // Vue3：静态事件缓存

   // 4. Block Tree
   // Vue2：递归遍历vdom
   // Vue3：Block + PatchFlag，跳过静态子树

   // 结果：
   // - 更新性能提升1.3-2倍
   // - 内存占用减少
   ```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
