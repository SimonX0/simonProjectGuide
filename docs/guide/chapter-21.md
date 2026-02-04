# 第 21 章：ElementPlus 组件库完全指南

## 第 21 章 ElementPlus 组件库完全指南

> **学习目标**：掌握 ElementPlus 组件库的使用
> **核心内容**：全局引入、局部引入、自动按需引入、主题定制、常用组件实战

### 21.1 什么是 ElementPlus？

**Element Plus** 是一套基于 Vue 3 的组件库，专为开发企业级中后台产品而设计。它提供了丰富的 UI 组件，帮助开发者快速构建美观、功能完善的 Web 应用。

**核心特性：**

- 基于 Vue 3 Composition API 开发
- 完整的 TypeScript 类型支持
- 60+ 高质量组件
- 支持按需引入，减少打包体积
- 支持主题定制
- 国际化支持
- 无障碍访问支持

### 21.2 安装与配置

#### 通过 npm 安装

```bash
npm install element-plus
```

#### 通过 pnpm 安装

```bash
pnpm add element-plus
```

#### 通过 yarn 安装

```bash
yarn add element-plus
```

#### 安装图标库（可选）

```bash
npm install @element-plus/icons-vue
```

### 21.3 全局引入 ElementPlus

**适用场景**：小型项目、快速原型开发、使用大部分组件

#### 方式一：基础全局引入

```typescript
// main.ts
import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";

const app = createApp(App);
app.use(ElementPlus);
app.mount("#app");
```

```vue
<!-- 直接在任何组件中使用 -->
<template>
  <div>
    <el-button>默认按钮</el-button>
    <el-button type="primary">主要按钮</el-button>
    <el-button type="success">成功按钮</el-button>
    <el-button type="warning">警告按钮</el-button>
    <el-button type="danger">危险按钮</el-button>
  </div>
</template>
```

#### 方式二：带配置的全局引入

```typescript
// main.ts
import { createApp } from "vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import "element-plus/dist/index.css";
import App from "./App.vue";

const app = createApp(App);

app.use(ElementPlus, {
  // 设置中文
  locale: zhCn,
  // 设置组件尺寸
  size: "default",
  // 设置弹窗层级
  zIndex: 2000,
});

app.mount("#app");
```

#### 方式三：全局引入图标库

```typescript
// main.ts
import { createApp } from "vue";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/dist/index.css";
import App from "./App.vue";

const app = createApp(App);
app.use(ElementPlus);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");
```

```vue
<!-- 使用图标 -->
<template>
  <div>
    <el-icon :size="20">
      <Edit />
    </el-icon>
    <el-button :icon="Search">搜索</el-button>
    <el-button type="primary" :icon="Plus">新增</el-button>
  </div>
</template>

<script setup lang="ts">
import { Edit, Search, Plus } from "@element-plus/icons-vue";
</script>
```

#### 方式四：完整的全局配置示例

```typescript
// plugins/elementPlus.ts
import type { App } from "vue";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import "element-plus/dist/index.css";

export function setupElementPlus(app: App) {
  // 注册 Element Plus
  app.use(ElementPlus, {
    locale: zhCn,
    size: "default",
    zIndex: 3000,
  });

  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
}
```

```typescript
// main.ts
import { createApp } from "vue";
import { setupElementPlus } from "./plugins/elementPlus";
import App from "./App.vue";

const app = createApp(App);
setupElementPlus(app);
app.mount("#app");
```

#### 实战案例：登录页面

```vue
<!-- views/Login.vue -->
<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="30" color="#409EFF"><User /></el-icon>
          <span>用户登录</span>
        </div>
      </template>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            :loading="loading"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button link @click="goToRegister">还没有账号？立即注册</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";

const router = useRouter();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  username: "",
  password: "",
  remember: false,
});

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 3,
      max: 20,
      message: "用户名长度在 3 到 20 个字符",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" },
  ],
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      // 模拟登录请求
      setTimeout(() => {
        loading.value = false;
        ElMessage.success("登录成功");
        router.push("/dashboard");
      }, 1000);
    }
  });
};

const goToRegister = () => {
  router.push("/register");
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 450px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;
}
</style>
```

