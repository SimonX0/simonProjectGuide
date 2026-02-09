---
title: React中级面试题
---

# React中级面试题

> 基于字节跳动、腾讯、阿里等大厂2024-2026年面试真题整理

## React核心概念

### 1. React虚拟DOM与Diff算法

#### 问题1：什么是虚拟DOM？它的优势是什么？

```jsx
// 虚拟DOM是真实DOM的JavaScript对象表示
const virtualDOM = {
  type: 'div',
  props: {
    id: 'container',
    className: 'wrapper'
  },
  children: [
    {
      type: 'h1',
      props: {},
      children: ['Hello React']
    },
    {
      type: 'p',
      props: {},
      children: ['虚拟DOM讲解']
    }
  ]
};

// 对应的真实DOM
<div id="container" class="wrapper">
  <h1>Hello React</h1>
  <p>虚拟DOM讲解</p>
</div>

// 虚拟DOM的优势

// 1. 批量更新 - 减少DOM操作次数
function updateDOM(oldVNode, newVNode) {
  // 先在内存中对比
  const patches = diff(oldVNode, newVNode);
  // 批量应用到真实DOM
  applyPatches(patches);
}

// 2. 跨浏览器兼容 - 统一的API
// 不需要关心不同浏览器的DOM差异

// 3. 提升性能 - 减少重排重绘
// 一次性更新DOM，而不是多次操作
```

**核心优势总结：**

| 特性 | 真实DOM操作 | 虚拟DOM |
|------|------------|---------|
| 更新成本 | 高（每次都重排重绘） | 低（JS计算快） |
| 批量更新 | 困难 | 容易 |
| 跨平台 | 不兼容 | 天然支持 |
| 内存占用 | 低 | 较高 |

#### 问题2：React Diff算法的核心策略？

```javascript
// React的三大Diff策略

// 1. Tree Diff - 只对同层级节点比较
// ❌ 跨层级移动 - 删除A及其子节点，创建B及其子节点
// <div>
//   <A />
// </div>
// 变成
// <div>
//   <B />
// </div>

// ✅ 同层级操作 - 只需要移动节点
// <div>
//   <A />
// </div>
// 变成
// <div>
//   <A />
//   <B />
// </div>

// 2. Component Diff - 同类型组件继续比较Virtual DOM
// 不同类型组件直接替换

// 3. Element Diff - 对同层级子节点通过key比较
function reconcileChildren(oldChildren, newChildren) {
  // 使用key进行复用判断
  const keyedOldChildren = {};
  oldChildren.forEach(child => {
    if (child.key !== null) {
      keyedOldChildren[child.key] = child;
    }
  });

  // 通过key匹配可复用节点
  newChildren.forEach(child => {
    const key = child.key;
    if (keyedOldChildren[key]) {
      // 复用节点
      const oldChild = keyedOldChildren[key];
      patch(oldChild, child);
    } else {
      // 创建新节点
      mount(child);
    }
  });
}
```

**key的重要性：**

```jsx
// ❌ 错误：使用index作为key
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
// 问题：插入新项时，所有后续项都需要重新渲染

// ✅ 正确：使用唯一ID作为key
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
// 优势：React可以精确识别哪些项需要更新
```

### 2. React Hooks深度理解

#### 问题3：为什么需要Hooks？

```jsx
// Class组件的问题

// 1. 逻辑复用困难
// 两个组件有相同的逻辑？HOC或Render Props，但会导致"包装地狱"
class UserComponent extends React.Component {
  state = { user: null };
  componentDidMount() {
    this.fetchUser();
  }
  fetchUser() {
    // ...
  }
  render() {
    return <div>{this.state.user?.name}</div>;
  }
}

// 使用Hooks - 逻辑复用变得简单
function useUser(id) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(id).then(setUser);
  }, [id]);

  return user;
}

function UserComponent({ id }) {
  const user = useUser(id);
  return <div>{user?.name}</div>;
}

// 2. 复杂组件难以理解
// 相关逻辑分散在不同生命周期方法中

// 3. Class组件的this指向问题
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    // ❌ 需要手动绑定this
    this.increment = this.increment.bind(this);
  }

  increment() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return (
      <button onClick={this.increment}>
        Count: {this.state.count}
      </button>
    );
  }
}

// Hooks不需要绑定this
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

#### 问题4：useState的实现原理？

```javascript
// useState的简化实现

