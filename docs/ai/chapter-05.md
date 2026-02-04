# 第5章：AI Agent智能体开发

## 本章导读

**AI Agent（智能体）** 是AI应用的最前沿领域。不同于简单的问答系统，Agent能够自主思考、规划任务、调用工具，像人类一样解决复杂问题。

本章将教你如何构建能够使用工具、自主决策的AI智能体。

**学习目标**：
- 理解Agent的概念和工作原理
- 掌握Tools的定义和使用
- 学习ReAct推理模式
- 构建实用的Agent应用

**预计学习时间**：65分钟

---

## 5.1 什么是AI Agent？

### 5.1.1 从Chatbot到Agent

```
┌─────────────────────────────────────────────────┐
│         Chatbot vs Agent 对比                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Chatbot（聊天机器人）：                          │
│  ❌ 只能对话                                    │
│  ❌ 无法执行操作                                │
│  ❌ 被动响应                                    │
│  ❌ 无法访问外部世界                            │
│                                                 │
│  Agent（智能体）：                               │
│  ✅ 可以思考                                    │
│  ✅ 可以规划任务                                │
│  ✅ 可以调用工具                                │
│  ✅ 可以主动行动                                │
│  ✅ 可以与外部世界交互                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 5.1.2 Agent的核心能力

```python
# Agent工作流程示例

# 用户问题
Q: "帮我查一下今天的天气，如果下雨就提醒我带伞"

# Chatbot只会回答
A: "好的，记得看天气带伞哦"

# Agent会：
# 1. 思考（Thought）：需要查询天气
# 2. 行动（Action）：调用天气API
# 3. 观察（Observation）：获取天气数据
# 4. 推理（Reasoning）：判断是否下雨
# 5. 行动（Action）：如果下雨则发送提醒
# 6. 回答（Answer）：给出完整的建议

A: "今天北京有中雨，温度15-20度。
    我已经设置好了提醒：
    如果出门时间在2小时内，我会通知您带伞。
    建议您今天出门携带雨具。"
```

### 5.1.3 Agent的架构

```
┌──────────────────────────────────────────────┐
│           Agent 工作循环                      │
├──────────────────────────────────────────────┤
│                                              │
│  用户输入                                    │
│    ↓                                        │
│  ┌──────────────┐                           │
│  │   思考       │ → 分析任务，制定计划       │
│  │  (Think)     │                           │
│  └──────────────┘                           │
│    ↓                                        │
│  ┌──────────────┐                           │
│  │   行动       │ → 选择并执行工具           │
│  │  (Act)       │                           │
│  └──────────────┘                           │
│    ↓                                        │
│  ┌──────────────┐                           │
│  │   观察       │ → 观察行动结果             │
│  │ (Observe)    │                           │
│  └──────────────┘                           │
│    ↓                                        │
│  任务完成？ → 否 → 继续循环                  │
│    ↓ 是                                      │
│  返回最终结果                                │
│                                              │
└──────────────────────────────────────────────┘
```

### 5.1.4 Agent的应用场景

**1. 个人助理**
```python
# 任务管理
Agent: "好的，我来帮您安排今天的任务..."
      - 查询日历
      - 分析优先级
      - 安排时间
      - 设置提醒
```

**2. 代码助手**
```python
# 代码开发
Agent: "我来帮您实现用户认证功能..."
      - 搜索最佳实践
      - 生成代码框架
      - 编写单元测试
      - 更新文档
```

**3. 数据分析**
```python
# 数据洞察
Agent: "让我分析这份销售数据..."
      - 读取CSV文件
      - 执行统计分析
      - 生成可视化图表
      - 撰写分析报告
```

**4. 研究助手**
```python
# 学术研究
Agent: "我将为您搜集相关论文..."
      - 搜索学术数据库
      - 提取关键信息
      - 整理参考文献
      - 生成文献综述
```

---

## 5.2 Agent的核心组件

### 5.2.1 Tools（工具）

工具是Agent与外部世界交互的接口。

```python
from langchain.tools import Tool
from langchain_community.tools import (
    WikipediaQueryRun,
    DuckDuckGoSearchRun
)

# 1. 内置工具
search = DuckDuckGoSearchRun()
wiki = WikipediaQueryRun()

# 2. 自定义工具
from langchain.pydantic_v1 import BaseModel, Field