### 21.4 局部引入 ElementPlus

**适用场景**：大型项目、追求性能优化、使用少量组件

#### 方式一：手动按需引入组件

```vue
<!-- HelloWorld.vue -->
<script setup lang="ts">
import { ElButton, ElInput, ElMessage } from "element-plus";

const handleClick = () => {
  ElMessage.success("按钮被点击了");
};
</script>

<template>
  <div class="hello">
    <el-input placeholder="请输入内容" />
    <el-button @click="handleClick">点击我</el-button>
  </div>
</template>
```

**注意：** 手动按需引入时，需要单独引入样式：

```typescript
// main.ts - 引入基础样式
import "element-plus/dist/index.css";
```

或者按需引入样式：

```vue
<script setup lang="ts">
import "element-plus/es/components/button/style/css";
import "element-plus/es/components/input/style/css";
import { ElButton, ElInput } from "element-plus";
</script>
```

#### 方式二：封装按需引入

```typescript
// utils/elementImports.ts
export {
  ElButton,
  ElInput,
  ElForm,
  ElFormItem,
  ElCard,
  ElTable,
  ElTableColumn,
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElLoading,
  type FormInstance,
  type FormRules,
} from "element-plus";
```

```vue
<!-- 使用封装的导入 -->
<script setup lang="ts">
import { ElButton, ElInput, ElMessage } from "@/utils/elementImports";
</script>
```

#### 方式三：创建组件包装器

```vue
<!-- components/MyButton.vue -->
<script setup lang="ts">
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";

interface Props {
  type?: "primary" | "success" | "warning" | "danger" | "info";
  size?: "large" | "default" | "small";
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "default",
  size: "default",
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <el-button
    :type="type"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    @click="emit('click', $event)"
  >
    <slot />
  </el-button>
</template>
```

#### 实战案例：用户列表页面

```vue
<!-- views/UserList.vue -->
<template>
  <div class="user-list">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="全部" value="" />
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区域 -->
    <el-card class="action-card">
      <el-button type="primary" :icon="Plus" @click="handleAdd"
        >新增用户</el-button
      >
      <el-button
        type="danger"
        :icon="Delete"
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'danger'">
              {{ row.status === "1" ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button link type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  status: string;
  createTime: string;
}

const loading = ref(false);
const selectedIds = ref<number[]>([]);

// 搜索表单
const searchForm = reactive({
  username: "",
  status: "",
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 表格数据
const tableData = ref<User[]>([]);

// 获取列表数据
const fetchList = async () => {
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    tableData.value = [
      {
        id: 1,
        username: "admin",
        email: "admin@example.com",
        phone: "13800138000",
        status: "1",
        createTime: "2026-01-01 10:00:00",
      },
      {
        id: 2,
        username: "user001",
        email: "user001@example.com",
        phone: "13900139000",
        status: "1",
        createTime: "2026-01-02 10:00:00",
      },
      {
        id: 3,
        username: "user002",
        email: "user002@example.com",
        phone: "13700137000",
        status: "0",
        createTime: "2026-01-03 10:00:00",
      },
    ];
    pagination.total = 3;
    loading.value = false;
  }, 500);
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchList();
};

// 重置
const handleReset = () => {
  searchForm.username = "";
  searchForm.status = "";
  pagination.page = 1;
  fetchList();
};

// 选择变化
const handleSelectionChange = (selection: User[]) => {
  selectedIds.value = selection.map((item) => item.id);
};

// 新增
const handleAdd = () => {
  ElMessage.info("打开新增对话框");
};

// 编辑
const handleEdit = (row: User) => {
  ElMessage.info(`编辑用户：${row.username}`);
};

// 删除
const handleDelete = (row: User) => {
  ElMessageBox.confirm(`确认删除用户 "${row.username}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      ElMessage.success("删除成功");
      fetchList();
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedIds.value.length} 条数据吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      ElMessage.success("批量删除成功");
      fetchList();
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

// 分页大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  fetchList();
};

