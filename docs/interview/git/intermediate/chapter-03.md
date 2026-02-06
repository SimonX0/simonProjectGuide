---
title: Git高级操作面试题
---

# Git高级操作面试题

## Git Reset

### git reset的三种模式？

```bash
# --soft: 只移动HEAD，保留暂存和工作区
git reset --soft HEAD~1
# 提交回退到暂存区，可以重新提交

# --mixed (默认): 移动HEAD，清除暂存，保留工作区
git reset --mixed HEAD~1
# 等同于 git reset HEAD~1
# 提交回到工作区，需要重新add

# --hard: 移动HEAD，清除暂存和工作区
git reset --hard HEAD~1
# ⚠️ 危险！会丢失所有更改
```

**示例场景**：

```bash
# 场景1: 修改最后一次提交消息
git reset --soft HEAD~1
git commit -m "新的提交消息"

# 场景2: 忘记添加文件到上一次提交
git reset --soft HEAD~1
git add forgotten-file.js
git commit -m "添加遗漏的文件"

# 场景3: 完全放弃最近的提交
git reset --hard HEAD~1
# ⚠️ 无法恢复！
```

### git reset vs git revert？

| 操作 | reset | revert |
|------|-------|--------|
| 历史修改 | 改写历史 | 创建新提交 |
| 安全性 | 危险（丢失提交） | 安全（保留历史） |
| 已推送分支 | ❌ 不推荐 | ✅ 推荐 |
| 远程影响 | 需要force push | 正常push |

**reset示例**：
```bash
# 只用于未推送的本地提交
git reset --hard HEAD~1
git push --force  # ⚠️ 危险
```

**revert示例**：
```bash
# 安全地撤销提交
git revert HEAD
# 创建新提交，内容是撤销HEAD的更改
git push  # 正常推送
```

## Git Rebase

### 什么是变基（Rebase）？

Rebase将一系列提交移植到另一个基础提交上。

```bash
# 场景：将feature分支变基到main
git checkout feature
git rebase main

# 结果：feature的提交被"重新播放"在main的最新提交之后

# 变基前：
# A---B---C  (main)
#      \
#       D---E  (feature)

# 变基后：
# A---B---C  (main)
#          \
#           D'---E'  (feature)
```

### 交互式变基？

```bash
# 编辑最近5个提交
git rebase -i HEAD~5

# 或变基到某个提交
git rebase -i abc1234

# 编辑器中的操作：
pick 1a2b3c Commit 1
reword 4d5e6f Commit 2  # 修改提交消息
edit 7g8h9i Commit 3    # 停下来修改
squash 2b3c4d Commit 4  # 合并到上一个
fixup 5c6d7e Commit 5   # 合并（丢弃消息）
drop 8d9e0f Commit 6    # 删除提交

# 保存后执行：
# - reword: 会打开编辑器修改消息
# - edit: 会停在此提交，可以修改文件后 git add . && git rebase --continue
# - squash/fixup: 会打开编辑器编辑合并后的消息
```

**实用场景**：

```bash
# 1. 压缩多个提交为一个
git rebase -i HEAD~3
# 将后两个的 pick 改为 squash

# 2. 删除不需要的提交
git rebase -i HEAD~5
# 将对应的 pick 改为 drop

# 3. 重新排序提交
git rebase -i HEAD~3
# 调整行的顺序

# 4. 修改旧提交
git rebase -i <commit-hash>~1
# 找到对应提交，改为 edit
# 修改文件后：git add . && git rebase --continue
```

### 变基冲突处理？

```bash
# 1. 开始变基
git rebase main

# 2. 如果遇到冲突：
# Auto-merging file.js
# CONFLICT (content): Merge conflict in file.js
# error: could not apply abc1234...

# 3. 解决冲突
# 编辑冲突文件

# 4. 继续变基
git add file.js
git rebase --continue

# 5. 如果想放弃
git rebase --abort

# 6. 跳过当前提交
git rebase --skip
```

