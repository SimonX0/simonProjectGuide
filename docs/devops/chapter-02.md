# Linux 基础

## 为什么学习 Linux

Linux 是 DevOps 实践的基础。绝大多数服务器、容器、云服务都运行在 Linux 上。掌握 Linux 基础知识和命令行操作是 DevOps 工程师的必备技能。

### Linux 的应用场景

- **服务器操作系统**：Web服务器、数据库服务器
- **容器环境**：Docker、Kubernetes 底层都是 Linux
- **云平台**：AWS、阿里云等云服务器的首选系统
- **自动化运维**：Shell 脚本编写

## Linux 简介

### 什么是 Linux

Linux 是一种开源的类 Unix 操作系统内核，由 Linus Torvalds 在 1991 年创建。Linux 系统由内核、系统库、系统工具和应用程序组成。

### Linux 发行版

常见的 Linux 发行版：

**Debian 系**
- Debian
- Ubuntu
- Linux Mint

**RedHat 系**
- Red Hat Enterprise Linux (RHEL)
- CentOS
- Fedora

**其他**
- Arch Linux
- Gentoo

### 服务器常用发行版

- **Ubuntu Server**：易用，社区支持好
- **CentOS**：稳定，企业级应用广泛
- **RHEL**：官方支持，适合关键业务
- **Debian**：稳定，安全

## Linux 文件系统

### 目录结构

Linux 采用树形目录结构：

```
/ (根目录)
├── bin       # 可执行文件（用户命令）
├── boot      # 系统启动文件
├── dev       # 设备文件
├── etc       # 配置文件
├── home      # 用户主目录
├── lib       # 库文件
├── opt       # 可选软件包
├── root      # root 用户主目录
├── sbin      # 系统二进制文件
├── tmp       # 临时文件
├── usr       # 用户程序
└── var       # 变量文件（日志、缓存等）
```

### 重要目录说明

**/etc**：系统配置文件
- /etc/passwd：用户信息
- /etc/shadow：用户密码
- /etc/hosts：主机名映射
- /etc/nginx/：Nginx 配置

**/var**：经常变化的文件
- /var/log/：日志文件
- /var/www/：网站根目录
- /var/lib/：数据库文件

**/home**：普通用户主目录
- /home/username/：用户 username 的主目录

## 基础命令

### 文件操作

**查看当前目录**

```bash
pwd
# /home/user
```

**列出目录内容**

```bash
ls                    # 列出当前目录
ls -l                 # 详细信息
ls -la                # 包括隐藏文件
ls -lh                # 人类可读格式
ls /etc               # 列出指定目录
```

**切换目录**

```bash
cd /                  # 切换到根目录
cd ~                  # 切换到主目录
cd ..                 # 切换到上级目录
cd -                  # 切换到上次所在目录
```

**创建目录**

```bash
mkdir test                    # 创建目录
mkdir -p a/b/c                # 递归创建目录
mkdir -m 755 test             # 创建目录并设置权限
```

**删除文件/目录**

```bash
rm file.txt                   # 删除文件（需确认）
rm -f file.txt                # 强制删除文件
rm -r directory               # 删除目录（需确认）
rm -rf directory              # 强制删除目录
```

**复制文件/目录**

```bash
cp file1.txt file2.txt        # 复制文件
cp -r dir1/ dir2/             # 复制目录
cp -p file.txt backup/        # 保留属性复制
```

**移动/重命名**

```bash
mv old.txt new.txt            # 重命名
mv file.txt /tmp/             # 移动文件
mv dir1/ dir2/                # 移动目录
```

### 文件查看

**查看文件内容**

```bash
cat file.txt                  # 显示整个文件
more file.txt                 # 分页显示
less file.txt                 # 分页显示（可向前翻页）
head -n 10 file.txt           # 显示前 10 行
tail -n 10 file.txt           # 显示后 10 行
tail -f log.txt               # 实时查看日志
```

**搜索内容**

```bash
grep "pattern" file.txt       # 搜索文本
grep -r "pattern" /etc/       # 递归搜索
grep -i "pattern" file.txt    # 忽略大小写
grep -n "pattern" file.txt    # 显示行号
```

### 权限管理

**查看权限**

```bash
ls -l file.txt
# -rw-r--r-- 1 user group 1234 Jan 1 12:00 file.txt
```

