---
title: AI大型项目实战面试题
---

# AI大型项目实战面试题

## 项目一：企业级智能客服系统

### 项目背景

为千万级用户的大型电商平台构建智能客服系统，支持文字、语音、图片多模态交互，日均处理100万+咨询。

### 核心功能

```python
"""
┌─────────────────────────────────────────────────────────┐
│              智能客服系统架构                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  用户端                                                  │
│  ├─ Web/App        ├─ 小程序      ├─ 电话              │
│                                                         │
│  ↓                                                     │
│  网关层 (负载均衡 + 限流)                                │
│                                                         │
│  ↓                                                     │
│  意图识别层 (快速路由)                                   │
│  ├─ FAQ匹配 (90%)  ├─ RAG检索 (8%)  └─ 人工 (2%)       │
│                                                         │
│  ↓                                                     │
│  知识库层                                               │
│  ├─ 向量数据库    ├─ 图谱        └─ 实时数据           │
│                                                         │
│  ↓                                                     │
│  生成层 (多模型协同)                                     │
│  ├─ GPT-4 (复杂)   ├─ GPT-3.5 (通用) └─ 本地模型(简单) │
│                                                         │
└─────────────────────────────────────────────────────────┘
"""
```

### 面试问题 1：如何设计多级路由系统？

**答案**：

```python
from fastapi import FastAPI
from typing import Literal
import re

app = FastAPI()

class IntentRouter:
    """意图识别路由器"""

    def __init__(self):
        # FAQ知识库（高频问题）
        self.faq_db = {
            "退款": "refund_policy",
            "发货": "shipping_info",
            "优惠券": "coupon_usage",
            "账户": "account_help"
        }

        # 关键词规则
        self.rules = {
            "complaint": ["投诉", "不满", "差评", "愤怒"],
            "urgent": ["紧急", "立即", "马上", "快点"],
            "complex": ["分析", "对比", "推荐", "建议"]
        }

    async def route(self, query: str) -> Literal["faq", "rag", "human"]:
        """三级路由决策"""

        # 1级：检查关键词匹配（FAQ）
        for keyword, category in self.faq_db.items():
            if keyword in query:
                return "faq"

        # 2级：情感和紧急程度判断
        sentiment = await self._analyze_sentiment(query)

        if sentiment["is_negative"] and sentiment["intensity"] > 0.7:
            # 负面情绪强，转人工
            return "human"

        if any(urgent in query for urgent in self.rules["urgent"]):
            # 紧急问题，转人工
            return "human"

        # 3级：复杂度判断
        if any(complex_kw in query for complex_kw in self.rules["complex"]):
            # 复杂问题，使用RAG
            return "rag"

        # 默认RAG
        return "rag"

    async def _analyze_sentiment(self, text: str) -> dict:
        """情感分析"""
        # 实际使用情感分析模型
        # 这里简化处理
        negative_words = ["生气", "愤怒", "投诉", "垃圾"]
        has_negative = any(word in text for word in negative_words)

        return {
            "is_negative": has_negative,
            "intensity": 0.8 if has_negative else 0.1
        }

# 使用
router = IntentRouter()

@app.post("/query")
async def handle_query(query: str):
    # 路由
    intent = await router.route(query)

    # 执行
    if intent == "faq":
        return await handle_faq(query)
    elif intent == "rag":
        return await handle_rag(query)
    else:
        return await transfer_to_human(query)

async def handle_faq(query: str):
    """FAQ处理 - 最快"""
    # 从数据库获取预设答案
    return {"type": "faq", "answer": "...", "latency": 50}

async def handle_rag(query: str):
    """RAG处理 - 中等速度"""
    # 检索 + 生成
    return {"type": "rag", "answer": "...", "latency": 1500}

async def transfer_to_human(query: str):
    """转人工"""
    # 创建工单
    return {"type": "human", "ticket_id": "...", "message": "已转人工"}
```

**关键技术点**：
- 多级路由减少成本（90%用FAQ）
- 情感分析提升用户体验
- 智能分流避免人工过载

### 面试问题 2：如何优化响应速度？

**答案**：

