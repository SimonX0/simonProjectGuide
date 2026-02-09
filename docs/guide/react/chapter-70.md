# ：useTransition与useDeferredValue

## useTransition 基础用法

useTransition 是 React 18 引入的一个重要 Hook，它允许你将某些状态更新标记为"过渡"（transitions），从而让 React 优先处理更紧急的更新（如输入、点击等）。

### 什么是过渡（Transition）

```tsx
// ❌ 问题：搜索输入卡顿
function SearchWithoutTransition() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)  // 紧急更新：用户输入

    // 模拟昂贵的搜索操作
    const filtered = heavySearchComputation(value)
    setResults(filtered)  // 这个更新会阻塞输入！
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      <ResultsList results={results} />
    </div>
  )
}

// ✅ 解决：使用 useTransition
function SearchWithTransition() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // 紧急更新：立即更新输入框
    setQuery(value)

    // 非紧急更新：使用 transition
    startTransition(() => {
      const filtered = heavySearchComputation(value)
      setResults(filtered)  // 这会被延迟处理，不会阻塞输入
    })
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <div>搜索中...</div>}
      <ResultsList results={results} />
    </div>
  )
}
```

### useTransition 语法

```tsx
const [isPending, startTransition] = useTransition()

// isPending: boolean - 是否有过渡正在执行
// startTransition: function - 用于标记非紧急更新的函数

// 基本用法
startTransition(() => {
  setState(newValue)  // 这个更新会被标记为过渡
})

// 紧急更新 vs 非紧急更新
function Example() {
  const [isPending, startTransition] = useTransition()
  const [inputValue, setInputValue] = useState('')
  const [list, setList] = useState([])

  const handleChange = (e) => {
    // ✅ 紧急更新：立即执行
    setInputValue(e.target.value)

    // ✅ 非紧急更新：延迟执行
    startTransition(() => {
      setList(filterList(e.target.value))
    })
  }

  return (
    <div>
      <input value={inputValue} onChange={handleChange} />
      {isPending ? <Spinner /> : <List items={list} />}
    </div>
  )
}
```

### useTransition 使用场景

```tsx
// 场景1：搜索过滤
function SearchFilter() {
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState('')
  const [items] = useState(largeItemList)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // 紧急：更新输入框
    setFilter(value)

    // 非紧急：过滤列表
    startTransition(() => {
      setFilteredItems(items.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      ))
    })
  }

  return (
    <div>
      <input value={filter} onChange={handleChange} />
      {isPending && <div>过滤中...</div>}
      <ItemList items={filteredItems} />
    </div>
  )
}

// 场景2：标签页切换
function Tabs() {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState('home')
  const [tabContent, setTabContent] = useState(null)

  const switchTab = (tabId: string) => {
    // 立即切换标签（更新 UI）
    setActiveTab(tabId)

    // 延迟加载内容
    startTransition(() => {
      const content = loadTabContent(tabId)
      setTabContent(content)
    })
  }

  return (
    <div>
      <div className="tabs">
        <TabButton active={activeTab === 'home'} onClick={() => switchTab('home')}>
          首页
        </TabButton>
        <TabButton active={activeTab === 'about'} onClick={() => switchTab('about')}>
          关于
        </TabButton>
        <TabButton active={activeTab === 'contact'} onClick={() => switchTab('contact')}>
          联系
        </TabButton>
      </div>

      {isPending ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="content">{tabContent}</div>
      )}
    </div>
  )
}

// 场景3：分页
function Pagination() {
  const [isPending, startTransition] = useTransition()
  const [page, setPage] = useState(1)
  const [data, setData] = useState([])

  const changePage = (newPage: number) => {
    // 立即更新页码
    setPage(newPage)

    // 延迟加载数据
    startTransition(async () => {
      const newData = await fetchPageData(newPage)
      setData(newData)
    })
  }

  return (
    <div>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => changePage(page - 1)}>
          上一页
        </button>
        <span>第 {page} 页</span>
        <button onClick={() => changePage(page + 1)}>
          下一页
        </button>
      </div>

      {isPending ? (
        <div>加载中...</div>
      ) : (
        <DataTable data={data} />
      )}
    </div>
  )
}
```

## useTransition 更新优先级

React 18 引入了并发渲染，可以根据更新的优先级来决定渲染顺序。useTransition 就是利用这个特性来管理更新优先级的。

### 紧急更新 vs 非紧急更新

