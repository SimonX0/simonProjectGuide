# 代码规范

## 代码规范

> **为什么要重视代码规范？**
>
> - 统一代码风格，提高代码可读性
> - 减少低级错误，提高代码质量
> - 方便团队协作和代码维护
> - 降低代码审查成本
> - 便于新人快速上手项目

### 命名规范

#### 文件命名规范

```bash
# ✅ 组件文件：PascalCase
UserProfile.vue
UserList.vue
DataTable.vue

# ✅ 组合式函数：use 前缀，camelCase
useMouse.ts
useFetch.ts
useLocalStorage.ts

# ✅ 工具函数：camelCase
formatDate.ts
debounce.ts
httpClient.ts

# ✅ 类型定义：PascalCase
types/user.ts
types/api.ts

# ✅ 常量文件：camelCase
constants/config.ts
constants/enums.ts
```

#### 变量命名规范

```typescript
// ✅ 组件名：PascalCase
import UserProfile from "@/components/UserProfile.vue";

// ✅ 组合式函数：use 前缀
const { x, y } = useMouse();
const { data, loading } = useFetch("/api/users");

// ✅ 常量：UPPER_SNAKE_CASE
const API_BASE_URL = "/api";
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;

// ✅ 普通变量：camelCase
const userName = "John";
const isLoggedIn = true;
const isLoading = false;

// ✅ 布尔值：is/has/can 前缀
const isActive = true;
const hasPermission = false;
const canEdit = true;

// ✅ 私有变量：_ 前缀
const _internalValue = ref(0);
const _privateMethod = () => {};

// ✅ 回调函数：handle 前缀
function handleClick() {}
function handleSubmit() {}
function handleInputChange() {}

// ✅ 类型/接口：PascalCase
interface UserProfile {}
type UserRole = "admin" | "user";
type ID = string | number;

// ✅ 泛型：T 前缀或描述性名称
type Ref<T> = { value: T };
type ApiResult<T> = { data: T; code: number };
```

#### 类命名规范

```typescript
// ✅ 类名：PascalCase
class UserService {}
class EventDispatcher {}
class HttpException extends Error {}

// ✅ 类的属性和方法：camelCase
class UserService {
  private baseUrl: string;
  public timeout: number;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // 方法名使用动词开头
  async getUser(id: number) {}
  createUser(data: User) {}
  updateUser(id: number, data: User) {}
  deleteUser(id: number) {}
}
```

### Vue 组件结构规范

#### SFC 组件标准结构

```vue
<script setup lang="ts">
// 1. 导入（按顺序：Vue核心库 → 第三方库 → 类型 → 组件 → 工具）
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { User } from "@/types";
import UserCard from "@/components/UserCard.vue";
import { formatDate } from "@/utils";

// 2. Props 定义
interface Props {
  user: User;
  showEmail?: boolean;
  limit?: number;
}
const props = withDefaults(defineProps<Props>(), {
  showEmail: true,
  limit: 10,
});

// 3. Emits 定义
interface Emits {
  update: [user: User];
  delete: [id: number];
  refresh: [];
}
const emit = defineEmits<Emits>();

// 4. 组合式函数调用
const router = useRouter();
const { data, loading } = useFetch("/api/users");

// 5. 响应式数据
const currentPage = ref(1);
const searchQuery = ref("");

// 6. 计算属性
const filteredUsers = computed(() => {
  return props.users.filter((user) => user.name.includes(searchQuery.value));
});

const totalPages = computed(() => Math.ceil(props.total / props.limit));

// 7. 方法
function handleClick(user: User) {
  emit("update", user);
}

async function handleDelete(id: number) {
  emit("delete", id);
}

function handleRefresh() {
  emit("refresh");
}

// 8. 生命周期钩子
onMounted(() => {
  handleRefresh();
});
</script>

<template>
  <!-- 使用语义化标签 -->
  <article class="user-list">
    <!-- 使用 kebab-case 的 class 名称 -->
    <div class="user-list__header">
      <h2 class="user-list__title">用户列表</h2>
      <input
        v-model="searchQuery"
        type="text"
        class="user-list__search"
        placeholder="搜索用户..."
      />
    </div>

    <!-- 列表渲染 -->
    <div class="user-list__content">
      <UserCard
        v-for="user in filteredUsers"
        :key="user.id"
        :user="user"
        @update="handleClick"
        @delete="handleDelete"
      />
    </div>

    <!-- 分页 -->
    <div class="user-list__pagination">
      <button :disabled="currentPage === 1" @click="currentPage--">
        上一页
      </button>
      <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++">
        下一页
      </button>
    </div>
  </article>
</template>

<style scoped>
/* 使用 BEM 命名规范 */
.user-list {
  padding: 16px;
}

.user-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.user-list__title {
  font-size: 24px;
  font-weight: 600;
}

.user-list__search {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.user-list__content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.user-list__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}
</style>
```

