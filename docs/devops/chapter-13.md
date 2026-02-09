# Terraform 基础设施即代码

## 什么是基础设施即代码 (IaC)

基础设施即代码（Infrastructure as Code，IaC）是用代码来管理和配置基础设施的方法，而不是手动配置。

### IaC 的优势

- **可重复性**：相同代码产生相同结果
- **版本控制**：基础设施变更可追踪
- **自动化**：减少手动操作错误
- **快速部署**：分钟级完成环境搭建
- **一致性**：开发、测试、生产环境一致

### IaC 工具对比

| 工具 | 类型 | 语言 | 特点 |
|------|------|------|------|
| **Terraform** | 声明式 | HCL | 多云、生态丰富 |
| **Pulumi** | 声明式 | Python/TS/Go | 真实编程语言 |
| **AWS CloudFormation** | 声明式 | YAML/JSON | AWS专属 |
| **Ansible** | 命令式 | YAML | 配置管理 |

## Terraform 简介

### 什么是 Terraform

Terraform 是 HashiCorp 开源的**多云基础设施自动化工具**，采用声明式配置。

### 核心特性

- **多云支持**：AWS、Azure、GCP、阿里云等
- **声明式语言**：描述期望状态，而非如何实现
- **状态管理**：跟踪基础设施状态
- **依赖图**：自动处理资源依赖关系
- **执行计划**：预览变更影响

## 安装 Terraform

### Windows 安装

```powershell
# 使用 Chocolatey
choco install terraform

# 或手动下载
# 1. 访问 https://www.terraform.io/downloads.html
# 2. 下载 Windows zip 包
# 3. 解压到 PATH 目录
```

### Linux 安装

```bash
# Ubuntu/Debian
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# 验证安装
terraform version
```

### macOS 安装

```bash
# 使用 Homebrew
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# 验证
terraform version
```

## Terraform 基础

### 配置文件结构

```
project/
├── main.tf           # 主配置文件
├── variables.tf      # 变量定义
├── outputs.tf        # 输出定义
├── terraform.tfvars  # 变量值文件
└── provider.tf       # Provider配置
```

### 基本语法

**main.tf**：
```hcl
# Provider 配置
provider "aws" {
  region = "us-east-1"
}

# 资源定义
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer"
    Env  = "Production"
  }
}
```

### 变量 (Variables)

**variables.tf**：
```hcl
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "ports" {
  description = "List of ports to open"
  type        = list(number)
  default     = [80, 443, 22]
}
```

**terraform.tfvars**：
```hcl
instance_type = "t3.micro"
environment  = "production"
ports         = [80, 443]
```

**使用变量**：
```hcl
resource "aws_instance" "web" {
  instance_type = var.instance_type

  tags = {
    Name = "Web-${var.environment}"
  }
}
```

### 输出 (Outputs)

**outputs.tf**：
```hcl
output "instance_public_ip" {
  description = "Public IP of the instance"
  value       = aws_instance.web.public_ip
}

output "instance_id" {
  description = "ID of the instance"
  value       = aws_instance.web.id
}
```

## Terraform 命令

### 基本工作流

```bash
# 1. 初始化工作目录
terraform init

# 2. 格式化代码
terraform fmt

# 3. 验证配置
terraform validate

# 4. 查看执行计划
terraform plan

# 5. 应用配置
terraform apply

# 6. 查看状态
terraform show

# 7. 销毁资源
terraform destroy
```

### 常用命令

```bash
# 自动确认应用
terraform apply -auto-approve

# 指定变量文件
terraform apply -var-file="production.tfvars"

# 设置单个变量
terraform apply -var="instance_type=t3.large"

# 查看特定资源
terraform show aws_instance.web

# 刷新状态文件
terraform refresh

# 导入现有资源
terraform import aws_instance.web i-1234567890abcdef0
```

## 实战案例

### 案例1：创建 AWS 基础设施

**main.tf**：
```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# 子网
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.region}a"

  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}

# 路由表
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# 安全组
resource "aws_security_group" "web" {
  name_prefix = "web-"
  description = "Allow web traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-web-sg"
  }
}

# EC2 实例
resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = var.key_name

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y httpd
              systemctl start httpd
              systemctl enable httpd
              echo "<h1>Hello from Terraform!</h1>" > /var/www/html/index.html
              EOF

  tags = {
    Name  = "${var.project_name}-web-${var.environment}"
    Env   = var.environment
  }
}

# 获取最新 Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}
```

