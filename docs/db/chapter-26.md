---
title: 第26章：分布式事务解决方案
---

# ：分布式事务解决方案

> **难度等级**：⭐⭐⭐⭐ 高级 | **学习时长**：12小时 | **实战项目**：分布式支付系统

## 📚 本章目录

- [24.1 分布式事务理论](#241-分布式事务理论)
- [24.2 2PC/3PC](#242-2pc3pc)
- [24.3 TCC](#243-tcc)
- [24.4 Saga](#244-saga)
- [24.5 本地消息表](#245-本地消息表)
- [24.6 事务消息](#246-事务消息)

---

## 分布式事务理论

### CAP 定理

```
┌──────────────────────────────────────────────────────┐
│                    CAP 定理                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  在分布式系统中，无法同时满足以下三点：               │
│                                                      │
│   ┌─────┐       ┌─────┐       ┌─────┐               │
│   │  C  │       │  A  │       │  P  │               │
│   │一致性│       │可用性│       │分区容错│              │
│   └─────┘       └─────┘       └─────┘               │
│      │             │             │                   │
│      └─────────────┴─────────────┘                   │
│                    │                                │
│                    ▼                                │
│              只能同时满足两个                        │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │    CA       │  │    CP       │  │    AP       ││
│  │  (单机系统)  │  │ (Redis等)    │  │ (CouchDB)   ││
│  │  不考虑分区  │  │ 放弃可用性  │  │ 放弃强一致性  ││
│  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                      │
└──────────────────────────────────────────────────────┘

- C (Consistency): 所有节点在同一时刻数据一致
- A (Availability): 每个请求都能得到响应
- P (Partition Tolerance): 系统在分区故障时仍能运行
```

### BASE 理论

```
┌──────────────────────────────────────────────────────┐
│                    BASE 理论                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  BASE 是对 CAP 中 AP 的补充：                        │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ BA (Basically Available)                      │  │
│  │ 基本可用：分布式系统在出现故障时允许损失部分   │  │
│  │ 可用性，保证核心功能可用                      │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ S (Soft State)                                │  │
│  │ 软状态：允许系统中的数据存在中间状态           │  │
│  │ （数据同步存在延迟）                          │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ E (Eventually Consistent)                     │  │
│  │ 最终一致性：系统不需要实时保证数据强一致性     │  │
│  │ 但在一段时间后数据最终达到一致                │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 一致性模型对比

| 一致性级别 | 说明 | 典型应用 |
|----------|------|---------|
| **强一致性** | 数据更新后，任何读取都能获取最新值 | 银行转账、支付系统 |
| **最终一致性** | 数据更新后，系统保证最终一致，但过程中可能不一致 | 社交网络、电商订单 |
| **弱一致性** | 不保证数据一致，可能读到旧数据 | 视频播放量、点赞数 |
| **因果一致性** | 只有有因果关系的操作才要求一致 | 协同编辑 |

### 分布式事务分类

```
┌──────────────────────────────────────────────────────┐
│               分布式事务解决方案分类                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  2PC/3PC                    TCC                     │
│  (两阶段/三阶段提交)         (Try-Confirm-Cancel)     │
│  ├── 强一致性               ├── 一致性较好           │
│  ├── 性能差                 ├── 业务侵入性强         │
│  └── 同步阻塞               └── 开发复杂             │
│                                                      │
│  Saga                       本地消息表               │
│  (长事务拆分)               (异步可靠消息)           │
│  ├── 最终一致性             ├── 最终一致性           │
│  ├── 实现简单               ├── 实现简单             │
│  └── 无锁                   └── 需要额外表           │
│                                                      │
│  事务消息                                           │
│  (基于消息队列)                                     │
│  ├── 最终一致性                                     │
│  ├── 解耦性好                                       │
│  └── 依赖MQ                                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 2PC/3PC

### 2PC（两阶段提交）

```
┌──────────────────────────────────────────────────────┐
│                  2PC 协议流程                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  阶段1: 准备阶段 (Prepare Phase)                     │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐        │
│  │ 协调者  │     │ 参与者1 │     │ 参与者2 │        │
│  └────┬────┘     └────┬────┘     └────┬────┘        │
│       │               │               │              │
│       ├──────────────→│               │              │
│       │  Can Commit? │               │              │
│       │              (事务预处理)      │              │
│       ├──────────────→│               │              │
│       │               │               │              │
│       │←──────────────┤               │              │
│       │   Yes/No      │               │              │
│       │←──────────────┤               │              │
│                                                      │
│  阶段2: 提交阶段 (Commit Phase)                      │
│       ┌──────────────────────────────┐              │
│       │ 所有参与者都返回 Yes?         │              │
│       └──────────────────────────────┘              │
│          Yes             No                         │
│           │               │                          │
│           ▼               ▼                          │
│       ┌─────────┐   ┌─────────┐                      │
│       │ Do Commit│  │Do Abort │                      │
│       └────┬────┘   └────┬────┘                      │
│            │             │                           │
│            ├────────────→│                          │
│            │ Commit      │                          │
│            ├────────────→│                          │
│            │             │                           │
│       ┌────┴────┐   ┌────┴────┐                      │
│       │ Ack      │  │ Ack      │                      │
│       └──────────┘   └──────────┘                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**XA 协议实现（2PC）**：

```java
// 基于 Atomikos 的 XA 事务实现

@Configuration
public class XAConfig {

    @Bean(name = "dataSource1")
    public DataSource dataSource1() {
        MysqlXADataSource mysqlXADataSource = new MysqlXADataSource();
        mysqlXADataSource.setUrl("jdbc:mysql://192.168.1.10:3306/db1");
        mysqlXADataSource.setUser("root");
        mysqlXADataSource.setPassword("password");

        AtomikosDataSourceBean xaDataSource = new AtomikosDataSourceBean();
        xaDataSource.setXaDataSource(mysqlXADataSource);
        xaDataSource.setUniqueResourceName("db1");
        xaDataSource.setMaxPoolSize(10);

        return xaDataSource;
    }

    @Bean(name = "dataSource2")
    public DataSource dataSource2() {
        MysqlXADataSource mysqlXADataSource = new MysqlXADataSource();
        mysqlXADataSource.setUrl("jdbc:mysql://192.168.1.11:3306/db2");
        mysqlXADataSource.setUser("root");
        mysqlXADataSource.setPassword("password");

        AtomikosDataSourceBean xaDataSource = new AtomikosDataSourceBean();
        xaDataSource.setXaDataSource(mysqlXADataSource);
        xaDataSource.setUniqueResourceName("db2");
        xaDataSource.setMaxPoolSize(10);

        return xaDataSource;
    }

    @Bean
    public JtaTransactionManager transactionManager() {
        UserTransactionManager userTransactionManager = new UserTransactionManager();
        userTransactionManager.setForceShutdown(false);

        UserTransaction userTransaction = new UserTransactionImp();
        JtaTransactionManager transactionManager = new JtaTransactionManager();
        transactionManager.setUserTransaction(userTransaction);
        transactionManager.setTransactionManager(userTransactionManager);

        return transactionManager;
    }
}

// 业务代码
@Service
public class OrderService {

    @Autowired
    @Qualifier("dataSource1")
    private DataSource dataSource1;

    @Autowired
    @Qualifier("dataSource2")
    private DataSource dataSource2;

    @Transactional
    public void createOrder(Order order) {
        // 操作数据库1
        JdbcTemplate jdbcTemplate1 = new JdbcTemplate(dataSource1);
        jdbcTemplate1.update("INSERT INTO orders ...");

        // 操作数据库2
        JdbcTemplate jdbcTemplate2 = new JdbcTemplate(dataSource2);
        jdbcTemplate2.update("UPDATE inventory ...");

        // XA 协议保证两库要么都提交，要么都回滚
    }
}
```

### 3PC（三阶段提交）

```
┌──────────────────────────────────────────────────────┐
│                  3PC 协议流程                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  阶段1: CanCommit（询问）                            │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐        │
│  │ 协调者  │     │ 参与者1 │     │ 参与者2 │        │
│  └────┬────┘     └────┬────┘     └────┬────┘        │
│       │               │               │              │
│       ├──────────────→│               │              │
│       │ Can Commit?   │               │              │
│       ├──────────────→│               │              │
│       │               │               │              │
│       │←──────────────┤               │              │
│       │   Yes/No      │               │              │
│       │←──────────────┤               │              │
│                                                      │
│  阶段2: PreCommit（预提交）                          │
│       │如果所有参与者都返回 Yes                       │
│       ├──────────────→│               │              │
│       │ PreCommit     │               │              │
│       ├──────────────→│               │              │
│       │               │ (执行事务)     │              │
│       │←──────────────┤               │              │
│       │   Yes/No      │               │              │
│       │←──────────────┤               │              │
│                                                      │
│  阶段3: DoCommit（提交）                             │
│       │如果所有参与者都返回 Yes                       │
│       ├──────────────→│               │              │
│       │ DoCommit      │               │              │
│       ├──────────────→│               │              │
│       │               │ (提交事务)     │              │
│       │←──────────────┤               │              │
│       │   Ack         │               │              │
│       │←──────────────┤               │              │
│                                                      │
└──────────────────────────────────────────────────────┘

改进：
1. 引入超时机制，避免无限阻塞
2. 在预提交阶段中断，参与者可以继续提交
```

**2PC/3PC 对比**：

| 特性 | 2PC | 3PC |
|-----|-----|-----|
| **阶段数** | 2 | 3 |
| **阻塞** | 同步阻塞 | 减少阻塞 |
| **超时** | 无超时 | 有超时 |
| **性能** | 较差 | 稍好 |
| **复杂度** | 简单 | 复杂 |
| **适用场景** | 强一致性要求 | 强一致性 + 性能要求 |

---

## TCC

### TCC 原理

```
┌──────────────────────────────────────────────────────┐
│                  TCC 事务流程                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  TCC = Try - Confirm - Cancel                        │
│                                                      │
│  Try 阶段:                                          │
│  ├── 检查业务规则                                    │
│  ├── 资源预留（锁定）                                │
│  └── 返回执行结果                                    │
│                                                      │
│  Confirm 阶段:                                       │
│  ├── Try 阶段全部成功时执行                          │
│  ├── 提交业务操作                                    │
│  ├── 释放预留资源                                    │
│  └── 完成事务                                        │
│                                                      │
│  Cancel 阶段:                                        │
│  ├── Try 阶段有失败时执行                            │
│  ├── 取消业务操作                                    │
│  ├── 释放预留资源                                    │
│  └── 回滚事务                                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### TCC 实现示例

**订单支付场景**：

```java
// 1. Try 阶段：预扣库存
@Service
public class InventoryService {

    @Autowired
    private InventoryMapper inventoryMapper;

    @Transactional
    public boolean tryDeductInventory(Long productId, int count) {
        // 检查库存
        Inventory inventory = inventoryMapper.selectByProductId(productId);
        if (inventory.getStock() < count) {
            throw new BusinessException("库存不足");
        }

        // 冻结库存（预留资源）
        int frozen = inventory.getFrozen() + count;
        int stock = inventory.getStock() - count;
        inventoryMapper.updateFrozen(productId, frozen, stock);

        return true;
    }

    // 2. Confirm 阶段：扣减库存
    @Transactional
    public boolean confirmDeductInventory(Long productId, int count) {
        // 冻结库存减少，已售库存增加
        inventoryMapper.confirmDeduct(productId, count);
        return true;
    }

    // 3. Cancel 阶段：恢复库存
    @Transactional
    public boolean cancelDeductInventory(Long productId, int count) {
        // 释放冻结的库存，恢复可用库存
        inventoryMapper.cancelDeduct(productId, count);
        return true;
    }
}

// 支付服务
@Service
public class PaymentService {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private AccountService accountService;

    @Autowired
    private OrderService orderService;

    // TCC 事务管理器
    public void pay(Order order) {
        String transactionId = UUID.randomUUID().toString();

        try {
            // Try 阶段
            boolean inventoryTry = inventoryService.tryDeductInventory(
                order.getProductId(),
                order.getCount()
            );

            boolean accountTry = accountService.tryDeductBalance(
                order.getUserId(),
                order.getAmount()
            );

            if (inventoryTry && accountTry) {
                // Confirm 阶段
                inventoryService.confirmDeductInventory(
                    order.getProductId(),
                    order.getCount()
                );

                accountService.confirmDeductBalance(
                    order.getUserId(),
                    order.getAmount()
                );

                orderService.updateOrderStatus(order.getId(), "PAID");
            } else {
                throw new BusinessException("Try 阶段失败");
            }

        } catch (Exception e) {
            // Cancel 阶段
            try {
                inventoryService.cancelDeductInventory(
                    order.getProductId(),
                    order.getCount()
                );
            } catch (Exception ex) {
                log.error("库存回滚失败", ex);
            }

            try {
                accountService.cancelDeductBalance(
                    order.getUserId(),
                    order.getAmount()
                );
            } catch (Exception ex) {
                log.error("账户回滚失败", ex);
            }

            throw new BusinessException("支付失败");
        }
    }
}
```

**TCC 幂等性处理**：

```java
@Service
public class TccTransactionManager {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    // Try 阶段幂等性
    public boolean tryExecute(String transactionId, TccAction action) {
        String key = "tcc:try:" + transactionId;

        // 使用 Redis SETNX 实现幂等
        Boolean success = redisTemplate.opsForValue()
            .setIfAbsent(key, "1", Duration.ofMinutes(10));

        if (Boolean.FALSE.equals(success)) {
            // 已经执行过，直接返回成功
            return true;
        }

        return action.execute();
    }

    // Confirm 阶段幂等性
    public boolean confirmExecute(String transactionId, TccAction action) {
        String key = "tcc:confirm:" + transactionId;

        Boolean success = redisTemplate.opsForValue()
            .setIfAbsent(key, "1", Duration.ofHours(24));

        if (Boolean.FALSE.equals(success)) {
            return true;
        }

        return action.execute();
    }

    // Cancel 阶段幂等性
    public boolean cancelExecute(String transactionId, TccAction action) {
        String key = "tcc:cancel:" + transactionId;

        Boolean success = redisTemplate.opsForValue()
            .setIfAbsent(key, "1", Duration.ofHours(24));

        if (Boolean.FALSE.equals(success)) {
            return true;
        }

        return action.execute();
    }
}

@FunctionalInterface
public interface TccAction {
    boolean execute();
}
```

**TCC 空回滚和悬挂**：

```java
@Service
public class TccTransactionService {

    @Autowired
    private TransactionRecordMapper transactionRecordMapper;

    // 防止空回滚：Cancel 先于 Try 执行
    public void preventEmptyRollback(String transactionId) {
        TransactionRecord record = transactionRecordMapper
            .selectByTransactionId(transactionId);

        if (record == null) {
            // Try 未执行，不允许 Cancel
            throw new BusinessException("空回滚保护");
        }
    }

    // 防止悬挂：Try 后未执行 Confirm，被 Cancel
    public void preventHanging(String transactionId) {
        TransactionRecord record = transactionRecordMapper
            .selectByTransactionId(transactionId);

        if (record != null && record.getStatus() == TransactionStatus.CANCELLED) {
            // 已经 Cancel，不允许 Try
            throw new BusinessException("悬挂保护");
        }
    }
}
```

---

## Saga

### Saga 原理

```
┌──────────────────────────────────────────────────────┐
│                  Saga 事务流程                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Saga 将长事务拆分为多个本地短事务：                 │
│                                                      │
│  正向流程:                                            │
│  ┌────────┐   ┌────────┐   ┌────────┐              │
│  │ T1     │ → │ T2     │ → │ T3     │              │
│  │ 订单   │   │ 库存   │   │ 支付   │              │
│  └────────┘   └────────┘   └────────┘              │
│       │            │            │                    │
│       ▼            ▼            ▼                    │
│   成功         成功         失败                    │
│       │            │            │                    │
│       └────────────┴────────────┘                    │
│                     │                                │
│                     ▼                                │
│              补偿流程:                               │
│  ┌────────┐   ┌────────┐                            │
│  │ C3     │ ← │ C2     │                            │
│  │ 取消支付│  │ 恢复库存│                            │
│  └────────┘   └────────┘                            │
│                                                      │
└──────────────────────────────────────────────────────┘

每个本地事务：
- 事务：执行业务操作
- 补偿：定义回滚操作（如果失败）
```

### Saga 实现示例

**订单处理 Saga**：

```java
// Saga 定义
public class OrderSaga {

    private List<SagaStep> steps = new ArrayList<>();
    private List<SagaStep> executedSteps = new ArrayList<>();

    public void addStep(SagaStep step) {
        steps.add(step);
    }

    public void execute() {
        try {
            // 正向执行所有步骤
            for (SagaStep step : steps) {
                step.execute();
                executedSteps.add(step);
            }
        } catch (Exception e) {
            // 发生异常，执行补偿
            compensate();
            throw new BusinessException("Saga 执行失败", e);
        }
    }

    private void compensate() {
        // 反向执行补偿操作
        Collections.reverse(executedSteps);
        for (SagaStep step : executedSteps) {
            try {
                step.compensate();
            } catch (Exception e) {
                log.error("补偿操作失败: {}", step.getName(), e);
            }
        }
    }
}

// Saga 步骤定义
public abstract class SagaStep {

    private String name;

    public SagaStep(String name) {
        this.name = name;
    }

    // 执行事务
    public abstract void execute() throws Exception;

    // 补偿操作
    public abstract void compensate() throws Exception;

    public String getName() {
        return name;
    }
}

// 订单步骤
public class CreateOrderStep extends SagaStep {

    @Autowired
    private OrderService orderService;

    private Order order;

    public CreateOrderStep(Order order) {
        super("创建订单");
        this.order = order;
    }

    @Override
    public void execute() throws Exception {
        order = orderService.createOrder(order);
    }

    @Override
    public void compensate() throws Exception {
        orderService.cancelOrder(order.getId());
    }
}

// 库存步骤
public class DeductInventoryStep extends SagaStep {

    @Autowired
    private InventoryService inventoryService;

    private Long productId;
    private int count;

    public DeductInventoryStep(Long productId, int count) {
        super("扣减库存");
        this.productId = productId;
        this.count = count;
    }

    @Override
    public void execute() throws Exception {
        inventoryService.deductStock(productId, count);
    }

    @Override
    public void compensate() throws Exception {
        inventoryService.restoreStock(productId, count);
    }
}

// 支付步骤
public class ProcessPaymentStep extends SagaStep {

    @Autowired
    private PaymentService paymentService;

    private Long userId;
    private BigDecimal amount;

    public ProcessPaymentStep(Long userId, BigDecimal amount) {
        super("处理支付");
        this.userId = userId;
        this.amount = amount;
    }

    @Override
    public void execute() throws Exception {
        paymentService.processPayment(userId, amount);
    }

    @Override
    public void compensate() throws Exception {
        paymentService.refund(userId, amount);
    }
}

// 使用 Saga
@Service
public class OrderSagaService {

    public void processOrder(Order order) {
        OrderSaga saga = new OrderSaga();

        // 添加步骤
        saga.addStep(new CreateOrderStep(order));
        saga.addStep(new DeductInventoryStep(order.getProductId(), order.getCount()));
        saga.addStep(new ProcessPaymentStep(order.getUserId(), order.getAmount()));

        // 执行 Saga
        saga.execute();
    }
}
```

### Saga 协调模式

**编排模式（Choreography）**：

```java
// 基于事件的 Saga 编排

// 订单服务
@Service
public class OrderService {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Transactional
    public void createOrder(Order order) {
        // 1. 创建订单
        orderMapper.insert(order);

        // 2. 发布订单创建事件
        eventPublisher.publishEvent(new OrderCreatedEvent(
            order.getId(),
            order.getUserId(),
            order.getProductId(),
            order.getCount(),
            order.getAmount()
        ));
    }

    @EventListener
    public void handlePaymentFailed(PaymentFailedEvent event) {
        // 取消订单
        orderMapper.updateStatus(event.getOrderId(), OrderStatus.CANCELLED);
    }
}

// 库存服务
@Service
public class InventoryService {

    @Transactional
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        try {
            // 1. 扣减库存
            inventoryMapper.deductStock(event.getProductId(), event.getCount());

            // 2. 发布库存扣减成功事件
            eventPublisher.publishEvent(new InventoryDeductedEvent(
                event.getOrderId(),
                event.getProductId()
            ));
        } catch (Exception e) {
            // 3. 发布库存扣减失败事件
            eventPublisher.publishEvent(new InventoryDeductFailedEvent(
                event.getOrderId(),
                event.getProductId()
            ));
        }
    }

    @EventListener
    public void handlePaymentFailed(PaymentFailedEvent event) {
        // 恢复库存
        inventoryMapper.restoreStock(event.getProductId(), event.getCount());
    }
}

// 支付服务
@Service
public class PaymentService {

    @Transactional
    @EventListener
    public void handleInventoryDeducted(InventoryDeductedEvent event) {
        try {
            // 1. 处理支付
            paymentService.processPayment(event.getOrderId());

            // 2. 发布支付成功事件
            eventPublisher.publishEvent(new PaymentSucceededEvent(event.getOrderId()));
        } catch (Exception e) {
            // 3. 发布支付失败事件
            eventPublisher.publishEvent(new PaymentFailedEvent(
                event.getOrderId(),
                "支付失败"
            ));
        }
    }
}
```

**协调模式（Orchestration）**：

```java
// 基于 Saga 协调器

@Service
public class SagaOrchestrator {

    @Autowired
    private OrderService orderService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private SagaInstanceRepository sagaRepository;

    public void startOrderSaga(Order order) {
        // 创建 Saga 实例
        SagaInstance saga = SagaInstance.builder()
            .sagaType("ORDER_SAGA")
            .status(SagaStatus.STARTED)
            .payload(JSON.toJSONString(order))
            .build();
        sagaRepository.save(saga);

        // 执行第一步
        executeCreateOrder(saga);
    }

    private void executeCreateOrder(SagaInstance saga) {
        try {
            Order order = JSON.parseObject(saga.getPayload(), Order.class);
            order = orderService.createOrder(order);

            // 更新 Saga 状态
            saga.setCurrentStep("CREATE_ORDER");
            saga.setStatus(SagaStatus.COMPLETED);
            sagaRepository.save(saga);

            // 执行下一步
            executeDeductInventory(saga);

        } catch (Exception e) {
            saga.setStatus(SagaStatus.FAILED);
            sagaRepository.save(saga);
            compensate(saga);
        }
    }

    private void executeDeductInventory(SagaInstance saga) {
        try {
            Order order = JSON.parseObject(saga.getPayload(), Order.class);
            inventoryService.deductStock(order.getProductId(), order.getCount());

            saga.setCurrentStep("DEDUCT_INVENTORY");
            sagaRepository.save(saga);

            // 执行下一步
            executeProcessPayment(saga);

        } catch (Exception e) {
            compensate(saga);
        }
    }

    private void executeProcessPayment(SagaInstance saga) {
        try {
            Order order = JSON.parseObject(saga.getPayload(), Order.class);
            paymentService.processPayment(order.getUserId(), order.getAmount());

            saga.setCurrentStep("PROCESS_PAYMENT");
            saga.setStatus(SagaStatus.FINISHED);
            sagaRepository.save(saga);

        } catch (Exception e) {
            compensate(saga);
        }
    }

    private void compensate(SagaInstance saga) {
        Order order = JSON.parseObject(saga.getPayload(), Order.class);

        // 根据当前步骤执行补偿
        String currentStep = saga.getCurrentStep();

        if ("PROCESS_PAYMENT".equals(currentStep) || "DEDUCT_INVENTORY".equals(currentStep)) {
            // 恢复库存
            inventoryService.restoreStock(order.getProductId(), order.getCount());
        }

        if ("CREATE_ORDER".equals(currentStep)) {
            // 取消订单
            orderService.cancelOrder(order.getId());
        }

        saga.setStatus(SagaStatus.COMPENSATED);
        sagaRepository.save(saga);
    }
}
```

---

## 本地消息表

### 本地消息表原理

```
┌──────────────────────────────────────────────────────┐
│              本地消息表架构                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────┐                                        │
│  │ 业务服务 │                                        │
│  └────┬────┘                                        │
│       │                                              │
│       │ 1. 开始本地事务                              │
│       ├────────────────────────────────┐            │
│       │                                │            │
│       ▼                                ▼            │
│  ┌─────────┐                     ┌─────────┐       │
│  │业务表   │                     │消息表   │       │
│  │INSERT  │                     │INSERT  │       │
│  │UPDATE  │                     │status= │       │
│  └─────────┘                     │待发送   │       │
│                                  └─────────┘       │
│       │                                │            │
│       │ 2. 提交本地事务                │            │
│       ├────────────────────────────────┤            │
│       │                                │            │
│       ▼                                ▼            │
│  ┌─────────────────────────────────────────┐       │
│  │           消息发送器（定时任务）           │       │
│  └─────────────────────────────────────────┘       │
│       │                                                │
│       │ 3. 扫描消息表                                   │
│       ├─────────────┐                                 │
│       │              │                                 │
│       ▼              ▼                                 │
│  ┌─────────┐   ┌─────────┐                             │
│  │更新状态 │   │发送到MQ  │                             │
│  │处理中   │   │         │                             │
│  └─────────┘   └─────────┘                             │
│       │              │                                 │
│       └──────────────┘                                 │
│                      │                                 │
│                      ▼                                 │
│              ┌─────────┐                               │
│              │  消息队列│                               │
│              └────┬────┘                               │
│                   │                                     │
│                   │ 4. 消费消息                          │
│                   ▼                                     │
│              ┌─────────┐                               │
│              │下游服务 │                               │
│              │处理业务 │                               │
│              └─────────┘                               │
│                   │                                     │
│                   │ 5. 确认消息                          │
│                   ▼                                     │
│              ┌─────────┐                               │
│              │更新状态 │                               │
│              │已完成   │                               │
│              └─────────┘                               │
│                                                              │
└──────────────────────────────────────────────────────┘

优点：
✅ 保证消息与业务事务一致性
✅ 消息不丢失
✅ 实现简单

缺点：
❌ 需要额外存储
❌ 与业务耦合
```

### 本地消息表实现

**数据库表设计**：

```sql
-- 本地消息表
CREATE TABLE `local_message` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `topic` VARCHAR(255) NOT NULL COMMENT '消息主题',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-待发送, 1-发送中, 2-已发送, 3-发送失败',
  `retry_times` INT NOT NULL DEFAULT 0 COMMENT '重试次数',
  `next_retry_time` DATETIME COMMENT '下次重试时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status_retry` (`status`, `next_retry_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='本地消息表';
```

**消息表服务**：

```java
@Service
public class LocalMessageService {

    @Autowired
    private LocalMessageMapper messageMapper;

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    // 在本地事务中保存消息
    @Transactional
    public void saveMessage(String topic, Object messageContent) {
        LocalMessage message = LocalMessage.builder()
            .topic(topic)
            .content(JSON.toJSONString(messageContent))
            .status(MessageStatus.PENDING)
            .retryTimes(0)
            .nextRetryTime(new Date())
            .build();

        messageMapper.insert(message);
    }

    // 定时任务：扫描并发送消息
    @Scheduled(fixedRate = 5000)  // 每5秒执行一次
    public void sendMessage() {
        // 查询待发送的消息
        List<LocalMessage> messages = messageMapper.selectPendingMessages(
            new Date(),
            100  // 最多处理100条
        );

        for (LocalMessage message : messages) {
            try {
                // 更新为发送中
                messageMapper.updateStatus(
                    message.getId(),
                    MessageStatus.SENDING,
                    message.getRetryTimes() + 1
                );

                // 发送消息到 MQ
                rocketMQTemplate.syncSend(
                    message.getTopic(),
                    JSON.parseObject(message.getContent())
                );

                // 更新为已发送
                messageMapper.updateStatus(
                    message.getId(),
                    MessageStatus.SENT,
                    message.getRetryTimes()
                );

            } catch (Exception e) {
                log.error("消息发送失败: {}", message.getId(), e);

                // 更新下次重试时间（指数退避）
                Date nextRetryTime = calculateNextRetryTime(message.getRetryTimes());

                messageMapper.updateRetryTime(
                    message.getId(),
                    nextRetryTime,
                    message.getRetryTimes() + 1
                );
            }
        }
    }

    private Date calculateNextRetryTime(int retryTimes) {
        // 指数退避：1min, 2min, 4min, 8min, 16min, 32min
        long delay = (long) Math.pow(2, retryTimes) * 60 * 1000;
        long maxDelay = 32 * 60 * 1000;  // 最大32分钟
        delay = Math.min(delay, maxDelay);

        return new Date(System.currentTimeMillis() + delay);
    }
}

// 业务服务使用本地消息表
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private LocalMessageService messageService;

    @Transactional
    public void createOrder(Order order) {
        // 1. 保存订单
        orderMapper.insert(order);

        // 2. 保存本地消息（同一事务）
        messageService.saveMessage("order-created", order);

        // 事务提交后，定时任务会自动发送消息
    }
}
```

---

## 事务消息

### 事务消息原理

```
┌──────────────────────────────────────────────────────┐
│           RocketMQ 事务消息流程                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  阶段1: 发送半消息                                    │
│  ┌─────────┐     ┌──────────┐                       │
│  │ 生产者  │────→│ RocketMQ │                       │
│  └─────────┘     └──────────┘                       │
│                        │                             │
│                        │ 保存消息（不可见）           │
│                        ▼                             │
│                  ┌──────────┐                        │
│                  │半消息存储 │                        │
│                  └──────────┘                        │
│                                                      │
│  阶段2: 执行本地事务                                  │
│  ┌─────────┐                                        │
│  │ 生产者  │                                        │
│  └────┬────┘                                        │
│       │                                              │
│       │ 执行本地事务（数据库操作）                    │
│       ▼                                              │
│  ┌─────────┐                                        │
│  │ 数据库  │                                        │
│  └─────────┘                                        │
│       │                                              │
│       │ 提交事务结果                                  │
│       ▼                                              │
│   成功 / 失败                                        │
│                                                      │
│  阶段3: 提交/回滚消息                                 │
│  ┌─────────┐     ┌──────────┐                       │
│  │ 生产者  │────→│ RocketMQ │                       │
│  └─────────┘     └──────────┘                       │
│    提交/回滚           │                             │
│                        │ 根据结果：                  │
│                        │ - 成功: 消息可见            │
│                        │ - 失败: 删除消息            │
│                        ▼                             │
│  ┌──────────────────────────────────────┐           │
│  │           消费者消费消息              │           │
│  └──────────────────────────────────────┘           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 事务消息实现

**RocketMQ 事务消息**：

```java
@Service
public class TransactionalMessageService {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    @Autowired
    private OrderMapper orderMapper;

    // 发送事务消息
    public void createOrderWithTransaction(Order order) {
        // 构建消息
        Message<Order> message = MessageBuilder.withPayload(order).build();

        // 发送事务消息
        rocketMQTemplate.sendMessageInTransaction(
            "order-group",           // 事务组名
            "order-created-topic",   // Topic
            message,                 // 消息内容
            null                     // 参数
        );
    }
}

// 事务监听器
@RocketMQTransactionListener(rocketMQTemplateBeanName = "rocketMQTemplate")
public class OrderTransactionListener implements RocketMQLocalTransactionListener {

    @Autowired
    private OrderMapper orderMapper;

    // 执行本地事务
    @Override
    @Transactional
    public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        try {
            Order order = (Order) msg.getPayload();

            // 执行业务逻辑
            orderMapper.insert(order);

            // 扣减库存等操作
            // ...

            // 本地事务成功，提交消息
            return RocketMQLocalTransactionState.COMMIT;

        } catch (Exception e) {
            log.error("本地事务执行失败", e);
            // 本地事务失败，回滚消息
            return RocketMQLocalTransactionState.ROLLBACK;
        }
    }

    // 回查本地事务状态
    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
        try {
            Order order = (Order) msg.getPayload();

            // 查询订单是否存在
            Order dbOrder = orderMapper.selectById(order.getId());

            if (dbOrder != null) {
                // 订单存在，提交消息
                return RocketMQLocalTransactionState.COMMIT;
            } else {
                // 订单不存在，回滚消息
                return RocketMQLocalTransactionState.ROLLBACK;
            }

        } catch (Exception e) {
            log.error("事务状态回查失败", e);
            // 未知状态，稍后会继续回查
            return RocketMQLocalTransactionState.UNKNOWN;
        }
    }
}
```

**消息消费者**：

```java
@Service
@RocketMQMessageListener(
    topic = "order-created-topic",
    consumerGroup = "order-consumer-group"
)
public class OrderMessageConsumer implements RocketMQListener<Order> {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private PaymentService paymentService;

    @Override
    public void onMessage(Order order) {
        try {
            // 处理订单创建事件
            log.info("收到订单创建事件: {}", order.getId());

            // 扣减库存
            inventoryService.deductStock(order.getProductId(), order.getCount());

            // 处理支付
            paymentService.processPayment(order.getUserId(), order.getAmount());

            log.info("订单处理完成: {}", order.getId());

        } catch (Exception e) {
            log.error("订单处理失败: {}", order.getId(), e);
            throw e;  // 抛出异常，MQ 会重试
        }
    }
}
```

---

## ✅ 本章小结

### 学习检查清单

完成本章学习后，请确认你能够：

- [ ] 理解 CAP 定理和 BASE 理论
- [ ] 掌握 2PC/3PC 协议的原理和实现
- [ ] 熟练实现 TCC 事务模式
- [ ] 使用 Saga 模式处理长事务
- [ ] 实现本地消息表保证最终一致性
- [ ] 使用 RocketMQ 事务消息
- [ ] 根据业务场景选择合适的分布式事务方案
- [ ] 处理幂等性、空回滚、悬挂等问题

### 核心要点回顾

1. **CAP/BASE**：强一致性与最终一致性的权衡
2. **2PC/3PC**：强一致性方案，但性能较差
3. **TCC**：一致性较好，但业务侵入性强
4. **Saga**：适合长事务，最终一致性
5. **本地消息表**：实现简单，最终一致性
6. **事务消息**：解耦性好，依赖 MQ

## 📚 延伸阅读

- [第26章：分库分表架构设计 →](./chapter-25)
- [第22章：MongoDB 文档数据库 →](./chapter-21)
- [分布式事务模式](https://microservices.io/patterns/data/distributed-transactions.html)
- [RocketMQ 事务消息文档](https://rocketmq.apache.org/zh/docs/transactionMessage/02inference)

---

**更新时间**：2026年2月 | **版本**：v1.0