```python
import asyncio
from functools import lru_cache
import redis

class PerformanceOptimizer:
    """性能优化方案"""

    def __init__(self):
        self.redis_client = redis.Redis()
        self.cache = {}

    async def parallel_retrieval(self, query: str):
        """并行检索多个数据源"""

        # 并行执行
        results = await asyncio.gather(
            self._search_vector_db(query),
            self._search_knowledge_graph(query),
            self._search_faq_db(query),
            return_exceptions=True
        )

        return results

    @lru_cache(maxsize=1000)
    async def _search_vector_db(self, query: str):
        """向量检索（带缓存）"""
        cache_key = f"vector:{hash(query)}"
        cached = self.redis_client.get(cache_key)

        if cached:
            return cached

        # 实际检索
        result = await self.vector_db.search(query)
        self.redis_client.setex(cache_key, 3600, result)
        return result

    async def streaming_response(self, query: str):
        """流式响应 - 降低首字延迟"""

        # 1. 立即返回"正在处理"
        yield "正在查询相关内容...\n\n"

        # 2. 并行检索
        docs = await self.parallel_retrieval(query)

        # 3. 流式生成
        async for chunk in self.llm.stream(query, docs):
            yield chunk

    def smart_routing(self, query: str):
        """智能模型路由 - 成本优化"""

        # 简单问题用小模型
        if len(query) < 50 and "如何" not in query:
            return "gpt-3.5-turbo"

        # 复杂问题用大模型
        return "gpt-4"
```

**优化效果**：
- 并行检索：500ms → 150ms
- 缓存命中率：40% → 70%
- 流式响应：首字延迟 < 100ms
- 模型路由：成本降低60%

### 面试问题 3：如何处理多轮对话？

**答案**：

```python
from typing import List, Dict

class ConversationManager:
    """多轮对话管理"""

    def __init__(self):
        self.conversations = {}  # session_id -> conversation

    async def handle_message(
        self,
        session_id: str,
        message: str
    ) -> str:
        """处理消息"""

        # 获取或创建会话
        conv = self.conversations.get(session_id)
        if not conv:
            conv = self._create_conversation()
            self.conversations[session_id] = conv

        # 添加用户消息
        conv["messages"].append({
            "role": "user",
            "content": message
        })

        # 查询重写（融入上下文）
        rewritten_query = await self._rewrite_query(
            message,
            conv["messages"][:-1]
        )

        # 检索
        docs = await self.retrieve(rewritten_query)

        # 生成
        response = await self.generate(
            conv["messages"],
            docs
        )

        # 添加助手消息
        conv["messages"].append({
            "role": "assistant",
            "content": response
        })

        # 上下文压缩（超10轮则摘要）
        if len(conv["messages"]) > 20:
            conv["messages"] = await self._compress_context(
                conv["messages"]
            )

        return response

    async def _rewrite_query(
        self,
        current_query: str,
        history: List[Dict]
    ) -> str:
        """查询重写 - 解决指代问题"""

        # 示例：
        # 用户：我想买手机
        # 助手：推荐iPhone 15
        # 用户：它多少钱？（"它"指iPhone 15）

        prompt = f"""
        历史对话：{history}

        当前问题：{current_query}

        请将当前问题改写为完整、独立的问题。
        消除指代关系，使其不依赖上下文。
        """

        rewritten = await self.llm.predict(prompt)
        return rewritten

    async def _compress_context(
        self,
        messages: List[Dict]
    ) -> List[Dict]:
        """上下文压缩"""

        # 保留最近5轮
        recent = messages[-10:]

        # 之前的对话摘要
        old = messages[:-10]
        summary = await self.llm.predict(f"""
        请将以下对话摘要为200字：
        {old}
        """)

        # 返回摘要 + 最近对话
        return [
            {"role": "system", "content": f"历史摘要：{summary}"}
        ] + recent
```

### 面试问题 4：如何评估系统效果？

**答案**：

```python
class MetricsTracker:
    """指标追踪"""

    def __init__(self):
        self.metrics = {
            "total_queries": 0,
            "faq_hits": 0,
            "rag_hits": 0,
            "human_transfers": 0,
            "avg_response_time": 0,
            "satisfaction_scores": []
        }

    def track_query(
        self,
        query_type: str,
        response_time: float,
        satisfaction: float = None
    ):
        """记录查询指标"""
        self.metrics["total_queries"] += 1
        self.metrics[f"{query_type}_hits"] += 1

        # 更新平均响应时间
        n = self.metrics["total_queries"]
        old_avg = self.metrics["avg_response_time"]
        self.metrics["avg_response_time"] = (
            (old_avg * (n - 1) + response_time) / n
        )

        if satisfaction:
            self.metrics["satisfaction_scores"].append(
                satisfaction
            )

    def get_report(self) -> dict:
        """生成报告"""
        total = self.metrics["total_queries"]

        return {
            "自动化率": (
                (self.metrics["faq_hits"] + self.metrics["rag_hits"])
                / total
            ),
            "平均响应时间": self.metrics["avg_response_time"],
            "用户满意度": (
                sum(self.metrics["satisfaction_scores"])
                / len(self.metrics["satisfaction_scores"])
                if self.metrics["satisfaction_scores"] else 0
            ),
            "转人工率": (
                self.metrics["human_transfers"] / total
            )
        }

# 业务指标
def calculate_roi(
    monthly_queries: int,
    automation_rate: float,
    human_cost_per_query: float,
    ai_cost_per_query: float
) -> dict:
    """计算ROI"""

    automated_queries = monthly_queries * automation_rate
    human_queries = monthly_queries * (1 - automation_rate)

    ai_cost = automated_queries * ai_cost_per_query
    human_cost = human_queries * human_cost_per_query
    total_cost = ai_cost + human_cost

    # 全部用人工的成本
    full_human_cost = monthly_queries * human_cost_per_query

    savings = full_human_cost - total_cost
    roi = savings / total_cost * 100

    return {
        "月度成本": total_cost,
        "节省成本": savings,
        "ROI": f"{roi:.1f}%"
    }

# 示例
# 月100万查询，自动化率95%，人工$5/次，AI$0.1/次
roi = calculate_roi(
    monthly_queries=1_000_000,
    automation_rate=0.95,
    human_cost_per_query=5,
    ai_cost_per_query=0.1
)
# ROI: 855%
```