#### 组件定义顺序

```vue
<script setup lang="ts">
// 标准顺序：
// 1. 导入
// 2. Props 定义
// 3. Emits 定义
// 4. 组合式函数调用
// 5. 响应式数据（ref/reactive）
// 6. 计算属性（computed）
// 7. 方法（function）
// 8. 侦听器（watch）
// 9. 生命周期钩子（onMounted 等）
</script>
```

### 导入顺序规范

```typescript
// ✅ 标准导入顺序

// 1. Vue 核心库
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

// 2. 第三方库
import axios from "axios";
import dayjs from "dayjs";
import { debounce } from "lodash-es";

// 3. 类型导入（使用 import type）
import type { User } from "@/types";
import type { RouteLocationRaw } from "vue-router";

// 4. 本地组件
import UserCard from "@/components/UserCard.vue";
import DataTable from "@/components/DataTable.vue";

// 5. 本地 Store
import { useUserStore } from "@/stores/user";
import { useAppStore } from "@/stores/app";

// 6. 本地组合式函数
import { useMouse } from "@/composables/useMouse";
import { useFetch } from "@/composables/useFetch";

// 7. 本地工具函数
import { formatDate } from "@/utils/date";
import { validateEmail } from "@/utils/validate";

// 8. 本地常量
import { API_BASE_URL } from "@/constants/config";

// 9. 静态资源
import logoImage from "@/assets/logo.png";
import "@/styles/main.css";
```

### 注释规范

#### 文件头注释

```typescript
/**
 * 用户服务模块
 * @description 提供用户相关的 API 请求方法
 * @author 小徐
 * @date 2026-01-01
 */

/**
 * @fileoverview 用户数据工具函数集合
 * @module utils/user
 */
```

#### 函数注释（JSDoc）

````typescript
/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.keyword - 搜索关键词
 * @returns {Promise<User[]>} 用户列表
 * @throws {Error} 网络请求失败时抛出错误
 * @example
 * ```typescript
 * const users = await getUserList({ page: 1, limit: 10 })
 * ```
 */
async function getUserList(params: {
  page: number;
  limit: number;
  keyword?: string;
}): Promise<User[]> {
  const response = await fetch("/api/users");
  return response.json();
}

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期对象、时间戳或日期字符串
 * @param {string} [format='YYYY-MM-DD'] - 格式化模板
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(
  date: Date | string | number,
  format: string = "YYYY-MM-DD"
): string {
  return dayjs(date).format(format);
}
````

#### 类型注释

```typescript
/**
 * 用户信息接口
 */
interface User {
  /** 用户 ID */
  id: number;
  /** 用户名 */
  name: string;
  /** 邮箱地址 */
  email: string;
  /** 用户角色 */
  role: UserRole;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间（可选） */
  updatedAt?: Date;
}

/**
 * 用户角色枚举
 */
type UserRole = "admin" | "user" | "guest";

/**
 * API 响应结果泛型
 */
type ApiResponse<T> = {
  /** 状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
};
```

#### 行内注释规范

```typescript
// ✅ 好的注释：解释为什么这样做

// 因为后端 API 返回的时间戳是秒，需要转换为毫秒
const timestamp = response.timestamp * 1000;

// 防止重复点击（防抖处理）
const handleClick = debounce(() => {
  submitForm();
}, 300);

// ❌ 不好的注释：重复代码内容
// 定义用户名变量
const userName = "John";

// 设置加载状态为 true
isLoading.value = true;
```

#### TODO 注释规范

```typescript
// TODO: 添加用户头像上传功能
// FIXME: 修复分页计算错误
// HACK: 临时方案，待后续优化
// NOTE: 这里使用深度监听，可能影响性能
// XXX: 这种方式有潜在的安全风险
```

### TypeScript 编码规范

#### 类型定义规范

```typescript
// ✅ 优先使用 interface 定义对象类型
interface User {
  id: number;
  name: string;
  email: string;
}

// ✅ 使用 type 定义联合类型、交叉类型
type UserRole = "admin" | "user" | "guest";
type ID = string | number;
type UserWithRole = User & { role: UserRole };

// ✅ 使用 enum 定义常量枚举
enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
}

// ✅ 使用 as const 断言定义常量
const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
```

#### 泛型使用规范

```typescript
// ✅ 泛型命名使用 T、U、V 或描述性名称
type Ref<T> = { value: T };
type ApiResult<T> = { data: T; code: number };
type ListResult<T> = { items: T[]; total: number };

// ✅ 泛型约束
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): void {
  console.log(arg.length);
}

// ✅ 多个泛型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}
```

### CSS/SCSS 编码规范

#### BEM 命名规范

