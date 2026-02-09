# API设计与调用

## 学习目标

完成本章后，你将能够：
- 掌握RESTful API设计规范
- 熟练使用多种HTTP客户端调用接口
- 精通请求参数组装（JSON序列化、表单、文件上传）
- 掌握响应参数解析（JSON反序列化、泛型处理）
- 处理XML格式数据（序列化、反序列化、调用第三方XML接口）
- 集成Swagger自动生成API文档
- 实现接口版本管理
- 使用工具进行API测试

**预计学习时间**：8小时
**难度**：⭐⭐ 中级
**前置知识**：完成前面所有章节的学习

## RESTful API设计规范

### 什么是RESTful API？

REST（Representational State Transfer）是一种软件架构风格，RESTful API是基于REST架构的API设计风格。

**核心原则**
- ✅ **资源导向**：一切皆资源，使用URI标识
- ✅ **统一接口**：使用标准HTTP方法（GET、POST、PUT、DELETE）
- ✅ **无状态**：每个请求包含所有信息
- ✅ **分层系统**：客户端不知道服务器端的具体实现
- ✅ **可缓存**：响应应该明确标识是否可缓存

### URI设计规范

**资源命名规则**

```java
/**
 * RESTful API URI设计规范
 *
 * 规则1：使用名词复数
 * ✅ GET  /api/users          获取用户列表
 * ✅ GET  /api/users/123      获取特定用户
 * ❌ GET  /api/getUser        不推荐
 * ❌ GET  /api/user          使用单数不推荐
 *
 * 规则2：使用层级结构表达关系
 * ✅ GET  /api/users/123/orders     获取用户的订单
 * ✅ GET  /api/users/123/orders/456 获取用户的特定订单
 * ❌ GET  /api/orders?userId=123    可用但不推荐
 *
 * 规则3：使用查询参数进行过滤、排序、分页
 * ✅ GET  /api/users?page=1&size=20&sort=name:desc
 * ✅ GET  /api/users?status=active&age_gt=18
 *
 * 规则4：版本控制
 * ✅ GET  /api/v1/users
 * ✅ GET  /api/v2/users
 * ✅ GET  /api/users?version=1
 */
```

### HTTP方法使用规范

```java
/**
 * HTTP方法与CRUD操作对应关系
 *
 * GET    - 查询资源（幂等、安全）
 * POST   - 创建资源（非幂等）
 * PUT    - 完整更新资源（幂等）
 * PATCH  - 部分更新资源（幂等）
 * DELETE - 删除资源（幂等）
 */

/**
 * 用户API设计示例
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    /**
     * GET /api/users
     * 获取用户列表（支持分页、过滤、排序）
     */
    @GetMapping
    public Result<Page<User>> getUsers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "createTime:desc") String sort
    ) {
        // 业务逻辑
        return Result.success(userService.pageUsers(page, size, keyword, status, sort));
    }

    /**
     * GET /api/users/{id}
     * 获取单个用户
     */
    @GetMapping("/{id}")
    public Result<User> getUser(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user == null) {
            return Result.fail(404, "用户不存在");
        }
        return Result.success(user);
    }

    /**
     * POST /api/users
     * 创建新用户
     */
    @PostMapping
    public Result<User> createUser(@Valid @RequestBody UserCreateRequest request) {
        User user = userService.create(request);
        return Result.success(user);
    }

    /**
     * PUT /api/users/{id}
     * 完整更新用户
     */
    @PutMapping("/{id}")
    public Result<User> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        User user = userService.update(id, request);
        return Result.success(user);
    }

    /**
     * PATCH /api/users/{id}
     * 部分更新用户
     */
    @PatchMapping("/{id}")
    public Result<User> partialUpdateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates
    ) {
        User user = userService.partialUpdate(id, updates);
        return Result.success(user);
    }

    /**
     * DELETE /api/users/{id}
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return Result.success();
    }
}
```

### 状态码设计规范

```java
/**
 * HTTP状态码规范
 *
 * 2xx 成功
 * - 200 OK           GET/PUT/PATCH 成功
 * - 201 Created      POST 创建成功
 * - 204 No Content   DELETE/PUT 成功，无返回内容
 *
 * 3xx 重定向
 * - 301 Moved Permanently  永久重定向
 * - 302 Found              临时重定向
 *
 * 4xx 客户端错误
 * - 400 Bad Request        请求参数错误
 * - 401 Unauthorized       未认证
 * - 403 Forbidden          已认证但无权限
 * - 404 Not Found          资源不存在
 * - 409 Conflict           资源冲突
 * - 422 Unprocessable Entity 参数验证失败
 * - 429 Too Many Requests  请求过于频繁
 *
 * 5xx 服务器错误
 * - 500 Internal Server Error  服务器内部错误
 * - 502 Bad Gateway            网关错误
 * - 503 Service Unavailable    服务不可用
 */

/**
 * 统一响应格式
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Result<T> {
    private Integer code;      // 业务状态码
    private String message;    // 提示信息
    private T data;           // 返回数据
    private Long timestamp;   // 时间戳

    public static <T> Result<T> success() {
        return new Result<>(200, "操作成功", null, System.currentTimeMillis());
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(200, "操作成功", data, System.currentTimeMillis());
    }

    public static <T> Result<T> success(String message, T data) {
        return new Result<>(200, message, data, System.currentTimeMillis());
    }

    public static <T> Result<T> fail(Integer code, String message) {
        return new Result<>(code, message, null, System.currentTimeMillis());
    }

    public static <T> Result<T> fail(String message) {
        return new Result<>(500, message, null, System.currentTimeMillis());
    }
}
```

## HTTP客户端调用接口

### RestTemplate调用

**基础配置**

```java
package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * RestTemplate配置
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);  // 连接超时5秒
        factory.setReadTimeout(10000);     // 读取超时10秒

        return new RestTemplate(factory);
    }

    /**
     * 支持连接池的RestTemplate
     * 使用Apache HttpClient连接池
     */
    @Bean
    public RestTemplate pooledRestTemplate() {
        HttpComponentsClientHttpRequestFactory factory =
            new HttpComponentsClientHttpRequestFactory();

        // 连接池配置
        PoolingHttpClientConnectionManager connectionManager =
            PoolingHttpClientConnectionManagerBuilder.create()
                .setMaxTotal(200)              // 最大连接数
                .setDefaultMaxPerRoute(50)     // 每个路由的最大连接数
                .build();

        RequestConfig requestConfig = RequestConfig.custom()
            .setConnectTimeout(5000)
            .setConnectionRequestTimeout(5000)
            .setSocketTimeout(10000)
            .build();

        CloseableHttpClient httpClient = HttpClients.custom()
            .setConnectionManager(connectionManager)
            .setDefaultRequestConfig(requestConfig)
            .build();

        factory.setHttpClient(httpClient);
        return new RestTemplate(factory);
    }
}
```

