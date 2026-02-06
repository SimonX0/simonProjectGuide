---
title: AI模型基础面试题
---

# AI模型基础面试题

## 模型架构

### Transformer的核心原理是什么？

Transformer是基于自注意力机制的架构，主要包含：

**核心组件**：

1. **自注意力机制**：计算序列中每个位置与其他所有位置的相关性
2. **多头注意力**：并行计算多个注意力表示
3. **位置编码**：注入序列位置信息
4. **前馈网络**：非线性变换

```python
# 自注意力计算
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(query, key, value, mask=None):
    """缩放点积注意力"""
    d_k = query.size(-1)

    # 计算注意力分数
    scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)

    # 应用mask（可选）
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)

    # Softmax归一化
    attention_weights = F.softmax(scores, dim=-1)

    # 加权求和
    output = torch.matmul(attention_weights, value)

    return output, attention_weights
```

### 什么是GPT和BERT的区别？

| 特性 | GPT | BERT |
|------|-----|------|
| 架构 | Decoder-only | Encoder-only |
| 注意力 | 因果注意力（单向） | 双向注意力 |
| 训练方式 | 自回归（预测下一个token） | 掩码语言模型 |
| 适用任务 | 文本生成 | 文本理解 |
| 代表模型 | GPT-3, GPT-4 | BERT, RoBERTa |

```python
# GPT风格 - 因果注意力
def causal_attention_mask(seq_len):
    """创建因果mask，只能看到之前的信息"""
    mask = torch.tril(torch.ones(seq_len, seq_len))
    return mask

# BERT风格 - 双向注意力
def bidirectional_attention(seq_len):
    """可以看到所有位置的信息"""
    return torch.ones(seq_len, seq_len)
```

### 什么是位置编码？

位置编码让模型知道token在序列中的位置。

```python
import math
import torch

def positional_encoding(max_seq_len, d_model):
    """正弦位置编码"""
    position = torch.arange(max_seq_len).unsqueeze(1)
    div_term = torch.exp(
        torch.arange(0, d_model, 2) * -(math.log(10000.0) / d_model)
    )

    pe = torch.zeros(max_seq_len, d_model)
    pe[:, 0::2] = torch.sin(position * div_term)
    pe[:, 1::2] = torch.cos(position * div_term)

    return pe
```

**为什么用正弦函数**：
- 能够处理训练时未见过的序列长度
- 不同频率编码不同尺度位置关系
- 相对位置信息可学习

## 模型选择

### 如何选择合适的LLM？

**选择标准**：

1. **任务类型**：
   - 文本生成：GPT系列、LLaMA
   - 文本理解：BERT、RoBERTa
   - 多模态：GPT-4V、CLIP

2. **资源限制**：
   - 云端大模型：GPT-4、Claude
   - 本地部署：LLaMA、Mistral
   - 边缘设备：DistilBERT、TinyLlama

3. **性能要求**：
   - 高质量：GPT-4、Claude 3
   - 平衡：GPT-3.5、LLaMA 2 70B
   - 速度优先：7B参数模型

4. **成本考虑**：
   - 免费开源：LLaMA、Mistral
   - API调用：按token计费
   - 自托管：硬件成本

### 主要开源模型有哪些？

**7B级别**：
```python
# 轻量级，适合本地部署
models = {
    "LLaMA 2 7B": {
        "优点": ["性能优秀", "社区活跃", "易于部署"],
        "场景": "聊天、文本生成"
    },
    "Mistral 7B": {
        "优点": ["性能超越LLaMA 2 7B", "滑动窗口注意力"],
        "场景": "通用任务"
    },
    "Qwen 7B": {
        "优点": ["中文优秀", "数学能力强"],
        "场景": "中文应用"
    }
}
```

**70B级别**：
```python
# 高性能，需要强大硬件
models = {
    "LLaMA 2 70B": {
        "优点": ["接近GPT-3.5性能", "开源"],
        "硬件": "需要多GPU"
    },
    "Falcon 180B": {
        "优点": ["当时最强开源模型"],
        "硬件": "需要高端硬件"
    }
}
```

### 量化技术是什么？

量化减少模型参数的精度以降低内存和计算成本。

