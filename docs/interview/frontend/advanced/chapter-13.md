---
title: 团队协作与工程化面试题
---

# 团队协作与工程化面试题

## Monorepo最佳实践

### 工作空间配置？

```json
// pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools'

// package.json
{
  "name": "monorepo-root",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,vue,js,jsx,json,md}\"",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "prettier": "^3.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  }
}

// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}

// 目录结构
// monorepo/
// ├── apps/
// │   ├── web/           # 主应用
// │   ├── admin/         # 管理后台
// │   └── mobile/        # 移动端
// ├── packages/
// │   ├── ui/            # UI组件库
// │   ├── shared/        # 共享工具
// │   ├── types/         # 类型定义
// │   └── config/        # 共享配置
// ├── tools/
// │   ├── scripts/       # 构建脚本
// │   └── generators/    # 代码生成器
// ├── pnpm-workspace.yaml
// ├── turbo.json
// └── package.json
```

### 依赖管理？

```json
// packages/ui/package.json
{
  "name": "@my-org/ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles": "./dist/styles.css"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "vue": "^3.3.0"
  }
}

// apps/web/package.json
{
  "name": "@my-org/web",
  "version": "1.0.0",
  "dependencies": {
    "@my-org/ui": "workspace:*",
    "@my-org/shared": "workspace:*"
  },
  "devDependencies": {
    "@my-org/config": "workspace:*"
  }
}

// 使用pnpm
pnpm add <package> --filter @my-org/web
pnpm add @my-org/ui --filter @my-org/web

// 安装所有依赖
pnpm install

// 更新依赖
pnpm update

// 检查依赖
pnpm why <package>
pnpm list --depth=0
```

## 组件库建设

### 组件库架构？

```javascript
// packages/ui/
// ├── src/
// │   ├── components/
// │   │   ├── Button/
// │   │   │   ├── index.vue
// │   │   │   ├── index.test.ts
// │   │   │   └── types.ts
// │   │   ├── Input/
// │   │   └── ...
// │   ├── composables/
// │   │   ├── useButton.ts
// │   │   └── useForm.ts
// │   ├── utils/
// │   │   └── helpers.ts
// │   ├── styles/
// │   │   ├── main.scss
// │   │   └── variables.scss
// │   └── index.ts
// ├── build/
// │   ├── plugins/
// │   │   └── component.ts
// │   └── vite.config.ts
// ├── docs/
// │   └── ...
// ├── package.json
// └── tsconfig.json

// src/index.ts
import type { App } from 'vue';

// 导入所有组件
import Button from './components/Button/index.vue';
import Input from './components/Input/index.vue';

// 组件列表
const components = [Button, Input];

// 定义install方法
const install = (app: App) => {
  components.forEach(component => {
    app.component(component.name, component);
  });
};

// 导出
export {
  Button,
  Input,
  install
};

export default {
  install
};

// 按需导入配置
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyUI',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
```

### 组件测试？

```typescript
// Button/index.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from './index.vue';

describe('Button', () => {
  it('renders properly', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'primary'
      },
      slots: {
        default: 'Click me'
      }
    });

    expect(wrapper.text()).toContain('Click me');
    expect(wrapper.classes()).toContain('btn-primary');
  });

  it('emits click event', async () => {
    const wrapper = mount(Button);

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('disables button when disabled prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    });

    expect(wrapper.attributes('disabled')).toBeDefined();
  });
});

// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html']
    }
  }
});
```

### 组件文档？

```vue
<!-- Button.stories.ts -->
<script setup lang="ts">
import type { Meta, StoryObj } from '@storybook/vue3';
import Button from './index.vue';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['primary', 'secondary', 'danger']
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large']
    },
    disabled: {
      control: 'boolean'
    }
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    type: 'primary',
    default: 'Primary Button'
  }
};

export const Secondary: Story = {
  args: {
    type: 'secondary',
    default: 'Secondary Button'
  }
};

export const Disabled: Story = {
  args: {
    type: 'primary',
    disabled: true,
    default: 'Disabled Button'
  }
};
</script>
```

## 文档化方案

### VitePress配置？