**GET请求 - 获取数据**

```java
package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;

/**
 * RestTemplate GET请求示例
 */
@Service
public class UserApiService {

    @Autowired
    private RestTemplate restTemplate;

    /**
     * 简单GET请求
     */
    public User getUserById(Long id) {
        String url = "http://api.example.com/users/" + id;
        return restTemplate.getForObject(url, User.class);
    }

    /**
     * GET请求 - 带请求头
     */
    public User getUserWithHeaders(Long id, String token) {
        String url = "http://api.example.com/users/" + id;

        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 创建请求实体
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        // 发送请求
        ResponseEntity<User> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            requestEntity,
            User.class
        );

        return response.getBody();
    }

    /**
     * GET请求 - 带查询参数
     */
    public User getUserByParams(String username, String email) {
        String url = "http://api.example.com/users/search" +
                     "?username={username}&email={email}";

        // 使用map传递参数
        Map<String, String> params = Map.of(
            "username", username,
            "email", email
        );

        return restTemplate.getForObject(url, User.class, params);
    }

    /**
     * GET请求 - 获取列表
     */
    public List<User> getUserList() {
        String url = "http://api.example.com/users";

        // 方式1：直接返回数组
        User[] users = restTemplate.getForObject(url, User[].class);
        return Arrays.asList(users);

        // 方式2：使用ParameterizedTypeReference
        ResponseEntity<List<User>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<User>>() {}
        );
        return response.getBody();
    }

    /**
     * GET请求 - 完整示例（包含异常处理）
     */
    public User getUserSafe(Long id) {
        String url = "http://api.example.com/users/" + id;

        try {
            ResponseEntity<User> response = restTemplate.getForEntity(url, User.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                throw new RuntimeException("获取用户失败: " + response.getStatusCode());
            }
        } catch (HttpClientErrorException e) {
            // 4xx错误
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new RuntimeException("用户不存在");
            }
            throw e;
        } catch (HttpServerErrorException e) {
            // 5xx错误
            throw new RuntimeException("服务器错误", e);
        }
    }
}
```

**POST请求 - 创建数据**

```java
/**
 * RestTemplate POST请求示例
 */
@Service
public class UserApiService {

    /**
     * 简单POST请求 - 创建用户
     */
    public User createUser(UserCreateRequest request) {
        String url = "http://api.example.com/users";

        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 创建请求实体
        HttpEntity<UserCreateRequest> requestEntity =
            new HttpEntity<>(request, headers);

        // 发送请求
        ResponseEntity<User> response = restTemplate.postForEntity(
            url,
            requestEntity,
            User.class
        );

        return response.getBody();
    }

    /**
     * POST请求 - 表单提交
     */
    public String login(String username, String password) {
        String url = "http://api.example.com/login";

        // 使用MultiValueMap封装表单数据
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("username", username);
        formData.add("password", password);
        formData.add("grant_type", "password");

        // 设置表单请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> requestEntity =
            new HttpEntity<>(formData, headers);

        // 发送请求
        ResponseEntity<String> response = restTemplate.postForEntity(
            url,
            requestEntity,
            String.class
        );

        return response.getBody();
    }

    /**
     * POST请求 - 文件上传
     */
    public String uploadFile(File file) throws IOException {
        String url = "http://api.example.com/files/upload";

        // 创建MultiValueMap用于封装multipart数据
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // 添加文件
        FileSystemResource resource = new FileSystemResource(file);
        body.add("file", resource);

        // 添加其他参数
        body.add("description", "文件描述");

        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity =
            new HttpEntity<>(body, headers);

        // 发送请求
        ResponseEntity<String> response = restTemplate.postForEntity(
            url,
            requestEntity,
            String.class
        );

        return response.getBody();
    }

    /**
     * POST请求 - 通用方法
     */
    public <T> T post(String url, Object requestBody, Class<T> responseType) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + getToken());

        HttpEntity<Object> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<T> response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            requestEntity,
            responseType
        );

        return response.getBody();
    }
}
```

### WebClient调用（推荐）

**配置**

```java
package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * WebClient配置
 * Spring WebFlux的响应式HTTP客户端
 */
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
            .baseUrl("http://api.example.com")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .codecs(configurer -> configurer
                .defaultCodecs()
                .maxInMemorySize(10 * 1024 * 1024)  // 10MB
            )
            .build();
    }

    /**
     * 带超时配置的WebClient
     */
    @Bean
    public WebClient webClientWithTimeout() {
        HttpClient httpClient = HttpClient.create()
            .option(ChannelOption.CONNECT_TIMEOUT, Duration.ofSeconds(5))
            .responseTimeout(Duration.ofSeconds(10))
            .doOnConnected(conn ->
                conn.addHandlerLast(new ReadTimeoutHandler(10))
            );

        return WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .baseUrl("http://api.example.com")
            .build();
    }
}
```

**GET请求**

```java
package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * WebClient GET请求示例
 */
@Service
public class UserWebClientService {

    private final WebClient webClient;

    public UserWebClientService(WebClient webClient) {
        this.webClient = webClient;
    }

    /**
     * 简单GET请求 - 同步等待结果
     */
    public User getUserById(Long id) {
        return webClient.get()
            .uri("/users/{id}", id)
            .retrieve()
            .bodyToMono(User.class)
            .block();  // 阻塞等待结果
    }

    /**
     * GET请求 - 异步响应式
     */
    public Mono<User> getUserAsync(Long id) {
        return webClient.get()
            .uri("/users/{id}", id)
            .retrieve()
            .bodyToMono(User.class);
    }

    /**
     * GET请求 - 带查询参数
     */
    public User getUserByParams(String username, Integer age) {
        return webClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/users/search")
                .queryParam("username", username)
                .queryParam("age", age)
                .build())
            .retrieve()
            .bodyToMono(User.class)
            .block();
    }

    /**
     * GET请求 - 获取列表
     */
    public List<User> getUserList(Integer page, Integer size) {
        return webClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/users")
                .queryParam("page", page)
                .queryParam("size", size)
                .build())
            .retrieve()
            .bodyToFlux(User.class)
            .collectList()
            .block();
    }

    /**
     * GET请求 - 错误处理
     */
    public User getUserWithErrorHandling(Long id) {
        return webClient.get()
            .uri("/users/{id}", id)
            .retrieve()
            .onStatus(
                HttpStatus::is4xxClientError,
                response -> Mono.error(new RuntimeException("用户不存在"))
            )
            .onStatus(
                HttpStatus::is5xxServerError,
                response -> Mono.error(new RuntimeException("服务器错误"))
            )
            .bodyToMono(User.class)
            .block();
    }

    /**
     * GET请求 - 自定义响应处理
     */
    public User getUserWithCustomResponse(Long id) {
        return webClient.get()
            .uri("/users/{id}", id)
            .accept(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + getToken())
            .retrieve()
            .bodyToMono(User.class)
            .block();
    }
}
```

