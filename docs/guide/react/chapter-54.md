# ：事件处理与条件渲染

## 事件处理基础

React 使用合成事件（SyntheticEvent）系统，统一了不同浏览器的事件处理。

### 基本事件处理

```tsx
const ButtonClick = () => {
  const handleClick = () => {
    console.log('按钮被点击了！')
  }

  return <button onClick={handleClick}>点击我</button>
}

// 使用箭头函数
const ButtonClickInline = () => {
  return (
    <button onClick={() => console.log('点击了！')}>
      点击我
    </button>
  )
}
```

### 事件对象

```tsx
const FormComponent = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()  // 阻止默认行为
    console.log('表单提交了')
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('输入值：', event.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" onChange={handleInputChange} />
      <button type="submit">提交</button>
    </form>
  )
}
```

### 常用事件类型

```tsx
const EventTypes = () => {
  // 鼠标事件
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('鼠标进入', e.clientX, e.clientY)
  }

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('按键：', e.key, e.code)
  }

  // 焦点事件
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log('获得焦点')
  }

  // 表单事件
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('值改变：', e.target.value)
  }

  // 滚动事件
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    console.log('滚动位置：', e.currentTarget.scrollTop)
  }

  return (
    <div>
      <div onMouseEnter={handleMouseEnter}>鼠标悬停区域</div>
      <input onKeyDown={handleKeyDown} onFocus={handleFocus} />
      <input onChange={handleChange} />
      <div onScroll={handleScroll} style={{ height: '100px', overflow: 'auto' }}>
        <div style={{ height: '500px' }}>滚动内容</div>
      </div>
    </div>
  )
}
```

## 事件处理详解

### 1. 传递参数

```tsx
const ButtonList = () => {
  const handleClick = (buttonName: string) => {
    console.log(`点击了 ${buttonName} 按钮`)
  }

  return (
    <div>
      <button onClick={() => handleClick('确定')}>确定</button>
      <button onClick={() => handleClick('取消')}>取消</button>
    </div>
  )
}

// 同时传递事件对象和参数
const ListItem = ({ items }: { items: string[] }) => {
  const handleClick = (item: string, index: number, e: React.MouseEvent) => {
    console.log('点击项：', item)
    console.log('索引：', index)
    console.log('事件对象：', e)
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index} onClick={(e) => handleClick(item, index, e)}>
          {item}
        </li>
      ))}
    </ul>
  )
}
```

### 2. 阻止事件传播

```tsx
const EventPropagation = () => {
  const handleParentClick = () => {
    console.log('父元素被点击')
  }

  const handleChildClick = (e: React.MouseEvent) => {
    e.stopPropagation()  // 阻止事件冒泡
    console.log('子元素被点击')
  }

  return (
    <div onClick={handleParentClick} style={{ padding: '20px', background: 'lightblue' }}>
      <div onClick={handleChildClick} style={{ padding: '20px', background: 'lightcoral' }}>
        子元素（点击不会触发父元素的点击）
      </div>
    </div>
  )
}
```

### 3. 阻止默认行为

```tsx
const PreventDefault = () => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()  // 阻止链接跳转
    console.log('链接被点击，但不会跳转')
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()  // 阻止表单提交
    console.log('表单提交被阻止')
  }

  return (
    <div>
      <a href="https://example.com" onClick={handleLinkClick}>
        点击这个链接不会跳转
      </a>

      <form onSubmit={handleFormSubmit}>
        <input type="text" />
        <button type="submit">提交</button>
      </form>
    </div>
  )
}
```

### 4. this 绑定（仅在类组件中）

```tsx
// 类组件中的 this 绑定方式

// 方式一：类属性箭头函数（推荐）
class MyClassComponent extends React.Component {
  state = { count: 0 }

  // 箭头函数自动绑定 this
  handleClick = () => {
    this.setState({ count: this.state.count + 1 })
  }

  render() {
    return <button onClick={this.handleClick}>{this.state.count}</button>
  }
}

// 方式二：在构造函数中绑定
class MyClassComponent2 extends React.Component {
  constructor(props: any) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    console.log('点击了')
  }

  render() {
    return <button onClick={this.handleClick}>点击</button>
  }
}

// 方式三：使用箭头函数（不推荐，每次渲染都创建新函数）
class MyClassComponent3 extends React.Component {
  handleClick() {
    console.log('点击了')
  }

  render() {
    return <button onClick={() => this.handleClick()}>点击</button>
  }
}
```