**variables.tf**：
```hcl
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "demo"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "AWS key pair name"
  type        = string
}
```

**outputs.tf**：
```hcl
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_ip" {
  description = "Web server public IP"
  value       = aws_instance.web.public_ip
}

output "web_url" {
  description = "Web server URL"
  value       = "http://${aws_instance.web.public_ip}"
}
```

### 案例2：创建 Azure 资源

**main.tf**：
```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# 资源组
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-rg"
  location = var.location

  tags = {
    Environment = var.environment
  }
}

# 虚拟网络
resource "azurerm_virtual_network" "main" {
  name                = "${var.project_name}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

# 子网
resource "azurerm_subnet" "internal" {
  name                 = "internal-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
}

# 公共IP
resource "azurerm_public_ip" "web" {
  name                = "${var.project_name}-pip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

# 网络安全组
resource "azurerm_network_security_group" "web" {
  name                = "${var.project_name}-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  security_rule {
    name                       = "HTTP"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "SSH"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# 网络接口
resource "azurerm_network_interface" "web" {
  name                = "${var.project_name}-nic"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.internal.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.web.id
  }
}

# Linux 虚拟机
resource "azurerm_linux_virtual_machine" "web" {
  name                = "${var.project_name}-vm"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  size                = "Standard_DS1_v2"
  admin_username      = "adminuser"
  network_interface_ids = [
    azurerm_network_interface.web.id,
  ]

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("~/.ssh/id_rsa.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  custom_data = base64encode <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y nginx
              systemctl start nginx
              echo "<h1>Hello from Terraform on Azure!</h1>" > /var/www/html/index.html
              EOF
}
```

### 案例3：创建 Kubernetes 资源

**main.tf**：
```hcl
terraform {
  required_providers {
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

# Namespace
resource "kubernetes_namespace" "app" {
  metadata {
    name = var.namespace
  }
}

# Deployment
resource "kubernetes_deployment" "app" {
  metadata {
    name      = var.app_name
    namespace = kubernetes_namespace.app.metadata[0].name
    labels = {
      app = var.app_name
    }
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = var.app_name
      }
    }

    template {
      metadata {
        labels = {
          app = var.app_name
        }
      }

      spec {
        container {
          name  = "app"
          image = "${var.container_image}:${var.image_tag}"

          port {
            container_port = var.container_port
          }

          resources {
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
            requests = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = var.container_port
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/ready"
              port = var.container_port
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }
      }
    }
  }
}

# Service
resource "kubernetes_service" "app" {
  metadata {
    name      = var.app_name
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    selector = {
      app = var.app_name
    }

    port {
      protocol    = "TCP"
      port        = 80
      target_port = var.container_port
    }

    type = "LoadBalancer"
  }
}

# HorizontalPodAutoscaler
resource "kubernetes_horizontal_pod_autoscaler" "app" {
  metadata {
    name      = "${var.app_name}-hpa"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = var.app_name
    }

    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 80
        }
      }
    }
  }
}

# Helm Release - Nginx Ingress
resource "helm_release" "nginx_ingress" {
  name       = "nginx-ingress"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = "ingress-nginx"

  create_namespace = true

  set {
    name  = "controller.replicaCount"
    value = "2"
  }

  set {
    name  = "controller.service.type"
    value = "LoadBalancer"
  }
}
```

## 高级特性

### 模块 (Modules)

模块是可复用的 Terraform 配置单元。

