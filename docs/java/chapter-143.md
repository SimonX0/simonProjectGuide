# GraalVM原生镜像

> **学习目标**:掌握GraalVM Native Image技术,构建高性能微服务
> **核心内容**:Native Image原理、AOT编译、Spring Boot集成、性能优化
> **预计时间**:12小时

## GraalVM概述

### 什么是GraalVM

```java
/**
 * GraalVM介绍
 */
public class GraalVMIntroduction {

    /*
    GraalVM是一个高性能的JDK发行版,由Oracle实验室开发。

    核心特性:
    1. Graal编译器: 高性能即时编译器(JIT)
    2. Native Image: 提前编译(AOT)技术
    3. Polyglot: 多语言互操作
    4. Truffle: 语言实现框架

    Native Image优势:
    1. 秒级启动(相比JVM的秒级到分钟级)
    2. 低内存占用(相比JVM的几百MB降到几十MB)
    3. 即时峰值性能(无需预热)
    4. 可打包为单一可执行文件

    适用场景:
    1. Serverless函数
    2. 微服务
    3. Kubernetes容器
    4. 资源受限环境
    */

    public static void main(String[] args) {
        System.out.println("=== GraalVM vs 传统JVM ===\n");

        System.out.println("传统JVM:");
        System.out.println("  启动时间: 秒级到分钟级");
        System.out.println("  内存占用: 几百MB到几GB");
        System.out.println("  首次执行: 需要预热(C2编译优化)");
        System.out.println("  部署方式: JAR + JRE\n");

        System.out.println("GraalVM Native Image:");
        System.out.println("  启动时间: 毫秒级");
        System.out.println("  内存占用: 几十MB");
        System.out.println("  首次执行: 即时峰值性能");
        System.out.println("  部署方式: 单一可执行文件\n");
    }
}
```

### GraalVM架构

```mermaid
graph TB
    subgraph "传统JVM"
        Java1[Java源码]
        Javac1[Javac编译]
        Class1[字节码.class]
        JVM1[JVM运行时]
        JIT1[JIT编译器]
        Machine1[机器码]

        Java1 --> Javac1
        Javac1 --> Class1
        Class1 --> JVM1
        JVM1 --> JIT1
        JIT1 --> Machine1
    end

    subgraph "GraalVM Native Image"
        Java2[Java源码]
        Javac2[Javac编译]
        Class2[字节码.class]
        Native2[Native Image构建]
        Static1[静态分析]
        Closed1[闭包分析]
        Compile1[AOT编译]
        Executable[原生可执行文件]

        Java2 --> Javac2
        Javac2 --> Class2
        Class2 --> Native2
        Native2 --> Static1
        Static1 --> Closed1
        Closed1 --> Compile1
        Compile1 --> Executable

        style Executable fill:#99ff99
    end
```

## 环境准备

### 安装GraalVM

```bash
# SDKMAN安装(Linux/Mac)
sdk install java 21-graal
sdk use java 21-graal

# 手动安装
wget https://github.com/graalvm/graalvm-ce-builds/releases/download/vm-21.30.09/graalvm-ce-java17-linux-amd64-21.30.09.tar.gz
tar -xzf graalvm-ce-java17-linux-amd64-21.30.09.tar.gz
export PATH=$PATH:/path/to/graalvm/bin

# 验证安装
java -version
# 输出应包含: GraalVM Runtime Environment

# 安装native-image工具
gu install native-image
```

### Maven配置

```xml
<!-- pom.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>graalvm-demo</artifactId>
    <version>1.0.0</version>

    <properties>
        <java.version>21</java.version>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>

    <dependencies>
        <!-- Spring Boot -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- GraalVM Native Support -->
        <dependency>
            <groupId>org.graalvm.polyglot</groupId>
            <artifactId>polyglot</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Spring Boot Maven Plugin -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>

            <!-- Native Build Tools Plugin -->
            <plugin>
                <groupId>org.graalvm.buildtools</groupId>
                <artifactId>native-maven-plugin</artifactId>
                <version>0.9.28</version>
                <extensions>true</extensions>
                <configuration>
                    <imageName>demo-app</imageName>
                    <mainClass>com.example.DemoApplication</mainClass>
                    <buildArgs>
                        <buildArg>--no-fallback</buildArg>
                        <buildArg>--initialize-at-build-time=org.slf4j</buildArg>
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
</project>
```

