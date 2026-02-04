# 第 1 章：JavaScript 核心基础回顾（Vue3 前置知识）

## 第 1 章 JavaScript 核心基础回顾（Vue3 前置知识）

> **为什么要学这一章？**
>
> 在学习 Vue3 之前，掌握扎实的 JavaScript 基础至关重要。这一章将系统回顾 Vue3 开发中最常用的 JavaScript 核心特性，包括数组方法、数据解析、解构赋值等。这些知识会在后续的 Vue3 学习中反复出现。
>
> **学习目标**：
>
> - 熟练掌握常用数组方法（map/filter/reduce 等）
> - 理解 JSON 和 XML 数据的解析与处理
> - 掌握解构赋值的多种用法
> - 灵活运用扩展运算符和剩余参数
> - 了解现代 JavaScript 语法特性

---

### 1.1 数组方法完全指南

数组是前端开发中最常用的数据结构之一。Vue3 中处理列表渲染、数据过滤、数据转换等操作都离不开数组方法。

#### 1.1.1 遍历方法

##### **forEach()** - 遍历数组

对数组的每个元素执行一次给定的函数，**不返回新数组**。

```javascript
const users = [
  { id: 1, name: "张三", age: 25 },
  { id: 2, name: "李四", age: 30 },
  { id: 3, name: "王五", age: 28 },
];

// 基础用法
users.forEach((user, index) => {
  console.log(`${index}: ${user.name}`);
});
// 输出:
// 0: 张三
// 1: 李四
// 2: 王五

// Vue3 实际应用场景：批量更新数据
const updateUserStatus = (users) => {
  users.forEach((user) => {
    user.isActive = true;
    user.lastLogin = new Date();
  });
  return users;
};
```

##### **map()** - 映射转换

返回一个**新数组**，数组中的元素为原始数组元素调用函数处理后的值。

```javascript
const numbers = [1, 2, 3, 4, 5];

// 基础用法：每个数字翻倍
const doubled = numbers.map((num) => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// Vue3 实际应用场景：数据格式转换
const apiResponse = [
  { id: 1, full_name: "张三", user_age: 25 },
  { id: 2, full_name: "李四", user_age: 30 },
];

// 转换为前端需要的格式
const formattedUsers = apiResponse.map((user) => ({
  id: user.id,
  name: user.full_name,
  age: user.user_age,
  avatar: `/api/avatars/${user.id}.png`,
}));
console.log(formattedUsers);
// [
//   { id: 1, name: '张三', age: 25, avatar: '/api/avatars/1.png' },
//   { id: 2, name: '李四', age: 30, avatar: '/api/avatars/2.png' }
// ]

// Vue3 组合式函数中的应用
const useOptions = (items) => {
  return items.map((item) => ({
    label: item.name,
    value: item.id,
    disabled: !item.active,
  }));
};
```

##### **filter()** - 过滤筛选

返回一个**新数组**，包含通过测试的所有元素。

```javascript
const products = [
  { id: 1, name: "iPhone", price: 6999, inStock: true },
  { id: 2, name: "iPad", price: 3999, inStock: false },
  { id: 3, name: "MacBook", price: 12999, inStock: true },
  { id: 4, name: "AirPods", price: 1299, inStock: true },
];

// 基础用法：筛选有库存的商品
const inStockProducts = products.filter((p) => p.inStock);
console.log(inStockProducts);
// [iPhone, MacBook, AirPods]

// 链式调用：筛选价格大于5000的有库存商品
const expensiveProducts = products
  .filter((p) => p.inStock)
  .filter((p) => p.price > 5000);
console.log(expensiveProducts); // [iPhone, MacBook]

// Vue3 实际应用场景：搜索过滤功能
const useSearch = (products, keyword) => {
  return products.filter((product) =>
    product.name.toLowerCase().includes(keyword.toLowerCase())
  );
};

// 多条件过滤
const useAdvancedFilter = (products, filters) => {
  return products.filter((product) => {
    const matchKeyword =
      !filters.keyword || product.name.includes(filters.keyword);
    const matchPrice = !filters.maxPrice || product.price <= filters.maxPrice;
    const matchStock = !filters.inStockOnly || product.inStock;

    return matchKeyword && matchPrice && matchStock;
  });
};
```

#### 1.1.2 查找方法

##### **find()** - 查找单个元素

返回数组中**满足条件的第一个元素**，如果没有找到返回 `undefined`。

```javascript
const users = [
  { id: 1, name: "张三", email: "zhangsan@example.com" },
  { id: 2, name: "李四", email: "lisi@example.com" },
  { id: 3, name: "王五", email: "wangwu@example.com" },
];

// 查找ID为2的用户
const user = users.find((u) => u.id === 2);
console.log(user); // { id: 2, name: '李四', email: 'lisi@example.com' }

// Vue3 实际应用场景：根据ID查找详情
const useUserById = (users, id) => {
  return users.find((user) => user.id === id);
};

// 查找邮箱对应的用户
const findUserByEmail = (users, email) => {
  return users.find((user) => user.email === email);
};
```

##### **findIndex()** - 查找索引

返回数组中**满足条件的第一个元素的索引**，如果没有找到返回 `-1`。

```javascript
const todos = [
  { id: 1, text: "学习Vue3", done: false },
  { id: 2, text: "完成项目", done: true },
  { id: 3, text: "写代码", done: false },
];

// 找到未完成任务的索引
const notDoneIndex = todos.findIndex((t) => !t.done);
console.log(notDoneIndex); // 0

// Vue3 实际应用场景：更新数组中某一项
const updateTodo = (todos, id, updates) => {
  const index = todos.findIndex((t) => t.id === id);
  if (index !== -1) {
    todos[index] = { ...todos[index], ...updates };
  }
  return todos;
};

// 删除数组中某一项
const deleteTodo = (todos, id) => {
  const index = todos.findIndex((t) => t.id === id);
  if (index !== -1) {
    todos.splice(index, 1);
  }
  return todos;
};
```

##### **some()** - 是否存在满足条件的元素

返回布尔值，**至少有一个**元素满足条件就返回 `true`。

