#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动修复侧边栏锚点配置 - 通用版本
自动在 Markdown 文件中添加缺失的显式锚点
"""

import re
import sys
import io
from pathlib import Path

# 设置标准输出为 UTF-8 编码（Windows 兼容）
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def extract_anchors_from_sidebar(sidebar_file):
    """从 sidebar.ts 中提取所有锚点配置"""
    with open(sidebar_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取所有带锚点的链接
    anchor_links = re.findall(r"link: '([^']+)#([^']+)'", content)

    results = []
    for file_path, anchor in anchor_links:
        file_path = file_path.lstrip('/')
        if not file_path.endswith('.md'):
            if file_path.endswith('/'):
                md_file = f"docs/{file_path}index.md"
            else:
                md_file = f"docs/{file_path}.md"
        else:
            md_file = f"docs/{file_path}"

        results.append({
            'file': md_file,
            'anchor': anchor,
            'full_link': f"{file_path}#{anchor}"
        })

    return results


def find_heading_line(md_file, anchor):
    """查找与锚点匹配的标题行号"""
    if not Path(md_file).exists():
        return None

    with open(md_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 清理锚点，移除特殊字符
    clean_anchor = anchor.lower().replace('-', ' ').replace('_', ' ')

    for i, line in enumerate(lines):
        # 匹配标题行
        heading_match = re.match(r'^(#{1,6})\s+(.+?)(?:\s+\{#.+?\})?\s*$', line)
        if heading_match:
            level = heading_match.group(1)
            title = heading_match.group(2).strip()

            # 移除标题中的特殊符号和 markdown 格式
            clean_title = title.lower()
            clean_title = re.sub(r'[^\w\s\u4e00-\u9fff]', '', clean_title)  # 保留中文
            clean_title = re.sub(r'\s+', ' ', clean_title).strip()

            # 清理锚点
            clean_anchor_normalized = re.sub(r'[^\w\s\u4e00-\u9fff]', '', clean_anchor)
            clean_anchor_normalized = re.sub(r'\s+', ' ', clean_anchor_normalized).strip()

            # 模糊匹配
            if clean_anchor_normalized in clean_title or clean_title in clean_anchor_normalized:
                # 检查是否已经有显式锚点
                if '{#' not in line:
                    return i, title, level

    return None


def add_anchor_to_heading(md_file, line_num, title, level, anchor):
    """在标题后添加显式锚点"""
    with open(md_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 替换该行，添加锚点
    original_line = lines[line_num]
    anchor_syntax = '{#' + anchor + '}'
    new_line = f"{level} {title} {anchor_syntax}\n"

    lines[line_num] = new_line

    # 写回文件
    with open(md_file, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    return True


def fix_anchors():
    """修复所有缺失的锚点"""
    sidebar_file = Path("docs/.vitepress/sidebar.ts")

    if not sidebar_file.exists():
        print("❌ 错误: 找不到 docs/.vitepress/sidebar.ts")
        return False

    print("=== 自动修复侧边栏锚点 ===\n")
    print("[步骤 1/3] 提取 sidebar.ts 中的锚点配置...\n")

    anchor_configs = extract_anchors_from_sidebar(sidebar_file)

    if not anchor_configs:
        print("✅ 未发现任何锚点配置")
        return True

    print(f"🔍 发现 {len(anchor_configs)} 个锚点配置\n")

    print("[步骤 2/3] 检查并修复缺失的锚点...\n")

    fixed_count = 0
    not_found_count = 0
    already_has_anchor = 0
    errors = []

    for config in anchor_configs:
        md_file = config['file']
        anchor = config['anchor']
        full_link = config['full_link']

        # 检查文件是否存在
        if not Path(md_file).exists():
            print(f"⚠️  [{full_link}] 文件不存在: {md_file}")
            not_found_count += 1
            continue

        # 检查文件中是否已经有这个锚点
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        if f'{{#{anchor}}}' in content:
            # 锚点已存在
            already_has_anchor += 1
        else:
            # 锚点不存在，尝试查找匹配的标题
            result = find_heading_line(md_file, anchor)

            if result:
                line_num, title, level = result
                # 添加锚点
                if add_anchor_to_heading(md_file, line_num, title, level, anchor):
                    print(f"✅ [{full_link}] 已添加锚点")
                    fixed_count += 1
                else:
                    print(f"❌ [{full_link}] 添加失败")
                    errors.append(full_link)
            else:
                # 找不到匹配的标题
                not_found_count += 1
                print(f"⚠️  [{full_link}] 找不到匹配的标题")

    print(f"\n[步骤 3/3] 生成报告...\n")

    print("=" * 40)
    print("          修复报告")
    print("=" * 40 + "\n")

    print(f"✅ 成功添加: {fixed_count} 个锚点")
    print(f"✅ 已存在: {already_has_anchor} 个锚点")
    print(f"⚠️  无法匹配: {not_found_count} 个锚点")

    if errors:
        print(f"\n❌ 添加失败: {len(errors)} 个锚点")
        for error in errors:
            print(f"   - {error}")

    all_valid = (not_found_count == 0 and len(errors) == 0)

    if all_valid:
        print("\n🎉 所有锚点都已正确配置！")
    else:
        print("\n⚠️  部分锚点无法自动修复")
        print("\n💡 建议：")
        print("1. 手动检查无法匹配的锚点")
        print("2. 确认 sidebar.ts 中的锚点拼写是否正确")
        print("3. 在对应的 Markdown 文件中手动添加显式锚点")

    return all_valid


if __name__ == "__main__":
    success = fix_anchors()
    sys.exit(0 if success else 1)
