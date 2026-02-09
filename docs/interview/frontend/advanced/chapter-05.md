---
title: 性能优化面试题
---

# 性能优化面试题

## 渲染性能优化

### 虚拟列表（虚拟滚动）原理？

虚拟列表只渲染可视区域内的列表项，大幅提升长列表性能。

**核心原理**：
1. 计算可视区域能容纳多少项
2. 只渲染这些项
3. 滚动时动态更新渲染项

```vue
<template>
  <div class="virtual-list" @scroll="onScroll" ref="containerRef">
    <div class="list-phantom" :style="{ height: totalHeight + 'px' }"></div>
    <div class="list-content" :style="{ transform: `translateY(${offset}px)` }">
      <div
        v-for="item in visibleData"
        :key="item.id"
        class="list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        {{ item.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  listData: Array,
  itemHeight: { type: Number, default: 50 }
});

const containerRef = ref(null);
const scrollTop = ref(0);
const containerHeight = ref(0);

onMounted(() => {
  containerHeight.value = containerRef.value.clientHeight;
});

const totalHeight = computed(() => props.listData.length * props.itemHeight);

const startIndex = computed(() => {
  return Math.floor(scrollTop.value / props.itemHeight);
});

const endIndex = computed(() => {
  const visibleCount = Math.ceil(containerHeight.value / props.itemHeight);
  return Math.min(startIndex.value + visibleCount, props.listData.length - 1);
});

const offset = computed(() => {
  return startIndex.value * props.itemHeight;
});

const visibleData = computed(() => {
  return props.listData.slice(startIndex.value, endIndex.value + 1);
});

function onScroll(e) {
  scrollTop.value = e.target.scrollTop;
}
</script>
```

### 如何优化v-for性能？

**1. 使用唯一key**：

```vue
<!-- ❌ 错误：使用index -->
<li v-for="(item, index) in list" :key="index">{{ item.name }}</li>

<!-- ✅ 正确：使用唯一ID -->
<li v-for="item in list" :key="item.id">{{ item.name }}</li>
```

**2. 避免在模板中使用复杂表达式**：

```vue
<!-- ❌ 错误：每次都重新计算 -->
<div v-for="item in list" :key="item.id">
  {{ heavyComputation(item) }}
</div>

<!-- ✅ 正确：使用computed -->
<div v-for="item in computedList" :key="item.id">
  {{ item.result }}
</div>
```

**3. 使用虚拟列表**：对于超长列表（>1000项）

**4. 分页或懒加载**：

```javascript
const list = ref([]);
const page = ref(1);
const loading = ref(false);

async function loadMore() {
  if (loading.value) return;
  loading.value = true;
  const newData = await fetchList(page.value);
  list.value.push(...newData);
  page.value++;
  loading.value = false;
}
```

### 计算属性缓存问题？

computed基于依赖缓存，只有依赖变化时才重新计算。

**优化场景**：

```javascript
import { ref, computed } from 'vue';

const list = ref([...]);
const filterText = ref('');

// ❌ 错误：filter在每次渲染时都执行
const filteredList = list.value.filter(item =>
  item.name.includes(filterText.value)
);

// ✅ 正确：使用computed缓存
const filteredList = computed(() =>
  list.value.filter(item =>
    item.name.includes(filterText.value)
  )
);
```

**computed vs methods**：

| 特性 | computed | methods |
|------|----------|---------|
| 缓存 | 有缓存 | 无缓存 |
| 使用 | 作为属性 | 作为方法 |
| 性能 | 更好（依赖不变不执行） | 每次调用都执行 |

```javascript
// computed - 有缓存
const doubled = computed(() => count.value * 2);
// 多次访问，只计算一次
console.log(doubled.value);
console.log(doubled.value);

// methods - 无缓存
const doubled = () => count.value * 2;
// 每次调用都执行
console.log(doubled());
console.log(doubled());
```

## 内存优化

### 如何避免内存泄漏？

常见内存泄漏场景：

**1. 定时器未清除**：

```javascript
// ❌ 错误
onMounted(() => {
  setInterval(() => {
    console.log('tick');
  }, 1000);
});

// ✅ 正确
let timer;
onMounted(() => {
  timer = setInterval(() => {
    console.log('tick');
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
```

**2. 事件监听器未移除**：

```javascript
// ❌ 错误
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// ✅ 正确
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
```

**3. 全局变量未清理**：

```javascript
// ❌ 错误
const globalState = reactive({ count: 0 });

// ✅ 正确：在组件卸载时清理
const state = reactive({ count: 0 });

onUnmounted(() => {
  // 清理大对象
  Object.assign(state, { count: 0 });
});
```

**4. 第三方库实例未销毁**：

```javascript
import { Chart } from 'chart.js';

let chart;

onMounted(() => {
  const ctx = document.getElementById('myChart');
  chart = new Chart(ctx, config);
});

onUnmounted(() => {
  chart?.destroy();  // 销毁图表实例
});
```

### 如何检测内存泄漏？

**1. Chrome DevTools Memory面板**：

1. 打开DevTools > Memory
2. Take Heap Snapshot
3. 执行操作
4. 再次Take Heap Snapshot
5. 对比两个快照，查看内存增长

**2. Performance面板**：

1. 打开DevTools > Performance
2. 开始录制
3. 执行操作
4. 停止录制
5. 查看内存曲线

**3. 使用weak引用**：

```javascript
// WeakMap - 自动垃圾回收
const weakMap = new WeakMap();

const obj = { id: 1 };
weakMap.set(obj, 'value');

// obj被回收后，WeakMap中的条目也会被自动删除
obj = null;
```

## 代码优化

### 防抖和节流？

**防抖（Debounce）**：延迟执行，只在最后一次触发后执行。

```javascript
function useDebounce(fn, delay = 300) {
  let timer = null;

  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 使用
const handleInput = useDebounce((value) => {
  search(value);
}, 500);
```

**节流（Throttle）**：固定时间间隔执行。