class SearchInput(BaseModel):
    """搜索输入参数"""
    query: str = Field(description="搜索关键词")

def search_function(query: str) -> str:
    """搜索函数"""
    # 实际的搜索逻辑
    return f"搜索'{query}'的结果..."

# 创建工具
search_tool = Tool(
    name="Search",  # 工具名称
    func=search_function,  # 工具函数
    description="用于搜索互联网信息，输入为搜索关键词",  # 描述（重要！）
    args_schema=SearchInput  # 参数schema
)

# 3. 常用工具库
from langchain_community.tools import (
    # 文件操作
    ReadFileTool,
    WriteFileTool,
    DeleteFileTool,

    # 数学计算
    Calculator,

    # 代码执行
    PythonREPLTool,

    # 数据库
    QueryDatabaseTool,

    # HTTP请求
    RequestsGetTool,
    RequestsPostTool
)
```

### 5.2.2 创建实用工具

```python
# 1. 天气查询工具
import requests

def get_weather(city: str) -> str:
    """查询天气"""
    # 调用天气API
    response = requests.get(
        f"https://api.weather.com/city/{city}"
    )
    data = response.json()

    return f"{city}今天{data['weather']}，温度{data['temp']}度"

weather_tool = Tool(
    name="GetWeather",
    func=get_weather,
    description="查询指定城市的天气情况，输入为城市名称"
)

# 2. 代码执行工具
from langchain.tools import PythonREPLTool

python_tool = PythonREPLTool()

# 3. 时间日期工具
from datetime import datetime

def get_current_time(format: str = "%Y-%m-%d %H:%M:%S") -> str:
    """获取当前时间"""
    return datetime.now().strftime(format)

time_tool = Tool(
    name="GetCurrentTime",
    func=get_current_time,
    description="获取当前时间，可选参数为时间格式"
)

# 4. 发送邮件工具
import smtplib
from email.mime.text import MIMEText

def send_email(to: str, subject: str, body: str) -> str:
    """发送邮件"""
    # 邮件发送逻辑
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['To'] = to

    # 发送...
    return f"邮件已发送给{to}"

email_tool = Tool(
    name="SendEmail",
    func=send_email,
    description="发送邮件给指定收件人。参数：to(收件人), subject(主题), body(内容)"
)
```

### 5.2.3 工具描述的重要性

工具描述决定了Agent何时使用该工具：

```python
# ❌ 不好的描述
bad_tool = Tool(
    name="Calculator",
    func=calculate,
    description="计算器"  # 太简单
)

# ✅ 好的描述
good_tool = Tool(
    name="Calculator",
    func=calculate,
    description="""
    用于执行数学计算。
    输入格式：数学表达式字符串，例如 "2 + 2" 或 "sqrt(16)"
    输出：计算结果
    使用场景：需要计算数值时使用
    """  # 详细具体
)
```

---

## 5.3 ReAct Agent

### 5.3.1 ReAct模式

**ReAct** = **Reas**oning + **Act**ing（推理 + 行动）

Agent通过"思考-行动-观察"的循环来解决问题：

```
ReAct循环：

Question: [用户问题]

Thought 1: [思考如何解决]
Action 1: [执行工具1]
Observation 1: [观察结果]

Thought 2: [基于结果继续思考]
Action 2: [执行工具2]
Observation 2: [观察结果]

...

Thought N: [确定答案]
Answer: [最终答案]
```

### 5.3.2 创建ReAct Agent

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain_openai import OpenAI
from langchain import hub

# 1. 初始化LLM
llm = OpenAI(temperature=0)  # OpenAI比ChatGPT更适合ReAct

# 2. 准备工具
tools = [
    DuckDuckGoSearchRun(),
    WikipediaQueryRun(),
    PythonREPLTool()
]

# 3. 加载ReAct提示词模板
prompt = hub.pull("hwchase17/react")

# 4. 创建Agent
agent = create_react_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)

# 5. 创建执行器
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,  # 显示思考过程
    max_iterations=5,  # 最大迭代次数
    early_stopping_method="generate"  # 提前停止策略
)

# 6. 运行
result = agent_executor.invoke({
    "input": "Python中列表和元组的区别是什么？"
})

print(result['output'])
```

### 5.3.3 ReAct执行示例

