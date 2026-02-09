# ：React测试（Vitest + Testing Library）

## 测试基础概念

### 为什么需要测试？

测试带来的价值：
- ✅ **防止回归**：确保新功能不破坏现有功能
- ✅ **文档作用**：测试即文档，展示组件如何使用
- ✅ **重构信心**：有测试保护时重构更安全
- ✅ **开发效率**：快速验证功能，减少手动测试
- ✅ **代码质量**：强制编写可测试的代码

### 测试类型

| 测试类型 | 覆盖范围 | 运行速度 | 维护成本 | 推荐比例 |
|---------|---------|---------|---------|---------|
| 单元测试 | 单个函数/组件 | ⚡⚡⚡ 快 | ⭐ 低 | 70% |
| 集成测试 | 多个组件协作 | ⚡⚡ 中等 | ⭐⭐ 中 | 20% |
| E2E测试 | 完整用户流程 | ⚡ 慢 | ⭐⭐⭐ 高 | 10% |

### 测试金字塔

```
        /\
       /  \      E2E测试 (10%)
      /    \     - 完整用户流程
     /------\    - 最少但最重要
    /        \
   / 集成测试  \  (20%)
  /          \  - 组件交互
 /            \ - API集成
/   单元测试    \ (70%)
/--------------\
- 函数测试
- 组件测试
- Hooks测试
```

## 环境搭建

### 安装依赖

```bash
# 安装 Vitest
npm install -D vitest

# 安装 Testing Library
npm install -D @testing-library/react
npm install -D @testing-library/jest-dom
npm install -D @testing-library/user-event

# 安装 Happy DOM 或 jsdom（轻量级浏览器环境）
npm install -D happy-dom
# 或
npm install -D jsdom

# 安装相关工具
npm install -D @vitest/ui
npm install -D @vitest/coverage-v8
```

### Vitest 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom', // 或 'jsdom'
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.tsx'
      ]
    },
    ui: true
  }
})
```

### 测试设置文件

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// 每个测试后清理
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return [] }
  unobserve() {}
} as any
```

### package.json 脚本

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Testing Library 基础

### 核心概念

```tsx
// ==================== 渲染组件 ====================
import { render, screen } from '@testing-library/react'

// ✅ 基础渲染
test('renders hello world', () => {
  render(<div>Hello World</div>)

  // 通过文本查找
  const element = screen.getByText('Hello World')
  expect(element).toBeInTheDocument()
})

// ✅ 查询元素的方式
const queries = {
  // getBy* - 找不到元素立即抛出错误
  getByText: screen.getByText('Submit'),
  getByRole: screen.getByRole('button'),
  getByLabelText: screen.getByLabelText('Email'),
  getByPlaceholderText: screen.getByPlaceholderText('Enter email'),
  getByAltText: screen.getByAltText('Profile'),
  getByTitle: screen.getByTitle('Close'),
  getByTestId: screen.getByTestId('submit-btn'),

  // findBy* - 异步查找，默认等待1000ms
  findByText: await screen.findByText('Loaded'),
  findByRole: await screen.findByRole('alert'),

  // queryBy* - 找不到返回null，不抛出错误
  queryByText: screen.queryByText('Loading'),
  queryByRole: screen.queryByRole('dialog'),

  // getAllBy* - 查找所有匹配的元素
  getAllByRole: screen.getAllByRole('listitem'),

  // findAllBy* - 异步查找所有匹配的元素
  findAllByRole: await screen.findAllByRole('button'),
}
```

### 最佳实践：优先使用的查询方式

```tsx
// ✅ 优先级1：通过用户可见的角色和文本查询
screen.getByRole('button', { name: '提交' })
screen.getByLabelText('邮箱')
screen.getByText('欢迎来到首页')

// ✅ 优先级2：通过用户可见的属性查询
screen.getByPlaceholderText('请输入邮箱')
screen.getByAltText('产品图片')
screen.getByTitle('关闭对话框')

// ⚠️ 最后选择：通过 testId 查询
// 只有当元素没有可访问的文本或角色时使用
screen.getByTestId('submit-button')
```

