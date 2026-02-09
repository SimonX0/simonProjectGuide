# 实战项目2：Platform Engineering - 企业级内部开发者平台

> **项目难度**：⭐⭐⭐⭐⭐
> **预计时间**：80-100小时
> **技术栈**：Backstage | Argo CD | Kubernetes | Terraform | Helm | React | TypeScript

## 项目概述

构建一个企业级内部开发者平台（IDP），基于Spotify开源的Backstage框架，集成服务目录、应用部署、监控告警、文档管理等功能，提供统一的自助服务平台，提升开发者体验。

### 核心功能

```
🎯 服务目录：自动发现和注册所有微服务
🚀 一键部署：通过Golden Path模板快速创建和部署服务
📊 可观测性：统一的监控、日志、追踪仪表盘
🔐 权限管理：基于角色的访问控制（RBAC）
📚 文档管理：自动生成和更新技术文档
🔄 自助服务：开发者自助管理资源和权限
🎨 插件系统：可扩展的插件架构
🤖 AI助手：智能建议和故障排查
```

### 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                   Backstage Frontend                     │
│              (React + TypeScript)                       │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  Backstage Backend                       │
│              (Node.js + Express)                        │
├─────────────────────────────────────────────────────────┤
│  插件系统                                                │
│  ├── Service Catalog    ├── Tech Docs                   │
│  ├── Argo CD Integration ├── Kubernetes                 │
│  ├── Prometheus         ├── GitHub/GitLab               │
│  ├── CI/CD              ├── Cost Insights               │
│  └── AI Assistant                                      │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼───────┐ ┌────▼─────┐ ┌──────▼────────┐
│  Argo CD      │ │ K8s API  │ │  Prometheus   │
│  (GitOps)     │ │          │ │  (Monitoring) │
└───────────────┘ └──────────┘ └───────────────┘
```

---

## 项目架构设计

### 1. 项目结构

```bash
internal-developer-platform/
├── backstage/                      # Backstage应用
│   ├── app/                        # 应用配置
│   │   ├── project.ts             # 项目配置
│   │   ├── plugins.ts             # 插件注册
│   │   └── config.ts              # 环境配置
│   │
│   ├── plugins/                     # 自定义插件
│   │   ├── service-template/      # 服务模板插件
│   │   ├── deployment/            # 部署插件
│   │   ├── monitoring/            # 监控插件
│   │   ├── cost-insights/         # 成本分析插件
│   │   └── ai-assistant/          # AI助手插件
│   │
│   ├── templates/                   # 服务模板
│   │   ├── microservice/          # 微服务模板
│   │   ├── serverless/            # Serverless模板
│   │   ├── ml-pipeline/           # ML流水线模板
│   │   └── data-pipeline/         # 数据管道模板
│   │
│   ├── catalog-info.yaml          # 服务目录配置
│   └── Dockerfile
│
├── infrastructure/                 # 基础设施
│   ├── terraform/                 # Terraform配置
│   │   ├── modules/               # 可复用模块
│   │   │   ├── eks/              # EKS集群
│   │   │   ├── rds/              # 数据库
│   │   │   └── vpc/              # 网络
│   │   ├── environments/          # 环境配置
│   │   └── examples/              # 使用示例
│   │
│   ├── kubernetes/                # K8s配置
│   │   ├── base/                  # 基础配置
│   │   ├── overlays/              # 环境覆盖
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── prod/
│   │   └── helm-charts/           # Helm charts
│   │
│   └── ansible/                   # Ansible playbooks
│       ├── playbooks/
│       └── roles/
│
├── pipelines/                      # CI/CD流水线
│   ├── jenkins/                   # Jenkins流水线
│   ├── github-actions/            # GitHub Actions
│   └── gitlab-ci/                 # GitLab CI
│
├── monitoring/                     # 监控系统
│   ├── prometheus/                # Prometheus配置
│   ├── grafana/                   # Grafana仪表盘
│   ├── loki/                      # 日志聚合
│   └── tempo/                     # 分布式追踪
│
├── security/                       # 安全配置
│   ├── vault/                     # Vault配置
│   ├── cert-manager/              # 证书管理
│   └── policies/                  # OPA策略
│
└── docs/                           # 文档
    ├── architecture.md            # 架构文档
    ├── getting-started.md         # 快速开始
    ├── api-documentation.md       # API文档
    └── user-guide.md              # 用户手册