**模块结构**：
```
modules/
└── vpc/
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

**使用模块**：
```hcl
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr = "10.0.0.0/16"
  region   = "us-east-1"
}
```

### 条件表达式

```hcl
resource "aws_instance" "web" {
  instance_type = var.environment == "prod" ? "t3.large" : "t3.micro"

  # 条件创建资源
  count = var.create_instance ? 1 : 0
}
```

### 循环 (for_each / count)

**count**：
```hcl
resource "aws_instance" "web" {
  count         = 3
  ami           = var.ami_id
  instance_type = "t2.micro"

  tags = {
    Name = "Web-${count.index}"
  }
}
```

**for_each**：
```hcl
resource "aws_instance" "web" {
  for_each = {
    "web-1" = "t2.micro"
    "web-2" = "t2.small"
    "web-3" = "t2.medium"
  }

  ami           = var.ami_id
  instance_type = each.value

  tags = {
    Name = each.key
  }
}
```

### 动态块

```hcl
resource "aws_security_group_rule" "ingress" {
  dynamic "ingress" {
    for_each = var.ingress_ports
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
}
```

### 依赖关系

```hcl
# 隐式依赖（自动推断）
resource "aws_eip" "web" {
  instance = aws_instance.web.id
}

# 显式依赖
resource "aws_instance" "web" {
  depends_on = [aws_security_group.web]

  # ...
}
```

## 状态管理

### 状态文件

```bash
# 查看状态
terraform show

# 查看特定资源
terraform show aws_instance.web

# 刷新状态
terraform refresh
```

### 远程状态

**backend.tf**：
```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

### 状态锁定

```bash
# 使用 DynamoDB 锁定状态
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

## 最佳实践

### 目录结构

```
project/
├── environments/
│   ├── dev/
│   │   └── terraform.tfvars
│   ├── staging/
│   │   └── terraform.tfvars
│   └── prod/
│       └── terraform.tfvars
├── modules/
│   ├── vpc/
│   ├── ec2/
│   └── rds/
├── main.tf
├── variables.tf
├── outputs.tf
└── README.md
```

### 命名规范

- 资源名称：小写+下划线
- 变量名称：描述性
- 标签：统一格式
- 文件名：功能划分

### 版本控制

```gitignore
# .gitignore
.terraform/
*.tfstate
*.tfstate.*
.terraform.lock.hcl
terraform.tfvars
*.auto.tfvars
```

### 安全实践

1. **敏感数据加密**
   - 使用 AWS Secrets Manager
   - 使用 SSM Parameter Store
   - 使用 Vault

2. **最小权限原则**
   - IAM 角色限制
   - 网络隔离

3. **变更管理**
   - Code Review
   - 执行计划审查
   - 分阶段部署

---

## 平台工程 (Platform Engineering 2024-2026)

### 什么是平台工程

**平台工程**是DevOps的演进，通过构建**内部开发者平台(IDP)**来减少开发者的认知负载，提高交付效率。

**传统DevOps vs 平台工程**：

```
传统DevOps：
  ❌ 开发者需要了解所有基础设施细节
  ❌ 每个团队重复搭建相似环境
  ❌ 知识分散，文档不统一
  ❌ 认知负载高，容易出错

平台工程：
  ✅ 提供自助服务平台
  ✅ 标准化基础设施和工具
  ✅ 减少开发者认知负载
  ✅ 提高交付速度和质量
```

**IDP(Internal Developer Platform)核心能力**：

```
┌─────────────────────────────────────────┐
│        内部开发者平台 (IDP)              │
├─────────────────────────────────────────┤
│                                         │
│  自助服务层                              │
│  ├── 创建环境                            │
│  ├── 部署应用                            │
│  ├── 查看日志                            │
│  └── 监控告警                            │
│                                         │
│  抽象层                                  │
│  ├── 标准化模板                          │
│  ├── Golden Path                        │
│  └── 最佳实践封装                        │
│                                         │
│  基础设施层                              │
│  ├── Kubernetes                         │
│  ├── 云服务 (AWS/Azure/GCP)             │
│  └── 中间件 (数据库/缓存/队列)           │
│                                         │
└─────────────────────────────────────────┘
```

### Backstage - Spotify开源IDP框架

**安装Backstage**：

```bash
# 1. 创建Backstage应用
npx @backstage/create-app@latest

# 2. 启动开发环境
cd my-backstage-app
yarn install
yarn dev

# 访问: http://localhost:3000
```

**Backstage核心配置**：

```yaml
# app-config.yaml
# 组织信息
organization:
  name: MyCompany

# 基础配置
app:
  title: My Developer Portal
  baseUrl: http://localhost:3000

# 后端配置
backend:
  baseUrl: http://localhost:7000
  listen:
    port: 7000
  csp:
    connect-src: ["'self'", "http:", "https:"]
  # 数据库配置
  database:
    client: better-sqlite3
    connection: ":memory:"

# 技术集成
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}

# 代理配置
proxy:
  '/github/api':
    target: https://api.github.com
    changeOrigin: true

# 目录服务配置
catalog:
  rules:
    - allow: [Component, System, API, Resource, Domain]
  providers:
    # GitHub组织发现
    github:
      your-org/github:
        organization: your-org
        catalogPath: '/catalog-info.yaml'
  locations:
    # 手动注册实体
    - type: file
      target: ../../examples/entities.yaml

