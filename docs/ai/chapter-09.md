---
title: AI 企业级实战项目3
description: AI数据分析与商业智能平台
---

# ：AI 完全实战项目 - 企业级数据分析与商业智能平台

> **项目概述**：本项目是一个基于AI的企业级数据分析与商业智能平台，支持自然语言查询、智能图表生成、异常检测、预测分析等功能。
>
> **学习目标**：
> - 掌握AI数据分析平台的完整架构
> - 熟练使用自然语言处理实现NL2SQL
> - 掌握智能图表生成、数据可视化
> - 学会异常检测、趋势预测、自动化报告

---

## 项目介绍

### 项目背景

本AI数据分析平台是一个企业级商业智能解决方案，主要功能包括：

- ✅ **自然语言查询**：用中文问数据，AI自动生成SQL
- ✅ **智能图表生成**：自动选择最佳可视化方式
- ✅ **异常检测**：AI自动发现数据异常
- ✅ **趋势预测**：基于机器学习的预测分析
- ✅ **自动化报告**：定时生成数据分析报告
- ✅ **数据洞察**：AI自动发现数据规律
- ✅ **多数据源**：支持MySQL、PostgreSQL、API等
- ✅ **权限管理**：数据权限、行级权限

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **前端** | React 18 + TypeScript | latest |
| **可视化** | ECharts / D3.js | latest |
| **后端** | Python + FastAPI | latest |
| **LLM** | GPT-4 / Claude 3 | latest |
| **数据库** | PostgreSQL + MySQL | latest |
| **ORM** | SQLAlchemy | latest |
| **数据处理** | Pandas / NumPy | latest |
| **机器学习** | Scikit-learn | latest |
| **向量搜索** | pgvector | latest |
| **任务调度** | Celery / Redis | latest |

### 项目结构

```
ai-analytics-platform/
├── frontend/                     # 前端
│   ├── src/
│   │   ├── pages/                # 页面
│   │   │   ├── dashboard/        # 仪表盘
│   │   │   ├── query/            # 自然语言查询
│   │   │   ├── charts/           # 图表管理
│   │   │   ├── insights/         # 数据洞察
│   │   │   └── reports/          # 报告管理
│   │   ├── components/           # 组件
│   │   │   ├── QueryInput.tsx    # 查询输入
│   │   │   ├── ChartViewer.tsx   # 图表查看器
│   │   │   └── InsightCard.tsx   # 洞察卡片
│   │   └── services/             # API服务
├── backend/                      # 后端
│   ├── app/
│   │   ├── api/                  # API路由
│   │   ├── core/                 # 核心功能
│   │   │   ├── nl2sql/           # 自然语言转SQL
│   │   │   ├── chart/            # 智能图表
│   │   │   ├── anomaly/          # 异常检测
│   │   │   ├── forecast/         # 预测分析
│   │   │   └── insight/          # 数据洞察
│   │   ├── models/               # 数据模型
│   │   ├── db/                   # 数据库连接
│   │   └── tasks/                # 后台任务
├── ml/                           # 机器学习模型
│   ├── anomaly_detection.py
│   ├── forecasting.py
│   └── insight_engine.py
└── sql_history/                  # SQL历史和模板
```

---

## 核心功能实现

### 1. 自然语言转SQL（NL2SQL）

