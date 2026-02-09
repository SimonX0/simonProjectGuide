# ：JSX语法与组件基础

## JSX 语法深度解析

JSX（JavaScript XML）是 React 的核心特性之一，它让我们可以在 JavaScript 中编写类似 HTML 的代码。

### JSX 的本质

JSX 仅仅是一个语法糖，编译后会被转换为 `React.createElement()` 调用。

```tsx
// JSX 写法
const element = <h1>Hello, React!</h1>

// 编译后的 JavaScript（你不需要写这个，React 会自动转换）
const element = React.createElement('h1', null, 'Hello, React!')

// 完整形式
React.createElement(
  'h1',           // 元素类型
  null,           // 属性（props）
  'Hello, React!' // 子元素
)
```

**带属性的示例：**

```tsx
// JSX 写法
const element = (
  <div className="container" id="main">
    <h1 className="title">标题</h1>
  </div>
)

// 编译后
const element = React.createElement(
  'div',
  { className: 'container', id: 'main' },
  React.createElement('h1', { className: 'title' }, '标题')
)
```

### JSX 语法规则详解

#### 1. 根元素规则

```tsx
// ❌ 错误：多个根元素
const element = (
  <h1>标题</h1>
  <p>段落</p>
)

// ✅ 方式一：包裹在一个 div 中
const element = (
  <div>
    <h1>标题</h1>
    <p>段落</p>
  </div>
)

// ✅ 方式二：使用 Fragment（React 18+ 推荐）
import { Fragment } from 'react'

const element = (
  <Fragment>
    <h1>标题</h1>
    <p>段落</p>
  </Fragment>
)

// ✅ 方式三：使用空标签（Fragment 的简写）
const element = (
  <>
    <h1>标题</h1>
    <p>段落</p>
  </>
)
```

#### 2. 属性命名规则

```tsx
// JSX 中的属性名使用驼峰命名（与 HTML 不同）

// HTML
<div class="container" onclick="handleClick()">

// JSX
<div className="container" onClick={handleClick}>

// 常见属性对照表
className     // HTML: class
htmlFor       // HTML: for
tabIndex      // HTML: tabindex
readOnly      // HTML: readonly
```

**完整示例：**

```tsx
const MyComponent = () => {
  const handleClick = () => {
    console.log('Button clicked!')
  }

  return (
    <div className="container" tabIndex={0}>
      <label htmlFor="username">用户名：</label>
      <input
        type="text"
        id="username"
        className="input-field"
        readOnly={false}
        onClick={handleClick}
      />
    </div>
  )
}
```

#### 3. 自闭合标签

```tsx
// ❌ 错误：非自闭合标签未闭合
const element = <img src="logo.png">
const element = <input type="text">

// ✅ 正确：必须闭合
const element = <img src="logo.png" />
const element = <img src="logo.png"></img>
const element = <input type="text" />
const element = <input type="text"></input>

// 有子元素的标签不能自闭合
const element = <div>内容</div>  // ✅
const element = <div />          // ✅ 空元素可以
```

#### 4. JavaScript 表达式

```tsx
// 使用花括号 {} 包裹 JavaScript 表达式

const name = 'React'
const age = 18
const isStudent = true
const colors = ['red', 'green', 'blue']
const user = { name: 'Alice', age: 20 }

const element = (
  <div>
    {/* 变量 */}
    <h1>Hello, {name}!</h1>

    {/* 表达式计算 */}
    <p>明年 {age + 1} 岁</p>

    {/* 三元表达式 */}
    <p>身份：{isStudent ? '学生' : '上班族'}</p>

    {/* 对象属性访问 */}
    <p>用户：{user.name}</p>

    {/* 方法调用 */}
    <p>名称长度：{name.length}</p>

    {/* ❌ 错误：不能是语句 */}
    {/* <p>{if (isStudent) { return '学生' }}</p> */}
  </div>
)
```

**实战示例：动态问候语**

