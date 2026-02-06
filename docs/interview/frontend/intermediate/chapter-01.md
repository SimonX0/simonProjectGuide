---
title: JavaScript基础面试题
---

# JavaScript基础面试题

## 数据类型

### JavaScript有哪些数据类型？

JavaScript有7种原始数据类型和1种引用类型：

**原始数据类型**：
- `string` - 字符串
- `number` - 数字
- `boolean` - 布尔值
- `undefined` - 未定义
- `null` - 空值
- `symbol` - 符号（ES6）
- `bigint` - 大整数（ES2020）

**引用类型**：
- `object` - 对象（包括数组、函数、日期等）

### null和undefined有什么区别？

- `undefined`：变量已声明但未赋值，或对象属性不存在
- `null`：表示"空"或"无"的值，是显式赋值的

```javascript
let a;           // undefined
let b = null;    // null
typeof a;        // "undefined"
typeof b;        // "object" (这是JavaScript的历史bug)

// 判断方法
a === undefined; // true
b === null;      // true
```

### 如何判断一个变量的类型？

- `typeof`：判断原始类型（注意null返回"object"）
- `instanceof`：判断对象的具体类型
- `Object.prototype.toString.call()`：最准确的判断方法

```javascript
// typeof
typeof 42;              // "number"
typeof "hello";         // "string"
typeof true;            // "boolean"
typeof undefined;       // "undefined"
typeof null;            // "object" (注意)
typeof {};              // "object"
typeof [];              // "object"
typeof function(){};    // "function"

// instanceof
[] instanceof Array;    // true
{} instanceof Object;   // true

// 最准确的判断
Object.prototype.toString.call([]);        // "[object Array]"
Object.prototype.toString.call({});        // "[object Object]"
Object.prototype.toString.call(null);      // "[object Null]"
Object.prototype.toString.call(undefined); // "[object Undefined]"
```

## 闭包与作用域

### 什么是闭包？闭包的应用场景有哪些？

闭包是指函数能够访问其词法作用域外的变量，即使函数在其词法作用域外执行。

```javascript
function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  };
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
```

**应用场景**：
1. **数据私有化**：创建私有变量
2. **函数柯里化**：固定部分参数
3. **模块化**：避免全局污染
4. **状态保持**：在异步操作中保持状态

### let、const和var的区别？

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是（TDZ） | 是（TDZ） | 是（TDZ） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 暂时性死区 | 无 | 有 | 有 |

```javascript
// var - 函数作用域
function test() {
  if (true) {
    var a = 1;
  }
  console.log(a); // 1
}

// let/const - 块级作用域
function test() {
  if (true) {
    let b = 1;
  }
  console.log(b); // ReferenceError
}
```

## this与执行上下文

### this指向问题？

this的指向取决于函数的调用方式：

1. **普通函数调用**：指向全局对象（严格模式下为undefined）
2. **对象方法调用**：指向调用该方法的
3. **构造函数调用**：指向新创建的实例
4. **箭头函数**：继承外层作用域的this
5. **call/apply/bind**：显式指定this

```javascript
const obj = {
  name: 'Alice',
  sayName() {
    console.log(this.name); // this指向obj
  },
  sayNameArrow: () => {
    console.log(this.name); // this继承外层
  }
};

obj.sayName();        // 'Alice'
obj.sayNameArrow();   // undefined（取决于外层this）

const fn = obj.sayName;
fn();                 // undefined（非严格模式）或报错（严格模式）
```

### call、apply和bind的区别？

都是改变this指向的方法：

- `call`：立即执行函数，参数逐个传递
- `apply`：立即执行函数，参数为数组
- `bind`：返回新函数，不立即执行

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: 'Bob' };

// call - 参数逐个传递
greet.call(person, 'Hello', '!'); // "Hello, Bob!"

// apply - 参数为数组
greet.apply(person, ['Hi', '.']); // "Hi, Bob."

