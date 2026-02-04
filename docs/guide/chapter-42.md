# 第 42 章：使用 Mock.js 进行数据模拟

## 第 42 章 使用 Mock.js 进行数据模拟

在前后端分离的开发模式中，前端开发往往需要等待后端接口完成后才能进行联调。Mock.js 是一个强大的数据模拟库，可以让我们在前端开发过程中拦截请求并返回模拟数据，极大地提高开发效率。

### 42.1 Mock.js 简介

**什么是 Mock.js？**

Mock.js 是一个模拟数据生成器，可以：

- 生成随机数据
- 拦截 Ajax 请求
- 返回模拟数据

**核心优势：**

| 优势       | 说明                       |
| ---------- | -------------------------- |
| 前后端分离 | 前端不依赖后端接口即可开发 |
| 数据丰富   | 支持多种数据类型的随机生成 |
| 拦截请求   | 无需修改业务代码即可拦截   |
| 类型安全   | 支持 TypeScript 类型定义   |

### 42.2 安装与配置

#### 42.2.1 安装 Mock.js

```bash
# 使用 npm
npm install mockjs -D

# 使用 pnpm
pnpm add mockjs -D

# 使用 yarn
yarn add mockjs -D
```

#### 42.2.2 安装类型定义

```bash
# 安装类型定义
npm install @types/mockjs -D
```

#### 42.2.3 基本配置

```typescript
// src/mock/index.ts
import Mock from "mockjs";

// 设置延迟响应（模拟网络延迟）
Mock.setup({
  timeout: "200-600", // 随机延迟 200-600ms
});

export default Mock;
```

### 42.3 Mock.js 基础语法

#### 42.3.1 数据模板定义

```typescript
import Mock from "mockjs";

// 基本语法：'属性名|规则': 属性值
const data = Mock.mock({
  // 字符串：重复指定次数
  "string|3": "ab", // 'ababab'

  // 数字：指定范围
  "number|1-100": 1, // 1-100 之间的随机整数
  "number|1-100.2": 1, // 1-100 之间的随机数，保留 2 位小数

  // 布尔值：指定概率
  "boolean|1": true, // 随机 true/false
  "boolean|1-3": true, // 1/3 概率为 true

  // 数组：指定数量或范围
  "array|3": ["a", "b"], // 重复 3 次生成数组
  "array|1-3": ["a", "b"], // 重复 1-3 次

  // 对象：从属性值中随机选取 count 个属性
  "object|2": { a: 1, b: 2, c: 3 }, // 从 a,b,c 中随机选 2 个
});

console.log(data);
```

#### 42.3.2 占位符使用

```typescript
import Mock from "mockjs";

const data = Mock.mock({
  // 基本占位符
  id: "@id", // 随机 ID
  guid: "@guid", // 随机 GUID
  title: "@ctitle(5, 10)", // 中文标题（5-10个字）
  content: "@cparagraph(2, 5)", // 中文段落（2-5句）

  // 个人信息
  name: "@cname", // 中文名字
  "name|1": "@cname", // 中文名字
  email: "@email", // 邮箱
  phone: /^1[3-9]\d{9}$/, // 手机号（正则）
  avatar: '@image("200x200", "@color", "#fff", "Avatar")', // 图片
  address: "@city(true)", // 地址（含省市区）

  // 数字类型
  "age|18-60": 1, // 年龄
  "price|100-1000.2": 1, // 价格（保留2位小数）
  "rate|1-5": 1, // 评分（1-5星）

  // 时间日期
  date: "@date", // 日期（yyyy-MM-dd）
  time: "@time", // 时间（HH:mm:ss）
  datetime: "@datetime", // 日期时间
  now: "@now", // 当前时间

  // 网络相关
  url: "@url", // URL
  domain: "@domain", // 域名
  ip: "@ip", // IP 地址
  protocol: "@protocol", // 协议（http/https）

  // 颜色
  color: "@color", // 颜色（#十六进制）
  rgb: "@rgb", // RGB 颜色

  // 其他
  uuid: "@uuid", // UUID
  "boolean|1": true, // 随机布尔值
  natural: "@natural(1, 100)", // 自然数
  integer: "@integer(-10, 10)", // 整数
  float: "@float(1, 100, 2, 2)", // 浮点数（整数部分、小数部分、小数位数）
});

console.log(data);
```

