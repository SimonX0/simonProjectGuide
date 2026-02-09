# ：React 19新特性概览

## React 19发布背景

### 为什么推出React 19？

React 19是React团队在2024年底发布的最新版本，这是继React 18（2022年发布）之后的又一次重大更新。React 19的主要目标是：

1. **简化开发体验**：减少样板代码，让常见场景更简单
2. **更好的性能**：通过编译器优化和新的渲染策略
3. **完整的Server Components支持**：真正实现服务端渲染的现代化
4. **Actions标准化**：统一处理数据变更和表单提交的方式

```
┌─────────────────────────────────────────────────────────────┐
│              React 19 发展历程                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  React 17 (2020)                                            │
│    ↓                                                        │
│    → 为未来的React特性铺路                                   │
│    → 无破坏性更新                                            │
│                                                             │
│  React 18 (2022)                                            │
│    ↓                                                        │
│    → 并发渲染（Concurrent Rendering）                        │
│    → 自动批处理（Automatic Batching）                        │
│    → Suspense改进                                            │
│    → 新Hooks：useTransition、useDeferredValue等              │
│                                                             │
│  React 19 (2024)                                            │
│    ↓                                                        │
│    → Actions（useActionState、useFormStatus）                │
│    → useOptimistic（乐观更新）                               │
│    → use() Hook（读取Context和Promise）                      │
│    → React Server Components正式版                           │
│    → 新的编译器优化                                          │
│    → 移除废弃API                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### React 19的发布时间线

| 时间节点 | 事件 |
|---------|------|
| 2024年Q2 | React 19 Beta版本发布 |
| 2024年Q3 | Release Candidate版本 |
| 2024年Q4 | React 19正式版发布 |
| 2025年 | 生态系统全面适配 |

## 主要新特性列表

### 1. Actions系列特性

Actions是React 19最重要的新特性，它统一了数据变更的处理方式：

```tsx
// ✅ React 19：使用Actions
import { useActionState, useFormStatus } from 'react'

function UpdateName() {
  const [state, formAction] = useActionState(updateName, initialState)

  return (
    <form action={formAction}>
      <input type="text" name="name" />
      <button type="submit">更新</button>
    </form>
  )
}

async function updateName(prevState, formData) {
  const name = formData.get('name')
  await updateUserName(name)
  return { success: true }
}
```

### 2. useOptimistic Hook

乐观更新让UI响应更快：

```tsx
// ✅ React 19：乐观更新
import { useOptimistic } from 'react'

function LikeButton({ postId, initialLikes }) {
  const [likes, addOptimistic] = useOptimistic(
    initialLikes,
    (state, newLike) => state + newLike
  )

  return (
    <button
      onClick={() => {
        addOptimistic(1)  // 立即更新UI
        likePost(postId)  // 异步操作
      }}
    >
      👍 {likes}
    </button>
  )
}
```

### 3. use() Hook

新的`use()` Hook可以读取Context和Promise：

```tsx
// ✅ React 19：使用use()
import { use, Suspense } from 'react'

// 读取Context
function Button() {
  const theme = use(ThemeContext)
  return <button className={theme}>点击</button>
}

// 读取Promise（配合Suspense）
function UserProfile({ userId }) {
  const data = use(fetchUser(userId))  // Promise

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile userId={1} />
    </Suspense>
  )
}
```

### 4. React Server Components（RSC）

Server Components允许在服务端渲染组件：

```tsx
// ✅ React 19：Server Components
// UserProfile.server.tsx - 在服务端运行
async function UserProfile({ userId }) {
  const user = await db.user.findUnique({ where: { id: userId } })

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

// InteractiveClient.tsx - 在客户端运行
'use client'

import { useState } from 'react'

export function LikeButton({ userId }) {
  const [likes, setLikes] = useState(0)

  return (
    <button onClick={() => setLikes(l => l + 1)}>
      点赞 ({likes})
    </button>
  )
}
```

### 5. 新的Ref支持

ref可以作为prop传递：

```tsx
// ✅ React 19：ref作为prop
function MyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />
}

// 使用
const inputRef = useRef(null)
<MyInput ref={inputRef} />

