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

## C.4 VSCode快捷键大全

### 🎯 通用操作（最常用）

| 功能 | Windows/Linux | macOS | 频率 |
|------|--------------|-------|------|
| **命令面板** | `Ctrl+Shift+P` | `Cmd+Shift+P` | ⭐⭐⭐⭐⭐ |
| **快速打开文件** | `Ctrl+P` | `Cmd+P` | ⭐⭐⭐⭐⭐ |
| **保存文件** | `Ctrl+S` | `Cmd+S` | ⭐⭐⭐⭐⭐ |
| **全部保存** | `Ctrl+Shift+S` | `Cmd+Shift+S` | ⭐⭐⭐⭐ |
| **关闭文件** | `Ctrl+W` | `Cmd+W` | ⭐⭐⭐⭐⭐ |
| **重新打开关闭的文件** | `Ctrl+Shift+T` | `Cmd+Shift+T` | ⭐⭐⭐⭐ |
| **新建文件** | `Ctrl+N` | `Cmd+N` | ⭐⭐⭐ |
| **新建窗口** | `Ctrl+Shift+N` | `Cmd+Shift+N` | ⭐⭐⭐ |

---

### 📝 编辑操作（高频使用）

#### 基础编辑

| 功能 | Windows/Linux | macOS | 说明 |
|------|--------------|-------|------|
| **撤销** | `Ctrl+Z` | `Cmd+Z` | 撤销上一步操作 |
| **重做** | `Ctrl+Shift+Z` | `Cmd+Shift+Z` | 重做上一步操作 |
| **剪切** | `Ctrl+X` | `Cmd+X` | 剪切选中内容 |
| **复制** | `Ctrl+C` | `Cmd+C` | 复制选中内容 |
| **粘贴** | `Ctrl+V` | `Cmd+V` | 粘贴内容 |
| **全选** | `Ctrl+A` | `Cmd+A` | 全选当前文件 |
| **删除行** | `Ctrl+Shift+K` | `Cmd+Shift+K` | 删除当前行 |

#### 行操作（必会）

| 功能 | Windows/Linux | macOS | 说明 |
|------|--------------|-------|------|
| **上移当前行** | `Alt+Up` | `Opt+Up` | 向上移动一行 |
| **下移当前行** | `Alt+Down` | `Opt+Down` | 向下移动一行 |
| **复制当前行** | `Shift+Alt+Down` | `Shift+Opt+Down` | 向下复制一行 |
| **向上复制行** | `Shift+Alt+Up` | `Shift+Opt+Up` | 向上复制一行 |
| **在上方插入行** | `Ctrl+Enter` | `Cmd+Enter` | 在当前行上方插入 |
| **在下方插入行** | `Ctrl+Shift+Enter` | `Cmd+Shift+Enter` | 在当前行下方插入 |
| **跳转到行** | `Ctrl+G` | `Cmd+G` | 跳转到指定行号 |
| **删除从光标到行尾** | `Ctrl+Shift+K` | `Cmd+Shift+K` | 删除到行尾 |

#### 代码块操作

| 功能 | Windows/Linux | macOS | 说明 |
|------|--------------|-------|------|
| **折叠/展开代码块** | `Ctrl+Shift+[` / `Ctrl+Shift+]` | `Cmd+Option+[` / `Cmd+Option+]` | 折叠展开 |
| **折叠所有** | `Ctrl+K Ctrl+0` | `Cmd+K Cmd+0` | 全部折叠 |
| **展开所有** | `Ctrl+K Ctrl+J` | `Cmd+K Cmd+J` | 全部展开 |
| **切换注释** | `Ctrl+/` | `Cmd+/` | 行注释 |
| **块注释** | `Shift+Alt+A` | `Shift+Opt+A` | 块注释 |

#### 多光标编辑（神器）