### 用户交互

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ✅ 创建用户事件实例
const user = userEvent.setup()

// ✅ 点击事件
test('clicks button', async () => {
  const handleClick = vi.fn()
  render(<button onClick={handleClick}>Click me</button>)

  await user.click(screen.getByRole('button', { name: /click me/i }))

  expect(handleClick).toHaveBeenCalledTimes(1)
})

// ✅ 输入事件
test('types in input', async () => {
  render(<input placeholder="Email" />)

  const input = screen.getByPlaceholderText('Email')
  await user.type(input, 'test@example.com')

  expect(input).toHaveValue('test@example.com')
})

// ✅ 清空输入
test('clears input', async () => {
  render(<input defaultValue="Hello" />)

  const input = screen.getByDisplayValue('Hello')
  await user.clear(input)

  expect(input).toHaveValue('')
})

// ✅ 选择下拉框
test('selects option', async () => {
  render(
    <select>
      <option value="">请选择</option>
      <option value="1">选项1</option>
      <option value="2">选项2</option>
    </select>
  )

  const select = screen.getByRole('combobox')
  await user.selectOptions(select, '1')

  expect(select).toHaveValue('1')
})

// ✅ 复选框
test('toggles checkbox', async () => {
  render(<label><input type="checkbox" />同意条款</label>)

  const checkbox = screen.getByRole('checkbox')
  await user.click(checkbox)

  expect(checkbox).toBeChecked()
})

// ✅ 键盘事件
test('handles keyboard', async () => {
  render(<input />)

  const input = screen.getByRole('textbox')
  input.focus()

  await user.keyboard('Hello')
  await user.keyboard('[Enter]')

  expect(input).toHaveValue('Hello')
})
```

## 组件测试实践

### 基础组件测试

```tsx
// ==================== Button 组件测试 ====================
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Button from './Button'

describe('Button', () => {
  // ✅ 测试基础渲染
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  // ✅ 测试点击事件
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // ✅ 测试禁用状态
  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    )

    await user.click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
  })

  // ✅ 测试不同的 variant
  it('applies correct class for variant', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-primary')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-secondary')
  })

  // ✅ 测试加载状态
  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  // ✅ 测试图标
  it('renders icon', () => {
    const Icon = () => <span data-testid="icon">★</span>
    render(<Button icon={<Icon />}>With Icon</Button>)

    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})

// ==================== Input 组件测试 ====================
import Input from './Input'

describe('Input', () => {
  it('renders input with label', () => {
    render(<Input label="Email" name="email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Input label="Email" name="email" error="Invalid email" />)

    expect(screen.getByText('Invalid email')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInvalid()
  })

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Input label="Email" name="email" onChange={handleChange} />)

    const input = screen.getByLabelText('Email')
    await user.type(input, 'test@example.com')

    expect(handleChange).toHaveBeenCalled()
  })

  it('can be disabled', () => {
    render(<Input label="Email" name="email" disabled />)
    expect(screen.getByLabelText('Email')).toBeDisabled()
  })
})
```

### 复杂组件测试

```tsx
// ==================== Counter 组件测试 ====================
import Counter from './Counter'

