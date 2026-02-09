---
title: DevSecOps与安全面试题
---

# DevSecOps与安全面试题

## DevSecOps理念

### 1. 什么是DevSecOps？与传统DevOps的区别？

**DevSecOps定义**：
DevSecOps（Development, Security, and Operations）是一种将安全性集成到DevOps流程中的理念、文化和实践，让每个人对安全负责，从开发初期（"Shift Left"）就开始考虑安全问题。

**DevOps vs DevSecOps对比**：

| 维度          | DevOps                | DevSecOps              |
|-------------|----------------------|------------------------|
| **安全责任**   | 安全团队后期介入        | 开发即安全，全员负责      |
| **安全时机**   | 开发后期/部署前        | 需求、设计、编码阶段      |
| **安全测试**   | 手动渗透测试           | 自动化安全扫描          |
| **问题发现**   | 生产环境（成本高）      | 开发阶段（成本低）        |
| **修复成本**   | 高（10-100倍）         | 低                      |
| **文化**      | 快速交付              | 快速且安全交付           |

**DevSecOps流程图**：
```
┌─────────────────────────────────────────────────────┐
│              DevSecOps全生命周期                      │
└─────────────────────────────────────────────────────┘

Plan → Code → Build → Test → Release → Deploy → Operate
  │      │       │       │        │        │         │
  │      │       │       │        │        │         ▼
  │      │       │       │        │        │    ┌─────────┐
  │      │       │       │        │        │    │ 运行监控 │
  │      │       │       │        │        │    │ 安全审计 │
  │      │       │       │        │        │    └─────────┘
  │      │       │       │        │        │
  │      │       │       │        │        ▼
  │      │       │       │        │    ┌─────────┐
  │      │       │       │        │    │ 安全部署 │
  │      │       │       │        │    │ 策略执行 │
  │      │       │       │        │    └─────────┘
  │      │       │       │        ▼
  │      │       │       │    ┌─────────┐
  │      │       │       │    │ 安全测试 │
  │      │       │       │    │ 扫描验证 │
  │      │       │       │    └─────────┘
  │      │       │       ▼
  │      │       │   ┌─────────┐
  │      │       │   │ 安全构建 │
  │      │       │   │ SCA/DAST│
  │      │       │   └─────────┘
  │      │       ▼
  │      │   ┌─────────┐
  │      │   │ 安全编码 │
  │      │   │ 代码审查 │
  │      │   └─────────┘
  │      ▼
  │   ┌─────────┐
  │   │ 威胁建模 │
  │   │ 需求分析 │
  │   └─────────┘
  ▼
┌─────────┐
│ 安全培训 │
│ 文化建设 │
└─────────┘
```

**DevSecOps核心实践**：

**1. Shift Left（左移）**
```yaml
# 在开发阶段就进行安全检查
stages:
  - security-scan  # 安全扫描前置
  - test
  - build
  - deploy

sast:
  stage: security-scan
  script:
    - semgrep --config auto
    - sonar-scanner
  only:
    - merge_requests
```

**2. 自动化安全测试**
```yaml
# CI/CD流水线集成安全扫描
security-scan:
  stage: test
  script:
    # SAST（静态应用安全测试）
    - bandit -r ./

    # SCA（软件成分分析）
    - safety check

    # 依赖漏洞扫描
    - npm audit
    - trivy fs .
```

**3. 安全即代码**
```python
# 策略即代码（OPA/Gatekeeper）
package kubernetes.admission

deny[msg] {
  input.request.kind.kind == "Pod"
  not input.request.object.spec.containers[_].securityContext.runAsNonRoot
  msg := "Containers must run as non-root user"
}
```

### 2. 安全左移（Shifting Left）的具体实践？

**安全左移金字塔**：
```
                    ┌─────────────────┐
                    │   手动渗透测试   │  成本: $100k
                    ├─────────────────┤
                    │  DAST（动态）   │  成本: $10k
                    ├─────────────────┤
                    │  SAST（静态）   │  成本: $1k
                    ├─────────────────┤
                    │  SCA（依赖扫描）│  成本: $100
                    ├─────────────────┤
                    │  安全编码规范    │  成本: $10
                    ├─────────────────┤
                    │  威胁建模        │  成本: $1
                    └─────────────────┘
              开发阶段 ────────────→ 生产阶段
```