```javascript
function useThrottle(fn, delay = 300) {
  let timer = null;
  let lastTime = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
        lastTime = Date.now();
      }, delay - (now - lastTime));
    }
  };
}

// 使用
const handleScroll = useThrottle(() => {
  loadMore();
}, 1000);
```

**VueUse内置方法**：

```javascript
import { useDebounceFn, useThrottleFn } from '@vueuse/core';

const debouncedSearch = useDebounceFn(search, 500);
const throttledScroll = useThrottleFn(loadMore, 1000);
```

### 如何减少重复渲染？

**1. 合理拆分组件**：

```vue
<!-- ❌ 错误：整个列表一起更新 -->
<template>
  <div v-for="item in list" :key="item.id">
    <input v-model="item.name" />
    <button @click="item.count++">{{ item.count }}</button>
  </div>
</template>

<!-- ✅ 正确：拆分成独立组件 -->
<template>
  <ListItem
    v-for="item in list"
    :key="item.id"
    :item="item"
  />
</template>
```

**2. 使用v-once**：

```vue
<!-- 只渲染一次，不再更新 -->
<span v-once>{{ staticContent }}</span>
```

**3. 使用shallowRef和shallowReactive**：

```javascript
// 对于大型对象，不需要深层响应式
const largeList = shallowRef([]);

// 更新时整体替换
largeList.value = [...newList];
```

**4. 冻结不需要响应式的数据**：

```javascript
import { frozen } from '@vueuse/core';

// 冻结后不会转为响应式
const staticData = frozen({ config: {...} });
```

## 加载性能优化

### 路由懒加载？

```javascript
const routes = [
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
];
```

**预加载**：

```javascript
const routes = [
  {
    path: '/about',
    component: () => import(
      /* webpackPrefetch: true */
      /* webpackChunkName: "about" */
      '@/views/About.vue'
    )
  }
];
```

| 指令 | 说明 | 时机 |
|------|------|------|
| webpackPrefetch | 预获取（优先级低） | 空闲时 |
| webpackPreload | 预加载（优先级高） | 父chunk加载后 |

### 组件懒加载？

**defineAsyncComponent**：

```javascript
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);

// 或配置加载状态
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 5000
});
```

### 资源优化？

**图片优化**：

1. **懒加载**：

```vue
<img v-lazy="imageSrc" />
```

2. **WebP格式**：

```vue
<picture>
  <source :srcset="webpUrl" type="image/webp" />
  <img :src="jpgUrl" alt="..." />
</picture>
```

3. **响应式图片**：

```vue
<img
  :src="smallImage"
  :srcset="`${smallImage} 1x, ${largeImage} 2x`"
  alt="..."
/>
```

**代码压缩**：

```javascript
// vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 删除console
        drop_debugger: true  // 删除debugger
      }
    }
  }
});
```

**Gzip压缩**：

```javascript
// vite.config.js
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    })
  ]
});
```

## 2024-2026大厂高频性能优化面试题（50+题）

### 现代Vue性能优化

31. **Vue3.4+新特性有哪些性能优化？（字节、美团必问）**
   ```vue
   <!-- 1. defineModel优化 (Vue3.4+) -->
   <!-- 之前: -->
   <script setup>
   const props = defineProps(['modelValue'])
   const emit = defineEmits(['update:modelValue'])
   </script>

   <!-- 现在: -->
   <script setup>
   const modelValue = defineModel()
   </script>

   <template>
     <input v-model="modelValue" />
   </template>

   <!-- 2. 性能优化的computed -->
   <script setup>
   import { computed } from 'vue'

   // Vue3.4+ 支持getter-only computed性能更好
   const doubled = computed(() => count.value * 2)

   // 支持直接修改的computed（警告：有性能开销）
   const fullName = computed({
     get: () => firstName.value + ' ' + lastName.value,
     set: (value) => {
       [firstName.value, lastName.value] = value.split(' ')
     }
   })
   </script>

   <!-- 3. v-bind同一个对象的多个属性 -->
   <script setup>
   const attrs = {
     id: 'my-id',
     class: 'my-class',
     style: { color: 'red' }
   }
   </script>

   <template>
     <!-- Vue3.4+ 优化：只绑定一次，而非多次 -->
     <div v-bind="attrs">内容</div>
   </template>

   <!-- 4. 懒加载 hydration -->
   <script setup>
   // Vue3.4+ 支持组件级别的懒加载hydration
   defineOptions({
     hydrate: () => import('./HeavyComponent.js')
   })
   </script>
   ```

32. **Vue3.5新增的Reactivity系统优化？（2025最新）**
   ```javascript
   // Vue3.5 引入的性能优化

   // 1. 响应式对象属性访问优化
   import { reactive, effect } from 'vue'

   const state = reactive({
     user: {
       name: 'John',
       profile: {
         age: 30
       }
     }
   })

   // Vue3.5: 更高效的深层访问追踪
   effect(() => {
     // 只追踪 user.profile.age
     console.log(state.user.profile.age)
   })

   // 2. 数组方法优化
   const list = reactive([1, 2, 3, 4, 5])

   // Vue3.5: find, findIndex等方法的性能提升
   const found = list.find(item => item > 3)

   // 3. shallowRef和shallowReactive性能对比
   import { shallowRef, ref } from 'vue'

   // shallowRef: 只追踪.value的引用变化，不追踪内容
   const shallow = shallowRef({ count: 0 })

   // 性能测试：10万次更新
   console.time('shallowRef')
   for (let i = 0; i < 100000; i++) {
     shallow.value.count++ // ✅ 不会触发更新
   }
   shallow.value = { count: 100000 } // ✅ 只在引用变化时更新
   console.timeEnd('shallowRef') // ~1ms

   // ref: 追踪所有深层变化
   const deep = ref({ count: 0 })

   console.time('ref')
   for (let i = 0; i < 100000; i++) {
     deep.value.count++ // ❌ 每次都触发追踪
   }
   console.timeEnd('ref') // ~500ms
   ```

