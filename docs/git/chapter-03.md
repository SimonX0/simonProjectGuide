# 第3章：Git分支管理

## 3.1 理解分支

### 什么是分支？

想象一下你在玩游戏，可以同时保存多个存档：

- **存档1**：主线剧情进度
- **存档2**：尝试新装备组合
- **存档3**：挑战隐藏关卡

Git分支就像这些**游戏存档**，让你在不同"平行宇宙"中实验，互不影响！

```
时间线
  │
  ├─ main 分支 (主线存档 - 稳定版本)
  │   └── A → B → C
  │
  ├─ dev 分支 (开发存档 - 测试新功能)
  │   └── A → B → D → E
  │
  └─ feature 分支 (实验存档 - 大胆尝试)
      └── A → F → G
```

### 什么时候需要分支？

| 场景 | 说明 | 示例 |
|------|------|------|
| 🎯 开发新功能 | 不想影响稳定版本 | 开发"购物车"功能 |
| 🐛 修复紧急bug | 需要快速修复线上问题 | 生产环境崩溃了 |
| 👥 多人协作 | 每个人独立开发 | 小明做前端，小红做后端 |
| 🧪 实验性功能 | 可能会放弃的尝试 | 试试新的UI风格 |

### 为什么需要分支？

**场景 1：多人协作**
```
小明: 开发登录功能 → feature/login (存档A)
小红: 开发注册功能 → feature/register (存档B)
小刚: 修复bug → fix/bug-123 (存档C)
```
✅ 好处：三人互不干扰，不会覆盖对方的代码

**场景 2：版本管理**
```
main: 生产环境 (稳定的发布版 - v1.0)
dev: 开发环境 (最新功能 - v1.1开发中)
feature: 功能分支 (实验性功能 - 可能会放弃)
```
✅ 好处：线上版本永远稳定，出问题随时回滚

### 分支的价值

| 没有分支 | 有分支 |
|---------|--------|
| ❌ 修改代码就影响所有人 | ✅ 独立开发，互不影响 |
| ❌ 代码出问题难以回退 | ✅ 随时切换到稳定版本 |
| ❌ 多人协作容易冲突 | ✅ 各干各的，最后合并 |
| ❌ 不敢尝试新想法 | ✅ 放心实验，不行就删 |

---

## 3.2 分支基本操作

### 查看分支

**就像查看所有游戏存档**

```bash
# 查看本地分支（看本地存档）
git branch

# 查看所有分支（看本地+云端存档）
git branch -a

# 查看远程分支（只看云端存档）
git branch -r

# 查看分支最新提交（看存档时间）
git branch -v
```

**输出示例：**
```
* dev          # * 表示当前所在的分支
  main
  feature/login
```

### 创建分支

**什么时候用？**
- 🎯 要开发新功能
- 🐛 需要修复bug
- 🧪 想实验某个想法

```bash
# 创建分支（创建新存档，但不切换）
git branch dev

# 创建并切换到新分支（创建+直接进入）
git checkout -b dev

# 新写法（更简洁，推荐）
git switch -c dev

# 基于指定提交创建分支（回到某个历史点创建存档）
git checkout -b feature abc1234
```

**💡 记忆技巧：**
- `checkout -b` = 创建并切换（常用）
- `switch -c` = 创建并切换（新版写法，更好记）

### 切换分支

**就像在不同游戏存档之间切换**

```bash
# 切换到已存在的分支（进入存档）
git checkout dev

# 新写法（推荐，更直观）
git switch dev

# 切换到上一个分支（返回上一个存档）
git checkout -
```

**⚠️ 注意事项：**
- ✅ 切换前确保工作区是干净的（没有未保存的修改）
- ❌ 如果有未提交的修改，切换会失败（避免丢失代码）
- 💡 解决：先提交或暂存修改

### 删除分支

**什么时候用？**
- ✅ 功能开发完成，已合并到主分支
- ✅ 实验失败，想放弃这个方向
- ❌ 分支还有用，不要删（删了找不回来）

```bash
# 删除已合并的分支（安全删除）
git branch -d feature-login

# 强制删除未合并的分支（危险操作！）
git branch -D feature-login

# 删除远程分支（删除云端存档）
git push origin --delete feature-login
```

**💡 为什么需要 -D？**
Git为了保护你的代码，如果分支还有未合并的内容，会拒绝删除。`-D`是强制删除，相当于"我确定要删，别拦我"。

### 命令对比表

| 操作 | 旧命令 | 新命令（推荐） | 说明 |
|------|--------|---------------|------|
| 切换分支 | `git checkout dev` | `git switch dev` | 切换到其他分支 |
| 创建并切换 | `git checkout -b dev` | `git switch -c dev` | 新建分支并切换 |
| 回到上一个 | `git checkout -` | `git switch -` | 在两个分支间跳转 |

