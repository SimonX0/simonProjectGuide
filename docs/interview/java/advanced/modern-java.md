---
title: 现代 Java 技术面试题
---

# 现代 Java 技术面试题

## Spring AI

### 什么是 Spring AI？

**Spring AI** = Spring 官方 AI 工程框架，类似 LangChain 的 Java 实现

**核心特点**：

- 🤖 **AI 模型集成**：支持 OpenAI、Azure OpenAI、HuggingFace
- 🔄 **RAG 支持**：开箱即用的检索增强生成
- 📊 **向量数据库**：集成多种向量存储
- 🎯 **函数调用**：AI 与代码无缝集成
- 🔧 **Spring 原生**：与 Spring Boot 无缝集成

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
    <version>1.0.0-M4</version>
</dependency>
```

```yaml
# application.yml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4o
          temperature: 0.7
```

### Q1: Spring AI 的核心组件有哪些？

**1. Chat Client（聊天客户端）**：

```java
@RestController
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @PostMapping("/chat")
    public String chat(@RequestBody String message) {
        return chatClient.prompt()
            .user(message)
            .call()
            .content();
    }
}
```

**2. Prompt Template（提示词模板）**：

```java
@Service
public class TranslationService {

    private final ChatClient chatClient;

    public String translate(String text, String targetLanguage) {
        return chatClient.prompt()
            .user(u -> u.text("""
                翻译以下文本到{language}：

                {text}

                要求：
                1. 保持原文语气
                2. 使用自然表达
                3. 注意专业术语
                """)
                .param("language", targetLanguage)
                .param("text", text))
            .call()
            .content();
    }
}
```

**3. Function Calling（函数调用）**：

```java
// 定义函数
@Component
public class WeatherService {

    @JsonProperty("get_current_weather")
    public String getCurrentWeather(
        @JsonProperty("location") String location,
        @JsonProperty("unit") String unit
    ) {
        // 调用天气 API
        return String.format("%s 的天气是 25°C", location);
    }
}

// 使用函数调用
@Service
public class WeatherChatService {

    private final ChatClient chatClient;

    public String askWeather(String question) {
        return chatClient.prompt()
            .user(question)
            .functions("get_current_weather")  // 注册函数
            .call()
            .content();
    }
}
```

**4. Vector Store（向量存储）**：

```java
@Configuration
public class VectorStoreConfig {

    @Bean
    public VectorStore vectorStore(
        EmbeddingModel embeddingModel,
        JdbcTemplate jdbcTemplate
    ) {
        return new PgVectorStore(
            jdbcTemplate,
            embeddingModel,
            new PgVectorStoreConfig(
                "documents",
                1536  // 维度
            )
        );
    }
}

// 使用向量存储
@Service
public class DocumentSearchService {

    private final VectorStore vectorStore;

    public List<Document> search(String query) {
        // 搜索相似文档
        return vectorStore.similaritySearch(
            SearchRequest.query(query).withTopK(5)
        );
    }
}
```

### Q2: 如何实现 RAG 系统？

```java
@Service
public class RagService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    public String query(String question) {
        // 1. 检索相关文档
        List<Document> documents = vectorStore.similaritySearch(
            SearchRequest.query(question).withTopK(3)
        );

        // 2. 构建上下文
        String context = documents.stream()
            .map(Document::getContent)
            .collect(Collectors.joining("\n\n"));

        // 3. 生成回答
        return chatClient.prompt()
            .user(u -> u.text("""
                基于以下上下文回答问题：

                {context}

                问题：{question}

                如果上下文中没有相关信息，请明确说明。
                """)
                .param("context", context)
                .param("question", question))
            .call()
            .content();
    }
}
```

### Q3: Spring AI 与 LangChain 对比

| 特性 | Spring AI | LangChain4j |
|------|-----------|-------------|
| **集成** | Spring 原生 | 独立框架 |
| **学习曲线** | 低（Spring 开发者友好） | 中 |
| **生态系统** | Spring 生态 | Java 通用 |
| **AI 模型** | OpenAI、Azure | 多种模型 |
| **文档质量** | 完善 | 完善 |

**选择建议**：

```java
// 使用 Spring AI 的场景：
// 1. 项目已经使用 Spring Boot
// 2. 需要与 Spring Security、Data 等集成
// 3. 团队熟悉 Spring 生态

// 使用 LangChain4j 的场景：
// 1. 非 Spring 项目
// 2. 需要更多灵活性
// 3. 需要支持更多 AI 模型
```

### Q4: Spring AI 的流式输出

```java
@RestController
public class StreamController {

    private final ChatClient chatClient;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChat(@RequestParam String message) {
        return chatClient.prompt()
            .user(message)
            .stream()
            .content();  // 返回 Flux<String>
    }
}

// 前端使用
// const eventSource = new EventSource('/stream?message=你好');
// eventSource.onmessage = (event) => {
//     console.log(event.data);
// };
```

### Q5: Spring AI 记忆管理

```java
@Service
public class ChatMemoryService {

