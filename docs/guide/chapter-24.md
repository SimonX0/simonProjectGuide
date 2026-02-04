# Git版本控制与团队协作
## Git版本控制与团队协作
## 第24章 Git版本控制与团队协作

> **学习目标**：掌握Git版本控制和团队协作
> **核心内容**：Git命令、分支管理、Hooks配置、提交规范

### Git基础命令

#### 初始化与配置

```bash
# 初始化仓库
git init

# 克隆远程仓库
git clone <repository-url>

# 配置用户信息
git config --global user.name "小徐"
git config --global user.email "xu@example.com"

# 查看配置
git config --list
```

#### 基本操作

```bash
# 查看状态
git status

# 添加文件到暂存区
git add .                    # 添加所有文件
git add <file>              # 添加指定文件
git add *.vue               # 添加所有vue文件

# 提交更改
git commit -m "提交信息"

# 添加并提交（一步完成）
git commit -am "提交信息"

# 查看提交历史
git log
git log --oneline          # 简洁显示
git log --graph            # 图形化显示
git log --pretty=format:"%h - %an, %ar : %s"  # 自定义格式

# 查看文件差异
git diff                   # 工作区与暂存区差异
git diff --staged          # 暂存区与上次提交差异
git diff <commit>          # 工作区与指定提交差异
```

#### 撤销与回退

```bash
# 撤销工作区修改
git restore <file>         # 恢复文件到上次提交状态
git checkout -- <file>     # 旧版本命令（等同上条）

# 撤销暂存区修改
git restore --staged <file>
git reset HEAD <file>      # 旧版本命令

# 撤销上次提交（保留修改）
git reset --soft HEAD~1

# 撤销上次提交（不保留修改）
git reset --hard HEAD~1

# 回退到指定提交
git reset --hard <commit-hash>

# 查看所有操作记录
git reflog
```

### Git分支管理

#### 分支基本操作

```bash
# 查看所有分支
git branch                 # 本地分支
git branch -r              # 远程分支
git branch -a              # 所有分支

# 创建分支
git branch <branch-name>

# 切换分支
git checkout <branch-name>
git switch <branch-name>   # 新版本命令

# 创建并切换分支
git checkout -b <branch-name>
git switch -c <branch-name> # 新版本命令

# 删除分支
git branch -d <branch-name>      # 删除已合并分支
git branch -D <branch-name>      # 强制删除分支

# 重命名分支
git branch -m <old-name> <new-name>

# 查看分支合并情况
git merge-base <branch1> <branch2>
```

#### 分支合并

```bash
# 合并分支（创建合并提交）
git merge <branch-name>

# 变基分支（线性历史）
git rebase <branch-name>

# 合并时遇到冲突
# 1. 手动解决冲突文件
# 2. 添加解决后的文件
git add <conflicted-file>
# 3. 继续合并
git commit                    # merge方式
git rebase --continue         # rebase方式

# 中止合并
git merge --abort
git rebase --abort
```

#### 分支策略

**Git Flow 工作流：**

```bash
# 主分支
main/master      # 生产环境代码

# 开发分支
develop         # 开发环境代码

# 功能分支
feature/xxx     # 新功能开发

# 修复分支
hotfix/xxx      # 紧急修复

# 发布分支
release/xxx     # 发布准备
```

**分支创建示例：**

```bash
# 从develop创建功能分支
git checkout develop
git checkout -b feature/user-login

# 完成开发后合并回develop
git checkout develop
git merge feature/user-login

# 删除功能分支
git branch -d feature/user-login
```

### Git Hooks配置

#### 手动配置Git Hooks

**项目根目录创建 `.git/hooks` 配置文件：**

```bash
# .git/hooks/pre-commit - 提交前检查
#!/bin/sh

# 运行 ESLint 检查
echo "运行 ESLint 检查..."
npm run lint || {
  echo "❌ ESLint 检查失败，请修复错误后再提交"
  exit 1
}

# 运行 TypeScript 类型检查
echo "运行 TypeScript 类型检查..."
npm run type-check || {
  echo "❌ TypeScript 类型检查失败，请修复类型错误后再提交"
  exit 1
}

# 运行单元测试
echo "运行单元测试..."
npm run test:unit || {
  echo "❌ 单元测试失败，请修复失败的测试后再提交"
  exit 1
}

echo "✅ 所有检查通过！"
```

