---
title: Bun 运行时面试题
---

# Bun 运行时面试题

## 什么是 Bun？

**Bun** = 下一代 JavaScript 运行时，2024年爆火的技术

**核心特点**：

- ⚡ **极快启动**：比 Node.js 快 3-4 倍
- 📦 **内置工具**：打包器、测试框架、包管理器一体化
- 🔧 **兼容 Node.js**：可以直接运行大多数 Node.js 项目
- 🚀 **原生支持 TypeScript**：无需配置，直接运行
- 💾 **内置 SQLite**：开箱即用的数据库

```bash
# 安装 Bun
curl -fsSL https://bun.sh/install | bash

# 或者使用 npm
npm install -g bun

# 运行 TypeScript
bun run index.ts  # 无需编译！

# 安装依赖
bun install  # 比 pnpm 快 30 倍

# 运行测试
bun test
```

---

## 基础面试题

### Q1: Bun 和 Node.js 的主要区别？

**核心区别**：

| 特性 | Node.js | Bun |
|------|---------|-----|
| **底层** | V8 引擎 | JavaScriptCore (WebKit) |
| **启动速度** | 慢（50-100ms） | 快（15-30ms） |
| **打包工具** | 需要外部（webpack等） | 内置 |
| **包管理器** | npm/yarn/pnpm | 内置 bun install |
| **TypeScript** | 需要 ts-node/tsc | 原生支持 |
| **API 兼容** | - | Node.js 兼容层 |

**性能对比**：

```javascript
// 启动速度对比
Node.js: ~100ms
Bun:     ~25ms  // 快 4 倍

// 依赖安装速度
npm:     30s
pnpm:    10s
bun:     3s     // 快 10 倍
```

### Q2: Bun 的内置工具有哪些？

**1. 包管理器**：

```bash
# 安装依赖
bun install

# 添加包
bun add react
bun add -D @types/react

# 运行脚本
bun run dev

# 比 npm/pnpm 快得多
```

**2. 打包器（Bundler）**：

```javascript
// bundler.ts
import { build } from 'bun';

await build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  // 无需配置，智能识别
});

// 比 webpack 快 100 倍
```

**3. 测试框架**：

```typescript
// math.test.ts
import { test, expect } from 'bun:test';

test('addition', () => {
  expect(1 + 1).toBe(2);
});

// 运行测试
// bun test
```

**4. 服务器**：

```typescript
// server.ts
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response('Hello Bun!');
  },
});

// 直接运行，无需 Express
```

**5. SQLite 数据库**：

```typescript
// db.ts
import { Database } from 'bun:sqlite';

const db = new Database(':memory:');

// 创建表
db.run(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT
  )
`);

// 插入数据
db.run('INSERT INTO users (name) VALUES (?)', ['Alice']);

// 查询数据
const users = db.query('SELECT * FROM users').all();
console.log(users); // [{ id: 1, name: 'Alice' }]
```

### Q3: Bun 如何实现 Node.js 兼容？

**兼容层实现**：

```javascript
// Bun 实现了 Node.js 的核心 API

// 1. 内置模块兼容
import fs from 'fs';        // ✅ 支持
import path from 'path';    // ✅ 支持
import http from 'http';    // ✅ 支持

// 2. 全局变量兼容
console.log(__dirname);     // ✅ 支持
console.log(__filename);    // ✅ 支持
process.env.NODE_ENV;       // ✅ 支持

// 3. npm 包兼容
import express from 'express';  // ✅ 大部分 Node.js 包可用
```

**兼容性策略**：

```typescript
// Bun 使用 polyfill 填充 Node.js API

// 例如：fs 模块
const fs = require('fs');

// 底层实现
// Bun 使用 Zig 语言实现，提供了与 Node.js fs 相同的接口
// 但性能更好
```

### Q4: Bun 的 TypeScript 支持如何工作？

**原生支持，零配置**：

```typescript
// index.ts
interface User {
  id: number;
  name: string;
}

function greet(user: User): string {
  return `Hello, ${user.name}!`;
}

greet({ id: 1, name: 'Alice' });

// 直接运行
// bun run index.ts
// 无需 tsconfig.json，无需编译！
```

**类型检查选项**：

```bash
# 运行时不进行类型检查（最快）
bun run index.ts

# 运行前进行类型检查
bun run --hot index.ts

# 构建时检查
bun build index.ts --outdir ./dist
```

**tsconfig.json 支持**：

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true
  }
}
```

### Q5: Bun 的性能为什么这么快？

**核心技术**：

**1. JavaScriptCore 引擎**：

```bash
# Node.js 使用 V8（Chrome）
# Bun 使用 JavaScriptCore（Safari）

# JavaScriptCore 优势：
- 更快的启动时间
- 更低的内存占用
- 更高效的 JIT 编译
```

**2. Zig 语言编写**：

```zig
// Bun 的核心代码使用 Zig 编写

// 优势：
- 无 GC 延迟（手动内存管理）
- 更低的系统调用开销
- 更好的并发性能
```

**3. 内置缓存**：

