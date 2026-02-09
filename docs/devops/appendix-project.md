# DevOps 综合实战项目

欢迎来到 DevOps 综合实战！本章将带你完成 4 个企业级实战项目，将前面学到的所有技术整合应用。

## 实战项目概览

```
🚀 DevOps 综合实战
├─ 实战1：微服务架构完整部署 [⏱️ 8小时]
│   ├─ 三层架构应用
│   ├─ Docker + Kubernetes
│   ├─ Jenkins + Argo CD
│   ├─ Prometheus + Grafana
│   └─ ELK Stack
│
├─ 实战2：多环境管理实战 [⏱️ 6小时]
│   ├─ dev/staging/prod 三环境
│   ├─ GitOps 多环境策略
│   ├─ 环境隔离与配置管理
│   └─ 蓝绿/金丝雀发布
│
├─ 实战3：云平台完整部署 [⏱️ 10小时]
│   ├─ Terraform 创建基础设施
│   ├─ AWS EKS / 阿里云 ACK
│   ├─ RDS / Redis 云服务
│   └─ CI/CD + GitOps 完整流程
│
└─ 实战4：灾难恢复与高可用 [⏱️ 8小时]
    ├─ 多区域部署
    ├─ 自动备份与恢复
    ├─ 故障转移
    └─ 演练计划
```

---

## 实战1：微服务架构完整部署

### 项目架构

我们将部署一个完整的电商系统，包含以下微服务：

```
┌─────────────────────────────────────────────┐
│                   API Gateway               │
│              (Nginx / Kong)                  │
└───────────────┬─────────────────────────────┘
                │
    ┌───────────┼───────────┬──────────────┐
    │           │           │              │
┌───▼───┐  ┌───▼───┐  ┌───▼───┐    ┌─────▼─────┐
│ User  │  │ Product│  │ Order │    │ Payment   │
│ Service│  │ Service│  │ Service│    │ Service   │
└───┬───┘  └───┬───┘  └───┬───┘    └─────┬─────┘
    │          │          │              │
┌───▼──────────▼──────────▼──────────────▼───┐
│           PostgreSQL (主数据库)             │
├─────────────────────────────────────────────┤
│           Redis (缓存)                     │
├─────────────────────────────────────────────┤
│         RabbitMQ (消息队列)                 │
└─────────────────────────────────────────────┘
```

### 项目1.1：准备应用代码

**创建项目结构**

```bash
# 创建项目目录
mkdir microshop && cd microshop
mkdir -p services/{user-service,product-service,order-service,payment-service}
mkdir -f k8s/{base,overlays/{dev,staging,prod}}
mkdir -f ci/{jenkins,argocd}
mkdir -f monitor/{prometheus,grafana}
```

**1. 用户服务**

`services/user-service/app.py`：
```python
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DB_URL', 'postgresql://user:pass@db:5432/microshop')
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'user-service'})

@app.route('/users', methods=['GET', 'POST'])
def users():
    if request.method == 'POST':
        data = request.json
        user = User(username=data['username'], email=data['email'])
        db.session.add(user)
        db.session.commit()
        return jsonify({'id': user.id}), 201
    users = User.query.all()
    return jsonify([{'id': u.id, 'username': u.username} for u in users])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5001)
```

`services/user-service/Dockerfile`：
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5001
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:5001/health || exit 1

CMD ["python", "app.py"]
```

`services/user-service/requirements.txt`：
```txt
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
psycopg2-binary==2.9.9
```

**2. 产品服务**

`services/product-service/app.py`：
```python
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import os
import redis

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DB_URL', 'postgresql://user:pass@db:5432/microshop')
db = SQLAlchemy(app)

# Redis 缓存
cache = redis.Redis(host=os.getenv('REDIS_HOST', 'redis'), port=6379, decode_responses=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'product-service'})

@app.route('/products', methods=['GET', 'POST'])
def products():
    if request.method == 'POST':
        data = request.json
        product = Product(name=data['name'], price=data['price'], stock=data['stock'])
        db.session.add(product)
        db.session.commit()
        # 清除缓存
        cache.delete('products:all')
        return jsonify({'id': product.id}), 201

    # 尝试从缓存获取
    cached = cache.get('products:all')
    if cached:
        return jsonify(eval(cached))

    products = Product.query.all()
    result = [{'id': p.id, 'name': p.name, 'price': p.price} for p in products]
    # 缓存1小时
    cache.setex('products:all', 3600, str(result))
    return jsonify(result)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5002)
```

**3. 订单服务**

`services/order-service/app.py`：
```python
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import os
import pika
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DB_URL', 'postgresql://user:pass@db:5432/microshop')
db = SQLAlchemy(app)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), default='pending')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'order-service'})

@app.route('/orders', methods=['POST'])
def create_order():
    data = request.json
    order = Order(user_id=data['user_id'], product_id=data['product_id'])
    db.session.add(order)
    db.session.commit()

    # 发送消息到 RabbitMQ
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
    channel = connection.channel()
    channel.queue_declare(queue='orders')
    channel.basic_publish(exchange='', routing_key='orders', body=json.dumps({
        'order_id': order.id,
        'user_id': order.user_id,
        'product_id': order.product_id
    }))
    connection.close()

    return jsonify({'id': order.id}), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5003)
```

**4. API Gateway**

`services/api-gateway/nginx.conf`：
```nginx
upstream user_service {
    least_conn;
    server user-service:5001;
    server user-service-2:5001;
}

upstream product_service {
    least_conn;
    server product-service:5002;
}

upstream order_service {
    least_conn;
    server order-service:5003;
}

