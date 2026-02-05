# 附录A：实战项目

> **为什么需要实战项目？**
>
> 理论学习固然重要，但只有通过实际项目才能真正掌握 Vue3 的开发技能。
> 本附录包含三个完整的实战项目，从简单到复杂，帮助你循序渐进地提升技能。

---

## 项目一：个人博客系统

### 项目结构

```
blog-system/
├── public/                         # 静态资源
│   └── favicon.ico
├── src/
│   ├── api/                        # API接口层
│   │   ├── request.ts            # Axios封装
│   │   ├── user.ts               # 用户API
│   │   ├── article.ts            # 文章API
│   │   ├── comment.ts            # 评论API
│   │   ├── category.ts           # 分类API
│   │   └── tag.ts                # 标签API
│   │
│   ├── assets/                   # 资源文件
│   │   ├── images/
│ │   │   └── logo.png
│   │   └── styles/
│   │
│   ├── components/               # 公共组件
│   │   ├── ArticleCard.vue       # 文章卡片
│   │   ├── CommentList.vue       # 评论列表
│   │   └── MarkdownEditor.vue    # Markdown编辑器
│   │
│   ├── router/                   # 路由配置
│   │   └── index.ts              # 路由定义
│   │
│   ├── stores/                   # Pinia状态管理
│   │   ├── user.ts               # 用户状态
│   │   ├── article.ts            # 文章状态
│   │   └── comment.ts            # 评论状态
│   │
│   ├── types/                    # TypeScript类型
│   │   └── index.ts              # 类型定义
│   │
│   ├── views/                    # 页面组件
│   │   ├── Home.vue              # 首页
│   │   ├── Article.vue           # 文章详情
│   │   ├── Category.vue          # 分类页
│   │   ├── Tag.vue               # 标签页
│   │   ├── Search.vue            # 搜索页
│   │   ├── Login.vue             # 登录页
│   │   ├── Register.vue          # 注册页
│   │   ├── Profile.vue           # 个人中心
│   │   └── ArticleEdit.vue       # 文章编辑
│   │
│   ├── App.vue                   # 根组件
│   └── main.ts                   # 应用入口
│
├── index.html                      # HTML入口
├── vite.config.ts                 # Vite配置
├── tsconfig.json                  # TypeScript配置
├── .env.development              # 开发环境变量
├── .env.production               # 生产环境变量
├── env.d.ts                       # 环境变量类型
├── package.json                   # 项目配置
└── README.md                      # 项目说明
```

### A.1.1 项目初始化

#### 步骤 1：创建项目

```bash
# 使用 Vite 创建项目
npm create vite@latest blog-system -- --template vue-ts

cd blog-system

# 安装依赖
npm install

# 安装额外依赖
npm install vue-router@4 pinia element-plus @element-plus/icons-vue
npm install @vueuse/core markdown-it highlight.js
npm install axios dayjs

# 安装开发依赖
npm install -D @types/markdown-it sass
```

#### 步骤 2：配置 Vite

[vite.config.ts](../guide/vite-config)

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

#### 步骤 3：配置 TypeScript

[tsconfig.json]

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### A.1.2 类型定义

[src/types/index.ts]

```typescript
// 用户类型
export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  createdAt: string;
}

// 文章类型
export interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: User;
  category: Category;
  tags: Tag[];
  status: "draft" | "published";
  views: number;
  likes: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

// 分类类型
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
}

// 标签类型
export interface Tag {
  id: number;
  name: string;
  slug: string;
  articleCount: number;
}

// 评论类型
export interface Comment {
  id: number;
  content: string;
  author: User;
  article: number;
  parent: number | null;
  replies: Comment[];
  likes: number;
  createdAt: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// API响应
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}
```

### A.1.3 API 层实现

[src/api/request.ts]

```typescript
import axios from "axios";
import { ElMessage } from "element-plus";
import type { ApiResponse } from "@/types";

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse;
    if (res.code !== 200) {
      ElMessage.error(res.message || "请求失败");
      return Promise.reject(new Error(res.message));
    }
    return res.data;
  },
  (error) => {
    ElMessage.error(error.message || "网络错误");
    return Promise.reject(error);
  }
);

export default request;
```

[src/api/user.ts]

```typescript
import request from "./request";
import type { User, ApiResponse } from "@/types";

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfileParams {
  bio?: string;
  avatar?: string;
}

// 用户登录
export const login = (params: LoginParams) => {
  return request.post<ApiResponse<{ token: string; user: User }>>(
    "/user/login",
    params
  );
};

// 用户注册
export const register = (params: RegisterParams) => {
  return request.post<ApiResponse>("/user/register", params);
};

// 获取用户信息
export const getUserInfo = () => {
  return request.get<ApiResponse<User>>("/user/info");
};

// 更新用户信息
export const updateProfile = (params: UpdateProfileParams) => {
  return request.put<ApiResponse<User>>("/user/profile", params);
};

// 修改密码
export const changePassword = (params: {
  oldPassword: string;
  newPassword: string;
}) => {
  return request.put<ApiResponse>("/user/password", params);
};

// 上传头像
export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return request.post<ApiResponse<{ url: string }>>("/user/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
```

[src/api/article.ts]

```typescript
import request from "./request";
import type { Article, PaginationParams, PaginationResponse } from "@/types";

export interface ArticleListParams extends PaginationParams {
  category?: string;
  tag?: string;
  keyword?: string;
  status?: "draft" | "published";
}

export interface CreateArticleParams {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  categoryId: number;
  tagIds: number[];
  status: "draft" | "published";
}

// 获取文章列表
export const getArticleList = (params: ArticleListParams) => {
  return request.get<PaginationResponse<Article>>("/article/list", { params });
};

// 获取文章详情
export const getArticleDetail = (id: number) => {
  return request.get<Article>(`/article/${id}`);
};

// 创建文章
export const createArticle = (params: CreateArticleParams) => {
  return request.post<Article>("/article", params);
};

// 更新文章
export const updateArticle = (id: number, params: CreateArticleParams) => {
  return request.put<Article>(`/article/${id}`, params);
};

// 删除文章
export const deleteArticle = (id: number) => {
  return request.delete(`/article/${id}`);
};

// 上传文章封面
export const uploadCover = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return request.post<{ url: string }>("/article/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
```

[src/api/comment.ts]

```typescript
import request from "./request";
import type { Comment } from "@/types";

export interface CreateCommentParams {
  articleId: number;
  content: string;
  parentId?: number;
}

// 获取评论列表
export const getCommentList = (articleId: number) => {
  return request.get<Comment[]>(`/comment/article/${articleId}`);
};

// 创建评论
export const createComment = (params: CreateCommentParams) => {
  return request.post<Comment>("/comment", params);
};

// 删除评论
export const deleteComment = (id: number) => {
  return request.delete(`/comment/${id}`);
};

// 点赞评论
export const likeComment = (id: number) => {
  return request.post(`/comment/${id}/like`);
};
```

[src/api/category.ts]

```typescript
import request from "./request";
import type { Category } from "@/types";

// 获取所有分类
export const getCategoryList = () => {
  return request.get<Category[]>("/category/list");
};

// 创建分类
export const createCategory = (params: {
  name: string;
  description: string;
}) => {
  return request.post<Category>("/category", params);
};

// 更新分类
export const updateCategory = (
  id: number,
  params: { name: string; description: string }
) => {
  return request.put<Category>(`/category/${id}`, params);
};

// 删除分类
export const deleteCategory = (id: number) => {
  return request.delete(`/category/${id}`);
};
```

[src/api/tag.ts]

```typescript
import request from "./request";
import type { Tag } from "@/types";

// 获取所有标签
export const getTagList = () => {
  return request.get<Tag[]>("/tag/list");
};

// 创建标签
export const createTag = (params: { name: string }) => {
  return request.post<Tag>("/tag", params);
};

// 更新标签
export const updateTag = (id: number, params: { name: string }) => {
  return request.put<Tag>(`/tag/${id}`, params);
};

// 删除标签
export const deleteTag = (id: number) => {
  return request.delete(`/tag/${id}`);
};
```

### A.1.4 Pinia Stores

[src/stores/user.ts]

```typescript
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@/types";
import * as userApi from "@/api/user";
import { useRouter } from "vue-router";

export const useUserStore = defineStore("user", () => {
  const router = useRouter();
  const user = ref<User | null>(null);
  const token = ref<string>(localStorage.getItem("token") || "");

  const isLoggedIn = computed(() => !!token.value);
  const avatar = computed(() => user.value?.avatar || "/default-avatar.png");

  // 登录
  const login = async (params: { username: string; password: string }) => {
    const result = await userApi.login(params);
    token.value = result.token;
    user.value = result.user;
    localStorage.setItem("token", result.token);
    return result;
  };

  // 注册
  const register = async (params: {
    username: string;
    email: string;
    password: string;
  }) => {
    const result = await userApi.register(params);
    return result;
  };

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!token.value) return;
    const result = await userApi.getUserInfo();
    user.value = result;
    return result;
  };

  // 更新用户信息
  const updateProfile = async (params: { bio?: string; avatar?: string }) => {
    const result = await userApi.updateProfile(params);
    user.value = result;
    return result;
  };

  // 登出
  const logout = () => {
    user.value = null;
    token.value = "";
    localStorage.removeItem("token");
    router.push("/login");
  };

  return {
    user,
    token,
    isLoggedIn,
    avatar,
    login,
    register,
    fetchUserInfo,
    updateProfile,
    logout,
  };
});
```

[src/stores/article.ts]

```typescript
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Article, PaginationParams } from "@/types";
import * as articleApi from "@/api/article";

export const useArticleStore = defineStore("article", () => {
  const articles = ref<Article[]>([]);
  const currentArticle = ref<Article | null>(null);
  const loading = ref(false);
  const total = ref(0);

  // 获取文章列表
  const getArticles = async (
    params: PaginationParams & {
      category?: string;
      tag?: string;
      keyword?: string;
    }
  ) => {
    loading.value = true;
    try {
      const result = await articleApi.getArticleList(params);
      articles.value = result.list;
      total.value = result.total;
      return result;
    } finally {
      loading.value = false;
    }
  };

  // 获取文章详情
  const getArticle = async (id: number) => {
    loading.value = true;
    try {
      const result = await articleApi.getArticleDetail(id);
      currentArticle.value = result;
      return result;
    } finally {
      loading.value = false;
    }
  };

  // 创建文章
  const createArticle = async (params: any) => {
    const result = await articleApi.createArticle(params);
    articles.value.unshift(result);
    return result;
  };

  // 更新文章
  const updateArticle = async (id: number, params: any) => {
    const result = await articleApi.updateArticle(id, params);
    const index = articles.value.findIndex((a) => a.id === id);
    if (index > -1) {
      articles.value[index] = result;
    }
    if (currentArticle.value?.id === id) {
      currentArticle.value = result;
    }
    return result;
  };

  // 删除文章
  const deleteArticle = async (id: number) => {
    await articleApi.deleteArticle(id);
    articles.value = articles.value.filter((a) => a.id !== id);
  };

  return {
    articles,
    currentArticle,
    loading,
    total,
    getArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
  };
});
```

[src/stores/comment.ts]

```typescript
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Comment } from "@/types";
import * as commentApi from "@/api/comment";

export const useCommentStore = defineStore("comment", () => {
  const comments = ref<Comment[]>([]);
  const loading = ref(false);

  // 获取评论列表
  const getComments = async (articleId: number) => {
    loading.value = true;
    try {
      const result = await commentApi.getCommentList(articleId);
      comments.value = result;
      return result;
    } finally {
      loading.value = false;
    }
  };

  // 创建评论
  const createComment = async (params: {
    articleId: number;
    content: string;
    parentId?: number;
  }) => {
    const result = await commentApi.createComment(params);
    comments.value.push(result);
    return result;
  };

  // 删除评论
  const deleteComment = async (id: number) => {
    await commentApi.deleteComment(id);
    comments.value = comments.value.filter((c) => c.id !== id);
  };

  // 点赞评论
  const likeComment = async (id: number) => {
    await commentApi.likeComment(id);
    const comment = comments.value.find((c) => c.id === id);
    if (comment) {
      comment.likes++;
    }
  };

  return {
    comments,
    loading,
    getComments,
    createComment,
    deleteComment,
    likeComment,
  };
});
```

### A.1.5 路由配置

[src/router/index.ts]

```typescript
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useUserStore } from "@/stores/user";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
    meta: { title: "首页" },
  },
  {
    path: "/article/:id",
    name: "ArticleDetail",
    component: () => import("@/views/Article.vue"),
    meta: { title: "文章详情" },
  },
  {
    path: "/category/:slug",
    name: "Category",
    component: () => import("@/views/Category.vue"),
    meta: { title: "分类" },
  },
  {
    path: "/tag/:slug",
    name: "Tag",
    component: () => import("@/views/Tag.vue"),
    meta: { title: "标签" },
  },
  {
    path: "/search",
    name: "Search",
    component: () => import("@/views/Search.vue"),
    meta: { title: "搜索" },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/Register.vue"),
    meta: { title: "注册" },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/views/Profile.vue"),
    meta: { title: "个人中心", requiresAuth: true },
  },
  {
    path: "/article/create",
    name: "CreateArticle",
    component: () => import("@/views/ArticleEdit.vue"),
    meta: { title: "创建文章", requiresAuth: true },
  },
  {
    path: "/article/:id/edit",
    name: "EditArticle",
    component: () => import("@/views/ArticleEdit.vue"),
    meta: { title: "编辑文章", requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next("/login");
  } else {
    next();
  }

  // 设置页面标题
  document.title = `${to.meta.title} - 个人博客`;
});

export default router;
```

### A.1.6 核心组件

[src/components/ArticleCard.vue]

```vue
<template>
  <div class="article-card" @click="goToDetail">
    <div class="article-cover" v-if="article.coverImage">
      <img :src="article.coverImage" :alt="article.title" />
    </div>
    <div class="article-content">
      <h3 class="article-title">{{ article.title }}</h3>
      <p class="article-excerpt">{{ article.excerpt }}</p>
      <div class="article-meta">
        <span class="meta-item">
          <el-icon><User /></el-icon>
          {{ article.author.username }}
        </span>
        <span class="meta-item">
          <el-icon><Calendar /></el-icon>
          {{ formatDate(article.createdAt) }}
        </span>
        <span class="meta-item">
          <el-icon><View /></el-icon>
          {{ article.views }}
        </span>
        <span class="meta-item">
          <el-icon><Star /></el-icon>
          {{ article.likes }}
        </span>
      </div>
      <div class="article-tags">
        <el-tag
          v-for="tag in article.tags"
          :key="tag.id"
          size="small"
          @click.stop="goToTag(tag.slug)"
        >
          {{ tag.name }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { User, Calendar, View, Star } from "@element-plus/icons-vue";
import { ElTag } from "element-plus";
import type { Article } from "@/types";
import dayjs from "dayjs";

interface Props {
  article: Article;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [article: Article];
}>();

const router = useRouter();

const formatDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD");
};

const goToDetail = () => {
  router.push(`/article/${props.article.id}`);
  emit("click", props.article);
};

const goToTag = (slug: string) => {
  router.push(`/tag/${slug}`);
};
</script>

<style scoped lang="scss">
.article-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
}

.article-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.article-content {
  padding: 20px;
}

.article-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.article-excerpt {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #999;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
```

[src/components/CommentList.vue]

```vue
<template>
  <div class="comment-list">
    <div v-if="!isLoggedIn" class="login-tip">
      请<el-button type="primary" link @click="goToLogin">登录</el-button
      >后发表评论
    </div>

    <div v-if="isLoggedIn" class="comment-form">
      <el-input
        v-model="commentContent"
        type="textarea"
        :rows="4"
        placeholder="发表你的评论..."
      />
      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          发表评论
        </el-button>
      </div>
    </div>

    <div class="comments">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">
          <img :src="comment.author.avatar" :alt="comment.author.username" />
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author.username }}</span>
            <span class="comment-time">{{
              formatDate(comment.createdAt)
            }}</span>
          </div>
          <div class="comment-text">{{ comment.content }}</div>
          <div class="comment-actions">
            <el-button text size="small" @click="handleLike(comment)">
              <el-icon><Star /></el-icon>
              {{ comment.likes }}
            </el-button>
            <el-button text size="small" @click="handleReply(comment)">
              回复
            </el-button>
            <el-button
              v-if="userStore.user?.id === comment.author.id"
              text
              size="small"
              type="danger"
              @click="handleDelete(comment.id)"
            >
              删除
            </el-button>
          </div>

          <!-- 回复列表 -->
          <div v-if="comment.replies?.length" class="comment-replies">
            <div
              v-for="reply in comment.replies"
              :key="reply.id"
              class="comment-reply"
            >
              <div class="reply-avatar">
                <img :src="reply.author.avatar" :alt="reply.author.username" />
              </div>
              <div class="reply-content">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.author.username }}</span>
                  <span class="reply-time">{{
                    formatDate(reply.createdAt)
                  }}</span>
                </div>
                <div class="reply-text">{{ reply.content }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElButton, ElInput } from "element-plus";
import { Star } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/user";
import { useCommentStore } from "@/stores/comment";
import type { Comment } from "@/types";
import dayjs from "dayjs";

interface Props {
  articleId: number;
}

const props = defineProps<Props>();
const router = useRouter();
const userStore = useUserStore();
const commentStore = useCommentStore();

const commentContent = ref("");
const loading = ref(false);
const replyingTo = ref<Comment | null>(null);

const isLoggedIn = computed(() => userStore.isLoggedIn);
const comments = computed(() => commentStore.comments);

const formatDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm");
};

const goToLogin = () => {
  router.push("/login");
};

const handleSubmit = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning("请输入评论内容");
    return;
  }

  loading.value = true;
  try {
    await commentStore.createComment({
      articleId: props.articleId,
      content: commentContent.value,
      parentId: replyingTo.value?.id,
    });
    ElMessage.success("评论发表成功");
    commentContent.value = "";
    replyingTo.value = null;
  } finally {
    loading.value = false;
  }
};

const handleLike = async (comment: Comment) => {
  await commentStore.likeComment(comment.id);
};

const handleReply = (comment: Comment) => {
  replyingTo.value = comment;
  commentContent.value = `@${comment.author.username} `;
};

const handleDelete = async (id: number) => {
  await commentStore.deleteComment(id);
  ElMessage.success("评论已删除");
};

onMounted(() => {
  commentStore.getComments(props.articleId);
});
</script>

<style scoped lang="scss">
.comment-list {
  padding: 20px;
}

.login-tip {
  text-align: center;
  padding: 40px;
  color: #999;
}

.comment-form {
  margin-bottom: 30px;

  .form-actions {
    margin-top: 12px;
    text-align: right;
  }
}

.comments {
  .comment-item {
    display: flex;
    gap: 12px;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.comment-replies {
  margin-top: 12px;
  padding-left: 16px;
  border-left: 2px solid #f0f0f0;
}

.comment-reply {
  display: flex;
  gap: 8px;
  padding: 8px 0;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.reply-author {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.reply-time {
  font-size: 12px;
  color: #999;
}

.reply-text {
  font-size: 14px;
  color: #666;
}
</style>
```

