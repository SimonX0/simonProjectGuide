---
title: Vue3 企业级实战项目3
description: Vue3 移动端 + 管理后台全栈应用
---

# ：Vue3 完全实战项目 - 移动端+管理后台全栈应用

> **项目概述**：本项目是一个包含移动端应用（H5/小程序）和管理后台的完整全栈解决方案，涵盖 uni-app 跨端开发、Vite SSR、文件上传、实时通讯等功能。
>
> **学习目标**：
> - 掌握 uni-app 跨端应用开发（H5/小程序/App）
> - 熟练使用 Vue3 SSR 服务端渲染
> - 掌握文件上传、图片处理、实时通讯
> - 学会移动端适配、性能优化、打包发布

---

## 项目介绍

### 项目背景

本项目是一个完整的前后端分离应用，包含：

- ✅ **移动端应用**：H5页面、微信小程序、支付宝小程序
- ✅ **管理后台**：完整的后台管理系统
- ✅ **SSR服务端渲染**：SEO优化、首屏加速
- ✅ **文件系统**：上传、裁剪、压缩、CDN
- ✅ **实时通讯**：WebSocket、消息推送
- ✅ **支付功能**：微信支付、支付宝支付
- ✅ **分享功能**：社交分享、海报生成

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **前端框架** | Vue | 3.4+ |
| **跨端框架** | uni-app | latest |
| **SSR框架** | Nuxt.js / Vite SSR | latest |
| **管理后台** | Vue3 + Element Plus | latest |
| **状态管理** | Pinia | 2.x |
| **UI库** | uni-ui / Element Plus | latest |
| **后端框架** | Node.js + Koa | latest |
| **数据库** | MySQL + Prisma | latest |
| **缓存** | Redis | latest |
| **存储** | OSS / COS | latest |
| **支付** | 微信支付 / 支付宝 | latest |

### 项目结构

```
fullstack-app/
├── mobile/                       # 移动端（uni-app）
│   ├── pages/                    # 页面
│   │   ├── index/
│   │   ├── product/
│   │   ├── cart/
│   │   └── user/
│   ├── components/               # 组件
│   ├── store/                    # 状态管理
│   ├── utils/                    # 工具函数
│   ├── static/                   # 静态资源
│   └── manifest.json             # 应用配置
├── admin/                        # 管理后台（Vue3）
│   ├── src/
│   │   ├── views/                # 页面
│   │   ├── components/           # 组件
│   │   ├── api/                  # API
│   │   └── stores/               # 状态管理
│   └── package.json
├── server/                       # 后端服务
│   ├── src/
│   │   ├── controllers/          # 控制器
│   │   ├── services/             # 服务层
│   │   ├── models/               # 数据模型
│   │   ├── middlewares/          # 中间件
│   │   ├── routes/               # 路由
│   │   └── utils/                # 工具函数
│   └── package.json
└── ssr/                          # SSR应用
    ├── pages/                    # 页面
    ├── components/               # 组件
    └── server/                   # 服务端
```

---

## 移动端开发（uni-app）

### 1. 项目配置

```json
// mobile/manifest.json
{
  "name": "商城",
  "appid": "__UNI__XXXXXX",
  "description": "移动端商城应用",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,
  "app-plus": {
    "usingComponents": true,
    "nvueStyleCompiler": "uni-app",
    "compilerVersion": 3,
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    }
  },
  "quickapp": {},
  "mp-weixin": {
    "appid": "wx1234567890",
    "setting": {
      "urlCheck": false
    },
    "usingComponents": true
  },
  "mp-alipay": {
    "usingComponents": true
  },
  "mp-baidu": {
    "usingComponents": true
  },
  "h5": {
    "title": "商城",
    "domain": "",
    "router": {
      "mode": "hash",
      "base": "./"
    }
  }
}
```

### 2. 页面开发

