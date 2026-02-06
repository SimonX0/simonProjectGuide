---
title: 工程化面试题
---

# 工程化面试题

## 构建工具

### Vite相比Webpack的优势？

| 特性 | Vite | Webpack |
|------|------|---------|
| 启动速度 | 极快（使用ESM） | 较慢（打包） |
| 热更新 | 极快 | 较慢 |
| 配置 | 简单 | 复杂 |
| 生态 | 新兴 | 成熟 |
| 生产构建 | Rollup | 自身 |
| 插件 | Vue官方支持 | 社区庞大 |

**Vite核心优势**：
1. **开发服务器**：使用原生ESM，无需打包
2. **生产构建**：使用Rollup，生成优化代码
3. **开箱即用**：TypeScript、CSS预处理器、JSX

### Vite配置详解？

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],

  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  // 开发服务器
  server: {
    port: 3000,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus']
        }
      }
    }
  },

  // CSS配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  }
});
```

### 如何编写Vite插件？

```javascript
// my-plugin.js
export function myPlugin(options = {}) {
  return {
    name: 'my-plugin',

    // 钩子：转换代码
    transform(code, id) {
      if (id.endsWith('.vue')) {
        return code.replace(/foo/g, 'bar');
      }
    },

    // 钩子：配置html
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        '<head><script src="/custom-script.js"></script>'
      );
    },

    // 钩子：生成bundle后
    generateBundle(options, bundle) {
      // 修改bundle
    }
  };
}

// 使用
// vite.config.js
export default defineConfig({
  plugins: [myPlugin({ option: 'value' })]
});
```

## 模块化与包管理

### ES Module与CommonJS的区别？

| 特性 | ES Module | CommonJS |
|------|-----------|----------|
| 语法 | import/export | require/module.exports |
| 加载 | 编译时加载 | 运行时加载 |
| 输出 | 值引用（动态绑定） | 值拷贝 |
| 顶层this | undefined | global |
| 异步加载 | 支持 | 不支持 |

**ES Module**：

```javascript
// 导出
export const name = 'Alice';
export default function greet() {}

// 导入
import greet, { name } from './module.js';
import * as module from './module.js';
```

**CommonJS**：

```javascript
// 导出
module.exports = {
  name: 'Alice',
  greet: function() {}
};

// 或
exports.name = 'Alice';

// 导入
const { name, greet } = require('./module');
```

### package.json字段详解？

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "My awesome project",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "type": "module",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src",
    "format": "prettier --write src"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
  },
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  "optionalDependencies": {
    "fsevents": "^2.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ],
  "keywords": ["vue", "vite", "component"],
  "author": "Alice <alice@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/alice/my-project.git"
  },
  "bugs": {
    "url": "https://github.com/alice/my-project/issues"
  },
  "homepage": "https://github.com/alice/my-project#readme"
}
```

**依赖类型**：
- `dependencies`：生产依赖
- `devDependencies`：开发依赖
- `peerDependencies`：对等依赖（宿主提供）
- `optionalDependencies`：可选依赖

### npm、yarn、pnpm的区别？

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| 安装速度 | 慢 | 快 | 最快 |
| 磁盘占用 | 高 | 高 | 低（硬链接） |
| lockfile | package-lock.json | yarn.lock | pnpm-lock.yaml |
| workspace | 支持 | 支持 | 支持 |
| 幽灵依赖 | 有 | 有 | 无 |

**pnpm优势**：
1. **节省磁盘空间**：使用硬链接，一份数据多项目共享
2. **速度快**：并行安装
3. **严格模式**：只能访问package.json中声明的依赖

## 代码规范

### ESLint配置？

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
};
```

### Prettier配置？

```javascript
// .prettierrc.js
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf'
};
```

### EditorConfig配置？

```ini
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
```

### Git Hooks（Husky + lint-staged）？

```bash
# 安装
npm install -D husky lint-staged
npx husky install

# 添加commit钩子
npx husky add .husky/pre-commit "npx lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Commitlint配置？

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
```

**提交规范**：

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链
```

## CI/CD

### GitHub Actions配置？

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist

      - name: Deploy to server
        uses: easingthemes/ssh-deploy@main
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: /var/www/html
```

## 测试

### Vitest配置？

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov']
    }
  }
});
```

**单元测试**：

```javascript
// sum.test.js
import { describe, it, expect } from 'vitest';
import { sum } from './sum';

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

**组件测试**：

```javascript
// Button.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Button from './Button.vue';

