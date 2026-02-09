# 实战项目3：AIOps - AI驱动的智能运维系统

> **项目难度**：⭐⭐⭐⭐⭐
> **预计时间**：80-100小时
> **技术栈**：Python | OpenAI GPT-4 | Prometheus | Elasticsearch | Kubernetes | LangChain | FastAPI

## 项目概述

构建一个AI驱动的智能运维系统（AIOps），利用机器学习和自然语言处理技术，实现故障预测、自动诊断、自愈能力，大幅降低运维成本，提高系统稳定性。

### 核心功能

```
🔮 异常预测：基于历史数据预测潜在故障
🤖 自动诊断：AI分析故障根因（RCA）
💊 自动自愈：自动执行修复操作
📊 智能告警：减少告警噪音，精准告警
🎯 容量规划：AI预测资源需求
📈 趋势分析：识别系统趋势和异常
🔍 日志分析：智能日志分析和异常检测
🚨 事件关联：自动关联相关事件
```

### 技术架构

```
┌─────────────────────────────────────────────────────┐
│                  AIOps Platform                     │
│              (FastAPI + Python)                     │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐ │
│  │         AI/ML Engine (LangChain)              │ │
│  │  ├── Anomaly Detection (Isolation Forest)    │ │
│  │  ├── Predictive Analytics (LSTM)             │ │
│  │  ├── NLP Analysis (OpenAI GPT-4)             │ │
│  │  └── Auto-Healing Agent                      │ │
│  └───────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐ │
│  │            Data Pipeline                      │ │
│  │  ├── Metrics (Prometheus)                    │ │
│  │  ├── Logs (Elasticsearch)                    │ │
│  │  ├── Traces (Jaeger)                         │ │
│  │  └── Events (Kafka)                          │ │
│  └───────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼───────┐ ┌────▼─────┐ ┌──────▼────────┐
│  Kubernetes   │ │Prometheus│ │ Elasticsearch  │
│  (Workloads)  │ │(Metrics) │ │   (Logs)       │
└───────────────┘ └──────────┘ └────────────────┘
```

---

## 项目架构设计

### 1. 项目结构

```bash
aiops-platform/
├── backend/                         # Python后端
│   ├── app/                         # FastAPI应用
│   │   ├── api/                     # API层
│   │   │   ├── alerts.py           # 告警接口
│   │   │   ├── incidents.py        # 事件接口
│   │   │   ├── predictions.py      # 预测接口
│   │   │   └── diagnosis.py        # 诊断接口
│   │   │
│   │   ├── core/                    # 核心配置
│   │   │   ├── config.py           # 配置管理
│   │   │   └── security.py         # 安全配置
│   │   │
│   │   ├── models/                  # 数据模型
│   │   │   ├── alert.py
│   │   │   ├── incident.py
│   │   │   └── prediction.py
│   │   │
│   │   ├── services/                # 业务逻辑
│   │   │   ├── ai_service.py       # AI服务
│   │   │   ├── alert_service.py    # 告警服务
│   │   │   ├── anomaly_service.py  # 异常检测
│   │   │   ├── prediction_service.py # 预测服务
│   │   │   └── healing_service.py  # 自愈服务
│   │   │
│   │   └── ml/                      # 机器学习
│   │       ├── anomaly_detection.py # 异常检测
│   │       ├── prediction.py        # 时间序列预测
│   │       ├── classification.py    # 分类模型
│   │       └── training.py          # 模型训练
│   │
│   ├── agents/                      # AI Agents
│   │   ├── troubleshooter.py       # 故障排查Agent
│   │   ├── optimizer.py            # 优化Agent
│   │   └── reporter.py             # 报告生成Agent
│   │
│   ├── integrations/                # 集成
│   │   ├── prometheus.py           # Prometheus集成
│   │   ├── elasticsearch.py        # ES集成
│   │   ├── kubernetes.py           # K8s集成
│   │   └── opsgenie.py             # Opsgenie集成
│   │
│   ├── tests/                       # 测试
│   └── requirements.txt
│
├── frontend/                        # Vue3前端
│   ├── src/
│   │   ├── views/
│   │   │   ├── Dashboard.vue       # 仪表盘
│   │   │   ├── Alerts.vue          # 告警列表
│   │   │   ├── Incidents.vue       # 事件管理
│   │   │   ├── Predictions.vue     # 预测分析
│   │   │   └── Diagnosis.vue       # AI诊断
│   │   ├── components/
│   │   └── api/
│   └── package.json
│
├── infrastructure/                  # 基础设施
│   ├── terraform/                  # IaC
│   ├── kubernetes/                 # K8s配置
│   └── docker/
│
├── ml/                             # ML模型
│   ├── models/                     # 训练好的模型
│   ├── data/                       # 训练数据
│   └── notebooks/                  # Jupyter notebooks
│
├── scripts/                        # 脚本
│   ├── train_models.py            # 模型训练
│   └── evaluate.py                # 模型评估
│
└── docs/                           # 文档
    ├── architecture.md
    ├── api.md
    └── user_guide.md
```

