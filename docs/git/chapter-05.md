# 第5章：Git实战技巧

## 5.1 版本发布 - 打标签

### 什么是标签？

想象一下：
- **提交 ID**：`a1b2c3d4` - 像是一串随机密码，不好记
- **标签**：`v1.0.0` - 像"第1版"，简单明了

标签就是给某个重要版本起个好听的名字！

### 什么时候打标签？

```bash
✅ 适合打标签的时刻：
- 发布第1版 → v1.0.0
- 修复重大bug → v1.0.1
- 添加新功能 → v2.0.0
- 重大更新 → v3.0.0

❌ 不需要打标签：
- 每次小修改
- 测试中的版本
- 临时调试版本
```

### 如何打标签？

```bash
# 1. 查看当前有哪些标签
git tag

# 2. 给最新提交打标签
git tag v1.0.0

# 3. 给指定提交打标签
# 先找到提交ID
git log --oneline
# 输出：a1b2c3d 修复登录bug
git tag v1.0.1 a1b2c3d

# 4. 带说明的标签（推荐）
git tag -a v2.0.0 -m "正式发布第2版，添加用户注册功能"

# 5. 查看标签详情
git show v1.0.0
```

### 推送标签到 GitHub

```bash
# 推送单个标签
git push origin v1.0.0

# 推送所有标签
git push --tags

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0
# 或者
git push origin :refs/tags/v1.0.0
```

### 标签命名规范

```
格式：v主版本.次版本.修订号

v1.0.0  → 第1版正式发布
v1.0.1  → 修复bug
v1.1.0  → 添加小功能
v2.0.0  → 重大更新，不兼容旧版本
```

**举个例子**：

```
开发过程：
v1.0.0  → 第1版发布
  ↓ 发现bug
v1.0.1  → 修复bug
v1.0.2  → 又修复了bug
  ↓ 添加新功能
v1.1.0  → 第2个小版本
  ↓ 重构大量代码
v2.0.0  → 第2个大版本
```

---

## 5.2 自动关闭 Issue - 提交信息里的魔法词

### 什么是 Issue？

**Issue** = 问题清单
- bug 反馈
- 功能建议
- 待办事项

GitHub 上每个 Issue 都有一个编号，比如 `#123`

### 魔法关键词：fixes / closes

在提交信息里加上这些词，会**自动关闭对应的 Issue**！

```bash
# 格式
git commit -m "类型: 描述信息

fixes #123"
# 或
git commit -m "类型: 描述信息

closes #123"
```

**举例**：

```bash
# GitHub Issue #42: 用户反馈登录按钮点不了

# 你修复后，这样提交：
git commit -m "fix: 修复登录按钮无响应问题

fixes #42"

# 推送到 GitHub 后，Issue #42 自动关闭！✅
```

### 更多魔法词

```bash
# 关闭 Issue
fixes #123      # 修复（最常用）
closes #123     # 关闭
resolves #123   # 解决

# 只是引用（不关闭）
related to #123    # 相关
ref #123           # 引用
```

**实际例子**：

```bash
# 场景1：完全修复了 Issue
git commit -m "fix: 修复支付页面崩溃

fixes #156"

# 场景2：部分修复，还没完全解决
git commit -m "fix: 优化支付流程性能

related to #156"

# 场景3：一次性修复多个 Issue
git commit -m "feat: 添加用户头像上传功能

fixes #78
fixes #89
closes #102"
```

---

## 5.3 实用技巧集合

### 技巧1：保存工作现场

**场景**：正在写功能A，突然需要修bug

```bash
# 1. 保存当前工作（像存档）
git stash save "写了一半的登录功能"

# 2. 切换去修bug
git checkout main
# ... 修bug ...
git commit -m "fix: 修复验证码不显示"

# 3. 回来继续干活（读档）
git checkout dev
git stash pop

# 就像什么都没发生过！
```

### 技巧2：查看"谁改了这行代码"

**场景**：这行代码是谁写的？为什么这么写？

