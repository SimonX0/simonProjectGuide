---
title: TypeScript高级类型面试题
---

# TypeScript高级类型面试题

## 高级类型体操

### Conditional Types？

```typescript
// 基础条件类型
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>;  // true
type Test2 = IsString<number>;  // false

// 条件类型分发
type ToArray<T> = T extends any ? T[] : never;

type Test3 = ToArray<string | number>;  // string[] | number[]

// 嵌套条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

type Test4 = NonNullable<string | null>;  // string

// 实用示例：提取函数返回值类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { name: 'Alice', age: 30 };
}

type User = ReturnType<typeof getUser>;  // { name: string; age: number; }

// 实用示例：提取函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

function fetchData(url: string, options: { timeout: number }) {
  return fetch(url, options);
}

type FetchParams = Parameters<typeof fetchData>;
// [string, { timeout: number }]
```

### Template Literal Types？

```typescript
// 基础模板字面量类型
type Greeting = `hello ${string}`;

type Test1 = Greeting;  // "hello foo" | "hello bar" | ...

// 类型级别的字符串操作
type World = 'world';
type HelloWorld = `hello ${World}`;  // "hello world"

// 类型级别的字符串拼接
type EventName<T extends string> = `on${Capitalize<T>}`;

type Test2 = EventName<'click'>;  // "onClick"

// 内置字符串操作类型
type Lowercase<S extends string> = intrinsic;
type Uppercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Uncapitalize<S extends string> = intrinsic;

type Test3 = Lowercase<'HELLO'>;  // "hello"
type Test4 = Uppercase<'hello'>;  // "HELLO"
type Test5 = Capitalize<'hello'>;  // "Hello"
type Test6 = Uncapitalize<'Hello'>;  // "hello"

// 实用示例：类型安全的CSS属性
type CssProperty<T extends string> = `--${T}`;

type CustomProperty = CssProperty<'primary-color'>;  // "--primary-color"

// 实用示例：类型化事件处理器
type EventHandler<T extends string> = T extends `on${infer E}`
  ? E extends keyof HTMLElementEventMap
    ? (event: HTMLElementEventMap[E]) => void
    : (event: Event) => void
  : never;

type ClickHandler = EventHandler<'onClick'>;
// (event: MouseEvent) => void
```

## 泛型编程

### 高级泛型约束？

```typescript
// 基础约束
function logLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

logLength('hello');  // 5
logLength([1, 2, 3]);  // 3
logLength({ length: 10 });  // 10

// 多重约束
interface Lengthwise {
  length: number;
}

interface Writable {
  write(): void;
}

function process<T extends Lengthwise & Writable>(arg: T) {
  console.log(arg.length);
  arg.write();
}

// 条件约束
type HasId<T> = T extends { id: any } ? T : never;

function getById<T extends { id: any }>(items: T[], id: T['id']): T | undefined {
  return items.find(item => item.id === id);
}

// keyof约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };

const name = getProperty(user, 'name');  // string
const age = getProperty(user, 'age');  // number
// const invalid = getProperty(user, 'invalid');  // Error

// 默认泛型参数
interface Container<T = string> {
  value: T;
}

const container1: Container = { value: 'hello' };
const container2: Container<number> = { value: 123 };
```

### 泛型工具类型？

```typescript
// Partial：将所有属性变为可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; }

// Required：将所有属性变为必需
type Required<T> = {
  [P in keyof T]-?: T[P];
};

type RequiredUser = Required<Partial<User>>;

// Readonly：将所有属性变为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type ReadonlyUser = Readonly<User>;

// Pick：选择部分属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type UserBasicInfo = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }

// Omit：排除部分属性
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type UserWithoutEmail = Omit<User, 'email'>;
// { id: number; name: string; }

// Record：构建对象类型
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

type PageInfo = Record<'home' | 'about' | 'contact', { url: string }>;
// {
//   home: { url: string };
//   about: { url: string };
//   contact: { url: string };
// }

// Exclude：排除联合类型中的某些类型
type Exclude<T, U> = T extends U ? never : T;

type T1 = Exclude<string | number, string>;  // number

// Extract：提取联合类型中的某些类型
type Extract<T, U> = T extends U ? T : never;

type T2 = Extract<string | number, string>;  // string
```

## 类型推导

### infer关键字？

```typescript
// 推导数组元素类型
type ElementType<T> = T extends (infer U)[] ? U : never;

type T1 = ElementType<string[]>;  // string
type T2 = ElementType<number[]>;  // number

// 推导Promise返回值类型
type Unpacked<T> =
  T extends (infer U)[] ? U :
  T extends (...args: any[]) => infer U ? U :
  T extends Promise<infer U> ? U :
  T;

type T3 = Unpacked<string[]>;  // string
type T4 = Unpacked<() => string>;  // string
type T5 = Unpacked<Promise<string>>;  // string

// 推导函数this类型
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;

type T6 = ThisParameterType<(this: HTMLElement, x: number) => void>;  // HTMLElement

// 去除this类型
type OmitThisParameter<T> = unknown extends ThisParameterType<T>
  ? T
  : T extends (...args: infer A) => infer R
    ? (...args: A) => R
    : T;

// 推导多个类型参数
type Foo<T> = T extends { a: infer U; b: infer V } ? [U, V] : never;

type T7 = Foo<{ a: string; b: number }>;  // [string, number]
```

### 条件类型推导？

