# 表单处理与验证

## 表单处理与验证

> **学习目标**：掌握Next.js中的表单处理和验证，构建健壮的表单系统
> **核心内容**：Server Actions表单、客户端验证、Zod集成、实战案例

### 表单系统概述

#### Next.js表单处理流程

```
┌─────────────────────────────────────────────────────────────┐
│              Next.js 表单处理流程                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 客户端输入                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • 用户填写表单                                      │   │
│  │  • 客户端实时验证                                    │   │
│  │  • 提交表单                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│              ↓                                               │
│  2. Server Actions                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • 接收FormData                                      │   │
│  │  • 服务端验证（Zod）                                 │   │
│  │  • 数据库操作                                        │   │
│  │  • 返回结果或错误                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│              ↓                                               │
│  3. UI更新                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • 显示错误消息                                      │   │
│  │  • 或重定向到成功页面                                │   │
│  │  • 或刷新数据（revalidate）                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Server Actions表单

#### 1. 基础表单Action

```typescript
// app/actions/contact.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// 定义验证schema
const ContactSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('无效的邮箱地址'),
  subject: z.string().min(5, '主题至少5个字符'),
  message: z.string().min(10, '消息至少10个字符'),
})

export async function submitContactForm(prevState: any, formData: FormData) {
  // 验证数据
  const validatedFields = ContactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  })

  // 返回验证错误
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: '请检查表单中的错误',
    }
  }

  const { name, email, subject, message } = validatedFields.data

  try {
    // 保存到数据库或发送邮件
    await db.contact.create({
      data: { name, email, subject, message },
    })

    // 返回成功状态
    return {
      success: true,
      message: '消息已发送，我们会尽快回复！',
    }
  } catch (error) {
    return {
      success: false,
      message: '发送失败，请稍后重试',
    }
  }
}
```

#### 2. 使用useFormState

```typescript
// components/ContactForm.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { submitContactForm } from '@/app/actions/contact'
import { ZodErrors } from '@/components/ZodErrors'

const initialState = {
  success: false,
  message: '',
  errors: {},
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? '发送中...' : '发送消息'}
    </button>
  )
}

export default function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {/* 成功消息 */}
      {state.success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          {state.message}
        </div>
      )}

      {/* 全局错误消息 */}
      {!state.success && state.message && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {state.message}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          姓名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-describedby="name-error"
        />
        <ZodErrors errors={state.errors?.name} id="name-error" />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          邮箱 <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-describedby="email-error"
        />
        <ZodErrors errors={state.errors?.email} id="email-error" />
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          主题 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-describedby="subject-error"
        />
        <ZodErrors errors={state.errors?.subject} id="subject-error" />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          消息 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-describedby="message-error"
        />
        <ZodErrors errors={state.errors?.message} id="message-error" />
      </div>

      <SubmitButton />
    </form>
  )
}
```

### 客户端验证

#### 1. 实时验证

```typescript
// components/ValidatedInput.tsx
'use client'

import { useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'

interface ValidatedInputProps {
  name: string
  label: string
  type?: string
  required?: boolean
  validate?: (value: string) => string | null
}

export function ValidatedInput({
  name,
  label,
  type = 'text',
  required = false,
  validate,
}: ValidatedInputProps) {
  const { pending } = useFormStatus()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (touched && validate) {
      setError(validate(value))
    }
  }, [value, touched, validate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    if (touched) {
      setError(validate ? validate(e.target.value) : null)
    }
  }

  const handleBlur = () => {
    setTouched(true)
    if (validate) {
      setError(validate(value))
    }
  }

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={pending}
        required={required}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        aria-describedby={`${name}-error`}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
```

#### 2. 使用示例

```typescript
// components/SignupForm.tsx
'use client'

import { ValidatedInput } from './ValidatedInput'
import { useFormState } from 'react-dom'
import { signup } from '@/app/actions/auth'

const validators = {
  name: (value: string) => {
    if (value.length < 2) return '姓名至少2个字符'
    if (value.length > 50) return '姓名最多50个字符'
    return null
  },
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return '无效的邮箱地址'
    return null
  },
  password: (value: string) => {
    if (value.length < 8) return '密码至少8个字符'
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return '密码必须包含大小写字母和数字'
    }
    return null
  },
}

export default function SignupForm() {
  const [state, formAction] = useFormState(signup, null)

  return (
    <form action={formAction} className="space-y-6">
      <ValidatedInput
        name="name"
        label="姓名"
        validate={validators.name}
        required
      />

      <ValidatedInput
        name="email"
        label="邮箱"
        type="email"
        validate={validators.email}
        required
      />

      <ValidatedInput
        name="password"
        label="密码"
        type="password"
        validate={validators.password}
        required
      />

      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg"
      >
        注册
      </button>
    </form>
  )
}
```

### Zod集成

#### 1. 定义Schema

```typescript
// lib/validations/auth.ts
import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
  remember: z.boolean().optional(),
})