| 功能 | Windows/Linux | macOS | 说明 |
|------|--------------|-------|------|
| **多光标选择** | `Alt+Click` | `Opt+Click` | 点击添加光标 |
| **选中所有匹配** | `Ctrl+Shift+L` | `Cmd+Shift+L` | 选中所有相同词 |
| **下一个匹配** | `Ctrl+D` | `Cmd+D` | 选择下一个相同词 |
| **跳过当前匹配** | `Ctrl+K Ctrl+D` | `Cmd+K Cmd+D` | 跳过当前选择 |
| **光标上方添加** | `Ctrl+Alt+Up` | `Ctrl+Opt+Up` | 向上添加光标 |
| **光标下方添加** | `Ctrl+Alt+Down` | `Ctrl+Opt+Down` | 向下添加光标 |
| **列选择** | `Shift+Alt+拖动` | `Shift+Opt+拖动` | 列模式选择 |

---

### 🔍 查找与替换

| 功能 | Windows/Linux | macOS | 频率 |
|------|--------------|-------|------|
| **查找** | `Ctrl+F` | `Cmd+F` | ⭐⭐⭐⭐⭐ |
| **替换** | `Ctrl+H` | `Cmd+H` | ⭐⭐⭐⭐ |
| **全局查找** | `Ctrl+Shift+F` | `Cmd+Shift+F` | ⭐⭐⭐⭐⭐ |
| **全局替换** | `Ctrl+Shift+H` | `Cmd+Shift+H` | ⭐⭐⭐⭐ |
| **查找下一个** | `F3` / `Enter` | `F3` / `Enter` | ⭐⭐⭐⭐ |
| **查找上一个** | `Shift+F3` / `Shift+Enter` | `Shift+F3` | ⭐⭐⭐ |
| **选中所有查找结果** | `Alt+Enter` | `Opt+Enter` | ⭐⭐⭐⭐ |

---

### 🎨 界面与面板

| 功能 | Windows/Linux | macOS | 频率 |
|------|--------------|-------|------|
| **命令面板** | `Ctrl+Shift+P` | `Cmd+Shift+P` | ⭐⭐⭐⭐⭐ |
| **切换侧边栏** | `Ctrl+B` | `Cmd+B` | ⭐⭐⭐⭐⭐ |
| **显示资源管理器** | `Ctrl+Shift+E` | `Cmd+Shift+E` | ⭐⭐⭐⭐ |
| **显示搜索** | `Ctrl+Shift+F` | `Cmd+Shift+F` | ⭐⭐⭐⭐ |
| **显示源码管理** | `Ctrl+Shift+G` | `Cmd+Shift+G` | ⭐⭐⭐⭐ |
| **显示调试** | `Ctrl+Shift+D` | `Cmd+Shift+D` | ⭐⭐⭐ |
| **显示扩展** | `Ctrl+Shift+X` | `Cmd+Shift+X` | ⭐⭐⭐ |
| **切换终端** | `Ctrl+` ` ` | `Cmd+` ` ` | ⭐⭐⭐⭐⭐ |
| **新建终端** | `Ctrl+Shift+` ` ` | `Cmd+Shift+` ` ` | ⭐⭐⭐⭐ |
| **问题面板** | `Ctrl+Shift+M` | `Cmd+Shift+M` | ⭐⭐⭐⭐ |
| **输出面板** | `Ctrl+Shift+U` | `Cmd+Shift+U` | ⭐⭐⭐ |
| **快速打开** | `Ctrl+P` | `Cmd+P` | ⭐⭐⭐⭐⭐ |

---

### 🚀 导航与跳转