```javascript
const permissions = ["read", "write", "delete"];

// 检查是否有写权限
const hasWritePermission = permissions.some((p) => p === "write");
console.log(hasWritePermission); // true

// Vue3 实际应用场景：表单验证
const hasErrors = (formFields) => {
  return formFields.some((field) => !field.valid);
};

// 检查购物车是否有缺货商品
const hasOutOfStock = (cartItems) => {
  return cartItems.some((item) => item.stock < item.quantity);
};
```

##### **every()** - 是否所有元素都满足条件

返回布尔值，**所有元素**都满足条件才返回 `true`。

```javascript
const passwords = [
  { user: "张三", strong: true },
  { user: "李四", strong: true },
  { user: "王五", strong: true },
];

// 检查是否所有密码都够强
const allStrong = passwords.every((p) => p.strong);
console.log(allStrong); // true

// Vue3 实际应用场景：全选功能
const allSelected = (items) => {
  return items.every((item) => item.selected);
};

// 表单全部验证通过
const isFormValid = (fields) => {
  return fields.every((field) => field.valid && field.value);
};
```

#### 1.1.3 累加方法

##### **reduce()** - 归约累加

对数组中的每个元素执行一个自定义的累加器函数，将其结果汇总为单个返回值。

```javascript
// 基础用法1：求和
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 15

// 基础用法2：求平均值
const average = numbers.reduce((acc, num, index, arr) => {
  acc += num;
  return index === arr.length - 1 ? acc / arr.length : acc;
}, 0);
console.log(average); // 3

// 基础用法3：对象累加 - 按类别分组
const products = [
  { name: "iPhone", category: "phone", price: 6999 },
  { name: "iPad", category: "tablet", price: 3999 },
  { name: "MacBook", category: "laptop", price: 12999 },
  { name: "小米手机", category: "phone", price: 3999 },
];

const groupedByCategory = products.reduce((acc, product) => {
  const category = product.category;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(product);
  return acc;
}, {});

console.log(groupedByCategory);
// {
//   phone: [{ name: 'iPhone', ... }, { name: '小米手机', ... }],
//   tablet: [{ name: 'iPad', ... }],
//   laptop: [{ name: 'MacBook', ... }]
// }

// Vue3 实际应用场景1：计算购物车总价
const cartTotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

const cart = [
  { name: "iPhone", price: 6999, quantity: 1 },
  { name: "AirPods", price: 1299, quantity: 2 },
];
console.log(cartTotal(cart)); // 9597

// Vue3 实际应用场景2：统计数组中每个元素出现的次数
const countOccurrences = (arr) => {
  return arr.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
};

const fruits = ["苹果", "香蕉", "苹果", "橙子", "香蕉", "苹果"];
console.log(countOccurrences(fruits));
// { 苹果: 3, 香蕉: 2, 橙子: 1 }

// Vue3 实际应用场景3：数组转对象（以某个字段为key）
const arrayToObject = (arr, key) => {
  return arr.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
};

const users = [
  { id: 1, name: "张三" },
  { id: 2, name: "李四" },
];
console.log(arrayToObject(users, "id"));
// {
//   1: { id: 1, name: '张三' },
//   2: { id: 2, name: '李四' }
// }
```

#### 1.1.4 修改方法

##### **push() / pop()** - 尾部添加/删除

```javascript
const tasks = ["任务1", "任务2"];

// push: 在数组末尾添加一个或多个元素，返回新的长度
tasks.push("任务3");
console.log(tasks); // ['任务1', '任务2', '任务3']

// 添加多个
tasks.push("任务4", "任务5");
console.log(tasks); // ['任务1', '任务2', '任务3', '任务4', '任务5']

// pop: 删除并返回数组的最后一个元素
const lastTask = tasks.pop();
console.log(lastTask); // '任务5'
console.log(tasks); // ['任务1', '任务2', '任务3', '任务4']

// Vue3 响应式注意事项
// 在Vue3中使用ref/reactive时，直接使用这些方法是响应式的
const todos = ref(["学习Vue3", "写代码"]);
todos.value.push("完成项目"); // ✅ 响应式更新
```

##### **shift() / unshift()** - 头部删除/添加

```javascript
const queue = ["张三", "李四", "王五"];

// shift: 删除并返回数组的第一个元素
const first = queue.shift();
console.log(first); // '张三'
console.log(queue); // ['李四', '王五']

// unshift: 在数组开头添加一个或多个元素
queue.unshift("小明");
console.log(queue); // ['小明', '李四', '王五']

// Vue3 实际应用场景：队列操作
const useQueue = () => {
  const queue = ref([]);

  const enqueue = (item) => {
    queue.value.push(item);
  };

  const dequeue = () => {
    return queue.value.shift();
  };

  return { queue, enqueue, dequeue };
};
```

##### **splice()** - 删除/插入/替换

**最强大**的数组方法，可以删除、插入、替换元素。

```javascript
const fruits = ["苹果", "香蕉", "橙子", "葡萄"];

// 删除：从索引1开始删除2个元素
fruits.splice(1, 2);
console.log(fruits); // ['苹果', '葡萄']

// 插入：在索引1处插入'香蕉'和'橙子'
fruits.splice(1, 0, "香蕉", "橙子");
console.log(fruits); // ['苹果', '香蕉', '橙子', '葡萄']

// 替换：从索引1开始删除2个，并插入'芒果'和'草莓'
fruits.splice(1, 2, "芒果", "草莓");
console.log(fruits); // ['苹果', '芒果', '草莓', '葡萄']

// Vue3 实际应用场景1：删除数组某一项
const removeItem = (arr, index) => {
  arr.splice(index, 1);
  return arr;
};

// Vue3 实际应用场景2：拖拽排序
const moveItem = (arr, fromIndex, toIndex) => {
  const [item] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, item);
  return arr;
};

const list = ["A", "B", "C", "D"];
moveItem(list, 0, 2); // 把A移到C的位置
console.log(list); // ['B', 'C', 'A', 'D']
```

##### **slice()** - 提取子数组

**不修改原数组**，返回一个新的数组对象。

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 提取从索引2到索引5（不包含5）的元素
const sliced1 = numbers.slice(2, 5);
console.log(sliced1); // [3, 4, 5]

