# CSS预处理器 - SCSS

## CSS预处理器 - SCSS

> **学习目标**：掌握SCSS预处理器的高级特性
> **核心内容**：SCSS安装配置、变量、嵌套、Mixin、函数、条件循环、模块化

### 什么是SCSS？

SCSS（Sassy CSS）是Sass的第三代，是CSS的预处理器，语法更接近CSS。

**SCSS的特点：**
- 完全兼容CSS3
- 功能更强大（循环、条件、函数等）
- 更好的错误提示
- 社区活跃，资源丰富

#### 安装SCSS

```bash
# npm安装
npm install -D sass

# yarn安装
yarn add -D sass

# pnpm安装
pnpm add -D sass
```

#### SCSS核心特性

##### 1. 变量（Variables）

```scss
/* ==================== SCSS变量 ==================== */

// 定义变量（使用 $ 符号）
$primary-color: #42b983;
$secondary-color: #35495e;
$text-color: #333;
$border-radius: 4px;
$font-size-base: 14px;
$font-family: 'PingFang SC', sans-serif;

// 使用变量
.button {
  background-color: $primary-color;
  color: white;
  border-radius: $border-radius;
  font-size: $font-size-base;
  font-family: $font-family;
}

// 变量作用域
$color: red;

.component {
  $color: blue;  // 局部变量

  color: $color;  // blue
}

.another {
  color: $color;  // red (全局变量)
}

// !default 默认值
$base-color: #42b983 !default;

// !global 全局变量
.component {
  $local-color: #666 !global;
}
```

##### 2. 嵌套（Nesting）

```scss
/* ==================== SCSS嵌套 ==================== */

.navbar {
  background: $secondary-color;
  padding: 0 20px;

  // 嵌套子元素
  .nav-list {
    list-style: none;
    display: flex;
    margin: 0;
    padding: 0;

    .nav-item {
      margin-right: 20px;

      &:last-child {
        margin-right: 0;
      }

      a {
        color: white;
        text-decoration: none;

        // 父选择器引用
        &:hover {
          color: $primary-color;
        }

        &:active {
          color: darken($primary-color, 10%);
        }
      }
    }
  }

  // 属性嵌套
  .box {
    border: {
      width: 1px;
      style: solid;
      color: $primary-color;
    }

    margin: {
      top: 10px;
      left: 20px;
    }
  }

  // 媒体查询嵌套
  .container {
    width: 100%;
    padding: 20px;

    @media (min-width: 768px) {
      width: 750px;
      padding: 30px;
    }

    @media (min-width: 1024px) {
      width: 960px;
      padding: 40px;
    }
  }
}
```

##### 3. Mixin（混合）

```scss
/* ==================== SCSS Mixin ==================== */

// 定义Mixin
@mixin border-radius($radius: 4px) {
  border-radius: $radius;
  -webkit-border-radius: $radius;
}

@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin box-shadow($shadow: 0 2px 8px rgba(0, 0, 0, 0.1)) {
  box-shadow: $shadow;
}

// 使用Mixin
.card {
  @include border-radius(8px);
  @include box-shadow();
  padding: 16px;
}

.flex-container {
  @include flex-center;
  height: 200px;
}

// 复杂Mixin示例
@mixin button-style(
  $bg-color: $primary-color,
  $text-color: white,
  $padding: 10px 20px,
  $radius: 4px
) {
  display: inline-block;
  padding: $padding;
  background-color: $bg-color;
  color: $text-color;
  border: none;
  border-radius: $radius;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: darken($bg-color, 10%);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

// 使用复杂Mixin
.btn-primary {
  @include button-style();
}

.btn-danger {
  @include button-style(#f56c6c, white, 12px 24px, 6px);
}

// 响应式Mixin
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'small' {
    @media (max-width: 576px) { @content; }
  }
  @else if $breakpoint == 'medium' {
    @media (max-width: 768px) { @content; }
  }
  @else if $breakpoint == 'large' {
    @media (max-width: 992px) { @content; }
  }
}

.container {
  padding: 20px;

  @include respond-to('medium') {
    padding: 15px;
  }

  @include respond-to('small') {
    padding: 10px;
  }
}
```

##### 4. 函数（Functions）

