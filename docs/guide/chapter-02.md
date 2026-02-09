# Vue3简介与环境搭建

## Vue3简介与环境搭建

> **2024-2026更新**：本章节已更新到 Vue 3.4+、Node.js 20.x LTS、Vite 5.4+ 等最新版本。

### 什么是Vue3？ {#什么是vue3}

想象你在搭积木：
- **HTML** 是积木块的形状（结构）
- **CSS** 是积木块的颜色（样式）
- **JavaScript** 是让积木动起来的魔法（行为）
- **Vue3** 是一个超级工具箱，让这三者配合更轻松！

**Vue3的核心优势：**
- 性能更快（比Vue2快1.5-2倍）
- 体积更小（打包后约13KB）
- TypeScript支持更好
- Composition API让代码更易维护
- Tree-shaking支持，按需引入
- 更好的多根节点支持
- Fragment支持
- **[2024+] Vue 3.4+ 新特性**：
  - defineModel 简化双向绑定
  - props 解构响应式支持
  - 稳定的 Computed 性能优化
  - bindToProps 更灵活的属性传递

### 开发环境搭建 {#开发环境搭建}

#### Node.js 版本管理（nvm）

在开发 Vue3 项目时，不同项目可能需要不同版本的 Node.js。**nvm（Node Version Manager）** 是一款 Node.js 版本管理工具，可以轻松切换和管理多个 Node.js 版本。

> **2024-2026更新**：推荐使用 Node.js 20.x LTS 版本，支持最新的 ES 特性和性能优化。

**安装 nvm：**

**Windows 系统：**
```bash
# 1. 访问 nvm-windows 下载页面
# https://github.com/coreybutler/nvm-windows/releases

# 2. 下载 nvm-setup.exe 安装包（最新版本：1.1.12+）

# 3. 运行安装程序，按照提示完成安装
```

**macOS/Linux 系统：**
```bash
# 使用 curl 安装（最新版本：0.40.0+）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# 或使用 wget 安装
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# 重新加载终端配置
source ~/.bashrc  # 或 source ~/.zshrc
```

**nvm 常用命令：**
```bash
# 查看 nvm 版本
nvm version

# 列出所有已安装的 Node.js 版本
nvm ls

# 列出所有可用的 Node.js 版本
nvm ls-remote

# 安装指定版本的 Node.js
nvm install 18              # 安装最新的 18.x 版本
nvm install 20.11.0         # 安装指定版本

# 切换到指定版本的 Node.js
nvm use 18                  # 切换到 18.x 最新版本
nvm use 20.11.0             # 切换到指定版本

# 设置默认 Node.js 版本
nvm alias default 18        # 设置默认版本为 18.x

# 查看当前使用的 Node.js 版本
nvm current

# 卸载指定版本的 Node.js
nvm uninstall 16.20.0
```

**Vue3 推荐的 Node.js 版本（2024-2026）：**
```bash
# Node.js 版本推荐（2024-2026标准）
# - Node.js 20.x LTS (推荐) - Iron 长期支持版
# - Node.js 22.x Current - 最新特性版

# 安装 Node.js 20 LTS（推荐生产环境）
nvm install 20
nvm use 20
nvm alias default 20

# 或安装 Node.js 22（用于测试最新特性）
nvm install 22
nvm use 22

# 查看当前 Node.js 版本
node -v  # 应该显示 v20.x.x 或 v22.x.x
```

**Node.js 20.x 新特性（2024-2026）：**
- ✅ 内置权限模型（Permission Model）
- ✅ 稳定的 Test Runner
- ✅ 单一可执行应用（SEA）
- ✅ 性能提升：运行时启动速度提升 20%
- ✅ V8 引擎更新（支持最新的 ES 特性）

#### NPM 源管理（nrm）

**nrm（NPM Registry Manager）** 是一款 npm 源管理工具，可以快速切换不同的 npm 镜像源，提高包下载速度。

**安装 nrm：**
```bash
# 全局安装 nrm
npm install -g nrm

# 查看 nrm 版本
nrm --version
```

