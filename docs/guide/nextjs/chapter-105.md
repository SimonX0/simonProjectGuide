# Script优化与资源加载

## Script优化与资源加载

> **学习目标**：掌握Next.js的脚本优化和资源加载策略
> **核心内容**：next/script组件、第三方脚本加载、性能影响、实战案例

### next/script组件

#### 什么是next/script

**next/script** 是Next.js提供的脚本优化组件，可以优化外部脚本的加载方式和时机。

```
┌─────────────────────────────────────────────────────────────┐
│                   Script加载策略                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  策略对比:                                                  │
│  ┌─────────────┬──────────────┬─────────────────────────┐  │
│  │ beforeInteractive │ afterInteractive │ lazyOnload   │  │
│  │ 阻塞页面加载      │ 页面交互后加载    │ 空闲时加载    │  │
│  │ 关键脚本        │ 非关键脚本        │ 低优先级脚本   │  │
│  └─────────────┴──────────────┴─────────────────────────┘  │
│                                                             │
│  性能影响:                                                  │
│  ✓ 优先级管理 - 关键脚本优先加载                            │
│  ✓ 并行加载 - 不阻塞HTML解析                               │
│  ✓ 延迟执行 - 提升首屏加载速度                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 基础用法

**加载外部脚本**：

```typescript
import Script from 'next/script'

export default function Page() {
  return (
    <>
      <h1>欢迎页面</h1>

      {/* 加载Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        strategy="afterInteractive"
      />
    </>
  )
}
```

**内联脚本**：

```typescript
import Script from 'next/script'

export default function Page() {
  return (
    <>
      <h1>页面</h1>

      <Script id="inline-script" strategy="afterInteractive">
        {`
          console.log('这个脚本在页面交互后执行');
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_MEASUREMENT_ID');
        `}
      </Script>
    </>
  )
}
```

#### 加载策略

**beforeInteractive**：

```typescript
import Script from 'next/script'

export default function Analytics() {
  return (
    // 在页面可交互之前加载（极少数情况使用）
    <Script
      src="https://polyfill.io/v3/polyfill.min.js"
      strategy="beforeInteractive"
    />
  )
}
```

**afterInteractive**（推荐）：

```typescript
import Script from 'next/script'

export default function GoogleAnalytics() {
  return (
    // 页面可交互后立即加载（大多数分析脚本）
    <Script
      src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
      strategy="afterInteractive"
    />
  )
}
```

**lazyOnload**：

```typescript
import Script from 'next/script'

export default function ChatWidget() {
  return (
    // 浏览器空闲时加载（聊天插件、社交分享）
    <Script
      src="https://widget.chat.com/embed.js"
      strategy="lazyOnload"
    />
  )
}
```

**worker**（实验性）：

```typescript
import Script from 'next/script'

export default function HeavyScript() {
  return (
    // 在Web Worker中执行（不阻塞主线程）
    <Script
      src="https://example.com/heavy-script.js"
      strategy="worker"
      strategy="lazyOnload"
    />
  )
}
```

### 第三方脚本加载

#### Google Analytics

**GA4集成**：

```typescript
// app/layout.tsx
import Script from 'next/script'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>

      <body>{children}</body>
    </html>
  )
}
```

#### Google Maps

**地图集成**：

```typescript
// app/contact/page.tsx
'use client'

import { useRef, useEffect } from 'react'
import Script from 'next/script'

export default function ContactPage() {
  const mapRef = useRef<HTMLDivElement>(null)

  const initMap = () => {
    if (mapRef.current && window.google) {
      new window.google.maps.Map(mapRef.current, {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
      })
    }
  }

  return (
    <div>
      <h1>联系我们</h1>

      <div ref={mapRef} style={{ height: '400px', width: '100%' }} />

      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&callback=initMap`}
        strategy="lazyOnload"
        onReady={initMap}
      />
    </div>
  )
}
```

#### 社交媒体插件

**Facebook SDK**：

```typescript
// components/FacebookShare.tsx
import Script from 'next/script'

export function FacebookShare() {
  return (
    <>
      <div
        className="fb-share-button"
        data-href={typeof window !== 'undefined' ? window.location.href : ''}
        data-layout="button_count"
        data-size="small"
      >
        <a
          target="_blank"
          href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&amp;src=sdkpreparse"
          className="fb-xfbml-parse-ignore"
        >
          分享
        </a>
      </div>

      <Script
        id="facebook-sdk"
        strategy="lazyOnload"
        onReady={() => {
          if (window.FB) {
            window.FB.XFBML.parse()
          }
        }}
      >
        {`
          window.fbAsyncInit = function() {
            FB.init({
              appId            : 'your-app-id',
              autoLogAppEvents : true,
              xfbml            : true,
              version          : 'v18.0'
            });
          };
        `}
      </Script>

      <Script
        src="https://connect.facebook.net/zh_CN/sdk.js"
        strategy="lazyOnload"
      />
    </>
  )
}
```

**Twitter Widget**：

```typescript
// components/TwitterTimeline.tsx
import Script from 'next/script'

export function TwitterTimeline() {
  return (
    <>
      <a
        className="twitter-timeline"
        data-theme="light"
        href="https://twitter.com/TwitterDev?ref_src=twsrc%5Etfw"
      >
        Tweets by TwitterDev
      </a>

      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onReady={() => {
          if (window.twttr) {
            window.twttr.widgets.load()
          }
        }}
      />
    </>
  )
}
```

### 性能影响

#### 脚本加载时机

**关键渲染路径**：

```typescript
// ✅ 推荐：合理使用策略
export default function Page() {
  return (
    <>
      {/* 1. beforeInteractive - 极少使用 */}
      <Script
        src="/critical-polyfill.js"
        strategy="beforeInteractive"
      />

      {/* 2. afterInteractive - 大多数脚本 */}
      <Script
        src="/analytics.js"
        strategy="afterInteractive"
      />

      {/* 3. lazyOnload - 非关键脚本 */}
      <Script
        src="/chat-widget.js"
        strategy="lazyOnload"
      />
    </>
  )
}
```

#### 预连接提示

**资源提示**：

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 预连接到脚本域名 */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />

        {/* DNS预解析 */}
        <link rel="dns-prefetch" href="https://widget.chat.com" />

        {/* 预加载关键脚本 */}
        <link rel="preload" href="/critical.js" as="script" />
      </head>

      <body>{children}</body>
    </html>
  )
}
```

