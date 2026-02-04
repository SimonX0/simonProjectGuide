# uni-app跨端应用开发完全指南

## uni-app跨端应用开发完全指南
> **学习目标**：掌握uni-app跨端开发技术，一次编写多端运行
> **核心内容**：uni-app基础、环境搭建、组件开发、API使用、跨端发布

### uni-app简介

#### 什么是uni-app

**uni-app** 是一个使用 Vue.js 开发所有前端应用的框架，开发者编写一套代码，可发布到iOS、Android、Web（响应式）、以及各种小程序（微信/支付宝/百度/头条/QQ/钉钉/淘宝）、快应用等多个平台。

```
┌─────────────────────────────────────────────────────────────────┐
│                    uni-app 架构概览                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  uni-app 应用层                            │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Vue.js 语法  │  组件系统  │  API  │  路由  │  状态管理   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  uni-app 框架层                           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  条件编译  │  跨端处理  │  性能优化  │  插件机制          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    多端运行时                              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Web │ 微信小程序 │ App │ 支付宝 │ ...                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### uni-app核心优势

| 特性 | 说明 |
|------|------|
| **一套代码** | 编译到多个平台，减少重复开发 |
| **Vue生态** | 完整使用Vue.js语法，上手快 |
| **组件丰富** | 内置大量跨端组件和API |
| **性能优秀** | 原生渲染，接近原生应用性能 |
| **插件市场** | 丰富的UI插件和功能插件 |
| **社区活跃** | DCloud官方维护，社区庞大 |

#### uni-app vs 其他跨端方案

| 框架 | 技术栈 | 支持平台 | 性能 | 开发体验 |
|------|--------|----------|------|----------|
| **uni-app** | Vue.js | 12+ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Taro** | React/Vue | 6+ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Flutter** | Dart | 6+ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **React Native** | React | 2+ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

#### uni-app适用场景

✅ **推荐使用：**
- 需要同时开发小程序和App的项目
- 中小型跨端应用
- Vue技术栈团队
- 电商、展示类应用
- 企业内部应用

❌ **不推荐使用：**
- 复杂的图形渲染应用
- 需要调用大量原生API的应用
- 对性能要求极高的游戏类应用

---

### 环境搭建与项目初始化

#### 安装HBuilderX

**HBuilderX** 是DCloud官方推出的IDE，对uni-app有最好的支持。

```bash
# 下载HBuilderX
# 官网: https://www.dcloud.io/hbuilderx.html

# 选择版本:
# - App开发版: 支持App云打包和真机运行
# - 标准版: 仅支持小程序和H5
```

**HBuilderX安装配置：**

```
安装后配置:
1. 文件 → 设置 → 配置
2. 配置常用路径：
   - 微信开发者工具路径
   - Node.js路径
3. 安装插件：
   - uni-app编译器
   - uni-app小程序
   - App真机运行
```

#### 创建uni-app项目

**方式一：HBuilderX可视化创建**

```
1. 文件 → 新建 → 项目
2. 选择 uni-app
3. 模板选择:
   - uni-app默认模板
   - Vue3/Vite版本（推荐）
4. 项目名称: my-uniapp
5. 创建
```

**方式二：Vue3/Vite CLI创建**

```bash
# 安装Vue3/Vite版uni-app
npx degit dcloudio/uni-preset-vue#vite my-uniapp

# 进入项目
cd my-uniapp

# 安装依赖
npm install

# 运行项目
npm run dev:h5        # H5
npm run dev:mp-weixin # 微信小程序
npm run dev:app       # App
```

#### 项目结构

```
my-uniapp/
├── pages/                  # 页面目录
│   ├── index/
│   │   └── index.vue      # 首页
│   └── user/
│       └── user.vue       # 用户页
├── static/                # 静态资源
│   ├── images/
│   └── fonts/
├── uni_modules/           # uni-app插件目录
├── components/           # 组件目录
│   └── my-component/
│       └── my-component.vue
├── api/                  # API接口
├── store/                # 状态管理
├── utils/                # 工具函数
├── App.vue               # 应用配置
├── main.js               # 入口文件
├── manifest.json         # 应用配置
├── pages.json            # 页面路由配置
└── uni.scss              # 全局样式变量
```

#### 配置文件详解

**manifest.json - 应用配置**

```json
{
  "name": "我的应用",
  "appid": "__UNI__XXXXXX",
  "description": "应用描述",
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
    },
    "modules": {},
    "distribute": {
      "android": {
        "permissions": []
      },
      "ios": {},
      "sdkConfigs": {}
    }
  },
  "quickapp": {},
  "mp-weixin": {
    "appid": "",
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
  "mp-toutiao": {
    "usingComponents": true
  },
  "h5": {
    "title": "我的应用",
    "domain": "",
    "router": {
      "mode": "hash",
      "base": "./"
    }
  }
}
```

**pages.json - 页面路由配置**

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "enablePullDownRefresh": false
      }
    },
    {
      "path": "pages/user/user",
      "style": {
        "navigationBarTitleText": "我的",
        "navigationStyle": "custom"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "uni-app",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "static/tab-home.png",
        "selectedIconPath": "static/tab-home-active.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/user/user",
        "iconPath": "static/tab-user.png",
        "selectedIconPath": "static/tab-user-active.png",
        "text": "我的"
      }
    ]
  },
  "uniIdRouter": {}
}
```

