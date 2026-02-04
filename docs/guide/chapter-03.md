# ESLint代码检查

## ESLint代码检查

> **ESLint 是什么？**
> ESLint 是一个插件化的 JavaScript/TypeScript 代码检查工具，可以：
> - 检查代码语法错误
> - 检查代码质量问题（未使用变量、潜在bug等）
> - 自动修复部分问题
> - 自定义规则配置
> - 与代码编辑器集成，实时提示

### 安装 ESLint

#### 基础安装

```bash
# 安装 ESLint
npm install -D eslint

# 初始化 ESLint 配置（交互式命令）
npx eslint --init
```

#### Vue3 项目完整安装

```bash
# 安装 ESLint 及 Vue3 相关插件
npm install -D eslint \
  eslint-plugin-vue \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-config-prettier
```

### ESLint 配置文件

#### ESLint 9+ 扁平化配置

```javascript
// eslint.config.js (ESLint 9+ 新格式)
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'

export default [
  // 忽略文件
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts']
  },

  // JavaScript/TypeScript 基础规则
  js.configs.recommended,

  // Vue 规则
  ...vue.configs['flat/recommended'],

  // Prettier 兼容（放在最后以覆盖其他配置）
  prettier,

  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      parser: vue.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: {
          ts: typescriptParser
        }
      },
      globals: {
        browser: true,
        es2021: true,
        node: true
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      vue
    },
    rules: {
      // Vue 规则
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'off',
      'vue/require-prop-types': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/no-unused-vars': ['error', { ignorePattern: '^_' }],
      'vue/no-setup-props-destructure': 'off',

      // TypeScript 规则
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // JavaScript 基础规则
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-var': 'error',
      'prefer-const': 'error'
    }
  }
]
```

#### ESLint 8 及以下配置格式

```javascript
// .eslintrc.cjs (ESLint 8 及以下)
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
    'vue/no-v-html': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prefer-const': 'error',
    'no-var': 'error'
  }
}
```

### ESLint 常用规则说明

#### Vue 相关规则

| 规则 | 说明 | 推荐值 |
|------|------|--------|
| `vue/multi-word-component-names` | 组件名必须是多个单词 | `off` |
| `vue/no-v-html` | 禁止使用 v-html（防XSS） | `warn` |
| `vue/require-prop-types` | props 必须有类型定义 | `error` |
| `vue/component-name-in-template-casing` | 模板中组件名大小写 | `'PascalCase'` |
| `vue/no-unused-vars` | 禁止未使用的变量 | `error` |
| `vue/no-setup-props-destructure` | 禁止解构 props | `off` |
| `vue/require-default-prop` | props 必须有默认值 | `off` |
| `vue/html-self-closing` | 自闭合标签规范 | `'always'` |

#### TypeScript 相关规则

| 规则 | 说明 | 推荐值 |
|------|------|--------|
| `@typescript-eslint/no-explicit-any` | 禁止使用 any | `warn` |
| `@typescript-eslint/no-unused-vars` | 禁止未使用的变量 | `error` |
| `@typescript-eslint/ban-ts-comment` | 禁止使用 @ts-ignore | `warn` |
| `@typescript-eslint/no-non-null-assertion` | 禁止使用 ! | `warn` |
| `@typescript-eslint/consistent-type-imports` | 类型导入一致性 | `error` |

#### JavaScript 基础规则

| 规则 | 说明 | 推荐值 |
|------|------|--------|
| `no-var` | 禁止使用 var | `error` |
| `prefer-const` | 优先使用 const | `error` |
| `no-console` | 禁止使用 console | `'warn'` (生产环境) |
| `no-debugger` | 禁止使用 debugger | `'error'` (生产环境) |
| `no-unused-vars` | 禁止未使用的变量 | `error` |

### ESLint 忽略配置

#### 使用 ignores 配置（ESLint 9+）

```javascript
// eslint.config.js
export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      'build/**',
      'coverage/**'
    ]
  },
  // ... 其他配置
]
```

#### 使用 .eslintignore 文件

```bash
# .eslintignore
dist/
build/
node_modules/
*.config.js
*.config.ts
coverage/
public/
```

### NPM 脚本配置

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .vue,.js,.ts",
    "lint:fix": "eslint . --ext .vue,.js,.ts --fix",
    "lint:debug": "eslint . --ext .vue,.js,.ts --debug"
  }
}
```

### ESLint 与 Husky 集成（自动检查）

```bash
# 安装依赖
npm install -D husky lint-staged

# 初始化 Husky
npx husky install
npm pkg set scripts.prepare="husky install"
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{vue,js,ts}": [
      "eslint --fix"
    ]
  }
}
```

---
