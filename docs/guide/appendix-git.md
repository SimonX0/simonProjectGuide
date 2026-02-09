# 附录：Git命令速查手册

> **为什么要掌握Git？**
>
> Git是现代软件开发的核心工具，本附录提供：
> - Git高频命令清单
> - 常用工作流程指南
> - VSCode Git集成技巧
> - Git常见问题解决

## 附录A：Git基础命令

### 配置相关

```bash
# 查看当前配置
git config --list

# 查看用户配置
git config user.name
git config user.email

# 设置全局用户名和邮箱
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 设置当前仓库的用户名和邮箱
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 设置命令别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
```

---

## 附录B：Git高频命令速查

### 🎯 仓库操作

| 功能 | 命令 | 频率 |
|------|------|------|
| **初始化仓库** | `git init` | ⭐⭐⭐⭐⭐ |
| **克隆仓库** | `git clone <url>` | ⭐⭐⭐⭐⭐ |
| **查看远程仓库** | `git remote -v` | ⭐⭐⭐⭐ |
| **添加远程仓库** | `git remote add <name> <url>` | ⭐⭐⭐⭐ |
| **删除远程仓库** | `git remote remove <name>` | ⭐⭐⭐ |

### 📝 暂存区操作

| 功能 | 命令 | 频率 |
|------|------|------|
| **查看状态** | `git status` | ⭐⭐⭐⭐⭐ |
| **添加文件到暂存区** | `git add <file>` | ⭐⭐⭐⭐⭐ |
| **添加所有文件** | `git add .` | ⭐⭐⭐⭐⭐ |
| **添加指定文件** | `git add *.js` | ⭐⭐⭐⭐ |
| **交互式添加** | `git add -i` | ⭐⭐⭐ |
| **取消暂存** | `git reset <file>` | ⭐⭐⭐⭐ |
| **取消所有暂存** | `git reset` | ⭐⭐⭐⭐ |

### 💾 提交操作

| 功能 | 命令 | 频率 |
|------|------|------|
| **提交** | `git commit -m "message"` | ⭐⭐⭐⭐⭐ |
| **添加并提交** | `git commit -am "message"` | ⭐⭐⭐⭐ |
| **修改最后一次提交** | `git commit --amend` | ⭐⭐⭐⭐ |
| **修改提交信息** | `git commit --amend -m "new message"` | ⭐⭐⭐ |
| **空提交** | `git commit --allow-empty -m "message"` | ⭐⭐⭐ |

### 🌲 分支操作

| 功能 | 命令 | 频率 |
|------|------|------|
| **查看本地分支** | `git branch` | ⭐⭐⭐⭐⭐ |
| **查看所有分支** | `git branch -a` | ⭐⭐⭐⭐ |
| **创建分支** | `git branch <branch-name>` | ⭐⭐⭐⭐⭐ |
| **切换分支** | `git checkout <branch-name>` | ⭐⭐⭐⭐⭐ |
| **创建并切换** | `git checkout -b <branch-name>` | ⭐⭐⭐⭐⭐ |
| **删除本地分支** | `git branch -d <branch-name>` | ⭐⭐⭐⭐ |
| **强制删除分支** | `git branch -D <branch-name>` | ⭐⭐⭐ |
| **重命名分支** | `git branch -m <old> <new>` | ⭐⭐⭐⭐ |
| **查看分支关系** | `git log --graph --oneline --all` | ⭐⭐⭐⭐ |

### 📤 推送操作

| 功能 | 命令 | 频率 |
|------|------|------|
| **推送到远程** | `git push` | ⭐⭐⭐⭐⭐ |
| **推送指定分支** | `git push origin <branch>` | ⭐⭐⭐⭐⭐ |
| **推送所有分支** | `git push --all` | ⭐⭐⭐ |
| **推送标签** | `git push --tags` | ⭐⭐⭐ |
| **首次推送分支** | `git push -u origin <branch>` | ⭐⭐⭐⭐⭐ |
| **删除远程分支** | `git push origin --delete <branch>` | ⭐⭐⭐ |
| **拉取远程更新** | `git pull` | ⭐⭐⭐⭐⭐ |
| **拉取指定分支** | `git pull origin <branch>` | ⭐⭐⭐⭐ |
| **拉取并变基** | `git pull --rebase` | ⭐⭐⭐⭐ |

### 🔄 拉取与合并

| 功能 | 命令 | 频率 |
|------|------|------|
| **拉取远程** | `git fetch` | ⭐⭐⭐⭐ |
| **合并分支** | `git merge <branch>` | ⭐⭐⭐⭐⭐ |
| **变基** | `git rebase <branch>` | ⭐⭐⭐⭐ |
| **取消变基** | `git rebase --abort` | ⭐⭐⭐ |
| **继续变基** | `git rebase --continue` | ⭐⭐⭐ |
| **跳过变基** | `git rebase --skip` | ⭐⭐⭐ |