```vue
<!-- mobile/pages/index/index.vue -->
<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <uni-search-bar
        v-model="keyword"
        placeholder="搜索商品"
        :focus="false"
        :show-action="false"
        @confirm="handleSearch"
      />
    </view>

    <!-- 轮播图 -->
    <swiper class="banner" :indicator-dots="true" :autoplay="true" :interval="3000">
      <swiper-item v-for="(item, index) in banners" :key="index">
        <image :src="item.image" mode="aspectFill" @tap="handleBannerTap(item)" />
      </swiper-item>
    </swiper>

    <!-- 分类导航 -->
    <view class="categories">
      <scroll-view scroll-x class="scroll-view">
        <view class="category-item" v-for="cat in categories" :key="cat.id" @tap="handleCategoryTap(cat)">
          <image :src="cat.icon" mode="aspectFit" />
          <text>{{ cat.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 商品列表 -->
    <view class="product-list">
      <view
        class="product-item"
        v-for="product in products"
        :key="product.id"
        @tap="handleProductTap(product)"
      >
        <image :src="product.image" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ product.name }}</text>
          <view class="bottom">
            <text class="price">¥{{ product.price }}</text>
            <text class="sales">已售{{ product.sales }}件</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <uni-load-more :status="loadStatus" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'

const keyword = ref('')
const banners = ref([])
const categories = ref([])
const products = ref([])
const page = ref(1)
const loadStatus = ref('more')

// 获取轮播图
const fetchBanners = async () => {
  const { data } = await uni.request({
    url: '/api/banners',
    method: 'GET',
  })
  banners.value = data
}

// 获取分类
const fetchCategories = async () => {
  const { data } = await uni.request({
    url: '/api/categories',
    method: 'GET',
  })
  categories.value = data
}

// 获取商品列表
const fetchProducts = async () => {
  loadStatus.value = 'loading'
  const { data } = await uni.request({
    url: '/api/products',
    method: 'GET',
    data: { page: page.value },
  })

  if (page.value === 1) {
    products.value = data.list
  } else {
    products.value.push(...data.list)
  }

  if (data.list.length < 10) {
    loadStatus.value = 'noMore'
  } else {
    loadStatus.value = 'more'
  }
}

// 搜索
const handleSearch = () => {
  page.value = 1
  products.value = []
  fetchProducts()
}

// 触底加载
onReachBottom(() => {
  if (loadStatus.value === 'noMore') return
  page.value++
  fetchProducts()
})

// 下拉刷新
onPullDownRefresh(() => {
  page.value = 1
  products.value = []
  Promise.all([fetchBanners(), fetchCategories(), fetchProducts()]).then(() => {
    uni.stopPullDownRefresh()
  })
})

onMounted(() => {
  fetchBanners()
  fetchCategories()
  fetchProducts()
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
}

.banner {
  height: 350rpx;
  image {
    width: 100%;
    height: 100%;
  }
}

.categories {
  background: #fff;
  padding: 20rpx 0;

  .scroll-view {
    white-space: nowrap;
  }

  .category-item {
    display: inline-block;
    width: 140rpx;
    text-align: center;
    margin-right: 20rpx;

    image {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
    }

    text {
      display: block;
      font-size: 24rpx;
      margin-top: 10rpx;
    }
  }
}

.product-list {
  padding: 20rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;

  .product-item {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;

    image {
      width: 100%;
      height: 340rpx;
    }

    .info {
      padding: 20rpx;

      .name {
        font-size: 28rpx;
        font-weight: bold;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10rpx;

        .price {
          color: #ff4d4f;
          font-size: 32rpx;
          font-weight: bold;
        }

        .sales {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}
</style>
```

### 3. 文件上传组件

