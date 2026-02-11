---
title: 数据库迁移与备份实战案例
---

# 数据库迁移与备份实战案例

## 概述

本文档提供常见的数据库迁移案例和备份策略实战示例，涵盖冷备、热备、全备份以及数据库导入导出等实用场景。

## 一、数据库冷备案例

### MySQL 冷备实战

#### 场景：使用 mysqldump 进行 MySQL 全量冷备

```bash
# 基础全量备份
mysqldump -u root -p --all-databases > full_backup_$(date +%Y%m%d).sql

# 压缩备份（推荐）
mysqldump -u root -p --all-databases | gzip > full_backup_$(date +%Y%m%d).sql.gz

# 分库备份
mysqldump -u root -p --databases db1 db2 db3 > multi_db_backup.sql

# 仅备份结构（不含数据）
mysqldump -u root -p --no-data db_name > schema_backup.sql

# 仅备份数据（不含结构）
mysqldump -u root -p --no-create-info db_name > data_backup.sql

# 使用事务保证数据一致性（推荐用于 InnoDB）
mysqldump -u root -p --single-transaction --all-databases > consistent_backup.sql
```

#### 恢复示例

```bash
# 解压并恢复
gunzip < full_backup_20240101.sql.gz | mysql -u root -p

# 直接恢复 SQL 文件
mysql -u root -p < full_backup_20240101.sql

# 恢复单个数据库
mysql -u root -p db_name < db_backup.sql
```

#### 定时备份脚本

```bash
#!/bin/bash
# MySQL 每日自动备份脚本

BACKUP_DIR="/data/backups/mysql"
MYSQL_USER="root"
MYSQL_PASSWORD="your_password"
MYSQL_HOST="localhost"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --all-databases | gzip > $BACKUP_DIR/full_backup_$DATE.sql.gz

# 删除 7 天前的备份
find $BACKUP_DIR -name "full_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: full_backup_$DATE.sql.gz"
```

### PostgreSQL 冷备实战

```bash
# 使用 pg_dump 全量备份
pg_dump -U postgres -d db_name > db_backup_$(date +%Y%m%d).sql

# 压缩备份
pg_dump -U postgres -d db_name | gzip > db_backup_$(date +%Y%m%d).sql.gz

# 自定义格式备份（推荐，支持并行恢复）
pg_dump -U postgres -d db_name -F c -f db_backup_$(date +%Y%m%d).dump

# 备份所有数据库
pg_dumpall -U postgres > all_databases_backup.sql

# 仅备份 schema
pg_dump -U postgres -d db_name --schema-only > schema_backup.sql
```

#### 恢复示例

```bash
# 恢复 SQL 格式备份
psql -U postgres -d db_name < db_backup_20240101.sql

# 恢复自定义格式备份
pg_restore -U postgres -d db_name -j 4 db_backup_20240101.dump

# 恢复所有数据库
psql -U postgres < all_databases_backup.sql
```

### Redis 冷备实战

```bash
# 手动触发 RDB 快照
redis-cli BGSAVE

# 查看 RDB 文件位置
redis-cli CONFIG GET dir

# 复制 RDB 文件
cp /var/lib/redis/dump.rdb /backup/redis/dump_$(date +%Y%m%d).rdb

# 恢复 RDB
# 1. 停止 Redis
systemctl stop redis

# 2. 备份当前 RDB
cp /var/lib/redis/dump.rdb /var/lib/redis/dump.rdb.old

# 3. 替换为备份文件
cp /backup/redis/dump_20240101.rdb /var/lib/redis/dump.rdb

# 4. 启动 Redis
systemctl start redis
```

### Oracle 冷备实战

#### 使用 expdp/impdp 数据泵备份（推荐）