```bash
# 查看文件每一行的修改记录
git blame README.md

# 输出示例：
# a1b2c3d (张三 2024-01-15 10:23:15) 这是标题
# d4e5f6g (李四 2024-01-16 14:32:08) 这是介绍
#          ^^^^ ^^^^ ^^^^^^^^^^^^^^^
#          提交ID 作者    时间
```

### 技巧3：撤销错误操作

```bash
# 情况1：文件改错了，想恢复
git restore 文件名

# 情况2：add 加错了文件
git restore --staged 文件名

# 情况3：commit 信息写错了
git commit --amend -m "正确的信息"

# 情况4：想撤销最近一次提交
git reset --soft HEAD~1    # 保留修改
git reset --hard HEAD~1    # 丢弃修改
```

### 技巧4：查找"什么时候出的问题"

```bash
# 二分查找法：快速定位哪个提交引入了bug

# 1. 开始二分
git bisect start

# 2. 标记当前版本是有bug的
git bisect bad

# 3. 标记已知没bug的版本
git bisect good v1.0.0

# Git 会自动切换到中间版本
# 你测试后告诉它是好是坏
git bisect good  # 或 git bisect bad

# 重复测试，直到找到问题提交
git bisect reset  # 结束
```

---

## 5.4 团队协作必备

### 发起 Pull Request (PR)

**什么是 PR？**
就像写完作业要交给人检查，PR 就是把你的代码发给团队审查。

```bash
# 完整流程：

# 1. 从 main 创建功能分支
git checkout main
git pull origin main
git checkout -b feature/add-login

# 2. 开发功能
# ... 写代码 ...
git add .
git commit -m "feat: 添加登录功能"
git push -u origin feature/add-login

# 3. 在 GitHub 上创建 PR
# 访问：https://github.com/你的用户名/项目/pull/new/feature/add-login
# 填写标题和说明，点击 "Create Pull Request"

# 4. 等待审查
# 团队成员会评论、建议修改

# 5. 修改后再次推送
git add .
git commit -m "fix: 根据建议修改"
git push

# 6. PR 被接受后合并
# 可以删除功能分支
git branch -d feature/add-login
```

### 同步团队最新代码

```bash
# 方法1：merge（推荐新手）
git checkout dev
git pull origin dev
git merge main

# 方法2：rebase（保持历史清晰）
git checkout dev
git rebase main
```

---

## 5.5 常见问题快速解决

### 问题1：推送时提示"落后于远程"

```bash
# 错误信息：
# Your branch is behind 'origin/main' by 2 commits

# 解决方法1：先拉取再推送（推荐）
git pull origin main
git push origin main

# 解决方法2：强制推送（危险！会覆盖别人代码）
git push --force
# ⚠️ 只有你确定要覆盖时才用！
```

### 问题2：合并时出现冲突

```bash
# 1. 尝试合并
git merge dev

# 2. 看到冲突提示
# Auto-merging index.js
# CONFLICT (content): Merge conflict in index.js

# 3. 打开文件，看到冲突标记：
# <<<<<<< HEAD
# var name = "张三";  // 你的代码
# =======
# var name = "李四";  // 别人的代码
# >>>>>>> dev

# 4. 手动选择保留哪个，或合并
var name = "张三和李四";

# 5. 标记已解决
git add index.js

# 6. 完成合并
git commit -m "合并dev分支，解决冲突"
```

### 问题3：提交信息写错了

```bash
# 最近一次提交信息错了
git commit --amend -m "正确的信息"

# ⚠️ 注意：如果已经推送过，不要用这个！
```

### 问题4：添加了不该提交的文件

```bash
# 比如不小心提交了密码文件

# 1. 删除文件
git rm --cached 密码文件.txt

# 2. 添加到 .gitignore
echo "密码文件.txt" >> .gitignore

# 3. 提交修改
git add .gitignore
git commit -m "chore: 移除敏感文件"
```

---

## 5.6 效率提升配置

### 命令别名（偷懒神器）

```bash
# 设置别名
git config --global alias.st status        # git st = git status
git config --global alias.co checkout     # git co dev = git checkout dev
git config --global alias.br branch       # git br = git branch
git config --global alias.cm commit       # git cm = git commit
git config --global alias.lg "log --graph --oneline --all"

# 使用
git st          # 查看状态
git co dev      # 切换分支
git lg          # 查看图形化日志
```

