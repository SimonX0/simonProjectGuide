# ：表单处理（受控/非受控）

## 受控组件 vs 非受控组件

在 React 中，表单元素分为两种：**受控组件**和**非受控组件**。

| 特性 | 受控组件 | 非受控组件 |
|------|---------|-----------|
| 数据源 | React State | DOM |
| 更新方式 | setState | ref |
| 实时验证 | ✅ 容易 | ❌ 困难 |
| 代码量 | 较多 | 较少 |
| 适用场景 | 复杂表单、需要验证 | 简单表单 |

## 受控组件

### 基本用法

```tsx
import { useState } from 'react'

const ControlledInput = () => {
  const [value, setValue] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="输入一些文字"
      />
      <p>输入的值：{value}</p>
    </div>
  )
}
```

### 多个表单元素

```tsx
const ControlledForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    gender: 'male',
    subscribe: false
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('表单数据：', formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 文本输入 */}
      <div>
        <label>用户名：</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      {/* 邮箱输入 */}
      <div>
        <label>邮箱：</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      {/* 密码输入 */}
      <div>
        <label>密码：</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      {/* 单选按钮 */}
      <div>
        <label>性别：</label>
        <label>
          <input
            type="radio"
            name="gender"
            value="male"
            checked={formData.gender === 'male'}
            onChange={handleChange}
          />
          男
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="female"
            checked={formData.gender === 'female'}
            onChange={handleChange}
          />
          女
        </label>
      </div>

      {/* 复选框 */}
      <div>
        <label>
          <input
            type="checkbox"
            name="subscribe"
            checked={formData.subscribe}
            onChange={handleChange}
          />
          订阅新闻
        </label>
      </div>

      <button type="submit">提交</button>
    </form>
  )
}
```

### 文本域

```tsx
const TextArea = () => {
  const [message, setMessage] = useState('')

  return (
    <div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入消息..."
        rows={5}
        cols={50}
      />
      <p>字符数：{message.length}</p>
      <pre>{message}</pre>
    </div>
  )
}
```

### 下拉选择

```tsx
const SelectControlled = () => {
  const [selected, setSelected] = useState('apple')

  return (
    <div>
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">请选择...</option>
        <option value="apple">苹果</option>
        <option value="banana">香蕉</option>
        <option value="orange">橙子</option>
      </select>
      <p>选择了：{selected || '无'}</p>
    </div>
  )
}

// 多选下拉
const MultiSelect = () => {
  const [selected, setSelected] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => option.value)
    setSelected(values)
  }

  return (
    <div>
      <select multiple value={selected} onChange={handleChange} size={4}>
        <option value="apple">苹果</option>
        <option value="banana">香蕉</option>
        <option value="orange">橙子</option>
        <option value="mango">芒果</option>
      </select>
      <p>选择了：{selected.join(', ')}</p>
    </div>
  )
}
```

## 非受控组件

### 基本用法（使用 useRef）

```tsx
import { useRef, FormEvent } from 'react'

const UncontrolledInput = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('输入的值：', inputRef.current?.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        ref={inputRef}
        defaultValue="初始值"
      />
      <button type="submit">提交</button>
    </form>
  )
}
```

### 多个非受控组件

```tsx
const UncontrolledForm = () => {
  const usernameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const data = {
      username: usernameRef.current?.value || '',
      email: emailRef.current?.value || '',
      password: passwordRef.current?.value || ''
    }

    console.log('表单数据：', data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        ref={usernameRef}
        defaultValue=""
      />
      <input
        type="email"
        name="email"
        ref={emailRef}
        defaultValue=""
      />
      <input
        type="password"
        name="password"
        ref={passwordRef}
        defaultValue=""
      />
      <button type="submit">提交</button>
    </form>
  )
}
```

### 使用 useFormStatus（React 19）

```tsx
import { useFormStatus } from 'react-dom'

const SubmitButton = () => {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  )
}
```

### 使用 FormData