### 2. 技术选型

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| **后端框架** | FastAPI | 高性能Python框架 |
| **AI引擎** | LangChain + GPT-4 | LLM框架 |
| **机器学习** | scikit-learn, PyTorch | ML/DL框架 |
| **异常检测** | Isolation Forest | 无监督学习 |
| **时间序列** | Prophet, LSTM | 预测模型 |
| **监控** | Prometheus | 指标采集 |
| **日志** | Elasticsearch | 日志存储 |
| **容器** | Kubernetes | 容器编排 |
| **消息队列** | Kafka | 事件流 |
| **数据库** | PostgreSQL + TimescaleDB | 时序数据库 |

---

## 核心功能实现

### 1. AI服务核心

```python
# backend/app/services/ai_service.py
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import Tool
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from typing import List, Dict, Any
import asyncio

class AIService:
    """AI服务：核心AI能力"""

    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0
        )
        self.tools = self._create_tools()
        self.agent = self._create_agent()

    def _create_tools(self) -> List[Tool]:
        """创建AI工具集"""
        return [
            Tool(
                name="GetMetrics",
                func=self._get_metrics,
                description="获取Prometheus指标数据，格式：query, time_range"
            ),
            Tool(
                name="QueryLogs",
                func=self._query_logs,
                description="查询Elasticsearch日志，格式：query, time_range"
            ),
            Tool(
                name="GetPodStatus",
                func=self._get_pod_status,
                description="获取Kubernetes Pod状态，格式：namespace, pod_name"
            ),
            Tool(
                name="ScaleDeployment",
                func=self._scale_deployment,
                description="扩容Deployment，格式：namespace, deployment, replicas"
            ),
            Tool(
                name="RestartPod",
                func=self._restart_pod,
                description="重启Pod，格式：namespace, pod_name"
            ),
            Tool(
                name="AnalyzeAnomaly",
                func=self._analyze_anomaly,
                description="分析异常指标，格式：service_name"
            ),
            Tool(
                name="GetEvents",
                func=self._get_events,
                description="获取Kubernetes事件，格式：namespace"
            ),
        ]

    def _create_agent(self):
        """创建AI Agent"""
        prompt = PromptTemplate.from_template("""
        你是一个专业的DevOps运维助手，帮助开发者诊断和解决系统问题。

        你可以使用以下工具：
        {tools}

        工具使用格式：
        Question: 输入问题
        Thought: 思考应该使用什么工具
        Action: 工具名称
        Action Input: 工具输入参数
        Observation: 工具执行结果
        ... (可以重复Thought/Action/Observation)
        Thought: 我现在知道最终答案了
        Final Answer: 总结你的分析和建议

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
            verbose=True,
            max_iterations=10
        )

        try:
            result = await agent_executor.ainvoke({"input": question})
            return result["output"]
        except Exception as e:
            return f"抱歉，我遇到了一些问题：{str(e)}"

    async def troubleshoot(self, service_name: str) -> Dict[str, Any]:
        """故障排查"""
        prompt = f"""
        请帮我排查服务 {service_name} 的当前问题。

        请按以下步骤进行分析：
        1. 检查服务日志中的错误信息
        2. 查看关键指标（CPU、内存、错误率）
        3. 检查Kubernetes资源状态
        4. 分析相关事件

        然后提供：
        - 问题诊断
        - 可能的根本原因
        - 建议的解决方案
        - 预防措施
        """

        diagnosis = await self.ask(prompt)

        return {
            "service": service_name,
            "diagnosis": diagnosis,
            "timestamp": datetime.utcnow().isoformat()
        }

    # 工具实现
    async def _get_metrics(self, args: str) -> str:
        """获取指标"""
        from app.integrations.prometheus import prometheus_client

        try:
            query, time_range = args.split(", ")
            result = prometheus_client.query(query, time_range)
            return f"指标查询结果：{result}"
        except Exception as e:
            return f"获取指标失败：{str(e)}"

    async def _query_logs(self, args: str) -> str:
        """查询日志"""
        from app.integrations.elasticsearch import es_client

        try:
            query, time_range = args.split(", ")
            result = es_client.search(query, time_range)
            return f"日志查询结果：{result}"
        except Exception as e:
            return f"查询日志失败：{str(e)}"

    async def _get_pod_status(self, args: str) -> str:
        """获取Pod状态"""
        from app.integrations.kubernetes import k8s_client

        try:
            namespace, pod_name = args.split(", ")
            status = k8s_client.get_pod_status(namespace, pod_name)
            return f"Pod状态：{status}"
        except Exception as e:
            return f"获取Pod状态失败：{str(e)}"

    async def _scale_deployment(self, args: str) -> str:
        """扩容Deployment"""
        from app.integrations.kubernetes import k8s_client

        try:
            namespace, deployment, replicas = args.split(", ")
            k8s_client.scale_deployment(namespace, deployment, int(replicas))
            return f"已扩容 {deployment} 到 {replicas} 个副本"
        except Exception as e:
            return f"扩容失败：{str(e)}"

    async def _restart_pod(self, args: str) -> str:
        """重启Pod"""
        from app.integrations.kubernetes import k8s_client

        try:
            namespace, pod_name = args.split(", ")
            k8s_client.delete_pod(namespace, pod_name)
            return f"已重启Pod {pod_name}"
        except Exception as e:
            return f"重启Pod失败：{str(e)}"

    async def _analyze_anomaly(self, args: str) -> str:
        """分析异常"""
        from app.services.anomaly_service import anomaly_service

        try:
            result = await anomaly_service.detect_anomaly(args)
            return f"异常分析结果：{result}"
        except Exception as e:
            return f"异常分析失败：{str(e)}"

    async def _get_events(self, args: str) -> str:
        """获取Kubernetes事件"""
        from app.integrations.kubernetes import k8s_client

        try:
            events = k8s_client.get_events(args)
            return f"Kubernetes事件：{events}"
        except Exception as e:
            return f"获取事件失败：{str(e)}"
```

