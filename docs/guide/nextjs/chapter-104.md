# 图片优化与字体优化

## 图片优化与字体优化

> **学习目标**：掌握Next.js的图片和字体优化功能，提升应用性能
> **核心内容**：next/image组件、next/font优化、自动优化、实战案例

### next/image组件

#### 什么是next/image

**next/image** 是Next.js提供的图片优化组件，自动处理图片的懒加载、响应式、格式转换等。

```
┌─────────────────────────────────────────────────────────────┐
│                    next/image 优化功能                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  优化特性:                                                  │
│  ✓ 自动格式转换 - WebP/AVIF                                │
│  ✓ 响应式图片 - srcset生成                                  │
│  ✓ 懒加载 - Intersection Observer                           │
│  ✓ 布局稳定性 - 防止CLS                                    │
│  ✓ 尺寸优化 - 自动调整大小                                  │
│  ✓ 快速刷新 - 优化开发体验                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 基础用法

**本地图片**：

```typescript
import Image from 'next/image'
import profilePic from './profile.jpg'

export default function Profile() {
  return (
    <Image
      src={profilePic}
      alt="个人资料图片"
      // 自动获取图片尺寸
      // placeholder="blur" // 使用模糊占位符
    />
  )
}
```

**远程图片**：

```typescript
import Image from 'next/image'

export default function Page() {
  return (
    <Image
      src="https://example.com/photo.jpg"
      alt="远程图片"
      width={800}
      height={600}
      // 远程图片需要配置允许的域名
    />
  )
}
```

**next.config.js配置**：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 允许的图片域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: '**.example.com', // 支持子域名
      },
    ],

    // 图片格式（按优先级）
    formats: ['image/avif', 'image/webp'],

    // 设备断点
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // 图片尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // 最小缓存时间（秒）
    minimumCacheTTL: 60,
  },
}

module.exports = nextConfig
```

#### 高级用法

**填充模式**：

```typescript
import Image from 'next/image'

export function ImageModes() {
  return (
    <div className="space-y-8">
      {/* 1. fill - 填充父容器 */}
      <div className="relative w-full h-96">
        <Image
          src="/photo.jpg"
          alt="Fill模式"
          fill
          className="object-cover"
        />
      </div>

      {/* 2. contain - 完整显示 */}
      <Image
        src="/photo.jpg"
        alt="Contain模式"
        width={400}
        height={300}
        style={{ objectFit: 'contain' }}
      />

      {/* 3. cover - 覆盖容器 */}
      <Image
        src="/photo.jpg"
        alt="Cover模式"
        width={400}
        height={300}
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}
```

**响应式图片**：

```typescript
import Image from 'next/image'

export function ResponsiveImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="响应式图片"
      // 基础宽度
      width={800}
      height={600}
      // 响应式尺寸
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      // 生成多个尺寸的图片
      // 根据sizes自动生成srcset
    />
  )
}
```

**优先级加载**：

```typescript
import Image from 'next/image'

export function HeroSection() {
  return (
    <div className="relative h-screen">
      {/* LCP图片设置优先级 */}
      <Image
        src="/hero-bg.jpg"
        alt="Hero背景"
        fill
        priority // 预加载，提升LCP
        quality={90}
        className="object-cover"
      />

      <div className="relative z-10">
        <h1>欢迎</h1>
      </div>
    </div>
  )
}
```

**占位符**：

```typescript
import Image from 'next/image'

export function PlaceholderImages() {
  return (
    <div className="space-y-8">
      {/* 模糊占位符 */}
      <Image
        src="/photo.jpg"
        alt="模糊占位符"
        width={800}
        height={600}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Base64编码的小图
      />

      {/* 颜色占位符 */}
      <Image
        src="/photo.jpg"
        alt="颜色占位符"
        width={800}
        height={600}
        placeholder="blur" // 使用主色调作为模糊效果
      />
    </div>
  )
}
```

### next/font优化

#### 什么是next/font

**next/font** 是Next.js 13+引入的字体优化功能，自动优化字体加载，避免布局偏移（CLS）。

