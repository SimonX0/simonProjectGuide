---
title: AI系统架构面试题
---

# AI系统架构面试题

## 系统设计

### 如何设计企业级RAG系统？

```python
# 架构设计
"""
┌─────────────────────────────────────────────────────┐
│                  企业级RAG架构                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────┐      ┌────────────┐                │
│  │   文档层    │      │   API层     │                │
│  │ - PDF      │      │ - REST      │                │
│  │ - Word     │      │ - GraphQL   │                │
│  │ - Web      │      │ - WebSocket │                │
│  └────────────┘      └────────────┘                │
│         ↓                      ↓                     │
│  ┌────────────┐      ┌────────────┐                │
│  │  处理层     │      │  应用层     │                │
│  │ - 解析     │      │ - 路由      │                │
│  │ - 分割     │      │ - 认证      │                │
│  │ - 向量化   │      │ - 限流      │                │
│  └────────────┘      └────────────┘                │
│         ↓                      ↓                     │
│  ┌────────────────────────────────┐                 │
│  │         向量数据库层            │                 │
│  │  - Pinecone / Milvus / Qdrant  │                 │
│  └────────────────────────────────┘                 │
│                      ↓                               │
│  ┌────────────────────────────────┐                 │
│  │          LLM服务层              │                 │
│  │  - GPT-4 / Claude / LLaMA      │                 │
│  └────────────────────────────────┘                 │
│                                                      │
│  ┌────────────────────────────────┐                 │
│  │          缓存层                 │                 │
│  │  - Redis (语义缓存)             │                 │
│  └────────────────────────────────┘                 │
└─────────────────────────────────────────────────────┘
"""

# 代码实现
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import redis
from langchain.vectorstores import Pinecone
from langchain.llms import OpenAI
import json

app = FastAPI()

# 缓存层
redis_client = redis.Redis(host='localhost', port=6379, db=0)

class QueryRequest(BaseModel):
    query: str
    use_cache: bool = True

@app.post("/query")
async def query_rag(request: QueryRequest):
    """RAG查询接口"""

    # 1. 检查缓存
    if request.use_cache:
        cached_result = get_from_cache(request.query)
        if cached_result:
            return {"answer": cached_result, "source": "cache"}

    # 2. 检索
    docs = vectorstore.similarity_search(request.query, k=5)

    # 3. 生成
    context = "\n".join([doc.page_content for doc in docs])
    answer = llm.predict(
        f"基于上下文：{context}\n问题：{request.query}"
    )

    # 4. 保存缓存
    save_to_cache(request.query, answer)

    return {
        "answer": answer,
        "source": "llm",
        "documents": [doc.metadata for doc in docs]
    }

def get_from_cache(query: str) -> str:
    """语义缓存"""
    # 使用向量相似度查找缓存
    cache_key = f"cache:{hash(query)}"
    cached = redis_client.get(cache_key)
    return json.loads(cached) if cached else None

def save_to_cache(query: str, answer: str):
    """保存到缓存"""
    cache_key = f"cache:{hash(query)}"
    redis_client.setex(
        cache_key,
        3600,  # 1小时过期
        json.dumps(answer)
    )
```

### 如何设计多租户AI系统？

```python
from fastapi import FastAPI, Header, HTTPException
from typing import Optional
import uuid

app = FastAPI()

# 租户配置
TENANT_CONFIGS = {
    "tenant_a": {
        "llm_model": "gpt-4",
        "vector_store": "pinecone_tenant_a",
        "rate_limit": 1000,
        "max_tokens": 4000
    },
    "tenant_b": {
        "llm_model": "gpt-3.5-turbo",
        "vector_store": "pinecone_tenant_b",
        "rate_limit": 500,
        "max_tokens": 2000
    }
}

# 租户管理器
class TenantManager:
    def __init__(self):
        self.tenants = TENANT_CONFIGS

    def get_tenant_config(self, tenant_id: str):
        """获取租户配置"""
        if tenant_id not in self.tenants:
            raise HTTPException(404, "Tenant not found")
        return self.tenants[tenant_id]

    def check_rate_limit(self, tenant_id: str):
        """检查速率限制"""
        config = self.get_tenant_config(tenant_id)
        # 实际实现使用Redis计数
        return True

tenant_manager = TenantManager()

@app.post("/tenant/{tenant_id}/query")
async def tenant_query(
    tenant_id: str,
    query: str,
    api_key: str = Header(...)
):
    """租户专属查询接口"""

    # 1. 验证租户
    config = tenant_manager.get_tenant_config(tenant_id)

    # 2. 检查速率限制
    if not tenant_manager.check_rate_limit(tenant_id):
        raise HTTPException(429, "Rate limit exceeded")

    # 3. 使用租户专属配置
    llm = OpenAI(model=config["llm_model"])
    vectorstore = get_vector_store(config["vector_store"])

    # 4. 执行查询
    docs = vectorstore.similarity_search(query, k=5)
    answer = llm.predict(f"基于：{docs} \n问题：{query}")

    return {
        "tenant_id": tenant_id,
        "answer": answer,
        "model": config["llm_model"]
    }
```

### 如何实现高可用架构？

```python
import asyncio
from typing import List
from retry import retry

class HighAvailabilityLLM:
    """高可用LLM服务"""

    def __init__(self, providers: List[str]):
        self.providers = providers
        self.current_index = 0

    @retry(exceptions=Exception, tries=3, delay=1)
    async def generate(self, prompt: str, provider: str = None):
        """生成文本，自动故障转移"""

        if provider:
            # 使用指定provider
            return await self._call_provider(provider, prompt)

        # 自动故障转移
        for i in range(len(self.providers)):
            provider = self.providers[i]
            try:
                return await self._call_provider(provider, prompt)
            except Exception as e:
                print(f"Provider {provider} failed: {e}")
                continue

        raise Exception("All providers failed")

    async def _call_provider(self, provider: str, prompt: str):
        """调用特定provider"""
        if provider == "openai":
            return await self._call_openai(prompt)
        elif provider == "anthropic":
            return await self._call_anthropic(prompt)
        elif provider == "local":
            return await self._call_local(prompt)

    async def _call_openai(self, prompt: str):
        """调用OpenAI"""
        # 实际调用逻辑
        pass

    async def _call_anthropic(self, prompt: str):
        """调用Anthropic"""
        pass

    async def _call_local(self, prompt: str):
        """调用本地模型"""
        pass

# 使用
ha_llm = HighAvailabilityLLM([
    "openai",
    "anthropic",
    "local"
])

result = await ha_llm.generate("解释什么是机器学习")
```

## 性能优化

### 如何优化推理速度？

```python
import time
from functools import wraps
from concurrent.futures import ThreadPoolExecutor

# 1. 批处理
class BatchInference:
    def __init__(self, batch_size=8, timeout=0.1):
        self.batch_size = batch_size
        self.timeout = timeout
        self.queue = []
        self.executor = ThreadPoolExecutor(max_workers=4)

    async def process(self, text: str):
        """添加到批处理队列"""
        future = self.executor.submit(self._batch_process, text)
        return await asyncio.wrap_future(future)

    def _batch_process(self, text: str):
        """批处理逻辑"""
        # 等待收集批次
        time.sleep(self.timeout)

        # 批量推理
        batch = [text]  # 实际应该是多个
        results = self._inference_batch(batch)

        return results[0]

    def _inference_batch(self, batch: List[str]):
        """批量推理"""
        # 实际推理逻辑
        pass

# 2. 缓存策略
from functools import lru_cache
import hashlib

class SmartCache:
    def __init__(self, llm):
        self.llm = llm
        self.cache = {}

    def generate(self, prompt: str, use_cache=True):
        """带缓存的生成"""

        if use_cache:
            # 生成缓存键
            cache_key = hashlib.md5(
                prompt.encode()
            ).hexdigest()

            # 检查缓存
            if cache_key in self.cache:
                return self.cache[cache_key]

        # 生成
        result = self.llm(prompt)

        # 保存缓存
        if use_cache:
            self.cache[cache_key] = result

        return result

# 3. 流式输出
async def stream_generate(llm, prompt: str):
    """流式生成"""
    async for chunk in llm.stream(prompt):
        yield chunk

# 使用
async for chunk in stream_generate(llm, "讲个故事"):
    print(chunk, end="")
```

