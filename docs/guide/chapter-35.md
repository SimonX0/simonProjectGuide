# 前端可视化
## # 4.11 前端可视化
## 前端可视化

> **学习目标**：掌握前端数据可视化技术
> **核心内容**：ECharts、Canvas 2D、SVG、Three.js

### ECharts 完全指南

#### 安装 ECharts

```bash
# 安装完整版
npm install echarts

# 或按需引入（推荐）
npm install echarts-core
```

#### 基础配置

```vue
<!-- components/Charts/LineChart.vue -->
<template>
  <div ref="chartRef" class="chart-container" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, type PropType } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps({
  option: {
    type: Object as PropType<EChartsOption>,
    required: true
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '400px'
  },
  theme: {
    type: String,
    default: ''
  }
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value, props.theme)
  chartInstance.setOption(props.option)
}

const updateChart = () => {
  if (!chartInstance) return
  chartInstance.setOption(props.option, true)
}

const resizeChart = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})

watch(() => props.option, updateChart, { deep: true })

// 暴露方法供父组件调用
defineExpose({
  getInstance: () => chartInstance,
  resize: resizeChart,
  clear: () => chartInstance?.clear()
})
</script>

<style scoped>
.chart-container {
  min-height: 300px;
}
</style>
```

#### 折线图

```vue
<!-- components/Charts/SalesLineChart.vue -->
<template>
  <LineChart :option="chartOption" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LineChart from './LineChart.vue'
import type { EChartsOption } from 'echarts'

interface SalesData {
  date: string
  sales: number
  profit: number
}

const salesData = ref<SalesData[]>([
  { date: '2026-01', sales: 1200, profit: 400 },
  { date: '2026-02', sales: 1320, profit: 450 },
  { date: '2026-03', sales: 1010, profit: 320 },
  { date: '2026-04', sales: 1340, profit: 480 },
  { date: '2026-05', sales: 900, profit: 280 },
  { date: '2026-06', sales: 2300, profit: 850 },
  { date: '2026-07', sales: 2100, profit: 780 }
])

const chartOption = computed<EChartsOption>(() => ({
  title: {
    text: '销售趋势图',
    left: 'center',
    textStyle: {
      fontSize: 18,
      fontWeight: 'bold'
    }
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: '#42b983',
    borderWidth: 1,
    textStyle: {
      color: '#fff'
    },
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#42b983'
      }
    }
  },
  legend: {
    data: ['销售额', '利润'],
    top: 30
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: salesData.value.map(item => item.date),
    axisLine: {
      lineStyle: {
        color: '#999'
      }
    }
  },
  yAxis: {
    type: 'value',
    axisLine: {
      lineStyle: {
        color: '#999'
      }
    },
    splitLine: {
      lineStyle: {
        type: 'dashed'
      }
    }
  },
  series: [
    {
      name: '销售额',
      type: 'line',
      smooth: true,
      data: salesData.value.map(item => item.sales),
      lineStyle: {
        width: 3,
        color: '#42b983'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(66, 185, 131, 0.3)' },
          { offset: 1, color: 'rgba(66, 185, 131, 0.05)' }
        ])
      },
      itemStyle: {
        color: '#42b983'
      }
    },
    {
      name: '利润',
      type: 'line',
      smooth: true,
      data: salesData.value.map(item => item.profit),
      lineStyle: {
        width: 3,
        color: '#409eff'
      },
      itemStyle: {
        color: '#409eff'
      }
    }
  ]
}))
</script>
```

#### 柱状图

```vue
<!-- components/Charts/BarChart.vue -->
<template>
  <LineChart :option="chartOption" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LineChart from './LineChart.vue'
import type { EChartsOption } from 'echarts'

interface CategoryData {
  name: string
  value: number
}

const categoryData = ref<CategoryData[]>([
  { name: '电子产品', value: 4500 },
  { name: '服装鞋包', value: 3200 },
  { name: '食品饮料', value: 2800 },
  { name: '家居用品', value: 2100 },
  { name: '图书文具', value: 1500 },
  { name: '美妆个护', value: 1800 }
])

const chartOption = computed<EChartsOption>(() => ({
  title: {
    text: '各类目销售额对比',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: categoryData.value.map(item => item.name),
    axisLabel: {
      interval: 0,
      rotate: 30
    }
  },
  yAxis: {
    type: 'value',
    name: '销售额（元）'
  },
  series: [
    {
      name: '销售额',
      type: 'bar',
      data: categoryData.value.map(item => item.value),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' }
        ]),
        borderRadius: [5, 5, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#2378f7' },
            { offset: 0.7, color: '#2378f7' },
            { offset: 1, color: '#83bff6' }
          ])
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: '¥{c}'
      }
    }
  ]
}))
</script>
```