```bash
# 创建目录对象
sqlplus / as sysdba <<EOF
CREATE OR REPLACE DIRECTORY backup_dir AS '/u01/backup';
GRANT READ, WRITE ON DIRECTORY backup_dir TO system;
EXIT;
EOF

# 全库导出（推荐）
expdp system/password DIRECTORY=backup_dir \
  DUMPFILE=full_backup_%U.dmp \
  LOGFILE=full_backup.log \
  PARALLEL=4 \
  FULL=Y

# 按用户导出
expdp system/password DIRECTORY=backup_dir \
  DUMPFILE=scott_%U.dmp \
  LOGFILE=scott.log \
  SCHEMAS=scott

# 按表空间导出
expdp system/password DIRECTORY=backup_dir \
  DUMPFILE=users_%U.dmp \
  LOGFILE=users.log \
  TABLESPACES=users

# 按表导出
expdp scott/tiger DIRECTORY=backup_dir \
  DUMPFILE=emp_dept.dmp \
  LOGFILE=emp_dept.log \
  TABLES=emp,dept

# 增量导出（仅导出变更数据）
expdp system/password DIRECTORY=backup_dir \
  DUMPfile=incr_%U.dmp \
  LOGFILE=incr.log \
  CONTENT=DATA_ONLY \
  EXCLUDE=TABLE:"IN (SELECT table_name FROM dba_tables WHERE last_analyzed IS NULL)"
```

#### 使用 exp/imp 传统方式备份

```bash
# 全库导出
exp system/password FILE=full_backup.dmp LOG=full_backup.log FULL=Y

# 按用户导出
exp scott/tiger FILE=scott.dmp LOG=scott.log OWNER=scott

# 按表导出
exp scott/tiger FILE=emp_dept.dmp LOG=emp_dept.log TABLES=emp,dept

# 仅导出数据
exp scott/tiger FILE=data_only.dmp ROWS=Y INDEXES=N GRANTS=N

# 仅导出结构
exp scott/tiger FILE=structure.dmp ROWS=N
```

#### RMAN 备份（物理备份，推荐）

```bash
# 连接 RMAN
rman target /

# 配置备份参数
RMAN> CONFIGURE DEFAULT DEVICE TYPE TO DISK;
RMAN> CONFIGURE CONTROLFILE AUTOBACKUP ON;
RMAN> CONFIGURE CONTROLFILE AUTOBACKUP FORMAT FOR DEVICE TYPE DISK TO '/u01/backup/%F';
RMAN> CONFIGURE RETENTION POLICY TO RECOVERY WINDOW OF 7 DAYS;

# 全量备份（数据库级）
RMAN> BACKUP DATABASE;
RMAN> SQL 'ALTER SYSTEM ARCHIVE LOG CURRENT';
RMAN> BACKUP ARCHIVELOG ALL;

# 增量备份（级别 0 = 完整，级别 1 = 差异）
RMAN> BACKUP INCREMENTAL LEVEL 0 DATABASE;
RMAN> BACKUP INCREMENTAL LEVEL 1 DATABASE;

# 备份特定表空间
RMAN> BACKUP TABLESPACE users;

# 备份控制文件和参数文件
RMAN> BACKUP CURRENT CONTROLFILE;
RMAN> BACKUP SPFILE;

# 查看备份
RMAN> LIST BACKUP;
RMAN> LIST BACKUP SUMMARY;

# 删除过期备份
RMAN> DELETE OBSOLETE;
RMAN> DELETE EXPIRED BACKUP;
```

#### 恢复示例

```bash
# 使用 impdp 恢复
impdp system/password DIRECTORY=backup_dir \
  DUMPFILE=full_backup_%U.dmp \
  LOGFILE=restore.log \
  PARALLEL=4 \
  FULL=Y

# 按用户恢复
impdp system/password DIRECTORY=backup_dir \
  DUMPFILE=scott_%U.dmp \
  LOGFILE=scott_restore.log \
  SCHEMAS=scott

# 覆盖现有数据
impdp system/password DIRECTORY=backup_dir \
  DUMPFILE=scott_%U.dmp \
  TABLE_EXISTS_ACTION=REPLACE

# 仅导入结构
impdp system/password DIRECTORY=backup_dir \
  DUMPFILE=scott_%U.dmp \
  CONTENT=METADATA_ONLY

# 仅导入数据
impdp system/password DIRECTORY=backup_dir \
  DUMPFILE=scott_%U.dmp \
  CONTENT=DATA_ONLY

# 使用 imp 传统方式恢复
imp system/password FILE=scott.dmp FROMUSER=scott TOUSER=scott_new
```

#### RMAN 恢复

