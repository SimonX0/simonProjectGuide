# ：useId与并发渲染

## useId 基础用法

useId 是 React 18 引入的一个 Hook，用于生成唯一的 ID，特别适用于需要可访问性（accessibility）的场景，如表单标签与输入框的关联。

### 为什么需要 useId

```tsx
// ❌ 问题：服务端和客户端生成的 ID 不一致
function BadForm() {
  // 在服务端渲染时，Math.random() 可能生成一个值
  // 在客户端 hydration 时，会生成另一个值
  // 导致 hydration 不匹配错误
  const inputId = `input-${Math.random()}`

  return (
    <div>
      <label htmlFor={inputId}>邮箱</label>
      <input id={inputId} type="email" />
    </div>
  )
}

// ❌ 问题：使用计数器在并发渲染中不安全
let counter = 0

function CounterIdForm() {
  const inputId = `input-${counter++}`

  return (
    <div>
      <label htmlFor={inputId}>邮箱</label>
      <input id={inputId} type="email" />
    </div>
  )
}

// ✅ 正确：使用 useId
import { useId } from 'react'

function GoodForm() {
  const inputId = useId()

  return (
    <div>
      <label htmlFor={inputId}>邮箱</label>
      <input id={inputId} type="email" />
    </div>
  )
}
```

### useId 基本语法

```tsx
import { useId } from 'react'

function MyComponent() {
  // 生成唯一 ID
  const id = useId()

  return (
    <div>
      <label htmlFor={id}>用户名</label>
      <input id={id} type="text" />
    </div>
  )
}

// 使用前缀使 ID 更有意义
function LoginForm() {
  const usernameId = useId()
  const passwordId = useId()

  return (
    <form>
      <div>
        <label htmlFor={usernameId}>用户名</label>
        <input id={usernameId} type="text" />
      </div>

      <div>
        <label htmlFor={passwordId}>密码</label>
        <input id={passwordId} type="password" />
      </div>
    </form>
  )
}
```

### useId 的使用场景

```tsx
// 场景1：表单标签关联
function FormWithLabels() {
  const emailId = useId()
  const passwordId = useId()

  return (
    <form>
      <div>
        <label htmlFor={emailId} className="form-label">
          邮箱地址
        </label>
        <input
          id={emailId}
          type="email"
          className="form-input"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor={passwordId} className="form-label">
          密码
        </label>
        <input
          id={passwordId}
          type="password"
          className="form-input"
          placeholder="••••••••"
        />
      </div>
    </form>
  )
}

// 场景2：可访问性属性（ARIA）
function AccessibleButton() {
  const descriptionId = useId()

  return (
    <button
      aria-describedby={descriptionId}
      onClick={() => alert('点击了按钮')}
    >
      点击我
      <span id={descriptionId} className="sr-only">
        这将打开一个对话框
      </span>
    </button>
  )
}

// 场景3：描述列表
function DescriptionList() {
  const termId = useId()

  return (
    <dl>
      <dt id={termId}>React</dt>
      <dd aria-labelledby={termId}>
        一个用于构建用户界面的 JavaScript 库
      </dd>
    </dl>
  )
}

// 场景4：错误消息关联
function InputWithError() {
  const inputId = useId()
  const errorId = useId()

  return (
    <div>
      <label htmlFor={inputId}>邮箱</label>
      <input
        id={inputId}
        type="email"
        aria-invalid="true"
        aria-describedby={errorId}
      />
      <span id={errorId} className="error-message" role="alert">
        请输入有效的邮箱地址
      </span>
    </div>
  )
}
```

## 服务端渲染和 Hydration

useId 的一个关键特性是它在服务端渲染（SSR）和客户端 hydration 时能保持一致性。

### SSR 中的 ID 生成问题

```tsx
// ❌ 问题：SSR 中的随机 ID 不一致
// 服务端渲染
<div>
  <label htmlFor="input-0.123456">邮箱</label>
  <input id="input-0.123456" type="email" />
</div>

// 客户端 hydration
<div>
  <label htmlFor="input-0.789012">邮箱</label>
  <input id="input-0.789012" type="email" />
</div>
// React 检测到不匹配，发出警告！

// ✅ 解决：使用 useId
function SSRForm() {
  const inputId = useId()

  // 服务端和客户端都会生成相同的 ID
  return (
    <div>
      <label htmlFor={inputId}>邮箱</label>
      <input id={inputId} type="email" />
    </div>
  )
}
```

