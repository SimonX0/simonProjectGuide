# ：Props与State详解

## Props vs State

在 React 中，**Props** 和 **State** 是两个最重要的概念，理解它们的区别是掌握 React 的关键。

### 核心区别

| 特性 | Props（属性） | State（状态） |
|------|-------------|-------------|
| 来源 | 从父组件接收 | 组件内部管理 |
| 可变性 | 只读（不可变） | 可变（可更新） |
| 作用 | 组件间通信 | 组件内部状态 |
| 访问 | `props.xxx` | `state.xxx` |

## Props 深入

### 1. Props 的基本使用

```tsx
// 子组件
interface GreetingProps {
  name: string
  age?: number  // 可选属性
}

const Greeting = ({ name, age }: GreetingProps) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age && <p>年龄：{age}</p>}
    </div>
  )
}

// 父组件
const App = () => {
  return (
    <div>
      <Greeting name="Alice" age={20} />
      <Greeting name="Bob" />
    </div>
  )
}
```

### 2. Props 默认值

```tsx
// 方式一：使用默认参数（推荐）
const Button = ({
  text,
  variant = 'primary'
}: {
  text: string
  variant?: 'primary' | 'secondary'
}) => {
  return <button className={`btn ${variant}`}>{text}</button>
}

// 方式二：使用 defaultProps（已过时，不推荐）
// Button.defaultProps = {
//   variant: 'primary'
// }

// 使用
const App = () => {
  return (
    <div>
      <Button text="点击我" />  {/* 使用默认 variant: 'primary' */}
      <Button text="取消" variant="secondary" />
    </div>
  )
}
```

### 3. Props 验证

```tsx
import { PropTypes } from 'prop-types'

// 使用 PropTypes 进行运行时验证（可选）
const UserCard = ({ name, age, isActive }: {
  name: string
  age: number
  isActive: boolean
}) => {
  return (
    <div className={isActive ? 'active' : ''}>
      <h2>{name}</h2>
      <p>{age}岁</p>
    </div>
  )
}

// PropTypes 验证（JavaScript 项目常用）
UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
  isActive: PropTypes.bool
}

UserCard.defaultProps = {
  isActive: false
}
```

### 4. children Props

`children` 是一个特殊的 props，用于传递子元素。

```tsx
// 卡片组件
interface CardProps {
  title: string
  children: React.ReactNode
}

const Card = ({ title, children }: CardProps) => {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <div className="card-content">
        {children}
      </div>
    </div>
  )
}

// 使用
const App = () => {
  return (
    <Card title="用户信息">
      <p>姓名：Alice</p>
      <p>年龄：20岁</p>
      <button>编辑</button>
    </Card>
  )
}
```

**children 的高级用法：**

```tsx
// 布局组件
interface LayoutProps {
  header: React.ReactNode
  sidebar: React.ReactNode
  children: React.ReactNode
}

const Layout = ({ header, sidebar, children }: LayoutProps) => {
  return (
    <div className="layout">
      <header className="header">{header}</header>
      <div className="main">
        <aside className="sidebar">{sidebar}</aside>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

// 使用
const App = () => {
  return (
    <Layout
      header={<h1>我的应用</h1>}
      sidebar={<nav>菜单</nav>}
    >
      <p>主要内容</p>
    </Layout>
  )
}
```

### 5. Props 解构与展开

```tsx
// 解构 props
const UserCard = ({ name, age, avatar }: {
  name: string
  age: number
  avatar: string
}) => {
  return (
    <div>
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{age}岁</p>
    </div>
  )
}

// 使用展开运算符传递 props
const App = () => {
  const user = {
    name: 'Alice',
    age: 20,
    avatar: '/avatar.jpg'
  }

  return <UserCard {...user} />

  // 等价于：
  // return <UserCard name="Alice" age={20} avatar="/avatar.jpg" />
}
```

### 6. 渲染函数作为 Props

```tsx
// 接收渲染函数作为 props
interface ListProps {
  items: string[]
  renderItem: (item: string, index: number) => React.ReactNode
}

const List = ({ items, renderItem }: ListProps) => {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  )
}

// 使用
const App = () => {
  const items = ['Apple', 'Banana', 'Orange']

  return (
    <List
      items={items}
      renderItem={(item, index) => (
        <span>
          {index + 1}. {item}
        </span>
      )}
    />
  )
}
```