---

## 3.3 分支合并

### 合并方式 1：Merge（普通合并）

**就像把两个存档的进度合并**

**什么时候用？**
- ✅ 保留完整的开发历史
- ✅ 团队协作，需要看到谁做了什么
- ✅ 想要清晰的分支结构

```bash
# 1. 切换到目标分支（接收合并的分支）
git checkout main

# 2. 合并 dev 分支（把dev的进度合并进来）
git merge dev

# 3. 如果有冲突，解决后提交
git add .
git commit -m "合并dev分支"
```

**图示：**
```
Merge 前：
A --- B --- C (main)
       \
        D --- E (dev)

Merge 后：
A --- B --- C --- F (main)  ← F是合并提交
       \         /
        D --- E (dev)
```

**特点：**
| 优点 | 缺点 |
|------|------|
| ✅ 保留完整历史，可以看到分支结构 | ❌ 历史记录会有分叉 |
| ✅ 安全，不会改变已有提交 | ❌ 会有额外的"合并提交" |
| ✅ 团队协作推荐使用 | ❌ 提交历史可能复杂 |

---

### 合并方式 2：Rebase（变基）

**就像把你的存档"移动"到最新版本之后**

**什么时候用？**
- ✅ 想要线性的、干净的历史
- ✅ 个人开发的小分支
- ❌ **不要用于已推送的公共分支**（会改历史）

```bash
# 1. 切换到要移动的分支
git checkout feature

# 2. 将 feature 的提交"移到" main 之后
git rebase main
```

**图示：**
```
Rebase 前：
A --- B (main)
  \
   C --- D (feature)

Rebase 后：
A --- B --- C --- D (feature)  ← C和D被"移动"了
         (main)
```

**生活比喻：**
- **Merge**：两家人合并家谱，各自保留自己的历史
- **Rebase**：把一个人的出生日期改成今天，让他成为后代

**特点：**
| 优点 | 缺点 |
|------|------|
| ✅ 历史记录是线性的，很清晰 | ❌ 会改变提交历史（危险！） |
| ✅ 避免不必要的合并提交 | ❌ 不能用于已推送的分支 |
| ✅ 个人开发推荐使用 | ❌ 冲突可能需要多次解决 |

---

### Merge vs Rebase 如何选择？

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 🐛 合并功能分支到主分支 | **Merge** | 保留完整历史，方便回溯 |
| 👥 团队协作开发 | **Merge** | 安全，不会改历史 |
| 💻 个人开发小功能 | **Rebase** | 历史干净，线性发展 |
| 🎯 分支已推送到远程 | **Merge** | Rebase会改历史，导致冲突 |
| 🧪 实验性分支 | **Rebase** | 不需要保留实验历史 |

**💡 实用建议：**
- 新手默认用 `Merge`（安全）
- 个人小分支用 `Rebase`（干净）
- 千万不要 Rebase 已推送的公共分支！

---

## 3.4 解决冲突

### 什么时候会产生冲突？

**就像两个人同时编辑同一份文档的同一行**

```
场景：你在修改配置文件

main 分支:  端口号 = 8080
dev 分支:   端口号 = 3000
            ↑ 冲突！Git不知道听谁的
```

**常见冲突场景：**
| 场景 | 示例 |
|------|------|
| 👥 多人修改同一文件 | 小明改了第10行，小红也改了第10行 |
| 🔧 修改同一处代码 | 一个改函数名，一个改函数内容 |
| 📦 合并时版本差异大 | 长时间不合并，改动太多 |

### 冲突标记

当Git发现冲突，会在文件中标记出来：

```javascript
<<<<<<< HEAD      // 当前分支（main）的版本
var name = "张三";
=======          // 分隔线
var name = "李四";  // 要合并分支（dev）的版本
>>>>>>> dev       // 结束标记
```

**生活比喻：**
```
就像两个编辑在讨论：
=======
编辑A说：用这个名字
=======
编辑B说：用那个名字
=======
你来决定用哪个！
```

### 解决冲突步骤

**场景：合并dev分支到main，产生冲突**

```bash
# 1. 尝试合并
git merge dev

# 2. Git 提示有冲突
Auto-merging config.js
CONFLICT (content): Merge conflict in config.js
Automatic merge failed; fix conflicts and then commit the result.

# 3. 打开冲突文件，手动编辑
# 你会看到上面那样的冲突标记

# 4. 决定保留什么
# 选项A：保留当前分支的
var name = "张三";

# 选项B：保留被合并分支的
var name = "李四";

# 选项C：合并两者
var name = "张三 (又名: 李四)";

# 5. 删除冲突标记，保存文件

# 6. 标记冲突已解决（告诉Git：我搞定了）
git add config.js

# 7. 完成合并
git commit -m "合并dev分支，解决配置冲突"
```