// 从索引3开始到末尾
const sliced2 = numbers.slice(3);
console.log(sliced2); // [4, 5, 6, 7, 8, 9, 10]

// 最后3个元素
const sliced3 = numbers.slice(-3);
console.log(sliced3); // [8, 9, 10]

// Vue3 实际应用场景：分页
const usePagination = (data, page, pageSize) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: data.slice(start, end),
    total: data.length,
    totalPages: Math.ceil(data.length / pageSize),
  };
};

const allUsers = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `用户${i + 1}`,
}));

const page1 = usePagination(allUsers, 1, 10);
console.log(page1.data.length); // 10 - 第1页10条数据
```

#### 1.1.5 排序与反转

##### **sort()** - 排序

**注意**：默认按字符串 Unicode 排序，会修改原数组。

```javascript
// 字符串排序（默认）
const fruits = ["Orange", "Apple", "Banana"];
fruits.sort();
console.log(fruits); // ['Apple', 'Banana', 'Orange']

// 数字排序（需要比较函数）
const numbers = [10, 2, 5, 1, 100];
numbers.sort((a, b) => a - b); // 升序
console.log(numbers); // [1, 2, 5, 10, 100]

numbers.sort((a, b) => b - a); // 降序
console.log(numbers); // [100, 10, 5, 2, 1]

// 对象数组排序
const users = [
  { name: "张三", age: 25 },
  { name: "李四", age: 30 },
  { name: "王五", age: 20 },
];

// 按年龄升序
users.sort((a, b) => a.age - b.age);
console.log(users); // [王五(20), 张三(25), 李四(30)]

// Vue3 实际应用场景：表格排序
const useTableSort = (data, sortBy, order = "asc") => {
  return [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (order === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

const products = [
  { name: "iPhone", price: 6999 },
  { name: "iPad", price: 3999 },
  { name: "MacBook", price: 12999 },
];

// 按价格升序
const sorted = useTableSort(products, "price", "asc");
console.log(sorted.map((p) => p.price)); // [3999, 6999, 12999]
```

##### **reverse()** - 反转

颠倒数组中元素的顺序。

```javascript
const arr = [1, 2, 3, 4, 5];
arr.reverse();
console.log(arr); // [5, 4, 3, 2, 1]

// Vue3 实际应用场景：消息列表（最新消息在上面）
const useMessageList = (messages) => {
  return messages.slice().reverse(); // 使用slice()创建副本
};
```

#### 1.1.6 数组方法实战案例

```javascript
// Vue3 完整案例：商品列表功能
const useProductList = (products) => {
  // 1. 搜索过滤
  const search = (keyword) => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // 2. 按分类筛选
  const filterByCategory = (category) => {
    return category === "全部"
      ? products
      : products.filter((p) => p.category === category);
  };

  // 3. 排序
  const sort = (field, order) => {
    return [...products].sort((a, b) => {
      return order === "asc" ? a[field] - b[field] : b[field] - a[field];
    });
  };

  // 4. 批量删除
  const batchDelete = (ids) => {
    const idsSet = new Set(ids);
    return products.filter((p) => !idsSet.has(p.id));
  };

  // 5. 批量更新状态
  const batchUpdateStatus = (ids, status) => {
    const idsSet = new Set(ids);
    return products.map((p) => (idsSet.has(p.id) ? { ...p, status } : p));
  };

  // 6. 计算统计数据
  const getStats = () => {
    return products.reduce(
      (acc, p) => {
        acc.total++; // 总商品数
        acc.totalValue += p.price; // 总价值
        if (p.inStock) acc.inStock++; // 有库存数量
        return acc;
      },
      { total: 0, totalValue: 0, inStock: 0 }
    );
  };

  return {
    search,
    filterByCategory,
    sort,
    batchDelete,
    batchUpdateStatus,
    getStats,
  };
};

// 使用示例
const products = [
  { id: 1, name: "iPhone", category: "手机", price: 6999, inStock: true },
  { id: 2, name: "iPad", category: "平板", price: 3999, inStock: true },
  { id: 3, name: "MacBook", category: "电脑", price: 12999, inStock: false },
];

const { search, filterByCategory, sort, getStats } = useProductList(products);

console.log(search("iphone")); // 搜索
console.log(filterByCategory("手机")); // 分类过滤
console.log(sort("price", "asc")); // 价格排序
console.log(getStats()); // 统计数据
```

---

### 1.2 JSON 与 XML 数据解析

前后端数据交互离不开数据格式的处理。JSON 和 XML 是两种最常用的数据格式。

#### 1.2.1 JSON 解析

##### **JSON.parse()** - JSON 字符串转对象

```javascript
// 基础用法
const jsonStr = '{"name":"张三","age":25,"city":"北京"}';
const obj = JSON.parse(jsonStr);
console.log(obj.name); // '张三'

// 解析数组
const jsonArrStr = "[1,2,3,4,5]";
const arr = JSON.parse(jsonArrStr);
console.log(arr); // [1, 2, 3, 4, 5]

// 带reviver函数（转换函数）
const data = JSON.parse(
  '{"id":1,"name":"张三","created_at":"2026-01-01"}',
  (key, value) => {
    if (key === "created_at") {
      return new Date(value);
    }
    return value;
  }
);
console.log(data.created_at instanceof Date); // true

// Vue3 实际应用场景1：解析API响应
const useFetchData = async (url) => {
  const response = await fetch(url);
  const jsonStr = await response.text();
  return JSON.parse(jsonStr);
};

// 使用示例
const users = await useFetchData("/api/users");

// Vue3 实际应用场景2：LocalStorage数据读取
const useLocalStorage = (key, defaultValue) => {
  const stored = localStorage.getItem(key);

  const data = stored ? JSON.parse(stored) : defaultValue;

  const setData = (value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  return { data, setData };
};

// 使用示例
const { data: userSettings, setData: saveSettings } = useLocalStorage(
  "user-settings",
  { theme: "light", language: "zh-CN" }
);

// Vue3 实际应用场景3：解析嵌套数据
const parseApiResponse = (response) => {
  const data = JSON.parse(response);

  return {
    code: data.code,
    message: data.message,
    result: {
      users: data.data.users.map((user) => ({
        id: user.user_id,
        name: user.username,
        email: user.email_address,
      })),
      total: data.data.total_count,
    },
  };
};
```

##### **JSON.stringify()** - 对象转 JSON 字符串

```javascript
// 基础用法
const obj = { name: "张三", age: 25, city: "北京" };
const jsonStr = JSON.stringify(obj);
console.log(jsonStr); // '{"name":"张三","age":25,"city":"北京"}'

// 格式化输出（美化JSON）
const beautifulJson = JSON.stringify(obj, null, 2);
console.log(beautifulJson);
// {
//   "name": "张三",
//   "age": 25,
//   "city": "北京"
// }

// 使用replacer函数（过滤或转换属性）
const user = {
  id: 1,
  name: "张三",
  password: "123456",
  email: "zhangsan@example.com",
};

// 不序列化password字段
const safeJson = JSON.stringify(user, (key, value) => {
  if (key === "password") {
    return undefined; // 这个字段不会被序列化
  }
  return value;
});
console.log(safeJson); // '{"id":1,"name":"张三","email":"zhangsan@example.com"}'

// Vue3 实际应用场景1：发送POST请求
const createUser = async (userData) => {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// 使用示例
await createUser({
  name: "张三",
  email: "zhangsan@example.com",
  age: 25,
});

// Vue3 实际应用场景2：持久化状态
const useStatePersist = (key, state) => {
  watch(
    () => state.value,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue));
    },
    { deep: true }
  );
};

// 使用示例
const userSettings = ref({ theme: "dark", language: "zh-CN" });
useStatePersist("settings", userSettings);

// Vue3 实际应用场景3：错误日志上报
const reportError = (error) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  fetch("/api/errors", {
    method: "POST",
    body: JSON.stringify(errorData),
  });
};
```

##### **常见 JSON 处理技巧**

```javascript
// 1. 深拷贝对象
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
const original = { a: 1, b: { c: 2 } };
const cloned = deepClone(original);

// ⚠️ 注意：不能拷贝函数、undefined、Symbol
const hasFunc = {
  name: "张三",
  sayHello() {
    console.log("Hello");
  },
  age: undefined,
};
console.log(JSON.parse(JSON.stringify(hasFunc)));
// { "name": "张三" }  // 函数和undefined丢失了

// 2. JSON字段重命名
const renameKeys = (obj, keysMap) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      return keysMap[key] || key;
    })
  );
};

