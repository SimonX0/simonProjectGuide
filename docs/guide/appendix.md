# 学习资源推荐

## 附录：学习资源推荐

### 官方资源

| 资源名称 | 链接 | 说明 |
|----------|------|------|
| Vue3官方文档 | https://cn.vuejs.org/ | 最权威的Vue3学习资源 |
| Vue Router文档 | https://router.vuejs.org/zh/ | 官方路由库文档 |
| Pinia文档 | https://pinia.vuejs.org/zh/ | 官方状态管理库文档 |
| Vite文档 | https://cn.vitejs.dev/ | 官方构建工具文档 |
| TypeScript文档 | https://www.typescriptlang.org/zh/ | TS官方中文文档 |
| ElementPlus文档 | https://element-plus.org/zh-CN/ | UI组件库文档 |

### 推荐书籍

| 书名 | 作者 | 难度 | 说明 |
|------|------|------|------|
| 《Vue.js设计与实现》 | 霍春阳 | 中高 | 深入理解Vue3源码 |
| 《Vue3企业级应用开发实战》 | 陈立 | 中 | 企业项目实战指南 |
| 《TypeScript编程》 | Boris Cherny | 中 | TS全面教程 |
| 《深入浅出Vue.js》 | 刘博文 | 中 | Vue2/Vue3对比学习 |

### 视频教程

| 课程名称 | 平台 | 讲师 | 时长 | 说明 |
|----------|------|------|------|------|
| Vue3 + TypeScript实战教程 | Bilibili | 尚硅谷 | 40h | 系统全面 |
| Vue3组件库开发实战 | Bilibili | 代码随想录 | 20h | 实战导向 |
| Pinia状态管理精讲 | Bilibili | coderwhy | 8h | 专注状态管理 |
| Vue3源码解析 | Bilibili | 霍春阳 | 15h | 深入源码 |

### 优质博客

| 博客名称 | 链接 | 说明 |
|----------|------|------|
| Vue.js技术社区 | https://vue3js.cn/ | 中文Vue社区 |
| 掘金Vue专栏 | https://juejin.cn/tag/Vue.js | 大量实战文章 |
| 阮一峰的网络日志 | https://www.ruanyifeng.com/blog/ | 技术随笔 |
| 黄玄的博客 | https://huangxuan.me/ | Vue团队成员 |

### 实用工具

| 工具名称 | 用途 | 链接 |
|----------|------|------|
| VueUse | 组合式函数集 | https://vueuse.org/ |
| Vue DevTools | 浏览器调试插件 | Chrome/Firefox商店 |
| Volar | VS Code插件 | VS Code扩展市场 |
| Vitest | 单元测试框架 | https://vitest.dev/ |
| Vue SFC Playground | 在线编写Vue组件 | https://play.vuejs.org/ |

---

## 学习建议与心得

### 学习阶段建议

**初学者（第1-2周）**
- 重点是理解Vue3的核心概念和响应式原理
- 每个知识点都要动手实践，不要只看不练
- 遇到问题先查官方文档，再寻求帮助
- 建议每天学习3-4小时，保持连续性

**进阶者（第3周）**
- 重点关注项目架构和性能优化
- 学习企业级开发的最佳实践
- 尝试阅读一些优秀开源项目的源码
- 开始做自己的项目，将所学知识应用到实际

**高级开发者（第4周+）**
- 深入学习源码，理解底层原理
- 关注前端工程化、性能优化
- 尝试开发自己的组件库或插件
- 参与开源社区，贡献代码

---

## 附录B：VSCode配置推荐

> **为什么要配置VSCode？**
>
> 一个好的开发环境能大幅提升开发效率。本附录提供：
> - 精选扩展列表
> - 优化后的settings.json配置
> - 实用代码片段
> - 常用快捷键清单

### B.1 推荐扩展列表

#### 必装扩展（Vue3开发必备）

