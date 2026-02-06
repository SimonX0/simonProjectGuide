---
title: Git安全与协作面试题
---

# Git安全与协作面试题

## 安全最佳实践

### 如何保护敏感信息？

```bash
# 1. 使用.gitignore防止敏感文件提交
cat > .gitignore << EOF
# 环境变量
.env
.env.local
.env.*.local

# 密钥和证书
*.pem
*.key
*.crt
*.p12
*.jks

# 数据库
*.sql
*.sqlite
*.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# 操作系统
.DS_Store
Thumbs.db

# 日志
*.log
logs/
EOF

# 2. 检查已提交的敏感信息
git log --all --full-history --source -- "**/password.txt"
git log --all --full-history --source -- "*.pem"
git log --all -p --source -S "password"
git log --all -p --source -S "API_KEY"

# 3. 使用git-secrets（预防）
git install-secrets
git secrets --install ~/.git-templates/git-secrets
git secrets --register-aws
git secrets --add "password\s*=\s*['\"].+['\"]"
git secrets --add "api[_-]?key\s*=\s*['\"].+['\"]"

# 4. 清理已提交的敏感信息
# 方法1: git filter-repo（推荐）
pip install git-filter-repo
git filter-repo --invert-paths --path password.txt

# 方法2: BFG Repo-Cleaner
java -jar bfg.jar --delete-files password.txt repo.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. 强制推送（⚠️会影响团队）
git push origin --force --all

# 6. 通知团队成员
echo "!!! 敏感信息泄露警告 !!!"
echo "所有团队成员请执行："
echo "git fetch origin"
echo "git reset --hard origin/main"
```

### 如何使用GPG签名提交？

```bash
# 1. 生成GPG密钥
gpg --full-generate-key
# 选择: RSA and RSA
# 密钥大小: 4096
# 有效期: 0（永不过期）
# 输入姓名和邮箱

# 2. 查看密钥ID
gpg --list-secret-keys --keyid-format=long
# 输出: sec   rsa4096/3AA5C34371567BD2

# 3. 配置Git使用GPG
git config --global user.signingkey 3AA5C34371567BD2
git config --global commit.gpgsign true
git config --global gpg.program gpg

# 4. 签名提交
git commit -S -m "Signed commit"
# 或自动签名所有提交
git config --global commit.gpgsign true

# 5. 签名标签
git tag -s v1.0.0 -m "Signed tag"

# 6. 验证签名
git log --show-signature
git verify-commit HEAD
git verify-tag v1.0.0

# 7. 在GitHub/GitLab添加公钥
gpg --armor --export 3AA5C34371567BD2
# 复制输出到 GitHub Settings > SSH and GPG keys

# 8. 查看已验证的提交
git log --show-signature -1
```

### SSH密钥管理？

```bash
# 1. 生成SSH密钥（ed25519更安全）
ssh-keygen -t ed25519 -C "your_email@example.com"
# 或使用RSA
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 2. 添加到ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. 查看公钥
cat ~/.ssh/id_ed25519.pub
# 添加到GitHub/GitLab

# 4. 测试连接
ssh -T git@github.com
ssh -T git@gitlab.com

# 5. 配置多密钥
# ~/.ssh/config
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal

Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work

# 使用
git remote set-url origin git@github-personal:user/repo.git

# 6. 密钥权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub

# 7. 禁用密码登录
# 服务器配置: /etc/ssh/sshd_config
PasswordAuthentication no
PubkeyAuthentication yes

# 8. 限制SSH使用范围
# ~/.ssh/authorized_keys
command="git-upload-pack '/path/to/repo.git'" ssh-ed25519 AAAA... user@host
no-port-forwarding,no-X11-forwarding,no-agent-forwarding ssh-ed25519 AAAA... user@host
```

## 权限管理

### GitHub权限模型？

```
Owner (所有者)
  ├─ 完全控制
  ├─ 管理账单
  └─ 转让仓库

Admin (管理员)
  ├─ 完全控制仓库
  ├─ 管理协作者
  ├─ 推送保护
  └─ 删除分支

Maintain (维护者)
  ├─ 推送到所有分支
  ├─ 管理PR和Issues
  ├─ 编辑Wiki
  └─ 推送到保护分支（如果允许）

Write (写入者)
  ├─ 推送到非保护分支
  ├─ 创建PR
  └─ 管理Issues

Read (读取者)
  ├─ 克隆仓库
  ├─ 创建PR
  └─ 添加评论

Triage (协作者)
  ├─ 管理Issues和PR
  ├─ 标记Labels
  └─ 不能推送
```