```scss
/* ==================== SCSS函数 ==================== */

// 内置函数
$primary-color: #42b983;
$base-font-size: 16px;

.functions {
  // 颜色函数
  color: lighten($primary-color, 10%);      // 变亮10%
  background: darken($primary-color, 20%);  // 变暗20%
  border-color: saturate($primary-color, 30%);    // 增加饱和度
  outline-color: desaturate($primary-color, 30%);  // 降低饱和度
  text-decoration-color: rgba($primary-color, 0.5); // 透明度

  // RGB/HS函数
  background: rgb(66, 185, 131);
  color: hsl(156, 46%, 49%);
  border-color: complement($primary-color);  // 补色
  box-shadow: 0 0 10px invert($primary-color); // 反色

  // 数字函数
  width: abs(-100px);       // 100px
  margin: min(10px, 20px);  // 10px
  padding: max(5px, 10px);  // 10px
  font-size: random(100) + px;  // 1-100px随机数

  // 字符串函数
  &::before {
    content: to-upper-case('hello');  // HELLO
    content: to-lower-case('WORLD');  // world
    content: str-length('test');      // 4
    content: str-insert('Hello', ' World', 5);  // Hello World
  }

  // 列表函数
  $list: 10px 20px 30px;
  margin: length($list);      // 3
  padding: nth($list, 2);     // 20px
  border: append($list, 40px);  // 10px 20px 30px 40px
}

// 自定义函数
@function px-to-rem($px, $base: 16px) {
  @return ($px / $base) * 1rem;
}

.container {
  font-size: px-to-rem(14px);  // 0.875rem
  padding: px-to-rem(16px);    // 1rem
}

// 计算函数
@function calculate-width($columns, $gap: 20px) {
  @return ($columns * 100px) + (($columns - 1) * $gap);
}

.grid-3 {
  width: calculate-width(3);  // 320px
}
```

##### 5. 条件和循环

```scss
/* ==================== SCSS条件与循环 ==================== */

// 条件语句 @if @else
@mixin text-size($size) {
  @if $size == 'small' {
    font-size: 12px;
    color: #999;
  } @else if $size == 'medium' {
    font-size: 14px;
    color: #666;
  } @else if $size == 'large' {
    font-size: 18px;
    color: #333;
  } @else {
    font-size: 14px;
    color: #666;
  }
}

.text-small {
  @include text-size('small');
}

// @for循环
@for $i from 1 through 3 {
  .col-#{$i} {
    width: 100% / 3 * $i;
  }
}
// 生成：
// .col-1 { width: 33.3333%; }
// .col-2 { width: 66.6666%; }
// .col-3 { width: 100%; }

// @each循环
$colors: (
  'primary': #42b983,
  'danger': #f56c6c,
  'warning': #e6a23c,
  'info': #909399
);

@each $name, $color in $colors {
  .btn-#{$name} {
    background-color: $color;
    color: white;

    &:hover {
      background-color: darken($color, 10%);
    }
  }
}

// @while循环
$i: 6;
@while $i > 0 {
  .item-#{$i} {
    width: $i * 10px;
  }
  $i: $i - 2;
}
```

##### 6. 继承（Extend）

```scss
/* ==================== SCSS继承 ==================== */

// 基础样式
%button-base {
  display: inline-block;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

// 继承基础样式
.button {
  @extend %button-base;
  background-color: $primary-color;
  color: white;

  &:hover {
    background-color: darken($primary-color, 10%);
  }
}

.button-outline {
  @extend %button-base;
  background-color: transparent;
  border: 2px solid $primary-color;
  color: $primary-color;
}

// 占位符选择器（%开头）不会被编译到CSS
%text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-title {
  @extend %text-truncate;
  font-size: 18px;
  font-weight: 600;
}
```

##### 7. 模块化（Module）

```scss
/* ==================== SCSS模块化 ==================== */

// _variables.scss（变量文件）
$primary-color: #42b983;
$secondary-color: #35495e;
$border-radius: 4px;

// _mixins.scss（混合文件）
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin border-radius($radius: 4px) {
  border-radius: $radius;
}

// _functions.scss（函数文件）
@function px-to-rem($px, $base: 16px) {
  @return ($px / $base) * 1rem;
}

// main.scss（主文件）
@import 'variables';
@import 'mixins';
@import 'functions';

.container {
  @include flex-center;
  @include border-radius(8px);
  font-size: px-to-rem(14px);
}
```

#### SCSS在Vue3中使用

