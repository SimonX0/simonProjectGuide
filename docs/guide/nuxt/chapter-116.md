# Nuxt配置文件

## Nuxt配置文件

> **为什么要学这一章？**
>
> `nuxt.config.ts` 是 Nuxt 3 应用的核心配置文件，控制着应用的行为、性能、构建等各个方面。掌握配置文件的使用，能让你充分定制和优化你的 Nuxt 应用。
>
> **学习目标**：
>
> - 理解 nuxt.config.ts 的配置结构
> - 掌握常用配置选项的使用方法
> - 学会环境变量和运行时配置
> - 了解性能优化和部署相关配置

---

### nuxt.config.ts 基础

#### 最小配置

```typescript
// nuxt.config.ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 开发工具
  devtools: { enabled: true }
})
```

#### 完整配置模板

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ============ 开发工具 ============
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },

  // ============ 应用配置 ============
  app: {
    head: {
      title: '我的 Nuxt 应用',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Nuxt 3 应用示例' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // ============ 模块 ============
  modules: [],

  // ============ 运行时配置 ============
  runtimeConfig: {
    // 私有配置（仅服务端）
    apiSecret: process.env.API_SECRET,

    // 公共配置（客户端可访问）
    public: {
      apiBase: process.env.API_BASE_URL || '/api'
    }
  }
})
```

---

### 应用配置（app）

#### 页面头部配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      // 基础配置
      title: '我的应用',
      titleTemplate: '%s - 我的网站', // %s 会被替换为页面标题

      // Meta 标签
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '网站描述' },
        { name: 'keywords', content: '关键词1,关键词2' },
        { name: 'author', content: '作者名' },

        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: '我的应用' },
        { property: 'og:description', content: '应用描述' },
        { property: 'og:image', content: '/og-image.jpg' },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: '我的应用' },
        { name: 'twitter:description', content: '应用描述' }
      ],

      // 链接
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' },
        { rel: 'canonical', href: 'https://example.com' }
      ],

      // 样式
      style: [
        // { cssContent: 'body { background-color: #000; }' }
      ],

      // 脚本
      script: [
        // { src: 'https://analytics.example.com/script.js' }
      ],

      // HTML 属性
      htmlAttrs: {
        lang: 'zh-CN',
        dir: 'ltr'
      },

      // Body 属性
      bodyAttrs: {
        class: 'app-body'
      }
    },

    // 页面过渡
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    },

    // 布局过渡
    layoutTransition: {
      name: 'layout',
      mode: 'out-in'
    },

    // 配置键（用于强制刷新组件）
    key: 'name',

    // 保持活跃状态
    keepalive: false
  }
})
```

#### 在页面中使用 useHead

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
useHead({
  title: '首页',
  meta: [
    { name: 'description', content: '这是首页的描述' }
  ],
  link: [
    { rel: 'canonical', href: 'https://example.com' }
  ]
})

// 或使用 titleTemplate
useHead({
  title: '首页', // 实际输出: 首页 - 我的网站
})

// 动态 meta 标签
const route = useRoute()
useHead({
  meta: [
    { property: 'og:url', content: `https://example.com${route.path}` }
  ]
})
</script>
```

---

### 模块配置（modules）

#### 安装模块

```bash
# 安装官方模块
npm install @pinia/nuxt
npm install @nuxtjs/tailwindcss
npm install @vueuse/nuxt
npm install @nuxt/image
npm install @nuxtjs/i18n

