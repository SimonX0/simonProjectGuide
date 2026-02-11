---
title: 数据库迁移与备份面试题
---

# 数据库迁移与备份面试题

> **难度等级**：⭐⭐⭐ | **出现频率**：65% | **建议用时**：25分钟

## 备份题

### 1. MySQL冷备份与热备份区别？

**参考答案**：

**冷备份（Cold Backup）**：
- 需要停机或停写
- 业务中断
- 数据一致性好
- 适合：允许停机的场景

**热备份（Hot Backup）**：
- 在线备份，不停机
- 业务持续运行
- 可能有少量数据不一致
- 适合：7x24运行的系统

**温备份（Warm Backup）**：
- 只读模式备份
- 允许查询，禁止写操作

---

### 2. MySQL备份工具有哪些？

**参考答案**：

**1. mysqldump（逻辑备份）**
```bash
# 全库备份
mysqldump -u root -p --single-transaction --routines --events --all-databases > full.sql

# 只备份特定库
mysqldump -u root -p mydb > mydb.sql

# 压缩备份
mysqldump -u root -p mydb | gzip > mydb.sql.gz

# 恢复
mysql -u root -p mydb < mydb.sql
```
- 优点：跨平台、文本格式
- 缺点：大库慢、恢复慢

**2. mysqlhotcopy（物理备份）**
```bash
# 在线热备份
mysqlhotcopy --user=root --password=xxx \
  --databases=mydb \
  --backup-dir=/backup/mysql \
  --no-locking
```
- 优点：快速、恢复快
- 缺点：仅限本地

**3. XtraBackup**
```bash
# 全备
xtrabackup --backup --target-dir=/backup/base

# 增量备份
xtrabackup --backup --target-dir=/backup/inc1 --incremental-basedir=/backup/base

# 增量备份
xtrabackup --backup --target-dir=/backup/inc2 --incremental-basedir=/backup/inc1

# 准备恢复（解压增量）
xtrabackup --prepare --target-dir=/backup/inc2

# 恢复（停止MySQL）
xtrabackup --copy-back --target-dir=/backup/inc2 --datadir=/var/lib/mysql
```
- 优点：在线热备、增量、压缩
- 推荐生产环境使用

---

### 3. binlog恢复数据？

**参考答案**：

**查看binlog**：
```sql
-- 查看当前binlog
SHOW MASTER LOGS;

-- 查看binlog事件
SHOW BINLOG EVENTS IN 'mysql-bin.000005' LIMIT 10;
```

**使用mysqlbinlog工具**：
```bash
# 导出binlog为SQL
mysqlbinlog --start-datetime="2024-01-01 00:00:00" \
  --stop-datetime="2024-01-01 23:59:59" \
  --database=mydb \
  mysql-bin.000005 > recovery.sql

# 恢复SQL
mysql -u root -p mydb < recovery.sql
```

**基于位置恢复**：
```bash
# 指定位置
mysqlbinlog --start-position=107 \
  --stop-position=500 \
  mysql-bin.000005 > recovery.sql

# 指定时间
mysqlbinlog --start-datetime="2024-01-01 10:00:00" \
  --stop-datetime="2024-01-01 12:00:00" \
  mysql-bin.000005 > recovery.sql
```

---

### 4. PostgreSQL备份方式？

**参考答案**：

**1. pg_dump（逻辑备份）**
```bash
# 全库备份
pg_dump -U postgres -d mydb > mydb.sql

# 自定义格式
pg_dump -U postgres -d mydb -Fc -f mydb.dump

# 压缩
pg_dump -U postgres -d mydb | gzip > mydb.sql.gz

# 并行备份（pg_dump不支持，用其他工具）
pg_dump -j 4 -U postgres -d mydb -f mydb_
```

**2. pg_basebackup（物理备份）**
```bash
# 全备
pg_basebackup -D /var/lib/postgresql/data -Ft -z -P -U postgres

# 增量
pg_basebackup -D /backup -i -Ft -z -P -U postgres

# 恢复
# 1. 停止PostgreSQL
pg_ctl stop -D /var/lib/postgresql/data

# 2. 恢复
pg_basebackup --restore -D /var/lib/postgresql/data -j 4 /backup/base

# 3. 启动
pg_ctl start -D /var/lib/postgresql/data
```
- 优点：快、支持增量
- 推荐：生产环境

**3. pgBackRest**：
```bash
# 全备
pgbackrest --type=full --dbname=mydb

# 增量
pgbackrest --type=incr --dbname=mydb

# 增量
pgbackrest --type=diff --dbname=mydb

# 恢复
pgbackrest --restore /backup/mydb
```
- 优点：压缩、加密、并行
- 企业推荐

---

## 迁移题

### 5. 如何实现零停机迁移？

**参考答案**：

**方案1：双写迁移**
```
[应用]
  |
  +---> [旧库: Oracle]
  |       |
  +---> [新库: 达梦]
  |       |
  +---> [对比工具]
```

**流程**：
1. 业务同时写旧库和新库
2. 历史数据迁移（在后台进行）
3. 对比数据一致性
4. 切换读流量到新库
5. 下线旧库

**对比工具**：
```sql
-- Oracle vs 达梦对比
SELECT COUNT(*) FROM oracle_table
MINUS
SELECT COUNT(*) FROM dm_table;
```

---

### 6. 大数据量迁移最佳实践？

**参考答案**：

**方案1：分批迁移**
```python
# 每批10000条
batch_size = 10000

# 记录游标
last_id = 0

while True:
    # 读取一批
    data = source_db.query(
        f"SELECT * FROM large_table WHERE id > {last_id} ORDER BY id LIMIT {batch_size}"
    )

    if not data:
        break

    # 写入目标
    target_db.bulk_insert(data)

    # 更新游标
    last_id = data[-1]['id']
```