// 当前页变化
const handleCurrentChange = (val: number) => {
  pagination.page = val;
  fetchList();
};

onMounted(() => {
  fetchList();
});
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.search-card,
.action-card,
.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
```

### 21.5 自动按需引入

**适用场景**：推荐所有项目使用，自动按需引入，无需手动导入

#### 安装依赖

```bash
npm install -D unplugin-vue-components unplugin-auto-import
```

#### 配置 Vite

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      // 自动导入 Vue 相关函数
      imports: ["vue", "vue-router", "pinia"],
      // 自动导入 Element Plus 相关函数
      resolvers: [ElementPlusResolver()],
      // 生成自动导入的类型声明文件
      dts: "src/auto-imports.d.ts",
    }),
    Components({
      // 自动导入 Element Plus 组件
      resolvers: [ElementPlusResolver()],
      // 生成自动导入的类型声明文件
      dts: "src/components.d.ts",
    }),
  ],
});
```

#### 配置自动导入图标

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
      resolvers: [
        ElementPlusResolver(),
        // 自动导入图标
        IconsResolver({
          prefix: "Icon",
        }),
      ],
      dts: "src/auto-imports.d.ts",
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ["ep"],
        }),
      ],
      dts: "src/components.d.ts",
    }),
    Icons({
      autoInstall: true,
    }),
  ],
});
```

安装图标依赖：

```bash
npm install -D unplugin-icons
```

#### 使用自动导入

配置完成后，可以直接使用组件和 API，无需手动导入：

```vue
<!-- 直接使用，无需 import -->
<template>
  <div>
    <el-button>按钮</el-button>
    <el-input />
    <el-icon :size="20"><i-ep-search /></el-icon>
  </div>
</template>

<script setup lang="ts">
// 直接使用 Vue API 和 Element Plus API，无需 import
const count = ref(0);

// 直接使用 Element Plus 方法
const showMessage = () => {
  ElMessage.success("成功");
  ElNotification.success("通知");
};
</script>
```

#### 类型声明文件

配置后会在 `src` 目录下生成自动导入的类型声明文件：

```typescript
// src/auto-imports.d.ts (自动生成)
// Generated by 'unplugin-auto-import'
export {};
declare global {
  const ElMessage: typeof import("element-plus")["ElMessage"];
  const ElMessageBox: typeof import("element-plus")["ElMessageBox"];
  const ElNotification: typeof import("element-plus")["ElNotification"];
  const ElLoading: typeof import("element-plus")["ElLoading"];
  // ...
}
```

```typescript
// src/components.d.ts (自动生成)
// Generated by 'unplugin-vue-components'
export {};
declare global {
  const ElButton: typeof import("element-plus")["ElButton"];
  const ElInput: typeof import("element-plus")["ElInput"];
  const ElForm: typeof import("element-plus")["ElForm"];
  // ...
}
```

### 21.6 主题定制

#### 方式一：CSS 变量覆盖

```scss
// styles/element-variables.scss
/* 改变主题色变量 */
$--color-primary: #409eff;
$--color-success: #67c23a;
$--color-warning: #e6a23c;
$--color-danger: #f56c6c;
$--color-error: #f56c6c;
$--color-info: #909399;

/* 改变字体变量 */
$--font-path: "~element-plus/theme-chalk/fonts";

@forward "element-plus/theme-chalk/src/common/var.scss" with (
  $colors: (
    "primary": (
      "base": $--color-primary,
    ),
    "success": (
      "base": $--color-success,
    ),
    "warning": (
      "base": $--color-warning,
    ),
    "danger": (
      "base": $--color-danger,
    ),
    "error": (
      "base": $--color-error,
    ),
    "info": (
      "base": $--color-info,
    ),
  )
);