```tsx
// 紧急更新：直接调用 setState
function UrgentUpdate() {
  const [value, setValue] = useState('')

  const handleChange = (e) => {
    setValue(e.target.value)  // 紧急更新：立即执行
  }

  return <input value={value} onChange={handleChange} />
}

// 非紧急更新：使用 startTransition 包裹
function NonUrgentUpdate() {
  const [value, setValue] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleChange = (e) => {
    setValue(e.target.value)  // 紧急

    startTransition(() => {
      // 这里所有的 setState 都是非紧急的
      setFilteredData(filterData(e.target.value))
      setStats(calculateStats(e.target.value))
    })
  }

  return (
    <div>
      <input value={value} onChange={handleChange} />
      {isPending && <Spinner />}
    </div>
  )
}
```

### 优先级对比示例

```tsx
// ❌ 没有 useTransition：所有更新都是紧急的
function WithoutPriority() {
  const [text, setText] = useState('')
  const [results, setResults] = useState([])

  const handleChange = (e) => {
    const value = e.target.value

    // 这两个更新都是紧急的，会互相竞争
    setText(value)
    setResults(expensiveFilter(value))  // 阻塞输入
  }

  return (
    <div>
      <input value={text} onChange={handleChange} placeholder="输入会卡顿" />
      <ResultsList results={results} />
    </div>
  )
}

// ✅ 使用 useTransition：区分优先级
function WithPriority() {
  const [text, setText] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  const handleChange = (e) => {
    const value = e.target.value

    // 高优先级：立即更新输入框
    setText(value)

    // 低优先级：延迟过滤结果
    startTransition(() => {
      setResults(expensiveFilter(value))
    })
  }

  return (
    <div>
      <input value={text} onChange={handleChange} placeholder="流畅输入" />
      {isPending ? <div>计算中...</div> : <ResultsList results={results} />}
    </div>
  )
}
```

### 多个过渡的状态

```tsx
// 处理多个独立的过渡
function MultipleTransitions() {
  const [isSearchPending, startSearchTransition] = useTransition()
  const [isFilterPending, startFilterTransition] = useTransition()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [results, setResults] = useState([])
  const [categories, setCategories] = useState([])

  const handleSearch = (value: string) => {
    setQuery(value)
    startSearchTransition(() => {
      const results = performSearch(value)
      setResults(results)
    })
  }

  const handleFilter = (category: string) => {
    setFilter(category)
    startFilterTransition(() => {
      const filtered = filterByCategory(results, category)
      setCategories(filtered)
    })
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索..."
      />
      {isSearchPending && <div>搜索中...</div>}

      <select value={filter} onChange={(e) => handleFilter(e.target.value)}>
        <option value="all">全部</option>
        <option value="electronics">电子产品</option>
        <option value="clothing">服装</option>
      </select>
      {isFilterPending && <div>过滤中...</div>}

      <CategoryList categories={categories} />
    </div>
  )
}
```

## useDeferredValue 延迟值

useDeferredValue 是另一个用于性能优化的 Hook，它允许你延迟更新某个值，直到有更空闲的时间。

### useDeferredValue 基本用法

```tsx
import { useDeferredValue } from 'react'

// 语法
const deferredValue = useDeferredValue(value)

// 示例1：延迟搜索查询
function SearchWithDeferred() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const results = useMemo(() => {
    return expensiveSearch(deferredQuery)
  }, [deferredQuery])

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ResultsList results={results} />
    </div>
  )
}

// 示例2：延迟列表渲染
function LargeList() {
  const [filter, setFilter] = useState('')
  const deferredFilter = useDeferredValue(filter)

  const filteredItems = useMemo(() => {
    return items.filter(item => item.includes(deferredFilter))
  }, [deferredFilter])

  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      <List items={filteredItems} />
    </div>
  )
}
```

### useDeferredValue vs useTransition

```tsx
// useTransition：用于包装状态更新
function WithTransition() {
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState('')

  const handleChange = (e) => {
    setValue(e.target.value)  // 立即更新

    startTransition(() => {
      setResults(expensiveComputation(e.target.value))  // 延迟更新
    })
  }

  return <input value={value} onChange={handleChange} />
}

// useDeferredValue：用于延迟值本身
function WithDeferredValue() {
  const [value, setValue] = useState('')
  const deferredValue = useDeferredValue(value)

  const results = useMemo(() => {
    return expensiveComputation(deferredValue)  // 使用延迟的值
  }, [deferredValue])

  return (
    <div>
      <input value={value} onChange={e => setValue(e.target.value)} />
      <ResultsList results={results} />
    </div>
  )
}
```

