# 应用进阶

## 本章导读

恭喜你进入进阶学习！本章将介绍AI应用开发的前沿技术和高级主题，帮助你构建更强大、更专业的AI应用。

**学习目标**：
- 了解主流LLM模型的特点和选择策略
- 掌握Claude等其他模型API的使用
- 学习MCP协议和LangGraph框架
- 掌握AI应用的评估和测试方法

**预计学习时间**：80分钟

---

## 主流LLM模型对比 {#主流llm模型对比}

### 模型全景图

```
┌─────────────────────────────────────────────────────┐
│            大语言模型生态全景 (2024-2026)            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔵 闭源商业模型 (2024-2026)                        │
│  ├── GPT-4o / GPT-4o-mini (OpenAI)                 │
│  ├── Claude 3.5 Sonnet / Claude 4.0 (Anthropic)    │
│  ├── Gemini 2.0 Pro (Google)                       │
│  └── DeepSeek-V3 (深度求索)                        │
│                                                     │
│  🟢 开源模型 (2024-2026)                            │
│  ├── Llama 3.3 / 3.2 (Meta)                        │
│  ├── Qwen 2.5 (阿里)                               │
│  ├── Mistral Large 2 (Mistral AI)                  │
│  ├── DeepSeek-V2 / V3 (深度求索)                   │
│  └── Phi-4 (Microsoft)                             │
│                                                     │
│  🟡 本地部署框架                                     │
│  ├── Ollama (轻量级)                                │
│  ├── vLLM (高性能推理)                              │
│  ├── LM Studio (图形界面)                           │
│  └── TensorRT-LLM (NVIDIA优化)                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 主流模型详细对比 (2024-2026)

| 模型 | 开发者 | 上下文 | 优势 | 劣势 | 价格 | 最适合场景 |
|------|--------|--------|------|------|------|-----------|
| **Claude 3.5 Sonnet** | Anthropic | 200K | 综合最强、Artifacts | 价格高 | $$$$ | 复杂任务、代码、2024首选 |
| **Claude 4.0 Opus** | Anthropic | 200K+ | 最强推理能力 | 价格极高 | $$$$$ | 2025最复杂任务 |
| **GPT-4o** | OpenAI | 128K | 多模态、速度快 | 上下文较小 | $$$ | 多模态应用、实时对话 |
| **GPT-4o-mini** | OpenAI | 128K | 性价比最高 | 能力略弱 | $ | 高频简单任务 |
| **DeepSeek-V3** | 深度求索 | 128K | 免费开源、MoE | 需要部署 | 免费 | 中文、本地部署 |
| **Llama 3.3 70B** | Meta | 128K | 开源最强 | 需要部署 | 免费 | 本地部署 |
| **Qwen 2.5 72B** | 阿里 | 128K | 中文最强 | 需要部署 | 免费 | 中文场景 |
| **Gemini 2.0 Pro** | Google | 1M+ | 超长上下文 | 稳定性 | $$$$ | 超长文档分析 |
| **Phi-4** | Microsoft | 128K | 小而美 | 能力有限 | 免费 | 边缘设备 |

### 模型选择策略 (2024-2026更新)

#### 决策树

```
开始选择 (2024-2026)
  ↓
需要处理超长文档(>500K tokens)?
  ├─ 是 → Gemini 2.0 Pro (1M+ 上下文)
  └─ 否 ↓
      需要最强的综合能力(代码+推理)?
      ├─ 是 → Claude 3.5 Sonnet / Claude 4.0 Opus
      └─ 否 ↓
          需要多模态(图像+音频+视频)?
          ├─ 是 → GPT-4o
          └─ 否 ↓
              预算有限或高频调用?
              ├─ 是 → GPT-4o-mini / DeepSeek-V3
              └─ 否 ↓
                  需要中文优化?
                  ├─ 是 → Qwen 2.5 / DeepSeek-V3
                  └─ 否 → Claude 3.5 Sonnet
```

#### 2024-2026推荐组合

**个人开发者/小团队**：
```yaml
主力模型: Claude 3.5 Sonnet
  - 综合能力最强
  - Artifacts功能强大
  - 适合复杂任务

备用模型: GPT-4o-mini
  - 性价比最高
  - 高频简单任务
  - 降低成本

本地模型: DeepSeek-V3
  - 敏感数据处理
  - 离线环境
  - 零成本
```

**企业级应用**：
```yaml
核心业务: Claude 4.0 Opus
  - 最强推理能力
  - 关键决策任务

多模态: GPT-4o
  - 图像、音频处理
  - 实时交互

微调模型: Qwen 2.5 / Llama 3.3
  - 领域专家
  - 部署在内网
```

#### 具体建议 (2024-2026)

```python
# 场景1：代码生成和调试 (2024-2026首选)
推荐模型：Claude 3.5 Sonnet
理由：
- 2024年代码能力最强
- Artifacts功能可直接运行代码
- 理解复杂架构
- 支持大型项目重构

备选：GPT-4o (实时性要求高)

# 场景2：长文档分析
推荐模型：Claude 3.5 Sonnet / Gemini 2.0 Pro
理由：
- Claude: 200K上下文，分析深入
- Gemini: 超长文档(>500K tokens)
- 不易遗漏细节
- 支持多文档对比

# 场景3：高频聊天机器人 (2024-2026成本优化)
推荐模型：GPT-4o-mini / DeepSeek-V3
理由：
- GPT-4o-mini: 性价比最高($0.15/1M tokens)
- DeepSeek-V3: 开源免费
- 响应速度快
- 用户体验好

# 场景4：敏感数据处理 (2024-2026本地部署)
推荐模型：DeepSeek-V3 / Qwen 2.5 72B
理由：
- MoE架构，性能接近GPT-4
- 数据不出域
- 隐私安全
- 部署成本可控

# 场景5：多模态应用 (2024-2026原生多模态)
推荐模型：GPT-4o / Gemini 2.0 Pro
理由：
- 原生多模态(图像+音频+视频)
- 实时语音对话
- 理解视频内容
- 综合能力强

# 场景6：AI Agent开发 (2024-2026新场景)
推荐模型：Claude 3.5 Sonnet
理由：
- 推理能力强
- 工具调用稳定
- 支持复杂决策
- 适合多Agent协作

# 场景7：前端+AI开发 (2024-2026热门)
推荐模型：Claude 3.5 Sonnet + Artifacts
理由：
- Artifacts实时预览
- 生成完整Vue/React组件
- 支持迭代修改
- 开发效率提升10倍
```

---

## 2024-2026 AI技术热点

### Claude 3.5 Sonnet - 2024年度模型

**核心特性**：

```python
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")

# 1. Artifacts功能 - 代码实时预览
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": "创建一个Vue3待办事项组件，支持拖拽排序"
    }]
)

# Artifacts会在右侧面板实时渲染代码
# 支持HTML/CSS/JavaScript/Vue/React等

# 2. 超长上下文处理
long_text = open("huge_document.txt").read()  # 200K tokens

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=8192,
    messages=[{
        "role": "user",
        "content": f"分析以下文档并提取关键信息：\n{long_text}"
    }]
)

# 3. 复杂代码重构
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=16384,
    messages=[{
        "role": "user",
        "content": """
        我有一个大型Vue项目，请帮我：
        1. 将Options API改为Composition API
        2. 添加TypeScript类型
        3. 优化性能
        [项目代码...]
        """
    }]
)
```

**Artifacts实战案例**：

```vue
<!-- Claude 3.5 Sonnet生成的Vue组件 -->
<template>
  <div class="todo-app">
    <h2>{{ title }}</h2>
    <input
      v-model="newTodo"
      @keyup.enter="addTodo"
      placeholder="添加新任务..."
    />
    <TransitionGroup name="list" tag="ul">
      <li
        v-for="todo in sortedTodos"
        :key="todo.id"
        draggable="true"
        @dragstart="onDragStart($event, todo)"
        @drop="onDrop($event, todo)"
        @dragover.prevent
      >
        <input
          type="checkbox"
          v-model="todo.completed"
        />
        <span
          :class="{ completed: todo.completed }"
        >
          {{ todo.text }}
        </span>
        <button @click="removeTodo(todo.id)">
          删除
        </button>
      </li>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Todo {
  id: number
  text: string
  completed: boolean
  order: number
}

const title = ref('待办事项')
const newTodo = ref('')
const todos = ref<Todo[]>([])
const draggedItem = ref<Todo | null>(null)

const sortedTodos = computed(() =>
  [...todos.value].sort((a, b) => a.order - b.order)
)

function addTodo() {
  if (!newTodo.value.trim()) return
  todos.value.push({
    id: Date.now(),
    text: newTodo.value,
    completed: false,
    order: todos.value.length
  })
  newTodo.value = ''
}

function onDragStart(event: DragEvent, todo: Todo) {
  draggedItem.value = todo
}

function onDrop(event: DragEvent, targetTodo: Todo) {
  if (!draggedItem.value) return
  // 拖拽排序逻辑...
}
</script>

<style scoped>
.todo-app {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.completed {
  text-decoration: line-through;
  color: #999;
}
</style>
```

### GPT-4o - 原生多模态模型

**实时语音对话**：

```python
from openai import OpenAI
import pyaudio

client = OpenAI(api_key="your-api-key")

# 实时语音对话
def real_time_voice_chat():
    """GPT-4o实时语音对话"""

    # 1. 录音
    audio = record_audio()

    # 2. 转文字(Whisper)
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio
    )

    # 3. GPT-4o生成回复
    response = client.chat.completions.create(
        model="gpt-4o",  # 原生多模态
        messages=[{
            "role": "user",
            "content": transcript.text
        }]
    )

    # 4. 文字转语音(TTS)
    speech = client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input=response.choices[0].message.content
    )

    # 5. 播放
    play_audio(speech)

# 实时视频理解
def analyze_video(video_path: str):
    """GPT-4o分析视频内容"""

    # 提取视频帧
    frames = extract_video_frames(video_path)

    # 逐帧分析
    responses = []
    for frame in frames:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{frame}"
                        }
                    },
                    {
                        "type": "text",
                        "text": "描述这一帧发生了什么？"
                    }
                ]
            }]
        )
        responses.append(response.choices[0].message.content)

    return responses
```

### AI Agent框架对比 (2024-2026)

| 框架 | 特点 | 适用场景 | 学习曲线 |
|------|------|----------|----------|
| **LangGraph** | 状态图、可视化 | 复杂Agent流程 | 中等 |
| **AutoGen** | 多Agent对话 | 协作任务 | 较低 |
| **CrewAI** | 角色明确 | 专业团队模拟 | 较低 |
| **Semantic Kernel** | 企业级 | 微软生态 | 较高 |

**LangGraph实战** (2024热门)：

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

# 1. 定义状态
class AgentState(TypedDict):
    task: str
    research_result: str
    code: str
    test_result: str
    final_output: str

# 2. 定义节点
def researcher(state: AgentState):
    """研究节点"""
    # 使用Claude 3.5 Sonnet进行研究
    result = claude_client.messages.create(
        model="claude-3-5-sonnet-20241022",
        messages=[{
            "role": "user",
            "content": f"研究以下任务的最佳实践：\n{state['task']}"
        }]
    )
    state["research_result"] = result.content[0].text
    return state

def coder(state: AgentState):
    """编码节点"""
    result = claude_client.messages.create(
        model="claude-3-5-sonnet-20241022",
        messages=[{
            "role": "user",
            "content": f"""
            根据研究结果编写代码：

            研究：{state['research_result']}
            任务：{state['task']}

            要求：
            1. 使用Vue3 + TypeScript
            2. 遵循最佳实践
            3. 包含完整类型定义
            """
        }]
    )
    state["code"] = result.content[0].text
    return state

def tester(state: AgentState):
    """测试节点"""
    # 生成测试代码
    result = claude_client.messages.create(
        model="claude-3-5-sonnet-20241022",
        messages=[{
            "role": "user",
            "content": f"为以下代码生成单元测试：\n{state['code']}"
        }]
    )
    state["test_result"] = result.content[0].text
    return state

# 3. 构建图
workflow = StateGraph(AgentState)

# 添加节点
workflow.add_node("researcher", researcher)
workflow.add_node("coder", coder)
workflow.add_node("tester", tester)

# 添加边
workflow.add_edge("researcher", "coder")
workflow.add_edge("coder", "tester")
workflow.add_edge("tester", END)

# 设置入口
workflow.set_entry_point("researcher")

# 4. 编译和运行
app = workflow.compile()

# 执行
result = app.invoke({
    "task": "创建一个支持拖拽的待办事项组件"
})

print(result["final_output"])
```

**AutoGen多Agent协作** (2024热门)：

```python
import autogen

# 1. 定义助手
assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={
        "model": "claude-3-5-sonnet-20241022",
        "api_key": "your-api-key"
    }
)

# 2. 定义代码执行器
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10,
    code_execution_config={
        "work_dir": "coding",
        "use_docker": False
    }
)

# 3. Agent对话
user_proxy.initiate_chat(
    assistant,
    message="""
    请帮我创建一个Vue3组件：
    1. 待办事项列表
    2. 支持添加、删除、完成
    3. 使用TypeScript
    4. 包含单元测试
    """
)

# AutoGen会自动：
# 1. 分析需求
# 2. 编写代码
# 3. 运行测试
# 4. 修复错误
# 5. 迭代优化
```

### 本地模型部署 (2024-2025成熟方案)

**Ollama + vLLM组合**：

```bash
# 1. 安装Ollama(最简单)
curl -fsSL https://ollama.ai/install.sh | sh

# 拉取模型
ollama pull deepseek-v3:70b
ollama pull qwen2.5:72b
ollama pull llama3.3:70b

# 运行本地模型
ollama run deepseek-v3:70b

# 2. API服务(与OpenAI兼容)
ollama serve

# 3. 使用(代码无需修改)
import openai

client = openai.OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"  # required but unused
)

response = client.chat.completions.create(
    model="deepseek-v3:70b",
    messages=[{
        "role": "user",
        "content": "你好"
    }]
)
```

**vLLM高性能推理** (2024企业首选)：

```python
from vllm import LLM, SamplingParams

# 初始化模型
llm = LLM(
    model="deepseek-ai/DeepSeek-V3",
    tensor_parallel_size=4,  # 4卡GPU
    max_model_len=128000,
    gpu_memory_utilization=0.9
)

# 批量推理
prompts = [
    "你好，请介绍一下自己",
    "如何学习Vue3？",
    "解释什么是DevOps"
]

sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=1024
)

outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(f"Prompt: {output.prompt}")
    print(f"Generated: {output.outputs[0].text}\n")
```

**模型量化** (2024-2025降低成本)：

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# 1. 量化到4-bit(Reduce 75% memory)
model = AutoModelForCausalLM.from_pretrained(
    "deepseek-ai/DeepSeek-V3",
    load_in_4bit=True,  # 4-bit量化
    device_map="auto"
)

# 2. AWQ量化(更好的性能)
# pip install autoawq
from awq import AutoAWQForCausalLM

model = AutoAWQForCausalLM.from_quantized(
    "deepseek-ai/DeepSeek-V3-AWQ",
    fuse_layers=True,
    safetensors=True
)

# 硬件要求对比:
# FP16: 70B模型需要140GB VRAM
# 8-bit: 70B模型需要70GB VRAM
# 4-bit: 70B模型需要35GB VRAM (2x RTX 3090)
```

---

## Claude API使用 {#claude-api使用}

### Claude简介

**Claude** 是Anthropic开发的AI助手，以安全性、长文本处理能力著称。

**Claude 3系列**：
- **Opus**：最强，200K上下文
- **Sonnet**：平衡，200K上下文
- **Haiku**：最快，100K上下文

### 安装和配置

```bash
# 安装
pip install anthropic

