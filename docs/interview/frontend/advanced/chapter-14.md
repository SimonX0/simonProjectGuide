---
title: 大型实战项目经验面试题
---

# 大型实战项目经验面试题

> 本章针对文档中的14个实战项目，结合2024-2026年高频面试题，设计针对性的面试题，帮助你深入理解每个项目的技术要点和面试重点。

## 项目概览

### Vue3 技术栈实战项目（5个）

| 项目 | 技术栈 | 核心特点 |
|-----|-------|---------|
| **项目1**：Vue3 企业级后台管理系统 | Vue3 + Pinia + Element Plus | 权限系统、动态路由、数据可视化 |
| **项目2**：Vue3 企业级SaaS平台 | Vue3 + Prisma + Stripe | 多租户隔离、订阅计费、工作流引擎 |
| **项目3**：移动端+管理后台全栈应用 | uni-app + SSR + WebSocket | 跨端适配、文件上传、实时通讯 |
| **项目4**：微前端企业级应用平台 | qiankun + Vue3 | 主子通信、应用隔离、独立部署 |
| **项目5**：基于MicroApp的微电商平台 | MicroApp + Vue3 | 零侵入接入、ShadowDOM隔离 |

### React 技术栈实战项目（3个）

| 项目 | 技术栈 | 核心特点 |
|-----|-------|---------|
| **项目6**：React 19 企业级任务管理系统 | React 19 + Zustand + TanStack Query | React 19新特性、实时更新、表单处理 |
| **项目7**：React 19 + Next.js 15 现代化电商平台 | React 19 + Next.js 15 + Stripe | RSC、Server Actions、全栈开发 |
| **项目8**：React 19 实时数据可视化大屏系统 | React 19 + ECharts + WebSocket | 大屏可视化、实时数据推送、性能优化 |

### Next.js 技术栈实战项目（3个）

| 项目 | 技术栈 | 核心特点 |
|-----|-------|---------|
| **项目9**：Next.js 15 AI内容生成平台 | Next.js 15 + AI SDK | Server Components、流式响应、AI集成 |
| **项目10**：Next.js 15 企业级CMS系统 | Next.js 15 + Prisma | Headless CMS、动态路由、增量静态生成 |
| **项目11**：Next.js 15 微服务架构电商平台 | Next.js 15 + Microservices | 微服务架构、BFF、API聚合 |

### Nuxt 技术栈实战项目（3个）

| 项目 | 技术栈 | 核心特点 |
|-----|-------|---------|
| **项目12**：Nuxt 4 全栈电商后台管理系统 | Nuxt 4 + Prisma + PostgreSQL | SSR、服务端API、全栈开发 |
| **项目13**：Nuxt 4 实时协作平台 | Nuxt 4 + WebSocket + Redis | 实时协作、状态同步、在线编辑 |
| **项目14**：Nuxt 4 社交网络与内容社区平台 | Nuxt 4 + Serverless | SSG/ISR、边缘部署、性能优化 |

---

## 第一部分：Vue3 核心面试题

### 高频必问：Vue3响应式原理

**面试官最爱问的问题（2024-2026）**：

**问题**：Vue3的响应式系统相比Vue2有什么核心改进？

**参考答案**：

```javascript
// Vue2 vs Vue3 响应式对比

// ===== Vue2: Object.defineProperty =====
const Vue2Reactive = (obj) => {
  Object.keys(obj).forEach(key => {
    let value = obj[key];

    Object.defineProperty(obj, key, {
      get() {
        console.log(`获取 ${key}`);
        return value;
      },
      set(newVal) {
        console.log(`设置 ${key} = ${newVal}`);
        value = newVal;
      }
    });
  });

  return obj;
};

// 问题：
// 1. 无法监听数组索引和长度的变化
// 2. 无法监听对象属性的添加/删除
// 3. 必须遍历所有属性，性能开销大

// ===== Vue3: Proxy =====
const Vue3Reactive = (obj) => {
  return new Proxy(obj, {
    get(target, key) {
      console.log(`📥 获取 ${key}`);
      track(target, key); // 依赖收集
      return target[key];
    },

    set(target, key, value) {
      console.log(`📤 设置 ${key} = ${value}`);
      target[key] = value;
      trigger(target, key); // 触发更新
      return true;
    },

    // Vue3新增能力
    deleteProperty(target, key) {
      delete target[key];
      trigger(target, key);
      return true;
    },

    has(target, key) {
      return key in target;
    },

    ownKeys(target) {
      return Reflect.ownKeys(target);
    }
  });
};

// 依赖收集
let activeEffect = null;
const targetMap = new WeakMap();

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

  dep.add(activeEffect);
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}
```

**追问1**：Vue3为什么使用WeakMap而不是Map？

**答案**：
- **自动垃圾回收**：WeakMap的键是弱引用，不阻止垃圾回收
- **内存安全**：当对象被销毁时，WeakMap中的条目自动清除
- **防止内存泄漏**：Vue2中需要手动清理依赖，Vue3自动处理

**追问2**：ref和reactive的区别？

**答案**：

```typescript
import { ref, reactive } from 'vue';

// ref：用于基本类型，需要.value访问
const count = ref(0);
console.log(count.value); // 0
count.value++;

// reactive：用于对象类型，直接访问
const state = reactive({
  count: 0,
  name: 'Vue3'
});
console.log(state.count); // 0
state.count++;

// ref vs reactive 选择建议
// ✅ 使用 ref：基本类型、需要整体替换的对象、解构时
// ✅ 使用 reactive：深层嵌套对象、保持引用不变
```

---

### 项目一：Vue3 企业级后台管理系统

#### 面试问题 1：如何设计和实现RBAC权限系统？

**2025年高频面试题**，考察权限管理的最佳实践。

**参考答案**：