| 功能 | Windows/Linux | macOS | 频率 |
|------|--------------|-------|------|
| **跳转到定义** | `F12` | `F12` | ⭐⭐⭐⭐⭐ |
| **查看定义（侧边栏）** | `Alt+F12` | `Opt+F12` | ⭐⭐⭐⭐ |
| **查找所有引用** | `Shift+F12` | `Shift+F12` | ⭐⭐⭐⭐ |
| **跳转到实现** | `Ctrl+F12` | `Cmd+F12` | ⭐⭐⭐ |
| **打开符号** | `Ctrl+Shift+O` | `Cmd+Shift+O` | ⭐⭐⭐⭐ |
| **返回/前进** | `Alt+Left` / `Alt+Right` | `Cmd+[` / `Cmd+]` | ⭐⭐⭐⭐ |
| **返回上一个位置** | `Ctrl+Alt+-` | `Cmd+Alt+-` | ⭐⭐⭐⭐ |
| **前进到下一个位置** | `Ctrl+Shift+-` | `Cmd+Shift+-` | ⭐⭐⭐ |
| **转到文件** | `Ctrl+P` | `Cmd+P` | ⭐⭐⭐⭐⭐ |
| **转到行** | `Ctrl+G` | `Cmd+G` | ⭐⭐⭐⭐ |
| **转到符号** | `Ctrl+Shift+O` | `Cmd+Shift+O` | ⭐⭐⭐⭐ |
| **转到问题** | `Ctrl+Shift+M` | `Cmd+Shift+M` | ⭐⭐⭐ |
| **转到下一个错误/警告** | `F8` | `F8` | ⭐⭐⭐⭐ |
| **转到上一个错误/警告** | `Shift+F8` | `Shift+F8` | ⭐⭐⭐ |

---

### 🛠️ 代码编辑增强

| 功能 | Windows/Linux | macOS | 频率 |
|------|--------------|-------|------|
| **格式化文档** | `Shift+Alt+F` | `Shift+Opt+F` | ⭐⭐⭐⭐⭐ |
| **格式化选中部分** | `Ctrl+K Ctrl+F` | `Cmd+K Cmd+F` | ⭐⭐⭐⭐ |
| **触发建议** | `Ctrl+Space` | `Ctrl+Space` | ⭐⭐⭐⭐⭐ |
| **显示参数提示** | `Ctrl+Shift+Space` | `Cmd+Shift+Space` | ⭐⭐⭐⭐ |
| **显示快速信息** | `Ctrl+K Ctrl+I` | `Cmd+K Cmd+I` | ⭐⭐⭐ |
| **重命名符号** | `F2` | `F2` | ⭐⭐⭐⭐⭐ |
| **提取到变量** | `Ctrl+Shift+R` | `Cmd+Shift+R` | ⭐⭐⭐⭐ |
| **提取到函数** | `Ctrl+Shift+M` | `Cmd+Shift+M` | ⭐⭐⭐ |
| **智能操作** | `Ctrl+.` | `Cmd+.` | ⭐⭐⭐⭐⭐ |
| **显示重构** | `Ctrl+Shift+R` | `Ctrl+Shift+R` | ⭐⭐⭐ |
| **转到下一个问题** | `F8` | `F8` | ⭐⭐⭐⭐ |
| **转到上一个问题** | `Shift+F8` | `Shift+F8` | ⭐⭐⭐ |

---

### 📦 Vue3/前端开发专用

| 功能 | Windows/Linux | macOS | 频率 |
|------|--------------|-------|------|
| **Emmet展开缩写** | `Tab` / `E+Tab` | `Tab` / `E+Tab` | ⭐⭐⭐⭐⭐ |
| **Emmet包裹缩写** | `Ctrl+W` | `Cmd+W` | ⭐⭐⭐⭐ |
| **切换终端** | `Ctrl+` ` ` | `Cmd+` ` ` | ⭐⭐⭐⭐⭐ |
| **在终端打开文件** | `Ctrl+Shift+C` | `Cmd+Shift+C` | ⭐⭐⭐⭐ |
| **Git对比** | `Alt+D` | `Opt+D` | ⭐⭐⭐⭐ |
| **文件历史** | `Ctrl+Alt+H` | `Cmd+Opt+H` | ⭐⭐⭐ |
| **内联显示变量值** | `Alt+Hover` | `Opt+Hover` | ⭐⭐⭐ |
| **Peek定义** | `Alt+F12` | `Opt+F12` | ⭐⭐⭐⭐ |