# 设置环境变量
export ANTHROPIC_API_KEY="your-api-key"
```

```python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class ClaudeConfig:
    API_KEY = os.getenv("ANTHROPIC_API_KEY")

    # 模型选择
    MODEL_OPUS = "claude-3-opus-20240229"
    MODEL_SONNET = "claude-3-sonnet-20240229"
    MODEL_HAIKU = "claude-3-haiku-20240307"

    # 默认模型
    DEFAULT_MODEL = MODEL_SONNET

    @classmethod
    def get_model(cls, tier: str = "sonnet"):
        models = {
            "opus": cls.MODEL_OPUS,
            "sonnet": cls.MODEL_SONNET,
            "haiku": cls.MODEL_HAIKU
        }
        return models.get(tier, cls.DEFAULT_MODEL)
```

### 基础使用

```python
from anthropic import Anthropic
from config import ClaudeConfig

# 初始化
client = Anthropic(api_key=ClaudeConfig.API_KEY)

# 简单对话
message = client.messages.create(
    model=ClaudeConfig.DEFAULT_MODEL,
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
)

print(message.content[0].text)
# 输出：你好！我是Claude，由Anthropic公司开发的AI助手...
```

### 流式输出

```python
def stream_chat(prompt: str):
    """流式对话"""
    print("Claude：", end="", flush=True)

    with client.messages.stream(
        model=ClaudeConfig.DEFAULT_MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)

    print()  # 换行

# 使用
stream_chat("用Python写一个快速排序")
```

### 长文档处理（Claude的强项）

```python
def analyze_long_document(document_path: str):
    """分析长文档"""
    # 读取文档
    with open(document_path, 'r', encoding='utf-8') as f:
        document = f.read()

    # Claude可以处理超长文档（200K tokens ≈ 15万汉字）
    message = client.messages.create(
        model=ClaudeConfig.MODEL_OPUS,  # 使用Opus获得最佳效果
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": f"""请分析以下文档，提取关键信息：

{document}

请提供：
1. 文档摘要
2. 关键要点（最多10条）
3. 主要结论
4. 需要关注的细节
"""
        }]
    )

    return message.content[0].text

# 使用
result = analyze_long_document("long_document.txt")
print(result)
```

### 多图理解（多模态）

```python
import base64

def encode_image(image_path: str) -> str:
    """编码图片"""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

def analyze_image(image_path: str, question: str):
    """分析图片"""
    image_data = encode_image(image_path)

    message = client.messages.create(
        model=ClaudeConfig.MODEL_SONNET,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data
                    }
                },
                {
                    "type": "text",
                    "text": question
                }
            ]
        }]
    )

    return message.content[0].text

# 使用
result = analyze_image(
    "screenshot.png",
    "请描述这个界面的布局，并提出改进建议"
)
print(result)
```

### LangChain中使用Claude

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

# 初始化
llm = ChatAnthropic(
    model=ClaudeConfig.MODEL_SONNET,
    api_key=ClaudeConfig.API_KEY,
    temperature=0.7,
    max_tokens=1024
)

# 创建链
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是专业的AI助手"),
    ("human", "{input}")
])

chain = prompt | llm

# 使用
response = chain.invoke({"input": "解释什么是RAG"})
print(response.content)
```

### Claude vs GPT对比

| 特性 | Claude 3 | GPT-4 |
|------|----------|-------|
| **上下文长度** | 200K (Opus/Sonnet) | 128K |
| **长文本处理** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **代码能力** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **中文支持** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **安全性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **价格** | 较高 | 较高 |
| **输出速度** | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**选择建议**：
```python
# 使用Claude的场景：
- 处理超长文档（>100页）
- 需要深度分析和推理
- 对安全性要求高
- 不确定的长文本任务

# 使用GPT-4的场景：
- 代码生成和调试
- 需要最快的响应
- 复杂逻辑推理
- 与OpenAI生态集成
```

---

## 开源模型和本地部署 {#开源模型和本地部署}

### Ollama：最简单的本地部署

**安装Ollama**：
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# 从 https://ollama.com/download 下载安装
```

**拉取模型**：
```bash
# Llama 3 (推荐)
ollama pull llama3

# Qwen (中文)
ollama pull qwen

# Mistral
ollama pull mistral

# 代码模型
ollama pull deepseek-coder
```

**使用Ollama**：
```bash
# 命令行交互
ollama run llama3

# API服务（默认端口11434）
ollama serve
```

```python
# Python中使用
import requests
import json

def chat_with_ollama(prompt: str, model: str = "llama3"):
    """使用Ollama聊天"""
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()['response']

# 使用
print(chat_with_ollama("你好"))
```

**LangChain集成**：
```python
from langchain_community.llms import Ollama

# 初始化
llm = Ollama(model="llama3")

# 使用
response = llm.invoke("解释什么是机器学习")
print(response)
```

### 性能对比

| 模型 | 参数量 | 显存需求 | 速度 | 质量 |
|------|--------|----------|------|------|
| **Llama 3 8B** | 8B | 6GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Llama 3 70B** | 70B | 40GB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mistral 7B** | 7B | 5GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Qwen 72B** | 72B | 48GB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**硬件建议**：
```python
# 8GB显存：Llama 3 8B, Mistral 7B
# 16GB显存：Llama 3 70B (量化版)
# 24GB+显存：Llama 3 70B完整版
# 无GPU：使用Ollama CPU模式（较慢）
```

### 成本对比

```
场景：处理100万个tokens

OpenAI GPT-3.5：
  输入：$0.0005/1K × 1000 = $0.5
  输出：$0.0015/1K × 1000 = $1.5
  总计：$2

Claude 3 Sonnet：
  输入：$3/1M × 1 = $3
  输出：$15/1M × 1 = $15
  总计：$18

本地部署（Llama 3）：
  GPU电费：约$0.1
  总计：$0.1 💰

结论：高频使用场景，本地部署最经济
```

### Ollama Docker 部署

**为什么使用 Docker 部署 Ollama**？
- 🐳 环境隔离，不污染系统
- 🚀 快速部署和扩缩容
- 🔧 便于配置和管理
- 📦 版本控制方便

#### 方案 1：基础 Docker 部署

**快速启动**：

```bash
# 拉取 Ollama 官方镜像
docker pull ollama/ollama:latest

# 运行容器
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama_models:/root/.ollama \
  ollama/ollama:latest

# 进入容器下载模型
docker exec -it ollama ollama pull llama3

# 测试
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "你好",
  "stream": false
}'
```

#### 方案 2：Docker Compose 部署（推荐）

**`docker-compose.yml`**：

```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_ORIGINS=*  # 允许所有来源访问
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - ai_network
    # GPU 支持（可选）
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]

  # Open WebUI（可选：Web 界面）
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    restart: unless-stopped
    ports:
      - "3000:8080"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    volumes:
      - open_webui_data:/app/backend/data
    depends_on:
      - ollama
    networks:
      - ai_network

volumes:
  ollama_data:
    driver: local
  open_webui_data:
    driver: local

networks:
  ai_network:
    driver: bridge
```

**启动和管理**：

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f ollama

# 下载模型
docker exec -it ollama ollama pull llama3
docker exec -it ollama ollama pull qwen
docker exec -it ollama ollama pull mistral

# 查看已下载的模型
docker exec -it ollama ollama list

# 停止服务
docker-compose down

# 删除所有数据（包括模型）
docker-compose down -v
```

#### 方案 3：带 GPU 加速的部署

**NVIDIA GPU 支持**：

```yaml
# docker-compose.gpu.yml
version: '3.8'

services:
  ollama-gpu:
    image: ollama/ollama:latest
    container_name: ollama-gpu
    restart: unless-stopped
    ports:
      - "11434:11434"
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_ORIGINS=*
    volumes:
      - ollama_gpu_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    networks:
      - ai_network

volumes:
  ollama_gpu_data:
    driver: local

networks:
  ai_network:
    driver: bridge
```

**启动 GPU 版本**：

```bash
# 需要先安装 nvidia-docker
# 安装：https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html

# 启动
docker-compose -f docker-compose.gpu.yml up -d

# 检查 GPU 使用情况
nvidia-smi

# 查看 Ollama GPU 使用
docker exec -it ollama-gpu ollama ps
```

#### 方案 4：生产级部署（带 Nginx 反向代理）

**架构**：

```
                    Internet
                       ↓
                 [Nginx :443]
                       ↓
              [Ollama :11434]
                       ↓
              [模型存储卷]
```

**`docker-compose.prod.yml`**：

```yaml
version: '3.8'

services:
  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: ollama-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - ollama
    networks:
      - ai_network

  # Ollama 服务
  ollama:
    image: ollama/ollama:latest
    container_name: ollama-prod
    restart: unless-stopped
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_ORIGINS=https://your-domain.com
    volumes:
      - ollama_prod_data:/root/.ollama
    networks:
      - ai_network
    # 不对外暴露端口，只通过 Nginx 访问
    expose:
      - "11434"

  # Prometheus 监控（可选）
  prometheus:
    image: prom/prometheus:latest
    container_name: ollama-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - ai_network

volumes:
  ollama_prod_data:
    driver: local
  nginx_logs:
    driver: local
  prometheus_data:
    driver: local

networks:
  ai_network:
    driver: bridge
```

**Nginx 配置** (`nginx/nginx.conf`):

```nginx
events {
    worker_connections 1024;
}

http {
    upstream ollama_backend {
        server ollama:11434;
    }

    # 限流配置
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        # API 端点
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;

            proxy_pass http://ollama_backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # 超时配置（流式响应）
            proxy_read_timeout 3600s;
            proxy_send_timeout 3600s;
            chunked_transfer_encoding on;
        }

        # 健康检查
        location /health {
            proxy_pass http://ollama_backend/;
        }
    }
}
```

**Prometheus 配置** (`prometheus/prometheus.yml`):

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ollama'
    static_configs:
      - targets: ['ollama:11434']
    metrics_path: '/metrics'
```

#### Python 客户端连接 Docker Ollama

```python
import requests
import json
from typing import Optional, Iterator

class DockerOllamaClient:
    """Docker Ollama 客户端"""

    def __init__(
        self,
        base_url: str = "http://localhost:11434",
        model: str = "llama3"
    ):
        self.base_url = base_url.rstrip('/')
        self.model = model

    def chat(self, prompt: str, stream: bool = False) -> str:
        """聊天对话"""
        response = requests.post(
            f"{self.base_url}/api/chat",
            json={
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "stream": stream
            }
        )

        if stream:
            return self._stream_response(response)
        else:
            return response.json()['message']['content']

    def generate(self, prompt: str, stream: bool = False) -> str:
        """文本生成"""
        response = requests.post(
            f"{self.base_url}/api/generate",
            json={
                "model": self.model,
                "prompt": prompt,
                "stream": stream
            }
        )

        if stream:
            return self._stream_response(response)
        else:
            return response.json()['response']

    def _stream_response(self, response) -> Iterator[str]:
        """处理流式响应"""
        for line in response.iter_lines():
            if line:
                data = json.loads(line)
                if 'response' in data:
                    yield data['response']
                elif 'message' in data:
                    yield data['message']['content']

    def list_models(self) -> list:
        """列出所有模型"""
        response = requests.get(f"{self.base_url}/api/tags")
        return response.json()['models']

    def pull_model(self, model: str) -> dict:
        """拉取模型"""
        response = requests.post(
            f"{self.base_url}/api/pull",
            json={"name": model},
            stream=True
        )

        for line in response.iter_lines():
            if line:
                data = json.loads(line)
                print(f"Downloading: {data.get('completed', 0)}/{data.get('total', 0)}")

        return {"status": "success"}

# 使用示例
if __name__ == "__main__":
    # 初始化客户端
    client = DockerOllamaClient(
        base_url="http://localhost:11434",
        model="llama3"
    )

    # 列出模型
    print("可用模型：", client.list_models())

    # 聊天
    response = client.chat("解释什么是深度学习")
    print("回复：", response)

    # 流式生成
    for chunk in client.generate("写一首关于AI的诗", stream=True):
        print(chunk, end="", flush=True)
```

#### LangChain 集成 Docker Ollama

```python
from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

# 初始化 LLM
llm = Ollama(
    base_url="http://localhost:11434",  # Docker Ollama 地址
    model="llama3",
    temperature=0.7
)

# 初始化 Embeddings
embeddings = OllamaEmbeddings(
    base_url="http://localhost:11434",
    model="llama3"
)

# 创建对话链
memory = ConversationBufferMemory()
conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# 使用
response = conversation.predict(input="你好，我是小明")
print(response)

response = conversation.predict(input="我叫什么名字？")
print(response)  # 应该记得"小明"
```

#### Moltbot 集成 Docker Ollama

```python
from moltbot import Agent
from moltbot.llm import OllamaLLM

# 使用 Docker Ollama
llm = OllamaLLM(
    base_url="http://localhost:11434",
    model="llama3"
)

# 创建 Agent
agent = Agent(
    name="本地助手",
    llm=llm,
    instructions="你是一个友好的AI助手"
)

# 对话
response = agent.chat("你好")
print(response)
```

#### 性能优化建议

**1. 模型量化（节省显存）**：

```bash
# 拉取量化版本（4-bit）
ollama pull llama3:8b-q4_0  # 4-bit 量化
ollama pull llama3:8b-q8_0  # 8-bit 量化

# 对比显存占用
# llama3:8b         - 约 6GB
# llama3:8b-q4_0    - 约 4GB
# llama3:8b-q8_0    - 约 5GB
```

**2. 并发处理**：

```yaml
# docker-compose.scale.yml
services:
  ollama:
    image: ollama/ollama:latest
    deploy:
      replicas: 3  # 启动 3 个实例
    # ... 其他配置
```

**3. 缓存配置**：

```bash
# 设置环境变量
OLLAMA_NUM_PARALLEL=4  # 并发请求数
OLLAMA_MAX_QUEUE=100   # 最大队列长度
OLLAMA_LOAD_TIMEOUT=5m  # 模型加载超时
```

**4. 监控和日志**：

```bash
# 查看 Ollama 统计信息
curl http://localhost:11434/api/tags

# 查看运行中的模型
docker exec ollama ollama ps

# 查看日志
docker logs -f ollama
```

### RAGFlow：企业级 RAG 平台

**RAGFlow** 是一个基于深度文档理解的开源 RAG（检索增强生成）引擎，由 infiniflow/ragflow 开发。

#### 核心特性

```
┌─────────────────────────────────────────────┐
│          RAGFlow 核心特性                     │
├─────────────────────────────────────────────┤
│                                             │
│  📚 智能文档解析                              │
│  - 支持复杂 PDF 表格解析                     │
│  - 多模态文档理解                            │
│  - OCR 文字识别                              │
│  - 自动文档分块                              │
│                                             │
│  🎯 高质量检索                                │
│  - 混合检索（向量+关键词）                   │
│  - 重排序优化                                │
│  - 上下文智能召回                            │
│  - 多路召回融合                              │
│                                             │
│  🤖 多模型支持                                │
│  - OpenAI GPT系列                            │
│  - Claude 系列                               │
│  - 本地模型（Ollama）                        │
│  - 国产模型（通义千问、DeepSeek）             │
│                                             │
│  🔄 工作流编排                                │
│  - 可视化流程设计                            │
│  - 自定义处理节点                            │
│  - API 集成                                  │
│                                             │
│  📊 企业级特性                                │
│  - 多租户支持                                │
│  - 权限管理                                  │
│  - 审计日志                                  │
│  - API 限流                                  │
│                                             │
└─────────────────────────────────────────────┘
```

#### RAGFlow vs 其他 RAG 框架

| 特性 | RAGFlow | LangChain | LlamaIndex | Dify |
|------|---------|-----------|------------|------|
| **文档解析** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **部署难度** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **可视化** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **中文支持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **本地模型** | ✅ | ✅ | ✅ | ✅ |
| **开源免费** | ✅ | ✅ | ✅ | ✅ |
| **学习曲线** | 中等 | 较陡 | 较陡 | 平缓 |

**RAGFlow 最适合**：
- 🎯 需要处理大量复杂文档（PDF、表格等）
- 🎯 需要高质量检索和问答
- 🎯 企业级知识库系统
- 🎯 需要可视化配置界面

#### Docker 快速部署

**1. 基础部署**：

```bash
# 克隆仓库
git clone https://github.com/infiniflow/ragflow.git
cd ragflow/docker

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 访问 Web 界面
# 浏览器打开：http://localhost:80
# 默认账号：admin / admin
```

**2. 完整部署配置**：

```yaml
# docker-compose.yml
version: '3.8'

services:
  # MySQL 数据库
  mysql:
    image: mysql:8.0
    container_name: ragflow-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: ragflow
      MYSQL_USER: ragflow
      MYSQL_PASSWORD: ragflow
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - ragflow_network
    command: --default-authentication-plugin=mysql_native_password

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: ragflow-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - ragflow_network

  # Elasticsearch（可选，用于全文检索）
  elasticsearch:
    image: elasticsearch:8.11.0
    container_name: ragflow-es
    restart: unless-stopped
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms2g -Xmx2g
    volumes:
      - es_data:/usr/share/elasticsearch/data
    networks:
      - ragflow_network

  # MinIO（对象存储）
  minio:
    image: minio/minio:latest
    container_name: ragflow-minio
    restart: unless-stopped
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    networks:
      - ragflow_network
    command: server /data --console-address ":9001"

  # RAGFlow 主服务
  ragflow:
    image: infiniflow/ragflow:latest
    container_name: ragflow-server
    restart: unless-stopped
    depends_on:
      - mysql
      - redis
      - minio
    ports:
      - "80:80"
      - "443:443"
    environment:
      - MYSQL_HOST=mysql
      - MYSQL_PORT=3306
      - MYSQL_USER=ragflow
      - MYSQL_PASSWORD=ragflow
      - MYSQL_DATABASE=ragflow
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - ES_ENDPOINT=http://elasticsearch:9200
    volumes:
      - ragflow_data:/ragflow/data
    networks:
      - ragflow_network

volumes:
  mysql_data:
    driver: local
  redis_data:
    driver: local
  es_data:
    driver: local
  minio_data:
    driver: local
  ragflow_data:
    driver: local

networks:
  ragflow_network:
    driver: bridge
```

**3. 使用 Ollama 本地模型**：

```yaml
# 修改 ragflow 服务的环境变量
  ragflow:
    image: infiniflow/ragflow:latest
    environment:
      # ... 其他配置
      - LLM_TYPE=ollama  # 使用 Ollama
      - OLLAMA_BASE_URL=http://ollama:11434
      - EMBEDDING_MODEL=ollama:llama3
      - LLM_MODEL=ollama:llama3
    depends_on:
      - ollama  # 添加 Ollama 服务依赖

  # 添加 Ollama 服务
  ollama:
    image: ollama/ollama:latest
    container_name: ragflow-ollama
    restart: unless-stopped
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - ragflow_network

volumes:
  ollama_data:
    driver: local
```

#### 使用指南

**1. 创建知识库**：

```bash
# 访问 Web 界面：http://localhost:80
# 登录：admin / admin

# 步骤：
# 1. 点击"知识库" → "创建知识库"
# 2. 上传文档（PDF、Word、TXT 等）
# 3. 等待文档解析和向量化
# 4. 测试检索效果
```

**2. API 使用**：

```python
import requests
import json

RAGFLOW_API_URL = "http://localhost:80/api/v1"

class RAGFlowClient:
    """RAGFlow 客户端"""

    def __init__(self, base_url: str = RAGFLOW_API_URL):
        self.base_url = base_url
        self.token = None

    def login(self, username: str, password: str):
        """登录"""
        response = requests.post(
            f"{self.base_url}/login",
            json={"username": username, "password": password}
        )
        self.token = response.json()['token']
        return self.token

    def create_dataset(self, name: str, description: str = ""):
        """创建数据集"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{self.base_url}/datasets",
            headers=headers,
            json={"name": name, "description": description}
        )
        return response.json()

    def upload_document(self, dataset_id: str, file_path: str):
        """上传文档"""
        headers = {"Authorization": f"Bearer {self.token}"}
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(
                f"{self.base_url}/datasets/{dataset_id}/documents",
                headers=headers,
                files=files
            )
        return response.json()

    def search(self, dataset_id: str, query: str, top_k: int = 5):
        """搜索文档"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{self.base_url}/datasets/{dataset_id}/search",
            headers=headers,
            json={"query": query, "top_k": top_k}
        )
        return response.json()

    def chat(self, dataset_id: str, question: str):
        """基于知识库问答"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{self.base_url}/datasets/{dataset_id}/chat",
            headers=headers,
            json={"question": question}
        )
        return response.json()