### 如何处理并发请求？

```python
from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool
import asyncio
from queue import Queue
from threading import Lock

app = FastAPI()

class RequestQueue:
    """请求队列管理器"""

    def __init__(self, max_concurrent=10):
        self.max_concurrent = max_concurrent
        self.queue = Queue()
        self.active = 0
        self.lock = Lock()

    async def process(self, func, *args, **kwargs):
        """在队列中处理请求"""

        # 等待可用槽位
        while self.active >= self.max_concurrent:
            await asyncio.sleep(0.1)

        # 增加活跃计数
        with self.lock:
            self.active += 1

        try:
            # 执行
            result = await run_in_threadpool(func, *args, **kwargs)
            return result
        finally:
            # 减少活跃计数
            with self.lock:
                self.active -= 1

request_queue = RequestQueue(max_concurrent=10)

@app.post("/generate")
async def generate(prompt: str):
    """带队列的生成接口"""

    def generate_sync(prompt):
        # 同步生成逻辑
        return llm.generate(prompt)

    result = await request_queue.process(generate_sync, prompt)
    return {"result": result}
```

### 如何监控性能？

```python
from prometheus_client import Counter, Histogram, Gauge
import time

# 定义指标
request_counter = Counter(
    'llm_requests_total',
    'Total requests',
    ['model', 'status']
)

request_duration = Histogram(
    'llm_request_duration_seconds',
    'Request duration',
    ['model']
)

active_requests = Gauge(
    'llm_active_requests',
    'Active requests'
)

# 中间件
@app.middleware("http")
async def monitor_middleware(request, call_next):
    """监控中间件"""

    # 记录开始
    start_time = time.time()
    active_requests.inc()

    # 处理请求
    try:
        response = await call_next(request)
        status = "success"
    except Exception as e:
        status = "error"
        raise
    finally:
        # 记录指标
        duration = time.time() - start_time

        request_counter.labels(
            model="gpt-4",
            status=status
        ).inc()

        request_duration.labels(
            model="gpt-4"
        ).observe(duration)

        active_requests.dec()

    return response

# 自定义监控
class LLMMonitor:
    def __init__(self, llm):
        self.llm = llm
        self.metrics = {
            "total_requests": 0,
            "total_tokens": 0,
            "total_duration": 0,
            "errors": 0
        }

    def generate(self, prompt: str):
        """带监控的生成"""

        start = time.time()
        self.metrics["total_requests"] += 1

        try:
            result = self.llm.generate(prompt)

            # 记录token使用
            self.metrics["total_tokens"] += result.token_count

            return result
        except Exception as e:
            self.metrics["errors"] += 1
            raise
        finally:
            duration = time.time() - start
            self.metrics["total_duration"] += duration

    def get_metrics(self):
        """获取指标"""
        return {
            **self.metrics,
            "avg_duration": (
                self.metrics["total_duration"] /
                self.metrics["total_requests"]
            ),
            "error_rate": (
                self.metrics["errors"] /
                self.metrics["total_requests"]
            )
        }
```

## 安全与合规

### 如何实现API安全？

```python
from fastapi import Header, HTTPException
import jwt
from cryptography.fernet import Fernet

# 1. API密钥管理
class APIKeyManager:
    def __init__(self, secret_key: str):
        self.cipher = Fernet(secret_key)

    def generate_key(self, user_id: str) -> str:
        """生成API密钥"""
        key_data = f"{user_id}:{time.time()}"
        return self.cipher.encrypt(key_data.encode()).decode()

    def validate_key(self, api_key: str) -> bool:
        """验证API密钥"""
        try:
            decrypted = self.cipher.decrypt(api_key.encode()).decode()
            user_id, timestamp = decrypted.split(":")
            return True
        except:
            return False

# 2. JWT认证
def create_jwt_token(user_id: str, secret: str) -> str:
    """创建JWT令牌"""
    payload = {
        "user_id": user_id,
        "exp": time.time() + 3600  # 1小时过期
    }
    return jwt.encode(payload, secret, algorithm="HS256")

def verify_jwt_token(token: str, secret: str) -> dict:
    """验证JWT令牌"""
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# 3. 内容过滤
class ContentFilter:
    def __init__(self):
        self.forbidden_words = ["暴力", "色情", "非法"]

    def filter_input(self, text: str) -> bool:
        """过滤输入内容"""
        for word in self.forbidden_words:
            if word in text:
                return False
        return True

    def filter_output(self, text: str) -> str:
        """过滤输出内容"""
        for word in self.forbidden_words:
            text = text.replace(word, "***")
        return text

# 使用
@app.post("/secure-query")
async def secure_query(
    query: str,
    authorization: str = Header(...)
):
    # 1. 验证JWT
    token = authorization.split(" ")[1]
    payload = verify_jwt_token(token, SECRET_KEY)

    # 2. 内容过滤
    if not content_filter.filter_input(query):
        raise HTTPException(400, "Inappropriate content")

    # 3. 执行查询
    result = llm.generate(query)

    # 4. 过滤输出
    result = content_filter.filter_output(result)

    return {"result": result}
```

### 如何保护敏感数据？

```python
# 1. PIIRedaction（隐私信息脱敏）
import re

class PIIRedactor:
    def __init__(self):
        # 邮箱、电话、身份证等正则
        self.patterns = {
            "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            "phone": r'\b\d{3}-\d{3}-\d{4}\b',
            "ssn": r'\b\d{3}-\d{2}-\d{4}\b',
            "credit_card": r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'
        }

    def redact(self, text: str) -> tuple:
        """脱敏处理"""
        redacted_text = text
        entities = []

        for entity_type, pattern in self.patterns.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                entities.append({
                    "type": entity_type,
                    "value": match.group(),
                    "start": match.start(),
                    "end": match.end()
                })

                # 替换为占位符
                redacted_text = redacted_text.replace(
                    match.group(),
                    f"[{entity_type.upper()}]"
                )

        return redacted_text, entities

# 2. 安全日志
import logging
from logging.handlers import RotatingFileHandler

class SecureLogger:
    def __init__(self):
        self.logger = logging.getLogger("secure")
        handler = RotatingFileHandler(
            "app.log",
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        self.logger.addHandler(handler)
        self.redactor = PIIRedactor()

    def log(self, level: str, message: str, user_id: str = None):
        """安全日志记录"""

        # 脱敏
        safe_message, entities = self.redactor.redact(message)

        # 记录
        log_entry = {
            "level": level,
            "message": safe_message,
            "user_id": user_id,
            "timestamp": time.time(),
            "pii_entities": entities
        }

        self.logger.log(
            getattr(logging, level),
            str(log_entry)
        )
```

### 如何实现审计日志？

```python
from datetime import datetime

class AuditLogger:
    def __init__(self, db_session):
        self.db = db_session

    def log_query(
        self,
        user_id: str,
        query: str,
        response: str,
        model: str,
        tokens_used: int
    ):
        """记录查询日志"""

        audit_log = {
            "user_id": user_id,
            "query": query,
            "response": response,
            "model": model,
            "tokens_used": tokens_used,
            "timestamp": datetime.utcnow(),
            "ip_address": get_client_ip(),
            "user_agent": get_user_agent()
        }

        # 保存到数据库
        self.db.execute(
            "INSERT INTO audit_logs VALUES (:user_id, :query, ...)",
            **audit_log
        )

    def get_user_activity(self, user_id: str, days: int = 30):
        """获取用户活动记录"""

        logs = self.db.execute(
            """
            SELECT * FROM audit_logs
            WHERE user_id = :user_id
            AND timestamp > datetime('now', '-{} days')
            """.format(days),
            user_id=user_id
        )

        return logs
```

## 成本优化

### 如何降低LLM调用成本？

