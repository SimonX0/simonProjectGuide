# GitLab CI 与 GitHub Actions

## GitLab CI/CD

### 什么是 GitLab CI

GitLab CI/CD 是 GitLab 内置的持续集成/持续部署工具，无需安装额外软件，通过 `.gitlab-ci.yml` 文件配置。

### 优势

- **内置集成**：与 GitLab 无缝集成
- **零配置**：创建项目即可使用
- **Docker 支持**：原生 Docker 执行器
- **可视化**：Pipeline 图形化展示
- **免费版功能强大**：CI/CD 功能免费开放

## GitLab CI 配置

### 基础配置

`.gitlab-ci.yml`：

```yaml
# 定义阶段
stages:
  - build
  - test
  - deploy

# 定义变量
variables:
  NODE_ENV: test
  CI: "true"

# 定义任务
build:
  stage: build
  image: node:16
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  image: node:16
  dependencies:
    - build
  script:
    - npm run test

deploy:
  stage: deploy
  image: alpine:3.14
  dependencies:
    - build
  script:
    - echo "Deploying..."
  only:
    - main
```

### 核心概念

**stages**
```yaml
stages:
  - build
  - test
  - deploy
```

**jobs**
```yaml
job-name:
  stage: build
  script:
    - echo "Running build"
```

**variables**
```yaml
variables:
  VAR_NAME: value
```

**before_script & after_script**
```yaml
job:
  before_script:
    - echo "Before job"
  script:
    - echo "Job script"
  after_script:
    - echo "After job"
```

### 常用配置

**缓存**
```yaml
job:
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  script:
    - npm install
```

**产物**
```yaml
job:
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
```

**依赖**
```yaml
test:
  dependencies:
    - build
  script:
    - npm test
```

**条件执行**
```yaml
job:
  only:
    - main
    - develop
  except:
    - feature/*
  when: manual
```

## GitLab CI 实战

### Node.js 应用

```yaml
stages:
  - install
  - lint
  - test
  - build
  - deploy

variables:
  NODE_ENV: test
  DOCKER_DRIVER: overlay2

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/

install:
  stage: install
  image: node:16-alpine
  script:
    - npm ci
  cache:
    paths:
      - node_modules/

lint:
  stage: lint
  image: node:16-alpine
  dependencies:
    - install
  script:
    - npm run lint

test:
  stage: test
  image: node:16-alpine
  dependencies:
    - install
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  script:
    - npm run test:ci
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: node:16-alpine
  dependencies:
    - install
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
  only:
    - main
    - develop

deploy:dev:
  stage: deploy
  image: alpine:3.14
  dependencies:
    - build
  script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan $DEPLOY_HOST >> ~/.ssh/known_hosts
    - rsync -avz --delete dist/ $DEPLOY_USER@$DEPLOY_HOST:/var/www/dev
  only:
    - develop

deploy:prod:
  stage: deploy
  image: alpine:3.14
  dependencies:
    - build
  script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan $DEPLOY_HOST >> ~/.ssh/known_hosts
    - rsync -avz --delete dist/ $DEPLOY_USER@$DEPLOY_HOST:/var/www/prod
  when: manual
  only:
    - main
```

### Docker 构建

```yaml
stages:
  - build
  - deploy

build:image:
  stage: build
  image: docker:20.10
  services:
    - docker:20.10-dind
  variables:
    IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE_TAG .
    - docker tag $IMAGE_TAG $CI_REGISTRY_IMAGE:latest
    - docker push $IMAGE_TAG
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main

deploy:k8s:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/myapp myapp=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
    - kubectl rollout status deployment/myapp
  only:
    - main
```

## GitHub Actions

### 什么是 GitHub Actions

GitHub Actions 是 GitHub 提供的 CI/CD 服务，直接集成在 GitHub 中，支持自定义工作流。

### 优势

- **深度集成**：与 GitHub 完美集成
- **YAML 配置**：简单的 YAML 文件配置
- **市场丰富**：大量预制 Actions
- **免费额度**：公开项目无限使用
- **多平台支持**：Linux、macOS、Windows

## GitHub Actions 配置

### 基础配置

`.github/workflows/ci.yml`：