### 冲突解决策略

**策略 1：保留当前分支（全部用我的）**

```bash
# 什么时候用？
# - 当前分支的版本肯定是对的
# - 被合并分支的版本是旧的

git checkout --ours config.js
git add config.js
```

**策略 2：保留被合并分支（全部用他的）**

```bash
# 什么时候用？
# - 被合并分支的版本更新
# - 当前分支的版本是旧的

git checkout --theirs config.js
git add config.js
```

**策略 3：中止合并（算了，不合并了）**

```bash
# 什么时候用？
# - 冲突太多，不想解决了
# - 发现现在不是合并的好时机

git merge --abort
# 回到合并前的状态，就像什么都没发生
```

### 冲突解决流程图

```
发现冲突
    ↓
┌─────────────────┐
│ 打开文件查看冲突 │
└─────────────────┘
    ↓
┌─────────────────┐    ┌──────────────┐    ┌──────────────┐
│  保留我的版本    │    │  保留他的版本  │    │  手动合并     │
│  --ours         │    │  --theirs     │    │  结合两者     │
└─────────────────┘    └──────────────┘    └──────────────┘
         ↓                      ↓                     ↓
                    ┌─────────────────────────────┐
                    │   删除冲突标记，保存文件      │
                    └─────────────────────────────┘
                                 ↓
                    ┌─────────────────────────────┐
                    │   git add <文件>             │
                    │   git commit -m "解决冲突"   │
                    └─────────────────────────────┘
```

### 💡 避免冲突的技巧

| 技巧 | 说明 |
|------|------|
| 🔄 频繁合并 | 不要等太久才合并，改动少冲突少 |
| 📋 先沟通 | 改动大文件前先问问同事要不要改 |
| 🎯 分支小一点 | 小分支改动少，冲突概率低 |
| 👀 查看改动 | 合并前先用 `git diff` 看看改了什么 |

---

## 3.5 分支管理最佳实践

### 1. 主分支保护（黄金法则）

**❌ 不要做：**
```bash
# 直接在 main 分支开发
git checkout main
# ... 修改代码 ...
git commit -m "添加新功能"  # 危险！
```

**✅ 应该做：**
```bash
# main 分支只用来：
# 1. 接受其他分支的合并
# 2. 打标签发布版本
# 3. 部署到生产环境

# 开发都在 dev 或 feature 分支
git checkout dev
git checkout -b feature/new-feature
```

**为什么？**
| 直接在main开发 | 用feature分支开发 |
|--------------|-----------------|
| ❌ 一个bug可能导致线上崩溃 | ✅ 出问题不影响main |
| ❌ 无法回滚到稳定版本 | ✅ 随时回到稳定版本 |
| ❌ 多人协作容易冲突 | ✅ 各干各的，最后合并 |

---

### 2. 功能分支工作流

**就像游戏的主线+支线任务**

```
main (主线 - 生产环境)
  ↓ 合并测试通过的代码
dev (日常任务 - 开发环境)
  ↓ 创建功能分支
feature-xxx (支线任务 - 具体功能)
```

**完整流程：**
```
1. 从 dev 创建 feature 分支
   └─ 就像接了一个支线任务

2. 在 feature 分支开发
   └─ 完成支线任务

3. 开发完成后合并回 dev
   └─ 任务完成，奖励入库

4. 测试通过后从 dev 合并到 main
   └─ 正式发布到生产
```

---

### 3. 分支命名规范

**就像给文件起名，要一眼看出内容**

| 类型 | 前缀 | 示例 | 说明 |
|------|------|------|------|
| 🎯 新功能 | `feature/` | `feature/user-login` | 开发新功能 |
| 🐛 Bug修复 | `fix/` 或 `bugfix/` | `fix/login-error` | 修复问题 |
| 🚀 发布版本 | `release/` | `release/v1.0.0` | 准备发布 |
| 🔥 紧急修复 | `hotfix/` | `hotfix/critical-bug` | 线上紧急问题 |
| 🧪 实验 | `exp/` 或 `test/` | `exp/new-ui` | 实验性功能 |
| 📚 文档 | `docs/` | `docs/api-guide` | 只改文档 |

**✅ 好的命名：**
```
feature/user-avatar-upload    ← 一眼看出是上传头像功能
fix/payment-timeout-error     ← 一眼看出是支付超时问题
hotfix/database-crash         ← 一眼看出是数据库崩溃紧急修复
```

**❌ 不好的命名：**
```
feature/abc                   ← 不知道是啥
fix/bug                       ← 太笼统
dev                           ← 和分支名重复
new-branch                    ← 没有前缀
```

---

### 4. 保持分支同步

**就像定期备份，避免丢失进度**

