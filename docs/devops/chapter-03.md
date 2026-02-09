# Shell 脚本编程

## 什么是 Shell 脚本

Shell 脚本是用 Shell 命令编写的脚本程序，用于自动化执行系统管理任务。Shell 是 Linux/Unix 系统的命令解释器，用户通过 Shell 与操作系统内核交互。

### 常见 Shell 类型

- **Bash (Bourne Again Shell)**：最常用，Linux 默认 Shell
- **Sh**：原始 Unix Shell
- **Zsh**：功能更强大
- **Fish**：用户友好

### 为什么学习 Shell 脚本

- 自动化重复性任务
- 批量管理服务器
- 系统监控和日志分析
- CI/CD 流程中的重要组成部分
- 快速原型开发

## 第一个 Shell 脚本

### 创建脚本

创建文件 `hello.sh`：

```bash
#!/bin/bash
# 这是我的第一个 Shell 脚本

echo "Hello, DevOps!"
echo "当前日期: $(date)"
echo "当前用户: $USER"
```

### 脚本解释

```bash
#!/bin/bash    # Shebang，指定解释器
# 注释内容     # 注释，不会被执行
echo "..."     # 输出文本
```

### 运行脚本

```bash
# 方法1：添加执行权限后运行
chmod +x hello.sh
./hello.sh

# 方法2：使用 bash 运行
bash hello.sh

# 方法3：使用 sh 运行
sh hello.sh
```

## 变量

### 定义变量

```bash
#!/bin/bash

# 变量定义（注意：等号两边不能有空格）
name="DevOps"
age=3
pi=3.14

# 使用变量
echo "名称: $name"
echo "年龄: $age"
echo "圆周率: $pi"
```

### 变量命名规则

- 只能使用字母、数字、下划线
- 不能以数字开头
- 区分大小写
- 避免使用系统关键字

```bash
# 正确
my_var="value"
MY_VAR="value"
myVar="value"

# 错误
2nd_var="value"    # 不能以数字开头
my-var="value"     # 不能使用连字符
my var="value"     # 不能有空格
```

### 变量操作

```bash
# 拼接字符串
greeting="Hello"
name="World"
message="$greeting, $name!"
echo $message    # 输出: Hello, World!

# 获取字符串长度
text="Hello World"
echo ${#text}    # 输出: 11

# 字符串截取
echo ${text:0:5}    # 输出: Hello
echo ${text:6}      # 输出: World

# 默认值
echo ${name:-"Guest"}    # 如果 name 为空，使用 "Guest"

### 只读变量
readonly PI=3.14159
# PI=3.14    # 会报错

### 删除变量
unset myvar
```

### 特殊变量

```bash
#!/bin/bash

echo "脚本名称: $0"
echo "第一个参数: $1"
echo "第二个参数: $2"
echo "所有参数: $@"
echo "参数个数: $#"
echo "当前进程ID: $$"
echo "退出状态: $?"
```

运行示例：

```bash
./script.sh arg1 arg2
# 脚本名称: ./script.sh
# 第一个参数: arg1
# 第二个参数: arg2
# 所有参数: arg1 arg2
# 参数个数: 2
```

## 数组

### 定义数组

```bash
#!/bin/bash

# 定义数组
fruits=("apple" "banana" "orange")

# 访问元素
echo ${fruits[0]}        # apple
echo ${fruits[1]}        # banana
echo ${fruits[@]}        # 所有元素

# 数组长度
echo ${#fruits[@]}       # 3

# 添加元素
fruits+=("grape")

# 删除元素
unset fruits[1]
```

### 数组遍历

```bash
for fruit in "${fruits[@]}"; do
    echo "水果: $fruit"
done
```

## 条件判断

### if 语句

```bash
#!/bin/bash

age=18

if [ $age -ge 18 ]; then
    echo "成年人"
elif [ $age -ge 13 ]; then
    echo "青少年"
else
    echo "儿童"
fi
```

### 比较运算符

**数字比较**

```bash
-eq     # 等于
-ne     # 不等于
-gt     # 大于
-ge     # 大于等于
-lt     # 小于
-le     # 小于等于
```

**字符串比较**

```bash
=       # 等于
!=      # 不等于
-z      # 字符串为空
-n      # 字符串不为空
```

**文件测试**

```bash
-f      # 文件存在且为普通文件
-d      # 目录存在
-e      # 文件或目录存在
-r      # 文件可读
-w      # 文件可写
-x      # 文件可执行
-s      # 文件不为空
```