[src/components/MarkdownEditor.vue]

````vue
<template>
  <div class="markdown-editor">
    <div class="editor-toolbar">
      <el-button-group>
        <el-button size="small" @click="insertMarkdown('**', '**')">
          <strong>B</strong>
        </el-button>
        <el-button size="small" @click="insertMarkdown('*', '*')">
          <em>I</em>
        </el-button>
        <el-button size="small" @click="insertMarkdown('~~', '~~')">
          <s>S</s>
        </el-button>
      </el-button-group>

      <el-button-group style="margin-left: 12px">
        <el-button size="small" @click="insertMarkdown('# ', '')">
          H1
        </el-button>
        <el-button size="small" @click="insertMarkdown('## ', '')">
          H2
        </el-button>
        <el-button size="small" @click="insertMarkdown('### ', '')">
          H3
        </el-button>
      </el-button-group>

      <el-button-group style="margin-left: 12px">
        <el-button size="small" @click="insertMarkdown('- ', '')">
          列表
        </el-button>
        <el-button size="small" @click="insertMarkdown('```\n', '\n```')">
          代码
        </el-button>
        <el-button size="small" @click="insertMarkdown('> ', '')">
          引用
        </el-button>
      </el-button-group>

      <el-upload
        style="margin-left: 12px"
        :show-file-list="false"
        :before-upload="handleImageUpload"
      >
        <el-button size="small">插入图片</el-button>
      </el-upload>
    </div>

    <el-input
      v-model="content"
      type="textarea"
      :rows="20"
      placeholder="请输入Markdown内容..."
      @input="handleInput"
    />

    <div class="editor-preview">
      <div v-html="previewHtml" class="markdown-body"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  ElInput,
  ElButton,
  ElButtonGroup,
  ElUpload,
  ElMessage,
} from "element-plus";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

interface Props {
  modelValue: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const content = ref(props.modelValue);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return "";
  },
});

const previewHtml = computed(() => {
  return md.render(content.value);
});

const handleInput = () => {
  emit("update:modelValue", content.value);
};

const insertMarkdown = (before: string, after: string) => {
  const textarea = document.querySelector(
    ".markdown-editor textarea"
  ) as HTMLTextAreaElement;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = content.value;

  content.value =
    text.substring(0, start) +
    before +
    text.substring(start, end) +
    after +
    text.substring(end);

  emit("update:modelValue", content.value);

  // 恢复光标位置
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + before.length, start + before.length);
  }, 0);
};

const handleImageUpload = async (file: File) => {
  // 这里应该调用上传API
  ElMessage.info("图片上传功能待实现");
  return false;
};

watch(
  () => props.modelValue,
  (val) => {
    content.value = val;
  }
);
</script>

<style scoped lang="scss">
.markdown-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  padding: 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
}

.editor-preview {
  padding: 20px;
  border-top: 1px solid #dcdfe6;
  min-height: 200px;
}