```tsx
const FormDataExample = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)

    // 获取单个值
    const username = formData.get('username')
    const email = formData.get('email')

    // 获取所有值
    const data = Object.fromEntries(formData.entries())

    console.log('表单数据：', data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" />
      <input type="email" name="email" />
      <button type="submit">提交</button>
    </form>
  )
}
```

## 表单验证

### 实时验证

```tsx
const ValidatedForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: ''
  })

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false
  })

  // 验证规则
  const validate = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value) return '用户名不能为空'
        if (value.length < 3) return '用户名至少3个字符'
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return '只能包含字母、数字和下划线'
        return ''

      case 'email':
        if (!value) return '邮箱不能为空'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '邮箱格式不正确'
        return ''

      case 'password':
        if (!value) return '密码不能为空'
        if (value.length < 6) return '密码至少6个字符'
        if (!/[A-Z]/.test(value)) return '密码必须包含大写字母'
        if (!/[a-z]/.test(value)) return '密码必须包含小写字母'
        if (!/[0-9]/.test(value)) return '密码必须包含数字'
        return ''

      default:
        return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData(prev => ({ ...prev, [name]: value }))

    // 如果已经触碰过该字段，实时验证
    if (touched[name as keyof typeof touched]) {
      setErrors(prev => ({
        ...prev,
        [name]: validate(name, value)
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({
      ...prev,
      [name]: validate(name, value)
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // 标记所有字段为已触碰
    setTouched({
      username: true,
      email: true,
      password: true
    })

    // 验证所有字段
    const newErrors = {
      username: validate('username', formData.username),
      email: validate('email', formData.email),
      password: validate('password', formData.password)
    }

    setErrors(newErrors)

    // 检查是否有错误
    if (Object.values(newErrors).some(error => error)) {
      console.log('表单有错误')
      return
    }

    console.log('提交的数据：', formData)
  }

  return (
    <form onSubmit={handleSubmit} className="validated-form">
      {/* 用户名 */}
      <div className="form-group">
        <label>用户名</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.username ? 'error' : ''}
        />
        {errors.username && <span className="error-message">{errors.username}</span>}
      </div>

      {/* 邮箱 */}
      <div className="form-group">
        <label>邮箱</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      {/* 密码 */}
      <div className="form-group">
        <label>密码</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>

      <button type="submit">提交</button>
    </form>
  )
}
```

## 实战案例：用户注册表单

