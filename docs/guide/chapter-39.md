# 第39章：前端工程化进阶

## 第39章 前端工程化进阶

> **学习目标**：掌握高级前端工程化技术
> **核心内容**：Monorepo、组件库开发、自动化工具、版本管理

### 39.1 Monorepo 架构（pnpm workspace）

#### 39.1.1 pnpm workspace 配置

```yaml
# pnpm-workspace.yaml

packages:
  # apps 目录下的所有项目
  - 'apps/*'
  # packages 目录下的所有包
  - 'packages/*'
  # 特定包
  - 'packages/config/*'
```

```json
// package.json
{
  "name": "my-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  }
}
```

#### 39.1.2 Turbo 配置

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

#### 39.1.3 项目结构

```
my-monorepo/
├── apps/
│   ├── web/                    # 主应用（Vue3）
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── admin/                  # 管理后台（Vue3）
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
├── packages/
│   ├── ui/                     # UI组件库
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── utils/                  # 工具函数库
│   │   ├── src/
│   │   └── package.json
│   ├── config/                 # 共享配置
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   └── api-client/             # API客户端
│       └── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── tsconfig.json
```

#### 39.1.4 包之间引用

```json
// packages/ui/package.json
{
  "name": "@my-monorepo/ui",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "types": "./src/index.ts"
    },
    "./components/*": "./src/components/*/index.ts"
  },
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  }
}
```

```json
// apps/web/package.json
{
  "name": "@my-monorepo/web",
  "version": "1.0.0",
  "dependencies": {
    "@my-monorepo/ui": "workspace:*",
    "@my-monorepo/utils": "workspace:*",
    "@my-monorepo/api-client": "workspace:*"
  }
}
```

### 39.2 组件库开发与发布

#### 39.2.1 组件库项目结构

```
my-component-library/
├── packages/
│   ├── components/             # 组件包
│   │   ├── src/
│   │   │   ├── button/
│   │   │   ├── input/
│   │   │   ├── modal/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── theme/                  # 主题包
│   │   ├── src/
│   │   └── package.json
│   └── icons/                  # 图标包
│       ├── src/
│       └── package.json
├── playground/                 # 演示应用
│   ├── src/
│   └── package.json
├── docs/                       # 文档站点
│   ├── .vitepress/
│   └── package.json
├── pnpm-workspace.yaml
└── package.json
```

#### 39.2.2 组件库配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyComponents',
      fileName: (format) => `my-components.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        // 分块输出
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

#### 39.2.3 TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 39.3 代码规范自动化

#### 39.3.1 Commitizen 配置

```bash
npm install -D commitizen cz-conventional-changelog
```

```json
// package.json
{
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  },
  "scripts": {
    "commit": "git-cz"
  }
}
```

#### 39.3.2 Lint-staged 配置

```bash
npm install -D lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,vue}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

#### 39.3.3 Husky Hooks 配置

```bash
npx husky-init
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged

pnpm run type-check
```

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx commitlint --edit $1
```

### 39.4 自动化生成工具

#### 39.4.1 使用 Hygen

```bash
npm install -D hygen
```

```
_templates/
├── component/
│   ├── index.js
│   └── component.vue.ejs
└── page/
    ├── index.js
    └── page.vue.ejs
```

```javascript
// _templates/component/index.js
module.exports = {
  prompt: ({ inquirer }) => {
    return inquirer
      .prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Component name:'
        },
        {
          type: 'confirm',
          name: 'hasProps',
          message: 'Has props?',
          default: false
        }
      ])
  }
}
```

```vue
<!-- _templates/component/new.vue.ejs -->
<template>
  <div class="<%= name.toLowerCase() %>">
    <!-- <%= name %> component -->
  </div>
</template>

<script setup lang="ts">
<% if (hasProps) { %>
interface Props {
  // Define props here
}

const props = defineProps<Props>()
<% } %>
</script>

<style scoped>
.<%= name.toLowerCase() %> {
  /* Add styles here */
}
</style>
```

#### 39.4.2 自定义生成脚本

```typescript
// scripts/generate-component.ts
import * as fs from 'fs'
import * as path from 'path'

interface ComponentOptions {
  name: string
  path?: string
  typescript?: boolean
  style?: 'css' | 'scss' | 'none'
}

export function generateComponent(options: ComponentOptions) {
  const { name, path: basePath = 'src/components', typescript = true, style = 'scss' } = options

  const componentName = name.charAt(0).toUpperCase() + name.slice(1)
  const componentDir = path.join(process.cwd(), basePath, componentName)

  // 创建目录
  fs.mkdirSync(componentDir, { recursive: true })

  // 生成组件文件
  const componentContent = generateComponentTemplate(componentName, typescript, style)
  const ext = typescript ? 'vue' : 'vue'
  fs.writeFileSync(path.join(componentDir, `${componentName}.${ext}`), componentContent)

  // 生成样式文件
  if (style !== 'none') {
    const styleContent = generateStyleTemplate(componentName)
    const styleExt = style === 'scss' ? 'scss' : 'css'
    fs.writeFileSync(path.join(componentDir, `${componentName}.${styleExt}`), styleContent)
  }

  // 生成类型文件
  if (typescript) {
    const typesContent = generateTypesTemplate(componentName)
    fs.writeFileSync(path.join(componentDir, `${componentName}.types.ts`), typesContent)
  }

  console.log(`✨ Component ${componentName} created successfully!`)
}