    private final ChatClient chatClient;
    private final ChatMemory chatMemory;

    public String chat(String sessionId, String message) {
        return chatClient.prompt()
            .user(message)
            .advisors(a -> a
                .param(CHAT_MEMORY_SESSION_ID_KEY, sessionId)
                .param(CHAT_MEMORY_RETRIEVE_SIZE_KEY, 100)
            )
            .call()
            .content();
    }
}

// 配置内存存储
@Bean
public ChatMemory chatMemory() {
    return new InMemoryChatMemory();
}

// 使用 Redis 持久化
@Bean
public ChatMemory redisChatMemory(RedisTemplate<String, Object> redisTemplate) {
    return new RedisChatMemory(redisTemplate);
}
```

---

## GraalVM

### 什么是 GraalVM？

**GraalVM** = 高性能 JDK，支持多种语言和原生镜像

**核心特点**：

- ⚡ **原生镜像**：编译成原生可执行文件
- 🚀 **启动速度**：毫秒级启动
- 💾 **内存占用**：极低的内存占用
- 🔧 **多语言**：支持 Java、JavaScript、Python、Ruby 等
- 🛠️ **即时编译**：优秀的 JIT 性能

```bash
# 安装 GraalVM
sdk install java 21-graal

# 查看版本
java -version
# openjdk version "21.0.1" 2023-10-17
# OpenJDK Runtime Environment GraalVM CE 21.0.1+12.1

# 编译原生镜像
native-image -jar application.jar
```

### Q6: GraalVM 和 HotSpot JVM 的区别？

| 特性 | HotSpot JVM | GraalVM |
|------|-------------|---------|
| **启动时间** | 秒级 | 毫秒级 |
| **内存占用** | 数百 MB | 数十 MB |
| **峰值性能** | 高 | 高 |
| **预热时间** | 需要预热 | 无需预热 |
| **编译时间** | 快 | 慢（原生镜像） |
| **兼容性** | 完全 | 部分限制 |

**性能对比**：

```bash
# HotSpot JVM
$ java -jar app.jar
Started in 3.2s
Memory: 256MB

# GraalVM Native Image
$ ./app
Started in 0.05s
Memory: 32MB
```

### Q7: 如何创建原生镜像？

**1. 添加依赖**：

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.graalvm.polyglot</groupId>
    <artifactId>polyglot</artifactId>
    <version>23.1.0</version>
</dependency>
```

**2. 配置插件**：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.graalvm.buildtools</groupId>
            <artifactId>native-maven-plugin</artifactId>
            <version>0.10.0</version>
            <extensions>true</extensions>
            <configuration>
                <imageName>my-app</imageName>
                <mainClass>com.example.Application</mainClass>
                <buildArgs>
                    <buildArg>--no-fallback</buildArg>
                    <buildArg>-H:+ReportExceptionStackTraces</buildArg>
                </buildArgs>
            </configuration>
            <executions>
                <execution>
                    <id>build-native</id>
                    <goals>
                        <goal>compile-no-fork</goal>
                    </goals>
                    <phase>package</phase>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

**3. 构建原生镜像**：

```bash
# 构建
mvn -Pnative native:compile

# 运行
./target/my-app
```

### Q8: GraalVM 反射配置

**问题**：GraalVM 原生镜像默认不支持反射

**解决方案**：添加反射配置

```java
// 方式 1：使用注解
@RegisterReflectionForBinding({
    User.class,
    Order.class
})
public class Application {
    // ...
}

// 方式 2：配置文件
// src/main/resources/META-INF/native-image/reflect-config.json
[
  {
    "name": "com.example.User",
    "allDeclaredConstructors": true,
    "allPublicConstructors": true,
    "allDeclaredMethods": true,
    "allPublicMethods": true,
    "allDeclaredFields": true,
    "allPublicFields": true
  }
]
```

**自动生成配置**：

```bash
# 使用 Agent 自动生成配置
java -agentlib:native-image-agent=config-output-dir=src/main/resources/META-INF/native-image \
     -jar application.jar

# 运行应用测试所有功能
# Agent 会自动生成必要的配置文件
```

### Q9: GraalVM 在 Spring Boot 中的应用

**Spring Native 项目**：

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.experimental</groupId>
    <artifactId>spring-native</artifactId>
    <version>0.12.0</version>
</dependency>

<plugin>
    <groupId>org.springframework.experimental</groupId>
    <artifactId>spring-aot-maven-plugin</artifactId>
    <version>0.12.0</version>
    <executions>
        <execution>
            <id>test-generate</id>
            <goals>
                <goal>test-generate</goal>
            </goals>
        </execution>
        <execution>
            <id>generate</id>
            <goals>
                <goal>generate</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

**构建 Spring Boot 原生应用**：

```bash
# 构建
mvn -Pnative native:compile

# 运行
./target/demo-application

# 性能对比
# JVM: 3.2s 启动, 256MB 内存
# Native: 0.08s 启动, 48MB 内存
```

