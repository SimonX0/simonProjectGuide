# 前端安全防护
## # 4.6 前端安全防护
## 第30章 前端安全防护

> **学习目标**：掌握前端常见安全漏洞及防护措施
> **核心内容**：XSS、CSRF、CSP、数据加密、安全HTTP头

### XSS 攻击与防护

#### 什么是 XSS 攻击？

**XSS（Cross-Site Scripting，跨站脚本攻击）** 是一种代码注入攻击，攻击者在网页中注入恶意脚本代码。

**XSS 的危害：**
- 窃取用户 Cookie
- 劫持用户会话
- 篡改网页内容
- 重定向到恶意网站
- 记录用户键盘输入

#### XSS 攻击类型

**1. 存储型 XSS（持久化）**

```typescript
// 危险示例：直接渲染用户输入
<template>
  <div v-html="userComment"></div>  // ❌ 危险！
</template>

<script setup lang="ts">
import { ref } from 'vue'

const userComment = ref('<script>alert(document.cookie)</script>')
</script>
```

**攻击场景：**
```
1. 攻击者在评论区提交恶意脚本
2. 恶意脚本存储到数据库
3. 其他用户访问页面时，脚本被执行
```

**2. 反射型 XSS（非持久化）**

```typescript
// 危险示例：URL参数直接渲染
<template>
  <div v-html="searchResult"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const searchResult = ref('')

onMounted(() => {
  // ❌ 危险！直接使用URL参数
  searchResult.value = route.query.result as string
})
</script>

// 攻击URL:
// http://example.com/search?result=<script>alert(1)</script>
```

**3. DOM 型 XSS**

```vue
<template>
  <div id="output"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  const hash = window.location.hash
  // ❌ 危险！直接操作DOM
  document.getElementById('output')!.innerHTML = hash
})
</script>

// 攻击URL:
// http://example.com/#<img src=x onerror=alert(1)>
```

#### XSS 防护措施

**1. 避免使用 v-html**

```vue
<template>
  <!-- ❌ 危险 -->
  <div v-html="userInput"></div>

  <!-- ✅ 安全：使用文本插值 -->
  <div>{{ userInput }}</div>

  <!-- ✅ 安全：需要渲染HTML时使用DOMPurify -->
  <div v-html="sanitizedHtml"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DOMPurify from 'dompurify'

const userInput = ref('<script>alert(1)</script>')
const sanitizedHtml = ref('')

// 使用 DOMPurify 清理HTML
sanitizedHtml.value = DOMPurify.sanitize(userInput.value)
// 结果: "&lt;script&gt;alert(1)&lt;/script&gt;"（安全）
</script>
```

**2. 安装 DOMPurify**

```bash
npm install dompurify
npm install -D @types/dompurify
```

**3. 创建安全的 v-html 指令**

```typescript
// directives/safeHtml.ts
import DOMPurify from 'dompurify'
import type { Directive } from 'vue'

export const safeHtml: Directive = {
  mounted(el, binding) {
    el.innerHTML = DOMPurify.sanitize(binding.value)
  },
  updated(el, binding) {
    el.innerHTML = DOMPurify.sanitize(binding.value)
  }
}
```

```vue
<!-- 使用安全HTML指令 -->
<template>
  <div v-safe-html="userContent"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { safeHtml } from '@/directives/safeHtml'

const userContent = ref('<p>安全内容</p><script>alert(1)</script>')
</script>
```

**4. 内容安全策略（CSP）**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.example.com"
      ].join('; ')
    }
  }
})
```

**5. 输入验证和输出编码**

```typescript
// utils/security.ts

/**
 * HTML 实体编码
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * URL 编码
 */
export function escapeUrl(url: string): string {
  return encodeURIComponent(url)
}

/**
 * JavaScript 编码
 */
export function escapeJs(unsafe: string): string {
  return unsafe
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
    .replace(/\v/g, '\\v')
    .replace(/\0/g, '\\0')
}

/**
 * 输入验证
 */
