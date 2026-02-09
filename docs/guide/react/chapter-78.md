# ：React组件设计模式

## 设计模式简介

### 为什么需要组件设计模式？

组件设计模式帮助我们：
- ✅ 提高代码复用性
- ✅ 降低组件耦合度
- ✅ 提升代码可维护性
- ✅ 统一团队开发规范
- ✅ 构建可扩展的架构

### 常见设计模式对比

| 设计模式 | 复杂度 | 复用性 | 可维护性 | 适用场景 |
|---------|-------|--------|---------|---------|
| 容器/展示组件 | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 分离逻辑和UI |
| 高阶组件HOC | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 横切关注点 |
| Render Props | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 逻辑复用 |
| 组合组件 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 声明式API |

## 容器组件与展示组件

### 模式介绍

```tsx
// ==================== 展示组件（Presentational）====================
// ✅ 职责：只负责UI展示，不处理业务逻辑
// ✅ 特点：纯函数、通过props接收数据、通过回调通知父组件

// ❌ 错误：展示组件包含业务逻辑
const BadProductList = () => {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
  }, [])

  return (
    <div>
      {products.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  )
}

// ✅ 正确：展示组件只负责UI
interface ProductListProps {
  products: Product[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

const ProductListPresentational = ({
  products,
  loading,
  error,
  onRetry
}: ProductListProps) => {
  if (loading) return <div className="loading">加载中...</div>
  if (error) return <div className="error">{error}<button onClick={onRetry}>重试</button></div>

  return (
    <div className="product-list">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// ✅ 产品卡片组件（纯展示组件）
interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image: string
  }
  onAddToCart?: (productId: string) => void
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">¥{product.price}</p>
      {onAddToCart && (
        <button onClick={() => onAddToCart(product.id)}>
          加入购物车
        </button>
      )}
    </div>
  )
}

// ==================== 容器组件（Container）====================
// ✅ 职责：处理业务逻辑、状态管理、数据获取
// ✅ 特点：包含状态、调用API、提供数据给展示组件

const ProductListContainer = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('获取产品失败')
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleRetry = () => {
    setError(null)
    // 重新获取数据...
  }

  const handleAddToCart = (productId: string) => {
    // 添加到购物车逻辑
    console.log('添加到购物车:', productId)
  }

  return (
    <ProductListPresentational
      products={products}
      loading={loading}
      error={error}
      onRetry={handleRetry}
      onAddToCart={handleAddToCart}
    />
  )
}
```

### 实战案例：用户资料页面

```tsx
// ==================== 展示组件 ====================
interface UserProfileProps {
  user: {
    id: string
    name: string
    email: string
    avatar: string
    bio: string
    followers: number
    following: number
  }
  onEdit: () => void
  onFollow: () => void
  onUnfollow: () => void
  isFollowing: boolean
  isOwnProfile: boolean
}

const UserProfilePresentational = ({
  user,
  onEdit,
  onFollow,
  onUnfollow,
  isFollowing,
  isOwnProfile
}: UserProfileProps) => {
  return (
    <div className="user-profile">
      <div className="profile-header">
        <img src={user.avatar} alt={user.name} className="avatar" />
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="email">{user.email}</p>
          <p className="bio">{user.bio}</p>

          <div className="stats">
            <span>{user.followers} 关注者</span>
            <span>{user.following} 正在关注</span>
          </div>

          <div className="actions">
            {isOwnProfile ? (
              <button onClick={onEdit} className="edit-btn">
                编辑资料
              </button>
            ) : (
              <button
                onClick={isFollowing ? onUnfollow : onFollow}
                className={isFollowing ? 'unfollow-btn' : 'follow-btn'}
              >
                {isFollowing ? '取消关注' : '关注'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== 容器组件 ====================
const UserProfileContainer = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const currentUser = useCurrentUser()

  useEffect(() => {
    fetchUser(userId)
    fetchFollowStatus(userId)
  }, [userId])

  const fetchUser = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${id}`)
      if (!response.ok) throw new Error('获取用户失败')
      const userData = await response.json()
      setUser(userData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchFollowStatus = async (id: string) => {
    const response = await fetch(`/api/users/${id}/follow-status`)
    const data = await response.json()
    setIsFollowing(data.isFollowing)
  }

  const handleEdit = () => {
    // 导航到编辑页面
    router.push(`/profile/${userId}/edit`)
  }

  const handleFollow = async () => {
    await fetch(`/api/users/${userId}/follow`, { method: 'POST' })
    setIsFollowing(true)
    if (user) {
      setUser({ ...user, followers: user.followers + 1 })
    }
  }

  const handleUnfollow = async () => {
    await fetch(`/api/users/${userId}/unfollow`, { method: 'POST' })
    setIsFollowing(false)
    if (user) {
      setUser({ ...user, followers: user.followers - 1 })
    }
  }

  if (loading) return <div>加载中...</div>
  if (error || !user) return <div>加载失败</div>

  const isOwnProfile = currentUser?.id === userId

  return (
    <UserProfilePresentational
      user={user}
      onEdit={handleEdit}
      onFollow={handleFollow}
      onUnfollow={handleUnfollow}
      isFollowing={isFollowing}
      isOwnProfile={isOwnProfile}
    />
  )
}
```

## 高阶组件（HOC）

### HOC 基础

```tsx
// ==================== HOC 基础语法 ====================
// ✅ HOC 是一个函数，接收组件并返回增强后的组件

