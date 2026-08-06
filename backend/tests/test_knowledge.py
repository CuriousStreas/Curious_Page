from __future__ import annotations

import unittest

from backend.knowledge import parse_sections, retrieve


class KnowledgeTests(unittest.TestCase):
    def test_parse_sections_excludes_uncertain_lines(self) -> None:
        sections = parse_sections(
            """# 简历结构化知识

## 技能

- 后端：Flask, FastAPI
- 工具：Git, Docker（？）
- 本科：（待补充）
<!-- 这是一条编辑备注 -->
> 编辑提示：每条信息之间用空行分隔。
"""
        )

        self.assertEqual(len(sections), 1)
        self.assertEqual(sections[0].heading, "技能")
        self.assertEqual(sections[0].content, "- 后端：Flask, FastAPI")

    def test_parse_sections_keeps_verified_lines_beside_placeholders(self) -> None:
        sections = parse_sections(
            """## 实习经历

### 网易雷火

- 独立搭建 Web GM 工具
- （更多细节待补充）
"""
        )

        self.assertEqual(sections[0].heading, "实习经历 / 网易雷火")
        self.assertEqual(sections[0].content, "- 独立搭建 Web GM 工具")

    def test_retrieve_returns_relevant_verified_section(self) -> None:
        sections = parse_sections(
            """## 教育背景
- 浙江工业大学 计算机科学与技术

## 项目经历
### Web GM 工具
- 技术栈：Next.js + FastAPI + MongoDB + Redis
"""
        )

        result = retrieve("介绍一下 GM 工具", sections)

        self.assertEqual(len(result), 1)
        self.assertIn("Web GM 工具", result[0])
        self.assertIn("FastAPI", result[0])

    def test_retrieve_matches_ascii_terms_case_insensitively(self) -> None:
        sections = parse_sections(
            """## 技能
- 后端：Flask, FastAPI

## GameJam 经历
- 使用 Unity C# 开发游戏项目
"""
        )

        result = retrieve("做过哪些 UNITY 项目", sections)

        self.assertEqual(len(result), 1)
        self.assertIn("Unity C#", result[0])

    def test_retrieve_matches_heading_inside_chinese_question(self) -> None:
        sections = parse_sections(
            """## 实习经历
### 网易雷火
- 从零搭建 Web GM 工具
"""
        )

        result = retrieve("他在雷火做了什么？", sections)

        self.assertIn("网易雷火", result[0])

    def test_retrieve_normalizes_gmtool_alias(self) -> None:
        sections = parse_sections("## 项目\n### GM 工具\n- 面向 QA 的 Web 工具")

        result = retrieve("介绍一下 GMTool", sections)

        self.assertIn("GM 工具", result[0])

    def test_retrieve_ignores_generic_chinese_question_terms(self) -> None:
        sections = parse_sections("## GameJam 经历\n- 使用 Unity 完成玩法原型")

        self.assertEqual(retrieve("平时使用什么手机？", sections), [])

    def test_retrieve_returns_empty_for_unrelated_question(self) -> None:
        sections = parse_sections("## 教育背景\n- 浙江工业大学 计算机科学与技术")

        self.assertEqual(retrieve("最喜欢的电影是什么", sections), [])


if __name__ == "__main__":
    unittest.main()