**具体实践**：

**1. 需求阶段 - 威胁建模**
```
使用STRIDE模型：
- Spoofing（伪装）
- Tampering（篡改）
- Repudiation（抵赖）
- Information Disclosure（信息泄露）
- Denial of Service（拒绝服务）
- Elevation of Privilege（权限提升）

示例：
User Login功能：
- Spoofing: 需要MFA
- Tampering: 需要HTTPS
- Information Disclosure: 需要密码哈希存储
```

**2. 设计阶段 - 安全架构评审**
```yaml
# 安全架构检查清单
Security Checklist:
  - Authentication: MFA enabled
  - Authorization: RBAC implemented
  - Data Encryption: TLS 1.3, AES-256
  - Secrets Management: Vault/HSM
  - Logging: Security events logged
  - Monitoring: Anomaly detection
```

**3. 编码阶段 - 安全编码规范**
```python
# ❌ 不安全的代码
def login(username, password):
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    return db.execute(query)  # SQL注入漏洞

# ✅ 安全的代码
def login(username, password):
    query = "SELECT * FROM users WHERE username=%s AND password=%s"
    return db.execute(query, (username, password))  # 参数化查询
```

**4. 代码审查阶段 - 安全审查清单**
```yaml
Security Review Checklist:
  Code:
    - 无硬编码密钥
    - 无SQL/命令注入
    - 输入验证完整
    - 输出编码正确
    - 错误处理安全

  Dependencies:
    - 无已知漏洞
    - 许可证合规
    - 及时更新

  Configuration:
    - 安全头配置
    - CORS策略
    - Session管理
    - 密码策略
```

**5. IDE集成 - 实时安全检查**
```json
// VS Code配置
{
  "settings": {
    "python.linting.enabled": true,
    "python.linting.banditEnabled": true,
    "python.linting.pylintEnabled": true,
    "eslint.options": {
      "plugins": ["security"]
    }
  }
}
```

## 容器安全

### 3. 容器安全最佳实践？

**容器安全层次**：
```
┌─────────────────────────────────────────────────┐
│            容器安全层次模型                        │
└─────────────────────────────────────────────────┘

Layer 1: 镜像安全
  ├─ 最小化基础镜像
  ├─ 扫描镜像漏洞
  └─ 镜像签名验证

Layer 2: 运行时安全
  ├─ 非root用户运行
  ├─ 只读根文件系统
  ├─ 资源限制
  └─ Seccomp/AppArmor

Layer 3: 编排平台安全
  ├─ RBAC
  ├─ NetworkPolicy
  ├─ PodSecurityPolicy
  └─ Secret管理

Layer 4: 集群安全
  ├─ API Server安全
  ├─ etcd加密
  ├─ 节点安全
  └─ 审计日志
```

**镜像安全实践**：

**1. 最小化镜像**
```dockerfile
# ❌ 差：完整操作系统
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y python3
# 镜像大小: ~70MB + 系统

# ✅ 好：精简基础镜像
FROM alpine:3.19
RUN apk add --no-cache python3
# 镜像大小: ~10MB

# ✅ 更好：distroless（无shell）
FROM gcr.io/distroless/python3-debian12
# 镜像大小: ~30MB，但更安全
```

**2. 多阶段构建**
```dockerfile
# 构建阶段
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o myapp

# 运行阶段
FROM alpine:3.19
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -s /bin/sh -D appuser
COPY --from=builder /app/myapp /usr/local/bin/myapp
USER appuser
CMD ["myapp"]
```

