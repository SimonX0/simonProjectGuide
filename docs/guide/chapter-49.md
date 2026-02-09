# Bun包管理器完全指南

## Bun包管理器完全指南

> **学习目标**：掌握Bun包管理器和运行时，实现极速开发体验
> **核心内容**：Bun安装、包管理、内置工具、性能优化、最佳实践

### Bun概述

#### 什么是Bun

**Bun** 是一个极速的JavaScript运行时、包管理器、测试框架和打包工具，全部集成在一个可执行文件中。它兼容Node.js和npm生态，但速度快得多。

```
┌──────────────────────────────────────────────────────────────┐
│                    Bun 架构概览                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Bun 运行时 (Zig编写的)                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │ JST引擎  │  │ 网络层    │  │ 文件系统  │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └──────────────────────────────────────────────────────┘   │
│                        ↓                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              内置工具链                                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │包管理器   │  │ 打包工具  │  │测试框架   │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └──────────────────────────────────────────────────────┘   │
│                        ↓                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Node.js/npm兼容层                          │   │
│  │     process, fs, http, Buffer, etc.                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Bun核心优势

| 特性 | Bun | Node.js + pnpm | 说明 |
|------|-----|----------------|------|
| **安装速度** | 20-100x | 基准 | 使用硬链接和全局缓存 |
| **启动速度** | 4x | 基准 | 优化的运行时 |
| **运行性能** | 3x | 基准 | JavaScriptCore引擎 |
| **内存占用** | 更低 | 较高 | 优化的内存管理 |
| **工具集成** | 全内置 | 需安装多个工具 | 包管理器、测试、打包一体化 |
| **兼容性** | Node.js兼容 | - | 支持大多数npm包 |

### 安装Bun

#### 快速安装

```bash
# 一键安装脚本（推荐）
curl -fsSL https://bun.sh/install | bash

# 或者使用npm
npm install -g bun

# 使用Homebrew (macOS/Linux)
brew tap oven-sh/bun
brew install bun

# 使用Scoop (Windows)
scoop bucket add extras
scoop install bun

# 验证安装
bun --version
```

#### Windows安装注意事项

在Windows上安装Bun需要额外的配置：

```powershell
# 使用PowerShell安装
irm bun.sh/install.ps1 | iex

# 或使用scoop安装
scoop install bun

# 验证安装
bun --version
```

### Bun包管理器

#### 初始化项目

```bash
# 创建新项目
bun init

# 创建TypeScript项目
bun init -y

# 交互式创建
bun init
```

**package.json生成示例**:

```json
{
  "name": "my-bun-project",
  "version": "1.0.0",
  "module": "index.ts",
  "type": "module",
  "scripts": {
    "start": "bun run index.ts",
    "dev": "bun --hot run index.ts",
    "build": "bun build ./index.ts --outdir ./dist",
    "test": "bun test"
  },
  "devDependencies": {
    "@types/bun": "latest"
  }
}
```

#### 依赖管理

```bash
# 安装依赖
bun install

# 添加依赖
bun add react

# 添加开发依赖
bun add -d vite

# 添加特定版本
bun add react@18.2.0

# 添加多个依赖
bun add react react-dom

# 全局安装
bun add -g pm2

# 卸载依赖
bun remove react

# 更新依赖
bun update

# 更新所有依赖
bun update
```

#### 工作区（Workspace）

```yaml
# bun.lockb
# 在package.json中配置工作区

{
  "name": "my-monorepo",
  "version": "1.0.0",
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev": "bun run --filter '*' dev",
    "build": "bun run --filter '*' build",
    "test": "bun test"
  }
}
```

```bash
# 在工作区中运行命令
bun run --filter my-app dev

# 添加到特定工作区
bun add react --filter my-app

# 在所有工作区中运行
bun run --filter '*' test
```

### Bun运行时

#### 运行TypeScript/JavaScript

```bash
# 运行TypeScript文件（无需编译）
bun run index.ts

# 运行JavaScript
bun run index.js

# 热重载模式
bun --hot run server.ts

# 监听模式
bun --watch run server.ts

# 传递参数
bun run server.ts --port 3000
```

#### 内置Web服务器

```typescript
// server.ts
Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // 路由处理
    if (url.pathname === '/') {
      return new Response('Hello Bun!');
    }

    if (url.pathname === '/api/data') {
      return Response.json({ message: 'Hello API' });
    }

    // 静态文件服务
    return new Response('Not Found', { status: 404 });
  },
});