```bash
# 恢复整个数据库
RMAN> STARTUP MOUNT;
RMAN> RESTORE DATABASE;
RMAN> RECOVER DATABASE;
RMAN> ALTER DATABASE OPEN;

# 恢复到指定时间点（时间点恢复 PITR）
RMAN> RUN {
  SET UNTIL TIME "TO_DATE('2024-01-01 12:00:00', 'YYYY-MM-DD HH24:MI:SS')";
  RESTORE DATABASE;
  RECOVER DATABASE;
  ALTER DATABASE OPEN RESETLOGS;
}

# 恢复表空间
RMAN> SQL 'ALTER TABLESPACE users OFFLINE';
RMAN> RESTORE TABLESPACE users;
RMAN> RECOVER TABLESPACE users;
RMAN> SQL 'ALTER TABLESPACE users ONLINE';

# 恢复单个数据文件
RMAN> RESTORE DATAFILE '/u01/oradata/users01.dbf';
RMAN> RECOVER DATAFILE '/u01/oradata/users01.dbf';
```

#### 自动化备份脚本

```bash
#!/bin/bash
# Oracle 每日自动备份脚本

ORACLE_HOME=/u01/app/oracle/product/19c/dbhome_1
ORACLE_SID=orcl
BACKUP_DIR=/u01/backup
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE=$BACKUP_DIR/backup_$DATE.log

# 设置环境变量
export ORACLE_HOME ORACLE_SID

# 创建备份目录
mkdir -p $BACKUP_DIR

# 方案 1: 使用 expdp 备份
echo "=== Start Data Pump Export ===" | tee -a $LOG_FILE
$ORACLE_HOME/bin/expdp system/password \
  DIRECTORY=backup_dir \
  DUMPFILE=full_backup_$DATE_%U.dmp \
  LOGFILE=expdp_$DATE.log \
  PARALLEL=4 \
  FULL=Y

# 方案 2: 使用 RMAN 备份
echo "=== Start RMAN Backup ===" | tee -a $LOG_FILE
rman target / LOG=$BACKUP_DIR/rman_$DATE.log <<EOF
RUN {
  ALLOCATE CHANNEL ch1 DEVICE TYPE DISK;
  BACKUP AS COMPRESSED BACKUPSET
    DATABASE FORMAT '${BACKUP_DIR}/db_%d_%T_%s_%p.bak'
    PLUS ARCHIVELOG FORMAT '${BACKUP_DIR}/arch_%d_%T_%s_%p.bak';
  RELEASE CHANNEL ch1;
}
DELETE OBSOLETE;
EXIT;
EOF

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.dmp" -mtime +7 -delete
find $BACKUP_DIR -name "*.bak" -mtime +7 -delete

echo "=== Backup Completed at $DATE ===" | tee -a $LOG_FILE

# 发送邮件通知（可选）
# mail -s "Oracle Backup Completed" admin@example.com < $LOG_FILE
```

#### 冷备份（文件系统级别）

```bash
# ⚠️ 仅在数据库完全关闭时使用

# 1. 关闭数据库
sqlplus / as sysdba <<EOF
SHUTDOWN IMMEDIATE;
EXIT;
EOF

# 2. 复制所有数据文件、控制文件、参数文件
cp /u01/oradata/orcl/*.dbf /backup/orcl/data/
cp /u01/oradata/orcl/*.ctl /backup/orcl/ctrl/
cp $ORACLE_HOME/dbs/spfileorcl.ora /backup/orcl/

# 3. 启动数据库
sqlplus / as sysdba <<EOF
STARTUP;
EXIT;
EOF

# 4. 验证备份
ls -lh /backup/orcl/
```

#### 表空间备份与恢复

```bash
# 将表空间设置为备份模式
sqlplus / as sysdba <<EOF
ALTER TABLESPACE users BEGIN BACKUP;
-- 此时可以复制数据文件
HOST cp /u01/oradata/users01.dbf /backup/
ALTER TABLESPACE users END BACKUP;
EOF

# 使用 RMAN 更简单
rman target / <<EOF
BACKUP TABLESPACE users;
EOF
```

## 二、数据库热备案例

### MySQL 主从热备（复制）

#### 主库配置