权限格式：`-rw-r--r--`
- 第1个字符：文件类型（- 文件，d 目录）
- 第2-4字符：所有者权限（r 读，w 写，x 执行）
- 第5-7字符：组权限
- 第8-10字符：其他用户权限

**修改权限**

```bash
chmod 755 file.txt            # 数字方式
chmod u+x file.txt            # 符号方式（所有者添加执行权限）
chmod g-w file.txt            # 组用户删除写权限
chmod o=r file.txt            # 其他用户设为只读
```

权限数字：
- 4：读（r）
- 2：写（w）
- 1：执行（x）

**修改所有者**

```bash
chown user file.txt           # 修改所有者
chown user:group file.txt     # 修改所有者和组
chown -R user:group dir/      # 递归修改
```

### 用户管理

**查看用户**

```bash
whoami                        # 当前用户
id                            # 当前用户信息
w                             # 在线用户
```

**用户操作**

```bash
useradd username              # 创建用户
userdel username              # 删除用户
passwd username               # 修改密码
usermod -aG group user        # 添加到组
```

### 进程管理

**查看进程**

```bash
ps aux                        # 查看所有进程
ps -ef | grep nginx           # 查找特定进程
top                           # 实时进程监控
htop                          # 更友好的进程监控
```

**进程控制**

```bash
kill 1234                     # 终止进程（PID）
kill -9 1234                  # 强制终止进程
killall nginx                 # 终止所有 nginx 进程
pkill nginx                   # 匹配名称终止进程
```

### 系统信息

**系统信息**

```bash
uname -a                      # 系统信息
cat /etc/os-release           # 系统版本
df -h                         # 磁盘使用情况
du -sh directory              # 目录大小
free -h                       # 内存使用情况
uptime                        # 系统运行时间
```

**网络信息**

```bash
ip a                          # 查看 IP 地址
ping google.com               # 网络连通性
netstat -tuln                 # 监听端口
ss -tuln                      # 网络连接
curl -I https://example.com   # HTTP 请求
wget https://example.com/file # 下载文件
```

## 文本编辑器

### Vim 基础使用

Vim 是 Linux 上最常用的文本编辑器。

**打开文件**

```bash
vim file.txt
```

**Vim 模式**

- **普通模式**：浏览和操作
- **插入模式**：编辑文本
- **命令模式**：执行命令

**基本操作**

```vim
# 切换模式
i              # 进入插入模式
Esc            # 返回普通模式
:              # 进入命令模式

# 移动
h j k l        # 左 下 上 右
w b            # 下一个/上一个单词
0 $            # 行首/行尾
gg G           # 文件首/文件尾

# 编辑
dd             # 删除行
yy             # 复制行
p              # 粘贴
u              # 撤销
Ctrl+r         # 重做

# 保存退出
:w             # 保存
:q             # 退出
:wq            # 保存并退出
:q!            # 强制退出
```

### Nano 使用

Nano 是更简单的编辑器，适合新手：

```bash
nano file.txt
```

**快捷键**
- `Ctrl+O`：保存
- `Ctrl+X`：退出
- `Ctrl+K`：剪切
- `Ctrl+U`：粘贴
- `Ctrl+W`：搜索

## 软件包管理

### apt (Ubuntu/Debian)

```bash
sudo apt update                # 更新软件源
sudo apt upgrade               # 升级软件包
sudo apt install nginx         # 安装软件
sudo apt remove nginx          # 删除软件
sudo apt search nginx          # 搜索软件
```

### yum (CentOS/RHEL)

```bash
sudo yum update                # 更新软件源
sudo yum install nginx         # 安装软件
sudo yum remove nginx          # 删除软件
sudo yum search nginx          # 搜索软件
```

## 服务管理

### systemctl (现代系统)

```bash
sudo systemctl start nginx        # 启动服务
sudo systemctl stop nginx         # 停止服务
sudo systemctl restart nginx      # 重启服务
sudo systemctl status nginx       # 查看状态
sudo systemctl enable nginx       # 开机自启
sudo systemctl disable nginx      # 禁用开机自启
```

### service (旧系统)

```bash
sudo service nginx start          # 启动服务
sudo service nginx stop           # 停止服务
sudo service nginx restart        # 重启服务
sudo service nginx status         # 查看状态
```

## 日志查看

### 常见日志位置