```typescript
// ===== 1. RBAC权限模型 =====
interface Permission {
  id: string;
  code: string;        // 'user:create', 'user:delete'
  name: string;
  type: 'menu' | 'button' | 'api';
  resource: string;    // 资源路径
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface User {
  id: string;
  username: string;
  roles: Role[];
  permissions: Permission[];
}

// ===== 2. Pinia权限Store =====
// stores/permission.ts
import { defineStore } from 'pinia';

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissions: [] as string[],
    roles: [] as string[],
    routes: [] as RouteRecordRaw[],
    user: null as User | null,
  }),

  getters: {
    // 判断是否有某个权限
    hasPermission: (state) => (permission: string) => {
      return state.permissions.includes(permission) ||
             state.permissions.includes('*:*'); // 超级管理员
    },

    // 判断是否有某个角色
    hasRole: (state) => (role: string) => {
      return state.roles.includes(role) ||
             state.roles.includes('admin');
    },

    // 判断是否是超级管理员
    isAdmin: (state) => {
      return state.permissions.includes('*:*') ||
             state.roles.includes('admin');
    },

    // 数据权限：只能看自己部门的数据
    dataScope: (state) => {
      if (state.isAdmin) return 'all';
      if (state.permissions.includes('data:department')) return 'department';
      return 'self';
    }
  },

  actions: {
    // 从后端加载权限
    async loadPermissions() {
      const { data } = await api.get('/user/permissions');

      this.user = data.user;
      this.permissions = data.permissions;
      this.roles = data.roles;

      // 生成动态路由
      this.routes = await this.generateRoutes(data.permissions);
    },

    // 根据权限生成路由
    async generateRoutes(permissions: string[]) {
      const { data } = await api.get('/menu/list');

      // 过滤有权限访问的菜单
      const accessibleMenus = data.filter(menu =>
        permissions.includes(menu.permission)
      );

      // 转换为路由配置
      return this.convertToRoutes(accessibleMenus);
    },

    // 刷新权限（实时生效）
    async refreshPermissions() {
      await this.loadPermissions();
      // 重新加载页面或更新视图
      window.location.reload();
    }
  }
});

// ===== 3. 权限指令 =====
// directives/permission.ts
import type { Directive, DirectiveBinding } from 'vue';
import { usePermissionStore } from '@/stores/permission';

const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const store = usePermissionStore();

    if (value && !store.hasPermission(value)) {
      // 没有权限，移除元素
      el.parentNode?.removeChild(el);
    }
  },

  // 也支持函数式调用
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const store = usePermissionStore();

    const hasPermission = value ? store.hasPermission(value) : true;
    el.style.display = hasPermission ? '' : 'none';
  }
};

export default permission;

// 使用
// <el-button v-permission="'user:create'">新增用户</el-button>

// ===== 4. 路由守卫 =====
// router/permissions.ts
import { usePermissionStore } from '@/stores/permission';

export function setupPermissions(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const permissionStore = usePermissionStore();

    // 白名单路由
    const whiteList = ['/login', '/404', '/403'];
    if (whiteList.includes(to.path)) {
      return next();
    }

    // 检查是否登录
    if (!permissionStore.user) {
      return next('/login');
    }

    // 检查路由权限
    if (to.meta.permission) {
      if (permissionStore.hasPermission(to.meta.permission as string)) {
        return next();
      } else {
        return next('/403');
      }
    }

    next();
  });
}

// ===== 5. API权限拦截 =====
// utils/request.ts
import { usePermissionStore } from '@/stores/permission';

request.interceptors.request.use((config) => {
  const permissionStore = usePermissionStore();

  // 添加权限令牌
  if (permissionStore.user) {
    config.headers['Authorization'] = `Bearer ${permissionStore.user.token}`;
  }

  return config;
});

request.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      // 权限不足
      ElMessage.error('权限不足');
      router.push('/403');
    }
    return Promise.reject(error);
  }
);
```

**面试追问**：
1. **如果权限变更，如何实现实时生效？**
   - WebSocket推送权限变更通知
   - 定时刷新权限（如每5分钟）
   - 关键操作前重新验证权限

2. **如何处理数据权限（如只能看自己部门的数据）？**
   - 后端：查询时添加 WHERE department_id = ?
   - 前端：表格列展示时过滤敏感列
   - API：响应中根据权限返回不同字段

---

### 项目二：Vue3 企业级SaaS平台

#### 面试问题 2：如何实现多租户数据隔离？

**企业级面试必问题**，考察SaaS架构设计能力。

**参考答案**：

```typescript
// ===== 1. 租户上下文管理 =====
// composables/useTenant.ts
import { computed } from 'vue';
import { useTenantStore } from '@/stores/tenant';

export function useTenant() {
  const tenantStore = useTenantStore();

  // 当前租户
  const currentTenant = computed(() => tenantStore.currentTenant);

  // 租户ID
  const tenantId = computed(() => currentTenant.value?.id);

  // 是否是租户所有者
  const isOwner = computed(() =>
    tenantStore.currentRole === 'OWNER'
  );

  // 是否是管理员
  const isAdmin = computed(() =>
    ['OWNER', 'ADMIN'].includes(tenantStore.currentRole || '')
  );

  // 切换租户
  const switchTenant = async (newTenantId: string) => {
    // 1. 清理当前租户数据
    await tenantStore.clearTenantData();

    // 2. 切换租户
    await tenantStore.switchTenant(newTenantId);

    // 3. 重新加载页面
    window.location.reload();
  };

  return {
    currentTenant,
    tenantId,
    isOwner,
    isAdmin,
    switchTenant,
  };
}

// ===== 2. API请求拦截器（自动添加租户标识）=====
// utils/request.ts
import axios from 'axios';
import { useTenantStore } from '@/stores/tenant';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const tenantStore = useTenantStore();
    const tenantId = tenantStore.currentTenant?.id;

    if (tenantId) {
      // 方式1：通过请求头传递租户ID
      config.headers['X-Tenant-ID'] = tenantId;

      // 方式2：通过URL参数传递（某些API网关要求）
      if (config.params) {
        config.params['tenantId'] = tenantId;
      } else {
        config.params = { tenantId };
      }

      // 方式3：子域名隔离（如 tenant1.app.com）
      // config.baseURL = `https://${tenantId}.app.com/api`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== 3. 路由级租户隔离 =====
// router/index.ts
const routes = [
  {
    path: '/:tenantId',  // 租户ID作为路由参数
    component: TenantLayout,
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
      },
      {
        path: 'users',
        component: Users,
        meta: { permission: 'user:read' }
      },
      // ... 其他路由
    ],
  },
  // 全局路由（登录页等）
  {
    path: '/login',
    component: Login
  }
];

// 路由守卫
router.beforeEach((to, from, next) => {
  const tenantStore = useTenantStore();

  // 提取租户ID
  const tenantId = to.params.tenantId as string;

  if (tenantId && tenantId !== tenantStore.currentTenant?.id) {
    // 切换到指定租户
    tenantStore.setCurrentTenant(tenantId);
  }

  next();
});

// ===== 4. 租户数据缓存策略 =====
// utils/tenantCache.ts
const tenantCache = new Map<string, any>();

export function getTenantCache<T>(
  tenantId: string,
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cacheKey = `${tenantId}:${key}`;
  const cached = tenantCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const promise = fetchFn();
  tenantCache.set(cacheKey, promise);

  return promise;
}

// 清除租户缓存
export function clearTenantCache(tenantId: string) {
  for (const key of tenantCache.keys()) {
    if (key.startsWith(`${tenantId}:`)) {
      tenantCache.delete(key);
    }
  }
}

// ===== 5. 数据库隔离示例（后端）=====
/*
// PostgreSQL Row Level Security (RLS)
CREATE POLICY tenant_isolation ON users
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id')::int);

// 查询时自动过滤
SET app.tenant_id = 123;
SELECT * FROM users;  -- 只返回tenant_id=123的数据

// MongoDB租户隔离
db.users.find({ tenantId: ObjectId(tenantId) });
db.users.createIndex({ tenantId: 1 });
*/
```

**面试追问**：
1. **如何防止跨租户数据访问？**
   - 后端RLS（Row Level Security）
   - API层强制校验tenant_id
   - 数据库隔离：独立数据库 vs 共享数据库

2. **租户数据如何迁移？**
   - 导出/导入工具
   - 跨租户复制功能
   - 数据脱敏处理

---

#### 面试问题 3：如何集成Stripe实现订阅计费？

**SaaS平台核心功能**，考察支付集成能力。

**参考答案**：

```typescript
// ===== 1. Stripe初始化 =====
// lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