function withEnhancement(WrappedComponent: React.ComponentType<any>) {
  return function EnhancedComponent(props: any) {
    // 添加增强逻辑
    const enhancedProps = {
      ...props,
      additionalProp: 'some value'
    }

    return <WrappedComponent {...enhancedProps} />
  }
}

// 使用
const SimpleComponent = ({ name, additionalProp }: any) => {
  return <div>{name} - {additionalProp}</div>
}

const EnhancedComponent = withEnhancement(SimpleComponent)
```

### HOC 实战案例

```tsx
// ==================== 1. withLoading HOC ====================
// ✅ 为组件添加加载状态

interface WithLoadingProps {
  loading: boolean
  LoadingComponent?: React.ComponentType
}

function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P & WithLoadingProps> {
  const WithLoadingComponent = (props: P & WithLoadingProps) => {
    const { loading, LoadingComponent, ...restProps } = props

    if (loading) {
      return LoadingComponent ? <LoadingComponent /> : <div>加载中...</div>
    }

    return <WrappedComponent {...(restProps as P)} />
  }

  WithLoadingComponent.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithLoadingComponent
}

// 使用
const UserProfile = ({ user }: { user: User }) => {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

const UserProfileWithLoading = withLoading(UserProfile)

// 在应用中使用
const App = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser().then(data => {
      setUser(data)
      setLoading(false)
    })
  }, [])

  return (
    <UserProfileWithLoading
      loading={loading}
      user={user!}
      LoadingComponent={() => <div className="spinner">加载中...</div>}
    />
  )
}

// ==================== 2. withAuth HOC ====================
// ✅ 检查用户登录状态

interface WithAuthProps {
  isAuthenticated: boolean
  user: User | null
  onLogin: () => void
}

function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  LoginComponent?: React.ComponentType
): React.ComponentType<P & WithAuthProps> {
  const WithAuthComponent = (props: P & WithAuthProps) => {
    const { isAuthenticated, user, onLogin, ...restProps } = props

    if (!isAuthenticated) {
      return LoginComponent ? <LoginComponent /> : <div>请先登录</div>
    }

    return <WrappedComponent {...(restProps as P)} user={user} />
  }

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithAuthComponent
}

// 使用
const Dashboard = ({ user }: { user: User }) => {
  return (
    <div>
      <h1>欢迎, {user.name}</h1>
      <div className="dashboard-content">
        {/* 仪表盘内容 */}
      </div>
    </div>
  )
}

const ProtectedDashboard = withAuth(Dashboard, LoginForm)

// ==================== 3. withLogger HOC ====================
// ✅ 记录组件生命周期和渲染

function withLogger<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component'

  const WithLoggerComponent = (props: P) => {
    useEffect(() => {
      console.log(`[Mount] ${name} mounted with props:`, props)
      return () => {
        console.log(`[Unmount] ${name} unmounted`)
      }
    }, [])

    useEffect(() => {
      console.log(`[Update] ${name} updated with props:`, props)
    })

    return <WrappedComponent {...props} />
  }

  WithLoggerComponent.displayName = `withLogger(${name})`

  return WithLoggerComponent
}

