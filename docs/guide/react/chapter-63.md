# ：React Router 6+完全指南

## React Router 6 简介

### 为什么选择 React Router 6？

React Router 6 是 React 生态中最流行的路由库，相比 v5 有重大改进：

- 更简单的 API（移除了 Switch，使用 Routes）
- 更好的 TypeScript 支持
- 相对路由和嵌套路由改进
- 更小的包体积
- 更好的性能

### 安装 React Router 6

```bash
# 使用 npm
npm install react-router-dom

# 使用 yarn
yarn add react-router-dom

# 使用 pnpm
pnpm add react-router-dom
```

## 基础配置

### 最简单的路由配置

```tsx
// ❌ 错误：没有使用路由包装
import Home from './Home'
import About from './About'

const App = () => {
  return (
    <div>
      <Home />
      <About />
    </div>
  )
}

// ✅ 正确：使用 BrowserRouter 和 Routes
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import About from './About'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 路由模式选择

```tsx
import { BrowserRouter, HashRouter, MemoryRouter } from 'react-router-dom'

// BrowserRouter：使用 HTML5 History API（推荐用于生产环境）
const App = () => (
  <BrowserRouter>
    {/* 路由配置 */}
  </BrowserRouter>
)

// HashRouter：使用 URL 的 hash 部分（用于静态服务器）
const App = () => (
  <HashRouter>
    {/* 路由配置 */}
  </HashRouter>
)

// MemoryRouter：将 URL 历史保存在内存中（用于测试和非浏览器环境）
const App = () => (
  <MemoryRouter>
    {/* 路由配置 */}
  </MemoryRouter>
)

// ❌ 错误：在同一个应用中使用多个路由器
const BadApp = () => (
  <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>

    <BrowserRouter>
      <Routes>
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  </div>
)

// ✅ 正确：一个应用只使用一个路由器
const GoodApp = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  </BrowserRouter>
)
```

## 路由定义

### 基础路由

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 精确匹配路径 */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* ❌ 错误：在 React Router 6 中不需要 exact */}
        <Route path="/" exact element={<Home />} />

        {/* 404 页面：使用 * 匹配所有路径 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 路由参数

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// ❌ 错误：没有定义参数类型
const UserDetail = () => {
  return <div>用户详情</div>
}

// ✅ 正确：使用 useParams 获取参数
import { useParams } from 'react-router-dom'

interface UserParams {
  id: string
}

const UserDetail = () => {
  const { id } = useParams<UserParams>()

  return (
    <div>
      <h2>用户 ID：{id}</h2>
      {/* 根据 id 获取用户数据 */}
    </div>
  )
}

// ✅ 多个参数
interface PostParams {
  userId: string
  postId: string
}

const PostDetail = () => {
  const { userId, postId } = useParams<PostParams>()

  return (
    <div>
      <p>用户 ID：{userId}</p>
      <p>文章 ID：{postId}</p>
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/users/:userId/posts/:postId" element={<PostDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 可选参数

```tsx
import { Routes, Route, useParams } from 'react-router-dom'