.markdown-body {
  :deep(h1),
  :deep(h2),
  :deep(h3) {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  :deep(h1) {
    font-size: 2em;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
  }

  :deep(h2) {
    font-size: 1.5em;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
  }

  :deep(h3) {
    font-size: 1.25em;
  }

  :deep(p) {
    margin-bottom: 16px;
    line-height: 1.6;
  }

  :deep(code) {
    background: #f6f8fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: "Courier New", monospace;
  }

  :deep(pre) {
    background: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 16px;

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(blockquote) {
    border-left: 4px solid #ddd;
    padding-left: 16px;
    color: #666;
    margin-bottom: 16px;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
  }
}
</style>
````

### A.1.7 页面组件

[src/views/Home.vue]

```vue
<template>
  <div class="home-page">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1 class="site-title">个人博客</h1>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索文章..."
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <div v-if="userStore.isLoggedIn" class="user-menu">
              <el-dropdown>
                <div class="user-avatar">
                  <img :src="userStore.avatar" alt="avatar" />
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="goToProfile">
                      个人中心
                    </el-dropdown-item>
                    <el-dropdown-item @click="goToCreateArticle">
                      写文章
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleLogout">
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div v-else class="auth-buttons">
              <el-button @click="goToLogin">登录</el-button>
              <el-button type="primary" @click="goToRegister">注册</el-button>
            </div>
          </div>
        </div>
      </el-header>

      <el-main>
        <el-row :gutter="20">
          <el-col :span="18">
            <div class="article-section">
              <div class="section-header">
                <h2>最新文章</h2>
              </div>
              <div v-loading="articleStore.loading">
                <ArticleCard
                  v-for="article in articleStore.articles"
                  :key="article.id"
                  :article="article"
                />
                <el-empty
                  v-if="!articleStore.articles.length"
                  description="暂无文章"
                />
              </div>
              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="currentPage"
                  :page-size="pageSize"
                  :total="articleStore.total"
                  layout="total, prev, pager, next"
                  @current-change="handlePageChange"
                />
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="sidebar">
              <div class="sidebar-section">
                <h3>分类</h3>
                <el-menu>
                  <el-menu-item
                    v-for="category in categories"
                    :key="category.id"
                    @click="goToCategory(category.slug)"
                  >
                    {{ category.name }}
                    <span class="count">{{ category.articleCount }}</span>
                  </el-menu-item>
                </el-menu>
              </div>

              <div class="sidebar-section">
                <h3>标签</h3>
                <div class="tag-cloud">
                  <el-tag
                    v-for="tag in tags"
                    :key="tag.id"
                    @click="goToTag(tag.slug)"
                  >
                    {{ tag.name }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  ElContainer,
  ElHeader,
  ElMain,
  ElRow,
  ElCol,
  ElInput,
  ElButton,
  ElPagination,
  ElEmpty,
  ElMenu,
  ElMenuItem,
  ElTag,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElMessage,
} from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/user";
import { useArticleStore } from "@/stores/article";
import ArticleCard from "@/components/ArticleCard.vue";
import * as categoryApi from "@/api/category";
import * as tagApi from "@/api/tag";

const router = useRouter();
const userStore = useUserStore();
const articleStore = useArticleStore();

const searchKeyword = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const categories = ref<any[]>([]);
const tags = ref<any[]>([]);

const handleSearch = () => {
  if (searchKeyword.value) {
    router.push({
      path: "/search",
      query: { keyword: searchKeyword.value },
    });
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  articleStore.getArticles({ page, pageSize: pageSize.value });
};

const goToLogin = () => {
  router.push("/login");
};

const goToRegister = () => {
  router.push("/register");
};

const goToProfile = () => {
  router.push("/profile");
};

const goToCreateArticle = () => {
  router.push("/article/create");
};

const handleLogout = () => {
  userStore.logout();
  ElMessage.success("已退出登录");
};

const goToCategory = (slug: string) => {
  router.push(`/category/${slug}`);
};

const goToTag = (slug: string) => {
  router.push(`/tag/${slug}`);
};

onMounted(async () => {
  await Promise.all([
    articleStore.getArticles({
      page: currentPage.value,
      pageSize: pageSize.value,
    }),
    categoryApi.getCategoryList().then((res) => (categories.value = res)),
    tagApi.getTagList().then((res) => (tags.value = res)),
  ]);
});
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.el-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0;

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .site-title {
    font-size: 24px;
    font-weight: 700;
    color: #409eff;
    margin: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .el-input {
    width: 300px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.el-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.article-section {
  .section-header {
    margin-bottom: 20px;

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }

  .pagination-wrapper {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
}

.sidebar {
  position: sticky;
  top: 24px;

  .sidebar-section {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #333;
    }
  }

  .el-menu {
    border: none;

    .el-menu-item {
      display: flex;
      justify-content: space-between;

      .count {
        color: #999;
        font-size: 12px;
      }
    }
  }

  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .el-tag {
      cursor: pointer;
    }
  }
}
</style>
```

[src/views/Article.vue]

```vue
<template>
  <div class="article-page">
    <el-container>
      <el-main>
        <div v-if="article" class="article-container">
          <el-page-header @back="goBack" class="page-header">
            <template #content>
              <div class="article-title">{{ article.title }}</div>
            </template>
          </el-page-header>

          <div class="article-meta">
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ article.author.username }}
            </span>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(article.createdAt) }}
            </span>
            <span class="meta-item">
              <el-icon><View /></el-icon>
              {{ article.views }}
            </span>
            <span class="meta-item">
              <el-icon><Star /></el-icon>
              {{ article.likes }}
            </span>
          </div>

          <div
            class="article-content markdown-body"
            v-html="renderedContent"
          ></div>

          <div class="article-tags">
            <el-tag
              v-for="tag in article.tags"
              :key="tag.id"
              @click="goToTag(tag.slug)"
            >
              {{ tag.name }}
            </el-tag>
          </div>

          <div class="article-actions">
            <el-button @click="handleLike">
              <el-icon><Star /></el-icon>
              点赞
            </el-button>
            <el-button @click="handleShare">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </div>
        </div>

        <CommentList :article-id="articleId" />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  ElContainer,
  ElMain,
  ElPageHeader,
  ElButton,
  ElTag,
  ElMessage,
} from "element-plus";
import { User, Calendar, View, Star, Share } from "@element-plus/icons-vue";
import { useArticleStore } from "@/stores/article";
import CommentList from "@/components/CommentList.vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import dayjs from "dayjs";
import "highlight.js/styles/github.css";

const router = useRouter();
const route = useRoute();
const articleStore = useArticleStore();

const articleId = computed(() => Number(route.params.id));
const article = computed(() => articleStore.currentArticle);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return "";
  },
});

const renderedContent = computed(() => {
  return article.value ? md.render(article.value.content) : "";
});

const formatDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm");
};

const goBack = () => {
  router.back();
};

const handleLike = () => {
  ElMessage.success("点赞成功");
};

const handleShare = () => {
  ElMessage.success("链接已复制到剪贴板");
};

const goToTag = (slug: string) => {
  router.push(`/tag/${slug}`);
};

onMounted(() => {
  articleStore.getArticle(articleId.value);
});
</script>

<style scoped lang="scss">
.article-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.el-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.article-container {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
}

.article-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #666;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.article-content {
  margin-bottom: 32px;
  line-height: 1.8;

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    margin-top: 32px;
    margin-bottom: 16px;
    font-weight: 600;
  }

  :deep(p) {
    margin-bottom: 16px;
  }

  :deep(pre) {
    background: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 16px;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
  }
}

.article-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;

  .el-tag {
    cursor: pointer;
  }
}

.article-actions {
  display: flex;
  gap: 12px;
}
</style>
```

[src/views/Category.vue]

```vue
<template>
  <div class="category-page">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1 class="site-title">个人博客</h1>
          <nav class="nav-menu">
            <router-link to="/">首页</router-link>
            <router-link to="/category">分类</router-link>
            <router-link to="/search">搜索</router-link>
          </nav>
        </div>
      </el-header>

      <el-main class="main-content">
        <div class="category-header">
          <h2>文章分类</h2>
          <p class="subtitle">按分类浏览所有文章</p>
        </div>

        <el-row :gutter="20" class="category-list">
          <el-col
            v-for="category in categories"
            :key="category.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <div class="category-card" @click="goToCategory(category.slug)">
              <div class="category-icon">
                <el-icon><Folder /></el-icon>
              </div>
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-description">{{ category.description }}</p>
              <div class="category-meta">
                <span>{{ category.articleCount }} 篇文章</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Folder } from "@element-plus/icons-vue";
import { categoryApi } from "@/api/category";
import type { Category } from "@/types";

const router = useRouter();
const categories = ref<Category[]>([]);

const loadCategories = async () => {
  try {
    const response = await categoryApi.getList();
    categories.value = response.data;
  } catch (error) {
    console.error("加载分类失败:", error);
  }
};

const goToCategory = (slug: string) => {
  router.push(`/category/${slug}`);
};

onMounted(() => {
  loadCategories();
});
</script>

<style scoped lang="scss">
.category-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.site-title {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.nav-menu {
  display: flex;
  gap: 24px;

  a {
    text-decoration: none;
    color: #333;
    font-weight: 500;

    &:hover {
      color: #409eff;
    }
  }
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.category-header {
  text-align: center;
  margin-bottom: 48px;

  h2 {
    font-size: 36px;
    color: #333;
    margin-bottom: 12px;
  }

  .subtitle {
    font-size: 16px;
    color: #666;
  }
}

.category-list {
  margin-top: 32px;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .category-icon {
    font-size: 48px;
    color: #409eff;
    margin-bottom: 16px;
  }

  .category-name {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .category-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
    min-height: 40px;
  }

  .category-meta {
    font-size: 14px;
    color: #999;
  }
}
</style>
```

[src/views/Tag.vue]

```vue
<template>
  <div class="tag-page">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1 class="site-title">个人博客</h1>
          <nav class="nav-menu">
            <router-link to="/">首页</router-link>
            <router-link to="/category">分类</router-link>
            <router-link to="/tag">标签</router-link>
          </nav>
        </div>
      </el-header>

      <el-main class="main-content">
        <div class="tag-header">
          <h2>文章标签</h2>
          <p class="subtitle">按标签探索精彩内容</p>
        </div>

        <div class="tag-cloud">
          <el-tag
            v-for="tag in tags"
            :key="tag.id"
            :size="getTagSize(tag.articleCount)"
            :type="getTagType(tag.id)"
            effect="plain"
            @click="goToTag(tag.slug)"
            class="tag-item"
          >
            {{ tag.name }}
            <span class="tag-count">({{ tag.articleCount }})</span>
          </el-tag>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { tagApi } from "@/api/tag";
import type { Tag } from "@/types";

const router = useRouter();
const tags = ref<Tag[]>([]);

const loadTags = async () => {
  try {
    const response = await tagApi.getList();
    tags.value = response.data;
  } catch (error) {
    console.error("加载标签失败:", error);
  }
};

const goToTag = (slug: string) => {
  router.push(`/tag/${slug}`);
};

const getTagSize = (count: number) => {
  if (count >= 20) return "large";
  if (count >= 10) return "default";
  return "small";
};

const getTagType = (id: number) => {
  const types = ["primary", "success", "info", "warning", "danger"];
  return types[id % types.length] as any;
};

onMounted(() => {
  loadTags();
});
</script>

<style scoped lang="scss">
.tag-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.site-title {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.nav-menu {
  display: flex;
  gap: 24px;

  a {
    text-decoration: none;
    color: #333;
    font-weight: 500;

    &:hover {
      color: #409eff;
    }
  }
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.tag-header {
  text-align: center;
  margin-bottom: 48px;

  h2 {
    font-size: 36px;
    color: #333;
    margin-bottom: 12px;
  }

  .subtitle {
    font-size: 16px;
    color: #666;
  }
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  padding: 20px;
}

.tag-item {
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .tag-count {
    margin-left: 4px;
    font-size: 12px;
    opacity: 0.7;
  }
}
</style>
```

[src/views/Search.vue]

```vue
<template>
  <div class="search-page">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1 class="site-title">个人博客</h1>
          <div class="search-bar">
            <el-input
              v-model="keyword"
              placeholder="搜索文章..."
              @keyup.enter="handleSearch"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="handleSearch">搜索</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </el-header>

      <el-main class="main-content">
        <div v-if="hasSearched" class="search-results">
          <div class="results-header">
            <h2>搜索结果</h2>
            <p class="results-count">找到 {{ total }} 篇文章</p>
          </div>

          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>

          <div v-else-if="articles.length > 0" class="article-list">
            <article-card
              v-for="article in articles"
              :key="article.id"
              :article="article"
            />
          </div>

          <el-empty v-else description="没有找到相关文章" :image-size="200" />

          <div v-if="articles.length > 0" class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSearch"
              @current-change="handleSearch"
            />
          </div>
        </div>

        <div v-else class="search-placeholder">
          <el-empty description="请输入关键词搜索文章" :image-size="300">
            <el-icon class="search-icon"><Search /></el-icon>
          </el-empty>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import ArticleCard from "@/components/ArticleCard.vue";
import { articleApi } from "@/api/article";
import type { Article } from "@/types";

const keyword = ref("");
const articles = ref<Article[]>([]);
const loading = ref(false);
const hasSearched = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const handleSearch = async () => {
  if (!keyword.value.trim()) {
    return;
  }

  hasSearched.value = true;
  loading.value = true;

  try {
    const response = await articleApi.search({
      keyword: keyword.value,
      page: currentPage.value,
      pageSize: pageSize.value,
    });
    articles.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error("搜索失败:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.search-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
  gap: 40px;
}

.site-title {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  white-space: nowrap;
}

.search-bar {
  flex: 1;
  max-width: 600px;
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.search-results {
  .results-header {
    margin-bottom: 32px;

    h2 {
      font-size: 28px;
      color: #333;
      margin-bottom: 8px;
    }

    .results-count {
      font-size: 14px;
      color: #666;
    }
  }

  .loading-container {
    padding: 20px;
  }

  .article-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 32px;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 40px;
  }
}

.search-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .search-icon {
    font-size: 64px;
    color: #409eff;
    margin-bottom: 20px;
  }
}
</style>
```

[src/views/Login.vue]

```vue
<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>用户登录</h1>
        <p>欢迎回到个人博客</p>
      </div>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名/邮箱"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <div class="form-options">
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
            <router-link to="/forgot-password" class="forgot-link">
              忘记密码？
            </router-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? "登录中..." : "登录" }}
          </el-button>
        </el-form-item>

        <div class="form-footer">
          还没有账号？
          <router-link to="/register" class="register-link">
            立即注册
          </router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { User, Lock } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";
import type { FormInstance, FormRules } from "element-plus";

const router = useRouter();
const userStore = useUserStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  username: "",
  password: "",
  remember: false,
});

const rules: FormRules = {
  username: [
    { required: true, message: "请输入用户名或邮箱", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
};

const handleLogin = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;

    try {
      await userStore.login({
        username: loginForm.username,
        password: loginForm.password,
        remember: loginForm.remember,
      });

      ElMessage.success("登录成功");
      router.push("/");
    } catch (error: any) {
      ElMessage.error(error.message || "登录失败");
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 28px;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #666;
  }
}

.login-form {
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .forgot-link {
      font-size: 14px;
      color: #409eff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .login-button {
    width: 100%;
  }

  .form-footer {
    text-align: center;
    font-size: 14px;
    color: #666;

    .register-link {
      color: #409eff;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
```

[src/views/Register.vue]

```vue
<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1>用户注册</h1>
        <p>加入我们的博客社区</p>
      </div>

      <el-form
        ref="formRef"
        :model="registerForm"
        :rules="rules"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用户名"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="邮箱地址"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="large"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="agreement">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意
            <a href="/terms" target="_blank">《用户协议》</a>
            和
            <a href="/privacy" target="_blank">《隐私政策》</a>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="register-button"
            @click="handleRegister"
          >
            {{ loading ? "注册中..." : "注册" }}
          </el-button>
        </el-form-item>

        <div class="form-footer">
          已有账号？
          <router-link to="/login" class="login-link"> 立即登录 </router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { User, Lock, Message } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { userApi } from "@/api/user";
import type { FormInstance, FormRules } from "element-plus";

const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);

const registerForm = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreement: false,
});

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules: FormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 3,
      max: 20,
      message: "用户名长度在 3 到 20 个字符",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
  agreement: [
    {
      type: "enum",
      enum: [true],
      message: "请阅读并同意用户协议和隐私政策",
      trigger: "change",
    },
  ],
};

const handleRegister = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;

    try {
      await userApi.register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      });

      ElMessage.success("注册成功，请登录");
      router.push("/login");
    } catch (error: any) {
      ElMessage.error(error.message || "注册失败");
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-header {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 28px;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #666;
  }
}

.register-form {
  .register-button {
    width: 100%;
  }

  .form-footer {
    text-align: center;
    font-size: 14px;
    color: #666;

    .login-link {
      color: #409eff;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  a {
    color: #409eff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
```

[src/views/Profile.vue]

```vue
<template>
  <div class="profile-page">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1 class="site-title">个人博客</h1>
          <div class="user-menu">
            <el-dropdown>
              <div class="user-avatar">
                <img :src="userStore.avatar" alt="avatar" />
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToProfile">
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="goToCreateArticle">
                    写文章
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-main class="main-content">
        <div class="profile-container">
          <div class="profile-card">
            <div class="avatar-section">
              <el-avatar :size="120" :src="userStore.avatar" />
              <el-button
                type="primary"
                size="small"
                class="upload-btn"
                @click="handleUploadAvatar"
              >
                更换头像
              </el-button>
            </div>

            <el-form
              ref="formRef"
              :model="profileForm"
              :rules="rules"
              label-width="80px"
              class="profile-form"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="profileForm.username" disabled />
              </el-form-item>

              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="profileForm.nickname" />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" />
              </el-form-item>

              <el-form-item label="个人简介" prop="bio">
                <el-input
                  v-model="profileForm.bio"
                  type="textarea"
                  :rows="4"
                  placeholder="介绍一下自己..."
                />
              </el-form-item>

              <el-form-item label="个人网站" prop="website">
                <el-input
                  v-model="profileForm.website"
                  placeholder="https://"
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  :loading="loading"
                  @click="handleSave"
                >
                  保存修改
                </el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="stats-section">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-card">
                  <div class="stat-number">{{ stats.articles }}</div>
                  <div class="stat-label">文章数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-card">
                  <div class="stat-number">{{ stats.views }}</div>
                  <div class="stat-label">总阅读</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-card">
                  <div class="stat-number">{{ stats.likes }}</div>
                  <div class="stat-label">获赞数</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";
import { userApi } from "@/api/user";
import type { FormInstance, FormRules } from "element-plus";

const router = useRouter();
const userStore = useUserStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

const profileForm = reactive({
  username: "",
  nickname: "",
  email: "",
  bio: "",
  website: "",
});

const stats = reactive({
  articles: 0,
  views: 0,
  likes: 0,
});

const rules: FormRules = {
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
};

const loadProfile = async () => {
  try {
    const response = await userApi.getProfile();
    Object.assign(profileForm, response.data);
    Object.assign(stats, response.data.stats);
  } catch (error) {
    console.error("加载个人信息失败:", error);
  }
};

const handleUploadAvatar = () => {
  ElMessage.info("头像上传功能待实现");
};

const handleSave = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;

    try {
      await userApi.updateProfile(profileForm);
      ElMessage.success("保存成功");
      await userStore.fetchUserInfo();
    } catch (error: any) {
      ElMessage.error(error.message || "保存失败");
    } finally {
      loading.value = false;
    }
  });
};

const handleReset = () => {
  loadProfile();
};

const goToProfile = () => {
  router.push("/profile");
};

const goToCreateArticle = () => {
  router.push("/article/create");
};

const handleLogout = async () => {
  await userStore.logout();
  router.push("/login");
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.site-title {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.user-avatar {
  cursor: pointer;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;

    .upload-btn {
      margin-top: 16px;
    }
  }

  .profile-form {
    max-width: 500px;
    margin: 0 auto;
  }
}

.stats-section {
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .stat-number {
      font-size: 36px;
      font-weight: bold;
      color: #409eff;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }
  }
}
</style>
```

[src/views/ArticleEdit.vue]

```vue
<template>
  <div class="article-edit-page">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1 class="site-title">个人博客</h1>
          <div class="header-actions">
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" :loading="saving" @click="handleSave">
              {{ saving ? "保存中..." : isEdit ? "更新文章" : "发布文章" }}
            </el-button>
          </div>
        </div>
      </el-header>

      <el-main class="main-content">
        <div class="edit-container">
          <el-form
            ref="formRef"
            :model="articleForm"
            :rules="rules"
            label-width="80px"
          >
            <el-form-item label="文章标题" prop="title">
              <el-input
                v-model="articleForm.title"
                placeholder="请输入文章标题"
                size="large"
              />
            </el-form-item>

            <el-form-item label="文章摘要" prop="excerpt">
              <el-input
                v-model="articleForm.excerpt"
                type="textarea"
                :rows="3"
                placeholder="请输入文章摘要"
              />
            </el-form-item>

            <el-form-item label="文章封面" prop="coverImage">
              <el-input
                v-model="articleForm.coverImage"
                placeholder="请输入封面图片URL"
              />
            </el-form-item>

            <el-form-item label="分类" prop="categoryId">
              <el-select
                v-model="articleForm.categoryId"
                placeholder="请选择分类"
                style="width: 100%"
              >
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="标签" prop="tags">
              <el-select
                v-model="articleForm.tags"
                multiple
                placeholder="请选择标签"
                style="width: 100%"
              >
                <el-option
                  v-for="tag in tags"
                  :key="tag.id"
                  :label="tag.name"
                  :value="tag.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="文章内容" prop="content">
              <markdown-editor v-model="articleForm.content" :height="500" />
            </el-form-item>
          </el-form>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import MarkdownEditor from "@/components/MarkdownEditor.vue";
import { articleApi } from "@/api/article";
import { categoryApi } from "@/api/category";
import { tagApi } from "@/api/tag";
import type { FormInstance, FormRules } from "element-plus";
import type { Category, Tag } from "@/types";

const router = useRouter();
const route = useRoute();
const formRef = ref<FormInstance>();
const saving = ref(false);
const isEdit = ref(false);

const articleForm = reactive({
  title: "",
  excerpt: "",
  coverImage: "",
  categoryId: null as number | null,
  tags: [] as number[],
  content: "",
});

const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);

const rules: FormRules = {
  title: [{ required: true, message: "请输入文章标题", trigger: "blur" }],
  excerpt: [{ required: true, message: "请输入文章摘要", trigger: "blur" }],
  categoryId: [{ required: true, message: "请选择分类", trigger: "change" }],
  content: [{ required: true, message: "请输入文章内容", trigger: "blur" }],
};

const loadCategories = async () => {
  try {
    const response = await categoryApi.getList();
    categories.value = response.data;
  } catch (error) {
    console.error("加载分类失败:", error);
  }
};

const loadTags = async () => {
  try {
    const response = await tagApi.getList();
    tags.value = response.data;
  } catch (error) {
    console.error("加载标签失败:", error);
  }
};

const loadArticle = async (id: number) => {
  try {
    const response = await articleApi.getDetail(id);
    const article = response.data;

    articleForm.title = article.title;
    articleForm.excerpt = article.excerpt;
    articleForm.coverImage = article.coverImage || "";
    articleForm.categoryId = article.category.id;
    articleForm.tags = article.tags.map((t: Tag) => t.id);
    articleForm.content = article.content;
  } catch (error) {
    console.error("加载文章失败:", error);
  }
};

const handleSave = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    saving.value = true;

    try {
      if (isEdit.value) {
        const articleId = route.params.id as string;
        await articleApi.update(parseInt(articleId), articleForm);
        ElMessage.success("更新成功");
      } else {
        await articleApi.create(articleForm);
        ElMessage.success("发布成功");
      }

      router.push("/");
    } catch (error: any) {
      ElMessage.error(error.message || "保存失败");
    } finally {
      saving.value = false;
    }
  });
};

const goBack = () => {
  router.back();
};

onMounted(async () => {
  await Promise.all([loadCategories(), loadTags()]);

  const articleId = route.params.id as string;
  if (articleId) {
    isEdit.value = true;
    await loadArticle(parseInt(articleId));
  }
});
</script>

<style scoped lang="scss">
.article-edit-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.site-title {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.edit-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
```

[src/App.vue]

```vue
<template>
  <router-view />
</template>

<script setup lang="ts">
// 根组件
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
```

[src/main.ts]

```typescript
import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(pinia);
app.use(router);
app.use(ElementPlus);

app.mount("#app");
```

[vite.config.ts]

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

[tsconfig.json]

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

[.env.development]

```bash
# 开发环境配置
VITE_APP_TITLE=个人博客系统
VITE_APP_BASE_API=http://localhost:8080/api
VITE_APP_UPLOAD_URL=http://localhost:8080/upload
```

[.env.production]

```bash
# 生产环境配置
VITE_APP_TITLE=个人博客系统
VITE_APP_BASE_API=https://api.yourdomain.com
VITE_APP_UPLOAD_URL=https://api.yourdomain.com/upload
```

[env.d.ts]

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_BASE_API: string;
  readonly VITE_APP_UPLOAD_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

[package.json]

```json
{
  "name": "blog-system",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "element-plus": "^2.5.0",
    "@element-plus/icons-vue": "^2.3.0",
    "@vueuse/core": "^10.7.0",
    "axios": "^1.6.0",
    "dayjs": "^1.11.0",
    "markdown-it": "^14.0.0",
    "highlight.js": "^11.9.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0",
    "@types/markdown-it": "^13.0.0",
    "sass": "^1.69.0"
  }
}
```

[README.md]

````markdown
# 个人博客系统

基于 Vue3 + TypeScript + Vite + Element Plus 构建的现代化个人博客系统。

## 技术栈

- **框架**: Vue 3.4+ (Composition API)
- **语言**: TypeScript 5.3+
- **构建工具**: Vite 5.0+
- **UI 库**: Element Plus 2.5+
- **状态管理**: Pinia 2.1+
- **路由**: Vue Router 4.2+
- **工具库**: @vueuse/core
- **HTTP 客户端**: Axios
- **Markdown**: markdown-it + highlight.js

## 功能特性

### 用户功能

- ✅ 用户注册/登录
- ✅ 个人信息管理
- ✅ 头像上传

### 文章功能

- ✅ 文章列表展示
- ✅ 文章详情阅读
- ✅ Markdown 编辑器
- ✅ 文章分类管理
- ✅ 文章标签系统
- ✅ 文章搜索功能

### 交互功能

- ✅ 评论系统
- ✅ 点赞功能
- ✅ 阅读统计

## 快速开始

### 安装依赖

```bash
npm install
```
````

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
blog-system/
├── public/              # 静态资源
├── src/
│   ├── api/            # API接口层
│   ├── assets/         # 资源文件
│   ├── components/     # 公共组件
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia状态管理
│   ├── types/          # TypeScript类型
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.ts         # 应用入口
├── index.html
├── vite.config.ts      # Vite配置
├── tsconfig.json       # TypeScript配置
└── package.json
```

## 开发说明

### 环境配置

项目使用环境变量管理配置，主要配置文件：

- `.env.development` - 开发环境
- `.env.production` - 生产环境

### API 代理配置

开发环境下，Vite 会自动代理 API 请求到后端服务。

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Composition API 编写组件

## 许可证

MIT License

## 作者

小徐带你飞系列教程

```

---

## 项目二：任务管理系统

### 项目结构

```

task-manager/
├── public/ # 静态资源
├── src/
│ ├── api/ # API 接口层
│ │ └── request.ts # Axios 封装
│ │
│ ├── components/ # 公共组件
│ │ ├── TaskCard.vue # 任务卡片
│ │ ├── TaskForm.vue # 任务表单
│ │ └── TaskBoard.vue # 任务看板
│ │
│ ├── composables/ # 组合式函数
│ │ └── useDraggable.ts # 拖拽 hook
│ │
│ ├── router/ # 路由配置
│ │ └── index.ts # 路由定义
│ │
│ ├── stores/ # Pinia 状态管理
│ │ ├── task.ts # 任务状态
│ │ ├── team.ts # 团队状态
│ │ └── statistics.ts # 统计状态
│ │
│ ├── types/ # TypeScript 类型
│ │ └── task.ts # 任务类型定义
│ │
│ ├── views/ # 页面组件
│ │ ├── Dashboard.vue # 仪表盘
│ │ ├── TaskBoard.vue # 任务看板
│ │ ├── TaskList.vue # 任务列表
│ │ ├── TaskDetail.vue # 任务详情
│ │ ├── Team.vue # 团队管理
│ │ └── Statistics.vue # 统计分析
│ │
│ ├── App.vue # 根组件
│ └── main.ts # 应用入口
│
├── index.html # HTML 入口
├── vite.config.ts # Vite 配置
├── tsconfig.json # TypeScript 配置
├── .env.development # 开发环境变量
├── .env.production # 生产环境变量
├── env.d.ts # 环境变量类型
├── package.json # 项目配置
└── README.md # 项目说明

````

### A.2.1 项目初始化

```bash
npm create vite@latest task-manager -- --template vue-ts
cd task-manager
npm install
npm install vue-router@4 pinia element-plus @element-plus/icons-vue
npm install @vueuse/core sortablejs
npm install -D @types/sortablejs sass
````

### A.2.2 类型定义

[src/types/task.ts]

```typescript
export interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "inProgress" | "done";
  priority: "low" | "medium" | "high";
  assignee: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  attachments: Attachment[];
}

export interface Attachment {
  id: number;
  name: string;
  url: string;
  size: number;
}

export interface TaskColumn {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Member {
  id: number;
  username: string;
  avatar: string;
  email: string;
  role: "admin" | "member";
}
```

### A.2.3 拖拽 Composable

[src/composables/useDraggable.ts]

```typescript
import { ref } from "vue";
import Sortable from "sortablejs";

export function useDraggable(containerRef: any, onEnd: (item: any) => void) {
  const sortableInstance = ref<Sortable | null>(null);

  const initSortable = () => {
    if (!containerRef.value) return;

    sortableInstance.value = Sortable.create(containerRef.value, {
      animation: 150,
      ghostClass: "sortable-ghost",
      dragClass: "sortable-drag",
      onEnd: (evt: any) => {
        const { oldIndex, newIndex, from, to } = evt;
        onEnd({
          oldIndex,
          newIndex,
          fromColumnId: from.dataset.columnId,
          toColumnId: to.dataset.columnId,
        });
      },
    });
  };

  const destroySortable = () => {
    if (sortableInstance.value) {
      sortableInstance.value.destroy();
      sortableInstance.value = null;
    }
  };

  return {
    initSortable,
    destroySortable,
  };
}
```

### A.2.4 看板组件

[src/views/TaskBoard.vue]

```vue
<template>
  <div class="task-board">
    <div class="board-header">
      <h2>任务看板</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建任务
        </el-button>
      </div>
    </div>

    <div class="board-columns">
      <div
        v-for="column in columns"
        :key="column.id"
        class="board-column"
        :data-column-id="column.id"
      >
        <div class="column-header">
          <h3>{{ column.title }}</h3>
          <el-badge :value="getTasksByColumn(column.id).length" class="badge" />
        </div>

        <div class="column-tasks" :ref="(el) => setColumnRef(el, column.id)">
          <TaskCard
            v-for="task in getTasksByColumn(column.id)"
            :key="task.id"
            :task="task"
            @edit="handleEditTask"
            @delete="handleDeleteTask"
          />
        </div>
      </div>
    </div>

    <!-- 创建/编辑任务对话框 -->
    <TaskForm
      v-model="showCreateDialog"
      :task="editingTask"
      @save="handleSaveTask"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ElButton, ElBadge, ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { useTaskStore } from "@/stores/task";
import TaskCard from "@/components/TaskCard.vue";
import TaskForm from "@/components/TaskForm.vue";
import { useDraggable } from "@/composables/useDraggable";
import type { TaskColumn, Task } from "@/types/task";

const taskStore = useTaskStore();

const columns = ref<TaskColumn[]>([
  { id: "todo", title: "待办", tasks: [] },
  { id: "inProgress", title: "进行中", tasks: [] },
  { id: "done", title: "已完成", tasks: [] },
]);

const showCreateDialog = ref(false);
const editingTask = ref<Task | null>(null);

const columnRefs = ref<Map<string, HTMLElement>>(new Map());
const draggables: Map<string, ReturnType<typeof useDraggable>> = new Map();

const setColumnRef = (el: any, columnId: string) => {
  if (el) {
    columnRefs.value.set(columnId, el);

    // 初始化拖拽
    if (!draggables.has(columnId)) {
      const { initSortable, destroySortable } = useDraggable(el, handleDragEnd);
      initSortable();
      draggables.set(columnId, { initSortable, destroySortable });
    }
  }
};

const getTasksByColumn = (columnId: string) => {
  return taskStore.tasks.filter((task) => task.status === columnId);
};

const handleDragEnd = async (dragResult: any) => {
  const { oldIndex, newIndex, fromColumnId, toColumnId } = dragResult;

  if (fromColumnId === toColumnId) {
    // 同一列内排序
    const tasks = getTasksByColumn(fromColumnId);
    const [movedTask] = tasks.splice(oldIndex, 1);
    tasks.splice(newIndex, 0, movedTask);
  } else {
    // 跨列移动
    const fromTasks = getTasksByColumn(fromColumnId);
    const [movedTask] = fromTasks.splice(oldIndex, 1);

    const toTasks = getTasksByColumn(toColumnId);
    toTasks.splice(newIndex, 0, movedTask);

    // 更新任务状态
    await taskStore.updateTaskStatus(movedTask.id, toColumnId as any);
  }
};

const handleEditTask = (task: Task) => {
  editingTask.value = task;
  showCreateDialog.value = true;
};

const handleDeleteTask = async (taskId: number) => {
  await taskStore.deleteTask(taskId);
  ElMessage.success("任务已删除");
};

const handleSaveTask = async (task: any) => {
  if (editingTask.value) {
    await taskStore.updateTask(editingTask.value.id, task);
    ElMessage.success("任务已更新");
  } else {
    await taskStore.createTask(task);
    ElMessage.success("任务已创建");
  }
  showCreateDialog.value = false;
  editingTask.value = null;
};

onMounted(async () => {
  await taskStore.fetchTasks();
});

onUnmounted(() => {
  // 清理拖拽实例
  draggables.forEach(({ destroySortable }) => {
    destroySortable();
  });
});
</script>

<style scoped lang="scss">
.task-board {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.board-header {
  padding: 20px 24px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
}

.board-columns {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 24px;
  overflow-x: auto;
}

.board-column {
  flex: 1;
  min-width: 300px;
  background: #f0f2f5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.column-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
}

.column-tasks {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  min-height: 200px;
}

.sortable-ghost {
  opacity: 0.4;
  background: #e6f7ff;
}

.sortable-drag {
  opacity: 1;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
```

[src/views/Dashboard.vue]

```vue
<template>
  <div class="dashboard-page">
    <el-container>
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <h2>任务管理</h2>
        </div>
        <el-menu :default-active="activeMenu" router class="menu">
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/task-board">
            <el-icon><Grid /></el-icon>
            <span>任务看板</span>
          </el-menu-item>
          <el-menu-item index="/task-list">
            <el-icon><List /></el-icon>
            <span>任务列表</span>
          </el-menu-item>
          <el-menu-item index="/team">
            <el-icon><User /></el-icon>
            <span>团队成员</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><TrendCharts /></el-icon>
            <span>统计分析</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header>
          <div class="header-content">
            <h1>仪表盘</h1>
            <div class="user-info">
              <el-dropdown>
                <div class="avatar">
                  <img :src="userStore.avatar" alt="avatar" />
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>个人设置</el-dropdown-item>
                    <el-dropdown-item divided>退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <el-main class="main-content">
          <!-- 统计卡片 -->
          <el-row :gutter="20" class="stats-row">
            <el-col :xs="24" :sm="12" :md="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: #ecf5ff;">
                  <el-icon color="#409eff" :size="32"><Document /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ stats.total }}</div>
                  <div class="stat-label">总任务</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: #f0f9ff;">
                  <el-icon color="#67c23a" :size="32"><CircleCheck /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ stats.completed }}</div>
                  <div class="stat-label">已完成</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: #fef0f0;">
                  <el-icon color="#f56c6c" :size="32"><Clock /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ stats.inProgress }}</div>
                  <div class="stat-label">进行中</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <div class="stat-card">
                <div class="stat-icon" style="background: #fdf6ec;">
                  <el-icon color="#e6a23c" :size="32"><Warning /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ stats.overdue }}</div>
                  <div class="stat-label">已逾期</div>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- 最近任务 -->
          <el-card class="recent-tasks" shadow="never">
            <template #header>
              <div class="card-header">
                <span>最近任务</span>
                <el-link type="primary" @click="goToTaskBoard"
                  >查看全部</el-link
                >
              </div>
            </template>
            <el-table :data="recentTasks" style="width: 100%">
              <el-table-column prop="title" label="任务标题" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="100">
                <template #default="{ row }">
                  <el-tag :type="getPriorityType(row.priority)" effect="plain">
                    {{ getPriorityText(row.priority) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="dueDate" label="截止日期" width="120" />
            </el-table>
          </el-card>

          <!-- 团队成员 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="team-card" shadow="never">
                <template #header>
                  <span>团队成员</span>
                </template>
                <div class="member-list">
                  <div
                    v-for="member in teamMembers"
                    :key="member.id"
                    class="member-item"
                  >
                    <el-avatar :size="40" :src="member.avatar" />
                    <div class="member-info">
                      <div class="member-name">{{ member.username }}</div>
                      <div class="member-role">{{ member.role }}</div>
                    </div>
                    <el-badge :value="member.taskCount" class="member-badge" />
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="activity-card" shadow="never">
                <template #header>
                  <span>最近活动</span>
                </template>
                <el-timeline>
                  <el-timeline-item
                    v-for="(activity, index) in activities"
                    :key="index"
                    :timestamp="activity.time"
                  >
                    {{ activity.content }}
                  </el-timeline-item>
                </el-timeline>
              </el-card>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  DataAnalysis,
  Grid,
  List,
  User,
  TrendCharts,
  Document,
  CircleCheck,
  Clock,
  Warning,
} from "@element-plus/icons-vue";
import { useTaskStore } from "@/stores/task";

const router = useRouter();
const route = useRoute();
const taskStore = useTaskStore();

const activeMenu = computed(() => route.path);

const stats = ref({
  total: 0,
  completed: 0,
  inProgress: 0,
  overdue: 0,
});

const recentTasks = ref([]);
const teamMembers = ref([]);
const activities = ref([]);

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    done: "success",
    inProgress: "warning",
    todo: "info",
  };
  return map[status] || "info";
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    done: "已完成",
    inProgress: "进行中",
    todo: "待处理",
  };
  return map[status] || status;
};

const getPriorityType = (priority: string) => {
  const map: Record<string, any> = {
    high: "danger",
    medium: "warning",
    low: "info",
  };
  return map[priority] || "info";
};

const getPriorityText = (priority: string) => {
  const map: Record<string, string> = {
    high: "高",
    medium: "中",
    low: "低",
  };
  return map[priority] || priority;
};

const loadDashboardData = async () => {
  // 加载仪表盘数据
  stats.value = await taskStore.getStats();
  recentTasks.value = await taskStore.getRecentTasks();
  teamMembers.value = await taskStore.getTeamMembers();
  activities.value = await taskStore.getRecentActivities();
};

const goToTaskBoard = () => {
  router.push("/task-board");
};

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped lang="scss">
.dashboard-page {
  height: 100vh;
}

.sidebar {
  background: #001529;
  color: white;

  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    color: white;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .menu {
    border-right: none;
    background: #001529;
  }

  :deep(.el-menu-item) {
    color: rgba(255, 255, 255, 0.65);

    &:hover {
      background: #1890ff !important;
      color: white;
    }

    &.is-active {
      background: #1890ff !important;
      color: white;
    }
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  h1 {
    font-size: 20px;
    color: #333;
  }

  .avatar {
    cursor: pointer;

    img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }
  }
}

.main-content {
  background: #f0f2f5;
  padding: 24px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    flex: 1;

    .stat-number {
      font-size: 28px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }
  }
}

.recent-tasks {
  margin-bottom: 24px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.team-card,
.activity-card {
  height: 400px;

  .member-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .member-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 8px;

    .member-info {
      flex: 1;

      .member-name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      .member-role {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
      }
    }

    .member-badge {
      margin-left: auto;
    }
  }
}
</style>
```

[src/views/TaskList.vue]

```vue
<template>
  <div class="task-list-page">
    <el-container>
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <h2>任务管理</h2>
        </div>
        <el-menu :default-active="activeMenu" router class="menu">
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/task-board">
            <el-icon><Grid /></el-icon>
            <span>任务看板</span>
          </el-menu-item>
          <el-menu-item index="/task-list">
            <el-icon><List /></el-icon>
            <span>任务列表</span>
          </el-menu-item>
          <el-menu-item index="/team">
            <el-icon><User /></el-icon>
            <span>团队成员</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><TrendCharts /></el-icon>
            <span>统计分析</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header>
          <div class="header-content">
            <h1>任务列表</h1>
            <el-button type="primary" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              新建任务
            </el-button>
          </div>
        </el-header>

        <el-main class="main-content">
          <!-- 筛选栏 -->
          <el-card class="filter-card" shadow="never">
            <el-form :inline="true" :model="filters">
              <el-form-item label="任务状态">
                <el-select
                  v-model="filters.status"
                  placeholder="全部"
                  clearable
                >
                  <el-option label="待处理" value="todo" />
                  <el-option label="进行中" value="inProgress" />
                  <el-option label="已完成" value="done" />
                </el-select>
              </el-form-item>
              <el-form-item label="优先级">
                <el-select
                  v-model="filters.priority"
                  placeholder="全部"
                  clearable
                >
                  <el-option label="高" value="high" />
                  <el-option label="中" value="medium" />
                  <el-option label="低" value="low" />
                </el-select>
              </el-form-item>
              <el-form-item label="指派给">
                <el-select
                  v-model="filters.assignee"
                  placeholder="全部"
                  clearable
                >
                  <el-option
                    v-for="member in teamMembers"
                    :key="member.id"
                    :label="member.username"
                    :value="member.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 任务列表 -->
          <el-card class="table-card" shadow="never">
            <el-table :data="taskList" style="width: 100%" v-loading="loading">
              <el-table-column prop="title" label="任务标题" min-width="200">
                <template #default="{ row }">
                  <el-link type="primary" @click="viewTask(row.id)">
                    {{ row.title }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="100">
                <template #default="{ row }">
                  <el-tag :type="getPriorityType(row.priority)" effect="plain">
                    {{ getPriorityText(row.priority) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="assignee" label="负责人" width="120">
                <template #default="{ row }">
                  {{ getAssigneeName(row.assignee) }}
                </template>
              </el-table-column>
              <el-table-column prop="dueDate" label="截止日期" width="120" />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="editTask(row)">
                    编辑
                  </el-button>
                  <el-button link type="danger" @click="deleteTask(row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-container">
              <el-pagination
                v-model:current-page="pagination.page"
                v-model:page-size="pagination.pageSize"
                :total="pagination.total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="loadTasks"
                @current-change="loadTasks"
              />
            </div>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  DataAnalysis,
  Grid,
  List,
  User,
  TrendCharts,
  Plus,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useTaskStore } from "@/stores/task";

const router = useRouter();
const taskStore = useTaskStore();

const loading = ref(false);
const showCreateDialog = ref(false);
const taskList = ref([]);
const teamMembers = ref([]);

const filters = reactive({
  status: "",
  priority: "",
  assignee: null,
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const activeMenu = computed(() => "/task-list");

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    done: "success",
    inProgress: "warning",
    todo: "info",
  };
  return map[status] || "info";
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    done: "已完成",
    inProgress: "进行中",
    todo: "待处理",
  };
  return map[status] || status;
};

const getPriorityType = (priority: string) => {
  const map: Record<string, any> = {
    high: "danger",
    medium: "warning",
    low: "info",
  };
  return map[priority] || "info";
};

const getPriorityText = (priority: string) => {
  const map: Record<string, string> = {
    high: "高",
    medium: "中",
    low: "低",
  };
  return map[priority] || priority;
};

const getAssigneeName = (assigneeId: number) => {
  const member = teamMembers.value.find((m: any) => m.id === assigneeId);
  return member ? member.username : "-";
};

const loadTasks = async () => {
  loading.value = true;
  try {
    const result = await taskStore.getTaskList({
      ...filters,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
    taskList.value = result.list;
    pagination.total = result.total;
  } catch (error) {
    console.error("加载任务列表失败:", error);
  } finally {
    loading.value = false;
  }
};

const loadTeamMembers = async () => {
  teamMembers.value = await taskStore.getTeamMembers();
};

const handleSearch = () => {
  pagination.page = 1;
  loadTasks();
};

const handleReset = () => {
  filters.status = "";
  filters.priority = "";
  filters.assignee = null;
  handleSearch();
};

const viewTask = (id: number) => {
  router.push(`/task-detail/${id}`);
};

const editTask = (task: any) => {
  router.push(`/task-edit/${task.id}`);
};

const deleteTask = async (task: any) => {
  try {
    await ElMessageBox.confirm("确定要删除这个任务吗？", "提示", {
      type: "warning",
    });
    await taskStore.deleteTask(task.id);
    ElMessage.success("删除成功");
    loadTasks();
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除任务失败:", error);
    }
  }
};

onMounted(() => {
  loadTasks();
  loadTeamMembers();
});
</script>

<style scoped lang="scss">
.task-list-page {
  height: 100vh;
}

.sidebar {
  background: #001529;
  color: white;

  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    color: white;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .menu {
    border-right: none;
    background: #001529;
  }

  :deep(.el-menu-item) {
    color: rgba(255, 255, 255, 0.65);

    &:hover {
      background: #1890ff !important;
      color: white;
    }

    &.is-active {
      background: #1890ff !important;
      color: white;
    }
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  h1 {
    font-size: 20px;
    color: #333;
  }
}

.main-content {
  background: #f0f2f5;
  padding: 24px;
}

.filter-card,
.table-card {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
```

[src/views/TaskDetail.vue]

```vue
<template>
  <div class="task-detail-page">
    <el-container>
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <h2>任务管理</h2>
        </div>
        <el-menu :default-active="activeMenu" router class="menu">
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/task-board">
            <el-icon><Grid /></el-icon>
            <span>任务看板</span>
          </el-menu-item>
          <el-menu-item index="/task-list">
            <el-icon><List /></el-icon>
            <span>任务列表</span>
          </el-menu-item>
          <el-menu-item index="/team">
            <el-icon><User /></el-icon>
            <span>团队成员</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><TrendCharts /></el-icon>
            <span>统计分析</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header>
          <div class="header-content">
            <div class="header-left">
              <el-button link @click="goBack">
                <el-icon><ArrowLeft /></el-icon>
                返回
              </el-button>
              <h1>任务详情</h1>
            </div>
            <div class="header-actions">
              <el-button @click="editTask">编辑</el-button>
              <el-button type="primary" @click="saveTask">保存</el-button>
            </div>
          </div>
        </el-header>

        <el-main class="main-content">
          <el-row :gutter="24">
            <el-col :span="16">
              <el-card class="detail-card" shadow="never" v-loading="loading">
                <template #header>
                  <div class="card-header">
                    <h2>{{ task.title }}</h2>
                    <el-tag :type="getStatusType(task.status)">
                      {{ getStatusText(task.status) }}
                    </el-tag>
                  </div>
                </template>

                <div class="task-info">
                  <div class="info-item">
                    <label>任务描述</label>
                    <p>{{ task.description }}</p>
                  </div>

                  <div class="info-item">
                    <label>优先级</label>
                    <el-tag
                      :type="getPriorityType(task.priority)"
                      effect="plain"
                    >
                      {{ getPriorityText(task.priority) }}
                    </el-tag>
                  </div>

                  <div class="info-item">
                    <label>负责人</label>
                    <div class="assignee">
                      <el-avatar :size="32" :src="task.assigneeAvatar" />
                      <span>{{ task.assigneeName }}</span>
                    </div>
                  </div>

                  <div class="info-item">
                    <label>截止日期</label>
                    <p>{{ task.dueDate }}</p>
                  </div>

                  <div class="info-item">
                    <label>标签</label>
                    <div class="tags">
                      <el-tag v-for="tag in task.tags" :key="tag" size="small">
                        {{ tag }}
                      </el-tag>
                    </div>
                  </div>

                  <div class="info-item">
                    <label>附件</label>
                    <el-upload
                      action="#"
                      :auto-upload="false"
                      :on-change="handleFileChange"
                    >
                      <el-button size="small">
                        <el-icon><Upload /></el-icon>
                        上传附件
                      </el-button>
                    </el-upload>
                    <div class="file-list">
                      <div
                        v-for="file in task.attachments"
                        :key="file.id"
                        class="file-item"
                      >
                        <el-icon><Document /></el-icon>
                        <span>{{ file.name }}</span>
                        <el-button link type="danger" @click="deleteFile(file)">
                          删除
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card class="side-card" shadow="never">
                <template #header>
                  <span>任务活动</span>
                </template>
                <el-timeline>
                  <el-timeline-item
                    v-for="(activity, index) in activities"
                    :key="index"
                    :timestamp="activity.time"
                  >
                    <div class="activity-content">
                      <strong>{{ activity.user }}</strong>
                      {{ activity.action }}
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </el-card>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  DataAnalysis,
  Grid,
  List,
  User,
  TrendCharts,
  ArrowLeft,
  Upload,
  Document,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useTaskStore } from "@/stores/task";

const router = useRouter();
const route = useRoute();
const taskStore = useTaskStore();

const loading = ref(false);
const task = reactive({
  id: 0,
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assignee: null,
  assigneeName: "",
  assigneeAvatar: "",
  dueDate: "",
  tags: [],
  attachments: [],
});

const activities = ref([]);

const activeMenu = ref("/task-list");

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    done: "success",
    inProgress: "warning",
    todo: "info",
  };
  return map[status] || "info";
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    done: "已完成",
    inProgress: "进行中",
    todo: "待处理",
  };
  return map[status] || status;
};

const getPriorityType = (priority: string) => {
  const map: Record<string, any> = {
    high: "danger",
    medium: "warning",
    low: "info",
  };
  return map[priority] || "info";
};

const getPriorityText = (priority: string) => {
  const map: Record<string, string> = {
    high: "高",
    medium: "中",
    low: "低",
  };
  return map[priority] || priority;
};

const loadTask = async () => {
  loading.value = true;
  try {
    const taskId = route.params.id as string;
    const taskData = await taskStore.getTaskDetail(parseInt(taskId));
    Object.assign(task, taskData);

    const activityData = await taskStore.getTaskActivities(parseInt(taskId));
    activities.value = activityData;
  } catch (error) {
    console.error("加载任务详情失败:", error);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};

const editTask = () => {
  router.push(`/task-edit/${task.id}`);
};

const saveTask = async () => {
  try {
    await taskStore.updateTask(task.id, task);
    ElMessage.success("保存成功");
  } catch (error) {
    console.error("保存任务失败:", error);
  }
};

const handleFileChange = (file: any) => {
  console.log("上传文件:", file);
};

const deleteFile = (file: any) => {
  console.log("删除文件:", file);
};

onMounted(() => {
  loadTask();
});
</script>

<style scoped lang="scss">
.task-detail-page {
  height: 100vh;
}

.sidebar {
  background: #001529;
  color: white;

  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    color: white;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .menu {
    border-right: none;
    background: #001529;
  }

  :deep(.el-menu-item) {
    color: rgba(255, 255, 255, 0.65);

    &:hover {
      background: #1890ff !important;
      color: white;
    }

    &.is-active {
      background: #1890ff !important;
      color: white;
    }
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    h1 {
      font-size: 20px;
      color: #333;
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.main-content {
  background: #f0f2f5;
  padding: 24px;
}

.detail-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }
  }

  .task-info {
    .info-item {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        font-weight: 500;
        color: #333;
        margin-bottom: 8px;
      }

      p {
        color: #666;
        line-height: 1.6;
        margin: 0;
      }

      .assignee {
        display: flex;
        align-items: center;
        gap: 8px;

        span {
          color: #666;
        }
      }

      .tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .file-list {
        margin-top: 12px;

        .file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f5f7fa;
          border-radius: 4px;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          span {
            flex: 1;
            color: #666;
          }
        }
      }
    }
  }
}

.side-card {
  .activity-content {
    color: #666;
    font-size: 14px;

    strong {
      color: #333;
    }
  }
}
</style>
```

[src/views/Team.vue]

```vue
<template>
  <div class="team-page">
    <el-container>
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <h2>任务管理</h2>
        </div>
        <el-menu :default-active="activeMenu" router class="menu">
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/task-board">
            <el-icon><Grid /></el-icon>
            <span>任务看板</span>
          </el-menu-item>
          <el-menu-item index="/task-list">
            <el-icon><List /></el-icon>
            <span>任务列表</span>
          </el-menu-item>
          <el-menu-item index="/team">
            <el-icon><User /></el-icon>
            <span>团队成员</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><TrendCharts /></el-icon>
            <span>统计分析</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header>
          <div class="header-content">
            <h1>团队成员</h1>
            <el-button type="primary" @click="showInviteDialog = true">
              <el-icon><Plus /></el-icon>
              邀请成员
            </el-button>
          </div>
        </el-header>

        <el-main class="main-content">
          <el-row :gutter="20" class="team-list">
            <el-col
              v-for="member in teamMembers"
              :key="member.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-card class="member-card" shadow="hover">
                <div class="member-header">
                  <el-avatar :size="80" :src="member.avatar" />
                  <div class="member-info">
                    <h3>{{ member.username }}</h3>
                    <el-tag :type="getRoleType(member.role)" size="small">
                      {{ getRoleText(member.role) }}
                    </el-tag>
                  </div>
                </div>
                <div class="member-stats">
                  <div class="stat-item">
                    <div class="stat-number">{{ member.taskCount }}</div>
                    <div class="stat-label">任务数</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ member.completedCount }}</div>
                    <div class="stat-label">已完成</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ member.rate }}%</div>
                    <div class="stat-label">完成率</div>
                  </div>
                </div>
                <div class="member-actions">
                  <el-button link type="primary" @click="viewMember(member)">
                    查看详情
                  </el-button>
                  <el-dropdown v-if="member.role !== 'admin'">
                    <el-button link>
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="editMember(member)">
                          编辑
                        </el-dropdown-item>
                        <el-dropdown-item divided @click="removeMember(member)">
                          移除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>

    <!-- 邀请成员对话框 -->
    <el-dialog v-model="showInviteDialog" title="邀请成员" width="500px">
      <el-form :model="inviteForm" label-width="80px">
        <el-form-item label="邮箱">
          <el-input v-model="inviteForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="inviteForm.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="成员" value="member" />
          </el-select>
        </el-form-item>
        <el-form-item label="留言">
          <el-input
            v-model="inviteForm.message"
            type="textarea"
            :rows="3"
            placeholder="写点什么..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInviteDialog = false">取消</el-button>
        <el-button type="primary" @click="handleInvite">发送邀请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  DataAnalysis,
  Grid,
  List,
  User,
  TrendCharts,
  Plus,
  MoreFilled,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useTeamStore } from "@/stores/team";

const router = useRouter();
const teamStore = useTeamStore();

const showInviteDialog = ref(false);
const teamMembers = ref([]);

const inviteForm = reactive({
  email: "",
  role: "member",
  message: "",
});

const activeMenu = ref("/team");

const getRoleType = (role: string) => {
  return role === "admin" ? "danger" : "info";
};

const getRoleText = (role: string) => {
  return role === "admin" ? "管理员" : "成员";
};

const loadTeamMembers = async () => {
  try {
    teamMembers.value = await teamStore.getTeamMembers();
  } catch (error) {
    console.error("加载团队成员失败:", error);
  }
};

const viewMember = (member: any) => {
  router.push(`/member/${member.id}`);
};

const editMember = (member: any) => {
  router.push(`/member-edit/${member.id}`);
};

const removeMember = async (member: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除成员 ${member.username} 吗？`,
      "提示",
      { type: "warning" }
    );
    await teamStore.removeMember(member.id);
    ElMessage.success("移除成功");
    loadTeamMembers();
  } catch (error) {
    if (error !== "cancel") {
      console.error("移除成员失败:", error);
    }
  }
};

