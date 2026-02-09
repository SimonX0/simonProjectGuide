# ：状态管理Jotai与Recoil

## 原子化状态管理简介

### 什么是原子化状态管理？

原子化状态管理是一种将状态拆分为最小单元（atom）的状态管理方案：

- **Atom（原子）**：最小的状态单元，可以被任何组件订阅和更新
- **Derived Atom（派生原子）**：基于其他 atom 计算得出的状态
- **优势**：细粒度更新、避免不必要的渲染、易于组合

### Jotai vs Recoil 对比

| 特性 | Jotai | Recoil |
|------|-------|--------|
| 包大小 | ~3KB | ~22KB |
| API 复杂度 | 简单 | 较复杂 |
| TypeScript 支持 | 优秀 | 良好 |
| 学习曲线 | 平缓 | 陡峭 |
| 性能 | 更好 | 良好 |
| React 版本支持 | React 16.8+ | React 16.8+ |
| 社区活跃度 | 高 | Facebook 官方维护 |

## Jotai 基础

### 安装 Jotai

```bash
# 使用 npm
npm install jotai

# 使用 yarn
yarn add jotai

# 使用 pnpm
pnpm add jotai

# 安装辅助工具（可选）
npm install jotai/utils
npm install jotai/devtools
```

### 创建和使用 Atom

```tsx
import { atom, useAtom } from 'jotai'

// ❌ 使用 useState（组件级别状态）
const Counter = () => {
  const [count, setCount] = useState(0)
  return <div>{count}</div>
}

// ✅ 使用 Jotai atom（全局状态）
// 创建 atom
const countAtom = atom(0)

// 使用 atom
const Counter = () => {
  const [count, setCount] = useAtom(countAtom)

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}

// ✅ 只读 atom（其他组件只能读取，不能修改）
const readOnlyCountAtom = atom(0)

const DisplayCount = () => {
  const [count] = useAtom(readOnlyCountAtom) // 只读取，不获取 set 函数
  return <div>{count}</div>
}

// ✅ 只写 atom（只能写入，不能读取）
const writeOnlyCountAtom = atom(
  null, // 不提供初始值（只读）
  (get, set, update: number) => {
    set(countAtom, get(countAtom) + update)
  }
)

const IncrementButton = () => {
  const [, increment] = useAtom(writeOnlyCountAtom)
  return <button onClick={() => increment(1)}>+1</button>
}
```

### 基础 Atom 类型

```tsx
import { atom, useAtom } from 'jotai'

// ✅ 原始值 atom
const numberAtom = atom(0)
const stringAtom = atom('hello')
const booleanAtom = atom(true)
const objectAtom = atom({ name: '张三', age: 25 })
const arrayAtom = atom([1, 2, 3])

// ✅ 只读 atom（derived atom）
const doubleCountAtom = atom((get) => get(countAtom) * 2)

// 使用
const DisplayDouble = () => {
  const [double] = useAtom(doubleCountAtom)
  return <div>双倍计数：{double}</div>
}

// ✅ 可读写 atom（计算状态 + 自定义更新逻辑）
const enhancedCountAtom = atom(
  (get) => get(countAtom), // 读取
  (get, set, arg: 'increment' | 'decrement' | 'reset') => { // 写入
    if (arg === 'increment') {
      set(countAtom, get(countAtom) + 1)
    } else if (arg === 'decrement') {
      set(countAtom, get(countAtom) - 1)
    } else if (arg === 'reset') {
      set(countAtom, 0)
    }
  }
)

// 使用
const EnhancedCounter = () => {
  const [count, dispatch] = useAtom(enhancedCountAtom)

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={() => dispatch('increment')}>+1</button>
      <button onClick={() => dispatch('decrement')}>-1</button>
      <button onClick={() => dispatch('reset')}>重置</button>
    </div>
  )
}
```

### 异步 Atom

```tsx
import { atom, useAtom } from 'jotai'

// ✅ 异步只读 atom
const userDataAtom = atom(async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1')
  return await response.json()
})

// 使用
const UserProfile = () => {
  const [user] = useAtom(userDataAtom)

  if (!user) return <div>加载中...</div>

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}

// ✅ 异步可读写 atom
const userAtom = atom<User | null>(null)

const fetchUserAtom = atom(
  (get) => get(userAtom),
  async (get, set, userId: string) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
    const user = await response.json()
    set(userAtom, user)
  }
)

// 使用
const UserLoader = () => {
  const [user, fetchUser] = useAtom(fetchUserAtom)

  return (
    <div>
      <button onClick={() => fetchUser('1')}>加载用户</button>
      {user && (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      )}
    </div>
  )
}
```

### Atom 组合