**POST请求**

```java
/**
 * WebClient POST请求示例
 */
@Service
public class UserWebClientService {

    /**
     * 简单POST请求
     */
    public User createUser(UserCreateRequest request) {
        return webClient.post()
            .uri("/users")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(User.class)
            .block();
    }

    /**
     * POST请求 - 表单提交
     */
    public String login(String username, String password) {
        return webClient.post()
            .uri("/login")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .bodyValue("username=" + username + "&password=" + password)
            .retrieve()
            .bodyToMono(String.class)
            .block();
    }

    /**
     * POST请求 - MultipartFile上传
     */
    public String uploadFile(Resource resource) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);
        body.add("description", "文件描述");

        return webClient.post()
            .uri("/files/upload")
            .contentType(MediaType.MULTIPART_FORM_DATA)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String.class)
            .block();
    }

    /**
     * PUT请求 - 更新数据
     */
    public User updateUser(Long id, UserUpdateRequest request) {
        return webClient.put()
            .uri("/users/{id}", id)
            .bodyValue(request)
            .retrieve()
            .bodyToMono(User.class)
            .block();
    }

    /**
     * DELETE请求
     */
    public void deleteUser(Long id) {
        webClient.delete()
            .uri("/users/{id}", id)
            .retrieve()
            .bodyToMono(Void.class)
            .block();
    }

    private String getToken() {
        // 获取token逻辑
        return "your-token";
    }
}
```

## 请求参数组装

### JSON序列化

```java
package com.example.demo.dto;

import com.fasterxml.jackson.annotation.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户创建请求DTO
 */
@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)  // 驼峰转下划线
public class UserCreateRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度3-20个字符")
    private String username;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度6-20个字符")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)  // 仅写入，不返回
    private String password;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime birthday;

    private Integer age;

    @JsonInclude(JsonInclude.Include.NON_NULL)  // 忽略null字段
    private String avatar;

    /**
     * 嵌套对象
     */
    @Valid
    private Address address;

    /**
     * 地址嵌套对象
     */
    @Data
    public static class Address {
        private String province;
        private String city;
        private String detail;
    }
}

/**
 * 使用示例
 */
@Service
public class UserService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    /**
     * 组装JSON请求体
     */
    public String buildJsonRequest() throws JsonProcessingException {
        UserCreateRequest request = new UserCreateRequest();
        request.setUsername("zhangsan");
        request.setEmail("zhangsan@example.com");
        request.setPassword("123456");
        request.setPhone("13800138000");

        // 设置嵌套对象
        UserCreateRequest.Address address = new UserCreateRequest.Address();
        address.setProvince("北京市");
        address.setCity("北京市");
        address.setDetail("朝阳区xxx");
        request.setAddress(address);

        // 序列化为JSON
        String json = objectMapper.writeValueAsString(request);

        // 输出：{"username":"zhangsan","email":"zhangsan@example.com",...}
        return json;
    }
}
```

### 表单参数组装

```java
package com.example.demo.util;

import org.springframework.core.io.FileSystemResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.File;
import java.util.Map;

/**
 * 表单参数组装工具类
 */
public class FormParamBuilder {

    /**
     * 构建普通表单参数
     */
    public static MultiValueMap<String, String> buildFormData(Map<String, String> params) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        params.forEach(formData::add);
        return formData;
    }

    /**
     * 构建表单参数（链式调用）
     */
    public static MultiValueMap<String, String> buildFormData() {
        return new LinkedMultiValueMap<>();
    }

    /**
     * 使用示例
     */
    public static void example() {
        // 方式1：使用Map构建
        Map<String, String> params = Map.of(
            "username", "zhangsan",
            "password", "123456",
            "grant_type", "password"
        );
        MultiValueMap<String, String> formData1 = buildFormData(params);

        // 方式2：链式添加
        MultiValueMap<String, String> formData2 = buildFormData()
            .add("username", "zhangsan")
            .add("password", "123456")
            .add("grant_type", "password");
    }

    /**
     * 构建文件上传表单
     */
    public static MultiValueMap<String, Object> buildMultipartData(
            File file,
            String description
    ) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // 添加文件
        body.add("file", new FileSystemResource(file));

        // 添加其他参数
        body.add("description", description);
        body.add("filename", file.getName());

        return body;
    }

    /**
     * 构建多文件上传
     */
    public static MultiValueMap<String, Object> buildMultipartData(
            List<File> files,
            Map<String, String> params
    ) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // 添加多个文件
        for (File file : files) {
            body.add("files", new FileSystemResource(file));
        }

        // 添加其他参数
        params.forEach(body::add);

        return body;
    }
}
```

### URL参数组装

```java
package com.example.demo.util;

import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * URL参数组装工具类
 */
public class UrlBuilder {

    /**
     * 构建带查询参数的URL
     */
    public static String buildUrl(String baseUrl, Map<String, Object> params) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl);

        params.forEach(builder::queryParam);

        return builder.build().toUriString();
    }

    /**
     * 构建RESTful URL
     */
    public static String buildRestUrl(String baseUrl, Object... pathVars) {
        return UriComponentsBuilder.fromHttpUrl(baseUrl)
            .pathSegment(pathVars)
            .build()
            .toUriString();
    }

    /**
     * 使用示例
     */
    public static void example() {
        // 示例1：构建查询URL
        String url1 = buildUrl("http://api.example.com/users", Map.of(
            "page", 1,
            "size", 20,
            "keyword", "张三"
        ));
        // 结果：http://api.example.com/users?page=1&size=20&keyword=张三

        // 示例2：构建RESTful URL
        String url2 = buildRestUrl("http://api.example.com/users", 123, "orders", 456);
        // 结果：http://api.example.com/users/123/orders/456

        // 示例3：混合使用
        String url3 = UriComponentsBuilder.fromHttpUrl("http://api.example.com/users/{id}/orders")
            .queryParam("status", "pending")
            .queryParam("page", 1)
            .buildAndExpand(123)  // 填充路径变量
            .toUriString();
        // 结果：http://api.example.com/users/123/orders?status=pending&page=1
    }
}
```

