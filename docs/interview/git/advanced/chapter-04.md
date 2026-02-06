---
title: Git工作流面试题
---

# Git工作流面试题

## 团队协作工作流

### Feature Branch工作流？

```
main (稳定)
├── feature/user-auth
├── feature/payment
└── feature/dashboard

每个功能独立分支，完成后合并到main
```

**阿里、字节等大厂实践**：

```bash
# 1. 创建功能分支
git checkout main
git pull origin main
git checkout -b feature/user-auth

# 2. 开发并提交
git add .
git commit -m "feat(auth): add JWT authentication"

# 3. 推送到远程
git push -u origin feature/user-auth

# 4. 创建Merge Request (GitLab) / Pull Request (GitHub)

# 5. 代码审查后合并
# 在Web界面操作，或命令行：
git checkout main
git merge --no-ff feature/user-auth  # 保留分支历史
git push origin main

# 6. 删除功能分支
git branch -d feature/user-auth
git push origin --delete feature/user-auth
```

### Trunk-Based Development？

主干开发，所有人直接在主分支开发，通过特性开关控制功能发布。

```
main (持续开发)
├── Feature Flag A (off)
├── Feature Flag B (on)
└── Feature Flag C (testing)

Google、Facebook采用的模式
```

**实践要点**：

```bash
# 1. 所有开发直接在main分支
git checkout main
git pull
# 开发功能...

# 2. 使用特性开关控制功能发布
// feature_flags.js
export const FEATURES = {
  NEW_UI: false,      // 功能未发布
  PAYMENT_V2: true,   // 功能已发布
  EXPERIMENTAL: false // 测试中
};

// 代码中使用
if (FEATURES.NEW_UI) {
  return <NewUI />;
} else {
  return <OldUI />;
}

// 3. 小步提交，频繁集成
git add .
git commit -m "Add feature flag for new UI"
git push

// 4. CI/CD自动测试和部署
// main分支的每次提交都会自动部署到测试环境
```

**优点**：
- 避免合并冲突
- 持续集成
- 快速反馈

**缺点**：
- 需要完善的特性开关系统
- 需要强大的CI/CD

## 代码审查流程

### Pull Request最佳实践？

```bash
# 1. PR标题格式（Conventional Commits）
feat: add user authentication
fix: resolve memory leak in data processor
docs: update README with setup instructions
refactor: simplify API response handling
test: add unit tests for auth module

# 2. PR描述模板
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No new warnings generated

## Related Issues
Closes #123
Related to #456

# 3. 创建PR
gh pr create \
  --title "feat: add user authentication" \
  --body "$(cat pr_template.md)" \
  --base main \
  --head feature/user-auth

# 4. 请求审查
gh pr edit 123 --add-reviewer "username"
gh pr edit 123 --add-reviewer "team/backend"

# 5. 更新PR
git commit --amend  # 或正常提交
git push
```

### 代码审查清单？

**美团、腾讯等大厂的审查标准**：

```markdown
## 代码质量
- [ ] 代码符合团队规范
- [ ] 没有明显的性能问题
- [ ] 错误处理完善
- [ ] 没有硬编码的配置
- [ ] 变量和函数命名清晰

## 架构设计
- [ ] 没有过度设计
- [ ] 模块职责单一
- [ ] 接口设计合理
- [ ] 考虑了扩展性

## 测试
- [ ] 单元测试覆盖率 > 80%
- [ ] 关键路径有集成测试
- [ ] 边界情况已测试

## 安全
- [ ] 没有SQL注入风险
- [ ] 没有XSS漏洞
- [ ] 敏感数据已加密
- [ ] 权限检查完善

## 文档
- [ ] README已更新
- [ ] API文档已更新
- [ ] 复杂逻辑有注释

## 兼容性
- [ ] 向后兼容（除非是breaking change）
- [ ] 考虑了数据迁移
- [ ] 考虑了版本升级
```

### 自动化代码审查？

