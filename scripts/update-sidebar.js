import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const guideDir = 'E:/AllProject/VueProject/simon-guide-docs/docs/guide';

// 读取所有章节文件并提取标题
function extractChapterTitles() {
  const chapters = [];

  for (let i = 0; i <= 46; i++) {
    const fileNum = String(i).padStart(2, '0');
    const filePath = path.join(guideDir, `chapter-${fileNum}.md`);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // 查找第一个 # 标题
      for (const line of lines) {
        const match = line.match(/^#\s+第(\d+)章[：:]\s*(.+)$/);
        if (match) {
          chapters.push({
            num: i,
            title: match[2].trim()
          });
          break;
        }
      }
    }
  }

  return chapters;
}

const chapters = extractChapterTitles();

console.log('提取到的章节标题：\n');
chapters.forEach(ch => {
  console.log(`第${ch.num}章: ${ch.title}`);
});

// 生成侧边栏配置代码
console.log('\n\n=== 侧边栏配置 ===\n');

const groups = [
  { name: '准备篇', start: 0, end: 0 },
  { name: '基础入门', start: 1, end: 8 },
  { name: '组件开发', start: 9, end: 15 },
  { name: '企业级开发', start: 16, end: 24 },
  { name: '进阶部分', start: 25, end: 39 },
  { name: '高级拓展', start: 40, end: 46 }
];

groups.forEach(group => {
  console.log(`  {\n    text: '${group.name}',`);
  console.log('    collapsible: true,');
  console.log('    collapsed: false,');
  console.log('    items: [');

  for (let i = group.start; i <= group.end; i++) {
    const ch = chapters.find(c => c.num === i);
    if (ch) {
      const fileNum = String(i).padStart(2, '0');
      console.log(`      { text: '第${i}章：${ch.title}', link: '/guide/chapter-${fileNum}' },`);
    }
  }

  console.log('    ]\n  },');
});
