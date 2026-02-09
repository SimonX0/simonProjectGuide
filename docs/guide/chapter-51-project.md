---
title: Vue3 企业级实战项目2
description: Vue3 + Vite + Element Plus 企业级SaaS平台
---

# ：Vue3 完全实战项目 - 企业级SaaS平台

> **项目概述**：本项目是一个完整的企业级SaaS多租户平台，支持多租户隔离、订阅计费、数据分析、工作流引擎等企业功能。
>
> **学习目标**：
> - 掌握多租户架构的设计与实现
> - 熟练使用Vue3构建复杂的SaaS应用
> - 掌握订阅计费、权限管理、数据分析系统
> - 学会工作流引擎、报表系统、定时任务等企业功能

---

## 项目介绍

### 项目背景

本企业级SaaS平台是一个完整的B2B多租户应用，主要功能包括：

- ✅ **多租户系统**：租户隔离、数据隔离、个性化配置
- ✅ **订阅计费**：套餐管理、付费周期、Stripe集成
- ✅ **权限管理**：RBAC、动态权限、数据权限
- ✅ **工作流引擎**：流程设计、审批流、自动化任务
- ✅ **数据分析**：自定义报表、数据可视化、导出
- ✅ **通知系统**：邮件、短信、站内消息、Webhook
- ✅ **审计日志**：操作日志、数据变更记录

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **框架** | Vue | 3.4+ |
| **语言** | TypeScript | 5.x |
| **构建工具** | Vite | 5.x |
| **路由** | Vue Router | 4.x |
| **状态管理** | Pinia | 2.x |
| **UI库** | Element Plus | latest |
| **图表** | ECharts | 5.x |
| **富文本** | TipTap | latest |
| **表格** | vxe-table | 4.x |
| **工作流** | Vue Flow | latest |
| **数据库** | PostgreSQL + Prisma | latest |
| **支付** | Stripe | latest |
| **队列** | Bull + Redis | latest |

### 项目结构

```
vue-saas-platform/
├── src/
│   ├── api/                     # API 接口
│   │   ├── tenant/
│   │   ├── subscription/
│   │   ├── workflow/
│   │   └── analytics/
│   ├── components/              # 公共组件
│   │   ├── workflow/            # 工作流组件
│   │   ├── analytics/           # 数据分析组件
│   │   ├── notifications/       # 通知组件
│   │   └── settings/            # 设置组件
│   ├── composables/             # 组合式函数
│   │   ├── useTenant.ts
│   │   ├── useSubscription.ts
│   │   ├── useWorkflow.ts
│   │   └── useAnalytics.ts
│   ├── stores/                  # Pinia 状态管理
│   │   ├── tenant.ts
│   │   ├── user.ts
│   │   ├── subscription.ts
│   │   └── workflow.ts
│   ├── router/                  # 路由配置
│   │   ├── index.ts
│   │   └── guards.ts
│   ├── views/                   # 页面组件
│   │   ├── dashboard/
│   │   ├── tenant/
│   │   ├── subscription/
│   │   ├── workflow/
│   │   ├── analytics/
│   │   └── settings/
│   ├── types/                   # TypeScript 类型
│   ├── utils/                   # 工具函数
│   └── styles/                  # 样式文件
└── prisma/
    └── schema.prisma
```

---

## 数据库设计

