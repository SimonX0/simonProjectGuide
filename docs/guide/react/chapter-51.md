# ：React 18+环境搭建与基础

## 为什么选择 React 18+？

React 是由 Facebook 开发并维护的前端框架，目前已成为全球最流行的前端框架之一。**React 18** 带来了许多激动人心的新特性：

- ⚡ **并发渲染**：更流畅的用户体验
- 🔄 **自动批处理**：性能提升
- 🎣 **新的 Hooks**：更强大的状态管理
- 🌐 **Suspense 增强**：更好的数据加载体验
- 🚀 **React 19 前瞻**：为未来版本做好准备

## 环境搭建

### 方式一：使用 Vite（推荐）

Vite 是新一代前端构建工具，启动速度极快，开发体验优秀。

```bash
# 创建 React + TypeScript 项目
npm create vite@latest my-react-app -- --template react-ts

# 进入项目目录
cd my-react-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 方式二：使用 Create React App（CRA）

```bash
# 创建 React 应用
npx create-react-app my-react-app --template typescript

# 进入项目目录
cd my-react-app

# 启动开发服务器
npm start
```

### 方式三：使用 Next.js（推荐用于生产环境）

Next.js 是 React 的全栈框架，提供 SSR、SSG 等功能：

```bash
# 创建 Next.js 项目
npx create-next-app@latest my-nextjs-app

# 进入项目目录
cd my-nextjs-app

# 启动开发服务器
npm run dev
```

## 项目结构解析

以 Vite 创建的项目为例：

```
my-react-app/
├── public/              # 静态资源
│   └── vite.svg
├── src/
│   ├── assets/         # 资源文件
│   │   └── react.svg
│   ├── App.css         # 应用样式
│   ├── App.tsx         # 根组件
│   ├── main.tsx        # 应用入口
│   └── vite-env.d.ts   # TypeScript 声明
├── index.html          # HTML 模板
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
└── vite.config.ts      # Vite 配置
```

## React 18+ 核心概念

### 1. 组件（Components）

React 的核心思想是将 UI 拆分成独立、可复用的组件。

**函数组件示例：**

```tsx
// src/components/Greeting.tsx
import React from 'react'

// 定义一个简单的函数组件
function Greeting() {
  return <h1>Hello, React 18!</h1>
}

// 使用箭头函数（更常用）
const Greeting = () => {
  return <h1>Hello, React 18!</h1>
}

// 隐式返回（单行时可省略 return 和大括号）
const Greeting = () => <h1>Hello, React 18!</h1>

export default Greeting
```

**带参数的组件：**

```tsx
// src/components/UserCard.tsx
interface UserCardProps {
  name: string
  age: number
  avatar?: string  // 可选属性
}

const UserCard = ({ name, age, avatar }: UserCardProps) => {
  return (
    <div className="user-card">
      {avatar && <img src={avatar} alt={name} />}
      <h2>{name}</h2>
      <p>年龄：{age}</p>
    </div>
  )
}

export default UserCard
```

### 2. JSX 语法

JSX 是 JavaScript 的扩展语法，允许我们在 JS 中编写类似 HTML 的代码。

**JSX 基本规则：**

```tsx
const element = (
  <div>
    {/* 1. 必须有一个根元素（React 18+ 可以用 Fragment） */}
    <h1>标题</h1>
    <p>段落</p>
  </div>
)

// 使用 Fragment（React 18+ 推荐）
const element = (
  <>
    <h1>标题</h1>
    <p>段落</p>
  </>
)

// 2. 属性名使用驼峰命名
const element = <div className="container" tabIndex={0} />

// 3. 自闭合标签必须闭合
const element = <img src="logo.png" alt="Logo" />
const element = <input type="text" />

// 4. 表达式用花括号包裹
const name = "React"
const element = <h1>Hello, {name}!</h1>

// 5. 条件渲染
const isLoggedIn = true
const element = (
  <div>
    {isLoggedIn ? <Welcome /> : <Login />}
  </div>
)

// 6. 列表渲染
const items = ['苹果', '香蕉', '橙子']
const element = (
  <ul>
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
)
```

### 3. React 18+ 的根节点

React 18 引入了新的根节点 API：

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// React 18+ 新的创建根节点方式
const root = ReactDOM.createRoot(
  document.getElementById('root')!
)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// 旧的方式（仍然可用，但不推荐）
// ReactDOM.render(<App />, document.getElementById('root'))
```

## 实战案例：待办事项应用

让我们创建一个简单的待办事项应用来巩固所学知识：

```tsx
// src/App.tsx
import { useState } from 'react'
import './App.css'

interface Todo {
  id: number
  text: string
  completed: boolean
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')

  // 添加待办事项
  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue,
        completed: false
      }
      setTodos([...todos, newTodo])
      setInputValue('')
    }
  }

  // 切换完成状态
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    )
  }

  // 删除待办事项
  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  return (
    <div className="app">
      <h1>📝 待办事项</h1>

      {/* 输入区域 */}
      <div className="input-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入待办事项..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>添加</button>
      </div>

      {/* 待办列表 */}
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>

      {/* 统计信息 */}
      {todos.length > 0 && (
        <div className="stats">
          总计：{todos.length} |
          已完成：{todos.filter(t => t.completed).length} |
          未完成：{todos.filter(t => !t.completed).length}
        </div>
      )}
    </div>
  )
}

export default App
```

**配套样式文件：**

```css
/* src/App.css */
.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.input-group input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.input-group button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-group button:hover {
  background-color: #0056b3;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #888;
}

.todo-list li button {
  margin-left: auto;
  padding: 5px 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.stats {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  text-align: center;
}
```

## 开发工具推荐

### React DevTools

浏览器扩展，用于调试 React 应用：

```bash
# Chrome/Edge
https://chrome.google.com/webstore/detail/react-developer-tools/

# Firefox
https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
```

### VSCode 插件推荐

1. **ES7+ React/Redux/React-Native snippets** - 代码片段
2. **React Tsx** - React 文件支持
3. **TypeScript Importer** - 自动导入类型
4. **Auto Rename Tag** - 自动重命名标签

## 常见问题

### Q1: React 和 React DOM 有什么区别？

```tsx
// React - 核心库（组件、Hooks、虚拟 DOM）
import React from 'react'

// ReactDOM - 渲染器（将 React 渲染到 DOM）
import ReactDOM from 'react-dom/client'
```

### Q2: 什么时候使用函数组件 vs 类组件？

**React 18+ 推荐全部使用函数组件 + Hooks**，类组件已不推荐使用。

```tsx
// ✅ 推荐：函数组件
const MyComponent = () => {
  return <div>Hello</div>
}

// ❌ 不推荐：类组件
class MyComponent extends React.Component {
  render() {
    return <div>Hello</div>
  }
}
```

### Q3: 为什么组件名首字母必须大写？

```tsx
// ✅ 组件（首字母大写）
const Header = () => <h1>标题</h1>

// ❌ HTML 标签（首字母小写）
const header = () => <h1>标题</h1>

// JSX 会将小写开头的标签视为 HTML 标签
<div /> // HTML div 标签
<Header /> // React 组件
```

## TypeScript 配置优化

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",  // React 17+ 新的 JSX 转换

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 总结

本章我们学习了：

✅ React 18+ 的核心特性和优势
✅ 三种项目创建方式（Vite、CRA、Next.js）
✅ 项目结构和配置
✅ 组件的定义和使用
✅ JSX 语法规则
✅ React 18+ 新的根节点 API
✅ 实战案例：待办事项应用

**下一步：** 第52章将深入讲解 JSX 语法与组件基础，包括更多实用的组件编写技巧。
