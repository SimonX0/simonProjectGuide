# ：useCallback与性能优化

## useCallback：缓存函数引用

### 为什么需要 useCallback？

```tsx
// ❌ 问题：每次渲染都创建新的函数
const ParentComponent = () => {
  const [count, setCount] = useState(0)

  // 每次渲染都是一个新的函数
  const handleClick = () => {
    console.log('点击了')
  }

  return (
    <div>
      <button onClick={handleClick}>点击</button>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  )
}

// ✅ 正确：使用 useCallback 缓存函数
const OptimizedComponent = () => {
  const [count, setCount] = useState(0)

  // 只有依赖变化时才创建新函数
  const handleClick = useCallback(() => {
    console.log('点击了')
  }, [])  // 空依赖数组，函数永远不会改变

  return (
    <div>
      <button onClick={handleClick}>点击</button>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  )
}
```

### useCallback 基本用法

```tsx
import { useCallback } from 'react'

// 语法
const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])  // 依赖数组

// 示例1：无依赖
const BasicExample = () => {
  const handleClick = useCallback(() => {
    console.log('按钮被点击')
  }, [])  // 永远不会改变

  return <button onClick={handleClick}>点击我</button>
}

// 示例2：有依赖
const Counter = () => {
  const [count, setCount] = useState(0)

  const increment = useCallback(() => {
    setCount(count + 1)
  }, [count])  // count 变化时创建新函数

  const incrementWithPrev = useCallback(() => {
    setCount(prev => prev + 1)
  }, [])  // 不依赖外部值，函数永远不会改变

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={incrementWithPrev}>+1 (使用 prev)</button>
    </div>
  )
}

// 示例3：带参数的函数
const List = () => {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3'])

  const handleRemove = useCallback((index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }, [items])

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {item}
          <button onClick={() => handleRemove(index)}>删除</button>
        </li>
      ))}
    </ul>
  )
}
```

### useCallback vs useMemo

```tsx
// useMemo：缓存计算结果
const Example1 = () => {
  const [count, setCount] = useState(0)

  // 缓存计算结果
  const doubled = useMemo(() => {
    console.log('计算 doubled')
    return count * 2
  }, [count])

  return <div>{doubled}</div>
}

// useCallback：缓存函数本身
const Example2 = () => {
  const [count, setCount] = useState(0)

  // 缓存函数
  const getDoubled = useCallback(() => {
    console.log('执行 getDoubled')
    return count * 2
  }, [count])

  return <div>{getDoubled()}</div>
}

// 实际上，useCallback(fn, deps) 等价于 useMemo(() => fn, deps)
// useCallback 是 useMemo 的语法糖
```

### React 的渲染机制

```tsx
// React 默认的渲染行为
const Parent = () => {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('Alice')

  console.log('Parent 渲染')

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <button onClick={() => setName(name === 'Alice' ? 'Bob' : 'Alice')}>
        {name}
      </button>
      <Child />
    </div>
  )
}

const Child = () => {
  console.log('Child 渲染')
  return <div>子组件</div>
}

// 结果：每次 Parent 渲染时，Child 也会渲染
// 即使 Child 的 props 没有变化！
```

### 使用 React.memo 避免不必要的渲染

```tsx
// ❌ 问题：父组件渲染导致子组件也渲染
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
  return <div>结果：{result}</div>
}

// ✅ 正确：使用 React.memo
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
  return <div>结果：{result}</div>
})

// 现在只有 props 变化时才重新渲染
```

### useCallback + React.memo 组合

```tsx
// ❌ 问题：即使使用 React.memo，新的函数引用也会导致重新渲染
const Parent = () => {
  const [count, setCount] = useState(0)

  // 每次渲染都创建新函数
  const handleClick = () => {
    console.log('点击')
  }

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <Child onClick={handleClick} />
    </div>
  )
}

const Child = React.memo(({ onClick }: { onClick: () => void }) => {
  console.log('Child 渲染')
  return <button onClick={onClick}>子组件按钮</button>
})

// ❌ 每次父组件渲染，子组件都会渲染（因为 onClick 是新函数）

// ✅ 正确：使用 useCallback
const Parent = () => {
  const [count, setCount] = useState(0)

  // 缓存函数，引用不变
  const handleClick = useCallback(() => {
    console.log('点击')
  }, [])

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <Child onClick={handleClick} />
    </div>
  )
}

const Child = React.memo(({ onClick }: { onClick: () => void }) => {
  console.log('Child 渲染')
  return <button onClick={onClick}>子组件按钮</button>
})

// ✅ 现在子组件不会因为父组件渲染而重新渲染
```