```bash
# .git/hooks/commit-msg - 提交信息规范检查
#!/bin/sh

# 提交信息规范检查
commit_regex='^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
  echo "❌ 提交信息不符合规范！"
  echo ""
  echo "请使用以下格式："
  echo "  feat: 添加新功能"
  echo "  fix: 修复bug"
  echo "  docs: 文档更新"
  echo "  style: 代码格式调整"
  echo "  refactor: 代码重构"
  echo "  test: 测试相关"
  echo "  chore: 构建/工具相关"
  echo ""
  echo "可选的作用域："
  echo "  feat(user): 添加用户功能"
  echo "  fix(api): 修复API错误"
  echo ""
  exit 1
fi

echo "✅ 提交信息符合规范"
```

```bash
# .git/hooks/post-merge - 合并后操作
#!/bin/sh

# 合并后自动安装依赖
echo "检测到代码合并，正在安装依赖..."
npm install

# 检查是否有新的依赖版本
echo "检查依赖更新..."
npm outdated

echo "✅ 合并后操作完成"
```

#### 使用 Husky 和 lint-staged 自动化Git Hooks（推荐）

```bash
# 安装依赖
npm install -D husky lint-staged

# 初始化 Husky
npx husky install
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint . --ext .vue,.js,.ts",
    "lint:fix": "eslint . --ext .vue,.js,.ts --fix",
    "type-check": "vue-tsc --noEmit",
    "test": "vitest"
  },
  "lint-staged": {
    "*.{vue,js,ts}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,vue}": [
      "stylelint --fix"
    ],
    "*.{js,ts,vue}": [
      "vue-tsc --noEmit"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

```bash
# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx commitlint --edit $1
```

#### Commitlint配置

```bash
# 安装依赖
npm install -D @commitlint/cli @commitlint/config-conventional
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复bug
        'docs',     // 文档更新
        'style',    // 代码格式调整
        'refactor', // 代码重构
        'perf',     // 性能优化
        'test',     // 测试相关
        'chore',    // 构建/工具相关
        'revert',   // 回退提交
        'build',    // 构建系统
        'ci'        // CI配置
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'components',  // 组件相关
        'utils',       // 工具函数
        'styles',      // 样式相关
        'hooks',       // 钩子函数
        'router',      // 路由相关
        'store',       // 状态管理
        'api',         // API相关
        'types',       // 类型定义
        'config'       // 配置相关
      ]
    ],
    'subject-case': [0], // 不限制主题大小写
    'subject-max-length': [2, 'always', 72], // 主题最大长度
    'body-max-line-length': [2, 'always', 100], // 正文每行最大长度
  }
}
```

### 提交信息规范

#### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type类型说明

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复bug |
| `docs` | 文档更新 |
| `style` | 代码格式调整（不影响功能） |
| `refactor` | 代码重构（既不是新功能也不是修复） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具相关 |
| `build` | 构建系统 |
| `ci` | CI配置 |
| `revert` | 回退提交 |

#### Scope作用域说明

| Scope | 说明 |
|-------|------|
| `components` | 组件相关 |
| `utils` | 工具函数 |
| `styles` | 样式相关 |
| `hooks` | 钩子函数 |
| `router` | 路由相关 |
| `store` | 状态管理 |
| `api` | API相关 |
| `types` | 类型定义 |
| `config` | 配置相关 |

#### 完整提交示例

```bash
# 简单提交
git commit -m "feat: 添加用户登录功能"

# 带作用域的提交
git commit -m "feat(user): 添加用户头像上传功能"

# 带正文的提交
git commit -m "fix(api): 修复登录接口参数错误

- 修复用户名参数校验问题
- 添加错误提示信息
- 更新API文档

Closes #123"

# 复杂提交
git commit -m "refactor(utils): 重构日期格式化函数

重构原因：
- 旧代码性能不佳
- 缺少时区支持
- 不支持多种格式

改进点：
- 使用 Intl.DateTimeFormat API
- 添加时区参数
- 支持自定义格式

