# useCookie与useHead

## useCookie与useHead

> **为什么要学这一章?**
>
> Web应用需要管理用户数据和优化搜索引擎表现。`useCookie`让你便捷地操作浏览器Cookie,实现用户会话管理和偏好设置。`useHead`则提供了强大的SEO优化能力,让你动态管理页面元数据。掌握这两个工具能显著提升应用的用户体验和搜索引擎可见性。
>
> **学习目标**:
>
> - 深入掌握 useCookie 的高级用法
> - 学会使用 useHead 管理页面元数据
> - 理解SEO优化的重要性和实现方法
> - 掌握Open Graph和Twitter Cards配置
> - 能够构建SEO友好的应用

---

### useCookie 深入

#### Cookie安全配置

在生产环境中,Cookie安全至关重要:

```vue
<script setup lang="ts>
// 安全的Cookie配置示例
const secureCookie = useCookie('secure-token', {
  // Cookie有效期(秒)
  maxAge: 60 * 60 * 24 * 7, // 7天

  // 或使用具体日期
  expires: new Date('2024-12-31'),

  // Cookie路径(默认为'/')
  path: '/',

  // Cookie域名(用于跨子域共享)
  domain: '.example.com',

  // 仅HTTPS传输(生产环境必须启用)
  secure: process.env.NODE_ENV === 'production',

  // 防止XSS攻击
  httpOnly: false, // 客户端需要访问时设为false

  // CSRF保护
  sameSite: 'strict' // 'strict' | 'lax' | 'none'

  // 仅在服务端设置的Cookie
  // httpOnly: true // 客户端JS无法访问
})
</script>
```

#### SameSite策略详解

```typescript
// composables/useSecureCookie.ts
export const useSecureCookie = () => {
  // 认证Token - 严格模式
  const authToken = useCookie('auth-token', {
    maxAge: 60 * 60 * 24 * 7,
    secure: true,
    sameSite: 'strict', // 最严格,防止CSRF
    httpOnly: true // 仅服务端可访问
  })

  // 会话ID - Lax模式(允许外部链接携带)
  const sessionId = useCookie('session-id', {
    maxAge: 60 * 60 * 24,
    secure: true,
    sameSite: 'lax', // 允许从外部站点导航时携带
    httpOnly: true
  })

  // 用户偏好 - None模式(跨域)
  const preferences = useCookie('preferences', {
    maxAge: 60 * 60 * 24 * 365,
    secure: true,
    sameSite: 'none' // 跨域使用(需要secure: true)
  })

  // 分析Cookie - 基础配置
  const analytics = useCookie('analytics-id', {
    maxAge: 60 * 60 * 24 * 30,
    secure: false, // 开发环境可设为false
    sameSite: 'lax'
  })

  return {
    authToken,
    sessionId,
    preferences,
    analytics
  }
}
</script>
```

#### Cookie操作工具函数

```typescript
// utils/cookie.ts
export const useCookieUtils = () => {
  // 设置Cookie
  const setCookie = (
    name: string,
    value: any,
    options: any = {}
  ) => {
    const cookie = useCookie(name, options)
    cookie.value = value
  }

  // 获取Cookie
  const getCookie = (name: string) => {
    return useCookie(name).value
  }

  // 删除Cookie
  const removeCookie = (name: string) => {
    const cookie = useCookie(name)
    cookie.value = null
  }

  // 批量删除Cookie
  const clearAllCookies = (prefix = '') => {
    const cookies = document.cookie.split(';')

    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=')

      if (name.startsWith(prefix)) {
        removeCookie(name)
      }
    })
  }

  // Cookie存在检查
  const hasCookie = (name: string): boolean => {
    return useCookie(name).value !== null
  }

  // JSON Cookie
  const setJsonCookie = (name: string, value: any, options?: any) => {
    setCookie(name, JSON.stringify(value), options)
  }

  const getJsonCookie = <T>(name: string): T | null => {
    const value = getCookie(name)
    if (!value) return null

    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  return {
    setCookie,
    getCookie,
    removeCookie,
    clearAllCookies,
    hasCookie,
    setJsonCookie,
    getJsonCookie
  }
}
</script>
```