---

### 🎯 标签页管理

| 功能 | Windows/Linux | macOS | 频率 |
|------|--------------|-------|------|
| **切换到下一个标签** | `Ctrl+Tab` | `Ctrl+Tab` | ⭐⭐⭐⭐ |
| **切换到上一个标签** | `Ctrl+Shift+Tab` | `Ctrl+Shift+Tab` | ⭐⭐⭐⭐ |
| **切换到标签N** | `Alt+N` | `Cmd+N` | ⭐⭐⭐⭐ |
| **关闭当前标签** | `Ctrl+W` | `Cmd+W` | ⭐⭐⭐⭐⭐ |
| **关闭其他标签** | `Ctrl+K W` | `Cmd+K W` | ⭐⭐⭐ |
| **关闭右侧所有标签** | `Ctrl+K Ctrl+Shift+W` | `Cmd+K Cmd+Shift+W` | ⭐⭐⭐ |
| **重新打开关闭的标签** | `Ctrl+Shift+T` | `Cmd+Shift+T` | ⭐⭐⭐⭐ |

---

### 🔧 调试快捷键

| 功能 | Windows/Linux | macOS | 频率 |
|------|--------------|-------|------|
| **开始调试** | `F5` | `F5` | ⭐⭐⭐⭐⭐ |
| **停止调试** | `Shift+F5` | `Shift+F5` | ⭐⭐⭐⭐⭐ |
| **重启调试** | `Ctrl+Shift+F5` | `Cmd+Shift+F5` | ⭐⭐⭐⭐ |
| **切换断点** | `F9` | `F9` | ⭐⭐⭐⭐⭐ |
| **单步跳过** | `F10` | `F10` | ⭐⭐⭐⭐ |
| **单步跳入** | `F11` | `F11` | ⭐⭐⭐⭐ |
| **单步跳出** | `Shift+F11` | `Shift+F11` | ⭐⭐⭐⭐ |

---

### 📊 窗口布局