### useId 的工作原理

```tsx
// useId 内部实现简化版
let currentId = 0
let idPrefix = ''

function useId() {
  // 1. 生成确定性的 ID（基于组件树位置）
  const id = `:${currentId++}`

  // 2. 添加前缀（区分不同 SSR 渲染）
  const fullId = `${idPrefix}${id}`

  return fullId
}

// 实际使用示例
function App() {
  // 在 SSR 中，React 会为每个请求分配不同的前缀
  // 请求1: 前缀可能是 "r0"
  // 请求2: 前缀可能是 "r1"

  const id1 = useId() // ":r0:" 或 ":r1:"
  const id2 = useId() // ":r0:0" 或 ":r1:0"

  return (
    <div>
      <label htmlFor={id1}>输入1</label>
      <input id={id1} />

      <label htmlFor={id2}>输入2</label>
      <input id={id2} />
    </div>
  )
}
```

### Next.js 中使用 useId

```tsx
// pages/index.tsx (Next.js SSR 示例)
import { useId } from 'react'

export default function ContactForm() {
  const nameId = useId()
  const emailId = useId()
  const messageId = useId()

  return (
    <form className="contact-form">
      <div className="form-group">
        <label htmlFor={nameId}>姓名</label>
        <input id={nameId} type="text" required />
      </div>

      <div className="form-group">
        <label htmlFor={emailId}>邮箱</label>
        <input id={emailId} type="email" required />
      </div>

      <div className="form-group">
        <label htmlFor={messageId}>消息</label>
        <textarea id={messageId} rows={5} required />
      </div>

      <button type="submit">发送</button>
    </form>
  )
}

// 这个组件在服务端和客户端都会生成相同的 ID
// 不会导致 hydration 不匹配错误
```

### ID 前缀的作用

```tsx
// React 18 使用前缀来区分不同的渲染树

// 示例：多个根节点
function MultiRootApp() {
  return (
    <>
      <Root1 />
      <Root2 />
    </>
  )
}

function Root1() {
  // 这些 ID 会有前缀 "r0:"
  const id1 = useId() // ":r0:"
  const id2 = useId() // ":r0:0"

  return <div id={id1}>{id2}</div>
}

function Root2() {
  // 这些 ID 会有前缀 "r1:"
  const id1 = useId() // ":r1:"
  const id2 = useId() // ":r1:0"

  return <div id={id1}>{id2}</div>
}

// 这样即使有多个根节点，ID 也不会冲突
```

## 并发渲染原理

React 18 引入了并发渲染（Concurrent Rendering），这是一个重大的架构变更。理解并发渲染对于正确使用 React 18 的新特性非常重要。

### 什么是并发渲染

```tsx
// 并发渲染允许 React 中断和恢复渲染工作
// 使 React 能够：
// 1. 优先处理更重要的更新
// 2. 保持界面响应
// 3. 在后台准备新内容

// 示例：并发渲染的优势
function ConcurrentExample() {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    setQuery(value)  // 紧急更新：立即更新输入框

    startTransition(() => {
      // 非紧急更新：可以中断，不阻塞输入
      setSearchResults(performSearch(value))
    })
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {isPending ? <Spinner /> : <Results />}
    </div>
  )
}
```

### 并发渲染 vs 旧版渲染

```tsx
// 旧版 React（同步渲染）
function LegacyRendering() {
  const [state, setState] = useState('')

  const handleClick = () => {
    setState('new value')

    // 渲染过程：
    // 1. 开始渲染
    // 2. 不可中断
    // 3. 完成渲染
    // 4. 浏览器绘制

    // 在渲染完成前，用户无法交互
  }

  return <button onClick={handleClick}>点击</button>
}

// React 18（并发渲染）
function ConcurrentRendering() {
  const [state, setState] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    setState('new value')  // 紧急：立即渲染

    startTransition(() => {
      setAnotherState('another value')  // 非紧急：可中断
    })

    // 渲染过程：
    // 1. 开始渲染紧急更新
    // 2. 完成紧急更新
    // 3. 用户可以交互
    // 4. 在空闲时间处理非紧急更新
  }

  return (
    <div>
      <button onClick={handleClick}>点击</button>
      {isPending && <div>加载中...</div>}
    </div>
  )
}
```

### 并发特性详解

