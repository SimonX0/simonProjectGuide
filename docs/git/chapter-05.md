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
