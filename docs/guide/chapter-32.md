# 表单验证与数据校验
## # 4.8 表单验证与数据校验
## 表单验证与数据校验

> **学习目标**：掌握前端表单验证与数据校验技术
> **核心内容**：VeeValidate、Zod、自定义验证规则、表单状态管理

### VeeValidate 完全指南

#### 安装 VeeValidate

```bash
# 安装 VeeValidate
npm install vee-validate

# 安装验证规则集
npm install @vee-validate/rules

# 安装 Yup（可选，用于定义schema）
npm install yup
```

#### 基础配置

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { Field, Form, ErrorMessage, configure } from 'vee-validate'
import * as rules from '@vee-validate/rules'
import { localize, setLocale } from '@vee-validate/i18n'
import zh_CN from '@vee-validate/i18n/dist/locale/zh_CN.json'

// 注册所有规则
Object.keys(rules).forEach(rule => {
  configure({
    validateOnBlur: true,
    validateOnChange: true,
    validateOnInput: false,
    validateOnModelUpdate: true
  })
})

// 设置中文错误提示
localize('zh_CN', zh_CN)
setLocale('zh_CN')

const app = createApp(App)

// 全局注册组件
app.component('VField', Field)
app.component('VForm', Form)
app.component('VErrorMessage', ErrorMessage)

app.mount('#app')
```

#### 基础表单验证

```vue
<template>
  <VForm @submit="onSubmit" v-slot="{ errors }">
    <div class="form-group">
      <label>用户名</label>
      <VField
        name="username"
        rules="required|min:3|max:20"
        v-model="form.username"
      />
      <VErrorMessage name="username" as="div" class="error" />
    </div>

    <div class="form-group">
      <label>邮箱</label>
      <VField
        name="email"
        rules="required|email"
        v-model="form.email"
      />
      <VErrorMessage name="email" as="div" class="error" />
    </div>

    <div class="form-group">
      <label>年龄</label>
      <VField
        name="age"
        rules="required|integer|min_value:18|max_value:120"
        v-model="form.age"
        type="number"
      />
      <VErrorMessage name="age" as="div" class="error" />
    </div>

    <button type="submit">提交</button>
  </VForm>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  username: '',
  email: '',
  age: ''
})

const onSubmit = (values: any) => {
  console.log('表单提交:', values)
  alert('提交成功！')
}
</script>
```

#### 自定义验证规则

```typescript
// validators/customRules.ts
import { defineRule } from 'vee-validate'

// 手机号验证
defineRule('phone', (value: string) => {
  if (!value) return true
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(value) || '请输入正确的手机号'
})

// 身份证验证
defineRule('idCard', (value: string) => {
  if (!value) return true
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  return idCardRegex.test(value) || '请输入正确的身份证号'
})

// 密码强度
defineRule('strongPassword', (value: string) => {
  if (!value) return true
  // 至少8位，包含大小写字母和数字
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return strongPasswordRegex.test(value) || '密码至少8位，包含大小写字母和数字'
})

// 确认密码
defineRule('confirmed', (value: string, [target]: any) => {
  return value === target || '两次输入的密码不一致'
})

// 自定义异步规则
defineRule('uniqueUsername', async (value: string) => {
  if (!value) return true
  // 模拟API调用
  const exists = await checkUsernameExists(value)
  return !exists || '用户名已存在'
})

async function checkUsernameExists(username: string): Promise<boolean> {
  // 实际项目中调用API
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(username === 'admin') // 模拟admin已存在
    }, 500)
  })
}
```

```typescript
// main.ts - 注册自定义规则
import './validators/customRules'
```

```vue
<!-- 使用自定义规则 -->
<template>
  <VForm @submit="onSubmit">
    <div class="form-group">
      <label>手机号</label>
      <VField
        name="phone"
        rules="required|phone"
        v-model="form.phone"
      />
      <VErrorMessage name="phone" as="div" class="error" />
    </div>

    <div class="form-group">
      <label>密码</label>
      <VField
        name="password"
        rules="required|strongPassword"
        v-model="form.password"
        type="password"
      />
      <VErrorMessage name="password" as="div" class="error" />
    </div>

    <div class="form-group">
      <label>确认密码</label>
      <VField
        name="confirmPassword"
        :rules="`required|confirmed:${form.password}`"
        v-model="form.confirmPassword"
        type="password"
      />
      <VErrorMessage name="confirmPassword" as="div" class="error" />
    </div>

    <button type="submit">注册</button>
  </VForm>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  phone: '',
  password: '',
  confirmPassword: ''
})