**3. 镜像扫描**
```bash
# 使用Trivy扫描
trivy image myapp:1.0

# 输出示例
2026-02-06T10:00:00Z INFO Vulnerability scanning
┌────────────────────────────────────────────────────┐
│  Library       Vulnerability  Severity  Status     │
├────────────────────────────────────────────────────┤
│  openssl       CVE-2023-1234  HIGH      Fixed     │
│  libcurl       CVE-2023-5678  MEDIUM    Fixed     │
└────────────────────────────────────────────────────┘

# 集成到CI/CD
scan:
  stage: test
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:$CI_COMMIT_SHA
```

**4. 镜像签名**
```bash
# 使用cosign签名镜像
cosign sign --key cosign.key myapp:1.0

# 验证签名
cosign verify --key cosign.pub myapp:1.0

# Kubernetes准入控制验证
# Kyverno策略
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: check-image-signature
spec:
  validationFailureAction: enforce
  background: false
  rules:
  - name: verify-signature
    match:
      resources:
        kinds:
        - Pod
    verifyImages:
    - imageReferences:
      - "*"
      attestors:
      - entries:
        - keys:
            publicKeys: |-
              -----BEGIN PUBLIC KEY-----
              MFkwE...
              -----END PUBLIC KEY-----
```

**运行时安全实践**：

**1. 非root用户**
```dockerfile
# 创建专用用户
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

**2. 只读根文件系统**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  containers:
  - name: app
    image: myapp:1.0
    securityContext:
      readOnlyRootFilesystem: true
      runAsNonRoot: true
      runAsUser: 1000
      allowPrivilegeEscalation: false
    volumeMounts:
    - name: cache
      mountPath: /cache
  volumes:
  - name: cache
    emptyDir: {}
```

**3. 能力（Capabilities）裁剪**
```yaml
securityContext:
  capabilities:
    drop:
    - ALL
    add:
    - NET_BIND_SERVICE  # 只保留绑定端口的能力
```

**4. Seccomp配置**
```yaml
securityContext:
  seccompProfile:
    type: RuntimeDefault  # 或使用自定义profile
```

**5. AppArmor配置**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: apparmor-pod
  annotations:
    container.apparmor.security.beta.kubernetes.io/myapp: localhost/k8s-apparmor-example
spec:
  containers:
  - name: myapp
    image: myapp:1.0
```

**编排平台安全**：

**1. RBAC**
```yaml
# 最小权限原则
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]  # 只读权限

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: production
subjects:
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

**2. NetworkPolicy**
```yaml
# 默认拒绝所有入站流量
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
spec:
  podSelector: {}
  policyTypes:
  - Ingress

---
# 只允许特定流量
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

**3. PodSecurityPolicy（已废弃，用Pod Security Standards替代）**
```yaml
# Pod Security Admission
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

**4. Secret管理**
```yaml
# ❌ 差：Secret以明文存储在etcd
apiVersion: v1
kind: Secret
metadata:
  name: db-password
type: Opaque
data:
  password: cGFzc3dvcmQxMjM=  # Base64编码，非加密

# ✅ 好：使用外部Secret管理
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-password
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: db-password-secret
  data:
  - secretKey: password
    remoteRef:
      key: secret/production/db
      property: password
```

## 密钥管理

### 4. 如何安全地管理密钥和凭证？

**密钥管理层次**：
```
┌─────────────────────────────────────────────────┐
│              密钥管理最佳实践                     │
└─────────────────────────────────────────────────┘

1. 不在代码中硬编码密钥
2. 使用环境变量或Secret管理
3. 密钥轮换（定期更换）
4. 最小权限原则
5. 审计和监控
```

**密钥管理方案**：

**1. HashiCorp Vault**
```bash
# 启动Vault
vault server -dev

# 启用KV secrets engine
vault secrets enable -path=secret kv-v2

# 存储密钥
vault kv put secret/production/db \
  username="admin" \
  password="secret123"

# 读取密钥
vault kv get secret/production/db

# 在Kubernetes中集成
# 使用Vault Agent Sidecar
```

**2. AWS Secrets Manager**
```python
import boto3
import json

client = boto3.client('secretsmanager')

# 获取密钥
response = client.get_secret_value(SecretId='production/db')
secret = json.loads(response['SecretString'])

db_username = secret['username']
db_password = secret['password']

# 自动轮换
# Secrets Manager支持自动轮换RDS密钥
client.rotate_secret(SecretId='production/db')
```

