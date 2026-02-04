# 第2章：Git常用命令

## 2.1 查看状态 - git status

**什么时候用**：想看看"现在发生了什么"的时候

**作用**：就像问 Git"当前什么情况？"

```bash
git status
```

**输出示例**：
```bash
$ git status
On branch main                      # 当前在 main 分支
Changes not staged for commit:      # 有修改但还没提交
  modified:   README.md            # README.md 被改了
  new file:   hello.txt            # 新增了 hello.txt

Untracked files:                    # Git 还没跟踪的文件
  temp.log                          # 比如：临时日志文件
```

**状态说明（用购物车比喻）**：

| 状态 | 意思 | 比喻 |
|------|------|------|
| `Untracked` | 新文件，Git 还没跟踪 | 你拿了一件新商品，还没放进购物车 |
| `Modified` | 已修改，还没添加到暂存区 | 你把购物车的商品拿出来看了 |
| `Staged` | 已添加到暂存区 | 商品放进购物车了，准备结账 |

**建议**：
- 每次操作前先 `git status` 看一眼
- 就像出门前照镜子，确认状态

---

## 2.2 添加文件 - git add

**什么时候用**：修改了文件，想让 Git 记录这些修改

**作用**：把文件放到"待提交区"

```bash
# 添加指定文件
git add README.md

# 添加所有修改的文件（最常用）
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
│(草稿纸) │        │(讲台)   │
└─────────┘        └─────────┘

你在草稿纸上     放到讲台上准备上交
写的作业
```

**为什么要分两步（add + commit）？**

就像写作业：
- **工作区**：草稿纸（随便改，改错了扔掉）
- **git add**：挑出觉得对的放到一边
- **git commit**：最后才上交

这样可以**选择性提交**，不想提交的修改就不 add。

**实际场景**：
```bash
# 场景：你改了3个文件，但只想提交其中2个
vim index.html        # 修改了
vim style.css         # 修改了
vim test.js           # 修改了（但这个还没写完，不想提交）

git add index.html style.css    # 只添加前两个
git commit -m "优化首页样式"    # 提交
# test.js 的修改还在工作区，不影响
```

---

## 2.3 提交更改 - git commit

**什么时候用**：想"保存当前进度"的时候

**作用**：给项目拍一张照片（快照）

```bash
# 基本提交
git commit -m "添加用户登录功能"

# 添加并提交（只适用于已跟踪的文件）
git commit -am "修复登录bug"

# 修改最后一次提交信息（比如写错了）
git commit --amend -m "正确的信息"

# 查看提交详情
git show
```

**为什么必须写提交信息？**

想象你给照片写说明：
- ❌ "照片" - 不知道拍了什么
- ✅ "2024春节全家福" - 一目了然

**提交信息规范**：

```bash
# ✅ 好的提交信息（清楚说明改了什么）
git commit -m "添加用户登录功能"
git commit -m "修复导航栏在手机端的显示bug"
git commit -m "更新README：添加安装说明"

# ❌ 不好的提交信息（看了不知道干了啥）
git commit -m "修改"
git commit -m "update"
git commit -m "fix bug"
git commit -m "完成"
```

**推荐的提交格式**：
```
类型(范围): 简短描述

详细说明（可选）

关联的Issue（可选）
```

```bash
# 实际例子
git commit -m "feat(用户): 添加登录功能

实现用户名密码登录
添加记住密码功能
关联 Issue #123"
```

---

## 2.4 查看日志 - git log

**什么时候用**：想看看"过去发生了什么"

**作用**：查看历史提交记录

```bash
# 查看完整日志
git log

# 查看简洁日志（最常用）
git log --oneline

# 查看最近5条
git log --oneline -5

# 查看图形化分支（很好用！）
git log --graph --oneline

# 查看某个文件的修改历史
git log README.md

# 查看某个作者的提交
git log --author="张三"
```

**输出示例**：
```bash
$ git log --oneline
a1b2c3d 2024-01-15 添加Git教程章节
d4e5f6g 2024-01-14 修复配置文件错误
h7i8j9k 2024-01-13 更新首页样式
         ^^^^ ^^^^ ^^^^
         提交ID 日期  描述
```

**提示**：
- 按 `q` 退出日志查看
- 按 `上下键` 滚动查看
- 提交ID（像 a1b2c3d）可以用来回到那个版本

---

## 2.5 查看差异 - git diff

**什么时候用**：想知道"到底改了什么"

