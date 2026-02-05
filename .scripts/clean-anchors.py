#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
清理 sidebar.ts 中无效的锚点配置
自动删除在 Markdown 文件中不存在的锚点链接
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
    """从 sidebar.ts 中提取所有锚点配置及其位置"""
    with open(sidebar_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    anchor_configs = []

    for i, line in enumerate(lines):
        # 匹配带锚点的链接，例如：{ text: 'xxx', link: '/ai/chapter-03#锚点' }
        match = re.search(r"link:\s*'([^']+)#([^']+)'", line)
        if match:
            file_path = match.group(1).lstrip('/')
            anchor = match.group(2)

            if not file_path.endswith('.md'):
                if file_path.endswith('/'):
                    md_file = f"docs/{file_path}index.md"
                else:
                    md_file = f"docs/{file_path}.md"
            else:
                md_file = f"docs/{file_path}"

            anchor_configs.append({
                'line_num': i,
                'line': line,
                'file': md_file,
                'anchor': anchor,
                'full_link': f"{file_path}#{anchor}"
            })

    return anchor_configs


def anchor_exists_in_file(md_file, anchor):
    """检查锚点是否在文件中存在"""
    if not Path(md_file).exists():
        return False

    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查显式锚点定义
    if f'{{#{anchor}}}' in content:
        return True

    return False


def clean_sidebar_anchors():
    """清理 sidebar.ts 中无效的锚点"""
    sidebar_file = Path("docs/.vitepress/sidebar.ts")

    if not sidebar_file.exists():
        print("❌ 错误: 找不到 docs/.vitepress/sidebar.ts")
        return False

    print("=== 清理 sidebar.ts 中无效的锚点 ===\n")
    print("[步骤 1/2] 检查锚点有效性...\n")

    # 读取文件
    with open(sidebar_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    anchor_configs = extract_anchors_from_sidebar(sidebar_file)

    if not anchor_configs:
        print("✅ 未发现任何锚点配置")
        return True

    print(f"🔍 发现 {len(anchor_configs)} 个锚点配置\n")

    # 找出无效的锚点
    invalid_anchors = []
    for config in anchor_configs:
        md_file = config['file']
        anchor = config['anchor']
        full_link = config['full_link']

        if not Path(md_file).exists():
            print(f"⚠️  [{full_link}] 文件不存在")
            invalid_anchors.append(config)
            continue

        if not anchor_exists_in_file(md_file, anchor):
            print(f"❌ [{full_link}] 锚点不存在")
            invalid_anchors.append(config)
        else:
            print(f"✅ [{full_link}]")

    print(f"\n[步骤 2/2] 清理无效锚点...\n")

    if not invalid_anchors:
        print("✅ 所有锚点配置都有效，无需清理")
        return True

    print(f"⚠️  发现 {len(invalid_anchors)} 个无效锚点\n")

    # 删除无效锚点（从后往前删除，避免行号错乱）
    # 需要判断是子节点还是父节点
    lines_to_remove = set()
    lines_to_modify = []

    for config in sorted(invalid_anchors, key=lambda x: x['line_num'], reverse=True):
        line_num = config['line_num']
        line = lines[line_num]

        # 检查是否是子节点（有 items 字段或缩进）
        is_child_node = '{' in line and 'text:' in line and 'link:' in line

        if is_child_node:
            # 子节点：直接删除这一行
            lines_to_remove.add(line_num)
            print(f"🗑️  删除子节点: {config['full_link']}")
        else:
            # 父节点：移除锚点部分
            # 例如：{ text: '第5章：xxx', link: '/ai/chapter-03#锚点', items: [...] }
            # 改为：{ text: '第5章：xxx', link: '/ai/chapter-03', items: [...] }
            new_line = re.sub(r"(link:\s*'[^']+)#[^']+'", r"\1'", line)
            if new_line != line:
                lines[line_num] = new_line
                print(f"🔧 修改父节点: 移除锚点 {config['anchor']}")
                lines_to_modify.append(line_num)

    # 写回文件
    new_lines = [line for i, line in enumerate(lines) if i not in lines_to_remove]

    with open(sidebar_file, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print(f"\n✅ 已清理 {len(lines_to_remove)} 个无效子节点")
    print(f"✅ 已修改 {len(lines_to_modify)} 个父节点")

    print("\n" + "=" * 40)
    print("          清理报告")
    print("=" * 40 + "\n")
    print(f"✅ 成功清理 {len(invalid_anchors)} 个无效锚点")
    print("\n💡 提示:")
    print("   - 已从 sidebar.ts 中删除无效的锚点配置")
    print("   - 如果需要子导航，请在 Markdown 文件中添加显式锚点 {#锚点}")
    print("   - 或手动添加子节点配置")

    return True


if __name__ == "__main__":
    success = clean_sidebar_anchors()
    sys.exit(0 if success else 1)