# 使用示例
if __name__ == "__main__":
    # 初始化客户端
    client = RAGFlowClient()

    # 登录
    client.login("admin", "admin")

    # 创建数据集
    dataset = client.create_dataset(
        name="产品文档",
        description="公司产品使用手册"
    )
    dataset_id = dataset['id']

    # 上传文档
    client.upload_document(dataset_id, "manual.pdf")

    # 搜索
    results = client.search(dataset_id, "如何安装？")
    print("搜索结果：", results)

    # 问答
    answer = client.chat(dataset_id, "产品支持哪些操作系统？")
    print("回答：", answer['answer'])
```

**3. 集成到 FastAPI**：

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests

app = FastAPI()

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: list

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ragflow(request: ChatRequest):
    """使用 RAGFlow 进行问答"""

    # 调用 RAGFlow API
    ragflow_response = requests.post(
        "http://ragflow:80/api/v1/datasets/1/chat",
        json={"question": request.question},
        headers={"Authorization": "Bearer YOUR_TOKEN"}
    )

    if ragflow_response.status_code != 200:
        raise HTTPException(status_code=500, detail="RAGFlow API error")

    data = ragflow_response.json()

    return ChatResponse(
        answer=data['answer'],
        sources=data.get('sources', [])
    )
```

#### 高级配置

**1. 自定义解析器**：

```python
# RAGFlow 支持自定义文档解析器
# 通过配置文件指定解析规则

{
  "parsers": {
    "pdf": {
      "extract_tables": true,
      "ocr_enabled": true,
      "layout_analysis": true
    },
    "docx": {
      "extract_images": true,
      "preserve_format": true
    }
  }
}
```

**2. 检索优化**：

```yaml
# 高级检索配置
retrieval:
  method: "hybrid"  # 混合检索：向量 + 关键词
  vector_similarity_weight: 0.7  # 向量相似度权重
  keyword_weight: 0.3  # 关键词权重
  rerank_enabled: true  # 启用重排序
  top_k: 20  # 初步召回数量
  final_top_k: 5  # 最终返回数量
```

**3. 性能优化**：

```bash
# 增加并发处理
docker-compose up -d --scale ragflow=3

# 调整 Elasticsearch 内存
ES_JAVA_OPTS=-Xms4g -Xmx4g

# 启用缓存
REDIS_CACHE_TTL=3600
```

#### 实战案例

**企业知识库系统架构**：

```
┌─────────────────────────────────────────────────┐
│           企业知识库系统架构                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────┐      ┌───────────┐              │
│  │   用户     │ ←→  │  Web UI   │              │
│  └───────────┘      └─────┬─────┘              │
│                           ↓                     │
│  ┌─────────────────────────────────────────┐   │
│  │         RAGFlow 核心服务                  │   │
│  │  ┌───────────┐  ┌───────────┐           │   │
│  │  │ 文档解析   │  │  检索引擎  │           │   │
│  │  └───────────┘  └─────┬─────┘           │   │
│  │                       ↓                  │   │
│  │  ┌──────────────────────────────────┐    │   │
│  │  │      LLM (GPT-4/Ollama)          │    │   │
│  │  └──────────────────────────────────┘    │   │
│  └─────────────────────────────────────────┘   │
│           ↓          ↓          ↓              │
│  ┌──────────┐  ┌─────────┐  ┌──────────┐      │
│  │  MySQL   │  │  Redis  │  │ MinIO    │      │
│  └──────────┘  └─────────┘  └──────────┘      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Moltbot框架 {#moltbot框架}

### 什么是Moltbot？

**Moltbot**（原名ClawdBot）是一个轻量级、易用的AI Agent开发框架，专门为快速构建智能助手而设计。

```
┌─────────────────────────────────────────────┐
│         Moltbot 核心特点                     │
├─────────────────────────────────────────────┤
│                                             │
│  ✨ 简单易用                                │
│  - 几行代码即可创建Agent                    │
│  - Pythonic API设计                         │
│  - 丰富的文档和示例                         │
│                                             │
│  🚀 高性能                                  │
│  - 异步执行支持                             │
│  - 内置连接池                               │
│  - 智能缓存机制                             │
│                                             │
│  🔧 灵活扩展                                │
│  - 插件化架构                               │
│  - 自定义工具                               │
│  - 多模型支持                               │
│                                             │
│  💰 成本友好                                │
│  - 开源免费                                 │
│  - 本地运行优先                             │
│  - 智能降级策略                             │
│                                             │
└─────────────────────────────────────────────┘
```

### 为什么选择Moltbot？

| 特性 | Moltbot | LangChain | AutoGen |
|------|---------|-----------|---------|
| **学习曲线** | ⭐⭐⭐⭐⭐ 最简单 | ⭐⭐⭐ 中等 | ⭐⭐ 较陡 |
| **代码量** | 最少 | 中等 | 较多 |
| **灵活性** | ⭐⭐⭐⭐ 高 | ⭐⭐⭐⭐⭐ 极高 | ⭐⭐⭐⭐⭐ 极高 |
| **性能** | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 良好 | ⭐⭐⭐ 一般 |
| **文档** | ⭐⭐⭐⭐ 完善 | ⭐⭐⭐⭐⭐ 极完善 | ⭐⭐⭐ 较少 |
| **适合场景** | 快速开发 | 复杂应用 | 研究 |

**Moltbot最适合**：
- 🎯 快速原型开发
- 🎯 中小型项目
- 🎯 学习Agent开发
- 🎯 团队协作工具

### 安装和配置

```bash
# 安装Moltbot
pip install moltbot

# 或使用国内镜像加速
pip install moltbot -i https://pypi.tuna.tsinghua.edu.cn/simple
```

```python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class MoltbotConfig:
    """Moltbot配置"""

    # LLM配置
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")  # openai, claude, ollama
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

    # 模型选择
    MODEL_NAME = os.getenv("MODEL_NAME", "gpt-3.5-turbo")

    # Agent配置
    MAX_TOOLS_CALLS = int(os.getenv("MAX_TOOLS_CALLS", "5"))
    TIMEOUT = int(os.getenv("TIMEOUT", "30"))

    # 缓存配置
    ENABLE_CACHE = os.getenv("ENABLE_CACHE", "true").lower() == "true"
    CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))
```

### 快速开始

#### 创建第一个Moltbot Agent

```python
from moltbot import Agent, Tool
from moltbot.llm import OpenAILLM

# 1. 初始化LLM
llm = OpenAILLM(
    api_key="your-api-key",
    model="gpt-3.5-turbo",
    temperature=0.7
)

# 2. 创建Agent
agent = Agent(
    name="小助手",
    llm=llm,
    instructions="你是一个友好的AI助手，擅长回答问题"
)

# 3. 对话
response = agent.chat("你好，请介绍一下你自己")
print(response)
# 输出：你好！我是小助手，很高兴为你服务...
```

#### 添加工具

```python
from moltbot import Tool

# 1. 定义工具函数
def get_weather(city: str) -> str:
    """查询天气"""
    # 实际调用天气API
    return f"{city}今天晴天，温度25°C"

def calculate(expression: str) -> float:
    """计算数学表达式"""
    try:
        return eval(expression)
    except:
        return "计算错误"

# 2. 创建工具
weather_tool = Tool(
    name="get_weather",
    description="查询指定城市的天气",
    function=get_weather
)

calculator_tool = Tool(
    name="calculator",
    description="计算数学表达式",
    function=calculate
)

# 3. 添加工具到Agent
agent.add_tools([weather_tool, calculator_tool])

# 4. 使用
response = agent.chat("北京今天天气怎么样？")
# Agent会自动调用get_weather工具

response = agent.chat("计算123 * 456")
# Agent会自动调用calculator工具
```

### 高级功能

#### 1. 记忆管理

```python
from moltbot.memory import ConversationMemory

# 创建带记忆的Agent
memory = ConversationMemory(
    max_history=100,  # 最多保存100轮对话
    persist=True,      # 持久化到磁盘
    storage_path="./memory"
)

agent = Agent(
    name="记忆助手",
    llm=llm,
    memory=memory
)

# Agent会记住之前的对话
agent.chat("我叫小明")
agent.chat("我叫什么名字？")
# 输出：你叫小明

# 查看记忆历史
history = memory.get_history()
print(history)
```

#### 2. 异步执行

```python
import asyncio
from moltbot import AsyncAgent

async def main():
    # 创建异步Agent
    agent = AsyncAgent(
        name="异步助手",
        llm=llm
    )

    # 并发处理多个任务
    tasks = [
        agent.chat("问题1"),
        agent.chat("问题2"),
        agent.chat("问题3")
    ]

    results = await asyncio.gather(*tasks)
    for result in results:
        print(result)

asyncio.run(main())
```

#### 3. 多Agent协作

```python
from moltbot import Agent, Team

# 创建专业Agent
researcher = Agent(
    name="研究员",
    llm=llm,
    instructions="你擅长搜集和分析信息"
)

writer = Agent(
    name="写手",
    llm=llm,
    instructions="你擅长撰写文章"
)

reviewer = Agent(
    name="审核员",
    llm=llm,
    instructions="你擅长审核内容质量"
)

# 创建团队
team = Team(
    name="内容创作团队",
    members=[researcher, writer, reviewer],
    workflow="researcher → writer → reviewer"  # 工作流
)

# 执行任务
result = team.execute("主题：人工智能的发展趋势")
# 输出：研究员搜集信息 → 写手撰写文章 → 审核员质量检查
```

#### 4. 自定义插件

```python
from moltbot import Plugin

class DatabasePlugin(Plugin):
    """数据库插件"""

    def __init__(self, connection_string: str):
        super().__init__(name="database")
        self.db = self.connect(connection_string)

    def query(self, sql: str):
        """执行SQL查询"""
        cursor = self.db.cursor()
        cursor.execute(sql)
        return cursor.fetchall()

    def to_tools(self):
        """转换为工具"""
        return [
            Tool(
                name="db_query",
                description="查询数据库",
                function=self.query
            )
        ]

# 使用插件
db_plugin = DatabasePlugin("sqlite:///mydb.db")
agent.add_tools(db_plugin.to_tools())

response = agent.chat("查询用户表有多少条记录")
```

### 实战案例

#### 案例1：智能客服系统

```python
from moltbot import Agent, Tool
from moltbot.knowledge import KnowledgeBase

# 1. 创建知识库
kb = KnowledgeBase()
kb.add_documents([
    {"content": "退款流程：进入订单详情 → 申请退款 → 等待审核"},
    {"content": "配送时间：一般2-3个工作日"},
    {"content": "联系方式：客服电话400-123-4567"}
])

