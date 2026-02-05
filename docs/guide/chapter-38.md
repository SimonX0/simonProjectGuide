# Vite 插件开发
## # 4.14 Vite 插件开发
## Vite 插件开发

> **学习目标**：掌握Vite插件开发技术，扩展构建功能
> **核心内容**：插件钩子、转换器、自定义构建流程

### Vite 插件基础

#### 插件基本结构

```typescript
// my-vite-plugin/src/index.ts
import type { Plugin } from 'vite'

export interface MyPluginOptions {
    // 插件配置选项
    include?: string | RegExp | (string | RegExp)[]
    exclude?: string | RegExp | (string | RegExp)[]
    enabled?: boolean
}

export function myVitePlugin(options: MyPluginOptions = {}): Plugin {
    const {
        include = /\.vue$/,
        exclude = [],
        enabled = true
    } = options

    // 返回插件对象
    return {
        // 插件名称
        name: 'my-vite-plugin',

        // 插件版本
        version: '1.0.0',

        // enforce: 'pre' | 'post' | null
        // pre: 在 Vite 核心插件之前执行
        // post: 在 Vite 核心插件之后执行
        enforce: 'post',

        // apply: 'serve' | 'build' | null
        // 限制插件在开发或生产环境执行
        apply: null, // 两种环境都执行

        // config: 修改 Vite 配置
        config(config, { command }) {
            console.log('Vite 配置:', command)
            return {
                // 返回要合并的配置
                define: {
                    __MY_PLUGIN_VERSION__: JSON.stringify('1.0.0')
                }
            }
        },

        // configResolved: 配置解析完成后执行
        configResolved(config) {
            console.log('已解析的配置:', config)
        },

        // configureServer: 配置开发服务器
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url === '/my-plugin') {
                    res.end('Hello from my Vite plugin!')
                } else {
                    next()
                }
            })
        },

        // transform: 转换文件内容
        transform(code, id) {
            if (!enabled) return

            // 判断是否需要处理该文件
            if (!shouldTransform(id)) return

            // 转换代码
            return {
                code: transformCode(code),
                map: null // source map
            }
        },

        // load: 自定义加载器
        load(id) {
            // 可以返回自定义内容
            return null
        },

        // resolveId: 自定义模块解析
        resolveId(source) {
            if (source === 'my-virtual-module') {
                return '\0my-virtual-module'
            }
            return null
        },

        // buildStart: 构建开始时执行
        buildStart() {
            console.log('构建开始')
        },

        // buildEnd: 构建结束时执行
        buildEnd() {
            console.log('构建结束')
        },

        // generateBundle: 生成 bundle 时执行
        generateBundle(options, bundle) {
            console.log('生成 bundle:', Object.keys(bundle))
        },

        // writeBundle: 写入 bundle 到磁盘后执行
        writeBundle() {
            console.log('写入 bundle 完成')
        }
    }

    function shouldTransform(id: string): boolean {
        // 判断文件是否匹配 include 规则
        if (Array.isArray(include)) {
            return include.some(pattern => matchPattern(id, pattern))
        }
        return matchPattern(id, include)
    }

    function matchPattern(id: string, pattern: string | RegExp): boolean {
        if (typeof pattern === 'string') {
            return id.includes(pattern)
        }
        return pattern.test(id)
    }

    function transformCode(code: string): string {
        // 转换代码逻辑
        return code.replace(/foo/g, 'bar')
    }
}
```

#### 插件使用

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { myVitePlugin } from './my-vite-plugin'