```python
# 1. 智能路由
class SmartRouter:
    def __init__(self):
        self.models = {
            "gpt-4": {"cost": 0.03, "quality": "high"},
            "gpt-3.5-turbo": {"cost": 0.002, "quality": "medium"},
            "local": {"cost": 0, "quality": "low"}
        }

    def route(self, query: str, complexity: str):
        """根据复杂度路由到不同模型"""

        if complexity == "simple":
            return "gpt-3.5-turbo"
        elif complexity == "complex":
            return "gpt-4"
        else:
            return "local"

# 2. Token优化
def optimize_prompt(prompt: str, max_tokens: int = 2000) -> str:
    """优化prompt长度"""

    # 移除冗余
    prompt = " ".join(prompt.split())

    # 截断
    if len(prompt) > max_tokens * 4:  # 粗略估计
        prompt = prompt[:max_tokens * 4]

    return prompt

# 3. 缓存层
class TokenCache:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.stats = {"cache_hits": 0, "total": 0}

    def get_or_generate(self, key: str, generator, ttl=3600):
        """获取或生成"""

        self.stats["total"] += 1

        # 尝试从缓存获取
        cached = self.redis.get(key)
        if cached:
            self.stats["cache_hits"] += 1
            return cached

        # 生成并缓存
        result = generator()
        self.redis.setex(key, ttl, result)

        return result

    def get_hit_rate(self):
        """获取缓存命中率"""
        if self.stats["total"] == 0:
            return 0
        return self.stats["cache_hits"] / self.stats["total"]
```

## 2024-2026大厂高频AI系统面试题（40+题）

### Function Calling与工具使用

32. **什么是Function Calling？应用场景有哪些？（字节、阿里必问）**
   ```python
   # Function Calling：让LLM能够调用外部函数/工具
   # OpenAI、Anthropic、Claude等都支持

   # 基本示例
   from openai import OpenAI

   client = OpenAI()

   # 1. 定义函数
   functions = [
       {
           "name": "get_weather",
           "description": "获取指定城市的天气",
           "parameters": {
               "type": "object",
               "properties": {
                   "city": {
                       "type": "string",
                       "description": "城市名称，如：北京"
                   },
                   "unit": {
                       "type": "string",
                       "enum": ["celsius", "fahrenheit"],
                       "description": "温度单位"
                   }
               },
               "required": ["city"]
           }
       }
   ]

   # 2. 调用
   response = client.chat.completions.create(
       model="gpt-4",
       messages=[
           {"role": "user", "content": "北京今天天气怎么样？"}
       ],
       functions=functions,
       function_call="auto"  # 自动决定是否调用函数
   )

   # 3. 处理函数调用
   if response.choices[0].message.function_call:
       function_name = response.choices[0].message.function_call.name
       function_args = json.loads(
           response.choices[0].message.function_call.arguments
       )

       # 执行函数
       weather_data = get_weather(
           city=function_args["city"],
           unit=function_args.get("unit", "celsius")
       )

       # 4. 将结果返回给LLM
       second_response = client.chat.completions.create(
           model="gpt-4",
           messages=[
               {"role": "user", "content": "北京今天天气怎么样？"},
               response.choices[0].message,  # 助手要求调用函数的消息
               {
                   "role": "function",
                   "name": function_name,
                   "content": json.dumps(weather_data)
               }
           ]
       )

   # 应用场景：
   # 1. 查询数据库
   # 2. 调用API
   # 3. 执行计算
   # 4. 访问文件系统
   # 5. 发送通知
   ```

33. **如何设计健壮的Function Calling系统？（美团高频）**
   ```python
   class RobustFunctionCalling:
       def __init__(self, llm, functions):
           self.llm = llm
           self.functions = functions
           self.retry_limit = 3

       def call_function(self, function_name, arguments):
           """安全地调用函数"""
           # 1. 参数验证
           schema = self.get_function_schema(function_name)
           if not self.validate_arguments(arguments, schema):
               return {
                   "error": "Invalid arguments",
                   "details": self.get_validation_errors(arguments, schema)
               }

           # 2. 执行函数（带超时）
           import signal

           def timeout_handler(signum, frame):
               raise TimeoutError("Function execution timeout")

           signal.signal(signal.SIGALRM, timeout_handler)
           signal.alarm(10)  # 10秒超时

           try:
               result = self.execute_function(function_name, arguments)
               signal.alarm(0)
               return {"success": True, "result": result}
           except TimeoutError:
               return {"error": "Function execution timeout"}
           except Exception as e:
               return {"error": str(e)}

       def validate_arguments(self, args, schema):
           """验证参数"""
           # 使用JSON Schema验证
           from jsonschema import validate, ValidationError

           try:
               validate(instance=args, schema=schema)
               return True
           except ValidationError as e:
               return False

       def execute_with_retry(self, user_message):
           """带重试的执行流程"""
           for attempt in range(self.retry_limit):
               # 1. LLM决定是否调用函数
               response = self.llm.generate(
                   user_message,
                   functions=self.functions
               )

               # 2. 提取函数调用
               if not response.function_call:
                   return response.content  # 无需调用函数

               # 3. 执行函数
               result = self.call_function(
                   response.function_call.name,
                   response.function_call.arguments
               )

               # 4. 处理错误
               if "error" in result:
                   # 让LLM重试或修正
                   user_message = f"""
                   前面的函数调用失败：{result['error']}
                   请重新尝试或提供解决方案。
                   """
                   continue

               # 5. 将结果返回给LLM
               final_response = self.llm.generate(
                   user_message,
                   function_result=result
               )

               return final_response
   ```

34. **Function Calling vs Tool Use vs MCP？（2025热门概念）**
   ```python
   # 对比：

   # 1. Function Calling（OpenAI风格）
   # - LLM输出结构化的函数调用
   # - 开发者解析并执行
   # - 然后将结果返回LLM

   # 2. Tool Use（Anthropic风格）
   # - 类似Function Calling
   # - 更灵活的工具定义
   # - 支持流式工具调用

   # 3. MCP（Model Context Protocol）
   # - 标准化的工具协议
   # - 允许不同系统共享工具
   # - 更开放和可扩展

   # MCP示例（2025年趋势）
   from mcp import Server, Tool

   # 创建MCP服务器
   server = Server("my-tools")

   @server.tool()
   def search_database(query: str) -> str:
       """搜索数据库"""
       # 实现逻辑
       pass

   @server.tool()
   def send_email(to: str, subject: str, body: str) -> bool:
       """发送邮件"""
       # 实现逻辑
       pass

   # 任何支持MCP的客户端都可以使用这些工具
   ```

### 多模态AI

35. **如何处理多模态输入（文本+图片）？（字节、阿里必问）**
   ```python
   # GPT-4V / Claude 3.5 Sonnet / Gemini Pro Vision

   import base64
   from openai import OpenAI

   def encode_image(image_path):
       """编码图片"""
       with open(image_path, "rb") as image_file:
           return base64.b64encode(image_file.read()).decode('utf-8')

   # 多模态输入
   response = client.chat.completions.create(
       model="gpt-4o",  # 或 "gpt-4-vision-preview"
       messages=[
           {
               "role": "user",
               "content": [
                   {
                       "type": "text",
                       "text": "这张图片里有什么？"
                   },
                   {
                       "type": "image_url",
                       "image_url": {
                           "url": f"data:image/jpeg;base64,{encode_image('photo.jpg')}"
                       }
                   }
               ]
           }
       ]
   )

   # 应用场景：
   # 1. OCR（文字识别）
   # 2. 图片描述生成
   # 3. 图表分析
   # 4. 视觉问答
   # 5. 文档理解（截图+文本）
   ```