```javascript
// Bun 会缓存解析结果

// 第一次运行
bun run index.ts  // 100ms

// 第二次运行
bun run index.ts  // 20ms（缓存生效）
```

**4. 并发处理**：

```typescript
// Bun 使用 work stealing 调度器

// 并发读取文件
const files = await Promise.all([
  Bun.file('a.txt').text(),
  Bun.file('b.txt').text(),
  Bun.file('c.txt').text(),
]);

// 自动利用多核 CPU
```

---

## 高级面试题

### Q6: Bun 的模块加载机制是怎样的？

**ESM 优先**：

```typescript
// Bun 原生支持 ES Modules

// 导出
export const name = 'Bun';

export function greet() {
  return 'Hello!';
}

// 导入
import { name, greet } from './utils.ts';

// 也支持 CommonJS
const fs = require('fs');

// 但推荐使用 ESM
import fs from 'fs';
```

**package.json 配置**：

```json
{
  "type": "module",  // ESM 模式
  "imports": {
    "#*": "./src/*.ts"
  }
}
```

**模块解析算法**：

```typescript
// Bun 的模块解析优先级

1. 绝对路径
   import { foo } from '/path/to/file.ts';

2. 相对路径
   import { foo } from './utils.ts';

3. node_modules
   import { foo } from 'lodash';

4. 裸导入（带 #）
   import { foo } from '#internal/foo';
```

### Q7: 如何在 Bun 中实现热重载？

**开发模式**：

```typescript
// dev.ts
import { watch } from 'fs';
import { spawn } from 'child_process';

let server;

function restart() {
  if (server) server.kill();
  server = spawn('bun', ['run', 'server.ts']);
}

watch('./src', { recursive: true }, (event, filename) => {
  console.log(`${filename} changed, restarting...`);
  restart();
});

restart();
```

**使用 --hot 标志**：

```bash
# Bun 内置热重载
bun --hot run server.ts

# 文件变化时自动重启
```

**HMR（Hot Module Replacement）**：

```typescript
// Bun 的 HMR 实现
import { hot } from 'bun';

if (hot) {
  hot.accept((newModule) => {
    console.log('Module updated:', newModule);
  });
}
```

### Q8: Bun 的服务器实现和 Express 对比

**Bun 原生服务器**：

```typescript
// Bun 服务器
Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // 路由
    if (url.pathname === '/api/users') {
      return Response.json({
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      });
    }

    // 静态文件
    return new Response(Bun.file('./index.html'));
  },

  // WebSocket 支持
  websocket: {
    message(ws, message) {
      ws.send(`Echo: ${message}`);
    },
  },
});

console.log('Server running on http://localhost:3000');
```

**Express 服务器**：

```javascript
// Express 服务器
const express = require('express');
const app = express();

app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  });
});

app.listen(3000);
```

**性能对比**：

| 指标 | Express (Node.js) | Bun |
|------|-------------------|-----|
| 请求/秒 | ~50,000 | ~200,000 |
| 延迟 | ~2ms | ~0.5ms |
| 内存 | 50MB | 15MB |

### Q9: Bun 的打包器和 Vite 对比

**Bun 打包器**：

```typescript
// bun.config.ts
export default {
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  splitting: true,
  sourcemap: 'external',
  minify: true,
};

// 运行打包
bun build ./src/index.tsx --outdir ./dist
```

**Vite**：

```javascript
// vite.config.js
export default {
  build: {
    outDir: 'dist',
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
  },
};
```

**性能对比**：

| 工具 | 冷启动 | HMR | 打包速度 |
|------|--------|-----|----------|
| Vite | ~1s | ~50ms | ~10s |
| Bun | ~100ms | ~10ms | ~1s |

### Q10: Bun 的测试框架特点

**内置测试框架**：

```typescript
// user.test.ts
import { test, expect, beforeAll, afterAll, describe } from 'bun:test';

import { db } from './db';

beforeAll(() => {
  // 测试前准备
  db.migrate();
});

afterAll(() => {
  // 测试后清理
  db.rollback();
});

describe('User Service', () => {
  test('should create user', async () => {
    const user = await createUser({
      name: 'Alice',
      email: 'alice@example.com',
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe('Alice');
  });

  test('should fail with invalid email', async () => {
    await expect(
      createUser({
        name: 'Bob',
        email: 'invalid-email',
      })
    ).rejects.toThrow('Invalid email');
  });
});

// 运行测试
// bun test
```

**Mock 功能**：

```typescript
// 使用 bun 的 mock
import { mock } from 'bun:test';

const mockFn = mock((val: string) => `Hello, ${val}`);

mockFn('World');
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith('World');
```

**快照测试**：

```typescript
test('component snapshot', () => {
  const component = render(<Button>Click</Button>);

  expect(component).toMatchSnapshot();
});
```

### Q11: Bun 的文件操作 API

**Bun.file()**：

```typescript
// 读取文件（零拷贝）
const file = Bun.file('data.json');

// 获取内容
const text = await file.text();
const json = await file.json();
const buffer = await file.arrayBuffer();

// 文件信息
console.log(file.size);     // 文件大小
console.log(file.type);     // MIME 类型
```

