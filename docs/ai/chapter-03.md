# Prompt工程

## 本章导读

**Prompt Engineering（提示词工程）** 是AI应用开发中最重要的技能之一。好的提示词能让AI发挥出强大能力,而不好的提示词则会导致模糊、不准确的回答。

本章将系统介绍如何设计高效的提示词,让你的AI应用效果提升10倍!

**2024-2026更新**：
- GPT-4o、Claude 3.5 Sonnet 最佳实践
- 多模态 Prompt 设计(图像+文本)
- 长上下文优化技巧(200K tokens)
- Artifacts 功能应用
- 流式输出 Prompt 优化

**学习目标**：
- 理解Prompt Engineering的核心原则
- 掌握常用的提示词模式
- 学习Few-shot Learning技巧
- 实现高级提示词策略
- 掌握2024-2026最新模型的Prompt技巧

**预计学习时间**：60分钟

---

## 什么是Prompt Engineering？

### Prompt Engineering的定义

**Prompt Engineering** 是指通过设计和优化输入给大语言模型的提示词，以引导模型生成更准确、更相关、更符合预期的输出的技术。

```
┌─────────────────────────────────────────┐
│      Prompt Engineering 的价值            │
├─────────────────────────────────────────┤
│                                          │
│  ❌ 差的Prompt：                          │
│  "写个爬虫"                              │
│  → 结果：可能是网页爬虫、图片爬虫...       │
│                                          │
│  ✅ 好的Prompt：                          │
│  "请用Python写一个网页爬虫，要求：         │
│   - 使用requests库                        │
│   - 支持user-agent设置                    │
│   - 包含错误处理                          │
│   - 添加代码注释和使用示例"                │
│  → 结果：精确符合需求的代码               │
│                                          │
└─────────────────────────────────────────┘
```

### 为什么Prompt Engineering很重要？

| 方面 | 说明 |
|------|------|
| **效果提升** | 好的Prompt能让输出质量提升3-10倍 |
| **成本节约** | 精确的Prompt减少Token消耗 |
| **减少重试** | 一次得到满意结果，节省时间 |
| **可控性** | 让AI输出更符合你的预期 |
| **稳定性** | 一致的Prompt带来一致的输出 |

### Prompt的基本结构

一个有效的Prompt通常包含以下要素：

```python
# 完整的Prompt结构
prompt = """
{角色设定}
你是一个专业的Python编程专家，擅长教学和代码优化。

{任务描述}
请解释Python装饰器的概念，并提供三个实际应用场景。

{输入数据}
无

{输出要求}
- 使用通俗易懂的语言
- 每个场景包含代码示例
- 总字数不超过500字

{约束条件}
- 不要涉及元类等高级概念
- 重点讲解使用场景而非语法细节
- 使用emoji增加可读性

{示例格式}
### 核心概念
...

### 应用场景1：计时器
...
"""
```

---

## Prompt设计的核心原则 {#核心原则}

掌握这5个核心原则，让你的Prompt质量提升一个台阶！

### 原则1：清晰具体（Be Specific）

❌ **不好的示例**：
```python
prompt = "写一个爬虫"
```
问题：
- 什么类型的爬虫？
- 爬取什么数据？
- 用什么语言？

✅ **好的示例**：
```python
prompt = """
请用Python编写一个网页爬虫，具体要求：

目标网站：豆瓣电影Top250
需要提取：
  - 电影名称
  - 评分
  - 导演和主演
  - 一句话简介

技术要求：
  - 使用requests + BeautifulSoup
  - 添加适当的延时（随机2-5秒）
  - 包含异常处理
  - 数据保存为CSV格式

附加要求：
  - 添加详细注释
  - 提供使用示例
"""
```

### 原则2：提供上下文（Provide Context）

❌ **不好的示例**：
```python
prompt = "这段代码有什么问题？"
```

✅ **好的示例**：
```python
prompt = """
我是Python初学者，写了以下代码实现冒泡排序，但运行结果不对。

请帮我：
1. 指出代码中的问题
2. 解释为什么会这样
3. 提供修复后的代码
4. 给出避免此类问题的建议

代码：
```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

# 测试
print(bubble_sort([5, 2, 8, 1, 9]))
```
"""
```

### 原则3：明确输出格式（Specify Output Format）

❌ **不好的示例**：
```python
prompt = "分析这段文本的情感"
```

✅ **好的示例**：
```python
prompt = """
分析以下文本的情感倾向：

文本内容：今天天气真好，阳光明媚，心情特别棒！

请按以下格式输出：
```json
{
    "情感倾向": "正面/负面/中性",
    "情感强度": "强/中/弱",
    "关键词": ["关键词1", "关键词2"],
    "置信度": 0.95
}
```
"""
```

### 原则4：使用示例（Use Examples）

提供示例让AI更好地理解你的期望。

```python
prompt = """
任务：将以下Python函数转换为列表推导式

示例1：
输入：
```python
squares = []
for i in range(10):
    squares.append(i**2)
```

输出：
```python
squares = [i**2 for i in range(10)]
```

示例2：
输入：
```python
evens = []
for i in range(20):
    if i % 2 == 0:
        evens.append(i)
```

输出：
```python
evens = [i for i in range(20) if i % 2 == 0]
```

现在请转换以下代码：
【你的代码】
"""
```

### 原则5：设定角色（Assign a Role）

```python
# 角色化提示词效果更好
prompts = {
    "无角色": "解释什么是机器学习",

    "专家角色": """
    你是一位有10年经验的机器学习专家，曾在Google和Meta工作。
    请用通俗易懂的方式解释什么是机器学习，适合初学者理解。
    """,

    "老师角色": """
    你是一位大学计算机系教授，擅长用比喻和实例讲解复杂概念。
    请像给大一学生上课一样，解释什么是机器学习。
    """,

    "孩子角色": """
    你是一位小学科学老师，擅长用简单的语言和有趣的故事解释知识。
    请用5岁孩子能理解的方式解释什么是机器学习。
    """
}
```

---

## 常用提示词模式 {#常用提示词模式}

本节介绍5种最实用的提示词模式，让你的Prompt效果倍增！

### 模式1：思维链（Chain of Thought）

引导AI展示推理过程，提高复杂问题的准确率。

```python
# 基础版CoT
prompt = """
小明有5个苹果，他给了小红2个，又买了3个，吃掉了1个。
请问小明现在有几个苹果？

请一步步思考并给出答案。
"""

# AI输出：
"""
让我一步步计算：

1. 初始：小明有5个苹果
2. 给小红：5 - 2 = 3个
3. 买了3个：3 + 3 = 6个
4. 吃掉1个：6 - 1 = 5个

答案：小明现在有5个苹果
"""
```

### 模式2：Few-shot Learning

提供少量示例，让AI快速学习任务模式。

```python
# 情感分析Few-shot示例
prompt = """
任务：判断评论的情感倾向

示例1：
评论："这个产品太棒了，强烈推荐！"
标签：正面

示例2：
评论："质量很差，不推荐购买。"
标签：负面

示例3：
评论："一般般，凑合能用。"
标签：中性

现在请判断以下评论：
评论："超出预期，会继续支持！"
标签："""

# AI输出：正面
```

### 模式3：Self-Consistency（自洽性）

让AI多次生成答案，选择最一致的结果。

```python
# 实际应用中需要多次调用
prompt = """
用Python实现快速排序算法。

请提供3种不同的实现方式：
1. 递归版本
2. 使用列表推导式
3. 使用filter函数

每种方式都要包含：
- 完整代码
- 时间复杂度分析
- 优缺点说明
"""
```

### 模式4：Generate Then Refine先生成后优化

先生成初稿，再进行优化。

```python
# Step 1: 生成初稿
draft_prompt = """
写一篇介绍Python装饰器的文章，300字左右。
"""

# Step 2: 优化
refine_prompt = """
以下是关于Python装饰器的初稿：

【初稿内容】

请优化这篇文章：
1. 添加代码示例
2. 使用更生动的比喻
3. 添加常见应用场景
4. 总字数扩展到500字
5. 使用小标题分段
"""
```

### 模式5：Role Playing（角色扮演）

```python
# 技术面试
interview_prompt = """
你现在是Google的技术面试官，正在面试一位Python工程师。

请根据以下JD设计5道面试题：
职位：Python后端工程师
要求：
  - 精通Python基础
  - 熟悉Django/Flask框架
  - 了解数据库设计
  - 有高并发经验加分

请：
1. 从简单到困难排序题目
2. 包含参考答案
3. 评估每个问题的难度（1-5星）
"""

# 代码审查
review_prompt = """
你是一位资深的代码审查工程师，负责团队代码质量。

请审查以下Python代码，从以下角度给出反馈：
1. 代码风格
2. 潜在bug
3. 性能问题
4. 可读性
5. 改进建议

【代码】
"""
```

---

## 高级技巧 {#高级技巧}

本节介绍更高级的提示词技巧，让你的AI应用更智能！

### 技巧1：思维树（Tree of Thoughts）

