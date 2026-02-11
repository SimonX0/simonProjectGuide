#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动修复顶部导航栏与侧边栏的不一致
在 sidebar.ts 中自动添加缺失的父级分组
"""

import re
import sys
import io
from pathlib import Path

# 设置标准输出为 UTF-8 编码（Windows 兼容）
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def normalize_text(text):
    """标准化文本用于匹配：移除emoji、空格、特殊字符"""
    import unicodedata
    # 移除emoji
    cleaned = ''.join(char for char in text
                      if unicodedata.category(char) not in ('So', 'Sk', 'Sm'))
    # 移除空格和特殊分隔符
    cleaned = cleaned.replace(' ', '').replace('、', '').replace('/', '')
    return cleaned.strip().lower()


def is_similar_match(nav_item, sidebar_group):
    """检查导航栏项目和侧边栏分组是否相似匹配"""
    nav_norm = normalize_text(nav_item)
    sidebar_norm = normalize_text(sidebar_group)

    # 精确匹配（去除emoji后）
    if nav_norm == sidebar_norm:
        return True

    # 包含匹配
    if nav_norm in sidebar_norm or sidebar_norm in nav_norm:
        return True

    # 关键词匹配（提取主要词汇）
    nav_keywords = set(nav_norm.split())
    sidebar_keywords = set(sidebar_norm.split())

    # 如果有共同的关键词，认为是匹配
    common = nav_keywords & sidebar_keywords
    if common and len(common) >= min(len(nav_keywords), len(sidebar_keywords)):
        return True

    return False


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


def add_missing_groups():
    """在 sidebar.ts 中添加缺失的父级分组"""
    nav_file = Path("docs/.vitepress/nav.ts")
    sidebar_file = Path("docs/.vitepress/sidebar.ts")

    if not nav_file.exists():
        print("❌ 错误: 找不到 docs/.vitepress/nav.ts")
        return False

    if not sidebar_file.exists():
        print("❌ 错误: 找不到 docs/.vitepress/sidebar.ts")
        return False

    print("=== 自动修复导航栏与侧边栏一致性 ===\n")

    # 提取导航栏分组
    nav_groups = extract_nav_groups(nav_file)

    # 提取侧边栏分组
    sidebar_groups = extract_sidebar_groups(sidebar_file)

    # 允许的不一致映射（导航栏项目 -> 侧边栏分组）
    # 这些是已知的有意设计的不一致，不需要修复
    allowed_mismatches = {
        "🚀 进阶之路": ["进阶部分", "进阶"],
        "💻 前端面试题": ["前端开发面试题"],
        "🐳 容器化编排": ["容器化与编排"],
        "⚙️ CI/CD自动化": ["CI/CD与自动化", "CI/CD自动化"],
        "📊 监控运维": ["监控与运维"],
        "💼 综合实战项目": ["企业级实战项目", "🚀 企业级实战项目", "实战项目"],
        "💼 实战项目": ["实战项目"],
        "🔄 进阶实战": ["进阶"],
        "⚡ 进阶实战": ["进阶"],
        "🌟 拓展提升": ["拓展", "高级"]
    }

    # 建立映射关系（nav.ts 分组名 → sidebar.ts 模块名）
    module_mapping = {
        "💻 前端全栈": "guide",
        "☕ Java 架构师之路": "java",
        "📝 面试通关秘籍": "interview",
        "🔧 Git 完全指南": "git",
        "🤖 AI 应用开发": "ai",
        "🚀 DevOps 实战": "devops"
    }

    # 应该跳过的项目
    skip_items = ["学习路线", "📚 学习路线", "📖 工具速查", "💼 实战项目", "💼 综合实战项目", "实战项目"]

    print("[步骤 1/3] 分析缺失的分组...\n")

    # 收集需要添加的分组
    to_add = {}  # {module_name: [groups_to_add]}

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
            # 跳过不应该在父级分组中的特殊项目
            if any(skip_item in item for skip_item in skip_items):
                continue

            # 检查是否有匹配（精确匹配或相似匹配）
            found = False
            for sidebar_item in sidebar_items:
                if is_similar_match(item, sidebar_item):
                    found = True
                    break

            # 检查是否在允许的不一致白名单中
            if not found and item in allowed_mismatches:
                for allowed_sidebar in allowed_mismatches[item]:
                    if allowed_sidebar in sidebar_items:
                        found = True
                        break

            if not found:
                # 需要添加这个分组
                if sidebar_module not in to_add:
                    to_add[sidebar_module] = []
                to_add[sidebar_module].append(item)

    if not to_add:
        print("✅ 没有缺失的分组，无需修复")
        return True

    print(f"📋 发现 {sum(len(groups) for groups in to_add.values())} 个缺失的分组：\n")
    for module, groups in to_add.items():
        print(f"  [{module}]")
        for group in groups:
            print(f"    - {group}")
    print()

    print("[步骤 2/3] 在 sidebar.ts 中添加缺失的分组...\n")

    # 读取 sidebar.ts 内容
    with open(sidebar_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 备份原文件
    backup_file = sidebar_file.with_suffix('.ts.backup.' + str(int(Path().stat().st_mtime)) + '.bak')
    import shutil
    shutil.copy2(sidebar_file, backup_file)
    print(f"✅ 已备份原文件到: {backup_file.name}\n")

    # 对每个模块添加缺失的分组
    modified = False
    for module, groups_to_add in to_add.items():
        print(f"处理 {module} 模块...")

        # 找到该模块的位置
        module_pattern = f"link: '/{module}/'"
        module_match = re.search(module_pattern, content)

        if not module_match:
            print(f"  ⚠️  找不到模块 '{module}'")
            continue

        # 确定模块区域的结束位置（下一个 link: 或文件结尾）
        next_module_match = re.search(r"link:\s*'/[^/]+'", content[module_match.end():])

        if next_module_match:
            module_end = module_match.end() + next_module_match.start()
        else:
            module_end = len(content)

        module_content = content[module_match.start():module_end]

        # 检查该模块中已有的父级分组
        existing_groups = re.findall(
            r'text:\s*["\']([^"\']+)["\'],\s*collapsible:\s*true',
            module_content
        )

        # 只添加不存在的分组
        new_groups = []
        for group in groups_to_add:
            # 检查是否已存在（相似匹配）
            exists = False
            for existing in existing_groups:
                if is_similar_match(group, existing):
                    exists = True
                    break

            if not exists:
                new_groups.append(group)

        if not new_groups:
            print(f"  ✅ 所有分组都已存在")
            continue

        # 找到插入位置：在第一个 collapsible: true 之前或模块的 items 之前
        insert_pos = module_match.end()

        # 尝试找到第一个 collapsible 的位置
        collapsible_match = re.search(
            r'text:\s*["\'][^"\']+["\'],\s*collapsible:\s*true',
            content[insert_pos:module_end]
        )

        if collapsible_match:
            insert_pos += collapsible_match.start()
        else:
            # 如果没有 collapsible 分组，尝试找到 items 的位置
            items_match = re.search(
                r'items:\s*\[',
                content[insert_pos:module_end]
            )
            if items_match:
                insert_pos += items_match.start()
            else:
                print(f"  ⚠️  无法确定插入位置")
                continue

        # 生成要插入的内容
        indent = "    "  # 4 个空格缩进

        new_content = ""
        for group in new_groups:
            new_content += f'{indent}{{\n'
            new_content += f'{indent}  text: "{group}",\n'
            new_content += f'{indent}  collapsible: true,\n'
            new_content += f'{indent}  items: []\n'
            new_content += f'{indent}}},\n'

        # 插入新内容
        content = content[:insert_pos] + new_content + content[insert_pos:]

        print(f"  ✅ 已添加 {len(new_groups)} 个分组")
        modified = True

    if not modified:
        print("\n⚠️  没有需要添加的分组")
        return True

    print("\n[步骤 3/3] 写入修复后的文件...\n")

    # 写入修复后的内容
    with open(sidebar_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print("✅ 修复完成！\n")
    print("💡 后续步骤：")
    print("   1. 检查 docs/.vitepress/sidebar.ts")
    print("   2. 为新增的空分组添加实际的子项")
    print("   3. 运行 check-nav-sidebar-consistency.py 验证修复")
    print()

    return True


if __name__ == "__main__":
    success = add_missing_groups()
    sys.exit(0 if success else 1)
