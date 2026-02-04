# AI Agent

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

## 什么是AI Agent？

### 从Chatbot到Agent

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

### Agent的核心能力

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

### Agent的架构

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

### Agent的应用场景

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

## Agent的核心组件

### Tools（工具）

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

### 创建实用工具

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

### 工具描述的重要性

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

## ReAct Agent

### ReAct模式

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

### 创建ReAct Agent

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

### ReAct执行示例

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

### 自定义ReAct提示词

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

## OpenAI Functions Agent

### Functions Agent简介

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

### 结构化工具输出

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

## 实用Agent案例

### 智能代码助手

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

### 数据分析Agent

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

### 研究助手Agent

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

## 多Agent协作

### Agent团队

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

## Agent优化技巧

### 提示词优化

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

### 记忆管理

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

### 错误处理

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

## 本章小结

### 核心概念

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

## 练习题

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

## 常见问题 FAQ

### Q1: Agent和Chain有什么区别？什么时候用Agent？

**A:**

```python
# Agent vs Chain 对比：

┌─────────────┬──────────────────┬──────────────────┐
│   维度      │      Chain       │     Agent        │
├─────────────┼──────────────────┼──────────────────┤
│ 工作方式    │ 预定义流程       │ 自主决策         │
│ 灵活性      │ 固定步骤         │ 动态选择         │
│ 工具使用    │ 按顺序调用       │ 按需调用         │
│ 复杂度      │ 简单任务         │ 复杂任务         │
│ 可预测性    │ 高               │ 中等             │
│ 适用场景    │ 流程化任务       │ 推理和决策       │
└─────────────┴──────────────────┴──────────────────┘

# 示例对比：

# Chain：固定流程
from langchain.chains import SequentialChain

# 步骤固定：翻译 → 总结 → 发送邮件
chain = SequentialChain(
    chains=[translate_chain, summarize_chain, email_chain],
    input_variables=["text"],
    output_variables=["email_sent"]
)

# Agent：自主决策
from langchain.agents import create_react_agent

# Agent根据问题自主决定：
# - 需要翻译吗？ → 调用翻译工具
# - 需要搜索吗？ → 调用搜索工具
# - 需要计算吗？ → 调用计算工具
agent = create_react_agent(llm, tools, prompt)

# 使用场景判断：

✅ 使用Chain：
# 1. 流程固定
"读取CSV → 计算平均值 → 生成报告"
# 步骤明确，不需要决策

# 2. 简单任务
# 2-3个步骤，按顺序执行

# 3. 可预测性强
# 每次输入都执行相同的流程

# 示例：数据处理流程
data_chain = (
    load_data
    | clean_data
    | transform_data
    | save_data
)

✅ 使用Agent：
# 1. 需要推理和决策
"分析这个问题，决定使用哪些工具解决"
# Agent需要思考、判断、选择

# 2. 复杂多步骤任务
"研究某个主题 → 总结要点 → 生成报告"
# 步骤可能变化，需要灵活调整

# 3. 不确定需要哪些工具
"用户可能问任何问题，需要智能路由"

# 示例：智能助手
agent = create_react_agent(
    llm,
    tools=[search, calculator, python_repl, weather],
    prompt="你是全能助手，根据用户问题选择合适的工具"
)

# 决策流程：
任务固定？ → 是 → 用Chain
         → 否 → 用Agent

需要推理？ → 是 → 用Agent
         → 否 → 用Chain

步骤复杂？ → >3步 → 用Agent
         → ≤3步 → 用Chain

# 混合使用（推荐）：
# 在Agent内部使用Chain
def research_tool(query):
    """研究工具（内部使用Chain）"""
    return research_chain.invoke({"query": query})

# Agent决定何时使用
agent = create_react_agent(
    llm,
    tools=[research_tool, calculator, email_tool],
    prompt="根据问题智能选择工具"
)
```

### Q2: Agent的思考过程如何优化？如何避免无限循环？

**A:**

```python
# Agent优化策略：

# 1. 限制迭代次数
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=5,  # 最多5次思考-行动循环
    verbose=True
)

# 2. 设置执行时间限制
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_execution_time=60,  # 最多60秒
    verbose=True
)

# 3. 优化Prompt，明确停止条件
optimized_prompt = PromptTemplate.from_template("""
你是一个AI助手。

**重要**：
1. 每个行动前都要思考
2. 得到足够信息后立即给出最终答案
3. 不要重复使用相同的工具
4. 最多执行3-5次行动后就给出答案
5. 如果无法解决，明确说明原因

**可用工具**：
{tools}

**任务**：
{input}

{agent_scratchpad}
""")

# 4. 使用提前停止策略
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    early_stopping_method="force",  # 强制停止
    # 或 "generate"：让LLM生成最终答案
    verbose=True
)

# 5. 添加中间步骤检查
class SmartAgentExecutor(AgentExecutor):
    """智能Agent执行器"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.consecutive_errors = 0
        self.max_consecutive_errors = 2

    def _call(self, inputs, run_manager=None):
        """重写调用方法，添加检查逻辑"""

        # 监控执行
        for step in range(self.max_iterations):
            try:
                result = super()._call(inputs, run_manager)

                # 重置错误计数
                self.consecutive_errors = 0

                # 检查是否应该停止
                if self._should_stop(result):
                    break

            except Exception as e:
                self.consecutive_errors += 1

                # 连续错误太多，提前停止
                if self.consecutive_errors >= self.max_consecutive_errors:
                    return {
                        "output": f"执行失败，连续{self.consecutive_errors}次错误：{str(e)}"
                    }

        return result

    def _should_stop(self, intermediate_steps):
        """判断是否应该停止"""
        # 获取最近N步的观察结果
        recent_observations = [
            step[1] for step in intermediate_steps[-3:]
        ]

        # 如果连续得到相同的结果，停止
        if len(set(recent_observations)) <= 1:
            return True

        # 如果已经得到足够的信息，停止
        if len(intermediate_steps) >= 3:
            return True

        return False

# 6. 使用ReAct提示词优化
react_prompt = PromptTemplate.from_template("""
回答以下问题：

{tools}

使用以下格式：

Question: 输入问题
Thought: 思考要做什么
Action: 工具名称
Action Input: 工具输入
Observation: 工具输出
... (可以重复Thought/Action/Action Input/Observation多次)
Thought: 我现在知道最终答案了
Final Answer: 对原始问题的最终答案

开始！

Question: {input}
Thought: {agent_scratchpad}
""")

# 7. Agent类型选择

# ReAct Agent：适合探索性任务
# - 优点：思考过程透明
# - 缺点：可能比较慢
react_agent = create_react_agent(llm, tools, react_prompt)

# OpenAI Functions Agent：适合结构化任务
# - 优点：更快，更可靠
# - 缺点：思考过程不透明
functions_agent = create_openai_functions_agent(llm, tools, prompt)

# 8. 实际优化案例

# 问题：Agent陷入"搜索 → 观察 → 再搜索 → 再观察..."的循环

# 解决方案1：优化工具描述
search_tool = Tool(
    name="Search",
    func=search_func,
    description="""
    搜索互联网信息。
    重要：只有在确实需要新的、外部信息时才使用。
    如果上下文中已有相关信息，不要重复搜索。
    """
)

# 解决方案2：添加记忆
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# Agent会记住之前的搜索，避免重复

# 解决方案3：在Prompt中明确指示
prompt = PromptTemplate.from_template("""
**重要提醒**：
- 每个工具最多使用1次
- 优先使用已有信息
- 避免重复搜索相同内容
- 3次行动后必须给出答案

{tools}
...
""")

# 避免无限循环的最佳实践：
✅ 设置max_iterations（3-5次）
✅ 设置max_execution_time（30-60秒）
✅ 使用early_stopping_method
✅ 优化工具描述（避免重复使用）
✅ 添加记忆（记住之前的行动）
✅ 在Prompt中明确停止条件
✅ 监控执行过程（verbose=True）
✅ 使用Functions Agent（更可靠）
```

