# ：React性能优化完全指南

## 性能优化的重要性

### 为什么需要性能优化？

React 性能问题通常表现为：
- 页面卡顿、滚动不流畅
- 输入框延迟响应
- 组件不必要的重复渲染
- 内存泄漏导致页面崩溃
- 首屏加载时间长

### 性能优化方向

| 优化方向 | 影响范围 | 难度 | 收益 |
|---------|---------|------|------|
| 减少渲染 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 虚拟化长列表 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 代码分割 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Memo优化 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Hook优化 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## 渲染性能优化

### 理解React渲染机制

```tsx
import { useState, useEffect } from 'react'

// ❌ 问题代码：父组件渲染导致子组件不必要的渲染
const ParentComponent = () => {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('张三')

  // 当 count 改变时，ExpensiveChild 也会重新渲染
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>计数：{count}</button>
      <ExpensiveChild name={name} />
    </div>
  )
}

const ExpensiveChild = ({ name }: { name: string }) => {
  console.log('ExpensiveChild 渲染了')
  // 假设这里有复杂的计算
  const result = performExpensiveCalculation(name)
  return <div>{result}</div>
}

// ✅ 优化方案1：使用 React.memo
const OptimizedChild = React.memo(({ name }: { name: string }) => {
  console.log('OptimizedChild 渲染了')
  const result = performExpensiveCalculation(name)
  return <div>{result}</div>
})

// ✅ 优化方案2：拆分状态
const OptimizedParent = () => {
  const [count, setCount] = useState(0)
  // 将不相关的状态移到子组件内部
  return (
    <div>
      <Counter count={count} onIncrement={() => setCount(count + 1)} />
      <ChildWithOwnState />
    </div>
  )
}
```

### React.memo 使用

```tsx
import React from 'react'

// ✅ 基础用法
const MyComponent = React.memo(({ name }: { name: string }) => {
  return <div>Hello, {name}</div>
})

// ✅ 自定义比较函数
const CustomMemoComponent = React.memo(
  ({ user, onUpdate }: { user: User; onUpdate: () => void }) => {
    return (
      <div>
        <h3>{user.name}</h3>
        <button onClick={onUpdate}>更新</button>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // 返回 true 表示 props 相等，不需要重新渲染
    // 返回 false 表示 props 不同，需要重新渲染
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.name === nextProps.user.name &&
      prevProps.onUpdate === nextProps.onUpdate
    )
  }
)

// ❌ 错误：每次都创建新函数
const BadExample = () => {
  const [count, setCount] = useState(0)

  return (
    <MemoComponent
      data={someData}
      onClick={() => console.log(count)} // 每次渲染都是新函数
    />
  )
}

// ✅ 正确：使用 useCallback
const GoodExample = () => {
  const [count, setCount] = useState(0)

  const handleClick = useCallback(() => {
    console.log(count)
  }, [count])

  return <MemoComponent data={someData} onClick={handleClick} />
}

// ✅ 注意：React.memo 是浅比较
const ProductCard = React.memo(({ product }: { product: Product }) => {
  return <div>{product.name}</div>
})

// ❌ 问题：如果 product 是对象，每次传入新对象都会重新渲染
const App = () => {
  const products = useProducts()

  return (
    <div>
      {products.map(p => (
        <ProductCard key={p.id} product={{ ...p }} /> {/* 每次都是新对象！ */}
      ))}
    </div>
  )
}

// ✅ 正确：直接传递原始引用
const App = () => {
  const products = useProducts()

  return (
    <div>
      {products.map(p => (
        <ProductCard key={p.id} product={p} /> {/* 直接传递引用 */}
      ))}
    </div>
  )
}
```

### useMemo 使用