describe('Button', () => {
  it('renders text', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    });
    expect(wrapper.text()).toBe('Click me');
  });

  it('emits click event', async () => {
    const wrapper = mount(Button);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });
});
```

## 微前端

### 什么是微前端？（2024-2025大厂热门）

**概念**：将大型前端应用拆分为多个小型、独立的前端应用，每个应用由不同团队独立开发和部署。

**核心价值**：
- 团队自治：不同团队独立开发、测试、部署
- 技术栈无关：不同子应用可使用不同框架
- 增量升级：逐步迁移旧系统
- 独立部署：一个子应用更新不影响其他应用

### 微前端架构对比？

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **qiankun** | 成熟、文档完善 | 基于single-spa，较重 | 企业级应用 |
| **single-spa** | 灵活、框架无关 | 配置复杂 | 需要深度定制 |
| **Module Federation** | Webpack原生支持 | 需要Webpack5+ | 现代化项目 |
| **iframe** | 简单、隔离性强 | 性能差、通信复杂 | 快速集成 |
| **Web Components** | 原生支持 | 浏览器兼容性 | 跨框架组件共享 |

### qiankun实战（美团、阿里常用）

```javascript
// 主应用
// main.js
import { registerMicroApps, start } from 'qiankun';

// 1. 注册子应用
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:8081',
    container: '#subapp-viewport',
    activeRule: '/vue',
    props: {
      routerBase: '/vue',
      store: {} // 共享数据
    }
  },
  {
    name: 'react-app',
    entry: '//localhost:8082',
    container: '#subapp-viewport',
    activeRule: '/react',
  }
]);

// 2. 启动微前端
start({
  sandbox: {
    strictStyleIsolation: true, // 样式隔离
    experimentalStyleIsolation: true
  },
  prefetch: true, // 预加载
  singular: false // 是否单实例
});

// 3. 全局状态管理
import { initGlobalState } from 'qiankun';

const initialState = {
  user: null,
  token: null
};

const actions = initGlobalState(initialState);

actions.onGlobalStateChange((state, prev) => {
  console.log('状态变化:', state, prev);
});

// 4. 子应用挂载容器
// App.vue
<template>
  <div id="app">
    <header>
      <router-link to="/vue">Vue应用</router-link>
      <router-link to="/react">React应用</router-link>
    </header>

    <div id="subapp-viewport"></div>
  </div>
</template>
```

### 子应用配置（Vue3）

```javascript
// 子应用 (Vue3 + Vite)
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: 'http://localhost:8081', // 开发环境必须配置
  build: {
    lib: {
      entry: './src/main.js',
      name: 'vueApp',
      formats: ['umd'],
      fileName: 'vue-app'
    }
  }
})

// main.js
let app = null

// ✅ 必须导出生命周期钩子
export async function bootstrap() {
  console.log('Vue子应用bootstrap')
}

export async function mount(props) {
  app = createApp(App)
  const router = createRouter({
    history: createWebHistory(props.routerBase || '/'),
    routes
  })

  app.use(router)
  app.mount('#app')

  // 接收主应用传递的props
  console.log('主应用传递的props:', props)
}

export async function unmount() {
  app?.unmount()
  app = null
}

// 独立运行环境
if (!window.__POWERED_BY_QIANKUN__) {
  mount({ routerBase: '/' })
}
```

### Module Federation实战（2025年趋势）

```javascript
// webpack.config.js (主应用)
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host_app',
      remotes: {
        // 远程模块配置
        remote_vue: 'remote_vue@http://localhost:8081/remoteEntry.js',
        remote_react: 'remote_react@http://localhost:8082/remoteEntry.js'
      },
      shared: {
        vue: {
          singleton: true,
          requiredVersion: '^3.0.0'
        },
        'element-plus': {
          singleton: true
        }
      }
    })
  ]
}

// 使用远程组件
// Home.vue
<script setup>
import { defineAsyncComponent } from 'vue'

// ✅ 异步加载远程组件
const RemoteButton = defineAsyncComponent(() =>
  import('remote_vue/Button')
)

const RemoteCard = defineAsyncComponent(() =>
  import('remote_react/Card')
)
</script>

<template>
  <div>
    <!-- 使用远程组件 -->
    <RemoteButton />
    <RemoteCard />
  </div>
</template>

// 子应用配置 (Vue)
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote_vue',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button.vue',
        './Card': './src/components/Card.vue'
      },
      shared: {
        vue: {
          singleton: true,
          requiredVersion: '^3.0.0'
        }
      }
    })
  ]
}
```

### 微前端样式隔离方案？

```javascript
// 1. qiankun的样式隔离
start({
  sandbox: {
    // 严格样式隔离（Shadow DOM）
    strictStyleIsolation: true,

    // 实验性样式隔离（添加作用域选择器）
    experimentalStyleIsolation: true
  }
});

// 2. CSS-in-JS
import { styled } from '@vueuse/core'

const StyledButton = styled('button', {
  background: 'blue',
  color: 'white'
})

// 3. CSS Modules
// Button.vue
<style module>
.button {
  background: blue;
}
</style>

<template>
  <button :class="$style.button">Click</button>
</template>