让AI探索多个可能的解决方案，然后选择最优的。

```python
prompt = """
问题：如何用Python实现一个高效的缓存系统？

请按以下步骤思考：

步骤1：列出3-5种可能的实现方案
步骤2：分析每种方案的优缺点
步骤3：评估每种方案的适用场景
步骤4：给出最优方案及完整代码

请详细展开每个步骤。
"""
```

### 技巧2：逆向提示（Reverse Prompting）

先让AI生成答案，再反推问题或改进。

```python
# 逆向生成问题
prompt = """
给定以下Python代码：

```python
def memoize(func):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper
```

请：
1. 解释这段代码的作用
2. 构造3个合适的使用场景
3. 为每个场景提供示例代码
4. 总结这个函数的优缺点
"""
```

### 技巧2.5：Prompt Chaining（提示词链）

**Prompt Chaining** 是将多个 Prompt 串联起来，让前一个 Prompt 的输出作为后一个 Prompt 的输入，逐步完成复杂任务。

#### 什么是 Prompt Chaining？

Prompt Chaining ≠ Chain of Thought
- **Chain of Thought**：单个 Prompt 内让 AI 展示推理过程
- **Prompt Chaining**：多个 Prompt 串联，多次 API 调用，逐步细化

```
输入 → Prompt1 → 中间结果1 → Prompt2 → 中间结果2 → ... → 最终输出
```

#### Prompt Chaining 的优势

✅ **分解复杂性**：将复杂任务拆分为简单步骤
✅ **提高准确率**：每步专注一个目标，减少错误累积
✅ **可控性强**：可以在中间加入人工审核和调整
✅ **易于调试**：定位哪一步出问题
✅ **模块复用**：每个环节可以独立优化

#### Prompt Chaining 策略 {#prompt-chaining-策略}

##### 1. **Sequential Chaining（顺序链）**

最简单的链式结构，依次执行。

```python
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain

# 第一步：理解需求
understand_prompt = PromptTemplate(
    input_variables=["user_query"],
    template="分析用户需求：{user_query}\n\n提取核心功能点，用JSON格式输出。"
)

# 第二步：设计方案
design_prompt = PromptTemplate(
    input_variables=["requirements"],
    template="基于需求设计技术方案：\n{requirements}\n\n请给出：\n1. 技术栈选择\n2. 目录结构\n3. 核心模块"
)

# 第三步：生成代码
code_prompt = PromptTemplate(
    input_variables=["design"],
    template="实现以下设计：\n{design}\n\n请提供完整代码，包含注释和类型提示。"
)

# 构建链
llm = ChatOpenAI(temperature=0)
understand_chain = LLMChain(llm=llm, prompt=understand_prompt, output_key="requirements")
design_chain = LLMChain(llm=llm, prompt=design_prompt, output_key="design")
code_chain = LLMChain(llm=llm, prompt=code_prompt, output_key="code")

# 顺序执行
result = understand_chain.invoke({"user_query": "创建一个待办事项应用"})
result.update(design_chain.invoke(result))
result.update(code_chain.invoke(result))

print(result["code"])
```

##### 2. **Conditional Chaining（条件链）**

根据上一步结果，选择不同的下一步。

```python
def conditional_chain(user_input):
    # 第一步：分类意图
    classify_prompt = f"""
    分类用户意图：{user_input}

    请只返回以下类别之一：
    - code_writing：需要写代码
    - code_review：需要审查代码
    - question：回答问题
    - other：其他
    """

    intent = llm.invoke(classify_prompt).content.strip().lower()

    # 第二步：根据分类选择不同路径
    if intent == "code_writing":
        return code_writing_chain(user_input)
    elif intent == "code_review":
        return code_review_chain(user_input)
    elif intent == "question":
        return answer_chain(user_input)
    else:
        return general_chain(user_input)

# 使用
result = conditional_chain("帮我写一个快速排序算法")
```

##### 3. **Looping Chaining（循环链）**

重复执行某个步骤，直到满足条件。

```python
def iterative_refinement(initial_request, max_iterations=3):
    content = initial_request

    for i in range(max_iterations):
        # 生成内容
        generation_prompt = f"生成以下内容：{content}"
        generated = llm.invoke(generation_prompt).content

        # 评审并给出改进意见
        review_prompt = f"""
        评审以下内容，指出需要改进的地方：
        {generated}

        请从以下方面评审：
        1. 准确性
        2. 完整性
        3. 可读性
        4. 最佳实践

        如果已经很好，回复"APPROVED"，否则给出具体改进建议。
        """
        feedback = llm.invoke(review_prompt).content

        if "APPROVED" in feedback:
            print(f"第 {i+1} 轮迭代：已通过审核")
            return generated

        # 根据反馈改进
        content = f"原内容：{generated}\n\n改进建议：{feedback}\n\n请根据建议重新生成。"
        print(f"第 {i+1} 轮迭代：继续改进...")

    return generated

# 使用
result = iterative_refinement("写一个Python快速排序函数")
```

##### 4. **Parallel Chaining（并行链）**

多个 Prompt 同时执行，然后汇总结果。

```python
import asyncio

async def parallel_analysis(topic):
    # 并行执行多个分析任务
    prompts = [
        f"从技术角度分析：{topic}",
        f"从商业角度分析：{topic}",
        f"从用户角度分析：{topic}"
    ]

    # 并发调用
    tasks = [llm.ainvoke(prompt) for prompt in prompts]
    results = await asyncio.gather(*tasks)

    # 汇总结果
    summary_prompt = f"""
    综合以下三个角度的分析，给出完整结论：

    技术角度：{results[0].content}

    商业角度：{results[1].content}

    用户角度：{results[2].content}

    请提供：
    1. 综合评估
    2. 机会与风险
    3. 建议行动
    """

    final = await llm.ainvoke(summary_prompt)
    return final.content

# 使用
result = await parallel_analysis("开发一个AI写作助手")
```

#### 实战案例：自动化报告生成 {#实战案例自动化报告生成}

```python
from langchain.chains import SequentialChain

# Step 1: 数据收集
collect_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["topic"],
        template="收集关于'{topic}'的最新数据、趋势和案例。"
    ),
    output_key="data"
)

# Step 2: 数据分析
analyze_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["data"],
        template="分析以下数据，提取关键洞察：\n{data}"
    ),
    output_key="analysis"
)

# Step 3: 生成大纲
outline_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["analysis"],
        template="基于分析结果，生成报告大纲：\n{analysis}"
    ),
    output_key="outline"
)

# Step 4: 撰写报告
write_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["outline", "analysis"],
        template="""
        基于以下大纲和分析，撰写完整报告：

        大纲：
        {outline}

        分析要点：
        {analysis}

        要求：
        - 专业、准确、有深度
        - 包含具体案例和数据支持
        - 结构清晰，逻辑严密
        - 1500-2000字
        """
    ),
    output_key="report"
)

# Step 5: 质量检查
review_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["report"],
        template="""
        审查以下报告质量：
        {report}

        检查清单：
        - [ ] 内容准确性
        - [ ] 逻辑连贯性
        - [ ] 数据充分性
        - [ ] 专业术语使用
        - [ ] 格式规范

        给出评分（1-10）和改进建议。如果低于8分，提供具体修改意见。
        """
    ),
    output_key="review"
)

# 构建完整链
full_chain = SequentialChain(
    chains=[collect_chain, analyze_chain, outline_chain, write_chain, review_chain],
    input_variables=["topic"],
    output_variables=["report", "review"]
)

# 执行
result = full_chain.invoke({"topic": "2024年AI应用开发趋势"})

print("=== 报告 ===")
print(result["report"])
print("\n=== 审核 ===")
print(result["review"])
```

#### Prompt Chaining 最佳实践

##### ✅ DO（推荐做法）

1. **明确每个环节的目标**
```python
# 好的做法：每个Prompt有明确目标
step1 = "提取文章中的所有关键数字"
step2 = "分析这些数字的趋势"
step3 = "生成可视化建议"
```

2. **使用结构化输出**
```python
# 让AI输出JSON，便于下一个Prompt使用
prompt = """
分析数据，输出JSON格式：
{
    "trend": "上升/下降/平稳",
    "key_points": ["点1", "点2"],
    "confidence": 0.85
}
"""
```

3. **添加中间检查点**
```python
def chain_with_checkpoints(input_data):
    # Step 1
    result1 = step1(input_data)
    print(f"Step 1 完成: {result1}")  # 检查点

    # 可以插入人工审核
    if manual_review:
        user_feedback = input("是否继续？(y/n)")
        if user_feedback == 'n':
            return "用户中断"

    # Step 2
    result2 = step2(result1)
    print(f"Step 2 完成: {result2}")  # 检查点

    return result2
```

4. **处理错误和回退**
```python
def robust_chain(input_data, max_retries=3):
    for attempt in range(max_retries):
        try:
            result = step1(input_data)

            # 验证输出
            if not validate(result):
                raise ValueError("输出不符合预期")

            return result
        except Exception as e:
            if attempt == max_retries - 1:
                return f"失败：{str(e)}"

            # 回退并重试
            input_data = f"上次尝试失败：{str(e)}\n请重新处理：{input_data}"
```