### Q3: 如何设计一个好的Tool？有哪些最佳实践？

**A:**

```python
# 工具设计的最佳实践：

# 1. 清晰的工具描述

# ❌ 不好的描述
bad_tool = Tool(
    name="Calculator",
    func=calculate,
    description="计算器"  # 太模糊
)

# ✅ 好的描述
good_tool = Tool(
    name="Calculator",
    func=calculate,
    description="""
    数学计算工具，用于执行各种数学运算。
    支持运算：加减乘除、平方根、幂运算、三角函数等
    输入格式：数学表达式字符串，例如 "2 + 2" 或 "sqrt(16)"
    输出格式：计算结果数值
    使用场景：需要进行精确的数学计算时
    注意：不要用于简单的计算，心算即可的计算不要使用此工具
    """
)

# 2. 定义输入Schema

from pydantic import BaseModel, Field

class SearchInput(BaseModel):
    """搜索输入"""
    query: str = Field(
        description="搜索关键词，2-10个字",
        min_length=2,
        max_length=10
    )
    num_results: int = Field(
        description="返回结果数量，默认5",
        default=5,
        ge=1,
        le=10
    )

search_tool = Tool(
    name="Search",
    func=search_func,
    description="搜索互联网信息",
    args_schema=SearchInput  # 提供验证和文档
)

# 3. 错误处理

def robust_tool_func(input: str) -> str:
    """健壮的工具函数"""
    try:
        # 验证输入
        if not input or len(input.strip()) == 0:
            return "错误：输入不能为空"

        # 执行逻辑
        result = perform_operation(input)

        # 验证输出
        if not result:
            return "未找到结果"

        return result

    except ValueError as e:
        return f"输入错误：{str(e)}"
    except Exception as e:
        return f"执行失败：{str(e)}"

# 4. 返回有用的信息

def get_weather(city: str) -> str:
    """获取天气信息"""
    data = fetch_weather(city)

    # ✅ 详细的返回信息
    return f"""
    城市：{city}
    天气：{data['weather']}
    温度：{data['temp']}度
    湿度：{data['humidity']}%
    风力：{data['wind']}级
    建议：{get_advice(data['weather'])}

    更新时间：{data['update_time']}
    """

# 5. 添加文档字符串

def calculate(expression: str) -> float:
    """
    计算数学表达式

    Args:
        expression (str): 数学表达式，如 "2 + 2" 或 "sqrt(16)"

    Returns:
        float: 计算结果

    Raises:
        ValueError: 表达式无效时

    Examples:
        >>> calculate("2 + 2")
        4.0
        >>> calculate("sqrt(16)")
        4.0
    """
    # 实现...

# 6. 工具组合和复用

# 基础工具
read_file_tool = Tool(
    name="ReadFile",
    func=read_file,
    description="读取文件内容"
)

write_file_tool = Tool(
    name="WriteFile",
    func=write_file,
    description="写入文件"
)

# 组合工具
def edit_file(filepath: str, edits: list) -> str:
    """编辑文件（组合工具）"""
    # 读取
    content = read_file(filepath)

    # 编辑
    for edit in edits:
        content = content.replace(edit['old'], edit['new'])

    # 写入
    write_file(filepath, content)

    return f"已编辑文件：{filepath}"

edit_tool = Tool(
    name="EditFile",
    func=edit_file,
    description="编辑文件内容，支持多次替换"
)

# 7. 工具版本管理

class ToolV1:
    """工具版本1"""
    def run(self, input: str) -> str:
        return f"V1: {input}"

class ToolV2(ToolV1):
    """工具版本2（改进版）"""
    def run(self, input: str) -> str:
        # 添加更多功能
        result = super().run(input)
        return f"{result} [V2改进]"

# 8. 工具测试

import unittest

class TestCalculatorTool(unittest.TestCase):
    """工具测试"""

    def test_basic_calculation(self):
        """测试基本计算"""
        result = calculate("2 + 2")
        self.assertEqual(result, 4.0)

    def test_invalid_input(self):
        """测试无效输入"""
        with self.assertRaises(ValueError):
            calculate("invalid")

    def test_division_by_zero(self):
        """测试除零错误"""
        with self.assertRaises(ZeroDivisionError):
            calculate("1 / 0")

# 9. 工具监控和日志

import logging
from functools import wraps

def log_tool_calls(tool_func):
    """装饰器：记录工具调用"""
    @wraps(tool_func)
    def wrapper(*args, **kwargs):
        logging.info(f"调用工具：{tool_func.__name__}")
        logging.info(f"参数：{args}, {kwargs}")

        try:
            result = tool_func(*args, **kwargs)
            logging.info(f"结果：{result}")
            return result
        except Exception as e:
            logging.error(f"错误：{e}")
            raise

    return wrapper

@log_tool_calls
def search(query: str) -> str:
    """带日志的搜索工具"""
    return perform_search(query)

# 工具设计检查清单：
[ ] 名称清晰简短（大驼峰）
[ ] 描述详细具体（包含使用场景）
[ ] 定义输入Schema（Pydantic）
[ ] 完善错误处理
[ ] 返回有用信息
[ ] 添加文档字符串
[ ] 编写单元测试
[ ] 添加日志记录
[ ] 考虑版本管理
[ ] 性能优化（缓存等）
```