```tsx
const Greeting = () => {
  const [name, setName] = React.useState('')

  const getGreeting = (hour: number) => {
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  const hour = new Date().getHours()

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="输入你的名字"
      />
      <h1>
        {name ? `${getGreeting(hour)}，${name}！` : '欢迎！'}
      </h1>
    </div>
  )
}
```

#### 5. 条件渲染

```tsx
// 方式一：三元运算符
const UserStatus = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  return (
    <div>
      {isLoggedIn ? <Welcome /> : <Login />}
    </div>
  )
}

// 方式二：逻辑与（&&）运算符
const Notification = ({ message }: { message?: string }) => {
  return (
    <div>
      {message && <div className="notification">{message}</div>}
    </div>
  )
}

// 方式三：变量
const UserInfo = ({ user }: { user: { name: string; age: number } | null }) => {
  let content

  if (user) {
    content = <div>{user.name} - {user.age}岁</div>
  } else {
    content = <div>未登录</div>
  }

  return <div>{content}</div>
}

// 方式四：立即执行函数（复杂逻辑）
const UserList = ({ users }: { users: string[] }) => {
  return (
    <ul>
      {(() => {
        if (users.length === 0) {
          return <li>暂无用户</li>
        }
        return users.map(user => <li key={user}>{user}</li>)
      })()}
    </ul>
  )
}
```

**实战示例：登录状态显示**

```tsx
interface User {
  name: string
  avatar: string
}

const UserProfile = ({ user }: { user: User | null }) => {
  return (
    <div className="user-profile">
      {user ? (
        <>
          <img src={user.avatar} alt={user.name} />
          <h2>欢迎，{user.name}!</h2>
          <button>退出登录</button>
        </>
      ) : (
        <>
          <h2>请先登录</h2>
          <button>登录</button>
          <button>注册</button>
        </>
      )}
    </div>
  )
}
```

#### 6. 列表渲染

```tsx
// 使用 map() 方法渲染列表
const NumberList = () => {
  const numbers = [1, 2, 3, 4, 5]

  return (
    <ul>
      {numbers.map((number) => (
        <li key={number}>{number}</li>
      ))}
    </ul>
  )
}

// 渲染对象数组
const UserList = () => {
  const users = [
    { id: 1, name: 'Alice', age: 20 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Charlie', age: 30 }
  ]

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} - {user.age}岁
        </li>
      ))}
    </ul>
  )
}

// 使用 filter() 过滤后再渲染
const ActiveUsers = () => {
  const users = [
    { id: 1, name: 'Alice', active: true },
    { id: 2, name: 'Bob', active: false },
    { id: 3, name: 'Charlie', active: true }
  ]

  return (
    <ul>
      {users
        .filter(user => user.active)
        .map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
    </ul>
  )
}
```

**关于 key 的说明：**

```tsx
// ✅ 推荐：使用唯一 ID 作为 key
{users.map(user => (
  <li key={user.id}>{user.name}</li>
))}

// ⚠️ 可以接受：使用索引作为 key（仅当列表静态时）
{items.map((item, index) => (
  <li key={index}>{item}</li>
))}

// ❌ 错误：不要使用随机数或 Math.random()
{items.map(item => (
  <li key={Math.random()}>{item}</li>
))}

// ❌ 错误：不要在 key 中使用对象（对象不能作为 key）
{items.map(item => (
  <li key={item}>{item}</li>
))}
```

**key 的作用：**

```tsx
// key 帮助 React 识别哪些元素改变了
// 示例：带删除功能的待办事项

const TodoList = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习 React', done: false },
    { id: 2, text: '写代码', done: false },
    { id: 3, text: '调试 Bug', done: false }
  ])

  const removeTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input type="checkbox" checked={todo.done} />
          <span>{todo.text}</span>
          <button onClick={() => removeTodo(todo.id)}>删除</button>
        </li>
      ))}
    </ul>
  )
}
```

## 组件深入

### 函数组件 vs 类组件

**React 18+ 强烈推荐使用函数组件！**