// 使用
const UserProfile = () => {
  return <div>用户资料</div>
}

const LoggedUserProfile = withLogger(UserProfile, 'UserProfile')

// ==================== 4. withDataFetching HOC ====================
// ✅ 通用数据获取 HOC

interface WithDataFetchingProps<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

function withDataFetching<P extends object, T>(
  WrappedComponent: React.ComponentType<P & WithDataFetchingProps<T>>,
  dataSource: () => Promise<T>
): React.ComponentType<Omit<P, keyof WithDataFetchingProps<T>>> {
  return (props: Omit<P, keyof WithDataFetchingProps<T>>) => {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await dataSource()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取数据失败')
      } finally {
        setLoading(false)
      }
    }, [dataSource])

    useEffect(() => {
      fetchData()
    }, [fetchData])

    const allProps = {
      ...props,
      data,
      loading,
      error,
      refetch: fetchData
    } as P & WithDataFetchingProps<T>

    return <WrappedComponent {...allProps} />
  }
}

// 使用
const ProductList = ({ data, loading, error, refetch }: WithDataFetchingProps<Product[]>) => {
  if (loading) return <div>加载中...</div>
  if (error) return <div>{error} <button onClick={refetch}>重试</button></div>
  if (!data) return null

  return (
    <div>
      {data.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}

const ProductListWithData = withDataFetching(
  ProductList,
  () => fetch('/api/products').then(res => res.json())
)

// ==================== 5. 组合多个 HOC ====================
// ✅ 链式调用多个 HOC

const EnhancedDashboard = compose(
  withLogger,
  withAuth,
  withLoading
)(Dashboard)

// compose 函数实现
function compose<T>(...fns: Function[]): (component: T) => T {
  return (component: T) => fns.reduceRight(
    (acc, fn) => fn(acc),
    component
  )
}

// 使用
const FinalComponent = EnhancedDashboard
```

### HOC 最佳实践

```tsx
// ✅ 最佳实践1：复制静态方法
function withEnhancement<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  const EnhancedComponent = (props: P) => {
    return <WrappedComponent {...props} />
  }

  // 复制静态方法
  Object.keys(WrappedComponent).forEach(key => {
    ;(EnhancedComponent as any)[key] = (WrappedComponent as any)[key]
  })

  // 使用 hoist-non-react-statics 库
  // import hoistNonReactStatic from 'hoist-non-react-statics'
  // hoistNonReactStatic(EnhancedComponent, WrappedComponent)

  EnhancedComponent.displayName = `withEnhancement(${WrappedComponent.displayName || WrappedComponent.name})`

  return EnhancedComponent
}

// ✅ 最佳实践2：最大化可组合性
// 避免修改原组件的 props，保持 props 原样传递

// ❌ 错误：删除了 props
function withBadHOC(WrappedComponent: React.ComponentType<any>) {
  return (props: any) => {
    const { specialProp, ...rest } = props // specialProp 被删除了
    return <WrappedComponent {...rest} />
  }
}

// ✅ 正确：传递所有 props
function withGoodHOC(WrappedComponent: React.ComponentType<any>) {
  return (props: any) => {
    // 使用 specialProp 但也传递下去
    console.log('specialProp:', props.specialProp)
    return <WrappedComponent {...props} />
  }
}

// ✅ 最佳实践3：使用 display 方便调试
function withDebug(WrappedComponent: React.ComponentType<any>) {
  const WithDebugComponent = (props: any) => {
    return <WrappedComponent {...props} />
  }

  WithDebugComponent.displayName = `withDebug(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithDebugComponent
}
```

## Render Props

### Render Props 基础

```tsx
// ==================== Render Props 基础语法 ====================
// ✅ render prop 是一个值为函数的 prop，用于共享代码

interface RenderPropsComponentProps {
  render: (state: { count: number; increment: () => void }) => React.ReactNode
  children?: (state: { count: number; increment: () => void }) => React.ReactNode
}

const CounterRenderProps = ({ render, children }: RenderPropsComponentProps) => {
  const [count, setCount] = useState(0)

  const increment = () => setCount(c => c + 1)

  // 支持两种方式：render prop 或 children
  const renderer = children || render

  return <div>{renderer({ count, increment })}</div>
}

// ✅ 使用方式1：render prop
<CounterRenderProps
  render={({ count, increment }) => (
    <div>
      <p>计数：{count}</p>
      <button onClick={increment}>+1</button>
    </div>
  )}
/>

// ✅ 使用方式2：children function
<CounterRenderProps>
  {({ count, increment }) => (
    <div>
      <p>计数：{count}</p>
      <button onClick={increment}>+1</button>
    </div>
  )}
</CounterRenderProps>
```

### Render Props 实战案例

```tsx
// ==================== 1. MouseTracker Render Props ====================
// ✅ 跟踪鼠标位置

interface MouseTrackerProps {
  render: (state: { x: number; y: number }) => React.ReactNode
  children?: (state: { x: number; y: number }) => React.ReactNode
}

const MouseTracker = ({ render, children }: MouseTrackerProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const renderer = children || render
  return <div>{renderer(position)}</div>
}

// 使用
const App = () => {
  return (
    <MouseTracker>
      {({ x, y }) => (
        <div>
          <p>鼠标位置：{x}, {y}</p>
        </div>
      )}
    </MouseTracker>
  )
}

// ==================== 2. DataFetcher Render Props ====================
// ✅ 通用数据获取

interface DataFetcherProps<T> {
  url: string
  render: (state: {
    data: T | null
    loading: boolean
    error: string | null
    refetch: () => void
  }) => React.ReactNode
  children?: (state: {
    data: T | null
    loading: boolean
    error: string | null
    refetch: () => void
  }) => React.ReactNode
}

function DataFetcher<T>({ url, render, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(url)
      if (!response.ok) throw new Error('获取数据失败')
      const json = await response.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const renderer = children || render
  return <div>{renderer({ data, loading, error, refetch: fetchData })}</div>
}

// 使用
const UserList = () => {
  return (
    <DataFetcher url="/api/users">
      {({ data, loading, error, refetch }) => {
        if (loading) return <div>加载中...</div>
        if (error) return <div>{error} <button onClick={refetch}>重试</button></div>
        if (!data) return null

        return (
          <ul>
            {data.map((user: any) => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        )
      }}
    </DataFetcher>
  )
}

// ==================== 3. FormValidation Render Props ====================
// ✅ 表单验证逻辑

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => boolean
  message?: string
}

interface FormValidationProps {
  rules: Record<string, ValidationRule>
  initialValues: Record<string, string>
  render: (state: {
    values: Record<string, string>
    errors: Record<string, string>
    touched: Record<string, boolean>
    handleChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void
    handleBlur: (field: string) => () => void
    handleSubmit: (onSubmit: (values: Record<string, string>) => void) => (e: React.FormEvent) => void
    isValid: boolean
  }) => React.ReactNode
  children?: (state: any) => React.ReactNode
}

const FormValidation = ({ rules, initialValues, render, children }: FormValidationProps) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: string): string | null => {
    const rule = rules[field]
    if (!rule) return null

    if (rule.required && !value) {
      return rule.message || '此字段必填'
    }

    if (rule.minLength && value.length < rule.minLength) {
      return rule.message || `最少${rule.minLength}个字符`
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `最多${rule.maxLength}个字符`
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || '格式不正确'
    }

    if (rule.custom && !rule.custom(value)) {
      return rule.message || '验证失败'
    }

    return null
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValues(prev => ({ ...prev, [field]: value }))

    if (touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error || '' }))
    }
  }

  const handleBlur = (field: string) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, values[field])
    setErrors(prev => ({ ...prev, [field]: error || '' }))
  }

  const handleSubmit = (onSubmit: (values: Record<string, string>) => void) => (e: React.FormEvent) => {
    e.preventDefault()

    // 验证所有字段
    const newErrors: Record<string, string> = {}
    Object.keys(rules).forEach(field => {
      const error = validateField(field, values[field])
      if (error) {
        newErrors[field] = error
      }
    })

    setErrors(newErrors)
    setTouched(Object.keys(rules).reduce((acc, field) => ({ ...acc, [field]: true }), {}))

    if (Object.keys(newErrors).length === 0) {
      onSubmit(values)
    }
  }

  const isValid = Object.keys(errors).every(field => !errors[field])

  const renderer = children || render
  return <div>{renderer({
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid
  })}</div>
}

// 使用
const LoginForm = () => {
  return (
    <FormValidation
      initialValues={{
        email: '',
        password: ''
      }}
      rules={{
        email: {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: '请输入有效的邮箱'
        },
        password: {
          required: true,
          minLength: 8,
          message: '密码至少8位'
        }
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isValid }) => (
        <form onSubmit={handleSubmit((values) => console.log('提交:', values))}>
          <div>
            <label>邮箱</label>
            <input
              type="email"
              value={values.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
            />
            {touched.email && errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div>
            <label>密码</label>
            <input
              type="password"
              value={values.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
            />
            {touched.password && errors.password && <span className="error">{errors.password}</span>}
          </div>

          <button type="submit" disabled={!isValid}>
            登录
          </button>
        </form>
      )}
    </FormValidation>
  )
}
```

### Render Props vs HOC

```tsx
// ==================== 相同功能的不同实现 ====================

// ✅ HOC 实现
const withData = withDataFetching(DataComponent, dataSource)

// 使用
<withData />

// ✅ Render Props 实现
<DataFetcher url={dataSource}>
  {({ data, loading }) => <DataComponent data={data} loading={loading} />}
</DataFetcher>

// ==================== 选择建议 ====================
/*
HOC 适用于：
- 需要包装整个组件
- 需要导出增强后的组件
- 需要组合多个 HOC

Render Props 适用于：
- 需要更灵活的 JSX 结构
- 需要控制渲染的内容
- 需要传递多个渲染函数
*/
```

## 组合组件模式

### 组合组件基础

```tsx
// ==================== 基础组合 ====================
// ✅ 通过组合创建声明式 API

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={`card ${className || ''}`}>{children}</div>
}

const CardHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="card-header">{children}</div>
}

const CardBody = ({ children }: { children: React.ReactNode }) => {
  return <div className="card-body">{children}</div>
}

const CardFooter = ({ children }: { children: React.ReactNode }) => {
  return <div className="card-footer">{children}</div>
}

// 使用
const App = () => {
  return (
    <Card>
      <CardHeader>
        <h2>标题</h2>
      </CardHeader>
      <CardBody>
        <p>内容</p>
      </CardBody>
      <CardFooter>
        <button>操作</button>
      </CardFooter>
    </Card>
  )
}

// ==================== 带 Context 的组合 ====================
interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

const Tabs = ({ children, defaultTab = 'first' }: { children: React.ReactNode; defaultTab?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

const TabList = ({ children }: { children: React.ReactNode }) => {
  return <div className="tab-list">{children}</div>
}

const Tab = ({ children, value }: { children: React.ReactNode; value: string }) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab must be used within Tabs')

  const { activeTab, setActiveTab } = context

  return (
    <button
      className={`tab ${activeTab === value ? 'active' : ''}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

const TabPanels = ({ children }: { children: React.ReactNode }) => {
  return <div className="tab-panels">{children}</div>
}

const TabPanel = ({ children, value }: { children: React.ReactNode; value: string }) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabPanel must be used within Tabs')

  const { activeTab } = context

  if (activeTab !== value) return null

  return <div className="tab-panel">{children}</div>
}

// 使用
const App = () => {
  return (
    <Tabs defaultTab="home">
      <TabList>
        <Tab value="home">首页</Tab>
        <Tab value="profile">资料</Tab>
        <Tab value="settings">设置</Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="home">
          <h1>首页内容</h1>
        </TabPanel>
        <TabPanel value="profile">
          <h1>资料内容</h1>
        </TabPanel>
        <TabPanel value="settings">
          <h1>设置内容</h1>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
```

### 实战案例：完整的表单组件

```tsx
// ==================== Form 组件系列 ====================
interface FormContextValue {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  handleChange: (field: string, value: any) => void
  handleBlur: (field: string) => void
  setFieldValue: (field: string, value: any) => void
}

const FormContext = createContext<FormContextValue | undefined>(undefined)

const Form = ({
  children,
  initialValues,
  onSubmit,
  validate
}: {
  children: React.ReactNode
  initialValues: Record<string, any>
  onSubmit: (values: Record<string, any>) => void
  validate?: (values: Record<string, any>) => Record<string, string>
}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))

    if (validate) {
      const validationErrors = validate(values)
      setErrors(validationErrors)
    }
  }

  const setFieldValue = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 验证所有字段
    if (validate) {
      const validationErrors = validate(values)
      setErrors(validationErrors)
      setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}))

      if (Object.keys(validationErrors).length > 0) {
        return
      }
    }

    onSubmit(values)
  }

  return (
    <FormContext.Provider value={{ values, errors, touched, handleChange, handleBlur, setFieldValue }}>
      <form onSubmit={handleSubmit}>{children}</form>
    </FormContext.Provider>
  )
}