##### ❌ DON'T（避免做法）

1. **不要让链过长**
```python
# 不好的做法：10个步骤的链
step1 → step2 → step3 → step4 → step5 → step6 → step7 → step8 → step9 → step10

# 好的做法：拆分成多个子链
sub_chain1 = step1 → step2 → step3
sub_chain2 = step4 → step5 → step6
sub_chain3 = step7 → step8 → step9 → step10
```

2. **不要丢失上下文**
```python
# 不好的做法：只传递部分信息
chain1 = "提取摘要"
chain2 = "翻译摘要"  # 丢失了原文上下文

# 好的做法：保留完整上下文
chain2 = "基于原文和摘要进行翻译\n原文：{text}\n摘要：{summary}"
```

3. **不要过度依赖 AI 自动纠错**
```python
# 不好的做法：希望AI自动发现并修复所有错误
chain = "生成代码 → 修复代码中的bug → 优化性能"

# 好的做法：明确指出要检查什么
chain = """
step1: 生成代码
step2: 检查以下问题：
    - 类型安全
    - 边界条件
    - 异常处理
step3: 优化性能：
    - 算法复杂度
    - 内存使用
"""
```

#### Prompt Chaining vs 其他模式

| 模式 | 调用次数 | 适用场景 | 复杂度 | 可控性 |
|------|---------|---------|--------|--------|
| **单次Prompt** | 1 | 简单任务 | 低 | 低 |
| **Chain of Thought** | 1 | 需要推理的任务 | 低 | 中 |
| **Prompt Chaining** | 多次 | 复杂、多步骤任务 | 中 | 高 |
| **Agent** | 动态 | 不确定、需要工具的任务 | 高 | 中 |

#### 何时使用 Prompt Chaining？

✅ **适合使用的场景**：
- 复杂文档生成（报告、论文、方案）
- 多阶段数据处理（收集→分析→可视化）
- 迭代优化（初稿→评审→修改→定稿）
- 需要中间人工审核的流程
- 需要保存中间结果的场景

❌ **不适合使用的场景**：
- 简单问答
- 单步任务
- 对延迟敏感（多次调用增加总时间）
- Token 成本敏感（每次调用都会重复上下文）

#### LangChain 实现

LangChain 提供了多种 Chain 类型：

```python
from langchain.chains import (
    SimpleSequentialChain,  # 简单顺序链
    SequentialChain,        # 多输入输出链
    TransformChain,         # 转换链
    RouterChain,            # 路由链
)

# 1. SimpleSequentialChain
simple_chain = SimpleSequentialChain(
    chains=[chain1, chain2, chain3]
)

# 2. SequentialChain（多输入输出）
complex_chain = SequentialChain(
    chains=[collect_chain, analyze_chain, write_chain],
    input_variables=["topic"],
    output_variables=["report", "analysis"],
    verbose=True  # 打印每步输出
)

# 3. 自定义Chain
from langchain.chains.base import Chain

class MyCustomChain(Chain):
    input_variables = ["input"]
    output_variables = ["output"]

    def _call(self, inputs):
        # 自定义逻辑
        step1_result = self.step1(inputs["input"])
        step2_result = self.step2(step1_result)
        return {"output": step2_result}
```

#### 小结

**Prompt Chaining** 核心要点：
- 📌 **分解任务**：将复杂任务拆分为多个简单步骤
- 📌 **传递上下文**：确保每一步都有必要的信息
- 📌 **验证输出**：在每步后检查结果质量
- 📌 **处理错误**：添加重试和回退机制
- 📌 **控制成本**：避免过长的链和重复的上下文

---

### 技巧3：渐进式提示（Progressive Prompting）

从简单到复杂，逐步引导AI。

```python
# Level 1: 基础概念
level1 = "什么是Python装饰器？"

# Level 2: 简单应用
level2 = """
现在我理解了装饰器的基本概念。
请提供一个简单的装饰器示例，用于计时函数执行时间。
"""

# Level 3: 复杂应用
level3 = """
很好！现在我需要：
1. 一个可以接受参数的装饰器
2. 用于重试函数执行
3. 支持自定义重试次数和延时
请给出完整实现。
"""

# Level 4: 实战优化
level4 = """
我现在有这个重试装饰器。
请帮我：
1. 添加指数退避策略
2. 记录每次重试的日志
3. 处理特定异常类型
4. 提供使用示例
"""
```

### 技巧4：比较式提示（Comparative Prompting）

让AI对比不同方案。

```python
prompt = """
请对比以下三种Python异步编程方式：

1. asyncio + async/await
2. concurrent.futures
3. multiprocessing

从以下维度对比：
- 使用难度（1-5分）
- 性能表现
- 内存占用
- 适用场景
- 代码示例

请使用表格形式呈现对比结果。
"""
```

### 技巧5：反思与改进（Reflection and Improvement）

```python
prompt = """
【任务】
请设计一个Python类的学生成绩管理系统。

【要求】
1. 支持添加、删除、查询学生
2. 支持成绩统计（平均分、最高分等）
3. 支持成绩排序
4. 代码要清晰易读

【重要】
在提供代码后，请：
1. 自我审查代码的不足之处
2. 指出可能的bug
3. 提供改进版本
4. 总结关键改进点
"""
```

---

## 2024-2026 新增：最新模型 Prompt 最佳实践

### GPT-4o Prompt 优化技巧

**GPT-4o** (2024年5月发布)是OpenAI最新的多模态模型,具有以下特点:
- 原生多模态(图像、音频、视频)
- 更快的响应速度
- 更低的成本
- 支持流式输出

#### 1. 多模态 Prompt 设计

```python
from openai import OpenAI

client = OpenAI()

# 图像+文本 Prompt
response = client.chat.completions.create(
    model="gpt-4o",  # 2024最新多模态模型
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": """
                    分析这张图片中的Python代码,并提供:
                    1. 代码功能说明
                    2. 潜在bug
                    3. 优化建议
                    4. 改进后的代码
                    """
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/code_screenshot.png"
                    }
                }
            ]
        }
    ],
    max_tokens=1000
)

print(response.choices[0].message.content)
```

#### 2. 流式输出 Prompt

```python
# GPT-4o 流式输出优化
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": """
        请逐步讲解Python异步编程:
        1. 先介绍概念(100字)
        2. 然后给简单示例
        3. 再说明使用场景
        4. 最后提供最佳实践

        请用markdown格式输出,每个部分用分隔线分开。
        """
    }],
    stream=True,  # 启用流式输出
    max_tokens=2000
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
        # 用户可以实时看到输出,体验更好
```

#### 3. GPT-4o 成本优化 Prompt

```python
# GPT-4o-mini 用于简单任务,节省成本
def smart_prompt_routing(user_input):
    """根据任务复杂度选择模型"""

    # 简单任务检查
    simple_keywords = ["定义", "是什么", "列出", "翻译"]
    if any(kw in user_input for kw in simple_keywords):
        return {
            "model": "gpt-4o-mini",  # 成本降低90%
            "prompt": user_input
        }

    # 复杂任务使用 GPT-4o
    return {
        "model": "gpt-4o",
        "prompt": f"""
        请详细分析和解答:
        {user_input}

        要求:
        1. 提供完整的推理过程
        2. 包含代码示例
        3. 说明最佳实践
        4. 标注注意事项
        """
    }
```

### Claude 3.5 Sonnet Prompt 优化技巧

**Claude 3.5 Sonnet** (2024年6月发布)是Anthropic最强模型,特点:
- 2024年最强的代码生成能力
- 200K 超长上下文
- Artifacts 功能(实时预览生成内容)
- 更好的推理能力

#### 1. Artifacts 功能 Prompt

```python
import anthropic

client = anthropic.Anthropic()

# Claude Artifacts - 生成可预览的代码
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": """
        创建一个Vue组件,实现TODO列表功能:

        要求:
        1. 使用Composition API
        2. 包含添加、删除、切换完成状态
        3. 数据持久化到localStorage
        4. 添加过渡动画效果
        5. 响应式设计

        请生成完整的.vue文件,包含:
        - template
        - script
        - style
        """
    }]
)

# Claude会生成Artifacts,用户可以实时预览Vue组件
print(message.content)
```

#### 2. 200K 长上下文 Prompt

```python
# 利用 Claude 3.5 的 200K 上下文
def analyze_large_codebase(repo_files):
    """分析大型代码库"""

    # 构建超长 Prompt (利用 200K tokens)
    prompt = f"""
    你是资深架构师。请分析以下代码库:

    【代码库结构】
    {repo_files['structure']}

    【核心文件】
    {repo_files['core_files']}

    【配置文件】
    {repo_files['configs']}

    【文档】
    {repo_files['docs']}

    【历史提交】
    {repo_files['commits']}

    任务:
    1. 架构分析
       - 整体架构模式
       - 模块划分
       - 依赖关系

    2. 代码质量
       - 设计模式使用
       - 代码规范遵循
       - 潜在问题

    3. 改进建议
       - 性能优化
       - 可维护性提升
       - 扩展性改进
       - 安全性加固

    请提供详细的分析报告,包含具体的代码示例。
    """

    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=8192,  # Claude 支持更长输出
        messages=[{"role": "user", "content": prompt}]
    )

    return message.content
```

