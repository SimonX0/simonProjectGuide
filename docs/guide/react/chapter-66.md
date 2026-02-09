# ：TanStack Query（React Query）

## TanStack Query 简介

### 为什么需要 TanStack Query？

在 React 应用中，我们通常有两类状态：

1. **客户端状态**：UI 状态、表单数据、主题等（使用 useState、useReducer、Zustand）
2. **服务端状态**：从 API 获取的数据、缓存、同步状态

TanStack Query（原名 React Query）专门用于**服务端状态管理**，解决了以下问题：

- ✅ 自动缓存和重新验证
- ✅ 重复请求去重
- ✅ 自动重试和错误处理
- ✅ 后台数据更新
- ✅ 分页和无限滚动支持
- ✅ 乐观更新
- ✅ 并行和串行请求

### 安装 TanStack Query

```bash
# 使用 npm
npm install @tanstack/react-query

# 使用 yarn
yarn add @tanstack/react-query

# 使用 pnpm
pnpm add @tanstack/react-query
```

## 基础配置

### 设置 QueryClient

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ✅ 创建 QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分钟内数据视为新鲜
      cacheTime: 1000 * 60 * 30, // 缓存保留30分钟
      refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取
      retry: 3, // 失败重试3次
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000) // 指数退避
    }
  }
})

// ✅ 包裹应用
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  )
}

// ✅ 使用 React DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

## useQuery 基础

### 基础用法

```tsx
import { useQuery } from '@tanstack/react-query'

// ❌ 使用 useEffect + useState（繁琐）
const UserProfileOld = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/user/1')
      .then(res => res.json())
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
  return <div>{user?.name}</div>
}

// ✅ 使用 useQuery（简洁）
const UserProfile = () => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', '1'],
    queryFn: async () => {
      const response = await fetch('/api/user/1')
      if (!response.ok) throw new Error('获取用户失败')
      return response.json()
    }
  })

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>错误：{error.message}</div>
  return <div>{user?.name}</div>
}
```

### queryKey 和 queryFn

```tsx
import { useQuery } from '@tanstack/react-query'

// ✅ 简单的 queryKey
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers
})

// ✅ 带参数的 queryKey
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId)
})

// ✅ 复杂的 queryKey（对象形式）
const { data } = useQuery({
  queryKey: ['products', { category: 'electronics', page: 1 }],
  queryFn: () => fetchProducts({ category: 'electronics', page: 1 })
})

// ✅ queryFn 可以访问 queryKey
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: async ({ queryKey }) => {
    const [, id] = queryKey
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  }
})
```

### useQuery 返回值

```tsx
const {
  data,           // 查询返回的数据
  dataUpdatedAt,  // 数据最后更新时间戳
  error,          // 错误对象
  errorUpdatedAt, // 错误最后更新时间戳
  failureCount,   // 失败重试次数
  failureReason,  // 失败原因
  fetchStatus,    // 请求状态：'fetching' | 'paused' | 'idle'
  isError,        // 是否有错误
  isFetched,      // 是否已经获取过数据
  isFetchedAfterMount, // 组件挂载后是否获取过数据
  isFetching,     // 是否正在获取数据
  isLoading,      // 是否正在加载（首次）
  isPending,      // 是否正在处理
  isInitialLoading, // 是否首次加载
  isPaused,       // 请求是否暂停
  isRefetching,   // 是否正在重新获取
  isStale,        // 数据是否过期
  refetch,        // 手动重新获取函数
  status,         // 状态：'pending' | 'error' | 'success'
} = useQuery({
  queryKey: ['key'],
  queryFn: () => fetch('/api/data').then(r => r.json())
})

// ✅ 常用状态判断
if (isLoading) return <Spinner />
if (isError) return <ErrorMessage error={error} />
if (isPending) return <Spinner />
return <DataDisplay data={data} />
```

## useMutation 基础

### 基础用法