33. **如何优化大型Vue应用的启动性能？（美团高频）**
   ```javascript
   // 1. 路由懒加载
   // router.js
   const routes = [
     {
       path: '/dashboard',
       // ✅ 使用动态导入
       component: () => import('./views/Dashboard.vue')
       // ❌ 不要用: import Dashboard from './views/Dashboard.vue'
     }
   ]

   // 2. 组件懒加载
   // HeavyComponents.js
   export { default as Chart } from './Chart.vue'
   export { default as Table } from './Table.vue'

   // App.vue
   <script setup>
   // 按需加载
   const { Chart } = await import('./HeavyComponents.js')
   </script>

   // 3. 异步组件定义
   import { defineAsyncComponent } from 'vue'

   const AsyncChart = defineAsyncComponent({
     loader: () => import('./Chart.vue'),
     loadingComponent: LoadingSpinner,
     errorComponent: ErrorDisplay,
     delay: 200,      // 延迟200ms显示loading
     timeout: 10000   // 10秒超时
   })

   // 4. v-if vs v-show的选择
   <template>
     <!-- v-if: 条件不满足时不渲染，适合切换不频繁的场景 -->
     <HeavyComponent v-if="show" />

     <!-- v-show: 始终渲染，只是CSS display切换，适合频繁切换 -->
     <HeavyComponent v-show="show" />
   </template>

   // 5. 分片加载策略
   // ChunkSplitPlugin配置 (Vite)
   export default {
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             'vue-vendor': ['vue', 'vue-router', 'pinia'],
             'ui-library': ['element-plus'],
             'utils': ['lodash-es', 'dayjs']
           }
         }
       }
     }
   }
   ```

34. **如何优化列表渲染性能？（字节、阿里必问）**
   ```vue
   <template>
     <!-- 1. 虚拟列表 -->
     <VirtualList
       :items="largeList"
       :item-height="50"
       :container-height="600"
     >
       <template #default="{ item }">
         <ListItem :data="item" />
       </template>
     </VirtualList>

     <!-- 2. 分页加载 -->
     <div
       v-for="item in displayedItems"
       :key="item.id"
       class="list-item"
     >
       {{ item.name }}
     </div>

     <!-- 使用IntersectionObserver懒加载 -->
     <div ref="loadMoreTrigger" />

     <!-- 3. 优化key使用 -->
     <!-- ❌ 错误：使用index作为key -->
     <div v-for="(item, index) in items" :key="index">
       {{ item.name }}
     </div>

     <!-- ✅ 正确：使用唯一ID -->
     <div v-for="item in items" :key="item.id">
       {{ item.name }}
     </div>

     <!-- 4. 避免不必要的响应式 -->
     <script setup>
     import { markRaw } from 'vue'

     // ✅ markRaw: 标记为不需要响应式
     const staticConfig = markRaw({
       // 大型配置对象
       options: [...],
       rules: [...]
     })

     // 5. 使用Object.freeze
     const frozenData = Object.freeze({
       // 不可变数据
       list: [...]
     })
     </script>
   </template>
   ```

35. **Pinia性能优化最佳实践？（2024-2025热门）**
   ```javascript
   // stores/user.js
   import { defineStore } from 'pinia'

   export const useUserStore = defineStore('user', {
     // 1. state优化：避免嵌套过深
     state: () => ({
       // ✅ 好：扁平化结构
       userId: '',
       userName: '',
       userEmail: '',

       // ❌ 避免：过深嵌套
       // profile: {
       //   info: {
       //     id: '',
       //     name: ''
       //   }
       // }
     }),

     // 2. getters优化：使用缓存
     getters: {
       // ✅ getter会被缓存
       fullName: (state) => {
         return `${state.userName} ${state.userLastName}`
       },

       // ⚠️ getter接受参数时不会缓存
       userById: (state) => (id) => {
         return state.users.find(user => user.id === id)
       }
     },

     // 3. actions优化：批量更新
     actions: {
       // ❌ 不好：多次触发更新
       updateUser1() {
         this.userId = '123'
         this.userName = 'John'
         this.userEmail = 'john@example.com'
       },

       // ✅ 好：一次性更新
       updateUser2(userData) {
         // 使用$patch进行批量更新，只触发一次响应式更新
         this.$patch({
           userId: userData.id,
           userName: userData.name,
           userEmail: userData.email
         })
       },

       // ✅ 更好：使用函数形式
       updateUser3(userData) {
         this.$patch(state => {
           state.userId = userData.id
           state.userName = userData.name
           state.userEmail = userData.email
         })
       }
     }
   })

   // 4. store解构优化
   <script setup>
   import { storeToRefs } from 'pinia'
   import { useUserStore } from '@/stores/user'

   const userStore = useUserStore()

   // ❌ 错误：直接解构会失去响应式
   // const { userName, userEmail } = userStore

   // ✅ 正确：使用storeToRefs
   const { userName, userEmail } = storeToRefs(userStore)

   // ✅ action可以直接解构（不需要响应式）
   const { fetchUserData } = userStore
   </script>
   ```

### 性能监控与诊断

