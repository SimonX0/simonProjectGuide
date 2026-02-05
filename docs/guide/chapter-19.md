# TypeScript + Vue3 完全指南

## TypeScript + Vue3

> **学习目标**：全面掌握 Vue3 与 TypeScript 结合使用
> **核心内容**：
> - TypeScript 配置详解
> - 类型进阶（泛型、条件类型、映射类型）
> - Vue3 组件类型系统
> - 组合式函数类型定义
> - API 类型定义
> - 常见类型问题解决
> - 最佳实践

---

## TypeScript 基础配置

### 初始化 TypeScript 项目

#### 创建 Vue3 + TypeScript 项目

```bash
# 使用 Vite 创建项目
npm create vite@latest my-vue-app -- --template vue-ts

# 或使用 Vue CLI
npm create vue@latest my-vue-app
# 选择 TypeScript、Vue Router、Pinia 等特性
```

#### 项目结构

```
vue3-ts-project/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── router/
│   ├── stores/
│   ├── types/              # 类型定义目录
│   │   ├── index.ts        # 通用类型
│   │   ├── api.ts          # API 类型
│   │   ├── components.ts   # 组件类型
│   │   └── utils.ts        # 工具类型
│   ├── utils/
│   ├── views/
│   ├── App.vue
│   └── main.ts
├── .env.d.ts               # 环境变量类型
├── auto-imports.d.ts        # 自动导入类型
├── components.d.ts          # 组件类型
├── tsconfig.json           # TypeScript 配置
├── tsconfig.node.json      # Node 环境 TypeScript 配置
└── vite.config.ts
```

---

### tsconfig.json 完整配置

#### 基础配置

```json
{
  "compilerOptions": {
    // ===== 语言和环境 =====
    "target": "ES2020",                    // 编译目标
    "lib": ["ES2020", "DOM", "DOM.Iterable"],  // 包含的库
    "jsx": "preserve",                     // JSX 处理方式

    // ===== 模块 =====
    "module": "ESNext",                    // 模块系统
    "moduleResolution": "bundler",         // 模块解析策略
    "resolveJsonModule": true,             // 允许导入 JSON
    "allowImportingTsExtensions": true,    // 允许导入 .ts 文件
    "types": ["vite/client", "element-plus/global"],  // 包含的类型声明

    // ===== 类型检查 =====
    "strict": true,                        // 启用所有严格类型检查
    "noUnusedLocals": true,                // 检查未使用的局部变量
    "noUnusedParameters": true,            // 检查未使用的参数
    "noFallthroughCasesInSwitch": true,    // switch 语句的 fallthrough 检查
    "noImplicitReturns": true,             // 检查函数是否有隐式返回
    "noUncheckedIndexedAccess": true,      // 索引访问检查
    "noImplicitOverride": true,            // 检查 override 修饰符

    // ===== 模块绑定 =====
    "esModuleInterop": true,               // ES 模块互操作性
    "allowSyntheticDefaultImports": true,  // 允许合成默认导入
    "forceConsistentCasingInFileNames": true,  // 强制文件名大小写一致

    // ===== 其他 =====
    "skipLibCheck": true,                  // 跳过库文件类型检查
    "allowJs": true,                       // 允许编译 JS 文件
    "checkJs": false,                      // 不检查 JS 文件中的错误
    "outDir": "./dist",                    // 输出目录
    "noEmit": true,                        // 不生成输出文件（Vite 会处理）

    // ===== 路径映射 =====
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@views/*": ["src/views/*"],
      "@stores/*": ["src/stores/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@api/*": ["src/api/*"],
      "@assets/*": ["src/assets/*"]
    }
  },

  // ===== 包含的文件 =====
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],

  // ===== 排除的文件 =====
  "exclude": [
    "node_modules",
    "dist"
  ],

  // ===== 项目引用 =====
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
```

#### tsconfig.node.json（用于 Vite 配置文件）

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "vite.config.ts"
  ]
}
```

---

### 环境变量类型定义

#### .env.d.ts

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Vite 内置变量
  readonly BASE_URL: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean

  // 自定义环境变量
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_UPLOAD_URL: string
  readonly VITE_WS_URL: string

  // 第三方服务
  readonly VITE_GA_ID: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_MOCK_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## TypeScript 类型基础

### 基础类型注解

#### 原始类型

```typescript
// 字符串
const name: string = 'Vue3'
const template: string = `Hello ${name}`

