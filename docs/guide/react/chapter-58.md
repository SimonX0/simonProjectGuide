# ：useContext与useReducer

## useContext：跨组件数据传递

### 为什么需要 useContext？

在没有 Context 之前，我们需要通过 props 一层一层地传递数据：

```tsx
// ❌ 问题：props 逐层传递（prop drilling）
const App = () => {
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState({ name: 'Alice', age: 20 })

  return (
    <div>
      <Header theme={theme} user={user} />
      <Main theme={theme} user={user} />
      <Footer theme={theme} user={user} />
    </div>
  )
}

const Header = ({ theme, user }: { theme: string; user: any }) => {
  return (
    <header>
      <Logo theme={theme} />
      <Navigation theme={theme} user={user} />
    </header>
  )
}

const Navigation = ({ theme, user }: { theme: string; user: any }) => {
  return (
    <nav>
      <UserMenu theme={theme} user={user} />
    </nav>
  )
}

const UserMenu = ({ theme, user }: { theme: string; user: any }) => {
  return <div className={theme}>欢迎，{user.name}</div>
}
```

### useContext 基本用法

```tsx
import { createContext, useContext } from 'react'

// ✅ 步骤1：创建 Context
const ThemeContext = createContext<string>('light')

// ✅ 步骤2：在组件外创建 Context
type User = { name: string; age: number }
const UserContext = createContext<User | null>(null)

// ✅ 步骤3：提供 Context 值
const App = () => {
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState<User>({ name: 'Alice', age: 20 })

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={user}>
        <Header />
        <Main />
        <Footer />
      </UserContext.Provider>
    </ThemeContext.Provider>
  )
}

// ✅ 步骤4：消费 Context
const Header = () => {
  const theme = useContext(ThemeContext)
  const user = useContext(UserContext)

  return (
    <header className={theme}>
      <h1>欢迎，{user?.name}</h1>
    </header>
  )
}
```

### 完整示例：主题切换

```tsx
import { createContext, useContext, useState } from 'react'

// 定义主题类型
type Theme = 'light' | 'dark'

// 创建 Context
const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({
  theme: 'light',
  toggleTheme: () => {}
})

// 主题提供者组件
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light')

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 自定义 Hook（更方便使用）
const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// 使用主题的组件
const ThemedButton = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-${theme}`}
    >
      切换到{theme === 'light' ? '深色' : '浅色'}模式
    </button>
  )
}

const ThemedCard = () => {
  const { theme } = useTheme()

  return (
    <div className={`card card-${theme}`}>
      <h2>卡片标题</h2>
      <p>这是卡片内容，当前主题：{theme}</p>
    </div>
  )
}

// 应用组件
const App = () => {
  return (
    <ThemeProvider>
      <div className="app">
        <ThemedButton />
        <ThemedCard />
      </div>
    </ThemeProvider>
  )
}
```

### 多个 Context 的使用

```tsx
// 创建多个 Context
const ThemeContext = createContext<string>('light')
const UserContext = createContext<{ name: string; role: string } | null>(null)
const LanguageContext = createContext<string>('zh-CN')

// 同时提供多个 Context
const App = () => {
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState({ name: 'Alice', role: 'admin' })
  const [language, setLanguage] = useState('zh-CN')

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={user}>
        <LanguageContext.Provider value={language}>
          <Dashboard />
        </LanguageContext.Provider>
      </UserContext.Provider>
    </ThemeContext.Provider>
  )
}

// 消费多个 Context
const Dashboard = () => {
  const theme = useContext(ThemeContext)
  const user = useContext(UserContext)
  const language = useContext(LanguageContext)

  return (
    <div className={theme}>
      <h1>欢迎，{user?.name}</h1>
      <p>角色：{user?.role}</p>
      <p>语言：{language}</p>
    </div>
  )
}
```

### Context 的默认值

```tsx
// ✅ 提供合理的默认值
const ThemeContext = createContext('light')