# 2. 创建客服Agent
customer_service = Agent(
    name="智能客服",
    llm=llm,
    instructions="""
    你是一个专业的客服人员。
    - 使用礼貌、友好的语言
    - 优先从知识库中查找答案
    - 无法解决时引导用户联系人工客服
    """,
    knowledge_base=kb
)

# 3. 添加订单查询工具
def check_order(order_id: str) -> dict:
    """查询订单状态"""
    # 实际查询数据库
    return {
        "order_id": order_id,
        "status": "已发货",
        "estimated_arrival": "2024-03-15"
    }

customer_service.add_tool(Tool(
    name="check_order",
    description="查询订单状态",
    function=check_order
))

# 4. 服务
print(customer_service.chat("我的订单12345什么时候到？"))
# 输出：您的订单12345已发货，预计3月15日送达

print(customer_service.chat("如何申请退款？"))
# 输出：退款流程很简单：进入订单详情 → 申请退款 → 等待审核
```

#### 案例2：代码助手

```python
from moltbot import Agent
import subprocess

class CodeAssistant(Agent):
    """代码助手Agent"""

    def __init__(self, llm):
        super().__init__(
            name="代码助手",
            llm=llm,
            instructions="你是专业的编程助手，擅长代码生成和调试"
        )

        # 添加代码执行工具
        self.add_tool(Tool(
            name="execute_python",
            description="执行Python代码",
            function=self._execute_python
        ))

        # 添加代码搜索工具
        self.add_tool(Tool(
            name="search_code",
            description="搜索代码示例",
            function=self._search_code
        ))

    def _execute_python(self, code: str) -> str:
        """执行Python代码"""
        try:
            result = subprocess.run(
                ["python", "-c", code],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.stdout if result.returncode == 0 else result.stderr
        except Exception as e:
            return str(e)

    def _search_code(self, query: str) -> str:
        """搜索代码示例"""
        # 实际实现可以调用GitHub API或本地代码库
        return f"找到相关代码：{query}"

# 使用
assistant = CodeAssistant(llm)
print(assistant.chat("写一个Python快排并执行测试"))
```

### Moltbot vs LangChain

**何时选择Moltbot**：
```python
# ✅ 选择Moltbot的场景：
- 快速原型（小时级 vs 天级）
- 简单到中等复杂度的Agent
- 团队技术栈较新
- 需要快速迭代

# ✅ 选择LangChain的场景：
- 复杂的工作流
- 需要深度定制
- 已有LangChain生态
- 需要社区支持
```

**代码对比**：

```python
# Moltbot：简洁
agent = Agent(name="助手", llm=llm)
agent.add_tool(tool)
response = agent.chat("问题")

# LangChain：详细
from langchain.agents import initialize_agent, AgentType
from langchain.tools import Tool

tools = [tool]
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True
)
response = agent.run("问题")
```

### 最佳实践

```python
# 1. 清晰的指令
agent = Agent(
    name="数据分析助手",
    instructions="""
    角色定位：你是专业的数据分析师
    工作流程：
      1. 理解用户需求
      2. 选择合适的分析工具
      3. 执行分析并生成报告
    输出格式：使用Markdown格式
    注意事项：数据隐私第一
    """
)

# 2. 合理的工具定义
tool = Tool(
    name="calculate",
    description="执行数学计算，输入格式：数学表达式字符串",
    function=calculate
)

# 3. 错误处理
try:
    response = agent.chat("复杂问题", timeout=30)
except TimeoutError:
    # 超时处理
    response = "抱歉，处理超时，请稍后再试"
except Exception as e:
    # 其他错误
    response = f"发生错误：{str(e)}"

# 4. 成本监控
from moltbot import CostTracker

tracker = CostTracker()
agent = Agent(name="助手", llm=llm, cost_tracker=tracker)

# 查看成本
print(f"总成本：${tracker.total_cost():.4f}")
```

### 性能优化

```python
# 1. 启用缓存
from moltbot import Cache

cache = Cache(max_size=1000, ttl=3600)
agent = Agent(name="助手", llm=llm, cache=cache)

# 2. 批量处理
questions = ["问题1", "问题2", "问题3"]
responses = agent.batch_chat(questions)

# 3. 流式输出
for chunk in agent.stream_chat("长问题"):
    print(chunk, end="", flush=True)
```

### 完整部署指南

本节将带你从零开始，完成 Moltbot 应用的完整部署流程。

#### 部署架构概览

```
┌──────────────────────────────────────────────────────────┐
│              Moltbot 应用部署架构                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐      ┌──────────────┐                 │
│  │   客户端      │ ←→  │  API Gateway  │                 │
│  │ (Web/Mobile) │      │   (Nginx)    │                 │
│  └──────────────┘      └──────┬───────┘                 │
│                                ↓                          │
│  ┌─────────────────────────────────────────────┐        │
│  │         应用服务器 (Gunicorn + Uvicorn)      │        │
│  │  ┌──────────────────────────────────────┐  │        │
│  │  │   Moltbot Agent 应用                 │  │        │
│  │  │  - FastAPI REST API                  │  │        │
│  │  │  - WebSocket (实时通信)              │  │        │
│  │  │  - 任务队列 (Celery/Redis)           │  │        │
│  │  └──────────────────────────────────────┘  │        │
│  └─────────────────────────────────────────────┘        │
│           ↓                ↓             ↓              │
│  ┌──────────────┐  ┌──────────┐  ┌─────────────┐      │
│  │   Redis      │  │ PostgreSQL│  │ 向量数据库   │      │
│  │  (缓存/队列)  │  │  (数据)   │  │  (Chroma)   │      │
│  └──────────────┘  └──────────┘  └─────────────┘      │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │           监控和日志                          │        │
│  │  - Prometheus (指标)                         │        │
│  │  - Grafana (可视化)                          │        │
│  │  - ELK Stack (日志)                          │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

#### 本地开发环境搭建

**项目结构**：

```bash
moltbot-production-app/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base.py          # Agent 基类
│   │   ├── customer_service.py
│   │   └── code_assistant.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py        # API 路由
│   │   └── schemas.py       # Pydantic 模型
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # 配置管理
│   │   ├── security.py      # 安全认证
│   │   └── logger.py        # 日志配置
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
├── tests/
│   ├── test_agents.py
│   └── test_api.py
├── scripts/
│   ├── start.sh             # 启动脚本
│   └── deploy.sh            # 部署脚本
├── deployments/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── kubernetes/          # K8s 配置
├── .env.example
├── requirements.txt
├── pyproject.toml
└── README.md
```

**配置文件 (`app/core/config.py`)**：

```python
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    """应用配置"""

    # 应用信息
    APP_NAME: str = "Moltbot Production App"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API 配置
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_PREFIX: str = "/api/v1"

    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "https://yourdomain.com"]

    # LLM 配置
    LLM_PROVIDER: str = "openai"  # openai, claude, ollama
    OPENAI_API_KEY: str
    ANTHROPIC_API_KEY: Optional[str] = None
    MODEL_NAME: str = "gpt-4-turbo-preview"
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 2000

    # 数据库配置
    DATABASE_URL: str = "postgresql://user:password@localhost/moltbot"
    REDIS_URL: str = "redis://localhost:6379/0"

    # 向量数据库
    CHROMA_PERSIST_DIR: str = "./data/chroma"

    # 安全配置
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # 任务队列
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # 监控配置
    ENABLE_METRICS: bool = True
    SENTRY_DSN: Optional[str] = None

    # 限流配置
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

**主应用 (`app/main.py`)**：

```python
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from prometheus_client import make_asgi_app
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logger import setup_logger
from app.api.routes import api_router
from app.agents.customer_service import customer_service_agent

# 日志配置
logger = setup_logger(__name__)

# 限流器
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    logger.info("🚀 应用启动中...")

    # 初始化 Agent
    logger.info("加载 Moltbot Agents...")
    await customer_service_agent.initialize()

    logger.info("✅ 应用启动完成")
    yield

    # 清理资源
    logger.info("🛑 应用关闭中...")
    await customer_service_agent.cleanup()
    logger.info("✅ 应用已关闭")

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gzip 压缩
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 限流器
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda req, exc: JSONResponse(
    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
    content={"detail": "请求过于频繁，请稍后再试"}
))

# Prometheus 指标
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# 注册路由
app.include_router(api_router, prefix=settings.API_PREFIX)

# 健康检查
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "agents": {
            "customer_service": "ready"
        }
    }

# 根路径
@app.get("/")
async def root():
    return {
        "message": "Moltbot Production API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }

# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"全局异常: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "内部服务器错误"}
    )
```

**API 路由 (`app/api/routes.py`)**：

```python
from fastapi import APIRouter, Depends, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import List

from app.api.schemas import (
    ChatRequest,
    ChatResponse,
    AgentInfo,
    HealthResponse
)
from app.agents.base import get_agent
from app.agents.customer_service import customer_service_agent
from app.core.security import get_current_user
from app.core.logger import logger

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/chat", response_model=ChatResponse)
@limiter.limit("60/minute")
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    与 Agent 对话

    - **agent_id**: Agent ID
    - **message**: 用户消息
    - **session_id**: 会话 ID（可选）
    """
    try:
        logger.info(f"用户 {current_user['username']} 发送消息到 {request.agent_id}")

        # 获取对应的 Agent
        agent = get_agent(request.agent_id)

        # 执行对话
        response = await agent.chat_async(
            message=request.message,
            session_id=request.session_id,
            user_id=current_user["user_id"]
        )

        return ChatResponse(
            agent_id=request.agent_id,
            response=response["message"],
            session_id=response["session_id"],
            timestamp=response["timestamp"]
        )

    except Exception as e:
        logger.error(f"聊天错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="处理请求时出错"
        )

@router.get("/agents", response_model=List[AgentInfo])
async def list_agents():
    """获取可用的 Agent 列表"""
    return [
        {
            "id": "customer_service",
            "name": "智能客服",
            "description": "专业的客户服务助手",
            "capabilities": ["订单查询", "退款处理", "产品咨询"]
        },
        {
            "id": "code_assistant",
            "name": "代码助手",
            "description": "编程开发助手",
            "capabilities": ["代码生成", "Bug修复", "代码优化"]
        }
    ]

@router.get("/agents/{agent_id}", response_model=AgentInfo)
async def get_agent_info(agent_id: str):
    """获取 Agent 详细信息"""
    agents = {
        "customer_service": {
            "id": "customer_service",
            "name": "智能客服",
            "description": "专业的客户服务助手",
            "capabilities": ["订单查询", "退款处理", "产品咨询"]
        },
        "code_assistant": {
            "id": "code_assistant",
            "name": "代码助手",
            "description": "编程开发助手",
            "capabilities": ["代码生成", "Bug修复", "代码优化"]
        }
    }

    if agent_id not in agents:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} 不存在"
        )

    return agents[agent_id]
```

**Pydantic 模型 (`app/api/schemas.py`)**：

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ChatRequest(BaseModel):
    """聊天请求"""
    agent_id: str = Field(..., description="Agent ID")
    message: str = Field(..., min_length=1, max_length=2000, description="用户消息")
    session_id: Optional[str] = Field(None, description="会话 ID")

class ChatResponse(BaseModel):
    """聊天响应"""
    agent_id: str
    response: str
    session_id: str
    timestamp: datetime

class AgentInfo(BaseModel):
    """Agent 信息"""
    id: str
    name: str
    description: str
    capabilities: List[str]

class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    version: str
    agents: dict
```

#### Docker 容器化部署

**Dockerfile**：

```dockerfile
# 多阶段构建 - 生产优化
FROM python:3.11-slim as builder

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 生产镜像
FROM python:3.11-slim

# 创建非 root 用户
RUN useradd -m -u 1000 appuser

# 设置工作目录
WORKDIR /app

# 安装运行时依赖
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 从 builder 复制虚拟环境
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# 复制应用代码
COPY --chown=appuser:appuser . .

# 切换到非 root 用户
USER appuser

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml（本地开发）**：

```yaml
version: '3.8'

services:
  # FastAPI 应用
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: moltbot-api
    ports:
      - "8000:8000"
    environment:
      - DEBUG=${DEBUG:-False}
      - DATABASE_URL=postgresql://moltbot:${POSTGRES_PASSWORD}@postgres:5432/moltbot
      - REDIS_URL=redis://redis:6379/0
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./app:/app/app
      - ./data:/app/data
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - moltbot-network

  # PostgreSQL 数据库
  postgres:
    image: postgres:16-alpine
    container_name: moltbot-postgres
    environment:
      - POSTGRES_DB=moltbot
      - POSTGRES_USER=moltbot
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - moltbot-network

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: moltbot-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - moltbot-network

  # Prometheus 监控
  prometheus:
    image: prom/prometheus:latest
    container_name: moltbot-prometheus
    volumes:
      - ./deployments/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    restart: unless-stopped
    networks:
      - moltbot-network

  # Grafana 可视化
  grafana:
    image: grafana/grafana:latest
    container_name: moltbot-grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./deployments/grafana/dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
    restart: unless-stopped
    networks:
      - moltbot-network

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  moltbot-network:
    driver: bridge
```

**Prometheus 配置 (`deployments/prometheus.yml`)**：

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'moltbot-api'
    static_configs:
      - targets: ['api:8000']
    metrics_path: '/metrics'
```

**启动脚本 (`scripts/start.sh`)**：

```bash
#!/bin/bash

set -e

echo "🚀 启动 Moltbot 应用..."

# 检查环境变量
if [ ! -f .env ]; then
    echo "❌ .env 文件不存在"
    echo "请复制 .env.example 到 .env 并配置环境变量"
    exit 1
fi

# 构建并启动
echo "📦 构建 Docker 镜像..."
docker-compose build

echo "🔄 启动服务..."
docker-compose up -d

echo "⏳ 等待服务启动..."
sleep 10

# 健康检查
echo "🔍 健康检查..."
if curl -f http://localhost:8000/health; then
    echo "✅ 应用启动成功！"
    echo ""
    echo "📊 服务地址："
    echo "  - API: http://localhost:8000"
    echo "  - 文档: http://localhost:8000/docs"
    echo "  - Prometheus: http://localhost:9090"
    echo "  - Grafana: http://localhost:3001"
else
    echo "❌ 应用启动失败"
    docker-compose logs
    exit 1
fi
```

#### 云服务部署

本节介绍如何在三大云平台部署 Moltbot 应用。

##### 选项 1：AWS 部署

**架构**：
- EC2 / ECS（应用服务器）
- RDS PostgreSQL（数据库）
- ElastiCache Redis（缓存）
- Application Load Balancer（负载均衡）
- CloudWatch（监控）

**使用 ECS Fargate 部署**：

```yaml
# aws/ecs-task-definition.json
{
  "family": "moltbot-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "moltbot-api",
      "image": "YOUR_ECR_REPO/moltbot:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://user:pass@YOUR_RDS_ENDPOINT/moltbot"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://YOUR_ELASTICACHE_ENDPOINT:6379"
        }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:openai-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/moltbot",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

**部署脚本 (`aws/deploy.sh`)**：

```bash
#!/bin/bash

set -e

AWS_REGION="us-east-1"
ECR_REPO="YOUR_ECR_REPO"
ECS_CLUSTER="moltbot-cluster"
ECS_SERVICE="moltbot-service"

echo "🔨 构建 Docker 镜像..."
docker build -t moltbot .

echo "🏷️ 打标签..."
docker tag moltbot:latest $ECR_REPO:latest

echo "🔐 登录 AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REPO

echo "📤 推送镜像..."
docker push $ECR_REPO:latest

echo "🔄 更新 ECS 服务..."
aws ecs update-service \
  --cluster $ECS_CLUSTER \
  --service $ECS_SERVICE \
  --force-new-deployment \
  --region $AWS_REGION

echo "⏳ 等待部署完成..."
aws ecs wait services-stable \
  --cluster $ECS_CLUSTER \
  --services $ECS_SERVICE \
  --region $AWS_REGION

echo "✅ 部署完成！"
```

##### 选项 2：Google Cloud Platform (GCP)

**使用 Cloud Run**：

```yaml
# gcp/cloudbuild.yaml
steps:
  # 构建 Docker 镜像
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/moltbot:latest', '.']

  # 推送到 Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/moltbot:latest']

  # 部署到 Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'moltbot'
      - '--image'
      - 'gcr.io/$PROJECT_ID/moltbot:latest'
      - '--platform'
      - 'managed'
      - '--region'
      - 'us-central1'
      - '--allow-unauthenticated'
      - '--memory'
      - '4Gi'
      - '--cpu'
      - '2'
      - '--set-env-vars'
      - 'DATABASE_URL=${_DATABASE_URL},REDIS_URL=${_REDIS_URL}'
      - '--set-secrets'
      - 'OPENAI_API_KEY=openai-key:latest'
```

**部署命令**：

```bash
# 启用必要的 API
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com

# 创建 Secret
echo "your-api-key" | \
  gcloud secrets create openai-key --data-file=-

# 触发构建
gcloud builds submit --config gcp/cloudbuild.yaml
```

##### 选项 3：Azure Container Instances

```bash
# 创建资源组
az group create --name moltbot-rg --location eastus

# 创建容器注册表
az acr create --resource-group moltbot-rg --name moltbotRegistry --sku Basic

# 登录 ACR
az acr login --name moltbotRegistry

# 构建并推送
az acr build --registry moltbotRegistry --image moltbot:latest .

# 部署到 Container Instances
az container create \
  --resource-group moltbot-rg \
  --name moltbot-api \
  --image moltbotRegistry.azurecr.io/moltbot:latest \
  --cpu 2 \
  --memory 4 \
  --ports 8000 \
  --environment-variables \
    DATABASE_URL=$DATABASE_URL \
    REDIS_URL=$REDIS_URL \
  --secure-environment-variables \
    OPENAI_API_KEY=$OPENAI_API_KEY
```

#### CI/CD 自动化

**GitHub Actions 工作流** (`.github/workflows/deploy.yml`):

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 测试
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov

      - name: Run tests
        run: |
          pytest tests/ --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml

  # 构建和推送镜像
  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # 部署到生产环境
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to AWS ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: aws/ecs-task-definition.json
          service: moltbot-service
          cluster: moltbot-cluster
          wait-for-service-stability: true

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '部署到生产环境完成！'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

**GitLab CI/CD** (`.gitlab-ci.yml`):

```yaml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA

# 测试
test:
  stage: test
  image: python:3.11
  script:
    - pip install -r requirements.txt
    - pip install pytest
    - pytest tests/
  coverage: '/TOTAL.*\s+(\d+%)$/'

# 构建
build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE

# 部署到生产
deploy:
  stage: deploy
  image: amazon/aws-cli
  script:
    - aws ecs update-service --cluster moltbot --service moltbot-api --force-new-deployment
  only:
    - main
```

#### 监控和日志

**日志配置 (`app/core/logger.py`)**：

```python
import logging
import sys
from pathlib import Path
from loguru import logger as loguru_logger

class InterceptHandler(logging.Handler):
    """将标准 logging 转发到 loguru"""

    def emit(self, record):
        try:
            level = loguru_logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        loguru_logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )

def setup_logger(name: str = "moltbot"):
    """配置日志系统"""

    # 移除默认 handler
    loguru_logger.remove()

    # 控制台输出（带颜色）
    loguru_logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO",
        colorize=True
    )

    # 文件输出（按日期轮转）
    loguru_logger.add(
        "logs/moltbot_{time:YYYY-MM-DD}.log",
        rotation="00:00",  # 每天午夜轮转
        retention="30 days",  # 保留 30 天
        compression="zip",  # 压缩旧日志
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="DEBUG"
    )

    # 错误日志单独记录
    loguru_logger.add(
        "logs/errors.log",
        rotation="10 MB",
        retention="90 days",
        level="ERROR"
    )

    # 拦截标准 logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0)

    return loguru_logger

logger = setup_logger()
```

**Prometheus 指标 (`app/core/metrics.py`)**：

```python
from prometheus_client import Counter, Histogram, Gauge, Info
import time
from functools import wraps

# 定义指标
request_count = Counter(
    'moltbot_requests_total',
    'Total requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'moltbot_request_duration_seconds',
    'Request duration',
    ['method', 'endpoint']
)

agent_chat_count = Counter(
    'moltbot_agent_chats_total',
    'Total agent chats',
    ['agent_id']
)

agent_chat_duration = Histogram(
    'moltbot_agent_chat_duration_seconds',
    'Agent chat duration',
    ['agent_id']
)

active_sessions = Gauge(
    'moltbot_active_sessions',
    'Active sessions',
    ['agent_id']
)

app_info = Info(
    'moltbot_app',
    'Moltbot application info'
)

def track_time(metric: Histogram, *labels):
    """装饰器：跟踪函数执行时间"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                metric.labels(*labels).observe(duration)

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                metric.labels(*labels).observe(duration)

        return async_wrapper if hasattr(func, '__async__') else sync_wrapper
    return decorator
