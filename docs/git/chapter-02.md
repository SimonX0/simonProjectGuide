# 第2章：Git常用命令

## 2.1 查看状态 - git status

**作用**: 查看当前工作区的状态

```bash
git status
```

**输出示例**：
```
On branch main
Changes not staged for commit:
  modified:   README.md
  new file:   hello.txt
```

**状态说明**：
- `Untracked`: 新文件，Git 还没追踪
- `Modified`: 已修改，还没添加到暂存区
- `Staged`: 已添加到暂存区，等待提交

---

## 2.2 添加文件 - git add

**作用**: 将文件添加到暂存区

```bash
# 添加指定文件
git add README.md

# 添加所有修改的文件
git add .

# 添加所有 .txt 文件
git add *.txt

# 添加某个文件夹
git add src/
```

**图示**：
```
工作区              暂存区
┌─────────┐        ┌─────────┐
│file.txt │ ──add──>│file.txt │
└─────────┘        └─────────┘
```

---

## 2.3 提交更改 - git commit

**作用**: 将暂存区的更改提交到本地仓库

```bash
# 基本提交
git commit -m "描述信息"

# 添加并提交（跳过 git add）
git commit -am "描述信息"

# 修改最后一次提交信息
git commit --amend

# 查看提交详情
git show
```

**提交信息规范**：
```bash
# ✅ 好的提交信息
git commit -m "添加用户登录功能"
git commit -m "修复导航栏显示bug"
git commit -m "更新README文档"

# ❌ 不好的提交信息
git commit -m "修改"
git commit -m "update"
git commit -m "fix bug"
```

---

## 2.4 查看日志 - git log

**作用**: 查看提交历史

```bash
# 查看完整日志
git log

# 查看简洁日志（单行显示）
git log --oneline

# 查看最近5条
git log --oneline -5

# 查看图形化分支
git log --graph --oneline

# 查看某文件的修改历史
git log README.md
```

**输出示例**：
```
$ git log --oneline
a1b2c3d 添加Git教程章节
d4e5f6g 修复配置文件
h7i8j9k 更新文档
```

---

## 2.5 查看差异 - git diff

**作用**: 查看文件的具体修改内容

```bash
# 查看工作区和暂存区的差异
git diff

# 查看暂存区和上次提交的差异
git diff --staged

# 查看两个提交之间的差异
git diff commit1 commit2

# 查看指定文件的差异
git diff README.md
```

**输出示例**：
```
diff --git a/README.md b/README.md
index 1234567..abcdefg 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
 # 我的项目
+新增一行文字

 欢迎使用Git
```

---

## 2.6 分支操作

### 创建和切换分支

```bash
# 查看所有分支
git branch

# 创建新分支
git branch dev

# 切换分支
git checkout dev

# 创建并切换到新分支
git checkout -b feature-login

# 删除本地分支
git branch -d feature-login

# 强制删除分支
git branch -D feature-login
```

### 重命名分支

```bash
# 重命名当前分支
git branch -m 新分支名

# 重命名指定分支
git branch -m 旧分支名 新分支名
```

---

## 2.7 合并分支 - git merge

**作用**: 将其他分支的修改合并到当前分支

```bash
# 切换到 main 分支
git checkout main

# 合并 dev 分支
git merge dev
```

**合并类型**：

1. **快进合并** (Fast-forward)
```
A --- B (dev)
     ↓
A --- B (main)
```

2. **普通合并** (三路合并)
```
A --- B (main)  \
       --------> C (合并后)
A --- C (dev)   /
```

---

## 2.8 拉取和推送

### 拉取远程更新 - git pull

```bash
# 拉取并合并远程代码
git pull origin main

# 等同于
git fetch origin main
git merge origin/main
```

### 推送到远程 - git push

```bash
# 推送到指定分支
git push origin main

# 推送所有分支
git push --all

# 推送并建立追踪关系
git push -u origin main

# 强制推送（危险！会覆盖远程代码）
git push --force
```

---

## 2.9 撤销操作

### 撤销工作区修改

```bash
# 恢复指定文件到最后一次提交的状态
git restore README.md

# 恢复所有文件
git restore .
```

### 撤销暂存区

```bash
# 从暂存区移除（保留工作区修改）
git restore --staged README.md
```

### 撤销提交

```bash
# 撤销最后一次提交（保留修改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃修改）
git reset --hard HEAD~1

# 回退到指定提交
git reset --hard abc1234
```

### 恢复已删除的提交

```bash
# 找到已删除的提交ID
git reflog

# 恢复到那个提交
git reset --hard abc1234
```

---

## 2.10 远程仓库操作

### 查看远程仓库

```bash
# 查看远程仓库列表
git remote

# 查看详细信息
git remote -v

# 查看远程仓库信息
git remote show origin
```

### 添加远程仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/用户名/项目名.git

# 修改远程仓库地址
git remote set-url origin 新地址

# 删除远程仓库
git remote remove origin
```

---

## 2.11 查看文件内容

```bash
# 查看文件内容
git cat-file -p HEAD:README.md

# 查看某个版本的文件
git show 提交ID:文件名
```

---

## 2.12 标签管理

```bash
# 创建标签
git tag v1.0.0

# 查看所有标签
git tag

# 推送标签到远程
git push origin v1.0.0

# 推送所有标签
git push --tags

# 删除标签
git tag -d v1.0.0
```

---

## 常用命令速查表

| 命令 | 作用 |
|------|------|
| `git status` | 查看状态 |
| `git add .` | 添加所有修改 |
| `git commit -m "xxx"` | 提交 |
| `git log --oneline` | 查看日志 |
| `git branch` | 查看分支 |
| `git checkout -b xxx` | 创建并切换分支 |
| `git merge xxx` | 合并分支 |
| `git pull` | 拉取远程更新 |
| `git push` | 推送到远程 |
| `git diff` | 查看差异 |
| `git restore file` | 撤销修改 |

---

## 下一步

现在你已经掌握了 Git 的常用命令，让我们学习[分支管理 →](chapter-03)