**3. Kubernetes Secrets + External Secrets Operator**
```yaml
# ExternalSecret定义
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: aws-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: aws-credentials-secret
    creationPolicy: Owner
  data:
  - secretKey: access_key_id
    remoteRef:
      key: prod/aws
      property: access_key_id
  - secretKey: secret_access_key
    remoteRef:
      key: prod/aws
      property: secret_access_key

---
# SecretStore定义
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-west-2
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
```

**4. GitOps Friendly Secrets - Sealed Secrets**
```bash
# 安装Sealed Secrets
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# 创建Sealed Secret（公钥加密）
echo -n 'secret123' | kubectl create secret generic db-password --dry-run=client --from-file==/dev/stdin -o json | kubeseal -o yaml > sealed-secret.yaml

# 部署Sealed Secret（安全提交到Git）
kubectl apply -f sealed-secret.yaml

# Controller自动解密创建Secret
```

**密钥轮换策略**：
```yaml
# 自动轮换配置
apiVersion: v1
kind: Secret
metadata:
  name: api-key
  annotations:
    rotate-every: "90d"  # 90天轮换
type: Opaque
data:
  key: base64-encoded-key

# 轮换流程
# 1. 生成新密钥
# 2. 测试新密钥
# 3. 更新应用配置
# 4. 验证应用正常运行
# 5. 撤销旧密钥
```

**密钥安全检查清单**：
- ✅ 无密钥硬编码在代码中
- ✅ 密钥存储在专用的Secret管理系统中
- ✅ 使用加密传输（TLS）
- ✅ 密钥访问需要认证和授权
- ✅ 密钥定期轮换
- ✅ 审计密钥访问日志
- ✅ 密钥备份和灾难恢复计划

## 安全扫描工具

### 5. 常用的安全扫描工具有哪些？如何集成到CI/CD？

**安全扫描工具分类**：

**1. SAST（静态应用安全测试）**

**SonarQube**
```yaml
# .gitlab-ci.yml
sonarqube:
  stage: security
  image: sonarsource/sonar-scanner-cli
  script:
    - sonar-scanner \
      -Dsonar.projectKey=myproject \
      -Dsonar.sources=src \
      -Dsonar.host.url=$SONAR_HOST \
      -Dsonar.login=$SONAR_TOKEN
  allow_failure: true
```

**Semgrep**
```yaml
# .semgrep.yaml
rules:
  - id: flask-secret-hardcoded
    pattern: app.config['SECRET_KEY'] = '...'
    message: Hardcoded secret key detected
    languages: [python]
    severity: ERROR

# CI/CD集成
semgrep:
  stage: security
  script:
    - semgrep --config auto --json --output semgrep-report.json .
  artifacts:
    reports:
      sast: semgrep-report.json
```

**2. SCA（软件成分分析）**

**Trivy**
```yaml
# 扫描文件系统和镜像
trivy:
  stage: security
  image: aquasec/trivy:latest
  script:
    # 扫描依赖
    - trivy fs --severity HIGH,CRITICAL -o trivy-report.json .
    # 扫描镜像
    - trivy image --severity HIGH,CRITICAL myapp:$CI_COMMIT_SHA
  artifacts:
    reports:
      container_scanning: trivy-report.json
```

**Snyk**
```yaml
snyk:
  stage: security
  image: snyk/snyk-cli:python-3.9
  script:
    - snyk auth $SNYK_TOKEN
    - snyk test --json-file-output snyk-report.json
    - snyk monitor
  allow_failure: true
```

**3. DAST（动态应用安全测试）**

**OWASP ZAP**
```yaml
zap:
  stage: security
  image: zaproxy/zap-stable
  script:
    - zap-baseline.py -t https://staging.example.com -r zap-report.html
  artifacts:
    paths:
      - zap-report.html
  only:
    - main
```

**4. 容器安全扫描**