```vue
<!-- mobile/components/upload-image.vue -->
<template>
  <view class="upload-image">
    <view class="image-list">
      <view class="image-item" v-for="(img, index) in imageList" :key="index">
        <image :src="img" mode="aspectFill" />
        <view class="delete" @tap="handleDelete(index)">×</view>
      </view>
      <view class="upload-btn" v-if="imageList.length < maxCount" @tap="handleChoose">
        <text class="icon">+</text>
        <text class="text">上传图片</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string[]
  maxCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 9,
})

const emit = defineEmits(['update:modelValue'])

const imageList = ref<string[]>(props.modelValue)

const handleChoose = () => {
  uni.chooseImage({
    count: props.maxCount - imageList.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      uploadImages(res.tempFilePaths)
    },
  })
}

const uploadImages = async (files: string[]) => {
  uni.showLoading({ title: '上传中...' })

  for (const file of files) {
    try {
      const uploadTask = uni.uploadFile({
        url: '/api/upload',
        filePath: file,
        name: 'file',
      })

      const res = await new Promise((resolve) => {
        uploadTask.onProgressUpdate((e) => {
          console.log('上传进度', e.progress)
        })
        uploadTask.onComplete((e: any) => {
          resolve(JSON.parse(e.data))
        })
      })

      imageList.value.push(res.data.url)
    } catch (error) {
      uni.showToast({ title: '上传失败', icon: 'none' })
    }
  }

  uni.hideLoading()
  emit('update:modelValue', imageList.value)
}

const handleDelete = (index: number) => {
  imageList.value.splice(index, 1)
  emit('update:modelValue', imageList.value)
}
</script>

<style lang="scss" scoped>
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;

  image {
    width: 100%;
    height: 100%;
    border-radius: 8rpx;
  }

  .delete {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    width: 40rpx;
    height: 40rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
  }
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ddd;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;

  .icon {
    font-size: 60rpx;
  }

  .text {
    font-size: 24rpx;
    margin-top: 10rpx;
  }
}
</style>
```

---

## SSR服务端渲染

### 1. Nuxt.js SSR

```typescript
// ssr/nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: 'vercel',
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  app: {
    head: {
      title: '商城',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'SEO描述' },
      ],
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/product/**': { isr: 3600 },
  },
})
```

### 2. 服务端数据获取

```vue
<!-- ssr/pages/product/[id].vue -->
<template>
  <div v-if="product">
    <h1>{{ product.name }}</h1>
    <p>{{ product.description }}</p>
    <span>¥{{ product.price }}</span>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// 服务端获取数据
const { data: product } = await useFetch(`/api/products/${route.params.id}`)

// SEO设置
useHead({
  title: product.value?.name,
  meta: [
    { name: 'description', content: product.value?.description },
    { property: 'og:title', content: product.value?.name },
    { property: 'og:image', content: product.value?.image },
  ],
})
</script>
```

---

## 后端服务

### 1. Koa 框架搭建

```typescript
// server/src/app.ts
import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { PrismaClient } from '@prisma/client'

export const createApp = () => {
  const app = new Koa()
  const router = new Router()
  const prisma = new PrismaClient()

  // 中间件
  app.use(cors())
  app.use(bodyParser())
  app.use(async (ctx, next) => {
    ctx.prisma = prisma
    await next()
  })

  // 路由
  router.get('/api/products', async (ctx) => {
    const products = await ctx.prisma.product.findMany()
    ctx.body = { data: products }
  })

  router.get('/api/products/:id', async (ctx) => {
    const product = await ctx.prisma.product.findUnique({
      where: { id: ctx.params.id },
    })
    ctx.body = product
  })

  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}
```

### 2. 文件上传

```typescript
// server/src/controllers/upload.ts
import OSS from 'ali-oss'
import formidable from 'formidable'

const client = new OSS({
  region: 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: 'my-bucket',
})

export const upload = async (ctx: any) => {
  const form = formidable({ multiples: true })

  const [fields, files] = await form.parse(ctx.req)

  const result = []

  for (const file of Object.values(files)) {
    const filename = `${Date.now()}-${file.originalFilename}`
    await client.put(filename, file.filepath)
    result.push({
      url: client.signatureUrl(filename),
      filename,
    })
  }

  ctx.body = { data: result }
}
```

### 3. 支付接口