```tsx
import { atom, useAtom } from 'jotai'

// ✅ 基础 atom
const firstNameAtom = atom('张')
const lastNameAtom = atom('三')

// ✅ 派生 atom（组合多个 atom）
const fullNameAtom = atom((get) => {
  const firstName = get(firstNameAtom)
  const lastName = get(lastNameAtom)
  return `${firstName}${lastName}`
})

// 使用
const NameDisplay = () => {
  const [firstName, setFirstName] = useAtom(firstNameAtom)
  const [lastName, setLastName] = useAtom(lastNameAtom)
  const [fullName] = useAtom(fullNameAtom)

  return (
    <div>
      <input
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="姓"
      />
      <input
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="名"
      />
      <p>全名：{fullName}</p>
    </div>
  )
}

// ✅ 嵌套 atom
const settingsAtom = atom({
  theme: 'light' as 'light' | 'dark',
  language: 'zh-CN',
  fontSize: 14
})

const themeAtom = atom(
  (get) => get(settingsAtom).theme,
  (get, set, newTheme: 'light' | 'dark') => {
    set(settingsAtom, {
      ...get(settingsAtom),
      theme: newTheme
    })
  }
)

// 使用
const ThemeToggle = () => {
  const [theme, setTheme] = useAtom(themeAtom)

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      切换到{theme === 'light' ? '深色' : '浅色'}模式
    </button>
  )
}
```

## Recoil 基础

### 安装 Recoil

```bash
# 使用 npm
npm install recoil

# 使用 yarn
yarn add recoil

# 使用 pnpm
pnpm add recoil
```

### RecoilRoot 和 Atom

```tsx
import { atom, useRecoilState, useRecoilValue, useSetRecoilState, RecoilRoot } from 'recoil'

// ✅ 定义 atom
const countState = atom({
  key: 'countState', // 唯一标识符
  default: 0 // 默认值
})

// ❌ 错误：没有使用 RecoilRoot 包装
const App = () => {
  return <Counter />
}

// ✅ 正确：使用 RecoilRoot 包装应用
const App = () => {
  return (
    <RecoilRoot>
      <Counter />
    </RecoilRoot>
  )
}

// ✅ 使用 useRecoilState（读取 + 写入）
const Counter = () => {
  const [count, setCount] = useRecoilState(countState)

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}

// ✅ 只读取状态（useRecoilValue）
const CountDisplay = () => {
  const count = useRecoilValue(countState)
  return <div>计数：{count}</div>
}

// ✅ 只写入状态（useSetRecoilState）
const CountControls = () => {
  const setCount = useSetRecoilState(countState)

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <button onClick={() => setCount(c => c - 1)}>-1</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  )
}
```

### Selector（派生状态）

```tsx
import { atom, selector, useRecoilValue } from 'recoil'

// ✅ 基础 atom
const textState = atom({
  key: 'textState',
  default: ''
})

// ✅ 派生 selector
const charCountState = selector({
  key: 'charCountState',
  get: ({ get }) => {
    const text = get(textState)
    return text.length
  }
})

// 使用
const CharacterCount = () => {
  const count = useRecoilValue(charCountState)
  return <div>字符数：{count}</div>
}

// ✅ 带参数的 selector
const filterListState = selectorFamily({
  key: 'filterListState',
  get: (filterType: string) => ({ get }) => {
    const list = get(todoListState)
    return list.filter(item => item.type === filterType)
  }
})

// 使用
const FilteredTodos = ({ type }: { type: string }) => {
  const filteredTodos = useRecoilValue(filterListState(type))

  return (
    <ul>
      {filteredTodos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  )
}
```

### 异步 Selector

```tsx
import { atom, selector, useRecoilValue, useRecoilState } from 'recoil'

// ✅ 异步 selector
const currentUserState = selector({
  key: 'currentUserState',
  get: async () => {
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1')
    return await response.json()
  }
})

// 使用（处理加载和错误状态）
const CurrentUser = () => {
  const user = useRecoilValue(currentUserState)

  if (!user) return <div>加载中...</div>

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}

// ✅ 完整的异步状态处理
const currentUserQuery = selector<User | null>({
  key: 'currentUserQuery',
  get: async ({ get }) => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users/1')
      if (!response.ok) {
        throw new Error('网络响应失败')
      }
      return await response.json()
    } catch (error) {
      console.error('获取用户失败:', error)
      return null
    }
  }
})

// 使用错误边界
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <RecoilRoot>
      <React.Suspense fallback={<div>加载中...</div>}>
        {children}
      </React.Suspense>
    </RecoilRoot>
  )
}

const UserProfile = () => {
  const user = useRecoilValue(currentUserQuery)

  if (!user) {
    return <div>无法加载用户数据</div>
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

## Jotai vs Recoil 实战对比

### 场景1：表单状态管理

**Jotai 实现：**

```tsx
import { atom, useAtom } from 'jotai'

