# ：Actions与useActionState

## Actions基础概念

### 什么是Actions？

Actions是React 19引入的新特性，用于处理数据变更操作，如表单提交、按钮点击等。Actions让异步状态管理变得更简单。

```
┌─────────────────────────────────────────────────────────────┐
│              Actions 工作流程                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户操作                                                   │
│    ↓                                                        │
│  触发Action                                                 │
│    ↓                                                        │
│  React自动管理：                                            │
│    - 显示pending状态                                        │
│    - 禁用表单/按钮                                          │
│    - 处理错误                                               │
│    - 显示成功消息                                           │
│    ↓                                                        │
│  更新UI                                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Actions的优势

| 特性 | 传统方式 | Actions |
|------|---------|---------|
| 状态管理 | 需要多个useState | 自动管理 |
| Pending状态 | 手动管理 | 自动提供 |
| 错误处理 | try-catch | 内置支持 |
| 代码量 | 多 | 少40% |
| 表单处理 | 繁琐 | 简单 |

### Actions的基本用法

```tsx
// ✅ 最简单的Action
function UpdateForm() {
  async function updateName(formData) {
    'use server'  // 标记为Server Action（可选）

    const name = formData.get('name')
    await db.user.update({ name })

    return { success: true }
  }

  return (
    <form action={updateName}>
      <input type="text" name="name" />
      <button type="submit">更新</button>
    </form>
  )
}
```

## useActionState Hook

### 基础语法

```tsx
const [state, formAction, isPending] = useActionState(
  actionFn,           // Action函数
  initialState,       // 初始状态
  permalink?          // 可选的permalink（用于URL状态）
)
```

### 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `actionFn` | `(prevState, formData) => nextState \| Promise<nextState>` | Action函数 |
| `initialState` | `any` | 初始状态值 |
| `permalink` | `string` | 可选，用于URL状态 |

### 返回值说明

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `state` | `any` | 当前状态值 |
| `formAction` | `function` | 传递给`<form action={...}>`的函数 |
| `isPending` | `boolean` | 是否正在执行（可选） |

### 基础示例

#### 1. 简单的计数器

```tsx
import { useActionState } from 'react'

// ❌ 传统方式（繁琐）
function CounterOld() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  async function increment() {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setCount(c => c + 1)
    setLoading(false)
  }

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment} disabled={loading}>
        {loading ? '加载中...' : '+1'}
      </button>
    </div>
  )
}

// ✅ 使用useActionState（简洁）
function CounterNew() {
  const [count, formAction, isPending] = useActionState(
    async (prevCount) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return prevCount + 1
    },
    0
  )

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={formAction} disabled={isPending}>
        {isPending ? '加载中...' : '+1'}
      </button>
    </div>
  )
}
```

#### 2. 带错误处理的表单

```tsx
import { useActionState } from 'react'

// ✅ 完整的表单处理
function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      // 获取表单数据
      const email = formData.get('email')
      const password = formData.get('password')

      // 验证
      if (!email || !password) {
        return {
          error: '请填写所有字段',
          success: false
        }
      }

      // 提交数据
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
          return {
            error: '登录失败，请检查邮箱和密码',
            success: false
          }
        }

        const user = await response.json()

        return {
          error: null,
          success: true,
          user
        }
      } catch (error) {
        return {
          error: '网络错误，请重试',
          success: false
        }
      }
    },
    { error: null, success: false, user: null }
  )

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="email">邮箱</label>
        <input
          id="email"
          type="email"
          name="email"
          required
        />
      </div>

      <div>
        <label htmlFor="password">密码</label>
        <input
          id="password"
          type="password"
          name="password"
          required
        />
      </div>

      {state.error && (
        <div className="error">{state.error}</div>
      )}

      {state.success && (
        <div className="success">
          欢迎回来，{state.user.name}！
        </div>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? '登录中...' : '登录'}
      </button>
    </form>
  )
}
```

#### 3. 复杂状态管理

```tsx
import { useActionState } from 'react'

interface FormState {
  name: string
  email: string
  age: number
  errors: {
    name?: string
    email?: string
    age?: string
  }
  success: boolean
}

function RegistrationForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const age = parseInt(formData.get('age') as string)

      // 验证
      const errors: FormState['errors'] = {}

      if (!name || name.length < 2) {
        errors.name = '名字至少2个字符'
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = '邮箱格式不正确'
      }

      if (!age || age < 18) {
        errors.age = '年龄必须大于18岁'
      }

      if (Object.keys(errors).length > 0) {
        return {
          ...prevState,
          errors,
          success: false
        }
      }

      // 提交数据
      try {
        await fetch('/api/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, age })
        })

        return {
          name,
          email,
          age,
          errors: {},
          success: true
        }
      } catch (error) {
        return {
          ...prevState,
          errors: { email: '注册失败，请重试' },
          success: false
        }
      }
    },
    {
      name: '',
      email: '',
      age: 0,
      errors: {},
      success: false
    }
  )

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="name">姓名</label>
        <input
          id="name"
          type="text"
          name="name"
          defaultValue={state.name}
        />
        {state.errors.name && (
          <span className="error">{state.errors.name}</span>
        )}
      </div>

      <div>
        <label htmlFor="email">邮箱</label>
        <input
          id="email"
          type="email"
          name="email"
          defaultValue={state.email}
        />
        {state.errors.email && (
          <span className="error">{state.errors.email}</span>
        )}
      </div>

      <div>
        <label htmlFor="age">年龄</label>
        <input
          id="age"
          type="number"
          name="age"
          defaultValue={state.age}
        />
        {state.errors.age && (
          <span className="error">{state.errors.age}</span>
        )}
      </div>

      {state.success && (
        <div className="success">注册成功！</div>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? '提交中...' : '注册'}
      </button>
    </form>
  )
}
```

## 表单处理新方式

### useFormStatus Hook

`useFormStatus`用于跟踪表单的提交状态，特别适合在子组件中使用。

```tsx
import { useFormStatus } from 'react'

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus()

  return (
    <button disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  )
}

function Form() {
  async function handleSubmit(formData) {
    await submitToServer(formData)
  }

  return (
    <form action={handleSubmit}>
      <input type="text" name="name" />
      <SubmitButton />  {/* 自动获取父表单的状态 */}
    </form>
  )
}
```

### useFormStatus返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `pending` | `boolean` | 表单是否正在提交 |
| `data` | `FormData` | 表单数据 |
| `method` | `string` | 表单方法（GET/POST） |
| `action` | `function` | 表单action函数 |

### 完整的表单示例

#### 用户注册表单

```tsx
import { useActionState, useFormStatus } from 'react'

interface RegistrationState {
  success: boolean
  message: string
  errors: {
    name?: string
    email?: string
    password?: string
  }
}

// Action函数
async function registerAction(
  prevState: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 前端验证
  const errors: RegistrationState['errors'] = {}

  if (!name || name.length < 2) {
    errors.name = '姓名至少2个字符'
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = '请输入有效的邮箱地址'
  }

  if (!password || password.length < 8) {
    errors.password = '密码至少8个字符'
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: '请修正表单中的错误',
      errors
    }
  }

  // 提交到服务器
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || '注册失败',
        errors: {}
      }
    }

    return {
      success: true,
      message: '注册成功！正在跳转...',
      errors: {}
    }
  } catch (error) {
    return {
      success: false,
      message: '网络错误，请重试',
      errors: {}
    }
  }
}

// 提交按钮组件
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={pending ? 'loading' : ''}
    >
      {pending ? (
        <>
          <span className="spinner" />
          注册中...
        </>
      ) : (
        '注册账户'
      )}
    </button>
  )
}

