# Pinia状态管理集成

## Pinia状态管理集成

> **为什么要学这一章?**
>
> Nuxt 3 深度集成了Pinia,提供了自动导入、服务端渲染支持等特性。Pinia是Vue官方推荐的状态管理库,相比Vuex更简洁、类型更友好。在Nuxt中正确使用Pinia,可以构建可维护、高性能的状态管理系统。
>
> **学习目标**:
>
> - 理解Pinia在Nuxt中的集成方式
> - 掌握Store的创建和使用方法
> - 学会状态持久化和SSR共享
> - 理解状态管理的最佳实践
> - 能够构建完整的状态管理系统

---

### Pinia在Nuxt中使用

#### 安装和配置

```bash
# 安装Pinia
npm install @pinia/nuxt pinia
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt'
  ],

  // Pinia配置
  pinia: {
    // Stores目录
    storesDirs: ['./stores/**'],
  }
})
```

#### 创建Store

```typescript
// stores/user.ts
import { defineStore } from 'pinia'

// 定义用户状态
export const useUserStore = defineStore('user', {
  // State - 状态
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),

  // Getters - 计算属性
  getters: {
    // 获取用户名
    userName: (state) => state.user?.name || 'Guest',

    // 获取用户权限
    userPermissions: (state) => state.user?.permissions || [],

    // 判断是否是管理员
    isAdmin: (state) => state.user?.role === 'admin'
  },

  // Actions - 方法
  actions: {
    // 设置用户
    setUser(user: User) {
      this.user = user
      this.isAuthenticated = true
    },

    // 设置Token
    setToken(token: string) {
      this.token = token
    },

    // 登录
    async login(credentials: LoginCredentials) {
      const { data, error } = await useFetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      if (!error.value && data.value) {
        this.setUser(data.value.user)
        this.setToken(data.value.token)

        // 保存到Cookie
        const tokenCookie = useCookie('auth-token')
        tokenCookie.value = data.value.token

        return true
      }

      return false
    },

    // 登出
    async logout() {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })

      this.$reset() // 重置状态

      // 清除Cookie
      const tokenCookie = useCookie('auth-token')
      tokenCookie.value = null
    }
  }
})
</script>
```

#### Setup Store语法

```typescript
// stores/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // State - 使用ref
  const items = ref<CartItem[]>([])
  const coupon = ref<string | null>(null)

  // Getters - 使用computed
  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const discount = computed(() => {
    if (!coupon.value) return 0
    // 计算折扣逻辑
    return subtotal.value * 0.1
  })

  const total = computed(() => subtotal.value - discount.value)

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  // Actions - 普通函数
  const addItem = (product: Product) => {
    const existingItem = items.value.find(item => item.id === product.id)

    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({
        ...product,
        quantity: 1
      })
    }
  }

  const removeItem = (productId: number) => {
    const index = items.value.findIndex(item => item.id === productId)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId: number, quantity: number) => {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      item.quantity = Math.max(0, quantity)
      if (item.quantity === 0) {
        removeItem(productId)
      }
    }
  }

  const clear = () => {
    items.value = []
    coupon.value = null
  }

  const applyCoupon = (code: string) => {
    // 验证优惠券
    coupon.value = code
  }

  return {
    // State
    items,
    coupon,
    // Getters
    subtotal,
    discount,
    total,
    itemCount,
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clear,
    applyCoupon
  }
})
</script>
```

---

### 自动导入Store

#### 使用自动导入

Nuxt会自动导入stores目录下的所有Store:

```vue
<template>
  <div>
    <!-- 直接使用Store,无需import -->
    <p>欢迎, {{ userStore.userName }}</p>

    <button @click="userStore.logout">登出</button>
  </div>
</template>

<script setup lang="ts>
// ✅ 自动导入,无需手动import
const userStore = useUserStore()

// 访问状态
console.log(userStore.user)

// 调用方法
await userStore.login({
  email: 'user@example.com',
  password: 'password'
})
</script>
```

