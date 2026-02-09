---
title: Java开发工具速查手册
---

# Java开发工具速查手册

> **更新时间**：2026年2月 | **适用版本**：IntelliJ IDEA 2024+

## 📚 目录

- [IntelliJ IDEA快捷键](#intellij-idea快捷键)
- [Maven常用命令](#maven常用命令)
- [Git常用操作](#git常用操作)
- [调试技巧](#调试技巧)
- [常用插件推荐](#常用插件推荐)

---

## IntelliJ IDEA快捷键

### 🎯 最常用快捷键

| 功能 | Windows/Linux | macOS |
|-----|---------------|--------|
| **智能提示** | `Ctrl + Space` | `Ctrl + Space` |
| **万能修复** | `Alt + Enter` | `⌥ + Enter` |
| **查找类** | `Ctrl + N` | `⌘ + O` |
| **查找文件** | `Ctrl + Shift + N` | `⌘ + Shift + O` |
| **查找所有** | `Shift + Shift`（双击） | `Shift + Shift`（双击） |
| **格式化代码** | `Ctrl + Alt + L` | `⌘ + ⌥ + L` |
| **优化导入** | `Ctrl + Alt + O` | `⌘ + ⌥ + O` |
| **重命名** | `Shift + F6` | `F6` |
| **复制行** | `Ctrl + D` | `⌘ + D` |
| **删除行** | `Ctrl + Y` | `⌘ + Delete` |

### 📝 编辑快捷键

| 功能 | Windows/Linux | macOS |
|-----|---------------|--------|
| **上下移动行** | `Alt + Shift + ↑/↓` | `⌥ + ⇧ + ↑/↓` |
| **复制当前行到上一行** | `Ctrl + Alt + Enter` | `⌘ + ⌥ + Enter` |
| **当前行下插入新行** | `Shift + Enter` | `⌘ + Enter` |
| **选中单词** | `Ctrl + W`（连续按） | `⌥ + W`（连续按） |
| **大小写转换** | `Ctrl + Shift + U` | `⌘ + ⇧ + U` |
| **多光标编辑** | `Alt + Shift + 点击` | `⌥ + ⇧ + 点击` |
| **列选择模式** | `Alt + 拖动` | `⌥ + 拖动` |

### 🔍 查找与替换

| 功能 | Windows/Linux | macOS |
|-----|---------------|--------|
| **在文件中查找** | `Ctrl + F` | `⌘ + F` |
| **在路径中查找** | `Ctrl + Shift + F` | `⌘ + ⇧ + F` |
| **替换** | `Ctrl + R` | `⌘ + R` |
| **在路径中替换** | `Ctrl + Shift + R` | `⌘ + ⇧ + R` |
| **查找使用位置** | `Alt + F7` | `⌥ + F7` |
| **高亮当前选中** | `Alt + J`（连续按） | `⌥ + J`（连续按） |

### 🚂 代码导航

| 功能 | Windows/Linux | macOS |
|-----|---------------|--------|
| **跳转到实现** | `Ctrl + Alt + B` | `⌘ + ⌥ + B` |
| **跳转到定义** | `Ctrl + B` / `Ctrl + 点击` | `⌘ + B` / `⌘ + 点击` |
| **后退/前进** | `Ctrl + Alt + ←/→` | `⌘ + [ / ]` |
| **最近文件** | `Ctrl + E` | `⌘ + E` |
| **最近修改** | `Shift + Alt + C` | `⇧ + ⌥ + C` |
| **查看结构** | `Ctrl + F12` | `⌘ + F12` |
| **显示方法列表** | `Ctrl + F12`（再次按） | `⌘ + F12`（再次按） |
| **书签** | `F11`（添加/删除）<br>`Shift + F11`（显示） | `F11`（添加/删除）<br>`⇧ + F11`（显示） |

### 🎛️ 运行与调试

| 功能 | Windows/Linux | macOS |
|-----|---------------|--------|
| **运行** | `Shift + F10` | `⌃ + R` |
| **调试** | `Shift + F9` | `⌃ + D` |
| **停止** | `Ctrl + F2` | `⌘ + F2` |
| **步过** | `F8` | `F8` |
| **步入** | `F7` | `F7` |
| **步出** | `Shift + F8` | `⇧ + F8` |
| **运行到光标** | `Alt + F9` | `⌥ + F9` |
| **查看表达式值** | `Alt + F8` | `⌥ + F8` |

### 📦 版本控制

| 功能 | Windows/Linux | macOS |
|-----|---------------|--------|
| **提交** | `Ctrl + K` | `⌘ + K` |
| **推送** | `Ctrl + Shift + K` | `⌘ + ⇧ + K` |
| **拉取** | `Ctrl + T` | `⌘ + T` |
| **更新项目** | `Ctrl + T` | `⌘ + T` |

### 🔧 重构快捷键

| 功能 | Windows/Linux | macOS |
|-----|---------------|--------|
| **重命名** | `Shift + F6` | `F6` |
| **提取方法** | `Ctrl + Alt + M` | `⌘ + ⌥ + M` |
| **提取变量** | `Ctrl + Alt + V` | `⌘ + ⌥ + V` |
| **内联变量/方法** | `Ctrl + Alt + N` | `⌘ + ⌥ + N` |
| **移动** | `F6` | `F6` |
| **复制** | `F5` | `F5` |
| **安全删除** | `Alt + Delete` | `⌥ + Delete` |

---

## Maven常用命令

### 📦 基础命令

```bash
# 清理
mvn clean

# 编译
mvn compile

# 打包（跳过测试）
mvn package -DskipTests

# 安装到本地仓库
mvn install

# 运行测试
mvn test

# 指定模块打包
mvn clean package -pl module-name -am

# 查看依赖树
mvn dependency:tree

# 查看有效POM
mvn help:effective-pom
```

### 🏗️ 生命周期命令

```bash
# 完整生命周期
mvn clean compile test package install deploy

# 清理 + 编译
mvn clean compile

# 清理 + 打包
mvn clean package

# 跳过测试打包
mvn clean package -DskipTests

# 只运行测试
mvn test

# 运行指定测试类
mvn test -Dtest=TestClassName

# 运行指定测试方法
mvn test -Dtest=TestClassName#methodName
```

### 🔍 依赖管理

```bash
# 查看依赖树
mvn dependency:tree

# 分析依赖（找出冲突）
mvn dependency:analyze

# 强制更新快照
mvn clean install -U

# 排除特定依赖
mvn dependency:tree -Dverbose -Dincludes=groupId:artifactId
```

---

## Git常用操作（IDEA集成）

### 🔀 基础操作

| 操作 | 快捷键（Win） | 快捷键（Mac） |
|-----|--------------|-------------|
| **提交** | `Ctrl + K` | `⌘ + K` |
| **推送** | `Ctrl + Shift + K` | `⌘ + ⇧ + K` |
| **拉取** | `Ctrl + T` | `⌘ + T` |
| **更新项目** | `Ctrl + T` | `⌘ + T` |
| **查看历史** | `Alt + 9` | `⌥ + 9` |
| **查看分支** | `Alt + 0` | `⌥ + 0` |

### 🌿 分支操作

```bash
# 创建分支
git checkout -b feature-branch

# 切换分支
git checkout branch-name

# 合并分支
git merge branch-name

# 删除分支
git branch -d branch-name

# 推送到远程
git push -u origin feature-branch

# 拉取远程分支
git pull origin feature-branch
```

---

## 调试技巧

### 🐛 断点类型

| 断点类型 | 说明 |
|---------|------|
| **行断点** | 点击行号左侧添加 |
| **条件断点** | 右键断点 → "Breakpoint Properties" → 设置条件 |
| **方法断点** | `Ctrl + Shift + F8` → 添加方法断点 |
| **异常断点** | `Ctrl + Shift + F8` → 添加Java Exception Breakpoints |
| **字段断点** | 监控字段访问/修改 |
| **日志断点** | 右键断点 → "More" 或 `Ctrl + Shift + F8` → Suspend=False，设置日志表达式 |

### 🔍 调试技巧

**1. 条件断点**
```java
// 只在特定条件下暂停
for (int i = 0; i < 100; i++) {
    System.out.println(i);  // 设置条件断点：i == 50
}
```

**2. 表达式求值**
- 快捷键：`Alt + F8`（Win）/ `⌥ + F8`（Mac）
- 用途：在调试时执行任意代码

**3. 变量监视**
- 添加到监视面板（Watches）
- 自定义表达式：`list.stream().filter(x -> x > 0).count()`

**4. 远程调试**
```bash
# JVM启动参数
-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005

# IDEA配置
Run → Edit Configurations → Remote → 添加远程调试
```

**5. 线程调试**
- 线程面板：Frames → 选择线程
- 线程断点：`Ctrl + Shift + F8` → Java Line Breakpoints → Thread filter

---

## 常用插件推荐

### 🎯 必装插件

| 插件名 | 功能 | 推荐指数 |
|-------|------|---------|
| **Lombok** | 简化Java代码 | ⭐⭐⭐⭐⭐ |
| **MyBatisX** | MyBatis增强 | ⭐⭐⭐⭐⭐ |
| **Rainbow Brackets** | 彩虹括号 | ⭐⭐⭐⭐⭐ |
| **CodeGlance** | 代码缩略图 | ⭐⭐⭐⭐ |
| **String Manipulation** | 字符串处理 | ⭐⭐⭐⭐ |
| **Translation** | 翻译插件 | ⭐⭐⭐⭐ |
| **Key Promoter X** | 快捷键提示 | ⭐⭐⭐⭐ |
| **Grep Console** | 控制台着色 | ⭐⭐⭐⭐ |

### 🚀 开发效率插件

| 插件名 | 功能 | 推荐指数 |
|-------|------|---------|
| **Maven Helper** | Maven依赖管理 | ⭐⭐⭐⭐⭐ |
| **GenerateAllSetter** | 生成Setter方法 | ⭐⭐⭐⭐⭐ |
| **SequenceDiagram** | 生成时序图 | ⭐⭐⭐⭐ |
| **PlantUML** | UML图绘制 | ⭐⭐⭐⭐ |
| **RestfulTool** | REST接口测试 | ⭐⭐⭐⭐ |
| **JSON Parser** | JSON格式化 | ⭐⭐⭐⭐ |
| **Properties** | properties文件中文转unicode | ⭐⭐⭐ |

### 🎨 主题插件

| 插件名 | 功能 | 推荐指数 |
|-------|------|---------|
| **One Dark Theme** | 主题配色 | ⭐⭐⭐⭐⭐ |
| **Material Theme UI** | Material Design主题 | ⭐⭐⭐⭐⭐ |
| **Nyan Progress Bar** | 彩虹进度条 | ⭐⭐⭐⭐ |
| **Activate Power Mode** | 打字特效 | ⭐⭐⭐ |

---

## 🔧 IDEA优化配置

### ⚡ 性能优化

```properties
# idea.properties 文件位置
# Windows: C:\Users\用户名\AppData\Roaming\JetBrains\IntelliJIdea202X\idea.properties
# Mac: ~/Library/Preferences/IntelliJIdeaXX/idea.properties

# 增加内存
-Xms2048m
-Xmx4096m
-XX:ReservedCodeCacheSize=512m

# 禁用一些插件
# File → Settings → Plugins → 禁用不用的插件
```

### 📝 代码模板（Live Templates）

**常用缩写**：

| 缩写 | 展开内容 |
|-----|---------|
| `psvm` | `public static void main(String[] args) { }` |
| `sout` | `System.out.println();` |
| `souf` | `System.out.printf("");` |
| `fori` | for循环 |
| `iter` | 增强for循环 |
| `ifn` | if (xxx == null) |
| `inn` | if (xxx != null) |
| `private` | private修饰符 |

**自定义模板**：
- Settings → Editor → Live Templates
- 点击`+` → Template Group
- 添加自定义模板

---

## 🎯 生产力提升技巧

### ⌨️ 代码生成

| 快捷键 | 功能 |
|-------|------|
| `Alt + Insert`（Win） | 生成Getter/Setter/构造器等 |
| `⌘ + N`（Mac） | 同上 |
| `Ctrl + J`（Win） | 查看所有可用的Live Template |
| `⌘ + J`（Mac） | 同上 |
| `Ctrl + Space` | 智能补全 |
| `Ctrl + Shift + Space` | 类型智能补全 |

### 🔄 后缀补全

```java
// 输入.for → 回车
List<String> list = Arrays.asList("a", "b", "c");
list.for → for (String s : list) { }

// 输入.if → 回车
String str = "hello";
str.if → if (str != null) { }

// 输入.var → 回车
new ArrayList<String>().var → List<String> list = new ArrayList<>();

// 输入.null → 回车
String str = null;
str.null → if (str == null) { }

// 输入.notnull → 回车
str.notnull → if (str != null) { }

// 输入.return → 回车
"hello".return → return "hello";
```

### 🎯 代码折叠

| 快捷键 | 功能 |
|-------|------|
| `Ctrl + NumPad +` | 展开所有 |
| `Ctrl + NumPad -` | 折叠所有 |
| `Ctrl + Shift + NumPad +` | 展开递归 |
| `Ctrl + Shift + NumPad -` | 折叠递归 |

---

## 📖 常见问题排查

### 🐛 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|-----|------|---------|
| **ClassNotFoundException** | 类找不到 | 检查依赖、Build Rebuild |
| **NoClassDefFoundError** | 类定义不存在 | 检查依赖冲突 |
| **NoSuchMethodError** | 方法不存在 | 检查版本冲突 |
| **OutOfMemoryError** | 内存溢出 | 增加堆内存 `-Xmx` |
| **StackOverflowError** | 栈溢出 | 检查无限递归 |

---

**小徐带你飞系列教程**

**最后更新：2026年2月** | **作者：小徐** | **邮箱：esimonx@163.com**