const apiData = { user_name: "张三", user_age: 25 };
const renamed = renameKeys(apiData, {
  user_name: "name",
  user_age: "age",
});
console.log(renamed); // { name: '张三', age: 25 }

// 3. 处理JSON解析错误
const safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error("JSON解析失败:", error);
    return defaultValue;
  }
};

const invalidJson = "{invalid json}";
console.log(safeJsonParse(invalidJson, {})); // {} 而不是报错

// Vue3 实际应用：错误处理
const useApiData = async (url) => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return safeJsonParse(text, { error: "解析失败" });
  } catch (error) {
    return { error: error.message };
  }
};
```

#### 1.2.2 处理 API 响应数据

```javascript
// Vue3 Composable: 封装API请求
const useApi = () => {
  const loading = ref(false);
  const error = ref(null);
  const data = ref(null);

  const request = async (url, options = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      data.value = JSON.parse(text);

      return data.value;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const get = (url) => request(url, { method: "GET" });
  const post = (url, body) =>
    request(url, {
      method: "POST",
      body: JSON.stringify(body),
    });

  return { loading, error, data, get, post };
};

// 使用示例
const { loading, error, data, get } = useApi();

get("/api/users");
console.log(loading.value); // true
// ...等待响应...
console.log(data.value); // 解析后的数据
```

#### 1.2.3 XML 解析基础

虽然 JSON 更流行，但有些老系统或特定场景（如 RSS、SVG）仍然使用 XML。

```javascript
// 浏览器环境解析XML
const parseXml = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  return xmlDoc;
};

// 示例XML
const xmlString = `
<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user id="1">
    <name>张三</name>
    <email>zhangsan@example.com</email>
  </user>
  <user id="2">
    <name>李四</name>
    <email>lisi@example.com</email>
  </user>
</users>
`;

const xmlDoc = parseXml(xmlString);

// 获取所有user节点
const users = xmlDoc.getElementsByTagName("user");
console.log(users.length); // 2

// 获取第一个user的name
const firstName = users[0].getElementsByTagName("name")[0];
console.log(firstName.textContent); // '张三'

// Vue3 实际应用：解析RSS订阅
const useRssFeed = async (url) => {
  const response = await fetch(url);
  const xmlString = await response.text();
  const xmlDoc = parseXml(xmlString);

  const items = xmlDoc.getElementsByTagName("item");

  return Array.from(items).map((item) => ({
    title: item.getElementsByTagName("title")[0].textContent,
    link: item.getElementsByTagName("link")[0].textContent,
    pubDate: item.getElementsByTagName("pubDate")[0].textContent,
    description: item.getElementsByTagName("description")[0].textContent,
  }));
};

// 使用示例
const articles = await useRssFeed("https://example.com/rss");
console.log(articles); // 文章列表
```

#### 1.2.4 数据格式转换实战

```javascript
// Vue3 Composable: 数据转换工具集
const useDataTransform = () => {
  // 1. XML转JSON
  const xmlToJson = (xml) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");

    const nodeToObj = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue;
      }

      const obj = {};
      if (node.attributes) {
        for (const attr of node.attributes) {
          obj["@" + attr.name] = attr.value;
        }
      }

      if (node.childNodes) {
        for (const child of node.childNodes) {
          const childObj = nodeToObj(child);
          if (childObj) {
            obj[child.nodeName] = childObj;
          }
        }
      }

      return Object.keys(obj).length ? obj : null;
    };

    return nodeToObj(xmlDoc.documentElement);
  };

  // 2. URL参数转对象
  const urlParamsToObj = (url) => {
    const params = new URLSearchParams(url.split("?")[1]);
    const obj = {};
    for (const [key, value] of params) {
      obj[key] = value;
    }
    return obj;
  };

  // 3. 表单数据转JSON
  const formDataToJson = (formData) => {
    const obj = {};
    for (const [key, value] of formData.entries()) {
      obj[key] = value;
    }
    return obj;
  };

  // 4. CSV转JSON
  const csvToJson = (csv) => {
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",");

    return lines.slice(1).map((line) => {
      const values = line.split(",");
      return headers.reduce((obj, header, i) => {
        obj[header.trim()] = values[i]?.trim();
        return obj;
      }, {});
    });
  };

  return {
    xmlToJson,
    urlParamsToObj,
    formDataToJson,
    csvToJson,
  };
};

