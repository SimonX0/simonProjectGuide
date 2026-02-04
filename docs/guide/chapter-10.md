# 条件渲染与列表渲染

## 条件渲染与列表渲染

> **学习目标**：掌握条件渲染和列表渲染
> **核心内容**：v-if/v-show、v-for、key 的作用

### 条件渲染 v-if / v-show

```vue
<script setup lang="ts">
import { ref } from "vue";

const isLogin = ref(true);
const isVisible = ref(true);
const score = ref(85);
</script>

<template>
  <div>
    <!-- v-if：不满足条件时元素不存在 -->
    <p v-if="isLogin">欢迎回来！</p>
    <p v-else>请先登录</p>

    <!-- v-show：元素始终存在，只是隐藏 -->
    <p v-show="isVisible">我能看见你</p>

    <!-- 多条件判断 -->
    <div v-if="score >= 90">优秀</div>
    <div v-else-if="score >= 60">及格</div>
    <div v-else>不及格</div>
  </div>
</template>
```

### 列表渲染 v-for

```vue
<script setup lang="ts">
import { ref } from "vue";

interface User {
  id: number;
  name: string;
  role: string;
}

const items = ref([
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
]);

const user = ref({
  name: "张三",
  age: 25,
  city: "北京",
});
</script>

<template>
  <div>
    <!-- 遍历数组 -->
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>

    <!-- 遍历对象 -->
    <li v-for="(value, key) in user" :key="key">{{ key }}: {{ value }}</li>

    <!-- 带索引 -->
    <li v-for="(item, index) in items" :key="item.id">
      {{ index }} - {{ item.name }}
    </li>
  </div>
</template>
```

### 实战案例：任务管理看板

下面是一个完整的任务管理看板，综合运用条件渲染和列表渲染：