```bash
# .github/workflows/code-review.yml
name: Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      # 1. 代码格式检查
      - name: Prettier
        run: npx prettier --check 'src/**/*.{js,jsx,ts,tsx}'

      # 2. Lint检查
      - name: ESLint
        run: npm run lint

      # 3. 类型检查
      - name: TypeScript
        run: npx tsc --noEmit

      # 4. 安全扫描
      - name: Safety Check
        run: npm audit --audit-level=high

      # 5. 代码复杂度检查
      - name: Complexity Report
        run: npx complexity-report -f json src/

      # 6. 自动审查评论
      - name: Review Bot
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🤖 自动审查通过！'
            })
```

## CI/CD集成

### Git Hooks自动化？

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 1. 代码格式化
echo "Running Prettier..."
npx prettier --write 'src/**/*.{js,jsx,ts,tsx}'

# 2. Lint检查
echo "Running ESLint..."
npm run lint -- --fix

# 3. 类型检查
echo "Running TypeScript..."
npx tsc --noEmit

# 4. 运行相关测试
echo "Running tests..."
npm test -- --related

# 5. 检查文件大小
echo "Checking file sizes..."
npx file-size-checker

git add .  # 自动添加格式化后的文件
```

```bash
# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 验证commit消息格式
# Conventional Commits: feat: xxx, fix: xxx, etc.
npx commitlint --edit $1
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',     // 新功能
      'fix',      // 修复bug
      'docs',     // 文档
      'style',    // 格式
      'refactor', // 重构
      'perf',     // 性能优化
      'test',     // 测试
      'chore',    // 构建/工具
      'revert'    // 回退
    ]],
    'scope-enum': [2, 'always', [
      'auth', 'user', 'payment', 'api', 'ui'
    ]],
    'subject-case': [0]  // 不限制大小写
  }
}
```

### GitHub Actions工作流？

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # 获取完整历史用于git analysis

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

      - name: Build
        run: npm run build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist-${{ matrix.node-version }}
          path: dist/

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npm run type-check
```

### 自动化部署？

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - uses: actions/checkout@v3

      - name: Build
        run: |
          npm ci
          npm run build

      - name: Deploy to Staging
        run: |
          # 部署到测试环境
          rsync -avz dist/ user@staging:/var/www/html/

      - name: Smoke Tests
        run: |
          curl -f https://staging.example.com/health || exit 1

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com

    steps:
      - uses: actions/checkout@v3

      - name: Create Release
        id: release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          draft: false
          prerelease: false

      - name: Deploy to Production
        run: |
          # 部署到生产环境
          kubectl set image deployment/app \
            app=registry.example.com/app:${{ github.run_number }}
```

## 版本管理

### 语义化版本？

```bash
# 格式：MAJOR.MINOR.PATCH
# 1.2.3
#   │  │  └─ PATCH: bug修复
#   │  └──── MINOR: 新功能（向后兼容）
#   └─────── MAJOR: 破坏性变更

# 示例
1.0.0 -> 1.0.1  # bug修复
1.0.1 -> 1.1.0  # 新功能
1.1.0 -> 2.0.0  # 破坏性变更
```

**自动化版本发布**：

```bash
# package.json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major"
  }
}
```

```bash
# .versionrc
{
  "types": [
    { "type": "feat", "section": "Features" },
    { "type": "fix", "section": "Bug Fixes" },
    { "type": "chore", "hidden": true },
    { "type": "docs", "hidden": true },
    { "type": "style", "hidden": true },
    { "type": "refactor", "hidden": true },
    { "type": "perf", "section": "Performance Improvements" },
    { "type": "test", "hidden": true }
  ]
}
```

```bash
# 使用
npm run release
# 自动：
# 1. 更新package.json版本
# 2. 生成CHANGELOG.md
# 3. 提交更改
# 4. 创建git tag

# 推送标签
git push --follow-tags origin main
```

### Git标签管理？

```bash
# 1. 列出标签
git tag
git tag -l "v1.*"  # 列出v1.x.x的标签

# 2. 创建标签
git tag v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"

# 3. 为历史提交打标签
git tag -a v0.9.0 abc1234 -m "Initial release"

# 4. 推送标签到远程
git push origin v1.0.0  # 推送单个标签
git push origin --tags   # 推送所有标签

# 5. 删除标签
git tag -d v1.0.0        # 删除本地标签
git push origin --delete v1.0.0  # 删除远程标签

# 6. 查看标签信息
git show v1.0.0