### 1. Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 租户
model Tenant {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  logo        String?
  status      TenantStatus @default(ACTIVE)
  subscription Subscription?
  users       User[]
  workflows   Workflow[]
  datas       Dataset[]
  settings    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum TenantStatus {
  ACTIVE
  SUSPENDED
  CANCELLED
}

// 订阅
model Subscription {
  id              String         @id @default(cuid())
  tenantId        String         @unique
  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  planId          String
  status          SubscriptionStatus @default(ACTIVE)
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd Boolean  @default(false)
  stripeSubscriptionId String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  UNPAID
}

// 用户
model User {
  id          String    @id @default(cuid())
  tenantId    String
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name        String
  email       String
  role        UserRole  @default(MEMBER)
  status      UserStatus @default(ACTIVE)
  workflows   WorkflowExecution[]
  activities  Activity[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([tenantId, email])
}

enum UserRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum UserStatus {
  ACTIVE
  INVITED
  SUSPENDED
}

// 工作流
model Workflow {
  id          String              @id @default(cuid())
  tenantId    String
  tenant      Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name        String
  description String?
  status      WorkflowStatus      @default(DRAFT)
  definition  Json                // 工作流定义
  executions  WorkflowExecution[]
  triggers    Trigger[]
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}

enum WorkflowStatus {
  DRAFT
  ACTIVE
  PAUSED
  ARCHIVED
}

// 工作流执行
model WorkflowExecution {
  id          String           @id @default(cuid())
  workflowId  String
  workflow    Workflow         @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  executorId  String
  executor    User             @relation(fields: [executorId], references: [id])
  status      ExecutionStatus  @default(RUNNING)
  input       Json?
  output      Json?
  error       String?
  startedAt   DateTime         @default(now())
  completedAt DateTime?
}

enum ExecutionStatus {
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

// 触发器
model Trigger {
  id         String   @id @default(cuid())
  workflowId String
  workflow   Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  type       TriggerType
  config     Json
  enabled    Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

enum TriggerType {
  SCHEDULE
  WEBHOOK
  EVENT
}

// 数据集
model Dataset {
  id          String    @id @default(cuid())
  tenantId    String
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name        String
  schema      Json      // 数据结构定义
  records     Json      // 数据记录
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// 活动日志
model Activity {
  id          String   @id @default(cuid())
  tenantId    String
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      String
  resource    String
  resourceId  String?
  metadata    Json?
  createdAt   DateTime @default(now())

  @@index([tenantId, createdAt(sort: Desc)])
}
```

---

## 核心功能实现

### 1. 多租户系统

#### 1.1 租户上下文

```typescript
// composables/useTenant.ts
import { useTenantStore } from '@/stores/tenant'

export function useTenant() {
  const tenantStore = useTenantStore()

  const currentTenant = computed(() => tenantStore.currentTenant)
  const isOwner = computed(() => tenantStore.currentRole === 'OWNER')
  const isAdmin = computed(() =>
    ['OWNER', 'ADMIN'].includes(tenantStore.currentRole || '')
  )

  const switchTenant = async (tenantId: string) => {
    await tenantStore.switchTenant(tenantId)
    // 刷新页面以应用租户配置
    window.location.reload()
  }

  return {
    currentTenant,
    isOwner,
    isAdmin,
    switchTenant,
  }
}
```

#### 1.2 数据隔离中间件

```typescript
// src/api/middleware/tenant.ts
import { useTenantStore } from '@/stores/tenant'

export function tenantInterceptor(config: any) {
  const tenantStore = useTenantStore()
  const tenantId = tenantStore.currentTenant?.id

  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId
  }

  return config
}
```

### 2. 订阅计费系统

#### 2.1 订阅状态管理

```typescript
// stores/subscription.ts
import { defineStore } from 'pinia'
import { subscriptionApi } from '@/api/subscription'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscription: null as Subscription | null,
    usage: {
      users: 0,
      storage: 0,
      apiCalls: 0,
    },
    plans: [],
  }),

  getters: {
    isPro: (state) => state.subscription?.planId === 'pro',
    isOverLimit: (state) => (limit: keyof typeof state.usage) => {
      const planLimits = {
        free: { users: 5, storage: 1024 * 1024 * 1024, apiCalls: 1000 },
        pro: { users: 50, storage: 10 * 1024 * 1024 * 1024, apiCalls: 100000 },
        enterprise: { users: -1, storage: -1, apiCalls: -1 },
      }
      const limitValue = planLimits[state.subscription?.planId || 'free'][limit]
      return limitValue !== -1 && state.usage[limit] >= limitValue
    },
  },

  actions: {
    async fetchSubscription() {
      const { data } = await subscriptionApi.getCurrent()
      this.subscription = data
    },

    async fetchUsage() {
      const { data } = await subscriptionApi.getUsage()
      this.usage = data
    },

    async upgradePlan(planId: string) {
      const { data } = await subscriptionApi.upgrade(planId)
      this.subscription = data
    },
  },
})
```

#### 2.2 Stripe 集成

```vue
<!-- components/subscription/CheckoutForm.vue -->
<template>
  <div class="checkout-form">
    <div class="plans">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        :class="{ active: selectedPlan === plan.id }"
        @click="selectedPlan = plan.id"
      >
        <h3>{{ plan.name }}</h3>
        <div class="price">${plan.price}/月</div>
        <ul class="features">
          <li v-for="feature in plan.features" :key="feature">
            ✓ {{ feature }}
          </li>
        </ul>
      </div>
    </div>

    <el-button
      type="primary"
      @click="handleCheckout"
      :loading="loading"
      size="large"
    >
      立即订阅
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

const stripe = await loadStripe(import.meta.env.VITE_STRIPE_KEY)
const selectedPlan = ref('pro')
const loading = ref(false)

const plans = [
  {
    id: 'free',
    name: '免费版',
    price: 0,
    features: ['5个用户', '1GB存储', '1000次API调用'],
  },
  {
    id: 'pro',
    name: '专业版',
    price: 29,
    features: ['50个用户', '10GB存储', '100000次API调用', '高级功能'],
  },
  {
    id: 'enterprise',
    name: '企业版',
    price: 99,
    features: ['无限用户', '无限存储', '无限API调用', '专属支持'],
  },
]