**Clair**
```yaml
clair:
  stage: security
  script:
    - clairctl analyze myapp:$CI_COMMIT_SHA
    - clairctl report myapp:$CI_COMMIT_SHA
```

**5. K8s配置扫描**

**Kubesec**
```yaml
kubesec:
  stage: security
  image: kubesec/kubesec:v2
  script:
    - kubesec scan k8s/deployment.yaml
```

**kube-score**
```yaml
kube-score:
  stage: security
  image: zegl/kube-score:latest
  script:
    - kube-score score k8s/*.yaml
```

**完整的安全扫描流水线**：
```yaml
# .gitlab-ci.yml
stages:
  - security-scan
  - test
  - build
  - deploy

# 并行执行所有安全扫描
security-scan:
  parallel:
    matrix:
      - SCAN_TYPE: [sast, sca, iac, secrets]
  stage: security-scan
  image: securecodewarrior/docker-security-scanner:latest
  script:
    - |
      case $SCAN_TYPE in
        sast)
          semgrep --config auto .
          ;;
        sca)
          trivy fs .
          ;;
        iac)
          tflint --recursive .
          ;;
        secrets)
          gitleaks detect --source . --verbose
          ;;
      esac
  artifacts:
    reports:
      sast: gl-sast-report.json
      dependency_scanning: gl-dependency-scanning-report.json

# 合规性检查
compliance:
  stage: security-scan
  image: bridgecrew/checkov:latest
  script:
    - checkov -d k8s/ -o junitxml --framework kubernetes
  artifacts:
    reports:
      junit: checkov-report.xml

# 镜像扫描
image-scan:
  stage: build
  image: aquasec/trivy:latest
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:$CI_COMMIT_SHA
  allow_failure: true
```

**安全扫描结果处理**：
```yaml
# 失败策略
security-scan:
  stage: security
  script:
    - trivy image --exit-code 0 --severity HIGH myapp:$IMAGE  # 非阻塞
    - trivy image --exit-code 1 --severity CRITICAL myapp:$IMAGE  # 阻塞
  allow_failure: false  # 或根据严重性决定

# 安全门禁
# 严重漏洞阻断部署
deploy-prod:
  stage: deploy
  needs: [security-scan]
  script:
    - kubectl apply -f k8s/
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
      when: never
    - if: '$CRITICAL_VULNERABILITIES == "0"'
      when: on_success
```

## 安全合规

### 6. 如何实现安全和合规性审计？

**审计框架**：

**1. Kubernetes审计日志**
```yaml
# /etc/kubernetes/audit-policy.yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  # 记录Secret的访问
  - level: RequestResponse
    resources:
    - group: ""
      resources: ["secrets"]

  # 记录所有对Pod的修改
  - level: Metadata
    resources:
    - group: ""
      resources: ["pods"]
    verbs: ["update", "delete"]

  # 记录所有对Deployment的修改
  - level: Request
    resources:
    - group: "apps"
      resources: ["deployments"]
    verbs: ["create", "update", "delete"]

  # 默认不记录
  - level: None
```

**2. 审计日志收集**
```yaml
# Fluentd收集审计日志
apiVersion: v1
kind: ConfigMap
metadata:
  name: audit-log-config
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/kubernetes/audit.log
      pos_file /var/log/fluentd-audit.log.pos
      tag kubernetes.audit
      <parse>
        @type json
      </parse>
    </source>

    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch
      port 9200
      logstash_format true
      logstash_prefix audit
    </match>
```

**3. 合规性检查（CIS Benchmark）**
```bash
# 使用kube-bench检查CIS合规性
kube-bench --benchmark cis-1.23

# 输出示例
[INFO] 1 Master Node Security Configuration
[INFO] 1.1 API Server
[PASS] 1.1.1 Ensure that the --anonymous-auth argument is set to false
[FAIL] 1.1.2 Ensure that the --authorization-mode argument includes Node
```