const onSubmit = (values: any) => {
  console.log('注册成功:', values)
}
</script>
```

#### 使用 Yup Schema

```typescript
// schemas/userSchema.ts
import * as yup from 'yup'

export const registerSchema = yup.object({
  username: yup
    .string()
    .required('用户名不能为空')
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .matches(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),

  email: yup
    .string()
    .required('邮箱不能为空')
    .email('邮箱格式不正确'),

  password: yup
    .string()
    .required('密码不能为空')
    .min(8, '密码至少8位')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      '密码必须包含大小写字母和数字'
    ),

  confirmPassword: yup
    .string()
    .required('请确认密码')
    .oneOf([yup.ref('password')], '两次密码不一致'),

  age: yup
    .number()
    .required('年龄不能为空')
    .integer('年龄必须是整数')
    .min(18, '年龄必须大于18岁')
    .max(120, '年龄必须小于120岁'),

  phone: yup
    .string()
    .required('手机号不能为空')
    .matches(/^1[3-9]\d{9}$/, '手机号格式不正确'),

  agree: yup
    .boolean()
    .required('必须同意用户协议')
    .oneOf([true], '必须同意用户协议')
})

export const loginSchema = yup.object({
  email: yup.string().required('邮箱不能为空').email('邮箱格式不正确'),
  password: yup.string().required('密码不能为空'),
  remember: yup.boolean()
})
```

```vue
<!-- 使用Yup Schema -->
<template>
  <VForm
    @submit="onSubmit"
    :validation-schema="registerSchema"
    v-slot="{ errors, isSubmitting }"
  >
    <div class="form-group">
      <label>用户名</label>
      <VField name="username" v-model="form.username" />
      <VErrorMessage name="username" as="div" class="error" />
    </div>

    <div class="form-group">
      <label>邮箱</label>
      <VField name="email" type="email" v-model="form.email" />
      <VErrorMessage name="email" as="div" class="error" />
    </div>

    <div class="form-group">
      <label>密码</label>
      <VField name="password" type="password" v-model="form.password" />
      <VErrorMessage name="password" as="div" class="error" />
    </div>

    <div class="form-group">
      <label>确认密码</label>
      <VField name="confirmPassword" type="password" v-model="form.confirmPassword" />
      <VErrorMessage name="confirmPassword" as="div" class="error" />
    </div>

    <div class="form-group">
      <label>手机号</label>
      <VField name="phone" v-model="form.phone" />
      <VErrorMessage name="phone" as="div" class="error" />
    </div>

    <div class="form-group">
      <label>年龄</label>
      <VField name="age" type="number" v-model="form.age" />
      <VErrorMessage name="age" as="div" class="error" />
    </div>

    <div class="form-group">
      <VField name="agree" type="checkbox" :value="true" v-model="form.agree" />
      <label>我同意用户协议</label>
      <VErrorMessage name="agree" as="div" class="error" />
    </div>

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? '提交中...' : '注册' }}
    </button>
  </VForm>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { registerSchema } from '@/schemas/userSchema'

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  age: '',
  agree: false
})

const onSubmit = async (values: any) => {
  console.log('提交数据:', values)
  // 发送API请求
}
</script>
```

#### 表单状态管理

```vue
<template>
  <VForm
    @submit="onSubmit"
    :validation-schema="schema"
    v-slot="{ meta, errors, isSubmitting, validate }"
  >
    <div class="form-group">
      <label>用户名</label>
      <VField
        name="username"
        v-model="form.username"
        :validate-on-blur="true"
      />
      <VErrorMessage name="username" as="div" class="error" />
    </div>

    <div class="form-group">
      <label>邮箱</label>
      <VField
        name="email"
        v-model="form.email"
        :validate-on-blur="true"
      />
      <VErrorMessage name="email" as="div" class="error" />
    </div>

    <!-- 显示表单状态 -->
    <div class="form-status">
      <p>表单有效: {{ meta.valid }}</p>
      <p>表单无效: {{ meta.invalid }}</p>
      <p>已修改: {{ meta.dirty }}</p>
      <p>已触碰: {{ meta.touched }}</p>
    </div>

    <button
      type="submit"
      :disabled="!meta.valid || isSubmitting"
    >
      {{ isSubmitting ? '提交中...' : '提交' }}
    </button>

    <button
      type="button"
      @click="validate"
    >
      验证表单
    </button>
  </VForm>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import * as yup from 'yup'