### 42.4 在 Vite + Vue3 中使用

#### 42.4.1 项目结构

```
src/
├── mock/
│   ├── index.ts          # 入口文件
│   ├── user.ts           # 用户相关模拟数据
│   ├── article.ts        # 文章相关模拟数据
│   └── utils.ts          # 工具函数
├── api/
│   ├── user.ts           # 用户 API
│   └── article.ts        # 文章 API
└── main.ts
```

#### 42.4.2 环境判断配置

```typescript
// src/mock/index.ts
import Mock from "mockjs";

// 仅在开发环境启用
export const isDev = import.meta.env.DEV;

if (isDev) {
  Mock.setup({
    timeout: "200-600",
  });

  // 导入各模块的 mock 配置
  import("./user");
  import("./article");
}
```

#### 42.4.3 在 main.ts 中引入

```typescript
// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";

// 仅在开发环境引入 mock
if (import.meta.env.DEV) {
  import("./mock");
}

createApp(App).mount("#app");
```

### 42.5 实战示例

#### 42.5.1 用户模块 Mock

```typescript
// src/mock/user.ts
import Mock from "mockjs";

// 用户列表
const userList = Mock.mock({
  "list|20-50": [
    {
      "id|+1": 1,
      username: "@cname",
      email: "@email",
      phone: /^1[3-9]\d{9}$/,
      avatar: '@image("100x100", "@color", "#fff", "@cname")',
      "age|18-60": 1,
      "gender|1": ["男", "女", "其他"],
      role: '@pick(["管理员", "普通用户", "VIP用户"])',
      status: '@pick(["active", "inactive", "banned"])',
      address: "@city(true)",
      "balance|0-10000.2": 0,
      createTime: "@datetime",
      lastLoginTime: "@datetime",
      bio: "@cparagraph(1, 3)",
      "tags|1-3": ["@ctitle(2, 4)"],
      "followers|0-10000": 0,
      "following|0-1000": 0,
    },
  ],
});

// 获取用户列表
Mock.mock("/api/user/list", "get", (options: any) => {
  const {
    page = 1,
    pageSize = 10,
    keyword = "",
  } = new URLSearchParams(options.url.split("?")[1]);

  let filteredList = userList.list;

  // 关键词搜索
  if (keyword) {
    filteredList = userList.list.filter(
      (user: any) =>
        user.username.includes(keyword) || user.email.includes(keyword)
    );
  }

  // 分页
  const start = (page - 1) * pageSize;
  const end = start + parseInt(pageSize);
  const pageList = filteredList.slice(start, end);

  return {
    code: 200,
    message: "success",
    data: {
      list: pageList,
      total: filteredList.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    },
  };
});

// 获取用户详情
Mock.mock(/\/api\/user\/detail\/\d+/, "get", (options: any) => {
  const id = parseInt(options.url.split("/").pop());
  const user = userList.list.find((u: any) => u.id === id);

  if (!user) {
    return {
      code: 404,
      message: "用户不存在",
      data: null,
    };
  }

  return {
    code: 200,
    message: "success",
    data: user,
  };
});

// 创建用户
Mock.mock("/api/user/create", "post", (options: any) => {
  const body = JSON.parse(options.body);

  const newUser = Mock.mock({
    id: userList.list.length + 1,
    ...body,
    createTime: "@now",
    status: "active",
    balance: 0,
  });

  userList.list.unshift(newUser);

  return {
    code: 200,
    message: "创建成功",
    data: newUser,
  };
});

// 更新用户
Mock.mock("/api/user/update", "put", (options: any) => {
  const body = JSON.parse(options.body);
  const index = userList.list.findIndex((u: any) => u.id === body.id);

  if (index === -1) {
    return {
      code: 404,
      message: "用户不存在",
      data: null,
    };
  }

  userList.list[index] = {
    ...userList.list[index],
    ...body,
    updateTime: "@now",
  };

  return {
    code: 200,
    message: "更新成功",
    data: userList.list[index],
  };
});

// 删除用户
Mock.mock(/\/api\/user\/delete\/\d+/, "delete", (options: any) => {
  const id = parseInt(options.url.split("/").pop());
  const index = userList.list.findIndex((u: any) => u.id === id);

  if (index === -1) {
    return {
      code: 404,
      message: "用户不存在",
      data: null,
    };
  }

  userList.list.splice(index, 1);

  return {
    code: 200,
    message: "删除成功",
    data: null,
  };
});
```