### Q4: 多Agent协作如何实现？有哪些架构模式？

**A:**

```python
# 多Agent协作模式：

# 模式1：顺序协作（Sequential Collaboration）

class SequentialMultiAgent:
    """顺序多Agent系统"""

    def __init__(self):
        # Agent 1: 研究员
        self.researcher = self._create_researcher()

        # Agent 2: 写作员
        self.writer = self._create_writer()

        # Agent 3: 编辑
        self.editor = self._create_editor()

    def run(self, topic: str) -> dict:
        """顺序执行"""

        # Step 1: 研究员收集信息
        research = AgentExecutor(
            agent=self.researcher,
            tools=[search, wiki],
            verbose=False
        ).invoke({"input": f"研究主题：{topic}"})

        # Step 2: 写作员创作文章
        article = AgentExecutor(
            agent=self.writer,
            tools=[],
            verbose=False
        ).invoke({
            "input": f"""
            基于以下研究资料写文章：
            {research['output']}
            """
        })

        # Step 3: 编辑审核
        final = AgentExecutor(
            agent=self.editor,
            tools=[],
            verbose=False
        ).invoke({
            "input": f"""
            编辑以下文章：
            {article['output']}
            """
        })

        return {
            "research": research['output'],
            "article": article['output'],
            "final": final['output']
        }

# 模式2：竞争协作（Competitive Collaboration）

class CompetitiveMultiAgent:
    """竞争多Agent系统"""

    def __init__(self):
        # 多个Agent竞争生成最佳答案
        self.agents = [
            self._create_agent("保守策略"),
            self._create_agent("激进策略"),
            self._create_agent("平衡策略")
        ]

    def run(self, task: str) -> dict:
        """并行执行，选择最佳结果"""

        # 并行执行
        results = []
        for agent in self.agents:
            result = AgentExecutor(
                agent=agent,
                tools=[],
                verbose=False
            ).invoke({"input": task})
            results.append(result['output'])

        # 评估并选择最佳
        best_result = self._evaluate_and_select(results)

        return {
            "all_results": results,
            "best": best_result
        }

    def _evaluate_and_select(self, results):
        """评估并选择最佳结果"""
        # 简单示例：选择最长的结果
        return max(results, key=len)

# 模式3：分层协作（Hierarchical Collaboration）

class HierarchicalMultiAgent:
    """分层多Agent系统"""

    def __init__(self):
        # 管理Agent
        self.manager = self._create_manager()

        # 工作Agent
        self.workers = {
            "researcher": self._create_researcher(),
            "writer": self._create_writer(),
            "coder": self._create_coder()
        }

    def run(self, task: str) -> str:
        """分层执行"""

        # Step 1: 管理Agent分解任务
        plan = AgentExecutor(
            agent=self.manager,
            tools=[],
            verbose=False
        ).invoke({
            "input": f"""
            将任务分解为子任务，并分配给合适的Agent：
            任务：{task}

            可用Agent：
            - researcher: 研究员
            - writer: 写作员
            - coder: 程序员

            输出格式：
            1. Agent名称：任务描述
            2. Agent名称：任务描述
            ...
            """
        })

        # Step 2: 执行子任务
        sub_results = {}
        for line in plan['output'].split('\n'):
            if ':' in line:
                agent_name, subtask = line.split(':', 1)
                agent_name = agent_name.split('.')[1].strip()

                if agent_name in self.workers:
                    result = AgentExecutor(
                        agent=self.workers[agent_name],
                        tools=[],
                        verbose=False
                    ).invoke({"input": subtask})
                    sub_results[agent_name] = result['output']

        # Step 3: 管理Agent整合结果
        final = AgentExecutor(
            agent=self.manager,
            tools=[],
            verbose=False
        ).invoke({
            "input": f"""
            整合以下子任务的结果：
            {sub_results}

            生成最终的完整答案。
            """
        })

        return final['output']

# 模式4：讨论协作（Discussion Collaboration）

class DiscussionMultiAgent:
    """讨论多Agent系统"""

    def __init__(self, num_agents=3):
        self.agents = [
            self._create_agent(f"Agent{i+1}") for i in range(num_agents)
        ]
        self.moderator = self._create_moderator()

    def run(self, topic: str, max_rounds=3) -> dict:
        """多轮讨论"""

        discussion_history = []

        for round_num in range(max_rounds):
            print(f"\n=== 第{round_num+1}轮讨论 ===")

            # 每个Agent发表意见
            round_opinions = []
            for i, agent in enumerate(self.agents):
                prompt = f"""
                讨论主题：{topic}

                之前的讨论：
                {discussion_history}

                请发表你的意见（可以赞同、反驳或提出新观点）。
                """

                opinion = AgentExecutor(
                    agent=agent,
                    tools=[],
                    verbose=False
                ).invoke({"input": prompt})

                round_opinions.append({
                    "agent": f"Agent{i+1}",
                    "opinion": opinion['output']
                })

            # 记录本轮讨论
            discussion_history.extend([
                f"{op['agent']}: {op['opinion']}\n"
                for op in round_opinions
            ])

        # 主持人总结
        summary = AgentExecutor(
            agent=self.moderator,
            tools=[],
            verbose=False
        ).invoke({
            "input": f"""
            总结以下多轮讨论的结论：
            {discussion_history}

            给出最终答案。
            """
        })

        return {
            "discussion": discussion_history,
            "summary": summary['output']
        }

# 模式5：LangGraph Agent（现代方案）

from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    """Agent状态"""
    task: str
    research_result: str
    article: str
    final_output: str

def research_node(state):
    """研究节点"""
    result = research_executor.invoke({"input": state["task"]})
    return {"research_result": result['output']}

def write_node(state):
    """写作节点"""
    result = writer_executor.invoke({
        "input": f"基于研究写文章：{state['research_result']}"
    })
    return {"article": result['output']}

def edit_node(state):
    """编辑节点"""
    result = editor_executor.invoke({
        "input": f"编辑文章：{state['article']}"
    })
    return {"final_output": result['output']}

# 创建图
workflow = StateGraph(AgentState)

# 添加节点
workflow.add_node("researcher", research_node)
workflow.add_node("writer", write_node)
workflow.add_node("editor", edit_node)

# 添加边
workflow.set_entry_point("researcher")
workflow.add_edge("researcher", "writer")
workflow.add_edge("writer", "editor")
workflow.add_edge("editor", END)

# 编译图
app = workflow.compile()

# 执行
result = app.invoke({"task": "研究AI Agent"})

# 多Agent架构选择指南：

# 顺序协作 → 任务流程明确
# 竞争协作 → 需要多个方案对比
# 分层协作 → 复杂任务需要分解
# 讨论协作 → 需要多角度思考
# LangGraph → 复杂的状态转换
```