```typescript
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'My Component Library',
  description: 'A Vue 3 component library',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Components', link: '/components/' },
      { text: 'GitHub', link: 'https://github.com/my-org/my-ui' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        }
      ],
      '/components/': [
        {
          text: 'Components',
          items: [
            { text: 'Button', link: '/components/button' },
            { text: 'Input', link: '/components/input' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/my-org/my-ui' }
    ]
  },

  markdown: {
    config: (md) => {
      // 添加自定义组件
      md.use(componentDemo);
    }
  }
});

// docs/components/demo.vue
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  code: string;
  component: string;
}>();

const showCode = ref(false);
</script>

<template>
  <div class="demo">
    <div class="demo-component">
      <component :is="component" />
    </div>
    <div class="demo-code">
      <button @click="showCode = !showCode">
        {{ showCode ? 'Hide' : 'Show' }} Code
      </button>
      <pre v-if="showCode"><code>{{ code }}</code></pre>
    </div>
  </div>
</template>
```

### 自动生成文档？

```typescript
// tools/generate-docs.js
import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { parse } from '@vue/compiler-sfc';

function extractComponentDocs(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const { descriptor } = parse(content);

  const docs = {
    name: descriptor.name,
    props: extractProps(descriptor),
    events: extractEvents(descriptor),
    slots: extractSlots(descriptor)
  };

  return docs;
}

function extractProps(descriptor) {
  const propsBlock = descriptor.customBlocks.find(
    block => block.type === 'props'
  );

  if (!propsBlock) return [];

  return propsBlock.content.split('\n')
    .filter(line => line.trim())
    .map(line => {
      const [name, type, description] = line.split('|').map(s => s.trim());
      return { name, type, description };
    });
}

async function generateDocs() {
  const componentFiles = await glob('packages/ui/src/components/**/*.vue');

  for (const file of componentFiles) {
    const docs = extractComponentDocs(file);

    // 生成Markdown文档
    const markdown = generateMarkdown(docs);

    // 写入文档文件
    const docPath = file.replace(
      'packages/ui/src/components',
      'docs/components'
    ).replace('.vue', '.md');

    writeFileSync(docPath, markdown);
  }
}

function generateMarkdown(docs) {
  return `# ${docs.name}

## Props

| Name | Type | Description |
|------|------|-------------|
${docs.props.map(prop =>
  `| ${prop.name} | ${prop.type} | ${prop.description} |`
).join('\n')}

## Events

${docs.events.map(event =>
  `- @${event.name}: ${event.description}`
).join('\n')}

## Slots

${docs.slots.map(slot =>
  `- #${slot.name}: ${slot.description}`
).join('\n')}
`;
}

generateDocs();
```

## 自动化测试体系

### 单元测试？

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData'
      ]
    }
  }
});

// test/setup.ts
import { vi } from 'vitest';

// 全局mock
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

// 测试工具函数
// src/utils/helpers.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency } from './helpers';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('2024-01-15');
  });

  it('handles invalid date', () => {
    expect(formatDate(null)).toBe('N/A');
  });
});

describe('formatCurrency', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
```

### 集成测试？

```typescript
// test/integration/user-flow.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';

describe('User Flow', () => {
  let pinia;

  beforeEach(() => {
    pinia = createPinia();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should complete user login flow', async () => {
    const { getByLabelText, getByText } = render(App, {
      global: {
        plugins: [pinia]
      }
    });

    // 输入用户名
    const usernameInput = getByLabelText('Username');
    await fireEvent.update(usernameInput, 'testuser');

    // 输入密码
    const passwordInput = getByLabelText('Password');
    await fireEvent.update(passwordInput, 'password123');

    // 点击登录按钮
    const loginButton = getByText('Login');
    await fireEvent.click(loginButton);

    // 等待登录成功
    await waitFor(() => {
      expect(getByText('Welcome, testuser!')).toBeInTheDocument();
    });
  });
});
```

### E2E测试？

```typescript
// e2e/basic.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome, testuser')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="username"]', 'invalid');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toContainText('Invalid credentials');
  });
});

// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

## 代码审查规范

### PR模板？

```markdown
<!-- .github/pull_request_template.md -->

## Description
<!-- 描述此PR的目的和内容 -->

## Type of Change
<!-- 标记PR类型 -->
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
<!-- 关联的Issue -->
Fixes #
Related to #

## Changes Made
<!-- 列出主要变更 -->
-
-

## Testing
<!-- 描述测试情况 -->
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
<!-- 添加截图 -->

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] All tests passing
- [ ] Changes merge without conflicts
```

