# 组件与自动化导入

## 组件与自动化导入

> **为什么要学这一章？**
>
> Nuxt 3 的组件自动导入功能大幅提升了开发效率。你不需要手动 import 组件，直接在模板中使用即可。理解组件系统的工作原理，能让你更好地组织和管理应用中的组件。
>
> **学习目标**：
>
> - 理解 Nuxt 的组件自动导入机制
> - 掌握组件的创建和使用方法
> - 学会组件属性和插槽的使用
> - 了解组件的高级用法和最佳实践

---

### 组件自动导入

#### 自动导入原理

Nuxt 3 扫描 `components/` 目录中的所有 `.vue` 文件，并自动注册为全局组件。

```bash
components/
├── Header.vue                # → <Header /> 或 <header />
├── Footer.vue                # → <Footer /> 或 <footer />
├── Button.vue                # → <Button /> 或 <button />
├── UserCard.vue              # → <UserCard /> 或 <user-card />
└── blog/
    ├── PostCard.vue          # → <BlogPostCard /> 或 <blog-post-card />
    └── PostList.vue          # → <BlogPostList /> 或 <blog-post-list />
```

#### 使用自动导入的组件

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <!-- ✅ 直接使用，无需 import -->
    <Header />
    <Footer />

    <!-- 使用嵌套目录中的组件 -->
    <BlogPostCard :post="post" />
    <BlogPostList :posts="posts" />

    <!-- 或者使用 kebab-case -->
    <header />
    <blog-post-card :post="post" />
  </div>
</template>

<script setup lang="ts>
// ❌ 不需要手动导入
// import Header from '~/components/Header.vue'
// import Footer from '~/components/Footer.vue'

const post = ref({
  title: 'Hello Nuxt',
  content: '...'
})

const posts = ref([])
</script>
```

#### 组件命名规则

| 文件名 | PascalCase | kebab-case |
|--------|-----------|-----------|
| `Header.vue` | `<Header />` | `<header />` |
| `UserCard.vue` | `<UserCard />` | `<user-card />` |
| `blog/PostCard.vue` | `<BlogPostCard />` | `<blog-post-card />` |
| `admin/DashboardHeader.vue` | `<AdminDashboardHeader />` | `<admin-dashboard-header />` |

**优先使用 PascalCase**，因为：
- 与 JavaScript/TypeScript 命名一致
- 更容易区分 HTML 自定义元素和 Vue 组件
- IDE 支持更好

---

### 组件基础

#### 创建组件

```vue
<!-- components/Button.vue -->
<template>
  <button
    :type="type"
    :class="buttonClass"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner"></span>
    <slot />
  </button>
</template>

<script setup lang="ts">
// 定义 props
interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false
})

// 定义 emits
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 计算属性
const buttonClass = computed(() => [
  'btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  {
    'btn-disabled': props.disabled,
    'btn-loading': props.loading
  }
])

// 方法
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn:disabled,
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

#### 使用组件

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <!-- 基础用法 -->
    <Button @click="handleClick">点击我</Button>

    <!-- 不同变体 -->
    <Button variant="primary">主要按钮</Button>
    <Button variant="secondary">次要按钮</Button>
    <Button variant="danger">危险按钮</Button>
    <Button variant="success">成功按钮</Button>

    <!-- 不同尺寸 -->
    <Button size="small">小按钮</Button>
    <Button size="medium">中等按钮</Button>
    <Button size="large">大按钮</Button>

    <!-- 禁用状态 -->
    <Button :disabled="true">禁用按钮</Button>

    <!-- 加载状态 -->
    <Button :loading="isLoading">加载中...</Button>

    <!-- 提交按钮 -->
    <Button type="submit">提交</Button>
  </div>
</template>

<script setup lang="ts>
const isLoading = ref(false)

const handleClick = () => {
  console.log('按钮被点击了')
}
</script>
```

---

### 组件属性（Props）

#### 基础 Props

```vue
<!-- components/UserCard.vue -->
<template>
  <div class="user-card">
    <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
    <div v-else class="avatar-placeholder">
      {{ user.name.charAt(0) }}
    </div>

    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>

    <span v-if="user.role" class="role">{{ user.role }}</span>
  </div>
</template>

<script setup lang="ts>
interface User {
  id: number
  name: string
  email: string
  avatar?: string
  role?: string
}

// 定义 props（使用 TypeScript）
const props = defineProps<{
  user: User
  showRole?: boolean
}>()

// 或使用 withDefaults 设置默认值
// const props = withDefaults(defineProps<{
//   user: User
//   showRole?: boolean
// }>(), {
//   showRole: true
// })
</script>