// 数字
const count: number = 0
const price: number = 99.99
const hex: number = 0xf00d

// 布尔值
const isActive: boolean = true
const isLoaded: boolean = false

// 数组
const numbers: number[] = [1, 2, 3]
const strings: Array<string> = ['a', 'b', 'c']

// 元组（固定长度数组）
const tuple: [string, number] = ['Vue', 3]
const coordinates: [number, number, number] = [1, 2, 3]

// 枚举
enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT'
}

// any（尽量避免使用）
let anything: any = 'string'
anything = 42

// unknown（类型安全的 any）
let value: unknown = 'string'
if (typeof value === 'string') {
  console.log(value.toUpperCase())  // OK
}

// void（无返回值）
function log(message: string): void {
  console.log(message)
}

// never（永远不会返回）
function throwError(message: string): never {
  throw new Error(message)
}

// null 和 undefined
const nothing: null = null
const notDefined: undefined = undefined
```

#### 对象类型

```typescript
// 对象类型
interface User {
  id: number
  name: string
  email?: string          // 可选属性
  readonly createdAt: Date // 只读属性
}

const user: User = {
  id: 1,
  name: '张三',
  createdAt: new Date()
}

// 索引签名
interface StringDictionary {
  [key: string]: string
}

const dict: StringDictionary = {
  name: 'Vue3',
  version: '3.4'
}

// Record 工具类型
type MenuRecord = Record<string, string>
const menu: MenuRecord = {
  home: '/home',
  about: '/about'
}
```

---

### 函数类型

#### 函数声明

```typescript
// 函数类型注解
function add(a: number, b: number): number {
  return a + b
}

// 箭头函数
const multiply = (a: number, b: number): number => {
  return a * b
}

// 函数类型别名
type Calculator = (a: number, b: number) => number

const divide: Calculator = (a, b) => a / b

// 可选参数
function greet(name: string, greeting?: string): string {
  return greeting ? `${greeting}, ${name}` : `Hello, ${name}`
}

// 默认参数
function createUrl(path: string, baseURL: string = 'https://api.example.com'): string {
  return `${baseURL}${path}`
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0)
}

// 函数重载
function processValue(value: string): string
function processValue(value: number): number
function processValue(value: string | number): string | number {
  if (typeof value === 'string') {
    return value.toUpperCase()
  }
  return value * 2
}
```

---

### 联合类型和交叉类型

#### 联合类型（Union Types）

```typescript
// 基本联合类型
type ID = string | number

function printId(id: ID) {
  console.log(`ID: ${id}`)
}

// 字面量联合类型
type Theme = 'light' | 'dark' | 'auto'
type Alignment = 'left' | 'center' | 'right'

function setTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

// 可辨识联合
interface SuccessResponse {
  status: 'success'
  data: any
}

interface ErrorResponse {
  status: 'error'
  error: string
}

type ApiResponse = SuccessResponse | ErrorResponse

function handleResponse(response: ApiResponse) {
  if (response.status === 'success') {
    console.log(response.data)
  } else {
    console.error(response.error)
  }
}
```

#### 交叉类型（Intersection Types）

```typescript
// 合并多个类型
interface Colorful {
  color: string
}

interface Circle {
  radius: number
}

type ColorfulCircle = Colorful & Circle

const circle: ColorfulCircle = {
  color: 'red',
  radius: 10
}

// 实用示例
interface BaseEntity {
  id: number
  createdAt: Date
}

interface Timestamps {
  updatedAt: Date
  deletedAt: Date | null
}

type UserEntity = BaseEntity & Timestamps & {
  name: string
  email: string
}
```

---

## TypeScript 高级类型

### 泛型（Generics）

#### 基础泛型

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg
}

const num = identity<number>(42)
const str = identity('hello')

// 泛型接口
interface Box<T> {
  value: T
}

const numberBox: Box<number> = { value: 42 }
const stringBox: Box<string> = { value: 'hello' }

// 泛型类
class Stack<T> {
  private items: T[] = []

  push(item: T): void {
    this.items.push(item)
  }

  pop(): T | undefined {
    return this.items.pop()
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }

  get size(): number {
    return this.items.length
  }
}

const numberStack = new Stack<number>()
numberStack.push(1)
numberStack.push(2)

// 泛型约束
interface Lengthwise {
  length: number
}

function logLength<T extends Lengthwise>(arg: T): void {
  console.log(arg.length)
}

logLength({ length: 10, value: 'hello' })  // OK
logLength('hello')  // OK（字符串有 length 属性）
// logLength(42)  // Error
```

