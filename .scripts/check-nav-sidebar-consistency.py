#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查顶部导航栏与侧边栏的一致性
验证 nav.ts 的分组是否与 sidebar.ts 的父级分组对应
"""

import re
import sys
import io
from pathlib import Path

# 设置标准输出为 UTF-8 编码（Windows 兼容）
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def extract_nav_groups(nav_file):
    """从 nav.ts 中提取顶级分组"""
    with open(nav_file, 'r', encoding='utf-8') as f:
        content = f.read()

    groups = {}

    # 匹配顶级分组，如 { text: "前端开发", items: [...] }
    pattern = r'\{\s*text:\s*["\']([^"\']+)["\'],\s*items:\s*\[(.*?)\]'
    matches = re.findall(pattern, content, re.DOTALL)

    for match in matches:
        group_name = match[0]
        items_content = match[1]

        # 提取子菜单项
        items = re.findall(r'\{\s*text:\s*["\']([^"\']+)["\']', items_content)
        groups[group_name] = items

    return groups


def extract_sidebar_groups(sidebar_file):
    """从 sidebar.ts 中提取父级分组"""
    with open(sidebar_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 按模块分组
    modules = {}
    module_pattern = r"link:\s*'/([^/]+)/'"

    # 找到所有模块
    module_links = list(re.finditer(module_pattern, content))

    for i, match in enumerate(module_links):
        module_name = match.group(1)

        # 确定模块的结束位置
        if i + 1 < len(module_links):
            module_end = module_links[i + 1].start()
        else:
            module_end = len(content)

        module_content = content[match.start():module_end]

        # 提取父级分组（不包含 items 的 text 字段）
        # 匹配类似：text: '基础入门', collapsible: true
        parent_groups = re.findall(
            r'text:\s*["\']([^"\']+)["\'],\s*collapsible:\s*true',
            module_content
        )

        modules[module_name] = parent_groups

    return modules


def check_consistency():
    """检查 nav.ts 和 sidebar.ts 的一致性"""
    nav_file = Path("docs/.vitepress/nav.ts")
    sidebar_file = Path("docs/.vitepress/sidebar.ts")

    if not nav_file.exists():
        print("❌ 错误: 找不到 docs/.vitepress/nav.ts")
        return False

    if not sidebar_file.exists():
        print("❌ 错误: 找不到 docs/.vitepress/sidebar.ts")
        return False

    print("=== 检查顶部导航栏与侧边栏一致性 ===\n")

    # 提取导航栏分组
    nav_groups = extract_nav_groups(nav_file)

    # 提取侧边栏分组
    sidebar_groups = extract_sidebar_groups(sidebar_file)

    print("[步骤 1/2] 提取分组信息...\n")

    print("📋 顶部导航栏分组：")
    for group_name, items in nav_groups.items():
        print(f"  {group_name}:")
        for item in items:
            print(f"    - {item}")
    print()

    print("📋 侧边栏分组：")
    for module, groups in sidebar_groups.items():
        print(f"  {module}:")
        for group in groups:
            print(f"    - {group}")
    print()

    print("[步骤 2/2] 验证一致性...\n")

    all_correct = True
    errors = []

    # 建立映射关系
    module_mapping = {
        "前端开发": "guide",
        "Git 教程": "git",
        "AI 教程": "ai"
    }

    for nav_group, sidebar_module in module_mapping.items():
        if nav_group not in nav_groups:
            print(f"⚠️  导航栏中没有 '{nav_group}' 分组")
            continue

        if sidebar_module not in sidebar_groups:
            print(f"⚠️  侧边栏中没有 '{sidebar_module}' 模块")
            continue

        nav_items = nav_groups[nav_group]
        sidebar_items = sidebar_groups[sidebar_module]

        # 检查导航栏的子项是否都在侧边栏的父级分组中
        for item in nav_items:
            if item == "学习路线":
                # 学习路线通常是 index.md，不在父级分组中，跳过
                continue

            if item not in sidebar_items:
                print(f"❌ 不一致：")
                print(f"   导航栏 '{nav_group}' 中有 '{item}'")
                print(f"   但侧边栏 '{sidebar_module}' 中没有对应的父级分组")
                all_correct = False
                errors.append(f"{nav_group} -> {item}")

    if all_correct:
        print("✅ 所有分组都一致！")
        print()
        print("=" * 40)
        print("✅ 顶部导航栏与侧边栏配置完全对应")
        print("=" * 40)
    else:
        print()
        print("=" * 40)
        print("⚠️  发现不一致的分组")
        print("=" * 40)
        print()
        for error in errors:
            print(f"  - {error}")

    return all_correct


if __name__ == "__main__":
    success = check_consistency()
    sys.exit(0 if success else 1)
