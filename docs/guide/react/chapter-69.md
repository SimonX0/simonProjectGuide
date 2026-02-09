# ：Suspense与数据获取

## Suspense 基础用法

Suspense 是 React 18 引入的一个重要特性，它允许你"等待"代码或数据加载，并在等待期间显示加载状态。

### 什么是 Suspense

```tsx
// ❌ 传统方式：手动管理加载状态
function TraditionalProfile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUser()
      .then(data => {
        setUser(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误：{error.message}</div>
  if (!user) return null

  return <div>{user.name}</div>
}

// ✅ 使用 Suspense：声明式加载状态
function SuspenseProfile() {
  // 这个组件会"暂停"直到数据加载完成
  const user = useFetchUser()  // 假设这是一个支持 Suspense 的 Hook

  return <div>{user.name}</div>
}

// 使用时包裹 Suspense
function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <SuspenseProfile />
    </Suspense>
  )
}
```

### Suspense 基本语法

```tsx
import { Suspense } from 'react'

// 基本用法
<Suspense fallback={<LoadingSpinner />}>
  <AsyncComponent />
</Suspense>

// 嵌套 Suspense
<Suspense fallback={<PageLoader />}>
  <div>
    <h1>用户资料</h1>
    <Suspense fallback={<AvatarLoader />}>
      <UserAvatar />
    </Suspense>
    <Suspense fallback={<PostsLoader />}>
      <UserPosts />
    </Suspense>
  </div>
</Suspense>

// 多个组件共享 Suspense
<Suspense fallback={<GlobalLoader />}>
  <Header />
  <Main />
  <Sidebar />
  <Footer />
</Suspense>
```

### Suspense 加载状态设计

```tsx
// ✅ 好的加载状态设计
function GoodSuspense() {
  return (
    <Suspense
      fallback={
        <div className="loading-container">
          <div className="spinner" />
          <p>加载中...</p>
        </div>
      }
    >
      <UserProfile />
    </Suspense>
  )
}

// ❌ 不好的加载状态
function BadSuspense() {
  return (
    <Suspense fallback={null}>
      <UserProfile />
    </Suspense>
  )
}

// ✅ 骨架屏加载状态
function SkeletonLoader() {
  return (
    <div className="skeleton">
      <div className="skeleton-avatar" />
      <div className="skeleton-text" />
      <div className="skeleton-text short" />
    </div>
  )
}

function ProfileWithSkeleton() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <UserProfile />
    </Suspense>
  )
}
```

## 数据获取与 Suspense

Suspense 的一个重要应用场景是数据获取。配合 React 的并发特性，可以创建更流畅的用户体验。

### 创建支持 Suspense 的数据获取 Hook

```tsx
// ==================== 支持Suspense的数据获取 ====================

// 1. 创建资源缓存
interface Resource<T> {
  read: () => T
}

function createResource<T>(promise: Promise<T>): Resource<T> {
  let status = 'pending'
  let result: T
  let error: Error

  const suspender = promise.then(
    data => {
      status = 'success'
      result = data
    },
    err => {
      status = 'error'
      error = err
    }
  )

  return {
    read(): T {
      if (status === 'pending') {
        throw suspender  // 抛出 Promise，触发 Suspense
      }
      if (status === 'error') {
        throw error  // 抛出错误，触发 Error Boundary
      }
      return result
    }
  }
}

// 2. 创建数据缓存
const cache = new Map<string, Resource<any>>()

function fetchData<T>(url: string): Resource<T> {
  // 检查缓存
  if (cache.has(url)) {
    return cache.get(url)!
  }

  // 创建新的资源
  const promise = fetch(url)
    .then(res => res.json())
    .catch(err => {
      throw err
    })

  const resource = createResource<T>(promise)
  cache.set(url, resource)

  return resource
}

// 3. 创建使用资源的 Hook
function useFetch<T>(url: string): T {
  const resource = fetchData<T>(url)
  return resource.read()
}

// ==================== 使用示例 ====================

interface User {
  id: number
  name: string
  email: string
  phone: string
  website: string
}

interface Post {
  id: number
  title: string
  body: string
}

// 用户组件
function UserProfile({ userId }: { userId: number }) {
  const user = useFetch<User>(`https://jsonplaceholder.typicode.com/users/${userId}`)

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>邮箱：{user.email}</p>
      <p>电话：{user.phone}</p>
      <p>网站：{user.website}</p>
    </div>
  )
}