#### 42.5.2 文章模块 Mock

```typescript
// src/mock/article.ts
import Mock from "mockjs";

// 文章分类
const categories = ["技术", "生活", "读书", "旅行", "美食", "摄影"];

// 文章标签
const tags = [
  "Vue3",
  "TypeScript",
  "Vite",
  "前端",
  "JavaScript",
  "CSS",
  "Node.js",
];

// 文章列表
const articleList = Mock.mock({
  "list|30-60": [
    {
      "id|+1": 1,
      title: "@ctitle(10, 25)",
      summary: "@cparagraph(1, 2)",
      content: "@cparagraph(5, 15)",
      cover: "@image('800x400', '@color', '#fff', '@ctitle(5,10)')",
      author: {
        id: "@id",
        name: "@cname",
        avatar: '@image("100x100", "@color", "#fff", "@cname")',
      },
      category: '@pick(["技术", "生活", "读书", "旅行", "美食", "摄影"])',
      "tags|1-5": [
        '@pick(["Vue3", "TypeScript", "Vite", "前端", "JavaScript", "CSS", "Node.js"])',
      ],
      "views|0-10000": 0,
      "likes|0-1000": 0,
      "comments|0-200": 0,
      "isTop|1": [true, false],
      "isRecommended|1": [true, false],
      status: '@pick(["draft", "published", "archived"])',
      createTime: "@datetime",
      updateTime: "@datetime",
      publishTime: "@datetime",
    },
  ],
});

// 获取文章列表（支持分页、分类、标签、搜索）
Mock.mock("/api/article/list", "get", (options: any) => {
  const params = new URLSearchParams(options.url.split("?")[1]);
  const page = parseInt(params.get("page")) || 1;
  const pageSize = parseInt(params.get("pageSize")) || 10;
  const category = params.get("category");
  const tag = params.get("tag");
  const keyword = params.get("keyword");
  const status = params.get("status") || "published";

  let filteredList = articleList.list.filter(
    (article: any) => article.status === status
  );

  // 分类筛选
  if (category) {
    filteredList = filteredList.filter((a: any) => a.category === category);
  }

  // 标签筛选
  if (tag) {
    filteredList = filteredList.filter((a: any) =>
      a.tags.some((t: string) => t === tag)
    );
  }

  // 关键词搜索
  if (keyword) {
    filteredList = filteredList.filter(
      (a: any) => a.title.includes(keyword) || a.summary.includes(keyword)
    );
  }

  // 置顶文章排在前面
  filteredList.sort((a: any, b: any) => b.isTop - a.isTop);

  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageList = filteredList.slice(start, end);

  return {
    code: 200,
    message: "success",
    data: {
      list: pageList,
      total: filteredList.length,
      page,
      pageSize,
      // 统计数据
      stats: {
        total: articleList.list.length,
        published: articleList.list.filter((a: any) => a.status === "published")
          .length,
        draft: articleList.list.filter((a: any) => a.status === "draft").length,
        totalViews: articleList.list.reduce(
          (sum: number, a: any) => sum + a.views,
          0
        ),
        totalLikes: articleList.list.reduce(
          (sum: number, a: any) => sum + a.likes,
          0
        ),
      },
    },
  };
});

// 获取文章详情
Mock.mock(/\/api\/article\/detail\/\d+/, "get", (options: any) => {
  const id = parseInt(options.url.split("/").pop());
  const article = articleList.list.find((a: any) => a.id === id);

  if (!article) {
    return {
      code: 404,
      message: "文章不存在",
      data: null,
    };
  }

  // 增加浏览量
  article.views++;

  // 相关文章（同分类）
  const related = articleList.list
    .filter((a: any) => a.category === article.category && a.id !== article.id)
    .slice(0, 4);

  return {
    code: 200,
    message: "success",
    data: {
      ...article,
      related,
    },
  };
});

// 点赞文章
Mock.mock(/\/api\/article\/like\/\d+/, "post", (options: any) => {
  const id = parseInt(options.url.split("/").pop());
  const article = articleList.list.find((a: any) => a.id === id);

  if (!article) {
    return {
      code: 404,
      message: "文章不存在",
      data: null,
    };
  }

  article.likes++;

  return {
    code: 200,
    message: "点赞成功",
    data: {
      likes: article.likes,
    },
  };
});

// 获取分类列表
Mock.mock("/api/article/categories", "get", () => {
  const categoryStats = categories.map((category) => ({
    name: category,
    count: articleList.list.filter((a: any) => a.category === category).length,
  }));

  return {
    code: 200,
    message: "success",
    data: categoryStats,
  };
});

// 获取标签列表
Mock.mock("/api/article/tags", "get", () => {
  const tagStats = tags.map((tag) => ({
    name: tag,
    count: articleList.list.filter((a: any) =>
      a.tags.some((t: string) => t === tag)
    ).length,
  }));

  return {
    code: 200,
    message: "success",
    data: tagStats,
  };
});
```

