# CSS Modules与Styled JSX

## CSS Modules与Styled JSX

> **学习目标**：掌握CSS Modules和Styled JSX在Next.js中的使用
> **核心内容**：CSS Modules使用、Styled JSX语法、样式最佳实践、实战案例

### CSS Modules使用

#### 什么是CSS Modules

**CSS Modules** 是一种CSS文件的作用域机制，自动生成唯一的类名，避免样式冲突。

```
┌─────────────────────────────────────────────────────────────┐
│                   CSS Modules 工作原理                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  源代码                      编译后                         │
│  ┌──────────────────┐      ┌──────────────────────────┐   │
│  │ .title {         │      │ .title_title__abc123 {   │   │
│  │   color: red;    │  →   │   color: red;            │   │
│  │ }                │      │ }                        │   │
│  └──────────────────┘      └──────────────────────────┘   │
│                                                             │
│  优势:                                                      │
│  ✓ 局部作用域 - 避免全局污染                                │
│  ✓ 自动处理类名冲突                                         │
│  ✓ 更好的可维护性                                           │
│  ✓ 支持动态类名                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 基础用法

**创建CSS Module**：

```css
/* styles/Button.module.css */
.button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.primary {
  background-color: #3b82f6;
  color: white;
}

.primary:hover {
  background-color: #2563eb;
}

.secondary {
  background-color: #e5e7eb;
  color: #111827;
}

.secondary:hover {
  background-color: #d1d5db;
}

.large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
```

**使用CSS Module**：

```typescript
// components/Button.tsx
import styles from '@/styles/Button.module.css'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'large' | 'small'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size,
  children,
}: ButtonProps) {
  const classNames = `${styles.button} ${styles[variant]} ${size ? styles[size] : ''}`

  return (
    <button className={classNames}>
      {children}
    </button>
  )
}
```

#### 动态类名

**条件类名**：

```typescript
// components/Alert.tsx
import styles from '@/styles/Alert.module.css'

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  children: React.ReactNode
  onClose?: () => void
}

export function Alert({ type = 'info', children, onClose }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      <div className={styles.content}>
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={styles.close}
          aria-label="关闭"
        >
          ✕
        </button>
      )}
    </div>
  )
}
```

**组合类名**：

```typescript
// utils/cn.ts (类似clsx + tailwind-merge)
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

// 使用
import { cn } from '@/utils/cn'
import styles from '@/styles/Card.module.css'

export function Card({ variant = 'default', className }: Props) {
  return (
    <div className={cn(styles.card, styles[variant], className)}>
      内容
    </div>
  )
}
```

#### CSS Modules与TypeScript

**类型声明**：

```typescript
// types/css-modules.d.ts
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}
```

**使用类型安全的CSS Modules**：

```typescript
// components/Card.tsx
import styles from '@/styles/Card.module.css'

// TypeScript会自动推断
// styles.card, styles.header等都是string类型
export function Card() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>标题</div>
      <div className={styles.body}>内容</div>
    </div>
  )
}
```

### Styled JSX语法

#### 什么是Styled JSX

**Styled JSX** 是一种CSS-in-JS解决方案，允许在组件内部编写作用域CSS。

```
┌─────────────────────────────────────────────────────────────┐
│                    Styled JSX 特性                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  特性:                                                      │
│  ✓ 完全作用域 - 样式只在组件内生效                           │
│  ✓ JSX集成 - 直接在组件中编写CSS                            │
│  ✓ 支持Sass/Less - 可以使用预处理器                         │
│  ✓ 动态样式 - 支持props驱动的样式                            │
│  ✓ 服务端渲染支持 - Next.js内置支持                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 基础Styled JSX

**基础用法**：

