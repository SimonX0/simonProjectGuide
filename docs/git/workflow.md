# Git工作流程

## 本项目的工作流程

⚠️ **重要：本项目采用 PR（Pull Request）流程！**

本项目采用 **dev-main** 双分支工作流 + **PR 代码审查流程**，确保代码质量和团队协作。

### 工作流程概述

```
┌─────────────────────────────────────────────────────────┐
│              项目开发工作流程 (PR 流程)                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1️⃣ 开发阶段（dev 分支）                                  │
│     ├── 代码开发                                          │
│     ├── 本地测试                                          │
│     ├── git commit                                       │
│     └── git push origin dev                              │
│                                                          │
│  2️⃣ PR 阶段（GitHub）                                    │
│     ├── 创建 PR: dev → main                              │
│     ├── 🤖 CI 自动检查（构建、链接、提交规范）                  │
│     ├── 👥 代码审查（Code Review）                         │
│     └── 根据反馈修改                                       │
│                                                          │
│  3️⃣ 合并阶段（审查通过后）                                  │
│     ├── 合并 PR 到 main                                   │
│     ├── 🚀 自动部署到 GitHub Pages                         │
│     └── 同步回 dev                                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 为什么需要 PR 流程？

**生活比喻：就像餐厅的菜品质量检查**

```
🏠 dev (厨房)      → 制作菜品，自己试吃
👨‍🍳 PR (质量检查)    → 厨师长品尝，提出改进意见
🍽️ main (餐厅)    → 上菜给客人，确保质量完美
```

**PR 流程的好处：**

| ✅ 优点 | 说明 |
|-------|------|
| 🤖 **自动检查** | CI 自动检测构建、链接、提交规范 |
| 👥 **代码审查** | 团队成员审查代码，发现问题 |
| 📝 **讨论记录** | PR 讨论就是最好的文档 |
| 🛡️ **质量保证** | main 分支永远是高质量代码 |
| 🔄 **安全回滚** | 出问题可以立即回滚 PR |
| 📚 **知识共享** | 通过 PR 学习他人的好做法 |

### 分支说明

```
┌─────────────────────────────────────┐
│      🍽️ main (生产分支 - 餐厅)         │
│   • 稳定的代码，可以展示给用户          │
│   • 推送触发自动部署到线上              │
│   • 不要直接在这里修改！               │
│   • 就像餐厅：菜品上桌后不能随便改       │
└─────────────────────────────────────┘
                 ↑ 合并（上菜）
┌─────────────────────────────────────┐
│      🏠 dev (开发分支 - 厨房)          │
│   • 日常开发都在这里                   │
│   • 推送不触发部署（安全）             │
│   • 可以随便试错                       │
│   • 就像厨房：随便试味道，不好重做       │
└─────────────────────────────────────┘
```

**什么时候用哪个分支？**

| 操作 | 用什么分支 | 说明 |
|------|-----------|------|
| 💻 日常开发 | `dev` | 写代码、改bug、加功能 |
| 🧪 本地测试 | `dev` | `pnpm docs:dev` 测试 |
| 🚀 发布上线 | `main` | 合并后推送到main |
| 🐛 紧急修复 | 先`main`后`dev` | 紧急情况特殊处理 |

### 完整工作流程图

```
┌─────────────────────────────────────────┐
│          开发阶段 (在dev分支)             │
├─────────────────────────────────────────┤
│  1. git checkout dev                     │
│  2. 编辑文件                             │
│  3. git add .                            │
│  4. git commit -m "feat: 描述"           │
│  5. git push origin dev                  │
│  6. pnpm docs:dev (本地测试)              │
└─────────────────────────────────────────┘
                    ↓ 测试通过
┌─────────────────────────────────────────┐
│       PR 阶段 (GitHub Pull Request)      │
├─────────────────────────────────────────┤
│  7. 在 GitHub 创建 PR: dev → main       │
│  8. 🤖 CI 自动检查                        │
│     ├─ 构建检查                           │
│     ├─ 链接检查                           │
│     ├─ 提交规范检查                        │
│     └─ 文件变更检查                        │
│  9. 👥 代码审查（Code Review）            │
│ 10. 根据反馈修改（如果需要）               │
└─────────────────────────────────────────┘
                    ↓ 审查通过
┌─────────────────────────────────────────┐
│          合并阶段 (PR 合并)               │
├─────────────────────────────────────────┤
│ 11. 在 GitHub 合并 PR 到 main            │
│ 12. 🚀 自动部署到 GitHub Pages           │
│ 13. git checkout dev                     │
│ 14. git pull origin main                 │
│ 15. git merge main (同步到 dev)           │
└─────────────────────────────────────────┘
```

### 命令示例（详细版）

```bash
# ==================== 阶段1：开发 ====================
# 1. 确保在dev分支
git checkout dev

# 2. 拉取最新代码（避免冲突）
git pull origin dev

# 3. 编辑文件...
# 比如：修改了 README.md

# 4. 查看改动（好习惯）
git status
git diff

# 5. 添加修改
git add .

# 6. 提交（写清楚做了什么）
git commit -m "docs: 更新Git使用说明"

# 7. 推送到远程（备份+同步）
git push origin dev

# ==================== 阶段2：测试 ====================
# 8. 本地测试
pnpm docs:dev

# 打开浏览器 http://localhost:5173
# 确认修改正确，没有bug

# ==================== 阶段3：发布 ====================
# 9. 确认无误后，切换到main
git checkout main

# 10. 拉取最新main代码
git pull origin main

# 11. 合并dev分支
git merge dev

# 12. 推送到main（触发自动部署）
git push origin main

# 13. 切回dev继续开发
git checkout dev
```

**时间线示例：**
```
早上9点:  在dev分支开发新功能
上午11点: 本地测试通过，推送到dev
下午2点:  确认没问题，合并到main
下午2点05: 自动部署完成，线上更新成功
下午3点:  切回dev，继续下一个功能
```

---

## 日常开发流程

### 🎯 场景1：开发新功能（标准流程）

**什么时候用？**
- 🎨 添加新功能（如：用户评论、购物车）
- 📝 添加新页面
- 🔧 重构代码

**完整步骤：**

```bash
# ──────────────────────────────────────
# 步骤 1：准备工作
# ──────────────────────────────────────
# 确保在dev分支
git checkout dev

# 拉取最新代码（非常重要！）
git pull origin dev
# 为什么？避免你的代码基于旧版本，合并时冲突

# (可选) 创建功能分支
# 如果功能比较复杂，建议单独开分支
git checkout -b feature/comment-system
# 如果是简单改动，直接在dev上开发也行

# ──────────────────────────────────────
# 步骤 2：开始编码
# ──────────────────────────────────────
# 编辑文件...
# 比如：创建 comment-component.js

# 查看改了什么
git status
# 输出：
# modified:   index.html
# new file:   comment-component.js

# (可选) 查看具体改动
git diff comment-component.js

# ──────────────────────────────────────
# 步骤 3：提交代码
# ──────────────────────────────────────
# 添加所有修改
git add .

# 提交（写清楚做了什么）
git commit -m "feat: 添加用户评论功能

- 支持发表评论
- 支持回复功能
- 添加表情支持
- 实现实时刷新"

# 推送到远程
# 如果在dev分支：
git push origin dev

# 如果在feature分支：
git push -u origin feature/comment-system

# ──────────────────────────────────────
# 步骤 4：本地测试
# ──────────────────────────────────────
# 启动开发服务器
pnpm docs:dev

# 在浏览器测试
# 打开 http://localhost:5173
# 确认：评论功能正常、没有bug

# ──────────────────────────────────────
# 步骤 5：代码审查 (如果是团队)
# ──────────────────────────────────────
# 在GitHub上创建 Pull Request
# 请同事审查代码
# 根据反馈修改
# 审查通过后合并

