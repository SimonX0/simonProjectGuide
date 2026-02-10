#!/bin/bash

# GitHub 分支保护自动配置脚本
# 使用方法：./scripts/setup-branch-protection.sh

set -e

echo "🔒 开始配置 main 分支保护规则..."

# 检查是否安装了 gh CLI
if ! command -v gh &> /dev/null; then
    echo "❌ 错误：未找到 GitHub CLI (gh)"
    echo "请先安装："
    echo "  macOS:   brew install gh"
    echo "  Windows: scoop install gh"
    echo "  Linux:   sudo apt install gh"
    exit 1
fi

# 检查是否已登录
if ! gh auth status &> /dev/null; then
    echo "❌ 错误：未登录 GitHub"
    echo "请先登录：gh auth login"
    exit 1
fi

# 获取仓库信息
REPO_OWNER=$(git config --get remote.origin.url | sed -n 's/.*github.com[:/]\([^/]*\)\/.*/\1/p')
REPO_NAME=$(git config --get remote.origin.url | sed -n 's/.*\/\([^/]*\)\.git/\1/p')

if [ -z "$REPO_OWNER" ] || [ -z "$REPO_NAME" ]; then
    echo "❌ 错误：无法获取仓库信息"
    echo "请确保在 Git 仓库根目录运行此脚本"
    exit 1
fi

echo "📦 仓库: $REPO_OWNER/$REPO_NAME"
echo ""

# 询问确认
read -p "是否继续配置 $REPO_OWNER/$REPO_NAME 的 main 分支保护？(y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消配置"
    exit 0
fi

# 配置分支保护规则
echo "🔧 正在配置分支保护规则..."

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/$REPO_OWNER/$REPO_NAME/branches/main/protection \
  -f required_pull_request_reviews='{
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "bypass_pull_request_allowances": {
      "users": [],
      "teams": []
    }
  }' \
  -f required_status_checks='{
    "strict": true,
    "contexts": [],
    "checks": [
      {
        "context": "CI 检查"
      },
      {
        "context": "构建检查"
      },
      {
        "context": "链接检查"
      },
      {
        "context": "提交规范检查"
      },
      {
        "context": "文件变更检查"
      },
      {
        "context": "PR 标题检查"
      }
    ]
  }' \
  -f enforce_admins=true \
  -f allow_force_deletions=false \
  -f restrictions='{"apps": [], "users": [], "teams": []}' || {
    echo "❌ 配置失败"
    echo "可能的原因："
    echo "  1. 你没有管理员权限"
    echo "  2. 分支保护规则已存在"
    echo "  3. 网络连接问题"
    exit 1
  }

echo ""
echo "✅ 分支保护配置成功！"
echo ""
echo "📋 已配置的规则："
echo "  ✅ 要求 PR 审查（至少 1 人批准）"
echo "  ✅ 新提交时撤销旧批准"
echo "  ✅ 要求所有状态检查通过"
echo "  ✅ 要求分支必须是最新的"
echo "  ✅ 禁止管理员绕过"
echo "  ✅ 禁止强制推送"
echo "  ✅ 禁止删除分支"
echo ""
echo "⚠️  重要提示："
echo "  1. 现在不能直接推送到 main 分支"
echo "  2. 所有代码必须通过 PR 合并"
echo "  3. PR 必须通过所有 CI 检查"
echo "  4. PR 必须得到至少 1 人审查批准"
echo ""
echo "🔗 查看配置："
echo "  https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches"
echo ""
echo "🎉 配置完成！"