## Native Image构建

### 基础构建命令

```bash
# 方式1: 使用Maven插件构建
mvn -Pnative native:compile

# 方式2: 使用Spring Boot插件构建
mvn -Pnative spring-boot:build-image

# 方式3: 直接使用native-image命令
mvn clean package
native-image -jar target/demo-app.jar

# 构建参数说明
# --no-fallback: 禁用回退到JVM模式
# --initialize-at-build-time: 在构建时初始化类
# --report-unsupported-elements-at-runtime: 运行时报告不支持的元素
# --allow-incomplete-classpath: 允许不完整的类路径
```

### Spring Boot原生应用

```java
package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Spring Boot Native Image应用
 */
@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @RestController
    class HelloController {

        @GetMapping("/")
        public String hello() {
            return "Hello from GraalVM Native Image!";
        }

        @GetMapping("/info")
        public ApplicationInfo info() {
            ApplicationInfo info = new ApplicationInfo();
            info.setName("GraalVM Demo");
            info.setVersion("1.0.0");
            info.setJavaVersion(System.getProperty("java.version"));
            info.setOsName(System.getProperty("os.name"));
            return info;
        }
    }

    class ApplicationInfo {
        private String name;
        private String version;
        private String javaVersion;
        private String osName;

        // getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
        public String getJavaVersion() { return javaVersion; }
        public void setJavaJavaVersion(String javaVersion) { this.javaVersion = javaVersion; }
        public String getOsName() { return osName; }
        public void setOsName(String osName) { this.osName = osName; }
    }
}
```

## 反射和资源配置

### 反射配置

```json
// src/main/resources/META-INF/native-image/reflect-config.json
{
  "reflectConfig": [
    {
      "name": "com.example.DemoApplication$HelloController",
      "allDeclaredMethods": true
    },
    {
      "name": "com.example.DemoApplication$ApplicationInfo",
      "allDeclaredFields": true,
      "allDeclaredMethods": true
    },
    {
      "name": "java.util.ArrayList",
      "allDeclaredMethods": true
    }
  ]
}
```

### 资源配置

```json
// src/main/resources/META-INF/native-image/resource-config.json
{
  "resources": {
    "includes": [
      {
        "pattern": "application\\.yml"
      },
      {
        "pattern": "application-.*\\.yml"
      },
      {
        "pattern": "logback\\.xml"
      }
    ]
  }
}
```

### JNI配置

```json
// src/main/resources/META-INF/native-image/jni-config.json
{
  "jniConfig": [
    {
      "name": "java.lang.Object",
      "allDeclaredMethods": true
    }
  ]
}
```

### 自动配置生成

```java
package com.example.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.nativex.hint.NativeHint;
import org.springframework.nativex.hint.TypeHint;

/**
 * GraalVM Native配置
 */
@Configuration
@TypeHint(types = {
    com.example.model.User.class,
    com.example.model.Order.class
})
@NativeHint(
    types = {
        ObjectMapper.class
    }
)
public class GraalVMConfig {

    /**
     * JSON序列化配置
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
```

## 性能对比测试

### 启动时间对比

```java
package com.example.benchmark;

import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.time.Duration;
import java.time.Instant;

/**
 * JVM vs Native Image性能对比
 */
public class PerformanceComparison {

    public static void main(String[] args) {
        System.out.println("=== 启动时间对比 ===\n");

        // JVM模式
        System.out.println("JVM模式启动:");
        Instant jvmStart = Instant.now();
        ConfigurableApplicationContext jvmContext =
                SpringApplication.run(DemoApplication.class, args);
        long jvmTime = Duration.between(jvmStart, Instant.now()).toMillis();
        System.out.println("JVM启动耗时: " + jvmTime + "ms");

        jvmContext.close();

        // Native Image模式(需要单独构建)
        System.out.println("\nNative Image模式启动:");
        System.out.println("启动耗时: 约10-50ms(实际运行可执行文件测试)");
    }

    /*
    典型对比结果(Spring Boot 3.2应用):

    模式              启动时间    内存占用    首次请求响应
    ================================================
    JVM(传统)         2-5秒      200-500MB   慢(需预热)
    JVM(优化)         1-2秒      100-200MB   中
    Native Image      10-50ms    30-80MB     快(即时峰值)

    结论:
    - Native Image启动快100倍
    - Native Image内存占用少5-10倍
    - Native Image无需预热,首次请求即快
    */
}
```