# ──────────────────────────────────────
# 步骤 6：合并到主分支
# ──────────────────────────────────────
# 切换到main分支
git checkout main

# 拉取最新代码
git pull origin main

# 合并dev（或feature）分支
git merge dev
# 或：git merge feature/comment-system

# 推送到main（触发自动部署）
git push origin main

# 切回dev继续开发
git checkout dev

# ──────────────────────────────────────
# 步骤 7：清理 (如果用了feature分支)
# ──────────────────────────────────────
# 删除本地feature分支
git branch -d feature/comment-system

# 删除远程feature分支
git push origin --delete feature/comment-system
```

**流程图：**
```
准备 → 编码 → 提交 → 测试 → 审查 → 合并 → 清理
 ↓      ↓      ↓      ↓      ↓      ↓      ↓
dev   dev   git   本地   PR   main  删除分支
```

---

### 🧪 场景2：本地测试

**为什么需要测试？**

| ❌ 不测试就发布 | ✅ 测试后再发布 |
|--------------|---------------|
| 可能线上崩溃 | 确保功能正常 |
| 用户看到bug | 提前发现问题 |
| 紧急回滚很尴尬 | 从容上线 |

**测试流程：**

```bash
# 1. 启动开发服务器
pnpm docs:dev

# 2. 打开浏览器
# http://localhost:5173

# 3. 测试清单
✅ 功能是否正常工作？
✅ 页面显示是否正确？
✅ 链接是否能点击？
✅ 移动端是否正常？
✅ 控制台有没有报错？

# 4. 测试通过后，准备发布
# Ctrl+C 停止服务器
```

**常见问题：**
- ❌ 页面打不开 → 检查端口是否被占用
- ❌ 样式乱了 → 清除浏览器缓存
- ❌ 报错 → 查看终端错误信息

---

### 👥 场景3：PR 流程（代码审查 + CI/CD）

⚠️ **本项目所有代码合并到 main 都必须通过 PR 流程！**

**什么是 PR（Pull Request）？**

```
PR = 代码变更请求 + 自动检查 + 人工审查

就像发表论文：
1. 投稿（创建 PR）
2. 同行评审（代码审查）
3. 修改完善（根据反馈）
4. 正式发表（合并到 main）
```

**PR 流程的核心价值：**

| ✅ 价值 | 说明 |
|-------|------|
| 🤖 **自动检查** | CI 自动检测构建、链接、提交规范 |
| 👥 **代码审查** | 团队成员审查，发现潜在问题 |
| 📝 **讨论记录** | PR 讨论是最好的文档 |
| 🛡️ **质量保证** | 确保 main 分支的高质量 |
| 📚 **知识共享** | 通过 PR 学习他人经验 |

---

## 🚀 完整的 PR 流程

### 第 1 步：开发并推送到 dev

```bash
# ──────────────────────────────────────
# 1.1 确保在 dev 分支
# ──────────────────────────────────────
git checkout dev

# 拉取最新代码
git pull origin dev

# ──────────────────────────────────────
# 1.2 开发功能
# ──────────────────────────────────────
# ... 编辑文件 ...

# 查看改动
git status
git diff

# ──────────────────────────────────────
# 1.3 提交代码（注意提交信息格式！）
# ──────────────────────────────────────
git add .
git commit -m "feat(AI模块): 添加 Agent Skills 完全章节

- 新增 CrewAI 框架教程
- 新增 AutoGen 框架教程
- 新增 Semantic Kernel 教程
- 添加完整实战项目示例
- 修复章节导航链接

Co-Authored-By: Claude Sonnet <noreply@anthropic.com>"

# ──────────────────────────────────────
# 1.4 推送到远程 dev 分支
# ──────────────────────────────────────
git push origin dev

# 💡 此时已经推送到远程，可以开始创建 PR
```

**提交信息格式要求：**

```bash
# 格式：type(scope): description
#     ↓    ↓        ↓
#    类型  范围    描述

# 允许的类型：
feat   - 新功能
fix    - 修复bug
docs   - 文档更新
style  - 代码格式
refactor - 重构
test   - 测试
chore  - 构建/工具
perf   - 性能优化

# 示例：
feat(用户): 添加登录功能
fix(支付): 修复超时问题
docs(AI): 更新 Agent Skills 章节
refactor(API): 优化请求逻辑
```

---

### 第 2 步：在 GitHub 创建 PR

**方法 A：网页操作（推荐）**

```bash
# ──────────────────────────────────────
# 2.1 打开 GitHub 仓库页面
# ──────────────────────────────────────
# 访问：https://github.com/SimonX0/simonProjectGuide
# 点击 "Pull requests" → "New pull request"

# ──────────────────────────────────────
# 2.2 选择分支
# ──────────────────────────────────────
# base: main ← 目标分支
# compare: dev ← 源分支

# ──────────────────────────────────────
# 2.3 填写 PR 信息
# ──────────────────────────────────────
# 标题（Title）：
# feat(AI模块): 添加 Agent Skills 完全章节

# 描述（Description）模板：
## 📝 变更说明

- 新增了 2026 Agent Skills 完全指南章节
- 包含 CrewAI、AutoGen、Semantic Kernel 教程
- 添加完整的 Multi-Agent 实战项目

## ✅ 变更类型

- [ ] 新功能
- [ ] Bug 修复
- [x] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 🧪 测试清单

- [x] 本地构建通过
- [x] 链接检查无问题
- [x] 导航菜单正确显示
- [ ] 移动端测试（如需要）

## 📸 截图（如需要）

<!-- 添加截图说明 -->

## 🔗 相关 Issue

Closes #123

## ⚠️ 注意事项

- 需要更新 sidebar.ts 和 nav.ts
- 学习路径图需要调整章节编号
```

**方法 B：使用 GitHub CLI（gh 命令）**

```bash
# ──────────────────────────────────────
# 安装 gh CLI（如未安装）
# ──────────────────────────────────────
# macOS: brew install gh
# Windows: scoop install gh
# Linux: sudo apt install gh

# 登录
gh auth login

# ──────────────────────────────────────
# 创建 PR
# ──────────────────────────────────────
gh pr create \
  --base main \
  --head dev \
  --title "feat(AI模块): 添加 Agent Skills 完全章节" \
  --body "## 📝 变更说明

- 新增了 2026 Agent Skills 完全指南章节
- 包含 CrewAI、AutoGen、Semantic Kernel 教程

## ✅ 测试清单

- [x] 本地构建通过
- [x] 链接检查无问题

Closes #123"
```

---

### 第 3 步：🤖 CI 自动检查

**PR 创建后，GitHub Actions 会自动运行检查：**

```yaml
📋 CI 检查项目
├─ ✅ 构建检查
│   └─ pnpm docs:build 必须通过
│
├─ ✅ 链接检查
│   └─ 检查文档链接完整性
│
├─ ✅ 提交信息检查
│   └─ 提交信息符合规范格式
│
├─ ✅ 文件变更检查
│   ├─ 无敏感文件（.env、密钥等）
│   └─ 无超大文件（> 5MB）
│
└─ ✅ PR 标题检查
    └─ 标题符合提交规范
```

**查看 CI 检查结果：**

```bash
# ──────────────────────────────────────
# 在 GitHub PR 页面查看
# ──────────────────────────────────────
# PR 页面底部会显示所有检查的状态：
# ✅ All checks have passed

