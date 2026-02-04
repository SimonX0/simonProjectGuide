# 计算属性与侦听器

## 第9章 计算属性与侦听器

> **学习目标**：掌握计算属性和侦听器的使用
> **核心内容**：computed计算属性、watch侦听器、最佳实践

### 计算属性 computed

**计算属性就像是数学公式**，你定义好规则，数据会自动计算。

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

// 计算属性有缓存，依赖不变不会重新计算
const fullName = computed(() => firstName.value + lastName.value)
</script>

<template>
  <p>姓：<input v-model="lastName"></p>
  <p>名：<input v-model="firstName"></p>
  <p>全名：{{ fullName }}</p>
</template>
```

### 侦听器 watch

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const question = ref('')
const answer = ref('问题包含"?"时我会回答')

// 侦听单个数据
watch(question, (newVal, oldVal) => {
  if (newVal.includes('?')) {
    answer.value = '这是个好问题！'
  }
})

// 侦听多个数据
watch([firstName, lastName], ([newFirst, newLast]) => {
  console.log(`姓名变化为: ${newFirst}${newLast}`)
})
</script>
```

### 实战案例：智能购物车

下面是一个完整的购物车功能，综合运用计算属性和侦听器：

```vue
<!-- ShoppingCart.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 商品接口
interface Product {
  id: number
  name: string
  price: number
  image: string
}

// 购物车项接口
interface CartItem extends Product {
  quantity: number
}

// 购物车数据
const cartItems = ref<CartItem[]>([
  { id: 1, name: 'Vue3实战教程', price: 89, image: '/book1.jpg', quantity: 1 },
  { id: 2, name: 'TypeScript入门', price: 69, image: '/book2.jpg', quantity: 2 },
  { id: 3, name: 'Vite开发指南', price: 59, image: '/book3.jpg', quantity: 1 }
])

// 优惠券
const couponCode = ref('')
const discount = ref(0)

// ===== 计算属性 =====

// 单项小计
const getItemTotal = (item: CartItem) => {
  return item.price * item.quantity
}

// 商品总数量（计算属性：有缓存）
const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

// 商品总价
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + getItemTotal(item), 0)
})

// 折扣金额
const discountAmount = computed(() => {
  return subtotal.value * (discount.value / 100)
})

// 最终总价
const totalPrice = computed(() => {
  return subtotal.value - discountAmount.value
})

// 是否显示空购物车提示
const isEmpty = computed(() => {
  return cartItems.value.length === 0
})

// ===== 方法 =====

// 增加数量
const increaseQuantity = (id: number) => {
  const item = cartItems.value.find(item => item.id === id)
  if (item && item.quantity < 99) {
    item.quantity++
  }
}

// 减少数量
const decreaseQuantity = (id: number) => {
  const item = cartItems.value.find(item => item.id === id)
  if (item && item.quantity > 1) {
    item.quantity--
  }
}

// 删除商品
const removeItem = (id: number) => {
  const index = cartItems.value.findIndex(item => item.id === id)
  if (index > -1) {
    cartItems.value.splice(index, 1)
  }
}

// 清空购物车
const clearCart = () => {
  cartItems.value = []
}

// 应用优惠券
const applyCoupon = () => {
  const coupons: Record<string, number> = {
    'VIP88': 88,   // 88折
    'SAVE20': 20,  // 减20%
    'NEWUSER': 15  // 减15%
  }
  discount.value = coupons[couponCode.value.toUpperCase()] || 0
}

// ===== 侦听器 =====

// 侦听购物车变化，自动保存到本地存储
watch(
  cartItems,
  (newCart) => {
    localStorage.setItem('shopping-cart', JSON.stringify(newCart))
    console.log('购物车已保存到本地存储')
  },
  { deep: true }
)

// 侦听总数量，显示提示
watch(totalQuantity, (newQuantity) => {
  if (newQuantity > 0) {
    document.title = `购物车(${newQuantity}) - 在线商城`
  } else {
    document.title = '购物车 - 在线商城'
  }
})

// 侦听优惠券码变化
watch(couponCode, (newCode) => {
  if (!newCode) {
    discount.value = 0
  }
})
</script>

<template>
  <div class="shopping-cart">
    <h1>🛒 购物车</h1>

    <!-- 空购物车提示 -->
    <div v-if="isEmpty" class="empty-cart">
      <p>购物车是空的，快去添加商品吧！</p>
      <button @click="$router.push('/products')">去购物</button>
    </div>

    <!-- 购物车列表 -->
    <div v-else class="cart-content">
      <!-- 商品列表 -->
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <img :src="item.image" :alt="item.name" class="item-image">
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="item-price">¥{{ item.price }}</p>
          </div>
          <div class="item-quantity">
            <button @click="decreaseQuantity(item.id)" :disabled="item.quantity <= 1">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="increaseQuantity(item.id)" :disabled="item.quantity >= 99">+</button>
          </div>
          <div class="item-total">
            <p>¥{{ getItemTotal(item) }}</p>
            <button @click="removeItem(item.id)" class="btn-remove">删除</button>
          </div>
        </div>
      </div>

      <!-- 订单摘要 -->
      <div class="cart-summary">
        <h2>订单摘要</h2>
        <div class="summary-item">
          <span>商品数量：</span>
          <span>{{ totalQuantity }} 件</span>
        </div>
        <div class="summary-item">
          <span>商品总价：</span>
          <span>¥{{ subtotal }}</span>
        </div>
        <div class="summary-item discount">
          <span>优惠金额：</span>
          <span>- ¥{{ discountAmount }}</span>
        </div>
        <div class="summary-item total">
          <span>应付金额：</span>
          <span class="total-price">¥{{ totalPrice }}</span>
        </div>

        <!-- 优惠券 -->
        <div class="coupon-section">
          <input
            v-model="couponCode"
            placeholder="输入优惠券码"
            @keyup.enter="applyCoupon"
          >
          <button @click="applyCoupon">应用</button>
        </div>

        <!-- 操作按钮 -->
        <div class="cart-actions">
          <button @click="clearCart" class="btn-clear">清空购物车</button>
          <button @click="checkout" class="btn-checkout">去结算</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shopping-cart {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  align-items: center;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.item-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-quantity button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
}

.item-quantity span {
  min-width: 40px;
  text-align: center;
  font-weight: bold;
}

.item-total {
  text-align: right;
}

.btn-remove {
  background: none;
  border: none;
  color: #f56c6c;
  cursor: pointer;
  padding: 5px 10px;
}

.cart-summary {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  color: #666;
}

.summary-item.discount {
  color: #67c23a;
}

.summary-item.total {
  border-top: 2px solid #ddd;
  padding-top: 15px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.total-price {
  color: #f56c6c;
  font-size: 24px;
}

.coupon-section {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.coupon-section input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.btn-clear {
  padding: 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.btn-checkout {
  padding: 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-checkout:hover {
  background: #35a872;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
}
</style>
```

**案例说明：**

1. **计算属性使用**：
   - `totalQuantity`：计算商品总数量（有缓存）
   - `subtotal`：计算商品总价
   - `discountAmount`：计算折扣金额
   - `totalPrice`：计算最终应付金额

2. **侦听器使用**：
   - 监听购物车变化，自动保存到本地存储
   - 监听总数量，动态更新页面标题
   - 监听优惠券码变化，自动清除折扣

3. **最佳实践**：
   - 使用 TypeScript 定义接口类型
   - 计算属性用于派生数据（有缓存）
   - 侦听器用于副作用操作（保存数据、更新标题）
   - 使用 `deep: true` 深度侦听对象数组

---