function generateComponentTemplate(name: string, typescript: boolean, style: string): string {
  return `<template>
  <div class="${name.toLowerCase()}">
    <h1>{{ title }}</h1>
  </div>
</template>

<script${typescript ? ' setup lang="ts"' : ''}>
${typescript ? `import { ref } from 'vue'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '${name}'
})` : `export default {
  name: '${name}',
  props: {
    title: {
      type: String,
      default: '${name}'
    }
  }
}`}
</script>

${style !== 'none' ? `<style src="./${name}.${style === 'scss' ? 'scss' : 'css'}" scoped></style>` : `<style scoped>
.${name.toLowerCase()} {
  /* Add styles here */
}
</style>`}
`
}

function generateStyleTemplate(name: string): string {
  return `.${name.toLowerCase()} {
  /* Add styles here */
}
`
}

function generateTypesTemplate(name: string): string {
  return `export interface ${name}Props {
  title?: string
}

export interface ${name}Emits {
  (e: 'click', value: string): void
}
`
}
```

### 39.5 版本管理（Changesets）

#### 39.5.1 Changesets 配置

```bash
npm install -D @changesets/cli
```

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@2.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@my-monorepo/playground"]
}
```

#### 39.5.2 使用 Changesets

```bash
# 创建 changeset
pnpm changeset

# 版本更新
pnpm changeset version

# 发布
pnpm changeset publish

# 生成变更日志
pnpm changeset gen
```

### 39.6 文档站点（VitePress）

#### 39.6.1 VitePress 配置

```bash
npm install -D vitepress
```

```typescript
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'My Component Library',
  description: 'A Vue 3 component library',

  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '组件', link: '/components/button' },
      { text: '更新日志', link: 'https://github.com/xxx/releases' }
    ],

    sidebar: {
      '/guide/': [
        { text: '开始', link: '/guide/getting-started' },
        { text: '安装', link: '/guide/installation' }
      ],
      '/components/': [
        { text: 'Button 按钮', link: '/components/button' },
        { text: 'Input 输入框', link: '/components/input' },
        { text: 'Modal 对话框', link: '/components/modal' }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xxx' }
    ]
  },

  markdown: {
    config: (md) => {
      // 添加自定义组件
      md.use(componentDemo)
    }
  },

  vite: {
    ssr: {
      noExternal: ['@my-monorepo/components']
    }
  }
})
```

#### 39.6.2 组件演示插件

```typescript
// docs/.vitepress/plugins/component-demo.ts
import type { Plugin } from 'vite'

export function componentDemo(): Plugin {
  return {
    name: 'component-demo',
    transform(code, id) {
      if (!id.endsWith('.md')) return null

      // 转换 <!--demo--> 标记
      return code.replace(
        /<!--demo-->([\s\S]*?)<!--demo-->/g,
        (_, content) => {
          return `<DemoClient>${content}</DemoClient>`
        }
      )
    }
  }
}
```

### 39.7 性能优化与监控

#### 39.7.1 构建分析

```typescript
// vite-plugin-analyzer.ts
import type { Plugin } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export function analyzerPlugin(): Plugin {
  return visualizer({
    filename: './dist/stats.html',
    open: true,
    gzipSize: true,
    brotliSize: true
  })
}
```

#### 39.7.2 Bundle 监控

```typescript
// vite-plugin-bundle-monitor.ts
import type { Plugin } from 'vite'

export function bundleMonitorPlugin(options = {}): Plugin {
  const { limit = 500 } = options

  return {
    name: 'bundle-monitor',

    generateBundle(options, bundle) {
      for (const [fileName, fileInfo] of Object.entries(bundle)) {
        if (fileInfo.type === 'chunk') {
          const size = fileInfo.code.length / 1024

          if (size > limit) {
            this.warn(
              `Bundle ${fileName} is ${size.toFixed(2)}KB ` +
              `(exceeds ${limit}KB limit)`
            )
          }
        }
      }
    }
  }
}
```

### 39.8 工程化最佳实践

#### 39.8.1 项目初始化检查清单

```typescript
// scripts/check-project.ts
import fs from 'fs'
import path from 'path'

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
}

export function checkProject(): CheckResult[] {
  const results: CheckResult[] = []

  // 检查必要文件
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    '.gitignore',
    '.env.example',
    'README.md'
  ]

  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file))
    results.push({
      name: file,
      status: exists ? 'pass' : 'fail',
      message: exists ? '存在' : '缺失'
    })
  }

  // 检查必要脚本
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
  const requiredScripts = ['dev', 'build', 'test', 'lint']

  for (const script of requiredScripts) {
    const exists = !!pkg.scripts[script]
    results.push({
      name: `script: ${script}`,
      status: exists ? 'pass' : 'fail',
      message: exists ? '已配置' : '未配置'
    })
  }

  // 检查 ESLint
  results.push({
    name: 'ESLint',
    status: fs.existsSync('.eslintrc.js') ? 'pass' : 'warn',
    message: fs.existsSync('.eslintrc.js') ? '已配置' : '建议配置'
  })

  // 检查 Prettier
  results.push({
    name: 'Prettier',
    status: fs.existsSync('.prettierrc') ? 'pass' : 'warn',
    message: fs.existsSync('.prettierrc') ? '已配置' : '建议配置'
  })

  // 检查 Git Hooks
  results.push({
    name: 'Husky',
    status: fs.existsSync('.husky') ? 'pass' : 'warn',
    message: fs.existsSync('.husky') ? '已配置' : '建议配置'
  })

  return results
}
```

### 39.9 本章小结

| 工程化领域 | 推荐工具 | 核心价值 |
|----------|----------|----------|
| Monorepo | pnpm workspace + Turbo | 代码共享、统一构建 |
| 代码规范 | ESLint + Prettier + Husky | 自动化代码检查 |
| 版本管理 | Changesets | 规范版本发布 |
| 文档站点 | VitePress | 组件文档演示 |
| 自动化 | Hygen | 模板代码生成 |

---