console.log('Server running on http://localhost:3000');
```

```bash
# 运行服务器
bun run server.ts
```

#### 文件系统操作

```typescript
// Bun文件系统API（比Node.js更快）
import { promises as fs } from 'fs';

// 读取文件
const content = await fs.readFile('data.txt', 'utf-8');

// 写入文件
await fs.writeFile('output.txt', 'Hello Bun!');

// 复制文件
await fs.copyFile('source.txt', 'dest.txt');

// 删除文件
await fs.unlink('old.txt');

// 读取目录
const files = await fs.readdir('./src');

// 获取文件信息
const stats = await fs.stat('file.txt');
console.log(stats.size); // 文件大小
```

#### 环境变量

```bash
# .env文件
API_URL=https://api.example.com
DATABASE_URL=postgresql://localhost/mydb
SECRET_KEY=your-secret-key
```

```typescript
// 使用环境变量
const apiUrl = process.env.API_URL;
const dbUrl = process.env.DATABASE_URL;

// 或者使用Bun内置的env
const apiKey = Bun.env.API_KEY;

// 加载.env文件
// Bun会自动加载.env文件，无需额外配置
```

### Bun测试框架

#### 基础测试

```typescript
// math.test.ts
import { describe, expect, test } from 'bun:test';

describe('Math operations', () => {
  test('addition', () => {
    expect(1 + 1).toBe(2);
  });

  test('subtraction', () => {
    expect(5 - 3).toBe(2);
  });
});
```

```bash
# 运行测试
bun test

# 监听模式
bun test --watch

# 覆盖率
bun test --coverage
```

#### 异步测试

```typescript
// api.test.ts
import { describe, expect, test } from 'bun:test';

describe('API tests', () => {
  test('fetch data', async () => {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();

    expect(data).toBeDefined();
    expect(data.status).toBe('success');
  });

  test('timeout', async () => {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(100);
  });
});
```

#### Mock和Spy

```typescript
// user.test.ts
import { describe, expect, test, mock } from 'bun:test';

describe('User service', () => {
  test('should call API', async () => {
    // Mock fetch
    const mockFetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: 1, name: 'John' })
      } as Response)
    );

    // 使用mock
    global.fetch = mockFetch;

    const response = await fetch('/api/users/1');
    const data = await response.json();

    expect(mockFetch).toHaveBeenCalled();
    expect(data.name).toBe('John');

    // 恢复原始fetch
    mockFetch.mockRestore();
  });
});
```

### Bun构建工具

#### 打包配置

```bash
# 打包单个文件
bun build ./index.ts --outdir ./dist

# 打包并指定输出文件名
bun build ./index.ts --outfile ./dist/bundle.js

# 打包为浏览器可执行文件
bun build ./index.ts --outdir ./dist --target browser

# 打包为Node.js可执行文件
bun build ./index.ts --outdir ./dist --target node

# 最小化输出
bun build ./index.ts --outdir ./dist --minify

# 生成source map
bun build ./index.ts --outdir ./dist --sourcemap

# 外部化依赖
bun build ./index.ts --outdir ./dist --external react
```

#### 高级打包配置

```bash
# 创建完整的构建配置
bun build ./index.ts \
  --outfile ./dist/bundle.js \
  --target browser \
  --format esm \
  --minify \
  --sourcemap \
  --external react,vue \
  --define process.env.NODE_VERSION='"1.0.0"'
```

### Bun与Vue3/Vite集成

#### 使用Bun作为包管理器

```bash
# 使用Bun创建Vite项目
bun create vite my-vue-app --template vue-ts

# 进入项目
cd my-vue-app

# 使用Bun安装依赖
bun install

# 使用Bun运行开发服务器
bun run dev

# 使用Bun构建
bun run build
```

#### package.json脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    "test": "bun test"
  }
}
```

#### Bun API服务 + Vue3前端

```typescript
// backend/server.ts - Bun API服务器
import { Database } from 'bun:sqlite';

const db = new Database(':memory:');

// 初始化数据库
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL
  )
`).run();

Bun.serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS处理
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // GET /api/users
    if (url.pathname === '/api/users' && req.method === 'GET') {
      const users = db.query('SELECT * FROM users').all();
      return Response.json(users);
    }

    // POST /api/users
    if (url.pathname === '/api/users' && req.method === 'POST') {
      const body = await req.json();
      const result = db.query(
        'INSERT INTO users (name, email) VALUES ($name, $email)'
      ).run(body);
      return Response.json({ id: result.lastInsertRowid, ...body });
    }

    return new Response('Not Found', { status: 404 });
  }
});

