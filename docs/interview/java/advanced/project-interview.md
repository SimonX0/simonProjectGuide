---
title: Java高级面试题 - 实战项目面试题
---

# Java高级面试题 - 实战项目面试题

## 项目一：个人博客系统

### 技术栈

**后端**：Spring Boot 3.2 + MyBatis + Thymeleaf
**数据库**：MySQL 8.0 + Redis
**前端**：HTML5 + CSS3 + Bootstrap 5
**构建工具**：Maven

### Q1: 如何设计博客系统的数据库架构？

**参考答案**：

博客系统的数据库设计需要考虑文章、用户、评论、分类标签等多个实体及其关系。

**核心表结构**：

```sql
-- 用户表
CREATE TABLE `user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT 'BCrypt加密密码',
  `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `role` VARCHAR(20) DEFAULT 'USER' COMMENT '角色：ADMIN/USER',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 文章表
CREATE TABLE `post` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '文章ID',
  `title` VARCHAR(200) NOT NULL COMMENT '文章标题',
  `summary` VARCHAR(500) COMMENT '文章摘要',
  `content` MEDIUMTEXT NOT NULL COMMENT 'Markdown内容',
  `cover_image` VARCHAR(255) COMMENT '封面图',
  `author_id` INT NOT NULL COMMENT '作者ID',
  `category_id` INT COMMENT '分类ID',
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `comment_count` INT DEFAULT 0 COMMENT '评论数',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-草稿，1-发布',
  `is_top` TINYINT DEFAULT 0 COMMENT '是否置顶',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`author_id`) REFERENCES `user`(`id`),
  FOREIGN KEY (`category_id`) REFERENCES `category`(`id`),
  INDEX `idx_author` (`author_id`),
  INDEX `idx_category` (`category_id`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表';

-- 评论表（支持多级回复）
CREATE TABLE `comment` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `post_id` INT NOT NULL COMMENT '文章ID',
  `user_id` INT NOT NULL COMMENT '评论用户ID',
  `parent_id` INT DEFAULT 0 COMMENT '父评论ID',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-待审核，1-已通过',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  INDEX `idx_post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';
```

**ER图设计要点**：
- **一对多关系**：User → Post（一个用户多篇文章）
- **一对多关系**：Post → Comment（一篇文章多条评论）
- **多对多关系**：Post ↔ Tag（通过 post_tag 关联表）
- **级联删除**：删除文章时级联删除评论

### Q2: 如何实现文章浏览量统计和缓存？

**参考答案**：

使用 Redis 计数器 + 定时同步到数据库的方式实现高性能浏览量统计。

**1. Redis 浏览量计数器**

```java
@Service
@RequiredArgsConstructor
public class ViewCountService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final PostMapper postMapper;

    private static final String POST_VIEW_KEY = "post:view:";

    /**
     * 增加浏览量
     */
    public void incrementView(Long postId) {
        String key = POST_VIEW_KEY + postId;
        redisTemplate.opsForValue().increment(key);

        // 设置过期时间（7天）
        redisTemplate.expire(key, 7, TimeUnit.DAYS);
    }

    /**
     * 获取浏览量（优先从Redis获取）
     */
    public Long getViewCount(Long postId) {
        String key = POST_VIEW_KEY + postId;

        // 从Redis获取
        Object count = redisTemplate.opsForValue().get(key);
        if (count != null) {
            return Long.parseLong(count.toString());
        }

        // Redis没有，从数据库获取
        Post post = postMapper.selectById(postId);
        if (post != null) {
            // 回写到Redis
            redisTemplate.opsForValue().set(key, post.getViewCount(), 7, TimeUnit.DAYS);
            return post.getViewCount();
        }

        return 0L;
    }

    /**
     * 定时任务：同步Redis浏览量到数据库
     * 每小时执行一次
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void syncViewCountToDB() {
        Set<String> keys = redisTemplate.keys(POST_VIEW_KEY + "*");
        if (keys == null || keys.isEmpty()) {
            return;
        }

        Map<Long, Long> viewCountMap = new HashMap<>();

        // 批量获取Redis中的浏览量
        List<Object> values = redisTemplate.opsForValue().multiGet(keys);
        if (values != null) {
            int i = 0;
            for (String key : keys) {
                Long postId = Long.parseLong(key.substring(POST_VIEW_KEY.length()));
                Long count = Long.parseLong(values.get(i).toString());
                viewCountMap.put(postId, count);
                i++;
            }
        }

        // 批量更新数据库
        if (!viewCountMap.isEmpty()) {
            viewCountMap.forEach(this::updateViewCount);
        }
    }

    private void updateViewCount(Long postId, Long count) {
        postMapper.updateViewCount(postId, count);
    }
}
```

**2. Controller 中使用**

```java
@Controller
@RequestMapping("/post")
@RequiredArgsConstructor
public class PostController {

    private final ViewCountService viewCountService;

    /**
     * 文章详情页
     */
    @GetMapping("/{id}")
    public String detail(@PathVariable Long id, Model model) {
        // 获取文章
        Post post = postService.getById(id);
        model.addAttribute("post", post);

        // 增加浏览量（异步，不阻塞页面）
        CompletableFuture.runAsync(() -> viewCountService.incrementView(id));

        // 获取浏览量
        Long viewCount = viewCountService.getViewCount(id);
        model.addAttribute("viewCount", viewCount);

        return "post/detail";
    }
}
```

**3. MyBatis Mapper**

```java
@Mapper
public interface PostMapper extends BaseMapper<Post> {