```tsx
// 1. 时间切片（Time Slicing）
function TimeSlicingExample() {
  const [items, setItems] = useState([])

  const handleLoad = () => {
    startTransition(() => {
      // React 会将大任务分解为小任务
      // 每个小任务执行后让出主线程
      // 允许浏览器处理用户交互
      const newItems = largeComputation() // 可能被中断
      setItems(newItems)
    })
  }

  return (
    <div>
      <button onClick={handleLoad}>加载数据</button>
      <List items={items} />
    </div>
  )
}

// 2. 优先级调度
function PriorityScheduling() {
  const [text, setText] = useState('')
  const [results, setResults] = useState([])

  const handleChange = (value: string) => {
    // 高优先级：用户输入
    setText(value)

    // 低优先级：搜索结果
    startTransition(() => {
      setResults(search(value))
    })
  }

  return (
    <div>
      <input value={text} onChange={(e) => handleChange(e.target.value)} />
      <Results items={results} />
    </div>
  )
}

// 3. 可中断渲染
function InterruptibleRendering() {
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  const loadNextPage = () => {
    startTransition(() => {
      // 如果用户点击了其他地方，
      // 这个渲染可以被中断
      setPage(p => p + 1)
    })
  }

  return (
    <div>
      <button onClick={loadNextPage}>下一页</button>
      {isPending ? <Spinner /> : <Content page={page} />}
    </div>
  )
}
```

## 实战案例：可访问的表单组件

让我们创建一个完整的应用，展示 useId 和并发渲染的实际应用。

