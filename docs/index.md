---
layout: home

features:
  - title: 🔧 Git版本控制
    details: 从基础到进阶的完整 Git 教程，掌握版本控制核心技能
    link: /git/
    linkText: 🚀 开始学习 →
  - title: 📚 前端全栈开发
    details: Vue 3、React 19、Next.js 15 等现代前端技术栈系统化教程
    link: /guide/
    linkText: 💻 成为前端高手 →
  - title: ☕ Java架构师之路
    details: Java 21 + Spring Boot 3.x + 微服务全家桶，从入门到架构师
    link: /java/
    linkText: 🎯 开启架构之旅 →
  - title: 🐍 Python开发
    details: FastAPI、Django Web 开发与数据分析实战教程
    link: /ai/
    linkText: 🔜 敬请期待 →
  - title: 🤖 AI应用开发
    details: LangChain、RAG、AI Agents 等 2024-2026 最新 AI 技术栈
    link: /ai/
    linkText: 🚀 探索AI世界 →
  - title: 📝 面试通关秘籍
    details: 前端、Java、AI 等技术栈的大厂中高级面试题精选
    link: /interview/
    linkText: 🎓 冲刺Offer →
  - title: 🗄️ 数据库实战
    details: MySQL、Redis、MongoDB 数据库设计与优化实战
    link: /guide/
    linkText: 🔜 敬请期待 →
  - title: 🚀 DevOps实战
    details: Docker、Kubernetes、GitOps 等云原生技术完全指南
    link: /devops/
    linkText: ⚡ 掌握云原生 →
  - title: 🐧 Linux运维
    details: Shell 脚本、系统运维、服务器管理与性能优化
    link: /guide/
    linkText: 🔜 敬请期待 →
---

<div class="hero-layout">
  <div class="hero-left">
    <div class="hero-badge">
      <span class="hero-badge-dot"></span>
      <span class="hero-badge-text">2024-2026 最新技术栈</span>
    </div>
    <h1 class="hero-title">小徐的技术充电站</h1>
    <p class="hero-subtitle">打造全栈开发者的系统化学习路径</p>
    <p class="hero-description">覆盖前端、后端、AI、DevOps 等八大技术领域，从零基础到架构师的完整成长体系</p>
    <div class="hero-cta">
      <a href="/ai/" class="cta-button primary">
        🚀 开始学习
        <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M5 12h14M12 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
      <a href="/interview/" class="cta-button secondary">
        📝 面试通关
      </a>
    </div>
    <div class="hero-tags">
      <span class="hero-tag">🔧 Git</span>
      <span class="hero-tag">💻 前端开发</span>
      <span class="hero-tag">☕ Java</span>
      <span class="hero-tag">🤖 AI</span>
      <span class="hero-tag">🔧 DevOps</span>
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
/* Hero Layout */
.hero-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  max-width: 1200px;
  margin: 3rem auto 2rem;
  padding: 0 2rem;
}

.hero-left {
  flex: 1;
  min-width: 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.1) 0%, rgba(58, 142, 230, 0.1) 100%);
  border: 1px solid var(--vp-c-brand);
  border-radius: 24px;
  margin-bottom: 1.5rem;
}