@import "element-plus/theme-chalk/src/index";
```

#### 方式二：使用 SCSS 变量

```bash
npm install -D sass
```

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element-variables.scss" as *;`,
      },
    },
  },
});
```

#### 方式三：CSS 变量直接覆盖

```css
/* styles/theme.css */
:root {
  /* 主题色 */
  --el-color-primary: #409eff;
  --el-color-success: #67c23a;
  --el-color-warning: #e6a23c;
  --el-color-danger: #f56c6c;
  --el-color-error: #f56c6c;
  --el-color-info: #909399;

  /* 文字颜色 */
  --el-text-color-primary: #303133;
  --el-text-color-regular: #606266;
  --el-text-color-secondary: #909399;
  --el-text-color-placeholder: #a8abb2;

  /* 边框颜色 */
  --el-border-color: #dcdfe6;
  --el-border-color-light: #e4e7ed;
  --el-border-color-lighter: #ebeef5;
  --el-border-color-extra-light: #f2f6fc;
  --el-border-color-dark: #d4d7de;
  --el-border-color-darker: #cdd0d6;

  /* 填充色 */
  --el-fill-color: #f0f2f5;
  --el-fill-color-light: #f5f7fa;
  --el-fill-color-lighter: #fafafa;
  --el-fill-color-extra-light: #fafbff;
  --el-fill-color-dark: #ebedf0;
  --el-fill-color-darker: #e6e8eb;

  /* 背景色 */
  --el-bg-color: #ffffff;
  --el-bg-color-page: #f2f3f5;

  /* 圆角 */
  --el-border-radius-base: 4px;
  --el-border-radius-small: 2px;
  --el-border-radius-round: 20px;
  --el-border-radius-circle: 100%;

  /* 字体 */
  --el-font-size-extra-large: 20px;
  --el-font-size-large: 18px;
  --el-font-size-medium: 16px;
  --el-font-size-base: 14px;
  --el-font-size-small: 13px;
  --el-font-size-extra-small: 12px;
}
```

```typescript
// main.ts
import "element-plus/dist/index.css";
import "@/styles/theme.css";
```

#### 方式四：运行时主题切换

```vue
<!-- ThemeSwitcher.vue -->
<template>
  <div class="theme-switcher">
    <el-dropdown @command="handleCommand">
      <span class="theme-btn">
        <el-icon><Setting /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="light">
            <el-icon><Sunny /></el-icon> 浅色模式
          </el-dropdown-item>
          <el-dropdown-item command="dark">
            <el-icon><Moon /></el-icon> 深色模式
          </el-dropdown-item>
          <el-dropdown-item command="auto">
            <el-icon><Monitor /></el-icon> 跟随系统
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Setting, Sunny, Moon, Monitor } from "@element-plus/icons-vue";

const theme = ref("light");

onMounted(() => {
  const savedTheme = localStorage.getItem("theme") || "light";
  theme.value = savedTheme;
  applyTheme(savedTheme);
});

const handleCommand = (command: string) => {
  theme.value = command;
  localStorage.setItem("theme", command);
  applyTheme(command);
};

const applyTheme = (theme: string) => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};
</script>

<style scoped>
.theme-switcher {
  display: inline-block;
}