```python
# backend/app/core/nl2sql/generator.py
from typing import List, Dict, Optional
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from app.db.database import get_schema_info

class NL2SQLGenerator:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0)

        # Few-shot示例
        self.examples = [
            {
                "question": "上个月销售额是多少？",
                "schema": "orders(order_id, customer_id, amount, created_at)",
                "sql": "SELECT SUM(amount) FROM orders WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', CURRENT_DATE)"
            },
            {
                "question": "销量最好的5个产品是什么？",
                "schema": "products(id, name, price), order_items(id, order_id, product_id, quantity)",
                "sql": "SELECT p.name, SUM(oi.quantity) as total_quantity FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.id, p.name ORDER BY total_quantity DESC LIMIT 5"
            }
        ]

        self.example_prompt = ChatPromptTemplate.from_messages([
            ("human", "{question}\nSchema: {schema}\nSQL: {sql}")
        ])

        self.few_shot_prompt = FewShotChatMessagePromptTemplate(
            example_prompt=self.example_prompt,
            examples=self.examples,
        )

    async def generate_sql(
        self,
        question: str,
        database: str,
        user_id: str
    ) -> Dict[str, any]:
        """生成SQL查询"""

        # 1. 获取数据库schema
        schema_info = await get_schema_info(database, user_id)

        # 2. 生成SQL
        prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一个SQL专家，根据用户的自然语言问题生成SQL查询。

            规则：
            1. 只返回SQL，不要解释
            2. 使用PostgreSQL语法
            3. 确保SQL安全，避免SQL注入
            4. 如果问题无法用SQL回答，返回NULL

            参考示例：
            {examples}

            当前Schema：
            {schema}
            """),
            ("human", "{question}")
        ])

        chain = prompt | self.llm

        sql_query = await chain.ainvoke({
            "examples": self.few_shot_prompt.format(),
            "schema": schema_info,
            "question": question
        })

        sql_query = sql_query.content.strip()

        # 3. 验证SQL安全性
        if not self._is_safe_sql(sql_query):
            raise ValueError("生成的SQL不安全")

        return {
            "sql": sql_query,
            "question": question,
            "database": database
        }

    def _is_safe_sql(self, sql: str) -> bool:
        """验证SQL安全性"""
        dangerous_keywords = [
            "DROP", "DELETE", "TRUNCATE", "ALTER", "CREATE",
            "INSERT", "UPDATE", "GRANT", "REVOKE"
        ]

        sql_upper = sql.upper()
        for keyword in dangerous_keywords:
            if keyword in sql_upper:
                return False

        return True
```

### 2. 智能图表生成

```python
# backend/app/core/chart/generator.py
from typing import Dict, List
import pandas as pd
from app.core.llm.openai_client import OpenAIClient

class ChartGenerator:
    def __init__(self):
        self.llm = OpenAIClient()

        # 图表类型选择规则
        self.chart_rules = {
            "comparison": ["bar", "line"],           # 比较：柱状图、折线图
            "trend": ["line", "area"],               # 趋势：折线图、面积图
            "distribution": ["pie", "donut"],        # 分布：饼图、环形图
            "correlation": ["scatter", "heatmap"],    # 相关性：散点图、热力图
            "ranking": ["bar", "row"],               # 排名：柱状图、条形图
            "proportion": ["pie", "stacked_bar"]      # 占比：饼图、堆叠柱状图
        }

    async def generate_chart(
        self,
        data: pd.DataFrame,
        question: str,
        user_preferences: Dict = None
    ) -> Dict:
        """智能生成图表配置"""

        # 1. 分析数据特征
        data_characteristics = self._analyze_data(data)

        # 2. 选择图表类型
        chart_type = await self._select_chart_type(
            question=question,
            data_characteristics=data_characteristics,
            user_preferences=user_preferences
        )

        # 3. 生成图表配置
        chart_config = await self._generate_chart_config(
            chart_type=chart_type,
            data=data,
            question=question
        )

        return {
            "type": chart_type,
            "config": chart_config,
            "data": data.to_dict("records")
        }

    def _analyze_data(self, df: pd.DataFrame) -> Dict:
        """分析数据特征"""
        return {
            "row_count": len(df),
            "column_count": len(df.columns),
            "numeric_columns": df.select_dtypes(include=["number"]).columns.tolist(),
            "categorical_columns": df.select_dtypes(include=["object"]).columns.tolist(),
            "time_columns": df.select_dtypes(include=["datetime64"]).columns.tolist(),
            "has_time_series": len(df.select_dtypes(include=["datetime64"]).columns) > 0
        }

    async def _select_chart_type(
        self,
        question: str,
        data_characteristics: Dict,
        user_preferences: Dict
    ) -> str:
        """选择最佳图表类型"""

        # 使用LLM分析问题意图
        prompt = f"""
        分析这个数据问题的可视化需求：
        问题：{question}
        数据特征：{data_characteristics}

        返回最合适的图表类型（bar/line/pie/scatter/heatmap/area）。
        只返回图表类型名称，不要解释。
        """

        chart_type = await self.llm.generate(prompt)

        # 验证图表类型是否适用
        if chart_type.lower() in ["bar", "line", "pie", "scatter", "heatmap", "area"]:
            return chart_type.lower()

        # 默认返回柱状图
        return "bar"

    async def _generate_chart_config(
        self,
        chart_type: str,
        data: pd.DataFrame,
        question: str
    ) -> Dict:
        """生成ECharts配置"""

        if chart_type == "bar":
            return self._generate_bar_config(data, question)
        elif chart_type == "line":
            return self._generate_line_config(data, question)
        elif chart_type == "pie":
            return self._generate_pie_config(data, question)
        else:
            return self._generate_bar_config(data, question)

    def _generate_bar_config(self, df: pd.DataFrame, question: str) -> Dict:
        """生成柱状图配置"""
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        categorical_cols = df.select_dtypes(include=["object"]).columns.tolist()

        x_axis = categorical_cols[0] if categorical_cols else df.columns[0]
        y_axis = numeric_cols[0] if numeric_cols else df.columns[1]

        return {
            "title": {"text": question},
            "xAxis": {"type": "category", "data": df[x_axis].tolist()},
            "yAxis": {"type": "value"},
            "series": [{
                "type": "bar",
                "data": df[y_axis].tolist(),
                "itemStyle": {"color": "#3b82f6"}
            }],
            "tooltip": {"trigger": "axis"}
        }
```