# 如果检查失败：
# ❌ Build failed
# 点击 "Details" 查看具体错误
```

**CI 检查失败的常见原因：**

| 错误 | 原因 | 解决方法 |
|------|------|---------|
| ❌ 构建失败 | 代码有语法错误 | 本地运行 `pnpm docs:build` 检查 |
| ❌ 提交信息格式错误 | 不符合 `type(scope): description` | 修改提交信息：`git commit --amend` |
| ❌ 敏感文件 | 提交了 .env 等文件 | 从 Git 中删除并添加到 .gitignore |

---

### 第 4 步：👥 代码审查（Code Review）

**请求审查：**

```bash
# ──────────────────────────────────────
# 在 PR 页面右侧
# ──────────────────────────────────────
# 1. 点击 "Reviewers"
# 2. 选择审查者（@mention 他们）
# 3. 审查者会收到通知
```

**审查者检查清单：**

```markdown
## 📋 审查清单

### 代码质量
- [ ] 代码逻辑清晰
- [ ] 没有明显的 bug
- [ ] 符合项目规范
- [ ] 命名清晰准确

### 功能完整性
- [ ] 功能完整实现
- [ ] 边界情况处理
- [ ] 错误处理完善

### 文档
- [ ] 注释充分
- [ ] README/文档已更新
- [ ] 变更说明清晰

### 测试
- [ ] 包含必要的测试
- [ ] 测试覆盖主要场景
```

**审查意见示例：**

```markdown
## 🔍 审查意见

### 总体评价
代码整体质量很好，有几个小建议：

### 建议
1. **第 500 行**：这个逻辑有点复杂，能否拆分成多个函数？
2. **变量命名**：`temp` 可以改成更具描述性的名字
3. **错误处理**：建议添加 try-catch 包裹

### 问题
无严重问题 ✅

### 结论
✅ Approve（批准合并）
```

---

### 第 5 步：根据反馈修改

**如果审查者提出修改意见：**

```bash
# ──────────────────────────────────────
# 5.1 在 dev 分支修改代码
# ──────────────────────────────────────
git checkout dev

# ... 修改代码 ...

# ──────────────────────────────────────
# 5.2 提交修改
# ──────────────────────────────────────
git add .
git commit -m "fix: 根据审查建议优化代码

- 简化 500 行的逻辑
- 改进变量命名
- 添加错误处理

Co-Authored-By: 审查者 <reviewer@example.com>"

# ──────────────────────────────────────
# 5.3 推送到 dev（PR 自动更新）
# ──────────────────────────────────────
git push origin dev

# 💡 PR 会自动显示新的提交，CI 会重新运行
```

**回复审查意见：**

```markdown
@reviewer 已根据建议修改：

- ✅ 简化了 500 行的逻辑，拆分为 3 个函数
- ✅ 将 `temp` 改为 `userSessionData`
- ✅ 添加了 try-catch 错误处理

请再次审查，谢谢！
```

---

### 第 6 步：合并 PR 到 main

**当所有检查通过且审查批准后：**

```bash
# ──────────────────────────────────────
# 6.1 在 GitHub PR 页面
# ──────────────────────────────────────
# 确认：
# ✅ All checks have passed
# ✅ Approved（至少 1 个审查者批准）

# 点击 "Merge pull request"
# 选择合并方式：
# - Merge commit（创建合并提交）← 推荐
# - Squash merge（压缩提交）
# - Rebase merge（变基合并）

# 点击 "Confirm merge"
```

**合并后自动发生：**

```
1. ✅ PR 状态变为 "Merged"
2. ✅ 代码自动合并到 main 分支
3. ✅ GitHub Actions 自动触发部署
4. ✅ 网站自动更新到 GitHub Pages
5. ✅ PR 自动关闭
```

---

### 第 7 步：同步回 dev 分支

**合并完成后，同步 main 到 dev：**

```bash
# ──────────────────────────────────────
# 7.1 切换到 dev 分支
# ──────────────────────────────────────
git checkout dev

# ──────────────────────────────────────
# 7.2 拉取最新 main
# ──────────────────────────────────────
git pull origin main

# 💡 为什么需要这一步？
# - main 可能包含了其他 PR 的合并
# - dev 需要保持和 main 同步
# - 避免下次合并时产生冲突

# ──────────────────────────────────────
# 7.3 推送到远程 dev（可选）
# ──────────────────────────────────────
git push origin dev
```

---

## 📊 PR 流程完整时间线

```
Day 1 - 上午 (开发)
├─ 09:00  git checkout dev
├─ 09:05  编写代码
├─ 11:00  本地测试
├─ 11:30  git commit -m "feat: xxx"
└─ 11:35  git push origin dev

Day 1 - 下午 (创建 PR)
├─ 14:00  在 GitHub 创建 PR
├─ 14:05  CI 自动检查开始
├─ 14:10  ✅ 所有检查通过
├─ 14:15  请求 @reviewer1 审查
└─ 14:30  等待审查...

Day 2 - 上午 (审查反馈)
├─ 09:00  @reviewer1 提出修改意见
├─ 09:30  根据反馈修改代码
├─ 10:00  git commit -m "fix: 优化代码"
├─ 10:05  git push origin dev
├─ 10:10  CI 重新检查
├─ 10:15  ✅ 检查通过
└─ 10:20  @reviewer1 批准 PR

Day 2 - 下午 (合并)
├─ 14:00  在 GitHub 合并 PR
├─ 14:01  自动部署开始
├─ 14:05  ✅ 部署成功，网站更新
├─ 14:10  同步 main 到 dev
└─ 14:15  流程完成！✅
```

---

## 🎯 PR 最佳实践

### 1. 保持 PR 小而专注

| ✅ 好的 PR | ❌ 不好的 PR |
|-----------|-------------|
| 1 个功能点 | 10 个功能点 |
| 200 行代码 | 2000 行代码 |
| 1 天能审查 | 需要 1 周审查 |
| 标题清晰 | 标题太笼统 |

**示例：**

```bash
# ✅ 好的 PR
feat(登录): 添加邮箱验证功能
- 200 行代码
- 1 个文件
- 功能清晰

# ❌ 不好的 PR
feat: 完成用户系统
- 2000 行代码
- 20 个文件
- 包含登录、注册、密码重置、个人资料...
```

### 2. PR 标题和描述模板

**PR 标题格式：**

```bash
type(scope): 简短描述

# 示例：
feat(AI模块): 添加 Agent Skills 章节
fix(导航): 修复移动端菜单无法展开的问题
docs(使用指南): 更新安装步骤
```

**PR 描述模板：**

```markdown
## 📝 变更说明

简要描述这个 PR 做了什么。

## ✅ 变更类型

- [ ] 新功能 (feature)
- [ ] Bug 修复 (bugfix)
- [x] 文档更新 (documentation)
- [ ] 代码重构 (refactor)
- [ ] 性能优化 (performance)
- [ ] 测试 (test)

## 🔄 变更内容

- 添加了 xxx 功能
- 修复了 xxx 问题
- 更新了 xxx 文档

## 🧪 测试清单

- [x] 本地测试通过
- [x] 构建成功
- [x] 链接检查通过
- [ ] 单元测试通过（如有）
- [ ] 手动测试（如有需要）

## 📸 截图/演示

<!-- 添加截图、GIF 或演示视频 -->

## 🔗 相关 Issue

Closes #123
Related to #456

## ⚠️ 注意事项

<!-- 需要特别注意的事项 -->

## 💬 其他

<!-- 其他需要说明的内容 -->
```

### 3. CI 检查失败的快速修复

```bash
# ──────────────────────────────────────
# 场景：CI 检查失败
# ──────────────────────────────────────
# 1. 查看 CI 日志，找到失败原因

# 2. 在 dev 分支修复
git checkout dev
# ... 修复代码 ...

# 3. 如果需要修改提交信息
git commit --amend -m "feat(正确格式): 修正后的提交信息"

# 4. 强制推送（因为修改了已提交的内容）
git push origin dev --force