```bash
# 定期从 main 拉取更新到 dev
# 为什么？避免 dev 落后太多，合并时冲突爆炸

git checkout dev
git pull origin main

# 或者用 rebase 保持历史整洁
git rebase main
```

**同步频率建议：**
| 项目规模 | 同步频率 | 原因 |
|---------|---------|------|
| 👤 个人项目 | 每天1次 | 避免偏离太久 |
| 👥 小团队（2-5人） | 每天多次 | 团队成员可能随时推送 |
| 🏢 大团队（5+人） | 每天多次+合并前 | 避免冲突堆积 |

**💡 最佳实践：**
```bash
# 每天早上第一件事
git checkout dev
git pull origin main

# 合并其他分支前
git pull origin dev
git merge feature/xxx
```

---

### 5. 分支生命周期管理

**就像产品的生命周期**

```
创建分支
   ↓
开发中 (WIP - Work In Progress)
   ↓
开发完成
   ↓
合并到目标分支
   ↓
删除分支 (清理)
```

**什么时候删除分支？**

| 分支状态 | 是否删除 | 原因 |
|---------|---------|------|
| ✅ 已合并到主分支 | ✅ 立即删除 | 保留无用，占用空间 |
| ⚠️ 开发一半放弃 | ❌ 可选删除 | 可能以后需要 |
| 🔄 还在使用中 | ❌ 不要删除 | 还在用呢 |
| 📦 已发布的功能 | ✅ 合并后删除 | 历史已经记录在主分支 |

**删除分支的正确姿势：**
```bash
# 1. 确保已合并
git checkout main
git merge feature/xxx

# 2. 删除本地分支
git branch -d feature/xxx

# 3. 删除远程分支
git push origin --delete feature/xxx
```

---

## 3.6 常见分支策略

### 3.6.1 Git Flow（经典工作流）

**适合：大项目、有明确发布周期的团队**

```
┌─────────────────────────────────────┐
│           main (主分支)               │
│   • 生产环境代码                      │
│   • 每次发布打标签 (v1.0, v1.1...)    │
└─────────────────────────────────────┘
                 ↑ 合并
┌─────────────────────────────────────┐
│         develop (开发分支)            │
│   • 日常开发集成                      │
│   • 功能完成后合并到这里              │
└─────────────────────────────────────┘
                 ↑ 创建
┌─────────────────────────────────────┐
│    feature (功能分支)                 │
│   • 开发具体功能                      │
│   • 完成后合并到 develop              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    release (发布分支)                 │
│   • 准备发布时从 develop 创建         │
│   • 修复bug、测试、打磨               │
│   • 完成后合并到 main 和 develop      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    hotfix (紧急修复分支)              │
│   • 从 main 创建                     │
│   • 紧急修复线上问题                  │
│   • 完成后合并到 main 和 develop      │
└─────────────────────────────────────┘
```

**工作流程示例：**
```bash
# 1. 开发新功能
git checkout develop
git checkout -b feature/user-login
# ... 开发 ...
git checkout develop
git merge feature/user-login

# 2. 准备发布
git checkout -b release/v1.0.0 develop
# ... 修复bug、测试 ...
git checkout main
git merge release/v1.0.0  # 发布！
git tag v1.0.0

# 3. 紧急修复
git checkout -b hotfix/critical-bug main
# ... 修复 ...
git checkout main
git merge hotfix/critical-bug
git checkout develop
git merge hotfix/critical-bug
```

**✅ 优点：**
- 分支清晰，职责明确
- 适合有发布周期的项目（如每月发布一次）
- 支持紧急修复流程

**❌ 缺点：**
- 分支较多，对新手不友好
- 持续部署团队觉得太复杂

---

### 3.6.2 GitHub Flow（简化工作流）

**适合：持续部署的小团队、初创公司**

```
┌─────────────────────────────────────┐
│           main (主分支)               │
│   • 始终可部署                       │
│   • 任何提交都可能发布                │
└─────────────────────────────────────┘
                 ↑ 创建
┌─────────────────────────────────────┐
│        feature (功能分支)             │
│   • 从 main 创建                     │
│   • 开发完成后 Pull Request          │
│   • 审查通过后合并到 main             │
└─────────────────────────────────────┘
```

**工作流程示例：**
```bash
# 1. 从 main 创建功能分支
git checkout main
git checkout -b feature/new-feature

# 2. 开发并提交
git add .
git commit -m "添加新功能"

# 3. 推送到远程
git push -u origin feature/new-feature

# 4. 在 GitHub 创建 Pull Request
# 5. 团队审查代码
# 6. 审查通过后合并到 main
# 7. 自动部署到生产环境
```

**✅ 优点：**
- 简单易懂，新手友好
- 适合持续部署（一天多次发布）
- 强制代码审查（通过PR）

**❌ 缺点：**
- 不适合有明确发布周期的项目
- main分支必须始终稳定（需要好的测试）

