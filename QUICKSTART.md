# 🚀 Vue3指南 - VitePress 快速开始指南

## ✅ 项目已创建完成！

所有必需的文件和配置都已生成。

## 📁 项目结构

```
vue3-guide-docs/
├── docs/                        # 文档目录
│   ├── .vitepress/              # VitePress配置
│   │   ├── config.ts            # 主配置文件 ✅
│   │   ├── nav.ts              # 导航配置 ✅
│   │   └── sidebar.ts          # 侧边栏配置 ✅
│   ├── guide/                   # 文档内容目录
│   ├── public/                  # 静态资源
│   └── index.md                # 首页 ✅
├── scripts/                     # 脚本目录
│   └── split-doc.js            # 文档拆分脚本 ✅
├── .github/                     # GitHub配置
│   └── workflows/
│       └── deploy.yml          # 自动部署配置 ✅
├── package.json                 # 项目配置 ✅
├── README.md                    # 项目说明 ✅
├── LICENSE                      # 开源协议 ✅
└── .gitignore                   # Git忽略配置 ✅
```

## 📋 下一步操作清单

### 1️⃣ 安装依赖

```bash
cd c:\Users\Austi\Desktop\vue3-guide-docs

# 安装pnpm（如果还没有）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 2️⃣ 拆分文档

```bash
# 运行脚本，将大文档拆分成章节
node scripts/split-doc.js
```

这会自动将您的5万多行文档拆分成40+个章节文件到 `docs/guide/` 目录。

### 3️⃣ 启动开发服务器

```bash
pnpm docs:dev
```

然后访问 http://localhost:5173 查看效果！

### 4️⃣ 自定义配置（可选）

**修改GitHub信息**：
- 编辑 `docs/.vitepress/config.ts`
- 搜索 `your-username` 替换为您的GitHub用户名
- 修改邮箱、社交链接等信息

**修改导航**：
- 编辑 `docs/.vitepress/nav.ts`

**修改侧边栏**：
- 编辑 `docs/.vitepress/sidebar.ts`

### 5️⃣ 构建生产版本

```bash
# 构建
pnpm docs:build

# 预览构建结果
pnpm docs:preview
```

### 6️⃣ 部署到GitHub Pages

#### 步骤1：创建GitHub仓库

1. 访问 https://github.com/new
2. 创建新仓库 `vue3-guide`
3. 初始化README
4. 创建仓库

#### 步骤2：推送代码

```bash
cd c:\Users\Austi\Desktop\vue3-guide-docs

# 初始化Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Vue3 Guide VitePress site"

# 添加远程仓库
git remote add origin https://github.com/your-username/vue3-guide.git

# 推送
git branch -M main
git push -u origin main
```

**注意**：将 `your-username` 替换为您的GitHub用户名！

#### 步骤3：启用GitHub Pages

1. 进入仓库的 **Settings** > **Pages**
2. 在 **Build and deployment** 下：
   - **Source** 选择 **GitHub Actions**
3. 保存更改

#### 步骤4：查看部署状态

1. 进入仓库的 **Actions** 标签
2. 查看 "Deploy VitePress site to Pages" 工作流
3. 等待构建完成（约1-2分钟）
4. 访问 `https://your-username.github.io/vue3-guide/`

## 🎯 常用命令

```bash
# 开发
pnpm docs:dev              # 启动开发服务器

# 构建
pnpm docs:build            # 构建生产版本
pnpm docs:preview          # 预览构建结果

# 文档处理
node scripts/split-doc.js   # 拆分大文档

# 一键构建
pnpm build:all              # 拆分 + 构建
```

## 🎨 自定义主题

### 添加Logo

将Logo文件放到 `docs/public/logo.png`，然后在 `config.ts` 中引用。

### 修改主题色

编辑 `docs/.vitepress/theme/` 目录下的样式文件。

### 添加自定义组件

在 `docs/.vitepress/components/` 目录下创建Vue组件。

## 📊 搜索配置（可选）

VitePress默认使用Algolia搜索。要启用：

1. 注册 [Algolia DocSearch](https://docsearch.algolia.com/)
2. 获取 `appId`、`apiKey`、`indexName`
3. 在 `docs/.vitepress/config.ts` 中配置

## 🔧 故障排查

### 问题1：端口被占用

```bash
# 使用其他端口
pnpm docs:dev --port 3000
```

### 问题2：拆分脚本找不到源文件

编辑 `scripts/split-doc.js`，确认 `sourceFile` 路径正确：
```javascript
const sourceFile = 'c:\\Users\\Austi\\Desktop\\Vue3从零开始学习教程.md'
```

### 问题3：构建失败

```bash
# 清理缓存
rm -rf node_modules
rm docs/.vitepress/cache
pnpm install
pnpm docs:build
```

### 问题4：GitHub Actions部署失败

1. 检查仓库设置 > Pages 是否启用
2. 检查权限设置（需要允许 Actions 写入 Pages）
3. 查看 Actions 标签页的错误日志

## 📚 更多资源

- [VitePress官方文档](https://vitepress.dev/)
- [VitePress配置参考](https://vitepress.dev/reference/site-config)
- [VitePress主题配置](https://vitepress.dev/reference/default-theme-config)
- [部署到GitHub Pages](https://vitepress.dev/guide/deploy/github-pages)

## 💡 提示

- 💾 **定期提交**：每次修改后及时提交到Git
- 🔄 **自动部署**：推送到main分支会自动触发部署
- 📝 **写好Commit**：使用清晰的提交信息
- 🎨 **预览变更**：本地预览后再推送

## 🎉 完成！

现在您有了一个完整的VitePress文档站点！

查看在线文档：`https://your-username.github.io/vue3-guide/`

---

**有问题？** 查看README.md或联系作者：esimonx@163.com