### 分支保护规则？

```bash
# GitHub设置示例
# Settings > Branches > Add rule

分支保护配置：

main分支：
  ✅ Require pull request reviews before merging
    - Required approvals: 2
    - Dismiss stale reviews: yes
    - Require review from CODEOWNERS: yes

  ✅ Require status checks to pass before merging
    - Required checks:
      ✓ ci/ci.yml
      ✓ lint
      ✓ test
    - Require branches to be up to date: yes

  ✅ Do not allow bypassing the above settings

  ✅ Restrict who can push to this branch:
    - Admins only
    - specific team: devops

  ✅ Require signed commits

  ✅ Include administrators

  ✅ Allow force pushes: NO

# CODEOWNERS文件
cat > .github/CODEOWNERS << EOF
# 全局所有者
* @team-lead

# 特定目录
/src/auth/ @security-team
/src/payment/ @payment-team

# 特定文件
*.go @golang-team
package.json @frontend-lead

# 紧急修复可以绕过
/urgent/ @admin
EOF

# 测试CODEOWNERS
echo "Test" > test.txt
git add test.txt
git commit -m "Test"
git push origin test
# GitHub会自动请求审查
```

### 代码审查权限？

```bash
# 1. 必须审查的文件
# .github/CODEOWNERS
*.js @frontend-team
*.py @python-team

/Dockerfile @devops-team
/deploy/* @devops-team

# 2. 必需审查人数
# GitHub: Settings > Branches
Require approvals: 2

# 3. 代码所有者批准
Require review from CODEOWNERS: yes

# 4. 驳过旧审查
Dismiss stale reviews when new commits are pushed: yes

# 5. 要求特定团队成员批准
Require review from:
  - @tech-lead
  - @security-team

# 6. GitLab配置
# .gitlab/CODEOWNERS
frontend/** @frontend-team
backend/** @backend-team
*.yml @devops-team

# 7. 禁用自我批准
# Settings > General > Visibility
Users can approve their own merge requests: NO
```

## 审计与合规

### 如何审计仓库？

```bash
# 1. 提交审计
# 查看所有提交者
git log --format='%an <%ae>' | sort -u

# 查看特定用户的提交
git log --author="john@example.com"

# 统计每个用户的提交数
git shortlog -sn --all

# 2. 敏感信息扫描
# 使用git-secrets
git secrets --scan

# 或使用truffleHog
pip install truffleHog
trufflehog --regex --entropy=False /path/to/repo

# 3. 许可证审计
# 使用license-checker
npm install -g license-checker
license-checker --production

# 4. 依赖审计
npm audit
npm audit fix

# 或使用snyk
npm install -g snyk
snyk test

# 5. 分支审计
# 查看所有分支
git branch -a

# 查看未合并分支
git branch --no-merged main

# 查看已合并但未删除的分支
git branch --merged main | grep -v "\*"

# 6. 标签审计
git tag -l
git show v1.0.0

# 7. 大文件审计
git rev-list --objects --all |
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' |
  awk '/^blob/ {if($3>1000000) print}' |
  sort -n -k2

# 8. 自动化审计脚本
#!/bin/bash
# git-audit.sh
echo "=== Git仓库审计报告 ==="
echo "提交者统计:"
git shortlog -sn --all
echo -e "\n敏感文件检查:"
git log --all --oneline | grep -i "password\|secret\|key"
echo -e "\n大文件检查:"
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '/^blob/ {if($3>1000000) print $2" "$3}'
```

### 如何记录变更历史？