### 内存占用对比

```bash
# 测试脚本


JVM模式
java -jar target/demo-app.jar &
JVM_PID=$!
sleep 5
JVM_MEMORY=$(ps -o rss= -p $JVM_PID)
echo "JVM内存占用: $((JVM_MEMORY/1024))MB"
kill $JVM_PID


Native Image模式
./target/demo-app &
NATIVE_PID=$!
sleep 5
NATIVE_MEMORY=$(ps -o rss= -p $NATIVE_PID)
echo "Native Image内存占用: $((NATIVE_MEMORY/1024))MB"
kill $NATIVE_PID

# 预期结果:
# JVM内存占用: 150-300MB
# Native Image内存占用: 30-80MB
```

## 实战案例:秒级启动的微服务

### 完整示例:用户服务

```java
package com.example.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.annotation.Id;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户服务(Native Image)
 */
@SpringBootApplication
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    // ==================== 实体 ====================
    @Entity
    class User {
        @Id
        private Long id;
        private String username;
        private String email;

        // getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    // ==================== Repository ====================
    interface UserRepository extends ListCrudRepository<User, Long> {
        List<User> findByUsernameContaining(String username);
    }

    // ==================== Controller ====================
    @RestController
    @RequestMapping("/api/users")
    class UserController {

        private final UserRepository userRepository;

        public UserController(UserRepository userRepository) {
            this.userRepository = userRepository;
        }

        @GetMapping
        public List<User> listUsers() {
            return userRepository.findAll();
        }

        @GetMapping("/{id}")
        public User getUser(@PathVariable Long id) {
            return userRepository.findById(id).orElse(null);
        }

        @PostMapping
        public User createUser(@RequestBody User user) {
            return userRepository.save(user);
        }

        @GetMapping("/search")
        public List<User> searchUsers(@RequestParam String keyword) {
            return userRepository.findByUsernameContaining(keyword);
        }
    }
}
```

### application.yml配置

```yaml
# application.yml
spring:
  application:
    name: user-service

  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password:

  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: false

server:
  port: 8080
  compression:
    enabled: true

# GraalVM Native配置
graalvm:
  native:
    enabled: true
```

### Docker部署

```dockerfile
# Dockerfile
FROM ghcr.io/graalvm/native-image-community:21
WORKDIR /app

# 构建原生镜像
COPY . .
RUN mvn -Pnative native:compile

# 运行
EXPOSE 8080
CMD ["./target/user-service"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  user-service:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    restart: unless-stopped
```

## 构建优化和Troubleshooting

### 构建优化

```bash

增量构建
mvn -Pnative native:compile -DskipTests


并行构建
mvn -Pnative native:compile -T 4


内存优化
export GRAALVM_HOME=/path/to/graalvm
native-image -J-Xmx8G -jar target/app.jar


构建时间优化
mvn -Pnative native:compile \
  -Dspring-boot.run.jvmArguments="-Dspring.native.remove-unused-autoconfig=true"


减小镜像大小
native-image \
  --no-fallback \
  --enable-https \
  --static \
  --libc=musl \
  -jar target/app.jar
```

### 常见问题解决

