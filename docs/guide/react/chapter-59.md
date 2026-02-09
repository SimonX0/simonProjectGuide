# ：useRef与useMemo

## useRef：访问DOM与存储可变值

### useRef 的两种用途

```tsx
import { useRef } from 'react'

// 用途1：访问 DOM 元素
const FocusInput = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.focus()  // 聚焦输入框
  }

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleClick}>聚焦</button>
    </div>
  )
}

// 用途2：存储可变值（不触发重新渲染）
const Timer = () => {
  const timerRef = useRef<number | null>(null)

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      console.log('定时器运行中...')
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  return (
    <div>
      <button onClick={startTimer}>开始</button>
      <button onClick={stopTimer}>停止</button>
    </div>
  )
}
```

### useRef 访问 DOM 元素

```tsx
// 基础用法：聚焦输入框
const SearchForm = () => {
  const searchInputRef = useRef<HTMLInputElement>(null)

  const focusSearch = () => {
    searchInputRef.current?.focus()
  }

  return (
    <div className="search-form">
      <input
        ref={searchInputRef}
        type="text"
        placeholder="搜索..."
      />
      <button onClick={focusSearch}>搜索</button>
    </div>
  )
}

// 访问多个 DOM 元素
const CheckboxList = () => {
  const checkboxRefs = useRef<(HTMLInputElement | null)[]>([])

  const selectAll = () => {
    checkboxRefs.current.forEach(checkbox => {
      if (checkbox) checkbox.checked = true
    })
  }

  const deselectAll = () => {
    checkboxRefs.current.forEach(checkbox => {
      if (checkbox) checkbox.checked = false
    })
  }

  const items = ['选项1', '选项2', '选项3', '选项4']

  return (
    <div>
      <div className="actions">
        <button onClick={selectAll}>全选</button>
        <button onClick={deselectAll}>取消全选</button>
      </div>

      {items.map((item, index) => (
        <div key={index}>
          <input
            ref={el => checkboxRefs.current[index] = el}
            type="checkbox"
            id={`item-${index}`}
          />
          <label htmlFor={`item-${index}`}>{item}</label>
        </div>
      ))}
    </div>
  )
}

// 访问组件实例（仅限类组件）
class LegacyComponent extends React.Component {
  focus() {
    console.log('聚焦')
  }
}

const ParentComponent = () => {
  const legacyRef = useRef<LegacyComponent>(null)

  const handleClick = () => {
    legacyRef.current?.focus()
  }

  return (
    <div>
      <LegacyComponent ref={legacyRef} />
      <button onClick={handleClick}>调用子组件方法</button>
    </div>
  )
}
```

### useRef 存储可变值

```tsx
// ❌ 问题：使用 useState 会导致不必要的重新渲染
const CounterWithState = () => {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    console.log('点击前：', count)  // 总是显示旧值
    setCount(count + 1)
    console.log('点击后：', count)  // 仍然是旧值（状态更新是异步的）
  }

  return (
    <div>
      <p>{count}</p>
      <button onClick={handleClick}>点击</button>
    </div>
  )
}

// ✅ 正确：使用 useRef 存储不需要渲染的值
const CounterWithRef = () => {
  const countRef = useRef(0)
  const [renderCount, setRenderCount] = useState(0)

  const handleClick = () => {
    countRef.current += 1
    console.log('实际点击次数：', countRef.current)  // 立即显示最新值
    setRenderCount(renderCount + 1)  // 只在需要更新 UI 时
  }

  return (
    <div>
      <p>渲染次数：{renderCount}</p>
      <p>实际点击：{countRef.current}</p>
      <button onClick={handleClick}>点击</button>
    </div>
  )
}

// 存储上一次的值
const PreviousValue = () => {
  const [count, setCount] = useState(0)
  const prevCountRef = useRef<number>()

  useEffect(() => {
    prevCountRef.current = count  // 保存上一次的值
  }, [count])

  const prevCount = prevCountRef.current

  return (
    <div>
      <p>当前值：{count}</p>
      <p>上一次的值：{prevCount ?? '无'}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}
```