#### 饼图

```vue
<!-- components/Charts/PieChart.vue -->
<template>
  <LineChart :option="chartOption" height="500px" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LineChart from './LineChart.vue'
import type { EChartsOption } from 'echarts'

interface SourceData {
  name: string
  value: number
}

const sourceData = ref<SourceData[]>([
  { name: '直接访问', value: 335 },
  { name: '邮件营销', value: 310 },
  { name: '联盟广告', value: 234 },
  { name: '视频广告', value: 135 },
  { name: '搜索引擎', value: 1548 },
  { name: '社交媒体', value: 520 }
])

const chartOption = computed<EChartsOption>(() => ({
  title: {
    text: '流量来源分析',
    subtext: '2026年1月',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: sourceData.value.map(item => item.name)
  },
  series: [
    {
      name: '访问来源',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      roseType: 'area',
      data: sourceData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        formatter: '{b}: {d}%'
      },
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      }
    }
  ]
}))
</script>
```

#### 动态图表

```vue
<!-- components/Charts/DynamicChart.vue -->
<template>
  <div class="dynamic-chart">
    <div class="controls">
      <button @click="startUpdate">开始更新</button>
      <button @click="stopUpdate">停止更新</button>
      <button @click="resetData">重置数据</button>
    </div>
    <LineChart ref="chartRef" :option="chartOption" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import LineChart from './LineChart.vue'
import type { EChartsOption } from 'echarts'

interface DataPoint {
  name: string
  value: [number, number]
}

const data = ref<DataPoint[]>([])
const updateTime = ref(0)
let timer: number | null = null
const chartRef = ref()

// 生成初始数据
const generateInitialData = () => {
  const now = Date.now()
  data.value = []
  for (let i = 0; i < 50; i++) {
    data.value.push({
      name: new Date(now - (50 - i) * 1000).toLocaleTimeString(),
      value: [now - (50 - i) * 1000, Math.round(Math.random() * 100)]
    })
  }
}

generateInitialData()

const chartOption = computed<EChartsOption>(() => ({
  title: {
    text: '实时数据监控',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      params = params[0]
      const date = new Date(params.value[0])
      return `${date.toLocaleTimeString()}<br/>数值: ${params.value[1]}`
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'time',
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    boundaryGap: [0, '100%'],
    splitLine: {
      show: true
    }
  },
  series: [
    {
      name: '实时数据',
      type: 'line',
      showSymbol: false,
      hoverAnimation: false,
      data: data.value.map(item => item.value),
      lineStyle: {
        width: 2,
        color: '#42b983'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(66, 185, 131, 0.5)' },
          { offset: 1, color: 'rgba(66, 185, 131, 0.1)' }
        ])
      }
    }
  ]
}))

const updateData = () => {
  const now = Date.now()
  const value = Math.round(Math.random() * 100)

  data.value.push({
    name: new Date(now).toLocaleTimeString(),
    value: [now, value]
  })

  // 保持最多50个数据点
  if (data.value.length > 50) {
    data.value.shift()
  }

  updateTime.value++
}

const startUpdate = () => {
  if (timer) return
  timer = window.setInterval(updateData, 1000)
}

const stopUpdate = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const resetData = () => {
  stopUpdate()
  generateInitialData()
}

onUnmounted(() => {
  stopUpdate()
})
</script>

<style scoped>
.dynamic-chart .controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.dynamic-chart button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #42b983;
  color: white;
  cursor: pointer;
}

.dynamic-chart button:hover {
  opacity: 0.9;
}
</style>
```

---

#### 企业级数据可视化大屏实战案例

在企业级应用中，数据可视化大屏（Dashboard）是常见的需求。以下是完整的企业数据大屏实现案例，包含多种图表类型、响应式布局、实时数据更新等功能。

---

##### 数据大屏整体布局