const schema = yup.object({
  username: yup.string().required().min(3),
  email: yup.string().required().email()
})

const form = reactive({
  username: '',
  email: ''
})

const onSubmit = async (values: any, actions: any) => {
  try {
    // 发送API请求
    await submitForm(values)
    actions.resetForm()
  } catch (error) {
    actions.setErrors({
      email: '该邮箱已被注册'
    })
  }
}
</script>
```

#### 动态表单验证

```vue
<template>
  <VForm @submit="onSubmit" v-slot="{ values }">
    <div v-for="(field, index) in dynamicFields" :key="index" class="dynamic-field">
      <VField
        :name="`fields.${index}.value`"
        :rules="field.rules"
        v-model="field.value"
      />
      <VErrorMessage :name="`fields.${index}.value`" as="div" class="error" />
      <button @click="removeField(index)" type="button">删除</button>
    </div>

    <button @click="addField" type="button">添加字段</button>
    <button type="submit">提交</button>

    <pre>{{ values }}</pre>
  </VForm>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface DynamicField {
  value: string
  rules: string
}

const dynamicFields = reactive<DynamicField[]>([
  { value: '', rules: 'required' }
])

const addField = () => {
  dynamicFields.push({ value: '', rules: 'required' })
}

const removeField = (index: number) => {
  dynamicFields.splice(index, 1)
}

const onSubmit = (values: any) => {
  console.log('提交:', values)
}
</script>
```

---

### Zod 数据验证库

#### 安装 Zod

```bash
npm install zod
```

#### Zod 基础用法

```typescript
// schemas/user.ts
import { z } from 'zod'

// 基础类型验证
export const userSchema = z.object({
  // 字符串验证
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '只能包含字母、数字和下划线'),

  // 邮箱验证
  email: z.string()
    .email('邮箱格式不正确')
    .toLowerCase(),

  // 数字验证
  age: z.number()
    .int('年龄必须是整数')
    .min(18, '年龄必须大于18岁')
    .max(120, '年龄必须小于120岁'),

  // 布尔值验证
  isActive: z.boolean(),

  // 枚举验证
  role: z.enum(['user', 'admin', 'moderator']),

  // 可选字段
  bio: z.string().optional(),

  // 可空字段
  middleName: z.string().nullable().optional(),

  // 数组验证
  tags: z.array(z.string()).min(1, '至少一个标签').max(5, '最多5个标签'),

  // 对象验证
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string().regex(/^\d{6}$/, '邮编格式不正确')
  }).optional(),

  // 联合类型
  status: z.union([z.literal('active'), z.literal('inactive'), z.literal('pending')]),

  // 字面量类型
  type: z.literal('user'),

  // 日期验证
  birthDate: z.coerce.date().max(new Date(), '日期不能是未来'),

  // 转换类型
  phone: z.string().transform(val => val.replace(/\D/g, ''))
})

// 使用 schema
type User = z.infer<typeof userSchema>

// 验证数据
function validateUser(data: unknown) {
  return userSchema.parse(data)
}

// 安全验证（返回错误信息）
function validateUserSafe(data: unknown) {
  return userSchema.safeParse(data)
}

// 使用示例
try {
  const user = validateUser({
    username: 'testuser',
    email: 'TEST@EXAMPLE.COM',
    age: 25,
    isActive: true,
    role: 'user',
    tags: ['vue', 'typescript'],
    address: {
      street: '北京市朝阳区',
      city: '北京',
      zipCode: '100000'
    },
    status: 'active',
    type: 'user',
    birthDate: '1998-01-01',
    phone: '138-0013-8000'
  })
  console.log(user.email) // 'test@example.com' (已转换为小写)
  console.log(user.phone) // '13800138000' (已移除横线)
} catch (error) {
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.error(`${err.path.join('.')}: ${err.message}`)
    })
  }
}

// 安全验证示例
const result = validateUserSafe(invalidData)
if (result.success) {
  console.log('验证成功:', result.data)
} else {
  console.error('验证失败:', result.error.errors)
}
```

#### Zod 高级用法

```typescript
// schemas/advanced.ts
import { z } from 'zod'

