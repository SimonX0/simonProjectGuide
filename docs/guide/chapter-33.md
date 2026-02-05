# Electron桌面应用开发
## # 4.9 Electron桌面应用开发
## Electron桌面应用开发

> **学习目标**：掌握Electron开发技术，将Vue3应用打包为桌面应用
> **核心内容**：主进程与渲染进程通信、窗口管理、原生功能调用、应用打包

### Electron 基础概念

#### 什么是 Electron？

**Electron** 是一个使用 JavaScript、HTML 和 CSS 构建跨平台桌面应用的框架，具有以下特点：

- **跨平台**：一套代码，同时支持 Windows、macOS、Linux
- **Web技术栈**：使用前端技术进行开发
- **原生能力**：可以调用操作系统的原生功能
- **活跃生态**：VS Code、Slack、Discord等知名应用都使用Electron
- ** Chromium + Node.js**：结合了浏览器渲染能力和Node.js系统调用能力

#### Electron 架构

```
┌─────────────────────────────────────────────────┐
│               Electron 应用                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐      ┌──────────────┐        │
│  │  主进程       │◄────►│  渲染进程     │        │
│  │ Main Process │      │ Renderer Proc │        │
│  │              │      │              │        │
│  │ • app        │      │ • BrowserWindow │      │
│  │ • BrowserWindow│    │ • 网页内容     │        │
│  │ • IPC        │      │ • Vue3 应用   │        │
│  └──────────────┘      └──────────────┘        │
│         ▲                       │               │
│         │                       │               │
│         ▼                       ▼               │
│  ┌─────────────────────────────────────┐       │
│  │     Node.js + Chromium               │       │
│  │  (系统调用 + 渲染引擎)                │       │
│  └─────────────────────────────────────┘       │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Electron 检查清单

```
✅ 了解主进程和渲染进程的区别
✅ 掌握IPC通信机制
✅ 配置开发环境
✅ 实现窗口管理
✅ 调用原生功能
✅ 完成应用打包
✅ 处理自动更新（可选）
```

### 环境搭建与项目初始化

#### 创建 Electron + Vue3 项目

```bash
# 方式一：使用 electron-vite（推荐）
npm create @quick-start/electron

# 方式二：手动搭建
# 1. 创建Vue3项目
npm create vite@latest my-electron-app -- --template vue-ts

# 2. 进入项目目录
cd my-electron-app

# 3. 安装Electron
npm install electron -D

# 4. 安装Electron开发工具
npm install electron-builder -D
npm install vite-plugin-electron -D
npm install vite-plugin-electron-renderer -D
```

#### 项目结构

```
my-electron-app/
├── src/
│   ├── main/              # 主进程代码
│   │   └── index.ts       # 主进程入口
│   ├── preload/           # 预加载脚本
│   │   └── index.ts
│   └── renderer/          # 渲染进程代码（Vue3应用）
│       ├── src/
│       ├── index.html
│       └── ...
├── electron.vite.config.ts
├── package.json
└── tsconfig.json
```

#### 配置主进程

```typescript
// src/main/index.ts
import { app, BrowserWindow } from 'electron'
import path from 'path'

// 主进程入口
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // macOS: 点击dock图标时重新创建窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 所有窗口关闭时退出应用（macOS除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 创建窗口函数
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,           // 是否显示边框
    titleBarStyle: 'default', // 标题栏样式
    backgroundColor: '#fff',
    show: false,           // 等待加载完成后显示
    webPreferences: {
      // 预加载脚本
      preload: path.join(__dirname, '../preload/index.js'),
      // 开启node集成（不推荐，建议使用preload）
      nodeIntegration: false,
      // 启用上下文隔离（安全）
      contextIsolation: true,
      // 禁用web安全（仅开发环境）
      webSecurity: !app.isPackaged
    }
  })

  // 开发环境加载开发服务器
  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    // 生产环境加载打包后的文件
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // 窗口准备好后显示（避免闪烁）
  win.once('ready-to-show', () => {
    win.show()
  })
}
```

#### 配置预加载脚本

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

// 向渲染进程暴露API
contextBridge.exposeInMainWorld('electronAPI', {
  // 平台信息
  platform: process.platform,

  // IPC通信方法
  // 发送消息
  send: (channel: string, data: any) => {
    // 白名单验证
    const validChannels = ['app-version', 'minimize-window', 'maximize-window']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },

  // 发送并接收响应
  invoke: (channel: string, data: any) => {
    const validChannels = ['app-version', 'save-file', 'read-file']
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data)
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`))
  },

  // 监听消息
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ['update-available', 'download-progress']
    if (validChannels.includes(channel)) {
      // 去重监听
      ipcRenderer.removeAllListeners(channel)
      ipcRenderer.on(channel, (_, ...args) => callback(...args))
    }
  },

  // 移除监听
  removeListener: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ['update-available', 'download-progress']
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback as any)
    }
  }
})

