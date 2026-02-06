---
title: AI Agent开发面试题
---

# AI Agent开发面试题

## Agent基础

### 什么是AI Agent？

AI Agent是能够感知环境、做出决策并执行行动的智能系统。

**Agent核心组件**：

```
┌─────────────────────────────────────────────┐
│               AI Agent架构                    │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────┐      ┌─────────┐              │
│  │  感知   │ -> │  规划   │              │
│  │Perception│  │ Planning│              │
│  └─────────┘      └─────────┘              │
│       │                │                    │
│       ↓                ↓                    │
│  ┌─────────┐      ┌─────────┐              │
│  │  记忆   │ <- │  执行   │              │
│  │ Memory  │      │ Action  │              │
│  └─────────┘      └─────────┘              │
│                             ↓               │
│                       ┌─────────┐           │
│                       │  工具   │           │
│                       │  Tools  │           │
│                       └─────────┘           │
└─────────────────────────────────────────────┘
```

### ReAct模式是什么？

ReAct（Reasoning + Acting）结合推理和行动。

```python
from langchain.agents import initialize_agent, Tool, AgentType
from langchain.llms import OpenAI

# 定义工具
tools = [
    Tool(
        name="Search",
        func=lambda q: search_api(q),
        description="搜索网络，输入查询"
    ),
    Tool(
        name="Calculator",
        func=lambda expr: eval(expr),
        description="计算数学表达式，输入表达式"
    ),
    Tool(
        name="Database",
        func=lambda query: db_query(query),
        description="查询数据库，输入SQL"
    )
]

# ReAct Agent
agent = initialize_agent(
    tools=tools,
    llm=OpenAI(temperature=0),
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# Agent会自动思考：
# Thought: 我需要搜索...
# Action: Search[...]
# Observation: ...
# Thought: 现在我需要计算...
# Action: Calculator[...]
result = agent.run("计算2023年中国的GDP并预测2024年增长率")
```

### 如何实现自定义Tool？

```python
from langchain.tools import BaseTool
from typing import Optional
from pydantic import BaseModel, Field

# 1. 定义输入schema
class CalculatorInput(BaseModel):
    expression: str = Field(description="数学表达式")

# 2. 实现Tool
class CalculatorTool(BaseTool):
    name = "calculator"
    description = "计算数学表达式"
    args_schema = CalculatorInput

    def _run(self, expression: str) -> str:
        """同步执行"""
        try:
            result = eval(expression)
            return str(result)
        except Exception as e:
            return f"Error: {e}"

    async def _arun(self, expression: str) -> str:
        """异步执行"""
        return self._run(expression)

# 3. 使用
calculator = CalculatorTool()
agent = initialize_agent(
    tools=[calculator],
    llm=OpenAI(temperature=0),
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION
)
```

## Agent类型

### 常见Agent类型？

| 类型 | 特点 | 适用场景 |
|------|------|----------|
| **ReAct** | 推理-行动循环 | 通用任务 |
| **Plan-and-Execute** | 先规划后执行 | 复杂多步骤 |
| **BabyAGI** | 任务分解+迭代 | 长期目标 |
| **AutoGPT** | 自主循环 | 完全自主 |
| **CrewAI** | 多Agent协作 | 团队任务 |

### Plan-and-Execute Agent？

```python
from langchain.chains import PlanAndExecute
from langchain.agents import load_tools
from langchain.llms import OpenAI

# 1. 创建planner（规划器）
model = OpenAI(temperature=0)
tools = load_tools(["serpapi", "llm-math"], llm=model)

planner = load_agent_executor(
    model,
    tools,
    verbose=True
)

# 2. 创建executor（执行器）
executor = initialize_agent(
    tools=tools,
    llm=model,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# 3. 组合
agent = PlanAndExecute(
    planner=planner,
    executor=executor,
    verbose=True
)

# Agent会：
# 1. 先规划整个任务步骤
# 2. 然后逐步执行每个步骤
result = agent.run("研究并总结最新的AI发展")
```

### 如何实现多Agent协作？

