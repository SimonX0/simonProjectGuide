# 2026 Agent Skills 完全指南

## 本章导读

欢迎来到 **AI 应用开发的最前沿领域**！在第7章中，我们学习了基础的 AI Agent 概念和 LangChain/LangGraph 框架。本章将深入探索 **2026 年最重要的 Agent Skills 框架**，这些框架正在彻底改变我们构建多 Agent 系统的方式。

**2026 Agent Skills 框架**：
- **CrewAI** - 角色扮演型多 Agent 协作框架
- **AutoGen** (Microsoft) - 对话型多 Agent 框架
- **Semantic Kernel** (Microsoft) - 企业级 Agent 编排框架
- **LangGraph** - 复杂状态图 Agent 系统
- **Agent Protocol** - Agent 通信标准化协议

**学习目标**：
- 掌握多 Agent 协作的核心概念
- 学习 CrewAI 构建角色扮演型 Agent 团队
- 掌握 AutoGen 的对话模式
- 了解 Semantic Kernel 的企业级应用
- 构建第一个完整的 Multi-Agent 系统
- 理解 Agent 通信协议和最佳实践

**预计学习时间**：90分钟

**前置知识**：
- ✅ 已完成第7章：AI Agent
- ✅ 了解 LangChain 基础
- ✅ Python 3.9+ 编程能力

---

## 为什么需要多 Agent 系统？

### 单 Agent 的局限

```python
┌─────────────────────────────────────────────────┐
│         单 Agent vs 多 Agent 对比                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  单 Agent：                                     │
│  ❌ 难以同时处理多个专业任务                     │
│  ❌ 知识领域单一                                 │
│  ❌ 容易出现幻觉和错误                           │
│  ❌ 缺乏专业分工和协作                           │
│  ❌ 复杂任务容易迷失方向                         │
│                                                 │
│  多 Agent 系统：                                │
│  ✅ 专业化分工（研究员、工程师、测试员）          │
│  ✅ 协作决策（讨论、辩论、共识）                 │
│  ✅ 互相验证（减少错误和幻觉）                   │
│  ✅ 并行处理（提高效率）                         │
│  ✅ 更强的鲁棒性和可扩展性                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 实际案例对比

**场景：开发一个数据分析报告**

**单 Agent 方式**：
```python
# 一个 Agent 需要完成所有任务
agent.run("分析这份数据并生成报告")

# 流程：
# 1. 读取数据（可能格式不对）
# 2. 数据清洗（可能遗漏细节）
# 3. 统计分析（可能选择错误方法）
# 4. 可视化（可能图表不清晰）
# 5. 撰写报告（可能结构混乱）

# 问题：一个 Agent 难以在所有环节都达到专家水平
```

**多 Agent 方式**：
```python
# 专业的 Agent 团队
data_engineer = Agent(role="数据工程师", goal="清洗和准备数据")
analyst = Agent(role="数据分析师", goal="统计分析和洞察")
visualizer = Agent(role="可视化专家", goal="创建清晰图表")
writer = Agent(role="报告撰写员", goal="撰写专业报告")
reviewer = Agent(role="质量审核员", goal="审核报告质量")

# 协作完成
crew = Crew(
    agents=[data_engineer, analyst, visualizer, writer, reviewer],
    process=Process.sequential  # 按顺序协作
)

# 流程：
# 1. 数据工程师处理数据 →
# 2. 数据分析师进行统计 →
# 3. 可视化专家创建图表 →
# 4. 撰写员整合报告 →
# 5. 审核员质量把关

# 优势：每个 Agent 都是各自领域的专家
```

---

## CrewAI：角色扮演型多 Agent 框架

### 什么是 CrewAI？

**CrewAI** 是一个专门用于构建**角色扮演型多 Agent 系统**的框架。它的核心思想是：

- 每个 Agent 扮演特定角色（研究员、工程师、作家等）
- 每个 Agent 有自己的目标、背景和工具
- Agent 之间可以协作完成复杂任务
- 支持顺序执行、层级管理和自主决策

### 安装 CrewAI

```bash
# 安装 CrewAI
pip install crewai crewai-tools

# 安装依赖
pip install langchain-openai langchain-community
```

### CrewAI 核心概念

#### 1. Agent（智能体）

```python
from crewai import Agent