const Component = () => {
  const theme = useContext(ThemeContext)  // 如果没有 Provider，使用 'light'
  return <div className={theme}>内容</div>
}

// ❌ 不提供默认值（需要配合 null 检查）
const ThemeContext = createContext<string | null>(null)

const Component = () => {
  const theme = useContext(ThemeContext)
  if (!theme) {
    throw new Error('必须在 ThemeProvider 内使用')
  }
  return <div className={theme}>内容</div>
}
```

### Context 性能优化

```tsx
// ❌ 问题：Provider value 变化导致所有消费者重新渲染
const App = () => {
  const [user, setUser] = useState({ name: 'Alice', age: 20 })

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Component />
    </UserContext.Provider>
  )
}

// ✅ 方案1：使用 useMemo 缓存 value
import { useMemo } from 'react'

const App = () => {
  const [user, setUser] = useState({ name: 'Alice', age: 20 })

  const value = useMemo(() => ({ user, setUser }), [user])

  return (
    <UserContext.Provider value={value}>
      <Component />
    </UserContext.Provider>
  )
}

// ✅ 方案2：拆分 Context（只更新变化的部分）
const UserContext = createContext({ name: '', age: 0 })
const SetUserContext = createContext((user: any) => {})

const App = () => {
  const [user, setUser] = useState({ name: 'Alice', age: 20 })

  return (
    <UserContext.Provider value={user}>
      <SetUserContext.Provider value={setUser}>
        <Component />
      </SetUserContext.Provider>
    </UserContext.Provider>
  )
}
```

## useReducer：复杂状态管理

### useReducer vs useState

```tsx
// useState：适合简单状态
const Counter = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}

// useReducer：适合复杂状态逻辑
const Counter = () => {
  const [state, dispatch] = useReducer(reducer, { count: 0 })

  function reducer(state: any, action: any) {
    switch (action.type) {
      case 'increment':
        return { count: state.count + 1 }
      case 'decrement':
        return { count: state.count - 1 }
      default:
        return state
    }
  }

  return (
    <div>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-1</button>
    </div>
  )
}
```

### useReducer 基本用法

```tsx
import { useReducer } from 'react'

// 定义状态类型
type State = {
  count: number
  step: number
}

// 定义 action 类型
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'setStep'; payload: number }

// 定义初始状态
const initialState: State = {
  count: 0,
  step: 1
}

// 定义 reducer 函数
function counterReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step }
    case 'decrement':
      return { ...state, count: state.count - state.step }
    case 'reset':
      return initialState
    case 'setStep':
      return { ...state, step: action.payload }
    default:
      return state
  }
}

// 使用 reducer
const Counter = () => {
  const [state, dispatch] = useReducer(counterReducer, initialState)

  return (
    <div className="counter">
      <h2>计数器：{state.count}</h2>
      <p>步长：{state.step}</p>

      <div className="controls">
        <button onClick={() => dispatch({ type: 'decrement' })}>
          -{state.step}
        </button>
        <button onClick={() => dispatch({ type: 'increment' })}>
          +{state.step}
        </button>
        <button onClick={() => dispatch({ type: 'reset' })}>
          重置
        </button>
      </div>

      <div className="step-controls">
        <button onClick={() => dispatch({ type: 'setStep', payload: 1 })}>
          步长 1
        </button>
        <button onClick={() => dispatch({ type: 'setStep', payload: 5 })}>
          步长 5
        </button>
        <button onClick={() => dispatch({ type: 'setStep', payload: 10 })}>
          步长 10
        </button>
      </div>
    </div>
  )
}
```

### 惰性初始化

```tsx
// ✅ 使用函数初始化复杂状态
const initialState = () => ({
  count: 0,
  step: 1,
  history: [] as number[],
  timestamp: Date.now()
})

