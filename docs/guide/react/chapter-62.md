# ：Hooks最佳实践与常见陷阱

## Hooks 的黄金法则

### 法则一：只在顶层调用 Hooks

```tsx
// ❌ 错误：在条件语句中调用 Hook
const BadComponent = ({ condition }: { condition: boolean }) => {
  if (condition) {
    const [value, setValue] = useState(0)  // ❌ 错误！
  }

  return <div />
}

// ✅ 正确：始终在顶层调用
const GoodComponent = ({ condition }: { condition: boolean }) => {
  const [value, setValue] = useState(0)  // ✅ 正确

  if (!condition) {
    return null
  }

  return <div>{value}</div>
}

// ❌ 错误：在循环中调用 Hook
const BadComponent2 = ({ items }: { items: string[] }) => {
  items.forEach(item => {
    const [value, setValue] = useState(item)  // ❌ 错误！
  })

  return <div />
}

// ✅ 正确：使用对象或数组存储多个状态
const GoodComponent2 = ({ items }: { items: string[] }) => {
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const initialValues = items.reduce((acc, item) => {
      acc[item] = ''
      return acc
    }, {} as Record<string, string>)

    setValues(initialValues)
  }, [items])

  return <div />
}

// ❌ 错误：在嵌套函数中调用 Hook
const BadComponent3 = () => {
  const handleClick = () => {
    const [value, setValue] = useState(0)  // ❌ 错误！
  }

  return <button onClick={handleClick}>点击</button>
}

// ✅ 正确：在组件顶层调用 Hook
const GoodComponent3 = () => {
  const [value, setValue] = useState(0)

  const handleClick = () => {
    setValue(value + 1)
  }

  return <button onClick={handleClick}>点击</button>
}
```

### 法则二：只在 React 函数中调用 Hooks

```tsx
// ✅ 正确：在函数组件中调用
const MyComponent = () => {
  const [value, setValue] = useState(0)  // ✅ 正确
  return <div>{value}</div>
}

// ✅ 正确：在自定义 Hook 中调用
const useMyHook = () => {
  const [value, setValue] = useState(0)  // ✅ 正确
  return value
}

// ❌ 错误：在普通 JavaScript 函数中调用
const normalFunction = () => {
  const [value, setValue] = useState(0)  // ❌ 错误！
  return value
}

// ❌ 错误：在类组件中调用
class MyClassComponent extends React.Component {
  render() {
    const [value, setValue] = useState(0)  // ❌ 错误！
    return <div>{value}</div>
  }
}
```

### 法则三：使用 ESLint 插件强制执行规则

```json
// .eslintrc.json
{
  "extends": ["react-app"],
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## 常见陷阱和解决方案

### 陷阱1：依赖数组导致无限循环

```tsx
// ❌ 问题：无限循环
const InfiniteLoop = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(count + 1)  // 更新状态触发重新渲染，再次执行 effect
  }, [count])

  return <div>{count}</div>
}

// ✅ 解决方案1：使用函数式更新
const FixedComponent = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(prev => prev + 1)  // 不依赖 count
  }, [])

  return <div>{count}</div>
}

// ✅ 解决方案2：使用 useRef 存储可变值
const FixedComponent2 = () => {
  const countRef = useRef(0)
  const [, forceUpdate] = useState({})

  useEffect(() => {
    countRef.current += 1
    forceUpdate({})  // 手动触发更新
  }, [])

  return <div>{countRef.current}</div>
}

// ✅ 解决方案3：只在特定条件下执行
const FixedComponent3 = () => {
  const [count, setCount] = useState(0)
  const [shouldIncrement, setShouldIncrement] = useState(false)

  useEffect(() => {
    if (shouldIncrement) {
      setCount(count + 1)
      setShouldIncrement(false)
    }
  }, [count, shouldIncrement])

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setShouldIncrement(true)}>增加</button>
    </div>
  )
}
```

### 陷阱2：闭包陷阱（过期的 props/state）

```tsx
// ❌ 问题：闭包捕获了旧的状态
const ClosureTrap = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count)  // 总是输出 0
    }, 1000)

    return () => clearInterval(timer)
  }, [])  // 空依赖数组，effect 只执行一次

  return <div>{count}</div>
}