# 创建一个研究员 Agent
researcher = Agent(
    role="高级研究员",
    goal="发现和开发前沿技术",
    backstory="""你是一位经验丰富的技术研究员，
    擅长分析技术趋势和发现创新解决方案。
    你有20年的技术研究和开发经验。""",
    tools=[search_tool, wikipedia_tool],  # 可用工具
    llm=llm,  # 使用的语言模型
    verbose=True,
    allow_delegation=False  # 是否可以委托任务给其他 Agent
)

# 创建一个工程师 Agent
engineer = Agent(
    role="高级软件工程师",
    goal="将研究转化为可实现的代码",
    backstory="""你是一位全栈工程师，
    精通 Python、JavaScript 和云架构。
    你善于将复杂的概念转化为简洁的代码。""",
    tools=[code_tool, file_tool],
    llm=llm,
    verbose=True,
    allow_delegation=True
)

# 创建一个作家 Agent
writer = Agent(
    role="技术作家",
    goal="撰写清晰易懂的技术文档",
    backstory="""你是一位技术写作专家，
    擅长将复杂的技术概念用通俗的语言表达。""",
    tools=[],
    llm=llm,
    verbose=True,
    allow_delegation=False
)
```

#### 2. Task（任务）

```python
from crewai import Task

# 定义研究任务
research_task = Task(
    description="""研究最新的 AI Agent 框架，
    包括 CrewAI、AutoGen、Semantic Kernel。
    分析每个框架的优势、应用场景和未来趋势。""",
    expected_output="一份详细的研究报告，包括对比分析和建议",
    agent=researcher,  # 分配给研究员
    tools=[search_tool, wikipedia_tool]
)

# 定义工程任务
engineering_task = Task(
    description="""基于研究员的报告，
    设计并实现一个简单的 Multi-Agent 系统，
    演示三个框架的核心功能。""",
    expected_output="可运行的 Python 代码和项目文档",
    agent=engineer,
    context=[research_task]  # 依赖研究任务的输出
)

# 定义写作任务
writing_task = Task(
    description="""撰写一篇技术博客文章，
    介绍这三个框架，
    并包含代码示例。""",
    expected_output="一篇 2000 字的技术博客",
    agent=writer,
    context=[research_task, engineering_task]
)
```

#### 3. Crew（团队）

```python
from crewai import Crew, Process

# 创建团队
crew = Crew(
    agents=[researcher, engineer, writer],
    tasks=[research_task, engineering_task, writing_task],
    process=Process.sequential,  # 顺序执行
    verbose=2
)

# 执行任务
result = crew.kickoff()

print(result)
```

### CrewAI 协作模式

#### 1. 顺序执行（Sequential）

```python
# Agent 按顺序完成任务
crew = Crew(
    agents=[agent1, agent2, agent3],
    tasks=[task1, task2, task3],
    process=Process.sequential,
    verbose=2
)

# 流程：
# task1 → task2 → task3
#  ↓        ↓        ↓
# agent1  agent2  agent3
```

#### 2. 层级管理（Hierarchical）

```python
# 创建管理者 Agent
manager = Agent(
    role="项目经理",
    goal="协调团队完成项目",
    backstory="你是一位经验丰富的项目经理，擅长团队协作。",
    llm=llm
)

# 层级式团队
crew = Crew(
    agents=[researcher, engineer, writer],
    tasks=[research_task, engineering_task, writing_task],
    process=Process.hierarchical,  # 层级模式
    manager_llm=llm,  # 管理者使用的模型
    verbose=2
)

# 流程：
#        manager
#        /   |   \
#    task1 task2 task3
#      ↓     ↓     ↓
#    agent1 agent2 agent3
```

### 实战项目1：智能研究团队

```python
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, ScrapeWebsiteTool

# 1. 配置
import os
os.environ["OPENAI_API_KEY"] = "your-api-key"
os.environ["SERPER_API_KEY"] = "your-serper-key"  # 搜索 API

# 2. 初始化工具
search_tool = SerperDevTool()
scrape_tool = ScrapeWebsiteTool()

# 3. 创建 Agent
research_lead = Agent(
    role="研究主管",
    goal="领导研究团队完成深度技术调研",
    backstory="""你是研究团队的主管，负责制定研究方向和策略。
    你有15年的技术研究和团队管理经验。""",
    tools=[search_tool, scrape_tool],
    verbose=True
)

