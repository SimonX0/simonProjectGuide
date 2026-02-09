# Git 版本控制

## 什么是 Git

Git 是一个分布式版本控制系统，用于跟踪文件变化，协调多人协作开发。由 Linus Torvalds 在 2005 年创建，现在是世界上最流行的版本控制系统。

### 为什么需要版本控制

- **历史记录**：保存文件的所有修改历史
- **协作开发**：多人同时开发同一项目
- **分支管理**：并行开发不同功能
- **代码回溯**：随时回到历史版本
- **代码合并**：整合不同的修改

### Git vs 其他版本控制系统

| 特性 | Git | SVN | Mercurial |
|------|-----|-----|-----------|
| 类型 | 分布式 | 集中式 | 分布式 |
| 分支 | 轻量级 | 重量级 | 轻量级 |
| 速度 | 快 | 慢 | 快 |
| 离线工作 | 支持 | 不支持 | 支持 |
| 学习曲线 | 陡峭 | 平缓 | 平缓 |

## Git 基础概念

### 工作区域

Git 有三个工作区域：

```
工作区 (Working Directory)
    ↓ git add
暂存区 (Staging Area)
    ↓ git commit
本地仓库 (Local Repository)
    ↓ git push
远程仓库 (Remote Repository)
```

### 三个区域详解

**工作区**
- 你实际操作的文件目录
- 修改后的文件在这里

**暂存区**
- 保存即将提交的文件
- 也称为"索引区"

**本地仓库**
- 保存所有提交历史
- 在 `.git` 目录中

**远程仓库**
- 托管在网络上的仓库
- 如 GitHub、GitLab

## 安装 Git

### Linux 安装

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install git

# CentOS/RHEL
sudo yum install git

# 验证安装
git --version
```

### 配置 Git

```bash
# 设置用户名
git config --global user.name "Your Name"

# 设置邮箱
git config --global user.email "your.email@example.com"

# 查看配置
git config --list

# 设置默认分支名
git config --global init.defaultBranch main
```

## 基本操作

### 创建仓库

```bash
# 初始化新仓库
git init

# 克隆远程仓库
git clone https://github.com/user/repo.git
```

### 查看状态

```bash
# 查看工作区状态
git status

# 查看简洁状态
git status -s
```

### 添加文件

```bash
# 添加指定文件
git add file.txt

# 添加所有文件
git add .

# 添加所有修改的文件
git add -u

# 交互式添加
git add -i
```

### 提交更改

```bash
# 提交暂存区的更改
git commit -m "提交信息"

# 添加并提交
git commit -am "提交信息"

# 修改上次提交
git commit --amend

# 查看提交历史
git log

# 查看简洁历史
git log --oneline
```

## 分支管理

### 分支概念

分支允许你并行开发，不影响主线。

```
main (主分支)
  ├── feature-a (功能分支)
  └── bugfix-b (修复分支)
```

### 分支操作

```bash
# 查看所有分支
git branch

# 创建新分支
git branch feature-login

# 切换分支
git checkout feature-login
# 或
git switch feature-login

# 创建并切换分支
git checkout -b feature-login
# 或
git switch -c feature-login

# 删除分支
git branch -d feature-login

# 强制删除分支
git branch -D feature-login

# 重命名分支
git branch -m old-name new-name

# 查看分支图
git log --graph --oneline --all
```

### 合并分支

```bash
# 切换到主分支
git checkout main

# 合并其他分支
git merge feature-login

# 如果有冲突，解决后：
git add .
git commit -m "合并分支"
```

### 变基 (Rebase)

```bash
# 将当前分支变基到 main
git rebase main

# 交互式变基
git rebase -i HEAD~3
```

**合并 vs 变基**
- 合并：保留完整历史
- 变基：线性历史，更清晰

## 远程操作

### 查看远程仓库

```bash
# 查看远程仓库
git remote

# 查看详细信息
git remote -v

# 查看远程分支
git branch -r
```

### 添加远程仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/user/repo.git

# 修改远程仓库 URL
git remote set-url origin https://github.com/user/new-repo.git

# 删除远程仓库
git remote remove origin
```

### 推送到远程

```bash
# 首次推送（设置上游分支）
git push -u origin main

# 推送当前分支
git push

# 推送所有分支
git push --all

# 推送标签
git push --tags

# 强制推送（危险）
git push -f origin main
```

### 拉取更新

```bash
# 拉取并合并
git pull

# 拉取但不合并
git fetch

# 拉取指定分支
git pull origin main

# 变基拉取
git pull --rebase
```

## 常用命令

### 查看差异

```bash
# 查看工作区和暂存区的差异
git diff

# 查看暂存区和本地仓库的差异
git diff --staged

# 查看两个分支的差异
git diff main feature

# 查看指定文件的差异
git diff file.txt
```

### 撤销操作

```bash
# 撤销工作区的修改
git restore file.txt

# 撤销暂存区的修改
git restore --staged file.txt

# 撤销最近的提交（保留修改）
git reset --soft HEAD~1

# 撤销最近的提交（不保留修改）
git reset --hard HEAD~1

# 回退到指定提交
git reset --hard commit-hash

# 撤销指定提交（创建新提交）
git revert commit-hash
```

### 删除操作

```bash
# 删除文件
git rm file.txt

# 删除目录
git rm -r directory

# 删除暂存区但保留工作区
git rm --cached file.txt
```

## 忽略文件

### .gitignore 文件

创建 `.gitignore` 文件指定要忽略的文件：

