---
title: AI 企业级实战项目2
description: AI智能客服系统完整实现
---

# ：AI 完全实战项目 - 企业级智能客服系统

> **项目概述**：本项目是一个完整的企业级AI智能客服系统，集成大语言模型、知识库、多渠道接入、工单系统等功能。
>
> **学习目标**：
> - 掌握AI客服系统的完整架构设计
> - 熟练使用RAG技术构建企业知识库
> - 掌握多渠道接入（网站、微信、小程序）
> - 学会对话管理、意图识别、工单流转

---

## 项目介绍

### 项目背景

本AI智能客服系统是一个完整的企业级客服解决方案，主要功能包括：

- ✅ **智能对话**：基于LLM的自然语言对话
- ✅ **知识库管理**：企业文档、FAQ、产品信息
- ✅ **RAG检索**：向量数据库、语义搜索
- ✅ **多渠道接入**：网站widget、微信公众号、小程序
- ✅ **人工协作**：智能转人工、工单系统
- ✅ **数据分析**：对话分析、满意度统计
- ✅ **意图识别**：自动分类、路由分发
- ✅ **多语言支持**：中英文、实时翻译

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **前端** | Vue3 + TypeScript | latest |
| **后端** | Python + FastAPI | latest |
| **LLM** | OpenAI GPT-4 / Claude 3 | latest |
| **向量库** | Pinecone / Weaviate | latest |
| **数据库** | PostgreSQL + pgvector | latest |
| **消息队列** | Redis + Celery | latest |
| **WebSocket** | Socket.io | latest |
| **前端SDK** | React / Vue SDK | latest |

### 项目结构

```
ai-customer-service/
├── frontend/                     # 前端（管理后台）
│   ├── src/
│   │   ├── views/
│   │   │   ├── dashboard/       # 仪表盘
│   │   │   ├── chat/            # 对话管理
│   │   │   ├── knowledge/       # 知识库
│   │   │   ├── tickets/         # 工单系统
│   │   │   └── analytics/       # 数据分析
│   │   ├── components/          # 组件
│   │   └── stores/              # 状态管理
├── backend/                      # 后端
│   ├── app/
│   │   ├── api/                 # API路由
│   │   ├── core/                # 核心功能
│   │   │   ├── llm/             # LLM集成
│   │   │   ├── rag/             # RAG检索
│   │   │   ├── dialog/          # 对话管理
│   │   │   └── intent/          # 意图识别
│   │   ├── models/              # 数据模型
│   │   └── services/            # 业务逻辑
├── chat-widget/                  # 聊天组件
│   ├── react-widget/            # React版本
│   └── vue-widget/              # Vue版本
├── integration/                  # 第三方集成
│   ├── wechat/                  # 微信
│   └── slack/                   # Slack
└── scripts/                      # 脚本工具
    ├── embedding.py             # 向量化
    └── import_kb.py             # 导入知识库
```

---

## 数据库设计

### 1. 数据模型

```python
# backend/app/models/models.py
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True)
    channel = Column(String)  # web, wechat, slack
    customer_id = Column(String)
    status = Column(String)  # active, closed, transferred
    assigned_agent_id = Column(String, ForeignKey("agents.id"))
    messages = relationship("Message", back_populates="conversation")
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True)
    conversation_id = Column(String, ForeignKey("conversations.id"))
    role = Column(String)  # user, bot, agent
    content = Column(Text)
    intent = Column(String)
    confidence = Column(Float)
    metadata = Column(JSON)
    conversation = relationship("Conversation", back_populates="messages")
    created_at = Column(DateTime, default=datetime.utcnow)

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(String, primary_key=True)
    title = Column(String)
    content = Column(Text)
    category = Column(String)
    embedding = Column(JSON)  # 向量嵌入
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True)
    conversation_id = Column(String, ForeignKey("conversations.id"))
    title = Column(String)
    description = Column(Text)
    priority = Column(String)  # low, medium, high, urgent
    status = Column(String)  # open, in_progress, resolved, closed
    assigned_to = Column(String, ForeignKey("agents.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True)
    name = Column(String)
    email = Column(String)
    status = Column(String)  # online, offline, away
    skills = Column(JSON)  # 技能标签
    max_concurrent_chats = Column(Integer, default=5)
    active_chats = Column(Integer, default=0)
```