36. **如何监控Vue应用的性能？（美团、阿里必问）**
   ```javascript
   // 1. Vue性能钩子
   <script setup>
   import { onRenderTriggered, onMounted } from 'vue'

   // 监控组件更新原因
   onRenderTriggered((e) => {
     console.log('Component re-render triggered by:', {
       key: e.key,
       type: e.type,
       oldValue: e.oldValue,
       newValue: e.newValue
     })
   })

   // 2. Performance API监控
   onMounted(() => {
     // 测量组件渲染时间
     performance.mark('component-start')

     // ...组件逻辑

     nextTick(() => {
       performance.mark('component-end')
       performance.measure(
         'component-render',
         'component-start',
         'component-end'
       )

       const measure = performance.getEntriesByName('component-render')[0]
       console.log(`Render time: ${measure.duration}ms`)
     })
   })
   </script>

   // 3. 全局性能监控
   // main.js
   import { createApp } from 'vue'

   const app = createApp(App)

   // 监控所有组件渲染性能
   app.mixin({
     mounted() {
       const componentName = this.$options.name || 'Anonymous'

       performance.mark(`${componentName}-start`)

       this.$once('hook:updated', () => {
         performance.mark(`${componentName}-update`)
         performance.measure(
           `${componentName}-render`,
           `${componentName}-start`,
           `${componentName}-update`
         )
       })
     }
   })

   // 4. 用户真实性能监控（RUM）
   // utils/performance.js
   export class PerformanceMonitor {
     constructor() {
       this.metrics = []
     }

     measurePageLoad() {
       window.addEventListener('load', () => {
         const perfData = performance.getEntriesByType('navigation')[0]

         this.metrics.push({
           // DNS查询时间
           dns: perfData.domainLookupEnd - perfData.domainLookupStart,

           // TCP连接时间
           tcp: perfData.connectEnd - perfData.connectStart,

           // 请求响应时间
           request: perfData.responseEnd - perfData.requestStart,

           // DOM解析时间
           domParsing: perfData.domComplete - perfData.domInteractive,

           // 首次绘制时间
           firstPaint: perfData.responseStart,

           // 首次内容绘制时间
           firstContentfulPaint: this.getFCP(),

           // 最大内容绘制时间
           largestContentfulPaint: this.getLCP(),

           // 首次输入延迟
           firstInputDelay: this.getFID()
         })

         // 发送到监控服务
         this.sendToAnalytics()
       })
     }

     getFCP() {
       const paintEntries = performance.getEntriesByType('paint')
       const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
       return fcpEntry ? fcpEntry.startTime : 0
     }

     async getLCP() {
       return new Promise((resolve) => {
         new PerformanceObserver((list) => {
           const entries = list.getEntries()
           const lastEntry = entries[entries.length - 1]
           resolve(lastEntry.startTime)
         }).observe({ entryTypes: ['largest-contentful-paint'] })
       })
     }

     async getFID() {
       return new Promise((resolve) => {
         new PerformanceObserver((list) => {
           const firstInput = list.getEntries()[0]
           resolve(firstInput.processingStart - firstInput.startTime)
         }).observe({ entryTypes: ['first-input'] })
       })
     }

     sendToAnalytics() {
       // 发送到后端分析
       fetch('/api/analytics/performance', {
         method: 'POST',
         body: JSON.stringify(this.metrics),
         headers: { 'Content-Type': 'application/json' }
       })
     }
   }
   ```

37. **如何定位和解决内存泄漏？（字节必问）**
   ```javascript
   // 常见内存泄漏场景及解决方案

   // 1. 定时器未清理
   <script setup>
   import { onMounted, onUnmounted } from 'vue'

   let timer = null

   onMounted(() => {
     // ❌ 错误：没有保存定时器引用
     setInterval(() => {
       console.log('tick')
     }, 1000)

     // ✅ 正确：保存引用并清理
     timer = setInterval(() => {
       console.log('tick')
     }, 1000)
   })

   onUnmounted(() => {
     // 清理定时器
     if (timer) {
       clearInterval(timer)
       timer = null
     }
   })
   </script>

   // 2. 事件监听器未移除
   <script setup>
   import { onMounted, onUnmounted } from 'vue'

   const handleResize = () => {
     console.log('Window resized')
   }

   onMounted(() => {
     window.addEventListener('resize', handleResize)
   })

   onUnmounted(() => {
     // ✅ 记得移除监听器
     window.removeEventListener('resize', handleResize)
   })
   </script>

   // 3. 全局变量引用
   <script setup>
   import { ref } from 'vue'

   // ❌ 错误：全局缓存大对象
   const globalCache = {}
   const loadLargeData = async () => {
     const data = await fetchLargeData()
     globalCache[cacheKey] = data // 组件销毁后数据仍占用内存
   }

   // ✅ 正确：组件卸载时清理
   const localCache = ref({})

   onUnmounted(() => {
     localCache.value = {}
   })
   </script>

   // 4. 闭包引起的内存泄漏
   <script setup>
   // ❌ 潜在问题
   const createClosure = () => {
     const largeData = new Array(1000000).fill('data')

     return () => {
       // 这个函数会持有largeData的引用
       console.log(largeData.length)
     }
   }

   const closure = createClosure()
   // 即使不再使用closure，largeData也无法被回收

   // ✅ 解决：手动清除
   const cleanup = () => {
     closure.largeData = null
   }
   </script>

   // 5. 第三方库实例未销毁
   <script setup>
   import { onUnmounted } from 'vue'
   import * as echarts from 'echarts'

   let chart = null

   onMounted(() => {
     const chartDom = document.getElementById('chart')
     chart = echarts.init(chartDom)

     chart.setOption({
       // 图表配置
     })
   })

   onUnmounted(() => {
     // ✅ 销毁图表实例
     if (chart) {
       chart.dispose()
       chart = null
     }
   })
   </script>

   // 6. 使用WeakMap/WeakSet自动清理
   <script setup>
   // ✅ WeakMap: 键是弱引用
   const wm = new WeakMap()

   const obj = { id: 1 }
   wm.set(obj, 'some data')

   // 当obj被回收时，WeakMap中的条目也会自动删除
   obj = null

   // 适用场景：
   // - 关联DOM节点和数据
   // - 缓存对象私有数据
   const nodeToData = new WeakMap()

   const attachData = (node, data) => {
     nodeToData.set(node, data)
   }

   // DOM节点被删除后，关联的数据会自动清理
   ```