36. **如何构建多模态RAG系统？（2025热门）**
   ```python
   from langchain.schema import Document
   from unstructured.partition.pdf import partition_pdf
   from PIL import Image
   import base64

   class MultiModalRAG:
       def __init__(self):
           self.text_vectorstore = Chroma()
           self.image_vectorstore = Chroma()

       def ingest_document(self, pdf_path):
           """处理多模态文档"""
           # 1. 提取文本和图片
           elements = partition_pdf(
               filename=pdf_path,
               extract_images_in_pdf=True,
               infer_table_structure=True
           )

           # 2. 分别处理
           for element in elements:
               if element.category == "Text":
                   # 文本向量化
                   self.text_vectorstore.add_texts(
                       texts=[element.text],
                       metadatas={"type": "text", "source": pdf_path}
                   )

               elif element.category == "Image":
                   # 图片描述生成
                   description = self.describe_image(element.to_image())

                   # 图片向量化（使用描述）
                   self.image_vectorstore.add_texts(
                       texts=[description],
                       metadatas={
                           "type": "image",
                           "source": pdf_path,
                           "image_data": element.to_image()
                       }
                   )

       def describe_image(self, image):
           """生成图片描述"""
           # 使用多模态模型
           response = client.chat.completions.create(
               model="gpt-4o",
               messages=[{
                   "role": "user",
                   "content": [
                       {"type": "text", "text": "描述这张图片"},
                       {
                           "type": "image_url",
                           "image_url": {
                               "url": f"data:image/png;base64,{image}"
                           }
                       }
                   ]
               }]
           )
           return response.choices[0].message.content

       def query(self, query: str):
           """多模态检索"""
           # 1. 文本检索
           text_docs = self.text_vectorstore.similarity_search(query, k=3)

           # 2. 图片检索
           image_docs = self.image_vectorstore.similarity_search(query, k=2)

           # 3. 合并结果
           context = []
           for doc in text_docs:
               context.append(f"文本：{doc.page_content}")

           for doc in image_docs:
               context.append(
                   f"图片：{doc.page_content}\n"
                   f"[图片数据：{doc.metadata['image_data']}]"
               )

           # 4. 生成答案
           return self.llm.generate(
               f"基于以下多模态内容回答：\n{context}\n问题：{query}"
           )
   ```

### AI项目实战

37. **如何搭建企业级智能客服系统？（美团、字节项目题）**
   ```python
   # 架构设计
   """
   ┌──────────────────────────────────────────────┐
   │          智能客服系统架构                      │
   ├──────────────────────────────────────────────┤
   │                                              │
   │  用户 ──► API网关 ──► 意图识别               │
   │                    │                         │
   │                    ↓                         │
   │              ┌─────────────┐                 │
   │              │  路由引擎    │                 │
   │              └─────────────┘                 │
   │                    │                         │
   │         ┌──────────┼──────────┐              │
   │         ↓          ↓          ↓              │
   │    FAQ知识库   RAG系统    工单系统            │
   │    (简单)     (复杂)     (人工)               │
   │                                              │
   └──────────────────────────────────────────────┘
   """

   class IntelligentCustomerService:
       def __init__(self):
           self.faq_bot = FAQBot()
           self.rag_bot = RAGBot()
           self.ticket_system = TicketSystem()
           self.intent_classifier = IntentClassifier()

       def handle_query(self, user_message: str, user_id: str):
           """处理用户查询"""

           # 1. 意图识别
           intent = self.intent_classifier.predict(user_message)

           # 2. 情感分析
           sentiment = self.analyze_sentiment(user_message)

           # 3. 路由到不同系统
           if intent == "faq":
               # 简单FAQ问题
               answer = self.faq_bot.query(user_message)
               return {
                   "type": "faq",
                   "answer": answer,
                   "confidence": answer["score"]
               }

           elif intent == "complex_query":
               # 复杂问题，使用RAG
               answer = self.rag_bot.query(user_message)
               return {
                   "type": "rag",
                   "answer": answer,
                   "sources": answer["sources"]
               }

           elif intent == "complaint" or sentiment == "negative":
               # 投诉或负面情绪，转人工
               ticket_id = self.ticket_system.create_ticket(
                   user_id=user_id,
                   query=user_message,
                   priority="high" if sentiment == "negative" else "normal"
               )
               return {
                   "type": "human",
                   "ticket_id": ticket_id,
                   "message": "已为您转接人工客服，请稍候..."
               }

           else:
               # 默认使用RAG
               return self.rag_bot.query(user_message)

       def analyze_sentiment(self, text: str):
           """情感分析"""
           # 可以用LLM或专门的情感分析模型
           response = self.llm.predict(f"""
           分析以下文本的情感（positive/negative/neutral）：
           {text}

           只返回情感标签。
           """)
           return response.strip().lower()
   ```

38. **如何搭建AI代码助手系统？（阿里、字节项目题）**
   ```python
   class AICodeAssistant:
       def __init__(self):
           self.code_vectorstore = Chroma()
           self.llm = OpenAI(model="gpt-4")

       def index_codebase(self, repo_path: str):
           """索引代码库"""
           import os

           for root, dirs, files in os.walk(repo_path):
               # 跳过不必要的目录
               dirs[:] = [d for d in dirs if d not in [
                   'node_modules', '.git', '__pycache__'
               ]]

               for file in files:
                   if file.endswith(('.py', '.js', '.ts', '.vue')):
                       file_path = os.path.join(root, file)

                       # 读取文件
                       with open(file_path, 'r', encoding='utf-8') as f:
                           content = f.read()

                       # 分块（按函数/类）
                       chunks = self.split_by_functions(content)

                       # 添加到向量库
                       for chunk in chunks:
                           self.code_vectorstore.add_texts(
                               texts=[chunk['code']],
                               metadatas={
                                   'file': file_path,
                                   'type': chunk['type'],
                                   'name': chunk['name'],
                                   'start_line': chunk['start_line']
                               }
                           )

       def split_by_functions(self, code: str):
           """按函数/类分割代码"""
           import re
           chunks = []

           # Python函数/类正则
           pattern = r'^(def|class)\s+(\w+)'

           lines = code.split('\n')
           current_chunk = []
           current_start = 0

           for i, line in enumerate(lines):
               if re.match(pattern, line):
                   if current_chunk:
                       chunks.append({
                           'code': '\n'.join(current_chunk),
                           'type': 'function' if 'def' in current_chunk[0] else 'class',
                           'name': re.match(pattern, current_chunk[0]).group(2),
                           'start_line': current_start
                       })

                   current_chunk = [line]
                   current_start = i
               else:
                   current_chunk.append(line)

           return chunks

       def answer_code_question(self, question: str):
           """回答代码相关问题"""
           # 1. 检索相关代码
           relevant_code = self.code_vectorstore.similarity_search(
               question,
               k=5
           )

           # 2. 构建上下文
           context = ""
           for code in relevant_code:
               context += f"""
               文件：{code.metadata['file']}
               代码：
               {code.page_content}
               ---
               """

           # 3. 生成答案
           prompt = f"""
           你是一个代码助手。基于以下代码库回答问题：

           {context}

           问题：{question}

           请提供详细的答案，包括代码示例。
           """

           answer = self.llm.predict(prompt)

           return {
               "answer": answer,
               "relevant_files": [
                   code.metadata['file'] for code in relevant_code
               ]
           }

       def generate_code(self, requirement: str):
           """生成代码"""
           # 检索相似代码示例
           examples = self.code_vectorstore.similarity_search(
               requirement,
               k=3
           )

           # 构建few-shot prompt
           prompt = f"""
           以下是代码库中的示例：
           {examples}

           请根据这些风格实现：{requirement}
           """

           return self.llm.predict(prompt)
   ```

39. **如何搭建AI内容生成平台？（项目实战题）**
   ```python
   class AIContentPlatform:
       def __init__(self):
           self.llm = OpenAI(model="gpt-4")
           self.moderator = ContentModerator()
           self.style_templates = StyleTemplates()

       def generate_article(
           self,
           topic: str,
           style: str = "professional",
           length: int = 1000,
           keywords: list = None
       ):
           """生成文章"""

           # 1. 构建prompt
           style_guide = self.style_templates.get(style)

           prompt = f"""
           请写一篇关于"{topic}"的文章。

           要求：
           - 风格：{style_guide['tone']}
           - 长度：约{length}字
           - 目标读者：{style_guide['audience']}

           {'关键词：' + ', '.join(keywords) if keywords else ''}

           请包含：
           1. 引人入胜的标题
           2. 清晰的结构
           3. 具体的例子
           4. 总结性结论
           """

           # 2. 生成内容
           article = self.llm.predict(prompt)

           # 3. 内容审核
           moderation_result = self.moderator.check(article)

           if not moderation_result["safe"]:
               return {
                   "error": "内容违规",
                   "details": moderation_result["issues"]
               }

           # 4. SEO优化
           optimized_article = self.optimize_for_seo(
               article,
               keywords or []
           )

           return {
               "article": optimized_article,
               "word_count": len(optimized_article.split()),
               "keywords": keywords or [],
               "suggestions": self.generate_improvement_suggestions(article)
           }

       def optimize_for_seo(self, article: str, keywords: list):
           """SEO优化"""
           # 1. 检查关键词密度
           keyword_density = self.calculate_keyword_density(
               article,
               keywords
           )

           # 2. 生成标题建议
           title_suggestions = self.llm.predict(f"""
           基于以下文章生成3个SEO友好的标题：

           {article[:500]}

           关键词：{', '.join(keywords)}

           标题要求：
           1. 包含主要关键词
           2. 吸引点击
           3. 长度在60字符以内
           """)

           # 3. 生成meta描述
           meta_description = self.llm.predict(f"""
           为这篇文章生成160字符以内的SEO描述：

           {article[:500]}
           """)

           return {
               "content": article,
               "title_suggestions": title_suggestions.split('\n'),
               "meta_description": meta_description,
               "keyword_density": keyword_density
           }
   ```