```vue
<style lang="scss" scoped>
// 导入变量和混合
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

// 使用变量
$card-padding: 16px;

.user-card {
  padding: $card-padding;
  border: 1px solid #eee;
  border-radius: $border-radius;
  transition: all 0.3s ease;

  // 嵌套
  &__header {
    display: flex;
    align-items: center;

    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 12px;
    }
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 4px;
  }

  &__email {
    font-size: 14px;
    color: #999;
  }

  // 响应式
  @media (max-width: 768px) {
    padding: 12px;

    &__header img {
      width: 36px;
      height: 36px;
    }
  }

  // 状态修饰
  &.active {
    border-color: $primary-color;
    background-color: rgba($primary-color, 0.05);
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}
</style>
```

---

### SCSS函数与条件循环实战案例

> **实战场景**：构建一个完整的主题系统和响应式网格布局

#### 案例1：主题色系统（使用函数和条件）

```scss
// src/styles/theme.scss

// ========== 主题变量 ==========
$themes: (
  light: (
    bg-primary: #ffffff,
    bg-secondary: #f5f5f5,
    text-primary: #333333,
    text-secondary: #666666,
    border-color: #e0e0e0,
    shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
  ),
  dark: (
    bg-primary: #1a1a1a,
    bg-secondary: #2d2d2d,
    text-primary: #ffffff,
    text-secondary: #aaaaaa,
    border-color: #404040,
    shadow: 0 2px 8px rgba(0, 0, 0, 0.3)
  )
);

// 当前主题
$current-theme: 'light' !default;

// ========== 主题函数 ==========

// 获取主题变量值
@function theme-get($key, $theme: $current-theme) {
  $theme-map: map-get($themes, $theme);
  @return map-get($theme-map, $key);
}

// 生成主题CSS
@mixin themify($property, $value) {
  #{$property}: $value;
}

// 应用主题（条件判断）
@mixin apply-theme($theme: $current-theme) {
  @if map-has-key($themes, $theme) {
    background-color: theme-get(bg-primary, $theme);
    color: theme-get(text-primary, $theme);
    border-color: theme-get(border-color, $theme);
    box-shadow: theme-get(shadow, $theme);
  } @else {
    @warn "主题 '#{$theme}' 不存在，使用默认主题";
    background-color: theme-get(bg-primary, light);
    color: theme-get(text-primary, light);
  }
}

// 生成所有主题类
@each $theme-name, $theme-colors in $themes {
  .theme-#{$theme-name} {
    @include apply-theme($theme-name);
  }
}

// ========== 实际使用示例 ==========
.card {
  padding: 20px;
  border-radius: 8px;

  // 默认主题
  @include apply-theme('light');

  // 响应式主题切换
  @media (prefers-color-scheme: dark) {
    @include apply-theme('dark');
  }

  // 悬停效果（颜色函数）
  &:hover {
    background-color: lighten(theme-get(bg-primary, light), 5%);
    box-shadow: theme-get(shadow, light), 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  // 禁用状态
  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;

    @include themify(color, theme-get(text-secondary, light));
  }
}

// 按钮变体生成
@each $variant, $color in (primary: #42b983, success: #67c23a, danger: #f56c6c, warning: #e6a23c) {
  .btn-#{$variant} {
    @include button-style($color);

    &:hover {
      background-color: darken($color, 10%);
    }

    &:active {
      background-color: darken($color, 15%);
      transform: translateY(1px);
    }

    // 响应式：移动端调整
    @media (max-width: 768px) {
      padding: 8px 16px;
      font-size: 14px;
    }
  }
}

// 基础按钮样式Mixin
@mixin button-style($bg-color) {
  display: inline-block;
  padding: 10px 20px;
  background-color: $bg-color;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}
```

#### 案例2：响应式网格布局（使用循环和条件）