```sql
-- 主库 my.cnf 配置
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = ROW
binlog-do-db = myapp
expire_logs_days = 7

-- 创建复制用户
CREATE USER 'repl_user'@'%' IDENTIFIED BY 'StrongPassword123!';
GRANT REPLICATION SLAVE ON *.* TO 'repl_user'@'%';
FLUSH PRIVILEGES;

-- 查看主库状态
SHOW MASTER STATUS;
-- +------------------+----------+--------------+------------------+
-- | File             | Position | Binlog_Do_DB | Binlog_Ignore_DB |
-- +------------------+----------+--------------+------------------+
-- | mysql-bin.000003 |      154 | myapp        |                  |
-- +------------------+----------+--------------+------------------+
```

#### 从库配置

```sql
-- 从库 my.cnf 配置
[mysqld]
server-id = 2
relay-log = relay-bin
read-only = 1

-- 配置复制连接
CHANGE MASTER TO
  MASTER_HOST='192.168.1.100',
  MASTER_USER='repl_user',
  MASTER_PASSWORD='StrongPassword123!',
  MASTER_LOG_FILE='mysql-bin.000003',
  MASTER_LOG_POS=154;

-- 启动复制
START SLAVE;

-- 查看复制状态
SHOW SLAVE STATUS\G
```

### PostgreSQL 流复制热备

#### 主库配置

```bash
# postgresql.conf
wal_level = replica
max_wal_senders = 3
wal_keep_size = 1GB
synchronous_commit = on
synchronous_standby_names = 'standby1'

# pg_hba.conf 添加复制连接
host replication replicator 192.168.1.0/24 md5
```

```sql
-- 创建复制用户
CREATE USER replicator REPLICATION LOGIN PASSWORD 'ReplicaPassword123!';
```

#### 从库配置

```bash
# 使用 pg_basebackup 创建从库
pg_basebackup -h 192.168.1.100 -D /var/lib/postgresql/data \
  -U replicator -P -v -R -X stream -C -S replica1_slot

# 创建 standby.signal 文件（PostgreSQL 12+）
touch /var/lib/postgresql/data/standby.signal

# 启动从库
systemctl start postgresql
```

### Redis 哨兵高可用热备

#### Redis 主从配置

```bash
# 主节点 redis.conf
bind 0.0.0.0
port 6379
daemonize yes
requirepass MasterPassword123
masterauth MasterPassword123
```

```bash
# 从节点 redis.conf
bind 0.0.0.0
port 6379
daemonize yes
slaveof 192.168.1.100 6379
masterauth MasterPassword123
requirepass SlavePassword123
```

#### 哨兵配置

```bash
# sentinel.conf
port 26379
daemonize yes
sentinel monitor mymaster 192.168.1.100 6379 2
sentinel auth-pass mymaster MasterPassword123
sentinel down-after-milliseconds mymaster 5000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 10000
```

## 三、全量备份案例

### MySQL 全量备份 + 增量备份策略

#### 使用 Percona XtraBackup 进行物理备份

```bash
# 全量备份
xtrabackup --backup --target-dir=/data/backups/full \
  --user=root --password=YourPassword

# 增量备份（基于全量备份）
xtrabackup --backup --target-dir=/data/backups/inc1 \
  --incremental-basedir=/data/backups/full

# 第二次增量备份
xtrabackup --backup --target-dir=/data/backups/inc2 \
  --incremental-basedir=/data/backups/inc1

# 准备恢复（应用日志）
xtrabackup --prepare --apply-log-only --target-dir=/data/backups/full
xtrabackup --prepare --apply-log-only --target-dir=/data/backups/full \
  --incremental-dir=/data/backups/inc1
xtrabackup --prepare --target-dir=/data/backups/full \
  --incremental-dir=/data/backups/inc2

# 恢复数据
xtrabackup --copy-back --target-dir=/data/backups/full
```

### MySQL 二进制日志备份策略