let hooks = [];
let currentHookIndex = 0;

function useState(initialValue) {
  const hookIndex = currentHookIndex;

  // 初始化或读取现有状态
  if (hooks[hookIndex] === undefined) {
    hooks[hookIndex] = {
      value: typeof initialValue === 'function'
        ? initialValue()
        : initialValue
    };
  }

  const hook = hooks[hookIndex];

  // setState函数
  const setState = (newValue) => {
    const valueToSet = typeof newValue === 'function'
      ? newValue(hook.value)
      : newValue;

    // 值变化时触发重新渲染
    if (valueToSet !== hook.value) {
      hook.value = valueToSet;
      render(); // 重新渲染组件
    }
  };

  currentHookIndex++;

  return [hook.value, setState];
}

// 使用示例
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div onClick={() => setCount(count + 1)}>
      {count}
    </div>
  );
}
```

**面试追问：为什么useState的顺序不能改变？**

```jsx
// ❌ 错误示例
function Counter() {
  const [count, setCount] = useState(0);

  if (count > 0) {
    // 条件语句中使用Hook
    const [name, setName] = useState('Counter');
    // ⚠️ 第一次渲染count=0，不会执行
    // 第二次渲染count=1，执行Hook
    // hookIndex对不上，导致状态混乱
  }

  return <div>{count}</div>;
}

// ✅ 正确：Hooks必须在顶层调用
function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Counter');

  // 始终按相同顺序调用
  return <div>{count}</div>;
}
```

#### 问题5：useEffect的执行时机和依赖数组？

```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. 每次渲染后都执行
  useEffect(() => {
    console.log('每次渲染都执行');
  });

  // 2. 只在组件挂载时执行一次
  useEffect(() => {
    console.log('只在挂载时执行');
    // 相当于componentDidMount
  }, []); // 空依赖数组

  // 3. userId变化时执行
  useEffect(() => {
    console.log('userId变化时执行');
    setLoading(true);

    fetchUser(userId)
      .then(data => {
        setUser(data);
        setLoading(false);
      });

    // 返回清理函数（相当于componentWillUnmount）
    return () => {
      console.log('清理工作');
      // 取消请求、清除定时器等
    };
  }, [userId]); // 依赖userId

  // 4. 多个依赖
  useEffect(() => {
    console.log('userId或loading变化');
  }, [userId, loading]);

  // ⚠️ 注意：依赖数组要完整
  // ❌ 错误：缺少依赖
  useEffect(() => {
    const handler = () => {
      console.log(userId); // 使用了userId但没有声明
    };
    document.addEventListener('click', handler);
    return () => {
      document.removeEventListener('click', handler);
    };
  }, []); // 缺少userId依赖

  // ✅ 正确：声明所有依赖
  useEffect(() => {
    const handler = () => {
      console.log(userId);
    };
    document.addEventListener('click', handler);
    return () => {
      document.removeEventListener('click', handler);
    };
  }, [userId]); // 包含userId

  return loading ? <div>Loading...</div> : <div>{user?.name}</div>;
}

// useEffect vs useLayoutEffect
// useEffect - 异步执行，不阻塞渲染
// useLayoutEffect - 同步执行，阻塞渲染

function Component() {
  useLayoutEffect(() => {
    // 同步执行，浏览器绘制前
    // 适合需要读取DOM布局的场景
    const rect = element.getBoundingClientRect();
  });

  useEffect(() => {
    // 异步执行，浏览器绘制后
    // 适合不需要阻塞渲染的场景
    console.log('渲染完成');
  });
}
```

### 3. React性能优化

#### 问题6：React.memo、useMemo、useCallback的区别？

```jsx
import { memo, useMemo, useCallback, useState } from 'react';

// React.memo - 组件级别的优化
// 类似于PureComponent，浅比较props
const ExpensiveComponent = memo(function ExpensiveComponent({ name }) {
  console.log('ExpensiveComponent渲染');
  return <div>Hello {name}</div>;
});