```yaml
name: CI

# 触发条件
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

# 环境变量
env:
  NODE_ENV: test

# 任务
jobs:
  build:
    # 运行环境
    runs-on: ubuntu-latest

    # 步骤
    steps:
    # 检出代码
    - uses: actions/checkout@v3

    # 设置 Node.js
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'

    # 安装依赖
    - name: Install dependencies
      run: npm ci

    # 运行测试
    - name: Run tests
      run: npm test

    # 构建项目
    - name: Build
      run: npm run build
```

### 核心概念

**on（触发条件）**
```yaml
on:
  push:                    # Push 事件
    branches: [main]
  pull_request:            # PR 事件
    branches: [main]
  schedule:                # 定时执行
    - cron: '0 0 * * *'
  workflow_dispatch:       # 手动触发
```

**jobs（任务）**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Building..."
```

**steps（步骤）**
```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v3

  - name: Run script
    run: ./script.sh
```

## 常用 Actions

### 检出代码

```yaml
- uses: actions/checkout@v3
  with:
    fetch-depth: 0         # 获取完整历史
```

### 设置 Node.js

```yaml
- uses: actions/setup-node@v3
  with:
    node-version: '16'
    cache: 'npm'
```

### 设置 Python

```yaml
- uses: actions/setup-python@v4
  with:
    python-version: '3.9'
    cache: 'pip'
```

### 缓存依赖

```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### Docker 登录

```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v2
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

### 部署到服务器

```yaml
- name: Deploy to Server
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.HOST }}
    username: ${{ secrets.USERNAME }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd /var/www/app
      git pull
      npm install
      npm run build
      pm2 restart app
```

## GitHub Actions 实战

### Node.js CI/CD

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 测试任务
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linter
      run: npm run lint

    - name: Run tests
      run: npm run test:ci

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info

  # 构建任务
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/

  # 部署任务
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Download artifacts
      uses: actions/download-artifact@v3
      with:
        name: dist

    - name: Deploy to Server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.DEPLOY_HOST }}
        username: ${{ secrets.DEPLOY_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          rm -rf /var/www/app/*
          cp -r . /var/www/app/
```

### Docker 构建

```yaml
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          username/app:latest
          username/app:${{ github.sha }}
        cache-from: type=registry,ref=username/app:buildcache
        cache-to: type=registry,ref=username/app:buildcache,mode=max
```

## 密钥管理

### GitLab CI

```yaml
# 设置 CI/CD 变量
# Settings → CI/CD → Variables

deploy:
  script:
    - echo $DATABASE_URL
    - echo $API_KEY
```

### GitHub Actions

```yaml
# 设置 Secrets
# Settings → Secrets → Actions

- name: Deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    API_KEY: ${{ secrets.API_KEY }}
  run: ./deploy.sh
```

## 工具对比

| 特性 | GitLab CI | GitHub Actions |
|------|-----------|----------------|
| 集成度 | 原生集成 | 原生集成 |
| 配置文件 | .gitlab-ci.yml | .github/workflows/*.yml |
| 免费额度 | 无限制 | 公开项目无限制 |
| 自托管 | 支持 | 支持 |
| 市场 | 集成 | Actions 市场 |
| 可视化 | 强 | 一般 |

## 最佳实践

### GitLab CI

1. **使用缓存加速构建**
2. **合理使用 artifacts**
3. **并行执行任务**
4. **使用模板复用配置**

### GitHub Actions

1. **使用 composite actions**
2. **利用 workflow 复用**
3. **合理使用缓存**
4. **矩阵测试多版本**

## 学习建议

### 实践建议

1. **从简单工作流开始**
2. **使用官方文档**
3. **参考优秀项目**
4. **持续优化**

### 练习任务

- [ ] 配置 GitLab CI 流水线
- [ ] 配置 GitHub Actions 工作流
- [ ] 实现自动化测试
- [ ] 配置自动化部署
- [ ] 设置密钥管理

## 总结

GitLab CI 和 GitHub Actions 都是优秀的 CI/CD 工具。通过本章学习，你应该掌握了：

- GitLab CI 的配置和使用
- GitHub Actions 的配置和使用
- 两种工具的实战应用
- 密钥管理和安全配置

下一章我们将学习 [系统监控与日志](chapter-11)，了解如何监控应用和分析日志。