---

### 基础组件与API

#### 常用内置组件

**视图容器类组件**

```vue
<template>
  <view class="container">
    <!-- view 类似于 div -->
    <view class="box">视图容器</view>

    <!-- scroll-view 可滚动视图 -->
    <scroll-view
      scroll-y
      style="height: 200px;"
      @scrolltoupper="onScrollToUpper"
      @scrolltolower="onScrollToLower"
    >
      <view v-for="i in 20" :key="i" class="item">item {{ i }}</view>
    </scroll-view>

    <!-- swiper 轮播图 -->
    <swiper
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :duration="1000"
      @change="onSwiperChange"
    >
      <swiper-item v-for="(item, index) in banners" :key="index">
        <image :src="item.url" mode="aspectFill"></image>
      </swiper-item>
    </swiper>

    <!-- movable-area 可拖动区域 -->
    <movable-area style="height: 200px; width: 100%;">
      <movable-view :x="x" :y="y" direction="all">
        可拖动
      </movable-view>
    </movable-area>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const banners = ref([
  { url: '/static/banner1.jpg' },
  { url: '/static/banner2.jpg' }
])

const x = ref(100)
const y = ref(100)

function onScrollToUpper() {
  console.log('滚动到顶部')
}

function onScrollToLower() {
  console.log('滚动到底部')
}

function onSwiperChange(e) {
  console.log('当前索引:', e.detail.current)
}
</script>
```

**基础内容组件**

```vue
<template>
  <view>
    <!-- text 文本 -->
    <text> selectable 可选本文本</text>
    <text space="ensp">字  间  距</text>

    <!-- rich-text 富文本 -->
    <rich-text :nodes="htmlNodes"></rich-text>

    <!-- progress 进度条 -->
    <progress percent="20" show-info stroke-width="6" />

    <!-- icon 图标 -->
    <icon type="success" size="30" color="#007aff" />
  </view>
</template>

<script setup>
const htmlNodes = '<div style="text-align:center;"><img src="https://example.com/image.png"><p>富文本内容</p></div>'
</script>
```

**表单组件**

```vue
<template>
  <view class="form">
    <!-- button 按钮 -->
    <button type="primary" @click="handleClick">主要按钮</button>
    <button type="default" plain>镂空按钮</button>
    <button type="warn" size="mini">警告按钮</button>

    <!-- input 输入框 -->
    <input
      v-model="formData.username"
      placeholder="请输入用户名"
      type="text"
      @confirm="onInputConfirm"
    />

    <!-- textarea 多行输入 -->
    <textarea
      v-model="formData.desc"
      placeholder="请输入描述"
      maxlength="200"
      @input="onTextareaInput"
    />

    <!-- radio 单选 -->
    <radio-group @change="onRadioChange">
      <label v-for="item in radioItems" :key="item.value">
        <radio :value="item.value" :checked="item.value === formData.radio" />
        {{ item.name }}
      </label>
    </radio-group>

    <!-- checkbox 复选 -->
    <checkbox-group @change="onCheckboxChange">
      <label v-for="item in checkboxItems" :key="item.value">
        <checkbox
          :value="item.value"
          :checked="formData.checklist.includes(item.value)"
        />
        {{ item.name }}
      </label>
    </checkbox-group>

    <!-- switch 开关 -->
    <switch :checked="formData.switch" @change="onSwitchChange" />

    <!-- slider 滑块 -->
    <slider
      :value="formData.slider"
      @change="onSliderChange"
      show-value
    />

    <!-- picker 选择器 -->
    <picker
      mode="selector"
      :range="selectorRange"
      @change="onPickerChange"
    >
      <view>当前选择: {{ selectorRange[selectorIndex] }}</view>
    </picker>

    <!-- switch 开关 -->
    <switch checked @change="switchChange" />
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'

const formData = reactive({
  username: '',
  desc: '',
  radio: 'male',
  checklist: [],
  switch: false,
  slider: 50
})

const radioItems = [
  { value: 'male', name: '男' },
  { value: 'female', name: '女' }
]

const checkboxItems = [
  { value: 'apple', name: '苹果' },
  { value: 'banana', name: '香蕉' },
  { value: 'orange', name: '橘子' }
]

const selectorRange = ['选项1', '选项2', '选项3']
const selectorIndex = ref(0)

function handleClick() {
  uni.showToast({
    title: '按钮被点击',
    icon: 'success'
  })
}

function onInputConfirm(e) {
  console.log('输入确认:', e.detail.value)
}

function onTextareaInput(e) {
  console.log('输入内容:', e.detail.value)
}

function onRadioChange(e) {
  formData.radio = e.detail.value
}

function onCheckboxChange(e) {
  formData.checklist = e.detail.value
}

function onSwitchChange(e) {
  formData.switch = e.detail.value
}

function onSliderChange(e) {
  formData.slider = e.detail.value
}

function onPickerChange(e) {
  selectorIndex.value = e.detail.value
}

function switchChange(e) {
  console.log('开关状态:', e.detail.value)
}
</script>
```