40. **如何优化AI系统的成本和性能？（阿里、美团必问）**
   ```python
   class CostOptimizer:
       def __init__(self):
           self.models = {
               "gpt-4": {"cost_per_1k": 0.03, "quality": 1.0},
               "gpt-4o-mini": {"cost_per_1k": 0.0015, "quality": 0.85},
               "gpt-3.5-turbo": {"cost_per_1k": 0.002, "quality": 0.75},
               "local-llama": {"cost_per_1k": 0, "quality": 0.6}
           }

       def smart_routing(self, query: str):
           """智能路由到不同模型"""
           # 1. 分析查询复杂度
           complexity = self.estimate_complexity(query)

           # 2. 根据复杂度选择模型
           if complexity < 0.3:
               return "local-llama"  # 简单查询用本地模型
           elif complexity < 0.7:
               return "gpt-4o-mini"  # 中等用mini
           else:
               return "gpt-4"  # 复杂查询用GPT-4

       def estimate_complexity(self, query: str):
           """估计查询复杂度"""
           # 简单方法：基于查询长度和关键词
           simple_keywords = ["是什么", "怎么", "如何", "定义"]
           complex_keywords = ["分析", "比较", "优化", "设计"]

           score = 0.5  # 基础分数

           if any(kw in query for kw in simple_keywords):
               score -= 0.2

           if any(kw in query for kw in complex_keywords):
               score += 0.3

           if len(query) > 200:
               score += 0.1

           return max(0, min(1, score))

       def batch_processing(self, queries: list):
           """批处理优化"""
           # 1. 按复杂度分组
           simple_queries = []
           complex_queries = []

           for query in queries:
               if self.estimate_complexity(query) < 0.5:
                   simple_queries.append(query)
               else:
                   complex_queries.append(query)

           # 2. 批量处理简单查询
           simple_results = self.batch_process(
               simple_queries,
               model="gpt-4o-mini"
           )

           # 3. 单独处理复杂查询
           complex_results = [
               self.process(query, model="gpt-4")
               for query in complex_queries
           ]

           # 4. 合并结果
           return {**simple_results, **complex_results}

       def cache_optimization(self, queries: list):
           """缓存优化"""
           # 1. 检查缓存
           cache_hits = {}
           cache_misses = []

           for query in queries:
               cached = self.redis.get(f"cache:{hash(query)}")
               if cached:
                   cache_hits[query] = cached
               else:
                   cache_misses.append(query)

           # 2. 只处理未缓存的
           fresh_results = self.batch_processing(cache_misses)

           # 3. 保存到缓存
           for query, result in fresh_results.items():
               self.redis.setex(
                   f"cache:{hash(query)}",
                   3600,
                   result
               )

           # 4. 合并结果
           return {**cache_hits, **fresh_results}

       def monitor_costs(self):
           """成本监控"""
           import time
           from collections import defaultdict

           self.cost_tracker = defaultdict(lambda: {
               "requests": 0,
               "tokens": 0,
               "cost": 0
           })

       def track_usage(self, model: str, tokens: int):
           """记录使用情况"""
           self.cost_tracker[model]["requests"] += 1
           self.cost_tracker[model]["tokens"] += tokens
           self.cost_tracker[model]["cost"] += (
               tokens / 1000 * self.models[model]["cost_per_1k"]
           )

       def get_cost_report(self):
           """获取成本报告"""
           total_cost = sum(
               metrics["cost"]
               for metrics in self.cost_tracker.values()
           )

           return {
               "total_cost": total_cost,
               "by_model": dict(self.cost_tracker),
               "suggestions": self.generate_cost_suggestions()
           }

       def generate_cost_suggestions(self):
           """生成成本优化建议"""
           suggestions = []

           # 分析使用模式
           for model, metrics in self.cost_tracker.items():
               if metrics["cost"] > 100:  # 某个模型花费超过$100
                   suggestions.append(
                       f"考虑将部分{model}的请求转移到gpt-4o-mini以节省成本"
                   )

           # 检查缓存命中率
           hit_rate = self.cache.get_hit_rate()
           if hit_rate < 0.3:
               suggestions.append(
                   "缓存命中率较低，考虑增加缓存时间或优化缓存键"
               )

           return suggestions
   ```

41. **如何实现AI系统的AB测试？（美团必问）**
   ```python
   class ABTestFramework:
       def __init__(self):
           self.variants = {}
           self.metrics = defaultdict(lambda: {
               "impressions": 0,
               "conversions": 0,
               "satisfaction": []
           })

       def create_experiment(
           self,
           name: str,
           variants: dict,
           traffic_split: dict = None
       ):
           """创建AB测试实验"""
           """
           variants: {
               "A": {"model": "gpt-4", "temperature": 0},
               "B": {"model": "gpt-4o-mini", "temperature": 0.7}
           }
           traffic_split: {"A": 0.5, "B": 0.5}
           """

           self.variants[name] = {
               "variants": variants,
               "traffic_split": traffic_split or {
                   k: 1/len(variants) for k in variants
               }
           }

       def assign_variant(self, experiment: str, user_id: str):
           """为用户分配变体"""
           import hashlib

           # 基于用户ID的hash值，确保一致性
           hash_val = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
           assignment = hash_val % 100

           # 根据流量分配确定变体
           cumulative = 0
           for variant, split in self.variants[experiment]["traffic_split"].items():
               cumulative += split * 100
               if assignment < cumulative:
                   return variant

           return list(self.variants[experiment]["variants"].keys())[0]

       def get_variant_config(self, experiment: str, variant: str):
           """获取变体配置"""
           return self.variants[experiment]["variants"][variant]

       def track_impression(self, experiment: str, variant: str):
           """记录展示"""
           self.metrics[(experiment, variant)]["impressions"] += 1

       def track_conversion(self, experiment: str, variant: str):
           """记录转化"""
           self.metrics[(experiment, variant)]["conversions"] += 1

       def track_satisfaction(
           self,
           experiment: str,
           variant: str,
           score: float
       ):
           """记录满意度"""
           self.metrics[(experiment, variant)]["satisfaction"].append(score)

       def get_results(self, experiment: str):
           """获取实验结果"""
           results = {}
           variants = self.variants[experiment]["variants"]

           for variant in variants:
               metrics = self.metrics[(experiment, variant)]

               conversion_rate = (
                   metrics["conversions"] / metrics["impressions"]
                   if metrics["impressions"] > 0
                   else 0
               )

               avg_satisfaction = (
                   sum(metrics["satisfaction"]) / len(metrics["satisfaction"])
                   if metrics["satisfaction"]
                   else 0
               )

               results[variant] = {
                   "impressions": metrics["impressions"],
                   "conversions": metrics["conversions"],
                   "conversion_rate": conversion_rate,
                   "avg_satisfaction": avg_satisfaction
               }

           # 统计显著性检验
           winner = self.calculate_statistical_significance(experiment, results)

           return {
               "results": results,
               "winner": winner
           }

       def calculate_statistical_significance(
           self,
           experiment: str,
           results: dict
       ):
           """计算统计显著性"""
           from scipy import stats

           variants = list(results.keys())

           if len(variants) != 2:
               return None

           # A/B测试的z检验
           variant_a = variants[0]
           variant_b = variants[1]

           conversions_a = results[variant_a]["conversions"]
           total_a = results[variant_a]["impressions"]

           conversions_b = results[variant_b]["conversions"]
           total_b = results[variant_b]["impressions"]

           # 计算p-value
           count = np.array([conversions_a, conversions_b])
           nobs = np.array([total_a, total_b])

           stat, pval = stats.proportions_ztest(count, nobs)

           # 如果p-value < 0.05，认为有显著性差异
           if pval < 0.05:
               return (
                   variant_a
                   if results[variant_a]["conversion_rate"] >
                   results[variant_b]["conversion_rate"]
                   else variant_b
               )

           return "no_significant_difference"
   ```