### 更美的日志输出

```bash
# 添加这个别名
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# 使用 git lg 查看超漂亮的日志！
```

---

## 5.7 实战案例

### 案例1：发布新版本

```bash
# 1. 确保在 main 分支
git checkout main
git pull origin main

# 2. 合并 dev
git merge dev

# 3. 打标签
git tag -a v1.0.0 -m "发布第1版"

# 4. 推送代码和标签
git push origin main
git push origin v1.0.0

# 5. 在 GitHub 上创建 Release
# 访问：https://github.com/你的用户名/项目/releases/new
# 选择标签 v1.0.0，填写发布说明
```

### 案例2：紧急修复线上bug

```bash
# 1. 从 main 创建修复分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. 快速修复
# 修改代码...
git add .
git commit -m "fix: 紧急修复支付崩溃问题

fixes #999"

# 3. 推送并测试
git push -u origin hotfix/critical-bug

# 4. 测试通过后合并到 main
git checkout main
git merge hotfix/critical-bug
git tag v1.0.1
git push origin main
git push origin v1.0.1

# 5. 同步到 dev
git checkout dev
git merge hotfix/critical-bug
git push origin dev

# 6. 删除修复分支
git branch -d hotfix/critical-bug
```

### 案例3：功能开发完整流程

```bash
# 1. 创建功能分支
git checkout dev
git pull origin dev
git checkout -b feature/user-avatar

# 2. 开发（多次小提交）
git add .
git commit -m "feat: 添加头像上传组件"

git add .
git commit -m "feat: 添加头像裁剪功能"

git add .
git commit -m "feat: 添加头像预览"

# 3. 推送
git push -u origin feature/user-avatar

# 4. 创建 PR（如果是团队项目）
# 在 GitHub 创建 Pull Request
# 等待 Code Review

# 5. 根据反馈修改
git add .
git commit -m "fix: 根据审查意见优化代码"
git push

# 6. 合并到 dev
git checkout dev
git merge feature/user-avatar
git push origin dev

# 7. 清理
git branch -d feature/user-avatar
```

---

## 5.8 学习资源

### 互动学习

- **Learn Git Branching**: https://learngitbranching.js.org/
  - 游戏化学习 Git
  - 可视化分支操作
  - 强烈推荐！

### 图形界面工具

- **GitHub Desktop**: https://desktop.github.com/
  - 官方工具，简单易用
  - 适合 Windows/Mac 用户

- **Sourcetree**: https://www.sourcetreeapp.com/
  - 功能强大
  - 可视化分支

- **GitKraken**: https://www.gitkraken.com/
  - 界面美观
  - 跨平台

### VSCode 扩展

- **GitLens**: 查看代码作者、提交历史
- **Git Graph**: 可视化分支图
- **GitHub Pull Requests**: 管理 PR

---

## 5.9 高级功能 - Git 必备技能

### 5.9.1 暂存功能 - git stash 详解

**什么是 stash？**

就像游戏的"快速存档"功能：
- 正在开发功能A
- 突然需要紧急修bug
- 把功能A的代码"暂存"起来
- 修完bug再"读取存档"，继续开发

### 基础用法

```bash
# 1. 保存当前工作（像存游戏）
git stash

# 2. 带说明的保存（推荐）
git stash save "写了一半的登录功能"

# 3. 查看所有存档
git stash list

# 输出示例：
# stash@{0}: On main: 写了一半的登录功能
# stash@{1}: On dev: 临时测试代码
# stash@{2}: On main: 修复支付bug的尝试

# 4. 恢复最近的存档（并删除存档）
git stash pop

# 5. 恢复指定的存档
git stash pop stash@{1}

# 6. 恢复存档（但不删除存档）
git stash apply

# 7. 删除存档
git stash drop stash@{1}

# 8. 清空所有存档
git stash clear
```

### 实战场景

**场景1：正在开发，突然需要修bug**