```

**使用示例**：

```python
from app.core.metrics import agent_chat_count, agent_chat_duration, track_time
from app.core.logger import logger

class CustomerServiceAgent:
    @track_time(agent_chat_duration, 'customer_service')
    async def chat(self, message: str):
        agent_chat_count.labels('customer_service').inc()

        logger.info(f"处理消息: {message}")

        # 业务逻辑
        response = await self._process_message(message)

        logger.info(f"响应: {response}")
        return response
```

**Grafana 仪表板配置**：

```json
{
  "dashboard": {
    "title": "Moltbot 监控",
    "panels": [
      {
        "title": "请求速率",
        "targets": [
          {
            "expr": "rate(moltbot_requests_total[5m])"
          }
        ]
      },
      {
        "title": "响应时间",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, moltbot_request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Agent 对话次数",
        "targets": [
          {
            "expr": "sum by (agent_id) (moltbot_agent_chats_total)"
          }
        ]
      },
      {
        "title": "活跃会话数",
        "targets": [
          {
            "expr": "sum by (agent_id) (moltbot_active_sessions)"
          }
        ]
      }
    ]
  }
}
```

#### 安全最佳实践

```python
# app/core/security.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional

from app.core.config import settings

# 密码哈希
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer
security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """创建访问令牌"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """验证 JWT 令牌"""
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭据"
            )
        return {"username": username, "user_id": payload.get("user_id")}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据"
        )

def get_current_user(current_user: dict = Depends(verify_token)):
    """获取当前用户（依赖注入）"""
    return current_user

def hash_password(password: str) -> str:
    """哈希密码"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)
```

#### 部署检查清单

在部署到生产环境前，请确认以下项目：

**环境配置**：
- [ ] 所有环境变量已正确配置
- [ ] `.env` 文件已从版本控制中排除
- [ ] 敏感信息使用 Secret Manager 存储
- [ ] 数据库连接字符串正确
- [ ] API 密钥有效且有足够配额

**安全检查**：
- [ ] 启用 HTTPS（SSL 证书）
- [ ] 配置 CORS 白名单
- [ ] 启用速率限制
- [ ] 实施输入验证
- [ ] 使用强密码和 JWT
- [ ] 定期更新依赖包

**性能优化**：
- [ ] 启用 Redis 缓存
- [ ] 配置数据库连接池
- [ ] 启用 Gzip 压缩
- [ ] 使用 CDN（如需要）
- [ ] 异步处理长时间任务

**监控和日志**：
- [ ] Prometheus 指标正常采集
- [ ] 日志正确输出和轮转
- [ ] 配置告警规则
- [ ] Grafana 仪表板配置
- [ ] Sentry 错误追踪（可选）

**高可用性**：
- [ ] 配置负载均衡
- [ ] 数据库备份策略
- [ ] 自动扩缩容配置
- [ ] 健康检查端点正常
- [ ] 优雅关闭机制

**测试**：
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 负载测试完成
- [ ] 灾难恢复演练

---

**下一步**：在 7.5 节中，我们将学习完整的端到端实战项目，将以上所有内容整合到一起。

---

### 端到端实战项目：企业级智能客服系统

本节将带你从零到一完成一个完整的**企业级智能客服系统**，涵盖开发、测试、部署全流程。

#### 项目概述

**功能特性**：
- 🤖 多轮对话智能客服（支持上下文记忆）
- 📚 RAG 知识库（企业产品文档）
- 🔍 工具调用（订单查询、退款处理、物流跟踪）
- 💬 多渠道支持（Web、微信、API）
- 📊 实时监控和分析
- 🔐 企业级安全认证

**技术栈**：
- 后端：FastAPI + Moltbot + PostgreSQL + Redis
- 前端：Vue3 + ElementPlus
- 部署：Docker + Nginx + Cloud Run
- 监控：Prometheus + Grafana + Sentry

#### 项目初始化

**创建项目**：

```bash
# 项目名称
PROJECT_NAME="enterprise-cs-bot"

# 创建项目目录
mkdir -p $PROJECT_NAME/{app,tests,deployments,docs}
cd $PROJECT_NAME

# 初始化 Git
git init

# 创建 Python 虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 创建基本文件结构
touch requirements.txt
touch README.md
touch .env.example
touch .gitignore
touch docker-compose.yml
```

**`.gitignore`**：

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# 环境变量
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# 日志
logs/
*.log

# 数据库
*.db
*.sqlite3

# 向量数据库
data/chroma/

# Docker
.dockerignore

# 测试
.pytest_cache/
.coverage
htmlcov/

# MacOS
.DS_Store
```

**`requirements.txt`**：

```txt
# FastAPI 核心
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
pydantic-settings==2.1.0

# ASGI 服务器
gunicorn==21.2.0

# 安全认证
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# 数据库
sqlalchemy==2.0.25
asyncpg==0.29.0
alembic==1.13.1

# Redis
redis==5.0.1
hiredis==2.3.2

# Moltbot
moltbot==0.3.0

# LangChain（可选，用于高级功能）
langchain==0.1.0
langchain-openai==0.0.5
langchain-community==0.0.16

# 向量数据库
chromadb==0.4.22

# 工具库
httpx==0.26.0
aiofiles==23.2.1
python-dotenv==1.0.0

# 任务队列
celery==5.3.4

# 监控和日志
prometheus-client==0.19.0
loguru==0.7.2
sentry-sdk==1.40.0

# 限流
slowapi==0.1.9

# CORS
python-multipart==0.0.6

# 测试
pytest==7.4.4
pytest-asyncio==0.23.3
pytest-cov==4.1.0
httpx==0.26.0

# 代码质量
black==24.1.1
flake8==7.0.0
mypy==1.8.0
```

**`README.md`**：

```markdown
# 企业级智能客服系统

基于 Moltbot 的企业级智能客服解决方案。

## 功能特性

- 🤖 多轮对话智能客服
- 📚 RAG 知识库检索
- 🔍 工具调用和自动化
- 💬 多渠道接入
- 📊 实时监控分析
- 🔐 企业级安全

## 快速开始

\`\`\`bash
# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的配置

# 启动服务
docker-compose up -d

# 访问文档
open http://localhost:8000/docs
\`\`\`

## 项目结构

\`\`\`
├── app/                 # 应用代码
├── tests/              # 测试代码
├── deployments/        # 部署配置
├── docs/              # 文档
└── scripts/           # 脚本
\`\`\`

## 开发指南

详见 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## 部署指南

详见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## License

MIT
```

#### 后端开发

**配置管理** (`app/core/config.py`):

```python
from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    """应用配置"""

    # 应用信息
    APP_NAME: str = "Enterprise Customer Service Bot"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"  # development, staging, production

    # API 配置
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_PREFIX: str = "/api/v1"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "https://yourdomain.com"
    ]

    # LLM 配置
    LLM_PROVIDER: str = "openai"
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_MAX_TOKENS: int = 2000

    # 数据库配置
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis 配置
    REDIS_URL: str
    REDIS_MAX_CONNECTIONS: int = 50

    # 向量数据库
    CHROMA_PERSIST_DIR: str = "./data/chroma"
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    # JWT 配置
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # 文件上传
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [".pdf", ".txt", ".md", ".docx"]

    # 限流配置
    RATE_LIMIT_PER_MINUTE: int = 100
    BURST_RATE_LIMIT: int = 200

    # 监控配置
    ENABLE_SENTRY: bool = True
    SENTRY_DSN: Optional[str] = None
    ENABLE_PROMETHEUS: bool = True

    # 邮件配置（用于通知）
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

**数据库模型** (`app/models/models.py`):

```python
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    conversations = relationship("Conversation", back_populates="user")

class Conversation(Base):
    """对话会话表"""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(200))
    status = Column(String(20), default="active")  # active, closed, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")

class Message(Base):
    """消息表"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    metadata = Column(Text)  # JSON 字符串，存储额外信息
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    conversation = relationship("Conversation", back_populates="messages")

class Document(Base):
    """文档表（知识库）"""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50))
    tags = Column(String(200))  # 逗号分隔的标签
    file_path = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**数据库连接** (`app/core/database.py`):

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
from app.core.config import settings
from app.models.models import Base

# 创建异步引擎
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW
)

# 创建会话工厂
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """获取数据库会话（依赖注入）"""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    """初始化数据库表"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

**客服 Agent 实现** (`app/agents/customer_service.py`):