const Counter = () => {
  const [state, dispatch] = useReducer(
    counterReducer,
    null,
    initialState  // 初始化函数，只执行一次
  )

  return <div>{state.count}</div>
}
```

### 复杂状态管理示例

```tsx
// TODO 应用状态管理
type Todo = {
  id: number
  text: string
  completed: boolean
}

type TodoState = {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
}

type TodoAction =
  | { type: 'add'; payload: string }
  | { type: 'toggle'; payload: number }
  | { type: 'delete'; payload: number }
  | { type: 'setFilter'; payload: TodoState['filter'] }
  | { type: 'clearCompleted' }

const initialState: TodoState = {
  todos: [],
  filter: 'all'
}

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now(),
            text: action.payload,
            completed: false
          }
        ]
      }

    case 'toggle':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      }

    case 'delete':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      }

    case 'setFilter':
      return {
        ...state,
        filter: action.payload
      }

    case 'clearCompleted':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      }

    default:
      return state
  }
}

const TodoApp = () => {
  const [state, dispatch] = useReducer(todoReducer, initialState)
  const [inputValue, setInputValue] = useState('')

  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'active') return !todo.completed
    if (state.filter === 'completed') return todo.completed
    return true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      dispatch({ type: 'add', payload: inputValue })
      setInputValue('')
    }
  }

  return (
    <div className="todo-app">
      <h1>待办事项</h1>

      <form onSubmit={handleSubmit} className="input-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="添加新任务..."
        />
        <button type="submit">添加</button>
      </form>

      <div className="filters">
        <button
          className={state.filter === 'all' ? 'active' : ''}
          onClick={() => dispatch({ type: 'setFilter', payload: 'all' })}
        >
          全部 ({state.todos.length})
        </button>
        <button
          className={state.filter === 'active' ? 'active' : ''}
          onClick={() => dispatch({ type: 'setFilter', payload: 'active' })}
        >
          未完成 ({state.todos.filter(t => !t.completed).length})
        </button>
        <button
          className={state.filter === 'completed' ? 'active' : ''}
          onClick={() => dispatch({ type: 'setFilter', payload: 'completed' })}
        >
          已完成 ({state.todos.filter(t => t.completed).length})
        </button>
      </div>

      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'toggle', payload: todo.id })}
            />
            <span>{todo.text}</span>
            <button
              onClick={() => dispatch({ type: 'delete', payload: todo.id })}
            >
              删除
            </button>
          </li>
        ))}
      </ul>

      {state.todos.some(t => t.completed) && (
        <button
          className="clear-btn"
          onClick={() => dispatch({ type: 'clearCompleted' })}
        >
          清除已完成 ({state.todos.filter(t => t.completed).length})
        </button>
      )}
    </div>
  )
}
```

## 实战案例：主题切换 + 全局状态管理

```tsx
import { createContext, useContext, useReducer, ReactNode } from 'react'

// ==================== 类型定义 ====================
type Theme = 'light' | 'dark'
type Language = 'zh-CN' | 'en-US'

type AppState = {
  theme: Theme
  language: Language
  user: { name: string; email: string } | null
  notifications: number
}

type AppAction =
  | { type: 'toggleTheme' }
  | { type: 'setLanguage'; payload: Language }
  | { type: 'login'; payload: { name: string; email: string } }
  | { type: 'logout' }
  | { type: 'addNotification' }
  | { type: 'clearNotifications' }

// ==================== Reducer ====================
const initialState: AppState = {
  theme: 'light',
  language: 'zh-CN',
  user: null,
  notifications: 0
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'toggleTheme':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      }

    case 'setLanguage':
      return {
        ...state,
        language: action.payload
      }

    case 'login':
      return {
        ...state,
        user: action.payload
      }

    case 'logout':
      return {
        ...state,
        user: null
      }

    case 'addNotification':
      return {
        ...state,
        notifications: state.notifications + 1
      }

    case 'clearNotifications':
      return {
        ...state,
        notifications: 0
      }

    default:
      return state
  }
}

// ==================== Context ====================
const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