## 响应参数解析

### JSON反序列化

```java
package com.example.demo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 响应参数解析示例
 */
@Service
public class ResponseParserService {

    private final ObjectMapper objectMapper;

    public ResponseParserService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * 解析简单对象
     */
    public User parseUser(String json) throws JsonProcessingException {
        return objectMapper.readValue(json, User.class);
    }

    /**
     * 解析集合（使用TypeReference）
     */
    public List<User> parseUserList(String json) throws JsonProcessingException {
        return objectMapper.readValue(json, new TypeReference<List<User>>() {});
    }

    /**
     * 解析泛型对象（如Result<User>）
     */
    public Result<User> parseResult(String json) throws JsonProcessingException {
        return objectMapper.readValue(json, new TypeReference<Result<User>>() {});
    }

    /**
     * 解析嵌套结构
     */
    public PageResult<User> parsePageResult(String json) throws JsonProcessingException {
        return objectMapper.readValue(json, new TypeReference<PageResult<User>>() {});
    }

    /**
     * 忽略未知字段解析
     */
    public User parseUserIgnoreUnknown(String json) throws JsonProcessingException {
        return objectMapper
            .reader()
            .with(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
            .readValue(json, User.class);
    }

    /**
     * 解析Map并转换为对象
     */
    public User parseMapToUser(Map<String, Object> map) {
        return objectMapper.convertValue(map, User.class);
    }
}

/**
 * 常用响应DTO
 */
@Data
class PageResult<T> {
    private List<T> records;
    private Long total;
    private Integer page;
    private Integer size;
    private Integer pages;
}

@Data
class Result<T> {
    private Integer code;
    private String message;
    private T data;
}
```

### RestTemplate响应处理

```java
/**
 * RestTemplate响应解析示例
 */
@Service
public class ApiCallService {

    private final RestTemplate restTemplate;

    /**
     * 解析响应为对象
     */
    public User getUserAndParse(Long id) {
        String url = "http://api.example.com/users/" + id;

        // 直接解析为对象
        User user = restTemplate.getForObject(url, User.class);

        return user;
    }

    /**
     * 解析响应为集合
     */
    public List<User> getUserListAndParse() {
        String url = "http://api.example.com/users";

        // 方式1：使用数组
        User[] users = restTemplate.getForObject(url, User[].class);
        return Arrays.asList(users);

        // 方式2：使用ParameterizedTypeReference（推荐）
        ResponseEntity<List<User>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<User>>() {}
        );

        return response.getBody();
    }

    /**
     * 解析包装的响应（如Result<User>）
     */
    public User getUserFromResult(Long id) {
        String url = "http://api.example.com/users/" + id;

        // 使用ParameterizedTypeReference解析泛型
        ResponseEntity<Result<User>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<Result<User>>() {}
        );

        Result<User> result = response.getBody();

        // 检查业务状态码
        if (result.getCode() == 200) {
            return result.getData();
        } else {
            throw new RuntimeException(result.getMessage());
        }
    }

    /**
     * 解析分页响应
     */
    public PageResult<User> getUserPageAndParse(Integer page, Integer size) {
        String url = "http://api.example.com/users?page=" + page + "&size=" + size;

        ResponseEntity<PageResult<User>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<PageResult<User>>() {}
        );

        return response.getBody();
    }

    /**
     * 解析动态JSON响应
     * 当响应结构不确定时使用
     */
    public Map<String, Object> getDynamicResponse(String url) {
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

        Map<String, Object> body = response.getBody();

        // 根据实际字段进行处理
        Object data = body.get("data");
        Integer code = (Integer) body.get("code");

        return body;
    }
}
```

### WebClient响应处理

```java
/**
 * WebClient响应解析示例
 */
@Service
public class WebClientApiService {

    private final WebClient webClient;

    /**
     * 解析为对象
     */
    public User getUserAndParse(Long id) {
        return webClient.get()
            .uri("/users/{id}", id)
            .retrieve()
            .bodyToMono(User.class)
            .block();
    }

    /**
     * 解析为集合
     */
    public List<User> getUserListAndParse() {
        return webClient.get()
            .uri("/users")
            .retrieve()
            .bodyToFlux(User.class)
            .collectList()
            .block();
    }

    /**
     * 解析包装响应
     */
    public User getUserFromResult(Long id) {
        return webClient.get()
            .uri("/users/{id}", id)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Result<User>>() {})
            .map(result -> {
                if (result.getCode() == 200) {
                    return result.getData();
                } else {
                    throw new RuntimeException(result.getMessage());
                }
            })
            .block();
    }

    /**
     * 流式处理大列表
     */
    public void processLargeUserList() {
        webClient.get()
            .uri("/users/all")
            .retrieve()
            .bodyToFlux(User.class)
            .buffer(100)  // 每次处理100条
            .subscribe(
                users -> {
                    // 批量处理
                    saveBatch(users);
                },
                error -> {
                    // 错误处理
                    log.error("处理失败", error);
                },
                () -> {
                    // 完成处理
                    log.info("处理完成");
                }
            );
    }

    private void saveBatch(List<User> users) {
        // 批量保存逻辑
    }
}
```

## XML数据处理

### 添加XML依赖

```xml
<!-- Jackson XML处理 -->
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
</dependency>
```

### XML序列化注解

```java
package com.example.demo.dto;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import lombok.Data;

import jakarta.validation.constraints.*;
import java.util.List;

/**
 * 用户XML请求DTO
 */
@Data
@JacksonXmlRootElement(localName = "user")  // XML根元素
public class UserXmlRequest {

    @JacksonXmlProperty(localName = "username")  // 自定义XML元素名
    @NotBlank(message = "用户名不能为空")
    private String username;

    @JacksonXmlProperty(localName = "email")
    @NotBlank
    @Email
    private String email;

    @JacksonXmlProperty(localName = "age")
    @Min(1)
    @Max(150)
    private Integer age;

    /**
     * 嵌套对象
     */
    @JacksonXmlProperty(localName = "address")
    private AddressXml address;

    /**
     * 列表包装
     * 使用@JacksonXmlElementWrapper避免额外的包装元素
     */
    @JacksonXmlElementWrapper(useWrapping = false)
    @JacksonXmlProperty(localName = "phone")
    private List<String> phones;

    /**
     * 地址嵌套对象
     */
    @Data
    public static class AddressXml {
        @JacksonXmlProperty(localName = "province")
        private String province;

        @JacksonXmlProperty(localName = "city")
        private String city;

        @JacksonXmlProperty(localName = "detail")
        private String detail;
    }
}

/**
 * XML包装响应示例
 */
@Data
@JacksonXmlRootElement(localName = "response")
public class XmlResponse<T> {

    @JacksonXmlProperty(localName = "code")
    private Integer code;

    @JacksonXmlProperty(localName = "message")
    private String message;

    @JacksonXmlProperty(localName = "data")
    private T data;
}
```

