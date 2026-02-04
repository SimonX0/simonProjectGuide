# 第11章：事件处理与表单绑定

## 第11章 事件处理与表单绑定

> **学习目标**：掌握事件处理和表单输入绑定
> **核心内容**：事件修饰符、v-model绑定、表单验证

### 11.1 基本事件处理

```vue
<script setup lang="ts">
// 基本点击事件
const doSomething = () => {
  console.log('做了某事')
}

// 传参数
const sayHello = (name: string) => {
  console.log(`你好，${name}！`)
}

// 事件对象
const handleClick = (event: MouseEvent) => {
  console.log('事件对象：', event)
  console.log('点击位置：', event.clientX, event.clientY)
}

// 阻止默认行为
const onSubmit = () => {
  console.log('表单已提交')
}
</script>

<template>
  <div>
    <!-- 基本点击事件 -->
    <button @click="doSomething">点击我</button>

    <!-- 传参数 -->
    <button @click="sayHello('Vue3')">打招呼</button>

    <!-- 事件对象 -->
    <button @click="handleClick($event)">获取事件对象</button>

    <!-- 阻止默认行为 -->
    <form @submit.prevent="onSubmit">
      <button type="submit">提交</button>
    </form>

    <!-- 阻止冒泡 -->
    <div @click="outerClick">
      <button @click.stop="innerClick">内部按钮</button>
    </div>

    <!-- 按键修饰符 -->
    <input @keyup.enter="onEnter">
    <input @keyup.esc="onEsc">
  </div>
</template>
```

### 11.2 表单输入绑定 v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'

const message = ref('')
const age = ref(0)
const checked = ref(false)
const fruits = ref<string[]>([])
const gender = ref('')
const selected = ref('A')
</script>

<template>
  <div>
    <!-- 文本输入 -->
    <input v-model="message" placeholder="输入消息">
    <p>消息：{{ message }}</p>

    <!-- 数字输入 -->
    <input v-model.number="age" type="number">

    <!-- 复选框 -->
    <input type="checkbox" v-model="checked">

    <!-- 多个复选框 -->
    <input type="checkbox" value="苹果" v-model="fruits">
    <input type="checkbox" value="香蕉" v-model="fruits">

    <!-- 单选框 -->
    <input type="radio" value="男" v-model="gender">
    <input type="radio" value="女" v-model="gender">

    <!-- 选择框 -->
    <select v-model="selected">
      <option value="">请选择</option>
      <option value="A">选项A</option>
      <option value="B">选项B</option>
    </select>
  </div>
</template>
```

---

# 第二周：组件开发