# 7. 检出标签
git checkout v1.0.0
git checkout -b hotfix v1.0.0  # 基于标签创建分支
```

### 发布流程？

```bash
#!/bin/bash
# release.sh - 自动化发布脚本

set -e

# 1. 检查分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Error: Must be on main branch"
  exit 1
fi

# 2. 检查工作区状态
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working directory is not clean"
  exit 1
fi

# 3. 拉取最新代码
git pull origin main

# 4. 运行测试
npm test

# 5. 构建生产版本
npm run build

# 6. 生成版本号
LAST_TAG=$(git describe --tags --abbrev=0)
NEW_VERSION=$(echo $LAST_TAG | awk -F. '{print $1"."$2"."$3+1}')

# 7. 更新版本
echo "New version: $NEW_VERSION"
npm version $NEW_VERSION

# 8. 生成CHANGELOG
npm run changelog

# 9. 提交更改
git add .
git commit -m "chore(release): bump version to $NEW_VERSION"

# 10. 创建标签
git tag -a $NEW_VERSION -m "Release $NEW_VERSION"

# 11. 推送
git push origin main
git push origin $NEW_VERSION

# 12. 创建GitHub Release
gh release create $NEW_VERSION \
  --notes "Release $NEW_VERSION" \
  --title "$NEW_VERSION"

echo "Release $NEW_VERSION completed!"
```

## 发布策略

### 蓝绿部署？

```
┌────────────┐
│   Load     │
│  Balancer  │
└─────┬──────┘
      │
      ├────> Blue (Current)
      │      └─ v1.0
      │
      └────> Green (New)
             └─ v1.1

切换流量：瞬间切换，无停机
```

**实现**：

```bash
# deploy-blue-green.sh

BLUE_PORT=3000
GREEN_PORT=3001

# 检查当前版本
CURRENT_COLOR=$(curl -s http://localhost/api/color)

if [ "$CURRENT_COLOR" = "blue" ]; then
  NEW_COLOR="green"
  NEW_PORT=$GREEN_PORT
else
  NEW_COLOR="blue"
  NEW_PORT=$BLUE_PORT
fi

echo "Deploying to $NEW_COLOR on port $NEW_PORT"

# 1. 部署到新环境
git clone $REPO /var/www/$NEW_COLOR
cd /var/www/$NEW_COLOR
git checkout $VERSION
npm install
npm run build
PORT=$NEW_PORT npm start &

# 2. 健康检查
sleep 10
curl -f http://localhost:$NEW_PORT/health || exit 1

# 3. 切换流量
kubectl patch service app -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'

# 4. 等待确认
echo "Switched to $NEW_COLOR. Press Enter to continue..."
read

# 5. 清理旧版本
OLD_COLOR=$([ "$NEW_COLOR" = "blue" ] && echo "green" || echo "blue")
# 保留旧版本用于回滚
```

### 金丝雀发布？

```
流量分配：
v1.0 (Old) ████████████████ 100%
                 ↓
v1.0 (Old) ████████ 90%
v1.1 (New) ██ 10%
                 ↓
v1.0 (Old) ████ 50%
v1.1 (New) ██████ 50%
                 ↓
v1.0 (Old) █ 5%
v1.1 (New) ██████████ 95%
                 ↓
v1.1 (New) ████████████████ 100%
```

**实现**：

```yaml
# kubernetes-canary.yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: app
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  service:
    port: 80
    targetPort: http
  analysis:
    interval: 1m
    threshold: 5
    maxWeight: 50
    stepWeight: 10
    metrics:
      - name: request-success-rate
        thresholdRange:
          min: 99
      - name: request-duration
        thresholdRange:
          max: 500
  webhooks:
    - name: smoke-test
      url: http://flagger-loadtester/
      timeout: 5s
      metadata:
        cmd: "curl -s http://app-canary/"
```

### 滚动发布？

```yaml
# kubernetes-rolling.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2        # 最多多2个Pod
      maxUnavailable: 1  # 最多1个Pod不可用
  template:
    spec:
      containers:
      - name: app
        image: app:v1.1
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 3
```

**发布过程**：
```
1. 创建2个新Pod (v1.1)
2. 等待新Pod就绪
3. 删除1个旧Pod (v1.0)
4. 重复直到所有Pod更新
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
