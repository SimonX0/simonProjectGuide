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

## 高级类型体操实战

### 高级类型体操面试题？（字节、阿里必问）

```typescript
// 1. 实现Pick（选择部分属性）
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

interface User {
  id: number
  name: string
  age: number
  email: string
}

type UserBasic = MyPick<User, 'id' | 'name'>
// { id: number; name: string }

// 2. 实现Readonly（只读属性）
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P]
}

type ReadonlyUser = MyReadonly<User>
// { readonly id: number; readonly name: number; ... }

// 3. 实现Exclude（排除联合类型）
type MyExclude<T, U> = T extends U ? never : T

type T1 = MyExclude<'a' | 'b' | 'c', 'a'>
// 'b' | 'c'

// 4. 实现Awaited（获取Promise返回值类型）
type MyAwaited<T> = T extends Promise<infer U>
  ? U extends Promise<any>
    ? MyAwaited<U>
    : U
  : T

type T2 = MyAwaited<Promise<string>>
// string
type T3 = MyAwaited<Promise<Promise<number>>>
// number

// 5. 实现If（条件类型）
type If<C extends boolean, T, F> = C extends true ? T : F

type T4 = If<true, 'a', 'b'>
// 'a'
type T5 = If<false, 'a', 'b'>
// 'b'

// 6. 实现Concat（数组类型连接）
type Concat<T extends any[], U extends any[]> = [...T, ...U]

type T6 = Concat<[1], [2, 3]>
// [1, 2, 3]

// 7. 实现Includes（判断数组是否包含元素）
type Includes<T extends any[], U> = T extends [infer First, ...infer Rest]
  ? Equal<First, U> extends true
    ? true
    : Includes<Rest, U>
  : false

// 辅助类型判断相等
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false

type T7 = Includes<['a', 'b', 'c'], 'a'>
// true
type T8 = Includes<['a', 'b', 'c'], 'd'>
// false

// 8. 实现Push（数组添加元素）
type Push<T extends any[], U> = [...T, U]

type T9 = Push<[1, 2], 3>
// [1, 2, 3]

// 9. 实现Unshift（数组开头添加元素）
type Unshift<T extends any[], U> = [U, ...T]

type T10 = Unshift<[1, 2], 0>
// [0, 1, 2]

// 10. 实现Parameters（获取函数参数类型）
type MyParameters<T extends (...args: any) => any> = T extends (...args: infer P) => any
  ? P
  : never

function foo(a: string, b: number): void {}

type T11 = MyParameters<typeof foo>
// [string, number]
```

### Utility Types高级应用？（美团高频）

```typescript
// 1. Partial<T> - 所有属性变为可选
type Partial<T> = {
  [P in keyof T]?: T[P]
}

// 2. Required<T> - 所有属性变为必需
type Required<T> = {
  [P in keyof T]-?: T[P]
}

// 3. Readonly<T> - 所有属性变为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

// 4. Pick<T, K> - 选择指定属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

// 5. Omit<T, K> - 排除指定属性
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// 实战：创建更新DTO
interface UpdateUserDTO {
  id: number
  name?: string
  email?: string
}

// 从完整类型中排除id，其他属性可选
type UpdateUserInput = Partial<Omit<User, 'id'>> & { id: number }

// 6. Record<K, T> - 构建对象类型
type Record<K extends keyof any, T> = {
  [P in K]: T
}

// 实战：字典类型
type Dictionary<T> = Record<string, T>

const userDict: Dictionary<User> = {
  user1: { id: 1, name: 'Alice', age: 30, email: 'alice@example.com' },
  user2: { id: 2, name: 'Bob', age: 25, email: 'bob@example.com' }
}

// 7. NonNullable<T> - 排除null和undefined
type NonNullable<T> = T extends null | undefined ? never : T

// 8. ReturnType<T> - 获取函数返回值类型
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any

// 9. InstanceType<T> - 获取类实例类型
type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any

class UserService {
  getUsers() {}
}

type ServiceInstance = InstanceType<typeof UserService>
// UserService

// 10. ThisParameterType<T> - 获取函数this参数类型
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown

// 11. OmitThisParameter<T> - 移除函数this参数
type OmitThisParameter<T> = T extends (this: any, ...args: infer A) => infer R
  ? (...args: A) => R
  : T

// 12. NoInfer<T> - 阻止类型推断（TypeScript 5.4+）
function foo<T extends string>(x: NoInfer<T>) {
  return x
}

// ❌ 错误：不能推断为'hello'
// foo('hello')

// ✅ 正确：必须指定类型
foo<'hello'>('hello')
```

