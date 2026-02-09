---
title: AI + 前端结合面试题
---

# AI + 前端结合面试题

## 前端集成AI能力

### WebLLM使用？

```javascript
// 使用WebLLM在浏览器中运行大语言模型
import * as webllm from '@mlc-ai/web-llm';

class ChatEngine {
  constructor() {
    this.engine = null;
    this.messages = [];
  }

  async init() {
    const selectedModel = 'Llama-3-8B-Instruct-q4f16_1-MLC';

    this.engine = await webllm.CreateMLCEngine(
      selectedModel,
      {
        initProgressCallback: (report) => {
          console.log('Init progress:', report.progress);
        }
      }
    );
  }

  async sendMessage(userMessage) {
    this.messages.push({
      role: 'user',
      content: userMessage
    });

    const reply = await this.engine.chat.completions.create({
      messages: this.messages
    });

    const assistantMessage = reply.choices[0].message.content;
    this.messages.push({
      role: 'assistant',
      content: assistantMessage
    });

    return assistantMessage;
  }

  async generateText(prompt) {
    const reply = await this.engine.chat.completions.create({
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return reply.choices[0].message.content;
  }
}

// 使用
const chat = new ChatEngine();
await chat.init();

const response = await chat.sendMessage('Hello, how are you?');
console.log(response);
```

### Transformers.js？

```javascript
// 使用Transformers.js在浏览器中运行Transformer模型
import { pipeline, env } from '@xenova/transformers';

// 禁用本地模型检查
env.allowLocalModels = false;
env.useBrowserCache = true;

class AIHelper {
  constructor() {
    this.classifier = null;
    this.summarizer = null;
    this.translator = null;
  }

  // 情感分析
  async initClassifier() {
    this.classifier = await pipeline(
      'sentiment-analysis',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
    );
  }

  async analyzeSentiment(text) {
    const result = await this.classifier(text);
    return result;
  }

  // 文本摘要
  async initSummarizer() {
    this.summarizer = await pipeline(
      'summarization',
      'Xenova/distilbart-cnn-6-6'
    );
  }

  async summarize(text) {
    const summary = await this.summarizer(text);
    return summary[0].summary_text;
  }

  // 翻译
  async initTranslator() {
    this.translator = await pipeline(
      'translation',
      'Xenova/opus-mt-zh-en'
    );
  }

  async translate(text) {
    const result = await this.translator(text);
    return result[0].translation_text;
  }

  // 文本生成
  async initGenerator() {
    this.generator = await pipeline(
      'text-generation',
      'Xenova/gpt2'
    );
  }

  async generate(prompt, maxLength = 100) {
    const result = await this.generator(prompt, {
      max_length: maxLength,
      temperature: 0.7
    });
    return result[0].generated_text;
  }
}

// Vue组件中使用
<script setup>
import { ref, onMounted } from 'vue';

const aiHelper = new AIHelper();
const sentiment = ref(null);
const summary = ref(null);

onMounted(async () => {
  await aiHelper.initClassifier();
  await aiHelper.initSummarizer();
});

async function analyzeSentiment(text) {
  sentiment.value = await aiHelper.analyzeSentiment(text);
}

async function summarizeText(text) {
  summary.value = await aiHelper.summarize(text);
}
</script>

<template>
  <div>
    <textarea v-model="inputText" />
    <button @click="analyzeSentiment(inputText)">
      Analyze Sentiment
    </button>
    <p v-if="sentiment">
      {{ sentiment[0].label }}: {{ sentiment[0].score }}
    </p>
  </div>
</template>
```

## AI Copilot实现

### 代码补全集成？