#### 常用API

**网络请求API**

```javascript
// uni.request 发起网络请求
uni.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  data: {
    id: 1
  },
  header: {
    'Authorization': 'Bearer token'
  },
  success: (res) => {
    console.log('请求成功:', res.data)
  },
  fail: (err) => {
    console.error('请求失败:', err)
  }
})

// async/await 方式
async function fetchData() {
  try {
    const res = await uni.request({
      url: 'https://api.example.com/data',
      method: 'GET'
    })
    console.log('数据:', res.data)
  } catch (err) {
    console.error('错误:', err)
  }
}

// uni.uploadFile 上传文件
uni.uploadFile({
  url: 'https://api.example.com/upload',
  filePath: tempFilePath,
  name: 'file',
  formData: {
    user: 'test'
  },
  success: (res) => {
    const data = JSON.parse(res.data)
    console.log('上传成功:', data.url)
  }
})

// uni.downloadFile 下载文件
uni.downloadFile({
  url: 'https://example.com/file.pdf',
  success: (res) => {
    if (res.statusCode === 200) {
      console.log('下载成功:', res.tempFilePath)
    }
  }
})
```

**数据缓存API**

```javascript
// uni.setStorage 异步存储
uni.setStorage({
  key: 'userInfo',
  data: {
    name: '张三',
    age: 25
  },
  success: () => {
    console.log('存储成功')
  }
})

// uni.getStorage 异步获取
uni.getStorage({
  key: 'userInfo',
  success: (res) => {
    console.log('获取的数据:', res.data)
  }
})

// 同步存储
try {
  uni.setStorageSync('token', 'abc123')
  const token = uni.getStorageSync('token')
  console.log('token:', token)
} catch (e) {
  console.error('存储失败')
}

// uni.removeStorage 删除
uni.removeStorage({
  key: 'userInfo',
  success: () => {
    console.log('删除成功')
  }
})

// uni.clearStorage 清空所有
uni.clearStorage()
```

**路由跳转API**

```javascript
// uni.navigateTo 保留当前页面，跳转到应用内的某个页面
uni.navigateTo({
  url: '/pages/detail/detail?id=1&name=uniapp'
})

// uni.redirectTo 关闭当前页面，跳转到应用内的某个页面
uni.redirectTo({
  url: '/pages/login/login'
})

// uni.reLaunch 关闭所有页面，打开到应用内的某个页面
uni.reLaunch({
  url: '/pages/index/index'
})

// uni.switchTab 跳转到tabBar页面，并关闭其他所有非tabBar页面
uni.switchTab({
  url: '/pages/index/index'
})

// uni.navigateBack 返回上一页面或多级页面
uni.navigateBack({
  delta: 1
})

// 获取页面参数
onLoad((options) => {
  console.log('页面参数:', options.id, options.name)
})
```

**界面交互API**

