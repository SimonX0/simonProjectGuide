# ：useOptimistic与新的use() hook

## useOptimistic乐观更新

### 什么是乐观更新？

乐观更新（Optimistic Updates）是一种用户体验优化技术，在等待服务器响应之前立即更新UI，假设操作会成功。如果操作失败，再回滚UI。

```
┌─────────────────────────────────────────────────────────────┐
│              乐观更新工作流程                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 用户点击"点赞"按钮                                       │
│     ↓                                                       │
│  2. 立即更新UI（显示+1） ← 乐观更新                          │
│     ↓                                                       │
│  3. 发送API请求到服务器                                      │
│     ↓                                                       │
│  4a. 成功：保持UI更新 ✅                                     │
│     或                                                      │
│  4b. 失败：回滚UI（显示-1）❌                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 为什么需要乐观更新？

| 场景 | 不使用乐观更新 | 使用乐观更新 |
|------|---------------|-------------|
| 点赞文章 | 点击后等待1-2秒才显示 | 点击后立即显示 |
| 添加评论 | 提交后等待刷新 | 提交后立即显示 |
| 删除项目 | 删除后等待确认 | 删除后立即消失 |
| 用户体验 | ⭐⭐⭐ 延迟感明显 | ⭐⭐⭐⭐⭐ 流畅自然 |

### useOptimistic基础语法

```tsx
const [optimisticState, addOptimistic] = useOptimistic(
  state,           // 当前真实状态
  (state, newValue) => {
    // 更新函数：返回乐观状态
    return updatedState
  }
)
```

### 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `state` | `any` | 当前真实状态（来自props或state） |
| `updateFn` | `(state, optimisticValue) => state` | 乐观更新函数 |

### 返回值说明

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `optimisticState` | `any` | 乐观状态（包含待确认的更新） |
| `addOptimistic` | `function` | 添加乐观更新的函数 |

## useOptimistic基础用法

### 1. 简单的点赞功能

```tsx
import { useOptimistic } from 'react'

// ❌ 传统方式（延迟感）
function LikeButtonOld({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes)
  const [loading, setLoading] = useState(false)

  async function handleLike() {
    setLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      })
      const data = await response.json()
      setLikes(data.likes)  // 等待服务器响应后才更新
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleLike} disabled={loading}>
      {loading ? '...' : '👍'} {likes}
    </button>
  )
}

// ✅ 使用useOptimistic（立即响应）
function LikeButtonNew({ postId, initialLikes }) {
  const [optimisticLikes, addOptimistic] = useOptimistic(
    initialLikes,
    (state, newAmount) => state + newAmount
  )

  async function handleLike() {
    // 立即更新UI
    addOptimistic(1)

    // 发送请求
    await fetch(`/api/posts/${postId}/like`, {
      method: 'POST'
    })
    // 服务器响应后，React会自动用真实值替换乐观值
  }

  return (
    <button onClick={handleLike}>
      👍 {optimisticLikes}
    </button>
  )
}
```

### 2. 添加评论（带回滚）

```tsx
import { useOptimistic } from 'react'

interface Comment {
  id: string
  text: string
  author: string
  pending?: boolean  // 标记是否为乐观更新
}

