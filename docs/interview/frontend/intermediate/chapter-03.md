---
title: 组件开发面试题
---

# 组件开发面试题

## 组件基础

### 组件命名规范有哪些？

Vue3组件命名有以下几种方式：

**1. PascalCase（推荐）**

```vue
<!-- 推荐 -->
<MyComponent />
```

**2. kebab-case**

```vue
<!-- 也支持 -->
<my-component />
```

**字符串模板中**：
```javascript
// 可以使用kebab-case
app.component('my-component', MyComponent);

// 或使用PascalCase
app.component('MyComponent', MyComponent);
```

**命名约定**：
- **单文件组件文件名**：PascalCase，如`MyComponent.vue`
- **组件注册名**：PascalCase或kebab-case
- **DOM模板中**：只能使用kebab-case

### 组件的data为什么必须是函数？

确保每个组件实例都有独立的数据对象，避免多个实例共享同一份数据。

```javascript
// ❌ 错误：data是对象
const Component = {
  data: {
    count: 0  // 所有实例共享同一个对象！
  }
};

// ✅ 正确：data是函数
const Component = {
  data() {
    return {
      count: 0  // 每个实例都有独立的对象
    };
  }
};
```

**原理**：Vue在创建实例时会调用data函数，返回新对象作为该实例的响应式数据。

## Props和Emit

### Props如何定义和验证？

```vue
<script setup>
// 使用TypeScript类型定义
interface Props {
  title: string;
  count?: number;
  items: string[];
}

const props = defineProps<Props>();
</script>

<script>
// 或使用运行时验证
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    items: {
      type: Array,
      default: () => []
    }
  }
};
</script>
```

### Prop的类型有哪些？

| 类型 | 说明 | 示例 |
|------|------|------|
| String | 字符串 | `type: String` |
| Number | 数字 | `type: Number` |
| Boolean | 布尔值 | `type: Boolean` |
| Array | 数组 | `type: Array` |
| Object | 对象 | `type: Object` |
| Date | 日期 | `type: Date` |
| Function | 函数 | `type: Function` |
| Symbol | 符号 | `type: Symbol` |

**自定义验证**：

```javascript
props: {
  age: {
    type: Number,
    validator: (value) => {
      return value >= 0 && value <= 150;
    }
  }
}
```

### 如何自定义事件？

```vue
<script setup>
// 定义事件
const emit = defineEmits<{
  update: [value: string];
  change: [id: number, value: string];
}>();

// 触发事件
function handleClick() {
  emit('update', 'new value');
  emit('change', 1, 'test');
}
</script>

<script>
// 或使用运行时定义
export default {
  emits: ['update', 'change'],
  methods: {
    handleClick() {
      this.$emit('update', 'new value');
    }
  }
};
</script>
```

### v-model的原理？

v-model是`props + emit`的语法糖：

```vue
<!-- 父组件 -->
<ChildComponent v-model="count" />

<!-- 等价于 -->
<ChildComponent :modelValue="count" @update:modelValue="count = $event" />
```

**实现自定义v-model**：

```vue
<script setup>
const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <input
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
```

**多个v-model**：

```vue
<UserForm
  v-model:name="name"
  v-model:email="email"
/>

<!-- 等价于 -->
<UserForm
  :name="name"
  @update:name="name = $event"
  :email="email"
  @update:email="email = $event"
/>
```

## 插槽Slots

### 什么是插槽？

插槽是组件的内容分发机制，允许父组件向子组件传递模板内容。

**默认插槽**：

```vue
<!-- 子组件 BaseLayout.vue -->
<template>
  <div class="container">
    <slot></slot>
  </div>
</template>

<!-- 父组件使用 -->
<BaseLayout>
  <p>这是插槽内容</p>
</BaseLayout>
```

**具名插槽**：

```vue
<!-- 子组件 -->
<template>
  <div class="container">
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

<!-- 父组件使用 -->
<BaseLayout>
  <template #header>
    <h1>标题</h1>
  </template>

  <p>主内容</p>

  <template #footer>
    <p>页脚</p>
  </template>
</BaseLayout>
```

**作用域插槽**：

```vue
<!-- 子组件 -->
<template>
  <slot name="item" :item="item" :index="index"></slot>
</template>

<!-- 父组件使用 -->
<MyList>
  <template #item="{ item, index }">
    <span>{{ index }}: {{ item.name }}</span>
  </template>
</MyList>
```

### 动态插槽？

```vue
<template>
  <slot :name="dynamicSlotName"></slot>
</template>

<script setup>
import { ref } from 'vue';

const dynamicSlotName = ref('header');
</script>
```

## 组件通信

### Provide / Inject如何使用？