---

## 项目二：AI代码助手平台

### 项目背景

为开发团队构建AI代码助手，支持代码补全、代码审查、bug检测、文档生成等功能，提升开发效率50%。

### 面试问题 5：如何实现智能代码补全？

**答案**：

```python
class CodeCompletionEngine:
    """代码补全引擎"""

    def __init__(self):
        # 多模型策略
        self.models = {
            "small": "code-specialized-3b",   # 快速补全
            "medium": "code-specialized-7b",  # 质量补全
            "large": "gpt-4"                  # 复杂场景
        }

        # 代码索引
        self.code_index = VectorStore()

    async def complete(
        self,
        code: str,
        language: str,
        cursor_position: int
    ) -> List[dict]:
        """生成代码补全建议"""

        # 1. 分析上下文
        context = self._extract_context(
            code,
            cursor_position
        )

        # 2. 识别补全类型
        completion_type = self._detect_type(context)

        # 3. 选择模型
        model = self._select_model(completion_type)

        # 4. 检索相关代码
        similar_code = await self.code_index.search(
            context["current_line"],
            k=5
        )

        # 5. 生成补全
        if completion_type == "single_line":
            # 单行补全 - 用小模型
            suggestions = await self._complete_line(
                context,
                model,
                similar_code
            )
        elif completion_type == "function":
            # 函数补全 - 用中模型
            suggestions = await self._complete_function(
                context,
                model,
                similar_code
            )
        else:
            # 大段生成 - 用大模型
            suggestions = await self._complete_block(
                context,
                model,
                similar_code
            )

        # 6. 排序和过滤
        ranked = self._rank_suggestions(
            suggestions,
            context
        )

        return ranked[:5]  # 返回Top 5

    def _detect_type(self, context: dict) -> str:
        """检测补全类型"""

        line = context["current_line"]

        # 函数定义
        if line.strip().startswith("def ") or line.strip().startswith("function "):
            return "function"

        # 单行补全
        if ";" in line or context["indent"] == 0:
            return "single_line"

        # 块补全
        return "block"

    def _select_model(self, completion_type: str) -> str:
        """智能模型选择"""

        model_map = {
            "single_line": "small",   # 速度优先
            "function": "medium",      # 质量优先
            "block": "large"           # 复杂度优先
        }

        return model_map.get(completion_type, "medium")

    async def _complete_line(
        self,
        context: dict,
        model: str,
        similar_code: list
    ) -> list:
        """单行补全"""

        # 构建prompt
        prompt = f"""
        语言：{context['language']}
        上下文：
        {context['before_cursor']}

        相似代码示例：
        {self._format_examples(similar_code)}

        补全：
        """

        # 生成多个选项
        suggestions = await self.llm.generate(
            prompt,
            model=model,
            n=3,  # 生成3个选项
            temperature=0.3  # 低温度，更确定性
        )

        return [
            {
                "text": s,
                "type": "line",
                "confidence": 0.9
            }
            for s in suggestions
        ]
```

### 面试问题 6：如何实现代码审查？

**答案**：