# 💡 PR 会自动更新，CI 会重新运行
```

### 4. 处理合并冲突

```bash
# ──────────────────────────────────────
# 场景：PR 合并时出现冲突
# ──────────────────────────────────────
# 1. 在 dev 分支同步最新的 main
git checkout dev
git pull origin main

# 2. 解决冲突
# ... 手动编辑冲突文件 ...

# 3. 提交修复
git add .
git commit -m "chore: 解决合并冲突"

# 4. 推送
git push origin dev

# 💡 PR 会自动更新，冲突解决
```

---

## 🔧 常用 PR 命令速查

```bash
# ──────────────────────────────────────
# GitHub CLI (gh) 命令
# ──────────────────────────────────────
# 查看 PR 列表
gh pr list

# 查看特定 PR
gh pr view 123

# 创建 PR
gh pr create --base main --head dev

# 检查 PR 状态
gh pr checks 123

# 合并 PR
gh pr merge 123

# 关闭 PR
gh pr close 123

# 添加审查者
gh pr edit 123 --add-reviewer username

# 添加标签
gh pr edit 123 --add-label "enhancement"

# ──────────────────────────────────────
# Git 命令
# ──────────────────────────────────────
# 查看远程分支
git branch -r

# 查看本地和远程分支差异
git log origin/main..origin/dev

# 同步远程更新
git fetch origin

# 查看 PR 的提交
git log origin/main..HEAD --oneline
```

---

## 📚 PR 流程的好处

| ✅ 好处 | 具体体现 |
|-------|---------|
| 🤖 **自动化** | CI 自动检查，减少人工 |
| 👥 **协作** | 团队成员互相审查 |
| 📝 **文档** | PR 讨论就是最佳文档 |
| 🛡️ **质量** | 确保 main 分支稳定 |
| 📚 **学习** | 通过 PR 学习他人经验 |
| 🔄 **安全** | 出问题可以立即回滚 |

---

### 🚀 场景4：发布到生产环境

**什么时候发布？**
- ✅ 本地测试通过
- ✅ 代码审查通过（如果需要）
- ✅ 确认没有问题

**发布流程：**

```bash
# ──────────────────────────────────────
# 步骤 1：切换到main分支
# ──────────────────────────────────────
git checkout main
# 为什么？main才是生产环境

# ──────────────────────────────────────
# 步骤 2：拉取最新代码
# ──────────────────────────────────────
git pull origin main
# 为什么？确保本地是最新的

# ──────────────────────────────────────
# 步骤 3：合并dev分支
# ──────────────────────────────────────
git merge dev
# 如果有冲突，先解决冲突

# ──────────────────────────────────────
# 步骤 4：推送到远程（触发部署）
# ──────────────────────────────────────
git push origin main
# ↑ 这一步会触发自动部署

# 等待几分钟，部署完成后：
# - 网站自动更新
# - 用户看到新功能

# ──────────────────────────────────────
# 步骤 5：切回dev继续开发
# ──────────────────────────────────────
git checkout dev
# 为什么？不要在main上开发
```

**发布检查清单：**
```
发布前检查：
✅ 本地测试通过
✅ 代码已合并到main
✅ 没有遗留的console.log
✅ 敏感信息已移除（密码、密钥）
✅ README已更新（如果需要）

发布后验证：
✅ 线上网站能访问
✅ 新功能正常工作
✅ 旧功能没有坏
✅ 没有报错（查看浏览器控制台）
```

---

## 常见场景

### 🚨 场景1：修复线上紧急问题

**场景：凌晨2点，网站崩溃了！**

```
紧急程度：🔴🔴🔴🔴🔴
用户反馈：网站打不开！
检查日志：发现是代码bug
紧急程度：每分钟都在损失用户！
```

**为什么需要特殊流程？**

| 正常流程 | 紧急修复流程 |
|---------|------------|
| dev → 测试 → main | main → 立即修复 |
| 花费1-2天 | 花费10-30分钟 |
| 适合计划内功能 | 适合紧急情况 |

**修复流程：**

```bash
# ──────────────────────────────────────
# 步骤 1：立即切换到main分支
# ──────────────────────────────────────
git checkout main
git pull origin main
# 确保拿到最新的生产代码

# ──────────────────────────────────────
# 步骤 2：创建紧急修复分支
# ──────────────────────────────────────
git checkout -b hotfix/login-crash
# 命名规范：hotfix/问题描述

# ──────────────────────────────────────
# 步骤 3：快速定位并修复问题
# ──────────────────────────────────────
# 查看错误日志
# 浏览器控制台、服务器日志

# 定位问题
# 比如：login.js 第50行，未检查空值

// 错误代码：
const user = getUser();
console.log(user.name);  // user可能是null，崩溃！

// 修复代码：
const user = getUser();
if (user) {
  console.log(user.name);  // 安全！
}

# 提交修复
git add login.js
git commit -m "hotfix: 修复登录页面崩溃问题

问题：未检查user对象是否存在
影响：用户无法登录
修复：添加空值检查
紧急程度：高"

# 推送到远程
git push -u origin hotfix/login-crash

# ──────────────────────────────────────
# 步骤 4：紧急发布到生产
# ──────────────────────────────────────
# 合并到main（立即！）
git checkout main
git merge hotfix/login-crash

# 打标签（记录这次修复）
git tag -a v1.0.1 -m "紧急修复登录崩溃"

# 推送到main（触发自动部署）
git push origin main --tags

# 💃 网站恢复了！

# ──────────────────────────────────────
# 步骤 5：同步修复到dev
# ──────────────────────────────────────
# 为什么？避免下次发布又出现这个问题
git checkout dev
git merge hotfix/login-crash
git push origin dev

# ──────────────────────────────────────
# 步骤 6：清理
# ──────────────────────────────────────
git branch -d hotfix/login-crash
git push origin --delete hotfix/login-crash
```

**时间线：**
```
00:00  发现问题
00:02  切换到main，创建hotfix分支
00:05  定位问题，修复代码
00:07  推送到远程
00:08  合并到main，触发部署
00:10  部署完成，问题解决！
00:12  同步到dev，清理分支
```

---

### 🔄 场景2：放弃本地修改

**场景：改错了，想重来**

```bash
# ──────────────────────────────────────
# 情况 1：只是修改了文件，还没add
# ──────────────────────────────────────
# 比如：编辑了 README.md，但改乱了

# 放弃单个文件的修改
git restore README.md
# 文件回到最近一次提交的状态

# 放弃所有修改
git restore .
# 所有文件都回到最近一次提交的状态

# 💡 生活比喻：
# 就像Word文档的"放弃所有修改"

# ──────────────────────────────────────
# 情况 2：已经add，但还没commit
# ──────────────────────────────────────
# 比如：git add . 后发现加错了

# 取消暂存
git reset HEAD README.md
# 文件从暂存区移除，但修改保留

# 如果要放弃修改：
git restore README.md

# ──────────────────────────────────────
# 情况 3：已经commit，但还没push
# ──────────────────────────────────────
# 比如：提交了，但发现代码有问题

# 回退到上一个提交（保留代码修改）
git reset --soft HEAD~1
# 提交撤销，代码还在，可以重新修改

# 回退到上一个提交（丢弃代码修改）
git reset --hard HEAD~1
# 提交撤销，代码也回到之前
# ⚠️ 谨慎使用！代码找不回来！

# ──────────────────────────────────────
# 情况 4：已经push（危险！）
# ──────────────────────────────────────
# 已经推送到远程，不能简单reset
# 需要 revert（创建新提交来撤销）

# 创建一个新提交来撤销之前的提交
git revert abc1234