### 2. 异常检测服务

```python
# backend/app/services/anomaly_service.py
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

class AnomalyDetectionService:
    """异常检测服务"""

    def __init__(self):
        self.scaler = StandardScaler()
        self.models = {}  # 每个服务一个模型
        self.threshold = -0.5  # 异常阈值

    def train_model(self, service_name: str, metrics: np.ndarray):
        """训练异常检测模型"""
        # 标准化数据
        scaled_metrics = self.scaler.fit_transform(metrics)

        # 训练Isolation Forest
        model = IsolationForest(
            contamination=0.1,  # 异常比例
            random_state=42
        )
        model.fit(scaled_metrics)

        # 保存模型
        self.models[service_name] = model

    def detect_anomaly(self, service_name: str, current_metrics: Dict[str, float]) -> Dict[str, Any]:
        """实时异常检测"""
        if service_name not in self.models:
            return {
                "service": service_name,
                "status": "no_model",
                "message": "No trained model for this service"
            }

        model = self.models[service_name]

        # 提取特征
        features = np.array([[
            current_metrics.get('cpu_usage', 0),
            current_metrics.get('memory_usage', 0),
            current_metrics.get('error_rate', 0),
            current_metrics.get('latency_p95', 0),
            current_metrics.get('request_rate', 0),
        ]])

        # 标准化
        scaled_features = self.scaler.transform(features)

        # 预测
        prediction = model.predict(scaled_features)[0]
        score = model.score_samples(scaled_features)[0]

        is_anomaly = prediction == -1 or score < self.threshold

        return {
            "service": service_name,
            "status": "anomaly" if is_anomaly else "normal",
            "anomaly_score": float(score),
            "metrics": current_metrics,
            "timestamp": datetime.utcnow().isoformat(),
            "severity": self._calculate_severity(score)
        }

    def _calculate_severity(self, score: float) -> str:
        """计算异常严重程度"""
        if score < -0.8:
            return "critical"
        elif score < -0.6:
            return "high"
        elif score < -0.4:
            return "medium"
        else:
            return "low"

    async def batch_detect(self, services: List[str]) -> List[Dict[str, Any]]:
        """批量检测多个服务"""
        from app.integrations.prometheus import prometheus_client

        results = []

        for service in services:
            # 获取当前指标
            metrics = await prometheus_client.get_current_metrics(service)

            # 检测异常
            result = self.detect_anomaly(service, metrics)
            results.append(result)

        return results
```