```vue
<!-- TaskBoard.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";

// 任务接口
interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate: string;
  tags: string[];
}

// 任务列表
const tasks = ref<Task[]>([
  {
    id: 1,
    title: "完成Vue3组件开发",
    description: "使用组合式API开发用户列表组件",
    status: "todo",
    priority: "high",
    assignee: "张三",
    dueDate: "2026-01-15",
    tags: ["Vue3", "组件"],
  },
  {
    id: 2,
    title: "修复登录Bug",
    description: "用户登录后token过期处理",
    status: "in-progress",
    priority: "high",
    assignee: "李四",
    dueDate: "2026-01-14",
    tags: ["Bug", "紧急"],
  },
  {
    id: 3,
    title: "编写API文档",
    description: "完善后端接口文档",
    status: "done",
    priority: "medium",
    assignee: "王五",
    dueDate: "2026-01-10",
    tags: ["文档"],
  },
  {
    id: 4,
    title: "优化页面性能",
    description: "首屏加载速度优化",
    status: "todo",
    priority: "medium",
    assignee: "赵六",
    dueDate: "2026-01-20",
    tags: ["性能"],
  },
]);

// 筛选条件
const filterStatus = ref<string>("all");
const filterPriority = ref<string>("all");
const searchKeyword = ref("");

// 新建任务表单
const showAddForm = ref(false);
const newTask = ref<Partial<Task>>({
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assignee: "",
  dueDate: "",
  tags: [],
});

// ===== 计算属性 =====

// 根据条件筛选任务
const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    // 状态筛选
    if (filterStatus.value !== "all" && task.status !== filterStatus.value) {
      return false;
    }
    // 优先级筛选
    if (
      filterPriority.value !== "all" &&
      task.priority !== filterPriority.value
    ) {
      return false;
    }
    // 关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      return (
        task.title.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword) ||
        task.assignee.toLowerCase().includes(keyword)
      );
    }
    return true;
  });
});

// 按状态分组的任务
const tasksByStatus = computed(() => {
  return {
    todo: filteredTasks.value.filter((t) => t.status === "todo"),
    inProgress: filteredTasks.value.filter((t) => t.status === "in-progress"),
    done: filteredTasks.value.filter((t) => t.status === "done"),
  };
});

// 任务统计
const taskStats = computed(() => {
  const total = tasks.value.length;
  const todo = tasks.value.filter((t) => t.status === "todo").length;
  const inProgress = tasks.value.filter(
    (t) => t.status === "in-progress"
  ).length;
  const done = tasks.value.filter((t) => t.status === "done").length;
  return { total, todo, inProgress, done };
});

// ===== 方法 =====

// 添加任务
const addTask = () => {
  if (!newTask.value.title?.trim()) {
    alert("请输入任务标题");
    return;
  }

  tasks.value.push({
    id: Date.now(),
    title: newTask.value.title,
    description: newTask.value.description || "",
    status: (newTask.value.status as Task["status"]) || "todo",
    priority: (newTask.value.priority as Task["priority"]) || "medium",
    assignee: newTask.value.assignee || "未分配",
    dueDate: newTask.value.dueDate || "",
    tags: newTask.value.tags || [],
  });

  // 重置表单
  newTask.value = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignee: "",
    dueDate: "",
    tags: [],
  };
  showAddForm.value = false;
};

// 更改任务状态
const changeStatus = (taskId: number, newStatus: Task["status"]) => {
  const task = tasks.value.find((t) => t.id === taskId);
  if (task) {
    task.status = newStatus;
  }
};

// 删除任务
const deleteTask = (taskId: number) => {
  if (confirm("确定要删除这个任务吗？")) {
    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index > -1) {
      tasks.value.splice(index, 1);
    }
  }
};

// 获取优先级颜色
const getPriorityColor = (priority: Task["priority"]) => {
  const colors = {
    low: "#67c23a",
    medium: "#e6a23c",
    high: "#f56c6c",
  };
  return colors[priority];
};

// 获取优先级文本
const getPriorityText = (priority: Task["priority"]) => {
  const texts = {
    low: "低",
    medium: "中",
    high: "高",
  };
  return texts[priority];
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return "无截止日期";
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};
</script>

<template>
  <div class="task-board">
    <!-- 头部 -->
    <header class="board-header">
      <h1>📋 任务管理看板</h1>
      <div class="header-actions">
        <button @click="showAddForm = true" class="btn-add">+ 新建任务</button>
      </div>
    </header>

    <!-- 统计信息 -->
    <div class="task-stats">
      <div class="stat-item">
        <span class="stat-label">总任务</span>
        <span class="stat-value">{{ taskStats.total }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">待办</span>
        <span class="stat-value todo">{{ taskStats.todo }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">进行中</span>
        <span class="stat-value in-progress">{{ taskStats.inProgress }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已完成</span>
        <span class="stat-value done">{{ taskStats.done }}</span>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filters">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索任务..."
        class="search-input"
      />
      <select v-model="filterStatus" class="filter-select">
        <option value="all">全部状态</option>
        <option value="todo">待办</option>
        <option value="in-progress">进行中</option>
        <option value="done">已完成</option>
      </select>
      <select v-model="filterPriority" class="filter-select">
        <option value="all">全部优先级</option>
        <option value="high">高优先级</option>
        <option value="medium">中优先级</option>
        <option value="low">低优先级</option>
      </select>
    </div>

    <!-- 任务看板 -->
    <div class="board-columns">
      <!-- 待办列 -->
      <div class="board-column">
        <div class="column-header todo">
          <h2>待办</h2>
          <span class="task-count">{{ tasksByStatus.todo.length }}</span>
        </div>
        <div class="task-list">
          <div
            v-for="task in tasksByStatus.todo"
            :key="task.id"
            class="task-card"
          >
            <div class="task-header">
              <span
                class="priority-badge"
                :style="{ backgroundColor: getPriorityColor(task.priority) }"
              >
                {{ getPriorityText(task.priority) }}
              </span>
              <button @click="deleteTask(task.id)" class="btn-delete">×</button>
            </div>
            <h3 class="task-title">{{ task.title }}</h3>
            <p class="task-description">{{ task.description }}</p>
            <div class="task-meta">
              <span class="task-assignee">👤 {{ task.assignee }}</span>
              <span class="task-due-date"
                >📅 {{ formatDate(task.dueDate) }}</span
              >
            </div>
            <div class="task-tags">
              <span v-for="tag in task.tags" :key="tag" class="tag">{{
                tag
              }}</span>
            </div>
            <div class="task-actions">
              <button
                @click="changeStatus(task.id, 'in-progress')"
                class="btn-start"
              >
                开始任务
              </button>
            </div>
          </div>
          <div v-if="tasksByStatus.todo.length === 0" class="empty-column">
            暂无待办任务
          </div>
        </div>
      </div>

      <!-- 进行中列 -->
      <div class="board-column">
        <div class="column-header in-progress">
          <h2>进行中</h2>
          <span class="task-count">{{ tasksByStatus.inProgress.length }}</span>
        </div>
        <div class="task-list">
          <div
            v-for="task in tasksByStatus.inProgress"
            :key="task.id"
            class="task-card"
          >
            <div class="task-header">
              <span
                class="priority-badge"
                :style="{ backgroundColor: getPriorityColor(task.priority) }"
              >
                {{ getPriorityText(task.priority) }}
              </span>
              <button @click="deleteTask(task.id)" class="btn-delete">×</button>
            </div>
            <h3 class="task-title">{{ task.title }}</h3>
            <p class="task-description">{{ task.description }}</p>
            <div class="task-meta">
              <span class="task-assignee">👤 {{ task.assignee }}</span>
              <span class="task-due-date"
                >📅 {{ formatDate(task.dueDate) }}</span
              >
            </div>
            <div class="task-tags">
              <span v-for="tag in task.tags" :key="tag" class="tag">{{
                tag
              }}</span>
            </div>
            <div class="task-actions">
              <button @click="changeStatus(task.id, 'todo')" class="btn-back">
                暂停
              </button>
              <button
                @click="changeStatus(task.id, 'done')"
                class="btn-complete"
              >
                完成
              </button>
            </div>
          </div>
          <div
            v-if="tasksByStatus.inProgress.length === 0"
            class="empty-column"
          >
            暂无进行中任务
          </div>
        </div>
      </div>

      <!-- 已完成列 -->
      <div class="board-column">
        <div class="column-header done">
          <h2>已完成</h2>
          <span class="task-count">{{ tasksByStatus.done.length }}</span>
        </div>
        <div class="task-list">
          <div
            v-for="task in tasksByStatus.done"
            :key="task.id"
            class="task-card completed"
          >
            <div class="task-header">
              <span
                class="priority-badge"
                :style="{ backgroundColor: getPriorityColor(task.priority) }"
              >
                {{ getPriorityText(task.priority) }}
              </span>
              <button @click="deleteTask(task.id)" class="btn-delete">×</button>
            </div>
            <h3 class="task-title">{{ task.title }}</h3>
            <p class="task-description">{{ task.description }}</p>
            <div class="task-meta">
              <span class="task-assignee">👤 {{ task.assignee }}</span>
              <span class="task-due-date"
                >📅 {{ formatDate(task.dueDate) }}</span
              >
            </div>
            <div class="task-tags">
              <span v-for="tag in task.tags" :key="tag" class="tag">{{
                tag
              }}</span>
            </div>
            <div class="task-actions">
              <button
                @click="changeStatus(task.id, 'in-progress')"
                class="btn-reopen"
              >
                重新打开
              </button>
            </div>
          </div>
          <div v-if="tasksByStatus.done.length === 0" class="empty-column">
            暂无已完成任务
          </div>
        </div>
      </div>
    </div>

    <!-- 新建任务弹窗 -->
    <div
      v-if="showAddForm"
      class="modal-overlay"
      @click.self="showAddForm = false"
    >
      <div class="modal">
        <h2>新建任务</h2>
        <form @submit.prevent="addTask">
          <div class="form-group">
            <label>任务标题 *</label>
            <input
              v-model="newTask.title"
              type="text"
              placeholder="输入任务标题"
              required
            />
          </div>
          <div class="form-group">
            <label>任务描述</label>
            <textarea
              v-model="newTask.description"
              placeholder="输入任务描述"
              rows="3"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>优先级</label>
              <select v-model="newTask.priority">
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            <div class="form-group">
              <label>负责人</label>
              <input
                v-model="newTask.assignee"
                type="text"
                placeholder="输入负责人"
              />
            </div>
          </div>
          <div class="form-group">
            <label>截止日期</label>
            <input v-model="newTask.dueDate" type="date" />
          </div>
          <div class="form-actions">
            <button
              type="button"
              @click="showAddForm = false"
              class="btn-cancel"
            >
              取消
            </button>
            <button type="submit" class="btn-submit">创建任务</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-board {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.board-header h1 {
  margin: 0;
  color: #303133;
}

.btn-add {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-add:hover {
  background: #35a872;
}

.task-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  background: white;
  padding: 15px 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-label {
  display: block;
  color: #909399;
  font-size: 12px;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-value.todo {
  color: #e6a23c;
}
.stat-value.in-progress {
  color: #409eff;
}
.stat-value.done {
  color: #67c23a;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.board-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.board-column {
  background: #e5e9f2;
  border-radius: 8px;
  padding: 15px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.column-header.todo {
  background: #e6a23c;
  color: white;
}
.column-header.in-progress {
  background: #409eff;
  color: white;
}
.column-header.done {
  background: #67c23a;
  color: white;
}

.column-header h2 {
  margin: 0;
  font-size: 16px;
}

.task-count {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 200px;
}

.task-card {
  background: white;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.task-card.completed {
  opacity: 0.8;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.priority-badge {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  color: white;
  font-weight: bold;
}

.btn-delete {
  background: none;
  border: none;
  color: #909399;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}

.btn-delete:hover {
  color: #f56c6c;
}

.task-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #303133;
}

.task-description {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #909399;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 12px;
}

.tag {
  padding: 2px 8px;
  background: #f0f2f5;
  border-radius: 3px;
  font-size: 11px;
  color: #606266;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.task-actions button {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.task-actions button:hover {
  opacity: 0.8;
}

.btn-start {
  background: #409eff;
  color: white;
}

.btn-back {
  background: #e6a23c;
  color: white;
}

.btn-complete {
  background: #67c23a;
  color: white;
}

.btn-reopen {
  background: #909399;
  color: white;
}

.empty-column {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
  font-size: 14px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 25px;
  width: 500px;
  max-width: 90%;
}

.modal h2 {
  margin: 0 0 20px 0;
  color: #303133;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 10px 20px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .board-columns {
    grid-template-columns: 1fr;
  }
}
</style>
```

**案例说明：**

1. **条件渲染使用**：

   - `v-if` / `v-else-if` / `v-else`：根据任务状态显示不同内容
   - `v-show`：弹窗显示控制
   - 多重条件判断：状态筛选、优先级筛选

2. **列表渲染使用**：

   - `v-for` 遍历任务数组
   - 使用 `:key` 确保高效渲染
   - 遍历标签数组、筛选选项等

3. **关键知识点**：
   - `v-if` vs `v-show`：`v-if` 是真正的条件渲染，`v-show` 只是 CSS 切换
   - `:key` 的作用：帮助 Vue 识别节点，优化 diff 算法
   - 计算属性 + 条件渲染：动态筛选任务列表

---