### useDeferredValue 使用场景

```tsx
// 场景1：实时搜索
function RealTimeSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const isStale = searchTerm !== deferredSearchTerm

  const searchResults = useSearch(deferredSearchTerm)

  return (
    <div>
      <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      {isStale && <span className="stale">搜索中...</span>}
      <SearchResults results={searchResults} />
    </div>
  )
}

// 场景2：树形控件过滤
function TreeFilter() {
  const [filter, setFilter] = useState('')
  const deferredFilter = useDeferredValue(filter)

  const filteredTree = useMemo(() => {
    return filterTree(treeData, deferredFilter)
  }, [deferredFilter])

  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <TreeView data={filteredTree} />
    </div>
  )
}

// 场景3：图表数据更新
function ChartWithDeferredData() {
  const [data, setData] = useState(initialData)
  const deferredData = useDeferredValue(data)

  return (
    <div>
      <ControlPanel onChange={setData} />
      <ExpensiveChart data={deferredData} />
    </div>
  )
}
```

## 实战案例：搜索输入性能优化

让我们创建一个完整的应用，展示如何使用 useTransition 和 useDeferredValue 优化搜索性能。

```tsx
import { useState, useTransition, useDeferredValue, useMemo, useRef, useEffect } from 'react'

// ==================== 类型定义 ====================
interface Product {
  id: number
  name: string
  category: string
  price: number
  rating: number
  image: string
  description: string
}

interface SearchMetrics {
  inputTimestamp: number
  renderTimestamp: number
  renderTime: number
}

// ==================== 模拟大数据 ====================
const generateProducts = (count: number): Product[] => {
  const categories = ['电子产品', '服装', '家居', '食品', '图书', '运动']
  const products: Product[] = []

  for (let i = 1; i <= count; i++) {
    products.push({
      id: i,
      name: `商品 ${i} - ${categories[i % categories.length]}`,
      category: categories[i % categories.length],
      price: Math.floor(Math.random() * 10000) + 100,
      rating: (Math.random() * 2 + 3).toFixed(1),
      image: `https://via.placeholder.com/200?text=Product+${i}`,
      description: `这是商品 ${i} 的详细描述。包含了很多有用的信息。`
    })
  }

  return products
}

const ALL_PRODUCTS = generateProducts(10000)

// ==================== 模拟昂贵的计算 ====================
function expensiveFilter(products: Product[], query: string): Product[] {
  console.log('执行昂贵的过滤...')

  // 模拟计算密集型操作
  const startTime = performance.now()

  const filtered = products.filter(product => {
    const searchFields = [
      product.name,
      product.category,
      product.description
    ].join(' ').toLowerCase()

    return searchFields.includes(query.toLowerCase())
  })

  // 添加人为延迟，模拟真实场景
  const endTime = performance.now()
  const duration = endTime - startTime

  if (duration < 100) {
    const delay = 100 - duration
    const start = performance.now()
    while (performance.now() - start < delay) {
      // 阻塞主线程
    }
  }

  return filtered
}

function sortProducts(products: Product[], sortBy: string): Product[] {
  const sorted = [...products]

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    default:
      return sorted
  }
}

// ==================== 组件 ====================

// 无优化版本
function UnoptimizedSearch() {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [metrics, setMetrics] = useState<SearchMetrics | null>(null)

  const filteredProducts = useMemo(() => {
    const startTime = performance.now()

    const filtered = expensiveFilter(ALL_PRODUCTS, query)
    const sorted = sortProducts(filtered, sortBy)

    const endTime = performance.now()

    setMetrics({
      inputTimestamp: Date.now(),
      renderTimestamp: Date.now(),
      renderTime: endTime - startTime
    })

    return sorted
  }, [query, sortBy])

  return (
    <div className="search-demo">
      <div className="search-header">
        <h2>❌ 无优化版本</h2>
        <p className="warning">输入时会明显卡顿</p>
      </div>

      <div className="search-controls">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索商品..."
          className="search-input"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="name">按名称</option>
          <option value="price-asc">价格从低到高</option>
          <option value="price-desc">价格从高到低</option>
          <option value="rating">按评分</option>
        </select>
      </div>

      {metrics && (
        <div className="metrics">
          <span>渲染时间：{metrics.renderTime.toFixed(2)}ms</span>
        </div>
      )}

      <ProductList products={filteredProducts} />
    </div>
  )
}