server {
    listen 80;

    location /api/users {
        proxy_pass http://user_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/products {
        proxy_pass http://product_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/orders {
        proxy_pass http://order_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

`services/api-gateway/Dockerfile`：
```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 项目1.2：Kubernetes 部署

**命名空间和配置**

`k8s/base/namespace.yaml`：
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: microshop
```

**ConfigMap**

`k8s/base/configmap.yaml`：
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: microshop
data:
  DB_URL: "postgresql://user:password@postgres:5432/microshop"
  REDIS_HOST: "redis"
```

**Secret**

`k8s/base/secret.yaml`：
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
  namespace: microshop
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQxMjM=  # base64 encoded
```

**PostgreSQL 部署**

`k8s/base/postgres.yaml`：
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: microshop
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 10Gi

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: microshop
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: microshop
        - name: POSTGRES_USER
          value: user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: DB_PASSWORD
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        livenessProbe:
          exec:
            command: ["pg_isready", "-U", "user"]
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command: ["pg_isready", "-U", "user"]
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: microshop
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

**Redis 部署**

`k8s/base/redis.yaml`：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: microshop
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: microshop
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
```

**RabbitMQ 部署**

`k8s/base/rabbitmq.yaml`：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rabbitmq
  namespace: microshop
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rabbitmq
  template:
    metadata:
      labels:
        app: rabbitmq
    spec:
      containers:
      - name: rabbitmq
        image: rabbitmq:3.12-management-alpine
        ports:
        - containerPort: 5672
        - containerPort: 15672
        env:
        - name: RABBITMQ_DEFAULT_USER
          value: admin
        - name: RABBITMQ_DEFAULT_PASS
          value: admin123

---
apiVersion: v1
kind: Service
metadata:
  name: rabbitmq
  namespace: microshop
spec:
  selector:
    app: rabbitmq
  ports:
  - name: amqp
    port: 5672
    targetPort: 5672
  - name: management
    port: 15672
    targetPort: 15672
```

**用户服务部署**

`k8s/base/user-service.yaml`：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: microshop
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "5001"
    spec:
      containers:
      - name: user-service
        image: microshop/user-service:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 5001
        env:
        - name: DB_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DB_URL
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5001
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: microshop
spec:
  selector:
    app: user-service
  ports:
  - port: 5001
    targetPort: 5001

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
  namespace: microshop
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**产品服务部署**

`k8s/base/product-service.yaml`：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
  namespace: microshop
spec:
  replicas: 2
  selector:
    matchLabels:
      app: product-service
  template:
    metadata:
      labels:
        app: product-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "5002"
    spec:
      containers:
      - name: product-service
        image: microshop/product-service:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 5002
        env:
        - name: DB_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DB_URL
        - name: REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: REDIS_HOST
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: product-service
  namespace: microshop
spec:
  selector:
    app: product-service
  ports:
  - port: 5002
    targetPort: 5002
```

**API Gateway 部署**

`k8s/base/api-gateway.yaml`：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: microshop
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: nginx
        image: microshop/api-gateway:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"

---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: microshop
spec:
  selector:
    app: api-gateway
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
```

**Ingress**

`k8s/base/ingress.yaml`：
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: microshop-ingress
  namespace: microshop
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.microshop.com
    secretName: microshop-tls
  rules:
  - host: api.microshop.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 80
```

### 项目1.3：Kustomize 多环境配置

**开发环境**

`k8s/overlays/dev/kustomization.yaml`：
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: microshop-dev

resources:
- ../../base

replicas:
- name: user-service
  count: 1
- name: product-service
  count: 1

images:
- name: microshop/user-service
  newTag: dev
- name: microshop/product-service
  newTag: dev
```

**生产环境**

`k8s/overlays/prod/kustomization.yaml`：
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: microshop-prod

resources:
- ../../base

replicas:
- name: user-service
  count: 3
- name: product-service
  count: 3

patches:
- patch: |-
    - op: add
      path: /spec/template/spec/containers/0/resources/limits
      value:
        memory: "512Mi"
        cpu: "500m"
  target:
    kind: Deployment
```

### 项目1.4：CI/CD 流水线

**Jenkins Pipeline**

`ci/jenkins/Jenkinsfile`：
```groovy
pipeline {
    agent any

    environment {
        REGISTRY = 'your-registry.com'
        PROJECT = 'microshop'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            parallel {
                stage('Build User Service') {
                    steps {
                        dir('services/user-service') {
                            sh 'docker build -t ${REGISTRY}/${PROJECT}/user-service:${BUILD_NUMBER} .'
                        }
                    }
                }
                stage('Build Product Service') {
                    steps {
                        dir('services/product-service') {
                            sh 'docker build -t ${REGISTRY}/${PROJECT}/product-service:${BUILD_NUMBER} .'
                        }
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                script {
                    def images = [
                        "${REGISTRY}/${PROJECT}/user-service:${BUILD_NUMBER}",
                        "${REGISTRY}/${PROJECT}/product-service:${BUILD_NUMBER}"
                    ]
                    images.each { img ->
                        sh "trivy image --severity HIGH,CRITICAL ${img}"
                    }
                }
            }
        }

        stage('Push') {
            steps {
                script {
                    def images = ['user-service', 'product-service']
                    withDockerRegistry([url: "https://${REGISTRY}", credentialsId: 'docker-registry']) {
                        images.each { img ->
                            sh """
                                docker push ${REGISTRY}/${PROJECT}/${img}:${BUILD_NUMBER}
                                docker tag ${REGISTRY}/${PROJECT}/${img}:${BUILD_NUMBER} ${REGISTRY}/${PROJECT}/${img}:latest
                                docker push ${REGISTRY}/${PROJECT}/${img}:latest
                            """
                        }
                    }
                }
            }
        }

        stage('Deploy to Dev') {
            steps {
                dir('k8s/overlays/dev') {
                    sh "kubectl set image deployment/user-service user-service=${REGISTRY}/${PROJECT}/user-service:${BUILD_NUMBER} -n microshop-dev"
                    sh "kubectl set image deployment/product-service product-service=${REGISTRY}/${PROJECT}/product-service:${BUILD_NUMBER} -n microshop-dev"
                }
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    # 等待部署就绪
                    kubectl rollout status deployment/user-service -n microshop-dev
                    kubectl rollout status deployment/product-service -n microshop-dev

                    # 运行集成测试
                    python tests/integration.py
                '''
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                input message: '部署到测试环境？', ok: '部署'
                dir('k8s/overlays/staging') {
                    sh "kubectl apply -k ."
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: '部署到生产环境？', ok: '确认部署'
                dir('k8s/overlays/prod') {
                    sh "kubectl apply -k ."
                }
            }
        }
    }

    post {
        success {
            emailext(
                subject: "部署成功: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "构建 ${env.BUILD_NUMBER} 已成功部署到生产环境",
                to: 'team@example.com'
            )
        }
        failure {
            emailext(
                subject: "部署失败: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "构建 ${env.BUILD_NUMBER} 失败",
                to: 'team@example.com'
            )
        }
    }
}
```

### 项目1.5：Argo CD GitOps

**Application**

`ci/argocd/microshop-app.yaml`：
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: microshop
  namespace: argocd
spec:
  project: default

  source:
    repoURL: https://github.com/yourorg/microshop-k8s.git
    targetRevision: main
    path: k8s/overlays/dev

  destination:
    server: https://kubernetes.default.svc
    namespace: microshop-dev

  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### 项目1.6：监控和日志

**Prometheus ServiceMonitor**

`monitor/prometheus/servicemonitor.yaml`：
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: microshop-services
  namespace: microshop
spec:
  selector:
    matchLabels:
      app: user-service
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
```

**Grafana Dashboard**

`monitor/grafana/dashboards/microshop.json`：
```json
{
  "title": "MicroShop 监控",
  "panels": [
    {
      "title": "请求量",
      "targets": [
        {
          "expr": "sum(rate(http_requests_total{namespace='microshop'}[5m]))"
        }
      ]
    },
    {
      "title": "错误率",
      "targets": [
        {
          "expr": "sum(rate(http_requests_total{status=~'5..'}[5m])) / sum(rate(http_requests_total[5m]))"
        }
      ]
    },
    {
      "title": "P95 延迟",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
        }
      ]
    }
  ]
}
```

**Filebeat 日志收集**

`monitor/filebeat/filebeat-configmap.yaml`：
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebeat-config
  namespace: microshop
data:
  filebeat.yml: |-
    filebeat.inputs:
    - type: container
      enabled: true
      paths:
        - /var/log/containers/*.log
      processors:
        - add_kubernetes_metadata:
            host: ${NODE_NAME}
            matchers:
            - logs_path:
                logs_path: "/var/log/containers/"

    output.elasticsearch:
      hosts: ["elasticsearch:9200"]
      index: "microshop-%{+yyyy.MM.dd}"

    setup.template.name: "microshop"
    setup.template.pattern: "microshop-*"
```

---

## 实战2：多环境管理实战

### 项目2.1：环境策略

**环境定义**

| 环境 | 用途 | 副本数 | 资源限制 | 自动伸缩 |
|------|------|--------|----------|----------|
| **dev** | 开发测试 | 1 | 小 | 禁用 |
| **staging** | 预发布 | 2 | 中 | 启用 |
| **prod** | 生产环境 | 3+ | 大 | 启用 |

**Kustomize 目录结构**

```
k8s/
├── base/                 # 基础配置
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── overlays/
│   ├── dev/             # 开发环境
│   │   └── kustomization.yaml
│   ├── staging/         # 测试环境
│   │   ├── kustomization.yaml
│   │   └── patches/
│   └── prod/            # 生产环境
│       ├── kustomization.yaml
│       └── patches/
```

### 项目2.2：环境隔离

**命名空间隔离**

`k8s/overlays/prod/namespace.yaml`：
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: microshop-prod
  labels:
    environment: production
    team: backend

---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: microshop-prod
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi

---
apiVersion: v1
kind: LimitRange
metadata:
  name: limit-range
  namespace: microshop-prod
spec:
  limits:
  - default:
      cpu: "500m"
      memory: "512Mi"
    defaultRequest:
      cpu: "100m"
      memory: "128Mi"
    type: Container
```

**网络策略**

`k8s/overlays/prod/network-policy.yaml`：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: microshop-prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress

---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-same-namespace
  namespace: microshop-prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector: {}
  egress:
  - to:
    - podSelector: {}
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: UDP
      port: 53

---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress
  namespace: microshop-prod
spec:
  podSelector:
    matchLabels:
      app: api-gateway
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

### 项目2.3：配置管理

**环境配置**

`k8s/overlays/dev/configmap.yaml`：
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: microshop-dev
data:
  LOG_LEVEL: "DEBUG"
  DB_POOL_SIZE: "5"
  CACHE_TTL: "3600"
  FEATURE_FLAGS: |
    new-ui: true
    beta-api: true
```

`k8s/overlays/prod/configmap.yaml`：
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: microshop-prod
data:
  LOG_LEVEL: "INFO"
  DB_POOL_SIZE: "20"
  CACHE_TTL: "7200"
  FEATURE_FLAGS: |
    new-ui: true
    beta-api: false
```

### 项目2.4：部署策略

**蓝绿部署**

`k8s/overlays/prod/blue-green-service.yaml`：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: microshop-prod
spec:
  selector:
    app: user-service
    version: blue  # 或 green
  ports:
  - port: 5001
    targetPort: 5001
```

**金丝雀部署**

`k8s/overlays/prod/canary-deployment.yaml`：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service-canary
  namespace: microshop-prod
spec:
  replicas: 1  # 10% 流量
  selector:
    matchLabels:
      app: user-service
      track: canary
  template:
    metadata:
      labels:
        app: user-service
        track: canary
        version: v2.0
    spec:
      containers:
      - name: user-service
        image: microshop/user-service:v2.0
```

**使用 Argo Rollouts**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: user-service
  namespace: microshop-prod
spec:
  replicas: 5
  strategy:
    canary:
      steps:
      - setWeight: 10
      - pause: {duration: 10m}
      - setWeight: 30
      - pause: {duration: 10m}
      - setWeight: 50
      - pause: {duration: 10m}
      - setWeight: 100
      canaryService: user-service-canary
      stableService: user-service-stable
  revisionHistoryLimit: 2
  selector:
    matchLabels:
      app: user-service
  template:
    # ... deployment template
```

---

## 实战3：云平台完整部署

### 项目3.1：Terraform 基础设施

**AWS EKS 集群**

`terraform/main.tf`：
```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "${var.project_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.region}a", "${var.region}b", "${var.region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.17.2"

  cluster_name    = "${var.project_name}-eks"
  cluster_version = "1.27"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  eks_managed_node_groups = {
    general = {
      desired_size = 3
      min_size     = 2
      max_size     = 10

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"

      labels = {
        Environment = var.environment
      }
    }

    spot = {
      desired_size = 2
      min_size     = 0
      max_size     = 5

      instance_types = ["t3a.small"]
      capacity_type  = "SPOT"

      labels = {
        Environment = var.environment
        Type        = "spot"
      }
    }
  }

  tags = {
    Environment = var.environment
  }
}

# RDS PostgreSQL
module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 5.0"

  identifier = "${var.project_name}-db"

  engine            = "postgres"
  engine_version    = "15.3"
  instance_class    = "db.t3.medium"
  allocated_storage = 20

  db_name  = "microshop"
  username = "admin"
  port     = 5432

  vpc_security_group_ids = [module.security_group.security_group_id]
  db_subnet_group_name   = module.vpc.database_subnet_group

  managed_database_family = "postgres15"

  tags = {
    Environment = var.environment
  }
}

# ElastiCache Redis
module "elasticache" {
  source  = "terraform-aws-modules/elasticache/aws"
  version = "~> 1.0"

  cluster_id      = "${var.project_name}-redis"
  engine_version  = "7.0"
  node_type       = "cache.t3.small"
  num_cache_nodes = 2

  subnet_group_name  = module.vpc.redis_subnet_group
  security_group_ids = [module.security_group.security_group_id]

  tags = {
    Environment = var.environment
  }
}

# Outputs
output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "db_endpoint" {
  description = "RDS endpoint"
  value       = module.db.db_instance_endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.elasticache.cluster_endpoint
}
```

`terraform/variables.tf`：
```hcl
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "microshop"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}
```

**部署基础设施**

```bash
# 初始化
terraform init

# 规划
terraform plan -var="environment=prod"

# 应用
terraform apply -var="environment=prod" -auto-approve
```

### 项目3.2：配置 kubectl

```bash
# 更新 kubeconfig
aws eks update-kubeconfig --region us-east-1 --name microshop-eks

# 验证
kubectl get nodes
kubectl get svc
```

### 项目3.3：部署应用

```bash
# 创建 secrets
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password=$(aws secretsmanager get-secret-value --secret-id prod/db/password --query SecretString --output text)

# 部署应用
kubectl apply -k k8s/overlays/prod

# 等待就绪
kubectl rollout status deployment/user-service -n microshop-prod
```

---

## 实战4：灾难恢复与高可用

### 项目4.1：多区域部署

**跨区域架构**

```
主区域 (us-east-1)        备区域 (us-west-2)
     │                          │
     ├─ EKS Cluster             ├─ EKS Cluster
     ├─ RDS (Multi-AZ)          ├─ RDS Read Replica
     ├─ ElastiCache             ├─ ElastiCache
     └─ S3                      └─ S3 (Cross-Region Replication)
```

**Terraform 多区域配置**

```hcl
# 主区域
module "primary" {
  source = "./modules/infrastructure"

  region      = "us-east-1"
  environment = "prod"

  enable_secondary = false
}

# 备区域
module "secondary" {
  source = "./modules/infrastructure"

  region      = "us-west-2"
  environment = "prod"

  # 主区域信息
  primary_region     = "us-east-1"
  primary_vpc_cidr   = module.primary.vpc_cidr
  primary_db_endpoint = module.primary.db_endpoint

  enable_secondary = true
}
```

### 项目4.2：自动备份

**RDS 自动备份**

```hcl
resource "aws_db_instance" "primary" {
  # ...
  backup_retention_period = 30  # 保留30天
  backup_window         = "03:00-04:00"

  # 开启 PITR (Point-In-Time Recovery)
  skip_final_snapshot = false
  final_snapshot_identifier = "microshop-final-snapshot"
}
```

**EBS 快照**

```hcl
resource "aws_ebs_volume" "data" {
  # ...
}

resource "aws_backup_vault" "microshop" {
  name = "microshop-backup-vault"
}

resource "aws_backup_plan" "daily" {
  name = "daily-backup-plan"

  rule {
    rule_name           = "daily-backup"
    target_vault_name   = aws_backup_vault.microshop.name
    schedule_expression = "cron(0 2 * * ? *)"

    lifecycle {
      delete_after = 30
    }
  }
}
```

### 项目4.3：故障转移

**DNS 故障转移**

```hcl
# Route53 Health Check
resource "aws_route53_health_check" "primary" {
  fqdn              = "api.microshop.com"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  request_interval  = 30
  failure_threshold = 3
}

# Primary Record
resource "aws_route53_record" "primary" {
  zone_id = var.hosted_zone_id
  name    = "api.microshop.com"
  type    = "A"

  alias {
    name                   = aws_lb.primary.dns_name
    zone_id                = aws_lb.primary.zone_id
    evaluate_target_health = true
  }

  failover_routing_policy {
    type = "PRIMARY"
  }

  set_identifier = "primary-region"
  health_check_id = aws_route53_health_check.primary.id
}

# Secondary Record
resource "aws_route53_record" "secondary" {
  zone_id = var.hosted_zone_id
  name    = "api.microshop.com"
  type    = "A"

  alias {
    name                   = aws_lb.secondary.dns_name
    zone_id                = aws_lb.secondary.zone_id
    evaluate_target_health = true
  }

  failover_routing_policy {
    type = "SECONDARY"
  }

  set_identifier = "secondary-region"
}
```

### 项目4.4：灾难恢复演练

**演练计划**

```yaml
# disaster-recovery-drill.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: drill-plan
  namespace: microshop-prod
data:
  plan: |
    演练计划：区域故障转移

    频率：每季度一次

    步骤：
    1. 准备阶段
       - 通知团队
       - 备份当前配置
       - 记录开始时间

    2. 模拟故障
       - 停止主区域 ALB
       - 监控健康检查
       - 验证 DNS 切换

    3. 验证功能
       - 检查备区域服务
       - 运行集成测试
       - 验证数据同步

    4. 恢复主区域
       - 恢复主区域 ALB
       - 验证 DNS 回切
       - 数据同步验证

    5. 复盘
       - 记录 RTO (Recovery Time Objective)
       - 记录 RPO (Recovery Point Objective)
       - 总结问题和改进点
```

**自动化演练脚本**

```bash
#!/bin/bash
# drill-test.sh

set -e

DRILL_DATE=$(date +%Y%m%d)
LOG_FILE="drill-${DRILL_DATE}.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "开始灾难恢复演练"

# 1. 备份当前配置
log "备份配置..."
kubectl get all -n microshop-prod -o yaml > backup-${DRILL_DATE}.yaml

# 2. 模拟故障
log "模拟主区域故障..."
aws elbv2 set-load-balancer-attributes \
  --load-balancer-arn $PRIMARY_ALB_ARN \
  --attributes Key=access_logs.s3.enabled,Value=false

# 3. 等待 DNS 切换
log "等待 DNS 切换..."
sleep 300

# 4. 验证服务
log "验证服务状态..."
for i in {1..10}; do
  if curl -f https://api.microshop.com/health; then
    log "服务正常"
    break
  fi
  log "等待服务就绪... ($i/10)"
  sleep 30
done

# 5. 运行测试
log "运行集成测试..."
pytest tests/integration/ --region=secondary

# 6. 恢复
log "恢复主区域..."
aws elbv2 set-load-balancer-attributes \
  --load-balancer-arn $PRIMARY_ALB_ARN \
  --attributes Key=access_logs.s3.enabled,Value=true

log "演练完成！"
```

---

## 学习建议

### 实战顺序

1. **先实战1**：掌握完整的微服务部署流程
2. **再实战2**：学习多环境管理策略
3. **然后实战3**：实践云平台部署
4. **最后实战4**：掌握高可用和灾难恢复

### 实践建议

1. **本地验证**：先在本地 Docker/K8s 测试
2. **逐步部署**：一个服务一个服务地部署
3. **充分测试**：每个阶段都要验证功能
4. **记录日志**：详细记录部署过程和问题
5. **团队协作**：最好2-3人一起完成

### 练习任务

- [ ] 完成实战1：微服务部署
- [ ] 完成实战2：多环境管理
- [ ] 完成实战3：云平台部署
- [ ] 完成实战4：灾难恢复演练
- [ ] 总结实战经验

## 总结

通过这 4 个综合实战项目，你将：

- 掌握企业级微服务架构的完整部署
- 理解多环境管理和配置策略
- 学会在云平台上构建基础设施
- 具备灾难恢复和高可用能力

这些都是 DevOps 工程师必备的核心技能！

## 推荐资源

- [Kubernetes 官方文档](https://kubernetes.io/docs/)
- [AWS EKS 最佳实践](https://docs.aws.amazon.com/eks/)
- [Terraform Registry](https://registry.terraform.io/)
- [Argo CD 文档](https://argoproj.github.io/argo-cd/)

---

---

# 附录D：2024-2026企业级DevOps实战项目 {#-附录d2024-2026企业级devops实战项目}

> **2024-2026 DevOps技术趋势**
>
> 根据[最新DevOps趋势分析](https://devops.com/top-15-devops-trends-to-watch-in-2026/)：
> - **Platform Engineering** 超越传统DevOps，成为2025-2026主流
> - **GitOps** 成为云原生应用部署的标准实践
> - **DevSecOps** 安全左移成为标配
> - **AIOps** AI驱动的自动化运维
> - **Internal Developer Platforms (IDPs)** 提升开发者体验
>
> 基于这些趋势，我们新增 **2个企业级DevOps实战项目**，涵盖Platform Engineering和AIOps等前沿技术。

---

## 实战5：Platform Engineering - 内部开发者平台（IDP）

### 技术栈（2024-2026主流）

根据[Platform Engineering趋势](https://medium.com/@orlando1409/beyond-kubernetes-platform-engineering-trends-for-2026-8f82e09e27e0)：

```
🏗️ Backstage（Spotify开源IDP框架）
☸️ Kubernetes + Helm
🔄 Argo CD（GitOps）
📊 Prometheus + Grafana（监控）
🔐 Vault（密钥管理）
🎨 Traefik（API Gateway）
🤖 OPA（策略引擎）
📚 Tech Docs（文档）
```

### 项目简介

构建一个完整的内部开发者平台（IDP），简化开发者体验，自动化基础设施管理。

**核心功能**：
```
🎯 服务目录：自动发现和注册所有服务
🚀 一键部署：通过模板快速创建服务
📊 可观测性：统一的监控、日志、追踪仪表盘
🔐 权限管理：基于角色的访问控制
📚 文档管理：自动生成和更新服务文档
🔄 自助服务：开发者自助管理资源
🎨 插件系统：可扩展的插件架构
🤖 AI助手：智能建议和故障排查
```

### 项目架构

```
platform-engineering/
├── backstage/                    # Backstage应用
│   ├── app/                      # 应用配置
│   │   ├── project.ts           # 项目配置
│   │   └── plugins/             # 插件配置
│   ├── plugins/                  # 自定义插件
│   │   ├── service-template/    # 服务模板插件
│   │   ├── deployment/          # 部署插件
│   │   ├── monitoring/          # 监控插件
│   │   └── ai-assistant/        # AI助手插件
│   ├── templates/                # 服务模板
│   │   ├── microservice/        # 微服务模板
│   │   ├── serverless/          # Serverless模板
│   │   └── ml-pipeline/         # ML流水线模板
│   └── catalog-info.yaml        # 服务目录配置
│
├── infrastructure/              # 基础设施
│   ├── terraform/               # Terraform配置
│   │   ├── modules/             # 可复用模块
│   │   ├── environments/        # 环境配置
│   │   └── examples/            # 使用示例
│   ├── kubernetes/              # K8s配置
│   │   ├── base/                # 基础配置
│   │   ├── overlays/            # 环境覆盖
│   │   └── helm-charts/         # Helm charts
│   └── ansible/                 # Ansible playbooks
│
├── pipelines/                   # CI/CD流水线
│   ├── jenkins/                 # Jenkins流水线
│   ├── github-actions/          # GitHub Actions
│   └── gitlab-ci/               # GitLab CI
│
├── monitoring/                  # 监控系统
│   ├── prometheus/              # Prometheus配置
│   ├── grafana/                 # Grafana仪表盘
│   ├── loki/                    # 日志聚合
│   └── tempo/                   # 分布式追踪
│
├── security/                    # 安全配置
│   ├── vault/                   # Vault配置
│   ├── cert-manager/            # 证书管理
│   └── policies/                # OPA策略
│
└── docs/                        # 文档
    ├── architecture.md          # 架构文档
    ├── getting-started.md       # 快速开始
    └── api-documentation.md     # API文档
```

### 核心实现

**1. Backstage配置**

```yaml
# backstage/app-config.yaml
app:
  title: My Developer Platform
  baseUrl: http://localhost:3000

organization:
  name: My Company

backend:
  baseUrl: http://localhost:7000
  listen:
    port: 7000
  csp:
    connect-src: ["'self'", 'http:', 'https:']
  cors:
    origin: http://localhost:3000
    methods: [GET, HEAD, POST]
    credentials: true

integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}

  argocd:
    - name: ArgoCD
      url: ${ARGOCD_URL}
      username: ${ARGOCD_USERNAME}
      password: ${ARGOCD_PASSWORD}
      appSelector:
        - matchExpressions:
            - key: app
              operator: In
              values: ["backstage"]

  kubernetes:
    - name: production
      url: ${K8S_PROD_URL}
      caData: ${K8S_PROD_CA_DATA}
      skipTLSVerify: true
      authProvider: serviceAccount
    - name: staging
      url: ${K8S_STAGING_URL}

  prometheus:
    - name: prometheus
      url: ${PROMETHEUS_URL}
      basicAuth:
        username: ${PROMETHEUS_USERNAME}
        password: ${PROMETHEUS_PASSWORD}

proxy:
  '/argocd':
    target: ${ARGOCD_URL}/api/v1
    changeOrigin: true
    secure: false
    headers:
      Cookie:
        $env: ARGOCD_SESSION_TOKEN

  '/prometheus':
    target: ${PROMETHEUS_URL}
    changeOrigin: true

catalog:
  import:
    entityFilename: catalog-info.yaml
    pullRequestBranchName: backstage-integration
  rules:
    - allow: [Component, System, API, Resource, Location, Template]
  locations:
    # 扫描GitHub上的所有catalog-info.yaml文件
    - type: url
      target: https://github.com/myorg/all-services/blob/master/catalog-info.yaml

    # 本地文件
    - type: file
      target: ./catalog-info.yaml
      rules:
        - allow: [Template]

techdocs:
  builder: 'local'
  generator:
    runIn: 'local'
  publisher:
    type: 'local'

lighthouse:
  storageUrl: gs://my-org-lighthouse-reports
```

**2. 服务目录配置**

```yaml
# backstage/catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: developer-platform
  description: Internal Developer Platform
  tags:
    - platform
    - developer-experience
    - kubernetes
  annotations:
    github.com/project-slug: myorg/developer-platform
    argocd/app-name: developer-platform
spec:
  type: service
  lifecycle: production
  owner: platform-team
  dependsOn:
    - resource:database
    - resource:cache
    - service:auth-service

  # 提供者
  providesApis:
    - platform-api

  # 消费者
  consumesApis:
    - github-api
    - argocd-api
    - prometheus-api
```

**3. 服务模板插件**

```typescript
// backstage/plugins/service-template/src/plugin.ts
import {
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import { techdocsApiRef } from '@backstage/plugin-techdocs';

export const serviceTemplatePlugin = createPlugin({
  id: 'service-template',
  apis: [],
});

export const ServiceTemplatePage = serviceTemplatePlugin.provide(
  createRoutableExtension({
    name: 'ServiceTemplatePage',
    component: () => import('./components/TemplatePage'),
    mountPoint: rootRouteRef,
  }),
);

// 模板配置
export const templates = {
  microservice: {
    title: 'Microservice',
    description: 'Create a new microservice with Kubernetes deployment',
    icon: 'service',
    categories: ['service', 'kubernetes'],
    schema: {
      required: ['name', 'owner'],
      properties: {
        name: {
          type: 'string',
          title: 'Service Name',
          description: 'The name of the service',
        },
        owner: {
          type: 'string',
          title: 'Owner',
          description: 'The team that owns this service',
        },
        language: {
          type: 'string',
          title: 'Programming Language',
          enum: ['python', 'nodejs', 'go', 'java'],
          default: 'python',
        },
        port: {
          type: 'number',
          title: 'Service Port',
          default: 8080,
        },
        replicas: {
          type: 'number',
          title: 'Number of Replicas',
          default: 2,
        },
      },
    },
  },

  serverless: {
    title: 'Serverless Function',
    description: 'Create a new serverless function',
    icon: 'cloud',
    categories: ['serverless', 'function'],
    schema: {
      required: ['name', 'runtime'],
      properties: {
        name: {
          type: 'string',
          title: 'Function Name',
        },
        runtime: {
          type: 'string',
          title: 'Runtime',
          enum: ['python3.11', 'nodejs20', 'go1.21'],
        },
        handler: {
          type: 'string',
          title: 'Handler',
          description: 'Entry point for the function',
        },
        memory: {
          type: 'number',
          title: 'Memory Size (MB)',
          default: 512,
        },
        timeout: {
          type: 'number',
          title: 'Timeout (seconds)',
          default: 30,
        },
      },
    },
  },
};
```

**4. 部署插件（集成ArgoCD）**

```typescript
// backstage/plugins/deployment/src/components/DeploymentPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

export const DeploymentPage = ({ appName }) => {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('argocd');
        const response = await fetchApi(`${baseUrl}/applications/${appName}`);
        const data = await response.json();
        setApp(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [appName]);

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />

  const handleSync = async () => {
    await fetchApi(`${baseUrl}/applications/${appName}/sync`, {
      method: 'POST',
    });
  };

  const handleRollback = async () => {
    await fetchApi(`${baseUrl}/applications/${appName}/rollback`, {
      method: 'POST',
    });
  };

  return (
    <div>
      <h2>{app?.name}</h2>
      <div>Health Status: {app?.status.health}</div>
      <div>Sync Status: {app?.status.sync}</div>

      <Table
        title="Resources"
        columns={[
          { title: 'Name', field: 'name' },
          { title: 'Kind', field: 'kind' },
          { title: 'Namespace', field: 'namespace' },
          { title: 'Status', field: 'status' },
        ]}
        data={app?.status.resources || []}
      />

      <button onClick={handleSync}>Sync</button>
      <button onClick={handleRollback}>Rollback</button>
    </div>
  );
};
```

**5. AI助手插件**

```python
# backstage/plugins/ai-assistant/src/service.py
from langchain.chat_models import ChatOpenAI
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.tools import Tool

class AIAssistantService:
    """AI助手服务"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4-turbo-preview")
        self.tools = self._create_tools()
        self.agent = self._create_agent()

    def _create_tools(self):
        """创建工具集"""
        return [
            Tool(
                name="GetServiceLogs",
                func=self._get_service_logs,
                description="获取服务的日志"
            ),
            Tool(
                name="AnalyzeMetrics",
                func=self._analyze_metrics,
                description="分析服务指标"
            ),
            Tool(
                name="CheckDeploymentStatus",
                func=self._check_deployment_status,
                description="检查部署状态"
            ),
            Tool(
                name="SuggestScaling",
                func=self._suggest_scaling,
                description="建议扩容策略"
            ),
        ]

    def _create_agent(self):
        """创建Agent"""
        prompt = PromptTemplate.from_template("""
        你是一个DevOps助手，帮助开发者解决问题。

        工具：
        {tools}

        使用格式：
        Question: 输入问题
        Thought: 思考应该使用什么工具
        Action: 工具名称
        Action Input: 工具输入
        Observation: 工具输出
        ... (可以重复Thought/Action/Observation)
        Thought: 我现在知道最终答案了
        Final Answer: 最终答案

        开始！

        Question: {input}
        Thought: {agent_scratchpad}
        """)

        return create_openai_functions_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=prompt
        )

    async def ask(self, question: str) -> str:
        """询问AI助手"""
        agent_executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            verbose=True
        )

        result = await agent_executor.ainvoke({"input": question})
        return result["output"]

    async def troubleshoot(self, service_name: str) -> dict:
        """故障排查"""
        prompt = f"""
        帮我排查服务 {service_name} 的问题。

        请检查：
        1. 服务日志
        2. 指标数据
        3. 部署状态
        4. 依赖关系

        然后给出：
        - 问题诊断
        - 可能原因
        - 解决建议
        """

        diagnosis = await self.ask(prompt)

        return {
            "service": service_name,
            "diagnosis": diagnosis,
            "recommendations": await self._generate_recommendations(service_name)
        }
```

**6. Infrastructure as Code（Terraform模块）**

```hcl
# infrastructure/terraform/modules/service/main.tf
resource "kubernetes_deployment" "service" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = var.name
      }
    }

    template {
      metadata {
        labels = {
          app = var.name
        }
      }

      spec {
        container {
          name  = var.name
          image = var.image

          port {
            container_port = var.port
          }

          resources {
            limits = {
              cpu    = var.cpu_limit
              memory = var.memory_limit
            }
            requests = {
              cpu    = var.cpu_request
              memory = var.memory_request
            }
          }

          env_from {
            config_map_ref {
              name = "${var.name}-config"
            }
          }

          env_from {
            secret_ref {
              name = "${var.name}-secret"
            }
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = var.port
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/ready"
              port = var.port
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "service" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    selector = {
      app = var.name
    }

    port {
      port        = var.port
      target_port = var.port
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_horizontal_pod_autoscaler" "hpa" {
  metadata {
    name      = "${var.name}-hpa"
    namespace = var.namespace
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind       = "Deployment"
      name       = var.name
    }

    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }
  }
}

# ServiceMonitor for Prometheus
resource "kubernetes_manifest" "servicemonitor" {
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = var.name
      namespace = var.namespace
      labels = {
        app = var.name
      }
    }
    spec = {
      selector = {
        matchLabels = {
          app = var.name
        }
      }
      endpoints = [{
        port = var.port
        path = "/metrics"
      }]
    }
  }
}
```

### Platform Engineering最佳实践

**1. Golden Path（黄金路径）**

```yaml
# templates/golden-path/template.yaml
apiVersion: backstage.io/v1alpha1
kind: Template
metadata:
  name: golden-path
  title: Golden Path Template
  description: Production-ready service template with best practices

spec:
  type: service
  owner: platform-team
  lifecycle: production

  parameters:
    - title: Service Name
      name: serviceName
      type: string

    - title: Owner
      name: owner
      type: string

    - title: Language
      name: language
      type: enum
      options:
        - python
        - nodejs
        - go

  steps:
    - id: scaffold
      name: Scaffold Project
      action: scaffold:cookiecutter
      input:
        url: ./templates/microservice
        values:
          name: ${{ parameters.serviceName }}
          language: ${{ parameters.language }}

    - id: create-repo
      name: Create Repository
      action: publish:github
      input:
        repoUrl: ${{ steps.scaffold.output.repoUrl }}
        description: 'Service ${{ parameters.serviceName }}'
        topics:
          - service
          - microservice

    - id: deploy
      name: Deploy to Staging
      action: argocd:create
      input:
        appName: ${{ parameters.serviceName }}
        repoUrl: ${{ steps.create-repo.output.repoUrl }}
        namespace: staging

    - id: monitor
      name: Setup Monitoring
      action: prometheus:setup
      input:
        service: ${{ parameters.serviceName }}
        namespace: staging
```

**2. Scorecards（评分卡）**

```yaml
# .github/scorecard.yml
apiVersion: scorecard.dev/v1alpha1
kind: ScorecardConfig

metadata:
  name: My Organization Scorecard

checks:
  - id: deployment-exists
    name: Deployment exists
    description: Check if Kubernetes deployment exists
    type: kubernetes
    resource: deployment
    weight: 10

  - id: service-exists
    name: Service exists
    description: Check if Kubernetes service exists
    type: kubernetes
    resource: service
    weight: 10

  - id: monitoring-enabled
    name: Monitoring enabled
    description: Check if ServiceMonitor exists
    type: kubernetes
    resource: servicemonitor
    weight: 15

  - id: has-docs
    name: Has documentation
    description: Check if README.md exists
    type: file
    pattern: README.md
    weight: 10

  - id: has-tests
    name: Has tests
    description: Check if tests exist
    type: file
    pattern: "**/*test*.py"
    weight: 15

  - id: helm-chart-exists
    name: Helm chart exists
    description: Check if Helm chart exists
    type: file
    pattern: "helm/**/Chart.yaml"
    weight: 10

  - id: security-scan-passed
    name: Security scan passed
    description: Check if Trivy scan passed
    type: security
    scanner: trivy
    weight: 15

  - id: license-compliant
    name: License compliant
    description: Check if license is approved
    type: license
    approved: ["Apache-2.0", "MIT"]
    weight: 5

scorecard:
  passing: 70
```

---

## 实战6：AIOps - AI驱动的自动化运维

### 技术栈（2024-2026主流）

```
🤖 OpenAI GPT-4 / Claude 3.5 Sonnet
📊 Prometheus + Grafana
🔍 Elastic Stack（ELK）
🎯 Opsgenie（告警管理）
🔄 Ansible（自动化）
☸️ Kubernetes
🦙 LangChain
🐍 Python 3.11+
```

### 项目简介

一个AI驱动的智能运维系统，实现故障预测、自动诊断、自愈能力。

**核心功能**：
```
🔮 异常预测：基于历史数据预测潜在故障
🤖 自动诊断：AI分析故障根因
💊 自动自愈：自动执行修复操作
📊 智能告警：减少告警噪音，精准告警
🎯 容量规划：预测资源需求
📈 趋势分析：识别系统趋势
🔍 日志分析：智能日志分析
🚨 事件关联：关联相关事件
```

### 项目架构

```python
# aiops/ai_ops_system.py
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import Tool
from prometheus_api import PrometheusAPI
from elasticsearch_api import ElasticsearchAPI
from kubernetes_api import KubernetesAPI

class AIOpsSystem:
    """AIOps系统"""

    def __init__(self):
        self.prometheus = PrometheusAPI()
        self.elastic = ElasticsearchAPI()
        self.k8s = KubernetesAPI()

        self.llm = ChatOpenAI(model="gpt-4-turbo-preview")
        self.tools = self._create_tools()
        self.agent = self._create_agent()

    def _create_tools(self):
        """创建工具集"""
        return [
            Tool(
                name="GetMetrics",
                func=self._get_metrics,
                description="获取Prometheus指标数据"
            ),
            Tool(
                name="QueryLogs",
                func=self._query_logs,
                description="查询Elasticsearch日志"
            ),
            Tool(
                name="GetPodStatus",
                func=self._get_pod_status,
                description="获取Pod状态"
            ),
            Tool(
                name="ScaleDeployment",
                func=self._scale_deployment,
                description="扩容Deployment"
            ),
            Tool(
                name="RestartPod",
                func=self._restart_pod,
                description="重启Pod"
            ),
            Tool(
                name="AnalyzeAnomaly",
                func=self._analyze_anomaly,
                description="分析异常"
            ),
            Tool(
                name="PredictFailure",
                func=self._predict_failure,
                description="预测故障"
            ),
        ]

    async def _get_metrics(self, query: str, time_range: str = "1h") -> dict:
        """获取指标"""
        result = await self.prometheus.query(query, time_range)
        return result

    async def _query_logs(self, query: str, time_range: str = "1h") -> list:
        """查询日志"""
        result = await self.elastic.search(query, time_range)
        return result

    async def _get_pod_status(self, namespace: str, pod: str) -> dict:
        """获取Pod状态"""
        status = await self.k8s.get_pod_status(namespace, pod)
        return status

    async def _scale_deployment(self, namespace: str, deployment: str, replicas: int):
        """扩容Deployment"""
        await self.k8s.scale_deployment(namespace, deployment, replicas)

    async def _restart_pod(self, namespace: str, pod: str):
        """重启Pod"""
        await self.k8s.delete_pod(namespace, pod)

    async def _analyze_anomaly(self, service: str) -> dict:
        """分析异常"""
        # 获取指标
        cpu_usage = await self._get_metrics(f'rate(container_cpu_usage_seconds_total{{service="{service}"}}[5m])')
        memory_usage = await self._get_metrics(f'container_memory_usage_bytes{{service="{service}"}}')
        error_rate = await self._get_metrics(f'rate(http_requests_total{{service="{service}",status=~"5.."}}[5m])')

        # 查询日志
        logs = await self._query_logs(f'service:"{service}" AND (level:"ERROR" OR level:"WARN")')

        # AI分析
        analysis_prompt = f"""
        分析以下服务的异常情况：

        CPU使用率：{cpu_usage}
        内存使用率：{memory_usage}
        错误率：{error_rate}
        错误日志：{logs[:10]}

        请分析：
        1. 异常类型
        2. 可能原因
        3. 影响范围
        4. 建议措施
        """

        analysis = await self.llm.ainvoke(analysis_prompt)

        return {
            "service": service,
            "analysis": analysis.content,
            "metrics": {
                "cpu": cpu_usage,
                "memory": memory_usage,
                "error_rate": error_rate,
            },
            "logs": logs[:10],
        }

    async def _predict_failure(self, service: str, hours: int = 24) -> dict:
        """预测故障"""
        # 获取历史数据
        historical_data = await self._get_metrics(
            f'rate(container_cpu_usage_seconds_total{{service="{service}"}}[5m])',
            f"{hours}h"
        )

        # 使用AI模型预测
        prediction_prompt = f"""
        基于以下历史数据预测未来1小时的故障概率：

        历史数据：{historical_data}

        请预测：
        1. 故障概率（0-100%）
        2. 预计故障时间
        3. 可能的故障类型
        4. 预防措施
        """

        prediction = await self.llm.ainvoke(prediction_prompt)

        return {
            "service": service,
            "prediction": prediction.content,
            "historical_data": historical_data,
        }

    async def auto_heal(self, service: str, issue: dict) -> dict:
        """自动修复"""
        # 分析问题
        analysis = await self._analyze_anomaly(service)

        # 决策修复策略
        decision_prompt = f"""
        基于以下分析，决定修复策略：

        问题分析：{analysis}

        可用操作：
        1. 扩容Deployment
        2. 重启Pod
        3. 回滚版本
        4. 修改配置
        5. 人工介入

        请决定：
        1. 最佳修复策略
        2. 具体操作步骤
        3. 预期效果
        """

        decision = await self.llm.ainvoke(decision_prompt)

        # 执行修复
        if "扩容" in decision.content:
            await self._scale_deployment(
                service.split(":")[0],
                service.split(":")[1],
                replicas=analysis.get("suggested_replicas", 3)
            )
        elif "重启" in decision.content:
            await self._restart_pod(
                service.split(":")[0],
                service.split(":")[1]
            )

        return {
            "service": service,
            "issue": issue,
            "decision": decision.content,
            "action_taken": "executed",
        }

    async def intelligent_alerting(self, alert: dict) -> bool:
        """智能告警：减少告警噪音"""
        # 获取历史告警
        historical_alerts = await self._query_similar_alerts(alert)

        # AI判断是否需要告警
        alerting_prompt = f"""
        判断以下告警是否需要通知运维人员：

        当前告警：{alert}
        历史相似告警：{historical_alerts}

        判断标准：
        1. 是否为新问题
        2. 影响程度
        3. 是否已自动处理
        4. 是否需要人工介入

        返回：true/false 及原因
        """

        decision = await self.llm.ainvoke(alerting_prompt)

        return "true" in decision.content.lower()

    async def capacity_planning(self, service: str, days: int = 30) -> dict:
        """容量规划"""
        # 获取历史数据
        cpu_data = await self._get_metrics(
            f'avg(rate(container_cpu_usage_seconds_total{{service="{service}"}}[5m]))',
            f"{days}d"
        )
        memory_data = await self._get_metrics(
            f'avg(container_memory_usage_bytes{{service="{service}"}})',
            f"{days}d"
        )
        request_data = await self._get_metrics(
            f'rate(http_requests_total{{service="{service}"}}[5m])',
            f"{days}d"
        )

        # AI预测
        planning_prompt = f"""
        基于以下数据制定容量规划：

        CPU使用趋势：{cpu_data}
        内存使用趋势：{memory_data}
        请求量趋势：{request_data}

        请预测未来7天并建议：
        1. 推荐实例数量
        2. CPU/内存配置
        3. 扩容时间点
        4. 成本预估
        """

        plan = await self.llm.ainvoke(planning_prompt)

        return {
            "service": service,
            "plan": plan.content,
            "current_usage": {
                "cpu": cpu_data,
                "memory": memory_data,
                "requests": request_data,
            },
        }
```

### 实际应用场景

**场景1：自动故障诊断和修复**

```python
# aiops/scenarios/auto_healing.py
async def auto_healing_scenario():
    """自动故障诊断和修复场景"""
    aiops = AIOpsSystem()

    # 1. 监控发现异常
    alert = {
        "service": "user-service",
        "namespace": "production",
        "type": "high_error_rate",
        "value": 0.15,  # 15%错误率
        "threshold": 0.05  # 阈值5%
    }

    # 2. 智能告警判断
    should_alert = await aiops.intelligent_alerting(alert)
    if not should_alert:
        print("告警被过滤，无需人工介入")
        return

    # 3. 自动诊断
    diagnosis = await aiops._analyze_anomaly(alert["service"])
    print(f"诊断结果：{diagnosis}")

    # 4. 尝试自动修复
    if diagnosis["severity"] == "high":
        healing_result = await aiops.auto_heal(alert["service"], diagnosis)
        print(f"修复结果：{healing_result}")

        # 5. 验证修复效果
        await asyncio.sleep(30)  # 等待30秒
        verification = await aiops._analyze_anomaly(alert["service"])
        if verification["status"] == "healthy":
            print("自动修复成功！")
        else:
            print("自动修复失败，需要人工介入")
            # 创建人工工单
            await create_incident(alert, diagnosis, healing_result)
```

**场景2：预测性维护**

```python
# aiops/scenarios/predictive_maintenance.py
async def predictive_maintenance_scenario():
    """预测性维护场景"""
    aiops = AIOpsSystem()

    services = ["user-service", "product-service", "order-service"]

    for service in services:
        # 预测故障
        prediction = await aiops._predict_failure(service, hours=24)

        if prediction["probability"] > 0.7:
            print(f"⚠️ {service} 故障概率：{prediction['probability']}%")
            print(f"预计时间：{prediction['estimated_time']}")
            print(f"建议措施：{prediction['recommendations']}")

            # 提前采取措施
            await aiops.auto_heal(service, prediction)
```

---

## 学习建议

### 推荐学习顺序

```
第1阶段：基础巩固（已完成的4个实战）
├─ 实战1：微服务架构完整部署
├─ 实战2：多环境管理实战
├─ 实战3：云平台完整部署
└─ 实战4：灾难恢复与高可用

第2阶段：Platform Engineering（3-4周）
├─ 搭建Backstage IDP
├─ 配置ArgoCD GitOps
├─ 创建服务模板
└─ 实现自助服务平台

第3阶段：AIOps（2-3周）
├─ 集成Prometheus监控
├─ 实现AI故障诊断
├─ 开发自愈能力
└─ 智能告警和容量规划
```

### 2024-2026 DevOps技术要点

根据[最新DevOps趋势](https://www.n-ix.com/devops-trends/)：

- ✅ **Platform Engineering**：从DevOps进化而来
- ✅ **Internal Developer Platforms**：提升开发者体验
- ✅ **Golden Paths**：标准化最佳实践
- ✅ **AIOps**：AI驱动的自动化运维
- ✅ **GitOps**：基础设施即代码的标准实践
- ✅ **DevSecOps**：安全左移
- ✅ **Service Mesh**：微服务通信管理
- ✅ **Observability**：可观测性三大支柱（Metrics、Logs、Traces）

---

## 参考资源

### 官方文档
- [Backstage](https://backstage.io/docs)
- [Argo CD](https://argoproj.github.io/argo-cd/)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)
- [Kubernetes](https://kubernetes.io/docs/)

### 技术趋势报告
- [DevOps Trends 2026](https://devops.com/top-15-devops-trends-to-watch-in-2026/)
- [Platform Engineering 2026](https://medium.com/@orlando1409/beyond-kubernetes-platform-engineering-trends-for-2026-8f82e09e27e0)
- [AIOps Guide](https://www.xmatters.com/blog/the-future-of-ops/)

---

**最后更新**：2025年2月
**版本**：v3.0（2024-2026技术栈）
**作者**：小徐
**邮箱**：esimonx@163.com