```vue
<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard" :class="{ fullscreen: isFullscreen }">
    <!-- 顶部标题栏 -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">
          <span class="title-icon">📊</span>
          {{ title }}
        </h1>
        <div class="header-info">
          <span class="current-time">{{ currentTime }}</span>
          <button class="fullscreen-btn" @click="toggleFullscreen">
            {{ isFullscreen ? '退出全屏' : '全屏显示' }}
          </button>
        </div>
      </div>
    </header>

    <!-- 核心指标卡片区 -->
    <section class="metrics-section">
      <MetricCard
        v-for="metric in metrics"
        :key="metric.key"
        :title="metric.title"
        :value="metric.value"
        :unit="metric.unit"
        :trend="metric.trend"
        :trend-value="metric.trendValue"
        :icon="metric.icon"
        :color="metric.color"
      />
    </section>

    <!-- 主要图表区 -->
    <main class="dashboard-main">
      <!-- 左侧图表列 -->
      <div class="chart-column left">
        <!-- 销售趋势图 -->
        <ChartPanel title="销售趋势分析" :loading="loading">
          <SalesLineChart :data="salesData" />
        </ChartPanel>

        <!-- 分类占比图 -->
        <ChartPanel title="产品分类占比" :loading="loading">
          <CategoryPieChart :data="categoryData" />
        </ChartPanel>
      </div>

      <!-- 中间地图区 -->
      <div class="chart-column center">
        <ChartPanel title="全国销售分布" :loading="loading" :span="2">
          <ChinaMapChart :data="regionData" />
        </ChartPanel>

        <!-- 实时订单列表 -->
        <ChartPanel title="实时订单" :loading="loading">
          <RealTimeOrders :orders="recentOrders" />
        </ChartPanel>
      </div>

      <!-- 右侧图表列 -->
      <div class="chart-column right">
        <!-- 排行榜 -->
        <ChartPanel title="销售排行榜" :loading="loading">
          <SalesRanking :data="rankingData" />
        </ChartPanel>

        <!-- KPI 趋势 -->
        <ChartPanel title="核心指标趋势" :loading="loading">
          <KPITrendChart :data="kpiData" />
        </ChartPanel>
      </div>
    </main>

    <!-- 底部统计栏 -->
    <footer class="dashboard-footer">
      <div class="footer-item">
        <span class="label">数据更新时间</span>
        <span class="value">{{ updateTime }}</span>
      </div>
      <div class="footer-item">
        <span class="label">今日访问量</span>
        <span class="value">{{ todayVisits }}</span>
      </div>
      <div class="footer-item">
        <span class="label">在线人数</span>
        <span class="value">{{ onlineUsers }}</span>
      </div>
      <div class="footer-item">
        <span class="label">系统状态</span>
        <span class="value status-ok">运行正常</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import ChartPanel from '@/components/dashboard/ChartPanel.vue'
import SalesLineChart from '@/components/dashboard/SalesLineChart.vue'
import CategoryPieChart from '@/components/dashboard/CategoryPieChart.vue'
import ChinaMapChart from '@/components/dashboard/ChinaMapChart.vue'
import RealTimeOrders from '@/components/dashboard/RealTimeOrders.vue'
import SalesRanking from '@/components/dashboard/SalesRanking.vue'
import KPITrendChart from '@/components/dashboard/KPITrendChart.vue'
import { dashboardApi } from '@/api/dashboard'

// 标题和时间
const title = ref('企业数据可视化大屏')
const currentTime = ref('')
const updateTime = ref('')

// 全屏状态
const isFullscreen = ref(false)

// 加载状态
const loading = ref(true)

// 核心指标数据
const metrics = ref([
  {
    key: 'revenue',
    title: '今日营收',
    value: 0,
    unit: '元',
    trend: 'up',
    trendValue: 12.5,
    icon: '💰',
    color: '#52c41a'
  },
  {
    key: 'orders',
    title: '今日订单',
    value: 0,
    unit: '单',
    trend: 'up',
    trendValue: 8.3,
    icon: '📦',
    color: '#1890ff'
  },
  {
    key: 'users',
    title: '新增用户',
    value: 0,
    unit: '人',
    trend: 'down',
    trendValue: 3.2,
    icon: '👥',
    color: '#faad14'
  },
  {
    key: 'conversion',
    title: '转化率',
    value: 0,
    unit: '%',
    trend: 'up',
    trendValue: 5.1,
    icon: '📈',
    color: '#722ed1'
  }
])

// 图表数据
const salesData = ref([])
const categoryData = ref([])
const regionData = ref([])
const recentOrders = ref([])
const rankingData = ref([])
const kpiData = ref([])

// 底部统计
const todayVisits = ref(0)
const onlineUsers = ref(0)

// 定时器
let dataTimer: number | null = null
let timeTimer: number | null = null

// 更新当前时间
function updateCurrentTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 切换全屏
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 加载仪表盘数据
async function loadDashboardData() {
  try {
    loading.value = true

    const response = await dashboardApi.getDashboardData()

    // 更新核心指标
    metrics.value.forEach((metric, index) => {
      metric.value = response.metrics[index].value
      metric.trend = response.metrics[index].trend
      metric.trendValue = response.metrics[index].trendValue
    })

    // 更新图表数据
    salesData.value = response.salesData
    categoryData.value = response.categoryData
    regionData.value = response.regionData
    recentOrders.value = response.recentOrders
    rankingData.value = response.rankingData
    kpiData.value = response.kpiData

    // 更新统计
    todayVisits.value = response.todayVisits
    onlineUsers.value = response.onlineUsers

    // 更新时间
    updateTime.value = new Date().toLocaleTimeString()
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  // 立即加载数据
  loadDashboardData()
  updateCurrentTime()

  // 定时更新数据（每30秒）
  dataTimer = window.setInterval(loadDashboardData, 30000)

  // 定时更新时间（每秒）
  timeTimer = window.setInterval(updateCurrentTime, 1000)

  // 监听全屏变化
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

// 清理
onUnmounted(() => {
  if (dataTimer) clearInterval(dataTimer)
  if (timeTimer) clearInterval(timeTimer)
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c1929 0%, #1a2a4a 100%);
  color: #fff;
  padding: 20px;
  transition: all 0.3s;
}

.dashboard.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  overflow: auto;
}

/* 顶部标题栏 */
.dashboard-header {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px 30px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-title {
  font-size: 28px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.title-icon {
  font-size: 32px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.current-time {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.fullscreen-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 核心指标区 */
.metrics-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

/* 主要图表区 */
.dashboard-main {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 底部统计栏 */
.dashboard-footer {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 15px 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-item {
  text-align: center;
}

.footer-item .label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 5px;
}

.footer-item .value {
  font-size: 18px;
  font-weight: bold;
}

.status-ok {
  color: #52c41a;
}

/* 响应式布局 */
@media (max-width: 1400px) {
  .dashboard-main {
    grid-template-columns: 1fr 1fr;
  }

  .chart-column.center {
    grid-column: span 2;
  }
}

@media (max-width: 992px) {
  .metrics-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-main {
    grid-template-columns: 1fr;
  }

  .chart-column.center {
    grid-column: span 1;
  }
}

@media (max-width: 576px) {
  .metrics-section {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: 10px;
  }

  .dashboard-footer {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
```

