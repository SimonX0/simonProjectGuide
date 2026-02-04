# 第5章：Git实战技巧

## 5.1 高级命令技巧

### 查找提交

```bash
# 查找包含特定内容的提交
git log -S "functionName"

# 查找某个文件的修改历史
git log --follow -- README.md

# 查找某个作者的所有提交
git log --author="张三"

# 查找某个时间段的提交
git log --since="2024-01-01" --until="2024-12-31"
```

### 交互式变基

```bash
# 修改最近3次提交
git rebase -i HEAD~3

# 命令说明：
# pick: 保留该提交
# reword: 修改提交信息
# edit: 编辑提交内容
# squash: 合并到前一个提交
# drop: 删除该提交
```

**示例**：合并多个提交

```
pick abc1234 添加功能A
pick def5678 添加功能B
pick ghi9012 添加功能C

# 改为
pick abc1234 添加功能A
squash def5678 添加功能B
squash ghi9012 添加功能C

# 保存后会合并成一个提交
```

### Cherry-pick（挑选提交）

```bash
# 将其他分支的某个提交应用到当前分支
git cherry-pick abc1234

# 挑选多个提交
git cherry-pick abc1234..def5678

# 只应用更改但不提交
git cherry-pick -n abc1234
```

**使用场景**：
```
main 分支: A --- B --- C
dev 分支:  A --- D --- E

# 想要将 dev 的提交 D 应用到 main
git checkout main
git cherry-pick D的哈希

结果: main 分支: A --- B --- C --- D'
```

### Stash（暂存修改）

```bash
# 临时保存工作区修改
git stash

# 保存并添加说明
git stash save "临时保存登录功能"

# 查看暂存列表
git stash list

# 应用最新的暂存
git stash pop

# 应用指定暂存
git stash apply stash@{1}

# 删除暂存
git stash drop stash@{0}

# 清空所有暂存
git stash clear
```

**使用场景**：
```bash
# 场景：正在开发功能A，需要紧急修复bug

# 1. 保存当前工作
git stash save "未完成的登录功能"

# 2. 切换到 main 修复bug
git checkout main
# ... 修复bug ...
git commit -m "fix: 修复验证错误"

# 3. 切回 dev，恢复工作
git checkout dev
git stash pop
```

---

## 5.2 代码审查技巧

### 查看某人的所有提交

```bash
git log --author="张三" --oneline
```

### 查看某个文件的修改统计

```bash
# 查看每个作者的修改行数
git blame README.md

# 查看文件修改统计
git log --stat -- README.md
```

### 对比两个分支

```bash
# 查看 dev 有哪些 main 没有的提交
git log main..dev

# 查看两个分支的差异文件
git diff main dev --name-only

# 查看两个分支的具体差异
git diff main dev
```

---

## 5.3 撤销操作的完整指南

### 场景 1：工作区修改错了

```bash
# 恢复单个文件
git restore README.md

# 恢复所有文件
git restore .
```

### 场景 2：暂存区加错了

```bash
# 从暂存区移除（保留工作区修改）
git restore --staged README.md

# 或使用旧命令
git reset HEAD README.md
```

### 场景 3：提交信息写错了

```bash
# 修改最近一次提交信息
git commit --amend

# 修改为指定信息
git commit --amend -m "正确的提交信息"
```

### 场景 4：漏了文件没加

```bash
# 添加遗漏的文件
git add forgotten-file.txt

# 追加到上一次提交（不产生新提交）
git commit --amend --no-edit
```

### 场景 5：需要回退多个提交

```bash
# 撤销最近2次提交（保留修改）
git reset --soft HEAD~2

# 撤销最近2次提交（丢弃修改）
git reset --hard HEAD~2

# 回退到指定提交（保留修改）
git reset --soft abc1234
```

### 场景 6：已经推送到远程，需要回退

```bash
# 方法1：创建新提交（推荐）
git revert abc1234
git push

# 方法2：强制回退（危险！需要团队同意）
git reset --hard abc1234
git push --force
```

---

## 5.4 分支管理技巧

### 清理已合并的分支

```bash
# 查看已合并的分支
git branch --merged

# 删除已合并的分支
git branch -d $(git branch --merged)

# 查看未合并的分支
git branch --no-merged
```

### 重命名分支

```bash
# 重命名当前分支
git branch -m 新分支名

# 重命名指定分支
git branch -m 旧分支名 新分支名
```

### 跟踪远程分支