38. **Chrome DevTools性能分析实战？（项目经验题）**
   ```javascript
   // 性能分析流程

   // 1. 录制性能
   // 打开Chrome DevTools > Performance > 录制
   // 执行操作 > 停止录制 > 分析结果

   // 2. 关键指标查看
   // - FPS: 帧率，应保持60fps
   // - CPU: CPU使用情况
   // - NET: 网络请求
   // - Frames: 帧时间线
   // - Main: 主线程活动

   // 3. 火焰图分析
   // - 找出耗时最长的函数
   // - 识别长任务（>50ms）
   // - 优化瓶颈

   // 4. Memory面板分析
   // - Take Heap Snapshot: 堆快照
   // - 查找Detached DOM节点
   // - 对比两个快照，查看内存增长

   // 5. 实战示例：优化长列表渲染
   <script setup>
   import { ref, onMounted } from 'vue'

   const items = ref([])

   // ❌ 性能问题：一次性渲染10万条数据
   onMounted(async () => {
     const data = await fetch100kItems()
     items.value = data // 导致页面卡顿
   })

   // ✅ 优化方案1：分批渲染
   onMounted(async () => {
     const allData = await fetch100kItems()
     const batchSize = 100
     let index = 0

     const renderBatch = () => {
       const batch = allData.slice(index, index + batchSize)
       items.value.push(...batch)
       index += batchSize

       if (index < allData.length) {
         requestAnimationFrame(renderBatch)
       }
     }

     renderBatch()
   })

   // ✅ 优化方案2：虚拟滚动
   // 使用vue-virtual-scroller库
   import { RecycleScroller } from 'vue-virtual-scroller'
   import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
   </script>

   <template>
     <!-- 只渲染可见区域的item -->
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
   </template>
   ```

### 构建优化

39. **Vite构建优化最佳实践？（2024-2025标准）**
   ```javascript
   // vite.config.js
   import { defineConfig } from 'vite'
   import vue from '@vitejs/plugin-vue'
   import viteCompression from 'vite-plugin-compression'
   import { visualizer } from 'rollup-plugin-visualizer'

   export default defineConfig({
     plugins: [
       vue(),

       // 1. Gzip压缩
       viteCompression({
         algorithm: 'gzip',
         ext: '.gz',
         threshold: 10240, // 10KB以上才压缩
         deleteOriginFile: false
       }),

       // 2. Brotli压缩（更好的压缩率）
       viteCompression({
         algorithm: 'brotliCompress',
         ext: '.br',
         threshold: 10240
       }),

       // 3. 打包体积分析
       visualizer({
         filename: './dist/stats.html',
         open: true,
         gzipSize: true,
         brotliSize: true
       })
     ],

     build: {
       // 4. 代码分割
       rollupOptions: {
         output: {
           // 手动分包
           manualChunks: {
             // Vue核心
             'vue-vendor': ['vue', 'vue-router', 'pinia'],

             // UI库
             'element-plus': ['element-plus'],

             // 工具库
             'utils': ['lodash-es', 'dayjs', 'axios']
           },

           // 5. 文件名hash
           chunkFileNames: 'js/[name]-[hash].js',
           entryFileNames: 'js/[name]-[hash].js',
           assetFileNames: '[ext]/[name]-[hash].[ext]'
         }
       },

       // 6. 压缩配置
       minify: 'terser',
       terserOptions: {
         compress: {
           // 删除console
           drop_console: true,
           drop_debugger: true
         },
         format: {
           // 删除注释
           comments: false
         }
       },

       // 7. chunk大小警告阈值
       chunkSizeWarningLimit: 1000,

       // 8. CSS代码分割
       cssCodeSplit: true,

       // 9. sourcemap（生产环境不生成）
       sourcemap: false,

       // 10. 目标浏览器
       target: 'modules' // 支持原生ESM的现代浏览器
     },

     // 11. 依赖预构建
     optimizeDeps: {
       include: [
         'vue',
         'vue-router',
         'pinia',
         'axios',
         'element-plus'
       ],
       exclude: ['@iconify/json']
     }
   })

   // 12. 环境变量优化
   // .env.production
   VITE_APP_TITLE=My App
   VITE_API_BASE_URL=https://api.example.com

   // 代码中使用
   const config = import.meta.env

   // 13. CDN加速
   export default defineConfig({
     build: {
       rollupOptions: {
         external: ['vue', 'element-plus'],
         output: {
           globals: {
             vue: 'Vue',
             'element-plus': 'ElementPlus'
           }
         }
       }
     }
   })

   // index.html
   <!-- <script src="https://cdn.jsdelivr.net/npm/vue@3.4.0/dist/vue.global.prod.js"></script> -->
   ```

40. **Tree Shaking优化？（美团高频）**
   ```javascript
   // 1. ES Module vs CommonJS
   // ✅ Tree Shaking可以工作
   import { debounce } from 'lodash-es'

   // ❌ Tree Shaking无法工作
   const { debounce } = require('lodash')

   // 2. package.json配置
   {
     "name": "my-package",
     "type": "module", // 声明为ESM
     "sideEffects": false, // 无副作用，可安全tree-shake
     "sideEffects": [
       "*.css",
       "*.vue"
     ]
   }

   // 3. 代码写法优化
   // ✅ 好：顶层导入，易于分析
   import { map, filter } from 'lodash-es'

   // ❌ 不好：动态导入，难以分析
   const moduleName = 'lodash-es'
   import(moduleName).then(module => {
     // ...
   })

   // 4. 避免副作用
   // ✅ 好：纯函数
   export function add(a, b) {
     return a + b
   }

   // ❌ 不好：有副作用
   export function add(a, b) {
     console.log('Adding...') // 副作用
     return a + b
   }

   // 5. 使用pure annotation
   /*#__PURE__*/ const expensive = heavyComputation()

   // 6. 实战案例：Element Plus按需导入
   // ✅ 自动按需导入（推荐）
   // vite.config.js
   import AutoImport from 'unplugin-auto-import/vite'
   import Components from 'unplugin-vue-components/vite'
   import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

   export default defineConfig({
     plugins: [
       AutoImport({
       resolvers: [ElementPlusResolver()]
       }),
       Components({
         resolvers: [ElementPlusResolver()]
       })
     ]
   })

   // ❌ 手动按需导入（繁琐）
   import { ElButton } from 'element-plus'
   import 'element-plus/es/components/button/style/css'
   ```

### 项目实战优化案例