| 功能 | Windows/Linux | macOS | 说明 |
|------|--------------|-------|------|
| **拆分编辑器** | `Ctrl+\` | `Cmd+\` | 左右拆分 |
| **拆分到下/上** | `Ctrl+K Ctrl+↓/↑` | `Cmd+K Cmd+↓/↑` | 上下拆分 |
| **聚焦到左侧组** | `Ctrl+K Ctrl+Left` | `Cmd+K Cmd+Left` | 聚焦左侧 |
| **聚焦到右侧组** | `Ctrl+K Ctrl+Right` | `Cmd+K Cmd+Right` | 聚焦右侧 |
| **聚焦到上方组** | `Ctrl+K Ctrl+Up` | `Cmd+K Cmd+Up` | 聚焦上方 |
| **聚焦到下方组** | `Ctrl+K Ctrl+Down` | `Cmd+K Cmd+Down` | 聚焦下方 |
| **切换编辑器组** | `Ctrl+1/2/3` | `Cmd+1/2/3` | 切换第N个组 |
| **关闭编辑器组** | `Ctrl+W` | `Cmd+W` | 关闭当前组 |

---

### 🖥️ 集成终端

| 功能 | Windows/Linux | macOS | 频率 |
|------|--------------|-------|------|
| **显示/隐藏终端** | `Ctrl+` ` ` | `Cmd+` ` ` | ⭐⭐⭐⭐⭐ |
| **新建终端** | `Ctrl+Shift+` ` ` | `Ctrl+Shift+` ` ` | ⭐⭐⭐⭐ |
| **向上滚动** | `Ctrl+Up` | `Cmd+Up` | ⭐⭐⭐ |
| **向下滚动** | `Ctrl+Down` | `Cmd+Down` | ⭐⭐⭐ |
| **切换焦点到终端** | `Ctrl+` ` ` | `Cmd+` ` ` | ⭐⭐⭐⭐⭐ |
| **在终端打开文件** | `Ctrl+Shift+C` | `Cmd+Shift+C` | ⭐⭐⭐ |
| **聚焦到上一个终端** | `Ctrl+PgUp` | `Cmd+PgUp` | ⭐⭐⭐ |
| **聚焦到下一个终端** | `Ctrl+PgDn` | `Cmd+PgDn` | ⭐⭐⭐ |

---

### 🎮 其他实用快捷键

| 功能 | Windows/Linux | macOS | 频率 |
|------|--------------|-------|------|
| **切换资源管理器** | `Ctrl+Shift+E` | `Cmd+Shift+E` | ⭐⭐⭐⭐ |
| **切换搜索** | `Ctrl+Shift+F` | `Cmd+Shift+F` | ⭐⭐⭐⭐ |
| **切换Git** | `Ctrl+Shift+G` | `Cmd+Shift+G` | ⭐⭐⭐⭐ |
| **切换调试** | `Ctrl+Shift+D` | `Cmd+Shift+D` | ⭐⭐⭐ |
| **切换扩展** | `Ctrl+Shift+X` | `Cmd+Shift+X` | ⭐⭐⭐ |
| **最小化侧边栏** | `Ctrl+B` | `Cmd+B` | ⭐⭐⭐⭐⭐ |
| **放大字体** | `Ctrl++` | `Cmd++` | ⭐⭐⭐ |
| **缩小字体** | `Ctrl+-` | `Cmd+-` | ⭐⭐⭐ |
| **重置字体大小** | `Ctrl+0` | `Cmd+0` | ⭐⭐⭐ |
| **缩放窗口** | `Ctrl+滚轮` | `Cmd+滚轮` | ⭐⭐⭐ |
| **全屏模式** | `F11` | `Ctrl+Cmd+F` | ⭐⭐⭐ |
| **Zen模式** | `Ctrl+K Z` | `Cmd+K Z` | ⭐⭐ |
| **退出Zen模式** | `Esc Esc` | `Esc Esc` | ⭐⭐ |

---

### 🔥 神级快捷键组合

这些快捷键组合能大幅提升开发效率：

1. **`Ctrl+P` → 输入`@` → 搜索符号** - 快速跳转到文件中的函数/类
2. **`Ctrl+P` → 输入`:` → 跳转到行号** - 快速跳转到指定行
3. **`Ctrl+P` → 输入`#` → 搜索标签名** - 在Vue/HTML中搜索标签
4. **`Ctrl+D` × N** - 批量选中相同词语进行编辑
5. **`Alt+Shift+拖动`** - 列选择模式，批量编辑
6. **`F12`** - 跳转到定义
7. **`Shift+F12`** - 查找所有引用
8. **`F2`** - 重命名变量/函数（全局重构）
9. **`Ctrl+.`** - 快速修复（导入、类型等）
10. **`Ctrl+Shift+K`** - 快速删除整行

---

### ⚙️ 自定义快捷键推荐

创建 `.vscode/keybindings.json`：

