#!/bin/bash
# 自动修复章节编号连续性问题
# 在 sidebar.ts 中自动补充缺失的章节

echo "=== 自动修复章节编号连续性 ==="
echo ""

SIDEBAR_FILE="docs/.vitepress/sidebar.ts"

if [ ! -f "$SIDEBAR_FILE" ]; then
  echo "❌ 错误: 找不到 $SIDEBAR_FILE"
  exit 1
fi

# 提取所有"第X章"的编号并排序
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

# 找出缺失的章节
MISSING=()
PREV=0

for i in "${!CHAPTER_ARRAY[@]}"; do
  CURRENT=${CHAPTER_ARRAY[$i]}

  if [ $i -gt 0 ]; then
    # 检查 PREV 和 CURRENT 之间是否有缺失
    for ((gap=PREV+1; gap<CURRENT; gap++)); do
      MISSING+=($gap)
    done
  fi

  PREV=$CURRENT
done

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "✅ 所有章节编号连续，无需修复"
  exit 0
fi

echo "❌ 发现 ${#MISSING[@]} 个缺失的章节:"
for chap in "${MISSING[@]}"; do
  echo "   - 第${chap}章"
done
echo ""

# 询问是否修复
read -p "是否自动补充缺失的章节？(y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 取消修复"
  exit 1
fi

echo ""
echo "🔧 开始修复..."
echo ""

# 创建临时文件
TEMP_FILE=$(mktemp)
cp "$SIDEBAR_FILE" "$TEMP_FILE"

FIXED=0

# 遍历缺失的章节，在 sidebar.ts 中插入占位符
for MISSING_CHAP in "${MISSING[@]}"; do
  echo "处理第${MISSING_CHAP}章..."

  # 找到应该插入的位置（第一个大于缺失章节编号的位置）
  INSERT_AFTER=0
  for chap in "${CHAPTER_ARRAY[@]}"; do
    if [ $chap -gt $MISSING_CHAP ]; then
      INSERT_AFTER=$chap
      break
    fi
  done

  if [ $INSERT_AFTER -eq 0 ]; then
    # 没找到合适的插入位置，跳过
    echo "  ⚠️  无法确定插入位置，跳过"
    continue
  fi

  # 在 sidebar.ts 中查找插入位置
  # 查找"第${INSERT_AFTER}章"的位置，然后往前找合适的位置插入

  # 使用 awk 来插入新章节
  # 策略：在第一个比缺失章节大的章节之前插入
  awk -v missing="$MISSING_CHAP" -v after="$INSERT_AFTER" '
    BEGIN { inserted = 0 }
    /第[0-9]+章/ {
      match($0, /第([0-9]+)章/, arr)
      current_chap = arr[1]

      # 如果找到应该插入之后的位置，且还没插入
      if (current_chap == after && inserted == 0) {
        # 生成缩进（匹配当前行的缩进）
        match($0, /^[  ]*/)
        indent = substr($0, RSTART, RLENGTH)

        # 插入缺失的章节
        print indent "text: \"第" missing "章\""
        print indent "items:"
        print indent "  - text: \"待添加\""
        print indent "    link: \"/" missing "\""
        print ""
        inserted = 1
      }
    }
    { print }
  ' "$TEMP_FILE" > "${TEMP_FILE}.tmp" && mv "${TEMP_FILE}.tmp" "$TEMP_FILE"

  if [ $? -eq 0 ]; then
    echo "  ✅ 已插入第${MISSING_CHAP}章占位符"
    FIXED=$((FIXED + 1))
  else
    echo "  ❌ 插入第${MISSING_CHAP}章失败"
  fi
done

# 备份原文件
cp "$SIDEBAR_FILE" "${SIDEBAR_FILE}.backup.$(date +%Y%m%d%H%M%S)"

# 应用修复
mv "$TEMP_FILE" "$SIDEBAR_FILE"

echo ""
if [ $FIXED -gt 0 ]; then
  echo "✅ 已修复 $FIXED 个缺失章节"
  echo ""
  echo "📝 已备份原文件到: ${SIDEBAR_FILE}.backup.*"
  echo ""
  echo "💡 后续步骤："
  echo "   1. 检查 docs/.vitepress/sidebar.ts"
  echo "   2. 为新增的占位符章节添加实际内容"
  echo "   3. 创建对应的 markdown 文件"
  echo ""
else
  echo "⚠️  未能自动修复，请手动处理"
  exit 1
fi
