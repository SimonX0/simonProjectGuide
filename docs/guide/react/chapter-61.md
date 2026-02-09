# ：自定义Hooks开发

## 自定义 Hooks 简介

### 什么是自定义 Hooks？

自定义 Hooks 是一个函数，其名称以 "use" 开头，函数内部可以调用其他的 Hook。

```tsx
// ✅ 自定义 Hook 的基本结构
function useMyHook() {
  const [value, setValue] = useState(0)

  const increment = () => {
    setValue(v => v + 1)
  }

  return { value, increment }
}

// 使用自定义 Hook
const MyComponent = () => {
  const { value, increment } = useMyHook()

  return (
    <div>
      <p>{value}</p>
      <button onClick={increment}>+1</button>
    </div>
  )
}
```

### 自定义 Hooks 的规则

```tsx
// ✅ 规则1：名称必须以 "use" 开头
const useLocalStorage = () => { /* ... */ }  // ✅ 正确
const localStorageHook = () => { /* ... */ }  // ❌ 错误

// ✅ 规则2：只在函数顶层调用 Hooks
function useGoodHook() {
  const [value, setValue] = useState(0)  // ✅ 正确

  if (someCondition) {
    useEffect(() => { /* ... */ }, [])  // ❌ 错误：在条件语句中
  }

  return value
}

// ✅ 规则3：只在 React 函数组件或其他 Hook 中调用
const Component = () => {
  useMyHook()  // ✅ 正确
  return <div />
}

function normalFunction() {
  useMyHook()  // ❌ 错误：不能在普通函数中调用
}
```

### 自定义 Hooks 的优势

```tsx
// ❌ 问题：重复的代码逻辑
const Component1 = () => {
  const [value, setValue] = useState(localStorage.getItem('key') || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    // 模拟异步操作
    setTimeout(() => {
      localStorage.setItem('key', value)
      setLoading(false)
    }, 1000)
  }, [value])

  return <div>{loading ? '保存中...' : value}</div>
}

const Component2 = () => {
  const [value, setValue] = useState(localStorage.getItem('key') || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      localStorage.setItem('key', value)
      setLoading(false)
    }, 1000)
  }, [value])

  return <div>{loading ? '保存中...' : value}</div>
}

// ✅ 解决：使用自定义 Hook 复用逻辑
const useLocalStorage = (key: string, initialValue: string) => {
  const [value, setValue] = useState(() =>
    localStorage.getItem(key) || initialValue
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      localStorage.setItem(key, value)
      setLoading(false)
    }, 1000)
  }, [key, value])

  return [value, setValue, loading] as const
}

const Component1 = () => {
  const [value, setValue, loading] = useLocalStorage('key', '')
  return <div>{loading ? '保存中...' : value}</div>
}

const Component2 = () => {
  const [value, setValue, loading] = useLocalStorage('key', '')
  return <div>{loading ? '保存中...' : value}</div>
}
```

## 状态逻辑复用

### useCounter：计数器逻辑

```tsx
// 计数器 Hook
function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = useCallback(() => {
    setCount(c => c + 1)
  }, [])

  const decrement = useCallback(() => {
    setCount(c => c - 1)
  }, [])

  const reset = useCallback(() => {
    setCount(initialValue)
  }, [initialValue])

  const setValue = useCallback((value: number) => {
    setCount(value)
  }, [])

  return {
    count,
    increment,
    decrement,
    reset,
    setValue
  }
}

// 使用示例
const Counter = () => {
  const { count, increment, decrement, reset, setValue } = useCounter(0)

  return (
    <div className="counter">
      <h2>计数器：{count}</h2>

      <div className="controls">
        <button onClick={decrement}>-1</button>
        <button onClick={increment}>+1</button>
        <button onClick={reset}>重置</button>
      </div>

      <div className="set-value">
        <input
          type="number"
          value={count}
          onChange={(e) => setValue(parseInt(e.target.value) || 0)}
        />
      </div>
    </div>
  )
}
```

### useToggle：开关状态