## useCallback 使用场景

### 场景1：传递给优化过的子组件

```tsx
const ListItem = React.memo(({
  item,
  onDelete,
  onToggle
}: {
  item: { id: number; text: string; done: boolean }
  onDelete: (id: number) => void
  onToggle: (id: number) => void
}) => {
  console.log(`ListItem ${item.id} 渲染`)

  return (
    <li>
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => onToggle(item.id)}
      />
      <span style={{ textDecoration: item.done ? 'line-through' : 'none' }}>
        {item.text}
      </span>
      <button onClick={() => onDelete(item.id)}>删除</button>
    </li>
  )
})

const TodoList = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习 React', done: false },
    { id: 2, text: '写代码', done: false }
  ])

  // 使用 useCallback 缓存函数
  const handleDelete = useCallback((id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }, [todos])

  const handleToggle = useCallback((id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ))
  }, [todos])

  return (
    <ul>
      {todos.map(todo => (
        <ListItem
          key={todo.id}
          item={todo}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      ))}
    </ul>
  )
}
```

### 场景2：作为其他 Hook 的依赖

```tsx
// ❌ 问题：useEffect 依赖函数，每次都重新执行
const ChatRoom = ({ roomId }: { roomId: string }) => {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const connection = createConnection(roomId, () => {
      // 这个函数每次渲染都是新的
      showMessage()
    })

    connection.connect()
    return () => connection.disconnect()
  }, [roomId, showMessage])  // showMessage 导致无限循环
}

// ✅ 正确：使用 useCallback
const ChatRoom = ({ roomId }: { roomId: string }) => {
  const [messages, setMessages] = useState([])

  const showMessage = useCallback(() => {
    // 显示消息的逻辑
  }, [])

  useEffect(() => {
    const connection = createConnection(roomId, showMessage)
    connection.connect()
    return () => connection.disconnect()
  }, [roomId, showMessage])  // showMessage 引用不变
}
```

### 场景3：事件处理器

```tsx
const ProductList = ({ products }: { products: Product[] }) => {
  const [cart, setCart] = useState<Cart>({})

  // 缓存添加到购物车的函数
  const addToCart = useCallback((productId: string) => {
    setCart(prevCart => ({
      ...prevCart,
      [productId]: (prevCart[productId] || 0) + 1
    }))
  }, [])

  // 缓存从购物车移除的函数
  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => {
      const newCart = { ...prevCart }
      if (newCart[productId] > 1) {
        newCart[productId]--
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }, [])

  return (
    <div>
      {products.map(product => (
        <ProductItem
          key={product.id}
          product={product}
          quantity={cart[product.id] || 0}
          onAdd={addToCart}
          onRemove={removeFromCart}
        />
      ))}
    </div>
  )
}

const ProductItem = React.memo(({
  product,
  quantity,
  onAdd,
  onRemove
}: {
  product: Product
  quantity: number
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}) => {
  return (
    <div className="product-item">
      <h3>{product.name}</h3>
      <p>¥{product.price}</p>
      <div className="controls">
        <button onClick={() => onRemove(product.id)}>-</button>
        <span>{quantity}</span>
        <button onClick={() => onAdd(product.id)}>+</button>
      </div>
    </div>
  )
})
```

## 性能优化策略

### 策略1：避免过早优化

