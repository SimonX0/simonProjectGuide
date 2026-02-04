# 第1章：Git基础入门

## 什么是 Git？

Git 是一个**开源的分布式版本控制系统**，由 Linux 之父 Linus Torvalds 在 2005 年创建。

### 版本控制系统的作用

想象一下，你在写一份重要的文档：

**没有版本控制**：
```
文档.doc
文档_最终版.doc
文档_最终版_v2.doc
文档_绝对不改版.doc
文档_真的最后一版.doc
```

**使用 Git**：
```
文档.doc (Git 自动记录所有历史版本)
```

## Git vs 其他版本控制系统

### 传统版本控制（如 SVN）

```
┌─────────┐
│ 服务器  │ ← 中央仓库
└─────────┘
   ↑   ↑
   │   │
  电脑A 电脑B (必须联网才能工作)
```

### Git（分布式）

```
┌─────────┐
│ 电脑A   │ ← 完整的仓库
└─────────┘

┌─────────┐
│ 电脑B   │ ← 完整的仓库
└─────────┘

┌─────────┐
│ GitHub  │ ← 远程仓库（可选）
└─────────┘
```

**Git 的优势**：
- 每个电脑都有完整的版本历史
- 可以离线工作
- 分支操作更快更安全

## 核心概念

### 1. 仓库（Repository）

仓库就是存放项目文件的地方，Git 会记录这个文件夹中的所有变化。

```bash
# 创建新仓库
git init

# 克隆远程仓库
git clone https://github.com/用户名/项目名.git
```

### 2. 工作区、暂存区、本地仓库、远程仓库

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   工作区     │ ──> │   暂存区     │ ──> │  本地仓库    │ ──> │  远程仓库    │
│ (Workspace)  │ add │  (Stage)     │commit│  (Local)    │ push │  (Remote)   │
│             │     │             │      │             │     │             │
│ 你编辑文件   │     │ 准备提交的   │      │ 已提交的版本 │     │ GitHub等    │
│ 的地方       │     │ 文件         │      │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

**举个例子**：

```bash
# 1. 在工作区编辑文件
echo "Hello Git" > test.txt

# 2. 添加到暂存区
git add test.txt

# 3. 提交到本地仓库
git commit -m "添加测试文件"

# 4. 推送到远程仓库
git push origin main
```

### 3. 提交（Commit）

提交就是保存项目的一个快照。

```bash
git commit -m "描述你的修改"
```

### 4. 分支（Branch）

分支让你可以并行开发，互不影响。

```
main (主分支)
  ├── feature-A (功能分支A)
  └── feature-B (功能分支B)
```

## 安装 Git

### Windows

1. 访问 https://git-scm.com/download/win
2. 下载安装包
3. 运行安装程序（使用默认设置即可）
4. 验证安装：

```bash
git --version
# 输出：git version 2.x.x
```

### macOS

```bash
# 使用 Homebrew 安装
brew install git
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install git
```

## 配置 Git

安装完成后，需要配置用户信息：

```bash
# 设置用户名
git config --global user.name "你的名字"

# 设置邮箱
git config --global user.email "你的邮箱@example.com"

# 查看配置
git config --list
```

**为什么要配置？**
每次提交都会记录这些信息，让其他人知道是谁做的修改。

## 第一次使用 Git

### 创建新项目

```bash
# 1. 创建项目文件夹
mkdir my-project
cd my-project

# 2. 初始化 Git 仓库
git init

# 3. 创建文件
echo "# 我的第一个Git项目" > README.md

# 4. 查看状态
git status

# 5. 添加文件
git add README.md

# 6. 提交
git commit -m "第一次提交"

# 7. 查看日志
git log
```

### 克隆现有项目

```bash
# 从 GitHub 克隆项目
git clone https://github.com/SimonX0/simonProjectGuide.git

# 进入项目目录
cd simonProjectGuide

# 查看状态
git status
```

## 常见问题

### Q1: Git 一定要用命令行吗？

**A**: 不一定。虽然命令行最强大，但也有图形界面工具：
- **GitHub Desktop** (Windows/Mac)
- **Sourcetree** (Windows/Mac)
- **VSCode 集成 Git** (推荐初学者)

### Q2: Git 和 GitHub 是什么关系？

**A**:
- **Git**: 版本控制工具（软件）
- **GitHub**: 托管代码的网站（服务）

就像：
- **Git**: 你的相册管理软件
- **GitHub**: 网盘相册

### Q3: 必须要学所有命令吗？

**A**: 不需要！掌握 20% 的常用命令就能解决 80% 的问题。

## 下一步

现在你已经了解了 Git 的基本概念，让我们开始学习[常用命令 →](chapter-02)