**方案2：并行迁移**
```python
# 多进程并行
from multiprocessing import Pool

def migrate_batch(batch_id):
    # 迁移一批数据
    pass

with Pool(4) as pool:
    pool.map(migrate_batch, range(100))
```

**方案3：使用CDC（Change Data Capture）**
```
[Oracle] -> [OGG/Canal] -> [Kafka] -> [达梦/MySQL]
                    (增量实时同步)
```

---

### 7. 国产数据库迁移注意事项？

**参考答案**：

**1. 数据类型映射**
| Oracle | MySQL | PostgreSQL | 达梦 |
|-------|-------|------------|------|
| NUMBER | DECIMAL | NUMERIC | DECIMAL |
| VARCHAR2 | VARCHAR | VARCHAR | VARCHAR2 |
| DATE | DATETIME | TIMESTAMP | DATETIME |
| CLOB | TEXT/JSONB | TEXT | CLOB |

**2. SQL语法差异**
```sql
-- Oracle
SELECT * FROM users WHERE ROWNUM <= 10;

-- MySQL
SELECT * FROM users LIMIT 10;

-- PostgreSQL
SELECT * FROM users LIMIT 10;

-- 达梦
SELECT * FROM users LIMIT 10;  -- 支持LIMIT
```

**3. 存储过程迁移**
- 达梦：兼容PL/SQL，改动小
- MySQL：需要改写为SQL + 存储过程
- PostgreSQL：改写为PL/pgSQL

**4. 字符集处理**
```sql
-- 查看字符集
-- Oracle
SELECT * FROM NLS_DATABASE_PARAMETERS;

-- MySQL
SHOW CHARACTER SET;

-- PostgreSQL
SHOW SERVER_ENCODING;

-- 迁移前统一为UTF8
```

---

## Redis备份题

### 8. Redis持久化对比？

**参考答案**：

| 特性 | RDB | AOF |
|-----|-----|-----|
| **存储方式** | 内存快照 | 追加写命令 |
| **文件大小** | 小（压缩） | 大 |
| **恢复速度** | 快 | 慢 |
| **数据完整性** | 可能丢失最新数据 | 最多丢失1秒数据 |
| **性能影响** | fork时阻塞 | 每秒写盘 |
| **适用场景** | 备份 | 主从/恢复 |

**混合持久化**（推荐）：
```conf
# 开启AOF和RDB
appendonly yes
aof-use-rdb-preamble yes

# Redis 4.0+自动使用RDB-AOF混合
```

---

### 9. Redis主从同步过程？

**参考答案**：

**全量同步**：
```
从库连接
  |
  +---> SYNC命令
         |
  主库: RDB文件快照
         |
  +---> 从库加载RDB
```

**增量同步**：
```
主库
  |
  +---> 执行写命令 ->传播给所有从库
                          |
从库: 接收并执行写命令
```

**部分同步**：
```bash
# PSYNC命令
PSYNC <runid> <offset>

# runid: 主库运行ID
# offset: 复制偏移量
```

---

## 实战场景题

### 10. 设计一个数据库备份系统

**参考答案**：

**需求**：
- 每日自动全量备份
- 每小时增量备份
- 异地备份
- 备份验证

**方案1：MySQL + XtraBackup + NFS**
```bash
#!/bin/bash
# 全量备份脚本
DATE=$(date +%Y%m%d)
BACKUP_DIR=/nfs/backup/mysql

# 全备
xtrabackup --backup --target-dir=${BACKUP_DIR}/full/${DATE}

# 增量（每小时）
for i in {1..24}; do
  HOUR=$(printf "%02d" $((i-1))
  xtrabackup --backup --target-dir=${BACKUP_DIR}/inc/${DATE}_${HOUR} \
    --incremental-basedir=${BACKUP_DIR}/full/${DATE}
done

# 保留7天
find ${BACKUP_DIR} -mtime +7 -delete
```

**方案2：PostgreSQL + pgBackRest + S3**
```bash
#!/bin/bash
# 备份到S3兼容存储
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
export S3_ENDPOINT=s3.amazonaws.com

# 全备
pgbackrest --type=full --s3-bucket=mydb-backup

# 增量
pgbackrest --type=incr --s3-bucket=mydb-backup

# 恢复测试
pgbackrest --restore s3://mydb-backup/base /tmp/restore_test
```

---

### 11. Oracle到达梦迁移方案

**参考答案**：

**使用达梦迁移工具（DTS）**：
```bash
# DTS（Data Transfer Server）
1. 创建迁移任务（配置源端Oracle）
2. 配置目标端达梦
3. 选择迁移对象（表/视图/存储过程）
4. 启动任务
5. 监控迁移进度
```

**手动迁移**：
```sql
-- 1. Oracle导出
exp user/password@oracle file=exp.dmp log=exp.log tables=users

-- 2. 转换格式（DTS可自动）
-- 3. 达梦导入
imp user/password@dm file=exp.dmp log=imp.log
```

**迁移验证**：
```sql
-- 数量对比
SELECT 'users', COUNT(*) FROM oracle_schema.users
UNION ALL
SELECT 'users', COUNT(*) FROM dm_schema.users;

-- 抽样对比
SELECT * FROM dm_schema.users TABLESAMPLE(1)
MINUS
SELECT * FROM oracle_schema.users TABLESAMPLE(1);
```

---

**更新时间**：2026年2月 | **版本**：v1.0