#### Store组合使用

```vue
<!-- pages/checkout/index.vue -->
<template>
  <div class="checkout-page">
    <h1>结账</h1>

    <!-- 用户信息 -->
    <section class="user-info">
      <h2>收货信息</h2>
      <div v-if="userStore.isAuthenticated">
        <p>{{ userStore.user.name }}</p>
        <p>{{ userStore.user.email }}</p>
      </div>
      <div v-else>
        <button @click="goToLogin">请先登录</button>
      </div>
    </section>

    <!-- 购物车商品 -->
    <section class="cart-items">
      <h2>商品清单</h2>
      <div v-for="item in cartStore.items" :key="item.id" class="item">
        <h3>{{ item.name }}</h3>
        <p>数量: {{ item.quantity }}</p>
        <p>小计: {{ item.price * item.quantity }}</p>
        <button @click="cartStore.removeItem(item.id)">移除</button>
      </div>
    </section>

    <!-- 优惠码 -->
    <section class="coupon">
      <input v-model="couponCode" placeholder="优惠码" />
      <button @click="applyCoupon">应用</button>
    </section>

    <!-- 订单摘要 -->
    <section class="summary">
      <h2>订单摘要</h2>
      <div class="summary-row">
        <span>小计</span>
        <span>¥{{ cartStore.subtotal }}</span>
      </div>
      <div class="summary-row">
        <span>折扣</span>
        <span>-¥{{ cartStore.discount }}</span>
      </div>
      <div class="summary-row total">
        <span>总计</span>
        <span>¥{{ cartStore.total }}</span>
      </div>

      <button @click="checkout" :disabled="!userStore.isAuthenticated">
        提交订单
      </button>
    </section>
  </div>
</template>

<script setup lang="ts>
// 自动导入多个Store
const userStore = useUserStore()
const cartStore = useCartStore()

const couponCode = ref('')

const goToLogin = () => {
  navigateTo({
    path: '/login',
    query: { redirect: '/checkout' }
  })
}

const applyCoupon = () => {
  cartStore.applyCoupon(couponCode.value)
}

const checkout = async () => {
  if (!userStore.isAuthenticated) {
    alert('请先登录')
    return
  }

  try {
    const order = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        items: cartStore.items,
        coupon: cartStore.coupon,
        total: cartStore.total
      },
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })

    // 清空购物车
    cartStore.clear()

    // 跳转到订单详情
    await navigateTo(`/orders/${order.id}`)
  } catch (error) {
    console.error('结账失败:', error)
    alert('结账失败,请重试')
  }
}
</script>
```

---

### 状态持久化

#### 使用pinia-plugin-persistedstate

```bash
# 安装持久化插件
npm install @pinia-plugin-persistedstate/nuxt
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt'
  ]
})
```

#### Store持久化配置

```typescript
// stores/settings.ts
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light' as 'light' | 'dark' | 'auto',
    language: 'zh-CN',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    sidebarCollapsed: false,
    notifications: true
  }),

  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },

    setLanguage(language: string) {
      this.language = language
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    }
  },

  // 持久化配置
  persist: {
    // 存储的key
    key: 'settings',

    // 存储位置
    storage: localStorage, // 或 sessionStorage, cookie

    // 要持久化的状态
    paths: ['theme', 'language', 'fontSize', 'sidebarCollapsed']
  }
})
</script>
```

#### Cookie持久化

```typescript
// stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    refreshToken: null as string | null,
    user: null as User | null
  }),

  actions: {
    async login(credentials: LoginCredentials) {
      const { data } = await useFetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      if (data.value) {
        this.token = data.value.token
        this.refreshToken = data.value.refreshToken
        this.user = data.value.user
      }
    },

    async logout() {
      this.token = null
      this.refreshToken = null
      this.user = null
    }
  },

  // 持久化到Cookie
  persist: {
    key: 'auth',
    storage: {
      // 自定义存储
      getItem: (key) => {
        return useCookie(key).value
      },
      setItem: (key, value) => {
        const cookie = useCookie(key, {
          maxAge: 60 * 60 * 24 * 7, // 7天
          secure: true,
          sameSite: 'lax'
        })
        cookie.value = value
      }
    },
    paths: ['token', 'refreshToken'] // 只持久化token,不持久化user
  }
})
</script>
```