// 4. 命名约定（BEM）
// subapp-name__block__element--modifier
.vue-app__header__title--large {
  font-size: 24px;
}

// 5. Shadow DOM（Web Components）
class ShadowComponent extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.innerHTML = `
      <style>
        button { background: blue; }
      </style>
      <button>Click</button>
    `
  }
}
```

### 微前端通信方案？

```javascript
// 1. 全局状态管理（qiankun）
// 主应用
import { initGlobalState } from 'qiankun'

const actions = initGlobalState({ user: null })

actions.onGlobalStateChange((state, prev) => {
  console.log('状态变化:', state)
})

// 子应用
export async function mount(props) {
  // 通过props获取actions
  props.onGlobalStateChange &&
    props.onGlobalStateChange((state, prev) => {
      console.log('子应用接收状态:', state)
    })

  // 修改全局状态
  props.setGlobalState && props.setGlobalState({ user: 'John' })
}

// 2. 自定义事件
// eventBus.js
class EventBus {
  constructor() {
    this.events = {}
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data))
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
  }
}

window.eventBus = new EventBus()

// 使用
// 主应用
window.eventBus.emit('user-login', { name: 'John' })

// 子应用
window.eventBus.on('user-login', (user) => {
  console.log('用户登录:', user)
})

// 3. localStorage + storage事件
// 主应用
localStorage.setItem('user', JSON.stringify({ name: 'John' }))

// 子应用
window.addEventListener('storage', (e) => {
  if (e.key === 'user') {
    const user = JSON.parse(e.newValue)
    console.log('用户信息更新:', user)
  }
})

// 4. URL参数
// 跨应用传递数据
const data = { id: 123 }
const url = new URL('/vue/detail', window.location.origin)
url.searchParams.set('data', JSON.stringify(data))
window.history.pushState({}, '', url)

// 5. postMessage（iframe通信）
// 主应用
const iframe = document.querySelector('iframe')
iframe.contentWindow.postMessage(
  { type: 'UPDATE_USER', data: { name: 'John' } },
  '*'
)

// 子应用
window.addEventListener('message', (e) => {
  if (e.data.type === 'UPDATE_USER') {
    console.log('收到消息:', e.data.data)
  }
})
```

### 微前端路由方案？

```javascript
// 1. 统一路由管理（推荐）
// 主应用路由
const routes = [
  {
    path: '/vue/:path*',  // 通配符匹配
    name: 'vue-app',
    component: () => import('@/views/MicroAppContainer.vue')
  },
  {
    path: '/react/:path*',
    name: 'react-app',
    component: () => import('@/views/MicroAppContainer.vue')
  }
]

// MicroAppContainer.vue
<template>
  <div id="subapp-viewport"></div>
</template>

// 2. 路由守卫
router.beforeEach((to, from, next) => {
  // 判断是否进入子应用
  if (to.path.startsWith('/vue')) {
    // 动态加载子应用
    loadMicroApp({
      name: 'vue-app',
      entry: '//localhost:8081',
      container: '#subapp-viewport'
    })
  }
  next()
})

// 3. 子应用路由适配
// 子应用
const router = createRouter({
  history: createWebHistory(
    window.__POWERED_BY_QIANKUN__
      ? '/vue/'  // 微前端环境
      : '/'      // 独立运行环境
  ),
  routes
})

// 4. 跨应用跳转
// 主应用跳转到子应用
router.push('/vue/detail/123')

// 子应用跳转到另一个子应用
window.history.pushState({}, '', '/react/detail/456')

// 5. 面包屑导航
// 主应用
const breadcrumbs = computed(() => {
  const path = route.path

  if (path.startsWith('/vue')) {
    return [
      { title: '首页', path: '/' },
      { title: 'Vue应用', path: '/vue' },
      { title: '详情', path }
    ]
  }
  // ...
})
```

### 微前端性能优化？

```javascript
// 1. 预加载策略
registerMicroApps([...], {
  prefetch: 'all'  // 预加载所有子应用
  // prefetch: []   // 不预加载
  // prefetch: true // 智能预加载（推荐）
})

// 2. 按需加载
// 用户hover时预加载
let loadMicroApp = null

const handleMouseEnter = () => {
  if (!loadMicroApp) {
    import('qiankun').then(({ loadMicroApp }) => {
      loadMicroApp({
        name: 'vue-app',
        entry: '//localhost:8081',
        container: '#subapp-viewport'
      })
    })
  }
}

// 3. 应用卸载
// 切换应用时卸载不需要的应用
const unmountLoadMicroApp = loadMicroApp({
  name: 'vue-app',
  entry: '//localhost:8081',
  container: '#subapp-viewport'
})

// 路由变化时卸载
router.afterEach((to) => {
  if (!to.path.startsWith('/vue')) {
    unmountLoadMicroApp()
  }
})