const handleInvite = async () => {
  if (!inviteForm.email) {
    ElMessage.warning("请输入邮箱地址");
    return;
  }

  try {
    await teamStore.inviteMember(inviteForm);
    ElMessage.success("邀请已发送");
    showInviteDialog.value = false;
    inviteForm.email = "";
    inviteForm.message = "";
  } catch (error) {
    console.error("邀请成员失败:", error);
  }
};

onMounted(() => {
  loadTeamMembers();
});
</script>

<style scoped lang="scss">
.team-page {
  height: 100vh;
}

.sidebar {
  background: #001529;
  color: white;

  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    color: white;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .menu {
    border-right: none;
    background: #001529;
  }

  :deep(.el-menu-item) {
    color: rgba(255, 255, 255, 0.65);

    &:hover {
      background: #1890ff !important;
      color: white;
    }

    &.is-active {
      background: #1890ff !important;
      color: white;
    }
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  h1 {
    font-size: 20px;
    color: #333;
  }
}

.main-content {
  background: #f0f2f5;
  padding: 24px;
}

.team-list {
  .member-card {
    margin-bottom: 20px;
    text-align: center;

    .member-header {
      margin-bottom: 20px;

      .member-info {
        margin-top: 12px;

        h3 {
          font-size: 16px;
          color: #333;
          margin: 8px 0;
        }
      }
    }

    .member-stats {
      display: flex;
      justify-content: space-around;
      padding: 16px 0;
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 16px;

      .stat-item {
        .stat-number {
          font-size: 20px;
          font-weight: bold;
          color: #409eff;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #999;
        }
      }
    }

    .member-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
    }
  }
}
</style>
```

[src/views/Statistics.vue]

```vue
<template>
  <div class="statistics-page">
    <el-container>
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <h2>任务管理</h2>
        </div>
        <el-menu :default-active="activeMenu" router class="menu">
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/task-board">
            <el-icon><Grid /></el-icon>
            <span>任务看板</span>
          </el-menu-item>
          <el-menu-item index="/task-list">
            <el-icon><List /></el-icon>
            <span>任务列表</span>
          </el-menu-item>
          <el-menu-item index="/team">
            <el-icon><User /></el-icon>
            <span>团队成员</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><TrendCharts /></el-icon>
            <span>统计分析</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header>
          <div class="header-content">
            <h1>统计分析</h1>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="loadStatistics"
            />
          </div>
        </el-header>

        <el-main class="main-content">
          <el-row :gutter="20" class="stats-cards">
            <el-col :xs="24" :sm="12" :md="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" style="background: #ecf5ff;">
                    <el-icon color="#409eff" :size="32"><Document /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ statistics.totalTasks }}</div>
                    <div class="stat-label">总任务数</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" style="background: #f0f9ff;">
                    <el-icon color="#67c23a" :size="32"
                      ><CircleCheck
                    /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">
                      {{ statistics.completedTasks }}
                    </div>
                    <div class="stat-label">已完成</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" style="background: #fef0f0;">
                    <el-icon color="#f56c6c" :size="32"><Clock /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ statistics.overdueTasks }}</div>
                    <div class="stat-label">已逾期</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" style="background: #fdf6ec;">
                    <el-icon color="#e6a23c" :size="32"
                      ><TrendCharts
                    /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">
                      {{ statistics.completionRate }}%
                    </div>
                    <div class="stat-label">完成率</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="charts-row">
            <el-col :xs="24" :md="12">
              <el-card class="chart-card">
                <template #header>
                  <span>任务状态分布</span>
                </template>
                <div ref="statusChartRef" style="height: 300px"></div>
              </el-card>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-card class="chart-card">
                <template #header>
                  <span>优先级分布</span>
                </template>
                <div ref="priorityChartRef" style="height: 300px"></div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-card class="chart-card">
                <template #header>
                  <span>成员任务统计</span>
                </template>
                <div ref="memberChartRef" style="height: 400px"></div>
              </el-card>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import {
  DataAnalysis,
  Grid,
  List,
  User,
  TrendCharts,
  Document,
  CircleCheck,
  Clock,
} from "@element-plus/icons-vue";
import { useStatisticsStore } from "@/stores/statistics";
import * as echarts from "echarts";

