#!/bin/bash
# VitePress 开发服务器重启脚本
# 解决 Shiki 实例释放问题

echo "🔧 正在清理所有缓存..."

# 清理 VitePress 缓存
if [ -d "docs/.vitepress/cache" ]; then
    echo "  - 清理 VitePress 缓存..."
    rm -rf docs/.vitepress/cache
fi

# 清理 Vite 缓存
if [ -d "node_modules/.vite" ]; then
    echo "  - 清理 Vite 缓存..."
    rm -rf node_modules/.vite
fi

# 清理临时目录
for dir in docs/.vitepress/deps_temp_*; do
    if [ -d "$dir" ]; then
        echo "  - 清理临时目录: $dir"
        rm -rf "$dir"
    fi
done

# 清理时间戳文件
find docs/.vitepress -name "*.timestamp-*" -delete 2>/dev/null

echo ""
echo "✅ 缓存清理完成！"
echo ""
echo "🚀 正在启动 VitePress 开发服务器..."
echo ""
echo "访问地址: http://localhost:5173/simonProjectGuide/"
echo "按 Ctrl+C 停止服务器"
echo ""

sleep 2
pnpm run docs:dev