    /**
     * 更新浏览量
     */
    @Update("UPDATE post SET view_count = #{viewCount} WHERE id = #{id}")
    int updateViewCount(@Param("id") Long id, @Param("viewCount") Long viewCount);
}
```

**架构优势**：
- **高性能**：Redis 计数器，QPS 可达 10万+
- **数据持久化**：定时同步到 MySQL
- **防止刷量**：可以结合 IP 限流
- **容错性**：Redis 故障时降级到数据库

### Q3: 如何实现文章评论的多级回复功能？

**参考答案**：

使用递归查询或一次性加载构建评论树的方式实现多级评论。

**1. 评论实体设计**

```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("comment")
public class Comment extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long postId;
    private Long userId;
    private Long parentId;  // 父评论ID，0表示一级评论
    private String content;
    private Integer status;

    @TableField(exist = false)
    private String username;

    @TableField(exist = false)
    private String avatar;

    @TableField(exist = false)
    private List<Comment> children;  // 子评论列表

    @TableField(exist = false)
    private Integer likeCount;  // 点赞数
}
```

**2. 评论树构建**

```java
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentMapper commentMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * 获取文章评论树
     */
    public List<Comment> getCommentTree(Long postId) {
        // 先从Redis缓存获取
        String cacheKey = "comment:tree:" + postId;
        List<Comment> cached = (List<Comment>) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }

        // 查询所有已通过的评论
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getPostId, postId)
               .eq(Comment::getStatus, 1)
               .orderByAsc(Comment::getCreateTime);

        List<Comment> comments = commentMapper.selectList(wrapper);

        // 构建评论树
        List<Comment> tree = buildCommentTree(comments);

        // 缓存5分钟
        redisTemplate.opsForValue().set(cacheKey, tree, 5, TimeUnit.MINUTES);

        return tree;
    }

    /**
     * 构建评论树（递归方式）
     */
    private List<Comment> buildCommentTree(List<Comment> comments) {
        // 按ID分组
        Map<Long, List<Comment>> commentMap = new HashMap<>();
        List<Comment> rootComments = new ArrayList<>();

        for (Comment comment : comments) {
            if (comment.getParentId() == 0) {
                rootComments.add(comment);
            } else {
                commentMap.computeIfAbsent(
                    comment.getParentId(),
                    k -> new ArrayList<>()
                ).add(comment);
            }
        }

        // 递归构建树
        buildChildren(rootComments, commentMap);

        return rootComments;
    }

    private void buildChildren(List<Comment> comments, Map<Long, List<Comment>> commentMap) {
        for (Comment comment : comments) {
            List<Comment> children = commentMap.get(comment.getId());
            if (children != null && !children.isEmpty()) {
                comment.setChildren(children);
                buildChildren(children, commentMap);
            }
        }
    }

    /**
     * 发表评论
     */
    @Transactional
    public void addComment(Comment comment) {
        // 验证文章是否存在
        Post post = postMapper.selectById(comment.getPostId());
        if (post == null) {
            throw new BusinessException("文章不存在");
        }

        // 验证父评论是否存在（如果有）
        if (comment.getParentId() != 0) {
            Comment parent = commentMapper.selectById(comment.getParentId());
            if (parent == null || !parent.getPostId().equals(comment.getPostId())) {
                throw new BusinessException("父评论不存在");
            }
        }

        comment.setUserId(SecurityUtils.getCurrentUserId());
        comment.setStatus(1);  // 自动通过，也可以设置为待审核
        commentMapper.insert(comment);

        // 更新文章评论数
        postMapper.incrementCommentCount(comment.getPostId());

        // 清除缓存
        redisTemplate.delete("comment:tree:" + comment.getPostId());
    }
}
```

**3. 前端展示（Thymeleaf）**

```html
<div class="comment-list" th:if="${comments != null}">
  <div th:each="comment : ${comments}" class="comment-item">
    <div class="comment-content">
      <img th:src="${comment.avatar}" class="avatar" />
      <div class="comment-body">
        <span class="username" th:text="${comment.username}"></span>
        <p class="text" th:text="${comment.content}"></p>
      </div>
    </div>

    <!-- 递归渲染子评论 -->
    <div th:if="${comment.children != null and not #lists.isEmpty(comment.children)}">
      <div th:replace="~{comment/children :: childComments(${
          comment.children
      })}"></div>
    </div>
  </div>