const FormField = ({ name, label, children }: { name: string; label: string; children: React.ReactNode }) => {
  const context = useContext(FormContext)
  if (!context) throw new Error('FormField must be used within Form')

  const { values, errors, touched, handleChange, handleBlur } = context

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      {children}
      {touched[name] && errors[name] && <span className="error">{errors[name]}</span>}
    </div>
  )
}

const Input = ({ name, type = 'text', ...props }: any) => {
  const context = useContext(FormContext)
  if (!context) throw new Error('Input must be used within Form')

  const { values, handleChange, handleBlur } = context

  return (
    <input
      id={name}
      type={type}
      name={name}
      value={values[name] || ''}
      onChange={(e) => handleChange(name, e.target.value)}
      onBlur={() => handleBlur(name)}
      {...props}
    />
  )
}

const Select = ({ name, children, ...props }: any) => {
  const context = useContext(FormContext)
  if (!context) throw new Error('Select must be used within Form')

  const { values, handleChange, handleBlur } = context

  return (
    <select
      id={name}
      name={name}
      value={values[name] || ''}
      onChange={(e) => handleChange(name, e.target.value)}
      onBlur={() => handleBlur(name)}
      {...props}
    >
      {children}
    </select>
  )
}

const Checkbox = ({ name, ...props }: any) => {
  const context = useContext(FormContext)
  if (!context) throw new Error('Checkbox must be used within Form')

  const { values, handleChange } = context

  return (
    <input
      type="checkbox"
      name={name}
      checked={values[name] || false}
      onChange={(e) => handleChange(name, e.target.checked)}
      {...props}
    />
  )
}