---

### 3.6.3 GitLab Flow（环境工作流）

**适合：需要多环境测试的项目**

```
┌─────────────────────────────────────┐
│           main (主分支)               │
│   • 生产环境                         │
└─────────────────────────────────────┘
                 ↑ 合并
┌─────────────────────────────────────┐
│          pre-production              │
│   • 预生产环境                       │
│   • 最后测试阶段                     │
└─────────────────────────────────────┘
                 ↑ 合并
┌─────────────────────────────────────┐
│            staging                  │
│   • 测试环境                         │
│   • QA测试                           │
└─────────────────────────────────────┘
                 ↑ 合并
┌─────────────────────────────────────┐
│          develop (开发分支)           │
│   • 开发环境                         │
│   • 功能开发集成                     │
└─────────────────────────────────────┘
```

**工作流程示例：**
```bash
# 1. 在 develop 开发
git checkout develop
git checkout -b feature/new-feature
# ... 开发 ...
git checkout develop
git merge feature/new-feature

# 2. 合并到 staging 测试
git checkout staging
git merge develop
# ... QA测试 ...

# 3. 合并到 pre-production
git checkout pre-production
git merge staging
# ... 最终测试 ...

# 4. 合并到 main 生产
git checkout main
git merge pre-production
```

**✅ 优点：**
- 清晰的环境流程
- 适合需要多环境验证的项目
- 每个环境有专门分支

**❌ 缺点：**
- 分支多，流程复杂
- 合并步骤多，容易出错

---

### 三种策略对比

| 特性 | Git Flow | GitHub Flow | GitLab Flow |
|------|----------|-------------|-------------|
| 🎯 适用团队 | 大项目、有发布周期 | 小团队、持续部署 | 需要多环境测试 |
| 🌳 分支数量 | 5个分支 | 2个分支 | 4+个分支 |
| 📅 发布周期 | 定期发布（如每月） | 随时发布 | 定期发布 |
| 📚 学习难度 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 🔧 主要分支 | main + develop | main | main + develop |
| ✅ 核心特点 | 支持发布分支、热修复 | PR驱动、简单直接 | 多环境流程 |
| 🏢 代表公司 | 传统企业 | GitHub、创业公司 | GitLab |

**如何选择？**

```
你的团队情况 → 推荐策略
─────────────────────────────
小团队(1-5人) + 持续部署 → GitHub Flow
大团队(5+人) + 定期发布 → Git Flow
需要多环境测试 → GitLab Flow
个人项目 → 简化版 GitHub Flow
```

---

## 3.7 实战示例

### 场景1：开发新功能（完整流程）

**需求：为网站添加用户头像上传功能**

```bash
# ==================== 阶段1：准备开发 ====================
# 1. 确保在开发分支，并拉取最新代码
git checkout dev
git pull origin dev
# 为什么？避免本地代码过旧，产生冲突

# 2. 创建功能分支
git checkout -b feature/user-avatar-upload
# 为什么？独立开发，不影响dev分支

# ==================== 阶段2：开始编码 ====================
# 3. 查看当前状态（好习惯）
git status

# 4. 编写代码...
# - 创建 avatar-upload.js
# - 修改 user-profile.js
# - 添加样式文件

# 5. 查看修改了什么
git diff
# 为什么？确认修改正确，避免提交错误代码

# ==================== 阶段3：提交代码 ====================
# 6. 添加所有修改
git add .

# 7. 提交（写清楚做了什么）
git commit -m "feat: 添加用户头像上传功能

- 支持JPG/PNG格式
- 限制文件大小2MB
- 添加裁剪功能
- 添加进度提示"

# 8. 推送到远程（备份+团队可见）
git push -u origin feature/user-avatar-upload
# -u 参数：设置上游分支，下次只需 git push

# ==================== 阶段4：测试验证 ====================
# 9. 本地测试
pnpm docs:dev
# 在浏览器测试功能是否正常

# ==================== 阶段5：合并代码 ====================
# 10. 切换回dev分支
git checkout dev

# 11. 拉取最新dev代码
git pull origin dev
# 为什么？可能有其他人推送了代码

# 12. 合并功能分支
git merge feature/user-avatar-upload

# 13. 如果有冲突，解决后：
git add .
git commit -m "合并feature/user-avatar-upload，解决冲突"

# 14. 推送到远程
git push origin dev

# ==================== 阶段6：清理工作 ====================
# 15. 删除本地功能分支
git branch -d feature/user-avatar-upload

# 16. 删除远程功能分支
git push origin --delete feature/user-avatar-upload
# 为什么？分支任务完成，保留无用
```

**整个流程的时间线：**
```
Day 1: 创建分支 → 开始开发
Day 2: 继续开发 → 本地测试
Day 3: 推送远程 → 代码审查
Day 4: 合并到dev → 删除分支
```

