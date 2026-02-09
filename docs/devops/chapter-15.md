# DevSecOps 安全实践

## 什么是 DevSecOps

DevSecOps（Development, Security, and Operations）是将**安全集成到 DevOps 流程**中的方法论，强调"安全左移"（Shift Left）的理念。

### 传统安全 vs DevSecOps

| 特性 | 传统安全 | DevSecOps |
|------|---------|-----------|
| 安全时机 | 开发后期 | 开发早期 |
| 责任方 | 安全团队 | 所有人 |
| 测试方式 | 手动 | 自动化 |
| 反馈速度 | 慢 | 快 |
| 安全文化 | 阻碍加速 | 促进加速 |

### DevSecOps 核心原则

1. **安全左移**：在开发早期引入安全
2. **自动化**：自动化安全测试和扫描
3. **持续监控**：实时安全状态监控
4. **共享责任**：开发、运维、安全共同负责
5. **快速响应**：快速检测和修复漏洞

### CI/CD 安全管道

```
代码提交
  ↓
【构建阶段】
  ├─ SAST（静态应用安全测试）
  ├─ SCA（软件成分分析）
  └─ 依赖检查
  ↓
【测试阶段】
  ├─ DAST（动态应用安全测试）
  └─ 容器镜像扫描
  ↓
【部署阶段】
  ├─ IaC 安全扫描
  ├─ K8s 配置检查
  └─ 运行时安全监控
  ↓
【监控阶段】
  ├─ 日志分析
  ├─ 异常检测
  └─ 威胁情报
```

## SAST（静态应用安全测试）

### 什么是 SAST

SAST 在**不运行代码**的情况下分析源代码，发现安全漏洞。

### 常用工具

| 工具 | 语言 | 特点 |
|------|------|------|
| **SonarQube** | 多语言 | 代码质量+安全 |
| **Semgrep** | 多语言 | 规则灵活 |
| **CodeQL** | 多语言 | GitHub出品 |
| **Bandit** | Python | Python专用 |
| **ESLint** | JavaScript | JS代码质量 |
| **GoSec** | Go | Go语言安全 |

### SonarQube 实战

**安装 SonarQube**（使用 Docker）：

```bash
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  sonarqube:lts-community
```

**访问 UI**：http://localhost:9000
- 默认账号：`admin` / `admin`

**在 CI/CD 中集成**：

