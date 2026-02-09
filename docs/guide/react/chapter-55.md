# ：列表渲染与Keys

## 列表渲染基础

在 React 中，使用 JavaScript 的 `map()` 方法来渲染列表。

### 基本列表渲染

```tsx
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
      {users.map((user) => (
        <li key={user.id}>
          {user.name} - {user.age}岁
        </li>
      ))}
    </ul>
  )
}
```

### 提取列表组件

```tsx
// 函数组件渲染单个列表项
function UserItem({ user }: { user: { id: number; name: string; age: number } }) {
  return (
    <li>
      <span>{user.name}</span>
      <span>{user.age}岁</span>
    </li>
  )
}

// 渲染整个列表
const UserList = () => {
  const users = [
    { id: 1, name: 'Alice', age: 20 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Charlie', age: 30 }
  ]

  return (
    <ul>
      {users.map(user => (
        <UserItem key={user.id} user={user} />
      ))}
    </ul>
  )
}
```

## Keys 深入理解

### 什么是 Key？

Key 是 React 用来识别哪些元素改变了、添加了或删除了的特殊属性。

```tsx
const numbers = [1, 2, 3, 4, 5]

// ❌ 错误：没有 key
const listItems = numbers.map(number => <li>{number}</li>)

// ✅ 正确：使用 key
const listItems = numbers.map(number => <li key={number}>{number}</li>)
```

### 为什么需要 Key？

```tsx
// 没有 key 的情况（会导致问题）
const TodoListBad = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习 React' },
    { id: 2, text: '学习 Vue' },
    { id: 3, text: '学习 Angular' }
  ])

  const deleteFirst = () => {
    setTodos(todos.slice(1))
  }

  return (
    <ul>
      {todos.map(todo => (
        <li>
          <input type="checkbox" />
          {todo.text}
        </li>
      ))}
      <button onClick={deleteFirst}>删除第一个</button>
    </ul>
  )
  // 问题：删除第一个后，checkbox 状态会错乱
}

// 有 key 的情况（正确）
const TodoListGood = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习 React' },
    { id: 2, text: '学习 Vue' },
    { id: 3, text: '学习 Angular' }
  ])

  const deleteFirst = () => {
    setTodos(todos.slice(1))
  }

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input type="checkbox" />
          {todo.text}
        </li>
      ))}
      <button onClick={deleteFirst}>删除第一个</button>
    </ul>
  )
  // 正确：每个 todo 都有稳定的 key，状态不会错乱
}
```

### Key 的最佳实践

```tsx
// ✅ 推荐：使用唯一 ID 作为 key
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]

users.map(user => <li key={user.id}>{user.name}</li>)

// ✅ 可以接受：使用索引作为 key（仅当列表静态且不会重新排序时）
const items = ['Apple', 'Banana', 'Orange']

items.map((item, index) => <li key={index}>{item}</li>)

// ❌ 避免：使用随机数
items.map(item => <li key={Math.random()}>{item}</li>)

// ❌ 避免：使用对象作为 key
items.map(item => <li key={item}>{item}</li>)

// ❌ 错误：key 必须在兄弟元素中唯一
const ListItem = ({ item }: { item: { id: number; name: string } }) => {
  return (
    <div>
      <span key={item.id}>{item.name}</span>  {/* 这里的 key 没有意义 */}
    </div>
  )
}
```

### 动态列表的 Key