---

##### 核心指标卡片组件

```vue
<!-- src/components/dashboard/MetricCard.vue -->
<template>
  <div class="metric-card" :style="{ borderTopColor: color }">
    <div class="metric-header">
      <span class="metric-icon">{{ icon }}</span>
      <span class="metric-title">{{ title }}</span>
    </div>
    <div class="metric-value">
      <span class="value">{{ formatValue(value) }}</span>
      <span class="unit">{{ unit }}</span>
    </div>
    <div class="metric-trend" :class="trend">
      <span class="trend-icon">{{ trendIcon }}</span>
      <span class="trend-value">{{ trendValue }}%</span>
      <span class="trend-label">较昨日</span>
    </div>
    <!-- 背景动画效果 -->
    <div class="metric-bg" :style="{ backgroundColor: color }"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: number
  unit: string
  trend: 'up' | 'down'
  trendValue: number
  icon: string
  color: string
}>()

const trendIcon = computed(() => {
  return props.trend === 'up' ? '↑' : '↓'
})

function formatValue(val: number): string {
  if (val >= 10000) {
    return (val / 10000).toFixed(1) + '万'
  }
  return val.toLocaleString()
}
</script>

<style scoped>
.metric-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border-top: 3px solid;
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.metric-icon {
  font-size: 24px;
}

.metric-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 15px;
}

.metric-value .value {
  font-size: 32px;
  font-weight: bold;
}

.metric-value .unit {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.metric-trend.up {
  color: #52c41a;
}

.metric-trend.down {
  color: #ff4d4f;
}

.metric-bg {
  position: absolute;
  bottom: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  opacity: 0.1;
  filter: blur(40px);
  pointer-events: none;
}
</style>
```

---

##### 图表面板组件

```vue
<!-- src/components/dashboard/ChartPanel.vue -->
<template>
  <div class="chart-panel">
    <div class="panel-header">
      <h3 class="panel-title">
        <span class="title-line"></span>
        {{ title }}
      </h3>
      <div v-if="$slots.actions" class="panel-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div v-if="loading" class="panel-loading">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
    <div v-else class="panel-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  loading?: boolean
  span?: number
}>()
</script>

<style scoped>
.chart-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-line {
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #1890ff, #52c41a);
  border-radius: 2px;
}

.panel-content {
  padding: 20px;
  flex: 1;
  min-height: 300px;
}

.panel-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

---

##### 销售趋势图表

```vue
<!-- src/components/dashboard/SalesLineChart.vue -->
<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: Array<{ date: string; sales: number; profit: number }>
}>()

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)
  updateChart()

  window.addEventListener('resize', () => chart?.resize())
}