<style scoped>
.user-card {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.user-card img,
.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.role {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e0e0e0;
  border-radius: 12px;
  font-size: 0.875rem;
  color: #666;
}
</style>
```

#### Props 验证

```vue
<!-- components/FormInput.vue -->
<template>
  <div class="form-group">
    <label v-if="label" :for="inputId">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :minlength="minlength"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      :step="step"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <span v-if="error" class="error">{{ error }}</span>
    <span v-else-if="helper" class="helper">{{ helper }}</span>
  </div>
</template>

<script setup lang="ts>
interface Props {
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  minlength?: number
  maxlength?: number
  min?: number
  max?: number
  step?: number
  error?: string
  helper?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputId = computed(() => `input-${Math.random().toString(36).slice(2, 11)}`)

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

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #dc3545;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.error {
  display: block;
  margin-top: 0.25rem;
  color: #dc3545;
  font-size: 0.875rem;
}

.helper {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}
</style>
```

---

### 组件插槽（Slots）

#### 基础插槽

```vue
<!-- components/Card.vue -->
<template>
  <div class="card">
    <!-- 默认插槽 -->
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
}

.card-body {
  /* 内容样式 */
}
</style>
```

```vue
<!-- 使用 Card 组件 -->
<template>
  <Card>
    <h2>卡片标题</h2>
    <p>这是卡片内容</p>
  </Card>
</template>
```

#### 具名插槽

```vue
<!-- components/Modal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal" @click.stop>
      <!-- 头部插槽 -->
      <div v-if="$slots.header" class="modal-header">
        <slot name="header" />
      </div>

      <!-- 默认内容插槽 -->
      <div class="modal-body">
        <slot />
      </div>

      <!-- 底部插槽 -->
      <div v-if="$slots.footer" class="modal-footer">
        <slot name="footer" />
      </div>

      <!-- 关闭按钮 -->
      <button class="modal-close" @click="close">×</button>
    </div>
  </div>
</template>

<script setup lang="ts>
interface Props {
  show: boolean
  closeOnClickOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closeOnClickOverlay: true
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
}>()

const close = () => {
  emit('update:show', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    close()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: auto;
  position: relative;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.modal-close:hover {
  background: #f0f0f0;
  color: #333;
}
</style>
```

```vue
<!-- 使用 Modal 组件 -->
<template>
  <div>
    <button @click="showModal = true">打开弹窗</button>

    <Modal v-model:show="showModal">
      <!-- 头部插槽 -->
      <template #header>
        <h2>确认删除</h2>
      </template>

      <!-- 默认内容 -->
      <p>您确定要删除这个项目吗？此操作无法撤销。</p>

      <!-- 底部插槽 -->
      <template #footer>
        <Button variant="secondary" @click="showModal = false">取消</Button>
        <Button variant="danger" @click="confirmDelete">确认删除</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts>
const showModal = ref(false)

const confirmDelete = () => {
  // 执行删除操作
  console.log('删除确认')
  showModal.value = false
}
</script>
```

#### 作用域插槽

```vue
<!-- components/Table.vue -->
<template>
  <div class="table-container">
    <table class="table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in data" :key="rowIndex">
          <td v-for="column in columns" :key="column.key">
            <!-- 使用作用域插槽 -->
            <slot
              :name="column.key"
              :row="row"
              :value="row[column.key]"
              :column="column"
              :row-index="rowIndex"
            >
              <!-- 默认显示值 -->
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts>
interface Column {
  key: string
  label: string
}

interface Props {
  columns: Column[]
  data: Record<string, any>[]
}

defineProps<Props>()
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.table th {
  background: #f5f5f5;
  font-weight: 600;
  color: #333;
}

.table tr:hover {
  background: #f9f9f9;
}
</style>
```

```vue
<!-- 使用 Table 组件 -->
<template>
  <Table
    :columns="columns"
    :data="users"
  >
    <!-- 自定义 name 列 -->
    <template #name="{ row, value }">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <img :src="row.avatar" :alt="value" style="width: 32px; height: 32px; border-radius: 50%;" />
        <strong>{{ value }}</strong>
      </div>
    </template>

    <!-- 自定义 email 列 -->
    <template #email="{ value }">
      <a :href="`mailto:${value}`">{{ value }}</a>
    </template>

    <!-- 自定义 role 列 -->
    <template #role="{ value }">
      <span :class="['badge', `badge-${value}`]">{{ value }}</span>
    </template>

    <!-- 自定义操作列 -->
    <template #actions="{ row }">
      <button @click="editUser(row)">编辑</button>
      <button @click="deleteUser(row.id)">删除</button>
    </template>
  </Table>
</template>

<script setup lang="ts>
const columns = [
  { key: 'name', label: '姓名' },
  { key: 'email', label: '邮箱' },
  { key: 'role', label: '角色' },
  { key: 'actions', label: '操作' }
]

const users = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin', avatar: '/avatar1.jpg' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: 'user', avatar: '/avatar2.jpg' }
])

const editUser = (user: any) => {
  console.log('编辑用户:', user)
}

const deleteUser = (id: number) => {
  console.log('删除用户:', id)
}
</script>

<style scoped>
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.badge-admin {
  background: #dc3545;
  color: white;
}

.badge-user {
  background: #28a745;
  color: white;
}
</style>
```

---

### 实战案例：组件库应用

#### 项目结构

```bash
components/
├── base/
│   ├── Button.vue
│   ├── Input.vue
│   ├── Select.vue
│   └── Modal.vue
├── forms/
│   ├── Form.vue
│   ├── FormItem.vue
│   └── FormLabel.vue
└── ui/
    ├── Card.vue
    ├── Table.vue
    └── Badge.vue
