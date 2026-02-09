# Vite 5.x构建工具完全指南

## Vite 5.x构建工具完全指南

> **学习目标**：掌握Vite 5.x最新特性和最佳实践
> **核心内容**：Vite 5.x新特性、性能优化、配置技巧、生态系统

### Vite 5.x概述

#### 什么是Vite 5.x

**Vite 5.x** 是Vite的2024年主要版本，基于Rollup 4.x构建，带来了显著的性能提升和新特性。

```
┌─────────────────────────────────────────────────────────────┐
│                    Vite 5.x 架构                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              开发服务器 (Dev Server)                   │   │
│  │  ┌──────────────┐  ┌──────────────┐                 │   │
│  │  │ ES Modules   │  │ HMR          │                 │   │
│  │  │ Native Build │  │ Lightning    │                 │   │
│  │  └──────────────┘  └──────────────┘                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            构建工具 (Rollup 4.x)                      │   │
│  │  ┌──────────────┐  ┌──────────────┐                 │   │
│  │  │ Tree Shake   │  │ Code Split   │                 │   │
│  │  │ Optimization │  │ Minification │                 │   │
│  │  └──────────────┘  └──────────────┘                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Vite 5.x核心新特性

| 特性 | 说明 | 影响 |
|------|------|------|
| **Rollup 4.x** | 升级构建引擎 | 更快的构建速度 |
| **性能优化** | 依赖预构建优化 | 冷启动速度提升30%+ |
| **CLI改进** | 更好的错误提示 | 开发体验提升 |
| **SSR优化** | 服务端渲染增强 | SSR应用性能提升 |
| **轻量化** | 减少依赖体积 | node_modules体积减小 |

### 环境搭建

#### 升级到Vite 5.x

```bash
# 检查当前版本
npm list vite

# 升级到最新版本
npm install -D vite@latest

# 或者使用yarn
yarn add -D vite@latest

# 或者使用pnpm
pnpm add -D vite@latest
```

#### 创建Vite 5.x项目

```bash
# 使用npm create
npm create vite@latest my-vite-app -- --template vue-ts

# 使用yarn create
yarn create vite my-vite-app --template vue-ts

# 使用pnpm create
pnpm create vite my-vite-app --template vue-ts

# 进入项目目录
cd my-vite-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 升级现有项目

```bash
# 1. 备份项目
cp -r my-project my-project-backup

# 2. 升级Vite和相关插件
npm install -D vite@latest @vitejs/plugin-vue@latest

# 3. 更新其他相关依赖
npm install -D
  rollup@latest
  esbuild@latest
  postcss@latest

# 4. 检查并更新vite.config.ts
# 5. 测试构建和开发服务器
```

### Vite 5.x新特性详解

#### 1. 性能优化

##### 依赖预构建优化

