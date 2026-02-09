# 实战项目 {#-附录c2024-2026企业级ai实战项目}

## 本章导读

恭喜你来到最后一章！本章将通过3个完整的实战项目，综合运用前面学到的知识，构建生产级的AI应用。

**学习目标**：
- 综合运用LLM、LangChain、RAG、Agent等技术
- 构建完整的AI应用系统
- 掌握项目部署和优化技巧
- 积累实战经验

**项目概览**：
1. **智能文档问答系统** - RAG应用
2. **代码助手Agent** - Agent应用
3. **个人知识库助手** - 综合应用

---

## 项目1：智能文档问答系统

### 项目概述

**功能**：
- 上传PDF/Word/TXT文档
- 自动构建向量数据库
- 智能问答，支持溯源
- 多文档管理

**技术栈**：
- FastAPI（Web框架）
- LangChain（AI框架）
- Chroma（向量数据库）
- Streamlit（前端界面）

### 项目结构

```
document-qa-system/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI主程序
│   ├── models.py            # 数据模型
│   ├── rag.py               # RAG核心逻辑
│   └── config.py            # 配置文件
├── data/
│   └── documents/           # 存储上传的文档
├── vector_db/
│   └── chroma/              # 向量数据库
├── ui/
│   └── streamlit_app.py     # Streamlit界面
├── requirements.txt
└── README.md
```

### 后端实现

**1. 配置文件 (`app/config.py`)**

```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # API配置
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = "gpt-3.5-turbo"
    OPENAI_EMBEDDINGS = "text-embedding-3-small"

    # 数据库配置
    CHROMA_PERSIST_DIR = "./vector_db/chroma"

    # 文档配置
    UPLOAD_DIR = "./data/documents"
    ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    # RAG配置
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    TOP_K_RETRIEVAL = 3
```

**2. RAG核心逻辑 (`app/rag.py`)**

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.document_loaders import (
    PyPDFLoader,
    TextLoader,
    UnstructuredMarkdownLoader,
    Docx2txtLoader
)
from pathlib import Path
from typing import List, Optional
import shutil