</div>

<!-- comment/children.html 模板片段 -->
<div th:fragment="childComments(comments)" class="comment-children">
  <div th:each="comment : ${comments}" class="comment-item child">
    <div class="comment-content">
      <div class="comment-body">
        <span class="username" th:text="${comment.username}"></span>
        <p class="text" th:text="${comment.content}"></p>
      </div>
    </div>
    <div th:if="${comment.children != null}">
      <div th:replace="~{comment/children :: childComments(${
          comment.children
      })}"></div>
    </div>
  </div>
</div>
```

**关键点**：
- **递归构建**：内存中构建树形结构
- **缓存优化**：Redis 缓存评论树
- **性能考虑**：限制评论层级（如最多3层）
- **事务保证**：评论数更新使用事务

### Q4: 如何实现文章归档功能（按日期分组）？

**参考答案**：

使用 SQL 的 DATE_FORMAT 函数或 Java Stream 分组实现归档。

**1. Mapper 层实现**

```java
@Mapper
public interface PostMapper extends BaseMapper<Post> {

    /**
     * 查询文章归档统计（按年月分组）
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m') AS archive_date, " +
            "COUNT(*) AS count " +
            "FROM post " +
            "WHERE status = 1 " +
            "GROUP BY DATE_FORMAT(create_time, '%Y-%m') " +
            "ORDER BY archive_date DESC")
    List<ArchiveDTO> getArchiveStats();

    /**
     * 根据归档日期查询文章
     */
    @Select("SELECT * FROM post " +
            "WHERE status = 1 " +
            "AND DATE_FORMAT(create_time, '%Y-%m') = #{archiveDate} " +
            "ORDER BY create_time DESC")
    List<Post> getPostsByArchive(@Param("archiveDate") String archiveDate);
}

/**
 * 归档DTO
 */
@Data
@AllArgsConstructor
public class ArchiveDTO {
    private String archiveDate;  // 格式：2024-01
    private Integer count;
}
```

**2. Service 层**

```java
@Service
@RequiredArgsConstructor
public class ArchiveService {

    private final PostMapper postMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * 获取文章归档
     */
    public List<ArchiveDTO> getArchives() {
        // 从缓存获取
        String cacheKey = "archives";
        List<ArchiveDTO> cached = (List<ArchiveDTO>) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }

        // 查询数据库
        List<ArchiveDTO> archives = postMapper.getArchiveStats();

        // 缓存1小时
        redisTemplate.opsForValue().set(cacheKey, archives, 1, TimeUnit.HOURS);

        return archives;
    }

    /**
     * 获取归档下的文章
     */
    public List<Post> getPostsByArchive(String archiveDate) {
        return postMapper.getPostsByArchive(archiveDate);
    }
}
```

**3. Controller 层**

```java
@Controller
@RequestMapping("/archive")
@RequiredArgsConstructor
public class ArchiveController {

    private final ArchiveService archiveService;