export default defineConfig({
    plugins: [
        vue(),
        // 使用自定义插件
        myVitePlugin({
            include: /\.vue$/,
            exclude: /node_modules/,
            enabled: true
        })
    ]
})
```

### 常用钩子函数

#### 配置阶段钩子

```typescript
export function configHooksPlugin(): Plugin {
    return {
        name: 'config-hooks-plugin',

        // 修改原始配置
        config(config, { command }) {
            // command: 'serve' | 'build'
            console.log('当前命令:', command)

            return {
                // 合并配置
                build: {
                    rollupOptions: {
                        output: {
                            manualChunks: {
                                vendor: ['vue', 'vue-router']
                            }
                        }
                    }
                },
                server: {
                    proxy: {
                        '/api': 'http://localhost:3000'
                    }
                }
            }
        },

        // 配置解析完成后
        configResolved(config) {
            // 可以获取最终配置
            console.log('根目录:', config.root)
            console.log('公共目录:', config.publicDir)
            console.log('环境变量:', config.env)
        }
    }
}
```

#### 服务器钩子

```typescript
export function serverHooksPlugin(): Plugin {
    return {
        name: 'server-hooks-plugin',
        apply: 'serve', // 仅在开发环境

        configureServer(server) {
            // 返回一个清理函数
            return () => {
                server.httpServer?.once('close', () => {
                    console.log('服务器关闭')
                })
            }
        },

        configureServer(server) {
            // 添加中间件
            server.middlewares.use((req, res, next) => {
                // 自定义中间件逻辑
                if (req.url?.startsWith('/api/custom')) {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ message: 'Custom API response' }))
                    return
                }
                next()
            })

            // WebSocket 处理
            server.ws.on('connection', (ws, req) => {
                ws.on('message', (data) => {
                    console.log('收到消息:', data.toString())
                })

                // 发送欢迎消息
                ws.send(JSON.stringify({ type: 'welcome' }))
            })

            // HMR 更新处理
            server.ws.on('connection', (ws) => {
                ws.on('my-vite-plugin:ping', () => {
                    ws.send(JSON.stringify({ type: 'my-vite-plugin:pong' }))
                })
            })
        },

        // 处理热更新
        handleHotUpdate({ file, server, modules }) {
            console.log('热更新:', file)

            // 可以自定义热更新行为
            if (file.endsWith('.custom')) {
                server.ws.send({
                    type: 'full-reload',
                    path: '*'
                })
                return []
            }

            return modules
        }
    }
}
```

#### 转换钩子

```typescript
export function transformHooksPlugin(): Plugin {
    return {
        name: 'transform-hooks-plugin',

        // 转换代码
        transform(code, id) {
            // id: 文件绝对路径
            // code: 文件内容

            // 只处理特定文件
            if (!id.endsWith('.vue')) return null

            // 自定义 Vue SFC 转换
            if (id.endsWith('.vue')) {
                return transformVueSFC(code)
            }

            return null
        },

        // 转换 HTML（仅开发环境）
        transformIndexHtml: {
            // 钩子函数
            transform(html, { filename, path }) {
                // 可以修改 HTML
                return html.replace(
                    '</head>',
                    '<script>console.log("Injected by plugin")</script></head>'
                )
            },

            // 执行顺序
            order: 'post' // 'pre' | 'post' | null
        }
    }

    function transformVueSFC(code: string) {
        // 解析 Vue SFC
        // ... 自定义转换逻辑
        return {
            code: code.replace(/console\.log\([^)]*\)/g, ''),
            map: null
        }
    }
}
```

#### 模块解析钩子

```typescript
export function resolveHooksPlugin(): Plugin {
    return {
        name: 'resolve-hooks-plugin',

        // 解析模块 ID
        resolveId(source, importer, options) {
            // source: 导入的标识符
            // importer: 导入者的文件路径

            // 处理虚拟模块
            if (source === 'virtual:my-module') {
                return '\0virtual:my-module'
            }

            // 处理别名
            if (source.startsWith('@components/')) {
                const componentName = source.replace('@components/', '')
                return `/src/components/${componentName}`
            }

            return null // 使用默认解析
        },

        // 加载模块内容
        load(id) {
            // 虚拟模块处理
            if (id === '\0virtual:my-module') {
                return `
                    export const message = 'Hello from virtual module!'
                    export default { message }
                `
            }

            // 自定义文件加载
            if (id.endsWith('.json5')) {
                // 加载 JSON5 文件
                const content = fs.readFileSync(id, 'utf-8')
                const json = JSON5.parse(content)
                return `export default ${JSON.stringify(json)}`
            }

            return null // 使用默认加载
        }
    }
}
```

### 实用插件示例

#### SVG 组件化插件

```typescript
// plugins/vite-svg-components.ts
import { createFilter } from '@rollup/pluginutils'
import { compileTemplate } from 'vue/compiler-sfc'
import type { Plugin } from 'vite'