```json
[
  // Vue3核心
  "Vue.volar",                    // Vue语言支持
  "Vue.vscode-typescript-vue-plugin", // TypeScript插件

  // 代码质量
  "dbaeumer.vscode-eslint",       // ESLint
  "esbenp.prettier-vscode",       // Prettier
  "stylelint.vscode-stylelint",   // Stylelint

  // Git工具
  "eamodio.gitlens",              // Git超级增强
  "mhutchie.git-graph",           // Git提交图谱

  // 代码效率
  "formulahendry.auto-rename-tag", // 自动重命名标签
  "christian-kohler.path-intellisense", // 路径智能提示
  "streetsidesoftware.code-spell-checker", // 拼写检查

  // AI辅助
  "GitHub.copilot",               // GitHub Copilot
  "GitHub.copilot-chat",          // Copilot Chat

  // 浏览器
  "msjsdiag.debugger-for-chrome", // Chrome调试

  // 其他
  "usernamehw.errorlens",         // 行内错误显示
  "wix.vscode-import-cost",       // 包大小提示
  " EditorConfig.EditorConfig",   // EditorConfig
  "wayou.vscode-todo-highlight",  // TODO高亮
  "eamodio.vscode-gitlens"        // Git增强
]
```

#### 推荐扩展（提升效率）

```json
[
  // 中文支持
  "MS-CEINTL.vscode-language-pack-zh-hans", // 中文语言包

  // 主题
  "PKief.material-icon-theme",   // Material图标主题
  "zhuangtongfa.material-theme", // One Dark Pro主题

  // Markdown
  "yzhang.markdown-all-in-one",  // Markdown全能插件
  "shd101wyy.markdown-preview-enhanced", // 增强预览

  // REST API
  "huibizhang.vscode-restclient", // REST Client

  // 代码截图
  "kaiyin.vscode-plugin-drawio", // Draw.io集成
  "bierner.markdown-mermaid",     // Mermaid图表

  // 实用工具
  "Gruntfuggly.todo-tree",        // TODO树
  "wakatime.vscode-wakatime",     // 编程时间统计
  "alefragnani.bookmarks",        // 书签管理
  "chrmarti.regex",               // 正则表达式测试

  // Docker
  "ms-azuretools.vscode-docker",  // Docker支持

  // 数据库
  "mtxr.sqltools",                // 数据库连接

  // 包管理器
  "visualstudioexptteam.vscodeintellicode", // Intellicode
]
```

### B.2 settings.json配置

创建 `.vscode/settings.json`：

```json
{
  // ===== 编辑器基础配置 =====
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },

  // ===== 文件配置 =====
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,

  // ===== Vue/Vue组件配置 =====
  "volar.autoCompleteRefs": true,
  "volar.completion.autoImportComponent": true,
  "volar.codeLens.pugTools": false,
  "volar.takeOverMode.enabled": true,

  // ===== TypeScript配置 =====
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,

  // ===== ESLint配置 =====
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "eslint.options": {
    "extensions": [".js", ".jsx", ".ts", ".tsx", ".vue"]
  },

  // ===== Prettier配置 =====
  "prettier.enable": true,
  "prettier.semi": true,
  "prettier.singleQuote": true,
  "prettier.trailingComma": "es5",
  "prettier.printWidth": 100,
  "prettier.arrowParens": "always",

  // ===== Stylelint配置 =====
  "stylelint.enable": true,
  "css.validate": false,
  "less.validate": false,
  "scss.validate": false,

  // ===== Vue配置 =====
  "volar.completion.preferredTagNameCase": "kebab",
  "volar.completion.preferredAttrNameCase": "kebab",

  // ===== 文件关联 =====
  "files.associations": {
    "*.vue": "vue",
    "*.wxml": "xml",
    "*.wxss": "css",
    "*.cjson": "jsonc",
    "*.wxs": "javascript"
  },

  // ===== 排除文件 =====
  "files.exclude": {
    "**/.git": true,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/.vite": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/bower_components": true,
    "**/*.code-search": true,
    "**/dist": true
  },

  // ===== 主题配置 =====
  "workbench.colorTheme": "One Dark Pro",
  "workbench.iconTheme": "material-icon-theme",
  "workbench.startupEditor": "welcomePageInEmptyWorkbench",

  // ===== 终端配置 =====
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.fontSize": 13,

  // ===== 其他配置 =====
  "emmet.includeLanguages": {
    "vue": "html",
    "vue-html": "html"
  },
  "emmet.triggerExpansionOnTab": true,
  "breadcrumbs.enabled": true,
  "editor.minimap.enabled": false,
  "editor.suggestSelection": "first",
  "editor.quickSuggestions": {
    "other": true,
    "comments": false,
    "strings": false
  },

  // ===== 路径映射 =====
  "path-intellisense.mappings": {
    "@": "${workspaceFolder}/src"
  },

  // ===== Copilot配置 =====
  "github.copilot.enable": {
    "*": true,
    "yaml": false,
    "plaintext": false,
    "markdown": true
  },
  "github.copilot.inlineSuggest.enable": true
}
```