```bash
# 当前状态：正在开发登录功能，但代码写了一半
git status
# modified: login.js
# modified: login.css

# 1. 保存进度
git stash save "登录功能开发到一半"

# 2. 查看状态（干净了！）
git status
# nothing to commit

# 3. 切换去修bug
git checkout -b hotfix/urgent-bug
# ... 修bug ...
git commit -m "fix: 修复紧急bug"
git push

# 4. 切回来，恢复进度
git checkout dev
git stash pop

# 继续开发登录功能！
```

**场景2：测试别人的代码**

```bash
# 1. 保存你的代码
git stash save "我的功能开发到一半"

# 2. 拉取别人的代码测试
git pull origin feature/other-developer
pnpm docs:dev

# 3. 测试完了，删除别人的代码
git reset --hard HEAD

# 4. 恢复你的代码
git stash pop
```

**场景3：切换分支时冲突**

```bash
# 场景：你在 dev 分支改了文件，想切到 main 分支
git checkout main
# 错误：error: Your local changes to the following files would be overwritten...

# 解决：保存修改
git stash

# 现在可以切换了
git checkout main

# 回到 dev 后恢复
git checkout dev
git stash pop
```

### 只暂存部分文件

```bash
# 只暂存某个文件
git stash push login.js

# 只暂存某些文件
git stash push -m "暂存登录功能" login.js login.css

# 只暂存未跟踪的文件
git stash -u

# 保留暂存区的内容
git stash --keep-index
```

### 查看/应用存档内容

```bash
# 查看存档改了什么
git stash show

# 查看存档详细改动
git stash show -p

# 从存档创建新分支（适合合并到其他分支）
git stash branch new-branch stash@{1}
```

---

### 5.9.2 变基操作 - git rebase 详解

**什么是 rebase？**

**rebase（变基）** = 把你的提交"搬运"到最新的代码上

**生活比喻**：
- **merge（合并）**：两段历史接在一起，有个分叉
- **rebase（变基）**：把你的提交重新"播放"一遍，历史是直线的

### Merge vs Rebase

**图示对比：**

```bash
# 初始状态（你的分支落后了）
# main:  A → B → C → D
# dev:   A → B → E → F
#               ↑ 需要合并

# 使用 merge（产生分叉）
# main:  A → B → C → D → G ←─┐
# dev:   A → B → E → F ──────┘
#                     ↑ G 是 merge commit

# 使用 rebase（保持直线）
# main:  A → B → C → D → E' → F'
#                        ↑ 你的提交被"搬运"了
```

### 什么时候用 rebase？

| ✅ 使用 rebase | ❌ 不使用 rebase |
|---------------|----------------|
| 整理自己的分支 | 已推送到远程的分支 |
| 保持历史整洁 | 团队共享的分支 |
| 合并 upstream 更新 | 重要的公共分支 |
| 交互式 rebase 修改提交 | 别人可能基于你的提交工作 |

### 基础 rebase

```bash
# 1. 把当前分支变基到 main
git checkout dev
git rebase main

# 等同于：
# git checkout dev
# git pull --rebase origin main

# 2. 变基到指定提交
git rebase abc1234
```

### 实战场景

**场景1：保持本地分支最新**

```bash
# 你在 dev 分支开发，但 main 已经更新了
git checkout dev
# ... 你的提交 A → B → C

# main 已经有新提交 D → E → F

# 使用 rebase 更新
git rebase main
# 现在你的提交：D → E → F → A' → B' → C'
```

**场景2：多人协作时避免 merge commit**

```bash
# ❌ 传统的做法（会产生 merge commit）
git checkout dev
git pull origin dev    # 自动 merge
git checkout main
git merge dev          # 又一个 merge commit
# 历史里有很多 "Merge branch 'dev'" 的提交

# ✅ 使用 rebase（保持历史干净）
git checkout dev
git pull --rebase origin dev    # rebase 而不是 merge
git checkout main
git rebase dev                  # 直接变基
# 历史是直线的，很干净！
```

### 交互式 rebase（修改历史）

**这是 Git 最强大的功能之一！**

```bash
# 修改最近 3 次提交
git rebase -i HEAD~3

# 或修改某个提交之后的所有
git rebase -i abc1234
```

**会打开编辑器，显示：**