```javascript
// uni.showToast 显示消息提示框
uni.showToast({
  title: '操作成功',
  icon: 'success',
  duration: 2000
})

// uni.hideToast 隐藏提示框
uni.hideToast()

// uni.showLoading 显示loading提示框
uni.showLoading({
  title: '加载中...'
})

// uni.hideLoading 隐藏loading
uni.hideLoading()

// uni.showModal 显示模态对话框
uni.showModal({
  title: '提示',
  content: '确定要删除吗？',
  success: (res) => {
    if (res.confirm) {
      console.log('用户点击确定')
    } else if (res.cancel) {
      console.log('用户点击取消')
    }
  }
})

// uni.showActionSheet 显示操作菜单
uni.showActionSheet({
  itemList: ['拍照', '从相册选择'],
  success: (res) => {
    console.log('选中了第' + (res.tapIndex + 1) + '个按钮')
  },
  fail: (res) => {
    console.log('用户取消')
  }
})
```

#### 条件编译

**使用条件编译实现跨端差异化**

```vue
<template>
  <view>
    <!-- #ifdef H5 -->
    <view>H5平台显示</view>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <view>微信小程序显示</view>
    <!-- #endif -->

    <!-- #ifdef APP-PLUS -->
    <view>App显示</view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view>除了H5平台都显示</view>
    <!-- #endif -->
  </view>
</template>

<script setup>
// 条件编译
// #ifdef H5
console.log('这是H5平台的代码')
// #endif

// #ifdef MP-WEIXIN
console.log('这是微信小程序的代码')
// #endif

// #ifdef APP-PLUS
console.log('这是App的代码')
// #endif

function getPlatformInfo() {
  // #ifdef H5
  return 'H5'
  // #endif

  // #ifdef MP-WEIXIN
  return '微信小程序'
  // #endif

  // #ifdef APP-PLUS
  return 'App'
  // #endif
}
</script>

<style>
/* 条件编译样式 */
/* #ifdef H5 */
.h5-only {
  color: red;
}
/* #endif */

/* #ifdef MP-WEIXIN */
.mp-only {
  color: green;
}
/* #endif */
</style>
```

**API条件编译**

```javascript
// 获取系统信息
function getSystemInfo() {
  // #ifdef APP-PLUS
  return plus.device.model
  // #endif

  // #ifdef H5
  return navigator.userAgent
  // #endif

  // #ifdef MP-WEIXIN
  const res = uni.getSystemInfoSync()
  return res.model
  // #endif
}
```

---

### 组件开发

#### 创建组件

**组件定义**

```vue
<!-- components/user-card/user-card.vue -->
<template>
  <view class="user-card" @click="onClick">
    <image class="avatar" :src="user.avatar" mode="aspectFill" />
    <view class="info">
      <text class="name">{{ user.name }}</text>
      <text class="desc">{{ user.desc }}</text>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({
      avatar: '',
      name: '',
      desc: ''
    })
  }
})

const emit = defineEmits(['click'])

function onClick() {
  emit('click', props.user)
}
</script>

<style scoped>
.user-card {
  display: flex;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.info {
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name {
  font-size: 32rpx;
  font-weight: bold;
}

.desc {
  font-size: 28rpx;
  color: #999;
  margin-top: 10rpx;
}
</style>
```

**使用组件**

```vue
<template>
  <view>
    <user-card
      :user="userData"
      @click="handleUserClick"
    />
  </view>
</template>

<script setup>
import UserCard from '@/components/user-card/user-card.vue'

const userData = {
  avatar: '/static/avatar.png',
  name: '张三',
  desc: '前端开发工程师'
}

function handleUserClick(user) {
  console.log('点击了用户:', user)
}
</script>
```

#### 插槽使用

```vue
<!-- components/popup/popup.vue -->
<template>
  <view class="popup" v-if="show" @click="close">
    <view class="popup-content" @click.stop>
      <view class="header">
        <text>{{ title }}</text>
        <text class="close" @click="close">×</text>
      </view>
      <view class="body">
        <slot name="content">
          默认内容
        </slot>
      </view>
      <view class="footer">
        <slot name="footer">
          <button @click="close">关闭</button>
        </slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: Boolean,
  title: String
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<!-- 使用组件 -->
<template>
  <view>
    <button @click="showPopup = true">显示弹窗</button>

    <popup :show="showPopup" title="提示" @close="showPopup = false">
      <template #content>
        <view>这是自定义内容</view>
      </template>
      <template #footer>
        <button @click="confirm">确定</button>
      </template>
    </popup>
  </view>
</template>
```

---

### 状态管理

#### 使用Pinia（Vue3）

**安装配置**

```bash
npm install pinia
```

```javascript
// store/index.js
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
```

**定义Store**