# 💡 记忆技巧：
# restore  → 恢复文件（未提交）
# reset    → 回退提交（未推送）
# revert   → 撤销提交（已推送）
```

**何时使用哪个？**

| 命令 | 使用场景 | 危险程度 |
|------|---------|---------|
| `git restore file.txt` | 改错文件，想撤销 | ✅ 安全 |
| `git reset --soft HEAD~1` | 提交信息写错了 | ⚠️ 中等 |
| `git reset --hard HEAD~1` | 想回到之前版本 | 🔴 危险 |
| `git revert abc1234` | 已推送，想撤销 | ⚠️ 中等 |

---

### 🔄 场景3：同步远程更新

**场景：同事推送了代码，你需要同步**

```
你的本地：A → B → C (落后了)
远程仓库：A → B → C → D → E (更新了)
         ↑ 需要拉取 D 和 E
```

**为什么需要同步？**

| ❌ 不同步 | ✅ 同步后 |
|---------|---------|
| 代码过时 | 代码最新 |
| 合并时冲突多 | 合并时冲突少 |
| 可能重复工作 | 看到别人最新进展 |

**同步流程：**

```bash
# ──────────────────────────────────────
# 方法 1：pull (推荐新手)
# ──────────────────────────────────────
# 1. 拉取远程最新代码
git pull origin dev

# 如果有冲突，Git会自动合并
# 如果冲突无法自动解决，需要手动解决

# 💡 pull = fetch + merge
# fetch：下载远程代码
# merge：合并到本地

# ──────────────────────────────────────
# 方法 2：fetch + merge (更清晰)
# ──────────────────────────────────────
# 1. 下载远程代码（不合并）
git fetch origin

# 2. 查看有什么更新
git log HEAD..origin/dev
# 显示远程有哪些新提交

# 3. 手动合并
git merge origin/dev

# 💡 好处：可以先看看改了什么，再决定是否合并

# ──────────────────────────────────────
# 方法 3：fetch + rebase (保持历史整洁)
# ──────────────────────────────────────
# 1. 下载远程代码
git fetch origin

# 2. 变基（把你的提交放到最新代码之后）
git rebase origin/dev

# 💡 好处：历史记录是线性的，很清晰
# ⚠️ 注意：不要对已推送的提交使用
```

**三种方法对比：**

| 方法 | 优点 | 缺点 | 推荐场景 |
|------|------|------|---------|
| `git pull` | 简单，一步到位 | 不清楚发生了什么 | 新手、日常使用 |
| `fetch + merge` | 清晰，可控制 | 多两步操作 | 想先看更新内容 |
| `fetch + rebase` | 历史整洁 | 可能产生冲突 | 个人项目、小分支 |

**最佳实践：**
```bash
# 每天开始工作前
git checkout dev
git pull origin dev

# 合并分支前
git checkout main
git pull origin main
git merge dev
```

---

## 提交规范

### 为什么需要提交规范？

**就像给文件起名，要一眼看出内容**

```bash
# ❌ 不好的提交信息
git commit -m "修改"
git commit -m "update"
git commit -m "fix bug"
git commit -m "123"
# 问题：不知道改了什么、为什么改

# ✅ 好的提交信息
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复导航栏在移动端的显示问题"
git commit -m "docs: 更新Git工作流程说明"
# 好处：一目了然，方便查找和回滚
```

### 提交信息格式

**标准格式：类型(范围): 描述**

```bash
# 格式说明
类型(范围): 简短描述
  ↓      ↓      ↓
什么改了 哪部分 具体内容

# 实际示例
feat(用户): 添加登录功能
fix(导航): 修复导航栏显示错误
docs(首页): 更新README文档
```

**7种常用类型：**

| 类型 | 说明 | 示例 | 何时使用 |
|------|------|------|---------|
| 🎯 `feat` | 新功能 | `feat(用户): 添加头像上传` | 添加新功能 |
| 🐛 `fix` | 修复bug | `fix(登录): 修复验证错误` | 修复问题 |
| 📚 `docs` | 文档更新 | `docs(安装): 更新安装步骤` | 改文档 |
| 🎨 `style` | 代码格式 | `style(组件): 统一代码风格` | 格式调整 |
| 🔧 `refactor` | 重构 | `refactor(API): 优化请求逻辑` | 优化代码 |
| 🧪 `test` | 测试 | `test(工具): 添加单元测试` | 添加测试 |
| 📦 `chore` | 构建/工具 | `chore(deps): 更新依赖版本` | 配置文件 |

### 提交信息对比

| ✅ 好的提交 | ❌ 不好的提交 | 原因 |
|-----------|-------------|------|
| `feat: 添加用户登录功能` | `修改` | 太笼统 |
| `fix: 修复支付超时问题` | `fix bug` | 不清楚是什么bug |
| `docs: 更新README说明` | `update` | 看不出改了什么 |
| `refactor(api): 优化请求逻辑` | `优化代码` | 不知道优化了哪部分 |
| `style: 统一换行符为LF` | `格式调整` | 不知道具体改了什么 |

### 完整的提交信息示例

**简单提交：**
```bash
git commit -m "feat: 添加用户登录功能"
```

**详细提交（带正文）：**
```bash
git commit -m "feat: 添加用户登录功能

- 添加登录表单
- 实现邮箱/密码验证
- 添加记住密码功能
- 支持第三方登录

Closes #123"
```

**什么时候写详细描述？**
| 简单提交 | 详细提交 |
|---------|---------|
| 改动小 | 改动大 |
| 一目了然 | 需要解释 |
| 1个文件 | 多个文件 |
| 修改 | 新功能 |

### 提交频率建议

**就像存游戏，经常存档比较好**

| ❌ 不推荐 | ✅ 推荐 | 原因 |
|---------|--------|------|
| 一天一次提交 | 完成一个功能就提交 | 容易回滚 |
| 改了100个文件才提交 | 拆分成多个小提交 | 好定位问题 |
| 提交信息写"更新" | 每次提交写清楚做了什么 | 方便查找 |

**推荐的提交节奏：**
```bash
# 早上
git commit -m "feat: 添加登录表单"

# 中午
git commit -m "feat: 添加表单验证"

# 下午
git commit -m "feat: 添加错误处理"

# 晚上
git commit -m "feat: 添加登录成功跳转"

# 比一次提交"完成登录功能"好得多！
```

### 常见错误

**❌ 错误1：提交信息太笼统**
```bash
git commit -m "修改"  # 不好！
git commit -m "update"  # 不好！
```

**❌ 错误2：一次提交太多内容**
```bash
# 改了登录、注册、购物车、支付，一次性提交
git commit -m "完成多个功能"  # 不好！
```

**❌ 错误3：提交信息包含敏感信息**
```bash
git commit -m "fix: 移除密码=123456"  # 危险！密码泄露了！
```

**✅ 正确做法：**
```bash
# 1. 提交信息要具体
git commit -m "feat(登录): 添加密码强度检测"

# 2. 分批次提交
git commit -m "feat(登录): 添加登录表单"
git commit -m "feat(注册): 添加注册表单"
git commit -m "feat(购物车): 添加商品数量修改"

# 3. 检查是否有敏感信息
git diff  # 提交前检查！
```

---

## 最佳实践

### 1. 频繁提交，小步快跑

**为什么？就像存游戏，经常存档比较安全**

| ❌ 不推荐 | ✅ 推荐 | 原因 |
|---------|--------|------|
| 写完整个功能才提交 | 每个小功能点都提交 | 出问题容易定位 |
| 一次提交10个文件 | 拆分成多个提交 | 回滚方便 |
| 一天提交一次 | 完成一部分就提交 | 不会丢失进度 |

**实际对比：**

```bash
# ❌ 不好的做法
# 工作了8小时，改了20个文件，一次性提交
git commit -m "完成用户系统"
# 问题：如果有bug，很难定位是哪个改动引起的