```javascript
// 基于AI的代码补全
class CodeAssistant {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.endpoint = 'https://api.openai.com/v1/completions';
  }

  async completeCode(prompt, language = 'javascript') {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: this.buildPrompt(prompt, language),
        temperature: 0.3,
        max_tokens: 200,
        stop: ['\n\n', '/*', '*/']
      })
    });

    const data = await response.json();
    return data.choices[0].text.trim();
  }

  buildPrompt(code, language) {
    return `Complete the following ${language} code:\n${code}`;
  }

  // 实时代码建议
  async getSuggestions(code, cursorPosition) {
    const codeBeforeCursor = code.substring(0, cursorPosition);

    const suggestions = await this.completeCode(codeBeforeCursor);

    return {
      text: suggestions,
      position: cursorPosition
    };
  }
}

// Monaco Editor集成
import * as monaco from 'monaco-editor';

class MonacoAIAssistant {
  constructor(editor, apiKey) {
    this.editor = editor;
    this.assistant = new CodeAssistant(apiKey);
    this.debounceTimer = null;
  }

  init() {
    this.editor.onDidChangeModelContent(() => {
      this.handleContentChange();
    });
  }

  handleContentChange() {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(async () => {
      const position = this.editor.getPosition();
      const model = this.editor.getModel();
      const code = model.getValue();

      const suggestions = await this.assistant.getSuggestions(
        code,
        model.getOffsetAt(position)
      );

      this.showSuggestions(suggestions);
    }, 500);
  }

  showSuggestions(suggestions) {
    // 显示建议
    monaco.editor.showSuggestionsWidget({
      position: this.editor.getPosition(),
      suggestions: [
        {
          label: 'AI Suggestion',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: suggestions.text,
          detail: 'AI-powered suggestion'
        }
      ]
    });
  }
}
```

### 智能表单填充？

```javascript
// AI驱动的表单自动填充
class SmartFormFiller {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async extractFormData(text) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Extract form data from the text and return as JSON'
          },
          {
            role: 'user',
            content: text
          }
        ],
        functions: [
          {
            name: 'extractFormData',
            description: 'Extract form fields from text',
            parameters: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' }
              }
            }
          }
        ],
        function_call: { name: 'extractFormData' }
      })
    });

    const data = await response.json();
    const functionCall = data.choices[0].message.function_call;

    return JSON.parse(functionCall.arguments);
  }

  // Vue组件
  async fillFormFromText(text) {
    const formData = await this.extractFormData(text);

    // 自动填充表单
    return {
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address || ''
    };
  }
}

// 使用
<script setup>
import { ref } from 'vue';
import { SmartFormFiller } from '@/utils/smartForm';

const filler = new SmartFormFiller(import.meta.env.VITE_OPENAI_API_KEY);

const formData = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
});

const inputText = ref('');

async function autoFill() {
  const extracted = await filler.fillFormFromText(inputText.value);
  formData.value = extracted;
}
</script>

<template>
  <div>
    <textarea
      v-model="inputText"
      placeholder="粘贴文本信息，自动提取表单数据..."
    />
    <button @click="autoFill">自动填充</button>

    <form>
      <input v-model="formData.name" placeholder="姓名" />
      <input v-model="formData.email" placeholder="邮箱" />
      <input v-model="formData.phone" placeholder="电话" />
      <input v-model="formData.address" placeholder="地址" />
    </form>
  </div>
</template>
```

## AI辅助UI生成

### 文本生成UI？

```javascript
// AI驱动的UI生成
class UIGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateUI(description) {
    const prompt = `Generate Vue component code for: ${description}

Requirements:
- Use Vue 3 Composition API
- Use Tailwind CSS for styling
- Include proper props and emits
- Add TypeScript types
- Make it responsive`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a Vue.js expert. Generate clean, production-ready Vue components.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // 生成组件配置
  async generateComponentConfig(description) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Generate JSON configuration for a component: ${description}`
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
}

// 使用
<script setup>
import { ref } from 'vue';
import { UIGenerator } from '@/utils/uiGenerator';

const generator = new UIGenerator(import.meta.env.VITE_OPENAI_API_KEY);

const description = ref('');
const generatedCode = ref('');

async function generate() {
  generatedCode.value = await generator.generateUI(description.value);
}
</script>

<template>
  <div>
    <textarea
      v-model="description"
      placeholder="描述你需要的组件..."
    />
    <button @click="generate">生成组件</button>

    <pre v-if="generatedCode">{{ generatedCode }}</pre>
  </div>
</template>
```

### 图像生成UI？

```javascript
// 使用AI生成图像并转换为UI
class ImageToUI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateImage(description) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `UI design for ${description}, modern, clean, professional`,
        n: 1,
        size: '1024x1024'
      })
    });

    const data = await response.json();
    return data.data[0].url;
  }

  // 使用图像识别提取UI元素
  async analyzeUI(imageUrl) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this UI design and generate HTML/CSS code'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