---

### useHead SEO优化

#### 基础用法

`useHead` 允许你动态管理页面的`<head>`标签:

```vue
<template>
  <div>
    <h1>{{ article.title }}</h1>
    <p>{{ article.content }}</p>
  </div>
</template>

<script setup lang="ts>
const article = {
  title: 'Nuxt 3 SEO优化指南',
  description: '学习如何在Nuxt 3中优化SEO,提升搜索引擎排名',
  keywords: ['Nuxt', 'SEO', 'Vue', 'SSR'],
  author: '张三',
  image: 'https://example.com/og-image.jpg'
}

// 设置页面元数据
useHead({
  // 页面标题
  title: article.title,

  // 元标签
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: article.description },
    { name: 'keywords', content: article.keywords.join(', ') },
    { name: 'author', content: article.author },

    // Open Graph (Facebook/LinkedIn)
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: article.title },
    { property: 'og:description', content: article.description },
    { property: 'og:image', content: article.image },
    { property: 'og:url', content: `https://example.com/article/1` },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: article.title },
    { name: 'twitter:description', content: article.description },
    { name: 'twitter:image', content: article.image }
  ],

  // 链接标签
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'canonical', href: `https://example.com/article/1` }
  ],

  // 脚本标签
  script: [
    {
      innerHTML: `{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${article.title}",
        "author": {
          "@type": "Person",
          "name": "${article.author}"
        }
      }`
    }
  ],

  // 样式标签
  style: [
    {
      innerHTML: `
        body {
          font-family: system-ui, -apple-system, sans-serif;
        }
      `
    }
  ],

  // HTML属性
  htmlAttrs: {
    lang: 'zh-CN'
  },

  // Body属性
  bodyAttrs: {
    class: 'article-page'
  }
})
</script>
```

#### 动态元数据

```vue
<!-- pages/blog/[slug].vue -->
<template>
  <article>
    <h1>{{ post?.title }}</h1>
    <p>{{ post?.content }}</p>
  </article>
</template>

<script setup lang="ts>
const route = useRoute()

// 获取文章数据
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)

// 动态设置元数据
useHead({
  title: computed(() => post.value?.title || '文章详情'),
  meta: [
    {
      name: 'description',
      content: computed(() => post.value?.excerpt || '')
    },
    {
      property: 'og:title',
      content: computed(() => post.value?.title || '')
    },
    {
      property: 'og:image',
      content: computed(() => post.value?.cover || '/default-og.jpg')
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: computed(() => `https://example.com/blog/${route.params.slug}`)
    }
  ]
})

// 或者使用useHead便利函数
useSeoMeta({
  title: post.value?.title,
  ogTitle: post.value?.title,
  description: post.value?.excerpt,
  ogDescription: post.value?.excerpt,
  ogImage: post.value?.cover,
  twitterCard: 'summary_large_image'
})
</script>
```

#### 使用useSeoMeta

`useSeoMeta` 是 `useHead` 的便捷函数,专门用于SEO:

```vue
<script setup lang="ts>
const post = {
  title: 'Nuxt 3 完全指南',
  description: '从零开始学习Nuxt 3框架',
  image: 'https://example.com/cover.jpg',
  publishDate: '2024-01-15'
}