#### 多个泛型参数

```typescript
// 配对函数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second]
}

const [name, age] = pair('Vue', 3)

// Map 类型
type MapFunction<T, U> = (value: T) => U

function map<T, U>(array: T[], fn: MapFunction<T, U>): U[] {
  return array.map(fn)
}

const numbers = [1, 2, 3]
const strings = map(numbers, (n) => n.toString())
```

#### 泛型默认值

```typescript
interface ApiResponse<T = any, M = string> {
  data: T
  message: M
  code: number
}

const response1: ApiResponse = {
  data: { id: 1 },
  message: 'Success',
  code: 200
}

const response2: ApiResponse<number> = {
  data: 42,
  message: 'Success',
  code: 200
}
```

---

### 条件类型（Conditional Types）

#### 基础条件类型

```typescript
// 条件类型语法
type IsString<T> = T extends string ? true : false

type Test1 = IsString<string>  // true
type Test2 = IsString<number>  // false

// 实用示例
type NonNullable<T> = T extends null | undefined ? never : T

type A = NonNullable<string | null>  // string
type B = NonNullable<number | undefined>  // number

// 嵌套条件类型
type TypeName<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object'

type T0 = TypeName<string>  // 'string'
type T1 = TypeName<'hello'>  // 'string'
type T2 = TypeName<() => void>  // 'function'
```

#### 条件类型与泛型结合

```typescript
// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any

type F = () => string
type R = ReturnType<F>  // string

// 提取函数参数类型
type FirstParameter<T> = T extends (first: infer F, ...args: any[]) => any ? F : never

type G = (x: number, y: string) => void
type P = FirstParameter<G>  // number
```

---

### 映射类型（Mapped Types）

#### 基础映射类型

```typescript
// 将所有属性变为可选
type Partial<T> = {
  [P in keyof T]?: T[P]
}

interface User {
  id: number
  name: string
  email: string
}

type PartialUser = Partial<User>
// { id?: number; name?: string; email?: string }

// 将所有属性变为必需
type Required<T> = {
  [P in keyof T]-?: T[P]
}

// 将所有属性变为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

// 只选择部分属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

type UserBasicInfo = Pick<User, 'id' | 'name'>
// { id: number; name: string }

// 排除部分属性
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

type UserWithoutEmail = Omit<User, 'email'>
// { id: number; name: string }
```

#### 高级映射类型

```typescript
// 修改属性类型
type MakeNullable<T> = {
  [P in keyof T]: T[P] | null
}

type NullableUser = MakeNullable<User>
// { id: number | null; name: string | null; email: string | null }

// 添加 getter/setter
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
}

interface State {
  count: number
  name: string
}

type StateGetters = Getters<State>
// { getCount: () => number; getName: () => string }

// 条件映射
type ReadonlyByNullable<T> = {
  [P in keyof T]: T[P] extends string | number | boolean ? T[P] : readonly T[P]
}
```

---

### 工具类型（Utility Types）

#### 常用工具类型

```typescript
// Partial - 将所有属性变为可选
type PartialUser = Partial<User>

// Required - 将所有属性变为必需
type RequiredUser = Required<PartialUser>

// Readonly - 将所有属性变为只读
type ReadonlyUser = Readonly<User>

// Record - 构建对象类型
type MenuConfig = Record<string, { icon: string; path: string }>

// Pick - 选择特定属性
type UserInfo = Pick<User, 'name' | 'email'>

// Omit - 排除特定属性
type UserWithoutId = Omit<User, 'id'>

// Exclude - 从联合类型中排除
type Primitives = Exclude<string | number | boolean, string>
// number | boolean

// Extract - 从联合类型中提取
type StringsOnly = Extract<string | number | boolean, string>
// string

// NonNullable - 排除 null 和 undefined
type NonNullString = NonNullable<string | null>
// string

// ReturnType - 获取函数返回类型
type Func = () => string
type Return = ReturnType<Func>
// string

// Parameters - 获取函数参数类型
type Params = Parameters<(x: number, y: string) => void>
// [number, string]

// InstanceType - 获取类实例类型
class MyClass {
  constructor(public name: string) {}
}

type Instance = InstanceType<typeof MyClass>
// MyClass
```

#### 自定义工具类型

