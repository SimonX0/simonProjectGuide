---
title: CI/CD基础面试题
---

# CI/CD基础面试题

## CI/CD核心概念

### 1. 解释CI/CD的含义和流程？

**CI/CD定义**：

**CI（Continuous Integration，持续集成）**：
- 频繁地将代码集成到主干分支
- 每次提交自动触发构建和测试
- 快速发现集成错误

**CD（Continuous Delivery/Deployment，持续交付/部署）**：
- **持续交付**：代码通过测试后，手动部署到生产环境
- **持续部署**：代码通过测试后，自动部署到生产环境

**CI/CD流程图**：
```
开发者提交代码
    │
    ▼
┌─────────────────┐
│   代码仓库       │ (Git)
│  (GitLab/GitHub) │
└────────┬────────┘
         │ Push事件
         ▼
┌─────────────────┐
│   CI/CD平台     │ (Jenkins/GitLab CI)
│  触发Pipeline    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ 构建    │ │ 测试    │
│ (Build) │ │ (Test) │
└───┬────┘ └───┬────┘
    │          │
    │    ┌─────┴─────┐
    │    │           │
    │    ▼           ▼
    │ ┌────────┐ ┌────────┐
    │ │ 单元   │ │ 集成   │
    │ │ 测试   │ │ 测试   │
    │ └────────┘ └────────┘
    │    │           │
    │    └─────┬─────┘
    │          │
    │          ▼
    │    ┌─────────┐
    │    │ 代码质量 │
    │    │ 扫描    │
    │    └─────────┘
    │          │
    └──────────┤
               │ 全部通过？
               │
        ┌──────┴──────┐
        │ NO          │ YES
        ▼             ▼
   ┌─────────┐  ┌────────────┐
   │ 通知失败 │  │   镜像构建   │
   │ 停止流水线│  │  (Docker)   │
   └─────────┘  └──────┬─────┘
                       │
                       ▼
                 ┌─────────────┐
                 │  推送镜像    │
                 │  (Registry) │
                 └──────┬──────┘
                        │
                        ▼
                  ┌─────────────┐
                  │  部署到环境  │
                  │ dev/test/prod│
                  └──────┬──────┘
                         │
                         ▼
                   ┌─────────────┐
                   │  健康检查    │
                   │  回滚(失败)  │
                   └─────────────┘
```

### 2. CI/CD的最佳实践？

**1. 频繁提交，小步快跑**
```bash
# ❌ 差：一周提交一次，一次1000行改动
git commit -m "完成所有功能"

# ✅ 好：每天多次提交，每次改动小
git commit -m "feat: 添加用户登录接口"
git commit -m "fix: 修复登录验证bug"
```

**2. 自动化一切可自动化的**
```yaml
# 自动化测试
stages:
  - test
  - build
  - deploy

test:
  script:
    - npm run test
    - npm run lint
    - npm run test:e2e

build:
  script:
    - docker build -t myapp:$CI_COMMIT_SHA .
    - docker push registry.example.com/myapp:$CI_COMMIT_SHA
```

**3. 保持构建快速**
```yaml
# 使用缓存
variables:
  DOCKER_DRIVER: overlay2
  CACHE_KEY: "$CI_COMMIT_REF_SLUG"

cache:
  paths:
    - node_modules/
    - .npm/

before_script:
  - npm ci --cache .npm --prefer-offline
```

**4. 失败快速（Fail Fast）**
```yaml
# 按顺序执行，失败立即停止
stages:
  - lint       # 第一步：代码规范检查（最快失败）
  - unit       # 第二步：单元测试
  - integration # 第三步：集成测试
  - build      # 第四步：构建
  - deploy     # 第五步：部署

lint:
  stage: lint
  script:
    - npm run lint
  only:
    - merge_requests
```

**5. 环境一致性**
```dockerfile
# 开发、测试、生产使用相同的镜像
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["npm", "start"]
```

**6. 金丝雀发布**
```yaml
# 部署5%的流量到新版本
deploy_canary:
  stage: deploy
  script:
    - kubectl set image deployment/myapp myapp=myapp:v2
    - kubectl scale deployment myapp --replicas=2  # 假设总副本40个
  when: manual  # 手动确认后全量发布
```