// 创建表单字段 atom
const nameAtom = atom('')
const emailAtom = atom('')
const ageAtom = atom(0)

// 派生 atom：表单是否有效
const isFormValidAtom = atom((get) => {
  const name = get(nameAtom)
  const email = get(emailAtom)
  const age = get(ageAtom)

  return name.length > 0 && email.includes('@') && age >= 18
})

// 组件
const FormJotai = () => {
  const [name, setName] = useAtom(nameAtom)
  const [email, setEmail] = useAtom(emailAtom)
  const [age, setAge] = useAtom(ageAtom)
  const [isValid] = useAtom(isFormValidAtom)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      console.log({ name, email, age })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="姓名"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱"
      />
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(parseInt(e.target.value))}
        placeholder="年龄"
      />
      <button type="submit" disabled={!isValid}>
        提交
      </button>
    </form>
  )
}
```

**Recoil 实现：**

```tsx
import { atom, selector, useRecoilState, useRecoilValue } from 'recoil'

// 创建表单字段 atom
const nameState = atom({
  key: 'nameState',
  default: ''
})

const emailState = atom({
  key: 'emailState',
  default: ''
})

const ageState = atom({
  key: 'ageState',
  default: 0
})

// 派生 selector：表单是否有效
const isFormValidState = selector({
  key: 'isFormValidState',
  get: ({ get }) => {
    const name = get(nameState)
    const email = get(emailState)
    const age = get(ageState)

    return name.length > 0 && email.includes('@') && age >= 18
  }
})

// 组件
const FormRecoil = () => {
  const [name, setName] = useRecoilState(nameState)
  const [email, setEmail] = useRecoilState(emailState)
  const [age, setAge] = useRecoilState(ageState)
  const isValid = useRecoilValue(isFormValidState)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      console.log({ name, email, age })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="姓名"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱"
      />
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(parseInt(e.target.value))}
        placeholder="年龄"
      />
      <button type="submit" disabled={!isValid}>
        提交
      </button>
    </form>
  )
}
```

### 场景2：待办事项列表

**Jotai 完整实现：**

```tsx
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'

// 类型定义
interface Todo {
  id: number
  text: string
  completed: boolean
}

// 基础 atom
const todosAtom = atom<Todo[]>([])

// 派生 atom：统计数据
const statsAtom = atom((get) => {
  const todos = get(todosAtom)
  return {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length
  }
})

// 派生 atom：过滤后的 todos
const filterAtom = atom<'all' | 'active' | 'completed'>('all')

const filteredTodosAtom = atom((get) => {
  const todos = get(todosAtom)
  const filter = get(filterAtom)

  switch (filter) {
    case 'active':
      return todos.filter(t => !t.completed)
    case 'completed':
      return todos.filter(t => t.completed)
    default:
      return todos
  }
})

// Action atom
const addTodoAtom = atom(
  null,
  (get, set, text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false
    }
    set(todosAtom, [...get(todosAtom), newTodo])
  }
)

const toggleTodoAtom = atom(
  null,
  (get, set, id: number) => {
    set(todosAtom,
      get(todosAtom).map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }
)

const deleteTodoAtom = atom(
  null,
  (get, set, id: number) => {
    set(todosAtom, get(todosAtom).filter(todo => todo.id !== id))
  }
)

// 组件
const TodoAppJotai = () => {
  const [todos, setTodos] = useAtom(todosAtom)
  const [filter, setFilter] = useAtom(filterAtom)
  const filteredTodos = useAtomValue(filteredTodosAtom)
  const stats = useAtomValue(statsAtom)
  const addTodo = useSetAtom(addTodoAtom)
  const toggleTodo = useSetAtom(toggleTodoAtom)
  const deleteTodo = useSetAtom(deleteTodoAtom)

  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      addTodo(inputValue)
      setInputValue('')
    }
  }

  return (
    <div className="todo-app">
      <h1>待办事项</h1>

      <div className="input-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="添加新的待办事项..."
        />
        <button onClick={handleAdd}>添加</button>
      </div>

      <div className="filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          全部 ({stats.total})
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          进行中 ({stats.active})
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          已完成 ({stats.completed})
        </button>
      </div>

      <ul className="todo-list">
        {filteredTodos.map(todo => (
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

      {todos.length > 0 && (
        <button
          className="clear-btn"
          onClick={() => setTodos([])}
        >
          清空所有
        </button>
      )}
    </div>
  )
}
```

**Recoil 完整实现：**

```tsx
import { atom, selector, useRecoilState, useRecoilValue, useSetRecoilState, selectorFamily } from 'recoil'

// 类型定义
interface Todo {
  id: number
  text: string
  completed: boolean
}

// 基础 atom
const todosState = atom<Todo[]>({
  key: 'todosState',
  default: []
})

// 过滤器 atom
const filterState = atom<'all' | 'active' | 'completed'>({
  key: 'filterState',
  default: 'all'
})

// 派生 selector：统计数据
const statsState = selector({
  key: 'statsState',
  get: ({ get }) => {
    const todos = get(todosState)
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      active: todos.filter(t => !t.completed).length
    }
  }
})

// 派生 selector：过滤后的 todos
const filteredTodosState = selector({
  key: 'filteredTodosState',
  get: ({ get }) => {
    const todos = get(todosState)
    const filter = get(filterState)

    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed)
      case 'completed':
        return todos.filter(t => t.completed)
      default:
        return todos
    }
  }
})