### 代码审查清单？

```yaml
# .github/code-review-checklist.yml

code_review_checklist:
  general:
    - name: "Code Quality"
      items:
        - "代码符合项目风格指南"
        - "变量和函数命名清晰"
        - "没有明显的代码重复"
        - "适当的错误处理"

  functionality:
    - name: "Functionality"
      items:
        - "实现符合需求"
        - "边界情况已处理"
        - "向后兼容性已考虑"
        - "性能影响已评估"

  testing:
    - name: "Testing"
      items:
        - "单元测试已添加"
        - "测试覆盖率良好"
        - "测试用例充分"
        - "手动测试已完成"

  documentation:
    - name: "Documentation"
      items:
        - "README已更新"
        - "API文档已更新"
        - "注释充分且准确"
        - "变更日志已更新"

  security:
    - name: "Security"
      items:
        - "没有安全漏洞"
        - "敏感数据已保护"
        - "依赖包已审核"
        - "权限控制正确"
```

### 自动化检查？

```yaml
# .github/workflows/pr-check.yml

name: PR Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Run ESLint
        run: pnpm lint

      - name: Run Prettier check
        run: pnpm format:check

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Run TypeScript check
        run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build
```

## 高级工程化实践

### 前端监控体系搭建？（阿里2025真题）

```javascript
// 完整的前端监控方案

// 1. 错误监控
class ErrorMonitor {
  constructor(options) {
    this.dsn = options.dsn
    this.environment = options.environment || 'production'
    this.sampleRate = options.sampleRate || 1

    this.init()
  }

  init() {
    // 捕获JS错误
    window.addEventListener('error', (event) => {
      this.captureException(new Error(event.message), {
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

    // 捕获Promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(event.reason, {
        type: 'unhandledrejection',
        promise: event.promise
      })
    })

    // 捕获Vue错误
    app.config.errorHandler = (err, instance, info) => {
      this.captureException(err, {
        type: 'vue',
        component: instance?.$options?.name,
        info
      })
    }

    // 捕获资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.captureMessage('Resource load failed', {
          type: 'resource',
          tagName: event.target.tagName,
          src: event.target.src || event.target.href
        })
      }
    }, true)
  }

  captureException(error, context = {}) {
    if (Math.random() > this.sampleRate) return

    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        environment: this.environment,
        userAgent: navigator.userAgent,
        url: location.href,
        timestamp: Date.now()
      }
    }

    this.send(errorInfo)
  }

  captureMessage(message, context = {}) {
    this.send({
      message,
      context: {
        ...context,
        environment: this.environment,
        timestamp: Date.now()
      }
    })
  }

  async send(data) {
    try {
      await fetch(this.dsn, {
        method: 'POST',
        body: JSON.stringify(data),
        keepalive: true
      })
    } catch (e) {
      console.error('Failed to send error report:', e)
    }
  }
}

// 2. 性能监控
class PerformanceMonitor {
  constructor() {
    this.metrics = {}
  }

  // Core Web Vitals
  measureCoreVitals() {
    // FCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcp = entries.find(e => e.name === 'first-contentful-paint')
      if (fcp) {
        this.reportMetric('FCP', fcp.startTime)
      }
    }).observe({ entryTypes: ['paint'] })

    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcp = entries[entries.length - 1]
      this.reportMetric('LCP', lcp.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // FID
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fid = entries[0]
      this.reportMetric('FID', fid.processingStart - fid.startTime)
    }).observe({ entryTypes: ['first-input'] })

    // CLS
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      this.reportMetric('CLS', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // API性能
  observeAPI() {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const start = performance.now()
      const url = args[0]

      try {
        const response = await originalFetch(...args)
        const duration = performance.now() - start

        this.reportMetric('API', {
          url,
          duration,
          status: response.status,
          success: response.ok
        })

        return response
      } catch (error) {
        const duration = performance.now() - start
        this.reportMetric('API', {
          url,
          duration,
          error: error.message
        })
        throw error
      }
    }
  }

  reportMetric(name, value) {
    // 发送到监控服务
    this.send({
      type: 'performance',
      name,
      value,
      timestamp: Date.now()
    })
  }

  async send(data) {
    // 使用sendBeacon确保数据发送
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', JSON.stringify(data))
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(data),
        keepalive: true
      })
    }
  }
}

// 3. 用户行为监控
class BehaviorMonitor {
  constructor() {
    this.events = []
  }

  init() {
    // 点击事件
    document.addEventListener('click', (e) => {
      this.trackEvent('click', {
        tagName: e.target.tagName,
        id: e.target.id,
        className: e.target.className,
        text: e.target.textContent?.slice(0, 50)
      })
    })

    // 路由变化
    this.trackRouteChange()

    // 页面停留时间
    this.trackPageStay()
  }

  trackEvent(type, data) {
    this.events.push({
      type,
      data,
      timestamp: Date.now(),
      url: location.href
    })

    // 批量上报
    if (this.events.length >= 10) {
      this.flush()
    }
  }

  trackRouteChange() {
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = (...args) => {
      originalPushState.apply(history, args)
      this.trackEvent('route', { type: 'push' })
    }

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args)
      this.trackEvent('route', { type: 'replace' })
    }

    window.addEventListener('popstate', () => {
      this.trackEvent('route', { type: 'popstate' })
    })
  }

  trackPageStay() {
    const startTime = Date.now()

    window.addEventListener('beforeunload', () => {
      const duration = Date.now() - startTime
      this.trackEvent('stay', { duration })
      this.flush()
    })
  }

  flush() {
    if (this.events.length === 0) return

    fetch('/api/analytics/events', {
      method: 'POST',
      body: JSON.stringify(this.events),
      keepalive: true
    })

    this.events = []
  }
}

// 初始化监控系统
const errorMonitor = new ErrorMonitor({
  dsn: '/api/errors',
  environment: import.meta.env.MODE,
  sampleRate: 1
})

const perfMonitor = new PerformanceMonitor()
perfMonitor.measureCoreVitals()
perfMonitor.observeAPI()

const behaviorMonitor = new BehaviorMonitor()
behaviorMonitor.init()
```