41. **实际项目中的性能优化案例？（项目经验题）**
   ```javascript
   // 案例1：电商首页加载优化

   // 问题：首屏加载时间8秒，用户体验差

   // 解决方案：

   // 1. 路由懒加载
   const routes = [
     {
       path: '/home',
       component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue')
     }
   ]

   // 2. 图片懒加载
   <template>
     <img
       v-lazy="product.image"
       :alt="product.name"
     />
   </template>

   // 3. 骨架屏
   <template>
     <skeleton-screen v-if="loading" />
     <product-list v-else :products="products" />
   </template>

   // 4. 预加载关键资源
   <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
   <link rel="prefetch" href="/js/chunk-about.js">

   // 5. CDN加速静态资源
   // vite.config.js
   export default defineConfig({
     base: 'https://cdn.example.com/'
   })

   // 6. SSR服务端渲染
   // 使用Nuxt.js进行SSR
   // nuxt.config.js
   export default defineNuxtConfig({
     ssr: true,
     nitro: {
       storage: {
         redis: {
           driver: 'redis',
           /* ... */
         }
       }
     }
   })

   // 结果：首屏加载时间从8秒降低到1.5秒

   // 案例2：实时数据大屏性能优化

   // 问题：每秒更新100个数据点，页面卡顿

   // 解决方案：

   <script setup>
   import { ref, shallowRef } from 'vue'

   // ❌ 不好：深层响应式
   // const dataPoints = ref([])

   // ✅ 好：浅层响应式
   const dataPoints = shallowRef([])

   // 优化1：批量更新
   const updateData = (newData) => {
     // 使用requestAnimationFrame批量更新
     requestAnimationFrame(() => {
       dataPoints.value = newData
     })
   }

   // 优化2：防抖处理
   import { useDebounceFn } from '@vueuse/core'

   const debouncedUpdate = useDebounceFn((data) => {
     dataPoints.value = data
   }, 100)

   // 优化3：虚拟化渲染
   // 只渲染可见区域的数据点
   </script>

   // 案例3：表单性能优化

   // 问题：大型表卡顿，字段1000+

   // 解决方案：

   <script setup>
   import { ref, computed } from 'vue'

   // ❌ 不好：所有字段都是响应式
   const formData = ref({
     field1: '',
     field2: '',
     // ...1000个字段
   })

   // ✅ 好：分组响应式
   const basicInfo = ref({
     name: '',
     email: ''
   })

   const workInfo = ref({
     company: '',
     position: ''
   })

   // ✅ 更好：使用shallowRef + 按需更新
   const formData = shallowRef({})

   const updateField = (field, value) => {
     // 创建新对象引用，触发一次更新
     formData.value = {
       ...formData.value,
       [field]: value
     }
   }
   </script>

   // 案例4：列表无限滚动优化

   // 问题：滚动到底部越来越慢

   // 解决方案：

   <script setup>
   import { ref, onMounted, onUnmounted } from 'vue'

   const items = ref([])
   const page = ref(1)
   const loading = ref(false)

   // ✅ 优化1：虚拟滚动
   import { RecycleScroller } from 'vue-virtual-scroller'

   // ✅ 优化2：IntersectionObserver
   let observer = null

   onMounted(() => {
     observer = new IntersectionObserver(
       (entries) => {
         if (entries[0].isIntersecting && !loading.value) {
           loadMore()
         }
       },
       { threshold: 0.1 }
     )

     observer.observe(document.querySelector('.load-more-trigger'))
   })

   onUnmounted(() => {
     observer?.disconnect()
   })

   // ✅ 优化3：数据分页缓存
   const cache = new Map()

   const loadMore = async () => {
     if (cache.has(page.value)) {
       items.value.push(...cache.get(page.value))
       page.value++
       return
     }

     loading.value = true
     const data = await fetchPage(page.value)
     cache.set(page.value, data)
     items.value.push(...data)
     page.value++
     loading.value = false
   }

   // ✅ 优化4：限制最大数量
   const MAX_ITEMS = 1000

   const loadMore = async () => {
     if (items.value.length >= MAX_ITEMS) {
       // 移除旧数据
       items.value = items.value.slice(-500)
     }

     // 加载新数据
     // ...
   }
   </script>
   ```

### 高级性能优化技巧

42. **Web Worker性能优化实战？（字节高频）**

Web Worker可以将计算密集型任务移出主线程，避免阻塞UI渲染。

```javascript
// workers/heavy-computation.js
// Web Worker代码
self.onmessage = function(e) {
  const { data, type } = e.data

  if (type === 'process-large-array') {
    // 处理大型数组计算
    const result = data.map(item => {
      // 复杂计算逻辑
      return item * Math.sqrt(item) + Math.log(item)
    })

    // 将结果发送回主线程
    self.postMessage({ type: 'result', data: result })
  }

  if (type === 'image-processing') {
    // 图片处理
    const imageData = e.data.imageData
    const processed = processImage(imageData)
    self.postMessage({ type: 'image-processed', data: processed })
  }
}

// Vue组件中使用
<script setup>
import { ref, onUnmounted } from 'vue'

const processing = ref(false)
const result = ref(null)

let worker = null

onMounted(() => {
  // 创建Web Worker
  worker = new Worker(
    new URL('@/workers/heavy-computation.js', import.meta.url),
    { type: 'module' }
  )

  // 监听Worker消息
  worker.onmessage = (e) => {
    const { type, data } = e.data

    if (type === 'result') {
      result.value = data
      processing.value = false
    }
  }

  worker.onerror = (error) => {
    console.error('Worker error:', error)
    processing.value = false
  }
})

// 发送任务到Worker
const processLargeData = (largeArray) => {
  processing.value = true
  worker.postMessage({
    type: 'process-large-array',
    data: largeArray
  })
}

// 清理Worker
onUnmounted(() => {
  worker?.terminate()
})
</script>

// 实战场景：大数据可视化
// 1. 在Worker中预处理数据
// 2. 主线程只负责渲染
// 3. 避免UI卡顿
```

**Worker使用注意事项**：
- Worker不能直接操作DOM
- 数据传递需要序列化（使用Transferable对象优化）
- 同源限制
- 内存开销较大，按需创建

43. **首屏性能优化完整方案？（美团必问）**

首屏加载速度直接影响用户留存，需要从多个维度优化。