// 使用示例
const { csvToJson } = useDataTransform();

const csvData = `name,age,city
张三,25,北京
李四,30,上海`;

const users = csvToJson(csvData);
console.log(users);
// [
//   { name: '张三', age: '25', city: '北京' },
//   { name: '李四', age: '30', city: '上海' }
// ]
```

---

### 1.3 解构赋值完全指南

解构赋值是 ES6 最常用的特性之一，可以从数组或对象中快速提取值。

#### 1.3.1 对象解构

##### **基础解构**

```javascript
// 基础用法
const user = {
  id: 1,
  name: "张三",
  age: 25,
  email: "zhangsan@example.com",
};

const { name, age } = user;
console.log(name); // '张三'
console.log(age); // 25

// 解构并重命名
const { name: userName, age: userAge } = user;
console.log(userName); // '张三'
console.log(userAge); // 25

// Vue3 实际应用场景1：解构props
const props = defineProps({
  title: String,
  user: Object,
});

const { title, user } = toRefs(props);

// Vue3 实际应用场景2：解构路由参数
const route = useRoute();
const { id, category } = route.params;
const { keyword, page } = route.query;
```

##### **默认值**

```javascript
const user = {
  name: "张三",
};

// 设置默认值
const { name, age = 18, city = "北京" } = user;
console.log(name); // '张三'
console.log(age); // 18  // 默认值
console.log(city); // '北京'  // 默认值

// 函数参数默认值
const createUser = ({ name, age = 18, role = "user" }) => {
  return { name, age, role };
};

console.log(createUser({ name: "张三" }));
// { name: '张三', age: 18, role: 'user' }
```

##### **嵌套解构**

```javascript
const user = {
  id: 1,
  name: "张三",
  address: {
    city: "北京",
    district: "朝阳区",
    detail: {
      street: "三里屯",
      number: 1,
    },
  },
};

// 嵌套解构
const {
  name,
  address: { city, district },
} = user;

console.log(name); // '张三'
console.log(city); // '北京'
console.log(district); // '朝阳区'

// 深度嵌套
const {
  address: {
    detail: { street },
  },
} = user;
console.log(street); // '三里屯'

// Vue3 实际应用：解构嵌套的响应式对象
const state = reactive({
  user: {
    profile: {
      name: "张三",
      avatar: "/avatar.png",
    },
    settings: {
      theme: "dark",
    },
  },
});

const {
  user: {
    profile: { name, avatar },
    settings: { theme },
  },
} = state;
```

#### 1.3.2 数组解构

##### **基础解构**

```javascript
// 基础用法
const colors = ["red", "green", "blue", "yellow"];
const [first, second, third] = colors;
console.log(first); // 'red'
console.log(second); // 'green'
console.log(third); // 'blue'

// 跳过某些元素
const [color1, , color3] = colors;
console.log(color1); // 'red'
console.log(color3); // 'blue'

// 只取前几个
const [a, b] = colors;
console.log(a); // 'red'
console.log(b); // 'green'
```

##### **剩余元素**

```javascript
const numbers = [1, 2, 3, 4, 5];

// 第一个赋值给first，剩余的赋值给rest
const [first, ...rest] = numbers;
console.log(first); // 1
console.log(rest); // [2, 3, 4, 5]

// Vue3 实际应用：列表操作
const [activeItem, ...otherItems] = items;

// 交换变量
let x = 1;
let y = ((2)[(x, y)] = [y, x]);
console.log(x); // 2
console.log(y); // 1
```

##### **默认值**

```javascript
const numbers = [1];

const [a, b = 2, c = 3] = numbers;
console.log(a); // 1
console.log(b); // 2  // 默认值
console.log(c); // 3  // 默认值
```

#### 1.3.3 函数参数解构

```javascript
// 对象参数解构
const createUser = ({ name, age, email }) => {
  console.log(name, age, email);
};

createUser({
  name: "张三",
  age: 25,
  email: "zhangsan@example.com",
});

// 带默认值的参数解构
const register = ({
  username,
  password,
  role = "user",
  avatar = "/default-avatar.png",
}) => {
  return { username, password, role, avatar };
};

register({ username: "zhangsan", password: "123456" });
// { username: 'zhangsan', password: '123456', role: 'user', avatar: '/default-avatar.png' }

// Vue3 实际应用：Composable参数
const useFetch = ({ url, method = "GET", headers = {}, body = null }) => {
  // 实现fetch逻辑
  return { data, loading, error };
};

// 使用示例
const { data } = useFetch({
  url: "/api/users",
  method: "POST",
  body: { name: "张三" },
});

// 数组参数解构
const sum = ([a, b, c]) => a + b + c;
console.log(sum([1, 2, 3])); // 6

// Vue3 实际应用：useState钩子
const useState = (initialValue) => {
  const state = ref(initialValue);

  const setState = (newValue) => {
    state.value = newValue;
  };

  return [state, setState]; // 返回数组
};

const [count, setCount] = useState(0);
```

#### 1.3.4 解构实际应用场景

```javascript
// 场景1：解构API响应
const handleApiResponse = ({ code, data: { users, total }, message }) => {
  if (code === 200) {
    console.log(`共有${total}个用户`);
    return users;
  }
  console.error(message);
};

handleApiResponse({
  code: 200,
  data: { users: [{ name: "张三" }], total: 100 },
  message: "success",
});

// 场景2：解构组件Props
const Button = ({
  type = "default",
  size = "medium",
  disabled = false,
  onClick,
}) => {
  return h("button", {
    type,
    class: [`btn-${type}`, `btn-${size}`],
    disabled,
    onClick,
  });
};

