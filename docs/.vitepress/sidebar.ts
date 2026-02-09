export const sidebar = {
  '/interview/': [
    {
      text: '学习路线',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '学习路线', link: '/interview/' }
      ]
    },
    {
      text: '前端开发面试题',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '学习路线', link: '/interview/frontend/' },
        {
          text: '📘 Vue3 技术栈专项',
          collapsible: true,
          collapsed: false,
          items: [
            {
              text: '📗 中级面试题',
              collapsible: true,
              collapsed: false,
              items: [
                { text: 'Vue3核心面试题', link: '/interview/frontend/vue3/intermediate/vue3-core' },
                { text: '组件开发面试题', link: '/interview/frontend/vue3/intermediate/component-development' },
                { text: '路由与状态管理面试题', link: '/interview/frontend/vue3/intermediate/routing-state' }
              ]
            },
            {
              text: '📕 高级面试题',
              collapsible: true,
              collapsed: false,
              items: [
                { text: 'Vue3高级进阶面试题', link: '/interview/frontend/vue3/advanced/vue3-advanced' }
              ]
            }
          ]
        },
        {
          text: '⚛️ React 技术栈专项',
          collapsible: true,
          collapsed: false,
          items: [
            {
              text: '📗 中级面试题',
              collapsible: true,
              collapsed: false,
              items: [
                { text: 'React核心面试题', link: '/interview/frontend/react/intermediate/react-basics' }
              ]
            },
            {
              text: '📕 高级面试题',
              collapsible: true,
              collapsed: false,
              items: [
                { text: 'React 18+与Next.js 14+面试题', link: '/interview/frontend/react/advanced/react-nextjs' }
              ]
            }
          ]
        },
        {
          text: '▲ Next.js 技术栈专项',
          collapsible: true,
          collapsed: false,
          items: [
            {
              text: '📗 中级面试题',
              collapsible: true,
              collapsed: false,
              items: [
                { text: 'Next.js基础面试题', link: '/interview/frontend/nextjs/intermediate/nextjs-basics' }
              ]
            },
            {
              text: '📕 高级面试题',
              collapsible: true,
              collapsed: false,
              items: [
                { text: 'Next.js高级进阶面试题', link: '/interview/frontend/nextjs/advanced/nextjs-advanced' }
              ]
            }
          ]
        },
        {
          text: '🌟 Nuxt 技术栈专项',
          collapsible: true,
          collapsed: false,
          items: [
            {
              text: '📗 中级面试题',
              collapsible: true,
              collapsed: false,
              items: [
                { text: 'Nuxt基础面试题', link: '/interview/frontend/nuxt/intermediate/nuxt-basics' }
              ]
            },
            {
              text: '📕 高级面试题',
              collapsible: true,
              collapsed: false,
              items: [
                { text: 'Nuxt高级进阶面试题', link: '/interview/frontend/nuxt/advanced/nuxt-advanced' }
              ]
            }
          ]
        }
      ]
    },
    {
      text: 'AI面试题',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '学习路线', link: '/interview/ai/' },
        {
          text: '中级面试题',
          items: [
            { text: '第1章：Prompt工程基础', link: '/interview/ai/intermediate/chapter-01' },
            { text: '第2章：LangChain框架', link: '/interview/ai/intermediate/chapter-02' },
            { text: '第3章：RAG检索增强', link: '/interview/ai/intermediate/chapter-03' }
          ]
        },
        {
          text: '高级面试题',
          items: [
            { text: '第4章：Agent架构设计', link: '/interview/ai/advanced/chapter-04' },
            { text: '第5章：模型调优与部署', link: '/interview/ai/advanced/chapter-05' },
            { text: '第6章：AI应用实战', link: '/interview/ai/advanced/chapter-06' },
            { text: '第7章：AI大型项目实战面试题', link: '/interview/ai/advanced/chapter-07' }
          ]
        }
      ]
    },
    {
      text: 'Git面试题',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '学习路线', link: '/interview/git/' },
        {
          text: '中级面试题',
          items: [
            { text: '第1章：Git基础命令', link: '/interview/git/intermediate/chapter-01' },
            { text: '第2章：分支管理', link: '/interview/git/intermediate/chapter-02' },
            { text: '第3章：工作流程', link: '/interview/git/intermediate/chapter-03' }
          ]
        },
        {
          text: '高级面试题',
          items: [
            { text: '第4章：Git高级技巧', link: '/interview/git/advanced/chapter-04' },
            { text: '第5章：团队协作最佳实践', link: '/interview/git/advanced/chapter-05' },
            { text: '第6章：Git性能优化', link: '/interview/git/advanced/chapter-06' }
          ]
        }
      ]
    },
    {
      text: 'DevOps面试题',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '学习路线', link: '/interview/devops/' },
        {
          text: '中级面试题',
          items: [
            { text: '第1章：容器化与编排', link: '/interview/devops/intermediate/chapter-01' },
            { text: '第2章：CI/CD基础', link: '/interview/devops/intermediate/chapter-02' },
            { text: '第3章：监控与日志', link: '/interview/devops/intermediate/chapter-03' }
          ]
        },
        {
          text: '高级面试题',
          items: [
            { text: '第4章：云原生架构', link: '/interview/devops/advanced/chapter-04' },
            { text: '第5章：DevSecOps与安全', link: '/interview/devops/advanced/chapter-05' },
            { text: '第6章：服务网格与GitOps', link: '/interview/devops/advanced/chapter-06' },
            { text: '第7章：DevOps企业级项目实战面试题', link: '/interview/devops/advanced/chapter-07' }
          ]
        }
      ]
    }
  ],
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
    },
    {
      text: '附录',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '附录：Git命令速查手册', link: '/git/appendix' }
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
            { text: '高级技巧', link: '/ai/chapter-03#高级技巧' },
          ]
        },
        { text: '第6章：RAG检索增强', link: '/ai/chapter-04' },
        { text: '第7章：AI Agent', link: '/ai/chapter-05' },
      ]
    },
    {
      text: '🚀 企业级实战项目',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第8章：AI 完全实战项目 - 企业级智能客服系统', link: '/ai/chapter-08' },
        { text: '第9章：AI 完全实战项目 - 企业级数据分析与商业智能平台', link: '/ai/chapter-09' },
        { text: '第10章：AI 完全实战项目 - 多模态内容生成与管理平台', link: '/ai/chapter-10' },
      ]
    },
    {
      text: '拓展',
      collapsible: true,
      collapsed: false,
      items: [
        {
          text: '第12章：应用进阶',
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
    },
    {
      text: '附录',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '附录：AI工具速查手册', link: '/ai/appendix-tools' }
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
      text: '📘 Vue3 技术栈',
      collapsible: true,
      collapsed: false,
      items: [
        {
          text: '基础入门',
          collapsible: true,
          collapsed: false,
          items: [
            {
              text: '第1章：AI辅助前端开发',
              link: '/guide/chapter-00',
              items: [
                { text: '为什么学习 Vue3', link: '/guide/chapter-00#为什么学习-vue3' },
                { text: '学习路径图', link: '/guide/chapter-00#学习路径图' },
                { text: 'AI 辅助开发', link: '/guide/chapter-00#为什么需要-ai-辅助开发' }
              ]
            },
            {
              text: '第2章：JavaScript核心基础',
              link: '/guide/chapter-01',
              items: [
                { text: '数组方法完全指南', link: '/guide/chapter-01#数组方法完全指南' },
                { text: '遍历方法', link: '/guide/chapter-01#遍历方法' },
                { text: '查找方法', link: '/guide/chapter-01#查找方法' },
              ]
            },
            {
              text: '第3章：Vue3简介与环境搭建',
              link: '/guide/chapter-02',
              items: [
                { text: '什么是Vue3', link: '/guide/chapter-02#什么是vue3' },
                { text: '开发环境搭建', link: '/guide/chapter-02#开发环境搭建' },
                { text: 'SFC单文件组件', link: '/guide/chapter-02#sfc单文件组件' },
              ]
            },
            { text: '第4章：ESLint代码检查', link: '/guide/chapter-03' },
            {
              text: '第5章：CSS基础语法',
              link: '/guide/chapter-04',
              items: [
                { text: '什么是CSS', link: '/guide/chapter-04#什么是css' },
                { text: 'CSS选择器详解', link: '/guide/chapter-04#css选择器详解' },
                { text: 'DIV盒子模型', link: '/guide/chapter-04#div盒子模型完全指南' }
              ]
            },
            {
              text: '第6章：CSS预处理器 - Less',
              link: '/guide/chapter-05',
              items: [
                { text: '什么是Less', link: '/guide/chapter-05#什么是less' },
                { text: 'Less核心特性', link: '/guide/chapter-05#less核心特性' }
              ]
            },
            {
              text: '第7章：CSS预处理器 - SCSS',
              link: '/guide/chapter-06',
              items: [
                { text: '什么是SCSS', link: '/guide/chapter-06#什么是scss' },
                { text: 'SCSS核心特性', link: '/guide/chapter-06#scss核心特性' }
              ]
            },
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
            {
              text: '第14章：组件通信（完整版）',
              link: '/guide/chapter-13',
              items: [
                { text: 'Props 父传子', link: '/guide/chapter-13#props-父传子详解' },
                { text: 'Emit 子传父', link: '/guide/chapter-13#emit-子传父详解' },
                { text: 'Provide/Inject', link: '/guide/chapter-13#provide--inject-跨层级通信' },
                { text: '插槽 Slots', link: '/guide/chapter-13#插槽-slots' },
                { text: '作用域插槽', link: '/guide/chapter-13#作用域插槽' }
              ]
            },
            {
              text: '第15章：组合式API深入',
              link: '/guide/chapter-14',
              items: [
                { text: 'ref 和 reactive', link: '/guide/chapter-14#ref-和-reactive' },
                { text: 'computed 和 watch', link: '/guide/chapter-14#computed-和-watch' },
                { text: '组合式函数', link: '/guide/chapter-14#组合式函数composables' },
                { text: '⭐ 高级特性', link: '/guide/chapter-14-advanced' }
              ]
            },
            {
              text: '第16章：生命周期与钩子函数',
              link: '/guide/chapter-15',
              items: [
                { text: '生命周期钩子使用', link: '/guide/chapter-15#生命周期钩子使用' },
                { text: '生命周期实战应用', link: '/guide/chapter-15#生命周期实战应用场景' }
              ]
            }
          ]
        },
        {
          text: '企业级开发',
          collapsible: true,
          collapsed: false,
          items: [
            {
              text: '第17章：Vue Router 路由完全指南',
              link: '/guide/chapter-16',
              items: [
                { text: '安装和配置', link: '/guide/chapter-16#安装和配置' },
                { text: '路由使用', link: '/guide/chapter-16#路由使用' },
                { text: '编程式导航', link: '/guide/chapter-16#编程式导航' },
                { text: '路由守卫与权限控制', link: '/guide/chapter-16#路由守卫与权限控制' },
                { text: '⭐ 高级特性', link: '/guide/chapter-16-advanced' }
              ]
            },
            {
              text: '第18章：VueUse组合式函数库完全指南',
              link: '/guide/chapter-17',
              items: [
                { text: 'VueUse简介与安装', link: '/guide/chapter-17#vueuse简介与安装' },
                { text: '核心函数详解', link: '/guide/chapter-17#核心函数详解' },
                { text: '动画相关函数', link: '/guide/chapter-17#动画相关函数' },
              ]
            },
            {
              text: '第19章：Pinia 状态管理',
              link: '/guide/chapter-18',
              items: [
                { text: '⭐ 高级特性', link: '/guide/chapter-18-advanced' }
              ]
            },
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
            { text: '第48章：uni-app跨端应用开发完全指南', link: '/guide/chapter-47' },
            { text: '第49章：Vite 5.x构建工具完全指南', link: '/guide/chapter-48' },
            { text: '第50章：Bun包管理器完全指南', link: '/guide/chapter-49' },
          ]
        },
        {
          text: '🚀 企业级实战项目',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第51章：Vue3 完全实战项目 - 企业级后台管理系统', link: '/guide/chapter-50-project' },
            { text: '第52章：Vue3 完全实战项目 - 企业级SaaS平台', link: '/guide/chapter-51-project' },
            { text: '第53章：Vue3 完全实战项目 - 移动端+管理后台全栈应用', link: '/guide/chapter-52-project' },
            { text: '第54章：Vue3 完全实战项目 - 微前端企业级应用平台 (qiankun)', link: '/guide/chapter-53-project' },
            { text: '第55章：Vue3 完全实战项目 - 基于MicroApp的企业级微电商平台 (京东)', link: '/guide/chapter-54-project' },
          ]
        },
        {
          text: '附录',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '附录：Vue3开发工具速查手册', link: '/guide/vue3/appendix-tools' }
          ]
        }
      ]
    },
    {
      text: '⚛️ React 18+ 技术栈',
      collapsible: true,
      collapsed: false,
      items: [
        {
          text: '📚 学习路线',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '学习路线', link: '/guide/react/' }
          ]
        },
        {
          text: '基础入门',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第1章：React 18+环境搭建与基础', link: '/guide/react/chapter-51' },
            { text: '第2章：JSX语法与组件基础', link: '/guide/react/chapter-52' },
            { text: '第3章：Props与State详解', link: '/guide/react/chapter-53' },
            { text: '第4章：事件处理与条件渲染', link: '/guide/react/chapter-54' },
            { text: '第5章：列表渲染与Keys', link: '/guide/react/chapter-55' },
            { text: '第6章：表单处理（受控/非受控）', link: '/guide/react/chapter-56' }
          ]
        },
        {
          text: 'React Hooks 完全指南',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第7章：useState与useEffect基础', link: '/guide/react/chapter-57' },
            { text: '第8章：useContext与useReducer', link: '/guide/react/chapter-58' },
            { text: '第9章：useRef与useMemo', link: '/guide/react/chapter-59' },
            { text: '第10章：useCallback与性能优化', link: '/guide/react/chapter-60' },
            { text: '第11章：自定义Hooks开发', link: '/guide/react/chapter-61' },
            { text: '第12章：Hooks最佳实践与常见陷阱', link: '/guide/react/chapter-62' }
          ]
        },
        {
          text: 'React生态与进阶',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第13章：React Router 6+完全指南', link: '/guide/react/chapter-63' },
            { text: '第14章：状态管理：Zustand完全指南', link: '/guide/react/chapter-64' },
            { text: '第15章：状态管理：Jotai与Recoil', link: '/guide/react/chapter-65' },
            { text: '第16章：TanStack Query（React Query）', link: '/guide/react/chapter-66' },
            { text: '第17章：React Hook Form表单管理', link: '/guide/react/chapter-67' }
          ]
        },
        {
          text: 'React 18+ 并发特性',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第18章：自动批处理（Automatic Batching）', link: '/guide/react/chapter-68' },
            { text: '第19章：Suspense与数据获取', link: '/guide/react/chapter-69' },
            { text: '第20章：useTransition与useDeferredValue', link: '/guide/react/chapter-70' },
            { text: '第21章：useId与并发渲染', link: '/guide/react/chapter-71' },
            { text: '第22章：React Server Components', link: '/guide/react/chapter-72' }
          ]
        },
        {
          text: 'React 19 新特性',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第23章：React 19新特性概览', link: '/guide/react/chapter-73' },
            { text: '第24章：Actions与useActionState', link: '/guide/react/chapter-74' },
            { text: '第25章：useOptimistic与新的use() hook', link: '/guide/react/chapter-75' },
            { text: '第26章：React 19性能优化', link: '/guide/react/chapter-76' }
          ]
        },
        {
          text: '高级主题',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第27章：React性能优化完全指南', link: '/guide/react/chapter-77' },
            { text: '第28章：React组件设计模式', link: '/guide/react/chapter-78' },
            { text: '第29章：React测试（Vitest + Testing Library）', link: '/guide/react/chapter-79' },
            { text: '第30章：React项目架构与最佳实践', link: '/guide/react/chapter-80' }
          ]
        },
        {
          text: '🚀 企业级实战项目',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第31章：React 19 完全实战项目 - 企业级任务管理系统', link: '/guide/react/chapter-80-project' },
            { text: '第32章：React 19 + Next.js 15 完全实战项目 - 现代化电商平台', link: '/guide/react/chapter-81' },
            { text: '第33章：React 19 完全实战项目 - 实时数据可视化大屏系统', link: '/guide/react/chapter-82' }
          ]
        },
        {
          text: '附录',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '附录：React开发工具速查手册', link: '/guide/react/appendix-tools' }
          ]
        }
      ]
    },
    {
      text: '▲ Next.js 14+ 技术栈',
      collapsible: true,
      collapsed: false,
      items: [
        {
          text: '📚 学习路线',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '学习路线', link: '/guide/nextjs/' }
          ]
        },
        {
          text: '基础入门',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第1章：Next.js 14+简介与环境搭建', link: '/guide/nextjs/chapter-81' },
            { text: '第2章：App Router核心概念', link: '/guide/nextjs/chapter-82' },
            { text: '第3章：Pages Router与App Router对比', link: '/guide/nextjs/chapter-83' },
            { text: '第4章：路由系统完全指南', link: '/guide/nextjs/chapter-84' },
            { text: '第5章：布局与模板系统', link: '/guide/nextjs/chapter-85' },
            { text: '第6章：链接与导航', link: '/guide/nextjs/chapter-86' }
          ]
        },
        {
          text: '服务端组件与渲染',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第7章：Server Components完全指南', link: '/guide/nextjs/chapter-87' },
            { text: '第8章：Client Components使用', link: '/guide/nextjs/chapter-88' },
            { text: '第9章：静态生成（SSG）', link: '/guide/nextjs/chapter-89' },
            { text: '第10章：服务端渲染（SSR）', link: '/guide/nextjs/chapter-90' },
            { text: '第11章：增量静态再生（ISR）', link: '/guide/nextjs/chapter-91' }
          ]
        },
        {
          text: '数据获取与Server Actions',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第12章：数据获取完全指南', link: '/guide/nextjs/chapter-92' },
            { text: '第13章：Server Actions详解', link: '/guide/nextjs/chapter-93' },
            { text: '第14章：表单处理与验证', link: '/guide/nextjs/chapter-94' },
            { text: '第15章：错误处理与加载状态', link: '/guide/nextjs/chapter-95' },
            { text: '第16章：缓存策略与Revalidation', link: '/guide/nextjs/chapter-96' }
          ]
        },
        {
          text: '路由高级特性',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第17章：动态路由与路由参数', link: '/guide/nextjs/chapter-97' },
            { text: '第18章：路由组与并行路由', link: '/guide/nextjs/chapter-98' },
            { text: '第19章：拦截路由与Modals', link: '/guide/nextjs/chapter-99' },
            { text: '第20章：中间件（Middleware）', link: '/guide/nextjs/chapter-100' },
            { text: '第21章：路由Handler与API', link: '/guide/nextjs/chapter-101' }
          ]
        },
        {
          text: '样式与优化',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第22章：Tailwind CSS集成', link: '/guide/nextjs/chapter-102' },
            { text: '第23章：CSS Modules与Styled JSX', link: '/guide/nextjs/chapter-103' },
            { text: '第24章：图片优化与字体优化', link: '/guide/nextjs/chapter-104' },
            { text: '第25章：Script优化与资源加载', link: '/guide/nextjs/chapter-105' },
            { text: '第26章：性能优化完全指南', link: '/guide/nextjs/chapter-106' }
          ]
        },
        {
          text: 'Next.js 15+ 高级主题',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第27章：Next.js 15新特性', link: '/guide/nextjs/chapter-107' },
            { text: '第28章：全栈开发实战', link: '/guide/nextjs/chapter-108' },
            { text: '第29章：部署与运维', link: '/guide/nextjs/chapter-109' },
            { text: '第30章：Next.js最佳实践', link: '/guide/nextjs/chapter-110' }
          ]
        },
        {
          text: '🚀 企业级实战项目',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第31章：Next.js 15 完全实战项目 - AI内容生成平台', link: '/guide/nextjs/chapter-111' },
            { text: '第32章：Next.js 15 完全实战项目 - 企业级CMS系统', link: '/guide/nextjs/chapter-112' },
            { text: '第33章：Next.js 15 完全实战项目 - 微服务架构电商平台', link: '/guide/nextjs/chapter-113' }
          ]
        },
        {
          text: '附录',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '附录：Next.js开发工具速查手册', link: '/guide/nextjs/appendix-tools' }
          ]
        }
      ]
    },
    {
      text: '🌟 Nuxt 3+ 技术栈',
      collapsible: true,
      collapsed: false,
      items: [
        {
          text: '📚 学习路线',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '学习路线', link: '/guide/nuxt/' }
          ]
        },
        {
          text: '基础入门',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第1章：Nuxt 3+简介与环境搭建', link: '/guide/nuxt/chapter-111' },
            { text: '第2章：Nuxt目录结构与约定', link: '/guide/nuxt/chapter-112' },
            { text: '第3章：路由系统自动生成', link: '/guide/nuxt/chapter-113' },
            { text: '第4章：页面与布局系统', link: '/guide/nuxt/chapter-114' },
            { text: '第5章：组件与自动化导入', link: '/guide/nuxt/chapter-115' },
            { text: '第6章：Nuxt 3+配置文件', link: '/guide/nuxt/chapter-116' }
          ]
        },
        {
          text: '组合式函数与状态管理',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第7章：useAsyncData与useFetch', link: '/guide/nuxt/chapter-117' },
            { text: '第8章：useRoute与useRouter', link: '/guide/nuxt/chapter-118' },
            { text: '第9章：useState与useState', link: '/guide/nuxt/chapter-119' },
            { text: '第10章：useCookie与useHead', link: '/guide/nuxt/chapter-120' },
            { text: '第11章：Pinia状态管理集成', link: '/guide/nuxt/chapter-121' }
          ]
        },
        {
          text: '服务端渲染与路由',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第12章：SSR渲染原理与实践', link: '/guide/nuxt/chapter-122' },
            { text: '第13章：SSG静态站点生成', link: '/guide/nuxt/chapter-123' },
            { text: '第14章：ISR增量静态再生', link: '/guide/nuxt/chapter-124' },
            { text: '第15章：动态路由与路由参数', link: '/guide/nuxt/chapter-125' },
            { text: '第16章：路由中间件与守卫', link: '/guide/nuxt/chapter-126' }
          ]
        },
        {
          text: '服务端API与数据库',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第17章：Server Routes与API', link: '/guide/nuxt/chapter-127' },
            { text: '第18章：Nitro服务端引擎', link: '/guide/nuxt/chapter-128' },
            { text: '第19章：数据库集成（Prisma）', link: '/guide/nuxt/chapter-129' },
            { text: '第20章：认证与会话管理', link: '/guide/nuxt/chapter-130' },
            { text: '第21章：文件上传与处理', link: '/guide/nuxt/chapter-131' }
          ]
        },
        {
          text: '模块系统与插件',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第22章：Nuxt Modules模块开发', link: '/guide/nuxt/chapter-132' },
            { text: '第23章：常用Nuxt模块', link: '/guide/nuxt/chapter-133' },
            { text: '第24章：Nuxt Plugins插件开发', link: '/guide/nuxt/chapter-134' },
            { text: '第25章： composables组合式函数', link: '/guide/nuxt/chapter-135' }
          ]
        },
        {
          text: 'Nuxt 4+ 高级主题',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第26章：Nuxt 4新特性与迁移', link: '/guide/nuxt/chapter-136' },
            { text: '第27章：性能优化完全指南', link: '/guide/nuxt/chapter-137' },
            { text: '第28章：部署（Vercel/Cloudflare）', link: '/guide/nuxt/chapter-138' },
            { text: '第29章：Nuxt最佳实践与架构', link: '/guide/nuxt/chapter-139' }
          ]
        },
        {
          text: '🚀 企业级实战项目',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '第30章：全栈实战项目 - 电商后台管理系统', link: '/guide/nuxt/chapter-140' },
            { text: '第31章：Nuxt 4 完全实战项目 - 实时协作平台', link: '/guide/nuxt/chapter-141' },
            { text: '第32章：Nuxt 4 完全实战项目 - 社交网络与内容社区平台', link: '/guide/nuxt/chapter-142' }
          ]
        },
        {
          text: '附录',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '附录：Nuxt开发工具速查手册', link: '/guide/nuxt/appendix-tools' }
          ]
        }
      ]
    },
    {
      text: '附录',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '附录A：学习资源推荐', link: '/guide/appendix-resources' },
        { text: '附录B：VSCode配置推荐', link: '/guide/appendix-vscode' },
        { text: '附录C：代码模板与脚手架', link: '/guide/appendix-templates' },
        { text: '附录D：快速开始检查清单', link: '/guide/appendix-checklist' },
        { text: '附录E：Git命令速查手册', link: '/guide/appendix-git' }
      ]
    }
  ],
  '/devops/': [
    {
      text: '学习路线',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '学习路线', link: '/devops/' },
      ]
    },
    {
      text: '基础入门',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第1章：DevOps概述', link: '/devops/chapter-01' },
        { text: '第2章：Linux基础', link: '/devops/chapter-02' },
        { text: '第3章：Shell脚本编程', link: '/devops/chapter-03' },
        { text: '第4章：Git版本控制', link: '/devops/chapter-04' },
      ]
    },
    {
      text: '容器化与编排',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第5章：Docker容器化', link: '/devops/chapter-05' },
        { text: '第6章：Docker Compose编排', link: '/devops/chapter-06' },
        { text: '第7章：Kubernetes容器编排', link: '/devops/chapter-07' },
      ]
    },
    {
      text: 'CI/CD与自动化',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第8章：CI/CD基础概念', link: '/devops/chapter-08' },
        { text: '第9章：Jenkins持续集成', link: '/devops/chapter-09' },
        { text: '第10章：GitLab CI与GitHub Actions', link: '/devops/chapter-10' },
      ]
    },
    {
      text: '监控与运维',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第11章：系统监控与日志', link: '/devops/chapter-11' },
        { text: '第12章：自动化运维实战', link: '/devops/chapter-12' },
      ]
    },
    {
      text: '基础设施即代码',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第13章：Terraform基础设施即代码', link: '/devops/chapter-13' },
      ]
    },
    {
      text: 'GitOps实践',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第14章：Argo CD与GitOps', link: '/devops/chapter-14' },
      ]
    },
    {
      text: '安全实践',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第15章：DevSecOps安全实践', link: '/devops/chapter-15' },
      ]
    },
    {
      text: '🚀 企业级实战项目',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '第16章：DevOps 完全实战项目 - Kubernetes多集群管理系统', link: '/devops/chapter-16-project' },
        { text: '第17章：DevOps 完全实战项目 - Platform Engineering 企业级内部开发者平台', link: '/devops/chapter-17-project' },
        { text: '第18章：DevOps 完全实战项目 - AIOps AI驱动的智能运维系统', link: '/devops/chapter-18-project' }
      ]
    },
    {
      text: '附录',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '附录：DevOps工具速查手册', link: '/devops/appendix-tools' }
      ]
    }
  ]
}