const handleCheckout = async () => {
  loading.value = true

  try {
    const { data } = await axios.post('/api/subscription/checkout', {
      planId: selectedPlan.value,
    })

    const { error } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    })

    if (error) {
      console.error(error)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
```

### 3. 工作流引擎

#### 3.1 工作流设计器

```vue
<!-- components/workflow/WorkflowDesigner.vue -->
<template>
  <div class="workflow-designer">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :default-viewport="{ zoom: 1.5, x: 0, y: 0 }"
      :min-zoom="0.2"
      :max-zoom="4"
    >
      <Background />
      <Controls />
      <MiniMap />

      <!-- 自定义节点 -->
      <template #node-start="data">
        <StartNode v-bind="data" />
      </template>

      <template #node-action="data">
        <ActionNode v-bind="data" />
      </template>

      <template #node-condition="data">
        <ConditionNode v-bind="data" />
      </template>

      <template #node-end="data">
        <EndNode v-bind="data" />
      </template>
    </VueFlow>

    <div class="toolbar">
      <el-button @click="addNode('action')">添加动作</el-button>
      <el-button @click="addNode('condition')">添加条件</el-button>
      <el-button type="primary" @click="saveWorkflow">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { Background, Controls, MiniMap } from '@vue-flow/addons'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const nodes = ref([
  { id: '1', type: 'start', position: { x: 0, y: 0 }, data: { label: '开始' } },
])

const edges = ref([])

const addNode = (type: string) => {
  const newNode = {
    id: Date.now().toString(),
    type,
    position: { x: Math.random() * 500, y: Math.random() * 500 },
    data: { label: `${type}节点` },
  }
  nodes.value.push(newNode)
}

const saveWorkflow = async () => {
  const definition = {
    nodes: nodes.value,
    edges: edges.value,
  }

  await workflowApi.update(props.workflowId, { definition })
}
</script>

<style scoped>
.workflow-designer {
  height: calc(100vh - 200px);
  position: relative;
}

.toolbar {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  gap: 10px;
}
</style>
```

#### 3.2 工作流执行器

```typescript
// lib/workflow/executor.ts
export class WorkflowExecutor {
  async execute(workflow: Workflow, input: any) {
    const context = {
      input,
      variables: {},
      results: {},
    }

    try {
      // 解析工作流定义
      const definition = workflow.definition

      // 执行开始节点
      const startNode = definition.nodes.find((n: any) => n.type === 'start')
      await this.executeNode(startNode, context)

      // 执行后续节点
      let currentNode = startNode
      while (currentNode) {
        const nextNodeId = this.findNextNode(currentNode, definition.edges, context)
        if (!nextNodeId) break

        currentNode = definition.nodes.find((n: any) => n.id === nextNodeId)
        await this.executeNode(currentNode, context)
      }

      // 记录执行结果
      await this.saveExecution(workflow.id, context)

      return context.results
    } catch (error) {
      await this.saveExecution(workflow.id, context, error)
      throw error
    }
  }

  private async executeNode(node: any, context: any) {
    switch (node.type) {
      case 'action':
        await this.executeAction(node.data, context)
        break
      case 'condition':
        return this.evaluateCondition(node.data, context)
      case 'end':
        context.results = node.data.output
        break
    }
  }

  private async executeAction(action: any, context: any) {
    // 执行动作（发送API、发送邮件等）
    const { type, config } = action

    switch (type) {
      case 'api':
        const response = await axios.post(config.url, context.variables)
        context.variables[config.outputKey] = response.data
        break
      case 'email':
        await emailService.send({
          to: config.to,
          subject: config.subject,
          body: this.renderTemplate(config.body, context),
        })
        break
    }
  }

  private evaluateCondition(condition: any, context: any) {
    const { field, operator, value } = condition
    const actualValue = context.variables[field]

    switch (operator) {
      case 'equals':
        return actualValue === value
      case 'greaterThan':
        return actualValue > value
      case 'lessThan':
        return actualValue < value
      default:
        return false
    }
  }
}
```

### 4. 数据分析系统

#### 4.1 报表设计器

```vue
<!-- components/analytics/ReportDesigner.vue -->
<template>
  <div class="report-designer">
    <el-form :model="report" label-width="120px">
      <el-form-item label="报表名称">
        <el-input v-model="report.name" />
      </el-form-item>

      <el-form-item label="数据源">
        <el-select v-model="report.datasetId">
          <el-option
            v-for="dataset in datasets"
            :key="dataset.id"
            :label="dataset.name"
            :value="dataset.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="图表类型">
        <el-select v-model="report.chartType">
          <el-option label="柱状图" value="bar" />
          <el-option label="折线图" value="line" />
          <el-option label="饼图" value="pie" />
          <el-option label="表格" value="table" />
        </el-select>
      </el-form-item>

      <el-form-item label="维度">
        <el-select v-model="report.dimensions" multiple>
          <el-option
            v-for="field in fields"
            :key="field.name"
            :label="field.label"
            :value="field.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="指标">
        <el-select v-model="report.metrics" multiple>
          <el-option
            v-for="field in fields.filter(f => f.type === 'number')"
            :key="field.name"
            :label="field.label"
            :value="field.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="generateReport">生成报表</el-button>
        <el-button @click="saveReport">保存</el-button>
      </el-form-item>
    </el-form>

    <!-- 报表预览 -->
    <div class="report-preview">
      <ReportViewer :report="report" :data="reportData" />
    </div>
  </div>
</template>

<script setup lang="ts">
const report = ref({
  name: '',
  datasetId: '',
  chartType: 'bar',
  dimensions: [],
  metrics: [],
})

const reportData = ref([])

const generateReport = async () => {
  const { data } = await analyticsApi.generateReport(report.value)
  reportData.value = data
}
</script>
```

#### 4.2 自定义仪表盘

```vue
<!-- components/analytics/Dashboard.vue -->
<template>
  <div class="dashboard">
    <grid-layout
      v-model:layout="layout"
      :col-num="12"
      :row-height="30"
      :is-draggable="true"
      :is-resizable="true"
    >
      <grid-item
        v-for="item in layout"
        :key="item.i"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :min-w="3"
        :min-h="3"
      >
        <div class="widget">
          <component :is="getWidgetComponent(item.type)" v-bind="item.config" />
        </div>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script setup lang="ts">
import { GridLayout, GridItem } from 'vue-grid-layout'

const layout = ref([
  { x: 0, y: 0, w: 4, h: 4, i: '1', type: 'stat', config: { title: '总用户数', value: 1234 } },
  { x: 4, y: 0, w: 4, h: 4, i: '2', type: 'stat', config: { title: '活跃用户', value: 567 } },
  { x: 8, y: 0, w: 4, h: 4, i: '3', type: 'stat', config: { title: '总收入', value: '$12,345' } },
  { x: 0, y: 4, w: 6, h: 6, i: '4', type: 'chart', config: { type: 'line', title: '用户增长' } },
  { x: 6, y: 4, w: 6, h: 6, i: '5', type: 'chart', config: { type: 'bar', title: '收入统计' } },
])
</script>
```

### 5. 通知系统

```typescript
// composables/useNotification.ts
export function useNotification() {
  const notifications = ref<Notification[]>([])

  const subscribe = () => {
    // WebSocket 连接
    const ws = new WebSocket(`${WS_URL}/notifications`)

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      notifications.value.unshift(notification)

      // 显示浏览器通知
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon,
        })
      }
    }
  }

  const markAsRead = async (id: string) => {
    await notificationsApi.markRead(id)
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value[index].read = true
    }
  }

  return {
    notifications,
    subscribe,
    markAsRead,
  }
}
```

---

## 性能优化

### 1. 懒加载

```typescript
// router/index.ts
const routes = [
  {
    path: '/workflow',
    component: () => import('@/views/workflow/Index.vue'),
    children: [
      {
        path: 'designer',
        component: () => import('@/views/workflow/Designer.vue'),
      },
    ],
  },
]
```

### 2. 虚拟滚动

```vue
<template>
  <el-virtual-list
    :data="largeData"
    :item-size="50"
    :component="ItemComponent"
  />
</template>
```

### 3. 缓存策略

```typescript
// utils/cache.ts
const cache = new Map()

export async function cachedFetch<T>(key: string, fn: () => Promise<T>, ttl = 60000) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }

  const data = await fn()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}
```

---

## 项目总结

本项目涵盖了企业级SaaS平台开发的核心技能：

✅ **技术栈**：Vue3 + TypeScript + Vite + Pinia + Element Plus
✅ **核心功能**：多租户、订阅计费、工作流、数据分析
✅ **企业特性**：权限管理、审计日志、通知系统
✅ **最佳实践**：数据隔离、性能优化、安全设计

通过这个项目，你将掌握：
- 多租户SaaS架构设计
- 订阅计费系统实现
- 工作流引擎开发
- 数据分析与报表系统
- 企业级应用的最佳实践

---

## 下一步学习

- [第53章：微前端架构（qiankun集成）](/guide/chapter-29)
- [第54章：前端监控与埋点](/guide/chapter-36)
- [第55章：Vite插件开发](/guide/chapter-38)
