---
title: Biome 与工具链面试题
---

# Biome 与工具链面试题

## 什么是 Biome？

**Biome** = 新一代前端工具链，替代 ESLint + Prettier

**核心特点**：

- ⚡ **极快速度**：比 ESLint 快 30+ 倍，比 Prettier 快 15+ 倍
- 📦 **一体化**：格式化 + Lint 合二为一
- 🔧 **零配置**：开箱即用，智能默认值
- 🎯 **TypeScript 原生支持**：无需额外配置
- 💾 **共享配置**：团队配置统一

```bash
# 安装 Biome
npm install --save-dev @biomejs/biome

# 或使用 bun
bun add -d @biomejs/biome

# 检查代码
npx @biomejs/biome check src/

# 格式化代码
npx @biomejs/biome format --write src/

# 检查并自动修复
npx @biomejs/biome check --write src/
```

---

## 基础面试题

### Q1: Biome 和 ESLint + Prettier 的主要区别？

**功能对比**：

| 特性 | ESLint + Prettier | Biome |
|------|-------------------|-------|
| **Lint** | ESLint | ✅ 内置 |
| **格式化** | Prettier | ✅ 内置 |
| **速度** | 慢（10-30s） | 快（<1s） |
| **配置** | 复杂（多个文件） | 简单（一个文件） |
| **TypeScript** | 需要额外配置 | 原生支持 |
| **依赖** | 多个包 | 单个包 |

**性能对比**：

```bash
# ESLint + Prettier
$ npm run lint
✓ Done in 23.5s

# Biome
$ npx @biomejs/biome check src/
✓ Done in 0.8s  # 快 30 倍！
```

**配置文件对比**：

```javascript
// ESLint (.eslintrc.js)
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    'no-unused-vars': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};

// Prettier (.prettierrc)
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2
}

// Biome (biome.json) - 一个文件搞定！
{
  "linter": {
    "rules": {
      "style": {
        "noUnusedVariables": "error"
      }
    }
  },
  "formatter": {
    "indentStyle": "space",
    "lineWidth": 80
  }
}
```

### Q2: Biome 的核心功能有哪些？

**1. Lint（代码检查）**：

```json
// biome.json
{
  "linter": {
    "enabled": true,
    "rules": {
      "suspicious": {
        "noExplicitAny": "warn",
        "noDebugger": "error"
      },
      "style": {
        "noConsole": "warn",
        "useConst": "error"
      },
      "correctness": {
        "noUnusedVariables": "error"
      }
    }
  }
}
```

**2. Format（代码格式化）**：

```json
// biome.json
{
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80,
    "lineEnding": "lf",
    "attributePosition": "auto"
  }
}
```

**3. Import Sorting（导入排序）**：

```json
// biome.json
{
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "trailingCommas": "all"
    },
    "organizeImports": {
      "enabled": true
    }
  }
}
```

**4. 文件组织**：

```typescript
// Biome 自动组织导入
// Before
import { b } from './b';
import { a } from './a';
import React from 'react';

// After (自动排序)
import React from 'react';
import { a } from './a';
import { b } from './b';
```

### Q3: Biome 的配置文件如何组织？

**完整配置示例**：

```json
{
  "$schema": "https://biomejs.dev/schemas/1.4.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": ["node_modules", "dist", ".next"]
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 80,
    "attributePosition": "auto"
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "a11y": {
        "recommended": true
      },
      "complexity": {
        "recommended": true
      },
      "correctness": {
        "recommended": true
      },
      "performance": {
        "recommended": true
      },
      "security": {
        "recommended": true
      },
      "style": {
        "recommended": true
      },
      "suspicious": {
        "recommended": true
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "trailingCommas": "all",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSpacing": true,
      "bracketSameLine": false
    },
    "globals": ["React"]
  }
}
```

### Q4: Biome 的命令行工具使用

**基本命令**：

```bash
# 检查代码
npx @biomejs/biome check ./src

# 检查并自动修复
npx @biomejs/biome check --write ./src

# 只格式化
npx @biomejs/biome format --write ./src

# 只检查 Lint
npx @biomejs/biome lint ./src

# 检查特定文件
npx @biomejs/biome check ./src/index.ts

# 显示详细信息
npx @biomejs/biome check --verbose ./src

# 报告格式
npx @biomejs/biome check --reporter=github ./src
npx @biomejs/biome check --reporter=json ./src
```