---

### 场景2：紧急修复生产bug

**需求：线上登录功能崩溃，需要立即修复**

```bash
# ==================== 紧急情况！ ====================
# 场景：凌晨2点，用户反馈无法登录
# 检查日志发现是验证逻辑有问题

# ==================== 步骤1：创建修复分支 ====================
# 1. 立即切换到main分支
git checkout main

# 2. 拉取最新代码（确保是最新的生产版本）
git pull origin main

# 3. 创建紧急修复分支
git checkout -b hotfix/login-validation-bug
# 为什么用 hotfix？紧急修复线上问题

# ==================== 步骤2：快速修复 ====================
# 4. 定位问题：login.js 第50行逻辑错误
# 原来：if (password.length > 0)
# 修改为：if (password && password.length > 0)

# 5. 提交修复
git add login.js
git commit -m "hotfix: 修复登录验证空指针异常

问题：未检查password是否存在导致崩溃
影响：用户无法登录
修复：添加空值检查"

# 6. 推送到远程
git push -u origin hotfix/login-validation-bug

# ==================== 步骤3：紧急发布 ====================
# 7. 合并到main（立即部署）
git checkout main
git merge hotfix/login-validation-bug

# 8. 打标签记录这次修复
git tag -a v1.0.1 -m "紧急修复登录bug"

# 9. 推送到远程（触发自动部署）
git push origin main --tags

# ==================== 步骤4：同步到开发分支 ====================
# 10. 合并到dev（避免下次发布又出现这个问题）
git checkout dev
git merge hotfix/login-validation-bug
git push origin dev

# ==================== 步骤5：清理 ====================
# 11. 删除修复分支
git branch -d hotfix/login-validation-bug
git push origin --delete hotfix/login-validation-bug
```

**为什么这么着急？**
```
时间就是金钱！
- 电商网站：登录崩溃 = 每分钟损失几千元
- SaaS产品：用户无法使用 = 客户流失
- 企业应用：业务中断 = 重大事故

所以 hotfix 流程要：快！准！稳！
```

---

### 场景3：实验性功能（可能放弃）

**需求：尝试新的UI风格，不确定要不要用**

```bash
# ==================== 实验阶段 ====================
# 1. 创建实验分支
git checkout dev
git checkout -b exp/dark-theme-ui

# 2. 大胆尝试
# - 修改所有颜色配置
# - 更新组件样式
# - 添加深色模式切换

# 3. 提交实验
git add .
git commit -m "exp: 尝试深色主题UI

- 全新配色方案
- 暗色/亮色切换
- 可能会放弃"

git push -u origin exp/dark-theme-ui

# ==================== 决策阶段 ====================
# 场景A：实验成功 ✅
git checkout dev
git merge exp/dark-theme-ui
git branch -d exp/dark-theme-ui

# 场景B：实验失败 ❌
git branch -D exp/dark-theme-ui
git push origin --delete exp/dark-theme-ui
# 直接删除，不合并
```

---

### 场景对比表

| 场景 | 分支名称 | 创建自 | 合并到 | 是否保留 |
|------|---------|--------|--------|---------|
| 🎯 常规功能 | `feature/xxx` | dev | dev | ❌ 删除 |
| 🔥 紧急修复 | `hotfix/xxx` | main | main + dev | ❌ 删除 |
| 🧪 实验功能 | `exp/xxx` | dev | dev 或放弃 | ❌ 删除 |
| 🚀 版本发布 | `release/v1.0` | dev | main + dev | ❌ 删除 |

---

## 3.8 分支可视化工具

### 查看分支图

```bash
# 简单的分支图
git log --graph --oneline --all

# 更漂亮的分支图（推荐）
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --all

# 只看最近10条
git log --graph --oneline --all -10
```

**输出示例：**
```
* a1b2c3d (HEAD -> main) 合并新功能
|\
| * e5f6g7h (dev) 添加登录功能
* | b8c9d0e 修复bug
|/
* f1g2h3i 初始化项目
```

### GUI工具推荐

| 工具 | 平台 | 特点 | 推荐指数 |
|------|------|------|---------|
| **GitKraken** | Win/Mac/Linux | 图形化界面，美观 | ⭐⭐⭐⭐⭐ |
| **SourceTree** | Win/Mac | 免费，功能强大 | ⭐⭐⭐⭐ |
| **GitHub Desktop** | Win/Mac | 简单，适合GitHub | ⭐⭐⭐⭐ |
| **gitk** | 全平台 | Git自带，简单 | ⭐⭐⭐ |
| **VS Code Git** | VS Code | 集成在编辑器 | ⭐⭐⭐⭐ |

**💡 新手建议：**
- 学习阶段用命令行（理解原理）
- 日常开发用VS Code Git（方便）
- 复杂操作用GitKraken（可视化）