// bind - 返回新函数
const boundGreet = greet.bind(person, 'Hey');
boundGreet('~'); // "Hey, Bob~"
```

## 原型与继承

### 什么是原型链？

每个对象都有一个`__proto__`属性指向其原型对象，原型对象也有自己的原型，这样层层向上直到Object.prototype，形成原型链。

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

const alice = new Person('Alice');

// 原型链
alice.__proto__ === Person.prototype;             // true
alice.__proto__.__proto__ === Object.prototype;  // true
alice.__proto__.__proto__.__proto__ === null;    // true

// 属性查找
alice.sayHello();  // 先在alice上找，找不到就去Person.prototype上找
alice.toString();  // 一路找到Object.prototype
```

### 如何实现继承？

**ES6之前**：

```javascript
// 借用构造函数
function Child(name) {
  Parent.call(this, name);
}

// 组合继承（原型链+借用构造函数）
function Child(name) {
  Parent.call(this, name);
}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
```

**ES6 class**：

```javascript
class Parent {
  constructor(name) {
    this.name = name;
  }
  sayHello() {
    console.log(`Hello, ${this.name}`);
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name);
    this.age = age;
  }
}
```

## 异步编程

### Promise有哪些状态？

Promise有三种状态：
1. **pending**：进行中
2. **fulfilled**：已成功
3. **rejected**：已失败

状态只能从pending转变为fulfilled或rejected，一旦改变就不可逆。

### async/await的原理？

async/await是Promise的语法糖，基于生成器（Generator）实现：

```javascript
// async/await写法
async function fetchData() {
  try {
    const data = await fetch(url);
    return data.json();
  } catch (error) {
    console.error(error);
  }
}

// 等价于Promise写法
function fetchData() {
  return fetch(url)
    .then(response => response.json())
    .catch(error => console.error(error));
}
```

### 如何实现一个Promise？

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolve(x);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolve(x);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });

    return promise2;
  }
}
```

## 事件循环

### 什么是事件循环？

JavaScript是单线程的，通过事件循环（Event Loop）实现异步执行：

1. **执行栈**：同步代码在这里执行
2. **任务队列**：
   - **宏任务**：setTimeout、setInterval、I/O
   - **微任务**：Promise.then、MutationObserver、queueMicrotask

执行顺序：
1. 执行同步代码
2. 执行所有微任务
3. 执行一个宏任务
4. 重复2-3

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// 输出：1 4 3 2
```

### 宏任务和微任务的区别？

| 类型 | API | 执行时机 |
|------|-----|---------|
| 宏任务 | setTimeout、setInterval、I/O、UI渲染 | 每次循环取一个 |
| 微任务 | Promise.then、MutationObserver、queueMicrotask | 每次循环全部执行 |

### 手写实现call、apply、bind？（字节、阿里必问）

```javascript
// call实现
Function.prototype.myCall = function(context, ...args) {
  context = context || window;
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;

  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};

// apply实现
Function.prototype.myApply = function(context, args) {
  context = context || window;
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;

  const result = context[fnSymbol](...(args || []));
  delete context[fnSymbol];
  return result;
};

// bind实现
Function.prototype.myBind = function(context, ...args) {
  const self = this;

  function FBound() {
    // 判断是否作为构造函数调用
    return self.apply(
      this instanceof FBound ? this : context,
      args.concat([...arguments])
    );
  }

  // 维持原型链
  FBound.prototype = Object.create(this.prototype);
  return FBound;
};
```

### 深拷贝和浅拷贝的区别？如何实现深拷贝？（腾讯高频）