**CI/CD 集成**：

```bash
# 在 CI 中使用（失败时返回非 0 退出码）
npx @biomejs/biome check ./src

# 在 Git Hooks 中使用
# package.json
{
  "scripts": {
    "lint": "biome check src/",
    "lint:fix": "biome check --write src/",
    "format": "biome format --write src/"
  }
}
```

### Q5: Biome 的规则分类

**规则类别**：

**1. Correctness（正确性）**：

```typescript
// 检测代码错误
{
  "correctness": {
    "noUnusedVariables": "error",      // 未使用的变量
    "noUnusedImports": "error",        // 未使用的导入
    "noConstAssign": "error",          // 修改 const
    "noInvalidNewBuiltin": "error"     // 错误的 new 调用
  }
}
```

**2. Suspicious（可疑代码）**：

```typescript
// 检测可能的问题
{
  "suspicious": {
    "noExplicitAny": "warn",           // 禁止 any
    "noDebugger": "error",             // 禁止 debugger
    "noConsoleLog": "warn",            // 禁止 console.log
    "noEmptyBlock": "warn"             // 空代码块
  }
}
```

**3. Style（代码风格）**：

```typescript
// 代码风格统一
{
  "style": {
    "useConst": "error",               // 使用 const
    "noVar": "error",                  // 禁止 var
    "useTemplate": "warn",             // 使用模板字符串
    "noNegationElse": "warn"           // 禁止否定条件
  }
}
```

**4. Complexity（复杂度）**：

```typescript
// 控制复杂度
{
  "complexity": {
    "noForEach": "warn",               // 禁止 forEach
    "useLiteralKeys": "warn",          // 使用字面量键
    "noStaticOnlyClass": "warn"        // 禁止仅静态成员的类
  }
}
```

**5. Performance（性能）**：

```typescript
// 性能优化建议
{
  "performance": {
    "noDelete": "warn",                // 禁止 delete
    "noAccumulatingSpread": "warn"     // 避免累积展开
  }
}
```

**6. Security（安全）**：

```typescript
// 安全问题检测
{
  "security": {
    "noDangerouslySetInnerHtml": "error",  // XSS 风险
    "noGlobalObjectCalls": "error"         // 全局对象调用
  }
}
```

**7. a11y（无障碍）**：

```typescript
// 无障碍性检查
{
  "a11y": {
    "noSvgWithoutTitle": "warn",      // SVG 需要标题
    "useValidAnchor": "error"         // 有效的锚点
  }
}
```

---

## 高级面试题

### Q6: Biome 的性能为什么这么快？

**核心技术**：

**1. Rust 编写**：

```rust
// Biome 使用 Rust 编写

// 优势：
// - 零成本抽象
// - 无 GC 暂停
// - 内存安全
// - 并行处理
```

**2. 并行处理**：

```typescript
// Biome 自动并行处理多个文件

// 处理流程：
File 1 ─┐
File 2 ─┼─→ Biome (并行) ─→ 结果
File 3 ─┘
File N ─┘

// 单线程 vs 多线程对比
ESLint:  |████████████████████| 23s (串行)
Biome:   |████| 0.8s (并行)
```

**3. 增量处理**：

```typescript
// Biome 缓存机制

// 第一次运行
$ biome check src/
Checked 150 files in 0.8s

// 修改一个文件后再次运行
$ biome check src/
Checked 1 file in 0.05s  // 只检查修改的文件！
```

**4. 智能跳过**：

```json
// biome.json - ignore 配置
{
  "files": {
    "ignore": [
      "node_modules/**",
      "dist/**",
      "build/**",
      "**/*.min.js",
      "**/*.d.ts"
    ],
    "ignoreUnknown": false
  }
}
```

### Q7: Biome 和现有工具链的集成

**与 VS Code 集成**：

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

**与 Git Hooks 集成**：

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "lint-staged": "lint-staged"
  },
  "lint-staged": {
    "*.{js,ts,json}": [
      "biome check --write --no-errors-on-unmatched",
      "git add"
    ]
  }
}
```

**与 CI/CD 集成**：

```yaml
# .github/workflows/lint.yml
name: Lint