```java
package com.example.troubleshooting;

/**
 * Native Image常见问题
 */
public class NativeImageIssues {

    /*
    问题1: ClassNotFoundException
    ====================================================
    原因: 类路径不完整或反射未配置

    解决方案:
    1. 使用Tracing Agent自动生成配置
       java -agentlib:native-image-agent=config-output-dir=src/main/resources/META-INF/native-image/ \
            -jar target/app.jar

    2. 手动配置reflect-config.json
    3. 添加所有依赖到classpath
    */

    /*
    问题2: NoSuchMethodException
    ====================================================
    原因: 反射方法未配置

    解决方案:
    {
      "name": "com.example.MyClass",
      "methods": [{"name": "myMethod"}]
    }
    */

    /*
    问题3: 资源文件未找到
    ====================================================
    原因: 资源文件未包含在Native Image中

    解决方案:
    配置resource-config.json
    {
      "resources": {
        "includes": [{"pattern": ".*\\.xml"}]
      }
    }
    */

    /*
    问题4: JNI调用失败
    ====================================================
    原因: JNI配置不正确

    解决方案:
    1. 配置jni-config.json
    2. 确保native库可用
    3. 使用--report-unsupported-elements-at-runtime排查
    */

    /*
    问题5: 类初始化时机错误
    ====================================================
    原因: 类初始化时机不当

    解决方案:
    native-image \
      --initialize-at-build-time=com.example.MyClass \
      -jar app.jar
    */

    /*
    问题6: 构建内存不足
    ====================================================
    原因: Native Image构建需要大量内存

    解决方案:
    native-image -J-Xmx8G -jar app.jar
    */

    /*
    问题7: 构建时间过长
    ====================================================
    原因: 首次构建需要编译所有代码

    解决方案:
    1. 使用构建缓存
    2. 并行构建
    3. 跳过不必要的测试
    */
}
```

## 与传统JVM性能对比

### 综合性能测试

```java
package com.example.performance;

import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;

/**
 * JVM vs Native Image综合对比
 */
public class ComprehensiveComparison {

    private static final RestTemplate restTemplate = new RestTemplate();

    public static void main(String[] args) {
        System.out.println("=== JVM vs Native Image 综合对比 ===\n");

        // 1. 启动时间测试
        testStartupTime();

        // 2. 内存占用测试
        testMemoryUsage();

        // 3. 吞吐量测试
        testThroughput();

        // 4. 响应时间测试
        testResponseTime();
    }

    /**
     * 启动时间测试
     */
    private static void testStartupTime() {
        System.out.println("1. 启动时间对比:");
        System.out.println("   JVM模式: 2-5秒");
        System.out.println("   Native Image: 10-50ms");
        System.out.println("   提升: 100-500倍\n");
    }

    /**
     * 内存占用测试
     */
    private static void testMemoryUsage() {
        System.out.println("2. 内存占用对比:");
        System.out.println("   JVM模式: 200-500MB");
        System.out.println("   Native Image: 30-80MB");
        System.out.println("   节省: 80-90%\n");
    }

    /**
     * 吞吐量测试
     */
    private static void testThroughput() {
        System.out.println("3. 吞吐量对比(简单请求):");
        System.out.println("   JVM模式(预热后): ~50k req/s");
        System.out.println("   Native Image: ~45k req/s");
        System.out.println("   差异: 相近(Native略低10%)\n");
    }

    /**
     * 响应时间测试
     */
    private static void testResponseTime() {
        System.out.println("4. 响应时间对比:");
        System.out.println("   JVM模式(首次): 100-500ms(需预热)");
        System.out.println("   JVM模式(预热后): 1-5ms");
        System.out.println("   Native Image(首次): 1-5ms(即时峰值)");
        System.out.println("   Native Image(稳定): 1-5ms");
        System.out.println("   结论: Native Image无预热需求\n");
    }

    /*
    综合评估:
    ========

    Native Image优势:
    ✅ 启动极快(适合Serverless)
    ✅ 内存占用低(适合容器化)
    ✅ 即时峰值性能(无预热)
    ✅ 单一可执行文件(部署简单)

    Native Image劣势:
    ❌ 构建时间长(几分钟到十几分钟)
    ❌ 不支持部分Java特性
    ❌ 调试困难
    ❌ 峰值性能略低(10%以内)

    适用场景:
    ✅ Serverless函数(启动快是关键)
    ✅ 微服务(内存成本低)
    ✅ Kubernetes(快速扩缩容)
    ✅ CLI工具(启动快)

    不适用场景:
    ❌ 长期运行的服务(JVM预热后性能更好)
    ❌ 大量使用反射的代码
    ❌ 动态类加载
    ❌ 需要快速迭代的开发阶段
    */
}
```

## 最佳实践

### Native Image最佳实践