// ===== 2. 创建支付会话 =====
// composables/useSubscription.ts
import { ref } from 'vue';
import { stripePromise } from '@/lib/stripe';
import { api } from '@/utils/request';

export function useSubscription() {
  const loading = ref(false);

  // 升级订阅
  const upgradeSubscription = async (
    planId: string,
    successUrl: string,
    cancelUrl: string
  ) => {
    loading.value = true;

    try {
      // 1. 创建Stripe Checkout Session
      const { data } = await api.post('/subscription/checkout', {
        planId,
        successUrl: `${window.location.origin}${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}${cancelUrl}`,
      });

      // 2. 跳转到Stripe Checkout页面
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (error) {
        console.error('Stripe错误:', error);
        ElMessage.error('支付跳转失败');
      }

    } catch (error) {
      console.error('订阅失败:', error);
      ElMessage.error('订阅失败，请重试');
    } finally {
      loading.value = false;
    }
  };

  // 取消订阅
  const cancelSubscription = async () => {
    loading.value = true;

    try {
      await api.post('/subscription/cancel');
      ElMessage.success('订阅已取消');

      // 刷新订阅状态
      await fetchSubscription();
    } catch (error) {
      ElMessage.error('取消订阅失败');
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    upgradeSubscription,
    cancelSubscription,
  };
}

// ===== 3. 订阅管理页面 =====
<!-- pages/subscription.vue -->
<template>
  <div class="subscription">
    <!-- 当前套餐 -->
    <el-card v-if="currentPlan">
      <h2>当前套餐：{{ currentPlan.name }}</h2>
      <p class="price">¥{{ currentPlan.price }}/月</p>

      <!-- 功能列表 -->
      <ul class="features">
        <li v-for="feature in currentPlan.features" :key="feature">
          ✓ {{ feature }}
        </li>
      </ul>

      <!-- 使用量统计 -->
      <div class="usage">
        <h3>使用量统计</h3>

        <!-- 用户数 -->
        <el-progress
          :percentage="userUsagePercentage"
          :status="isUserOverLimit ? 'exception' : 'success'"
        >
          <template #default="{ percentage }">
            {{ usage.users }} / {{ currentPlan.limits.users }} 用户
          </template>
        </el-progress>

        <!-- 存储空间 -->
        <el-progress
          :percentage="storageUsagePercentage"
          :status="isStorageOverLimit ? 'exception' : 'success'"
        >
          <template #default="{ percentage }">
            {{ formatSize(usage.storage) }} / {{ formatSize(currentPlan.limits.storage) }}
          </template>
        </el-progress>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button
          v-if="!currentPlan.cancelAtPeriodEnd"
          type="danger"
          @click="handleCancel"
          :loading="cancelLoading"
        >
          取消订阅
        </el-button>

        <el-button
          v-else
          type="primary"
          @click="handleResume"
          :loading="resumeLoading"
        >
          恢复订阅
        </el-button>

        <el-button
          type="primary"
          @click="showUpgradeDialog = true"
        >
          升级套餐
        </el-button>
      </div>
    </el-card>

    <!-- 升级对话框 -->
    <el-dialog
      v-model="showUpgradeDialog"
      title="选择套餐"
      width="80%"
    >
      <div class="plans">
        <el-card
          v-for="plan in plans"
          :key="plan.id"
          :class="['plan-card', { active: selectedPlan === plan.id }]"
          @click="selectedPlan = plan.id"
        >
          <h3>{{ plan.name }}</h3>
          <p class="price">¥{{ plan.price }}<span class="unit">/月</span></p>

          <ul class="features">
            <li v-for="feature in plan.features" :key="feature">
              ✓ {{ feature }}
            </li>
          </ul>

          <el-button
            :type="selectedPlan === plan.id ? 'primary' : 'default'"
            @click="handleUpgrade(plan.id)"
            :loading="upgrading"
            :disabled="selectedPlan === plan.id && isDowngrade"
          >
            {{ buttonText(plan) }}
          </el-button>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSubscription } from '@/composables/useSubscription';
import { useSubscriptionStore } from '@/stores/subscription';

const subscriptionStore = useSubscriptionStore();
const { loading, upgradeSubscription, cancelSubscription } = useSubscription();

const currentPlan = ref(null);
const usage = ref({ users: 25, storage: 5 * 1024 * 1024 * 1024 });
const plans = ref([]);
const selectedPlan = ref('');
const showUpgradeDialog = ref(false);
const upgrading = ref(false);
const cancelLoading = ref(false);
const resumeLoading = ref(false);

// 使用量百分比
const userUsagePercentage = computed(() => {
  if (!currentPlan.value) return 0;
  return Math.min(
    (usage.value.users / currentPlan.value.limits.users) * 100,
    100
  );
});

const storageUsagePercentage = computed(() => {
  if (!currentPlan.value) return 0;
  return Math.min(
    (usage.value.storage / currentPlan.value.limits.storage) * 100,
    100
  );
});

// 是否超限
const isUserOverLimit = computed(() => userUsagePercentage.value >= 100);
const isStorageOverLimit = computed(() => storageUsagePercentage.value >= 100);

// 按钮文本
const buttonText = (plan: any) => {
  if (selectedPlan.value === plan.id) {
    if (isDowngrade.value) return '降级';
    return '当前套餐';
  }
  return '立即订阅';
};

// 是否降级
const isDowngrade = computed(() => {
  if (!currentPlan.value) return false;
  const planPrices = { free: 0, pro: 29, enterprise: 99 };
  return planPrices[selectedPlan.value] < planPrices[currentPlan.value.id];
});

// 格式化大小
const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
};

// 升级套餐
const handleUpgrade = async (planId: string) => {
  upgrading.value = true;

  await upgradeSubscription(
    planId,
    '/subscription?success=true',
    '/subscription?cancel=true'
  );
};

// 取消订阅
const handleCancel = async () => {
  cancelLoading.value = true;
  await cancelSubscription();
  cancelLoading.value = false;
};

// 恢复订阅
const handleResume = async () => {
  resumeLoading.value = true;
  // 实现恢复逻辑
  resumeLoading.value = false;
};

onMounted(async () => {
  // 加载当前订阅
  await subscriptionStore.fetchSubscription();
  currentPlan.value = subscriptionStore.subscription;

  // 加载套餐列表
  const { data } = await api.get('/subscription/plans');
  plans.value = data;
});
</script>

