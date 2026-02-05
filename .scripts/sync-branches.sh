#!/bin/bash

# 分支同步脚本（完全自动化版）
# 1. 自动提交更改到 dev 分支
# 2. 推送到远端 dev
# 3. 切换到 main 分支
# 4. 合并 dev 到 main
# 5. 推送 main 到远端
# 6. 切回 dev 分支

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "========================================"
echo "    分支同步工具 (dev → main) 全自动版  "
echo "========================================"
echo ""

# 获取当前分支名
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 当前分支: $CURRENT_BRANCH"
echo ""

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
  echo "📝 检测到未提交的更改"
  echo ""
  git status --short
  echo ""

  # 询问是否提交
  read -p "是否自动提交这些更改到 dev 分支？(y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 切换到 dev 分支（如果不在 dev）
    if [ "$CURRENT_BRANCH" != "dev" ]; then
      echo "🔄 切换到 dev 分支..."
      git checkout dev
      CURRENT_BRANCH="dev"
    fi

    # 询问提交信息
    echo ""
    read -p "请输入提交信息 (默认: 'chore: 自动提交更改'): " commit_msg
    commit_msg=${commit_msg:-"chore: 自动提交更改"}

    # 添加并提交所有更改
    echo ""
    echo "📦 正在添加所有更改..."
    git add -A

    echo "✍️  正在提交..."
    git commit -m "$commit_msg"

    echo "✅ 提交完成: $(git rev-parse --short HEAD)"
    echo ""
  else
    echo "❌ 取消同步"
    exit 1
  fi
fi

# 确保在 dev 分支
if [ "$CURRENT_BRANCH" != "dev" ]; then
  echo "🔄 切换到 dev 分支..."
  git checkout dev
  CURRENT_BRANCH="dev"
  echo ""
fi

# 检查远程更新
echo "📡 正在获取远程分支信息..."
git fetch origin > /dev/null 2>&1

# 显示将要推送/同步的提交
echo ""
echo "📋 当前状态："
echo "  本地 dev:  $(git rev-parse --short dev)"
echo "  远程 dev:  $(git rev-parse --short origin/dev)"
echo "  远程 main: $(git rev-parse --short origin/main)"
echo ""

# 检查是否需要推送 dev
if [ $(git rev-parse dev) != $(git rev-parse origin/dev) ]; then
  echo "📤 dev 分支有新提交，准备推送..."
  echo ""
  git log origin/dev..dev --oneline --reverse
  echo ""

  read -p "确认推送到远端 dev 吗？(y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消同步"
    exit 1
  fi

  echo "📤 正在推送到远端 dev..."
  git push origin dev
  echo "✅ dev 分支推送完成"
  echo ""
else
  echo "✅ dev 分支已是最新"
  echo ""
fi

# 检查是否需要同步到 main
if [ $(git rev-parse origin/dev) == $(git rev-parse origin/main) ]; then
  echo "✅ main 分支已经是最新的，无需同步"
  echo ""
  echo "========================================"
  echo "            ✅ 完成！                   "
  echo "========================================"
  echo ""
  echo "📊 最终状态："
  echo "  远程 main: $(git rev-parse --short origin/main)"
  echo "  远程 dev:  $(git rev-parse --short origin/dev)"
  echo "  本地分支: $(git branch --show-current)"
  echo ""
  exit 0
fi

# 显示将要同步的提交
echo "📋 将要同步到 main 的提交："
echo ""
git log origin/main..origin/dev --oneline --reverse
echo ""

# 确认同步
read -p "确认要将 dev 同步到 main 吗？(y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 取消同步"
  exit 1
fi

echo ""
echo "========================================"
echo "       🔄 开始同步流程                 "
echo "========================================"
echo ""

# 切换到 main 分支
echo "⬇️  [1/4] 切换到 main 分支..."
git checkout main

# 合并 dev 分支
echo "🔗 [2/4] 合并 dev 分支到 main..."
git merge dev --ff-only

# 推送 main 分支
echo "📤 [3/4] 推送 main 分支到远程..."
git push origin main

# 切回 dev 分支
echo "⬆️  [4/4] 切回 dev 分支..."
git checkout dev

echo ""
echo "========================================"
echo "            ✅ 同步完成！               "
echo "========================================"
echo ""
echo "📊 最终状态："
echo "  远程 main: $(git rev-parse --short origin/main)"
echo "  远程 dev:  $(git rev-parse --short origin/dev)"
echo "  本地分支: dev"
echo ""