# 技术栈
techdocs:
  builder: 'local'
  generator:
    runIn: 'docker'
  publisher:
    type: 'local'

# Kubernetes集成
kubernetes:
  serviceLocatorMethod:
    type: 'multiTenant'
  clusterLocatorMethods:
    - type: 'config'
      clusters:
        - name: minikube
          url: https://kubernetes.default.svc
          authProvider: 'serviceAccount'
          skipTLSVerify: true
```

**Backstage实体定义**：

```yaml
# catalog-info.yaml - 组件定义
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: payment-service
  description: 支付服务微服务
  tags:
    - microservice
    - payment
    - golang
  links:
    - url: https://github.com/my-org/payment-service
      title: GitHub Repository
      icon: github
    - url: https://payment-service.dev.example.com
      title: Website
      icon: dashboard
  annotations:
    github.com/project-slug: my-org/payment-service
    backstage.io/techdocs-ref: dir:.
spec:
  type: service
  lifecycle: production
  owner: team-platform
  dependsOn:
    - resource:database-payment
    - resource:cache-redis

---
# API定义
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: payment-api
  description: 支付API接口
  tags:
    - rest
    - api
spec:
  type: openapi
  lifecycle: production
  owner: team-platform
  definition:
    $text: https://github.com/my-org/payment-service/blob/main/api/openapi.yaml

---
# 系统定义
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: payment-system
  description: 支付系统
spec:
  owner: team-platform
  domain: payments

---
# 资源定义
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: database-payment
  description: 支付数据库
spec:
  type: database
  owner: team-platform
  dependsOn:
    - resource:cloud-postgres
```

**Backstage模板 (软件模板)**：

```yaml
# templates/spring-boot-template/template.yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: spring-boot-service
  title: Spring Boot Service Template
  description: 创建Spring Boot微服务
  tags:
    - java
    - spring-boot
    - microservice
spec:
  owner: team-platform
  type: service

  # 参数定义
  parameters:
    - title: 基本信息
      required:
        - component_id
        - description
      properties:
        component_id:
          title: 名称
          type: string
          description: 服务的唯一名称
          pattern: ^[a-z0-9]+(-[a-z0-9]+)*$
        description:
          title: 描述
          type: string
          description: 服务描述

    - title: 选项
      properties:
        port:
          title: 端口
          type: number
          default: 8080
        java_version:
          title: Java版本
          type: string
          enum: ["11", "17", "21"]
          default: "17"

  # 执行步骤
  steps:
    # 1. 获取模板
    - id: fetch-base
      name: 获取Spring Boot模板
      action: fetch:template
      input:
        url: ./template
        values:
          component_id: ${{ parameters.component_id }}
          description: ${{ parameters.description }}
          port: ${{ parameters.port }}
          java_version: ${{ parameters.java_version }}

    # 2. 发布到GitHub
    - id: publish-github
      name: 创建GitHub仓库
      action: publish:github
      input:
        allowedHosts: ['github.com']
        description: ${{ parameters.description }}
        repoUrl: ${{ steps.fetch-base.output.repoUrl }}

    # 3. 注册到目录
    - id: register-catalog
      name: 注册到目录服务
      action: catalog:register
      input:
        repoContentsUrl: ${{ steps.publish-github.output.repoContentsUrl }}
        catalogInfoPath: '/catalog-info.yaml'

  # 输出
  output:
    links:
      - title: 仓库
        url: ${{ steps.publish-github.output.remoteUrl }}
      - title: 打开目录
        icon: catalog
        url: ${{ steps['register-catalog'].output.entityPageUrl }}