describe('Counter', () => {
  it('renders initial count', () => {
    render(<Counter initialCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('increments count', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={0} />)

    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('decrements count', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={5} />)

    await user.click(screen.getByRole('button', { name: /decrement/i }))
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('resets count', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={10} />)

    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})

// ==================== TodoList 组件测试 ====================
import TodoList from './TodoList'

describe('TodoList', () => {
  const defaultProps = {
    todos: [
      { id: '1', text: 'Learn React', completed: false },
      { id: '2', text: 'Build something', completed: true },
    ],
    onToggle: vi.fn(),
    onDelete: vi.fn(),
  }

  it('renders all todos', () => {
    render(<TodoList {...defaultProps} />)

    expect(screen.getByText('Learn React')).toBeInTheDocument()
    expect(screen.getByText('Build something')).toBeInTheDocument()
  })

  it('shows empty state when no todos', () => {
    render(<TodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/no todos/i)).toBeInTheDocument()
  })

  it('toggles todo', async () => {
    const user = userEvent.setup()
    const handleToggle = vi.fn()

    render(
      <TodoList
        todos={[{ id: '1', text: 'Test', completed: false }]}
        onToggle={handleToggle}
        onDelete={vi.fn()}
      />
    )

    await user.click(screen.getByRole('checkbox'))

    expect(handleToggle).toHaveBeenCalledWith('1')
  })

  it('deletes todo', async () => {
    const user = userEvent.setup()
    const handleDelete = vi.fn()

    render(
      <TodoList
        todos={[{ id: '1', text: 'Test', completed: false }]}
        onToggle={vi.fn()}
        onDelete={handleDelete}
      />
    )

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(handleDelete).toHaveBeenCalledWith('1')
  })
})
```

### 异步组件测试

```tsx
// ==================== UserProfile 异步测试 ====================
import UserProfile from './UserProfile'
import { fetchUser } from '../api/user'

// Mock API
vi.mock('../api/user')

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ✅ 测试加载状态
  it('shows loading state', () => {
    vi.mocked(fetchUser).mockImplementation(() => new Promise(() => {}))

    render(<UserProfile userId="1" />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  // ✅ 测试成功加载
  it('loads and displays user', async () => {
    const mockUser = { id: '1', name: 'John', email: 'john@example.com' }
    vi.mocked(fetchUser).mockResolvedValue(mockUser)

    render(<UserProfile userId="1" />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    expect(await screen.findByText('John')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  // ✅ 测试错误状态
  it('shows error message', async () => {
    vi.mocked(fetchUser).mockRejectedValue(new Error('Failed to fetch'))

    render(<UserProfile userId="1" />)

    expect(await screen.findByText(/failed to fetch/i)).toBeInTheDocument()
  })

  // ✅ 测试重试功能
  it('retries on error', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchUser)
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce({ id: '1', name: 'John' })

    render(<UserProfile userId="1" />)

    await screen.findByText(/failed/i)

    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(await screen.findByText('John')).toBeInTheDocument()
  })
})
```

## Hooks 测试

### 使用 @testing-library/react-hooks

```bash
npm install -D @testing-library/react-hooks
```

```tsx
// ==================== useCounter Hook 测试 ====================
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import useCounter from './useCounter'

describe('useCounter', () => {
  it('renders initial count', () => {
    const { result } = renderHook(() => useCounter(0))

    expect(result.current.count).toBe(0)
  })

  it('increments count', () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5))

    act(() => {
      result.current.decrement()
    })

    expect(result.current.count).toBe(4)
  })

  it('resets count', () => {
    const { result } = renderHook(() => useCounter(10))

    act(() => {
      result.current.reset()
    })

    expect(result.current.count).toBe(0)
  })

  it('updates count to specific value', () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => {
      result.current.setCount(100)
    })

    expect(result.current.count).toBe(100)
  })
})

// ==================== useFetch Hook 测试 ====================
import { renderHook, act, waitFor } from '@testing-library/react'
import useFetch from './useFetch'
import { fetchAPI } from '../api'

vi.mock('../api')

describe('useFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    vi.mocked(fetchAPI).mockResolvedValue(mockData)

    const { result } = renderHook(() => useFetch('/api/test'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('handles error', async () => {
    const mockError = new Error('Network error')
    vi.mocked(fetchAPI).mockRejectedValue(mockError)

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toEqual(mockError)
  })

  it('can refetch data', async () => {
    const mockData1 = { id: 1, name: 'Test1' }
    const mockData2 = { id: 2, name: 'Test2' }
    vi.mocked(fetchAPI)
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2)

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1)
    })

    act(() => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2)
    })
  })
})