#### 42.5.3 评论模块 Mock

```typescript
// src/mock/comment.ts
import Mock from "mockjs";

// 评论列表
const commentList = Mock.mock({
  "list|50-100": [
    {
      "id|+1": 1,
      articleId: "@integer(1, 30)",
      content: "@cparagraph(1, 3)",
      author: {
        id: "@id",
        name: "@cname",
        avatar: '@image("80x80", "@color", "#fff", "@cname")',
      },
      "likes|0-500": 0,
      "replyCount|0-20": 0,
      parentId: null,
      createTime: "@datetime",
      "replies|0-5": [
        {
          "id|+1": 1000,
          content: "@cparagraph(1, 2)",
          author: {
            id: "@id",
            name: "@cname",
            avatar: '@image("60x60", "@color", "#fff", "@cname")',
          },
          "likes|0-100": 0,
          createTime: "@datetime",
        },
      ],
    },
  ],
});

// 获取评论列表
Mock.mock("/api/comment/list", "get", (options: any) => {
  const params = new URLSearchParams(options.url.split("?")[1]);
  const articleId = parseInt(params.get("articleId"));
  const page = parseInt(params.get("page")) || 1;
  const pageSize = parseInt(params.get("pageSize")) || 10;

  // 获取顶级评论
  let comments = commentList.list.filter(
    (c: any) => c.articleId === articleId && !c.parentId
  );

  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageList = comments.slice(start, end);

  // 为每条评论添加回复
  const listWithReplies = pageList.map((comment: any) => ({
    ...comment,
    replies: commentList.list.filter((c: any) => c.parentId === comment.id),
  }));

  return {
    code: 200,
    message: "success",
    data: {
      list: listWithReplies,
      total: comments.length,
      page,
      pageSize,
    },
  };
});

// 发表评论
Mock.mock("/api/comment/create", "post", (options: any) => {
  const body = JSON.parse(options.body);

  const newComment = Mock.mock({
    id: commentList.list.length + 1,
    ...body,
    likes: 0,
    replyCount: 0,
    createTime: "@now",
    replies: [],
  });

  commentList.list.unshift(newComment);

  return {
    code: 200,
    message: "评论成功",
    data: newComment,
  };
});

// 点赞评论
Mock.mock(/\/api\/comment\/like\/\d+/, "post", (options: any) => {
  const id = parseInt(options.url.split("/").pop());
  const comment = commentList.list.find((c: any) => c.id === id);

  if (!comment) {
    return {
      code: 404,
      message: "评论不存在",
      data: null,
    };
  }

  comment.likes++;

  return {
    code: 200,
    message: "点赞成功",
    data: {
      likes: comment.likes,
    },
  };
});

// 删除评论
Mock.mock(/\/api\/comment\/delete\/\d+/, "delete", (options: any) => {
  const id = parseInt(options.url.split("/").pop());
  const index = commentList.list.findIndex((c: any) => c.id === id);

  if (index === -1) {
    return {
      code: 404,
      message: "评论不存在",
      data: null,
    };
  }

  commentList.list.splice(index, 1);

  return {
    code: 200,
    message: "删除成功",
    data: null,
  };
});
```