```tsx
import { useMutation } from '@tanstack/react-query'

// ✅ POST 请求
const createUser = () => {
  const mutation = useMutation({
    mutationFn: async (newUser: User) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      if (!response.ok) throw new Error('创建用户失败')
      return response.json()
    },
    onSuccess: (data) => {
      console.log('用户创建成功：', data)
      // 可以触发其他查询的重新获取
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      console.error('创建失败：', error)
    }
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.target as HTMLFormElement)
      mutation.mutate({
        name: formData.get('name'),
        email: formData.get('email')
      })
    }}>
      <input name="name" placeholder="姓名" />
      <input name="email" placeholder="邮箱" />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '创建中...' : '创建用户'}
      </button>
    </form>
  )
}

// ✅ PUT 请求（更新）
const updateUser = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, ...data }: User) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return response.json()
    },
    onMutate: async (variables) => {
      // 乐观更新：先更新 UI
      await queryClient.cancelQueries({ queryKey: ['users'] })
      const previousUsers = queryClient.getQueryData(['users'])

      queryClient.setQueryData(['users'], (old: User[]) =>
        old.map(user =>
          user.id === variables.id ? { ...user, ...variables } : user
        )
      )

      return { previousUsers }
    },
    onError: (err, variables, context) => {
      // 出错时回滚
      queryClient.setQueryData(['users'], context.previousUsers)
    },
    onSettled: () => {
      // 无论成功失败都重新获取
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return <button onClick={() => mutation.mutate(updatedUser)}>更新</button>
}

// ✅ DELETE 请求
const deleteUser = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('删除失败')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return <button onClick={() => mutation.mutate(userId)}>删除</button>
}
```

### Mutation 状态

```tsx
const {
  data,            // mutation 返回的数据
  error,           // 错误对象
  isError,         // 是否有错误
  isIdle,          // 是否处于空闲状态
  isPending,       // 是否正在处理
  isSuccess,       // 是否成功
  mutate,          // 触发 mutation 函数
  mutateAsync,     // 异步触发 mutation 函数
  reset,           // 重置 mutation 状态
  status,          // 状态：'idle' | 'pending' | 'success' | 'error'
  variables,       // mutation 使用的变量
} = useMutation({
  mutationFn: (userData) => axios.post('/api/users', userData)
})

// ✅ 使用 mutate（不关心返回值）
mutation.mutate({ name: 'John', email: 'john@example.com' })

// ✅ 使用 mutateAsync（需要返回值）
const handleSubmit = async () => {
  try {
    const result = await mutation.mutateAsync({ name: 'John', email: 'john@example.com' })
    console.log('创建成功：', result)
  } catch (error) {
    console.error('创建失败：', error)
  }
}
```

## 缓存和重新验证

### 缓存配置

```tsx
import { useQuery } from '@tanstack/react-query'

// ✅ staleTime：数据视为新鲜的时间
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 1000 * 60 * 5 // 5分钟内不会重新获取
})

// ✅ gcTime：缓存保留时间（旧称 cacheTime）
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  gcTime: 1000 * 60 * 30 // 缓存保留30分钟
})

// ✅ refetchInterval：定时重新获取
const { data } = useQuery({
  queryKey: ['time'],
  queryFn: () => fetch('/api/time').then(r => r.json()),
  refetchInterval: 1000 // 每秒更新一次
})

// ✅ refetchIntervalInBackground：后台时也重新获取
const { data } = useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  refetchInterval: 1000 * 60, // 每分钟
  refetchIntervalInBackground: true // 切换标签页也继续
})

// ✅ refetchOnWindowFocus：窗口聚焦时重新获取
const { data } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
  refetchOnWindowFocus: true // 默认值
})

// ✅ refetchOnMount：组件挂载时重新获取
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  refetchOnMount: true // 默认值
})
```

### 手动缓存操作

```tsx
import { useQueryClient } from '@tanstack/react-query'

const CacheManager = () => {
  const queryClient = useQueryClient()

  // ✅ 手动重新获取
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  }

  // ✅ 手动设置数据
  const setData = () => {
    queryClient.setQueryData(['users'], (old: User[]) => [
      ...old,
      { id: 'new', name: '新用户' }
    ])
  }

  // ✅ 手动获取数据
  const getData = () => {
    const users = queryClient.getQueryData(['users'])
    console.log(users)
  }

  // ✅ 预取数据
  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['user', '2'],
      queryFn: () => fetchUser('2')
    })
  }

  // ✅ 清除缓存
  const clearCache = () => {
    queryClient.removeQueries({ queryKey: ['users'] })
  }

  // ✅ 清除所有缓存
  const clearAll = () => {
    queryClient.clear()
  }

  return (
    <div>
      <button onClick={refetch}>重新获取</button>
      <button onClick={setData}>设置数据</button>
      <button onClick={getData}>获取数据</button>
      <button onClick={prefetch}>预取数据</button>
      <button onClick={clearCache}>清除缓存</button>
      <button onClick={clearAll}>清除所有</button>
    </div>
  )
}
```