# ✅ 好的做法
# 每完成一个小功能就提交
git commit -m "feat(用户): 添加登录表单"
git commit -m "feat(用户): 添加表单验证"
git commit -m "feat(用户): 添加错误提示"
git commit -m "feat(用户): 添加登录跳转"
# 好处：如果有问题，很容易定位到是哪一步出错的
```

**推荐的提交节奏：**
```
完成一个小功能 → 立即提交 → 继续下一个
    ↓              ↓            ↓
  30分钟         1分钟        继续工作
```

---

### 2. 推送前检查清单

**就像考试前检查试卷，避免低级错误**

```bash
# ──────────────────────────────────────
# 检查 1：查看当前状态
# ──────────────────────────────────────
git status
# 确认：
# ✓ 在正确的分支上
# ✓ 没有忘记添加的文件
# ✓ 没有不应该提交的文件

# ──────────────────────────────────────
# 检查 2：查看即将提交的内容
# ──────────────────────────────────────
git diff --staged
# 检查：
# ✓ 改动都是你想要的
# ✓ 没有敏感信息（密码、密钥）
# ✓ 没有调试代码（console.log）

# ──────────────────────────────────────
# 检查 3：查看提交历史
# ──────────────────────────────────────
git log --oneline -3
# 确认：
# ✓ 提交信息写得清楚
# ✓ 没有错误的提交
# ✓ 提交顺序合理

# ──────────────────────────────────────
# 检查 4：本地测试（如果需要）
# ──────────────────────────────────────
pnpm docs:dev
# 确认：
# ✓ 功能正常
# ✓ 没有报错

# ──────────────────────────────────────
# 最后：确认无误后推送
# ──────────────────────────────────────
git push
```

**常见错误检查：**

| ❌ 可能的错误 | ✅ 如何避免 |
|-------------|-----------|
| 提交了敏感信息 | `git diff` 检查 |
| 提交了调试代码 | 搜索 `console.log` |
| 提交信息写错 | `git commit --amend` 修改 |
| 推错分支 | `git status` 确认分支 |

---

### 3. 保持分支整洁

**就像定期打扫房间，保持清爽**

```bash
# ──────────────────────────────────────
# 习惯 1：定期同步主分支
# ──────────────────────────────────────
# 每天早上第一件事
git checkout dev
git pull origin main

# 好处：
# ✓ 代码保持最新
# ✓ 减少合并冲突
# ✓ 看到别人的最新进展

# ──────────────────────────────────────
# 习惯 2：及时删除已完成分支
# ──────────────────────────────────────
# 合并完成后，立即删除
git branch -d feature/xxx
git push origin --delete feature/xxx

# 好处：
# ✓ 分支列表清爽
# ✓ 避免误用旧分支
# ✓ 节省空间

# ──────────────────────────────────────
# 习惯 3：使用 rebase 保持历史整洁
# ──────────────────────────────────────
# 定期整理提交历史
git rebase -i HEAD~5
# 可以：
# - 合并多个提交
# - 修改提交信息
# - 删除错误提交

# ⚠️ 注意：只对自己未推送的分支做rebase
```

**分支健康度检查：**
```bash
# 查看所有分支
git branch -a

# 删除已合并的本地分支
git branch -d $(git branch --merged)

# 删除已合并的远程分支
git remote prune origin

# 查看哪些分支未合并
git branch --no-merged
```

---

### 4. 使用 .gitignore

**就像告诉收垃圾的人：这些不要扔**

```bash
# ──────────────────────────────────────
# 常见的 .gitignore 配置
# ──────────────────────────────────────

# 依赖包（node_modules等）
node_modules/
vendor/

# 构建产物
dist/
build/
*.min.js

# 系统文件
.DS_Store
Thumbs.db

# 日志文件
*.log
npm-debug.log*

# 环境变量（很重要！）
.env
.env.local
.env.*.local

# IDE配置
.vscode/
.idea/
*.swp
*.swo

# 临时文件
*.tmp
*.temp
```

**为什么需要 .gitignore？**

| ❌ 不使用 .gitignore | ✅ 使用 .gitignore |
|-------------------|------------------|
| 仓库巨大，下载慢 | 仓库小，下载快 |
| 提交变慢 | 提交快 |
| 可能泄露密钥 | 保护敏感信息 |
| 合并频繁冲突 | 减少冲突 |

**检查是否有不该提交的文件：**
```bash
# 查看未被跟踪的文件
git status

# 查看 .gitignore 生效情况
git check-ignore -v node_modules/

# 临时忽略某个文件
git update-index --assume-unchanged config.js
```

#### 🔍 .gitignore 语法详解

**基础语法：**

```bash
# ──────────────────────────────────────
# .gitignore 语法规则
# ──────────────────────────────────────

# 1. 注释（以 # 开头）
# 这是注释，Git会忽略

# 2. 匹配所有目录或文件
*.log           # 忽略所有 .log 文件
*.tmp           # 忽略所有 .tmp 文件

# 3. 匹配目录（以 / 结尾）
node_modules/   # 忽略 node_modules 目录
logs/          # 忽略 logs 目录

# 4. 匹配具体文件
config.ini      # 忽略 config.ini 文件
.env.local      # 忽略 .env.local 文件

# 5. 否定规则（! 开头，不要忽略）
*.log
!important.log # 不要忽略 important.log

# 6. 目录匹配
/build/         # 忽略根目录下的 build 目录
**/temp/        # 忽略所有 temp 目录

# 7. 通配符详解
*              # 匹配任意字符
?              # 匹配单个字符
**             # 匹配任意多级目录
abc            # 匹配 abc 目录
[abc]          # 匹配 a、b 或 c
[!abc]         # 不匹配 a、b 或 c
```

#### 📦 常见项目 .gitignore 模板

**Python 项目：**
```bash
# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# PyInstaller
*.manifest
*.spec

# Unit test / coverage reports
htmlcov/
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
.pytest_cache/

# Translations
*.mo
*.pot

# Django stuff:
*.log
local_settings.py
db.sqlite3

# Flask stuff:
instance/
.webassets-cache

# Scrapy stuff:
.scrapy

# Sphinx documentation
docs/_build/

# PyBuilder
target/

# Jupyter Notebook
.ipynb_checkpoints

# pyenv
.python-version

# celery beat schedule file
celerybeat-schedule

# SageMath parsed files
*.sage.py

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# Spyder project settings
.spyderproject
.spyproject

# Rope project settings
.ropeproject

# mkdocs documentation
/site

# mypy
.mypy_cache/
.dmypy.json
dmypy.json

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

**Node.js / Vue 项目：**
```bash
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
dist/
dist-ssr/
*.tgz

# Local env files
.env
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/snippets/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS files
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Vite
.vitepress/cache/
.vitepress/dist/

# Temporary files
*.tmp
*.temp
*.log
```

**Java 项目：**
```bash
# Compiled class file
*.class

# Log file
*.log

# Package Files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties

# Gradle
.gradle
build/
!gradle-wrapper.jar
!**/src/main/**/build/
!**/src/test/**/build/

# IDE
.idea/
*.iws
*.iml
*.ipr
.vscode/

# OS
.DS_Store
Thumbs.db

# Spring Boot
spring-boot-starter/
```

**通用 Web 项目：**
```bash
# Dependencies
node_modules/
vendor/
bower_components/

# Build outputs
dist/
build/
out/
*.min.js
*.min.css

# Environment files
.env
.env.local
.env.*.local
*.key
*.pem

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/
.nyc_output/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/
```

#### 🛠️ 实战案例：创建完整的 .gitignore

**场景1：初始化新项目时**

```bash
# 1. 创建项目目录
mkdir my-project
cd my-project

# 2. 初始化 Git 仓库
git init

# 3. 创建 .gitignore 文件
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Build output
dist/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
EOF

# 4. 查看状态
git status

# 5. 添加文件
git add .

# 6. 提交
git commit -m "feat: 初始化项目"
```