### 42.6 封装 Mock 工具

#### 42.6.1 统一响应格式

```typescript
// src/mock/utils.ts
import Mock from "mockjs";

export interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
}

// 成功响应
export function successResponse<T>(
  data: T,
  message = "success"
): ResponseData<T> {
  return {
    code: 200,
    message,
    data,
  };
}

// 失败响应
export function errorResponse(
  code = 500,
  message = "error",
  data = null
): ResponseData {
  return {
    code,
    message,
    data,
  };
}

// 分页响应
export interface PaginationData<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function paginationResponse<T>(
  list: T[],
  page: number,
  pageSize: number,
  extraData?: Record<string, any>
): ResponseData<PaginationData<T>> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return successResponse({
    list: list.slice(start, end),
    total: list.length,
    page,
    pageSize,
    ...extraData,
  });
}

// 延迟响应模拟
export function delayResponse(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 随机错误模拟（用于测试错误处理）
export function randomError(errorRate = 0.1) {
  if (Math.random() < errorRate) {
    throw new Error("随机模拟错误");
  }
}
```

#### 42.6.2 模块化 Mock 管理

```typescript
// src/mock/index.ts
import Mock from "mockjs";
import { isDev } from "./utils";

// Mock 模块注册器
export class MockModuleManager {
  private modules: Map<string, any> = new Map();

  // 注册 Mock 模块
  register(name: string, module: any) {
    this.modules.set(name, module);
    console.log(`[Mock] 模块 "${name}" 已注册`);
  }

  // 启用指定模块
  enable(name: string) {
    const module = this.modules.get(name);
    if (module && module.enable) {
      module.enable();
      console.log(`[Mock] 模块 "${name}" 已启用`);
    }
  }

  // 禁用指定模块
  disable(name: string) {
    const module = this.modules.get(name);
    if (module && module.disable) {
      module.disable();
      console.log(`[Mock] 模块 "${name}" 已禁用`);
    }
  }

  // 获取所有模块
  getModules() {
    return Array.from(this.modules.keys());
  }
}

// 创建全局管理器
export const mockManager = new MockModuleManager();

// 初始化 Mock
if (isDev) {
  Mock.setup({
    timeout: "200-600",
  });

  // 注册所有 Mock 模块
  import("./modules/user").then((m) => mockManager.register("user", m));
  import("./modules/article").then((m) => mockManager.register("article", m));
  import("./modules/comment").then((m) => mockManager.register("comment", m));

  // 挂载到 window 对象，方便调试
  (window as any).__MOCK_MANAGER__ = mockManager;

  console.log("[Mock] Mock.js 初始化完成");
}
```

#### 42.6.3 模块化示例

