# ：React Hook Form表单管理

## React Hook Form 简介

### 为什么选择 React Hook Form？

表单处理是 React 应用中最复杂的任务之一，React Hook Form (RHF) 提供了优秀的解决方案：

| 特性 | React Hook Form | Formik + Yup |
|------|----------------|--------------|
| 性能 | ⭐⭐⭐⭐⭐ 最少重渲染 | ⭐⭐⭐ 较多重渲染 |
| 包大小 | ~9KB | ~13KB + Yup |
| 学习曲线 | ⭐⭐ 简单 | ⭐⭐⭐ 中等 |
| 代码量 | 少 | 多 |
| 验证 | 内置 + Zod/Yup | 需 Yup |
| TypeScript | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 良好 |

### 安装 React Hook Form

```bash
# 基础安装
npm install react-hook-form

# 安装 Zod 验证库（推荐）
npm install zod @hookform/resolvers

# 或安装 Yup 验证库
npm install yup @hookform/resolvers
```

## 基础使用

### 最简单的表单

```tsx
import { useForm } from 'react-hook-form'

// ❌ 使用受控组件（繁琐）
const TraditionalForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
      />
      <input
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      <button type="submit">提交</button>
    </form>
  )
}

// ✅ 使用 React Hook Form（简洁）
interface FormData {
  firstName: string
  lastName: string
  email: string
}

const RHFForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: ''
    }
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('firstName', { required: '名字是必填的' })}
        placeholder="名"
      />
      {errors.firstName && <span>{errors.firstName.message}</span>}

      <input
        {...register('lastName', { required: '姓氏是必填的' })}
        placeholder="姓"
      />
      {errors.lastName && <span>{errors.lastName.message}</span>}

      <input
        {...register('email', {
          required: '邮箱是必填的',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: '邮箱格式不正确'
          }
        })}
        placeholder="邮箱"
      />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">提交</button>
    </form>
  )
}
```

### register 选项

```tsx
const { register } = useForm()

// ✅ 必填验证
<input {...register('name', { required: true })} />
<input {...register('name', { required: '名字是必填的' })} />

// ✅ 最小/最大长度
<input {...register('password', {
  minLength: { value: 8, message: '密码至少8位' },
  maxLength: { value: 20, message: '密码最多20位' }
})} />

// ✅ 最小/最大值
<input
  type="number"
  {...register('age', {
    min: { value: 18, message: '年龄必须大于18岁' },
    max: { value: 100, message: '年龄必须小于100岁' }
  })}
/>

// ✅ 正则验证
<input {...register('phone', {
  pattern: {
    value: /^1[3-9]\d{9}$/,
    message: '手机号格式不正确'
  }
})} />

// ✅ 自定义验证
<input {...register('username', {
  validate: {
    notAdmin: (value) => value !== 'admin' || '不能使用 admin 作为用户名',
    available: async (value) => {
      const response = await fetch(`/api/check-username?username=${value}`)
      return response.ok || '用户名已被占用'
    }
  }
})} />

// ✅ 多个验证规则
<input {...register('email', {
  required: '邮箱是必填的',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: '邮箱格式不正确'
  },
  validate: (value) => {
    return value.endsWith('@example.com') || '只支持 example.com 邮箱'
  }
})} />
```

## 表单验证

### 使用 Zod 验证（推荐）

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ✅ 定义验证 schema
const userSchema = z.object({
  firstName: z.string()
    .min(2, '名字至少2个字符')
    .max(50, '名字最多50个字符'),
  lastName: z.string()
    .min(2, '姓氏至少2个字符')
    .max(50, '姓氏最多50个字符'),
  email: z.string()
    .email('邮箱格式不正确'),
  age: z.number()
    .min(18, '年龄必须大于18岁')
    .max(100, '年龄必须小于100岁'),
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '手机号格式不正确')
    .optional(),
  country: z.enum(['CN', 'US', 'UK'], {
    errorMap: () => ({ message: '请选择有效的国家' })
  })
})

type UserFormData = z.infer<typeof userSchema>