```
┌─────────────────────────────────────────────────────────────┐
│                    字体优化目标                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  问题:                                                      │
│  ✗ FOUT - Flash of Unstyled Text                          │
│  ✗ FOIT - Flash of Invisible Text                         │
│  ✗ CLS - Cumulative Layout Shift                          │
│                                                             │
│  next/font解决方案:                                         │
│  ✓ 自动字体子集化 - 只包含需要的字符                        │
│  ✓ 零布局偏移 - 自动调整字体大小                            │
|  ✓ 预加载 - 优化加载时机                                    │
│  ✓ 自托管 - 无需外部请求                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 使用Google字体

**基础用法**：

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

// 导入Inter字体
const inter = Inter({
  subsets: ['latin'], // 字体子集
  // display: 'swap', // 字体显示策略
  // weight: ['400', '500', '600', '700'], // 字重
  // variable: '--font-inter', // CSS变量名
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body>
        {children}
      </body>
    </html>
  )
}
```

**多字体配置**：

```typescript
// app/layout.tsx
import { Inter, Playfair_Display, Fira_Code } from 'next/font/google'

// 正文字体
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// 标题字体
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700'],
})

// 代码字体
const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${playfair.variable} ${firaCode.variable}`}
    >
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

**使用CSS变量**：

```css
/* app/globals.css */
:root {
  --font-inter: var(--font-inter);
  --font-playfair: var(--font-playfair);
  --font-fira-code: var(--font-fira-code);
}

body {
  font-family: var(--font-inter);
}

h1, h2, h3 {
  font-family: var(--font-playfair);
}

code, pre {
  font-family: var(--font-fira-code);
}
```

#### 使用本地字体

**导入本地字体**：

```typescript
// app/layout.tsx
import localFont from 'next/font/local'

// 导入本地字体文件
const myFont = localFont({
  src: './fonts/MyFont.woff2',
  display: 'swap',
  weight: '400 700', // 支持可变字重
  variable: '--font-my-font',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={myFont.variable}>
      <body className={myFont.className}>
        {children}
      </body>
    </html>
  )
}
```

**多个本地字体**：

```typescript
// app/layout.tsx
import localFont from 'next/font/local'

const boldFont = localFont({
  src: './fonts/Bold.woff2',
  variable: '--font-bold',
  weight: '700',
})

const regularFont = localFont({
  src: './fonts/Regular.woff2',
  variable: '--font-regular',
  weight: '400',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`${boldFont.variable} ${regularFont.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
```

### 自动优化

#### 图片优化策略

**懒加载实现**：

```typescript
// components/ImageGallery.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

export function ImageGallery({ images }: { images: string[] }) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((src, index) => (
        <div key={index} className="aspect-square relative">
          {/* 默认懒加载，viewport可见时加载 */}
          <Image
            src={src}
            alt={`图片 ${index + 1}`}
            fill
            className="object-cover rounded-lg"
            loading="lazy" // 默认值，explicit声明
            onLoad={() => {
              setLoadedImages(prev => new Set([...prev, index]))
            }}
          />

          {/* 加载指示器 */}
          {!loadedImages.has(index) && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
          )}
        </div>
      ))}
    </div>
  )
}
```

**质量优化**：

```typescript
import Image from 'next/image'

export function OptimizedImage() {
  return (
    <>
      {/* 高质量 */}
      <Image
        src="/hero.jpg"
        alt="高质量图片"
        width={1920}
        height={1080}
        quality={90} // 默认75，范围1-100
        priority
      />

      {/* 低质量（缩略图） */}
      <Image
        src="/thumbnail.jpg"
        alt="缩略图"
        width={200}
        height={200}
        quality={50}
      />
    </>
  )
}
```

#### 字体加载策略

**font-display策略**：

```typescript
import { Roboto } from 'next/font/google'

// 1. swap - 立即使用备用字体，加载后替换（推荐）
const robotoSwap = Roboto({
  subsets: ['latin'],
  display: 'swap',
})

// 2. optional - 短暂等待，超时则不使用
const robotoOptional = Roboto({
  subsets: ['latin'],
  display: 'optional',
})