tech_analyst = Agent(
    role="技术分析师",
    goal="分析技术架构和实现细节",
    backstory="""你是一位技术分析专家，擅长深入理解技术原理。
    你能快速掌握新技术的核心概念。""",
    tools=[search_tool, scrape_tool],
    verbose=True
)

market_researcher = Agent(
    role="市场研究员",
    goal="研究市场趋势和竞争格局",
    backstory="""你是一位市场研究专家，擅长分析行业趋势和竞争环境。""",
    tools=[search_tool],
    verbose=True
)

report_writer = Agent(
    role="报告撰写员",
    goal="整合研究内容，撰写专业报告",
    backstory="""你是一位技术写作专家，擅长将复杂信息整理成清晰文档。""",
    tools=[],
    verbose=True
)

# 4. 创建任务
research_task = Task(
    description="""研究 2026 年最新的 AI Agent 开发框架，
    重点分析：
    1. CrewAI 的核心特性和应用场景
    2. AutoGen 的对话模式和优势
    3. Semantic Kernel 的企业级应用
    4. 三者的对比分析

    请搜索最新的技术文档、博客、GitHub 仓库。""",
    expected_output="详细的研究笔记，包括技术特性、代码示例和案例",
    agent=research_lead
)

analysis_task = Task(
    description="""基于研究主管的笔记，
    深入分析这三个框架的技术架构：
    1. Agent 通信机制
    2. 任务调度策略
    3. 工具集成方式
    4. 扩展性和性能""",
    expected_output="技术分析报告，包含架构图和对比表格",
    agent=tech_analyst,
    context=[research_task]
)

market_task = Task(
    description="""研究这些框架的市场情况：
    1. GitHub Stars 和活跃度
    2. 企业采用案例
    3. 社区生态
    4. 未来发展趋势""",
    expected_output="市场分析报告，包含数据图表",
    agent=market_researcher,
    context=[research_task]
)

report_task = Task(
    description="""整合所有研究内容，撰写一份综合报告：
    1. 技术概述
    2. 框架对比
    3. 市场分析
    4. 选型建议
    5. 快速入门指南

    报告应该专业、清晰、有数据支撑。""",
    expected_output="一份完整的 PDF 格式研究报告",
    agent=report_writer,
    context=[research_task, analysis_task, market_task]
)

# 5. 创建团队并执行
crew = Crew(
    agents=[research_lead, tech_analyst, market_researcher, report_writer],
    tasks=[research_task, analysis_task, market_task, report_task],
    process=Process.sequential,
    verbose=2
)

# 6. 执行
print("🚀 开始研究...")
result = crew.kickoff()
print("\n✅ 研究完成！")
print(result)
```

---

## AutoGen：对话型多 Agent 框架

### 什么是 AutoGen？

**AutoGen** 是 Microsoft 开发的多 Agent 对话框架。它的核心特点是：

- **对话驱动**：Agent 通过对话协商和协作
- **支持人类介入**：可以在对话中请求人类输入
- **代码执行**：内置代码执行沙箱
- **灵活的对话模式**：支持多种协作模式

### 安装 AutoGen

```bash
pip install pyautogen
```

### AutoGen 核心概念

#### 1. ConversableAgent（可对话 Agent）

```python
import autogen

# 配置
config_list = [
    {
        "model": "gpt-4",
        "api_key": "your-api-key"
    }
]

# 创建助手 Agent
assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={
        "config_list": config_list,
        "temperature": 0
    }
)

# 创建用户代理 Agent（可以执行代码）
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",  # 不需要人类输入
    max_consecutive_auto_reply=10,
    code_execution_config={
        "work_dir": "coding",
        "use_docker": False  # 不使用 Docker
    }
)

# 开始对话
user_proxy.initiate_chat(
    assistant,
    message="分析一下最近的股票市场趋势，并给出投资建议。"
)
```

#### 2. 对话模式

**一对一对话**：
```python
# 两个 Agent 对话
assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={"config_list": config_list}
)

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    code_execution_config={"use_docker": False}
)

# 开始对话
user_proxy.initiate_chat(
    assistant,
    message="帮我计算斐波那契数列的前20项"
)
```

**群组对话**：
```python
# 创建多个 Agent
writer = autogen.AssistantAgent(
    name="writer",
    system_message="你是一位专业作家，擅长创作故事。",
    llm_config={"config_list": config_list}
)

critic = autogen.AssistantAgent(
    name="critic",
    system_message="你是一位文学评论家，擅长批评和建议。",
    llm_config={"config_list": config_list}
)

