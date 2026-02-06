---
title: Git分支策略面试题
---

# Git分支策略面试题

## 分支管理

### Git Flow工作流？

Git Flow是最经典的分支管理策略。

```bash
# 主要分支
main          # 生产环境分支，始终保持稳定
develop       # 开发分支，集成最新功能

# 辅助分支
feature/*     # 功能分支
release/*     # 发布分支
hotfix/*      # 热修复分支
```

**分支流程**：

```
develop ──────────────────────┐
  ↓                            │
feature ───────> develop ─────> release ───> main
                          ↓                    ↓
                      hotfix ─────────────────┘
```

**常用命令**：

```bash
# 1. 开始新功能
git checkout develop
git checkout -b feature/user-auth

# 2. 完成功能开发
git checkout develop
git merge feature/user-auth
git branch -d feature/user-auth

# 3. 准备发布
git checkout develop
git checkout -b release/1.0.0

# 4. 完成发布
git checkout main
git merge release/1.0.0
git checkout develop
git merge release/1.0.0

# 5. 紧急修复
git checkout main
git checkout -b hotfix/critical-bug
# 修复后
git checkout main
git merge hotfix/critical-bug
git checkout develop
git merge hotfix/critical-bug
```

### GitHub Flow？

GitHub Flow是更简化的持续部署流程。

```bash
# 唯一长期分支：main

# 1. 从main创建分支
git checkout main
git checkout -b feature-branch

# 2. 开发并提交
git add .
git commit -m "Add new feature"

# 3. 推送到远程
git push origin feature-branch

# 4. 创建Pull Request

# 5. 代码审查

# 6. 合并到main
git checkout main
git merge feature-branch

# 7. 立即部署
```

**特点**：
- 只有一个长期分支（main）
- 任何分支都可以部署
- 持续部署友好
- PR必须通过审查才能合并

### GitLab Flow？

GitLab Flow结合了Git Flow和GitHub Flow的优点。

```bash
# 1. 环境分支
main          # 主分支
production    # 生产环境
staging       # 预发布环境

# 2. 功能开发
git checkout main
git checkout -b feature/new-ui

# 3. 合并到main后，自动合并到环境分支
git checkout main
git merge feature/new-ui

# 合并到staging
git checkout staging
git merge main

# 测试通过后合并到production
git checkout production
git merge staging
```

**特点**：
- 支持环境分支
- 支持版本分支（如stable-1.0）
- 可配置的自动合并

## 分支命名规范

### 推荐的分支命名？

```bash
# 功能分支
feature/user-authentication
feature/payment-gateway
feature/add-dashboard

# 修复分支
bugfix/login-error
bugfix/memory-leak

# 热修复分支
hotfix/security-patch
hotfix/critical-bug

# 发布分支
release/v1.0.0
release/v2.1.0

# 实验性分支
experiment/new-architecture
experiment/alternative-approach
```

### 分支描述模板？

```bash
# 创建分支时添加描述
git checkout -b feature/user-auth
git config branch.feature/user-auth.description "Add JWT authentication"

# 查看分支描述
git config branch.feature/user-auth.description
```

## 分支最佳实践

### 何时创建分支？

**建议**：
- 每个功能/bug修复单独分支
- 不要在main/develop直接开发
- 保持分支短小精悍
- 及时删除已合并分支

```bash
# 1. 查看所有分支
git branch -a

# 2. 删除已合并的本地分支
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# 3. 删除已合并的远程分支
git branch -r --merged | grep -v master | sed 's/origin\///' | \
  xargs -I % git push origin :%
```

### 如何处理长期分支？

```bash
# 定期同步主分支
git checkout feature-branch
git fetch origin
git merge origin/main

# 或者使用rebase保持线性历史
git checkout feature-branch
git fetch origin
git rebase origin/main
```

### 分支保护规则？

**GitHub/GitLab设置**：

```yaml
分支保护规则：
- main分支：
  - 禁止直接push
  - 要求PR审查（至少1人）
  - 要求状态检查通过
  - 要求分支为最新
  - 限制可以push的人员

- develop分支：
  - 禁止直接push
  - 要求PR审查
  - 允许强制push（管理员）
```

## 冲突解决

### 如何解决合并冲突？