```python
from crewai import Agent, Task, Crew

# 1. 定义不同角色的Agent
researcher = Agent(
    role="研究员",
    goal="研究最新技术趋势",
    backstory="你是一位经验丰富的研究员",
    tools=[search_tool, scraper_tool],
    verbose=True
)

writer = Agent(
    role="作家",
    goal "撰写技术文章",
    backstory="你是一位技术写作专家",
    tools=[],
    verbose=True
)

editor = Agent(
    role="编辑",
    goal="审核并优化文章",
    backstory="你是一位资深编辑",
    tools=[],
    verbose=True
)

# 2. 定义任务
research_task = Task(
    description="研究RAG技术的最新进展",
    agent=researcher,
    expected_output="研究总结报告"
)

write_task = Task(
    description="基于研究撰写一篇技术文章",
    agent=writer,
    expected_output="完整的技术文章"
)

edit_task = Task(
    description="审核并优化文章",
    agent=editor,
    expected_output="最终版文章"
)

# 3. 组装团队
crew = Crew(
    agents=[researcher, writer, editor],
    tasks=[research_task, write_task, edit_task],
    verbose=True
)

# 4. 执行
result = crew.kickoff()
```

### BabyAGI实现？

```python
from langchain import OpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

class BabyAGI:
    def __init__(self, objective):
        self.objective = objective
        self.llm = OpenAI(temperature=0)
        self.task_list = []

    def create_tasks(self):
        """创建初始任务列表"""
        prompt = PromptTemplate(
            input_variables=["objective"],
            template="""
            目标：{objective}

            请将这个目标分解为3-5个子任务。
            每个任务应该具体、可执行。

            任务列表：
            """
        )

        tasks = self.llm(prompt.format(objective=self.objective))
        self.task_list = tasks.split("\n")
        return self.task_list

    def execute_task(self, task):
        """执行单个任务"""
        prompt = PromptTemplate(
            input_variables=["task"],
            template="""
            任务：{task}

            请完成这个任务。
            """
        )

        result = self.llm(prompt.format(task=task))
        return result

    def prioritize_tasks(self):
        """优先级排序"""
        prompt = PromptTemplate(
            input_variables=["tasks", "objective"],
            template="""
            目标：{objective}

            任务列表：
            {tasks}

            请按优先级重新排序这些任务。
            """
        )

        prioritized = self.llm(
            prompt.format(
                objective=self.objective,
                tasks="\n".join(self.task_list)
            )
        )

        self.task_list = prioritized.split("\n")

    def add_new_tasks(self, result):
        """根据结果添加新任务"""
        prompt = PromptTemplate(
            input_variables=["result", "objective"],
            template="""
            目标：{objective}

            当前任务完成结果：
            {result}

            基于结果，是否需要添加新的任务？
            如果需要，请列出。
            """
        )

        new_tasks = self.llm(
            prompt.format(
                objective=self.objective,
                result=result
            )
        )

        if new_tasks.strip():
            self.task_list.extend(new_tasks.split("\n"))

    def run(self, max_iterations=10):
        """运行BabyAGI"""
        self.create_tasks()

        for i in range(max_iterations):
            if not self.task_list:
                break

            # 取第一个任务
            task = self.task_list.pop(0)

            # 执行任务
            result = self.execute_task(task)

            # 生成新任务
            self.add_new_tasks(result)

            # 重新排序
            self.prioritize_tasks()

        return result

# 使用
baby_agi = BabyAGI("学习并掌握LangChain框架")
result = baby_agi.run(max_iterations=10)
```

## 记忆系统

### Agent记忆类型？

```python
from langchain.memory import (
    ConversationBufferMemory,
    ConversationBufferWindowMemory,
    ConversationSummaryMemory,
    VectorStoreMemory
)

# 1. 缓冲记忆 - 保存所有对话
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# 2. 窗口记忆 - 只保存最近N轮
window_memory = ConversationBufferWindowMemory(
    k=5,  # 保留最近5轮
    memory_key="chat_history",
    return_messages=True
)

# 3. 摘要记忆 - 定期总结
summary_memory = ConversationSummaryMemory(
    llm=OpenAI(temperature=0),
    memory_key="chat_history",
    return_messages=True
)

# 4. 向量记忆 - 检索相关记忆
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

vector_memory = VectorStoreMemory(
    vectorstore=Chroma.from_texts(
        ["记忆1", "记忆2", "记忆3"],
        embedding=OpenAIEmbeddings()
    ),
    memory_key="relevant_history",
    k=3  # 检索最相关的3条
)
```