interface SvgComponentsOptions {
    include?: string | RegExp
    exclude?: string | RegExp
    iconPrefix?: string
    svgoConfig?: any
}

export function svgComponentsPlugin(options: SvgComponentsOptions = {}): Plugin {
    const {
        include = '**/*.svg',
        exclude = 'node_modules/**',
        iconPrefix = 'icon'
    } = options

    const filter = createFilter(include, exclude)

    return {
        name: 'vite-svg-components',

        resolveId(id) {
            if (id.startsWith(iconPrefix + ':')) {
                return '\0' + id
            }
            return null
        },

        load(id) {
            if (!id.startsWith('\0' + iconPrefix + ':')) return null

            const iconName = id.slice(iconPrefix.length + 2)
            const svgPath = `/src/assets/icons/${iconName}.svg`

            try {
                const svgContent = fs.readFileSync(svgPath, 'utf-8')

                // 编译为 Vue 组件
                const { code } = compileTemplate({
                    source: svgContent,
                    filename: iconName + '.svg',
                    id: iconName,
                    transformAssetUrls: false
                })

                return code
            } catch (error) {
                this.error(`Failed to load SVG: ${iconName}`)
            }
        },

        transform(code, id) {
            if (!filter(id) || !id.endsWith('.svg')) return null

            // 将 SVG 转换为 Vue 组件
            const svgContent = fs.readFileSync(id, 'utf-8')

            const { code: componentCode } = compileTemplate({
                source: svgContent,
                id: id,
                filename: id,
                transformAssetUrls: false
            })

            return {
                code: componentCode,
                map: null
            }
        }
    }
}
```

#### 图片压缩插件

```typescript
// plugins/vite-image-optimizer.ts
import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import sharp from 'sharp'

interface ImageOptimizerOptions {
    include?: string | RegExp
    exclude?: string | RegExp
    jpegQuality?: number
    pngQuality?: number
    webpQuality?: number
    convertToWebp?: boolean
}

export function imageOptimizerPlugin(options: ImageOptimizerOptions = {}): Plugin {
    const {
        include = /\.(png|jpe?g|webp)$/i,
        exclude = /node_modules/,
        jpegQuality = 80,
        pngQuality = 80,
        webpQuality = 80,
        convertToWebp = false
    } = options

    const filter = createFilter(include, exclude)

    return {
        name: 'vite-image-optimizer',
        apply: 'build',

        async generateBundle(options, bundle) {
            for (const [fileName, fileInfo] of Object.entries(bundle)) {
                if (fileInfo.type !== 'asset' || !filter(fileName)) continue

                const source = fileInfo.source as Buffer
                const ext = fileName.split('.').pop()?.toLowerCase()

                let optimized: Buffer | null = null

                try {
                    // 使用 sharp 压缩图片
                    switch (ext) {
                        case 'jpg':
                        case 'jpeg':
                            optimized = await sharp(source)
                                .jpeg({ quality: jpegQuality })
                                .toBuffer()
                            break

                        case 'png':
                            optimized = await sharp(source)
                                .png({ quality: pngQuality })
                                .toBuffer()
                            break

                        case 'webp':
                            optimized = await sharp(source)
                                .webp({ quality: webpQuality })
                                .toBuffer()
                            break
                    }

                    if (optimized) {
                        fileInfo.source = optimized

                        // 生成 WebP 版本
                        if (convertToWebp && ext !== 'webp') {
                            const webp = await sharp(source)
                                .webp({ quality: webpQuality })
                                .toBuffer()

                            const webpName = fileName.replace(/\.[^.]+$/, '.webp')
                            this.emitFile({
                                type: 'asset',
                                fileName: webpName,
                                source: webp
                            })
                        }
                    }
                } catch (error) {
                    this.warn(`Failed to optimize image: ${fileName}`)
                }
            }
        }
    }
}
```

#### 环境变量注入插件

```typescript
// plugins/vite-env-injector.ts
import type { Plugin } from 'vite'