---

## 3.9 常见问题FAQ

### Q1: 什么时候用分支，什么时候不用？

**用分支：**
- ✅ 开发新功能（超过1小时）
- ✅ 修复bug（需要时间）
- ✅ 重构代码
- ✅ 多人协作

**不用分支：**
- ❌ 改个错别字
- ❌ 修改配置文件
- ❌ 5分钟能搞定的小改动

### Q2: 分支应该保持多久？

| 分支类型 | 建议时间 |
|---------|---------|
| feature | 1-7天（不要太久） |
| hotfix | 几小时-1天（越快越好） |
| release | 1-3天 |
| exp | 看情况（不行就删） |

### Q3: 本地分支和远程分支是什么关系？

```
本地分支 = 你电脑上的存档
远程分支 = 云端备份的存档

git push  → 本地推到云端（备份）
git pull  → 云端拉到本地（同步）
```

### Q4: 删除分支后代码会丢吗？

**不会！**

```
feature分支合并到dev后：
- feature分支删除 ✓
- 但代码已经在dev中 ✓
- 历史记录完整保留 ✓

删除分支只是删除"指针"，代码已经在目标分支了
```

### Q5: 如何处理太多分支？

```bash
# 查看所有分支
git branch -a

# 删除已合并的本地分支
git branch -d $(git branch --merged)

# 删除已合并的远程分支
git remote prune origin
```

---

## 3.8 练习题

### 3.8.1 基础练习

**练习 1：创建和管理分支**

```bash
# 任务：完成分支创建、切换和删除

# 1. 查看当前分支
git branch

# 2. 创建 feature 分支
git branch feature/login

# 3. 切换到 feature 分支
git checkout feature/login

# 4. 在新分支创建文件
echo "Login Feature" > login.js
git add login.js
git commit -m "feat: 添加登录功能"

# 5. 切换回 main 分支
git checkout main

# 6. 合并 feature 分支
git merge feature/login

# 7. 删除 feature 分支
git branch -d feature/login

# 8. 查看分支列表
git branch
```

**练习 2：解决冲突**

```bash
# 任务：模拟分支冲突并解决

# 1. 创建并切换到 branch-a
git checkout -b branch-a
echo "Version A" > config.txt
git add config.txt
git commit -m "feat: 版本A"

# 2. 切换回 main
git checkout main
echo "Version B" > config.txt
git add config.txt
git commit -m "feat: 版本B"

# 3. 尝试合并 branch-a（会有冲突）
git merge branch-a

# 4. 解决冲突
# 编辑 config.txt，选择保留哪个版本或合并
# 例如：保留版本B并添加版本A的内容
echo "Version B
Version A (merged)" > config.txt

# 5. 标记冲突已解决
git add config.txt

# 6. 完成合并
git commit -m "merge: 合并分支，解决冲突"

# 7. 删除 branch-a
git branch -d branch-a
```

**练习 3：远程分支操作**

```bash
# 任务：学习远程分支管理

# 1. 推送本地分支到远程
git checkout -b feature/new
echo "New Feature" > feature.txt
git add feature.txt
git commit -m "feat: 新功能"

# 2. 推送到远程（创建远程分支）
git push -u origin feature/new

# 3. 查看远程分支
git branch -r

# 4. 删除远程分支（在本地删除）
git push origin --delete feature/new

# 5. 删除本地分支
git branch -d feature/new
```

**练习 4：分支重命名**

```bash
# 任务：重命名分支

# 1. 重命名当前分支
git branch -m old-name new-name

# 2. 重命名指定分支
git branch -m old-name new-name

# 3. 重命名远程分支
git branch -m new-name old-name  # 先重命名本地
git push origin :old-name new-name  # 再推送远程
```

### 3.8.2 进阶练习

**练习 5：Rebase 实战**

```bash
# 任务：使用 rebase 整理提交历史

# 1. 创建测试分支
git checkout -b test-rebase

# 2. 创建多个提交
echo "Change 1" > test.txt
git add test.txt
git commit -m "add: 第一次修改"

echo "Change 2" >> test.txt
git add test.txt
git commit -m "update: 更新内容"

echo "Typo fix" >> test.txt
git add test.txt
git commit -m "fix: 修正错别字"

echo "Feature complete" >> test.txt
git add test.txt
git commit -m "done: 功能完成"

# 3. 查看历史（会有4个提交）
git log --oneline

# 4. 交互式 rebase（合并前3个提交）
git rebase -i HEAD~4
# 在编辑器中：
# - 将前3个提交的 pick 改为 squash
# - 保存并退出

# 5. 写一个新的提交信息
# 例如："feat: 实现测试功能（包含多次修改）"

# 6. 查看结果（只有2个提交）
git log --oneline
```