**场景2：已经提交了不该提交的文件**

```bash
# 问题：不小心提交了 node_modules/
git add .
git commit -m "feat: 添加功能"

# 解决方法：
# 1. 从 Git 中删除，但保留本地文件
git rm -r --cached node_modules/

# 2. 添加到 .gitignore
echo "node_modules/" >> .gitignore

# 3. 提交修改
git add .gitignore
git commit -m "chore: 添加 .gitignore，移除 node_modules"

# 4. 推送到远程
git push origin main
```

**场景3：特殊文件的忽略**

```bash
# ──────────────────────────────────────
# 特殊情况处理
# ──────────────────────────────────────

# 1. 忽略所有 .log 文件，但除了 important.log
*.log
!important.log

# 2. 忽略所有 build 目录，但除了 src/build
build/
!/src/build

# 3. 只忽略根目录下的 config.ini
/config.ini

# 4. 忽略所有目录下的 test.txt
**/test.txt

# 5. 忽略 doc 目录及其子目录的所有 pdf 文件
doc/**/*.pdf

# 6. 忽略以 .a 结尾的文件
*.a

# 7. 但是不忽略 lib.a
!lib.a
```

#### ⚠️ 常见问题和解决方案

**问题1：.gitignore 不生效**

**症状**：文件已经在 .gitignore 中，但 Git 还是跟踪它

**原因**：文件已经被 Git 跟踪了

**解决方法**：
```bash
# 1. 从 Git 索引中删除文件（保留本地）
git rm -r --cached node_modules/

# 2. 提交删除
git commit -m "chore: 移除已跟踪的 node_modules"

# 3. 推送
git push
```

**问题2：如何查看文件是否被忽略**

```bash
# 检查单个文件
git check-ignore -v node_modules/

# 检查多个文件
git check-ignore -v *.log

# 查看所有被忽略的文件
git ls-files --others --ignored --exclude-standard
```

**问题3：如何调试 .gitignore**

```bash
# 查看哪个规则导致文件被忽略
git check-ignore -v config.js

# 输出示例：
# config.js          .gitignore:2:*.js       <- 第2行的 *.js 规则
# config.js          .gitignore:5:config.js   <- 第5行的 config.js 规则
```

**问题4：.gitignore 对已提交的文件无效**

**原因**：.gitignore 只对未跟踪的文件生效

**解决方法**：
```bash
# 方法1：从 Git 删除但保留本地
git rm --cached filename

# 方法2：批量删除
git rm -r --cached directory/

# 方法3：从历史记录中完全删除（危险！）
git filter-branch --tree-filter 'rm -f filename' HEAD
```

**问题5：如何全局配置 .gitignore**

```bash
# 为所有项目配置全局 .gitignore
git config --global core.excludesfile ~/.gitignore_global

# 编辑全局忽略文件
echo ".DS_Store" >> ~/.gitignore_global
echo "Thumbs.db" >> ~/.gitignore_global
echo "*.log" >> ~/.gitignore_global
```

**问题6：如何忽略已修改但未提交的文件**

```bash
# 临时忽略本地修改
git update-index --assume-unchanged config.js

# 恢复跟踪
git update-index --no-assume-unchanged config.js
```

**问题7：如何忽略空目录**

Git 默认会忽略空目录，如果需要跟踪空目录：

```bash
# 在目录中创建 .gitkeep 文件
mkdir empty-dir
touch empty-dir/.gitkeep

# .gitignore 中可以添加
!.gitkeep
```

#### 📚 最佳实践建议

1. **项目初始化时就创建 .gitignore**
   - 在第一次 commit 之前创建
   - 避免提交不该提交的文件

2. **使用模板生成器**
   - 访问：https://gitignore.io/
   - 输入项目类型（Python、Node、Vue等）
   - 自动生成完整的 .gitignore

3. **定期检查仓库大小**
   ```bash
   # 查看仓库大小
   du -sh .git

   # 查看大文件
   git rev-list --objects --all |
     git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' |
     awk '/^blob/ {print substr($0,6)}' |
     sort -n -k2 -r |
     head -10
   ```

4. **敏感文件检查清单**
   - [ ] .env 和环境变量
   - [ ] 密钥文件（*.key, *.pem）
   - [ ] 数据库备份
   - [ ] 日志文件
   - [ ] 临时文件
   - [ ] IDE 配置
   - [ ] 操作系统文件

5. **团队协作建议**
   - 将 .gitignore 纳入项目模板
   - 在 README 中说明项目需要的 .gitignore 规则
   - 使用 pre-commit hook 检查敏感文件

#### 🎯 实战练习

**练习1：创建 Vue 项目的 .gitignore**

```bash
# 任务：创建一个完整的 Vue3 项目 .gitignore
# 要求：包含以下内容
# - 依赖包
# - 构建产物
# - 环境变量
# - IDE配置
# - 日志文件
# - 临时文件

# 期望输出：
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Build output
dist/
dist-ssr/

# Local env files
.env
.env.local
.env.*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# VitePress cache
.vitepress/cache/

# Temporary files
*.tmp
*.temp
EOF
```

**练习2：清理已提交的敏感文件**

```bash
# 场景：不小心提交了 .env 文件
# 任务：从历史记录中完全删除

# 步骤1：从当前分支删除
git rm --cached .env

# 步骤2：添加到 .gitignore
echo ".env" >> .gitignore

# 步骤3：提交删除
git add .gitignore
git commit -m "chore: 移除敏感文件 .env"

# 步骤4：从历史记录中删除（使用 filter-branch）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 步骤5：强制推送（警告：会重写历史）
git push origin --force --all

# 步骤6：让所有团队成员重新克隆
# 通知团队成员：
# ⚠️ 仓库历史已修改，请重新克隆：
# git clone https://github.com/xxx/project.git
```

**练习3：创建多项目 .gitignore**

```bash
# 场景：Monorepo 项目，包含前端、后端、移动端
# 任务：为不同子项目创建不同的 .gitignore

# 项目结构：
# /monorepo
#   /frontend (Vue)
#   /backend (Python Flask)
#   /mobile (React Native)

# 根目录 .gitignore：
cat > .gitignore << 'EOF'
# Monorepo .gitignore

# 共同忽略
*.log
*.tmp
.DS_Store
Thumbs.db

# 前端
/frontend/node_modules/
/frontend/dist/
/frontend/.env

# 后端
/backend/__pycache__/
/backend/*.py[cod]
/backend/.env
/backend/venv/

# 移动端
/mobile/node_modules/
/mobile/build/
/mobile/.env
EOF

# 或者在每个子目录单独配置
# frontend/.gitignore
# backend/.gitignore
# mobile/.gitignore
```

---

### 5. 分支管理规范

**团队协作时的黄金法则**

**分支命名规范：**
```bash
# ✅ 好的命名
feature/user-login        # 一目了然
fix/payment-timeout       # 知道是修什么
hotfix/critical-bug       # 知道很紧急

# ❌ 不好的命名
new-branch                # 太笼统
abc                       # 完全不知道干嘛
dev2                      # 容易混淆
```

**提交规范：**
```bash
# ✅ 好的提交
git commit -m "feat(用户): 添加登录功能"
git commit -m "fix(支付): 修复超时问题"

# ❌ 不好的提交
git commit -m "修改"
git commit -m "fix bug"
```

**合并规范：**
```bash
# ✅ 合并前先拉取
git pull origin main
git merge feature/xxx

# ❌ 直接合并（可能冲突）
git merge feature/xxx
```

---

### 6. 备份和恢复

**就像游戏存档，多几个备份更安全**