```

**Backstage插件**：

```typescript
// plugins/finance-dashboard/plugin.ts
import {
  createPlugin,
  createRouteRef,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

// 创建路由引用
export const financeDashboardPlugin = createPlugin({
  id: 'finance-dashboard',
  routes: {
    root: createRouteRef({
      path: '/finance-dashboard',
      title: 'Finance Dashboard',
    }),
  },
});

// 导出路由组件
export const FinanceDashboardPage = financeDashboardPlugin.provide(
  createRoutableExtension({
    name: 'FinanceDashboardPage',
    component: () =>
      import('./components/FinanceDashboardPage').then(m => m.default),
    mountPoint: financeDashboardPlugin.routes.root,
  }),
);

---
<!-- plugins/finance-dashboard/components/FinanceDashboardPage.tsx -->
import React from 'react';
import {
  InfoCard,
  InfoCardVariants,
} from '@backstage/core-components';
import { Grid } from '@material-ui/core';

export const FinanceDashboardPage = () => {
  return (
    <Grid container spacing={3} style={{ padding: '20px' }}>
      <Grid item xs={12}>
        <InfoCard title="成本概览" variant={InfoCardVariants.default}>
          <div>
            <h3>本月成本: $12,345</h3>
            <p>较上月: +15%</p>
          </div>
        </InfoCard>
      </Grid>

      <Grid item xs={6}>
        <InfoCard title="资源使用率">
          <div>
            <h4>CPU: 65%</h4>
            <h4>内存: 78%</h4>
          </div>
        </InfoCard>
      </Grid>

      <Grid item xs={6}>
        <InfoCard title="服务健康">
          <div>
            <h4>健康: 95%</h4>
            <h4>警告: 3</h4>
            <h4>错误: 1</h4>
          </div>
        </InfoCard>
      </Grid>
    </Grid>
  );
};
```

### Humanitec - 云原生IDP平台

**Humanitec核心概念**：

```yaml
# Score文件 - 通用工作负载定义
apiVersion: score.dev/v1b1
metadata:
  name: payment-service
containers:
  payment:
    image: payment-service:v1.0.0
    variables:
      DATABASE_URL: ${resources.db.connection}
      REDIS_HOST: ${resources.cache.host}
resources:
  db:
    type: postgres
  cache:
    type: redis
```

**Humanitec部署**：

```bash
# 1. 安装Humanitec CLI
npm install -g @humanitec/cli

# 2. 登录
humanitec login

# 3. 部署应用
humanitec score deploy \
  --file score.yaml \
  --app payment-service \
  --env production
```

### 平台工程最佳实践

**1. Golden Path (黄金路径)**：

```yaml
# 为开发者预设的最佳实践路径
# 避免选择困难，提供标准化方案

Golden Path示例:
  开发流程:
    1. 使用标准模板创建服务
    2. 推送代码触发CI/CD
    3. 自动部署到开发环境
    4. 自动测试和安全扫描
    5. 一键提升到生产环境

  包含的最佳实践:
    ✅ 代码质量检查(SonarQube)
    ✅ 安全扫描(Trivy)
    ✅ 单元测试覆盖率>80%
    ✅ 自动化部署
    ✅ 监控和日志集成
    ✅ 文档自动生成
```

**2. 渐进式采用**：

```yaml
阶段1 - 基础设施 (0-3个月):
  目标: 统一基础设施
  行动:
    - 部署Kubernetes集群
    - 配置CI/CD流水线
    - 建立监控告警

阶段2 - 平台基础 (3-6个月):
  目标: 提供自助服务
  行动:
    - 部署Backstage
    - 创建服务模板
    - 集成开发工具

阶段3 - 成熟平台 (6-12个月):
  目标: 优化开发者体验
  行动:
    - Golden Path推广
    - 自动化程度提升
    - 性能和成本优化

阶段4 - 平台演进 (12个月+):
  目标: 持续创新
  行动:
    - AI辅助开发
    - 混合云支持
    - FinOps集成
```

**3. 度量指标**：

```yaml
平台工程关键指标:

开发者效率:
  - 部署频率: 每周 > 10次
  - 部署成功率: > 95%
  - 变更前置时间: < 1小时
  - 平均恢复时间(MTTR): < 15分钟

平台采用:
  - 活跃用户数
  - 模板使用率
  - 自助服务完成率
  - 开发者满意度(NPS)

成本优化:
  - 资源利用率
  - 云成本趋势
  - 浪费资源减少
```

---

### 实践建议

1. **从简单开始**：先掌握基本语法
2. **本地测试**：使用 LocalStack
3. **模块化思维**：创建可复用模块
4. **版本控制**：所有配置 Git 管理
5. **文档记录**：记录每个模块用途

### 练习任务

- [ ] 创建 AWS VPC 和 EC2 实例
- [ ] 使用变量和环境配置
- [ ] 创建可复用模块
- [ ] 配置远程状态存储
- [ ] 实现多环境部署

## 总结

Terraform 是基础设施即代码的事实标准，通过本章学习，你应该掌握了：

- Terraform 核心概念
- 基本语法和配置
- 多云资源创建
- 状态管理
- 模块化设计

继续实践 Terraform，你将能够高效地管理任何云基础设施！