```javascript
// 浅拷贝
const shallowCopy = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  const newObj = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};

// 深拷贝 - 简化版（不能处理循环引用）
const deepClone = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  const newObj = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key];
    }
  }
  return newObj;
};

// 深拷贝 - 完整版（处理循环引用、Date、RegExp等）
const deepCloneComplete = (obj, map = new WeakMap()) => {
  // 基本类型
  if (obj === null || typeof obj !== 'object') return obj;

  // Date
  if (obj instanceof Date) return new Date(obj);

  // RegExp
  if (obj instanceof RegExp) return new RegExp(obj);

  // 处理循环引用
  if (map.has(obj)) return map.get(obj);

  const newObj = Array.isArray(obj) ? [] : {};
  map.set(obj, newObj);

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepCloneComplete(obj[key], map);
    }
  }
  return newObj;
};

// 使用structuredClone（浏览器原生）
const cloned = structuredClone(obj);
```

### 防抖和节流的区别？手写实现？（美团、滴滴必问）

```javascript
// 防抖：延迟执行，重复触发会重新计时
function debounce(fn, delay) {
  let timer = null;

  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 节流：固定时间执行一次
function throttle(fn, delay) {
  let lastTime = 0;

  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// 节流 - 定时器版本（首次延迟执行）
function throttleTimer(fn, delay) {
  let timer = null;

  return function(...args) {
    if (timer) return;

    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

// 使用场景
// 防抖：搜索框输入、窗口resize
// 节流：滚动事件、鼠标移动
```

### 数组的常用方法及区别？（百度、字节高频）

```javascript
// 改变原数组
// push - 末尾添加
arr.push(4); // 返回新长度

// pop - 末尾删除
arr.pop(); // 返回删除的元素

// unshift - 开头添加
arr.unshift(0); // 返回新长度

// shift - 开头删除
arr.shift(); // 返回删除的元素

// splice - 删除/插入/替换
arr.splice(2, 1, 'new'); // 从索引2开始，删除1个，插入'new'

// sort - 排序
arr.sort((a, b) => a - b);

// reverse - 反转
arr.reverse();

// 不改变原数组
// concat - 合并数组
const newArr = arr.concat([4, 5]);

// slice - 截取
const sliced = arr.slice(1, 3); // [1, 3) 不包含3

// map - 映射
const mapped = arr.map(x => x * 2);

// filter - 过滤
const filtered = arr.filter(x => x > 2);

// reduce - 归约
const sum = arr.reduce((acc, cur) => acc + cur, 0);

// find - 查找第一个符合条件的
const found = arr.find(x => x > 2);

// findIndex - 查找索引
const index = arr.findIndex(x => x > 2);

// some - 是否有符合条件的
const has = arr.some(x => x > 2);

// every - 是否都符合
const all = arr.every(x => x > 0);

// includes - 是否包含
const contain = arr.includes(2);

// indexOf - 查找索引
const idx = arr.indexOf(2);

// join - 转字符串
const str = arr.join(',');

// flat - 扁平化
const flattened = [1, [2, [3]]].flat(2);
```

### 手写实现数组去重？（7种方法）

```javascript
// 1. Set（最常用）
const unique1 = (arr) => [...new Set(arr)];

// 2. filter + indexOf
const unique2 = (arr) => arr.filter((item, index) => arr.indexOf(item) === index);

// 3. reduce
const unique3 = (arr) => arr.reduce((acc, cur) => {
  return acc.includes(cur) ? acc : [...acc, cur];
}, []);

// 4. Map
const unique4 = (arr) => {
  const map = new Map();
  return arr.filter(item => !map.has(item) && map.set(item, 1));
};

// 5. 对象属性（字符串）
const unique5 = (arr) => {
  const obj = {};
  return arr.filter(item => !obj[item] && (obj[item] = 1));
};

// 6. 排序后相邻比较
const unique6 = (arr) => {
  arr = arr.sort();
  const result = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i - 1]) {
      result.push(arr[i]);
    }
  }
  return result;
};

// 7. 双重循环（最原始）
const unique7 = (arr) => {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    let flag = true;
    for (let j = 0; j < result.length; j++) {
      if (arr[i] === result[j]) {
        flag = false;
        break;
      }
    }
    if (flag) result.push(arr[i]);
  }
  return result;
};
```

