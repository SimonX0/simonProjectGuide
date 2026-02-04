import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const guideDir = 'E:/AllProject/VueProject/simon-guide-docs/docs/guide';

// 修复单个章节文件的内部编号
function fixChapterInternalNumbers(chapterNum) {
  const fileNum = String(chapterNum).padStart(2, '0');
  const filePath = path.join(guideDir, `chapter-${fileNum}.md`);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: chapter-${fileNum}.md`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  console.log(`\n处理 chapter-${fileNum}.md`);

  // 显示修改前的章节
  const beforeSections = content.match(/^###\s+\d+\.\d+/gm);
  if (beforeSections) {
    console.log('修改前:', beforeSections.slice(0, 3).join(', '));
  }

  // 替换所有 ### x.y 为 ### chapterNum.y
  // 使用正则匹配所有 ### 开头的章节编号
  content = content.replace(/^###\s+(\d+)\.(\d+)\s*/gm, (match, chapterPart, sectionPart) => {
    return `### ${chapterNum}.${sectionPart} `;
  });

  // 显示修改后的章节
  const afterSections = content.match(/^###\s+\d+\.\d+/gm);
  if (afterSections) {
    console.log('修改后:', afterSections.slice(0, 3).join(', '));
  }

  // 如果有修改，写回文件
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ 已修复`);
  } else {
    console.log(`ℹ️  无需修复`);
  }
}

// 主函数
function main() {
  console.log('开始修复章节内部编号...\n');
  console.log('='.repeat(60));
  console.log('将所有章节文件内部的 ### x.y 编号改为与文件名一致\n');

  // 修复所有章节（0-46）
  for (let i = 0; i <= 46; i++) {
    fixChapterInternalNumbers(i);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✨ 修复完成！');
}

main();