```bash
pick abc1234 feat: 添加登录表单
pick def5678 fix: 修复样式bug
pick ghi9012 style: 格式化代码

# 可以改成：
# pick     = 保留这个提交
# reword   = 保留但修改提交信息
# edit     = 保留但暂停，让你修改代码
# squash   = 合并到上一个提交
# drop     = 删除这个提交
```

**实际例子：**

```bash
# 场景：最近3次提交信息写得不好
# abc1234 feat: 添加功能
# def5678 fix: 修复
# ghi9012 style: 格式

# 1. 开始交互式 rebase
git rebase -i HEAD~3

# 2. 改成：
# reword abc1234 feat: 添加用户登录功能
# reword def5678 fix: 修复移动端显示问题
# reword ghi9012 style: 统一代码缩进为2空格

# 3. 保存后，Git 会让你逐个修改提交信息
```

**合并多个提交：**

```bash
# 场景：最近5次提交太碎了，想合并成1个
git rebase -i HEAD~5

# 改成：
pick abc1234 feat: 第一个功能
squash def5678 feat: 第二个功能
squash ghi9012 feat: 第三个功能
squash jkl3456 feat: 第四个功能
squash mno7890 feat: 第五个功能

# 保存后，会要求你写一个新的提交信息
```

**删除某个提交：**

```bash
# 场景：某次提交引入了bug，想删除
git rebase -i HEAD~5

# 把那一行改成：
drop abc1234 feat: 这个提交要删除

# 保存，提交就消失了
```

**⚠️ rebase 危险操作警告：**

```bash
# ❌ 绝对不要对已推送的提交做 rebase！
git push origin dev
# ... 别人基于你的代码继续开发 ...
git rebase -i HEAD~3  # 危险！会改写历史
git push --force      # 危险！会覆盖别人的代码

# ✅ 只对自己的本地分支用 rebase
git checkout feature/new-feature
git rebase -i HEAD~3  # 安全，只有你能看到
```

---

### 5.9.3 查看差异 - git diff 详解

**基本用法：**

```bash
# 1. 查看工作区修改（还未 add）
git diff

# 2. 查看暂存区修改（已 add，还未 commit）
git diff --staged
# 或
git diff --cached

# 3. 对比两个分支
git diff main dev

# 4. 对比两个提交
git diff abc1234 def5678

# 5. 查看某个文件的修改
git diff README.md

# 6. 对比指定提交的文件
git diff abc1234 README.md
```

### 实用选项

```bash
# 1. 只显示改了哪些文件（不显示具体内容）
git diff --name-only

# 2. 显示改了哪些文件和统计信息
git diff --stat

# 输出示例：
# README.md   | 10 +++++++++-
# package.json |  2 +-
# 2 files changed, 10 insertions(+), 1 deletion(-)

# 3. 显示更少的上下文
git diff -U2    # 只显示前后2行（默认是3行）

# 4. 忽略空格差异
git diff -w

# 5. 显示颜色（如果默认没有颜色）
git diff --color

# 6. 显示指定时间段的修改
git diff --since="2 weeks ago"
git diff --until="2024-01-15"
```

### 高级用法

**查看某个分支独有的修改：**

```bash
# 查看 dev 分支相比 main 的修改
git diff main..dev

# 查看将要合并的内容
git diff main...dev    # 注意是3个点
```

**图形化查看差异：**

```bash
# 使用外部工具（如 VSCode、Beyond Compare）
git difftool

# 配置默认工具
git config --global diff.tool vscode
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'
```

---

### 5.9.4 Git 钩子（Git Hooks）- 自动化你的工作流

**什么是 Git 钩子？**

就像 Git 的"触发器"：在某些操作（如 commit、push）时自动执行脚本。

**常用钩子：**

| 钩子名 | 触发时机 | 常见用途 |
|--------|---------|---------|
| `pre-commit` | 提交前 | 代码检查、格式化 |
| `commit-msg` | 提交信息编辑后 | 检查提交信息格式 |
| `pre-push` | 推送前 | 运行测试 |
| `post-merge` | 合并后 | 更新依赖、通知 |

### 安装和使用钩子

**查看钩子目录：**

```bash
# 查看钩子目录
git config --get core.hooksPath
# 默认：.git/hooks/

# 查看已有的钩子示例
ls .git/hooks/
```