---

## 核心功能实现

### 1. RAG知识库系统

```python
# backend/app/core/rag/retreiver.py
from typing import List, Optional
from langchain.vectorstores import Pinecone
from langchain.embeddings import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

class RAGRetriever:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Pinecone.from_existing_index(
            index_name="customer-service-kb",
            embedding=self.embeddings
        )
        self.llm = ChatOpenAI(model="gpt-4", temperature=0)

    def retrieve(self, query: str, top_k: int = 3) -> List[str]:
        """检索相关文档"""
        docs = self.vectorstore.similarity_search(
            query=query,
            k=top_k
        )
        return [doc.page_content for doc in docs]

    def answer(self, query: str, conversation_history: List[dict]) -> str:
        """基于RAG生成回答"""
        memory = ConversationBufferMemory(
            return_messages=True,
            memory_key="chat_history"
        )

        # 加载历史对话
        for msg in conversation_history:
            if msg["role"] == "user":
                memory.chat_memory.add_user_message(msg["content"])
            else:
                memory.chat_memory.add_ai_message(msg["content"])

        # 创建检索链
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=self.vectorstore.as_retriever(search_kwargs={"k": 3}),
            memory=memory,
            return_source_documents=True
        )

        result = qa_chain({"question": query})

        return {
            "answer": result["answer"],
            "sources": [doc.metadata for doc in result["source_documents"]]
        }
```

### 2. 对话管理系统

```python
# backend/app/core/dialog/manager.py
from typing import List, Optional
from app.models.models import Conversation, Message
from app.core.llm.openai_client import OpenAIClient
from app.core.rag.retriever import RAGRetriever
from app.core.intent.classifier import IntentClassifier

class DialogManager:
    def __init__(self):
        self.llm = OpenAIClient()
        self.rag = RAGRetriever()
        self.intent_classifier = IntentClassifier()

    async def process_message(
        self,
        conversation_id: str,
        user_message: str,
        customer_id: str
    ) -> dict:
        """处理用户消息"""

        # 1. 获取对话历史
        conversation = await self.get_conversation(conversation_id)
        history = await self.get_message_history(conversation_id)

        # 2. 意图识别
        intent_result = await self.intent_classifier.classify(
            message=user_message,
            history=history
        )

        # 3. 判断是否需要转人工
        if intent_result["should_transfer_to_human"]:
            return await self.transfer_to_agent(
                conversation_id=conversation_id,
                reason=intent_result["reason"]
            )

        # 4. RAG检索回答
        if intent_result["needs_knowledge_search"]:
            rag_result = self.rag.answer(
                query=user_message,
                conversation_history=history
            )
            bot_answer = rag_result["answer"]
            sources = rag_result["sources"]
        else:
            # 直接使用LLM生成回答
            bot_answer = await self.llm.chat(
                messages=[
                    *history,
                    {"role": "user", "content": user_message}
                ],
                system_prompt=self._get_system_prompt(intent_result["intent"])
            )
            sources = []

        # 5. 保存消息
        await self.save_message(
            conversation_id=conversation_id,
            role="user",
            content=user_message,
            intent=intent_result["intent"],
            confidence=intent_result["confidence"]
        )

        await self.save_message(
            conversation_id=conversation_id,
            role="bot",
            content=bot_answer,
            metadata={"sources": sources}
        )

        return {
            "answer": bot_answer,
            "intent": intent_result["intent"],
            "confidence": intent_result["confidence"],
            "sources": sources
        }

    def _get_system_prompt(self, intent: str) -> str:
        """根据意图获取系统提示词"""
        prompts = {
            "greeting": "你是一个友好的客服助手，热情地问候用户。",
            "complaint": "你是一个专业的客服，耐心倾听用户的投诉，并表示理解和同情。",
            "inquiry": "你是一个专业的客服，清晰准确地回答用户的问题。",
            "technical_support": "你是一个技术支持专家，提供专业的技术指导。"
        }
        return prompts.get(intent, "你是一个专业的客服助手。")
```