### 条件判断示例

```bash
#!/bin/bash

file="test.txt"

# 检查文件是否存在
if [ -f "$file" ]; then
    echo "文件存在"
else
    echo "文件不存在"
fi

# 检查目录
if [ -d "/tmp" ]; then
    echo "/tmp 是目录"
fi

# 检查文件可读
if [ -r "$file" ]; then
    echo "文件可读"
fi
```

### case 语句

```bash
#!/bin/bash

action="start"

case $action in
    start)
        echo "启动服务"
        ;;
    stop)
        echo "停止服务"
        ;;
    restart)
        echo "重启服务"
        ;;
    *)
        echo "未知操作"
        ;;
esac
```

## 循环

### for 循环

```bash
#!/bin/bash

# 遍历列表
for i in 1 2 3 4 5; do
    echo "数字: $i"
done

# 遍历范围
for i in {1..10}; do
    echo "数字: $i"
done

# 遍历数组
fruits=("apple" "banana" "orange")
for fruit in "${fruits[@]}"; do
    echo "水果: $fruit"
done

# C 风格 for 循环
for ((i=0; i<10; i++)); do
    echo "数字: $i"
done
```

### while 循环

```bash
#!/bin/bash

count=0
while [ $count -lt 5 ]; do
    echo "计数: $count"
    count=$((count + 1))
done
```

### until 循环

```bash
#!/bin/bash

count=0
until [ $count -ge 5 ]; do
    echo "计数: $count"
    count=$((count + 1))
done
```

### 循环控制

```bash
for i in {1..10}; do
    if [ $i -eq 5 ]; then
        break    # 跳出循环
    fi
    echo "数字: $i"
done

for i in {1..10}; do
    if [ $((i % 2)) -eq 0 ]; then
        continue    # 跳过本次迭代
    fi
    echo "奇数: $i"
done
```

## 函数

### 定义函数

```bash
#!/bin/bash

# 定义函数
greet() {
    echo "Hello, $1!"
}

# 调用函数
greet "DevOps"

# 带返回值的函数
add() {
    result=$(($1 + $2))
    echo $result
}

sum=$(add 10 20)
echo "和: $sum"
```

### 函数参数

```bash
#!/bin/bash

show_info() {
    echo "第一个参数: $1"
    echo "第二个参数: $2"
    echo "所有参数: $@"
    echo "参数个数: $#"
}

show_info "apple" "banana" "orange"
```

### 返回值

```bash
#!/bin/bash

check_file() {
    if [ -f "$1" ]; then
        return 0    # 成功
    else
        return 1    # 失败
    fi
}

check_file "test.txt"
if [ $? -eq 0 ]; then
    echo "文件存在"
else
    echo "文件不存在"
fi
```

### 局部变量

```bash
#!/bin/bash

global_var="全局变量"

my_func() {
    local local_var="局部变量"
    echo "函数内: $global_var"
    echo "函数内: $local_var"
}

my_func
echo "函数外: $global_var"
echo "函数外: $local_var"    # 空值
```

## 输入输出

### 读取输入

```bash
#!/bin/bash

# 读取输入
echo "请输入你的名字:"
read name
echo "你好, $name!"

# 带提示的读取
read -p "请输入年龄: " age
echo "年龄: $age"

# 密码输入（不显示）
read -s -p "请输入密码: " password
echo

# 读取多个值
read -p "请输入姓名和年龄: " name age
echo "姓名: $name, 年龄: $age"
```

### 输出

```bash
#!/bin/bash

# echo 输出
echo "普通输出"
echo -n "不换行输出"
echo -e "支持\n转义\t字符"

# printf 格式化输出
printf "姓名: %s, 年龄: %d\n" "张三" 25
```

## 算术运算

### 运算方式

```bash
#!/bin/bash

a=10
b=5

# 方式1: $(( ))
result=$((a + b))
echo "加法: $result"

# 方式2: expr
result=$(expr $a + $b)
echo "加法: $result"

# 方式3: let
let result=a+b
echo "加法: $result"

# 运算符
echo $((a + b))    # 加法: 15
echo $((a - b))    # 减法: 5
echo $((a * b))    # 乘法: 50
echo $((a / b))    # 除法: 2
echo $((a % b))    # 取余: 0
echo $((a ** 2))   # 幂运算: 100
```

### 自增自减

```bash
#!/bin/bash

count=0
count=$((count + 1))
((count++))
((count--))
echo $count
```

## 字符串处理

