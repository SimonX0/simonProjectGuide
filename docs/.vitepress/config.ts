import { defineConfig } from "vitepress";
import { nav } from "./nav";
import { sidebar } from "./sidebar";

export default defineConfig({
  // 站点配置
  title: "小徐的技术充电站",
  description: "小徐技术充电站 - 从零到企业级项目实战",
  lang: "zh-CN",
  base: "/simonProjectGuide/",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "theme-color", content: "#42b883" }],
    ["meta", { name: "og:type", content: "website" }],
    ["meta", { name: "og:locale", content: "zh-CN" }],
    ["meta", { name: "og:title", content: "小徐的技术充电站" }],
    [
      "meta",
      {
        name: "og:description",
        content: "小徐技术充电站 - 从零到企业级项目实战。",
      },
    ],
    ["meta", { name: "og:image", content: "/og-image.png" }],
    ["link", { rel: "stylesheet", href: "/.vitepress/theme/custom.css" }],
    ["script", { type: "module", src: "/.vitepress/style/loading.js" }],
  ],

  // 主题配置
  themeConfig: {
    // 搜索配置
    search: {
      provider: "local",
    },

    // 导航
    nav,

    // 侧边栏
    sidebar,

    // 社交链接（私有化部署，移除GitHub）
    socialLinks: [],

    // 页脚
    footer: {
      message: "基于 MIT 许可发布",
      copyright: "© Simon 小徐 2026 | 邮箱: esimonx@163.com",
    },

    // 最后更新
    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "short",
      },
    },

    // 大纲（右侧目录）
    outline: {
      level: [2, 3],
      label: "本页目录",
    },

    // 返回顶部
    returnToTopLabel: "回到顶部",

    // 侧边栏菜单标签
    sidebarMenuLabel: "菜单",

    // 启用前进后退导航
    docFooter: {
      prev: '上一章',
      next: '下一章'
    },
  },

  // Markdown配置
  markdown: {
    // 行号
    lineNumbers: true,

    // 代码块主题
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
  },

  // 忽略死链接检查
  ignoreDeadLinks: true,
});