```python
import torch
from transformers import BitsAndBytesConfig

# 8位量化
quantization_config = BitsAndBytesConfig(
    load_in_8bit=True,
    llm_int8_threshold=6.0
)

# 4位量化
quantization_config_4bit = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",  # NormalFloat 4
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True
)

# 加载量化模型
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b",
    quantization_config=quantization_config_4bit,
    device_map="auto"
)
```

**量化效果**：
- FP16 → 8bit：内存减少50%
- FP16 → 4bit：内存减少75%
- 精度损失：通常在1-2%以内

## Fine-tuning

### 什么是Fine-tuning？

Fine-tuning是在预训练模型基础上，用特定任务数据继续训练。

```python
from transformers import AutoModelForCausalLM, TrainingArguments, Trainer
from datasets import load_dataset

# 1. 加载预训练模型
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b")

# 2. 准备数据集
dataset = load_dataset("csv", data_files="training_data.csv")

# 3. 训练参数
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-5,
    warmup_steps=100,
    logging_steps=10,
    save_steps=100
)

# 4. 训练
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
)

trainer.train()
```

### 什么是LoRA？

LoRA（Low-Rank Adaptation）是一种参数高效的微调方法。

```python
from peft import LoraConfig, get_peft_model, TaskType

# LoRA配置
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,  # 任务类型
    inference_mode=False,
    r=8,  # LoRA秩，越小参数越少
    lora_alpha=32,  # LoRA缩放参数
    lora_dropout=0.1,
    target_modules=["q_proj", "v_proj"]  # 要应用LoRA的模块
)

# 应用LoRA
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# 输出类似：
# trainable params: 4194304 || all params: 673841152 || trainable%: 0.62%
```

**LoRA优势**：
- 只训练0.5-2%的参数
- 大幅减少显存需求
- 可以与基础模型分离存储

### 什么是QLoRA？

QLoRA结合量化和LoRA，进一步降低微调成本。

```python
from peft import LoraConfig, get_peft_model
from transformers import BitsAndBytesConfig

# 4位量化配置
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True
)

# 加载量化模型
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b",
    quantization_config=bnb_config,
    device_map="auto"
)

# 应用LoRA
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)

model = get_peft_model(model, lora_config)
```

**QLoRA效果**：
- 在单张24GB显卡上微调70B模型
- 性能接近全量微调

## 提示工程

### 什么是Prompt Template？

```python
from langchain.prompts import (
    PromptTemplate,
    ChatPromptTemplate,
    FewShotPromptTemplate
)

# 基础提示模板
template = "请解释一下{topic}，用{style}的风格。"
prompt = PromptTemplate(
    template=template,
    input_variables=["topic", "style"]
)

# 聊天提示模板
chat_template = ChatPromptTemplate.from_messages([
    ("system", "你是一个专业的{role}。"),
    ("human", "{user_input}"),
])

# Few-shot模板
examples = [
    {"input": "开心", "output": "😊"},
    {"input": "难过", "output": "😢"}
]

few_shot_prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=PromptTemplate(
        input_variables=["input", "output"],
        template="输入: {input}\n输出: {output}"
    ),
    prefix="以下是一些情感映射的例子：",
    suffix="输入: {input}\n输出:",
    input_variables=["input"]
)
```

### 什么是System Prompt vs User Prompt？

```python
messages = [
    {
        "role": "system",
        "content": "你是一个Python编程专家，擅长解释代码。"
    },
    {
        "role": "user",
        "content": "解释一下装饰器是什么"
    },
    {
        "role": "assistant",
        "content": "装饰器是..."
    },
    {
        "role": "user",
        "content": "给我一个例子"
    }
]
```

- **System Prompt**：设定角色和规则
- **User Prompt**：用户的具体问题
- **Assistant Prompt**：历史回复（多轮对话）

### 如何优化Prompt？

**优化技巧**：

1. **明确指令**：
```python
# ❌ 模糊
prompt = "写个函数"

# ✅ 明确
prompt = """
请用Python写一个函数，实现快速排序算法。
要求：
1. 包含详细注释
2. 处理边界情况
3. 包含测试用例
"""
```

