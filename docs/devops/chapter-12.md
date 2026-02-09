# 自动化运维实战

## 什么是自动化运维

自动化运维是通过工具和脚本，将重复性、繁琐的运维工作自动化，提高效率，减少人为错误。

### 自动化运维的价值

- **提高效率**：减少人工操作，加快响应速度
- **减少错误**：避免人为疏忽导致的故障
- **标准化**：统一的操作流程
- **可追溯**：记录所有操作历史
- **释放人力**：专注于更有价值的工作

## Ansible 自动化

### 什么是 Ansible

Ansible 是开源的自动化运维工具，无需安装客户端，使用 SSH 进行通信。

### 安装 Ansible

```bash
# 安装
sudo apt install ansible

# 验证
ansible --version

# 配置主机清单
vim /etc/ansible/hosts
```

### 主机清单

`/etc/ansible/hosts`：
```ini
[webservers]
web1.example.com
web2.example.com

[dbservers]
db1.example.com
db2.example.com

[all:children]
webservers
dbservers
```

### Ansible 模块

**ping 模块**
```bash
# 测试连接
ansible all -m ping
```

**command 模块**
```bash
# 执行命令
ansible webservers -m command -a "uptime"
```

**shell 模块**
```bash
# 执行 shell 命令
ansible webservers -m shell -a "ps aux | grep nginx"
```

**copy 模块**
```bash
# 复制文件
ansible webservers -m copy -a "src=/tmp/file.txt dest=/tmp/file.txt"
```

**yum/apt 模块**
```bash
# 安装软件
ansible webservers -m yum -a "name=nginx state=present"
ansible webservers -m apt -a "name=nginx state=present"
```

**service 模块**
```bash
# 管理服务
ansible webservers -m service -a "name=nginx state=started"
```

### Playbook

**基础 Playbook**

`site.yml`：
```yaml
---
- name: Install and configure Nginx
  hosts: webservers
  become: yes

  tasks:
    - name: Install Nginx
      apt:
        name: nginx
        state: present

    - name: Start Nginx
      service:
        name: nginx
        state: started
        enabled: yes

    - name: Copy configuration
      copy:
        src: nginx.conf
        dest: /etc/nginx/nginx.conf
      notify:
        - Restart Nginx

  handlers:
    - name: Restart Nginx
      service:
        name: nginx
        state: restarted
```

**运行 Playbook**
```bash
# 执行 Playbook
ansible-playbook site.yml

# 检查模式（不实际执行）
ansible-playbook site.yml --check

# 指定主机
ansible-playbook site.yml -l web1.example.com
```

### Playbook 进阶

**变量**

```yaml
---
- hosts: webservers
  vars:
    http_port: 80
    max_clients: 200

  tasks:
    - name: Update configuration
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
```

**条件判断**

```yaml
tasks:
  - name: Install Nginx on Ubuntu
    apt:
      name: nginx
      state: present
    when: ansible_os_family == "Debian"

  - name: Install Nginx on CentOS
    yum:
      name: nginx
      state: present
    when: ansible_os_family == "RedHat"
```

**循环**

```yaml
tasks:
  - name: Install multiple packages
    apt:
      name: "{{ item }}"
      state: present
    loop:
      - nginx
      - mysql
      - php
```

**角色 (Roles)**

```
site.yml
webservers.yml
roles/
  common/
    tasks/
    handlers/
    files/
    templates/
    vars/
    defaults/
    meta/
  nginx/
    tasks/
    handlers/
    files/
    templates/
    vars/
    defaults/
    meta/
```

**使用角色**

```yaml
---
- hosts: webservers
  roles:
    - common
    - nginx
```

## Docker 自动化

### Docker Compose 自动部署

```yaml
version: '3.8'

services:
  app:
    image: myapp:latest
    ports:
      - "80:80"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
```

### 自动化脚本

```bash
#!/bin/bash
# deploy.sh

# 拉取最新镜像
docker pull myapp:latest

# 停止旧容器
docker stop myapp || true
docker rm myapp || true

# 启动新容器
docker run -d \
  --name myapp \
  -p 80:80 \
  --restart unless-stopped \
  myapp:latest

# 清理旧镜像
docker image prune -f
```

## Kubernetes 自动化

### Helm

**什么是 Helm**

Helm 是 Kubernetes 的包管理器，简化应用部署和管理。

**安装 Helm**

```bash
# 下载 Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# 验证
helm version
```

**创建 Chart**

```bash
# 创建 Chart
helm create myapp

# 目录结构
myapp/
  Chart.yaml
  values.yaml
  templates/
    deployment.yaml
    service.yaml
    ingress.yaml
```

**values.yaml**
```yaml
replicaCount: 3

image:
  repository: myapp
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: LoadBalancer
  port: 80

ingress:
  enabled: true
  hosts:
    - host: example.com
      paths:
        - path: /
          pathType: Prefix
```