```tsx
import { useMemo } from 'react'

// ❌ 问题：每次渲染都重新计算
const ExpensiveComponent = ({ items, filter }: { items: Item[]; filter: string }) => {
  // 每次渲染都会执行这个昂贵的计算
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  )

  const sortedItems = filteredItems.sort((a, b) =>
    a.price - b.price
  )

  return <div>{/* ... */}</div>
}

// ✅ 优化：使用 useMemo 缓存计算结果
const OptimizedComponent = ({ items, filter }: { items: Item[]; filter: string }) => {
  // 只有当 items 或 filter 改变时才重新计算
  const filteredAndSortedItems = useMemo(() => {
    console.log('重新计算过滤和排序')
    return items
      .filter(item =>
        item.name.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => a.price - b.price)
  }, [items, filter])

  return (
    <div>
      {filteredAndSortedItems.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}

// ✅ 适用场景
const scenarios = {
  // 1. 昂贵的计算
  expensiveCalculation: useMemo(() => {
    return fibonacci(1000)
  }, [n]),

  // 2. 引用相等性（避免子组件不必要的渲染）
  memoizedObject: useMemo(() => ({
    id: userId,
    name: userName,
    email: userEmail
  }), [userId, userName, userEmail]),

  // 3. 避免复杂的依赖数组
  complexDeps: useMemo(() => {
    return processItems(data, options)
  }, [data.id, options.sort]) // 只依赖必要的属性
}

// ❌ 不要过度使用 useMemo
const BadUseMemo = () => {
  // 简单计算不需要 memoize
  const double = useMemo(() => count * 2, [count])

  // 字符串拼接不需要 memoize
  const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName])

  return <div>{double} - {fullName}</div>
}

// ✅ 直接计算反而更高效
const GoodDirect = ({ count, firstName, lastName }) => {
  return <div>{count * 2} - {firstName} {lastName}</div>
}
```

### useCallback 使用

```tsx
import { useCallback } from 'react'

// ❌ 问题：每次渲染都创建新函数
const ParentComponent = () => {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(count + 1)
  }

  return <ChildComponent onClick={handleClick} />
}

// ✅ 优化：使用 useCallback
const OptimizedParent = () => {
  const [count, setCount] = useState(0)

  // 只有当 count 改变时才创建新函数
  const handleClick = useCallback(() => {
    setCount(count + 1)
  }, [count])

  return <ChildComponent onClick={handleClick} />
}

// ✅ 最佳实践：传递给被 React.memo 包裹的子组件
const MemoizedChild = React.memo(({ onAction, data }: Props) => {
  return <button onClick={onAction}>{data.name}</button>
})

const Parent = () => {
  const [items, setItems] = useState([])

  // ✅ 使用 useCallback 确保函数引用稳定
  const handleItemClick = useCallback((id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, active: !item.active } : item
    ))
  }, [])

  return (
    <div>
      {items.map(item => (
        <MemoizedChild
          key={item.id}
          data={item}
          onAction={() => handleItemClick(item.id)}
        />
      ))}
    </div>
  )
}

// ✅ 事件处理函数的正确使用
const EventHandlers = () => {
  const [state, setState] = useState(initialState)

  // ✅ 不依赖 state 的函数
  const handleSubmit = useCallback(() => {
    submitForm()
  }, []) // 空依赖数组，函数永远不会改变

  // ✅ 需要访问最新 state 的函数
  const handleUpdate = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      count: prevState.count + 1 // 使用函数形式确保获取最新值
    }))
  }, []) // 不依赖 state

  // ✅ 需要依赖外部变量的函数
  const handleFilter = useCallback((id: string) => {
    items.filter(item => item.id === id) // 依赖外部 items
  }, [items]) // 正确的依赖

  return <form onSubmit={handleSubmit}>...</form>
}

// ❌ 常见错误：不必要的 useCallback
const UnnecessaryCallback = () => {
  // ❌ 子组件没有被 memoize，useCallback 没有意义
  const handleClick = useCallback(() => {
    console.log('click')
  }, [])

  return <button onClick={handleClick}>Click</button>
}

// ✅ 直接内联函数即可
const DirectFunction = () => {
  return <button onClick={() => console.log('click')}>Click</button>
}
```

## 虚拟化长列表

### 为什么需要虚拟化？

```tsx
// ❌ 问题：渲染10000条数据导致页面卡顿
const BadList = () => {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `This is item ${i}`
  }))

  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      {items.map(item => (
        <div key={item.id} style={{ height: '50px' }}>
          {item.name} - {item.description}
        </div>
      ))}
    </div>
  )
}

// ✅ 解决方案：使用 react-window 虚拟化
import { FixedSizeList } from 'react-window'

const GoodList = () => {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `This is item ${i}`
  }))

  // 只渲染可见区域的项
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index]
    return (
      <div style={style}>
        {item.name} - {item.description}
      </div>
    )
  }

  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemSize={50}
      itemCount={items.length}
    >
      {Row}
    </FixedSizeList>
  )
}
```

### react-window 安装和基础使用

```bash
npm install react-window
npm install react-window-debugger  # 可选：用于调试
```