```typescript
// 分布式条件类型
type Diff<T, U> = T extends U ? never : T;

type T8 = Diff<string | number, string>;  // number

// 非分布式条件类型
type DiffNonDistributive<T, U> = [T] extends [U] ? never : T;

type T9 = DiffNonDistributive<string | number, string>;  // string | number

// 映射条件类型
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
// }

// 递归类型推导
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

interface Nested {
  a: {
    b: {
      c: number;
    };
  };
}

type ReadonlyNested = DeepReadonly<Nested>;
// {
//   readonly a: {
//     readonly b: {
//       readonly c: number;
//     };
//   };
// }
```

## 类型守卫

### typeof类型守卫？

```typescript
// typeof类型守卫
function printId(id: string | number) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase());  // id: string
  } else {
    console.log(id.toFixed(2));  // id: number
  }
}

// 多种类型检查
function process(value: string | number | boolean) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  } else if (typeof value === 'number') {
    return value.toFixed(2);
  } else {
    return value ? 'true' : 'false';
  }
}
```

### instanceof类型守卫？

```typescript
// instanceof类型守卫
class Dog {
  bark() {
    console.log('Woof!');
  }
}

class Cat {
  meow() {
    console.log('Meow!');
  }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// 内置类型
function processValue(value: Date | string[]) {
  if (value instanceof Date) {
    console.log(value.getTime());
  } else {
    console.log(value.length);
  }
}
```

### 自定义类型守卫？

```typescript
// 自定义类型守卫
interface Fish {
  swim: () => void;
  layEggs: () => void;
}

interface Bird {
  fly: () => void;
  layEggs: () => void;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return 'swim' in pet;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim();  // pet: Fish
  } else {
    pet.fly();  // pet: Bird
  }
}

// 断言函数
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Value is not a string');
  }
}

function process(value: unknown) {
  assertIsString(value);
  console.log(value.toUpperCase());  // value: string
}

// 类型谓词
interface Car {
  drive: () => void;
}

interface Boat {
  sail: () => void;
}

function isCar(vehicle: Car | Boat): vehicle is Car {
  return 'drive' in vehicle;
}

// 不可null类型守卫
function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

const values: (string | null)[] = ['hello', null, 'world'];

const filtered = values.filter(isNotNull);  // string[]
```

### in操作符类型守卫？

```typescript
interface Square {
  kind: 'square';
  size: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Circle {
  kind: 'circle';
  radius: number;
}

type Shape = Square | Rectangle | Circle;

function area(shape: Shape): number {
  if ('size' in shape) {
    return shape.size * shape.size;  // shape: Square
  } else if ('width' in shape) {
    return shape.width * shape.height;  // shape: Rectangle
  } else {
    return Math.PI * shape.radius * shape.radius;  // shape: Circle
  }
}

// 可辨识联合
function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'square':
      return shape.size * shape.size;
    case 'rectangle':
      return shape.width * shape.height;
    case 'circle':
      return Math.PI * shape.radius * shape.radius;
  }
}
```

## 类型声明

### 库的类型声明？

```typescript
// global.d.ts - 全局类型声明
declare global {
  interface Window {
    myCustomProperty: string;
  }

  namespace NodeJS {
    interface ProcessEnv {
      MY_CUSTOM_ENV: string;
    }
  }
}

export {};

// 模块声明
// declarations.d.ts
declare module 'my-library' {
  export function init(): void;
  export function destroy(): void;

  interface Options {
    debug?: boolean;
    timeout?: number;
  }

  export function configure(options: Options): void;
}

// 声明合并
// 扩展Array类型
interface Array<T> {
  first(): T | undefined;
  last(): T | undefined;
}

Array.prototype.first = function() {
  return this[0];
};

Array.prototype.last = function() {
  return this[this.length - 1];
};

// 使用
const numbers = [1, 2, 3];
numbers.first();  // 1
numbers.last();  // 3

// 扩展Vue类型
// vue-shim.d.ts
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    MyComponent: typeof import('./src/components/MyComponent.vue')['default'];
  }
}
```

### 类型导入导出？

```typescript
// types.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

export type { User };

export type UserId = User['id'];
export type UserName = User['name'];

// 导入类型
import type { User } from './types';

// 导入和值混合
import { User, getUser } from './types';
import type { Admin } from './types';

// 类型断言导入
import { getUser } from './api';
import type { User } from './types';

const user: User = await getUser();
```

## 类型安全最佳实践

### strict模式？

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### 避免any？

```typescript
// ❌ 使用any
function processData(data: any) {
  return data.value;
}

// ✅ 使用泛型
function processData<T extends { value: any }>(data: T): T['value'] {
  return data.value;
}

// ✅ 使用unknown
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: any }).value;
  }
  throw new Error('Invalid data');
}

// ✅ 使用类型守卫
interface Data {
  value: string;
}

function isData(data: unknown): data is Data {
  return typeof data === 'object' &&
         data !== null &&
         'value' in data &&
         typeof (data as Data).value === 'string';
}
```

### 品牌类型？

```typescript
// 品牌类型：区分类型相同但含义不同的值
type UserId = string & { readonly __brand: unique symbol };
type Email = string & { readonly __brand: unique symbol };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createEmail(email: string): Email {
  return email as Email;
}

function getUserById(id: UserId) {
  // ...
}

const id = createUserId('123');
const email = createEmail('user@example.com');

getUserById(id);  // ✅ OK
getUserById(email);  // ❌ Error

// 泛型品牌类型
type Brand<T, B> = T & { readonly __brand: B };

type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;

function usd(value: number): USD {
  return value as USD;
}

function eur(value: number): EUR {
  return value as EUR;
}

function addUSD(a: USD, b: USD): USD {
  return (a + b) as USD;
}

const price1 = usd(100);
const price2 = usd(50);
addUSD(price1, price2);  // ✅ OK
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