editor = autogen.AssistantAgent(
    name="editor",
    system_message="你是一位编辑，擅长修改和润色文章。",
    llm_config={"config_list": config_list}
)

# 创建群组聊天
groupchat = autogen.GroupChat(
    agents=[user_proxy, writer, critic, editor],
    messages=[],
    max_round=10  # 最多10轮对话
)

manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config={"config_list": config_list}
)

# 开始群组对话
user_proxy.initiate_chat(
    manager,
    message="创作一个关于AI的短篇科幻故事"
)
```

### 实战项目2：AutoGen 代码开发团队

```python
import autogen

# 配置
config_list = [{"model": "gpt-4", "api_key": "your-key"}]

# 1. 产品经理
product_manager = autogen.AssistantAgent(
    name="Product_Manager",
    system_message="""你是一位产品经理。
    你的任务是：
    1. 理解用户需求
    2. 定义产品功能
    3. 提供清晰的验收标准
    """,
    llm_config={"config_list": config_list}
)

# 2. 架构师
architect = autogen.AssistantAgent(
    name="Architect",
    system_message="""你是一位软件架构师。
    你的任务是：
    1. 设计系统架构
    2. 选择技术栈
    3. 定义模块接口
    4. 确保可扩展性
    """,
    llm_config={"config_list": config_list}
)

# 3. 开发工程师
developer = autogen.AssistantAgent(
    name="Developer",
    system_message="""你是一位Python开发工程师。
    你的任务是：
    1. 编写高质量代码
    2. 遵循最佳实践
    3. 添加注释和文档
    4. 确保代码可运行
    """,
    llm_config={"config_list": config_list}
)

# 4. 测试工程师
tester = autogen.AssistantAgent(
    name="Tester",
    system_message="""你是一位测试工程师。
    你的任务是：
    1. 编写测试用例
    2. 执行测试
    3. 报告bug
    4. 验证修复
    """,
    llm_config={"config_list": config_list}
)

# 5. 用户代理
user_proxy = autogen.UserProxyAgent(
    name="User",
    system_message="用户代表",
    human_input_mode="NEVER",
    code_execution_config={
        "work_dir": "project",
        "use_docker": False
    },
    max_consecutive_auto_reply=10
)

# 6. 创建群组
groupchat = autogen.GroupChat(
    agents=[user_proxy, product_manager, architect, developer, tester],
    messages=[],
    max_round=20,
    speaker_selection_method="round_robin"  # 轮流发言
)

manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config={"config_list": config_list}
)

# 7. 开始协作
user_proxy.initiate_chat(
    manager,
    message="""我想开发一个待办事项管理API，要求：
    1. 用户可以创建、查看、更新、删除任务
    2. 支持任务优先级和截止日期
    3. 使用FastAPI框架
    4. 包含完整的测试
    请开始协作开发这个项目。"""
)
```

---

## Semantic Kernel：企业级 Agent 编排

### 什么是 Semantic Kernel？

**Semantic Kernel** 是 Microsoft 开发的**企业级 AI 编排框架**，专为生产环境设计。

**核心特性**：
- **插件系统**：模块化的技能（Skills）和函数
- **规划器**：自动规划和执行复杂任务
- **内存管理**：长期记忆和上下文管理
- **连接器**：集成多种 LLM 和服务
- **企业特性**：日志、监控、安全

### 安装 Semantic Kernel

```bash
pip install semantic-kernel
```

### Semantic Kernel 核心概念

#### 1. Kernel（内核）

```python
import semantic_kernel as sk
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion

# 创建 Kernel
kernel = sk.Kernel()

# 添加 LLM
kernel.add_chat_service(
    "gpt-4",
    OpenAIChatCompletion("gpt-4", "your-api-key")
)

# Kernel 现在可以执行任务
```

#### 2. Skills（技能）和 Functions（函数）

```python
from semantic_kernel.skill_definition import skill, sk_function

# 定义技能
@skill(description="数学计算技能")
class MathSkill:
    @sk_function(description="计算两个数的和")
    def add(self, a: str, b: str) -> str:
        return str(float(a) + float(b))

    @sk_function(description="计算两个数的乘积")
    def multiply(self, a: str, b: str) -> str:
        return str(float(a) * float(b))

# 注册技能
kernel.import_skill(MathSkill(), skill_name="math")