.hero-badge-dot {
  width: 8px;
  height: 8px;
  background: var(--vp-c-brand);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.hero-badge-text {
  font-size: 0.85rem;
  color: var(--vp-c-brand);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #42b883 0%, #3a8ee6 50%, #42b883 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  animation: shine 5s linear infinite;
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}

.hero-subtitle {
  font-size: 1.75rem;
  color: var(--vp-c-text-1);
  font-weight: 600;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.hero-description {
  font-size: 1.05rem;
  color: var(--vp-c-text-2);
  margin: 0 0 2rem 0;
  line-height: 1.7;
  max-width: 600px;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.cta-button.primary {
  background: linear-gradient(135deg, #42b883 0%, #3a8ee6 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(66, 184, 131, 0.3);
}

.cta-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 184, 131, 0.4);
}

.cta-button.secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
}

.cta-button.secondary:hover {
  background: var(--vp-c-brand);
  color: white;
  transform: translateY(-2px);
}

.cta-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.cta-button:hover .cta-icon {
  transform: translateX(3px);
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
  border: 1px solid var(--vp-c-divider);
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

/* Author Card */
.hero-right {
  flex: 0 0 320px;
}

.author-card {
  padding: 2.5rem 2rem;
  background: var(--vp-c-bg);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 2px solid var(--vp-c-divider);
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.author-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.author-card-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #42b883 0%, #3a8ee6 50%, #42b883 100%);
  background-size: 200% auto;
  animation: gradient-shift 3s linear infinite;
}

@keyframes gradient-shift {
  to {
    background-position: 200% center;
  }
}

.author-avatar {
  width: 90px;
  height: 90px;
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
  background: linear-gradient(120deg, #42b883 0%, #3a8ee6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  transition: all 0.3s ease;
}

.author-email:hover {
  background: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
}

.author-email:hover span:last-child {
  color: white;
}

.author-email span:first-child {
  font-size: 1.5rem;
}

.author-email span:last-child {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  transition: color 0.3s ease;
}

/* Stats Section */
.stats-section {
  max-width: 1200px;
  margin: 4rem auto 2rem;
  padding: 0 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--vp-c-bg) 0%, var(--vp-c-bg-soft) 100%);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  border-color: var(--vp-c-brand);
  box-shadow: 0 8px 24px rgba(66, 184, 131, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(120deg, #42b883 0%, #3a8ee6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

/* Features Section */
.features-section {
  max-width: 1200px;
  margin: 4rem auto 2rem;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  background: linear-gradient(120deg, #42b883 0%, #3a8ee6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.feature-highlight {
  padding: 2rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-highlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #42b883 0%, #3a8ee6 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-highlight:hover::before {
  transform: scaleX(1);
}

.feature-highlight:hover {
  transform: translateY(-4px);
  border-color: var(--vp-c-brand);
  box-shadow: 0 8px 24px rgba(66, 184, 131, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  line-height: 1;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 0.75rem 0;
}

.feature-desc {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-layout {
    flex-direction: column;
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  .hero-cta {
    justify-content: center;
  }

  .hero-tags {
    justify-content: center;
  }

  .hero-right {
    flex: 0 0 auto;
    width: 100%;
    max-width: 400px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup>
// 确保自定义布局在 Hero 位置显示（仅在客户端执行）
import { onMounted } from 'vue'
import { withBase, useData } from 'vitepress'

const { site } = useData()

onMounted(() => {
  if (typeof window === 'undefined') return

  // 更新按钮链接以包含正确的 base 路径
  const updateLinks = () => {
    const buttons = document.querySelectorAll('.cta-button')
    buttons.forEach(button => {
      const href = button.getAttribute('href')
      if (href && !href.startsWith('http')) {
        const newHref = withBase(href)
        button.setAttribute('href', newHref)
      }
    })
  }

  function moveCustomLayout() {
    const customLayout = document.querySelector('.hero-layout')
    const features = document.querySelector('.VPFeatures')

    if (customLayout && features) {
      // 找到 features 的父容器
      const featuresContainer = features.parentNode

      if (featuresContainer) {
        // 直接将 hero-layout 移动到 features 之前
        // 无论 hero-layout 当前在哪里，都移动它
        featuresContainer.insertBefore(customLayout, features)
        console.log('Hero layout moved successfully')
        updateLinks()
        return true
      }
    }
    return false
  }

  let attempts = 0
  const maxAttempts = 20

  function tryMove() {
    if (moveCustomLayout() || attempts >= maxAttempts) {
      return
    }
    attempts++
    setTimeout(tryMove, 50)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryMove)
  } else {
    tryMove()
  }
})
</script>
