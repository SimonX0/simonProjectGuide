# Tailwind CSS集成

## Tailwind CSS集成

> **学习目标**：掌握Tailwind CSS在Next.js中的集成和高级用法
> **核心内容**：Tailwind安装、CSS变量和主题、响应式设计、实战案例

### Tailwind安装

#### 自动安装

使用create-next-app时选择Tailwind：

```bash
npx create-next-app@latest my-app
# Would you like to use Tailwind CSS? Yes
```

#### 手动安装

```bash
# 1. 安装依赖
npm install -D tailwindcss postcss autoprefixer

# 2. 初始化Tailwind
npx tailwindcss init -p
```

**配置文件**：

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**导入样式**：

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### CSS变量和主题

#### CSS变量配置

**定义CSS变量**：

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Tailwind配置使用CSS变量**：

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}
```

#### 自定义主题

**扩展默认主题**：

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
    },
  },
}
```

### 响应式设计

#### 断点系统

**默认断点**：

```typescript
// 断点值
const breakpoints = {
  sm: '640px',   // 手机横屏
  md: '768px',   // 平板
  lg: '1024px',  // 小型笔记本
  xl: '1280px',  // 桌面
  '2xl': '1536px', // 大屏幕
}
```

**响应式类使用**：

```typescript
// 移动优先设计
export default function ResponsiveComponent() {
  return (
    <div className="
      // 默认(移动端)
      p-4
      // sm断点及以上
      sm:p-6 sm:text-sm
      // md断点及以上
      md:p-8 md:text-base
      // lg断点及以上
      lg:p-12 lg:text-lg
      // xl断点及以上
      xl:p-16 xl:text-xl
    ">
      响应式内容
    </div>
  )
}
```

**隐藏元素**：

```typescript
<div className="
  // 移动端隐藏
  hidden
  // md及以上显示
  md:block
">
  桌面显示内容
</div>

<div className="
  // 默认显示
  block
  // md及以上隐藏
  md:hidden
">
  仅移动端显示
</div>
```

#### 响应式布局

**Grid布局**：

```typescript
export default function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 gap-6
      md:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(item => (
        <div key={item} className="bg-white p-6 rounded-lg shadow">
          卡片 {item}
        </div>
      ))}
    </div>
  )
}
```

**Flex布局**：

```typescript
export default function ResponsiveFlex() {
  return (
    <div className="flex flex-col
      md:flex-row
      gap-4
      md:gap-8">
      <aside className="w-full md:w-64">
        侧边栏
      </aside>
      <main className="flex-1">
        主内容
      </main>
    </div>
  )
}
```

### 实战案例：精美UI组件

创建一个完整的UI组件库。

#### 1. 按钮组件

```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      default: 'bg-gray-900 text-white hover:bg-gray-800',
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      ghost: 'hover:bg-gray-100 hover:text-gray-900',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-11 px-6 text-lg',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
```

#### 2. 卡片组件

```typescript
// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: CardProps) {
  return (
    <h3 className={`text-2xl font-bold leading-none tracking-tight ${className}`}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className = '' }: CardProps) {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  )
}
```

#### 3. 输入框组件

```typescript
// components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={`
          flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2
          text-sm placeholder:text-gray-400
          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
```

#### 4. 模态框组件

```typescript
// components/ui/Modal.tsx
'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal内容 */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 animate-in zoom-in duration-200">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
```

#### 5. 完整页面示例

```typescript
// app/page.tsx
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Logo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-700 hover:text-gray-900">
                首页
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                关于
              </a>
              <Button variant="primary">开始使用</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero区域 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            构建现代化的
            <span className="text-blue-600"> Web应用</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            使用Next.js和Tailwind CSS快速构建美观、高性能的网站
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="primary" size="lg">
              立即开始
            </Button>
            <Button variant="secondary" size="lg">
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* 特性卡片 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">核心特性</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: '⚡',
    title: '高性能',
    description: '优化的构建和运行时性能，提供最佳用户体验',
  },
  {
    icon: '🎨',
    title: '精美设计',
    description: '现代化的UI组件，开箱即用的美观界面',
  },
  {
    icon: '📱',
    title: '响应式',
    description: '完美适配各种设备尺寸，提供一致体验',
  },
  {
    icon: '🔧',
    title: '易于定制',
    description: '灵活的配置选项，轻松满足各种需求',
  },
  {
    icon: '🚀',
    title: '快速开发',
    description: '丰富的开发工具和热重载，提升开发效率',
  },
  {
    icon: '📦',
    title: '开箱即用',
    description: '完整的解决方案，无需复杂的配置',
  },
]
```

### 最佳实践

#### 1. 使用@apply

```css
/* ✅ 推荐：为常用组件创建可重用类 */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }

  .btn-primary {
    @apply btn bg-blue-600 text-white hover:bg-blue-700;
  }
}
```

#### 2. 响应式设计

```tsx
{/* ✅ 推荐：移动优先 */}
<div className="w-full md:w-1/2 lg:w-1/3">
  内容
</div>
```

#### 3. 深色模式

```tsx
{/* ✅ 推荐：使用dark:前缀 */}
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  自适应主题内容
</div>
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| Tailwind安装 | 手动和自动安装 | 掌握 |
| CSS变量 | 主题定制 | 熟练掌握 |
| 响应式设计 | 断点和响应式类 | 熟练掌握 |
| UI组件 | 按钮、卡片、输入框等 | 能够实现 |
| 最佳实践 | 代码组织 | 掌握 |

---

**下一步学习**：建议继续学习[CSS Modules与Styled JSX](./chapter-103)了解其他样式方案。