### 如何实现长期记忆？

```python
from langchain.memory import VectorStoreRetrieverMemory
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# 创建向量存储
vectorstore = Chroma(
    collection_name="long_term_memory",
    embedding_function=OpenAIEmbeddings()
)

# 创建长期记忆
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 5}
)

long_term_memory = VectorStoreRetrieverMemory(
    retriever=retriever,
    memory_key="relevant_history"
)

# 保存重要信息
def save_memory(memory, content, metadata):
    """保存到长期记忆"""
    vectorstore.add_texts(
        texts=[content],
        metadatas=[metadata]
    )

# 使用
save_memory(
    long_term_memory,
    "用户偏好使用Python开发",
    {"type": "user_preference", "timestamp": "2024-01-01"}
)
```

### 实体记忆？

```python
from langchain.memory import ConversationEntityMemory

# 实体记忆自动提取和跟踪对话中的实体
entity_memory = ConversationEntityMemory(
    llm=OpenAI(temperature=0),
    memory_key="entity_history"
)

agent = initialize_agent(
    tools=tools,
    llm=OpenAI(temperature=0),
    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    memory=entity_memory,
    verbose=True
)

# 对话中自动识别实体
agent.run("我叫小明，是一名Python开发者")
# entity_memory会存储：{name: "小明", role: "Python开发者"}

agent.run("我推荐什么框架？")
# 会记住上下文，推荐Python相关框架
```

## Agent优化

### 如何减少Token消耗？

```python
# 1. 使用摘要代替完整历史
from langchain.memory import ConversationSummaryMemory

summary_memory = ConversationSummaryMemory(
    llm=OpenAI(temperature=0),
    max_token_limit=500  # 限制token数
)

# 2. 压缩工具描述
class CompactTool(Tool):
    """使用简短描述的工具"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 压缩描述
        self.description = self.description[:100]

# 3. 智能上下文选择
def select_relevant_context(query, all_context, max_contexts=3):
    """只选择最相关的上下文"""
    from sentence_transformers import CrossEncoder

    reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

    pairs = [[query, ctx] for ctx in all_context]
    scores = reranker.predict(pairs)

    # 选择top-k
    top_indices = sorted(
        range(len(scores)),
        key=lambda i: scores[i],
        reverse=True
    )[:max_contexts]

    return [all_context[i] for i in top_indices]
```

### 如何处理错误恢复？

```python
class RobustAgent:
    def __init__(self, tools, llm, max_retries=3):
        self.tools = tools
        self.llm = llm
        self.max_retries = max_retries

    def execute_with_retry(self, tool_name, tool_input):
        """带重试的执行"""
        tool = next(t for t in self.tools if t.name == tool_name)

        for attempt in range(self.max_retries):
            try:
                result = tool.run(tool_input)
                return result
            except Exception as e:
                if attempt == self.max_retries - 1:
                    # 最后一次失败，让LLM处理错误
                    return self.handle_error(tool_name, str(e))
                else:
                    # 重试前修正输入
                    tool_input = self.fix_input(
                        tool_name,
                        tool_input,
                        str(e)
                    )

    def handle_error(self, tool_name, error):
        """让LLM分析并处理错误"""
        prompt = f"""
        工具 {tool_name} 执行失败：{error}

        请提供替代方案或解释。
        """

        return self.llm(prompt)

    def fix_input(self, tool_name, tool_input, error):
        """修正输入"""
        prompt = f"""
        工具 {tool_name} 输入 {tool_input} 导致错误：{error}

        请修正输入。
        """

        return self.llm(prompt)
```

### 如何评估Agent性能？