// 自定义错误消息
export const customErrorSchema = z.object({
  username: z.string({
    required_error: '用户名是必填项',
    invalid_type_error: '用户名必须是字符串'
  }).min(3, { message: '用户名至少3个字符' })
})

// 交叉验证（refine）
export const passwordSchema = z.object({
  password: z.string().min(8, '密码至少8位'),
  confirmPassword: z.string()
}).refine(
  data => data.password === data.confirmPassword,
  {
    message: '两次密码不一致',
    path: ['confirmPassword']
  }
)

// 超级验证（superRefine - 可以添加多个错误）
export const userWithPasswordSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  confirmPassword: z.string()
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '两次密码不一致',
      path: ['confirmPassword']
    })
  }

  if (data.username === data.password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '用户名和密码不能相同',
      path: ['password']
    })
  }
})

// 条件验证
export const conditionalSchema = z.object({
  hasAccount: z.boolean(),
  username: z.string().optional(),
  password: z.string().optional()
}).refine(
  data => {
    if (data.hasAccount) {
      return !!data.username && !!data.password
    }
    return true
  },
  {
    message: '有账户时必须填写用户名和密码',
    path: ['username']
  }
)

// 默认值处理
export const withDefaultsSchema = z.object({
  username: z.string().default('匿名用户'),
  count: z.number().default(0),
  active: z.boolean().default(true),
  tags: z.array(z.string()).default([])
})

// 从已有schema扩展
export const baseUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email()
})

export const adminUserSchema = baseUserSchema.extend({
  permissions: z.array(z.string()),
  adminLevel: z.number().int().min(1).max(10)
})

// 合并schema
export const personalInfoSchema = z.object({
  firstName: z.string(),
  lastName: z.string()
})

export const contactInfoSchema = z.object({
  email: z.string().email(),
  phone: z.string()
})

export const fullUserSchema = personalInfoSchema.merge(contactInfoSchema)

// 懒加载验证（递归类型）
export const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    subcategories: z.array(categorySchema).optional()
  })
)

interface Category {
  id: number
  name: string
  subcategories?: Category[]
}

// async 自定义验证
export const uniqueEmailSchema = z.object({
  email: z.string().email()
}).refine(
  async (email) => {
    // 调用API检查邮箱是否唯一
    const response = await fetch(`/api/check-email?email=${email}`)
    const data = await response.json()
    return data.available
  },
  {
    message: '该邮箱已被注册',
    path: ['email']
  }
)
```

#### Zod + Vue3 组合式函数

```typescript
// composables/useZodForm.ts
import { ref, computed, type Ref } from 'vue'
import { z, type ZodSchema } from 'zod'

interface UseZodFormOptions<T> {
  schema: ZodSchema<T>
  initialValues: T
  onSubmit: (values: T) => Promise<void> | void
}

interface FormFieldError {
  message: string
}

export function useZodForm<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit
}: UseZodFormOptions<T>) {
  const values = ref<T>({ ...initialValues }) as Ref<T>
  const errors = ref<Record<keyof T, FormFieldError>>({} as any)
  const isSubmitting = ref(false)
  const touched = ref<Record<keyof T, boolean>>({} as any)

  // 验证单个字段
  const validateField = async (field: keyof T) => {
    try {
      schema.shape[field].parse(values.value[field])
      delete errors.value[field]
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.value[field] = {
          message: error.errors[0]?.message || '验证失败'
        }
        return false
      }
      return false
    }
  }

  // 验证所有字段
  const validate = async () => {
    try {
      schema.parse(values.value)
      errors.value = {} as any
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<keyof T, FormFieldError> = {} as any
        error.errors.forEach(err => {
          const field = err.path[0] as keyof T
          newErrors[field] = { message: err.message }
        })
        errors.value = newErrors
      }
      return false
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    const isValid = await validate()
    if (!isValid) return false

    isSubmitting.value = true
    try {
      await onSubmit(values.value)
      return true
    } catch (error) {
      console.error('提交失败:', error)
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  // 重置表单
  const reset = () => {
    values.value = { ...initialValues }
    errors.value = {} as any
    touched.value = {} as any
  }

  // 设置字段值
  const setFieldValue = (field: keyof T, value: any) => {
    values.value[field] = value
    touched.value[field] = true
    validateField(field)
  }

  // 表单状态
  const isValid = computed(() => Object.keys(errors.value).length === 0)
  const isDirty = computed(() =>
    Object.keys(touched.value).some(key => touched.value[key as keyof T])
  )

  return {
    values,
    errors,
    isSubmitting,
    touched,
    isValid,
    isDirty,
    validateField,
    validate,
    handleSubmit,
    reset,
    setFieldValue
  }
}
```

```vue
<!-- 使用 useZodForm -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>用户名</label>
      <input
        v-model="values.username"
        @blur="validateField('username')"
      />
      <span v-if="errors.username" class="error">
        {{ errors.username.message }}
      </span>
    </div>

    <div class="form-group">
      <label>邮箱</label>
      <input
        v-model="values.email"
        type="email"
        @blur="validateField('email')"
      />
      <span v-if="errors.email" class="error">
        {{ errors.email.message }}
      </span>
    </div>

    <div class="form-group">
      <label>密码</label>
      <input
        v-model="values.password"
        type="password"
        @blur="validateField('password')"
      />
      <span v-if="errors.password" class="error">
        {{ errors.password.message }}
      </span>
    </div>

    <button
      type="submit"
      :disabled="isSubmitting || !isValid"
    >
      {{ isSubmitting ? '提交中...' : '提交' }}
    </button>

    <button type="button" @click="reset">重置</button>
  </form>
</template>

<script setup lang="ts">
import { useZodForm } from '@/composables/useZodForm'
import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8)
})