```bash
# 1. 详细的提交消息
feat(auth): add JWT authentication

- Implement JWT token generation
- Add refresh token mechanism
- Update API documentation

Closes #123
Related to #456

# 2. 查看变更历史
git log --all --graph --decorate --oneline

# 3. 查看特定文件历史
git log --follow --patch -- file.js

# 4. 查看特定作者的变更
git log --author="John" --since="1 month ago"

# 5. 查看特定时间范围的变更
git log --since="2024-01-01" --until="2024-01-31"

# 6. 统计变更
git diff --stat HEAD~10 HEAD

# 7. 生成变更报告
git log --since="1 month ago" --pretty=format:"%h - %an, %ar : %s" > CHANGELOG.md

# 8. 自动生成Changelog
npm install -g conventional-changelog-cli
conventional-changelog -p angular -i CHANGELOG.md -s
```

### 依赖安全扫描？

```bash
# 1. npm audit
npm audit
npm audit --json
npm audit fix

# 2. 使用Snyk
npm install -g snyk
snyk auth
snyk test
snyk monitor

# 3. 使用Dependabot
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  - package-ecosystem: "pip"
    directory: "/backend"
    schedule:
      interval: "daily"

# 4. 使用Trivy扫描容器镜像
trivy image python:3.9

# 5. 使用Grype
grype docker-image:alpine:latest

# 6. 自定义扫描脚本
#!/bin/bash
# security-scan.sh
echo "=== 安全扫描 ==="

# 检查敏感信息
echo "扫描敏感信息..."
git log --all -p -S "password" --source --all

# 检查依赖
echo "扫描依赖漏洞..."
npm audit --json > audit-report.json

# 检查许可证
echo "扫描许可证..."
license-checker --production --json > licenses.json
```

## 团队协作工具

### GitHub Actions集成？

```yaml
# .github/workflows/team-workflow.yml
name: Team Workflow

on:
  pull_request:
    types: [opened, synchronize, closed]

jobs:
  auto-assign:
    runs-on: ubuntu-latest
    if: github.event.action == 'opened'
    steps:
      - uses: kentaro-m/auto-assign-action@v1.2.0
        with:
          configuration-path: .github/auto-assign.yml

  pr-checklist:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## PR Checklist\n
              - [ ] 代码符合规范\n
              - [ ] 单元测试已更新\n
              - [ ] 文档已更新\n
              - [ ] 没有新的警告\n
              - [ ] 自我审查已完成`
            })

  notify-team:
    runs-on: ubuntu-latest
    if: github.event.action == 'closed' && github.event.pull_request.merged == true
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'PR merged by @${{ github.actor }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 代码审查工具？

```bash
# 1. 使用gh CLI
gh pr create
gh pr review 123
gh pr merge 123 --squash

# 2. GitLab CLI
glab mr create
glab mr merge 123

# 3. 自动审查机器人
# .github/review-bot.yml
name: Review Bot

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check PR title
        run: |
          TITLE="${{ github.event.pull_request.title }}"
          if [[ ! "$TITLE" =~ ^(feat|fix|docs|style|refactor|perf|test|chore)(\(.*\))?: ]]; then
            echo "PR title不符合规范"
            exit 1
          fi

      - name: Check PR description
        run: |
          BODY="${{ github.event.pull_request.body }}"
          if [ -z "$BODY" ]; then
            echo "PR描述不能为空"
            exit 1
          fi

      - name: Comment on PR
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🤖 审查通过！'
            })
```

### 多仓库管理？

```bash
# 1. 使用Git Subtree
# 添加共享库
git subtree add --prefix=libs/common https://github.com/company/common-lib.git main --squash

# 更新共享库
git subtree pull --prefix=libs/common https://github.com/company/common-lib.git main --squash

# 2. 使用Repo工具（Google）
# repo init -u manifest.git
# repo sync
# repo status
# repo upload

# 3. 使用gitslave（类似submodule）
gitslave init
gitslave clone https://github.com/user/lib.git libs/lib

# 4. 使用JFrog Artifactory
# 管理多个Git仓库的依赖

# 5. 批量操作脚本
#!/bin/bash
# multi-repo.sh
REPOS=(
  "https://github.com/company/frontend.git"
  "https://github.com/company/backend.git"
  "https://github.com/company/api.git"
)

for repo in "${REPOS[@]}"; do
  name=$(basename $repo .git)
  echo "Processing $name..."
  git clone $repo
  cd $name
  git fetch --all
  git pull origin main
  cd ..
done
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