### 3. 预测服务

```python
# backend/app/services/prediction_service.py
from prophet import Prophet
import pandas as pd
from typing import Dict, Any, List
from datetime import datetime, timedelta

class PredictionService:
    """预测服务"""

    def __init__(self):
        self.models = {}

    def train_prediction_model(self, service_name: str, historical_data: pd.DataFrame):
        """训练预测模型"""
        # Prophet要求数据格式：ds (datetime), y (value)
        df = historical_data.rename(columns={'timestamp': 'ds', 'value': 'y'})

        # 创建Prophet模型
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=True,
            interval_width=0.95  # 预测区间
        )

        # 训练
        model.fit(df)

        # 保存模型
        self.models[service_name] = model

    async def predict_capacity(self, service_name: str, hours: int = 24) -> Dict[str, Any]:
        """预测容量需求"""
        if service_name not in self.models:
            return {"error": "No trained model"}

        model = self.models[service_name]

        # 创建未来时间点
        future = model.make_future_dataframe(periods=hours, freq='H')

        # 预测
        forecast = model.predict(future)

        # 提取预测结果
        predictions = forecast.tail(hours)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]

        # 计算推荐配置
        peak_demand = predictions['yhat'].max()
        avg_demand = predictions['yhat'].mean()

        return {
            "service": service_name,
            "predictions": predictions.to_dict('records'),
            "recommendations": {
                "peak_cpu": float(peak_demand),
                "avg_cpu": float(avg_demand),
                "recommended_replicas": self._calculate_replicas(peak_demand),
                "scale_up_threshold": float(peak_demand * 0.8),
            },
            "forecast_horizon": f"{hours} hours",
            "generated_at": datetime.utcnow().isoformat()
        }

    def _calculate_replicas(self, cpu_demand: float) -> int:
        """根据CPU需求计算副本数"""
        # 假设每个副本能处理50% CPU
        single_pod_capacity = 50
        replicas = int(np.ceil(cpu_demand / single_pod_capacity))
        return max(2, min(10, replicas))  # 最少2个，最多10个

    async def predict_failure(self, service_name: str, hours: int = 24) -> Dict[str, Any]:
        """预测故障概率"""
        from app.services.anomaly_service import anomaly_service

        # 获取历史异常分数
        historical_anomalies = await self._get_historical_anomalies(service_name, days=30)

        # 计算趋势
        if len(historical_anomalies) == 0:
            return {"probability": 0, "confidence": "low"}

        recent_anomalies = historical_anomalies[-7:]  # 最近7天
        anomaly_rate = len([a for a in recent_anomalies if a['is_anomaly']]) / len(recent_anomalies)

        # 基于异常率预测故障概率
        failure_probability = min(anomaly_rate * 2, 1.0)  # 最高100%

        return {
            "service": service_name,
            "failure_probability": failure_probability,
            "confidence": "high" if len(historical_anomalies) >= 30 else "medium",
            "risk_factors": await self._identify_risk_factors(service_name),
            "preventive_actions": await self._suggest_preventive_actions(service_name),
        }

    async def _get_historical_anomalies(self, service_name: str, days: int) -> List[Dict]:
        """获取历史异常数据"""
        # 从数据库或时序数据库获取
        pass

    async def _identify_risk_factors(self, service_name: str) -> List[str]:
        """识别风险因素"""
        # 使用AI分析风险因素
        pass

    async def _suggest_preventive_actions(self, service_name: str) -> List[str]:
        """建议预防措施"""
        # 使用AI生成建议
        pass
```