```bash
#!/bin/bash

text="Hello World"

# 获取长度
echo ${#text}    # 11

# 大小写转换
echo ${text^^}   # HELLO WORLD
echo ${text,,}   # hello world

# 替换
echo ${text/World/DevOps}    # Hello DevOps

# 删除前缀
text="/home/user/file.txt"
echo ${text#/home/}    # user/file.txt

# 删除后缀
echo ${text%.txt}      # /home/user/file
```

## 命令替换

```bash
#!/bin/bash

# 使用命令输出作为变量
current_date=$(date)
echo "当前日期: $current_date"

# 使用反引号（不推荐）
files=`ls`
echo "文件: $files"

# 管道
count=$(ls | wc -l)
echo "文件数量: $count"
```

## 重定向和管道

### 输出重定向

```bash
#!/bin/bash

# 覆盖输出
echo "Hello" > file.txt

# 追加输出
echo "World" >> file.txt

# 错误输出
command 2> error.log

# 同时输出
command > output.txt 2>&1
```

### 输入重定向

```bash
#!/bin/bash

# 从文件读取
while read line; do
    echo $line
done < file.txt
```

### 管道

```bash
#!/bin/bash

# 管道连接命令
ps aux | grep nginx
cat file.txt | grep "error"
ls -l | wc -l

# 多个管道
cat log.txt | grep "error" | wc -l
```

## 实用脚本示例

### 批量重命名文件

```bash
#!/bin/bash

# 批量添加前缀
for file in *.txt; do
    mv "$file" "backup_$file"
done
```

### 日志分析

```bash
#!/bin/bash

# 统计日志中的错误数量
error_count=$(grep -c "ERROR" app.log)
echo "错误数量: $error_count"

# 提取特定日期的日志
grep "2024-01-01" app.log > daily.log
```

### 备份脚本

```bash
#!/bin/bash

# 定义变量
SOURCE="/var/www"
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz"

# 创建备份
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_FILE $SOURCE

# 删除30天前的备份
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "备份完成: $BACKUP_FILE"
```

### 监控脚本

```bash
#!/bin/bash

# 监控磁盘使用
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "警告: 磁盘使用率超过80%"
    # 发送告警邮件
fi
```

### 批量部署

```bash
#!/bin/bash

# 服务器列表
servers=("server1" "server2" "server3")

# 批量执行命令
for server in "${servers[@]}"; do
    echo "连接到 $server"
    ssh $server "apt update && apt upgrade -y"
done
```

## 调试技巧

### 调试模式

```bash
#!/bin/bash

# 开启调试模式
set -x    # 打印每个命令
set -v    # 打印脚本内容
set -e    # 遇到错误立即退出
set -u    # 使用未定义变量时报错

# 你的脚本代码

# 关闭调试模式
set +x
```

### 日志输出

```bash
#!/bin/bash

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "脚本开始"
log "执行任务..."
log "脚本结束"
```

## 最佳实践

### 脚本规范

1. **添加 Shebang**
   ```bash
   #!/bin/bash
   ```

2. **添加注释**
   ```bash
   # 脚本功能: 备份数据库
   # 作者: DevOps
   # 日期: 2024-01-01
   ```

3. **使用变量**
   ```bash
   BASE_DIR="/var/www"
   LOG_DIR="/var/log"
   ```

4. **错误处理**
   ```bash
   set -e    # 遇到错误退出
   trap 'echo "脚本执行失败"; exit 1' ERR
   ```

5. **日志记录**
   ```bash
   exec > >(tee -a script.log)
   exec 2>&1
   ```

## 学习建议

### 实践建议

1. **从小任务开始**：自动化简单的重复任务
2. **阅读现有脚本**：学习开源项目的脚本
3. **模块化设计**：将复杂功能拆分为函数
4. **充分测试**：在生产环境前充分测试
5. **文档记录**：记录脚本使用方法

### 练习任务

- [ ] 编写一个文件备份脚本
- [ ] 创建一个日志分析脚本
- [ ] 实现一个服务监控脚本
- [ ] 编写一个批量部署脚本
- [ ] 创建一个自动化测试脚本

## 总结

Shell 脚本编程是 DevOps 自动化的重要工具。通过本章学习，你应该掌握了：

- Shell 脚本的基本语法
- 变量、数组、条件判断和循环
- 函数的定义和使用
- 输入输出和重定向
- 实用脚本示例

下一章我们将学习 [Git 版本控制](chapter-04)，了解如何进行代码管理和团队协作。