```gitignore
# 忽略 node_modules
node_modules/

# 忽略日志文件
*.log

# 忽略环境变量文件
.env

# 忽略系统文件
.DS_Store
Thumbs.db

# 忽略构建产物
dist/
build/

# 忽略测试覆盖率
coverage/

# 忽略 IDE 配置
.vscode/
.idea/
```

### .gitignore 规则

```gitignore
# 注释
# 空行被忽略

# 匹配所有 .log 文件
*.log

# 匹配所有目录下的 log.txt
**/log.txt

# 匹配根目录的 log.txt
/log.txt

# 取消忽略
!important.log

# 匹配目录及其内容
temp/

# 匹配目录但不包括子目录
/temp/*
```

## 标签管理

### 创建标签

```bash
# 创建轻量标签
git tag v1.0.0

# 创建附注标签
git tag -a v1.0.0 -m "版本1.0.0"

# 给指定提交打标签
git tag -a v0.9.0 commit-hash -m "版本0.9.0"
```

### 查看标签

```bash
# 查看所有标签
git tag

# 查看标签信息
git show v1.0.0

# 查看匹配的标签
git tag -l "v1.*"
```

### 推送标签

```bash
# 推送指定标签
git push origin v1.0.0

# 推送所有标签
git push --tags

# 删除远程标签
git push origin --delete v1.0.0
```

### 删除标签

```bash
# 删除本地标签
git tag -d v1.0.0
```

## 常见工作流程

### 功能分支工作流

```
1. 从 main 创建功能分支
git checkout -b feature-login

2. 开发功能
git add .
git commit -m "添加登录功能"

3. 推送到远程
git push -u origin feature-login

4. 创建 Pull Request

5. 代码审查

6. 合并到 main

7. 删除功能分支
git branch -d feature-login
```

### Git Flow 工作流

```bash
# 主要分支
main          # 生产环境
develop       # 开发环境

# 支持分支
feature/*     # 新功能
release/*     # 发布准备
hotfix/*      # 紧急修复

# 开始新功能
git checkout develop
git checkout -b feature-login

# 完成功能
git checkout develop
git merge feature-login

# 准备发布
git checkout -b release-1.0

# 完成发布
git checkout main
git merge release-1.0
git checkout develop
git merge release-1.0
```

### GitHub Flow 工作流

```
1. main 分支始终可部署

2. 从 main 创建新分支
git checkout -b feature-login

3. 提交到本地
git commit -am "添加登录"

4. 推送到远程
git push -u origin feature-login

5. 创建 Pull Request

6. 代码审查和讨论

7. 合并到 main

8. 立即部署
```

## 实用技巧

### 搜索

```bash
# 搜索提交历史
git log --grep "搜索内容"

# 搜索代码
git grep "搜索内容"

# 搜索添加或删除了某代码的提交
git log -S "function_name"
```

### 别名

```bash
# 创建别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status

# 使用别名
git co main        # 相当于 git checkout main
git br             # 相当于 git branch
```

### 储藏 (Stash)

```bash
# 保存当前工作
git stash

# 保存并添加说明
git stash save "工作进度"

# 查看储藏列表
git stash list

# 应用储藏
git stash apply
git stash pop

# 应用指定储藏
git stash apply stash@{1}

# 删除储藏
git stash drop
git stash clear
```

### Cherry-pick

```bash
# 选择指定提交应用到当前分支
git cherry-pick commit-hash

# 选择多个提交
git cherry-pick commit1 commit2
```

## 问题排查

### 查看历史

```bash
# 查看提交历史
git log

# 查看图形化历史
git log --graph --oneline --all

# 查看指定文件的历史
git log --follow file.txt

# 查看每行代码是谁写的
git blame file.txt
```

### 二分查找

```bash
# 开始二分查找
git bisect start

# 标记当前为坏的提交
git bisect bad

# 标记已知好的提交
git bisect good commit-hash

# Git 会切换到中间版本，测试后标记
git bisect good    # 或 git bisect bad

# 完成后重置
git bisect reset
```

## 最佳实践

### 提交信息规范

使用规范的提交信息格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type)**
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例**

```bash
git commit -m "feat(auth): 添加用户登录功能

- 实现用户名密码登录
- 添加JWT认证
- 更新登录页面UI

Closes #123"
```

### 分支命名规范

```
feature/    # 新功能
bugfix/     # bug修复
hotfix/     # 紧急修复
release/    # 发布版本
docs/       # 文档更新
```

### 代码审查

- 每个提交都应该被审查
- 保持提交小而聚焦
- 清晰描述变更内容
- 及时响应审查意见

## 常用命令速查表

| 命令 | 功能 |
|------|------|
| `git init` | 初始化仓库 |
| `git clone` | 克隆仓库 |
| `git status` | 查看状态 |
| `git add` | 添加到暂存区 |
| `git commit` | 提交更改 |
| `git push` | 推送到远程 |
| `git pull` | 拉取更新 |
| `git branch` | 管理分支 |
| `git checkout` | 切换分支 |
| `git merge` | 合并分支 |
| `git log` | 查看历史 |
| `git diff` | 查看差异 |

## 总结

Git 是现代软件开发不可或缺的工具。通过本章学习，你应该掌握了：

- Git 的基本概念和工作原理
- 常用命令的使用
- 分支管理和协作流程
- 实用技巧和最佳实践

下一章我们将学习 [Docker 容器化](chapter-05)，了解如何使用容器技术进行应用部署。