const {
  values,
  errors,
  isSubmitting,
  isValid,
  validateField,
  handleSubmit,
  reset
} = useZodForm({
  schema: registerSchema,
  initialValues: {
    username: '',
    email: '',
    password: ''
  },
  onSubmit: async (values) => {
    console.log('提交数据:', values)
    // 发送API请求
    await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(values)
    })
  }
})
</script>
```

---

### 表单状态管理

#### 基础表单状态

```typescript
// composables/useFormState.ts
import { ref, computed, type Ref } from 'vue'

export interface FormState<T> {
  values: Ref<T>
  errors: Ref<Record<keyof T, string>>
  touched: Ref<Record<keyof T, boolean>>
  dirty: Ref<boolean>
  isValid: Ref<boolean>
  isSubmitting: Ref<boolean>
  setFieldValue: (field: keyof T, value: any) => void
  setFieldError: (field: keyof T, error: string) => void
  clearErrors: () => void
  reset: () => void
}

export function useFormState<T extends Record<string, any>>(
  initialValues: T,
  validate?: (values: T) => Record<keyof T, string> | boolean
): FormState<T> {
  const values = ref<T>({ ...initialValues }) as Ref<T>
  const errors = ref<Record<keyof T, string>>({} as any)
  const touched = ref<Record<keyof T, boolean>>({} as any)
  const isSubmitting = ref(false)

  const dirty = computed(() => {
    return Object.keys(touched.value).some(
      key => touched.value[key as keyof T]
    )
  })

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0
  })

  const setFieldValue = (field: keyof T, value: any) => {
    values.value[field] = value
    touched.value[field] = true

    if (validate) {
      const validationErrors = validate(values.value)
      if (typeof validationErrors === 'boolean') {
        if (validationErrors) {
          clearFieldError(field)
        }
      } else {
        if (validationErrors[field]) {
          errors.value[field] = validationErrors[field]
        } else {
          clearFieldError(field)
        }
      }
    }
  }

  const setFieldError = (field: keyof T, error: string) => {
    errors.value[field] = error
  }

  const clearFieldError = (field: keyof T) => {
    delete errors.value[field]
  }

  const clearErrors = () => {
    errors.value = {} as any
  }

  const reset = () => {
    values.value = { ...initialValues }
    errors.value = {} as any
    touched.value = {} as any
    isSubmitting.value = false
  }

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    setFieldValue,
    setFieldError,
    clearErrors,
    reset
  }
}
```

#### 复杂表单状态

```typescript
// composables/useFormBuilder.ts
import { ref, computed, h, type VNode } from 'vue'
import { ElInput, ElSelect, ElDatePicker, ElRadio, ElCheckbox } from 'element-plus'

type FieldType = 'input' | 'textarea' | 'select' | 'date' | 'radio' | 'checkbox' | 'number'

interface FormField {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  rules?: Array<(value: any) => boolean | string>
  defaultValue?: any
  disabled?: boolean
  props?: Record<string, any>
}

