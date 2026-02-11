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
echo "正在执行以下检查与修复..."
echo "  [1/5] Markdown 标题编号检查与自动修复"
echo "  [2/5] 章节编号连续性检查与自动修复"
echo "  [3/5] 侧边栏锚点检查与自动修复"
echo "  [4/5] 学习路径图一致性检查与自动修复"
echo "  [5/5] 导航栏与侧边栏一致性检查与自动修复"
echo ""

# 调用核心脚本（使用绝对路径）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ========== 1. Markdown 标题编号检查与修复 ==========
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [1/5] Markdown 标题编号检查与修复"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bash "$SCRIPT_DIR/.scripts/check-naming-rules.sh"
naming_result=$?

# 如果发现命名规则问题，自动修复
if [ $naming_result -ne 0 ]; then
  echo ""
  echo "🔧 发现命名规则问题，正在自动修复..."
  bash "$SCRIPT_DIR/.scripts/fix-naming-rules.sh" > /dev/null 2>&1

  # 重新检查
  echo "🔍 重新检查..."
  bash "$SCRIPT_DIR/.scripts/check-naming-rules.sh"
  naming_result=$?

  if [ $naming_result -eq 0 ]; then
    echo "✅ 命名规则问题已修复"
  else
    echo "⚠️  命名规则问题修复失败，请手动处理"
  fi
else
  echo "✅ Markdown 标题编号检查通过"
fi

echo ""

# ========== 2. 章节编号连续性检查与修复 ==========
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [2/5] 章节编号连续性检查与修复"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bash "$SCRIPT_DIR/.scripts/check-chapter-continuity.sh"
chapter_result=$?

# 如果发现章节不连续，自动修复
if [ $chapter_result -ne 0 ]; then
  echo ""
  echo "🔧 发现章节编号不连续，正在自动修复..."
  echo "y" | bash "$SCRIPT_DIR/.scripts/fix-chapter-continuity.sh" > /dev/null 2>&1

  # 重新检查
  echo "🔍 重新检查..."
  bash "$SCRIPT_DIR/.scripts/check-chapter-continuity.sh"
  chapter_result=$?

  if [ $chapter_result -eq 0 ]; then
    echo "✅ 章节编号问题已修复"
  else
    echo "⚠️  章节编号修复失败，请手动处理"
  fi
else
  echo "✅ 章节编号连续"
fi

echo ""

# ========== 3. 侧边栏锚点检查与修复 ==========
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [3/5] 侧边栏锚点检查与修复"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bash "$SCRIPT_DIR/.scripts/check-anchors.sh"
anchor_check_result=$?

# 如果有锚点问题，自动修复
if [ $anchor_check_result -ne 0 ]; then
  echo ""
  echo "🔧 发现锚点问题，正在自动修复..."

  # 先尝试修复锚点
  bash "$SCRIPT_DIR/.scripts/fix-anchors.sh" > /dev/null 2>&1
  fix_result=$?

  # 然后清理无效锚点
  bash "$SCRIPT_DIR/.scripts/clean-anchors.sh" > /dev/null 2>&1
  clean_result=$?

  # 重新检查
  echo "🔍 重新检查锚点..."
  bash "$SCRIPT_DIR/.scripts/check-anchors.sh"
  anchor_result=$?

  if [ $anchor_result -eq 0 ]; then
    echo "✅ 锚点问题已修复"
  else
    echo "⚠️  部分锚点问题无法自动修复，请手动处理"
  fi
else
  anchor_result=0
  echo "✅ 侧边栏锚点检查通过"
fi

echo ""

# ========== 4. 学习路径图检查与修复 ==========
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [4/5] 学习路径图一致性检查与修复"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bash "$SCRIPT_DIR/.scripts/fix-learning-path.sh"
learning_result=$?

# 如果发现学习路径图问题，自动修复
if [ $learning_result -ne 0 ]; then
  echo ""
  echo "🔧 发现学习路径图问题，正在自动修复..."
  bash "$SCRIPT_DIR/.scripts/fix-learning-path-auto.sh" > /dev/null 2>&1

  # 重新检查
  echo "🔍 重新检查..."
  bash "$SCRIPT_DIR/.scripts/fix-learning-path.sh"
  learning_result=$?

  if [ $learning_result -eq 0 ]; then
    echo "✅ 学习路径图问题已修复"
  else
    echo "⚠️  学习路径图修复失败，请手动处理"
  fi
else
  echo "✅ 学习路径图检查通过"
fi

echo ""

# ========== 5. 导航栏与侧边栏一致性验证 ==========
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [5/5] 导航栏与侧边栏一致性检查与修复"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bash "$SCRIPT_DIR/.scripts/check-nav-sidebar-consistency.sh"
nav_result=$?

# 如果发现不一致，自动修复
if [ $nav_result -ne 0 ]; then
  echo ""
  echo "🔧 发现导航栏与侧边栏不一致，正在自动修复..."
  bash "$SCRIPT_DIR/.scripts/fix-nav-sidebar-consistency.sh" > /dev/null 2>&1

  # 重新检查
  echo "🔍 重新检查..."
  bash "$SCRIPT_DIR/.scripts/check-nav-sidebar-consistency.sh"
  nav_result=$?

  if [ $nav_result -eq 0 ]; then
    echo "✅ 导航栏与侧边栏一致性问题已修复"
  else
    echo "⚠️  导航栏与侧边栏修复失败，请手动处理"
  fi
else
  echo "✅ 导航栏与侧边栏一致"
fi

echo ""
echo "========================================"
echo "           检查与修复完成"
echo "========================================"
echo ""

if [ $naming_result -eq 0 ] && [ $chapter_result -eq 0 ] && [ $learning_result -eq 0 ] && [ $anchor_result -eq 0 ] && [ $nav_result -eq 0 ]; then
  echo "🎉 所有检查项通过！文档规范完全符合要求。"
  echo ""
  echo "✅ Markdown 标题无编号违规"
  echo "✅ 章节编号连续无跳号"
  echo "✅ 侧边栏锚点配置正确"
  echo "✅ 学习路径图已更新为正确范围"
  echo "✅ 顶部导航栏与侧边栏完全对应"
  echo ""
  echo "💡 提示: 所有核心脚本已隐藏在 .scripts/ 目录中"
  echo "   你只需要运行 ./check-and-fix-all.sh 即可"
  exit 0
else
  echo "⚠️  发现以下问题："
  echo ""
  if [ $naming_result -ne 0 ]; then
    echo "  - Markdown 标题有违规（修复失败）"
  fi
  if [ $chapter_result -ne 0 ]; then
    echo "  - 章节编号不连续（修复失败）"
  fi
  if [ $anchor_result -ne 0 ]; then
    echo "  - 侧边栏锚点问题（部分无法自动修复）"
  fi
  if [ $learning_result -ne 0 ]; then
    echo "  - 学习路径图修复失败"
  fi
  if [ $nav_result -ne 0 ]; then
    echo "  - 顶部导航栏与侧边栏不一致（修复失败）"
  fi
  echo ""
  echo "请查看上方的详细检查结果，并手动处理无法自动修复的问题。"
  echo ""
  exit 1
fi