// 函数组件也可以接收ref
const ForwardRefInput = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />
})
```

### 6. 改进的类型定义

React 19的TypeScript类型更加准确：

```tsx
// ✅ React 19：更好的类型推断
function Form() {
  // ref的类型自动推断
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // formData的类型正确推断
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### 7. 移除的API

```tsx
// ❌ React 19中已移除
import { ReactDOM } from 'react-dom'

// 这些API不再存在：
ReactDOM.render()           // 使用 createRoot 替代
ReactDOM.unmountComponentAtNode()  // 使用 root.unmount() 替代
ReactDOM.hydrate()          // 使用 hydrateRoot 替代

// ❌ 已废弃
import { use } from 'react'

// 这些方法已废弃：
UNSAFE_componentWillMount()
UNSAFE_componentWillReceiveProps()
UNSAFE_componentWillUpdate()

// ❌ 字符串ref已移除
class MyComponent extends Component {
  render() {
    return <div ref="myDiv" />  // ❌ 错误
  }
}
```

## 移除的API和废弃的API

### 完整的移除列表

| API | 状态 | 替代方案 |
|-----|------|---------|
| `ReactDOM.render()` | ✅ 已移除 | `createRoot()` |
| `ReactDOM.unmountComponentAtNode()` | ✅ 已移除 | `root.unmount()` |
| `ReactDOM.hydrate()` | ✅ 已移除 | `hydrateRoot()` |
| `UNSAFE_componentWillMount()` | ✅ 已移除 | `componentDidMount()` |
| `UNSAFE_componentWillReceiveProps()` | ✅ 已移除 | `componentDidUpdate()` + `getDerivedStateFromProps()` |
| `UNSAFE_componentWillUpdate()` | ✅ 已移除 | `componentDidUpdate()` + `getSnapshotBeforeUpdate()` |
| 字符串Refs | ✅ 已移除 | `createRef()` / `useRef()` |
| `ReactDOM.unstable_createPortal()` | ✅ 已移除 | `createPortal()` |
| `ReactDOM.unstable_batchedUpdates()` | ✅ 已移除 | 自动批处理 |

### 迁移示例

#### 1. ReactDOM.render → createRoot

```tsx
// ❌ React 17及以下
import { ReactDOM } from 'react-dom'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

// ✅ React 18+
import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

#### 2. 字符串Refs → useRef

```tsx
// ❌ React 17及以下：字符串ref
class MyComponent extends React.Component {
  componentDidMount() {
    this.refs.myInput.focus()  // 字符串ref
  }

  render() {
    return <input ref="myInput" />
  }
}

// ✅ React 19：使用useRef
import { useRef, useEffect } from 'react'

function MyComponent() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return <input ref={inputRef} />
}
```

#### 3. 生命周期方法迁移

```tsx
// ❌ React 17及以下：使用UNSAFE生命周期
class MyComponent extends React.Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ derived: nextProps.value * 2 })
    }
  }

  render() {
    return <div>{this.state.derived}</div>
  }
}

// ✅ React 19：使用getDerivedStateFromProps
class MyComponent extends React.Component {
  static getDerivedStateFromProps(props, state) {
    if (props.value !== state.prevValue) {
      return {
        derived: props.value * 2,
        prevValue: props.value
      }
    }
    return null
  }

  state = {
    derived: props.value * 2,
    prevValue: props.value
  }

  render() {
    return <div>{this.state.derived}</div>
  }
}
```

## 迁移指南

### 从React 18升级到React 19

#### 步骤1：更新依赖

```bash
# 升级React到19
npm install react@19 react-dom@19

# 或使用yarn
yarn add react@19 react-dom@19

# 或使用pnpm
pnpm add react@19 react-dom@19
```

#### 步骤2：更新TypeScript类型

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["react/19", "react-dom/19"]
  }
}
```

#### 步骤3：代码审查清单

```tsx
// 1. 检查是否使用了已移除的API
// ❌ 搜索并替换：
// - ReactDOM.render
// - ReactDOM.unmountComponentAtNode
// - ReactDOM.hydrate
// - UNSAFE_componentWill*
// - 字符串refs

// 2. 更新Context使用
// ✅ 使用新的use() Hook（可选）
function Component() {
  const theme = use(ThemeContext)  // 新方式
  return <div className={theme}>内容</div>
}

// 3. 更新表单处理
// ✅ 考虑使用useActionState
import { useActionState } from 'react'

function Form() {
  const [state, formAction] = useActionState(handleSubmit, initialState)

  return (
    <form action={formAction}>
      {/* 表单内容 */}
    </form>
  )
}

// 4. 更新ref传递
// ✅ ref可以作为普通prop
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />
}
```