### Q5: Agent的执行成本如何优化？

**A:**

```python
# Agent成本优化策略：

# 1. 使用更便宜的模型

# ❌ 保守方案：全部用GPT-4
llm = ChatOpenAI(model="gpt-4", temperature=0)

# ✅ 优化方案：分层使用
class CostOptimizedAgent:
    """成本优化Agent"""

    def __init__(self):
        # 决策层用G-4（关键决策）
        self.planner_llm = ChatOpenAI(model="gpt-4", temperature=0)

        # 执行层用GPT-3.5（常规任务）
        self.worker_llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

    def run(self, task):
        # Step 1: 用G-4规划（高成本但准确）
        plan = self.planner_llm.invoke(f"制定计划：{task}")

        # Step 2-N: 用GPT-3.5执行（低成本）
        for step in parse_plan(plan):
            result = self.worker_llm.invoke(step)
            # ...

        return result

# 2. 缓存工具结果

from functools import lru_cache

@lru_cache(maxsize=100)
def cached_search(query: str) -> str:
    """带缓存的搜索"""
    return perform_search(query)

# 相同查询直接返回缓存

# 3. 智能工具选择

class SmartAgent:
    """智能Agent"""

    def __init__(self):
        self.tools = {
            "cheap": [simple_calc, basic_search],  # 便宜的工具
            "expensive": [complex_search, web_scraper]  # 昂贵的工具
        }

    def select_tool(self, task):
        """智能选择工具"""

        # 简单任务用便宜工具
        if self._is_simple_task(task):
            return self.tools["cheap"]

        # 复杂任务用昂贵工具
        if self._is_complex_task(task):
            return self.tools["expensive"]

        # 默认用便宜工具
        return self.tools["cheap"]

    def _is_simple_task(self, task):
        """判断是否简单任务"""
        # 规则：关键词匹配
        simple_keywords = ["计算", "加", "减"]
        return any(kw in task for kw in simple_keywords)

# 4. 批量处理

class BatchAgent:
    """批量Agent"""

    def execute_batch(self, tasks):
        """批量执行任务"""

        # 收集相似任务
        batches = self._group_similar_tasks(tasks)

        results = []
        for batch in batches:
            # 批量调用（节省API调用次数）
            batch_result = self._batch_process(batch)
            results.extend(batch_result)

        return results

    def _group_similar_tasks(self, tasks):
        """分组相似任务"""
        # 简单示例：按关键词分组
        groups = {}
        for task in tasks:
            key = self._extract_key(task)
            if key not in groups:
                groups[key] = []
            groups[key].append(task)

        return list(groups.values())

# 5. 提前停止策略

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=3,  # 限制迭代次数
    max_execution_time=30,  # 限制执行时间
    early_stopping_method="force"  # 提前停止
)

# 6. 使用流式输出（节省首字节时间）

async def stream_agent(agent, query):
    """流式Agent输出"""
    async for chunk in agent.astream({"input": query}):
        print(chunk, end="", flush=True)
    # 用户可以更早看到结果

# 7. 优化Prompt长度

# ❌ 冗长的Prompt
long_prompt = """
你是AI智能体，具有多年经验...
（500字的描述）

工具列表：
（每个工具100字的描述）

任务：...
"""

# ✅ 简洁的Prompt
short_prompt = """
你是AI助手。

工具：
{tools}

任务：{input}
"""

# 节省Token，降低成本

# 8. 监控和分析成本

class AgentCostMonitor:
    """Agent成本监控"""

    def __init__(self):
        self.usage_log = []

    def log_execution(self, agent_name, input_tokens, output_tokens, model):
        """记录执行"""
        cost = calculate_cost(input_tokens, output_tokens, model)

        self.usage_log.append({
            "timestamp": datetime.now(),
            "agent": agent_name,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "model": model,
            "cost": cost
        })

    def get_summary(self):
        """获取汇总"""
        return {
            "total_cost": sum(log["cost"] for log in self.usage_log),
            "total_tokens": sum(
                log["input_tokens"] + log["output_tokens"]
                for log in self.usage_log
            ),
            "by_agent": group_by_agent(self.usage_log),
            "by_model": group_by_model(self.usage_log)
        }

# 成本优化总结：
✅ 分层使用模型（G-4规划，GPT-3.5执行）
✅ 缓存工具结果
✅ 智能工具选择
✅ 批量处理任务
✅ 限制迭代次数
✅ 使用流式输出
✅ 优化Prompt长度
✅ 监控成本

# 预期优化效果：
# - 简单优化：节省30-50%
# - 深度优化：节省50-70%
```