42. **如何处理AI系统的错误和异常？（项目实战题）**
   ```python
   class ErrorHandlingLLM:
       def __init__(self, llm):
           self.llm = llm
           self.error_log = []
           self.fallback_strategies = [
               "retry",
               "use_cheaper_model",
               "simplify_prompt",
               "use_cached_response"
           ]

       def safe_generate(
           self,
           prompt: str,
           max_retries: int = 3,
           fallback_strategy: str = "retry"
       ):
           """带错误处理的生成"""

           for attempt in range(max_retries):
               try:
                   # 尝试生成
                   response = self.llm.generate(prompt)

                   # 检查响应质量
                   if self.validate_response(response):
                       return response

               except RateLimitError as e:
                   # 速率限制错误
                   self.log_error("rate_limit", str(e))

                   if attempt < max_retries - 1:
                       # 等待后重试
                       import time
                       wait_time = 2 ** attempt  # 指数退避
                       time.sleep(wait_time)
                       continue

                   # 使用降级策略
                   return self.apply_fallback(
                       fallback_strategy,
                       prompt,
                       original_error=e
                   )

               except InvalidRequestError as e:
                   # 请求无效（如token超限）
                   self.log_error("invalid_request", str(e))

                   # 尝试简化prompt
                   simplified_prompt = self.simplify_prompt(prompt)
                   return self.safe_generate(
                       simplified_prompt,
                       max_retries=1
                   )

               except APIConnectionError as e:
                   # 连接错误
                   self.log_error("connection", str(e))

                   # 使用缓存或本地模型
                   return self.apply_fallback(
                       "use_cached_response",
                       prompt,
                       original_error=e
                   )

               except Exception as e:
                   # 其他错误
                   self.log_error("unknown", str(e))
                   raise

       def validate_response(self, response):
           """验证响应质量"""
           # 检查是否为空
           if not response or not response.strip():
               return False

           # 检查是否包含错误标记
           error_markers = ["I apologize", "I cannot", "Error", "Sorry"]
           if any(marker in response for marker in error_markers):
               return False

           # 检查长度
           if len(response.split()) < 10:
               return False

           return True

       def simplify_prompt(self, prompt: str):
           """简化prompt"""
           # 移除few-shot示例
           lines = prompt.split('\n')
           simplified = []
           in_example = False

           for line in lines:
               if 'Example' in line or 'example' in line:
                   in_example = True
                   continue

               if not in_example:
                   simplified.append(line)

           return '\n'.join(simplified)

       def apply_fallback(self, strategy: str, prompt: str, original_error: Exception):
           """应用降级策略"""
           if strategy == "retry":
               # 最后一次重试
               return self.llm.generate(prompt)

           elif strategy == "use_cheaper_model":
               # 使用更稳定的模型
               return self.llm.generate(
                   prompt,
                   model="gpt-3.5-turbo"
               )

           elif strategy == "simplify_prompt":
               # 简化后重试
               simplified = self.simplify_prompt(prompt)
               return self.llm.generate(simplified)

           elif strategy == "use_cached_response":
               # 返回缓存响应
               cached = self.cache.get(prompt)
               if cached:
                   return cached

               # 返回错误消息
               return f"抱歉，系统暂时无法处理您的请求。错误：{str(original_error)}"

       def log_error(self, error_type: str, error_message: str):
           """记录错误"""
           self.error_log.append({
               "type": error_type,
               "message": error_message,
               "timestamp": time.time()
           })

           # 如果错误率过高，发送警报
           if self.get_error_rate() > 0.1:
               self.send_alert()

       def get_error_rate(self, window_minutes: int = 5):
           """获取错误率"""
           cutoff = time.time() - window_minutes * 60

           recent_errors = [
               e for e in self.error_log
               if e["timestamp"] > cutoff
           ]

           # 假设每分钟100个请求
           total_requests = 100 * window_minutes

           return len(recent_errors) / total_requests
   ```

43. **如何实现AI系统的监控和告警？（阿里必问）**
   ```python
   from prometheus_client import Counter, Histogram, Gauge, start_http_server
   import time
   from typing import Optional

   # 定义指标
   request_counter = Counter(
       'llm_requests_total',
       'Total LLM requests',
       ['model', 'status', 'error_type']
   )

   request_duration = Histogram(
       'llm_request_duration_seconds',
       'Request duration',
       ['model'],
       buckets=[0.1, 0.5, 1, 2, 5, 10, 30, 60, 120]
   )

   token_usage = Histogram(
       'llm_token_usage',
       'Token usage per request',
       ['model'],
       buckets=[100, 500, 1000, 2000, 4000, 8000, 16000]
   )

   active_requests = Gauge('llm_active_requests', 'Active requests')
   error_rate = Gauge('llm_error_rate', 'Error rate', ['model'])

   class LLMMonitor:
       def __init__(self, llm):
           self.llm = llm
           self.alert_thresholds = {
               "error_rate": 0.05,  # 5%错误率
               "latency_p99": 10,    # 10秒
               "cost_per_hour": 100  # $100/小时
           }
           self.alert_handlers = []

       def monitored_generate(
           self,
           prompt: str,
           model: str = "gpt-4",
           user_id: Optional[str] = None
       ):
           """带监控的生成"""

           # 1. 开始监控
           start_time = time.time()
           active_requests.inc()
           status = "success"
           error_type = None

           try:
               # 2. 执行请求
               response = self.llm.generate(prompt, model=model)

               # 3. 记录指标
               duration = time.time() - start_time
               request_duration.labels(model=model).observe(duration)
               token_usage.labels(model=model).observe(response.token_count)

               # 4. 检查延迟
               if duration > self.alert_thresholds["latency_p99"]:
                   self.send_alert(
                       "high_latency",
                       f"High latency detected: {duration}s for model {model}"
                   )

               return response

           except RateLimitError as e:
               status = "error"
               error_type = "rate_limit"
               raise

           except APIError as e:
               status = "error"
               error_type = "api_error"
               raise

           finally:
               # 5. 记录请求
               active_requests.dec()
               request_counter.labels(
                   model=model,
                   status=status,
                   error_type=error_type
               ).inc()

               # 6. 检查错误率
               self.check_error_rate(model)

       def check_error_rate(self, model: str):
           """检查错误率"""
           # 获取过去5分钟的错误率
           error_count = request_counter.labels(
               model=model,
               status="error",
               error_type=None
           )._value.get()

           total_count = request_counter.labels(
               model=model,
               status=None,
               error_type=None
           )._value.get()

           if total_count > 0:
               rate = error_count / total_count

               error_rate.labels(model=model).set(rate)

               if rate > self.alert_thresholds["error_rate"]:
                   self.send_alert(
                       "high_error_rate",
                       f"Error rate {rate:.2%} for model {model}"
                   )

       def send_alert(self, alert_type: str, message: str):
           """发送告警"""
           for handler in self.alert_handlers:
               handler(alert_type, message)

       def add_alert_handler(self, handler):
           """添加告警处理器"""
           self.alert_handlers.append(handler)

   # 告警处理器示例
   def email_alert_handler(alert_type: str, message: str):
       """邮件告警"""
       import smtplib
       from email.message import EmailMessage

       msg = EmailMessage()
       msg['Subject'] = f"LLM Alert: {alert_type}"
       msg['From'] = "alerts@company.com"
       msg['To'] = "oncall@company.com"
       msg.set_content(message)

       # 发送邮件
       # smtp.send_message(msg)

   def slack_alert_handler(alert_type: str, message: str):
       """Slack告警"""
       import requests

       webhook_url = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

       requests.post(webhook_url, json={
           "text": f"🚨 *LLM Alert: {alert_type}*\n{message}"
       })

   # 使用
   monitor = LLMMonitor(llm)
   monitor.add_alert_handler(email_alert_handler)
   monitor.add_alert_handler(slack_alert_handler)

   # 启动Prometheus metrics server
   start_http_server(8000)
   ```