on: [push, pull_request]

jobs:
  biome:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: biomejs/setup-biome@v1
      - run: biome check --reporter=github ./src
```

### Q8: 从 ESLint + Prettier 迁移到 Biome

**步骤 1：安装 Biome**：

```bash
npm install --save-dev @biomejs/biome

# 初始化配置
npx @biomejs/biome init
```

**步骤 2：迁移配置**：

```javascript
// 旧配置 (.eslintrc.js)
module.exports = {
  rules: {
    'no-unused-vars': 'error',
    'no-console': 'warn',
    'prefer-const': 'error',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single']
  }
};

// 新配置 (biome.json)
{
  "linter": {
    "rules": {
      "correctness": {
        "noUnusedVariables": "error"
      },
      "suspicious": {
        "noConsole": "warn"
      },
      "style": {
        "useConst": "error"
      }
    }
  },
  "formatter": {
    "semicolons": "always",
    "quoteStyle": "single"
  }
}
```

**步骤 3：自动迁移**：

```bash
# Biome 提供迁移工具
npx @biomejs/biome migrate eslint

# 自动转换 ESLint 配置到 Biome
```

**步骤 4：替换脚本**：

```json
// package.json
{
  "scripts": {
    // 旧的
    // "lint": "eslint src/",
    // "format": "prettier --write src/",

    // 新的
    "lint": "biome check src/",
    "lint:fix": "biome check --write src/",
    "format": "biome format --write src/"
  }
}
```

**步骤 5：移除旧依赖**：

```bash
# 移除 ESLint 和 Prettier
npm uninstall eslint prettier \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-config-prettier \
  eslint-plugin-react \
  ...

# 删除配置文件
rm .eslintrc.js .prettierrc
```

### Q9: Biome 的规则覆盖和配置继承

**规则覆盖**：

```json
// biome.json (全局配置)
{
  "linter": {
    "rules": {
      "suspicious": {
        "noConsoleLog": "warn"
      }
    }
  }
}
```

```json
// src/tests/biome.json (测试目录覆盖)
{
  "linter": {
    "rules": {
      "suspicious": {
        "noConsoleLog": "off"  // 测试中允许 console.log
      }
    }
  }
}
```

**配置继承**：

```json
// biome.json
{
  "extends": ["@biomejs/biome/base"],
  "linter": {
    "rules": {
      // 覆盖基础配置
      "suspicious": {
        "noConsoleLog": "warn"  // 覆盖默认值
      }
    }
  }
}
```

**Monorepo 配置**：

```json
// biome.json (根目录)
{
  "files": {
    "ignore": ["node_modules", "dist"]
  },
  "linter": {
    "rules": {
      "style": {
        "noUnusedVariables": "error"
      }
    }
  }
}
```

```json
// packages/frontend/biome.json (子包)
{
  "extends": "../../biome.json",
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "error"  // 前端项目更严格
      }
    }
  }
}
```

### Q10: Biome 的高级特性

**1. 代码转换**：

```typescript
// Biome 可以自动转换代码

// Before
var name = 'John';
console.log(name);

// After (应用规则)
const name = 'John';
// console.log(name);  // 被移除
```

**2. 智能修复**：

```typescript
// Before
function foo() {
  var x = 1;
  var y = 2;
  return x + y;
}

// After (自动修复)
function foo() {
  const x = 1;
  const y = 2;
  return x + y;
}
```

**3. 类型感知 Lint**：

```typescript
// Biome 理解 TypeScript 类型

interface User {
  name: string;
  age: number;
}

function greet(user: User) {
  console.log(user.name);
}

greet({ name: 'John' });  // ❌ 缺少 age 属性
```

**4. JSX/TSX 支持**：

```typescript
// React 组件格式化
export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>Hello, World!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### Q11: Biome 与其他工具的对比

**Biome vs dprint**：

| 特性 | Biome | dprint |
|------|-------|--------|
| **速度** | 极快 | 极快 |
| **Lint** | ✅ | ❌ |
| **格式化** | ✅ | ✅ |
| **配置** | JSON | JSON |
| **生态系统** | 新 | 较成熟 |

**Biome vs Ruff（Python）**：