### 3. 异常检测

```python
# ml/anomaly_detection.py
from typing import List, Dict, Tuple
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(
            contamination=0.1,
            random_state=42
        )
        self.scaler = StandardScaler()

    def detect_anomalies(
        self,
        data: pd.DataFrame,
        timestamp_col: str,
        value_col: str,
        window_size: int = 7
    ) -> List[Dict]:
        """检测异常数据点"""

        # 1. 数据预处理
        df = data.copy()
        df[timestamp_col] = pd.to_datetime(df[timestamp_col])
        df = df.sort_values(timestamp_col)

        # 2. 计算移动平均和标准差
        df["ma"] = df[value_col].rolling(window=window_size).mean()
        df["std"] = df[value_col].rolling(window=window_size).std()

        # 3. 计算Z-score
        df["z_score"] = (df[value_col] - df["ma"]) / df["std"]

        # 4. 统计异常（Z-score > 3）
        statistical_anomalies = df[abs(df["z_score"]) > 3].to_dict("records")

        # 5. 使用Isolation Forest检测异常
        features = df[[value_col, "ma", "std"]].fillna(0)
        scaled_features = self.scaler.fit_transform(features)

        df["anomaly_score"] = self.model.fit_predict(scaled_features)
        ml_anomalies = df[df["anomaly_score"] == -1].to_dict("records")

        # 6. 合并异常结果
        anomalies = []

        for idx, row in df.iterrows():
            is_statistical = abs(row["z_score"]) > 3
            is_ml_anomaly = row["anomaly_score"] == -1

            if is_statistical or is_ml_anomaly:
                anomalies.append({
                    "timestamp": row[timestamp_col].isoformat(),
                    "value": float(row[value_col]),
                    "expected": float(row["ma"]),
                    "z_score": float(row["z_score"]),
                    "anomaly_type": self._classify_anomaly(row),
                    "severity": self._calculate_severity(row)
                })

        return anomalies

    def _classify_anomaly(self, row: pd.Series) -> str:
        """分类异常类型"""
        if row["z_score"] > 3:
            return "spike"  # 突然增高
        elif row["z_score"] < -3:
            return "drop"   # 突然降低
        elif row["anomaly_score"] == -1:
            return "pattern_change"  # 模式改变
        else:
            return "unknown"

    def _calculate_severity(self, row: pd.Series) -> str:
        """计算异常严重程度"""
        abs_z = abs(row["z_score"])

        if abs_z > 5:
            return "critical"
        elif abs_z > 4:
            return "high"
        elif abs_z > 3:
            return "medium"
        else:
            return "low"
```