**4. 自动化合规报告**
```yaml
# 定期生成合规报告
apiVersion: batch/v1
kind: CronJob
metadata:
  name: compliance-report
spec:
  schedule: "0 0 * * 0"  # 每周日午夜
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: kube-bench
            image: aquasec/kube-bench:latest
            command:
            - /bin/bash
            - -c
            - |
              kube-bench --json > /tmp/compliance-report.json
              kubectl cp compliance-report.json s3://compliance-reports/
          restartPolicy: OnFailure
```

**合规性框架对比**：
| 框架              | 适用范围           | 认证              |
|------------------|------------------|------------------|
| CIS Benchmark    | Kubernetes、Docker | 无（基线标准）    |
| NIST SP 800-53   | 美国政府系统       | FedRAMP          |
| ISO 27001        | 信息安全管理       | 国际认证          |
| PCI DSS          | 支付卡行业        | 行业认证          |
| SOC 2            | 服务组织控制       | 审计报告          |

**审计关键指标**：
- ✅ 谁访问了什么资源
- ✅ 何时执行的访问
- ✅ 从哪里发起的访问
- ✅ 执行了什么操作
- ✅ 操作的结果

## 2024-2026安全热点

### 7. eBPF在安全监控中的应用？

**eBPF安全优势**：
- **无侵入**：无需修改应用代码
- **内核级可见性**：捕获系统调用、文件访问、网络连接
- **低性能开销**：<1%的CPU开销
- **实时检测**：毫秒级响应时间

**Falco - 云原生运行时安全**：
```bash
# 安装Falco
helm install falco falco/falco \
  --namespace falco \
  --set tty=true

# 实时监控安全事件
falco-cli

# 输出示例
# 12:34:56.789: Alert Unexpected shell in container (user=root command=sh container=nginx)
```

**Falco规则**：
```yaml
# 检测容器中的shell访问
- macro: shell_executions
  condition: >
    (spawned_processes
      and proc.name in (shell_binaries))

- rule: Detect shell in container
  desc: Detect shell spawned inside container
  condition: >
    shell_executions
    and container
    and not proc.pname exists
  output: >
    Shell spawned in container (user=%user.name command=%proc.cmdline container=%container.name)
  priority: WARNING

# 检测敏感文件访问
- rule: Detect sensitive file access
  desc: Detect access to sensitive files
  condition: >
    open_read
    and fd.name in (/etc/shadow, /etc/passwd, /etc/ssh/sshd_config)
    and not proc.name in (ssh, sshd, login)
  output: >
    Sensitive file accessed (user=%user.name file=%fd.name command=%proc.cmdline)
  priority: ERROR
```

**Parima - 网络安全策略（基于eBPF）**：
```yaml
# 使用Cilium实现L7网络策略
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: security-policy
spec:
  endpointSelector:
    matchLabels:
      app: database
  ingress:
  # 只允许来自API的流量
  - fromEndpoints:
    - matchLabels:
        app: api
    toPorts:
    - ports:
      - port: 5432
        protocol: TCP
      rules:
        http:
        # 只允许GET请求
        - method: GET
          path: /api/v1/users/*
```

### 8. 零信任架构如何实现？

**零信任原则**：
- **永不信任，始终验证**
- **最小权限访问**
- **默认拒绝所有访问**

**零信任架构**：
```
┌─────────────────────────────────────────────────────┐
│                 零信任架构                           │
└─────────────────────────────────────────────────────┘

用户/设备
    │
    ▼
┌─────────────────┐
│  身份验证        │
│  - MFA          │  ← 强认证
│  - SSO          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  设备健康检查     │
│  - 补丁级别      │  ← 设备信任评估
│  - 反病毒软件    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  访问决策引擎     │
│  - 策略评估      │  ← 动态授权
│  - 风险评分      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ 应用   │ │ 数据   │
│ 访问   │ │ 访问   │
└────────┘ └────────┘
    │
    ▼
┌─────────────────┐
│  持续监控        │
│  - 行为分析      │  ← 持续验证
│  - 异常检测      │
└─────────────────┘
```

**Kubernetes零信任实现**：

