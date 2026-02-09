# Jenkins 持续集成

## 什么是 Jenkins

Jenkins 是一个开源的自动化服务器，用于实现持续集成和持续部署。它是目前最流行的 CI/CD 工具之一，拥有丰富的插件生态系统。

### Jenkins 的特点

- **开源免费**：完全开源，社区活跃
- **插件丰富**：1000+ 插件覆盖各种需求
- **易于安装**：支持多种安装方式
- **分布式构建**：支持多节点并发构建
- **可扩展性强**：高度可配置

## 安装 Jenkins

### Docker 安装（推荐）

```bash
# 拉取 Jenkins 镜像
docker pull jenkins/jenkins:lts

# 运行 Jenkins 容器
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts

# 查看初始密码
docker logs jenkins

# 访问 Jenkins
# http://localhost:8080
```

### Linux 安装

```bash
# 添加 Jenkins 仓库
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# 安装 Jenkins
sudo apt-get update
sudo apt-get install jenkins

# 启动 Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# 查看初始密码
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 首次配置

1. 访问 `http://localhost:8080`
2. 输入初始密码
3. 安装推荐插件
4. 创建管理员账户
5. 配置 Jenkins URL

## Jenkins 核心概念

### 任务 (Job)

任务是 Jenkins 的基本执行单元，定义构建步骤。

### 构建 (Build)

构建是任务的一次执行。

### 工作空间 (Workspace)

工作空间是任务检出代码和执行构建的目录。

### 节点 (Node)

节点是 Jenkins 的执行环境（主节点或代理节点）。

## Jenkins Pipeline

Pipeline 是 Jenkins 的核心功能，以代码形式定义 CI/CD 流程。

### Pipeline 语法

**声明式 Pipeline（推荐）**

```groovy
pipeline {
    agent any

    tools {
        nodejs 'node-16'
    }

    environment {
        NODE_ENV = 'test'
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'npm run deploy'
            }
        }
    }

    post {
        success {
            echo 'Pipeline 成功！'
        }
        failure {
            echo 'Pipeline 失败！'
        }
        always {
            cleanWs()
        }
    }
}
```

### Pipeline 结构

```groovy
pipeline {
    agent any              // 代理

    environment {}         // 环境变量

    tools {}              // 工具配置

    stages {              // 阶段
        stage('Stage 1') {
            steps {       // 步骤
                // 操作
            }
        }
    }

    post {}               // 后置操作
}
```

## 常用 Pipeline 指令

### agent

指定执行节点：

```groovy
agent any                    // 任意可用代理
agent none                   // 无全局代理
agent { label 'linux' }      // 指定标签
agent {
    docker {
        image 'node:16'
    }
}
```

### stages

定义阶段：

```groovy
stages {
    stage('Build') {
        steps {
            echo 'Building...'
        }
    }
}
```

### steps

定义步骤：

```groovy
steps {
    sh 'npm install'        // Shell 命令
    bat 'npm install'       // Windows 批处理
    echo 'Hello'            // 输出
    script {                // Groovy 脚本
        def version = '1.0.0'
        echo "Version: ${version}"
    }
}
```

### environment

定义环境变量：

```groovy
environment {
    NODE_ENV = 'production'
    DATABASE_URL = credentials('db-url')
}
```

### tools

配置工具：

```groovy
tools {
    maven 'Maven 3.6'
    nodejs 'Node 16'
}
```

### when

条件执行：

```groovy
when {
    branch 'main'           // 分支匹配
    environment name: 'DEPLOY', value: 'true'
    tag 'v*'                // 标签匹配
}
```

### post

后置处理：

```groovy
post {
    always {}               // 总是执行
    success {}              // 成功时执行
    failure {}              // 失败时执行
    unstable {}             // 不稳定时执行
    changed {}              // 状态改变时执行
}
```

## 创建 Pipeline

### 方式一：通过界面创建

1. 点击"新建任务"
2. 输入任务名称
3. 选择"Pipeline"
4. 配置 Pipeline
5. 保存并构建

### 方式二：Jenkinsfile