export function validateInput(input: string, type: 'email' | 'url' | 'text'): boolean {
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^https?:\/\/.+/,
    text: /^[\w\s\u4e00-\u9fa5.,!?@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/
  }
  return patterns[type].test(input)
}
```

**6. Vue3 组合式函数：安全渲染**

```typescript
// composables/useSafeHtml.ts
import { ref, computed } from 'vue'
import DOMPurify from 'dompurify'

interface SafeHtmlOptions {
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
}

export function useSafeHtml(html: Ref<string>, options?: SafeHtmlOptions) {
  const purifyConfig = computed(() => ({
    ALLOWED_TAGS: options?.allowedTags || ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: options?.allowedAttributes || ['href', 'target', 'rel']
  }))

  const safeHtml = computed(() => {
    return DOMPurify.sanitize(html.value, purifyConfig.value)
  })

  const isDirty = ref(false)

  const checkDirty = () => {
    const sanitized = DOMPurify.sanitize(html.value)
    isDirty.value = sanitized !== html.value
  }

  return {
    safeHtml,
    isDirty,
    checkDirty
  }
}
```

```vue
<!-- 使用示例 -->
<template>
  <div>
    <textarea v-model="inputHtml" @input="checkDirty" rows="5"></textarea>
    <div v-if="isDirty" class="warning">
      检测到潜在危险内容，已被清理
    </div>
    <div v-html="safeHtml"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSafeHtml } from '@/composables/useSafeHtml'

const inputHtml = ref('<p>Hello</p><script>alert(1)</script>')
const { safeHtml, isDirty, checkDirty } = useSafeHtml(inputHtml)
</script>
```

---

### CSRF 攻击与防护

#### 什么是 CSRF 攻击？

**CSRF（Cross-Site Request Forgery，跨站请求伪造）** 是一种挟持用户在当前已登录的Web应用程序上执行非本意的操作的攻击方法。

**CSRF 攻击流程：**
```
1. 用户登录银行网站 bank.com，服务器下发 Cookie
2. 用户在没有退出登录的情况下，访问恶意网站 evil.com
3. 恶意网站页面发出请求: bank.com/transfer?to=hacker&amount=10000
4. 浏览器自动携带 bank.com 的 Cookie
5. 银行服务器验证 Cookie 有效，执行转账操作
```

#### CSRF 防护措施

**1. CSRF Token**

```typescript
// utils/csrf.ts

// 生成随机 Token
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// 存储 Token
export function getCSRFToken(): string {
  return sessionStorage.getItem('csrf-token') || generateCSRFToken()
}

export function setCSRFToken(token: string): void {
  sessionStorage.setItem('csrf-token', token)
}
```

```typescript
// api/request.ts - Axios 拦截器
import axios from 'axios'
import { getCSRFToken } from '@/utils/csrf'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

// 请求拦截器：添加 CSRF Token
api.interceptors.request.use(config => {
  const token = getCSRFToken()
  config.headers['X-CSRF-Token'] = token
  return config
})

// 响应拦截器：更新 CSRF Token
api.interceptors.response.use(
  response => {
    const newToken = response.headers['x-csrf-token']
    if (newToken) {
      setCSRFToken(newToken)
    }
    return response
  }
)
```

**2. SameSite Cookie 属性**

```typescript
// 服务器端设置（示例：Node.js + Express）
res.cookie('sessionId', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'  // 或 'lax'
})

// Vite 开发环境代理配置
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        cookieDomainRewrite: {
          '*': ''
        }
      }
    }
  }
})
```

**3. 自定义 HTTP 头**

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.username" />
    <input v-model="formData.password" type="password" />
    <button type="submit">提交</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { getCSRFToken } from '@/utils/csrf'

const formData = ref({
  username: '',
  password: ''
})

const handleSubmit = async () => {
  try {
    await axios.post('/api/login', formData.value, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': getCSRFToken()
      }
    })
  } catch (error) {
    console.error('请求失败:', error)
  }
}
</script>
```