const updateChart = () => {
  if (!chart || !props.data) return

  const option: echarts.EChartsOption = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['销售额', '利润'],
      textStyle: { color: '#fff' },
      top: 0
    },
    xAxis: {
      type: 'category',
      data: props.data.map(d => d.date),
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.8)' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.8)' },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: props.data.map(d => d.sales),
        lineStyle: { width: 3, color: '#1890ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0)' }
          ])
        }
      },
      {
        name: '利润',
        type: 'line',
        smooth: true,
        data: props.data.map(d => d.profit),
        lineStyle: { width: 3, color: '#52c41a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
            { offset: 1, color: 'rgba(82, 196, 26, 0)' }
          ])
        }
      }
    ]
  }

  chart.setOption(option)
}

watch(() => props.data, updateChart, { deep: true })

onMounted(initChart)

onUnmounted(() => {
  chart?.dispose()
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
```

---

##### 中国地图销售分布

```vue
<!-- src/components/dashboard/ChinaMapChart.vue -->
<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import chinaJson from '@/assets/china.json'

// 注册中国地图
echarts.registerMap('china', chinaJson as any)

const props = defineProps<{
  data: Array<{ name: string; value: number }>
}>()

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: '{b}<br/>销售额: ¥{c}'
    },
    visualMap: {
      min: 0,
      max: 100000,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#50a3ba', '#eac736', '#d94e5d']
      },
      textStyle: { color: '#fff' }
    },
    series: [
      {
        name: '销售额',
        type: 'map',
        map: 'china',
        roam: true,
        emphasis: {
          label: { show: true, color: '#fff' },
          itemStyle: {
            areaColor: '#f4d03f',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderColor: 'rgba(255, 255, 255, 0.3)',
          areaColor: '#323c48'
        },
        data: props.data
      }
    ]
  }

  chart.setOption(option)
  window.addEventListener('resize', () => chart?.resize())
}

onMounted(initChart)

onUnmounted(() => {
  chart?.dispose()
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
```

---

##### Dashboard API 封装

```typescript
// src/api/dashboard.ts
import request from './request'

export interface DashboardData {
  metrics: Array<{
    value: number
    trend: 'up' | 'down'
    trendValue: number
  }>
  salesData: Array<{ date: string; sales: number; profit: number }>
  categoryData: Array<{ name: string; value: number }>
  regionData: Array<{ name: string; value: number }>
  recentOrders: Array<{
    id: string
    customer: string
    amount: number
    time: string
  }>
  rankingData: Array<{ name: string; value: number }>
  kpiData: Array<{ date: string; revenue: number; orders: number; users: number }>
  todayVisits: number
  onlineUsers: number
}

export const dashboardApi = {
  // 获取仪表盘数据
  async getDashboardData(): Promise<DashboardData> {
    return request.get('/dashboard/data')
  },

  // 导出报表
  async exportReport(params: { startDate: string; endDate: string }) {
    return request.post('/dashboard/export', params, {
      responseType: 'blob'
    })
  },

  // 刷新数据
  async refreshData() {
    return request.post('/dashboard/refresh')
  }
}
```

---

##### 大屏效果预览

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  📊 企业数据可视化大屏                      2026-02-03 14:30:25    [全屏显示]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ 💰 今日营收  │ │ 📦 今日订单  │ │ 👥 新增用户  │ │ 📈 转化率    │           │
│  │ ¥128,500    │ │ 1,245 单    │ │ 328 人      │ │ 5.8%        │           │
│  │ ↑ 12.5%     │ │ ↑ 8.3%      │ │ ↓ 3.2%      │ │ ↑ 5.1%      │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                              │
│  ┌─────────────────────┐ ┌────────────────────────────┐ ┌───────────────┐   │
│  │  销售趋势分析        │ │     全国销售分布             │ │ 销售排行榜   │   │
│  │  [折线图]           │ │     [中国地图热力图]        │ │ 1. 北京      │   │
│  │                     │ │                            │ │ 2. 上海      │   │
│  │  产品分类占比        │ │     实时订单               │ │ 3. 深圳      │   │
│  │  [饼图]             │ │     [滚动列表]             │ │ 4. 广州      │   │
│  └─────────────────────┘ └────────────────────────────┘ │ 5. 杭州      │   │
│                                                      │ │ ...          │   │
│                                                      │ └───────────────┘   │
│  ┌─────────────────────┐                             ┌───────────────┐   │
│  │  核心指标趋势        │                             │ KPI 趋势      │   │
│  │  [多维度折线图]      │                             │ [雷达图]      │   │
│  └─────────────────────┘                             └───────────────┘   │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  数据更新: 14:30:00  │  今日访问: 12,458  │  在线人数: 328  │  系统状态: 运行正常│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Canvas 2D 绘图

#### 基础 Canvas 组件

```vue
<!-- components/Canvas/BaseCanvas.vue -->
<template>
  <canvas
    ref="canvasRef"
    :width="width"
    :height="height"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, type PropType } from 'vue'

const props = defineProps({
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  },
  draw: {
    type: Function as PropType<(ctx: CanvasRenderingContext2D) => void>,
    required: true
  }
})