```tsx
// 开关状态 Hook
function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue
  } as const
}

// 使用示例1：模态框
const Modal = () => {
  const { value: isOpen, toggle, setFalse: close } = useToggle(false)

  return (
    <div>
      <button onClick={toggle}>打开模态框</button>

      {isOpen && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>模态框标题</h2>
            <p>这是模态框内容</p>
            <button onClick={close}>关闭</button>
          </div>
        </div>
      )}
    </div>
  )
}

// 使用示例2：复选框
const Checkbox = () => {
  const { value: checked, toggle } = useToggle(false)

  return (
    <label>
      <input type="checkbox" checked={checked} onChange={toggle} />
      记住我
    </label>
  )
}

// 使用示例3：详情展开/收起
const ExpandableText = ({ text }: { text: string }) => {
  const { value: expanded, toggle } = useToggle(false)
  const maxLength = 100

  return (
    <div>
      <p>
        {expanded ? text : `${text.slice(0, maxLength)}...`}
        {text.length > maxLength && (
          <button onClick={toggle} className="toggle-btn">
            {expanded ? '收起' : '展开'}
          </button>
        )}
      </p>
    </div>
  )
}
```

### useArray：数组操作

```tsx
// 数组操作 Hook
function useArray<T>(initialValue: T[] = []) {
  const [array, setArray] = useState<T[]>(initialValue)

  const push = useCallback((item: T) => {
    setArray(a => [...a, item])
  }, [])

  const filter = useCallback((callback: (item: T, index: number) => boolean) => {
    setArray(a => a.filter(callback))
  }, [])

  const update = useCallback((index: number, newItem: T) => {
    setArray(a => [
      ...a.slice(0, index),
      newItem,
      ...a.slice(index + 1)
    ])
  }, [])

  const remove = useCallback((index: number) => {
    setArray(a => [
      ...a.slice(0, index),
      ...a.slice(index + 1)
    ])
  }, [])

  const clear = useCallback(() => {
    setArray([])
  }, [])

  const reset = useCallback(() => {
    setArray(initialValue)
  }, [initialValue])

  return {
    array,
    set: setArray,
    push,
    filter,
    update,
    remove,
    clear,
    reset
  }
}

// 使用示例
const TodoList = () => {
  const { array: todos, push, update, remove, clear } = useArray([
    { id: 1, text: '学习 React', done: false },
    { id: 2, text: '写代码', done: false }
  ])

  const [inputValue, setInputValue] = useState('')

  const addTodo = () => {
    if (inputValue.trim()) {
      push({
        id: Date.now(),
        text: inputValue,
        done: false
      })
      setInputValue('')
    }
  }

  return (
    <div>
      <div className="input-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="添加新任务"
        />
        <button onClick={addTodo}>添加</button>
      </div>

      <ul>
        {todos.map((todo, index) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => update(index, { ...todo, done: !todo.done })}
            />
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => remove(index)}>删除</button>
          </li>
        ))}
      </ul>

      {todos.length > 0 && (
        <button onClick={clear}>清空列表</button>
      )}
    </div>
  )
}
```

## 数据获取自定义Hook

### useFetch：基础数据获取