// ===== 4. Stripe Webhook处理（后端）=====
/*
// server/routes/webhook.ts
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // 验证Webhook签名
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log('Webhook签名验证失败:', err.message);
    return res.status(400).send('Webhook error');
  }

  // 处理事件
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutCompleted(session);
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await handleSubscriptionDeleted(subscription);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  res.json({ received: true });
});

async function handleCheckoutCompleted(session: any) {
  // 更新用户订阅状态
  await updateSubscriptionStatus(session.customer, 'active');

  // 发送确认邮件
  await sendConfirmationEmail(session.customer_email);
}

async function handleSubscriptionDeleted(subscription: any) {
  // 标记订阅为已取消
  await markSubscriptionCancelled(subscription.customer);

  // 发送取消通知
  await sendCancellationNotification(subscription.customer);
}
*/
</script>

<style scoped>
.subscription {
  padding: 20px;
}

.plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.plan-card {
  cursor: pointer;
  transition: all 0.3s;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.plan-card.active {
  border: 2px solid #409eff;
}
</style>
```

**面试追问**：
1. **如何处理订阅续费失败？**
   - Webhook监听`invoice.payment_failed`
   - 宽限期处理（retry）
   - 降级到免费套餐
   - 发送提醒邮件

2. **如何实现试用和退款？**
   - Trial period: `subscription_trial_period_days`
   - 退款: `stripe.refunds.create()`
   - 业务逻辑限制功能

---

### 项目四：微前端企业级应用平台（qiankun）

#### 面试问题 4：qiankun如何实现主子应用通信？

**2024-2025年微前端高频面试题**，考察微前端架构设计能力。

**参考答案**：

```typescript
// ===== 1. qiankun全局状态管理 =====
// main-app/src/micro-app/global-state.ts
import { initGlobalState, MicroAppStateActions } from 'qiankun';

interface GlobalState {
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
  } | null;
  token: string;
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  notifications: Notification[];
}

const initialState: GlobalState = {
  user: null,
  token: '',
  theme: 'light',
  language: 'zh-CN',
  notifications: [],
};

// 初始化全局状态
export const { onGlobalStateChange, setGlobalState } = initGlobalState(
  initialState
);

// 监听状态变化（在主应用）
onGlobalStateChange((state, prev) => {
  console.log('全局状态变化', state, prev);

  // 同步到主应用store
  if (state.user !== prev.user) {
    // 用户登录/登出
    if (state.user) {
      // 设置认证头
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      // 清除认证
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  // 主题变化
  if (state.theme !== prev.theme) {
    document.documentElement.setAttribute('data-theme', state.theme);
  }

  // 语言变化
  if (state.language !== prev.language) {
    i18n.global.locale.value = state.language;
  }
}, true);

// ===== 2. 主应用提供Actions（方式1）=====
// main-app/src/micro-app/actions.ts
export const microActions = {
  // 用户相关
  getUserInfo() {
    return globalState.user;
  },

  updateUser(user: Partial<User>) {
    // 更新用户信息
    const updatedUser = { ...globalState.user, ...user };
    setGlobalState({ user: updatedUser });
    return updatedUser;
  },

  // 权限相关
  hasPermission(permission: string) {
    return globalState.user?.permissions?.includes(permission) || false;
  },

  hasRole(role: string) {
    return globalState.user?.roles?.includes(role) || false;
  },

  // 主题相关
  setTheme(theme: 'light' | 'dark') {
    setGlobalState({ theme });
  },

  // UI交互
  showMessage(message: { type: string; content: string }) {
    ElMessage({
      type: message.type as any,
      message: message.content,
      duration: 3000,
    });
  },

  showNotification(notification: Notification) {
    const notifications = [...globalState.notifications];
    notifications.push({
      ...notification,
      id: Date.now(),
      read: false,
    });
    setGlobalState({ notifications });
  },

  // 路由相关
  navigate(path: string) {
    window.history.pushState({}, '', path);
  },

  // 数据请求
  async fetchData(api: string, params?: any) {
    const { data } = await axios.get(api, { params });
    return data;
  },
};

// 将actions挂载到window
window.microActions = microActions;

// ===== 3. 子应用调用主应用（方式1）=====
// sub-app/src/utils/parent.ts
export function callParent<T = any>(
  action: string,
  ...args: any[]
): T | null {
  if (window.__POWERED_BY_QIANKUN__) {
    const actions = window.parent.microActions;
    if (actions && actions[action]) {
      return actions[action](...args);
    }
  }
  return null;
}

// 使用示例
export function getUserInfo() {
  return callParent('getUserInfo');
}

export function hasPermission(permission: string) {
  return callParent('hasPermission', permission);
}

export function showMessage(type: string, content: string) {
  return callParent('showMessage', { type, content });
}

// ===== 4. 子应用使用全局状态（方式2）=====
// sub-app/src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { qiankunWindow } from './utils/qiankun';

let app: any;

export async function mount(props) {
  app = createApp(App);

  // 注入qiankun提供的props
  app.provide('globalState', props.onGlobalStateChange);
  app.provide('setGlobalState', props.setGlobalState);

  // 使用全局状态
  const [globalState, setGlobalState] = props.getGlobalState?.() || [{}];

  // 监听状态变化
  props.onGlobalStateChange((state, prev) => {
    console.log('子应用收到状态变化', state, prev);
  });

  app.mount(props.container ? props.container.querySelector('#app') : '#app');
}

// 在组件中使用
// const globalState = inject('globalState');
// const setGlobalState = inject('setGlobalState');

// ===== 5. 发布订阅模式（方式3：事件总线）=====
// utils/eventBus.ts
class EventBus {
  private events: Map<string, Set<Function>> = new Map();

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }
}

const eventBus = new EventBus();

// 主应用
eventBus.on('user:login', (user) => {
  console.log('用户登录', user);
});

// 子应用
eventBus.emit('user:login', userInfo);

// ===== 6. localStorage共享（方式4）=====
// 注意：只能用于简单数据，不要用于敏感信息

// 主应用设置
localStorage.setItem('theme', 'dark');

// 子应用监听
window.addEventListener('storage', (e) => {
  if (e.key === 'theme') {
    console.log('主题变化', e.newValue);
  }
});

// ===== 7. 自定义事件通信（方式5）=====
// 主应用
window.dispatchEvent(new CustomEvent('micro-app:message', {
  detail: { type: 'update', data: { count: 1 } }
}));

// 子应用
window.addEventListener('micro-app:message', (e: CustomEvent) => {
  console.log('收到消息', e.detail);
});
```

**面试追问**：
1. **如何避免循环依赖？**
   - 明确通信方向：主→子或子→主
   - 使用事件总线解耦
   - 文档化所有通信接口

2. **如何处理通信失败的情况？**
   - 重试机制
   - 降级方案（使用localStorage）
   - 错误边界捕获

---

### 项目五：基于MicroApp的微电商平台

#### 面试问题 5：MicroApp相比qiankun有什么优势？

**2024-2025年微前端对比面试题**，考察技术选型能力。

**参考答案**：

```typescript
// ===== MicroApp vs qiankun 对比 =====

| 特性                | MicroApp（京东）           | qiankun（阿里）            |
|---------------------|---------------------------|---------------------------|
| **接入方式**         | 零侵入                    | 需要导出生命周期           |
| **实现原理**         | Web Components           | HTML Entry + JS Sandbox  |
| **样式隔离**         | ShadowDOM自动隔离         | scoped样式                |
| **JS沙箱**           | 完整沙箱                  | Proxy沙箱                 |
| **性能**             | 更快（约快40%）           | 较慢                      |
| **体积**             | 约20KB                    | 约50KB                     |
| **学习曲线**         | 更简单                    | 相对复杂                  |
| **浏览器兼容**       | Chrome/Edge/Firefox       | 更好的兼容性              |
| **社区支持**         | 快速增长                  | 成熟稳定                  |
| **生产验证**         | 京东、美团                | 阿里、字节                 |

// ===== MicroApp零侵入接入示例 =====

<!-- 主应用 -->
<template>
  <!-- 只需添加micro-app标签，子应用无需任何修改！ -->
  <micro-app
    name="product"
    url="http://localhost:3002"
    iframe
    keep-alive
    shadowDOM
    @datachange="handleDataChange"
    @created="handleAppCreated"
  />
</template>

<script setup lang="ts">
// 处理数据变化
const handleDataChange = (e: CustomEvent) => {
  console.log('收到子应用数据', e.detail);
};

// 应用创建完成
const handleAppCreated = (e: CustomEvent) => {
  console.log('子应用已加载', e.detail);
};
</script>

<!-- 子应用（完全正常的Vue3应用，无需任何特殊处理）-->
<script>
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');

// 就这样！无需导出生命周期、无需修改webpack配置！
</script>

// ===== MicroApp数据通信 =====

// 主应用向子应用发送数据
const microAppElement = document.querySelector('micro-app[name="product"]');

microAppElement.dispatch({
  eventName: 'updateData',
  payload: { count: 100 }
});

// 子应用接收数据（在子应用中）
window.addEventListener('datachange', (e: CustomEvent) => {
  const { eventName, payload } = e.detail;
  console.log('收到数据:', eventName, payload);
});

// 子应用向主应用发送数据
window.dispatchEvent(new CustomEvent('dispatch', {
  detail: {
    eventName: 'sendMessage',
    payload: { message: 'Hello from sub-app' }
  }
}));

// ===== MicroApp样式隔离 =====

<!-- 方式1：ShadowDOM（推荐）-->
<micro-app
  name="product"
  url="http://localhost:3002"
  shadowDOM
></micro-app>

<!-- 方式2：iframe沙箱 -->
<micro-app
  name="product"
  url="http://localhost:3002"
  iframe
  shadowDOM
></micro-app>

<!-- ShadowDOM特点 -->
/*
✅ 完全隔离样式
✅ 隐藏内部DOM
✅ 自动作用域CSS

⚠️ 全局样式无法穿透
⚠️ 某些事件处理受限
*/

// ===== MicroApp生命周期管理 =====

// 主应用
const appElement = document.querySelector('micro-app[name="product"]');

// 监听生命周期
appElement.addEventListener('created', (e: CustomEvent) => {
  console.log('子应用创建');
});

appElement.addEventListener('beforemount', (e: CustomEvent) => {
  console.log('子应用即将挂载');
});

appElement.addEventListener('mounted', (e: CustomEvent) => {
  console.log('子应用已挂载');
});

appElement.addEventListener('unmount', (e: CustomEvent) => {
  console.log('子应用卸载');
});

// 手动控制生命周期
appElement.start();  // 启动
appElement.unmount(); // 卸载

// ===== MicroApp预加载 =====

// 配置预加载
document.querySelectorAll('micro-app').forEach((app: any) => {
  // 预加载子应用
  app.addEventListener('created', () => {
    console.log(`${app.name} 预加载完成`);
  });
});

// ===== MicroApp路由管理 =====

// 主应用控制子应用路由
const appElement = document.querySelector('micro-app[name="product"]');

// 跳转到子应用指定路由
appElement.router.push({ path: '/detail/123' });

// 监听子应用路由变化
appElement.addEventListener('routechange', (e: CustomEvent) => {
  console.log('子应用路由变化:', e.detail);
});
```

**面试追问**：
1. **什么场景选择MicroApp？**
   - 子应用无法修改（第三方应用）
   - 需要快速接入
   - 对性能要求高
   - 团队技术栈不熟悉微前端

2. **MicroApp的局限性是什么？**
   - 浏览器兼容性（不支持IE）
   - ShadowDOM的样式限制
   - 调试相对复杂
   - 生态相对较新

---

## 第二部分：React 19 & Next.js 15 核心面试题

### 高频必问：React 19新特性

**2025年最新面试题**，考察React 19核心能力。

**问题**：React 19有哪些新特性？Actions API和useOptimistic是如何工作的？

**参考答案**：

```typescript
// ===== React 19新特性详解 =====

// ===== 1. Actions API（表单处理）=====
// 之前的方式（React 18）
function TaskForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await createTask(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// React 19 Actions（推荐）
function TaskForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createTask(formData); // 自动处理pending状态
    });
  };

  return (
    <form action={handleSubmit}>
      <input name="title" />
      <button disabled={isPending}>
        {isPending ? '提交中...' : '提交'}
      </button>
    </form>
  );
}

