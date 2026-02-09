---
title: Next.js 企业级实战项目3
description: Next.js 15 微服务架构电商平台
---

# ：Next.js 15 完全实战项目 - 微服务架构电商平台

> **项目概述**：本项目是一个基于Next.js 15的微服务架构电商平台，支持多店铺、B2B2C模式、多语言、分布式部署等企业级特性。
>
> **学习目标**：
> - 掌握微服务架构设计与实现
> - 熟练使用Next.js 15构建复杂电商应用
> - 掌握分布式系统、服务间通信
> - 学会高可用、高并发、可扩展架构

---

## 项目介绍

### 项目背景

本微服务架构电商平台是一个完整的企业级B2B2C解决方案，主要功能包括：

- ✅ **多店铺系统**：支持多商户入驻、独立管理
- ✅ **B2B2C模式**：企业采购 + 零售业务
- ✅ **商品管理**：SPU/SKU管理、多规格、库存管理
- ✅ **订单系统**：订单流程、状态机、分布式事务
- ✅ **支付集成**：多种支付方式、分账系统
- ✅ **营销中心**：优惠券、满减、秒杀、拼团
- ✅ **会员体系**：积分、等级、权益
- ✅ **数据分析**：销售分析、用户画像、推荐系统
- ✅ **消息系统**：订单通知、营销消息、站内信
- ✅ **物流跟踪**：物流对接、轨迹查询

### 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| **前端** | Next.js | 15.x |
| **后端** | Node.js + NestJS | latest |
| **数据库** | PostgreSQL + MongoDB + Redis | latest |
| **消息队列** | RabbitMQ / Kafka | latest |
| **搜索引擎** | Elasticsearch | latest |
| **缓存** | Redis Cluster | latest |
| **存储** | MinIO / OSS | latest |
| **服务网格** | Istio | latest |
| **服务发现** | Consul | latest |
| **配置中心** | Apollo / Nacos | latest |
| **链路追踪** | Jaeger | latest |

### 微服务架构

```
ecommerce-platform/
├── services/                         # 微服务
│   ├── user-service/                # 用户服务
│   │   ├── prisma/
│   │   ├── src/
│   │   └── nest-cli.json
│   ├── product-service/             # 商品服务
│   ├── order-service/               # 订单服务
│   ├── payment-service/             # 支付服务
│   ├── shop-service/                # 店铺服务
│   ├── marketing-service/           # 营销服务
│   ├── notification-service/        # 通知服务
│   ├── analytics-service/           # 分析服务
│   └── search-service/              # 搜索服务
├── gateway/                          # API网关
│   ├── pages/                       # Next.js Pages
│   ├── app/                         # Next.js App
│   └── middleware/                  # 网关中间件
├── shared/                           # 共享代码
│   ├── types/                       # 共享类型
│   ├── utils/                       # 共享工具
│   └── components/                 # 共享组件
└── infrastructure/                   # 基础设施
    ├── docker/                      # Docker配置
    ├── kubernetes/                 # K8s配置
    └── terraform/                   # 基础设施即代码
```

---

## 核心功能实现

### 1. API网关