```bash
# 设置本地分支跟踪远程分支
git branch -u origin/dev

# 查看跟踪关系
git branch -vv
```

---

## 5.5 远程协作技巧

### 拉取远程分支

```bash
# 拉取所有远程分支信息
git fetch origin

# 查看所有远程分支
git branch -r

# 基于远程分支创建本地分支
git checkout -b dev origin/dev
```

### 同步多个远程仓库

```bash
# 添加多个远程仓库
git remote add origin1 https://github.com/用户1/项目.git
git remote add origin2 https://github.com/用户2/项目.git

# 推送到所有远程仓库
git push origin1 main
git push origin2 main

# 或使用别名一次性推送
git remote set-url --add --push origin https://github.com/用户1/项目.git
git remote set-url --add --push origin https://github.com/用户2/项目.git
git push origin
```

---

## 5.6 性能优化技巧

### 浅克隆（加快克隆速度）

```bash
# 只克隆最近一次提交
git clone --depth 1 https://github.com/用户/项目.git

# 只克隆指定分支
git clone --branch main --depth 1 https://github.com/用户/项目.git
```

### 清理无用文件

```bash
# 清理未跟踪的文件
git clean -f

# 清理未跟踪的文件和目录
git clean -fd

# 预览会删除什么
git clean -n

# 清理不必要的文件并优化本地仓库
git gc
```

---

## 5.7 Git Hooks（钩子）

### 常用钩子

```bash
# 钩子位置：.git/hooks/
commit-msg       # 提交信息验证
pre-commit       # 提交前检查
pre-push         # 推送前检查
```

### 示例：强制提交信息格式

```bash
# .git/hooks/commit-msg
#!/bin/sh
# 检查提交信息格式
commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'
error_msg="提交信息格式错误！格式：类型(范围): 描述"

if ! grep -qE "$commit_regex" "$1"; then
    echo "$error_msg"
    exit 1
fi
```

### 示例：提交前运行测试

```bash
# .git/hooks/pre-commit
#!/bin/sh
# 提交前运行测试
npm test

if [ $? -ne 0 ]; then
    echo "测试失败，请修复后再提交"
    exit 1
fi
```

---

## 5.8 常见问题解决

### 问题 1：文件名大小写修改

```bash
# Git 默认忽略文件名大小写
# 解决方法：
git mv oldname.txt NewName.txt
git commit -m "rename: 修改文件名大小写"
```

### 问题 2：.gitignore 不生效

```bash
# 清除缓存
git rm -r --cached .

# 重新添加
git add .
git commit -m "fix: 更新gitignore"
```

### 问题 3：合并后想撤销

```bash
# 撤销合并
git merge --abort

# 或已经提交了
git reset --hard HEAD~1
```

### 问题 4：拉取时产生冲突

```bash
# 方法1：保留本地版本
git pull -X ours

# 方法2：保留远程版本
git pull -X theirs

# 方法3：手动解决
git pull
# 手动编辑冲突文件
git add .
git commit
```

---

## 5.9 实用工具和别名

### Git 别名配置

```bash
# 创建常用别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm commit
git config --global alias.lg "log --graph --oneline --all"

# 使用别名
git st        # git status
git co dev    # git checkout dev
git br        # git branch
git lg        # 查看图形化日志
```

### 全局配置文件

```bash
# ~/.gitconfig
[user]
    name = 你的名字
    email = 你的邮箱

[alias]
    st = status
    co = checkout
    br = branch
    cm = commit
    lg = log --graph --oneline --all --decorate

[color]
    ui = true
```

---

## 5.10 学习资源

### 官方资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 官方教程](https://docs.github.com/get-started/quickstart)
- [Git 参考手册](https://git-scm.com/docs)

### 推荐工具

- **学习工具**: [Learn Git Branching](https://learngitbranching.js.org/)
- **可视化工具**: [GitKraken](https://www.gitkraken.com/)
- **VSCode 扩展**: GitLens

### 练习项目

- 参与开源项目：[GitHub Explore](https://github.com/explore)
- 贡献文档：[开源文档项目](https://www.writethedocs.org/)

---

## 总结

恭喜你完成了 Git 完全指南的学习！现在你应该能够：

- ✅ 熟练使用 Git 常用命令
- ✅ 掌握分支管理和合并
- ✅ 理解 Git 工作流程
- ✅ 处理常见问题
- ✅ 参与团队协作

继续练习和实践，你会越来越熟练！

Happy Coding! 🎉