export function useFormBuilder(fields: FormField[]) {
  const values = ref<Record<string, any>>({})
  const errors = ref<Record<string, string>>({})

  // 初始化默认值
  fields.forEach(field => {
    values.value[field.name] = field.defaultValue ?? getDefaultValueByType(field.type)
  })

  function getDefaultValueByType(type: FieldType): any {
    switch (type) {
      case 'checkbox':
        return false
      case 'select':
      case 'radio':
        return ''
      case 'date':
        return null
      case 'number':
        return 0
      default:
        return ''
    }
  }

  // 验证单个字段
  async function validateField(field: FormField): Promise<boolean> {
    if (!field.rules) return true

    const value = values.value[field.name]

    for (const rule of field.rules) {
      const result = rule(value)
      if (result === false) {
        errors.value[field.name] = '验证失败'
        return false
      }
      if (typeof result === 'string') {
        errors.value[field.name] = result
        return false
      }
    }

    delete errors.value[field.name]
    return true
  }

  // 验证所有字段
  async function validateAll(): Promise<boolean> {
    let isValid = true

    for (const field of fields) {
      const fieldValid = await validateField(field)
      if (!fieldValid) isValid = false
    }

    return isValid
  }

  // 获取表单数据
  function getValues(): Record<string, any> {
    return { ...values.value }
  }

  // 重置表单
  function reset() {
    fields.forEach(field => {
      values.value[field.name] = field.defaultValue ?? getDefaultValueByType(field.type)
    })
    errors.value = {}
  }

  // 渲染字段
  function renderField(field: FormField): VNode {
    const value = values.value[field.name]
    const error = errors.value[field.name]

    const commonProps = {
      modelValue: value,
      'onUpdate:modelValue': (val: any) => {
        values.value[field.name] = val
        delete errors.value[field.name]
      },
      placeholder: field.placeholder,
      disabled: field.disabled,
      ...field.props
    }

    switch (field.type) {
      case 'textarea':
        return h(ElInput, {
          ...commonProps,
          type: 'textarea',
          rows: 4
        })

      case 'select':
        return h(ElSelect, commonProps, {
          default: () => field.options?.map(option =>
            h('option', { value: option.value }, option.label)
          )
        })

      case 'date':
        return h(ElDatePicker, {
          ...commonProps,
          type: 'date',
          valueFormat: 'YYYY-MM-DD'
        })

      case 'radio':
        return h('div', { class: 'radio-group' },
          field.options?.map(option =>
            h(ElRadio, {
              label: option.value,
              modelValue: value,
              'onUpdate:modelValue': (val: any) => {
                values.value[field.name] = val
              }
            }, () => option.label)
          )
        )

      case 'checkbox':
        return h(ElCheckbox, {
          modelValue: value,
          'onUpdate:modelValue': (val: any) => {
            values.value[field.name] = val
          }
        })

      case 'number':
        return h(ElInput, {
          ...commonProps,
          type: 'number'
        })

      default:
        return h(ElInput, commonProps)
    }
  }

  return {
    values,
    errors,
    validateField,
    validateAll,
    getValues,
    reset,
    renderField
  }
}
```

---

### 复杂表单验证案例

#### 多步骤表单

```vue
<!-- components/MultiStepForm.vue -->
<template>
  <div class="multi-step-form">
    <div class="steps-indicator">
      <div
        v-for="(step, index) in steps"
        :key="index"
        :class="['step', {
          active: currentStep === index,
          completed: currentStep > index
        }]"
      >
        <span class="step-number">{{ index + 1 }}</span>
        <span class="step-label">{{ step.label }}</span>
      </div>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="step-content">
        <component
          :is="steps[currentStep].component"
          v-model:values="formData[steps[currentStep].key]"
          v-model:errors="stepErrors"
        />
      </div>

      <div class="form-actions">
        <button
          v-if="currentStep > 0"
          type="button"
          @click="prevStep"
        >
          上一步
        </button>

        <button
          v-if="currentStep < steps.length - 1"
          type="button"
          @click="nextStep"
        >
          下一步
        </button>

        <button
          v-if="currentStep === steps.length - 1"
          type="submit"
        >
          提交
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, shallowRef } from 'vue'
import BasicInfoStep from './steps/BasicInfoStep.vue'
import ContactInfoStep from './steps/ContactInfoStep.vue'
import ConfirmStep from './steps/ConfirmStep.vue'