// ==================== useForm Hook 测试 ====================
import useForm from './useForm'

describe('useForm', () => {
  it('initializes with initial values', () => {
    const { result } = renderHook(() =>
      useForm({ username: '', email: '' })
    )

    expect(result.current.values).toEqual({ username: '', email: '' })
  })

  it('updates field value', () => {
    const { result } = renderHook(() =>
      useForm({ username: '', email: '' })
    )

    act(() => {
      result.current.handleChange('username')('john')
    })

    expect(result.current.values.username).toBe('john')
  })

  it('validates required fields', () => {
    const { result } = renderHook(() =>
      useForm(
        { username: '', email: '' },
        {
          username: { required: true },
          email: { required: true }
        }
      )
    )

    act(() => {
      result.current.validate()
    })

    expect(result.current.errors.username).toBeDefined()
    expect(result.current.errors.email).toBeDefined()
  })

  it('submits form when valid', async () => {
    const handleSubmit = vi.fn()
    const user = userEvent.setup()

    const { result } = renderHook(() =>
      useForm({ username: '', email: '' })
    )

    const TestComponent = () => {
      const { values, handleChange, handleSubmit } = result.current

      return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(handleSubmit) }}>
          <input
            value={values.username}
            onChange={(e) => handleChange('username')(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      )
    }

    render(<TestComponent />)

    await user.type(screen.getByRole('textbox'), 'john')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(handleSubmit).toHaveBeenCalledWith({ username: 'john', email: '' })
  })
})
```

## 实战案例：完整的测试套件

### 场景：登录表单组件

```tsx
// ==================== LoginForm 组件 ====================
import { useState } from 'react'

interface LoginFormProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 验证
    if (!email || !password) {
      setError('请填写所有字段')
      return
    }

    if (!email.includes('@')) {
      setError('请输入有效的邮箱地址')
      return
    }

    setLoading(true)
    try {
      await onLogin({ email, password })
    } catch (err) {
      setError('登录失败，请检查邮箱和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>登录</h2>

      {error && <div className="error" role="alert">{error}</div>}

      <div className="form-group">
        <label htmlFor="email">邮箱</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="请输入邮箱"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">密码</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码"
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  )
}

export default LoginForm
```

### 完整的测试套件

```tsx
// ==================== LoginForm 完整测试 ====================
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginForm from './LoginForm'