```python
class CodeReviewAgent:
    """代码审查Agent"""

    def __init__(self):
        self.rules = self._load_review_rules()

    async def review(
        self,
        code: str,
        language: str,
        diff: bool = False
    ) -> dict:
        """审查代码"""

        # 1. 规则检查（快速）
        rule_violations = self._check_rules(code, language)

        # 2. 安全扫描
        security_issues = await self._security_scan(code)

        # 3. 性能分析
        performance_issues = await self._analyze_performance(
            code,
            language
        )

        # 4. 最佳实践检查（LLM）
        best_practices = await self._check_best_practices(
            code,
            language
        )

        # 5. 汇总报告
        report = {
            "summary": self._generate_summary(
                rule_violations,
                security_issues,
                performance_issues
            ),
            "issues": {
                "critical": [],
                "warning": [],
                "info": []
            },
            "suggestions": [],
            "score": self._calculate_score(
                rule_violations,
                security_issues,
                performance_issues
            )
        }

        # 分类问题
        for issue in rule_violations + security_issues + performance_issues:
            report["issues"][issue["severity"]].append(issue)

        return report

    async def _security_scan(self, code: str) -> list:
        """安全扫描"""

        # 常见安全问题模式
        security_patterns = {
            "SQL注入": [
                r'execute\([^)]*\+.*\)',
                r'query\([^)]*\+.*\)'
            ],
            "XSS漏洞": [
                r'innerHTML\s*=',
                r'dangerouslySetInnerHTML'
            ],
            "硬编码密钥": [
                r'api_key\s*=\s*["\'][\w-]{16,}["\']',
                r'password\s*=\s*["\'][\w]+["\']'
            ],
            "命令注入": [
                r'exec\(',
                r'eval\(',
                r'system\('
            ]
        }

        issues = []
        for vuln_type, patterns in security_patterns.items():
            for pattern in patterns:
                if re.search(pattern, code):
                    issues.append({
                        "type": "security",
                        "category": vuln_type,
                        "severity": "critical",
                        "message": f"检测到{vuln_type}风险",
                        "suggestion": self._get_security_fix(vuln_type)
                    })

        return issues

    async def _analyze_performance(
        self,
        code: str,
        language: str
    ) -> list:
        """性能分析"""

        issues = []

        # 检查性能反模式
        if language == "python":
            # N^2循环
            if "for " in code and code.count("for ") > 2:
                issues.append({
                    "type": "performance",
                    "category": "nested_loops",
                    "severity": "warning",
                    "message": "检测到多层嵌套循环，可能存在性能问题",
                    "suggestion": "考虑使用字典查找或优化算法"
                })

            # 大字符串拼接
            if code.count("+ ") > 10 and "str" in code:
                issues.append({
                    "type": "performance",
                    "category": "string_concat",
                    "severity": "info",
                    "message": "频繁字符串拼接效率低",
                    "suggestion": "使用join()或f-string"
                })

        return issues

    async def _check_best_practices(
        self,
        code: str,
        language: str
    ) -> list:
        """最佳实践检查（使用LLM）"""

        prompt = f"""
        作为一位资深{language}工程师，请审查以下代码：

        {code}

        检查项：
        1. 代码可读性
        2. 命名规范
        3. 错误处理
        4. 代码重复
        5. 设计模式应用

        请以JSON格式返回建议列表。
        """

        response = await self.llm.predict(prompt)
        return self._parse_suggestions(response)
```

### 面试问题 7：如何处理大型代码库？

**答案**：

```python
class LargeCodebaseIndexer:
    """大型代码库索引器"""

    def __init__(self):
        self.chunk_size = 500  # token数
        self.overlap = 50

    async def index_repository(self, repo_path: str):
        """索引整个代码库"""

        # 1. 遍历文件
        files = self._scan_files(repo_path)

        # 2. 并行处理
        chunks = []
        for file in files:
            file_chunks = await self._chunk_file(file)
            chunks.extend(file_chunks)

        # 3. 向量化
        embeddings = await self._embed_chunks(chunks)

        # 4. 存储到向量数据库
        await self._store_embeddings(chunks, embeddings)

        # 5. 构建依赖图
        dependency_graph = await self._build_dependency_graph(files)

        return {
            "total_chunks": len(chunks),
            "total_files": len(files),
            "index_time": "...",
            "dependency_nodes": len(dependency_graph)
        }

    async def _chunk_file(self, file_path: str) -> list:
        """智能分块"""

        # 读取文件
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 按语义分块
        language = self._detect_language(file_path)

        if language in ["python", "javascript"]:
            # 按函数/类分块
            chunks = self._chunk_by_functions(content, language)
        else:
            # 按固定大小分块
            chunks = self._chunk_by_size(content)

        # 添加元数据
        for chunk in chunks:
            chunk["metadata"] = {
                "file": file_path,
                "language": language,
                "type": chunk.get("type", "code"),
                "start_line": chunk.get("start_line"),
                "end_line": chunk.get("end_line")
            }

        return chunks

    def _chunk_by_functions(
        self,
        code: str,
        language: str
    ) -> list:
        """按函数/类分块"""

        chunks = []

        # 使用AST解析
        if language == "python":
            import ast

            tree = ast.parse(code)

            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
                    # 提取函数/类
                    start = node.lineno
                    end = node.end_lineno

                    chunk_code = "\n".join(
                        code.split("\n")[start-1:end]
                    )

                    chunks.append({
                        "code": chunk_code,
                        "type": "function" if isinstance(node, ast.FunctionDef) else "class",
                        "name": node.name,
                        "start_line": start,
                        "end_line": end
                    })

        return chunks

    async def _build_dependency_graph(
        self,
        files: list
    ) -> dict:
        """构建依赖关系图"""

        graph = {}

        for file in files:
            # 解析import/require
            dependencies = self._extract_imports(file)

            graph[file] = {
                "dependencies": dependencies,
                "dependents": []  # 谁依赖我
            }

        # 构建反向依赖
        for file, deps in graph.items():
            for dep in deps["dependencies"]:
                if dep in graph:
                    graph[dep]["dependents"].append(file)

        return graph
```