```javascript
// 1. 路由懒加载 + 预加载
// router.js
const routes = [
  {
    path: '/',
    name: 'Home',
    // 首页组件需要立即加载，不使用懒加载
    component: Home
  },
  {
    path: '/about',
    // 预加载其他路由
    component: () => import(
      /* webpackPrefetch: true */
      /* webpackChunkName: "about" */
      '@/views/About.vue'
    )
  }
]

// 2. 首屏关键CSS内联
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginInlineCss from 'vite-plugin-inline-css'

export default defineConfig({
  plugins: [
    vitePluginInlineCss({
      // 只内联首屏关键CSS
      files: ['src/assets/styles/critical.css']
    })
  ]
})

// 3. 图片优化策略
<template>
  <!-- 首屏图片优先级最高 -->
  <img
    :src="heroImage"
    loading="eager"
    fetchpriority="high"
    decoding="sync"
    :width="1200"
    :height="600"
    alt="Hero"
  />

  <!-- 非首屏图片懒加载 -->
  <img
    v-for="img in otherImages"
    :key="img.id"
    :src="img.url"
    loading="lazy"
    decoding="async"
    :alt="img.alt"
  />
</template>

<script setup>
// 使用WebP格式 + 响应式图片
const heroImage = computed(() => {
  return {
    src: '/images/hero.webp',
    fallback: '/images/hero.jpg',
    srcset: `
      /images/hero-800.webp 800w,
      /images/hero-1200.webp 1200w,
      /images/hero-1600.webp 1600w
    `,
    sizes: '(max-width: 768px) 100vw, 1200px'
  }
})
</script>

// 4. 骨架屏优化
<template>
  <div class="home-page">
    <!-- 骨架屏 -->
    <div v-if="loading" class="skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-content">
        <div v-for="i in 6" :key="i" class="skeleton-item"></div>
      </div>
    </div>

    <!-- 实际内容 -->
    <div v-else class="content">
      <Header />
      <ProductList :products="products" />
    </div>
  </div>
</template>

<style scoped>
/* 骨架屏动画 */
.skeleton-item {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>

// 5. 数据预取
// main.js
import { createApp } from 'vue'
import { createRouter } from 'vue-router'

const router = createRouter({
  routes
})

// 预取数据
router.beforeResolve(async (to) => {
  if (to.meta.prefetch) {
    // 在路由解析前预取数据
    await to.meta.prefetch(to.params)
  }
})

// 页面组件
<script setup>
import { onMounted } from 'vue'

// ✅ 好：结合Suspense使用
async function fetchData() {
  const [products, banners] = await Promise.all([
    fetchProducts(),
    fetchBanners()
  ])
  return { products, banners }
}
</script>

// 6. 字体优化
<!-- index.html -->
<link
  rel="preload"
  href="/fonts/main.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<!-- 使用font-display: swap避免字体闪烁 -->
<style>
@font-face {
  font-family: 'Custom Font';
  src: url('/fonts/main.woff2') format('woff2');
  font-display: swap; /* 立即显示后备字体 */
}
</style>

// 7. 代码分割与Tree Shaking
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 首屏必需的chunk优先级高
          'vue-core': ['vue', 'vue-router', 'pinia'],
          // 非首屏延迟加载
          'editor': ['@vueup/vue-quill'],
          'charts': ['echarts']
        }
      }
    }
  }
})
```

**首屏性能指标**：
- FCP (First Contentful Paint): < 1.8s
- LCP (Largest Contentful Paint): < 2.5s
- TTI (Time to Interactive): < 3.8s

44. **图片性能优化深入？（腾讯高频）**

图片通常占据页面大部分带宽，优化图片能显著提升性能。

```javascript
// 1. 现代图片格式
<template>
  <picture>
    <!-- 优先使用AVIF（最佳压缩率） -->
    <source
      :srcset="image.avif"
      type="image/avif"
    />
    <!-- 后备WebP -->
    <source
      :srcset="image.webp"
      type="image/webp"
    />
    <!-- 最后后备JPEG -->
    <img
      :src="image.jpg"
      :alt="image.alt"
      :loading="lazy ? 'lazy' : 'eager'"
      :decoding="lazy ? 'async' : 'sync'"
      :width="image.width"
      :height="image.height"
    />
  </picture>
</template>

// 2. 响应式图片
<template>
  <img
    :src="smallImage"
    :srcset="`
      ${image600} 600w,
      ${image1200} 1200w,
      ${image1800} 1800w
    `"
    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
    :alt="alt"
  />
</template>

// 3. 图片懒加载优化
<script setup>
import { ref } from 'vue'

const props = defineProps({
  src: String,
  alt: String
})

const imageRef = ref(null)
const isLoaded = ref(false)
const isError = ref(false)

// 使用IntersectionObserver
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = props.src
          observer.unobserve(img)
        }
      })
    },
    { rootMargin: '50px' } // 提前50px开始加载
  )

  observer.observe(imageRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

// 4. 图片压缩与裁剪服务
// utils/image-optimizer.js
export class ImageOptimizer {
  // 使用CDN图片处理服务（如阿里云OSS、腾讯云COS）
  static optimize(url, options = {}) {
    const {
      width,
      height,
      quality = 80,
      format = 'webp'
    } = options

    // 阿里云OSS示例
    const params = []
    if (width) params.push(`x-oss-process=image/resize,w_${width}`)
    if (height) params.push(`h_${height}`)
    params.push(`/quality,q_${quality}`)
    params.push(`/format,${format}`)

    return `${url}?${params.join('')}`
  }

  // 响应式图片生成器
  static generateSrcSet(baseUrl, sizes) {
    return sizes.map(size => {
      const url = this.optimize(baseUrl, {
        width: size,
        quality: 80,
        format: 'webp'
      })
      return `${url} ${size}w`
    }).join(', ')
  }
}

// 使用
const optimizedImage = ImageOptimizer.optimize(originalUrl, {
  width: 800,
  quality: 75,
  format: 'webp'
})

// 5. 预加载关键图片
<template>
  <!-- 首屏Hero图片 -->
  <link
    rel="preload"
    as="image"
    :href="heroImage.webp"
    imagesrcset="
      /images/hero-800.webp 800w,
      /images/hero-1200.webp 1200w
    "
    imagesizes="(max-width: 800px) 100vw, 50vw"
  />
</template>

// 6. 图片占位与BlurHash
<script setup>
import { ref } from 'vue'

// 使用BlurHash生成模糊占位图
const blurHash = 'L6H{2xj[~pWB%WM{NHtQ^t7jZj['
const placeholder = ref(null)

onMounted(async () => {
  // 解码BlurHash
  const { decode } = await import('blurhash')
  placeholder.value = decode(blurHash, 32, 32)
})
</script>

<template>
  <div class="image-container">
    <!-- 模糊占位图 -->
    <canvas
      v-if="placeholder"
      ref="placeholderCanvas"
      class="blur-placeholder"
    />

    <!-- 实际图片加载完成后淡入 -->
    <img
      :src="src"
      :alt="alt"
      @load="onImageLoad"
      :class="{ loaded: isLoaded }"
    />
  </div>
</template>

<style scoped>
.image-container {
  position: relative;
}

.blur-placeholder {
  position: absolute;
  filter: blur(20px);
  transition: opacity 0.3s;
}

img.loaded + .blur-placeholder {
  opacity: 0;
}
</style>
```