```json
[
  // ===== 基础操作 =====
  {
    "key": "ctrl+shift+f",
    "command": "editor.action.formatDocument",
    "when": "editorHasDocumentFormattingProvider && editorTextFocus && !editorReadonly && !inCompositeEditor"
  },

  {
    "key": "ctrl+e",
    "command": "workbench.action.quickOpen"
  },

  {
    "key": "ctrl+b",
    "command": "workbench.action.toggleSidebarVisibility"
  },

  // ===== 终端相关 =====
  {
    "key": "ctrl+`",
    "command": "workbench.action.terminal.toggleTerminal"
  },

  {
    "key": "ctrl+shift+`",
    "command": "workbench.action.terminal.new"
  },

  {
    "key": "ctrl+shift+c",
    "command": "workbench.action.terminal.openNativeConsole",
    "when": "terminalFocus"
  },

  // ===== 文件操作 =====
  {
    "key": "ctrl+alt+n",
    "command": "explorer.newFile"
  },

  {
    "key": "ctrl+shift+s",
    "command": "workbench.action.files.saveAll"
  },

  // ===== 导航相关 =====
  {
    "key": "ctrl+shift+e",
    "command": "workbench.view.explorer.focus"
  },

  {
    "key": "ctrl+shift+f",
    "command": "workbench.view.search.focus"
  },

  {
    "key": "ctrl+shift+g",
    "command": "workbench.view.scm.focus"
  },

  {
    "key": "ctrl+shift+d",
    "command": "workbench.view.debug.focus"
  },

  {
    "key": "ctrl+shift+x",
    "command": "workbench.view.extensions.focus"
  },

  // ===== 编辑器增强 =====
  {
    "key": "f12",
    "command": "editor.action.goToDeclaration"
  },

  {
    "key": "shift+f12",
    "command": "editor.action.goToReferences"
  },

  {
    "key": "f2",
    "command": "editor.action.rename"
  },

  {
    "key": "ctrl+shift+i",
    "command": "editor.action.organizeImports"
  },

  {
    "key": "ctrl+.",
    "command": "editor.action.quickFix",
    "when": "editorHasCodeActionsProvider && editorTextFocus && !inCompositeEditor"
  },

  // ===== 问题面板 =====
  {
    "key": "ctrl+shift+m",
    "command": "workbench.actions.view.problems"
  },

  {
    "key": "f8",
    "command": "workbench.action.problems.nextInFiles",
    "when": "markerPanelFocus"
  },

  {
    "key": "shift+f8",
    "command": "workbench.action.problems.previousInFiles",
    "when": "markerPanelFocus"
  },

  // ===== Git相关 =====
  {
    "key": "ctrl+shift+g",
    "command": "workbench.view.scm"
  },

  // ===== 窗口管理 =====
  {
    "key": "ctrl+\\",
    "command": "workbench.action.splitEditor"
  },

  {
    "key": "ctrl+alt+left",
    "command": "workbench.action.navigateBack"
  },

  {
    "key": "ctrl+alt+right",
    "command": "workbench.action.navigateForward"
  },

  // ===== 代码折叠 =====
  {
    "key": "ctrl+k ctrl+0",
    "command": "editor.foldAll",
    "when": "editorTextFocus"
  },

  {
    "key": "ctrl+k ctrl+j",
    "command": "editor.unfoldAll",
    "when": "editorTextFocus"
  },

  // ===== Vue3特定 =====
  {
    "key": "ctrl+alt+v",
    "command": "volar.action.vite"
  },

  {
    "key": "ctrl+alt+r",
    "command": "volar.action.restart"
  }
]
```

---

### 💡 效率提升建议

1. **必记快捷键**（Top 10）
   - `Ctrl+P` - 快速打开文件
   - `Ctrl+` ` ` - 切换终端
   - `Ctrl+B` - 切换侧边栏
   - `F12` - 跳转到定义
   - `F2` - 重命名
   - `Ctrl+D` - 多光标选择
   - `Ctrl+/` - 切换注释
   - `Alt+Up/Down` - 移动行
   - `Ctrl+Enter` - 下方插入行
   - `Ctrl+Shift+K` - 删除行

2. **每周掌握5个快捷键**
   - Week 1: 基础导航（P, B, Ctrl+`, Ctrl+W）
   - Week 2: 编辑操作（D, /, Alt+Up/Down）
   - Week 3: 代码跳转（F12, Shift+F12, F2）
   - Week 4: 多光标（Alt+Click, Ctrl+D, Ctrl+Alt+Down）
   - Week 5: 高级操作（Ctrl+., Ctrl+K, Ctrl+Shift+F）

3. **自定义快捷键原则**
   - 让常用操作一键可达
   - 避免与系统快捷键冲突
   - 按功能区域分组记忆
   - 保持跨平台一致性（尽可能）

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v2.0**
**作者：小徐**
**邮箱：esimonx@163.com**