```typescript
// src/mock/modules/user.ts
import Mock from "mockjs";
import { successResponse, errorResponse, paginationResponse } from "../utils";

// 生成用户数据
const userList = Mock.mock({
  "list|50": [
    {
      "id|+1": 1,
      username: "@cname",
      email: "@email",
      phone: /^1[3-9]\d{9}$/,
      avatar: '@image("100x100", "@color", "#fff", "@cname")',
      "age|18-60": 1,
      "gender|1": ["男", "女"],
      createTime: "@datetime",
    },
  ],
});

// 用户 Mock 模块
export default {
  // 启用 Mock
  enable() {
    this.registerMocks();
  },

  // 禁用 Mock
  disable() {
    Mock.reload(); // 清除所有 Mock
  },

  // 注册 Mock 规则
  registerMocks() {
    // 获取用户列表
    Mock.mock("/api/user/list", "get", (options: any) => {
      const params = new URLSearchParams(options.url.split("?")[1]);
      const page = parseInt(params.get("page")) || 1;
      const pageSize = parseInt(params.get("pageSize")) || 10;

      return paginationResponse(userList.list, page, pageSize);
    });

    // 获取用户详情
    Mock.mock(/\/api\/user\/\d+/, "get", (options: any) => {
      const id = parseInt(options.url.split("/").pop());
      const user = userList.list.find((u: any) => u.id === id);

      return user ? successResponse(user) : errorResponse(404, "用户不存在");
    });

    // 创建用户
    Mock.mock("/api/user", "post", (options: any) => {
      const body = JSON.parse(options.body);
      const newUser = Mock.mock({
        id: userList.list.length + 1,
        ...body,
        createTime: "@now",
      });

      userList.list.unshift(newUser);
      return successResponse(newUser, "创建成功");
    });
  },
};
```

### 42.7 使用 Pinia 管理 Mock 状态

```typescript
// src/stores/mock.ts
import { defineStore } from "pinia";

export const useMockStore = defineStore("mock", () => {
  const isEnabled = ref(import.meta.env.DEV);
  const modules = ref<string[]>([]);
  const delay = ref(300);

  // 切换 Mock 状态
  function toggleEnabled(value?: boolean) {
    isEnabled.value = value ?? !isEnabled.value;
  }

  // 设置延迟
  function setDelay(ms: number) {
    delay.value = ms;
    if ((window as any).__MOCK_MANAGER__) {
      Mock.setup({ timeout: ms });
    }
  }

  // 获取已注册的模块
  function getModules() {
    return (window as any).__MOCK_MANAGER__?.getModules() || [];
  }

  return {
    isEnabled,
    modules,
    delay,
    toggleEnabled,
    setDelay,
    getModules,
  };
});
```

### 42.8 Mock 调试面板

```vue
<!-- src/components/MockDebugPanel.vue -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useMockStore } from "@/stores/mock";

const mockStore = useMockStore();
const isVisible = ref(false);
const availableModules = ref<string[]>([]);

onMounted(() => {
  availableModules.value = mockStore.getModules();
});

function reloadPage() {
  location.reload();
}
</script>

<template>
  <div v-if="mockStore.isEnabled" class="mock-debug-panel">
    <button @click="isVisible = !isVisible" class="toggle-btn">🎭 Mock</button>

    <div v-show="isVisible" class="panel-content">
      <h3>Mock 调试面板</h3>

      <div class="section">
        <h4>已注册模块</h4>
        <ul>
          <li v-for="module in availableModules" :key="module">
            {{ module }}
          </li>
        </ul>
      </div>

      <div class="section">
        <h4>网络延迟</h4>
        <input
          v-model.number="mockStore.delay"
          type="range"
          min="0"
          max="2000"
          step="100"
          @change="mockStore.setDelay(mockStore.delay)"
        />
        <span>{{ mockStore.delay }}ms</span>
      </div>

      <div class="section">
        <button @click="reloadPage">刷新页面</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mock-debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.toggle-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.toggle-btn:hover {
  transform: scale(1.1);
}

.panel-content {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 300px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.section {
  margin-bottom: 16px;
}

.section h4 {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.section ul {
  list-style: none;
  padding: 0;
}

.section li {
  padding: 4px 0;
  font-size: 13px;
}

button {
  width: 100%;
  padding: 8px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

input[type="range"] {
  width: 70%;
}
</style>
```