// ✅ 可选参数：使用 ? 标记
const UserDetail = () => {
  const { id, tab } = useParams()

  return (
    <div>
      <h2>用户 ID：{id}</h2>
      {tab && <p>当前标签：{tab}</p>}
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 匹配：/users/123 和 /users/123/profile */}
        <Route path="/users/:id/:tab?" element={<UserDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 通配符路由

```tsx
import { Routes, Route, useParams } from 'react-router-dom'

// ✅ 使用 * 匹配多层路径
const Docs = () => {
  const { '*' } = useParams()

  return (
    <div>
      <h2>文档路径：{*}</h2>
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 匹配：/docs、/docs/guide、/docs/guide/installation 等 */}
        <Route path="/docs/*" element={<Docs />} />
      </Routes>
    </BrowserRouter>
  )
}
```

## 嵌套路由和 Outlet

### 基础嵌套路由

```tsx
import { Routes, Route, Outlet, Link } from 'react-router-dom'

// ❌ 错误：没有使用 Outlet
const Layout = () => {
  return (
    <div>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </nav>
      {/* 子路由内容不会显示 */}
    </div>
  )
}

// ✅ 正确：使用 Outlet 渲染子路由
const Layout = () => {
  return (
    <div>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </nav>
      <hr />
      {/* 子路由内容会在这里渲染 */}
      <Outlet />
    </div>
  )
}

const Home = () => <h1>首页</h1>
const About = () => <h1>关于我们</h1>

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

### 完整的嵌套路由示例

```tsx
import { Routes, Route, Outlet, Link, NavLink } from 'react-router-dom'

// 主布局
const MainLayout = () => {
  return (
    <div className="layout">
      <header className="header">
        <h1>我的网站</h1>
        <nav className="nav">
          <NavLink to="/" className="nav-link">首页</NavLink>
          <NavLink to="/products" className="nav-link">产品</NavLink>
          <NavLink to="/about" className="nav-link">关于</NavLink>
        </nav>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; 2024 我的网站</p>
      </footer>
    </div>
  )
}

// 产品布局
const ProductsLayout = () => {
  return (
    <div className="products-layout">
      <aside className="sidebar">
        <nav>
          <NavLink to="/products" end>产品列表</NavLink>
          <NavLink to="/products/electronics">电子产品</NavLink>
          <NavLink to="/products/clothing">服装</NavLink>
        </nav>
      </aside>

      <div className="content">
        <Outlet />
      </div>
    </div>
  )
}

// 页面组件
const Home = () => <div className="page"><h2>欢迎来到首页</h2></div>

const ProductsList = () => (
  <div className="page">
    <h2>产品列表</h2>
    <p>显示所有产品...</p>
  </div>
)

const Electronics = () => (
  <div className="page">
    <h2>电子产品</h2>
    <p>手机、电脑、平板...</p>
  </div>
)

const Clothing = () => (
  <div className="page">
    <h2>服装</h2>
    <p>男装、女装、童装...</p>
  </div>
)

const About = () => (
  <div className="page">
    <h2>关于我们</h2>
    <p>公司介绍、联系方式...</p>
  </div>
)

const NotFound = () => (
  <div className="page">
    <h2>404 - 页面未找到</h2>
  </div>
)

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ProductsLayout />}>
            <Route index element={<ProductsList />} />
            <Route path="electronics" element={<Electronics />} />
            <Route path="clothing" element={<Clothing />} />
          </Route>
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

**配套样式：**

```css
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  background: #2196F3;
  color: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0 0 15px 0;
  font-size: 24px;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background: white;
  color: #2196F3;
}

.main {
  flex: 1;
  padding: 20px;
}

.footer {
  background: #f5f5f5;
  padding: 20px;
  text-align: center;
  color: #666;
}

/* 产品布局 */
.products-layout {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 200px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar a {
  color: #333;
  text-decoration: none;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.sidebar a:hover {
  background: #e0e0e0;
}

.sidebar a.active {
  background: #2196F3;
  color: white;
}

.content {
  flex: 1;
}

.page {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page h2 {
  margin-top: 0;
  color: #333;
}
```

## 编程式导航

### useNavigate Hook

```tsx
import { useNavigate } from 'react-router-dom'

// ❌ 错误：在 React Router 6 中使用 useHistory（v5 的 API）
import { useHistory } from 'react-router-dom'

const OldComponent = () => {
  const history = useHistory()
  history.push('/home')  // ❌ v5 的写法
  return null
}

// ✅ 正确：使用 useNavigate
const NavigateComponent = () => {
  const navigate = useNavigate()

  const handleClick = () => {
    // 导航到指定路径
    navigate('/home')

    // 替换当前路径（用户无法通过返回按钮回到上一页）
    navigate('/home', { replace: true })

    // 前往上一页
    navigate(-1)

    // 前往下一页
    navigate(1)

    // 前往两页之前
    navigate(-2)
  }

  return (
    <button onClick={handleClick}>
      前往首页
    </button>
  )
}

// ✅ 带状态导航
const Login = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    // 登录成功后，携带状态跳转
    navigate('/dashboard', {
      state: { fromLogin: true, userId: 123 }
    })
  }

  return <button onClick={handleLogin}>登录</button>
}

const Dashboard = () => {
  const location = useLocation()
  const state = location.state as { fromLogin?: boolean; userId?: number }

  useEffect(() => {
    if (state?.fromLogin) {
      console.log('用户从登录页跳转过来，ID：', state.userId)
    }
  }, [state])

  return <div>仪表板</div>
}
```

### Link 和 NavLink

```tsx
import { Link, NavLink } from 'react-router-dom'

// Link：基础导航链接
const Navigation = () => {
  return (
    <nav>
      {/* ❌ 错误：使用普通的 a 标签会导致页面刷新 */}
      <a href="/home">首页</a>

      {/* ✅ 正确：使用 Link 避免页面刷新 */}
      <Link to="/home">首页</Link>

      {/* 带 state 的导航 */}
      <Link
        to="/products"
        state={{ from: 'nav' }}
      >
        产品
      </Link>

      {/* 替换历史记录 */}
      <Link to="/contact" replace>
        联系我们
      </Link>
    </nav>
  )
}

// NavLink：带激活状态的链接
const ActiveNavigation = () => {
  return (
    <nav>
      {/* 自动添加 active 类名 */}
      <NavLink to="/" end>
        首页
      </NavLink>

      {/* 自定义激活类名 */}
      <NavLink
        to="/products"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        产品
      </NavLink>

      {/* 使用 style */}
      <NavLink
        to="/about"
        style={({ isActive }) => ({
          color: isActive ? '#2196F3' : '#666',
          fontWeight: isActive ? 'bold' : 'normal'
        })}
      >
        关于
      </NavLink>

      {/* end 属性：只在完全匹配时激活 */}
      <NavLink to="/products" end>
        产品列表
      </NavLink>

      {/* 没有 end：/products 和 /products/electronics 都会激活 */}
      <NavLink to="/products">
        产品（包含子路由）
      </NavLink>
    </nav>
  )
}
```

### Navigate 组件

```tsx
import { Navigate } from 'react-router-dom'

// ✅ 重定向到指定路径
const RedirectToHome = () => {
  return <Navigate to="/" />
}

// ✅ 条件重定向
const ProtectedRoute = ({ isAuthenticated, children }: {
  isAuthenticated: boolean
  children: React.ReactNode
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// ✅ 使用 Navigate 组件
const UserProfile = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/profile' }} />
  }

  return <div>用户资料</div>
}

// ✅ 替换历史记录
const OldPage = () => {
  return <Navigate to="/new-page" replace />
}
```

## 查询参数

### useSearchParams Hook

```tsx
import { useSearchParams } from 'react-router-dom'

// ✅ 基础使用
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q')  // 获取查询参数
  const page = searchParams.get('page') || '1'  // 带默认值

  const handleSearch = (value: string) => {
    // 设置查询参数
    setSearchParams({ q: value, page: '1' })
  }

  return (
    <div>
      <input
        type="text"
        defaultValue={query || ''}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索..."
      />
      <p>搜索关键词：{query}</p>
      <p>当前页码：{page}</p>
    </div>
  )
}

// ✅ 多个查询参数
const FilterPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')

  const updateParams = (updates: Record<string, string>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value)
        } else {
          newParams.delete(key)
        }
      })
      return newParams
    })
  }

  return (
    <div>
      <select
        value={category}
        onChange={(e) => updateParams({ category: e.target.value })}
      >
        <option value="all">全部分类</option>
        <option value="electronics">电子产品</option>
        <option value="clothing">服装</option>
      </select>

      <select
        value={sort}
        onChange={(e) => updateParams({ sort: e.target.value })}
      >
        <option value="newest">最新</option>
        <option value="price-asc">价格从低到高</option>
        <option value="price-desc">价格从高到低</option>
      </select>

      <button onClick={() => updateParams({ page: String(page + 1) })}>
        下一页
      </button>
    </div>
  )
}

// ✅ 使用 URLSearchParams 初始化
const ProductList = () => {
  const [searchParams] = useSearchParams()

  // 获取所有参数
  const params = Object.fromEntries(searchParams)

  console.log(params)  // { q: 'phone', page: '2', sort: 'price' }

  return <div>产品列表</div>
}
```

## 路由守卫和权限控制

### 基础路由守卫

```tsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

// ✅ 私有路由组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // 保存当前路径，登录后可以跳回来
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// ✅ 使用私有路由
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* 私有路由 */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
```

### 基于角色的权限控制

```tsx
// ✅ 基于角色的路由守卫
interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth()
  const location = useLocation()

  // 未登录
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 角色不匹配
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

// ✅ 使用权限路由
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* 普通用户路由 */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 管理员路由 */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* 无权限页面 */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 完整的权限系统示例

```tsx
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'

// 模拟认证 Hook
function useAuth() {
  const [user, setUser] = useState<{ id: string; role: string } | null>(null)

  // 模拟登录
  const login = async (credentials: { username: string; password: string }) => {
    // 实际项目中这里会调用 API
    if (credentials.username === 'admin') {
      setUser({ id: '1', role: 'admin' })
    } else {
      setUser({ id: '2', role: 'user' })
    }
  }

  const logout = () => {
    setUser(null)
  }

  return { user, login, logout, isAuthenticated: !!user }
}

// 私有路由组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// 管理员路由组件
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/forbidden" replace />
  }

  return <>{children}</>
}