### 手写实现数组扁平化？（5种方法）

```javascript
const arr = [1, [2, [3, [4, 5]]]];

// 1. flat（ES2019）
const flat1 = arr.flat(Infinity);

// 2. 递归
const flat2 = (arr) => {
  const result = [];
  arr.forEach(item => {
    if (Array.isArray(item)) {
      result.push(...flat2(item));
    } else {
      result.push(item);
    }
  });
  return result;
};

// 3. reduce
const flat3 = (arr) => arr.reduce((acc, cur) =>
  acc.concat(Array.isArray(cur) ? flat3(cur) : cur), []
);

// 4. toString（仅数字）
const flat4 = (arr) => arr.toString().split(',').map(Number);

// 5. 生成器
function* flat5(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flat5(item);
    } else {
      yield item;
    }
  }
}
[...flat5(arr)];
```

### 什么是函数柯里化？（阿里高频）

```javascript
// 柯里化：将多参数函数转换为单参数函数序列
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}

// 使用
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6

// 实际应用
// 普通函数
function calculate(price, discount, tax) {
  return price * discount * tax;
}

// 柯里化后
const calculateWithDiscount = curry(calculate)(0.9); // 9折
const calculateWithTax = calculateWithDiscount(1.1); // 含税

calculateWithTax(100); // 99
```

### ES6+新特性有哪些？（字节、腾讯必问）

```javascript
// 1. let/const - 块级作用域
// 2. 箭头函数
const add = (a, b) => a + b;

// 3. 模板字符串
const str = `Hello ${name}`;

// 4. 解构赋值
const { name, age } = obj;
const [first, second] = arr;

// 5. 扩展运算符
const newArr = [...arr1, ...arr2];
const newObj = { ...obj1, ...obj2 };

// 6. Promise
Promise.all([p1, p2]);
Promise.race([p1, p2]);

// 7. Class
class Person {
  constructor(name) {
    this.name = name;
  }
}

// 8. 模块化
import { foo } from './foo';
export default bar;

// 9. Map/Set
const map = new Map();
map.set('key', 'value');

const set = new Set([1, 2, 3]);

// 10. Symbol
const sym = Symbol('description');

// 11. Proxy（Vue3核心）
const proxy = new Proxy(target, handler);

// 12. Reflect
Reflect.get(target, 'property');

// 13. 可选链
const name = user?.profile?.name;

// 14. 空值合并
const value = input ?? 'default';

// 15. 私有属性
class Counter {
  #count = 0;
}

// 16. BigInt
const big = 9007199254740991n;

// 17. async/await
async function fetch() {
  const data = await getData();
}

// ES2021+
// 18. WeakRef
// 19. FinalizationRegistry
// 20. String.replaceAll
```

### 什么是内存泄漏？常见场景有哪些？（美团、百度高频）

```javascript
// 1. 意外的全局变量
function leak1() {
  leak = 'I am global'; // 没有var/let/const，成为全局变量
}

// 2. 未清理的定时器
function leak2() {
  setInterval(() => {
    console.log('tick');
  }, 1000);
  // 忘记clearInterval
}

// 3. 闭包引用
function leak3() {
  const largeData = new Array(1000000);
  return function() {
    // 闭包一直引用largeData，无法释放
    console.log(largeData.length);
  };
}

// 4. DOM引用
function leak4() {
  const element = document.getElementById('div');
  element.data = new Array(1000000);
  // 删除DOM但变量还引用
  element.remove();
  // 应该：element.data = null; element = null;
}

// 5. 事件监听未移除
function leak5() {
  document.addEventListener('click', handler);
  // 应该：document.removeEventListener('click', handler);
}

// 6. Map/Set强引用
const map = new Map();
const obj = { key: 'value' };
map.set(obj, 'data');
// 即使obj不再使用，Map仍保持引用
// 应该使用WeakMap

// 预防方法：
// 1. 使用严格模式
// 2. 及时清理定时器
// 3. 避免不必要的闭包
// 4. DOM引用及时置空
// 5. 移除事件监听
// 6. 使用WeakMap/WeakSet
```