```

### 2. 技术选型

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| **IDP框架** | Backstage | Spotify开源IDP框架 |
| **前端** | React + TypeScript | 现代化前端框架 |
| **后端** | Node.js + Express | Backend服务 |
| **数据库** | PostgreSQL | 主数据库 |
| **缓存** | Redis | 缓存层 |
| **GitOps** | Argo CD | 持续部署 |
| **容器编排** | Kubernetes | 容器编排 |
| **监控** | Prometheus + Grafana | 监控告警 |
| **日志** | Loki | 日志聚合 |
| **追踪** | Jaeger | 分布式追踪 |
| **密钥管理** | Vault | 密钥管理 |
| **基础设施** | Terraform | IaC |
| **CI/CD** | GitHub Actions | 持续集成 |

---

## 核心功能实现

### 1. Backstage应用配置

**应用配置文件**

```yaml
# backstage/app-config.yaml
app:
  title: Internal Developer Platform
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
    methods: [GET, HEAD, POST, PUT, DELETE, PATCH]
    credentials: true

integrations:
  # GitHub集成
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}

  # Argo CD集成
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

  # Kubernetes集成
  kubernetes:
    - name: production
      url: ${K8S_PROD_URL}
      caData: ${K8S_PROD_CA_DATA}
      skipTLSVerify: true
      authProvider: serviceAccount
    - name: staging
      url: ${K8S_STAGING_URL}

  # Prometheus集成
  prometheus:
    - name: prometheus
      url: ${PROMETHEUS_URL}
      basicAuth:
        username: ${PROMETHEUS_USERNAME}
        password: ${PROMETHEUS_PASSWORD}

# 代理配置
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

  '/kubernetes':
    target: ${K8S_API_URL}
    changeOrigin: true

# 服务目录配置
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

# Tech Docs配置
techdocs:
  builder: 'local'
  generator:
    runIn: 'local'
  publisher:
    type: 'local'

# Lighthouse配置
lighthouse:
  storageUrl: gs://my-org-lighthouse-reports

# OAuth配置
auth:
  environment: development
  providers:
    github:
      development:
        clientId: ${GITHUB_CLIENT_ID}
        clientSecret: ${GITHUB_CLIENT_SECRET}
```

**项目配置**

```typescript
// backstage/app/project.ts
import { UserConfig } from '@backstage/config';

export const config: UserConfig = {
  // ... (从app-config.yaml读取的配置会合并到这里)
};
```

### 2. 服务目录配置

**Backstage服务目录**

```yaml
# backstage/catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: internal-developer-platform
  description: Internal Developer Platform (IDP)
  tags:
    - platform
    - developer-experience
    - kubernetes
    - backstage
  annotations:
    github.com/project-slug: myorg/internal-developer-platform
    argocd/app-name: idp
    prometheus.io/port: '7000'
    prometheus.io/scrape: 'true'
spec:
  type: service
  lifecycle: production
  owner: platform-team
  system: developer-platform

  dependsOn:
    - resource:database
    - resource:cache
    - service:auth-service

  providesApis:
    - platform-api
    - catalog-api

  consumesApis:
    - github-api
    - argocd-api
    - prometheus-api
    - kubernetes-api
```

**示例：微服务注册**

```yaml
# microservice/catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: user-service
  description: User management service
  tags:
    - microservice
    - python
    - fastapi
  annotations:
    github.com/project-slug: myorg/user-service
    argocd/app-name: user-service
    prometheus.io/port: '5001'
    prometheus.io/scrape: 'true'
spec:
  type: service
  lifecycle: production
  owner: backend-team
  system: ecommerce-system

  dependsOn:
    - resource:postgres
    - resource:redis
    - service:auth-service

  providesApis:
    - user-api

  consumesApis:
    - auth-api
```

### 3. 服务模板插件

**模板插件实现**

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
        description: {
          type: 'string',
          title: 'Description',
          description: 'A brief description of the service',
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
        database: {
          type: 'string',
          title: 'Database',
          enum: ['PostgreSQL', 'MySQL', 'MongoDB', 'None'],
          default: 'PostgreSQL',
        },
        cache: {
          type: 'boolean',
          title: 'Enable Redis Cache',
          default: true,
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

  mlPipeline: {
    title: 'ML Pipeline',
    description: 'Create a new machine learning pipeline',
    icon: 'brain',
    categories: ['ml', 'pipeline'],
    schema: {
      required: ['name', 'framework'],
      properties: {
        name: {
          type: 'string',
          title: 'Pipeline Name',
        },
        framework: {
          type: 'string',
          title: 'ML Framework',
          enum: ['TensorFlow', 'PyTorch', 'Scikit-learn'],
        },
        gpu: {
          type: 'boolean',
          title: 'Enable GPU',
          default: false,
        },
      },
    },
  },
};
```

**模板页面组件**