```typescript
// server/src/controllers/payment.ts
import AlipaySdk from 'alipay-sdk'
import WechatPay from 'wechat-pay-node'

const alipay = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID,
  privateKey: process.env.ALIPAY_PRIVATE_KEY,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
})

export const createPayment = async (ctx: any) => {
  const { orderId, amount, payMethod } = ctx.request.body

  if (payMethod === 'alipay') {
    const result = alipay.sdkExec('alipay.trade.create', {
      out_trade_no: orderId,
      total_amount: amount,
      subject: '商品购买',
    })
    ctx.body = { data: result }
  } else if (payMethod === 'wechat') {
    // 微信支付
  }
}

export const handleCallback = async (ctx: any) => {
  // 处理支付回调
}
```

### 4. WebSocket 实时通讯

```typescript
// server/src/websocket.ts
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws, req) => {
  const userId = req.url.split('?userId=')[1]

  ws.on('message', async (message) => {
    const data = JSON.parse(message.toString())

    // 广播消息
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data))
      }
    })
  })

  ws.on('close', () => {
    console.log('User disconnected:', userId)
  })
})
```

---

## 管理后台

### 1. 商品管理

```vue
<!-- admin/src/views/product/List.vue -->
<template>
  <div class="product-list">
    <el-page-header @back="goBack" content="商品管理" />

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">添加商品</el-button>
      <el-button @click="handleImport">批量导入</el-button>
    </div>

    <el-table :data="products" v-loading="loading">
      <el-table-column prop="image" label="图片" width="100">
        <template #default="{ row }">
          <el-image :src="row.image" :preview-src-list="[row.image]" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="stock" label="库存" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button link @click="handleEdit(row)">编辑</el-button>
          <el-button link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="total"
      @current-change="fetchProducts"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const products = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchProducts = async () => {
  loading.value = true
  const { data } = await api.get('/admin/products', {
    params: { page: page.value, pageSize: pageSize.value },
  })
  products.value = data.list
  total.value = data.total
  loading.value = false
}

onMounted(() => {
  fetchProducts()
})
</script>
```

---

## 性能优化

### 1. 图片懒加载

```vue
<template>
  <image :src="imageSrc" lazy-load mode="aspectFill" />
</template>
```

### 2. 长列表优化

```vue
<template>
  <recycle-list :list="longList" :item-height="100">
    <template #default="{ item }">
      <view class="list-item">{{ item.name }}</view>
    </template>
  </recycle-list>
</template>
```

### 3. 缓存策略

```typescript
// server/src/middleware/cache.ts
import Redis from 'ioredis'

const redis = new Redis()

export const cache = () => async (ctx: any, next: any) => {
  const key = ctx.request.url

  const cached = await redis.get(key)
  if (cached) {
    ctx.body = JSON.parse(cached)
    return
  }

  await next()

  if (ctx.status === 200) {
    await redis.setex(key, 3600, JSON.stringify(ctx.body))
  }
}
```

---

## 打包发布

### 1. 小程序打包

```bash
# 微信小程序
npm run build:mp-weixin

# 支付宝小程序
npm run build:mp-alipay
```

### 2. H5打包

```bash
npm run build:h5
```

### 3. App打包

使用 HBuilderX 进行云打包或本地打包。

---

## 项目总结

本项目涵盖了Vue3全栈开发的完整技能：

✅ **技术栈**：Vue3 + uni-app + Nuxt.js + Koa
✅ **核心功能**：移动端、管理后台、SSR、文件上传
✅ **企业特性**：支付集成、实时通讯、性能优化
✅ **最佳实践**：跨端开发、服务端渲染、全栈架构

通过这个项目，你将掌握：
- uni-app跨端应用开发
- Vue3 SSR服务端渲染
- 文件上传与处理
- 移动端支付集成
- WebSocket实时通讯
- 全栈应用架构设计

---

## 下一步学习

- [第54章：Electron桌面应用开发](/guide/chapter-33)
- [第55章：前端安全防护](/guide/chapter-30)
- [第56章：前端测试](/guide/chapter-31)