### XML序列化示例

```java
package com.example.demo.service;

import com.example.demo.dto.UserXmlRequest;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.stereotype.Service;

/**
 * XML序列化示例
 */
@Service
public class XmlSerializationService {

    private final XmlMapper xmlMapper;

    public XmlSerializationService() {
        this.xmlMapper = new XmlMapper();
        // 配置XML Mapper
        this.xmlMapper.findAndRegisterModules();
        // 启用缩进格式化
        this.xmlMapper.enable(org.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT);
    }

    /**
     * 对象序列化为XML
     */
    public String serializeToXml(UserXmlRequest request) throws Exception {
        return xmlMapper.writeValueAsString(request);
    }

    /**
     * 使用示例
     */
    public void example() throws Exception {
        // 构建对象
        UserXmlRequest request = new UserXmlRequest();
        request.setUsername("zhangsan");
        request.setEmail("zhangsan@example.com");
        request.setAge(25);

        // 嵌套地址
        UserXmlRequest.AddressXml address = new UserXmlRequest.AddressXml();
        address.setProvince("北京市");
        address.setCity("北京市");
        address.setDetail("朝阳区xxx");
        request.setAddress(address);

        // 手机号列表
        request.setPhones(List.of("13800138000", "13800138001"));

        // 序列化为XML
        String xml = serializeToXml(request);

        // 输出结果：
        // <user>
        //   <username>zhangsan</username>
        //   <email>zhangsan@example.com</email>
        //   <age>25</age>
        //   <address>
        //     <province>北京市</province>
        //     <city>北京市</city>
        //     <detail>朝阳区xxx</detail>
        //   </address>
        //   <phone>13800138000</phone>
        //   <phone>13800138001</phone>
        // </user>

        System.out.println(xml);
    }
}
```

### XML反序列化示例

```java
/**
 * XML反序列化示例
 */
@Service
public class XmlDeserializationService {

    private final XmlMapper xmlMapper;

    public XmlDeserializationService() {
        this.xmlMapper = new XmlMapper();
        this.xmlMapper.findAndRegisterModules();
    }

    /**
     * XML反序列化为对象
     */
    public UserXmlRequest deserializeXml(String xml) throws Exception {
        return xmlMapper.readValue(xml, UserXmlRequest.class);
    }

    /**
     * 反序列化泛型对象
     */
    public XmlResponse<UserXmlRequest> deserializeXmlResponse(String xml) throws Exception {
        return xmlMapper.readValue(
            xml,
            new com.fasterxml.jackson.core.type.TypeReference<XmlResponse<UserXmlRequest>>() {}
        );
    }

    /**
     * 使用示例
     */
    public void example() throws Exception {
        String xmlInput = """
            <user>
                <username>zhangsan</username>
                <email>zhangsan@example.com</email>
                <age>25</age>
                <address>
                    <province>北京市</province>
                    <city>北京市</city>
                    <detail>朝阳区xxx</detail>
                </address>
                <phone>13800138000</phone>
                <phone>13800138001</phone>
            </user>
            """;

        // 反序列化
        UserXmlRequest request = deserializeXml(xmlInput);

        System.out.println("用户名: " + request.getUsername());
        System.out.println("邮箱: " + request.getEmail());
        System.out.println("地址: " + request.getAddress().getCity());
    }
}
```

### RestTemplate调用XML接口

```java
package com.example.demo.service;

import com.example.demo.dto.UserXmlRequest;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * RestTemplate调用XML接口示例
 */
@Service
public class XmlApiService {

    private final RestTemplate restTemplate;
    private final XmlMapper xmlMapper;

    public XmlApiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.xmlMapper = new XmlMapper();
        this.xmlMapper.findAndRegisterModules();
    }

    /**
     * 发送XML请求
     */
    public String sendXmlRequest(UserXmlRequest request) throws Exception {
        String url = "http://api.example.com/xml/users";

        // 序列化为XML
        String xmlBody = xmlMapper.writeValueAsString(request);

        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_XML);  // 关键：设置Content-Type为XML
        headers.set("Accept", MediaType.APPLICATION_XML_VALUE);

        // 创建请求实体
        HttpEntity<String> requestEntity = new HttpEntity<>(xmlBody, headers);

        // 发送请求
        ResponseEntity<String> response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            requestEntity,
            String.class
        );

        return response.getBody();
    }

    /**
     * 接收XML响应
     */
    public UserXmlRequest getUserXml(Long id) throws Exception {
        String url = "http://api.example.com/xml/users/" + id;

        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", MediaType.APPLICATION_XML_VALUE);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        // 发送请求，接收XML响应
        ResponseEntity<String> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            requestEntity,
            String.class
        );

        // 反序列化XML
        String xmlBody = response.getBody();
        return xmlMapper.readValue(xmlBody, UserXmlRequest.class);
    }

    /**
     * 解析XML包装响应
     */
    public UserXmlRequest getUserFromXmlWrapper(Long id) throws Exception {
        String url = "http://api.example.com/xml/users/" + id + "/wrapper";

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        // 反序列化为包装对象
        XmlResponse<UserXmlRequest> xmlResponse = xmlMapper.readValue(
            response.getBody(),
            new com.fasterxml.jackson.core.type.TypeReference<XmlResponse<UserXmlRequest>>() {}
        );

        // 检查业务状态码
        if (xmlResponse.getCode() == 200) {
            return xmlResponse.getData();
        } else {
            throw new RuntimeException(xmlResponse.getMessage());
        }
    }
}
```

### WebClient调用XML接口

