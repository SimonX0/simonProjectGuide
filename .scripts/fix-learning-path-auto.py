#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动修复学习路径图 - 自动更新版本
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


def update_learning_path_index(index_file, expected_chapters):
    """更新 index.md 中的学习路径图"""
    if not index_file.exists():
        return False, "文件不存在"

    with open(index_file, 'r', encoding='utf-8') as f:
        content = f.read()

    if not expected_chapters:
        return False, "没有章节信息"

    first = expected_chapters[0]
    last = expected_chapters[-1]

    # 生成新的学习路径图
    # 检查文件中是否已有学习路径图
    has_learning_path = '（第' in content or '(第' in content

    # 生成范围字符串
    range_pattern = f'（第{first}-{last}章）'

    if has_learning_path:
        # 替换现有的学习路径图
        # 匹配各种格式的范围表示
        # （第1-10章）或 (第1-10章)
        new_content = re.sub(
            r'[（\(]第\d+-\d+章[）\)]',
            range_pattern,
            content
        )
    else:
        # 在文件开头添加学习路径图
        title_match = re.search(r'^#+\s+.+', content, re.MULTILINE)
        if title_match:
            # 在第一个标题后添加
            insert_pos = title_match.end()
            new_content = content[:insert_pos] + f'\n\n## 学习路径\n\n{range_pattern}\n' + content[insert_pos:]
        else:
            # 在文件开头添加
            new_content = f'## 学习路径\n\n{range_pattern}\n\n' + content

    # 写入更新后的内容
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True, f"第{first}-{last}章"


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

    print("\n[步骤 2/3] 自动更新 index.md 文件...\n")

    updated_count = 0
    failed = []

    # 更新每个模块的 index.md
    for module, chapters in module_chapters.items():
        index_file = Path(f"docs/{module}/index.md")

        print(f"[{module}]")

        is_correct, expected = update_learning_path_index(index_file, chapters)

        print(f"  期望范围: {expected}")

        if is_correct:
            print("  ✅ 学习路径图已更新")
            updated_count += 1
        else:
            print(f"  ❌ 更新失败: {expected}")
            failed.append((module, expected))

        print()

    print("[步骤 3/3] 生成报告...\n")

    # 生成汇总报告
    print("=" * 40)
    print("          学习路径图自动修复报告")
    print("=" * 40 + "\n")

    if updated_count == len(module_chapters):
        print(f"🎉 成功更新所有 {updated_count} 个模块的学习路径图！\n")

        for module, chapters in module_chapters.items():
            first = chapters[0]
            last = chapters[-1]
            print(f"✅ [{module}] 学习路径图已更新 (第{first}-{last}章)")
    else:
        print(f"⚠️  部分模块更新失败\n")

        for module, chapters in module_chapters.items():
            index_file = Path(f"docs/{module}/index.md")
            is_correct, expected = update_learning_path_index(index_file, chapters)

            if is_correct:
                first = chapters[0]
                last = chapters[-1]
                print(f"✅ [{module}] 学习路径图已更新 (第{first}-{last}章)")
            else:
                print(f"❌ [{module}] 学习路径图更新失败")

    print("\n" + "=" * 40 + "\n")

    if failed:
        print("⚠️  以下模块更新失败：\n")
        for module, error in failed:
            print(f"  - {module}: {error}")
        print()
        print("💡 可能的原因：")
        print("   1. index.md 文件格式不正确")
        print("   2. 文件编码问题")
        print("   3. 文件权限问题")
        print()
        sys.exit(1)
    else:
        print("✅ 学习路径图自动修复完成！\n")
        sys.exit(0)


if __name__ == "__main__":
    main()