### 4. 自愈服务

```python
# backend/app/services/healing_service.py
from typing import Dict, Any, List
from datetime import datetime
import asyncio

class AutoHealingService:
    """自动自愈服务"""

    def __init__(self):
        self.healing_strategies = {
            "high_cpu": self._heal_high_cpu,
            "high_memory": self._heal_high_memory,
            "pod_crash_loop": self._heal_crash_loop,
            "high_error_rate": self._heal_high_error_rate,
        }

    async def analyze_and_heal(self, service: str, issue: Dict[str, Any]) -> Dict[str, Any]:
        """分析并尝试自动修复问题"""
        # 1. 分析问题类型
        issue_type = issue.get('type')
        severity = issue.get('severity', 'medium')

        # 2. 检查是否有自愈策略
        if issue_type not in self.healing_strategies:
            return {
                "action": "manual_intervention",
                "reason": "No auto-healing strategy for this issue type"
            }

        # 3. 执行自愈策略
        if severity in ['low', 'medium']:
            # 低严重度问题可以自动修复
            strategy = self.healing_strategies[issue_type]
            result = await strategy(service, issue)
            return result
        else:
            # 高严重度问题需要人工确认
            return {
                "action": "awaiting_approval",
                "reason": "High severity issue requires manual approval",
                "suggested_action": self.healing_strategies[issue_type].__name__
            }

    async def _heal_high_cpu(self, service: str, issue: Dict) -> Dict[str, Any]:
        """修复高CPU使用率"""
        from app.integrations.kubernetes import k8s_client

        try:
            # 获取当前副本数
            current_replicas = k8s_client.get_replicas(service)

            # 扩容
            new_replicas = min(current_replicas + 2, 10)
            k8s_client.scale_deployment(service, service, new_replicas)

            return {
                "action": "scaled",
                "details": f"Scaled {service} from {current_replicas} to {new_replicas} replicas",
                "status": "success"
            }
        except Exception as e:
            return {
                "action": "failed",
                "error": str(e),
                "status": "failed"
            }

    async def _heal_high_memory(self, service: str, issue: Dict) -> Dict[str, Any]:
        """修复高内存使用率"""
        # 重启Pod以释放内存
        from app.integrations.kubernetes import k8s_client

        try:
            pods = k8s_client.list_pods(service)
            for pod in pods[:1]:  # 重启一个Pod
                k8s_client.delete_pod(service, pod)

            return {
                "action": "restarted_pod",
                "details": f"Restarted pod {pods[0]}",
                "status": "success"
            }
        except Exception as e:
            return {
                "action": "failed",
                "error": str(e),
                "status": "failed"
            }

    async def _heal_crash_loop(self, service: str, issue: Dict) -> Dict[str, Any]:
        """修复Pod崩溃循环"""
        # 崩溃循环通常需要人工介入
        return {
            "action": "manual_intervention",
            "reason": "CrashLoopBackOff usually requires investigation",
            "suggestions": [
                "Check application logs",
                "Verify configuration",
                "Check dependencies",
                "Consider rolling back"
            ]
        }

    async def _heal_high_error_rate(self, service: str, issue: Dict) -> Dict[str, Any]:
        """修复高错误率"""
        # 使用AI分析错误原因并建议修复方案
        from app.services.ai_service import ai_service

        try:
            diagnosis = await ai_service.troubleshoot(service)

            return {
                "action": "ai_diagnosis",
                "diagnosis": diagnosis,
                "status": "analyzed"
            }
        except Exception as e:
            return {
                "action": "failed",
                "error": str(e),
                "status": "failed"
            }
```