## 条件渲染详解

### 1. 三元运算符

```tsx
const UserGreeting = ({ isLoggedIn, username }: {
  isLoggedIn: boolean
  username: string
}) => {
  return (
    <div>
      {isLoggedIn ? (
        <h1>欢迎回来，{username}！</h1>
      ) : (
        <h1>请先登录</h1>
      )}
    </div>
  )
}
```

### 2. 逻辑与（&&）运算符

```tsx
const WarningBanner = ({ warn }: { warn: boolean }) => {
  if (!warn) {
    return null
  }

  return <div className="warning">警告信息</div>
}

// 更简洁的写法
const WarningBanner2 = ({ warn }: { warn: boolean }) => {
  return (
    <>
      {warn && <div className="warning">警告信息</div>}
    </>
  )
}

// 多条件判断
const MultiCondition = ({ score }: { score: number }) => {
  return (
    <div>
      {score >= 90 && <div className="excellent">优秀</div>}
      {score >= 80 && score < 90 && <div className="good">良好</div>}
      {score >= 60 && score < 80 && <div className="pass">及格</div>}
      {score < 60 && <div className="fail">不及格</div>}
    </div>
  )
}
```

### 3. 变量存储

```tsx
const Notification = ({ type, message }: {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}) => {
  let notification

  switch (type) {
    case 'success':
      notification = <div className="success">✓ {message}</div>
      break
    case 'error':
      notification = <div className="error">✗ {message}</div>
      break
    case 'warning':
      notification = <div className="warning">⚠ {message}</div>
      break
    case 'info':
      notification = <div className="info">ℹ {message}</div>
      break
  }

  return <div className="notification">{notification}</div>
}
```

### 4. 立即执行函数

```tsx
const ComplexCondition = ({ user, permissions }: {
  user: { name: string } | null
  permissions: string[]
}) => {
  return (
    <div>
      {(() => {
        if (!user) {
          return <button>登录</button>
        }

        if (permissions.includes('admin')) {
          return <button>管理面板</button>
        }

        if (permissions.includes('user')) {
          return <button>用户中心</button>
        }

        return <div>无权限</div>
      })()}
    </div>
  )
}
```

### 5. 提前返回

```tsx
const UserProfile = ({ user }: { user: { name: string; age: number } | null }) => {
  // 提前返回 null
  if (!user) {
    return null
  }

  // 提前返回加载状态
  if (user === undefined) {
    return <div>加载中...</div>
  }

  // 主渲染逻辑
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.age}岁</p>
    </div>
  )
}

// 更简洁的写法
const UserProfile2 = ({ user }: { user: { name: string; age: number } | null }) => {
  if (!user) return null
  if (user === undefined) return <div>加载中...</div>

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.age}岁</p>
    </div>
  )
}
```

### 6. 防止组件渲染

```tsx
// 返回 null 不会渲染任何内容
const ConditionalComponent = ({ show }: { show: boolean }) => {
  if (!show) {
    return null
  }

  return <div>这个组件会被渲染</div>
}

// 返回 false、true、undefined 也不会渲染
const NoRender = () => {
  return false  // 什么都不渲染
}

const NoRender2 = () => {
  return true  // 什么都不渲染
}

const NoRender3 = () => {
  return undefined  // 什么都不渲染
}
```

## 实战案例：登录表单