### 实战案例：脚本优化系统

创建一个完整的第三方脚本管理系统。

#### 1. 环境变量配置

```bash
# .env.local
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_HOTJAR_ID=123456
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...
```

#### 2. 脚本组件库

```typescript
// components/scripts/Analytics.tsx
import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

export function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}

export function GoogleTagManager() {
  if (!GTM_ID) return null

  return (
    <Script id="google-tag-manager" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `}
    </Script>
  )
}
```

```typescript
// components/scripts/Hotjar.tsx
import Script from 'next/script'

const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID

export function Hotjar() {
  if (!HOTJAR_ID) return null

  return (
    <Script id="hotjar" strategy="afterInteractive">
      {`
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
    </Script>
  )
}
```

```typescript
// components/scripts/Intercom.tsx
import Script from 'next/script'

const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID

export function Intercom() {
  if (!INTERCOM_APP_ID) return null

  return (
    <Script id="intercom" strategy="lazyOnload">
      {`
        window.intercomSettings = {
          app_id: "${INTERCOM_APP_ID}"
        };

        (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${INTERCOM_APP_ID}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
      `}
    </Script>
  )
}
```

#### 3. 统一脚本管理器

```typescript
// components/scripts/ScriptManager.tsx
import { GoogleAnalytics, GoogleTagManager } from './Analytics'
import { Hotjar } from './Hotjar'
import { Intercom } from './Intercom'

interface ScriptManagerProps {
  enableAnalytics?: boolean
  enableChat?: boolean
}

export function ScriptManager({
  enableAnalytics = true,
  enableChat = true,
}: ScriptManagerProps) {
  // 开发环境禁用分析
  if (process.env.NODE_ENV === 'development') {
    return null
  }

  return (
    <>
      {/* 分析脚本 */}
      {enableAnalytics && (
        <>
          <GoogleAnalytics />
          <GoogleTagManager />
          <Hotjar />
        </>
      )}

      {/* 聊天脚本 */}
      {enableChat && <Intercom />}
    </>
  )
}
```

#### 4. 在布局中使用

```typescript
// app/layout.tsx
import { ScriptManager } from '@/components/scripts/ScriptManager'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 资源提示 */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://widget.intercom.io" />
      </head>

      <body>
        {children}

        {/* 脚本管理器 */}
        <ScriptManager
          enableAnalytics={process.env.NODE_ENV === 'production'}
          enableChat={true}
        />
      </body>
    </html>
  )
}
```

#### 5. 条件加载

```typescript
// app/(marketing)/layout.tsx
import { ScriptManager } from '@/components/scripts/ScriptManager'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-layout">
      {children}

      {/* 营销页面启用所有脚本 */}
      <ScriptManager
        enableAnalytics={true}
        enableChat={true}
      />
    </div>
  )
}
```

### 最佳实践

#### 1. 策略选择

```tsx
{/* ✅ 推荐：根据脚本重要性选择策略 */}
<Script src="/analytics.js" strategy="afterInteractive" />
<Script src="/chat.js" strategy="lazyOnload" />
<Script src="/polyfill.js" strategy="beforeInteractive" />

{/* ❌ 不推荐：所有脚本都用lazyOnload */}
<Script src="/critical-analytics.js" strategy="lazyOnload" />
```

#### 2. 错误处理

```tsx
{/* ✅ 推荐：处理脚本加载错误 */}
<Script
  src="/script.js"
  strategy="afterInteractive"
  onError={(e) => {
    console.error('Script failed to load:', e)
  }}
  onLoad={() => {
    console.log('Script loaded successfully')
  }}
/>
```

#### 3. 开发环境

```tsx
{/* ✅ 推荐：开发环境禁用分析脚本 */}
{process.env.NODE_ENV === 'production' && (
  <Script src="/analytics.js" strategy="afterInteractive" />
)}
```

### 本章小结

| 知识点 | 内容 | 掌握要求 |
|--------|------|---------|
| next/script | 脚本优化组件 | 熟练掌握 |
| 加载策略 | beforeInteractive、afterInteractive、lazyOnload | 熟练掌握 |
| 第三方脚本 | GA、Maps、社交媒体 | 掌握 |
| 性能优化 | 资源提示、预连接 | 理解 |
| 实际应用 | 脚本管理系统 | 能够实现 |

---

**下一步学习**：建议继续学习[性能优化完全指南](./chapter-106)了解全面的性能优化策略。