### TypeScript装饰器详解？（腾讯真题）

```typescript
// 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor)
  Object.seal(constructor.prototype)
}

@sealed
class MyClass {
  // 无法再添加或删除属性
}

// 类装饰器工厂
function configurable(value: boolean) {
  return function (constructor: Function) {
    Object.defineProperty(constructor, 'configurable', {
      value: value,
      writable: true
    })
  }
}

@configurable(true)
class MyConfigurableClass {}

// 属性装饰器
function format(formatString: string) {
  return function (target: any, propertyKey: string) {
    let value = target[propertyKey]

    const getter = () => {
      return `${formatString} ${value}`
    }

    const setter = (newVal: string) => {
      value = newVal
    }

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    })
  }
}

class Person {
  @format('Hello,')
  name: string = 'World'
}

const person = new Person()
console.log(person.name)  // "Hello, World"

// 方法装饰器
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args)
    const result = originalMethod.apply(this, args)
    console.log(`${propertyKey} returned`, result)
    return result
  }
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b
  }
}

const calc = new Calculator()
calc.add(1, 2)
// Calling add with [1, 2]
// add returned 3

// 参数装饰器
function required(target: any, propertyKey: string, parameterIndex: number) {
  const requiredParameters: number[] = target.requiredParameters || []
  requiredParameters.push(parameterIndex)
  target.requiredParameters = requiredParameters
}

class User {
  greet(@required name: string) {
    console.log(`Hello, ${name}`)
  }
}

// 装饰器组合
@sealed
@configurable(true)
class CombinedExample {
  @format('Mr.')
  name: string

  @log
  method() {}
}

// 实战：Vue组件装饰器（vue-class-component）
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class MyComponent extends Vue {
  @Prop({ type: String, required: true })
  readonly title!: string

  @State('user')
  readonly user!: User

  @Getter('isLoggedIn')
  readonly isLoggedIn!: boolean

  @Action('fetchUser')
  fetchUser!: (id: string) => Promise<void>

  mounted() {
    console.log(this.title)
  }
}
```

### TypeScript模块系统深度解析？（字节2025真题）

```typescript
// 1. 全局模块 vs 文件模块
// global.d.ts - 全局类型声明
declare global {
  interface Window {
    myGlobal: any
  }

  namespace NodeJS {
    interface ProcessEnv {
      CUSTOM_VAR: string
    }
  }
}

export {}  // 使其成为模块

// 2. 模块声明（declare module）
// 为无类型的JS库添加类型
declare module 'my-library' {
  export interface Options {
    debug?: boolean
  }

  export default function init(options?: Options): void
}

// 3. 模块扩展（module augmentation）
// 扩展现有模块
declare module 'vue' {
  interface ComponentCustomProperties {
    $http: typeof import('axios')
    $store: import('vuex').Store<any>
  }
}

// 使用
export default {
  mounted() {
    this.$http.get('/api')
    this.$store.dispatch('fetch')
  }
}

// 4. 命名空间（namespace）
namespace Utils {
  export function formatDate(date: Date): string {
    return date.toISOString()
  }

  export function formatNumber(num: number): string {
    return num.toFixed(2)
  }

  export namespace String {
    export function capitalize(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  }
}

// 使用
Utils.formatDate(new Date())
Utils.String.capitalize('hello')

// 5. 动态导入（import()）
async function loadModule() {
  const { default: Component } = await import('./HeavyComponent.vue')
  return Component
}

// 6. 类型导入（import type）
// 只导入类型，编译后会被删除
import type { User } from './types'

// 7. re-exports（重导出）
// 从其他模块导出
export { User, Admin } from './types'
export * from './utils'
export { default as UserService } from './services/UserService'

// 8. moduleResolution配置
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",  // 或 "bundler" (TS 5.0+)
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/utils/*": ["src/utils/*"]
    },
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "types": ["node", "jest", "vite/client"]
  }
}

// 9. 条件类型（conditional types）用于模块选择
type ModuleType<T> = T extends 'vue' ? typeof import('vue')
  : T extends 'react' ? typeof import('react')
  : never

const vue: ModuleType<'vue'> = require('vue')
```

