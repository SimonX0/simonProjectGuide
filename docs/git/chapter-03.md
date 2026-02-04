# 第3章：Git分支管理

## 3.1 理解分支

### 什么是分支？

分支可以理解为项目的**平行宇宙**，每个分支都是独立的开发线。

```
时间线
  │
  ├─ main 分支 (主线)
  │   └── A → B → C
  │
  ├─ dev 分支 (开发)
  │   └── A → B → D → E
  │
  └─ feature 分支 (功能)
      └── A → F → G
```

### 为什么需要分支？

**场景 1：多人协作**
```
小明: 开发登录功能 → feature/login
小红: 开发注册功能 → feature/register
小刚: 修复bug → fix/bug-123
```

**场景 2：版本管理**
```
main: 生产环境 (稳定版本)
dev: 开发环境 (最新功能)
feature: 功能分支 (实验性功能)
```

---

## 3.2 分支基本操作

### 查看分支

```bash
# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 查看远程分支
git branch -r

# 查看分支最新提交
git branch -v
```

### 创建分支

```bash
# 创建分支（不切换）
git branch dev

# 创建并切换到新分支
git checkout -b dev

# 基于指定提交创建分支
git checkout -b feature abc1234
```

### 切换分支

```bash
# 切换到已存在的分支
git checkout dev

# 切换到上一个分支
git checkout -

# 注意：切换分支前要确保工作区是干净的
```

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

## 3.3 分支合并

### 合并方式 1：Merge

**普通合并**（保留历史）

```bash
# 1. 切换到目标分支
git checkout main

# 2. 合并 dev 分支
git merge dev

# 3. 如果有冲突，解决后提交
git add .
git commit -m "合并dev分支"
```

**特点**：
- ✅ 保留完整历史
- ✅ 可以清楚看到分支结构
- ❌ 历史记录可能比较复杂

### 合并方式 2：Rebase

**变基**（线性历史）

```bash
# 1. 切换到目标分支
git checkout feature

# 2. 将 feature 的提交移到 main 之后
git rebase main
```

**图示**：
```
# Rebase 前
A --- B (main)
  \
   C --- D (feature)

# Rebase 后
A --- B --- C --- D (feature)
         (main)
```

**特点**：
- ✅ 历史记录更清晰
- ✅ 避免不必要的合并提交
- ❌ 会改变提交历史（不要对已推送的提交使用）

---

## 3.4 解决冲突

### 什么时候会产生冲突？

当两个分支修改了同一文件的同一行时，Git 无法自动合并。

```
main 分支:  var name = "张三";
dev 分支:   var name = "李四";
            ↑ 冲突！
```

### 冲突标记

```bash
<<<<<<< HEAD
var name = "张三";  // 当前分支的修改
=======
var name = "李四";  // 要合并分支的修改
>>>>>>> dev
```

### 解决冲突步骤

```bash
# 1. 尝试合并
git merge dev

# 2. Git 提示有冲突
Auto-merging index.js
CONFLICT (content): Merge conflict in index.js

# 3. 打开冲突文件，手动编辑
# 选择保留哪部分，或合并两者

# 4. 标记冲突已解决
git add index.js

# 5. 完成合并
git commit -m "合并dev分支，解决冲突"
```

### 冲突解决策略

**策略 1：保留当前分支**
```bash
git checkout --ours 文件名
git add 文件名
```

**策略 2：保留被合并分支**
```bash
git checkout --theirs 文件名
git add 文件名
```

**策略 3：中止合并**
```bash
git merge --abort
```

---

## 3.5 分支管理最佳实践

### 1. 主分支保护

```bash
# 不要直接在 main 分支开发
# main 只用于：
#  - 接受合并
#  - 打标签发布
```

### 2. 功能分支工作流

```
main (生产)
  ↓
dev (开发)
  ↓
feature-xxx (功能)
```

**流程**：
1. 从 `dev` 创建 `feature` 分支
2. 在 `feature` 分支开发
3. 开发完成后合并回 `dev`
4. 测试通过后从 `dev` 合并到 `main`

### 3. 分支命名规范

```bash
# 功能分支
feature/user-login
feature/shopping-cart

# 修复分支
fix/login-error
bugfix/payment-issue

# 发布分支
release/v1.0.0

# 热修复分支
hotfix/critical-bug
```

### 4. 保持分支同步

```bash
# 定期从 main 拉取更新到 dev
git checkout dev
git pull origin main

# 或使用 rebase
git checkout dev
git rebase main
```

---

## 3.6 常见分支策略

### Git Flow

```
main (生产)
  ↓
develop (开发)
  ↓
feature (功能)
release (发布)
hotfix (紧急修复)
```

**适用场景**：大项目、有明确发布周期的团队

### GitHub Flow

```
main (生产)
  ↓
feature (功能)
```

**适用场景**：持续部署的小团队

### GitLab Flow

```
main (生产)
  ↓
develop (开发)
  ↓
feature (功能)
```

**适用场景**：需要环境测试的项目

---

## 3.7 实战示例

### 场景：开发新功能

```bash
# 1. 从 dev 创建功能分支
git checkout dev
git pull origin dev
git checkout -b feature/user-profile

# 2. 开发功能
# ... 编写代码 ...
git add .
git commit -m "添加用户头像上传功能"

# 3. 推送到远程
git push -u origin feature/user-profile

# 4. 完成开发后合并到 dev
git checkout dev
git pull origin dev
git merge feature/user-profile
git push origin dev

# 5. 删除功能分支
git branch -d feature/user-profile
git push origin --delete feature/user-profile
```

### 场景：紧急修复生产bug

```bash
# 1. 从 main 创建修复分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. 修复bug
# ... 修改代码 ...
git add .
git commit -m "修复登录验证bug"

# 3. 推送并测试
git push -u origin hotfix/critical-bug

# 4. 合并到 main 和 dev
git checkout main
git merge hotfix/critical-bug
git push origin main

git checkout dev
git merge hotfix/critical-bug
git push origin dev

# 5. 删除修复分支
git branch -d hotfix/critical-bug
```

---

## 3.8 分支可视化

```bash
# 查看分支图
git log --graph --oneline --all

# 使用 Git GUI 工具
gitk

# 使用更好的日志工具
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --all
```

---

## 下一步

掌握了分支管理后，让我们学习[工作流程 →](workflow)