BREAKING CHANGE: formatDate 方法签名已更改"

# 性能优化提交
git commit -m "perf(list): 使用虚拟滚动优化大列表渲染

- 引入 vue-virtual-scroller
- 渲染性能提升 70%
- 内存占用减少 50%

性能测试：
- 1000 条数据渲染时间：200ms -> 60ms
- 滚动帧率：稳定在 60fps"

# 测试相关提交
git commit -m "test(user): 添加用户模块单元测试

- 添加用户登录测试用例
- 添加用户注册测试用例
- 覆盖率达到 85%"

# 文档更新提交
git commit -m "docs: 更新README安装说明

- 添加 Windows 安装步骤
- 更新依赖版本要求
- 补充常见问题解答"

# 构建相关提交
git commit -m "build: 升级Vite到最新版本

升级内容：
- vite: 4.0.0 -> 4.3.0
- @vitejs/plugin-vue: 4.0.0 -> 4.1.0

注意：需要清除缓存重新构建"
```

### 远程仓库协作

#### 远程仓库操作

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin <repository-url>

# 删除远程仓库
git remote remove origin

# 更改远程仓库地址
git remote set-url origin <new-url>

# 拉取远程更新
git fetch origin              # 拉取所有分支更新
git pull origin main          # 拉取并合并指定分支

# 推送到远程仓库
git push origin main          # 推送当前分支
git push origin <branch>      # 推送指定分支
git push -u origin <branch>   # 首次推送并建立关联

# 推送所有分支
git push --all origin

# 推送标签
git push --tags

# 删除远程分支
git push origin --delete <branch>
```

#### 团队协作工作流

**Feature Branch 工作流：**

```bash
# 1. 从主分支创建功能分支
git checkout main
git checkout -b feature/new-feature

# 2. 开发并提交
git add .
git commit -m "feat: 添加新功能"

# 3. 推送到远程
git push -u origin feature/new-feature

# 4. 创建 Pull Request / Merge Request
# 在 GitHub/GitLab 上操作

# 5. 代码审查后合并到主分支
# 在平台上合并或使用命令
git checkout main
git merge feature/new-feature

# 6. 删除功能分支
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### 团队协作最佳实践

#### 代码审查规范

**Pull Request 检查清单：**
- [ ] 代码符合项目编码规范
- [ ] 通过所有 ESLint 检查
- [ ] 通过所有单元测试
- [ ] 添加必要的注释和文档
- [ ] 提交信息符合规范
- [ ] 不包含调试代码
- [ ] 不包含敏感信息

#### 分支管理规范

```bash
# 开发流程
1. 从 develop 创建 feature 分支
   git checkout develop
   git checkout -b feature/xxx

2. 开发完成后推送到远程
   git push -u origin feature/xxx

3. 创建 Pull Request 到 develop

4. 代码审查通过后合并

5. 删除 feature 分支

# 发布流程
1. 从 develop 创建 release 分支
   git checkout develop
   git checkout -b release/v1.0.0

2. 测试和修复
   # 修复bug
   git commit -m "fix: 修复发布版本bug"

3. 合并到 main 和 develop
   git checkout main
   git merge release/v1.0.0
   git tag -a v1.0.0 -m "发布版本 1.0.0"

   git checkout develop
   git merge release/v1.0.0

4. 删除 release 分支
   git branch -d release/v1.0.0
```

#### 常用Git别名配置

```bash
# 设置常用别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr)%Creset' --abbrev-commit"

# 使用别名
git st                      # 代替 git status
git co main                 # 代替 git checkout main
git br -a                   # 代替 git branch -a
git ci -m "message"         # 代替 git commit -m "message"
```

#### .gitignore 配置

```bash
# .gitignore - Vue3 项目推荐配置

# 依赖
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# 构建输出
dist/
build/
*.tgz

# 日志
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 编辑器
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.swp
*.swo
*~

# 系统文件
.DS_Store
Thumbs.db

# 环境变量
.env.local
.env.*.local

# 测试覆盖率
coverage/
*.lcov

# 临时文件
*.tmp
*.temp
.cache/

# 调试
*.map
```

---