### B.3 snippets代码片段

创建 `.vscode/vue3.code-snippets`：

```json
{
  "Vue3 Composition API组件": {
    "prefix": "vue3",
    "description": "Vue3 Composition API组件模板",
    "body": [
      "<template>",
      "  <div class=\"${1:component-name}\">",
      "    <!-- ${2:内容} -->",
      "  </div>",
      "</template>",
      "",
      "<script setup lang=\"ts\">",
      "import { ref, computed, onMounted } from 'vue'",
      "",
      "// ${3:状态定义}",
      "const count = ref(0)",
      "",
      "// ${4:生命周期}",
      "onMounted(() => {",
      "  //",
      "})",
      "</script>",
      "",
      "<style scoped lang=\"scss\">",
      ".${1:component-name} {",
      "  //",
      "}",
      "</style>"
    ]
  },

  "Vue3 Props定义": {
    "prefix": "vue-props",
    "description": "Vue3 Props定义模板",
    "body": [
      "interface ${1:Props} {",
      "  ${2:modelValue}?: ${3:string}",
      "  ${4:disabled}?: ${5:boolean}",
      "}",
      "",
      "const props = withDefaults(defineProps<${1:Props}>(), {",
      "  ${2:modelValue}: '',",
      "  ${4:disabled}: false,",
      "})"
    ]
  },

  "Vue3 Emits定义": {
    "prefix": "vue-emits",
    "description": "Vue3 Emits定义模板",
    "body": [
      "interface Emits {",
      "  (e: '${1:update:modelValue}', value: ${2:string}): void",
      "  (e: '${3:change}', value: ${4:any}): void",
      "}",
      "",
      "const emit = defineEmits<Emits>()"
    ]
  },

  "Vue3 Ref定义": {
    "prefix": "vue-ref",
    "description": "创建ref响应式变量",
    "body": [
      "const ${1:variable} = ref<${2:string}>('${3:default}')"
    ]
  },

  "Vue3 Reactive定义": {
    "prefix": "vue-reactive",
    "description": "创建reactive响应式对象",
    "body": [
      "interface ${1:State} {",
      "  ${2:count}: number",
      "  ${3:name}: string",
      "}",
      "",
      "const ${4:state} = reactive<${1:State}>({",
      "  ${2:count}: 0,",
      "  ${3:name}: '',",
      "})"
    ]
  },

  "Vue3 Computed定义": {
    "prefix": "vue-computed",
    "description": "创建computed计算属性",
    "body": [
      "const ${1:computedValue} = computed(() => {",
      "  return ${2:state.value} * 2",
      "})"
    ]
  },

  "Vue3 Watch定义": {
    "prefix": "vue-watch",
    "description": "创建watch监听器",
    "body": [
      "watch(",
      "  () => ${1:source},",
      "  (${2:newValue}, ${3:oldValue}) => {",
      "    //",
      "  },",
      "  { immediate: true, deep: true }",
      ")"
    ]
  },

  "Vue3 useLocalStorage": {
    "prefix": "vue-storage",
    "description": "使用useLocalStorage持久化",
    "body": [
      "import { useStorage } from '@vueuse/core'",
      "",
      "const ${1:variable} = useStorage('${2:key}', ${3:defaultValue})"
    ]
  },

  "Vue3 Router使用": {
    "prefix": "vue-router",
    "description": "Vue Router使用模板",
    "body": [
      "import { useRouter, useRoute } from 'vue-router'",
      "",
      "const router = useRouter()",
      "const route = useRoute()",
      "",
      "// 导航",
      "router.push('${1:path}')",
      "",
      "// 获取参数",
      "const ${2:id} = route.params.${3:id}"
    ]
  },

  "Vue3 Pinia Store使用": {
    "prefix": "vue-pinia",
    "description": "Pinia Store使用模板",
    "body": [
      "import { use${1:User}Store } from '@/stores/${2:user}'",
      "",
      "const ${3:userStore} = use${1:User}Store()",
      "",
      "// 访问state",
      "const ${4:userInfo} = computed(() => ${3:userStore}.${4:userInfo})",
      "",
      "// 调用action",
      "${3:userStore}.${5:fetchData}()"
    ]
  },

  "Vue3 onMounted生命周期": {
    "prefix": "vue-mounted",
    "description": "onMounted生命周期钩子",
    "body": [
      "onMounted(() => {",
      "  //",
      "})"
    ]
  },

  "Vue3 API请求函数": {
    "prefix": "vue-fetch",
    "description": "API请求函数模板",
    "body": [
      "import { ref } from 'vue'",
      "import { useFetch } from '@vueuse/core'",
      "",
      "const ${1:data} = ref(null)",
      "const ${2:loading} = ref(false)",
      "const ${3:error} = ref(null)",
      "",
      "const ${4:fetchData} = async () => {",
      "  ${2:loading}.value = true",
      "  try {",
      "    const response = await fetch('${5:url}')",
      "    ${1:data}.value = await response.json()",
      "  } catch (err) {",
      "    ${3:error}.value = err",
      "  } finally {",
      "    ${2:loading}.value = false",
      "  }",
      "}"
    ]
  },

  "Vue3 组件样式定义": {
    "prefix": "vue-style",
    "description": "Vue组件样式定义",
    "body": [
      "<style scoped lang=\"scss\">",
      ".${1:component-name} {",
      "  &__${2:element} {",
      "    //",
      "  }",
      "",
      "  &--${3:modifier} {",
      "    //",
      "  }",
      "}",
      "</style>"
    ]
  },

  "TypeScript接口定义": {
    "prefix": "ts-interface",
    "description": "TypeScript接口定义",
    "body": [
      "interface ${1:InterfaceName} {",
      "  ${2:property}: ${3:string}",
      "  ${4:id}: number",
      "  ${5:createdAt}?: Date",
      "}"
    ]
  },

  "TypeScript类型定义": {
    "prefix": "ts-type",
    "description": "TypeScript类型定义",
    "body": [
      "type ${1:TypeName} = {",
      "  ${2:property}: ${3:string}",
      "  ${4:id}: number",
      "}"
    ]
  }
}
```