// useTransition 优化版本
function TransitionSearch() {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [isPending, startTransition] = useTransition()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(ALL_PRODUCTS)
  const [metrics, setMetrics] = useState<SearchMetrics | null>(null)

  const handleChange = (value: string) => {
    // 立即更新输入框（紧急）
    setQuery(value)

    // 延迟过滤结果（非紧急）
    startTransition(() => {
      const startTime = performance.now()

      const filtered = expensiveFilter(ALL_PRODUCTS, value)
      const sorted = sortProducts(filtered, sortBy)

      const endTime = performance.now()

      setMetrics({
        inputTimestamp: Date.now(),
        renderTimestamp: Date.now(),
        renderTime: endTime - startTime
      })

      setFilteredProducts(sorted)
    })
  }

  const handleSort = (value: string) => {
    setSortBy(value)
    startTransition(() => {
      const sorted = sortProducts(filteredProducts, value)
      setFilteredProducts(sorted)
    })
  }

  return (
    <div className="search-demo">
      <div className="search-header">
        <h2>✅ useTransition 优化</h2>
        <p className="success">输入流畅，结果异步更新</p>
      </div>

      <div className="search-controls">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="搜索商品..."
          className="search-input"
        />
        <select
          value={sortBy}
          onChange={(e) => handleSort(e.target.value)}
          className="sort-select"
        >
          <option value="name">按名称</option>
          <option value="price-asc">价格从低到高</option>
          <option value="price-desc">价格从高到低</option>
          <option value="rating">按评分</option>
        </select>
      </div>

      {isPending && (
        <div className="loading-indicator">
          <div className="spinner" />
          <span>搜索中...</span>
        </div>
      )}

      {metrics && !isPending && (
        <div className="metrics">
          <span>渲染时间：{metrics.renderTime.toFixed(2)}ms</span>
        </div>
      )}

      <ProductList products={filteredProducts} />
    </div>
  )
}

// useDeferredValue 优化版本
function DeferredValueSearch() {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const deferredQuery = useDeferredValue(query)
  const deferredSortBy = useDeferredValue(sortBy)

  const filteredProducts = useMemo(() => {
    const startTime = performance.now()

    const filtered = expensiveFilter(ALL_PRODUCTS, deferredQuery)
    const sorted = sortProducts(filtered, deferredSortBy)

    const endTime = performance.now()

    return { products: sorted, renderTime: endTime - startTime }
  }, [deferredQuery, deferredSortBy])

  const isStale = query !== deferredQuery || sortBy !== deferredSortBy

  return (
    <div className="search-demo">
      <div className="search-header">
        <h2>✅ useDeferredValue 优化</h2>
        <p className="success">输入流畅，结果延迟更新</p>
      </div>

      <div className="search-controls">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索商品..."
          className="search-input"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="name">按名称</option>
          <option value="price-asc">价格从低到高</option>
          <option value="price-desc">价格从高到低</option>
          <option value="rating">按评分</option>
        </select>
      </div>

      {isStale && (
        <div className="loading-indicator">
          <div className="spinner" />
          <span>更新中...</span>
        </div>
      )}

      <div className="metrics">
        <span>渲染时间：{filteredProducts.renderTime.toFixed(2)}ms</span>
      </div>

      <ProductList products={filteredProducts.products} />
    </div>
  )
}