```scss
// Block: .block{}
// Element: .block__element{}
// Modifier: .block--modifier{}

// ✅ 示例
.user-card {
  padding: 16px;

  &__header {
    display: flex;
    align-items: center;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
  }

  &__body {
    margin-top: 12px;
  }

  &--highlighted {
    border: 2px solid #42b983;
  }
}
```

#### 样式书写规范

```scss
// ✅ 标准顺序
.component {
  // 1. 定位
  position: relative;
  top: 0;
  left: 0;
  z-index: 1;

  // 2. 盒模型
  display: flex;
  width: 100%;
  height: auto;
  padding: 16px;
  margin: 0;
  border: 1px solid #ddd;

  // 3. 字体
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: #333;
  text-align: left;

  // 4. 背景
  background-color: #fff;

  // 5. 其他
  cursor: pointer;
  transition: all 0.3s ease;
}
```

### 文件和目录结构规范

```bash
# ✅ 推荐的项目结构
src/
├── api/                 # API 请求
│   ├── index.ts
│   ├── user.ts
│   └── types.ts
├── assets/              # 静态资源
│   ├── images/
│   ├── icons/
│   └── styles/
├── components/          # 通用组件
│   ├── common/          # 基础组件
│   └── business/        # 业务组件
├── composables/         # 组合式函数
│   ├── useMouse.ts
│   └── useFetch.ts
├── constants/           # 常量定义
│   ├── config.ts
│   └── enums.ts
├── directives/          # 自定义指令
│   ├── focus.ts
│   └── permission.ts
├── layouts/             # 布局组件
│   ├── DefaultLayout.vue
│   └── EmptyLayout.vue
├── router/              # 路由配置
│   └── index.ts
├── stores/              # 状态管理
│   ├── user.ts
│   └── app.ts
├── types/               # 类型定义
│   ├── user.ts
│   └── api.ts
├── utils/               # 工具函数
│   ├── date.ts
│   └── validate.ts
├── views/               # 页面组件
│   ├── Home.vue
│   └── About.vue
├── App.vue              # 根组件
└── main.ts              # 入口文件
```

### Prettier 代码格式化配置

```javascript
// .prettierrc.js
module.exports = {
  // 一行最大字符数
  printWidth: 100,

  // 缩进空格数
  tabWidth: 2,

  // 使用空格缩进
  useTabs: false,

  // 语句末尾不加分号
  semi: false,

  // 使用单引号
  singleQuote: true,

  // 对象属性引号策略
  quoteProps: "as-needed",

  // JSX 使用单引号
  jsxSingleQuote: false,

  // 尾随逗号
  trailingComma: "es5",

  // 对象最后一项加逗号
  // 'none' | 'es5' | 'all'

  // 箭头函数参数括号
  arrowParens: "avoid",
  // 'avoid' | 'always'

  // 换行符类型
  endOfLine: "lf",

  // HTML 空白敏感度
  htmlWhitespaceSensitivity: "css",

  // Vue 文件缩进 <script> 和 <style>
  vueIndentScriptAndStyle: false,

  // 单个属性标签
  singleAttributePerLine: false,
};
```

```bash
# .prettierignore
dist/
build/
node_modules/
coverage/
*.min.js
*.min.css
package-lock.json
pnpm-lock.yaml
yarn.lock
```

### Stylelint 样式检查配置

```bash
# 安装依赖
npm install -D stylelint stylelint-config-standard stylelint-config-recommended-vue
```

```javascript
// stylelint.config.js
module.exports = {
  extends: ["stylelint-config-standard", "stylelint-config-recommended-vue"],
  rules: {
    // 缩进
    indentation: 2,

    // 字符串引号
    "string-quotes": "single",

    // 选择器类命名规范
    "selector-class-pattern": "^[a-z][a-z0-9-_]*(-[a-z0-9]+)*$",

    // 颜色使用小写
    "color-hex-case": "lower",

    // 禁止空规则
    "block-no-empty": true,

    // 禁止重复选择器
    "no-duplicate-selectors": true,
  },
};
```

### VSCode 配置

#### 工作区设置

```json
// .vscode/settings.json
{
  // 编辑器
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  },

  // 文件关联
  "files.associations": {
    "*.vue": "vue"
  },
  "files.eol": "\n",

  // ESLint
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "eslint.options": {
    "extensions": [".js", ".jsx", ".ts", ".tsx", ".vue"]
  },

  // Vue
  "volar.completion.preferredTagNameCase": "pascal",
  "volar.completion.preferredAttrNameCase": "kebab",

  // TypeScript
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,

  // 样式
  "stylelint.validate": ["css", "scss", "vue"]
}
```

#### 推荐扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "stylelint.vscode-stylelint",
    "bradlc.vscode-tailwindcss",
    "mikestead.dotenv",
    "eamodio.gitlens"
  ]
}
```

### EditorConfig 编辑器配置

```bash
# .editorconfig
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

---