// 类型声明
export interface ElectronAPI {
  platform: string
  send: (channel: string, data: any) => void
  invoke: (channel: string, data: any) => Promise<any>
  on: (channel: string, callback: (...args: any[]) => void) => void
  removeListener: (channel: string, callback: (...args: any[]) => void) => void
}

// 扩展Window接口
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
```

### 主进程与渲染进程通信

#### IPC 通信基础

IPC（Inter-Process Communication）是 Electron 中主进程和渲染进程通信的主要方式：

```
┌──────────────┐                    ┌──────────────┐
│  主进程       │                    │  渲染进程     │
│ Main Process │                    │ Renderer Proc │
└──────────────┘                    └──────────────┘
       ▲                                    │
       │     ┌──────────────────┐           │
       └─────│ ipcMain          │           │
             │ • handle         │◄──────────┤
             │ • handleOnce     │  invoke   │
             │ • on             │           │
             └──────────────────┘           │
       ▲                                    │
       │     ┌──────────────────┐           │
       └─────│ ipcMain          │           │
             │ • send           │───────────┤ send
             │                  │           │
             └──────────────────┘           │
                                            │
                                    ┌───────────────┐
                                    │ ipcRenderer   │
                                    │ • send        │
                                    │ • invoke      │
                                    │ • on          │
                                    │ • removeListener│
                                    └───────────────┘
```

#### 双向通信（invoke/handle）

```typescript
// ============ 主进程 src/main/index.ts ============
import { ipcMain } from 'electron'

// 处理渲染进程的请求（返回响应）
ipcMain.handle('app-version', async () => {
  return app.getVersion()
})

ipcMain.handle('save-file', async (event, { content, filename }) => {
  const { dialog } = require('electron')
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: filename,
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (filePath) {
    await fs.writeFile(filePath, content)
    return { success: true, path: filePath }
  }
  return { success: false }
})

// 一次性处理
ipcMain.handleOnce('get-system-info', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.version
  }
})
```

```typescript
// ============ 渲染进程组件 ============
<template>
  <div class="app-info">
    <el-card>
      <template #header>
        <h3>应用信息</h3>
      </template>
      <div class="info-item">
        <span>应用版本：</span>
        <el-tag>{{ version || '加载中...' }}</el-tag>
      </div>
      <div class="info-item">
        <span>运行平台：</span>
        <el-tag>{{ platform }}</el-tag>
      </div>
      <el-button @click="getVersion">刷新版本</el-button>
      <el-button @click="saveFile">保存文件</el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const version = ref('')
const platform = ref('')

onMounted(() => {
  platform.value = window.electronAPI.platform
  getVersion()
})

// 获取应用版本
const getVersion = async () => {
  try {
    version.value = await window.electronAPI.invoke('app-version')
  } catch (error) {
    console.error('获取版本失败:', error)
  }
}

// 保存文件
const saveFile = async () => {
  try {
    const result = await window.electronAPI.invoke('save-file', {
      content: 'Hello from Electron!',
      filename: 'test.txt'
    })

    if (result.success) {
      ElMessage.success(`文件已保存: ${result.path}`)
    }
  } catch (error) {
    console.error('保存文件失败:', error)
  }
}
</script>
```

#### 单向通信（send/on）

```typescript
// ============ 主进程 src/main/index.ts ============
import { ipcMain } from 'electron'

// 监听渲染进程发送的消息
ipcMain.on('minimize-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win?.minimize()
})

ipcMain.on('maximize-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win?.isMaximized()) {
    win.unmaximize()
  } else {
    win?.maximize()
  }
})

// 发送消息到渲染进程
function sendUpdateNotification() {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('update-available', {
      version: '2.0.0',
      releaseDate: new Date().toISOString()
    })
  })
}
```

```typescript
// ============ 渲染进程组件 ============
<template>
  <div class="window-controls">
    <button @click="minimizeWindow">最小化</button>
    <button @click="maximizeWindow">最大化</button>
  </div>
</template>

<script setup lang="ts">
// 最小化窗口
const minimizeWindow = () => {
  window.electronAPI.send('minimize-window')
}