### 3. 意图识别系统

```python
# backend/app/core/intent/classifier.py
from typing import List, Dict
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class IntentClassification(BaseModel):
    intent: str = Field(description="用户意图类别")
    confidence: float = Field(description="置信度，0-1之间")
    should_transfer_to_human: bool = Field(description="是否需要转人工")
    reason: str = Field(description="转人工的原因")
    needs_knowledge_search: bool = Field(description="是否需要检索知识库")

class IntentClassifier:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0)
        self.parser = PydanticOutputParser(pydantic_object=IntentClassification)

        self.intents = {
            "greeting": "问候、打招呼",
            "farewell": "告别、道别",
            "complaint": "投诉、抱怨",
            "inquiry": "咨询、询问",
            "technical_support": "技术支持",
            "billing": "账单、付款",
            "refund": "退款",
            "order_status": "订单状态查询",
            "product_info": "产品信息",
            "other": "其他"
        }

    async def classify(
        self,
        message: str,
        history: List[dict]
    ) -> Dict:
        """识别用户意图"""

        prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一个客服意图分类器。

            可用的意图类别：
            {intents}

            请判断用户消息的意图，并返回JSON格式结果。

            {format_instructions}

            判断规则：
            1. 如果用户表达强烈不满、威胁要投诉、或者连续多次提问未得到满意答案，should_transfer_to_human设为true
            2. 如果用户询问具体的产品、订单、政策等信息，needs_knowledge_search设为true
            3. 如果是简单的寒暄，needs_knowledge_search设为false
            """),
            ("human", "用户消息：{message}\n对话历史：{history}")
        ])

        chain = prompt | self.llm | self.parser

        result = await chain.ainvoke({
            "intents": "\n".join([f"{k}: {v}" for k, v in self.intents.items()]),
            "format_instructions": self.parser.get_format_instructions(),
            "message": message,
            "history": "\n".join([f"{m['role']}: {m['content']}" for m in history[-5:]])
        })

        return result.dict()
```

### 4. 聊天Widget组件

```tsx
// chat-widget/react-widget/src/ChatWidget.tsx
import React, { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  role: 'user' | 'bot' | 'agent'
  content: string
  timestamp: Date
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          conversation_id: conversationId
        })
      })

      const data = await response.json()

      const botMessage: Message = {
        id: data.message_id,
        role: 'bot',
        content: data.answer,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])

      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }
    } catch (error) {
      console.error('发送消息失败:', error)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="chat-widget-container">
      {/* 聊天按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-button"
        >
          💬
        </button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>客服助手</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message ${msg.role}`}
              >
                <div className="message-content">
                  {msg.content}
                </div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message bot typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入您的问题..."
            />
            <button onClick={handleSendMessage}>
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 5. WebSocket实时通信

```python
# backend/app/api/websocket.py
from fastapi import WebSocket
from typing import Dict
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, conversation_id: str):
        await websocket.accept()
        self.active_connections[conversation_id] = websocket

    def disconnect(self, conversation_id: str):
        if conversation_id in self.active_connections:
            del self.active_connections[conversation_id]

    async def send_message(self, conversation_id: str, message: dict):
        if conversation_id in self.active_connections:
            await self.active_connections[conversation_id].send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/chat/{conversation_id}")
async def chat_websocket(websocket: WebSocket, conversation_id: str):
    await manager.connect(websocket, conversation_id)

    try:
        while True:
            data = await websocket.receive_json()

            # 处理消息
            result = await dialog_manager.process_message(
                conversation_id=conversation_id,
                user_message=data["message"],
                customer_id=data.get("customer_id", "")
            )

            # 发送回复
            await manager.send_message(conversation_id, {
                "type": "bot_response",
                "data": result
            })

    except WebSocketDisconnect:
        manager.disconnect(conversation_id)
```

### 6. 工单系统