    /**
     * 归档页面
     */
    @GetMapping
    public String archives(Model model) {
        List<ArchiveDTO> archives = archiveService.getArchives();
        model.addAttribute("archives", archives);
        return "archive/list";
    }

    /**
     * 归档详情页
     */
    @GetMapping("/{archiveDate}")
    public String archiveDetail(
        @PathVariable String archiveDate,
        Model model
    ) {
        List<Post> posts = archiveService.getPostsByArchive(archiveDate);
        model.addAttribute("posts", posts);
        model.addAttribute("archiveDate", archiveDate);
        return "archive/detail";
    }
}
```

**4. Thymeleaf 模板**

```html
<!-- 归档列表 -->
<div class="archive-list" th:each="archive : ${archives}">
  <a th:href="@{/archive/{date}(date=${archive.archiveDate})}">
    <span th:text="${#strings.substring(archive.archiveDate, 0, 4)}">2024</span>年
    <span th:text="${#strings.substring(archive.archiveDate, 5, 7)}">01</span>月
    <span class="count" th:text="${archive.count}"></span> 篇文章
  </a>
</div>

<!-- 归档详情 -->
<div class="archive-posts">
  <h2 th:text="${archiveDate} + ' 的文章'"></h2>
  <div th:each="post : ${posts}">
    <a th:href="@{/post/{id}(id=${post.id})}" th:text="${post.title}"></a>
    <span th:text="${#temporals.format(post.createTime, 'MM-dd')}"></span>
  </div>
</div>
```

### Q5: 如何实现文章搜索功能（标题+内容）？

**参考答案**：

使用 MySQL 全文索引或 Elasticsearch 实现高性能搜索。

**方案1：MySQL LIKE 模糊查询（简单场景）**

```java
@Mapper
public interface PostMapper extends BaseMapper<Post> {

    @Select("SELECT * FROM post " +
            "WHERE status = 1 " +
            "AND (title LIKE CONCAT('%', #{keyword}, '%') " +
            "     OR content LIKE CONCAT('%', #{keyword}, '%')) " +
            "ORDER BY create_time DESC " +
            "LIMIT #{limit}")
    List<Post> searchPosts(@Param("keyword") String keyword, @Param("limit") int limit);
}
```

**方案2：MySQL 全文索引（推荐）**

```sql
-- 创建全文索引
ALTER TABLE post ADD FULLTEXT INDEX ft_title_content (title, content);

-- 全文搜索查询
SELECT *,
       MATCH(title, content) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE) AS score
FROM post
WHERE status = 1
  AND MATCH(title, content) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE)
ORDER BY score DESC, create_time DESC
LIMIT 20;
```

```java
@Mapper
public interface PostMapper extends BaseMapper<Post> {

    /**
     * 全文搜索
     */
    @Select("SELECT *, " +
            "MATCH(title, content) AGAINST(${keyword} IN NATURAL LANGUAGE MODE) AS score " +
            "FROM post " +
            "WHERE status = 1 " +
            "AND MATCH(title, content) AGAINST(${keyword} IN NATURAL LANGUAGE MODE) " +
            "ORDER BY score DESC, create_time DESC " +
            "LIMIT #{limit}")
    @Results({
        @Result(property = "id", column = "id"),
        @Result(property = "title", column = "title"),
        @Result(property = "score", column = "score")
    })
    List<PostScoreVO> fullTextSearch(
        @Param("keyword") String keyword,
        @Param("limit") int limit
    );
}
```

**方案3：Elasticsearch（大数据量场景）**

```java
@Service
@RequiredArgsConstructor
public class SearchService {

    private final ElasticsearchRestTemplate elasticsearchTemplate;

    /**
     * 搜索文章
     */
    public List<Post> search(String keyword) {
        NativeSearchQuery query = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.multiMatchQuery(keyword)
                .field("title")
                .field("content")
                .type(MultiMatchQueryBuilder.Type.BEST_FIELDS)
                .fuzziness(Fuzziness.AUTO))
            .withHighlightFields(
                new HighlightBuilder.Field("title"),
                new HighlightBuilder.Field("content")
            )
            .withPageable(PageRequest.of(0, 20))
            .build();

        SearchHits<Post> hits = elasticsearchTemplate.search(query, Post.class);