### 🔙 撤销操作

| 功能 | 命令 | 频率 |
|------|------|------|
| **撤销工作区修改** | `git restore <file>` | ⭐⭐⭐⭐⭐ |
| **撤销所有工作区** | `git restore .` | ⭐⭐⭐⭐ |
| **撤销暂存区** | `git restore --staged <file>` | ⭐⭐⭐⭐ |
| **撤销上次提交** | `git reset --soft HEAD~1` | ⭐⭐⭐⭐ |
| **撤销提交和暂存** | `git reset --mixed HEAD~1` | ⭐⭐⭐ |
| **撤销所有（保留工作区）** | `git reset --soft HEAD~1` | ⭐⭐⭐⭐ |
| **彻底撤销** | `git reset --hard HEAD~1` | ⭐⭐⭐ |
| **回滚到指定提交** | `git reset --hard <commit-id>` | ⭐⭐⭐ |
| **查看提交历史** | `git log` | ⭐⭐⭐⭐⭐ |
| **查看简洁历史** | `git log --oneline` | ⭐⭐⭐⭐⭐ |
| **查看图形历史** | `git log --graph --oneline` | ⭐⭐⭐⭐ |

### 📊 查看操作

| 功能 | 命令 | 频率 |
|------|------|------|
| **查看状态** | `git status` | ⭐⭐⭐⭐⭐ |
| **查看日志** | `git log` | ⭐⭐⭐⭐⭐ |
| **查看简洁日志** | `git log --oneline` | ⭐⭐⭐⭐⭐ |
| **查看分支图** | `git log --graph --oneline --all` | ⭐⭐⭐⭐ |
| **查看文件差异** | `git diff` | ⭐⭐⭐⭐ |
| **查看暂存差异** | `git diff --staged` | ⭐⭐⭐⭐ |
| **查看提交详情** | `git show <commit-id>` | ⭐⭐⭐⭐ |
| **查看文件历史** | `git log -- <file>` | ⭐⭐⭐ |

---

## 附录C：Git常用工作流

### 🎯 Feature Branch 工作流（推荐）

```bash
# 1. 从主分支创建功能分支
git checkout main
git pull origin main
git checkout -b feature/user-auth

# 2. 开发功能
git add .
git commit -m "feat: add user authentication"

# 3. 推送到远程
git push -u origin feature/user-auth

# 4. 创建Pull Request（GitHub/GitLab）
# 在网页上操作，或者使用Git命令

# 5. 代码审查后合并到主分支
git checkout main
git pull origin main
git pull origin feature/user-auth

# 6. 删除功能分支
git branch -d feature/user-auth
git push origin --delete feature/user-auth
```

### 🔄 Git Flow 工作流

```bash
# 1. 初始化Git Flow
git flow init

# 2. 开始新功能
git flow feature start user-auth

# 3. 完成功能开发
git flow feature finish user-auth

# 4. 开始发布版本
git flow release start v1.0.0

# 5. 完成发布
git flow release finish v1.0.0

# 6. 修复紧急Bug
git flow hotfix start hotfix-1.0.1
git flow hotfix finish hotfix-1.0.1
```

### 🌱 Fork工作流（开源贡献）

```bash
# 1. Fork开源仓库到自己的账号

# 2. 克隆自己的仓库
git clone https://github.com/yourname/repo.git
cd repo

# 3. 添加上游仓库
git remote add upstream https://github.com/original/repo.git

# 4. 创建功能分支
git checkout -b feature-my-feature

# 5. 开发并提交
git add .
git commit -m "feat: add my feature"

# 6. 推送到自己的仓库
git push origin feature-my-feature

# 7. 在GitHub上创建Pull Request

# 8. 定期同步上游更新
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## 附录D：Git高级技巧

### 🔍 Git Stash（暂存）

```bash
# 暂存当前修改
git stash

# 暂存并添加说明
git stash save "work in progress"

# 查看暂存列表
git stash list

# 应用最近暂存
git stash pop

# 应用指定暂存
git stash apply stash@{1}

# 应用并删除暂存
git stash drop stash@{0}

# 清除所有暂存
git stash clear
```

### 🏷️ Git Tag（标签）

```bash
# 创建轻量标签
git tag v1.0.0

# 创建附注标签（推荐）
git tag -a v1.0.0 -m "版本1.0.0"

# 查看所有标签
git tag

# 查看标签信息
git show v1.0.0