### Q6: Agent如何处理长任务？如何记忆中间结果？

**A:**

```python
# Agent长任务处理和记忆管理：

# 1. 使用Memory组件

from langchain.memory import (
    ConversationBufferMemory,
    ConversationSummaryMemory,
    ConversationTokenBufferMemory
)

# 方案1：缓冲记忆（保存所有历史）
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
    output_key="output"  # 保存输出
)

# 方案2：摘要记忆（压缩历史）
summary_memory = ConversationSummaryMemory(
    llm=ChatOpenAI(model="gpt-3.5-turbo"),
    memory_key="chat_history",
    return_messages=True,
    max_token_limit=1000  # 超过1000 token就自动摘要
)

# 方案3：Token缓冲记忆（限制长度）
token_memory = ConversationTokenBufferMemory(
    llm=ChatOpenAI(model="gpt-3.5-turbo"),
    max_token_limit=2000,  # 只保留最近2000 token
    memory_key="chat_history",
    return_messages=True
)

# 2. 检查点机制（Checkpointing）

class CheckpointAgent:
    """带检查点的Agent"""

    def __init__(self, checkpoint_dir="./checkpoints"):
        self.checkpoint_dir = checkpoint_dir
        os.makedirs(checkpoint_dir, exist_ok=True)

    def save_checkpoint(self, step, state):
        """保存检查点"""
        checkpoint_path = f"{self.checkpoint_dir}/step_{step}.json"
        with open(checkpoint_path, 'w') as f:
            json.dump(state, f, ensure_ascii=False)
        print(f"✅ 检查点已保存：{checkpoint_path}")

    def load_checkpoint(self, step):
        """加载检查点"""
        checkpoint_path = f"{self.checkpoint_dir}/step_{step}.json"
        if os.path.exists(checkpoint_path):
            with open(checkpoint_path, 'r') as f:
                return json.load(f)
        return None

    def run_with_checkpoints(self, task, checkpoint_interval=3):
        """带检查点的执行"""

        state = {"task": task, "step": 0}

        for i in range(10):  # 最多10步
            try:
                # 执行一步
                result = self._execute_step(state)
                state["result"] = result
                state["step"] = i + 1

                # 定期保存检查点
                if (i + 1) % checkpoint_interval == 0:
                    self.save_checkpoint(i + 1, state)

                # 检查是否完成
                if self._is_done(result):
                    break

            except Exception as e:
                print(f"❌ 错误：{e}")
                # 从最近的检查点恢复
                last_checkpoint = (i // checkpoint_interval) * checkpoint_interval
                state = self.load_checkpoint(last_checkpoint)
                print(f"🔄 从检查点 {last_checkpoint} 恢复")

        return state

# 3. 任务分解

class TaskDecompositionAgent:
    """任务分解Agent"""

    def decompose_task(self, complex_task):
        """分解复杂任务"""

        # Step 1: 规划子任务
        plan = self.llm.invoke(f"""
        将以下任务分解为多个子任务：
        {complex_task}

        输出格式：
        1. [子任务1]
        2. [子任务2]
        3. [子任务3]
        ...
        """)

        subtasks = parse_subtasks(plan)

        # Step 2: 依次执行子任务
        results = []
        for i, subtask in enumerate(subtasks):
            print(f"\n执行子任务 {i+1}/{len(subtasks)}: {subtask}")

            result = self.agent_executor.invoke({"input": subtask})
            results.append({
                "subtask": subtask,
                "result": result['output']
            })

            # 保存中间结果
            self._save_intermediate_result(i, result)

        # Step 3: 整合结果
        final = self.llm.invoke(f"""
        整合以下子任务的结果：
        {results}

        生成最终的完整答案。
        """)

        return final

    def _save_intermediate_result(self, step, result):
        """保存中间结果"""
        with open(f"intermediate_{step}.json", 'w') as f:
            json.dump(result, f, ensure_ascii=False)

# 4. 状态持久化

class PersistentAgent:
    """持久化Agent"""

    def __init__(self, state_file="agent_state.json"):
        self.state_file = state_file
        self.state = self._load_state()

    def _load_state(self):
        """加载状态"""
        if os.path.exists(self.state_file):
            with open(self.state_file, 'r') as f:
                return json.load(f)
        return {"history": [], "knowledge": {}}

    def _save_state(self):
        """保存状态"""
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, ensure_ascii=False)

    def run(self, task):
        """运行（带状态持久化）"""

        # 添加到历史
        self.state["history"].append({
            "timestamp": datetime.now().isoformat(),
            "task": task
        })

        # 执行任务
        result = self.agent_executor.invoke({"input": task})

        # 更新知识库
        self.state["knowledge"][task] = result['output']

        # 持久化
        self._save_state()

        return result

# 5. 长上下文管理

class LongContextAgent:
    """长上下文Agent"""

    def __init__(self):
        self.recent_memory = ConversationBufferWindowMemory(k=3)
        self.summary_memory = ConversationSummaryMemory(
            llm=ChatOpenAI(),
            max_token_limit=500
        )

    def run(self, query):
        """运行（双记忆机制）"""

        # 获取最近的对话
        recent_context = self.recent_memory.load_memory_variables({})

        # 获取历史摘要
        summary_context = self.summary_memory.load_memory_variables({})

        # 组合上下文
        full_context = f"""
        历史摘要：
        {summary_context.get('history', '无')}

        最近对话：
        {recent_context.get('history', '无')}
        """

        # 执行
        result = self.agent_executor.invoke({
            "input": f"上下文：{full_context}\n问题：{query}"
        })

        # 更新记忆
        self.recent_memory.save_context(
            {"input": query},
            {"output": result['output']}
        )

        # 定期更新摘要
        if len(self.recent_memory.chat_memory.messages) >= 5:
            self.summary_memory.save_context(
                {"input": "总结最近对话"},
                {"output": summarize_messages(self.recent_memory.chat_memory.messages)}
            )
            self.recent_memory.clear()

        return result

# 长任务处理最佳实践：
✅ 使用合适的Memory（Buffer, Summary, Token）
✅ 实现检查点机制（故障恢复）
✅ 分解复杂任务（逐步执行）
✅ 持久化状态（防止丢失）
✅ 双层记忆（近期+摘要）
✅ 定期清理（控制成本）
✅ 进度显示（用户体验）
```