```javascript
// store/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: ''
  }),

  getters: {
    isLogin: (state) => !!state.token
  },

  actions: {
    setUserInfo(info) {
      this.userInfo = info
    },

    setToken(token) {
      this.token = token
      // 持久化
      uni.setStorageSync('token', token)
    },

    async login(params) {
      try {
        const res = await uni.request({
          url: '/api/login',
          method: 'POST',
          data: params
        })

        this.setToken(res.data.token)
        this.setUserInfo(res.data.userInfo)

        return res.data
      } catch (error) {
        throw error
      }
    },

    logout() {
      this.userInfo = null
      this.token = ''
      uni.removeStorageSync('token')
    }
  }
})
```

**使用Store**

```vue
<template>
  <view>
    <text v-if="userStore.isLogin">{{ userStore.userInfo.name }}</text>
    <text v-else>未登录</text>
    <button @click="handleLogin">登录</button>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

async function handleLogin() {
  await userStore.login({
    username: 'test',
    password: '123456'
  })
}
</script>
```

---

### uni-app实战案例

#### 待办事项应用

**项目结构**

```
todo-app/
├── pages/
│   ├── index/
│   │   └── index.vue          # 主页
│   ├── add/
│   │   └── add.vue            # 添加页
│   └── detail/
│       └── detail.vue          # 详情页
├── components/
│   └── todo-item/
│       └── todo-item.vue      # 待办项组件
├── store/
│   └── todo.js                # 待办状态
├── static/
│   └── images/
├── App.vue
├── main.js
├── manifest.json
└── pages.json
```

**Store定义**

```javascript
// store/todo.js
import { defineStore } from 'pinia'

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [],
    filter: 'all' // all, active, completed
  }),

  getters: {
    filteredTodos(state) {
      switch (state.filter) {
        case 'active':
          return state.todos.filter(todo => !todo.completed)
        case 'completed':
          return state.todos.filter(todo => todo.completed)
        default:
          return state.todos
      }
    },

    stats(state) {
      return {
        total: state.todos.length,
        active: state.todos.filter(t => !t.completed).length,
        completed: state.todos.filter(t => t.completed).length
      }
    }
  },

  actions: {
    addTodo(title) {
      const todo = {
        id: Date.now(),
        title,
        completed: false,
        createdAt: new Date().toISOString()
      }
      this.todos.unshift(todo)
      this.saveTodos()
    },

    toggleTodo(id) {
      const todo = this.todos.find(t => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
        this.saveTodos()
      }
    },

    deleteTodo(id) {
      this.todos = this.todos.filter(t => t.id !== id)
      this.saveTodos()
    },

    setFilter(filter) {
      this.filter = filter
    },

    loadTodos() {
      const todos = uni.getStorageSync('todos')
      if (todos) {
        this.todos = JSON.parse(todos)
      }
    },

    saveTodos() {
      uni.setStorageSync('todos', JSON.stringify(this.todos))
    }
  }
})
```

**主页面**

```vue
<!-- pages/index/index.vue -->
<template>
  <view class="container">
    <view class="header">
      <text class="title">待办事项</text>
      <view class="stats">
        <text>{{ todoStore.stats.active }} 待完成</text>
      </view>
    </view>

    <!-- 过滤器 -->
    <view class="filters">
      <view
        v-for="item in filters"
        :key="item.value"
        class="filter-item"
        :class="{ active: todoStore.filter === item.value }"
        @click="todoStore.setFilter(item.value)"
      >
        {{ item.label }}
      </view>
    </view>

    <!-- 列表 -->
    <view class="list">
      <todo-item
        v-for="todo in todoStore.filteredTodos"
        :key="todo.id"
        :todo="todo"
        @toggle="todoStore.toggleTodo(todo.id)"
        @delete="todoStore.deleteTodo(todo.id)"
        @click="goToDetail(todo)"
      />
    </view>

    <!-- 添加按钮 -->
    <view class="add-btn" @click="goToAdd">
      <text class="icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTodoStore } from '@/store/todo'
import TodoItem from '@/components/todo-item/todo-item.vue'

const todoStore = useTodoStore()

const filters = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' }
]

onMounted(() => {
  todoStore.loadTodos()
})

function goToAdd() {
  uni.navigateTo({
    url: '/pages/add/add'
  })
}

function goToDetail(todo) {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${todo.id}`
  })
}
</script>

<style scoped>
.container {
  padding: 20rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
}

.filters {
  display: flex;
  margin-bottom: 20rpx;
}

.filter-item {
  padding: 10rpx 20rpx;
  margin-right: 20rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
}