// ===== 2. useOptimistic（乐观更新）=====
function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, title: '学习React 19', completed: false }
  ]);

  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    tasks,
    (state, newTask) => [...state, newTask]
  );

  const addTask = async (title: string) => {
    // 1. 立即更新UI（乐观更新）
    addOptimisticTask({
      id: Date.now(),
      title,
      completed: false,
      optimistic: true // 标记为乐观更新
    });

    // 2. 后台提交
    try {
      const newTask = await api.post('/tasks', { title });

      // 3. 提交成功，替换乐观数据
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      // 4. 提交失败，回滚
      console.error('添加任务失败', error);
    }
  };

  return (
    <div>
      {optimisticTasks.map(task => (
        <div key={task.id}>
          <input
            type="checkbox"
            checked={task.completed}
            disabled={task.optimistic}
          />
          <span>{task.title}</span>
          {task.optimistic && <span>（保存中...）</span>}
        </div>
      ))}

      <button onClick={() => addTask('新任务')}>
        添加任务
      </button>
    </div>
  );
}

// ===== 3. use() Hook（读取Promise）=====
function UserProfile({ userIdPromise }: {
  userIdPromise: Promise<string>
}) {
  // React 19：直接使用use()读取Promise
  const userId = use(userIdPromise);

  return <div>User ID: {userId}</div>;
}

// 等价于React 18的Suspense + useEffect
/*
function UserProfile({ userIdPromise }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    userIdPromise.then(setUserId);
  }, [userIdPromise]);

  if (!userId) return <div>Loading...</div>;
  return <div>User ID: {userId}</div>;
}
*/

// ===== 4. ref作为prop（简化ref传递）=====
// React 18
function Parent() {
  const inputRef = useRef<HTMLInputElement>(null);

  return <Child inputRef={inputRef} />;
}

function Child({ inputRef }) {
  return <input ref={inputRef} />;
}

// React 19（更简洁）
function Parent() {
  const inputRef = useRef<HTMLInputElement>(null);

  return <Child ref={inputRef} />;
}