## State 深入

### 1. useState 基础

```tsx
import { useState } from 'react'

// 计数器示例
const Counter = () => {
  // useState 返回一个数组：[当前值, 更新函数]
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
  }

  const decrement = () => {
    setCount(count - 1)
  }

  const reset = () => {
    setCount(0)
  }

  return (
    <div>
      <h1>计数器：{count}</h1>
      <button onClick={decrement}>-1</button>
      <button onClick={increment}>+1</button>
      <button onClick={reset}>重置</button>
    </div>
  )
}
```

### 2. 函数式更新

当新状态依赖于旧状态时，使用函数式更新：

```tsx
const Counter = () => {
  const [count, setCount] = useState(0)

  // ❌ 错误：多次调用可能不会按预期工作
  const incrementBad = () => {
    setCount(count + 1)
    setCount(count + 1)  // 仍然是 count + 1
  }

  // ✅ 正确：使用函数式更新
  const incrementGood = () => {
    setCount(prev => prev + 1)
    setCount(prev => prev + 1)  // 会正确地 +2
  }

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={incrementGood}>+2</button>
    </div>
  )
}
```

### 3. 对象和数组的状态更新

```tsx
// 更新对象状态
const UserForm = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0
  })

  const updateName = (name: string) => {
    // ✅ 正确：创建新对象
    setUser({ ...user, name })

    // ❌ 错误：直接修改
    // user.name = name
    // setUser(user)
  }

  const updateUser = (field: string, value: string | number) => {
    setUser(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div>
      <input
        value={user.name}
        onChange={(e) => updateUser('name', e.target.value)}
        placeholder="姓名"
      />
      <input
        value={user.email}
        onChange={(e) => updateUser('email', e.target.value)}
        placeholder="邮箱"
      />
      <input
        type="number"
        value={user.age}
        onChange={(e) => updateUser('age', parseInt(e.target.value))}
        placeholder="年龄"
      />
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}

// 更新数组状态
const TodoList = () => {
  const [todos, setTodos] = useState<string[]>([])

  const addTodo = (text: string) => {
    // ✅ 添加元素
    setTodos([...todos, text])
  }

  const removeTodo = (index: number) => {
    // ✅ 删除元素
    setTodos(todos.filter((_, i) => i !== index))
  }

  const updateTodo = (index: number, newText: string) => {
    // ✅ 更新元素
    setTodos(todos.map((todo, i) =>
      i === index ? newText : todo
    ))
  }

  return (
    <div>
      {/* UI 代码 */}
    </div>
  )
}
```

### 4. 惰性初始化状态

```tsx
// 只在组件首次渲染时执行
const TodoList = ({ initialTodos }: { initialTodos: string[] }) => {
  // ✅ 使用函数进行惰性初始化
  const [todos, setTodos] = useState(() => {
    console.log('只执行一次')
    return initialTodos.filter(todo => todo.length > 0)
  })

  // ❌ 不要这样做：每次渲染都会执行
  // const [todos, setTodos] = useState(
  //   initialTodos.filter(todo => todo.length > 0)
  // )

  return <div>{/* ... */}</div>
}
```

### 5. 状态更新的批处理

```tsx
const Counter = () => {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  const handleClick = () => {
    // React 18+ 会自动批处理这些状态更新
    setCount(count + 1)
    setName('Alice')
    // 只触发一次重新渲染
  }

  return (
    <div>
      <h1>{count}</h1>
      <p>{name}</p>
      <button onClick={handleClick}>点击</button>
    </div>
  )
}
```

## 实战案例：商品购物车