### 什么是Event Loop的完整流程？（腾讯、阿里必问）

```javascript
// 完整的Event Loop流程：
/*
1. 执行同步代码（宏任务）
2. 同步代码执行完毕，检查微任务队列
3. 执行所有微任务（直到清空）
4. 微任务清空后，执行一个宏任务
5. 重复步骤2-4

// 宏任务：
- setTimeout
- setInterval
- setImmediate (Node.js)
- I/O
- UI渲染

// 微任务：
- Promise.then/catch/finally
- process.nextTick (Node.js)
- MutationObserver
- queueMicrotask
*/

// 复杂面试题
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
}, 0);

Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => console.log('5'), 0);
});

console.log('6');

// 输出：1 6 4 2 3 5

// 分析：
// 同步：1, 6
// 微任务：4
// 宏任务1（setTimeout）：2 -> 微任务：3
// 宏任务2（setTimeout在Promise中）：5
```

### 什么是模块化？CommonJS vs ES Module？（字节高频）

```javascript
// CommonJS (Node.js)
// 1. 运行时加载
// 2. 值拷贝
// 3. 同步加载

// 导出
module.exports = {
  foo: 'bar'
};

// 或
exports.foo = 'bar';

// 导入
const { foo } = require('./module');

// ES Module (ES6)
// 1. 编译时加载
// 2. 引用拷贝
// 3. 异步加载

// 导出
export const foo = 'bar';
export default { baz: 'qux' };

// 导入
import { foo } from './module.js';
import baz from './module.js';

// 区别对比：

// 1. 加载时机
// CommonJS - 运行时加载
// ES Module - 编译时加载（性能更好）

// 2. 值类型
// CommonJS - 值拷贝（修改原模块不影响导入的值）
// ES Module - 引用拷贝（动态绑定）

// 3. this指向
// CommonJS - this指向当前模块
// ES Module - this指向undefined

// 4. 顶层变量
// CommonJS - module, exports, require, __filename, __dirname
// ES Module - 无这些变量
```

### 什么是Generator？（美团、小米高频）

```javascript
// Generator - 可以暂停执行的函数
function* generator() {
  yield 1;
  yield 2;
  yield 3;
  return 4;
}

const gen = generator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: 4, done: true }

// 应用1：异步流程控制
function* asyncTask() {
  const user = yield fetchUser();
  const posts = yield fetchPosts(user.id);
  return posts;
}

// 自动执行Generator
function run(generator) {
  const g = generator();

  function step(data) {
    const result = g.next(data);
    if (result.done) return;

    result.value.then(data => step(data));
  }

  step();
}

// 应用2：实现async/await
function async(fn) {
  return function(...args) {
    const gen = fn.apply(this, args);

    return new Promise((resolve, reject) => {
      function step(key, arg) {
        let result;
        try {
          result = gen[key](arg);
        } catch (e) {
          return reject(e);
        }

        if (result.done) {
          return resolve(result.value);
        }

        Promise.resolve(result.value).then(
          val => step('next', val),
          err => step('throw', err)
        );
      }

      step('next');
    });
  };
}
```

### 什么是Proxy和Reflect？（Vue3核心原理）