// 使用示例
const RegistrationForm = () => {
  const handleSubmit = (values: Record<string, any>) => {
    console.log('提交表单:', values)
  }

  const validate = (values: Record<string, any>) => {
    const errors: Record<string, string> = {}

    if (!values.username) {
      errors.username = '用户名必填'
    }

    if (!values.email) {
      errors.email = '邮箱必填'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = '邮箱格式不正确'
    }

    if (!values.password) {
      errors.password = '密码必填'
    } else if (values.password.length < 8) {
      errors.password = '密码至少8位'
    }

    return errors
  }

  return (
    <Form
      initialValues={{ username: '', email: '', password: '', agreeTerms: false }}
      onSubmit={handleSubmit}
      validate={validate}
    >
      <FormField name="username" label="用户名">
        <Input name="username" placeholder="请输入用户名" />
      </FormField>

      <FormField name="email" label="邮箱">
        <Input type="email" name="email" placeholder="请输入邮箱" />
      </FormField>

      <FormField name="password" label="密码">
        <Input type="password" name="password" placeholder="请输入密码" />
      </FormField>

      <FormField name="country" label="国家">
        <Select name="country">
          <option value="">请选择</option>
          <option value="cn">中国</option>
          <option value="us">美国</option>
          <option value="uk">英国</option>
        </Select>
      </FormField>

      <div className="form-field">
        <label>
          <Checkbox name="agreeTerms" />
          我同意服务条款
        </label>
      </div>

      <button type="submit">注册</button>
    </Form>
  )
}
```

## 设计模式对比与选择

### 统一功能的不同实现

```tsx
// ==================== 场景：添加加载状态 ====================

