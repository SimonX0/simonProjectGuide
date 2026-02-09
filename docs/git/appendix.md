# 附录：Git命令速查手册

> **Git版本控制系统完全指南**
>
> 本附录提供：
> - Git基础命令速查
> - Git分支管理命令
> - Git远程操作命令
> - Git常用场景命令
> - Git高级技巧命令

## 附录A：Git基础命令

### 📝 仓库操作

| 命令 | 说明 | 频率 |
|------|------|------|
| `git init` | 初始化仓库 | ⭐⭐⭐⭐⭐ |
| `git clone <url>` | 克隆远程仓库 | ⭐⭐⭐⭐⭐ |
| `git status` | 查看工作区状态 | ⭐⭐⭐⭐⭐ |
| `git log` | 查看提交历史 | ⭐⭐⭐⭐⭐ |
| `git log --oneline` | 简洁查看历史 | ⭐⭐⭐⭐⭐ |

### 💾 文件操作

| 命令 | 说明 | 频率 |
|------|------|------|
| `git add <file>` | 添加文件到暂存区 | ⭐⭐⭐⭐⭐ |
| `git add .` | 添加所有文件 | ⭐⭐⭐⭐⭐ |
| `git commit -m "msg"` | 提交变更 | ⭐⭐⭐⭐⭐ |
| `git commit -am "msg"` | 添加并提交 | ⭐⭐⭐⭐ |
| `git rm <file>` | 删除文件 | ⭐⭐⭐⭐ |
| `git mv <old> <new>` | 重命名文件 | ⭐⭐⭐ |

### 🔄 撤销操作

| 命令 | 说明 | 频率 |
|------|------|------|
| `git checkout -- <file>` | 撤销工作区修改 | ⭐⭐⭐⭐⭐ |
| `git restore <file>` | 恢复文件（新命令） | ⭐⭐⭐⭐⭐ |
| `git reset HEAD <file>` | 取消暂存 | ⭐⭐⭐⭐⭐ |
| `git restore --staged <file>` | 取消暂存（新命令） | ⭐⭐⭐⭐⭐ |
| `git reset --soft HEAD~1` | 撤销上次提交（保留修改） | ⭐⭐⭐⭐ |
| `git reset --hard HEAD~1` | 撤销上次提交（丢弃修改） | ⭐⭐⭐ |
| `git revert <commit>` | 反转提交 | ⭐⭐⭐⭐ |

---

## 附录B：Git分支管理

### 🌿 分支操作

| 命令 | 说明 | 频率 |
|------|------|------|
| `git branch` | 列出本地分支 | ⭐⭐⭐⭐⭐ |
| `git branch -r` | 列出远程分支 | ⭐⭐⭐⭐⭐ |
| `git branch -a` | 列出所有分支 | ⭐⭐⭐⭐⭐ |
| `git branch <name>` | 创建分支 | ⭐⭐⭐⭐⭐ |
| `git branch -d <name>` | 删除分支 | ⭐⭐⭐⭐⭐ |
| `git branch -D <name>` | 强制删除分支 | ⭐⭐⭐ |
| `git checkout <branch>` | 切换分支 | ⭐⭐⭐⭐⭐ |
| `git switch <branch>` | 切换分支（新命令） | ⭐⭐⭐⭐⭐ |
| `git checkout -b <name>` | 创建并切换分支 | ⭐⭐⭐⭐⭐ |
| `git switch -c <name>` | 创建并切换（新命令） | ⭐⭐⭐⭐⭐ |

### 🔀 合并操作

| 命令 | 说明 | 频率 |
|------|------|------|
| `git merge <branch>` | 合并分支 | ⭐⭐⭐⭐⭐ |
| `git merge --no-ff <branch>` | 合并（不快进） | ⭐⭐⭐⭐ |
| `git merge --squash <branch>` | 压缩合并 | ⭐⭐⭐⭐ |
| `git rebase <branch>` | 变基 | ⭐⭐⭐⭐ |
| `git rebase -i HEAD~3` | 交互式变基 | ⭐⭐⭐⭐ |
| `git cherry-pick <commit>` | 挑选提交 | ⭐⭐⭐ |

### 🎯 分支对比

| 命令 | 说明 | 频率 |
|------|------|------|
| `git diff <branch1> <branch2>` | 对比分支差异 | ⭐⭐⭐⭐⭐ |
| `git log <branch1>..<branch2>` | 查看分支差异日志 | ⭐⭐⭐⭐ |
| `git log --graph --oneline` | 图形化显示提交 | ⭐⭐⭐⭐ |

---

## 附录C：Git远程操作

### 🌐 远程仓库

| 命令 | 说明 | 频率 |
|------|------|------|
| `git remote -v` | 查看远程仓库 | ⭐⭐⭐⭐⭐ |
| `git remote add <name> <url>` | 添加远程仓库 | ⭐⭐⭐⭐⭐ |
| `git remote remove <name>` | 删除远程仓库 | ⭐⭐⭐⭐ |
| `git remote rename <old> <new>` | 重命名远程仓库 | ⭐⭐⭐ |

### 📤 推送和拉取

| 命令 | 说明 | 频率 |
|------|------|------|
| `git push` | 推送到远程 | ⭐⭐⭐⭐⭐ |
| `git push -u origin <branch>` | 推送并设置上游 | ⭐⭐⭐⭐⭐ |
| `git push --all` | 推送所有分支 | ⭐⭐⭐⭐ |
| `git push --tags` | 推送所有标签 | ⭐⭐⭐⭐ |
| `git pull` | 拉取并合并 | ⭐⭐⭐⭐⭐ |
| `git pull --rebase` | 拉取并变基 | ⭐⭐⭐⭐ |
| `git fetch` | 获取远程更新 | ⭐⭐⭐⭐⭐ |
| `git fetch --all` | 获取所有远程更新 | ⭐⭐⭐⭐ |