#### 3. Claude 代码审查 Prompt

```python
# Claude 3.5 最擅长代码审查
code_review_prompt = """
你是资深代码审查专家,请全面审查以下Python代码:

【代码】
{code}

【背景】
这是一个Web应用的数据库操作模块。

审查维度:

1. **代码风格** (PEP 8)
   - 命名规范
   - 代码格式
   - 导入顺序

2. **错误处理**
   - 异常捕获完整性
   - 边界情况处理
   - 资源释放

3. **性能问题**
   - SQL查询优化(N+1问题)
   - 索引使用
   - 缓存机会
   - 算法复杂度

4. **安全性**
   - SQL注入风险
   - 敏感数据泄露
   - 权限检查
   - 输入验证

5. **可维护性**
   - 代码复用
   - 职责分离
   - 测试友好
   - 文档注释

输出格式:

## 总体评分
X/10 分

## 问题清单
### 🚨 严重问题
- [ ] 问题描述
  - 位置: 第X行
  - 风险: 说明
  - 修复: 建议方案

### ⚠️ 改进建议
...

### ✅ 做得好的地方
...

## 改进代码
```python
# 改进后的完整代码
...
```

## 最佳实践建议
...
"""
```

### GPT-4o vs Claude 3.5 Prompt 对比

```python
# 场景1: 代码生成和调试
# 推荐: Claude 3.5 Sonnet (2024年最强代码能力)

claude_code_prompt = """
你是Python专家。请帮我:
1. 审查以下代码的bug
2. 解释问题原因
3. 提供修复方案
4. 给出单元测试

【代码】
{code}
"""

# 场景2: 多模态任务(图像理解)
# 推荐: GPT-4o (原生多模态,速度快)

gpt4o_multimodal_prompt = """
分析这张截图:
1. 识别这是什么应用
2. 提取所有文本内容
3. 分析UI设计特点
4. 给出改进建议

【图片】
{image}
"""

# 场景3: 长文档分析
# 推荐: Claude 3.5 (200K上下文,理解深入)

claude_long_context_prompt = """
分析这份100页的技术文档:
{long_document}

请提供:
1. 核心概念总结
2. 技术架构图
3. 关键API列表
4. 示例代码整理
"""

# 场景4: 实时交互应用
# 推荐: GPT-4o (响应速度快,成本低)

gpt4o_realtime_prompt = """
你是智能客服助手。用户会连续提问,请:
1. 记住对话上下文
2. 快速响应(每次<3秒)
3. 友好专业的语气
4. 必要时提供示例

用户: {user_message}
"""
```

### 2024-2026 Prompt 新趋势

#### 1. Agent-Ready Prompt

```python
# 为 Agent 设计的 Prompt (2024-2026热门)
agent_prompt = """
你是AI Agent,可以调用工具完成任务。

可用工具:
- search: 搜索网络信息
- calculator: 数学计算
- code_executor: 执行Python代码

工作流程:
1. 理解用户需求
2. 规划执行步骤
3. 选择合适工具
4. 观察执行结果
5. 给出最终答案

重要:
- 一步步思考,不要跳过步骤
- 每次只使用一个工具
- 观察结果后再决定下一步
- 如果工具失败,尝试替代方案

用户需求: {user_input}

请开始工作:
Thought 1:
"""
```

#### 2. 混合模型 Prompt

```python
# 2024-2026 最佳实践: 结合多个模型
def hybrid_model_approach(task):
    """混合模型策略"""

    # 第一步: 快速模型生成初稿
    draft = gpt4o_mini(f"快速生成{task}的大纲")

    # 第二步: 强大模型优化
    optimized = claude_35(f"""
    优化以下大纲:
    {draft}

    要求:
    1. 补充遗漏的要点
    2. 调整逻辑结构
    3. 添加实例说明
    4. 提供最佳实践
    """)

    # 第三步: 快速模型格式化
    final = gpt4o_mini(f"格式化为Markdown:\n{optimized}")

    return final

# 成本节省60%,质量提升30%
```

#### 3. 结构化输出 Prompt

```python
# 2024-2026: JSON Schema约束
structured_output_prompt = """
你是数据分析师。请分析销售数据,输出JSON格式:

数据:
{sales_data}

输出要求(JSON Schema):
```json
{{
  "type": "object",
  "properties": {{
    "total_revenue": {{
      "type": "number",
      "description": "总收入"
    }},
    "growth_rate": {{
      "type": "number",
      "description": "增长率(百分比)"
    }},
    "top_products": {{
      "type": "array",
      "items": {{
        "type": "object",
        "properties": {{
          "name": {{"type": "string"}},
          "sales": {{"type": "number"}},
          "trend": {{"type": "string", "enum": ["上升", "下降", "平稳"]}}
        }}
      }}
    }},
    "insights": {{
      "type": "array",
      "items": {{
        "type": "string",
        "description": "关键洞察(3-5条)"
      }}
    }}
  }},
  "required": ["total_revenue", "growth_rate", "top_products", "insights"]
}}
```

请严格遵循以上Schema输出。
"""

# GPT-4o 和 Claude 3.5 都支持结构化输出
```

### 2024-2026 Prompt 性能优化

```python
# 1. Token 优化技巧

# ❌ 冗余 Prompt
verbose_prompt = """
你是一个非常专业、经验丰富的Python编程专家,
拥有10年以上的开发经验,精通Web开发、
数据分析、机器学习等多个领域...
请详细解释Python装饰器...
"""

# ✅ 简洁 Prompt (GPT-4o/Claude 3.5 更擅长理解简洁指令)
concise_prompt = """
你是Python专家。请解释装饰器:
1. 概念(50字)
2. 代码示例
3. 3个应用场景
"""

# 2. 上下文压缩
def compress_context(long_context, model="claude-3-5-sonnet"):
    """智能压缩上下文"""

    # Claude 3.5 可以处理 200K,但仍需优化
    if model == "claude-3-5-sonnet":
        # 提取关键信息
        key_points = extract_key_info(long_context)
        return f"""
        【原文摘要】
        {summarize(long_context)}

        【关键信息】
        {key_points}

        【详细内容(按需)】
        {long_context[:50000]}  # 只保留前50K tokens
        """

    # GPT-4o 128K 上下文
    elif model == "gpt-4o":
        return long_context[:100000]  # 保留前100K

# 3. 流式 Prompt 优化
streaming_prompt = """
请逐步生成Python快速排序教程:
1. 第一步:概念介绍(3句话)
2. 第二步:算法原理(5句话)
3. 第三步:代码实现(带注释)
4. 第四步:复杂度分析
5. 第五步:实际应用

每生成一步就暂停,等待用户确认后再继续。
"""

# 配合流式输出,用户体验更好
```

---

## 不同场景的Prompt模板

### 代码生成

```python
code_gen_prompt = """
# 角色设定
你是一位{language}编程专家，拥有10年开发经验。

# 任务
{task_description}

# 技术要求
- 语言：{language}
- 框架：{framework}（可选）
- 风格：遵循PEP8规范
- 错误处理：包含异常处理

# 代码要求
1. 添加详细注释
2. 包含使用示例
3. 说明时间/空间复杂度
4. 提供测试用例

# 约束条件
{constraints}

# 输出格式
```python
# [功能说明]
def function_name():
    # [代码实现]
    pass

# [使用示例]
# example...

# [复杂度分析]
# Time: O(n)
# Space: O(1)
```
"""
```

### 代码审查

```python
code_review_prompt = """
# 角色设定
你是一位资深代码审查专家，专注于Python代码质量。

# 审查维度
1. **代码风格**
   - 命名规范
   - 代码格式
   - 注释质量

2. **潜在问题**
   - Bug风险
   - 边界情况
   - 错误处理

3. **性能分析**
   - 时间复杂度
   - 空间复杂度
   - 优化空间

4. **最佳实践**
   - 设计模式
   - Pythonic写法
   - 可维护性

# 待审查代码
```python
{code}
```

# 输出格式
## 总体评价
[评分：1-5星] [一句话总结]

## 详细反馈
### ✅ 做得好的地方
- ...

### ⚠️ 需要改进的地方
#### 问题1：[问题描述]
- 位置：第X行
- 问题：...
- 建议：...

### 💡 优化建议
- ...

## 改进后的代码
```python
...
```
"""
```

### 文档生成

