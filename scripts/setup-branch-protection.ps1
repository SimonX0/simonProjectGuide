# GitHub 分支保护自动配置脚本 (PowerShell)
# 使用方法：.\scripts\setup-branch-protection.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔒 开始配置 main 分支保护规则..." -ForegroundColor Green

# 检查是否安装了 gh CLI
$ghExists = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghExists) {
    Write-Host "❌ 错误：未找到 GitHub CLI (gh)" -ForegroundColor Red
    Write-Host "请先安装：" -ForegroundColor Yellow
    Write-Host "  Windows:  winget install --id GitHub.cli" -ForegroundColor White
    Write-Host "  或:       scoop install gh" -ForegroundColor White
    Write-Host "  或:       choco install gh" -ForegroundColor White
    exit 1
}

# 检查是否已登录
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 错误：未登录 GitHub" -ForegroundColor Red
    Write-Host "请先登录：gh auth login" -ForegroundColor Yellow
    exit 1
}

# 获取仓库信息
$remoteUrl = git config --get remote.origin.url
if (-not $remoteUrl) {
    Write-Host "❌ 错误：无法获取远程仓库 URL" -ForegroundColor Red
    Write-Host "请确保在 Git 仓库根目录运行此脚本" -ForegroundColor Yellow
    exit 1
}

# 解析仓库所有者和名称
if ($remoteUrl -match "github.com[/:]([^/]+)/([^/]+?)(\.git)?$") {
    $REPO_OWNER = $matches[1]
    $REPO_NAME = $matches[2]
} else {
    Write-Host "❌ 错误：无法解析仓库信息" -ForegroundColor Red
    Write-Host "远程 URL: $remoteUrl" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 仓库: $REPO_OWNER/$REPO_NAME" -ForegroundColor Cyan
Write-Host ""

# 询问确认
$confirmation = Read-Host "是否继续配置 $REPO_OWNER/$REPO_NAME 的 main 分支保护？(y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "❌ 取消配置" -ForegroundColor Red
    exit 0
}

# 配置分支保护规则
Write-Host "🔧 正在配置分支保护规则..." -ForegroundColor Yellow

$apiUrl = "repos/$REPO_OWNER/$REPO_NAME/branches/main/protection"

$body = @{
    required_pull_request_reviews = @{
        required_approving_review_count = 1
        dismiss_stale_reviews = $true
        require_code_owner_reviews = $false
        bypass_pull_request_allowances = @{
            users = @()
            teams = @()
        }
    }
    required_status_checks = @{
        strict = $true
        contexts = @()
        checks = @(
            @{ context = "CI 检查" },
            @{ context = "构建检查" },
            @{ context = "链接检查" },
            @{ context = "提交规范检查" },
            @{ context = "文件变更检查" },
            @{ context = "PR 标题检查" }
        )
    }
    enforce_admins = $true
    allow_force_deletions = $false
    restrictions = @{
        apps = @()
        users = @()
        teams = @()
    }
} | ConvertTo-Json -Depth 10

try {
    gh api --method PUT -H "Accept: application/vnd.github+json" $apiUrl -f body="$body" > $null
    Write-Host ""
    Write-Host "✅ 分支保护配置成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 已配置的规则：" -ForegroundColor Cyan
    Write-Host "  ✅ 要求 PR 审查（至少 1 人批准）" -ForegroundColor Green
    Write-Host "  ✅ 新提交时撤销旧批准" -ForegroundColor Green
    Write-Host "  ✅ 要求所有状态检查通过" -ForegroundColor Green
    Write-Host "  ✅ 要求分支必须是最新的" -ForegroundColor Green
    Write-Host "  ✅ 禁止管理员绕过" -ForegroundColor Green
    Write-Host "  ✅ 禁止强制推送" -ForegroundColor Green
    Write-Host "  ✅ 禁止删除分支" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  重要提示：" -ForegroundColor Yellow
    Write-Host "  1. 现在不能直接推送到 main 分支" -ForegroundColor White
    Write-Host "  2. 所有代码必须通过 PR 合并" -ForegroundColor White
    Write-Host "  3. PR 必须通过所有 CI 检查" -ForegroundColor White
    Write-Host "  4. PR 必须得到至少 1 人审查批准" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 查看配置：" -ForegroundColor Cyan
    Write-Host "  https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches" -ForegroundColor Blue
    Write-Host ""
    Write-Host "🎉 配置完成！" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ 配置失败" -ForegroundColor Red
    Write-Host "可能的原因：" -ForegroundColor Yellow
    Write-Host "  1. 你没有管理员权限" -ForegroundColor White
    Write-Host "  2. 分支保护规则已存在" -ForegroundColor White
    Write-Host "  3. 网络连接问题" -ForegroundColor White
    Write-Host ""
    Write-Host "可以手动配置：" -ForegroundColor Cyan
    Write-Host "  https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches" -ForegroundColor Blue
    exit 1
}
