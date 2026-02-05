#!/bin/bash
# Git Hooks 配置脚本
# 为项目设置自动清理 Co-Authored-By 的 hook

echo "🔧 配置 Git Hooks..."

# 设置 hooks 路径
git config core.hooksPath .githooks

# 设置 commit 模板
git config commit.template .gitmessage

# 创建 hook 目录（如果不存在）
mkdir -p .githooks

# 检查 hook 是否存在
if [ -f ".githooks/prepare-commit-msg" ]; then
    echo "✅ Hook 文件已存在"
else
    echo "❌ Hook 文件不存在，请检查 .githooks 目录"
    exit 1
fi

# 设置执行权限
chmod +x .githooks/prepare-commit-msg

echo ""
echo "✨ 配置完成！"
echo ""
echo "📋 当前配置："
echo "  - Hooks 路径: $(git config --get core.hooksPath)"
echo "  - Commit 模板: $(git config --get commit.template)"
echo ""
echo "🧪 测试提交："
echo "  git commit -m 'test: 测试
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>'"
echo ""
echo "✨ 以后每次提交都会自动删除 Co-Authored-By 标记！"