// ✅ 使用 schema
const UserForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: 18,
      country: 'CN'
    }
  })

  const onSubmit = async (data: UserFormData) => {
    try {
      await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      alert('提交成功！')
    } catch (error) {
      alert('提交失败！')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* firstName */}
      <div>
        <label>名字</label>
        <input {...register('firstName')} />
        {errors.firstName && (
          <span className="error">{errors.firstName.message}</span>
        )}
      </div>

      {/* lastName */}
      <div>
        <label>姓氏</label>
        <input {...register('lastName')} />
        {errors.lastName && (
          <span className="error">{errors.lastName.message}</span>
        )}
      </div>

      {/* email */}
      <div>
        <label>邮箱</label>
        <input type="email" {...register('email')} />
        {errors.email && (
          <span className="error">{errors.email.message}</span>
        )}
      </div>

      {/* age */}
      <div>
        <label>年龄</label>
        <input type="number" {...register('age', { valueAsNumber: true })} />
        {errors.age && (
          <span className="error">{errors.age.message}</span>
        )}
      </div>

      {/* phone (optional) */}
      <div>
        <label>手机号（可选）</label>
        <input {...register('phone')} />
        {errors.phone && (
          <span className="error">{errors.phone.message}</span>
        )}
      </div>

      {/* country */}
      <div>
        <label>国家</label>
        <select {...register('country')}>
          <option value="CN">中国</option>
          <option value="US">美国</option>
          <option value="UK">英国</option>
        </select>
        {errors.country && (
          <span className="error">{errors.country.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '提交'}
      </button>
    </form>
  )
}
```

### 复杂验证场景

```tsx
import { z } from 'zod'

// ✅ 条件验证
const conditionalSchema = z.object({
  hasAccount: z.boolean(),
  email: z.string().optional(),
  password: z.string().optional()
}).refine(
  (data) => !data.hasAccount || (data.email && data.password),
  {
    message: '登录时必须填写邮箱和密码',
    path: ['email']
  }
)

// ✅ 交叉验证（密码确认）
const passwordSchema = z.object({
  password: z.string().min(8, '密码至少8位'),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次密码不一致',
    path: ['confirmPassword']
  }
)

// ✅ 异步验证
const asyncSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .refine(
      async (username) => {
        const response = await fetch(`/api/check-username?username=${username}`)
        return response.ok
      },
      { message: '用户名已被占用' }
    )
})

// ✅ 自定义错误消息
const customErrorSchema = z.object({
  age: z.number({
    required_error: '年龄是必填的',
    invalid_type_error: '年龄必须是数字'
  }).min(18, {
    message: '年龄必须大于18岁'
  })
})
```

## 动态表单和字段数组

### useFieldArray 基础

```tsx
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ✅ 字段数组 schema
const todoSchema = z.object({
  todos: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, '待办事项不能为空'),
    completed: z.boolean()
  }))
})

type TodoFormData = z.infer<typeof todoSchema>