**Bun.write()**：

```typescript
// 写入文件
await Bun.write('output.txt', 'Hello, Bun!');

// 写入 JSON
await Bun.write('data.json', JSON.stringify({ foo: 'bar' }));

// 写入文件（从另一个文件）
await Bun.write('copy.txt', Bun.file('original.txt'));
```

**文件监听**：

```typescript
// 监听文件变化
const watcher = fs.watch('./src', async (event, filename) => {
  if (filename) {
    console.log(`${filename} changed: ${event}`);

    // 重新加载
    const content = await Bun.file(`./src/${filename}`).text();
    processFile(content);
  }
});
```

### Q12: Bun 的环境变量和配置

**加载环境变量**：

```bash
# .env
DATABASE_URL=sqlite:./db.sqlite
API_KEY=secret_key
NODE_ENV=development
```

```typescript
// Bun 自动加载 .env
console.log(process.env.DATABASE_URL);
console.log(process.env.API_KEY);

// 也可以使用 bun 的 dotenv
import { dotEnv } from 'bun';

await dotEnv({ path: '.env.local' });
```

**配置文件**：

```typescript
// bun.config.ts
export default {
  // 开发服务器
  dev: {
    port: 3000,
    hmr: true,
  },

  // 构建配置
  build: {
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
  },

  // 测试配置
  test: {
    preload: ['./setup.ts'],
    coverage: {
      enabled: true,
      threshold: 80,
    },
  },

  // 服务器配置
  server: {
    static: ['./public'],
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
```

### Q13: Bun 和 Vite 集成使用

**混合使用场景**：

```typescript
// 使用 Vite 进行开发，Bun 进行打包

// vite.config.ts
export default {
  plugins: [
    {
      name: 'bun-plugin',
      config() {
        return {
          build: {
            minify: 'esbuild',
          },
        };
      },
    },
  ],
};
```

**使用 Bun 运行 Vite**：

```bash
# 使用 Bun 运行 Vite 开发服务器
bun run dev  # 比 npm run dev 快

# 使用 Bun 运行 Vite 构建
bun run build
```

### Q14: Bun 的并发处理能力

**Worker Threads**：

```typescript
// worker.ts
export default {
  message(msg: string) {
    return `Processed: ${msg}`;
  },
};

// main.ts
const worker = new Worker(new URL('./worker.ts', import.meta.url));

worker.postMessage('Hello');
worker.on('message', (data) => {
  console.log(data); // "Processed: Hello"
});
```

**并发 API**：

```typescript
// 并发执行
const results = await Promise.all([
  fetch('https://api.example.com/1'),
  fetch('https://api.example.com/2'),
  fetch('https://api.example.com/3'),
]);

// 使用 Bun 的并发队列
import { Pool } from 'bun';

const pool = new Pool({
  concurrency: 10,
});

await Promise.all([
  pool.queue(() => task1()),
  pool.queue(() => task2()),
  pool.queue(() => task3()),
]);
```

### Q15: 实际项目中的 Bun 使用场景

**场景 1：全栈 Web 应用**：

```typescript
// server.ts
Bun.serve({
  port: 3000,
  async fetch(req) {
    const db = new Database('db.sqlite');

    // 路由
    if (req.url === '/api/users') {
      const users = db.query('SELECT * FROM users').all();
      return Response.json(users);
    }

    // 服务端渲染
    if (req.url === '/') {
      const html = await renderPage();
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});
```

**场景 2：CLI 工具**：

```typescript
// cli.ts
#!/usr/bin/env bun
import { $ } from 'bun';

const command = process.argv[2];

switch (command) {
  case 'build':
    await $`bun build ./src/index.ts --outdir ./dist`;
    break;
  case 'test':
    await $`bun test`;
    break;
  case 'lint':
    await $`eslint ./src`;
    break;
  default:
    console.log('Usage: bun cli.ts [build|test|lint]');
}
```

**场景 3：数据处理**：

```typescript
// process.ts
import { Database } from 'bun:sqlite';

const db = new Database('data.db');

// 批量插入
const stmt = db.prepare('INSERT INTO logs (message) VALUES (?)');

const transaction = db.transaction(() => {
  for (const line of Bun.file('logs.txt').text().split('\n')) {
    stmt.run(line);
  }
});

transaction(); // 快速批量插入
```

---

## 本章小结

### Bun 核心要点

| 特性 | 关键点 |
|------|--------|
| **性能** | 启动快 4 倍，打包快 100 倍 |
| **内置工具** | 包管理器、打包器、测试框架、服务器 |
| **兼容性** | Node.js API 兼容，npm 包可用 |
| **TypeScript** | 原生支持，零配置 |
| **数据库** | 内置 SQLite 支持 |

### 适用场景

✅ **适合使用 Bun**：
- 新项目，追求极致性能
- TypeScript 项目
- 快速原型开发
- CLI 工具开发
- 全栈应用

❌ **暂不推荐**：
- 需要大量 Node.js 特定 API 的遗留项目
- 企业级项目（稳定性待验证）
- 需要特定 Node.js C++ 插件的项目

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