# 安装社区模块
npm install @nuxtjs/color-mode
npm install @nuxtjs/google-fonts
```

#### 配置模块

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    // 状态管理
    '@pinia/nuxt',

    // UI 框架
    '@nuxtjs/tailwindcss',

    // 工具库
    '@vueuse/nuxt',

    // 图片优化
    '@nuxt/image',

    // 国际化
    '@nuxtjs/i18n',

    // 颜色模式（深色模式）
    '@nuxtjs/color-mode',

    // Google Fonts
    '@nuxtjs/google-fonts'
  ],

  // 模块配置
  // 1. Tailwind CSS
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    viewer: true
  },

  // 2. VueUse
  vueuse: {
    ssrHandlers: true
  },

  // 3. Image
  image: {
    quality: 80,
    formats: ['webp', 'avif'],
    domains: ['example.com', 'cdn.example.com']
  },

  // 4. i18n
  i18n: {
    locales: [
      { code: 'zh', iso: 'zh-CN', file: 'zh.ts', name: '简体中文' },
      { code: 'en', iso: 'en-US', file: 'en.ts', name: 'English' }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'zh',
    strategy: 'prefix_except_default'
  },

  // 5. Color Mode
  colorMode: {
    classSuffix: '',
    preference: 'system', // 'light' | 'dark' | 'system'
    fallback: 'light',
    storageKey: 'nuxt-color-mode',
    dataValue: 'theme'
  },

  // 6. Google Fonts
  googleFonts: {
    families: {
      Inter: [400, 600, 700],
      Noto+Sans+SC: [400, 500, 700]
    },
    display: 'swap',
    prefetch: true,
    preconnect: true,
    preload: true
  }
})
```

---

### 运行时配置（runtimeConfig）

#### 环境变量配置

```bash
# .env
# 私有变量（仅服务端）
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
API_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_xxx

# 公共变量（客户端可访问，必须以 NUXT_PUBLIC_ 开头）
NUXT_PUBLIC_API_BASE_URL=https://api.example.com
NUXT_PUBLIC_GOOGLE_MAPS_KEY=your-google-maps-key
NUXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

```bash
# .env.production
DATABASE_URL=postgresql://user:password@prod-db:5432/mydb
NUXT_PUBLIC_API_BASE_URL=https://api.example.com
```

```bash
# .env.development
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

#### 运行时配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // 私有配置（仅服务端可访问）
    apiSecret: process.env.API_SECRET || 'default-secret',
    databaseUrl: process.env.DATABASE_URL,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,

    // 公共配置（客户端和服务端都可访问）
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || '/api',
      googleMapsKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_KEY || '',
      gaId: process.env.NUXT_PUBLIC_GA_ID || ''
    }
  }
})
```

#### 在代码中使用

```typescript
// 在服务端（server/api/、server/middleware/ 等）
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  // 访问私有配置
  const apiSecret = config.apiSecret
  const databaseUrl = config.databaseUrl

  // 访问公共配置
  const apiBase = config.public.apiBase

  return { apiBase }
})
```

```vue
<!-- 在组件中 -->
<script setup lang="ts">
const config = useRuntimeConfig()

// ✅ 可以访问公共配置
const apiBase = config.public.apiBase
const googleMapsKey = config.public.googleMapsKey

// ❌ 不能访问私有配置（会报错）
// const apiSecret = config.apiSecret

// 使用配置
const { data } = await useFetch(`${apiBase}/users`)
</script>
```

```typescript
// 在 composables/ 中
export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const fetch = async (endpoint: string) => {
    return $fetch(`${apiBase}${endpoint}`)
  }

  return { fetch }
}
```

---

### 自动导入配置（imports）

#### 配置自动导入

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    // 自动导入目录
    dirs: [
      'composables',
      'utils',
      'stores'
    ],

    // 全局自动导入
    global: false,

    // 预设（Vue、Vue Router 等）
    preset: true,

    // 静态导入（减少构建时开销）
    // 这些 import 不会被自动导入，需要手动导入
    // import: { }
  }
})
```

#### 自定义导入

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    // 自定义导入
    presets: [
      {
        from: 'lodash-es',
        imports: [
          'debounce',
          'throttle',
          'clone'
        ]
      },
      {
        from: 'date-fns',
        imports: [
          'format',
          'parse',
          'isValid'
        ]
      }
    ]
  }
})
```

```vue
<!-- 使用 -->
<script setup lang="ts">
// 自动导入，无需 import
const debouncedFn = debounce(() => {
  console.log('Debounced')
}, 300)

const formatted = format(new Date(), 'yyyy-MM-dd')
</script>
```

---

### 别名配置（alias）

#### 配置别名

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  alias: {
    // 基础别名
    '@': '.',
    '~': '.',
    '~~': '.',
    '@@': '.',
    '~~~': '.',

    // 自定义别名
    '@assets': '/assets',
    '@components': '/components',
    '@composables': '/composables',
    '@layouts': '/layouts',
    '@pages': '/pages',
    '@utils': '/utils',
    '@stores': '/stores',
    '@types': '/types'
  },

  // 解析配置
  vite: {
    resolve: {
      alias: {
        // Vite 特定别名
        '@': fileURLToPath(new URL('./', import.meta.url))
      }
    }
  }
})
```

