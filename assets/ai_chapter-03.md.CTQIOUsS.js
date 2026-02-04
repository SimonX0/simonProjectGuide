import{_ as p,o as i,c as l,ag as a,j as s,a as e}from"./chunks/framework.C63nTIu3.js";const d=JSON.parse('{"title":"第3章：Prompt Engineering技巧","description":"","frontmatter":{},"headers":[],"relativePath":"ai/chapter-03.md","filePath":"ai/chapter-03.md","lastUpdated":1770206068000}'),r={name:"ai/chapter-03.md"};function t(h,n,c,b,k,u){return i(),l("div",null,[...n[0]||(n[0]=[a(`<h1 id="第3章-prompt-engineering技巧" tabindex="-1">第3章：Prompt Engineering技巧 <a class="header-anchor" href="#第3章-prompt-engineering技巧" aria-label="Permalink to &quot;第3章：Prompt Engineering技巧&quot;">​</a></h1><h2 id="本章导读" tabindex="-1">本章导读 <a class="header-anchor" href="#本章导读" aria-label="Permalink to &quot;本章导读&quot;">​</a></h2><p><strong>Prompt Engineering（提示词工程）</strong> 是AI应用开发中最重要的技能之一。好的提示词能让AI发挥出强大能力，而不好的提示词则会导致模糊、不准确的回答。</p><p>本章将系统介绍如何设计高效的提示词，让你的AI应用效果提升10倍！</p><p><strong>学习目标</strong>：</p><ul><li>理解Prompt Engineering的核心原则</li><li>掌握常用的提示词模式</li><li>学习Few-shot Learning技巧</li><li>实现高级提示词策略</li></ul><p><strong>预计学习时间</strong>：50分钟</p><hr><h2 id="_3-1-什么是prompt-engineering" tabindex="-1">3.1 什么是Prompt Engineering？ <a class="header-anchor" href="#_3-1-什么是prompt-engineering" aria-label="Permalink to &quot;3.1 什么是Prompt Engineering？&quot;">​</a></h2><h3 id="_3-1-1-prompt-engineering的定义" tabindex="-1">3.1.1 Prompt Engineering的定义 <a class="header-anchor" href="#_3-1-1-prompt-engineering的定义" aria-label="Permalink to &quot;3.1.1 Prompt Engineering的定义&quot;">​</a></h3><p><strong>Prompt Engineering</strong> 是指通过设计和优化输入给大语言模型的提示词，以引导模型生成更准确、更相关、更符合预期的输出的技术。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────┐</span></span>
<span class="line"><span>│      Prompt Engineering 的价值            │</span></span>
<span class="line"><span>├─────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                          │</span></span>
<span class="line"><span>│  ❌ 差的Prompt：                          │</span></span>
<span class="line"><span>│  &quot;写个爬虫&quot;                              │</span></span>
<span class="line"><span>│  → 结果：可能是网页爬虫、图片爬虫...       │</span></span>
<span class="line"><span>│                                          │</span></span>
<span class="line"><span>│  ✅ 好的Prompt：                          │</span></span>
<span class="line"><span>│  &quot;请用Python写一个网页爬虫，要求：         │</span></span>
<span class="line"><span>│   - 使用requests库                        │</span></span>
<span class="line"><span>│   - 支持user-agent设置                    │</span></span>
<span class="line"><span>│   - 包含错误处理                          │</span></span>
<span class="line"><span>│   - 添加代码注释和使用示例&quot;                │</span></span>
<span class="line"><span>│  → 结果：精确符合需求的代码               │</span></span>
<span class="line"><span>│                                          │</span></span>
<span class="line"><span>└─────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><h3 id="_3-1-2-为什么prompt-engineering很重要" tabindex="-1">3.1.2 为什么Prompt Engineering很重要？ <a class="header-anchor" href="#_3-1-2-为什么prompt-engineering很重要" aria-label="Permalink to &quot;3.1.2 为什么Prompt Engineering很重要？&quot;">​</a></h3><table tabindex="0"><thead><tr><th>方面</th><th>说明</th></tr></thead><tbody><tr><td><strong>效果提升</strong></td><td>好的Prompt能让输出质量提升3-10倍</td></tr><tr><td><strong>成本节约</strong></td><td>精确的Prompt减少Token消耗</td></tr><tr><td><strong>减少重试</strong></td><td>一次得到满意结果，节省时间</td></tr><tr><td><strong>可控性</strong></td><td>让AI输出更符合你的预期</td></tr><tr><td><strong>稳定性</strong></td><td>一致的Prompt带来一致的输出</td></tr></tbody></table><h3 id="_3-1-3-prompt的基本结构" tabindex="-1">3.1.3 Prompt的基本结构 <a class="header-anchor" href="#_3-1-3-prompt的基本结构" aria-label="Permalink to &quot;3.1.3 Prompt的基本结构&quot;">​</a></h3><p>一个有效的Prompt通常包含以下要素：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 完整的Prompt结构</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{角色设定}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">你是一个专业的Python编程专家，擅长教学和代码优化。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{任务描述}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请解释Python装饰器的概念，并提供三个实际应用场景。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{输入数据}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">无</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{输出要求}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 使用通俗易懂的语言</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 每个场景包含代码示例</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 总字数不超过500字</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{约束条件}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 不要涉及元类等高级概念</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 重点讲解使用场景而非语法细节</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 使用emoji增加可读性</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{示例格式}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">## 装饰器是什么</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">...</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">## 应用场景1：计时器</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">...</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><hr><h2 id="_3-2-prompt设计的核心原则" tabindex="-1">3.2 Prompt设计的核心原则 <a class="header-anchor" href="#_3-2-prompt设计的核心原则" aria-label="Permalink to &quot;3.2 Prompt设计的核心原则&quot;">​</a></h2><h3 id="_3-2-1-原则1-清晰具体-be-specific" tabindex="-1">3.2.1 原则1：清晰具体（Be Specific） <a class="header-anchor" href="#_3-2-1-原则1-清晰具体-be-specific" aria-label="Permalink to &quot;3.2.1 原则1：清晰具体（Be Specific）&quot;">​</a></h3><p>❌ <strong>不好的示例</strong>：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;写一个爬虫&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>问题：</p><ul><li>什么类型的爬虫？</li><li>爬取什么数据？</li><li>用什么语言？</li></ul><p>✅ <strong>好的示例</strong>：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请用Python编写一个网页爬虫，具体要求：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">目标网站：豆瓣电影Top250</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">需要提取：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 电影名称</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 评分</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 导演和主演</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 一句话简介</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">技术要求：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 使用requests + BeautifulSoup</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 添加适当的延时（随机2-5秒）</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 包含异常处理</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 数据保存为CSV格式</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">附加要求：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 添加详细注释</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 提供使用示例</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><h3 id="_3-2-2-原则2-提供上下文-provide-context" tabindex="-1">3.2.2 原则2：提供上下文（Provide Context） <a class="header-anchor" href="#_3-2-2-原则2-提供上下文-provide-context" aria-label="Permalink to &quot;3.2.2 原则2：提供上下文（Provide Context）&quot;">​</a></h3><p>❌ <strong>不好的示例</strong>：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;这段代码有什么问题？&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>✅ <strong>好的示例</strong>：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">我是Python初学者，写了以下代码实现冒泡排序，但运行结果不对。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请帮我：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. 指出代码中的问题</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. 解释为什么会这样</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. 提供修复后的代码</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. 给出避免此类问题的建议</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">代码：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`python</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">def bubble_sort(arr):</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    n = len(arr)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    for i in range(n):</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        for j in range(n):</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            if arr[j] &gt; arr[j+1]:</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                arr[j], arr[j+1] = arr[j+1], arr[j]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    return arr</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 测试</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">print(bubble_sort([5, 2, 8, 1, 9]))</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p>&quot;&quot;&quot;</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>### 3.2.3 原则3：明确输出格式（Specify Output Format）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>❌ **不好的示例**：</span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span>prompt = &quot;分析这段文本的情感&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>✅ <strong>好的示例</strong>：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">分析以下文本的情感倾向：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">文本内容：今天天气真好，阳光明媚，心情特别棒！</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请按以下格式输出：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`json</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;情感倾向&quot;: &quot;正面/负面/中性&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;情感强度&quot;: &quot;强/中/弱&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;关键词&quot;: [&quot;关键词1&quot;, &quot;关键词2&quot;],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;置信度&quot;: 0.95</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>&quot;&quot;&quot;</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>### 3.2.4 原则4：使用示例（Use Examples）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>提供示例让AI更好地理解你的期望。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span>prompt = &quot;&quot;&quot;</span></span>
<span class="line"><span>任务：将以下Python函数转换为列表推导式</span></span>
<span class="line"><span></span></span>
<span class="line"><span>示例1：</span></span>
<span class="line"><span>输入：</span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span>squares = []</span></span>
<span class="line"><span>for i in range(10):</span></span>
<span class="line"><span>    squares.append(i**2)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>输出：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">squares </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> range</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>示例2： 输入：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">evens </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> []</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> range</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">):</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">%</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        evens.append(i)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>输出：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">evens </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> range</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">%</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ==</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>现在请转换以下代码： 【你的代码】 &quot;&quot;&quot;</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>### 3.2.5 原则5：设定角色（Assign a Role）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span># 角色化提示词效果更好</span></span>
<span class="line"><span>prompts = {</span></span>
<span class="line"><span>    &quot;无角色&quot;: &quot;解释什么是机器学习&quot;,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &quot;专家角色&quot;: &quot;&quot;&quot;</span></span>
<span class="line"><span>    你是一位有10年经验的机器学习专家，曾在Google和Meta工作。</span></span>
<span class="line"><span>    请用通俗易懂的方式解释什么是机器学习，适合初学者理解。</span></span>
<span class="line"><span>    &quot;&quot;&quot;,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &quot;老师角色&quot;: &quot;&quot;&quot;</span></span>
<span class="line"><span>    你是一位大学计算机系教授，擅长用比喻和实例讲解复杂概念。</span></span>
<span class="line"><span>    请像给大一学生上课一样，解释什么是机器学习。</span></span>
<span class="line"><span>    &quot;&quot;&quot;,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &quot;孩子角色&quot;: &quot;&quot;&quot;</span></span>
<span class="line"><span>    你是一位小学科学老师，擅长用简单的语言和有趣的故事解释知识。</span></span>
<span class="line"><span>    请用5岁孩子能理解的方式解释什么是机器学习。</span></span>
<span class="line"><span>    &quot;&quot;&quot;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><hr><h2 id="_3-3-常用提示词模式" tabindex="-1">3.3 常用提示词模式 <a class="header-anchor" href="#_3-3-常用提示词模式" aria-label="Permalink to &quot;3.3 常用提示词模式&quot;">​</a></h2><h3 id="_3-3-1-模式1-思维链-chain-of-thought" tabindex="-1">3.3.1 模式1：思维链（Chain of Thought） <a class="header-anchor" href="#_3-3-1-模式1-思维链-chain-of-thought" aria-label="Permalink to &quot;3.3.1 模式1：思维链（Chain of Thought）&quot;">​</a></h3><p>引导AI展示推理过程，提高复杂问题的准确率。</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 基础版CoT</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">小明有5个苹果，他给了小红2个，又买了3个，吃掉了1个。</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请问小明现在有几个苹果？</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请一步步思考并给出答案。</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># AI输出：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">让我一步步计算：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. 初始：小明有5个苹果</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. 给小红：5 - 2 = 3个</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. 买了3个：3 + 3 = 6个</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. 吃掉1个：6 - 1 = 5个</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">答案：小明现在有5个苹果</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><h3 id="_3-3-2-模式2-few-shot-learning" tabindex="-1">3.3.2 模式2：Few-shot Learning <a class="header-anchor" href="#_3-3-2-模式2-few-shot-learning" aria-label="Permalink to &quot;3.3.2 模式2：Few-shot Learning&quot;">​</a></h3><p>提供少量示例，让AI快速学习任务模式。</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 情感分析Few-shot示例</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">任务：判断评论的情感倾向</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">示例1：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">评论：&quot;这个产品太棒了，强烈推荐！&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">标签：正面</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">示例2：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">评论：&quot;质量很差，不推荐购买。&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">标签：负面</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">示例3：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">评论：&quot;一般般，凑合能用。&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">标签：中性</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">现在请判断以下评论：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">评论：&quot;超出预期，会继续支持！&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">标签：&quot;&quot;&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># AI输出：正面</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><h3 id="_3-3-3-模式3-self-consistency-自洽性" tabindex="-1">3.3.3 模式3：Self-Consistency（自洽性） <a class="header-anchor" href="#_3-3-3-模式3-self-consistency-自洽性" aria-label="Permalink to &quot;3.3.3 模式3：Self-Consistency（自洽性）&quot;">​</a></h3><p>让AI多次生成答案，选择最一致的结果。</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 实际应用中需要多次调用</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">用Python实现快速排序算法。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请提供3种不同的实现方式：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. 递归版本</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. 使用列表推导式</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. 使用filter函数</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">每种方式都要包含：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 完整代码</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 时间复杂度分析</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 优缺点说明</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><h3 id="_3-3-4-模式4-generate-then-refine先生成后优化" tabindex="-1">3.3.4 模式4：Generate Then Refine先生成后优化 <a class="header-anchor" href="#_3-3-4-模式4-generate-then-refine先生成后优化" aria-label="Permalink to &quot;3.3.4 模式4：Generate Then Refine先生成后优化&quot;">​</a></h3><p>先生成初稿，再进行优化。</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Step 1: 生成初稿</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">draft_prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">写一篇介绍Python装饰器的文章，300字左右。</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Step 2: 优化</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">refine_prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">以下是关于Python装饰器的初稿：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">【初稿内容】</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请优化这篇文章：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. 添加代码示例</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. 使用更生动的比喻</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. 添加常见应用场景</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. 总字数扩展到500字</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">5. 使用小标题分段</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><h3 id="_3-3-5-模式5-role-playing-角色扮演" tabindex="-1">3.3.5 模式5：Role Playing（角色扮演） <a class="header-anchor" href="#_3-3-5-模式5-role-playing-角色扮演" aria-label="Permalink to &quot;3.3.5 模式5：Role Playing（角色扮演）&quot;">​</a></h3><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 技术面试</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">interview_prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">你现在是Google的技术面试官，正在面试一位Python工程师。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请根据以下JD设计5道面试题：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">职位：Python后端工程师</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">要求：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 精通Python基础</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 熟悉Django/Flask框架</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 了解数据库设计</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  - 有高并发经验加分</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. 从简单到困难排序题目</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. 包含参考答案</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. 评估每个问题的难度（1-5星）</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 代码审查</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">review_prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">你是一位资深的代码审查工程师，负责团队代码质量。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请审查以下Python代码，从以下角度给出反馈：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. 代码风格</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. 潜在bug</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. 性能问题</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. 可读性</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">5. 改进建议</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">【代码】</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br></div></div><hr><h2 id="_3-4-高级技巧" tabindex="-1">3.4 高级技巧 <a class="header-anchor" href="#_3-4-高级技巧" aria-label="Permalink to &quot;3.4 高级技巧&quot;">​</a></h2><h3 id="_3-4-1-技巧1-思维树-tree-of-thoughts" tabindex="-1">3.4.1 技巧1：思维树（Tree of Thoughts） <a class="header-anchor" href="#_3-4-1-技巧1-思维树-tree-of-thoughts" aria-label="Permalink to &quot;3.4.1 技巧1：思维树（Tree of Thoughts）&quot;">​</a></h3><p>让AI探索多个可能的解决方案，然后选择最优的。</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">问题：如何用Python实现一个高效的缓存系统？</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请按以下步骤思考：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">步骤1：列出3-5种可能的实现方案</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">步骤2：分析每种方案的优缺点</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">步骤3：评估每种方案的适用场景</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">步骤4：给出最优方案及完整代码</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请详细展开每个步骤。</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><h3 id="_3-4-2-技巧2-逆向提示-reverse-prompting" tabindex="-1">3.4.2 技巧2：逆向提示（Reverse Prompting） <a class="header-anchor" href="#_3-4-2-技巧2-逆向提示-reverse-prompting" aria-label="Permalink to &quot;3.4.2 技巧2：逆向提示（Reverse Prompting）&quot;">​</a></h3><p>先让AI生成答案，再反推问题或改进。</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 逆向生成问题</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">给定以下Python代码：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`python</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">def memoize(func):</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    cache = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    def wrapper(*args):</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        if args not in cache:</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            cache[args] = func(*args)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        return cache[args]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    return wrapper</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>请：</p><ol><li>解释这段代码的作用</li><li>构造3个合适的使用场景</li><li>为每个场景提供示例代码</li><li>总结这个函数的优缺点 &quot;&quot;&quot;</li></ol><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>### 3.4.3 技巧3：渐进式提示（Progressive Prompting）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>从简单到复杂，逐步引导AI。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span># Level 1: 基础概念</span></span>
<span class="line"><span>level1 = &quot;什么是Python装饰器？&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Level 2: 简单应用</span></span>
<span class="line"><span>level2 = &quot;&quot;&quot;</span></span>
<span class="line"><span>现在我理解了装饰器的基本概念。</span></span>
<span class="line"><span>请提供一个简单的装饰器示例，用于计时函数执行时间。</span></span>
<span class="line"><span>&quot;&quot;&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Level 3: 复杂应用</span></span>
<span class="line"><span>level3 = &quot;&quot;&quot;</span></span>
<span class="line"><span>很好！现在我需要：</span></span>
<span class="line"><span>1. 一个可以接受参数的装饰器</span></span>
<span class="line"><span>2. 用于重试函数执行</span></span>
<span class="line"><span>3. 支持自定义重试次数和延时</span></span>
<span class="line"><span>请给出完整实现。</span></span>
<span class="line"><span>&quot;&quot;&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Level 4: 实战优化</span></span>
<span class="line"><span>level4 = &quot;&quot;&quot;</span></span>
<span class="line"><span>我现在有这个重试装饰器。</span></span>
<span class="line"><span>请帮我：</span></span>
<span class="line"><span>1. 添加指数退避策略</span></span>
<span class="line"><span>2. 记录每次重试的日志</span></span>
<span class="line"><span>3. 处理特定异常类型</span></span>
<span class="line"><span>4. 提供使用示例</span></span>
<span class="line"><span>&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br></div></div><h3 id="_3-4-4-技巧4-比较式提示-comparative-prompting" tabindex="-1">3.4.4 技巧4：比较式提示（Comparative Prompting） <a class="header-anchor" href="#_3-4-4-技巧4-比较式提示-comparative-prompting" aria-label="Permalink to &quot;3.4.4 技巧4：比较式提示（Comparative Prompting）&quot;">​</a></h3><p>让AI对比不同方案。</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请对比以下三种Python异步编程方式：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. asyncio + async/await</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. concurrent.futures</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. multiprocessing</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">从以下维度对比：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 使用难度（1-5分）</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 性能表现</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 内存占用</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 适用场景</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 代码示例</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请使用表格形式呈现对比结果。</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><h3 id="_3-4-5-技巧5-反思与改进-reflection-and-improvement" tabindex="-1">3.4.5 技巧5：反思与改进（Reflection and Improvement） <a class="header-anchor" href="#_3-4-5-技巧5-反思与改进-reflection-and-improvement" aria-label="Permalink to &quot;3.4.5 技巧5：反思与改进（Reflection and Improvement）&quot;">​</a></h3><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">【任务】</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请设计一个Python类的学生成绩管理系统。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">【要求】</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. 支持添加、删除、查询学生</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. 支持成绩统计（平均分、最高分等）</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. 支持成绩排序</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. 代码要清晰易读</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">【重要】</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">在提供代码后，请：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. 自我审查代码的不足之处</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. 指出可能的bug</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. 提供改进版本</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. 总结关键改进点</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><hr><h2 id="_3-5-不同场景的prompt模板" tabindex="-1">3.5 不同场景的Prompt模板 <a class="header-anchor" href="#_3-5-不同场景的prompt模板" aria-label="Permalink to &quot;3.5 不同场景的Prompt模板&quot;">​</a></h2><h3 id="_3-5-1-代码生成" tabindex="-1">3.5.1 代码生成 <a class="header-anchor" href="#_3-5-1-代码生成" aria-label="Permalink to &quot;3.5.1 代码生成&quot;">​</a></h3><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">code_gen_prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 角色设定</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">你是一位</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{language}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">编程专家，拥有10年开发经验。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 任务</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{task_description}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 技术要求</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 语言：</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{language}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 框架：</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{framework}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">（可选）</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 风格：遵循PEP8规范</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 错误处理：包含异常处理</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 代码要求</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. 添加详细注释</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. 包含使用示例</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. 说明时间/空间复杂度</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. 提供测试用例</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 约束条件</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{constraints}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 输出格式</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`python</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># [功能说明]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">def function_name():</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    # [代码实现]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    pass</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># [使用示例]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># example...</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># [复杂度分析]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># Time: O(n)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># Space: O(1)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br></div></div><p>&quot;&quot;&quot;</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>### 3.5.2 代码审查</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span>code_review_prompt = &quot;&quot;&quot;</span></span>
<span class="line"><span># 角色设定</span></span>
<span class="line"><span>你是一位资深代码审查专家，专注于Python代码质量。</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 审查维度</span></span>
<span class="line"><span>1. **代码风格**</span></span>
<span class="line"><span>   - 命名规范</span></span>
<span class="line"><span>   - 代码格式</span></span>
<span class="line"><span>   - 注释质量</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. **潜在问题**</span></span>
<span class="line"><span>   - Bug风险</span></span>
<span class="line"><span>   - 边界情况</span></span>
<span class="line"><span>   - 错误处理</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. **性能分析**</span></span>
<span class="line"><span>   - 时间复杂度</span></span>
<span class="line"><span>   - 空间复杂度</span></span>
<span class="line"><span>   - 优化空间</span></span>
<span class="line"><span></span></span>
<span class="line"><span>4. **最佳实践**</span></span>
<span class="line"><span>   - 设计模式</span></span>
<span class="line"><span>   - Pythonic写法</span></span>
<span class="line"><span>   - 可维护性</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 待审查代码</span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span>{code}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br></div></div><h1 id="输出格式" tabindex="-1">输出格式 <a class="header-anchor" href="#输出格式" aria-label="Permalink to &quot;输出格式&quot;">​</a></h1><h2 id="总体评价" tabindex="-1">总体评价 <a class="header-anchor" href="#总体评价" aria-label="Permalink to &quot;总体评价&quot;">​</a></h2><p>[评分：1-5星] [一句话总结]</p><h2 id="详细反馈" tabindex="-1">详细反馈 <a class="header-anchor" href="#详细反馈" aria-label="Permalink to &quot;详细反馈&quot;">​</a></h2><h3 id="✅-做得好的地方" tabindex="-1">✅ 做得好的地方 <a class="header-anchor" href="#✅-做得好的地方" aria-label="Permalink to &quot;✅ 做得好的地方&quot;">​</a></h3><ul><li>...</li></ul><h3 id="⚠️-需要改进的地方" tabindex="-1">⚠️ 需要改进的地方 <a class="header-anchor" href="#⚠️-需要改进的地方" aria-label="Permalink to &quot;⚠️ 需要改进的地方&quot;">​</a></h3><h4 id="问题1-问题描述" tabindex="-1">问题1：[问题描述] <a class="header-anchor" href="#问题1-问题描述" aria-label="Permalink to &quot;问题1：[问题描述]&quot;">​</a></h4><ul><li>位置：第X行</li><li>问题：...</li><li>建议：...</li></ul><h3 id="💡-优化建议" tabindex="-1">💡 优化建议 <a class="header-anchor" href="#💡-优化建议" aria-label="Permalink to &quot;💡 优化建议&quot;">​</a></h3><ul><li>...</li></ul><h2 id="改进后的代码" tabindex="-1">改进后的代码 <a class="header-anchor" href="#改进后的代码" aria-label="Permalink to &quot;改进后的代码&quot;">​</a></h2><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">...</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>&quot;&quot;&quot;</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>### 3.5.3 文档生成</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span>doc_gen_prompt = &quot;&quot;&quot;</span></span>
<span class="line"><span># 任务</span></span>
<span class="line"><span>为以下代码生成完整的文档字符串（Docstring）</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 代码</span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span>{code}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><h1 id="文档要求" tabindex="-1">文档要求 <a class="header-anchor" href="#文档要求" aria-label="Permalink to &quot;文档要求&quot;">​</a></h1><p>遵循Google Python Style Guide，包含：</p><ol><li>简要说明（一行）</li><li>详细说明（多行）</li><li>参数说明（Args）</li><li>返回值说明（Returns）</li><li>异常说明（Raises）</li><li>使用示例（Examples）</li></ol><h1 id="输出格式-1" tabindex="-1">输出格式 <a class="header-anchor" href="#输出格式-1" aria-label="Permalink to &quot;输出格式&quot;">​</a></h1><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">def</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> function_name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(param1, param2):</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \\</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">&quot;\\&quot;\\&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [简要说明]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [详细说明]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Args:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        param1 (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">): [说明]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        param2 (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">): [说明]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Returns:</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [说明]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Raises:</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        Exception</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [说明]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Examples:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        &gt;&gt;&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> function_name(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        [结果]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    \\</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">&quot;\\&quot;\\&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    pass</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p>&quot;&quot;&quot;</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>### 3.5.4 调试助手</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span>debug_prompt = &quot;&quot;&quot;</span></span>
<span class="line"><span># 角色</span></span>
<span class="line"><span>你是Python调试专家，擅长快速定位和解决代码问题。</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 问题描述</span></span>
<span class="line"><span>{error_message}</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 相关代码</span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span>{code}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><h1 id="期望行为" tabindex="-1">期望行为 <a class="header-anchor" href="#期望行为" aria-label="Permalink to &quot;期望行为&quot;">​</a></h1>`,106),s("p",{expected_behavior:""},null,-1),s("h1",{id:"实际行为",tabindex:"-1"},[e("实际行为 "),s("a",{class:"header-anchor",href:"#实际行为","aria-label":'Permalink to "实际行为"'},"​")],-1),s("p",{actual_behavior:""},null,-1),a(`<h1 id="请按以下步骤调试" tabindex="-1">请按以下步骤调试 <a class="header-anchor" href="#请按以下步骤调试" aria-label="Permalink to &quot;请按以下步骤调试&quot;">​</a></h1><ol><li><p>问题诊断</p><ul><li>分析错误信息</li><li>定位问题根源</li><li>解释为什么会出错</li></ul></li><li><p>解决方案</p><ul><li>提供修复后的代码</li><li>说明修复原理</li></ul></li><li><p>预防措施</p><ul><li>如何避免此类问题</li><li>最佳实践建议</li></ul></li><li><p>学习要点</p><ul><li>涉及的Python知识点</li><li>推荐的学习资源 &quot;&quot;&quot;</li></ul></li></ol><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>### 3.5.5 教学讲解</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span>teaching_prompt = &quot;&quot;&quot;</span></span>
<span class="line"><span># 角色</span></span>
<span class="line"><span>你是一位经验丰富的编程导师，擅长用通俗易懂的方式讲解技术概念。</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 教学对象</span></span>
<span class="line"><span>- 目标：{target_audience}  # 初学者/中级/高级</span></span>
<span class="line"><span>- 背景：{background}        # 已掌握的技能</span></span>
<span class="line"><span>- 目标：{learning_goal}     # 想要达成的目标</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 教学主题</span></span>
<span class="line"><span>{topic}</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 教学要求</span></span>
<span class="line"><span>1. **循序渐进**</span></span>
<span class="line"><span>   - 从简单到复杂</span></span>
<span class="line"><span>   - 用生活化的比喻</span></span>
<span class="line"><span>   - 避免一开始就讲太多术语</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. **实例驱动**</span></span>
<span class="line"><span>   - 每个概念配合示例</span></span>
<span class="line"><span>   - 代码要简洁明了</span></span>
<span class="line"><span>   - 添加详细注释</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. **互动思考**</span></span>
<span class="line"><span>   - 提出启发式问题</span></span>
<span class="line"><span>   - 鼓励动手尝试</span></span>
<span class="line"><span>   - 提供练习题</span></span>
<span class="line"><span></span></span>
<span class="line"><span>4. **总结提升**</span></span>
<span class="line"><span>   - 关键要点总结</span></span>
<span class="line"><span>   - 常见误区提示</span></span>
<span class="line"><span>   - 进阶学习建议</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 输出结构</span></span>
<span class="line"><span>## 📖 课前知识准备</span></span>
<span class="line"><span>...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 💡 核心概念讲解</span></span>
<span class="line"><span>### 概念1：...</span></span>
<span class="line"><span>- **是什么**：...</span></span>
<span class="line"><span>- **为什么需要**：...</span></span>
<span class="line"><span>- **怎么用**：...</span></span>
<span class="line"><span>- **代码示例**：...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 🎯 实战案例</span></span>
<span class="line"><span>...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 🤔 思考与练习</span></span>
<span class="line"><span>...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 📝 总结与建议</span></span>
<span class="line"><span>...</span></span>
<span class="line"><span>&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br></div></div><hr><h2 id="_3-6-prompt优化实战案例" tabindex="-1">3.6 Prompt优化实战案例 <a class="header-anchor" href="#_3-6-prompt优化实战案例" aria-label="Permalink to &quot;3.6 Prompt优化实战案例&quot;">​</a></h2><h3 id="_3-6-1-案例1-从差prompt到好prompt" tabindex="-1">3.6.1 案例1：从差Prompt到好Prompt <a class="header-anchor" href="#_3-6-1-案例1-从差prompt到好prompt" aria-label="Permalink to &quot;3.6.1 案例1：从差Prompt到好Prompt&quot;">​</a></h3><p><strong>原始Prompt（差）</strong>：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;写个爬虫&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p><strong>第一次优化（中等）</strong>：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">用Python写一个爬虫，爬取豆瓣电影Top250的信息。</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p><strong>第二次优化（良好）</strong>：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请用Python编写一个豆瓣电影Top250的爬虫程序。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">需要提取：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 电影名称</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 评分</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 导演</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 主演</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 一句话简介</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">使用requests和BeautifulSoup库。</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p><strong>最终优化（优秀）</strong>：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 任务</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">编写一个Python爬虫，爬取豆瓣电影Top250页面的电影信息</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 目标网站</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">https://movie.douban.com/top250</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 需要提取的数据</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. 电影名称</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. 评分（float类型）</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. 导演</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. 主演</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">5. 一句话简介</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 技术要求</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 使用requests库发送请求</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 使用BeautifulSoup解析HTML</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 添加随机的User-Agent</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 请求间隔2-5秒（随机）</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- 数据保存为CSV文件</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 代码要求</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. 添加详细注释</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. 使用函数封装</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. 包含异常处理</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. 提供使用示例</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">5. 说明反爬策略</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 输出格式</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`python</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 豆瓣电影Top250爬虫</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">import ...</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">def get_movie_info(url):</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    \\&quot;\\&quot;\\&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    获取单页电影信息</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    Args:</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        url: 页面URL</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    Returns:</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        list: 电影信息列表</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    \\&quot;\\&quot;\\&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    # 代码实现</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    ...</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># 使用示例</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">if __name__ == &quot;__main__&quot;:</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    ...</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br></div></div><p>&quot;&quot;&quot;</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>### 3.6.2 案例2：复杂任务分解</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**任务**：构建一个智能代码审查系统</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\`\`\`python</span></span>
<span class="line"><span># Step 1: 代码风格检查</span></span>
<span class="line"><span>style_check_prompt = &quot;&quot;&quot;</span></span>
<span class="line"><span>检查以下Python代码的风格问题：</span></span>
<span class="line"><span>- 命名规范</span></span>
<span class="line"><span>- 缩进格式</span></span>
<span class="line"><span>- 行长度</span></span>
<span class="line"><span>- 导入顺序</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【代码】</span></span>
<span class="line"><span>&quot;&quot;&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Step 2: 潜在Bug识别</span></span>
<span class="line"><span>bug_detection_prompt = &quot;&quot;&quot;</span></span>
<span class="line"><span>分析以下代码可能存在的Bug：</span></span>
<span class="line"><span>- 边界条件</span></span>
<span class="line"><span>- 异常处理</span></span>
<span class="line"><span>- 资源泄漏</span></span>
<span class="line"><span>- 并发问题</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【代码】</span></span>
<span class="line"><span>&quot;&quot;&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Step 3: 性能分析</span></span>
<span class="line"><span>performance_prompt = &quot;&quot;&quot;</span></span>
<span class="line"><span>分析以下代码的性能问题：</span></span>
<span class="line"><span>- 时间复杂度</span></span>
<span class="line"><span>- 空间复杂度</span></span>
<span class="line"><span>- 优化建议</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【代码】</span></span>
<span class="line"><span>&quot;&quot;&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Step 4: 综合报告</span></span>
<span class="line"><span>final_report_prompt = &quot;&quot;&quot;</span></span>
<span class="line"><span>根据以上分析结果，生成一份完整的代码审查报告。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>审查结果：</span></span>
<span class="line"><span>【风格检查结果】</span></span>
<span class="line"><span>【Bug检测结果】</span></span>
<span class="line"><span>【性能分析结果】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>请生成：</span></span>
<span class="line"><span>1. 总体评分（1-10分）</span></span>
<span class="line"><span>2. 主要问题列表（按优先级排序）</span></span>
<span class="line"><span>3. 每个问题的详细说明和修复建议</span></span>
<span class="line"><span>4. 改进后的完整代码</span></span>
<span class="line"><span>&quot;&quot;&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br></div></div><hr><h2 id="_3-7-prompt测试与迭代" tabindex="-1">3.7 Prompt测试与迭代 <a class="header-anchor" href="#_3-7-prompt测试与迭代" aria-label="Permalink to &quot;3.7 Prompt测试与迭代&quot;">​</a></h2><h3 id="_3-7-1-a-b测试" tabindex="-1">3.7.1 A/B测试 <a class="header-anchor" href="#_3-7-1-a-b测试" aria-label="Permalink to &quot;3.7.1 A/B测试&quot;">​</a></h3><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 测试两个不同的Prompt</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prompts </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;A&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;解释什么是Python装饰器&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;B&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    你是Python专家。请用以下结构解释装饰器：</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    1. 比喻：用生活中的例子类比</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    2. 定义：技术层面的解释</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    3. 示例：简单代码示例</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    4. 应用：3个实际使用场景</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 评估维度：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># - 准确性</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># - 可读性</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># - 完整性</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># - 实用性</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><h3 id="_3-7-2-prompt版本管理" tabindex="-1">3.7.2 Prompt版本管理 <a class="header-anchor" href="#_3-7-2-prompt版本管理" aria-label="Permalink to &quot;3.7.2 Prompt版本管理&quot;">​</a></h3><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 使用字典管理不同版本</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">PROMPT_VERSIONS</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;v1.0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;prompt&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;写个爬虫&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;score&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;issues&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;不具体&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;缺少约束&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;v2.0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;prompt&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;用Python写豆瓣爬虫&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;score&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;issues&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;缺少具体要求&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;v3.0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;prompt&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;...&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 完整版本</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;score&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">9</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;issues&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: []</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 使用最佳版本</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">best_prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> PROMPT_VERSIONS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;v3.0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">][</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;prompt&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><hr><h2 id="_3-8-本章小结" tabindex="-1">3.8 本章小结 <a class="header-anchor" href="#_3-8-本章小结" aria-label="Permalink to &quot;3.8 本章小结&quot;">​</a></h2><h3 id="_3-8-1-核心要点" tabindex="-1">3.8.1 核心要点 <a class="header-anchor" href="#_3-8-1-核心要点" aria-label="Permalink to &quot;3.8.1 核心要点&quot;">​</a></h3><p>✅ <strong>五大核心原则</strong>：</p><ol><li>清晰具体（Be Specific）</li><li>提供上下文（Provide Context）</li><li>明确输出格式（Specify Format）</li><li>使用示例（Use Examples）</li><li>设定角色（Assign Role）</li></ol><p>✅ <strong>常用模式</strong>：</p><ul><li>Chain of Thought（思维链）</li><li>Few-shot Learning（少样本学习）</li><li>Self-Consistency（自洽性）</li><li>Generate Then Refine（先生成后优化）</li><li>Role Playing（角色扮演）</li></ul><p>✅ <strong>高级技巧</strong>：</p><ul><li>Tree of Thoughts（思维树）</li><li>Reverse Prompting（逆向提示）</li><li>Progressive Prompting（渐进式提示）</li><li>Comparative Prompting（比较式提示）</li></ul><h3 id="_3-8-2-实践建议" tabindex="-1">3.8.2 实践建议 <a class="header-anchor" href="#_3-8-2-实践建议" aria-label="Permalink to &quot;3.8.2 实践建议&quot;">​</a></h3><ol><li><strong>从简单开始</strong>：先构建基础Prompt，再逐步优化</li><li><strong>持续迭代</strong>：通过测试不断改进Prompt</li><li><strong>建立模板库</strong>：积累常用场景的Prompt模板</li><li><strong>A/B测试</strong>：对比不同Prompt的效果</li><li><strong>版本管理</strong>：记录Prompt的演进过程</li></ol><hr><h2 id="_3-9-练习题" tabindex="-1">3.9 练习题 <a class="header-anchor" href="#_3-9-练习题" aria-label="Permalink to &quot;3.9 练习题&quot;">​</a></h2><h3 id="练习1-优化prompt" tabindex="-1">练习1：优化Prompt <a class="header-anchor" href="#练习1-优化prompt" aria-label="Permalink to &quot;练习1：优化Prompt&quot;">​</a></h3><p>将以下差Prompt优化为优秀Prompt：</p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bad_prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;写个排序算法&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h3 id="练习2-few-shot-learning" tabindex="-1">练习2：Few-shot Learning <a class="header-anchor" href="#练习2-few-shot-learning" aria-label="Permalink to &quot;练习2：Few-shot Learning&quot;">​</a></h3><p>创建一个情感分类的Few-shot Prompt，至少包含3个示例。</p><h3 id="练习3-角色扮演" tabindex="-1">练习3：角色扮演 <a class="header-anchor" href="#练习3-角色扮演" aria-label="Permalink to &quot;练习3：角色扮演&quot;">​</a></h3><p>设计一个&quot;产品经理&quot;角色的Prompt，用于生成产品需求文档。</p><h3 id="练习4-思维链" tabindex="-1">练习4：思维链 <a class="header-anchor" href="#练习4-思维链" aria-label="Permalink to &quot;练习4：思维链&quot;">​</a></h3><p>使用CoT技巧，让AI解决一个复杂的数学问题。</p><h3 id="挑战-构建prompt模板系统" tabindex="-1">挑战：构建Prompt模板系统 <a class="header-anchor" href="#挑战-构建prompt模板系统" aria-label="Permalink to &quot;挑战：构建Prompt模板系统&quot;">​</a></h3><p>创建一个Prompt模板管理器，支持：</p><ul><li>多场景模板</li><li>参数化输入</li><li>版本控制</li><li>效果评估</li></ul><hr><p><strong>下一章：<a href="./chapter-04.html">RAG检索增强生成 →</a></strong></p>`,49)])])}const m=p(r,[["render",t]]);export{d as __pageData,m as default};