```tsx
import { useState, FormEvent } from 'react'

interface RegisterFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  country: string
  interests: string[]
  agreement: boolean
}

const RegisterForm = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'CN',
    interests: [],
    agreement: false
  })

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const interests = [
    '编程',
    '设计',
    '产品',
    '运营',
    '数据分析',
    '人工智能'
  ]

  const countries = [
    { code: 'CN', name: '中国' },
    { code: 'US', name: '美国' },
    { code: 'UK', name: '英国' },
    { code: 'JP', name: '日本' }
  ]

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {}

    // 用户名验证
    if (!formData.username) {
      newErrors.username = '用户名不能为空'
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符'
    } else if (formData.username.length > 20) {
      newErrors.username = '用户名最多20个字符'
    }

    // 邮箱验证
    if (!formData.email) {
      newErrors.email = '邮箱不能为空'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = '密码不能为空'
    } else if (formData.password.length < 8) {
      newErrors.password = '密码至少8个字符'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '密码必须包含大小写字母和数字'
    }

    // 确认密码验证
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码不一致'
    }

    // 手机号验证
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '手机号格式不正确'
    }

    // 兴趣验证
    if (formData.interests.length === 0) {
      newErrors.interests = '请至少选择一个兴趣'
    }

    // 协议验证
    if (!formData.agreement) {
      newErrors.agreement = '请同意用户协议'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理输入变化
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // 清除该字段的错误
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  // 处理兴趣选择
  const handleInterestChange = (interest: string) => {
    setFormData(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]

      return { ...prev, interests }
    })

    if (errors.interests) {
      setErrors(prev => ({ ...prev, interests: undefined }))
    }
  }

  // 处理表单提交
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSubmitted(false)

    // 模拟 API 调用
    setTimeout(() => {
      console.log('注册数据：', formData)
      setIsLoading(false)
      setSubmitted(true)

      // 重置表单
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          country: 'CN',
          interests: [],
          agreement: false
        })
      }, 3000)
    }, 2000)
  }

  // 密码强度计算
  const getPasswordStrength = (): { score: number; text: string; color: string } => {
    const password = formData.password
    if (!password) return { score: 0, text: '', color: '' }

    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 2) return { score, text: '弱', color: '#f44336' }
    if (score <= 4) return { score, text: '中', color: '#ff9800' }
    return { score, text: '强', color: '#4caf50' }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="register-container">
      <h1>用户注册</h1>

      {submitted ? (
        <div className="success-message">
          <h2>🎉 注册成功！</h2>
          <p>欢迎，{formData.username}！</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="register-form">
          {/* 用户名 */}
          <div className="form-group">
            <label htmlFor="username">用户名 *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="3-20个字符"
              autoComplete="username"
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          {/* 邮箱 */}
          <div className="form-group">
            <label htmlFor="email">邮箱 *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* 密码 */}
          <div className="form-group">
            <label htmlFor="password">密码 *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="至少8个字符，包含大小写字母和数字"
              autoComplete="new-password"
            />
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength.score / 6) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </div>
                <span style={{ color: passwordStrength.color }}>
                  密码强度：{passwordStrength.text}
                </span>
              </div>
            )}
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* 确认密码 */}
          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码 *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="再次输入密码"
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {/* 手机号 */}
          <div className="form-group">
            <label htmlFor="phone">手机号</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              placeholder="11位手机号"
              autoComplete="tel"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          {/* 国家 */}
          <div className="form-group">
            <label htmlFor="country">国家/地区</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* 兴趣爱好 */}
          <div className="form-group">
            <label>兴趣爱好 *</label>
            <div className="interests-grid">
              {interests.map(interest => (
                <label key={interest} className="interest-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
            {errors.interests && <span className="error-message">{errors.interests}</span>}
          </div>

          {/* 用户协议 */}
          <div className="form-group">
            <label className="agreement-checkbox">
              <input
                type="checkbox"
                name="agreement"
                checked={formData.agreement}
                onChange={handleChange}
              />
              <span>我已阅读并同意 <a href="#terms">用户协议</a> 和 <a href="#privacy">隐私政策</a></span>
            </label>
            {errors.agreement && <span className="error-message">{errors.agreement}</span>}
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>
      )}
    </div>
  )
}

export default RegisterForm
```

**配套样式：**

```css
.register-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group input[type="tel"],
.form-group select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input.error,
.form-group select.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 12px;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.interests-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.interest-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.interest-checkbox:hover {
  background-color: #f5f5f5;
}

.interest-checkbox input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.agreement-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-weight: normal !important;
}

.agreement-checkbox input[type="checkbox"] {
  width: auto;
  margin-top: 2px;
}

.agreement-checkbox a {
  color: #2196F3;
  text-decoration: none;
}

.submit-btn {
  padding: 14px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #45a049;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success-message {
  text-align: center;
  padding: 40px;
  background-color: #f1f8f4;
  border-radius: 8px;
}

.success-message h2 {
  color: #4CAF50;
  margin-bottom: 10px;
}
```

## 总结

本章我们深入学习了：

✅ 受控组件 vs 非受控组件的区别和使用场景
✅ 受控组件的完整实现（文本、密码、单选、复选、下拉）
✅ 非受控组件的实现（useRef、FormData、useFormStatus）
✅ 表单验证（实时验证、提交时验证、错误提示）
✅ 实战案例：用户注册表单（包含完整的验证逻辑和UI）
✅ 密码强度检测
✅ 表单最佳实践

**下一步：** 第57章将学习 useState 与 useEffect 基础，深入理解 React Hooks 的核心概念。