```bash
# 启用 binlog
# my.cnf
[mysqld]
log-bin=mysql-bin
binlog-format=ROW
expire_logs_days=7
max_binlog_size=100M

# 手动刷新 binlog
mysqladmin -u root -p flush-logs

# 备份 binlog 文件
cp /var/lib/mysql/mysql-bin.* /backup/mysql/binlogs/

# 从 binlog 恢复（时间点恢复）
mysqlbinlog --start-datetime="2024-01-01 00:00:00" \
  --stop-datetime="2024-01-01 23:59:59" \
  mysql-bin.000005 | mysql -u root -p

# 基于位置恢复
mysqlbinlog --start-position=154 --stop-position=1000 \
  mysql-bin.000005 | mysql -u root -p
```

## 四、数据库导入导出案例

### MySQL 数据迁移

#### CSV 数据导入导出

```sql
-- 导出数据为 CSV
SELECT * FROM users
INTO OUTFILE '/tmp/users.csv'
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- 导入 CSV 数据
LOAD DATA INFILE '/tmp/users.csv'
INTO TABLE users
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

#### 跨数据库迁移（MySQL → PostgreSQL）

```bash
# 方案 1: 使用 pg_loader
# 创建配置文件 load.mysql
LOAD DATABASE
    FROM mysql://mysql_user:password@localhost/myapp
    INTO postgresql://pg_user:password@localhost/myapp

WITH include drop, create tables, create indexes, reset sequences

SET work_mem to '256MB',
    maintenance_work_mem to '512MB';

CAST type datetime to timestamptz using zero-dates-to-null;

# 执行迁移
pg_loader load.mysql

# 方案 2: 使用自定义脚本 + 中间 CSV 文件
# 1. MySQL 导出
mysqldump -u root -p --tab=/tmp/export myapp

# 2. 转换编码（如需要）
iconv -f UTF-8 -t UTF-8 /tmp/export/users.txt > /tmp/export/users_utf8.txt

# 3. PostgreSQL 导入
psql -U postgres -d myapp -c "\copy users FROM '/tmp/export/users_utf8.txt' WITH CSV"
```

### Oracle 到 MySQL 迁移实战

```bash
# 使用 Oracle SQL Developer 迁移工具

# 步骤 1: 在 Oracle SQL Developer 中创建迁移连接
# Tools → Migration → Create Migration Repository

# 步骤 2: 捕获 Oracle 数据库结构
# 右键 Oracle 连接 → Migration → Capture

# 步骤 3: 转换为 MySQL 模型
# 右键捕获的模型 → Convert to MySQL

# 步骤 4: 生成迁移脚本
# 右键转换的模型 → Generate Migration Scripts

# 步骤 5: 迁移数据
# 右键 MySQL 连接 → Migration → Move Data
```

#### 手动迁移 SQL 脚本示例

```sql
-- Oracle Sequence 迁移到 MySQL AUTO_INCREMENT
-- Oracle:
CREATE SEQUENCE user_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE users (
  id NUMBER DEFAULT user_seq.NEXTVAL PRIMARY KEY,
  name VARCHAR2(100)
);

-- MySQL:
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

-- Oracle DATE 迁移到 MySQL DATETIME
-- Oracle: SYSDATE
-- MySQL: NOW()

-- Oracle TO_DATE 迁移
-- Oracle: TO_DATE('2024-01-01', 'YYYY-MM-DD')
-- MySQL: STR_TO_DATE('2024-01-01', '%Y-%m-%d')
```

### 数据库字符集迁移

```sql
-- MySQL 字符集转换（latin1 → utf8mb4）

-- 步骤 1: 检查当前字符集
SHOW VARIABLES LIKE 'character_set%';
SHOW CREATE TABLE users;

-- 步骤 2: 导出数据（指定字符集）
mysqldump -u root -p --default-character-set=latin1 myapp > latin1_backup.sql

-- 步骤 3: 转换文件编码
iconv -f LATIN1 -t UTF-8 latin1_backup.sql > utf8_backup.sql

-- 步骤 4: 修改 SQL 文件中的字符集声明
sed -i 's/latin1/utf8mb4/g' utf8_backup.sql

-- 步骤 5: 创建新数据库（utf8mb4）
CREATE DATABASE myapp_utf8 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 步骤 6: 导入数据
mysql -u root -p --default-character-set=utf8mb4 myapp_utf8 < utf8_backup.sql

-- 或直接修改表字符集
ALTER DATABASE myapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### MongoDB 数据迁移