**创建一个 pre-commit 钩子：**

```bash
# 1. 创建钩子文件
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 运行 pre-commit 检查..."

# 检查是否有 console.log（不允许提交调试代码）
if git diff --cached --name-only | grep '\.js$' > /dev/null; then
  if git diff --cached | grep 'console\.log' > /dev/null; then
    echo "❌ 错误：代码中有 console.log，请移除后再提交！"
    exit 1
  fi
fi

echo "✅ Pre-commit 检查通过！"
EOF

# 2. 给执行权限
chmod +x .git/hooks/pre-commit

# 3. 测试
git commit -m "test"
# 会看到 "🔍 运行 pre-commit 检查..."
```

**常用钩子示例：**

```bash
# 1. 提交信息格式检查
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash
# 检查提交信息格式：类型(范围): 描述
commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
  echo "❌ 错误：提交信息格式不正确！"
  echo "格式：类型(范围): 描述"
  echo "示例：feat(登录): 添加用户登录功能"
  exit 1
fi
EOF
chmod +x .git/hooks/commit-msg

# 2. 推送前运行测试
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
echo "🧪 运行测试..."

npm test

if [ $? -ne 0 ]; then
  echo "❌ 测试失败！推送被中止。"
  exit 1
fi
EOF
chmod +x .git/hooks/pre-push
```

### 使用 Husky（推荐）

**手动写钩子太麻烦？用 Husky！**

```bash
# 1. 安装 Husky
npm install husky --save-dev

# 2. 初始化
npx husky install

# 3. 添加钩子
npx husky add .husky/pre-commit "npm test"

# 4. 在 package.json 中配置
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

**实际例子：完整的 Git 工作流自动化**

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 运行代码检查..."
npm run lint
echo "✅ 代码检查通过！"

echo "🎨 格式化代码..."
npm run format
git add .
echo "✅ 代码格式化完成！"

# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 检查提交信息格式
commit_msg=$(cat $1)
commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! echo "$commit_msg" | grep -qE "$commit_regex"; then
  echo "❌ 提交信息格式错误！"
  echo "格式：类型(范围): 描述"
  echo "示例：feat(登录): 添加用户登录"
  exit 1
fi

# .husky/pre-push
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🧪 运行测试..."
npm test

if [ $? -ne 0 ]; then
  echo "❌ 测试失败！取消推送。"
  exit 1
fi
```

---

### 5.9.5 Cherry-pick - 精准挑选提交

**什么是 cherry-pick？**

就像从购物车上挑选你想要的商品，cherry-pick 让你**精准选择某个提交**，把它应用到当前分支。

**使用场景：**

```bash
# 场景1：从 dev 分支挑选某个 bug 修复到 main
# dev:  A → B → C → D (D 是 bug 修复)
# main: A → E → F
#         ↑ 需要 D

git checkout main
git cherry-pick D
# 结果：A → E → F → D
```

### 基础用法

```bash
# 1. 挑选单个提交
git cherry-pick abc1234

# 2. 挑选多个提交
git cherry-pick abc1234 def5678

# 3. 挑选范围（不包含 abc1234，包含 def5678）
git cherry-pick abc1234..def5678

# 4. 只应用不提交
git cherry-pick -n abc1234

# 5. 挑选但保留原有作者信息
git cherry-pick -x abc1234
```

### 实战场景

**场景1：紧急修复需要同时应用到多个分支**

```bash
# main 分支修复了 bug
git checkout main
git commit -m "fix: 修复登录崩溃问题"

# cherry-pick 到 dev 分支
git checkout dev
git cherry-pick main  # 或具体的 commit ID

# cherry-pick 到其他功能分支
git checkout feature/checkout
git cherry-pick main
```

**场景2：不需要合并整个分支，只要某个提交**

```bash
# dev 分支有10个新提交，但你只需要其中一个
# dev: A → B → C → D → E → F → G → H → I → J
#                                               ↑ D 是你需要的

git checkout feature-branch
git cherry-pick D    # 只要 D，其他都不要
```

### 处理冲突