function CommentList({ postId, initialComments }) {
  const [optimisticComments, addOptimistic] = useOptimistic(
    initialComments,
    (state, newComment: Comment) => [
      ...state,
      { ...newComment, id: `temp-${Date.now()}`, pending: true }
    ]
  )

  async function handleSubmit(formData) {
    const text = formData.get('text')

    // 立即显示评论
    addOptimistic({
      text,
      author: '我',
      createdAt: new Date().toISOString()
    })

    // 提交到服务器
    try {
      await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text })
      })
    } catch (error) {
      // 失败时，React会自动回滚到initialComments
      alert('评论失败，请重试')
    }
  }

  return (
    <div>
      <form action={handleSubmit}>
        <textarea name="text" placeholder="写下你的评论..." />
        <button type="submit">发布评论</button>
      </form>

      <div>
        {optimisticComments.map(comment => (
          <div
            key={comment.id}
            className={comment.pending ? 'pending' : ''}
          >
            <strong>{comment.author}</strong>
            <p>{comment.text}</p>
            {comment.pending && <span>发布中...</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 3. 删除项目

```tsx
import { useOptimistic } from 'react'

interface Todo {
  id: string
  text: string
  completed: boolean
}

function TodoList({ initialTodos }) {
  const [optimisticTodos, removeOptimistic] = useOptimistic(
    initialTodos,
    (state, todoId: string) => state.filter(todo => todo.id !== todoId)
  )

  async function handleDelete(todoId) {
    // 立即从列表中移除
    removeOptimistic(todoId)

    // 发送删除请求
    try {
      await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      // 失败时自动恢复
      alert('删除失败，请重试')
    }
  }

  return (
    <ul>
      {optimisticTodos.map(todo => (
        <li key={todo.id}>
          <input type="checkbox" checked={todo.completed} />
          <span>{todo.text}</span>
          <button onClick={() => handleDelete(todo.id)}>
            删除
          </button>
        </li>
      ))}
    </ul>
  )
}
```

### 4. 批量操作

```tsx
import { useOptimistic, useActionState } from 'react'

interface Email {
  id: string
  subject: string
  read: boolean
  starred: boolean
}

function EmailList({ initialEmails }) {
  const [optimisticEmails, updateOptimistic] = useOptimistic(
    initialEmails,
    (state, action) => {
      switch (action.type) {
        case 'markRead':
          return state.map(email =>
            email.id === action.emailId
              ? { ...email, read: true }
              : email
          )
        case 'toggleStar':
          return state.map(email =>
            email.id === action.emailId
              ? { ...email, starred: !email.starred }
              : email
          )
        case 'markAllRead':
          return state.map(email => ({ ...email, read: true }))
        default:
          return state
      }
    }
  )

  async function markAsRead(emailId) {
    updateOptimistic({ type: 'markRead', emailId })
    await fetch(`/api/emails/${emailId}/read`, { method: 'POST' })
  }

  async function toggleStar(emailId) {
    updateOptimistic({ type: 'toggleStar', emailId })
    await fetch(`/api/emails/${emailId}/star`, { method: 'POST' })
  }

  async function markAllAsRead() {
    updateOptimistic({ type: 'markAllRead' })
    await fetch('/api/emails/read-all', { method: 'POST' })
  }

  return (
    <div>
      <button onClick={markAllAsRead}>
        全部标为已读
      </button>

      <ul>
        {optimisticEmails.map(email => (
          <li key={email.id}>
            <input
              type="checkbox"
              checked={email.read}
              onChange={() => markAsRead(email.id)}
            />
            <button onClick={() => toggleStar(email.id)}>
              {email.starred ? '⭐' : '☆'}
            </button>
            <span>{email.subject}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## use() Hook

### 什么是use()？

`use()` 是React 19新增的Hook，用于在组件中读取Context和Promise。与`useContext`不同，`use()`可以在条件语句和循环中使用。

```
┌─────────────────────────────────────────────────────────────┐
│              use() Hook 特性                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  useContext vs use:                                         │
│                                                             │
│  useContext:                                                │
│    - 只能在组件顶层使用                                      │
│    - 只能读取Context                                         │
│    - 受Hooks规则限制                                         │
│                                                             │
│  use:                                                       │
│    - 可以在条件语句中使用 ✅                                 │
│    - 可以读取Context和Promise ✅                             │
│    - 可以在循环中使用 ✅                                     │
│    - 配合Suspense使用 ✅                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### use()读取Context

```tsx
import { use, createContext } from 'react'

// ❌ useContext：只能在顶层使用
function ComponentOld() {
  const theme = useContext(ThemeContext)

  if (condition) {
    // 错误！不能在条件语句中使用useContext
    const user = useContext(UserContext)
  }

  return <div>{theme}</div>
}

// ✅ use：可以在条件语句中使用
function ComponentNew() {
  const theme = use(ThemeContext)

  if (condition) {
    // 正确！可以在条件中使用use
    const user = use(UserContext)
    return <div>{user.name}</div>
  }

  return <div>{theme}</div>
}
```

### use()读取Promise

```tsx
import { use, Suspense } from 'react'

// Promise函数
async function fetchUser(userId) {
  const response = await fetch(`/api/users/${userId}`)
  if (!response.ok) {
    throw new Error('加载用户失败')
  }
  return response.json()
}

// ✅ 读取Promise
function UserProfile({ userId }) {
  // use()会暂停渲染，直到Promise解决
  const user = use(fetchUser(userId))

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

// 使用Suspense包裹
function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <UserProfile userId={1} />
    </Suspense>
  )
}
```

### use()高级用法

#### 1. 条件加载Context

```tsx
import { use, createContext, useState } from 'react'

const ThemeContext = createContext(null)
const UserContext = createContext(null)

function Dashboard() {
  const [showUser, setShowUser] = useState(false)

  return (
    <div>
      <button onClick={() => setShowUser(!showUser)}>
        切换视图
      </button>

      {showUser ? (
        <UserView />
      ) : (
        <ThemeView />
      )}
    </div>
  )
}

function UserView() {
  // ✅ 可以在条件分支中使用use
  const user = use(UserContext)
  return <div>用户: {user.name}</div>
}

function ThemeView() {
  const theme = use(ThemeContext)
  return <div>主题: {theme}</div>
}
```

#### 2. 循环中使用use

```tsx
import { use, createContext } from 'react'

const ItemContext = createContext(null)

function ItemList({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <ItemContext.Provider key={index} value={item}>
          {/* ✅ 可以在循环中使用use */}
          <ItemDisplay />
        </ItemContext.Provider>
      ))}
    </div>
  )
}

function ItemDisplay() {
  const item = use(ItemContext)
  return <div>{item.name}</div>
}
```

#### 3. 嵌套Promise

```tsx
import { use, Suspense } from 'react'

async function fetchUser(userId) {
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
}

async function fetchPosts(userId) {
  const response = await fetch(`/api/users/${userId}/posts`)
  return response.json()
}

function UserDashboard({ userId }) {
  const user = use(fetchUser(userId))

  // ✅ 可以嵌套使用use读取Promise
  const posts = use(fetchPosts(userId))

  return (
    <div>
      <h1>{user.name}的文章</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<div>加载用户数据...</div>}>
      <UserDashboard userId={1} />
    </Suspense>
  )
}
```

## Server Actions集成

### Server Actions基础

Server Actions允许客户端组件直接调用服务端函数：

```tsx
// actions.ts - 服务端函数
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const post = await db.post.create({
    data: { title, content }
  })

  // 重新验证缓存
  revalidatePath('/posts')

  return post
}

export async function likePost(postId: string) {
  await db.post.update({
    where: { id: postId },
    data: { likes: { increment: 1 } }
  })

  revalidatePath('/posts')
}
```

### 在客户端使用Server Actions

```tsx
'use client'

import { useOptimistic, useActionState } from 'react'
import { createPost, likePost } from '@/actions'

// 创建文章（使用useActionState）
function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      try {
        const post = await createPost(formData)
        return { success: true, post, error: null }
      } catch (error) {
        return { success: false, post: null, error: '创建失败' }
      }
    },
    { success: false, post: null, error: null }
  )

  return (
    <form action={formAction}>
      <input name="title" placeholder="标题" />
      <textarea name="content" placeholder="内容" />
      <button type="submit" disabled={isPending}>
        {isPending ? '发布中...' : '发布'}
      </button>
      {state.error && <div className="error">{state.error}</div>}
    </form>
  )
}

// 点赞文章（使用useOptimistic）
function PostCard({ post, initialLikes }) {
  const [optimisticLikes, addOptimistic] = useOptimistic(
    initialLikes,
    (state) => state + 1
  )

  async function handleLike() {
    addOptimistic()
    await likePost(post.id)
  }

  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <button onClick={handleLike}>
        👍 {optimisticLikes}
      </button>
    </div>
  )
}
```

## 实战案例：乐观更新的点赞功能

让我们创建一个完整的、带乐观更新的社交媒体点赞功能。

```tsx
/**
 * 完整的社交媒体点赞功能 - React 19
 * 包含：
 * - useOptimistic实现乐观更新
 * - use()读取Context
 * - Server Actions集成
 * - 点赞、取消点赞
 * - 点赞列表
 * - 实时更新
 */

import { useOptimistic, use, createContext, Suspense } from 'react'

// ==================== 类型定义 ====================
interface Post {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
  }
  likes: number
  isLiked: boolean
  createdAt: string
}

interface SocialContextType {
  currentUser: {
    id: string
    name: string
    avatar: string
  }
  posts: Post[]
}

// ==================== Context ====================
const SocialContext = createContext<SocialContextType | null>(null)

// ==================== Server Actions ====================
async function toggleLike(postId: string): Promise<{
  likes: number
  isLiked: boolean
}> {
  const response = await fetch(`/api/posts/${postId}/like`, {
    method: 'POST'
  })

  if (!response.ok) {
    throw new Error('操作失败')
  }

  return response.json()
}

async function addComment(
  postId: string,
  text: string
): Promise<Post> {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })

  if (!response.ok) {
    throw new Error('评论失败')
  }

  return response.json()
}

// ==================== 组件 ====================

// 1. 点赞按钮组件
function LikeButton({ post, initialLikes, initialIsLiked }) {
  const [optimisticState, addOptimistic] = useOptimistic(
    { likes: initialLikes, isLiked: initialIsLiked },
    (state, newIsLiked: boolean) => ({
      likes: state.likes + (newIsLiked ? 1 : -1),
      isLiked: newIsLiked
    })
  )

  async function handleLike() {
    const newIsLiked = !optimisticState.isLiked

    // 立即更新UI
    addOptimistic(newIsLiked)

    try {
      // 调用Server Action
      await toggleLike(post.id)
    } catch (error) {
      // 失败时自动回滚
      alert('操作失败，请重试')
    }
  }

  return (
    <button
      onClick={handleLike}
      className={`like-button ${optimisticState.isLiked ? 'liked' : ''}`}
    >
      <svg
        className="heart-icon"
        viewBox="0 0 24 24"
        fill={optimisticState.isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{optimisticState.likes}</span>
    </button>
  )
}

// 2. 评论组件
function CommentForm({ post }) {
  const [optimisticComments, addOptimistic] = useOptimistic(
    post.comments || [],
    (state, newComment) => [...state, { ...newComment, pending: true }]
  )

  async function handleSubmit(formData) {
    const text = formData.get('comment')

    if (!text?.trim()) return

    // 立即显示评论
    addOptimistic({
      id: `temp-${Date.now()}`,
      text,
      author: use(SocialContext)?.currentUser,
      createdAt: new Date().toISOString()
    })

    try {
      await addComment(post.id, text)
    } catch (error) {
      alert('评论失败，请重试')
    }
  }

  return (
    <div className="comment-section">
      <h3>评论 ({optimisticComments.length})</h3>

      <form action={handleSubmit} className="comment-form">
        <textarea
          name="comment"
          placeholder="写下你的评论..."
          rows={3}
        />
        <button type="submit">发布评论</button>
      </form>

      <div className="comment-list">
        {optimisticComments.map((comment, index) => (
          <div
            key={comment.id || index}
            className={`comment ${comment.pending ? 'pending' : ''}`}
          >
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="avatar"
            />
            <div className="comment-content">
              <div className="comment-header">
                <span className="author">{comment.author.name}</span>
                <span className="time">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text">{comment.text}</p>
              {comment.pending && (
                <span className="pending-badge">发送中...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 3. 文章卡片组件
function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      {/* 作者信息 */}
      <div className="post-header">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="author-avatar"
        />
        <div className="author-info">
          <h3 className="author-name">{post.author.name}</h3>
          <span className="post-time">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 文章内容 */}
      <div className="post-content">
        <p>{post.content}</p>
      </div>

      {/* 互动按钮 */}
      <div className="post-actions">
        <LikeButton
          post={post}
          initialLikes={post.likes}
          initialIsLiked={post.isLiked}
        />

        <button className="action-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>评论</span>
        </button>

        <button className="action-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>分享</span>
        </button>
      </div>

      {/* 评论区 */}
      <CommentForm post={post} />
    </article>
  )
}

// 4. 文章列表组件
function PostList() {
  const context = use(SocialContext)
  const { posts } = context!

  return (
    <div className="post-list">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

// 5. 主应用组件
export default function SocialFeed() {
  return (
    <SocialContext.Provider
      value={{
        currentUser: {
          id: '1',
          name: '当前用户',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me'
        },
        posts: [
          {
            id: '1',
            content: '今天天气真好！准备出去散步 🚶',
            author: {
              id: '2',
              name: '张三',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan'
            },
            likes: 42,
            isLiked: true,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            comments: []
          },
          {
            id: '2',
            content: 'React 19的新特性太棒了！特别是useOptimistic和use() Hook',
            author: {
              id: '3',
              name: '李四',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi'
            },
            likes: 128,
            isLiked: false,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            comments: []
          },
          {
            id: '3',
            content: '分享一个有用的学习资源：simon-guide-docs',
            author: {
              id: '4',
              name: '王五',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu'
            },
            likes: 89,
            isLiked: false,
            createdAt: new Date(Date.now() - 10800000).toISOString(),
            comments: []
          }
        ]
      }}
    >
      <div className="social-feed">
        <header className="feed-header">
          <h1>动态</h1>
          <button className="new-post-btn">+ 发布动态</button>
        </header>

        <Suspense fallback={<div className="loading">加载中...</div>}>
          <PostList />
        </Suspense>
      </div>
    </SocialContext.Provider>
  )
}
```

**配套样式：**

```css
/* ==================== 主容器 ==================== */
.social-feed {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  background: #f0f2f5;
  min-height: 100vh;
}

.feed-header {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.feed-header h1 {
  margin: 0;
  font-size: 24px;
  color: #1a1a1a;
}

.new-post-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.new-post-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* ==================== 文章卡片 ==================== */
.post-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.post-time {
  font-size: 13px;
  color: #65676b;
}

.post-content {
  margin-bottom: 16px;
}

.post-content p {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: #1a1a1a;
}

/* ==================== 互动按钮 ==================== */
.post-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e4e6eb;
}

.action-button,
.like-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0f2f5;
  border: none;
  border-radius: 8px;
  color: #65676b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover,
.like-button:hover {
  background: #e4e6eb;
}

.like-button {
  color: #65676b;
}

.like-button.liked {
  color: #e41e3f;
  background: #ffeef0;
}

.like-button.liked:hover {
  background: #fddde2;
}

.heart-icon {
  width: 20px;
  height: 20px;
  transition: all 0.2s;
}

.like-button.liked .heart-icon {
  animation: heartbeat 0.3s ease;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.action-button svg {
  width: 20px;
  height: 20px;
}

/* ==================== 评论区 ==================== */
.comment-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e6eb;
}

.comment-section h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #65676b;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.comment-form textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e4e6eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s;
}

.comment-form textarea:focus {
  outline: none;
  border-color: #667eea;
}

.comment-form button {
  align-self: flex-end;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  animation: slideIn 0.3s ease;
}

.comment.pending {
  opacity: 0.6;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comment .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-header .author {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.comment-header .time {
  font-size: 12px;
  color: #65676b;
}

.comment .text {
  margin: 0;
  font-size: 14px;
  color: #1a1a1a;
  line-height: 1.4;
}

.pending-badge {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  background: #fff;
  border-radius: 4px;
  font-size: 11px;
  color: #65676b;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #65676b;
  font-size: 14px;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .social-feed {
    padding: 10px;
  }

  .post-card {
    padding: 16px;
  }

  .post-actions {
    flex-wrap: wrap;
  }

  .action-button,
  .like-button {
    min-width: calc(50% - 4px);
  }
}
```

## 总结

本章我们学习了React 19的两个重要新特性：

✅ **useOptimistic乐观更新**：
- 立即更新UI，提升用户体验
- 自动处理成功/失败回滚
- 适合点赞、评论、删除等操作
- 代码量减少，逻辑更清晰

✅ **use() Hook**：
- 读取Context和Promise
- 可以在条件语句和循环中使用
- 配合Suspense实现更好的加载体验
- 更灵活的Context使用方式

✅ **Server Actions集成**：
- 客户端直接调用服务端函数
- 与useOptimistic完美配合
- 自动处理乐观更新
- 简化数据流

✅ **实战案例**：
- 完整的社交媒体点赞功能
- 乐观更新的评论系统
- 生产级代码和样式

**useOptimistic vs 传统方式：**
| 特性 | 传统方式 | useOptimistic |
|------|---------|---------------|
| 响应速度 | 延迟1-2秒 | 立即响应 |
| 代码复杂度 | 高 | 低 |
| 用户体验 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 错误处理 | 手动回滚 | 自动回滚 |

**下一步学习：**
- 第76章：React 19性能优化

现在你已经掌握了React 19的两个重要Hook，可以构建更流畅的用户体验了！