// 最大化窗口
const maximizeWindow = () => {
  window.electronAPI.send('maximize-window')
}

// 监听主进程发送的更新通知
onMounted(() => {
  window.electronAPI.on('update-available', (info) => {
    ElNotification({
      title: '发现新版本',
      message: `版本 ${info.version} 可用`,
      type: 'info'
    })
  })
})

onUnmounted(() => {
  window.electronAPI.removeListener('update-available', () => {})
})
</script>
```

### 窗口管理

#### 多窗口管理

```typescript
// src/main/windowManager.ts
import { BrowserWindow } from 'electron'

class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map()

  // 创建主窗口
  createMainWindow(): BrowserWindow {
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    if (!app.isPackaged) {
      win.loadURL('http://localhost:5173')
    } else {
      win.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    win.once('ready-to-show', () => win.show())

    this.windows.set('main', win)
    return win
  }

  // 创建设置窗口
  createSettingsWindow(parent?: BrowserWindow): BrowserWindow {
    let settingsWin = this.windows.get('settings')

    if (settingsWin) {
      settingsWin.focus()
      return settingsWin
    }

    settingsWin = new BrowserWindow({
      width: 600,
      height: 500,
      resizable: false,
      parent: parent || this.getMainWindow(),
      modal: !!parent,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    if (!app.isPackaged) {
      settingsWin.loadURL('http://localhost:5173/#/settings')
    } else {
      settingsWin.loadFile(path.join(__dirname, '../renderer/index.html'), {
        hash: 'settings'
      })
    }

    settingsWin.once('ready-to-show', () => settingsWin?.show())
    settingsWin.on('closed', () => {
      this.windows.delete('settings')
    })

    this.windows.set('settings', settingsWin)
    return settingsWin
  }

  // 创建子窗口
  createChildWindow(options: Electron.BrowserWindowConstructorOptions): BrowserWindow {
    const win = new BrowserWindow({
      ...options,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    win.once('ready-to-show', () => win.show())

    const id = `child-${Date.now()}`
    this.windows.set(id, win)

    win.on('closed', () => {
      this.windows.delete(id)
    })

    return win
  }

  // 获取主窗口
  getMainWindow(): BrowserWindow | undefined {
    return this.windows.get('main')
  }

  // 关闭所有窗口
  closeAll(): void {
    this.windows.forEach(win => {
      if (!win.isDestroyed()) {
        win.close()
      }
    })
    this.windows.clear()
  }
}

export const windowManager = new WindowManager()
```

#### 自定义窗口控制

```vue
<!-- 组件：CustomTitleBar.vue -->
<template>
  <div class="custom-titlebar">
    <div class="titlebar-drag-region"></div>

    <div class="titlebar-controls">
      <button @click="minimize" class="control-btn minimize">
        <svg viewBox="0 0 12 12">
          <rect x="0" y="5" width="12" height="2" fill="currentColor"/>
        </svg>
      </button>

      <button @click="maximize" class="control-btn maximize">
        <svg viewBox="0 0 12 12" v-if="!isMaximized">
          <rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg viewBox="0 0 12 12" v-else>
          <rect x="2" y="0" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"/>
          <rect x="0" y="2" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>

      <button @click="close" class="control-btn close">
        <svg viewBox="0 0 12 12">
          <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMaximized = ref(false)

const minimize = () => {
  window.electronAPI.send('minimize-window')
}

const maximize = () => {
  window.electronAPI.send('maximize-window')
  isMaximized.value = !isMaximized.value
}

const close = () => {
  window.electronAPI.send('close-window')
}
</script>

<style scoped>
.custom-titlebar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 32px;
  background: #1e1e1e;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 9999;
  -webkit-app-region: drag;
}

.titlebar-drag-region {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  -webkit-app-region: drag;
}

.titlebar-controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.control-btn {
  width: 46px;
  height: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.control-btn.close:hover {
  background: #e81123;
}

.control-btn svg {
  width: 12px;
  height: 12px;
}
</style>
```

### 系统托盘与菜单

#### 系统托盘

```typescript
// src/main/tray.ts
import { Tray, Menu, nativeImage } from 'electron'
import path from 'path'

export function createTray(mainWindow: BrowserWindow): Tray {
  // 创建托盘图标
  const iconPath = path.join(__dirname, '../../assets/tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  const tray = new Tray(icon)

  // 创建托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.show()
        mainWindow.focus()
      }
    },
    { type: 'separator' },
    {
      label: '设置',
      click: () => {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.show()
        // 发送事件到渲染进程，导航到设置页
        mainWindow.webContents.send('navigate', '/settings')
      }
    },
    { type: 'separator' },
    {
      label: '关于',
      click: () => {
        // 打开关于对话框
      }
    },
    {
      label: '检查更新',
      click: () => {
        // 检查更新逻辑
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('My Electron App')
  tray.setContextMenu(contextMenu)

  // 点击托盘图标显示/隐藏窗口
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  return tray
}
```

#### 应用菜单

```typescript
// src/main/menu.ts
import { Menu, MenuItemConstructorOptions } from 'electron'

export function createMenu(): Menu {
  const template: MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // 发送新建文件事件到当前聚焦的窗口
            const focusedWindow = BrowserWindow.getFocusedWindow()
            focusedWindow?.webContents.send('new-file')
          }
        },
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            // 打开文件对话框
          }
        },
        { type: 'separator' },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow()
            focusedWindow?.webContents.send('save-file')
          }
        },
        {
          label: '另存为',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow()
            focusedWindow?.webContents.send('save-file-as')
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '文档',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://example.com/docs')
          }
        },
        {
          label: '报告问题',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/example/issues')
          }
        },
        { type: 'separator' },
        {
          label: '关于',
          click: () => {
            // 显示关于对话框
          }
        }
      ]
    }
  ]

  // macOS特殊处理
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  return menu
}
```

### 原生功能调用

#### 文件系统操作

```typescript
// src/main/fileSystem.ts
import { dialog, shell } from 'electron'
import fs from 'fs/promises'
import path from 'path'