class DocumentQA:
    """文档问答系统"""

    def __init__(self, collection_name: str = "default"):
        self.collection_name = collection_name
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=Config.OPENAI_API_KEY
        )
        self.llm = ChatOpenAI(
            model=Config.OPENAI_MODEL,
            openai_api_key=Config.OPENAI_API_KEY,
            temperature=0
        )

        # 初始化向量数据库
        self.vectorstore = Chroma(
            collection_name=collection_name,
            persist_directory=Config.CHROMA_PERSIST_DIR,
            embedding_function=self.embeddings
        )

        # 创建QA链
        self.qa_chain = self._create_qa_chain()

    def _create_qa_chain(self):
        """创建QA链"""
        prompt_template = """基于以下上下文回答问题。

上下文：
{context}

问题：{question}

回答要求：
1. 只使用上下文中的信息
2. 如果上下文中没有答案，明确说明
3. 回答要准确、简洁
4. 标注信息来源

回答："""

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )

        return RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever(
                search_kwargs={"k": Config.TOP_K_RETRIEVAL}
            ),
            return_source_documents=True,
            chain_type_kwargs={"prompt": prompt}
        )

    def add_document(self, file_path: str) -> dict:
        """添加文档到知识库"""
        try:
            # 1. 根据文件类型选择加载器
            ext = Path(file_path).suffix.lower()

            loaders = {
                ".pdf": PyPDFLoader,
                ".txt": TextLoader,
                ".md": UnstructuredMarkdownLoader,
                ".docx": Docx2txtLoader
            }

            if ext not in loaders:
                return {"success": False, "error": "不支持的文件格式"}

            loader = loaders[ext](file_path)
            documents = loader.load()

            # 2. 分割文档
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=Config.CHUNK_SIZE,
                chunk_overlap=Config.CHUNK_OVERLAP
            )
            splits = text_splitter.split_documents(documents)

            # 3. 添加到向量数据库
            for split in splits:
                split.metadata["source"] = Path(file_path).name

            self.vectorstore.add_documents(splits)

            return {
                "success": True,
                "message": f"成功添加 {len(splits)} 个文档块",
                "chunks": len(splits)
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    def ask(self, question: str) -> dict:
        """提问"""
        try:
            result = self.qa_chain({"query": question})

            # 提取来源
            sources = [
                {
                    "source": doc.metadata.get("source", "Unknown"),
                    "page": doc.metadata.get("page", 0),
                    "content": doc.page_content[:200] + "..."
                }
                for doc in result["source_documents"]
            ]

            return {
                "success": True,
                "answer": result["result"],
                "sources": sources
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    def delete_collection(self):
        """删除当前集合"""
        self.vectorstore.delete_collection()
        self.vectorstore = Chroma(
            collection_name=self.collection_name,
            persist_directory=Config.CHROMA_PERSIST_DIR,
            embedding_function=self.embeddings
        )

    def get_stats(self) -> dict:
        """获取知识库统计信息"""
        collection = self.vectorstore._collection
        return {
            "total_documents": collection.count(),
            "collection_name": self.collection_name
        }
```

**3. FastAPI主程序 (`app/main.py`)**

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import shutil
from pathlib import Path

from .rag import DocumentQA
from .config import Config

app = FastAPI(title="智能文档问答系统")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 存储QA实例
qa_instances = {}

class Question(BaseModel):
    question: str
    collection_name: str = "default"

@app.on_event("startup")
async def startup():
    """启动时创建上传目录"""
    Path(Config.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    Path(Config.CHROMA_PERSIST_DIR).mkdir(parents=True, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "智能文档问答系统API"}

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    collection_name: str = "default"
):
    """上传文档"""
    # 验证文件格式
    ext = Path(file.filename).suffix.lower()
    if ext not in Config.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="不支持的文件格式")

    # 保存文件
    file_path = Path(Config.UPLOAD_DIR) / f"{collection_name}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 添加到知识库
    qa = qa_instances.get(collection_name)
    if not qa:
        qa = DocumentQA(collection_name)
        qa_instances[collection_name] = qa

    result = qa.add_document(str(file_path))

    return result

@app.post("/ask")
async def ask_question(req: Question):
    """提问"""
    qa = qa_instances.get(req.collection_name)
    if not qa:
        raise HTTPException(status_code=404, detail="知识库不存在")

    result = qa.ask(req.question)
    return result

@app.get("/stats/{collection_name}")
async def get_stats(collection_name: str):
    """获取统计信息"""
    qa = qa_instances.get(collection_name)
    if not qa:
        raise HTTPException(status_code=404, detail="知识库不存在")

    return qa.get_stats()

@app.delete("/collection/{collection_name}")
async def delete_collection(collection_name: str):
    """删除知识库"""
    qa = qa_instances.get(collection_name)
    if qa:
        qa.delete_collection()
        del qa_instances[collection_name]

    return {"message": "知识库已删除"}
```

### 前端界面

**Streamlit界面 (`ui/streamlit_app.py`)**

```python
import streamlit as st
import requests
from pathlib import Path

# 配置
API_URL = "http://localhost:8000"
st.set_page_config(
    page_title="智能文档问答系统",
    page_icon="📚",
    layout="wide"
)

# 侧边栏
st.sidebar.title("📚 文档管理")

# 上传文档
uploaded_file = st.sidebar.file_uploader(
    "上传文档",
    type=["pdf", "txt", "md", "docx"]
)

collection_name = st.sidebar.text_input("知识库名称", value="default")

if uploaded_file and st.sidebar.button("添加到知识库"):
    with st.sidebar.spinner("处理中..."):
        files = {"file": uploaded_file}
        response = requests.post(
            f"{API_URL}/upload",
            files=files,
            params={"collection_name": collection_name}
        )

        if response.status_code == 200:
            st.sidebar.success(response.json()["message"])
        else:
            st.sidebar.error("上传失败")

# 统计信息
stats_response = requests.get(f"{API_URL}/stats/{collection_name}")
if stats_response.status_code == 200:
    stats = stats_response.json()
    st.sidebar.metric("文档块数", stats["total_documents"])

# 主界面
st.title("🤖 智能文档问答系统")

# 问答区域
question = st.text_input("请输入你的问题：", placeholder="例如：文档中提到了什么...")

if st.button("提问") and question:
    with st.spinner("思考中..."):
        response = requests.post(
            f"{API_URL}/ask",
            json={
                "question": question,
                "collection_name": collection_name
            }
        )

        if response.status_code == 200:
            result = response.json()

            st.markdown("### 📝 回答")
            st.write(result["answer"])

            if "sources" in result and result["sources"]:
                st.markdown("### 📚 信息来源")
                for i, source in enumerate(result["sources"], 1):
                    with st.expander(f"来源 {i}: {source['source']}"):
                        st.write(source["content"])
        else:
            st.error("查询失败")

# 使用说明
with st.expander("💡 使用说明"):
    st.markdown("""
    1. **上传文档**：在左侧上传PDF、TXT、Markdown或Word文档
    2. **构建知识库**：系统会自动处理文档并建立索引
    3. **提问**：输入问题，系统会基于文档内容回答
    4. **溯源**：查看答案的来源，确保准确性

    **支持的文件格式**：
    - PDF（.pdf）
    - 文本（.txt）
    - Markdown（.md）
    - Word文档（.docx）
    """)
```

### 部署和运行

```bash
# 1. 安装依赖
pip install fastapi uvicorn streamlit langchain langchain-openai chromadb

# 2. 启动后端
uvicorn app.main:app --reload --port 8000

# 3. 启动前端
streamlit run ui/streamlit_app.py

# 4. 访问
# 前端：http://localhost:8501
# API文档：http://localhost:8000/docs
```

---

## 项目2：代码助手Agent

### 项目概述

**功能**：
- 代码生成和优化
- Bug检测和修复
- 代码解释
- 技术文档查询

**技术栈**：
- LangChain Agents
- OpenAI API
- GitHub API
- Python AST（代码分析）

### 实现代码

```python
# code_agent.py
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from langchain.tools import Tool, StructuredTool
from langchain import hub
from pydantic import BaseModel, Field
import subprocess
import ast
import requests
import os

class CodeInput(BaseModel):
    """代码输入"""
    code: str = Field(description="要处理的Python代码")
    question: str = Field(description="关于代码的问题")

class CodeAgent:
    """代码助手Agent"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
        self.tools = self._create_tools()
        self.agent = self._create_agent()

    def _create_tools(self):
        """创建工具集"""

        # 1. 代码执行工具
        def execute_code(code: str) -> str:
            """执行Python代码"""
            try:
                result = subprocess.run(
                    ["python", "-c", code],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                if result.returncode == 0:
                    return f"输出：\n{result.stdout}"
                else:
                    return f"错误：\n{result.stderr}"
            except Exception as e:
                return f"执行失败：{str(e)}"

        # 2. 代码分析工具
        def analyze_code(code: str) -> str:
            """分析代码结构"""
            try:
                tree = ast.parse(code)

                functions = []
                classes = []
                imports = []

                for node in ast.walk(tree):
                    if isinstance(node, ast.FunctionDef):
                        functions.append(node.name)
                    elif isinstance(node, ast.ClassDef):
                        classes.append(node.name)
                    elif isinstance(node, (ast.Import, ast.ImportFrom)):
                        if isinstance(node, ast.Import):
                            imports.extend([alias.name for alias in node.names])
                        else:
                            imports.append(node.module)

                return f"""
                代码结构分析：
                - 函数：{', '.join(functions) if functions else '无'}
                - 类：{', '.join(classes) if classes else '无'}
                - 导入模块：{', '.join(set(imports)) if imports else '无'}
                """
            except Exception as e:
                return f"分析失败：{str(e)}"

        # 3. 代码格式化工具
        def format_code(code: str) -> str:
            """格式化代码"""
            try:
                import black
                formatted = black.format_str(code, mode=black.Mode())
                return f"格式化后的代码：\n{formatted}"
            except:
                return "格式化失败，请确保代码语法正确"

        # 4. 生成测试用例工具
        def generate_tests(code: str) -> str:
            """为代码生成测试用例"""
            prompt = f"""
            为以下代码生成单元测试（使用pytest）：
            {code}

            要求：
            - 测试正常情况
            - 测试边界情况
            - 测试异常情况
            """
            # 调用LLM生成
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model="gpt-3.5-turbo")
            return llm.predict(prompt)

        # 5. GitHub搜索工具
        def search_github(query: str) -> str:
            """搜索GitHub代码"""
            # 这里需要GitHub Token
            token = os.getenv("GITHUB_TOKEN")
            if not token:
                return "需要设置GITHUB_TOKEN环境变量"

            url = "https://api.github.com/search/code"
            params = {"q": query}
            headers = {"Authorization": f"token {token}"}

            response = requests.get(url, params=params, headers=headers)
            if response.status_code == 200:
                data = response.json()
                results = data.get("items", [])[:5]

                output = []
                for item in results:
                    output.append(f"""
                    - 仓库：{item['repository']['full_name']}
                    - 文件：{item['path']}
                    - URL：{item['html_url']}
                    """)

                return "\n".join(output)
            else:
                return "搜索失败"

        # 创建工具列表
        return [
            Tool(
                name="ExecuteCode",
                func=execute_code,
                description="执行Python代码并返回结果。输入：完整的Python代码字符串"
            ),
            Tool(
                name="AnalyzeCode",
                func=analyze_code,
                description="分析Python代码的结构，提取函数、类和导入信息。输入：Python代码"
            ),
            Tool(
                name="FormatCode",
                func=format_code,
                description="使用Black格式化Python代码。输入：需要格式化的代码"
            ),
            Tool(
                name="GenerateTests",
                func=generate_tests,
                description="为Python代码生成pytest测试用例。输入：需要测试的代码"
            ),
            Tool(
                name="SearchGitHub",
                func=search_github,
                description="在GitHub上搜索代码示例。输入：搜索关键词"
            )
        ]

    def _create_agent(self):
        """创建Agent"""
        prompt = hub.pull("hwchase17/openai-functions-agent")

        agent = create_openai_functions_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=prompt
        )

        return AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,
            max_iterations=10
        )

    def assist(self, request: str) -> str:
        """代码助手"""
        result = self.agent.invoke({"input": request})
        return result["output"]

# 使用示例
if __name__ == "__main__":
    agent = CodeAgent()

    # 示例1：代码解释
    print(agent.assist("""
    解释以下代码的作用：
    def quicksort(arr):
        if len(arr) <= 1:
            return arr
        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]
        return quicksort(left) + middle + quicksort(right)
    """))

    # 示例2：Bug检测
    print(agent.assist("""
    检查以下代码是否有Bug：
    for i in range(len(arr)):
        if arr[i] > arr[i+1]:
            arr[i], arr[i+1] = arr[i+1], arr[i]
    """))

    # 示例3：代码优化
    print(agent.assist("""
    优化以下代码的性能：
    squares = []
    for i in range(1000000):
        squares.append(i ** 2)
    """))
```

---

## 项目3：个人知识库助手

### 项目概述

**功能**：
- 笔记管理（增删改查）
- 智能问答
- 知识关联
- 定期复习提醒

**技术栈**：
- RAG（知识检索）
- Agent（任务自动化）
- Notion API（笔记同步）

### 核心实现

```python
# knowledge_assistant.py
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.tools import Tool
from langchain.memory import ConversationBufferMemory
from datetime import datetime, timedelta
import json
from pathlib import Path

class KnowledgeAssistant:
    """个人知识库助手"""

    def __init__(self, knowledge_base_path: str = "./knowledge_base"):
        self.kb_path = Path(knowledge_base_path)
        self.kb_path.mkdir(parents=True, exist_ok=True)

        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            persist_directory=str(self.kb_path / "chroma"),
            embedding_function=self.embeddings
        )

        self.memory = ConversationBufferMemory()
        self.agent = self._create_agent()

    def _create_agent(self):
        """创建Agent"""

        # 工具1：添加笔记
        def add_note(title: str, content: str, tags: list = None) -> str:
            """添加笔记到知识库"""
            note = {
                "title": title,
                "content": content,
                "tags": tags or [],
                "created_at": datetime.now().isoformat()
            }

            # 保存到文件
            note_path = self.kb_path / "notes" / f"{title}.json"
            note_path.parent.mkdir(exist_ok=True)
            with open(note_path, "w", encoding="utf-8") as f:
                json.dump(note, f, ensure_ascii=False, indent=2)

            # 添加到向量数据库
            from langchain.schema import Document
            doc = Document(
                page_content=content,
                metadata={"title": title, "tags": tags or [], "source": str(note_path)}
            )
            self.vectorstore.add_documents([doc])

            return f"笔记'{title}'已添加，标签：{', '.join(tags or [])}"

        # 工具2：搜索笔记
        def search_notes(query: str, top_k: int = 5) -> str:
            """搜索相关笔记"""
            results = self.vectorstore.similarity_search(query, k=top_k)

            output = []
            for i, doc in enumerate(results, 1):
                output.append(f"""
                笔记{i}：{doc.metadata.get('title', 'Untitled')}
                标签：{', '.join(doc.metadata.get('tags', []))}
                内容：{doc.page_content[:200]}...
                """)

            return "\n".join(output) if output else "未找到相关笔记"

        # 工具3：列出所有笔记
        def list_notes() -> str:
            """列出所有笔记"""
            notes_dir = self.kb_path / "notes"
            if not notes_dir.exists():
                return "知识库为空"

            notes = list(notes_dir.glob("*.json"))
            output = [f"共有 {len(notes)} 条笔记："]

            for note_path in notes:
                with open(note_path, "r", encoding="utf-8") as f:
                    note = json.load(f)
                output.append(f"- {note['title']}（标签：{', '.join(note['tags'])}）")

            return "\n".join(output)

        # 工具4：生成复习计划
        def create_review_plan(days: int = 7) -> str:
            """生成复习计划"""
            # 使用间隔重复算法
            notes_dir = self.kb_path / "notes"
            notes = list(notes_dir.glob("*.json"))

            plan = []
            today = datetime.now()

            for note_path in notes:
                with open(note_path, "r", encoding="utf-8") as f:
                    note = json.load(f)

                # 简单的间隔重复逻辑
                created = datetime.fromisoformat(note['created_at'])
                days_since = (today - created).days

                if days_since >= days:
                    review_date = today + timedelta(days=1)
                    plan.append(f"{review_date.strftime('%Y-%m-%d')}: 复习《{note['title']}》")

            return "复习计划：\n" + "\n".join(plan) if plan else "暂无需要复习的内容"

        # 创建工具
        tools = [
            Tool(
                name="AddNote",
                func=lambda x: add_note(**json.loads(x)),
                description="添加笔记到知识库。输入JSON格式：{'title': '标题', 'content': '内容', 'tags': ['标签1', '标签2']}"
            ),
            Tool(
                name="SearchNotes",
                func=search_notes,
                description="在知识库中搜索笔记。输入：搜索关键词"
            ),
            Tool(
                name="ListNotes",
                func=list_notes,
                description="列出所有笔记"
            ),
            Tool(
                name="CreateReviewPlan",
                func=lambda x: create_review_plan(int(x) if x else 7),
                description="生成复习计划。输入：间隔天数（默认7天）"
            )
        ]

        # 创建Agent
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
        from langchain import hub
        prompt = hub.pull("hwchase17/openai-functions-agent")

        agent = create_openai_functions_agent(
            llm=llm,
            tools=tools,
            prompt=prompt
        )

        return AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=True,
            memory=self.memory
        )

    def chat(self, message: str) -> str:
        """对话"""
        result = self.agent.invoke({"input": message})
        return result["output"]

# 使用示例
if __name__ == "__main__":
    assistant = KnowledgeAssistant()

    # 示例对话
    print(assistant.chat("帮我添加一条Python装饰器的笔记"))
    print(assistant.chat("搜索关于机器学习的笔记"))
    print(assistant.chat("生成本周的复习计划"))
```

---

## 项目部署和优化

### Docker部署

**Dockerfile**:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 暴露端口
EXPOSE 8000 8501

# 启动命令
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000 & streamlit run ui/streamlit_app.py --server.port 8501"]
```

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
      - "8501:8501"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./data:/app/data
      - ./vector_db:/app/vector_db
    restart: unless-stopped
```

### 性能优化

```python
# 1. 使用缓存
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_embedding(text: str):
    return embeddings.embed_query(text)

# 2. 批量处理
def batch_add_documents(docs: list, batch_size=100):
    for i in range(0, len(docs), batch_size):
        batch = docs[i:i+batch_size]
        vectorstore.add_documents(batch)

# 3. 异步处理
import asyncio
from langchain.runnables import RunnableConfig

async def async_ask(question: str):
    config = RunnableConfig(callbacks=[...])
    return await rag_chain.ainvoke(question, config)
```

### 安全建议

```python
# 1. API密钥管理
import os
from dotenv import load_dotenv
load_dotenv()

# 2. 输入验证
from pydantic import validator

class Question(BaseModel):
    question: str

    @validator('question')
    def question_length(cls, v):
        if len(v) > 1000:
            raise ValueError('问题长度不能超过1000字符')
        return v

# 3. 速率限制
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/ask")
@limiter.limit("10/minute")
async def ask_question(req: Question):
    ...
```

---

## 本章小结

### 项目回顾

✅ **项目1：智能文档问答系统**
- 完整的RAG实现
- Web界面部署
- 多格式文档支持

✅ **项目2：代码助手Agent**
- 工具定义和使用
- 代码分析能力
- GitHub集成

✅ **项目3：个人知识库助手**
- RAG + Agent结合
- 笔记管理
- 复习计划

### 学习成果

恭喜你！通过本章的学习，你已经能够：

- ✅ 独立构建完整的AI应用
- ✅ 集成多种AI技术
- ✅ 部署生产级系统
- ✅ 优化性能和安全性

---

## 下一步学习

### 推荐资源

**框架和工具**：
- LangChain官方文档：https://python.langchain.com
- LlamaIndex：https://docs.llamaindex.ai
- Haystack：https://haystack.deepset.ai

**进阶主题**：
- 多模态AI（图像、音频）
- 微调大模型
- 生产环境部署
- AI应用安全

**实践建议**：
1. 从小项目开始，逐步扩展
2. 参与开源项目
3. 加入AI开发者社区
4. 持续学习新技术

---

---

# 附录C：2024-2026企业级AI实战项目

> **2024-2026 AI技术趋势**
>
> 根据最新技术分析，AI应用开发正在经历从实验到生产的转变：
> - **2024**：AI应用的爆发元年
> - **2025**：Agent框架标准化，Multi-Agent系统成为主流
> - **2026**：AI Agent成为企业级应用的标准配置
>
> 基于这些趋势，我们新增 **4个企业级AI实战项目**，涵盖Multi-Agent、生产级RAG、Agent+RAG结合等前沿技术。

---

## 项目4：Multi-Agent协作系统

### 技术栈（2024-2026主流）

基于[Multi-Agent框架预测](https://medium.com/@akaivdo/multi-agent-frameworks-in-2025-and-2026-predictions-eaf7a5006f24)：

```
🐍 Python 3.11+
🤖 LangGraph（复杂Agent编排）
🔄 AutoGen（Multi-Agent协作）
📊 CrewAI（角色-based Agent）
🔍 Tavily（AI搜索）
🌐 FastAPI
🎨 Chainlit（对话界面）
🦙 Llama 3（本地模型）
```

### 项目简介

一个复杂的Multi-Agent协作系统，模拟真实企业的内容生产流程。

**核心Agent角色**：
```
👔 项目经理Agent：协调各Agent，管理项目进度
🔬 研究员Agent：网络搜索、信息收集、数据分析
✍️ 作者Agent：内容创作、文案生成、格式化
🎨 设计师Agent：图像生成、视觉设计、排版
🔍 审核员Agent：质量检查、事实核查、合规审查
📊 分析师Agent：数据分析、报告生成、趋势预测
```

### 项目架构

```python
# multi_agent_system.py
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import TypedDict, Annotated, List
import operator

class AgentState(TypedDict):
    """Multi-Agent系统状态"""
    messages: Annotated[List[str], operator.add]
    current_step: str
    research_data: dict
    content: str
    review_result: dict
    final_output: dict

class MultiAgentSystem:
    """Multi-Agent协作系统"""

    def __init__(self):
        self.pm_agent = ProjectManagerAgent()
        self.researcher = ResearcherAgent()
        self.writer = WriterAgent()
        self.designer = DesignerAgent()
        self.reviewer = ReviewerAgent()
        self.analyst = AnalystAgent()

        self.workflow = self._create_workflow()

    def _create_workflow(self) -> StateGraph:
        """创建工作流"""
        workflow = StateGraph(AgentState)

        # 添加节点
        workflow.add_node("plan", self._plan_node)
        workflow.add_node("research", self._research_node)
        workflow.add_node("write", self._write_node)
        workflow.add_node("design", self._design_node)
        workflow.add_node("review", self._review_node)
        workflow.add_node("analyze", self._analyze_node)

        # 设置入口点
        workflow.set_entry_point("plan")

        # 添加边（工作流程）
        workflow.add_edge("plan", "research")
        workflow.add_edge("research", "write")
        workflow.add_edge("write", "design")
        workflow.add_edge("design", "review")

        # 条件边：审核通过则分析，否则重新写作
        workflow.add_conditional_edges(
            "review",
            self._should_proceed,
            {
                "analyze": "analyze",
                "rewrite": "write"
            }
        )

        workflow.add_edge("analyze", END)

        return workflow.compile()

    def _plan_node(self, state: AgentState) -> AgentState:
        """项目经理：制定计划"""
        plan = self.pm_agent.create_plan(state["messages"][0])
        return {
            **state,
            "messages": state["messages"] + [f"计划：{plan}"],
            "current_step": "planning"
        }

    def _research_node(self, state: AgentState) -> AgentState:
        """研究员：收集信息"""
        research = self.researcher.research(state["messages"][0])
        return {
            **state,
            "research_data": research,
            "messages": state["messages"] + ["研究完成"],
            "current_step": "research"
        }

    def _write_node(self, state: AgentState) -> AgentState:
        """作者：创作内容"""
        content = self.writer.write(state["research_data"])
        return {
            **state,
            "content": content,
            "messages": state["messages"] + ["创作完成"],
            "current_step": "writing"
        }

    def _design_node(self, state: AgentState) -> AgentState:
        """设计师：视觉设计"""
        design = self.designer.create_visuals(state["content"])
        return {
            **state,
            "messages": state["messages"] + [f"设计完成：{design}"],
            "current_step": "designing"
        }

    def _review_node(self, state: AgentState) -> AgentState:
        """审核员：质量检查"""
        review = self.reviewer.review(state["content"])
        return {
            **state,
            "review_result": review,
            "messages": state["messages"] + ["审核完成"],
            "current_step": "reviewing"
        }

    def _analyze_node(self, state: AgentState) -> AgentState:
        """分析师：数据分析"""
        analysis = self.analyst.analyze(state)
        return {
            **state,
            "final_output": analysis,
            "messages": state["messages"] + ["分析完成"],
            "current_step": "analyzing"
        }

    def _should_proceed(self, state: AgentState) -> str:
        """判断是否继续"""
        if state["review_result"]["approved"]:
            return "analyze"
        else:
            return "rewrite"

    def run(self, user_request: str) -> dict:
        """运行Multi-Agent系统"""
        initial_state: AgentState = {
            "messages": [user_request],
            "current_step": "start",
            "research_data": {},
            "content": "",
            "review_result": {},
            "final_output": {}
        }

        result = self.workflow.invoke(initial_state)
        return result

# Agent实现
class ProjectManagerAgent:
    """项目经理Agent"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4-turbo-preview")

    def create_plan(self, request: str) -> str:
        """创建项目计划"""
        # 使用LLM生成详细计划
        pass

class ResearcherAgent:
    """研究员Agent"""

    def __init__(self):
        self.tools = [
            TavilySearch(max_results=5),
            WikipediaQueryRun(),
        ]
        self.llm = ChatOpenAI(model="gpt-4-turbo-preview")

    def research(self, topic: str) -> dict:
        """进行深度研究"""
        # 使用搜索工具收集信息
        pass

class WriterAgent:
    """作者Agent"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.8)

    def write(self, research_data: dict) -> str:
        """基于研究数据创作"""
        pass

class DesignerAgent:
    """设计师Agent"""

    def __init__(self):
        # DALL-E 3或Stable Diffusion
        pass

    def create_visuals(self, content: str) -> dict:
        """创建视觉内容"""
        pass

class ReviewerAgent:
    """审核员Agent"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4-turbo-preview")

    def review(self, content: str) -> dict:
        """审核内容质量"""
        pass

class AnalystAgent:
    """分析师Agent"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4-turbo-preview")

    def analyze(self, state: AgentState) -> dict:
        """分析整体结果"""
        pass
```

### 运行示例

```python
# example.py
from multi_agent_system import MultiAgentSystem

# 创建系统
system = MultiAgentSystem()

# 运行
result = system.run(
    "创建一篇关于量子计算最新进展的技术文章，包含图表和数据分析"
)

# 查看结果
print(result["final_output"])
```

---

## 项目5：生产级RAG系统

### 技术栈

```
🔍 LangChain 0.2+
📊 Pinecone/Weaviate（向量数据库）
🤖 OpenAI/Claude（Embeddings）
🌐 FastAPI
🎨 Streamlit
📦 pgvector（PostgreSQL向量扩展）
🔄 LangSmith（监控和调试）
```

### 核心功能

```
📚 多源文档导入（PDF、Web、Database）
🔍 混合搜索（向量+关键词）
🎯 智能分块和索引
💬 多轮对话上下文
📊 引用溯源
🔐 权限控制
📈 性能监控
🚀 流式响应
```

### 项目架构

```python
# production_rag/system.py
from langchain.vectorstores import Pinecone
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI

class ProductionRAG:
    """生产级RAG系统"""

    def __init__(self):
        # 初始化embeddings
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-large",
            chunk_size=1000
        )

        # 初始化向量数据库
        self.vectorstore = Pinecone(
            index_name="documents",
            embedding_function=self.embeddings
        )

        # 初始化LLM
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0,
            streaming=True
        )

        # 初始化对话记忆
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )

        # 创建QA链
        self.qa_chain = self._create_chain()

    def _create_chain(self):
        """创建QA链"""
        retriever = self.vectorstore.as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={
                "k": 5,
                "score_threshold": 0.7
            }
        )

        return ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=retriever,
            memory=self.memory,
            return_source_documents=True,
            verbose=True
        )

    async def add_documents(self, documents: List[Document]):
        """添加文档到知识库"""
        # 智能分块
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )

        splits = text_splitter.split_documents(documents)

        # 批量添加到向量数据库
        await self.vectorstore.aadd_documents(splits)

    async def query(self, question: str) -> dict:
        """查询知识库"""
        result = await self.qa_chain.ainvoke({"question": question})

        # 提取来源
        sources = [
            {
                "content": doc.page_content[:200],
                "metadata": doc.metadata
            }
            for doc in result["source_documents"]
        ]

        return {
            "answer": result["answer"],
            "sources": sources,
            "chat_history": self.memory.chat_memory.messages
        }
```

### 高级特性

**1. 混合搜索（向量+关键词）**

```python
from langchain.retrievers import BM25Retriever, EnsembleRetriever

class HybridSearchRAG(ProductionRAG):
    """混合搜索RAG系统"""

    def __init__(self):
        super().__init__()

        # 向量检索器
        vector_retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": 5}
        )

        # 关键词检索器
        bm25_retriever = BM25Retriever.from_documents(
            documents=self.documents,
            k=5
        )

        # 集成检索器
        self.ensemble_retriever = EnsembleRetriever(
            retrievers=[vector_retriever, bm25_retriever],
            weights=[0.5, 0.5]
        )
```

**2. 重排序（Reranking）**

```python
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

class RerankingRAG(ProductionRAG):
    """带重排序的RAG系统"""

    def __init__(self):
        super().__init__()

        # 初始化重排序模型
        self.reranker = HuggingFaceCrossEncoder(
            model_name="BAAI/bge-reranker-large"
        )

    async def query_with_reranking(self, question: str) -> dict:
        """查询并重排序"""
        # 第一阶段：检索
        docs = await self.vectorstore.asimilarity_search(question, k=20)

        # 第二阶段：重排序
        reranked_docs = self.reranker.rank(
            query=question,
            documents=docs,
            top_k=5
        )

        # 第三阶段：生成答案
        answer = await self.llm.agenerate([
            f"基于以下文档回答问题：\n\n{reranked_docs}\n\n问题：{question}"
        ])

        return {"answer": answer, "sources": reranked_docs}
```

**3. 查询扩展**

```python
class QueryExpansionRAG(ProductionRAG):
    """查询扩展RAG系统"""

    async def expand_query(self, query: str) -> List[str]:
        """扩展查询"""
        # 使用LLM生成多个查询变体
        prompt = f"""
        生成以下查询的3个不同版本，以改善搜索结果：

        原始查询：{query}

        扩展查询：
        """

        response = await self.llm.ainvoke(prompt)
        return [query] + response.strip().split("\n")

    async def query_with_expansion(self, question: str) -> dict:
        """使用查询扩展"""
        # 扩展查询
        expanded_queries = await self.expand_query(question)

        # 对每个查询进行检索
        all_docs = []
        for query in expanded_queries:
            docs = await self.vectorstore.asimilarity_search(query, k=3)
            all_docs.extend(docs)

        # 去重和排序
        unique_docs = self._deduplicate_and_rank(all_docs)

        # 生成答案
        answer = await self._generate_answer(question, unique_docs)

        return {"answer": answer, "sources": unique_docs}
```

---

## 项目6：Agent + RAG 结合系统

### 技术栈

```
🤖 LangGraph（Agent编排）
🔍 RAG系统（知识检索）
🛠️ Function Calling（工具调用）
📊 Tavily（实时搜索）
🌐 FastAPI
🎨 Chainlit
```

### 项目简介

一个结合Agent和RAG的智能助手，既能使用工具，又能检索知识库。

### 核心架构

```python
# agent_rag_system.py
from langgraph.graph import StateGraph, END
from langchain.tools import Tool
from typing import TypedDict, List

class AgentRAGState(TypedDict):
    """Agent+RAG状态"""
    messages: List[str]
    user_query: str
    rag_context: str
    tool_results: dict
    final_answer: str

class AgentRAGSystem:
    """Agent+RAG结合系统"""

    def __init__(self):
        self.rag_system = ProductionRAG()
        self.tools = self._create_tools()
        self.workflow = self._create_workflow()

    def _create_tools(self) -> List[Tool]:
        """创建工具集"""
        tools = [
            Tool(
                name="KnowledgeBase",
                func=self._query_knowledge_base,
                description="查询知识库获取信息"
            ),
            Tool(
                name="WebSearch",
                func=self._web_search,
                description="搜索网络获取最新信息"
            ),
            Tool(
                name="Calculator",
                func=self._calculator,
                description="执行数学计算"
            ),
            Tool(
                name="Database",
                func=self._query_database,
                description="查询数据库"
            )
        ]
        return tools

    def _create_workflow(self) -> StateGraph:
        """创建工作流"""
        workflow = StateGraph(AgentRAGState)

        # 添加节点
        workflow.add_node("analyze_query", self._analyze_query_node)
        workflow.add_node("rag_retrieve", self._rag_retrieve_node)
        workflow.add_node("tool_execute", self._tool_execute_node)
        workflow.add_node("synthesize", self._synthesize_node)

        # 设置入口
        workflow.set_entry_point("analyze_query")

        # 添加边
        workflow.add_conditional_edges(
            "analyze_query",
            self._decide_approach,
            {
                "rag": "rag_retrieve",
                "tools": "tool_execute",
                "both": "rag_retrieve"  # 先RAG再tools
            }
        )

        workflow.add_edge("rag_retrieve", "tool_execute")
        workflow.add_edge("tool_execute", "synthesize")
        workflow.add_edge("synthesize", END)

        return workflow.compile()

    def _analyze_query_node(self, state: AgentRAGState) -> AgentRAGState:
        """分析查询节点"""
        # 使用LLM分析查询类型
        analysis = self._analyze_query_type(state["user_query"])

        return {
            **state,
            "messages": state["messages"] + [f"查询分析：{analysis}"]
        }

    def _rag_retrieve_node(self, state: AgentRAGState) -> AgentRAGState:
        """RAG检索节点"""
        result = self.rag_system.query(state["user_query"])

        return {
            **state,
            "rag_context": result["answer"],
            "messages": state["messages"] + ["RAG检索完成"]
        }

    def _tool_execute_node(self, state: AgentRAGState) -> AgentRAGState:
        """工具执行节点"""
        # 使用Agent执行工具
        results = self._execute_tools(state["user_query"], state["rag_context"])

        return {
            **state,
            "tool_results": results,
            "messages": state["messages"] + ["工具执行完成"]
        }

    def _synthesize_node(self, state: AgentRAGState) -> AgentRAGState:
        """综合答案节点"""
        # 综合RAG和工具结果
        answer = self._synthesize_answer(
            state["user_query"],
            state["rag_context"],
            state["tool_results"]
        )

        return {
            **state,
            "final_answer": answer,
            "messages": state["messages"] + ["答案生成完成"]
        }

    def _decide_approach(self, state: AgentRAGState) -> str:
        """决策方法"""
        # 分析查询决定使用RAG还是工具
        if "最新" in state["user_query"] or "实时" in state["user_query"]:
            return "tools"
        elif "知识" in state["user_query"] or "文档" in state["user_query"]:
            return "rag"
        else:
            return "both"

    async def query(self, user_query: str) -> dict:
        """查询"""
        initial_state: AgentRAGState = {
            "messages": [],
            "user_query": user_query,
            "rag_context": "",
            "tool_results": {},
            "final_answer": ""
        }

        result = await self.workflow.ainvoke(initial_state)
        return result
```

---

## 项目7：本地AI助手

### 技术栈

```
🦙 Ollama（本地LLM）
🤖 LangChain
🎯 Llama 3.1/Mistral 7B
🎚️ Streamlit
📊 Chroma（本地向量数据库）
```

### 项目简介

一个完全运行在本地的AI助手，保护数据隐私。

### 核心代码

```python
# local_assistant.py
import ollama
from langchain.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings

class LocalAIAssistant:
    """本地AI助手"""

    def __init__(self, model_name="llama3.1"):
        # 初始化本地LLM
        self.model = model_name
        self.embeddings = OllamaEmbeddings(model=model_name)

        # 初始化本地向量数据库
        self.vectorstore = Chroma(
            persist_directory="./chroma_db",
            embedding_function=self.embeddings
        )

    def chat(self, message: str) -> str:
        """对话"""
        response = ollama.chat(model=self.model, messages=[
            {
                "role": "user",
                "content": message
            }
        ])

        return response["message"]["content"]

    async def chat_with_rag(self, message: str) -> dict:
        """RAG对话"""
        # 检索相关文档
        docs = await self.vectorstore.asimilarity_search(message, k=3)

        # 构建上下文
        context = "\n\n".join([doc.page_content for doc in docs])

        # 生成回答
        prompt = f"""
        基于以下上下文回答问题：

        上下文：
        {context}

        问题：{message}

        回答：
        """

        response = ollama.chat(model=self.model, messages=[
            {
                "role": "user",
                "content": prompt
            }
        ])

        return {
            "answer": response["message"]["content"],
            "sources": docs
        }

    def add_document(self, file_path: str):
        """添加文档"""
        from langchain.document_loaders import TextLoader
        from langchain.text_splitter import RecursiveCharacterTextSplitter

        # 加载文档
        loader = TextLoader(file_path)
        documents = loader.load()

        # 分块
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        splits = text_splitter.split_documents(documents)

        # 添加到向量数据库
        self.vectorstore.add_documents(splits)
        self.vectorstore.persist()
```

### Streamlit界面

```python
# ui/app.py
import streamlit as st
from local_assistant import LocalAIAssistant

st.set_page_config(page_title="本地AI助手", page_icon="🤖")

st.title("🤖 本地AI助手")

# 侧边栏
with st.sidebar:
    st.title("设置")
    model = st.selectbox(
        "选择模型",
        ["llama3.1", "mistral", "qwen2"],
        index=0
    )

    # 上传文档
    uploaded_file = st.file_uploader("上传文档", type=["txt", "md"])
    if uploaded_file:
        assistant.add_document(uploaded_file)
        st.success("文档已添加")

# 初始化assistant
if "assistant" not in st.session_state:
    st.session_state.assistant = LocalAIAssistant(model)

assistant = st.session_state.assistant

# 对话历史
if "messages" not in st.session_state:
    st.session_state.messages = []

# 显示对话历史
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# 用户输入
if prompt := st.chat_input("输入消息"):
    # 显示用户消息
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # 生成助手回复
    with st.chat_message("assistant"):
        with st.spinner("思考中..."):
            response = assistant.chat_with_rag(prompt)
            st.markdown(response["answer"])

    st.session_state.messages.append({"role": "assistant", "content": response["answer"]})
```

---

## 学习建议

### 推荐学习顺序

```
第1阶段：基础（1-2周）
├─ 智能文档问答系统（现有）
└─ 代码助手Agent（现有）

第2阶段：进阶（2-3周）
├─ Multi-Agent协作系统 ⭐ NEW
└─ 生产级RAG系统 ⭐ NEW

第3阶段：高级（2-3周）
├─ Agent + RAG结合系统 ⭐ NEW
└─ 本地AI助手 ⭐ NEW
```

### 2024-2026技术要点

根据[AI Agent发展趋势](https://www.ibm.com/think/insights/ai-agents-2025-expectations-vs-reality)：

- ✅ **Multi-Agent系统**：2025-2026主流
- ✅ **生产级RAG**：企业应用标配
- ✅ **Agent + RAG结合**：最佳实践
- ✅ **本地模型部署**：数据隐私保护
- ✅ **流式AI响应**：提升用户体验
- ✅ **Agent标准化**：工具和框架成熟

---

**恭喜你完成了AI应用开发完全指南！** 🎉

从基础到实战，你已经掌握了构建现代AI应用的核心技能。

**继续保持学习的热情，创造更多有价值的AI应用！**

---

**教程结束**
**有问题？** esimonx@163.com
**更多教程？** 查看 [Git](/git/)、[前端](/guide/) 等其他章节