// 登录页
const LoginPage = () => {
  const { login, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const from = (location.state as any)?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const username = formData.get('username') as string

    await login({ username, password: 'password' })
    navigate(from, { replace: true })
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>登录</h2>
        <input
          name="username"
          type="text"
          placeholder="用户名（admin 或 user）"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="密码"
          defaultValue="password"
          required
        />
        <button type="submit">登录</button>
        <p className="hint">
          提示：输入 "admin" 登录管理员账号，其他用户名为普通用户
        </p>
      </form>
    </div>
  )
}

// 主页
const HomePage = () => {
  const { user, logout } = useAuth()

  return (
    <div className="home-page">
      <h1>欢迎，{user?.role === 'admin' ? '管理员' : '用户'}！</h1>
      <nav className="nav">
        <Link to="/dashboard">仪表板</Link>
        {user?.role === 'admin' && (
          <Link to="/admin">管理面板</Link>
        )}
        <Link to="/settings">设置</Link>
        <button onClick={logout}>退出登录</button>
      </nav>
    </div>
  )
}

// 仪表板
const Dashboard = () => {
  return (
    <div className="dashboard">
      <h2>仪表板</h2>
      <p>这是普通用户和管理员都能访问的页面</p>
    </div>
  )
}

// 管理面板
const AdminPanel = () => {
  return (
    <div className="admin-panel">
      <h2>管理面板</h2>
      <p>只有管理员才能访问这个页面</p>
      <ul>
        <li><Link to="/admin/users">用户管理</Link></li>
        <li><Link to="/admin/settings">系统设置</Link></li>
        <li><Link to="/admin/logs">操作日志</Link></li>
      </ul>
    </div>
  )
}

