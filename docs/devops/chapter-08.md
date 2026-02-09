# CI/CD 基础概念

## 什么是 CI/CD

CI/CD 是 Continuous Integration（持续集成）和 Continuous Deployment/Delivery（持续部署/交付）的缩写，是现代软件开发的核心实践。

### CI（持续集成）

持续集成是指开发人员频繁地将代码集成到共享分支中，每次集成都通过自动化的构建和测试来验证。

**核心实践**
- 频繁提交代码（每天至少一次）
- 自动化构建和测试
- 快速反馈
- 保持主线可部署状态

### CD（持续交付/部署）

**持续交付**：确保代码可以随时部署到生产环境。

**持续部署**：自动将通过测试的代码部署到生产环境。

### CI/CD 价值

```
开发 → CI → CD → 生产
  ↓      ↓     ↓      ↓
 快速  自动  自动  快速
  反馈  测试  发布  交付
```

**收益**
- 更快的交付速度
- 更早发现问题
- 更少的集成问题
- 更高的代码质量
- 更快的用户反馈

## CI/CD 流程

### 传统流程 vs CI/CD 流程

**传统流程**
```
开发 → 测试 → 集成 → 部署
(数周) (数周) (数周) (数周)
```

**CI/CD 流程**
```
开发 → 构建 → 测试 → 部署
(分钟) (秒)   (分钟) (分钟)
```

### 完整的 CI/CD 流水线

```
┌─────────────────────────────────────────────────┐
│                  CI 流程                         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │代码  │→ │构建  │→ │测试  │→ │打包  │       │
│  │提交  │  │      │  │      │  │      │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│                  CD 流程                         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │部署  │→ │测试  │→ │发布  │→ │监控  │       │
│  │预发  │  │验证  │  │生产  │  │反馈  │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
└─────────────────────────────────────────────────┘
```

## CI/CD 组成部分

### 版本控制

```bash
# Git 工作流
feature/login → develop → main
                 ↓
              持续集成
```

**分支策略**
- **Git Flow**：功能分支、发布分支、热修复分支
- **GitHub Flow**：功能分支直接合并到主分支
- **GitLab Flow**：环境分支（dev、staging、prod）

### 自动化构建

```bash
# 典型构建流程
git pull          # 拉取代码
npm install       # 安装依赖
npm run build     # 构建
npm run test      # 测试
```

### 自动化测试

**测试金字塔**
```
        /\
       /E2E\        少量端到端测试
      /------\
     /  集成  \     适量集成测试
    /----------\
   /   单元测试   \  大量单元测试
  /--------------\
```

**测试类型**
- **单元测试**：测试单个函数/组件
- **集成测试**：测试模块间交互
- **端到端测试**：测试完整用户流程

### 代码质量检查

```yaml
# 代码检查工具
ESLint:           # JavaScript 代码检查
Prettier:         # 代码格式化
SonarQube:        # 代码质量分析
```

### 部署策略

**蓝绿部署**
```
蓝版本（v1）← 生产流量
绿版本（v2）← 部署新版本

切换流量
蓝版本（v1）
绿版本（v2）← 生产流量
```

**金丝雀发布**
```
v1: 90% 流量
v2: 10% 流量 ← 新版本

验证后逐步增加流量
v1: 50% 流量
v2: 50% 流量

最后完全切换
v1: 0%
v2: 100% 流量
```

**滚动更新**
```
实例1: v1 → v2
实例2: v1 → v2
实例3: v1 → v2
...
```

## CI/CD 最佳实践

### 代码提交

**提交规范**
```bash
# 提交信息格式
<type>(<scope>): <subject>

# 示例
feat(auth): 添加用户登录功能
fix(api): 修复token验证bug
docs(readme): 更新安装文档
```

**提交频率**
- 小步快跑，频繁提交
- 每次提交包含完整功能
- 保持代码可编译、可测试

### 分支管理

**保护分支**
```yaml
# main 分支保护规则
- 需要 PR 审核
- 通过 CI 检查
- 禁止直接推送
- 至少 1 个批准
```

**分支命名**
```
feature/          # 新功能
bugfix/           # Bug 修复
hotfix/           # 紧急修复
release/          # 发布版本
```

### 自动化测试