**4. 验证码/二次确认**

```vue
<template>
  <el-dialog v-model="showConfirm" title="确认操作">
    <p>请输入验证码确认此操作</p>
    <el-input v-model="captcha" placeholder="验证码" />
    <div class="captcha">
      <img :src="captchaUrl" @click="refreshCaptcha" />
    </div>
    <template #footer>
      <el-button @click="showConfirm = false">取消</el-button>
      <el-button type="primary" @click="confirmAction">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const showConfirm = ref(false)
const captcha = ref('')
const captchaUrl = ref('/api/captcha?' + Date.now())

const refreshCaptcha = () => {
  captchaUrl.value = '/api/captcha?' + Date.now()
}

const confirmAction = async () => {
  try {
    await axios.post('/api/confirm', { captcha: captcha.value })
    ElMessage.success('操作成功')
    showConfirm.value = false
  } catch (error) {
    ElMessage.error('验证码错误')
    refreshCaptcha()
  }
}
</script>
```

---

### 内容安全策略（CSP）

#### CSP 基础配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",                    // 默认策略：只允许同源
        "script-src 'self' 'unsafe-inline'",     // 脚本源
        "style-src 'self' 'unsafe-inline'",      // 样式源
        "img-src 'self' data: https:",           // 图片源
        "font-src 'self' data:",                 // 字体源
        "connect-src 'self' https://api.example.com",  // AJAX/WebSocket源
        "media-src 'self'",                      // 音视频源
        "object-src 'none'",                     // 插件源（禁用Flash等）
        "base-uri 'self'",                       // <base>标签
        "form-action 'self'",                    // <form>提交目标
        "frame-ancestors 'none'",                // 禁止被嵌入iframe
        "report-uri /csp-report"                 // 违规报告地址
      ].join('; ')
    }
  }
})
```

#### CSP 指令详解

| 指令 | 说明 | 示例值 |
|------|------|--------|
| `default-src` | 默认策略 | `'self'`、`'none'`、`https:` |
| `script-src` | JavaScript源 | `'self'`、`'unsafe-inline'`、`'unsafe-eval'` |
| `style-src` | CSS源 | `'self'`、`'unsafe-inline'` |
| `img-src` | 图片源 | `'self'`、`data:`、`https:` |
| `connect-src` | AJAX/WebSocket | `'self'`、`wss:`、`https://api.com` |
| `font-src` | 字体源 | `'self'`、`data:` |
| `object-src` | 插件源 | `'none'` |
| `media-src` | 音视频源 | `'self'` |
| `frame-src` | iframe源 | `'self'`、`https://youtube.com` |
| `base-uri` | `<base>`标签 | `'self'` |
| `form-action` | 表单提交 | `'self'` |
| `frame-ancestors` | 嵌入此页面的源 | `'none'`、`'self'` |
| `upgrade-insecure-requests` | 升级HTTP到HTTPS | - |
| `report-uri` | 违规报告地址 | `/csp-report` |

#### CSP 报告收集

```typescript
// api/cspReport.ts
import axios from 'axios'

interface CSPViolationReport {
  'csp-report': {
    'document-uri': string
    'referrer': string
    'blocked-uri': string
    'violated-directive': string
    'original-policy': string
    'disposition': string
  }
}

export async function reportCSPViolation(report: CSPViolationReport) {
  try {
    await axios.post('/api/csp-report', report)
  } catch (error) {
    console.error('CSP违规上报失败:', error)
  }
}

// 在主入口监听CSP违规
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('securitypolicyviolation', (event) => {
    reportCSPViolation({
      'csp-report': {
        'document-uri': event.documentURI,
        'referrer': event.referrer,
        'blocked-uri': event.blockedURI,
        'violated-directive': event.violatedDirective,
        'original-policy': event.originalPolicy,
        'disposition': event.disposition
      }
    })
  })
}
```

#### Vue3 CSP 配置插件