// 组件
const TodoAppRecoil = () => {
  const [todos, setTodos] = useRecoilState(todosState)
  const [filter, setFilter] = useRecoilState(filterState)
  const filteredTodos = useRecoilValue(filteredTodosState)
  const stats = useRecoilValue(statsState)

  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
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

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  return (
    <div className="todo-app">
      <h1>待办事项</h1>

      <div className="input-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="添加新的待办事项..."
        />
        <button onClick={handleAdd}>添加</button>
      </div>

      <div className="filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          全部 ({stats.total})
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          进行中 ({stats.active})
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          已完成 ({stats.completed})
        </button>
      </div>

      <ul className="todo-list">
        {filteredTodos.map(todo => (
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

      {todos.length > 0 && (
        <button
          className="clear-btn"
          onClick={() => setTodos([])}
        >
          清空所有
        </button>
      )}
    </div>
  )
}
```

## 选择建议

### 何时使用 Jotai？

✅ **推荐使用 Jotai 的场景：**
- 需要极简的 API 和低学习曲线
- 项目规模中小型
- 需要最佳性能（最小的包体积和渲染次数）
- 喜欢 hooks 风格的 API
- 需要细粒度的状态控制

```tsx
// Jotai 特有的优势：极其简洁
const countAtom = atom(0)
const [count, setCount] = useAtom(countAtom)
```

### 何时使用 Recoil？

✅ **推荐使用 Recoil 的场景：**
- 大型企业级应用
- 需要强大的 DevTools 支持
- 需要时间旅行调试
- 已有 Redux 经验，熟悉类似概念
- 需要复杂的数据流和依赖关系
- Facebook 官方支持带来的信心

```tsx
// Recoil 的优势：明确的类型和强大的工具
const countState = atom({
  key: 'countState', // 明确的键名
  default: 0
})
```

## 配套样式（待办事项应用）

```css
.todo-app {
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.todo-app h1 {
  margin: 0 0 30px 0;
  text-align: center;
  color: #2196F3;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.input-group input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
}

.input-group input:focus {
  outline: none;
  border-color: #2196F3;
}

.input-group button {
  padding: 12px 24px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
}

.input-group button:hover {
  background: #1976D2;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 15px;
}

.filters button {
  padding: 8px 16px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}

.filters button:hover {
  background: #f5f5f5;
}

.filters button.active {
  background: #2196F3;
  color: white;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 8px;
}

.todo-list li.completed {
  opacity: 0.6;
}

.todo-list li.completed span {
  text-decoration: line-through;
}

.todo-list input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-list span {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.todo-list button {
  padding: 6px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.todo-list button:hover {
  background: #d32f2f;
}

.clear-btn {
  width: 100%;
  padding: 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
}

.clear-btn:hover {
  background: #d32f2f;
}
```

## 总结

本章我们学习了：

✅ 原子化状态管理的概念和优势
✅ Jotai 的基础用法（atom、useAtom、派生 atom、异步 atom）
✅ Recoil 的基础用法（atom、selector、异步 selector）
✅ Jotai vs Recoil 的详细对比
✅ 两种方案在表单和待办事项场景的完整实现
✅ 如何根据项目需求选择合适的方案

**Jotai vs Recoil 快速对比：**

| 特性 | Jotai | Recoil |
|------|-------|--------|
| 学习曲线 | ⭐⭐ 简单 | ⭐⭐⭐⭐ 较复杂 |
| 性能 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 良好 |
| 包大小 | ⭐⭐⭐⭐⭐ 3KB | ⭐⭐⭐ 22KB |
| TypeScript | ⭐⭐⭐⭐⭐ 完美支持 | ⭐⭐⭐⭐ 良好 |
| DevTools | ⭐⭐⭐ 可选 | ⭐⭐⭐⭐⭐ 强大 |
| 社区 | ⭐⭐⭐⭐ 活跃 | ⭐⭐⭐⭐⭐ Facebook |

**下一步：** 第66章将学习 TanStack Query（React Query），掌握服务端状态管理的最佳方案。