.filter-item.active {
  background: #007aff;
  color: #fff;
}

.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #007aff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.4);
}

.icon {
  font-size: 60rpx;
  color: #fff;
  line-height: 1;
}
</style>
```

**待办项组件**

```vue
<!-- components/todo-item/todo-item.vue -->
<template>
  <view class="todo-item" @click="onClick">
    <view class="checkbox" @click.stop="onToggle">
      <text v-if="todo.completed" class="check-icon">✓</text>
    </view>
    <view class="content">
      <text class="title" :class="{ completed: todo.completed }">
        {{ todo.title }}
      </text>
      <text class="time">{{ formatTime(todo.createdAt) }}</text>
    </view>
    <view class="delete" @click.stop="onDelete">
      <text>🗑️</text>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle', 'delete', 'click'])

function onToggle() {
  emit('toggle', props.todo.id)
}

function onDelete() {
  uni.showModal({
    title: '提示',
    content: '确定删除这个待办吗？',
    success: (res) => {
      if (res.confirm) {
        emit('delete', props.todo.id)
      }
    }
  })
}

function onClick() {
  emit('click', props.todo)
}

function formatTime(time) {
  const date = new Date(time)
  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.check-icon {
  color: #007aff;
  font-size: 24rpx;
}

.content {
  flex: 1;
}

.title {
  font-size: 32rpx;
}

.title.completed {
  text-decoration: line-through;
  color: #999;
}

.time {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.delete {
  font-size: 40rpx;
  margin-left: 20rpx;
}
</style>
```

---

### 发布到多端

#### 发布到H5

```bash
# 运行H5
npm run dev:h5

# 构建H5
npm run build:h5

# 生成的文件在 dist/build/h5 目录
```

#### 发布到微信小程序

```bash
# 运行微信小程序
npm run dev:mp-weixin

# 构建微信小程序
npm run build:mp-weixin

# 生成的文件在 dist/build/mp-weixin 目录
```

**发布步骤：**

1. 打开微信开发者工具
2. 导入项目，选择 `dist/build/mp-weixin` 目录
3. 填写AppID
4. 预览测试
5. 上传代码
6. 提交审核

#### 发布到App

**云端打包：**

```
1. 打开HBuilderX
2. 发行 → 原生App-云打包
3. 配置:
   - 应用名称
   - 应用版本号
   - 应用图标
   - 启动页配置
4. 选择打包平台（Android/iOS）
5. 点击打包
```

**本地打包：**

```bash
# 需要安装 Android SDK 或 Xcode
# 配置签名证书
# 使用 DCloud 提供的本地打包SDK
```

#### 条件编译优化

```vue
<template>
  <view>
    <!-- H5特有功能 -->
    <!-- #ifdef H5 -->
    <web-view src="https://www.example.com"></web-view>
    <!-- #endif -->

    <!-- 小程序特有功能 -->
    <!-- #ifdef MP-WEIXIN -->
    <button open-type="getUserInfo" @getuserinfo="getUserInfo">
      获取用户信息
    </button>
    <!-- #endif -->

    <!-- App特有功能 -->
    <!-- #ifdef APP-PLUS -->
    <button @click="scanCode">扫码</button>
    <!-- #endif -->
  </view>
</template>

<script setup>
// #ifdef APP-PLUS
function scanCode() {
  plus.barcode.scan(
    '',
    (type, result) => {
      console.log('扫码结果:', result)
    },
    (error) => {
      console.error('扫码失败:', error)
    }
  )
}
// #endif
</script>
```

---

### uni-app分包加载优化

#### 为什么需要分包

**小程序限制：**

```
微信小程序包大小限制:
- 主包: 2MB
- 整个小程序: 所有分包大小不超过 20MB
- 单个分包: 2MB

支付宝小程序包大小限制:
- 主包: 2MB
- 整个小程序: 所有分包大小不超过 20MB

其他平台类似限制...
```

**分包的作用：**
- ✅ 减小主包体积，加快首屏加载
- ✅ 按需加载，提升用户体验
- ✅ 业务模块分离，便于团队协作
- ✅ 独立更新，减少发版影响

#### 分包配置详解

**基础配置**

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    },
    {
      "path": "pages/category/category",
      "style": {
        "navigationBarTitleText": "分类"
      }
    },
    {
      "path": "pages/cart/cart",
      "style": {
        "navigationBarTitleText": "购物车"
      }
    }
  ],

  // 分包配置
  "subPackages": [
    {
      "root": "pages/user",        // 分包根目录
      "name": "user",             // 分包别名（支付宝小程序需要）
      "pages": [
        {
          "path": "profile/profile",   // 页面路径
          "style": {
            "navigationBarTitleText": "个人中心"
          }
        },
        {
          "path": "settings/settings",
          "style": {
            "navigationBarTitleText": "设置"
          }
        },
        {
          "path": "address/address",
          "style": {
            "navigationBarTitleText": "收货地址"
          }
        }
      ]
    },
    {
      "root": "pages/order",
      "name": "order",
      "pages": [
        {
          "path": "list/list",
          "style": {
            "navigationBarTitleText": "我的订单"
          }
        },
        {
          "path": "detail/detail",
          "style": {
            "navigationBarTitleText": "订单详情"
          }
        },
        {
          "path": "aftersale/aftersale",
          "style": {
            "navigationBarTitleText": "售后"
          }
        }
      ]
    },
    {
      "root": "pages/product",
      "name": "product",
      "pages": [
        {
          "path": "list/list",
          "style": {
            "navigationBarTitleText": "商品列表"
          }
        },
        {
          "path": "detail/detail",
          "style": {
            "navigationBarTitleText": "商品详情"
          }
        },
        {
          "path": "search/search",
          "style": {
            "navigationBarTitleText": "搜索"
          }
        }
      ]
    }
  ],

  // 分包预下载配置
  "preloadRule": {
    "pages/index/index": {
      "network": "all",           // all: 在所有网络下预下载
      "packages": ["pages/user"]    // 预下载 user 分包
    },
    "pages/category/category": {
      "network": "wifi",          // wifi: 仅在WiFi下预下载
      "packages": ["pages/product"]
    },
    "pages/cart/cart": {
      "network": "all",
      "packages": ["pages_order"]    // 注意：分包名不能包含路径分隔符
    }
  }
}
```

#### 分包最佳实践

**1. 分包原则**

```
主包（pages）：
- TabBar 页面
- 首页/启动页
- 必须立即加载的页面

分包（subPackages）：
- 独立业务模块
- 低频使用的页面
- 可以延迟加载的页面
```

**2. 分包大小控制**

```javascript
// 查看分包大小
// 微信开发者工具 → 详情 → 基本信息
// 或 HBuilderX 发行 → 小程序-查看分包大小

// 目标：
// - 主包 < 1.5MB（留缓冲）
// - 单个分包 < 1.8MB
```

**3. 分包页面跳转**

```javascript
// 跳转到分包页面
uni.navigateTo({
  url: '/pages/user/profile/profile'
})

// 使用分包别名（支付宝小程序）
uni.navigateTo({
  url: '/user/pages/profile/profile'
})

// 分包预下载（主动触发）
uni.preloadPage({
  url: '/pages/user/profile/profile'
})
```

#### 独立分包（微信小程序）

**什么是独立分包：**

独立分包是微信小程序特有的优化方式，独立分包彼此之间、独立分包和主包之间**互不依赖**。

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": { }
    }
  ],
  "subPackages": [
    {
      "root": "pages/user",
      "pages": [
        {
          "path": "profile/profile",
          "style": { }
        }
      ],
      "independent": true  // 开启独立分包
    }
  ]
}
```

**独立分包的限制：**

```
✅ 优势：
- 独立运行，不依赖主包
- 更快的加载速度
- 业务隔离