## 无限查询和分页

### useInfiniteQuery 基础

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

// ✅ 基础无限查询
const InfiniteList = () => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/projects?page=${pageParam}`)
      return response.json()
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      // 如果有下一页，返回下一页的页码
      if (lastPage.hasMore) {
        return lastPageParam + 1
      }
      // 没有下一页，返回 undefined
      return undefined
    },
  })

  if (status === 'pending') return <div>加载中...</div>
  if (status === 'error') return <div>错误：{error.message}</div>

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.projects.map(project => (
            <div key={project.id}>{project.name}</div>
          ))}
        </div>
      ))}

      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? '加载更多...'
          : hasNextPage
          ? '加载更多'
          : '没有更多了'}
      </button>
    </div>
  )
}

// ✅ 滚动加载更多
const ScrollInfiniteList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['photos'],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(`/api/photos?page=${pageParam}`)
      return res.json()
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
  })

  const observerRef = useRef<IntersectionObserver>()

  const lastElementRef = useCallback(node => {
    if (isFetchingNextPage) return
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage()
      }
    })

    if (node) observerRef.current.observe(node)
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.photos.map((photo, index) => (
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.title}
              ref={index === page.photos.length - 1 ? lastElementRef : undefined}
            />
          ))}
        </div>
      ))}

      {isFetchingNextPage && <div>加载中...</div>}
    </div>
  )
}
```

## 错误处理和重试

### 全局错误处理

```tsx
import { QueryClient } from '@tanstack/react-query'

// ✅ 全局错误处理
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // 失败重试3次
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('查询错误：', error)
        // 可以在这里添加全局错误提示
      }
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('变更错误：', error)
      }
    }
  }
})

// ✅ 自定义重试逻辑
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: (failureCount, error) => {
    // 如果是 404 错误，不重试
    if (error.status === 404) return false
    // 其他错误最多重试3次
    return failureCount < 3
  },
  retryDelay: attemptIndex => {
    // 自定义延迟
    return attemptIndex * 1000
  }
})
```

### 查询级别的错误处理

```tsx
// ✅ onError 回调
const { data, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  onError: (error) => {
    toast.error(`加载用户失败：${error.message}`)
  }
})

// ✅ 使用 isError 状态
const UserProfile = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })

  if (isLoading) return <Spinner />
  if (isError) return <ErrorMessage error={error} />
  return <div>{data.name}</div>
}

// ✅ 错误边界
import { ErrorBoundary } from 'react-error-boundary'

const App = () => {
  return (
    <ErrorBoundary
      fallback={<div>出错了！</div>}
      onError={(error) => console.error(error)}
    >
      <UserProfile />
    </ErrorBoundary>
  )
}
```

## 实战案例：博客文章列表（CRUD）

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ==================== 类型定义 ====================
interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
}

interface NewPost {
  title: string
  content: string
  author: string
}

// ==================== API 函数 ====================
const api = {
  // 获取所有文章
  fetchPosts: async (): Promise<Post[]> => {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts')
    if (!response.ok) throw new Error('获取文章失败')
    const posts = await response.json()
    // 只取前10篇
    return posts.slice(0, 10).map((post: any) => ({
      id: String(post.id),
      title: post.title,
      content: post.body,
      author: '作者' + post.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  },

  // 获取单篇文章
  fetchPost: async (id: string): Promise<Post> => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
    if (!response.ok) throw new Error('获取文章失败')
    const post = await response.json()
    return {
      id: String(post.id),
      title: post.title,
      content: post.body,
      author: '作者' + post.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  // 创建文章
  createPost: async (newPost: NewPost): Promise<Post> => {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newPost.title,
        body: newPost.content,
        userId: 1
      })
    })
    if (!response.ok) throw new Error('创建文章失败')
    const post = await response.json()
    return {
      id: String(post.id),
      title: newPost.title,
      content: newPost.content,
      author: newPost.author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  // 更新文章
  updatePost: async (id: string, updates: Partial<Post>): Promise<Post> => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updates.title,
        body: updates.content,
        userId: 1
      })
    })
    if (!response.ok) throw new Error('更新文章失败')
    const post = await response.json()
    return {
      id: String(post.id),
      title: updates.title || '',
      content: updates.content || '',
      author: updates.author || '',
      createdAt: updates.createdAt || '',
      updatedAt: new Date().toISOString()
    }
  },

  // 删除文章
  deletePost: async (id: string): Promise<void> => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('删除文章失败')
  }
}