```python
# 输入："小米的创始人是谁？他今年多大年龄？"

# Agent的思考过程：

# Thought 1:
# 我需要查找小米创始人的信息

# Action 1:
# Search: "小米创始人"

# Observation 1:
# 雷军是小米的创始人

# Thought 2:
# 现在需要查找雷军的年龄

# Action 2:
# Search: "雷军年龄 2024"

# Observation 2:
# 雷军出生于1969年，今年55岁

# Thought 3:
# 我现在知道最终答案了

# Final Answer:
# 小米的创始人是雷军，他出生于1969年，今年55岁。
```

### 5.3.4 自定义ReAct提示词

```python
from langchain.prompts import PromptTemplate

# 创建自定义提示词
template = """你是AI智能体，可以访问以下工具：

{tools}

工具使用格式：
Action: 工具名称
Action Input: 工具输入

用户问题：{input}
Thought 1: {agent_scratchpad}"""

prompt = PromptTemplate(
    template=template,
    input_variables=["input", "agent_scratchpad"],
    partial_variables={
        "tools": "\n".join([f"{tool.name}: {tool.description}" for tool in tools])
    }
)

agent = create_react_agent(llm, tools, prompt)
```

---

## 5.4 OpenAI Functions Agent

### 5.4.1 Functions Agent简介

OpenAI提供了Function Calling功能，更适合构建Agent。

```python
from langchain.agents import create_openai_functions_agent
from langchain_openai import ChatOpenAI
from langchain import hub

# 1. 使用Chat模型
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

# 2. 准备工具
tools = [
    search_tool,
    calculator_tool,
    weather_tool
]

# 3. 加载提示词
prompt = hub.pull("hwchase17/openai-functions-agent")

# 4. 创建Agent
agent = create_openai_functions_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)

# 5. 执行
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True
)

result = agent_executor.invoke({
    "input": "北京今天多少度？如果是25度以上，告诉我出门要注意防暑"
})
```

### 5.4.2 结构化工具输出

```python
from langchain.tools import StructuredTool
from pydantic import BaseModel, Field

class WeatherInput(BaseModel):
    """天气查询输入"""
    city: str = Field(description="城市名称")
    unit: str = Field(
        description="温度单位，celsius或fahrenheit",
        default="celsius"
    )

def get_weather(city: str, unit: str = "celsius") -> dict:
    """查询天气，返回结构化数据"""
    # 实际查询逻辑
    return {
        "city": city,
        "temperature": 25,
        "condition": "晴",
        "humidity": 60,
        "unit": unit
    }

# 创建结构化工具
weather_tool = StructuredTool.from_function(
    func=get_weather,
    name="GetWeather",
    description="查询城市天气，返回温度、天气状况、湿度等信息",
    args_schema=WeatherInput
)

# Agent会自动处理结构化输出
```

---

## 5.5 实用Agent案例

### 5.5.1 智能代码助手

```python
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from langchain.tools import Tool
from langchain import hub
import subprocess
import os

# 1. 代码执行工具
def execute_python(code: str) -> str:
    """执行Python代码"""
    try:
        result = subprocess.run(
            ["python", "-c", code],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            return result.stdout
        else:
            return f"错误：{result.stderr}"
    except Exception as e:
        return f"执行失败：{str(e)}"

python_tool = Tool(
    name="ExecutePython",
    func=execute_python,
    description="执行Python代码并返回结果。输入为完整的Python代码字符串。"
)

# 2. 代码搜索工具
def search_code(query: str) -> str:
    """在项目中搜索代码"""
    try:
        result = subprocess.run(
            ["grep", "-r", query, "."],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.stdout if result.returncode == 0 else "未找到相关代码"
    except Exception as e:
        return f"搜索失败：{str(e)}"

search_tool = Tool(
    name="SearchCode",
    func=search_code,
    description="在当前项目中搜索包含特定关键词的代码。输入为搜索关键词。"
)

# 3. 创建Agent
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
tools = [python_tool, search_tool]

prompt = hub.pull("hwchase17/openai-functions-agent")
agent = create_openai_functions_agent(llm, tools, prompt)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=10
)

# 使用
result = agent_executor.invoke({
    "input": """
    编写Python代码实现快速排序，执行它测试排序[3,1,4,1,5,9,2,6]，
    并搜索项目中是否有其他排序实现。
    """
})

print(result['output'])
```