const canvasRef = ref<HTMLCanvasElement>()
const ctx = ref<CanvasRenderingContext2D>()
const isDrawing = ref(false)
const lastPos = ref({ x: 0, y: 0 })

const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const context = canvas.getContext('2d')
  if (!context) return

  ctx.value = context
  render()
}

const render = () => {
  if (!ctx.value) return
  props.draw(ctx.value)
}

const handleMouseDown = (e: MouseEvent) => {
  isDrawing.value = true
  lastPos.value = { x: e.offsetX, y: e.offsetY }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx.value) return

  const { x, y } = lastPos.value
  ctx.value.beginPath()
  ctx.value.moveTo(x, y)
  ctx.value.lineTo(e.offsetX, e.offsetY)
  ctx.value.stroke()

  lastPos.value = { x: e.offsetX, y: e.offsetY }
}

const handleMouseUp = () => {
  isDrawing.value = false
}

onMounted(() => {
  initCanvas()
})

watch(() => props.draw, render)

defineExpose({
  getContext: () => ctx.value,
  clear: () => {
    const canvas = canvasRef.value
    if (!canvas || !ctx.value) return
    ctx.value.clearRect(0, 0, canvas.width, canvas.height)
  },
  toDataURL: () => canvasRef.value?.toDataURL()
})
</script>
```

#### 绘制图形

```typescript
// utils/canvasShapes.ts
import type { CanvasRenderingContext2D } from 'vue'

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Circle {
  x: number
  y: number
  radius: number
}

/**
 * 绘制矩形
 */
export function drawRect(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  options: {
    fill?: string
    stroke?: string
    lineWidth?: number
  } = {}
) {
  const { fill, stroke, lineWidth = 1 } = options

  ctx.beginPath()
  ctx.rect(rect.x, rect.y, rect.width, rect.height)

  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }

  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

/**
 * 绘制圆形
 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  options: {
    fill?: string
    stroke?: string
    lineWidth?: number
  } = {}
) {
  const { fill, stroke, lineWidth = 1 } = options

  ctx.beginPath()
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)

  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }

  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

/**
 * 绘制线条
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  options: {
    color?: string
    lineWidth?: number
    lineDash?: number[]
  } = {}
) {
  const { color = '#000', lineWidth = 1, lineDash } = options

  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth

  if (lineDash) {
    ctx.setLineDash(lineDash)
  } else {
    ctx.setLineDash([])
  }

  ctx.stroke()
}

/**
 * 绘制多边形
 */
export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  options: {
    fill?: string
    stroke?: string
    lineWidth?: number
    close?: boolean
  } = {}
) {
  const { fill, stroke, lineWidth = 1, close = true } = options

  if (points.length < 2) return

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }

  if (close) {
    ctx.closePath()
  }

  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }

  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

/**
 * 绘制文本
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  position: Point,
  options: {
    font?: string
    color?: string
    align?: CanvasTextAlign
    baseline?: CanvasTextBaseline
  } = {}
) {
  const {
    font = '16px Arial',
    color = '#000',
    align = 'left',
    baseline = 'top'
  } = options

  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = baseline
  ctx.fillText(text, position.x, position.y)
}

/**
 * 绘制渐变背景
 */
