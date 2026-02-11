import{_ as n,o as a,c as p,ag as i}from"./chunks/framework.C63nTIu3.js";const k=JSON.parse('{"title":"第27章：InfluxDB 时序数据库","description":"","frontmatter":{"title":"第27章：InfluxDB 时序数据库"},"headers":[],"relativePath":"db/chapter-27.md","filePath":"db/chapter-27.md","lastUpdated":1770797811000}'),l={name:"db/chapter-27.md"};function e(r,s,t,h,c,u){return a(),p("div",null,[...s[0]||(s[0]=[i(`<h1 id="influxdb-时序数据库" tabindex="-1">：InfluxDB 时序数据库 <a class="header-anchor" href="#influxdb-时序数据库" aria-label="Permalink to &quot;：InfluxDB 时序数据库&quot;">​</a></h1><blockquote><p><strong>难度等级</strong>：⭐⭐⭐ 中高级 | <strong>学习时长</strong>：10小时 | <strong>实战项目</strong>：IoT 监控系统</p></blockquote><h2 id="📚-本章目录" tabindex="-1">📚 本章目录 <a class="header-anchor" href="#📚-本章目录" aria-label="Permalink to &quot;📚 本章目录&quot;">​</a></h2><ul><li><a href="#251-时序数据模型">25.1 时序数据模型</a></li><li><a href="#252-flux-查询语言">25.2 Flux 查询语言</a></li><li><a href="#253-连续查询">25.3 连续查询</a></li><li><a href="#254-数据保留策略">25.4 数据保留策略</a></li><li><a href="#255-集群配置">25.5 集群配置</a></li></ul><hr><h2 id="时序数据模型" tabindex="-1">时序数据模型 <a class="header-anchor" href="#时序数据模型" aria-label="Permalink to &quot;时序数据模型&quot;">​</a></h2><h3 id="什么是时序数据" tabindex="-1">什么是时序数据 <a class="header-anchor" href="#什么是时序数据" aria-label="Permalink to &quot;什么是时序数据&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                  时序数据特征                         │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│  │   时间戳                    │       │</span></span>
<span class="line"><span>│  │   ↓                                           │       │</span></span>
<span class="line"><span>│  │   ●───●───●───●───●───●───●───●───●         │       │</span></span>
<span class="line"><span>│  │   │   │   │   │   │   │   │   │   │         │       │</span></span>
<span class="line"><span>│  │  1s  1s  1s  1s  1s  1s  1s  1s  1s         │       │</span></span>
<span class="line"><span>│  │                                                 │       │</span></span>
<span class="line"><span>│  │   特点：                                       │       │</span></span>
<span class="line"><span>│  │   1. 按时间顺序追加写入                        │       │</span></span>
<span class="line"><span>│  │   2. 很少更新或删除                            │       │</span></span>
<span class="line"><span>│  │   3. 批量写入性能高                            │       │</span></span>
<span class="line"><span>│  │   4. 范围查询（时间范围）                      │       │</span></span>
<span class="line"><span>│  │   5. 聚合分析（求和、平均等）                  │       │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><h3 id="influxdb-数据模型" tabindex="-1">InfluxDB 数据模型 <a class="header-anchor" href="#influxdb-数据模型" aria-label="Permalink to &quot;InfluxDB 数据模型&quot;">​</a></h3><p><strong>核心概念</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│           InfluxDB 数据模型                          │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  Measurement（测量）                                 │</span></span>
<span class="line"><span>│  ├── 相当于关系型数据库的表                          │</span></span>
<span class="line"><span>│  └── 例如：temperature, cpu_usage, humidity         │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  Timestamp（时间戳）                                 │</span></span>
<span class="line"><span>│  ├── 所有数据必须有时间戳                            │</span></span>
<span class="line"><span>│  └── 精度：ns, μs, ms, s, m, h                       │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  Tag（标签）                                         │</span></span>
<span class="line"><span>│  ├── 索引字段，用于快速查询                          │</span></span>
<span class="line"><span>│  ├── String 类型，不可变                            │</span></span>
<span class="line"><span>│  └── 例如：host, region, device_id                  │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  Field（字段）                                       │</span></span>
<span class="line"><span>│  ├── 数据值，不建索引                                │</span></span>
<span class="line"><span>│  ├── Float, Int, String, Boolean                    │</span></span>
<span class="line"><span>│  └── 例如：value, status, message                   │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  Point（数据点）                                     │</span></span>
<span class="line"><span>│  └── 一个时间戳 + Tag + Field 组成                   │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  Series（序列）                                       │</span></span>
<span class="line"><span>│  ├── 相同 Measurement + Tag Set 的数据集合           │</span></span>
<span class="line"><span>│  └── 例如：temperature,host=server1,region=beijing  │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br></div></div><p><strong>数据示例</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># Line Protocol 格式</span></span>
<span class="line"><span>measurement,tag_set field_set timestamp</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 示例1：温度数据</span></span>
<span class="line"><span>temperature,location=room1,sensor=sensor1 value=23.5 1707638400000000000</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 示例2：CPU 使用率</span></span>
<span class="line"><span>cpu,host=server1,region=beijing usage_user=45.2,usage_system=12.3 1707638400000000000</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 示例3：HTTP 请求</span></span>
<span class="line"><span>http_requests,method=GET,status=200,endpoint=/api/users duration=23,code=200 1707638400000000000</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><h3 id="数据写入" tabindex="-1">数据写入 <a class="header-anchor" href="#数据写入" aria-label="Permalink to &quot;数据写入&quot;">​</a></h3><p><strong>使用 CLI 写入</strong>：</p><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 启动 InfluxDB CLI</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 选择数据库</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">use</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mydb</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 写入单条数据</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">temperature,location</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=room1,sensor=sensor1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> value=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">23.5</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 写入多条数据</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">temperature,location</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=room1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> value=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">24.1</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">temperature,location</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=room2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> value=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">22.8</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">humidity,location</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=room1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> value=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">65.2</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 批量写入</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">temperature,location</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=room1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> value=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">23.0</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1707638400000000000</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">temperature,location</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=room1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> value=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">23.5</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1707638460000000000</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">temperature,location</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=room1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> value=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">24.0</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1707638520000000000</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p><strong>使用 HTTP API 写入</strong>：</p><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 写入单条数据</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -XPOST</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;http://localhost:8086/api/v2/write?org=myorg&amp;bucket=mybucket&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --header</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;Authorization: Token mytoken&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --data-binary</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;temperature,location=room1 value=23.5&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 批量写入</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -XPOST</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;http://localhost:8086/api/v2/write?org=myorg&amp;bucket=mybucket&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --header</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;Authorization: Token mytoken&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --data-binary</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> $&#39;temperature,location=room1 value=23.0 1707638400000000000</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">temperature,location=room1 value=23.5 1707638460000000000</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">temperature,location=room1 value=24.0 1707638520000000000&#39;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p><strong>使用 Java Client 写入</strong>：</p><div class="language-java vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// InfluxDB 2.x Java Client</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">InfluxDBClient influxDBClient </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> InfluxDBClientFactory.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">create</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;http://localhost:8086&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;mytoken&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toCharArray</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;myorg&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;mybucket&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">WriteApiBlocking writeApi </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> influxDBClient.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getWriteApiBlocking</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 写入单条数据</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Point point </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Point.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">measurement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;temperature&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addTag</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;location&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;room1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addTag</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;sensor&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;sensor1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addField</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;value&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">23.5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Instant.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">now</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), WritePrecision.NS);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">writeApi.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">writePoint</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(point);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 批量写入</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">List&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Point</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; points </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArrayList&lt;&gt;();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Point p </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Point.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">measurement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;temperature&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addTag</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;location&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;room1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addField</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;value&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Math.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">random</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Instant.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">now</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">minusSeconds</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(i), WritePrecision.NS);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    points.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(p);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">writeApi.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">writePoints</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(points);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br></div></div><hr><h2 id="flux-查询语言" tabindex="-1">Flux 查询语言 <a class="header-anchor" href="#flux-查询语言" aria-label="Permalink to &quot;Flux 查询语言&quot;">​</a></h2><h3 id="flux-基础" tabindex="-1">Flux 基础 <a class="header-anchor" href="#flux-基础" aria-label="Permalink to &quot;Flux 基础&quot;">​</a></h3><p><strong>Flux 语法</strong>：</p><div class="language-flux vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 基本查询结构</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r.location == &quot;room1&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 管道操作符 |&gt; 用于连接函数</span></span>
<span class="line"><span># r 代表每一行记录</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p><strong>基本查询</strong>：</p><div class="language-flux vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 查询最近1小时的数据</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 查询指定时间范围</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: 2024-02-11T00:00:00Z, stop: 2024-02-11T23:59:59Z)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 多条件过滤</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt;</span></span>
<span class="line"><span>      r._measurement == &quot;temperature&quot; and</span></span>
<span class="line"><span>      r.location == &quot;room1&quot; and</span></span>
<span class="line"><span>      r._field == &quot;value&quot;</span></span>
<span class="line"><span>  )</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 查询多个 measurement</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement =~ /^(temperature|humidity)$/)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><h3 id="聚合操作" tabindex="-1">聚合操作 <a class="header-anchor" href="#聚合操作" aria-label="Permalink to &quot;聚合操作&quot;">​</a></h3><div class="language-flux vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 求平均值</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; mean(column: &quot;_value&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 求最大值和最小值</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; max(column: &quot;_value&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; min(column: &quot;_value&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 统计数据点数量</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; count()</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 求和</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -24h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;energy_consumption&quot;)</span></span>
<span class="line"><span>  |&gt; sum(column: &quot;_value&quot;)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><h3 id="窗口聚合" tabindex="-1">窗口聚合 <a class="header-anchor" href="#窗口聚合" aria-label="Permalink to &quot;窗口聚合&quot;">​</a></h3><div class="language-flux vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 按时间窗口聚合（每5分钟）</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(</span></span>
<span class="line"><span>      every: 5m,</span></span>
<span class="line"><span>      fn: mean,</span></span>
<span class="line"><span>      createEmpty: false</span></span>
<span class="line"><span>    )</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 按小时聚合</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -24h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(</span></span>
<span class="line"><span>      every: 1h,</span></span>
<span class="line"><span>      fn: mean,</span></span>
<span class="line"><span>      createEmpty: false</span></span>
<span class="line"><span>    )</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 滑动窗口</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(</span></span>
<span class="line"><span>      every: 5m,</span></span>
<span class="line"><span>      period: 10m,  # 10分钟窗口</span></span>
<span class="line"><span>      fn: mean,</span></span>
<span class="line"><span>      createEmpty: false</span></span>
<span class="line"><span>    )</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 多种聚合函数</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: mean, column: &quot;avg&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: max, column: &quot;max&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: min, column: &quot;min&quot;)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br></div></div><h3 id="数据转换" tabindex="-1">数据转换 <a class="header-anchor" href="#数据转换" aria-label="Permalink to &quot;数据转换&quot;">​</a></h3><div class="language-flux vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 数据类型转换</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; map(fn: (r) =&gt; ({</span></span>
<span class="line"><span>        r with</span></span>
<span class="line"><span>        _value: float(v: r._value)</span></span>
<span class="line"><span>      }))</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 单位转换</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; map(fn: (r) =&gt; ({</span></span>
<span class="line"><span>        r with</span></span>
<span class="line"><span>        _value: r._value * 9.0 / 5.0 + 32.0,  # 摄氏度转华氏度</span></span>
<span class="line"><span>        unit: &quot;F&quot;</span></span>
<span class="line"><span>      }))</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 计算派生字段</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; map(fn: (r) =&gt; ({</span></span>
<span class="line"><span>        r with</span></span>
<span class="line"><span>        alert: r._value &gt; 30.0,</span></span>
<span class="line"><span>        status: if r._value &gt; 30.0 then &quot;high&quot; else &quot;normal&quot;</span></span>
<span class="line"><span>      }))</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 数据合并（join）</span></span>
<span class="line"><span>temperature = from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;value&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>humidity = from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;humidity&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;value&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>join(tables: {temp: temperature, hum: humidity}, on: [&quot;_time&quot;, &quot;location&quot;])</span></span>
<span class="line"><span>  |&gt; map(fn: (r) =&gt; ({</span></span>
<span class="line"><span>        _time: r._time,</span></span>
<span class="line"><span>        _field: &quot;comfort_index&quot;,</span></span>
<span class="line"><span>        location: r.location,</span></span>
<span class="line"><span>        _value: r._value_temp - 0.55 * (1.0 - r._value_hum / 100.0) * (r._value_temp - 14.5)</span></span>
<span class="line"><span>      }))</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br></div></div><h3 id="高级查询" tabindex="-1">高级查询 <a class="header-anchor" href="#高级查询" aria-label="Permalink to &quot;高级查询&quot;">​</a></h3><div class="language-flux vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 移动平均</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; movingAverage(n: 10)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 指数移动平均</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; exponentialMovingAverage(n: 10)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 差分计算（计算变化率）</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; difference(columns: [&quot;_value&quot;])</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 累积求和</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;energy&quot;)</span></span>
<span class="line"><span>  |&gt; cumulativeSum(columns: [&quot;_value&quot;])</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 百分位数</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;response_time&quot;)</span></span>
<span class="line"><span>  |&gt; quantile(column: &quot;_value&quot;, q: 0.95)  # P95</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 分组统计</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; group(columns: [&quot;location&quot;])</span></span>
<span class="line"><span>  |&gt; mean(column: &quot;_value&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 排序</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; sort(columns: [&quot;_value&quot;], desc: true)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Top/Bottom N</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; top(n: 10)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 限制结果数量</span></span>
<span class="line"><span>from(bucket: &quot;mybucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; limit(n: 100)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br></div></div><hr><h2 id="连续查询" tabindex="-1">连续查询 <a class="header-anchor" href="#连续查询" aria-label="Permalink to &quot;连续查询&quot;">​</a></h2><h3 id="什么是连续查询" tabindex="-1">什么是连续查询 <a class="header-anchor" href="#什么是连续查询" aria-label="Permalink to &quot;什么是连续查询&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│            连续查询（Continuous Query）               │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  原始数据（秒级）                                     │</span></span>
<span class="line"><span>│  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐          │</span></span>
<span class="line"><span>│  │23 │24 │25 │26 │25 │24 │23 │22 │21 │20 │          │</span></span>
<span class="line"><span>│  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘          │</span></span>
<span class="line"><span>│       │                                               │</span></span>
<span class="line"><span>│       │ 自动聚合（每5分钟）                           │</span></span>
<span class="line"><span>│       ▼                                               │</span></span>
<span class="line"><span>│  聚合数据（5分钟级）                                  │</span></span>
<span class="line"><span>│  ┌───────┬───────┬───────┐                          │</span></span>
<span class="line"><span>│  │ 23.8  │ 25.0  │ 21.5  │                          │</span></span>
<span class="line"><span>│  └───────┴───────┴───────┘                          │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  优点：                                             │</span></span>
<span class="line"><span>│  ✅ 自动降采样，减少存储空间                         │</span></span>
<span class="line"><span>│  ✅ 提升查询性能（预计算）                           │</span></span>
<span class="line"><span>│  ✅ 保留不同粒度的数据                               │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br></div></div><h3 id="创建连续查询" tabindex="-1">创建连续查询 <a class="header-anchor" href="#创建连续查询" aria-label="Permalink to &quot;创建连续查询&quot;">​</a></h3><p><strong>InfluxDB 2.x 使用 Tasks</strong>：</p><div class="language-flux vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 创建任务（连续查询）</span></span>
<span class="line"><span>option task = {</span></span>
<span class="line"><span>  name: &quot;downsample_temperature&quot;,</span></span>
<span class="line"><span>  every: 5m,</span></span>
<span class="line"><span>  delay: 1m</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 定义任务逻辑</span></span>
<span class="line"><span>from(bucket: &quot;raw_data&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -5m)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: mean, createEmpty: false)</span></span>
<span class="line"><span>  |&gt; to(bucket: &quot;downsampled_data&quot;, org: &quot;myorg&quot;)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p><strong>使用 CLI 创建任务</strong>：</p><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 创建任务文件</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cat</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /tmp/downsample_temperature.flux</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;EOF&#39;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">option task = {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  name: &quot;downsample_temperature&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  every: 5m,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  delay: 1m</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">from(bucket: &quot;raw_data&quot;)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  |&gt; range(start: -5m)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  |&gt; aggregateWindow(every: 5m, fn: mean, createEmpty: false)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  |&gt; to(bucket: &quot;downsampled_data&quot;, org: &quot;myorg&quot;)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">EOF</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 应用任务</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> task</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --file</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /tmp/downsample_temperature.flux</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看所有任务</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> task</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看任务详情</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> task</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> find</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> downsample_temperature</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看任务运行日志</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> task</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> logs</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> downsample_temperature</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 删除任务</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> task</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> delete</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> downsample_temperature</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br></div></div><h3 id="多级降采样" tabindex="-1">多级降采样 <a class="header-anchor" href="#多级降采样" aria-label="Permalink to &quot;多级降采样&quot;">​</a></h3><div class="language-flux vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 1级：5分钟聚合（保存7天）</span></span>
<span class="line"><span>option task = { name: &quot;downsample_5m&quot;, every: 1m }</span></span>
<span class="line"><span>from(bucket: &quot;raw_data&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1m)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: mean, createEmpty: false)</span></span>
<span class="line"><span>  |&gt; set(key: &quot;agg_level&quot;, value: &quot;5m&quot;)</span></span>
<span class="line"><span>  |&gt; to(bucket: &quot;agg_5m&quot;, org: &quot;myorg&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 2级：1小时聚合（保存30天）</span></span>
<span class="line"><span>option task = { name: &quot;downsample_1h&quot;, every: 5m }</span></span>
<span class="line"><span>from(bucket: &quot;agg_5m&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -5m)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 1h, fn: mean, createEmpty: false)</span></span>
<span class="line"><span>  |&gt; set(key: &quot;agg_level&quot;, value: &quot;1h&quot;)</span></span>
<span class="line"><span>  |&gt; to(bucket: &quot;agg_1h&quot;, org: &quot;myorg&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 3级：1天聚合（保存365天）</span></span>
<span class="line"><span>option task = { name: &quot;downsample_1d&quot;, every: 1h }</span></span>
<span class="line"><span>from(bucket: &quot;agg_1h&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;temperature&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 1d, fn: mean, createEmpty: false)</span></span>
<span class="line"><span>  |&gt; set(key: &quot;agg_level&quot;, value: &quot;1d&quot;)</span></span>
<span class="line"><span>  |&gt; to(bucket: &quot;agg_1d&quot;, org: &quot;myorg&quot;)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br></div></div><hr><h2 id="数据保留策略" tabindex="-1">数据保留策略 <a class="header-anchor" href="#数据保留策略" aria-label="Permalink to &quot;数据保留策略&quot;">​</a></h2><h3 id="保留策略配置" tabindex="-1">保留策略配置 <a class="header-anchor" href="#保留策略配置" aria-label="Permalink to &quot;保留策略配置&quot;">​</a></h3><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 创建 Bucket 时设置保留策略</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bucket</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mybucket</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --org</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> myorg</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --retention</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 7d</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 保留7天</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 更新保留策略</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bucket</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mybucket</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --org</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> myorg</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --retention</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 30d</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看所有 Bucket</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bucket</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> list</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看 Bucket 详情</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bucket</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> find</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mybucket</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 删除 Bucket</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bucket</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> delete</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mybucket</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><h3 id="多级保留策略" tabindex="-1">多级保留策略 <a class="header-anchor" href="#多级保留策略" aria-label="Permalink to &quot;多级保留策略&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│           多级数据保留策略                           │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  raw_data (原始数据)                                 │</span></span>
<span class="line"><span>│  ├── 保留 7 天                                       │</span></span>
<span class="line"><span>│  ├── 秒级精度                                        │</span></span>
<span class="line"><span>│  └── 数据量大                                        │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  agg_5m (5分钟聚合)                                  │</span></span>
<span class="line"><span>│  ├── 保留 30 天                                      │</span></span>
<span class="line"><span>│  ├── 5分钟精度                                       │</span></span>
<span class="line"><span>│  └── 数据量中等                                      │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  agg_1h (1小时聚合)                                  │</span></span>
<span class="line"><span>│  ├── 保留 365 天                                     │</span></span>
<span class="line"><span>│  ├── 1小时精度                                       │</span></span>
<span class="line"><span>│  └── 数据量小                                        │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  agg_1d (1天聚合)                                    │</span></span>
<span class="line"><span>│  ├── 永久保留                                        │</span></span>
<span class="line"><span>│  ├── 1天精度                                         │</span></span>
<span class="line"><span>│  └── 数据量最小                                      │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br></div></div><h3 id="数据生命周期管理" tabindex="-1">数据生命周期管理 <a class="header-anchor" href="#数据生命周期管理" aria-label="Permalink to &quot;数据生命周期管理&quot;">​</a></h3><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 创建不同保留周期的 Bucket</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bucket</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> raw_data</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --retention</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 7d</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bucket</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> agg_5m</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --retention</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 30d</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bucket</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> agg_1h</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --retention</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 365d</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> bucket</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> agg_1d</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --retention</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 永久保留</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 配置连续查询自动降采样</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># (参考上一节的连续查询配置)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><hr><h2 id="集群配置" tabindex="-1">集群配置 <a class="header-anchor" href="#集群配置" aria-label="Permalink to &quot;集群配置&quot;">​</a></h2><h3 id="influxdb-enterprise-集群" tabindex="-1">InfluxDB Enterprise 集群 <a class="header-anchor" href="#influxdb-enterprise-集群" aria-label="Permalink to &quot;InfluxDB Enterprise 集群&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│         InfluxDB Enterprise 集群架构                  │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│  │           Meta 节点（3个）                │       │</span></span>
<span class="line"><span>│  │  （集群元数据管理）                        │       │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│  │         Data 节点（3个）                 │       │</span></span>
<span class="line"><span>│  │  ┌─────────┬─────────┬─────────┐         │       │</span></span>
<span class="line"><span>│  │  │ Data 1  │ Data 2  │ Data 3  │         │       │</span></span>
<span class="line"><span>│  │  │ (Shard) │ (Shard) │ (Shard) │         │       │</span></span>
<span class="line"><span>│  │  └─────────┴─────────┴─────────┘         │       │</span></span>
<span class="line"><span>│  │                                          │       │</span></span>
<span class="line"><span>│  │  数据分片存储（按时间分片）                │       │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────┐       │</span></span>
<span class="line"><span>│  │         Data 节点副本（3个）              │       │</span></span>
<span class="line"><span>│  │  ┌─────────┬─────────┬─────────┐         │       │</span></span>
<span class="line"><span>│  │  │ Data 4  │ Data 5  │ Data 6  │         │       │</span></span>
<span class="line"><span>│  │  │ (Replica)│(Replica)│(Replica)│         │       │</span></span>
<span class="line"><span>│  │  └─────────┴─────────┴─────────┘         │       │</span></span>
<span class="line"><span>│  │                                          │       │</span></span>
<span class="line"><span>│  │  数据副本存储（冗余备份）                  │       │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────┘       │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br></div></div><h3 id="集群配置-1" tabindex="-1">集群配置 <a class="header-anchor" href="#集群配置-1" aria-label="Permalink to &quot;集群配置&quot;">​</a></h3><div class="language-toml vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">toml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># influxdb.conf</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">meta</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # Meta 节点配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  enabled = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bind-address = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;:8089&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  http-bind-address = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;:8091&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  https-enabled = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  https-certificate = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/etc/ssl/influxdb.pem&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # Data 节点配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  enabled = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 集群配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  internal-shared-secret = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;long-passphrase-here&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  meta-join = [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;meta1:8091&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;meta2:8091&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;meta3:8091&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 分片配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  shard-precreation = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  max-shard-groups = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10000</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  max-shards-per-group = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 副本配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  max-series-per-database = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10000000</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  max-values-per-tag = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">coordinator</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 查询配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  write-timeout = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;10s&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  max-concurrent-queries = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">retention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 保留策略检查间隔</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  check-interval = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;30m&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">monitor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 监控配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  store-enabled = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br></div></div><h3 id="集群管理" tabindex="-1">集群管理 <a class="header-anchor" href="#集群管理" aria-label="Permalink to &quot;集群管理&quot;">​</a></h3><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 添加 Data 节点</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influxd-ctl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add-data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">data-node-add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">r</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 添加 Meta 节点</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influxd-ctl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add-meta</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">meta-node-add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">r</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看集群状态</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influxd-ctl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> show</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看节点</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influxd-ctl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> show-nodes</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 复制分片</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influxd-ctl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> copy-shard</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">shard-i</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">from-nod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">to-nod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 删除分片</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influxd-ctl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> delete-shard</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">shard-i</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><hr><h2 id="✅-本章小结" tabindex="-1">✅ 本章小结 <a class="header-anchor" href="#✅-本章小结" aria-label="Permalink to &quot;✅ 本章小结&quot;">​</a></h2><h3 id="学习检查清单" tabindex="-1">学习检查清单 <a class="header-anchor" href="#学习检查清单" aria-label="Permalink to &quot;学习检查清单&quot;">​</a></h3><p>完成本章学习后，请确认你能够：</p><ul><li>[ ] 理解时序数据的特点和模型</li><li>[ ] 掌握 InfluxDB 的核心概念（Measurement、Tag、Field）</li><li>[ ] 使用 Flux 语言进行复杂查询</li><li>[ ] 实现连续查询（降采样）</li><li>[ ] 配置数据保留策略</li><li>[ ] 设计多级降采样方案</li><li>[ ] 部署和管理 InfluxDB 集群</li></ul><h3 id="核心要点回顾" tabindex="-1">核心要点回顾 <a class="header-anchor" href="#核心要点回顾" aria-label="Permalink to &quot;核心要点回顾&quot;">​</a></h3><ol><li><strong>数据模型</strong>：Measurement（测量）、Tag（标签）、Field（字段）</li><li><strong>Flux 查询</strong>：强大的函数式查询语言</li><li><strong>连续查询</strong>：自动降采样，提升性能</li><li><strong>保留策略</strong>：多级存储，平衡成本和查询需求</li><li><strong>集群架构</strong>：Meta 节点 + Data 节点，支持横向扩展</li></ol><h2 id="📚-延伸阅读" tabindex="-1">📚 延伸阅读 <a class="header-anchor" href="#📚-延伸阅读" aria-label="Permalink to &quot;📚 延伸阅读&quot;">​</a></h2><ul><li><a href="./chapter-27.html">第28章：TDengine IoT 数据库 →</a></li><li><a href="./chapter-28.html">第29章：Milvus 向量数据库 →</a></li><li><a href="https://docs.influxdata.com/" target="_blank" rel="noreferrer">InfluxDB 官方文档</a></li><li><a href="https://docs.influxdata.com/flux/v0.x/" target="_blank" rel="noreferrer">Flux 查询指南</a></li></ul><hr><p><strong>更新时间</strong>：2026年2月 | <strong>版本</strong>：v1.0</p>`,73)])])}const m=n(l,[["render",e]]);export{k as __pageData,m as default};