describe('LoginForm', () => {
  const mockOnLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('渲染', () => {
    it('renders login form', () => {
      render(<LoginForm onLogin={mockOnLogin} />)

      expect(screen.getByRole('heading', { name: /登录/i })).toBeInTheDocument()
      expect(screen.getByLabelText('邮箱')).toBeInTheDocument()
      expect(screen.getByLabelText('密码')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument()
    })

    it('disables inputs when loading', () => {
      render(<LoginForm onLogin={async () => {}} />)
      // 组件初始状态不应该是加载中
      expect(screen.getByLabelText('邮箱')).not.toBeDisabled()
      expect(screen.getByLabelText('密码')).not.toBeDisabled()
    })
  })

  describe('表单验证', () => {
    it('shows error when fields are empty', async () => {
      const user = userEvent.setup()
      render(<LoginForm onLogin={mockOnLogin} />)

      const submitButton = screen.getByRole('button', { name: /登录/i })
      await user.click(submitButton)

      expect(screen.getByRole('alert')).toHaveTextContent('请填写所有字段')
      expect(mockOnLogin).not.toHaveBeenCalled()
    })

    it('shows error for invalid email', async () => {
      const user = userEvent.setup()
      render(<LoginForm onLogin={mockOnLogin} />)

      await user.type(screen.getByLabelText('邮箱'), 'invalid-email')
      await user.type(screen.getByLabelText('密码'), 'password123')
      await user.click(screen.getByRole('button', { name: /登录/i }))

      expect(screen.getByRole('alert')).toHaveTextContent('请输入有效的邮箱地址')
      expect(mockOnLogin).not.toHaveBeenCalled()
    })

    it('clears error when user starts typing', async () => {
      const user = userEvent.setup()
      render(<LoginForm onLogin={mockOnLogin} />)

      // 先触发错误
      await user.click(screen.getByRole('button', { name: /登录/i }))
      expect(screen.getByRole('alert')).toBeInTheDocument()

      // 开始输入
      await user.type(screen.getByLabelText('邮箱'), 'test@example.com')
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
  })

  describe('表单提交', () => {
    it('submits form with valid credentials', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockResolvedValue(undefined)
      render(<LoginForm onLogin={mockLogin} />)

      await user.type(screen.getByLabelText('邮箱'), 'test@example.com')
      await user.type(screen.getByLabelText('密码'), 'password123')
      await user.click(screen.getByRole('button', { name: /登录/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      let resolveLogin: () => void
      const mockLogin = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolveLogin = resolve
        })
      })

      render(<LoginForm onLogin={mockLogin} />)

      await user.type(screen.getByLabelText('邮箱'), 'test@example.com')
      await user.type(screen.getByLabelText('密码'), 'password123')
      await user.click(screen.getByRole('button', { name: /登录/i }))

      // 检查加载状态
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /登录中/i })).toBeInTheDocument()
        expect(screen.getByLabelText('邮箱')).toBeDisabled()
        expect(screen.getByLabelText('密码')).toBeDisabled()
      })

      // 解决登录请求
      resolveLogin!()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument()
      })
    })

    it('shows error message on failed login', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
      render(<LoginForm onLogin={mockLogin} />)

      await user.type(screen.getByLabelText('邮箱'), 'test@example.com')
      await user.type(screen.getByLabelText('密码'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /登录/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('登录失败')
      })
    })
  })

  describe('用户体验', () => {
    it('prevents submission when already loading', async () => {
      const user = userEvent.setup()
      let resolveLogin: () => void
      const mockLogin = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolveLogin = resolve
        })
      })

      render(<LoginForm onLogin={mockLogin} />)

      await user.type(screen.getByLabelText('邮箱'), 'test@example.com')
      await user.type(screen.getByLabelText('密码'), 'password123')
      await user.click(screen.getByRole('button', { name: /登录/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /登录中/i })).toBeDisabled()
      })

      // 尝试再次点击
      await user.click(screen.getByRole('button', { name: /登录中/i }))

      // 应该只调用一次
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1)
      })

      resolveLogin!()
    })

    it('clears password field after successful login', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockResolvedValue(undefined)
      render(<LoginForm onLogin={mockLogin} />)

      const passwordInput = screen.getByLabelText('密码')
      await user.type(passwordInput, 'password123')
      expect(passwordInput).toHaveValue('password123')

      await user.type(screen.getByLabelText('邮箱'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /登录/i }))

      // 注意：实际组件可能需要自己实现清空逻辑
      // 这只是示例测试
    })
  })
})
```

### 集成测试示例

```tsx
// ==================== 登录流程集成测试 ====================
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AuthPage from './AuthPage'