```tsx
import { useState, FormEvent } from 'react'

interface LoginFormData {
  username: string
  password: string
  remember: boolean
}

const LoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    remember: false
  })

  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 验证表单
  const validate = (): boolean => {
    const newErrors: Partial<LoginFormData> = {}

    if (!formData.username) {
      newErrors.username = '用户名不能为空'
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符'
    }

    if (!formData.password) {
      newErrors.password = '密码不能为空'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6个字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理输入变化
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // 清除该字段的错误
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  // 处理表单提交
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsLoading(true)

    // 模拟 API 调用
    setTimeout(() => {
      console.log('登录数据：', formData)
      setIsLoggedIn(true)
      setIsLoading(false)
    }, 1500)
  }

  // 处理退出
  const handleLogout = () => {
    setIsLoggedIn(false)
    setFormData({ username: '', password: '', remember: false })
  }

  // 登录成功后显示
  if (isLoggedIn) {
    return (
      <div className="login-success">
        <h1>🎉 登录成功！</h1>
        <p>欢迎，{formData.username}！</p>
        <button onClick={handleLogout}>退出登录</button>
      </div>
    )
  }

  return (
    <div className="login-container">
      <h1>用户登录</h1>

      <form onSubmit={handleSubmit} className="login-form">
        {/* 用户名 */}
        <div className="form-group">
          <label htmlFor="username">用户名</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={errors.username ? 'error' : ''}
            placeholder="请输入用户名"
            autoComplete="username"
          />
          {errors.username && (
            <span className="error-message">{errors.username}</span>
          )}
        </div>

        {/* 密码 */}
        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
            placeholder="请输入密码"
            autoComplete="current-password"
          />
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>

        {/* 记住我 */}
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="remember"
            name="remember"
            checked={formData.remember}
            onChange={handleChange}
          />
          <label htmlFor="remember">记住我</label>
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? '登录中...' : '登录'}
        </button>
      </form>

      {/* 其他链接 */}
      <div className="form-footer">
        <a href="#forgot-password">忘记密码？</a>
        <a href="#register">注册新账号</a>
      </div>
    </div>
  )
}

export default LoginForm
```

**配套样式：**

```css
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="password"] {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 12px;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.submit-btn {
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #45a049;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.form-footer a {
  color: #2196F3;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

.login-success {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  text-align: center;
  border: 1px solid #4CAF50;
  border-radius: 8px;
  background-color: #f1f8f4;
}

.login-success h1 {
  color: #4CAF50;
}

.login-success button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

## 键盘事件实战

```tsx
const KeyboardDemo = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev].slice(0, 10))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = 10

    switch (e.key) {
      case 'ArrowUp':
        setPosition(prev => ({ ...prev, y: prev.y - step }))
        addLog('↑ 上移')
        break
      case 'ArrowDown':
        setPosition(prev => ({ ...prev, y: prev.y + step }))
        addLog('↓ 下移')
        break
      case 'ArrowLeft':
        setPosition(prev => ({ ...prev, x: prev.x - step }))
        addLog('← 左移')
        break
      case 'ArrowRight':
        setPosition(prev => ({ ...prev, x: prev.x + step }))
        addLog('→ 右移')
        break
      case 'Escape':
        setPosition({ x: 0, y: 0 })
        addLog('ESC 重置位置')
        break
      default:
        addLog(`按键：${e.key}`)
    }
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="keyboard-demo"
      style={{ outline: 'none' }}
    >
      <h2>键盘事件演示</h2>
      <p>使用方向键移动方块，ESC 重置位置</p>

      <div
        className="box"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.1s'
        }}
      >
        🎯
      </div>

      <div className="info">
        <p>位置：X: {position.x}, Y: {position.y}</p>
      </div>

      <div className="logs">
        <h3>事件日志</h3>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  )
}
```

## 总结

本章我们学习了：

✅ React 事件处理基础（合成事件系统）
✅ 事件对象和常用事件类型
✅ 传递参数、阻止事件传播、阻止默认行为
✅ 条件渲染的六种方式（三元运算符、逻辑与、变量存储、立即执行函数、提前返回、返回 null）
✅ 实战案例：登录表单（包含完整的验证和状态管理）
✅ 键盘事件实战

**下一步：** 第55章将学习列表渲染与 Keys，深入理解如何在 React 中高效渲染列表数据。