// 打开文件选择对话框
export async function openFile(options?: {
  filters?: Electron.FileFilter[]
  properties?: Electron.OpenDialogProperty[]
}): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    properties: options?.properties || ['openFile'],
    filters: options?.filters || [
      { name: 'Text Files', extensions: ['txt', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
}

// 保存文件对话框
export async function saveFile(defaultPath?: string): Promise<string | null> {
  const result = await dialog.showSaveDialog({
    defaultPath: defaultPath || 'untitled.txt',
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (result.canceled || !result.filePath) {
    return null
  }

  return result.filePath
}

// 读取文件内容
export async function readFileContent(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    throw new Error(`读取文件失败: ${error.message}`)
  }
}

// 写入文件内容
export async function writeFileContent(filePath: string, content: string): Promise<void> {
  try {
    await fs.writeFile(filePath, content, 'utf-8')
  } catch (error) {
    throw new Error(`写入文件失败: ${error.message}`)
  }
}

// 在文件管理器中显示文件
export async function showItemInFolder(filePath: string): Promise<void> {
  await shell.showItemInFolder(filePath)
}

// 打开外部链接
export async function openExternal(url: string): Promise<void> {
  await shell.openExternal(url)
}
```

```typescript
// 主进程注册IPC处理
import * as fileSystem from './fileSystem'

ipcMain.handle('dialog:openFile', async (_, options) => {
  return await fileSystem.openFile(options)
})

ipcMain.handle('dialog:saveFile', async (_, defaultPath) => {
  return await fileSystem.saveFile(defaultPath)
})

ipcMain.handle('fs:readFile', async (_, filePath) => {
  return await fileSystem.readFileContent(filePath)
})

ipcMain.handle('fs:writeFile', async (_, filePath, content) => {
  return await fileSystem.writeFileContent(filePath, content)
})

ipcMain.handle('shell:showInFolder', async (_, filePath) => {
  return await fileSystem.showItemInFolder(filePath)
})

ipcMain.handle('shell:openExternal', async (_, url) => {
  return await fileSystem.openExternal(url)
})
```

#### 系统通知

```typescript
// src/main/notification.ts
import { Notification } from 'electron'

export function showNotification(options: {
  title: string
  body: string
  icon?: string
}): void {
  const notification = new Notification({
    title: options.title,
    body: options.body,
    icon: options.icon
  })

  notification.on('click', () => {
    // 点击通知时的处理
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  notification.show()
}

// 使用示例
ipcMain.on('show-notification', (_, options) => {
  showNotification({
    title: options.title,
    body: options.body,
    icon: path.join(__dirname, '../assets/icon.png')
  })
})
```

#### 剪贴板操作

```typescript
// src/main/clipboard.ts
import { clipboard } from 'electron'

// 写入文本
export function writeText(text: string): void {
  clipboard.writeText(text)
}

// 读取文本
export function readText(): string {
  return clipboard.readText()
}

// 写入HTML
export function writeHTML(html: string, text?: string): void {
  clipboard.write({
    text: text || html,
    html: html
  })
}

// 读取HTML
export function readHTML(): string {
  return clipboard.readHTML()
}

// 清空剪贴板
export function clear(): void {
  clipboard.clear()
}

// 注册IPC处理
ipcMain.handle('clipboard:writeText', async (_, text) => {
  writeText(text)
})

ipcMain.handle('clipboard:readText', async () => {
  return readText()
})
```

#### 全局快捷键

```typescript
// src/main/globalShortcut.ts
import { globalShortcut } from 'electron'

export function registerGlobalShortcuts(mainWindow: BrowserWindow): void {
  // 注册 Ctrl+Shift+D 显示/隐藏开发者工具
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    mainWindow.webContents.toggleDevTools()
  })

  // 注册 Ctrl+Shift+S 打开设置
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    mainWindow.webContents.send('open-settings')
  })

  // 注册截图快捷键
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    mainWindow.webContents.send('take-screenshot')
  })
}