export const RegisterSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').max(50, '姓名最多50个字符'),
  email: z.string().email('无效的邮箱地址'),
  password: z
    .string()
    .min(8, '密码至少8个字符')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      '密码必须包含大小写字母和数字'
    ),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
})

export const ProfileSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').max(50, '姓名最多50个字符'),
  email: z.string().email('无效的邮箱地址'),
  bio: z.string().max(500, '简介最多500个字符').optional(),
  avatar: z.string().url('无效的图片URL').optional(),
  website: z.string().url('无效的网站URL').optional().or(z.literal('')),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type ProfileInput = z.infer<typeof ProfileSchema>
```

#### 2. 在Server Actions中使用

```typescript
// app/actions/user.ts
'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ProfileSchema } from '@/lib/validations/auth'

export async function updateProfile(prevState: any, formData: FormData) {
  // 验证
  const validatedFields = ProfileSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    bio: formData.get('bio') || undefined,
    avatar: formData.get('avatar') || undefined,
    website: formData.get('website') || '',
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: '请检查表单中的错误',
    }
  }

  const { name, email, bio, avatar, website } = validatedFields.data

  try {
    // 更新数据库
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        bio,
        avatar,
        website,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        website: true,
      },
    })

    revalidatePath('/profile')
    revalidatePath('/settings')

    return {
      success: true,
      user: updatedUser,
      message: '个人资料已更新',
    }
  } catch (error) {
    return {
      success: false,
      message: '更新失败，请稍后重试',
    }
  }
}
```

### 实战案例：完整表单系统

创建一个包含注册、登录、个人资料更新的完整表单系统。

#### 1. 多步骤表单

```typescript
// components/MultiStepForm.tsx
'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'

interface Step {
  id: string
  title: string
  component: React.ComponentType
}

interface MultiStepFormProps {
  steps: Step[]
  finalAction: (formData: FormData) => Promise<any>
}

export function MultiStepForm({ steps, finalAction }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>()
  const [state, formAction] = useFormState(finalAction, null)

  const handleNext = (data: FormData) => {
    setFormData(data)
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const CurrentComponent = steps[currentStep].component

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center text-sm text-gray-600">
          {steps[currentStep].title}
        </div>
      </div>

      {/* Form */}
      {currentStep < steps.length - 1 ? (
        <CurrentComponent onNext={handleNext} />
      ) : (
        <form action={formAction}>
          {formData && [...formData.entries()].map(([key, value]) => (
            <input key={key} name={key} value={value as string} type="hidden" />
          ))}
          <CurrentComponent onNext={() => {}} />
          <button type="submit">提交</button>
        </form>
      )}

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
        >
          上一步
        </button>
        {currentStep < steps.length - 1 && (
          <button
            onClick={() => {
              const form = document.querySelector('form') as HTMLFormElement
              if (form) form.requestSubmit()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            下一步
          </button>
        )}
      </div>
    </div>
  )
}
```

#### 2. 动态表单

```typescript
// components/DynamicForm.tsx
'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'

interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox'
  options?: { value: string; label: string }[]
  required?: boolean
  validation?: (value: any) => string | null
}

interface DynamicFormProps {
  fields: FieldConfig[]
  action: (formData: FormData) => Promise<any>
}

export function DynamicForm({ fields, action }: DynamicFormProps) {
  const [state, formAction] = useFormState(action, null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (field: FieldConfig, value: any) => {
    if (field.required && !value) {
      return `${field.label}是必填的`
    }
    if (field.validation) {
      return field.validation(value)
    }
    return null
  }

  const handleChange = (field: FieldConfig, value: any) => {
    const error = validateField(field, value)
    setErrors(prev => ({
      ...prev,
      [field.name]: error || '',
    }))
  }

  const renderField = (field: FieldConfig) => {
    const error = errors[field.name]

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            key={field.name}
            name={field.name}
            required={field.required}
            onChange={(e) => handleChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        )

      case 'select':
        return (
          <select
            key={field.name}
            name={field.name}
            required={field.required}
            onChange={(e) => handleChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <input
            key={field.name}
            type="checkbox"
            name={field.name}
            onChange={(e) => handleChange(field, e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
        )

      default:
        return (
          <input
            key={field.name}
            type={field.type}
            name={field.name}
            required={field.required}
            onChange={(e) => handleChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        )
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {fields.map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}

      {state?.message && (
        <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium"
      >
        提交
      </button>
    </form>
  )
}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| Server Actions表单 | useFormState、FormData | 掌握基础用法 |
| 客户端验证 | 实时验证、自定义验证 | 能够实现 |
| Zod集成 | Schema定义、服务端验证 | 熟练使用 |
| 高级表单 | 多步骤、动态表单 | 能够应用 |

---

**下一步学习**：建议继续学习[错误处理与加载状态](./chapter-95)了解错误处理系统。