```tsx
import { FixedSizeList, VariableSizeList } from 'react-window'

// ✅ 固定高度列表
const FixedHeightList = () => {
  const items = generateItems(10000)

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    return (
      <div style={style} className="list-item">
        <span>{items[index].id}</span>
        <span>{items[index].name}</span>
        <span>{items[index].price}</span>
      </div>
    )
  }

  return (
    <FixedSizeList
      height={600}
      width="100%"
      itemSize={80}
      itemCount={items.length}
      itemKey={index => items[index].id} // 自定义 key
    >
      {Row}
    </FixedSizeList>
  )
}

// ✅ 可变高度列表
const VariableHeightList = () => {
  const items = generateItems(1000)

  // 获取每个项目的高度
  const getItemSize = (index: number) => {
    // 根据内容动态返回高度
    return items[index].expanded ? 150 : 80
  }

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    return (
      <div style={style} className="variable-item">
        <h3>{items[index].title}</h3>
        <p>{items[index].content}</p>
      </div>
    )
  }

  return (
    <VariableSizeList
      height={600}
      width="100%"
      itemCount={items.length}
      itemSize={getItemSize}
    >
      {Row}
    </VariableSizeList>
  )
}

// ✅ 横向滚动列表
const HorizontalList = () => {
  const items = generateItems(100)

  const Column = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    return (
      <div style={style} className="column-item">
        {items[index].name}
      </div>
    )
  }

  return (
    <FixedSizeList
      height={200}
      width="100%"
      itemSize={150}
      itemCount={items.length}
      layout="horizontal" // 横向布局
    >
      {Column}
    </FixedSizeList>
  )
}
```

### react-window 高级用法

```tsx
import { FixedSizeGrid, areEqual } from 'react-window'

// ✅ 二维网格
const DataGrid = () => {
  const columns = 10
  const rows = 100
  const cellWidth = 120
  const cellHeight = 50

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    return (
      <div style={style} className="grid-cell">
        Cell {rowIndex},{columnIndex}
      </div>
    )
  }

  return (
    <FixedSizeGrid
      columnCount={columns}
      columnWidth={cellWidth}
      height={500}
      rowCount={rows}
      rowHeight={cellHeight}
      width={800}
    >
      {Cell}
    </FixedSizeGrid>
  )
}

// ✅ 带状态的虚拟化列表
const InteractiveList = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const items = generateItems(10000)

  // 使用 areEqual 优化渲染
  const MemoizedRow = React.memo(({ index, style, data }: any) => {
    const item = data.items[index]
    const isSelected = data.selectedId === item.id

    return (
      <div
        style={{
          ...style,
          backgroundColor: isSelected ? '#e3f2fd' : 'white'
        }}
        onClick={() => data.onSelect(item.id)}
        className="interactive-row"
      >
        <input type="checkbox" checked={isSelected} readOnly />
        <span>{item.name}</span>
        <span>{item.price}</span>
      </div>
    )
  }, areEqual)

  return (
    <FixedSizeList
      height={600}
      width="100%"
      itemSize={60}
      itemCount={items.length}
      itemData={{
        items,
        selectedId,
        onSelect: setSelectedId
      }}
    >
      {MemoizedRow}
    </FixedSizeList>
  )
}

// ✅ 无限滚动加载
const InfiniteScrollList = () => {
  const [items, setItems] = useState(() => generateItems(50))
  const [isLoading, setIsLoading] = useState(false)
  const listRef = useRef<FixedSizeList>(null)

  const loadMore = useCallback(() => {
    if (isLoading) return

    setIsLoading(true)
    setTimeout(() => {
      setItems(prev => [
        ...prev,
        ...generateItems(50, prev.length)
      ])
      setIsLoading(false)
    }, 1000)
  }, [isLoading])

  const isItemLoaded = (index: number) => !!items[index]

  const Item = ({ index, style }: any) => {
    if (!isItemLoaded(index)) {
      return (
        <div style={style} className="loading-item">
          加载中...
        </div>
      )
    }

    return (
      <div style={style} className="list-item">
        {items[index].name}
      </div>
    )
  }

  return (
    <div>
      <FixedSizeList
        ref={listRef}
        height={600}
        width="100%"
        itemSize={60}
        itemCount={items.length + 1} // +1 for loading indicator
        onItemsRendered={({ visibleStopIndex }) => {
          // 当滚动到接近底部时加载更多
          if (visibleStopIndex >= items.length - 10) {
            loadMore()
          }
        }}
      >
        {Item}
      </FixedSizeList>
      {isLoading && <div className="loading-more">加载更多...</div>}
    </div>
  )
}
```

### react-virtuoso（更强大的替代方案）

```bash
npm install react-virtuoso
```