```

#### 完整的表单组件

```vue
<!-- components/forms/Form.vue -->
<template>
  <form :class="formClass" @submit.prevent="handleSubmit">
    <slot />
  </form>
</template>

<script setup lang="ts>
interface Props {
  inline?: boolean
  horizontal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  inline: false,
  horizontal: false
})

const emit = defineEmits<{
  submit: [event: Event]
}>()

const formClass = computed(() => [
  'form',
  {
    'form-inline': props.inline,
    'form-horizontal': props.horizontal
  }
])

const handleSubmit = (event: Event) => {
  emit('submit', event)
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-inline {
  flex-direction: row;
  align-items: center;
}

.form-horizontal {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  align-items: start;
}
</style>
```

#### 使用表单组件

```vue
<!-- pages/register.vue -->
<template>
  <div class="register-page">
    <Card>
      <h1>用户注册</h1>

      <Form @submit="handleRegister">
        <FormItem label="用户名" required>
          <FormInput
            v-model="form.username"
            placeholder="请输入用户名"
            :error="errors.username"
            required
          />
        </FormItem>

        <FormItem label="邮箱" required>
          <FormInput
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱"
            :error="errors.email"
            required
          />
        </FormItem>

        <FormItem label="密码" required>
          <FormInput
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :error="errors.password"
            required
          />
        </FormItem>

        <FormItem label="确认密码" required>
          <FormInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :error="errors.confirmPassword"
            required
          />
        </FormItem>

        <FormItem>
          <Button type="submit" :loading="loading" variant="primary" size="large">
            注册
          </Button>
        </FormItem>
      </Form>
    </Card>
  </div>
</template>

<script setup lang="ts>
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)

const handleRegister = async () => {
  // 验证表单
  errors.value = {}

  if (!form.value.username) {
    errors.value.username = '请输入用户名'
  }

  if (!form.value.email) {
    errors.value.email = '请输入邮箱'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = '邮箱格式不正确'
  }

  if (!form.value.password) {
    errors.value.password = '请输入密码'
  } else if (form.value.password.length < 6) {
    errors.value.password = '密码长度不能少于6位'
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = '两次密码输入不一致'
  }

  if (Object.keys(errors.value).length > 0) {
    return
  }

  // 提交表单
  loading.value = true

  try {
    const { data, error } = await useFetch('/api/auth/register', {
      method: 'POST',
      body: form.value
    })

    if (!error.value) {
      alert('注册成功')
      await navigateTo('/login')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.register-page h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}
</style>
```

---

### 组件最佳实践

#### 1. 组件命名

```bash
# ✅ 好的命名
components/
├── UserCard.vue           # 清晰表达组件功能
├── BlogPostList.vue       # 多个单词使用 PascalCase
└── forms/FormInput.vue    # 按功能分组

# ❌ 不好的命名
components/
├── Card.vue              # 太通用
├── List.vue              # 不清晰
└── component1.vue        # 无意义
```

#### 2. Props 设计

```typescript
// ✅ 好的设计
interface Props {
  user: User              // 必需的对象
  loading?: boolean       // 可选的布尔值
  size?: 'small' | 'medium' | 'large'  // 有限的选项
}

// ❌ 不好的设计
interface Props {
  data: any               // 类型不明确
  config: object          // 太宽泛
  options?: any[]         // 不清楚数组内容
}
```

#### 3. 组件通信

```vue
<!-- ✅ 使用 v-model -->
<MyInput v-model="value" />

<!-- ✅ 使用 defineEmts -->
<MyModal @confirm="handleConfirm" @cancel="handleCancel" />

<!-- ❌ 避免直接修改 props -->
<!-- 子组件不应该：props.value++ -->
```

---

### 本章小结

#### 组件类型速查表

| 组件类型 | 文件位置 | 使用场景 | 自动导入 |
|---------|---------|---------|---------|
| **全局组件** | `components/` | 通用组件 | ✅ 是 |
| **页面组件** | `pages/` | 路由页面 | ❌ 否 |
| **布局组件** | `layouts/` | 页面布局 | ❌ 否 |

#### 组件通信方式

| 方式 | 用途 | 示例 |
|------|------|------|
| **Props** | 父→子传递数据 | `<UserCard :user="userData" />` |
| **Emits** | 子→父传递事件 | `<Button @click="handleClick" />` |
| **v-model** | 双向绑定 | `<Input v-model="value" />` |
| **Slots** | 父→子传递内容 | `<Modal>内容</Modal>` |
| **Provide/Inject** | 跨层级传递 | `provide('key', value)` |

#### 最佳实践

1. **组件职责单一**：每个组件只做一件事
2. **Props 明确定义**：使用 TypeScript 类型
3. **事件命名清晰**：使用动词（click, submit, confirm）
4. **插槽灵活设计**：提供默认内容和自定义能力
5. **避免过度嵌套**：超过3层考虑拆分

---

**下一步学习**: 建议继续学习[Nuxt配置文件](./chapter-116)了解Nuxt的完整配置。