```typescript
// gateway/middleware/api-gateway.ts
import { createNextServer } from '@node/next/next'
import { createProxyMiddleware } from 'http-proxy-middleware'

const services = {
  users: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  products: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
  orders: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
  payments: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
  shops: process.env.SHOP_SERVICE_URL || 'http://localhost:3005',
}

export const config = {
  api: {
    bodyParser: false,
    onResponse: (options) => {
      options.response.headers.delete('x-powered-by')
      return options.response
    },
  },
}

async function registerApis(server) {
  // 注册各微服务的代理
  Object.entries(services).forEach(([name, url]) => {
    const proxy = createProxyMiddleware({
      target: url,
      pathFilter: `/api/${name}/**`,
      pathRewrite: { [`^/api/${name}`]: '' },
      changeOrigin: true,
    })

    server.use(proxy)
  })

  // 服务聚合接口
  server.get('/api/dashboard/summary', async (req, res) => {
    // 聚合多个服务的数据
    const [users, products, orders] = await Promise.all([
      fetch(`${services.users}/api/stats`),
      fetch(`${services.products}/api/stats`),
      fetch(`${services.orders}/api/stats`),
    ])

    const summary = {
      users: await users.json(),
      products: await products.json(),
      orders: await orders.json(),
    }

    res.json(summary)
  })
}
```

### 2. SPU/SKU商品模型

```typescript
// services/product-service/src/entities/sku.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm'

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  shopId: string

  @Column()
  categoryId: string

  @Column({ type: 'json' })
  attributes: {
    brand: string
    model: string
    specs: Record<string, string>
    images: string[]
    description: string
  }

  @OneToMany(() => Sku, 'product')
  skus: Sku[]

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

@Entity()
export class Sku {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  productId: string

  @ManyToOne(() => Product, 'product')
  product: Product

  @Column()
  name: string

  @Column({ type: 'json' })
  specs: {
    color: string
    size: string
    [key: string]: string | number
  }

  @Column('price', { type: 'decimal', precision: 10, scale: 2 })
  price: number

  @Column('original_price', { type: 'decimal', precision: 10, scale: 2 })
  originalPrice: number

  @Column()
  stock: number

  @Column({ default: true })
  isActive: boolean

  @Column()
  barcode: string

  @CreateDateColumn()
  createdAt: Date
}
```

### 3. 分布式订单处理

```typescript
// services/order-service/src/order/order.service.ts
import { Injectable, EventBus } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { CreateOrderDto } from './dto/create-order.dto'
import { Order } from './entities/order.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private eventBus: EventBus
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    // 1. 创建订单（初始状态：PENDING）
    const order = this.orderRepository.create({
      id: uuidv4(),
      orderNo: this.generateOrderNo(),
      userId: createOrderDto.userId,
      shopId: createOrderDto.shopId,
      items: createOrderDto.items,
      totalAmount: createOrderDto.totalAmount,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
    })

    await this.orderRepository.save(order)

    // 2. 发布订单创建事件
    this.eventBus.emit('order.created', {
      orderId: order.id,
      userId: order.userId,
      shopId: order.shopId,
    })

    // 3. 返回订单信息
    return order
  }

  @OnEvent('order.paid')
  async handleOrderPaid(event: { orderId: string; paymentId: string }) {
    // 更新订单状态
    const order = await this.orderRepository.findOne({
      where: { id: event.orderId }
    })

    if (order) {
      order.status = 'PROCESSING'
      order.paymentStatus = 'PAID'
      order.paymentId = event.paymentId
      await this.orderRepository.save(order)

      // 发布订单支付成功事件
      this.eventBus.emit('order.paid.success', {
        orderId: order.id,
        userId: order.userId,
        shopId: order.shopId,
      })
    }
  }

  @OnEvent('order.paid.success')
  async handleOrderPaidSuccess(event: { orderId: string }) {
    // 通知用户
    await this.notifyService.send({
      userId: event.userId,
      type: 'ORDER_PAID',
      orderId: event.orderId,
    })

    // 通知商家
    await this.notifyService.send({
      shopId: event.shopId,
      type: 'NEW_ORDER',
      orderId: event.orderId,
    })

    // 扣减库存
    await this.inventoryService.deductStock(event.orderId)
  }

  private generateOrderNo(): string {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${timestamp}${random}`
  }
}
```

### 4. 分布式事务（Saga模式）

```typescript
// services/order-service/src/saga/order-saga.service.ts
import { Injectable } from '@nestjs/common'
import { Saga, SagaExecution } from 'nestjs-saga'
import { CommandBus } from '@nestjs/cqrs'

@Injectable()
export class OrderSagaService {
  @Saga()
  orderCreation = (events$: any[]) =>
    events$.pipe(
      filter((event) => event.type === 'OrderCreatedEvent'),
      map((event) => event.payload),
      mergeMap((order) =>
        this.executeOrderCreation(order).pipe(
          map((result) => ({ type: 'OrderCreationCompleted', payload: result })),
          catchError((error) => of({ type: 'OrderCreationFailed', payload: error }))
        )
      )
    )

  private executeOrderCreation(order: Order) {
    const steps = [
      // 步骤1：验证库存
      {
        action: 'check-inventory',
        execute: () => this.commandBus.execute(new CheckInventoryCommand(order)),
        compensate: () => this.commandBus.execute(new RollbackInventoryCommand(order)),
      },
      // 步骤2：锁定库存
      {
        action: 'lock-inventory',
        execute: () => this.commandBus.execute(new LockInventoryCommand(order)),
        compensate: () => this.commandBus.execute(new UnlockInventoryCommand(order)),
      },
      // 步骤3：创建支付
      {
        action: 'create-payment',
        execute: () => this.commandBus.execute(new CreatePaymentCommand(order)),
        compensate: () => this.commandBus.execute(new CancelPaymentCommand(order)),
      },
      // 步骤4：确认订单
      {
        action: 'confirm-order',
        execute: () => this.commandBus.execute(new ConfirmOrderCommand(order)),
        compensate: () => this.commandBus.execute(new CancelOrderCommand(order)),
      },
    ]

    return this.sagaExecutor.execute(steps)
  }
}
```

### 5. Redis缓存策略

```typescript
// shared/cache/redis-cache.service.ts
import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class RedisCacheService {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      db: Number(process.env.REDIS_DB || 0),
    })
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value))
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const values = await this.redis.mget(...keys)
    return values.map((v) => (v ? JSON.parse(v) : null))
  }

  async mset(entries: { key: string; value: any }[]): Promise<void> {
    const pipeline = this.redis.pipeline()
    entries.forEach(({ key, value }) => {
      pipeline.set(key, JSON.stringify(value))
    })
    await pipeline.exec()
  }
}

// 使用示例：缓存商品数据
@Get(':id')
async findOne(@Param('id') id: string) {
  const cacheKey = `product:${id}`

  // 1. 先查缓存
  const cached = await this.cacheService.get(cacheKey)
  if (cached) {
    return cached
  }

  // 2. 查数据库
  const product = await this.productRepository.findOne({ where: { id } })

  // 3. 写入缓存
  await this.cacheService.set(cacheKey, product, 3600) // 1小时

  return product
}
```

### 6. RabbitMQ消息队列

```typescript
// shared/messaging/rabbitmq.provider.ts
import * as amqp from 'amqplib'

export class RabbitMQProvider {
  private connection: amqp.Connection
  private channel: amqp.Channel

  async connect() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL)
    this.channel = await this.connection.createChannel()
  }

  async publishMessage(exchange: string, routingKey: string, message: any) {
    await this.channel.assertExchange(exchange, 'topic', { durable: true })

    const msgBuffer = Buffer.from(JSON.stringify(message))
    await this.channel.publish(exchange, routingKey, msgBuffer)
  }

  async consumeMessage(queue: string, handler: (msg: any) => Promise<void>) {
    await this.channel.assertQueue(queue, { durable: true })

    await this.channel.consume(queue, async (msg) => {
      try {
        const content = JSON.parse(msg.content.toString())
        await handler(content)
        this.channel.ack(msg)
      } catch (error) {
        console.error('Error processing message:', error)
        this.channel.nack(msg, false, false)
      }
    })
  }
}

// 使用示例：发布订单事件
export class OrderEventPublisher {
  constructor(private rabbitmq: RabbitMQProvider) {}

  async publishOrderCreated(order: Order) {
    await this.rabbitmq.publishMessage(
      'exchange.orders',
      'order.created',
      {
        orderId: order.id,
        userId: order.userId,
        shopId: order.shopId,
        timestamp: new Date().toISOString(),
      }
    )
  }
}
```

### 7. Elasticsearch商品搜索

```typescript
// services/search-service/src/elasticsearch/elasticsearch.service.ts
import { Injectable } from '@nestjs/common'
import { Client } from '@elastic/elasticsearch'

@Injectable()
export class ElasticsearchService {
  private client: Client

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_NODE,
    })
  }

  async indexProduct(product: any) {
    await this.client.index({
      index: 'products',
      id: product.id,
      document: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category.name,
        shopId: product.shopId,
        shopName: product.shop.name,
        attributes: product.attributes,
        tags: product.tags,
        createdAt: product.createdAt,
      },
    })
  }

  async searchProducts(searchQuery: string, filters: any) {
    const { hits } = await this.client.search({
      index: 'products',
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: searchQuery,
                  fields: ['name^2', 'description', 'tags'],
                  fuzziness: 'AUTO',
                },
              },
              ...this.buildFilters(filters),
            ],
          },
        },
        aggs: {
          'categories': {
            terms: { field: 'category.keyword', size: 10 },
          },
          'shops': {
            terms: { field: 'shopId.keyword', size: 10 },
          },
          'price_ranges': {
            range: {
              field: 'price',
              ranges: [
                { to: 100 },
                { from: 100, to: 500 },
                { from: 500, to: 1000 },
                { from: 1000 },
              ],
            },
          },
        },
      },
    })

    return {
      products: hits.hits.map((hit) => hit._source),
      aggregations: hits.aggregations,
    }
  }

  private buildFilters(filters: any) {
    const must = []

    if (filters.category) {
      must.push({
        term: { 'category.keyword': filters.category },
      })
    }

    if (filters.shopId) {
      must.push({
        term: { 'shopId.keyword': filters.shopId },
      })
    }

    if (filters.priceRange) {
      must.push({
        range: {
          price: {
            gte: filters.priceRange.min,
            lte: filters.priceRange.max,
          },
        },
      })
    }

    return must
  }
}
```

---

## 部署架构

### 1. Docker Compose 开发环境

```yaml
version: '3.8'

services:
  # API Gateway
  gateway:
    build: ./gateway
    ports:
      - "3000:3000"
    environment:
      - USER_SERVICE_URL=http://user-service:3001
      - PRODUCT_SERVICE_URL=http://product-service:3002
      - ORDER_SERVICE_URL=http://order-service:3003
    depends_on:
      - user-service
      - product-service
      - order-service

  # User Service
  user-service:
    build: ./services/user-service
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/user_db
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq

  # Product Service
  product-service:
    build: ./services/product-service
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/product_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Order Service
  order-service:
    build: ./services/order-service
    ports:
      - "3003:3003"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/order_db
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - postgres
      - rabbitmq

  # Search Service
  search-service:
    build: ./services/search-service
    ports:
      - "3006:3006"
    environment:
      - ELASTICSEARCH_NODE=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  # Infrastructure
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=ecommerce
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redisdata:/data

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest

  elasticsearch:
    image: elasticsearch:8.11.0
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - esdata:/usr/share/elasticsearch/data

volumes:
  pgdata:
  redisdata:
  esdata:
```

### 2. Kubernetes 生产环境

```yaml
# infrastructure/k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ecommerce

---
# infrastructure/k8s/user-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: ecommerce
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: ecommerce/user-service:latest
        ports:
          - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: ecommerce
spec:
  selector:
    app: user-service
  ports:
    - port: 3001
    targetPort: 3001
  type: ClusterIP

---
# HPA配置
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
  namespace: ecommerce
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 项目总结

本项目涵盖了Next.js 15微服务架构电商开发的核心技能：

✅ **技术栈**：Next.js 15 + NestJS + 微服务 + Docker + K8s
✅ **核心功能**：多店铺、B2B2C、SPU/SKU、分布式事务
✅ **企业特性**：高可用、高并发、可扩展、服务治理
✅ **最佳实践**：微服务拆分、服务通信、数据一致性、性能优化

通过这个项目，你将掌握：
- 微服务架构设计与实现
- Next.js作为API网关的使用
- 分布式事务处理（Saga模式）
- RabbitMQ消息队列集成
- Elasticsearch搜索引擎
- Redis缓存策略
- Docker容器化部署
- Kubernetes生产环境部署

---

## 下一步学习

- [Next.js 15新特性](/guide/nextjs/chapter-107)
- [全栈开发实战](/guide/nextjs/chapter-108)
- [部署与运维](/guide/nextjs/chapter-109)
- [AI内容生成平台](/guide/nextjs/chapter-111)
- [企业级CMS系统](/guide/nextjs/chapter-112)