---

## 项目三：智能知识库问答系统

### 项目背景

为大型企业构建内部知识库，支持文档、PPT、PDF、Wiki等多种格式，实现精准问答和知识推荐。

### 面试问题 8：如何处理多模态文档？

**答案**：

```python
class MultiModalDocumentProcessor:
    """多模态文档处理器"""

    def __init__(self):
        self.extractors = {
            "pdf": PDFExtractor(),
            "ppt": PPTExtractor(),
            "doc": DocExtractor(),
            "wiki": WikiExtractor()
        }

    async def process_document(
        self,
        file_path: str,
        doc_type: str
    ) -> dict:
        """处理文档"""

        # 1. 提取内容
        extractor = self.extractors.get(doc_type)
        if not extractor:
            raise ValueError(f"Unsupported type: {doc_type}")

        raw_content = await extractor.extract(file_path)

        # 2. 内容分块
        chunks = await self._chunk_content(
            raw_content,
            doc_type
        )

        # 3. 提取表格（如果有）
        tables = await self._extract_tables(raw_content, doc_type)

        # 4. 提取图片描述
        images = await self._process_images(raw_content)

        # 5. 构建层次结构
        structure = await self._build_structure(raw_content)

        # 6. 向量化
        for chunk in chunks:
            embedding = await self._embed(chunk)
            chunk["embedding"] = embedding

        # 7. 存储
        await self._store(chunks, tables, images, structure)

        return {
            "total_chunks": len(chunks),
            "tables": len(tables),
            "images": len(images),
            "structure": structure
        }

    async def _extract_tables(
        self,
        content: dict,
        doc_type: str
    ) -> list:
        """提取表格"""

        tables = []

        if doc_type == "pdf":
            # 使用PDFPlumber
            import pdfplumber

            with pdfplumber.open(content["path"]) as pdf:
                for page in pdf.pages:
                    if page.extract_table():
                        table_data = page.extract_table()

                        # 转换为Markdown
                        markdown = self._table_to_markdown(table_data)

                        tables.append({
                            "data": table_data,
                            "markdown": markdown,
                            "page": page.page_number
                        })

        elif doc_type == "ppt":
            # 使用python-pptx
            from pptx import Presentation

            prs = Presentation(content["path"])

            for slide in prs.slides:
                for shape in slide.shapes:
                    if shape.has_table:
                        table_data = [
                            [cell.text for cell in row]
                            for row in shape.table.rows
                        ]

                        markdown = self._table_to_markdown(table_data)

                        tables.append({
                            "data": table_data,
                            "markdown": markdown,
                            "slide": slide.slide_index
                        })

        return tables

    async def _process_images(self, content: dict) -> list:
        """处理图片"""

        images = []

        # 1. 提取图片
        if content.get("images"):
            for img in content["images"]:

                # 2. 生成图片描述（使用多模态模型）
                description = await self._describe_image(img)

                # 3. OCR文字提取
                text = await self._extract_text_from_image(img)

                images.append({
                    "image_data": img,
                    "description": description,
                    "ocr_text": text,
                    "embedding": await self._embed(
                        f"{description}\n{text}"
                    )
                })

        return images

    async def _describe_image(self, image: bytes) -> str:
        """生成图片描述"""

        # 使用GPT-4V或Claude 3.5
        response = await self.multimodal_llm.predict(
            image=image,
            prompt="请详细描述这张图片的内容"
        )

        return response

    async def _build_structure(self, content: dict) -> dict:
        """构建文档结构"""

        structure = {
            "title": content.get("title", ""),
            "sections": [],
            "hierarchy": {}
        }

        # 提取标题层级
        if content.get("markdown"):
            lines = content["markdown"].split("\n")
            current_section = None

            for line in lines:
                if line.startswith("#"):
                    level = len(line) - len(line.lstrip("#"))
                    title = line.lstrip("#").strip()

                    section = {
                        "level": level,
                        "title": title,
                        "children": []
                    }

                    if level == 1:
                        structure["sections"].append(section)
                        current_section = section
                    else:
                        # 添加到父级
                        current_section["children"].append(section)

        return structure
```