**1. SPIFFE/SPIRE身份认证**
```bash
# 安装SPIRE
helm install spire crl-spire/spire-agent \
  --namespace spire-system \
  --set spire-server.config.clusterName=mycluster

# Pod自动获取SVID身份
# 每个Pod都有唯一的X.509证书
```

**2. OPA策略控制**
```rego
# policy.rego
package kubernetes.admission

# 拒绝特权容器
deny[msg] {
  input.request.kind.kind == "Pod"
  input.request.operation == "create"
  input.request.object.spec.containers[_].securityContext.privileged == true
  msg := "Privileged containers are not allowed"
}

# 要求资源限制
deny[msg] {
  input.request.kind.kind == "Pod"
  not input.request.object.spec.containers[_].resources
  msg := "Containers must have resource limits"
}

# 要求非root用户运行
deny[msg] {
  input.request.kind.kind == "Pod"
  not input.request.object.spec.containers[_].securityContext.runAsNonRoot == true
  msg := "Containers must run as non-root user"
}
```

**3. 服务网格mTLS**
```yaml
# Istio自动mTLS
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
spec:
  mtls:
    mode: STRICT  # 强制mTLS
---
apiVersion: networking.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: deny-all
spec:
  {}
---
apiVersion: networking.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-api-to-db
spec:
  selector:
    matchLabels:
      app: database
  rules:
  - from:
    - source:
        principals:
        - cluster.local/ns/default/sa/api-service
    to:
    - operation:
        methods: ["GET", "POST"]
```

### 9. 软件供应链安全（SBOM、Sigstore）？

**软件供应链风险**：
- 依赖漏洞（log4j、spring4shell）
- 恶意包投毒
- 供应链攻击
- 未授权的镜像修改

**SBOM（软件物料清单）**：
```bash
# 生成SBOM
syft myapp:latest -o spdx-json > sbom.json

# SBOM内容示例
{
  "spdxVersion": "SPDX-2.3",
  "dataLicense": "CC0-1.0",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "myapp",
  "packages": [
    {
      "SPDXID": "SPDXRef-Package-nginx",
      "name": "nginx",
      "versionInfo": "1.25.2",
      "downloadLocation": "https://nginx.org/download/nginx-1.25.2.tar.gz",
      "filesAnalyzed": false,
      "licenseConcluded": "BSD-2-Clause"
    }
  ]
}

# 扫描SBOM漏洞
grype sbom:myapp-sbom.json
```

**Sigstore（代码签名）**：
```bash
# 签名容器镜像
cosign sign --key cosign.key myapp:latest

# 验证签名
cosign verify --key cosign.pub myapp:latest

# 输出示例
# Verification for myapp:latest
# The following checks were performed on each of these signatures:
#   - The cosign claims were validated
#   - Existence of the claims in the transparency log was verified offline
#   - Any certificates were verified against the Fulcio roots
```

**Kubernetes策略验证**：
```yaml
# Kyverno策略：要求镜像签名验证
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-image-signature
spec:
  validationFailureAction: enforce
  background: true
  rules:
  - name: verify-signature
    match:
      resources:
        kinds:
        - Pod
    verifyImages:
    - imageReferences:
      - "*"
        attestors:
        - entries:
          - keys:
              publicKeys: |-
                -----BEGIN PUBLIC KEY-----
                MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
                -----END PUBLIC KEY-----
```

**供应链安全最佳实践**：
```yaml
# 1. 镜像扫描
image-scan:
  stage: test
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:$CI_COMMIT_SHA

# 2. SBOM生成
generate-sbom:
  stage: build
  script:
    - syft myapp:$CI_COMMIT_SHA -o cyclonedx-json > sbom.json
  artifacts:
    paths:
      - sbom.json

# 3. 签名
sign-image:
  stage: deploy
  script:
    - cosign sign --key $COSIGN_KEY myapp:$CI_COMMIT_SHA

# 4. 策略验证
policy-check:
  stage: deploy
  script:
    - conftest verify k8s/deployment.yaml --policy policies
```

### 10. AI安全如何防护？

**AI安全威胁**：