console.log('Bun API server running on http://localhost:3001');
```

```typescript
// frontend/src/api/index.ts - Vue3前端API调用
const API_BASE = 'http://localhost:3001';

export interface User {
  id?: number;
  name: string;
  email: string;
}

export const api = {
  // 获取所有用户
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/api/users`);
    return response.json();
  },

  // 创建用户
  async createUser(user: User): Promise<User> {
    const response = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });
    return response.json();
  }
};
```

```vue
<!-- frontend/src/App.vue -->
<template>
  <div class="app">
    <h1>Bun + Vue3 全栈应用</h1>

    <form @submit.prevent="addUser">
      <input v-model="newUser.name" placeholder="姓名" required />
      <input v-model="newUser.email" placeholder="邮箱" required />
      <button type="submit">添加</button>
    </form>

    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} ({{ user.email }})
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from './api';

const users = ref<User[]>([]);
const newUser = ref<User>({ name: '', email: '' });

const loadUsers = async () => {
  users.value = await api.getUsers();
};

const addUser = async () => {
  await api.createUser(newUser.value);
  newUser.value = { name: '', email: '' };
  await loadUsers();
};

onMounted(loadUsers);
</script>
```

### 性能优化

#### Bun性能技巧

```typescript
// 1. 使用Bun内置API（更快）
import { readFileSync } from 'fs';
// ❌ 慢
const data1 = readFileSync('file.txt', 'utf-8');

// ✅ 快
const data2 = Bun.file('file.txt').text();

// 2. 批量操作
// ❌ 慢
for (const file of files) {
  await processFile(file);
}

// ✅ 快
await Promise.all(files.map(file => processFile(file)));

// 3. 使用Bun的SQLite（最快）
import { Database } from 'bun:sqlite';
const db = new Database('data.db');
// 内存查询比文件系统快1000x

// 4. 使用Worker Threads
const worker = new Worker('./worker.ts');
worker.postMessage({ data: 'heavy computation' });
```

#### 监控和分析

```bash
# 启用性能分析
bun --profile run server.ts

# 内存分析
bun --smol run server.ts

# 基准测试
bun run benchmark.ts
```

### 常见问题解决

#### 1. 兼容性问题

```bash
# 某些Node.js模块可能不兼容Bun
# 解决方案：使用Bun的Node.js兼容模式

# 检查兼容性
bun add -d @types/node

# 使用Node.js polyfills
bun add node-fetch-polyfill
```

#### 2. 环境变量问题

```typescript
// Bun会自动加载.env文件
// 但你也可以手动加载

import { dotenv } from 'bun';

// 加载.env
dotenv.config();

// 加载自定义env文件
dotenv.config({ path: '.env.production' });
```

#### 3. TypeScript配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext"],
    "moduleResolution": "bundler",
    "types": ["bun-types"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Bun最佳实践

#### 1. 项目结构

```
my-bun-project/
├── src/
│   ├── index.ts          # 入口文件
│   ├── server.ts         # 服务器
│   ├── routes/           # 路由
│   ├── services/         # 业务逻辑
│   └── utils/            # 工具函数
├── test/                 # 测试文件
├── public/               # 静态资源
├── .env                  # 环境变量
├── bun.lockb             # 依赖锁文件
├── package.json
├── tsconfig.json
└── README.md
```

#### 2. 推荐工作流

```bash
# 1. 初始化项目
bun init -y

# 2. 添加依赖
bun add @types/bun

# 3. 开发
bun --hot run server.ts

# 4. 测试
bun test --watch

# 5. 构建
bun build ./src/index.ts --outdir ./dist

# 6. 运行生产版本
bun run dist/index.js
```

#### 3. 性能清单

| 项目 | 推荐 | 说明 |
|------|------|------|
| 运行时 | Bun | 最快的JavaScript运行时 |
| 包管理器 | Bun | 最快的包安装 |
| 数据库 | SQLite | 内置，零配置 |
| 模板引擎 | JSX/HTM | 原生支持 |
| 测试框架 | Bun test | 内置，零配置 |

### 本章小结

| 工具 | Bun | Node.js生态 |
|------|-----|-------------|
| 运行时 | 4x速度 | 基准 |
| 包管理器 | 20-100x安装速度 | npm/pnpm |
| 测试框架 | 内置 | Jest/Vitest |
| 打包工具 | 内置 | webpack/Rollup |
| 总体体积 | 单文件80MB | 多个工具合计更大 |

---

**下一步学习**: 建议继续学习[前端工程化进阶](./chapter-39)了解Monorepo等高级工程化技术。
