# GitHub 分支保护配置指南

## ⚠️ 为什么需要分支保护？

**分支保护规则可以确保：**

| ✅ 保护项 | 说明 |
|---------|------|
| 🔒 **禁止直接推送** | 不能直接 `git push` 到 main |
| ✅ **强制 PR 审查** | 必须通过 PR 才能合并 |
| 🤖 **CI 检查通过** | 要求所有 status checks 通过 |
| 👥 **审查批准** | 要求至少 N 人审查批准 |
| 🔄 **保持分支最新** | 合并前必须是最新的代码 |
| 📝 **限制谁可以推送** | 只有特定角色可以推送 |

---

## 🚀 配置步骤

### 1️⃣ 进入分支保护设置

```
1. 打开 GitHub 仓库页面
2. 点击 Settings（设置）
3. 左侧菜单找到 "Branches"（分支）
4. 点击 "Add branch protection rule"（添加分支保护规则）
```

### 2️⃣ 配置保护规则

**Basic settings（基础设置）：**

```
Branch name pattern: main

✅ Require a pull request before merging
  ├─ ✅ Require approvals
  │   └─ Number of approvals required: 1
  ├─ ✅ Dismiss stale PR approvals when new commits are pushed
  └─ ✅ Require review from CODEOWNERS (可选)

✅ Require status checks to pass before merging
  ├─ ✅ Require branches to be up to date before merging
  └─ 选择必选的检查：
      ✅ CI 检查
      ✅ 构建检查
      ✅ 链接检查
      ✅ 提交规范检查
      ✅ 文件变更检查

✅ Require branches to be up to date before merging

❌ Do not allow bypassing the above settings

✅ Restrict who can push to matching branches
  └─ 选择允许推送的人/团队/应用
```

---

## 📋 完整配置选项说明

### Branch name pattern（分支名称模式）

```
main    ← 只保护 main 分支
*       ← 保护所有分支
feat/*  ← 保护所有 feat/ 开头的分支
release/* ← 保护所有 release/ 开头的分支
```

### Require a pull request before merging（要求 PR）

| 选项 | 说明 | 推荐设置 |
|------|------|---------|
| **Require approvals** | 要求审查批准 | ✅ 启用，至少 1 人 |
| **Dismiss stale approvals** | 新提交时撤销旧批准 | ✅ 启用 |
| **Require review from CODEOWNERS** | 要求 CODEOWNERS 文件中的所有者审查 | 可选 |
| **Allow specified actors to bypass** | 允许特定人绕过审查 | ❌ 不建议启用 |

### Require status checks to pass before merging（要求状态检查）

| 选项 | 说明 | 推荐设置 |
|------|------|---------|
| **Require branches to be up to date** | 要求分支是最新的 | ✅ 必须启用 |
| **Choose status checks** | 选择必需的检查 | ✅ 选择所有 CI 检查 |

**推荐的必选检查：**
```
✅ CI 检查          - 代码质量检查
✅ 构建检查          - 确保代码可以构建
✅ 链接检查          - 确保没有断链
✅ 提交规范检查      - 确保提交信息格式正确
✅ 文件变更检查      - 确保没有敏感文件
✅ PR 标题检查       - 确保 PR 标题格式正确
```

### Restrict who can push to matching branches（限制推送权限）

```
✅ 只有以下人员/应用可以直接推送到 main：
   - 仓库管理员（Admin）
   - 特定的协作者
   - GitHub Actions（如需要）

❌ 其他所有人只能通过 PR 合并
```

---

## 🔧 使用 GitHub CLI 自动配置

如果不想手动配置，可以使用 GitHub CLI（gh）：

```bash
# 安装 GitHub CLI
# macOS: brew install gh
# Windows: scoop install gh
# Linux: sudo apt install gh

# 登录
gh auth login

# 配置 main 分支保护规则
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/SimonX0/simonProjectGuide/branches/main/protection \
  -f required_pull_request_reviews='{
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  }' \
  -f required_status_checks='{
    "strict": true,
    "contexts": [
      "CI 检查",
      "构建检查",
      "链接检查",
      "提交规范检查",
      "文件变更检查",
      "PR 标题检查"
    ]
  }' \
  -f enforce_admins=true \
  -f allow_force_deletions=false \
  -f restrictions=null
```

---

## 📝 配置示例

### 示例 1：个人项目（宽松配置）

```yaml
Branch: main

PR 设置:
  - ✅ 要求 PR 审查
  - ✅ 至少 1 人批准
  - ❌ 不要求 CODEOWNERS

状态检查:
  - ✅ 要求分支最新
  - ✅ 必选检查: CI 检查、构建检查

限制:
  - ✅ 禁止直接推送
  - ❌ 不限制谁可以绕过
```

### 示例 2：团队项目（中等配置）