### useRef vs useState 对比

```tsx
// useState：状态变化会触发重新渲染
const useStateExample = () => {
  const [value, setValue] = useState(0)

  const increment = () => {
    setValue(value + 1)  // 触发重新渲染
    console.log('渲染了')
  }

  return <div onClick={increment}>{value}</div>
}

// useRef：值变化不会触发重新渲染
const useRefExample = () => {
  const valueRef = useRef(0)
  const [, forceUpdate] = useState({})

  const increment = () => {
    valueRef.current += 1  // 不会触发重新渲染
    console.log('值更新了，但没有渲染')
    forceUpdate({})  // 手动触发渲染
  }

  return <div onClick={increment}>{valueRef.current}</div>
}
```

### useRef 实战案例

```tsx
// 案例1：自动聚焦输入框
const AutoFocusInput = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 组件挂载后自动聚焦
    inputRef.current?.focus()
  }, [])

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="我会自动聚焦" />
    </div>
  )
}

// 案例2：检测点击是否发生在组件外部
const ClickOutside = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={containerRef} className="dropdown">
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '关闭' : '打开'}菜单
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="menu-item">选项1</div>
          <div className="menu-item">选项2</div>
          <div className="menu-item">选项3</div>
        </div>
      )}
    </div>
  )
}

// 案例3：滚动到元素
const ScrollToElement = () => {
  const sections = ['第一节', '第二节', '第三节', '第四节']
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  return (
    <div>
      <nav className="toc">
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
          >
            {section}
          </button>
        ))}
      </nav>

      <div className="content">
        {sections.map((section, index) => (
          <div
            key={index}
            ref={el => sectionRefs.current[index] = el}
            className="section"
          >
            <h2>{section}</h2>
            <p>这是{section}的内容...</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// 案例4：测量 DOM 元素尺寸
const MeasureElement = () => {
  const boxRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const measure = () => {
      if (boxRef.current) {
        setDimensions({
          width: boxRef.current.offsetWidth,
          height: boxRef.current.offsetHeight
        })
      }
    }

    measure()

    // 监听窗口大小变化
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <div>
      <div
        ref={boxRef}
        className="measured-box"
        style={{
          width: '300px',
          height: '200px',
          backgroundColor: '#2196F3',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div>
          <p>宽度：{dimensions.width}px</p>
          <p>高度：{dimensions.height}px</p>
        </div>
      </div>
    </div>
  )
}
```

## useMemo：缓存计算结果

### useMemo 基本用法

```tsx
import { useMemo } from 'react'

// ❌ 不使用 useMemo：每次渲染都重新计算
const ExpensiveComponent = ({ items }: { items: number[] }) => {
  // 每次渲染都会执行这个昂贵的计算
  const expensiveValue = items.reduce((sum, item) => sum + item * item, 0)

  return <div>结果：{expensiveValue}</div>
}

// ✅ 使用 useMemo：只在依赖变化时重新计算
const OptimizedComponent = ({ items }: { items: number[] }) => {
  // 只在 items 变化时重新计算
  const expensiveValue = useMemo(() => {
    console.log('重新计算了')
    return items.reduce((sum, item) => sum + item * item, 0)
  }, [items])  // 依赖数组

  return <div>结果：{expensiveValue}</div>
}
```

### useMemo 使用场景