#### 多存储策略

```typescript
// stores/preferences.ts
import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    // 用户偏好(存储到localStorage)
    theme: 'light',
    fontSize: 'medium',

    // 临时状态(不持久化)
    sidebarOpen: true,

    // 敏感信息(存储到Cookie)
    sessionToken: null
  }),

  persist: [
    {
      key: 'prefs-theme',
      paths: ['theme', 'fontSize'],
      storage: localStorage
    },
    {
      key: 'prefs-session',
      paths: ['sessionToken'],
      storage: {
        getItem: (key) => useCookie(key).value,
        setItem: (key, value) => {
          useCookie(key, {
            maxAge: 60 * 60 * 24, // 1天
            httpOnly: true
          }).value = value
        }
      }
    }
  ]
})
</script>
```

---

### SSR状态共享

#### 服务端状态初始化

```typescript
// stores/products.ts
import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    categories: [] as Category[],
    loading: false,
    error: null as Error | null
  }),

  actions: {
    async fetchProducts() {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useFetch('/api/products')

        if (!error.value && data.value) {
          this.products = data.value
        } else {
          this.error = error.value
        }
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      const { data } = await useFetch('/api/categories')
      if (data.value) {
        this.categories = data.value
      }
    }
  }
})
</script>
```

```vue
<!-- pages/products/index.vue -->
<template>
  <div>
    <h1>商品列表</h1>

    <div v-if="productsStore.loading">加载中...</div>
    <div v-else-if="productsStore.error">
      错误: {{ productsStore.error.message }}
    </div>
    <div v-else>
      <div v-for="product in productsStore.products" :key="product.id">
        {{ product.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts>
const productsStore = useProductsStore()

// 在服务端预取数据
if (process.server) {
  await productsStore.fetchProducts()
  await productsStore.fetchCategories()
}
</script>
```

#### 状态水合

```typescript
// plugins/pinia-hydrate.ts
export default defineNuxtPlugin((nuxtApp) => {
  // 从服务端传输状态到客户端
  if (process.server) {
    // 服务端:序列化状态
    nuxtApp.payload.pinia = nuxtApp.$pinia.state.value
  }

  if (process.client) {
    // 客户端:从payload恢复状态
    const pinia = nuxtApp.$pinia

    if (nuxtApp.payload.pinia) {
      pinia.state.value = nuxtApp.payload.pinia
    }
  }
})
```

---

### 实战案例:购物车状态

完整的购物车状态管理系统,包含商品管理、优惠计算、持久化等功能。

#### 1. 购物车Store