interface EnvInjectorOptions {
    prefix?: string
    exposeAll?: boolean
    defineOn?: 'window' | 'import.meta' | 'both'
}

export function envInjectorPlugin(options: EnvInjectorOptions = {}): Plugin {
    const {
        prefix = 'VITE_',
        exposeAll = false,
        defineOn = 'import.meta'
    } = options

    return {
        name: 'vite-env-injector',

        config(config, { mode }) {
            // 加载环境变量
            const env = loadEnv(mode, config.envDir || process.cwd(), '')

            // 过滤环境变量
            const filteredEnv = Object.entries(env).reduce((acc, [key, value]) => {
                if (exposeAll || key.startsWith(prefix)) {
                    acc[key] = value
                }
                return acc
            }, {} as Record<string, string>)

            // 生成注入代码
            const envCode = `export default ${JSON.stringify(filteredEnv)}`

            return {
                define: {
                    // 注入到 import.meta.env
                    'import.meta.env': JSON.stringify(filteredEnv),
                    // 注入到全局
                    '__ENV__': JSON.stringify(filteredEnv)
                }
            }
        }
    }

    function loadEnv(mode: string, envDir: string, prefix: string): Record<string, string> {
        // 加载 .env 文件
        const envFiles = [
            `.env.${mode}.local`,
            `.env.${mode}`,
            `.env.local`,
            `.env`
        ]

        const env: Record<string, string> = {}

        for (const file of envFiles) {
            const filePath = path.join(envDir, file)
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8')
                Object.assign(env, parseEnvFile(content))
            }
        }

        return env
    }

    function parseEnvFile(content: string): Record<string, string> {
        const env: Record<string, string> = {}

        content.split('\n').forEach(line => {
            line = line.trim()
            if (!line || line.startsWith('#')) return

            const match = line.match(/^([^=]+)=(.*)$/)
            if (match) {
                const [, key, value] = match
                env[key] = value.replace(/^["']|["']$/g, '')
            }
        })

        return env
    }
}
```

---

#### 文件预处理插件（自动处理 Markdown）

在开发文档类应用时，经常需要预处理 Markdown 文件。以下是完整的 Markdown 预处理插件示例：

```typescript
// plugins/vite-md-preprocessor.ts
import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface MarkdownPreprocessorOptions {
  include?: string | RegExp
  exclude?: string | RegExp
  markedOptions?: any
}

export function markdownPreprocessorPlugin(options: MarkdownPreprocessorOptions = {}): Plugin {
  const {
    include = /\.md$/,
    exclude = /node_modules/,
    markedOptions = {}
  } = options

  const filter = createFilter(include, exclude)

  return {
    name: 'vite-md-preprocessor',

    // 解析 .md 文件的导入
    resolveId(id) {
      if (id.endsWith('.md')) {
        return id
      }
      return null
    },

    // 加载并转换 Markdown 文件
    async load(id) {
      if (!filter(id)) return null

      const fileContent = fs.readFileSync(id, 'utf-8')

      // 解析 frontmatter
      const { data, content } = matter(fileContent)

      // 转换 Markdown 为 HTML
      const html = await convertMarkdownToHtml(content, markedOptions)

      // 生成模块代码
      const code = `
        export const attributes = ${JSON.stringify(data)}
        export const html = ${JSON.stringify(html)}
        export const slug = '${path.basename(id, '.md')}'
        export default {
          attributes,
          html,
          slug
        }
      `

      return {
        code,
        map: null
      }
    },

    // 热更新支持
    handleHotUpdate(ctx) {
      if (filter(ctx.file)) {
        const defaultRead = ctx.read
        ctx.read = async () => {
          const content = await defaultRead()
          const { data, content: markdown } = matter(content)
          const html = await convertMarkdownToHtml(markdown, markedOptions)

          return `
            export const attributes = ${JSON.stringify(data)}
            export const html = ${JSON.stringify(html)}
            export const slug = '${path.basename(ctx.file, '.md')}'
            export default {
              attributes,
              html,
              slug
            }
          `
        }
      }
    }
  }
}

// Markdown 转 HTML（使用 marked）
async function convertMarkdownToHtml(markdown: string, options: any): Promise<string> {
  const { marked } = await import('marked')
  marked.setOptions({
    gfm: true,
    breaks: true,
    ...options
  })
  return marked(markdown)
}
```

**使用示例：**

```vue
<!-- src/views/DocView.vue -->
<template>
  <article class="doc-content">
    <h1>{{ attributes.title }}</h1>
    <div class="meta" v-if="attributes.date || attributes.author">
      <span v-if="attributes.date">{{ attributes.date }}</span>
      <span v-if="attributes.author">{{ attributes.author }}</span>
    </div>
    <div v-html="html"></div>
  </article>
</template>

<script setup lang="ts">
import docMeta from '@/docs/getting-started.md'

const { attributes, html } = docMeta
</script>
```

**Markdown 文件示例：**

```markdown
---
title: 快速开始
date: 2026-02-03
author: 张三
---

# 安装

使用 npm 安装：

\`\`\`bash
npm install my-lib
\`\`\`

# 使用

\`\`\`typescript
import { createApp } from 'my-lib'
\`\`\`
```

---

#### 自动生成组件文档插件

在企业级组件库开发中，自动生成组件文档可以大大提高效率。以下是基于组件 props 自动生成文档表格的插件：

```typescript
// plugins/vite-component-docs.ts
import type { Plugin } from 'vite'
import { parse } from '@vue/compiler-sfc'
import fs from 'fs'
import path from 'path'

interface ComponentDocsOptions {
  include?: string | RegExp
  exclude?: string | RegExp
  outDir?: string
}

export function componentDocsPlugin(options: ComponentDocsOptions = {}): Plugin {
  const {
    include = /\.vue$/,
    exclude = /node_modules/,
    outDir = 'docs/components'
  } = options

  const componentDocs = new Map<string, any>()

  return {
    name: 'vite-component-docs',

    transform(code, id) {
      if (!include.test(id) || exclude.test(id)) return null

      try {
        // 解析 Vue SFC
        const { descriptor } = parse(code)

        // 提取组件文档
        const doc = this.extractComponentDoc(descriptor, id)
        if (doc) {
          componentDocs.set(id, doc)
        }

        return null
      } catch (error) {
        this.warn(`Failed to parse component: ${id}`)
      }
    },

    // 构建完成后生成文档
    buildEnd() {
      this.generateDocs()
    },

    extractComponentDoc(descriptor: any, id: string) {
      const scriptSetup = descriptor.scriptSetup
      const script = descriptor.script

      if (!scriptSetup && !script) return null

      // 提取 props
      const props = this.extractProps(scriptSetup || script)

      // 提取 emits
      const emits = this.extractEmits(scriptSetup || script)

      // 提取 slots
      const slots = this.extractSlots(descriptor.template)

      // 提取注释文档
      const description = this.extractComponentDescription(scriptSetup || script)

      return {
        name: path.basename(id, '.vue'),
        path: id,
        description,
        props,
        emits,
        slots
      }
    },

    extractProps(script: any) {
      if (!script) return []

      const propsAst = this.findPropsDeclaration(script.content)
      if (!propsAst) return []

      // 解析 props 定义
      const props = []

      // 这里简化处理，实际需要使用 AST 解析
      // 可以使用 @babel/parser 解析 TypeScript 类型定义

      return props
    },

    extractEmits(script: any) {
      // 类似 props 的提取逻辑
      return []
    },

    extractSlots(template: any) {
      if (!template) return []

      // 解析模板中的 slot
      const slots = []

      return slots
    },

    extractComponentDescription(script: any) {
      // 提取组件顶部的注释
      const match = script?.content.match(/\/\*\*[\s\S]*?\*\//)
      return match ? match[0] : ''
    },

    findPropsDeclaration(code: string) {
      // 查找 defineProps 调用
      const match = code.match(/defineProps<[^>]*>\(([^)]*)\)/)
      return match ? match[0] : null
    },

    generateDocs() {
      if (componentDocs.size === 0) return

      const docsDir = path.resolve(process.cwd(), outDir)
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true })
      }

      // 生成 Markdown 文档
      let indexContent = '# 组件文档\n\n'

      for (const [id, doc] of componentDocs) {
        const fileName = `${doc.name}.md`
        const filePath = path.join(docsDir, fileName)

        const content = this.generateDocMarkdown(doc)
        fs.writeFileSync(filePath, content)

        indexContent += `## [${doc.name}](${fileName})\n\n`
        if (doc.description) {
          indexContent += `${doc.description}\n\n`
        }
      }

      // 生成索引文件
      fs.writeFileSync(path.join(docsDir, 'index.md'), indexContent)

      console.log(`[ComponentDocs] Generated ${componentDocs.size} component docs`)
    },

    generateDocMarkdown(doc: any) {
      let markdown = `# ${doc.name}\n\n`

      if (doc.description) {
        markdown += `${doc.description}\n\n`
      }

      // Props 表格
      if (doc.props.length > 0) {
        markdown += '## Props\n\n'
        markdown += '| 名称 | 类型 | 默认值 | 说明 |\n'
        markdown += '| --- | --- | --- | --- |\n'
        doc.props.forEach((prop: any) => {
          markdown += `| ${prop.name} | \`${prop.type}\` | ${prop.default} | ${prop.description} |\n`
        })
        markdown += '\n'
      }

      // Events 表格
      if (doc.emits.length > 0) {
        markdown += '## Events\n\n'
        markdown += '| 名称 | 参数 | 说明 |\n'
        markdown += '| --- | --- | --- |\n'
        doc.emits.forEach((emit: any) => {
          markdown += `| ${emit.name} | ${emit.params} | ${emit.description} |\n`
        })
        markdown += '\n'
      }

      // Slots 表格
      if (doc.slots.length > 0) {
        markdown += '## Slots\n\n'
        markdown += '| 名称 | 说明 |\n'
        markdown += '| --- | --- |\n'
        doc.slots.forEach((slot: any) => {
          markdown += `| ${slot.name} | ${slot.description} |\n`
        })
        markdown += '\n'
      }

      return markdown
    }
  }
}
```

**使用示例：**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { componentDocsPlugin } from './plugins/vite-component-docs'

export default defineConfig({
  plugins: [
    vue(),
    componentDocsPlugin({
      outDir: 'docs/components'
    })
  ]
})
```