```python
class AgentEvaluator:
    def __init__(self, agent):
        self.agent = agent
        self.metrics = {
            "success_rate": 0,
            "avg_steps": 0,
            "avg_tokens": 0,
            "tool_usage": {}
        }

    def evaluate(self, test_cases):
        """评估Agent在测试用例上的表现"""
        results = []

        for case in test_cases:
            # 记录指标
            steps = 0
            tokens = 0

            # 执行
            try:
                result = self.agent.run(case["input"])
                success = self.check_result(
                    result,
                    case["expected"]
                )
            except Exception as e:
                success = False
                result = str(e)

            results.append({
                "input": case["input"],
                "expected": case["expected"],
                "actual": result,
                "success": success,
                "steps": steps,
                "tokens": tokens
            })

        # 计算总体指标
        self.metrics["success_rate"] = sum(
            r["success"] for r in results
        ) / len(results)

        self.metrics["avg_steps"] = sum(
            r["steps"] for r in results
        ) / len(results)

        return results

    def check_result(self, actual, expected):
        """检查结果是否符合预期"""
        # 可以用LLM判断或规则判断
        if isinstance(expected, str):
            return expected.lower() in actual.lower()
        return actual == expected

# 使用
test_cases = [
    {
        "input": "计算1+1",
        "expected": "2"
    },
    {
        "input": "搜索最新的AI新闻",
        "expected": "包含AI相关信息"
    }
]

evaluator = AgentEvaluator(agent)
results = evaluator.evaluate(test_cases)
print(f"成功率: {evaluator.metrics['success_rate']}")
```

## 2024-2025大厂高频Agent面试题（20+题）

### Agent基础概念

21. **什么是Agent？和普通AI助手有什么区别？（字节、阿里必问）**
   ```python
   # Agent vs 普通AI助手：

   # 普通AI助手：
   # - 单次交互
   # - 被动响应
   # - 无记忆
   # - 无法执行操作

   # Agent：
   # - 持续任务
   # - 主动规划
   # - 有记忆
   # - 可以使用工具
   # - 可以自主学习

   # Agent核心特征：
   # 1. 自主性（Autonomy）：能自主决策
   # 2. 感知（Perception）：能感知环境
   # 3. 行动（Action）：能执行操作
   # 4. 推理（Reasoning）：能思考规划
   ```

22. **ReAct、Plan-and-Execute、BabyAGI的区别？（美团高频）**
   ```python
   # ReAct（Reasoning + Acting）：
   # - 逐步思考，逐步行动
   # - 迭代式推理
   # - 适合多步骤任务
   Thought: 我需要查询天气
   Action: Search[北京天气]
   Observation: 晴天 25度
   Thought: 现在我需要回复用户

   # Plan-and-Execute：
   # - 先制定完整计划
   # - 再逐步执行
   # - 不重新规划
   Plan:
   1. 搜索资料
   2. 整理信息
   3. 生成报告

   Execute:
   正在执行步骤1...

   # BabyAGI：
   # - 生成任务
   # - 执行任务
   # - 根据结果生成新任务
   # - 循环迭代
   # - 适合长期目标
   ```

### Agent框架

23. **LangChain vs AutoGPT vs CrewAI vs LangGraph？（阿里高频）**
   ```python
   # 对比：

   # LangChain：
   # 优点：
   # - 生态成熟
   # - 社区活跃
   # - 文档完善
   # 缺点：
   # - 学习曲线陡
   # - 过度设计

   # AutoGPT：
   # 优点：
   # - 完全自主
   # - 目标导向
   # 缺点：
   # - 成本高（大量API调用）
   # - 容易陷入循环
   # - 难以控制

   # CrewAI：
   # 优点：
   # - 多Agent协作
   # - 角色定义清晰
   # - 任务依赖管理
   # 缺点：
   # - 相对较新
   # - 社区较小

   # LangGraph：
   # 优点：
   # - 状态机可控
   # - 循环和条件
   # - 可视化调试
   # 缺点：
   # - 学习成本高

   # 选择建议：
   # - 简单任务：LangChain
   # - 多人协作：CrewAI
   # - 复杂流程：LangGraph
   # - 证明概念：AutoGPT
   ```