```tsx
import { useState, useId, useTransition, useMemo } from 'react'

// ==================== 类型定义 ====================
interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea'
  placeholder?: string
  required: boolean
  autoComplete?: string
}

interface FormErrors {
  [key: string]: string
}

interface ValidationResult {
  isValid: boolean
  errors: FormErrors
}

// ==================== 验证函数 ====================
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: '密码至少8位' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含大写字母' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码必须包含小写字母' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码必须包含数字' }
  }
  return { valid: true }
}

// ==================== 可访问的输入组件 ====================
interface AccessibleInputProps {
  label: string
  type: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  autoComplete?: string
  disabled?: boolean
  description?: string
}

function AccessibleInput({
  label,
  type,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  autoComplete,
  disabled = false,
  description
}: AccessibleInputProps) {
  const inputId = useId()
  const errorId = useId()
  const descriptionId = useId()

  const hasError = Boolean(error)
  const hasDescription = Boolean(description)

  return (
    <div className="form-field">
      <label
        htmlFor={inputId}
        className="form-label"
      >
        {label}
        {required && <span className="required-mark" aria-label="必填">*</span>}
      </label>

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? errorId : hasDescription ? descriptionId : undefined
        }
        aria-required={required}
        className="form-input"
      />

      {description && !hasError && (
        <span id={descriptionId} className="form-description">
          {description}
        </span>
      )}

      {hasError && (
        <span id={errorId} className="form-error" role="alert" aria-live="polite">
          {error}
        </span>
      )}
    </div>
  )
}

// ==================== 可访问的复选框组件 ====================
interface AccessibleCheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
  disabled?: boolean
}

function AccessibleCheckbox({
  label,
  checked,
  onChange,
  description,
  disabled = false
}: AccessibleCheckboxProps) {
  const checkboxId = useId()
  const descriptionId = useId()

  return (
    <div className="checkbox-field">
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
        className="checkbox-input"
      />

      <label htmlFor={checkboxId} className="checkbox-label">
        <span className="checkbox-text">{label}</span>
      </label>

      {description && (
        <span id={descriptionId} className="checkbox-description">
          {description}
        </span>
      )}
    </div>
  )
}

// ==================== 密码强度指示器 ====================
interface PasswordStrengthProps {
  password: string
}

function PasswordStrength({ password }: PasswordStrengthProps) {
  const strengthId = useId()

  const strength = useMemo(() => {
    if (!password) return { level: 0, text: '', color: '' }

    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return { level: 1, text: '弱', color: '#f44336' }
    if (score <= 4) return { level: 2, text: '中', color: '#ff9800' }
    return { level: 3, text: '强', color: '#4caf50' }
  }, [password])

  if (!password) return null

  return (
    <div
      id={strengthId}
      className="password-strength"
      role="status"
      aria-live="polite"
    >
      <div className="strength-bar">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`strength-segment ${level <= strength.level ? 'active' : ''}`}
            style={{
              backgroundColor: level <= strength.level ? strength.color : '#e0e0e0'
            }}
          />
        ))}
      </div>
      <span className="strength-text" style={{ color: strength.color }}>
        密码强度：{strength.text}
      </span>
    </div>
  )
}

// ==================== 注册表单组件 ====================
function RegistrationForm() {
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    newsletter: false
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const validateForm = (): ValidationResult => {
    const newErrors: FormErrors = {}

    if (!formData.username) {
      newErrors.username = '用户名不能为空'
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符'
    }

    if (!formData.email) {
      newErrors.email = '邮箱不能为空'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    if (!formData.password) {
      newErrors.password = '密码不能为空'
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message!
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码不一致'
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = '必须同意服务条款'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // 实时验证（使用并发渲染）
    if (touched.has(field)) {
      startTransition(() => {
        const { errors: newErrors } = validateForm()
        setErrors(newErrors)
      })
    }
  }

  const handleFieldBlur = (field: string) => {
    setTouched(prev => new Set(prev).add(field))

    startTransition(() => {
      const { errors: newErrors } = validateForm()
      setErrors(newErrors)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 标记所有字段为已触摸
    const allFields = new Set(Object.keys(formData))
    setTouched(allFields)

    const validation = validateForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    // 模拟异步提交
    startTransition(async () => {
      try {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 2000))

        setSubmitStatus('success')

        // 重置表单
        setTimeout(() => {
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            acceptTerms: false,
            newsletter: false
          })
          setErrors({})
          setTouched(new Set())
          setSubmitStatus('idle')
        }, 3000)
      } catch (error) {
        setSubmitStatus('error')
      }
    })
  }

  return (
    <div className="registration-container">
      <div className="form-wrapper">
        <header className="form-header">
          <h1>创建账户</h1>
          <p>加入我们，开启您的旅程</p>
        </header>

        {submitStatus === 'success' && (
          <div className="success-banner" role="alert">
            ✅ 注册成功！欢迎加入我们！
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="error-banner" role="alert">
            ❌ 注册失败，请稍后重试
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form" noValidate>
          {/* 用户名 */}
          <AccessibleInput
            label="用户名"
            type="text"
            value={formData.username}
            onChange={(value) => handleFieldChange('username', value)}
            onBlur={() => handleFieldBlur('username')}
            error={touched.has('username') ? errors.username : undefined}
            placeholder="选择一个用户名"
            required
            autoComplete="username"
            description="3-20个字符，只能包含字母、数字和下划线"
          />

          {/* 邮箱 */}
          <AccessibleInput
            label="邮箱地址"
            type="email"
            value={formData.email}
            onChange={(value) => handleFieldChange('email', value)}
            onBlur={() => handleFieldBlur('email')}
            error={touched.has('email') ? errors.email : undefined}
            placeholder="your@email.com"
            required
            autoComplete="email"
          />

          {/* 密码 */}
          <div className="password-field">
            <AccessibleInput
              label="密码"
              type="password"
              value={formData.password}
              onChange={(value) => handleFieldChange('password', value)}
              onBlur={() => handleFieldBlur('password')}
              error={touched.has('password') ? errors.password : undefined}
              placeholder="至少8位，包含大小写字母和数字"
              required
              autoComplete="new-password"
            />

            {formData.password && (
              <PasswordStrength password={formData.password} />
            )}
          </div>

          {/* 确认密码 */}
          <AccessibleInput
            label="确认密码"
            type="password"
            value={formData.confirmPassword}
            onChange={(value) => handleFieldChange('confirmPassword', value)}
            onBlur={() => handleFieldBlur('confirmPassword')}
            error={touched.has('confirmPassword') ? errors.confirmPassword : undefined}
            placeholder="再次输入密码"
            required
            autoComplete="new-password"
          />

          {/* 服务条款 */}
          <AccessibleCheckbox
            label="我已阅读并同意服务条款和隐私政策"
            checked={formData.acceptTerms}
            onChange={(checked) => handleFieldChange('acceptTerms', checked)}
            description="您必须同意服务条款才能继续"
          />

          {touched.has('acceptTerms') && errors.acceptTerms && (
            <span className="form-error" role="alert">
              {errors.acceptTerms}
            </span>
          )}

          {/* 订阅新闻 */}
          <AccessibleCheckbox
            label="订阅我们的新闻通讯"
            checked={formData.newsletter}
            onChange={(checked) => handleFieldChange('newsletter', checked)}
            description="获取最新产品和活动信息"
          />

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isPending}
            className="submit-button"
          >
            {isPending ? '注册中...' : '创建账户'}
          </button>

          <p className="form-footer">
            已有账户？ <a href="/login">立即登录</a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegistrationForm
```