```bash
# 1. 尝试合并
git checkout main
git merge feature-branch

# 2. 如果冲突，查看冲突文件
git status

# 3. 手动解决冲突
# 编辑冲突文件，选择保留的内容

# 4. 标记为已解决
git add conflicted-file.js

# 5. 完成合并
git commit

# 6. 如果需要中止合并
git merge --abort
```

**冲突标记**：

```javascript
// <<<<<<< HEAD
// 当前分支的代码
const value = 'main';
// =======
// feature分支的代码
const value = 'feature';
// >>>>>>> feature-branch

// 解决后删除标记，保留需要的代码
const value = 'main'; // 或 'feature'，或两者结合
```

### 如何避免冲突？

```bash
# 1. 频繁同步主分支
git checkout feature-branch
git pull origin main

# 2. 使用rebase而非merge
git checkout feature-branch
git rebase main

# 3. 小步提交
git add file1.js
git commit -m "Add login form"

git add file2.js
git commit -m "Add validation"

# 而不是一次提交大块代码
```

### 如何使用git rerere？

```bash
# 启用rerere（重用已记录的冲突解决方案）
git config --global rerere.enabled true

# rerere会记录你如何解决冲突
# 下次遇到相同冲突时自动应用相同解决方案

# 查看rerere状态
git rerere status

# 清除rerere缓存
git rerere forget <path>
```

## Rebase vs Merge

### rebase和merge的区别？

| 特性 | merge | rebase |
|------|-------|--------|
| 历史 | 保留完整历史 | 创建线性历史 |
| 分支 | 可见所有分支 | 隐藏分支结构 |
| 冲突 | 解决一次 | 可能多次解决 |
| 安全性 | 安全 | 改写历史，需谨慎 |

**merge示例**：

```bash
git checkout main
git merge feature-branch

# 结果：合并提交，保留分支历史
# * main (HEAD)
# |\
# * | feature-branch
# |/
# * main
```

**rebase示例**：

```bash
git checkout feature-branch
git rebase main

# 结果：线性历史，feature的提交移到main之后
# * feature-branch (HEAD)
# * main
# * main
```

### 何时使用rebase？

**适用场景**：
```bash
# 1. 未推送的本地分支
git checkout feature-branch
git rebase main

# 2. 保持清晰的提交历史
git checkout feature-branch
git rebase -i main~3  # 交互式rebase

# 3. 整合多个提交
git rebase -i HEAD~3
# 在编辑器中选择 squash 或 fixup
```

**避免场景**：
```bash
# ❌ 已推送的分支（不要rebase）
# 会导致他人的分支出现冲突

# ✅ 改用merge
git checkout main
git merge feature-branch
```

### 交互式rebase？

```bash
# 1. 编辑最近3个提交
git rebase -i HEAD~3

# 2. 编辑器中会显示：
pick abc1234 Commit message 1
pick def5678 Commit message 2
pick ghi9012 Commit message 3

# 可以修改为：
rebase abc1234 Commit message 1  # 保留
fixup def5678 Commit message 2   # 合并到上一个
squash ghi9012 Commit message 3  # 合并并允许编辑消息

# 3. 保存后，Git会执行操作

# 其他操作：
pick   = 使用提交
reword = 编辑提交消息
edit   = 停在此提交，允许修改
squash = 合并到上一个提交
fixup  = 合并到上一个（丢弃消息）
drop   = 删除提交
exec   = 执行shell命令
```

## 分支策略选择

### 小团队（<5人）？

```bash
# 推荐GitHub Flow

main (保护，要求PR)
  ├── feature-A
  ├── feature-B
  └── feature-C

# 优点：
- 简单
- 快速迭代
- 易于理解
```

### 中型团队（5-20人）？

```bash
# 推荐简化的Git Flow

main (生产)
  └── develop (开发)
      ├── feature-A
      ├── feature-B
      └── hotfix-C

# 优点：
- 稳定的生产分支
- 独立的开发分支
- 灵活的功能分支
```

### 大型团队（>20人）？

```bash
# 推荐完整的Git Flow或GitLab Flow

main (生产)
  ├── develop (开发)
  │   ├── feature-A
  │   └── feature-B
  ├── release-1.0 (发布)
  └── hotfix-C (热修复)

# 或环境分支：
main
  ├── staging (预发布)
  └── production (生产)

# 优点：
- 严格的管理流程
- 明确的发布节奏
- 支持多版本维护
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