```python
from moltbot import Agent, Tool
from moltbot.memory import ConversationMemory
from moltbot.llm import OpenAILLM
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logger import logger
from app.core.database import async_session_maker
from app.models.models import Message, Conversation
from sqlalchemy import select
import json

class CustomerServiceAgent:
    """智能客服 Agent"""

    def __init__(self):
        self.llm = OpenAILLM(
            api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_MODEL,
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS
        )

        # 创建记忆系统
        self.memory = ConversationMemory(
            max_history=20,
            persist=True,
            storage_path=settings.CHROMA_PERSIST_DIR
        )

        # 创建 Agent
        self.agent = Agent(
            name="智能客服",
            llm=self.llm,
            instructions=self._get_instructions(),
            memory=self.memory
        )

        # 添加工具
        self._register_tools()

    def _get_instructions(self) -> str:
        """获取 Agent 指令"""
        return """
        你是一个专业的智能客服助手，名为"小智"。

        ## 角色定位
        - 友好、专业、耐心的客服代表
        - 代表公司品牌形象
        - 致力于提供卓越的客户服务

        ## 工作原则
        1. **友好热情**：使用礼貌、热情的语言
        2. **专业准确**：提供准确的信息和解决方案
        3. **高效快速**：快速响应，不浪费客户时间
        4. **同理心**：理解客户的情绪和需求
        5. **诚实透明**：不确定的信息坦诚告知

        ## 对话流程
        1. 问候和了解需求
        2. 分析问题类型
        3. 使用工具查询信息
        4. 提供解决方案
        5. 确认满意度
        6. 记录反馈

        ## 语言风格
        - 使用简洁、清晰的语言
        - 避免技术术语
        - 适当使用表情符号（保持专业）
        - 主动提供帮助

        ## 限制
        - 不透露公司内部信息
        - 不做出无法兑现的承诺
        - 遇到无法解决的问题，引导联系人工客服
        """

    def _register_tools(self):
        """注册工具"""

        # 工具 1：查询订单
        self.agent.add_tool(Tool(
            name="query_order",
            description="查询订单信息，包括订单状态、物流信息等",
            function=self._query_order
        ))

        # 工具 2：处理退款
        self.agent.add_tool(Tool(
            name="process_refund",
            description="处理退款申请",
            function=self._process_refund
        ))

        # 工具 3：查询产品信息
        self.agent.add_tool(Tool(
            name="query_product",
            description="查询产品信息，包括价格、库存、规格等",
            function=self._query_product
        ))

        # 工具 4：搜索知识库
        self.agent.add_tool(Tool(
            name="search_knowledge",
            description="搜索公司知识库，查找常见问题解答",
            function=self._search_knowledge
        ))

    async def _query_order(self, order_id: str) -> Dict[str, Any]:
        """查询订单信息"""
        logger.info(f"查询订单: {order_id}")

        # 模拟数据库查询
        # 实际应用中从数据库查询
        order_info = {
            "order_id": order_id,
            "status": "已发货",
            "products": [
                {"name": "商品A", "quantity": 2, "price": 99.00},
                {"name": "商品B", "quantity": 1, "price": 199.00}
            ],
            "total": 397.00,
            "shipping_address": "北京市朝阳区xxx",
            "tracking_number": "SF1234567890",
            "estimated_delivery": "2024-03-20"
        }

        return order_info

    async def _process_refund(self, order_id: str, reason: str) -> Dict[str, Any]:
        """处理退款申请"""
        logger.info(f"处理退款申请: 订单={order_id}, 原因={reason}")

        # 模拟退款处理
        refund_result = {
            "success": True,
            "refund_id": f"REF{order_id}",
            "amount": 397.00,
            "estimated_time": "3-5个工作日",
            "message": "退款申请已提交，审核通过后将原路返回"
        }

        return refund_result

    async def _query_product(self, product_name: str) -> Dict[str, Any]:
        """查询产品信息"""
        logger.info(f"查询产品: {product_name}")

        # 模拟产品查询
        product_info = {
            "name": product_name,
            "price": 199.00,
            "stock": 150,
            "description": "这是一款优质产品...",
            "specifications": {
                "color": "多种颜色可选",
                "size": "S/M/L/XL",
                "material": "优质面料"
            },
            "reviews": {
                "average_rating": 4.8,
                "total_reviews": 1250
            }
        }

        return product_info

    async def _search_knowledge(self, query: str) -> Dict[str, Any]:
        """搜索知识库"""
        logger.info(f"搜索知识库: {query}")

        # 实际应用中使用向量搜索
        # 这里简化为返回相关文档
        knowledge = {
            "query": query,
            "results": [
                {
                    "title": "退款政策",
                    "content": "订单签收后7天内可申请无理由退款...",
                    "relevance": 0.95
                },
                {
                    "title": "物流配送说明",
                    "content": "全国包邮，2-3个工作日送达...",
                    "relevance": 0.87
                }
            ]
        }

        return knowledge

    async def chat(
        self,
        message: str,
        user_id: int,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """处理用户消息"""

        logger.info(f"用户 {user_id} 发送消息: {message}")

        try:
            # 调用 Moltbot Agent
            response = await self.agent.chat_async(
                message=message,
                session_id=session_id or f"session_{user_id}"
            )

            # 保存到数据库
            await self._save_conversation(
                user_id=user_id,
                session_id=session_id or f"session_{user_id}",
                user_message=message,
                assistant_message=response
            )

            return {
                "success": True,
                "response": response,
                "session_id": session_id or f"session_{user_id}"
            }

        except Exception as e:
            logger.error(f"处理消息时出错: {e}", exc_info=True)
            return {
                "success": False,
                "error": "抱歉，系统出现错误，请稍后再试"
            }

    async def _save_conversation(
        self,
        user_id: int,
        session_id: str,
        user_message: str,
        assistant_message: str
    ):
        """保存对话到数据库"""
        async with async_session_maker() as session:
            # 查找或创建会话
            result = await session.execute(
                select(Conversation).filter_by(session_id=session_id)
            )
            conversation = result.scalar_one_or_none()

            if not conversation:
                conversation = Conversation(
                    user_id=user_id,
                    session_id=session_id,
                    title=user_message[:50]  # 使用第一条消息作为标题
                )
                session.add(conversation)
                await session.flush()

            # 保存用户消息
            user_msg = Message(
                conversation_id=conversation.id,
                role="user",
                content=user_message
            )
            session.add(user_msg)

            # 保存助手消息
            assistant_msg = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=assistant_message
            )
            session.add(assistant_msg)

            await session.commit()

    async def get_conversation_history(
        self,
        session_id: str,
        limit: int = 50
    ) -> list:
        """获取对话历史"""
        async with async_session_maker() as session:
            result = await session.execute(
                select(Message)
                .join(Conversation)
                .filter(Conversation.session_id == session_id)
                .order_by(Message.created_at)
                .limit(limit)
            )
            messages = result.scalars().all()

            return [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.created_at.isoformat()
                }
                for msg in messages
            ]

    async def clear_session(self, session_id: str):
        """清除会话"""
        # 清除记忆
        await self.memory.clear_session(session_id)

        logger.info(f"会话 {session_id} 已清除")

# 创建全局 Agent 实例
customer_service_agent = CustomerServiceAgent()
```

#### 前端开发（Vue3）

**前端项目结构**：

```bash
# 创建前端项目
npm create vue@latest frontend
cd frontend

# 安装依赖
npm install axios element-plus @element-plus/icons-vue
```

**主组件 (`frontend/src/views/CustomerService.vue`)**：

```vue
<template>
  <div class="customer-service-container">
    <el-container>
      <!-- 头部 -->
      <el-header class="chat-header">
        <div class="header-content">
          <el-avatar :size="40" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <div class="header-info">
            <h3>智能客服小智</h3>
            <el-tag type="success" size="small">在线</el-tag>
          </div>
        </div>
        <el-button circle @click="clearChat">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </el-header>

      <!-- 聊天区域 -->
      <el-main class="chat-main">
        <div ref="messagesContainer" class="messages-container">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message', msg.role]"
          >
            <el-avatar v-if="msg.role === 'assistant'" :size="32" />
            <div class="message-content">
              <div class="message-bubble">{{ msg.content }}</div>
              <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
            </div>
            <el-avatar v-if="msg.role === 'user'" :size="32" />
          </div>

          <!-- 加载中 -->
          <div v-if="loading" class="message assistant">
            <el-avatar :size="32" />
            <div class="message-content">
              <div class="message-bubble loading">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
        </div>
      </el-main>

      <!-- 输入区域 -->
      <el-footer class="chat-footer">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="2"
          placeholder="输入您的问题..."
          @keydown.enter.prevent="sendMessage"
          :disabled="loading"
        />
        <el-button
          type="primary"
          :icon="Promotion"
          @click="sendMessage"
          :loading="loading"
          class="send-button"
        >
          发送
        </el-button>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Promotion } from '@element-plus/icons-vue'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

// 状态
const messages = ref([])
const userInput = ref('')
const loading = ref(false)
const sessionId = ref(null)
const messagesContainer = ref(null)

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return

  const userMessage = userInput.value
  userInput.value = ''

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  })

  // 滚动到底部
  await scrollToBottom()

  // 显示加载状态
  loading.value = true

  try {
    const response = await axios.post(`${API_BASE}/chat`, {
      agent_id: 'customer_service',
      message: userMessage,
      session_id: sessionId.value
    })

    // 添加助手回复
    messages.value.push({
      role: 'assistant',
      content: response.data.response,
      timestamp: new Date()
    })

    // 更新会话 ID
    sessionId.value = response.data.session_id

  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送失败，请稍后重试')

    messages.value.push({
      role: 'assistant',
      content: '抱歉，网络连接出现问题，请稍后重试。',
      timestamp: new Date()
    })
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: zhCN
  })
}

// 清除对话
const clearChat = () => {
  messages.value = []
  sessionId.value = null
  ElMessage.success('对话已清除')
}

// 初始化
onMounted(() => {
  // 欢迎消息
  messages.value.push({
    role: 'assistant',
    content: '您好！我是智能客服小智，很高兴为您服务。请问有什么可以帮助您？',
    timestamp: new Date()
  })
})
</script>

<style scoped>
.customer-service-container {
  height: 100vh;
  background: #f5f7fa;
}

.chat-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-info h3 {
  margin: 0;
  font-size: 18px;
}

.chat-main {
  padding: 20px;
  overflow-y: auto;
}

.messages-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.message {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 60%;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  line-height: 1.6;
}

.message.user .message-bubble {
  background: #409eff;
  color: white;
}

.message.assistant .message-bubble {
  background: white;
  color: #333;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  text-align: right;
}

.message-bubble.loading {
  display: flex;
  gap: 5px;
  padding: 15px 20px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #409eff;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chat-footer {
  background: white;
  border-top: 1px solid #e4e7ed;
  padding: 15px 20px;
  display: flex;
  gap: 10px;
}

.send-button {
  align-self: flex-end;
}
</style>
```

#### 部署上线

**完整的部署流程在前面 7.4.10 节已详细讲解，这里提供快速部署命令**：

```bash
# 1. 构建和启动（本地开发）
docker-compose up -d

# 2. 运行测试
pytest tests/ -v

# 3. 构建生产镜像
docker build -t enterprise-cs-bot:latest .

# 4. 推送到镜像仓库
docker tag enterprise-cs-bot:latest YOUR_REGISTRY/enterprise-cs-bot:latest
docker push YOUR_REGISTRY/enterprise-cs-bot:latest

# 5. 部署到云平台
# 使用 GitHub Actions 自动部署（见 .github/workflows/deploy.yml）
# 或手动部署到云平台（见 7.4.10.3 节）

# 6. 验证部署
curl https://your-domain.com/health
```

#### 监控和维护

**关键指标监控**：
- 请求成功率（目标：> 99.9%）
- 平均响应时间（目标：< 2秒）
- 并发会话数
- Agent 工具调用成功率
- 用户满意度评分

**日常维护**：
- 每日查看日志和错误报告
- 每周分析用户反馈
- 每月更新知识库内容
- 定期优化 Prompt 和工具

---

**项目总结**：

通过这个完整的实战项目，你已经掌握了：

✅ 从零到一构建企业级 AI 应用
✅ Moltbot Agent 开发的最佳实践
✅ 前后端分离架构设计
✅ Docker 容器化部署
✅ CI/CD 自动化流程
✅ 监控和日志系统
✅ 安全认证和权限管理

**下一步建议**：

1. 根据实际业务需求定制功能
2. 添加更多 Agent 工具
3. 集成更多渠道（微信、钉钉等）
4. 优化性能和用户体验
5. 建立完善的测试体系

---

## MCP (Model Context Protocol)

### 什么是MCP？

**MCP** 是一个开放协议，让AI应用能够轻松连接到外部数据源和工具。

```
传统方式 vs MCP：

传统方式：
  ❌ 每个数据源需要自定义集成
  ❌ 代码重复，维护困难
  ❌ 缺乏统一标准

MCP方式：
  ✅ 统一的接口标准
  ✅ 即插即用
  ✅ 社区生态共享
```

### MCP架构

```
┌──────────────────────────────────────────┐
│         MCP 架构                          │
├──────────────────────────────────────────┤
│                                          │
│  AI Application                          │
│    ↓                                     │
│  ┌─────────────┐                         │
│  │ MCP Client  │                         │
│  └─────────────┘                         │
│    ↓                                     │
│  ┌─────────────┐    ┌──────────────┐    │
│  │ MCP Server  │ ← → │ Data Source  │    │
│  └─────────────┘    └──────────────┘    │
│                                          │
│  示例MCP Servers：                       │
│  - 文件系统访问                          │
│  - 数据库查询                            │
│  - Git操作                              │
│  - Slack集成                             │
│  - Google Drive                         │
│                                          │
└──────────────────────────────────────────┘
```

### 使用MCP

**安装MCP SDK**：
```bash
pip install mcp
```

**创建MCP Server**：
```python
# my_mcp_server.py
from mcp.server import Server
from mcp.types import Tool, TextContent
import subprocess

app = Server("my-tools")

@app.tool()
def execute_command(command: str) -> str:
    """执行shell命令"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True
        )
        return f"输出：\n{result.stdout}\n错误：\n{result.stderr}"
    except Exception as e:
        return f"错误：{str(e)}"

@app.tool()
def read_file(file_path: str) -> str:
    """读取文件内容"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"错误：{str(e)}"

# 启动服务器
if __name__ == "__main__":
    app.run()
```

**LangChain中使用MCP**：
```python
from langchain_mcp import MCPToolkit

# 连接到MCP服务器
toolkit = MCPToolkit(
    server_url="http://localhost:3000"
)

# 获取工具
tools = toolkit.get_tools()

# 创建Agent
from langchain.agents import create_openai_functions_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo")
agent = create_openai_functions_agent(llm, tools, prompt)

# 使用
from langchain.agents import AgentExecutor

executor = AgentExecutor(agent=agent, tools=tools)
result = executor.invoke({"input": "读取config.py文件"})
```

### 常用MCP Servers

```bash
# 1. 文件系统服务器
mcp-server-filesystem /path/to/directory

# 2. Git服务器
mcp-server-git

# 3. PostgreSQL服务器
mcp-server-postgres

# 4. Slack服务器
mcp-server-slack

# 5. Google Drive服务器
mcp-server-gdrive
```

---

## LangGraph：复杂Agent框架 {#langgraph复杂agent框架}

### 为什么需要LangGraph？

**传统Agent的局限**：
```python
# 传统ReAct Agent
- 线性推理
- 难以处理循环
- 状态管理简单
- 难以实现复杂逻辑

# LangGraph
- 图状状态机
- 支持循环和条件分支
- 灵活的状态管理
- 可视化工作流
```

### LangGraph核心概念

```
LangGraph = Graph + State

Graph（图）：
  - Node（节点）：执行操作的函数
  - Edge（边）：节点之间的转换
  - Conditional Edge（条件边）：基于条件的分支

State（状态）：
  - 在节点之间传递的数据
  - 可以被任意节点修改
  - 类型安全（TypedDict）
```

### 构建第一个LangGraph

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

# 1. 定义状态
class AgentState(TypedDict):
    query: str
    response: str
    needs_search: bool
    search_results: str

# 2. 定义节点
def decide_search(state: AgentState) -> AgentState:
    """决定是否需要搜索"""
    query = state["query"]

    # 简单规则：如果包含"搜索"则搜索
    state["needs_search"] = "搜索" in query

    return state

def search(state: AgentState) -> AgentState:
    """执行搜索"""
    # 实际的搜索逻辑
    state["search_results"] = f"搜索'{state['query']}'的结果..."
    return state

def generate_response(state: AgentState) -> AgentState:
    """生成回复"""
    if state["needs_search"]:
        state["response"] = f"基于搜索结果：{state['search_results']}"
    else:
        state["response"] = f"直接回答：{state['query']}"

    return state

# 3. 构建图
workflow = StateGraph(AgentState)

# 添加节点
workflow.add_node("decide_search", decide_search)
workflow.add_node("search", search)
workflow.add_node("generate", generate_response)

# 设置入口
workflow.set_entry_point("decide_search")

# 添加边
workflow.add_conditional_edges(
    "decide_search",
    lambda x: "search" if x["needs_search"] else "generate",
    {
        "search": "search",
        "generate": "generate"
    }
)

workflow.add_edge("search", "generate")
workflow.add_edge("generate", END)

# 4. 编译图
app = workflow.compile()