```scss
// src/styles/grid.scss

// ========== 网格配置 ==========
$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);

$grid-columns: 12;
$grid-gutter: 20px;

// ========== 生成网格列 ==========

// @for循环生成列
@for $i from 1 through $grid-columns {
  .col-#{$i} {
    width: percentage($i / $grid-columns);
  }
}

// 响应式列
@each $breakpoint-name, $min-width in $grid-breakpoints {
  @media (min-width: $min-width) {
    @for $i from 1 through $grid-columns {
      .col-#{$breakpoint-name}-#{$i} {
        width: percentage($i / $grid-columns);
      }
    }
  }
}

// ========== 自动计算列宽 ==========

@function calculate-width($size, $columns: $grid-columns) {
  @if $size == 'auto' {
    @return auto;
  } @else if $size == 'full' {
    @return 100%;
  } @else if $size == 'half' {
    @return 50%;
  } @else if $size == 'third' {
    @return 33.333%;
  } @else if $size == 'quarter' {
    @return 25%;
  } @else {
    @return percentage($size / $columns);
  }
}

// 使用示例
.container {
  @include make-row();

  .sidebar {
    @include make-col(3); // 3/12 = 25%
  }

  .main-content {
    @include make-col(9); // 9/12 = 75%
  }
}

// ========== Mixin集合 ==========

@mixin make-row($gutter: $grid-gutter) {
  display: flex;
  flex-wrap: wrap;
  margin-left: calc(#{$gutter} / -2);
  margin-right: calc(#{$gutter} / -2);

  > * {
    padding-left: calc(#{$gutter} / 2);
    padding-right: calc(#{$gutter} / 2);
  }
}

@mixin make-col($size, $columns: $grid-columns) {
  flex: 0 0 calculate-width($size, $columns);
  max-width: calculate-width($size, $columns);
}

@mixin make-col-offset($size, $columns: $grid-columns) {
  $offset: calculate-width($size, $columns);
  margin-left: if($offset == 0, 0, $offset);
}
```

---

### SCSS继承与模块化实战案例

> **实战场景**：企业级UI组件库样式系统

#### 案例1：组件库基础样式系统

```scss
// src/styles/ui/components/_buttons.scss

// ========== 占位符选择器（不会被编译） ==========

%btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
  transition: all 0.15s ease-in-out;
  border-radius: 4px;

  &:focus {
    outline: 2px solid rgba(66, 185, 131, 0.25);
    outline-offset: 2px;
  }

  &:disabled,
  &.is-disabled {
    opacity: 0.65;
    cursor: not-allowed;
    pointer-events: none;
  }
}

%btn-icon {
  padding: 10px;
  width: 40px;
  height: 40px;
}

%btn-lg {
  padding: 12px 24px;
  font-size: 16px;
}

%btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

%btn-block {
  display: flex;
  width: 100%;
}

// ========== 尺寸变体 ==========

.btn {
  @extend %btn-base;

  &--lg {
    @extend %btn-base;
    @extend %btn-lg;
  }

  &--sm {
    @extend %btn-base;
    @extend %btn-sm;
  }

  &--icon {
    @extend %btn-base;
    @extend %btn-icon;
  }

  &--block {
    @extend %btn-base;
    @extend %btn-block;
  }
}

// ========== 类型变体 ==========

.btn--primary {
  @extend %btn-base;
  background-color: $primary-color;
  border-color: $primary-color;
  color: #fff;

  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
    border-color: darken($primary-color, 10%);
  }

  &:active:not(:disabled) {
    background-color: darken($primary-color, 15%);
    border-color: darken($primary-color, 15%);
  }
}

.btn--secondary {
  @extend %btn-base;
  background-color: #fff;
  border-color: #dcdfe6;
  color: #606266;

  &:hover:not(:disabled) {
    color: $primary-color;
    border-color: lighten($primary-color, 20%);
    background-color: lighten($primary-color, 95%);
  }

  &:active:not(:disabled) {
    color: darken($primary-color, 10%);
    border-color: $primary-color;
  }
}

.btn--danger {
  @extend %btn-base;
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: #fff;

  &:hover:not(:disabled) {
    background-color: darken(#f56c6c, 10%);
    border-color: darken(#f56c6c, 10%);
  }
}

.btn--ghost {
  @extend %btn-base;
  background-color: transparent;
  border-color: currentColor;
  color: inherit;

  &:hover:not(:disabled) {
    background-color: rgba(66, 185, 131, 0.1);
  }
}

// ========== 文本截断工具类 ==========

%text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

%text-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-ellipsis {
  @extend %text-ellipsis;
}

.text-clamp-2 {
  @extend %text-clamp-2;
}
```

#### 案例2：表单组件继承系统