```bash
# 导出数据
mongoexport --db myapp --collection users \
  --out /backup/users.json --jsonArray

# 导出 CSV
mongoexport --db myapp --collection users \
  --type csv --fields name,email,created_at \
  --out /backup/users.csv

# 导入数据
mongoimport --db myapp_new --collection users \
  --file /backup/users.json --jsonArray

# 完整数据库备份
mongodump --db myapp --out /backup/mongodb/

# 恢复数据库
mongorestore --db myapp_new /backup/mongodb/myapp/

# 集合迁移
mongodump --db myapp --collection users \
  --query '{"status": "active"}' | \
mongorestore --db myapp_archive --collection active_users
```

### Redis 数据迁移

```bash
# 方案 1: 使用 redis-cli 迁移
redis-cli --slaveof source_host 6379
# 等待同步完成
redis-cli --slaveof no one

# 方案 2: 使用 RDB 文件迁移
# 源库
redis-cli BGSAVE
# 等待备份完成
redis-cli LASTSAVE

# 复制 RDB 文件
scp /var/lib/redis/dump.rdb target_host:/tmp/

# 目标库
redis-cli SHUTDOWN
cp /tmp/dump.rdb /var/lib/redis/dump.rdb
chown redis:redis /var/lib/redis/dump.rdb
redis-server /etc/redis/redis.conf

# 方案 3: 使用 redis-shake 工具
# 配置文件 shake.conf
source.type = standalone
source.address = source_host:6379
source.password_raw = source_password

target.type = standalone
target.address = target_host:6379
target.password_raw = target_password

# 执行迁移
./redis-shake.linux -conf=shake.conf -type=sync
```

## 五、常见数据库迁移场景

### 单体数据库拆分为分库分表

```bash
# 场景：将一个大表按用户 ID 分片

# 原表结构
CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  order_no VARCHAR(32),
  amount DECIMAL(10,2),
  created_at DATETIME,
  INDEX idx_user_id (user_id)
);

# 拆分方案：按 user_id % 4 拆分为 4 个表
-- orders_0, orders_1, orders_2, orders_3

# 数据迁移脚本（Python 示例）
#!/usr/bin/env python3
import pymysql
from tqdm import tqdm

source_conn = pymysql.connect(host='source', user='root', password='pass', db='myapp')
target_conn = pymysql.connect(host='target', user='root', password='pass', db='myapp')

batch_size = 1000
offset = 0

while True:
    # 从源库读取数据
    cursor = source_conn.cursor()
    cursor.execute(f"SELECT * FROM orders ORDER BY id LIMIT {batch_size} OFFSET {offset}")
    rows = cursor.fetchall()

    if not rows:
        break

    # 按分片规则插入目标表
    for row in tqdm(rows):
        shard_index = row['user_id'] % 4
        table_name = f"orders_{shard_index}"

        target_cursor = target_conn.cursor()
        target_cursor.execute(
            f"INSERT INTO {table_name} (id, user_id, order_no, amount, created_at) "
            f"VALUES (%s, %s, %s, %s, %s)",
            (row['id'], row['user_id'], row['order_no'], row['amount'], row['created_at'])
        )
        target_cursor.close()

    offset += batch_size
    cursor.close()

source_conn.close()
target_conn.close()
```

### 读写分离迁移

```sql
-- 主库配置（写）
-- my.cnf
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = ROW

-- 创建复制用户
CREATE USER 'repl'@'%' IDENTIFIED BY 'ReplicaPass123!';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

-- 从库配置（读）
-- my.cnf
[mysqld]
server-id = 2
relay-log = relay-bin
read-only = 1

-- 应用层连接配置（伪代码）
# 主库连接
master_db = {
  'host': 'master-db.example.com',
  'port': 3306,
  'user': 'app_user',
  'password': 'AppPass123'
}

# 从库连接列表
slave_dbs = [
  {'host': 'slave-1.example.com', 'port': 3306},
  {'host': 'slave-2.example.com', 'port': 3306},
  {'host': 'slave-3.example.com', 'port': 3306}
]

# 读写路由函数
def get_db_connection(is_write=False):
  if is_write:
    return connect(master_db)
  else:
    # 轮询从库（负载均衡）
    slave = random.choice(slave_dbs)
    return connect(slave)
```