// 用户帖子组件
function UserPosts({ userId }: { userId: number }) {
  const posts = useFetch<Post[]>(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)

  return (
    <div className="user-posts">
      <h3>帖子列表</h3>
      {posts.map(post => (
        <div key={post.id} className="post">
          <h4>{post.title}</h4>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  )
}

// 完整的用户页面
function UserPage({ userId }: { userId: number }) {
  return (
    <div className="user-page">
      <h1>用户详情</h1>

      <Suspense fallback={<div className="loading">加载用户信息...</div>}>
        <UserProfile userId={userId} />
      </Suspense>

      <Suspense fallback={<div className="loading">加载帖子...</div>}>
        <UserPosts userId={userId} />
      </Suspense>
    </div>
  )
}
```

### 使用 React Query 与 Suspense

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

// 创建 QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,  // 启用 Suspense
      staleTime: 5000,
    },
  },
})

// 使用 React Query + Suspense
function UserProfile({ userId }: { userId: number }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json()),
  })

  return (
    <div className="profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div>加载中...</div>}>
        <UserProfile userId={1} />
      </Suspense>
    </QueryClientProvider>
  )
}
```

### Suspense 与数据获取的最佳实践

```tsx
// ✅ 好的实践：预加载数据
function App() {
  // 开始预加载
  queryClient.prefetchQuery({
    queryKey: ['user', 1],
    queryFn: () => fetch('/api/users/1').then(res => res.json()),
  })

  return (
    <Suspense fallback={<div>加载中...</div>}>
      <UserProfile userId={1} />
    </Suspense>
  )
}

// ✅ 好的实践：分层加载
function Dashboard() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>

      <div className="content">
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <DashboardChart />
        </Suspense>
      </div>
    </div>
  )
}

// ❌ 不好的实践：太大的加载块
function BadDashboard() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      {/* 所有内容一起加载，用户等待时间长 */}
      <DashboardHeader />
      <DashboardStats />
      <DashboardChart />
      <DashboardTable />
    </Suspense>
  )
}
```

## Error Boundaries 错误边界

当使用 Suspense 时，需要配合 Error Boundaries 来处理数据加载失败的情况。

### Error Boundary 基本用法

```tsx
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('错误边界捕获到错误：', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>出错了</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            重新加载
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// 使用示例
function App() {
  return (
    <ErrorBoundary
      fallback={
        <div className="error-page">
          <h1>应用出错了</h1>
          <p>请刷新页面重试</p>
        </div>
      }
    >
      <Suspense fallback={<div>加载中...</div>}>
        <UserProfile />
      </Suspense>
    </ErrorBoundary>
  )
}
```

### 错误重试机制

```tsx
// ✅ 带重试功能的错误边界
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class RetryableErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <div className="error-icon">⚠️</div>
          <h2>加载失败</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={this.handleRetry} className="retry-button">
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// 使用
function UserPage() {
  return (
    <RetryableErrorBoundary
      onError={(error) => {
        // 发送错误到监控服务
        logErrorToService(error)
      }}
    >
      <Suspense fallback={<div>加载中...</div>}>
        <UserProfile />
      </Suspense>
    </RetryableErrorBoundary>
  )
}
```

### 细粒度的错误处理

```tsx
// ✅ 为不同组件设置不同的错误边界
function Dashboard() {
  return (
    <div className="dashboard">
      {/* 头部的错误边界 */}
      <ErrorBoundary fallback={<HeaderError />}>
        <Suspense fallback={<HeaderSkeleton />}>
          <DashboardHeader />
        </Suspense>
      </ErrorBoundary>

      {/* 统计数据的错误边界 */}
      <ErrorBoundary fallback={<StatsError />}>
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats />
        </Suspense>
      </ErrorBoundary>

      {/* 图表的错误边界 */}
      <ErrorBoundary fallback={<ChartError />}>
        <Suspense fallback={<ChartSkeleton />}>
          <DashboardChart />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
```

## 实战案例：图片懒加载+代码分割

让我们创建一个完整的应用，展示 Suspense 与图片懒加载、代码分割的结合使用。

```tsx
import { useState, Suspense, lazy, Component, ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

// ==================== 懒加载组件 ====================
const ProductDetail = lazy(() => import('./ProductDetail'))
const ShoppingCart = lazy(() => import('./ShoppingCart'))
const UserReviews = lazy(() => import('./UserReviews'))

// ==================== 图片组件（支持Suspense） ====================
interface LazyImageProps {
  src: string
  alt: string
  className?: string
}

class LazyImage extends Component<LazyImageProps> {
  state = {
    loaded: false,
    error: null as Error | null
  }

  private img: HTMLImageElement | null = null

  componentDidMount() {
    if (this.img) {
      if (this.img.complete) {
        this.setState({ loaded: true })
      } else {
        this.img.addEventListener('load', this.handleLoad)
        this.img.addEventListener('error', this.handleError)
      }
    }
  }

  componentWillUnmount() {
    if (this.img) {
      this.img.removeEventListener('load', this.handleLoad)
      this.img.removeEventListener('error', this.handleError)
    }
  }

  handleLoad = () => {
    this.setState({ loaded: true })
  }

  handleError = () => {
    this.setState({
      error: new Error('图片加载失败'),
      loaded: true
    })
  }

  render() {
    const { src, alt, className } = this.props
    const { loaded, error } = this.state

    if (!loaded) {
      throw new Promise((resolve) => {
        // 触发 Suspense
        const img = new Image()
        img.src = src
        img.onload = () => {
          this.img = img
          this.handleLoad()
          resolve(null)
        }
        img.onerror = () => {
          this.handleError()
          resolve(null)
        }
      })
    }

    if (error) {
      return (
        <div className="image-error">
          <span>❌</span>
          <p>图片加载失败</p>
        </div>
      )
    }

    return (
      <img
        ref={el => { this.img = el }}
        src={src}
        alt={alt}
        className={className}
      />
    )
  }
}

// ==================== 数据资源 ====================
const imageCache = new Map<string, any>()

function preloadImage(src: string) {
  if (imageCache.has(src)) {
    return imageCache.get(src)
  }

  const promise = new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = () => resolve(src)
    img.onerror = reject
  })

  imageCache.set(src, promise)
  return promise
}

// ==================== 类型定义 ====================
interface Product {
  id: number
  name: string
  price: number
  description: string
  image: string
  category: string
  rating: number
  reviews: number
}

interface CartItem {
  product: Product
  quantity: number
}

// ==================== 模拟数据 ====================
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    price: 9999,
    description: '全新 A17 Pro 芯片，钛金属设计',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    category: '手机',
    rating: 4.8,
    reviews: 2340
  },
  {
    id: 2,
    name: 'MacBook Pro 16英寸',
    price: 19999,
    description: 'M3 Max 芯片，极致性能',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    category: '电脑',
    rating: 4.9,
    reviews: 1560
  },
  {
    id: 3,
    name: 'AirPods Pro 2',
    price: 1899,
    description: '主动降噪，空间音频',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400',
    category: '耳机',
    rating: 4.7,
    reviews: 5670
  },
  {
    id: 4,
    name: 'Apple Watch Ultra 2',
    price: 6499,
    description: '最坚固、最强大的智能手表',
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400',
    category: '手表',
    rating: 4.6,
    reviews: 890
  },
  {
    id: 5,
    name: 'iPad Pro 12.9英寸',
    price: 8499,
    description: 'M2 芯片，XDR 显示屏',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    category: '平板',
    rating: 4.8,
    reviews: 1230
  },
  {
    id: 6,
    name: 'HomePod mini',
    price: 749,
    description: '身形小巧，音质出众',
    image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400',
    category: '音箱',
    rating: 4.5,
    reviews: 2340
  }
]

// ==================== 组件 ====================

// 骨架屏组件
function ProductSkeleton() {
  return (
    <div className="product-card skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-title" />
        <div className="skeleton-price" />
        <div className="skeleton-description" />
      </div>
    </div>
  )
}

// 产品卡片组件
function ProductCard({ product, onAddToCart }: {
  product: Product
  onAddToCart: (product: Product) => void
}) {
  return (
    <div className="product-card">
      <Suspense fallback={<div className="image-placeholder">加载中...</div>}>
        <LazyImage
          src={product.image}
          alt={product.name}
          className="product-image"
        />
      </Suspense>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-rating">
          <span className="stars">{'★'.repeat(Math.floor(product.rating))}</span>
          <span className="rating-value">{product.rating}</span>
          <span className="reviews">({product.reviews} 条评价)</span>
        </div>

        <div className="product-footer">
          <span className="product-price">¥{product.price.toLocaleString()}</span>
          <button
            onClick={() => onAddToCart(product)}
            className="add-to-cart-btn"
          >
            加入购物车
          </button>
        </div>
      </div>
    </div>
  )
}

// 错误回退组件
function ErrorFallback({ error, resetErrorBoundary }: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="error-fallback">
      <div className="error-icon">⚠️</div>
      <h2>出错了</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary} className="retry-btn">
        重试
      </button>
    </div>
  )
}

// 加载状态组件
function GlobalLoader() {
  return (
    <div className="global-loader">
      <div className="spinner" />
      <p>加载中...</p>
    </div>
  )
}

// 主应用组件
function ECommerceApp() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showCart, setShowCart] = useState(false)

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })

    // 显示成功提示
    alert(`${product.name} 已加入购物车！`)
  }

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="ecommerce-app">
      {/* 头部 */}
      <header className="app-header">
        <h1>🛍️ 优选商城</h1>
        <button
          onClick={() => setShowCart(true)}
          className="cart-button"
        >
          🛒 购物车 ({cartCount})
        </button>
      </header>

      {/* 产品列表 */}
      <main className="products-grid">
        {PRODUCTS.map(product => (
          <ErrorBoundary
            key={product.id}
            FallbackComponent={ErrorFallback}
            onReset={() => setSelectedProduct(null)}
          >
            <Suspense fallback={<ProductSkeleton />}>
              <ProductCard
                product={product}
                onAddToCart={addToCart}
              />
            </Suspense>
          </ErrorBoundary>
        ))}
      </main>

      {/* 产品详情模态框 */}
      {selectedProduct && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<GlobalLoader />}>
            <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="close-button"
                >
                  ×
                </button>
                <ProductDetail product={selectedProduct} />
              </div>
            </div>
          </Suspense>
        </ErrorBoundary>
      )}

      {/* 购物车侧边栏 */}
      {showCart && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<GlobalLoader />}>
            <div className="cart-overlay" onClick={() => setShowCart(false)}>
              <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setShowCart(false)}
                  className="close-button"
                >
                  ×
                </button>
                <ShoppingCart
                  items={cart}
                  onRemove={removeFromCart}
                  total={cartTotal}
                />
              </div>
            </div>
          </Suspense>
        </ErrorBoundary>
      )}

      {/* 用户评价 */}
      <section className="reviews-section">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div className="section-loader">加载评价中...</div>}>
            <UserReviews />
          </Suspense>
        </ErrorBoundary>
      </section>
    </div>
  )
}

export default ECommerceApp
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

.ecommerce-app {
  min-height: 100vh;
}

/* 头部 */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-header h1 {
  font-size: 28px;
  margin: 0;
}

.cart-button {
  padding: 12px 24px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cart-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 产品网格 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 产品卡片 */
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
}

.product-info {
  padding: 20px;
}

.product-category {
  display: inline-block;
  padding: 4px 12px;
  background: #667eea;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.product-name {
  font-size: 20px;
  color: #333;
  margin-bottom: 8px;
}

.product-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.stars {
  color: #ffc107;
  font-size: 16px;
}

.rating-value {
  font-weight: 600;
  color: #333;
}

.reviews {
  color: #999;
  font-size: 14px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.product-price {
  font-size: 24px;
  font-weight: bold;
  color: #f44336;
}

.add-to-cart-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-to-cart-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 骨架屏 */
.skeleton {
  background: #f9f9f9;
}

.skeleton-image {
  width: 100%;
  height: 250px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

.skeleton-content {
  padding: 20px;
}

.skeleton-title {
  height: 24px;
  background: #e0e0e0;
  margin-bottom: 12px;
  border-radius: 4px;
}

.skeleton-price {
  height: 20px;
  width: 100px;
  background: #e0e0e0;
  margin-bottom: 12px;
  border-radius: 4px;
}

.skeleton-description {
  height: 14px;
  background: #e0e0e0;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background: #e0e0e0;
}

/* 购物车侧边栏 */
.cart-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.cart-sidebar {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  background: white;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.2);
  padding: 30px;
  overflow-y: auto;
  animation: slideInRight 0.3s;
}

/* 错误回退 */
.error-fallback {
  padding: 40px;
  text-align: center;
  background: white;
  border-radius: 12px;
  margin: 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-fallback h2 {
  color: #f44336;
  margin-bottom: 12px;
}

.retry-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

/* 全局加载器 */
.global-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .cart-sidebar {
    width: 100%;
  }

  .app-header {
    padding: 16px 20px;
  }

  .app-header h1 {
    font-size: 20px;
  }
}
```

## Suspense 最佳实践

### 1. 合理设计加载状态

```tsx
// ✅ 好的加载状态：骨架屏
function GoodLoading() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <UserProfile />
    </Suspense>
  )
}

// ❌ 不好的加载状态：白屏
function BadLoading() {
  return (
    <Suspense fallback={null}>
      <UserProfile />
    </Suspense>
  )
}
```

### 2. 分层加载

```tsx
// ✅ 好的实践：分层加载
function LayeredLoading() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      <Suspense fallback={<ContentSkeleton />}>
        <Content />
      </Suspense>
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
    </div>
  )
}
```

### 3. 错误处理

```tsx
// ✅ 好的实践：使用错误边界
function WithErrorBoundary() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Suspense fallback={<Loading />}>
        <AsyncComponent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

## 总结

本章我们学习了：

✅ Suspense 的基本概念和用法
✅ 数据获取与 Suspense 的集成
✅ Error Boundaries 错误边界的使用
✅ 实战案例：图片懒加载+代码分割的完整应用
✅ Suspense 与 React Query 的结合
✅ 懒加载组件和图片的最佳实践
✅ Suspense 的加载状态设计

**Suspense 的优势：**

| 特性 | 传统方式 | Suspense |
|------|---------|----------|
| 代码复杂度 | 高 | 低 |
| 加载状态管理 | 手动 | 自动 |
| 错误处理 | 分散 | 集中 |
| 用户体验 | 好 | 更好 |
| 代码分割 | 需要手动 | 自动支持 |

**下一步：** 第70章将学习 useTransition 与 useDeferredValue，掌握 React 18 的并发渲染特性。