```typescript
// backstage/plugins/service-template/src/components/TemplatePage.tsx
import React, { useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';

export const TemplatePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [formData, setFormData] = useState({});

  const scmIntegrationsApi = useApi(scmIntegrationsApiRef);

  const steps = ['Select Template', 'Configure Service', 'Review', 'Create'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    // 1. 使用模板创建项目
    // 2. 创建GitHub仓库
    // 3. 配置CI/CD
    // 4. 部署到Kubernetes
    console.log('Creating service with config:', formData);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div>
            <h2>Select a Template</h2>
            {Object.entries(templates).map(([key, template]) => (
              <div
                key={key}
                onClick={() => setSelectedTemplate(key)}
                style={{
                  border: selectedTemplate === key ? '2px solid blue' : '1px solid gray',
                  padding: '20px',
                  margin: '10px',
                  cursor: 'pointer',
                }}
              >
                <h3>{template.title}</h3>
                <p>{template.description}</p>
              </div>
            ))}
          </div>
        );

      case 1:
        if (!selectedTemplate) return null;
        const template = templates[selectedTemplate as keyof typeof templates];

        return (
          <div>
            <h2>Configure Your {template.title}</h2>
            <form>
              {Object.entries(template.schema.properties).map(([key, prop]: [string, any]) => (
                <div key={key}>
                  {prop.enum ? (
                    <FormControl fullWidth>
                      <InputLabel>{prop.title}</InputLabel>
                      <Select
                        value={formData[key] || prop.default || ''}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      >
                        {prop.enum.map((value: string) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : prop.type === 'boolean' ? (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData[key] || false}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                        />
                      }
                      label={prop.title}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label={prop.title}
                      type={prop.type === 'number' ? 'number' : 'text'}
                      value={formData[key] || prop.default || ''}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      style={{ marginBottom: '20px' }}
                    />
                  )}
                </div>
              ))}
            </form>
          </div>
        );

      case 2:
        return (
          <div>
            <h2>Review Configuration</h2>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>
        );

      case 3:
        return (
          <div>
            <h2>Creating Service...</h2>
            <p>This may take a few minutes.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: { optional?: React.ReactNode } = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <div style={{ marginTop: '20px' }}>
        {renderStepContent(activeStep)}

        <div style={{ marginTop: '20px' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={!selectedTemplate && activeStep === 0}
          >
            {activeStep === steps.length - 1 ? 'Create' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};
```

### 4. 部署插件（Argo CD集成）

**部署页面组件**

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
  if (error) return <ResponseErrorPanel error={error} />;

  const handleSync = async () => {
    await fetchApi(`${baseUrl}/applications/${appName}/sync`, {
      method: 'POST',
    });
    // 刷新应用状态
    fetchApp();
  };

  const handleRollback = async () => {
    await fetchApi(`${baseUrl}/applications/${appName}/rollback`, {
      method: 'POST',
    });
    fetchApp();
  };

  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'Kind', field: 'kind' },
    { title: 'Namespace', field: 'namespace' },
    { title: 'Status', field: 'status' },
    { title: 'Health', field: 'health' },
  ];

  return (
    <div>
      <h2>{app?.name}</h2>

      <div style={{ marginBottom: '20px' }}>
        <div>Sync Status: <strong>{app?.status.sync?.status}</strong></div>
        <div>Health Status: <strong>{app?.status.health?.status}</strong></div>
        <div>Revision: <strong>{app?.status.sync?.revision}</strong></div>
        <div>Updated At: <strong>{new Date(app?.status.operationState?.startedAt).toLocaleString()}</strong></div>
      </div>

      <h3>Resources</h3>
      <Table
        columns={columns}
        data={app?.status.resources || []}
      />

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSync} disabled={app?.status.sync?.status === 'Synced'}>
          Sync
        </button>
        <button onClick={handleRollback}>
          Rollback
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Sync History</h3>
        <Table
          columns={[
            { title: 'Revision', field: 'revision' },
            { title: 'Status', field: 'status' },
            { title: 'Started At', field: 'startedAt' },
            { title: 'Finished At', field: 'finishedAt' },
          ]}
          data={app?.status.history || []}
        />
      </div>
    </div>
  );
};
```

### 5. Golden Path模板

**生产就绪的服务模板**

```yaml
# backstage/templates/golden-path/template.yaml
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
    - title: Service Information
      required: ['serviceName', 'owner']
      properties:
        serviceName:
          title: Service Name
          type: string
          description: Unique name of the service
          ui:autofocus: true
        owner:
          title: Owner
          type: string
          description: Team or individual responsible for the service
          ui:field: OwnerPicker
        description:
          title: Description
          type: string
          description: Help others understand what this service is for

    - title: Choose a Location
      required: ['repoUrl']
      properties:
        repoUrl:
          title: Repository Location
          type: string
          ui:field: RepoUrlPicker
          ui:options:
            allowedHosts:
              - github.com

    - title: Technology Stack
      required: ['language', 'framework']
      properties:
        language:
          title: Language
          type: string
          enum: ['Python', 'Node.js', 'Go', 'Java']
          default: Python
        framework:
          title: Framework
          type: string
          enum: ['FastAPI', 'Flask', 'Express', 'Gin', 'Spring Boot']
          default: FastAPI
        database:
          title: Database
          type: string
          enum: ['PostgreSQL', 'MySQL', 'MongoDB', 'None']
          default: PostgreSQL
        cache:
          title: Cache
          type: string
          enum: ['Redis', 'Memcached', 'None']
          default: Redis

    - title: Deployment Configuration
      properties:
        replicas:
          title: Number of Replicas
          type: number
          default: 2
        port:
          title: Service Port
          type: number
          default: 8080
        cpu:
          title: CPU Request (m)
          type: number
          default: 100
        memory:
          title: Memory Request (Mi)
          type: number
          default: 128

  steps:
    - id: scaffold
      name: Scaffold Project
      action: scaffold:cookiecutter
      input:
        url: ./templates/microservice
        values:
          name: ${{ parameters.serviceName }}
          description: ${{ parameters.description }}
          language: ${{ parameters.language }}
          framework: ${{ parameters.framework }}
          database: ${{ parameters.database }}
          cache: ${{ parameters.cache }}

    - id: create-repo
      name: Create Repository
      action: publish:github
      input:
        repoUrl: ${{ parameters.repoUrl }}
        description: 'Service ${{ parameters.serviceName }}'
        topics:
          - service
          - microservice
          - backstage

    - id: register-catalog
      name: Register in Catalog
      action: catalog:register
      input:
        repoContentsUrl: ${{ steps['create-repo'].output.repoContentsUrl }}
        catalogInfoPath: '/catalog-info.yaml'

    - id: deploy
      name: Deploy to Staging
      action: argocd:create
      input:
        appName: ${{ parameters.serviceName }}
        repoUrl: ${{ steps['create-repo'].output.repoUrl }}
        namespace: staging

    - id: monitor
      name: Setup Monitoring
      action: prometheus:setup
      input:
        service: ${{ parameters.serviceName }}
        namespace: staging

  output:
    links:
      - title: Repository
        url: ${{ steps['create-repo'].output.remoteUrl }}
      - title: Open in catalog
        icon: catalog
        entityRef: ${{ steps['register-catalog'].output.entityRef }}