### 5.5.2 数据分析Agent

```python
import pandas as pd
from typing import Optional

class DataAnalysisAgent:
    """数据分析Agent"""

    def __init__(self, file_path: str):
        self.df = pd.read_csv(file_path)
        self.tools = self._create_tools()
        self.agent = self._create_agent()

    def _create_tools(self):
        """创建数据分析工具"""

        def get_info() -> str:
            """获取数据集基本信息"""
            return f"""
            行数：{len(self.df)}
            列数：{len(self.df.columns)}
            列名：{list(self.df.columns)}
            内存使用：{self.df.memory_usage(deep=True).sum() / 1024:.2f} KB
            """

        def describe_column(column: str) -> str:
            """描述列"""
            if column not in self.df.columns:
                return f"错误：列'{column}'不存在"
            return str(self.df[column].describe())

        def get_head(n: int = 5) -> str:
            """获取前N行"""
            return str(self.df.head(n).to_markdown())

        def groupby_agg(column: str, agg: str = "mean") -> str:
            """分组聚合"""
            try:
                result = self.df.groupby(column).agg(agg)
                return str(result.to_markdown())
            except Exception as e:
                return f"聚合失败：{str(e)}"

        def plot_column(column: str, plot_type: str = "hist") -> str:
            """绘制列的图表"""
            import matplotlib.pyplot as plt
            import io
            import base64

            plt.figure(figsize=(10, 6))

            if plot_type == "hist":
                self.df[column].hist()
            elif plot_type == "bar":
                self.df[column].value_counts().plot.bar()
            else:
                self.df[column].plot()

            plt.title(f"{column} - {plot_type}")
            plt.tight_layout()

            # 保存为base64
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            img_base64 = base64.b64encode(buf.read()).decode()
            plt.close()

            return f"![图表](data:image/png;base64,{img_base64})"

        return [
            Tool(name="GetInfo", func=get_info,
                description="获取数据集基本信息"),
            Tool(name="DescribeColumn", func=describe_column,
                description="描述指定列的统计信息，参数：column(列名)"),
            Tool(name="GetHead", func=get_head,
                description="获取前N行数据，参数：n(行数，默认5)"),
            Tool(name="GroupByAgg", func=groupby_agg,
                description="分组聚合，参数：column(分组列), agg(聚合函数)"),
            Tool(name="PlotColumn", func=plot_column,
                description="绘制图表，参数：column(列名), plot_type(图表类型)")
        ]

    def _create_agent(self):
        """创建Agent"""
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
        prompt = hub.pull("hwchase17/openai-functions-agent")

        agent = create_openai_functions_agent(
            llm=llm,
            tools=self.tools,
            prompt=prompt
        )

        return AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True
        )

    def analyze(self, question: str) -> str:
        """分析提问"""
        result = self.agent.invoke({"input": question})
        return result['output']

# 使用
agent = DataAnalysisAgent("sales_data.csv")
print(agent.analyze("分析销售额的分布情况，找出异常值"))
```

### 5.5.3 研究助手Agent

```python
from langchain_community.tools import (
    WikipediaQueryRun,
    DuckDuckGoSearchRun,
    ArxivQueryRun  # 学术论文搜索
)
from langchain.utilities import WikipediaAPIWrapper

# 1. 创建搜索工具
search = DuckDuckGoSearchRun()

# 2. Wikipedia工具
wiki = WikipediaQueryRun(
    api_wrapper=WikipediaAPIWrapper(
        lang="zh",
        top_k_results=3
    )
)

# 3. 论文搜索工具
arxiv = ArxivQueryRun()

# 4. 笔记记录工具
notes = []

def save_note(content: str) -> str:
    """保存笔记"""
    notes.append(content)
    return f"已保存笔记（共{len(notes)}条）"

note_tool = Tool(
    name="SaveNote",
    func=save_note,
    description="记录重要信息到笔记中"
)

def get_notes() -> str:
    """获取所有笔记"""
    return "\n\n".join([f"{i+1}. {note}" for i, note in enumerate(notes)])

notes_tool = Tool(
    name="GetNotes",
    func=get_notes,
    description="查看所有已保存的笔记"
)

# 5. 创建研究助手
research_tools = [search, wiki, arxiv, note_tool, notes_tool]

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
prompt = hub.pull("hwchase17/openai-functions-agent")

agent = create_openai_functions_agent(llm, research_tools, prompt)
executor = AgentExecutor(
    agent=agent,
    tools=research_tools,
    verbose=True
)

# 使用
result = executor.invoke({
    "input": """
    研究主题：Transformers在自然语言处理中的应用

    任务：
    1. 搜索相关论文和资料
    2. 总结核心概念
    3. 记录关键发现
    4. 生成研究综述
    """
})

print(result['output'])
```

