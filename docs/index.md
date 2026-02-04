---
layout: home

hero:
  name: "小徐的技术充电站"
  text: "持续充电 · 不断进步"

features:
  - title: 📚 前端开发
    details: Vue3, React, TypeScript, 现代前端工程化体系
    link: /guide/
    linkText: 开始学习 →
  - title: ☕ Java开发
    details: SpringBoot, MyBatis, 微服务架构与分布式系统
    link: /java/
    linkText: 规划中 →
  - title: 🐍 Python开发
    details: FastAPI, Django, 数据分析与自动化脚本
    link: /python/
    linkText: 规划中 →
  - title: 🤖 AI应用
    details: LangChain, LLM, 大模型应用开发与RAG实践
    link: /ai/
    linkText: 规划中 →
  - title: 🗄️ 数据库
    details: MySQL, Redis, MongoDB, 数据库设计与优化
    link: /database/
    linkText: 规划中 →
  - title: 🔧 DevOps
    details: Docker, Kubernetes, CI/CD, 云原生技术栈
    link: /devops/
    linkText: 规划中 →
  - title: 🐧 Linux
    details: Shell脚本, 系统运维, 服务器管理与性能优化
    link: /linux/
    linkText: 规划中 →
---

<div class="hero-layout">
  <div class="hero-left">
    <div class="hero-welcome">
      <span class="hero-emoji">🚀</span>
      <span class="hero-welcome-text">Welcome</span>
    </div>
    <h1 class="hero-title">小徐的技术充电站</h1>
    <p class="hero-subtitle">持续充电 · 不断进步</p>
    <p class="hero-description">系统化学习前沿技术</p>
    <div class="hero-tags">
      <span class="hero-tag">💻 前端开发</span>
      <span class="hero-tag">☕ Java</span>
      <span class="hero-tag">🐍 Python</span>
      <span class="hero-tag">🤖 AI</span>
      <span class="hero-tag">🗄️ 数据库</span>
      <span class="hero-tag">🔧 DevOps</span>
      <span class="hero-tag">🐧 Linux</span>
    </div>
  </div>
  <div class="hero-right">
    <div class="author-card">
      <div class="author-card-top-bar"></div>
      <div class="author-avatar">S</div>
      <div class="author-info">
        <div class="author-label">作者</div>
        <div class="author-name">Simon 小徐</div>
      </div>
      <div class="author-email">
        <span>📧</span>
        <span>esimonx@163.com</span>
      </div>
    </div>
  </div>
</div>

<style>
.hero-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  max-width: 1200px;
  margin: 4rem auto 2rem;
  padding: 0 2rem;
}

.hero-left {
  flex: 1;
  min-width: 0;
}

.hero-welcome {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.hero-emoji {
  font-size: 1.5rem;
}

.hero-welcome-text {
  font-size: 0.85rem;
  color: var(--vp-c-brand);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  background: linear-gradient(120deg, #42b883 0%, #3a8ee6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--vp-c-text-1);
  font-weight: 500;
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.hero-description {
  font-size: 1rem;
  color: var(--vp-c-text-2);
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.hero-tags {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.hero-tag {
  display: inline-block;
  padding: 0.5rem 1.2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 24px;
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-brand);
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: default;
}

.hero-tag:hover {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.25);
}

.hero-right {
  flex: 0 0 320px;
}

.author-card {
  padding: 2rem;
  background: var(--vp-c-bg);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid var(--vp-c-divider);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.author-card-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #42b883 0%, #3a8ee6 100%);
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42b883 0%, #3a8ee6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(66, 184, 131, 0.3);
  margin: 0 auto 1.5rem;
  position: relative;
  z-index: 1;
}

.author-info {
  margin-bottom: 1.5rem;
}

.author-label {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
}

.author-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.author-email {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.author-email span:first-child {
  font-size: 1.5rem;
}

.author-email span:last-child {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
</style>

<script setup>
// 确保自定义布局在 Hero 位置显示（仅在客户端执行）
import { onMounted } from 'vue'

onMounted(() => {
  if (typeof window === 'undefined') return

  function moveCustomLayout() {
    const customLayout = document.querySelector('.hero-layout')
    const hero = document.querySelector('.VPHero')

    if (customLayout && hero) {
      const container = hero.parentNode
      if (hero.nextSibling) {
        container.insertBefore(customLayout, hero.nextSibling)
      } else {
        container.appendChild(customLayout)
      }
      return true
    }
    return false
  }

  let attempts = 0
  const maxAttempts = 10

  function tryMove() {
    if (moveCustomLayout() || attempts >= maxAttempts) {
      return
    }
    attempts++
    setTimeout(tryMove, 100)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryMove)
  } else {
    tryMove()
  }
})
</script>