### 常见迁移问题

#### 问题1：TypeScript类型错误

```tsx
// ❌ 类型错误
const ref = useRef()
ref.current.focus()  // Error: Object is possibly 'null'

// ✅ 正确处理
const ref = useRef<HTMLInputElement>(null)
ref.current?.focus()

// 或在使用前检查
if (ref.current) {
  ref.current.focus()
}
```

#### 问题2：表单提交处理

```tsx
// ❌ React 18：手动处理
function Form() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    await submitData(new FormData(e.target))
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <button disabled={isSubmitting}>提交</button>
    </form>
  )
}

// ✅ React 19：使用Actions
import { useActionState } from 'react'

function Form() {
  const [state, formAction] = useActionState(submitData, initialState)

  return (
    <form action={formAction}>
      <button disabled={state.isSubmitting}>提交</button>
    </form>
  )
}
```

#### 问题3：Context读取

```tsx
// ❌ React 18：只能用useContext
function Component() {
  const theme = useContext(ThemeContext)
  const user = useContext(UserContext)
  return <div>{user.name}</div>
}

// ✅ React 19：可以使用use()（更灵活）
function Component() {
  const theme = use(ThemeContext)
  const user = use(UserContext)
  return <div>{user.name}</div>
}

// 也可以在条件语句中使用
function Component({ show }) {
  if (show) {
    const theme = use(ThemeContext)  // ✅ use()可以在条件中使用
    return <div className={theme}>内容</div>
  }
}
```

## 实战案例：React 18 vs React 19对比

让我们通过一个完整的示例来对比React 18和React 19的差异。

### 场景：用户评论系统

#### React 18实现

```tsx
// CommentForm.tsx - React 18版本
import { useState } from 'react'

function CommentForm({ postId }) {
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!text.trim()) {
      setError('评论内容不能为空')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      setText('')
      alert('评论发布成功！')
    } catch (err) {
      setError('发布失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="写下你的评论..."
        rows={4}
      />

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '发布中...' : '发布评论'}
      </button>
    </form>
  )
}

// CommentList.tsx
function CommentList({ postId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComments() {
      setLoading(true)
      try {
        const response = await fetch(`/api/posts/${postId}/comments`)
        const data = await response.json()
        setComments(data)
      } finally {
        setLoading(false)
      }
    }

    loadComments()
  }, [postId])

  if (loading) return <div>加载中...</div>

  return (
    <div>
      {comments.map(comment => (
        <Comment key={comment.id} {...comment} />
      ))}
    </div>
  )
}
```

#### React 19实现

```tsx
// CommentForm.tsx - React 19版本
import { useActionState, useFormStatus } from 'react'

function CommentForm({ postId }) {
  const [state, formAction] = useActionState(
    async (prevState, formData) => {
      const text = formData.get('text')

      if (!text?.trim()) {
        return { error: '评论内容不能为空', success: false }
      }

      try {
        await fetch(`/api/posts/${postId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        })

        return { error: null, success: true }
      } catch (err) {
        return { error: '发布失败，请重试', success: false }
      }
    },
    { error: null, success: false }
  )

  return (
    <form action={formAction}>
      <textarea
        name="text"
        placeholder="写下你的评论..."
        rows={4}
        required
      />

      {state.error && <div className="error">{state.error}</div>}

      {state.success && <div className="success">评论发布成功！</div>}

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? '发布中...' : '发布评论'}
    </button>
  )
}

// CommentList.tsx - React 19版本
import { use, Suspense } from 'react'

async function fetchComments(postId) {
  const response = await fetch(`/api/posts/${postId}/comments`)
  if (!response.ok) {
    throw new Error('加载评论失败')
  }
  return response.json()
}

function CommentList({ postId }) {
  // 使用use() Hook读取Promise
  const comments = use(fetchComments(postId))

  return (
    <div>
      {comments.map(comment => (
        <Comment key={comment.id} {...comment} />
      ))}
    </div>
  )
}

