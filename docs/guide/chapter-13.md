# 组件通信（完整版）

## 组件通信（完整版）

> **学习目标**：全面掌握 Vue3 组件通信方式
> **核心内容**：Props、Emit、v-model、Provide/Inject、插槽

### Props 父传子（详解）

```vue
<!-- 父组件 Parent.vue -->
<script setup lang="ts">
import { ref } from "vue";
import ChildComponent from "./ChildComponent.vue";

const postTitle = ref("Vue3完全指南");
const postAuthor = ref({ name: "张三", id: 1 });
const isPublished = ref(true);
const likesCount = ref(100);
const postTags = ref(["Vue", "前端", "教程"]);

function handleUpdate(data: any) {
  console.log("收到子组件更新:", data);
}
</script>

<template>
  <ChildComponent
    :title="postTitle"
    :author="postAuthor"
    :is-published="isPublished"
    :likes="likesCount"
    :tags="postTags"
    @update="handleUpdate"
  />
</template>
```

```vue
<!-- 子组件 ChildComponent.vue -->
<script setup lang="ts">
interface Author {
  name: string;
  id: number;
}

interface Props {
  title: string;
  author: Author;
  isPublished: boolean;
  likes?: number;
  tags: string[];
}

const props = withDefaults(defineProps<Props>(), {
  likes: 0,
});
</script>

<template>
  <div class="child">
    <h2>{{ title }}</h2>
    <p>作者：{{ author.name }}</p>
    <p>状态：{{ isPublished ? "已发布" : "草稿" }}</p>
    <p>点赞：{{ likes }}</p>
    <div>
      <span v-for="tag in tags" :key="tag" class="tag">
        {{ tag }}
      </span>
    </div>
  </div>
</template>
```

### Emit 子传父（详解）

```vue
<!-- 子组件 Child.vue -->
<script setup lang="ts">
interface Emits {
  submit: [data: { id: number; value: string }];
  cancel: [];
  change: [newValue: string, oldValue: string];
}

const emit = defineEmits<Emits>();

function submitForm() {
  // 触发事件并传递数据
  emit("submit", {
    id: 1,
    value: "hello",
  });
}
</script>

<template>
  <button @click="submitForm">提交</button>
</template>
```

```vue
<!-- 父组件 Parent.vue -->
<script setup lang="ts">
import Child from "./Child.vue";

function handleSubmit(data: { id: number; value: string }) {
  console.log("收到提交:", data.id, data.value);
}

function handleCancel() {
  console.log("操作取消");
}

function handleChange(newValue: string, oldValue: string) {
  console.log(`值从 ${oldValue} 变为 ${newValue}`);
}
</script>

<template>
  <Child @submit="handleSubmit" @cancel="handleCancel" @change="handleChange" />
</template>
```

### v-model 组件双向绑定

```vue
<!-- 子组件 UserInput.vue -->
<script setup lang="ts">
interface Props {
  modelValue: string;
}

interface Emits {
  "update:modelValue": [value: string];
}

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <input
    type="text"
    :value="modelValue"
    @input="
      $emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
  />
</template>
```

```vue
<!-- 父组件使用 -->
<script setup lang="ts">
import { ref } from "vue";
import UserInput from "./UserInput.vue";

const username = ref("");
</script>

<template>
  <UserInput v-model="username" />
  <!-- 等价于 -->
  <UserInput :modelValue="username" @update:modelValue="username = $event" />
</template>
```

### Provide / Inject 跨层级通信

```vue
<!-- 祖先组件 Root.vue -->
<script setup lang="ts">
import { provide, ref, readonly } from "vue";

// 提供响应式数据
const theme = ref("light");
const user = ref({ name: "张三", role: "admin" });

// 提供方法
const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
};

// 提供给后代组件（使用 readonly 防止被修改）
provide("theme", readonly(theme));
provide("user", readonly(user));
provide("toggleTheme", toggleTheme);
</script>

<template>
  <div>
    <Parent />
  </div>
</template>
```

```vue
<!-- 后代组件 DeepChild.vue -->
<script setup lang="ts">
import { inject } from "vue";

// 注入数据
const theme = inject("theme", "light");
const user = inject("user");
const toggleTheme = inject("toggleTheme") as () => void;
</script>

<template>
  <div :class="theme">
    <p>用户：{{ user?.name }}</p>
    <button @click="toggleTheme">切换主题</button>
  </div>
</template>
```

### 插槽 Slots

```vue
<!-- BaseLayout.vue -->
<script setup lang="ts">
interface Slots {
  header?: () => any;
  default?: () => any;
  footer?: () => any;
}

defineSlots<Slots>();
</script>

<template>
  <div class="container">
    <header>
      <slot name="header">
        <h1>默认标题</h1>
      </slot>
    </header>

    <main>
      <slot>
        <p>默认内容</p>
      </slot>
    </main>

    <footer>
      <slot name="footer" />
    </footer>
  </div>
</template>
```

```vue
<!-- 使用组件 -->
<script setup lang="ts">
import BaseLayout from "./BaseLayout.vue";
</script>

<template>
  <BaseLayout>
    <!-- 具名插槽 -->
    <template #header>
      <h1>我的页面标题</h1>
    </template>

    <!-- 默认插槽 -->
    <p>这是主要内容区域</p>

    <!-- 另一种具名插槽写法 -->
    <template v-slot:footer>
      <p>&copy; 2026 版权所有</p>
    </template>
  </BaseLayout>
</template>
```

### 作用域插槽

```vue
<!-- UserList.vue -->
<script setup lang="ts">
interface User {
  id: number;
  name: string;
  email: string;
}

interface Props {
  users: User[];
}

defineProps<Props>();
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      <slot :user="user" :index="user.id">
        <!-- 默认内容 -->
        {{ user.name }}
      </slot>
    </li>
  </ul>
</template>
```

```vue
<!-- 使用作用域插槽 -->
<script setup lang="ts">
import { ref } from "vue";
import UserList from "./UserList.vue";

const users = ref([
  { id: 1, name: "张三", email: "zhang@example.com" },
  { id: 2, name: "李四", email: "li@example.com" },
]);

function edit(user: (typeof users.value)[0]) {
  console.log("编辑用户:", user);
}
</script>

<template>
  <UserList :users="users">
    <template #default="{ user, index }">
      <span>{{ index }}. </span>
      <strong>{{ user.name }}</strong>
      <em>({{ user.email }})</em>
      <button @click="edit(user)">编辑</button>
    </template>
  </UserList>
</template>
```

---
