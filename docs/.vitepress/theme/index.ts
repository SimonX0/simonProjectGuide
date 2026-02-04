// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    // 可以在这里注册全局组件
    // 如果需要添加自定义组件，可以在这里导入
  }
}

export default theme