```typescript
// stores/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
  variant?: {
    size?: string
    color?: string
  }
}

interface Coupon {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
}

export const useCartStore = defineStore('cart', () => {
  // ============ State ============
  const items = ref<CartItem[]>([])
  const appliedCoupon = ref<Coupon | null>(null)

  // ============ Getters ============
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const discount = computed(() => {
    if (!appliedCoupon.value) return 0

    if (appliedCoupon.value.type === 'percentage') {
      return subtotal.value * (appliedCoupon.value.discount / 100)
    } else {
      return appliedCoupon.value.discount
    }
  })

  const shipping = computed(() => {
    // 免运费规则
    if (subtotal.value >= 99) return 0
    return 10
  })

  const total = computed(() =>
    subtotal.value - discount.value + shipping.value
  )

  const savings = computed(() => {
    const couponSaving = discount.value
    const shippingSaving = subtotal.value >= 99 ? 10 : 0
    return couponSaving + shippingSaving
  })

  // ============ Actions ============
  const addItem = (product: CartItem) => {
    const existingItem = items.value.find(
      item => item.id === product.id &&
      JSON.stringify(item.variant) === JSON.stringify(product.variant)
    )

    if (existingItem) {
      existingItem.quantity += product.quantity
    } else {
      items.value.push({ ...product })
    }

    saveCart()
  }

  const removeItem = (itemId: number, variant?: any) => {
    const index = items.value.findIndex(
      item => item.id === itemId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
    )

    if (index !== -1) {
      items.value.splice(index, 1)
      saveCart()
    }
  }

  const updateQuantity = (itemId: number, quantity: number, variant?: any) => {
    const item = items.value.find(
      item => item.id === itemId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
    )

    if (item) {
      item.quantity = Math.max(1, quantity)
      saveCart()
    }
  }

  const clear = () => {
    items.value = []
    appliedCoupon.value = null
    saveCart()
  }

  const applyCoupon = async (code: string) => {
    try {
      const { data } = await useFetch<Coupon>(`/api/coupons/${code}`)

      if (data.value) {
        appliedCoupon.value = data.value
        saveCart()
        return { success: true }
      }

      return { success: false, message: '优惠码无效' }
    } catch {
      return { success: false, message: '验证优惠码失败' }
    }
  }

  const removeCoupon = () => {
    appliedCoupon.value = null
    saveCart()
  }

  // 持久化到localStorage
  const saveCart = () => {
    if (process.client) {
      localStorage.setItem('cart', JSON.stringify({
        items: items.value,
        coupon: appliedCoupon.value
      }))
    }
  }

  const loadCart = () => {
    if (process.client) {
      const saved = localStorage.getItem('cart')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          items.value = data.items || []
          appliedCoupon.value = data.coupon || null
        } catch {
          console.error('加载购物车失败')
        }
      }
    }
  }

  // 初始化时加载购物车
  onMounted(loadCart)

  return {
    // State
    items,
    appliedCoupon,
    // Getters
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    savings,
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clear,
    applyCoupon,
    removeCoupon
  }
})
</script>
```

#### 2. 购物车组件

```vue
<!-- components/CartIcon.vue -->
<template>
  <div class="cart-icon" @click="openCart">
    <span class="icon">🛒</span>
    <span v-if="itemCount > 0" class="badge">{{ itemCount }}</span>
  </div>
</template>

<script setup lang="ts>
const cartStore = useCartStore()

const itemCount = computed(() => cartStore.itemCount)

const openCart = () => {
  // 打开购物车抽屉
  useEvent('open-cart')
}
</script>

<style scoped>
.cart-icon {
  position: relative;
  cursor: pointer;
  font-size: 1.5rem;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}
</style>
```

#### 3. 购物车抽屉

