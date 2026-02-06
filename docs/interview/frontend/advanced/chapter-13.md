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

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