24. **什么是Multi-Agent系统？（字节、美团必问）**
   ```python
   from crewai import Agent, Task, Crew

   # Multi-Agent：多个Agent协作完成任务

   # 1. 定义不同角色的Agent
   researcher = Agent(
       role="研究员",
       goal="研究最新技术趋势",
       backstory="你是一位经验丰富的研究员",
       tools=[search_tool, scraper_tool],
       verbose=True
   )

   writer = Agent(
       role="作家",
       goal="撰写技术文章",
       backstory="你是一位技术写作专家",
       tools=[],
       verbose=True
   )

   editor = Agent(
       role="编辑",
       goal="审核并优化文章",
       backstory="你是一位资深编辑",
       tools=[],
       verbose=True
   )

   # 2. 定义任务依赖
   research_task = Task(
       description="研究RAG技术",
       agent=researcher
   )

   write_task = Task(
       description="撰写文章",
       agent=writer,
       context=[research_task]  # 依赖研究任务
   )

   edit_task = Task(
       description="审核文章",
       agent=editor,
       context=[write_task]  # 依赖写作任务
   )

   # 3. 创建Crew（团队）
   crew = Crew(
       agents=[researcher, writer, editor],
       tasks=[research_task, write_task, edit_task],
       verbose=True,
       process="sequential"  # 顺序执行
   )

   # 4. 执行
   result = crew.kickoff()

   # 优势：
   # - 专业化分工
   # - 并行处理
   # - 提高质量
   # - 降低单Agent复杂度
   ```

### Agent工具使用

25. **如何设计高效的工具系统？（阿里高频）**
   ```python
   # 工具设计原则：

   # 1. 单一职责
   # ❌ 不好：一个工具做多件事
   class DatabaseTool(BaseTool):
       name = "database"
       def _run(self, query, table, operation):
           # 做了太多事

   # ✅ 好：每个工具只做一件事
   class QueryTool(BaseTool):
       name = "query"
       description = "查询数据库"

   class InsertTool(BaseTool):
       name = "insert"
       description = "插入数据"

   # 2. 清晰的描述
   tool = Tool(
       name="search",
       func=search_api,
       # ❌ 不好：描述不清楚
       description="搜索",

       # ✅ 好：描述具体，包含使用场景
       description="搜索网络获取最新信息。"
                   "输入：搜索查询（字符串）"
                   "输出：搜索结果"
                   "使用场景：需要最新信息、新闻、实时数据"
   )

   # 3. 参数验证
   class CalculatorInput(BaseModel):
       expression: str = Field(
           ...,
           description="要计算的数学表达式，只包含数字和运算符"
       )

   # 4. 错误处理
   class SafeCalculator(BaseTool):
       def _run(self, expression: str) -> str:
           try:
               result = eval(expression)
               return str(result)
           except Exception as e:
               # 返回友好的错误信息
               return f"计算错误：{str(e)}"

   # 5. 工具分组
   # 按功能分组工具，便于Agent选择
   tools_by_category = {
       "database": [query_tool, insert_tool, update_tool],
       "file": [read_tool, write_tool, list_tool],
       "api": [get_tool, post_tool, put_tool]
   }
   ```

26. **如何处理工具调用失败？（字节、美团必问）**
   ```python
   # 错误恢复策略：

   # 1. 重试机制
   from tenacity import retry, stop_after_attempt, wait_exponential

   @retry(
       stop=stop_after_attempt(3),
       wait=wait_exponential(multiplier=1, min=2, max=10)
   )
   def robust_tool(input_data):
       return api_call(input_data)

   # 2. 降级策略
   class RobustAgent:
       def __init__(self):
           self.primary_tools = [api_tool]
           self.backup_tools = [search_tool]

       def run(self, query):
           try:
               return self.use_tools(query, self.primary_tools)
           except Exception:
               # 降级使用备用工具
               return self.use_tools(query, self.backup_tools)

   # 3. 自我修正
   def self_correct(agent, tool_name, error):
       # Agent分析错误并修正
       correction = agent.llm.predict(f"""
       工具 {tool_name} 执行失败：{error}

       请分析失败原因并提供修正方案。
       """)

       # 应用修正
       return agent.run_tool(tool_name, correction)

   # 4. 工具链验证
   def validate_tool_chain(agent, plan):
       """验证工具链是否可行"""
       for step in plan:
           tool = step.tool
           input_data = step.input

           # 模拟执行
           if not tool.validate(input_data):
               return False, f"工具 {tool.name} 输入无效"

       return True, "验证通过"
   ```

### Agent记忆系统