**GitHub Actions**：
```yaml
name: SonarQube Scan

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  sonarqube:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
      with:
        fetch-depth: 0

    - name: SonarQube Scan
      uses: sonarsource/sonarqube-scan-action@master
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

**Jenkins Pipeline**：
```groovy
pipeline {
    agent any

    stages {
        stage('SonarQube Analysis') {
            steps {
                script {
                    scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }
    }
}
```

**sonar-project.properties**：
```properties
sonar.projectKey=my-project
sonar.projectName=My Project
sonar.sourceEncoding=UTF-8
sonar.sources=src
sonar.tests=test
sonar.python.coverage.reportPaths=coverage.xml
sonar.python.bandit.reportPaths=bandit-report.json
```

### Semgrep 实战

**安装**：
```bash
# Python
pip install semgrep

# 或使用 Docker
docker pull returntocorp/semgrep:latest
```

**配置规则**（.semgrep.yaml）：
```yaml
rules:
  - id: dangerous-eval
    patterns:
      - pattern: eval(...)
    message: "Avoid using eval()"
    languages: [python, javascript]
    severity: ERROR

  - id: sql-injection
    patterns:
      - pattern: execute("..." + $X)
    message: "Possible SQL injection"
    languages: [python]
    severity: WARNING

  - id: hardcoded-password
    patterns:
      - pattern-regex: 'password\s*=\s*["\'][^"\']+["\']'
    message: "Hardcoded password detected"
    severity: ERROR
```

**运行扫描**：
```bash
# 扫描项目
semgrep --config=.semgrep.yaml .

# 使用规则集
semgrep --config=auto .

# 扫描特定路径
semgrep --config=auto src/
```

**集成到 CI/CD**：

```yaml
- name: Semgrep Scan
  run: |
    pip install semgrep
    semgrep --config=auto --json --output=semgrep-report.json src/

- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: semgrep-results
    path: semgrep-report.json
```

## SCA（软件成分分析）

### 什么是 SCA

SCA 扫描项目依赖项，发现已知漏洞（CVE）。

### 常用工具

| 工具 | 语言 | 特点 |
|------|------|------|
| **Trivy** | 多语言 | 综合扫描 |
| **Snyk** | 多语言 | 商业方案 |
| **npm audit** | JavaScript | npm内置 |
| **pip-audit** | Python | PyPA工具 |
| **Dependabot** | 多语言 | GitHub集成 |

### Trivy 实战

**安装**：
```bash
# macOS
brew install trivy

# Linux
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy
```

**扫描文件系统**：
```bash
# 扫描当前目录
trivy fs .

# 扫描指定路径
trivy fs --severity HIGH,CRITICAL /path/to/code

# 输出 JSON
trivy fs --format json --output report.json .
```

**扫描容器镜像**：
```bash
# 扫描镜像
trivy image nginx:latest

# 只显示高危漏洞
trivy image --severity HIGH,CRITICAL nginx:latest

# 扫描并保存结果
trivy image --format json --output nginx-report.json nginx:latest
```

**扫描 Git 仓库**：
```bash
trivy repo https://github.com/yourorg/yourrepo
```

**集成到 CI/CD**：

```yaml
- name: Trivy Scan
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    scan-ref: '.'
    format: 'sarif'
    output: 'trivy-results.sarif'

- name: Upload Results
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: 'trivy-results.sarif'
```

### npm audit 实战

```bash
# 检查依赖漏洞
npm audit

# 自动修复
npm audit fix

# 强制修复（可能破坏性变更）
npm audit fix --force

# 只查看高危漏洞
npm audit --audit-level high

# 生成 JSON 报告
npm audit --json > npm-audit.json
```

**集成到 CI/CD**：

```yaml
- name: npm audit
  run: npm audit --audit-level high
  continue-on-error: false
```

### Dependabot 实战

**配置**（.github/dependabot.yml）：
```yaml
version: 2
updates:
  # npm 依赖
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    target-branch: "develop"

  # Python 依赖
  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"

  # Docker 基础镜像
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
```

## 容器安全

### 镜像扫描

**使用 Trivy**：

```bash
# 扫描镜像
trivy image myapp:1.0.0

# CI/CD 集成
docker build -t myapp:$CI_COMMIT_SHA .
trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:$CI_COMMIT_SHA
```

**Dockerfile 最佳实践**：

```dockerfile
# 使用最小基础镜像
FROM alpine:3.19

# 非 root 用户
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser

# 只安装必要依赖
RUN apk add --no-cache nodejs npm

# 复制依赖文件
COPY package*.json ./
RUN npm ci --only=production

# 复制应用代码
COPY --chown=appuser:appuser . .

# 切换用户
USER appuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

# 非默认端口
EXPOSE 3000

CMD ["node", "server.js"]
```

### Kubernetes 安全

**Pod Security Standards**：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  # 非 root 用户
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000

  # 只读根文件系统
  containers:
  - name: app
    image: myapp:1.0.0
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      runAsNonRoot: true
      capabilities:
        drop:
        - ALL
    volumeMounts:
    - name: tmp
      mountPath: /tmp

  volumes:
  - name: tmp
    emptyDir: {}
```

**Network Policies**：

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 80
```

### 使用 Kube-bench

**安装**：
```bash
kubectl apply -f job.yaml
```

**job.yaml**：
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: kube-bench
spec:
  template:
    spec:
      hostPID: true
      containers:
      - name: kube-bench
        image: aquasec/kube-bench:latest
        command: ["kube-bench"]
        volumeMounts:
        - name: var-lib-etcd
          mountPath: /var/lib/etcd
          readOnly: true
        - name: var-lib-kubelet
          mountPath: /var/lib/kubelet
          readOnly: true
        - name: etc-systemd
          mountPath: /etc/systemd
          readOnly: true
        - name: etc-kubernetes
          mountPath: /etc/kubernetes
          readOnly: true
      restartPolicy: Never
      volumes:
      - name: var-lib-etcd
        hostPath:
          path: /var/lib/etcd
      - name: var-lib-kubelet
        hostPath:
          path: /var/lib/kubelet
      - name: etc-systemd
        hostPath:
          path: /etc/systemd
      - name: etc-kubernetes
        hostPath:
          path: /etc/kubernetes
```

**运行**：
```bash
kubectl create -f job.yaml
kubectl logs job/kube-bench
```

## DAST（动态应用安全测试）

### 什么是 DAST

DAST 在**应用运行时**进行测试，模拟黑客攻击。

### OWASP ZAP 实战

**使用 Docker 运行**：

```bash
# 爬虫和扫描
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://www.example.com

# 生成报告
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://www.example.com \
  -r report.html
```

**集成到 CI/CD**：

```yaml
- name: DAST Scan
  run: |
    docker pull owasp/zap2docker-stable
    docker run -t owasp/zap2docker-stable zap-baseline.py \
      -t ${{ secrets.TEST_URL }} \
      -r zap-report.html \
      -I

- name: Upload Report
  uses: actions/upload-artifact@v3
  with:
    name: zap-report
    path: zap-report.html
```

### API 安全测试

**使用 SQLMap**：

```bash
# 检测 SQL 注入
sqlmap -u "http://example.com/api?id=1" --batch

# POST 请求
sqlmap -u "http://example.com/api" \
  --data="username=admin&password=pass" \
  --batch

# 保存报告
sqlmap -u "http://example.com/api?id=1" \
  --batch \
  --output-dir=reports
```

## 运行时安全

### Falco 实战

Falco 是云原生运行时安全工具。

**安装**：

```bash
# Helm 安装
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm install falco falcosecurity/falco
```

**配置规则**（falco_rules.yaml）：

```yaml
- rule: Detect shell in container
  desc: Detect shell spawned in container
  condition: >
    spawned_process and
    container and
    shell_procs and
    container.image.startswithnginx and
    not user_expected_shell_spawned_container
  output: >
    Shell spawned in container (user=%user.name container_id=%container.id container_name=%container.name shell=%proc.name parent=%proc.pname cmdline=%proc.cmdline)
  priority: WARNING

- rule: Detect crypto miner
  desc: Detect cryptocurrency mining
  condition: >
    spawned_process and
    container and
    proc.name in (xmrig, cpuminer, minerd)
  output: >
    Crypto miner detected (user=%user.name container=%container.name proc=%proc.name cmdline=%proc.cmdline)
  priority: CRITICAL
```

**应用规则**：

```bash
kubectl create configmap falco-rules \
  --from-file=falco_rules.yaml \
  -n falco

kubectl rollout restart daemonset/falco -n falco
```

### 监控和告警

**Falco + Prometheus**：

```yaml
# Falco 配置
- enabled: true
  type: prometheus
  # Prometheus metrics endpoint
  # http://:8765/metrics
```

**集成 Alertmanager**：

```yaml
# falco.yml
slack_output:
  enabled: true
  url: ${SLACK_WEBHOOK_URL}
```

## Secret 管理

### 最佳实践

1. **Never commit secrets to Git**
2. **使用环境变量**
3. **专用 Secret 管理工具**
4. **定期轮换密钥**
5. **审计 Secret 访问**

### HashiCorp Vault

**安装**（开发模式）：

```bash
docker run -d \
  --name vault \
  -p 8200:8200 \
  -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' \
  vault:latest
```

**配置**：

```bash
# 设置环境变量
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='myroot'

# 启用 KV secrets engine
vault secrets enable -path=secret kv-v2

# 存储密钥
vault kv put secret/myapp \
  username="admin" \
  password="password123"

# 读取密钥
vault kv get secret/myapp

# 生成动态凭证
vault secrets enable database
vault write database/config/mydb \
  plugin_name=postgresql-database-plugin \
  connection_url="postgresql://{{username}}:{{password}}@db:5432/mydb" \
  allowed_roles="myrole" \
  username="vaultadmin" \
  password="vaultpass"

vault write database/roles/myrole \
  db_name=mydb \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';" \
  default_ttl="1h" \
  max_ttl="24h"
```

**Kubernetes 集成**：

```bash
# 启用 Kubernetes 认证
vault auth enable kubernetes

# 配置
vault write auth/kubernetes/config \
  kubernetes_host="https://kubernetes.default.svc"

# 创建策略
vault policy write myapp - <<EOF
path "secret/data/myapp/*" {
  capabilities = ["read"]
}
EOF

# 创建角色
vault write auth/kubernetes/role/myapp \
  bound_service_account_names=myapp \
  bound_service_account_namespaces=default \
  policies=myapp \
  ttl=24h
```

### Sealed Secrets

**安装**：

```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
```

**创建 Sealed Secret**：

```bash
# 创建普通 secret
kubectl create secret generic db-credentials \
  --dry-run=client \
  --from-literal=username=admin \
  --from-literal=password=pass123 \
  -o yaml > secret.yaml

# 转换为 Sealed Secret
kubeseal -f secret.yaml -w sealed-secret.yaml

# 提交到 Git
git add sealed-secret.yaml
git commit -m "Add sealed secret"
```

## IaC 安全

### Terraform 安全

**使用 tfsec**：

```bash
# 安装
brew install tfsec

# 扫描
tfsec .

# 输出 JSON
tfsec . --format json --out tfsec-report.json
```

**配置规则**（tfsec.toml）：

```toml
# 排除特定检查
exclude = ["AWS005", "GEN003"]

# 严重性覆盖
[severity_overrides]
  AWS003 = "CRITICAL"

# 包含检查
include = ["AWS*", "GEN*"]
```

**CI/CD 集成**：

```yaml
- name: tfsec Scan
  uses: aquasecurity/tfsec-action@main
  with:
    working_directory: ./terraform
    additional_args: --out results.json
```

**Kubernetes IaC 安全**：

```bash
# 使用 Kube-score
kube-score scan my-deployment.yaml

# 使用 Kube-linter
kube-linter lint *.yaml
```

## 合规性

### CIS Benchmarks

**使用 Kube-bench**：

```bash
# 扫描集群
kube-bench

# 针对特定版本
kube-bench --benchmark kubernetes-1.20

# 生成报告
kube-bench --json > kube-bench-report.json
```

### PCI-DSS / HIPAA

**关键控制**：

1. **加密**
   - TLS 传输加密
   - 静态数据加密
   - 密钥管理

2. **访问控制**
   - 最小权限原则
   - 多因素认证
   - 审计日志

3. **漏洞管理**
   - 定期扫描
   - 及时修补
   - 风险评估

## 安全监控

### 日志分析

**使用 ELK Stack**：

- 集中收集日志
- 实时分析
- 异常检测
- 合规报告

**使用 Falco**：

- 系统调用监控
- 异常行为检测
- 即时告警

### 威胁情报

**工具**：

- **MITRE ATT&CK**：攻击框架
- **CVE 数据库**：漏洞数据库
- **CISA**：安全告警

## 最佳实践

### 开发阶段

1. **安全编码规范**
   - 遵循 OWASP 指南
   - Code Review 包含安全检查

2. **依赖管理**
   - 定期更新依赖
   - 使用 Dependabot
   - 监控 CVE

3. **自动化测试**
   - 集成 SAST
   - 集成 SCA
   - 单元测试覆盖

### 构建阶段

1. **镜像安全**
   - 使用官方基础镜像
   - 最小化镜像
   - 定期扫描

2. **签名验证**
   - 镜像签名
   - 完整性校验

3. **IaC 扫描**
   - Terraform 安全检查
   - Kubernetes 配置验证

### 部署阶段

1. **运行时保护**
   - Falco 监控
   - Network Policies
   - Pod Security

2. **Secret 管理**
   - Vault / Sealed Secrets
   - 轮换策略

3. **访问控制**
   - RBAC
   - 最小权限

### 运行阶段

1. **持续监控**
   - 日志聚合
   - 异常检测

2. **事件响应**
   - 告警机制
   - 应急预案

3. **定期审计**
   - 权限审查
   - 合规检查

---

## 2024-2026安全实践热点

### 软件供应链安全 (SBOM + Sigstore)

**SBOM**（Software Bill of Materials，软件物料清单）是2023-2025年最重要的安全趋势之一，被美国白宫行政令强制要求。

**SBOM格式**：

```yaml
# SPDX格式示例 (SPDX 2.3)
SPDXVersion: SPDX-2.3
DataLicense: CC0-1.0
SPDXID: SPDXRef-DOCUMENT
DocumentName: payment-service
DocumentNamespace: https://example.com/payment-service-v1.0
CreationInfo:
  Created: 2024-01-15T10:00:00Z
  Creators:
    - Tool: sbom-tool@1.2.3
  LicenseListVersion: 3.20

Packages:
  # 主包
  - SPDXID: SPDXRef-Package-payment-service
    name: payment-service
    version: v1.0.0
    downloadLocation: https://github.com/my-org/payment-service
    filesAnalyzed: false
    licenseConcluded: NOASSERTION
    description: Payment microservice
    externalRefs:
      - referenceCategory: PACKAGE-MANAGER
        referenceType: purl
        referenceLocator: pkg:github/my-org/payment-service@v1.0.0

  # 依赖包
  - SPDXID: SPDXRef-Package-gin
    name: github.com/gin-gonic/gin
    version: v1.10.0
    downloadLocation: https://github.com/gin-gonic/gin
    filesAnalyzed: false
    licenseConcluded: MIT
    externalRefs:
      - referenceCategory: PACKAGE-MANAGER
        referenceType: purl
        referenceLocator: pkg:golang/github.com/gin-gonic/gin@v1.10.0

  - SPDXID: SPDXRef-Package-gorm
    name: gorm.io/gorm
    version: v1.25.5
    downloadLocation: https://github.com/go-gorm/gorm
    filesAnalyzed: false
    licenseConcluded: MIT
    externalRefs:
      - referenceCategory: PACKAGE-MANAGER
        referenceType: purl
        referenceLocator: pkg:golang/gorm.io/gorm@v1.25.5

Relationships:
  - spdxElementId: SPDXRef-DOCUMENT
    relationshipType: DESCRIBES
    relatedSpdxElement: SPDXRef-Package-payment-service

  - spdxElementId: SPDXRef-Package-payment-service
    relationshipType: DEPENDS_ON
    relatedSpdxElement: SPDXRef-Package-gin

  - spdxElementId: SPDXRef-Package-payment-service
    relationshipType: DEPENDS_ON
    relatedSpdxElement: SPDXRef-Package-gorm
```

**生成SBOM**：

```bash
# 1. 使用Syft生成SBOM
# 安装
curl -ssL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# 生成SPDX格式SBOM
syft payment-service:v1.0.0 -o spdx-json > sbom.spdx.json

# 生成CycloneDX格式SBOM
syft payment-service:v1.0.0 -o cyclonedx-json > sbom.cdx.json

# 2. 使用Trivy生成SBOM
trivy image --format spdx-json --output sbom.json payment-service:v1.0.0

# 3. Go模块SBOM
go install github.com/anchore/syft/cmd/syft@latest
syft . -o spdx-json > go-sbom.json

# 4. NPM包SBOM
npm install -g @cyclonedx/cyclonedx-npm
cyclonedx-npm -o sbom.json
```

**SBOM分析**：

```bash
# 1. 检查已知漏洞
grype sbom:sbom.json

# 输出示例:
# NAME           TYPE    ID             SEVERITY
# gin            go      CVE-2024-1234  High
# gorm           go      CVE-2024-5678  Medium

# 2. 依赖树分析
syft payment-service:v1.0.0 -o tree

# 输出:
# payment-service:v1.0.0
# ├── github.com/gin-gonic/gin@v1.10.0
# │   ├── github.com/gin-contrib/sse@v0.1.0
# │   └── github.com/go-playground/validator@v10.14.0
# └── gorm.io/gorm@v1.25.5
#     └── gorm.io/driver/mysql@v1.5.2
```

### Sigstore - 软件签名服务

**Sigstore**是Linux基金会项目，提供开源的软件签名和验证服务。

**Cosign签名**：

```bash
# 1. 安装Cosign
go install github.com/sigstore/cosign/v2/cmd/cosign@latest

# 2. 签名容器镜像
cosign sign payment-service:v1.0.0

# 输出:
# Pushing signature to: example.com/payment-service/signatures/v1.0.0
#
# Generating ephemeral keys...
#
# tlog entry created with index: 1234567

# 3. 验证镜像签名
cosign verify payment-service:v1.0.0

# 输出:
# Verification for example.com/payment-service:v1.0.0 --
# The following checks were performed on each of these signatures:
#   - The cosign claims were validated
#   - Existence of the claims in the transparency log was verified offline
#   - The code-signing certificate was verified using trusted certificate authority certificates

# 4. 签名SBOM文件
cosign sign-blob sbom.spdx.json > sbom.spdx.json.sig

# 5. 验证SBOM签名
cosign verify-blob --signature sbom.spdx.json.sig sbom.spdx.json

# 6. 附加SBOM到镜像
cosign attach sbom --sbom sbom.spdx.json payment-service:v1.0.0

# 7. 查看镜像的SBOM
cosign sbom payment-service:v1.0.0
```

**Cosign + Keyless签名** (2024推荐)：

```bash
# Keyless签名使用OIDC身份(GitHub/GitLab/Google)
cosign sign payment-service:v1.0.0

# 签名时会提示:
# 1. 打开浏览器进行OIDC认证
# 2. 选择身份提供商(GitHub)
# 3. 授权Cosign应用
# 4. 签名完成

# 验证时指定签发者
cosign verify \
  --certificate-identity https://github.com/my-org/payment-service/.github/workflows/deploy.yml@refs/heads/main \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  payment-service:v1.0.0
```

**CI/CD集成**：

```yaml
# .github/workflows/sign-and-push.yml
name: Sign and Push Image

on:
  push:
    tags:
      - 'v*'

permissions:
  id-token: write  # OIDC token
  contents: read
  packages: write

jobs:
  sign:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build image
        run: |
          docker build -t ghcr.io/my-org/payment-service:${{ github.ref_name }} .

      - name: Push image
        run: |
          docker push ghcr.io/my-org/payment-service:${{ github.ref_name }}

      - name: Install Cosign
        uses: sigstore/cosign-installer@v3.3.0

      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          image: ghcr.io/my-org/payment-service:${{ github.ref_name }}
          output-format: spdx-json
          output-file: sbom.spdx.json

      - name: Attach SBOM
        run: |
          cosign attach sbom \
            --sbom sbom.spdx.json \
            ghcr.io/my-org/payment-service:${{ github.ref_name }}

      - name: Sign image with keyless
        run: |
          cosign sign \
            --yes \
            ghcr.io/my-org/payment-service:${{ github.ref_name }}

      - name: Verify signature
        run: |
          cosign verify \
            --certificate-identity https://github.com/my-org/payment-service/.github/workflows/sign-and-push.yml@refs/heads/main \
            --certificate-oidc-issuer https://token.actions.githubusercontent.com \
            ghcr.io/my-org/payment-service:${{ github.ref_name }}
```

### 零信任架构 (Zero Trust)

**零信任原则**："永不信任，始终验证"

```yaml
# 零信任网络策略示例
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: zero-trust-policy
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress

  # 默认拒绝所有流量
  ingress: []
  egress:
  # 只允许DNS查询
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: UDP
      port: 53

  # 只允许特定的出口流量
  - to:
    - podSelector:
        matchLabels:
          app: api-gateway
    ports:
    - protocol: TCP
      port: 8080

---
# 零信任服务网格 (Istio)
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    # 强制mTLS双向认证
    mode: STRICT

---
# 授权策略
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: payment-service-authz
  namespace: production
spec:
  selector:
    matchLabels:
      app: payment-service
  action: ALLOW
  rules:
  # 只允许来自api-gateway的请求
  - from:
    - source:
        principals:
        - cluster.local/ns/production/sa/api-gateway
    # 只允许GET和POST请求
    to:
    - operation:
        methods: ["GET", "POST"]
    # 要求JWT认证
    when:
    - key: request.auth.claims[iss]
      values: ["https://auth.example.com"]
    - key: request.auth.claims[role]
      values: ["payment-service-user"]
```

**零信任最佳实践**：

```yaml
# 1. 强制身份验证
apiVersion: v1
kind: ServiceAccount
metadata:
  name: payment-service
  namespace: production
automountServiceAccountToken: true

---
# 2. 最小权限RBAC
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: payment-service-role
  namespace: production
rules:
  # 只允许读取自己的config
  - apiGroups: [""]
    resources: ["configmaps"]
    resourceNames: ["payment-service-config"]
    verbs: ["get", "list"]

---
# 3. Pod安全标准
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
  namespace: production
spec:
  serviceAccountName: payment-service

  # 安全上下文
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault

  containers:
  - name: app
    image: payment-service:v1.0.0
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      runAsUser: 1000
      capabilities:
        drop:
        - ALL
```

### 2024-2025新兴安全工具

**1. Kyverno - 策略即代码**：

```yaml
# Kyverno策略示例
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
spec:
  validationFailureAction: enforce
  background: true
  rules:
  - name: require-team-label
    match:
      resources:
        kinds:
        - Pod
        - Deployment
    validate:
      message: "所有Pod必须有team标签"
      pattern:
        metadata:
          labels:
            team: "?*"

---
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: deny-privileged
spec:
  validationFailureAction: enforce
  background: true
  rules:
  - name: deny-privileged-containers
    match:
      resources:
        kinds:
        - Pod
    validate:
      message: "不允许特权容器"
      pattern:
        spec:
          containers:
          - =(securityContext):
              =(privileged): false
```

**2. OPA Gatekeeper - 策略控制**：

```yaml
# Gatekeeper Constraint示例
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          properties:
            labels:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels
        violation[{"msg": msg}] {
          required := input.parameters.labels
          provided := input.review.object.metadata.labels
          missing := required[_]
          not provided[missing]
          msg := sprintf("缺少必需标签: %v", [missing])
        }

---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: require-team-label
spec:
  match:
    kinds:
    - apiGroups: [""]
      kinds: ["Pod"]
  parameters:
    labels: ["team", "app"]
```

**3. Trivy - 全能安全扫描器**：

```bash
# 1. 容器镜像扫描
trivy image payment-service:v1.0.0

# 2. 文件系统扫描
trivy fs /path/to/project

# 3. Git仓库扫描
trivy repo https://github.com/my-org/payment-service

# 4. Kubernetes配置扫描
trivy config deployment.yaml

# 5. 输出格式
trivy image --format json --output report.json payment-service:v1.0.0

# 6. 只报告高危漏洞
trivy image --severity HIGH,CRITICAL payment-service:v1.0.0

# 7. 忽略特定漏洞
trivy image --ignore-file .trivyignore payment-service:v1.0.0

# .trivyignore示例:
# 接受此漏洞(正在修复中)
CVE-2024-1234
```

**4. Grype - 漏洞扫描**：

```bash
# 1. 扫描容器镜像
grype payment-service:v1.0.0

# 2. 扫描SBOM
grype sbom:sbom.spdx.json

# 3. 只显示可修复的漏洞
grype payment-service:v1.0.0 --only-fixed

# 4. 输出格式
grype payment-service:v1.0.0 -o json > vulnerabilities.json

# 5. 失败条件
grype payment-service:v1.0.0 --fail-on high
```

---

### 实践路径

1. **学习基础**：OWASP Top 10
2. **工具实践**：SAST/SCA/DAST
3. **容器安全**：镜像扫描、K8s 安全
4. **运行时安全**：Falco、监控
5. **合规性**：CIS、PCI-DSS

### 练习任务

- [ ] 配置 SonarQube 并扫描项目
- [ ] 使用 Trivy 扫描镜像
- [ ] 配置 Dependabot
- [ ] 实施容器安全策略
- [ ] 部署 Falco 运行时监控
- [ ] 配置 Vault Secret 管理

## 总结

DevSecOps 不是阻碍，而是**加速器**：

- **安全左移**：早期发现问题，修复成本更低
- **自动化**：减少人为疏漏
- **文化**：人人有责
- **持续改进**：安全是持续过程

通过 DevSecOps 实践，你可以构建更安全、更可靠的应用系统！

## 推荐资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks)
- [MITRE ATT&CK](https://attack.mitre.org/)
- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/security-checklist/)