### 5. 智能告警服务

```python
# backend/app/services/alert_service.py
from typing import Dict, Any, List
from datetime import datetime, timedelta

class IntelligentAlertingService:
    """智能告警服务"""

    def __init__(self):
        self.alert_history = {}  # 告警历史
        self.similarity_threshold = 0.8  # 相似度阈值

    async def should_alert(self, alert: Dict[str, Any]) -> tuple[bool, str]:
        """判断是否应该发送告警（减少告警噪音）"""

        # 1. 检查是否为重复告警
        if self._is_duplicate(alert):
            return False, "Duplicate alert filtered"

        # 2. 检查是否为已知问题
        if self._is_known_issue(alert):
            return False, "Known issue, already tracked"

        # 3. 使用AI判断告警重要性
        importance = await self._evaluate_importance(alert)

        if importance < 0.5:
            return False, f"Low importance score: {importance:.2f}"

        # 4. 检查是否可以自动修复
        can_auto_heal = await self._can_auto_heal(alert)
        if can_auto_heal:
            return False, "Issue can be auto-healed"

        return True, "Alert sent"

    def _is_duplicate(self, alert: Dict) -> bool:
        """检查是否为重复告警"""
        key = f"{alert['service']}_{alert['type']}"

        if key not in self.alert_history:
            return False

        # 检查时间窗口内是否有相同告警
        last_alert = self.alert_history[key]
        time_diff = datetime.utcnow() - last_alert['timestamp']

        return time_diff < timedelta(minutes=10)

    def _is_known_issue(self, alert: Dict) -> bool:
        """检查是否为已知问题"""
        # 从数据库查询是否有相同的未解决事件
        pass

    async def _evaluate_importance(self, alert: Dict) -> float:
        """评估告警重要性（使用AI）"""
        from app.services.ai_service import ai_service

        prompt = f"""
        评估以下告警的重要性（0-1之间的分数）：

        告警信息：
        - 服务：{alert['service']}
        - 类型：{alert['type']}
        - 严重度：{alert.get('severity', 'unknown')}
        - 描述：{alert.get('message', '')}

        请考虑：
        1. 影响范围
        2. 业务影响
        3. 紧急程度

        只返回0-1之间的数字，不要其他内容。
        """

        try:
            response = await ai_service.ask(prompt)
            score = float(response.strip())
            return max(0, min(1, score))  # 确保在0-1之间
        except:
            return 0.5  # 默认中等重要性

    async def _can_auto_heal(self, alert: Dict) -> bool:
        """检查是否可以自动修复"""
        # 检查是否有对应的自愈策略
        pass
```

### 6. API接口