**7. 基础设施即代码**
```hcl
# Terraform定义基础设施
resource "kubernetes_deployment" "app" {
  metadata {
    name = "myapp"
  }
  spec {
    replicas = 3
    # ... 配置
  }
}
```

**8. 监控和告警**
```yaml
# 部署后监控
deploy:
  stage: deploy
  script:
    - kubectl apply -f k8s/
  after_script:
    - ./scripts/health-check.sh  # 健康检查
    - ./scripts/notify-slack.sh  # 通知
```

## Jenkins Pipeline

### 3. Jenkins的声明式Pipeline和脚本式Pipeline的区别？

**声明式Pipeline（Declarative）**：
```groovy
pipeline {
    agent any

    // 定义参数
    parameters {
        string(name: 'VERSION', defaultValue: '1.0.0', description: '版本号')
        choice(name: 'ENV', choices: ['dev', 'test', 'prod'], description: '环境')
    }

    // 定义环境变量
    environment {
        APP_NAME = 'myapp'
        REGISTRY = 'registry.example.com'
    }

    // 定义工具
    tools {
        maven 'Maven 3.8'
        jdk 'JDK 11'
    }

    // 定义选项
    options {
        timeout(time: 1, unit: 'HOURS')
        retry(3)
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }

        stage('Test') {
            parallel {
                stage('Unit Test') {
                    steps {
                        sh 'mvn test'
                    }
                }
                stage('Integration Test') {
                    steps {
                        sh 'mvn verify'
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh "./deploy.sh ${params.ENV}"
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            emailext(
                subject: "构建成功: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "构建成功！\n${env.BUILD_URL}",
                to: 'team@example.com'
            )
        }
        failure {
            emailext(
                subject: "构建失败: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "构建失败，请检查！\n${env.BUILD_URL}",
                to: 'team@example.com'
            )
        }
    }
}
```

**脚本式Pipeline（Scripted）**：
```groovy
node {
    def appName = 'myapp'
    def version = '1.0.0'

    try {
        stage('Checkout') {
            checkout scm
        }

        stage('Build') {
            sh "mvn clean package -Dversion=${version}"
        }

        def testResults = stage('Test') {
            parallel(
                "unit": { sh 'mvn test' },
                "integration": { sh 'mvn verify' }
            )
        }

        stage('Deploy') {
            if (env.BRANCH_NAME == 'main') {
                sh "./deploy.sh prod"
            }
        }

        // 通知成功
        emailext(subject: "Success", body: "Build passed!", to: 'team@example.com')

    } catch (Exception e) {
        // 通知失败
        emailext(subject: "Failed", body: "Build failed: ${e}", to: 'team@example.com')
        throw e
    } finally {
        cleanWs()
    }
}
```

**对比表**：
| 特性          | 声明式Pipeline        | 脚本式Pipeline       |
|-------------|---------------------|---------------------|
| **语法**      | 更简单，结构化        | 灵活，Groovy完全语法  |
| **可读性**    | 高，适合初学者        | 需要Groovy知识       |
| **功能**      | 满足大部分需求        | 更强大，可做复杂逻辑   |
| **错误检查**  | 编译前检查            | 运行时检查           |
| **推荐**      | ✅ 推荐使用           | 复杂场景使用          |

### 4. Jenkinsfile的常用指令和最佳实践？

**常用指令**：

**1. agent**
```groovy
// 任意可用agent
agent any

// 指定标签
agent { label 'docker' }

// Docker容器
agent {
    docker {
        image 'node:18'
        args '-v $HOME/.npm:/root/.npm'
    }
}

// Kubernetes Pod
agent {
    kubernetes {
        yaml """
        spec:
          containers:
          - name: node
            image: node:18
            command:
            - cat
            tty: true
        """
    }
}

// 无agent（用于控制stage）
agent none
```

**2. stages和steps**
```groovy
stages {
    stage('Build') {
        steps {
            sh 'npm run build'
            sh 'docker build -t myapp:${BUILD_NUMBER} .'
        }
    }
}
```

**3. environment**
```groovy
// 全局环境变量
environment {
    NODE_ENV = 'production'
    API_KEY = credentials('api-key-secret')
}

// 阶段级环境变量
stages {
    stage('Deploy') {
        environment {
            DEPLOY_ENV = 'prod'
        }
        steps {
            sh "echo Deploying to ${DEPLOY_ENV}"
        }
    }
}
```