**测试覆盖率**
```bash
# 设置覆盖率目标
"scripts": {
  "test": "jest --coverage",
  "test:ci": "jest --coverage --coverageThreshold='{\"global\":{\"branches\":80,\"functions\":80,\"lines\":80,\"statements\":80}}'"
}
```

**测试分层**
```bash
# 快速测试（CI 运行）
npm run test:unit

# 完整测试（发布前运行）
npm run test:integration
npm run test:e2e
```

### 环境管理

**环境配置**
```yaml
# 开发环境
NODE_ENV=development
API_URL=http://localhost:3000

# 测试环境
NODE_ENV=test
API_URL=http://test.api.com

# 生产环境
NODE_ENV=production
API_URL=https://api.com
```

**配置分离**
```bash
# .env.development
NODE_ENV=development

# .env.production
NODE_ENV=production
```

## CI/CD 工具链

### 版本控制
- Git
- GitHub
- GitLab
- Bitbucket

### CI 工具
- Jenkins
- GitLab CI
- GitHub Actions
- Travis CI
- CircleCI

### CD 工具
- Spinnaker
- ArgoCD
- Flux
- Rudder

### 配置管理
- Ansible
- Chef
- Puppet
- SaltStack

### 容器化
- Docker
- Kubernetes
- Helm

## CI/CD 实施步骤

### 阶段一：持续集成

1. **建立版本控制**
   ```bash
   # 初始化仓库
   git init
   git add .
   git commit -m "feat: 初始化项目"
   ```

2. **配置自动化构建**
   ```yaml
   # .gitlab-ci.yml
   build:
     script:
       - npm install
       - npm run build
   ```

3. **添加自动化测试**
   ```yaml
   test:
     script:
       - npm run test
   ```

### 阶段二：持续交付

1. **配置自动化部署**
   ```yaml
   deploy:staging:
     script:
       - npm run deploy:staging
   ```

2. **环境管理**
   ```bash
   dev → staging → production
   ```

### 阶段三：持续部署

1. **自动化生产部署**
   ```yaml
   deploy:production:
     script:
       - npm run deploy:production
     only:
       - main
     when: manual  # 手动触发
   ```

2. **监控和回滚**
   ```bash
   # 监控应用状态
   # 发现问题自动回滚
   ```

## 常见指标

### CI/CD 成功指标

**部署频率**
```
每月 → 每周 → 每天 → 每次 commit
```

**变更前置时间**
```
从代码提交到部署生产的时间
理想：< 1小时
```

**变更失败率**
```
部署后需要回滚的比例
目标：< 15%
```

**服务恢复时间**
```
从发现故障到恢复服务的时间
目标：< 1小时
```

### DORA 指标

**精英表现者**
- 部署频率：按需部署
- 前置时间：< 1小时
- 故障恢复：< 1小时
- 变更失败率：< 15%

## 常见问题

### 构建失败

**问题**
```bash
# 依赖安装失败
npm install

# 测试失败
npm test
```

**解决**
- 本地先验证
- 固定依赖版本
- 使用 CI/CD 缓存

### 测试不稳定

**问题**
```bash
# 时而成功时而失败
npm test
```

**解决**
- 隔离测试环境
- 使用测试替身（Mock）
- 增加重试机制

### 部署失败

**问题**
```bash
# 部署后应用异常
```

**解决**
- 预发环境验证
- 灰度发布
- 快速回滚机制

## 学习建议

### 实践建议

1. **从简单开始**
   - 先实现 CI
   - 再实现 CD
   - 最后优化流程

2. **小步迭代**
   - 每次改进一小步
   - 持续优化

3. **团队协作**
   - 共同制定规范
   - 定期回顾改进

### 练习任务

- [ ] 设置 Git 分支保护规则
- [ ] 编写自动化测试
- [ ] 配置基础 CI 流程
- [ ] 实现自动化部署
- [ ] 设置监控和告警

## 总结

CI/CD 是现代软件交付的核心实践。通过本章学习，你应该了解了：

- CI/CD 的概念和价值
- 完整的 CI/CD 流程
- 部署策略和最佳实践
- 常见工具和指标

下一章我们将学习 [Jenkins 持续集成](chapter-09)，深入了解如何使用 Jenkins 实现 CI/CD。