// ==================== Provider ====================
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// ==================== Custom Hooks ====================
export const useAppState = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState must be used within AppProvider')
  }
  return context.state
}

export const useAppActions = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppActions must be used within AppProvider')
  }

  return {
    toggleTheme: () => context.dispatch({ type: 'toggleTheme' }),
    setLanguage: (lang: Language) =>
      context.dispatch({ type: 'setLanguage', payload: lang }),
    login: (user: { name: string; email: string }) =>
      context.dispatch({ type: 'login', payload: user }),
    logout: () => context.dispatch({ type: 'logout' }),
    addNotification: () => context.dispatch({ type: 'addNotification' }),
    clearNotifications: () => context.dispatch({ type: 'clearNotifications' })
  }
}

// ==================== 组件 ====================
const Header = () => {
  const { theme, user, notifications } = useAppState()
  const { toggleTheme, logout } = useAppActions()

  return (
    <header className={`header header-${theme}`}>
      <div className="logo">MyApp</div>

      <nav className="nav">
        <a href="/">首页</a>
        <a href="/about">关于</a>
        <a href="/contact">联系</a>
      </nav>

      <div className="user-area">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <button className="notification-btn">
          🔔 {notifications > 0 && <span className="badge">{notifications}</span>}
        </button>

        {user ? (
          <div className="user-info">
            <span>{user.name}</span>
            <button onClick={logout}>退出</button>
          </div>
        ) : (
          <button className="login-btn">登录</button>
        )}
      </div>
    </header>
  )
}

const Dashboard = () => {
  const { language, user, notifications } = useAppState()
  const { addNotification, clearNotifications } = useAppActions()

  const texts = {
    'zh-CN': {
      title: '仪表板',
      welcome: '欢迎',
      notification: '添加通知',
      clear: '清除通知'
    },
    'en-US': {
      title: 'Dashboard',
      welcome: 'Welcome',
      notification: 'Add Notification',
      clear: 'Clear Notifications'
    }
  }

  const t = texts[language]

  return (
    <main className="dashboard">
      <h1>{t.title}</h1>

      {user ? (
        <div className="welcome-card">
          <h2>{t.welcome}，{user.name}！</h2>
          <p>邮箱：{user.email}</p>
        </div>
      ) : (
        <div className="guest-card">
          <h2>访客模式</h2>
          <p>请登录以访问完整功能</p>
        </div>
      )}

      <div className="stats">
        <div className="stat-card">
          <h3>通知数</h3>
          <p className="value">{notifications}</p>
        </div>

        <div className="stat-card">
          <h3>当前语言</h3>
          <p className="value">{language}</p>
        </div>
      </div>

      <div className="actions">
        <button onClick={addNotification}>
          {t.notification}
        </button>
        {notifications > 0 && (
          <button onClick={clearNotifications}>
            {t.clear} ({notifications})
          </button>
        )}
      </div>
    </main>
  )
}

const Settings = () => {
  const { language } = useAppState()
  const { setLanguage, login, logout } = useAppActions()

  const handleLogin = () => {
    login({
      name: '张三',
      email: 'zhangsan@example.com'
    })
  }

  return (
    <aside className="settings">
      <h2>设置</h2>

      <div className="setting-group">
        <h3>语言</h3>
        <div className="language-selector">
          <button
            className={language === 'zh-CN' ? 'active' : ''}
            onClick={() => setLanguage('zh-CN')}
          >
            中文
          </button>
          <button
            className={language === 'en-US' ? 'active' : ''}
            onClick={() => setLanguage('en-US')}
          >
            English
          </button>
        </div>
      </div>

      <div className="setting-group">
        <h3>账户</h3>
        <button onClick={handleLogin}>模拟登录</button>
      </div>
    </aside>
  )
}

const App = () => {
  const { theme } = useAppState()

  return (
    <div className={`app app-${theme}`}>
      <Header />
      <div className="main-content">
        <Dashboard />
        <Settings />
      </div>
    </div>
  )
}