**4. parameters（参数化构建）**
```groovy
parameters {
    string(name: 'VERSION', defaultValue: '1.0.0', description: '版本号')
    choice(name: 'ENVIRONMENT', choices: ['dev', 'test', 'prod'], description: '环境')
    booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: '跳过测试')
    text(name: 'DEPLOY_NOTES', defaultValue: '', description: '部署备注')
    password(name: 'API_KEY', defaultValue: '', description: 'API密钥')
}

steps {
    sh "./deploy.sh ${params.ENVIRONMENT} ${params.VERSION}"
}
```

**5. when（条件执行）**
```groovy
stages {
    stage('Deploy to Prod') {
        when {
            branch 'main'
        }
        steps {
            sh './deploy-prod.sh'
        }
    }

    stage('Manual Approval') {
        when {
            beforeAgent true
            beforeOptions true
        }
        steps {
            input message: '是否部署到生产环境？', ok: '部署'
        }
    }

    stage('Skip on Tag') {
        when {
            tag pattern: "v\\d+\\.\\d+\\.\\d+", comparator: "REGEXP"
        }
        steps {
            sh 'echo "Tag build, skip this stage"'
        }
    }
}
```

**6. parallel（并行执行）**
```groovy
stages {
    stage('Parallel Tests') {
        parallel {
            stage('Unit Tests') {
                steps {
                    sh 'npm run test:unit'
                }
            }
            stage('Integration Tests') {
                steps {
                    sh 'npm run test:integration'
                }
            }
            stage('E2E Tests') {
                steps {
                    sh 'npm run test:e2e'
                }
            }
        }
    }

    stage('Parallel Deploy') {
        parallel(
            "Service A": {
                sh 'kubectl apply -f k8s/service-a'
            },
            "Service B": {
                sh 'kubectl apply -f k8s/service-b'
            },
            "Service C": {
                sh 'kubectl apply -f k8s/service-c'
            }
        )
    }
}
```

**7. post（后置处理）**
```groovy
post {
    always {
        echo 'This will always run'
        archiveArtifacts artifacts: '**/target/*.jar', fingerprint: true
    }
    success {
        echo 'Pipeline succeeded!'
        junit '**/target/surefire-reports/TEST-*.xml'
    }
    failure {
        echo 'Pipeline failed!'
        mail to: 'team@example.com',
             subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
             body: "Something went wrong. Check logs at ${env.BUILD_URL}"
    }
    unstable {
        echo 'Pipeline is unstable'
    }
    changed {
        echo 'Pipeline status changed'
    }
    fixed {
        echo 'Pipeline was fixed'
    }
    regression {
        echo 'Pipeline regressed'
    }
    cleanup {
        cleanWs()
    }
}
```

**8. tools**
```groovy
tools {
    maven 'Maven 3.8'
    jdk 'JDK 11'
    nodejs 'Node 18'
    go 'Go 1.21'
}
```

**9. options**
```groovy
options {
    timeout(time: 1, unit: 'HOURS')
    retry(3)
    buildDiscarder(logRotator(numToKeepStr: '10'))
    disableConcurrentBuilds()
    skipStagesAfterUnstable()
    skipDefaultCheckout()
    timestamps()
    ansiColor('xterm')
}
```

**最佳实践**：

**1. 版本控制Jenkinsfile**
```bash
# 将Jenkinsfile放在代码仓库根目录
project/
├── Jenkinsfile
├── src/
└── package.json
```

**2. 使用共享库**
```groovy
@Library('shared-pipeline-library') _

pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                buildApp()
            }
        }
    }
}
```

**3. 参数化构建**
```groovy
parameters {
    choice(name: 'ENV', choices: ['dev', 'test', 'prod'])
}

stages {
    stage('Deploy') {
        steps {
            buildAndDeploy(params.ENV)
        }
    }
}
```

**4. 使用Credentials**
```groovy
environment {
    AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
    AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
    DOCKER_REGISTRY = credentials('docker-registry')
}

steps {
    sh "docker login -u ${DOCKER_REGISTRY_USR} -p ${DOCKER_REGISTRY_PSW}"
}
```

