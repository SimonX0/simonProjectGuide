# ：自动批处理（Automatic Batching）

## 什么是批处理

批处理（Batching）是 React 的一种性能优化机制，它将多个状态更新合并成一次重新渲染，而不是每次状态更新都触发一次渲染。

### 批处理的工作原理

```tsx
// ❌ 没有批处理：每次 setState 都会重新渲染
function WithoutBatching() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  const handleClick = () => {
    setCount(1)  // 渲染 1
    setName('Alice')  // 渲染 2
    setCount(2)  // 渲染 3
    // 总共 3 次渲染！
  }

  return <button onClick={handleClick}>点击</button>
}

// ✅ 有批处理：所有更新合并成一次渲染
function WithBatching() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  const handleClick = () => {
    setCount(1)
    setName('Alice')
    setCount(2)
    // 只渲染 1 次！React 会批处理这些更新
  }

  return <button onClick={handleClick}>点击</button>
}
```

## React 18 之前的批处理限制

在 React 18 之前，批处理只在事件处理函数中有效，在异步操作、Promise、setTimeout 等场景中不会自动批处理。

### React 17 的批处理行为

```tsx
// React 17 或更早版本
function React17Example() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  // ✅ 场景1：事件处理函数中会批处理
  const handleClick = () => {
    setCount(c => c + 1)
    setName('Alice')
    // 这两个更新会被批处理成一次渲染
  }

  // ❌ 场景2：fetch、Promise、setTimeout 中不会批处理
  const fetchData = () => {
    fetch('/api/data').then(() => {
      setCount(c => c + 1)  // 渲染 1
      setName('Alice')  // 渲染 2
      // 两次渲染！
    })
  }

  const handleAsync = () => {
    setTimeout(() => {
      setCount(c => c + 1)  // 渲染 1
      setName('Alice')  // 渲染 2
      // 两次渲染！
    }, 0)
  }

  const handlePromise = () => {
    Promise.resolve().then(() => {
      setCount(c => c + 1)  // 渲染 1
      setName('Alice')  // 渲染 2
      // 两次渲染！
    })
  }

  return (
    <div>
      <button onClick={handleClick}>事件处理（批处理）</button>
      <button onClick={fetchData}>Fetch（不批处理）</button>
      <button onClick={handleAsync}>setTimeout（不批处理）</button>
      <button onClick={handlePromise}>Promise（不批处理）</button>
    </div>
  )
}
```

### 不批处理导致的性能问题

```tsx
// ❌ React 17：性能问题示例
function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  const loadUsers = async () => {
    setLoading(true)  // 渲染 1
    setError(null)    // 渲染 2

    try {
      const response = await fetch('/api/users')
      const data = await response.json()

      setUsers(data)           // 渲染 3
      setSelectedUser(data[0]) // 渲染 4
      setLoading(false)        // 渲染 5
      // 总共 5 次渲染！
    } catch (err) {
      setError(err)    // 渲染 3
      setLoading(false)// 渲染 4
    }
  }

  return (
    <div>
      <button onClick={loadUsers}>加载用户</button>
      {loading && <div>加载中...</div>}
      {error && <div>错误：{error.message}</div>}
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

## React 18 的自动批处理

React 18 引入了自动批处理（Automatic Batching），确保**所有**状态更新，无论发生在哪里，都会被自动批处理。

### 启用自动批处理

```tsx
// React 18+ 的自动批处理
import { createRoot } from 'react-dom/client'