### Q7: Agent安全性如何保障？如何防止恶意使用？

**A:**

```python
# Agent安全保障措施：

# 1. 工具权限控制

class SecureTool(Tool):
    """安全工具基类"""

    def __init__(self, *args, **kwargs):
        # 添加安全检查
        self.allowed_users = kwargs.pop('allowed_users', [])
        self.max_calls_per_minute = kwargs.pop('max_calls_per_minute', 10)
        self.call_count = 0
        self.last_reset = datetime.now()

        super().__init__(*args, **kwargs)

    def _check_permissions(self, user):
        """检查权限"""
        if self.allowed_users and user not in self.allowed_users:
            raise PermissionError(f"用户 {user} 无权使用此工具")

    def _check_rate_limit(self):
        """检查速率限制"""
        now = datetime.now()
        if (now - self.last_reset).seconds >= 60:
            self.call_count = 0
            self.last_reset = now

        if self.call_count >= self.max_calls_per_minute:
            raise RateLimitError("超过速率限制")

        self.call_count += 1

    def run(self, tool_input, user="default"):
        """运行（带安全检查）"""
        self._check_permissions(user)
        self._check_rate_limit()
        return super().run(tool_input)

# 2. 输入验证和清理

def validate_input(input_str, max_length=1000):
    """验证输入"""

    # 长度限制
    if len(input_str) > max_length:
        raise ValueError(f"输入过长，最大{max_length}字符")

    # 危险字符检测
    dangerous_patterns = [
        r'\.\./',  # 路径遍历
        r'<script>',  # XSS
        r'DROP TABLE',  # SQL注入
        r'__import__',  # Python危险代码
    ]

    for pattern in dangerous_patterns:
        if re.search(pattern, input_str, re.IGNORECASE):
            raise ValueError(f"检测到危险输入：{pattern}")

    return input_str

# 3. 工具沙箱执行

class SandboxedPythonTool:
    """沙箱化的Python执行工具"""

    def __init__(self):
        # 限制可用的模块和函数
        self.allowed_modules = ['math', 'random', 'datetime']
        self.max_execution_time = 5
        self.max_memory = 100 * 1024 * 1024  # 100MB

    def execute(self, code):
        """在沙箱中执行代码"""

        # 创建受限的globals
        safe_globals = {
            '__builtins__': {
                'print': print,
                'range': range,
                'len': len,
                # 只添加必要的内置函数
            }
        }

        # 添加允许的模块
        for module in self.allowed_modules:
            safe_globals[module] = __import__(module)

        try:
            # 使用资源限制
            import resource
            resource.setrlimit(
                resource.RLIMIT_AS,
                (self.max_memory, self.max_memory)
            )

            # 执行代码
            with timeout(self.max_execution_time):
                exec(code, safe_globals, {})

        except TimeoutError:
            return "执行超时"
        except MemoryError:
            return "内存超限"
        except Exception as e:
            return f"执行错误：{str(e)}"

# 4. 输出过滤

def filter_output(output):
    """过滤输出"""
    # 移除敏感信息
    sensitive_patterns = [
        (r'password["\']?\s*[:=]\s*["\']?[\w]+', '***'),
        (r'api_key["\']?\s*[:=]\s*["\']?[\w]+', '***'),
        (r'token["\']?\s*[:=]\s*["\']?[\w]+', '***'),
    ]

    filtered = output
    for pattern, replacement in sensitive_patterns:
        filtered = re.sub(pattern, replacement, filtered, flags=re.IGNORECASE)

    return filtered

# 5. 审计日志

class AgentAuditor:
    """Agent审计器"""

    def __init__(self, log_file="agent_audit.log"):
        self.log_file = log_file

    def log_action(self, user, agent, action, input_data, output_data):
        """记录操作"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "user": user,
            "agent": agent,
            "action": action,
            "input": hash(input_data),  # 哈希保护隐私
            "output": hash(output_data) if output_data else None,
            "success": True
        }

        with open(self.log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')

    def analyze_logs(self):
        """分析日志（检测异常）"""
        # 检测异常模式
        # - 频繁的失败操作
        # - 异常大量的资源使用
        # - 可疑的访问模式
        pass

# 6. 内容策略检查

class ContentPolicyChecker:
    """内容策略检查器"""

    def __init__(self):
        # 定义禁止的内容类型
        self.forbidden_content = {
            "violence": ["暴力", "伤害", "攻击"],
            "illegal": ["非法", "违法", "犯罪"],
            "adult": ["色情", "成人内容"],
        }

    def check_input(self, text):
        """检查输入是否符合策略"""
        for category, keywords in self.forbidden_content.items():
            for keyword in keywords:
                if keyword in text:
                    raise ContentPolicyError(
                        f"输入包含{category}内容：{keyword}"
                    )

        return True

    def check_output(self, text):
        """检查输出是否符合策略"""
        # 同样检查输出
        return self.check_input(text)

# 7. 使用LangChain的安全特性

from langchain.callbacks import BaseCallbackHandler

class SecurityCallbackHandler(BaseCallbackHandler):
    """安全回调处理器"""

    def __init__(self):
        self.tool_calls = []

    def on_tool_start(self, serialized, input_str, **kwargs):
        """工具调用开始"""
        print(f"[安全] 工具调用：{serialized['name']}")
        print(f"[安全] 输入：{input_str}")

        # 检查是否是危险工具
        if serialized['name'] in ['Python_REPL', 'Shell']:
            print(f"[警告] 危险工具调用：{serialized['name']}")

    def on_tool_end(self, serialized, output, **kwargs):
        """工具调用结束"""
        print(f"[安全] 输出：{output[:100]}...")  # 只记录前100字符

# 使用安全回调
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    callbacks=[SecurityCallbackHandler()],
    verbose=True
)

# Agent安全最佳实践：
✅ 工具权限控制
✅ 输入验证和清理
✅ 沙箱执行（代码执行）
✅ 输出过滤（敏感信息）
✅ 审计日志（可追溯）
✅ 内容策略检查
✅ 速率限制（防止滥用）
✅ 用户认证和授权
✅ 定期安全审计
✅ 隔离部署（Docker容器）
```