```tsx
// 数据获取 Hook
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(url, {
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : '发生错误')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      controller.abort()
    }
  }, [url])

  return { data, loading, error, refetch: () => {} }
}

// 使用示例
const UserList = () => {
  const { data, loading, error } = useFetch<User[]>(
    'https://jsonplaceholder.typicode.com/users'
  )

  if (loading) return <div className="loading">加载中...</div>
  if (error) return <div className="error">错误：{error}</div>
  if (!data) return <div className="empty">无数据</div>

  return (
    <div>
      <h2>用户列表</h2>
      <ul>
        {data.map(user => (
          <li key={user.id}>
            <strong>{user.name}</strong> - {user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### useFetch：带更多功能

```tsx
// 增强版数据获取 Hook
interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  enabled?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
) {
  const {
    method = 'GET',
    body,
    headers = {},
    enabled = true,
    onSuccess,
    onError
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async (requestOptions?: UseFetchOptions) => {
    if (!enabled) return

    const controller = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(url, {
        method: requestOptions?.method || method,
        body: requestOptions?.body || body,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...requestOptions?.headers
        },
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('发生错误')
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [url, method, body, headers, enabled, onSuccess, onError])

  useEffect(() => {
    if (method === 'GET') {
      execute()
    }
  }, [execute, method])

  return { data, loading, error, execute }
}

// 使用示例1：GET 请求
const UserProfile = ({ userId }: { userId: number }) => {
  const { data, loading, error } = useFetch<User>(
    `https://jsonplaceholder.typicode.com/users/${userId}`
  )

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误：{error.message}</div>
  if (!data) return null

  return (
    <div className="user-profile">
      <h2>{data.name}</h2>
      <p>邮箱：{data.email}</p>
      <p>公司：{data.company.name}</p>
    </div>
  )
}

// 使用示例2：POST 请求
const CreateUser = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const { data, loading, error, execute } = useFetch<User>(
    'https://jsonplaceholder.typicode.com/users',
    {
      method: 'POST',
      enabled: false,  // 手动触发
      onSuccess: (data) => {
        alert(`用户 ${data.name} 创建成功！`)
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    execute({
      body: JSON.stringify({ name, email })
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="姓名"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? '创建中...' : '创建用户'}
      </button>

      {error && <div className="error">{error.message}</div>}
      {data && <div className="success">用户创建成功！ID: {data.id}</div>}
    </form>
  )
}
```

### useLazyFetch：延迟数据获取

```tsx
// 延迟数据获取 Hook
function useLazyFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [fetched, setFetched] = useState(false)

  const execute = useCallback(async () => {
    if (fetched) return  // 防止重复请求

    const controller = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(url, {
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      setFetched(true)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        const error = err instanceof Error ? err : new Error('发生错误')
        setError(error)
      }
    } finally {
      setLoading(false)
    }
  }, [url, fetched])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setFetched(false)
  }, [])

  return { data, loading, error, fetched, execute, reset }
}

// 使用示例：点击按钮后才加载数据
const LazyLoadUser = () => {
  const { data, loading, error, fetched, execute, reset } =
    useLazyFetch<User>('https://jsonplaceholder.typicode.com/users/1')

  return (
    <div className="lazy-load">
      {!fetched ? (
        <button onClick={execute}>加载用户信息</button>
      ) : (
        <>
          {loading && <div>加载中...</div>}
          {error && <div>错误：{error.message}</div>}
          {data && (
            <div>
              <h2>{data.name}</h2>
              <p>{data.email}</p>
              <button onClick={reset}>重置</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

## 表单处理自定义Hook

### useForm：表单状态管理

```tsx
// 表单 Hook
function useForm<T extends Record<string, any>>(
  initialValues: T,
  validate?: (values: T) => Record<keyof T, string>
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as any)
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as any)

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target

    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // 实时验证
    if (validate) {
      const newValues = { ...values, [name]: value }
      const validationErrors = validate(newValues)
      setErrors(validationErrors)
    }
  }, [values, validate])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target

    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    if (validate) {
      const validationErrors = validate(values)
      setErrors(validationErrors)
    }
  }, [values, validate])

  const handleSubmit = useCallback((callback: (values: T) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault()

      // 验证所有字段
      if (validate) {
        const validationErrors = validate(values)
        setErrors(validationErrors)

        if (Object.keys(validationErrors).some(key => validationErrors[key])) {
          return
        }
      }

      callback(values)
    }
  }, [values, validate])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({} as any)
    setTouched({} as any)
  }, [initialValues])

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue
  }
}

// 使用示例
const LoginForm = () => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  } = useForm(
    {
      email: '',
      password: '',
      rememberMe: false
    },
    (values) => {
      const errors: any = {}

      if (!values.email) {
        errors.email = '邮箱不能为空'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = '邮箱格式不正确'
      }

      if (!values.password) {
        errors.password = '密码不能为空'
      } else if (values.password.length < 6) {
        errors.password = '密码至少6位'
      }

      return errors
    }
  )

  const onLogin = (formData: typeof values) => {
    console.log('登录数据：', formData)
    alert('登录成功！')
  }

  return (
    <form onSubmit={handleSubmit(onLogin)} className="login-form">
      <h2>登录</h2>

      <div className="form-group">
        <label>邮箱</label>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.email && touched.email ? 'error' : ''}
        />
        {errors.email && touched.email && (
          <span className="error-message">{errors.email}</span>
        )}
      </div>

      <div className="form-group">
        <label>密码</label>
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.password && touched.password ? 'error' : ''}
        />
        {errors.password && touched.password && (
          <span className="error-message">{errors.password}</span>
        )}
      </div>

      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            name="rememberMe"
            checked={values.rememberMe}
            onChange={handleChange}
          />
          记住我
        </label>
      </div>

      <button type="submit">登录</button>
      <button type="button" onClick={reset}>重置</button>
    </form>
  )
}
```

### useInput：单个输入框

```tsx
// 单个输入框 Hook
function useInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)

  const bind = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value)
    },
    onBlur: () => {
      setTouched(true)
    }
  }

  const reset = useCallback(() => {
    setValue(initialValue)
    setTouched(false)
  }, [initialValue])

  return {
    value,
    setValue,
    touched,
    bind,
    reset
  }
}

// 使用示例
const SearchBox = () => {
  const searchInput = useInput('')

  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="搜索..."
        {...searchInput.bind}
      />
      <p>输入值：{searchInput.value}</p>
      <button onClick={searchInput.reset}>清空</button>
    </div>
  )
}

const CommentForm = () => {
  const nameInput = useInput('')
  const commentInput = useInput('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      name: nameInput.value,
      comment: commentInput.value
    })

    // 清空表单
    nameInput.reset()
    commentInput.reset()
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="你的名字"
        {...nameInput.bind}
        required
      />

      <textarea
        placeholder="写下你的评论..."
        {...commentInput.bind}
        required
      />

      <button type="submit">提交评论</button>
    </form>
  )
}
```

## 实战案例：多个实用Hooks

```tsx
import { useState, useEffect, useCallback, useRef } from 'react'

// ==================== 1. useLocalStorage ====================
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}

// ==================== 2. useDebounce ====================
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// ==================== 3. usePrevious ====================
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// ==================== 4. useScroll ====================
function useScroll() {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return scrollPosition
}

// ==================== 5. useWindowSize ====================
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return windowSize
}

// ==================== 6. useClickOutside ====================
function useClickOutside(ref: React.RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, callback])
}

// ==================== 7. useEventListener ====================
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: HTMLElement | Window = window
) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) return

    const eventListener = (event: Event) =>
      savedHandler.current(event as WindowEventMap[K])

    element.addEventListener(eventName, eventListener as any)

    return () => {
      element.removeEventListener(eventName, eventListener as any)
    }
  }, [eventName, element])
}

// ==================== 8. useMediaQuery ====================
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)

    mediaQuery.addEventListener('change', handler)

    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }, [query])

  return matches
}

// ==================== 9. useGeolocation ====================
function useGeolocation() {
  const [state, setState] = useState({
    loading: true,
    accuracy: null as number | null,
    altitude: null as number | null,
    altitudeAccuracy: null as number | null,
    heading: null as number | null,
    latitude: null as number | null,
    longitude: null as number | null,
    speed: null as number | null,
    error: null as string | null
  })

  useEffect(() => {
    const onSuccess = (position: GeolocationPosition) => {
      setState({
        loading: false,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed,
        error: null
      })
    }

    const onError = (error: GeolocationPositionError) => {
      setState({
        loading: false,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: null,
        longitude: null,
        speed: null,
        error: error.message
      })
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError)

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError)

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return state
}

// ==================== 示例应用 ====================
const HooksDemo = () => {
  // useLocalStorage
  const [name, setName, removeName] = useLocalStorage('name', '')
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')

  // useDebounce
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // usePrevious
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)

  // useScroll
  const { x, y } = useScroll()

  // useWindowSize
  const { width, height } = useWindowSize()

  // useMediaQuery
  const isMobile = useMediaQuery('(max-width: 768px)')

  // useGeolocation
  const geolocation = useGeolocation()

  // useClickOutside
  const modalRef = useRef<HTMLDivElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useClickOutside(modalRef, () => {
    if (isModalOpen) {
      setIsModalOpen(false)
    }
  })

  // useEventListener
  useEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setIsModalOpen(false)
    }
  })

  return (
    <div className={`hooks-demo ${theme}`}>
      <h1>自定义 Hooks 演示</h1>

      {/* useLocalStorage */}
      <section className="demo-section">
        <h2>1. useLocalStorage</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入名字（会保存到 localStorage）"
        />
        <p>你好，{name || '访客'}！</p>
        <button onClick={removeName}>清除名字</button>

        <div className="theme-toggle">
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            切换到{theme === 'light' ? '深色' : '浅色'}模式
          </button>
        </div>
      </section>

      {/* useDebounce */}
      <section className="demo-section">
        <h2>2. useDebounce</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="输入搜索关键词（防抖 500ms）"
        />
        <p>输入值：{searchTerm}</p>
        <p>防抖值：{debouncedSearchTerm}</p>
      </section>

      {/* usePrevious */}
      <section className="demo-section">
        <h2>3. usePrevious</h2>
        <p>当前值：{count}</p>
        <p>上一次的值：{prevCount ?? '无'}</p>
        <button onClick={() => setCount(c => c + 1)}>+1</button>
      </section>

      {/* useScroll */}
      <section className="demo-section">
        <h2>4. useScroll</h2>
        <p>滚动位置：</p>
        <p>X: {x.toFixed(0)}px</p>
        <p>Y: {y.toFixed(0)}px</p>
      </section>

      {/* useWindowSize */}
      <section className="demo-section">
        <h2>5. useWindowSize</h2>
        <p>窗口宽度：{width}px</p>
        <p>窗口高度：{height}px</p>
        <p>设备类型：{isMobile ? '移动设备' : '桌面设备'}</p>
      </section>

      {/* useGeolocation */}
      <section className="demo-section">
        <h2>6. useGeolocation</h2>
        {geolocation.loading ? (
          <p>获取位置中...</p>
        ) : geolocation.error ? (
          <p>错误：{geolocation.error}</p>
        ) : (
          <div>
            <p>纬度：{geolocation.latitude}</p>
            <p>经度：{geolocation.longitude}</p>
            <p>精度：{geolocation.accuracy}米</p>
          </div>
        )}
      </section>

      {/* useClickOutside */}
      <section className="demo-section">
        <h2>7. useClickOutside</h2>
        <button onClick={() => setIsModalOpen(true)}>打开模态框</button>

        {isModalOpen && (
          <div ref={modalRef} className="modal">
            <h3>模态框</h3>
            <p>点击外部区域或按 ESC 键关闭</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default HooksDemo
```

**配套样式：**

```css
.hooks-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.hooks-demo.light {
  background-color: #ffffff;
  color: #333333;
}

.hooks-demo.dark {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  color: #2196F3;
}

.demo-section {
  background: #f5f5f5;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.hooks-demo.dark .demo-section {
  background: #2d2d2d;
  border-color: #444;
}

.demo-section h2 {
  margin-top: 0;
  color: #2196F3;
  border-bottom: 2px solid #2196F3;
  padding-bottom: 10px;
}

input[type="text"],
input[type="email"],
input[type="password"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;
}

.hooks-demo.dark input {
  background-color: #1a1a1a;
  border-color: #444;
  color: #e0e0e0;
}

button {
  padding: 10px 20px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #1976D2;
}

/* 模态框 */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 300px;
}

.hooks-demo.dark .modal {
  background: #2d2d2d;
}

/* 表单样式 */
.login-form {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
}

.form-group.checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 搜索框 */
.search-box {
  position: relative;
  max-width: 400px;
  margin: 20px auto;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 20px;
  color: #999;
}

/* 错误状态 */
.error {
  color: #f44336;
  padding: 10px;
  background: #ffebee;
  border-radius: 4px;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}
```

## 自定义Hooks最佳实践

### 1. 命名规范

```tsx
// ✅ 好的命名
const useLocalStorage = () => { /* ... */ }
const useFetch = () => { /* ... */ }
const useDebounce = () => { /* ... */ }

// ❌ 不好的命名
const localStorage = () => { /* ... */ }  // 缺少 use 前缀
const getLocalStorage = () => { /* ... */ }  // 不是 hook
const UseLocalStorage = () => { /* ... */ }  // 不应该大写开头
```

### 2. 单一职责

```tsx
// ✅ 好的设计：每个 Hook 只做一件事
const useLocalStorage = () => { /* ... */ }  // 只处理 localStorage
const useDebounce = () => { /* ... */ }  // 只处理防抖

// ❌ 不好的设计：一个 Hook 做太多事情
const useStorageAndDebounce = () => {
  // 既处理 localStorage 又处理防抖
  // 职责不清晰
}
```

### 3. 合理的参数和返回值

```tsx
// ✅ 好的设计：返回数组或对象，根据使用习惯
// 返回数组（类似 useState）
const [value, setValue] = useLocalStorage('key', 'default')

// 返回对象（当返回多个值时）
const { user, loading, error } = useFetch('/api/user')

// ❌ 不好的设计：不一致
const value = useLocalStorage('key', 'default')  // 有时返回数组
const { value, setValue } = useLocalStorage('key', 'default')  // 有时返回对象
```

## 总结

本章我们学习了：

✅ 自定义 Hooks 的基本规则和命名规范
✅ 状态逻辑复用的实现方法
✅ 数据获取自定义 Hook 的开发
✅ 表单处理自定义 Hook 的开发
✅ 实战案例：useLocalStorage、useFetch、useForm 等多个实用 Hooks
✅ 自定义 Hooks 的最佳实践
✅ 9个常用的自定义 Hooks 完整实现

**下一步：** 第62章将学习 Hooks 最佳实践与常见陷阱，掌握 React Hooks 的高级用法。