**nrm 常用命令：**
```bash
# 列出所有可用的 npm 源
nrm ls

/* 输出示例：
* npm -------- https://registry.npmjs.org/
  yarn ------- https://registry.yarnpkg.com/
  tencent ---- https://mirrors.cloud.tencent.com/npm/
  cnpm ------- https://r.cnpmjs.org/
  taobao ----- https://registry.npmmirror.com/
  npmMirror -- https://skimdb.npmjs.com/registry/
*/

# 切换到指定的 npm 源
nrm use taobao              # 切换到淘宝镜像
nrm use tencent             # 切换到腾讯镜像
nrm use npm                 # 切换回官方源

# 查看当前使用的 npm 源
nrm current

# 添加自定义 npm 源
nrm add company http://npm.company.com/

# 删除自定义 npm 源
nrm del company

# 测试各个源的响应速度
nrm test

/* 输出示例：
* npm ---- 1234ms
  yarn --- 1456ms
  tencent --- 234ms
  cnpm --- 567ms
  taobao --- 345ms
*/
```

**国内推荐使用的 npm 镜像源：**
```bash
# 淘宝镜像（推荐，更新及时）
nrm use taobao

# 腾讯镜像
nrm use tencent

# 或直接使用 npm 配置（不使用 nrm）
npm config set registry https://registry.npmmirror.com/
```

**查看和恢复 npm 源：**
```bash
# 查看当前 npm 源
npm config get registry

# 恢复到 npm 官方源
npm config set registry https://registry.npmjs.org/
```

#### 环境检查

在开始 Vue3 项目开发前，请确保以下环境已正确配置：

```bash
# 检查 Node.js 版本（推荐 18.x 或更高）
node -v

# 检查 npm 版本
npm -v

# 检查当前使用的 nvm 版本
nvm current

# 检查当前 npm 源
nrm current
```

**输出示例：**
```bash
$ node -v
v20.11.0

$ npm -v
10.2.4

$ nvm current
v20.11.0

$ nrm current
taobao
```

#### 方法一：使用 Vite 5.4+（推荐）

> **2024-2026更新**：Vite 5.4+ 已完全替代 Webpack，启动速度提升 10 倍，HMR 毫秒级响应。

```bash
# 创建项目（Vite 5.4+）
npm create vue@latest my-vue-app

# 或使用 yarn
yarn create vue my-vue-app

# 或使用 pnpm（推荐，速度更快）
pnpm create vue my-vue-app

# 进入项目目录
cd my-vue-app

# 安装依赖（Vite 5.4+）
npm install
# 或 pnpm install（推荐）

# 启动开发服务器
npm run dev
# 或 pnpm dev
```

**Vite 5.4+ 新特性（2024-2026）：**
- ⚡ 启动速度提升 50%+（相比 Webpack）
- 🔥 HMR（热更新）毫秒级响应
- 📦 Rollup 4.0+ 构建，生产打包速度提升 30%
- 🎨 原生 CSS 模块支持
- 🚀 优化的 Tree-shaking
- 🔧 改进的 TypeScript 支持
- 💻 支持 Turbopack（实验性）

**项目结构（2024-2026标准）：**
```
my-vue-app/
├── public/              # 静态资源
├── src/
│   ├── assets/         # 资源文件
│   ├── components/     # 组件目录
│   ├── composables/    # 组合式函数（2024+标准）
│   ├── router/         # 路由配置
│   ├── stores/         # 状态管理（Pinia 2.2+）
│   ├── types/          # TypeScript类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── package.json        # 依赖配置（Node 20.x+）
├── vite.config.ts      # Vite 5.4+配置
├── tsconfig.json       # TypeScript 5.3+配置
├── tsconfig.node.json  # Node环境TS配置
├── .env.d.ts           # 环境变量类型
└── auto-imports.d.ts   # 自动导入类型（unplugin-auto-import）
```

### SFC单文件组件 {#sfc单文件组件}

Vue3使用 `.vue` 文件作为单文件组件（Single File Component）：

```vue
<script setup lang="ts">
// 使用 TypeScript 和 setup 语法糖（组合式API）
import { ref } from 'vue'

const msg = ref('Hello World')
</script>

<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<style scoped>
.hello {
  color: #42b983;
}
</style>
```

**SFC的三个部分：**
1. `<script setup>`：JavaScript/TypeScript逻辑（使用组合式API）
2. `<template>`：HTML模板
3. `<style>`：CSS样式（scoped表示作用域样式）

**2024-2026 最佳实践：**
- ✅ 使用 `<script setup lang="ts">` 语法
- ✅ 使用 defineModel（Vue 3.4+）简化双向绑定
- ✅ 使用 props 解构（Vue 3.4+）
- ✅ 使用 TypeScript 5.3+ 类型系统
- ✅ 使用 Pinia 2.2+ 状态管理
- ✅ 使用 VueUse 11.0+ 组合式函数

---