        return hits.stream()
            .map(hit -> {
                Post post = hit.getContent();
                // 高亮处理
                if (hit.getHighlightFields().containsKey("title")) {
                    post.setTitle(hit.getHighlightFields().get("title").get(0));
                }
                return post;
            })
            .collect(Collectors.toList());
    }
}
```

**性能对比**：
- **LIKE**：适合数据量小（<1万条）
- **Fulltext**：适合中等数据量（1万-100万），性能提升10倍
- **Elasticsearch**：适合大数据量（>100万），支持分词、高亮、拼音搜索

### Q6: 如何实现用户权限控制（管理员 vs 普通用户）？

**参考答案**：

使用 Spring Security + 自定义注解实现基于角色的权限控制。

**1. Spring Security 配置**

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                // 静态资源允许访问
                .requestMatchers("/static/**", "/css/**", "/js/**").permitAll()
                // 登录注册页面
                .requestMatchers("/login", "/register", "/api/auth/**").permitAll()
                // 管理员页面
                .requestMatchers("/admin/**").hasRole("ADMIN")
                // API接口
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/user/**").hasAnyRole("ADMIN", "USER")
                // 其他需要登录
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationEntryPoint)
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**2. 自定义权限注解**

```java
/**
 * 管理员权限注解
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasRole('ADMIN')")
public @interface RequireAdmin {
}

/**
 * 使用示例
 */
@Controller
@RequestMapping("/admin")
@RequireAdmin  // 类级别：所有方法都需要管理员权限
public class AdminController {

    @GetMapping("/users")
    public String users(Model model) {
        // 自动验证管理员权限
        List<User> users = userService.list();
        model.addAttribute("users", users);
        return "admin/users";
    }

    @PostMapping("/user/{id}/delete")
    @ResponseBody
    @RequireAdmin  // 方法级别：单独验证
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.removeById(id);
        return Result.success();
    }
}
```

**3. Thymeleaf 模板权限控制**

```html
<!-- 引入Spring Security标签 -->
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/thymeleaf-extras-springsecurity5">

<!-- 只对管理员显示 -->
<div sec:authorize="hasRole('ADMIN')">
  <a href="/admin/users">用户管理</a>
  <a href="/admin/settings">系统设置</a>
</div>

<!-- 对所有登录用户显示 -->
<div sec:authorize="isAuthenticated()">
  <span>欢迎，<span sec:authentication="name"></span></span>
  <a href="/logout">登出</a>
</div>

<!-- 显示当前用户角色 -->
<div sec:authorize="hasAnyRole('ADMIN', 'USER')">
  角色：<span sec:authentication="principal.authorities"></span>
</div>
```

**4. 自定义 PermissionEvaluator**

```java
@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {

    @Override
    public boolean hasPermission(
        Authentication auth,
        Serializable targetId,
        String permission
    ) {
        // 检查用户是否有对特定资源的权限
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        // 检查是否为文章作者
        if ("edit".equals(permission)) {
            return postService.isAuthor(targetId, userDetails.getId());
        }

        return false;
    }

    @Override
    public boolean hasPermission(
        Authentication auth,
        Object targetId,
        String permission
    ) {
        return hasPermission(auth, (Serializable) targetId, permission);
    }
}
```

---

## 本章小结

### Java项目核心要点

| 功能模块 | 技术方案 | 关键点 |
|---------|---------|--------|
| **数据库设计** | MySQL 8.0 + 外键约束 | ER图设计、索引优化 |
| **浏览量统计** | Redis 计数器 + 定时同步 | 高性能、数据持久化 |
| **评论系统** | 递归树构建 + Redis缓存 | 多级回复、事务保证 |
| **文章归档** | DATE_FORMAT 分组 | 按日期统计 |
| **搜索功能** | 全文索引 / Elasticsearch | 高性能搜索 |
| **权限控制** | Spring Security + RBAC | 基于角色的访问控制 |

### 面试准备重点

**技术深度**：
- Spring Boot 3.x 新特性
- MyBatis 高级查询和动态SQL
- Redis 缓存策略
- Spring Security 权限管理
- MySQL 索引和优化

**架构能力**：
- 分层架构设计
- 缓存架构设计
- 安全架构设计

---

**小徐带你飞系列教程**

**最后更新：2026年2月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