```python
# backend/app/core/ticket/system.py
from typing import Optional
from app.models.models import Ticket, Conversation

class TicketSystem:
    async def create_ticket(
        self,
        conversation_id: str,
        title: str,
        description: str,
        priority: str = "medium"
    ) -> Ticket:
        """创建工单"""

        ticket = Ticket(
            id=self._generate_ticket_id(),
            conversation_id=conversation_id,
            title=title,
            description=description,
            priority=priority,
            status="open"
        )

        # 智能分配客服
        assigned_agent = await self._assign_agent(ticket)
        ticket.assigned_to = assigned_agent.id

        await self.save_ticket(ticket)

        # 通知客服
        await self._notify_agent(assigned_agent, ticket)

        return ticket

    async def _assign_agent(self, ticket: Ticket) -> Agent:
        """智能分配客服"""
        # 基于技能匹配、当前负载等因素分配
        available_agents = await self.get_available_agents()

        # 找到技能匹配的客服
        skilled_agents = [
            agent for agent in available_agents
            if self._skill_match(agent.skills, ticket)
        ]

        if not skilled_agents:
            skilled_agents = available_agents

        # 选择当前负载最低的客服
        return min(skilled_agents, key=lambda a: a.active_chats)

    def _skill_match(self, agent_skills: dict, ticket: Ticket) -> bool:
        """检查技能匹配度"""
        # 实现技能匹配逻辑
        return True
```

---

## 性能优化

### 1. 缓存策略

```python
# backend/app/core/cache/redis_cache.py
import redis
import json
from typing import Any, Optional

class RedisCache:
    def __init__(self):
        self.redis = redis.Redis(
            host='localhost',
            port=6379,
            db=0,
            decode_responses=True
        )

    async def get(self, key: str) -> Optional[Any]:
        value = await self.redis.get(key)
        return json.loads(value) if value else None

    async def set(self, key: str, value: Any, ttl: int = 3600):
        await self.redis.setex(
            key,
            ttl,
            json.dumps(value)
        )

    async def delete(self, key: str):
        await self.redis.delete(key)

# 使用示例
cache = RedisCache()

async def get_knowledge_base(query: str):
    cache_key = f"kb:{query}"

    # 先查缓存
    cached = await cache.get(cache_key)
    if cached:
        return cached

    # 缓存未命中，查询数据库
    result = await rag_retriever.retrieve(query)

    # 写入缓存
    await cache.set(cache_key, result, ttl=1800)

    return result
```

### 2. 异步处理

```python
# backend/app/core/async/tasks.py
from celery import Celery

celery_app = Celery('tasks', broker='redis://localhost:6379/0')

@celery_app.task
async def send_email_notification(to: str, subject: str, body: str):
    """异步发送邮件"""
    # 发送邮件逻辑
    pass

@celery_app.task
async def generate_analytics_report(conversation_id: str):
    """异步生成分析报告"""
    # 生成报告逻辑
    pass
```

---

## 部署上线

### 1. Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/cs
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=cs
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  worker:
    build: ./backend
    command: celery -A app.core.async.tasks worker --loglevel=info
    depends_on:
      - redis

volumes:
  pgdata:
```

---

## 项目总结

本项目涵盖了AI智能客服系统开发的核心技能：

✅ **技术栈**：Python + FastAPI + Vue3 + LLM + 向量数据库
✅ **核心功能**：智能对话、知识库、多渠道接入、工单系统
✅ **AI特性**：RAG检索、意图识别、对话管理、智能路由
✅ **企业特性**：实时通信、数据分析、智能分配、性能优化

通过这个项目，你将掌握：
- AI客服系统的完整架构
- RAG技术在企业场景的应用
- 对话管理和意图识别
- 多渠道集成方案
- 工单系统设计
- 实时通信实现

---

## 下一步学习

- [第11章：AI Agent高级应用](/ai/chapter-05)
- [第12章：LangGraph复杂Agent框架](/ai/chapter-07#langgraph复杂agent框架)
- [第13章：AI应用评估和测试](/ai/chapter-07#ai应用评估和测试)