### 面试问题 9：如何实现层次化检索？

**答案**：

```python
class HierarchicalRetriever:
    """层次化检索器"""

    def __init__(self):
        self.section_index = VectorStore()  # 章节级
        self.paragraph_index = VectorStore()  # 段落级
        self.sentence_index = VectorStore()  # 句子级

    async def retrieve(
        self,
        query: str,
        k: int = 5
    ) -> list:
        """层次化检索"""

        # 1. 粗粒度检索（章节）
        sections = await self.section_index.search(
            query,
            k=3,
            filter={"level": 1}
        )

        # 2. 中粒度检索（段落）- 限制在相关章节
        paragraphs = []
        for section in sections:
            section_paragraphs = await self.paragraph_index.search(
                query,
                k=2,
                filter={"section_id": section["id"]}
            )
            paragraphs.extend(section_paragraphs)

        # 3. 细粒度检索（句子）
        sentences = []
        for paragraph in paragraphs[:k]:
            para_sentences = await self.sentence_index.search(
                query,
                k=1,
                filter={"paragraph_id": paragraph["id"]}
            )
            sentences.extend(para_sentences)

        # 4. 融合排序
        ranked = self._fusion_rank(
            sections,
            paragraphs,
            sentences,
            weights=[0.2, 0.5, 0.3]
        )

        return ranked[:k]

    def _fusion_rank(
        self,
        sections,
        paragraphs,
        sentences,
        weights
    ) -> list:
        """融合排序"""

        scores = {}

        # 章节分数
        for sec in sections:
            scores[sec["id"]] = scores.get(sec["id"], 0) + (
                sec["score"] * weights[0]
            )

        # 段落分数
        for para in paragraphs:
            scores[para["id"]] = scores.get(para["id"], 0) + (
                para["score"] * weights[1]
            )

        # 句子分数
        for sent in sentences:
            scores[sent["id"]] = scores.get(sent["id"], 0) + (
                sent["score"] * weights[2]
            )

        # 排序
        ranked = sorted(
            scores.items(),
            key=lambda x: x[1],
            reverse=True
        )

        return [{"id": k, "score": v} for k, v in ranked]
```

### 面试问题 10：如何实现知识图谱增强？

**答案**：

```python
class KnowledgeGraphEnhancedRAG:
    """知识图谱增强的RAG"""

    def __init__(self):
        self.vector_store = VectorStore()
        self.graph_db = Neo4jDatabase()

    async def retrieve_with_graph(
        self,
        query: str,
        k: int = 5
    ) -> list:
        """图谱增强检索"""

        # 1. 实体识别
        entities = await self._extract_entities(query)

        # 2. 图谱查询
        graph_results = []
        for entity in entities:
            # 查询相关实体和关系
            subgraph = await self.graph_db.query("""
                MATCH (e {name: $entity})-[r]-(related)
                RETURN e, r, related
                LIMIT 10
            """, entity=entity)

            graph_results.append(subgraph)

        # 3. 向量检索
        vector_results = await self.vector_store.search(
            query,
            k=k
        )

        # 4. 图谱扩展
        # 找到向量结果中的实体，扩展其邻居
        expanded_results = []
        for result in vector_results:
            # 提取文档中的实体
            doc_entities = await self._extract_entities(
                result["content"]
            )

            # 查询邻居实体
            neighbors = []
            for entity in doc_entities:
                neighbor_docs = await self.vector_store.search(
                    entity,
                    k=2
                )
                neighbors.extend(neighbor_docs)

            expanded_results.append({
                "original": result,
                "neighbors": neighbors,
                "graph_context": graph_results
            })

        # 5. 重新排序
        reranked = self._rerank_with_graph(
            expanded_results,
            graph_results
        )

        return reranked[:k]

    async def _extract_entities(self, text: str) -> list:
        """实体提取"""

        # 使用NER模型
        entities = await self.ner_model.predict(text)

        # 过滤重要实体
        important_types = ["PERSON", "ORG", "PRODUCT", "TECH"]

        return [
            e["text"]
            for e in entities
            if e["label"] in important_types
        ]
```

---

## 项目四：多模态内容生成平台

