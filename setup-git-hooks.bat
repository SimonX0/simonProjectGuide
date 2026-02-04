@echo off
REM Git Hooks 配置脚本 (Windows)
REM 为项目设置自动清理 Co-Authored-By 的 hook

echo 🔧 配置 Git Hooks...

REM 设置 hooks 路径
git config core.hooksPath .githooks

REM 设置 commit 模板
git config commit.template .gitmessage

REM 创建 hook 目录（如果不存在）
if not exist ".githooks" mkdir .githooks

REM 检查 hook 是否存在
if exist ".githooks\prepare-commit-msg" (
    echo ✅ Hook 文件已存在
) else (
    echo ❌ Hook 文件不存在，请检查 .githooks 目录
    exit /b 1
)

echo.
echo ✨ 配置完成！
echo.
echo 📋 当前配置：
git config --get core.hooksPath
git config --get commit.template
echo.
echo 🧪 测试提交：
echo   git commit -m "test: 测试"
echo.
echo ✨ 以后每次提交都会自动删除 Co-Authored-By 标记！