function Child({ ref }: { ref: Ref<HTMLInputElement> }) {
  return <input ref={ref} />;
}

// ===== 5. <Context> 作为provider（简化Context使用）=====
// React 18
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Child />
    </ThemeContext.Provider>
  );
}

// React 19
function App() {
  return (
    <ThemeContext value="dark">
      <Child />
    </ThemeContext>
  );
}

// ===== 6. useTransition（标记非紧急更新）=====
function SearchResults({ query }) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  const handleSearch = (searchQuery: string) => {
    // 标记为非紧急更新，React会优先处理其他更新
    startTransition(() => {
      const filtered = results.filter(item =>
        item.title.includes(searchQuery)
      );
      setResults(filtered);
    });
  };

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <div>搜索中...</div>}
      <ul>
        {results.map(item => <li key={item.id}>{item.title}</li>)}
      </ul>
    </div>
  );
}
```

**面试追问**：
1. **Actions和传统事件处理有什么区别？**
   - 自动pending状态管理
   - 错误处理内置
   - 更简洁的代码
   - 与Suspense配合更好

2. **useOptimistic如何处理错误回滚？**
   - catch块中回滚状态
   - 错误提示
   - 重试机制

---

### 项目六：React 19 企业级任务管理系统

#### 面试问题 6：如何使用Zustand管理状态？

**2025年状态管理高频面试题**，考察现代状态管理方案。

**参考答案**：

```typescript
// ===== Zustand核心使用 =====

// ===== 1. 创建Store =====
// stores/taskStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
  dueDate?: Date;
}

interface Filter {
  status: 'all' | 'active' | 'completed';
  assignee?: string;
  search?: string;
}

interface TaskStore {
  // 状态
  tasks: Task[];
  filter: Filter;

  // 同步actions
  setTasks: (tasks: Task[]) => void;
  setFilter: (filter: Partial<Filter>) => void;

  // 异步actions
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // getters
  filteredTasks: () => Task[];
  completedCount: () => number;
}

export const useTaskStore = create<TaskStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        tasks: [],
        filter: {
          status: 'all',
        },

        // 同步actions
        setTasks: (tasks) => set({ tasks }, false, 'setTasks'),

        setFilter: (filter) => set(
          (state) => ({ filter: { ...state.filter, ...filter } }),
          false,
          'setFilter'
        ),

        // 异步actions
        fetchTasks: async () => {
          const { data } = await api.get('/tasks');
          set({ tasks: data }, false, 'fetchTasks');
        },

        createTask: async (task) => {
          const { data } = await api.post('/tasks', task);
          set((state) => ({
            tasks: [...state.tasks, data]
          }), false, 'createTask');
        },

        updateTask: async (id, updates) => {
          const { data } = await api.patch(`/tasks/${id}`, updates);
          set((state) => ({
            tasks: state.tasks.map(task =>
              task.id === id ? { ...task, ...data } : task
            )
          }), false, 'updateTask');
        },

        deleteTask: async (id) => {
          await api.delete(`/tasks/${id}`);
          set((state) => ({
            tasks: state.tasks.filter(task => task.id !== id)
          }), false, 'deleteTask');
        },

        // getters
        filteredTasks: () => {
          const { tasks, filter } = get();

          return tasks.filter(task => {
            // 状态过滤
            if (filter.status === 'active' && task.completed) return false;
            if (filter.status === 'completed' && !task.completed) return false;

            // 负责人过滤
            if (filter.assignee && task.assignee !== filter.assignee) {
              return false;
            }

            // 搜索过滤
            if (filter.search && !task.title.includes(filter.search)) {
              return false;
            }

            return true;
          });
        },

        completedCount: () => {
          const { tasks } = get();
          return tasks.filter(t => t.completed).length;
        },
      }),
      {
        name: 'task-storage',
        // 只持久化特定字段
        partialize: (state) => ({
          filter: state.filter
        }),
      }
    )
  )
);

// ===== 2. 在组件中使用 =====
// components/TaskList.tsx
function TaskList() {
  // 方式1：使用整个store
  const { tasks, filter, setFilter, fetchTasks } = useTaskStore();

  // 方式2：选择特定字段（性能优化）
  const filteredTasks = useTaskStore(state => state.filteredTasks());
  const completedCount = useTaskStore(state => state.completedCount());

  // 方式3：使用actions
  const { createTask, deleteTask } = useTaskStore.getState();

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      {/* 过滤器 */}
      <Filter value={filter} onChange={setFilter} />

      {/* 统计 */}
      <p>已完成：{completedCount} / {filteredTasks.length}</p>

      {/* 任务列表 */}
      <ul>
        {filteredTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={deleteTask}
          />
        ))}
      </ul>
    </div>
  );
}

// ===== 3. TypeScript类型安全 =====
// stores/taskStore.ts（类型安全版本）
import { create } from 'zustand';

// 创建带类型的hooks
export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  filter: { status: 'all' },

  setTasks: (tasks) => set({ tasks }),
  setFilter: (filter) => set({ filter }),

  // 类型安全的actions
  createTask: async (task: Omit<Task, 'id'>) => {
    const { data } = await api.post<Task>('/tasks', task);
    set((state) => ({
      tasks: [...state.tasks, data]
    }));
    return data;
  },
}));

// ===== 4. 中间件使用 =====
import { devtools, persist } from 'zustand/middleware';

const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // store状态
      }),
      {
        name: 'app-storage', // localStorage key
        // 部分持久化
        partialize: (state) => ({
          user: state.user,
          settings: state.settings,
          // 不持久化临时数据
          // temp: state.temp
        }),
      }
    )
  )
);

// ===== 5. store组合（拆分store）=====
// stores/user.ts
export const createUserSlice = (set: any, get: any) => ({
  user: null,
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    set({ user: data });
  },
  logout: () => set({ user: null }),
});

// stores/task.ts
export const createTaskSlice = (set: any, get: any) => ({
  tasks: [],
  fetchTasks: async () => {
    const { data } = await api.get('/tasks');
    set({ tasks: data });
  },
});

// stores/index.ts（组合）
export const useAppStore = create((set, get) => ({
  ...createUserSlice(set, get),
  ...createTaskSlice(set, get),
}));

// ===== 6. Zustand vs Redux对比 =====

/*
| 特性           | Zustand      | Redux Toolkit |
|----------------|-------------|---------------|
| 学习曲线       | 简单         | 较复杂         |
| 样板代码       | 少           | 多            |
| TypeScript     | 原生支持     | 需要配置       |
| DevTools        | 内置         | 需要插件       |
| 持久化         | 内置中间件   | 需要插件       |
| 包体积         | ~1KB        | ~10KB         |
| 性能           | 更好         | 较好          |

选择建议：
- 小型项目：Zustand
- 中型项目：Zustand
- 大型团队：Redux Toolkit（更规范）
*/
```

**面试追问**：
1. **Zustand相比Redux有什么优势？**
   - 更简单的API
   - 更少的样板代码
   - 原生TypeScript支持
   - 更小的包体积
   - 内置DevTools和持久化

2. **如何实现状态持久化？**
   - persist中间件
   - partialize选择持久化字段
   - localStorage/sessionStorage

---

### 项目七：Next.js 15 AI内容生成平台

#### 面试问题 7：Next.js 15 Server Components如何工作？

**2025年Next.js必问题**，考察Server Components深度理解。

**参考答案**：

```typescript
// ===== Next.js 15 Server Components详解 =====