.theme-btn {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.theme-btn:hover {
  background-color: var(--el-fill-color-light);
}
</style>

<!-- 添加深色模式样式 -->
<style>
:root.dark {
  --el-bg-color: #1a1a1a;
  --el-bg-color-page: #0a0a0a;
  --el-text-color-primary: #e5eaf3;
  --el-text-color-regular: #cfd3dc;
  --el-text-color-secondary: #a3a6ad;
  --el-border-color: #4c4d4f;
  --el-fill-color: #2a2a2a;
  --el-fill-color-light: #262727;
  --el-fill-color-lighter: #212223;
  --el-fill-color-extra-light: #191a1a;
}
</style>
```

### 21.7 常用组件实战

#### 按钮组件

```vue
<template>
  <div class="button-demo">
    <h3>基础按钮</h3>
    <el-button>默认按钮</el-button>
    <el-button type="primary">主要按钮</el-button>
    <el-button type="success">成功按钮</el-button>
    <el-button type="warning">警告按钮</el-button>
    <el-button type="danger">危险按钮</el-button>

    <h3>朴素按钮</h3>
    <el-button plain>朴素按钮</el-button>
    <el-button type="primary" plain>主要按钮</el-button>

    <h3>圆角按钮</h3>
    <el-button round>圆角按钮</el-button>
    <el-button type="primary" round>主要按钮</el-button>

    <h3>带图标的按钮</h3>
    <el-button :icon="Search">搜索</el-button>
    <el-button type="primary" :icon="Edit">编辑</el-button>
    <el-button type="success" :icon="Check">完成</el-button>
    <el-button type="danger" :icon="Delete">删除</el-button>

    <h3>按钮尺寸</h3>
    <el-button size="large">大型按钮</el-button>
    <el-button>默认按钮</el-button>
    <el-button size="small">小型按钮</el-button>

    <h3>加载状态</h3>
    <el-button :loading="true">加载中</el-button>
  </div>
</template>

<script setup lang="ts">
import { Search, Edit, Check, Delete } from "@element-plus/icons-vue";
</script>
```

#### 表单组件

```vue
<template>
  <div class="form-demo">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="form.gender">
          <el-radio label="male">男</el-radio>
          <el-radio label="female">女</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="爱好" prop="hobbies">
        <el-checkbox-group v-model="form.hobbies">
          <el-checkbox label="reading">阅读</el-checkbox>
          <el-checkbox label="music">音乐</el-checkbox>
          <el-checkbox label="sports">运动</el-checkbox>
          <el-checkbox label="travel">旅行</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="城市" prop="city">
        <el-select v-model="form.city" placeholder="请选择城市">
          <el-option label="北京" value="beijing" />
          <el-option label="上海" value="shanghai" />
          <el-option label="广州" value="guangzhou" />
          <el-option label="深圳" value="shenzhen" />
        </el-select>
      </el-form-item>

      <el-form-item label="生日" prop="birthday">
        <el-date-picker
          v-model="form.birthday"
          type="date"
          placeholder="请选择日期"
        />
      </el-form-item>

      <el-form-item label="个人简介" prop="bio">
        <el-input
          v-model="form.bio"
          type="textarea"
          :rows="4"
          placeholder="请输入个人简介"
        />
      </el-form-item>

      <el-form-item label="协议" prop="agreed">
        <el-checkbox v-model="form.agreed">
          我已阅读并同意用户协议
        </el-checkbox>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";

interface Form {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone: string;
  gender: string;
  hobbies: string[];
  city: string;
  birthday: Date | null;
  bio: string;
  agreed: boolean;
}

const formRef = ref<FormInstance>();
const form = reactive<Form>({
  username: "",
  password: "",
  confirmPassword: "",
  email: "",
  phone: "",
  gender: "",
  hobbies: [],
  city: "",
  birthday: null,
  bio: "",
  agreed: false,
});

// 自定义验证规则
const validatePassword = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入密码"));
  } else if (value.length < 6) {
    callback(new Error("密码长度不能少于6位"));
  } else {
    if (form.confirmPassword !== "") {
      formRef.value?.validateField("confirmPassword");
    }
    callback();
  }
};

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请再次输入密码"));
  } else if (value !== form.password) {
    callback(new Error("两次输入密码不一致"));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 3,
      max: 20,
      message: "用户名长度在 3 到 20 个字符",
      trigger: "blur",
    },
  ],
  password: [{ required: true, validator: validatePassword, trigger: "blur" }],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  gender: [{ required: true, message: "请选择性别", trigger: "change" }],
  city: [{ required: true, message: "请选择城市", trigger: "change" }],
  agreed: [
    {
      type: "enum",
      enum: [true],
      message: "请阅读并同意用户协议",
      trigger: "change",
    },
  ],
});

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success("提交成功");
      console.log("表单数据:", form);
    } else {
      ElMessage.error("请填写正确的表单信息");
    }
  });
};