// ✅ 解决方案1：添加依赖
const FixedClosure1 = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count)
    }, 1000)

    return () => clearInterval(timer)
  }, [count])  // 添加 count 依赖

  return <div>{count}</div>
}

// ✅ 解决方案2：使用函数式更新（推荐）
const FixedClosure2 = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        console.log(prev)  // 总是最新的值
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return <div>{count}</div>
}

// ✅ 解决方案3：使用 useRef 存储最新值
const FixedClosure3 = () => {
  const [count, setCount] = useState(0)
  const countRef = useRef(count)

  useEffect(() => {
    countRef.current = count  // 保持 ref 同步
  })

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(countRef.current)  // 读取 ref
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return <div>{count}</div>
}
```

### 陷阱3：在条件渲染中使用 Hooks

```tsx
// ❌ 错误：条件渲染导致 Hooks 调用顺序不一致
const BadComponent = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [user, setUser] = useState(null)

  if (!isLoggedIn) {
    return <div>请先登录</div>
  }

  // 这个 Hook 只在 isLoggedIn 为 true 时调用
  useEffect(() => {
    fetchUserData().then(setUser)
  }, [])

  return <div>Welcome, {user?.name}</div>
}

// ✅ 正确：始终调用所有 Hooks
const GoodComponent = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserData().then(setUser)
    }
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return <div>请先登录</div>
  }

  return <div>Welcome, {user?.name}</div>
}

// ✅ 正确：提取组件
const UserData = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchUserData().then(setUser)
  }, [])

  return <div>Welcome, {user?.name}</div>
}

const GoodComponent2 = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  if (!isLoggedIn) {
    return <div>请先登录</div>
  }

  return <UserData />
}
```

### 陷阱4：useEffect 的清理函数理解错误

```tsx
// ❌ 错误：认为清理函数只在组件卸载时执行
const Misunderstanding = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('Effect 执行')

    return () => {
      console.log('清理函数执行')
    }
  }, [count])

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  )
}

// 实际输出：
// Effect 执行
// 清理函数执行  ← 下一个 effect 执行前
// Effect 执行

// ✅ 正确理解：清理函数在每次新 effect 执行前和组件卸载时执行

// 正确示例：监听窗口大小变化
const WindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)

    // 清理：移除旧的事件监听器
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div>
      窗口大小：{size.width} x {size.height}
    </div>
  )
}
```

### 陷阱5：忘记清理副作用

```tsx
// ❌ 错误：没有清理定时器
const NoCleanup = () => {
  useEffect(() => {
    setInterval(() => {
      console.log('定时器运行')
    }, 1000)
  }, [])

  return <div>组件</div>
}

// ✅ 正确：清理定时器
const WithCleanup = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('定时器运行')
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return <div>组件</div>
}

// ❌ 错误：没有清理订阅
const NoSubscriptionCleanup = ({ userId }: { userId: number }) => {
  useEffect(() => {
    subscribeToUser(userId, (data) => {
      console.log('收到数据', data)
    })
  }, [userId])

  return <div>用户数据</div>
}

// ✅ 正确：清理订阅
const WithSubscriptionCleanup = ({ userId }: { userId: number }) => {
  useEffect(() => {
    const unsubscribe = subscribeToUser(userId, (data) => {
      console.log('收到数据', data)
    })

    return unsubscribe  // 返回取消订阅函数
  }, [userId])

  return <div>用户数据</div>
}
```

### 陷阱6：过度使用 useCallback 和 useMemo

```tsx
// ❌ 过度优化：简单的计算不需要 useMemo
const OverOptimized = () => {
  const [count, setCount] = useState(0)

  const doubled = useMemo(() => {
    return count * 2  // 这个计算太快了，不需要缓存
  }, [count])

  return <div>{doubled}</div>
}

// ✅ 简单直接：直接计算即可
const SimpleAndClear = () => {
  const [count, setCount] = useState(0)
  const doubled = count * 2  // 直接计算

  return <div>{doubled}</div>
}

// ❌ 过度优化：简单的函数不需要 useCallback
const OverOptimized2 = () => {
  const [count, setCount] = useState(0)

  const handleClick = useCallback(() => {
    console.log('点击')
  }, [])  // 这个函数不依赖任何值，不需要 useCallback

  return <button onClick={handleClick}>点击</button>
}