// 使用示例
function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      {/* 只有name变化时才重新渲染 */}
      <ExpensiveComponent name="Vue3" />
    </div>
  );
}

// useMemo - 缓存计算结果
function FactorialCalculator({ number }) {
  // ❌ 每次渲染都重新计算
  // const factorial = calculateFactorial(number);

  // ✅ 只在number变化时计算
  const factorial = useMemo(() => {
    console.log('计算阶乘');
    return calculateFactorial(number);
  }, [number]);

  return <div>阶乘: {factorial}</div>;
}

// useCallback - 缓存函数引用
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // ❌ 每次渲染都创建新函数
  // const handleClick = () => {
  //   console.log(count);
  // };

  // ✅ 只在count变化时创建新函数
  const handleClick = useCallback(() => {
    console.log(count);
  }, [count]);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      <ChildComponent onClick={handleClick} />
    </div>
  );
}

// 对比总结

/*
React.memo:
  - 优化组件
  - 浅比较props
  - 防止不必要的重新渲染

useMemo:
  - 优化计算
  - 缓存计算结果
  - 只在依赖变化时重新计算

useCallback:
  - 优化函数
  - 缓存函数引用
  - 实际上是useMemo的语法糖
  const fn = useCallback(() => {}, [deps]);
  // 等价于
  const fn = useMemo(() => () => {}, [deps]);
*/
```

#### 问题7：如何避免不必要的重渲染？

```jsx
// 场景1：状态提升导致不必要的渲染
function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      <input onChange={(e) => setName(e.target.value)} />
      {/* count变化时，Child也会重新渲染 */}
      <Child />
    </div>
  );
}

// ✅ 解决方案1：状态分离
function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <div>
      <Counter count={count} setCount={setCount} />
      <NameInput name={name} setName={setName} />
      <Child />
    </div>
  );
}

// ✅ 解决方案2：使用React.memo
const Child = memo(function Child() {
  console.log('Child渲染');
  return <div>Child</div>;
});

// ✅ 解决方案3：使用Context + useReducer
const CountContext = createContext();
const NameContext = createContext();

function Parent() {
  const [count, countDispatch] = useReducer(countReducer, 0);
  const [name, nameDispatch] = useReducer(nameReducer, '');

  return (
    <CountContext.Provider value={{ count, dispatch: countDispatch }}>
      <NameContext.Provider value={{ name, dispatch: nameDispatch }}>
        <Counter />
        <NameInput />
        <Child />
      </NameContext.Provider>
    </CountContext.Provider>
  );
}

// 场景2：传递对象导致子组件重渲染
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      {/* 每次渲染都创建新对象config */}
      <Child config={{ option1: 'a', option2: 'b' }} />
    </div>
  );
}

// ✅ 解决方案：使用useMemo缓存对象
function Parent() {
  const [count, setCount] = useState(0);

  const config = useMemo(() => ({
    option1: 'a',
    option2: 'b'
  }), []); // 空依赖，只创建一次

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      <Child config={config} />
    </div>
  );
}

// ✅ 解决方案：提升state到子组件内部
function Child({ config }) {
  const [localState, setLocalState] = useState('');

  return (
    <div>
      <input onChange={(e) => setLocalState(e.target.value)} />
      <div>{config.option1}</div>
    </div>
  );
}
```

### 4. React 18新特性

#### 问题8：React 18的并发模式是什么？

```jsx
// 并发渲染（Concurrent Rendering）
// React 18可以中断、暂停、恢复渲染

import { startTransition, useTransition } from 'react';