// 产品列表组件
function ProductList({ products }: { products: Product[] }) {
  const visibleProducts = products.slice(0, 50) // 只显示前50个

  return (
    <div className="product-list">
      <div className="product-count">
        找到 {products.length} 个商品
      </div>

      <div className="products-grid">
        {visibleProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
              <span className="product-category">{product.category}</span>
            </div>

            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>

              <div className="product-meta">
                <div className="product-rating">
                  <span className="stars">★</span>
                  <span>{product.rating}</span>
                </div>
                <div className="product-price">¥{product.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length > 50 && (
        <div className="show-more">
          还有 {products.length - 50} 个商品...
        </div>
      )}
    </div>
  )
}

// 主应用组件
function SearchOptimizationDemo() {
  const [activeTab, setActiveTab] = useState<'unoptimized' | 'transition' | 'deferred'>('unoptimized')

  return (
    <div className="demo-app">
      <header className="app-header">
        <h1>🔍 搜索性能优化演示</h1>
        <p>对比不同优化策略的效果（10,000个商品）</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'unoptimized' ? 'active' : ''}`}
          onClick={() => setActiveTab('unoptimized')}
        >
          无优化（会卡顿）
        </button>
        <button
          className={`tab ${activeTab === 'transition' ? 'active' : ''}`}
          onClick={() => setActiveTab('transition')}
        >
          useTransition
        </button>
        <button
          className={`tab ${activeTab === 'deferred' ? 'active' : ''}`}
          onClick={() => setActiveTab('deferred')}
        >
          useDeferredValue
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'unoptimized' && <UnoptimizedSearch />}
        {activeTab === 'transition' && <TransitionSearch />}
        {activeTab === 'deferred' && <DeferredValueSearch />}
      </div>
    </div>
  )
}

export default SearchOptimizationDemo
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
}

.demo-app {
  min-height: 100vh;
}

/* 头部 */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.app-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.app-header p {
  font-size: 16px;
  opacity: 0.9;
}

/* 标签页 */
.tabs {
  display: flex;
  gap: 10px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab {
  flex: 1;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  border-color: #667eea;
  background: #f5f5f5;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

/* 标签页内容 */
.tab-content {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 搜索演示 */
.search-demo {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-header {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #667eea;
}

.search-header h2 {
  color: #333;
  margin-bottom: 8px;
}

.search-header .warning {
  color: #f44336;
  font-weight: 500;
}

.search-header .success {
  color: #4caf50;
  font-weight: 500;
}

/* 搜索控件 */
.search-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.sort-select {
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  background: white;
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f0f0f0;
  border-radius: 8px;
  margin-bottom: 20px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 性能指标 */
.metrics {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

/* 产品列表 */
.product-list {
  margin-top: 20px;
}

.product-count {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: 600;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.product-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-category {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffc107;
  font-weight: 600;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #f44336;
}

.show-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 768px) {
  .app-header h1 {
    font-size: 24px;
  }

  .search-controls {
    flex-direction: column;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .tabs {
    flex-direction: column;
  }
}
```

## 最佳实践总结

### useTransition 最佳实践

```tsx
// ✅ 适合使用 useTransition 的场景
function GoodUseTransition() {
  const [isPending, startTransition] = useTransition()

  // 1. 搜索和过滤
  const handleSearch = (query: string) => {
    setInputValue(query)
    startTransition(() => {
      setResults(performSearch(query))
    })
  }

  // 2. 标签页切换
  const switchTab = (tab: string) => {
    setActiveTab(tab)
    startTransition(() => {
      setTabContent(loadTab(tab))
    })
  }

  // 3. 大列表渲染
  const updateList = (filter: string) => {
    setFilter(filter)
    startTransition(() => {
      setListItems(filterLargeList(filter))
    })
  }

  return null
}
```

### useDeferredValue 最佳实践

```tsx
// ✅ 适合使用 useDeferredValue 的场景
function GoodUseDeferredValue() {
  const [value, setValue] = useState('')

  // 1. 延迟昂贵的计算
  const deferredValue = useDeferredValue(value)
  const result = useMemo(() => {
    return expensiveComputation(deferredValue)
  }, [deferredValue])

  // 2. 延迟大列表渲染
  const deferredQuery = useDeferredValue(query)
  const filteredItems = useMemo(() => {
    return items.filter(item => item.includes(deferredQuery))
  }, [deferredQuery])

  return null
}
```

## 总结

本章我们学习了：

✅ useTransition 的基本用法和原理
✅ 更新优先级的概念和应用
✅ useDeferredValue 的使用方法
✅ useTransition vs useDeferredValue 的区别
✅ 实战案例：搜索输入性能优化
✅ 10,000个商品的大型数据集性能对比
✅ 并发渲染的性能优化策略

**性能优化对比：**

| 方案 | 输入响应性 | 渲染次数 | 用户体验 | 适用场景 |
|------|-----------|---------|---------|---------|
| 无优化 | ⭐ 卡顿 | 多次 | 差 | ❌ 不推荐 |
| useTransition | ⭐⭐⭐⭐⭐ 流畅 | 优化 | 优秀 | 搜索、过滤 |
| useDeferredValue | ⭐⭐⭐⭐⭐ 流畅 | 优化 | 优秀 | 实时更新 |

**下一步：** 第71章将学习 useId 与并发渲染，深入理解 React 18 的服务端渲染支持。