```python
doc_gen_prompt = """
# 任务
为以下代码生成完整的文档字符串（Docstring）

# 代码
```python
{code}
```

# 文档要求
遵循Google Python Style Guide，包含：
1. 简要说明（一行）
2. 详细说明（多行）
3. 参数说明（Args）
4. 返回值说明（Returns）
5. 异常说明（Raises）
6. 使用示例（Examples）

# 输出格式
```python
def function_name(param1, param2):
    \"\"\"
    [简要说明]

    [详细说明]

    Args:
        param1 (type): [说明]
        param2 (type): [说明]

    Returns:
        type: [说明]

    Raises:
        Exception: [说明]

    Examples:
        >>> function_name(...)
        [结果]
    \"\"\"
    pass
```
"""
```

### 调试助手

```python
debug_prompt = """
# 角色
你是Python调试专家，擅长快速定位和解决代码问题。

# 问题描述
{error_message}

# 相关代码
```python
{code}
```

# 期望行为
{expected_behavior}

# 实际行为
{actual_behavior}

# 请按以下步骤调试
1. 问题诊断
   - 分析错误信息
   - 定位问题根源
   - 解释为什么会出错

2. 解决方案
   - 提供修复后的代码
   - 说明修复原理

3. 预防措施
   - 如何避免此类问题
   - 最佳实践建议

4. 学习要点
   - 涉及的Python知识点
   - 推荐的学习资源
"""
```

### 教学讲解

```python
teaching_prompt = """
# 角色
你是一位经验丰富的编程导师，擅长用通俗易懂的方式讲解技术概念。

# 教学对象
- 目标：{target_audience}  # 初学者/中级/高级
- 背景：{background}        # 已掌握的技能
- 目标：{learning_goal}     # 想要达成的目标

# 教学主题
{topic}

# 教学要求
1. **循序渐进**
   - 从简单到复杂
   - 用生活化的比喻
   - 避免一开始就讲太多术语

2. **实例驱动**
   - 每个概念配合示例
   - 代码要简洁明了
   - 添加详细注释

3. **互动思考**
   - 提出启发式问题
   - 鼓励动手尝试
   - 提供练习题

4. **总结提升**
   - 关键要点总结
   - 常见误区提示
   - 进阶学习建议

# 输出结构
## 📖 课前知识准备
...

## 💡 核心概念讲解
### 概念1：...
- **是什么**：...
- **为什么需要**：...
- **怎么用**：...
- **代码示例**：...

## 🎯 实战案例
...

## 🤔 思考与练习
...

## 📝 总结与建议
...
"""
```

---

## Prompt优化实战案例

### 案例1：从差Prompt到好Prompt

**原始Prompt（差）**：
```python
prompt = "写个爬虫"
```

**第一次优化（中等）**：
```python
prompt = """
用Python写一个爬虫，爬取豆瓣电影Top250的信息。
"""
```

**第二次优化（良好）**：
```python
prompt = """
请用Python编写一个豆瓣电影Top250的爬虫程序。

需要提取：
- 电影名称
- 评分
- 导演
- 主演
- 一句话简介

使用requests和BeautifulSoup库。
"""
```

**最终优化（优秀）**：
```python
prompt = """
# 任务
编写一个Python爬虫，爬取豆瓣电影Top250页面的电影信息

# 目标网站
https://movie.douban.com/top250

# 需要提取的数据
1. 电影名称
2. 评分（float类型）
3. 导演
4. 主演
5. 一句话简介

# 技术要求
- 使用requests库发送请求
- 使用BeautifulSoup解析HTML
- 添加随机的User-Agent
- 请求间隔2-5秒（随机）
- 数据保存为CSV文件

# 代码要求
1. 添加详细注释
2. 使用函数封装
3. 包含异常处理
4. 提供使用示例
5. 说明反爬策略

# 输出格式
```python
# 豆瓣电影Top250爬虫
import ...

def get_movie_info(url):
    \"\"\"
    获取单页电影信息

    Args:
        url: 页面URL

    Returns:
        list: 电影信息列表
    \"\"\"
    # 代码实现
    ...

# 使用示例
if __name__ == "__main__":
    ...
```
"""
```

### 案例2：复杂任务分解

**任务**：构建一个智能代码审查系统

```python
# Step 1: 代码风格检查
style_check_prompt = """
检查以下Python代码的风格问题：
- 命名规范
- 缩进格式
- 行长度
- 导入顺序

【代码】
"""

# Step 2: 潜在Bug识别
bug_detection_prompt = """
分析以下代码可能存在的Bug：
- 边界条件
- 异常处理
- 资源泄漏
- 并发问题

【代码】
"""

# Step 3: 性能分析
performance_prompt = """
分析以下代码的性能问题：
- 时间复杂度
- 空间复杂度
- 优化建议

【代码】
"""

# Step 4: 综合报告
final_report_prompt = """
根据以上分析结果，生成一份完整的代码审查报告。

审查结果：
【风格检查结果】
【Bug检测结果】
【性能分析结果】

请生成：
1. 总体评分（1-10分）
2. 主要问题列表（按优先级排序）
3. 每个问题的详细说明和修复建议
4. 改进后的完整代码
"""
```

---

## Prompt测试与迭代

### A/B测试

```python
# 测试两个不同的Prompt
prompts = {
    "A": "解释什么是Python装饰器",
    "B": """
    你是Python专家。请用以下结构解释装饰器：
    1. 比喻：用生活中的例子类比
    2. 定义：技术层面的解释
    3. 示例：简单代码示例
    4. 应用：3个实际使用场景
    """
}

# 评估维度：
# - 准确性
# - 可读性
# - 完整性
# - 实用性
```

### Prompt版本管理

```python
# 使用字典管理不同版本
PROMPT_VERSIONS = {
    "v1.0": {
        "prompt": "写个爬虫",
        "score": 3,
        "issues": ["不具体", "缺少约束"]
    },
    "v2.0": {
        "prompt": "用Python写豆瓣爬虫",
        "score": 5,
        "issues": ["缺少具体要求"]
    },
    "v3.0": {
        "prompt": "...",  # 完整版本
        "score": 9,
        "issues": []
    }
}

# 使用最佳版本
best_prompt = PROMPT_VERSIONS["v3.0"]["prompt"]
```

---

## 本章小结

### 核心要点

✅ **五大核心原则**：
1. 清晰具体（Be Specific）
2. 提供上下文（Provide Context）
3. 明确输出格式（Specify Format）
4. 使用示例（Use Examples）
5. 设定角色（Assign Role）

✅ **常用模式**：
- Chain of Thought（思维链）
- Few-shot Learning（少样本学习）
- Self-Consistency（自洽性）
- Generate Then Refine（先生成后优化）
- Role Playing（角色扮演）

✅ **高级技巧**：
- Tree of Thoughts（思维树）
- Reverse Prompting（逆向提示）
- Progressive Prompting（渐进式提示）
- Comparative Prompting（比较式提示）

### 实践建议

1. **从简单开始**：先构建基础Prompt，再逐步优化
2. **持续迭代**：通过测试不断改进Prompt
3. **建立模板库**：积累常用场景的Prompt模板
4. **A/B测试**：对比不同Prompt的效果
5. **版本管理**：记录Prompt的演进过程

---

## 练习题

### 练习1：优化Prompt

将以下差Prompt优化为优秀Prompt：

```python
bad_prompt = "写个排序算法"
```

### 练习2：Few-shot Learning

创建一个情感分类的Few-shot Prompt，至少包含3个示例。

### 练习3：角色扮演

设计一个"产品经理"角色的Prompt，用于生成产品需求文档。

### 练习4：思维链

使用CoT技巧，让AI解决一个复杂的数学问题。

### 挑战：构建Prompt模板系统

创建一个Prompt模板管理器，支持：
- 多场景模板
- 参数化输入
- 版本控制
- 效果评估

---

## 常见问题 FAQ

### Q1: 如何判断一个Prompt是否写得好？

**A:**

```python
# 优秀的Prompt评估标准：

✅ SMART原则：
Specific（具体）
  - 明确的目标和要求
  - 清晰的任务描述
  - 详细的约束条件

Measurable（可衡量）
  - 可以评估输出质量
  - 有明确的成功标准
  - 可量化的要求

Achievable（可达成）
  - 在模型能力范围内
  - 要求不过于苛刻
  - 现实的期望

Relevant（相关）
  - 提供必要的上下文
  - 与目标高度相关
  - 避免无关信息

Time-bound（有界）
  - 明确输出长度限制
  - 时间/复杂度约束
  - 清晰的格式要求

# 评估清单：
[ ] 任务描述清晰明确
[ ] 提供了足够的上下文
[ ] 说明了输出格式
[ ] 给出了示例（如需要）
[ ] 设定了角色（如需要）
[ ] 包含了约束条件
[ ] 使用了结构化格式
[ ] 考虑了边界情况

# 实际测试：
1. 多次运行，看输出是否一致
2. 给不同人测试，看是否都能理解
3. 对比输入输出，看是否符合预期
4. 检查是否有遗漏或歧义
```

### Q2: Few-shot Learning中给几个示例最合适？

**A:**