```typescript
// DeepPartial - 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

interface NestedObject {
  a: {
    b: {
      c: string
    }
  }
}

type PartialNested = DeepPartial<NestedObject>
// { a?: { b?: { c?: string } } }

// DeepRequired - 深度必需
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

// DeepReadonly - 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// DeepNullable - 深度可空
type DeepNullable<T> = {
  [P in keyof T]: T[P] extends object ? DeepNullable<T[P]> : T[P] | null
}

// MaybePromise - 处理 Promise 类型
type MaybePromise<T> = Promise<T> | T

async function handleValue<T>(value: MaybePromise<T>): Promise<T> {
  return Promise.resolve(value)
}

// UnionToIntersection - 联合类型转交叉类型
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

// LastOf - 获取联合类型的最后一个类型
type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never
```

---

## Vue3 组件类型系统

### defineProps 类型定义

#### 基础 Props 类型

```vue
<script setup lang="ts">
// 方式1：接口定义
interface Props {
  title: string
  count?: number
  disabled: boolean
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  disabled: false
})

// 方式2：类型字面量
defineProps<{
  name: string
  age: number
  email?: string
}>()

// 方式3：PropType（复杂类型）
import { type PropType } from 'vue'

interface User {
  id: number
  name: string
}

defineProps({
  users: {
    type: Array as PropType<User[]>,
    required: true
  },
  callback: {
    type: Function as PropType<(id: number) => void>,
    required: true
  }
})
</script>
```

#### 复杂 Props 类型

```vue
<script setup lang="ts">
// 联合类型
interface Props {
  theme: 'light' | 'dark' | 'auto'
  size: 'small' | 'medium' | 'large'
}

// 对象类型
interface MenuItem {
  id: number
  label: string
  icon?: string
  children?: MenuItem[]
}

interface Props {
  menu: MenuItem[]
}

// 函数类型
interface Props {
  onSubmit: (data: FormData) => Promise<boolean>
  onCancel?: () => void
}

// 使用 PropType 定义复杂类型
import { type PropType } from 'vue'

interface TableColumn {
  key: string
  title: string
  width?: number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, record: any) => any
}

defineProps({
  columns: {
    type: Array as PropType<TableColumn[]>,
    default: () => []
  }
})
</script>
```

#### Props 验证

```vue
<script setup lang="ts">
interface Props {
  // 基础类型
  name: string
  count: number
  active: boolean

  // 可选属性
  title?: string
  description?: string

  // 联合类型
  size: 'small' | 'medium' | 'large'
  align: 'left' | 'center' | 'right'

  // 数组
  tags: string[]

  // 对象
  config: {
    api: string
    timeout: number
  }

  // 函数
  callback: (id: number) => void

  // 复杂嵌套
  items: Array<{
    id: number
    name: string
    children?: Item[]
  }>
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  size: 'medium',
  align: 'left',
  tags: () => [],
  config: () => ({
    api: '/api',
    timeout: 5000
  }),
  items: () => []
})

// Props 使用
console.log(props.name)
console.log(props.items)
</script>
```

---

### defineEmits 类型定义

#### 基础 Emits 类型

```vue
<script setup lang="ts">
// 方式1：类型字面量
const emit = defineEmits<{
  update: [value: string]
  change: [id: number, newValue: string]
  delete: [id: number]
}>()

// 方式2：接口定义
interface Emits {
  submit: [data: FormData]
  cancel: []
  'update:modelValue': [value: string]
}

const emit = defineEmits<Emits>()

// 使用
function handleSubmit() {
  const data = new FormData()
  emit('submit', data)
}

function handleCancel() {
  emit('cancel')
}

function updateValue(value: string) {
  emit('update:modelValue', value)
}
</script>
```

#### 复杂 Emits 类型

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
}

interface Emits {
  // 简单事件
  click: [event: MouseEvent]

  // 带多个参数
  change: [id: number, value: string, oldValue: string]

  // 带对象参数
  save: [user: User, options: { validate: boolean }]

  // 泛型事件
  'update:items': [items: Array<{ id: number; name: string }>]

  // 异步回调
  'async-action': [
    params: { id: number },
    callback: (result: boolean) => void
  ]
}

const emit = defineEmits<Emits>()

// 使用示例
function handleClick(event: MouseEvent) {
  emit('click', event)
}

function handleSave() {
  const user: User = { id: 1, name: '张三' }
  emit('save', user, { validate: true })
}