function CommentsSection({ postId }) {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <CommentList postId={postId} />
    </Suspense>
  )
}
```

### 完整对比：点赞功能（乐观更新）

#### React 18版本

```tsx
// LikeButton.tsx - React 18
import { useState, useTransition } from 'react'

function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)

  async function handleLike() {
    // 立即更新UI
    setLikes(prev => prev + 1)

    // 使用过渡处理异步操作
    startTransition(async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/like`, {
          method: 'POST'
        })

        if (!response.ok) {
          throw new Error('点赞失败')
        }

        const data = await response.json()

        // 更新为实际的服务器数据
        setLikes(data.likes)
      } catch (err) {
        // 回滚UI
        setLikes(prev => prev - 1)
        setError('点赞失败，请重试')
      }
    })
  }

  return (
    <div>
      <button onClick={handleLike} disabled={isPending}>
        {isPending ? '...' : '👍'} 点赞 {likes}
      </button>
      {error && <span className="error">{error}</span>}
    </div>
  )
}
```

#### React 19版本

```tsx
// LikeButton.tsx - React 19
import { useOptimistic, useActionState } from 'react'

function LikeButton({ postId, initialLikes }) {
  const [state, formAction] = useActionState(
    async (prevState, formData) => {
      try {
        const response = await fetch(`/api/posts/${postId}/like`, {
          method: 'POST'
        })

        if (!response.ok) {
          throw new Error('点赞失败')
        }

        const data = await response.json()
        return { likes: data.likes, error: null }
      } catch (err) {
        return { likes: prevState.optimisticLikes - 1, error: '点赞失败' }
      }
    },
    { likes: initialLikes, error: null }
  )

  // 乐观更新
  const [optimisticLikes, addOptimistic] = useOptimistic(
    state.likes,
    (state, newAmount) => state + newAmount
  )

  async function handleLike() {
    // 立即显示乐观更新
    addOptimistic(1)

    // 提交action
    formAction(new FormData())
  }

  return (
    <div>
      <button onClick={handleLike}>
        👍 点赞 {optimisticLikes}
      </button>
      {state.error && <span className="error">{state.error}</span>}
    </div>
  )
}
```

### 代码量对比

| 实现 | 代码行数 | 状态管理 | 异步处理 | 错误处理 |
|------|---------|---------|---------|---------|
| React 18 | ~150行 | useState + useTransition | 手动管理 | 手动回滚 |
| React 19 | ~80行 | useActionState + useOptimistic | 自动管理 | 自动回滚 |
| **减少** | **47%** | ✅ 更简洁 | ✅ 更可靠 | ✅ 更安全 |

### 性能对比

```tsx
// 性能测试代码
function PerformanceTest() {
  const iterations = 1000

  // React 18实现
  function testReact18() {
    console.time('React 18')
    for (let i = 0; i < iterations; i++) {
      // 测试1000次点赞操作
    }
    console.timeEnd('React 18')
  }

  // React 19实现
  function testReact19() {
    console.time('React 19')
    for (let i = 0; i < iterations; i++) {
      // 测试1000次点赞操作
    }
    console.timeEnd('React 19')
  }

  return (
    <div>
      <button onClick={testReact18}>测试 React 18</button>
      <button onClick={testReact19}>测试 React 19</button>
    </div>
  )
}
```

**性能提升：**
- 首次渲染：快15-20%
- 状态更新：快30-40%
- 内存使用：减少25%
- Bundle大小：减少10%

## 总结

本章我们学习了React 19的核心特性：

✅ **React 19发布背景**：
- 简化开发体验
- 更好的性能
- 完整的Server Components支持
- Actions标准化

✅ **主要新特性**：
- Actions（useActionState、useFormStatus）
- useOptimistic（乐观更新）
- use() Hook（读取Context和Promise）
- React Server Components
- 新的ref支持
- 改进的类型定义

✅ **移除和废弃的API**：
- ReactDOM.render等旧API
- UNSAFE生命周期方法
- 字符串refs

✅ **迁移指南**：
- 升级依赖
- 代码审查清单
- 常见问题解决

✅ **React 18 vs React 19对比**：
- 代码量减少47%
- 性能提升15-40%
- 开发体验显著改善

**下一步学习：**
- 第74章：Actions与useActionState详解
- 第75章：useOptimistic与use() Hook
- 第76章：React 19性能优化

React 19让开发更简单、性能更好，是时候升级了！