### 代码审查最佳实践？（字节、阿里必问）

```javascript
// Code Review Checklist & Best Practices

// Pull Request模板
// .github/PULL_REQUEST_TEMPLATE.md
## 描述
<!-- 简要描述本次PR的变更内容 -->

## 变更类型
- [ ] 新功能
- [ ] Bug修复
- [ ] 性能优化
- [ ] 重构
- [ ] 文档更新
- [ ] 测试相关

## 相关Issue
Closes #issue_number

## 变更说明
<!-- 详细说明你的变更 -->

## 测试
- [ ] 已添加单元测试
- [ ] 已添加集成测试
- [ ] 已进行手动测试

## 截图（如适用）
<!-- 添加UI变更的截图 -->

## Checklist
- [ ] 代码遵循项目规范
- [ ] 已添加必要的注释
- [ ] 文档已更新
- [ ] 无console.log或调试代码
- [ ] 通过所有CI检查

// 代码审查检查清单
const reviewChecklist = {
  // 1. 代码质量
  codeQuality: [
    '命名是否清晰易懂？',
    '函数是否单一职责？',
    '是否有重复代码？',
    '是否有魔法数字？',
    '是否有注释说明复杂逻辑？'
  ],

  // 2. 性能考虑
  performance: [
    '是否有不必要的循环嵌套？',
    '大数组操作是否需要优化？',
    '是否有内存泄漏风险？',
    '图片和资源是否优化？',
    '是否使用了适当的缓存？'
  ],

  // 3. 安全问题
  security: [
    '用户输入是否验证？',
    '敏感数据是否正确处理？',
    '是否有XSS风险？',
    '是否有CSRF保护？',
    'API调用是否有错误处理？'
  ],

  // 4. 测试覆盖
  testing: [
    '是否有足够的单元测试？',
    '边界情况是否测试？',
    '错误处理是否测试？',
    '测试命名是否清晰？'
  ],

  // 5. TypeScript
  typescript: [
    '类型定义是否完整？',
    '是否使用了any？',
    '接口是否可复用？',
    '泛型使用是否合理？'
  ]
}

// Git Commit规范
// .gitmessage
# <type>(<scope>): <subject>
#
# type: feat, fix, docs, style, refactor, test, chore
# scope: 影响
# subject: 简短描述（不超过50字符）
#
# 详细描述（可选）
#
# Footer（可选）
# Closes #issue

// Commitlint配置
// .commitlintrc.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',     // 新功能
      'fix',      // Bug修复
      'docs',     // 文档
      'style',    // 代码格式
      'refactor', // 重构
      'perf',     // 性能优化
      'test',     // 测试
      'chore',    // 构建/工具
      'revert'    // 回退
    ]],
    'scope-enum': [2, 'always', [
      'components',
      'utils',
      'api',
      'store',
      'router'
    ]],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case']
  }
}

// 自动化代码审查工具
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    // 代码质量
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'warn',
    'no-var': 'error',
    'prefer-const': 'warn',

    // Vue相关
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'warn',
    'vue/require-prop-types': 'warn',

    // TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_'
    }]
  }
}
```