function handleAsyncAction() {
  emit('async-action', { id: 1 }, (result) => {
    console.log('操作结果:', result)
  })
}
</script>
```

---

### ref 和 reactive 类型

#### ref 类型定义

```vue
<script setup lang="ts">
import { ref } from 'vue'

// 基础类型
const count = ref<number>(0)
const message = ref<string>('hello')
const isActive = ref<boolean>(true)

// 联合类型
const value = ref<string | number>(0)
const data = ref<string | null>(null)

// 对象类型
interface User {
  id: number
  name: string
}

const user = ref<User>({ id: 1, name: '张三' })
const userOrNull = ref<User | null>(null)

// 数组类型
const items = ref<string[]>([])
const numbers = ref<number[]>([1, 2, 3])
const users = ref<User[]>([])

// 推断类型（推荐）
const count = ref(0)  // 自动推断为 Ref<number>
const message = ref('hello')  // Ref<string>

// 获取值的类型
type CountType = typeof count.value  // number

// 泛型 ref
function useState<T>(initial: T) {
  return ref<T>(initial)
}

const name = useState('Vue3')
const age = useState(3)
</script>
```

#### reactive 类型定义

```vue
<script setup lang="ts">
import { reactive } from 'vue'

// 接口定义
interface State {
  count: number
  name: string
  items: string[]
}

const state = reactive<State>({
  count: 0,
  name: 'Vue3',
  items: []
})

// 嵌套对象
interface NestedState {
  user: {
    profile: {
      name: string
      email: string
    }
    settings: {
      theme: 'light' | 'dark'
      language: string
    }
  }
}

const nested = reactive<NestedState>({
  user: {
    profile: {
      name: '张三',
      email: 'zhang@example.com'
    },
    settings: {
      theme: 'light',
      language: 'zh-CN'
    }
  }
})

// 只读 reactive
import { readonly } from 'vue'

const readOnlyState = readonly(state)
</script>
```

#### toRef 和 toRefs

```vue
<script setup lang="ts">
import { reactive, toRef, toRefs } from 'vue'

interface State {
  count: number
  name: string
  user: {
    id: number
    email: string
  }
}

const state = reactive<State>({
  count: 0,
  name: 'Vue3',
  user: {
    id: 1,
    email: 'vue@example.com'
  }
})

// toRef - 单个属性转为 ref
const countRef = toRef(state, 'count')
countRef.value++  // 会更新 state.count

// toRefs - 所有属性转为 refs
const { count, name, user } = toRefs(state)
count.value++  // 会更新 state.count

// 解构使用
function useSomeState() {
  const state = reactive<State>({
    count: 0,
    name: 'Vue3',
    user: { id: 1, email: '' }
  })

  return toRefs(state)  // 返回 { count: Ref, name: Ref, user: Ref }
}

const { count, name } = useSomeState()
</script>
```

---

### computed 类型定义

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

// 基础计算属性
const count = ref(0)
const doubleCount = computed<number>(() => count.value * 2)

// 返回对象
interface User {
  id: number
  name: string
}

const user = ref<User | null>(null)
const userName = computed<string>(() => user.value?.name ?? 'Guest')

// 可写计算属性
const firstName = ref('张')
const lastName = ref('三')

const fullName = computed<string>({
  get() {
    return `${firstName.value}${lastName.value}`
  },
  set(value: string) {
    [firstName.value, lastName.value] = value
  }
})

// 泛型计算属性
function useList<T>() {
  const items = ref<T[]>([])

  const firstItem = computed<T | undefined>(() => items.value[0])
  const lastItem = computed<T | undefined>(() => items.value[items.value.length - 1])
  const count = computed<number>(() => items.value.length)

  return { items, firstItem, lastItem, count }
}

const { items, firstItem, count } = useList<number>()
</script>
```

---

### watch 类型定义

```vue
<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'

// 监听单个源
const count = ref(0)

watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`)
})

// 监听多个源
const firstName = ref('张')
const lastName = ref('三')

watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) => {
  console.log(`${oldFirst}${oldLast} -> ${newFirst}${newLast}`)
})

// 监听对象属性
const state = reactive({
  user: {
    name: '张三',
    age: 25
  }
})

watch(
  () => state.user.name,
  (newName, oldName) => {
    console.log(`name: ${oldName} -> ${newName}`)
  }
)