// 场景3：解构Pinia Store
const store = useUserStore();
const { userInfo, isLoggedIn, login, logout } = store;

// 场景4：解构useRouter和useRoute
const router = useRouter();
const route = useRoute();
const { push, replace, go } = router;
const { params, query, meta } = route;

// 场景5：解构返回值
const useCounter = () => {
  const count = ref(0);
  const increment = () => count.value++;
  const decrement = () => count.value--;
  const reset = () => (count.value = 0);

  return { count, increment, decrement, reset };
};

const { count, increment, decrement } = useCounter();

// 场景6：解构工具函数
const { format, parse, isValid } = require("date-fns");

const dateStr = format(new Date(), "yyyy-MM-dd");
const date = parse(dateStr, "yyyy-MM-dd", new Date());
```

---

### 1.4 扩展运算符与剩余参数

扩展运算符（`...`）是 ES6 最强大的特性之一，可以在多种场景中使用。

#### 1.4.1 对象展开运算符

##### **对象合并**

```javascript
// 基础用法：合并对象
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 };
console.log(merged); // { a: 1, b: 2, c: 3, d: 4 }

// 相同属性后者覆盖前者
const obj3 = { a: 10, b: 20 };
const obj4 = { b: 30, c: 40 };
const result = { ...obj3, ...obj4 };
console.log(result); // { a: 10, b: 30, c: 40 }

// Vue3 实际应用场景1：更新状态
const state = reactive({
  name: "张三",
  age: 25,
  city: "北京",
});

const updateState = (updates) => {
  Object.assign(state, updates);
  // 或者
  Object.assign(state, { ...state, ...updates });
};

updateState({ age: 26, city: "上海" });
console.log(state); // { name: '张三', age: 26, city: '上海' }

// Vue3 实际应用场景2：组件Props默认值
const defaultProps = {
  type: "button",
  size: "medium",
  disabled: false,
};

const Button = (props) => {
  const mergedProps = { ...defaultProps, ...props };
  // 使用mergedProps
};
```

##### **创建对象副本**

```javascript
// 浅拷贝对象
const original = { a: 1, b: 2, c: 3 };
const copy = { ...original };

console.log(copy); // { a: 1, b: 2, c: 3 }
console.log(copy === original); // false  // 是不同对象

// ⚠️ 注意：只是浅拷贝
const deepObj = {
  a: 1,
  nested: { b: 2 },
};
const shallowCopy = { ...deepObj };
shallowCopy.nested.b = 999;
console.log(deepObj.nested.b); // 999  // 原对象也被修改了！

// 深拷贝需要用其他方法
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
```

##### **添加属性**

```javascript
const user = { id: 1, name: "张三" };

// 添加新属性
const userWithEmail = { ...user, email: "zhangsan@example.com" };
console.log(userWithEmail); // { id: 1, name: '张三', email: 'zhangsan@example.com' }

// 条件添加属性
const isAdmin = true;
const adminUser = {
  ...user,
  ...(isAdmin ? { role: "admin" } : {}),
};
console.log(adminUser); // { id: 1, name: '张三', role: 'admin' }

// Vue3 实际应用：动态添加类名
const buttonClass = computed(() => {
  return {
    btn: true,
    "btn-primary": props.type === "primary",
    "btn-large": props.size === "large",
    "btn-disabled": props.disabled,
  };
});
```

#### 1.4.2 数组展开运算符

##### **数组合并**

```javascript
// 合并数组
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const merged = [...arr1, ...arr2];
console.log(merged); // [1, 2, 3, 4, 5, 6]

// 在任意位置插入
const parts = ["shoulders", "knees"];
const lyrics = ["head", ...parts, "and", "toes"];
console.log(lyrics); // ['head', 'shoulders', 'knees', 'and', 'toes']

// Vue3 实际应用：合并多个列表
const allUsers = [...activeUsers, ...inactiveUsers];
```

##### **数组复制**

```javascript
// 复制数组
const original = [1, 2, 3];
const copy = [...original];

console.log(copy); // [1, 2, 3]
console.log(copy === original); // false  // 不同数组

// Vue3 实际应用：避免直接修改props
const TodoList = {
  props: ["items"],
  setup(props) {
    // 创建副本，避免修改props
    const localItems = ref([...props.items]);

    const addItem = (item) => {
      localItems.value.push(item);
    };

    return { localItems, addItem };
  },
};
```

##### **数组转参数**

```javascript
// 将数组展开为函数参数
const numbers = [1, 2, 3, 4, 5];

// Math.max不接受数组，但可以使用展开运算符
const max = Math.max(...numbers);
console.log(max); // 5

const min = Math.min(...numbers);
console.log(min); // 1

// Vue3 实际应用：批量操作
const updateMultiple = (ids, ...values) => {
  // ids = [1, 2, 3]
  // values = [4, 5, 6]
};

updateMultiple([1, 2, 3], 4, 5, 6);
```

#### 1.4.3 剩余参数（Rest Parameters）

收集多个参数到一个数组中。

```javascript
// 函数定义中的剩余参数
const sum = (...numbers) => {
  return numbers.reduce((acc, num) => acc + num, 0);
};

console.log(sum(1, 2, 3)); // 6
console.log(sum(1, 2, 3, 4, 5)); // 15

// Vue3 实际应用：事件处理器
const handleClick = (...args) => {
  console.log(args); // [event, additionalArg1, additionalArg2]
};

// 剩余参数与其他参数结合
const createUser = (id, ...details) => {
  return {
    id,
    details: {
      name: details[0],
      age: details[1],
      ...details[2],
    },
  };
};

console.log(createUser(1, "张三", 25, { city: "北京" }));
// { id: 1, details: { name: '张三', age: 25, city: '北京' } }
```

#### 1.4.4 实际应用场景

```javascript
// 场景1：状态更新（Immutable模式）
const state = {
  users: [{ id: 1, name: "张三" }],
  loading: false,
  error: null,
};

// 更新单个用户（不修改原对象）
const updatedState = {
  ...state,
  users: state.users.map((user) =>
    user.id === 1 ? { ...user, name: "李四" } : user
  ),
};

// 场景2：数组操作
const todos = [
  { id: 1, text: "学习Vue3", done: false },
  { id: 2, text: "写代码", done: false },
];

