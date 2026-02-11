#!/bin/bash
# 检查侧边栏章节编号连续性
# 检测第1章后直接跳到第6章这种不连续的情况

echo "=== 检查章节编号连续性 ==="
echo ""

SIDEBAR_FILE="docs/.vitepress/sidebar.ts"

if [ ! -f "$SIDEBAR_FILE" ]; then
  echo "❌ 错误: 找不到 $SIDEBAR_FILE"
  exit 1
fi

# 提取所有"第X章"的编号
CHAPTERS=$(grep -oP '第\K[0-9]+(?=章)' "$SIDEBAR_FILE" | sort -n | uniq)

if [ -z "$CHAPTERS" ]; then
  echo "⚠️  未找到任何章节编号"
  exit 0
fi

# 转换为数组
CHAPTER_ARRAY=($(echo "$CHAPTERS"))
TOTAL=${#CHAPTER_ARRAY[@]}

echo "📋 共找到 $TOTAL 个章节"
echo ""

# 检查连续性
HAS_GAP=0
PREV=0

for i in "${!CHAPTER_ARRAY[@]}"; do
  CURRENT=${CHAPTER_ARRAY[$i]}

  if [ $i -gt 0 ]; then
    EXPECTED=$((PREV + 1))

    if [ $CURRENT -ne $EXPECTED ]; then
      echo "❌ 发现编号不连续: 第${PREV}章 → 第${CURRENT}章 (缺少第${EXPECTED}章)"
      HAS_GAP=1
    fi
  fi

  PREV=$CURRENT
done

echo ""
if [ $HAS_GAP -eq 0 ]; then
  echo "✅ 所有章节编号连续"
  echo ""
  echo "章节列表:"
  echo "$CHAPTERS" | while read chap; do
    echo "  - 第${chap}章"
  done
  echo ""
  exit 0
else
  echo "⚠️  存在章节编号不连续的问题"
  echo ""
  echo "💡 修复建议："
  echo "   1. 检查 docs/.vitepress/sidebar.ts 中的章节配置"
  echo "   2. 补充缺失的章节或调整现有章节编号"
  echo ""
  exit 1
fi