// 带选项的监听
watch(
  count,
  (newVal, oldVal) => {
    console.log(`count changed: ${oldVal} -> ${newVal}`)
  },
  {
    immediate: true,
    deep: true
  }
)

// watchEffect 类型
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log('tick')
  }, 1000)

  onCleanup(() => {
    clearInterval(timer)
  })
})

// 泛型 watch
interface WatchOptions {
  immediate?: boolean
  deep?: boolean
  flush?: 'pre' | 'post' | 'sync'
}

function useWatch<T>(
  source: T | (() => T),
  callback: (newVal: T, oldVal: T) => void,
  options?: WatchOptions
) {
  watch(source as any, callback as any, options)
}

useWatch(count, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})
</script>
```

---

## 组合式函数类型

### 基础组合式函数

```typescript
// composables/useCounter.ts
import { ref, computed, type Ref, type ComputedRef } from 'vue'

interface UseCounterOptions {
  min?: number
  max?: number
  initial?: number
}

interface UseCounterReturn {
  count: Ref<number>
  increment: () => void
  decrement: () => void
  reset: () => void
  set: (value: number) => void
  isMin: ComputedRef<boolean>
  isMax: ComputedRef<boolean>
}

export function useCounter(options: UseCounterOptions = {}): UseCounterReturn {
  const {
    min = 0,
    max = 100,
    initial = min
  } = options

  const count = ref(initial)

  const increment = () => {
    if (count.value < max) {
      count.value++
    }
  }

  const decrement = () => {
    if (count.value > min) {
      count.value--
    }
  }

  const reset = () => {
    count.value = initial
  }

  const set = (value: number) => {
    count.value = Math.max(min, Math.min(max, value))
  }

  const isMin = computed(() => count.value === min)
  const isMax = computed(() => count.value === max)

  return {
    count,
    increment,
    decrement,
    reset,
    set,
    isMin,
    isMax
  }
}
```

---

### 异步组合式函数

```typescript
// composables/useAsync.ts
import { ref, type Ref } from 'vue'

interface UseAsyncState<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
}

interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: () => Promise<void>
}

export function useAsync<T>(
  asyncFn: () => Promise<T>
): UseAsyncReturn<T> {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      data.value = await asyncFn()
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    error,
    loading,
    execute
  }
}

// 使用示例
// const { data, error, loading, execute } = useAsync(async () => {
//   const response = await fetch('/api/user')
//   return response.json()
// })
```

---

### API 请求组合式函数

```typescript
// composables/useRequest.ts
import { ref, type Ref } from 'vue'

interface RequestConfig {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

interface UseRequestReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
  execute: (params?: any) => Promise<void>
  refresh: () => Promise<void>
}

export function useRequest<T>(
  apiFn: (params?: any) => Promise<T>,
  config: RequestConfig = {}
): UseRequestReturn<T> {
  const {
    immediate = false,
    onSuccess,
    onError
  } = config

  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  const paramsRef = ref<any>()

  const execute = async (params?: any) => {
    paramsRef.value = params
    loading.value = true
    error.value = null

    try {
      const result = await apiFn(params)
      data.value = result
      onSuccess?.(result)
    } catch (err) {
      error.value = err as Error
      onError?.(err as Error)
    } finally {
      loading.value = false
    }
  }

  const refresh = () => execute(paramsRef.value)

  if (immediate) {
    execute()
  }

  return {
    data,
    error,
    loading,
    execute,
    refresh
  }
}

// 使用示例
// const { data, error, loading, execute, refresh } = useRequest(
//   (id) => fetch(`/api/user/${id}`).then(r => r.json()),
//   { immediate: true }
// )
```

---

## API 类型定义

### RESTful API 类型

```typescript
// types/api.ts

// 通用 API 响应
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页响应
interface PaginationResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 分页请求参数
interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 用户相关类型
interface User {
  id: number
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
  createdAt: string
  updatedAt: string
}

interface CreateUserDto {
  name: string
  email: string
  password: string
  role?: 'admin' | 'user' | 'guest'
}

interface UpdateUserDto {
  name?: string
  email?: string
  avatar?: string
  role?: 'admin' | 'user' | 'guest'
}

interface UserListParams extends PaginationParams {
  keyword?: string
  role?: 'admin' | 'user' | 'guest'
}