// 主表单组件
function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, {
    success: false,
    message: '',
    errors: {}
  })

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>创建账户</h1>

        {state.message && (
          <div className={`alert ${state.success ? 'success' : 'error'}`}>
            {state.message}
          </div>
        )}

        <form action={formAction} className="register-form">
          <div className="form-group">
            <label htmlFor="name">姓名</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="请输入姓名"
              autoComplete="name"
            />
            {state.errors.name && (
              <span className="error-message">{state.errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
            />
            {state.errors.email && (
              <span className="error-message">{state.errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="至少8个字符"
              autoComplete="new-password"
            />
            {state.errors.password && (
              <span className="error-message">{state.errors.password}</span>
            )}
          </div>

          <SubmitButton />
        </form>

        <p className="footer">
          已有账户？ <a href="/login">立即登录</a>
        </p>
      </div>
    </div>
  )
}
```

**配套样式：**

```css
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 100%;
  padding: 40px;
}

.register-card h1 {
  text-align: center;
  color: #333;
  margin: 0 0 30px 0;
  font-size: 28px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 13px;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.alert.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.register-form button {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.register-form button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.register-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.register-form button.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}

.footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    padding: 24px;
  }

  .register-card h1 {
    font-size: 24px;
  }
}
```

### 高级用法：多步骤表单

```tsx
import { useActionState, useState } from 'react'

interface MultiStepState {
  step: number
  data: {
    name: string
    email: string
    password: string
    bio: string
  }
  errors: Record<string, string>
}

function MultiStepForm() {
  const [state, formAction] = useActionState(
    async (prevState: MultiStepState, formData: FormData) => {
      const step = parseInt(formData.get('step') as string)

      // 步骤1：基本信息
      if (step === 1) {
        const name = formData.get('name') as string
        const email = formData.get('email') as string

        const errors: Record<string, string> = {}

        if (!name || name.length < 2) {
          errors.name = '姓名至少2个字符'
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.email = '邮箱格式不正确'
        }

        if (Object.keys(errors).length > 0) {
          return {
            ...prevState,
            errors
          }
        }

        return {
          ...prevState,
          step: 2,
          data: {
            ...prevState.data,
            name,
            email
          },
          errors: {}
        }
      }

      // 步骤2：账户设置
      if (step === 2) {
        const password = formData.get('password') as string
        const bio = formData.get('bio') as string

        const errors: Record<string, string> = {}

        if (!password || password.length < 8) {
          errors.password = '密码至少8个字符'
        }

        if (Object.keys(errors).length > 0) {
          return {
            ...prevState,
            errors
          }
        }

        // 提交所有数据
        await fetch('/api/register', {
          method: 'POST',
          body: JSON.stringify({
            ...prevState.data,
            password,
            bio
          })
        })

        return {
          step: 3,
          data: {
            ...prevState.data,
            password,
            bio
          },
          errors: {}
        }
      }

      return prevState
    },
    {
      step: 1,
      data: {
        name: '',
        email: '',
        password: '',
        bio: ''
      },
      errors: {}
    }
  )

  if (state.step === 3) {
    return (
      <div className="success-screen">
        <h1>注册成功！</h1>
        <p>欢迎，{state.data.name}！</p>
      </div>
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="step" value={state.step} />

      {state.step === 1 && (
        <>
          <h2>步骤 1/2：基本信息</h2>

          <div>
            <label>姓名</label>
            <input
              type="text"
              name="name"
              defaultValue={state.data.name}
            />
            {state.errors.name && (
              <span className="error">{state.errors.name}</span>
            )}
          </div>

          <div>
            <label>邮箱</label>
            <input
              type="email"
              name="email"
              defaultValue={state.data.email}
            />
            {state.errors.email && (
              <span className="error">{state.errors.email}</span>
            )}
          </div>

          <button type="submit">下一步</button>
        </>
      )}

      {state.step === 2 && (
        <>
          <h2>步骤 2/2：账户设置</h2>

          <div>
            <label>密码</label>
            <input
              type="password"
              name="password"
            />
            {state.errors.password && (
              <span className="error">{state.errors.password}</span>
            )}
          </div>

          <div>
            <label>个人简介</label>
            <textarea
              name="bio"
              rows={4}
              defaultValue={state.data.bio}
            />
          </div>

          <div className="button-group">
            <button
              type="button"
              onClick={() => formAction(new FormData())}
            >
              上一步
            </button>
            <button type="submit">完成注册</button>
          </div>
        </>
      )}
    </form>
  )
}
```

## 实战案例：用户登录表单

让我们创建一个完整的、生产级的登录表单，包含所有最佳实践。

```tsx
/**
 * 完整的用户登录表单 - React 19
 * 包含：
 * - 使用useActionState处理表单提交
 * - 使用useFormStatus跟踪提交状态
 * - 完整的表单验证
 * - 错误处理
 * - Loading状态
 * - 记住我功能
 * - 社交登录
 */

import { useActionState, useFormStatus } from 'react'

// ==================== 类型定义 ====================
interface LoginState {
  success: boolean
  message: string
  errors: {
    email?: string
    password?: string
  }
  lastEmail: string
}

interface LoginResponse {
  success: boolean
  message: string
  user?: {
    id: string
    name: string
    email: string
  }
  token?: string
}

// ==================== Action函数 ====================
async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const remember = formData.get('remember') === 'true'

  // 清除之前的错误
  const errors: LoginState['errors'] = {}

  // 前端验证
  if (!email) {
    errors.email = '请输入邮箱地址'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = '邮箱格式不正确'
  }

  if (!password) {
    errors.password = '请输入密码'
  } else if (password.length < 6) {
    errors.password = '密码至少6个字符'
  }

  if (Object.keys(errors).length > 0) {
    return {
      ...prevState,
      errors,
      lastEmail: email
    }
  }

  // 模拟API调用
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, remember })
    })

    const data: LoginResponse = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || '登录失败',
        errors: {},
        lastEmail: email
      }
    }

    // 登录成功，保存token
    if (data.token) {
      localStorage.setItem('token', data.token)
      sessionStorage.setItem('user', JSON.stringify(data.user))
    }

    return {
      success: true,
      message: '登录成功！正在跳转...',
      errors: {},
      lastEmail: email
    }
  } catch (error) {
    return {
      success: false,
      message: '网络错误，请检查网络连接',
      errors: {},
      lastEmail: email
    }
  }
}