// ✅ 1. HOC 实现
const withLoading = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P & { loading: boolean }) => {
    if (props.loading) return <div>加载中...</div>
    return <Component {...props} />
  }
}

const LoadingComponent = withLoading(MyComponent)

// ✅ 2. Render Props 实现
const WithLoading = ({ loading, render }: { loading: boolean; render: () => React.ReactNode }) => {
  if (loading) return <div>加载中...</div>
  return render()
}

<WithLoading loading={isLoading} render={() => <MyComponent />} />

// ✅ 3. 自定义 Hook 实现
const useLoading = (isLoading: boolean) => {
  if (isLoading) return <div>加载中...</div>
  return null
}

const MyComponent = () => {
  const loadingIndicator = useLoading(isLoading)
  if (loadingIndicator) return loadingIndicator

  return <div>内容</div>
}

// ==================== 选择指南 ====================
/*
HOC 适用场景：
- 需要包装整个组件
- 需要导出增强后的组件
- 需要多个 HOC 组合

Render Props 适用场景：
- 需要灵活控制渲染内容
- 需要传递多个渲染函数
- 想要更清晰的 JSX 结构

自定义 Hooks 适用场景：
- 需要复用逻辑而不是UI
- 需要更细粒度的控制
- 想要更现代的 React 方案

组合组件适用场景：
- 构建声明式 API
- 需要清晰的组件层级
- 构建组件库
*/
```

### 最佳实践总结

```tsx
// ✅ 最佳实践1：优先考虑自定义 Hook
// Hooks 是最现代、最灵活的代码复用方式