// ==================== 组件 ====================

// 文章列表
const PostList = ({ onSelectPost }: { onSelectPost: (id: string) => void }) => {
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['posts'],
    queryFn: api.fetchPosts,
    staleTime: 1000 * 60 * 5 // 5分钟缓存
  })

  if (isLoading) return <div className="loading">加载中...</div>
  if (isError) return (
    <div className="error">
      <p>错误：{error.message}</p>
      <button onClick={() => refetch()}>重试</button>
    </div>
  )

  return (
    <div className="post-list">
      <div className="post-list-header">
        <h2>文章列表</h2>
        <button onClick={() => onSelectPost('new')}>+ 新建文章</button>
      </div>

      <div className="posts">
        {posts?.map(post => (
          <div
            key={post.id}
            className="post-card"
            onClick={() => onSelectPost(post.id)}
          >
            <h3>{post.title}</h3>
            <p className="post-meta">
              <span className="author">{post.author}</span>
              <span className="date">{new Date(post.createdAt).toLocaleDateString()}</span>
            </p>
            <p className="post-excerpt">{post.content.slice(0, 100)}...</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// 文章详情/编辑
const PostDetail = ({ postId, onBack }: { postId: string; onBack: () => void }) => {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(postId === 'new')

  // 获取文章
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => api.fetchPost(postId),
    enabled: postId !== 'new' // 新建时不执行查询
  })

  // 创建文章
  const createMutation = useMutation({
    mutationFn: api.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('文章创建成功！')
      onBack()
    }
  })

  // 更新文章
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Post>) =>
      api.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      toast.success('文章更新成功！')
      setIsEditing(false)
    }
  })

  // 删除文章
  const deleteMutation = useMutation({
    mutationFn: api.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('文章删除成功！')
      onBack()
    }
  })

  if (postId === 'new') {
    return (
      <div className="post-detail">
        <PostForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={onBack}
          isSubmitting={createMutation.isPending}
        />
      </div>
    )
  }

  if (isLoading) return <div className="loading">加载中...</div>
  if (isError) return <div className="error">加载失败</div>
  if (!post) return null

  if (isEditing) {
    return (
      <div className="post-detail">
        <PostForm
          post={post}
          onSubmit={(data) => updateMutation.mutate({ id: postId, ...data })}
          onCancel={() => setIsEditing(false)}
          isSubmitting={updateMutation.isPending}
        />
      </div>
    )
  }

  return (
    <div className="post-detail">
      <div className="post-detail-header">
        <button onClick={onBack}>← 返回</button>
        <div className="actions">
          <button onClick={() => setIsEditing(true)}>编辑</button>
          <button
            className="danger"
            onClick={() => {
              if (confirm('确定要删除这篇文章吗？')) {
                deleteMutation.mutate(postId)
              }
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? '删除中...' : '删除'}
          </button>
        </div>
      </div>

      <article className="post-content">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span>作者：{post.author}</span>
          <span>创建于：{new Date(post.createdAt).toLocaleString()}</span>
          <span>更新于：{new Date(post.updatedAt).toLocaleString()}</span>
        </div>
        <div className="post-body">{post.content}</div>
      </article>
    </div>
  )
}