---

## 5.6 多Agent协作

### 5.6.1 Agent团队

```python
# 创建专门的Agent团队

# 1. 研究员Agent
researcher = create_react_agent(
    llm=ChatOpenAI(model="gpt-3.5-turbo"),
    tools=[search, wiki, arxiv],
    prompt=PromptTemplate.from_template(
        "你是研究员，擅长搜集和分析资料。{input}"
    )
)

# 2. 写作Agent
writer = create_react_agent(
    llm=ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7),
    tools=[note_tool],
    prompt=PromptTemplate.from_template(
        "你是专业写手，擅长创作高质量文章。{input}"
    )
)

# 3. 审核Agent
reviewer = create_react_agent(
    llm=ChatOpenAI(model="gpt-3.5-turbo"),
    tools=[],
    prompt=PromptTemplate.from_template(
        "你是审核员，负责检查内容的准确性和质量。{input}"
    )
)

# 4. 协作流程
def collaborative_workflow(topic: str):
    """协作工作流"""

    # Step 1: 研究员收集信息
    research_result = AgentExecutor(
        agent=researcher,
        tools=[search, wiki, arxiv]
    ).invoke({"input": f"研究{topic}的相关资料"})

    # Step 2: 写作Agent创作
    article = AgentExecutor(
        agent=writer,
        tools=[note_tool]
    ).invoke({
        "input": f"""
        基于以下研究资料，撰写一篇文章：
        {research_result['output']}
        """
    })

    # Step 3: 审核Agent检查
    review = AgentExecutor(
        agent=reviewer,
        tools=[]
    ).invoke({
        "input": f"""
        审核以下文章，给出修改建议：
        {article['output']}
        """
    })

    return {
        "research": research_result['output'],
        "article": article['output'],
        "review": review['output']
    }
```

---

## 5.7 Agent优化技巧

### 5.7.1 提示词优化

```python
# 优化的Agent提示词
agent_prompt = PromptTemplate.from_template("""
你是一个专业的AI助手，具有以下特点：

**角色定位**：
{role}

**可用工具**：
{tools}

**工作原则**：
1. 思考后再行动
2. 选择最合适的工具
3. 观察结果并调整策略
4. 遇到错误时尝试替代方案
5. 优先使用已有信息，避免重复搜索

**输出格式**：
Thought: [你的思考]
Action: [工具名称]
Action Input: [工具输入]

**当前任务**：
{input}

{agent_scratchpad}
""")
```

### 5.7.2 记忆管理

```python
from langchain.memory import ConversationBufferMemory

# 为Agent添加记忆
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    memory=memory,
    verbose=True
)

# Agent会记住之前的对话
```

### 5.7.3 错误处理

```python
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=5,
    max_execution_time=60,  # 最大执行时间
    handle_parsing_errors=True,  # 自动处理解析错误
    early_stopping_method="force"  # 遇到错误时强制停止
)
```

---

## 5.8 本章小结

### 5.8.1 核心概念

✅ **Agent能力**：
- 思考（Reasoning）
- 行动（Acting）
- 观察（Observing）

✅ **关键组件**：
- Tools：工具定义和使用
- ReAct：推理-行动循环
- Functions Agent：OpenAI函数调用

✅ **实战应用**：
- 代码助手
- 数据分析
- 研究助手
- 多Agent协作

---

## 5.9 练习题

### 练习1：创建文件管理Agent

实现能够读取、写入、搜索文件的Agent。

### 练习2：构建学习助手

创建能帮助学生学习的Agent，包含：
- 查询概念
- 生成练习题
- 检查答案

### 练习3：多Agent系统

实现研究员+写作+审核的协作流程。

---

**下一章：[实战项目 →](chapter-06)**
