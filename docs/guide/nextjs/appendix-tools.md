# 附录：Next.js开发工具速查手册

> **Next.js 15最新特性**
>
> 本附录基于Next.js 15版本，提供：
> - Next.js CLI命令完全指南
> - VSCode Next.js开发配置
> - 部署命令速查

## 附录A：Next.js CLI命令

### 🚀 项目创建

```bash
# 创建新项目（推荐方式）
npx create-next-app@latest

# 交互式创建
npx create-next-app@latest my-app

# 指定所有选项
npx create-next-app@latest my-app \
  --typescript \
  --eslint \
  --tailwind \
  --src-dir \
  --app \
  --import-alias "@/*" \
  --use-npm

# 使用特定包管理器
npx create-next-app@latest my-app --use-pnpm
npx create-next-app@latest my-app --use-yarn
```

### 📦 项目结构

```
my-app/
├── src/
│   ├── app/                    # App Router
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.tsx             # 首页
│   │   ├── globals.css          # 全局样式
│   │   └── api/                # API路由
│   ├── components/             # 共享组件
│   ├── lib/                   # 工具库
│   ├── styles/                # 样式文件
│   └── public/                # 静态资源
├── public/                     # 公共资源
├── next.config.js              # Next.js配置
├── tsconfig.json               # TypeScript配置
└── package.json               # 依赖配置
```

### 🔧 开发命令

```bash
# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# Lint代码
npm run lint
npm run lint --fix

# 类型检查
npm run type-check

# 环境变量检查
npm run env:check
```

---

## 附录B：Next.js核心命令

### 🎯 开发命令

| 命令 | 说明 | 频率 |
|------|------|------|
| `npm run dev` | 启动开发服务器 | ⭐⭐⭐⭐⭐ |
| `npm run build` | 生产构建 | ⭐⭐⭐⭐⭐ |
| `npm start` | 启动生产服务器 | ⭐⭐⭐⭐ |
| `npm run lint` | ESLint检查 | ⭐⭐⭐⭐ |

### 🏗️ 构建命令

```bash
# 标准构建
npm run build

# 构建并分析
npm run build -- --analyze

# 构建指定环境
npm run build -- --env=production

# 调试构建
npm run build --debug
```

### 🚀 部署命令

**Vercel部署（推荐）：**
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署到Vercel
vercel

# 部署到生产环境
vercel --prod

# 预览部署
vercel --yes
```

**Docker部署：**
```bash
# 构建Docker镜像
docker build -t my-app .

# 运行容器
docker run -p 3000:3000 my-app
```

---

## 附录C：Next.js路由类型

### 📱 App Router (Next.js 13+)

```
src/app/
├── layout.tsx           # 根布局
├── page.tsx             # 首页 (/)
├── about/
│   └── page.tsx         # 关于页 (/about)
├── blog/
│   ├── page.tsx         # 博客列表 (/blog)
│   └── [slug]/
│       └── page.tsx     # 博客文章 (/blog/[slug])
└── api/
    ├── route.ts         # API路由 (/api/hello)
    └── [id]/
        └── route.ts     # 动态API (/api/posts/[id])
```

**动态路由示例：**
```typescript
// src/app/posts/[id]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return posts.map((post) => ({
    id: post.id.toString(),
  }));
}

export default async function Page({ params }: { params: { id: string } }) {
  const post = await fetch(`https://api.example.com/posts/${params.id}`).then(r => r.json());

  return <div>{post.title}</div>;
}
```

---

## 附录D：Next.js配置文件

### ⚙️ next.config.js 配置

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ===== 实验性功能 =====
  experimental: {
    // React Compiler
    reactCompiler: true,
    // 优化包导入
    optimizePackageImports: true,
    // Turbopack（下一代打包工具）
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // ===== 图片优化 =====
  images: {
    domains: ['example.com', 'cdn.example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],
  },

  // ===== 环境变量 =====
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // ===== Webpack配置 =====
  webpack: (config, { isServer }) => {
    // 自定义Webpack配置
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }
    return config;
  },

  // ===== 重定向和重写 =====
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: false, // 307临时重定向
      },
      {
        source: '/old-blog',
        destination: '/blog',
        permanent: true, // 308永久重定向
      },
    ];
  },

  // ===== 重写规则 =====
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ];
  },

  // ===== 头部配置 =====
  async headers() {
    return [
      {
        source: '/:all*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 附录E：Next.js开发工具

### 🎨 VSCode扩展

```json
{
  "recommendations": [
    // Next.js官方
    "bradlc.vscode-tailwindcss",     // TailwindCSS智能提示
    "formulahendry.auto-rename-tag",  // 自动重命名标签
    "dsznajder.es7-react-js-snippets",  // React代码片段

    // TypeScript
    "usernamehw.errorlens",         // 行内错误显示
    "arrayheader.size",               // 显示数组大小

    // Next.js特定
    "medint.pluginmedintvscode",    // Medint（可视化Next.js）
  ]
}
```

### 🔧 VSCode settings.json

```json
{
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "tailwindCSS.experimental.classRegex": [
    "cva\\(([^)]*\\)",
    "[\"`]([^\"`]*)[\"`]`",
    "(?:^|\\s)className",
    "className\\s*=\\s*[\"`]([^\"`]*)[\"`]`"
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

---

## 附录F：Next.js常用模式

### 📝 页面路由模式

```typescript
// src/app/dashboard/page.tsx
export default function Dashboard() {
  return <div>Dashboard</div>;
}

// 元数据配置
export const metadata = {
  title: 'Dashboard',
  description: 'User dashboard',
};

// 生成静态参数
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}

// 服务器端渲染数据
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}
```

### 🔌 API路由模式

```typescript
// src/app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ message: 'Hello World' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

### 🎨 服务组件模式

```typescript
// src/components/Header.tsx
export default function Header() {
  return (
    <header className="bg-white shadow">
      <nav>Navigation</nav>
    </header>
  );
}
```

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