## OpenAI o1 模型推理能力

### 什么是 o1 模型？

**o1** = OpenAI 2024年9月发布的推理优化模型系列

**核心特点**：

- 🧠 **链式推理**：模拟人类思考过程，逐步推理
- ⏱️ **思考时间**：生成答案前进行内部推理
- 🎯 **复杂问题**：数学、编程、科学问题表现卓越
- 📊 **自我反思**：检查自己的答案，修正错误
- 🔒 **思维链**：输出推理过程（部分可见）

```python
# o1 模型使用示例
from openai import OpenAI

client = OpenAI()

# o1-preview / o1-mini
response = client.chat.completions.create(
    model="o1-preview",  # 或 o1-mini
    messages=[
        {"role": "user", "content": "如何证明根号2是无理数？"}
    ]
)

print(response.choices[0].message.content)
# o1 会先进行内部推理，然后给出详细证明
```

### o1 与 GPT-4 的区别

| 特性 | GPT-4 | o1 |
|------|-------|-----|
| **推理方式** | 直接生成 | 链式推理 |
| **思考时间** | 即时 | 预推理（5-30秒） |
| **适用场景** | 通用任务 | 复杂推理 |
| **Token 限制** | 128K | 200K |
| **价格** | 较低 | 较高 |
| **速度** | 快 | 慢（需推理时间） |

**性能对比**：

```python
# 数学问题示例
question = "一个正方体的表面积是54平方厘米，求体积。"

# GPT-4
# 回答：设边长为a，6a²=54，a=3，体积=27

# o1
# 回答：（内部推理）
# 1. 正方体有6个面
# 2. 每个面面积 = 54/6 = 9
# 3. 边长 = √9 = 3
# 4. 体积 = 3³ = 27
# 答案：27立方厘米
```

### o1 的应用场景

**1. 数学问题**：

```python
def solve_math_problem(problem: str):
    """使用 o1 解决数学问题"""
    response = client.chat.completions.create(
        model="o1-preview",
        messages=[
            {
                "role": "user",
                "content": f"""
请详细解答以下数学问题，展示所有推理步骤：

{problem}

要求：
1. 逐步推理
2. 说明每一步的依据
3. 验证答案正确性
                """
            }
        ]
    )
    return response.choices[0].message.content

# 使用
problem = "求不定积分：∫(x² + 2x + 1)dx"
solution = solve_math_problem(problem)
print(solution)
```

**2. 编程调试**：

```python
def debug_code(code: str, error: str):
    """使用 o1 调试代码"""
    response = client.chat.completions.create(
        model="o1-preview",
        messages=[
            {
                "role": "user",
                "content": f"""
代码：
```python
{code}
```

错误：
```
{error}
```

请分析问题并给出修复方案：
1. 分析错误原因
2. 给出修复步骤
3. 提供修复后的代码
4. 解释为什么这样修复
                """
            }
        ]
    )
    return response.choices[0].message.content
```

**3. 科学推理**：

```python
def scientific_reasoning(question: str):
    """科学问题推理"""
    response = client.chat.completions.create(
        model="o1-preview",
        messages=[
            {
                "role": "user",
                "content": f"""
作为科学专家，请回答以下问题：

{question}

要求：
1. 基于科学原理分析
2. 考虑多种可能性
3. 给出推理过程
4. 标注不确定性
                """
            }
        ]
    )
    return response.choices[0].message.content
```

### o1 的链式推理实现

**思维链（Chain of Thought）**：

```python
class O1ReasoningEngine:
    """o1 风格的推理引擎"""

    def __init__(self, model="o1-preview"):
        self.client = OpenAI()
        self.model = model

    def reason(self, question: str, max_iterations: int = 3):
        """链式推理"""
        reasoning_chain = []

        for i in range(max_iterations):
            # 构建提示词
            if i == 0:
                prompt = f"问题：{question}\n\n请逐步分析："
            else:
                prompt = f"""基于之前的分析：
{chr(10).join(reasoning_chain)}

请继续推理或给出最终答案："""

            # 获取响应
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}]
            )

            thought = response.choices[0].message.content
            reasoning_chain.append(thought)

            # 检查是否完成
            if "结论" in thought or "答案" in thought or "因此" in thought:
                break

        return reasoning_chain

    def solve_with_verification(self, question: str):
        """推理 + 验证"""
        # 第一次推理
        chain1 = self.reason(question)

        # 要求验证
        verification_prompt = f"""以下是问题和初步推理：

问题：{question}

推理过程：
{chr(10).join(chain1)}

请验证以上推理是否正确，指出可能的错误并给出改进建议："""

        verification = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": verification_prompt}]
        )

        # 基于验证重新推理
        refined_prompt = f"""基于验证反馈：

{verification.choices[0].message.content}

请重新回答原问题：{question}"""

        final_answer = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": refined_prompt}]
        )

        return {
            "initial_reasoning": chain1,
            "verification": verification.choices[0].message.content,
            "final_answer": final_answer.choices[0].message.content
        }

# 使用
engine = O1ReasoningEngine()
result = engine.solve_with_verification("为什么天空是蓝色的？")
```

### o1 的最佳实践

**1. 提示词设计**：

```python
# ❌ 不好的提示词
response = client.chat.completions.create(
    model="o1-preview",
    messages=[{"role": "user", "content": "解决这个数学问题"}]
)

# ✅ 好的提示词
response = client.chat.completions.create(
    model="o1-preview",
    messages=[{
        "role": "user",
        "content": """
请逐步解决以下数学问题，展示每一步推理：

问题描述：[问题描述]

要求：
1. 分析已知条件
2. 确定解题思路
3. 逐步计算
4. 验证答案
5. 总结关键步骤
    """
    }]
)
```

**2. 成本优化**：

```python
# 使用 o1-mini 处理简单问题
def route_question(question: str):
    """根据复杂度路由到不同模型"""
    # 简单问题使用 o1-mini
    if len(question) < 100:
        model = "o1-mini"
    # 复杂问题使用 o1-preview
    else:
        model = "o1-preview"

    return client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": question}]
    )
```

**3. 超时处理**：

```python
import asyncio
from openai import AsyncOpenAI

async def reasoning_with_timeout(question: str, timeout: int = 60):
    """带超时的推理"""
    client = AsyncOpenAI()

    try:
        response = await asyncio.wait_for(
            client.chat.completions.create(
                model="o1-preview",
                messages=[{"role": "user", "content": question}]
            ),
            timeout=timeout
        )
        return response.choices[0].message.content
    except asyncio.TimeoutError:
        return "推理超时，请尝试简化问题"
```

---

## 多模态 Agent

### 什么是多模态 Agent？

**多模态 Agent** = 能处理多种输入/输出模态的 AI Agent

**支持的模态**：

- 📝 **文本**（Text）
- 🖼️ **图像**（Image）
- 🎵 **音频**（Audio）
- 🎬 **视频**（Video）
- 📊 **结构化数据**（JSON、表格）

```python
# 多模态 Agent 示例
from openai import OpenAI

client = OpenAI()

# 图像 + 文本理解
response = client.chat.completions.create(
    model="gpt-4o",  # 多模态模型
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "这张图片里有什么？"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/image.jpg"
                    }
                }
            ]
        }
    ]
)

print(response.choices[0].message.content)
```

### 多模态 Agent 架构

