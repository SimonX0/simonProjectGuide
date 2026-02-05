#!/bin/bash
# 自动修复学习路径图 - Bash 包装脚本
# 自动调用 Python 脚本进行学习路径图检查

echo "=== 自动修复学习路径图 ==="
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
$PYTHON_CMD "$SCRIPT_DIR/fix-learning-path.py" "$@"

exit_code=$?

# 根据结果返回相应的退出码
if [ $exit_code -eq 0 ]; then
    echo ""
    echo "🎉 所有模块的学习路径图都是正确的！"
else
    echo ""
    echo "⚠️  部分模块的学习路径图需要更新，请按照上述提示进行修复"
fi

exit $exit_code