// 设置页面
const Settings = () => {
  return (
    <div className="settings">
      <h2>设置</h2>
      <p>用户设置页面</p>
    </div>
  )
}

// 无权限页面
const ForbiddenPage = () => {
  return (
    <div className="error-page">
      <h1>403</h1>
      <p>您没有权限访问此页面</p>
      <Link to="/">返回首页</Link>
    </div>
  )
}

// 主应用
const App = () => {
  const auth = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route
          path="/login"
          element={
            auth.isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />

        {/* 私有路由 */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
        </Route>

        {/* 错误页面 */}
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

**配套样式：**

```css
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-form h2 {
  margin-top: 0;
  color: #2196F3;
  text-align: center;
}

.login-form input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.login-form button {
  width: 100%;
  padding: 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-form button:hover {
  background: #1976D2;
}

.hint {
  font-size: 12px;
  color: #666;
  text-align: center;
  margin-top: 15px;
}

.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.home-page h1 {
  color: #2196F3;
  margin-bottom: 30px;
}

.nav {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.nav a,
.nav button {
  padding: 10px 20px;
  text-decoration: none;
  color: #333;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav a:hover,
.nav button:hover {
  background: #e0e0e0;
}

.dashboard,
.admin-panel,
.settings {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard h2,
.admin-panel h2,
.settings h2 {
  margin-top: 0;
  color: #333;
}

.admin-panel ul {
  list-style: none;
  padding: 0;
}

.admin-panel li {
  margin-bottom: 10px;
}

.admin-panel a {
  color: #2196F3;
  text-decoration: none;
}

.admin-panel a:hover {
  text-decoration: underline;
}

.error-page {
  text-align: center;
  padding: 100px 20px;
}

.error-page h1 {
  font-size: 72px;
  color: #f44336;
  margin: 0;
}

.error-page p {
  font-size: 18px;
  color: #666;
  margin: 20px 0;
}

.error-page a {
  color: #2196F3;
  text-decoration: none;
}

.error-page a:hover {
  text-decoration: underline;
}
```

## 实战案例：完整的后台管理系统路由

```tsx
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, NavLink, useLocation, useParams } from 'react-router-dom'

// ==================== 类型定义 ====================
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  avatar: string
}

interface Product {
  id: string
  name: string
  price: number
  category: string
  status: 'active' | 'inactive'
}

// ==================== 模拟数据 ====================
const mockProducts: Product[] = [
  { id: '1', name: 'iPhone 15 Pro', price: 7999, category: '手机', status: 'active' },
  { id: '2', name: 'MacBook Pro', price: 15999, category: '电脑', status: 'active' },
  { id: '3', name: 'AirPods Pro', price: 1899, category: '耳机', status: 'active' },
  { id: '4', name: 'iPad Air', price: 4799, category: '平板', status: 'inactive' },
]

const mockUsers: User[] = [
  { id: '1', name: '管理员', email: 'admin@example.com', role: 'admin', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: '用户A', email: 'user1@example.com', role: 'user', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: '用户B', email: 'user2@example.com', role: 'user', avatar: 'https://i.pravatar.cc/150?img=3' },
]

// ==================== 布局组件 ====================
const AdminLayout = () => {
  const { pathname } = useLocation()

  return (
    <div className="admin-layout">
      {/* 侧边栏 */}
      <aside className="sidebar">
        <div className="logo">
          <h2>后台管理系统</h2>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className="nav-item">
            <span className="icon">📊</span>
            <span>仪表板</span>
          </NavLink>

          <NavLink to="/admin/products" className="nav-item">
            <span className="icon">📦</span>
            <span>产品管理</span>
          </NavLink>

          <NavLink to="/admin/orders" className="nav-item">
            <span className="icon">🛒</span>
            <span>订单管理</span>
          </NavLink>

          <NavLink to="/admin/users" className="nav-item">
            <span className="icon">👥</span>
            <span>用户管理</span>
          </NavLink>

          <NavLink to="/admin/settings" className="nav-item">
            <span className="icon">⚙️</span>
            <span>系统设置</span>
          </NavLink>
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="main-wrapper">
        {/* 顶部导航 */}
        <header className="top-header">
          <div className="breadcrumb">
            {pathname === '/admin/dashboard' && '仪表板'}
            {pathname === '/admin/products' && '产品管理'}
            {pathname === '/admin/products/new' && '添加产品'}
            {pathname.startsWith('/admin/products/') && '编辑产品'}
            {pathname === '/admin/orders' && '订单管理'}
            {pathname === '/admin/users' && '用户管理'}
            {pathname === '/admin/settings' && '系统设置'}
          </div>

          <div className="user-menu">
            <img src="https://i.pravatar.cc/150?img=1" alt="管理员" />
            <span>管理员</span>
            <button onClick={() => console.log('退出登录')}>退出</button>
          </div>
        </header>

        {/* 内容区 */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// ==================== 页面组件 ====================

// 仪表板
const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>仪表板</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-label">总产品数</div>
            <div className="stat-value">1,234</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <div className="stat-label">今日订单</div>
            <div className="stat-value">89</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-label">用户总数</div>
            <div className="stat-value">5,678</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-label">今日收入</div>
            <div className="stat-value">¥23,456</div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>最近7天订单</h3>
          <div className="chart-placeholder">📊 图表区域</div>
        </div>

        <div className="chart-card">
          <h3>产品分类占比</h3>
          <div className="chart-placeholder">🥧 图表区域</div>
        </div>
      </div>
    </div>
  )
}

// 产品列表
const ProductsList = () => {
  const navigate = useNavigate()

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>产品管理</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/admin/products/new')}
        >
          添加产品
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>产品名称</th>
              <th>分类</th>
              <th>价格</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map(product => (
              <tr key={product.id}>
                <td>#{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>¥{product.price}</td>
                <td>
                  <span className={`status status-${product.status}`}>
                    {product.status === 'active' ? '上架' : '下架'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => navigate(`/admin/products/${product.id}`)}
                    className="btn btn-sm"
                  >
                    编辑
                  </button>
                  <button className="btn btn-sm btn-danger">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 添加/编辑产品
const ProductForm = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const product = isEdit
    ? mockProducts.find(p => p.id === id)
    : null

  return (
    <div className="product-form-page">
      <div className="page-header">
        <h1>{isEdit ? '编辑产品' : '添加产品'}</h1>
        <button onClick={() => navigate('/admin/products')} className="btn">
          返回列表
        </button>
      </div>

      <form className="product-form" onSubmit={(e) => {
        e.preventDefault()
        alert(isEdit ? '更新成功！' : '添加成功！')
        navigate('/admin/products')
      }}>
        <div className="form-group">
          <label>产品名称</label>
          <input
            type="text"
            name="name"
            defaultValue={product?.name}
            placeholder="请输入产品名称"
            required
          />
        </div>

        <div className="form-group">
          <label>分类</label>
          <select name="category" defaultValue={product?.category}>
            <option value="手机">手机</option>
            <option value="电脑">电脑</option>
            <option value="平板">平板</option>
            <option value="耳机">耳机</option>
          </select>
        </div>

        <div className="form-group">
          <label>价格</label>
          <input
            type="number"
            name="price"
            defaultValue={product?.price}
            placeholder="请输入价格"
            required
          />
        </div>

        <div className="form-group">
          <label>状态</label>
          <select name="status" defaultValue={product?.status}>
            <option value="active">上架</option>
            <option value="inactive">下架</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEdit ? '更新' : '添加'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}

// 订单管理
const Orders = () => {
  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>订单管理</h1>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>客户</th>
              <th>产品</th>
              <th>金额</th>
              <th>状态</th>
              <th>下单时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#202401001</td>
              <td>张三</td>
              <td>iPhone 15 Pro</td>
              <td>¥7,999</td>
              <td><span className="status status-active">已完成</span></td>
              <td>2024-01-15 10:30</td>
              <td>
                <button className="btn btn-sm">查看</button>
              </td>
            </tr>
            <tr>
              <td>#202401002</td>
              <td>李四</td>
              <td>MacBook Pro</td>
              <td>¥15,999</td>
              <td><span className="status status-active">处理中</span></td>
              <td>2024-01-15 11:20</td>
              <td>
                <button className="btn btn-sm">查看</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 用户管理
const Users = () => {
  return (
    <div className="users-page">
      <div className="page-header">
        <h1>用户管理</h1>
      </div>

      <div className="users-grid">
        {mockUsers.map(user => (
          <div key={user.id} className="user-card">
            <img src={user.avatar} alt={user.name} />
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <span className={`role role-${user.role}`}>
              {user.role === 'admin' ? '管理员' : '普通用户'}
            </span>
            <div className="actions">
              <button className="btn btn-sm">编辑</button>
              <button className="btn btn-sm btn-danger">删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 系统设置
const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>系统设置</h1>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <button
            className={activeTab === 'general' ? 'active' : ''}
            onClick={() => setActiveTab('general')}
          >
            通用设置
          </button>
          <button
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            安全设置
          </button>
          <button
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
          >
            通知设置
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <form className="settings-form">
              <h3>通用设置</h3>
              <div className="form-group">
                <label>网站名称</label>
                <input type="text" defaultValue="后台管理系统" />
              </div>
              <div className="form-group">
                <label>网站描述</label>
                <textarea rows={3}>这是一个功能强大的后台管理系统</textarea>
              </div>
              <button type="submit" className="btn btn-primary">保存</button>
            </form>
          )}

          {activeTab === 'security' && (
            <form className="settings-form">
              <h3>安全设置</h3>
              <div className="form-group">
                <label>
                  <input type="checkbox" defaultChecked />
                  启用双因素认证
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" defaultChecked />
                  强制使用强密码
                </label>
              </div>
              <button type="submit" className="btn btn-primary">保存</button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <form className="settings-form">
              <h3>通知设置</h3>
              <div className="form-group">
                <label>
                  <input type="checkbox" defaultChecked />
                  邮件通知
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" />
                  短信通知
                </label>
              </div>
              <button type="submit" className="btn btn-primary">保存</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== 主应用 ====================
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

**配套样式：**

```css
.admin-layout {
  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
}

/* 侧边栏 */
.sidebar {
  width: 250px;
  background: #1a1a1a;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.logo {
  padding: 20px;
  border-bottom: 1px solid #333;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.active {
  background: #2196F3;
  color: white;
}

.nav-item .icon {
  font-size: 20px;
}

/* 主内容区 */
.main-wrapper {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
}

.top-header {
  background: white;
  padding: 15px 30px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb {
  color: #666;
  font-size: 14px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-menu img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-menu button {
  padding: 8px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.main-content {
  flex: 1;
  padding: 30px;
}

/* 仪表板 */
.dashboard h1 {
  margin: 0 0 30px 0;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 40px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.dashboard-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.chart-card h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.chart-placeholder {
  height: 300px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  border-radius: 4px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  color: #333;
}

/* 按钮 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  background: #e0e0e0;
  color: #333;
}

.btn:hover {
  background: #d0d0d0;
}

.btn-primary {
  background: #2196F3;
  color: white;
}

.btn-primary:hover {
  background: #1976D2;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
}

/* 表格 */
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f5f5f5;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.data-table tr:hover {
  background: #f9f9f9;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #4caf50;
  color: white;
}

.status-inactive {
  background: #9e9e9e;
  color: white;
}

/* 产品表单 */
.product-form-page {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.product-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

/* 用户卡片 */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.user-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.user-card img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 15px;
}

.user-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.user-card p {
  color: #666;
  margin: 0 0 15px 0;
}

.role {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 15px;
}

.role-admin {
  background: #f44336;
  color: white;
}

.role-user {
  background: #2196F3;
  color: white;
}

.user-card .actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* 设置页面 */
.settings-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.settings-sidebar {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.settings-sidebar button {
  padding: 10px 15px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s;
}

.settings-sidebar button:hover {
  background: #f5f5f5;
}

.settings-sidebar button.active {
  background: #2196F3;
  color: white;
}

.settings-form {
  max-width: 600px;
}

.settings-form h3 {
  margin: 0 0 20px 0;
  color: #333;
}
```

## React Router 6 最佳实践

### 1. 路由配置最佳实践

```tsx
// ✅ 好的做法：集中管理路由配置
// routes.tsx
import { RouteObject } from 'react-router-dom'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'users', element: <Users /> },
          { path: 'settings', element: <Settings /> },
        ]
      }
    ]
  }
]

export default routes

// App.tsx
import { useRoutes } from 'react-router-dom'
import routes from './routes'

const App = () => {
  return useRoutes(routes)
}
```

### 2. 路由代码分割

```tsx
import { lazy, Suspense } from 'react'

// ✅ 使用 lazy loading
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### 3. 路由守卫复用

```tsx
// ✅ 创建可复用的守卫组件
const withAuth = (Component: React.ComponentType) => {
  return () => {
    const isAuthenticated = useAuth()
    const location = useLocation()

    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <Component />
  }
}

// 使用
const ProtectedDashboard = withAuth(Dashboard)
```

## 总结

本章我们学习了：

✅ React Router 6 的安装和基础配置
✅ BrowserRouter、HashRouter、MemoryRouter 的区别和使用场景
✅ 路由定义（Routes、Route）和路由参数（useParams）
✅ 嵌套路由和 Outlet 的使用
✅ 编程式导航（useNavigate、Link、NavLink、Navigate）
✅ 查询参数处理（useSearchParams）
✅ 路由守卫和权限控制的完整实现
✅ 实战案例：完整的后台管理系统路由

**下一步：** 第64章将学习 Zustand 状态管理，掌握轻量级、易用的状态管理解决方案。