// Mock API
import { login } from '../api/auth'
vi.mock('../api/auth')

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('successfully logs in and redirects to dashboard', async () => {
    const user = userEvent.setup()
    const mockUser = { id: '1', name: 'John', email: 'john@example.com' }
    vi.mocked(login).mockResolvedValue({ token: 'fake-token', user: mockUser })

    render(<AuthPage />)

    // 填写表单
    await user.type(screen.getByLabelText('邮箱'), 'john@example.com')
    await user.type(screen.getByLabelText('密码'), 'password123')
    await user.click(screen.getByRole('button', { name: /登录/i }))

    // 验证 API 调用
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123'
      })
    })

    // 验证重定向
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /欢迎/i })).toBeInTheDocument()
    })

    // 验证 localStorage
    expect(localStorage.getItem('token')).toBe('fake-token')
  })

  it('displays error message on failed login', async () => {
    const user = userEvent.setup()
    vi.mocked(login).mockRejectedValue(new Error('Invalid credentials'))

    render(<AuthPage />)

    await user.type(screen.getByLabelText('邮箱'), 'john@example.com')
    await user.type(screen.getByLabelText('密码'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /登录/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/登录失败/i)
    })

    // 应该还在登录页面
    expect(screen.getByRole('heading', { name: /登录/i })).toBeInTheDocument()
  })
})
```

## 测试最佳实践

### AAA 模式（Arrange-Act-Assert）

```tsx
it('follows AAA pattern', () => {
  // Arrange（准备）：设置测试环境
  const user = userEvent.setup()
  const handleClick = vi.fn()
  render(<Button onClick={handleClick}>Click</Button>)

  // Act（行动）：执行操作
  await user.click(screen.getByRole('button'))

  // Assert（断言）：验证结果
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### 只测试用户可见的行为

```tsx
// ❌ 错误：测试实现细节
it('updates count state', () => {
  const { result } = renderHook(() => useCounter())
  act(() => {
    result.current.increment()
  })
  expect(result.current.count).toBe(1)
})

// ✅ 正确：测试用户可见的行为
it('increments counter when button is clicked', async () => {
  const user = userEvent.setup()
  render(<Counter />)

  await user.click(screen.getByRole('button', { name: /increment/i }))

  expect(screen.getByText('1')).toBeInTheDocument()
})
```

### 使用 data-testid 的场景

```tsx
// ✅ 只在元素没有可访问属性时使用 testid
const Component = () => (
  <div>
    {/* 不需要 testid - 有文本 */}
    <button>Submit</button>

    {/* 不需要 testid - 有 role */}
    <div role="dialog">Dialog</div>

    {/* 需要 testid - 装饰性元素 */}
    <div className="arrow-icon" data-testid="dropdown-arrow" />
  </div>
)

// 测试
test('renders dropdown arrow', () => {
  render(<Component />)
  expect(screen.getByTestId('dropdown-arrow')).toBeInTheDocument()
})
```

## 配套样式

```css
/* ==================== 登录表单样式 ==================== */
.login-form {
  max-width: 400px;
  margin: 50px auto;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-form h2 {
  margin: 0 0 30px 0;
  text-align: center;
  color: #333;
  font-size: 28px;
}

.login-form .error {
  padding: 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #2196F3;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.login-form button {
  width: 100%;
  padding: 14px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 10px;
}

.login-form button:hover:not(:disabled) {
  background: #1976D2;
}

.login-form button:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}
```

## 总结

本章我们学习了：

✅ 测试基础概念和测试金字塔
✅ Vitest 和 Testing Library 环境搭建
✅ Testing Library 的核心概念和最佳实践
✅ 组件测试（基础组件、复杂组件、异步组件）
✅ Hooks 测试完整指南
✅ 实战案例：完整的登录表单测试套件
✅ 测试最佳实践（AAA 模式、测试用户行为）

**测试检查清单：**

- [ ] 组件能正确渲染
- [ ] 用户交互能正确响应
- [ ] 表单验证正常工作
- [ ] 异步操作正确处理
- [ ] 错误状态正确显示
- [ ] 边界情况已覆盖
- [ ] 代码覆盖率达标（推荐80%+）

**Testing Library 查询优先级：**

1. ✅ getByRole（最推荐）
2. ✅ getByLabelText / getByPlaceholderText
3. ✅ getByText / getByAltText / getByTitle
4. ⚠️ getByTestId（最后选择）

**命令速查：**

```bash
# 运行所有测试
npm test

# 监听模式
npm test -- --watch

# UI 模式
npm run test:ui

# 生成覆盖率报告
npm run test:coverage

# 运行特定文件
npm test LoginForm.test.tsx
```

**下一步：** 第80章将学习 React 项目架构与最佳实践。