### 文档管理最佳实践？（腾讯高频）

```javascript
// 文档管理体系

// 1. JSDoc规范
/**
 * 用户数据获取函数
 * @param {number} userId - 用户ID
 * @param {Object} options - 配置选项
 * @param {boolean} options.includeProfile - 是否包含个人资料
 * @param {string[]} [options.fields] - 需要返回的字段
 * @returns {Promise<User>} 用户数据
 * @throws {Error} 当用户不存在时抛出错误
 * @example
 * const user = await getUser(123, { includeProfile: true })
 */
async function getUser(userId, options = {}) {
  // 实现
}

// 2. 组件文档规范
// Button.vue文档
/**
 * Button组件 - 基础按钮组件
 *
 * @description 提供多种样式和尺寸的按钮
 *
 * @example
 * <Button type="primary" size="large" @click="handleClick">
 *   点击我
 * </Button>
 */

// 3. README模板
// README.md
# 项目名称

## 简介
<!-- 一句话描述项目 -->

## 功能特性
- ✅ 特性1
- ✅ 特性2
- ✅ 特性3

## 技术栈
- Vue 3
- TypeScript
- Vite
- Pinia

## 快速开始

### 安装依赖
\`\`\`bash
pnpm install
\`\`\`

### 开发
\`\`\`bash
pnpm dev
\`\`\`

### 构建
\`\`\`bash
pnpm build
\`\`\`

## 项目结构
\`\`\`
src/
├── assets/      # 静态资源
├── components/  # 组件
├── composables/ # 组合式函数
├── router/      # 路由
├── stores/      # 状态管理
└── views/       # 页面
\`\`\`

## 开发规范
- [代码规范](./docs/CODING_STANDARDS.md)
- [Git工作流](./docs/GIT_WORKFLOW.md)
- [提交规范](./docs/COMMIT_CONVENTION.md)

## 常见问题
### Q: 如何配置环境变量？
A: 在根目录创建.env文件...

## 贡献指南
欢迎提交PR！

## 许可证
MIT

// 4. API文档规范
/**
 * @api {POST} /api/users 创建用户
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiParam {String} name 用户名
 * @apiParam {String} email 邮箱
 *
 * @apiSuccess {Number} code 状态码
 * @apiSuccess {Object} data 用户数据
 * @apiSuccess {Number} data.id 用户ID
 *
 * @apiError {Number} code 错误码
 * @apiError {String} message 错误信息
 *
 * @apiExample {curl} 示例:
 * curl -X POST http://api.example.com/api/users \\
 *   -d "name=John&email=john@example.com"
 */

// 5. 变更日志维护
// CHANGELOG.md
# Changelog

## [1.2.0] - 2024-01-15
### Added
- 新增用户头像上传功能
- 添加暗色模式支持

### Changed
- 优化首页加载速度（50%提升）
- 更新UI组件库到v2.0

### Fixed
- 修复登录状态丢失问题
- 修复移动端布局错位

### Deprecated
- `oldMethod()` 将在v2.0移除

### Removed
- 移除不再使用的工具函数

### Security
- 修复XSS漏洞

// 6. 架构文档
// docs/architecture.md
# 系统架构

## 整体架构
\`\`\`
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
┌──────▼──────────┐
│   Nginx (CDN)   │
└──────┬──────────┘
       │
┌──────▼──────────┐
│  Load Balancer  │
└──────┬──────────┘
       │
  ┌────┴────┐
  │         │
┌─▼──┐  ┌──▼─┐
│Web1│  │Web2│  (应用服务器)
└─┬──┘  └──┬─┘
  │         │
┌─▼─────────▼─┐
│  Redis Cluster│ (缓存)
└──────────────┘

## 数据流
\`\`\`
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