```java
package com.example.demo.service;

import com.example.demo.dto.UserXmlRequest;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * WebClient调用XML接口示例
 */
@Service
public class XmlWebClientService {

    private final WebClient webClient;
    private final XmlMapper xmlMapper;

    public XmlWebClientService(WebClient webClient) {
        this.xmlMapper = new XmlMapper();
        this.xmlMapper.findAndRegisterModules();

        // 配置WebClient支持XML
        this.webClient = webClient.mutate()
            .baseUrl("http://api.example.com")
            .build();
    }

    /**
     * 发送XML请求
     */
    public UserXmlRequest sendXmlRequest(UserXmlRequest request) throws Exception {
        // 序列化为XML
        String xmlBody = xmlMapper.writeValueAsString(request);

        return webClient.post()
            .uri("/xml/users")
            .contentType(MediaType.APPLICATION_XML)  // 设置Content-Type为XML
            .accept(MediaType.APPLICATION_XML)       // 设置Accept为XML
            .bodyValue(xmlBody)
            .retrieve()
            .bodyToMono(UserXmlRequest.class)
            .block();
    }

    /**
     * 接收XML响应
     */
    public UserXmlRequest getUserXml(Long id) {
        return webClient.get()
            .uri("/xml/users/{id}", id)
            .accept(MediaType.APPLICATION_XML)
            .retrieve()
            .bodyToMono(UserXmlRequest.class)
            .block();
    }

    /**
     * 响应式处理XML
     */
    public Mono<UserXmlRequest> getUserXmlAsync(Long id) {
        return webClient.get()
            .uri("/xml/users/{id}", id)
            .accept(MediaType.APPLICATION_XML)
            .retrieve()
            .bodyToMono(UserXmlRequest.class);
    }
}
```

### 同时支持JSON和XML

```java
package com.example.demo.controller;

import com.example.demo.dto.UserXmlRequest;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 同时支持JSON和XML的Controller
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    /**
     * 根据Content-Type和Accept自动处理JSON/XML
     */
    @Operation(summary = "创建用户", description = "同时支持JSON和XML格式")
    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE},
                 produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    public ResponseEntity<UserXmlRequest> createUser(
            @RequestBody UserXmlRequest request,
            @RequestHeader(value = "Content-Type", defaultValue = MediaType.APPLICATION_JSON_VALUE) String contentType
    ) {
        // Spring会自动根据Content-Type反序列化请求体
        // 根据Accept头序列化响应体

        UserXmlRequest created = saveUser(request);

        return ResponseEntity.ok(created);
    }

    /**
     * GET请求也支持XML响应
     */
    @GetMapping(value = "/{id}",
                produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    public ResponseEntity<UserXmlRequest> getUser(@PathVariable Long id) {
        UserXmlRequest user = getUserById(id);

        // 客户端通过Accept头指定响应格式：
        // - Accept: application/json  返回JSON
        // - Accept: application/xml   返回XML
        return ResponseEntity.ok(user);
    }

    private UserXmlRequest saveUser(UserXmlRequest request) {
        // 保存逻辑
        return request;
    }

    private UserXmlRequest getUserById(Long id) {
        // 查询逻辑
        UserXmlRequest user = new UserXmlRequest();
        user.setUsername("zhangsan");
        user.setEmail("zhangsan@example.com");
        return user;
    }
}
```

### 调用第三方XML API实战示例

```java
package com.example.demo.service;

import com.example.demo.dto.XmlResponse;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * 调用第三方XML API实战示例
 * 场景：调用返回XML的支付接口
 */
@Service
public class ThirdPartyXmlApiService {

    private final RestTemplate restTemplate;
    private final XmlMapper xmlMapper;

    public ThirdPartyXmlApiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.xmlMapper = new XmlMapper();
        this.xmlMapper.findAndRegisterModules();
    }

    /**
     * 示例：调用支付宝XML接口
     */
    public String callAlipayXmlApi(String orderId, Double amount) throws Exception {
        String url = "https://openapi.alipay.com/gateway.do";

        // 构建XML请求参数
        StringBuilder xmlBuilder = new StringBuilder();
        xmlBuilder.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        xmlBuilder.append("<alipay>");
        xmlBuilder.append("<app_id>YOUR_APP_ID</app_id>");
        xmlBuilder.append("<method>alipay.trade.page.pay</method>");
        xmlBuilder.append("<charset>UTF-8</charset>");
        xmlBuilder.append("<sign_type>RSA2</sign_type>");
        xmlBuilder.append("<timestamp>").append(java.time.Instant.now().toString()).append("</timestamp>");
        xmlBuilder.append("<biz_content>");
        xmlBuilder.append("<out_trade_no>").append(orderId).append("</out_trade_no>");
        xmlBuilder.append("<total_amount>").append(amount).append("</total_amount>");
        xmlBuilder.append("<subject>商品支付</subject>");
        xmlBuilder.append("</biz_content>");
        xmlBuilder.append("</alipay>");

        String xmlBody = xmlBuilder.toString();

        // 发送请求
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_XML);

        HttpEntity<String> requestEntity = new HttpEntity<>(xmlBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

        // 解析XML响应
        String responseXml = response.getBody();

        // 提取响应中的字段
        // 实际项目中应该使用完整的XML解析或XPath
        if (responseXml.contains("<is_success>T</is_success>")) {
            // 提取支付URL
            int start = responseXml.indexOf("<redirect_url>") + "<redirect_url>".length();
            int end = responseXml.indexOf("</redirect_url>");
            String redirectUrl = responseXml.substring(start, end);
            return redirectUrl;
        } else {
            throw new RuntimeException("支付请求失败");
        }
    }

    /**
     * 示例：调用微信支付XML接口
     */
    public String callWechatPayXmlApi(String orderId, Double amount) throws Exception {
        String url = "https://api.mch.weixin.qq.com/pay/unifiedorder";

        // 构建XML请求体
        String xmlRequest = buildWechatPayXml(orderId, amount);

        // 发送请求
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_XML);

        HttpEntity<String> requestEntity = new HttpEntity<>(xmlRequest, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
            url,
            requestEntity,
            String.class
        );

        // 解析XML响应
        return parseWechatPayResponse(response.getBody());
    }

    /**
     * 构建微信支付XML请求
     */
    private String buildWechatPayXml(String orderId, Double amount) {
        return String.format("""
            <xml>
              <appid>YOUR_APPID</appid>
              <mch_id>YOUR_MCH_ID</mch_id>
              <nonce_str>%s</nonce_str>
              <sign>%s</sign>
              <body>商品描述</body>
              <out_trade_no>%s</out_trade_no>
              <total_fee>%.0f</total_fee>
              <spbill_create_ip>127.0.0.1</spbill_create_ip>
              <notify_url>https://yourdomain.com/notify</notify_url>
              <trade_type>NATIVE</trade_type>
            </xml>
            """,
            java.util.UUID.randomUUID().toString().replace("-", ""),
            calculateSign(orderId, amount),  // 计算签名
            orderId,
            amount * 100  // 单位：分
        );
    }

    /**
     * 解析微信支付XML响应
     */
    private String parseWechatPayResponse(String xml) throws Exception {
        // 方式1：使用字符串解析（简单场景）
        if (xml.contains("<return_code><![CDATA[SUCCESS]]></return_code>")) {
            int start = xml.indexOf("<code_url><![CDATA[") + "<code_url><![CDATA[".length();
            int end = xml.indexOf("]]></code_url>");
            String codeUrl = xml.substring(start, end);
            return codeUrl;
        } else {
            // 提取错误信息
            int start = xml.indexOf("<return_msg><![CDATA[") + "<return_msg><![CDATA[".length();
            int end = xml.indexOf("]]></return_msg>");
            String errorMsg = xml.substring(start, end);
            throw new RuntimeException("微信支付失败: " + errorMsg);
        }

        // 方式2：使用XmlMapper解析（推荐，复杂场景）
        // WechatPayResponse response = xmlMapper.readValue(xml, WechatPayResponse.class);
        // if ("SUCCESS".equals(response.getReturnCode())) {
        //     return response.getCodeUrl();
        // }
    }

    private String calculateSign(String orderId, Double amount) {
        // 实际签名计算逻辑
        return "CALCULATED_SIGN";
    }
}
```