// ===== 1. Server Components vs Client Components =====

// ✅ Server Component（默认）
// app/dashboard/page.tsx
// 在服务器上渲染，不发送JavaScript到客户端
async function DashboardPage() {
  // ✅ 可以直接访问数据库
  const posts = await db.post.findMany();

  // ✅ 可以使用服务器端API
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache', // 缓存策略
  }).then(r => r.json());

  // ❌ 不能使用hooks（useState, useEffect等）
  // ❌ 不能使用浏览器API（window, document等）

  return (
    <div>
      <h1>Dashboard</h1>
      <PostList posts={posts} />
      <DataChart data={data} />
    </div>
  );
}

// ✅ Client Component（需要'use client'指令）
// app/components/InteractiveChart.tsx
'use client';

import { useState, useEffect } from 'react';

function InteractiveChart() {
  const [data, setData] = useState([]);

  // ✅ 可以使用hooks
  useEffect(() => {
    fetchData().then(setData);
  }, []);

  // ✅ 可以使用浏览器API
  const handleClick = () => {
    window.alert('Clicked!');
  };

  return (
    <div onClick={handleClick}>
      <Chart data={data} />
    </div>
  );
}

// ===== 2. Server Components最佳实践 =====

// ✅ 优先使用Server Components
// app/products/page.tsx
async function ProductsPage() {
  // 1. 数据获取（服务器端）
  const products = await db.product.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  // 2. 密钥处理（服务器端安全）
  const apiKey = process.env.API_SECRET; // ✅ 安全

  // 3. 直接文件系统访问
  const file = fs.readFileSync('./data.json', 'utf-8'); // ✅ 可以

  return (
    <div>
      <ProductList products={products} />
      <ClientComments productId="123" /> {/* 需要交互的子组件 */}
    </div>
  );
}

// ===== 3. Server Actions（Next.js 15特性）=====
// app/actions/tasks.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// 定义schema
const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export async function createTask(formData: FormData) {
  // 1. 验证数据
  const validated = CreateTaskSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
  });

  // 2. 数据库操作
  const task = await db.task.create({
    data: validated,
  });

  // 3. 重新验证缓存
  revalidatePath('/tasks');

  // 4. 返回数据
  return task;
}

// 在组件中使用Server Actions
// app/tasks/page.tsx
import { createTask } from '@/app/actions/tasks';

export default function TasksPage() {
  async function handleSubmit(formData: FormData) {
    'use server'; // 标记为Server Action

    const task = await createTask(formData);
    console.log('任务已创建:', task);
  }

  return (
    <form action={handleSubmit}>
      <input name="title" />
      <textarea name="description" />
      <button type="submit">创建任务</button>
    </form>
  );
}

// ===== 4. 流式响应（Streaming）=====
// app/api/chat/route.ts
import OpenAI from 'openai';
import { StreamingTextResponse } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const openai = new OpenAI();

  // 流式响应
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    stream: true,
  });

  return new StreamingTextResponse(stream);
}

// 客户端使用
// app/chat/page.tsx
'use client';

import { useChat } from 'ai/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role}: {message.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
        />
        <button>发送</button>
      </form>
    </div>
  );
}

// ===== 5. 混合使用Server和Client Components =====
// app/dashboard/page.tsx
import { Suspense } from 'react';
import UserStats from '@/components/UserStats'; // Server Component
import UserChart from '@/components/UserChart'; // Client Component

async function DashboardPage() {
  // 服务器端数据获取
  const user = await fetchUser();

  return (
    <div>
      <h1>欢迎，{user.name}!</h1>

      {/* Server Component */}
      <UserStats userId={user.id} />

      {/* Client Component需要Suspense边界 */}
      <Suspense fallback={<div>加载中...</div>}>
        <UserChart userId={user.id} />
      </Suspense>
    </div>
  );
}

// ===== 6. Server Components性能优化 =====

// ✅ 缓存策略
// app/products/page.tsx
export const revalidate = 3600; // 每小时重新验证

export default async function ProductsPage() {
  // 使用fetch的缓存选项
  const products = await fetch('https://api.example.com/products', {
    next: {
      revalidate: 3600, // 增量静态再生成
      tags: ['products'], // 按需重新验证
    },
  }).then(r => r.json());

  return <ProductList products={products} />;
}

// ✅ 按需重新验证
// app/actions/revalidate.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function revalidateProducts() {
  revalidateTag('products');
  revalidatePath('/products');
  return { revalidated: true };
}
```

**面试追问**：
1. **Server Components有什么优势？**
   - 减少客户端JavaScript
   - 更好的SEO
   - 更快的首屏加载
   - 安全的服务器端数据处理

2. **什么时候应该使用Client Components？**
   - 需要用户交互（点击、输入等）
   - 使用浏览器API（window, localStorage等）
   - 使用React hooks（useState, useEffect等）
   - 需要实时数据更新

---

## 第三部分：Nuxt 4 核心面试题

### 高频必问：Nuxt 4 SSR渲染原理

**问题**：Nuxt 4的SSR是如何工作的？ hydration过程是什么？

**参考答案**：

```typescript
// ===== Nuxt 4 SSR原理详解 =====

// ===== 1. SSR渲染流程 =====
/*
服务端渲染流程：
┌─────────────────────────────────────────────┐
│ 1. 客户端请求页面                               │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 2. Nuxt服务器接收请求                         │
│    - 匹配路由                                  │
│    - 获取数据（asyncData）                     │
│    - 渲染Vue组件成HTML                         │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 3. 返回HTML文档给客户端                       │
│    <!DOCTYPE html>                           │
│    <html>                                    │
│      <head>                                  │
│        <title>页面</title>                   │
│        <script>window.__NUXT__=...<script> │
│      </head>                                 │
│      <body>                                  │
│        <div id="__nuxt">                      │
│          <h1>服务端渲染的HTML</h1>           │
│        </div>                                │
│        <script>window.__NUXT__.push(...)...  │
│      </body>                                 │
│    </html>                                   │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 4. 客户端加载页面，执行Hydration（水合）       │
│    - Vue接管已渲染的DOM                       │
│    - 组件变为可交互                           │
└─────────────────────────────────────────────┘
*/

// ===== 2. asyncData获取数据 =====
// pages/dashboard.vue
<script setup lang="ts">
// Nuxt 4使用useAsyncData获取数据
const { data: user } = await useAsyncData(
  'user',
  () => $fetch('/api/user').then(r => r.json())
);

const { data: posts } = await useAsyncData(
  'posts',
  () => $fetch('/api/posts').then(r => r.json()),
  {
    // 选项
    watch: [newSource()], // 监听变化重新获取
    server: true,        // 只在服务器端执行
    default: () => []    // 默认值
  }
);