```python
✅ Few-shot示例数量建议：

根据任务复杂度：
简单任务：3-5个示例
  - 情感分类
  - 简单问答
  - 文本分类

中等任务：5-10个示例
  - 代码生成
  - 文本摘要
  - 数据转换

复杂任务：10-20个示例
  - 复杂推理
  - 多步骤任务
  - 创意写作

❌ 示例太少的问题：
- 模型理解不充分
- 输出不稳定
- 容易产生幻觉

❌ 示例太多的问题：
- 消耗过多Token
- 可能导致过拟合
- 响应速度变慢

✅ 示例质量比数量重要：
# 好的示例特征：
1. 代表性强（覆盖主要场景）
2. 多样性好（不同类型情况）
3. 难度适中（不要太简单或复杂）
4. 格式统一（便于模型理解）

# 示例选择策略：
# 1. 从易到难排序
# 2. 包含边界情况
# 3. 展示错误示例（对比学习）
# 4. 更新示例（根据效果迭代）
```

### Q3: Chain of Thought（CoT）总是有效吗？

**A:**

```python
✅ CoT适用场景：
- 数学推理题
- 逻辑推理
- 多步骤问题
- 需要解释的任务
- 复杂决策

✅ CoT的优势：
# 示例：数学问题
prompt = """
小明买了5支铅笔，每支2元。
又买了3本笔记本，每本8元。
他付了50元，应该找回多少钱？

请一步步思考：
1. 计算铅笔总价
2. 计算笔记本总价
3. 计算总花费
4. 计算找回的钱
"""

效果：准确率从60%提升到95%

❌ CoT不适用场景：
- 简单任务（如：文本分类）
- 创意写作（限制发挥）
- 快速响应（增加延迟）
- Token敏感（消耗较多）

✅ 改进CoT的方法：

# 1. Zero-shot CoT（不需要示例）
prompt = """
问题：...
请一步步思考，然后给出答案。
"""

# 2. Auto-CoT（自动生成推理过程）
prompt = """
问题：...

思考过程：
1. 首先，...
2. 然后，...
3. 最后，...

答案：...
"""

# 3. Self-Consistency（多次推理取共识）
# 生成多个推理路径，选择最一致的答案

# 选择建议：
- 数学/逻辑题 → 必用CoT
- 简单分类 → 不需要CoT
- 复杂任务 → 建议用CoT
- Token敏感 → 考虑简化CoT
```

### Q4: 如何让AI输出特定格式（如JSON、Markdown）？

**A:**

```python
# 方法1：明确指定格式
prompt = """
请分析以下文本的情感，以JSON格式输出：
{
    "sentiment": "正面/负面/中性",
    "confidence": 0.95,
    "keywords": ["关键词1", "关键词2"]
}

文本：今天天气真好，心情特别棒！
"""

# 方法2：提供完整示例
prompt = """
任务：情感分析

输出格式：
```json
{
    "sentiment": "情感倾向",
    "score": 分数(0-1),
    "reasoning": "判断理由"
}
```

示例：
文本："产品质量很差，不推荐"
输出：
```json
{
    "sentiment": "负面",
    "score": 0.9,
    "reasoning": "包含负面词汇'很差'，表达明确的否定态度"
}
```

现在分析：
文本："服务态度很好，但物流太慢了"
输出：
"""

# 方法3：使用Pydantic约束（LangChain）
from pydantic import BaseModel, Field

class SentimentAnalysis(BaseModel):
    sentiment: str = Field(description="情感倾向")
    confidence: float = Field(description="置信度", ge=0, le=1)

parser = PydanticOutputParser(pydantic_object=SentimentAnalysis)
format_instructions = parser.get_format_instructions()

prompt = f"""
分析文本的情感。

{format_instructions}

文本：...
"""

# 方法4：多轮引导
prompt = """
第一步：分析文本情感
文本："..."

第二步：格式化输出为JSON
{"sentiment": "...", "confidence": ...}

第三步：验证JSON格式是否正确
"""

# 最佳实践：
✅ 在prompt中明确格式
✅ 提供完整示例
✅ 使用代码块包裹
✅ 考虑使用解析器验证
❌ 不要假设模型自动理解
```

### Q5: 如何处理AI回答不准确或产生幻觉的问题？

**A:**

```python
# 问题：AI产生幻觉（编造内容）

✅ 解决方法：

# 1. 提供ground truth（正确信息）
prompt = """
你是一个Python专家。请根据以下官方文档回答问题。

【参考文档】
Python官方文档：装饰器是...
...

【问题】
什么是装饰器？

要求：
- 只使用参考文档中的信息
- 不要编造内容
- 如果文档中没有，明确说明
"""

# 2. 要求引用来源
prompt = """
请回答以下问题，并引用信息来源。

问题：Python 3.11有哪些新特性？

要求：
- 每个特性都要引用官方文档或PEP
- 格式：[特性描述] - 来源：[具体引用]
- 不确定的信息不要写
"""

# 3. 降低temperature
# 设置更低的temperature让输出更确定
model = ChatOpenAI(temperature=0.1)  # 默认0.7

# 4. 添加不确定性声明
prompt = """
请回答以下问题。

要求：
- 确定的信息直接回答
- 不确定的信息说"可能"
- 完全不知道的信息说"不清楚"
- 不要编造内容

问题：...
"""

# 5. 使用RAG（检索增强生成）
# 从知识库中检索相关内容，让AI基于真实信息回答

# 6. 验证和反思
prompt = """
【第一步】回答问题
问题：...

【第二步】验证答案
请检查你的答案：
1. 哪些是确定的信息？
2. 哪些是不确定的？
3. 哪些可能是错误的？

【第三步】改进答案
根据验证结果，改进你的答案。
"""

# 选择建议：
- 事实性问题 → 使用RAG
- 创造性任务 → 允许一定幻觉
- 重要内容 → 人工验证
- 需要准确性 → 降低temperature
```

### Q6: 如何让Prompt适应不同的用户水平？

**A:**

```python
# 方法1：根据用户水平调整Prompt

def create_prompt(topic, user_level):
    """根据用户水平创建不同的Prompt"""

    prompts = {
        "初学者": f"""
        你是一位经验丰富的编程导师。

        请用最简单的方式解释{topic}：
        1. 用生活化的比喻
        2. 避免专业术语
        3. 每个概念配简单示例
        4. 字数控制在300字内

        就像给完全不懂编程的朋友讲解一样。
        """,

        "中级": f"""
        你是一位技术专家。

        请深入讲解{topic}：
        1. 技术原理和实现
        2. 代码示例和用法
        3. 最佳实践
        4. 常见陷阱

        假设读者有1-2年编程经验。
        """,

        "高级": f"""
        你是这个领域的权威专家。

        请全面解析{topic}：
        1. 底层原理和源码分析
        2. 高级技巧和优化
        3. 设计模式和架构
        4. 前沿发展和趋势

        假设读者是资深工程师，追求深度理解。
        """
    }

    return prompts[user_level]

# 方法2：让用户自定义详细程度
prompt = """
请解释Python装饰器。

用户可以根据需求选择：
- 选项1：简单理解（5分钟）
- 选项2：深入学习（20分钟）
- 选项3：专家掌握（1小时）

请询问用户需要哪种程度，然后提供对应深度的内容。
"""

# 方法3：渐进式讲解
prompt = """
【第一步】概念入门（100字）
用一句话解释什么是装饰器。

【第二步】基础理解（300字）
用简单例子说明装饰器的作用。

【第三步】深入学习（完整讲解）
详细讲解原理、用法、高级技巧。

用户可以根据需要逐步深入。
"""

# 方法4：自适应深度
prompt = """
请解释Python装饰器。

先提供一个简短版本（200字）。
然后问用户是否需要更详细的解释：
- 如果需要，提供完整版本
- 如果不需要，提供简单示例即可
"""

# 最佳实践：
✅ 了解目标受众
✅ 提供不同深度的选项
✅ 使用可理解的语言
✅ 包含适当的示例
✅ 允许用户选择详细程度
```

### Q7: Prompt太长怎么办？如何优化Token消耗？

**A:**