---

#### Mock API 插件（开发环境数据模拟）

在开发环境中，经常需要模拟后端 API 接口。以下是完整的 Mock API 插件实现：

```typescript
// plugins/vite-mock-api.ts
import type { Plugin, Connect } from 'vite'
import fs from 'fs'
import path from 'path'

interface MockApiOptions {
  mockDir?: string
  enableProd?: boolean
}

interface MockConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  response: any | ((req: any) => any)
  delay?: number
}

export function mockApiPlugin(options: MockApiOptions = {}): Plugin {
  const {
    mockDir = 'mock',
    enableProd = false
  } = options

  const mockConfigs: MockConfig[] = []
  let isDev = true

  return {
    name: 'vite-mock-api',

    config(config, env) {
      isDev = env.mode === 'development' || enableProd
    },

    configureServer(server) {
      if (!isDev) return

      // 加载 Mock 配置
      loadMockConfigs()

      // 注册中间件
      server.middlewares.use((req, res, next) => {
        handleMockRequest(req, res, next)
      })
    }
  }

  function loadMockConfigs() {
    const mockPath = path.resolve(process.cwd(), mockDir)
    if (!fs.existsSync(mockPath)) {
      console.warn(`[MockApi] Mock directory not found: ${mockPath}`)
      return
    }

    // 递归读取 mock 目录下的所有文件
    const loadFiles = (dir: string) => {
      const files = fs.readdirSync(dir)

      files.forEach(file => {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          loadFiles(fullPath)
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
          try {
            // 清除缓存以支持热更新
            delete require.cache[require.resolve(fullPath)]

            const configs = require(fullPath)
            if (Array.isArray(configs)) {
              mockConfigs.push(...configs)
            } else if (configs.default) {
              mockConfigs.push(...(Array.isArray(configs.default) ? configs.default : [configs.default]))
            }
          } catch (error) {
            console.error(`[MockApi] Failed to load mock file: ${fullPath}`, error)
          }
        }
      })
    }

    loadFiles(mockPath)
    console.log(`[MockApi] Loaded ${mockConfigs.length} mock APIs`)
  }

  function handleMockRequest(req: any, res: any, next: any) {
    const method = req.method.toUpperCase()
    const url = req.url

    // 查找匹配的 Mock 配置
    const mockConfig = mockConfigs.find(config => {
      const configMethod = (config.method || 'GET').toUpperCase()
      // 支持路由参数，如 /api/users/:id
      const pattern = config.url.replace(/:([^/]+)/g, '([^/]+)')
      const regex = new RegExp(`^${pattern}$`)
      return configMethod === method && regex.test(url)
    })

    if (!mockConfig) {
      return next()
    }

    // 延迟响应（模拟网络延迟）
    const delay = mockConfig.delay || Math.random() * 500 + 100

    setTimeout(() => {
      try {
        let responseData = mockConfig.response

        // 如果是函数，执行它
        if (typeof responseData === 'function') {
          responseData = responseData(req)
        }

        // 设置响应头
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        // 处理 OPTIONS 预检请求
        if (method === 'OPTIONS') {
          res.statusCode = 200
          return res.end()
        }

        res.statusCode = 200
        res.end(JSON.stringify(responseData))

        console.log(`[MockApi] ${method} ${url} -> 200`)
      } catch (error) {
        console.error(`[MockApi] Error handling request: ${url}`, error)
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Mock server error' }))
      }
    }, delay)
  }
}
```