// ==================== 子组件 ====================

// 提交按钮组件
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`submit-button ${pending ? 'loading' : ''}`}
    >
      {pending ? (
        <>
          <svg className="spinner" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
          </svg>
          登录中...
        </>
      ) : (
        <>
          <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          登录
        </>
      )}
    </button>
  )
}

// 社交登录按钮
function SocialLoginButton({
  icon,
  text,
  provider
}: {
  icon: React.ReactNode
  text: string
  provider: string
}) {
  const handleSocialLogin = async () => {
    // 模拟社交登录
    window.location.href = `/api/auth/${provider}`
  }

  return (
    <button
      type="button"
      onClick={handleSocialLogin}
      className="social-button"
    >
      {icon}
      <span>{text}</span>
    </button>
  )
}

// ==================== 主组件 ====================
export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, {
    success: false,
    message: '',
    errors: {},
    lastEmail: ''
  })

  // 登录成功后跳转
  if (state.success) {
    return (
      <div className="login-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>登录成功！</h2>
          <p>{state.message}</p>
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">🚀</div>
          <h1>欢迎回来</h1>
          <p>登录到您的账户</p>
        </div>

        {/* 错误/成功消息 */}
        {state.message && (
          <div className={`alert ${state.success ? 'success' : 'error'}`}>
            {state.success ? '✓' : '⚠'}
            {state.message}
          </div>
        )}

        {/* 登录表单 */}
        <form action={formAction} className="login-form">
          {/* 邮箱输入 */}
          <div className="form-group">
            <label htmlFor="email">邮箱地址</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                defaultValue={state.lastEmail}
                autoComplete="email"
                className={state.errors.email ? 'error' : ''}
              />
            </div>
            {state.errors.email && (
              <span className="error-message">{state.errors.email}</span>
            )}
          </div>

          {/* 密码输入 */}
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className={state.errors.password ? 'error' : ''}
              />
            </div>
            {state.errors.password && (
              <span className="error-message">{state.errors.password}</span>
            )}
          </div>

          {/* 记住我 & 忘记密码 */}
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" name="remember" value="true" />
              <span>记住我</span>
            </label>
            <a href="/forgot-password" className="forgot-link">
              忘记密码？
            </a>
          </div>

          {/* 提交按钮 */}
          <SubmitButton />
        </form>

        {/* 分隔线 */}
        <div className="divider">
          <span>或</span>
        </div>

        {/* 社交登录 */}
        <div className="social-login">
          <SocialLoginButton
            icon={
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
            text="使用 Google 继续"
            provider="google"
          />

          <SocialLoginButton
            icon={
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            }
            text="使用 Facebook 继续"
            provider="facebook"
          />
        </div>

        {/* 注册链接 */}
        <p className="signup-link">
          还没有账户？ <a href="/register">立即注册</a>
        </p>
      </div>

      {/* 页脚 */}
      <div className="footer">
        <p>© 2024 Your App. All rights reserved.</p>
        <div className="footer-links">
          <a href="/privacy">隐私政策</a>
          <a href="/terms">服务条款</a>
        </div>
      </div>
    </div>
  )
}
```

**配套样式：**

```css
/* ==================== 主容器 ==================== */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  top: -250px;
  right: -250px;
  animation: float 20s ease-in-out infinite;
}