const statisticsStore = useStatisticsStore();

const activeMenu = ref("/statistics");
const dateRange = ref([]);
const statusChartRef = ref<HTMLElement>();
const priorityChartRef = ref<HTMLElement>();
const memberChartRef = ref<HTMLElement>();

let statusChart: echarts.ECharts | null = null;
let priorityChart: echarts.ECharts | null = null;
let memberChart: echarts.ECharts | null = null;

const statistics = reactive({
  totalTasks: 0,
  completedTasks: 0,
  overdueTasks: 0,
  completionRate: 0,
});

const initStatusChart = () => {
  if (!statusChartRef.value) return;

  statusChart = echarts.init(statusChartRef.value);
  statusChart.setOption({
    tooltip: {
      trigger: "item",
    },
    legend: {
      bottom: "0%",
      left: "center",
    },
    series: [
      {
        name: "任务状态",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          {
            value: statistics.completedTasks,
            name: "已完成",
            itemStyle: { color: "#67c23a" },
          },
          {
            value: statistics.totalTasks - statistics.completedTasks,
            name: "未完成",
            itemStyle: { color: "#409eff" },
          },
        ],
      },
    ],
  });
};

const initPriorityChart = () => {
  if (!priorityChartRef.value) return;

  priorityChart = echarts.init(priorityChartRef.value);
  priorityChart.setOption({
    tooltip: {
      trigger: "item",
    },
    legend: {
      bottom: "0%",
      left: "center",
    },
    series: [
      {
        name: "优先级",
        type: "pie",
        radius: "70%",
        data: [
          {
            value: statistics.highTasks,
            name: "高",
            itemStyle: { color: "#f56c6c" },
          },
          {
            value: statistics.mediumTasks,
            name: "中",
            itemStyle: { color: "#e6a23c" },
          },
          {
            value: statistics.lowTasks,
            name: "低",
            itemStyle: { color: "#909399" },
          },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  });
};

const initMemberChart = () => {
  if (!memberChartRef.value) return;

  memberChart = echarts.init(memberChartRef.value);
  memberChart.setOption({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      boundaryGap: [0, 0.01],
    },
    yAxis: {
      type: "category",
      data: statistics.memberNames,
    },
    series: [
      {
        name: "已完成",
        type: "bar",
        data: statistics.memberCompletedTasks,
        itemStyle: { color: "#67c23a" },
      },
      {
        name: "进行中",
        type: "bar",
        data: statistics.memberInProgressTasks,
        itemStyle: { color: "#e6a23c" },
      },
    ],
  });
};

const loadStatistics = async () => {
  try {
    const [startDate, endDate] = dateRange.value;
    const data = await statisticsStore.getStatistics({ startDate, endDate });

    Object.assign(statistics, data);

    // 更新图表
    if (statusChart) {
      statusChart.setOption({
        series: [
          {
            data: [
              { value: data.completedTasks, name: "已完成" },
              { value: data.totalTasks - data.completedTasks, name: "未完成" },
            ],
          },
        ],
      });
    }

    if (priorityChart) {
      priorityChart.setOption({
        series: [
          {
            data: [
              { value: data.highTasks, name: "高" },
              { value: data.mediumTasks, name: "中" },
              { value: data.lowTasks, name: "低" },
            ],
          },
        ],
      });
    }

    if (memberChart) {
      memberChart.setOption({
        yAxis: { data: data.memberNames },
        series: [
          { data: data.memberCompletedTasks },
          { data: data.memberInProgressTasks },
        ],
      });
    }
  } catch (error) {
    console.error("加载统计数据失败:", error);
  }
};

const handleResize = () => {
  statusChart?.resize();
  priorityChart?.resize();
  memberChart?.resize();
};

onMounted(async () => {
  await loadStatistics();
  initStatusChart();
  initPriorityChart();
  initMemberChart();

  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  statusChart?.dispose();
  priorityChart?.dispose();
  memberChart?.dispose();
});
</script>

<style scoped lang="scss">
.statistics-page {
  height: 100vh;
}

.sidebar {
  background: #001529;
  color: white;

  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    color: white;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .menu {
    border-right: none;
    background: #001529;
  }

  :deep(.el-menu-item) {
    color: rgba(255, 255, 255, 0.65);

    &:hover {
      background: #1890ff !important;
      color: white;
    }

    &.is-active {
      background: #1890ff !important;
      color: white;
    }
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  h1 {
    font-size: 20px;
    color: #333;
  }
}

.main-content {
  background: #f0f2f5;
  padding: 24px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-info {
      flex: 1;

      .stat-number {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
      }
    }
  }
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}
</style>
```

[src/App.vue]

```vue
<template>
  <router-view />
</template>

<script setup lang="ts">
// 根组件
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
```

[src/main.ts]

```typescript
import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(pinia);
app.use(router);
app.use(ElementPlus);

app.mount("#app");
```

[vite.config.ts]

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3001,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

[tsconfig.json]

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

[.env.development]

```bash
# 开发环境配置
VITE_APP_TITLE=任务管理系统
VITE_APP_BASE_API=http://localhost:8080/api
```

[.env.production]

```bash
# 生产环境配置
VITE_APP_TITLE=任务管理系统
VITE_APP_BASE_API=https://api.yourdomain.com
```

[env.d.ts]

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_BASE_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

[package.json]

```json
{
  "name": "task-manager",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "element-plus": "^2.5.0",
    "@element-plus/icons-vue": "^2.3.0",
    "@vueuse/core": "^10.7.0",
    "sortablejs": "^1.15.0",
    "axios": "^1.6.0",
    "echarts": "^5.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0",
    "@types/sortablejs": "^1.15.0",
    "sass": "^1.69.0"
  }
}
```

[README.md]

````markdown
# 任务管理系统

基于 Vue3 + TypeScript + Vite + Element Plus 构建的现代化任务管理系统。

## 技术栈

- **框架**: Vue 3.4+ (Composition API)
- **语言**: TypeScript 5.3+
- **构建工具**: Vite 5.0+
- **UI 库**: Element Plus 2.5+
- **状态管理**: Pinia 2.1+
- **路由**: Vue Router 4.2+
- **工具库**: @vueuse/core
- **拖拽**: SortableJS
- **图表**: ECharts 5.4+

## 功能特性

### 任务管理

- ✅ 任务看板（拖拽排序）
- ✅ 任务列表（筛选、搜索）
- ✅ 任务详情
- ✅ 任务状态追踪
- ✅ 优先级管理

### 团队协作

- ✅ 团队成员管理
- ✅ 任务分配
- ✅ 成员邀请
- ✅ 权限控制

### 统计分析

- ✅ 任务统计
- ✅ 成员绩效
- ✅ 数据可视化
- ✅ 报表导出

## 快速开始

### 安装依赖

```bash
npm install
```
````

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3001

### 构建生产

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
task-manager/
├── public/              # 静态资源
├── src/
│   ├── api/            # API接口层
│   ├── components/     # 公共组件
│   ├── composables/    # 组合式函数
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia状态管理
│   ├── types/          # TypeScript类型
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.ts         # 应用入口
├── index.html
├── vite.config.ts      # Vite配置
├── tsconfig.json       # TypeScript配置
└── package.json
```

## 开发说明

### 环境配置

项目使用环境变量管理配置，主要配置文件：

- `.env.development` - 开发环境
- `.env.production` - 生产环境

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Composition API 编写组件

## 许可证

MIT License

## 作者

小徐带你飞系列教程

```

---

## 项目三：电商平台

### 项目结构

```

ecommerce-platform/
├── public/ # 静态资源
├── src/
│ ├── api/ # API 接口层
│ │ ├── request.ts # Axios 封装
│ │ ├── product.ts # 商品 API
│ │ ├── cart.ts # 购物车 API
│ │ ├── order.ts # 订单 API
│ │ └── user.ts # 用户 API
│ │
│ ├── components/ # 公共组件
│ │ ├── ProductCard.vue # 商品卡片
│ │ ├── CartItem.vue # 购物车项
│ │ ├── AddressSelector.vue # 地址选择
│ │ ├── PaymentMethod.vue # 支付方式
│ │ └── ReviewList.vue # 评论列表
│ │
│ ├── router/ # 路由配置
│ │ └── index.ts # 路由定义
│ │
│ ├── stores/ # Pinia 状态管理
│ │ ├── product.ts # 商品状态
│ │ ├── cart.ts # 购物车状态
│ │ ├── order.ts # 订单状态
│ │ └── user.ts # 用户状态
│ │
│ ├── types/ # TypeScript 类型
│ │ ├── cart.ts # 购物车类型
│ │ ├── product.ts # 商品类型
│ │ └── index.ts # 通用类型
│ │
│ ├── utils/ # 工具函数
│ │ ├── format.ts # 格式化工具
│ │ ├── storage.ts # 存储工具
│ │ └── validate.ts # 验证工具
│ │
│ ├── views/ # 页面组件
│ │ ├── Home.vue # 首页
│ │ ├── ProductList.vue # 商品列表
│ │ ├── ProductDetail.vue # 商品详情
│ │ ├── Cart.vue # 购物车
│ │ ├── Order.vue # 订单确认
│ │ ├── OrderList.vue # 订单列表
│ │ └── UserCenter.vue # 用户中心
│ │
│ ├── App.vue # 根组件
│ └── main.ts # 应用入口
│
├── index.html # HTML 入口
├── vite.config.ts # Vite 配置
├── tsconfig.json # TypeScript 配置
├── .env.development # 开发环境变量
├── .env.production # 生产环境变量
├── env.d.ts # 环境变量类型
├── package.json # 项目配置
└── README.md # 项目说明

````

### A.3.1 项目初始化

```bash
npm create vite@latest ecommerce-platform -- --template vue-ts
cd ecommerce-platform
npm install
npm install vue-router@4 pinia element-plus @element-plus/icons-vue
npm install @vueuse/core axios dayjs
npm install -D sass
````

### A.3.2 购物车 Store（完整版）

[src/stores/cart.ts]

```typescript
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useStorage } from "@vueuse/core";
import { ElMessage } from "element-plus";
import type { CartItem } from "@/types/cart";