```scss
// src/styles/ui/components/_forms.scss

// ========== 输入框基础样式 ==========

%input-base {
  display: block;
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: $text-color;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
  }

  &:disabled {
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #c0c4cc;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #a8abb2;
  }
}

// ========== 不同尺寸输入框 ==========

.form-control {
  @extend %input-base;

  &--lg {
    padding: 12px 16px;
    font-size: 16px;
  }

  &--sm {
    padding: 6px 10px;
    font-size: 12px;
  }
}

// ========== 表单组 ==========

.form-group {
  margin-bottom: 16px;

  &__label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: $text-color;

    &--required {
      &::after {
        content: '*';
        color: #f56c6c;
        margin-left: 4px;
      }
    }
  }

  &__error {
    margin-top: 6px;
    font-size: 12px;
    color: #f56c6c;
  }

  &__hint {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}
```

#### 案例3：模块化架构（完整项目结构）

```scss
// ========== 项目结构 ==========
// src/styles/
// ├── abstracts/
// │   ├── _variables.scss      # 变量
// │   ├── _functions.scss       # 函数
// │   └── _mixins.scss          # 混合
// ├── base/
// │   ├── _reset.scss          # 重置样式
// │   ├── _typography.scss      # 字体排版
// │   └── _utilities.scss      # 工具类
// ├── components/
// │   ├── _buttons.scss        # 按钮
// │   ├── _forms.scss          # 表单
// │   ├── _cards.scss          # 卡片
// │   └── _modals.scss         # 模态框
// ├── layout/
// │   ├── _header.scss         # 头部
// │   ├── _footer.scss         # 底部
// │   ├── _sidebar.scss        # 侧边栏
// │   └── _grid.scss           # 网格
// ├── pages/
// │   ├── _home.scss           # 首页
// │   └── _login.scss          # 登录
// └── main.scss                # 主入口

// ========== main.scss ==========
@forward 'abstracts/variables';
@forward 'abstracts/functions';
@forward 'abstracts/mixins';

@forward 'base/reset';
@forward 'base/typography';
@forward 'base/utilities';

@forward 'components/buttons';
@forward 'components/forms';
@forward 'components/cards';
@forward 'components/modals';

@forward 'layout/header';
@forward 'layout/footer';
@forward 'layout/sidebar';
@forward 'layout/grid';

@forward 'pages/home';
@forward 'pages/login';

// 导入（包含实际样式）
@use 'abstracts/variables' as *;
@use 'abstracts/functions' as *;
@use 'abstracts/mixins' as *;

@use 'base/reset';
@use 'base/typography';
@use 'base/utilities';

@use 'components/buttons';
@use 'components/forms';
@use 'components/cards';
@use 'components/modals';

@use 'layout/header';
@use 'layout/footer';
@use 'layout/sidebar';
@use 'layout/grid';

@use 'pages/home';
@use 'pages/login';

// ========== _variables.scss ==========
@breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);

$colors: (
  primary: (
    base: #42b983,
    light: #66d19a,
    lighter: #a3e6c2,
    dark: #35a872,
    darker: #2c8c63
  ),
  secondary: (
    base: #35495e,
    light: #5a6e7c,
    dark: #263442
  ),
  danger: (
    base: #f56c6c,
    light: #f78989,
    dark: #c0322b
  ),
  warning: (
    base: #e6a23c,
    light: #ebb563,
    dark: #b8822a
  ),
  success: (
    base: #67c23a,
    light: #85ce61,
    dark: #4ea820
  ),
  info: (
    base: #909399,
    light: #a6a9ad,
    dark: #6b7278
  )
);

$spacers: (
  0: 0,
  1: 0.25rem,    // 4px
  2: 0.5rem,     // 8px
  3: 0.75rem,    // 12px
  4: 1rem,       // 16px
  5: 1.25rem,    // 20px
   6: 1.5rem,     // 24px
  8: 2rem,       // 32px
  10: 2.5rem,    // 40px
  12: 3rem,      // 48px
  16: 4rem,      // 64px
  20: 5rem       // 80px
);

$font-sizes: (
  xs: 0.75rem,    // 12px
  sm: 0.875rem,   // 14px
  base: 1rem,     // 16px
  lg: 1.125rem,   // 18px
  xl: 1.25rem,    // 20px
  2xl: 1.5rem,    // 24px
  3xl: 1.875rem,  // 30px
  4xl: 2.25rem    // 36px
);

// ========== _functions.scss ==========

@function breakpoint($name) {
  @return map-get($breakpoints, $name, null);
}

@function breakpoint-min($name) {
  @return breakpoint($name);
}

@function breakpoint-max($name) {
  @return breakpoint($name) - 1px;
}

@function color($color-name, $variant: 'base') {
  @return map-get(map-get($colors, $color-name), $variant);
}

@function spacer($size: 1) {
  @return map-get($spacers, $size, 1rem);
}

@function font-size($size: 'base') {
  @return map-get($font-sizes, $size, 1rem);
}

// ========== _mixins.scss ==========

@mixin respond-above($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: breakpoint($breakpoint)) {
      @content;
    }
  } @else {
    @warn "断点 `#{$breakpoint}` 不存在";
  }
}