# 推送标签到远程
git push origin v1.0.0

# 推送所有标签
git push origin --tags

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0

# 检出标签
git checkout v1.0.0
```

### 🎨 Git Ignore（忽略文件）

创建 `.gitignore`：

```gitignore
# ===== 依赖 =====
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# ===== 构建产物 =====
dist/
build/
.vite/
.nuxt/
.next/
out/

# ===== 环境变量 =====
.env
.env.local
.env.*.local

# ===== 日志 =====
logs/
*.log
npm-debug.log*

# ===== 编辑器 =====
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# ===== 操作系统 =====
.DS_Store
Thumbs.db
desktop.ini

# ===== 测试覆盖率 =====
coverage/
*.lcov
.nyc_output/

# ===== TypeScript =====
*.tsbuildinfo

# ===== 临时文件 =====
*.tmp
*.temp
.cache/
```

### 📦 Git Submodule（子模块）

```bash
# 添加子模块
git submodule add <repo-url>

# 初始化子模块
git submodule init

# 更新子模块
git submodule update

# 克隆包含子模块的仓库
git clone --recurse-submodules <repo-url>

# 删除子模块
git submodule deinit <path>
git rm <path>
```

---

## 附录E：VSCode Git集成技巧

### 🎨 Git Graph可视化

```json
// .vscode/settings.json
{
  "git.enableSmartCommit": true,
  "git.autofetch": true,
  "git.confirmSync": false,
  "git.postCommitCommand": "none",
  "git.graphStyle": "linear"
}
```

### 🔧 Git扩展推荐

| 扩展 | 用途 |
|------|------|
| `GitLens` | Git超级增强，显示提交者、文件历史 |
| `Git Graph` | 可视化Git提交图谱 |
| `Git History` | 查看文件历史记录 |
| `Gitignore` | 高亮.gitignore文件 |
| `Open in GitHub` | 快速在GitHub打开文件 |

### ⌨️ VSCode Git快捷键

| 功能 | 快捷键 |
|------|--------|
| **打开源码管理** | `Ctrl+Shift+G` |
| **查看更改** | `Ctrl+Alt+G` |
| **提交** | `Ctrl+Enter` |
| **推送** | `Ctrl+Shift+H` |
| **拉取** | `Ctrl+Shift+L` |
| **放弃更改** | `Ctrl+Shift+U` |
| **打开文件** | `Ctrl+Shift+F` |

---

## 附录F：Git常见问题解决

### ❓ 常见错误与解决

**1. 提交时遇到错误**

```bash
# 错误：Updates were rejected because the tip of your current branch is behind
# 解决：拉取远程更新
git pull --rebase origin main
# 或强制推送（谨慎）
git push --force-with-lease
```

**2. 合并冲突**

```bash
# 查看冲突文件
git status

# 解决冲突后标记为已解决
git add <file>

# 继续合并
git commit
```

**3. 撤销敏感文件**

```bash
# 从历史记录中完全删除文件
git filter-branch --tree-filter 'rm -rf path/to/file'
git push --force

# 或者使用BFG工具（更快）
java -jar bfg.jar --delete-files path/to/file
```

**4. 清理大文件**

```bash
# 查看大文件
git rev-list --objects --all |
git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(objectrest)' |
awk '/^blob/ {print substr($0,6)}' |
sort -n -k2

# 使用git filter-repo清理
git filter-repo --path path/to/large/file --tree-filter 'rm path/to/large/file'
git push --force
```

**5. 恢复误删的分支**

```bash
# 查看所有操作记录
git reflog

# 恢复分支
git checkout -b <branch-name> <commit-id>
```

---

## 附录G：Git最佳实践

### ✅ 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）：**
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链更新
- `ci`: CI/CD配置

**示例：**
```bash
git commit -m "feat(auth): add user authentication"
git commit -m "fix(api): handle edge case in login"
git commit -m "docs(readme): update installation guide"
```

### ✅ 分支管理规范

```
main (或 master)     - 生产环境代码
├── develop            - 开发环境代码
│   ├── feature/*     - 功能分支
│   ├── hotfix/*      - 紧急修复分支
│   └── release/*     - 发布分支
```

### ✅ 工作流建议

1. **功能开发**
   - 从 develop 创建 feature 分支
   - 开发完成后合并回 develop
   - 删除 feature 分支

2. **紧急修复**
   - 从 main 创建 hotfix 分支
   - 修复后同时合并到 main 和 develop
   - 删除 hotfix 分支

3. **版本发布**
   - 从 develop 创建 release 分支
   - 测试后合并到 main
   - 打标签 v1.0.0
   - 合并回 develop

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
