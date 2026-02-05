#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查侧边栏锚点配置 - 通用版本
自动检查 sidebar.ts 中配置的所有锚点是否在对应的 Markdown 文件中存在
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

    # 提取所有带锚点的链接，例如：'/ai/chapter-03#核心原则'
    anchor_links = re.findall(r"link: '([^']+)#([^']+)'", content)

    results = []
    for file_path, anchor in anchor_links:
        # 移除开头的 /
        file_path = file_path.lstrip('/')
        # 添加 .md 后缀（如果需要）
        if not file_path.endswith('.md'):
            # 检查是否是目录链接（如 /ai/）
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


def extract_anchor_definitions(md_file):
    """从 Markdown 文件中提取所有显式定义的锚点"""
    if not Path(md_file).exists():
        return []

    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 匹配显式锚点定义，如：## 标题 {#anchor}
    explicit_anchors = re.findall(r'\{#([^}]+)\}', content)

    # 同时提取所有标题（用于生成建议）
    headings = re.findall(r'^#{1,6}\s+(.+?)(?:\s+\{#.+?\})?$', content, re.MULTILINE)

    return {
        'explicit': explicit_anchors,
        'headings': headings
    }


def check_anchors():
    """检查所有锚点配置"""
    sidebar_file = Path("docs/.vitepress/sidebar.ts")

    if not sidebar_file.exists():
        print("❌ 错误: 找不到 docs/.vitepress/sidebar.ts")
        return False

    print("=== 检查侧边栏锚点配置 ===\n")
    print("[步骤 1/2] 提取 sidebar.ts 中的锚点配置...\n")

    anchor_configs = extract_anchors_from_sidebar(sidebar_file)

    if not anchor_configs:
        print("✅ 未发现任何锚点配置")
        return True

    print(f"🔍 发现 {len(anchor_configs)} 个锚点配置\n")

    print("[步骤 2/2] 验证锚点是否存在...\n")

    all_valid = True
    errors = []

    for config in anchor_configs:
        md_file = config['file']
        anchor = config['anchor']
        full_link = config['full_link']

        # 检查文件是否存在
        if not Path(md_file).exists():
            print(f"❌ [{full_link}]")
            print(f"   文件不存在: {md_file}\n")
            all_valid = False
            errors.append({
                'type': 'file_not_found',
                'link': full_link,
                'detail': f'文件不存在: {md_file}'
            })
            continue

        # 提取文件中的锚点定义
        anchor_data = extract_anchor_definitions(md_file)
        defined_anchors = anchor_data['explicit']

        # 检查锚点是否定义
        if anchor in defined_anchors:
            print(f"✅ [{full_link}]")
        else:
            print(f"❌ [{full_link}]")
            print(f"   锚点 '{anchor}' 在 {md_file} 中未定义\n")

            # 查找相似的标题作为建议
            headings = anchor_data['headings']
            if headings:
                print(f"   💡 文件中找到以下标题（可作为参考）：")
                for heading in headings[:5]:  # 只显示前5个
                    print(f"      - {heading}")
                if len(headings) > 5:
                    print(f"      ... 还有 {len(headings) - 5} 个标题")
                print()

            all_valid = False
            errors.append({
                'type': 'anchor_not_found',
                'link': full_link,
                'anchor': anchor,
                'file': md_file,
                'headings': headings
            })

    print("\n" + "=" * 40)
    print("          检查报告")
    print("=" * 40 + "\n")

    if all_valid:
        print("✅ 所有锚点配置正确！")
        print(f"\n共检查了 {len(anchor_configs)} 个锚点，全部有效。")
    else:
        print(f"⚠️  发现 {len(errors)} 个错误：\n")
        for i, error in enumerate(errors, 1):
            if error['type'] == 'file_not_found':
                print(f"{i}. 文件不存在: {error['link']}")
                print(f"   {error['detail']}")
            elif error['type'] == 'anchor_not_found':
                print(f"{i}. 锚点未定义: {error['link']}")
                print(f"   在文件 {error['file']} 中未找到锚点 '{error['anchor']}'")

        print("\n" + "=" * 40)
        print("\n💡 修复建议：")
        print("\n1. **方案一：修改 sidebar.ts**")
        print("   - 更新 sidebar.ts 中的锚点配置，使其与文档中的显式锚点匹配")
        print("\n2. **方案二：在 Markdown 文件中添加显式锚点**")
        print("   - 在标题后添加 {#你的锚点}，例如：")
        print("   - ```markdown")
        print("     ## 你的标题 {#你的锚点}")
        print("     ```")
        print("\n3. **方案三：清理 VitePress 缓存**")
        print("   - 如果锚点存在但跳转不工作，可能是缓存问题：")
        print("   - 删除 docs/.vitepress/cache 目录")
        print("   - 重新运行 npm run dev")

    return all_valid


if __name__ == "__main__":
    success = check_anchors()
    sys.exit(0 if success else 1)
