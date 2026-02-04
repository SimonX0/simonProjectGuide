export const sidebar = {
  '/git/': [
    {
      text: '学习路线',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '学习路线', link: '/git/' },
      ]
    },
    {
      text: '基础入门',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第1章：Git基础入门', link: '/git/chapter-01' },
        { text: '第2章：Git常用命令', link: '/git/chapter-02' },
        { text: '第3章：Git分支管理', link: '/git/chapter-03' },
      ]
    },
    {
      text: '进阶',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第4章：Git工作流程', link: '/git/workflow' },
        { text: '第5章：Git实战技巧', link: '/git/chapter-05' },
      ]
    }
  ],
  '/ai/': [
    {
      text: '学习路线',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '学习路线', link: '/ai/' },
      ]
    },
    {
      text: '基础入门',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第1章：AI辅助开发', link: '/ai/chapter-00' },
        { text: '第2章：工具配置指南', link: '/ai/tools-setup' },
        { text: '第3章：AI应用基础', link: '/ai/chapter-01' },
        { text: '第4章：LangChain框架', link: '/ai/chapter-02' },
      ]
    },
    {
      text: '进阶',
      collapsible: true,
      collapsed: false,
      items: [
        {
          text: '第5章：Prompt工程',
          link: '/ai/chapter-03',
          items: [
            { text: '核心原则', link: '/ai/chapter-03#核心原则' },
            { text: '常用提示词模式', link: '/ai/chapter-03#常用提示词模式' },
            { text: 'Prompt Chaining', link: '/ai/chapter-03#技巧25-prompt-chaining提示词链' },
            { text: '高级技巧', link: '/ai/chapter-03#高级技巧' },
          ]
        },
        { text: '第6章：RAG检索增强', link: '/ai/chapter-04' },
        { text: '第7章：AI Agent', link: '/ai/chapter-05' },
      ]
    },
    {
      text: '拓展',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第8章：实战项目', link: '/ai/chapter-06' },
        {
          text: '第9章：应用进阶',
          link: '/ai/chapter-07',
          items: [
            { text: '主流LLM模型', link: '/ai/chapter-07#主流llm模型对比' },
            { text: 'Claude API', link: '/ai/chapter-07#claude-api使用' },
            { text: '本地模型部署', link: '/ai/chapter-07#开源模型和本地部署' },
            { text: 'Moltbot框架', link: '/ai/chapter-07#moltbot框架' },
            { text: 'LangGraph框架', link: '/ai/chapter-07#langgraph复杂agent框架' },
            { text: 'LangGraph常见模式', link: '/ai/chapter-07#langgraph-常见模式' },
            { text: 'LangGraph实战项目', link: '/ai/chapter-07#实战项目智能内容生成系统' },
            { text: '应用评估', link: '/ai/chapter-07#ai应用评估和测试' },
          ]
        },
      ]
    }
  ],
  '/guide/': [
    {
      text: '学习路线',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '学习路线', link: '/guide/' },
      ]
    },
    {
      text: '基础入门',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第1章：AI辅助前端开发', link: '/guide/chapter-00' },
        { text: '第2章：JavaScript核心基础', link: '/guide/chapter-01' },
        { text: '第3章：Vue3简介与环境搭建', link: '/guide/chapter-02' },
        { text: '第4章：ESLint代码检查', link: '/guide/chapter-03' },
        { text: '第5章：CSS基础语法', link: '/guide/chapter-04' },
        { text: '第6章：CSS预处理器 - Less', link: '/guide/chapter-05' },
        { text: '第7章：CSS预处理器 - SCSS', link: '/guide/chapter-06' },
        { text: '第8章：代码规范', link: '/guide/chapter-07' },
        { text: '第9章：模板语法与数据绑定', link: '/guide/chapter-08' }
      ]
    },
    {
      text: '组件开发',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第10章：计算属性与侦听器', link: '/guide/chapter-09' },
        { text: '第11章：条件渲染与列表渲染', link: '/guide/chapter-10' },
        { text: '第12章：事件处理与表单绑定', link: '/guide/chapter-11' },
        { text: '第13章：组件基础与组件名称定义', link: '/guide/chapter-12' },
        { text: '第14章：组件通信（完整版）', link: '/guide/chapter-13' },
        { text: '第15章：组合式API深入', link: '/guide/chapter-14' },
        { text: '第16章：生命周期与钩子函数', link: '/guide/chapter-15' }
      ]
    },
    {
      text: '企业级开发',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第17章：Vue Router 路由完全指南', link: '/guide/chapter-16' },
        { text: '第18章：VueUse组合式函数库完全指南', link: '/guide/chapter-17' },
        { text: '第19章：Pinia 状态管理', link: '/guide/chapter-18' },
        { text: '第20章：TypeScript + Vue3', link: '/guide/chapter-19' },
        { text: '第21章：高级特性', link: '/guide/chapter-20' },
        { text: '第22章：ElementPlus组件库完全指南', link: '/guide/chapter-21' },
        { text: '第23章：企业级配置', link: '/guide/chapter-22' },
        { text: '第24章：性能优化', link: '/guide/chapter-23' },
        { text: '第25章：Git版本控制与团队协作', link: '/guide/chapter-24' }
      ]
    },
    {
      text: '进阶部分',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第26章：全局异常捕获', link: '/guide/chapter-25' },
        { text: '第27章：API请求拦截', link: '/guide/chapter-26' },
        { text: '第28章：内存管理与溢出处理', link: '/guide/chapter-27' },
        { text: '第29章：调试技巧与工具', link: '/guide/chapter-28' },
        { text: '第30章：微前端架构（qiankun 集成）', link: '/guide/chapter-29' },
        { text: '第31章：前端安全防护', link: '/guide/chapter-30' },
        { text: '第32章：前端测试', link: '/guide/chapter-31' },
        { text: '第33章：表单验证与数据校验', link: '/guide/chapter-32' },
        { text: '第34章：Electron桌面应用开发', link: '/guide/chapter-33' },
        { text: '第35章：国际化（I18n）', link: '/guide/chapter-34' },
        { text: '第36章：前端可视化', link: '/guide/chapter-35' },
        { text: '第37章：前端监控与埋点', link: '/guide/chapter-36' },
        { text: '第38章：前端部署', link: '/guide/chapter-37' },
        { text: '第39章：Vite 插件开发', link: '/guide/chapter-38' },
        { text: '第40章：前端工程化进阶', link: '/guide/chapter-39' }
      ]
    },
    {
      text: '高级拓展',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第41章：Vue3.4+最新特性详解', link: '/guide/chapter-40' },
        { text: '第42章：常见踩坑指南与FAQ', link: '/guide/chapter-41' },
        { text: '第43章：使用 Mock.js 进行数据模拟', link: '/guide/chapter-42' },
        { text: '第44章：服务端渲染(SSR)与Nuxt.js完全指南', link: '/guide/chapter-43' },
        { text: '第45章：移动端开发与响应式设计完全指南', link: '/guide/chapter-44' },
        { text: '第46章：Vue3组件库开发完全指南', link: '/guide/chapter-45' },
        { text: '第47章：性能分析与优化工具深度使用', link: '/guide/chapter-46' },
        { text: '第48章：uni-app跨端应用开发完全指南', link: '/guide/chapter-47' }
      ]
    },
    {
      text: '附录',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '附录A：实战项目', link: '/guide/appendix-projects' },
        { text: '附录B：学习资源推荐', link: '/guide/appendix-resources' },
        { text: '附录C：VSCode配置推荐', link: '/guide/appendix-vscode' },
        { text: '附录D：代码模板与脚手架', link: '/guide/appendix-templates' },
        { text: '附录E：快速开始检查清单', link: '/guide/appendix-checklist' }
      ]
    }
  ]
}