**Mock 配置文件示例：**

```typescript
// mock/users.ts
import { Random } from 'mockjs'

export default [
  // 获取用户列表
  {
    url: '/api/users',
    method: 'GET',
    response: (req: any) => {
      const { page = 1, pageSize = 10 } = req.query

      const list = Array.from({ length: pageSize }, () => ({
        id: Random.id(),
        name: Random.cname(),
        email: Random.email(),
        phone: Random.pick(['138****1234', '139****5678', '150****9012']),
        avatar: Random.image('100x100', Random.color(), '#FFF', 'Avatar'),
        status: Random.pick(['active', 'inactive']),
        role: Random.pick(['admin', 'user', 'guest']),
        createTime: Random.datetime()
      }))

      return {
        code: 200,
        message: 'success',
        data: {
          list,
          total: 100,
          page: Number(page),
          pageSize: Number(pageSize)
        }
      }
    },
    delay: 300
  },

  // 获取用户详情
  {
    url: '/api/users/:id',
    method: 'GET',
    response: (req: any) => {
      const { id } = req.params

      return {
        code: 200,
        message: 'success',
        data: {
          id,
          name: Random.cname(),
          email: Random.email(),
          phone: Random.pick(['138****1234', '139****5678']),
          avatar: Random.image('200x200', Random.color(), '#FFF', 'Avatar'),
          status: Random.pick(['active', 'inactive']),
          role: Random.pick(['admin', 'user', 'guest']),
          bio: Random.paragraph(),
          address: {
            province: Random.province(),
            city: Random.city(),
            detail: Random.county(true)
          },
          createTime: Random.datetime()
        }
      }
    }
  },

  // 创建用户
  {
    url: '/api/users',
    method: 'POST',
    response: (req: any) => {
      const body = req.body

      return {
        code: 200,
        message: '创建成功',
        data: {
          id: Random.id(),
          ...body,
          createTime: new Date().toISOString()
        }
      }
    }
  }
]
```