```typescript
// plugins/viteCsp.ts
import type { Plugin } from 'vite'

interface CSPConfig {
  directives?: Record<string, string | string[]>
  reportOnly?: boolean
  reportURI?: string
}

export function cspPlugin(config: CSPConfig = {}): Plugin {
  const {
    directives = {},
    reportOnly = false,
    reportURI
  } = config

  const defaultDirectives: Record<string, string> = {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' data: https:",
    'font-src': "'self' data:",
    'connect-src': "'self'",
    'object-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'frame-ancestors': "'none'"
  }

  const mergedDirectives = { ...defaultDirectives, ...directives }

  const policyString = Object.entries(mergedDirectives)
    .map(([key, value]) => {
      const values = Array.isArray(value) ? value : [value]
      return `${key} ${values.join(' ')}`
    })
    .join('; ') + (reportURI ? `; report-uri ${reportURI}` : '')

  const headerName = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'

  return {
    name: 'vite-csp',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader(headerName, policyString)
        next()
      })
    }
  }
}
```

```typescript
// vite.config.ts
import { cspPlugin } from './plugins/viteCsp'

export default defineConfig({
  plugins: [
    cspPlugin({
      directives: {
        'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.example.com'],
        'img-src': ["'self'", 'data:', 'https:', 'blob:'],
        'connect-src': ["'self'", 'https://api.example.com', 'wss://ws.example.com']
      },
      reportOnly: import.meta.env.DEV,
      reportURI: '/api/csp-report'
    })
  ]
})
```

---

### 敏感数据加密

#### 前端加密库（crypto-js）

```bash
npm install crypto-js
npm install -D @types/crypto-js
```

#### 对称加密（AES）

```typescript
// utils/crypto.ts
import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET_KEY || 'default-secret-key-32-chars'

/**
 * AES 加密
 */
export function aesEncrypt(data: string, key?: string): string {
  const actualKey = key || SECRET_KEY
  const encrypted = CryptoJS.AES.encrypt(data, actualKey)
  return encrypted.toString()
}

/**
 * AES 解密
 */
export function aesDecrypt(ciphertext: string, key?: string): string {
  const actualKey = key || SECRET_KEY
  const decrypted = CryptoJS.AES.decrypt(ciphertext, actualKey)
  return decrypted.toString(CryptoJS.enc.Utf8)
}

/**
 * AES 加密对象
 */
export function aesEncryptObject<T>(data: T, key?: string): string {
  return aesEncrypt(JSON.stringify(data), key)
}

/**
 * AES 解密对象
 */
export function aesDecryptObject<T>(ciphertext: string, key?: string): T {
  const decrypted = aesDecrypt(ciphertext, key)
  return JSON.parse(decrypted) as T
}
```

```vue
<!-- 使用示例 -->
<template>
  <div>
    <input v-model="plaintext" placeholder="输入明文" />
    <button @click="encrypt">加密</button>
    <button @click="decrypt">解密</button>
    <div v-if="ciphertext">
      <p>密文: {{ ciphertext }}</p>
    </div>
    <div v-if="decrypted">
      <p>解密结果: {{ decrypted }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { aesEncrypt, aesDecrypt } from '@/utils/crypto'

const plaintext = ref('Hello World')
const ciphertext = ref('')
const decrypted = ref('')

const encrypt = () => {
  ciphertext.value = aesEncrypt(plaintext.value)
}

const decrypt = () => {
  decrypted.value = aesDecrypt(ciphertext.value)
}
</script>
```

#### 哈希函数（MD5、SHA256）

```typescript
// utils/hash.ts
import CryptoJS from 'crypto-js'

/**
 * MD5 哈希
 */
export function md5Hash(data: string): string {
  return CryptoJS.MD5(data).toString()
}

/**
 * SHA256 哈希
 */
export function sha256Hash(data: string): string {
  return CryptoJS.SHA256(data).toString()
}

/**
 * SHA512 �哈希
 */
export function sha512Hash(data: string): string {
  return CryptoJS.SHA512(data).toString()
}

/**
 * 密码哈希（带盐值）
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || CryptoJS.lib.WordArray.random(128 / 8).toString()
  const hash = CryptoJS.PBKDF2(password, actualSalt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString()
  return { hash, salt: actualSalt }
}

/**
 * 验证密码
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt)
  return computedHash === hash
}
```