### 云数据库迁移（RDS → 自建）

```bash
# 场景：从 AWS RDS MySQL 迁移到自建 MySQL

# 步骤 1: 从 RDS 创建快照
# AWS Console → RDS → Instances → 选择实例 → Create Snapshot

# 步骤 2: 导出快照数据
# 使用 AWS DMS（Database Migration Service）
# 或使用 mysqldump

# 使用 mysqldump 导出
mysqldump -h mydb.xxxx.us-east-1.rds.amazonaws.com \
  -u admin -p \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --all-databases | gzip > rds_backup.sql.gz

# 步骤 3: 传输到目标服务器
scp rds_backup.sql.gz user@target-server:/tmp/

# 步骤 4: 导入到自建数据库
gunzip < rds_backup.sql.gz | mysql -u root -p

# 步骤 5: 验证数据
mysql -u root -p -e "SHOW DATABASES;"
mysql -u root -p -e "SELECT COUNT(*) FROM myapp.users;"
```

### 国产数据库迁移案例

#### MySQL → OceanBase 迁移

```bash
# 方法 1: 使用 OMS（OceanBase Migration Service）

# 步骤 1: 创建迁移任务
# 登录 OMS 控制台 → 新建迁移任务

# 步骤 2: 配置源端（MySQL）
source:
  type: mysql
  host: mysql-host
  port: 3306
  user: migration_user
  password: MysqlPass123

# 步骤 3: 配置目标端（OceanBase）
target:
  type: oceanbase
  host: ob-host
  port: 2881
  tenant: my_tenant
  user: root@my_tenant
  password: ObPass123

# 步骤 4: 启动迁移任务

# 方法 2: 使用数据泵（Data Pump）
# 从 MySQL 导出
mysqldump -u root -p --single-transaction myapp > myapp.sql

# 转换为 OceanBase 兼容格式
# OMS 会自动处理数据类型映射

# 导入 OceanBase
obclient -h ob-host -P 2881 -u root@my_tenant -p myapp < myapp_converted.sql
```

#### Oracle → 达梦 DM8 迁移

```bash
# 使用 DTS（达梦数据迁移工具）

# 步骤 1: 配置源端（Oracle）
source:
  type: oracle
  host: oracle-host
  port: 1521
  sid: ORCL
  user: system
  password: OraclePass123

# 步骤 2: 配置目标端（达梦）
target:
  type: dameng
  host: dm-host
  port: 5236
  user: SYSDBA
  password: DmPass123

# 步骤 3: 配置迁移策略
migration:
  mode: full  # 全量迁移
  structure: true  # 迁移表结构
  data: true  # 迁移数据
  index: true  # 迁移索引
  constraint: true  # 迁移约束

# 步骤 4: 执行迁移

# 数据类型对照（主要差异）
# Oracle NUMBER(10) → DM DECIMAL(10)
# Oracle VARCHAR2(100) → DM VARCHAR(100)
# Oracle CLOB → DM CLOB
# Oracle DATE → DM TIMESTAMP
# Oracle BLOB → DM BLOB
```

## 六、备份验证与灾难恢复

### 备份完整性验证

```bash
#!/bin/bash
# MySQL 备份验证脚本

BACKUP_DIR="/data/backups/mysql"
BACKUP_FILE="$1"
TEST_DB="backup_verify_test"

# 创建测试数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS $TEST_DB;"

# 恢复备份到测试库
echo "Restoring backup to test database..."
gunzip < $BACKUP_FILE | mysql -u root -p $TEST_DB

# 验证表数量
TABLE_COUNT=$(mysql -u root -p -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$TEST_DB';")
echo "Tables restored: $TABLE_COUNT"

# 验证行数
for table in $(mysql -u root -p -N -e "SELECT table_name FROM information_schema.tables WHERE table_schema='$TEST_DB';"); do
  ROWS=$(mysql -u root -p -N -e "SELECT COUNT(*) FROM $TEST_DB.$table;")
  echo "$table: $ROWS rows"
done

# 清理测试库
mysql -u root -p -e "DROP DATABASE $TEST_DB;"

echo "Backup verification completed!"
```

