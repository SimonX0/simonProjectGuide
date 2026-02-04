<!--
  AI章节学习组件
  提供章节信息、学习目标和导航
-->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  objectives: string[]
  prevChapter?: { title: string; link: string }
  nextChapter?: { title: string; link: string }
  checklist?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  checklist: () => []
})

const difficultyConfig = {
  beginner: { label: '入门 · 🔰', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  intermediate: { label: '中级 · ⭐', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  advanced: { label: '进阶 · ⭐⭐⭐', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
}

const currentDifficulty = computed(() => difficultyConfig[props.difficulty])
</script>

<template>
  <div class="chapter-guide">
    <!-- 章节头部信息 -->
    <div class="chapter-header" :style="{ background: currentDifficulty.color }">
      <div class="chapter-meta">
        <div class="difficulty-badge">
          <span>🎯 难度等级</span>
          <span class="badge">{{ currentDifficulty.label }}</span>
        </div>
        <div class="time-estimate">⏱️ 预计 {{ estimatedTime }}</div>
      </div>
    </div>

    <!-- 学习目标 -->
    <div v-if="objectives.length > 0" class="learning-objectives">
      <h3>🎯 学习目标</h3>
      <ul>
        <li v-for="(objective, index) in objectives" :key="index">
          {{ objective }}
        </li>
      </ul>
    </div>

    <!-- 章节导航 -->
    <div class="chapter-navigation">
      <a v-if="prevChapter" :href="prevChapter.link" class="nav-item prev">
        <div class="nav-label">⬅️️ 上一章</div>
        <div class="nav-title">{{ prevChapter.title }}</div>
      </a>
      <a v-if="nextChapter" :href="nextChapter.link" class="nav-item next" :style="{ background: currentDifficulty.color }">
        <div class="nav-label">下一章 ➡️</div>
        <div class="nav-title">{{ nextChapter.title }}</div>
      </a>
    </div>

    <!-- 学习检查清单 -->
    <div v-if="checklist.length > 0" class="checklist">
      <h3>✅ 本章检查清单</h3>
      <p style="margin-bottom: 1rem; opacity: 0.8;">完成本章学习后，请确认你能够：</p>
      <label v-for="(item, index) in checklist" :key="index" class="checklist-item">
        <input type="checkbox" :id="`check-${index}`">
        <span :for="`check-${index}`">{{ item }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.chapter-guide {
  margin: 2rem 0;
}

.chapter-header {
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.difficulty-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.time-estimate {
  font-size: 0.95rem;
  opacity: 0.9;
}

.learning-objectives,
.checklist {
  background: var(--vp-c-bg-soft);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid var(--vp-c-border);
}

.learning-objectives h3,
.checklist h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--vp-c-brand);
}

.learning-objectives ul {
  margin: 0;
  padding-left: 1.5rem;
}

.learning-objectives li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.chapter-navigation {
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid var(--vp-c-border);
}

.nav-item {
  flex: 1;
  padding: 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  border: 2px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s ease;
}

.nav-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-item.prev {
  text-align: left;
}

.nav-item.next {
  text-align: right;
  color: white;
  border-color: transparent;
}

.nav-label {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.nav-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checklist-item:hover {
  background: var(--vp-c-bg-mute);
  margin: 0 -1rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
}

.checklist-item input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.checklist-item input[type="checkbox"]:checked + span {
  text-decoration: line-through;
  opacity: 0.6;
}
</style>
