# Git 提交规范配置

## 已配置的自动限制机制

### 1. Git Commit Template ✅
已创建 `.gitmessage` 模板文件，规范提交信息格式。
- 使用 `git commit` 时会自动加载模板
- 模板中提醒不要添加 Co-Authored-By 标记

### 2. Git Hook - 自动清理 ✅
已创建 `.git/hooks/prepare-commit-msg` hook：
- **功能**：在每次提交前自动删除 `Co-Authored-By: Claude` 行
- **无需手动操作**：提交时自动执行

### 3. Git 别名 ✅
- `git cm` = `git commit -m`（快速提交）

## 使用方法

### 正常提交（推荐）
```bash
# 方式1：使用模板（会自动清理Co-Authored-By）
git add .
git commit

# 方式2：直接提交（hook会自动清理）
git commit -m "feat: 添加新功能"
```

### 使用别名快速提交
```bash
git add .
git cm "feat: 添加新功能"
```

## 提交信息规范

### 格式
```
<type>: <subject>

<body>

<footer>
```

### Type 类型
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链更新

### 示例
```bash
# 简单提交
git commit -m "fix: 修复样式加载问题"

# 详细提交
git commit -m "feat: 添加AI教程章节

- 新增7个完整章节
- 添加学习进度追踪功能
- 优化导航结构

修复问题：
- 修复VitePress SSR问题
- 修复学习路线404错误"
```

## 注意事项

1. **不需要手动添加 Co-Authored-By**：hook会自动清理
2. **保持提交信息简洁**：标题不超过50字符
3. **使用英文提交信息**：保持一致性
4. **一个提交只做一件事**：便于代码审查

## 为团队成员配置

其他开发者克隆项目后，需要运行：

```bash
# 方式1：手动配置（推荐）
git config commit.template .gitmessage

# 方式2：复制hook文件
chmod +x .git/hooks/prepare-commit-msg
```

## 验证配置

```bash
# 检查template配置
git config --get commit.template

# 检查hook是否存在
ls -la .git/hooks/prepare-commit-msg

# 测试提交
git commit -m "test: 测试自动清理功能

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 查看提交信息（应该没有Co-Authored-By）
git log -1 --format=%B
```

---

**配置日期**: 2026年2月
**维护者**: 小徐