function SearchComponent() {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;

    // 高优先级更新：立即响应
    setInput(value);

    // 低优先级更新：可中断
    startTransition(() => {
      // 复杂的过滤操作
      const filtered = largeList.filter(item =>
        item.includes(value)
      );
      setList(filtered);
    });
  };

  return (
    <div>
      <input value={input} onChange={handleChange} />
      {isPending && <div>搜索中...</div>}
      <ul>
        {list.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// 自动批处理（Automatic Batching）
// React 18之前：只在事件处理函数中批处理
// React 18：所有状态更新自动批处理

function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  // React 17：两次渲染
  function handleClick() {
    setTimeout(() => {
      setCount(c => c + 1); // 不批处理
      setFlag(f => !f); // 不批处理
    }, 0);
  }

  // React 18：自动批处理为一次渲染
  function handleClick() {
    setTimeout(() => {
      setCount(c => c + 1); // 批处理
      setFlag(f => !f); // 批处理
    }, 0);
  }

  // 使用flushSync强制同步更新
  import { flushSync } from 'react-dom';

  function handleClick() {
    flushSync(() => {
      setCount(c => c + 1);
    });
    // 立即更新DOM
    console.log('DOM已更新');
  }
}

// Suspense改进
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AsyncComponent />
    </Suspense>
  );
}
```

### 5. React组件设计模式

#### 问题9：受控组件 vs 非受控组件？

```jsx
// 受控组件（Controlled Components）
// 表单元素的值由React状态控制
function ControlledForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('提交:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
      />
      <button type="submit">提交</button>
    </form>
  );
}

// 非受控组件（Uncontrolled Components）
// 表单元素的值由DOM自己维护
function UncontrolledForm() {
  const usernameRef = useRef();
  const passwordRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('提交:', {
      username: usernameRef.current.value,
      password: passwordRef.current.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={usernameRef}
        name="username"
      />
      <input
        ref={passwordRef}
        name="password"
        type="password"
      />
      <button type="submit">提交</button>
    </form>
  );
}

// 什么时候用哪个？

// 受控组件 - 推荐使用
// ✅ 需要实时验证
// ✅ 需要条件渲染
// ✅ 需要禁用/启用表单元素
// ✅ 需要格式化输入值

// 非受控组件
// ✅ 简单的表单
// ✅ 集成第三方库
// ✅ 不需要控制表单值

// React Hook Form - 最佳实践
import { useForm } from 'react-hook-form';

function HookForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('username', { required: '用户名必填' })}
      />
      {errors.username && <span>{errors.username.message}</span>}

      <input
        type="password"
        {...register('password', { required: '密码必填' })}
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">提交</button>
    </form>
  );
}
```

### 6. React状态管理

#### 问题10：如何选择状态管理方案？

```jsx
// 方案1：useState + useContext - 简单应用
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 方案2：Redux - 大型应用
import { createStore } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';

// Redux Toolkit（推荐）
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => {
      state.value += 1;
    },
    decrement: state => {
      state.value -= 1;
    }
  }
});

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer
  }
});

function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>
        +
      </button>
      <button onClick={() => dispatch(decrement())}>
        -
      </button>
    </div>
  );
}

// 方案3：Zustand - 轻量级
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 }))
}));

function Counter() {
  const { count, increment, decrement } = useStore();
  // ...
}

// 方案4：Jotai - 原子化状态
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  // ...
}

// 选择建议

/*
小型项目（<5个页面）:
  - useState + useReducer
  - Context API

中型项目（5-20个页面）:
  - Zustand
  - Jotai
  - Recoil

大型项目（>20个页面）:
  - Redux Toolkit
  - 需要时间旅行调试
  - 需要中间件生态
*/
```

### 7. React常见面试题总结

**Q: React的 reconciliation过程？**
1. React创建新的虚拟DOM树
2. 比较新旧虚拟DOM树（Diff算法）
3. 计算最小变化集合
4. 更新真实DOM

**Q: key的作用是什么？**
- 帮助React识别哪些元素改变了
- 提升Diff算法效率
- 避免不必要的重渲染

**Q: useEffect和useLayoutEffect的区别？**
- useEffect：异步执行，不阻塞渲染
- useLayoutEffect：同步执行，阻塞渲染
- 大多数情况使用useEffect

**Q: 如何优化React组件性能？**
1. React.memo避免不必要的重渲染
2. useMemo缓存计算结果
3. useCallback缓存函数引用
4. 虚拟列表（react-window）
5. 代码分割（React.lazy）

---

**参考资源：**

- [React面试必杀技！2025最新高频真题](https://zhuanlan.zhihu.com/p/1941443061860266384)
- [2025年最新前端面试必问 - React高频面试题](https://zhuanlan.zhihu.com/p/1929224975224641430)
- [React最新高频面试题及核心考点解析](https://blog.csdn.net/qq_40860137/article/details/147145190)

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
