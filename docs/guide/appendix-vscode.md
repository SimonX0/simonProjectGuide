# 附录C：VSCode配置推荐

> **为什么要配置VSCode？**
>
> 一个好的开发环境能大幅提升开发效率。本附录提供：
> - 精选扩展列表
> - 优化后的settings.json配置
> - 实用代码片段
> - 常用快捷键清单

## C.1 推荐扩展列表

### 必装扩展（Vue3开发必备）

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
  "EditorConfig.EditorConfig",   // EditorConfig
  "wayou.vscode-todo-highlight",  // TODO高亮
  "eamodio.vscode-gitlens"        // Git增强
]
```

### 推荐扩展（提升效率）

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

## C.2 settings.json配置

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

## C.3 snippets代码片段

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

## C.4 快捷键清单

### Windows/Linux快捷键

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| **命令面板** | `Ctrl+Shift+P` | 打开命令面板 |
| **快速打开** | `Ctrl+P` | 快速打开文件 |
| **新建文件** | `Ctrl+N` | 新建文件 |
| **保存文件** | `Ctrl+S` | 保存当前文件 |
| **全部保存** | `Ctrl+Shift+S` | 保存所有文件 |
| **关闭文件** | `Ctrl+W` | 关闭当前文件 |
| **重新打开** | `Ctrl+Shift+T` | 重新打开关闭的文件 |

### 编辑快捷键

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

### Vue3开发常用快捷键

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| **格式化文档** | `Shift+Alt+F` | 格式化当前文件 |
| **切换侧边栏** | `Ctrl+B` | 显示/隐藏侧边栏 |
| **切换终端** | `Ctrl+~` | 显示/隐藏终端 |
| **新建终端** | `Ctrl+Shift+~` | 新建终端 |
| **问题面板** | `Ctrl+Shift+M` | 显示错误和警告 |
| **输出面板** | `Ctrl+Shift+U` | 显示输出 |
| **GitLens** | `Ctrl+Shift+G` | 显示Git更改 |

### 自定义快捷键推荐

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

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v2.0**
**作者：小徐**
**邮箱：esimonx@163.com**