#### 使用别名

```vue
<script setup lang="ts>
// 使用别名导入
import { myUtil } from '@utils/format'
import { useAuth } from '@composables/useAuth'
import type { User } from '@types'

// 图片资源
const logoUrl = '@/assets/images/logo.png'
</script>
```

---

### CSS 配置

#### 配置 CSS

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 全局 CSS
  css: [
    '~/assets/css/main.css',
    '~/assets/css/animations.css'
  ],

  // Vite CSS 配置
  vite: {
    css: {
      // CSS 模块
      modules: {
        scopeBehaviour: 'local',
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      },

      // 预处理器选项
      preprocessorOptions: {
        scss: {
          // 全局变量和 mixins
          additionalData: `
            @use "@/assets/styles/variables" as *;
            @use "@/assets/styles/mixins" as *;
          `,
          api: 'modern-compiler',
          silenceDeprecations: ['legacy-js-api']
        },
        less: {
          modifyVars: {
            'primary-color': '#667eea'
          }
        },
        styl: {
          additionalData: `
            @import "@/assets/styles/variables.styl"
          `
        }
      },

      // PostCSS
      postcss: {
        plugins: {
          // 自动添加浏览器前缀
          autoprefixer: {},
          // CSS 压缩
          cssnano: process.env.NODE_ENV === 'production' ? {} : false
        }
      },

      // Lightning CSS（实验性）
      transformer: 'lightningcss',
      lightningcss: {
        targets: {
          browsers: ['>= 0.25%', 'not dead']
        }
      }
    }
  }
})
```

#### Tailwind CSS 配置

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#667eea',
          600: '#5568d3',
          700: '#4c51bf',
          800: '#4338ca',
          900: '#3730a3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ]
}
```

---

### 构建配置（build）

#### 构建选项

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 构建配置
  build: {
    // 转译包（ES6 → CommonJS）
    transpile: [
      // 'some-es6-package'
    ],

    // 分析器
    analyze: false, // 设为 true 构建后会打开分析报告

    // 提取 CSS
    extractCSS: true
  },

  // Vite 配置
  vite: {
    build: {
      // 目标环境
      target: 'es2020',

      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // 删除 console
          drop_debugger: true
        }
      },

      // CSS 代码分割
      cssCodeSplit: true,

      // Rollup 配置
      rollupOptions: {
        output: {
          // 手动分块
          manualChunks: {
            // Vue 核心
            'vue-core': ['vue', 'vue-router', 'pinia'],

            // UI 库
            'ui-lib': ['element-plus', '@element-plus/icons-vue'],

            // 工具库
            'utils': ['axios', 'lodash-es', 'dayjs']
          },

          // 资源文件命名
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]'
        },

        // 外部依赖（不打包）
        external: [],
        // external: ['vue', 'vue-router']

        // 输出插件
        plugins: []
      }
    },

    // 优化依赖
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core'
      ],
      exclude: []
    },

    // 服务器配置
    server: {
      // 预览设置
      previewPort: 4173,
      // 严格端口
      strictPort: false,
      // 主机
      host: true,
      // 端口
      port: 3000
    }
  }
})
```

---

### 性能优化配置

#### 依赖优化

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 优化依赖预构建
  optimizeDeps: {
    // 强制预构建
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      '@vueuse/core'
    ],

    // 排除预构建
    exclude: [
      'your-local-package'
    ],

    // esbuild 选项
    esbuildOptions: {
      target: 'es2020',
      define: {
        __VERSION__: '"1.0.0"'
      }
    }
  }
})
```