export function drawGradientBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[]
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)

  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color)
  })

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}
```

#### 交互式 Canvas 图表

```vue
<!-- components/Canvas/InteractiveChart.vue -->
<template>
  <div class="interactive-chart">
    <BaseCanvas
      ref="chartRef"
      :width="width"
      :height="height"
      :draw="drawChart"
    />
    <div class="tooltip" v-if="tooltip.show" :style="tooltipStyle">
      <div class="tooltip-title">{{ tooltip.title }}</div>
      <div class="tooltip-value">{{ tooltip.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseCanvas from './BaseCanvas.vue'
import { drawLine, drawCircle } from '@/utils/canvasShapes'

interface DataPoint {
  label: string
  value: number
}

const props = defineProps({
  data: {
    type: Array as PropType<DataPoint[]>,
    default: () => []
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 400
  }
})

const chartRef = ref()
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  title: '',
  value: ''
})

const padding = { top: 40, right: 40, bottom: 60, left: 60 }
const chartWidth = computed(() => props.width - padding.left - padding.right)
const chartHeight = computed(() => props.height - padding.top - padding.bottom)

const maxValue = computed(() => Math.max(...props.data.map(d => d.value)))
const minValue = computed(() => Math.min(...props.data.map(d => d.value)))

const points = computed(() => {
  return props.data.map((d, i) => ({
    x: padding.left + (i / (props.data.length - 1)) * chartWidth.value,
    y: padding.top + chartHeight.value - ((d.value - minValue.value) / (maxValue.value - minValue.value)) * chartHeight.value,
    data: d
  }))
})

const tooltipStyle = computed(() => ({
  left: `${tooltip.value.x + 10}px`,
  top: `${tooltip.value.y - 10}px`
}))

const drawChart = (ctx: CanvasRenderingContext2D) => {
  // 清空画布
  ctx.clearRect(0, 0, props.width, props.height)

  // 绘制背景网格
  drawGrid(ctx)

  // 绘制坐标轴
  drawAxes(ctx)

  // 绘制折线
  drawDataLine(ctx)

  // 绘制数据点
  drawDataPoints(ctx)
}

const drawGrid = (ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 1

  // 水平网格线
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight.value / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(padding.left + chartWidth.value, y)
    ctx.stroke()
  }
}

const drawAxes = (ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.fillStyle = '#666'
  ctx.font = '12px Arial'

  // X轴
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top + chartHeight.value)
  ctx.lineTo(padding.left + chartWidth.value, padding.top + chartHeight.value)
  ctx.stroke()

  // Y轴
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, padding.top + chartHeight.value)
  ctx.stroke()

  // X轴标签
  props.data.forEach((d, i) => {
    const x = padding.left + (i / (props.data.length - 1)) * chartWidth.value
    ctx.textAlign = 'center'
    ctx.fillText(d.label, x, padding.top + chartHeight.value + 20)
  })

  // Y轴标签
  for (let i = 0; i <= 5; i++) {
    const value = minValue.value + ((maxValue.value - minValue.value) / 5) * i
    const y = padding.top + chartHeight.value - (chartHeight.value / 5) * i
    ctx.textAlign = 'right'
    ctx.fillText(Math.round(value).toString(), padding.left - 10, y + 4)
  }
}

const drawDataLine = (ctx: CanvasRenderingContext2D) => {
  if (points.value.length < 2) return

  ctx.strokeStyle = '#42b983'
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(points.value[0].x, points.value[0].y)

  for (let i = 1; i < points.value.length; i++) {
    ctx.lineTo(points.value[i].x, points.value[i].y)
  }

  ctx.stroke()
}

const drawDataPoints = (ctx: CanvasRenderingContext2D) => {
  points.value.forEach(point => {
    drawCircle(ctx, { x: point.x, y: point.y, radius: 5 }, {
      fill: '#42b983',
      stroke: '#fff',
      lineWidth: 2
    })
  })
}
</script>

<style scoped>
.interactive-chart {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 10;
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 4px;
}
</style>
```

### SVG 矢量图形

#### SVG 基础组件

```vue
<!-- components/SVG/SVGIcon.vue -->
<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="viewBox"
    :class="classes"
    v-bind="$attrs"
  >
    <use :xlink:href="`#${iconName}`" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 24
  },
  viewBox: {
    type: String,
    default: '0 0 24 24'
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})

const iconName = computed(() => `icon-${props.name}`)
const classes = computed(() => ['svg-icon', `svg-icon--${props.name}`])
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 0;
}