### XML vs JSON选择建议

```java
/**
 * XML vs JSON 使用场景
 */

/**
 * ✅ 优先使用JSON的场景：
 * 1. Web应用前后端交互
 * 2. RESTful API
 * 3. 移动应用接口
 * 4. 数据量小、性能要求高的场景
 *
 * 优点：
 * - 更小的数据体积
 * - 更快的解析速度
 * - 原生支持JavaScript
 * - 易于人眼阅读
 */

/**
 * ✅ 使用XML的场景：
 * 1. 传统企业系统对接（银行、支付）
 * 2. SOAP Web服务
 * 3. 需要复杂数据验证的场景（XSD）
 * 4. 文档型数据（如Word、Excel）
 * 5. 某些第三方API要求（如微信支付、支付宝）
 *
 * 优点：
 * - 更强的数据描述能力
 * - 支持注释
 * - 支持命名空间
 * - 成熟的验证机制（XSD）
 * - 更好的安全性（XML加密/签名）
 */

/**
 * 🎯 最佳实践：
 *
 * 1. 新项目优先使用JSON
 * 2. 对接遗留系统或第三方要求时使用XML
 * 3. 同时支持两种格式（通过Content-Type和Accept头）
 * 4. 使用统一的异常处理机制
 * 5. 添加格式验证和类型转换
 */
```

## Swagger API文档集成

### 添加依赖

```xml
<!-- SpringDoc OpenAPI (Swagger 3.0) -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.2.0</version>
</dependency>
```

### Swagger配置

```java
package com.example.demo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger配置
 */
@Configuration
public class SwaggerConfig {

    /**
     * OpenAPI基本信息
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("用户管理系统API")
                .version("1.0.0")
                .description("用户管理系统接口文档")
                .contact(new Contact()
                    .name("开发团队")
                    .email("dev@example.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("http://springdoc.org")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new io.swagger.v3.oas.models.Components()
                .addSecuritySchemes("bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }

    /**
     * 分组配置
     */
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
            .group("public")
            .pathsToMatch("/api/public/**")
            .build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
            .group("admin")
            .pathsToMatch("/api/admin/**")
            .build();
    }
}
```

### API注解使用

```java
package com.example.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.springframework.web.bind.annotation.*;

/**
 * 用户控制器 - Swagger注解示例
 */
@RestController
@RequestMapping("/api/users")
@Tag(name = "用户管理", description = "用户增删改查接口")
public class UserController {

    @Operation(
        summary = "获取用户列表",
        description = "支持分页、关键词搜索、状态过滤"
    )
    @GetMapping
    public Result<Page<User>> getUsers(
            @Parameter(description = "页码", example = "1")
            @RequestParam(defaultValue = "1") Integer page,

            @Parameter(description = "每页大小", example = "20")
            @RequestParam(defaultValue = "20") Integer size,

            @Parameter(description = "搜索关键词", required = false)
            @RequestParam(required = false) String keyword
    ) {
        // 业务逻辑
        return Result.success(userService.pageUsers(page, size, keyword));
    }

    @Operation(
        summary = "获取用户详情",
        description = "根据用户ID获取用户详细信息"
    )
    @GetMapping("/{id}")
    public Result<User> getUser(
            @Parameter(description = "用户ID", required = true, example = "123")
            @PathVariable Long id
    ) {
        User user = userService.getById(id);
        return Result.success(user);
    }

    @Operation(
        summary = "创建用户",
        description = "创建新用户，返回创建成功的用户信息"
    )
    @PostMapping
    public Result<User> createUser(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "用户创建请求",
                required = true
            )
            @Valid @RequestBody UserCreateRequest request
    ) {
        User user = userService.create(request);
        return Result.success(user);
    }
}
```

### DTO文档注解

```java
package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * 用户创建请求DTO
 */
@Data
@Schema(description = "用户创建请求")
public class UserCreateRequest {

    @Schema(
        description = "用户名",
        example = "zhangsan",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minLength = 3,
        maxLength = 20
    )
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20)
    private String username;

    @Schema(
        description = "邮箱",
        example = "zhangsan@example.com",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank
    @Email
    private String email;

    @Schema(
        description = "密码",
        example = "123456",
        requiredMode = Schema.RequiredMode.REQUIRED,
        minLength = 6,
        maxLength = 20
    )
    @NotBlank
    @Size(min = 6, max = 20)
    private String password;

    @Schema(description = "手机号", example = "13800138000")
    @Pattern(regexp = "^1[3-9]\\d{9}$")
    private String phone;

    @Schema(description = "年龄", example = "25")
    @Min(1)
    @Max(150)
    private Integer age;
}
```

### 访问Swagger UI

启动应用后访问：
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## 接口测试

### 使用Postman测试

**创建Postman集合**

```json
{
  "info": {
    "name": "用户管理系统API",
    "_postman_id": "collection-id"
  },
  "item": [
    {
      "name": "用户管理",
      "item": [
        {
          "name": "获取用户列表",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "http://localhost:8080/api/users?page=1&size=20",
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "size",
                  "value": "20"
                }
              ]
            }
          }
        },
        {
          "name": "创建用户",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"zhangsan\",\n  \"email\": \"zhangsan@example.com\",\n  \"password\": \"123456\"\n}"
            },
            "url": {
              "raw": "http://localhost:8080/api/users"
            }
          }
        }
      ]
    }
  ]
}
```

### Apifox测试

Apifox支持导入OpenAPI规范：

```bash
# 1. 导入OpenAPI文档
# 在Apifox中：项目设置 -> 导入数据 -> OpenAPI -> URL
# 输入：http://localhost:8080/v3/api-docs

# 2. 自动生成接口文档
# Apifox会自动解析所有接口，生成测试用例

# 3. 环境变量配置
# 开发环境：http://localhost:8080
# 测试环境：http://test-api.example.com
# 生产环境：http://api.example.com
```