**使用示例：**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { mockApiPlugin } from './plugins/vite-mock-api'

export default defineConfig({
  plugins: [
    vue(),
    mockApiPlugin({
      mockDir: 'mock',
      enableProd: false
    })
  ]
})
```

---

### 插件调试

#### 调试工具

```typescript
// plugins/debug-plugin.ts
import type { Plugin } from 'vite'

export function debugPlugin(): Plugin {
    return {
        name: 'debug-plugin',

        // 打印配置
        config(config) {
            console.log('Vite Config:', JSON.stringify(config, null, 2))
        },

        // 打印每个转换
        transform(code, id) {
            console.log('Transform:', id)
            console.log('Code length:', code.length)
            return null
        },

        // 打印模块解析
        resolveId(source, importer) {
            console.log('Resolve:', source, 'from', importer)
            return null
        },

        // 打印加载
        load(id) {
            console.log('Load:', id)
            return null
        }
    }
}
```

#### 性能分析插件

```typescript
// plugins/performance-plugin.ts
import type { Plugin } from 'vite'

interface PerformanceMetrics {
    transforms: Map<string, number>
    loads: Map<string, number>
    resolveTimes: Map<string, number>
}

export function performancePlugin(): Plugin {
    const metrics: PerformanceMetrics = {
        transforms: new Map(),
        loads: new Map(),
        resolveTimes: new Map()
    }

    return {
        name: 'performance-plugin',

        transform(code, id) {
            const start = performance.now()
            // 转换逻辑...
            const end = performance.now()
            metrics.transforms.set(id, end - start)
            return null
        },

        load(id) {
            const start = performance.now()
            // 加载逻辑...
            const end = performance.now()
            metrics.loads.set(id, end - start)
            return null
        },

        buildEnd() {
            // 打印性能报告
            console.log('\n=== Performance Report ===')

            console.log('\nSlowest Transforms (>50ms):')
            for (const [id, time] of metrics.transforms) {
                if (time > 50) {
                    console.log(`  ${id}: ${time.toFixed(2)}ms`)
                }
            }

            console.log('\nSlowest Loads (>50ms):')
            for (const [id, time] of metrics.loads) {
                if (time > 50) {
                    console.log(`  ${id}: ${time.toFixed(2)}ms`)
                }
            }
        }
    }
}
```

### 插件发布

#### 项目结构

```
my-vite-plugin/
├── src/
│   ├── index.ts           # 主入口
│   ├── plugin.ts          # 插件实现
│   └── types.ts           # 类型定义
├── test/
│   └── plugin.test.ts     # 测试文件
├── package.json
├── tsconfig.json
└── README.md
```

#### package.json 配置

```json
{
  "name": "my-vite-plugin",
  "version": "1.0.0",
  "description": "My awesome Vite plugin",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "keywords": [
    "vite",
    "vite-plugin",
    "vue"
  ],
  "peerDependencies": {
    "vite": ">=3.0.0"
  },
  "devDependencies": {
    "vite": "^4.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest"
  }
}
```

### 本章小结

| 钩子类型 | 阶段 | 常用钩子 |
|----------|------|----------|
| 配置钩子 | 服务器启动前 | config, configResolved |
| 服务器钩子 | 开发环境 | configureServer, handleHotUpdate |
| 转换钩子 | 构建时 | transform, transformIndexHtml |
| 模块钩子 | 模块解析 | resolveId, load |
| 构建钩子 | 生产构建 | buildStart, buildEnd, generateBundle |

---