**5. 通知集成**
```groovy
post {
    success {
        slackSend(
            color: 'good',
            message: "构建成功: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        )
    }
    failure {
        slackSend(
            color: 'danger',
            message: "构建失败: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        )
    }
}
```

## GitLab CI/CD

### 5. GitLab CI/CD的核心概念和配置？

**核心概念**：

**1. Pipeline（流水线）**
- 由多个Stage组成的完整流程
- 每次Push或Merge Request触发

**2. Stage（阶段）**
- Pipeline的逻辑分组
- 顺序执行，失败则停止

**3. Job（任务）**
- 具体的执行单元
- 同一Stage的Job并行执行

**4. Runner（执行器）**
- 运行Job的服务器
- 可配置Shared Runner或Specific Runner

**配置示例**：
```yaml
# .gitlab-ci.yml

# 定义阶段
stages:
  - build
  - test
  - deploy

# 定义全局变量
variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  IMAGE_NAME: registry.example.com/myapp
  IMAGE_TAG: $CI_COMMIT_SHORT_SHA

# 缓存配置
cache:
  key: "$CI_COMMIT_REF_SLUG"
  paths:
    - node_modules/
    - .npm/

# 默认配置
default:
  image: node:18-alpine
  before_script:
    - npm ci --cache .npm --prefer-offline
  after_script:
    - echo "Job completed"

# Job定义
build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour
  only:
    - branches
    - merge_requests

# 单元测试
unit-test:
  stage: test
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  script:
    - npm run test:unit
    - npm run test:coverage
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    reports:
      junit: junit.xml
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main"'

# 集成测试
integration-test:
  stage: test
  services:
    - postgres:15-alpine
    - redis:7-alpine
  variables:
    POSTGRES_DB: testdb
    POSTGRES_USER: testuser
    POSTGRES_PASSWORD: testpass
  script:
    - npm run test:integration
  dependencies:
    - build

# 部署到开发环境
deploy-dev:
  stage: deploy
  environment:
    name: development
    url: https://dev.example.com
  script:
    - kubectl set image deployment/myapp myapp=$IMAGE_NAME:$IMAGE_TAG -n dev
  only:
    - develop
  when: manual

# 部署到生产环境
deploy-prod:
  stage: deploy
  environment:
    name: production
    url: https://example.com
  script:
    - kubectl set image deployment/myapp myapp=$IMAGE_NAME:$IMAGE_TAG -n prod
  only:
    - main
  when: manual
  needs:
    - job: build
      artifacts: true
```

**高级特性**：

**1. 模板和继承**
```yaml
# 定义模板
.node-job:
  image: node:18-alpine
  before_script:
    - npm ci

# 使用模板
build:
  extends: .node-job
  stage: build
  script:
    - npm run build

test:
  extends: .node-job
  stage: test
  script:
    - npm run test
```

**2. 并行和矩阵**
```yaml
# 矩阵策略
test:
  stage: test
  parallel:
    matrix:
      NODE_VERSION: ['16', '18', '20']
      OS: ['alpine', 'debian']
  script:
    - node --version
    - npm run test

# 简单并行
test-1:
  stage: test
  script: npm run test:1

test-2:
  stage: test
  script: npm run test:2
```

**3. 缓存和依赖**
```yaml
# 全局缓存
cache:
  key: "$CI_COMMIT_REF_SLUG"
  paths:
    - node_modules/
    - .cache/

# Job级缓存
job:
  cache:
    key: "$CI_JOB_NAME"
    paths:
      - vendor/

# 依赖上一个Job的artifacts
deploy:
  dependencies:
    - build
    - test
  script:
    - ./deploy.sh
```

**4. Artifacts和Reports**
```yaml
build:
  artifacts:
    name: "$CI_JOB_NAME-$CI_COMMIT_REF_NAME"
    paths:
      - dist/
    exclude:
      - dist/**/*.map
    expire_in: 1 week
    when: on_success
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
```

**5. 规则和条件**
```yaml
job:
  rules:
    # 如果是MR
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    # 如果是main分支
    - if: '$CI_COMMIT_BRANCH == "main"'
    # 如果标签匹配
    - if: '$CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/'
    # 默认不执行
    - when: never
```