### Q8: Agent的调试和监控如何实现？

**A:**

```python
# Agent调试和监控：

# 1. 详细日志

import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('agent.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('Agent')

# 在Agent中使用
class LoggedAgent:
    """带日志的Agent"""

    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)

    def run(self, task):
        self.logger.info(f"开始执行任务：{task}")

        try:
            result = self._execute(task)
            self.logger.info(f"任务完成，结果：{result}")
            return result

        except Exception as e:
            self.logger.error(f"执行失败：{e}", exc_info=True)
            raise

# 2. 性能监控

import time
from contextlib import contextmanager

@contextmanager
def timer(name):
    """计时器上下文管理器"""
    start = time.time()
    yield
    elapsed = time.time() - start
    print(f"{name} 耗时：{elapsed:.2f}秒")

class MonitoredAgent:
    """监控的Agent"""

    def run(self, task):
        with timer("Agent执行"):
            # 每个工具调用也计时
            with timer("工具调用"):
                tool_result = self.tools[0].run(task)

            with timer("LLM调用"):
                llm_result = self.llm.invoke(tool_result)

        return llm_result

# 3. 中间步骤追踪

from langchain.schema import AgentAction, AgentFinish

class TracingAgentExecutor(AgentExecutor):
    """追踪Agent执行"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.execution_trace = []

    def _take_next_step(self, *args, **kwargs):
        """重写：追踪每一步"""

        # 记录开始
        step_start = time.time()
        self.execution_trace.append({
            "step": len(self.execution_trace) + 1,
            "start_time": step_start
        })

        # 执行
        result = super()._take_next_step(*args, **kwargs)

        # 记录结束
        step_end = time.time()
        self.execution_trace[-1].update({
            "end_time": step_end,
            "duration": step_end - step_start,
            "action": result[0] if isinstance(result[0], AgentAction) else None,
            "observation": result[1] if len(result) > 1 else None
        })

        return result

    def get_execution_trace(self):
        """获取执行轨迹"""
        return self.execution_trace

# 4. 可视化调试

from langchain.visualize import AgentExecutorVisualization

# 使用LangSmith进行可视化
# 需要设置环境变量：LANGCHAIN_TRACING_V2=true
# 然后在 https://smith.langchain.com 查看可视化

# 5. 自定义回调

from langchain.callbacks.base import BaseCallbackHandler

class DebugCallbackHandler(BaseCallbackHandler):
    """调试回调处理器"""

    def __init__(self):
        self.colors = {
            'input': '\033[94m',  # 蓝色
            'output': '\033[92m',  # 绿色
            'error': '\033[91m',  # 红色
            'end': '\033[0m'
        }

    def on_agent_action(self, action, **kwargs):
        """Agent行动"""
        color = self.colors['input']
        print(f"{color}Action: {action.tool}{self.colors['end']}")
        print(f"{color}Input: {action.tool_input[:100]}{self.colors['end']}")

    def on_tool_end(self, output, **kwargs):
        """工具结束"""
        color = self.colors['output']
        print(f"{color}Output: {str(output)[:100]}{self.colors['end']}")

    def on_agent_finish(self, finish, **kwargs):
        """Agent完成"""
        color = self.colors['output']
        print(f"{color}Final Answer: {finish.return_values['output'][:100]}{self.colors['end']}")

# 使用调试回调
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    callbacks=[DebugCallbackHandler()],
    verbose=True
)

# 6. 性能指标收集

class AgentMetrics:
    """Agent指标收集器"""

    def __init__(self):
        self.metrics = {
            "total_runs": 0,
            "successful_runs": 0,
            "failed_runs": 0,
            "average_duration": 0,
            "tool_usage": {},
            "llm_calls": 0,
            "total_tokens": 0
        }

    def record_run(self, duration, success, tools_used, tokens):
        """记录一次运行"""
        self.metrics["total_runs"] += 1
        if success:
            self.metrics["successful_runs"] += 1
        else:
            self.metrics["failed_runs"] += 1

        # 更新平均耗时
        n = self.metrics["total_runs"]
        self.metrics["average_duration"] = (
            (self.metrics["average_duration"] * (n-1) + duration) / n
        )

        # 记录工具使用
        for tool in tools_used:
            self.metrics["tool_usage"][tool] = \
                self.metrics["tool_usage"].get(tool, 0) + 1

        # 记录Token使用
        self.metrics["llm_calls"] += 1
        self.metrics["total_tokens"] += tokens

    def get_report(self):
        """获取报告"""
        success_rate = (
            self.metrics["successful_runs"] / self.metrics["total_runs"] * 100
            if self.metrics["total_runs"] > 0 else 0
        )

        return f"""
        Agent性能报告：
        - 总运行次数：{self.metrics['total_runs']}
        - 成功率：{success_rate:.1f}%
        - 平均耗时：{self.metrics['average_duration']:.2f}秒
        - LLM调用次数：{self.metrics['llm_calls']}
        - 总Token数：{self.metrics['total_tokens']}
        - 工具使用统计：{self.metrics['tool_usage']}
        """

# Agent调试和监控最佳实践：
✅ 详细日志记录
✅ 性能指标收集
✅ 中间步骤追踪
✅ 可视化调试（LangSmith）
✅ 自定义回调处理
✅ 错误追踪和分析
✅ 定期审查日志
✅ 设置告警阈值
```