```tsx
// ❌ 过度优化：简单计算不需要 useCallback
const BadOptimization = () => {
  const [count, setCount] = useState(0)

  const increment = useCallback(() => {
    setCount(count + 1)
  }, [count])

  return <button onClick={increment}>{count}</button>
}

// ✅ 简单直接：内联函数就足够了
const SimpleAndClear = () => {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  )
}

// ✅ 只在真正需要时使用 useCallback
const NeededOptimization = () => {
  const [items, setItems] = useState<Item[]>([])

  // 这个函数会被很多子组件使用
  const handleDelete = useCallback((id: string) => {
    setItems(items.filter(item => item.id !== id))
  }, [items])

  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          item={item}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
```

### 策略2：使用函数式更新减少依赖

```tsx
// ❌ 不好的方式：依赖外部变量
const Counter = () => {
  const [count, setCount] = useState(0)

  const increment = useCallback(() => {
    setCount(count + 1)  // 依赖 count
  }, [count])  // count 变化时函数需要更新

  return <button onClick={increment}>{count}</button>
}

// ✅ 好的方式：使用函数式更新
const Counter = () => {
  const [count, setCount] = useState(0)

  const increment = useCallback(() => {
    setCount(prev => prev + 1)  // 不依赖外部变量
  }, [])  // 依赖数组为空，函数永远不会变

  return <button onClick={increment}>{count}</button>
}
```

### 策略3：合理拆分组件

```tsx
// ❌ 问题：整个列表作为一个组件
const TodoListBad = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState('all')

  // filter 变化时，整个列表重新渲染
  const filteredTodos = todos.filter(/* ... */)

  return (
    <div>
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">全部</option>
        <option value="active">未完成</option>
        <option value="completed">已完成</option>
      </select>

      {filteredTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}

// ✅ 正确：将过滤器拆分为独立组件
const FilterSelector = ({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) => {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="all">全部</option>
      <option value="active">未完成</option>
      <option value="completed">已完成</option>
    </select>
  )
}

const TodoListGood = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState('all')

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value)
  }, [])

  // 使用 useMemo 缓存过滤后的列表
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      if (filter === 'active') return !todo.done
      if (filter === 'completed') return todo.done
      return true
    })
  }, [todos, filter])

  return (
    <div>
      <FilterSelector value={filter} onChange={handleFilterChange} />

      {filteredTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}
```

## 实战案例：列表优化 + 父组件渲染优化