export const useCartStore = defineStore("cart", () => {
  // 从本地存储加载购物车数据
  const cartItems = useStorage<CartItem[]>("cart-items", []);

  // 计算选中商品数量
  const selectedCount = computed(() => {
    return cartItems.value.filter((item) => item.selected).length;
  });

  // 计算选中商品总价
  const totalPrice = computed(() => {
    return cartItems.value
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  });

  // 计算总数量
  const totalCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  // 判断是否全选
  const isAllSelected = computed(() => {
    return (
      cartItems.value.length > 0 &&
      cartItems.value.every((item) => item.selected)
    );
  });

  // 添加到购物车
  const addToCart = (product: any, quantity: number = 1) => {
    const existingItem = cartItems.value.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      ElMessage.success(
        `已将 ${product.name} 数量增加到 ${existingItem.quantity}`
      );
    } else {
      cartItems.value.push({
        id: Date.now(),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
        selected: true,
      });
      ElMessage.success(`已将 ${product.name} 加入购物车`);
    }
  };

  // 从购物车移除
  const removeFromCart = (itemId: number) => {
    const index = cartItems.value.findIndex((item) => item.id === itemId);
    if (index > -1) {
      const removedItem = cartItems.value[index];
      cartItems.value.splice(index, 1);
      ElMessage.success(`已将 ${removedItem.name} 移出购物车`);
    }
  };

  // 更新数量
  const updateQuantity = (itemId: number, quantity: number) => {
    const item = cartItems.value.find((item) => item.id === itemId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(itemId);
      } else {
        item.quantity = quantity;
      }
    }
  };

  // 切换选中状态
  const toggleSelected = (itemId: number) => {
    const item = cartItems.value.find((item) => item.id === itemId);
    if (item) {
      item.selected = !item.selected;
    }
  };

  // 全选/取消全选
  const toggleSelectAll = (selected: boolean) => {
    cartItems.value.forEach((item) => {
      item.selected = selected;
    });
  };

  // 清空购物车
  const clearCart = () => {
    cartItems.value = [];
    ElMessage.success("购物车已清空");
  };

  // 删除选中商品
  const removeSelected = () => {
    const selectedItems = cartItems.value.filter((item) => item.selected);
    cartItems.value = cartItems.value.filter((item) => !item.selected);
    ElMessage.success(`已删除 ${selectedItems.length} 件商品`);
  };

  // 根据商品ID获取购物车项
  const getCartItemByProductId = (productId: number) => {
    return cartItems.value.find((item) => item.productId === productId);
  };

  // 检查商品是否在购物车中
  const isInCart = (productId: number) => {
    return cartItems.value.some((item) => item.productId === productId);
  };

  return {
    cartItems,
    selectedCount,
    totalPrice,
    totalCount,
    isAllSelected,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleSelected,
    toggleSelectAll,
    clearCart,
    removeSelected,
    getCartItemByProductId,
    isInCart,
  };
});
```

### A.3.3 购物车页面

[src/views/Cart.vue]

```vue
<template>
  <div class="cart-page">
    <div class="cart-container">
      <div class="cart-header">
        <h2>购物车</h2>
        <span class="item-count">共 {{ cartStore.totalCount }} 件商品</span>
      </div>

      <div v-if="cartStore.cartItems.length" class="cart-content">
        <!-- 购物车列表 -->
        <div class="cart-list">
          <div class="list-header">
            <el-checkbox v-model="allSelected" @change="handleSelectAll">
              全选
            </el-checkbox>
            <span class="header-product">商品信息</span>
            <span class="header-price">单价</span>
            <span class="header-quantity">数量</span>
            <span class="header-total">小计</span>
            <span class="header-action">操作</span>
          </div>

          <div class="list-body">
            <div
              v-for="item in cartStore.cartItems"
              :key="item.id"
              class="cart-item"
            >
              <div class="item-checkbox">
                <el-checkbox
                  v-model="item.selected"
                  @change="cartStore.toggleSelected(item.id)"
                />
              </div>

              <div class="item-product">
                <img :src="item.image" :alt="item.name" class="product-image" />
                <div class="product-info">
                  <h4 class="product-name">{{ item.name }}</h4>
                </div>
              </div>

              <div class="item-price">
                <span class="price">¥{{ item.price.toFixed(2) }}</span>
              </div>

              <div class="item-quantity">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="99"
                  @change="handleQuantityChange(item)"
                />
              </div>

              <div class="item-total">
                <span class="total"
                  >¥{{ (item.price * item.quantity).toFixed(2) }}</span
                >
              </div>

              <div class="item-action">
                <el-button text type="danger" @click="handleRemove(item.id)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 购物车底部 -->
        <div class="cart-footer">
          <div class="footer-left">
            <el-checkbox v-model="allSelected" @change="handleSelectAll">
              全选
            </el-checkbox>
            <el-button
              text
              type="danger"
              :disabled="!cartStore.selectedCount"
              @click="handleRemoveSelected"
            >
              删除选中
            </el-button>
          </div>

          <div class="footer-right">
            <div class="selected-info">
              已选择 <strong>{{ cartStore.selectedCount }}</strong> 件商品
            </div>
            <div class="total-price">
              <span class="label">合计：</span>
              <span class="price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              :disabled="!cartStore.selectedCount"
              @click="handleCheckout"
            >
              结算
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空购物车 -->
      <div v-else class="empty-cart">
        <el-empty description="购物车空空如也">
          <el-button type="primary" @click="goToShop">去逛逛</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  ElCheckbox,
  ElInputNumber,
  ElButton,
  ElEmpty,
  ElMessageBox,
  ElMessage,
} from "element-plus";
import { useCartStore } from "@/stores/cart";

const router = useRouter();
const cartStore = useCartStore();

const allSelected = computed({
  get: () => cartStore.isAllSelected,
  set: (value: boolean) => {
    cartStore.toggleSelectAll(value);
  },
});

const handleSelectAll = (selected: boolean) => {
  cartStore.toggleSelectAll(selected);
};

const handleQuantityChange = (item: any) => {
  cartStore.updateQuantity(item.id, item.quantity);
};

const handleRemove = async (itemId: number) => {
  await ElMessageBox.confirm("确定要删除这件商品吗？", "提示", {
    type: "warning",
  });
  cartStore.removeFromCart(itemId);
};

const handleRemoveSelected = async () => {
  await ElMessageBox.confirm(
    `确定要删除选中的 ${cartStore.selectedCount} 件商品吗？`,
    "提示",
    { type: "warning" }
  );
  cartStore.removeSelected();
};

const handleCheckout = () => {
  router.push("/order/confirm");
};

const goToShop = () => {
  router.push("/");
};
</script>

<style scoped lang="scss">
.cart-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px 0;
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.cart-header {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .item-count {
    color: #999;
    font-size: 14px;
  }
}

.cart-content {
  display: flex;
  flex-direction: column;
}

.cart-list {
  flex: 1;
}

.list-header {
  display: grid;
  grid-template-columns: 50px 450px 120px 150px 120px 100px;
  gap: 16px;
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.list-body {
  padding: 0;
}

.cart-item {
  display: grid;
  grid-template-columns: 50px 450px 120px 150px 120px 100px;
  gap: 16px;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;

  &:hover {
    background: #fafafa;
  }
}

.item-checkbox {
  display: flex;
  justify-content: center;
}

.item-product {
  display: flex;
  gap: 16px;

  .product-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #f0f0f0;
  }

  .product-info {
    flex: 1;

    .product-name {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin: 0 0 8px 0;
      line-height: 1.4;
    }
  }
}

.item-price {
  text-align: center;

  .price {
    font-size: 16px;
    font-weight: 600;
    color: #ff4d4f;
  }
}

.item-quantity {
  display: flex;
  justify-content: center;
}

.item-total {
  text-align: center;

  .total {
    font-size: 18px;
    font-weight: 600;
    color: #ff4d4f;
  }
}

.item-action {
  text-align: center;
}

.cart-footer {
  padding: 24px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left {
  display: flex;
  gap: 24px;
  align-items: center;
}

.footer-right {
  display: flex;
  gap: 24px;
  align-items: center;

  .selected-info {
    color: #666;
    font-size: 14px;

    strong {
      color: #ff4d4f;
      font-size: 18px;
    }
  }

  .total-price {
    .label {
      color: #666;
      font-size: 14px;
    }

    .price {
      font-size: 24px;
      font-weight: 700;
      color: #ff4d4f;
    }
  }
}

.empty-cart {
  padding: 120px 24px;
  text-align: center;
}
</style>
```

### A.3.4 商品详情页

[src/views/ProductDetail.vue]

```vue
<template>
  <div class="product-detail-page">
    <div class="detail-container">
      <!-- 面包屑 -->
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ product?.categoryName }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ product?.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 商品信息 -->
      <div v-if="product" class="product-info">
        <div class="product-gallery">
          <div class="main-image">
            <img :src="currentImage" :alt="product.name" />
          </div>
          <div class="thumbnail-list">
            <div
              v-for="(image, index) in product.images"
              :key="index"
              class="thumbnail"
              :class="{ active: currentImage === image }"
              @click="currentImage = image"
            >
              <img :src="image" :alt="product.name" />
            </div>
          </div>
        </div>

        <div class="product-main">
          <h1 class="product-name">{{ product.name }}</h1>
          <div class="product-subtitle">{{ product.subtitle }}</div>

          <div class="product-price">
            <span class="price">¥{{ product.price.toFixed(2) }}</span>
            <span v-if="product.originalPrice" class="original-price">
              ¥{{ product.originalPrice.toFixed(2) }}
            </span>
            <span v-if="product.discount" class="discount">
              {{ product.discount }}折
            </span>
          </div>

          <div class="product-sales">
            <span>月销 {{ product.monthlySales }}+</span>
            <span>评价 {{ product.reviewCount }}+</span>
            <span>收藏 {{ product.favoriteCount }}+</span>
          </div>

          <div class="product-divider"></div>

          <!-- 规格选择 -->
          <div v-if="product.specs?.length" class="product-specs">
            <div
              v-for="spec in product.specs"
              :key="spec.name"
              class="spec-group"
            >
              <div class="spec-name">{{ spec.name }}</div>
              <div class="spec-values">
                <div
                  v-for="value in spec.values"
                  :key="value"
                  class="spec-value"
                  :class="{ active: selectedSpecs[spec.name] === value }"
                  @click="selectSpec(spec.name, value)"
                >
                  {{ value }}
                </div>
              </div>
            </div>
          </div>

          <!-- 数量选择 -->
          <div class="product-quantity">
            <span class="quantity-label">数量</span>
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="product.stock"
              @change="handleQuantityChange"
            />
            <span class="stock-info">库存 {{ product.stock }} 件</span>
          </div>

          <!-- 操作按钮 -->
          <div class="product-actions">
            <el-button
              type="primary"
              size="large"
              :disabled="!canAddToCart"
              @click="handleAddToCart"
            >
              <el-icon><ShoppingCart /></el-icon>
              加入购物车
            </el-button>
            <el-button
              type="warning"
              size="large"
              :disabled="!canAddToCart"
              @click="handleBuyNow"
            >
              立即购买
            </el-button>
            <el-button size="large" @click="handleAddToFavorite">
              <el-icon><Star /></el-icon>
              收藏
            </el-button>
          </div>

          <!-- 服务承诺 -->
          <div class="product-services">
            <div
              v-for="service in services"
              :key="service"
              class="service-item"
            >
              <el-icon><CircleCheck /></el-icon>
              {{ service }}
            </div>
          </div>
        </div>
      </div>

      <!-- 商品详情 -->
      <div class="product-detail">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="detail-content" v-html="product?.detail"></div>
          </el-tab-pane>
          <el-tab-pane label="规格参数" name="specs">
            <div class="specs-table">
              <div
                v-for="(value, key) in product?.parameters"
                :key="key"
                class="spec-row"
              >
                <div class="spec-key">{{ key }}</div>
                <div class="spec-value">{{ value }}</div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="用户评价" name="reviews">
            <ReviewList :product-id="productId" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElInputNumber,
  ElButton,
  ElTabs,
  ElTabPane,
  ElMessage,
} from "element-plus";
import { ShoppingCart, Star, CircleCheck } from "@element-plus/icons-vue";
import { useProductStore } from "@/stores/product";
import { useCartStore } from "@/stores/cart";
import ReviewList from "@/components/ReviewList.vue";

const router = useRouter();
const route = useRoute();
const productStore = useProductStore();
const cartStore = useCartStore();

const productId = computed(() => Number(route.params.id));
const product = computed(() => productStore.currentProduct);

const currentImage = ref("");
const quantity = ref(1);
const selectedSpecs = ref<Record<string, string>>({});
const activeTab = ref("detail");

const services = ["正品保障", "极速退款", "七天无理由退换", "全国包邮"];

const canAddToCart = computed(() => {
  if (!product.value) return false;
  return quantity.value > 0 && quantity.value <= product.value.stock;
});

const handleQuantityChange = (value: number) => {
  if (value > product.value?.stock) {
    ElMessage.warning("库存不足");
  }
};

const selectSpec = (name: string, value: string) => {
  selectedSpecs.value[name] = value;
};

const handleAddToCart = () => {
  if (!product.value) return;
  cartStore.addToCart(product.value, quantity.value);
};

const handleBuyNow = () => {
  handleAddToCart();
  router.push("/cart");
};

const handleAddToFavorite = () => {
  ElMessage.success("已添加到收藏");
};

onMounted(async () => {
  await productStore.fetchProduct(productId.value);
  if (product.value?.images?.length) {
    currentImage.value = product.value.images[0];
  }
});
</script>