// 添加新项
const newTodos = [...todos, { id: 3, text: "完成项目", done: false }];

// 更新某一项
const updatedTodos = todos.map((todo) =>
  todo.id === 1 ? { ...todo, done: true } : todo
);

// 删除某一项
const filteredTodos = todos.filter((todo) => todo.id !== 2);

// 场景3：函数参数处理
const useRequest = (url, options = {}) => {
  const defaultOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };
  // 使用mergedOptions发起请求
};

useRequest("/api/users", {
  method: "POST",
  body: JSON.stringify({ name: "张三" }),
});

// 场景4：动态类名
const buttonProps = {
  type: "primary",
  size: "large",
  disabled: false,
};

const buttonClass = {
  btn: true,
  [`btn-${buttonProps.type}`]: true,
  [`btn-${buttonProps.size}`]: true,
  "btn-disabled": buttonProps.disabled,
};

// 场景5：解构赋值结合剩余属性
const user = {
  id: 1,
  name: "张三",
  age: 25,
  email: "zhangsan@example.com",
  city: "北京",
};

const { name, ...rest } = user;
console.log(name); // '张三'
console.log(rest); // { id: 1, age: 25, email: 'zhangsan@example.com', city: '北京' }

// Vue3 组件中传递剩余属性
const Input = ({ modelValue, ...restProps }) => {
  return h("input", {
    value: modelValue,
    ...restProps, // 传递所有其他props
  });
};
```

---

### 1.5 现代 JS 语法特性

#### 1.5.1 可选链（Optional Chaining `?.`）

可选链运算符 `?.` 可以安全地访问嵌套对象属性，避免 `Cannot read property` 错误。

```javascript
// 基础用法
const user = {
  profile: {
    name: "张三",
    // address 属性不存在
  },
};

// 传统写法（会报错）
// const city = user.profile.address.city  // TypeError: Cannot read property 'city' of undefined

// 使用可选链（不会报错，返回undefined）
const city = user.profile?.address?.city;
console.log(city); // undefined

// Vue3 实际应用场景1：访问可能为null的数据
const UserCard = {
  setup() {
    const user = ref(null); // 可能从API获取，初始为null

    const displayName = computed(() => {
      return user.value?.profile?.name || "匿名用户";
    });

    return { displayName };
  },
};

// Vue3 实际应用场景2：安全调用方法
const result = data?.items?.filter((item) => item.active);
// 如果data是null或undefined，不会调用filter，直接返回undefined

// Vue3 实际应用场景3：访问数组元素
const users = [{ name: "张三" }, null, { name: "李四" }];
const firstName = users[0]?.name; // '张三'
const secondName = users[1]?.name; // undefined（不会报错）
const thirdName = users[2]?.name; // '李四'

// 可选链与函数调用
const admin = {
  permissions: {
    canEdit: true,
  },
};

// 如果方法存在则调用
admin.permissions?.canEdit?.();
```

#### 1.5.2 空值合并（Nullish Coalescing `??`）

空值合并运算符 `??` 只有当左侧是 `null` 或 `undefined` 时才返回右侧值。

```javascript
// 基础用法
const foo = null ?? "default";
console.log(foo); // 'default'

const bar = undefined ?? "default";
console.log(bar); // 'default'

const baz = 0 ?? "default";
console.log(baz); // 0（不是null或undefined，所以不使用默认值）

const qux = "" ?? "default";
console.log(qux); // ''（空字符串也不是null或undefined）

const quux = false ?? "default";
console.log(quux); // false（false也不是null或undefined）

// 与 || 的区别
const value1 = 0 || "default"; // 'default'（0是falsy）
const value2 = 0 ?? "default"; // 0（0不是nullish）

const value3 = "" || "default"; // 'default'（空字符串是falsy）
const value4 = "" ?? "default"; // ''（空字符串不是nullish）

// Vue3 实际应用场景1：提供默认值
const useUserSettings = () => {
  const settings = ref(null);

  // 加载设置
  const loadSettings = async () => {
    const response = await fetch("/api/settings");
    const data = await response.json();

    // 只在data为null/undefined时使用默认值
    settings.value = data.theme ?? "light";
  };

  return { settings };
};

// Vue3 实际应用场景2：配置项默认值
const createTable = (options) => {
  const config = {
    columns: options.columns ?? [],
    pageSize: options.pageSize ?? 10,
    showHeader: options.showHeader ?? true,
    striped: options.striped ?? false,
  };

  // 使用config创建表格
};

createTable({ columns: ["name", "age"] });
// config = { columns: ['name', 'age'], pageSize: 10, showHeader: true, striped: false }

// 组合使用可选链和空值合并
const user = {
  profile: null,
};

const name = user.profile?.name ?? "匿名用户";
console.log(name); // '匿名用户'

// Vue3 实际应用：处理API响应
const useApiData = (response) => {
  return {
    users: response?.data?.users ?? [],
    total: response?.data?.total ?? 0,
    page: response?.data?.page ?? 1,
  };
};
```

#### 1.5.3 模板字符串

模板字符串使用反引号 `` ` ``，可以包含表达式和多行文本。

```javascript
// 基础用法
const name = "张三";
const age = 25;
const message = `我是${name}，今年${age}岁`;
console.log(message); // '我是张三，今年25岁'

// 多行字符串
const html = `
  <div class="user-card">
    <h2>${name}</h2>
    <p>年龄：${age}</p>
  </div>
`;

// 表达式计算
const a = 10;
const b = 20;
const sum = `${a} + ${b} = ${a + b}`;
console.log(sum); // '10 + 20 = 30'

// Vue3 实际应用场景1：动态类名
const Button = {
  props: ["type", "size"],
  setup(props) {
    const buttonClass = computed(() => {
      return `btn btn-${props.type} btn-${props.size}`;
    });

    return { buttonClass };
  },
  template: `<button :class="buttonClass">点击</button>`,
};

// Vue3 实际应用场景2：动态URL
const useImageUrl = (filename, size = "large") => {
  return `https://example.com/images/${size}/${filename}`;
};

console.log(useImageUrl("avatar.png", "thumb"));
// 'https://example.com/images/thumb/avatar.png'