**部署应用**

```bash
# 部署
helm install myapp ./myapp

# 升级
helm upgrade myapp ./myapp

# 回滚
helm rollback myapp 1

# 卸载
helm uninstall myapp
```

### 自动化部署脚本

```bash
#!/bin/bash
# k8s-deploy.sh

NAMESPACE="production"
APP_NAME="myapp"
IMAGE_TAG="${1:-latest}"

# 更新部署
kubectl set image deployment/$APP_NAME $APP_NAME=myapp:$IMAGE_TAG -n $NAMESPACE

# 等待就绪
kubectl rollout status deployment/$APP_NAME -n $NAMESPACE

# 检查状态
kubectl get pods -n $NAMESPACE -l app=$APP_NAME
```

## CI/CD 集成

### Jenkins 自动化

```groovy
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'docker build -t myapp:${BUILD_NUMBER} .'
            }
        }

        stage('Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-registry',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}
                        docker push myapp:${BUILD_NUMBER}
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                sh "./k8s-deploy.sh ${BUILD_NUMBER}"
            }
        }
    }
}
```

### GitLab CI 自动化

```yaml
deploy:
  stage: deploy
  script:
    - kubectl set image deployment/myapp myapp=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
    - kubectl rollout status deployment/myapp
  only:
    - main
```

## 监控自动化

### 自动化监控脚本

```bash
#!/bin/bash
# monitor.sh

# 检查磁盘使用
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Warning: Disk usage is ${DISK_USAGE}%"
    # 发送告警
fi

# 检查内存使用
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3/$2*100}')
if [ $MEMORY_USAGE -gt 80 ]; then
    echo "Warning: Memory usage is ${MEMORY_USAGE}%"
    # 发送告警
fi

# 检查服务状态
if ! systemctl is-active --quiet nginx; then
    echo "Error: Nginx is not running"
    # 发送告警并尝试重启
    systemctl start nginx
fi
```

### 定时任务

```bash
# 添加到 crontab
crontab -e

# 每 5 分钟检查一次
*/5 * * * * /path/to/monitor.sh

# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

## 备份自动化

### 数据库备份

```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
MYSQL_USER="backup_user"
MYSQL_PASS="password"
DATABASE="mydb"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u$MYSQL_USER -p$MYSQL_PASS $DATABASE | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# 删除 30 天前的备份
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

### 文件备份

```bash
#!/bin/bash
# backup-files.sh

SOURCE_DIR="/var/www"
BACKUP_DIR="/backup/files"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份
tar -czf $BACKUP_DIR/files_$DATE.tar.gz $SOURCE_DIR

# 上传到远程服务器
rsync -avz $BACKUP_DIR/files_$DATE.tar.gz backup@remote:/backup/

# 清理旧备份
find $BACKUP_DIR -name "files_*.tar.gz" -mtime +7 -delete
```

## 日志自动化

### 日志清理

```bash
#!/bin/bash
# clean-logs.sh

# 清理 30 天前的日志
find /var/log -name "*.log" -mtime +30 -delete

# 清理压缩日志
find /var/log -name "*.gz" -mtime +60 -delete
```

### 日志归档

```bash
#!/bin/bash
# archive-logs.sh

LOG_DIR="/var/log"
ARCHIVE_DIR="/archive/logs"
DATE=$(date +%Y%m%d)

# 归档日志
for log in $LOG_DIR/*.log; do
    gzip -c $log > $ARCHIVE_DIR/$(basename $log).$DATE.gz
done

# 清空原日志
truncate -s 0 $LOG_DIR/*.log
```

## 最佳实践

### 自动化原则

1. **从小处开始**
2. **逐步完善**
3. **充分测试**
4. **版本控制**
5. **文档记录**

### 安全建议

1. **密钥管理**
2. **权限控制**
3. **审计日志**
4. **定期审查**

## 学习建议

### 实践建议

1. **识别重复任务**
2. **编写自动化脚本**
3. **测试和验证**
4. **持续优化**

### 练习任务

- [ ] 使用 Ansible 配置服务器
- [ ] 自动化 Docker 部署
- [ ] 使用 Helm 部署 Kubernetes 应用
- [ ] 配置自动化备份
- [ ] 实现监控告警

## 总结

自动化运维是提高效率的关键。通过本章学习，你应该掌握了：

- Ansible 自动化配置
- Docker 和 Kubernetes 自动化部署
- CI/CD 集成
- 监控、备份自动化

## DevOps 学习总结

恭喜你完成了 DevOps 模块的学习！你已经掌握了：

- DevOps 核心概念和理念
- Linux 基础和 Shell 脚本
- Git 版本控制
- Docker 容器化
- Kubernetes 容器编排
- CI/CD 实践
- 监控和日志
- 自动化运维

继续实践和探索，你将成为一名优秀的 DevOps 工程师！
