@echo off
REM VitePress 开发服务器重启脚本
REM 解决 Shiki 实例释放问题

echo 🔧 正在清理 VitePress 缓存...

REM 清理 VitePress 缓存
if exist "docs\.vitepress\cache" (
    rmdir /s /q "docs\.vitepress\cache"
    echo ✅ 已清理 VitePress 缓存
)

REM 清理 Vite 缓存
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ 已清理 Vite 缓存
)

REM 清理临时文件
if exist "docs\.vitepress\temp" (
    rmdir /s /q "docs\.vitepress\temp"
    echo ✅ 已清理临时文件
)

echo.
echo 🚀 正在启动 VitePress 开发服务器...
echo.
echo 访问地址: http://localhost:5173/simonProjectGuide/
echo 按 Ctrl+C 停止服务器
echo.

pnpm run docs:dev