```tsx
import { Virtuoso } from 'react-virtuoso'

// ✅ react-virtuoso 更简单的 API
const VirtuosoList = () => {
  const [items, setItems] = useState(() => generateItems(10000))

  return (
    <Virtuoso
      style={{ height: '600px' }}
      data={items}
      itemContent={(index, item) => (
        <div className="virtuoso-item">
          <span>{item.id}</span>
          <span>{item.name}</span>
          <span>{item.price}</span>
        </div>
      )}
      components={{
        Footer: () => <div>共 {items.length} 项</div>
      }}
    />
  )
}

// ✅ 带分组的虚拟列表
const GroupedList = () => {
  const groupCounts = [10, 20, 15, 25, 30]
  const totalItems = groupCounts.reduce((a, b) => a + b, 0)

  return (
    <Virtuoso
      style={{ height: '600px' }}
      totalCount={totalItems}
      groupCounts={groupCounts}
      groupContent={(index) => (
        <div className="group-header">分组 {index + 1}</div>
      )}
      itemContent={(index) => (
        <div className="item">项目 {index + 1}</div>
      )}
    />
  )
}

// ✅ 自动调整高度的列表
const AutoHeightList = () => {
  return (
    <Virtuoso
      data={items}
      itemContent={(index, item) => (
        <div style={{ minHeight: item.height }}>
          {item.content}
        </div>
      )}
    />
  )
}
```

## 代码分割和懒加载

### React.lazy 和 Suspense