27. **长期记忆和短期记忆如何结合？（阿里、字节必问）**
   ```python
   from langchain.memory import (
       ConversationBufferMemory,  # 短期
       VectorStoreRetrieverMemory  # 长期
   )

   class HybridMemory:
       def __init__(self):
           # 短期记忆：最近几轮对话
           self.short_term = ConversationBufferMemory(
               k=5,  # 保留最近5轮
               return_messages=True
           )

           # 长期记忆：向量数据库
           self.long_term = VectorStoreRetrieverMemory(
               retriever=vectorstore.as_retriever(search_kwargs={"k": 3})
           )

       def add_important_info(self, content, metadata):
           """重要信息保存到长期记忆"""
           self.long_term.save_context(
               {"input": content},
               {"output": ""}
           )

       def get_context(self, query):
           """获取上下文"""
           # 1. 获取短期记忆
           recent = self.short_term.load_memory_variables({})

           # 2. 从长期记忆检索相关信息
           relevant = self.long_term.load_memory_variables(
               {"input": query}
           )

           # 3. 合并
           return {
               "recent": recent["history"],
               "relevant": relevant["history"]
           }

   # 使用场景：
   # 1. 用户偏好（长期）
   # 2. 最近对话（短期）
   # 3. 重要事件（长期）
   # 4. 临时上下文（短期）
   ```

28. **如何实现Agent的持续学习？（美团、阿里高频）**
   ```python
   # Agent持续学习策略：

   # 1. 从反馈中学习
   class LearningAgent:
       def __init__(self):
           self.success_examples = []
           self.failure_examples = []

       def learn_from_feedback(self, task, result, feedback):
           """从反馈中学习"""
           if feedback.positive:
               # 成功案例：提炼模式
               pattern = self.extract_pattern(task, result)
               self.success_examples.append(pattern)
           else:
               # 失败案例：分析原因
               mistake = self.analyze_mistake(task, result, feedback)
               self.failure_examples.append(mistake)

       def improve_behavior(self):
           """基于经验改进行为"""
           prompt = f"""
           基于以下成功和失败案例，总结如何改进Agent行为：

           成功案例：
           {self.success_examples[:5]}

           失败案例：
           {self.failure_examples[:5]}

           请总结3-5个改进建议。
           """

           suggestions = self.llm.predict(prompt)
           return suggestions

   # 2. 动态工具选择
   class AdaptiveToolSelector:
       def __init__(self, tools):
           self.tools = tools
           self.tool_performance = {
               tool.name: {"success": 0, "total": 0}
               for tool in tools
           }

       def select_tool(self, task):
           """根据历史性能选择工具"""
           # 计算每个工具的成功率
           performance = {
               name: metrics["success"] / metrics["total"]
               for name, metrics in self.tool_performance.items()
               if metrics["total"] > 0
           }

           # 选择成功率最高的工具
           best_tool = max(performance, key=performance.get)
           return self.get_tool(best_tool)

       def record_performance(self, tool_name, success):
           """记录工具性能"""
           self.tool_performance[tool_name]["total"] += 1
           if success:
               self.tool_performance[tool_name]["success"] += 1

   # 3. 知识库更新
   def update_knowledge_base(agent, new_knowledge):
       """更新Agent的知识库"""
       # 1. 提取关键信息
       key_info = agent.extract_knowledge(new_knowledge)

       # 2. 添加到向量数据库
       agent.vectorstore.add_texts([key_info])

       # 3. 更新工具描述
       for tool in agent.tools:
           tool.description = agent.enhance_description(
               tool.description,
               key_info
           )
   ```

### Agent规划与决策

29. **Agent如何进行任务规划？（字节、阿里必问）**
   ```python
   # 任务规划策略：

   # 1. 分解规划
   def decompose_task(agent, objective):
       """将复杂任务分解为子任务"""
       prompt = f"""
       目标：{objective}

       请将这个目标分解为可执行的子任务列表。
       每个子任务应该：
       1. 具体、可执行
       2. 有明确的输入输出
       3. 可以独立完成或依赖其他任务

       请以JSON格式输出任务列表。
       """

       plan = agent.llm.predict(prompt)
       return json.loads(plan)

   # 2. 依赖分析
   def analyze_dependencies(tasks):
       """分析任务依赖关系"""
       dependencies = {}
       for task in tasks:
           task_deps = []
           for other in tasks:
               if task.needs(other):
                   task_deps.append(other.id)
           dependencies[task.id] = task_deps
       return dependencies

   # 3. 拓扑排序
   def topological_sort(tasks, dependencies):
       """根据依赖关系排序任务"""
       visited = set()
       result = []

       def visit(task_id):
           if task_id in visited:
               return
           visited.add(task_id)

           for dep in dependencies.get(task_id, []):
               visit(dep)

           result.append(task_id)

       for task_id in dependencies:
           visit(task_id)

       return [tasks[tid] for tid in result]

   # 4. 动态规划
   class DynamicPlanner:
       def __init__(self, agent):
           self.agent = agent
           self.completed_tasks = set()
           self.current_plan = []

       def adjust_plan(self, feedback):
           """根据反馈调整计划"""
           if feedback.failed:
               # 任务失败，重新规划
               self.current_plan = self.replan(
                   self.current_plan,
                   feedback.error
               )
           elif feedback.suggestion:
               # 有更好方案，调整计划
               self.current_plan = self.optimize_plan(
                   self.current_plan,
                   feedback.suggestion
               )
   ```