#### Base64 编解码

```typescript
// utils/base64.ts
import CryptoJS from 'crypto-js'

/**
 * Base64 编码
 */
export function base64Encode(data: string): string {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data))
}

/**
 * Base64 解码
 */
export function base64Decode(data: string): string {
  return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(data))
}

/**
 * Base64 URL 安全编码（用于URL参数）
 */
export function base64UrlEncode(data: string): string {
  return base64Encode(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Base64 URL 安全解码
 */
export function base64UrlDecode(data: string): string {
  let padded = data
  while (padded.length % 4) {
    padded += '='
  }
  return base64Decode(
    padded.replace(/-/g, '+').replace(/_/g, '/')
  )
}
```

#### Pinia 持久化加密

```typescript
// stores/utils.ts
import { aesEncrypt, aesDecrypt } from '@/utils/crypto'

/**
 * 加密的存储适配器
 */
export const encryptedStorage = {
  getItem(key: string): string | null {
    const encrypted = localStorage.getItem(key)
    if (!encrypted) return null
    try {
      return aesDecrypt(encrypted)
    } catch {
      return null
    }
  },
  setItem(key: string, value: string): void {
    const encrypted = aesEncrypt(value)
    localStorage.setItem(key, encrypted)
  },
  removeItem(key: string): void {
    localStorage.removeItem(key)
  }
}
```

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { usePersistedState } from './utils'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<User | null>(null)

  function setToken(newToken: string) {
    token.value = newToken
  }

  function setUserInfo(info: User) {
    userInfo.value = info
  }

  function logout() {
    token.value = ''
    userInfo.value = null
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout
  }
}, {
  persist: {
    storage: encryptedStorage,
    paths: ['token', 'userInfo']
  }
})
```

---

### 安全 HTTP 头设置

#### 常见安全响应头

| 响应头 | 作用 | 推荐值 |
|--------|------|--------|
| `X-Content-Type-Options` | 防止MIME类型嗅探 | `nosniff` |
| `X-Frame-Options` | 防止点击劫持 | `DENY` 或 `SAMEORIGIN` |
| `X-XSS-Protection` | XSS保护（已过时） | `1; mode=block` |
| `Strict-Transport-Security` | 强制HTTPS | `max-age=31536000` |
| `Referrer-Policy` | 控制Referrer信息 | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | 控制浏览器功能 | `<权限列表>` |
| `Cross-Origin-Opener-Policy` | 隔离弹出窗口 | `same-origin` |
| `Cross-Origin-Resource-Policy` | 跨域资源策略 | `same-origin` |
| `Cross-Origin-Embedder-Policy` | 跨域嵌入策略 | `require-corp` |

#### Vite 安全头配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      // 防止MIME类型嗅探
      'X-Content-Type-Options': 'nosniff',
      // 防止点击劫持
      'X-Frame-Options': 'DENY',
      // HTTPS强制（仅生产环境）
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      // Referrer策略
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // 权限策略
      'Permissions-Policy': [
        'geolocation=()',
        'microphone=()',
        'camera=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()'
      ].join(', '),
      // 跨域策略
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      // 内容安全策略
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.example.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'"
      ].join('; ')
    }
  }
})
```