### B.4 快捷键清单

#### Windows/Linux快捷键

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| **命令面板** | `Ctrl+Shift+P` | 打开命令面板 |
| **快速打开** | `Ctrl+P` | 快速打开文件 |
| **新建文件** | `Ctrl+N` | 新建文件 |
| **保存文件** | `Ctrl+S` | 保存当前文件 |
| **全部保存** | `Ctrl+Shift+S` | 保存所有文件 |
| **关闭文件** | `Ctrl+W` | 关闭当前文件 |
| **重新打开** | `Ctrl+Shift+T` | 重新打开关闭的文件 |

#### 编辑快捷键

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| **剪切行** | `Ctrl+X` | 剪切当前行 |
| **复制行** | `Ctrl+C` | 复制当前行 |
| **删除行** | `Ctrl+Shift+K` | 删除当前行 |
| **上移行** | `Alt+Up` | 当前行上移 |
| **下移行** | `Alt+Down` | 当前行下移 |
| **多光标** | `Alt+Click` | 添加多个光标 |
| **查找** | `Ctrl+F` | 在文件中查找 |
| **替换** | `Ctrl+H` | 在文件中替换 |
| **全局查找** | `Ctrl+Shift+F` | 在所有文件中查找 |
| **全局替换** | `Ctrl+Shift+H` | 在所有文件中替换 |

#### Vue3开发常用快捷键

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| **格式化文档** | `Shift+Alt+F` | 格式化当前文件 |
| **切换侧边栏** | `Ctrl+B` | 显示/隐藏侧边栏 |
| **切换终端** | `Ctrl+~` | 显示/隐藏终端 |
| **新建终端** | `Ctrl+Shift+~` | 新建终端 |
| **问题面板** | `Ctrl+Shift+M` | 显示错误和警告 |
| **输出面板** | `Ctrl+Shift+U` | 显示输出 |
| **GitLens** | `Ctrl+Shift+G` | 显示Git更改 |