```tsx
// 场景1：过滤大型列表
const FilteredList = ({ items, filter }: { items: string[]; filter: string }) => {
  const filteredItems = useMemo(() => {
    console.log('过滤列表')
    return items.filter(item =>
      item.toLowerCase().includes(filter.toLowerCase())
    )
  }, [items, filter])

  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

// 场景2：排序数据
const SortedList = ({ items }: { items: number[] }) => {
  const sortedItems = useMemo(() => {
    console.log('排序列表')
    return [...items].sort((a, b) => a - b)
  }, [items])

  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

// 场景3：复杂计算
const Fibonacci = ({ n }: { n: number }) => {
  const result = useMemo(() => {
    console.log('计算斐波那契数列')

    const fib = (num: number): number => {
      if (num <= 1) return num
      return fib(num - 1) + fib(num - 2)
    }

    return fib(n)
  }, [n])

  return <div>斐波那契({n}) = {result}</div>
}

// 场景4：避免对象引用变化
// ❌ 问题：每次渲染都创建新对象，导致子组件不必要的重新渲染
const ParentComponent = () => {
  const [count, setCount] = useState(0)

  const config = {
    color: 'red',
    size: 'large'
  }  // 每次渲染都是新对象

  return <ChildComponent config={config} />
}

// ✅ 正确：使用 useMemo 缓存对象
const ParentComponentOptimized = () => {
  const [count, setCount] = useState(0)

  const config = useMemo(() => ({
    color: 'red',
    size: 'large'
  }), [])  // 只创建一次

  return <ChildComponent config={config} />
}
```

### useMemo 性能陷阱

```tsx
// ❌ 陷阱1：过度使用 useMemo
const BadExample = () => {
  // 简单计算不需要 useMemo
  const doubled = useMemo(() => count * 2, [count])

  // 这个计算太快了，不需要缓存
  const message = useMemo(() => `Hello ${name}`, [name])

  return <div>{doubled} - {message}</div>
}

// ✅ 正确：只在真正需要时使用
const GoodExample = () => {
  const doubled = count * 2  // 简单计算直接计算
  const expensiveResult = useMemo(() => heavyComputation(data), [data])

  return <div>{doubled} - {expensiveResult}</div>
}

// ❌ 陷阱2：依赖数组不正确
const BadDependency = ({ items }: { items: number[] }) => {
  const sum = useMemo(() => {
    return items.reduce((a, b) => a + b, 0)
  }, [])  // ❌ 缺少 items 依赖

  return <div>{sum}</div>
}

// ✅ 正确：包含所有依赖
const CorrectDependency = ({ items }: { items: number[] }) => {
  const sum = useMemo(() => {
    return items.reduce((a, b) => a + b, 0)
  }, [items])  // ✅ 包含 items

  return <div>{sum}</div>
}
```

## 实战案例：表单焦点管理 + 复杂计算缓存

