#!/bin/bash
# VitePress 开发服务器重启脚本
# 解决 Shiki 实例释放问题

echo "🔧 正在清理 VitePress 缓存..."

# 清理 VitePress 缓存
if [ -d "docs/.vitepress/cache" ]; then
    rm -rf docs/.vitepress/cache
    echo "✅ 已清理 VitePress 缓存"
fi

# 清理 Vite 缓存
if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "✅ 已清理 Vite 缓存"
fi

# 清理临时文件
if [ -d "docs/.vitepress/temp" ]; then
    rm -rf docs/.vitepress/temp
    echo "✅ 已清理临时文件"
fi

echo ""
echo "🚀 正在启动 VitePress 开发服务器..."
echo ""
echo "访问地址: http://localhost:5173/simonProjectGuide/"
echo "按 Ctrl+C 停止服务器"
echo ""

pnpm run docs:dev