// ✅ 简单直接：内联函数即可
const SimpleAndClear2 = () => {
  return (
    <button onClick={() => console.log('点击')}>
      点击
    </button>
  )
}

// ✅ 合理使用：只在真正需要时使用 useMemo
const GoodOptimization = ({ items }: { items: number[] }) => {
  // 昂贵的计算，需要缓存
  const sortedItems = useMemo(() => {
    console.log('排序')
    return [...items].sort((a, b) => a - b)
  }, [items])

  return (
    <ul>
      {sortedItems.map(item => <li key={item}>{item}</li>)}
    </ul>
  )
}
```

## Hooks 性能优化策略

### 策略1：使用 React.memo 避免不必要的渲染

```tsx
// ❌ 问题：父组件渲染导致子组件不必要的渲染
const Parent = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <ExpensiveChild />
    </div>
  )
}

const ExpensiveChild = () => {
  console.log('ExpensiveChild 渲染')
  // 昂贵的计算
  const result = heavyComputation()

  return <div>{result}</div>
}

// ✅ 解决方案：使用 React.memo
const Parent = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <OptimizedChild />
    </div>
  )
}

const OptimizedChild = React.memo(() => {
  console.log('OptimizedChild 渲染')
  const result = heavyComputation()

  return <div>{result}</div>
})

// ✅ 自定义比较函数
const CustomMemoChild = React.memo(
  ({ data }: { data: User }) => {
    console.log('CustomMemoChild 渲染')
    return <div>{data.name}</div>
  },
  (prevProps, nextProps) => {
    // 只在 data.id 变化时重新渲染
    return prevProps.data.id === nextProps.data.id
  }
)
```

### 策略2：拆分组件减少渲染范围

```tsx
// ❌ 问题：整个组件重新渲染
const BadComponent = () => {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <ExpensiveComponent count={count} />
      <AnotherComponent text={text} />
    </div>
  )
}

// ✅ 解决方案：拆分组件
const GoodComponent = () => {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  return (
    <div>
      <Counter count={count} setCount={setCount} />
      <TextInput text={text} setText={setText} />
    </div>
  )
}

const Counter = ({ count, setCount }: {
  count: number
  setCount: (value: number) => void
}) => {
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <ExpensiveComponent count={count} />
    </div>
  )
}

const TextInput = ({ text, setText }: {
  text: string
  setText: (value: string) => void
}) => {
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <AnotherComponent text={text} />
    </div>
  )
}
```

### 策略3：使用 useReducer 替代多个 useState

```tsx
// ❌ 问题：多个相关状态分散
const BadForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = () => {
    // 需要分别处理每个状态
  }

  return <form>...</form>
}

// ✅ 解决方案：使用 useReducer
type FormState = {
  name: string
  email: string
  age: string
  errors: Record<string, string>
}

type FormAction =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'RESET' }

const initialState: FormState = {
  name: '',
  email: '',
  age: '',
  errors: {}
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error }
      }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const GoodForm = () => {
  const [state, dispatch] = useReducer(formReducer, initialState)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_FIELD',
      field: e.target.name,
      value: e.target.value
    })
  }

  return (
    <form>
      <input name="name" value={state.name} onChange={handleChange} />
      <input name="email" value={state.email} onChange={handleChange} />
      <input name="age" value={state.age} onChange={handleChange} />
    </form>
  )
}
```

### 策略4：虚拟化长列表

```tsx
// ❌ 问题：渲染大量 DOM 元素导致性能问题
const BadList = ({ items }: { items: number[] }) => {
  return (
    <div>
      {items.map(item => (
        <div key={item} style={{ height: '50px' }}>
          Item {item}
        </div>
      ))}
    </div>
  )
}

// ✅ 解决方案：使用 react-window（虚拟滚动）
import { FixedSizeList } from 'react-window'