在项目根目录创建 `Jenkinsfile`：

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
    }
}
```

在 Jenkins 中配置 SCM，自动检出 Jenkinsfile。

## 实战示例

### Node.js 应用 Pipeline

```groovy
pipeline {
    agent any

    tools {
        nodejs 'Node-16'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test:ci'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def image = docker.build("myapp:${BUILD_NUMBER}")
                    docker.withRegistry('https://registry.example.com', 'docker-creds') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'kubectl apply -f k8s/'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            emailext(
                subject: "构建成功: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "构建成功！",
                to: 'team@example.com'
            )
        }
        failure {
            emailext(
                subject: "构建失败: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "构建失败！",
                to: 'team@example.com'
            )
        }
    }
}
```

### 多阶段部署

```groovy
pipeline {
    agent any

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'production'],
            description: '选择部署环境'
        )
    }

    stages {
        stage('Deploy to Dev') {
            when {
                expression { params.ENVIRONMENT == 'dev' }
            }
            steps {
                sh './deploy.sh dev'
            }
        }

        stage('Deploy to Staging') {
            when {
                expression { params.ENVIRONMENT == 'staging' }
            }
            steps {
                input message: '确认部署到测试环境？', ok: '确认'
                sh './deploy.sh staging'
            }
        }

        stage('Deploy to Production') {
            when {
                expression { params.ENVIRONMENT == 'production' }
            }
            steps {
                input message: '确认部署到生产环境？', ok: '确认'
                sh './deploy.sh production'
            }
        }
    }
}
```

## 常用插件

### 必装插件

- **Pipeline**：Pipeline 支持
- **Git**：Git 支持
- **Docker Pipeline**：Docker 支持
- **Blue Ocean**：现代化 UI
- **Credentials Binding**：凭证管理
- **Publish Over SSH**：SSH 部署

### 插件安装

1. 管理 Jenkins → 插件管理
2. 可用插件 → 搜索并安装
3. 重启 Jenkins

## 凭证管理

### 添加凭证

1. 管理 Jenkins → 凭证 → 全局凭据
2. 添加凭证
3. 选择凭证类型

### 使用凭证

```groovy
environment {
    AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
    AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
}

steps {
    withCredentials([usernamePassword(
        credentialsId: 'docker-registry',
        usernameVariable: 'DOCKER_USER',
        passwordVariable: 'DOCKER_PASS'
    )]) {
        sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}"
    }
}
```

## 分布式构建

### 配置代理节点

1. 管理 Jenkins → 节点管理
2. 新建节点
3. 配置节点信息
4. 启动代理

### 使用代理

```groovy
pipeline {
    agent { label 'linux' }
    stages {
        stage('Build') {
            steps {
                sh 'make'
            }
        }
    }
}
```

## 最佳实践

### Pipeline 设计

1. **模块化**
   ```groovy
   // 共享库
   def buildApp() {
       sh 'npm run build'
   }

   pipeline {
       stages {
           stage('Build') {
               steps {
                   buildApp()
               }
           }
       }
   }
   ```

2. **错误处理**
   ```groovy
   stages {
       stage('Deploy') {
           steps {
               script {
                   try {
                       sh './deploy.sh'
                   } catch (Exception e) {
                       currentBuild.result = 'FAILURE'
                       throw e
                   }
               }
           }
       }
   }
   ```

3. **并行执行**
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
           }
       }
   }
   ```

### 安全建议

1. **启用安全控制**
2. **使用凭证存储敏感信息**
3. **限制构建权限**
4. **定期更新插件**

## 故障排查

### 查看日志

```bash
# Jenkins 日志
docker logs jenkins

# 构建日志
# 任务 → 构建历史 → 控制台输出
```

### 常见问题

**构建失败**
- 检查控制台输出
- 验证工具配置
- 检查网络连接

**权限问题**
- 检查文件权限
- 验证用户配置

## 学习建议

### 实践建议

1. **从简单 Pipeline 开始**
2. **逐步添加功能**
3. **使用共享库复用代码**
4. **定期备份配置**

### 练习任务

- [ ] 安装并配置 Jenkins
- [ ] 创建简单 Pipeline
- [ ] 集成 Git 仓库
- [ ] 实现自动化测试
- [ ] 配置自动化部署

## 总结

Jenkins 是功能强大的 CI/CD 工具。通过本章学习，你应该掌握了：

- Jenkins 的安装和配置
- Pipeline 的编写
- 常用指令和插件
- 实战项目配置

下一章我们将学习 [GitLab CI 与 GitHub Actions](chapter-10)，了解其他主流 CI/CD 工具。