const TodoForm = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      todos: [
        { id: '1', title: '学习 React', completed: false },
        { id: '2', title: '写代码', completed: false }
      ]
    }
  })

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'todos'
  })

  const onSubmit = (data: TodoFormData) => {
    console.log(data)
  }

  const addTodo = () => {
    append({
      id: Date.now().toString(),
      title: '',
      completed: false
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="todo-list">
        {fields.map((field, index) => (
          <div key={field.id} className="todo-item">
            <input
              type="checkbox"
              {...register(`todos.${index}.completed`)}
            />

            <input
              {...register(`todos.${index}.title`)}
              placeholder="待办事项"
            />
            {errors.todos?.[index]?.title && (
              <span className="error">
                {errors.todos[index]?.title?.message}
              </span>
            )}

            <button
              type="button"
              onClick={() => remove(index)}
              className="remove-btn"
            >
              删除
            </button>
          </div>
        ))}
      </div>

      <button type="button" onClick={addTodo}>
        + 添加待办事项
      </button>

      <button type="submit">提交</button>
    </form>
  )
}
```

### 嵌套字段数组

```tsx
import { useForm, useFieldArray } from 'react-hook-form'

interface Address {
  street: string
  city: string
  country: string
}

interface User {
  name: string
  addresses: Address[]
}

const NestedForm = () => {
  const { register, control, handleSubmit } = useForm<User>({
    defaultValues: {
      name: '',
      addresses: [{ street: '', city: '', country: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses'
  })

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('name')} placeholder="姓名" />

      {fields.map((field, index) => (
        <div key={field.id} className="address-item">
          <h3>地址 {index + 1}</h3>

          <input
            {...register(`addresses.${index}.street`)}
            placeholder="街道"
          />

          <input
            {...register(`addresses.${index}.city`)}
            placeholder="城市"
          />

          <input
            {...register(`addresses.${index}.country`)}
            placeholder="国家"
          />

          {fields.length > 1 && (
            <button type="button" onClick={() => remove(index)}>
              删除地址
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ street: '', city: '', country: '' })}
      >
        + 添加地址
      </button>

      <button type="submit">提交</button>
    </form>
  )
}
```

## 与UI库集成

### Material-UI 集成

```tsx
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

const schema = z.object({
  name: z.string().min(2, '名字至少2个字符'),
  email: z.string().email('邮箱格式不正确'),
  age: z.number().min(18),
  subscribe: z.boolean(),
  country: z.string()
})

const MUIForm = () => {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      age: 18,
      subscribe: false,
      country: 'CN'
    }
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* TextField */}
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="姓名"
            error={!!error}
            helperText={error?.message}
            fullWidth
            margin="normal"
          />
        )}
      />

      {/* TextField with type */}
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            type="email"
            label="邮箱"
            error={!!error}
            helperText={error?.message}
            fullWidth
            margin="normal"
          />
        )}
      />

      {/* TextField with number */}
      <Controller
        name="age"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            type="number"
            label="年龄"
            error={!!error}
            helperText={error?.message}
            fullWidth
            margin="normal"
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        )}
      />

      {/* Checkbox */}
      <Controller
        name="subscribe"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox {...field} checked={field.value} />}
            label="订阅邮件"
          />
        )}
      />

      {/* Select */}
      <Controller
        name="country"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            select
            label="国家"
            error={!!error}
            helperText={error?.message}
            fullWidth
            margin="normal"
          >
            <MenuItem value="CN">中国</MenuItem>
            <MenuItem value="US">美国</MenuItem>
            <MenuItem value="UK">英国</MenuItem>
          </TextField>
        )}
      />

      <button type="submit">提交</button>
    </form>
  )
}
```

### Ant Design 集成

```tsx
import { useForm, Controller } from 'react-hook-form'
import { Form, Input, InputNumber, Checkbox, Select, Button } from 'antd'

const AntdForm = () => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: '',
      email: '',
      age: 18,
      subscribe: false,
      country: 'CN'
    }
  })

  return (
    <Form onFinish={handleSubmit(data => console.log(data))}>
      <Form.Item label="姓名">
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item label="邮箱">
        <Controller
          name="email"
          control={control}
          render={({ field }) => <Input {...field} type="email" />}
        />
      </Form.Item>

      <Form.Item label="年龄">
        <Controller
          name="age"
          control={control}
          render={({ field }) => <InputNumber {...field} min={18} />}
        />
      </Form.Item>

      <Form.Item>
        <Controller
          name="subscribe"
          control={control}
          render={({ field }) => (
            <Checkbox {...field} checked={field.value}>
              订阅邮件
            </Checkbox>
          )}
        />
      </Form.Item>

      <Form.Item label="国家">
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <Select {...field}>
              <Select.Option value="CN">中国</Select.Option>
              <Select.Option value="US">美国</Select.Option>
              <Select.Option value="UK">英国</Select.Option>
            </Select>
          )}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  )
}
```

## 实战案例：完整的用户注册表单

```tsx
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ==================== Schema 定义 ====================
const registerSchema = z.object({
  // 基本信息
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),

  email: z.string()
    .email('邮箱格式不正确'),

  password: z.string()
    .min(8, '密码至少8位')
    .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字'),

  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次密码不一致',
    path: ['confirmPassword']
  }
).and(z.object({
  // 个人信息
  firstName: z.string().min(2, '名字至少2个字符'),
  lastName: z.string().min(2, '姓氏至少2个字符'),
  age: z.number()
    .min(18, '年龄必须大于18岁')
    .max(100, '年龄必须小于100岁'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: '请选择性别'
  }),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),

  // 地址信息
  country: z.string().min(1, '请选择国家'),
  province: z.string().min(1, '请选择省份'),
  city: z.string().min(1, '请选择城市'),
  address: z.string().min(5, '详细地址至少5个字符'),
  zipCode: z.string().regex(/^\d{6}$/, '邮编格式不正确'),

  // 其他信息
  interests: z.array(z.string()).min(1, '请至少选择一个兴趣'),
  bio: z.string().max(500, '简介最多500个字符').optional(),
  terms: z.boolean().refine(val => val === true, {
    message: '必须同意服务条款'
  })
}))