```tsx
import { useState } from 'react'

interface Product {
  id: number
  name: string
  price: number
  image: string
}

interface CartItem extends Product {
  quantity: number
}

const ShoppingCart = () => {
  const [products] = useState<Product[]>([
    { id: 1, name: 'iPhone 15', price: 5999, image: '/iphone.jpg' },
    { id: 2, name: 'MacBook Pro', price: 15999, image: '/macbook.jpg' },
    { id: 3, name: 'AirPods', price: 1299, image: '/airpods.jpg' }
  ])

  const [cart, setCart] = useState<CartItem[]>([])

  // 添加到购物车
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id)

      if (existing) {
        // 商品已存在，增加数量
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // 新商品，添加到购物车
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  // 从购物车移除
  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  // 更新数量
  const updateQuantity = (id: number, delta: number) => {
    setCart(prevCart =>
      prevCart
        .map(item =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  // 计算总价
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // 计算总数量
  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <div className="shopping-cart">
      <h1>🛒 购物车</h1>

      {/* 商品列表 */}
      <div className="products">
        <h2>商品列表</h2>
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">¥{product.price}</p>
              <button onClick={() => addToCart(product)}>
                加入购物车
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 购物车 */}
      <div className="cart">
        <h2>购物车 ({totalItems})</h2>

        {cart.length === 0 ? (
          <p className="empty">购物车为空</p>
        ) : (
          <>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="price">¥{item.price}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>
                      +
                    </button>
                  </div>
                  <p className="subtotal">
                    小计：¥{item.price * item.quantity}
                  </p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  删除
                </button>
              </div>
            ))}

            <div className="cart-summary">
              <h3>总计：¥{total}</h3>
              <button className="checkout-btn">结算</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ShoppingCart
```

## Props vs State 使用场景

### Props 使用场景

```tsx
// ✅ 使用 Props 的场景
// 1. 从父组件传递数据
const Child = ({ data }: { data: string }) => <div>{data}</div>

// 2. 配置组件行为
const Button = ({ variant, size }: {
  variant: 'primary' | 'secondary'
  size: 'small' | 'large'
}) => <button className={`${variant} ${size}`}>点击</button>

// 3. 回调函数
const Form = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const handleSubmit = () => {
    onSubmit({ /* 表单数据 */ })
  }
  return <form onSubmit={handleSubmit}>...</form>
}
```

### State 使用场景

```tsx
// ✅ 使用 State 的场景
// 1. 组件内部的数据
const Counter = () => {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// 2. UI 状态（加载中、错误信息等）
const UserProfile = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      // 获取数据
    } catch (err) {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>加载中...</div>
  if (error) return <div>{error}</div>

  return <div>用户信息</div>
}

// 3. 表单输入
const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  return (
    <form>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </form>
  )
}
```

## 最佳实践

### 1. 保持 Props 简单

```tsx
// ❌ 不好：传递太多 props
const UserCard = ({
  name,
  age,
  email,
  phone,
  address,
  avatar,
  // ...更多 props
}: UserCardProps) => {
  return <div>...</div>
}

// ✅ 好：传递整个对象
const UserCard = ({ user }: { user: User }) => {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

### 2. 状态提升

当多个组件需要共享状态时，将状态提升到它们最近的共同父组件：

```tsx
// ❌ 不好：状态分散
const TemperatureInput = () => {
  const [temperature, setTemperature] = useState('')
  return <input value={temperature} onChange={(e) => setTemperature(e.target.value)} />
}

// ✅ 好：状态提升到父组件
const TemperatureCalculator = () => {
  const [temperature, setTemperature] = useState('')

  return (
    <div>
      <TemperatureInput
        value={temperature}
        onChange={setTemperature}
      />
      <BoilingVerdict temperature={temperature} />
    </div>
  )
}

const TemperatureInput = ({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) => {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
```

### 3. 避免过度使用 State

```tsx
// ❌ 不好：派生状态也存为 state
const UserList = ({ users }: { users: User[] }) => {
  const [userCount, setUserCount] = useState(users.length)
  const [sortedUsers, setSortedUsers] = useState(users)

  // 每次 users 变化都要手动更新
  useEffect(() => {
    setUserCount(users.length)
    setSortedUsers(users.sort())
  }, [users])

  return <div>{userCount} 个用户</div>
}

// ✅ 好：直接计算派生状态
const UserList = ({ users }: { users: User[] }) => {
  const userCount = users.length  // 派生状态
  const sortedUsers = useMemo(
    () => [...users].sort(),
    [users]
  )

  return <div>{userCount} 个用户</div>
}
```

## 总结

本章我们深入学习了：

✅ Props 和 State 的核心区别
✅ Props 的各种使用方式（默认值、验证、children、解构）
✅ State 的更新方式（函数式更新、对象和数组更新、惰性初始化）
✅ 实战案例：商品购物车
✅ Props vs State 的使用场景
✅ 最佳实践（保持简单、状态提升、避免过度使用）

**下一步：** 第54章将学习事件处理与条件渲染，掌握用户交互和动态UI的技巧。