```tsx
import { lazy, Suspense } from 'react'

// ❌ 问题：所有组件一次性加载
import HeavyComponent from './HeavyComponent'
import AnotherHeavyComponent from './AnotherHeavyComponent'

const App = () => {
  return (
    <div>
      <HeavyComponent />
      <AnotherHeavyComponent />
    </div>
  )
}

// ✅ 优化：使用 React.lazy 懒加载
const HeavyComponent = lazy(() => import('./HeavyComponent'))
const AnotherHeavyComponent = lazy(() => import('./AnotherHeavyComponent'))

const App = () => {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <HeavyComponent />
      <AnotherHeavyComponent />
    </Suspense>
  )
}

// ✅ 路由级别的代码分割
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Products = lazy(() => import('./pages/Products'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

// ✅ 带错误边界的懒加载
import { ErrorBoundary } from 'react-error-boundary'

const LazyComponent = lazy(() => import('./LazyComponent'))

const App = () => {
  return (
    <ErrorBoundary
      fallback={
        <div>
          <h2>加载失败</h2>
          <button onClick={() => window.location.reload()}>重试</button>
        </div>
      }
    >
      <Suspense fallback={<LoadingSpinner />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

### 基于路由的代码分割

```tsx
// ✅ 完整的路由懒加载实现
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// 懒加载页面组件
const HomePage = lazy(() => import('@/pages/HomePage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'))
const OrderHistoryPage = lazy(() => import('@/pages/OrderHistoryPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// 加载组件
const PageLoader = () => (
  <div className="page-loader">
    <div className="spinner"></div>
    <p>加载中...</p>
  </div>
)

// 带布局的页面包装器
const withLayout = (Component: React.ComponentType) => {
  return () => (
    <Layout>
      <Component />
    </Layout>
  )
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 公开页面 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* 产品相关 */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          {/* 需要登录的页面 */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />

          {/* 404 */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### 组件级别的代码分割

```tsx
// ✅ 按需加载模态框
const ModalManager = () => {
  const [modalType, setModalType] = useState<string | null>(null)

  const LoginModal = lazy(() => import('./modals/LoginModal'))
  const RegisterModal = lazy(() => import('./modals/RegisterModal'))
  const ContactModal = lazy(() => import('./modals/ContactModal'))

  return (
    <>
      <button onClick={() => setModalType('login')}>登录</button>
      <button onClick={() => setModalType('register')}>注册</button>
      <button onClick={() => setModalType('contact')}>联系我们</button>

      <Suspense fallback={<ModalLoader />}>
        {modalType === 'login' && <LoginModal onClose={() => setModalType(null)} />}
        {modalType === 'register' && <RegisterModal onClose={() => setModalType(null)} />}
        {modalType === 'contact' && <ContactModal onClose={() => setModalType(null)} />}
      </Suspense>
    </>
  )
}

// ✅ 条件加载重型组件
const DataVisualization = () => {
  const [showChart, setShowChart] = useState(false)

  const HeavyChart = lazy(() => import('./HeavyChart'))

  return (
    <div>
      <button onClick={() => setShowChart(true)}>
        显示数据图表
      </button>

      {showChart && (
        <Suspense fallback={<div>加载图表组件...</div>}>
          <HeavyChart data={largeDataSet} />
        </Suspense>
      )}
    </div>
  )
}

// ✅ 预加载策略
const usePreloadComponent = (importFn: () => Promise<any>) => {
  const [component, setComponent] = useState<React.ComponentType | null>(null)

  const preload = useCallback(() => {
    importFn().then(module => {
      setComponent(() => module.default)
    })
  }, [importFn])

  return { component, preload }
}

// 使用预加载
const Navigation = () => {
  const HomePage = lazy(() => import('./pages/HomePage'))
  const AboutPage = lazy(() => import('./pages/AboutPage'))

  const { component: preloadHome, preload: preloadHomePage } = usePreloadComponent(
    () => import('./pages/HomePage')
  )

  return (
    <nav>
      <Link
        to="/"
        onMouseEnter={preloadHomePage} // 鼠标悬停时预加载
      >
        首页
      </Link>
      <Link to="/about">关于</Link>
    </nav>
  )
}
```

## 实战案例：性能优化前后对比

### 场景：电商产品列表

```tsx
// ==================== 优化前的代码 ====================
import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: string
}

const ProductListBad = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState('name')
  const [cart, setCart] = useState<string[]>([])

  // ❌ 每次渲染都重新计算
  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price') return a.price - b.price
      return a.name.localeCompare(b.name)
    })

  // ❌ 每次渲染都创建新函数
  const addToCart = (productId: string) => {
    setCart([...cart, productId])
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(id => id !== productId))
  }

  useEffect(() => {
    // 模拟获取数据
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
  }, [])

  // ❌ 没有虚拟化，渲染大量产品
  return (
    <div className="product-list">
      <div className="controls">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="搜索产品..."
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">按名称排序</option>
          <option value="price">按价格排序</option>
        </select>
      </div>

      <div className="products">
        {filteredProducts.map(product => (
          <ProductCardBad
            key={product.id}
            product={product}
            onAdd={addToCart}
            onRemove={removeFromCart}
            isInCart={cart.includes(product.id)}
          />
        ))}
      </div>

      <div className="cart">
        <h3>购物车 ({cart.length})</h3>
      </div>
    </div>
  )
}

const ProductCardBad = ({ product, onAdd, onRemove, isInCart }: any) => {
  // ❌ 每次父组件渲染都会重新渲染
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p className="price">¥{product.price}</p>
      <button onClick={() => onAdd(product.id)}>
        {isInCart ? '已在购物车' : '加入购物车'}
      </button>
    </div>
  )
}

// ==================== 优化后的代码 ====================
import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { FixedSizeList } from 'react-window'

const ProductListGood = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState('name')
  const [cart, setCart] = useState<Set<string>>(new Set())

  // ✅ 使用 useMemo 缓存过滤和排序结果
  const filteredAndSortedProducts = useMemo(() => {
    console.log('重新计算产品列表')

    return products
      .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'price') return a.price - b.price
        return a.name.localeCompare(b.name)
      })
  }, [products, filter, sort])

  // ✅ 使用 useCallback 稳定函数引用
  const addToCart = useCallback((productId: string) => {
    setCart(prev => new Set(prev).add(productId))
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  }, [])

  const toggleCart = useCallback((productId: string) => {
    setCart(prev => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }, [])

  // ✅ 使用 useMemo 缓存计算值
  const cartCount = useMemo(() => cart.size, [cart])

  // ✅ 使用虚拟化列表
  const Row = useCallback(({ index, style, data }: any) => {
    const product = data.products[index]
    return (
      <div style={style}>
        <ProductCardGood
          product={product}
          onToggle={data.onToggle}
          isInCart={data.cart.has(product.id)}
        />
      </div>
    )
  }, [])

  // ✅ 懒加载产品详情
  const ProductDetail = useMemo(() =>
    lazy(() => import('./ProductDetail')),
    []
  )

  return (
    <div className="product-list">
      <div className="controls">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="搜索产品..."
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">按名称排序</option>
          <option value="price">按价格排序</option>
        </select>
      </div>

      <div className="products">
        <FixedSizeList
          height={800}
          width="100%"
          itemSize={350}
          itemCount={filteredAndSortedProducts.length}
          itemData={{
            products: filteredAndSortedProducts,
            onToggle: toggleCart,
            cart
          }}
        >
          {Row}
        </FixedSizeList>
      </div>

      <div className="cart">
        <h3>购物车 ({cartCount})</h3>
      </div>
    </div>
  )
}

// ✅ 使用 memo 优化子组件
const ProductCardGood = memo(({ product, onToggle, isInCart }: {
  product: Product
  onToggle: (id: string) => void
  isInCart: boolean
}) => {
  // ✅ 只有当 product 或 isInCart 改变时才重新渲染
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} loading="lazy" />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p className="price">¥{product.price}</p>
      <button onClick={() => onToggle(product.id)}>
        {isInCart ? '从购物车移除' : '加入购物车'}
      </button>
    </div>
  )
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.isInCart === nextProps.isInCart
  )
})

// ==================== 性能测试工具 ====================
const PerformanceTest = () => {
  const [renderCount, setRenderCount] = useState(0)

  useEffect(() => {
    setRenderCount(1)
  })

  return (
    <div className="performance-info">
      <p>渲染次数: {renderCount}</p>
      <p>使用 React DevTools Profiler 查看详细性能</p>
    </div>
  )
}
```

### 配套样式

```css
/* ==================== 产品列表样式 ==================== */
.product-list {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.controls input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.controls input:focus {
  outline: none;
  border-color: #2196F3;
}

.controls select {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  background: white;
}

.products {
  min-height: 800px;
}

/* 产品卡片 */
.product-card {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 20px;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.product-card h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 20px;
}

.product-card p {
  color: #666;
  line-height: 1.6;
  margin: 10px 0;
}

.product-card .price {
  font-size: 24px;
  font-weight: 700;
  color: #f44336;
  margin: 15px 0;
}

.product-card button {
  width: 100%;
  padding: 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.product-card button:hover {
  background: #1976D2;
}

/* 购物车 */
.cart {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 250px;
}

.cart h3 {
  margin: 0 0 15px 0;
  color: #333;
}

/* 性能信息 */
.performance-info {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 15px;
  background: rgba(33, 150, 243, 0.9);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
}

/* 加载状态 */
.page-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-list {
    padding: 10px;
  }

  .controls {
    flex-direction: column;
  }

  .product-card {
    padding: 15px;
  }

  .cart {
    bottom: 10px;
    right: 10px;
    left: 10px;
  }

  .performance-info {
    top: 10px;
    left: 10px;
    right: 10px;
  }
}
```

## 性能优化清单

### 渲染优化
- ✅ 使用 React.memo 包装纯展示组件
- ✅ 使用 useMemo 缓存昂贵的计算
- ✅ 使用 useCallback 稳定事件处理函数
- ✅ 拆分状态，避免不必要的渲染
- ✅ 使用 useState 的函数式更新

### 虚拟化
- ✅ 长列表使用 react-window 或 react-virtuoso
- ✅ 图片使用 lazy loading
- ✅ 实现无限滚动加载
- ✅ 避免一次性渲染大量数据

### 代码分割
- ✅ 路由级别的代码分割
- ✅ 重型组件懒加载
- ✅ 模态框按需加载
- ✅ 实现组件预加载策略

### 其他优化
- ✅ 使用 Web Workers 处理复杂计算
- ✅ 防抖和节流用户输入
- ✅ 虚拟滚动（virtual scrolling）
- ✅ 图片优化和压缩
- ✅ 使用 React DevTools Profiler 分析性能

## 总结

本章我们学习了：

✅ React 渲染性能优化（React.memo、useMemo、useCallback）
✅ 虚拟化长列表（react-window、react-virtuoso）
✅ 代码分割和懒加载（React.lazy、Suspense）
✅ 实战案例：性能优化前后对比
✅ 性能优化清单和最佳实践

**性能优化的黄金法则：**

1. **先测量，后优化** - 使用 Profiler 找出真正的性能瓶颈
2. **不要过早优化** - 只优化真正影响用户体验的部分
3. **保持简单** - 简单的代码往往性能更好
4. **权衡取舍** - 性能 vs 可维护性，找到平衡点

**性能提升效果对比：**

| 优化技术 | 性能提升 | 适用场景 |
|---------|---------|---------|
| React.memo | 30-50% | 纯展示组件 |
| useMemo | 20-40% | 昂贵计算 |
| react-window | 80-95% | 长列表（1000+项） |
| 代码分割 | 50-70% | 首屏加载时间 |
| 综合优化 | 70-90% | 大型应用 |

**下一步：** 第78章将学习 React 组件设计模式，掌握高级组件架构技巧。