```tsx
import { useState, useRef, useMemo, useEffect } from 'react'

// ==================== 表单字段组件 ====================
interface FormFieldProps {
  label: string
  type: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  inputRef?: React.RefObject<HTMLInputElement>
  error?: string
}

const FormField = ({
  label,
  type,
  name,
  value,
  onChange,
  inputRef,
  error
}: FormFieldProps) => {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        ref={inputRef}
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}

// ==================== 计算器组件（复杂计算） ====================
const TaxCalculator = ({ income }: { income: number }) => {
  // 使用 useMemo 缓存复杂的税务计算
  const taxBreakdown = useMemo(() => {
    console.log('重新计算税务...')

    // 模拟复杂的税务计算
    const brackets = [
      { max: 10000, rate: 0.05 },
      { max: 30000, rate: 0.10 },
      { max: 70000, rate: 0.20 },
      { max: Infinity, rate: 0.30 }
    ]

    let remainingIncome = income
    let totalTax = 0
    const breakdown: { bracket: string; rate: string; tax: number }[] = []

    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i]
      const taxableIncome = Math.min(remainingIncome, bracket.max - (i > 0 ? brackets[i - 1].max : 0))

      if (taxableIncome <= 0) break

      const tax = taxableIncome * bracket.rate
      totalTax += tax

      breakdown.push({
        bracket: i === 0
          ? `0 - ${bracket.max.toLocaleString()}`
          : `${(brackets[i - 1].max).toLocaleString()} - ${bracket.max === Infinity ? '以上' : bracket.max.toLocaleString()}`,
        rate: `${(bracket.rate * 100).toFixed(0)}%`,
        tax
      })

      remainingIncome -= taxableIncome
    }

    return {
      totalTax,
      netIncome: income - totalTax,
      effectiveRate: (totalTax / income) * 100,
      breakdown
    }
  }, [income])

  return (
    <div className="tax-calculator">
      <h3>税务计算</h3>

      <div className="summary">
        <div className="summary-item">
          <span className="label">总收入：</span>
          <span className="value">¥{income.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="label">总税额：</span>
          <span className="value tax">-¥{taxBreakdown.totalTax.toLocaleString()}</span>
        </div>
        <div className="summary-item total">
          <span className="label">税后收入：</span>
          <span className="value highlight">¥{taxBreakdown.netIncome.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="label">实际税率：</span>
          <span className="value">{taxBreakdown.effectiveRate.toFixed(2)}%</span>
        </div>
      </div>

      <div className="breakdown">
        <h4>税额明细</h4>
        {taxBreakdown.breakdown.map((item, index) => (
          <div key={index} className="breakdown-item">
            <span>{item.bracket}</span>
            <span>{item.rate}</span>
            <span>¥{item.tax.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== 主表单组件 ====================
const AdvancedForm = () => {
  // Refs
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const incomeRef = useRef<HTMLInputElement>(null)

  // 状态
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    income: ''
  })

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    income: ''
  })

  const [focusedField, setFocusedField] = useState<string | null>(null)

  // 计算表单完成度
  const formProgress = useMemo(() => {
    const fields = Object.keys(formData)
    const filledFields = fields.filter(key => formData[key as keyof typeof formData].trim() !== '')
    return (filledFields.length / fields.length) * 100
  }, [formData])

  // 验证表单
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return '姓名不能为空'
        if (value.length < 2) return '姓名至少2个字符'
        return ''
      case 'email':
        if (!value.trim()) return '邮箱不能为空'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '邮箱格式不正确'
        return ''
      case 'income':
        if (!value.trim()) return '收入不能为空'
        const income = parseFloat(value)
        if (isNaN(income)) return '请输入有效数字'
        if (income < 0) return '收入不能为负数'
        return ''
      default:
        return ''
    }
  }

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // 实时验证
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  // 处理焦点
  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName)
  }

  const handleBlur = (fieldName: string) => {
    setFocusedField(null)
  }

  // 聚焦到第一个错误字段
  const focusFirstError = () => {
    const errorFields = Object.keys(errors).filter(key => errors[key as keyof typeof errors])

    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0]

      switch (firstErrorField) {
        case 'name':
          nameRef.current?.focus()
          break
        case 'email':
          emailRef.current?.focus()
          break
        case 'income':
          incomeRef.current?.focus()
          break
      }
    }
  }

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 验证所有字段
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      income: validateField('income', formData.income)
    }

    setErrors(newErrors)

    const hasErrors = Object.values(newErrors).some(error => error !== '')

    if (hasErrors) {
      focusFirstError()
      return
    }

    // 提交成功
    alert('表单提交成功！')
    console.log('提交的数据：', formData)
  }

  // 重置表单
  const handleReset = () => {
    setFormData({ name: '', email: '', income: '' })
    setErrors({ name: '', email: '', income: '' })
    nameRef.current?.focus()
  }

  // 快捷键支持
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handleSubmit(e as any)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [formData])

  const income = parseFloat(formData.income) || 0

  return (
    <div className="advanced-form-container">
      <div className="form-wrapper">
        <h1>用户信息表单</h1>

        {/* 进度条 */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${formProgress}%` }}
          />
          <span className="progress-text">{formProgress.toFixed(0)}%</span>
        </div>

        <form onSubmit={handleSubmit} onReset={handleReset}>
          <FormField
            label="姓名"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            inputRef={nameRef}
            error={errors.name}
            onFocus={() => handleFocus('name')}
            onBlur={() => handleBlur('name')}
          />

          <FormField
            label="邮箱"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            inputRef={emailRef}
            error={errors.email}
            onFocus={() => handleFocus('email')}
            onBlur={() => handleBlur('email')}
          />

          <FormField
            label="年收入（元）"
            type="number"
            name="income"
            value={formData.income}
            onChange={handleChange}
            inputRef={incomeRef}
            error={errors.income}
            onFocus={() => handleFocus('income')}
            onBlur={() => handleBlur('income')}
          />

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              提交 (Ctrl+Enter)
            </button>
            <button type="reset" className="btn-secondary">
              重置
            </button>
          </div>
        </form>

        {/* 税务计算器 */}
        {income > 0 && !errors.income && (
          <TaxCalculator income={income} />
        )}
      </div>
    </div>
  )
}