```

### 6. Scorecards（评分卡）

**服务评分配置**

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

## 部署指南

### 1. 使用Terraform部署基础设施

```bash
# 初始化Terraform
cd infrastructure/terraform
terraform init

# 规划资源
terraform plan \
  -var="environment=prod" \
  -var="project_name=idp"

# 应用配置
terraform apply \
  -var="environment=prod" \
  -var="project_name=idp"
```

### 2. 部署Backstage到Kubernetes

**Helm Values配置**

```yaml
# backstage/helm/values.yaml
replicaCount: 2

image:
  repository: myorg/backstage
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: LoadBalancer
  port: 80
  targetPort: 3000

env:
  - name: GITHUB_TOKEN
    valueFrom:
      secretKeyRef:
        name: github-secrets
        key: token
  - name: ARGOCD_URL
    value: https://argocd.example.com
  - name: PROMETHEUS_URL
    value: http://prometheus.monitoring.svc.cluster.local:9090

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80
```

**部署Backstage**

```bash
# 添加Backstage Helm仓库
helm repo add backstage https://backstage.io/charts
helm repo update

# 部署Backstage
helm install backstage ./helm-charts/backstage \
  --namespace backstage \
  --create-namespace \
  --values backstage/helm/values.yaml
```

### 3. 配置GitOps

**创建Argo CD Application**

```bash
kubectl apply -f infrastructure/argocd/applications/
```

---

## 学习成果

完成本项目后，你将掌握：

✅ **Platform Engineering**
- 内部开发者平台架构设计
- Golden Path最佳实践
- 开发者体验优化

✅ **Backstage框架**
- 插件开发
- 模板系统
- 服务目录管理

✅ **GitOps实践**
- Argo CD集成
- 持续部署自动化
- 多环境管理

✅ **企业级功能**
- RBAC权限控制
- 多租户隔离
- Scorecard评分

✅ **可扩展架构**
- 插件系统设计
- API集成
- 微服务治理

---

## 扩展练习

- [ ] 实现成本分析插件
- [ ] 集成Jenkins CI/CD
- [ ] 添加AI助手功能
- [ ] 实现渐进式交付
- [ ] 添加服务网格集成

---

**项目难度**：⭐⭐⭐⭐⭐
**预计时间**：80-100小时
**适合人群**：有Kubernetes和DevOps基础，想深入学习Platform Engineering