30. **什么是Agent的反思机制？（美团高频）**
   ```python
   # 反思机制（Reflexion）

   class ReflexionAgent:
       def __init__(self, llm):
           self.llm = llm
           self.reflection_history = []

       def reflect(self, task, result, feedback):
           """反思任务执行过程"""
           prompt = f"""
           任务：{task}
           执行结果：{result}
           反馈：{feedback}

           请反思：
           1. 哪些地方做得好？
           2. 哪些地方可以改进？
           3. 下次如何做得更好？

           反思：
           """

           reflection = self.llm.predict(prompt)
           self.reflection_history.append({
               "task": task,
               "result": result,
               "reflection": reflection
           })

           return reflection

       def apply_reflection(self, new_task):
           """应用反思改进新任务"""
           # 获取相关反思
           relevant_reflections = self.get_relevant_reflections(new_task)

           # 基于反思生成改进方案
           prompt = f"""
           新任务：{new_task}

           相关经验：
           {relevant_reflections}

           基于以上经验，请提供执行建议。
           """

           advice = self.llm.predict(prompt)
           return advice

       def get_relevant_reflections(self, task):
           """获取相关的反思记录"""
           # 使用向量检索找到相关的反思
           reflections = [
               f"任务：r['task']}\n反思：{r['reflection']}"
               for r in self.reflection_history
           ]

           # 检索相关反思
           relevant = vectorstore.similarity_search(
               task,
               k=3
           )

           return relevant
   ```

### Agent评估与优化

31. **如何评估Agent的性能？（字节、阿里必问）**
   ```python
   # Agent评估指标：

   # 1. 任务成功率
   success_rate = success_count / total_count

   # 2. 平均步骤数
   avg_steps = sum(steps for task in tasks) / len(tasks)

   # 3. Token消耗
   avg_tokens = sum(tokens for task in tasks) / len(tasks)

   # 4. 工具使用准确率
   tool_accuracy = correct_tool_usage / total_tool_usage

   # 5. 响应时间
   avg_latency = sum(latency for task in tasks) / len(tasks)

   # 6. 幻觉率
   hallucination_rate = hallucination_count / total_count

   # 7. 用户满意度（如果有）
   satisfaction = sum(ratings) / len(ratings)

   # 评估框架
   class AgentEvaluator:
       def __init__(self, agent):
           self.agent = agent
           self.metrics = {}

       def evaluate(self, test_suite):
           """评估Agent"""
           results = []

           for test_case in test_suite:
               # 执行任务
               result = self.run_with_metrics(
                   test_case["input"],
                   test_case["expected"]
               )

               # 评估结果
               passed = self.check_result(
                   result,
                   test_case["expected"]
               )

               results.append({
                   "passed": passed,
                   "metrics": result["metrics"]
               })

           # 计算总体指标
           self.metrics = self.aggregate_metrics(results)
           return self.metrics

       def run_with_metrics(self, input_data, expected):
           """执行任务并记录指标"""
           import time
           start_time = time.time()

           steps = 0
           tokens = 0
           tool_calls = []

           # 包装Agent以记录指标
           result = self.agent.run(
               input_data,
               callbacks=[
                   MetricsCallback(
                       steps=steps,
                       tokens=tokens,
                       tool_calls=tool_calls
                   )
               ]
           )

           latency = time.time() - start_time

           return {
               "result": result,
               "metrics": {
                   "steps": steps,
                   "tokens": tokens,
                   "tool_calls": tool_calls,
                   "latency": latency
               }
           }
   ```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