# 5. 运行
result = app.invoke({
    "query": "搜索Python教程",
    "response": "",
    "needs_search": False,
    "search_results": ""
})

print(result["response"])
```

### 复杂示例：客服Agent

```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import Literal

class CustomerServiceState(TypedDict):
    user_input: str
    intent: str  # faq, complaint, tech_support
    response: str
    satisfaction: int

llm = ChatOpenAI(model="gpt-3.5-turbo")

def classify_intent(state: CustomerServiceState) -> CustomerServiceState:
    """分类用户意图"""
    prompt = f"分类以下用户意图（faq/complaint/tech_support）：{state['user_input']}"
    response = llm.invoke(prompt)
    state["intent"] = response.content.strip().lower()
    return state

def handle_faq(state: CustomerServiceState) -> CustomerServiceState:
    """处理FAQ"""
    response = llm.invoke(f"回答这个FAQ问题：{state['user_input']}")
    state["response"] = response.content
    return state

def handle_complaint(state: CustomerServiceState) -> CustomerServiceState:
    """处理投诉"""
    response = llm.invoke(f"礼貌地处理这个投诉：{state['user_input']}")
    state["response"] = response.content
    return state

def handle_tech_support(state: CustomerServiceState) -> CustomerServiceState:
    """处理技术支持"""
    response = llm.invoke(f"提供技术支持：{state['user_input']}")
    state["response"] = response.content
    return state

def route_intent(state: CustomerServiceState) -> Literal["faq", "complaint", "tech_support"]:
    """路由到不同处理流程"""
    return state["intent"]

# 构建图
workflow = StateGraph(CustomerServiceState)

workflow.add_node("classify", classify_intent)
workflow.add_node("faq", handle_faq)
workflow.add_node("complaint", handle_complaint)
workflow.add_node("tech_support", handle_tech_support)

workflow.set_entry_point("classify")

workflow.add_conditional_edges(
    "classify",
    route_intent,
    {
        "faq": "faq",
        "complaint": "complaint",
        "tech_support": "tech_support"
    }
)

workflow.add_edge("faq", END)
workflow.add_edge("complaint", END)
workflow.add_edge("tech_support", END)

# 编译
app = workflow.compile()

# 使用
result = app.invoke({
    "user_input": "我的产品有质量问题",
    "intent": "",
    "response": "",
    "satisfaction": 0
})

print(result["response"])
```

### 可视化LangGraph

```python
# 生成可视化图
from IPython.display import Image, display

try:
    display(Image(app.get_graph().draw_mermaid_png()))
except Exception:
    pass
```

### LangGraph 常见模式 {#langgraph-常见模式}

#### 模式1：循环模式（Loop Pattern）

处理需要多次迭代才能完成的任务。

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

class IterationState(TypedDict):
    content: str
    feedback: str
    iteration: int
    approved: bool
    final_output: str

def generate_content(state: IterationState) -> IterationState:
    """生成内容"""
    if state["iteration"] == 0:
        state["content"] = "初稿内容..."
    else:
        # 根据反馈改进
        prompt = f"原内容：{state['content']}\n反馈：{state['feedback']}\n请改进"
        state["content"] = llm.invoke(prompt).content

    state["iteration"] += 1
    return state

def review_content(state: IterationState) -> IterationState:
    """评审内容"""
    prompt = f"""
    评审以下内容（最多迭代{state['iteration']}次）：
    {state['content']}

    如果满意，回复"APPROVED"。
    如果需要改进，提供具体建议。
    """

    response = llm.invoke(prompt).content

    if "APPROVED" in response:
        state["approved"] = True
        state["final_output"] = state["content"]
    else:
        state["feedback"] = response
        state["approved"] = False

    return state

def should_continue(state: IterationState) -> Literal["continue", "end"]:
    """决定是否继续迭代"""
    if state["approved"]:
        return "end"
    if state["iteration"] >= 3:  # 最多迭代3次
        state["final_output"] = state["content"]
        return "end"
    return "continue"

# 构建循环图
workflow = StateGraph(IterationState)
workflow.add_node("generate", generate_content)
workflow.add_node("review", review_content)

workflow.set_entry_point("generate")
workflow.add_edge("generate", "review")

workflow.add_conditional_edges(
    "review",
    should_continue,
    {
        "continue": "generate",  # 循环回 generate
        "end": END
    }
)

app = workflow.compile()

# 运行
result = app.invoke({
    "content": "",
    "feedback": "",
    "iteration": 0,
    "approved": False,
    "final_output": ""
})

print(f"最终输出：{result['final_output']}")
print(f"迭代次数：{result['iteration']}")
```

#### 模式2：并行模式（Parallel Pattern）

多个任务并行执行，然后聚合结果。

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List
import asyncio

class ParallelState(TypedDict):
    topic: str
    technical_analysis: str
    market_analysis: str
    user_analysis: str
    final_report: str

async def technical_analysis(state: ParallelState) -> ParallelState:
    """技术分析"""
    prompt = f"从技术角度分析：{state['topic']}"
    # 模拟异步操作
    await asyncio.sleep(1)
    state["technical_analysis"] = llm.invoke(prompt).content
    return state

async def market_analysis(state: ParallelState) -> ParallelState:
    """市场分析"""
    prompt = f"从市场角度分析：{state['topic']}"
    await asyncio.sleep(1)
    state["market_analysis"] = llm.invoke(prompt).content
    return state

async def user_analysis(state: ParallelState) -> ParallelState:
    """用户分析"""
    prompt = f"从用户角度分析：{state['topic']}"
    await asyncio.sleep(1)
    state["user_analysis"] = llm.invoke(prompt).content
    return state

def synthesize(state: ParallelState) -> ParallelState:
    """综合分析结果"""
    prompt = f"""
    综合以下三个分析角度，生成完整报告：

    技术角度：{state['technical_analysis']}

    市场角度：{state['market_analysis']}

    用户角度：{state['user_analysis']}

    请提供：
    1. 综合评估
    2. 机会与风险
    3. 建议行动
    """

    state["final_report"] = llm.invoke(prompt).content
    return state

# 注意：LangGraph 本身是串行的，真正的并行需要在节点内实现
# 或者使用 astream events 和异步调用

def parallel_analysis_node(state: ParallelState) -> ParallelState:
    """在节点内实现并行"""
    async def _parallel():
        results = await asyncio.gather(
            technical_analysis(state.copy()),
            market_analysis(state.copy()),
            user_analysis(state.copy())
        )
        return results

    # 运行并行任务
    results = asyncio.run(_parallel())

    state["technical_analysis"] = results[0]["technical_analysis"]
    state["market_analysis"] = results[1]["market_analysis"]
    state["user_analysis"] = results[2]["user_analysis"]

    return state

# 构建图
workflow = StateGraph(ParallelState)
workflow.add_node("parallel_analysis", parallel_analysis_node)
workflow.add_node("synthesize", synthesize)

workflow.set_entry_point("parallel_analysis")
workflow.add_edge("parallel_analysis", "synthesize")
workflow.add_edge("synthesize", END)

app = workflow.compile()

result = app.invoke({
    "topic": "开发AI编程助手",
    "technical_analysis": "",
    "market_analysis": "",
    "user_analysis": "",
    "final_report": ""
})

print(result["final_report"])
```

#### 模式3：分支聚合模式（Fork-Join Pattern）

先分支处理，再合并结果。

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

class ForkJoinState(TypedDict):
    document: str
    grammar_errors: list
    style_issues: list
    factual_errors: list
    combined_feedback: str
    revised_document: str

def grammar_check(state: ForkJoinState) -> ForkJoinState:
    """语法检查"""
    prompt = f"检查语法错误：{state['document']}"
    response = llm.invoke(prompt)
    state["grammar_errors"] = ["语法错误1", "语法错误2"]  # 实际从 response 解析
    return state

def style_check(state: ForkJoinState) -> ForkJoinState:
    """风格检查"""
    prompt = f"检查风格问题：{state['document']}"
    response = llm.invoke(prompt)
    state["style_issues"] = ["风格问题1", "风格问题2"]
    return state

def fact_check(state: ForkJoinState) -> ForkJoinState:
    """事实检查"""
    prompt = f"检查事实错误：{state['document']}"
    response = llm.invoke(prompt)
    state["factual_errors"] = ["事实错误1"]
    return state

def aggregate_feedback(state: ForkJoinState) -> ForkJoinState:
    """聚合所有反馈"""
    all_issues = []
    all_issues.extend(state["grammar_errors"])
    all_issues.extend(state["style_issues"])
    all_issues.extend(state["factual_errors"])

    state["combined_feedback"] = "\n".join(all_issues)
    return state

def revise_document(state: ForkJoinState) -> ForkJoinState:
    """根据反馈修订文档"""
    prompt = f"""
    原文档：
    {state['document']}

    反馈：
    {state['combined_feedback']}

    请根据反馈修订文档。
    """

    state["revised_document"] = llm.invoke(prompt).content
    return state

def check_quality(state: ForkJoinState) -> Literal["revise", "finish"]:
    """检查修订后的质量"""
    # 简化版：如果有错误就继续修订
    if len(state["grammar_errors"]) > 0 or len(state["factual_errors"]) > 0:
        return "revise"
    return "finish"

# 构建图
workflow = StateGraph(ForkJoinState)

# 添加分支节点
workflow.add_node("grammar_check", grammar_check)
workflow.add_node("style_check", style_check)
workflow.add_node("fact_check", fact_check)

# 添加聚合节点
workflow.add_node("aggregate", aggregate_feedback)
workflow.add_node("revise", revise_document)

# 入口点（选择一个分支起点）
workflow.set_entry_point("grammar_check")

# 添加分支边（每个检查后都到聚合）
workflow.add_edge("grammar_check", "aggregate")
workflow.add_edge("style_check", "aggregate")
workflow.add_edge("fact_check", "aggregate")

# 注意：这个简化版本没有真正的并行
# 实际需要使用 Send 额外触发其他分支

workflow.add_edge("aggregate", "revise")

workflow.add_conditional_edges(
    "revise",
    check_quality,
    {
        "revise": "grammar_check",  # 重新检查
        "finish": END
    }
)

app = workflow.compile()
```

#### 模式4：代理协调模式（Agent Coordination）

多个 Agent 协作完成复杂任务。

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

class MultiAgentState(TypedDict):
    task: str
    researcher_output: str
    writer_output: str
    reviewer_output: str
    final_output: str
    current_agent: str

def researcher_agent(state: MultiAgentState) -> MultiAgentState:
    """研究 Agent：收集信息"""
    prompt = f"研究任务：{state['task']}\n\n收集相关信息和数据。"
    state["researcher_output"] = llm.invoke(prompt).content
    state["current_agent"] = "researcher"
    return state

def writer_agent(state: MultiAgentState) -> MultiAgentState:
    """写作 Agent：基于研究内容撰写"""
    prompt = f"""
    基于以下研究内容撰写文章：

    研究内容：
    {state['researcher_output']}

    任务：{state['task']}
    """
    state["writer_output"] = llm.invoke(prompt).content
    state["current_agent"] = "writer"
    return state

def reviewer_agent(state: MultiAgentState) -> MultiAgentState:
    """评审 Agent：审核并给出反馈"""
    prompt = f"""
    评审以下文章：

    {state['writer_output']}

    给出评分（1-10）和改进建议。
    如果低于8分，提供具体修改意见。
    """
    state["reviewer_output"] = llm.invoke(prompt).content
    state["current_agent"] = "reviewer"
    return state

def should_revise(state: MultiAgentState) -> Literal["revise", "finish"]:
    """决定是否需要修订"""
    review = state["reviewer_output"]
    # 简化判断
    if "8" in review or "9" in review or "10" in review:
        return "finish"
    return "revise"

def revise_agent(state: MultiAgentState) -> MultiAgentState:
    """修订 Agent：根据评审意见修改"""
    prompt = f"""
    原文章：
    {state['writer_output']}

    评审意见：
    {state['reviewer_output']}

    请根据意见修改文章。
    """

    revised = llm.invoke(prompt).content
    state["writer_output"] = revised
    state["final_output"] = revised
    return state

# 构建多 Agent 工作流
workflow = StateGraph(MultiAgentState)

workflow.add_node("researcher", researcher_agent)
workflow.add_node("writer", writer_agent)
workflow.add_node("reviewer", reviewer_agent)
workflow.add_node("revise", revise_agent)

workflow.set_entry_point("researcher")

# 顺序执行：researcher → writer → reviewer
workflow.add_edge("researcher", "writer")
workflow.add_edge("writer", "reviewer")

# 条件分支：如果需要修订则回到 writer
workflow.add_conditional_edges(
    "reviewer",
    should_revise,
    {
        "revise": "revise",
        "finish": END
    }
)

# 修订后重新评审
workflow.add_edge("revise", "reviewer")

app = workflow.compile()

# 运行
result = app.invoke({
    "task": "写一篇关于AI未来的文章",
    "researcher_output": "",
    "writer_output": "",
    "reviewer_output": "",
    "final_output": "",
    "current_agent": ""
})

print(result["final_output"])
```

### LangGraph vs Prompt Chaining 对比 {#langgraph-vs-prompt-chaining-对比}

| 特性 | LangGraph | Prompt Chaining |
|------|-----------|----------------|
| **复杂度** | 高，支持复杂状态机 | 中，线性或简单分支 |
| **灵活性** | 非常灵活，支持循环、条件分支 | 相对固定，主要是顺序执行 |
| **状态管理** | 内置状态管理，在节点间传递 | 需要手动传递上下文 |
| **可视化** | 支持生成流程图 | 无内置可视化 |
| **调试** | 可以追踪每一步的状态变化 | 需要手动打印中间结果 |
| **学习曲线** | 陡峭，需要理解图概念 | 平缓，容易上手 |
| **适用场景** | 复杂 Agent 系统、多步决策 | 简单多步任务、内容生成流水线 |

### LangGraph 最佳实践

#### ✅ DO（推荐做法）

1. **明确定义状态结构**
```python
from typing import TypedDict

class AgentState(TypedDict):
    # 明确每个字段的类型
    query: str
    search_results: List[str]
    answer: str
    confidence: float
    iteration_count: int
```

2. **保持节点函数简单**
```python
# 好的做法：每个节点只做一件事
def search_node(state: AgentState) -> AgentState:
    """只负责搜索"""
    state["search_results"] = search_api(state["query"])
    return state

def rank_node(state: AgentState) -> AgentState:
    """只负责排序"""
    state["search_results"] = rank_results(state["search_results"])
    return state
```

3. **使用条件边实现复杂逻辑**
```python
def route_condition(state: AgentState) -> Literal["a", "b", "c"]:
    """清晰的路由逻辑"""
    score = state["confidence"]

    if score > 0.9:
        return "a"  # 高置信度直接输出
    elif score > 0.5:
        return "b"  # 中等置信度需要验证
    else:
        return "c"  # 低置信度重新搜索
```

4. **添加错误处理**
```python
def safe_node(state: AgentState) -> AgentState:
    """带错误处理的节点"""
    try:
        result = risky_operation(state)
        state["result"] = result
        state["error"] = None
    except Exception as e:
        state["error"] = str(e)
        state["retry_count"] = state.get("retry_count", 0) + 1

    return state
```

5. **记录中间结果**
```python
from langgraph.checkpoint.memory import MemorySaver

# 添加检查点，可以保存和恢复状态
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)

# 运行时可以指定 thread_id
config = {"configurable": {"thread_id": "session-123"}}
result = app.invoke(initial_state, config=config)

# 可以查看历史状态
for state in app.get_state_history(config):
    print(state)