# 使用技能
result = await kernel.run_async(
    kernel.skills.get_function("math", "add"),
    a="5",
    b="3"
)
print(result)  # "8.0"
```

#### 3. Planner（规划器）

```python
from semantic_kernel.planning import SequentialPlanner

# 创建规划器
planner = SequentialPlanner(kernel)

# 定义目标
goal = "计算 5 加 3 的和，然后乘以 2"

# 自动规划
plan = await planner.create_plan_async(goal)

# 执行计划
result = await plan.invoke_async(kernel)
print(result)  # "16.0"
```

#### 4. Memory（记忆）

```python
from semantic_kernel.connectors.memory.azure_cognitive_search import (
    AzureCognitiveSearchMemoryStore
)

# 配置记忆
kernel.use_memory(
    AzureCognitiveSearchMemoryStore("endpoint", "api-key")
)

# 保存记忆
await kernel.memory.save_information_async(
    collection="user_preferences",
    text="用户喜欢Python和AI",
    id="user1"
)

# 检索记忆
memories = await kernel.memory.search_async(
    collection="user_preferences",
    query="编程语言"
)
```

### 实战项目3：企业文档助手

```python
import semantic_kernel as sk
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion
from semantic_kernel.planning import ActionPlanner
from semantic_kernel.core_skills import FileIOSkill, MathSkill, TextSkill

# 1. 创建 Kernel
kernel = sk.Kernel()
kernel.add_chat_service(
    "gpt-4",
    OpenAIChatCompletion("gpt-4", "your-api-key")
)

# 2. 导入核心技能
kernel.import_skill(FileIOSkill(), "file")
kernel.import_skill(MathSkill(), "math")
kernel.import_skill(TextSkill(), "text")

# 3. 定义自定义技能
@skill(description="文档处理技能")
class DocumentSkill:
    @sk_function(description="总结文档内容")
    def summarize(self, content: str) -> str:
        # 简化版：实际应该用 LLM
        lines = content.split('\n')
        return '\n'.join(lines[:5]) + "\n..."

    @sk_function(description="提取关键信息")
    def extract_key_info(self, content: str) -> str:
        # 简化版
        return "关键信息：" + content[:100]

kernel.import_skill(DocumentSkill(), "document")

# 4. 创建规划器
planner = ActionPlanner(kernel)

# 5. 定义任务
task = """
读取 document.txt 文件，
总结内容，
提取关键信息，
并创建一个 summary.md 文件保存结果。
"""

# 6. 自动规划和执行
plan = await planner.create_plan_async(task)
result = await plan.invoke_async(kernel)

print("✅ 任务完成！")
print(result)
```

---

## 多 Agent 协作模式

### 1. 分层协作（Hierarchical）

```
┌─────────────────────────────────────┐
│         Manager Agent               │
│      （协调者 / 决策者）              │
└────────┬────────────────────────────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
┌───▼──┐ ┌───▼──┐ ┌───▼──┐ ┌───▼──┐
│Agent1│ │Agent2│ │Agent3│ │Agent4│
│执行1 │ │执行2 │ │执行3 │ │执行4 │
└──────┘ └──────┘ └──────┘ └──────┘

应用场景：
- 项目管理
- 任务调度
- 资源分配
```

### 2. 扁平协作（Flat）

```
┌─────────────────────────────────────────┐
│                                         │
│  Agent1 ←→ Agent2 ←→ Agent3            │
│    ↑          ↑          ↑              │
│    └──────────┴──────────┘              │
│         自主通信和协作                   │
│                                         │
└─────────────────────────────────────────┘

应用场景：
- 头脑风暴
- 集体决策
- 协作设计
```

### 3. 顺序协作（Sequential）

```
Agent1 → Agent2 → Agent3 → Agent4
   ↓        ↓        ↓        ↓
  Task1   Task2   Task3   Task4

应用场景：
- 流水线处理
- 阶段性任务
- 质量检查
```

### 4. 竞争协作（Competitive）

```
┌─────────────────────────────────┐
│                                 │
│   Agent1 ↘                      │
│         ↳ Judge → Best Answer   │
│   Agent2 ↗                      │
│                                 │
└─────────────────────────────────┘

