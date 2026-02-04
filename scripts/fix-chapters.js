import fs from 'fs'

const sourceFile = 'E:/AllProject/VueProject/simon-guide-docs/Vue3从零开始学习教程.md'
const outputFile = 'E:/AllProject/VueProject/simon-guide-docs/Vue3从零开始学习教程_fixed.md'

console.log('📖 开始修复文档章节编号...\n')

// 读取文档
const content = fs.readFileSync(sourceFile, 'utf-8')
const lines = content.split('\n')

// 提取所有章节（严格匹配"第X章"格式）
const chapters = []
let currentChapterNum = 0

lines.forEach((line, index) => {
  // 严格匹配 "## 第X章 标题" 格式
  const match = line.match(/^##\s+第(\d+)章\s+(.+)$/)

  if (match) {
    const originalNum = parseInt(match[1])
    const title = match[2].trim()

    chapters.push({
      lineNumber: index + 1,
      originalLine: line,
      originalNum: originalNum,
      title: title,
      newNum: currentChapterNum
    })
    currentChapterNum++
  }
})

console.log(`📊 找到 ${chapters.length} 个章节\n`)

// 按原始章节号分组，找出重复的
const chapterGroups = {}
chapters.forEach(ch => {
  if (!chapterGroups[ch.originalNum]) {
    chapterGroups[ch.originalNum] = []
  }
  chapterGroups[ch.originalNum].push(ch)
})

// 显示重复的章节
console.log('📋 检测到重复的章节：')
Object.entries(chapterGroups).forEach(([num, chs]) => {
  if (chs.length > 1) {
    console.log(`  第${num}章 重复 ${chs.length} 次:`)
    chs.forEach(ch => {
      console.log(`    - 第${ch.newNum}行: ${ch.title}`)
    })
  }
})

// 修复文档：重新编号所有章节
const linesCopy = [...lines]
let replacementCount = 0

chapters.forEach((ch, index) => {
  const lineNum = ch.lineNumber - 1
  const newLine = `## 第${index}章 ${ch.title}`

  if (linesCopy[lineNum] !== newLine) {
    linesCopy[lineNum] = newLine
    replacementCount++
  }
})

const fixedContent = linesCopy.join('\n')

// 保存修复后的文件
fs.writeFileSync(outputFile, fixedContent, 'utf-8')

console.log(`\n✅ 修复完成！`)
console.log(`   - 总共 ${chapters.length} 个章节`)
console.log(`   - 修复了 ${replacementCount} 个章节编号`)
console.log(`   - 原始文件: ${sourceFile}`)
console.log(`   - 修复文件: ${outputFile}`)

console.log(`\n📝 新的章节列表：`)
chapters.forEach((ch, i) => {
  console.log(`  第${i}章: ${ch.title}`)
})

console.log(`\n下一步：运行 node scripts/split-doc.js 重新切割文档`)