```python
from typing import Union, List
from dataclasses import dataclass
from enum import Enum

class ModalityType(Enum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"

@dataclass
class MultimodalInput:
    """多模态输入"""
    type: ModalityType
    data: Union[str, bytes]

class MultimodalAgent:
    """多模态 Agent"""

    def __init__(self):
        self.client = OpenAI()
        self.vision_model = "gpt-4o"
        self.text_model = "gpt-4o"
        self.audio_model = "whisper-1"

    def process(self, inputs: List[MultimodalInput]) -> str:
        """处理多模态输入"""
        results = []

        for inp in inputs:
            if inp.type == ModalityType.TEXT:
                result = self._process_text(inp.data)
            elif inp.type == ModalityType.IMAGE:
                result = self._process_image(inp.data)
            elif inp.type == ModalityType.AUDIO:
                result = self._process_audio(inp.data)
            else:
                result = "Unsupported modality"

            results.append(result)

        # 综合分析
        return self._synthesize(results)

    def _process_text(self, text: str) -> str:
        """处理文本"""
        response = self.client.chat.completions.create(
            model=self.text_model,
            messages=[{"role": "user", "content": text}]
        )
        return response.choices[0].message.content

    def _process_image(self, image_url: str) -> str:
        """处理图像"""
        response = self.client.chat.completions.create(
            model=self.vision_model,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": "描述这张图片"},
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    }
                ]
            }]
        )
        return response.choices[0].message.content

    def _process_audio(self, audio_path: str) -> str:
        """处理音频"""
        with open(audio_path, "rb") as audio:
            transcription = self.client.audio.transcriptions.create(
                model=self.audio_model,
                file=audio
            )
        return transcription.text

    def _synthesize(self, results: List[str]) -> str:
        """综合分析多个模态的结果"""
        combined = "\n".join([
            f"{i+1}. {result}" for i, result in enumerate(results)
        ])

        response = self.client.chat.completions.create(
            model=self.text_model,
            messages=[{
                "role": "user",
                "content": f"""
综合分析以下多模态信息：

{combined}

请给出综合分析结果：
                """
            }]
        )

        return response.choices[0].message.content

# 使用示例
agent = MultimodalAgent()

# 图像分析场景
result = agent.process([
    MultimodalInput(ModalityType.TEXT, "分析这张图表中的趋势"),
    MultimodalInput(ModalityType.IMAGE, "https://example.com/chart.png")
])
```

### 多模态 Agent 应用场景

**1. 医疗影像分析**：

```python
class MedicalImageAgent:
    """医疗影像分析 Agent"""

    def analyze(self, image_url: str, patient_info: dict):
        """分析医疗影像"""
        prompt = f"""
作为医疗AI助手，请分析以下医学影像：

患者信息：
- 年龄：{patient_info['age']}
- 性别：{patient_info['gender']}
- 症状：{patient_info['symptoms']}

请提供：
1. 影像描述
2. 异常发现
3. 可能诊断
4. 建议检查
5: 置信度评估

注意：此分析仅供参考，请咨询专业医生。
        """

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    }
                ]
            }]
        )

        return response.choices[0].message.content
```

**2. 视频内容分析**：

```python
import cv2

class VideoAnalysisAgent:
    """视频分析 Agent"""

    def analyze_video(self, video_path: str):
        """分析视频内容"""
        # 提取关键帧
        frames = self._extract_frames(video_path, interval=30)

        # 分析每一帧
        frame_descriptions = []
        for i, frame in enumerate(frames):
            description = self._describe_frame(frame)
            frame_descriptions.append(f"帧 {i}: {description}")

        # 综合分析
        summary = self._summarize_video(frame_descriptions)

        return {
            "frames": frame_descriptions,
            "summary": summary
        }

    def _extract_frames(self, video_path: str, interval: int = 30):
        """提取关键帧"""
        cap = cv2.VideoCapture(video_path)
        frames = []
        count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if count % interval == 0:
                # 保存帧并返回 URL
                frame_path = f"frame_{count}.jpg"
                cv2.imwrite(frame_path, frame)
                frames.append(frame_path)

            count += 1

        cap.release()
        return frames

    def _describe_frame(self, frame_path: str) -> str:
        """描述单帧内容"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": "简要描述这张图片的内容"},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"file://{frame_path}"}
                    }
                ]
            }]
        )
        return response.choices[0].message.content

    def _summarize_video(self, descriptions: List[str]) -> str:
        """总结视频内容"""
        content = "\n".join(descriptions)

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": f"""
基于以下帧描述，总结视频内容：

{content}

请提供：
1. 视频主题
2. 主要事件
3. 情感基调
4. 关键信息
                """
            }]
        )

        return response.choices[0].message.content
```

**3. 多模态问答系统**：

```python
class MultimodalQA:
    """多模态问答系统"""

    def answer(self, question: str, context: List[MultimodalInput]):
        """多模态问答"""
        # 构建 GPT-4V 消息
        messages = [{
            "role": "user",
            "content": [{"type": "text", "text": question}]
        }]

        # 添加多模态上下文
        for ctx in context:
            if ctx.type == ModalityType.IMAGE:
                messages[0]["content"].append({
                    "type": "image_url",
                    "image_url": {"url": ctx.data}
                })
            elif ctx.type == ModalityType.TEXT:
                messages[0]["content"].append({
                    "type": "text",
                    "text": f"参考信息：{ctx.data}"
                })

        # 获取答案
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )

        return response.choices[0].message.content

# 使用
qa = MultimodalQA()

answer = qa.answer(
    question="这个图表显示了什么趋势？",
    context=[
        MultimodalInput(
            ModalityType.TEXT,
            "这是2023年销售数据图表"
        ),
        MultimodalInput(
            ModalityType.IMAGE,
            "https://example.com/sales_chart.png"
        )
    ]
)
```

### 多模态 Agent 的挑战

**1. 模态对齐**：

```python
# 挑战：如何对齐不同模态的信息？

class ModalityAlignment:
    """模态对齐"""

    def align_text_image(self, text: str, image_url: str):
        """对齐文本和图像信息"""
        prompt = f"""
文本描述：{text}

请判断文本描述与图像是否一致：
1. 一致性评分（0-10）
2. 不一致的细节
3. 改进建议
        """

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    }
                ]
            }]
        )

        return response.choices[0].message.content
```

**2. 上下文窗口限制**：

```python
# 挑战：多模态输入消耗大量 Token

class TokenOptimizer:
    """Token 优化器"""

    def optimize_inputs(self, inputs: List[MultimodalInput], max_tokens: int = 4000):
        """优化输入以适应 Token 限制"""
        # 估算每个输入的 Token 数
        estimated = []

        for inp in inputs:
            if inp.type == ModalityType.TEXT:
                # 文本：1 Token ≈ 4 字符
                tokens = len(inp.data) // 4
            elif inp.type == ModalityType.IMAGE:
                # 图像：固定约 1100 Token（GPT-4V）
                tokens = 1100

            estimated.append((inp, tokens))

        # 排序并截断
        sorted_inputs = sorted(estimated, key=lambda x: x[1])

        selected = []
        total = 0

        for inp, tokens in sorted_inputs:
            if total + tokens <= max_tokens:
                selected.append(inp)
                total += tokens
            else:
                break

        return selected
```

**3. 实时性要求**：

```python
# 挑战：多模态处理速度慢

import asyncio

class AsyncMultimodalAgent:
    """异步多模态 Agent"""

    async def process_parallel(self, inputs: List[MultimodalInput]):
        """并行处理多个模态"""
        client = AsyncOpenAI()

        async def process_single(inp: MultimodalInput):
            if inp.type == ModalityType.TEXT:
                # 处理文本
                return await self._process_text_async(client, inp.data)
            elif inp.type == ModalityType.IMAGE:
                # 处理图像
                return await self._process_image_async(client, inp.data)

        # 并行处理
        results = await asyncio.gather(*[
            process_single(inp) for inp in inputs
        ])

        return results

    async def _process_text_async(self, client: AsyncOpenAI, text: str):
        """异步处理文本"""
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": text}]
        )
        return response.choices[0].message.content

    async def _process_image_async(self, client: AsyncOpenAI, image_url: str):
        """异步处理图像"""
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": "描述这张图片"},
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    }
                ]
            }]
        )
        return response.choices[0].message.content
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