// API 函数类型
export type UserListResponse = ApiResponse<PaginationResponse<User>>
export type UserDetailResponse = ApiResponse<User>
export type CreateUserResponse = ApiResponse<User>
export type UpdateUserResponse = ApiResponse<User>
export type DeleteUserResponse = ApiResponse<null>
```

### API 函数定义

```typescript
// api/user.ts
import axios from 'axios'
import type {
  UserListParams,
  UserListResponse,
  CreateUserDto,
  CreateUserResponse,
  UpdateUserDto,
  UpdateUserResponse,
  DeleteUserResponse
} from '@/types/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// 获取用户列表
export async function getUserList(
  params: UserListParams
): Promise<UserListResponse> {
  const response = await api.get('/users', { params })
  return response.data
}

// 获取用户详情
export async function getUserDetail(
  id: number
): Promise<UserDetailResponse> {
  const response = await api.get(`/users/${id}`)
  return response.data
}

// 创建用户
export async function createUser(
  data: CreateUserDto
): Promise<CreateUserResponse> {
  const response = await api.post('/users', data)
  return response.data
}

// 更新用户
export async function updateUser(
  id: number,
  data: UpdateUserDto
): Promise<UpdateUserResponse> {
  const response = await api.put(`/users/${id}`, data)
  return response.data
}

// 删除用户
export async function deleteUser(
  id: number
): Promise<DeleteUserResponse> {
  const response = await api.delete(`/users/${id}`)
  return response.data
}
```

---

## 常见类型问题解决

### ref 解包问题

```vue
<script setup lang="ts">
import { ref, reactive, shallowRef, triggerRef } from 'vue'

// 问题：数组中的 ref 不会自动解包
const items = ref([ref(1), ref(2)])
console.log(items.value[0].value)  // 需要手动 .value

// 解决：使用 shallowRef 或 flat 数组
const items = shallowRef([1, 2])

// 问题：reactive 对象中的 ref 不会自动解包
const state = reactive({
  count: ref(0)
})
console.log(state.count.value)  // 需要 .value

// 解决：直接在 reactive 中使用普通值
const state = reactive({
  count: 0
})

// 或者使用 toRefs
const state = reactive({
  count: 0
})
const { count } = toRefs(state)
</script>
```

---

### 泛型组件

```vue
<script setup lang="ts" generic="T extends Item, U = string">
interface Item {
  id: number
  name: string
}

interface Props {
  items: T[]
  selectedId?: U
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [item: T]
}>()

function handleSelect(item: T) {
  emit('select', item)
}
</script>
```

---

### 类型断言

```typescript
// as 断言
const value = unknownValue as string

// 非空断言
const element = document.getElementById('app')!
element.innerHTML = 'Hello'

// 类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

if (isString(value)) {
  console.log(value.toUpperCase())  // TypeScript 知道这是 string
}

// instanceof 类型守卫
try {
  // some code
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message)
  }
}

// in 操作符类型守卫
interface Bird {
  fly(): void
  layEggs(): void
}

interface Fish {
  swim(): void
  layEggs(): void
}

function isFish(pet: Bird | Fish): pet is Fish {
  return 'swim' in pet
}
```

---

## TypeScript 最佳实践

### 类型定义组织

```typescript
// types/index.ts - 通用类型
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type MaybePromise<T> = Promise<T> | T

// types/api.ts - API 类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// types/components.ts - 组件类型
export interface BaseProps {
  id?: string
  class?: string
  style?: string | Record<string, any>
}

// types/utils.ts - 工具类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
```

---

### 严格模式配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true
  }
}
```

---

### 避免使用 any

```typescript
// ❌ 不好
function processData(data: any) {
  return data.map((item: any) => item.value)
}

// ✅ 好
interface DataItem {
  value: string
}

function processData(data: DataItem[]): string[] {
  return data.map(item => item.value)
}

// ❌ 不好
const config: any = {}

// ✅ 好
interface Config {
  api: string
  timeout: number
}

const config: Config = {
  api: '/api',
  timeout: 5000
}
```

---

## 总结

本章全面介绍了 TypeScript 与 Vue3 结合使用的方方面面：

- ✅ TypeScript 配置详解
- ✅ 类型基础和高级类型
- ✅ Vue3 组件类型系统
- ✅ 组合式函数类型定义
- ✅ API 类型定义
- ✅ 常见问题解决
- ✅ 最佳实践

掌握这些内容后，你将能够在 Vue3 项目中充分利用 TypeScript 的类型系统，提升代码质量和开发效率。

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v2.0**