```tsx
// ✅ 推荐：函数组件（React 18+）
const Welcome = () => {
  return <h1>Hello!</h1>
}

// ❌ 不推荐：类组件（遗留代码）
class Welcome extends React.Component {
  render() {
    return <h1>Hello!</h1>
  }
}
```

### 组件命名规范

```tsx
// ✅ 组件名必须大写开头
const Header = () => <h1>标题</h1>
const UserProfile = () => <div>用户信息</div>

// ❌ 小写开头会被视为 HTML 标签
const header = () => <h1>标题</h1>  // 错误！

// ✅ 使用 PascalCase（帕斯卡命名法）
const MyComponent = () => <div>...</div>
const UserProfile = () => <div>...</div>

// ❌ 不要使用 kebab-case 或 snake_case
const my-component = () => <div>...</div>  // 错误！
const my_component = () => <div>...</div>  // 错误！
```

### 组件的返回值

```tsx
// ✅ 返回 JSX
const Component1 = () => {
  return <div>Hello</div>
}

// ✅ 返回 Fragment
const Component2 = () => {
  return (
    <>
      <h1>标题</h1>
      <p>段落</p>
    </>
  )
}

// ✅ 返回数组（React 16+）
const Component3 = () => {
  return [
    <h1 key="1">标题</h1>,
    <p key="2">段落</p>
  ]
}

// ✅ 返回 null（不渲染任何内容）
const Component4 = () => {
  const shouldShow = false
  return shouldShow ? <div>显示</div> : null
}

// ✅ 返回字符串
const Component5 = () => {
  return 'Hello World'
}

// ✅ 返回数字
const Component6 = () => {
  return 42
}

// ❌ 不能返回对象（会被误认为是 props）
const Component7 = () => {
  return { name: 'Alice' }  // 错误！
}

// ✅ 返回布尔值（但不渲染任何内容）
const Component8 = () => {
  return true  // 不显示任何内容
}
```

## 实战案例：学生成绩管理系统

```tsx
// src/components/StudentManager.tsx
import { useState } from 'react'

interface Student {
  id: number
  name: string
  score: number
}

const StudentManager = () => {
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: '张三', score: 85 },
    { id: 2, name: '李四', score: 92 },
    { id: 3, name: '王五', score: 78 }
  ])
  const [newName, setNewName] = useState('')
  const [newScore, setNewScore] = useState('')

  // 添加学生
  const addStudent = () => {
    if (newName.trim() && newScore.trim()) {
      const student: Student = {
        id: Date.now(),
        name: newName,
        score: parseInt(newScore)
      }
      setStudents([...students, student])
      setNewName('')
      setNewScore('')
    }
  }

  // 删除学生
  const deleteStudent = (id: number) => {
    setStudents(students.filter(s => s.id !== id))
  }

  // 计算统计数据
  const stats = {
    total: students.length,
    average: students.length > 0
      ? (students.reduce((sum, s) => sum + s.score, 0) / students.length).toFixed(2)
      : 0,
    max: students.length > 0
      ? Math.max(...students.map(s => s.score))
      : 0,
    min: students.length > 0
      ? Math.min(...students.map(s => s.score))
      : 0
  }

  // 获取等级
  const getGrade = (score: number) => {
    if (score >= 90) return '优秀'
    if (score >= 80) return '良好'
    if (score >= 70) return '中等'
    if (score >= 60) return '及格'
    return '不及格'
  }

  // 获取等级样式
  const getGradeClass = (score: number) => {
    if (score >= 90) return 'grade-excellent'
    if (score >= 80) return 'grade-good'
    if (score >= 70) return 'grade-medium'
    if (score >= 60) return 'grade-pass'
    return 'grade-fail'
  }

  return (
    <div className="student-manager">
      <h1>📊 学生成绩管理系统</h1>

      {/* 添加学生表单 */}
      <div className="add-form">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="学生姓名"
        />
        <input
          type="number"
          value={newScore}
          onChange={(e) => setNewScore(e.target.value)}
          placeholder="成绩（0-100）"
          min="0"
          max="100"
        />
        <button onClick={addStudent}>添加</button>
      </div>

      {/* 统计信息 */}
      {students.length > 0 && (
        <div className="stats">
          <div className="stat-item">
            <span className="label">总人数：</span>
            <span className="value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="label">平均分：</span>
            <span className="value">{stats.average}</span>
          </div>
          <div className="stat-item">
            <span className="label">最高分：</span>
            <span className="value">{stats.max}</span>
          </div>
          <div className="stat-item">
            <span className="label">最低分：</span>
            <span className="value">{stats.min}</span>
          </div>
        </div>
      )}

      {/* 学生列表 */}
      <table className="student-table">
        <thead>
          <tr>
            <th>学号</th>
            <th>姓名</th>
            <th>成绩</th>
            <th>等级</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-state">
                暂无学生数据，请添加学生
              </td>
            </tr>
          ) : (
            students.map(student => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.score}</td>
                <td>
                  <span className={`grade ${getGradeClass(student.score)}`}>
                    {getGrade(student.score)}
                  </span>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteStudent(student.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default StudentManager
```

