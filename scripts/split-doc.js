import fs from 'fs'
import path from 'path'

const sourceFile = 'E:/AllProject/VueProject/simon-guide-docs/Vue3从零开始学习教程_fixed.md'
const outputDir = 'E:/AllProject/VueProject/simon-guide-docs/docs/guide'

// 清空输出目录中的章节文件
console.log('🗑️  清理旧的章节文件...')
if (fs.existsSync(outputDir)) {
  const files = fs.readdirSync(outputDir)
  files.forEach(file => {
    if (file.startsWith('chapter-') && file.endsWith('.md')) {
      fs.unlinkSync(path.join(outputDir, file))
      console.log(`  删除: ${file}`)
    }
  })
}

// 创建输出目录
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

console.log('\n📖 开始拆分文档...\n')

// 读取文档
const content = fs.readFileSync(sourceFile, 'utf-8')

// 章节映射表
const chapterMapping = {
  '第0章': 'chapter-00',
  '第1章': 'chapter-01',
  '第2章': 'chapter-02',
  '第3章': 'chapter-03',
  '第4章': 'chapter-04',
  '第5章': 'chapter-05',
  '第6章': 'chapter-06',
  '第7章': 'chapter-07',
  '第8章': 'chapter-08',
  '第9章': 'chapter-09',
  '第10章': 'chapter-10',
  '第11章': 'chapter-11',
  '第12章': 'chapter-12',
  '第13章': 'chapter-13',
  '第14章': 'chapter-14',
  '第15章': 'chapter-15',
  '第16章': 'chapter-16',
  '第17章': 'chapter-17',
  '第18章': 'chapter-18',
  '第19章': 'chapter-19',
  '第20章': 'chapter-20',
  '第21章': 'chapter-21',
  '第22章': 'chapter-22',
  '第23章': 'chapter-23',
  '第24章': 'chapter-24',
  '第25章': 'chapter-25',
  '第26章': 'chapter-26',
  '第27章': 'chapter-27',
  '第28章': 'chapter-28',
  '第29章': 'chapter-29',
  '第30章': 'chapter-30',
  '第31章': 'chapter-31',
  '第32章': 'chapter-32',
  '第33章': 'chapter-33',
  '第34章': 'chapter-34',
  '第35章': 'chapter-35',
  '第36章': 'chapter-36',
  '第37章': 'chapter-37',
  '第38章': 'chapter-38',
  '第39章': 'chapter-39',
  '第40章': 'chapter-40',
  '第41章': 'chapter-41',
  '第42章': 'chapter-42',
  '第43章': 'chapter-43',
  '第44章': 'chapter-44',
  '第45章': 'chapter-45',
  '第46章': 'chapter-46'
}

// 附录映射表
const appendixMapping = {
  '附录：实战项目': 'appendix-projects',
  '附录：学习资源推荐': 'appendix-resources',
  '附录B：VSCode配置推荐': 'appendix-vscode',
  '附录C：代码模板与脚手架': 'appendix-templates',
  '附录D：快速开始检查清单': 'appendix-checklist'
}

// 拆分文档
function splitDocument(content) {
  const lines = content.split('\n')
  const files = []
  let currentFile = null
  let currentTitle = ''
  let currentContent = []
  let inAppendix = false

  lines.forEach((line, index) => {
    // 检测章节标题
    const chapterMatch = line.match(/^## 第(\d+)章\s+(.+)/)
    const appendixMatch = line.match(/^## 附录[：:]\s*(.+)/)

    if (chapterMatch) {
      const chapterNum = chapterMatch[1]
      const chapterTitle = chapterMatch[2].trim()
      const filename = `chapter-${chapterNum.padStart(2, '0')}.md`

      // 保存前一个文件
      if (currentFile) {
        files.push({
          filename: currentFile,
          title: currentTitle,
          content: currentContent.join('\n')
        })
      }

      // 开始新文件
      currentFile = filename
      currentTitle = `第${chapterNum}章：${chapterTitle}`
      currentContent = [line]
      inAppendix = false
    } else if (appendixMatch) {
      const appendixTitle = appendixMatch[1].trim()
      const filename = appendixMapping[appendixTitle] || 'appendix.md'

      // 保存前一个文件
      if (currentFile) {
        files.push({
          filename: currentFile,
          title: currentTitle,
          content: currentContent.join('\n')
        })
      }

      // 开始新附录文件
      currentFile = filename
      currentTitle = appendixTitle
      currentContent = [line]
      inAppendix = true
    } else {
      if (currentFile) {
        currentContent.push(line)
      }
    }
  })

  // 保存最后一个文件
  if (currentFile) {
    files.push({
      filename: currentFile,
      title: currentTitle,
      content: currentContent.join('\n')
    })
  }

  return files
}

// 执行拆分
const files = splitDocument(content)

// 写入文件
files.forEach((file, index) => {
  const filepath = path.join(outputDir, file.filename)

  // 添加前言
  let fullContent = `# ${file.title}\n\n`
  fullContent += file.content

  fs.writeFileSync(filepath, fullContent, 'utf-8')
  console.log(`✅ [${index + 1}/${files.length}] 创建文件: ${file.filename}`)
})

console.log(`\n🎉 成功拆分 ${files.length} 个文件！`)
console.log(`\n📁 文件保存在: ${outputDir}/`)
console.log('\n下一步：')
console.log('  1. 检查 docs/guide/ 目录中的章节文件')
console.log('  2. 运行 pnpm docs:dev 启动开发服务器')
console.log('  3. 访问 http://localhost:5173 查看文档')