```

## 实时语音识别

### Web Speech API？

```javascript
// 浏览器原生语音识别
class VoiceAssistant {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'zh-CN';

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      this.onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.onError(event.error);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition.start();
      }
    };
  }

  start() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1;
    utterance.pitch = 1;
    this.synthesis.speak(utterance);
  }

  onResult(transcript) {
    console.log('Speech result:', transcript);
  }

  onError(error) {
    console.error('Speech error:', error);
  }
}

// Vue组件
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { VoiceAssistant } from '@/utils/voice';

const assistant = new VoiceAssistant();
const transcript = ref('');
const isListening = ref(false);

onMounted(() => {
  assistant.init();
  assistant.onResult = (text) => {
    transcript.value = text;
  };
});

onUnmounted(() => {
  assistant.stop();
});

function toggleListening() {
  if (isListening.value) {
    assistant.stop();
    isListening.value = false;
  } else {
    assistant.start();
    isListening.value = true;
  }
}

function speak(text) {
  assistant.speak(text);
}
</script>

<template>
  <div>
    <button @click="toggleListening">
      {{ isListening ? '停止' : '开始' }}识别
    </button>

    <p>{{ transcript }}</p>

    <button @click="speak(transcript)">
      朗读
    </button>
  </div>
</template>
```

### AI语音助手？

```javascript
// 结合AI的智能语音助手
class AIVoiceAssistant extends VoiceAssistant {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async processCommand(text) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful voice assistant. Provide concise, friendly responses.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 200
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async onResult(transcript) {
    if (transcript.endsWith('。') || transcript.endsWith('.')) {
      const response = await this.processCommand(transcript);

      // 显示响应
      this.onResponse(response);

      // 朗读响应
      this.speak(response);
    }
  }

  onResponse(response) {
    console.log('AI response:', response);
  }
}

// 使用
<script setup>
import { ref, onMounted } from 'vue';
import { AIVoiceAssistant } from '@/utils/aiVoice';

const aiAssistant = new AIVoiceAssistant(import.meta.env.VITE_OPENAI_API_KEY);

const userInput = ref('');
const aiResponse = ref('');

onMounted(() => {
  aiAssistant.init();
  aiAssistant.onResponse = (response) => {
    aiResponse.value = response;
  };
});

function startAssistant() {
  aiAssistant.start();
}
</script>

<template>
  <div>
    <button @click="startAssistant">启动语音助手</button>

    <div v-if="aiResponse">
      <p>AI: {{ aiResponse }}</p>
    </div>
  </div>
</template>
```

## AI API集成与优化

### AI API安全与限流？（阿里高频）

```javascript
// AI API调用的安全与限流策略
class AIService {
  constructor(config) {
    this.apiKey = config.apiKey
    this.endpoint = config.endpoint
    this.rateLimiter = new RateLimiter(config.maxRequests, config.perMilliseconds)
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    }
  }

  // 带重试的API调用
  async callAPI(prompt, options = {}) {
    await this.rateLimiter.acquire()

    let lastError
    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: options.model || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 1000
          })
        })

        if (!response.ok) {
          const error = new Error(`API Error: ${response.status}`)
          error.status = response.status
          throw error
        }

        const data = await response.json()
        return data.choices[0].message.content

      } catch (error) {
        lastError = error

        // 429 Too Many Requests 或 5xx 错误才重试
        if (error.status === 429 || (error.status >= 500 && attempt < this.retryConfig.maxRetries - 1)) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(2, attempt),
            this.retryConfig.maxDelay
          )
          await this.sleep(delay)
          continue
        }

        throw error
      }
    }

    throw lastError
  }

  // 指数退避
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Token计数与预算控制
  estimateTokens(text) {
    // 粗略估算：1 token ≈ 4 characters
    return Math.ceil(text.length / 4)
  }

  async callWithBudget(prompt, maxTokens = 100000) {
    const estimatedTokens = this.estimateTokens(prompt)

    if (estimatedTokens > maxTokens) {
      throw new Error(`Prompt too long: ${estimatedTokens} tokens`)
    }

    return this.callAPI(prompt)
  }
}

// 限流器实现
class RateLimiter {
  constructor(maxRequests, perMilliseconds) {
    this.maxRequests = maxRequests
    this.perMilliseconds = perMilliseconds
    this.requests = []
  }

