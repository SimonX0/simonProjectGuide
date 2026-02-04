# 第8章：模板语法与数据绑定

## 第8章 模板语法与数据绑定

> **学习目标**：掌握Vue3模板语法和数据绑定
> **核心内容**：文本插值、属性绑定、表达式

### 8.1 文本插值

```vue
<script setup lang="ts">
import { ref } from 'vue'

const message = ref('你好Vue3')
const user = ref({ name: '张三' })
</script>

<template>
  <div>
    <p>{{ message }}</p>              <!-- 显示：你好Vue3 -->
    <p>{{ user.name }}</p>             <!-- 显示对象的属性 -->
    <p>{{ 1 + 1 }}</p>                 <!-- 显示：2（支持表达式）-->
    <p>{{ message ? '是' : '否' }}</p> <!-- 显示：是（三元表达式）-->
  </div>
</template>
```

### 8.2 属性绑定 v-bind

**简写：** `v-bind:src` 可以简写为 `:src`

```vue
<script setup lang="ts">
import { ref } from 'vue'

const imageSrc = ref('/logo.png')
const imageAlt = ref('Logo')
const isActive = ref(true)
const textColor = ref('#42b983')
const fontSize = ref(16)
</script>

<template>
  <div>
    <!-- 完整写法 -->
    <img v-bind:src="imageSrc" v-bind:alt="imageAlt">

    <!-- 简写（推荐）-->
    <img :src="imageSrc" :alt="imageAlt">

    <!-- 绑定class -->
    <div :class="{ active: isActive }">动态class</div>

    <!-- 绑定style -->
    <p :style="{ color: textColor, fontSize: fontSize + 'px' }">样式绑定</p>
  </div>
</template>
```

---