❌ 限制：
- 不能访问主包的组件
- 不能访问主包的资源
- 不能使用 uni.navigateTo 跳转到主包页面
- 需要独立引入所有依赖
```

**独立分包配置示例：**

```vue
<!-- pages/user/profile/profile.vue -->
<template>
  <view>
    <!-- 必须自己引入所有组件 -->
    <user-info :user="userInfo" />
  </view>
</template>

<script setup>
// 独立分包必须自己引入所有依赖
import UserInfo from '@/components/user-info/user-info.vue'

const userInfo = ref({
  name: '张三'
})
</script>
```

#### 分包优化技巧

**1. 公共组件提取**

```
问题：多个分包都使用相同的组件，导致体积增大

解决：使用 uni_modules 或 插件市场
```

**2. 分包预下载策略**

```javascript
// 场景1：高频使用的分包立即预下载
"preloadRule": {
  "pages/index/index": {
    "network": "all",
    "packages": ["pages/user", "pages/order"]
  }
}

// �景2：WiFi下预下载大体积分包
"preloadRule": {
  "pages/index/index": {
    "network": "wifi",
    "packages": ["pages_product"]
  }
}

// 场景3：用户登录后预下载个人中心
// 在登录成功后
uni.preloadPage({
  url: '/pages/user/profile/profile'
})
```

**3. 分包体积优化**

```javascript
// 1. 按业务模块分包，而不是按页面分包
// ❌ 不好：每个页面都是分包
subPackages: [
  { root: 'pages/order-detail', pages: [{ path: '1/1' }, { path: '2/2' }] },
  { root: 'pages-order-list', pages: [{ path: 'list/list' }] }
]

