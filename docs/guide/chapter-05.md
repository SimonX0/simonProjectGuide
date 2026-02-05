# CSS预处理器 - Less

## CSS预处理器 - Less

> **学习目标**：掌握Less预处理器的高级用法
> **核心内容**：Less安装配置、变量、嵌套、Mixin、运算与函数

### 什么是Less？ {#什么是less}

#### 什么是Less？

Less（Leaner Style Sheets）是一门CSS扩展语言，增加了变量、Mixin、函数等特性。

**Less的特点：**
- 语法简洁，学习曲线平缓
- 兼容CSS语法
- 可以在浏览器端运行
- 变量和Mixin复用性强

#### 安装Less

```bash
# npm安装
npm install -D less

# yarn安装
yarn add -D less

# pnpm安装
pnpm add -D less
```

#### Less核心特性 {#less核心特性}

##### 1. 变量（Variables）

```less
/* ==================== Less变量 ==================== */

// 定义变量（使用 @ 符号）
@primary-color: #42b983;
@secondary-color: #35495e;
@text-color: #333;
@border-radius: 4px;
@font-size-base: 14px;

// 使用变量
.button {
  background-color: @primary-color;
  color: white;
  border-radius: @border-radius;
  font-size: @font-size-base;
}

// 变量插值
@selector: .container;
@image-path: './images';

@{selector} {
  background: url('@{image-path}/bg.png');
}

// 变量计算
@base-size: 16px;

.large-text {
  font-size: @base-size * 1.5;  // 24px
}

.small-text {
  font-size: @base-size * 0.875;  // 14px
}

// 颜色运算
@color-1: #036;
@color-2: #339;

.mixed {
  color: @color-1 + @color-2;  // #339
}
```

##### 2. 嵌套（Nesting）

```less
/* ==================== Less嵌套 ==================== */

// 传统CSS写法
/*
.nav {
  background: #333;
}
.nav ul {
  list-style: none;
}
.nav ul li {
  display: inline-block;
}
*/

// Less嵌套写法（更清晰）
.nav {
  background: @secondary-color;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      display: inline-block;

      a {
        color: white;
        text-decoration: none;

        &:hover {  // & 代表父选择器
          color: @primary-color;
        }
      }
    }
  }

  &.fixed {  // .nav.fixed
    position: fixed;
    top: 0;
  }
}
```

##### 3. Mixin（混合）

```less
/* ==================== Less Mixin ==================== */

// 定义Mixin
.border-radius(@radius: 4px) {
  border-radius: @radius;
  -webkit-border-radius: @radius;
  -moz-border-radius: @radius;
}

.box-shadow(@shadow: 0 2px 8px rgba(0, 0, 0, 0.1)) {
  box-shadow: @shadow;
}

// 使用Mixin
.card {
  .border-radius(8px);
  .box-shadow();
  padding: 16px;
}

.button {
  .border-radius();
  background: @primary-color;
}

// 多参数Mixin
.gradient(@start: #eee, @end: #fff, @direction: to bottom) {
  background: @start;
  background: -webkit-linear-gradient(@direction, @start, @end);
  background: linear-gradient(@direction, @start, @end);
}

.header {
  .gradient(#42b983, #35495e, to right);
}

// 条件Mixin
.text-size(@size) when (@size <= 12) {
  font-size: 12px;
  color: #999;
}
.text-size(@size) when (@size > 12) and (@size <= 16) {
  font-size: @size;
  color: #666;
}
.text-size(@size) when (@size > 16) {
  font-size: @size;
  color: #333;
}

.small {
  .text-size(10px);  // font-size: 12px, color: #999
}

.medium {
  .text-size(14px);  // font-size: 14px, color: #666
}

.large {
  .text-size(18px);  // font-size: 18px, color: #333
}
```

##### 4. 运算（Operations）

```less
/* ==================== Less运算 ==================== */

@base: 10%;
@filter: 10%;
@var: 10px;

.math {
  // 数字运算
  width: @var + 20px;      // 30px
  height: @var * 2;        // 20px
  margin: @var / 2;        // 5px

  // 百分比运算
  padding: @base + @filter;  // 20%

  // 颜色运算
  color: #888 / 4;         // #222
  background: #008800 + #000080;  // #008880
}

// 计算函数
@col-width: 100px;
@gap: 10px;
@cols: 3;

.container {
  width: @col-width * @cols + @gap * (@cols - 1);
  // 结果: 100 * 3 + 10 * 2 = 320px
}
```

##### 5. 函数（Functions）

```less
/* ==================== Less函数 ==================== */

@color: #42b983;
@base: 50%;

.functions {
  // 颜色函数
  background: lighten(@color, 10%);     // 变亮
  border-color: darken(@color, 10%);    // 变暗
  color: saturate(@color, 20%);         // 增加饱和度
  outline-color: desaturate(@color, 20%); // 降低饱和度

  // 其他函数
  width: percentage(@base);             // 50%
  height: round(3.6px);                 // 4px
  margin: ceil(3.2px);                  // 4px（向上取整）
  padding: floor(3.8px);                // 3px（向下取整）
}
```

##### 6. 命名空间和访问符

```less
/* ==================== Less命名空间 ==================== */

// 定义命名空间
#bundle() {
  .button {
    display: inline-block;
    padding: 10px 20px;
    background: @primary-color;
    color: white;
    border: none;
    border-radius: 4px;
  }

  .input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
}

// 使用
.submit-btn {
  #bundle.button();
}

.username-input {
  #bundle.input();
}
```

#### Less在Vue3中使用

```vue
<style lang="less" scoped>
// 定义组件变量
@primary-color: #42b983;
@text-color: #333;

.user-card {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 12px;
    }
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: @text-color;
  }

  &__body {
    color: #666;
    line-height: 1.6;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
</style>
```

---