**作用**：对比文件修改前后的差异

```bash
# 查看工作区和暂存区的差异
# 意思：看看改了什么但还没 add
git diff

# 查看暂存区和上次提交的差异
# 意思：看看 add 了但还没 commit 的内容
git diff --staged

# 查看两个提交之间的差异
git diff 提交ID1 提交ID2

# 查看指定文件的差异
git diff README.md
```

**输出示例**：
```bash
$ git diff README.md
diff --git a/README.md b/README.md
# 旧版本         新版本
index 1234567..abcdefg 100644
--- a/README.md    # 减号表示删除的
+++ b/README.md    # 加号表示新增的
@@ -1,3 +1,4 @@
 # 我的项目
+新增的一行文字   # 这行是新增的

 欢迎使用Git
-要删除的内容     # 这行会被删除
```

**颜色说明**：
- 红色（-）：删除的内容
- 绿色（+）：新增的内容

**提示**：
- 按 `q` 退出
- 只想看改了哪些文件？用 `git diff --name-only`

---

## 2.6 撤销修改 - git restore

**什么时候用**：改错了，想恢复

**作用**：撤销工作区的修改

```bash
# 恢复指定文件（回到上次提交的状态）
git restore README.md

# 恢复所有文件
git restore .

# 从暂存区移除（不删除文件，只是不提交了）
git restore --staged README.md
```

**实际场景**：

```bash
# 场景1：改错了，想重来
vim index.html        # 改代码
git status            # 看看修改了啥
# 哎呀，改得乱七八糟，想恢复
git restore index.html
# ✅ 文件回到了上次提交的状态

# 场景2：add 错文件了
git add test.js       # 不小心把这个加进去了
# 哎呀，这个还没写完，不想提交
git restore --staged test.js
# ✅ 从暂存区移除了，但文件还在
```

**警告**：
- `git restore` 会**丢弃你的修改**
- 就像"撤销键"，按了就回不去了
- 用之前先确定真的不要这些修改了

---

## 2.7 回退提交 - git reset

**什么时候用**：提交错了，想回退

**作用**：撤销已经提交的内容

```bash
# 撤销最后一次提交（保留修改）
git reset --soft HEAD~1
# 意思：撤销提交，但修改的文件还在，可以继续编辑

# 撤销最后一次提交（丢弃修改）
git reset --hard HEAD~1
# 意思：完全回到上次提交，所有改动都没了

# 回退到指定提交
git reset --hard abc1234
```

**三种模式对比**：

| 模式 | 工作区 | 暂存区 | 仓库 | 什么时候用 |
|------|--------|--------|------|-----------|
| `--soft` | 保留 | 保留 | 撤销 | 想修改提交信息 |
| `--mixed` | 保留 | 清空 | 撤销 | 想重新选择要提交的文件 |
| `--hard` | 清空 | 清空 | 撤销 | 彻底回退（危险！） |

**实际例子**：

```bash
# 场景1：提交信息写错了
git commit -m "添加登录功能"
# 哎呀，应该是"添加注册功能"
git reset --soft HEAD~1     # 撤销提交
git commit -m "添加注册功能" # 重新提交

# 场景2：提交了不该提交的东西
git add .
git commit -m "临时保存"
# 发现有个密码文件也提交了！
git reset --hard HEAD~1     # 回退，删除密码文件
# ✅ 危机解除

# ⚠️ 注意：如果已经 push 到远程，不要用 reset！
# 应该用 git revert（后面会讲）
```

---

## 2.8 分支操作

### 查看分支

```bash
# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 查看远程分支
git branch -r
```

### 创建分支

```bash
# 创建分支（不切换）
git branch dev

# 创建并切换到新分支（常用）
git checkout -b feature-login

# 基于指定提交创建分支
git checkout -b hotfix abc1234
```

**分支比喻**：
```
main (主线)
  ├── dev (开发分支)
  └── feature-login (功能分支)

就像：
main 游戏主线剧情
  ├── dev 开发测试
  └── feature-login 练习登录功能
```

### 切换分支

```bash
# 切换到已存在的分支
git checkout dev

# 切换到上一个分支
git checkout -
```

**提示**：切换分支前，确保工作区是干净的（`git status` 检查）

### 删除分支

```bash
# 删除已合并的分支
git branch -d feature-login

# 强制删除未合并的分支
git branch -D feature-login

# 删除远程分支
git push origin --delete feature-login
```

---