// ✅ 好：整个订单模块一个分包
subPackages: [
  {
    root: 'pages/order',
    pages: [
      { path: 'detail/detail' },
      { path: 'list/list' },
      { path: 'aftersale/aftersale' }
    ]
  }
]

// 2. 使用分包根目录的独立资源
static/
├── common/              # 公共资源
├── user/                # user分包专用
└── order/               # order分包专用
```

**4. 分包调试**

```javascript
// 查看分包加载情况
console.log('分包加载信息:', {
  packages: __uniConfigPackages,
  pages: __uniConfigPages
})

// 在开发工具中查看网络请求
// 微信开发者工具 → Network
// 查看各个 .js 文件的加载时间和大小
```

#### 分包常见问题

**问题1：分包页面跳转失败**

```javascript
// ❌ 错误：路径错误
uni.navigateTo({
  url: '/pages/profile/profile'  // 主包页面路径
})

// ✅ 正确：完整路径
uni.navigateTo({
  url: '/pages/user/profile/profile'  // 包含分包根目录
})
```

**问题2：分包体积过大**

```json
// 解决方案：进一步细分分包
{
  "subPackages": [
    {
      "root": "pages/order",
      "pages": [/* ... */]
    },
    {
      "root": "pages/order-detail",
      "pages": [/* ... */]
    }
  ]
}
```

**问题3：分包资源路径错误**

```javascript
// ❌ 错误：分包路径问题
const imageSrc = '/static/logo.png'  // 主包资源

// ✅ 正确：使用绝对路径或分包内资源
const imageSrc = '@/static/logo.png'  // 别名路径
// 或者将资源放到分包对应的static目录
```

**问题4：独立分包组件引用失败**

```javascript
// 独立分包中，不能使用主包的组件
// 解决方案：

// 方案1：关闭独立分包（不推荐）
"independent": false

// 方案2：在分包中也引入组件
// pages/user/components/user-card/user-card.vue
import UserCard from '@/components/user-card/user-card.vue'

// 方案3：使用uni_modules（推荐）
// uni_modules/user-card/components/user-card/user-card.vue
```

---

### 其他性能优化建议

#### 图片优化

```vue
<template>
  <view>
    <!-- 使用懒加载 -->
    <image
      :src="imageUrl"
      lazy-load
      mode="aspectFill"
    />

    <!-- 使用webp格式 -->
    <image src="/static/image.webp" />

    <!-- 按需加载 -->
    <image v-if="showImage" :src="imageUrl" />
  </view>
</template>
```

**2. 分包加载**

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": { }
    }
  ],
  "subPackages": [
    {
      "root": "pages/user",
      "pages": [
        {
          "path": "profile/profile",
          "style": { }
        }
      ]
    },
    {
      "root": "pages/order",
      "pages": [
        {
          "path": "list/list",
          "style": { }
        }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages/user"]
    }
  }
}
```

**3. 代码优化**

```javascript
// 避免频繁的数据更新
let timer = null
function onScroll(e) {
  clearTimeout(timer)
  timer = setTimeout(() => {
    console.log('滚动位置:', e.detail.scrollTop)
  }, 100)
}

// 使用计算属性缓存
const filteredList = computed(() => {
  return list.value.filter(item => item.active)
})
```

---

### 本章小结

| 内容 | 核心要点 |
|------|----------|
| **uni-app基础** | 一次开发多端运行、Vue3语法 |
| **组件开发** | 内置组件、自定义组件、插槽 |
| **API使用** | 网络请求、数据缓存、路由跳转 |
| **条件编译** | 跨端差异化处理 |
| **状态管理** | Pinia集成使用 |
| **发布部署** | H5、小程序、App多端发布 |

**学习建议：**
1. 先掌握H5端开发和调试
2. 理解条件编译的使用场景
3. 重点学习跨端兼容性处理
4. 多实践，熟悉各平台特性差异

---

**恭喜你！已经完成了Vue3完全指南的所有章节学习！** 🎉
