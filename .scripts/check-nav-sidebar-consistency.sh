#!/bin/bash
# 检查顶部导航栏与侧边栏一致性 - Bash 包装脚本

echo "=== 检查顶部导航栏与侧边栏一致性 ==="
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
$PYTHON_CMD "$SCRIPT_DIR/check-nav-sidebar-consistency.py"

exit_code=$?

echo ""

exit $exit_code
