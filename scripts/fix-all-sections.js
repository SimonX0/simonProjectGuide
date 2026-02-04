import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const guideDir = 'E:/AllProject/VueProject/simon-guide-docs/docs/guide';

// 修复单个章节文件的所有级别标题编号
function fixChapterAllNumbers(chapterNum) {
  const fileNum = String(chapterNum).padStart(2, '0');
  const filePath = path.join(guideDir, `chapter-${fileNum}.md`);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: chapter-${fileNum}.md`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  let fixCount = 0;

  // 修复三级标题 ### x.y -> ### chapterNum.y
  const before3 = (content.match(/^###\s+\d+\.\d+/gm) || []).length;
  content = content.replace(/^###\s+(\d+)\.(\d+)\s*/gm, (match, chapterPart, sectionPart) => {
    fixCount++;
    return `### ${chapterNum}.${sectionPart} `;
  });

  // 修复四级标题 #### x.y.z -> #### chapterNum.y.z
  const before4 = (content.match(/^####\s+\d+\.\d+\.\d+/gm) || []).length;
  content = content.replace(/^####\s+(\d+)\.(\d+)\.(\d+)\s*/gm, (match, chapterPart, sectionPart, subSection) => {
    fixCount++;
    return `#### ${chapterNum}.${sectionPart}.${subSection} `;
  });

  // 修复五级标题 ##### x.y.z.t -> ##### chapterNum.y.z.t
  const before5 = (content.match(/^#####\s+\d+\.\d+\.\d+\.\d+/gm) || []).length;
  content = content.replace(/^#####\s+(\d+)\.(\d+)\.(\d+)\.(\d+)\s*/gm, (match, chapterPart, sectionPart, subSection, subSubSection) => {
    fixCount++;
    return `##### ${chapterNum}.${sectionPart}.${subSection}.${subSubSection} `;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ chapter-${fileNum}.md: 修复了 ${fixCount} 处 (###:${before3}, ####:${before4}, #####:${before5})`);
    return true;
  } else {
    console.log(`ℹ️  chapter-${fileNum}.md: 无需修复`);
    return false;
  }
}

// 主函数
function main() {
  console.log('开始修复所有章节的所有级别标题...\n');
  console.log('='.repeat(70));

  let totalFixed = 0;

  // 修复所有章节（0-46）
  for (let i = 0; i <= 46; i++) {
    const fixed = fixChapterAllNumbers(i);
    if (fixed) totalFixed++;
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n✨ 修复完成！共修复 ${totalFixed} 个文件`);
}

main();