  async acquire() {
    const now = Date.now()

    // 清理过期请求
    this.requests = this.requests.filter(
      time => now - time < this.perMilliseconds
    )

    // 检查是否超过限制
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0]
      const waitTime = this.perMilliseconds - (now - oldestRequest)

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }

    this.requests.push(Date.now())
  }
}
```

### Prompt工程在前端的应用？（字节必问）

```javascript
// Prompt工程最佳实践
class PromptEngineer {
  constructor() {
    this.templates = new Map()
  }

  // 1. 模板化Prompt
  defineTemplate(name, template) {
    this.templates.set(name, template)
  }

  renderTemplate(name, variables) {
    const template = this.templates.get(name)
    if (!template) {
      throw new Error(`Template not found: ${name}`)
    }

    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return variables[key] || `{{${key}}}`
    })
  }

  // 2. Few-shot Learning
  buildFewShotPrompt(examples, newInput) {
    const prompt = examples.map(ex => {
      return `输入：${ex.input}\n输出：${ex.output}\n`
    }).join('\n')

    return `${prompt}输入：${newInput}\n输出：`
  }

  // 3. Chain of Thought
  buildCoTPrompt(problem) {
    return `
请一步步思考以下问题，最后给出答案：

问题：${problem}

思考过程：
1. 首先，让我理解问题...
2. 然后，我需要...
3. 接下来...
4. 最后，答案是...

请按照上述格式输出你的思考过程和最终答案。
    `.trim()
  }

  // 4. Prompt Chaining
  async chainPrompts(chainData) {
    let currentContext = {}

    for (const step of chainData) {
      const prompt = this.renderTemplate(step.template, {
        ...step.variables,
        ...currentContext
      })

      const result = await aiService.callAPI(prompt)
      currentContext[step.outputKey] = result
    }

    return currentContext
  }
}
```

### AI流式输出处理？（腾讯高频）

```javascript
// SSE（Server-Sent Events）流式输出处理
class StreamingAIChat {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.controller = null
  }

  // 流式生成文本
  async *streamChat(messages, onChunk) {
    this.controller = new AbortController()

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        stream: true
      }),
      signal: this.controller.signal
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed === 'data: [DONE]') return

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6))
            const content = data.choices[0]?.delta?.content

            if (content) {
              yield content
              onChunk?.(content)
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e)
          }
        }
      }
    }
  }

  // 取消流式请求
  abort() {
    this.controller?.abort()
  }
}
```

### AI上下文管理策略？（阿里真题）

```javascript
// AI对话的上下文管理
class ContextManager {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 4000
    this.contextWindow = options.contextWindow || 10
    this.systemPrompt = options.systemPrompt || ''
    this.conversations = new Map()
  }

  // 开始新对话
  startConversation(conversationId) {
    this.conversations.set(conversationId, {
      messages: [],
      summary: null,
      tokenCount: 0
    })

    if (this.systemPrompt) {
      this.addMessage(conversationId, {
        role: 'system',
        content: this.systemPrompt
      })
    }
  }

  // 添加消息
  addMessage(conversationId, message) {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`)
    }

    const tokens = this.estimateTokens(message.content)
    conversation.tokenCount += tokens

    conversation.messages.push({
      ...message,
      timestamp: Date.now(),
      tokens
    })

    // 检查是否需要压缩上下文
    this.maybeCompressContext(conversationId)
  }

  // 估算Token数量
  estimateTokens(text) {
    return Math.ceil(text.length / 4)
  }

  // 压缩上下文
  async maybeCompressContext(conversationId) {
    const conversation = this.conversations.get(conversationId)

    // 如果Token数量超限，进行压缩
    if (conversation.tokenCount > this.maxTokens) {
      await this.summarizeConversation(conversationId)
    }

    // 保留最近N轮对话
    while (conversation.messages.length > this.contextWindow * 2 + 1) {
      const removed = conversation.messages.shift()
      conversation.tokenCount -= removed.tokens
    }
  }

  // 总结对话历史
  async summarizeConversation(conversationId) {
    const conversation = this.conversations.get(conversationId)

    const messagesToSummarize = conversation.messages
      .filter(m => m.role !== 'system')
      .slice(0, -this.contextWindow * 2)

    if (messagesToSummarize.length === 0) return

    const summaryPrompt = `请总结以下对话历史，提取关键信息：
${messagesToSummarize.map(m => `${m.role}: ${m.content}`).join('\n')}`

    const summary = await aiService.callAPI(summaryPrompt)

    conversation.summary = summary
    conversation.messages = conversation.messages.slice(-this.contextWindow * 2)

    conversation.tokenCount = conversation.messages.reduce(
      (sum, m) => sum + m.tokens,
      this.estimateTokens(summary)
    )
  }

  // 获取上下文消息
  getContext(conversationId) {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) return []

    const messages = []

    if (conversation.summary) {
      messages.push({
        role: 'system',
        content: `之前的对话总结：${conversation.summary}`
      })
    }

    messages.push(...conversation.messages)

    return messages
  }

  // 清除对话
  clearConversation(conversationId) {
    this.conversations.delete(conversationId)
  }
}
```

### AI聊天界面最佳实践？（字节必问）

```vue
<!-- AICHat.vue - 专业的AI聊天界面 -->
<template>
  <div class="ai-chat-container">
    <!-- 消息列表 -->
    <div ref="messagesContainer" class="messages-container">
      <div
        v-for="(message, index) in displayMessages"
        :key="index"
        :class="['message', message.role, { streaming: message.isStreaming }]"
      >
        <!-- 头像 -->
        <div class="avatar">
          <img v-if="message.role === 'user'" :src="userAvatar" />
          <span v-else class="ai-icon">🤖</span>
        </div>

        <!-- 消息内容 -->
        <div class="message-content">
          <!-- Markdown渲染 -->
          <div v-html="renderMarkdown(message.content)"></div>

          <!-- 流式输出时的光标 -->
          <span v-if="message.isStreaming" class="typing-cursor"></span>

          <!-- 消息操作 -->
          <div class="message-actions">
            <button @click="copyMessage(message.content)" title="复制">📋</button>
            <button v-if="message.role === 'assistant'" @click="regenerateMessage(index)" title="重新生成">🔄</button>
          </div>
        </div>

        <!-- 时间戳 -->
        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
      </div>

      <!-- 加载中指示器 -->
      <div v-if="isLoading" class="message assistant">
        <div class="avatar"><span class="ai-icon">🤖</span></div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <textarea
        v-model="userInput"
        @keydown="handleKeyDown"
        placeholder="输入消息... (Shift+Enter换行，Enter发送)"
        rows="1"
        :disabled="isGenerating"
      ></textarea>

      <button @click="sendMessage" :disabled="!canSend" :class="{ generating: isGenerating }">
        {{ isGenerating ? '⏸️' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { marked } from 'marked'

const messages = ref([])
const userInput = ref('')
const isGenerating = ref(false)
const isLoading = ref(false)

const displayMessages = computed(() => {
  return messages.value.map(m => ({
    ...m,
    isStreaming: m.role === 'assistant' && isGenerating.value
  }))
})

const canSend = computed(() => {
  return userInput.value.trim().length > 0 && !isGenerating.value
})

function renderMarkdown(content) {
  return marked(content)
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 20px;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
}

.message.user .message-content {
  background: #007AFF;
  color: white;
}

.message.assistant .message-content {
  background: white;
  color: #333;
}

.typing-cursor::after {
  content: '▋';
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
```

### AI应用性能优化？（阿里2025真题）

```javascript
// AI应用的性能优化策略
class OptimizedAIService {
  constructor(config) {
    this.cache = new Map()
    this.queue = new PromiseQueue(config.maxConcurrent || 3)
  }

  // 1. 请求缓存
  async cachedCall(key, fetcher, ttl = 60000) {
    const cached = this.cache.get(key)

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }

    const data = await fetcher()

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })

    return data
  }

  // 2. 请求队列（控制并发）
  async queuedRequest(fn) {
    return this.queue.add(fn)
  }

  // 3. 批量请求合并
  async batchCall(requests) {
    const batchPrompt = requests.map((req, idx) => `[${idx}] ${req.prompt}`).join('\n\n')
    const response = await this.callAPI(batchPrompt)
    return this.parseBatchResponse(response, requests.length)
  }
}

// Promise队列实现
class PromiseQueue {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent
    this.running = 0
    this.queue = []
  }

  async add(fn) {
    while (this.running >= this.maxConcurrent) {
      await new Promise(resolve => this.queue.push(resolve))
    }

    this.running++

    try {
      return await fn()
    } finally {
      this.running--
      const next = this.queue.shift()
      if (next) next()
    }
  }
}
```

---

**小徐带你飞系列教程**

**最后更新：2026 年 2 月**
**版本：v1.0**
**作者：小徐**
**邮箱：esimonx@163.com**