export default AdvancedForm
```

**配套样式：**

```css
.advanced-form-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.form-wrapper {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
}

.form-wrapper h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
}

/* 进度条 */
.progress-bar {
  position: relative;
  height: 30px;
  background-color: #f0f0f0;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 30px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
}

.progress-text {
  position: absolute;
  width: 100%;
  text-align: center;
  line-height: 30px;
  font-weight: bold;
  color: #333;
}

/* 表单字段 */
.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-field input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
  outline: none;
}

.form-field input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-field input.error {
  border-color: #f44336;
}

.form-field input.error:focus {
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}

.error-message {
  display: block;
  color: #f44336;
  font-size: 14px;
  margin-top: 5px;
}

/* 表单操作 */
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.form-actions button {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

/* 税务计算器 */
.tax-calculator {
  margin-top: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
}

.tax-calculator h3 {
  margin-bottom: 20px;
  color: #333;
}

.summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.summary-item .label {
  font-weight: 500;
  color: #666;
}

.summary-item .value {
  font-weight: bold;
  color: #333;
}

.summary-item .value.tax {
  color: #f44336;
}

.summary-item .value.highlight {
  color: #4CAF50;
  font-size: 18px;
}

.summary-item.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.summary-item.total .label,
.summary-item.total .value {
  color: white;
}

.breakdown {
  background: white;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.breakdown h4 {
  margin-bottom: 15px;
  color: #333;
}

.breakdown-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.breakdown-item:last-child {
  border-bottom: none;
}

.breakdown-item span:last-child {
  font-weight: bold;
  color: #f44336;
}

/* 下拉菜单示例样式 */
.dropdown {
  position: relative;
  display: inline-block;
  margin: 20px;
}

.dropdown button {
  padding: 10px 20px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 5px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  z-index: 1000;
}

.menu-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

/* 滚动到元素示例样式 */
.toc {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toc button {
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 5px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.toc button:hover {
  background-color: #2196F3;
  color: white;
  border-color: #2196F3;
}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.section {
  min-height: 300px;
  padding: 40px 20px;
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

## 最佳实践

### 1. 何时使用 useRef

```tsx
// ✅ 使用 useRef 的场景：
// - 需要访问 DOM 元素
// - 存储不需要触发渲染的值
// - 存储定时器 ID
// - 存储上一次的 props/state

// ❌ 不应该使用 useRef：
// - 需要在 UI 中显示的值（应该用 useState）
```

### 2. 何时使用 useMemo

```tsx
// ✅ 使用 useMemo 的场景：
// - 昂贵的计算
// - 避免子组件不必要的重新渲染
// - 避免创建新的对象/数组引用

// ❌ 不应该使用 useMemo：
// - 简单的计算（如 a + b）
// - 会让代码变得更复杂
```

### 3. 性能优化建议

```tsx
// ✅ 先让代码工作，再优化性能
// ✅ 使用 React DevTools Profiler 识别性能瓶颈
// ✅ 只优化真正需要优化的部分
// ❌ 不要过度优化
```

## 总结

本章我们学习了：

✅ useRef 的两种用途（访问 DOM、存储可变值）
✅ useRef vs useState 的区别和使用场景
✅ useMemo 的基本用法和性能优化
✅ useMemo 的使用场景和最佳实践
✅ 实战案例：表单焦点管理 + 复杂计算缓存
✅ useRef 和 useMemo 的正确使用时机

**下一步：** 第60章将学习 useCallback 与性能优化，深入了解函数缓存和渲染优化。