### 项目背景

构建AI内容生成平台，支持文章、图片、视频、PPT等多种内容形式的生成和编辑。

### 面试问题 11：如何实现长文本生成？

**答案**：

```python
class LongContentGenerator:
    """长文本生成器"""

    def __init__(self):
        self.outline_generator = OutlineGenerator()
        self.section_generator = SectionGenerator()
        self.refinement_agent = RefinementAgent()

    async def generate_article(
        self,
        topic: str,
        requirements: dict
    ) -> dict:
        """生成长文"""

        # 1. 生成大纲
        outline = await self.outline_generator.generate(
            topic,
            requirements
        )

        # 2. 并行生成各个章节
        sections = []
        for section in outline["sections"]:
            content = await self.section_generator.generate(
                section["title"],
                section["points"],
                requirements["style"]
            )
            sections.append({
                "title": section["title"],
                "content": content
            })

        # 3. 生成引言和结论
        introduction = await self._generate_introduction(
            topic,
            sections
        )

        conclusion = await self._generate_conclusion(
            topic,
            sections
        )

        # 4. 组装
        article = {
            "title": outline["title"],
            "introduction": introduction,
            "sections": sections,
            "conclusion": conclusion
        }

        # 5. 审查和优化
        refined = await self.refinement_agent.refine(article)

        return refined

    async def _generate_introduction(
        self,
        topic: str,
        sections: list
    ) -> str:
        """生成引言"""

        section_titles = [s["title"] for s in sections]

        prompt = f"""
        主题：{topic}

        文章包含以下章节：
        {chr(10).join(f'- {t}' for t in section_titles)}

        请生成一个引人入胜的引言（200字左右）：
        - 吸引读者注意力
        - 概述文章内容
        - 说明阅读本文的价值
        """

        return await self.llm.predict(prompt)

    async def _generate_conclusion(
        self,
        topic: str,
        sections: list
    ) -> str:
        """生成结论"""

        section_summaries = [
            f"- {s['title']}: {self._summarize(s['content'])}"
            for s in sections
        ]

        prompt = f"""
        主题：{topic}

        文章要点：
        {chr(10).join(section_summaries)}

        请生成一个有力的结论（200字左右）：
        - 总结核心观点
        - 强调价值
        - 给出行动建议或展望
        """

        return await self.llm.predict(prompt)
```

### 面试问题 12：如何实现内容质量控制？

**答案**：

```python
class ContentQualityController:
    """内容质量控制器"""

    def __init__(self):
        self.checkers = [
            PlagiarismChecker(),
            FactualityChecker(),
            GrammarChecker(),
            StyleChecker(),
            SafetyChecker()
        ]

    async def validate_content(
        self,
        content: str,
        content_type: str
    ) -> dict:
        """验证内容质量"""

        results = {
            "passed": True,
            "score": 0,
            "issues": [],
            "suggestions": []
        }

        # 并行执行所有检查
        checks = await asyncio.gather(*[
            checker.check(content, content_type)
            for checker in self.checkers
        ])

        # 汇总结果
        total_score = 0
        for check in checks:
            results["issues"].extend(check.get("issues", []))
            results["suggestions"].extend(
                check.get("suggestions", [])
            )
            total_score += check.get("score", 0)

            if not check.get("passed", True):
                results["passed"] = False

        # 计算总分
        results["score"] = total_score / len(self.checkers)

        # 生成报告
        results["report"] = self._generate_report(results)

        return results

class FactualityChecker:
    """事实性检查器"""

    async def check(
        self,
        content: str,
        content_type: str
    ) -> dict:
        """检查事实准确性"""

        # 1. 提取事实性陈述
        facts = await self._extract_facts(content)

        # 2. 验证每个事实
        verified_facts = []
        for fact in facts:
            # 使用搜索引擎验证
            search_results = await self._search(fact)

            # 使用LLM判断
            is_factual = await self._verify_fact(
                fact,
                search_results
            )

            verified_facts.append({
                "fact": fact,
                "is_factual": is_factual,
                "sources": search_results[:2]
            })

        # 3. 计算分数
        factual_count = sum(
            1 for f in verified_facts
            if f["is_factual"]
        )

        score = factual_count / len(verified_facts) if verified_facts else 1.0

        issues = [
            {
                "type": "factual_error",
                "message": f"可能不准确：{f['fact']}",
                "severity": "high"
            }
            for f in verified_facts
            if not f["is_factual"]
        ]

        return {
            "passed": score >= 0.8,
            "score": score,
            "issues": issues,
            "verified_facts": verified_facts
        }

class SafetyChecker:
    """安全检查器"""

    async def check(
        self,
        content: str,
        content_type: str
    ) -> dict:
        """检查内容安全"""

        # 1. 敏感词检查
        sensitive_words = await self._check_sensitive_words(content)

        # 2. 版权检查
        copyright_issues = await self._check_copyright(content)

        # 3. 合规性检查
        compliance_issues = await self._check_compliance(content)

        issues = (
            sensitive_words +
            copyright_issues +
            compliance_issues
        )

        return {
            "passed": len(issues) == 0,
            "score": 1.0 if len(issues) == 0 else 0.5,
            "issues": issues
        }
```