<style scoped lang="scss">
.product-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px 0;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.breadcrumb {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.product-info {
  display: grid;
  grid-template-columns: 500px 1fr;
  gap: 48px;
  padding: 48px 24px;
}

.product-gallery {
  .main-image {
    width: 100%;
    height: 500px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .thumbnail-list {
    display: flex;
    gap: 12px;

    .thumbnail {
      width: 80px;
      height: 80px;
      border: 2px solid #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;

      &:hover,
      &.active {
        border-color: #ff4d4f;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

.product-main {
  .product-name {
    font-size: 28px;
    font-weight: 600;
    color: #333;
    margin: 0 0 12px 0;
    line-height: 1.4;
  }

  .product-subtitle {
    font-size: 16px;
    color: #666;
    margin-bottom: 24px;
  }

  .product-price {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding: 20px 0;
    background: linear-gradient(to right, #fff5f5, #fff);
    border-radius: 8px;
    margin-bottom: 16px;

    .price {
      font-size: 36px;
      font-weight: 700;
      color: #ff4d4f;
    }

    .original-price {
      font-size: 18px;
      color: #999;
      text-decoration: line-through;
    }

    .discount {
      padding: 4px 12px;
      background: #ff4d4f;
      color: #fff;
      border-radius: 4px;
      font-size: 14px;
    }
  }

  .product-sales {
    display: flex;
    gap: 24px;
    color: #666;
    font-size: 14px;
    margin-bottom: 24px;
  }

  .product-divider {
    height: 1px;
    background: #f0f0f0;
    margin-bottom: 24px;
  }

  .product-specs {
    margin-bottom: 24px;

    .spec-group {
      margin-bottom: 20px;

      .spec-name {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
      }

      .spec-values {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        .spec-value {
          padding: 8px 20px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: #ff4d4f;
            color: #ff4d4f;
          }

          &.active {
            border-color: #ff4d4f;
            background: #fff5f5;
            color: #ff4d4f;
          }
        }
      }
    }
  }

  .product-quantity {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;

    .quantity-label {
      font-size: 14px;
      color: #666;
    }

    .stock-info {
      font-size: 14px;
      color: #999;
    }
  }

  .product-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;

    .el-button {
      flex: 1;
    }
  }

  .product-services {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;

    .service-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #666;

      .el-icon {
        color: #52c41a;
      }
    }
  }
}

.product-detail {
  padding: 24px;
  border-top: 1px solid #f0f0f0;

  .detail-content {
    line-height: 1.8;

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }

  .specs-table {
    .spec-row {
      display: grid;
      grid-template-columns: 120px 1fr;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;

      .spec-key {
        color: #666;
      }

      .spec-value {
        color: #333;
      }
    }
  }
}
</style>
```

[src/views/Home.vue]

```vue
<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <h2>电商平台</h2>
        </div>
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品..."
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="header-actions">
          <el-button @click="goToCart">
            <el-badge :value="cartCount" class="cart-badge">
              <el-icon><ShoppingCart /></el-icon>
            </el-badge>
          </el-button>
          <el-dropdown v-if="userStore.isLoggedIn">
            <div class="user-avatar">
              <el-avatar :size="32" :src="userStore.avatar" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToUserCenter">
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="goToOrders">
                  我的订单
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button v-else type="primary" @click="goToLogin"> 登录 </el-button>
        </div>
      </div>
    </el-header>

    <!-- 轮播图 -->
    <div class="banner-section">
      <el-carousel height="400px" :interval="5000">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <div
            class="banner-item"
            :style="{ backgroundImage: `url(${item.image})` }"
          >
            <div class="banner-content">
              <h2>{{ item.title }}</h2>
              <p>{{ item.subtitle }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 分类导航 -->
    <div class="category-section">
      <div class="section-container">
        <h3 class="section-title">商品分类</h3>
        <div class="category-grid">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            @click="goToCategory(category.id)"
          >
            <el-icon :size="40" :color="category.color">
              <component :is="category.icon" />
            </el-icon>
            <span>{{ category.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐商品 -->
    <div class="products-section">
      <div class="section-container">
        <h3 class="section-title">热门推荐</h3>
        <el-row :gutter="20" class="products-grid">
          <el-col
            v-for="product in hotProducts"
            :key="product.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <product-card :product="product" @click="goToProduct(product.id)" />
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 新品上架 -->
    <div class="products-section">
      <div class="section-container">
        <h3 class="section-title">新品上架</h3>
        <el-row :gutter="20" class="products-grid">
          <el-col
            v-for="product in newProducts"
            :key="product.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <product-card :product="product" @click="goToProduct(product.id)" />
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 底部 -->
    <el-footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>关于我们</h4>
          <p>专业的电商平台</p>
        </div>
        <div class="footer-section">
          <h4>客户服务</h4>
          <p>帮助中心</p>
          <p>售后服务</p>
        </div>
        <div class="footer-section">
          <h4>联系我们</h4>
          <p>电话: 400-123-4567</p>
          <p>邮箱: service@example.com</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 电商平台. All rights reserved.</p>
      </div>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Search, ShoppingCart } from "@element-plus/icons-vue";
import ProductCard from "@/components/ProductCard.vue";
import { useCartStore } from "@/stores/cart";
import { useUserStore } from "@/stores/user";
import { productApi } from "@/api/product";

const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();

const searchKeyword = ref("");
const banners = ref([]);
const categories = ref([]);
const hotProducts = ref([]);
const newProducts = ref([]);

const cartCount = computed(() => cartStore.totalCount);

const loadBanners = async () => {
  try {
    const response = await productApi.getBanners();
    banners.value = response.data;
  } catch (error) {
    console.error("加载轮播图失败:", error);
  }
};

const loadCategories = async () => {
  try {
    const response = await productApi.getCategories();
    categories.value = response.data;
  } catch (error) {
    console.error("加载分类失败:", error);
  }
};

const loadHotProducts = async () => {
  try {
    const response = await productApi.getHotProducts();
    hotProducts.value = response.data;
  } catch (error) {
    console.error("加载热门商品失败:", error);
  }
};

const loadNewProducts = async () => {
  try {
    const response = await productApi.getNewProducts();
    newProducts.value = response.data;
  } catch (error) {
    console.error("加载新品失败:", error);
  }
};

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchKeyword.value)}`);
  }
};

const goToCart = () => {
  router.push("/cart");
};

const goToUserCenter = () => {
  router.push("/user-center");
};

const goToOrders = () => {
  router.push("/orders");
};

const handleLogout = async () => {
  await userStore.logout();
};

const goToLogin = () => {
  router.push("/login");
};

const goToCategory = (categoryId: number) => {
  router.push(`/products?category=${categoryId}`);
};

const goToProduct = (productId: number) => {
  router.push(`/product/${productId}`);
};

onMounted(() => {
  loadBanners();
  loadCategories();
  loadHotProducts();
  loadNewProducts();
});
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 0 20px;
  }

  .logo h2 {
    margin: 0;
    color: #409eff;
    font-size: 24px;
  }

  .search-bar {
    flex: 1;
    max-width: 500px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;

    .user-avatar {
      cursor: pointer;
    }
  }
}

.banner-section {
  .banner-item {
    height: 100%;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
    }

    .banner-content {
      position: relative;
      z-index: 1;
      text-align: center;
      color: white;

      h2 {
        font-size: 48px;
        margin-bottom: 16px;
      }

      p {
        font-size: 24px;
      }
    }
  }
}

.category-section,
.products-section {
  padding: 40px 20px;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;

  .category-item {
    background: white;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    span {
      display: block;
      margin-top: 12px;
      font-size: 16px;
      color: #333;
    }
  }
}

.products-grid {
  .el-col {
    margin-bottom: 20px;
  }
}

.footer {
  background: #001529;
  color: white;
  padding: 40px 20px 20px;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-bottom: 40px;

    .footer-section {
      h4 {
        font-size: 18px;
        margin-bottom: 16px;
      }

      p {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.65);
        line-height: 2;
        margin: 0;
      }
    }
  }

  .footer-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    p {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.45);
    }
  }
}
</style>
```

[src/views/ProductList.vue]

```vue
<template>
  <div class="product-list-page">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="logo" @click="goHome">
            <h2>电商平台</h2>
          </div>
          <div class="search-bar">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索商品..."
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="header-actions">
            <el-button @click="goToCart">
              <el-badge :value="cartCount" class="cart-badge">
                <el-icon><ShoppingCart /></el-icon>
              </el-badge>
            </el-button>
            <el-dropdown v-if="userStore.isLoggedIn">
              <el-avatar :size="32" :src="userStore.avatar" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToUserCenter">
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button v-else type="primary" @click="goToLogin">
              登录
            </el-button>
          </div>
        </div>
      </el-header>

      <el-main class="main-content">
        <div class="content-container">
          <!-- 侧边栏筛选 -->
          <el-aside width="260px" class="filter-sidebar">
            <el-card>
              <template #header>
                <span>商品分类</span>
              </template>
              <el-tree
                :data="categories"
                :props="{ children: 'children', label: 'name' }"
                node-key="id"
                @node-click="handleCategoryClick"
              />
            </el-card>

            <el-card style="margin-top: 16px;">
              <template #header>
                <span>价格区间</span>
              </template>
              <el-slider
                v-model="filters.priceRange"
                range
                :min="0"
                :max="10000"
                :step="100"
                @change="handleSearch"
              />
              <div class="price-display">
                ¥{{ filters.priceRange[0] }} - ¥{{ filters.priceRange[1] }}
              </div>
            </el-card>
          </el-aside>

          <!-- 商品列表 -->
          <div class="product-list-main">
            <div class="list-header">
              <div class="sort-bar">
                <span>排序：</span>
                <el-button
                  :type="filters.sortBy === 'default' ? 'primary' : 'default'"
                  link
                  @click="handleSort('default')"
                >
                  默认
                </el-button>
                <el-button
                  :type="filters.sortBy === 'sales' ? 'primary' : 'default'"
                  link
                  @click="handleSort('sales')"
                >
                  销量
                </el-button>
                <el-button
                  :type="filters.sortBy === 'price' ? 'primary' : 'default'"
                  link
                  @click="handleSort('price')"
                >
                  价格
                </el-button>
              </div>
              <div class="result-count">共 {{ total }} 件商品</div>
            </div>

            <div v-loading="loading" class="products-grid">
              <el-empty
                v-if="!loading && products.length === 0"
                description="暂无商品"
              />
              <el-row v-else :gutter="20">
                <el-col
                  v-for="product in products"
                  :key="product.id"
                  :xs="24"
                  :sm="12"
                  :md="8"
                  :lg="6"
                >
                  <product-card
                    :product="product"
                    @click="goToProduct(product.id)"
                  />
                </el-col>
              </el-row>
            </div>

            <div v-if="products.length > 0" class="pagination-container">
              <el-pagination
                v-model:current-page="pagination.page"
                v-model:page-size="pagination.pageSize"
                :total="total"
                :page-sizes="[12, 24, 48, 96]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="loadProducts"
                @current-change="loadProducts"
              />
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Search, ShoppingCart } from "@element-plus/icons-vue";
import ProductCard from "@/components/ProductCard.vue";
import { useCartStore } from "@/stores/cart";
import { useUserStore } from "@/stores/user";
import { productApi } from "@/api/product";

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const userStore = useUserStore();

const loading = ref(false);
const products = ref([]);
const categories = ref([]);
const total = ref(0);

const filters = reactive({
  keyword: "",
  categoryId: null as number | null,
  priceRange: [0, 10000],
  sortBy: "default",
});

const pagination = reactive({
  page: 1,
  pageSize: 12,
});

const cartCount = computed(() => cartStore.totalCount);

const loadCategories = async () => {
  try {
    const response = await productApi.getCategories();
    categories.value = response.data;
  } catch (error) {
    console.error("加载分类失败:", error);
  }
};

const loadProducts = async () => {
  loading.value = true;
  try {
    const result = await productApi.getProducts({
      ...filters,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
    products.value = result.list;
    total.value = result.total;
  } catch (error) {
    console.error("加载商品失败:", error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  loadProducts();
};

const handleCategoryClick = (data: any) => {
  filters.categoryId = data.id;
  handleSearch();
};

const handleSort = (sortBy: string) => {
  filters.sortBy = sortBy;
  handleSearch();
};

const goHome = () => {
  router.push("/");
};

const goToCart = () => {
  router.push("/cart");
};

const goToUserCenter = () => {
  router.push("/user-center");
};

const handleLogout = async () => {
  await userStore.logout();
};

const goToLogin = () => {
  router.push("/login");
};

const goToProduct = (productId: number) => {
  router.push(`/product/${productId}`);
};

// 监听路由参数变化
watch(
  () => route.query,
  (query) => {
    if (query.q) {
      filters.keyword = query.q as string;
      handleSearch();
    }
    if (query.category) {
      filters.categoryId = Number(query.category);
      handleSearch();
    }
  },
  { immediate: true }
);

onMounted(() => {
  loadCategories();
  loadProducts();
});
</script>

<style scoped lang="scss">
.product-list-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 0 20px;

    .logo {
      cursor: pointer;

      h2 {
        margin: 0;
        color: #409eff;
        font-size: 24px;
      }
    }

    .search-bar {
      flex: 1;
      max-width: 500px;
    }
  }
}

.main-content {
  padding: 24px 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
  padding: 0 20px;
}

.filter-sidebar {
  flex-shrink: 0;

  .price-display {
    text-align: center;
    color: #409eff;
    font-weight: bold;
    margin-top: 12px;
  }
}

.product-list-main {
  flex: 1;

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px;
    background: white;
    border-radius: 8px;

    .sort-bar {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .result-count {
      color: #666;
    }
  }

  .products-grid {
    min-height: 400px;
  }

  .pagination-container {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
}
</style>
```

[src/views/Order.vue]

```vue
<template>
  <div class="order-page">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <el-button link @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h1>确认订单</h1>
        </div>
      </el-header>

      <el-main class="main-content">
        <div class="order-container">
          <el-row :gutter="24">
            <!-- 收货地址 -->
            <el-col :span="16">
              <el-card class="address-card">
                <template #header>
                  <div class="card-header">
                    <span>收货地址</span>
                    <el-button
                      type="primary"
                      link
                      @click="showAddressDialog = true"
                    >
                      新建地址
                    </el-button>
                  </div>
                </template>
                <div class="address-list">
                  <div
                    v-for="address in addresses"
                    :key="address.id"
                    :class="[
                      'address-item',
                      { active: selectedAddress?.id === address.id },
                    ]"
                    @click="selectAddress(address)"
                  >
                    <div class="address-info">
                      <div class="address-name">
                        {{ address.consignee }} {{ address.phone }}
                      </div>
                      <div class="address-detail">
                        {{ address.province }} {{ address.city }}
                        {{ address.district }} {{ address.detail }}
                      </div>
                    </div>
                    <el-tag
                      v-if="address.isDefault"
                      type="success"
                      size="small"
                    >
                      默认
                    </el-tag>
                  </div>
                </div>
              </el-card>

              <!-- 商品清单 -->
              <el-card class="products-card">
                <template #header>
                  <span>商品清单</span>
                </template>
                <div class="product-list">
                  <div
                    v-for="item in orderItems"
                    :key="item.productId"
                    class="product-item"
                  >
                    <img
                      :src="item.productImage"
                      :alt="item.productName"
                      class="product-image"
                    />
                    <div class="product-info">
                      <div class="product-name">{{ item.productName }}</div>
                      <div class="product-spec">{{ item.spec }}</div>
                    </div>
                    <div class="product-price">¥{{ item.price }}</div>
                    <div class="product-quantity">x{{ item.quantity }}</div>
                    <div class="product-total">
                      ¥{{ (item.price * item.quantity).toFixed(2) }}
                    </div>
                  </div>
                </div>
              </el-card>

              <!-- 支付方式 -->
              <el-card class="payment-card">
                <template #header>
                  <span>支付方式</span>
                </template>
                <el-radio-group v-model="selectedPayment">
                  <el-radio :label="'alipay'">
                    <img
                      src="@/assets/images/alipay.png"
                      alt="支付宝"
                      class="payment-icon"
                    />
                    支付宝
                  </el-radio>
                  <el-radio :label="'wechat'">
                    <img
                      src="@/assets/images/wechat.png"
                      alt="微信支付"
                      class="payment-icon"
                    />
                    微信支付
                  </el-radio>
                  <el-radio :label="'balance'">
                    <el-icon><Wallet /></el-icon>
                    余额支付
                  </el-radio>
                </el-radio-group>
              </el-card>
            </el-col>

            <!-- 订单摘要 -->
            <el-col :span="8">
              <el-card class="summary-card">
                <template #header>
                  <span>订单摘要</span>
                </template>
                <div class="summary-items">
                  <div class="summary-item">
                    <span>商品金额</span>
                    <span>¥{{ orderSummary.subtotal.toFixed(2) }}</span>
                  </div>
                  <div class="summary-item">
                    <span>运费</span>
                    <span>¥{{ orderSummary.shipping.toFixed(2) }}</span>
                  </div>
                  <div class="summary-item">
                    <span>优惠</span>
                    <span class="discount"
                      >-¥{{ orderSummary.discount.toFixed(2) }}</span
                    >
                  </div>
                  <div class="summary-item total">
                    <span>应付金额</span>
                    <span class="total-price"
                      >¥{{ orderSummary.total.toFixed(2) }}</span
                    >
                  </div>
                </div>
                <el-button
                  type="primary"
                  size="large"
                  :loading="submitting"
                  class="submit-button"
                  @click="handleSubmitOrder"
                >
                  提交订单
                </el-button>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, Wallet } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useCartStore } from "@/stores/cart";
import { orderApi } from "@/api/order";

const router = useRouter();
const cartStore = useCartStore();

const showAddressDialog = ref(false);
const submitting = ref(false);
const addresses = ref([]);
const selectedAddress = ref<any>(null);
const selectedPayment = ref("alipay");
const orderItems = ref([]);

const orderSummary = computed(() => {
  const subtotal = orderItems.value.reduce((sum: number, item: any) => {
    return sum + item.price * item.quantity;
  }, 0);
  const shipping = subtotal >= 99 ? 0 : 10;
  const discount = 0;
  return {
    subtotal,
    shipping,
    discount,
    total: subtotal + shipping - discount,
  };
});

const loadAddresses = async () => {
  try {
    const response = await orderApi.getAddresses();
    addresses.value = response.data;
    selectedAddress.value =
      addresses.value.find((a: any) => a.isDefault) || addresses.value[0];
  } catch (error) {
    console.error("加载地址失败:", error);
  }
};

const selectAddress = (address: any) => {
  selectedAddress.value = address;
};

const handleSubmitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning("请选择收货地址");
    return;
  }

  submitting.value = true;
  try {
    const order = await orderApi.createOrder({
      addressId: selectedAddress.value.id,
      paymentMethod: selectedPayment.value,
      items: orderItems.value,
    });

    ElMessage.success("订单创建成功");
    // 清空购物车
    await cartStore.clearCart();
    // 跳转到支付页面
    router.push(`/payment/${order.data.id}`);
  } catch (error) {
    console.error("创建订单失败:", error);
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.back();
};

onMounted(async () => {
  // 从购物车获取选中的商品
  orderItems.value = cartStore.selectedItems;

  if (orderItems.value.length === 0) {
    ElMessage.warning("请先选择要购买的商品");
    router.push("/cart");
    return;
  }

  await loadAddresses();
});
</script>

<style scoped lang="scss">
.order-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px;

    h1 {
      font-size: 20px;
      margin: 0;
    }
  }
}

.main-content {
  padding: 24px 0;
}

.order-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.address-card,
.products-card,
.payment-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;

  .address-item {
    padding: 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
    }

    &.active {
      border-color: #409eff;
      background: #ecf5ff;
    }

    .address-name {
      font-weight: 500;
      margin-bottom: 8px;
    }

    .address-detail {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }
  }
}

.product-list {
  .product-item {
    display: grid;
    grid-template-columns: 80px 1fr auto auto auto;
    gap: 16px;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .product-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }

    .product-info {
      .product-name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .product-spec {
        font-size: 14px;
        color: #999;
      }
    }

    .product-price,
    .product-quantity,
    .product-total {
      text-align: center;
    }
  }
}

.payment-card {
  :deep(.el-radio) {
    display: flex;
    align-items: center;
    margin-right: 24px;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;

    &:hover {
      border-color: #409eff;
    }

    &.is-checked {
      border-color: #409eff;
      background: #ecf5ff;
    }
  }

  .payment-icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }
}

.summary-card {
  position: sticky;
  top: 24px;

  .summary-items {
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;

      &.total {
        padding-top: 16px;
        border-top: 2px solid #f0f0f0;
        font-weight: bold;
        font-size: 18px;

        .total-price {
          color: #ff4d4f;
          font-size: 24px;
        }
      }

      .discount {
        color: #ff4d4f;
      }
    }
  }

  .submit-button {
    width: 100%;
    margin-top: 24px;
  }
}
</style>
```

[src/views/OrderList.vue]

```vue
<template>
  <div class="order-list-page">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <h1>我的订单</h1>
        </div>
      </el-header>

      <el-main class="main-content">
        <div class="order-list-container">
          <!-- 订单状态标签 -->
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="待付款" name="pending" />
            <el-tab-pane label="待发货" name="paid" />
            <el-tab-pane label="待收货" name="shipped" />
            <el-tab-pane label="已完成" name="completed" />
          </el-tabs>

          <!-- 订单列表 -->
          <div v-loading="loading" class="order-list">
            <el-empty
              v-if="!loading && orders.length === 0"
              description="暂无订单"
            />
            <div v-for="order in orders" :key="order.id" class="order-item">
              <div class="order-header">
                <div class="order-info">
                  <span class="order-no">订单号：{{ order.orderNo }}</span>
                  <span class="order-time">{{ order.createdAt }}</span>
                </div>
                <div class="order-status">
                  <el-tag :type="getStatusType(order.status)">
                    {{ getStatusText(order.status) }}
                  </el-tag>
                </div>
              </div>

              <div class="order-products">
                <div
                  v-for="item in order.items"
                  :key="item.id"
                  class="product-item"
                  @click="goToProduct(item.productId)"
                >
                  <img
                    :src="item.productImage"
                    :alt="item.productName"
                    class="product-image"
                  />
                  <div class="product-info">
                    <div class="product-name">{{ item.productName }}</div>
                    <div class="product-spec">{{ item.spec }}</div>
                    <div class="product-price">
                      ¥{{ item.price }} x{{ item.quantity }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="order-footer">
                <div class="order-total">
                  共 {{ getTotalQuantity(order) }} 件商品
                  <span class="total-price">¥{{ order.totalAmount }}</span>
                </div>
                <div class="order-actions">
                  <el-button
                    v-if="order.status === 'pending'"
                    type="primary"
                    @click="handlePay(order)"
                  >
                    立即付款
                  </el-button>
                  <el-button
                    v-if="order.status === 'shipped'"
                    type="primary"
                    @click="handleConfirmReceipt(order)"
                  >
                    确认收货
                  </el-button>
                  <el-button @click="goToOrderDetail(order.id)">
                    查看详情
                  </el-button>
                  <el-button
                    v-if="order.status === 'completed'"
                    @click="handleDelete(order)"
                  >
                    删除订单
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="orders.length > 0" class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              layout="total, prev, pager, next"
              @current-change="loadOrders"
            />
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { orderApi } from "@/api/order";

const router = useRouter();

const loading = ref(false);
const activeTab = ref("all");
const orders = ref([]);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: "warning",
    paid: "primary",
    shipped: "success",
    completed: "info",
    cancelled: "danger",
  };
  return map[status] || "info";
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: "待付款",
    paid: "待发货",
    shipped: "待收货",
    completed: "已完成",
    cancelled: "已取消",
  };
  return map[status] || status;
};

const getTotalQuantity = (order: any) => {
  return order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
};

const loadOrders = async () => {
  loading.value = true;
  try {
    const result = await orderApi.getOrderList({
      status: activeTab.value === "all" ? undefined : activeTab.value,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
    orders.value = result.list;
    pagination.total = result.total;
  } catch (error) {
    console.error("加载订单列表失败:", error);
  } finally {
    loading.value = false;
  }
};

const handleTabChange = () => {
  pagination.page = 1;
  loadOrders();
};

const handlePay = (order: any) => {
  router.push(`/payment/${order.id}`);
};

const handleConfirmReceipt = async (order: any) => {
  try {
    await ElMessageBox.confirm("确认已收到商品吗？", "提示", {
      type: "warning",
    });
    await orderApi.confirmReceipt(order.id);
    ElMessage.success("确认收货成功");
    loadOrders();
  } catch (error) {
    if (error !== "cancel") {
      console.error("确认收货失败:", error);
    }
  }
};

const handleDelete = async (order: any) => {
  try {
    await ElMessageBox.confirm("确定要删除这个订单吗？", "提示", {
      type: "warning",
    });
    await orderApi.deleteOrder(order.id);
    ElMessage.success("删除成功");
    loadOrders();
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除订单失败:", error);
    }
  }
};

const goToProduct = (productId: number) => {
  router.push(`/product/${productId}`);
};

const goToOrderDetail = (orderId: number) => {
  router.push(`/order-detail/${orderId}`);
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped lang="scss">
.order-list-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;

    h1 {
      font-size: 20px;
      margin: 0;
    }
  }
}

.main-content {
  padding: 24px 0;
}

.order-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.order-list {
  min-height: 400px;
}

.order-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;

    .order-info {
      display: flex;
      gap: 16px;

      .order-no {
        font-weight: 500;
        color: #333;
      }

      .order-time {
        font-size: 14px;
        color: #999;
      }
    }
  }

  .order-products {
    padding: 16px;

    .product-item {
      display: flex;
      gap: 16px;
      padding: 12px 0;
      cursor: pointer;

      &:hover {
        background: #f5f7fa;
        margin: 0 -12px;
        padding-left: 12px;
        padding-right: 12px;
      }

      .product-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
      }

      .product-info {
        flex: 1;

        .product-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .product-spec {
          font-size: 14px;
          color: #999;
          margin-bottom: 8px;
        }

        .product-price {
          color: #ff4d4f;
          font-weight: 500;
        }
      }
    }
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-top: 1px solid #f0f0f0;

    .order-total {
      font-size: 14px;
      color: #666;

      .total-price {
        margin-left: 16px;
        font-size: 20px;
        color: #ff4d4f;
        font-weight: bold;
      }
    }

    .order-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
```

[src/views/UserCenter.vue]

```vue
<template>
  <div class="user-center-page">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <h1>个人中心</h1>
        </div>
      </el-header>

      <el-main class="main-content">
        <div class="user-center-container">
          <el-row :gutter="24">
            <!-- 用户信息卡片 -->
            <el-col :span="6">
              <el-card class="user-card">
                <div class="user-avatar">
                  <el-avatar :size="100" :src="userStore.avatar" />
                  <el-button
                    type="primary"
                    size="small"
                    class="upload-btn"
                    @click="handleUploadAvatar"
                  >
                    更换头像
                  </el-button>
                </div>
                <div class="user-info">
                  <h3>{{ userStore.username }}</h3>
                  <p class="user-level">
                    <el-tag type="warning">黄金会员</el-tag>
                  </p>
                </div>
                <div class="user-stats">
                  <div class="stat-item">
                    <div class="stat-number">{{ stats.orderCount }}</div>
                    <div class="stat-label">订单数</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ stats.couponCount }}</div>
                    <div class="stat-label">优惠券</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ stats.points }}</div>
                    <div class="stat-label">积分</div>
                  </div>
                </div>
              </el-card>
            </el-col>

            <!-- 主要内容区域 -->
            <el-col :span="18">
              <el-tabs v-model="activeTab" type="border-card">
                <!-- 个人信息 -->
                <el-tab-pane label="个人信息" name="profile">
                  <el-form
                    ref="profileFormRef"
                    :model="profileForm"
                    :rules="profileRules"
                    label-width="100px"
                    class="profile-form"
                  >
                    <el-form-item label="用户名" prop="username">
                      <el-input v-model="profileForm.username" disabled />
                    </el-form-item>
                    <el-form-item label="昵称" prop="nickname">
                      <el-input v-model="profileForm.nickname" />
                    </el-form-item>
                    <el-form-item label="手机号" prop="phone">
                      <el-input v-model="profileForm.phone" />
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="profileForm.email" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="handleUpdateProfile">
                        保存修改
                      </el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <!-- 收货地址 -->
                <el-tab-pane label="收货地址" name="address">
                  <div class="address-actions">
                    <el-button type="primary" @click="showAddressDialog = true">
                      新建地址
                    </el-button>
                  </div>
                  <div class="address-list">
                    <div
                      v-for="address in addresses"
                      :key="address.id"
                      class="address-item"
                    >
                      <div class="address-info">
                        <div class="address-name">
                          {{ address.consignee }}
                          <el-tag
                            v-if="address.isDefault"
                            type="success"
                            size="small"
                          >
                            默认
                          </el-tag>
                        </div>
                        <div class="address-phone">{{ address.phone }}</div>
                        <div class="address-detail">
                          {{ address.province }} {{ address.city }}
                          {{ address.district }} {{ address.detail }}
                        </div>
                      </div>
                      <div class="address-actions">
                        <el-button
                          link
                          type="primary"
                          @click="editAddress(address)"
                        >
                          编辑
                        </el-button>
                        <el-button
                          link
                          type="danger"
                          @click="deleteAddress(address)"
                        >
                          删除
                        </el-button>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>

                <!-- 修改密码 -->
                <el-tab-pane label="修改密码" name="password">
                  <el-form
                    ref="passwordFormRef"
                    :model="passwordForm"
                    :rules="passwordRules"
                    label-width="100px"
                    class="password-form"
                  >
                    <el-form-item label="原密码" prop="oldPassword">
                      <el-input
                        v-model="passwordForm.oldPassword"
                        type="password"
                        show-password
                      />
                    </el-form-item>
                    <el-form-item label="新密码" prop="newPassword">
                      <el-input
                        v-model="passwordForm.newPassword"
                        type="password"
                        show-password
                      />
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirmPassword">
                      <el-input
                        v-model="passwordForm.confirmPassword"
                        type="password"
                        show-password
                      />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="handleUpdatePassword">
                        修改密码
                      </el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
              </el-tabs>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";
import { userApi } from "@/api/user";
import type { FormInstance, FormRules } from "element-plus";

const userStore = useUserStore();

const activeTab = ref("profile");
const showAddressDialog = ref(false);

const profileFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

const stats = ref({
  orderCount: 0,
  couponCount: 0,
  points: 0,
});

const addresses = ref([]);

const profileForm = reactive({
  username: "",
  nickname: "",
  phone: "",
  email: "",
});

const profileRules: FormRules = {
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱", trigger: "blur" },
  ],
};

const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

const loadUserProfile = async () => {
  try {
    const response = await userApi.getProfile();
    Object.assign(profileForm, response.data);
    Object.assign(stats.value, response.data.stats);
  } catch (error) {
    console.error("加载用户信息失败:", error);
  }
};

const loadAddresses = async () => {
  try {
    const response = await userApi.getAddresses();
    addresses.value = response.data;
  } catch (error) {
    console.error("加载地址失败:", error);
  }
};

const handleUploadAvatar = () => {
  ElMessage.info("头像上传功能待实现");
};

const handleUpdateProfile = async () => {
  if (!profileFormRef.value) return;

  await profileFormRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      await userApi.updateProfile(profileForm);
      ElMessage.success("保存成功");
      await userStore.fetchUserInfo();
    } catch (error: any) {
      ElMessage.error(error.message || "保存失败");
    }
  });
};

const editAddress = (address: any) => {
  console.log("编辑地址:", address);
};

const deleteAddress = async (address: any) => {
  try {
    await userApi.deleteAddress(address.id);
    ElMessage.success("删除成功");
    loadAddresses();
  } catch (error) {
    console.error("删除地址失败:", error);
  }
};

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      await userApi.updatePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      ElMessage.success("密码修改成功，请重新登录");
      // 清空表单
      passwordForm.oldPassword = "";
      passwordForm.newPassword = "";
      passwordForm.confirmPassword = "";
    } catch (error: any) {
      ElMessage.error(error.message || "修改失败");
    }
  });
};

onMounted(() => {
  loadUserProfile();
  loadAddresses();
});
</script>

<style scoped lang="scss">
.user-center-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;

    h1 {
      font-size: 20px;
      margin: 0;
    }
  }
}

.main-content {
  padding: 24px 0;
}

.user-center-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.user-card {
  text-align: center;

  .user-avatar {
    margin-bottom: 20px;

    .upload-btn {
      margin-top: 12px;
    }
  }

  .user-info {
    margin-bottom: 24px;

    h3 {
      font-size: 18px;
      margin-bottom: 8px;
    }
  }

  .user-stats {
    display: flex;
    justify-content: space-around;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;

    .stat-item {
      .stat-number {
        font-size: 20px;
        font-weight: bold;
        color: #409eff;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
      }
    }
  }
}

.address-actions {
  margin-bottom: 16px;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;

  .address-item {
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;

    .address-name {
      font-weight: 500;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .address-phone {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .address-detail {
      font-size: 14px;
      color: #999;
      line-height: 1.5;
    }

    .address-actions {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }
  }
}

.profile-form,
.password-form {
  max-width: 600px;
  padding: 20px 0;
}
</style>
```

[src/App.vue]

```vue
<template>
  <router-view />
</template>

<script setup lang="ts">
// 根组件
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
```

[src/main.ts]

```typescript
import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(pinia);
app.use(router);
app.use(ElementPlus);

app.mount("#app");
```

[vite.config.ts]

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3002,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

[tsconfig.json]

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

[.env.development]

```bash
# 开发环境配置
VITE_APP_TITLE=电商平台
VITE_APP_BASE_API=http://localhost:8080/api
VITE_APP_UPLOAD_URL=http://localhost:8080/upload
```

[.env.production]

```bash
# 生产环境配置
VITE_APP_TITLE=电商平台
VITE_APP_BASE_API=https://api.yourdomain.com
VITE_APP_UPLOAD_URL=https://api.yourdomain.com/upload
```

[env.d.ts]

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_BASE_API: string;
  readonly VITE_APP_UPLOAD_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

[package.json]

```json
{
  "name": "ecommerce-platform",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "element-plus": "^2.5.0",
    "@element-plus/icons-vue": "^2.3.0",
    "@vueuse/core": "^10.7.0",
    "axios": "^1.6.0",
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0",
    "sass": "^1.69.0"
  }
}
```

[README.md]

````markdown
# 电商平台

基于 Vue3 + TypeScript + Vite + Element Plus 构建的现代化电商平台。

## 技术栈

- **框架**: Vue 3.4+ (Composition API)
- **语言**: TypeScript 5.3+
- **构建工具**: Vite 5.0+
- **UI 库**: Element Plus 2.5+
- **状态管理**: Pinia 2.1+
- **路由**: Vue Router 4.2+
- **工具库**: @vueuse/core
- **HTTP 客户端**: Axios
- **日期处理**: Day.js

## 功能特性

### 商品功能

- ✅ 商品浏览
- ✅ 商品搜索
- ✅ 分类筛选
- ✅ 商品详情
- ✅ 购物车管理

### 订单功能

- ✅ 下单流程
- ✅ 订单管理
- ✅ 支付集成
- ✅ 物流跟踪

### 用户功能

- ✅ 用户注册/登录
- ✅ 个人中心
- ✅ 收货地址管理
- ✅ 订单历史

## 快速开始

### 安装依赖

```bash
npm install
```
````

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3002

### 构建生产

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
ecommerce-platform/
├── public/              # 静态资源
├── src/
│   ├── api/            # API接口层
│   ├── components/     # 公共组件
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia状态管理
│   ├── types/          # TypeScript类型
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.ts         # 应用入口
├── index.html
├── vite.config.ts      # Vite配置
├── tsconfig.json       # TypeScript配置
└── package.json
```

## 开发说明

### 环境配置

项目使用环境变量管理配置，主要配置文件：

- `.env.development` - 开发环境
- `.env.production` - 生产环境

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Composition API 编写组件

## 许可证

MIT License

## 作者

小徐带你飞系列教程

```

---

## 附录总结

本附录提供了三个完整的实战项目，每个项目都包含：

1. **完整的项目结构**
2. **详细的类型定义**
3. **完整的API层实现**
4. **Pinia状态管理**
5. **核心组件代码**
6. **页面组件实现**

### 学习建议

1. **循序渐进**
   - 先完成博客系统，掌握基础
   - 再做任务管理，学习复杂交互
   - 最后做电商平台，综合运用

2. **动手实践**
   - 不要只看代码
   - 自己动手实现
   - 遇到问题查文档

3. **扩展功能**
   - 在基础功能上添加新特性
   - 优化用户体验
   - 改进代码质量

4. **部署上线**
   - 学习部署流程
   - 配置域名服务器
   - 监控运行状态

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v2.0**
**作者：小徐**
**邮箱：esimonx@163.com**
```