45. **代码分割策略最佳实践？（字节真题）**

合理的代码分割能显著减少首屏加载体积。

```javascript
// 1. 路由级别分割
// router.js
const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue') // chunk-home.js
  },
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue') // chunk-admin.js
  }
]

// 2. 组件级别分割
<script setup>
import { defineAsyncComponent } from 'vue'

// ✅ 异步组件
const HeavyChart = defineAsyncComponent(() =>
  import('@/components/HeavyChart.vue')
)

// ✅ 带加载状态的异步组件
const RichTextEditor = defineAsyncComponent({
  loader: () => import('@/components/RichTextEditor.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,
  timeout: 10000
})
</script>

// 3. 功能性分割
// 按功能模块分割代码
const routes = [
  {
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue')
  },
  {
    path: '/reports',
    component: () => import(/* webpackChunkName: "reports" */ '@/views/Reports.vue')
  }
]

// 4. 依赖库分割
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // node_modules打包到vendor
          if (id.includes('node_modules')) {
            // 将大型库单独分包
            if (id.includes('vue')) {
              return 'vue-core'
            }
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            if (id.includes('echarts')) {
              return 'echarts'
            }
            if (id.includes('lodash')) {
              return 'lodash'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})

// 5. 条件加载
<script setup>
// 只在需要时加载功能
const showAdvanced = ref(false)

const AdvancedFeatures = computed(() => {
  if (!showAdvanced.value) return null

  // 动态导入
  return defineAsyncComponent(() =>
    import('@/components/AdvancedFeatures.vue')
  )
})
</script>

// 6. Prefetch和Preload策略
const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/about',
    // 空闲时预加载
    component: () => import(
      /* webpackPrefetch: true */
      /* webpackChunkName: "about" */
      '@/views/About.vue'
    )
  },
  {
    path: '/admin',
    // 立即预加载（高优先级）
    component: () => import(
      /* webpackPreload: true */
      /* webpackChunkName: "admin" */
      '@/views/Admin.vue'
    )
  }
]

// 7. 动态import()
// 按需加载功能模块
const loadFeature = async (featureName) => {
  const module = await import(`@/features/${featureName}.js`)
  return module.default
}

// 使用
const theme = await loadFeature('dark-theme')
```

46. **长任务优化技巧？（字节2025真题）**

长任务（Long Tasks, >50ms）会阻塞主线程，导致界面卡顿。

```javascript
// 1. 识别长任务
// 使用Performance API检测
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.duration > 50) {
      console.warn('Long Task detected:', {
        name: entry.name,
        duration: entry.duration,
        startTime: entry.startTime
      })
    }
  })
})

observer.observe({ entryTypes: ['longtask'] })

// 2. 使用requestIdleCallback
function runTaskWhenIdle(task, timeout = 2000) {
  return new Promise((resolve) => {
    requestIdleCallback(
      (deadline) => {
        task()
        resolve()
      },
      { timeout }
    )
  })
}

// 使用
runTaskWhenIdle(() => {
  // 在浏览器空闲时执行
  analytics.track('pageview')
})

// 3. 使用Scheduler API（现代浏览器）
function scheduleTask(task) {
  if ('scheduler' in navigator) {
    // 使用Scheduler API
    navigator.scheduler.postTask(task, {
      priority: 'background',
      delay: 0
    })
  } else {
    // 后备方案
    setTimeout(task, 0)
  }
}

// 4. 分批处理大量数据
<script setup>
import { ref } from 'vue'

const items = ref([])
const allData = []

// ❌ 不好：一次性处理大量数据
const processAll = () => {
  items.value = allData.map(item => {
    // 复杂计算
    return heavyComputation(item)
  })
}

// ✅ 好：分批处理
const processBatch = async () => {
  const batchSize = 100
  const batches = []

  for (let i = 0; i < allData.length; i += batchSize) {
    batches.push(allData.slice(i, i + batchSize))
  }

  for (const batch of batches) {
    // 每批处理后让出主线程
    const processed = batch.map(item => heavyComputation(item))
    items.value.push(...processed)

    // 让出主线程
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}
</script>

// 5. 使用Time Slicing算法
function timeSlice(tasks, callback) {
  let index = 0

  function _run() {
    const now = performance.now()

    // 每次执行最多5ms
    while (index < tasks.length && performance.now() - now < 5) {
      tasks[index]()
      index++
    }

    if (index < tasks.length) {
      // 还有任务未完成，继续调度
      requestAnimationFrame(_run)
    } else {
      callback()
    }
  }

  _run()
}

// 使用
const tasks = Array(10000).fill(0).map((_, i) => () => {
  console.log(i)
})

timeSlice(tasks, () => {
  console.log('All tasks completed!')
})
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