```vue
<!-- components/CartDrawer.vue -->
<template>
  <Transition name="drawer">
    <div v-if="isOpen" class="cart-drawer-overlay" @click="close">
      <div class="cart-drawer" @click.stop>
        <!-- 头部 -->
        <header class="drawer-header">
          <h2>购物车 ({{ cartStore.itemCount }})</h2>
          <button class="close-btn" @click="close">×</button>
        </header>

        <!-- 商品列表 -->
        <div class="drawer-content">
          <div v-if="cartStore.items.length === 0" class="empty-cart">
            <p>购物车是空的</p>
            <button @click="close">继续购物</button>
          </div>

          <div v-else class="cart-items">
            <div
              v-for="item in cartStore.items"
              :key="`${item.id}-${JSON.stringify(item.variant)}`"
              class="cart-item"
            >
              <img :src="item.image" :alt="item.name" class="item-image" />

              <div class="item-details">
                <h3>{{ item.name }}</h3>
                <p v-if="item.variant" class="item-variant">
                  {{ item.variant.size }} / {{ item.variant.color }}
                </p>
                <p class="item-price">¥{{ item.price }}</p>
              </div>

              <div class="item-actions">
                <div class="quantity-controls">
                  <button @click="updateQuantity(item, -1)">-</button>
                  <span>{{ item.quantity }}</span>
                  <button @click="updateQuantity(item, 1)">+</button>
                </div>
                <button class="remove-btn" @click="removeItem(item)">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部 -->
        <footer v-if="cartStore.items.length > 0" class="drawer-footer">
          <!-- 优惠码 -->
          <div class="coupon-section">
            <input
              v-model="couponCode"
              type="text"
              placeholder="优惠码"
              @keyup.enter="applyCoupon"
            />
            <button @click="applyCoupon">应用</button>
            <button
              v-if="cartStore.appliedCoupon"
              class="remove-coupon"
              @click="cartStore.removeCoupon"
            >
              {{ cartStore.appliedCoupon.code }} ×
            </button>
          </div>

          <!-- 价格摘要 -->
          <div class="summary">
            <div class="summary-row">
              <span>小计</span>
              <span>¥{{ cartStore.subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="cartStore.discount > 0" class="summary-row discount">
              <span>折扣</span>
              <span>-¥{{ cartStore.discount.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>运费</span>
              <span>
                {{ cartStore.shipping === 0 ? '免运费' : `¥${cartStore.shipping}` }}
              </span>
            </div>
            <div class="summary-row total">
              <span>总计</span>
              <span>¥{{ cartStore.total.toFixed(2) }}</span>
            </div>

            <div v-if="cartStore.savings > 0" class="savings">
              已节省 ¥{{ cartStore.savings.toFixed(2) }}
            </div>
          </div>

          <!-- 结账按钮 -->
          <button class="checkout-btn" @click="checkout">
            去结账
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts>
const cartStore = useCartStore()
const isOpen = ref(false)
const couponCode = ref('')

// 监听事件
onMounted(() => {
  useListen('open-cart', () => {
    isOpen.value = true
  })
})

const close = () => {
  isOpen.value = false
}

const updateQuantity = (item: any, delta: number) => {
  cartStore.updateQuantity(item.id, item.quantity + delta, item.variant)
}

const removeItem = (item: any) => {
  if (confirm('确定要删除这个商品吗?')) {
    cartStore.removeItem(item.id, item.variant)
  }
}

const applyCoupon = async () => {
  if (!couponCode.value) return

  const result = await cartStore.applyCoupon(couponCode.value)

  if (result.success) {
    alert('优惠码已应用')
    couponCode.value = ''
  } else {
    alert(result.message || '优惠码无效')
  }
}

const checkout = () => {
  close()
  navigateTo('/checkout')
}
</script>

<style scoped>
.cart-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.cart-drawer {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
  background: white;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.empty-cart {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
}

.quantity-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.quantity-controls button {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.drawer-footer {
  border-top: 1px solid #eee;
  padding: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.summary-row.total {
  font-weight: bold;
  font-size: 1.25rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .cart-drawer,
.drawer-leave-to .cart-drawer {
  transform: translateX(100%);
}
</style>
```

---

### 本章小结

#### Store类型对比

| 类型 | 语法 | 优点 | 适用场景 |
|------|------|------|---------|
| **Options Store** | state/getters/actions | 传统,易理解 | 大型项目,团队协作 |
| **Setup Store** | 组合式API | 灵活,类型推断好 | 中小型项目,简单状态 |

#### 状态管理最佳实践

1. **单一职责**: 每个Store只管理相关状态
2. **避免冗余**: 不要在多个Store中保存相同数据
3. **合理使用Getter**: 复杂计算逻辑使用Getter
4. **异步操作**: Actions中处理异步逻辑
5. **持久化策略**: 敏感信息用Cookie,其他用localStorage

---

**下一步学习**: 建议继续学习[SSR渲染原理与实践](./chapter-122)深入理解服务端渲染。