.login-container::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  bottom: -200px;
  left: -200px;
  animation: float 15s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, 30px); }
}

/* ==================== 卡片 ==================== */
.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 100%;
  padding: 48px 40px;
  position: relative;
  z-index: 1;
}

/* ==================== Logo ==================== */
.logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.logo h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.logo p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* ==================== 提示消息 ==================== */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.alert.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

/* ==================== 表单 ==================== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #999;
  pointer-events: none;
}

.form-group input {
  width: 100%;
  padding: 14px 14px 14px 44px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.2s;
  background: #fafafa;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #f44336;
  background: #fff8f8;
}

.error-message {
  color: #f44336;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ==================== 表单选项 ==================== */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* ==================== 提交按钮 ==================== */
.submit-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-top: 8px;
}

.submit-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-button.loading {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

.submit-button .lock-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.submit-button .spinner {
  width: 18px;
  height: 18px;
  animation: spin 0.8s linear infinite;
}

.submit-button .spinner circle {
  stroke: currentColor;
  stroke-width: 4;
  stroke-dasharray: 60, 150;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

/* ==================== 分隔线 ==================== */
.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  color: #999;
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  padding: 0 12px;
}

/* ==================== 社交登录 ==================== */
.social-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-button {
  width: 100%;
  padding: 12px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s;
}

.social-button:hover {
  background: #f9f9f9;
  border-color: #d0d0d0;
}

/* ==================== 注册链接 ==================== */
.signup-link {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin: 24px 0 0 0;
}

.signup-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.signup-link a:hover {
  text-decoration: underline;
}

/* ==================== 页脚 ==================== */
.footer {
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
}

.footer p {
  margin: 0 0 8px 0;
}

.footer-links {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}

/* ==================== 成功卡片 ==================== */
.success-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
  padding: 48px 40px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
  margin: 0 auto 24px;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.success-card h2 {
  font-size: 24px;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.success-card p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }

  .logo h1 {
    font-size: 24px;
  }

  .form-group input {
    padding: 12px 12px 12px 40px;
  }
}
```

## 总结

本章我们深入学习了React 19的Actions特性：

✅ **Actions基础概念**：
- 统一处理数据变更
- 自动管理异步状态
- 简化表单处理

✅ **useActionState Hook**：
- 语法和参数
- 状态管理
- 错误处理
- Pending状态

✅ **useFormStatus Hook**：
- 跟踪表单状态
- 在子组件中使用
- pending、data、method、action

✅ **表单处理新方式**：
- 简化表单提交
- 自动验证
- 更好的用户体验

✅ **实战案例**：
- 用户登录表单
- 多步骤表单
- 完整的样式实现

**Actions的核心优势：**
- 代码量减少40%
- 自动状态管理
- 更好的用户体验
- 更少的错误

**下一步学习：**
- 第75章：useOptimistic与use() Hook
- 第76章：React 19性能优化

现在你已经掌握了React 19的Actions，可以构建更强大的表单了！