#### 路由规则（混合渲染）

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 路由规则
  routeRules: {
    // 首页：静态预渲染
    '/': { prerender: true },

    // 博客文章：静态预渲染
    '/blog/**': { prerender: true },

    // 博客列表：ISR（每小时重新验证）
    '/blog': { isr: 3600 },

    // API 缓存（1小时）
    '/api/**': { cache: { maxAge: 60 * 60 * 1000 } },

    // 管理后台：仅 SPA（不服务端渲染）
    '/admin/**': { ssr: false, csr: true },

    // 404 页面
    '/404': { statusCode: 404, prerender: true },

    // 重定向
    '/old-url': { redirect: '/new-url' },

    // Headers
    '/api/headers': {
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  }
})
```

---

### 实战案例：完整配置

#### 生产级配置

```typescript
// nuxt.config.ts
import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // ============ 开发工具 ============
  devtools: {
    enabled: process.env.NODE_ENV !== 'production',
    timeline: {
      enabled: true
    }
  },

  // ============ 应用配置 ============
  app: {
    head: {
      title: '我的应用',
      titleTemplate: '%s - My App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '应用描述' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' }
      ],
      htmlAttrs: {
        lang: 'zh-CN'
      }
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },

  // ============ 模块 ============
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode'
  ],

  // ============ 运行时配置 ============
  runtimeConfig: {
    // 私有配置
    apiSecret: process.env.API_SECRET,
    databaseUrl: process.env.DATABASE_URL,

    // 公共配置
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || '/api',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      gaId: process.env.NUXT_PUBLIC_GA_ID || ''
    }
  },

  // ============ 自动导入 ============
  imports: {
    dirs: [
      'composables',
      'utils',
      'stores'
    ]
  },

  // ============ 别名 ============
  alias: {
    '@': fileURLToPath(new URL('./', import.meta.url)),
    '@assets': fileURLToPath(new URL('./assets', import.meta.url)),
    '@components': fileURLToPath(new URL('./components', import.meta.url))
  },

  // ============ CSS ============
  css: ['~/assets/css/main.css'],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js'
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/variables.scss" as *;'
        }
      }
    }
  },

  // ============ TypeScript ============
  typescript: {
    strict: true,
    typeCheck: process.env.NODE_ENV !== 'production'
  },

  // ============ 构建 ============
  build: {
    analyze: process.env.ANALYZE === 'true'
  },

  vite: {
    build: {
      target: 'es2020',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'ui-library': ['element-plus']
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]'
        }
      }
    }
  },

  // ============ 路由规则 ============
  routeRules: {
    '/': { prerender: true },
    '/blog/**': { prerender: true },
    '/admin/**': { ssr: false }
  },

  // ============ SSR ============
  ssr: true,

  // ============ Nitro ============
  nitro: {
    esbuild: {
      options: {
        target: 'es2020'
      }
    }
  },

  // ============ 开发服务器 ============
  devServer: {
    port: 3000,
    host: '0.0.0.0'
  },

  // ============ 实验性功能 ============
  experimental: {
    typedPages: true
  }
})
```

---

### 本章小结

#### 配置文件速查表

| 配置项 | 说明 | 常用选项 |
|--------|------|---------|
| **app** | 应用配置 | head, pageTransition |
| **modules** | 模块列表 | @pinia/nuxt, @nuxtjs/tailwindcss |
| **runtimeConfig** | 运行时配置 | 私有/公共配置 |
| **imports** | 自动导入 | dirs, presets |
| **css** | CSS 配置 | 全局样式、预处理器 |
| **build** | 构建配置 | transpile, analyze |
| **vite** | Vite 配置 | build, server |
| **routeRules** | 路由规则 | prerender, ssr, isr |

#### 环境变量优先级

```javascript
// 优先级从高到低：
// 1. process.env.XXX (系统环境变量)
// 2. .env.local (本地开发，gitignore)
// 3. .env.[mode].local (特定模式)
// 4. .env.[mode] (特定模式)
// 5. .env (默认)

// 示例：
// 开发环境会加载：
// - .env
// - .env.development
// - .env.development.local

// 生产环境会加载：
// - .env
// - .env.production
```

#### 最佳实践

1. **环境变量**：敏感信息使用私有配置
2. **模块管理**：只安装必要的模块
3. **CSS 组织**：使用预处理器和模块化
4. **构建优化**：合理配置代码分割
5. **类型安全**：启用 TypeScript 严格模式
6. **性能监控**：使用分析工具检查打包体积

---

**恭喜！你已经完成了 Nuxt 3+ 基础入门的所有章节学习。**

接下来建议：
- 深入学习 Nuxt 3 的高级特性
- 实践构建完整的应用项目
- 探索 Nuxt 3 的生态系统