应用场景：
- 方案评选
- 代码审查
- 创意竞赛
```

---

## 实战项目：构建你的第一个 Multi-Agent 系统

### 项目概述

**目标**：构建一个智能内容创作系统，包含：
- 研究员（收集信息）
- 分析师（分析数据）
- 创作者（撰写内容）
- 编辑（优化文章）
- 审核员（质量把关）

### 完整代码实现

```python
"""
Multi-Agent 内容创作系统
使用 CrewAI 框架
"""

from crewai import Agent, Task, Crew, Process
from crewai_tools import (
    SerperDevTool,
    ScrapeWebsiteTool,
    FileReadTool,
    DirectoryReadTool
)
import os
from datetime import datetime

# ==================== 1. 配置 ====================

# API Keys
os.environ["OPENAI_API_KEY"] = "your-openai-key"
os.environ["SERPER_API_KEY"] = "your-serper-key"

# 工具初始化
search_tool = SerperDevTool()
scrape_tool = ScrapeWebsiteTool()
file_tool = FileReadTool()
directory_tool = DirectoryReadTool()

# ==================== 2. 创建 Agents ====================

# 研究员
researcher = Agent(
    role="内容研究员",
    goal="收集和整理相关信息，为内容创作提供素材",
    backstory="""你是一位资深的研究员，拥有10年的信息检索和分析经验。
    你擅长从海量信息中提取有价值的内容，并能够准确判断信息的可信度。
    你的工作为整个团队提供可靠的信息基础。""",
    tools=[search_tool, scrape_tool, file_tool],
    verbose=True,
    memory=True,  # 启用记忆
    max_iter=10  # 最多迭代10次
)

# 数据分析师
analyst = Agent(
    role="数据分析师",
    goal="分析研究数据，提取关键洞察和趋势",
    backstory="""你是一位数据科学专家，精通统计分析。
    你能够从复杂数据中发现模式和趋势，并提供有价值的洞察。
    你擅长用数据说话，让内容更有说服力。""",
    tools=[file_tool],
    verbose=True,
    memory=True
)

# 内容创作者
creator = Agent(
    role="内容创作者",
    goal="基于研究和分析，撰写高质量的原创内容",
    backstory="""你是一位才华横溢的作家，拥有丰富的写作经验。
    你擅长将复杂的概念用通俗易懂的语言表达出来。
    你的文章结构清晰，逻辑严密，引人入胜。""",
    tools=[],
    verbose=True,
    memory=True
)

# 内容编辑
editor = Agent(
    role="专业编辑",
    goal="优化内容结构、语言和表达，确保文章质量",
    backstory="""你是一位经验丰富的编辑，对文字有极高的要求。
    你擅长发现文章中的问题并加以改进。
    你注重细节，确保每一篇文章都达到出版水准。""",
    tools=[],
    verbose=True,
    memory=True
)

# 质量审核员
reviewer = Agent(
    role="质量审核员",
    goal="最终审核内容，确保符合质量标准",
    backstory="""你是一位严格的质量审核员，负责把关所有输出内容。
    你有一双敏锐的眼睛，能够发现任何错误和不当之处。
    你的目标是确保每一篇输出的内容都是高质量的。""",
    tools=[],
    verbose=True,
    memory=True
)

# ==================== 3. 创建 Tasks ====================