### 42.9 Mock.js 常用占位符速查

| 类别         | 占位符            | 示例                                   |
| ------------ | ----------------- | -------------------------------------- |
| **基本信息** | @id               | "1000000000000000001"                  |
|              | @guid             | "662C6B3A-E762-4177-8E3F-4F7F8A1F8F12" |
|              | @title            | "Et velit vero"                        |
|              | @ctitle(5,10)     | "这个是标题"                           |
| **个人信息** | @cname            | "张三"                                 |
|              | @name             | "John Smith"                           |
|              | @email            | "j.smith@example.com"                  |
|              | @url              | "http://www.example.com"               |
|              | @ip               | "192.168.0.1"                          |
| **数字**     | @natural(1,100)   | 56                                     |
|              | @integer(-10,10)  | -3                                     |
|              | @float(1,100,2,2) | 56.34                                  |
|              | @boolean          | true/false                             |
| **日期时间** | @date             | "2026-01-01"                           |
|              | @time             | "12:00:00"                             |
|              | @datetime         | "2026-01-01 12:00:00"                  |
|              | @now              | 当前时间                               |
| **图片**     | @image()          | 图片 URL                               |
|              | @dataImage        | Data URI 图片                          |
| **颜色**     | @color            | "#7f95a4"                              |
|              | @rgb              | "rgb(128, 198, 85)"                    |
|              | @rgba             | "rgba(128, 198, 85, 0.5)"              |
| **文本**     | @paragraph        | 1-3 段英文                             |
|              | @cparagraph       | 1-3 段中文                             |
|              | @sentence         | 1-2 句英文                             |
|              | @csentence        | 1-2 句中文                             |
| **地址**     | @region           | "华南"                                 |
|              | @province         | "广东省"                               |
|              | @city             | "广州市"                               |
|              | @county           | "天河区"                               |
|              | @zip              | "510000"                               |
| **其他**     | @pick([1,2,3])    | 从数组中随机选一个                     |

### 42.10 最佳实践

#### 42.10.1 开发建议

1. **仅在开发环境使用**

   ```typescript
   // vite.config.ts
   export default defineConfig({
     define: {
       __DEV__: import.meta.env.DEV,
     },
   });
   ```

2. **保持 Mock 数据与接口文档一致**

   - Mock 数据结构应与后端接口文档保持一致
   - 使用 TypeScript 类型约束数据结构

3. **模块化组织 Mock 数据**

   ```
   mock/
   ├── index.ts          # 入口
   ├── modules/          # 各模块 Mock
   │   ├── user.ts
   │   ├── article.ts
   │   └── comment.ts
   └── utils.ts          # 工具函数
   ```

4. **添加适当的网络延迟**
   ```typescript
   Mock.setup({
     timeout: "200-600", // 模拟真实网络环境
   });
   ```

#### 42.10.2 与后端对接时的注意事项

```typescript
// 检查是否启用 Mock 的环境变量
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// 创建 axios 实例时添加标识
const api = axios.create({
  baseURL: USE_MOCK ? "/mock-api" : "/api",
});
```

#### 42.10.3 环境变量配置

```bash
# .env.development
VITE_USE_MOCK=true

# .env.production
VITE_USE_MOCK=false
```

### 42.11 本章小结

| 内容           | 说明                          |
| -------------- | ----------------------------- |
| Mock.js 基础   | 数据模板定义、占位符使用      |
| 在 Vue3 中集成 | Vite 项目配置、环境判断       |
| 实战示例       | 用户、文章、评论模块完整 Mock |
| 工具封装       | 统一响应格式、模块化管理      |
| 调试工具       | Mock 调试面板、Pinia 状态管理 |
| 最佳实践       | 开发环境隔离、模块化组织      |

---