```python
# backend/app/api/predictions.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.services.prediction_service import PredictionService
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/v1/predictions", tags=["predictions"])

prediction_service = PredictionService()
ai_service = AIService()

@router.post("/{service_name}/capacity")
async def predict_capacity(service_name: str, hours: int = 24):
    """预测容量需求"""
    result = await prediction_service.predict_capacity(service_name, hours)
    return result

@router.post("/{service_name}/failure")
async def predict_failure(service_name: str, hours: int = 24):
    """预测故障概率"""
    result = await prediction_service.predict_failure(service_name, hours)
    return result

@router.post("/analyze")
async def analyze_system(services: List[str]):
    """分析整个系统"""
    from app.services.anomaly_service import anomaly_service

    anomalies = await anomaly_service.batch_detect(services)
    return {
        "services_analyzed": len(services),
        "anomalies_detected": len([a for a in anomalies if a['status'] == 'anomaly']),
        "details": anomalies
    }
```

---

## 实际应用场景

### 场景1：自动故障诊断和修复

```python
# examples/auto_healing_scenario.py
from app.services.ai_service import AIService
from app.services.healing_service import AutoHealingService
import asyncio

async def auto_healing_scenario():
    """自动故障诊断和修复场景"""
    ai_service = AIService()
    healing_service = AutoHealingService()

    # 1. 监控发现异常
    alert = {
        "service": "user-service",
        "namespace": "production",
        "type": "high_error_rate",
        "value": 0.15,  # 15%错误率
        "threshold": 0.05,
        "severity": "high"
    }

    print(f"⚠️  检测到异常：{alert}")

    # 2. 智能告警判断
    from app.services.alert_service import IntelligentAlertingService
    alert_service = IntelligentAlertingService()

    should_send, reason = await alert_service.should_alert(alert)
    print(f"📊 告警决策：{should_send}, 原因：{reason}")

    if not should_send:
        print("告警被过滤，无需人工介入")
        return

    # 3. AI自动诊断
    print("\n🔍 开始AI诊断...")
    diagnosis = await ai_service.troubleshoot(alert["service"])
    print(f"诊断结果：\n{diagnosis['diagnosis']}")

    # 4. 尝试自动修复
    if alert["severity"] == "high":
        print("\n💊 尝试自动修复...")
        healing_result = await healing_service.analyze_and_heal(
            alert["service"],
            alert
        )
        print(f"修复结果：{healing_result}")

        # 5. 验证修复效果
        if healing_result.get("status") == "success":
            print("\n✅ 等待30秒后验证修复效果...")
            await asyncio.sleep(30)

            # 重新检查
            from app.services.anomaly_service import AnomalyDetectionService
            anomaly_service = AnomalyDetectionService()

            current_metrics = {
                "cpu_usage": 45,
                "memory_usage": 60,
                "error_rate": 0.02,
                "latency_p95": 150,
                "request_rate": 500
            }

            check = anomaly_service.detect_anomaly(
                alert["service"],
                current_metrics
            )

            if check["status"] == "normal":
                print("✅ 自动修复成功！")
            else:
                print("❌ 自动修复失败，需要人工介入")
                # 创建人工工单
                print("🎫 创建人工工单...")
        else:
            print("❌ 无法自动修复，需要人工介入")
    else:
        print("ℹ️  问题不严重，持续监控中")

# 运行场景
asyncio.run(auto_healing_scenario())
```

### 场景2：预测性维护