#### 自定义快捷键推荐

创建 `.vscode/keybindings.json`：

```json
[
  // 格式化
  {
    "key": "ctrl+shift+f",
    "command": "editor.action.formatDocument"
  },

  // 快速切换文件
  {
    "key": "ctrl+e",
    "command": "workbench.action.quickOpen"
  },

  // 切换侧边栏
  {
    "key": "ctrl+b",
    "command": "workbench.action.toggleSidebarVisibility"
  },

  // 显示问题
  {
    "key": "ctrl+shift+m",
    "command": "workbench.actions.view.problems"
  },

  // 终端
  {
    "key": "ctrl+`",
    "command": "workbench.action.terminal.toggleTerminal"
  },

  // 新建文件
  {
    "key": "ctrl+alt+n",
    "command": "explorer.newFile"
  },

  // 跳转到定义
  {
    "key": "f12",
    "command": "editor.action.goToDeclaration"
  },

  // 查找引用
  {
    "key": "shift+f12",
    "command": "editor.action.goToReferences"
  },

  // 重命名符号
  {
    "key": "f2",
    "command": "editor.action.rename"
  }
]
```

---

## 附录C：代码模板与脚手架

> **为什么需要代码模板？**
>
> 开箱即用的模板能：
> - 统一项目结构
> - 节省初始化时间
> - 避免重复配置
> - 包含最佳实践

### C.1 Vue3 + TypeScript 模板

#### 项目结构

```
vue3-ts-template/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/           # 静态资源
│   │   ├── images/
│   │   └── styles/
│   ├── components/       # 公共组件
│   │   └── common/
│   ├── composables/      # 组合式函数
│   ├── layouts/          # 布局组件
│   ├── router/           # 路由配置
│   │   └── index.ts
│   ├── stores/           # Pinia状态管理
│   ├── types/            # TypeScript类型
│   │   └── index.ts
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   ├── App.vue
│   └── main.ts
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

#### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus']
        }
      }
    }
  }
})
```

#### tsconfig.json

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

    /* Path Mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'vue/no-v-html': 'off'
  }
}
```

#### package.json

```json
{
  "name": "vue3-ts-template",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "@vueuse/core": "^10.7.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/tsconfig": "^0.5.0",
    "typescript": "~5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0",
    "eslint": "^8.56.0",
    "plugin:vue/vue3-recommended": "^0.0.0",
    "@vue/eslint-config-typescript": "^12.0.0"
  }
}
```

### C.2 Vue3 + Vite + Pinia 模板

#### 完整的Pinia Store模板

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string>('')

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name || 'Guest')

  // Actions
  const setUser = (userData: User) => {
    user.value = userData
  }

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  const clearAuth = () => {
    user.value = null
    token.value = ''
  }

  const updateUser = (updates: Partial<User>) => {
    if (user.value) {
      Object.assign(user.value, updates)
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    userName,
    setUser,
    setToken,
    clearAuth,
    updateUser
  }
})
```

### C.3 组件开发模板

#### 基础组件模板

```vue
<!-- src/components/common/BaseButton.vue -->
<template>
  <button
    :class="[
      'base-button',
      `base-button--${type}`,
      `base-button--${size}`,
      { 'base-button--disabled': disabled }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary' | 'danger' | 'warning'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
.base-button {
  // 基础样式
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  // 类型样式
  &--primary {
    background-color: #42b883;
    color: white;

    &:hover {
      background-color: #33a06f;
    }
  }

  &--secondary {
    background-color: #6c757d;
    color: white;
  }

  &--danger {
    background-color: #dc3545;
    color: white;
  }

  // 尺寸样式
  &--small {
    padding: 6px 12px;
    font-size: 12px;
  }

  &--medium {
    padding: 8px 16px;
    font-size: 14px;
  }

  &--large {
    padding: 12px 24px;
    font-size: 16px;
  }

  // 禁用状态
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
```

#### 表单组件模板

```vue
<!-- src/components/common/BaseInput.vue -->
<template>
  <div class="base-input">
    <label v-if="label" class="base-input__label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'base-input__field',
        { 'base-input__field--error': error }
      ]"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    >

    <span v-if="error" class="base-input__error">
      {{ error }}
    </span>

    <span v-if="hint" class="base-input__hint">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>