const handleReset = () => {
  formRef.value?.resetFields();
};
</script>
```

#### 表格组件

```vue
<template>
  <div class="table-demo">
    <el-table
      :data="tableData"
      style="width: 100%"
      :height="400"
      stripe
      border
      highlight-current-row
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" fixed />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="name" label="姓名" width="120" sortable />
      <el-table-column prop="age" label="年龄" width="80" sortable />
      <el-table-column prop="gender" label="性别" width="80">
        <template #default="{ row }">
          {{ row.gender === "male" ? "男" : "女" }}
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="phone" label="手机号" width="150" />
      <el-table-column prop="department" label="部门" width="120" />
      <el-table-column prop="position" label="职位" width="120" />
      <el-table-column prop="salary" label="薪资" width="120" sortable>
        <template #default="{ row }">
          ¥{{ row.salary.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="entryDate" label="入职日期" width="120" sortable />
      <el-table-column prop="status" label="状态" width="100" fixed="right">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            active-value="active"
            inactive-value="inactive"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

interface Employee {
  id: number;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  entryDate: string;
  status: string;
}

const tableData = ref<Employee[]>([
  {
    id: 1,
    name: "张三",
    age: 28,
    gender: "male",
    email: "zhangsan@example.com",
    phone: "13800138001",
    department: "技术部",
    position: "前端工程师",
    salary: 15000,
    entryDate: "2022-01-15",
    status: "active",
  },
  {
    id: 2,
    name: "李四",
    age: 32,
    gender: "female",
    email: "lisi@example.com",
    phone: "13800138002",
    department: "产品部",
    position: "产品经理",
    salary: 20000,
    entryDate: "2021-06-20",
    status: "active",
  },
  {
    id: 3,
    name: "王五",
    age: 25,
    gender: "male",
    email: "wangwu@example.com",
    phone: "13800138003",
    department: "设计部",
    position: "UI设计师",
    salary: 12000,
    entryDate: "2023-03-10",
    status: "inactive",
  },
]);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3,
});

const handleSelectionChange = (selection: Employee[]) => {
  console.log("选中的行:", selection);
};

const handleSortChange = ({ prop, order }: any) => {
  console.log("排序字段:", prop, "排序方式:", order);
};

const handleStatusChange = (row: Employee) => {
  ElMessage.success(
    `${row.name} 状态已更新为 ${row.status === "active" ? "启用" : "禁用"}`
  );
};

const handleView = (row: Employee) => {
  ElMessage.info(`查看 ${row.name} 的详细信息`);
};

const handleEdit = (row: Employee) => {
  ElMessage.info(`编辑 ${row.name} 的信息`);
};

const handleDelete = (row: Employee) => {
  ElMessageBox.confirm(`确认删除员工 "${row.name}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      ElMessage.success("删除成功");
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

const handleSizeChange = (val: number) => {
  console.log("每页", val, "条");
};

const handleCurrentChange = (val: number) => {
  console.log("当前页:", val);
};
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
```

### 21.8 ElementPlus 最佳实践

#### 推荐配置总结

| 配置方式     | 适用场景           | 优点                     | 缺点         |
| ------------ | ------------------ | ------------------------ | ------------ |
| **全局引入** | 小型项目、快速开发 | 使用简单、无需配置       | 打包体积大   |
| **局部引入** | 大型项目、性能敏感 | 打包体积小、按需加载     | 需要手动导入 |
| **自动引入** | 所有项目（推荐）   | 无需手动导入、开发体验好 | 需要额外配置 |

#### 使用建议

1. **新项目推荐**：使用自动按需引入（unplugin-vue-components）
2. **样式覆盖**：使用 CSS 变量进行主题定制
3. **图标使用**：安装 `@element-plus/icons-vue` 并使用自动导入
4. **国际化**：配置中文 locale
5. **TypeScript**：使用完整的类型支持

#### 完整配置示例

```typescript
// main.ts
import { createApp } from "vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import "element-plus/dist/index.css";
import App from "./App.vue";

const app = createApp(App);

app.use(ElementPlus, {
  locale: zhCn,
  size: "default",
  zIndex: 3000,
});

app.mount("#app");
```

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
      resolvers: [ElementPlusResolver(), IconsResolver({ prefix: "Icon" })],
      dts: "src/auto-imports.d.ts",
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({ enabledCollections: ["ep"] }),
      ],
      dts: "src/components.d.ts",
    }),
    Icons({ autoInstall: true }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element-variables.scss" as *;`,
      },
    },
  },
});
```

---