useSeoMeta({
  // 基础
  title: post.title,
  description: post.description,

  // Open Graph
  ogTitle: post.title,
  ogDescription: post.description,
  ogImage: post.image,
  ogType: 'article',

  // Twitter
  twitterCard: 'summary_large_image',
  twitterTitle: post.title,
  twitterDescription: post.description,
  twitterImage: post.image,

  // 文章特定
  articleAuthor: '张三',
  articlePublishedTime: post.publishDate,
  articleModifiedTime: post.publishDate,

  // 其他
  robots: 'index, follow'
})
</script>
```

---

### 元数据管理

#### 全局默认元数据

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',

      title: '我的Nuxt应用',

      meta: [
        { name: 'description', content: 'Nuxt 3应用描述' },
        { name: 'keywords', content: 'Nuxt, Vue, SSR' },
        { name: 'author', content: '作者名' },

        // 默认Open Graph
        { property: 'og:site_name', content: '我的Nuxt应用' },
        { property: 'og:type', content: 'website' },

        // 默认Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@username' }
      ],

      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter&display=swap' }
      ],

      script: [
        { src: 'https://analytics.example.com/script.js', defer: true }
      ]
    }
  }
})
```

#### 页面级元数据覆盖

```vue
<!-- pages/index.vue -->
<script setup lang="ts>
// 覆盖全局元数据
useHead({
  title: '首页 - 我的Nuxt应用',

  meta: [
    { name: 'description', content: '首页特定的描述' },
    { name: 'keywords', content: '首页,关键词' }
  ]
})

// 或使用titleTemplate动态生成
useHead({
  title: '首页',
  titleTemplate: '%s - 我的Nuxt应用'
})
</script>
```

#### 组件级元数据