@mixin respond-below($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (max-width: breakpoint-max($breakpoint)) {
      @content;
    }
  }
}

@mixin respond-between($lower, $upper) {
  @media (min-width: breakpoint($lower)) and (max-width: breakpoint-max($upper)) {
    @content;
  }
}

@mixin text-color($color, $variant: 'base') {
  color: color($color, $variant);
}

@mixin bg-color($color, $variant: 'base') {
  background-color: color($color, $variant);
}

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@mixin cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@mixin clearfix {
  &::after {
    content: '';
    display: block;
    clear: both;
  }
}
```

---

### Vue3项目完整SCSS架构实战

> **项目场景**：中大型Vue3应用的完整样式架构

#### 项目结构

```bash
src/
├── styles/
│   ├── abstracts/              # 抽象层（不输出CSS）
│   │   ├── _variables.scss     # 变量定义
│   │   ├── _functions.scss      # 函数定义
│   │   └── _mixins.scss         # Mixin定义
│   │
│   ├── base/                   # 基础样式
│   │   ├── _reset.scss          # CSS重置
│   │   ├── _typography.scss     # 字体排版
│   │   └── _utilities.scss      # 工具类
│   │
│   ├── components/             # 组件样式
│   │   ├── _buttons.scss       # 按钮组件
│   │   ├── _forms.scss         # 表单组件
│   │   ├── _cards.scss         # 卡片组件
│   │   ├── _table.scss         # 表格组件
│   │   └── _modal.scss         # 模态框组件
│   │
│   ├── layout/                 # 布局样式
│   │   ├── _header.scss        # 页头
│   │   ├── _footer.scss        # 页脚
│   │   ├── _sidebar.scss       # 侧边栏
│   │   └── _grid.scss          # 网格布局
│   │
│   ├── pages/                  # 页面样式
│   │   ├── _home.scss          # 首页
│   │   ├── _login.scss         # 登录页
│   │   ├── _dashboard.scss     # 仪表板
│   │   └── _profile.scss       # 个人资料
│   │
│   ├── themes/                 # 主题样式
│   │   ├── _light.scss         # 浅色主题
│   │   ├── _dark.scss          # 深色主题
│   │   └── _variables.scss     # 主题变量
│   │
│   ├── vendors/                # 第三方库
│   │   └── _element-plus.scss   # ElementPlus覆盖
│   │
│   └── main.scss                # 主入口文件
│
└── assets/
    └── styles/
        └── global.scss           # 全局样式（在main.ts引入）
```

#### _variables.scss（变量集中管理）

```scss
// src/styles/abstracts/_variables.scss

// ========== 颜色系统 ==========
$primary-color: #42b983;
$secondary-color: #35495e;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;

// 颜色映射
$colors: (
  primary: (
    base: $primary-color,
    light: lighten($primary-color, 10%),
    dark: darken($primary-color, 10%)
  ),
  // ...其他颜色映射
);

// ========== 字体系统 ==========
$font-family-base: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
$font-family-code: 'Fira Code', 'Source Code Pro', 'Monaco', 'Consolas', monospace;

$font-size-base: 14px;
$font-size-lg: 16px;
$font-size-sm: 12px;

// ========== 间距系统 ==========
$spacing: (
  0: 0,
  1: 4px,
  2: 8px,
  3: 12px,
  4: 16px,
  5: 20px,
  6: 24px,
  8: 32px,
  10: 40px,
  12: 48px,
  16: 64px,
  20: 80px
);

// ========== 断点系统 ==========
$breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);

// ========== 圆角系统 ==========
$border-radius: (
  none: 0,
  sm: 2px,
  base: 4px,
  lg: 8px,
  xl: 12px,
  full: 9999px
);

// ========== 阴影系统 ==========
$shadows: (
  sm: 0 1px 2px rgba(0, 0, 0, 0.05),
  base: 0 2px 8px rgba(0, 0, 0, 0.1),
  lg: 0 4px 16px rgba(0, 0, 0, 0.15),
  xl: 0 8px 32px rgba(0, 0, 0, 0.2)
);