## 接口版本管理

### URL路径版本控制

```java
/**
 * 方式1：URL路径版本
 * /api/v1/users
 * /api/v2/users
 */
@RestController
@RequestMapping("/api/v1/users")
public class UserV1Controller {

    @GetMapping("/{id}")
    public Result<User> getUser(@PathVariable Long id) {
        // v1版本实现
        return Result.success(userService.getByIdV1(id));
    }
}

@RestController
@RequestMapping("/api/v2/users")
public class UserV2Controller {

    @GetMapping("/{id}")
    public Result<UserVO> getUser(@PathVariable Long id) {
        // v2版本返回VO
        User user = userService.getById(id);
        return Result.success(convertToVO(user));
    }
}
```

### 请求头版本控制

```java
/**
 * 方式2：请求头版本
 * Header: X-API-Version: 1
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public Result<?> getUser(
            @PathVariable Long id,
            @RequestHeader(value = "X-API-Version", defaultValue = "1") String version
    ) {
        if ("1".equals(version)) {
            return Result.success(userService.getByIdV1(id));
        } else if ("2".equals(version)) {
            return Result.success(userService.getByIdV2(id));
        }
        throw new UnsupportedOperationException("不支持的版本: " + version);
    }
}
```

### 查询参数版本控制

```java
/**
 * 方式3：查询参数版本
 * ?version=1
 */
@GetMapping("/{id}")
public Result<?> getUser(
        @PathVariable Long id,
        @RequestParam(defaultValue = "1") String version
) {
    if ("1".equals(version)) {
        return Result.success(userService.getByIdV1(id));
    }
    return Result.success(userService.getByIdV2(id));
}
```

## 最佳实践

### 1. 统一的HTTP客户端封装

```java
/**
 * 统一的API客户端封装
 */
@Component
public class ApiClient {

    private final RestTemplate restTemplate;
    private final WebClient webClient;

    /**
     * 通用GET请求
     */
    public <T> T get(String url, Class<T> responseType) {
        return restTemplate.getForObject(url, responseType);
    }

    /**
     * 通用POST请求
     */
    public <T> T post(String url, Object body, Class<T> responseType) {
        return restTemplate.postForObject(url, body, responseType);
    }

    /**
     * 带重试机制的请求
     */
    public <T> T getWithRetry(String url, Class<T> responseType, int maxRetries) {
        int retries = 0;
        while (retries < maxRetries) {
            try {
                return restTemplate.getForObject(url, responseType);
            } catch (Exception e) {
                retries++;
                if (retries >= maxRetries) {
                    throw e;
                }
                try {
                    Thread.sleep(1000 * retries);  // 递增延迟
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(ex);
                }
            }
        }
        throw new RuntimeException("请求失败，已达最大重试次数");
    }
}
```

### 2. 统一异常处理

```java
@ControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<Result<?>> handleClientError(HttpClientErrorException e) {
        return ResponseEntity
            .status(e.getStatusCode())
            .body(Result.fail(e.getStatusCode().value(), e.getMessage()));
    }

    @ExceptionHandler(HttpServerErrorException.class)
    public ResponseEntity<Result<?>> handleServerError(HttpServerErrorException e) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Result.fail(500, "服务器错误"));
    }
}
```

### 3. 请求日志记录

```java
/**
 * 请求日志拦截器
 */
@Component
public class RequestLoggingInterceptor implements ClientHttpRequestInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingInterceptor.class);

    @Override
    public ClientHttpResponse intercept(
            HttpRequest request,
            byte[] body,
            ClientHttpRequestExecution execution) throws IOException {

        // 记录请求日志
        logRequest(request, body);

        ClientHttpResponse response = execution.execute(request, body);

        // 记录响应日志
        logResponse(response);

        return response;
    }

    private void logRequest(HttpRequest request, byte[] body) {
        log.info("请求: {} {}", request.getMethod(), request.getURI());
        log.info("请求头: {}", request.getHeaders());
        log.info("请求体: {}", new String(body));
    }

    private void logResponse(ClientHttpResponse response) throws IOException {
        log.info("响应状态码: {}", response.getStatusCode());
        log.info("响应头: {}", response.getHeaders());
    }
}
```

## 避坑指南

### 常见错误

**错误1：乱码问题**
```java
// ❌ 错误：未指定字符编码
HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON);

// ✅ 正确：明确指定字符编码
HttpHeaders headers = new HttpHeaders();
headers.setContentType(new MediaType("application", "json", StandardCharsets.UTF_8));
```

**错误2：时区问题**
```java
// ❌ 错误：未处理时区
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
private LocalDateTime createTime;

// ✅ 正确：指定时区
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
private LocalDateTime createTime;
```

**错误3：循环引用**
```java
// ❌ 错误：User和Order互相引用
@Data
public class User {
    private List<Order> orders;
}

@Data
public class Order {
    private User user;
}

// ✅ 正确：使用@JsonManagedReference和@JsonIgnore
@Data
public class User {
    @JsonManagedReference
    private List<Order> orders;
}

@Data
public class Order {
    @JsonIgnore
    private User user;
}
```

**错误4：泛型擦除**
```java
// ❌ 错误：无法正确解析泛型
Result<User> result = restTemplate.getForObject(url, Result.class);

// ✅ 正确：使用ParameterizedTypeReference
ResponseEntity<Result<User>> response = restTemplate.exchange(
    url,
    HttpMethod.GET,
    null,
    new ParameterizedTypeReference<Result<User>>() {}
);
```

## 总结

本章深入讲解了API设计与调用的完整知识体系：

**核心知识点**
1. RESTful API设计规范
2. RestTemplate和WebClient使用
3. 请求参数组装（JSON、XML序列化、表单、文件）
4. 响应参数解析（JSON、XML反序列化、对象、集合、泛型）
5. XML数据处理（Jackson XML注解、第三方XML接口调用）
6. Swagger API文档集成
7. 接口版本管理
8. 接口测试（Postman/Apifox）

**关键要点**
- 遵循RESTful设计规范
- 优先使用WebClient（响应式）
- 统一的请求/响应格式
- 完善的异常处理机制
- 自动生成API文档
- 使用工具提高测试效率

**推荐资源**
- [RESTful API设计指南](https://restfulapi.net/)
- [SpringDoc官方文档](https://springdoc.org/)
- [Postman使用教程](https://learning.postman.com/)

---

**上一章**：[Spring MVC开发](./chapter-125) | **下一章**：[Spring Data JPA数据访问](./chapter-126)