```bash
# Ruff - Python 工具
ruff check ./python

# Biome - JavaScript/TypeScript 工具
biome check ./js
```

**共同点**：
- 都使用 Rust 编写
- 都追求极快速度
- 都提供 Lint + 格式化

### Q12: Biome 的最佳实践

**1. 团队配置统一**：

```json
// biome.json
{
  "overrides": [
    {
      "include": ["*.ts", "*.tsx"],
      "linter": {
        "rules": {
          "suspicious": {
            "noExplicitAny": "error"
          }
        }
      }
    }
  ]
}
```

**2. 渐进式迁移**：

```bash
# 第一步：只检查，不修复
biome check ./src

# 第二步：自动修复
biome check --write ./src

# 第三步：应用到 CI
biome check --reporter=github ./src
```

**3. 配置 Git 忽略**：

```json
// biome.json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  }
}
```

**4. 自定义规则**：

```json
{
  "linter": {
    "rules": {
      "style": {
        "useNamingConvention": {
          "level": "error",
          "options": {
            "strictCase": false,
            "conventions": [
              {
                "selector": {
                  "kind": "function"
                },
                "formats": ["camelCase", "PascalCase"]
              }
            ]
          }
        }
      }
    }
  }
}
```

### Q13: Biome 的常见问题和解决方案

**问题 1：与 Prettier 冲突**

```json
// 解决方案：禁用 Prettier
// .prettierrc
{
  "semi": true
}

// 或者删除 Prettier 配置，使用 Biome
```

**问题 2：规则不兼容**

```json
// 使用 overrides 解决
{
  "overrides": [
    {
      "include": ["legacy/**/*.js"],
      "linter": {
        "rules": {
          "suspicious": {
            "noExplicitAny": "off"
          }
        }
      }
    }
  ]
}
```

**问题 3：性能问题**

```bash
# 使用缓存
biome check ./src --cache

# 只检查修改的文件
biome check ./src --changed
```

### Q14: Biome 在大型项目中的应用

**Monorepo 配置**：

```json
// biome.json
{
  "files": {
    "ignore": ["**/node_modules", "**/dist", "**/.next"]
  },
  "linter": {
    "rules": {
      "correctness": {
        "noUnusedVariables": "error"
      }
    }
  },
  "overrides": [
    {
      "include": ["apps/web/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsoleLog": "error"
          }
        }
      }
    },
    {
      "include": ["apps/api/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsoleLog": "warn"
          }
        }
      }
    }
  ]
}
```

**CI 性能优化**：

```yaml
# .github/workflows/biome.yml
name: Biome

on:
  push:
    paths:
      - 'src/**'
      - 'biome.json'

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: biomejs/setup-biome@v1
      - run: biome check --reporter=github --changed
```

### Q15: Biome 的未来和发展

**路线图**：

```markdown
# Biome 发展路线

## v1.0 (2024)
- ✅ 核心 Lint 规则
- ✅ 格式化功能
- ✅ 导入排序

## v2.0 (计划中)
- 🔮 更多语言支持
- 🔮 更多规则
- 🔮 插件系统
- 🔮 VS Code 插件增强

## 未来
- 🔮 与其他工具深度集成
- 🔮 云端配置同步
- 🔮 AI 辅助修复
```

---

## 本章小结

### Biome 核心要点

| 特性 | 关键点 |
|------|--------|
| **速度** | 比 ESLint 快 30 倍 |
| **功能** | Lint + 格式化一体化 |
| **配置** | 单个配置文件，零配置启动 |
| **类型支持** | TypeScript 原生支持 |
| **迁移** | 提供自动迁移工具 |

### 适用场景

✅ **适合使用 Biome**：
- 新项目，追求极致性能
- 需要快速 CI/CD
- TypeScript 项目
- 团队配置统一
- 替代 ESLint + Prettier

❌ **暂不推荐**：
- 依赖大量 ESLint 插件的项目
- 需要自定义规则的项目（Biome 不支持自定义规则）
- 企业级项目（稳定性待验证）

### 工具链对比

| 工具 | 用途 | 速度 | 推荐度 |
|------|------|------|--------|
| **Biome** | Lint + 格式化 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **ESLint** | Lint | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Prettier** | 格式化 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **dprint** | 格式化 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