```python
# 问题：Prompt过长导致：
# 1. Token消耗大
# 2. 响应速度慢
# 3. 可能超出限制

✅ Token优化策略：

# 1. 删除冗余内容
# ❌ 冗长版本
prompt = """
你是一个专业的Python编程专家，拥有10年的开发经验，
擅长Web开发、数据分析、机器学习等多个领域。
...

请详细解释Python装饰器的概念和用法。
"""

# ✅ 简洁版本
prompt = """
你是Python专家。请解释装饰器的概念和用法。
"""

# 2. 使用模板 + 参数化
# 创建简洁的模板
CODE_REVIEW_TEMPLATE = """
审查以下{language}代码：
{code}

关注点：{focus_areas}
输出格式：{format}
"""

# 使用时填充
prompt = CODE_REVIEW_TEMPLATE.format(
    language="Python",
    code=code_snippet,
    focus_areas="性能、安全、可读性",
    format="列表"
)

# 3. 分步进行（避免一次性提供大量信息）
# ❌ 一次性给出所有要求
prompt = """
写一个Python爬虫，要求：
1. 使用requests和bs4
2. 支持代理
3. 支持cookie
4. 数据存储到数据库
5. 支持断点续传
6. 支持多线程
7. 添加日志
8. 异常处理
9. 代码注释
10. 使用示例
...（50行要求）
"""

# ✅ 分步迭代
# Step 1: 基础版本
prompt1 = "写一个简单的Python爬虫，使用requests和bs4"

# Step 2: 添加功能
prompt2 = """
在以上代码基础上添加：
- 代理支持
- 数据存储
- 异常处理
"""

# 4. 使用引用代替重复内容
# ❌ 重复内容
prompt = """
分析以下代码的：
1. 代码风格
2. 性能问题
3. 安全问题
4. 可读性
5. 可维护性
6. 测试覆盖
7. 文档完整性
8. 错误处理

【代码】
"""

# ✅ 引用
CODE_QUALITY_ASPECTS = [
    "代码风格", "性能", "安全", "可读性",
    "可维护性", "测试", "文档", "错误处理"
]

prompt = f"""
分析以下代码在以下方面的质量：
{', '.join(CODE_QUALITY_ASPECTS)}

【代码】
"""

# 5. 使用结构化格式（省略token）
# ❌ 自然语言描述
prompt = """
请按照以下结构输出：
第一部分是代码分析
第二部分是问题列表
第三部分是改进建议
第四部分是改进后的代码
每个部分之间用分隔线分开
"""

# ✅ 使用符号标记
prompt = """
输出格式：
## 代码分析
...
## 问题列表
...
## 改进建议
...
## 改进代码
...
"""

# 6. 缓存常用Prompt
from langchain.cache import InMemoryCache
set_llm_cache(InMemoryCache())

# 相同的Prompt会从缓存读取，不消耗Token

# Token优化检查清单：
[ ] 删除了冗余描述
[ ] 使用了模板化
[ ] 避免了重复内容
[ ] 采用了分步策略
[ ] 使用了结构化格式
[ ] 设置了合理的长度限制
```

### Q8: 如何设计多轮对话的Prompt？

**A:**

```python
# 多轮对话的Prompt设计要点：

✅ 方法1：维护对话历史

# 使用LangChain的Memory
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是Python编程专家"),
    MessagesPlaceholder(variable_name="history"),  # 对话历史
    ("human", "{input}")
])

memory = ConversationBufferMemory(return_messages=True)

# 每轮对话自动更新历史
history = memory.chat_memory.messages

✅ 方法2：渐进式Prompt

# 第一轮：了解需求
prompt1 = """
你好！我是Python助手。请告诉我你想学什么？
- 基础语法
- 进阶特性
- 实战项目
- 问题解决
"""

# 第二轮：根据回答深入
prompt2 = """
你选择了"基础语法"。请问：
1. 你有编程基础吗？
2. 想从哪里开始？
   - 变量和数据类型
   - 控制流
   - 函数
   - 面向对象
"""

# 第三轮：提供定制内容
prompt3 = """
根据你的情况，我来介绍Python基础...

【内容】

有什么疑问吗？
"""

✅ 方法3：上下文累积

# 在Prompt中包含之前的对话摘要
prompt = """
【对话历史摘要】
用户是Python初学者，想学习基础语法。
已经讲解了变量和数据类型，用户理解了。
用户问："接下来学什么？"

【当前任务】
建议用户学习控制流（if/for/while），并提供：
1. 简要说明
2. 代码示例
3. 练习题

请保持友好的导师风格。
"""

✅ 方法4：状态机模式

# 定义对话状态
CONVERSATION_STATES = {
    "greeting": "欢迎",
    "topic_selection": "选择主题",
    "learning": "学习中",
    "practice": "练习中",
    "review": "复习中"
}

current_state = "topic_selection"

if current_state == "topic_selection":
    prompt = "请选择你想学习的主题..."
elif current_state == "learning":
    prompt = f"正在学习{current_topic}，请提供详细内容..."
elif current_state == "practice":
    prompt = f"为{current_topic}设计练习题..."

# 多轮对话最佳实践：
✅ 明确每轮对话的目标
✅ 保存必要的上下文
✅ 引用之前的对话内容
✅ 使用Memory组件管理
✅ 定期总结（避免历史太长）
✅ 提供明确的引导
❌ 不要每轮重复完整Prompt
❌ 不要让历史无限增长
```

### Q9: 如何评估Prompt的效果？

**A:**

```python
# Prompt效果评估方法：

✅ 方法1：定量评估

import json
from datetime import datetime

# 记录测试结果
def evaluate_prompt(prompt, test_cases, criteria):
    """
    评估Prompt效果

    Args:
        prompt: 要测试的Prompt
        test_cases: 测试用例列表
        criteria: 评估标准字典

    Returns:
        评估报告
    """
    results = []

    for i, test_case in enumerate(test_cases):
        # 执行Prompt
        response = llm.invoke(prompt.format(**test_case))

        # 评估各项指标
        scores = {}
        for criterion, weight in criteria.items():
            score = evaluate_criterion(response, criterion)
            scores[criterion] = score * weight

        # 记录结果
        results.append({
            "test_case": test_case,
            "response": response,
            "scores": scores,
            "total_score": sum(scores.values())
        })

    # 生成报告
    report = {
        "timestamp": datetime.now().isoformat(),
        "prompt": prompt,
        "total_cases": len(test_cases),
        "average_score": sum(r["total_score"] for r in results) / len(results),
        "results": results
    }

    return report

# 评估标准示例
criteria = {
    "accuracy": 0.4,      # 准确性
    "completeness": 0.3,  # 完整性
    "relevance": 0.2,     # 相关性
    "clarity": 0.1        # 清晰度
}

✅ 方法2：A/B测试

def ab_test(prompt_a, prompt_b, test_cases):
    """A/B测试两个Prompt"""

    results_a = [evaluate_prompt(prompt_a, [case]) for case in test_cases]
    results_b = [evaluate_prompt(prompt_b, [case]) for case in test_cases]

    score_a = sum(r["total_score"] for r in results_a) / len(results_a)
    score_b = sum(r["total_score"] for r in results_b) / len(results_b)

    return {
        "prompt_a_score": score_a,
        "prompt_b_score": score_b,
        "winner": "A" if score_a > score_b else "B",
        "improvement": abs(score_a - score_b) / min(score_a, score_b) * 100
    }

✅ 方法3：人工评估

# 评估检查表
evaluation_checklist = """
请评估以下AI回答（1-5分）：

□ 准确性：回答是否正确无误
□ 完整性：是否覆盖所有要点
□ 相关性：是否切合问题
□ 清晰性：是否易于理解
□ 实用性：是否有实际价值
□ 创造性：是否有独到见解
□ 格式：输出格式是否符合要求

总分：____ / 35

具体反馈：
- 做得好的地方：
- 需要改进的地方：
"""

✅ 方法4：自动化测试

def automated_tests(response, expected_format):
    """自动化测试输出"""

    tests = {
        "has_json": lambda x: "{" in x and "}" in x,
        "has_code_block": lambda x: "```" in x,
        "length_ok": lambda x: 100 < len(x) < 1000,
        "no_hallucination": lambda x: "可能" not in x or "不确定" in x
    }

    results = {}
    for test_name, test_func in tests.items():
        try:
            results[test_name] = test_func(response)
        except:
            results[test_name] = False

    return results

✅ 方法5：迭代优化

# 记录优化过程
prompt_iterations = [
    {
        "version": "v1.0",
        "prompt": "...",
        "score": 6.5,
        "issues": ["不够具体", "缺少示例"]
    },
    {
        "version": "v1.1",
        "prompt": "...",
        "score": 7.2,
        "issues": ["格式不够清晰"]
    },
    {
        "version": "v1.2",
        "prompt": "...",
        "score": 8.8,
        "issues": []
    }
]

# 评估流程建议：
1. 定义评估标准
2. 准备测试用例（覆盖主要场景）
3. 执行测试（定量 + 定性）
4. 分析结果
5. 识别问题
6. 优化Prompt
7. 重新测试
8. 记录迭代过程
```

### Q10: Prompt Engineering和模型微调有什么区别？如何选择？

**A:**

```python
Prompt Engineering vs 模型微调 对比：

┌─────────────┬──────────────────┬──────────────────┐
│   维度      │ Prompt Engineering │   模型微调       │
├─────────────┼──────────────────┼──────────────────┤
│ 成本        │ 极低              │ 高               │
│ 时间        │ 即时              │ 数天到数周       │
│ 技术门槛    │ 低                │ 高               │
│ 数据需求    │ 少/无             │ 大量标注数据     │
│ 灵活性      │ 高（随时调整）    │ 低（固定）       │
│ 适用范围    │ 通用模型          │ 特定任务         │
│ 效果上限    │ 中等              │ 高               │
│ 可维护性    │ 易于维护          │ 需要版本管理     │
└─────────────┴──────────────────┴──────────────────┘

✅ 使用Prompt Engineering的场景：

