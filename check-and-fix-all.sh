#!/bin/bash
# 一键检测和修复所有文档规范问题
# 这是唯一需要运行的脚本，其他核心脚本已隐藏在 .scripts/ 目录中

echo "=== 文档规范一键检测与修复 ==="
echo ""

# 检查 .scripts 目录是否存在
if [ ! -d ".scripts" ]; then
  echo "❌ 错误: 找不到 .scripts 目录"
  echo "请确保项目结构完整"
  exit 1
fi

# 显示脚本执行进度
echo "正在执行以下检查..."
echo "  [1/4] Markdown 标题编号检查"
echo "  [2/4] 侧边栏锚点检查与清理"
echo "  [3/4] 学习路径图一致性检查"
echo "  [4/4] 导航栏与侧边栏一致性验证"
echo ""

# 调用核心脚本（使用绝对路径）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. Markdown 标题编号检查
bash "$SCRIPT_DIR/.scripts/check-naming-rules.sh"
naming_result=$?

echo ""

# 2. 侧边栏锚点检查与清理
bash "$SCRIPT_DIR/.scripts/check-anchors.sh"
anchor_check_result=$?

# 如果有无效锚点，自动清理
if [ $anchor_check_result -ne 0 ]; then
  echo ""
  echo "发现无效锚点，正在自动清理..."
  bash "$SCRIPT_DIR/.scripts/clean-anchors.sh"
  anchor_result=$?
else
  anchor_result=0
fi

echo ""

# 3. 学习路径图检查
bash "$SCRIPT_DIR/.scripts/fix-learning-path.sh"
learning_result=$?

echo ""

# 4. 导航栏与侧边栏一致性验证
bash "$SCRIPT_DIR/.scripts/check-nav-sidebar-consistency.sh"
nav_result=$?

echo ""
echo "========================================"
echo "           检查与修复完成"
echo "========================================"
echo ""

if [ $naming_result -eq 0 ] && [ $learning_result -eq 0 ] && [ $anchor_result -eq 0 ] && [ $nav_result -eq 0 ]; then
  echo "🎉 所有检查项通过！文档规范完全符合要求。"
  echo ""
  echo "✅ Markdown 标题无编号违规"
  echo "✅ 侧边栏锚点配置正确"
  echo "✅ 学习路径图与侧边栏配置一致"
  echo "✅ 顶部导航栏与侧边栏完全对应"
  echo ""
  echo "💡 提示: 所有核心脚本已隐藏在 .scripts/ 目录中"
  echo "   你只需要运行 ./check-and-fix-all.sh 即可"
  exit 0
else
  echo "⚠️  发现以下问题："
  echo ""
  if [ $naming_result -ne 0 ]; then
    echo "  - Markdown 标题有违规"
  fi
  if [ $anchor_result -ne 0 ]; then
    echo "  - 侧边栏锚点清理失败"
  fi
  if [ $learning_result -ne 0 ]; then
    echo "  - 学习路径图需要更新"
  fi
  if [ $nav_result -ne 0 ]; then
    echo "  - 顶部导航栏与侧边栏不一致"
  fi
  echo ""
  echo "请查看上方的详细检查结果。"
  echo ""
  exit 1
fi