// 启用并发特性
const root = createRoot(document.getElementById('root'))
root.render(<App />)
```

### React 18 的自动批处理行为

```tsx
// React 18+：所有场景都会自动批处理
function React18Example() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  // ✅ 场景1：事件处理函数中批处理
  const handleClick = () => {
    setCount(c => c + 1)
    setName('Alice')
    // 批处理：1 次渲染
  }

  // ✅ 场景2：fetch、Promise 中自动批处理
  const fetchData = () => {
    fetch('/api/data').then(() => {
      setCount(c => c + 1)
      setName('Alice')
      // 自动批处理：1 次渲染（React 18 新增）
    })
  }

  // ✅ 场景3：setTimeout 中自动批处理
  const handleAsync = () => {
    setTimeout(() => {
      setCount(c => c + 1)
      setName('Alice')
      // 自动批处理：1 次渲染（React 18 新增）
    }, 0)
  }

  // ✅ 场景4：Promise 中自动批处理
  const handlePromise = () => {
    Promise.resolve().then(() => {
      setCount(c => c + 1)
      setName('Alice')
      // 自动批处理：1 次渲染（React 18 新增）
    })
  }

  return (
    <div>
      <button onClick={handleClick}>事件处理</button>
      <button onClick={fetchData}>Fetch</button>
      <button onClick={handleAsync}>setTimeout</button>
      <button onClick={handlePromise}>Promise</button>
    </div>
  )
}
```

### 自动批处理的性能提升

```tsx
// ✅ React 18：优化后的性能
function UserListOptimized() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  const loadUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users')
      const data = await response.json()

      // React 18 会自动批处理这三个更新
      setUsers(data)
      setSelectedUser(data[0])
      setLoading(false)
      // 只渲染 1 次！（React 18 之前是 3 次）
    } catch (err) {
      // 这两个更新也会被批处理
      setError(err)
      setLoading(false)
      // 只渲染 1 次！（React 18 之前是 2 次）
    }
  }

  return (
    <div>
      <button onClick={loadUsers}>加载用户</button>
      {loading && <div>加载中...</div>}
      {error && <div>错误：{error.message}</div>}
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

## 退出自动批处理（flushSync）

虽然自动批处理通常能提升性能，但有时我们需要立即获取更新后的状态并同步渲染。React 18 提供了 `flushSync` API 来退出批处理。

### flushSync 基本用法

```tsx
import { flushSync } from 'react-dom'

function FlushSyncExample() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  // ❌ 自动批处理：两次更新合并成一次渲染
  const handleClickWithoutFlush = () => {
    setCount(c => c + 1)
    setName('Alice')
    // 只渲染 1 次
  }

  // ✅ 使用 flushSync：强制立即渲染
  const handleClickWithFlush = () => {
    flushSync(() => {
      setCount(c => c + 1)
      // 立即渲染 1 次
    })

    console.log('count 已更新')

    flushSync(() => {
      setName('Alice')
      // 立即渲染 1 次
    })

    console.log('name 已更新')
    // 总共渲染 2 次
  }

  return (
    <div>
      <button onClick={handleClickWithoutFlush}>
        自动批处理（1次渲染）
      </button>
      <button onClick={handleClickWithFlush}>
        退出批处理（2次渲染）
      </button>
    </div>
  )
}
```

### flushSync 使用场景

```tsx
// 场景1：需要立即更新 DOM
function ScrollExample() {
  const [items, setItems] = useState([1, 2, 3])
  const listRef = useRef<HTMLUListElement>(null)

  const addItem = () => {
    const newItem = items.length + 1

    // ❌ 自动批处理：滚动可能失败
    setItems([...items, newItem])
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth'
    })
    // 滚动可能在 DOM 更新前执行

    // ✅ 使用 flushSync：确保先更新 DOM
    flushSync(() => {
      setItems([...items, newItem])
      // 立即渲染，DOM 已更新
    })

    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth'
    })
    // 现在滚动能正常工作
  }

  return (
    <div>
      <button onClick={addItem}>添加项目</button>
      <ul ref={listRef} style={{ height: 200, overflow: 'auto' }}>
        {items.map(item => <li key={item}>项目 {item}</li>)}
      </ul>
    </div>
  )
}

// 场景2：需要立即获取更新后的状态
function StateSyncExample() {
  const [count, setCount] = useState(0)
  const [doubled, setDoubled] = useState(0)

  const updateWithSync = () => {
    // ❌ 自动批处理：doubled 可能使用旧的 count
    setCount(c => c + 1)
    setDoubled(count * 2)  // 使用的是旧值！

    // ✅ 使用 flushSync：确保使用新值
    flushSync(() => {
      setCount(c => c + 1)
      // count 已更新
    })

    setDoubled(count * 2)  // 使用新值
  }

  return (
    <div>
      <button onClick={updateWithSync}>更新</button>
      <p>count: {count}</p>
      <p>doubled: {doubled}</p>
    </div>
  )
}

// 场景3：第三方库集成
function ThirdPartyLibExample() {
  const [data, setData] = useState([])
  const chartRef = useRef<any>(null)

  const updateChart = () => {
    const newData = fetchFromAPI()

    // ✅ 确保 DOM 更新后再更新图表
    flushSync(() => {
      setData(newData)
    })

    // 现在可以安全地更新第三方图表库
    chartRef.current?.update(newData)
  }

  return (
    <div>
      <button onClick={updateChart}>更新图表</button>
      <div ref={chartRef}>{/* 图表组件 */}</div>
    </div>
  )
}
```

### flushSync 的注意事项

```tsx
// ❌ 错误：嵌套使用 flushSync
function BadExample() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    flushSync(() => {
      setCount(c => c + 1)

      // ❌ 错误：不能嵌套 flushSync
      flushSync(() => {
        setCount(c => c + 1)
      })
    })
  }

  return <button onClick={handleClick}>点击</button>
}

// ❌ 错误：在 flushSync 中更新多个状态可能导致性能问题
function PerformanceIssue() {
  const [state1, setState1] = useState(0)
  const [state2, setState2] = useState(0)
  const [state3, setState3] = useState(0)

  const handleClick = () => {
    // ❌ 不推荐：每次 flushSync 都会触发一次渲染
    flushSync(() => setState1(1))  // 渲染 1
    flushSync(() => setState2(2))  // 渲染 2
    flushSync(() => setState3(3))  // 渲染 3

    // ✅ 推荐：让 React 自动批处理
    setState1(1)
    setState2(2)
    setState3(3)
    // 只渲染 1 次
  }

  return <button onClick={handleClick}>点击</button>
}

// ✅ 正确：只在必要时使用 flushSync
function GoodExample() {
  const [items, setItems] = useState([])
  const containerRef = useRef<HTMLDivElement>(null)

  const addItem = () => {
    const newItem = Date.now()

    // ✅ 只在需要立即访问 DOM 时使用
    flushSync(() => {
      setItems([...items, newItem])
    })

    // 现在可以安全地访问更新后的 DOM
    const newItemElement = containerRef.current?.lastElementChild
    newItemElement?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={containerRef}>
      {items.map(item => <div key={item}>{item}</div>)}
    </div>
  )
}
```

## 实战案例：对比批处理前后的性能差异

让我们创建一个完整的应用，展示自动批处理带来的性能提升。

```tsx
import { useState, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'

// ==================== 性能监控工具 ====================
function useRenderCount() {
  const renderCount = useRef(0)
  renderCount.current += 1
  return renderCount.current
}

// ==================== 批处理对比演示 ====================
interface Product {
  id: number
  name: string
  price: number
  category: string
  stock: number
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'iPhone 15 Pro', price: 7999, category: '手机', stock: 50 },
  { id: 2, name: 'MacBook Pro 14', price: 15999, category: '电脑', stock: 30 },
  { id: 3, name: 'AirPods Pro 2', price: 1899, category: '耳机', stock: 100 },
  { id: 4, name: 'iPad Air 5', price: 4799, category: '平板', stock: 60 },
  { id: 5, name: 'Apple Watch S9', price: 2999, category: '手表', stock: 40 },
  { id: 6, name: 'HomePod mini', price: 749, category: '音箱', stock: 80 }
]

// ==================== React 17 模式（不自动批处理） ====================
const React17StyleApp = () => {
  const [products, setProducts] = useState(PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<Record<number, number>>({})
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const renderCount = useRenderCount()

  // 模拟 React 17 的行为：不自动批处理
  const loadProducts = async () => {
    setLoading(true)  // 渲染 1
    setError(null)    // 渲染 2

    try {
      // 模拟 API 请求
      await new Promise(resolve => setTimeout(resolve, 1000))

      setProducts(PRODUCTS)     // 渲染 3
      setLoading(false)         // 渲染 4
      setSelectedCategory('all')// 渲染 5
      setSearchTerm('')         // 渲染 6
      // 总共 6 次渲染！
    } catch (err) {
      setError('加载失败')      // 渲染 3
      setLoading(false)         // 渲染 4
      // 总共 4 次渲染！
    }
  }

  const addToCart = (productId: number) => {
    setCart(prev => ({          // 渲染 1
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const filterProducts = (category: string) => {
    setSelectedCategory(category)// 渲染 1
    setSearchTerm('')            // 渲染 2
    setSortBy('name')             // 渲染 3
    // 总共 3 次渲染！
  }

  return (
    <div className="app">
      <div className="header">
        <h1>React 17 模式</h1>
        <div className="stats">
          <span>渲染次数：{renderCount}</span>
        </div>
      </div>

      <div className="controls">
        <button onClick={loadProducts} disabled={loading}>
          {loading ? '加载中...' : '重新加载'}
        </button>
        <button onClick={() => filterProducts('all')}>全部</button>
        <button onClick={() => filterProducts('手机')}>手机</button>
        <button onClick={() => filterProducts('电脑')}>电脑</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="products">
        {products
          .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
          .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>¥{product.price}</p>
              <p>库存：{product.stock}</p>
              <button onClick={() => addToCart(product.id)}>
                加入购物车 ({cart[product.id] || 0})
              </button>
            </div>
          ))}
      </div>
    </div>
  )
}

// ==================== React 18 模式（自动批处理） ====================
const React18StyleApp = () => {
  const [products, setProducts] = useState(PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<Record<number, number>>({})
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const renderCount = useRenderCount()

  // React 18：自动批处理所有更新
  const loadProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      // 模拟 API 请求
      await new Promise(resolve => setTimeout(resolve, 1000))

      // React 18 会自动批处理这四个更新
      setProducts(PRODUCTS)
      setLoading(false)
      setSelectedCategory('all')
      setSearchTerm('')
      // 只渲染 1 次！（React 17 会渲染 6 次）
    } catch (err) {
      // 这两个更新也会被批处理
      setError('加载失败')
      setLoading(false)
      // 只渲染 1 次！（React 17 会渲染 4 次）
    }
  }

  const addToCart = (productId: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const filterProducts = (category: string) => {
    // React 18 会自动批处理这三个更新
    setSelectedCategory(category)
    setSearchTerm('')
    setSortBy('name')
    // 只渲染 1 次！（React 17 会渲染 3 次）
  }

  return (
    <div className="app">
      <div className="header">
        <h1>React 18 模式</h1>
        <div className="stats">
          <span>渲染次数：{renderCount}</span>
        </div>
      </div>

      <div className="controls">
        <button onClick={loadProducts} disabled={loading}>
          {loading ? '加载中...' : '重新加载'}
        </button>
        <button onClick={() => filterProducts('all')}>全部</button>
        <button onClick={() => filterProducts('手机')}>手机</button>
        <button onClick={() => filterProducts('电脑')}>电脑</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="products">
        {products
          .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
          .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>¥{product.price}</p>
              <p>库存：{product.stock}</p>
              <button onClick={() => addToCart(product.id)}>
                加入购物车 ({cart[product.id] || 0})
              </button>
            </div>
          ))}
      </div>
    </div>
  )
}

// ==================== flushSync 演示 ====================
const FlushSyncDemo = () => {
  const [items, setItems] = useState([1, 2, 3])
  const [log, setLog] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const addWithBatching = () => {
    const newItem = items.length + 1
    setItems([...items, newItem])

    // 可能访问到旧 DOM
    const lastChild = containerRef.current?.lastElementChild
    setLog(prev => [
      ...prev,
      `添加项目 ${newItem}，最后一个元素：${lastChild?.textContent || '未找到'}`
    ])
  }

  const addWithFlushSync = () => {
    const newItem = items.length + 1

    // 强制立即更新 DOM
    flushSync(() => {
      setItems([...items, newItem])
    })

    // 保证访问到新 DOM
    const lastChild = containerRef.current?.lastElementChild
    setLog(prev => [
      ...prev,
      `添加项目 ${newItem}，最后一个元素：${lastChild?.textContent || '未找到'}`
    ])
  }

  const clearLog = () => setLog([])

  return (
    <div className="app">
      <div className="header">
        <h1>flushSync 演示</h1>
      </div>

      <div className="controls">
        <button onClick={addWithBatching}>自动批处理添加</button>
        <button onClick={addWithFlushSync}>flushSync 添加</button>
        <button onClick={clearLog}>清空日志</button>
      </div>

      <div className="log-container">
        <h3>操作日志：</h3>
        {log.map((entry, index) => (
          <div key={index} className="log-entry">{entry}</div>
        ))}
      </div>

      <div ref={containerRef} className="items-container">
        {items.map(item => (
          <div key={item} className="item">项目 {item}</div>
        ))}
      </div>
    </div>
  )
}

// ==================== 主应用 ====================
const BatchingDemo = () => {
  const [activeTab, setActiveTab] = useState<'react17' | 'react18' | 'flushsync'>('react18')

  return (
    <div className="batching-demo">
      <div className="tabs">
        <button
          className={activeTab === 'react17' ? 'active' : ''}
          onClick={() => setActiveTab('react17')}
        >
          React 17 模式
        </button>
        <button
          className={activeTab === 'react18' ? 'active' : ''}
          onClick={() => setActiveTab('react18')}
        >
          React 18 模式
        </button>
        <button
          className={activeTab === 'flushsync' ? 'active' : ''}
          onClick={() => setActiveTab('flushsync')}
        >
          flushSync 演示
        </button>
      </div>

      {activeTab === 'react17' && <React17StyleApp />}
      {activeTab === 'react18' && <React18StyleApp />}
      {activeTab === 'flushsync' && <FlushSyncDemo />}
    </div>
  )
}

export default BatchingDemo
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
  background-color: #f5f5f5;
  padding: 20px;
}

.batching-demo {
  max-width: 1200px;
  margin: 0 auto;
}

/* 标签页 */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs button {
  flex: 1;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.2s;
}

.tabs button:hover {
  background: #f5f5f5;
  border-color: #2196F3;
}

.tabs button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

/* 应用容器 */
.app {
  background: white;
  border-radius: 0 8px 8px 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #667eea;
}

.header h1 {
  color: #333;
  font-size: 28px;
}

.stats {
  display: flex;
  gap: 20px;
}

.stats span {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-weight: 600;
}

/* 控制按钮 */
.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.controls button {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button:hover:not(:disabled) {
  background: #1976D2;
  transform: translateY(-1px);
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 错误信息 */
.error {
  padding: 15px;
  background: #ffebee;
  color: #f44336;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: 500;
}

/* 产品网格 */
.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.product-card {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #2196F3;
}

.product-card h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 16px;
}

.product-card p {
  color: #666;
  margin: 5px 0;
  font-size: 14px;
}

.product-card button {
  width: 100%;
  margin-top: 15px;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 日志容器 */
.log-container {
  margin: 20px 0;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  max-height: 300px;
  overflow-y: auto;
}

.log-container h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 16px;
}

.log-entry {
  padding: 8px;
  margin: 5px 0;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #555;
  border-left: 3px solid #2196F3;
}

/* 项目容器 */
.items-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  min-height: 100px;
}

.item {
  padding: 10px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .products {
    grid-template-columns: 1fr;
  }

  .controls {
    flex-direction: column;
  }

  .controls button {
    width: 100%;
  }
}
```

## 批处理最佳实践

### 1. 依赖自动批处理

```tsx
// ✅ 推荐：让 React 自动批处理
function GoodExample() {
  const [state1, setState1] = useState(0)
  const [state2, setState2] = useState(0)
  const [state3, setState3] = useState(0)

  const handleClick = () => {
    setState1(1)
    setState2(2)
    setState3(3)
    // React 会自动批处理，只渲染 1 次
  }

  return <button onClick={handleClick}>点击</button>
}
```

### 2. 只在必要时使用 flushSync

```tsx
// ✅ 正确：只在需要立即访问 DOM 时使用
function ScrollToBottom() {
  const [messages, setMessages] = useState([])
  const containerRef = useRef<HTMLDivElement>(null)

  const addMessage = (message: string) => {
    flushSync(() => {
      setMessages([...messages, message])
    })
    // 立即滚动到底部
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }

  return (
    <div ref={containerRef} style={{ height: 300, overflow: 'auto' }}>
      {messages.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}
    </div>
  )
}
```

### 3. 避免过度使用 flushSync

```tsx
// ❌ 不推荐：过度使用 flushSync
function BadExample() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  const handleClick = () => {
    // 不必要的 flushSync
    flushSync(() => setCount(1))
    flushSync(() => setName('Alice'))
    // 导致 2 次渲染，性能下降
  }

  return <button onClick={handleClick}>点击</button>
}

// ✅ 推荐：让 React 自动批处理
function GoodExample() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  const handleClick = () => {
    setCount(1)
    setName('Alice')
    // 只渲染 1 次
  }

  return <button onClick={handleClick}>点击</button>
}
```

## 总结

本章我们学习了：

✅ 批处理的定义和工作原理
✅ React 18 之前的批处理限制
✅ React 18 的自动批处理特性
✅ 使用 flushSync 退出批处理
✅ 批处理的性能对比
✅ 实战案例：对比批处理前后的性能差异
✅ 批处理最佳实践

**自动批处理带来的好处：**

| 场景 | React 17 渲染次数 | React 18 渲染次数 | 性能提升 |
|------|------------------|------------------|---------|
| 异步数据加载 | 5-6 次 | 1 次 | ⭐⭐⭐⭐⭐ |
| 多状态更新 | 3 次 | 1 次 | ⭐⭐⭐⭐ |
| Promise 回调 | 2 次 | 1 次 | ⭐⭐⭐ |

**下一步：** 第69章将学习 Suspense 与数据获取，掌握 React 18 的异步渲染机制。