```typescript
// components/StyledButton.tsx
export function StyledButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="button">
      {children}

      <style jsx>{`
        .button {
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .button:hover {
          background-color: #2563eb;
        }

        .button:active {
          transform: scale(0.98);
        }
      `}</style>
    </button>
  )
}
```

**全局样式**：

```typescript
// components/Layout.tsx
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      {children}

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        a {
          color: #3b82f6;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
```

#### 动态Styled JSX

**Props驱动的样式**：

```typescript
// components/DynamicButton.tsx
interface DynamicButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  children: React.ReactNode
}

export function DynamicButton({
  variant = 'primary',
  size = 'medium',
  children,
}: DynamicButtonProps) {
  const variantStyles = {
    primary: '#3b82f6',
    secondary: '#6b7280',
    danger: '#ef4444',
  }

  const sizeStyles = {
    small: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    medium: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    large: { padding: '1rem 2rem', fontSize: '1.125rem' },
  }

  return (
    <button className="dynamic-button">
      {children}

      <style jsx>{`
        .dynamic-button {
          background-color: ${variantStyles[variant]};
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          padding: ${sizeStyles[size].padding};
          font-size: ${sizeStyles[size].fontSize};
        }

        .dynamic-button:hover {
          filter: brightness(1.1);
        }

        .dynamic-button:active {
          transform: scale(0.98);
        }
      `}</style>
    </button>
  )
}
```

#### 响应式Styled JSX

**媒体查询**：

```typescript
// components/ResponsiveCard.tsx
export function ResponsiveCard({ title, content }: Props) {
  return (
    <div className="card">
      <h2 className="title">{title}</h2>
      <p className="content">{content}</p>

      <style jsx>{`
        .card {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1rem;
          max-width: 100%;
        }

        @media (min-width: 768px) {
          .card {
            padding: 1.5rem;
            max-width: 50%;
          }
        }

        @media (min-width: 1024px) {
          .card {
            padding: 2rem;
            max-width: 33.333%;
          }
        }

        .title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        @media (min-width: 768px) {
          .title {
            font-size: 1.5rem;
          }
        }

        .content {
          color: #6b7280;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}
```

### 样式最佳实践

#### 选择合适的样式方案

**方案对比**：

| 方案 | 适用场景 | 优势 | 劣势 |
|------|----------|------|------|
| **Tailwind CSS** | 快速开发、工具优先 | 开发快、一致性高、bundle小 | 类名冗长 |
| **CSS Modules** | 传统CSS开发、大型项目 | 熟悉的语法、作用域清晰 | 需要额外文件 |
| **Styled JSX** | 组件隔离、动态样式 | 组件内联、类型安全 | 混合JSX和CSS |
| **CSS-in-JS** | 复杂主题、动态样式 | 完全动态、主题化 | 运行时开销 |

#### CSS Modules最佳实践

**命名约定**：

```css
/* Button.module.css */
/* 组件名-元素名-修饰符 */

/* 基础类 */
.button {
  /* ... */
}

/* 变体 */
.button--primary {
  /* ... */
}

.button--secondary {
  /* ... */
}

/* 尺寸 */
.button--large {
  /* ... */
}

.button--small {
  /* ... */
}

/* 状态 */
.button--disabled {
  /* ... */
}

/* 元素 */
.button__icon {
  /* ... */
}

.button__text {
  /* ... */
}
```

**组织CSS Modules**：

```typescript
// components/Button/index.tsx
import styles from './Button.module.css'

// 导出样式和组件
export { styles }
export { Button }
```

#### Styled JSX最佳实践

**模板字符串**：

```typescript
// ✅ 推荐：使用模板字符串函数
const getStyles = (variant: string) => `
  .button {
    background-color: ${variant === 'primary' ? '#3b82f6' : '#6b7280'};
  }
`

export function Button({ variant }: Props) {
  return (
    <button>
      点击
      <style jsx>{getStyles(variant)}</style>
    </button>
  )
}
```

**提取常量**：

```typescript
// ✅ 推荐：提取样式常量
const COLORS = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  danger: '#ef4444',
}

const SIZES = {
  small: '0.5rem 1rem',
  medium: '0.75rem 1.5rem',
  large: '1rem 2rem',
}
```

### 实战案例：组件样式系统

创建一个完整的组件库样式系统。

#### 1. CSS Modules组件

```css
/* components/Card/Card.module.css */
.card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.body {
  padding: 1.5rem;
}

.footer {
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.elevated {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.elevated:hover {
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}
```

```typescript
// components/Card/Card.tsx
import styles from './Card.module.css'

interface CardProps {
  title?: string
  footer?: React.ReactNode
  elevated?: boolean
  children: React.ReactNode
}

export function Card({ title, footer, elevated, children }: CardProps) {
  return (
    <div className={`${styles.card} ${elevated ? styles.elevated : ''}`}>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
      )}

      <div className={styles.body}>
        {children}
      </div>

      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </div>
  )
}
```

#### 2. Styled JSX组件

```typescript
// components/Badge/Badge.tsx
interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
}

export function Badge({ variant = 'info', children }: BadgeProps) {
  const colors = {
    success: { bg: '#d1fae5', text: '#065f46' },
    warning: { bg: '#fef3c7', text: '#92400e' },
    error: { bg: '#fee2e2', text: '#991b1b' },
    info: { bg: '#dbeafe', text: '#1e40af' },
  }

  const { bg, text } = colors[variant]

  return (
    <span className="badge">
      {children}

      <style jsx>{`
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          background-color: ${bg};
          color: ${text};
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 9999px;
        }
      `}</style>
    </span>
  )
}
```

#### 3. 混合使用

```typescript
// components/Input/Input.tsx
import styles from './Input.module.css'

interface InputProps {
  label?: string
  error?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function Input({ label, error, placeholder, value, onChange }: InputProps) {
  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}

      <input
        type="text"
        className={`${styles.input} ${error ? styles.error : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />

      {error && (
        <span className={styles.errorMessage}>
          {error}
        </span>
      )}

      <style jsx>{`
        .wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .input.error {
          border-color: #ef4444;
        }

        .label {
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
        }

        .errorMessage {
          font-size: 0.875rem;
          color: #ef4444;
        }
      `}</style>
    </div>
  )
}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| CSS Modules | 作用域样式、.module.css | 熟练掌握 |
| Styled JSX | 内联样式、动态样式 | 熟练掌握 |
| 样式选择 | 方案对比、适用场景 | 理解 |
| 最佳实践 | 命名约定、组织方式 | 掌握 |
| 实际应用 | 组件样式系统 | 能够实现 |

---

**下一步学习**：建议继续学习[图片优化与字体优化](./chapter-104)了解性能优化技巧。