### Q10: GraalVM 多语言支持

**在 Java 中执行 JavaScript**：

```java
import org.graalvm.polyglot.*;

public class PolyglotExample {
    public static void main(String[] args) {
        try (Context context = Context.create("js")) {
            // 执行 JavaScript 代码
            Value result = context.eval("js", "10 + 20");
            System.out.println(result.asInt());  // 30

            // 调用 JavaScript 函数
            context.eval("js", """
                function greet(name) {
                    return 'Hello, ' + name + '!';
                }
            """);

            Value function = context.getBindings("js").getMember("greet");
            Value greeting = function.execute("GraalVM");
            System.out.println(greeting.asString());  // Hello, GraalVM!
        }
    }
}
```

**Python 互操作**：

```java
import org.graalvm.polyglot.*;

public class PythonExample {
    public static void main(String[] args) {
        try (Context context = Context.newBuilder("python")
                .allowAllAccess(true)
                .build()) {

            // 调用 Python 代码
            context.eval("python", """
                def calculate_sum(numbers):
                    return sum(numbers)
            """);

            Value function = context.getBindings("python")
                .getMember("calculate_sum");

            int[] numbers = {1, 2, 3, 4, 5};
            Value result = function.execute((Object) numbers);

            System.out.println(result.asInt());  // 15
        }
    }
}
```

### Q11: GraalVM 性能优化

**1. 编译选项优化**：

```bash
# 基础优化
native-image -jar app.jar \
    --no-fallback \
    -O2

# 激进优化
native-image -jar app.jar \
    --no-fallback \
    -O3 \
    --inline-all

# 减小镜像大小
native-image -jar app.jar \
    --no-fallback \
    --gc=serial \
    --static
```

**2. 内存优化**：

```bash
# 使用串行 GC（更小）
native-image -jar app.jar --gc=serial

# 使用 G1 GC（更好性能）
native-image -jar app.jar --gc=g1

# 调整堆大小
./app -Xmx64m -Xms32m
```

**3. 启动优化**：

```bash
# 延迟初始化
native-image -jar app.jar \
    --delay-class-initialization-at-runtime \
    -H:-RuntimeCompilation
```

### Q12: GraalVM 的常见问题

**问题 1：反射不工作**

```java
// 解决方案 1：使用 @RegisterForReflection
@RegisterForReflection
public class MyClass {
    // ...
}

// 解决方案 2：添加配置
// reflect-config.json
```

**问题 2：资源文件找不到**

```bash
# 解决方案：显式包含资源
native-image -jar app.jar \
    -H:IncludeResources=.*\.properties$ \
    -H:IncludeResources=application.*\.yml$
```

**问题 3：JNI 库不兼容**

```bash
# 解决方案：配置 JNI
native-image -jar app.jar \
    --report-unsupported-elements-at-runtime \
    --allow-incomplete-classpath
```

### Q13: 实际项目中的使用

**场景 1：微服务部署**：

```yaml
# Dockerfile (使用原生镜像)
FROM ubuntu:22.04

COPY target/my-app /app/my-app
EXPOSE 8080

CMD ["/app/my-app"]

# 极小的镜像大小（~50MB）
```

**场景 2：Serverless 函数**：

```java
// AWS Lambda Handler
public class LambdaHandler implements RequestHandler<String, String> {

    @Override
    public String handleRequest(String input, Context context) {
        // 原生镜像启动快，适合 Serverless
        return "Hello, " + input + "!";
    }
}

// 构建函数
// mvn -Pnative function:deploy
```

**场景 3：命令行工具**：

```java
// CLI 应用
public class CliApp {
    public static void main(String[] args) {
        if (args.length > 0) {
            System.out.println("Processing: " + args[0]);
        }
    }
}

// 构建
// mvn -Pnative package

// 使用
// ./cli-app input.txt
```

---

## 本章小结

### Spring AI 核心要点

| 特性 | 关键点 |
|------|--------|
| **Chat Client** | 流畅 API，易于使用 |
| **函数调用** | AI 与代码无缝集成 |
| **RAG 支持** | 开箱即用的检索增强 |
| **向量存储** | 多种向量数据库支持 |
| **Spring 原生** | 与 Spring Boot 无缝集成 |

### GraalVM 核心要点

| 特性 | 关键点 |
|------|--------|
| **原生镜像** | 毫秒级启动 |
| **内存占用** | 极低的内存使用 |
| **多语言** | 支持多种编程语言 |
| **性能** | 接近 C++ 的性能 |
| **Spring Native** | Spring Boot 原生支持 |

### 适用场景

✅ **Spring AI 适合**：
- 需要集成 AI 的 Spring Boot 应用
- 企业级 RAG 系统
- AI 辅助的业务逻辑

✅ **GraalVM 适合**：
- 微服务（快速启动）
- Serverless 函数
- CLI 工具
- 低内存环境

❌ **暂时不推荐**：
- 依赖大量反射的遗留代码（GraalVM）
- 需要动态类加载的场景

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
