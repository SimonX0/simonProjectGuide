@echo off
REM 分支同步快捷入口（Windows）
REM 将 dev 分支同步到 main 分支

echo === 分支同步工具 (dev → main) ===
echo.
echo 正在调用 Git Bash 执行同步...
echo.

bash sync-branches.sh

echo.
pause