export function unregisterAllShortcuts(): void {
  globalShortcut.unregisterAll()
}

// 在app.whenReady()后注册
app.whenReady().then(() => {
  const mainWindow = createMainWindow()
  registerGlobalShortcuts(mainWindow)
})

// 在app.quit()前注销
app.on('will-quit', () => {
  unregisterAllShortcuts()
})
```

### 应用打包与分发

#### 配置 electron-builder

```json
// package.json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "My Electron Application",
  "main": "dist-electron/main/index.js",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build && electron-builder",
    "preview": "vite preview",
    "electron:dev": "electron-vite dev",
    "electron:build": "electron-vite build"
  },
  "build": {
    "appId": "com.example.myapp",
    "productName": "MyApp",
    "directories": {
      "output": "release/${version}",
      "buildResources": "build"
    },
    "files": [
      "dist-electron/**/*",
      "dist/**/*",
      "package.json"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        }
      ],
      "icon": "build/icon.ico"
    },
    "mac": {
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ],
      "icon": "build/icon.icns",
      "category": "public.app-category.productivity"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "build/icon.png",
      "category": "Utility"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.0.0",
    "vite-plugin-electron": "^0.28.0",
    "vite-plugin-electron-renderer": "^0.14.0"
  }
}
```

#### 构建配置文件

```typescript
// electron.vite.config.ts
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts')
        }
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [vue()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    }
  }
})
```

#### 自动更新配置

```typescript
// src/main/updater.ts
import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'

export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  // 配置更新服务器
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'https://example.com/updates'
  })

  // 检查更新
  autoUpdater.checkForUpdates()

  // 监听更新事件
  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update-available', info)
  })

  autoUpdater.on('update-not-available', (info) => {
    mainWindow.webContents.send('update-not-available', info)
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('download-progress', progress)
  })

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('update-downloaded', info)
  })

  autoUpdater.on('error', (error) => {
    mainWindow.webContents.send('update-error', error)
  })

  // 处理用户确认更新
  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall()
  })
}

