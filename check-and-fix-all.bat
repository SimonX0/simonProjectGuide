@echo off
REM 一键检测和修复所有命名规范问题
REM Windows 批处理脚本（调用 Bash 脚本）

echo === 文档规范一键检测与修复 ===
echo.
echo 正在调用 Git Bash 执行检测...
echo.

bash check-and-fix-all.sh

echo.
pause