```java
package com.example.bestpractice;

import org.springframework.nativex.hint.NativeHint;
import org.springframework.nativex.hint.TypeHint;

/**
 * GraalVM Native Image最佳实践
 */
@NativeHint(
    types = {
        // 显式声明需要反射的类
        com.example.model.User.class,
        com.example.model.Order.class
    }
)
@TypeHint(
    types = {
        // 类型提示
        com.example.service.UserService.class
    }
)
public class NativeImageBestPractices {

    /*
    最佳实践总结
    =============

    1. 开发流程
    ===========
    ✅ 开发阶段使用JVM模式(快速迭代)
    ✅ 生产环境使用Native Image(高性能)
    ✅ CI/CD流程自动构建Native Image
    ✅ 使用Tracing Agent自动生成配置

    2. 代码规范
    ===========
    ✅ 避免反射,或显式配置反射
    ✅ 避免动态类加载
    ✅ 避免JNI调用
    ✅ 使用依赖注入而非反射

    3. 资源管理
    ===========
    ✅ 显式声明需要的资源文件
    ✅ 使用src/main/resources/META-INF/native-image/
    ✅ 验证所有资源都被包含

    4. 配置管理
    ===========
    ✅ 使用反射配置文件
    ✅ 使用资源配置文件
    ✅ 使用JNI配置文件
    ✅ 使用Tracing Agent自动生成

    5. 构建优化
    ===========
    ✅ 使用增量构建
    ✅ 并行构建加速
    ✅ 调整JVM内存参数
    ✅ 跳过不必要的测试

    6. 测试策略
    ===========
    ✅ JVM模式和Native Image都要测试
    ✅ 关注启动时间和内存占用
    ✅ 性能测试验证预期收益
    */

    /**
     * 最佳实践1: 使用Tracing Agent
     */
    public static void bestPractice1() {
        /*
        步骤:
        1. JVM模式运行应用并覆盖所有代码路径
           java -agentlib:native-image-agent=config-output-dir=native-configs \
                -jar app.jar

        2. 执行完整的功能测试

        3. 复制生成的配置到项目
           cp -r native-configs/* src/main/resources/META-INF/native-image/

        4. 构建Native Image
           mvn -Pnative native:compile
        */
    }

    /**
     * 最佳实践2: 避免反射
     */
    public static void bestPractice2() {
        // ❌ 使用反射
        try {
            Class<?> clazz = Class.forName("com.example.User");
            Object obj = clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            e.printStackTrace();
        }

        // ✅ 直接使用
        User user = new User();
    }

    /**
     * 最佳实践3: 显式配置
     */
    @NativeHint(types = User.class)
    public static class UserService {
        // Native Image会识别这个提示
        public User createUser() {
            return new User();
        }
    }

    /**
     * 最佳实践4: 资源管理
     */
    public static void bestPractice4() {
        // 确保资源文件在resources目录
        // 在resource-config.json中配置

        /*
        {
          "resources": {
            "includes": [
              {"pattern": "application.*\\.yml"},
              {"pattern": "static/.*"},
              {"pattern": "templates/.*"}
            ]
          }
        }
        */
    }
}
```

## 本章小结

### 知识总结

✅ **GraalVM原理**: AOT提前编译,静态分析
✅ **环境准备**: GraalVM安装、native-image工具
✅ **Spring Boot集成**: Native Image插件、配置优化
✅ **性能优势**: 启动快100倍、内存少80-90%
✅ **最佳实践**: Tracing Agent、避免反射、显式配置

### 核心要点

1. **Native Image优势**
   - 启动时间: 毫秒级
   - 内存占用: 几十MB
   - 即时峰值性能

2. **适用场景**
   - Serverless函数
   - 微服务
   - Kubernetes容器
   - 资源受限环境

3. **开发流程**
   - 开发阶段使用JVM
   - 生产环境使用Native Image
   - 使用Tracing Agent自动配置

4. **注意事项**
   - 构建时间长
   - 不支持部分Java特性
   - 需要显式配置反射和资源

### 实践练习

**练习1: 构建Native Image应用**
- 创建Spring Boot应用
- 配置Native Image构建
- 对比JVM和Native Image性能

**练习2: Tracing Agent使用**
- 使用Agent自动生成配置
- 测试覆盖所有代码路径
- 验证配置完整性

**练习3: Docker部署**
- 编写Dockerfile
- 构建容器镜像
- 部署到Kubernetes

---

**学习时间**: 约12小时
**难度等级**: ★★★★☆
**重要程度**: ★★★★★

**下一步学习**: 第31章《Spring AI完全指南》