### TypeScript配置最佳实践？（阿里系统设计题）

```json
// tsconfig.json - 生产环境推荐配置
{
  "compilerOptions": {
    // 类型检查
    "strict": true,  // 启用所有严格类型检查选项
    "noImplicitAny": true,  // 禁止隐式any
    "strictNullChecks": true,  // 严格null检查
    "strictFunctionTypes": true,  // 严格函数类型检查
    "strictBindCallApply": true,  // 严格bind/call/apply检查
    "strictPropertyInitialization": true,  // 严格属性初始化检查
    "noImplicitThis": true,  // 禁止隐式this
    "alwaysStrict": true,  // 总是严格模式
    "noUnusedLocals": true,  // 检查未使用的局部变量
    "noUnusedParameters": true,  // 检查未使用的参数
    "noImplicitReturns": true,  // 检查是否有隐式返回
    "noFallthroughCasesInSwitch": true,  // 检查switch中的fallthrough
    "noUncheckedIndexedAccess": true,  // 索引访问时检查undefined

    // 模块解析
    "module": "ESNext",  // 模块系统
    "moduleResolution": "bundler",  // 模块解析策略
    "target": "ES2020",  // 编译目标
    "lib": ["ES2020", "DOM", "DOM.Iterable"],  // 包含的库定义
    "jsx": "preserve",  // JSX处理方式
    "esModuleInterop": true,  // ES模块互操作
    "allowSyntheticDefaultImports": true,  // 允许合成默认导入
    "resolveJsonModule": true,  // 允许导入JSON文件
    "isolatedModules": true,  // 每个文件作为独立模块

    // 输出配置
    "outDir": "./dist",  // 输出目录
    "declaration": true,  // 生成.d.ts文件
    "declarationMap": true,  // 生成声明文件map
    "sourceMap": true,  // 生成source map
    "removeComments": false,  // 保留注释
    "importHelpers": true,  // 导入tslib helpers

    // 其他选项
    "skipLibCheck": true,  // 跳过声明文件检查
    "forceConsistentCasingInFileNames": true,  // 强制文件名大小写一致
    "incremental": true,  // 增量编译
    "tsBuildInfoFile": ".tsbuildinfo"  // 构建信息文件
  },

  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],

  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}

// 项目结构：
// src/
//   types/
//     global.d.ts       - 全局类型声明
//     vue.d.ts         - Vue相关类型扩展
//     env.d.ts         - 环境变量类型
//   utils/
//     types.ts         - 工具类型
//     helpers.ts       - 辅助函数
//   components/
//     MyComponent.vue
```

### 泛型推断优化技巧？（美团高频）

```typescript
// 1. 推断类型参数
function identity<T>(arg: T): T {
  return arg
}

// TypeScript自动推断T为string
const result = identity('hello')

// 2. 多个类型参数推断
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second]
}

const p = pair('hello', 42)  // [string, number]

// 3. 上下文推断
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn)
}

const numbers = [1, 2, 3]
const strings = map(numbers, n => n.toString())  // string[]

// 4. 约束推断
function first<T extends { length: number }>(arg: T): T {
  return arg
}

first([1, 2, 3])  // T推断为number[]
first('hello')  // T推断为string

// 5. 条件推断
type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T

type T0 = Unpacked<string>  // string
type T1 = Unpacked<string[]>  // string
type T2 = Unpacked<() => string>  // string
type T3 = Unpacked<Promise<string>>  // string

// 6. 尾部递归推断
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never
type Tail<T extends any[]> = T extends [...any[], infer T] ? T : never

type H = Head<[1, 2, 3]>  // 1
type T = Tail<[1, 2, 3]>  // 3

// 7. 推断优化（使用infer）
function returnValue<T>(fn: () => T): T {
  return fn()
}

const val = returnValue(() => 'hello')  // string

// 8. 映射推断
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
}

interface Person {
  name: string
  age: number
}

type PersonGetters = Getters<Person>
// {
//   getName: () => string;
//   getAge: () => number;
// }

// 9. 条件类型推断优化
type Flatten<T> = T extends any[] ? T[number] : T

type Str = Flatten<string[]>  // string
type Num = Flatten<number>  // number
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