**配套样式：**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.registration-container {
  width: 100%;
  max-width: 500px;
}

.form-wrapper {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* 表单头部 */
.form-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 30px;
  text-align: center;
}

.form-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.form-header p {
  font-size: 16px;
  opacity: 0.9;
}

/* 成功/错误横幅 */
.success-banner,
.error-banner {
  padding: 15px;
  text-align: center;
  font-weight: 600;
}

.success-banner {
  background: #e8f5e9;
  color: #4caf50;
}

.error-banner {
  background: #ffebee;
  color: #f44336;
}

/* 表单 */
.registration-form {
  padding: 30px;
}

/* 表单字段 */
.form-field {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 14px;
}

.required-mark {
  color: #f44336;
  margin-left: 4px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-input.error {
  border-color: #f44336;
}

.form-description {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: #666;
}

.form-error {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: #f44336;
  font-weight: 500;
}

/* 复选框 */
.checkbox-field {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-input {
  display: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: #f5f5f5;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-label {
  background: #f0f4ff;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-label::before {
  content: '✓';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #667eea;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.checkbox-text {
  font-size: 14px;
  color: #333;
}

.checkbox-description {
  font-size: 13px;
  color: #666;
  margin-left: 30px;
}

/* 密码强度 */
.password-field {
  margin-bottom: 24px;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}

.strength-segment {
  flex: 1;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  transition: all 0.3s;
}

.strength-segment.active {
  transform: scaleY(1.5);
}

.strength-text {
  font-size: 13px;
  font-weight: 600;
}

/* 提交按钮 */
.submit-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 表单底部 */
.form-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.form-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.form-footer a:hover {
  text-decoration: underline;
}

/* 屏幕阅读器专用 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* 响应式 */
@media (max-width: 600px) {
  .form-wrapper {
    border-radius: 0;
  }

  .form-header {
    padding: 30px 20px;
  }

  .registration-form {
    padding: 20px;
  }
}
```

## 并发渲染最佳实践

### 1. 正确使用 useId

```tsx
// ✅ 好的实践
function GoodUseId() {
  const id = useId()
  const labelId = `${id}-label`
  const errorId = `${id}-error`

  return (
    <div>
      <label id={labelId} htmlFor={id}>
        输入框
      </label>
      <input
        id={id}
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <span id={errorId}>{error}</span>}
    </div>
  )
}
```

### 2. 使用并发特性优化性能

```tsx
// ✅ 使用 startTransition 优化用户体验
function OptimizedSearch() {
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')

  const handleChange = (value: string) => {
    setQuery(value)  // 立即更新
    startTransition(() => {
      setSearchResults(expensiveSearch(value))  // 延迟更新
    })
  }

  return (
    <div>
      <input value={query} onChange={(e) => handleChange(e.target.value)} />
      {isPending ? <Spinner /> : <Results />}
    </div>
  )
}
```

## 总结

本章我们学习了：

✅ useId 的基本用法和应用场景
✅ 服务端渲染中的 ID 一致性问题
✅ 并发渲染的原理和特性
✅ 并发渲染 vs 旧版渲染的区别
✅ 实战案例：可访问的表单组件
✅ 表单验证与并发渲染的结合
✅ 密码强度指示器组件
✅ 完整的注册表单实现

**useId 的优势：**

| 特性 | Math.random() | 计数器 | useId |
|------|--------------|--------|-------|
| SSR 兼容 | ❌ | ❌ | ✅ |
| 唯一性 | ❌ | ❌ | ✅ |
| 并发安全 | ❌ | ❌ | ✅ |
| 确定性 | ❌ | ❌ | ✅ |

**并发渲染的优势：**

| 特性 | 同步渲染 | 并发渲染 |
|------|---------|---------|
| 用户响应性 | ⭐⭐ 可能卡顿 | ⭐⭐⭐⭐⭐ 流畅 |
| 优先级调度 | ❌ | ✅ |
| 可中断渲染 | ❌ | ✅ |
| 时间切片 | ❌ | ✅ |

**下一步：** 第72章将学习 React Server Components，掌握 React 18 的革命性特性。