```tsx
import { useState, useCallback, useMemo, React.memo } from 'react'

// ==================== 类型定义 ====================
interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  rating: number
}

interface CartItem {
  productId: string
  quantity: number
}

// ==================== 模拟数据 ====================
const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 7999,
    category: '手机',
    image: 'https://via.placeholder.com/200',
    rating: 4.8
  },
  {
    id: '2',
    name: 'MacBook Pro 14英寸',
    price: 15999,
    category: '电脑',
    image: 'https://via.placeholder.com/200',
    rating: 4.9
  },
  {
    id: '3',
    name: 'AirPods Pro 2',
    price: 1899,
    category: '耳机',
    image: 'https://via.placeholder.com/200',
    rating: 4.7
  },
  {
    id: '4',
    name: 'iPad Air 5',
    price: 4799,
    category: '平板',
    image: 'https://via.placeholder.com/200',
    rating: 4.6
  },
  {
    id: '5',
    name: 'Apple Watch Series 9',
    price: 2999,
    category: '手表',
    image: 'https://via.placeholder.com/200',
    rating: 4.5
  },
  {
    id: '6',
    name: 'HomePod mini',
    price: 749,
    category: '音箱',
    image: 'https://via.placeholder.com/200',
    rating: 4.4
  }
]

// ==================== 组件 ====================

// 评分组件
const RatingStars = React.memo(({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className="rating-stars">
      {[...Array(fullStars)].map((_, i) => (
        <span key={i} className="star full">★</span>
      ))}
      {hasHalfStar && <span className="star half">★</span>}
      {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <span key={i} className="star empty">★</span>
      ))}
      <span className="rating-number">({rating})</span>
    </div>
  )
})

// 产品卡片组件（使用 React.memo 优化）
const ProductCard = React.memo(({
  product,
  quantity,
  onAddToCart,
  onRemoveFromCart
}: {
  product: Product
  quantity: number
  onAddToCart: (productId: string) => void
  onRemoveFromCart: (productId: string) => void
}) => {
  console.log(`ProductCard ${product.id} 渲染`)

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span className="category-badge">{product.category}</span>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <RatingStars rating={product.rating} />
        <p className="product-price">¥{product.price.toLocaleString()}</p>

        <div className="quantity-controls">
          <button
            onClick={() => onRemoveFromCart(product.id)}
            disabled={quantity === 0}
            className={quantity === 0 ? 'disabled' : ''}
          >
            −
          </button>
          <span className="quantity">{quantity}</span>
          <button onClick={() => onAddToCart(product.id)}>
            +
          </button>
        </div>

        <button
          className="add-to-cart-btn"
          onClick={() => onAddToCart(product.id)}
        >
          加入购物车
        </button>
      </div>
    </div>
  )
})

// 过滤器组件
const FilterBar = React.memo(({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange
}: {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  sortBy: 'price-asc' | 'price-desc' | 'rating'
  onSortChange: (sort: 'price-asc' | 'price-desc' | 'rating') => void
}) => {
  console.log('FilterBar 渲染')

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>分类：</label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">全部</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>排序：</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
        >
          <option value="rating">评分最高</option>
          <option value="price-asc">价格从低到高</option>
          <option value="price-desc">价格从高到低</option>
        </select>
      </div>
    </div>
  )
})

// 购物车侧边栏
const CartSidebar = React.memo(({
  cart,
  products,
  onRemove,
  onClear
}: {
  cart: Record<string, number>
  products: Product[]
  onRemove: (productId: string) => void
  onClear: () => void
}) => {
  console.log('CartSidebar 渲染')

  // 使用 useMemo 计算总价
  const { totalItems, totalPrice } = useMemo(() => {
    let items = 0
    let price = 0

    Object.entries(cart).forEach(([productId, quantity]) => {
      const product = products.find(p => p.id === productId)
      if (product) {
        items += quantity
        price += product.price * quantity
      }
    })

    return { totalItems: items, totalPrice: price }
  }, [cart, products])

  return (
    <div className="cart-sidebar">
      <h2>购物车</h2>

      {Object.keys(cart).length === 0 ? (
        <p className="empty-cart">购物车是空的</p>
      ) : (
        <>
          <div className="cart-items">
            {Object.entries(cart).map(([productId, quantity]) => {
              const product = products.find(p => p.id === productId)
              if (!product) return null

              return (
                <div key={productId} className="cart-item">
                  <img src={product.image} alt={product.name} />
                  <div className="cart-item-info">
                    <h4>{product.name}</h4>
                    <p>数量：{quantity}</p>
                    <p>¥{(product.price * quantity).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => onRemove(productId)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>商品总数：</span>
              <span>{totalItems}</span>
            </div>
            <div className="summary-row total">
              <span>总价：</span>
              <span>¥{totalPrice.toLocaleString()}</span>
            </div>

            <button className="checkout-btn">
              去结算
            </button>
            <button onClick={onClear} className="clear-btn">
              清空购物车
            </button>
          </div>
        </>
      )}
    </div>
  )
})

// 主应用组件
const ShopApp = () => {
  const [products] = useState<Product[]>(PRODUCTS)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating')

  // 使用 useCallback 缓存添加到购物车的函数
  const addToCart = useCallback((productId: string) => {
    setCart(prevCart => ({
      ...prevCart,
      [productId]: (prevCart[productId] || 0) + 1
    }))
  }, [])

  // 使用 useCallback 缓存从购物车移除的函数
  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => {
      const newCart = { ...prevCart }
      if (newCart[productId] > 1) {
        newCart[productId]--
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }, [])

  // 完全移除商品
  const removeProductFromCart = useCallback((productId: string) => {
    setCart(prevCart => {
      const newCart = { ...prevCart }
      delete newCart[productId]
      return newCart
    })
  }, [])

  // 清空购物车
  const clearCart = useCallback(() => {
    setCart({})
  }, [])

  // 处理分类变化
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  // 处理排序变化
  const handleSortChange = useCallback((sort: 'price-asc' | 'price-desc' | 'rating') => {
    setSortBy(sort)
  }, [])

  // 使用 useMemo 缓存分类列表
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return Array.from(cats)
  }, [products])

  // 使用 useMemo 缓存过滤和排序后的产品
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products

    // 过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // 排序
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

    return sorted
  }, [products, selectedCategory, sortBy])

  return (
    <div className="shop-app">
      <header className="app-header">
        <h1>🛍️ 优选商城</h1>
      </header>

      <div className="app-content">
        <div className="main-section">
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />

          <div className="products-grid">
            {filteredAndSortedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={cart[product.id] || 0}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
              />
            ))}
          </div>
        </div>

        <CartSidebar
          cart={cart}
          products={products}
          onRemove={removeProductFromCart}
          onClear={clearCart}
        />
      </div>
    </div>
  )
}

export default ShopApp
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

.shop-app {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 32px;
  margin: 0;
}

.app-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 主区域 */
.main-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 过滤栏 */
.filter-bar {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 30px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
  color: #555;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
}

/* 产品网格 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* 产品卡片 */
.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 8px;
}

.star {
  color: #ddd;
  font-size: 16px;
}

.star.full {
  color: #ffc107;
}

.star.half {
  background: linear-gradient(90deg, #ffc107 50%, #ddd 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.rating-number {
  color: #999;
  font-size: 14px;
  margin-left: 5px;
}

.product-price {
  font-size: 20px;
  font-weight: bold;
  color: #f44336;
  margin-bottom: 15px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.quantity-controls button {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.quantity-controls button:hover:not(.disabled) {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
}

.quantity-controls button.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.quantity {
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.add-to-cart-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-to-cart-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 购物车侧边栏 */
.cart-sidebar {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.cart-sidebar h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
}

.empty-cart {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 6px;
  position: relative;
}

.cart-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info h4 {
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
}

.cart-item-info p {
  font-size: 12px;
  color: #666;
  margin: 2px 0;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border: none;
  background: #f44336;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #d32f2f;
  transform: scale(1.1);
}

.cart-summary {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #666;
}

.summary-row.total {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
  transition: all 0.2s;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.clear-btn {
  width: 100%;
  padding: 10px;
  background: transparent;
  color: #999;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #f5f5f5;
  color: #666;
}

/* 响应式 */
@media (max-width: 1024px) {
  .app-content {
    grid-template-columns: 1fr;
  }

  .cart-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }

  .filter-bar {
    flex-direction: column;
    gap: 15px;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group select {
    flex: 1;
  }
}
```