### 4. 预测分析

```python
# ml/forecasting.py
from typing import Dict, List
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

class ForecastingEngine:
    def __init__(self):
        self.models = {
            "linear": LinearRegression(),
            "random_forest": RandomForestRegressor(n_estimators=100)
        }

    async def forecast(
        self,
        data: pd.DataFrame,
        date_col: str,
        value_col: str,
        periods: int = 30,
        model_type: str = "random_forest"
    ) -> Dict:
        """预测未来趋势"""

        # 1. 数据准备
        df = data.copy()
        df[date_col] = pd.to_datetime(df[date_col])
        df = df.sort_values(date_col)
        df = df.groupby(date_col)[value_col].sum().reset_index()

        # 2. 创建特征
        df = self._create_features(df, date_col)

        # 3. 训练模型
        X = df[["day_of_week", "day_of_month", "month", "day_of_year"]]
        y = df[value_col]

        model = self.models[model_type]
        model.fit(X, y)

        # 4. 生成未来日期
        future_dates = pd.date_range(
            start=df[date_col].max() + pd.Timedelta(days=1),
            periods=periods,
            freq="D"
        )

        future_df = pd.DataFrame({"date": future_dates})
        future_df = self._create_features(future_df, "date")

        # 5. 预测
        X_future = future_df[["day_of_week", "day_of_month", "month", "day_of_year"]]
        predictions = model.predict(X_future)

        # 6. 计算置信区间
        y_pred = model.predict(X)
        mae = mean_absolute_error(y, y_pred)
        std_error = np.std(y - y_pred)

        # 7. 返回结果
        forecast_data = []
        for i, date in enumerate(future_dates):
            forecast_data.append({
                "date": date.isoformat(),
                "predicted_value": float(predictions[i]),
                "lower_bound": float(predictions[i] - 1.96 * std_error),
                "upper_bound": float(predictions[i] + 1.96 * std_error)
            })

        return {
            "forecast": forecast_data,
            "model_type": model_type,
            "mae": float(mae),
            "historical_data": df.to_dict("records")
        }

    def _create_features(self, df: pd.DataFrame, date_col: str) -> pd.DataFrame:
        """创建时间序列特征"""
        df = df.copy()
        df[date_col] = pd.to_datetime(df[date_col])

        df["day_of_week"] = df[date_col].dt.dayofweek
        df["day_of_month"] = df[date_col].dt.day
        df["month"] = df[date_col].dt.month
        df["day_of_year"] = df[date_col].dt.dayofyear

        # 添加滞后特征
        df["lag_1"] = df.iloc[:, -1].shift(1)
        df["lag_7"] = df.iloc[:, -2].shift(7)

        # 添加移动平均
        df["ma_7"] = df.iloc[:, -3].rolling(window=7).mean()

        return df.fillna(0)
```

### 5. 数据洞察引擎