// 4. 缓存策略
// 缓存子应用实例
const appCache = new Map()

export async function loadApp(name, entry, container) {
  if (appCache.has(name)) {
    const app = appCache.get(name)
    app.mount(container)
    return app
  }

  const app = await loadMicroApp({ name, entry, container })
  appCache.set(name, app)
  return app
}

// 5. 资源共享
// 共享依赖，避免重复加载
start({
  sandbox: {
    strictStyleIsolation: true
  }
})

// 主应用和子应用共享CDN
// index.html
<script src="https://cdn.jsdelivr.net/npm/vue@3.4.0/dist/vue.global.prod.js"></script>
```

### 微前端项目实战？（美团、阿里项目题）

```javascript
// 场景：电商平台微前端改造

// 架构设计
/*
┌─────────────────────────────────────────────────────┐
│                    主应用 (Shell)                    │
│  - 导航栏                                            │
│  - 用户信息                                          │
│  - 权限管理                                          │
│  - 子应用容器                                        │
└─────────────────────────────────────────────────────┘
         ↓              ↓              ↓
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  商品子应用   │ │  订单子应用   │ │  支付子应用   │
│  (Vue3)     │ │  (React)    │ │  (Vue2)     │
│  - 商品列表   │ │  - 订单列表   │ │  - 收银台    │
│  - 商品详情   │ │  - 订单详情   │ │  - 支付结果   │
└─────────────┘ └─────────────┘ └─────────────┘
*/

// 1. 主应用配置
// Shell应用 (Vue3 + Vite + qiankun)
// main.js
import { registerMicroApps, start, initGlobalState } from 'qiankun'
import { createRouter, createWebHistory } from 'vue-router'

// 全局状态
const initialState = {
  user: null,
  cart: [],
  token: null
}

const actions = initGlobalState(initialState)

// 监听登录状态
actions.onGlobalStateChange((state) => {
  if (!state.token) {
    // 未登录，跳转到登录页
    router.push('/login')
  }
})

// 注册子应用
registerMicroApps([
  {
    name: 'product',
    entry: process.env.VUE_APP_PRODUCT_URL,
    container: '#subapp-container',
    activeRule: '/product',
    props: {
      getGlobalState: actions.getGlobalState,
      setGlobalState: actions.setGlobalState
    }
  },
  {
    name: 'order',
    entry: process.env.VUE_APP_ORDER_URL,
    container: '#subapp-container',
    activeRule: '/order',
  },
  {
    name: 'payment',
    entry: process.env.VUE_APP_PAYMENT_URL,
    container: '#subapp-container',
    activeRule: '/payment',
  }
])

// 启动
start({
  sandbox: {
    strictStyleIsolation: true
  },
  prefetch: true
})

// 2. 商品子应用 (Vue3 + Vite)
// products/src/main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Antd from 'ant-design-vue'

let app = null
let router = null

export async function bootstrap() {
  console.log('商品子应用启动')
}

export async function mount(props) {
  app = createApp(App)
  router = createRouter({
    history: createWebHistory('/product'),
    routes
  })

  app.use(router)
  app.use(Antd)

  // 接收主应用的状态
  if (props.getGlobalState) {
    const state = props.getGlobalState()
    console.log('用户信息:', state.user)
  }

  app.mount('#app')
}

export async function unmount() {
  app?.unmount()
  router = null
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  mount({})
}

// 3. 订单子应用 (React + Umi)
// orders/src/app.tsx
export const qiankun = {
  async mount(props) {
    console.log('订单子应用挂载', props)
    ReactDOM.render(<App />, props.container)
  },

  async unmount(props) {
    ReactDOM.unmountComponentAtNode(props.container)
  }
}

// 4. 支付子应用 (Vue2 + Webpack)
// payment/src/main.js
let instance = null

export async function bootstrap() {}

export async function mount(props) {
  instance = new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
}

export async function unmount() {
  instance.$destroy()
  instance = null
}

// 5. 统一登录认证
// 主应用路由守卫
router.beforeEach((to, from, next) => {
  const token = actions.getGlobalState().token

  if (!token && to.path !== '/login') {
    next('/login')
  } else {
    next()
  }
})

// 6. 统一错误处理
// 全局错误捕获
window.addEventListener('unhandledrejection', (event) => {
  console.error('微前端错误:', event.reason)

  // 发送到错误监控系统
  sendToErrorTracking({
    error: event.reason,
    timestamp: Date.now()
  })
})

// 7. 性能监控
// 子应用性能监控
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      console.log('页面加载时间:', entry.loadEventEnd - entry.fetchStart)

      // 发送到监控系统
      sendToMonitoring({
        metric: 'page_load_time',
        value: entry.loadEventEnd - entry.fetchStart
      })
    }
  }
})

observer.observe({ entryTypes: ['navigation', 'resource'] })
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