**6. 环境和部署板**
```yaml
deploy-dev:
  stage: deploy
  environment:
    name: development
    url: https://dev.example.com
    on_stop: stop-dev  # 停止环境
  script:
    - ./deploy-dev.sh

stop-dev:
  stage: deploy
  environment:
    name: development
    action: stop
  script:
    - ./stop-dev.sh
  when: manual
```

**7. Secrets和CI/CD变量**
```yaml
job:
  script:
    # 使用预定义的CI/CD变量
    - echo $DATABASE_URL
    # 使用文件类型的变量
    - cat $KUBECONFIG
    # 使用Masked变量（输出时隐藏）
    - echo $SECRET_KEY
```

**8. Services（外部服务）**
```yaml
test:
  stage: test
  image: node:18
  services:
    - name: postgres:15-alpine
      alias: db
      variables:
        POSTGRES_DB: testdb
    - name: redis:7-alpine
      alias: cache
  variables:
    POSTGRES_URL: postgresql://postgres:postgres@db:5432/testdb
    REDIS_URL: redis://cache:6379
  script:
    - npm run test
```

**9. Include和模板**
```yaml
# 引入其他文件
include:
  - local: '/templates/.gitlab-ci.yml'
  - project: 'my-group/my-project'
    ref: main
    file: '/templates/.gitlab-ci.yml'
  - remote: 'https://example.com/.gitlab-ci.yml'
  - template: 'Nodejs.gitlab-ci.yml'
```

### 6. GitLab CI与GitHub Actions的对比？

| 特性             | GitLab CI/CD          | GitHub Actions          |
|-----------------|----------------------|------------------------|
| **集成**         | GitLab内置           | GitHub内置             |
| **YAML配置**     | .gitlab-ci.yml       | .github/workflows/*.yml |
| **Runner**       | 自托管Runner         | GitHub托管Runner        |
|                 | Shared Runner        | Self-hosted Runner     |
| **并行度**       | 依赖Runner数量       | 公开仓库无限           |
|                 |                      | 私有仓库有限额          |
| **缓存**         | 配置缓存             | actions/cache          |
| **Artifacts**    | 内置支持             | 内置支持               |
| **Secrets管理**  | Settings → CI/CD     | Settings → Secrets     |
| **环境管理**     | 内置环境管理          | 内置环境管理           |
| **部署板**       | 内置                 | 内置                   |
| **市场**         | 内置模板              | GitHub Marketplace     |
| **免费额度**     | 400分钟/月          | 公开仓库无限           |
|                 |                      | 私有仓库2000分钟/月    |

**GitHub Actions示例**：
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build
      run: npm run build

    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/

  test:
    needs: build
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm test

  deploy:
    needs: [build, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Login to GitHub Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ github.repository }}:latest
          ${{ env.REGISTRY }}/${{ github.repository }}:${{ github.sha }}
```

## 构建优化

### 7. 如何优化CI/CD流水线的构建速度？

**优化策略**：

**1. 缓存依赖**
```yaml
# GitLab CI
cache:
  key: "$CI_COMMIT_REF_SLUG"
  paths:
    - node_modules/
    - .npm/
    - vendor/

before_script:
  - npm ci --cache .npm --prefer-offline

# GitHub Actions
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**2. 并行执行**
```yaml
# GitLab CI
test:
  stage: test
  parallel: 5  # 并行运行5个实例
  script:
    - npm run test

# GitHub Actions
strategy:
  matrix:
    shard: [1, 2, 3, 4, 5]
steps:
  - run: npm run test -- --shard=${{ matrix.shard }}/5
```

**3. 分阶段缓存**
```yaml
# 缓存Docker层
build:
  image: docker:24
  services:
    - docker:24-dind
  variables:
    BUILDKIT_PROGRESS: plain
  script:
    - docker pull $IMAGE_NAME:latest || true
    - docker build --cache-from $IMAGE_NAME:latest -t $IMAGE_NAME:$CI_COMMIT_SHA .
    - docker push $IMAGE_NAME:$CI_COMMIT_SHA
```

**4. 依赖优化**
```yaml
# 先安装依赖再构建，利用缓存
stages:
  - install
  - build
  - test

install:
  stage: install
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

build:
  stage: build
  dependencies:
    - install
  script:
    - npm run build
```

**5. 增量构建**
```groovy
// Jenkins Pipeline
stage('Incremental Build') {
    when {
        changeset "src/**"
    }
    steps {
        sh 'mvn compile -o'  // 离线模式
    }
}
```

**6. 选择合适的Runner**
```yaml
# GitLab CI - 使用特定标签的Runner
build:
  tags:
    - docker
    - large  # 更大配置的Runner
  script:
    - make build
```

**7. 条件执行**
```yaml
# 只在变更时执行
test:
  rules:
    - changes:
        - src/**/*
        - test/**/*
  script:
    - npm test