// Vue3 实际应用场景3：动态样式
const useBoxStyle = (width, height, color) => {
  return `
    width: ${width}px;
    height: ${height}px;
    background-color: ${color};
  `;
};

// 标签模板（Tagged Templates）
const highlight = (strings, ...values) => {
  return strings.reduce((result, string, i) => {
    return result + string + (values[i] ? `<strong>${values[i]}</strong>` : "");
  }, "");
};

const name2 = "张三";
const highlighted = highlight`你好，${name2}！`;
console.log(highlighted); // '你好，<strong>张三</strong>！'
```

#### 1.5.4 箭头函数

箭头函数提供更简洁的函数语法，并且不绑定自己的 `this`。

```javascript
// 基础语法
const add = (a, b) => a + b;
console.log(add(1, 2)); // 3

// 多行函数体
const multiply = (a, b) => {
  const result = a * b;
  return result;
};

// 单个参数可以省略括号
const double = (n) => n * 2;
console.log(double(5)); // 10

// 无参数需要括号
const getRandom = () => Math.random();
console.log(getRandom());

// 返回对象字面量需要括号
const createUser = (name) => ({ name, id: Date.now() });
console.log(createUser("张三")); // { name: '张三', id: 1234567890 }

// Vue3 实际应用场景1：回调函数
users.filter((user) => user.age > 18);
users.map((user) => user.name);
users.find((user) => user.id === 1);

// Vue3 实际应用场景2：数组方法链式调用
const result = users
  .filter((user) => user.age >= 18)
  .map((user) => user.name)
  .sort();

// Vue3 实际应用场景3：事件处理器
const Button = {
  setup() {
    const handleClick = (event) => {
      console.log("Button clicked!", event);
    };

    return { handleClick };
  },
  template: `<button @click="handleClick">点击我</button>`,
};

// Vue3 实际应用场景4：Promise链
fetch("/api/users")
  .then((response) => response.json())
  .then((users) => users.filter((user) => user.active))
  .then((activeUsers) => console.log(activeUsers))
  .catch((error) => console.error(error));

// Vue3 实际应用场景5：Composable返回函数
const useCounter = (initialValue = 0) => {
  const count = ref(initialValue);

  const increment = () => count.value++;
  const decrement = () => count.value--;
  const reset = () => (count.value = initialValue);

  return { count, increment, decrement, reset };
};

// ⚠️ 注意：箭头函数不适合作为Vue方法（因为this问题）
// 错误示例：
const Component = {
  data() {
    return { count: 0 };
  },
  methods: {
    // ❌ 错误：箭头函数不绑定this
    increment: () => {
      this.count++; // this不是Vue实例
    },

    // ✅ 正确：使用普通函数
    decrement: function () {
      this.count++;
    },
  },
};
```

---

### 1.6 本章小结与最佳实践

#### 1.6.1 数组方法选择指南

```javascript
// 根据需求选择合适的数组方法
const data = [1, 2, 3, 4, 5];

// 需求1：遍历但不返回新数组 → forEach
data.forEach((item) => console.log(item));

// 需求2：转换数组，返回新数组 → map
const doubled = data.map((item) => item * 2);

// 需求3：过滤数组，返回新数组 → filter
const evens = data.filter((item) => item % 2 === 0);

// 需求4：查找单个元素 → find
const found = data.find((item) => item > 2);

// 需求5：检查是否有满足条件的元素 → some
const hasLarge = data.some((item) => item > 3);

// 需求6：检查是否所有元素都满足条件 → every
const allPositive = data.every((item) => item > 0);

// 需求7：累加为单个值 → reduce
const sum = data.reduce((acc, item) => acc + item, 0);
```

#### 1.6.2 性能优化建议

```javascript
// 1. 避免在循环中修改数组长度
// ❌ 错误
for (let i = 0; i < arr.length; i++) {
  if (arr[i] % 2 === 0) {
    arr.splice(i, 1); // 修改了数组长度
  }
}

// ✅ 正确：使用filter创建新数组
const filtered = arr.filter((item) => item % 2 !== 0);

// 2. 大数组使用for循环而不是forEach
const largeArray = new Array(1000000);

// ❌ 较慢
largeArray.forEach((item) => {
  // 处理
});

// ✅ 更快
for (let i = 0; i < largeArray.length; i++) {
  // 处理
}

// 3. 链式调用时考虑性能
// ❌ 多次遍历
const result = arr
  .filter((x) => x > 0)
  .map((x) => x * 2)
  .filter((x) => x < 100);

// ✅ 一次遍历完成
const result = arr.reduce((acc, x) => {
  if (x > 0 && x * 2 < 100) {
    acc.push(x * 2);
  }
  return acc;
}, []);
```

#### 1.6.3 Vue3 开发最佳实践

```javascript
// 1. 使用扩展运算符保持响应式
const state = reactive({ count: 0 });

// ✅ 创建新对象保持响应式
state.count = { ...state, count: state.count + 1 };

// 2. 解构时使用toRefs保持响应式
const { count } = toRefs(state);

// 3. 使用可选链避免错误
const displayName = user?.profile?.name ?? "匿名用户";

// 4. 使用空值合并提供默认值
const pageSize = options?.pageSize ?? 10;

// 5. 模板字符串保持可读性
const url = `/api/users?page=${page}&size=${size}`;

// 6. 箭头函数用于短函数和回调
items.filter((item) => item.active);
```

#### 1.6.4 常见错误与解决方案

| 错误                                      | 原因                        | 解决方案                           |
| ----------------------------------------- | --------------------------- | ---------------------------------- |
| `Cannot read property 'xxx' of undefined` | 访问不存在的嵌套属性        | 使用可选链 `?.`                    |
| `xxx is not a function`                   | 解构时方法丢失              | 使用 `toRefs()` 保持响应式         |
| 数组修改不触发视图更新                    | 直接用索引修改              | 使用 `splice()` 或创建新数组       |
| `Unexpected token`                        | 解析 JSON 失败              | 使用 `try-catch` 包装 `JSON.parse` |
| 对象深拷贝丢失函数                        | `JSON.stringify` 不支持函数 | 使用 `lodash.cloneDeep`            |

---
