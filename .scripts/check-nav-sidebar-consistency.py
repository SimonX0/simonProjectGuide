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


def remove_emoji(text):
    """移除emoji，保留文本用于匹配"""
    import unicodedata
    # 移除所有emoji和符号
    cleaned = ''.join(char for char in text
                      if unicodedata.category(char) not in ('So', 'Sk', 'Sm'))
    return cleaned.strip()


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

    # 允许的不一致映射（导航栏项目 -> 侧边栏分组）
    # 这些是已知的有意设计的不一致，不需要报告
    allowed_mismatches = {
        "🚀 进阶之路": ["进阶部分", "进阶"],
        "💻 前端面试题": ["前端开发面试题"],
        "🐳 容器化编排": ["容器化与编排"],
        "⚙️ CI/CD自动化": ["CI/CD与自动化", "CI/CD自动化"],
        "📊 监控运维": ["监控与运维"],
        "💼 综合实战项目": ["企业级实战项目", "🚀 企业级实战项目", "实战项目"],
        "💼 实战项目": ["实战项目"],  # Java实战项目在各个章节中
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
            skip_items = ["学习路线", "📚 学习路线", "📖 工具速查", "💼 实战项目", "💼 综合实战项目", "实战项目"]
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