## 2.9 合并分支 - git merge

**什么时候用**：想把其他分支的修改合并过来

**作用**：把分支B的改动合并到当前分支

```bash
# 切换到 main 分支
git checkout main

# 合并 dev 分支
git merge dev
```

**合并类型**：

**1. 快进合并** (Fast-forward)
```
A --- B (dev)
     ↓
A --- B (main)

就像：main 直接追上 dev
```

**2. 普通合并** (三方合并)
```
A --- B (main)  \
       --------> C (合并后产生新提交)
A --- C (dev)   /

就像：main 和 dev 都修改了，需要合并成新版本
```

**实际场景**：

```bash
# 场景：功能开发完了，要合并到主分支
git checkout main        # 切到主分支
git pull origin main     # 先拉取最新代码
git merge feature-login  # 合并功能分支
git push origin main     # 推送到远程
```

---

## 2.10 拉取和推送

### 拉取远程更新 - git pull

**什么时候用**：别人更新了代码，你想同步

**作用**：从远程仓库拉取最新代码并合并

```bash
# 拉取并合并（常用）
git pull origin main

# 等同于
git fetch origin main    # 先拉取
git merge origin/main    # 再合并
```

**实际场景**：
```bash
# 场景：多人协作
# 你和同事都在开发
# 同事先推送了代码

git pull origin main     # 你先拉取他的代码
# ... 解决可能的冲突 ...
git push origin main     # 再推送你的代码
```

### 推送到远程 - git push

**什么时候用**：想把本地代码上传到 GitHub

**作用**：把本地提交推送到远程仓库

```bash
# 推送到指定分支
git push origin main

# 推送并建立追踪关系（第一次推送时用）
git push -u origin main

# 推送所有分支
git push --all

# 强制推送（危险！会覆盖远程代码）
git push --force
```

**⚠️ 警告**：
- `git push --force` 会**覆盖远程代码**
- 只有在你确定要覆盖时才用
- 否则可能导致同事的代码丢失

---

## 2.11 远程仓库操作

### 查看远程仓库

```bash
# 查看远程仓库列表
git remote

# 查看详细信息（包括地址）
git remote -v

# 查看某个远程仓库的详细信息
git remote show origin
```

**输出示例**：
```bash
$ git remote -v
origin  https://github.com/SimonX0/simonProjectGuide.git (fetch)
origin  https://github.com/SimonX0/simonProjectGuide.git (push)
```

### 添加/修改远程仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/用户名/项目名.git

# 修改远程仓库地址
git remote set-url origin 新地址

# 删除远程仓库
git remote remove origin
```

---

## 2.12 查看历史提交 - git show

**什么时候用**：想看某个提交的详细信息

**作用**：查看某次提交改了什么

```bash
# 查看最近一次提交
git show

# 查看指定提交
git show abc1234

# 查看某个文件的某次提交
git show abc1234:path/to/file
```

**输出示例**：
```bash
$ git show
commit abc1234...
Author: 张三 <zhangsan@gmail.com>
Date:   2024-01-15

    添加用户登录功能

diff --git a/login.js b/login.js
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/login.js
@@ -0,0 +1,10 @@
+// 登录功能代码
+...
```

---

## 常用命令速查表

| 命令 | 作用 | 使用频率 |
|------|------|----------|
| `git status` | 查看状态 | ⭐⭐⭐⭐⭐ |
| `git add .` | 添加所有修改 | ⭐⭐⭐⭐⭐ |
| `git commit -m "xxx"` | 提交 | ⭐⭐⭐⭐⭐ |
| `git log --oneline` | 查看日志 | ⭐⭐⭐⭐ |
| `git push` | 推送到远程 | ⭐⭐⭐⭐ |
| `git pull` | 拉取远程更新 | ⭐⭐⭐⭐ |
| `git branch` | 查看分支 | ⭐⭐⭐ |
| `git checkout -b xxx` | 创建并切换分支 | ⭐⭐⭐ |
| `git merge xxx` | 合并分支 | ⭐⭐⭐ |
| `git diff` | 查看差异 | ⭐⭐⭐ |
| `git restore file` | 撤销修改 | ⭐⭐ |
| `git reset` | 回退提交 | ⭐⭐ |

---

## 下一步

掌握了基本命令，让我们学习更高级的[分支管理 →](chapter-03)

**提示**：
- 不需要背命令，多用就记住了
- 遇到忘了的命令，随时回来查
- 实践是最好的学习方式