```bash
/var/log/syslog          # 系统日志（Ubuntu）
/var/log/messages        # 系统日志（CentOS）
/var/log/auth.log        # 认证日志
/var/log/nginx/          # Nginx 日志
/var/log/mysql/          # MySQL 日志
```

### 查看日志

```bash
tail -f /var/log/syslog          # 实时查看
tail -n 100 /var/log/syslog      # 查看最后 100 行
grep "error" /var/log/syslog     # 搜索错误
journalctl -u nginx              # 查看特定服务日志
```

## Shell 脚本基础

### 创建脚本

```bash
#!/bin/bash
# 这是一个注释

echo "Hello, DevOps!"
```

### 运行脚本

```bash
chmod +x script.sh       # 添加执行权限
./script.sh              # 运行脚本
```

### 变量

```bash
name="DevOps"
echo "Hello, $name!"
```

### 条件判断

```bash
if [ -f "file.txt" ]; then
    echo "文件存在"
else
    echo "文件不存在"
fi
```

### 循环

```bash
for i in {1..5}; do
    echo "数字: $i"
done
```

## 权限提升

### sudo

```bash
sudo command              # 以 root 权限执行命令
sudo -i                   # 切换到 root 用户
sudo su                   # 切换到 root 用户
```

## 网络配置

### 查看网络

```bash
ip addr show              # 查看 IP 地址
ip route show             # 查看路由表
netstat -tuln             # 查看监听端口
ss -tuln                  # 查看网络连接
```

### 防火墙

```bash
sudo ufw enable           # 启用防火墙（Ubuntu）
sudo ufw allow 80         # 允许端口
sudo ufw status           # 查看状态

sudo firewall-cmd --add-port=80/tcp  # 允许端口（CentOS）
```

## 实用技巧

### 管道和重定向

```bash
cat file.txt | grep "pattern"     # 管道
ls > list.txt                     # 输出重定向
ls >> list.txt                    # 追加重定向
command 2> error.log              # 错误重定向
```

### 后台运行

```bash
command &                         # 后台运行
nohup command &                   # 忽略挂起信号
jobs                              # 查看后台任务
fg                                # 前台运行
bg                                # 后台运行
```

### 定时任务

```bash
crontab -e                        # 编辑定时任务
# 格式：分 时 日 月 周 命令
# 示例：每天凌晨2点执行
0 2 * * * /path/to/script.sh
```

## 常见问题排查

### 磁盘满

```bash
df -h                             # 检查磁盘使用
du -sh /var/*                     # 查找大目录
```

### 内存不足

```bash
free -h                           # 检查内存
top                               # 查看进程占用
```

### 端口被占用

```bash
netstat -tuln | grep 80           # 查看端口
lsof -i :80                       # 查看占用进程
```

### 服务无法启动

```bash
systemctl status service          # 查看状态
journalctl -u service             # 查看日志
```

## 学习建议

### 实践建议

1. **安装虚拟机**：使用 VirtualBox 安装 Linux
2. **云服务器**：购买一台便宜的云服务器
3. **WSL**：Windows 用户可使用 WSL
4. **日常使用**：尽量使用命令行完成操作

### 练习任务

- [ ] 创建目录结构并管理文件
- [ ] 使用 Vim 编辑配置文件
- [ ] 安装和配置 Nginx
- [ ] 查看系统日志
- [ ] 编写简单的 Shell 脚本

## 常用命令速查表

| 命令 | 功能 |
|------|------|
| `ls` | 列出目录 |
| `cd` | 切换目录 |
| `pwd` | 当前目录 |
| `mkdir` | 创建目录 |
| `rm` | 删除文件 |
| `cp` | 复制文件 |
| `mv` | 移动文件 |
| `cat` | 查看文件 |
| `grep` | 搜索文本 |
| `chmod` | 修改权限 |
| `chown` | 修改所有者 |
| `ps` | 查看进程 |
| `top` | 进程监控 |
| `systemctl` | 服务管理 |
| `tail` | 查看日志 |

## 总结

Linux 基础是 DevOps 工程师的必备技能。通过本章学习，你应该掌握了：

- Linux 文件系统和目录结构
- 常用命令的使用
- 文本编辑器的基本操作
- 软件包和服务管理
- 日志查看和问题排查

下一章我们将学习 [Shell 脚本编程](chapter-03)，这将帮助你实现自动化运维。