const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUser(userId)
      .then(data => {
        setUser(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [userId])

  return { user, loading, error }
}

// ✅ 最佳实践2：组件库使用组合模式
// 组合模式提供更好的 DX（开发体验）

<Modal>
  <Modal.Header>
    <Modal.Title>标题</Modal.Title>
    <Modal.Close />
  </Modal.Header>
  <Modal.Body>内容</Modal.Body>
  <Modal.Footer>
    <Button>确定</Button>
  </Modal.Footer>
</Modal>

// ✅ 最佳实践3：HOC 用于跨切面关注点
// 日志、认证、性能监控等

const WithLogging = withLogger(withAuth(ProtectedPage))

// ✅ 最佳实践4：Render Props 用于灵活渲染
// 列表渲染、自定义渲染逻辑

<List data={items}>
  {({ item, index }) => (
    <CustomItemRenderer item={item} index={index} />
  )}
</List>
```

## 配套样式

```css
/* ==================== Form 组件样式 ==================== */
form {
  max-width: 500px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-field input,
.form-field select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: #2196F3;
}

.form-field .error {
  display: block;
  margin-top: 6px;
  color: #f44336;
  font-size: 14px;
}

.form-field input.error {
  border-color: #f44336;
}

button[type="submit"] {
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
}

button[type="submit"]:hover {
  background: #1976D2;
}

/* ==================== Tabs 组件样式 ==================== */
.tabs {
  max-width: 800px;
  margin: 50px auto;
}

.tab-list {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
}

.tab {
  padding: 12px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  position: relative;
  transition: color 0.2s;
}

.tab:hover {
  color: #2196F3;
}

.tab.active {
  color: #2196F3;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #2196F3;
}

.tab-panel {
  padding: 20px 0;
}

/* ==================== Card 组件样式 ==================== */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.card-header h2 {
  margin: 0;
  color: #333;
}

.card-body {
  padding: 20px;
}

.card-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: #f9f9f9;
}
```

## 总结

本章我们学习了：

✅ 容器组件与展示组件模式（分离逻辑和UI）
✅ 高阶组件HOC（代码复用和横切关注点）
✅ Render Props 模式（灵活的渲染控制）
✅ 组合组件模式（声明式API设计）
✅ 四种模式的对比和选择指南
✅ 实战案例：完整的表单组件库

**设计模式选择指南：**

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 分离业务逻辑和UI | 容器/展示组件 | 职责清晰，易于测试 |
| 复用通用逻辑 | 自定义 Hooks | 现代、灵活、可组合 |
| 跨切面功能（日志、权限） | HOC | 包装整个组件 |
| 灵活控制渲染 | Render Props | 动态决定渲染内容 |
| 构建组件库 | 组合模式 | 声明式API，DX友好 |

**2024-2026年趋势：**
- ✅ Hooks 成为主流，逐步替代 HOC 和 Render Props
- ✅ 组合模式在组件库中广泛应用
- ✅ 容器/展示组件依然实用，尤其是大型应用

**下一步：** 第79章将学习 React 测试，掌握完整的测试方案。