Vite 5.x对依赖预构建进行了重大优化：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  // 优化依赖预构建
  optimizeDeps: {
    // 强制预构建某些依赖
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'element-plus'
    ],

    // 排除某些依赖
    exclude: [
      'your-local-package'
    ],

    // 启用依赖发现
    discover: true,

    // 禁用缓存（调试时使用）
    // disabled: true,

    // 设置最大老化和失效时间
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7天
  },

  // 构建优化
  build: {
    // Rollup 4.x新选项
    target: 'esnext',

    // 压缩配置
    minify: 'esbuild',
    cssMinify: 'lightningcss', // 使用lightningcss压缩CSS

    // 分块策略
    rollupOptions: {
      output: {
        manualChunks: {
          // 更智能的分块
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-library': ['element-plus'],
          'utils': ['axios', 'lodash-es']
        },
        // Rollup 4.x的chunk命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },

    // 启用源码映射
    sourcemap: false,

    // 设置chunk大小警告限制
    chunkSizeWarningLimit: 1000
  }
})
```

##### 开发服务器优化

```typescript
// vite.config.ts
export default defineConfig({
  // 服务器配置
  server: {
    // 端口配置
    port: 3000,
    strictPort: false,
    host: true,

    // 自动打开浏览器
    open: true,
    openPage: '/dashboard',

    // HMR配置
    hmr: {
      overlay: true,
      port: 24678
    },

    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },

    // CORS配置
    cors: true,

    // 文件监听
    watch: {
      usePolling: false,
      interval: 100
    },

    // 中间件模式
    middlewareMode: false,

    // 文件读取优化
    fs: {
      strict: false,
      allow: ['..'],
      deny: ['.env', '.env.*']
    }
  },

  // 预览服务器配置
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

#### 2. 新的配置选项

##### 实验性功能

```typescript
// vite.config.ts
export default defineConfig({
  // 实验性功能
  experimental: {
    // 启用构建时渲染CSS
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
      }
      return { relative: true }
    },

    // 启用高级SOSS (Scope of Service Style)
    advancedSours: true
  },

  // CSS配置
  css: {
    // 使用lightningcss
    transformer: 'lightningcss',

    // CSS模块配置
    modules: {
      scopeBehaviour: 'local',
      globalModulePaths: [/global\.css$/],
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      hashPrefix: 'prefix'
    },

    // 预处理器选项
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api']
      }
    },

    // PostCSS配置
    postcss: {
      plugins: [
        // 自动添加浏览器前缀
        require('autoprefixer')
      ]
    }
  }
})
```

##### 类型导入

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import type { Plugin, PluginOption } from 'vite'

// 使用类型导入获得更好的类型提示
const myPlugin: PluginOption = {
  name: 'my-plugin',
  transform(code, id) {
    // 插件逻辑
    return null
  }
}

export default defineConfig({
  plugins: [myPlugin]
})
```

#### 3. Lightning CSS支持

Vite 5.x引入了Lightning CSS作为可选的CSS转换器：

```bash
# 安装lightningcss
npm install -D lightningcss
```

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      cssModules: true,
      targets: {
        browsers: ['>= 0.25%', 'not dead']
      },
      minify: true
    }
  }
})
```

**Lightning CSS vs PostCSS:**

| 特性 | Lightning CSS | PostCSS |
|------|---------------|---------|
| 速度 | 100x更快 | 基准 |
| 体积 | 更小 | 较大 |
| 插件生态 | 有限 | 丰富 |
| 兼容性 | 新项目推荐 | 成熟稳定 |

#### 4. 环境变量增强

##### 环境变量类型定义

```typescript
// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Vite内置
  readonly MODE: string
  readonly BASE_URL: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean

  // 自定义环境变量
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

##### 环境变量使用

```typescript
// src/config/index.ts
export const config = {
  // API配置
  apiUrl: import.meta.env.VITE_API_URL || '/api',

  // 应用配置
  appName: import.meta.env.VITE_APP_TITLE || 'My App',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // 功能开关
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',

  // 环境判断
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE
}
```

### 构建优化

#### 生产构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 目标环境
    target: 'es2020',

    // 输出目录
    outDir: 'dist',
    assetsDir: 'assets',

    // 生成source map
    sourcemap: false,

    // 最小化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      },
      format: {
        comments: false
      }
    },

    // CSS代码拆分
    cssCodeSplit: true,

    // Rollup配置
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        // 资源文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',

        // 手动分块
        manualChunks(id) {
          // node_modules打包到vendor
          if (id.includes('node_modules')) {
            // 第三方库分类
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-core'
            }
            if (id.includes('element-plus') || id.includes('ant-design')) {
              return 'ui-library'
            }
            return 'vendor'
          }
        },

        // 命名空间
        preserveModules: false,
        preserveModulesRoot: resolve(__dirname, 'src')
      }
    },

    // 压缩配置
    reportCompressedSize: true,

    // chunk大小警告
    chunkSizeWarningLimit: 500,

    // CSS最小化
    cssMinify: 'lightningcss',

    // CSS模块类型
    cssModuleType: 'esm'
  }
})
```

#### 构建分析

```bash
# 安装构建分析工具
npm install -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    // 构建分析插件
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

#### 资源优化

```typescript
// vite.config.ts
export default defineConfig({
  // 资源配置
  assetsInclude: ['**/*.gltf'],

  build: {
    // 资源内联阈值
    assetsInlineLimit: 4096, // 4KB以下内联

    rollupOptions: {
      output: {
        // 静态资源文件名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const extType = info[info.length - 1]

          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name)) {
            return `media/[name]-[hash][extname]`
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    }
  }
})
```

### 性能优化技巧

#### 1. 代码分割策略

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 方案1: 按依赖分割
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-components': ['element-plus'],

          // 方案2: 按模块分割（更细粒度）
          'router': ['vue-router'],
          'store': ['pinia'],
          'utils': ['lodash-es', 'dayjs']
        }
      }
    }
  }
})
```

#### 2. 依赖优化

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    // 包含大型的依赖
    include: [
      'vue',
      'element-plus',
      'lodash-es',
      'echarts'
    ],

    // 排除不需要预构建的包
    exclude: [
      '@vueuse/core'
    ],

    // 设置esbuild选项
    esbuildOptions: {
      target: 'es2020',
      define: {
        __VERSION__: '"1.0.0"'
      }
    }
  }
})
```

#### 3. 缓存优化

```typescript
// vite.config.ts
export default defineConfig({
  // 缓存目录
  cacheDir: 'node_modules/.vite',

  // 强制重新优化
  server: {
    force: false
  }
})
```

#### 4. 按需加载

```typescript
// 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
]