## 性能优化检查清单

```tsx
// ✅ 性能优化检查清单

// 1. 使用 React.memo 包装纯组件
const MyComponent = React.memo(function MyComponent({ data }) {
  return <div>{data}</div>
})

// 2. 使用 useCallback 缓存传递给子组件的函数
const Parent = () => {
  const handleClick = useCallback(() => {
    // ...
  }, [/* deps */])

  return <Child onClick={handleClick} />
}

// 3. 使用 useMemo 缓存昂贵的计算
const ExpensiveComponent = ({ items }) => {
  const result = useMemo(() => {
    return items.filter(/* ... */).sort(/* ... */)
  }, [items])

  return <div>{result}</div>
}

// 4. 使用函数式更新减少依赖
const Counter = () => {
  const increment = useCallback(() => {
    setCount(prev => prev + 1)
  }, [])

  return <button onClick={increment}>+</button>
}

// 5. 合理拆分组件
const Parent = () => {
  return (
    <div>
      <ExpensiveComponent data={data} />
      <SimpleComponent />
    </div>
  )
}
```

## 总结

本章我们学习了：

✅ useCallback 的基本用法和工作原理
✅ useCallback vs useMemo 的区别和使用场景
✅ React 的渲染机制和性能优化原理
✅ React.memo 与 useCallback 的组合使用
✅ useCallback 的实际应用场景
✅ 实战案例：列表优化 + 父组件渲染优化
✅ 性能优化策略和最佳实践
✅ 性能优化检查清单

**下一步：** 第61章将学习自定义 Hooks 开发，掌握代码复用的艺术。