```javascript
// Proxy - 拦截对象操作
const target = {
  name: 'Alice',
  age: 25
};

const handler = {
  // 拦截对象属性读取
  get(target, property, receiver) {
    console.log(`Getting ${property}`);
    return Reflect.get(target, property, receiver);
  },

  // 拦截对象属性设置
  set(target, property, value, receiver) {
    console.log(`Setting ${property} to ${value}`);
    return Reflect.set(target, property, value, receiver);
  },

  // 拦截in操作符
  has(target, property) {
    console.log(`Checking ${property}`);
    return Reflect.has(target, property);
  },

  // 拦截delete操作
  deleteProperty(target, property) {
    console.log(`Deleting ${property}`);
    return Reflect.deleteProperty(target, property);
  }
};

const proxy = new Proxy(target, handler);

proxy.name; // Getting name
proxy.age = 26; // Setting age to 26
'name' in proxy; // Checking name
delete proxy.name; // Deleting name

// Vue3响应式原理简化版
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key); // 依赖收集
      return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key); // 触发更新
      return result;
    }
  });
}

// Reflect - 提供拦截JavaScript操作的方法
Reflect.get(target, 'name');
Reflect.set(target, 'name', 'Bob');
Reflect.has(target, 'name');
Reflect.deleteProperty(target, 'name');
Reflect.ownKeys(target);
```

### 什么是装饰器？（React、Vue常见）

```javascript
// 装饰器 - 修改类和行为（实验性功能）

// 类装饰器
function log(Class) {
  return class extends Class {
    constructor(...args) {
      console.log('Creating instance');
      super(...args);
    }
  };
}

@log
class Person {
  constructor(name) {
    this.name = name;
  }
}

// 方法装饰器
function readonly(target, property, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

class Calculator {
  @readonly
  add(a, b) {
    return a + b;
  }
}

// 参数装饰器
function validate(target, property, descriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args) {
    if (args.some(arg => typeof arg !== 'number')) {
      throw new Error('All arguments must be numbers');
    }
    return original.apply(this, args);
  };
}

class Math {
  @validate
  sum(a, b) {
    return a + b;
  }
}

// React中的应用（HOC）
function withLoading(WrappedComponent) {
  return function WithLoadingComponent(props) {
    if (props.isLoading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
}

@withLoading
class UserList extends React.Component {
  // ...
}
```

### 如何判断数组？（多种方法对比）

```javascript
// 1. Array.isArray（推荐）
Array.isArray([]); // true
Array.isArray({}); // false

// 2. instanceof
[] instanceof Array; // true
// 缺点：跨iframe/窗口会失败

// 3. Object.prototype.toString
Object.prototype.toString.call([]) === '[object Array]'; // true
// 最准确的方法

// 4. constructor
[].constructor === Array; // true
// 缺点：constructor可以被修改

// 5.鸭子类型检测（不推荐）
function isArray(obj) {
  return obj && typeof obj === 'object' && obj.length !== undefined;
}
```

### 手写实现new操作符？（阿里、字节必问）

```javascript
function myNew(constructor, ...args) {
  // 1. 创建新对象，原型指向构造函数的prototype
  const obj = Object.create(constructor.prototype);

  // 2. 执行构造函数，this指向新对象
  const result = constructor.apply(obj, args);

  // 3. 如果构造函数返回对象，返回该对象；否则返回新对象
  return result instanceof Object ? result : obj;
}

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const person = myNew(Person, 'Alice', 25);
console.log(person.name); // Alice
person.sayHello(); // Hello, I'm Alice
```

### 手写实现instanceof？（字节高频）

```javascript
function myInstanceof(left, right) {
  // 获取右侧的原型
  let prototype = right.prototype;

  // 获取左侧的__proto__
  left = left.__proto__;

  // 沿着原型链查找
  while (true) {
    if (left === null || left === undefined) {
      return false;
    }
    if (left === prototype) {
      return true;
    }
    left = left.__proto__;
  }
}

// 测试
console.log(myInstanceof([], Array)); // true
console.log(myInstanceof([], Object)); // true
console.log(myInstanceof({}, Array)); // false
```

### 如何实现对象扁平化？（美团高频）

```javascript
const obj = {
  a: 1,
  b: {
    c: 2,
    d: {
      e: 3
    }
  }
};

// 递归实现
function flatten(obj, prefix = '') {
  const result = {};

  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(result, flatten(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  }

  return result;
}

// 使用
const flattened = flatten(obj);
// { 'a': 1, 'b.c': 2, 'b.d.e': 3 }
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