```yaml
Branch: main

PR 设置:
  - ✅ 要求 PR 审查
  - ✅ 至少 2 人批准
  - ✅ 新提交时撤销旧批准
  - ✅ 要求 CODEOWNERS 审查

状态检查:
  - ✅ 要求分支最新
  - ✅ 必选所有 CI 检查

限制:
  - ✅ 禁止直接推送
  - ✅ 禁止绕过设置
  - ✅ 只有管理员可以推送
```

### 示例 3：企业级项目（严格配置）

```yaml
Branch: main
Branch: release/*

PR 设置:
  - ✅ 要求 PR 审查
  - ✅ 至少 3 人批准
  - ✅ 新提交时撤销旧批准
  - ✅ 要求 CODEOWNERS 审查
  - ✅ 要求已解除对话的 PR

状态检查:
  - ✅ 要求分支最新
  - ✅ 必选所有 CI 检查
  - ✅ 要求 PR 已通过所有审查

限制:
  - ✅ 禁止直接推送
  - ✅ 禁止绕过设置
  - ✅ 只有指定的团队可以推送
  - ✅ 禁止强制推送
  - ✅ 禁止删除分支
```

---

## 🧪 测试分支保护是否生效

### 测试 1：尝试直接推送到 main

```bash
# 应该被拒绝
git checkout main
git echo "test" >> test.txt
git add .
git commit -m "test: 直接推送测试"
git push origin main

# 预期结果：
# ❌ Error: Branch protected
# ❌ Push rejected due to branch protection rules
```

### 测试 2：尝试通过 PR 合并

```bash
# 应该成功
git checkout dev
git echo "test" >> test.txt
git add .
git commit -m "test: PR 测试"
git push origin dev

# 在 GitHub 创建 PR
# 等待 CI 检查通过
# 合并 PR

# 预期结果：
# ✅ PR 创建成功
# ✅ CI 检查运行
# ✅ 检查通过后可以合并
```

### 测试 3：CI 检查失败时尝试合并

```bash
# 创建一个会失败的 PR
git checkout dev
# ... 写一段有错误的代码 ...
git push origin dev

# 在 GitHub 创建 PR
# 尝试合并

# 预期结果：
# ✅ PR 创建成功
# ❌ CI 检查失败
# ❌ "Merge" 按钮被禁用
# ⚠️ 提示: "All checks have not passed"
```

---

## 🚨 常见问题

### Q1: 配置后还能直接推送吗？

**A:** 不能（除非你是管理员且配置了允许）。

```bash
# 尝试直接推送
git push origin main

# 错误信息：
# remote: error: GH006: Protected branch update failed for main.
# remote: error: Cannot push to a protected branch
# To https://github.com/SimonX0/simonProjectGuide.git
#  ! [rejected]        main -> main (protected branch)
```

### Q2: 如何允许 GitHub Actions 推送？

**A:** 在限制设置中添加 `github-actions[bot]`：

```
Settings → Branches → Branch protection rules
→ Restrict who can push to matching branches
→ Add: github-actions[bot]
```

### Q3: 紧急情况如何绕过？

**A:** 有两种方式：

**方式 1：临时禁用保护**
```
Settings → Branches → 找到保护规则 → Disable
... 紧急修复 ...
Settings → Branches → 重新启用保护
```

**方式 2：使用管理员权限**
```
如果你是管理员，可以直接推送：
git push origin main --force
```

### Q4: 如何允许特定人直接推送？

**A:** 在限制设置中添加特定人：

```
Settings → Branches → Branch protection rules
→ Restrict who can push to matching branches
→ Add specific people:
    - @username1
    - @username2
```

---

## 📚 最佳实践

### 1. 渐进式启用

```
第1周：启用基本保护
  - 禁止直接推送
  - 要求 CI 检查通过

第2周：添加 PR 审查
  - 要求 1 人审查
  - 要求分支最新

第3周：加强保护
  - 要求 2 人审查
  - 添加更多 CI 检查
```

### 2. 定期审查配置

```markdown
每月检查清单：
- [ ] 检查 CI 检查是否还适用
- [ ] 调整审查人数要求
- [ ] 更新必需的 status checks
- [ ] 审查允许推送的人员列表
- [ ] 检查是否有绕过保护的情况
```

### 3. 团队培训

```markdown
确保团队成员理解：
- [ ] 为什么要使用 PR 流程
- [ ] 如何创建和合并 PR
- [ ] CI 检查失败如何处理
- [ ] 紧急情况如何处理
```

---

## 🔗 相关资源

- [GitHub 官方文档：About branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub 官方文档：Configuring protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/configuring-protected-branches)
- [CODEOWNERS 文件配置](https://docs.github.com/en/repositories/managing-your-repositorys-settings/defining-the-mergeability-of-pull-requests/about-code-owners)

---

**配置完成后，你的 main 分支就是安全的了！** 🎉