```python
# backend/app/core/insight/engine.py
from typing import List, Dict
import pandas as pd
from app.core.llm.openai_client import OpenAIClient

class InsightEngine:
    def __init__(self):
        self.llm = OpenAIClient()

    async def generate_insights(
        self,
        data: pd.DataFrame,
        context: Dict = None
    ) -> List[Dict]:
        """生成数据洞察"""

        insights = []

        # 1. 统计摘要
        summary = self._generate_summary(data)
        insights.append({
            "type": "summary",
            "title": "数据摘要",
            "content": summary,
            "priority": "low"
        })

        # 2. 趋势分析
        trends = await self._analyze_trends(data)
        insights.extend(trends)

        # 3. 异常发现
        anomalies = await self._detect_anomalies(data)
        insights.extend(anomalies)

        # 4. 相关性分析
        correlations = self._analyze_correlations(data)
        insights.extend(correlations)

        # 5. AI洞察
        ai_insights = await self._generate_ai_insights(data, context)
        insights.extend(ai_insights)

        # 6. 排序
        insights.sort(key=lambda x: self._priority_score(x["priority"]), reverse=True)

        return insights

    def _generate_summary(self, df: pd.DataFrame) -> str:
        """生成统计摘要"""
        numeric_df = df.select_dtypes(include=["number"])

        summary = f"""
        数据集包含 {len(df)} 行和 {len(df.columns)} 列。
        数值列的统计信息：
        {numeric_df.describe().to_string()}
        """
        return summary

    async def _analyze_trends(self, df: pd.DataFrame) -> List[Dict]:
        """分析趋势"""
        insights = []

        numeric_cols = df.select_dtypes(include=["number"]).columns

        for col in numeric_cols:
            # 计算增长趋势
            if len(df) >= 2:
                first_value = df[col].iloc[0]
                last_value = df[col].iloc[-1]
                growth_rate = ((last_value - first_value) / first_value) * 100

                if abs(growth_rate) > 10:
                    insights.append({
                        "type": "trend",
                        "title": f"{col} 趋势分析",
                        "content": f"{col} 从 {first_value:.2f} 增长到 {last_value:.2f}，增长率为 {growth_rate:.2f}%",
                        "priority": "medium" if abs(growth_rate) > 20 else "low"
                    })

        return insights

    async def _detect_anomalies(self, df: pd.DataFrame) -> List[Dict]:
        """检测异常"""
        # 使用异常检测模块
        from ml.anomaly_detection import AnomalyDetector

        detector = AnomalyDetector()

        # 假设有时间列
        if len(df.columns) > 0:
            date_col = df.columns[0]
            value_col = df.select_dtypes(include=["number"]).columns[0] if len(df.select_dtypes(include=["number"]).columns) > 0 else df.columns[1]

            anomalies = detector.detect_anomalies(df, date_col, value_col)

            return [
                {
                    "type": "anomaly",
                    "title": f"异常检测：{anomaly['timestamp']}",
                    "content": f"检测到{anomaly['anomaly_type']}异常，严重程度：{anomaly['severity']}",
                    "priority": anomaly['severity']
                }
                for anomaly in anomalies[:5]  # 只返回前5个
            ]

        return []

    def _analyze_correlations(self, df: pd.DataFrame) -> List[Dict]:
        """分析相关性"""
        insights = []

        numeric_df = df.select_dtypes(include=["number"])

        if len(numeric_df.columns) >= 2:
            corr_matrix = numeric_df.corr()

            # 找出强相关
            for i in range(len(corr_matrix.columns)):
                for j in range(i+1, len(corr_matrix.columns)):
                    corr_value = corr_matrix.iloc[i, j]

                    if abs(corr_value) > 0.7:
                        col1 = corr_matrix.columns[i]
                        col2 = corr_matrix.columns[j]

                        insights.append({
                            "type": "correlation",
                            "title": f"{col1} 与 {col2} 的相关性",
                            "content": f"发现强相关关系，相关系数为 {corr_value:.2f}",
                            "priority": "medium"
                        })

        return insights

    async def _generate_ai_insights(
        self,
        data: pd.DataFrame,
        context: Dict
    ) -> List[Dict]:
        """使用AI生成深度洞察"""

        prompt = f"""
        分析以下数据，生成3个最重要的洞察：

        数据预览：
        {data.head(10).to_string()}

        统计信息：
        {data.describe().to_string()}

        上下文信息：
        {context}

        返回JSON格式的洞察列表，每个洞察包含：
        - title: 标题
        - content: 内容描述
        - recommendation: 行动建议
        """

        response = await self.llm.generate(prompt)

        # 解析AI响应
        try:
            ai_insights = json.loads(response)
            return [
                {
                    "type": "ai_insight",
                    "title": insight["title"],
                    "content": insight["content"],
                    "recommendation": insight.get("recommendation", ""),
                    "priority": "high"
                }
                for insight in ai_insights
            ]
        except:
            return []
```