**本地备份：**
```bash
# 打包整个项目
tar -czf project-backup.tar.gz my-project/

# 或者使用文件管理器压缩
```

**远程备份：**
```bash
# 推送到多个远程仓库
git remote add backup https://github.com/xxx/project.git
git push backup main
```

**Git标签备份：**
```bash
# 为重要版本打标签
git tag -a v1.0.0 -m "第一个正式版本"
git push origin v1.0.0

# 查看所有标签
git tag

# 恢复到某个标签
git checkout v1.0.0
```

**💡 定期备份建议：**
- 每天推送到远程（GitHub/GitLab）
- 每周创建一个标签
- 重要版本立即打标签
- 关键时刻手动备份（压缩整个项目）

---

## 快速参考

### 🚀 开发流程速查表

**把这个打印出来贴在显示器旁边！**

```bash
# ──────────────────────────────────────
# 📋 日常开发（99%的情况）
# ──────────────────────────────────────
git checkout dev              # 1. 切换到dev分支
git pull origin dev           # 2. 拉取最新代码
# ... 编辑文件 ...
git add .                     # 3. 添加修改
git commit -m "feat: 描述"     # 4. 提交
git push origin dev           # 5. 推送
pnpm docs:dev                 # 6. 本地测试

# ──────────────────────────────────────
# 🚀 发布到生产
# ──────────────────────────────────────
git checkout main              # 1. 切换到main
git pull origin main           # 2. 拉取最新
git merge dev                  # 3. 合并dev
git push origin main           # 4. 推送（触发部署）
git checkout dev               # 5. 切回dev

# ──────────────────────────────────────
# 🔥 紧急修复
# ──────────────────────────────────────
git checkout main              # 1. 切到main
git pull origin main           # 2. 拉取最新
git checkout -b hotfix/bug     # 3. 创建修复分支
# ... 修复代码 ...
git add .                      # 4. 添加修改
git commit -m "hotfix: 修复"    # 5. 提交
git push origin hotfix/bug     # 6. 推送
git checkout main              # 7. 切回main
git merge hotfix/bug           # 8. 合并修复
git push origin main           # 9. 部署
```

---

### 📚 常用命令速查

**按使用频率排序：**

| 频率 | 命令 | 说明 | 示例 |
|-----|------|------|------|
| 🔥🔥🔥 | `git status` | 查看状态 | 最常用！ |
| 🔥🔥🔥 | `git add .` | 添加修改 | 几乎每次提交都用 |
| 🔥🔥🔥 | `git commit -m "msg"` | 提交 | 每天10次+ |
| 🔥🔥🔥 | `git push` | 推送 | 每天5次+ |
| 🔥🔥🔥 | `git pull` | 拉取 | 每天多次 |
| 🔥🔥 | `git checkout dev` | 切换分支 | 每天5次+ |
| 🔥🔥 | `git log --oneline -5` | 查看日志 | 每天多次 |
| 🔥🔥 | `git diff` | 查看改动 | 每天多次 |
| 🔥🔥 | `git branch` | 查看分支 | 每天3次+ |
| 🔥 | `git merge dev` | 合并分支 | 每天多次 |
| 🔥 | `git checkout -b feat/xxx` | 创建分支 | 每天1-2次 |
| 🔥 | `git restore file.txt` | 撤销修改 | 每天1-2次 |
| ⚡ | `git reset --soft HEAD~1` | 撤销提交 | 偶尔用 |
| ⚡ | `git branch -d feat/xxx` | 删除分支 | 偶尔用 |

---

### 🎯 场景-命令映射表

**不知道用什么命令？查这个表！**

| 我想... | 用什么命令 |
|---------|-----------|
| 查看改了什么 | `git status` |
| 撤销文件修改 | `git restore file.txt` |
| 撤销所有修改 | `git restore .` |
| 提交后发现忘了加文件 | `git add file.txt && git commit --amend` |
| 提交信息写错了 | `git commit --amend -m "新信息"` |
| 查看最近5次提交 | `git log --oneline -5` |
| 查看某次提交改了什么 | `git show abc1234` |
| 回到某个版本 | `git checkout abc1234` |
| 创建新分支 | `git checkout -b feature/xxx` |
| 切换分支 | `git checkout dev` |
| 删除本地分支 | `git branch -d feature/xxx` |
| 删除远程分支 | `git push origin --delete feature/xxx` |
| 合并分支 | `git merge dev` |
| 查看分支图 | `git log --graph --oneline --all` |

---

### ⚠️ 危险操作警告

**这些命令要谨慎使用！**

| 危险程度 | 命令 | 风险 | 替代方案 |
|---------|------|------|---------|
| 🔴🔴🔴 | `git reset --hard HEAD` | 丢弃所有修改 | `git restore .` |
| 🔴🔴🔴 | `git clean -fd` | 删除未跟踪文件 | 手动删除 |
| 🔴🔴 | `git push -f` | 强制推送（覆盖远程） | 不要用！ |
| 🔴🔴 | `git rebase` (已推送) | 改历史，导致冲突 | 用 merge |
| 🔴 | `git reset --hard HEAD~3` | 删除最近3次提交 | 用 `--soft` |
| 🔴 | `git branch -D xxx` | 强制删除分支 | 用 `-d` |

**使用危险命令前检查清单：**
```
□ 确认不需要这些代码了？
□ 已经备份到其他地方？
□ 确认命令的参数正确？
□ 知道如何恢复？
```

---

### 🆘 常见问题解决

**遇到问题？查这个表！**

| 问题 | 解决方案 |
|------|---------|
| 推送被拒绝 | 先 `git pull`，解决冲突后再 `git push` |
| 合并冲突 | 手动编辑冲突文件，然后 `git add` |
| 提交了不该提交的 | `git reset --soft HEAD~1` |
| 推送到错分支 | `git reset --hard HEAD~1 && git push -f` (危险！) |
| 忘记拉取最新代码 | `git pull origin dev` |
| 分支找不到 | `git fetch` 然后 `git branch -a` |
| 撤销文件修改 | `git restore file.txt` |
| 找回删除的文件 | `git checkout HEAD~1 file.txt` |
| 查看某次提交 | `git show abc1234` |

---

### 📞 获取帮助

**遇到问题不知道怎么办？**

```bash
# 查看命令帮助
git commit --help
git merge --help

# 查看所有命令
git help -g

# 查看当前状态（很有用）
git status
# Git会提示你该做什么

# 搜索解决方案
# Google: "git 如何撤销提交"
# Stack Overflow: 很详细的解答
```

**资源推荐：**
| 资源 | 网址 | 说明 |
|------|------|------|
| 📖 Git官方文档 | git-scm.com/doc | 最权威 |
| 🎥 视频教程 | B站搜索"Git教程" | 适合新手 |
| 💻 互动学习 | learngitbranching.js.org | 游戏化学习 |
| 📚 本项目文档 | (你正在看的) | 实战经验 |

---

## 🎉 恭喜你！

**掌握这些内容，你就已经超越了90%的Git用户！**

```
新手水平 ✅
├─ 了解基本概念
├─ 会使用 add/commit/push
└─ 知道分支是什么

进阶水平 ✅
├─ 掌握分支管理
├─ 会解决冲突
├─ 理解工作流程
└─ 遵循提交规范

高手水平 🔝
├─ 熟练使用 rebase
├─ 会恢复丢失的提交
├─ 理解 Git 内部原理
└─ 能帮助他人解决问题

你现在处于：进阶水平！✨
```

**下一步建议：**
1. 📖 多练习，形成肌肉记忆
2. 🤝 帮助同事解决Git问题
3. 📚 学习进阶技巧（Git高级命令）
4. 🎯 探索不同的工作流（Git Flow等）

---

## 下一步

掌握工作流程后，让我们学习[实战技巧 →](chapter-05)