**练习 6：查看分支图**

```bash
# 任务：学习不同的分支图查看方式

# 1. 查看本地分支图
git log --graph --oneline --all

# 2. 查看分支图
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr)' --abbrev-commit

# 3. 查看分支关系
git show-branch

# 4. 查看合并历史
git log --graph --merges
```

**练习 7：cherry-pick 实战**

```bash
# 任务：选择性合并其他分支的提交

# 1. 创建 branch-a
git checkout -b branch-a
echo "Feature A1" > feature.txt
git add feature.txt
git commit -m "feat(A1): 功能A第一部分"

# 2. 在 branch-a 上再添加一个提交
echo "Feature A2" >> feature.txt
git add feature.txt
git commit -m "feat(A2): 功能A第二部分"

# 3. 切换回 main
git checkout main

# 4. 从 branch-a 挑选某一个提交
git cherry-pick <commit-hash-of-A2>

# 5. 查看结果
git log --oneline -3

# 6. 删除 branch-a
git branch -D branch-a
```

**练习 8：stash 实战**

```bash
# 任务：使用 stash 临时保存工作

# 1. 在当前分支修改文件
echo "Work in progress" > working.txt
git status

# 2. 临时保存工作
git stash
git status  # 应该是干净的

# 3. 切换到其他分支工作
git checkout main
echo "Hot fix" > hotfix.txt
git add hotfix.txt
git commit -m "fix: 紧急修复"

# 4. 切回原分支
git checkout -

# 5. 恢复工作
git stash pop

# 6. 查看所有 stash
git stash list

# 7. 清除 stash
git stash drop
```

---

## 3.9 学习检查清单

完成本章学习后，请检查自己是否掌握以下内容：

### 分支基础 ⭐⭐⭐⭐⭐

- [ ] 理解分支的概念和作用
- [ ] 能够创建、切换、删除分支
- [ ] 掌握 `git checkout` 的各种用法
- [ ] 理解 HEAD 指针的概念
- [ ] 知道如何查看所有分支

### 分支合并 ⭐⭐⭐⭐

- [ ] 能够使用 `git merge` 合并分支
- [ ] 了解常见的合并冲突原因
- [ ] 能够独立解决基本的合并冲突
- [ ] 理解 `--no-ff` 和 `--squash` 的区别
- [ ] 知道如何处理复杂冲突

### 远程分支 ⭐⭐⭐⭐

- [ ] 理解本地分支和远程分支的关系
- [ ] 能够推送新分支到远程
- [ ] 掌握 `git pull` 和 `git fetch` 的区别
- [ ] 能够删除远程分支
- [ ] 理解分支追踪（tracking）

### 高级操作 ⭐⭐⭐

- [ ] 能够使用 `git rebase` 整理提交历史
- [ ] 理解 rebase 和 merge 的区别
- [ ] 能够使用 `git cherry-pick` 选择提交
- [ ] 掌握 `git stash` 管理临时工作
- [ ] 了解分支命名规范和最佳实践

### 💡 实战能力

**完成以下任务来检验学习成果**：

1. ✅ 能够创建并管理 feature 分支
2. ✅ 能够独立解决分支合并冲突
3. ✅ 能够正确使用远程分支进行协作
4. ✅ 能够使用 rebase 整理提交历史
5. ✅ 知道什么时候使用 merge，什么时候使用 rebase

---

## 3.10 相关章节推荐

学完本章后，你可以继续学习：

**必读章节**：
- 📚 [第4章：Git工作流程](workflow) - 学习完整的团队协作流程
- 🛠️ [第5章：Git实战技巧](chapter-05) - 提升工作效率

**实战项目**：
- 💻 在实际项目中使用分支进行功能开发
- 👥 与团队成员协作，使用分支管理代码
- 📝 建立自己的分支管理规范

---

## 3.11 延伸阅读

**推荐资源**：
- [Git Branching 模型](https://learngitbranching.js.org/) - 可视化学习 Git 分支
- [Git Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/) - 了解不同的工作流程
- [Interactive Rebase](https://git-scm.com/docs/git-rebase) -深入学习 rebase

**工具推荐**：
- [SourceTree](https://www.sourcetreeapp.com/) - 免费的 Git 图形化客户端
- [GitKraken](https://www.gitkraken.com/) - 界面优美的 Git 客户端
- [Git GUI Clients](https://git-scm.com/downloads/guis) - 官方推荐的客户端列表

**视频教程**：
- [Git 分支管理详解](https://www.bilibili.com/video/BV1pY4y1p7Mh)
- [Git 合并冲突解决](https://www.bilibili.com/video/BV16Nuxh6QYg)

准备好进入下一章了吗？让我们学习实际的[工作流程 →](workflow)！

---

## 下一步

掌握了分支管理后，让我们学习[工作流程 →](workflow)