# 1. 快速原型开发
prompt = "你是Python专家，请解释装饰器"
# 立即得到结果，无需等待

# 2. 多样化任务
# 今天写代码，明天写文案，后天做翻译
# 使用Prompt可以灵活切换

# 3. 成本敏感
# 只需消耗Token，无需GPU资源
# 适合初创公司或个人项目

# 4. 频繁迭代
# 需求经常变化，Prompt可以快速调整

# 5. 通用任务
# 问答、摘要、翻译等通用任务
# 通用模型 + 好Prompt效果已经很好

✅ 使用模型微调的场景：

# 1. 特定领域任务
# 医疗诊断、法律文书、金融分析
# 需要大量专业知识

# 2. 格式化输出要求极高
# 需要严格符合特定格式
# Prompt很难保证100%一致

# 3. 性能优化
# 需要更快的推理速度
# 或者更低的延迟

# 4. 数据安全
# 不能将数据发送到外部API
# 需要部署私有模型

# 5. 长期大量使用
# 微调成本可以被摊薄
# 长期看更经济

💡 混合策略（推荐）：

# 第一阶段：Prompt Engineering
# 快速验证想法，积累数据

# 第二阶段：收集数据
# 记录好的输入输出对
# 标注高质量数据

# 第三阶段：评估需求
# 如果Prompt效果不足
# 考虑微调

# 第四阶段：微调 + Prompt
# 微调提升基础能力
# Prompt引导具体输出

示例：

# 初始：只用Prompt
prompt = """
你是医疗AI助手。请根据症状给出诊断建议。
【症状】
"""

# 积累数据后：微调模型
# fine_tune_model(symptoms_diagnosis_data)

# 微调后：仍然用Prompt引导
prompt = """
你是专业医生（模型已微调）。
请根据以下症状给出诊断：
1. 可能的疾病（按概率排序）
2. 建议的检查
3. 治疗方案

【症状】
"""

# 选择决策树：
是否需要？
→ 成本敏感？
  → 是 → Prompt Engineering
  → 否 → 继续判断

→ 任务特殊？
  → 是（医疗/法律等）→ 考虑微调
  → 否 → 继续判断

→ 数据充足？
  → 是 → 可以微调
  → 否 → 先用Prompt，收集数据

→ 需要灵活调整？
  → 是 → Prompt Engineering
  → 否 → 考虑微调

# 实际建议：
- 90%的情况：先用Prompt Engineering
- 积累数据和经验后再考虑微调
- 不要一开始就微调（浪费资源）
```

---

## 学习清单

检查你掌握了以下技能：

### 基础概念 ✅

- [ ] 理解Prompt Engineering的定义和价值
- [ ] 掌握Prompt的基本结构要素
- [ ] 理解为什么需要精心设计Prompt
- [ ] 能够识别好的和坏的Prompt

### 核心原则 ✅

- [ ] 掌握"清晰具体"原则
- [ ] 理解"提供上下文"的重要性
- [ ] 能够明确指定输出格式
- [ ] 熟练使用示例（Few-shot）
- [ ] 能够设定角色和任务

### 提示词模式 ✅

- [ ] 理解并会使用思维链（CoT）
- [ ] 掌握Few-shot Learning技巧
- [ ] 了解自洽性（Self-Consistency）
- [ ] 会使用"先生成后优化"模式
- [ ] 熟练运用角色扮演技巧

### 高级技巧 ✅

- [ ] 理解思维树（Tree of Thoughts）
- [ ] 会使用逆向提示（Reverse Prompting）
- [ ] 掌握渐进式提示（Progressive Prompting）
- [ ] 能够使用比较式提示
- [ ] 理解反思与改进技巧

### 实战能力 ✅

- [ ] 能够为不同场景设计Prompt模板
- [ ] 能够优化不满意的Prompt
- [ ] 掌握Prompt测试方法
- [ ] 能够进行A/B测试
- [ ] 理解Token优化策略
- [ ] 能够设计多轮对话Prompt

### 最佳实践 ✅

- [ ] 建立自己的Prompt模板库
- [ ] 理解Prompt版本管理
- [ ] 掌握Prompt迭代方法
- [ ] 能够评估Prompt效果
- [ ] 了解Prompt Engineering的局限性
- [ ] 知道何时需要模型微调

---

## 进阶练习

### 练习1：优化实战

**任务**：将以下Prompt优化到9分以上（满分10分）

```python
bad_prompt = "写个爬虫"
```

**要求**：
1. 逐步优化（至少3个版本）
2. 每个版本都要说明改进点
3. 最终版本要包含：角色、任务、约束、格式、示例
4. 测试并比较效果

**评分标准**：
- 清晰度（2分）
- 完整性（3分）
- 可执行性（3分）
- 格式规范（2分）

### 练习2：Few-shot Learning实战

**任务**：为代码审查任务创建Few-shot Prompt

**要求**：
1. 设计5-8个代码示例
2. 示例要覆盖不同问题类型：
   - 风格问题
   - 性能问题
   - 安全问题
   - 边界情况
3. 每个示例包含：
   - 问题代码
   - 问题说明
   - 改进建议
4. 测试Few-shot效果

### 练习3：复杂任务分解

**任务**：使用"渐进式提示"完成复杂任务

**场景**：构建一个Python代码生成器

**步骤**：
1. 第一层：理解需求
   - 询问用户想生成什么代码
   - 了解功能需求
   - 明确技术栈

2. 第二层：设计架构
   - 设计代码结构
   - 确定类和函数
   - 规划模块划分

3. 第三层：生成代码
   - 逐步生成代码
   - 添加注释
   - 处理边界情况

4. 第四层：测试优化
   - 提供测试用例
   - 性能优化建议
   - 使用文档

**输出**：完整的代码生成系统

### 练习4：多轮对话设计

**任务**：设计一个Python学习助手的多轮对话

**要求**：
1. 至少5轮对话
2. 每轮对话有明确目标
3. 维护对话上下文
4. 根据用户反馈调整
5. 最终输出学习计划

**场景示例**：
- 第1轮：了解用户背景
- 第2轮：确定学习目标
- 第3轮：制定学习计划
- 第4轮：提供学习资源
- 第5轮：设计练习题

### 练习5：Prompt效果评估系统

**任务**：构建一个Prompt评估工具

**功能**：
1. 输入：Prompt + 测试用例
2. 执行：运行多个测试
3. 评估：自动评分
4. 对比：对比不同版本
5. 报告：生成详细报告

**评估维度**：
- 准确性
- 完整性
- 相关性
- 清晰性
- 实用性

**输出格式**：
```json
{
    "prompt_version": "v2.0",
    "total_score": 8.5,
    "test_results": [...],
    "improvements": [...]
}
```

---

## 实战项目

### 项目1：智能代码生成系统

**目标**：构建一个可以根据自然语言描述生成代码的系统

**要求**：
1. 支持多种编程语言
2. 可以生成特定功能的代码
3. 包含错误处理和注释
4. 提供使用示例

**涉及技能**：
- 角色设定
- Few-shot Learning
- 代码格式化
- 输出解析

### 项目2：Prompt模板库

**目标**：创建一个可复用的Prompt模板库

**要求**：
1. 至少包含10个场景模板：
   - 代码生成
   - 代码审查
   - 文档生成
   - Bug调试
   - 性能优化
   - 代码重构
   - 单元测试
   - API设计
   - 架构设计
   - 技术选型
2. 每个模板支持参数化
3. 提供使用示例
4. 包含最佳实践

**技术实现**：
```python
class PromptLibrary:
    def get_template(self, scenario, **kwargs):
        """获取特定场景的Prompt模板"""

    def list_scenarios(self):
        """列出所有可用场景"""

    def customize_template(self, scenario, modifications):
        """自定义模板"""
```

### 项目3：Prompt优化工具

**目标**：自动化优化Prompt的工具

**功能**：
1. 分析现有Prompt的问题
2. 提供改进建议
3. 自动生成优化版本
4. A/B测试对比

**实现思路**：
```python
class PromptOptimizer:
    def analyze(self, prompt):
        """分析Prompt的问题"""

    def suggest_improvements(self, prompt):
        """提供改进建议"""

    def optimize(self, prompt, suggestions):
        """应用优化"""

    def evaluate(self, original, optimized):
        """评估优化效果"""
```

---

## 学习资源

### 推荐阅读

1. **OpenAI官方文档**
   - Prompt Engineering指南
   - Best Practices
   - Examples

2. **Anthropic's Claude Prompt Library**
   - 大量实用Prompt示例
   - 不同场景的模板

3. **Prompt Engineering Guide**
   - 系统化的教程
   - 最新研究进展

### 实践平台

- **OpenAI Playground**：快速测试Prompt
- **LangSmith**：调试和评估Prompt
- **PromptBase**：Prompt市场

### 社区资源

- **Reddit**：r/LocalLLaMA, r/OpenAI
- **Discord**：AI开发社区
- **GitHub**：开源Prompt项目

---

**下一章：[RAG检索增强生成 →](chapter-04)**