---

## 学习清单

检查你掌握了以下技能：

### 基础概念 ✅

- [ ] 理解Agent vs Chain的区别
- [ ] 掌握Agent的核心能力（思考、行动、观察）
- [ ] 了解Agent的工作流程
- [ ] 能够识别Agent的应用场景
- [ ] 理解ReAct推理模式

### 核心组件 ✅

- [ ] 会定义和使用Tools
- [ ] 掌握工具描述的编写
- [ ] 理解Structured Tool的使用
- [ ] 能够创建自定义工具
- [ ] 掌握工具的参数验证

### Agent类型 ✅

- [ ] 理解ReAct Agent的原理
- [ ] 会使用OpenAI Functions Agent
- [ ] 了解不同Agent的适用场景
- [ ] 能够选择合适的Agent类型

### 实战能力 ✅

- [ ] 能够构建代码助手Agent
- [ ] 能够构建数据分析Agent
- [ ] 能够构建研究助手Agent
- [ ] 理解多Agent协作模式
- [ ] 能够优化Agent性能

### 高级技能 ✅

- [ ] 掌握Agent的记忆管理
- [ ] 理解Agent的优化技巧
- [ ] 能够处理长任务
- [ ] 了解Agent安全性保障
- [ ] 会调试和监控Agent

### 最佳实践 ✅

- [ ] 知道如何设计好的工具
- [ ] 理解成本优化方法
- [ ] 掌握避免无限循环的技巧
- [ ] 能够实现多Agent协作
- [ ] 了解生产级Agent的架构
- [ ] 会进行Agent的安全防护

---

## 进阶练习

### 练习1：构建全能个人助理

**任务**：创建一个多功能的个人助理Agent

**功能要求**：
1. 日程管理（查询、添加、删除日程）
2. 邮件管理（发送、读取、搜索邮件）
3. 天气查询和提醒
4. 任务清单（添加、完成、查看任务）
5. 智能问答（搜索、计算、翻译）

**技术要求**：
- 使用多个专用工具
- 实现记忆功能
- 添加错误处理
- 提供友好的交互界面

### 练习2：实现自动化工作流Agent

**任务**：构建工作流自动化Agent

**场景示例**：
- 每天早上自动生成任务优先级列表
- 定时检查邮件并分类
- 自动生成工作报告
- 监控项目进度并预警

**技术要求**：
- 定时任务执行
- 多步骤自动化
- 条件判断和分支
- 异常处理和重试

### 练习3：构建代码审查Agent

**任务**：创建自动代码审查Agent

**功能**：
1. 拉取代码变更
2. 分析代码质量
3. 检查安全问题
4. 生成审查报告
5. 提供改进建议

**技术要求**：
- Git集成
- 静态代码分析
- 安全扫描
- 报告生成

### 练习4：实现智能客服Agent群

**任务**：构建多Agent协作的客服系统

**Agent分工**：
- 迎宾Agent（问候和分类）
- 查询Agent（信息查询）
- 投诉Agent（问题处理）
- 转人工Agent（升级处理）
- 跟进Agent（满意度回访）

**技术要求**：
- 多Agent协作
- 对话路由
- 知识库集成
- 工单系统对接

### 练习5：开发学习辅助Agent

**任务**：个性化学习助手Agent

**功能**：
1. 评估学生水平
2. 制定学习计划
3. 生成练习题
4. 批改作业
5. 提供学习建议

**技术要求**：
- 自适应学习
- 题库管理
- 进度追踪
- 个性化推荐

---

## 实战项目

### 项目1：智能DevOps助手

**目标**：自动化运维和开发工作流

**功能**：
- 代码部署自动化
- 日志分析和监控
- 故障诊断和恢复
- 性能优化建议
- CI/CD流程管理

**技术栈**：
- LangChain Agent
- Git/GitHub集成
- Docker/Kubernetes
- 监控系统（Prometheus）
- 通知系统（Slack/Email）

### 项目2：智能投资分析Agent

**目标**：辅助投资决策

**功能**：
- 实时行情查询
- 新闻和公告分析
- 技术指标计算
- 风险评估
- 投资建议生成

**技术要求**：
- 金融API集成
- 数据分析能力
- 风险模型
- 报告生成
- 预警系统

### 项目3：科研助手Agent系统

**目标**：辅助学术研究

**功能**：
- 文献检索和分析
- 实验数据分析
- 论文写作辅助
- 引文管理
- 研究趋势分析

**创新点**：
- 多源数据整合
- 知识图谱构建
- 自动发现研究空白
- 协作研究支持
- 跨语言文献分析

---

## 学习资源

### 推荐阅读

1. **LangChain Agent文档**
   - 官方文档
   - Agent概念
   - 最佳实践

2. **ReAct论文**
   - "ReAct: Synergizing Reasoning and Acting in Language Models"
   - 理论基础

3. **Agent框架对比**
   - LangChain Agents
   - AutoGPT
   - BabyAGI
   - CrewAI

### 实践平台

- **LangSmith**: Agent调试和监控
- **LangChain Hub**: 分享Agents和Tools
- **GitHub**: 开源Agent项目

### 社区资源

- **Discord**: LangChain社区
- **Reddit**: r/LangChain
- **Twitter**: @langchain

---

**恭喜完成AI学习之旅！** 🎉

你已经从零开始，系统学习了：
- ✅ OpenAI API基础
- ✅ LangChain框架
- ✅ Prompt Engineering
- ✅ RAG检索增强
- ✅ AI Agent开发

**下一步**：
1. 动手实践项目
2. 深入学习特定领域
3. 关注最新技术进展
4. 参与开源社区

**祝你在AI开发的道路上越走越远！** 🚀

---

**下一章：[实战项目 →](chapter-06)**