// 也可以使用useFetch（推荐）
const { data, pending, error, refresh } = await useFetch('/api/user', {
  // 查询参数
  query: { id: 123 },
  // 请求头
  headers: { 'Authorization': 'Bearer token' },
  // 缓存
  getCachedData: (key) => useNuxtData().get(key),
  setCachedData: (key, value) => useNuxtData().set(key, value),
  // 变换数据
  transform: (res) => res.data,
  // 拦截器
  onRequest({ request, options }) {
    // 请求前
  },
  onResponse({ response, options }) {
    // 响应后
  }
});
</script>

<template>
  <div>
    <h1>欢迎，{{ user?.name }}</h1>
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">错误：{{ error.message }}</div>
    <ul v-else>
      <li v-for="post in posts" :key="post.id">
        {{ post.title }}
      </li>
    </ul>

    <button @click="refresh()">刷新</button>
  </div>
</template>

// ===== 3. 服务端API Routes =====
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  // 获取查询参数
  const query = getQuery(event);

  // 获取请求头
  const headers = getHeaders(event);
  const authHeader = headers.authorization;

  // 获取请求体
  const body = await readBody(event);

  // 数据库操作
  const users = await prisma.user.findMany({
    where: {
      // 查询条件
    },
    take: query.limit ? parseInt(query.limit as string) : 10,
  });

  // 返回JSON响应
  return users;
});

// server/api/users.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // 创建用户
  const user = await prisma.user.create({
    data: body,
  });

  // 设置状态码
  setResponseStatus(event, 201);

  // 设置响应头
  setResponseHeaders(event, {
    'Content-Type': 'application/json',
  });

  return user;
});

// ===== 4. 服务端中间件 =====
// middleware/auth.ts
export default defineEventHandler((event) => {
  // 只对特定路由生效
  if (!event.node?.req?.url?.startsWith('/api/protected')) {
    return;
  }

  // 获取token
  const token = getCookie(event, 'auth_token');

  if (!token) {
    // 未登录，返回401
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  // 验证token
  try {
    const user = await verifyToken(token);

    // 将用户信息存入event.context
    event.context.user = user;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token',
    });
  }
});

// ===== 5. 服务端插件 =====
// server/plugins/prisma.ts
import prisma from '@/lib/prisma';

export default defineNuxtPlugin((nuxtApp) => {
  // 将prisma实例注入到nuxtApp
  nuxtApp.provide('prisma', prisma);
});

// 在组件中使用
// const prisma = await useNuxtData().prisma;

// ===== 6. 混合渲染模式 =====
// pages/index.vue（SSR）
<script setup lang="ts">
// 默认SSR渲染
const { data } = await useAsyncData('home', () =>
  $fetch('/api/home').then(r => r.json())
);
</script>

// pages/about.vue（SSG，静态生成）
<script setup lang="ts">
// 使用definePageMeta配置SSG
definePageMeta({
  title: 'About',
  description: 'About page',
});

// 静态数据获取
const { data } = await useAsyncData('about', () =>
  $fetch('/api/about').then(r => r.json())
);
</script>

// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true, // 全局SSR

  routeRules: {
    // 静态生成特定路由
    '/about': { isr: true },
    '/blog/**': { isr: 60 }, // ISR，每60秒重新生成

    // SPA模式
    '/app/**': { ssr: false },

    // SWR模式（先显示缓存，后台更新）
    '/api/**': { cache: { maxAge: 60 } },
  },
});

// ===== 7. Hydration优化 =====
// app.vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// 监听hydration
onMounted(() => {
  console.log('Hydration完成');
});

// 处理hydration不匹配
onErrorCaptured((err) => {
  if (err.message.includes('Hydration')) {
    console.error('Hydration错误:', err);
    // 刷新页面
    reloadNuxtApp();
  }
});
</script>

// ===== 8. 状态管理（Pinia）=====
// stores/user.ts
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.user?.name || 'Guest',
  },

  actions: {
    async login(credentials) {
      const { data } = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials,
      });

      this.user = data.user;
      this.token = data.token;

      // 保存到localStorage
      localStorage.setItem('auth_token', data.token);
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('auth_token');
    },
  },
});
```

**面试追问**：
1. **SSR、SSG、ISR有什么区别？**
   - SSR：每次请求都服务器渲染
   - SSG：构建时生成静态HTML
   - ISR：静态HTML + 定期更新

2. **如何优化SSR性能？**
   - 使用SWR模式
   - 缓存策略
   - 增量静态再生成
   - 部分SSR

---

## 面试技巧总结

### STAR法则

**Situation（情境）**：项目背景、业务场景、项目规模
**Task（任务）：你的任务是什么、目标是什么
**Action（行动）：你做了什么、采用了什么方案、遇到了什么挑战
**Result（结果）：取得了什么成果、量化指标、业务价值

### 2024-2026年高频考点

根据搜索结果，以下是必须掌握的核心知识点：

**Vue3**：
- [2026 Vue3面试题汇总](https://blog.csdn.net/weixin_46476460/article/details/145761361)
- [Vue3高频面试题总结（2025版）](https://blog.csdn.net/weixin_63454527/article/details/146172565)
- Proxy响应式原理、Composition API、性能优化

**React 19**：
- [2025最新React面试题](https://juejin.cn/post/7348651815759282226)
- [React高频面试题100题](https://zhuanlan.zhihu.com/p/1929224975224641430)
- Server Components、Actions API、useOptimistic

**Next.js 15**：
- [2025最好的Next.js面试题](https://blog.csdn.net/xibaoyu2025a/article/details/148168748)
- Server Components、App Router、Server Actions

**微前端**：
- [2024年Web前端最新10道高频Qiankun微前端面试题](https://blog.csdn.net/2301_82244509/article/details/138720587)
- [2025微前端框架全景对比](https://www.cnblogs.com/Grewer/p/19423335)
- qiankun vs MicroApp对比、沙箱隔离、主子通信

### 常见追问准备

每个项目准备好以下追问的回答：

1. **为什么选择这个技术栈？**
2. **如果重新做，你会怎么改进？**
3. **项目中最大的技术难点是什么？**
4. **你是如何优化性能的？**
5. **项目中踩过哪些坑？**

---

**参考资源**：

**Vue3面试题**：
- [2026 Vue3面试题汇总](https://blog.csdn.net/weixin_46476460/article/details/145761361)
- [Vue3高频面试题总结（2025版）](https://blog.csdn.net/weixin_63454527/article/details/146172565)

**React/Next.js面试题**：
- [2025最新React面试题](https://juejin.cn/post/7348651815759282226)
- [2025最好的Next.js面试题](https://blog.csdn.net/xibaoyu2025a/article/details/148168748)

**微前端面试题**：
- [2024年Qiankun微前端高频面试题](https://blog.csdn.net/2301_82244509/article/details/138720587)
- [2025微前端框架全景对比](https://www.cnblogs.com/Grewer/p/19423335)

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v2.0（基于14个实战项目）**
**作者：小徐**
**邮箱：esimonx@163.com**