```vue
<!-- components/BreadcrumbList.vue -->
<template>
  <nav class="breadcrumb">
    <ul>
      <li v-for="(item, index) in items" :key="index">
        {{ item.name }}
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts>
const props = defineProps<{
  items: Array<{ name: string; url: string }>
}>()

// 添加结构化数据
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: props.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `https://example.com${item.url}`
        }))
      })
    }
  ]
})
</script>
```

---

### 实战案例:SEO优化页面

让我们构建一个完整的SEO友好的博客文章页面。

#### 1. SEO优化配置

```typescript
// composables/useSeo.ts
export const useSeo = () => {
  const config = useRuntimeConfig()
  const route = useRoute()

  // 基础URL
  const baseUrl = config.public.siteUrl || 'https://example.com'

  // 生成完整URL
  const fullUrl = (path: string) => {
    return `${baseUrl}${path}`
  }

  // 生成文章SEO元数据
  const generateArticleSeo = (article: {
    title: string
    excerpt: string
    cover?: string
    author?: string
    publishedAt?: string
    modifiedAt?: string
    tags?: string[]
  }) => {
    const url = fullUrl(route.path)

    useHead({
      title: article.title,
      link: [
        { rel: 'canonical', href: url }
      ]
    })

    useSeoMeta({
      // 基础
      title: article.title,
      description: article.excerpt,

      // Open Graph
      ogTitle: article.title,
      ogDescription: article.excerpt,
      ogImage: article.cover || `${baseUrl}/default-og.jpg`,
      ogType: 'article',
      ogUrl: url,

      // Article
      articleAuthor: article.author,
      articlePublishedTime: article.publishedAt,
      articleModifiedTime: article.modifiedAt,
      articleTag: article.tags,

      // Twitter
      twitterCard: 'summary_large_image',
      twitterTitle: article.title,
      twitterDescription: article.excerpt,
      twitterImage: article.cover || `${baseUrl}/default-og.jpg`
    })

    // 添加结构化数据
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.excerpt,
            image: article.cover,
            author: {
              '@type': 'Person',
              name: article.author
            },
            datePublished: article.publishedAt,
            dateModified: article.modifiedAt,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': url
            }
          })
        }
      ]
    })
  }

  // 生成产品SEO元数据
  const generateProductSeo = (product: {
    name: string
    description: string
    image?: string
    price?: number
    currency?: string
    availability?: string
  }) => {
    const url = fullUrl(route.path)

    useHead({
      title: product.name,
      link: [
        { rel: 'canonical', href: url }
      ]
    })

    useSeoMeta({
      title: product.name,
      description: product.description,
      ogTitle: product.name,
      ogDescription: product.description,
      ogImage: product.image,
      ogType: 'product',
      ogUrl: url,
      twitterCard: 'summary_large_image',
      twitterTitle: product.name,
      twitterDescription: product.description,
      twitterImage: product.image
    })

    // Product结构化数据
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.image,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: product.currency || 'CNY',
              availability: product.availability
            }
          })
        }
      ]
    })
  }

  return {
    generateArticleSeo,
    generateProductSeo,
    fullUrl
  }
}
</script>
```

#### 2. 博客文章页面

```vue
<!-- pages/blog/[slug].vue -->
<template>
  <article class="blog-post">
    <!-- 文章头部 -->
    <header class="post-header">
      <!-- 面包屑 -->
      <BreadcrumbList :items="breadcrumbs" />

      <!-- 分类标签 -->
      <div class="categories">
        <NuxtLink
          v-for="category in post?.categories"
          :key="category"
          :to="`/blog?category=${category}`"
          class="category-tag"
        >
          {{ category }}
        </NuxtLink>
      </div>

      <!-- 标题 -->
      <h1>{{ post?.title }}</h1>

      <!-- 元信息 -->
      <div class="post-meta">
        <span class="author">
          <img :src="post?.author.avatar" :alt="post?.author.name" />
          {{ post?.author.name }}
        </span>
        <span class="date">
          {{ formatDate(post?.publishedAt) }}
        </span>
        <span class="reading-time">
          阅读时间: {{ post?.readingTime }} 分钟
        </span>
      </div>

      <!-- 社交分享 -->
      <div class="social-share">
        <button @click="shareOnTwitter">Twitter</button>
        <button @click="shareOnFacebook">Facebook</button>
        <button @click="copyLink">复制链接</button>
      </div>
    </header>

    <!-- 封面图 -->
    <div v-if="post?.cover" class="post-cover">
      <img :src="post.cover" :alt="post.title" />
    </div>

    <!-- 文章内容 -->
    <div class="post-content" v-html="post?.content"></div>

    <!-- 标签 -->
    <div class="post-tags">
      <NuxtLink
        v-for="tag in post?.tags"
        :key="tag"
        :to="`/blog?tag=${tag}`"
        class="tag"
      >
        #{{ tag }}
      </NuxtLink>
    </div>

    <!-- 作者信息 -->
    <div class="author-box">
      <img :src="post?.author.avatar" :alt="post?.author.name" />
      <div class="author-info">
        <h3>{{ post?.author.name }}</h3>
        <p>{{ post?.author.bio }}</p>
      </div>
    </div>

    <!-- 相关文章 -->
    <section class="related-posts">
      <h2>相关文章</h2>
      <div class="post-grid">
        <PostCard
          v-for="related in relatedPosts"
          :key="related.id"
          :post="related"
        />
      </div>
    </section>
  </article>
</template>

<script setup lang="ts>
const route = useRoute()
const { generateArticleSeo } = useSeo()

// 获取文章数据
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)

// 获取相关文章
const { data: relatedPosts } = await useLazyFetch(
  `/api/posts/${route.params.slug}/related`
)

// 面包屑
const breadcrumbs = computed(() => [
  { name: '首页', url: '/' },
  { name: '博客', url: '/blog' },
  { name: post.value?.title || '文章', url: route.path }
])