// 文章表单
const PostForm = ({
  post,
  onSubmit,
  onCancel,
  isSubmitting
}: {
  post?: Post
  onSubmit: (data: NewPost) => void
  onCancel: () => void
  isSubmitting: boolean
}) => {
  const [formData, setFormData] = useState<NewPost>(
    post || { title: '', content: '', author: '' }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('标题和内容不能为空')
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <div className="form-header">
        <h2>{post ? '编辑文章' : '新建文章'}</h2>
        <button type="button" onClick={onCancel}>取消</button>
      </div>

      <div className="form-group">
        <label>标题</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="请输入文章标题"
          required
        />
      </div>

      <div className="form-group">
        <label>作者</label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          placeholder="请输入作者名"
          required
        />
      </div>

      <div className="form-group">
        <label>内容</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="请输入文章内容"
          rows={15}
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '提交'}
        </button>
        <button type="button" onClick={onCancel}>取消</button>
      </div>
    </form>
  )
}

// 主应用
const BlogApp = () => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  return (
    <div className="blog-app">
      <ToastContainer />
      <header className="app-header">
        <h1>📝 博客管理系统</h1>
      </header>

      <main className="app-main">
        {selectedPostId ? (
          <PostDetail
            postId={selectedPostId}
            onBack={() => setSelectedPostId(null)}
          />
        ) : (
          <PostList onSelectPost={setSelectedPostId} />
        )}
      </main>
    </div>
  )
}

export default BlogApp
```

**配套样式：**

```css
.blog-app {
  min-height: 100vh;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: white;
  padding: 20px 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.app-header h1 {
  margin: 0;
  color: #2196F3;
}

.app-main {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

/* 文章列表 */
.post-list {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.post-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.post-list-header h2 {
  margin: 0;
  color: #333;
}

.posts {
  display: grid;
  gap: 20px;
}

.post-card {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.post-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.post-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #666;
  margin: 10px 0;
}

.post-excerpt {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 文章详情 */
.post-detail {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.post-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
}

.post-detail-header .actions {
  display: flex;
  gap: 10px;
}

.post-content {
  padding: 40px;
}

.post-content h1 {
  margin-top: 0;
  color: #333;
}

.post-content .post-meta {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.post-body {
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

/* 表单 */
.post-form {
  padding: 30px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.form-header h2 {
  margin: 0;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2196F3;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 按钮 */
button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

button[type="submit"] {
  background: #2196F3;
  color: white;
}

button[type="submit"]:hover {
  background: #1976D2;
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button[type="button"] {
  background: #f5f5f5;
  color: #333;
}

button[type="button"]:hover {
  background: #e0e0e0;
}

button.danger {
  background: #f44336;
  color: white;
}

button.danger:hover {
  background: #d32f2f;
}

/* 加载和错误状态 */
.loading {
  text-align: center;
  padding: 60px;
  color: #999;
}

.error {
  text-align: center;
  padding: 40px;
  background: #ffebee;
  border-radius: 8px;
  color: #c62828;
}
```

## TanStack Query 最佳实践

### 1. 组织 Query Keys

```tsx
// ✅ 使用结构化的 query keys
const queryKeys = {
  all: ['users'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: string) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
}

// 使用
const { data } = useQuery({
  queryKey: queryKeys.detail(userId),
  queryFn: () => fetchUser(userId)
})
```

### 2. 错误处理策略

```tsx
// ✅ 统一的错误处理
const useErrorHandler = () => {
  return (error: Error) => {
    if (error.message.includes('401')) {
      // 处理未授权
    } else if (error.message.includes('500')) {
      // 处理服务器错误
    }
    toast.error(error.message)
  }
}
```

## 总结

本章我们学习了：

✅ TanStack Query 的安装和基础配置
✅ useQuery 和 useMutation 的使用
✅ 缓存机制和重新验证策略
✅ 无限查询和分页实现
✅ 错误处理和重试机制
✅ 实战案例：完整的博客 CRUD 应用
✅ TanStack Query 最佳实践

**TanStack Query vs 传统方案：**

| 特性 | TanStack Query | useEffect + useState |
|------|----------------|---------------------|
| 缓存 | ✅ 自动 | ❌ 手动 |
| 去重 | ✅ 自动 | ❌ 手动 |
| 重试 | ✅ 自动 | ❌ 手动 |
| 后台更新 | ✅ 支持 | ❌ 不支持 |
| 代码量 | 少 | 多 |

**下一步：** 第67章将学习 React Hook Form，掌握高性能的表单管理方案。