## Git Cherry-pick

### 如何挑选特定提交？

```bash
# 1. 将指定提交应用到当前分支
git cherry-pick abc1234

# 2. 挑选多个提交
git cherry-pick abc1234 def5678

# 3. 挑选范围（不包括起点）
git cherry-pick abc1234^..def5678

# 4. 只应用更改不创建提交
git cherry-pick -n abc1234
# 等同于 --no-commit

# 5. 挑选但保留原提交信息
git cherry-pick -x abc1234
```

**实用场景**：

```bash
# 场景1: 将热修复从main移到feature
git checkout feature
git cherry-pick hotfix-commit

# 场景2: 从feature挑选特定提交到main
git checkout main
git cherry-pick feature-commit

# 场景3: 回退特定提交（revert的替代）
git checkout main
git cherry-pick -n abc1234~1  # 获取父提交
git reset --hard  # 清除更改
```

### cherry-pick冲突处理？

```bash
git cherry-pick abc1234

# 如果冲突：
# 1. 解决冲突
vim conflicted-file.js

# 2. 标记为已解决
git add conflicted-file.js

# 3. 继续挑选
git cherry-pick --continue

# 4. 或跳过
git cherry-pick --skip

# 5. 或放弃
git cherry-pick --abort
```

## Git Stash

### 如何使用stash临时保存？

```bash
# 1. 保存当前工作
git stash
# 或 git stash save "message"

# 2. 查看stash列表
git stash list
# stash@{0}: On main: Add feature
# stash@{1}: On main: Fix bug

# 3. 应用最近的stash（不删除）
git stash apply

# 4. 应用并删除stash
git stash pop

# 5. 应用指定stash
git stash apply stash@{1}

# 6. 删除stash
git stash drop stash@{1}

# 7. 清空所有stash
git stash clear
```

### stash高级用法？

```bash
# 1. 只stash特定文件
git stash push -m "message" file1.js file2.js

# 2. stash未跟踪的文件
git stash -u
# 或 git stash --include-untracked

# 3. stash所有文件（包括忽略的）
git stash -a
# 或 git stash --all

# 4. 从stash创建分支
git stash branch new-branch stash@{0}

# 5. 查看stash内容
git stash show stash@{0}
git stash show -p stash@{0}  # 显示详细差异

# 6. 应用部分stash
git checkout stash@{0} -- file.js
```

**实用场景**：

```bash
# 场景1: 紧急切换分支
git stash
git checkout other-branch
# 做其他工作...
git checkout -
git stash pop

# 场景2: 保留多个工作上下文
git stash save "工作A"
# 做工作B...
git stash save "工作B"
# 切换到工作A
git stash apply stash@{1}
```

## Git Reflog

### 什么是reflog？

Reflog记录Git的所有操作，用于恢复丢失的提交。

```bash
# 1. 查看reflog
git reflog
# 1a2b3c HEAD@{0}: commit: Add feature
# 4d5e6f HEAD@{1}: commit: Fix bug
# 7g8h9i HEAD@{2}: reset: moving to HEAD~1

# 2. 查看特定分支的reflog
git reflog show main

# 3. 恢复丢失的提交
git reset --hard 1a2b3c

# 4. 查看特定时间范围的reflog
git reflog --since="2 days ago"
git reflog --until="yesterday"
```

**实用场景**：

```bash
# 场景1: 误删分支后恢复
git branch -D feature-branch
# 发现删错了...
git reflog
# 找到feature-branch的commit: 1a2b3c
git checkout -b feature-branch 1a2b3c

# 场景2: reset --hard后后悔
git reset --hard HEAD~5
# 发现删错了...
git reflog
# 找到之前的HEAD位置: abc1234
git reset --hard abc1234

# 场景3: 找回未保存的工作
git checkout -
# 工作区清空了...
git reflog
# 找到之前的commit
git checkout -b temp lost-commit
# 复制需要的文件
```