// 在主进程调用
app.whenReady().then(() => {
  const mainWindow = createMainWindow()
  setupAutoUpdater(mainWindow)
})
```

### Electron 最佳实践

#### 安全性实践

```typescript
// 安全配置清单
const secureConfig = {
  // 1. 禁用node集成，使用contextIsolation
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true
  },

  // 2. 使用preload脚本暴露API
  preload: path.join(__dirname, 'preload.js'),

  // 3. 内容安全策略
  webSecurity: true,

  // 4. 验证IPC通信频道
  validateChannels: ['allowed-channel-1', 'allowed-channel-2']
}
```

#### 性能优化

```typescript
// 性能优化建议
const performanceTips = {
  // 1. 延迟加载窗口
  lazyLoadWindows: true,

  // 2. 使用BrowserWindow的show事件
  showWhenReady: true,

  // 3. 禁用不必要的功能
  disableFeatures: [
    'LibraryRegisterAudioContext',
    'OutOfBlinkCors'
  ],

  // 4. 使用v8缓存
  v8CacheOptions: 'code',

  // 5. 限制渲染进程内存
  jsFlags: '--max-old-space-size=4096'
}
```

#### 本章小结

| Electron功能 | 实现方式 | 优先级 |
|-------------|----------|--------|
| 主渲染进程通信 | IPC (invoke/handle, send/on) | ⭐⭐⭐⭐⭐ |
| 窗口管理 | BrowserWindow API | ⭐⭐⭐⭐⭐ |
| 系统托盘 | Tray API | ⭐⭐⭐⭐ |
| 原生对话框 | dialog API | ⭐⭐⭐⭐ |
| 文件系统操作 | fs模块 + dialog | ⭐⭐⭐⭐ |
| 应用打包 | electron-builder | ⭐⭐⭐⭐⭐ |
| 自动更新 | electron-updater | ⭐⭐⭐ |

### 实战项目：简易记事本应用

让我们通过一个完整的实战项目来巩固Electron知识。

#### 项目概述

**功能需求：**
- 创建、打开、保存文本文件
- 自定义标题栏（最小化、最大化、关闭）
- 最近文件列表
- 字数统计
- 系统托盘支持
- 快捷键支持

**项目结构：**
```
electron-notepad/
├── src/
│   ├── main/
│   │   ├── index.ts          # 主进程入口
│   │   ├── windowManager.ts  # 窗口管理
│   │   ├── menu.ts           # 应用菜单
│   │   ├── tray.ts           # 系统托盘
│   │   └── fileHandler.ts    # 文件操作
│   ├── preload/
│   │   └── index.ts          # 预加载脚本
│   └── renderer/
│       ├── src/
│       │   ├── App.vue
│       │   ├── components/
│       │   │   ├── TitleBar.vue
│       │   │   ├── Editor.vue
│       │   │   └── RecentFiles.vue
│       │   ├── stores/
│       │   │   └── editor.ts
│       │   └── main.ts
│       └── index.html
├── package.json
└── electron.vite.config.ts
```

#### 主进程代码

```typescript
// src/main/index.ts
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import * as fileHandler from './fileHandler'
import { createMenu } from './menu'
import { createTray } from './tray'
import { WindowManager } from './windowManager'

const windowManager = new WindowManager()

// 应用启动
app.whenReady().then(() => {
  const mainWindow = windowManager.createMainWindow()
  createMenu()
  createTray(mainWindow)
  setupIpcHandlers()
})

// macOS 点击dock图标重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createMainWindow()
  }
})

// 所有窗口关闭后退出（macOS除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC通信处理
function setupIpcHandlers() {
  // 文件操作
  ipcMain.handle('file:new', async () => {
    const mainWindow = windowManager.getMainWindow()
    mainWindow?.webContents.send('file:new')
  })

  ipcMain.handle('file:open', async () => {
    const result = await fileHandler.openFile()
    if (result) {
      return result
    }
    return null
  })

  ipcMain.handle('file:save', async (_, content, filePath) => {
    return await fileHandler.saveFile(content, filePath)
  })

  ipcMain.handle('file:saveAs', async (_, content) => {
    return await fileHandler.saveFileAs(content)
  })

  // 窗口控制
  ipcMain.on('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()
  })

  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  ipcMain.on('window:close', () => {
    const mainWindow = windowManager.getMainWindow()
    mainWindow?.close()
  })
}
```

```typescript
// src/main/windowManager.ts
import { BrowserWindow, screen } from 'electron'
import path from 'path'

export class WindowManager {
  private mainWindow: BrowserWindow | null = null