### 灾难恢复演练

```bash
#!/bin/bash
# 数据库灾难恢复演练脚本

echo "=== Disaster Recovery Drill ==="

# 步骤 1: 停止应用
echo "Step 1: Stopping application..."
systemctl stop myapp

# 步骤 2: 停止数据库
echo "Step 2: Stopping database..."
systemctl stop mysql

# 步骤 3: 备份当前数据（以防需要回滚）
echo "Step 3: Backing up current data..."
cp -r /var/lib/mysql /var/lib/mysql.before_recovery

# 步骤 4: 恢复最新备份
echo "Step 4: Restoring from backup..."
LATEST_BACKUP=$(ls -t /data/backups/mysql/full_backup_*.sql.gz | head -1)
gunzip < $LATEST_BACKUP | mysql -u root -p

# 步骤 5: 应用增量日志
echo "Step 5: Applying binary logs..."
# 获取备份后的 binlog 文件
mysqlbinlog /var/lib/mysql/mysql-bin.000006 | mysql -u root -p

# 步骤 6: 启动数据库
echo "Step 6: Starting database..."
systemctl start mysql

# 步骤 7: 验证数据
echo "Step 7: Verifying data..."
mysql -u root -p -e "SHOW DATABASES;"
mysql -u root -p myapp -e "SELECT COUNT(*) FROM users;"

# 步骤 8: 启动应用
echo "Step 8: Starting application..."
systemctl start myapp

# 步骤 9: 健康检查
echo "Step 9: Health check..."
curl -f http://localhost:8080/health || exit 1

echo "=== Recovery Drill Completed Successfully ==="
```

## 七、最佳实践

### 备份策略建议

```
生产环境备份策略（3-2-1 原则）

1. 数据保留 3 份
   - 本地全量备份（每日）
   - 本地增量备份（每小时）
   - 异地备份（每日）

2. 使用 2 种不同格式
   - SQL 逻辑备份（跨平台兼容）
   - 物理备份（快速恢复）

3. 1 份异地备份
   - 对象存储（OSS/S3）
   - 异地服务器

备份周期：
- 全量备份：每天凌晨 2:00
- 增量备份：每小时
- Binlog 备份：每 15 分钟
- 异地同步：每天凌晨 4:00

保留策略：
- 每日备份：保留 7 天
- 每周备份：保留 4 周
- 每月备份：保留 12 个月
```

### 迁移检查清单

```
迁移前准备：
□ 评估源库数据量和迁移时间窗口
□ 制定详细迁移方案和回滚方案
□ 准备目标环境（硬件、网络、软件）
□ 在测试环境完整演练迁移流程
□ 通知相关人员迁移时间窗口
□ 准备应急联系人和联系方式

迁移中执行：
□ 执行最后一次全量备份
□ 验证目标库配置正确
□ 执行数据迁移
□ 验证数据完整性（表数量、行数、校验和）
□ 执行数据对比测试
□ 应用连接测试

迁移后验证：
□ 执行关键业务功能测试
□ 监控数据库性能指标
□ 验证备份正常工作
□ 验证高可用配置
□ 监控错误日志
□ 性能调优
```

### 常见问题排查

```bash
# 问题 1: 字符集乱码
# 检查字符集设置
SHOW VARIABLES LIKE 'character%';

# 导出时指定字符集
mysqldump --default-character-set=utf8mb4

# 问题 2: 主键冲突
# 跳过错误继续导入
mysql -u root -p --force < backup.sql

# 问题 3: 外键约束导致导入失败
# 禁用外键检查
SET FOREIGN_KEY_CHECKS=0;
-- 导入数据
SET FOREIGN_KEY_CHECKS=1;

# 问题 4: 从库复制延迟
# 查看延迟
SHOW SLAVE STATUS\G
# Seconds_Behind_Master: 0

# 优化从库参数
# my.cnf
[mysqld]
slave_parallel_workers = 4
slave_parallel_type = LOGICAL_CLOCK
```

---

**最后更新：2026 年 2 月**
**版本：v1.0**

相关文档：
- [第 14 章：数据库性能调优完全指南](./chapter-14)
- [第 13 章：主从复制与高可用](./chapter-13)
