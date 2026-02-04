# Git 工作流程

## 本项目的工作流程

本项目采用 **dev-main** 双分支工作流：

### 分支说明

```
┌─────────────────────────────────────┐
│           main (生产分支)              │
│   • 稳定代码                          │
│   • 推送触发自动部署                   │
│   • 不要直接修改                      │
└─────────────────────────────────────┘
                 ↑ 合并
┌─────────────────────────────────────┐
│           dev (开发分支)              │
│   • 日常开发                          │
│   • 推送不触发部署                     │
│   • 开发工作都在这里                   │
└─────────────────────────────────────┘
```

### 完整工作流程

```bash
# 1. 在 dev 分支开发
git checkout dev
# ... 编辑文件 ...
git add .
git commit -m "添加新功能"
git push origin dev

# 2. 本地测试
pnpm docs:dev

# 3. 确认无误后发布到生产
git checkout main
git pull origin main
git merge dev
git push origin main  # 触发自动部署
git checkout dev
```

---

## 日常开发流程

### 步骤 1：开发新功能

```bash
# 确保在 dev 分支
git checkout dev

# 拉取最新代码
git pull origin dev

# 创建功能分支（可选）
git checkout -b feature/new-feature

# 编辑文件...

# 查看修改状态
git status

# 添加修改
git add .

# 提交
git commit -m "添加用户注册功能"

# 推送到远程
git push origin dev
# 或推送到功能分支
# git push -u origin feature/new-feature
```

### 步骤 2：本地测试

```bash
# 启动开发服务器
pnpm docs:dev

# 在浏览器访问 http://localhost:5173
# 测试功能是否正常
```

### 步骤 3：代码审查（团队协作）

```bash
# 在 GitHub 上创建 Pull Request
# 团队成员审查代码
# 根据反馈修改代码
```

### 步骤 4：合并到主分支

```bash
# 切换到 main 分支
git checkout main

# 拉取最新代码
git pull origin main

# 合并 dev 分支
git merge dev

# 推送到远程（触发自动部署）
git push origin main

# 切回 dev 继续开发
git checkout dev
```

---

## 常见场景

### 场景 1：修复线上问题

```bash
# 1. 切换到 main
git checkout main
git pull origin main

# 2. 创建修复分支
git checkout -b hotfix/critical-bug

# 3. 修复并测试
# ... 修改代码 ...
pnpm docs:dev

# 4. 合并到 main（紧急发布）
git checkout main
git merge hotfix/critical-bug
git push origin main

# 5. 合并到 dev（同步修复）
git checkout dev
git merge hotfix/critical-bug
git push origin dev

# 6. 删除修复分支
git branch -d hotfix/critical-bug
```

### 场景 2：放弃本地修改

```bash
# 放弃工作区的所有修改
git restore .

# 放弃某个文件的修改
git restore README.md

# 回退到最近一次提交
git reset --hard HEAD
```

### 场景 3：同步远程更新

```bash
# 在合并前先拉取最新代码
git checkout main
git pull origin main

# 然后再合并 dev
git merge dev
```

---

## 提交规范

### 提交信息格式

```bash
# 格式：类型(范围): 简短描述

git commit -m "feat(用户): 添加登录功能"
git commit -m "fix(导航): 修复导航栏显示错误"
git commit -m "docs(首页): 更新README文档"
```

### 常用类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(用户): 添加头像上传` |
| `fix` | 修复bug | `fix(登录): 修复验证错误` |
| `docs` | 文档更新 | `docs(安装): 更新安装步骤` |
| `style` | 代码格式 | `style(组件): 统一代码风格` |
| `refactor` | 重构 | `refactor(API): 优化请求逻辑` |
| `test` | 测试 | `test(工具): 添加单元测试` |
| `chore` | 构建/工具 | `chore(deps): 更新依赖版本` |

### 提交信息示例

```bash
# ✅ 好的提交信息
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复导航栏在移动端的显示问题"
git commit -m "docs: 更新Git工作流程说明"

# ❌ 不好的提交信息
git commit -m "修改"
git commit -m "update"
git commit -m "修复bug"
```

---

## 最佳实践

### 1. 频繁提交，小步快跑

```bash
# ✅ 推荐
git commit -m "添加登录表单"
git commit -m "添加表单验证"
git commit -m "添加错误处理"

# ❌ 不推荐
# 修改了10个文件后一次性提交
git commit -m "完成登录功能"
```

### 2. 推送前检查

```bash
# 1. 查看状态
git status

# 2. 查看即将提交的内容
git diff --staged

# 3. 查看最近3次提交
git log --oneline -3

# 4. 确认无误后推送
git push
```

### 3. 保持分支整洁

```bash
# 定期同步 main 到 dev
git checkout dev
git pull origin main

# 或使用 rebase 保持线性历史
git rebase main
```

### 4. 使用 .gitignore

```bash
# .gitignore 示例
node_modules/
dist/
.DS_Store
*.log
.env
.env.local
```

---

## 快速参考

### 开发流程速查

```bash
# 开发
git checkout dev
git add .
git commit -m "feat: 添加新功能"
git push origin dev

# 测试
pnpm docs:dev

# 发布
git checkout main
git merge dev
git push origin main
git checkout dev
```

### 常用命令速查

```bash
# 查看状态
git status

# 查看日志
git log --oneline -5

# 查看分支
git branch

# 创建并切换分支
git checkout -b feature/xxx

# 合并分支
git merge dev

# 撤销修改
git restore file.txt

# 回退提交
git reset --soft HEAD~1
```

---

## 下一步

掌握工作流程后，让我们学习[实战技巧 →](chapter-05)