  createMainWindow(): BrowserWindow {
    if (this.mainWindow) {
      this.mainWindow.focus()
      return this.mainWindow
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    const win = new BrowserWindow({
      width: Math.floor(width * 0.8),
      height: Math.floor(height * 0.8),
      x: Math.floor(width * 0.1),
      y: Math.floor(height * 0.1),
      frame: false,
      titleBarStyle: 'hidden',
      backgroundColor: '#1e1e1e',
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true
      }
    })

    if (process.env.NODE_ENV === 'development') {
      win.loadURL('http://localhost:5173')
      win.webContents.openDevTools()
    } else {
      win.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    win.once('ready-to-show', () => {
      win.show()
    })

    win.on('closed', () => {
      this.mainWindow = null
    })

    this.mainWindow = win
    return win
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }
}
```

```typescript
// src/main/fileHandler.ts
import { dialog, BrowserWindow } from 'electron'
import fs from 'fs/promises'
import path from 'path'

export async function openFile(): Promise<{ content: string; filePath: string } | null> {
  const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    filters: [
      { name: 'Text Files', extensions: ['txt', 'md', 'js', 'ts', 'vue', 'json'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]
  const content = await fs.readFile(filePath, 'utf-8')

  return { content, filePath }
}

export async function saveFile(content: string, filePath: string): Promise<{ success: boolean; filePath?: string }> {
  try {
    await fs.writeFile(filePath, content, 'utf-8')
    return { success: true, filePath }
  } catch (error) {
    return { success: false }
  }
}

export async function saveFileAs(content: string): Promise<{ success: boolean; filePath?: string }> {
  const result = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    defaultPath: 'untitled.txt'
  })

  if (result.canceled || !result.filePath) {
    return { success: false }
  }

  return await saveFile(content, result.filePath)
}
```

```typescript
// src/main/menu.ts
import { Menu, BrowserWindow } from 'electron'

export function createMenu(): Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            const win = BrowserWindow.getFocusedWindow()
            win?.webContents.send('file:new')
          }
        },
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const win = BrowserWindow.getFocusedWindow()
            win?.webContents.send('file:open-request')
          }
        },
        { type: 'separator' },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            const win = BrowserWindow.getFocusedWindow()
            win?.webContents.send('file:save-request')
          }
        },
        {
          label: '另存为',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            const win = BrowserWindow.getFocusedWindow()
            win?.webContents.send('file:saveAs-request')
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            const win = BrowserWindow.getFocusedWindow()
            win?.webContents.send('show-about')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  return menu
}
```

```typescript
// src/main/tray.ts
import { Tray, Menu, nativeImage, BrowserWindow } from 'electron'
import path from 'path'

export function createTray(mainWindow: BrowserWindow): Tray {
  // 使用内置图标（实际项目中应使用自定义图标）
  const icon = nativeImage.createEmpty()
  const tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.show()
        mainWindow.focus()
      }
    },
    {
      label: '新建文件',
      click: () => {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.show()
        mainWindow.webContents.send('file:new')
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        const { app } = require('electron')
        app.quit()
      }
    }
  ])

  tray.setToolTip('简易记事本')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  return tray
}
```

#### 预加载脚本

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  // 文件操作
  openFile: () => ipcRenderer.invoke('file:open'),
  saveFile: (content: string, filePath: string) =>
    ipcRenderer.invoke('file:save', content, filePath),
  saveFileAs: (content: string) =>
    ipcRenderer.invoke('file:saveAs', content),

  // 窗口控制
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // 事件监听
  onFileNew: (callback: () => void) => {
    ipcRenderer.on('file:new', callback)
  },
  onFileOpenRequest: (callback: () => void) => {
    ipcRenderer.on('file:open-request', callback)
  },
  onSaveRequest: (callback: () => void) => {
    ipcRenderer.on('file:save-request', callback)
  },
  onSaveAsRequest: (callback: () => void) => {
    ipcRenderer.on('file:saveAs-request', callback)
  },
  onShowAbout: (callback: () => void) => {
    ipcRenderer.on('show-about', callback)
  },

  // 移除监听
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
```

#### 渲染进程代码

```vue
<!-- src/renderer/src/App.vue -->
<template>
  <div class="notepad-app">
    <TitleBar />
    <div class="app-content">
      <Editor
        v-model="content"
        :file-path="filePath"
        :is-modified="isModified"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TitleBar from './components/TitleBar.vue'
import Editor from './components/Editor.vue'

const content = ref('')
const filePath = ref('')
const originalContent = ref('')

const isModified = computed(() => content.value !== originalContent.value)

// 新建文件
const newFile = () => {
  if (isModified.value) {
    if (!confirm('当前文件未保存，是否继续新建？')) {
      return
    }
  }
  content.value = ''
  filePath.value = ''
  originalContent.value = ''
}

// 打开文件
const openFile = async () => {
  if (isModified.value) {
    if (!confirm('当前文件未保存，是否继续打开？')) {
      return
    }
  }

  const result = await window.electronAPI.openFile()
  if (result) {
    content.value = result.content
    filePath.value = result.filePath
    originalContent.value = result.content
  }
}

// 保存文件
const handleSave = async (saveAs = false) => {
  let result

  if (saveAs || !filePath.value) {
    result = await window.electronAPI.saveFileAs(content.value)
  } else {
    result = await window.electronAPI.saveFile(content.value, filePath.value)
  }

  if (result.success && result.filePath) {
    filePath.value = result.filePath
    originalContent.value = content.value
  }

  return result.success
}

// 监听主进程事件
onMounted(() => {
  window.electronAPI.onFileNew(newFile)
  window.electronAPI.onFileOpenRequest(openFile)
  window.electronAPI.onSaveRequest(() => handleSave(false))
  window.electronAPI.onSaveAsRequest(() => handleSave(true))
})

onUnmounted(() => {
  window.electronAPI.removeAllListeners('file:new')
  window.electronAPI.removeAllListeners('file:open-request')
  window.electronAPI.removeAllListeners('file:save-request')
  window.electronAPI.removeAllListeners('file:saveAs-request')
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  overflow: hidden;
}

.notepad-app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  overflow: hidden;
}
</style>
```