### 🏷️ 标签管理

| 命令 | 说明 | 频率 |
|------|------|------|
| `git tag` | 列出标签 | ⭐⭐⭐⭐⭐ |
| `git tag <name>` | 创建轻量标签 | ⭐⭐⭐⭐ |
| `git tag -a <name> -m "msg"` | 创建附注标签 | ⭐⭐⭐⭐⭐ |
| `git tag -d <name>` | 删除本地标签 | ⭐⭐⭐⭐ |
| `git push origin <tag>` | 推送标签 | ⭐⭐⭐⭐ |
| `git push origin --tags` | 推送所有标签 | ⭐⭐⭐⭐ |
| `git checkout <tag>` | 切换到标签 | ⭐⭐⭐ |

---

## 附录D：Git常用场景

### 🐛 修复问题

```bash
# 撤销工作区修改
git restore <file>

# 撤销暂存区修改
git restore --staged <file>

# 撤销最近一次提交
git reset --soft HEAD~1

# 修改最近一次提交信息
git commit --amend

# 修改最近一次提交内容
git add <file>
git commit --amend --no-edit
```

### 🔄 同步远程

```bash
# 拉取远程最新代码
git pull origin main

# 拉取远程并变基
git pull --rebase origin main

# 推送到远程
git push origin feature-branch

# 强制推送（慎用）
git push --force origin feature-branch

# 强制推送安全版本
git push --force-with-lease origin feature-branch
```

### 🌿 分支管理

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 合并功能分支
git checkout main
git merge feature/new-feature

# 删除已合并分支
git branch -d feature/new-feature

# 变基到主分支
git checkout feature-branch
git rebase main
```

### 📦 暂存管理

```bash
# 暂存当前工作
git stash save "work in progress"

# 查看暂存列表
git stash list

# 应用最近暂存
git stash pop

# 应用指定暂存
git stash apply stash@{1}

# 删除暂存
git stash drop stash@{1}

# 清空所有暂存
git stash clear
```

---

## 附录E：Git高级技巧

### 🔍 搜索和查找

| 命令 | 说明 | 频率 |
|------|------|------|
| `git grep "keyword"` | 在代码中搜索 | ⭐⭐⭐⭐ |
| `git log --grep="keyword"` | 搜索提交信息 | ⭐⭐⭐⭐ |
| `git log --author="name"` | 按作者搜索 | ⭐⭐⭐ |
| `git log --since="2024-01-01"` | 按时间搜索 | ⭐⭐⭐⭐ |
| `git log --until="2024-12-31"` | 按时间搜索 | ⭐⭐⭐⭐ |

### 🎨 Git别名配置

```bash
# 常用别名设置
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --graph --oneline --all"
```

### 📊 日志美化

```bash
# 图形化显示
git log --graph --oneline --decorate --all

# 详细格式
git log --pretty=format:"%h - %an, %ar : %s"

# 自定义格式
git log --pretty=format:"%h %s" --graph
```

### 🔧 子模块操作

| 命令 | 说明 | 频率 |
|------|------|------|
| `git submodule add <url>` | 添加子模块 | ⭐⭐⭐⭐ |
| `git submodule init` | 初始化子模块 | ⭐⭐⭐⭐⭐ |
| `git submodule update` | 更新子模块 | ⭐⭐⭐⭐⭐ |
| `git submodule update --remote` | 更新到最新版本 | ⭐⭐⭐⭐ |

### 🗃️ 归档操作

```bash
# 创建压缩包
git archive --format=zip --output=repo.zip HEAD

# 创建 tar.gz
git archive --format=tar.gz --output=repo.tar.gz HEAD

# 导出指定目录
git archive --format=tar.gz --output=docs.tar.gz HEAD:docs/
```

---

## 附录F：Git常见问题

### ❓ 合并冲突

```bash
# 查看冲突文件
git status

# 编辑冲突文件后标记解决
git add <resolved-file>

# 继续合并
git commit

# 放弃合并
git merge --abort

# 使用当前分支版本
git checkout --ours <file>

# 使用合并分支版本
git checkout --theirs <file>
```

### ❓ 回退操作

```bash
# 查看所有操作记录
git reflog

# 回退到指定状态
git reset --hard <commit-hash>

# 撤销 reflog 操作
git reset --hard HEAD@{1}
```

### ❓ 清理操作

```bash
# 清理未跟踪文件
git clean -f

# 清理未跟踪文件和目录
git clean -fd

# 预览要清理的文件
git clean -n

# 清理忽略的文件
git clean -fX
```

---

## 附录G：Git最佳实践

### ✅ 提交信息规范

```bash
# 格式：<type>(<scope>): <subject>

# 类型说明
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建/工具

# 示例
git commit -m "feat(auth): add user login"
git commit -m "fix(api): resolve timeout issue"
git commit -m "docs(readme): update installation guide"
```

### ✅ 分支命名规范

```bash
# 功能分支
feature/user-auth
feature/payment-gateway

# 修复分支
fix/login-bug
fix/crash-issue

# 发布分支
release/v1.0.0
release/v2.1.0

# 热修复分支
hotfix/critical-bug
hotfix/security-patch
```

### ✅ 工作流建议

1. **功能开发**：从 main 创建 feature 分支
2. **代码审查**：通过 Pull Request 合并
3. **定期同步**：定期从 main 拉取更新
4. **保持干净**：及时删除已合并分支
5. **写好提交**：使用规范的提交信息

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