---

## 前端实现

### 1. 自然语言查询组件

```tsx
// frontend/src/components/query/QueryInput.tsx
import React, { useState } from 'react'

export const QueryInput: React.FC = () => {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleExecuteQuery = async () => {
    if (!query.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/query/nl2sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      })

      const data = await response.json()

      // 执行SQL
      const resultResponse = await fetch('/api/query/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: data.sql })
      })

      const queryResult = await resultResponse.json()

      setResult({
        sql: data.sql,
        data: queryResult.data,
        rowCount: queryResult.rowCount
      })
    } catch (error) {
      console.error('查询失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="query-container">
      <div className="query-input">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleExecuteQuery()}
          placeholder="请输入您的问题，例如：上个月销售额是多少？"
        />
        <button onClick={handleExecuteQuery} disabled={isLoading}>
          {isLoading ? '查询中...' : '查询'}
        </button>
      </div>

      {result && (
        <div className="query-result">
          <div className="sql-display">
            <h4>生成的SQL：</h4>
            <code>{result.sql}</code>
          </div>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  {Object.keys(result.data[0] || {}).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((row: any, index: number) => (
                  <tr key={index}>
                    {Object.values(row).map((value: any, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p>共 {result.rowCount} 条记录</p>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 2. 智能图表组件

```tsx
// frontend/src/components/chart/ChartViewer.tsx
import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface ChartViewerProps {
  config: any
  data: any[]
}

export const ChartViewer: React.FC<ChartViewerProps> = ({ config, data }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current)

    // 设置配置
    chartInstance.current.setOption(config)

    // 响应式
    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [config])

  return (
    <div className="chart-viewer">
      <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
    </div>
  )
}
```

---

## 性能优化

### 1. 查询缓存

```python
# backend/app/core/cache/query_cache.py
import hashlib
import json
from typing import Any
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_query(sql: str):
    """查询结果缓存装饰器"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # 生成缓存key
            cache_key = f"query:{hashlib.md5(sql.encode()).hexdigest()}"

            # 尝试从缓存获取
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)

            # 执行查询
            result = await func(*args, **kwargs)

            # 写入缓存（1小时）
            redis_client.setex(
                cache_key,
                3600,
                json.dumps(result, default=str)
            )

            return result
        return wrapper
    return decorator
```

### 2. 异步任务

```python
# backend/app/tasks/report_tasks.py
from celery import Celery
from app.core.insight.engine import InsightEngine

celery_app = Celery('reports', broker='redis://localhost:6379/0')

@celery_app.task
def generate_daily_report(user_id: str):
    """生成日报"""
    insight_engine = InsightEngine()

    # 获取用户数据
    data = get_user_data(user_id)

    # 生成洞察
    insights = insight_engine.generate_insights(data)

    # 生成报告
    report = create_report(insights)

    # 发送邮件
    send_report_email(user_id, report)

    return report
```

---

## 部署上线

### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/analytics
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis

  worker:
    build: ./backend
    command: celery -A app.tasks worker --loglevel=info
    depends_on:
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=analytics
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

---

## 项目总结

本项目涵盖了AI数据分析平台开发的核心技能：

✅ **技术栈**：Python + FastAPI + React + LLM + 机器学习
✅ **核心功能**：自然语言查询、智能图表、异常检测、预测分析
✅ **AI特性**：NL2SQL、自动洞察、趋势预测、模式识别
✅ **企业特性**：多数据源、权限管理、自动化报告、性能优化

通过这个项目，你将掌握：
- 自然语言转SQL的实现
- 智能图表生成算法
- 异常检测和预测分析
- 数据洞察引擎开发
- 自动化报告系统
- 企业级BI平台架构

---

## 下一步学习

- [第4章：LangChain框架](/ai/chapter-02)
- [第5章：Prompt工程](/ai/chapter-03)
- [第6章：RAG检索增强](/ai/chapter-04)
- [第7章：AI Agent](/ai/chapter-05)