.svg-icon:hover {
  opacity: 0.8;
}
</style>
```

#### SVG 图表组件

```vue
<!-- components/SVG/PieChart.vue -->
<template>
  <svg :width="size" :height="size" :viewBox="`-${size / 2} -${size / 2} ${size} ${size}`">
    <g v-for="(slice, index) in slices" :key="index">
      <path
        :d="slice.path"
        :fill="slice.color"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        @mouseenter="hoverSlice(index)"
        @mouseleave="leaveSlice()"
        :class="{ 'slice-active': activeIndex === index }"
      />
      <text
        v-if="activeIndex === index"
        :x="slice.labelX"
        :y="slice.labelY"
        text-anchor="middle"
        :fill="labelColor"
        font-size="14"
      >
        {{ slice.label }}
      </text>
    </g>
    <text x="0" y="5" text-anchor="middle" fill="#333" font-size="16" font-weight="bold">
      {{ centerLabel }}
    </text>
  </svg>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface PieData {
  name: string
  value: number
  color: string
}

const props = defineProps({
  data: {
    type: Array as PropType<PieData[]>,
    required: true
  },
  size: {
    type: Number,
    default: 400
  },
  innerRadius: {
    type: Number,
    default: 0
  },
  strokeColor: {
    type: String,
    default: '#fff'
  },
  strokeWidth: {
    type: Number,
    default: 2
  },
  labelColor: {
    type: String,
    default: '#333'
  }
})

const activeIndex = ref(-1)

const total = computed(() => props.data.reduce((sum, d) => sum + d.value, 0))

const slices = computed(() => {
  let startAngle = 0

  return props.data.map((d, i) => {
    const angle = (d.value / total.value) * Math.PI * 2
    const endAngle = startAngle + angle

    const radius = props.size / 2
    const innerRadius = props.innerRadius

    const x1 = Math.cos(startAngle) * radius
    const y1 = Math.sin(startAngle) * radius
    const x2 = Math.cos(endAngle) * radius
    const y2 = Math.sin(endAngle) * radius

    const x3 = Math.cos(endAngle) * innerRadius
    const y3 = Math.sin(endAngle) * innerRadius
    const x4 = Math.cos(startAngle) * innerRadius
    const y4 = Math.sin(startAngle) * innerRadius

    const largeArcFlag = angle > Math.PI ? 1 : 0

    let path: string

    if (innerRadius === 0) {
      path = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
    } else {
      path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`
    }

    const midAngle = startAngle + angle / 2
    const labelRadius = radius * 0.7
    const labelX = Math.cos(midAngle) * labelRadius
    const labelY = Math.sin(midAngle) * labelRadius

    startAngle = endAngle

    return {
      path,
      color: d.color,
      label: `${d.name}: ${Math.round((d.value / total.value) * 100)}%`,
      labelX,
      labelY
    }
  })
})

const centerLabel = computed(() => {
  return activeIndex.value >= 0
    ? props.data[activeIndex.value].name
    : '总计'
})

const hoverSlice = (index: number) => {
  activeIndex.value = index
}

const leaveSlice = () => {
  activeIndex.value = -1
}
</script>

<style scoped>
.slice-active {
  filter: brightness(1.1);
  cursor: pointer;
}
</style>
```

### Three.js 3D 入门

#### 安装 Three.js

```bash
npm install three @types/three
```

#### 基础 3D 场景

```vue
<!-- components/Three/BasicScene.vue -->
<template>
  <div ref="containerRef" class="three-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  },
  backgroundColor: {
    type: String,
    default: '#000000'
  }
})

const containerRef = ref<HTMLDivElement>()

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationId: number

const initScene = () => {
  if (!containerRef.value) return

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(props.backgroundColor)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    props.width / props.height,
    0.1,
    1000
  )
  camera.position.z = 5

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(props.width, props.height)
  containerRef.value.appendChild(renderer.domElement)

  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0x404040)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  // 添加物体
  addObjects()

  // 开始动画
  animate()
}

const addObjects = () => {
  // 创建立方体
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshPhongMaterial({ color: 0x42b983 })
  const cube = new THREE.Mesh(geometry, material)
  cube.name = 'cube'
  scene.add(cube)

  // 添加边框线
  const edges = new THREE.EdgesGeometry(geometry)
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0xffffff })
  )
  cube.add(line)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 旋转立方体
  const cube = scene.getObjectByName('cube')
  if (cube) {
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
  }

  renderer.render(scene, camera)
}

onMounted(() => {
  initScene()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  renderer.dispose()
})
</script>

<style scoped>
.three-container {
  display: inline-block;
}
</style>
```

### 本章小结

| 可视化方案 | 特点 | 适用场景 |
|------------|------|----------|
| ECharts | 功能丰富、配置简单 | 数据报表、大屏展示 |
| Canvas 2D | 高性能、灵活度高 | 自定义图表、图像处理 |
| SVG | 矢量、可缩放 | 图标、简单图表 |
| Three.js | 3D渲染、交互性强 | 3D场景、模型展示 |

---
