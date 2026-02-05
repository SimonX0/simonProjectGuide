#!/bin/bash
# 清理 sidebar.ts 中无效的锚点 - Bash 包装脚本

echo "=== 清理 sidebar.ts 中无效的锚点 ==="
echo ""

# 检查 Python 是否可用
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ 错误: 未找到 Python，请先安装 Python 3"
    echo ""
    echo "💡 提示: 你可以从 https://www.python.org/downloads/ 下载 Python"
    exit 1
fi

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 运行 Python 脚本
$PYTHON_CMD "$SCRIPT_DIR/clean-anchors.py"

exit_code=$?

echo ""

# 根据结果返回相应的退出码
if [ $exit_code -eq 0 ]; then
    echo "🎉 锚点清理完成！"
else
    echo "⚠️  清理过程中出现问题"
fi

exit $exit_code
