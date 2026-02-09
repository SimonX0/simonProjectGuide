# ：useState与useEffect基础

## Hooks 简介

Hooks 是 React 16.8 引入的新特性，它让你可以在**不编写 class 的情况下使用 state 以及其他的 React 特性**。

### Hooks 的优势

- ✅ **简化组件逻辑**：不需要 class，逻辑更清晰
- ✅ **代码复用**：通过自定义 Hooks 复用状态逻辑
- ✅ **更小的代码体积**：无需使用高阶组件或 render props
- ✅ **更好的 TypeScript 支持**：类型推断更准确

### Hooks 使用规则

```tsx
// ✅ 规则一：只在 React 函数组件中调用 Hooks
function MyComponent() {
  const [count, setCount] = useState(0)  // ✅ 正确
  useEffect(() => {})  // ✅ 正确

  return <div>{count}</div>
}

// ❌ 在普通 JavaScript 函数中调用
function normalFunction() {
  const [count, setCount] = useState(0)  // ❌ 错误
}

// ✅ 规则二：只在函数顶层调用 Hooks
function BadComponent() {
  if (condition) {
    const [count, setCount] = useState(0)  // ❌ 错误：在条件语句中
  }

  useEffect(() => {
    if (condition) {
      const [data, setData] = useState(null)  // ❌ 错误：在 useEffect 中
    }
  }, [])

  return <div />
}

// ✅ 正确：始终在顶层调用
function GoodComponent() {
  const [count, setCount] = useState(0)  // ✅ 正确

  useEffect(() => {
    // 可以在这里使用 count
  }, [])

  return <div />
}
```

## useState 深入

### 基本用法

```tsx
import { useState } from 'react'

// 基础计数器
const Counter = () => {
  // 声明一个叫 count 的 state 变量，初始值为 0
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  )
}

// 多个 state 变量
const MultipleStates = () => {
  const [age, setAge] = useState(18)
  const [name, setName] = useState('Alice')
  const [isAdmin, setIsAdmin] = useState(false)

  return (
    <div>
      <p>姓名：{name}</p>
      <p>年龄：{age}</p>
      <p>管理员：{isAdmin ? '是' : '否'}</p>
    </div>
  )
}
```

### 函数式更新

```tsx
// 当新状态依赖于旧状态时，使用函数式更新
const Counter = () => {
  const [count, setCount] = useState(0)

  // ❌ 错误：多次调用可能不会按预期工作
  const incrementBad = () => {
    setCount(count + 1)
    setCount(count + 1)  // 仍然是 count + 1，因为 count 没有更新
  }

  // ✅ 正确：使用函数式更新
  const incrementGood = () => {
    setCount(prev => prev + 1)
    setCount(prev => prev + 1)  // 正确地 +2
  }

  return (
    <div>
      <p>{count}</p>
      <button onClick={incrementGood}>+2</button>
    </div>
  )
}
```

### 惰性初始化

```tsx
// 只在组件首次渲染时执行初始化函数
const ExpensiveComponent = () => {
  // ✅ 使用函数进行惰性初始化
  const [data, setData] = useState(() => {
    console.log('只执行一次')
    return Array.from({ length: 10000 }, (_, i) => i)
  })

  // ❌ 不要这样做：每次渲染都会执行
  // const [data, setData] = useState(
  //   Array.from({ length: 10000 }, (_, i) => i)
  // )

  return <div>{data.length} 项数据</div>
}
```

### 对象和数组的状态更新

```tsx
// 对象状态
const UserProfile = () => {
  const [user, setUser] = useState({
    name: 'Alice',
    age: 20,
    email: 'alice@example.com'
  })

  const updateName = (name: string) => {
    // ✅ 正确：创建新对象
    setUser({ ...user, name })

    // ❌ 错误：直接修改
    // user.name = name
    // setUser(user)
  }

  const updateAge = (age: number) => {
    setUser(prev => ({ ...prev, age }))
  }

  return (
    <div>
      <p>{user.name}</p>
      <button onClick={() => updateName('Bob')}>改名为 Bob</button>
    </div>
  )
}

// 数组状态
const TodoList = () => {
  const [todos, setTodos] = useState<string[]>([])

  const addTodo = (text: string) => {
    // ✅ 添加
    setTodos([...todos, text])
  }

  const removeTodo = (index: number) => {
    // ✅ 删除
    setTodos(todos.filter((_, i) => i !== index))
  }

  const updateTodo = (index: number, newText: string) => {
    // ✅ 更新
    setTodos(todos.map((todo, i) =>
      i === index ? newText : todo
    ))
  }

  return (
    <div>
      <ul>
        {todos.map((todo, i) => (
          <li key={i}>
            {todo}
            <button onClick={() => removeTodo(i)}>删除</button>
          </li>
        ))}
      </ul>
      <button onClick={() => addTodo(`新任务 ${todos.length + 1}`)}>
        添加
      </button>
    </div>
  )
}
```

## useEffect 深入

### 基本用法

```tsx
import { useState, useEffect } from 'react'

// 每次渲染后都执行
const BasicEffect = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('组件渲染了')
  })

  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// 只在组件挂载时执行一次
const MountEffect = () => {
  useEffect(() => {
    console.log('组件挂载了')
    return () => {
      console.log('组件卸载了')
    }
  }, [])  // 空依赖数组

  return <div>只执行一次</div>
}

// 依赖变化时执行
const DependencyEffect = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('count 变化了：', count)
  }, [count])  // 只有 count 变化时才执行

  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 清除副作用

```tsx
// 清除定时器
const Timer = () => {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)

    // 清除函数：组件卸载或重新执行 effect 前调用
    return () => {
      clearInterval(interval)
      console.log('定时器已清除')
    }
  }, [])  // 空依赖数组，只挂载一次

  return <div>已运行 {seconds} 秒</div>
}

