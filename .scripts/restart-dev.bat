@echo off
REM VitePress 开发服务器重启脚本
REM 解决 Shiki 实例释放问题

echo 🔧 正在清理所有缓存...

REM 清理 VitePress 缓存
if exist "docs\.vitepress\cache" (
    echo   - 清理 VitePress 缓存...
    rmdir /s /q "docs\.vitepress\cache" 2>nul
)

REM 清理 Vite 缓存
if exist "node_modules\.vite" (
    echo   - 清理 Vite 缓存...
    rmdir /s /q "node_modules\.vite" 2>nul
)

REM 清理临时文件
for /d %%d in (docs\.vitepress\deps_temp_*) do (
    echo   - 清理临时目录: %%d
    rmdir /s /q "%%d" 2>nul
)

REM 清理时间戳文件
for %%f in (docs\.vitepress\*.timestamp-*) do (
    del /q "%%f" 2>nul
)

echo.
echo ✅ 缓存清理完成！
echo.
echo 🚀 正在启动 VitePress 开发服务器...
echo.
echo 访问地址: http://localhost:5173/simonProjectGuide/
echo 按 Ctrl+C 停止服务器
echo.

timeout /t 2 /nobreak >nul
pnpm run docs:dev