```bash
# cherry-pick 时可能有冲突
git cherry-pick abc1234

# 如果有冲突：
# 1. 手动解决冲突
# 2. 标记为已解决
git add .
# 3. 继续 cherry-pick
git cherry-pick --continue

# 或放弃
git cherry-pick --abort
```

---

### 5.9.6 Git 配置和技巧

### 用户信息配置

```bash
# 1. 配置用户名和邮箱（必需！）
git config --global user.name "你的名字"
git config --global user.email "your.email@example.com"

# 2. 为不同项目配置不同的身份
cd project-a
git config user.name "项目A的作者"
git config user.email "project-a@example.com"

cd project-b
git config user.name "项目B的作者"
git config user.email "project-b@example.com"
```

### 常用配置

```bash
# 1. 设置默认分支名
git config --global init.defaultBranch main

# 2. 设置换行符处理（Windows推荐）
git config --global core.autocrlf true

# 3. Mac/Linux 设置
git config --global core.autocrlf input

# 4. 开启颜色输出
git config --global color.ui true

# 5. 设置默认编辑器
git config --global core.editor "code --wait"
# 或
git config --global core.editor "vim"

# 6. 设置合并策略
git config --global merge.ff false    # 不使用 fast-forward

# 7. 设置 rebase
git config --global pull.rebase true  # pull 时自动 rebase
```

### 查看配置

```bash
# 查看所有配置
git config --list

# 查看某个配置
git config user.name

# 编辑配置文件
git config --global --edit
```

### 有用的别名

```bash
# 1. 常用命令简写
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --graph --oneline --all'

# 2. 使用
git st          # = git status
git co dev      # = git checkout dev
git unstage file # = git reset HEAD -- file
git last        # = git log -1 HEAD

# 3. 超级日志（带颜色和图形）
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
```

---

### 5.9.7 查找和分析

### 搜索代码

```bash
# 1. 在所有文件中搜索
git grep "关键词"

# 2. 只在某个版本中搜索
git grep "关键词" v1.0.0

# 3. 统计某个函数出现了多少次
git grep -c "functionName"
```

### 查看谁修改了代码

```bash
# 1. 查看文件的每一行是谁修改的
git blame README.md

# 2. 查看某一行是谁修改的
git blame -L 10,20 README.md    # 只看第10-20行

# 3. 忽略空格
git blame -w README.md
```

### 查找引入 bug 的提交

```bash
# 使用二分查找快速定位问题
git bisect start

# 标记当前版本有 bug
git bisect bad

# 标记已知没 bug 的版本
git bisect good v1.0.0

# Git 自动切换到中间版本，你测试后标记
git bisect good    # 或 git bisect bad

# 重复测试，直到找到问题提交
git bisect reset   # 结束
```

### 查看历史

```bash
# 1. 图形化查看提交历史
git log --graph --oneline --all

# 2. 查看某个文件的历史
git log -- README.md

# 3. 查看某个函数的历史
git log -p --all -S 'functionName'

# 4. 查看提交的统计信息
git log --stat

# 5. 按作者查看
git log --author="张三"

# 6. 按时间范围查看
git log --since="2 weeks ago"
git log --until="2024-01-15"
git log --since="2024-01-01" --until="2024-01-31"
```

---

## 总结

恭喜你完成了 Git 学习之旅！🎉

现在你已经掌握：

- ✅ 标签管理 - 给版本起名字
- ✅ 自动关闭 Issue - 提交信息的魔法
- ✅ 实用技巧 - 提升效率
- ✅ 团队协作 - PR、Code Review
- ✅ 问题解决 - 冲突、回退、修复

**最重要的3条建议**：

1. **多提交，小步快跑**
   ```bash
   ✅ 每完成一个小功能就提交
   ❌ 写了一整天才提交一次
   ```

2. **写清楚的提交信息**
   ```bash
   ✅ "fix: 修复登录按钮无响应"
   ❌ "修改" / "update" / "fix"
   ```

3. **推送前先测试**
   ```bash
   git pull    # 拉取最新代码
   pnpm docs:dev    # 本地测试
   git push    # 确认无误再推送
   ```

继续练习，你会越来越熟练！

Happy Coding! 🚀