#### Nginx 安全头配置

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name example.com;

    # SSL配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 安全响应头
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Resource-Policy "same-origin" always;

    # CSP（简化版，完整内容较多）
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;

    # 前端静态文件
    location / {
        root /var/www/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

#### Vue3 安全头组合式函数

```typescript
// composables/useSecurityHeaders.ts
import { onMounted } from 'vue'

export interface SecurityHeaderConfig {
  csp?: string | boolean
  hsts?: boolean | number
  frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM'
  contentTypeOptions?: boolean
  referrerPolicy?: string
  permissionsPolicy?: Record<string, boolean | string[]>
}

export function useSecurityHeaders(config: SecurityHeaderConfig = {}) {
  const setSecurityHeaders = () => {
    // 仅在开发环境中通过meta标签设置（生产环境应在服务器配置）
    if (import.meta.env.DEV && typeof document !== 'undefined') {
      const headers: Array<{ 'http-equiv': string; content: string }> = []

      // CSP
      if (config.csp && typeof config.csp === 'string') {
        headers.push({
          'http-equiv': 'Content-Security-Policy',
          content: config.csp
        })
      }

      // X-Frame-Options
      if (config.frameOptions) {
        const meta = document.createElement('meta')
        meta.httpEquiv = 'X-Frame-Options'
        meta.content = config.frameOptions
        document.head.appendChild(meta)
      }

      // X-Content-Type-Options
      if (config.contentTypeOptions !== false) {
        const meta = document.createElement('meta')
        meta.httpEquiv = 'X-Content-Type-Options'
        meta.content = 'nosniff'
        document.head.appendChild(meta)
      }

      // Referrer-Policy
      if (config.referrerPolicy) {
        const meta = document.createElement('meta')
        meta.name = 'referrer'
        meta.content = config.referrerPolicy
        document.head.appendChild(meta)
      }

      return headers
    }
  }

  onMounted(() => {
    setSecurityHeaders()
  })

  return {
    setSecurityHeaders
  }
}
```

```vue
<!-- 使用示例 -->
<template>
  <div>
    <!-- 应用内容 -->
  </div>
</template>

<script setup lang="ts">
import { useSecurityHeaders } from '@/composables/useSecurityHeaders'

useSecurityHeaders({
  csp: "default-src 'self'; script-src 'self' 'unsafe-inline'",
  frameOptions: 'DENY',
  contentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin'
})
</script>
```

---

### 安全最佳实践总结

#### 开发安全检查清单

```typescript
// checklist/security.ts
export const securityChecklist = {
  // XSS 防护
  xss: [
    '避免使用 v-html，必要时使用 DOMPurify 清理',
    '使用文本插值 {{ }} 代替 v-html',
    '对URL参数进行验证和编码',
    '设置 CSP 头'
  ],

  // CSRF 防护
  csrf: [
    '使用 CSRF Token',
    '设置 Cookie 的 SameSite 属性',
    '重要操作使用验证码/二次确认',
    '验证 Referer/Origin 头'
  ],

  // 数据安全
  data: [
    '敏感数据加密存储（localStorage/sessionStorage）',
    '使用 HTTPS 传输',
    '不在URL中传递敏感信息',
    '密码使用哈希+盐值'
  ],

  // 依赖安全
  dependencies: [
    '定期更新依赖包',
    '使用 npm audit 检查漏洞',
    '使用 Snyk 等工具监控依赖'
  ],

  // 其他
  other: [
    '设置安全响应头',
    '禁用不必要的浏览器功能',
    '限制请求频率（Rate Limiting）',
    '实现安全日志记录'
  ]
}
```

#### 安全检测工具

```bash
# npm 漏洞扫描
npm audit

# 使用 Snyk 扫描
npm install -g snyk
snyk test

# 使用 OWASP ZAP 进行渗透测试
# 下载: https://www.zaproxy.org/
```

#### 本章小结

| 安全威胁 | 防护措施 | 优先级 |
|----------|----------|--------|
| XSS | DOMPurify、CSP、避免v-html | ⭐⭐⭐⭐⭐ |
| CSRF | Token、SameSite Cookie | ⭐⭐⭐⭐⭐ |
| 数据泄露 | 加密、HTTPS | ⭐⭐⭐⭐⭐ |
| 点击劫持 | X-Frame-Options | ⭐⭐⭐⭐ |
| 中间人攻击 | HTTPS、HSTS | ⭐⭐⭐⭐⭐ |

---