// 清除事件监听
const WindowSize = () => {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <div>窗口宽度：{width}px</div>
}
```

### 依赖数组规则

```tsx
const DependencyRules = () => {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('Alice')

  // ✅ 正确：依赖所有使用的值
  useEffect(() => {
    console.log(`${name} 点击了 ${count} 次`)
  }, [count, name])

  // ❌ 错误：缺少依赖
  useEffect(() => {
    console.log(`${name} 点击了 ${count} 次`)
  }, [count])  // 缺少 name

  // ✅ 正确：不需要任何依赖
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('定时执行')
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      <p>{name}: {count}</p>
      <button onClick={() => setCount(count + 1)}>点击</button>
    </div>
  )
}
```

### 数据获取

```tsx
// 基础数据获取
const UserData = ({ userId }: { userId: number }) => {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.example.com/users/${userId}`)
        const data = await response.json()
        setUser(data)
      } catch (err) {
        setError('获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])  // userId 变化时重新获取

  if (loading) return <div>加载中...</div>
  if (error) return <div>{error}</div>
  if (!user) return <div>无数据</div>

  return <div>{user.name}</div>
}

// 带取消功能的数据获取
const UserDataWithAbort = ({ userId }: { userId: number }) => {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.example.com/users/${userId}`, {
          signal: controller.signal
        })
        const data = await response.json()
        setUser(data)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('获取数据失败', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    return () => {
      controller.abort()  // 组件卸载时取消请求
    }
  }, [userId])

  if (loading) return <div>加载中...</div>
  if (!user) return <div>无数据</div>

  return <div>{user.name}</div>
}
```

## 实战案例：实时搜索

```tsx
import { useState, useEffect } from 'react'

interface Product {
  id: number
  name: string
  price: number
  category: string
}

const ProductSearch = () => {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // 防抖：延迟更新搜索关键词
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)  // 500ms 延迟

    return () => clearTimeout(timer)
  }, [query])

  // 搜索商品
  useEffect(() => {
    if (!debouncedQuery) {
      setProducts([])
      return
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 模拟数据
        const mockProducts: Product[] = [
          { id: 1, name: 'iPhone 15', price: 5999, category: '手机' },
          { id: 2, name: 'MacBook Pro', price: 15999, category: '电脑' },
          { id: 3, name: 'AirPods Pro', price: 1999, category: '耳机' },
          { id: 4, name: 'iPad Air', price: 4799, category: '平板' },
          { id: 5, name: 'Apple Watch', price: 2999, category: '手表' }
        ]

        const filtered = mockProducts.filter(p =>
          p.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        )

        setProducts(filtered)
      } catch (err) {
        console.error('搜索失败', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [debouncedQuery])

  return (
    <div className="product-search">
      <h1>🔍 商品搜索</h1>

      <div className="search-box">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入商品名称搜索..."
        />
        {loading && <div className="loading">搜索中...</div>}
      </div>

      {debouncedQuery && !loading && (
        <div className="results">
          <h2>搜索结果 ({products.length})</h2>

          {products.length === 0 ? (
            <p className="no-results">没有找到匹配的商品</p>
          ) : (
            <div className="product-list">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <h3>{product.name}</h3>
                  <p className="category">{product.category}</p>
                  <p className="price">¥{product.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductSearch
```

**配套样式：**

```css
.product-search {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.loading {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.results {
  margin-top: 20px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.product-card {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  transition: box-shadow 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.category {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.price {
  color: #f44336;
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0 0 0;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #999;
}
```

## 常见陷阱

### 陷阱1：依赖数组遗漏

```tsx
// ❌ 错误
const Counter = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count)  // 总是输出 0
    }, 1000)

    return () => clearInterval(timer)
  }, [])  // count 不在依赖数组中

  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// ✅ 正确
const Counter = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('count:', count)
  }, [count])

  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 陷阱2：在条件语句中使用 Hooks

```tsx
// ❌ 错误
const BadComponent = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  if (isLoggedIn) {
    const [user, setUser] = useState(null)  // 错误！
  }

  return <div />
}

// ✅ 正确
const GoodComponent = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [user, setUser] = useState(null)  // 总是在顶层

  if (!isLoggedIn) {
    return <div>请先登录</div>
  }

  return <div>欢迎, {user?.name}</div>
}
```

### 陷阱3：在 useEffect 中更新导致无限循环

```tsx
// ❌ 错误：无限循环
const InfiniteLoop = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(count + 1)  // 每次 effect 执行都更新 count，导致无限循环
  }, [count])

  return <div>{count}</div>
}

// ✅ 正确：使用函数式更新
const FixedComponent = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(prev => prev + 1)  // 只执行一次
  }, [])

  return <div>{count}</div>
}
```

## 总结

本章我们学习了：

✅ Hooks 的使用规则（只在函数顶层、只在 React 组件中）
✅ useState 的深入使用（函数式更新、惰性初始化、对象数组更新）
✅ useEffect 的深入使用（依赖数组、清除副作用、数据获取）
✅ 实战案例：实时搜索（防抖、API 调用、加载状态）
✅ 常见陷阱和解决方案

**下一步：** 第58章将学习 useContext 与 useReducer，掌握更复杂的状态管理技巧。