2. **提供示例**：
```python
prompt = """
任务：将自然语言转换为SQL

示例1：
输入：查询所有年龄大于30的用户
输出：SELECT * FROM users WHERE age > 30

示例2：
输入：统计每个部门的员工数
输出：SELECT department, COUNT(*) FROM employees GROUP BY department

输入：查询销售额前10的产品
输出：
"""
```

3. **思维链**：
```python
prompt = """
问题：一个农场有鸡和兔共100只，腿共320条，鸡兔各多少？

让我们一步步思考：
1. 设鸡有x只，兔有y只
2. 根据题意：x + y = 100
3. 腿数方程：2x + 4y = 320
4. 解方程组...

答案：
"""
```

4. **角色设定**：
```python
prompt = """
你是一位有10年经验的算法工程师。
请从以下角度分析这段代码的时间复杂度：
1. 算法逻辑
2. 循环嵌套
3. 数据结构影响
"""
```

## 评估指标

### 如何评估生成质量？

**常用指标**：

```python
# BLEU分数（机器翻译）
from nltk.translate.bleu_score import sentence_bleu

reference = [["the", "cat", "is", "on", "the", "mat"]]
candidate = ["the", "cat", "is", "on", "mat"]

score = sentence_bleu(reference, candidate)
print(f"BLEU: {score}")

# ROUGE分数（文本摘要）
from rouge import Rouge

rouge = Rouge()
scores = rouge.get_scores(
    "the cat is on the mat",
    "the cat sat on the mat"
)

print(f"ROUGE-1: {scores[0]['rouge-1']['f']}")

# Perplexity（困惑度）
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("gpt2")
tokenizer = AutoTokenizer.from_pretrained("gpt2")

text = "The quick brown fox"
inputs = tokenizer(text, return_tensors="pt")

with torch.no_grad():
    outputs = model(**inputs, labels=inputs["input_ids"])
    perplexity = torch.exp(outputs.loss)

print(f"Perplexity: {perplexity.item()}")
```

### 如何评估RAG系统？

```python
from ragas import evaluate
from datasets import Dataset

# 准备评估数据
eval_data = {
    "question": [
        "什么是机器学习？",
        "Python中如何处理异常？"
    ],
    "answer": [
        "机器学习是...",
        "使用try-except语句..."
    ],
    "contexts": [
        ["机器学习是人工智能的分支..."],
        ["Python异常处理使用try-except..."]
    ],
    "ground_truth": [
        "机器学习使计算机能够从数据中学习",
        "try-except语句用于捕获和处理异常"
    ]
}

dataset = Dataset.from_dict(eval_data)

# 评估
result = evaluate(dataset)

print(result)
# 输出：
# {'faithfulness': 0.85, 'answer_relevancy': 0.82}
```

**关键指标**：
- **Faithfulness**：答案是否基于检索的上下文
- **Answer Relevancy**：答案是否与问题相关
- **Context Precision**：检索的上下文是否相关

## 模型部署

### 如何使用vLLM加速推理？

```python
from vllm import LLM, SamplingParams

# 初始化模型
llm = LLM(
    model="meta-llama/Llama-2-7b",
    tensor_parallel_size=2,  # GPU数量
    gpu_memory_utilization=0.9,
    max_model_len=4096
)

# 生成参数
sampling_params = SamplingParams(
    temperature=0.8,
    top_p=0.95,
    max_tokens=1000
)

# 批量生成
prompts = [
    "写一首关于春天的诗",
    "解释什么是量子计算"
]

outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(output.outputs[0].text)
```

### 如何使用Text Generation Inference (TGI)？

```bash
# 启动TGI服务
model=meta-llama/Llama-2-7b
volume=$PWD/data # share a volume with the Docker container to avoid downloading weights every run

docker run --gpus all --shm-size 1g -p 8080:80 \
  -v $volume:/data \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id $model
```

```python
# Python客户端
import requests

API_URL = "http://localhost:8080/generate"

def query(payload):
    response = requests.post(API_URL, json=payload)
    return response.json()

output = query({
    "inputs": "解释什么是机器学习",
    "parameters": {
        "max_new_tokens": 200,
        "temperature": 0.7
    }
})

print(output[0]["generated_text"])
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