---

## 项目面试常见问题汇总

### 技术选型类

**Q1: 如何选择技术栈？**

```python
# 示例：RAG系统技术选型

决策矩阵 = {
    "向量数据库": {
        "Pinecone": {"优点": "托管服务", "场景": "快速上线"},
        "Milvus": {"优点": "开源", "场景": "数据敏感"},
        "Qdrant": {"优点": "高性能", "场景": "高并发"}
    },

    "LLM": {
        "GPT-4": {"优点": "性能最强", "成本": "高"},
        "GPT-3.5": {"优点": "性价比", "成本": "中"},
        "Llama": {"优点": "隐私保护", "成本": "硬件"}
    },

    "框架": {
        "LangChain": {"优点": "生态成熟", "学习成本": "高"},
        "LlamaIndex": {"优点": "专注RAG", "学习成本": "低"}
    }
}

# 选型原则
选择标准 = [
    "团队能力匹配度",
    "项目规模和复杂度",
    "成本预算",
    "数据安全要求",
    "扩展性需求"
]
```

### 性能优化类

**Q2: 如何优化系统性能？**

```python
优化策略 = {
    "检索层": [
        "向量索引优化（HNSW/IVF）",
        "查询缓存（Redis）",
        "并行检索",
        "混合检索（向量+关键词）"
    ],

    "生成层": [
        "模型量化（4bit/8bit）",
        "流式输出",
        "批处理",
        "智能路由（简单任务用小模型）"
    ],

    "架构层": [
        "读写分离",
        "分片策略",
        "CDN加速",
        "边缘计算"
    ]
}
```

### 成本控制类

**Q3: 如何控制API成本？**

```python
成本优化方案 = {
    "缓存策略": {
        "方法": "相似问题复用答案",
        "效果": "节省40-60%成本"
    },

    "模型路由": {
        "方法": "简单任务用小模型",
        "效果": "节省50-70%成本"
    },

    "Prompt优化": {
        "方法": "精简Prompt，减少token",
        "效果": "节省20-30%成本"
    },

    "批处理": {
        "方法": "合并多个请求",
        "效果": "节省10-20%成本"
    }
}
```

### 监控与运维类

**Q4: 如何监控系统运行？**

```python
监控指标 = {
    "性能指标": {
        "响应时间": "P50/P95/P99",
        "吞吐量": "QPS",
        "错误率": "4xx/5xx比例"
    },

    "业务指标": {
        "用户满意度": "评分",
        "问题解决率": "首次解决率",
        "转人工率": "自动化率"
    },

    "成本指标": {
        "Token消耗": "日/月消耗",
        "API调用量": "按模型统计",
        "成本趋势": "同比/环比"
    },

    "质量指标": {
        "答案准确性": "人工抽检",
        "幻觉率": "事实错误比例",
        "相关性": "答案相关度"
    }
}

告警规则 = {
    "响应时间": "P99 > 5s",
    "错误率": "> 5%",
    "成本": "单日 > $1000",
    "满意度": "< 3.5/5"
}
```

---

## 面试技巧

### 1. STAR法则回答项目问题

```
S (Situation): 项目背景
  - 业务场景
  - 用户规模
  - 技术挑战

T (Task): 我的任务
  - 负责模块
  - 核心目标
  - 时间限制

A (Action): 我的行动
  - 技术选型
  - 架构设计
  - 具体实现
  - 遇到的问题及解决

R (Result): 项目成果
  - 量化指标（性能提升、成本降低）
  - 业务价值
  - 技术沉淀
```

### 2. 准备要点

```python
面试准备清单 = [
    "准备3个代表性项目",
    "每个项目准备技术难点",
    "准备优化案例和效果对比",
    "准备失败案例和反思",
    "准备架构图和流程图",
    "准备性能数据和业务指标"
]
```

### 3. 常见追问

```python
高频追问 = [
    "为什么选择这个技术方案？",
    "遇到了什么困难？如何解决的？",
    "如果有第二次机会，如何改进？",
    "系统如何扩展到10倍流量？",
    "如何保证数据安全？",
    "如何监控和运维？"
]
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