const GoodList = ({ items }: { items: number[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      Item {items[index]}
    </div>
  )

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

## 测试 Hooks

### 使用 React Testing Library 测试自定义 Hook

```tsx
// 自定义 Hook
function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = () => setCount(count + 1)
  const decrement = () => setCount(count - 1)
  const reset = () => setCount(initialValue)

  return { count, increment, decrement, reset }
}

// 测试文件
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  test('应该正确初始化', () => {
    const { result } = renderHook(() => useCounter(5))

    expect(result.current.count).toBe(5)
  })

  test('应该增加计数', () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })

  test('应该减少计数', () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => {
      result.current.decrement()
    })

    expect(result.current.count).toBe(-1)
  })

  test('应该重置计数', () => {
    const { result } = renderHook(() => useCounter(5))

    act(() => {
      result.current.increment()
      result.current.increment()
      result.current.reset()
    })

    expect(result.current.count).toBe(5)
  })

  test('应该处理更新的初始值', () => {
    const { result, rerender } = renderHook(
      ({ initialValue }) => useCounter(initialValue),
      { initialProps: { initialValue: 0 } }
    )

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)

    rerender({ initialValue: 10 })

    expect(result.current.count).toBe(10)
  })
})
```

### 测试 useEffect

```tsx
test('应该正确执行 effect', () => {
  const effectCallback = jest.fn()
  const cleanupCallback = jest.fn()

  const { unmount } = renderHook(() =>
    useEffect(() => {
      effectCallback()
      return cleanupCallback
    }, [])
  )

  expect(effectCallback).toHaveBeenCalledTimes(1)

  unmount()

  expect(cleanupCallback).toHaveBeenCalledTimes(1)
})
```

## 实战案例：重构类组件为 Hooks

```tsx
// ==================== 原始类组件 ====================
class UserProfileClass extends React.Component<
  { userId: number },
  {
    user: User | null
    loading: boolean
    error: string | null
  }
> {
  state = {
    user: null,
    loading: true,
    error: null
  }

  componentDidMount() {
    this.fetchUser()
  }

  componentDidUpdate(prevProps: { userId: number }) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser()
    }
  }

  async fetchUser() {
    try {
      this.setState({ loading: true, error: null })

      const response = await fetch(
        `https://api.example.com/users/${this.props.userId}`
      )

      if (!response.ok) {
        throw new Error('获取用户失败')
      }

      const user = await response.json()
      this.setState({ user, loading: false })
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : '发生错误',
        loading: false
      })
    }
  }

  render() {
    const { user, loading, error } = this.state

    if (loading) return <div className="loading">加载中...</div>
    if (error) return <div className="error">{error}</div>
    if (!user) return <div className="empty">无数据</div>

    return (
      <div className="user-profile">
        <img src={user.avatar} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <p>{user.bio}</p>
      </div>
    )
  }
}

// ==================== 重构为 Hooks ====================
// 步骤1：提取数据获取逻辑为自定义 Hook
function useUser(userId: number) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchUser() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `https://api.example.com/users/${userId}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('获取用户失败')
        }

        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : '发生错误')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    return () => {
      controller.abort()
    }
  }, [userId])

  return { user, loading, error }
}

// 步骤2：创建函数组件
const UserProfileHooks = ({ userId }: { userId: number }) => {
  const { user, loading, error } = useUser(userId)

  if (loading) return <div className="loading">加载中...</div>
  if (error) return <div className="error">{error}</div>
  if (!user) return <div className="empty">无数据</div>

  return (
    <div className="user-profile">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>{user.bio}</p>
    </div>
  )
}

// ==================== 进一步优化：提取可复用的 UI 组件 ====================
const LoadingState = () => (
  <div className="loading">
    <div className="spinner"></div>
    <p>加载中...</p>
  </div>
)

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="error">
    <p>错误：{error}</p>
    <button onClick={onRetry}>重试</button>
  </div>
)

const EmptyState = ({ message }: { message: string }) => (
  <div className="empty">
    <p>{message}</p>
  </div>
)

const UserInfo = ({ user }: { user: User }) => (
  <div className="user-profile">
    <div className="avatar-wrapper">
      <img src={user.avatar} alt={user.name} />
    </div>
    <div className="user-details">
      <h2>{user.name}</h2>
      <p className="email">
        <span className="icon">📧</span>
        {user.email}
      </p>
      <p className="bio">{user.bio}</p>
      <div className="stats">
        <div className="stat">
          <span className="label">粉丝：</span>
          <span className="value">{user.followers}</span>
        </div>
        <div className="stat">
          <span className="label">关注：</span>
          <span className="value">{user.following}</span>
        </div>
      </div>
    </div>
  </div>
)

// 最终优化版本
const UserProfileOptimized = ({ userId }: { userId: number }) => {
  const { user, loading, error, refetch } = useUser(userId)

  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!user) return <EmptyState message="未找到用户信息" />

  return <UserInfo user={user} />
}

// ==================== 完整示例应用 ====================
const UserProfileApp = () => {
  const [currentUserId, setCurrentUserId] = useState(1)
  const [userIdInput, setUserIdInput] = useState('1')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const userId = parseInt(userIdInput)
    if (!isNaN(userId) && userId > 0) {
      setCurrentUserId(userId)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>用户资料查看器</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="number"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            placeholder="输入用户 ID"
            min="1"
          />
          <button type="submit">搜索</button>
        </form>
      </header>

      <main className="app-main">
        <UserProfileOptimized userId={currentUserId} />
      </main>

      <nav className="user-nav">
        <h3>快速访问</h3>
        <div className="user-buttons">
          {[1, 2, 3, 4, 5].map(id => (
            <button
              key={id}
              onClick={() => {
                setCurrentUserId(id)
                setUserIdInput(id.toString())
              }}
              className={currentUserId === id ? 'active' : ''}
            >
              用户 {id}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
```