// ========== z-index层级 ==========
$z-index: (
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal-backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070
);
```

#### _functions.scss（函数库）

```scss
// src/styles/abstracts/_functions.scss

// 颜色函数
@function color($color, $variant: 'base') {
  @return map-get($map-get($colors, $color), $variant);
}

// 间距函数
@function spacing($size: 4) {
  @return map-get($spacing, $size, $size * 1px);
}

@function spacer($multiplier: 1) {
  @return spacing($base) * $multiplier;
}

// 断点函数
@function breakpoint($name) {
  @return map-get($breakpoints, $name, null);
}

@mixin respond-above($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

@mixin respond-below($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @max-width: map-get($breakpoints, $breakpoint) - 1px {
      @content;
    }
  }
}

// z-index函数
@function z-index($key) {
  @return map-get($z-index, $key, null);
}

// 字体大小函数
@function font-size($size) {
  @return map-get($font-sizes, $size, null);
}
```

#### _mixins.scss（Mixin库）

```scss
// src/styles/abstracts/_mixins.scss

// Flexbox居中
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// 文本截断
@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin text-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 绝对居中
@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

// 宽高比
@mixin aspect-ratio($ratio) {
  aspect-ratio: $ratio;

  @supports not (aspect-ratio: 1) {
    $x: 100%;
    @if $ratio == 1/1 {
      $x: 100%;
    } @else if $ratio == 16/9 {
      $x: calc(16 / 9 * 100%);
    }
    position: relative;

    &::before {
      content: '';
      display: block;
      padding-top: calc(1 / $ratio * 100%);
    }

    > * {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
}

// 滚动条样式
@mixin custom-scrollbar($width: 6px, $track-color: #f1f1f1, $thumb-color: #c1c1c1) {
  &::-webkit-scrollbar {
    width: $width;
    height: $width;
  }

  &::-webkit-scrollbar-track {
    background: $track-color;
  }

  &::-webkit-scrollbar-thumb {
    background: $thumb-color;
    border-radius: 3px;

    &:hover {
      background: darken($thumb-color, 10%);
    }
  }
}
```

#### main.scss（主入口）

```scss
// src/styles/main.scss

// ========== 1. 抽象层导入（不输出） ==========
@forward 'abstracts/variables';
@forward 'abstracts/functions';
@forward 'abstracts/mixins';

// ========== 2. 基础样式 ==========
@use 'base/reset';
@use 'base/typography';
@use 'base/utilities';

// ========== 3. 组件样式 ==========
@use 'components/buttons';
@use 'components/forms';
@use 'components/cards';
@use 'components/table';
@use 'components/modal';

// ========== 4. 布局样式 ==========
@use 'layout/header';
@use 'layout/footer';
@use 'layout/sidebar';
@use 'layout/grid';

// ========== 5. 页面样式 ==========
@use 'pages/home';
@use 'pages/login';
@use 'pages/dashboard';

// ========== 6. 主题样式 ==========
@use 'themes/light';
@use 'themes/dark';

// ========== 7. 应用抽象层（使用@use） ==========
@use 'abstracts/variables' as *;
@use 'abstracts/functions' as *;
@use 'abstracts/mixins' as *;

// ========== 8. 全局样式 ==========
:root {
  --color-primary: #{$primary-color};
  --color-secondary: #{$secondary-color};
  --spacing-base: #{spacing(4)};
  --border-radius-base: #{map-get($border-radius, base)};
  --box-shadow-base: #{map-get($shadows, base)};
}

body {
  font-family: $font-family-base;
  font-size: $font-size-base;
  color: $text-color;
  background-color: $bg-color;
  line-height: 1.6;
  @include custom-scrollbar();
}

// ========== 9. 工具类 ==========
@each $name, $value in $spacing {
  .m-#{$name} { margin: $value !important; }
  .mt-#{$name} { margin-top: $value !important; }
  .mb-#{$name} { margin-bottom: $value !important; }
  .ml-#{$name} { margin-left: $value !important; }
  .mr-#{$name} { margin-right: $value !important; }
  .mx-#{$name} { margin-left: $value !important; margin-right: $value !important; }
  .my-#{$name} { margin-top: $value !important; margin-bottom: $value !important; }
  .p-#{$name} { padding: $value !important; }
}

.text-left { text-align: left !important; }
.text-center { text-align: center !important; }
.text-right { text-align: right !important; }

// ========== 10. 主题切换支持 ==========
.theme-dark {
  @include bg-color(dark);
  @include text-color(light);
}

.theme-light {
  @include bg-color(light);
  @include text-color(dark);
}
```

#### 在Vue3中使用

```vue
<!-- App.vue -->
<template>
  <div id="app" :class="[`theme-${currentTheme}`]">
    <AppHeader />
    <main class="app-main">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentTheme = ref<'light' | 'dark'>('light')

// 切换主题
const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  document.documentElement.className = `theme-${currentTheme.value}`
}
</script>

<style lang="scss">
// 导入全局样式（在vite.config.ts中配置自动导入）
@import '@/styles/main.scss';

.app-main {
  min-height: calc(100vh - 120px);
  padding: spacer(4);

  @include respond-above(md) {
    padding: spacer(6);
  }
}
</style>
```

#### vite.config.ts配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        // 自动导入变量和函数到每个组件
        additionalData: `
          @use "@/styles/abstracts/variables.scss" as *;
          @use "@/styles/abstracts/functions.scss" as *;
          @use "@/styles/abstracts/mixins.scss" as *;
        `,
        // 全局样式导入
        importer: (url) => {
          // 允许使用 @alias 导入
          if (url.startsWith('@/')) {
            return url.replace(/^@\//, `${__dirname}/src/`)
          }
          return url
        },
        // scss全局变量（兼容性）
        javascriptEnabled: true
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

---

### SCSS最佳实践总结

| 实践 | 说明 | 示例 |
|------|------|------|
| **模块化** | 按功能分离文件 | `abstracts/`, `components/`, `layout/` |
| **变量集中** | 统一管理变量 | `_variables.scss` |
| **函数封装** | 复用计算逻辑 | `px-to-rem()`, `color()` |
| **Mixin复用** | 避免重复代码 | `@mixin flex-center` |
| **占位符** | 使用 `%` 定义不输出的样式 | `%btn-base` |
| **@use优先** | 优先使用 `@use` 而非 `@import` | `@use 'variables' as *;` |
| **命名空间** | 避免命名冲突 | 使用 BEM 命名 |

---

### CSS/Less/SCSS 对比总结

| 特性 | CSS | Less | SCSS |
|------|-----|------|------|
| **语法** | 原生CSS | 使用@定义变量 | 使用$定义变量 |
| **嵌套** | CSS原生支持嵌套（较新） | 支持 | 支持 |
| **变量** | CSS原生变量（现代浏览器） | @变量名 | $变量名 |
| **Mixin** | 无 | 支持 | 支持 |
| **函数** | calc()等内置函数 | 内置函数 | 内置+自定义函数 |
| **条件/循环** | 无 | 支持 | 支持（更强） |
| **模块化** | @import | @import | @import + @use/@forward |
| **浏览器支持** | 所有浏览器 | 需编译 | 需编译 |
| **学习难度** | 简单 | 中等 | 中等偏上 |
| **功能强度** | 基础 | 中等 | 强大 |

#### 选择建议

```yaml
选择CSS：
  - 小型项目
  - 不需要复杂样式逻辑
  - 团队成员对预处理器不熟悉

选择Less：
  - 中小型项目
  - 需要基本变量和嵌套
  - 希望学习曲线平缓

选择SCSS：
  - 大型项目
  - 需要复杂样式逻辑（函数、循环、条件）
  - 追求更强大的功能
  - 团队有Sass使用经验
```

---

### Vue3中配置CSS预处理器

#### Vite配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  css: {
    // CSS预处理器配置
    preprocessorOptions: {
      // Less配置
      less: {
        // 全局变量
        modifyVars: {
          'primary-color': '#42b983',
          'border-radius': '4px'
        },
        // 自动导入
        additionalData: `@import "@/styles/variables.less";`,
        javascriptEnabled: true
      },

      // SCSS配置
      scss: {
        // 全局变量（自动注入到每个组件）
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  }
})
```

#### 全局样式文件结构

```bash
src/styles/
├── variables.scss     # 全局变量
├── mixins.scss        # 全局Mixin
├── functions.scss     # 全局函数
└── index.scss         # 样式入口
```

```scss
// variables.scss
$primary-color: #42b983;
$secondary-color: #35495e;

// mixins.scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// index.scss
@import './variables';
@import './mixins';

// main.ts中引入
import './styles/index.scss'
```

---