**1. 对抗样本攻击**
```python
# 对抗样本示例
import numpy as np
from cleverhans import tf_attacks

# 生成对抗样本,欺骗AI模型
fgsm = tf_attacks.FastGradientMethod(model, sess=sess)
adv_x = fgsm.generate_np(x, eps=0.3, ord=np.inf)

# 防御措施
defense = adversarial_training.TrainAdversarial(model, sess=sess)
```

**2. 模型提取攻击**
```python
# 防御：限制API访问频率
rate_limit:
  requests_per_minute: 100
  burst: 10

# 添加噪声响应
def predict_with_noise(input):
  prediction = model.predict(input)
  noise = np.random.normal(0, 0.01, prediction.shape)
  return prediction + noise
```

**3. 提示词注入**
```python
# 检测和过滤恶意提示词
import re

def detect_prompt_injection(prompt):
  # 检测常见注入模式
  injection_patterns = [
    r"ignore (previous|all) instructions",
    r"disregard (above|earlier)",
    r"forget (everything|previous)",
    r"system:\s*override"
  ]

  for pattern in injection_patterns:
    if re.search(pattern, prompt, re.IGNORECASE):
      return True
  return False

# 使用
if detect_prompt_injection(user_input):
  return "Error: Potential prompt injection detected"
```

**AI安全最佳实践**：

```yaml
# 1. 数据安全
data_security:
  encryption: AES-256
  access_control: RBAC
  audit_logging: true

# 2. 模型安全
model_security:
  - 模型加密存储
  - 模型访问控制
  - 模型版本管理
  - 定期安全审计

# 3. API安全
api_security:
  authentication: OAuth2
  rate_limiting: true
  input_validation: strict
  output_filtering: true

# 4. 部署安全
deployment_security:
  network_isolation: true
  resource_quotas: true
  runtime_security: Falco
  secrets_management: Vault
```

### 11. 密钥管理最佳实践？

**密钥管理层次**：

**1. 本地开发环境**
```bash
# 使用.env文件（.gitignore）
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=dev_key_12345

# 或使用direnv
echo 'export DATABASE_URL="postgresql://localhost:5432/mydb"' > .envrc
direnv allow
```

**2. Kubernetes Secrets**
```yaml
# 加密Secret（启用EncryptionConfiguration）
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:
  database-url: "postgresql://user:pass@db:5432/mydb"
  api-key: "prod_key_xyz"
```

**3. 外部密钥管理（HashiCorp Vault）**
```bash
# 部署Vault
helm install vault hashicorp/vault \
  --set server.dev.enabled=true

# 启用Kubernetes认证
vault auth enable kubernetes

# 创建策略
vault policy write myapp-policy - <<EOF
path "secret/data/myapp/*" {
  capabilities = ["read"]
}
EOF

# 应用读取密钥
from hvac import Client
client = Client(url='http://vault:8200')
client.auth.kubernetes.login(role='myapp')
secret = client.secrets.kv.v2.read_secret_version(path='myapp/config')
```

**4. 云服务密钥管理**
```yaml
# AWS Secrets Manager
# Kubernetes外部密钥供应
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: db-credentials
    creationPolicy: Owner
  data:
  - secretKey: database-url
    remoteRef:
      key: prod/myapp/database-url
```

**密钥轮换策略**：
```yaml
# 自动轮换（Kubernetes + External Secrets Operator）
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-west-2
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
---
# 定期轮换（90天）
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: db-credentials
spec:
  encryptedData:
    database-url: AgBy3i4OJSWK+PiTySY...（加密）
  template:
    metadata:
      annotations:
        rotation-period: "90d"
```

**密钥管理最佳实践**：
```yaml
# ✅ DO
best_practices:
  - 集中管理密钥
  - 定期轮换密钥
  - 最小权限原则
  - 审计密钥访问
  - 加密传输和存储
  - 使用临时凭证（STS）

# ❌ DON'T
bad_practices:
  - 硬编码密钥
  - 明文存储密钥
  - 密钥提交到Git
  - 长期使用同一密钥
  - 共享密钥
  - 弱密钥策略
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