**配套样式：**

```css
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
}

.app-header h1 {
  color: #2196F3;
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.search-form input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  width: 200px;
}

.search-form button {
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.app-main {
  margin-bottom: 30px;
}

.user-profile {
  display: flex;
  gap: 30px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar-wrapper img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #2196F3;
}

.user-details {
  flex: 1;
}

.user-details h2 {
  margin: 0 0 15px 0;
  color: #333;
}

.email {
  color: #666;
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon {
  font-size: 18px;
}

.bio {
  color: #555;
  line-height: 1.6;
  margin: 15px 0;
}

.stats {
  display: flex;
  gap: 30px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.stat {
  display: flex;
  gap: 5px;
}

.stat .label {
  color: #666;
}

.stat .value {
  font-weight: bold;
  color: #2196F3;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 40px;
  background: #ffebee;
  border-radius: 8px;
  color: #c62828;
}

.error button {
  margin-top: 15px;
  padding: 10px 20px;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty {
  text-align: center;
  padding: 40px;
  background: #f5f5f5;
  border-radius: 8px;
  color: #999;
}

.user-nav {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-nav h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.user-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.user-buttons button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-buttons button:hover {
  background: #f5f5f5;
}

.user-buttons button.active {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
}
```

## Hooks 最佳实践检查清单

```tsx
// ✅ Hooks 最佳实践检查清单

// 1. 遵循 Hooks 规则
// - 只在顶层调用 Hooks
// - 只在 React 函数中调用 Hooks

// 2. 正确使用依赖数组
useEffect(() => {
  // 包含所有外部依赖
}, [dep1, dep2])

// 3. 清理副作用
useEffect(() => {
  const subscription = subscribe()
  return () => subscription.unsubscribe()
}, [])

// 4. 使用自定义 Hooks 复用逻辑
const useCustomHook = () => {
  // 封装可复用的逻辑
}

// 5. 性能优化
// - 使用 React.memo 避免不必要的渲染
// - 只在需要时使用 useCallback 和 useMemo
// - 合理拆分组件

// 6. 类型安全
interface MyHookResult {
  value: number
  setValue: (value: number) => void
}

function useMyHook(): MyHookResult {
  // ...
}

// 7. 错误处理
function useFetch(url: string) {
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .catch(err => setError(err))
  }, [url])

  return { error }
}
```

## 总结

本章我们学习了：

✅ Hooks 的黄金法则（顶层调用、React 函数中调用）
✅ 6个常见陷阱和解决方案（无限循环、闭包陷阱、条件渲染等）
✅ 4个性能优化策略（React.memo、组件拆分、useReducer、虚拟化）
✅ 测试 Hooks 的方法和最佳实践
✅ 实战案例：重构类组件为 Hooks
✅ Hooks 最佳实践检查清单

**恭喜你完成了 React Hooks 的学习！**

你已经掌握了：
- 第57章：useState 与 useEffect 基础
- 第58章：useContext 与 useReducer
- 第59章：useRef 与 useMemo
- 第60章：useCallback 与性能优化
- 第61章：自定义 Hooks 开发
- 第62章：Hooks 最佳实践与常见陷阱

现在你已经具备了使用 React Hooks 构建复杂应用的全部知识！继续实践和探索，你将成为一名出色的 React 开发者。