```python
# examples/predictive_maintenance.py
from app.services.prediction_service import PredictionService
import asyncio

async def predictive_maintenance_scenario():
    """预测性维护场景"""
    prediction_service = PredictionService()

    services = ["user-service", "product-service", "order-service"]

    print("🔮 开始预测性维护分析...\n")

    for service in services:
        print(f"--- 分析服务：{service} ---")

        # 1. 容量预测
        print("📊 容量预测：")
        capacity = await prediction_service.predict_capacity(service, hours=24)

        print(f"  预测峰值CPU: {capacity['recommendations']['peak_cpu']:.2f}%")
        print(f"  预测平均CPU: {capacity['recommendations']['avg_cpu']:.2f}%")
        print(f"  推荐副本数: {capacity['recommendations']['recommended_replicas']}")

        # 2. 故障预测
        print("\n⚠️  故障预测：")
        failure = await prediction_service.predict_failure(service, hours=24)

        probability = failure['failure_probability'] * 100
        print(f"  故障概率: {probability:.1f}%")
        print(f"  置信度: {failure['confidence']}")

        if probability > 70:
            print(f"  🚨 高风险！建议采取预防措施")
            print(f"  风险因素：{failure.get('risk_factors', [])}")
            print(f"  预防措施：{failure.get('preventive_actions', [])}")

            # 提前采取措施
            print("\n💊 执行预防性维护...")
            from app.services.healing_service import AutoHealingService
            healing_service = AutoHealingService()

            result = await healing_service.analyze_and_heal(
                service,
                {"type": "preventive", "severity": "medium"}
            )
            print(f"  维护结果：{result}")

        print()

# 运行场景
asyncio.run(predictive_maintenance_scenario())
```

---

## 部署指南

### 1. 本地开发

```bash
# 安装依赖
pip install -r backend/requirements.txt

# 配置环境变量
cp backend/.env.example backend/.env
# 编辑 .env 文件

# 启动后端
cd backend
uvicorn app.main:app --reload --port 8000

# 启动前端
cd frontend
npm install
npm run dev
```

### 2. Kubernetes部署

**部署清单**

```yaml
# infrastructure/kubernetes/aiops-platform.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: aiops

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aiops-backend
  namespace: aiops
spec:
  replicas: 2
  selector:
    matchLabels:
      app: aiops-backend
  template:
    metadata:
      labels:
        app: aiops-backend
    spec:
      containers:
      - name: api
        image: myorg/aiops-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: aiops-secrets
              key: openai-api-key
        - name: PROMETHEUS_URL
          value: "http://prometheus.monitoring.svc.cluster.local:9090"
        - name: ELASTICSEARCH_URL
          value: "http://elasticsearch.logging.svc.cluster.local:9200"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"

---
apiVersion: v1
kind: Service
metadata:
  name: aiops-backend
  namespace: aiops
spec:
  selector:
    app: aiops-backend
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: aiops-ingress
  namespace: aiops
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - aiops.example.com
    secretName: aiops-tls
  rules:
  - host: aiops.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: aiops-backend
            port:
              number: 80
```

**部署到Kubernetes**

```bash
# 创建namespace
kubectl create namespace aiops

# 创建secret
kubectl create secret generic aiops-secrets \
  --from-literal=openai-api-key=your-api-key \
  -n aiops

# 部署应用
kubectl apply -f infrastructure/kubernetes/aiops-platform.yaml

# 查看状态
kubectl get pods -n aiops
kubectl logs -f deployment/aiops-backend -n aiops
```

---

## 学习成果

完成本项目后，你将掌握：

✅ **AIOps核心概念**
- 异常检测算法
- 时间序列预测
- AI驱动的故障诊断

✅ **机器学习实践**
- Isolation Forest
- Prophet时间序列预测
- 特征工程

✅ **LLM应用**
- LangChain框架
- Agent开发
- Tool use

✅ **运维自动化**
- 智能告警
- 自动自愈
- 预测性维护

✅ **系统集成**
- Prometheus集成
- Elasticsearch集成
- Kubernetes API

---

## 扩展练习

- [ ] 实现更复杂的异常检测算法
- [ ] 集成更多ML模型（LSTM、XGBoost）
- [ ] 实现根因分析（RCA）
- [ ] 添加自然语言查询接口
- [ ] 实现智能容量规划

---

**项目难度**：⭐⭐⭐⭐⭐
**预计时间**：80-100小时
**适合人群**：有Python和运维基础，想学习AI在运维领域的应用