// 组件懒加载
const MyComponent = defineAsyncComponent(
  () => import('@/components/MyComponent.vue')
)

// 条件加载
if (needChart) {
  const echarts = await import('echarts')
  // 使用echarts
}
```

### Vite 5.x最佳实践

#### 1. 项目结构

```
my-vite-project/
├── .env                      # 环境变量
├── .env.development          # 开发环境
├── .env.production           # 生产环境
├── index.html                # HTML入口
├── vite.config.ts            # Vite配置
├── tsconfig.json             # TypeScript配置
├── tsconfig.node.json        # Node环境配置
├── src/
│   ├── main.ts               # 应用入口
│   ├── App.vue               # 根组件
│   ├── assets/               # 静态资源
│   ├── components/           # 组件
│   ├── views/                # 页面
│   ├── router/               # 路由
│   ├── store/                # 状态
│   ├── api/                  # API
│   ├── utils/                # 工具
│   ├── types/                # 类型
│   └── env.d.ts              # 环境变量类型
├── public/                   # 公共资源
└── package.json
```

#### 2. 配置文件

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],

    // 解析配置
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '~': resolve(__dirname),
        '/': resolve(__dirname, 'public')
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json']
    },

    // 定义全局常量
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
      __API_URL__: JSON.stringify(env.VITE_API_URL)
    },

    // CSS配置
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },

    // 开发服务器
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true
        }
      }
    },

    // 构建配置
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia']
          }
        }
      }
    }
  }
})
```

#### 3. 性能检查清单

```typescript
// scripts/check-performance.ts
import { performance } from 'perf_hooks'

interface PerformanceCheck {
  name: string
  check: () => Promise<boolean>
  fix?: () => Promise<void>
}

export const performanceChecks: PerformanceCheck[] = [
  {
    name: '检查bundle大小',
    check: async () => {
      // 实现检查逻辑
      return true
    }
  },
  {
    name: '检查未使用的依赖',
    check: async () => {
      // 实现检查逻辑
      return true
    }
  }
]
```

### 常见问题解决

#### 1. HMR不工作

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    hmr: {
      overlay: true,
      port: 24678
    }
  }
})
```

#### 2. 依赖预构建问题

```bash
# 清除缓存
rm -rf node_modules/.vite

# 重新启动
npm run dev
```

#### 3. 构建内存溢出

```bash
# 增加Node内存限制
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

#### 4. 类型错误

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vite/client", "element-plus/global"],
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  }
}
```

### 本章小结

| 优化领域 | Vite 5.x特性 | 效果 |
|---------|-------------|------|
| 启动速度 | 依赖预构建优化 | 提升30%+ |
| 构建速度 | Rollup 4.x | 提升20%+ |
| 开发体验 | HMR增强 | 更快的热更新 |
| CSS处理 | Lightning CSS | 100x压缩速度 |
| 类型安全 | 改进的类型支持 | 更好的开发体验 |

---

**下一步学习**: 建议继续学习[Bun包管理器](./chapter-49)了解新一代JavaScript运行时。
