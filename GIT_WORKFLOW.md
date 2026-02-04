# Git 工作流程说明

## 分支说明

### `main` 分支（生产分支）
- **用途**：稳定的生产代码
- **触发**：推送到此分支会自动触发 GitHub Actions 部署
- **保护**：不要直接在此分支开发

### `dev` 分支（开发分支）
- **用途**：日常开发和测试
- **安全**：推送到此分支不会触发部署
- **推荐**：所有开发工作在此分支进行

### `gh-pages` 分支（自动管理）
- **用途**：存储构建后的静态文件
- **管理**：由 GitHub Actions 自动创建和更新
- **注意**：不要手动操作此分支

---

## 工作流程

### 1. 开发阶段

在 `dev` 分支进行开发和测试：

```bash
# 确保在 dev 分支
git checkout dev

# 编辑文件...

# 查看修改状态
git status

# 添加修改的文件
git add .

# 提交修改
git commit -m "描述你的修改内容"

# 推送到远程 dev 分支（不会触发部署）
git push origin dev
```

### 2. 本地测试

在合并到 main 之前，先本地预览确认：

```bash
# 启动开发服务器
pnpm docs:dev

# 访问 http://localhost:5173 查看效果
```

### 3. 发布到生产

确认无误后，合并到 `main` 分支触发部署：

```bash
# 切换到 main 分支
git checkout main

# 拉取最新的远程代码
git pull origin main

# 合并 dev 分支
git merge dev

# 推送到远程 main 分支（触发自动部署）
git push origin main

# 切回 dev 分支继续开发
git checkout dev
```

---

## 常用命令

### 分支操作

```bash
# 查看当前分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 创建并切换到新分支
git checkout -b 分支名

# 切换分支
git checkout 分支名

# 删除本地分支
git branch -d 分支名

# 删除远程分支
git push origin --delete 分支名
```

### 查看状态和日志

```bash
# 查看文件修改状态
git status

# 查看修改内容
git diff

# 查看提交历史
git log

# 查看简洁的提交历史
git log --oneline

# 查看最近的提交记录
git log --oneline -5
```

### 撤销操作

```bash
# 撤销工作区的修改（恢复到最近一次提交）
git restore 文件名

# 撤销暂存区的修改（保留在工作区）
git restore --staged 文件名

# 撤销最近的提交（保留修改）
git reset --soft HEAD~1

# 撤销最近的提交（丢弃修改）
git reset --hard HEAD~1

# 回退到指定提交
git reset --hard 提交哈希
```

### 合并相关

```bash
# 合并分支
git merge 分支名

# 中止合并
git merge --abort

# 使用 rebase 合并（保持线性历史）
git rebase 分支名
```

---

## 工作流程示例

### 场景 1：日常开发

```bash
# 1. 在 dev 分支开发
git checkout dev
# ... 编辑文件 ...
git add .
git commit -m "添加新功能"
git push origin dev

# 2. 本地测试
pnpm docs:dev

# 3. 测试通过后发布
git checkout main
git pull origin main
git merge dev
git push origin main
git checkout dev
```

### 场景 2：修复线上问题

```bash
# 1. 切换到 main 分支
git checkout main
git pull origin main

# 2. 创建修复分支
git checkout -b fix/紧急修复

# 3. 修复并测试
# ... 编辑文件 ...
pnpm docs:dev

# 4. 合并到 dev 和 main
git checkout dev
git merge fix/紧急修复
git push origin dev

git checkout main
git merge fix/紧急修复
git push origin main

# 5. 删除修复分支
git branch -d fix/紧急修复
```

### 场景 3：放弃本地修改

```bash
# 放弃工作区的所有修改
git restore .

# 放弃某个文件的修改
git restore 文件名

# 回退到最近一次提交（丢弃所有修改）
git reset --hard HEAD
```

---

## 最佳实践

### 1. 提交信息规范

使用清晰的提交信息：

```bash
# ✅ 好的提交信息
git commit -m "添加 Vue3 响应式原理章节"
git commit -m "修复导航栏显示错误"
git commit -m "更新首页样式"

# ❌ 不好的提交信息
git commit -m "修改"
git commit -m "更新"
git commit -m "fix"
```

### 2. 频繁提交

- 小步快跑，频繁提交
- 每完成一个小功能就提交一次
- 便于回退和代码审查

### 3. 推送前检查

```bash
# 推送前先检查状态
git status
git log --oneline -3

# 确认无误后再推送
git push
```

### 4. 保持分支整洁

```bash
# 定期同步 main 分支到 dev
git checkout dev
git merge main
```

### 5. 解决冲突

当合并时出现冲突：

```bash
# 1. 执行合并
git merge 分支名

# 2. 打开冲突文件，查找标记
# <<<<<<< HEAD
# 当前分支的内容
# =======
# 要合并分支的内容
# >>>>>>> 分支名

# 3. 手动编辑解决冲突

# 4. 标记冲突已解决
git add 冲突文件

# 5. 完成合并
git commit
```

---

## 注意事项

### ⚠️ 重要提醒

1. **不要直接修改 `main` 分支**
   - 始终在 `dev` 分支开发
   - 测试通过后再合并到 `main`

2. **推送前先测试**
   ```bash
   # 本地构建测试
   pnpm docs:build

   # 本地预览
   pnpm docs:dev
   ```

3. **及时拉取远程更新**
   ```bash
   # 合并前先拉取最新代码
   git pull origin main
   ```

4. **不要手动修改 `gh-pages` 分支**
   - 该分支由 GitHub Actions 自动管理
   - 手动修改会被覆盖

5. **敏感文件不要提交**
   - 确保 `.gitignore` 配置正确
   - 不要提交密码、密钥等敏感信息

---

## 快速参考

### 发布新版本

```bash
git checkout dev
git add .
git commit -m "更新内容"
git push origin dev

# 测试通过后
git checkout main
git pull origin main
git merge dev
git push origin main
git checkout dev
```

### 查看部署状态

访问：https://github.com/SimonX0/simonProjectGuide/actions

### 访问网站

https://simonx0.github.io/simonProjectGuide/

---

## 相关文档

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub Pages 文档](https://docs.github.com/pages)
- [VitePress 文档](https://vitepress.dev/)