// 导出根组件
const Root = () => {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  )
}

export default Root
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
}

/* 主题变量 */
.app {
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
}

.app-light {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #ddd;
  --shadow: rgba(0, 0, 0, 0.1);
}

.app-dark {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --border-color: #444;
  --shadow: rgba(0, 0, 0, 0.3);
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.header-light {
  background-color: #fff;
}

.header-dark {
  background-color: #242424;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
}

.nav {
  display: flex;
  gap: 20px;
}

.nav a {
  color: var(--text-primary);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav a:hover {
  background-color: var(--bg-primary);
}

.user-area {
  display: flex;
  gap: 15px;
  align-items: center;
}

.theme-toggle,
.notification-btn,
.login-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle:hover,
.notification-btn:hover {
  background-color: var(--bg-secondary);
}

.badge {
  position: relative;
  top: -8px;
  right: -8px;
  background-color: #f44336;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
}

.user-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard {
  background-color: var(--bg-primary);
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow);
}

.welcome-card,
.guest-card {
  background-color: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.stat-card {
  background-color: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-card .value {
  font-size: 32px;
  font-weight: bold;
  color: #2196F3;
  margin-top: 10px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #2196F3;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.actions button:hover {
  background-color: #1976D2;
}

/* Settings */
.settings {
  background-color: var(--bg-primary);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow);
  height: fit-content;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group h3 {
  margin-bottom: 10px;
  color: var(--text-secondary);
}

.language-selector {
  display: flex;
  gap: 10px;
}

.language-selector button {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 4px;
  cursor: pointer;
}

.language-selector button.active {
  background-color: #2196F3;
  color: white;
  border-color: #2196F3;
}

/* Counter Styles */
.counter {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  text-align: center;
  background-color: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow);
}

.counter h2 {
  font-size: 48px;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.controls,
.step-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.controls button,
.step-controls button {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button:hover,
.step-controls button:hover {
  background-color: #2196F3;
  color: white;
  border-color: #2196F3;
}

/* Todo App */
.todo-app {
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  background-color: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow);
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.input-group input {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.input-group button {
  padding: 12px 24px;
  border: none;
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filters button {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 4px;
  cursor: pointer;
}

.filters button.active {
  background-color: #2196F3;
  color: white;
  border-color: #2196F3;
}

.todo-list {
  list-style: none;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.clear-btn {
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  border: none;
  background-color: #f44336;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.clear-btn:hover {
  background-color: #d32f2f;
}
```

## 最佳实践

### 1. 何时使用 Context

```tsx
// ✅ 适合使用 Context 的场景：
// - 主题（深色/浅色模式）
// - 用户信息（登录状态、用户数据）
// - 语言（国际化）
// - 应用级配置

// ❌ 不适合使用 Context 的场景：
// - 频繁变化的状态（如输入框内容）
// - 组件特定的状态
// - 可以通过 props 传递的简单数据
```

### 2. 何时使用 useReducer

```tsx
// ✅ 适合使用 useReducer 的场景：
// - 复杂的状态逻辑
// - 下一个状态依赖于前一个状态
// - 多个相关的状态需要一起更新
// - 需要可预测的状态更新（便于测试）

// ❌ 不适合使用 useReducer 的场景：
// - 简单的独立状态
// - 不相关的状态（应该拆分成多个 reducer）
```

### 3. Context + useReducer 组合

```tsx
// 这是 React 管理全局状态的最佳实践之一
const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}
```

## 总结

本章我们学习了：

✅ useContext 的基本用法和创建 Context
✅ 多个 Context 的使用和性能优化
✅ useReducer 的基本用法和最佳实践
✅ useReducer vs useState 的使用场景
✅ 实战案例：主题切换 + 全局状态管理
✅ Context + useReducer 的组合使用

**下一步：** 第59章将学习 useRef 与 useMemo，掌握更多性能优化技巧。