// 生成SEO元数据
watchEffect(() => {
  if (post.value) {
    generateArticleSeo({
      title: post.value.title,
      excerpt: post.value.excerpt,
      cover: post.value.cover,
      author: post.value.author.name,
      publishedAt: post.value.publishedAt,
      modifiedAt: post.value.modifiedAt,
      tags: post.value.tags
    })
  }
})

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 社交分享
const shareOnTwitter = () => {
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(post.value?.title || '')
  window.open(
    `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    '_blank'
  )
}

const shareOnFacebook = () => {
  const url = encodeURIComponent(window.location.href)
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    '_blank'
  )
}

const copyLink = async () => {
  await navigator.clipboard.writeText(window.location.href)
  alert('链接已复制')
}
</script>

<style scoped>
.blog-post {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.post-header {
  margin-bottom: 2rem;
}

.categories {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.category-tag {
  padding: 0.25rem 0.75rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  font-size: 0.875rem;
}

.post-header h1 {
  font-size: 2.5rem;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  gap: 2rem;
  color: #666;
  font-size: 0.875rem;
}

.author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.social-share {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.social-share button {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.post-cover {
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  height: auto;
}

.post-content {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #333;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  margin: 2rem 0;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #f0f0f0;
  text-decoration: none;
  border-radius: 20px;
  font-size: 0.875rem;
  color: #666;
}

.author-box {
  display: flex;
  gap: 1rem;
  padding: 2rem;
  background: #f5f5f5;
  border-radius: 12px;
  margin: 2rem 0;
}

.author-box img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.related-posts {
  margin-top: 3rem;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}
</style>
```

#### 3. 性能监控集成

```vue
<!-- components/Analytics.vue -->
<template>
  <div></div>
</template>

<script setup lang="ts>
const config = useRuntimeConfig()
const route = useRoute()

// Google Analytics
useHead({
  script: [
    {
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.public.gaId}');
      `
    }
  ],
  link: [
    {
      rel: 'preconnect',
      href: 'https://www.googletagmanager.com'
    }
  ]
})

// 页面浏览追踪
onMounted(() => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: route.path
    })
  }
})
</script>
```

---

### 结构化数据

#### JSON-LD示例

```typescript
// utils/structured-data.ts
export const generateOrganizationData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '公司名称',
    url: 'https://example.com',
    logo: 'https://example.com/logo.png',
    sameAs: [
      'https://twitter.com/company',
      'https://facebook.com/company',
      'https://linkedin.com/company'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+86-xxx-xxxx-xxxx',
      contactType: 'customer service'
    }
  }
}

export const generateWebsiteData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '网站名称',
    url: 'https://example.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://example.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }
}

export const generateFAQData = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}
</script>
```

---

### 本章小结

#### SEO优化检查清单

| 项目 | 说明 | 重要性 |
|------|------|--------|
| **页面标题** | 唯一且描述性强 | ⭐⭐⭐⭐⭐ |
| **Meta描述** | 准确描述页面内容 | ⭐⭐⭐⭐⭐ |
| **Canonical URL** | 避免重复内容 | ⭐⭐⭐⭐ |
| **Open Graph** | 社交媒体分享 | ⭐⭐⭐⭐ |
| **Twitter Card** | Twitter分享优化 | ⭐⭐⭐ |
| **结构化数据** | 搜索引擎理解 | ⭐⭐⭐⭐ |
| **移动友好** | 响应式设计 | ⭐⭐⭐⭐⭐ |
| **页面速度** | 快速加载 | ⭐⭐⭐⭐⭐ |

#### Cookie最佳实践

1. **安全性**: 生产环境启用secure和httpOnly
2. **SameSite**: 根据场景选择合适的策略
3. **有效期**: 根据需求设置合理的maxAge
4. **大小限制**: 单个Cookie不超过4KB
5. **隐私合规**: 遵守GDPR等隐私法规

#### SEO最佳实践

1. **服务端渲染**: 确保搜索引擎能抓取内容
2. **语义化HTML**: 使用正确的HTML标签
3. **结构化数据**: 帮助搜索引擎理解内容
4. **页面性能**: 提升用户体验和排名
5. **移动优化**: 确保移动端友好

---

**下一步学习**: 建议继续学习[Pinia状态管理集成](./chapter-121)掌握Nuxt中的状态管理。
