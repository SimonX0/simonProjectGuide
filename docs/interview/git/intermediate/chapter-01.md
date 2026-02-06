---
title: Git基础命令面试题
---

# Git基础命令面试题

## 核心概念

### Git的三个区域？

Git有三个主要区域：

**1. 工作区（Working Directory）**
- 实际的文件目录
- 你看到和编辑的文件

**2. 暂存区（Staging Area / Index）**
- `git add`后的文件
- 准备提交的内容

**3. 本地仓库（Local Repository）**
- `git commit`后的文件
- Git版本历史

```
工作区 → git add → 暂存区 → git commit → 本地仓库
```

### HEAD指针是什么？

HEAD是指向当前分支的指针，表示当前工作所在的位置。

```
HEAD → main → commit
```

**HEAD的几种状态**：
- `HEAD`：指向当前分支最新提交
- `HEAD~1`或`HEAD^`：上一个提交
- `HEAD~2`：上两个提交
- `HEAD detached`：分离头指针状态

## 基本操作

### git add和git commit的区别？

| 操作 | 作用 | 区域变化 |
|------|------|---------|
| `git add` | 将文件添加到暂存区 | 工作区 → 暂存区 |
| `git commit` | 将暂存区内容提交到仓库 | 暂存区 → 本地仓库 |

```bash
# 添加单个文件
git add file.js

# 添加所有修改
git add .
git add -A

# 提交
git commit -m "feat: 添加新功能"
```

### git pull和git fetch的区别？

| 操作 | 作用 | 是否合并 |
|------|------|---------|
| `git fetch` | 获取远程更新 | ❌ 不合并 |
| `git pull` | 获取并合并 | ✅ 自动合并 |

```bash
# 等价于
git pull
# =
git fetch
git merge
```

### git merge和git rebase的区别？

| 特性 | merge | rebase |
|------|-------|--------|
| 历史记录 | 保留所有历史 | 线性历史 |
| 冲突处理 | 一次性解决 | 逐个解决 |
| 适用场景 | 保留分支历史 | 保持整洁 |
| 安全性 | 安全 | 可能重写历史 |

```bash
# merge - 保留分支历史
git merge feature-branch

# rebase - 线性历史
git rebase main
```

## 撤销与回退

### 如何撤销工作区的修改？

```bash
# 撤销单个文件的修改
git restore file.js

# 撤销所有工作区的修改
git restore .

# 旧版本命令（仍然可用）
git checkout -- file.js
```

### 如何撤销暂存区的修改？

```bash
# 从暂存区移除，保留工作区
git restore --staged file.js

# 旧版本命令
git reset HEAD file.js
```

### 如何撤销已提交的修改？

```bash
# 撤销最后一次提交，保留修改
git reset --soft HEAD~1

# 撤销最后一次提交，清空暂存区
git reset --mixed HEAD~1
git reset HEAD~1  # 默认

# 撤销最后一次提交，丢弃修改
git reset --hard HEAD~1

# 撤销多次提交
git reset --hard HEAD~3
```

### git revert和git reset的区别？

| 特性 | revert | reset |
|------|--------|-------|
| 历史记录 | 创建新提交 | 删除提交 |
| 安全性 | 安全，可逆 | 危险，已删除无法恢复 |
| 远程分支 | 可推送到远程 | 不能推送到已共享的远程 |
| 使用场景 | 公开分支 | 私有分支或本地修复 |

```bash
# revert - 创建新提交撤销旧提交
git revert abc123

# reset - 删除提交
git reset --hard abc123
```

## 查看与比较

### git log的使用？

```bash
# 查看提交历史
git log

# 简洁显示
git log --oneline

# 图形化显示
git log --graph --oneline --all

# 查看最近N条
git log -5

# 查看某文件的历史
git log -- file.js

# 查看某文件的详细修改
git log -p file.js

# 查看某次提交的详细内容
git show abc123
```

### git diff的使用？

```bash
# 工作区 vs 暂存区
git diff
git diff file.js

# 暂存区 vs 本地仓库
git diff --staged
git diff --cached

# 工作区 vs 本地仓库
git diff HEAD

# 比较两个提交
git diff abc123 def456

# 比较两个分支
git diff main feature
```

## 远程操作

### git remote的用法？

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin https://github.com/user/repo.git

# 删除远程仓库
git remote remove origin

# 修改远程仓库URL
git remote set-url origin https://github.com/user/new-repo.git
```

### git push的用法？

```bash
# 推送到远程
git push origin main

# 推送所有分支
git push --all origin

# 推送标签
git push --tags

# 强制推送（危险）
git push -f origin main

# 推送并设置上游分支
git push -u origin main
```

### 如何删除远程分支？

```bash
# 删除远程分支
git push origin --delete feature-branch

# 或
git push origin :feature-branch
```

## 其他常用命令

### git stash的使用？

```bash
# 暂存当前工作
git stash

# 暂存并添加说明
git stash save "message"

# 查看暂存列表
git stash list

# 恢复最近一次暂存
git stash pop

# 恢复指定暂存
git stash apply stash@{1}

# 删除暂存
git stash drop stash@{0}

# 清空所有暂存
git stash clear
```

### git clean的用法？

```bash
# 查看要删除的文件
git clean -n

# 删除未跟踪的文件
git clean -f

# 删除未跟踪的文件和目录
git clean -fd

# 删除忽略的文件
git clean -fx
```

## 实战案例

### 修改最后一次提交信息？

```bash
# 修改最后一次提交的message
git commit --amend -m "新的提交信息"

# 不修改message，只添加遗漏的文件
git add forgotten-file.js
git commit --amend --no-edit
```

### 提交到错误的分支如何修复？

```bash
# 方案1：使用cherry-pick
git checkout correct-branch
git cherry-pick wrong-branch
git branch -f wrong-branch wrong-branch~1

# 方案2：使用rebase（interactive）
git rebase -i HEAD~2
# 将pick改为edit，修改后continue
```

### 如何找回丢失的提交？

```bash
# 查看所有操作记录
git reflog

# 恢复丢失的提交
git reset --hard abc123

# 或创建新分支指向丢失的提交
git branch recovery abc123
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