```

#### ❌ DON'T（避免做法）

1. **不要在节点中执行长时间任务**
```python
# 不好的做法：在节点中下载大文件
def download_node(state: AgentState) -> AgentState:
    # 可能会阻塞很长时间
    large_file = download_huge_file()
    return state

# 好的做法：返回任务ID，异步处理
def initiate_download(state: AgentState) -> AgentState:
    task_id = start_async_download(state["url"])
    state["task_id"] = task_id
    state["status"] = "downloading"
    return state
```

2. **不要在节点中直接修改外部状态**
```python
# 不好的做法：直接写数据库
def save_node(state: AgentState) -> AgentState:
    database.save(state["data"])  # 副作用
    return state

# 好的做法：在专门的节点中处理
def prepare_data_node(state: AgentState) -> AgentState:
    state["prepared_data"] = prepare_for_db(state["data"])
    return state

def save_node(state: AgentState) -> AgentState:
    # 这个节点唯一的作用就是保存
    database.save(state["prepared_data"])
    return state
```

3. **不要创建过大的状态对象**
```python
# 不好的做法：状态包含大量数据
class AgentState(TypedDict):
    entire_document: str  # 可能很长
    all_search_results: List[str]  # 可能有几百条
    complete_history: List[dict]  # 完整历史记录

# 好的做法：只保存必要信息
class AgentState(TypedDict):
    document_id: str  # 用ID引用
    top_k_results: List[str]  # 只保留前K个结果
    current_step: int  # 当前步骤
    summary: str  # 简要总结
```

### 实战项目：智能内容生成系统 {#实战项目智能内容生成系统}

结合 LangGraph 和 Prompt Chaining 构建完整系统。

```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import TypedDict, Literal
import operator
from typing import Annotated

# 1. 定义状态
class ContentGenState(TypedDict):
    topic: str
    target_audience: str
    content_type: str  # blog, tutorial, guide
    research_data: str
    outline: str
    draft: str
    feedback: str
    final_content: str
    quality_score: float
    iteration: int

# 2. 定义工具函数
def web_search(query: str) -> str:
    """模拟网络搜索"""
    return f"关于'{query}'的搜索结果：..."

def seo_analysis(content: str) -> dict:
    """SEO 分析"""
    return {
        "score": 0.75,
        "keywords": ["AI", "LangGraph", "Python"],
        "suggestions": ["添加更多示例", "优化标题"]
    }

# 3. 定义节点
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)

def research(state: ContentGenState) -> ContentGenState:
    """研究阶段：收集信息"""
    # 使用 Prompt Chaining：分步研究
    search_prompt = f"搜索关于'{state['topic']}'的最新信息"
    search_results = web_search(search_prompt)

    analyze_prompt = f"""
    分析以下搜索结果，提取关键信息：
    {search_results}

    针对{state['target_audience']}受众。
    """

    analysis = llm.invoke(analyze_prompt).content
    state["research_data"] = analysis
    return state

def outline(state: ContentGenState) -> ContentGenState:
    """大纲阶段：创建结构"""
    prompt = f"""
    基于{state['content_type']}格式，创建大纲：

    主题：{state['topic']}
    研究数据：{state['research_data']}

    大纲应包含：
    - 引言
    - 主要章节（3-5个）
    - 每章节的关键点
    - 结论
    """

    state["outline"] = llm.invoke(prompt).content
    return state

def draft_content(state: ContentGenState) -> ContentGenState:
    """起草阶段：撰写内容"""
    prompt = f"""
    基于以下大纲撰写内容：

    {state['outline']}

    要求：
    - 针对{state['target_audience']}
    - 专业且易懂
    - 包含代码示例（如适用）
    - 1000-1500字
    """

    state["draft"] = llm.invoke(prompt).content
    return state

def quality_check(state: ContentGenState) -> ContentGenState:
    """质量检查"""
    # SEO 分析
    seo_result = seo_analysis(state["draft"])
    state["quality_score"] = seo_result["score"]

    # AI 评审
    review_prompt = f"""
    评审以下内容质量：

    {state['draft']}

    从以下方面评分（1-10）：
    1. 内容准确性
    2. 结构完整性
    3. 语言流畅性
    4. SEO 优化
    5. 受众适配度

    给出总分和改进建议。
    """

    review = llm.invoke(review_prompt).content
    state["feedback"] = review
    return state

def should_improve(state: ContentGenState) -> Literal["improve", "finish"]:
    """决定是否需要改进"""
    state["iteration"] += 1

    if state["quality_score"] >= 0.8:
        return "finish"
    if state["iteration"] >= 2:  # 最多迭代2次
        return "finish"
    return "improve"

def improve_content(state: ContentGenState) -> ContentGenState:
    """改进内容"""
    prompt = f"""
    原内容：
    {state['draft']}

    反馈：
    {state['feedback']}

    请根据反馈改进内容。
    """

    improved = llm.invoke(prompt).content
    state["draft"] = improved
    return state

def finalize(state: ContentGenState) -> ContentGenState:
    """最终处理"""
    state["final_content"] = state["draft"]
    return state

# 4. 构建图
workflow = StateGraph(ContentGenState)

workflow.add_node("research", research)
workflow.add_node("outline", outline)
workflow.add_node("draft", draft_content)
workflow.add_node("quality_check", quality_check)
workflow.add_node("improve", improve_content)
workflow.add_node("finalize", finalize)

workflow.set_entry_point("research")

# 主流程
workflow.add_edge("research", "outline")
workflow.add_edge("outline", "draft")
workflow.add_edge("draft", "quality_check")

# 条件分支：质量检查后决定是否改进
workflow.add_conditional_edges(
    "quality_check",
    should_improve,
    {
        "improve": "improve",
        "finish": "finalize"
    }
)

# 改进后重新检查
workflow.add_edge("improve", "quality_check")
workflow.add_edge("finalize", END)

# 5. 编译并运行
app = workflow.compile()

result = app.invoke({
    "topic": "使用 LangGraph 构建 AI Agent",
    "target_audience": "Python 开发者",
    "content_type": "tutorial",
    "research_data": "",
    "outline": "",
    "draft": "",
    "feedback": "",
    "final_content": "",
    "quality_score": 0.0,
    "iteration": 0
})

print("=== 最终生成的内容 ===")
print(result["final_content"])
print(f"\n质量评分：{result['quality_score']}")
print(f"迭代次数：{result['iteration']}")
```

### 小结

**LangGraph 核心要点**：
- 🎯 **图状思维**：将复杂流程建模为状态图
- 🔄 **状态管理**：明确定义在节点间传递的数据结构
- 🔀 **条件分支**：使用 conditional_edges 实现复杂逻辑
- 📊 **可视化**：利用 graph.draw_mermaid_png() 可视化流程
- 💾 **检查点**：使用 checkpointer 保存中间状态
- 🛠️ **最佳实践**：保持节点简单、明确状态结构、处理错误

---

## AI应用评估和测试 {#ai应用评估和测试}

### 评估维度

```
AI应用评估框架：

1. 准确性（Accuracy）
   - 答案正确率
   - 事实一致性
   - 计算准确性

2. 相关性（Relevance）
   - 回答是否切题
   - 是否满足用户需求
   - 信息完整度

3. 质量（Quality）
   - 语言流畅度
   - 逻辑连贯性
   - 可读性

4. 安全性（Safety）
   - 有害内容过滤
   - 偏见检测
   - 隐私保护

5. 性能（Performance）
   - 响应时间
   - 吞吐量
   - 资源消耗

6. 成本（Cost）
   - Token消耗
   - API费用
   - 基础设施成本
```

### RAG评估框架

**使用Ragas**：

```bash
pip install ragas
```

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_relevancy,
    context_recall
)
from datasets import Dataset

# 准备测试数据
test_data = {
    "question": [
        "什么是Python装饰器？",
        "如何使用FastAPI？"
    ],
    "answer": [
        "装饰器是Python的一种设计模式...",
        "使用FastAPI需要先安装..."
    ],
    "contexts": [
        ["Python装饰器是一种...", "装饰器可以用来..."],
        ["FastAPI是现代Web框架...", "安装命令是..."]
    ],
    "ground_truth": [
        "装饰器是一种修改函数行为的工具",
        "需要使用pip install fastapi安装"
    ]
}

dataset = Dataset.from_dict(test_data)

# 评估
result = evaluate(
    dataset=dataset,
    metrics=[
        faithfulness,       # 忠实度
        answer_relevancy,   # 答案相关性
        context_relevancy,  # 上下文相关性
        context_recall      # 上下文召回率
    ]
)

# 查看结果
print(result)
# Output:
# {'faithfulness': 0.85, 'answer_relevancy': 0.92, ...}

# 转换为DataFrame
df = result.to_pandas()
print(df)
```

### 自定义评估

```python
class RAGEvaluator:
    """RAG系统评估器"""

    def __init__(self, rag_system, test_questions: list):
        self.rag = rag_system
        self.test_questions = test_questions
        self.llm = ChatOpenAI(model="gpt-3.5-turbo")

    def evaluate_accuracy(self, question: str, ground_truth: str) -> float:
        """评估准确性"""
        response = self.rag.ask(question)
        answer = response["answer"]

        # 使用LLM评分
        prompt = f"""
        请评估以下答案的质量（0-10分）：

        问题：{question}
        标准答案：{ground_truth}
        实际答案：{answer}

        评分标准：
        - 准确性：是否与标准答案一致
        - 完整性：是否包含所有关键信息
        - 正确性：是否有错误信息

        只返回0-10之间的数字分数。
        """

        score = self.llm.invoke(prompt)
        return float(score.content) / 10

    def evaluate_retrieval(self, question: str, top_k: int = 3) -> dict:
        """评估检索质量"""
        docs = self.rag.vectorstore.similarity_search(question, k=top_k)

        return {
            "retrieved_count": len(docs),
            "avg_relevance": self._avg_relevance(question, docs)
        }

    def _avg_relevance(self, question: str, docs: list) -> float:
        """计算平均相关性"""
        scores = []
        for doc in docs:
            prompt = f"""
            评估文档与问题的相关性（0-1）：

            问题：{question}
            文档：{doc.page_content[:200]}

            只返回0-1之间的数字。
            """
            score = self.llm.invoke(prompt)
            scores.append(float(score.content))

        return sum(scores) / len(scores)

    def run_evaluation(self) -> dict:
        """运行完整评估"""
        results = {
            "total_questions": len(self.test_questions),
            "evaluated": 0,
            "avg_accuracy": 0,
            "avg_retrieval_relevance": 0
        }

        accuracy_scores = []
        relevance_scores = []

        for item in self.test_questions:
            acc = self.evaluate_accuracy(
                item["question"],
                item["ground_truth"]
            )
            acc_score = acc

            ret = self.evaluate_retrieval(item["question"])
            rel_score = ret["avg_relevance"]

            accuracy_scores.append(acc_score)
            relevance_scores.append(rel_score)

            results["evaluated"] += 1

        results["avg_accuracy"] = sum(accuracy_scores) / len(accuracy_scores)
        results["avg_retrieval_relevance"] = sum(relevance_scores) / len(relevance_scores)

        return results

# 使用
evaluator = RAGEvaluator(rag_system, [
    {
        "question": "什么是Python装饰器？",
        "ground_truth": "装饰器是一种修改函数行为的工具"
    },
    # ... 更多测试数据
])

results = evaluator.run_evaluation()
print(results)
# {'total_questions': 10, 'avg_accuracy': 0.85, 'avg_retrieval_relevance': 0.78}
```

### A/B测试

```python
def ab_test(model_a, model_b, test_cases: list):
    """A/B测试两个模型"""

    results_a = []
    results_b = []

    for case in test_cases:
        response_a = model_a.invoke(case["input"])
        response_b = model_b.invoke(case["input"])

        # 评估
        score_a = evaluate_response(response_a, case)
        score_b = evaluate_response(response_b, case)

        results_a.append(score_a)
        results_b.append(score_b)

    # 统计
    avg_a = sum(results_a) / len(results_a)
    avg_b = sum(results_b) / len(results_b)

    return {
        "model_a_avg": avg_a,
        "model_b_avg": avg_b,
        "winner": "A" if avg_a > avg_b else "B"
    }
```

### 性能测试

```python
import time
from statistics import mean

def performance_test(rag_system, test_questions: list):
    """性能测试"""

    latencies = []
    token_counts = []

    for question in test_questions:
        start = time.time()

        response = rag_system.ask(question)

        end = time.time()
        latency = end - start

        latencies.append(latency)
        # 假设你有方法获取token数
        # token_counts.append(get_token_count(response))

    return {
        "avg_latency": mean(latencies),
        "p95_latency": sorted(latencies)[int(len(latencies) * 0.95)],
        "p99_latency": sorted(latencies)[int(len(latencies) * 0.99)],
        "min_latency": min(latencies),
        "max_latency": max(latencies)
    }

# 使用
perf_results = performance_test(rag_system, test_questions)
print(f"平均延迟：{perf_results['avg_latency']:.2f}秒")
print(f"P95延迟：{perf_results['p95_latency']:.2f}秒")
```

---

## 最佳实践总结

### 模型选择清单

```
✓ 明确需求
  - 任务类型（对话/分析/代码）
  - 上下文长度
  - 实时性要求
  - 预算限制

✓ 评估选项
  - 闭源 vs 开源
  - API vs 本地部署
  - 性能 vs 成本

✓ 测试验证
  - A/B测试
  - 评估指标
  - 用户反馈
```

### 优化技巧

```python
# 1. 提示词优化
- 清晰具体
- 提供示例
- 角色设定

# 2. 检索优化
- 调整chunk_size
- 使用混合检索
- 实施重排序

# 3. 成本优化
- 使用缓存
- 批量处理
- 选择合适模型

# 4. 性能优化
- 异步调用
- 流式输出
- 连接池
```

### 安全建议

```
✓ API密钥管理
  - 使用环境变量
  - 定期轮换
  - 访问控制

✓ 内容过滤
  - 输入验证
  - 输出审核
  - 敏感信息检测

✓ 速率限制
  - 防止滥用
  - 控制成本
  - 保护服务
```

---

## 本章小结

### 核心内容

✅ **LLM模型选择**：
- 主流模型对比
- 场景化选择策略
- 成本性能权衡

✅ **Claude API**：
- 长文本处理优势
- 多模态能力
- LangChain集成

✅ **开源模型**：
- Ollama本地部署
- 成本优势
- 隐私保护

✅ **MCP协议**：
- 统一数据接口
- 即插即用
- 生态共享

✅ **LangGraph**：
- 复杂Agent构建
- 状态图管理
- 可视化工作流

✅ **评估测试**：
- Ragas框架
- 自定义评估
- A/B测试

### 进阶学习路径

```
当前阶段：AI应用开发 ✅
    ↓
进阶方向：
  ├── 多模态AI（图像、音频、视频）
  ├── 模型微调（LoRA、QLoRA）
  ├── 生产部署（Kubernetes、监控）
  ├── AI安全（对抗攻击、防御）
  └── 前沿研究（最新论文、技术）
```

---

## 练习题

### 练习1：模型对比

选择同一个任务（如RAG问答），使用GPT-3.5、Claude Sonnet、Llama 3分别实现，对比效果和成本。

### 练习2：构建MCP Server

创建一个自定义的MCP Server，集成你的数据源。

### 练习3：LangGraph项目

使用LangGraph实现一个复杂的客服系统，包含FAQ、投诉、技术支持等分支。

### 练习4：评估框架

为你的RAG系统建立完整的评估体系，包含准确性、性能、成本等维度。

---

**恭喜完成AI应用开发完全指南！** 🎉

从基础到进阶，你已经掌握了构建现代AI应用的全套技能。

**继续保持学习，探索AI的无限可能！** 🚀