```vue
<!-- src/renderer/src/components/TitleBar.vue -->
<template>
  <div class="titlebar">
    <div class="titlebar-drag-region">
      <span class="app-title">{{ title }}</span>
    </div>
    <div class="titlebar-controls">
      <button @click="minimize" class="control-btn minimize" title="最小化">
        <svg viewBox="0 0 12 12"><line x1="0" y1="6" x2="12" y2="6" stroke="currentColor"/></svg>
      </button>
      <button @click="maximize" class="control-btn maximize" title="最大化">
        <svg viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor"/></svg>
      </button>
      <button @click="close" class="control-btn close" title="关闭">
        <svg viewBox="0 0 12 12"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ isModified: boolean }>()

const title = computed(() => {
  return props.isModified ? '简易记事本 - 未保存' : '简易记事本'
})

const minimize = () => window.electronAPI.minimizeWindow()
const maximize = () => window.electronAPI.maximizeWindow()
const close = () => window.electronAPI.closeWindow()
</script>

<style scoped>
.titlebar {
  height: 32px;
  background: #2d2d2d;
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: drag;
}

.titlebar-drag-region {
  flex: 1;
  padding-left: 12px;
  display: flex;
  align-items: center;
}

.app-title {
  color: #ccc;
  font-size: 12px;
}

.titlebar-controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.control-btn {
  width: 46px;
  height: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ccc;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.control-btn.close:hover {
  background: #e81123;
  color: white;
}

.control-btn svg {
  width: 12px;
  height: 12px;
}
</style>
```

```vue
<!-- src/renderer/src/components/Editor.vue -->
<template>
  <div class="editor-container">
    <textarea
      v-model="localContent"
      @input="onInput"
      @keydown="handleKeydown"
      placeholder="开始输入..."
      spellcheck="false"
      ref="textareaRef"
    ></textarea>
    <div class="status-bar">
      <span>行: {{ lineCount }} | 字: {{ charCount }} | 字符: {{ charCountNoSpaces }}</span>
      <span v-if="filePath" class="file-path">{{ filePath }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  filePath: string
  isModified: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'save': []
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const localContent = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  localContent.value = val
})

watch(localContent, (val) => {
  emit('update:modelValue', val)
})

const lineCount = computed(() => localContent.value.split('\n').length)
const charCount = computed(() => localContent.value.length)
const charCountNoSpaces = computed(() => localContent.value.replace(/\s/g, '').length)

const onInput = () => {
  // 自动调整高度
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  // Ctrl+S 保存
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    emit('save')
  }
}
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
}

textarea {
  flex: 1;
  width: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  outline: none;
  padding: 20px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}

textarea::placeholder {
  color: #555;
}

.status-bar {
  height: 24px;
  background: #007acc;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
}

.file-path {
  opacity: 0.8;
}
</style>
```

#### 配置文件

```json
// package.json
{
  "name": "electron-notepad",
  "version": "1.0.0",
  "description": "A simple notepad built with Electron and Vue3",
  "main": "dist-electron/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "pack": "electron-builder --dir",
    "dist": "electron-builder"
  },
  "build": {
    "appId": "com.example.notepad",
    "productName": "简易记事本",
    "directories": {
      "output": "release/${version}"
    },
    "files": [
      "dist-electron/**/*",
      "dist/**/*"
    ],
    "win": {
      "target": ["nsis"],
      "icon": "build/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "build/icon.icns"
    },
    "linux": {
      "target": ["AppImage"],
      "icon": "build/icon.png"
    }
  }
}
```

```typescript
// electron.vite.config.ts
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts')
        }
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [vue()]
  }
})
```

#### 运行和打包

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 打包应用
npm run dist
```

**本章实战项目总结：**

- ✅ 完整的Electron + Vue3项目结构
- ✅ 主进程与渲染进程IPC通信
- ✅ 自定义标题栏实现
- ✅ 文件读写功能
- ✅ 应用菜单和系统托盘
- ✅ 跨平台打包配置

---