## Git Clean

### 如何清理未跟踪文件？

```bash
# 1. 查看要删除的文件（不实际删除）
git clean -n
# 或 git clean --dry-run

# 2. 删除未跟踪的文件
git clean -f

# 3. 删除未跟踪的文件和目录
git clean -f -d
# 或 git clean -fd

# 4. 删除忽略的文件
git clean -f -X

# 5. 删除所有未跟踪文件（包括忽略的）
git clean -f -x
# 或 git clean -fx

# 6. 交互式清理
git clean -i
# 会询问是否删除每个文件
```

**实用场景**：

```bash
# 场景1: 清理构建产物
git clean -fd
# 删除node_modules, dist等

# 场景2: 回到干净的仓库状态
git reset --hard HEAD
git clean -fdx
# 恢复到最后一次提交，删除所有未跟踪文件

# 场景3: 清理特定目录
git clean -fd path/to/dir
```

## Git Bisect

### 如何使用二分查找bug？

```bash
# 1. 开始二分查找
git bisect start

# 2. 标记当前提交为有bug
git bisect bad

# 3. 标记已知好的提交
git bisect good abc1234

# Git会切换到中间的提交

# 4. 测试当前版本
# 如果有bug：
git bisect bad

# 如果没问题：
git bisect good

# 5. 重复步骤4，直到找到第一个有问题的提交
# Bisecting: 0 revisions left to test after this

# 6. 查看结果
git bisect reset
# 回到原始分支
```

**自动化bisect**：

```bash
# 创建测试脚本
cat > test.sh << 'EOF'
#!/bin/bash
npm test
EOF

chmod +x test.sh

# 运行自动bisect
git bisect start
git bisect bad HEAD
git bisect good abc1234
git bisect run ./test.sh
```

## Git Filter-branch

### 如何删除敏感信息？

```bash
# ⚠️ 谨慎使用！会重写历史

# 1. 从历史中删除文件
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch password.txt' \
  --prune-empty --tag-name-filter cat -- --all

# 2. 从历史中删除文件夹
git filter-branch --force --index-filter \
  'git rm -rf --cached --ignore-unmatch secrets/' \
  --prune-empty --tag-name-filter cat -- --all

# 3. 清理和回收空间
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. 强制推送（⚠️ 影响所有人）
git push origin --force --all
git push origin --force --tags
```

**替代方案**（推荐）：

```bash
# 使用BFG Repo-Cleaner（更快更安全）
# 下载: https://rtyley.github.io/bfg-repo-cleaner/

# 删除大文件
bfg --strip-blobs-bigger-than 100M

# 删除特定文件
bfg --delete-files password.txt

# 清理
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## Git Attributes

### .gitattributes的作用？

```bash
# .gitattributes 文件示例

# 1. 指定换行符处理
* text=auto
*.sh text eol=lf
*.bat text eol=crlf

# 2. 指定差异算法
*.json diff=json
*.xlsx binary

# 3. 指定合并策略
# ours: 优先使用当前分支
# theirs: 优先使用传入分支
# union: 保留所有内容
package-lock.json merge=ours

# 4. LFS配置
*.psd filter=lfs diff=lfs merge=lfs -text
*.ai filter=lfs diff=lfs merge=lfs -text

# 5. 导出忽略（某些文件不打包）
.gitexport-ignore
.env.local export-ignore

# 6. 语言设置
*.cs linguist-language=C#
*.js linguist-language=JavaScript-Runtime
```

**实用场景**：

```bash
# 场景1: 强制LF换行（推荐用于项目）
git config core.autocrlf input  # Linux/Mac
# .gitattributes: * text=auto

# 场景2: Windows项目强制CRLF
git config core.autocrlf true
# .gitattributes: * text=auto eol=crlf

# 场景3: 永远使用当前分支的特定文件
echo "package-lock.json merge=ours" >> .gitattributes
git add .gitattributes
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