def create_content_pipeline(topic: str):
    """创建内容创作流水线"""

    # 研究任务
    research_task = Task(
        description=f"""针对主题 '{topic}' 进行深入研究：

        1. 使用搜索工具找到最新的相关文章和报告
        2. 爬取关键网页的详细内容
        3. 整理研究资料，提取关键信息
        4. 评估信息源的可信度
        5. 生成研究笔记

        研究重点：
        - 主题的核心概念和定义
        - 最新的发展趋势和案例
        - 专家观点和行业洞察
        - 相关数据和研究结果

        输出要求：
        - 结构化的研究笔记
        - 信息来源列表
        - 关键发现总结
        """,
        expected_output="""一份详细的研究报告，包括：
        - 主题概述
        - 关键发现（至少5个）
        - 数据和统计信息
        - 专家观点
        - 参考来源列表
        """,
        agent=researcher,
        tools=[search_tool, scrape_tool]
    )

    # 分析任务
    analysis_task = Task(
        description=f"""基于研究员的报告，对 '{topic}' 进行深度分析：

        1. 分析研究数据，识别关键模式和趋势
        2. 提取最重要的洞察（至少3个）
        3. 识别数据中的异常或特别值得关注的点
        4. 评估这些洞察对读者的价值
        5. 提出数据支撑的观点

        分析框架：
        - SWOT 分析（优势、劣势、机会、威胁）
        - 趋势分析（过去、现在、未来）
        - 对比分析（不同观点、方法、案例）
        """,
        expected_output="""一份数据分析报告，包括：
        - 核心洞察（3-5个）
        - 数据可视化的建议
        - 趋势预测
        - 支撑数据和证据
        - 对内容创作的建议
        """,
        agent=analyst,
        context=[research_task]
    )

    # 创作任务
    creation_task = Task(
        description=f"""基于研究和分析，创作关于 '{topic}' 的原创文章：

        文章要求：
        1. 标题吸引人且准确反映内容
        2. 开头引人入胜，快速抓住读者注意力
        3. 结构清晰，逻辑流畅
        4. 内容深入浅出，既专业又易懂
        5. 包含具体案例和故事
        6. 提供实用价值
        7. 结尾有力，给读者启发

        文章结构：
        - 引人入胜的标题
        - 简短有力的开头（100-150字）
        - 主体内容（3-5个小节）
        - 实用建议或总结
        - 呼吁行动或思考

        风格要求：
        - 语言生动但不失专业
        - 适当使用数据和故事
        - 避免过度技术化
        - 保持客观但有立场
        """,
        expected_output=f"""一篇完整的文章（2000-2500字），包括：
        - 吸引人的标题（3-5个选项）
        - 结构完整的内容
        - 清晰的小标题
        - 数据和案例支撑
        - 实用的建议或总结
        """,
        agent=creator,
        context=[research_task, analysis_task]
    )

    # 编辑任务
    editing_task = Task(
        description="""对创作的文章进行专业编辑：

        编辑重点：
        1. 结构优化：确保逻辑清晰、层次分明
        2. 语言润色：改进表达，提升可读性
        3. 内容调整：补充缺失，删减冗余
        4. 标题优化：改进标题和小标题
        5. 格式统一：确保格式一致性

        具体工作：
        - 检查并修复语法错误
        - 优化段落过渡
        - 调整句子长度和节奏
        - 确保术语使用一致
        - 添加必要的说明或注释
        """,
        expected_output="""编辑后的文章，包括：
        - 优化后的标题
        - 完善的文章内容
        - 清晰的章节划分
        - 编辑修改说明
        - 最终质量评分
        """,
        agent=editor,
        context=[creation_task]
    )

    # 审核任务
    review_task = Task(
        description="""对编辑后的文章进行最终审核：

        审核清单：
        1. 准确性：事实、数据、引用是否准确
        2. 完整性：内容是否完整，是否有遗漏
        3. 一致性：风格、术语、格式是否一致
        4. 可读性：是否易于理解和阅读
        5. 价值性：是否给读者带来价值
        6. 合规性：是否符合法律法规和道德标准

        审核标准：
        - 无事实错误
        - 无语法错误
        - 逻辑清晰
        - 内容有价值
        - 表达恰当
        """,
        expected_output="""审核报告，包括：
        - 最终确认的文章
        - 质量评估（各项指标打分）
        - 发现的问题（如有）
        - 改进建议（如有）
        - 发布建议（通过/需修改/不通过）
        """,
        agent=reviewer,
        context=[editing_task]
    )

    return [research_task, analysis_task, creation_task, editing_task, review_task]

# ==================== 4. 创建 Crew ====================

def create_crew():
    """创建内容创作团队"""
    return Crew(
        agents=[researcher, analyst, creator, editor, reviewer],
        tasks=[],  # 任务动态添加
        process=Process.sequential,
        verbose=2,
        memory=True  # 启用团队记忆
    )

# ==================== 5. 执行函数 ====================

def create_content(topic: str, save_to_file: bool = True):
    """创作内容的主函数"""

    print(f"\n{'='*60}")
    print(f"🚀 开始创作：{topic}")
    print(f"{'='*60}\n")

    # 创建团队
    crew = create_crew()

    # 创建任务流水线
    tasks = create_content_pipeline(topic)
    crew.tasks = tasks

    # 执行
    result = crew.kickoff()

    # 保存结果
    if save_to_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"output_{timestamp}.md"

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"# {topic}\n\n")
            f.write(f"*生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")
            f.write("---\n\n")
            f.write(str(result))

        print(f"\n✅ 内容已保存到：{filename}")

    return result

# ==================== 6. 使用示例 ====================