// 3. fallback - 短暂等待，失败则使用备用字体
const robotoFallback = Roboto({
  subsets: ['latin'],
  display: 'fallback',
})

// 4. block - 阻塞渲染直到字体加载完成
const robotoBlock = Roboto({
  subsets: ['latin'],
  display: 'block',
})
```

**预连接优化**：

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 预连接到字体服务器 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

### 实战案例：性能优化

创建一个图片和字体完全优化的页面。

#### 1. 项目结构

```
public/
├── images/
│   ├── hero-bg.jpg
│   ├── gallery/
│   │   ├── photo1.jpg
│   │   ├── photo2.jpg
│   │   └── ...
└── fonts/
    └── custom-font.woff2
```

#### 2. 字体配置

```typescript
// app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google'
import localFont from 'next/font/local'

// 主字体
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// 标题字体
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '700'],
})

// 自定义字体
const customFont = localFont({
  src: './fonts/custom-font.woff2',
  variable: '--font-custom',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${playfair.variable} ${customFont.variable}`}
    >
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

#### 3. Hero区域（优化LCP）

```typescript
// app/page.tsx
import Image from 'next/image'

export default function HomePage() {
  return (
    <>
      {/* Hero区域 - LCP图片优先加载 */}
      <section className="relative h-screen">
        <Image
          src="/images/hero-bg.jpg"
          alt="Hero背景"
          fill
          priority // 预加载
          quality={90}
          className="object-cover"
          sizes="100vw"
        />

        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
              欢迎来到我们的网站
            </h1>
            <p className="text-xl mb-8">
              优化的字体和图片，极致的性能体验
            </p>
            <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold">
              开始探索
            </button>
          </div>
        </div>
      </section>

      {/* 图片画廊 - 懒加载 */}
      <ImageGallery />
    </>
  )
}
```

#### 4. 响应式图片画廊

```typescript
// components/ImageGallery.tsx
import Image from 'next/image'

const galleryImages = [
  { id: 1, src: '/images/gallery/photo1.jpg', alt: '风景1' },
  { id: 2, src: '/images/gallery/photo2.jpg', alt: '风景2' },
  { id: 3, src: '/images/gallery/photo3.jpg', alt: '风景3' },
  { id: 4, src: '/images/gallery/photo4.jpg', alt: '风景4' },
  { id: 5, src: '/images/gallery/photo5.jpg', alt: '风景5' },
  { id: 6, src: '/images/gallery/photo6.jpg', alt: '风景6' },
]

export function ImageGallery() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-4xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-playfair)' }}>
        图片画廊
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleryImages.map((image) => (
          <div key={image.id} className="relative aspect-square group">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={75}
            />

            {/* 悬停遮罩 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  )
}
```

#### 5. 配置文件

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 图片优化配置
  images: {
    // 允许的图片域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],

    // 支持的图片格式
    formats: ['image/avif', 'image/webp'],

    // 设备断点
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // 图片尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // 最小缓存TTL
    minimumCacheTTL: 60,
  },
}

module.exports = nextConfig
```

### 最佳实践

#### 1. 图片优化

```tsx
{/* ✅ 推荐：使用next/image */}
<Image src="/photo.jpg" alt="照片" width={800} height={600} />

{/* ❌ 不推荐：使用原生img标签 */}
<img src="/photo.jpg" alt="照片" />
```

#### 2. 字体优化

```tsx
{/* ✅ 推荐：使用next/font */}
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

{/* ❌ 不推荐：外部CDN */}
<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
```

#### 3. 尺寸规范

```tsx
{/* ✅ 推荐：明确指定尺寸 */}
<Image src="/photo.jpg" width={800} height={600} fill />

{/* ❌ 不推荐：让浏览器猜测 */}
<Image src="/photo.jpg" fill />
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| next/image | 图片优化组件 | 熟练掌握 |
| next/font | 字体优化 | 熟练掌握 |
| 响应式图片 | sizes属性 | 掌握 |
| 加载策略 | priority、loading | 理解 |
| 实际应用 | 性能优化 | 能够实现 |

---

**下一步学习**：建议继续学习[Script优化与资源加载](./chapter-105)了解脚本优化技巧。