type RegisterFormData = z.infer<typeof registerSchema>

// ==================== 组件 ====================
const RegisterForm = () => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: {
      errors,
      isSubmitting,
      isValid,
      isDirty
    }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange', // 实时验证
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      age: 18,
      gender: 'male',
      phone: '',
      country: '',
      province: '',
      city: '',
      address: '',
      zipCode: '',
      interests: [],
      bio: '',
      terms: false
    }
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('注册失败')
      }

      alert('注册成功！')
    } catch (error) {
      alert('注册失败，请稍后重试')
    }
  }

  return (
    <div className="register-container">
      <div className="register-form">
        <h1>创建账户</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* 步骤1：账户信息 */}
          <section className="form-section">
            <h2>账户信息</h2>

            <div className="form-group">
              <label>用户名</label>
              <input
                {...register('username')}
                placeholder="3-20个字符，只能包含字母、数字和下划线"
              />
              {errors.username && (
                <span className="error">{errors.username.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>邮箱</label>
              <input
                type="email"
                {...register('email')}
                placeholder="your@email.com"
              />
              {errors.email && (
                <span className="error">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>密码</label>
              <input
                type="password"
                {...register('password')}
                placeholder="至少8位，包含大小写字母和数字"
              />
              {errors.password && (
                <span className="error">{errors.password.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>确认密码</label>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="再次输入密码"
              />
              {errors.confirmPassword && (
                <span className="error">{errors.confirmPassword.message}</span>
              )}
            </div>
          </section>

          {/* 步骤2：个人信息 */}
          <section className="form-section">
            <h2>个人信息</h2>

            <div className="form-row">
              <div className="form-group">
                <label>名字</label>
                <input {...register('firstName')} />
                {errors.firstName && (
                  <span className="error">{errors.firstName.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>姓氏</label>
                <input {...register('lastName')} />
                {errors.lastName && (
                  <span className="error">{errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>年龄</label>
                <input
                  type="number"
                  {...register('age', { valueAsNumber: true })}
                />
                {errors.age && (
                  <span className="error">{errors.age.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>性别</label>
                <select {...register('gender')}>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </select>
                {errors.gender && (
                  <span className="error">{errors.gender.message}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>手机号</label>
              <input {...register('phone')} placeholder="请输入手机号" />
              {errors.phone && (
                <span className="error">{errors.phone.message}</span>
              )}
            </div>
          </section>

          {/* 步骤3：地址信息 */}
          <section className="form-section">
            <h2>地址信息</h2>

            <div className="form-group">
              <label>国家</label>
              <select {...register('country')}>
                <option value="">请选择</option>
                <option value="CN">中国</option>
                <option value="US">美国</option>
                <option value="UK">英国</option>
              </select>
              {errors.country && (
                <span className="error">{errors.country.message}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>省份</label>
                <input {...register('province')} />
                {errors.province && (
                  <span className="error">{errors.province.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>城市</label>
                <input {...register('city')} />
                {errors.city && (
                  <span className="error">{errors.city.message}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>详细地址</label>
              <textarea
                {...register('address')}
                rows={3}
                placeholder="街道、楼栋、门牌号等"
              />
              {errors.address && (
                <span className="error">{errors.address.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>邮政编码</label>
              <input {...register('zipCode')} />
              {errors.zipCode && (
                <span className="error">{errors.zipCode.message}</span>
              )}
            </div>
          </section>

          {/* 步骤4：其他信息 */}
          <section className="form-section">
            <h2>其他信息</h2>

            <div className="form-group">
              <label>兴趣爱好（多选）</label>
              <div className="checkbox-group">
                {['编程', '阅读', '运动', '音乐', '旅行', '摄影'].map(interest => (
                  <label key={interest} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={interest}
                      {...register('interests')}
                    />
                    {interest}
                  </label>
                ))}
              </div>
              {errors.interests && (
                <span className="error">{errors.interests.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>个人简介（可选）</label>
              <textarea
                {...register('bio')}
                rows={4}
                placeholder="介绍一下你自己..."
              />
              {errors.bio && (
                <span className="error">{errors.bio.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register('terms')}
                />
                我已阅读并同意服务条款和隐私政策
              </label>
              {errors.terms && (
                <span className="error">{errors.terms.message}</span>
              )}
            </div>
          </section>

          {/* 提交按钮 */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? '注册中...' : '注册账户'}
            </button>
          </div>

          <p className="form-footer">
            已有账户？ <a href="/login">立即登录</a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm
```

**配套样式：**

```css
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-form {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  padding: 40px;
}

.register-form h1 {
  text-align: center;
  color: #333;
  margin: 0 0 40px 0;
  font-size: 32px;
}

.form-section {
  margin-bottom: 40px;
}

.form-section h2 {
  font-size: 20px;
  color: #667eea;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group .error {
  display: block;
  margin-top: 6px;
  color: #f44336;
  font-size: 14px;
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #f44336;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: #f5f5f5;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.form-actions {
  margin-top: 40px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.form-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.form-footer a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-form {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .checkbox-group {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## React Hook Form 最佳实践

### 1. 性能优化

```tsx
// ✅ 使用 mode: 'onChange' 实时验证
const { control } = useForm({
  mode: 'onChange'
})

// ✅ 使用 shouldUnregister 清理未挂载的字段
const { control } = useForm({
  shouldUnregister: true // 默认为 false
})

// ✅ 避免在渲染中创建默认值
// ❌ 错误
const Form = () => {
  const { control } = useForm({
    defaultValues: {
      name: computeExpensiveValue() // 每次渲染都执行
    }
  })
}

// ✅ 正确
const Form = () => {
  const defaultValues = useMemo(() => ({
    name: computeExpensiveValue()
  }), [])

  const { control } = useForm({
    defaultValues
  })
}
```

### 2. 错误处理

```tsx
// ✅ 统一的错误显示组件
const ErrorMessage = ({ errors, name }: { errors: any; name: string }) => {
  const error = errors[name]
  return error ? <span className="error">{error.message}</span> : null
}

// 使用
<input {...register('name')} />
<ErrorMessage errors={errors} name="name" />
```

### 3. 表单状态管理

```tsx
// ✅ 监听表单变化
const { watch } = useForm()

useEffect(() => {
  const subscription = watch((value, { name, type }) => {
    console.log('值变化：', value, '字段：', name, '类型：', type)
  })

  return () => subscription.unsubscribe()
}, [watch])
```

## 总结

本章我们学习了：

✅ React Hook Form 的基础使用和优势
✅ 表单验证（内置验证、Zod schema、Yup）
✅ 动态表单和字段数组（useFieldArray）
✅ 与 UI 库集成（Material-UI、Ant Design）
✅ 实战案例：完整的用户注册表单
✅ React Hook Form 最佳实践和性能优化

**React Hook Form vs 其他方案：**

| 特性 | React Hook Form | Formik | 受控组件 |
|------|----------------|--------|---------|
| 性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 代码量 | 少 | 中等 | 多 |
| 学习曲线 | ⭐⭐ 简单 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 复杂 |
| 重渲染 | 最少 | 较少 | 最多 |
| 验证 | 内置 + Zod/Yup | 需要 Yup | 手动 |

**恭喜你完成了 React 生态系统模块的学习！**

你已经掌握了：
- 第63章：React Router 6+ 路由管理
- 第64章：Zustand 状态管理
- 第65章：Jotai 与 Recoil 原子化状态
- 第66章：TanStack Query 服务端状态
- 第67章：React Hook Form 表单管理

现在你已经具备了构建企业级 React 应用的全部知识！继续实践和探索，你将成为一名出色的 React 开发者。