<style scoped lang="scss">
.base-input {
  margin-bottom: 16px;

  &__label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #333;

    .required {
      color: #f56c6c;
      margin-left: 4px;
    }
  }

  &__field {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: #42b883;
    }

    &--error {
      border-color: #f56c6c;
    }
  }

  &__error {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #f56c6c;
  }

  &__hint {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
```

### C.4 项目结构模板

#### 完整的src目录结构

```
src/
├── App.vue                    # 根组件
├── main.ts                    # 入口文件
│
├── assets/                    # 静态资源
│   ├── images/                # 图片
│   │   ├── logo.png
│   │   └── placeholder.png
│   ├── styles/                # 全局样式
│   │   ├── index.scss         # 样式入口
│   │   ├── variables.scss     # 变量定义
│   │   ├── mixins.scss        # 混入
│   │   └── reset.scss         # 重置样式
│   └── icons/                 # 图标
│
├── components/                # 组件
│   ├── common/                # 通用组件
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseModal.vue
│   │   └── BaseTable.vue
│   ├── layout/                # 布局组件
│   │   ├── Header.vue
│   │   ├── Sidebar.vue
│   │   ├── Footer.vue
│   │   └── Breadcrumb.vue
│   └── business/              # 业务组件
│       ├── UserCard.vue
│       └── ProductList.vue
│
├── views/                     # 页面
│   ├── home/
│   │   └── index.vue
│   ├── about/
│   │   └── index.vue
│   └── user/
│       ├── Profile.vue
│       └── Settings.vue
│
├── router/                    # 路由
│   └── index.ts               # 路由配置
│
├── stores/                    # 状态管理
│   ├── user.ts                # 用户store
│   ├── app.ts                 # 应用store
│   └── index.ts               # store入口
│
├── composables/               # 组合式函数
│   ├── useAuth.ts             # 认证
│   ├── useRequest.ts          # 请求
│   ├── useLocalStorage.ts     # 本地存储
│   └── useTable.ts            # 表格
│
├── api/                       # API接口
│   ├── user.ts                # 用户API
│   ├── auth.ts                # 认证API
│   └── request.ts             # 请求封装
│
├── types/                     # 类型定义
│   ├── user.ts                # 用户类型
│   ├── api.ts                 # API类型
│   └── index.ts               # 类型导出
│
├── utils/                     # 工具函数
│   ├── format.ts              # 格式化
│   ├── validate.ts            # 验证
│   ├── storage.ts             # 存储
│   └── date.ts                # 日期
│
├── directives/                # 自定义指令
│   ├── permission.ts          # 权限指令
│   └── loading.ts             # 加载指令
│
├── constants/                 # 常量
│   ├── index.ts
│   └── enum.ts
│
└── config/                    # 配置文件
    └── index.ts
```

---

## 附录D：快速开始检查清单

### 项目初始化清单

```markdown
## 1. 环境准备
- [ ] Node.js 18+ 已安装
- [ ] pnpm/npm 已安装
- [ ] Git 已配置
- [ ] VSCode 已安装并配置

## 2. 项目创建
- [ ] 使用Vite创建项目
- [ ] 安装依赖
- [ ] 配置TypeScript
- [ ] 配置ESLint
- [ ] 配置Prettier

## 3. 代码规范
- [ ] .editorconfig 已配置
- [ ] .eslintrc 已配置
- [ ] .prettierrc 已配置
- [ ] Git hooks 已配置

## 4. 项目结构
- [ ] 目录结构已创建
- [ ] 路由已配置
- [ ] Pinia已配置
- [ ] 样式文件已配置

## 5. 开发环境
- [ ] 开发服务器启动
- [ ] 热更新正常
- [ ] 控制台无错误
- [ ] VSCode扩展已安装

## 6. Git仓库
- [ ] .gitignore 已配置
- [ ] README.md 已编写
- [ ] LICENSE 已添加
- [ ] 首次提交已完成
```

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v2.0**
**作者：小徐**
**邮箱：esimonx@163.com**

> 感谢你选择本教程！祝你在Vue3的学习之路上一帆风起！🚀
