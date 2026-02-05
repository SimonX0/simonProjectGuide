#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动修复学习路径图 - 通用版本
从 sidebar.ts 自动提取章节信息并更新所有模块的 index.md
"""

import re
import sys
import io
from pathlib import Path

# 设置标准输出为 UTF-8 编码（Windows 兼容）
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def extract_chapters_from_sidebar(sidebar_file, module):
    """从 sidebar.ts 中提取指定模块的所有章节编号"""
    with open(sidebar_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 找到该模块的起始位置
    module_pattern = f"link: '/{module}/"
    module_start = content.find(module_pattern)

    if module_start == -1:
        return []

    # 找到模块的结束位置（下一个 link: '/xxx/ 的开始或文件结尾）
    # 使用正则表达式查找所有模块链接
    all_links = list(re.finditer(r"link: '/([^/]+)/", content))

    # 找到当前模块之后的下一个链接
    module_end = len(content)
    for match in all_links:
        if match.start() > module_start and match.start() < module_end:
            module_end = match.start()

    # 提取该模块区域的内容
    module_content = content[module_start:module_end]

    # 提取所有章节编号（匹配"第X章"）
    chapters = re.findall(r'第(\d+)章', module_content)

    # 转换为整数并去重
    chapters = sorted(set(int(c) for c in chapters))

    return chapters

def check_learning_path_index(index_file, expected_chapters):
    """检查 index.md 中的学习路径图是否正确"""
    if not index_file.exists():
        return False, "文件不存在"

    with open(index_file, 'r', encoding='utf-8') as f:
        content = f.read()

    if not expected_chapters:
        return False, "没有章节信息"

    # 提取 index.md 中的所有章节范围
    ranges = re.findall(r'（第(\d+)-(\d+)章）', content)

    if not ranges:
        return False, "未找到学习路径图"

    # 计算所有范围的并集
    all_chapters = set()
    for start, end in ranges:
        all_chapters.update(range(int(start), int(end) + 1))

    expected_set = set(expected_chapters)

    # 检查是否覆盖了所有期望的章节
    if expected_set.issubset(all_chapters):
        first = expected_chapters[0]
        last = expected_chapters[-1]
        return True, f"第{first}-{last}章"
    else:
        missing = expected_set - all_chapters
        return False, f"缺少章节: {sorted(missing)}"

def main():
    sidebar_file = Path("docs/.vitepress/sidebar.ts")

    if not sidebar_file.exists():
        print("❌ 错误: 找不到 docs/.vitepress/sidebar.ts")
        sys.exit(1)

    print("=== 自动修复学习路径图 ===\n")
    print("[步骤 1/3] 自动发现模块并解析章节信息...\n")

    # 自动发现所有模块（查找 docs/ 下包含 index.md 的子目录）
    docs_dir = Path("docs")
    modules = []
    for item in docs_dir.iterdir():
        if item.is_dir() and not item.name.startswith('.') and not item.name.startswith('_'):
            # 检查是否有 index.md
            if (item / "index.md").exists():
                modules.append(item.name)

    if not modules:
        print("❌ 错误: 未找到任何模块（docs/ 下没有包含 index.md 的子目录）")
        sys.exit(1)

    print(f"🔍 自动发现 {len(modules)} 个模块: {', '.join(modules)}\n")

    module_chapters = {}

    # 提取每个模块的章节
    for module in modules:
        module_dir = Path(f"docs/{module}")
        if not module_dir.exists():
            print(f"  检查 {module} 模块...")
            print(f"    ⚠️  docs/{module} 不存在，跳过\n")
            continue

        chapters = extract_chapters_from_sidebar(sidebar_file, module)

        if not chapters:
            print(f"  检查 {module} 模块...")
            print(f"    ⚠️  未找到章节\n")
            continue

        first = chapters[0]
        last = chapters[-1]
        print(f"  检查 {module} 模块...")
        print(f"    发现 {len(chapters)} 个章节: 第{first}-{last}章")

        module_chapters[module] = chapters

    print("\n[步骤 2/3] 检查并更新 index.md 文件...\n")

    # 检查每个模块的 index.md
    for module, chapters in module_chapters.items():
        index_file = Path(f"docs/{module}/index.md")

        print(f"[{module}]")

        is_correct, expected = check_learning_path_index(index_file, chapters)

        print(f"  期望范围: {expected}")

        if is_correct:
            print("  ✅ 学习路径图已是最新")
        else:
            print("  ⚠️  需要更新")

            # 显示当前范围
            if index_file.exists():
                with open(index_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    current_ranges = re.findall(r'（第(\d+)-(\d+)章）', content)
                    if current_ranges:
                        print("  当前范围:")
                        for r in current_ranges[:5]:
                            print(f"    - 第{r[0]}-{r[1]}章")

            print("\n  💡 修复建议：")
            print(f"     需要将学习路径图中的章节范围更新为: {expected}")
            print(f"     请手动修改 docs/{module}/index.md 文件")

        print()

    print("[步骤 3/3] 生成报告...\n")

    # 生成汇总报告
    print("=" * 40)
    print("          学习路径图检查报告")
    print("=" * 40 + "\n")

    all_correct = True
    for module, chapters in module_chapters.items():
        index_file = Path(f"docs/{module}/index.md")
        is_correct, expected = check_learning_path_index(index_file, chapters)

        if is_correct:
            print(f"✅ [{module}] 学习路径图一致 ({expected})")
        else:
            print(f"⚠️  [{module}] 学习路径图需要更新 (应为: {expected})")
            all_correct = False

    print("\n" + "=" * 40 + "\n")
    print("✅ 学习路径图检查完成！\n")
    print("💡 提示: 如需更新，请手动修改相应的 index.md 文件")

    sys.exit(0 if all_correct else 1)

if __name__ == "__main__":
    main()