```

**8. 使用构建矩阵优化**
```yaml
# 只在特定版本测试
test:
  parallel:
    matrix:
      - NODE_VERSION: ['18']
        TEST_SUITE: ['unit', 'integration']
  script:
    - npm run test:${TEST_SUITE}
```

**9. 优化Docker构建**
```dockerfile
# 多阶段构建
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

**10. 使用Docker Layer Caching**
```yaml
# GitHub Actions
- uses: docker/build-push-action@v5
  with:
    cache-from: type=registry,ref=myapp:latest
    cache-to: type=inline
```

**性能对比**：
| 优化方法          | 优化前    | 优化后    | 提升    |
|-----------------|----------|----------|---------|
| 缓存依赖          | 5分钟     | 2分钟     | 60%     |
| 并行测试          | 10分钟    | 3分钟     | 70%     |
| Docker缓存        | 8分钟     | 4分钟     | 50%     |
| 增量构建          | 6分钟     | 2分钟     | 67%     |

### 8. 如何实现安全的CI/CD流水线？

**安全最佳实践**：

**1. Secrets管理**
```yaml
# ❌ 差：硬编码密钥
deploy:
  script:
    - echo "password123"  # 危险！

# ✅ 好：使用CI/CD变量
deploy:
  script:
    - echo $DATABASE_PASSWORD

# ✅ 更好：使用文件类型变量
deploy:
  variables:
    KUBECONFIG: $CI_KUBECONFIG
  script:
    - kubectl apply -f k8s/
```

**2. 最小权限原则**
```yaml
# GitLab CI - 限制Runner权限
deploy-prod:
  tags:
    - prod-runner  # 专用Runner，权限受限
  only:
    - main
  when: manual  # 手动触发
```

**3. 分支保护**
```bash
# Git: 保护main分支
git config --add branch.main.protected true

# 或在GitLab/GitHub设置中：
- 要求代码审查
- 要求CI通过
- 禁止直接推送
```

**4. 签名验证**
```yaml
verify:
  stage: test
  script:
    - gpg --verify commit.sig
    - cosign verify $IMAGE_TAG
```

**5. 镜像扫描**
```yaml
# 使用Trivy扫描镜像
scan:
  stage: test
  image: aquasec/trivy:latest
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:$CI_COMMIT_SHA
```

**6. 依赖扫描**
```yaml
# 使用Snyk扫描依赖
snyk-test:
  stage: test
  script:
    - npm install -g snyk
    - snyk test
    - snyk monitor
```

**7. SAST（静态应用安全测试）**
```yaml
# GitLab内置SAST
include:
  - template: Security/SAST.gitlab-ci.yml

sast:
  stage: test
  script:
    - semgrep --config auto
```

**8. 许可证合规**
```yaml
license-check:
  stage: test
  script:
    - npm install -g license-checker
    - license-checker --production --failOn "GPL"
```

**9. 安全配置检查**
```yaml
# Kubesec检查K8s配置
kube-scan:
  stage: test
  image: kubesec/kubesec:v2
  script:
    - kubesec scan k8s/deployment.yaml
```

**10. 审计日志**
```yaml
audit:
  stage: .post
  script:
    - echo "Deployed by $GITLAB_USER_NAME" >> deploy.log
    - echo "Deployed at $(date)" >> deploy.log
    - echo "Commit $CI_COMMIT_SHA" >> deploy.log
  artifacts:
    paths:
      - deploy.log
    expire_in: 90 days
```

**安全检查清单**：
- ✅ 无硬编码密钥
- ✅ 使用CI/CD变量存储敏感信息
- ✅ 代码审查通过才能部署
- ✅ CI全流程通过才能部署
- ✅ 镜像扫描通过
- ✅ 依赖扫描通过
- ✅ 分支保护规则启用
- ✅ 部署需要手动审批
- ✅ 审计日志完整

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