**配套样式：**

```css
/* src/components/StudentManager.css */
.student-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.add-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.add-form input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-form button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.stats {
  display: flex;
  gap: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  gap: 5px;
}

.stat-item .label {
  font-weight: bold;
}

.stat-item .value {
  color: #007bff;
}

.student-table {
  width: 100%;
  border-collapse: collapse;
}

.student-table th,
.student-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.student-table th {
  background-color: #007bff;
  color: white;
}

.student-table tr:hover {
  background-color: #f5f5f5;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 20px !important;
}

.grade {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.grade-excellent {
  background-color: #4CAF50;
  color: white;
}

.grade-good {
  background-color: #2196F3;
  color: white;
}

.grade-medium {
  background-color: #FF9800;
  color: white;
}

.grade-pass {
  background-color: #9C27B0;
  color: white;
}

.grade-fail {
  background-color: #f44336;
  color: white;
}

.delete-btn {
  padding: 5px 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #d32f2f;
}
```

## 最佳实践

### 1. 组件职责单一

```tsx
// ✅ 好：每个组件只做一件事
const UserAvatar = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="avatar" />
)

const UserName = ({ name }: { name: string }) => (
  <h2 className="name">{name}</h2>
)

const UserProfile = () => (
  <div>
    <UserAvatar src="/avatar.jpg" alt="用户头像" />
    <UserName name="Alice" />
  </div>
)

// ❌ 不好：一个组件做了太多事情
const UserProfile = () => (
  <div>
    <div className="avatar-container">
      <img src="/avatar.jpg" alt="用户头像" className="avatar" />
    </div>
    <div className="name-container">
      <h2 className="name">Alice</h2>
    </div>
  </div>
)
```

### 2. 使用 TypeScript 类型

```tsx
// 定义 Props 类型
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

// 使用
const App = () => {
  return (
    <div>
      <Button variant="primary">主要按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="danger">危险按钮</Button>
      <Button disabled>禁用按钮</Button>
    </div>
  )
}
```

### 3. 保持组件纯净

```tsx
// ✅ 纯组件：相同输入总是产生相同输出
const Greeting = ({ name }: { name: string }) => {
  return <h1>Hello, {name}!</h1>
}

// ❌ 不纯：有副作用
const Greeting = ({ name }: { name: string }) => {
  console.log('渲染了')  // 副作用
  document.title = name  // 副作用
  return <h1>Hello, {name}!</h1>
}
```

## 总结

本章我们深入学习了：

✅ JSX 的本质和编译原理
✅ JSX 的六大语法规则（根元素、属性命名、自闭合、表达式、条件渲染、列表渲染）
✅ 函数组件 vs 类组件（推荐使用函数组件）
✅ 组件命名规范和返回值
✅ key 的作用和正确使用
✅ 实战案例：学生成绩管理系统
✅ 组件设计最佳实践

**下一步：** 第53章将学习 Props 与 State，深入了解组件间的数据传递和状态管理。