```tsx
const DynamicList = () => {
  const [items, setItems] = useState([
    { id: 1, text: '项目 1' },
    { id: 2, text: '项目 2' },
    { id: 3, text: '项目 3' }
  ])

  // 添加项目
  const addItem = () => {
    const newItem = {
      id: Date.now(),  // 使用时间戳作为唯一 ID
      text: `项目 ${items.length + 1}`
    }
    setItems([...items, newItem])
  }

  // 删除项目
  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id))
  }

  // 重新排序
  const shuffleItems = () => {
    setItems([...items].sort(() => Math.random() - 0.5))
  }

  return (
    <div>
      <button onClick={addItem}>添加</button>
      <button onClick={shuffleItems}>随机排序</button>

      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.text}
            <button onClick={() => removeItem(item.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## 列表操作

### 1. 过滤列表

```tsx
const SearchList = () => {
  const [items] = useState([
    'Apple',
    'Banana',
    'Orange',
    'Mango',
    'Pineapple',
    'Strawberry'
  ])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="搜索水果..."
      />

      <ul>
        {filteredItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      {filteredItems.length === 0 && <p>没有找到匹配项</p>}
    </div>
  )
}
```

### 2. 排序列表

```tsx
const SortableList = () => {
  const [users] = useState([
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 20 },
    { id: 3, name: 'Charlie', age: 30 },
    { id: 4, name: 'David', age: 22 }
  ])
  const [sortBy, setSortBy] = useState<'name' | 'age' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortBy) return 0

    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (field: 'name' | 'age') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  return (
    <div>
      <button onClick={() => handleSort('name')}>
        按姓名排序 {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
      </button>
      <button onClick={() => handleSort('age')}>
        按年龄排序 {sortBy === 'age' && (sortOrder === 'asc' ? '↑' : '↓')}
      </button>

      <ul>
        {sortedUsers.map(user => (
          <li key={user.id}>
            {user.name} - {user.age}岁
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 3. 分页列表

```tsx
const PaginatedList = () => {
  const [items] = useState(
    Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `项目 ${i + 1}`
    }))
  )
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(items.length / itemsPerPage)

  const currentItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div>
      <ul>
        {currentItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>

      <div className="pagination">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          上一页
        </button>

        <span>
          第 {currentPage} 页，共 {totalPages} 页
        </span>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          下一页
        </button>
      </div>
    </div>
  )
}
```

## 实战案例：任务管理系统

```tsx
import { useState } from 'react'

interface Task {
  id: number
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: '完成项目文档', completed: false, priority: 'high', createdAt: new Date() },
    { id: 2, text: '代码审查', completed: true, priority: 'medium', createdAt: new Date() },
    { id: 3, text: '团队会议', completed: false, priority: 'low', createdAt: new Date() }
  ])
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date')

  // 添加任务
  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now(),
        text: newTaskText,
        completed: false,
        priority: newTaskPriority,
        createdAt: new Date()
      }
      setTasks([...tasks, newTask])
      setNewTaskText('')
    }
  }

  // 切换任务完成状态
  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  // 删除任务
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  // 编辑任务
  const editTask = (id: number, newText: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, text: newText } : task
    ))
  }

  // 过滤任务
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  // 排序任务
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'date') {
      return b.createdAt.getTime() - a.createdAt.getTime()
    } else {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
  })

  // 获取优先级样式
  const getPriorityClass = (priority: Task['priority']) => {
    const classes = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high'
    }
    return classes[priority]
  }

  // 统计信息
  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    high: tasks.filter(t => t.priority === 'high' && !t.completed).length
  }

  return (
    <div className="task-manager">
      <h1>📋 任务管理系统</h1>

      {/* 添加任务 */}
      <div className="add-task">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="输入新任务..."
        />
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as any)}
        >
          <option value="low">低优先级</option>
          <option value="medium">中优先级</option>
          <option value="high">高优先级</option>
        </select>
        <button onClick={addTask}>添加</button>
      </div>

      {/* 过滤和排序 */}
      <div className="controls">
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

        <div className="sort">
          <button
            className={sortBy === 'date' ? 'active' : ''}
            onClick={() => setSortBy('date')}
          >
            按时间排序
          </button>
          <button
            className={sortBy === 'priority' ? 'active' : ''}
            onClick={() => setSortBy('priority')}
          >
            按优先级排序
          </button>
        </div>
      </div>

      {/* 任务列表 */}
      <ul className="task-list">
        {sortedTasks.length === 0 ? (
          <li className="empty">暂无任务</li>
        ) : (
          sortedTasks.map(task => (
            <li
              key={task.id}
              className={`task ${task.completed ? 'completed' : ''} ${getPriorityClass(task.priority)}`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />
              <span
                className="task-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => editTask(task.id, e.currentTarget.textContent || '')}
              >
                {task.text}
              </span>
              <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                {task.priority === 'high' && '🔴'}
                {task.priority === 'medium' && '🟡'}
                {task.priority === 'low' && '🟢'}
              </span>
              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
              >
                删除
              </button>
            </li>
          ))
        )}
      </ul>

      {/* 统计信息 */}
      {tasks.length > 0 && (
        <div className="stats">
          <span>高优先级任务：{stats.high}</span>
          <span>完成率：{Math.round((stats.completed / stats.total) * 100)}%</span>
        </div>
      )}
    </div>
  )
}

export default TaskManager
```

**配套样式：**

```css
.task-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.add-task {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.add-task input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-task select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-task button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 10px;
}

.filters, .sort {
  display: flex;
  gap: 5px;
}

.filters button, .sort button {
  padding: 8px 15px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.filters button.active, .sort button.active {
  background-color: #2196F3;
  color: white;
  border-color: #2196F3;
}

.task-list {
  list-style: none;
  padding: 0;
}

.task {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.task:hover {
  background-color: #f5f5f5;
}

.task.completed .task-text {
  text-decoration: line-through;
  color: #999;
}

.task-text {
  flex: 1;
  padding: 5px;
  border: 1px solid transparent;
  border-radius: 4px;
}

.task-text:focus {
  outline: none;
  border-color: #2196F3;
  background-color: white;
}

.priority-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
}

.delete-btn {
  padding: 5px 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.task:hover .delete-btn {
  opacity: 1;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

.stats {
  display: flex;
  gap: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-top: 20px;
}

.priority-high {
  border-left: 4px solid #f44336;
}

.priority-medium {
  border-left: 4px solid #ff9800;
}

.priority-low {
  border-left: 4px solid #4caf50;
}
```

## 总结

本章我们深入学习了：

✅ 列表渲染的基本方法（使用 map）
✅ Keys 的重要性和最佳实践
✅ Key 的正确使用方式（唯一ID、避免随机数、避免对象）
✅ 列表操作：过滤、排序、分页
✅ 实战案例：任务管理系统（完整的CRUD操作）
✅ 性能优化：正确使用 key 避免不必要的渲染

**下一步：** 第56章将学习表单处理（受控/非受控组件），掌握 React 中的表单管理技巧。