interface Step {
  label: string
  component: any
  key: string
}

const steps: Step[] = [
  { label: '基本信息', component: shallowRef(BasicInfoStep), key: 'basic' },
  { label: '联系方式', component: shallowRef(ContactInfoStep), key: 'contact' },
  { label: '确认', component: shallowRef(ConfirmStep), key: 'confirm' }
]

const currentStep = ref(0)
const stepErrors = ref<Record<string, string>>({})

const formData = reactive({
  basic: {
    username: '',
    password: '',
    confirmPassword: ''
  },
  contact: {
    email: '',
    phone: '',
    address: ''
  },
  confirm: {
    agreed: false
  }
})

const nextStep = async () => {
  // 验证当前步骤
  const isValid = await validateCurrentStep()
  if (!isValid) return

  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const validateCurrentStep = async (): Promise<boolean> => {
  // 这里应该调用对应步骤组件的验证方法
  // 简化示例
  stepErrors.value = {}
  return true
}

const handleSubmit = () => {
  console.log('提交表单:', formData)
  // 发送API请求
}
</script>

<style scoped>
.multi-step-form {
  max-width: 600px;
  margin: 0 auto;
}

.steps-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.step.active .step-number {
  background: #42b983;
  color: white;
}

.step.completed .step-number {
  background: #67c23a;
  color: white;
}

.step-label {
  margin-top: 8px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

#### 动态表单字段

```vue
<!-- components/DynamicForm.vue -->
<template>
  <VForm @submit="handleSubmit" :validation-schema="dynamicSchema">
    <div v-for="(field, index) in formFields" :key="field.id" class="dynamic-field">
      <div class="field-header">
        <label>{{ field.label }}</label>
        <button type="button" @click="removeField(index)" class="remove-btn">
          删除
        </button>
      </div>

      <component
        :is="getFieldComponent(field.type)"
        :name="`fields[${index}].value`"
        :label="field.label"
        :options="field.options"
        v-model="field.value"
      />

      <VErrorMessage :name="`fields[${index}].value`" as="div" class="error" />
    </div>

    <div class="form-actions">
      <button type="button" @click="addField">添加字段</button>
      <button type="submit">提交</button>
    </div>

    <pre>{{ formData }}</pre>
  </VForm>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { Field, Form, ErrorMessage } from 'vee-validate'
import TextInput from './fields/TextInput.vue'
import SelectInput from './fields/SelectInput.vue'
import DateInput from './fields/DateInput.vue'
import * as yup from 'yup'

const VForm = Form
const VField = Field
const VErrorMessage = ErrorMessage

interface FormField {
  id: string
  type: 'text' | 'select' | 'date'
  label: string
  value: any
  options?: Array<{ label: string; value: any }>
  rules?: any
}

const formFields = reactive<FormField[]>([
  { id: '1', type: 'text', label: '姓名', value: '', rules: yup.string().required() }
])

// 动态生成Yup Schema
const dynamicSchema = computed(() => {
  const schema: Record<string, any> = {}

  formFields.forEach((field, index) => {
    schema[`fields[${index}].value`] = field.rules || yup.string()
  })

  return yup.object(schema)
})

const formData = computed(() => {
  return formFields.map(field => ({
    label: field.label,
    value: field.value
  }))
})

const addField = () => {
  const newField: FormField = {
    id: Date.now().toString(),
    type: 'text',
    label: `字段${formFields.length + 1}`,
    value: '',
    rules: yup.string().required()
  }
  formFields.push(newField)
}

const removeField = (index: number) => {
  formFields.splice(index, 1)
}

const getFieldComponent = (type: string) => {
  switch (type) {
    case 'select':
      return SelectInput
    case 'date':
      return DateInput
    default:
      return TextInput
  }
}

const handleSubmit = (values: any) => {
  console.log('提交数据:', values)
}
</script>
```

---

### 本章小结

| 验证库 | 特点 | 适用场景 |
|--------|------|----------|
| VeeValidate | 与Vue深度集成，API丰富 | 复杂表单验证 |
| Zod | TypeScript优先，类型推断 | API数据校验 |
| Yup | Schema定义清晰 | 中小型表单 |
| 自定义验证 | 灵活可控 | 特殊业务需求 |

---