if __name__ == "__main__":
    # 示例1：技术主题
    result1 = create_content(
        "2026年AI Agent技术发展趋势"
    )

    # 示例2：商业主题
    result2 = create_content(
        "中小企业如何利用AI提升效率"
    )

    # 示例3：教育主题
    result3 = create_content(
        "AI时代的教育变革与机遇"
    )
```

---

## Agent 通信协议

### Agent Protocol

**Agent Protocol** 是一个标准化的 Agent 通信协议，让不同框架的 Agent 可以互相通信。

```python
# 协议示例
message = {
    "version": "1.0",
    "type": "request",
    "sender": "agent1",
    "receiver": "agent2",
    "timestamp": "2026-02-10T10:30:00Z",
    "payload": {
        "action": "analyze_data",
        "parameters": {
            "data": [...],
            "method": "statistical"
        }
    },
    "context": {
        "conversation_id": "conv_123",
        "previous_messages": [...]
    }
}

# 响应
response = {
    "version": "1.0",
    "type": "response",
    "sender": "agent2",
    "receiver": "agent1",
    "timestamp": "2026-02-10T10:30:05Z",
    "payload": {
        "status": "success",
        "result": {...}
    }
}
```

---

## 最佳实践

### 1. Agent 设计原则

**单一职责**：
```python
# ✅ 好的设计
researcher = Agent(role="研究员", goal="收集信息")
writer = Agent(role="作家", goal="撰写内容")

# ❌ 不好的设计
generalist = Agent(role="万能助手", goal="做所有事情")
```

**明确边界**：
```python
# 定义 Agent 的能力和限制
researcher = Agent(
    role="研究员",
    goal="收集和整理信息",
    backstory="...",
    allow_delegation=False,  # 不能委托任务
    max_iter=5  # 最多迭代5次
)
```

### 2. 任务设计原则

**具体明确**：
```python
# ✅ 好的任务
task = Task(
    description="搜索2024年AI Agent框架的最新发展，重点分析CrewAI、AutoGen和Semantic Kernel",
    expected_output="包含对比表格和趋势分析的报告"
)

# ❌ 模糊的任务
task = Task(
    description="研究AI",
    expected_output="报告"
)
```

**合理依赖**：
```python
# 建立任务依赖关系
task2 = Task(
    description="基于任务1的结果进行分析",
    context=[task1]  # 依赖 task1
)
```

### 3. 性能优化

**并行执行**：
```python
# 可以并行执行的任务
crew = Crew(
    agents=[agent1, agent2, agent3],
    tasks=[task1, task2, task3],
    process=Process.hierarchical  # 允许并行
)
```

**缓存结果**：
```python
# 启用记忆功能
agent = Agent(
    role="...",
    memory=True,  # 启用记忆
    cache=True  # 启用缓存
)
```

### 4. 错误处理

```python
from crewai import Crew, Process

try:
    result = crew.kickoff()
except Exception as e:
    print(f"执行失败：{e}")
    # 重试或回退
```

---

## 框架对比

| 特性 | CrewAI | AutoGen | Semantic Kernel |
|------|--------|---------|-----------------|
| **核心理念** | 角色扮演 | 对话协作 | 企业编排 |
| **优势** | 易用性强 | 灵活性高 | 生产就绪 |
| **学习曲线** | 低 | 中 | 高 |
| **适用场景** | 快速原型 | 研究实验 | 企业应用 |
| **社区活跃度** | 高 | 高 | 高 |
| **文档质量** | 好 | 好 | 优秀 |
| **集成性** | 中 | 中 | 高 |
| **企业支持** | 社区 | Microsoft | Microsoft |

---

## 下一步

**恭喜你完成了 Agent Skills 的学习！** 🎉

你现在掌握了：
- ✅ CrewAI 多 Agent 协作
- ✅ AutoGen 对话模式
- ✅ Semantic Kernel 企业级应用
- ✅ 构建了完整的 Multi-Agent 系统

**继续学习**：

📖 **第9章：AI 完全实战项目 - 企业级智能客服系统** - 构建完整的 RAG + Agent 应用

🚀 **第10章：AI 完全实战项目 - 企业级数据分析与商业智能平台** - 数据分析平台实战

🌟 **第11章：AI 完全实战项目 - 多模态内容生成与管理平台** - 多模态应用开发

📚 **第13章：应用进阶** - 深入学习 LangGraph、MCP 等高级主题

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