用于跨层级组件通信，祖先组件提供数据，后代组件注入数据。

```javascript
// 祖先组件
import { provide, ref, readonly } from 'vue';

const count = ref(0);
provide('count', readonly(count));  // 提供只读数据

function increment() {
  count.value++;
}
provide('increment', increment);

// 后代组件
import { inject } from 'vue';

const count = inject('count', 0);  // 默认值0
const increment = inject('increment');
```

**最佳实践**：
1. **使用Symbol作为key**，避免命名冲突
2. **提供readonly数据**，避免后代组件修改
3. **提供修改方法**，保持数据流向清晰

```javascript
// keys.js
export const CountKey = Symbol('count');
export const IncrementKey = Symbol('increment');

// 祖先组件
import { CountKey, IncrementKey } from './keys';

provide(CountKey, readonly(count));
provide(IncrementKey, increment);

// 后代组件
import { CountKey, IncrementKey } from './keys';

const count = inject(CountKey, ref(0));
const increment = inject(IncrementKey);
```

### Expose / Ref如何使用？

父组件通过ref访问子组件的属性和方法。

```vue
<!-- 子组件 Child.vue -->
<script setup>
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}

// 暴露给父组件
defineExpose({
  count,
  increment
});
</script>

<!-- 父组件 -->
<script setup>
import { ref, onMounted } from 'vue';
import Child from './Child.vue';

const childRef = ref(null);

onMounted(() => {
  console.log(childRef.value.count);  // 访问子组件数据
  childRef.value.increment();         // 调用子组件方法
});
</script>

<template>
  <Child ref="childRef" />
</template>
```

## 组件生命周期

### 父子组件生命周期执行顺序？

**挂载阶段**：
```
父 beforeCreate
父 created
父 beforeMount
  子 beforeCreate
  子 created
  子 beforeMount
  子 mounted
父 mounted
```

**更新阶段**：
```
父 beforeUpdate
  子 beforeUpdate
  子 updated
父 updated
```

**卸载阶段**：
```
父 beforeUnmount
  子 beforeUnmount
  子 unmounted
父 unmounted
```

### 组件缓存（keep-alive）？

keep-alive缓存不活动的组件实例，保留组件状态。

```vue
<keep-alive>
  <component :is="currentComponent"></component>
</keep-alive>
```

**生命周期钩子**：
- `onActivated`：组件被激活时调用
- `onDeactivated`：组件被停用时调用

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue';

onActivated(() => {
  console.log('组件被激活');
  // 重新加载数据
});

onDeactivated(() => {
  console.log('组件被停用');
  // 清理定时器等
});
</script>
```

**include和exclude**：

```vue
<!-- 只缓存A和B组件 -->
<keep-alive :include="['A', 'B']">
  <component :is="currentComponent"></component>
</keep-alive>

<!-- 不缓存C组件 -->
<keep-alive :exclude="['C']">
  <component :is="currentComponent"></component>
</keep-alive>
```

## 组件设计模式

### 什么是组合式组件设计？

将组件拆分为多个可复用的组合式函数：

```javascript
// useForm.js - 表单逻辑
import { ref } from 'vue';

export function useForm(initialValues) {
  const form = ref({ ...initialValues });
  const errors = ref({});

  function validate(rules) {
    // 验证逻辑
  }

  function reset() {
    form.value = { ...initialValues };
    errors.value = {};
  }

  return {
    form,
    errors,
    validate,
    reset
  };
}

// useTable.js - 表格逻辑
export function useTable(fetchData) {
  const data = ref([]);
  const loading = ref(false);
  const pagination = ref({
    page: 1,
    pageSize: 10
  });

  async function load() {
    loading.value = true;
    try {
      const res = await fetchData(pagination.value);
      data.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  return {
    data,
    loading,
    pagination,
    load
  };
}

// 组件中使用
<script setup>
import { useForm } from './useForm';
import { useTable } from './useTable';

const { form, validate, reset } = useForm({
  name: '',
  email: ''
});

const { data, loading, load } = useTable(fetchUserData);
</script>
```

### 递归组件？

组件可以递归调用自身：

```vue
<!-- TreeNode.vue -->
<template>
  <div>
    <node-content :node="node" />

    <!-- 递归渲染子节点 -->
    <tree-node
      v-for="child in node.children"
      :key="child.id"
      :node="child"
    />
  </div>
</template>

<script setup>
defineProps(['node']);

// 组件必须显式提供name
defineOptions({
  name: 'TreeNode'
});
</script>
```

**注意事项**：
1. 必须提供`name`选项
2. 必须有终止条件，避免无限递归
3. 注意性能，大数据量使用虚拟滚动

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
